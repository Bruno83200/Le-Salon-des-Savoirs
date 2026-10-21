> Document historique de la version 0.3 (600 questions). Les chemins de fichiers sont indiqués par rapport à la racine du projet. Pour la version courante, consulter le bilan qualité et les crédits actuels.

# Bilan qualité — corpus pilote 0.3

Date : 19 octobre 2026. Voir aussi `data/manifest.json` et `CREDITS.md`.

## Résultat

**600 questions françaises**, 100 dans chacune des six rubriques. Par rubrique : **40 faciles, 40 moyennes, 20 difficiles**. Total : 240 faciles, 240 moyennes et 120 difficiles. Les niveaux sont hérités de la source et ne sont pas statistiquement calibrés.

Origine : 65 quiz d’une archive OpenQuizzDB figée au commit `a16819964d171e40e6652368fc562f3bd27d0c5b` (12 février 2022), téléchargée le 19 octobre 2026. Ce sont des contenus tiers sous CC BY-SA 4.0, et non des questions officielles de Trivial Pursuit.

## Contrôles réalisés

- Extraction exclusive du français, prise en charge des formats historiques imbriqués.
- Lecture JSON stricte ; l’expression non JSON du seul champ métadonnée `difficulté` de certains anciens fichiers est transformée en chaîne avant lecture. Aucun `eval`. Les fichiers bruts ne sont pas modifiés.
- Nettoyage des espaces, entités HTML, balises, exposants et caractères hérités de Windows-1252.
- Quatre choix distincts, bonne réponse incluse, question et explication non vides, identifiants uniques.
- Filtre conservateur de formulations temporelles, records, superlatifs et décomptes à vérifier. Ce filtre peut retirer des questions pourtant correctes ; il n’est pas une preuve de fiabilité des autres.
- Doublons textuels normalisés écartés ; recherche prudente de formulations proches partageant une même réponse. Des doublons sémantiques peuvent subsister.
- Exclusions éditoriales de questions hors rubrique, imprécises ou manifestement problématiques ; corrections ciblées dans `sources/editorial.json`.
- Équilibrage déterministe par catégorie, niveau et thème, sans modifier silencieusement les fichiers sources.

## Chiffres de préparation

- 1950 questions sources examinées par l’import.
- 349 rejets automatiques (structure, formulation signalée, doublon textuel).
- 1601 candidats après ces filtres.
- 140 identifiants exclus dans les décisions éditoriales (certains motifs peuvent se recouper).
- 8 exclusions supplémentaires de formulations proches.
- 19 questions corrigées présentes dans la sélection finale.
- Sélection finale : 600 ; le reste reste en réserve, sans validation implicite.

## Ce qui n’est PAS garanti

**Il ne s’agit pas d’une vérification factuelle indépendante exhaustive de 600 réponses et de leurs anecdotes.** Le statut conservé dans les données est `factCheckStatus: not-independently-verified`. Les données sont anciennes ; des anecdotes, appellations ou conditions peuvent avoir évolué. Une lecture éditoriale et des contrôles de format ne remplacent pas le croisement de chaque affirmation avec une source récente.

Un bouton après chaque réponse permet de marquer une question à vérifier. Les signalements restent locaux ; depuis les crédits, le joueur peut télécharger le JSON et le transmettre. Aucun envoi automatique.

## Reproduction

Le jeu n’a aucune dépendance externe à l’exécution. Les scripts de préparation utilisent Python 3 et `requests` ; ils sont facultatifs.

```sh
python -m pip install requests
python scripts/import_questions.py
python scripts/select_questions.py
npm test
```

Le premier script utilise exclusivement des URLs du commit figé ; le second applique les décisions éditoriales et choisit le corpus. Les exports CSV/manifeste et ce rapport sont des livrables de cette version ; après modification du corpus, les mettre à jour également. Le test attend les effectifs de cette édition.

## Fichiers de contrôle

- `data/questions.json` : corpus joué.
- `data/questions.csv` : consultation dans un tableur (UTF-8 avec BOM).
- `sources/openquizzdb/` : sources archivées et métadonnées SHA-256.
- `sources/editorial.json` : exclusions et corrections éditoriales.
- `sources/rejected.json`, `sources/near-duplicates.json` : journaux de filtrage.
- `sources/review-*.txt` : listes question/réponse de la sélection par rubrique.

## Vérification logicielle

Tests moteur, données et parcours Chromium réussis ; détails dans `TESTS-v0.3.md`. Ces tests ne valident pas la vérité des réponses.
