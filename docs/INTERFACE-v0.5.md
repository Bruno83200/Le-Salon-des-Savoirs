# Interface 0.5 — repères de construction

## Écrans et état

La page HTML fournit l’en-tête, le pied de page, la zone d’écran et la confirmation de nouvelle partie. Le routeur de `js/app.js` choisit une seule fonction de rendu selon le fragment d’URL. Les phases de partie sont séparées des pages consultables : regarder les règles ou les scores ne crée ni réponse, ni déplacement.

Parcours du plateau :

```text
accueil → joueurs → plateau [roll]
                      ↓ lancer le dé
                   plateau [move]
                      ↓ choisir une destination légale
                   question [question]
                      ↓ réponse, passer ou délai écoulé
                   résultat [feedback]
                      ↓ continuer
                   plateau [roll] ou victoire [won]
```

Une redirection canonique reprend une question ou son résultat en cours lorsqu’on revient à la partie. Elle remplace le fragment d’URL au lieu d’empiler des redirections dans l’historique. Les compteurs ne sont modifiés que dans la fonction de réponse, protégée par la phase `question`. Recharger un résultat n’ajoute donc aucun point.

Le chrono mémorise une échéance absolue, pas un simple compte à rebours visuel. Le stockage local conserve le même format de partie que les versions précédentes, enrichi d’un identifiant de partie et d’un choix d’avatar facultatif.

## Graphismes

Plateau, avatars, collections et roues de médaillons sont des SVG générés localement. Les cases cliquables correspondent uniquement aux destinations légales calculées par le moteur. Des boutons de destination doublent les cibles du SVG pour le clavier et les petits écrans. Les six traits intérieurs servent de repères de catégorie, pas de chemins jouables.

Les couleurs des catégories sont celles demandées par l’utilisateur, même lorsqu’elles diffèrent de la maquette de référence. Les couleurs de joueur identifient les pions et les cartes ; elles sont indépendantes des six médaillons de catégorie.

## Points d’édition

- Fonctions `home`, `setup`, `game`, `questionScreen`, `feedback`, `scores`, `victory`, `rules`, `options`, `credits` : contenu des écrans.
- `avatar`, `board`, `wheel`, `wedges`, `die` : graphismes vectoriels et HTML de jeu.
- `ask`, `answer`, `next`, `roll`, `move`, `recordWin` : parcours interactif.
- `render`, `go`, `redirect` : navigation et reprise cohérente.
- `persist`, `read`, `store` : stockage local et avertissements.

Pas de dépendance de production, compilation, police distante ni image externe à configurer. Les suites navigateur facultatives sont documentées dans `TESTS-v0.5.md`.
