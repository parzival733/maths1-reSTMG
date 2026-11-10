# Maths · Première–Terminale STMG

Site de mathématiques en français pour la Première et la Terminale STMG : leçons, séries d'exercices à variantes, calcul rapide, sujets et suivi local facultatif. HTML, CSS et JavaScript statiques, sans framework, sans compte et sans traceur.

**[Ouvrir le site](https://mathstmgdls.pages.dev/)**

| Niveau | Leçons | Exercices |
| --- | --- | --- |
| Première STMG | [16 leçons](https://mathstmgdls.pages.dev/lecons) | [16 séries](https://mathstmgdls.pages.dev/exercices) |
| Terminale STMG | [9 leçons](https://mathstmgdls.pages.dev/terminale/lecons) | [9 séries](https://mathstmgdls.pages.dev/terminale/exercices) |

## Programmes de référence

- **Première, depuis 2026–2027** : arrêté du 26 février 2026, BO n° 14 du 2 avril 2026, NOR [MENE2602918A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602918A).
- **Terminale, en 2026–2027** : programme de 2019, BO spécial n° 8 du 25 juillet 2019, [annexe sur Éduscol](https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf).
- **Terminale, à partir de 2027–2028** : arrêté du 26 février 2026, NOR [MENE2602921A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602921A).
- **Épreuve anticipée de Première** : [note de service du 11 septembre 2026](https://www.education.gouv.fr/bo/2026/Special4/MENE2622640N).

`programme.html`, `terminale/programme.html` et `couverture.html` relient les notions des programmes aux ressources du site. Les leçons sont des rédactions pédagogiques originales, pas des documents ministériels.

## Contenu

- **Leçons** : objectifs, encadrés (définition, méthode, formule, exemple, point de vigilance), deux pauses mémoire, application corrigée, routine de révision ; lisibles et imprimables sans JavaScript.
- **Exercices** : 183 modèles (129 en Première, 54 en Terminale). Chaque nouvelle variante change les nombres et, si besoin, les rangs ou les abscisses demandés, avec un niveau de difficulté stable. Indices progressifs et corrigés Méthode → Calculs → Conclusion.
- **Calcul rapide** : séries de 5 à 20 questions sans calculatrice, avec chrono réglable et fiche imprimable.
- **Sujets** : 41 annales en PDF, liées chez leurs éditeurs ; deux sujets blancs et des problèmes rédigés, avec corrigés et barèmes.
- **Diagnostic, révision guidée, suivi local** : désactivé par défaut ; aucune réponse saisie n'est conservée ni transmise.

Les détails de fonctionnement (variantes, outils, tests, règle des empreintes) sont dans [`docs/maintenance.md`](docs/maintenance.md).

## Structure

```text
*.html, cours/, exercices/        Pages de Première
terminale/                        Pages de Terminale
annexes/, entrainement/           Calcul rapide, sujets blancs et problèmes
donnees/                          CSV Insee et sa provenance ; JSON de référence des outils
assets/                           Feuilles de style, scripts et polices
tools/                            Normalisation des pages et construction de public/
tests/                            Tests Node, Python et navigateur
docs/                             Maintenance et vérifications humaines
```

## Lancement local

Aucun paquet n'est nécessaire pour lire le site :

```sh
python3 -m http.server 8000
```

Après une modification d'une page ou d'un asset :

```sh
python3 tools/finalize_site.py
```

## Tests

Tests structurels et mathématiques (Node et Python 3, sans dépendance) :

```sh
for f in assets/*.js; do node --check "$f"; done
for t in test_variants test_rangs test_graphiques test_terminale test_calcul_rapide \
         test_countdown test_acquis test_parcours test_domaines test_cloture test_safari \
         test_answer_formats; do node tests/$t.js; done
for t in validate_site test_notation test_typographie test_noms_liens test_terminale \
         test_calcul_rapide test_evolution test_cloture test_securite; do python3 tests/$t.py; done
python3 tools/build_public.py
```

Tests dans le navigateur (Playwright et Chromium) :

```sh
python3 -m pip install playwright==1.55.0
python3 -m playwright install chromium
for t in test_navigation_simple test_interface test_sujets browser_smoke browser_terminale \
         browser_calcul_rapide browser_evolution browser_validation browser_global browser_decimal \
         browser_visual; do python3 tests/$t.py; done
npm install --prefix /tmp/stmg-qa axe-core@4.10.3
AXE_PATH=/tmp/stmg-qa/node_modules/axe-core/axe.min.js python3 tests/browser_cloture.py
```

Le workflow `.github/workflows/verification.yml` lance l'ensemble à chaque pull request et à chaque modification de `main`.

`browser_visual.py` compare 39 rendus mobiles et PC, clairs, sombres et sans JavaScript au commit précédent (ou à `VISUAL_BASE_SHA`). Les captures et le rapport restent dans `.qa-visual/`. Une différence volontaire se déclare avec sa justification dans `tests/visual-changes.json` ; elle ne peut pas masquer un changement de géométrie ou de style des champs concernés. Voir la procédure dans `docs/maintenance.md`.

## Publication

Cloudflare Pages publie la branche **`main`** sur https://mathstmgdls.pages.dev/. Le projet doit publier uniquement le dossier `public/`, construit par `tools/build_public.py` : pages, ressources du navigateur, CSV liés par une page, licences des polices et fichiers de configuration de l'hébergeur. Les dossiers `docs/`, `tests/`, `tools/` et `.github/` doivent rester hors de la publication. Le contrôle en ligne ci-dessous vérifie la configuration effective de Cloudflare.

Réglage du projet dans le tableau de bord Cloudflare :

1. Ouvrir https://dash.cloudflare.com, puis **Workers & Pages** et le projet du site (`mathstmgdls`).
2. Onglet **Settings**, section **Build** (ou **Builds & deployments**), bouton **Edit** de **Build configuration**.
3. **Framework preset** : `None`. **Build command** : `python3 tools/build_public.py`. **Build output directory** : `public`. **Root directory** : laisser vide.
4. **Save**. Puis onglet **Deployments**, dernier déploiement de `main`, menu **⋯** → **Retry deployment** (ou pousser un commit sur `main`).
5. Une fois le déploiement terminé : `python3 tests/check_publication.py`. Il vérifie que chaque fichier publié est identique à `public/` et que `/docs/…`, `/tests/…`, `/tools/…`, `/README.md` et `/.github/…` répondent 404.

Le script n'utilise que la bibliothèque standard de Python, présente dans l'image de build de Cloudflare. Il échoue si une page lie un fichier local absent de `public/`. Le workflow `.github/workflows/publication.yml` lance le contrôle après chaque modification de `main`.

## Protection du code et sécurité

Le dépôt GitHub doit être **privé** si son historique, ses outils et ses sources ne doivent pas être librement consultables. Ce réglage se fait par le propriétaire dans **Settings → General → Danger Zone → Change repository visibility**. Conserver l'accès de l'application Cloudflare au dépôt, puis vérifier un nouveau déploiement. Les anciennes copies déjà téléchargées ne peuvent pas être retirées à distance.

Le HTML, le CSS, les scripts et les réponses calculées dans le navigateur restent accessibles aux visiteurs : ils sont nécessaires au fonctionnement hors serveur des exercices. Les minifier ou bloquer le clic droit ne crée pas de protection d'accès. Aucun secret ni clé d'API ne doit être ajouté à ces fichiers.

La construction refuse les liens symboliques, fichiers cachés, archives, sources Python, JSON internes et cartes de sources dans les assets. Les licences des polices restent publiées. `_headers` interdit les scripts externes ou intégrés, les plugins, les cadres et l'intégration du site dans une autre page ; il impose aussi HTTPS, l'isolation des fenêtres et le type déclaré des ressources. Les styles intégrés ne sont autorisés que si leur empreinte SHA-256 correspond exactement à un bloc statique du site (page 404 et versions sans JavaScript). `tools/finalize_site.py` recalcule ces empreintes. Les graphiques et la progression utilisent les propriétés de style définies par les scripts autorisés, sans `unsafe-inline` ni `unsafe-eval`. Les autorisations CORS par défaut de Pages sont retirées : les ressources du site sont utilisées sur leur propre origine.

`tests/test_securite.py` contrôle les exclusions de publication et les en-têtes. `tests/check_publication.py` vérifie les en-têtes réellement reçus et les réponses 404 des fichiers internes. Une réussite locale ne remplace pas ce contrôle après déploiement.

Pour revenir en arrière : redéployer un déploiement Cloudflare précédent, ou ajouter un commit de retour sur `main`. Les progrès enregistrés par les élèves restent dans leur navigateur et ne sont jamais effacés par un déploiement.

## Données et confidentialité

Aucun compte, police distante, publicité ni outil de mesure d'audience. Les réponses sont vérifiées dans le navigateur, sans transmission. Le suivi local, une fois activé, conserve des dates et des catégories de résultats, jamais les réponses saisies ; il s'exporte, s'importe et s'efface depuis la page « Mes progrès ».

`donnees/naissances-france-2018-2023.csv` reprend six totaux annuels de l'[Insee Focus n° 339](https://www.insee.fr/fr/statistiques/8282356) ; champ, unité et période sont décrits dans `donnees/provenance.html`. Les autres données chiffrées des leçons sont fictives.

Les tests vérifient les calculs et l'interface, pas l'efficacité pédagogique ni la conformité RGAA ; les vérifications humaines à mener sont décrites dans [`docs/validation-humaine.md`](docs/validation-humaine.md).
