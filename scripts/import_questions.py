"""Import reproductible OpenQuizzDB : sources officielles conservées, aucun eval.
Python 3 + requests (uniquement pour préparer les données, inutile pour jouer).
"""
import pathlib,requests,json,re,html,concurrent.futures,hashlib,unicodedata,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCES=ROOT/'sources/openquizzdb'
COMMIT='a16819964d171e40e6652368fc562f3bd27d0c5b'
PLAN={
'geography':[115,174,14,104,105,109,130,135,61,82,251],
'entertainment':[15,16,25,39,159,163,177,194,214,250,256,92],
'history':[8,120,127,160,183,188,70,98],
'arts':[69,86,128,139,140,87,3,124],
'science':[10,12,145,151,184,196,199,206,224,237,48,65,71,97],
'sports':[23,26,60,138,144,153,185,191,212,35,262,383]}
LIC='https://creativecommons.org/licenses/by-sa/4.0/'
def fetch(i):
 f=SOURCES/f'openquizzdb_{i}.json'
 url=f'https://raw.githubusercontent.com/Zeuh/OpenQuizzDB/{COMMIT}/data/openquizzdb_{i}.json'
 # Retélécharger depuis le commit figé, sans dépendre de master.
 if not (SOURCES/f'openquizzdb_{i}.meta.json').exists():
  r=requests.get(url,timeout=40);r.raise_for_status();f.write_bytes(r.content)
 meta=dict(quizId=i,pageUrl=f'https://github.com/Zeuh/OpenQuizzDB/blob/{COMMIT}/data/openquizzdb_{i}.json',downloadUrl=url,retrieved='2026-10-19',sha256=hashlib.sha256(f.read_bytes()).hexdigest())
 (SOURCES/f'openquizzdb_{i}.meta.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
 return meta

def read_source(i):
 text=(SOURCES/f'openquizzdb_{i}.json').read_text(encoding='utf-8-sig')
 text=re.sub(r'("difficulté"\s*:\s*)(\d+)\s*/\s*(\d+)',r'\1"\2 / \3"',text)
 return json.loads(text)

def clean(s):
 s=html.unescape(unicodedata.normalize('NFC',str(s)))
 s=''.join(bytes([ord(c)]).decode('cp1252',errors='replace') if 0x80<=ord(c)<=0x9f else c for c in s)
 s=re.sub(r'<sup>2</sup>','²',s,flags=re.I);s=re.sub(r'<sup>3</sup>','³',s,flags=re.I)
 s=re.sub(r'<[^>]*>','',s)
 return re.sub(r'\s+',' ',s).strip()
def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s.casefold()).encode('ascii','ignore').decode())
def build():
 ids=[i for v in PLAN.values() for i in v]
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:metas=list(ex.map(fetch,ids))
 print('Téléchargés :',len(metas))
 candidates=[];rejected=[];seen={}
 # Exclure les formulations temporelles et superlatifs à vérifier plutôt que les accepter aveuglément.
 flags=re.compile(r"actuellement|aujourd.hui|à ce jour|de nos jours|depuis peu|récemment|en quelle année.*prochain|record|le plus|la plus|les plus|premier|première|dernier|dernière|combien|unique|seul|seule",re.I)
 for cat,qs in PLAN.items():
  for i in qs:
   d=read_source(i);meta=json.loads((SOURCES/f'openquizzdb_{i}.meta.json').read_text());levels=d['quizz'].get('fr',d['quizz'])
   if isinstance(levels,list):levels={k:v for group in levels for k,v in group.items()}
   for level,rows in levels.items():
    if not isinstance(rows,list):continue
    for row in rows:
     qid=f'oqdb-{i}-{row["id"]}';text=clean(row.get('question',''));choices=list(map(clean,row.get('propositions',[])));answer=clean(row.get('réponse',''));exp=clean(row.get('anecdote',''))
     reason=None
     if len(choices)!=4 or len(set(map(norm,choices)))!=4 or answer not in choices or not text:reason='structure'
     elif flags.search(text):reason='formulation à vérifier (temps, record, superlatif, décompte)'
     elif norm(text) in seen:reason='doublon exact normalisé'
     if reason:rejected.append(dict(id=qid,reason=reason,question=text));continue
     seen[norm(text)]=qid
     candidates.append(dict(id=qid,category=cat,question=text,choices=choices,answer=answer,explanation=exp,difficulty={'débutant':'facile','confirmé':'moyen','expert':'difficile'}[level],originalDifficulty=level,theme=clean(d.get('thème','')),author=clean(d.get('rédacteur','OpenQuizzDB')),source='OpenQuizzDB',sourceUrl=meta['pageUrl'],downloadUrl=meta['downloadUrl'],license='CC BY-SA 4.0',licenseUrl=LIC,changes='Sélection, classement dans six rubriques, normalisation HTML/espaces ; voir éventuelles corrections éditoriales.',reviewStatus='structure-checked',factCheckStatus='not-independently-verified',retrieved=meta['retrieved']))
 (ROOT/'sources/candidates.json').write_text(json.dumps(candidates,ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'sources/rejected.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2),encoding='utf-8')
 for cat in PLAN:
  print(cat,collections.Counter(q['difficulty'] for q in candidates if q['category']==cat))
if __name__=='__main__':build()
