"""Recompose la v0.4 depuis la base figée v0.3 et le lot documenté.
Python standard uniquement, aucune connexion nécessaire.
"""
import pathlib,json,collections,csv,re,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'sources/v04'
def normalized(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s.casefold()).encode('ascii','ignore').decode())
def build():
 baseline=json.loads((BASE/'baseline-v03.json').read_text())
 additions=json.loads((BASE/'additions.json').read_text())
 retired=json.loads((BASE/'retired.json').read_text());ids={x['record']['id'] for x in retired}
 questions=[q for q in baseline if q['id'] not in ids]+additions
 assert len(questions)==624
 assert len(set(q['id'] for q in questions))==624
 assert len(set(normalized(q['question']) for q in questions))==624
 for cat in {q['category'] for q in questions}:
  rows=[q for q in questions if q['category']==cat]
  assert len(rows)==104
  assert collections.Counter(q['difficulty'] for q in rows)=={'facile':42,'moyen':42,'difficile':20}
 for q in questions:
  assert len(q['choices'])==4 and len(set(normalized(x) for x in q['choices']))==4 and q['answer'] in q['choices']
 (ROOT/'data/questions.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2),encoding='utf-8')
 fields=['id','category','difficulty','question','answer','A','B','C','D','explanation','theme','author','source','sourceUrl','license','changes','factCheckStatus','verifiedAt','verificationScope']
 with (ROOT/'data/questions.csv').open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
  for q in questions:w.writerow({**{k:q.get(k,'') for k in fields if k not in 'ABCD'},**dict(zip('ABCD',q['choices']))})
 manifest=dict(version='0.4.0',generated='2026-10-20',total=len(questions),byCategory=dict(collections.Counter(q['category'] for q in questions)),byDifficulty=dict(collections.Counter(q['difficulty'] for q in questions)),referenceChecked=len(additions),archiveNotIndependentlyVerified=len(questions)-len(additions),newAuthoredQuestions=len(additions),retiredArchiveQuestions=len(ids),netAddition=len(questions)-len(baseline),archiveCommit='a16819964d171e40e6652368fc562f3bd27d0c5b',license='CC BY-SA 4.0',verificationScope='Les 27 questions du lot v04 seulement, réponses et explications contrôlées contre les références indiquées. Pas de certification globale du corpus.')
 (ROOT/'data/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 for cat in manifest['byCategory']:
  text='\n'.join(f"{q['id']} [{q['difficulty']}] {q['question']} => {q['answer']}" for q in questions if q['category']==cat)
  (ROOT/'sources'/f'review-{cat}.txt').write_text(text,encoding='utf-8')
 report='''# Vérification documentaire du lot 0.4\n\nDate : 20 octobre 2026.\n\n27 QCM et explications rédigés pour le projet et confrontés aux références ci-dessous. Chaque question, ses quatre choix et la précision de date ont été relus. Cette vérification se limite au fait posé et à l’explication courte ; elle ne certifie ni l’ensemble du corpus ni l’exactitude de tous les autres passages des sites consultés.\n\nLes références institutionnelles servent de preuves factuelles, pas de bases dont la licence aurait été copiée : aucun texte de notice, photographie ou article entier n’est repris dans le lot. Les nouvelles formulations sont proposées sous CC BY-SA 4.0, comme le corpus livré.\n\nPour les Oscars 2025 : palmarès de l’Academy consulté via son résultat indexé ; l’ouverture directe de la page a échoué. Les quatre lauréats retenus sont explicitement indiqués dans cet extrait officiel. Cette limite d’accès est conservée, plutôt que prétendre avoir archivé la page intégrale.\n\nLes dates « Oscars 2025 » et « Paris 2024 » évitent de transformer un résultat historique en record ou palmarès actuel. Les niveaux des nouvelles questions sont des choix éditoriaux, non des mesures de difficulté étalonnées.\n\n## Questions et preuves\n\n'''
 for i,q in enumerate(additions,1):
  report+=f"### {q['id']}\n\n{q['question']}\n\n**Réponse : {q['answer']}.** {q['explanation']}\n\nRéférence : [{i}]({q['sourceUrl']}) — {q['source']}. Consultée le {q['verifiedAt']}.\n\n"
 report+='## Retraits\n\n'
 for item in retired:report+=f"- **{item['record']['id']}** — {item['reason']}\n"
 (ROOT/'docs/VERIFICATION-v0.4.md').write_text(report,encoding='utf-8')
 print(json.dumps(manifest,ensure_ascii=False,indent=2))
if __name__=='__main__':build()
