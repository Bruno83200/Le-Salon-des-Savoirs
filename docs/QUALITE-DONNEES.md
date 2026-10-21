# Bilan qualité courant — version 0.4

20 octobre 2026.

## Effectifs

**624 questions**, 104 par rubrique, chacune avec 42 faciles, 42 moyennes et 20 difficiles.

- 597 questions conservées de l’archive OpenQuizzDB : contrôle de structure et sélection éditoriale antérieurs, **pas de vérification factuelle indépendante exhaustive**.
- 27 nouvelles formulations : réponse et explication courte contrôlées contre une référence indiquée, datées du 20 octobre 2026.
- Trois anciennes questions retirées faute d’un appui suffisamment précis : gain net de 24.

Le contrôle du nouveau lot est documentaire, principalement à partir d’une référence institutionnelle par question ; il n’est pas une certification multi-sources de l’ensemble du jeu. Les niveaux du nouveau lot sont attribués éditorialement.

## Traçabilité

Lire [le journal de vérification](VERIFICATION-v0.4.md) pour les 27 QCM, leurs références, les limites d’accès et les motifs des trois retraits.

Lire [le bilan de la base 0.3](QUALITE-DONNEES-v0.3.md) pour la préparation de l’archive. Ce document est historique : ses effectifs décrivent la version 0.3, pas le corpus actuel.

Les enregistrements retirés sont conservés dans `sources/v04/retired.json` et absents de `data/questions.json`. Aucun motif de retrait n’est présenté comme une réfutation scientifique ou historique.

## Droits et formulation

Les 27 QCM sont rédigés pour le projet à partir de faits ; aucune reprise de notices intégrales ou de photographies. Les organismes cités sont des références de contrôle, pas les auteurs du QCM. Les formulations du nouveau lot, comme le corpus adapté, sont distribuées sous CC BY-SA 4.0. Les crédits OpenQuizzDB des questions héritées restent conservés.

## Reproduction et tests

`python scripts/enrich_v04.py` recompose le corpus sans réseau ni paquet Python tiers. `npm test` contrôle les effectifs, champs, choix, réponses, licences, statuts documentaires, retraits et règles de déplacement. Il ne juge pas la vérité d’une réponse.

## Retours des joueurs

Le bouton de signalement après chaque réponse reste disponible pour toutes les questions. Les signalements sont conservés localement et exportables depuis les crédits. Ils ne sont pas envoyés automatiquement.
