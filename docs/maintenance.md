# Maintenance

Ce document décrit le fonctionnement du site et les règles à suivre pour le faire évoluer. Le README donne le lancement local et la liste des tests ; `validation-humaine.md` décrit les vérifications qui ne peuvent pas être automatisées.

## Architecture

Site statique, sans framework ni serveur applicatif. Chaque page est un fichier HTML écrit à la main ou produit par un outil du dossier `tools/`, puis normalisé par `tools/finalize_site.py`.

| Emplacement | Contenu |
| --- | --- |
| `index.html` | Accueil : choix du niveau (3e, Première, Terminale) et question d’essai |
| `lecons.html`, `exercices.html`, `sujets.html` | Catalogues de Première (sélecteur de niveau) |
| `cours/`, `exercices/` | 16 leçons et 16 séries de Première |
| `terminale/` | Catalogues, programme, 9 leçons et 9 séries de Terminale (`t-*`) |
| `troisieme/` | Catalogues, programme et brevet, 16 leçons et 16 séries de 3e (`3-*`) |
| `annexes/calcul-rapide.html` | Calcul rapide sans calculatrice |
| `diagnostic.html`, `revisions.html`, `mes-progres.html` | Diagnostic, révision guidée, suivi local |
| `entrainement/` | Deux sujets blancs et des problèmes rédigés, avec corrigés et barèmes |
| `donnees/` | CSV Insee et sa page de provenance (publiés) ; JSON de référence pour les outils et les tests (non publiés) |
| `assets/` | Styles, scripts et polices |

**Styles.** Chaque page charge quatre feuilles, dans cet ordre : `tokens.css` (couleurs, typographie, espacements, mode sombre, polices), `base.css` (éléments HTML, en-tête, pied de page, impression), `components.css` (boutons, champs, éléments dépliables, cartes, encadrés), puis la feuille de son gabarit : `accueil`, `lecon`, `serie`, `catalogue`, `calcul-rapide`, `sujets` ou `page`. Le gabarit est fixé par `finalize_site.py` et écrit dans `<body data-gabarit="…">`. Les feuilles n'utilisent que les jetons de `tokens.css` ; une nouvelle couleur s'ajoute d'abord comme jeton, avec sa valeur en mode sombre et son contraste.

**Scripts.** Tous sont locaux et chargés en `defer`, sauf `menu.js` qui marque la page avant le premier affichage. Sans JavaScript, le texte des leçons, les corrigés (`details`) et une version de lecture des séries restent disponibles.

| Fichiers | Rôle |
| --- | --- |
| `exercices-variants.js` | Moteur de variantes à graine |
| `variants-*.js`, `terminale-exercices.js`, `troisieme-exercices.js` | Modèles d'exercices de Première (par chapitre), de Terminale et de 3e |
| `serie-*.js` | Modèles d'une seule série de 3e, de Seconde ou de Terminale, extraits du fichier de leur niveau par `tools/build_series.py` : ce sont eux que les pages chargent. Ne pas les modifier à la main |
| `exercices-renderer.js`, `exercices.js` | Affichage des séries, vérification, score, corrections |
| `coaching-*.js`, `fonctions-coaching.js` | Indices progressifs, calculés sur la variante affichée |
| `cours.js`, `apprentissage.js`, `graphiques-interactifs.js` | Sommaire, pauses mémoire, confort de lecture, graphiques |
| `figures.js`, `figures-statistiques.js`, `figures-geometrie.js` | Moteur de figures : SVG calculés à partir de coordonnées mathématiques (voir « Figures »). Le premier fichier dessine les repères ; le deuxième ajoute les arbres pondérés, les diagrammes statistiques et le triangle de Pascal ; le troisième la géométrie plane, la droite numérique, les solides et les tracés. Une page ne charge que les fichiers dont ses figures ont besoin |
| `terminale-figures.js` | Figures des séries de Terminale sur les statistiques et les probabilités, chargé par ces seules séries |
| `tableaux.js` | Sur les pages qui ont un tableau défilant : estompe le bord droit d'un tableau plus large que l'écran tant qu'il reste des colonnes à faire défiler |
| `acquis.js`, `suivi-exercices.js`, `progres.js`, `catalogue-suivi.js` | Suivi local facultatif et son affichage |
| `parcours.js`, `parcours-data.js` | Diagnostic et révision guidée |
| `calcul-rapide*.js`, `compte-rebours.js`, `examen.js` | Calcul rapide, chrono, impression des sujets |
| `typographie.js` | Typographie française du texte produit par JavaScript |

## Variantes d'exercices

Chaque modèle déclare :

- `base` : les paramètres de l'exercice écrit dans la page, qui reste la variante 1 ;
- `params(r)` : le tirage de nouveaux paramètres dans des plages fixes ;
- `accept` : les contraintes (pas de cas dégénéré, résultats « propres », calculs faisables sans calculatrice en Première) ;
- `difficulty` : un score de difficulté ;
- `build` : l'énoncé, les champs de réponse, l'aide et le corrigé, tous calculés à partir des mêmes paramètres.

**Graine.** Une nouvelle variante reçoit une graine aléatoire (`crypto.getRandomValues`, repli sur `Date.now()`), transformée par un générateur reproductible (mulberry32) : même graine, même exercice. Le rang de la variante n'intervient jamais.

**Bande de difficulté.** Un tirage refusé par `accept`, ou dont la difficulté s'écarte de plus de 20 % de celle de l'exercice d'origine, est retiré, jusqu'à 200 fois.

**Anti-répétition.** Les 10 dernières variantes d'un exercice ne peuvent pas revenir (mémoire en variable JavaScript, sans stockage). Les bonnes réponses à choix sortent entre 30 et 70 % du temps. Quand un intitulé contient un rang ou une abscisse (u₅, « pour x = 5 »), ce rang varie aussi d'une variante à l'autre.

**Corrigés.** Ils suivent la structure Méthode → Calculs → Conclusion. Les fractions et les virgules décimales sont acceptées. Les réponses sont comparées en arithmétique rationnelle, sans `eval`.

Les champs qui déclarent une unité (`unit`, ou un libellé « en % » / « en € ») acceptent ce suffixe à la saisie, sans modifier l'échelle du nombre demandé. Un champ de probabilité sans unité ne transforme donc pas « 20 % » en 0,2. Les racines sans ordre imposé partagent `answerGroup: "roots"` ; chacune doit appartenir à l'ensemble attendu, sans doublon. Les champs « Petite racine » / « Grande racine » restent ordonnés. L'évaluation du chapitre et le suivi local utilisent les mêmes règles.

Lors de l'ouverture d'un corrigé, la tentative est évaluée intégralement avant tout remplacement de valeur, puis reste affichée sous la solution. Cela évite qu'une permutation correcte des racines soit marquée fausse pendant la révélation.

**Chargement du correcteur.** Une absence du moteur est une panne technique, pas une réponse fausse : Vérifier est désactivé et le corrigé s'affiche sans évaluation rouge ou verte. En Terminale, la version statique des énoncés et corrigés prend le relais. Les scripts de validation et de typographie évitent le lookbehind, non pris en charge avant Safari 16.4. Une soumission entièrement vide ne crée pas d'observation dans le suivi local.

## Ajouter un exercice

1. Écrire le modèle dans le fichier `variants-*.js` du chapitre (ou `terminale-exercices.js`, `troisieme-exercices.js`), en reprenant la forme d'un modèle voisin : `base`, `params`, `accept`, `difficulty`, `verify`, `build`.
2. Ajouter l'exercice d'origine dans le JSON `exercise-data` de la page de la série, avec les mêmes valeurs que `base`.
3. Ajouter ses indices dans le fichier `coaching-*.js` du chapitre.
4. Lancer `python3 tools/build_fallbacks.py` (version de lecture sans JavaScript), puis `python3 tools/finalize_site.py`.
5. Lancer `node tests/test_variants.js` (ou `test_terminale.js`, `test_troisieme.js`), `node tests/test_rangs.js` et `node tests/test_cloture.js`, puis la batterie complète (`python3 tests/lancer.py`, dont la liste `TESTS` est à compléter quand on ajoute un test).

## Ajouter une leçon

1. Copier une leçon du même niveau : structure, encadrés (`definition`, `method`, `formula`, `example`, `warning`, `recap`), deux pauses mémoire, application corrigée.
2. Déclarer ses prérequis dans `tools/lecons.py`, son domaine dans les catalogues, et, en Première, son rang dans `courseOrder` de `assets/cours.js`.
3. L'ajouter au catalogue de son niveau et au tableau de `couverture.html` ; en Terminale, mettre à jour les liens précédent / suivant.
4. Lancer `python3 tools/finalize_site.py` : métadonnées, navigation, feuilles de style, typographie, noms de liens et sitemap.

## Outils

| Outil | Rôle |
| --- | --- |
| `finalize_site.py` | Normalise toutes les pages (navigation, en-tête mobile, feuilles et scripts versionnés, polices préchargées, métadonnées, URL canoniques, sitemap, robots) ; appelle les outils ci-dessous. Idempotent. |
| `navigation_simple.py` | Cinq entrées de navigation, raccourcis des catalogues d'exercices, pages-relais |
| `lecons.py` | Encadré « Prérequis », routine de révision et sommaire des leçons |
| `gabarits.py` | Domaine sur les cartes et les pages, nombre d'exercices, suivi des catalogues, encadrés Définition et Méthode |
| `liens_accessibles.py` | Nom accessible unique pour les liens génériques répétés |
| `typographie.py` | Typographie française du HTML (apostrophes, espaces insécables) |
| `build_fallbacks.py` | Version de lecture sans JavaScript des séries |
| `figures_lecons.js`, `figures_lecons.py` | Descriptions des figures des leçons et remplissage des emplacements `data-figure` |
| `build_series.py` | Extrait de chaque fichier de niveau (`troisieme-exercices.js`, `seconde-exercices.js`, `terminale-exercices.js`) un fichier `assets/serie-<série>.js` par série, et calcule les parties du moteur de figures dont chaque série a besoin ; appelé par `finalize_site.py` ; `--check` vérifie que les fichiers sont à jour |
| `figures.py` | Pont vers `assets/figures.js` pour les pages générées en Python ; lancé seul, écrit la galerie de relecture `.qa-figures/galerie.html` |
| `build_sujets.py` | Catalogue des sujets à partir de `donnees/sujets.json` |
| `build_public.py` | Dossier `public/` publié par Cloudflare Pages (pages, assets, icônes, données liées) ; échoue sur un lien local cassé |
| `update_fingerprints.py` | Liste ou réécrit les empreintes du contenu protégé |
| `prepare_browser.sh` | Vérifie le navigateur de test en intégration continue |

## Tests

| Test | Ce qu'il vérifie |
| --- | --- |
| `validate_site.py` | Structure, liens locaux, exemples des leçons, calculs |
| `test_notation.py`, `test_typographie.py`, `test_noms_liens.py` | Écriture des formules, typographie, noms de liens uniques |
| `test_variants.js`, `test_terminale.js`, `test_terminale.py`, `test_troisieme.js` | Chaque modèle sur 2 000 graines : validité, reproductibilité, variété, bande de difficulté, recalcul indépendant |
| `test_troisieme.py` | Pages de 3e : structure des leçons et des séries, liens, catalogues, programme et choix du niveau sur l’accueil |
| `test_rangs.js` | Les rangs demandés changent d'une variante à l'autre |
| `test_cloture.js`, `test_cloture.py`, `test_domaines.js` | Domaines de définition, pièges de réponses fausses, sujets blancs |
| `test_graphiques.js`, `test_calcul_rapide.*`, `test_countdown.js` | Graphiques, calcul rapide, chrono |
| `test_series.js` | Fichiers par série : mêmes exercices et mêmes aides que le fichier complet du niveau, page qui charge son fichier et les seules parties utiles du moteur de figures |
| `test_figures.js`, `test_figures.py` | Moteur de figures : SVG valides et dans leur cadre, étiquettes sans chevauchement, longueurs, angles et points recalculés à partir du SVG, reproductibilité ; pont Python identique au moteur ; figures des pages (identifiants, titre et légende) |
| `test_acquis.js`, `test_parcours.js`, `test_evolution.py` | Suivi local, diagnostic, révision, empreintes mathématiques |
| `test_interface.py`, `test_sujets.py`, `test_navigation_simple.py` | Interface, sujets, navigation, contenu protégé |
| `browser_*.py` | Parcours réels dans Chromium, 320 à 1 440 px, sans JavaScript, accessibilité (axe-core) |
| `test_safari.js`, `browser_validation.py` | Absence de lookbehind bloquant, montants au centime, moteur absent ou incomplet sans faux négatif, suivi à vide et réinitialisation accessible ; `STMG_TEST_BROWSER=webkit` permet le contrôle avec WebKit |
| `test_answer_formats.js`, `browser_global.py` | Unités explicitement demandées, fractions à l'accueil, descriptions des champs, bilan sans tentative vide, écouteurs bornés après 30 variantes ; exécution Chromium ou WebKit |
| `browser_decimal.py` | Un menu par bloc de réponses, saisie littérale au curseur et remplacement de sélection, sélection iOS tardive, cadre unique, alignement et écarts de 16 px ; Chromium ou WebKit, tactile et PC |
| `browser_visual.py` | 43 comparaisons au commit de référence, dont les fonctions : mobile, PC, thèmes clair et sombre, sans JavaScript ; captures brutes conservées et changements volontaires déclarés pour une seule référence |
| `check_publication.py` | Site en ligne identique à `public/`, fichiers internes en 404 |

### Comparaisons visuelles

Le test construit deux versions avec `tools/build_public.py` et les sert sous la CSP réelle. La date, l'aléatoire et le navigateur sont identiques ; les polices et animations sont stabilisées avant capture. Le rapport `.qa-visual/rapport.html` montre les paires avant/après. Le seuil de différence est d'un niveau RGB sur 255.

En CI, la référence est la base de la pull request ou le commit précédent le push. En local, `VISUAL_BASE_SHA=<SHA complet> python3 tests/browser_visual.py` choisit explicitement la référence. Sans cette variable, le test utilise `HEAD` si le travail est modifié, sinon `HEAD^`.

Pour un changement volontaire du texte d'un champ, relire les deux captures puis renseigner dans `tests/visual-changes.json` le SHA exact de référence, la page, un sélecteur précis et la raison. Le masque ne s'applique qu'à cette référence et à l'intérieur des champs : leurs dimensions, positions et styles restent comparés. Une refonte qui modifie la géométrie doit faire évoluer le contrôle après revue ; élargir un masque pour cacher une régression n'est pas acceptable. Pour une refonte d'une page entière, `normalization: "page-redesign"` suspend la comparaison au pixel de cette page pour le seul SHA déclaré : les captures avant/après restent dans le rapport et doivent être relues.

Pour un déplacement explicite du menu et une correction des espacements, `normalization: "answer-layout"` retire les anciennes et nouvelles commandes, déplie leur conteneur et donne aux réponses une géométrie commune dans les deux versions. Les textes et le reste de la fiche restent comparés ; les captures brutes avant/après montrent la présentation réellement modifiée. Les images `*-comparaison.png` rendent la normalisation vérifiable. Cette exception ne vaut que pour le SHA déclaré. Les tests séparés vérifient les écarts, hauteurs, alignements, focus, curseur et insertions. Une revue des captures brutes reste nécessaire.

Le menu Signes est unique par formulaire et agit sur le dernier champ utilisé. Les positions de sélection sont mémorisées pendant la saisie et avant le flou, puis copiées avant le retour du focus : un événement de sélection tardif lors de l'ouverture du menu ne doit pas remettre le curseur au début. Les touches insèrent à la position choisie, comme un clavier, sans déplacer automatiquement les signes au début du nombre.

## Figures

Toutes les figures sont calculées par `assets/figures.js` à partir de coordonnées mathématiques : le moteur choisit l'échelle, retourne l'axe des ordonnées, place la figure dans son cadre (320 × 200 par défaut, marge de 24 px) et choisit pour chaque nom la place qui ne recouvre aucune autre étiquette et le moins de traits possible. Une figure est décrite par un objet sérialisable en JSON ; la même description donne toujours le même SVG (aucun aléatoire, coordonnées arrondies à 0,1 px). Le fichier fonctionne dans le navigateur (`window.Figures`) et dans Node (`require`), sans dépendance.

| Famille | Contenu |
| --- | --- |
| `figure(titre, options)` | Géométrie plane à échelle uniforme : `point`, `segment`, `polygone`, `droite`, `demi_droite`, `cercle`, `arc_cercle`, `angle_droit`, `angle`, `cote`, `cote_fleche`, `codage`, `parallele`, `vecteur`, `rotation_fleche`, `texte`, `hachures`, et des objets concrets (`sol`, `mur`, `echelle`, `baton`, `ombre`, `immeuble`, `sapin`, `observateur`, `rampe`) |
| `repere(titre, {xmin, xmax, ymin, ymax, pas_x, pas_y, grille, orthonorme, nom_x, nom_y})` | Axes gradués (coupure automatique si un axe ne part pas de 0), `courbe`, `droite_affine`, `droite_verticale`, `asymptote_h`, `asymptote_v`, `point`, `nuage`, `point_moyen`, `lecture`, `antecedents`, `tangente`, `secante`, `escalier`, `zone_signe`, `intervalle_solutions`, `suite_points`, `vecteur`, `texte` |
| `droite_numerique(titre, {min, max, pas})` | `point`, `intervalle` (crochets ouverts ou fermés), `distance`, `centre_rayon`, plusieurs lignes pour une réunion ou une intersection |
| `espace(titre)` | Perspective cavalière (45°, coefficient 0,5), arêtes cachées en pointillés : `pave`, `cube`, `pyramide_carree`, `cylindre`, `cone`, `boule`, `section_pyramide` |
| `arbre(titre, niveaux, {chemin, feuilles})` | Arbre pondéré horizontal, probabilités sur les branches, chemin en trait épais |
| `statistiques(titre)` | `diagramme_barres`, `diagramme_batons`, `histogramme`, `boite`, `diagramme_circulaire`, `courbe_indices`, `diagramme_venn` |
| `pascal(titre, n)`, `programme_trace(titre, cotes, angle)`, `groupe(titre, figures)` | Triangle de Pascal, polygone tracé par le lutin, deux figures côte à côte |

Les fonctions à tracer s'écrivent comme dans une leçon (`'x^2 - 14'`, `'1/x'`, `'sqrt(x)'`, `'1,5^n'`) : elles sont lues par un petit analyseur, sans `eval`, pour rester compatibles avec la CSP. Chaque famille est illustrée dans `tests/figures_exemples.js`.

**Écrire une figure.** En JavaScript, chaque famille a un constructeur chaîné :

```js
Figures.figure('Triangle ABC rectangle en A')
  .point('A', 0, 0).point('B', 6, 0).point('C', 0, 8)
  .polygone(['A', 'B', 'C']).angle_droit('A', 'B', 'C')
  .cote('A', 'B', '6 cm').cote('A', 'C', '8 cm').cote('B', 'C', '?')
  .html();            // bloc <figure> ; .svg() pour le SVG seul ; .description() pour l'objet JSON
```

En Python (pages de 3e, de Seconde, brevet), `tools/figures.py` envoie la même description à node :

```python
from figures import figure_html
figure_html({'type': 'repere', 'titre': 'Droite d’équation y = 2x + 1',
             'options': {'xmin': -3, 'xmax': 4, 'ymin': -3, 'ymax': 8},
             'elements': [{'t': 'droite_affine', 'm': 2, 'p': 1, 'nom': 'y = 2x + 1'},
                          {'t': 'escalier', 'x': 1, 'y': 3, 'dx': 1, 'dy': 2}]})
```

Dans une description, chaque élément porte son nom dans `t` et ses arguments sous les noms listés dans `Figures.SIGNATURES`.

**Règles.**

- Les coordonnées viennent des nombres du texte ou de l'exercice, jamais d'un placement à l'œil : une longueur de 6 et une longueur de 8 sont dessinées dans le rapport 3/4.
- Aucun attribut `style` ni balise `<style>` (CSP) : uniquement des attributs de présentation. Le trait et le texte utilisent `currentColor`, pour le thème sombre et l'impression.
- Une couleur n'est jamais la seule information : une seconde courbe est en pointillés ou porte son nom ; deux séries d'un nuage se distinguent par la forme des points.
- Accessibilité : `role="img"`, `<title>` et `<figcaption>` identiques, identifiant unique dans la page ; pour un graphique à lire, le champ `description` devient une balise `<desc>` qui donne les valeurs clés.
- Le moteur applique lui-même la typographie française (espaces insécables, apostrophe) au titre, à la légende et aux étiquettes ; `tools/typographie.py` ne modifie donc plus une figure.
- **La figure d'un énoncé ne donne jamais la réponse** : elle montre les données (noms, longueurs connues, angle connu), l'inconnue est notée « ? » ; un angle droit ou un parallélisme à démontrer n'est pas codé.

**Ajouter une figure dans une leçon.** Les figures des leçons des quatre niveaux sont décrites dans `tools/figures_lecons.js`, sous un nom qui commence par le niveau (`3-`, `2-`, `1-`, `t-`), avec les nombres du texte qu'elles accompagnent. La leçon ne contient que l'emplacement :

- 3e et Seconde : `+ FIG('3-pythagore')` dans `tools/niveaux/lecons_troisieme.py` ou `lecons_seconde.py`, puis `python3 tools/niveaux/generer.py` ;
- Première et Terminale : `<figure class="lesson-figure" data-figure="1-second-sommet"></figure>` dans le HTML de la leçon, puis `python3 tools/finalize_site.py`.

Les sujets suivent la même règle : les figures du brevet blanc (`tools/niveaux/brevet.py`, emplacement `FIG('3-brevet-rampe')`), des sujets blancs et de la page de problèmes (`entrainement/`, noms en `s-`) sont décrites dans le même fichier et placées par le même outil. La figure d'un énoncé ne montre que ses données ; les droites, intersections et extremums cherchés sont dans le corrigé. Un graphique à manipuler garde une version sans JavaScript : une figure statique dans un `<noscript>` placé juste après lui (`1-fonctions-affine`).

`tools/figures_lecons.py`, appelé par `finalize_site.py`, calcule le SVG et remplit chaque emplacement (opération idempotente ; un nom inconnu arrête la normalisation). Ne jamais retoucher le SVG dans la page : modifier la description, puis régénérer. `python3 tools/figures_lecons.py` écrit `.qa-figures/lecons.html`, la galerie de toutes les figures des leçons. `tests/test_figures.py` vérifie que chaque page contient exactement la figure décrite et que chaque figure décrite est placée une seule fois ; `tests/test_figures.js` recalcule sur le SVG les nombres des figures clés (Pythagore, Thalès, angle de 35°, points sur leur courbe).

**Ajouter une figure dans un exercice à variantes.** Un exercice peut porter deux champs facultatifs : `figure` (affichée après l'énoncé) et `figure_correction` (affichée avec le corrigé). Ce sont des descriptions pour `assets/figures.js`, calculées avec les paramètres de la variante. En 3e et en Seconde, elles sont regroupées à la fin de `assets/troisieme-exercices.js` et `assets/seconde-exercices.js`, dans le tableau `FIGURES` : pour chaque série, une fonction par modèle (ou `null`), qui reçoit les paramètres et l'exercice construit et renvoie `{e: figure d'énoncé, c: figure de corrigé}`. `pointsDe(énoncé)` relit les points affichés (« A(1 ; −2) ») pour que la figure reprenne exactement les données de l'énoncé. `assets/exercices-renderer.js` place la figure dans un `<figure class="exercise-figure">` après le paragraphe d'énoncé, jamais dedans ; `tools/build_fallbacks.py` l'intègre à la version sans JavaScript ; les pages de séries de 3e et de Seconde chargent `figures.js` avant les modèles (liste des scripts dans `tools/niveaux/troisieme.py` et `seconde.py`) ; une série sans figure ne le charge pas, pour rester dans le budget de poids de `tests/browser_cloture.py`.

En Première et en Terminale, les figures suivent le même principe, sans la géométrie : `figures.js`, et `figures-statistiques.js` pour les séries qui tracent un arbre, un diagramme ou un triangle de Pascal :

- `V.illustrate('série', [fonction ou null, …])` associe une fonction à chaque modèle déjà enregistré ; elle reçoit les paramètres et l'exercice construit et renvoie `{e, c}`. `V.frame` cadre un repère autour de l'origine et des valeurs données, `V.sample` échantillonne une fonction pour ce cadrage, `V.pointsIn(énoncé)` relit les points écrits dans l'énoncé ;
- Première : ces appels sont à la fin de chaque fichier `assets/variants-*.js` ;
- Terminale : à la fin de `assets/terminale-exercices.js` pour les séries d'analyse (exponentielles, fonction inverse), dans `assets/terminale-figures.js` pour les séries de statistiques et de probabilités ;
- quand l'énoncé initial arrive sans figure (JSON écrit dans la page en Première, figures de `terminale-figures.js`), `assets/exercices-renderer.js` lui ajoute celle que calcule le modèle avec les paramètres d'origine : le rendu est chargé après les modèles ;
- `tools/finalize_site.py` ajoute ces scripts aux seules pages concernées : `SERIES_ILLUSTREES` (moteur), `SERIES_STATISTIQUES` (partie « statistiques et probabilités »), `SERIES_TERMINALE_FIGURES`. `tests/test_variants.js` et `tests/test_terminale.js` vérifient que ces listes correspondent aux modèles illustrés.

**Lectures graphiques du calcul rapide.** Dans `assets/calcul-rapide-data.js`, un modèle déclaré avec `figure` (dernier argument de `add`) renvoie, en plus de sa question, une description de figure écrite à la main (fonction `graph`) ; `assets/calcul-rapide.js` la dessine sous la question et sur la fiche à imprimer. La légende ne donne aucune valeur à lire. Ces modèles ne sont proposés que si `figures.js` est chargé dans la page, et les parcours de révision (`assets/parcours-data.js`) ne les reprennent pas. `tests/test_calcul_rapide.js` vérifie chaque figure et que le point à lire est sur un nœud du quadrillage.

Une page de série de 3e, de Seconde ou de Terminale ne charge pas le fichier de son niveau, mais `assets/serie-<série>.js`, qui n'en contient que les modèles de cette série (12 à 21 ko au lieu de 80 à 145 ko). Après toute modification d'un fichier de niveau, `python3 tools/finalize_site.py` régénère ces fichiers ; les tests et les outils continuent de lire le fichier de niveau, qui reste la source. Le budget de poids de `tests/browser_cloture.py` est de 400 ko transférés sans compression ; la série de Terminale sur la fonction inverse, qui sert de témoin, en est à environ 335 ko.

Règles propres aux exercices :

- la figure de l'énoncé montre les données, jamais la réponse : inconnue notée « ? », pas d'angle droit ni de parallélisme codé dans une réciproque, triangle dessiné à l'échelle de ses vraies longueurs ;
- alignement, parallélisme, nature d'un triangle, point cherché : figure dans le corrigé seulement ;
- un triangle impossible ou trop plat pour être lisible n'est pas dessiné (la variante garde son énoncé, sans figure) : la bande de difficulté n'est pas modifiée.
- intersection de droites, solutions lues sur une courbe, signe, extremum, arbre complété : figure dans le corrigé ; l'énoncé ne reçoit que les données (points, intervalles, arbre avec « ? » sur les branches à calculer) ;
- quand l'énoncé ne fixe pas la forme (pyramide connue par son aire et son volume, triangle OAB d'une homothétie), la légende annonce un schéma ou « une figure possible » ;
- dans une figure graduée (repère, droite numérique, diagramme sur des axes), les nombres écrits sont des graduations : le contrôle « réponse absente » ne s'y applique pas, et la règle est vérifiée modèle par modèle dans la fonction `coherence` des tests.

`tests/test_troisieme.js`, `tests/test_seconde.js`, `tests/test_variants.js` et `tests/test_terminale.js` contrôlent chaque figure sur les 2 000 graines de chaque modèle : SVG valide et dans son cadre, étiquettes sans chevauchement, réponse absente de la figure d'énoncé, longueurs et angles recalculés à partir du SVG, liste des modèles illustrés.

**Relire les figures.** `python3 tools/figures.py` écrit `.qa-figures/galerie.html` (exemples de chaque famille, thèmes clair et sombre). Après une modification du moteur : regarder la galerie, puis lancer `node tests/test_figures.js` et `python3 tests/test_figures.py`. Les contrôles communs (`tests/figures_controle.js`) mesurent le SVG produit, pas les données internes du moteur : ils servent aussi à vérifier les figures des pages et des exercices.

## Règle des empreintes

`tests/interface-content.json` et `tests/evolution-mathematics.json` figent le contenu pédagogique : zone principale des leçons et des séries, modèles d'exercices, aides. Un test échoue dès qu'un octet change.

Une modification volontaire du contenu se fait ainsi :

1. relire le changement ;
2. lancer `python3 tools/update_fingerprints.py` pour lister les empreintes touchées ;
3. lancer `python3 tools/update_fingerprints.py --write` ;
4. justifier le changement dans le message de commit.

Une empreinte ne se met jamais à jour pour faire passer un test sans relecture.

## Programmes et sources officielles

- Première, depuis 2026–2027 : arrêté du 26 février 2026, BO n° 14 du 2 avril 2026, [MENE2602918A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602918A).
- Terminale, en 2026–2027 : programme de 2019, [annexe sur Éduscol](https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf).
- Terminale, à partir de 2027–2028 : arrêté du 26 février 2026, [MENE2602921A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602921A).
- Épreuve anticipée de Première (session 2028) : [note de service du 11 septembre 2026](https://www.education.gouv.fr/bo/2026/Special4/MENE2622640N). Deux heures sans calculatrice : 6 points de réponses courtes, 14 points d'exercices, dont 2 points de langue.

La couverture des trois cohortes est décrite dans `couverture.html` et `donnees/couverture-programme.json`. Les rappels de Première (statistiques affines, conditionnement) restent dans le parcours de Terminale pour la cohorte issue du programme de 2019. Les activités réservées à d'autres séries technologiques ne deviennent pas des prérequis STMG. Les annales de Terminale 2017–2020 sont des archives, pas des modèles de l'épreuve actuelle.

## Niveau 3e

- Programme applicable en 2026–2027 : cycle 4, BO n° 31 du 30 juillet 2020. Le programme du cycle 4 publié au BO n° 10 du 5 mars 2026 s’appliquera en 3e à la rentrée 2028 : les leçons seront à revoir à cette date.
- Brevet à partir de la session 2027 : 2 heures, automatismes sans calculatrice (20 minutes, 6 points) puis raisonnement et résolution de problèmes (1 h 40, 14 points). Le détail est sur `troisieme/programme.html#brevet`.
- Les modèles de `troisieme-exercices.js` arrondissent au centième par défaut ; un champ peut demander une autre précision dans son libellé.
- Le suivi local accepte les notions `3-*` (niveau « troisieme ») ; le catalogue des exercices de 3e affiche donc « Mes progrès » et propose le diagnostic et la révision guidée de 3e.
- Dans les pages de 3e, la quatrième entrée de navigation est « Brevet » (`troisieme/brevet.html` : format, sujets officiels, sujet blanc corrigé) à la place de « Sujets ».
- Domaines propres à la 3e et à la Seconde dans `tools/gabarits.py` : `nombres`, `fonctions` (couleur de l’analyse) et `geometrie`, avec leurs jetons dans `tokens.css`.

## Niveau Seconde

- Programme applicable depuis la rentrée 2026 : arrêté du 26 février 2026, BO n° 14 du 2 avril 2026 (MENE2602914A). Quatre parties thématiques et trois parties transversales ; le repère « Algorithmique et logique » regroupe Python, le vocabulaire ensembliste et les raisonnements, et l'annexe de calcul rapide entretient les automatismes.
- Les pages sont dans `seconde/` (préfixe `2-`), les modèles dans `seconde-exercices.js` (hook `data-seconde-chapter`), contrôlés par `tests/test_seconde.js` et `tests/test_seconde.py`.
- La quatrième entrée de navigation est « Programme » (`seconde/programme.html`), à la place de « Sujets ».
- Le suivi local accepte les notions `2-*` (niveau « seconde »). Le calcul rapide, le diagnostic et la révision guidée ont des questions de 3e (`c-*`) et de Seconde (`s-*`) ; `ParcoursBank.levels` fixe les niveaux de chaque parcours.
- Les vecteurs s'écrivent `<span class="vec"><span class="sr-only">vecteur </span>AB</span>` : la flèche est dessinée en CSS (`components.css`), car la police ne contient pas la flèche combinante. Dans les libellés de champs, qui sont du texte, on écrit « vecteur AB ».
- L'accueil présente quatre marches au-dessus de 1100 px, quatre blocs (deux par ligne, puis un par ligne sur téléphone) en dessous.

## Pages de 3e et de Seconde

Les leçons de 3e et de Seconde sont écrites dans `tools/niveaux/lecons_troisieme.py` et `tools/niveaux/lecons_seconde.py` ; les pages du brevet dans `tools/niveaux/brevet.py`. Après une correction, `python3 tools/niveaux/generer.py` régénère toutes les pages de ces deux niveaux, les versions sans JavaScript et la normalisation du site. Ne pas corriger directement les fichiers HTML de `troisieme/` et `seconde/` : la prochaine génération les écraserait.

## Calendrier des programmes à surveiller

| Rentrée | Changement | À faire sur le site |
| --- | --- | --- |
| 2027 | Programme de Terminale technologique de 2026 (MENE2602921A) | Revoir les leçons et les séries de Terminale avant septembre 2027, mettre à jour `terminale/programme.html` et la couverture |
| 2027 | Nouveau programme de 4e (cycle 4, BO n° 10 du 5 mars 2026) | Aucun changement pour la 3e |
| 2028 | Nouveau programme de 3e (même arrêté) ; brevet 2029 sur ce programme | Revoir les leçons de 3e, `troisieme/programme.html`, la page Brevet et le sujet blanc avant septembre 2028 |

Chaque rentrée, vérifier aussi la note de service de l'épreuve anticipée de Première et la définition de l'épreuve de mathématiques du brevet.

## Choix pédagogiques

- Les leçons sont des rédactions originales, pas des documents ministériels ; elles restent lisibles et imprimables sans JavaScript.
- Les couleurs sont toujours accompagnées d'un mot ou d'une icône.
- Une correction révélée ne rapporte pas de point ; une aide n'est pas une réussite autonome.
- Treize familles d'erreurs typiques reçoivent un retour ciblé. Le message propose une explication possible, pas un diagnostic de l'élève ; une bonne réponse n'est jamais classée comme erreur.
- Le diagnostic de dix questions explore cinq bases, pas tout le programme. Il oriente vers une ressource, sans classement ni verrouillage.
- Suivi local désactivé par défaut. Une fois activé, il garde au plus 500 observations pendant 180 jours, sans réponse brute ni identité, et propose des reprises à 1, 2, 7 puis 21 jours. Export, import, désactivation et effacement sont disponibles.
- L'algorithmique et le tableur sont présentés comme des pratiques du programme, pas comme une option.
- Volontairement absents : compte obligatoire, classement entre élèves, correcteur automatique de copies libres, collecte de données.

## Limites

- Les tests prouvent la justesse des calculs et la stabilité de l'interface, pas l'efficacité pédagogique ; celle-ci demande des essais en classe (voir `validation-humaine.md`).
- axe-core et l'arbre d'accessibilité ne valent pas une conformité RGAA ou WCAG ; une revue avec lecteurs d'écran reste nécessaire.
- Les sujets blancs et les barèmes sont pédagogiques et non officiels.
- Les PDF d'annales restent chez leurs éditeurs et hors du contrôle du site.
- Les informations légales de l'éditeur sont à fournir par le responsable du site.
