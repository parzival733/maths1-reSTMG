# Maintenance

Ce document décrit le fonctionnement du site et les règles à suivre pour le faire évoluer. Le README donne le lancement local et la liste des tests ; `validation-humaine.md` décrit les vérifications qui ne peuvent pas être automatisées.

## Architecture

Site statique, sans framework ni serveur applicatif. Chaque page est un fichier HTML écrit à la main ou produit par un outil du dossier `tools/`, puis normalisé par `tools/finalize_site.py`.

| Emplacement | Contenu |
| --- | --- |
| `index.html`, `lecons.html`, `exercices.html`, `sujets.html` | Accueil et catalogues de Première (sélecteur de niveau) |
| `cours/`, `exercices/` | 16 leçons et 16 séries de Première |
| `terminale/` | Catalogues, programme, 9 leçons et 9 séries de Terminale (`t-*`) |
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
| `variants-*.js`, `terminale-exercices.js` | Modèles d'exercices de Première (par chapitre) et de Terminale |
| `exercices-renderer.js`, `exercices.js` | Affichage des séries, vérification, score, corrections |
| `coaching-*.js`, `fonctions-coaching.js` | Indices progressifs, calculés sur la variante affichée |
| `cours.js`, `apprentissage.js`, `graphiques-interactifs.js` | Sommaire, pauses mémoire, confort de lecture, graphiques |
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

1. Écrire le modèle dans le fichier `variants-*.js` du chapitre (ou `terminale-exercices.js`), en reprenant la forme d'un modèle voisin : `base`, `params`, `accept`, `difficulty`, `verify`, `build`.
2. Ajouter l'exercice d'origine dans le JSON `exercise-data` de la page de la série, avec les mêmes valeurs que `base`.
3. Ajouter ses indices dans le fichier `coaching-*.js` du chapitre.
4. Lancer `python3 tools/build_fallbacks.py` (version de lecture sans JavaScript), puis `python3 tools/finalize_site.py`.
5. Lancer `node tests/test_variants.js` (ou `test_terminale.js`), `node tests/test_rangs.js` et `node tests/test_cloture.js`, puis la batterie complète.

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
| `build_sujets.py` | Catalogue des sujets à partir de `donnees/sujets.json` |
| `build_public.py` | Dossier `public/` publié par Cloudflare Pages (pages, assets, icônes, données liées) ; échoue sur un lien local cassé |
| `update_fingerprints.py` | Liste ou réécrit les empreintes du contenu protégé |
| `prepare_browser.sh` | Vérifie le navigateur de test en intégration continue |

## Tests

| Test | Ce qu'il vérifie |
| --- | --- |
| `validate_site.py` | Structure, liens locaux, exemples des leçons, calculs |
| `test_notation.py`, `test_typographie.py`, `test_noms_liens.py` | Écriture des formules, typographie, noms de liens uniques |
| `test_variants.js`, `test_terminale.js`, `test_terminale.py` | Chaque modèle sur 2 000 graines : validité, reproductibilité, variété, bande de difficulté, recalcul indépendant |
| `test_rangs.js` | Les rangs demandés changent d'une variante à l'autre |
| `test_cloture.js`, `test_cloture.py`, `test_domaines.js` | Domaines de définition, pièges de réponses fausses, sujets blancs |
| `test_graphiques.js`, `test_calcul_rapide.*`, `test_countdown.js` | Graphiques, calcul rapide, chrono |
| `test_acquis.js`, `test_parcours.js`, `test_evolution.py` | Suivi local, diagnostic, révision, empreintes mathématiques |
| `test_interface.py`, `test_sujets.py`, `test_navigation_simple.py` | Interface, sujets, navigation, contenu protégé |
| `browser_*.py` | Parcours réels dans Chromium, 320 à 1 440 px, sans JavaScript, accessibilité (axe-core) |
| `test_safari.js`, `browser_validation.py` | Absence de lookbehind bloquant, montants au centime, moteur absent ou incomplet sans faux négatif, suivi à vide et réinitialisation accessible ; `STMG_TEST_BROWSER=webkit` permet le contrôle avec WebKit |
| `check_publication.py` | Site en ligne identique à `public/`, fichiers internes en 404 |

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
