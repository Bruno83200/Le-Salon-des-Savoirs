# Tests exécutés — interface 0.5 / corpus 0.4

21 octobre 2026. Tests automatisés Chromium headless, plus inspection des captures d’écran. Aucun test natif sur un PC Windows réel n’est revendiqué : le lancement Windows conserve le fichier BAT et le serveur Node précédents.

## Contrôles de données et moteur

`npm test` réussi : 624 QCM, identifiants uniques, 104 par rubrique, répartition 42/42/20, quatre choix distincts, réponse incluse, provenance/licence, 27 statuts documentaires avec date et portée, absence des trois questions retirées, 216 déplacements, six cases médaillon, validation des sauvegardes.

Le corpus est identique à la version 0.4. Aucune nouvelle vérification globale des 597 questions héritées n’est revendiquée.

## Parcours principal — `test-v05.cjs`

- Accueil, accès aux joueurs, choix de quatre participants, saisie d’un prénom accentué et changement d’avatar sans perte du prénom.
- Lancement du plateau et présence des quatre joueurs.
- Dé animé, valeur 1–6, deux destinations proposées et deux cases accessibles.
- Déplacement par bouton, puis par focus clavier sur une case SVG et Entrée.
- Question à quatre réponses, rechargement en cours de question sans changement du QCM.
- Bonne réponse : score augmenté une seule fois, correction, rechargement du résultat sans recompter, même joueur après continuation.
- Mauvaise réponse : bonne proposition indiquée, signalement enregistré, passage au joueur suivant.
- Scores de quatre joueurs, règles, options, désactivation des animations mémorisée.
- Annulation de la confirmation de nouvelle partie : progression conservée.
- Finale sur état préparé avec les six médaillons : question finale, bonne réponse, podium, état de victoire et historique. Rechargement sans doublon d’historique.
- Nouveau défi d’entraînement : une seule carte joueur, niveau facile, rubrique Sciences et Nature, chrono 20 secondes et attribution d’un médaillon.
- Reprise d’une question au délai expiré : correction automatique non réussie.
- Export JSON d’un signalement : téléchargement effectivement déclenché.
- Accueil, joueurs, plateau, question, résultat, scores, règles, options et crédits en largeur 390 px : pas de débordement horizontal.

## Parcours complémentaires — `test-v05-extra.cjs`

- Défi d’entraînement joué de bout en bout : choix successif des six rubriques, six bonnes réponses, six médaillons, bouton de fin et victoire. Aucun médaillon injecté pour ce parcours.
- Les 27 nouveaux QCM repris via états de test : question, réponse acceptée, repère documentaire présent et URL de référence exacte dans la nouvelle interface.
- Ancienne sauvegarde dont la question est retirée : reprise au tirage et conservation des six bonnes réponses existantes.
- Six participants : six fiches sur le plateau ; absence de débordement aux largeurs 320, 390, 768 et 1366 px.
- Simulation d’une publication dans `/salon/index.html#accueil` par réacheminement des requêtes du navigateur : chargement relatif de HTML/CSS/JS/JSON et reprise du plateau réussis. Ce n’est pas une publication réelle sur GitHub Pages.
- Aucune exception JavaScript de page dans les deux suites.

## Reproduire les tests navigateur (facultatif)

Les suites sont conservées dans `scripts/test-v05.cjs` et `scripts/test-v05-extra.cjs`. Elles demandent Playwright/Chromium uniquement pour le développement, pas pour jouer. Installer Playwright dans un environnement de test, puis lancer le serveur du projet sur le port 3000 et exécuter les suites. Elles utilisent des contextes navigateur isolés et des sauvegardes de test ; elles ne modifient pas la base de questions.

Les captures sous l’espace de travail de la livraison ont permis de relire l’accueil, la configuration des joueurs, le plateau, les questions, les résultats et les scores sur ordinateur, ainsi que les écrans mobiles. Les tests n’incluent pas un audit complet d’accessibilité ni tous les navigateurs.
