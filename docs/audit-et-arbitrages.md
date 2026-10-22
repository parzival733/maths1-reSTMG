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
