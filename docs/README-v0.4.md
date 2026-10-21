> Historique de la version 0.4. Pour l’interface actuelle, lire le README à la racine.

# Le Salon des Savoirs — version pilote 0.4

Jeu de culture générale en français, HTML/CSS/JavaScript, sans framework ni dépendance à installer pour jouer. Solo et multijoueur local, six rubriques, plateau multicolore, médaillons, QCM et sauvegarde locale.

## Nouveautés

- **624 questions**, 104 par rubrique : 597 questions conservées de l’archive et 27 nouvelles formulations avec contrôle documentaire.
- Par rubrique : **42 faciles, 42 moyennes et 20 difficiles**.
- Choix du niveau avant la partie ; filtre actif sur le plateau, en entraînement et en finale.
- Anecdote, auteur, source d’archive et licence affichés après chaque réponse.
- Bouton pour marquer une question à vérifier ; export JSON des signalements depuis les crédits.
- Corpus JSON, copie CSV consultable dans Excel/LibreOffice, sources brutes et bilan qualité fournis.

**Attention :** seuls les 27 QCM du nouveau lot ont un contrôle documentaire de la réponse et de l’explication ; cela ne certifie pas les 597 questions héritées. Contrôles de format, exclusions et corrections éditoriales ne constituent pas une vérification factuelle indépendante exhaustive. Lire `docs/QUALITE-DONNEES.md`. Les niveaux hérités ou attribués au nouveau lot ne sont pas statistiquement calibrés.

## Démarrer sous Windows

1. Extraire entièrement le ZIP dans un nouveau dossier.
2. Arrêter l’ancien serveur s’il tourne encore : `Ctrl+C` dans sa fenêtre.
3. Double-cliquer sur **DEMARRER-WINDOWS.bat** dans le nouveau dossier.
4. Garder cette fenêtre ouverte et ouvrir **http://localhost:3000**.
5. Faire **Ctrl+F5** si l’ancien contenu reste affiché.

Ou, depuis un terminal ouvert dans le dossier contenant `package.json` :

```sh
npm start
```

Aucun `npm install` nécessaire. Node 20 ou supérieur recommandé. Si PowerShell bloque `npm.ps1`, utiliser `npm.cmd start` ou `node server.cjs` sans modifier les réglages de sécurité de Windows.

**Ne pas ouvrir index.html par double-clic** : les modules JavaScript et le JSON doivent être servis par HTTP. Si le port 3000 est pris, dans l’invite de commandes : `set PORT=3001 && node server.cjs`, puis ouvrir http://localhost:3001.

## Sublime Text et fichiers

Ouvrir le dossier entier avec `Project > Add Folder to Project…`.

| Fichier | Rôle |
|---|---|
| `index.html` | Structure des écrans et réglages |
| `css/styles.css` | Présentation, couleurs et animations |
| `js/engine.js` | Catégories, déplacements, structure/validation des parties |
| `js/app.js` | Interface, plateau SVG, QCM, dé, sons, sauvegarde et signalements |
| `data/questions.json` | Corpus joué |
| `data/questions.csv` | Même corpus pour consultation dans un tableur |
| `data/manifest.json` | Effectifs et provenance de l’édition |
| `CREDITS.md` | Auteurs, licences et liste des quiz d’origine |
| `docs/QUALITE-DONNEES.md` | Bilan des contrôles et limites |
| `sources/` | Sources d’archive, décisions et journaux de préparation |
| `scripts/` | Outils facultatifs de préparation des données et tests |

Enregistrer, puis actualiser le navigateur. Pas de compilation. Les fichiers sont formatés pour faciliter l’édition.

## Règles de cette version

- Plateau : 1 à 6 joueurs ou équipes, noms personnalisables.
- Entraînement : solo, rubrique au choix ou mélange des six.
- Chronomètre désactivé, 20 ou 40 secondes ; le temps continue si l’onglet est quitté.
- Déplacements sur l’anneau de 36 cases ; choisir l’une des deux destinations illuminées ou les boutons correspondants.
- Bonne réponse : rejouer. Erreur : joueur suivant ; en solo, continuer seul.
- Une bonne réponse sur une case ◆ rapporte le médaillon correspondant. Sur une case ordinaire, pas de médaillon.
- Six médaillons : bouton « Entrer au salon », puis une question finale dans une rubrique aléatoire, au niveau choisi.
- **Règles simplifiées** : les rayons du plateau sont décoratifs ; pas de raccourci jouable, ni déplacement obligatoire au centre.
- En entraînement, chaque bonne réponse rapporte le médaillon de la rubrique s’il n’a pas déjà été obtenu. On continue librement, sans écran de victoire.
- Pas de répétition dans un couple rubrique/niveau avant épuisement de son paquet. Un message signale le remélange.
- Sons facultatifs synthétisés par Web Audio. Confettis désactivés si la réduction des animations est demandée au système.

## Sauvegardes et mise à jour

Une seule partie est conservée dans `localStorage` pour cette adresse de site et ce navigateur. Les prénoms, scores, médaillons, questions en cours et échéances sont sauvegardés. Commencer une nouvelle partie remplace l’ancienne après confirmation.

Les anciennes parties restent compatibles à la même adresse. Si une ancienne question de démonstration n’existe plus, la progression est conservée et la partie reprend avant un nouveau tirage, avec un avertissement. Les médaillons déjà obtenus ne sont pas retirés. Une ancienne partie utilise par défaut tous les niveaux.

Changer d’adresse, de port ou de navigateur change l’espace de sauvegarde. Le mode privé et les réglages de confidentialité peuvent empêcher sa conservation.

## Signaler une question

Après la correction, cliquer sur « Marquer cette question à vérifier ». Puis ouvrir les crédits et « Exporter mes questions signalées (JSON) ». Transmettre ce fichier pour examiner les erreurs. Il contient l’identifiant, le texte, la réponse, la source et la date du signalement. Aucun envoi automatique, ni compte distant.

## Droits sur les questions

**OpenQuizzDB — Fourni par Openquizzdb.org.** Auteurs : Philippe Bresoux, Catherine De Smeytere et Edouard Swit. Archive et nouvelles formulations distribuées sous **CC BY-SA 4.0**. Les 27 nouveaux QCM ont été rédigés pour le projet ; les sites institutionnels cités sont des références factuelles et non les auteurs ou concédants de ces formulations. Aucune image ni notice intégrale de ces sites n’est reproduite. Sources : copie publique Zeuh/OpenQuizzDB, commit figé `a16819964d171e40e6652368fc562f3bd27d0c5b` du 12 février 2022. Les numéros de quiz de cette archive ne doivent pas être assimilés aux numéros du catalogue actuel.

L’attribution, les liens de licence et les modifications doivent être conservés lors d’une redistribution des données ; les adaptations du corpus respectent le partage à l’identique. Voir `CREDITS.md` et la licence jointe. Ce jeu n’utilise pas les cartes officielles et n’est pas affilié à Hasbro ou Trivial Pursuit.

## Tests

Depuis le dossier du projet :

```sh
npm test
```

Contrôles sans dépendance : 624 questions, six catégories, distribution 42/42/20 par catégorie, choix distincts, réponse incluse, provenance, licence, absence de balises et caractères d’encodage parasites, déplacements et validation des sauvegardes.

Les tests Chromium automatisés ne remplacent pas des essais sur le PC Windows cible. Edge et Firefox restent à vérifier manuellement.

## Préparation des données (facultatif)

Python 3 et le module `requests` sont nécessaires uniquement pour refaire l’import. Les scripts ne s’exécutent ni dans le navigateur, ni sur GitHub Pages. Voir `docs/QUALITE-DONNEES.md` pour les étapes et les limites de la reproduction.

## Publication sur GitHub Pages

1. Créer un dépôt, par exemple `salon-des-savoirs`.
2. Déposer son contenu à la racine : `index.html`, `css`, `js`, `data`, etc., avec les crédits et licences. Ne pas déposer seulement le ZIP.
3. Dans `Settings > Pages`, choisir `Deploy from a branch`, branche `main`, dossier `/ (root)`, puis enregistrer.
4. Utiliser le lien affiché après déploiement.

Les chemins sont relatifs pour fonctionner sous `/salon-des-savoirs/`. Aucune clé API et aucun serveur Node ne sont nécessaires sur l’hébergement. `.nojekyll` évite un traitement inutile. Le navigateur n’a besoin d’aucune ressource tierce pour jouer ; les liens de sources restent facultatifs.

Les réponses sont livrées au navigateur et restent inspectables : pas de protection anti-triche forte. Pas de multijoueur distant ni de mode hors connexion installable à ce stade.

## Suite du projet

Retour des essais, vérification indépendante progressive du corpus, correction des signalements, diversification des thèmes et ajustements du rythme des parties.


## Mise à jour qualité 0.4

- Gain net de 24 questions : 27 ajouts rédigés pour le projet, trois retraits prudents.
- Répartition par rubrique inchangée dans son équilibre : 104 questions, dont 42 faciles, 42 moyennes et 20 difficiles.
- Les 27 nouveaux QCM ont une référence et une date de contrôle de la réponse et de l’explication, affichées après correction.
- Ce lot porte sur des capitales, des sites géographiques, les Oscars 2025, les droits humains, Apollo 11, la peinture, les unités SI et Paris 2024. Les références et limites d’accès sont détaillées dans `docs/VERIFICATION-v0.4.md`.
- Pas de vérification exhaustive des 597 questions anciennes. Aucun label global « entièrement vérifié ».
- Les trois retraits correspondent à une recommandation générale magnésium/stress, une formulation sur Tesla et le radar, et un récit sur Clark Gable recherché par Hitler. Ce retrait n’est pas une réfutation : ces formulations ne disposaient pas d’un appui suffisamment précis dans le projet.

### Recomposer exactement la version 0.4

```sh
python scripts/enrich_v04.py
npm test
```

Ce script utilise seulement la bibliothèque standard Python, la base 0.3 figée, les ajouts et les retraits dans `sources/v04/` ; aucune connexion n’est nécessaire. Il régénère JSON, CSV, manifeste, listes de relecture et journal documentaire. Les anciens scripts d’import/sélection sont conservés pour historique : ils ne produisent que la base 0.3 ; ne pas les lancer seuls pour reconstruire la version actuelle.

Les sauvegardes restent compatibles. Si une question en cours fait partie des trois retirées, un message l’indique et la partie reprend avant un nouveau tirage, sans retirer les points déjà acquis.
