# Maths · Première–Terminale STMG

Site pédagogique en français, en HTML/CSS/JavaScript statiques. Un même design et les mêmes moteurs pédagogiques, avec **deux parcours séparés**.

**[Ouvrir le site](https://parzival733.github.io/maths1-reSTMG/)**

| Niveau | Leçons | Exercices |
| --- | --- | --- |
| Première STMG | [Catalogue Première](https://parzival733.github.io/maths1-reSTMG/lecons.html) | [Séries Première](https://parzival733.github.io/maths1-reSTMG/exercices.html) |
| Terminale STMG | [Catalogue Terminale](https://parzival733.github.io/maths1-reSTMG/terminale/lecons.html) | [Séries Terminale](https://parzival733.github.io/maths1-reSTMG/terminale/exercices.html) |

Dépôt : [parzival733/maths1-reSTMG](https://github.com/parzival733/maths1-reSTMG).

## Programmes de référence

- **Première, depuis 2026–2027** : arrêté du 26 février 2026, BO n° 14 du 2 avril 2026, NOR [MENE2602918A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602918A).
- **Terminale, en 2026–2027** : programme de 2019, BO spécial n° 8 du 25 juillet 2019, [annexe sur Éduscol](https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf).
- **Terminale, à partir de 2027–2028** : arrêté du 26 février 2026, NOR [MENE2602921A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602921A). L'article 2 précise l'entrée en vigueur en septembre 2027.

`programme.html` documente le parcours Première ; `terminale/programme.html` explique la couverture de Terminale et le changement de programme. Le parcours Terminale s'appuie sur les notions communes aux deux textes, en conservant les rappels utiles à la cohorte issue de Première 2019. Les activités propres à d'autres séries technologiques ne sont pas ajoutées comme prérequis STMG.

Les leçons sont des rédactions pédagogiques originales, pas des documents rédigés ou certifiés par le ministère. Le découpage des chapitres est celui du site. Les banques ne prétendent pas couvrir toutes les formulations possibles d'un sujet ni remplacer le travail en classe.

## Contenu

### Première : contenu existant conservé

**16 leçons** : 11 chapitres, 4 repères mathématiques et 1 atelier Python/tableur séparé. **129 exercices** : 121 exercices de mathématiques en 15 séries et 8 exercices numériques. Les adresses des cours et exercices n'ont pas changé.

L'atelier reste présenté séparément du parcours de révision sans calculatrice. Ce choix d'interface ne signifie pas que l'algorithmique est facultative dans le programme officiel. Les 13 programmes déplacés des autres cours restent dans sa bibliothèque.

### Terminale : un parcours parallèle

**8 chapitres + 1 repère transversal**, chacun relié à une série de **6 exercices**, soit **54 modèles** :

1. Suites, moyennes et sommes.
2. Fonctions exponentielles et taux moyen.
3. Logarithme décimal, équations et seuils.
4. Fonction inverse, dérivation et optimisation.
5. Ajustements statistiques et changements de variable.
6. Conditionnement et probabilités totales.
7. Loi binomiale et triangle de Pascal.
8. Espérance et simulation.
9. Repère transversal : algorithmique et tableur.

Chaque leçon comprend objectifs, méthode progressive, exemples, deux pauses mémoire, une application corrigée et une routine de révision. Les bases communes sont reliées aux ressources de Première, plutôt que recopiées. En Terminale, l'algorithmique et le tableur sont explicitement présentés comme des pratiques du programme, non comme une option.

Au total : **25 ressources de cours, 50 pauses mémoire et 183 modèles d'exercices** pour les deux niveaux. Ces nombres incluent les repères transversaux et l'atelier de Première ; il ne s'agit pas de 25 chapitres obligatoires.

## Fonctionnement pédagogique

Les catalogues de leçons et d'exercices comportent un sélecteur Première/Terminale. L'accueil conserve ses deux espaces, Leçons et Exercices. L'ancien badge de Première est masqué dans l'en-tête partagé ; les pages précisent leur niveau dans leur contexte.

Les leçons utilisent les styles et scripts partagés : couleurs accompagnées de mots, aide en trois étapes, deux mini-tests de rappel actif, agrandissement du texte, lecture concentrée, sommaire et impression. Le texte principal et les corrections HTML `details` restent lisibles sans JavaScript. Aucun suivi nominatif ni score de lecture n'est stocké.

Les exercices réutilisent le moteur existant : saisies et choix, score du chapitre, indices, correction détaillée et bouton Effacer. Une correction remplit les champs ; le vert signale une réponse initialement correcte, le rouge une réponse fausse ou manquante. Révéler une réponse ne rapporte pas de point.

Après une vérification, une variante est préparée, mais l'essai reste visible jusqu'au clic sur **Nouvelle variante ↻**. Énoncé, réponses et correction sont recalculés ensemble. Renouveler une question retire sa validation précédente. Les scores se réinitialisent au rechargement.

Les variantes sont déterministes avec un cycle borné ; elles sont répétables, pas garanties inédites indéfiniment. En Terminale, les 54 modèles sont testés sur 48 générations chacun, couvrant deux cycles de 24 paramètres. Les fractions et les virgules décimales sont acceptées. Les arrondis sont indiqués dans les exercices. Les exercices de Terminale autorisent l'utilisation d'une calculatrice pour les calculs numériques ; ce ne sont pas des simulations de l'épreuve anticipée de Première.

## Structure

```text
index.html                       Accueil commun
lecons.html, exercices.html       Catalogues Première avec sélecteur de niveau
cours/, exercices/               16 cours et 16 séries Première, adresses conservées
programme.html, pedagogie.html    Références Première et méthodes pédagogiques
terminale/lecons.html             Catalogue des 9 ressources Terminale
terminale/exercices.html          Catalogue des 9 séries Terminale
terminale/programme.html          Périmètre et calendrier 2019 / 2026
terminale/cours/t-*.html           9 leçons statiques
terminale/exercices/t-*.html       9 pages de séries
assets/terminale-exercices.js      54 générateurs Terminale et aides progressives
assets/niveaux.css                Sélecteur de niveau et adaptations Terminale
assets/exercices-variants.js      Moteur commun de génération et validation
assets/exercices-renderer.js      Rendu partagé des fiches et renouvellement
assets/exercices.js               Vérification, score, navigation et corrections
assets/variants-*.js              Générateurs existants de Première
assets/coaching-*.js              Aides existantes de Première
assets/cours.js                   Recherche, sommaire, impression et simulation
assets/apprentissage.*            Lecture et pauses mémoire
assets/graphiques-interactifs.*    Graphiques interactifs existants
assets/styles.css, cours.css      Thème et composants communs
assets/exercices.css              Styles des parcours interactifs
donnees/                         CSV réel et provenance
tests/                           Tests structurels, numériques et navigateur
.github/workflows/                Vérifications en lecture seule
.nojekyll                        Publication statique
```

Les pages d'exercices Terminale chargent, dans cet ordre, le moteur de variantes, le module Terminale, le renderer, puis le script d'interaction. Les slugs `t-*` évitent toute collision avec les chapitres de Première. Les liens précédent/suivant des leçons Terminale sont statiques ; leur sommaire utilise le script commun.

## Données et confidentialité

Aucune donnée personnelle, police distante, publicité ou traceur. Les réponses, variantes et simulations sont traitées localement sans transmission ni stockage. Aucun interpréteur Python n'est embarqué : les codes du cours se copient dans un environnement Python 3.

`donnees/naissances-france-2018-2023.csv` contient six totaux annuels issus de l'[Insee Focus 339, figure 1](https://www.insee.fr/fr/statistiques/8282356). Le champ, l'unité et la période sont décrits dans `donnees/README.md`. Les autres situations chiffrées sont fictives et pédagogiques, pas des conseils financiers ou fiscaux.

`pedagogie.html` expose les choix d'apprentissage et leurs sources académiques. Ces sources et les tests logiciels ne constituent pas une certification de l'efficacité du site pour chaque élève ; une évaluation de terrain reste nécessaire.

## Utilisation locale et tests

Aucun paquet n'est requis pour lire le site. Ouvrir `index.html`, ou servir la racine :

```sh
python3 -m http.server 8000
```

Tous les chemins internes sont relatifs, y compris les liens entre les niveaux, pour fonctionner dans un sous-répertoire GitHub Pages.

Contrôles structurels et numériques :

```sh
python3 tests/validate_site.py
for f in assets/*.js; do node --check "$f"; done
node tests/test_variants.js
node tests/test_graphiques.js
node tests/test_terminale.js
python3 tests/test_terminale.py
```

Tests de navigateur, avec Playwright comme seule dépendance de développement :

```sh
python3 -m pip install playwright==1.55.0
python3 -m playwright install chromium
python3 tests/browser_smoke.py
python3 tests/browser_terminale.py
```

Les nouveaux tests vérifient les 21 pages Terminale, leurs liens, les 18 pauses mémoire, les exemples Python, les 54 modèles avec un recalcul indépendant en Python, la validation des arrondis, les scores et corrections, les variantes, la navigation entre niveaux, les écrans de 320 et 390 pixels et les leçons sans JavaScript. Les tests existants continuent de vérifier le parcours Première.

## Publication et maintenance

GitHub Pages publie la branche **`gh-pages`**, à la racine. **`main`** reste la référence des sources. Une modification de `main` n'est visible qu'après mise à jour de `gh-pages` vers le commit validé et réussite de `pages build and deployment`. Ne pas forcer l'historique : vérifier que l'avancement est possible sans écraser de changements.

Les workflows de vérification disposent uniquement de permissions de lecture et ne déploient pas. Le workflow historique est conservé ; `terminale.yml` ajoute les contrôles des deux niveaux.

Pour modifier le parcours Première, maintenir ses catalogues, le tableau de couverture et `courseOrder` dans `assets/cours.js`. Pour Terminale, maintenir ses deux catalogues, sa page de programme, les liens statiques précédent/suivant et la liste des slugs des tests. Ne pas ajouter les slugs Terminale à l'ordre de Première. Conserver les indications textuelles avec les codes couleur et exécuter les tests avant publication.
