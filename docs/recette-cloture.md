# Protocole de réception - 23 octobre 2026

## Version et reproductibilité

Base avant clôture : 6249d85afe5526a4fa81a71e9d9213101028f8e5.
Sauvegarde : backup/avant-cloture-20261023. Branche de validation : travail/cloture-20261023.
Le journal Actions du commit livré, et non ce protocole seul, fournit la preuve de réussite. Aucun test supprimé pour transformer un échec en succès.

## Contrôles obligatoires

| Exigence | Contrôle reproductible | Périmètre / limite |
| --- | --- | --- |
| Banques existantes | validate_site.py, test_variants.js, test_terminale.py | 183 modèles, corrections, liens, recalculs indépendants |
| Domaines | test_domaines.js, test_cloture.js | 24 états distincts par modèle, période vérifiée ; contrats et contre-exemples |
| Fractions/arrondis | test_calcul_rapide.*, test_variants.js | fractions équivalentes, virgule, signes, nombres invalides |
| Cohortes | test_cloture.py et couverture-programme.json | Trois cohortes et 26 familles reliées aux ressources |
| Examens | test_evolution.py, test_cloture.py | 24 automatismes exacts, domaines, problèmes, barèmes 20 points |
| Erreurs ciblées | test_cloture.js | Aucune bonne réponse classée comme erreur typique |
| Suivi local | test_acquis.js et browser_evolution.py | Désactivé par défaut, délai, limites, import/export/effacement |
| Non-régression | Six suites navigateur historiques | Première, Terminale, annales, calcul rapide, impression et interface |
| Accessibilité automatique | browser_cloture.py avec axe-core 4.10.3 | Toutes les pages, états de diagnostic/révision ; WCAG A/AA automatisables |
| Clavier et sémantique | browser_cloture.py | Liens d'évitement, arbres accessibles et actions clavier sur parcours représentatifs |
| Agrandissement | browser_cloture.py | Largeur 320 px, texte doublé et espacement WCAG ; pas un test humain complet d'un zoom OS |
| Performance | browser_cloture.py | 8 pages, 3 exécutions, réseau limité et CPU ralenti ; pas de données terrain |
| Publication | check_publication.py | Octets des fichiers critiques, HTTP 404, sitemap, canonical, CSP |

## Mesure de performance

Protocole de laboratoire reproductible : navigateur réel, viewport 390 x 844, cache désactivé, débit descendant 1,6 Mbit/s, montant 750 kbit/s, latence 150 ms, CPU ralenti par quatre. Trois passages par page, médianes conservées. Le serveur local mesure le poids et le comportement du code sans simuler la qualité réelle de chaque réseau mobile.

Budgets de non-régression : 400 Ko transférés au plus, LCP médian au plus 5 s dans ce protocole, CLS au plus 0,1 et réponse de commande au plus 300 ms. La latence de commande mesurée sur deux frames n'est pas une mesure terrain INP. Un budget de 5 s n'est pas une déclaration de bon Core Web Vital. Les valeurs mesurées figurent dans performance.json, pas dans une note inventée.

## Pièces de preuve

Le workflow de réception conserve .qa-cloture/accessibility.json, .qa-cloture/performance.json, des captures mobiles, ainsi que les preuves des suites historiques. Le contrôle de publication produit un artefact distinct. Les avertissements axe marqués incomplete restent des vérifications humaines à interpréter, pas des réussites automatiques.

## Conditions de publication et retour

Ne publier qu'après succès de la réception. Vérifier que main n'a pas changé, avancer sans forcer, attendre et vérifier le déploiement effectif par HTTP. En cas de régression, restaurer un déploiement connu ou créer un revert ; conserver les observations locales des élèves.


## Ecarts observes avant corrections du lot

Le controle initial a detecte dix pages avec des contrastes insuffisants (liens de boutons des neuf lecons Terminale et elements de l'accueil), un debordement du champ d'import au test d'espacement, et un CLS median de 0,36 sur la serie Terminale testee. Le test du premier lien clavier a aussi echoue sur les deux pages d'exercices representatives. Les corrections portent sur la couleur des boutons, la largeur intrinsique du champ fichier, la reservation d'espace avant rendu et l'absence de changement automatique d'ancre au chargement. Le test reste actif pour verifier ces corrections, sans diminuer les seuils.

Les libelles ARIA des groupes de lecture sont portes par un role group explicite. La legende des corrections conserve son texte visible sans aria-label sur un paragraphe generique. Ces modifications de semantique ne changent aucun texte mathematique.

Diagnostic partiel : une question non renseignee ou non interpretable ne constitue pas une erreur mathematique. Seul le bouton explicite "Je ne sais pas encore" enregistre une question passee. Quatre tests navigateur verifient arret immediat, saisie invalide, choix de passer et une reponse valide suivie d'un arret. Le bilan ne conclut pas sur les notions non evaluees.
