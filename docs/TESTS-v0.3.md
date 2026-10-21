# Tests effectués — version 0.3

Environnement : Node 20 et Chromium automatisé sous Linux, 19 octobre 2026.

## Tests de données et moteur (`npm test`)

- 600 identifiants uniques ; 100 questions par catégorie.
- Pour chacune : 40 faciles, 40 moyennes, 20 difficiles.
- Quatre propositions distinctes ; réponse incluse ; explication, auteur, source et licence présents.
- Absence de balises HTML et de caractères de contrôle hérités de l’encodage dans les textes joués.
- 216 combinaisons position/lancer, destinations valides, six cases médaillon de catégories distinctes.
- Structure et validation des sauvegardes.

## Parcours Chromium

- Nouvelle partie plateau, dé, déplacement et ouverture du QCM.
- Réponse correcte : score incrémenté, même joueur ; réponse incorrecte : passage de main.
- Rechargement après une réponse : correction restaurée sans double attribution du score.
- Finale gagnée avec un état de test préparé possédant six médaillons.
- Entraînement : catégorie choisie, remplissage du médaillon, badge et confettis ; deuxième bonne réponse de la même catégorie sans doublon de médaillon.
- Affichage mobile à 390 px sans débordement horizontal.
- Mode difficile / histoire : 20 questions distinctes, puis remélange du paquet au 21e tirage.
- Affichage de l’auteur et de la licence après réponse.
- Signalement et export JSON : identifiant transmis correctement.
- Rechargement d’une question du nouveau corpus : même question et niveau conservés.
- Migration d’une sauvegarde avec question de démonstration supprimée : scores conservés, niveau « tous », nouveau tirage disponible.
- Chargement des ressources dans un sous-chemin simulé `/mon-jeu/`, comme une URL de dépôt GitHub Pages.
- Aucune erreur JavaScript non interceptée pendant les parcours.

## Limites

Ce sont des tests logiciels, pas une validation factuelle des réponses. Les essais réels sous Windows dans Edge et Firefox, la publication sur le compte GitHub de l’utilisateur et les longues parties humaines restent à réaliser.
