import pathlib,json,collections,hashlib,difflib,re,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]
candidates=json.loads((ROOT/'sources/candidates.json').read_text())
# Fichier de décisions éditoriales, traçable, modifiable sans retoucher les sources.
decisions=json.loads((ROOT/'sources/editorial.json').read_text()) if (ROOT/'sources/editorial.json').exists() else {'exclude':{},'corrections':{}}
def normalized(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s.casefold()).encode('ascii','ignore').decode())
unique=[];near_duplicates=[]
for q in candidates:
 if q['id'] in decisions['exclude']:continue
 duplicate=next((p for p in unique if normalized(p['answer'])==normalized(q['answer']) and difflib.SequenceMatcher(None,normalized(p['question']),normalized(q['question'])).ratio()>.58),None)
 if duplicate:near_duplicates.append({'id':q['id'],'similarTo':duplicate['id']})
 else:unique.append(q)
candidates=unique
(ROOT/'sources/near-duplicates.json').write_text(json.dumps(near_duplicates,ensure_ascii=False,indent=2),encoding='utf-8')
selected=[]
for cat in ['geography','entertainment','history','arts','science','sports']:
 for level,target in [('facile',40),('moyen',40),('difficile',20)]:
  groups=collections.defaultdict(list)
  for q in candidates:
   if q['category']!=cat or q['difficulty']!=level or q['id'] in decisions['exclude']:continue
   q=dict(q)
   if q['id'] in decisions['corrections']:
    q.update(decisions['corrections'][q['id']]);q['changes']+=' Correction éditoriale documentée dans sources/editorial.json.'
   groups[q['theme']].append(q)
  for rows in groups.values():rows.sort(key=lambda q:hashlib.sha256(q['id'].encode()).hexdigest())
  out=[]
  while len(out)<target:
   for key in sorted(groups):
    if groups[key]:out.append(groups[key].pop(0))
    if len(out)==target:break
   if not any(groups.values()) and len(out)<target:raise ValueError(f'Stock insuffisant : {cat} {level}')
  selected+=out
(ROOT/'data/questions.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2),encoding='utf-8')
for cat in ['geography','entertainment','history','arts','science','sports']:
 lines=[f"{q['id']} [{q['difficulty']}] {q['question']} => {q['answer']}" for q in selected if q['category']==cat]
 (ROOT/'sources'/f'review-{cat}.txt').write_text('\n'.join(lines),encoding='utf-8')
print('Sélection :',len(selected))
