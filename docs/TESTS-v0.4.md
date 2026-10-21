# Tests exécutés — version 0.4

20 octobre 2026, Chromium de l’environnement de développement.

## Sans navigateur

- `npm test` : 624 identifiants uniques, 104 QCM dans chaque rubrique, 42/42/20 par difficulté et rubrique, quatre choix distincts et réponse incluse, champs de provenance/licence présents, absence de balises et de caractères parasites.
- 27 statuts de contrôle avec date, URL et périmètre explicite ; les trois identifiants retirés sont absents du corpus joué.
- 216 combinaisons position/dé ; six cases médaillon ; validation des sauvegardes et mélange.
- `python scripts/enrich_v04.py` : reconstruction depuis la base figée ; absence de doublons exacts sur texte normalisé ; réponses/choix validés ; effectifs équilibrés.
- Recherche de similarité entre nouveaux QCM et archive ayant la même réponse : aucun signalement au seuil 0,55. Ce contrôle ne garantit pas l’absence de tout doublon sémantique.
- Recomposition répétée : fichiers JSON/CSV/manifeste et journal documentaire identiques octet pour octet.

## Navigateur

- Accueil : effectifs et niveaux affichés à jour, lancement de l’entraînement solo.
- Les 27 nouveaux QCM testés successivement via sauvegardes de test : reprise, texte de question exact, bonne réponse acceptée, explication affichée, repère documentaire daté présent, URL de référence exacte, poursuite possible.
- Une question héritée : correction fonctionnelle, sans repère de vérification indu.
- Sauvegarde sur une question retirée : retour au tirage, conservation des cinq bonnes réponses déjà enregistrées dans la sauvegarde de test.
- Crédits : total actuel et réserve sur la vérification ; panneau fermé normalement.
- Largeur 390 px : absence de débordement horizontal du plateau d’entraînement.
- Aucune exception JavaScript de page pendant ces tests. Un 404 initial du favicon a été corrigé par un SVG local.

Le programme de contrôle navigateur utilisé pendant cette livraison reste dans l’espace de travail, `test-v04-browser.js` ; il n’ajoute aucune dépendance à l’application distribuée.

## Limites

Ces tests vérifient le fonctionnement et la cohérence des données, pas la vérité des 597 questions héritées. Les tests détaillés multijoueur, finale et remise en jeu des médaillons de la livraison précédente sont décrits dans `TESTS-v0.3.md` ; ils sont historiques, pas présentés comme tous rejoués pendant cette mise à jour de données. Les règles n’ont pas été modifiées ici.
