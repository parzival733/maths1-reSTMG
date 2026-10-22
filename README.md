# Maths · Première–Terminale STMG

Site pédagogique en français, en HTML/CSS/JavaScript statiques. Un même design et les mêmes moteurs pédagogiques, avec **deux parcours séparés**.

**[Ouvrir le site](https://mathstmgdls.pages.dev/)**

| Niveau | Leçons | Exercices |
| --- | --- | --- |
| Première STMG | [Catalogue Première](https://mathstmgdls.pages.dev/lecons.html) | [Séries Première](https://mathstmgdls.pages.dev/exercices.html) |
| Terminale STMG | [Catalogue Terminale](https://mathstmgdls.pages.dev/terminale/lecons.html) | [Séries Terminale](https://mathstmgdls.pages.dev/terminale/exercices.html) |

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

Pour les deux parcours de chapitres, hors annexe de calcul rapide : **25 ressources de cours, 50 pauses mémoire et 183 modèles d'exercices** pour les deux niveaux. Ces nombres incluent les repères transversaux et l'atelier de Première ; il ne s'agit pas de 25 chapitres obligatoires.

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

Aucun compte, police distante, publicité ou traceur ajouté dans le code. Les réponses sont traitées localement sans transmission. Un suivi local facultatif, désactivé par défaut, conserve seulement les dates et catégories de résultats après activation ; jamais les réponses saisies. Les requêtes d’hébergement restent traitées par Cloudflare et les sources externes après clic. Aucun interpréteur Python n'est embarqué : les codes du cours se copient dans un environnement Python 3.

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


## Annexe : calcul rapide sans calculatrice

`annexes/calcul-rapide.html` est une annexe distincte des catalogues de chapitres. L'accueil et les quatre catalogues y donnent acces par la navigation et un encadre. Aucun cours ni exercice existant n'est remplace.

La banque `assets/calcul-rapide-data.js` comprend **54 modeles** : 18 bases generales, 24 calculs lies aux chapitres de Premiere et 12 prolongements Terminale. Le parcours par defaut « Bac Premiere » exclut strictement les 12 modeles Terminale. On peut choisir le niveau, la notion, le calcul mental ou sur feuille et une serie de 5, 10 ou 20 questions. Les tirages sont reproductibles par graine, sans promesse de nouveaute indefinie.

Chaque question comprend un indice, une correction expliquee et un lien vers sa lecon. Le bilan compte seulement les reponses justes au premier essai ; les corrections revelees ne rapportent pas de point. Les fractions equivalentes et les decimaux exacts sont acceptes par comparaison rationnelle (BigInt), sans eval et sans arrondis arbitraires. Le compte a rebours se regle avant le depart, de 15 secondes a 120 minutes. Il se lance explicitement avec la serie, propose pause/reprise et termine la serie a zero en evaluant les reponses deja saisies. Changer d'onglet ne suspend pas le delai. Le mode sans limite reste disponible. Le bilan termine ne peut plus etre modifie en consultant les corrections.

Une fiche imprimable reprend la serie courante. Les corrections sont masquees dans la previsualisation et absentes de l'impression par defaut. Une case permet de les imprimer sur des pages separees ; les reponses non encore validees ne peuvent alors plus rapporter de point. Douze methodes et une serie papier de douze questions restent accessibles sans JavaScript. Aucun compte ni transmission des réponses. Le suivi local facultatif est décrit dans la section Évolution du 22 octobre 2026.

Reference de l'epreuve pour 2026-2027 (session 2028) : [note de service du 11 septembre 2026](https://www.education.gouv.fr/bo/2026/Special4/MENE2622640N), qui prevoit des questions a reponses courtes et interdit la calculatrice. Cette annexe ne constitue ni un sujet officiel ni une preparation exhaustive a toute l'epreuve.

Tests supplementaires :

```sh
node tests/test_calcul_rapide.js
python3 tests/test_calcul_rapide.py
python3 tests/browser_calcul_rapide.py
```

Le script `tools/integrate_calcul_rapide.py` rend l'ajout des liens idempotent. Il n'est pas necessaire pour servir le site : les fichiers publies sont statiques. Le workflow permanent `calcul-rapide.yml` verifie l'annexe en lecture seule.


## Interface et compte à rebours

La présentation commune est dans `assets/interface.css`. Les catalogues affichent le choix du niveau et la recherche avant les précisions dépliables. Les contenus des leçons et des exercices ne sont pas réécrits. `assets/interface.js` replie le sommaire sur petit écran ; le texte du cours reste toujours disponible. Les couleurs sémantiques, les libellés et les contrastes sont conservés avec des surfaces plus neutres.

Dans l’annexe, quatre choix explicites remplacent le menu de parcours. Le réglage du compte à rebours est indépendant du niveau. La durée s’applique à toute la série ; la pause masque les questions. Le bilan enregistre les réponses saisies non encore vérifiées, sans crédit supplémentaire pour les réponses révélées. Un bilan terminé reste figé. L’impression met temporairement en pause un chrono actif et respecte une pause manuelle déjà en cours.

Tests : `node tests/test_countdown.js` et `python3 tests/test_interface.py`. Le fichier `tests/interface-content.json` fige les empreintes des 50 contenus de cours/exercices et de 22 modules pédagogiques de la version précédant le changement visuel. Une future modification pédagogique intentionnelle doit mettre à jour son empreinte après relecture.

Références de conception : [W3C, comprendre les contrôles](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o1-understandable/), [W3C, contenu clair](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/), [WCAG, temps ajustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), [GOV.UK, choix exclusifs](https://design-system.service.gov.uk/components/radios/). Ces choix ne constituent pas une certification WCAG ni une mesure de l’efficacité auprès des élèves.


## Sujets et annales

`sujets.html` est le catalogue statique de 41 PDF : 8 sujets de Première technologique 2026, 2 sujets zéro et 31 archives de Terminale STMG (2017–2020). L’onglet Sujets est présent dans la navigation de toutes les pages. Les niveaux, les programmes et les sources sont distingués. Les corrigés ne sont pas inclus.

Les PDF s’ouvrent chez leur source dans un nouvel onglet, sans iframe, sans copie réhébergée et sans chargement externe avant le clic. Le lecteur PDF permet le téléchargement ou l’impression. APMEP est créditée selon ses [conditions de liens](https://www.apmep.fr/Mentions-legales).

`donnees/sujets.json` conserve les métadonnées et empreintes des fichiers fournis. L’année du filtre est celle de l’épreuve ; le sujet de mars 2019 en Nouvelle-Calédonie reste explicitement rattaché aux archives APMEP 2018. `tools/build_sujets.py` produit le HTML et ajoute les liens de navigation de façon idempotente. Le site ne nécessite pas ce script pour fonctionner.

`assets/sujets.js` ajoute seulement la recherche (sans distinction des accents), le filtre par année et le choix du niveau. Le parcours par défaut est Première ; les 41 liens restent lisibles sans JavaScript. `?niveau=terminale` ouvre directement les archives de Terminale. Aucune réponse ni donnée personnelle n’est stockée.

Contrôles : `python3 tests/test_sujets.py` (structure, contenu, mobile, filtres et navigation) et `python3 tests/check_sujets_sources.py` (vérification réseau explicite des PDF, non nécessaire pour servir le site).


## Evolution du 22 octobre 2026

Architecture statique conservee, sans framework, serveur applicatif, compte eleve ni abonnement. Point de retour : branche `backup/avant-evolution-20261022`, commit `280ae6bac5cc95ac5f665ce6ae2152ec0c9750b5`.

- `progresser.html` : acces libre aux parcours ; `diagnostic.html` : dix questions sur cinq bases, sans categorisation definitive.
- `revisions.html`, `assets/parcours-data.js` : 54 modeles exacts existants et neuf nouveaux modeles ; environ 70 % de questions ciblant les notions representees et 30 % de melange. Les autres notions renvoient aux chapitres ; ne pas promettre une couverture adaptative exhaustive.
- `assets/acquis.js` : opt-in explicite, cle versionnee, 500 traces / 180 jours maximum ; pas de reponses brutes. Les traces expirees sont purgees a la prochaine lecture. Import/export uniquement local, controle de taille/version/types, suppression limitee a la cle du site. Le navigateur prive ou un stockage bloque peuvent empecher la sauvegarde sans bloquer le travail.
- `assets/suivi-exercices.js` : la premiere tentative de chaque question concrete est observee au plus une fois par 24 heures. Une aide ou une correction n'est pas une reussite autonome. Le score de chapitre reste un score de seance, distinct du suivi.
- Reprises proposees : 1 jour apres difficulte/aide ; 2 jours apres reussite recente, puis 7 et 21 jours apres reussites distinctes espacees d'au moins 48 heures. Heuristique transparente a evaluer avec des eleves, non diagnostic psychometrique.
- `preparer-bac.html`, `entrainement/` : deux sujets blancs originaux de Premiere (6+14 points dont 2 de langue), huit problemes rediges dont deux de Terminale. Corriges et baremes pedagogiques, pas de notation automatique des copies ni de certification ministerielle.
- `404.html`, `robots.txt`, `sitemap.xml` et URL canoniques : adresse principale Cloudflare ; aucune redirection destructive depuis l'ancien site. `_headers` ajoute une politique de securite compatible avec les scripts locaux ; ne pas ajouter de code inline executable sans revoir cette politique.
- Accessibilite : tableaux de valeurs des graphiques, messages de correction relies aux champs, menu mobile sur deux lignes ; 24 series initiales sont lisibles sans JavaScript. La conformite RGAA/WCAG n'est pas certifiee et requiert une revue humaine avec lecteurs d'ecran. L'identite et les informations legales de l'editeur doivent etre completees par le responsable selon son statut, sans inventer ces donnees.

Maintenance : `python3 tools/build_fallbacks.py` regenere les lectures sans JavaScript a partir des memes modeles. `python3 tools/build_sujets.py` appelle le finaliseur idempotent ; `python3 tools/finalize_site.py` remet les liens partages et metadonnees. `donnees/entrainements.json` est le jeu de reference arithmetique et de bareme des sujets blancs ; garder ces donnees synchronisees avec les pages HTML.

Validation supplementaire : `node tests/test_acquis.js`, `node tests/test_parcours.js`, `node tests/test_domaines.js`, `python3 tests/test_evolution.py`, `python3 tests/browser_evolution.py`. `tests/evolution-mathematics.json` conserve les empreintes des banques mathematiques anterieures. Les changements volontaires du contenu protege par `interface-content.json` sont documentes : presentation de l'algorithmique, versions sans JavaScript et ameliorations du validateur/retour de saisie. Les generateurs mathematiques et les enonces JSON initiaux restent inchanges.

Retours arriere : commencer par un deploiement de previsualisation. Un retour en production peut utiliser le dernier deploiement Cloudflare valide, ou un commit de revert de cette evolution ; ne pas forcer `main` ou ecraser des changements concurrents. Les sauvegardes locales des eleves ne sont jamais supprimees par un deploiement de code ; leur schema reste versionne.
