# Maths STMG - Audit, arbitrages et livraison

Date de référence : 23 octobre 2026. Site principal : https://mathstmgdls.pages.dev/.
Dépôt : https://github.com/parzival733/maths1-reSTMG.

## 1. Diagnostic de l'état initial

Architecture HTML/CSS/JavaScript statique, sans framework ni serveur applicatif. Les 25 ressources de cours, 183 modèles par chapitre, 50 pauses mémoire et 54 modèles de calcul rapide constituent une base réutilisable. Les moteurs de variantes, rendu, correction et compte à rebours sont partagés. Les cours et annales sont des documents HTML ; la nouvelle version matérialise aussi les 24 séries auparavant dépendantes du JavaScript. Aucun interpréteur Python lourd n'est ajouté.

Le score de chapitre reste un indicateur de séance. Le nouveau suivi facultatif observe une première tentative autonome, aidée, incorrecte ou une correction consultée. Il ne transforme pas le temps de lecture en note. Les révisions peuvent mélanger les notions sans verrouiller les ressources.

Cloudflare publie la branche main ; gh-pages conserve l'ancienne adresse GitHub. Les URL canoniques désignent le domaine Cloudflare. Le contrôle public compare les octets publiés, les statuts HTTP, le sitemap et les en-têtes ; il est distinct des tests locaux.

## 2. Points forts préservés

Les contenus des banques mathématiques antérieures sont protégés par empreinte. Sont conservés les exemples progressifs, variantes numériques, corrigés, aides, pauses mémoire, simulations, graphiques manipulables, mode lecture, agrandissement, impression, chronomètre réglable et navigation libre. Les additions de Python en Terminale n'effacent aucun exemple existant. Les ressources d'archives restent chez leurs éditeurs.

## 3. Problèmes avérés et preuves

| Constat initial | Preuve | Traitement |
| --- | --- | --- |
| URL inexistante affichant l'accueil | Absence de 404.html, repli Cloudflare observé | 404.html et assertion HTTP 404 dans check_publication.py |
| Absence de sitemap et de canonical | Inventaire du dépôt et métadonnées | Finaliseur idempotent, robots.txt et sitemap comparé aux sources |
| Aucun suivi entre les séances | Set de validation dans exercices.js uniquement | assets/acquis.js : stockage facultatif local et effaçable |
| Atelier présenté comme facultatif | Ancien titre et attentes de tests | Atelier numérique, caractère transversal explicite |
| Annales historiques sans préparation actuelle complète | sujets.html : 41 PDF historiques, sans corrigés | Repères de cohorte, 8 problèmes et 2 sujets blancs originaux corrigés |
| Tests navigateur interrompus par installation système | Journal de la relance main du 22 octobre | Chrome déjà installé, vérification de lancement, réception complète |
| Contrôle de domaine principalement textuel | Ancien test_domaines.js par expressions régulières | Contrats sémantiques explicites, parcours des cycles finis, faux cas volontairement rejetés |

Aucune erreur de domaine n'a été inventée pour justifier une réécriture. Les extrapolations explicitement demandées en statistiques ne sont pas des images hors d'un domaine interdit : la plage observée ne définit pas automatiquement le domaine du modèle.

## 4. Adaptations pédagogiques et conformité

### Textes et cohortes

- Première 2026-2027 : arrêté du 26 février 2026, BO du 2 avril, MENE2602918A : https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602918A.
- Terminale 2026-2027 : programme 2019 : https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf.
- Terminale 2027-2028 : arrêté 2026 MENE2602921A, entrée en vigueur en septembre 2027 : https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602921A.
- Épreuve anticipée passée en 2027, pour la session 2028 : note du 11 septembre 2026 : https://www.education.gouv.fr/bo/2026/Special4/MENE2622640N.

La couverture des trois cohortes est explicite dans couverture.html et donnees/couverture-programme.json. Les statistiques affines et le conditionnement de Première constituent des rappels dans le parcours Terminale : il ne faut pas supprimer ces rappels pour la cohorte encore issue de l'ancien programme. Le nouveau programme de Terminale prolonge notamment les ajustements par changements de variable, les sommes, exponentielles, logarithmes, inverse et probabilités. Les activités réservées à STD2A ne deviennent pas des obligations STMG.

L'épreuve anticipée dure deux heures, sans calculatrice : six points de réponses courtes et quatorze points de problèmes. Les deux points de langue sont inclus dans vingt. Les anciens QCM 2026 ne sont pas présentés comme des modèles inchangés de l'épreuve 2027. Les annales Terminale 2017-2020 sont des ressources historiques, pas une épreuve finale actuelle équivalente.

### Diagnostic et suivi

Le diagnostic de dix questions explore cinq bases, et non l'ensemble du programme. Chaque résultat conduit à une ressource, sans classement définitif ni interdiction d'accès. Les 26 familles de notions du suivi ont chacune au moins un modèle dans les révisions ; cette couverture par famille ne signifie pas que tous les types de raisonnement sont automatisés.

Le suivi est désactivé par défaut. Il conserve au plus 500 observations pendant 180 jours, sans réponses brutes ni identité, et purifie les traces expirées lors de l'utilisation. Une question identique n'apporte pas une nouvelle preuve autonome dans les 24 heures. Des reprises espacées de 1, 2, 7 puis 21 jours sont une règle transparente, pas une mesure psychométrique validée. Les réussites différées et aidées restent distinctes. Export/import, désactivation et effacement sont disponibles. Aucune synchronisation automatique entre appareils ou domaines.

### Correction et raisonnement

Treize familles d'erreurs reconnaissables sont accompagnées de retours ciblés : fractions, taux successifs, image/antécédent, rang de suite, croissance géométrique, pente, dérivée, moyenne pondérée, signe d'un inverse, logarithme, population conditionnelle et borne de range. Le message indique une explication possible, non un diagnostic certain de l'élève. Les tests excluent les réponses correctes de ces détections.

Les huit problèmes et les deux sujets blancs travaillent choix de méthode, détection d'erreur, justification et interprétation en contexte. L'élève rédige sur feuille puis compare au corrigé et au barème. Il n'est pas prétendu qu'un algorithme puisse noter automatiquement toute copie. Les automatismes conservent une aide courte. Les sujets sont originaux et non officiels ; les barèmes sont pédagogiques.

### Algorithmique

Les ressources restent regroupées sans être présentées comme une option du programme. Des liens explicites rattachent l'interpolation exponentielle et la comparaison d'ajustements aux fonctions Python et au tableur. Les nouveaux exemples testent la moyenne géométrique des ordonnées et la recherche d'un minimum parmi un ensemble fini de candidats ; aucune preuve de minimum global n'est implicitement revendiquée.

## 5. Scénarios comparés et arbitrage retenu

| Critère | A : sécuriser | B : évolution structurée, retenue | C : plateforme avancée |
| --- | --- | --- | --- |
| Modifications | 404, cohorte, tests, accessibilité ciblée | A + diagnostic, suivi local, révisions, rédaction et sujets blancs | B + adaptation approfondie et synchronisation éventuelle |
| Gain | Fiabilité et clarté | Orientation, remédiation, rappel différé et transfert | Gain conditionnel à démontrer par les usages |
| Difficulté | Faible | Moyenne | Forte |
| Risque | Liens et styles | Interprétation des acquis, état local | Données, comptes, algorithme opaque |
| Maintenance | Faible | Modérée, banques et tests | Importante, serveur et migrations |
| Confidentialité | Inchangée | Local, facultatif et supprimable | Risques supplémentaires si collecte |
| Vigilance | Ne pas refaire la charte | Ne pas confondre score et maîtrise | Prouver le besoin avant investissement |
| À éviter | Refonte opportuniste | Parcours obligatoires | Comptes forcés, classement, notation libre par IA |

Le scénario B a été autorisé par le propriétaire et réalisé progressivement. C n'est pas un engagement de livraison caché ni un manque à combler pour clore B.

## 6. Priorités, modules et validation

| Adaptation | Problème | Impact pédagogique | Complexité | Risque | Priorité | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| Domaines et calculs | Consigne potentiellement invalide | Très fort | Moyenne | Faible | P0 | 183 modèles, cycles finis et contraintes explicites, cas faux rejetés |
| Publication et 404 | Faux accueil, fichiers incohérents | Moyen | Faible | Faible | P0 | HTTP exact et empreintes comparées |
| Cohortes et archives | Mauvais format d'examen | Très fort | Faible | Faible | P0 | Trois cohortes, sources et avertissements |
| Accès clavier/lecture | Obstacle à une action | Fort | Moyenne | Moyen | P1 | Liens d'évitement, noms accessibles, reflow et espacement |
| Raisonnement et sujets blancs | Calcul sans justification | Très fort | Moyenne | Faible | P1 | Recalculs indépendants, corrigé et barème cohérents |
| Python/tableur transversal | Activité confondue avec option | Fort | Faible | Faible | P1 | Exemples exécutés et liens contextuels |
| Diagnostic et erreurs | Difficulté non identifiée | Fort | Moyenne | Moyen | P1 | Dix questions, ressources liées, aucun verrouillage |
| Révisions espacées | Réussite momentanée | Fort | Moyenne | Moyen | P2 | Délai, non-double-comptage et stockage réel |
| SEO et performance | Découverte et lenteur | Moyen | Faible | Faible | P2 | Sitemap, canoniques, budget de chargement mesuré |
| Plateforme avancée | Aucun besoin encore démontré | Incertain | Forte | Fort | P3 | Non retenue |

Lots indépendants : (1) hébergement et métadonnées ; (2) fiabilité des moteurs ; (3) sujets et barèmes ; (4) diagnostic et feedback ; (5) suivi local ; (6) réception transversale. Le suivi dépend des identifiants stables des notions, pas de la publication des annales. Les cours restent accessibles si le suivi est indisponible.

Modules : assets/acquis.js, parcours-data.js, parcours.js, progres.js, suivi-exercices.js, outils de finalisation et nouveaux tests test_cloture.* / browser_cloture.py. Les pages de couverture ne changent pas les moteurs existants. Les workflows emploient le navigateur déjà installé quand il est disponible, sans télécharger systématiquement des paquets système.

Non-régression : les six suites navigateur existantes restent obligatoires, ainsi que les tests des banques, scores, indices, impression, chronomètres, données locales et rendus sans JavaScript. Les changements intentionnels des trois cours Terminale et du contrôle de navigation au chargement et les corrections de rôles ARIA (sans changement de texte) sont les seules empreintes protégées renouvelées dans ce lot.

Retour arrière : sauvegarde backup/avant-cloture-20261023 au commit 6249d85afe5526a4fa81a71e9d9213101028f8e5. Revenir à un déploiement Cloudflare validé ou utiliser un commit de revert. Ne pas forcer main et ne pas effacer les progrès des élèves. La clé de stockage et sa version restent compatibles.

## 7. Cinq adaptations au meilleur rapport bénéfice / complexité

1. **Repères de cohortes et d'examen** : quelques textes et liens empêchent de travailler un mauvais format ou de confondre une archive avec un sujet actuel.
2. **Tests de domaine et validation des réponses** : exploiter les cycles finis des générateurs couvre les paramètres possibles sans refaire les banques.
3. **Retours sur erreurs typiques** : treize familles d'erreurs donnent des pistes précises en réutilisant la correction existante, sans IA ni transmission des réponses.
4. **Petit ensemble de problèmes rédigés et barèmes** : huit activités et deux sujets complets travaillent le transfert mieux qu'une accumulation de calculs semblables.
5. **Suivi local facultatif avec reprises différées** : réutiliser les observations des exercices pour indiquer quoi revoir, sans compte ni tableau de bord surchargé.

## 8. Fonctions volontairement non développées

Pas de refonte en framework, de base de données centrale, de compte obligatoire, de classement entre élèves, de diagnostic permanent de niveau, de correcteur IA de copies libres, de génération incontrôlée de sujets ou de rappels intrusifs. Aucune de ces fonctions n'a un bénéfice démontré pour le problème actuel.

## 9. Recommandation et limites de réception

Conserver cette architecture et ce périmètre B. La réception logicielle s'appuie sur des preuves reproductibles ; l'efficacité en classe n'est pas une propriété que les tests unitaires puissent certifier. L'observation d'élèves et la relecture par un professeur tiers sont décrites dans validation-humaine.md, sans prétendre qu'elles ont été réalisées.

La conformité intégrale RGAA/WCAG n'est pas attestée par axe ou par l'arbre d'accessibilité. Les PDF tiers restent hors contrôle. Les informations civiles de l'éditeur doivent être fournies et validées par celui-ci. Ces réserves sont explicites ; elles ne sont ni masquées ni remplacées par un pourcentage fictif d'achèvement.

## 10. Lot 1 du 5 novembre 2026 : variantes à graine et niveau stable

### Diagnostic vérifié dans le code

- `assets/exercices.js` tirait un décalage `offset` (0 à 23) au chargement, puis chaque « Nouvelle variante » faisait `cycle++` ; `pad(c) = 2 + (c % 24)` donnait un paramètre `k` qui augmentait de 1 à chaque clic et revenait de 25 à 2. La Terminale faisait de même avec `make(1 + (cycle − 1) % 24)`. La suite était prévisible et limitée à 24 états.
- Les paramètres dérivaient presque tous de `k` (`k + n`, `a × k`, `1 + k % 3`) : la taille des nombres changeait d’un clic à l’autre (par exemple `derivees`, exercice 6 : x jusqu’à 35 et C(35) ≈ 4 790 sans calculatrice), les signes étaient figés et les réponses à choix toujours les mêmes (« Vers le haut », « Négatif », « Non »…).

### Ce qui a été construit

- `assets/exercices-variants.js` : générateur mulberry32 à graine (`int`, `pick`, `sign`, `shuffle`, `chance`, `pickDistinct`, `nonZero`) ; graine de chaque variante par `crypto.getRandomValues` (repli `Date.now()`) ; `pad()` supprimé. Modèles déclaratifs `{base, params, accept, difficulty, build, verify}` ; le moteur retire jusqu’à 200 fois un tirage refusé ou hors de la bande de ±20 % autour du score de l’exercice d’origine (`base`). Signature indépendante de l’ordre des valeurs, mémoire des 10 dernières variantes, refus d’une même bonne réponse à choix trois fois de suite. Utilitaires d’écriture (`num`, `signed`, `term`, `poly`, `fact`, `affine`, `frac`, `eur`, `diff`) et contrôle des motifs interdits (`lint`). Corrigés `C(méthode, calculs, conclusion)` et tableaux de signes et de variations accessibles.
- Les 129 modèles de Première (six fichiers `variants-*.js`) et les 54 modèles de Terminale (`terminale-exercices.js`) sont réécrits sous cette forme ; les aides (`coaching-*.js`, `fonctions-coaching.js`) ont été relues pour rester justes quand un signe, un rang ou un contexte change.
- Calcul rapide et révision guidée : audit sur 2 000 graines par modèle. Corrections d’écriture (signe moins, exposants et indices Unicode, parenthèses seulement autour des négatifs, plus de « 1x » ni de « + 0 »), fractions de l’énoncé toujours irréductibles (`g-fraction-denominateur` n’utilise plus que des numérateurs impairs ; somme, produit, quotient, arbre et espérances de même), réponses nulles triviales écartées, résultats de calcul mental ramenés sous 200 sauf pour les trois « astuces » ×25, ×99 et ×100, plafonnées à 1 000. Les réponses s’affichent avec le signe moins et la virgule.

### Empreintes de contenu protégé mises à jour (après relecture)

`python3 tools/update_fingerprints.py` liste les entrées modifiées ; `--write` les réécrit. Entrées mises à jour dans ce lot :

- `tests/evolution-mathematics.json` : `assets/variants-{fonctions,suites,analyse,probabilites,reperes,donnees}.js`, `assets/coaching-{algebre,suites,analyse,probabilites,reperes,donnees}.js`, `assets/terminale-exercices.js`, `assets/calcul-rapide-data.js`. Justification : réécriture voulue des générateurs (graine, bande de difficulté, variété, corrigés structurés) et des aides devenues inexactes avec les nouvelles variantes.
- `tests/interface-content.json` : les mêmes modules, plus `assets/exercices-variants.js`, `assets/exercices.js`, `assets/exercices-renderer.js`, `assets/fonctions-coaching.js` et la zone `<main>` des neuf pages `terminale/exercices/t-*.html`. Justification : nouveau moteur, intégration dans la page (mémoire anti-répétition, signe moins dans les solutions révélées, tableaux hors paragraphe) ; dans les pages Terminale, seule la version sans JavaScript change, régénérée par `tools/build_fallbacks.py` à partir des exercices d’origine désormais corrigés selon la structure Méthode → Calculs → Conclusion.
- Les énoncés JSON des 15 pages d’exercices de Première (variante 1) ne changent pas dans ce lot.

## 11. Lot 2 du 5 novembre 2026 : des corrigés qui montrent la méthode

### Ce qui a changé

- **Exercices d’origine de Première (variante 1)** : les 120 exercices décrits en JSON et les 9 exercices écrits en HTML de la page Fonctions reçoivent un corrigé Méthode → Calculs → Conclusion. `tools/original_corrections.js` applique le modèle déclaratif aux paramètres d’origine ; onze exercices dont l’énoncé d’origine emploie d’autres lettres (a et b au lieu de m et p), d’autres unités (unités au lieu de kilogrammes, x sans unité), d’autres groupes (femmes et hommes) ou une lecture graphique sans formule reçoivent un corrigé adapté. `tools/apply_original_corrections.py` écrit le résultat dans les pages ; il est idempotent.
- **Faisable sans calculatrice** : trois énoncés d’origine supposaient une calculatrice. Ils donnent maintenant la valeur utile, comme leurs variantes : 1,2¹⁰ ≈ 6,19174 (`suites`, exercice 8), 1,1¹⁰ ≈ 2,59374 (`suites-geometriques`, exercice 7) et √2 ≈ 1,414 (`statistiques-descriptives`, exercice 5).
- **Artefact corrigé** : trois libellés s’affichaient « Premier rang &amp;lt; 230 », « P(X &amp;gt; 0) » et « x² &amp;gt; 0 pour tout x », car le moteur échappe les libellés. Ils sont écrits avec les caractères < et >, et un test refuse désormais toute entité dans un libellé.
- **Générateurs** : tableau de signes pour la parabole lue sur un graphique et pour la comparaison de deux tarifs (signe de B(t) − A(t)), tableau de variations pour les extremums du second degré ; plus de « 1 × », de « (−1) × 36 », de « + (−24) », de « 5 × −22/2 » ni de « 13/1 » (nouvel utilitaire `times`) ; fraction simplifiée (3/6 = 1/2) ; valeur exacte 0,0625 au lieu de « ≈ 0,063 » ; « au millième » rattaché à la bonne probabilité ; notation unique P(D | T) dans un même corrigé ; conversion « 18 m/s = 64,8 km/h » réparée ; « Card(A) » n’est plus mis en minuscule.
- **Sujet blanc 1** : consignes précisées (question 2 : tableau de signes ; question 4 : signe de B′ puis tableau de variations ; exercice 2, question 6 : deux choix avec remise, donc indépendants, de probabilité de succès P(S sachant A)). Couverture ajustée sans changer le format 6 + 14 points : l’automatisme 3 devient une proportion statistique, les automatismes 9 et 10 deviennent des suites en contexte (abonnés, visiteurs). Corrigé complet avec tableaux de signes, de variations et tableau croisé, conclusions rédigées avec l’unité (« Le bénéfice maximal est de 16 centaines d’euros, soit 1 600 €, atteint pour une production de 60 objets »). L’exemple du cahier des charges parlait de 600 objets ; dans ce sujet, x est en dizaines d’objets, donc x = 6 correspond à 60 objets.
- **Grille de maîtrise de la langue** (sujets blancs 1 et 2) : quatre critères de 0,25 point, un exemple de réponse valorisée et un exemple de réponse pénalisée.
- **Sujet blanc 2 et 8 problèmes** : même relecture (structure, tableaux, unités, signe moins typographique). Repère de temps et liste des notions couvertes en tête de chaque sujet blanc.
- **Série papier du calcul rapide** : les douze corrigés suivent la même structure.
- `donnees/entrainements.json` reste synchronisé (énoncés, réponses, piles de recalcul, corrigés en texte brut) ; les références indépendantes de `tests/test_cloture.py` suivent les automatismes modifiés.
- Les styles des tableaux de signes passent de `exercices.css` à `cours.css`, chargée aussi par les sujets, les problèmes et les leçons.

### Empreintes de contenu protégé mises à jour (après relecture)

Relecture faite en comparant, pour chaque exercice d’origine, l’ancien et le nouveau JSON hors corrigé : seuls changent les trois énoncés cités plus haut (valeur donnée ajoutée) et les trois libellés à entité.

- `tests/evolution-mathematics.json` : les 15 pages `exercices/*.html` en JSON (corrigés structurés, trois valeurs données, trois libellés) et les sept générateurs (`variants-*.js`, `terminale-exercices.js`) pour les tableaux et les écritures corrigées.
- `tests/interface-content.json` : les mêmes pages et générateurs, `assets/exercices-variants.js` (utilitaire `times`, options des tableaux), la page `exercices/fonctions.html` (9 corrigés) et la zone `<main>` de `terminale/exercices/t-inverse.html` et `t-statistiques.html`, dont la version sans JavaScript est régénérée avec les corrigés réécrits.

## 12. Lot 3 du 5 novembre 2026 : contenu des leçons

### Écriture des formules

- Nouveau test `tests/test_notation.py` : il refuse dans le texte visible, les attributs lus par les aides et les données JSON les exposants perdus (« log(Ax) = x log(A) », « xa = b », « 10k+1 »), le caractère ^ hors code et les puissances écrites en toutes lettres. Il est lancé par `cloture.yml`.
- Deux explications de pause mémoire écrivaient les puissances en toutes lettres (« 2 puissance −2 », « 10 puissance −3 ») : elles utilisent maintenant 2⁻², 1/2² et 10⁻³. Les autres pages n’avaient pas d’exposant perdu.
- Les graphiques interactifs affichaient le tiret ASCII pour les nombres négatifs : `fmt` écrit désormais le signe moins.

### Logarithme (Terminale)

- Lettres harmonisées : A et B pour les règles de calcul (comme dans les exercices), a, b et x dans les équations a<sup>x</sup> = b ; une phrase « Notations du chapitre » le précise et la méthode en trois étapes reprend log(A<sup>n</sup>) = n log(A).
- Mise en garde « l’inconnue a changé de place » au début de la partie 4 (exposant inconnu : log ; base inconnue : puissance 1/a).
- Tableau de valeurs de log(x) et graphique interactif `data-lab="log"` (configuration ajoutée à `graphiques-interactifs.js`, avec résumé textuel, tableau des valeurs et questions) ; le texte de repli sans JavaScript décrit la courbe.
- Nombre de chiffres : trois étapes (encadrer, appliquer log, conclure), un exemple pas à pas (3 570, puis 2<sup>50</sup>) et une mise en garde chiffrée près d’une puissance de 10 (10 000 et 9 999).

### Probabilités conditionnelles (Première)

- « Une intersection n’est pas une probabilité conditionnelle » est remplacée par une formulation exacte : même numérateur, dénominateurs différents, lien P(A ∩ B) = P(A) × P<sub>A</sub>(B), égalité seulement si P(A) = 1 ou si elles sont nulles.
- La « formule des probabilités totales » est nommée dans l’encadré de formule, et l’exemple de l’article défectueux est présenté comme une « inversion du conditionnement ».
- Terminale, conditionnement : « leur intersection nulle » devient « la probabilité de leur intersection, nulle ».

### Toutes les leçons (16 de Première, 9 de Terminale)

- `tools/lecons.py`, appelé par `tools/finalize_site.py` : encadré « Prérequis » en tête de chaque leçon (les anciennes lignes « Appui(s) » y sont reprises avec leurs liens et remarques ; trois leçons de Première et trois de Terminale qui n’en avaient pas en reçoivent un) et routine de révision datée J+1 / J+7 / J+21 ; les consignes propres aux leçons de Terminale sont conservées sous « Pour cette leçon ».
- `assets/cours.js` : bouton « Afficher / Masquer toutes les corrections (n) », avec annonce pour les lecteurs d’écran ; sans JavaScript, chaque correction reste dépliable séparément.
- Sommaire : il est désormais écrit dans la page (élément `details`, replié par défaut) et `assets/cours.js` le remplit, l’ouvre sur ordinateur et le referme sur téléphone après le choix d’une partie. Il s’intitule « Sommaire de la leçon · n parties » et il est mis en évidence sur téléphone. Les options de lecture et le bouton des corrections sont aussi écrits dans la page ; une règle `noscript` les masque sans JavaScript, la leçon gardant alors toute la largeur.
- Effet mesuré : le sommaire s’affichait d’abord déplié (461 px) puis se repliait sur téléphone, ce qui décalait la leçon. Avec réseau et processeur ralentis, le décalage cumulé (CLS) de `cours/fonctions.html` passe de 0,06 avant le lot et 0,17 pendant le lot à 0 ; le budget de `tests/browser_cloture.py` (≤ 0,1) est respecté.

### Empreintes de contenu protégé mises à jour (après relecture)

`tests/interface-content.json` : la zone `<main>` des 25 leçons (prérequis, routine, contenus listés ci-dessus) et `assets/cours.js`, `assets/graphiques-interactifs.js`. Relecture faite par comparaison de l’ancien et du nouveau `<main>` : seuls changent l’encadré des prérequis (qui remplace la ligne « Appui(s) »), le bloc de routine et, pour les trois leçons citées, les passages listés.

## 13. Lot 4 du 5 novembre 2026 : choix d’ergonomie revus

- **Impression du corrigé (calcul rapide)** : `beforeprint` ne retire plus aucun point. Le corrigé imprimable s’obtient librement après « Terminer la série » ; avant, cocher la case ouvre une confirmation dans la page (sans `window.confirm`) qui explique la conséquence. Les points ne sont figés qu’au clic sur « Oui, figer mes points » ; « Annuler » laisse le score intact. Tests : `browser_calcul_rapide.py` (annulation sans effet, impression sans confirmation sans effet, confirmation qui fige) et `browser_evolution.py`.
- **Chronomètre** : `QuickCountdown.autoPause` (dans `compte-rebours.js`) met en pause un compte à rebours en cours quand l’onglet est masqué. Le calcul rapide affiche « Pause automatique : tu as quitté l’onglet » avec un bouton « Reprendre » dans l’écran de pause ; le temps restant est conservé. Les sujets blancs ont une case « Mettre le chrono en pause si je quitte l’onglet », cochée par défaut, à décocher pour une simulation stricte. Tests : `test_countdown.js` (unité), `test_interface.py` (onglet masqué 26 s : temps restant inchangé, puis reprise).
- **Décomptes** : « 11 chapitres · 4 repères · 1 atelier » (Première) et « 8 chapitres · 1 repère » (Terminale) sur les catalogues, y compris après un filtre ; « 121 exercices de maths + 8 exercices numériques » et « 48 exercices de maths + 6 exercices numériques » dans les métadonnées ; même correction dans `programme.html` et le README.
- **Liens de niveau** : en révision guidée et en diagnostic, seul le lien vers les leçons du niveau choisi reste affiché (`data-level-link`, `parcours.js`) ; les deux restent visibles sans JavaScript.
- **Bouton « Nouvelle variante »** : une phrase visible sur les catalogues d’exercices, le reste dans « En savoir plus : variantes, corrections et score ».
- **Indexation, vérifiée sans changement** : `noindex` ne figure que sur `404`, `mes-progres`, `progresser` (canonical vers `exercices`) et `preparer-bac` (canonical vers `sujets`) ; les 68 pages indexables sont toutes dans `sitemap.xml`.
- Empreinte protégée mise à jour après relecture : `assets/cours.js` (décompte du catalogue).
- Test des aides rendu exact : `browser_smoke.py` exigeait que le troisième indice change à chaque nouvelle variante. Or il cite les données en gras de l’énoncé, que deux variantes peuvent partager (par exemple même fonction, autres abscisses). Le test vérifie désormais que l’indice cite les données de la variante affichée ; il échouait au hasard une fois sur plusieurs dizaines d’exécutions.

## 14. Lot 5 du 5 novembre 2026 : finitions

- **Accueil** : les fragments décoratifs « 01 / ∞ » et « a + b » deviennent « f(2) = 3 » et « 2 + 1 = 3 », lus sur la droite f(x) = x + 1 du dessin (le fragment « 023xy » n’existait plus dans le code). Une question d’accueil (« Combien vaut f(2) ? ») se vérifie avec `assets/accueil.js` ; sans JavaScript, la question et la réponse dépliable restent lisibles et seul le champ disparaît. Une carte présente la section Sujets (41 PDF, 2 sujets blancs, 8 problèmes). L’action principale du bandeau mène à cette question, ce qui supprime les liens en double vers les leçons. `tests/home-art-baseline.json` suit les deux fragments modifiés.
- **Noms accessibles uniques** (`tools/liens_accessibles.py`, appelé par `finalize_site.py`) : les cartes des catalogues se nomment « Commencer la série : Fonctions et droites », « Lire le cours : … », « Ouvrir le repère : … » (texte masqué visuellement, flèche masquée aux lecteurs d’écran) ; de même pour « Leçon », « Exercices », « Reprise ciblée », « Texte officiel applicable », « 6 exercices », « Revoir la leçon associée » et les liens générés par `parcours.js`. Les deux sujets du 12 juin 2026 (sujet et sujet de secours) ont désormais des noms distincts. Plus aucun lien au nom identique ne mène à deux pages différentes.
- **Typographie** : `tools/typographie.py` (HTML statique, données JSON des séries, titres et descriptions) et `assets/typographie.js` (texte produit par JavaScript) appliquent l’apostrophe ’, l’espace insécable avant « : » et dans les guillemets, l’espace fine insécable avant « ; », « ! » et « ? », et l’espace insécable entre un nombre et son unité (€, %, h, min, km, kg…). Le code, les listes déroulantes, les champs et les attributs techniques ne sont pas modifiés. Test de non-régression : `tests/test_typographie.py` (4 893 écarts détectés sur la version précédente, 0 maintenant) et contrôle du texte généré dans `browser_smoke.py`.
- **Métadonnées** : descriptions distinctes pour le diagnostic et la révision guidée, les deux sujets blancs et les neuf paires leçon / série de Terminale ; `validate_site.py` exige une description unique, reprise par `og:description`.
- **Liens redondants** : accueil réorganisé (voir plus haut) ; dans les leçons de Terminale, le lien « Méthodes d’apprentissage » du bas de page doublait « Pourquoi ces méthodes ? » et a été retiré. Les autres répétitions relevées sont des éléments de navigation (fil d’Ariane, choix du niveau, pagination), conservés.
- **Correction pendant le lot** : la consigne « Pour cette leçon » des routines de Terminale a été perdue une fois, l’outil des leçons ne la reconnaissant plus après l’ajout des espaces insécables ; elle est restaurée, l’outil corrigé et `validate_site.py` vérifie sa présence.
- **Empreintes protégées** : toutes les zones protégées changent par la typographie. Relecture faite en ramenant espaces insécables, apostrophes et textes masqués à leur forme simple : il ne reste alors aucun écart, sauf le lien retiré dans les neuf leçons de Terminale.
- **Débordement corrigé** : les textes masqués visuellement placés dans un tableau défilant (programme de Terminale) élargissaient la page à 320–390 px, car leur bloc de référence était la page. `.table-wrap` et `.table-scroll` sont désormais positionnés : la page reste à la largeur de l’écran.
