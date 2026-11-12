"""Génère les pages de 3e (leçons, séries, catalogues, programme). Les pages sont
ensuite normalisées par tools/finalize_site.py."""
import sys, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lecons_troisieme import LESSONS

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'troisieme'

DOMAIN_LABEL = {'nombres': 'NOMBRES ET CALCULS', 'fonctions': 'DONNÉES ET FONCTIONS', 'statistiques': 'STATISTIQUES',
                'probabilites': 'PROBABILITÉS', 'geometrie': 'GRANDEURS ET GÉOMÉTRIE', 'reperes': 'ALGORITHMIQUE'}
FOOTER = lambda base: ('<footer class="site-footer"><div class="container footer-inner"><p><strong>maths.</strong> Comprendre, puis pratiquer.</p>'
          '<p>Mathématiques · 3e, Seconde, Première et Terminale STMG</p></div>'
          f'<div class="container footer-links"><a href="{base}troisieme/exercices.html#mes-progres">Mes progrès</a> · <a href="{base}a-propos.html">À propos et données</a> · <a href="{base}accessibilite.html">Accessibilité</a></div></footer>')
BRAND = lambda base: (f'<a class="skip-link" href="#contenu">Aller au contenu</a><header class="site-header"><div class="container header-inner">'
                      f'<a class="brand" href="{base}index.html" aria-label="Maths, accueil"><span class="brand-mark" aria-hidden="true">m<span>.</span></span><span>maths<span class="brand-dot">.</span></span></a>')


def nav(base, here, current):
    # base : chemin vers la racine ; here : chemin vers troisieme/.
    items = [(f'{base}index.html', 'Accueil', 'home'), (f'{here}lecons.html', 'Leçons', 'lecons'),
             (f'{here}exercices.html', 'Exercices', 'exercices'), (f'{here}brevet.html', 'Brevet', 'brevet'),
             (f'{base}annexes/calcul-rapide.html', 'Calcul rapide', 'rapide')]
    out = []
    for href, label, key in items:
        cur = ''
        if key == current[0]:
            cur = f' aria-current="{current[1]}"'
        out.append(f'<a href="{href}"{cur}>{label}</a>')
    return '<nav class="main-nav" aria-label="Navigation principale">' + ''.join(out) + '</nav></div></header>'


def head(title, description, base, sheet, scripts, extra=''):
    js = ''.join(f'<script src="{base}assets/{s}" defer></script>' for s in scripts)
    return (f'<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            f'<title>{title}</title><meta name="description" content="{description}">'
            f'<link rel="stylesheet" href="{base}assets/{sheet}.css">{js}{extra}</head>\n')


def num(i):
    return f'{i:02d}'


LEVELS = [('troisieme', 'troisieme/', '3e'), ('seconde', 'seconde/', 'Seconde'), ('premiere', '', 'Première STMG'), ('terminale', 'terminale/', 'Terminale STMG')]
# Sur téléphone, les libellés longs restent lus par les lecteurs d'écran ; seule la version courte est affichée.
SHORT = {'Première STMG': '1re STMG', 'Terminale STMG': 'Tle STMG'}


def level_label(name):
    if name not in SHORT:
        return name
    return f'<span class="level-long">{name}</span><span class="level-short" aria-hidden="true">{SHORT[name]}</span>'


def switch(kind, root, current, label):
    # Sélecteur à quatre niveaux ; root : chemin vers la racine du site.
    links = ''.join(f'<a href="{root}{folder}{kind}.html"' + (' aria-current="page"' if key == current else '') + f'>{level_label(name)}</a>' for key, folder, name in LEVELS)
    return f'<nav class="level-switch" aria-label="{label}">{links}</nav>'


def level_switch(kind, base_root, label):
    return switch(kind, base_root, 'troisieme', label)


def quiz(n, q):
    _, title, question, options, correct, hint, explanation = q
    labels = ''.join(f'<label><input type="radio" name="s{n}" value="{"abc"[i]}">{o}</label>' for i, o in enumerate(options))
    return (f'<section class="study-quiz" data-correct="{correct}" data-hint="{hint}" data-explanation="{re.sub("<[^>]+>", "", explanation)}">'
            f'<h3>Pause mémoire · {title}</h3><p>{question}</p><form hidden><fieldset><legend>Choisis une réponse.</legend>{labels}</fieldset>'
            f'<button class="study-submit" type="submit">Vérifier ma réponse</button><p class="study-feedback" role="status"></p></form>'
            f'<details class="study-solution"><summary>Voir le raisonnement et la réponse</summary><p>{explanation}</p></details></section>')


def lesson_page(i, L):
    slug, title = L['slug'], L['title']
    code = 'REPÈRE TRANSVERSAL' if L.get('transversal') else num(i)
    description = f'Leçon de 3e, {title} : {L["lead"][0].lower() + L["lead"][1:]} Méthodes, exemples et pauses mémoire corrigées.'
    h = head(f'{title} · 3e | Maths', description, '../../', 'lecon',
             ['cours.js', 'apprentissage.js', 'interface.js', 'acquis.js', 'suivi-exercices.js'])
    body = [f'<body class="lesson-immersive college-course" data-course="{slug}">', BRAND('../../'), nav('../../', '../', ('lecons', 'location')),
            f'<main id="contenu" class="container lesson-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../lecons.html">Leçons de 3e</a><span>/</span><span aria-current="page">{"Repère" if L.get("transversal") else "Chapitre " + num(i)}</span></nav>',
            f'<header class="lesson-heading"><p class="eyebrow">3e · {code} / {DOMAIN_LABEL[L["domain"]]}</p><h1>{title}</h1><p class="lead">{L["lead"]}</p>'
            '<div class="learning-path"><span><b>1</b> Je comprends</span><span><b>2</b> Je vérifie</span><span><b>3</b> Je m’entraîne</span></div></header>',
            switch('lecons', '../../', 'troisieme', 'Niveau'),
            '<div class="lesson-reading-controls"><span>Mon confort de lecture</span><button id="reading-large-toggle" type="button" aria-pressed="false">Agrandir le texte</button>'
            '<button id="reading-focus-toggle" type="button" aria-pressed="false">Lecture concentrée</button><a href="../../pedagogie.html">Pourquoi ces méthodes ?</a></div>',
            '<div class="lesson-layout"><aside class="lesson-toc" id="sommaire-lecon"></aside><article class="lesson-content">',
            f'<section class="objectives"><h2>Ce que tu vas savoir faire</h2><p>{L["objectives"]}</p></section>',
            '<details class="support-scaffold"><summary>Besoin d’un coup de pouce ? La méthode en 3 étapes</summary><ol>' + ''.join(f'<li>{s}</li>' for s in L['steps']) + '</ol></details>']
    for k, (h2, html) in enumerate(L['sections'], 1):
        body.append(f'<h2>{k}. {h2}</h2>{html}')
        if L['quiz1'][0] == k:
            body.append(quiz(1, L['quiz1']))
        if L['quiz2'][0] == k:
            body.append(quiz(2, L['quiz2']))
    k = len(L['sections']) + 1
    q, a = L['check']
    body.append(f'<h2>{k}. Vérifier sa compréhension</h2><p>{q}</p><details class="check"><summary>Afficher la correction</summary><p>{a}</p></details>')
    body.append(f'<div class="recap"><h2>À retenir</h2><p>{L["recap"]}</p></div>')
    body.append(f'<p><a class="button button-primary" href="../exercices/{slug}.html">Faire les 6 exercices →</a></p>')
    body.append('<section class="study-review" aria-label="Routine de révision"><h2>Ta routine de révision</h2><p>Reprends cette leçon demain, dans une semaine, puis dans trois semaines.</p></section>')
    body.append('<p><a href="../programme.html">Programme et sources</a></p></article></div>')
    prev = ('../lecons.html', '← Catalogue 3e') if i == 1 else (f'{LESSONS[i - 2]["slug"]}.html', '← ' + LESSONS[i - 2]['title'])
    nxt = (f'{LESSONS[i]["slug"]}.html', LESSONS[i]['title'] + ' →') if i < len(LESSONS) else ('../exercices.html', 'Toutes les séries de 3e →')
    body.append(f'<nav class="course-pagination" aria-label="Navigation entre les leçons"><a href="{prev[0]}">{prev[1]}</a><a href="{nxt[0]}">{nxt[1]}</a></nav></main>')
    body.append(FOOTER('../../') + '</body></html>\n')
    return h + ''.join(body)


def series_page(i, L):
    slug, title = L['slug'], L['title']
    description = f'{title} : 6 exercices interactifs de 3e, avec variantes tirées au hasard, indices et corrigés rédigés.'
    h = head(f'Exercices · {title} · 3e', description, '../../', 'serie',
             ['exercices-variants.js', 'troisieme-exercices.js', 'exercices-renderer.js', 'exercices.js', 'interface.js', 'acquis.js', 'suivi-exercices.js'])
    code = 'REPÈRE' if L.get('transversal') else num(i)
    body = [f'<body class="exercise-page">', BRAND('../../'), nav('../../', '../', ('exercices', 'location')),
            f'<main id="contenu" class="container interactive-exercise-page" tabindex="-1" data-interactive-exercises data-generated-exercises data-troisieme-chapter="{slug}">'
            f'<nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../exercices.html">Exercices de 3e</a><span>/</span><span aria-current="page">{"Repère" if L.get("transversal") else "Chapitre " + num(i)}</span></nav>'
            f'<header class="page-intro"><p class="eyebrow">3e · {code} / PARCOURS INTERACTIF</p><h1>{title}</h1><p>Six exercices progressifs : {L["ex_card"][0].lower() + L["ex_card"][1:]} Réponds, vérifie, puis lis les indices ou la correction avant de passer à une variante.</p></header>',
            switch('exercices', '../../', 'troisieme', 'Niveau des exercices'),
            f'<p><a href="../cours/{slug}.html">Revoir la leçon de 3e</a> · <a href="../programme.html">Programme et sources</a></p>',
            '<div id="exercise-mounted"><p>Chargement des exercices…</p></div><script type="application/json" id="exercise-data"></script><noscript><p>La version de lecture sans JavaScript est générée.</p></noscript></main>',
            FOOTER('../../') + '</body></html>\n']
    return h + ''.join(body)


GROUPS = [('nombres', 'Nombres et calculs', 'Calculer avec assurance : entiers, fractions, puissances, expressions et équations.', ['nombres']),
          ('donnees', 'Données, fonctions et hasard', 'Proportionnalité, fonctions, statistiques et probabilités.', ['fonctions', 'statistiques', 'probabilites']),
          ('geometrie', 'Grandeurs et géométrie', 'Mesurer, calculer des longueurs et des angles, transformer des figures.', ['geometrie']),
          ('algorithmique', 'Algorithmique et programmation', 'À mobiliser toute l’année, en lien avec les autres chapitres.', ['reperes'])]
CARD_DOMAIN = {'nombres': 'nombres', 'fonctions': 'fonctions', 'statistiques': 'statistiques', 'probabilites': 'probabilites', 'geometrie': 'geometrie', 'reperes': 'reperes'}


def card(i, L, kind):
    slug = L['slug']
    code = '3e · REPÈRE TRANSVERSAL' if L.get('transversal') else f'3e · CHAPITRE {num(i)}'
    if kind == 'lecons':
        return (f'<a class="lesson-card" href="cours/{slug}.html" data-category="{CARD_DOMAIN[L["domain"]]}" data-keywords="{L["keywords"]}" aria-labelledby="lien-{slug}">'
                f'<span class="course-code">{code} · 6 EXERCICES</span><h3>{L["title"]}</h3><p>{L["card"]}</p>'
                f'<span class="read-link" id="lien-{slug}">{"Ouvrir le repère" if L.get("transversal") else "Lire le cours"}<span class="sr-only"> : {L["title"]}</span> <span aria-hidden="true">→</span></span></a>')
    return (f'<a class="lesson-card" href="exercices/{slug}.html" aria-labelledby="lien-{slug}" data-category="{CARD_DOMAIN[L["domain"]]}">'
            f'<span class="course-code">{code.replace("CHAPITRE ", "")} · 6 EXERCICES</span><h3>{L["title"]}</h3><p>{L["ex_card"]}</p>'
            f'<span class="read-link" id="lien-{slug}">Commencer la série<span class="sr-only"> : {L["title"]}</span> <span aria-hidden="true">→</span></span></a>')


def groups(kind):
    out = []
    for gid, gtitle, gtext, domains in GROUPS:
        cards = '\n'.join(card(i, L, kind) for i, L in enumerate(LESSONS, 1) if L['domain'] in domains)
        out.append(f'<section class="catalog-group" id="{gid}" aria-labelledby="{gid}-titre"><h2 id="{gid}-titre">{gtitle}</h2><p>{gtext}</p><div class="lesson-cards">\n{cards}\n</div></section>')
    return '\n'.join(out)


RAPID = ('<aside id="annexe-calcul-rapide" class="rapid-entry" aria-labelledby="annexe-calcul-title"><p class="eyebrow">AUTOMATISMES / SANS CALCULATRICE</p>'
         '<h2 id="annexe-calcul-title">Calcul mental et calcul rapide</h2><p>La première partie du brevet se passe sans calculatrice. Le parcours « Automatismes de 3e » du calcul rapide entretient fractions, puissances, équations et géométrie.</p>'
         '<a href="../annexes/calcul-rapide.html?niveau=troisieme">Ouvrir l’annexe de calcul rapide →</a></aside>')


def lessons_catalogue():
    h = head('Les leçons · 3e | Maths', 'Leçons de mathématiques de 3e : arithmétique, calcul littéral, équations, fonctions, statistiques, probabilités, Pythagore, Thalès, trigonométrie et algorithmique.',
             '../', 'catalogue', ['cours.js', 'interface.js'])
    body = ['<body class="has-rapid-link">', BRAND('../'), nav('../', '', ('lecons', 'page')),
            '<main id="contenu" class="container section-page lessons-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../index.html">Accueil</a><span>/</span><span aria-current="page">Leçons · 3e</span></nav>',
            level_switch('lecons', '../', 'Choisir le niveau des leçons'),
            '<header class="page-intro"><p class="eyebrow">COMPRENDRE &amp; RETENIR</p><h1>Les leçons<span class="title-dot">.</span></h1><p>Tout le programme de <strong>3e</strong>, chapitre par chapitre : des méthodes expliquées, des exemples corrigés et des pauses mémoire pour préparer le brevet.</p></header>',
            '<div class="catalog-tools" hidden><label for="course-search">Chercher une notion<input id="course-search" type="search" placeholder="Ex. : Thalès, fraction, médiane…" autocomplete="off"></label>'
            '<label for="course-category">Domaine<select id="course-category"><option value="">Tous les domaines</option><option value="nombres">Nombres et calculs</option><option value="fonctions">Données et fonctions</option>'
            '<option value="statistiques">Statistiques</option><option value="probabilites">Probabilités</option><option value="geometrie">Géométrie</option><option value="reperes">Algorithmique</option></select></label></div>'
            '<p id="result-count" class="result-count" role="status" aria-live="polite">15 chapitres · 1 repère</p><p id="no-results" class="no-results" hidden>Aucune leçon ne correspond. Essaie un autre mot.</p>',
            '<details class="ui-disclosure ui-catalog-help"><summary>Programme et conseils d’utilisation</summary><aside class="programme-note"><p><strong>15 chapitres et 1 repère d’algorithmique.</strong> En 2026–2027, la classe de 3e suit le programme de mathématiques du cycle 4 publié au BO n° 31 du 30 juillet 2020. Le brevet 2027 porte sur ce programme.</p><p><a href="programme.html">Voir les références, la couverture et le format du brevet →</a></p></aside>'
            '<section class="catalog-learning-guide" aria-label="Comment apprendre"><article><span class="guide-number">ÉTAPE 01</span><h2>Je comprends</h2><p>Lis l’exemple guidé et repère les conditions d’utilisation de chaque propriété.</p></article><article><span class="guide-number">ÉTAPE 02</span><h2>Je me teste</h2><p>Essaie les pauses mémoire avant d’ouvrir leur raisonnement.</p></article><article><span class="guide-number">ÉTAPE 03</span><h2>Je m’entraîne</h2><p>Passe aux exercices du chapitre, puis reviens après une pause. <a href="../pedagogie.html">Les méthodes d’apprentissage</a>.</p></article></section></details>',
            groups('lecons'),
            '<aside class="catalog-notice"><h2>Et après la 3e ?</h2><p>Les <a href="../seconde/lecons.html">leçons de Seconde</a> prolongent directement le calcul littéral, les équations, les fonctions et les statistiques : le chapitre <a href="../seconde/cours/2-calcul-algebrique.html">Calcul algébrique</a> est un bon point de départ.</p></aside>',
            RAPID + '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)


def exercises_catalogue():
    h = head('Les exercices · 3e | Maths', 'Exercices interactifs de 3e : 16 séries avec variantes tirées au hasard, indices progressifs et corrigés rédigés, pour préparer le brevet.',
             '../', 'catalogue', ['interface.js', 'acquis.js', 'progres.js'])
    progress = (ROOT / 'tools/templates/inline-progress.fragment').read_text().replace('{base}', '../').replace('{level}', 'troisieme')
    progress = progress.replace('<option value="premiere">Première</option>', '<option value="troisieme">3e</option><option value="seconde">Seconde</option><option value="premiere">Première</option>')
    body = ['<body class="has-rapid-link exercise-page">', BRAND('../'), nav('../', '', ('exercices', 'page')),
            '<main id="contenu" class="container section-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../index.html">Accueil</a><span>/</span><span aria-current="page">Exercices · 3e</span></nav>',
            level_switch('exercices', '../', 'Choisir le niveau des exercices'),
            '<header class="page-intro"><p class="eyebrow">S’ENTRAÎNER &amp; PROGRESSER</p><h1>Les exercices<span class="title-dot">.</span></h1><p>16 séries avec variantes et corrections. Choisis un chapitre et commence.</p></header>',
            progress,
            '<nav class="exercise-category-nav" aria-label="Accéder à un domaine"><a href="#nombres">Nombres et calculs</a><a href="#donnees">Données et fonctions</a><a href="#geometrie">Géométrie</a><a href="#algorithmique">Algorithmique</a></nav>',
            '<p class="catalog-variant-note"><strong>Faire le point</strong> : le <a href="../diagnostic.html?niveau=troisieme">diagnostic de 3e</a> repère en dix questions les bases à revoir ; la <a href="../revisions.html?niveau=troisieme">révision guidée de 3e</a> les reprend ensuite.</p>'
            '<p class="catalog-variant-note"><strong>Nouvelle variante ↻</strong> : après chaque vérification, ce bouton propose le même exercice avec d’autres valeurs, de même niveau. Ton essai reste affiché jusqu’à ton clic.</p>'
            '<details class="ui-disclosure ui-catalog-help"><summary>En savoir plus : variantes, corrections et score</summary><aside class="catalog-notice"><p><strong>Un exercice à la fois.</strong> Réponds, puis clique sur Vérifier. Les valeurs de chaque variante sont tirées au hasard, dans les mêmes limites que l’exercice d’origine.</p>'
            '<p>La correction remplit les champs : <strong>vert</strong> si tu avais juste, <strong>rouge</strong> si la réponse était fausse ou manquante. Une réponse révélée ne donne pas de point. Les scores sont locaux à la page et se réinitialisent au rechargement.</p>'
            '<p>Les fractions et les virgules décimales sont acceptées. Les résultats non exacts sont demandés au centième, sauf indication contraire. La calculatrice est utile pour la géométrie et les grandeurs, comme dans la seconde partie du brevet ; entraîne-toi aussi sans elle pour les automatismes. <a href="brevet.html">Préparer le brevet →</a></p></aside></details>',
            groups('exercices'),
            RAPID + '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)


COVER = {
    '3-arithmetique': 'Diviseurs et multiples ; division euclidienne ; critères de divisibilité ; nombres premiers ; décomposition en facteurs premiers ; fractions irréductibles.',
    '3-fractions': 'Nombres relatifs et priorités ; opérations sur les fractions ; inverse ; comparaison ; fraction d’une quantité.',
    '3-puissances': 'Puissances entières d’un relatif ; puissances de 10 ; notation scientifique ; ordres de grandeur ; préfixes de nano à téra.',
    '3-calcul-litteral': 'Distributivité simple et double ; identités remarquables ; factorisation ; démonstration par le calcul littéral.',
    '3-equations': 'Équations du premier degré ; équations produit nul ; x² = a ; inéquations du premier degré ; mise en équation.',
    '3-proportionnalite': 'Proportionnalité ; pourcentages ; coefficients multiplicateurs ; ratios ; échelles.',
    '3-fonctions': 'Notion de fonction ; image et antécédent ; tableaux de valeurs ; représentation graphique ; modélisation.',
    '3-fonctions-affines': 'Fonctions linéaires et affines ; coefficients ; représentation par une droite ; lien avec la proportionnalité et les pourcentages.',
    '3-statistiques': 'Moyenne, moyenne pondérée, médiane, étendue, fréquences ; comparaison de séries.',
    '3-probabilites': 'Vocabulaire ; équiprobabilité ; événement contraire ; expériences à deux épreuves ; fréquence et probabilité.',
    '3-grandeurs': 'Grandeurs produits et quotients ; vitesse ; conversions ; volumes du pavé, du cylindre, de la pyramide, du cône et de la boule ; sections planes ; repérage dans un pavé et sur la sphère (latitude, longitude).',
    '3-pythagore': 'Théorème de Pythagore, réciproque et contraposée ; distance dans un repère orthonormé.',
    '3-thales': 'Théorème de Thalès et réciproque ; agrandissement et réduction ; triangles semblables.',
    '3-trigonometrie': 'Cosinus, sinus et tangente d’un angle aigu dans un triangle rectangle ; calculs de longueurs et d’angles.',
    '3-transformations': 'Symétries, translations, rotations ; homothéties ; effet d’un agrandissement ou d’une réduction sur les longueurs, les aires et les volumes.',
    '3-algorithmique': 'Variables, boucles, instructions conditionnelles, listes et tracés dans un environnement de programmation par blocs.',
}


def programme_page():
    h = head('Programme et brevet · 3e | Maths', 'Programme de mathématiques de 3e en 2026-2027, format de l’épreuve de mathématiques du brevet 2027 et correspondance avec les leçons et exercices du site.',
             '../', 'page', ['interface.js'])
    rows = '\n'.join(f'<tr><td>{COVER[L["slug"]]}</td><td><a href="cours/{L["slug"]}.html">{"Repère" if L.get("transversal") else num(i)} · {L["title"]}</a></td>'
                     f'<td><a href="exercices/{L["slug"]}.html">6 exercices<span class="sr-only"> : {L["title"]}</span></a></td></tr>' for i, L in enumerate(LESSONS, 1))
    body = ['<body>', BRAND('../'), nav('../', '', ('programme', 'page')),
            '<main id="contenu" class="container section-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="lecons.html">Leçons de 3e</a><span>/</span><span aria-current="page">Programme et brevet</span></nav>',
            '<header class="page-intro"><p class="eyebrow">RÉFÉRENCES · 12 NOVEMBRE 2026</p><h1>Le programme de 3e<span class="title-dot">.</span></h1><p>Ce que le parcours couvre, le texte officiel applicable et le format de l’épreuve de mathématiques du brevet.</p></header>',
            switch('programme', '../', 'troisieme', 'Choisir le programme'),
            '<section class="source-panel"><h2>Le texte applicable en 2026–2027</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Calendrier des programmes de 3e"><table><caption>Programme de mathématiques de la classe de 3e</caption><thead><tr><th>Année scolaire</th><th>Référence</th></tr></thead><tbody>'
            '<tr><td>2026–2027 et 2027–2028</td><td>Programme du cycle 4, arrêté du 17 juillet 2020, BO n° 31 du 30 juillet 2020, NOR <a href="https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm">MENE2018714A</a></td></tr>'
            '<tr><td>À partir de 2028–2029</td><td>Nouveau programme du cycle 4, arrêté du 18 février 2026, BO n° 10 du 5 mars 2026 ; il s’applique en 5e en 2026, en 4e en 2027 et en 3e en 2028</td></tr></tbody></table></div>'
            '<p>Le programme de 2020 est organisé en cinq thèmes : nombres et calculs ; organisation et gestion de données, fonctions ; grandeurs et mesures ; espace et géométrie ; algorithmique et programmation. Les leçons du site sont des rédactions pédagogiques originales : elles ne sont ni rédigées ni certifiées par le ministère.</p></section>',
            '<section class="source-panel" id="brevet"><h2>L’épreuve de mathématiques du brevet</h2><p>À partir de la session 2027, l’épreuve écrite de mathématiques dure 2 heures, est notée sur 20 et compte avec un coefficient 2. Elle porte sur le programme de la classe de 3e.</p>'
            '<div class="table-wrap" tabindex="0" role="region" aria-label="Organisation de l’épreuve du brevet"><table><caption>Deux parties, sur deux copies</caption><thead><tr><th>Partie</th><th>Durée</th><th>Points</th><th>Calculatrice</th></tr></thead><tbody>'
            '<tr><td>1. Automatismes : questions à réponses courtes</td><td>20 minutes</td><td>6</td><td>Interdite</td></tr>'
            '<tr><td>2. Raisonnement et résolution de problèmes</td><td>1 heure 40</td><td>14</td><td>Autorisée</td></tr></tbody></table></div>'
            '<p>La maîtrise de la langue compte pour au moins 2 points de l’épreuve : rédige des phrases complètes, nomme les grandeurs et les unités, et conclus dans le contexte.</p>'
            '<p>Sources : <a href="https://eduscol.education.gouv.fr/5607/les-epreuves-du-dnb">les épreuves du DNB sur Éduscol</a>, avec la liste indicative des automatismes et les sujets de référence ; <a href="https://www.education.gouv.fr/bo/2026/Special4">BO spécial n° 4 de 2026</a> (définition des épreuves à compter de la session 2027).</p>'
            '<p>Pour la première partie, entraîne-toi sans calculatrice avec les <a href="../annexes/calcul-rapide.html?niveau=troisieme">automatismes de 3e du calcul rapide</a> : fractions, pourcentages, puissances et priorités reviennent souvent.</p></section>',
            '<section class="source-panel"><h2>Correspondance avec les contenus du parcours</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Couverture du parcours de 3e"><table><caption>Quinze chapitres et un repère transversal</caption><thead><tr><th>Notions et capacités</th><th>Leçon</th><th>Entraînement</th></tr></thead><tbody>\n'
            + rows + '\n</tbody></table></div><p>Les 96 modèles d’exercices proposent des variantes numériques locales. Ils ne prétendent pas couvrir toutes les formulations possibles d’un sujet ni remplacer une progression menée en classe.</p></section>',
            '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)


if __name__ == "__main__":
    (OUT / 'cours').mkdir(parents=True, exist_ok=True)
    (OUT / 'exercices').mkdir(parents=True, exist_ok=True)
    for i, L in enumerate(LESSONS, 1):
        (OUT / 'cours' / f'{L["slug"]}.html').write_text(lesson_page(i, L))
        (OUT / 'exercices' / f'{L["slug"]}.html').write_text(series_page(i, L))
    (OUT / 'lecons.html').write_text(lessons_catalogue())
    (OUT / 'exercices.html').write_text(exercises_catalogue())
    (OUT / 'programme.html').write_text(programme_page())
    from brevet import brevet_page, sujet_blanc_page
    (OUT / 'brevet.html').write_text(brevet_page())
    (OUT / 'sujet-blanc.html').write_text(sujet_blanc_page())
    print('ok', len(LESSONS))
