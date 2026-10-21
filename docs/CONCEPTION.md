> Mise à jour 0.3 — 19 octobre 2026 : document initial conservé ci-dessous comme historique. Le corpus actuel contient 600 questions OpenQuizzDB issues d’une archive figée, avec niveaux et crédits. Pour l’état livré et ses limites, consulter README.md et QUALITE-DONNEES.md.

# Projet — Le Salon des Savoirs

Nom de travail, modifiable. Jeu original de culture générale inspiré des jeux de plateau, sans logo ni cartes officielles Trivial Pursuit.

## Choix validés
- PC Windows, navigateur, HTML/CSS/JavaScript.
- Hébergement statique GitHub Pages.
- Solo et multijoueur local.
- QCM à quatre propositions.
- Direction artistique rétro, chaleureuse, jeu de société.

## Les six catégories exclusives
| ID | Couleur | Catégorie |
|---|---|---|
| geography | Bleu | Géographie |
| entertainment | Rose | Divertissement : spectacle, cinéma, musique, télévision |
| history | Jaune | Histoire |
| arts | Violet | Art et Littérature |
| science | Vert | Sciences et Nature |
| sports | Orange | Sports et Loisirs |

Les couleurs sont toujours accompagnées d'un nom et d'un symbole pour l'accessibilité.

## Règles proposées, non encore validées
### Partie plateau
2 à 6 joueurs ou équipes sur le même ordinateur. Plateau circulaire original, six cases médaillon. Un dé propose les déplacements légaux, le joueur choisit sa destination. Une bonne réponse sur une case médaillon permet de gagner le médaillon correspondant. Bonne réponse : on rejoue ; mauvaise réponse : joueur suivant. Après les six médaillons, rejoindre le centre et répondre à une finale. Les modalités de la finale seront précisées avant implémentation. Prévoir un mode rapide sans déplacement.
### Solo
Entraînement : choix des rubriques et du niveau, correction et anecdote. Défi : obtenir les six médaillons, avec bilan de précision par rubrique. Pas de classement en ligne.

## Expérience visuelle
Papier crème, bois sombre, titres de caractère, cartes à coins arrondis, pions colorés. Interface française. Animations brèves et désactivables. Sons facultatifs et réglage du volume. Aucun fichier graphique ou sonore nécessaire pour le prototype : SVG et CSS locaux suffisent. Les éléments artistiques fournis ultérieurement devront avoir des droits d'utilisation adaptés.

## Données : décision provisoire
OpenQuizzDB est la source prioritaire : QCM existants avec réponse, trois niveaux et anecdotes. Préférer les téléchargements officiels à un miroir ancien. Préserver fournisseur, rédacteur, URL et licence, et indiquer les modifications.

Miroir examiné le 18 octobre 2026 : https://github.com/Zeuh/OpenQuizzDB
- 290 fichiers à extension .json repérés dans l'arborescence publique ; ce n'est pas un décompte des questions françaises valides.
- Miroir ancien : dernière modification affichée au 12 février 2022.
- Premier fichier examiné : quatre propositions, réponse, anecdote et niveaux débutant/confirmé/expert.
- Attention : ce fichier contient une expression `2 / 5` dans un champ de difficulté ; malgré son extension, il ne constitue pas un JSON strict valide. Prévoir un import contrôlé, sans eval.
- Aucun corpus complet importé ou validé à cette étape.

Sources secondaires à auditer : OpenTriviaQA-FR et romaindetroyat/trivialpursuit. Ne pas les intégrer avant vérification de la licence des données, du format, de la provenance et de la qualité. Un dépôt public ne vaut pas autorisation de réutilisation.

## Chaîne de préparation des questions
1. Télécharger et conserver les sources et licences.
2. Normaliser le texte et les quatre propositions.
3. Vérifier une réponse correcte unique appartenant aux propositions, quatre propositions distinctes et absence de champs vides.
4. Dédupliquer les questions, puis examiner les quasi-doublons.
5. Affecter une seule des six catégories ; les questions ambiguës passent en revue manuelle.
6. Écarter ou dater les records et informations périssables ; examiner les traductions et ambiguïtés.
7. Garder auteur, provenance, licence, niveau d'origine, niveau harmonisé et statut de validation.
8. Exporter six fichiers JSON locaux, et un rapport indiquant les effectifs retenus et rejetés.

Objectif initial : 100 questions relues par rubrique, puis extension progressive. Cet objectif n'est pas une quantité déjà disponible ou garantie.

## Architecture cible
Application statique, sans framework imposé ni dépendance CDN.
- index.html
- css/styles.css
- js/app.js, game.js, board.js, questions.js, storage.js, audio.js
- data/questions/{geography,entertainment,history,arts,science,sports}.json
- assets/images/, assets/audio/
- CREDITS.md, README.md et licences des données
- scripts/ pour les outils de préparation, non exécutés par le navigateur

Utiliser des chemins relatifs compatibles avec une URL GitHub Pages de type /nom-du-depot/. Aucun secret ou appel API nécessaire pendant une partie. Sauvegarde locale versionnée dans localStorage ; pas de synchronisation entre appareils. Les réponses livrées au navigateur restent inspectables : pas de protection anti-triche forte.

## Fonctionnalités de la première version
Configuration des noms et du nombre de joueurs, entraînement solo, plateau local, réponses mélangées, absence de répétition jusqu'à épuisement du stock, explication après réponse, sauvegarde/reprise, réglage du chronomètre, commande son, écran final et crédits.

## Étapes et validation
1. Prototype jouable avec petit corpus explicitement de démonstration.
2. Import pilote de vraies données, rapport qualité et attribution.
3. Plateau complet, règles, médaillons, finale et sauvegarde.
4. Intégration graphique et sonore.
5. Tests Edge/Chrome/Firefox, clavier, zoom, petits écrans, reprise de partie et données manquantes.
6. Livraison du dossier et d'une archive, puis guide de publication GitHub Pages. La publication sur le compte utilisateur nécessite son intervention ou un accès adapté ; aucun dépôt n'a encore été créé.
