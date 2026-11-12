"""Génère les pages de Seconde (leçons, séries, catalogues, programme). Les pages sont
ensuite normalisées par tools/finalize_site.py."""
import sys, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lecons_seconde import LESSONS2 as LESSONS
from troisieme import switch, BRAND, FOOTER, head, num, quiz

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'seconde'

DOMAIN_LABEL = {'nombres': 'NOMBRES ET CALCULS, ALGÈBRE', 'fonctions': 'FONCTIONS', 'statistiques': 'STATISTIQUES',
                'probabilites': 'PROBABILITÉS', 'geometrie': 'GÉOMÉTRIE', 'reperes': 'ALGORITHMIQUE ET LOGIQUE'}
FOOTER = lambda base: ('<footer class="site-footer"><div class="container footer-inner"><p><strong>maths.</strong> Comprendre, puis pratiquer.</p>'
          '<p>Mathématiques · 3e, Seconde, Première et Terminale STMG</p></div>'
          f'<div class="container footer-links"><a href="{base}seconde/exercices.html#mes-progres">Mes progrès</a> · <a href="{base}a-propos.html">À propos et données</a> · <a href="{base}accessibilite.html">Accessibilité</a></div></footer>')
BRAND = lambda base: (f'<a class="skip-link" href="#contenu">Aller au contenu</a><header class="site-header"><div class="container header-inner">'
                      f'<a class="brand" href="{base}index.html" aria-label="Maths, accueil"><span class="brand-mark" aria-hidden="true">m<span>.</span></span><span>maths<span class="brand-dot">.</span></span></a>')


def nav(base, here, current):
    # base : chemin vers la racine ; here : chemin vers seconde/.
    items = [(f'{base}index.html', 'Accueil', 'home'), (f'{here}lecons.html', 'Leçons', 'lecons'),
             (f'{here}exercices.html', 'Exercices', 'exercices'), (f'{here}programme.html', 'Programme', 'programme'),
             (f'{base}annexes/calcul-rapide.html', 'Calcul rapide', 'rapide')]
    out = []
    for href, label, key in items:
        cur = f' aria-current="{current[1]}"' if key == current[0] else ''
        out.append(f'<a href="{href}"{cur}>{label}</a>')
    return '<nav class="main-nav" aria-label="Navigation principale">' + ''.join(out) + '</nav></div></header>'


def level_switch(kind, base_root, label):
    return switch(kind, base_root, 'seconde', label)


def lesson_page(i, L):
    slug, title = L['slug'], L['title']
    code = 'REPÈRE TRANSVERSAL' if L.get('transversal') else num(i)
    description = f'Leçon de Seconde, {title} : {L["lead"][0].lower() + L["lead"][1:]} Méthodes, exemples et pauses mémoire corrigées.'
    h = head(f'{title} · Seconde | Maths', description, '../../', 'lecon',
             ['cours.js', 'apprentissage.js', 'interface.js', 'acquis.js', 'suivi-exercices.js'])
    body = [f'<body class="lesson-immersive college-course" data-course="{slug}">', BRAND('../../'), nav('../../', '../', ('lecons', 'location')),
            f'<main id="contenu" class="container lesson-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../lecons.html">Leçons de Seconde</a><span>/</span><span aria-current="page">{"Repère" if L.get("transversal") else "Chapitre " + num(i)}</span></nav>',
            f'<header class="lesson-heading"><p class="eyebrow">SECONDE · {code} / {DOMAIN_LABEL[L["domain"]]}</p><h1>{title}</h1><p class="lead">{L["lead"]}</p>'
            '<div class="learning-path"><span><b>1</b> Je comprends</span><span><b>2</b> Je vérifie</span><span><b>3</b> Je m’entraîne</span></div></header>',
            switch('lecons', '../../', 'seconde', 'Niveau'),
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
    prev = ('../lecons.html', '← Catalogue Seconde') if i == 1 else (f'{LESSONS[i - 2]["slug"]}.html', '← ' + LESSONS[i - 2]['title'])
    nxt = (f'{LESSONS[i]["slug"]}.html', LESSONS[i]['title'] + ' →') if i < len(LESSONS) else ('../exercices.html', 'Toutes les séries de Seconde →')
    body.append(f'<nav class="course-pagination" aria-label="Navigation entre les leçons"><a href="{prev[0]}">{prev[1]}</a><a href="{nxt[0]}">{nxt[1]}</a></nav></main>')
    body.append(FOOTER('../../') + '</body></html>\n')
    return h + ''.join(body)


def series_page(i, L):
    slug, title = L['slug'], L['title']
    description = f'{title} : 6 exercices interactifs de Seconde, avec variantes tirées au hasard, indices et corrigés rédigés.'
    h = head(f'Exercices · {title} · Seconde', description, '../../', 'serie',
             ['exercices-variants.js', 'seconde-exercices.js', 'exercices-renderer.js', 'exercices.js', 'interface.js', 'acquis.js', 'suivi-exercices.js'])
    code = 'REPÈRE' if L.get('transversal') else num(i)
    body = [f'<body class="exercise-page">', BRAND('../../'), nav('../../', '../', ('exercices', 'location')),
            f'<main id="contenu" class="container interactive-exercise-page" tabindex="-1" data-interactive-exercises data-generated-exercises data-seconde-chapter="{slug}">'
            f'<nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../exercices.html">Exercices de Seconde</a><span>/</span><span aria-current="page">{"Repère" if L.get("transversal") else "Chapitre " + num(i)}</span></nav>'
            f'<header class="page-intro"><p class="eyebrow">SECONDE · {code} / PARCOURS INTERACTIF</p><h1>{title}</h1><p>Six exercices progressifs : {L["ex_card"][0].lower() + L["ex_card"][1:]} Réponds, vérifie, puis lis les indices ou la correction avant de passer à une variante.</p></header>',
            switch('exercices', '../../', 'seconde', 'Niveau des exercices'),
            f'<p><a href="../cours/{slug}.html">Revoir la leçon de Seconde</a> · <a href="../programme.html">Programme et sources</a></p>',
            '<div id="exercise-mounted"><p>Chargement des exercices…</p></div><script type="application/json" id="exercise-data"></script><noscript><p>La version de lecture sans JavaScript est générée.</p></noscript></main>',
            FOOTER('../../') + '</body></html>\n']
    return h + ''.join(body)


GROUPS = [('nombres', 'Nombres, calculs et algèbre', 'Arithmétique, nombres réels, calcul algébrique, équations et inéquations.', ['nombres']),
          ('geometrie', 'Géométrie', 'Vecteurs, colinéarité, géométrie repérée et droites du plan.', ['geometrie']),
          ('fonctions', 'Fonctions', 'Courbes, fonctions de référence, variations, extremums et signes.', ['fonctions']),
          ('statistiques', 'Statistiques et probabilités', 'Évolutions, statistique descriptive, tableaux croisés, probabilités et échantillonnage.', ['statistiques', 'probabilites']),
          ('algorithmique', 'Algorithmique et logique', 'Python, ensembles et raisonnement, à mobiliser toute l’année.', ['reperes'])]
CARD_DOMAIN = {'nombres': 'nombres', 'fonctions': 'fonctions', 'statistiques': 'statistiques', 'probabilites': 'probabilites', 'geometrie': 'geometrie', 'reperes': 'reperes'}


def card(i, L, kind):
    slug = L['slug']
    code = 'SECONDE · REPÈRE TRANSVERSAL' if L.get('transversal') else f'SECONDE · CHAPITRE {num(i)}'
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
         '<h2 id="annexe-calcul-title">Calcul mental et calcul rapide</h2><p>En Seconde, les automatismes se travaillent toute l’année, souvent à l’oral. Le parcours « Automatismes de Seconde » du calcul rapide entretient racines, identités remarquables, vecteurs et évolutions.</p>'
         '<a href="../annexes/calcul-rapide.html?niveau=seconde">Ouvrir l’annexe de calcul rapide →</a></aside>')


def lessons_catalogue():
    h = head('Les leçons · Seconde | Maths', 'Leçons de mathématiques de Seconde : arithmétique, nombres réels, calcul algébrique, vecteurs, droites, fonctions, statistiques, probabilités et algorithmique.',
             '../', 'catalogue', ['cours.js', 'interface.js'])
    body = ['<body class="has-rapid-link">', BRAND('../'), nav('../', '', ('lecons', 'page')),
            '<main id="contenu" class="container section-page lessons-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../index.html">Accueil</a><span>/</span><span aria-current="page">Leçons · Seconde</span></nav>',
            level_switch('lecons', '../', 'Choisir le niveau des leçons'),
            '<header class="page-intro"><p class="eyebrow">COMPRENDRE &amp; RETENIR</p><h1>Les leçons<span class="title-dot">.</span></h1><p>Tout le programme de <strong>Seconde générale et technologique</strong>, chapitre par chapitre : des méthodes expliquées, des exemples corrigés et des pauses mémoire.</p></header>',
            '<div class="catalog-tools" hidden><label for="course-search">Chercher une notion<input id="course-search" type="search" placeholder="Ex. : vecteur, écart type, parité…" autocomplete="off"></label>'
            '<label for="course-category">Domaine<select id="course-category"><option value="">Tous les domaines</option><option value="nombres">Nombres et algèbre</option><option value="geometrie">Géométrie</option><option value="fonctions">Fonctions</option>'
            '<option value="statistiques">Statistiques</option><option value="probabilites">Probabilités</option><option value="reperes">Algorithmique et logique</option></select></label></div>'
            '<p id="result-count" class="result-count" role="status" aria-live="polite">15 chapitres · 1 repère</p><p id="no-results" class="no-results" hidden>Aucune leçon ne correspond. Essaie un autre mot.</p>',
            '<details class="ui-disclosure ui-catalog-help"><summary>Programme et conseils d’utilisation</summary><aside class="programme-note"><p><strong>15 chapitres et 1 repère d’algorithmique et de logique.</strong> À la rentrée 2026, la classe de Seconde suit le nouveau programme de mathématiques publié au BO n° 14 du 2 avril 2026.</p><p><a href="programme.html">Voir les références et la couverture du programme →</a></p></aside>'
            '<section class="catalog-learning-guide" aria-label="Comment apprendre"><article><span class="guide-number">ÉTAPE 01</span><h2>Je comprends</h2><p>Lis l’exemple guidé et repère les conditions d’utilisation de chaque propriété.</p></article><article><span class="guide-number">ÉTAPE 02</span><h2>Je me teste</h2><p>Essaie les pauses mémoire avant d’ouvrir leur raisonnement.</p></article><article><span class="guide-number">ÉTAPE 03</span><h2>Je m’entraîne</h2><p>Passe aux exercices du chapitre, puis reviens après une pause. <a href="../pedagogie.html">Les méthodes d’apprentissage</a>.</p></article></section></details>',
            groups('lecons'),
            '<aside class="catalog-notice"><h2>Entre la 3e et la Première</h2><p>Besoin de revoir une base ? Les <a href="../troisieme/lecons.html">leçons de 3e</a> reprennent le calcul littéral, Pythagore et Thalès. Pour la suite, les leçons de <a href="../lecons.html">Première STMG</a> prolongent les évolutions, les fonctions et les probabilités conditionnelles.</p></aside>',
            RAPID + '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)


def exercises_catalogue():
    h = head('Les exercices · Seconde | Maths', 'Exercices interactifs de Seconde : 16 séries avec variantes tirées au hasard, indices progressifs et corrigés rédigés.',
             '../', 'catalogue', ['interface.js', 'acquis.js', 'progres.js'])
    progress = (ROOT / 'tools/templates/inline-progress.fragment').read_text().replace('{base}', '../').replace('{level}', 'seconde')
    progress = progress.replace('<option value="premiere">Première</option>', '<option value="troisieme">3e</option><option value="seconde">Seconde</option><option value="premiere">Première</option>')
    body = ['<body class="has-rapid-link exercise-page">', BRAND('../'), nav('../', '', ('exercices', 'page')),
            '<main id="contenu" class="container section-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="../index.html">Accueil</a><span>/</span><span aria-current="page">Exercices · Seconde</span></nav>',
            level_switch('exercices', '../', 'Choisir le niveau des exercices'),
            '<header class="page-intro"><p class="eyebrow">S’ENTRAÎNER &amp; PROGRESSER</p><h1>Les exercices<span class="title-dot">.</span></h1><p>16 séries avec variantes et corrections. Choisis un chapitre et commence.</p></header>',
            progress,
            '<nav class="exercise-category-nav" aria-label="Accéder à un domaine"><a href="#nombres">Nombres et algèbre</a><a href="#geometrie">Géométrie</a><a href="#fonctions">Fonctions</a><a href="#statistiques">Statistiques et probabilités</a><a href="#algorithmique">Algorithmique</a></nav>',
            '<p class="catalog-variant-note"><strong>Faire le point</strong> : le <a href="../diagnostic.html?niveau=seconde">diagnostic de Seconde</a> repère en dix questions les bases à revoir ; la <a href="../revisions.html?niveau=seconde">révision guidée de Seconde</a> les reprend ensuite.</p>'
            '<p class="catalog-variant-note"><strong>Nouvelle variante ↻</strong> : après chaque vérification, ce bouton propose le même exercice avec d’autres valeurs, de même niveau. Ton essai reste affiché jusqu’à ton clic.</p>'
            '<details class="ui-disclosure ui-catalog-help"><summary>En savoir plus : variantes, corrections et score</summary><aside class="catalog-notice"><p><strong>Un exercice à la fois.</strong> Réponds, puis clique sur Vérifier. Les valeurs de chaque variante sont tirées au hasard, dans les mêmes limites que l’exercice d’origine.</p>'
            '<p>La correction remplit les champs : <strong>vert</strong> si tu avais juste, <strong>rouge</strong> si la réponse était fausse ou manquante. Une réponse révélée ne donne pas de point. Les scores sont locaux à la page et se réinitialisent au rechargement.</p>'
            '<p>Les fractions et les virgules décimales sont acceptées. Les résultats non exacts sont demandés au centième, sauf indication contraire. Entraîne-toi aussi sans calculatrice : les automatismes de Seconde se travaillent de tête.</p></aside></details>',
            groups('exercices'),
            RAPID + '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)


COVER = {
    '2-arithmetique': 'Notations ℕ et ℤ ; multiples, diviseurs, parité ; nombres premiers ; fraction irréductible ; démonstrations sur la somme de multiples et le carré d’un impair ; algorithmes de divisibilité et de primalité.',
    '2-nombres-reels': 'Ensemble ℝ et droite numérique ; intervalles ; valeur absolue et distance ; |x − a| ≤ r ; décimaux, rationnels, irrationnels ; encadrements et chiffres significatifs ; balayage pour encadrer √2.',
    '2-calcul-algebrique': 'Puissances entières relatives ; racines carrées et √(a²) = |a| ; identités remarquables dans les deux sens ; expressions fractionnaires ; isoler une variable ; choisir une forme adaptée.',
    '2-equations': 'Somme et produit d’inégalités ; comparaison par différence ou quotient ; équations et inéquations du premier degré ; produit nul ; x² = a ; a/x = b ; modélisation par une inéquation.',
    '2-vecteurs': 'Translation et vecteur ; égalité, somme, relation de Chasles ; produit par un réel ; base orthonormée, coordonnées, norme ; caractérisation vectorielle du milieu.',
    '2-colinearite': 'Colinéarité et déterminant ; alignement et parallélisme ; distances et nature d’une figure ; projeté orthogonal ; cos² α + sin² α = 1.',
    '2-droites': 'Vecteur directeur ; équations cartésienne et réduite ; pente ; parallélisme ; systèmes de deux équations linéaires et point d’intersection.',
    '2-fonctions': 'Ensemble de définition ; courbe et équation y = f(x) ; parité et symétries ; résolutions de f(x) = k, f(x) < k, f(x) = g(x) et f(x) < g(x) ; modélisation.',
    '2-fonctions-reference': 'Fonctions valeur absolue, carré, inverse, racine carrée et cube : définitions, courbes, variations, signes ; position relative de x² et x³.',
    '2-variations': 'Croissance, décroissance, monotonie ; tableau de variations ; maximum et minimum ; taux d’accroissement d’une fonction affine ; optimisation par le calcul, le graphique ou un balayage.',
    '2-signes': 'Signe d’une fonction affine ; tableaux de signes de produits et de quotients ; inéquations produit et quotient ; interprétation en contexte.',
    '2-evolutions': 'Proportions et pourcentages de pourcentages ; variation absolue, taux d’évolution, coefficient multiplicateur ; évolutions successives et réciproques.',
    '2-statistiques': 'Linéarité de la moyenne ; écart type ; quartiles et écart interquartile ; séries en classes, classe médiane ; comparaison de séries.',
    '2-tableaux-croises': 'Tableaux croisés d’effectifs ; fréquences marginales et conditionnelles ; filtres ET, OU, NON.',
    '2-probabilites': 'Loi de probabilité ; P(A ∪ B) ; dénombrement par tableaux et arbres ; deux ou trois épreuves ; probabilité conditionnelle et faux positifs ; échantillonnage et loi des grands nombres.',
    '2-algorithmique': 'Variables et types ; conditionnelles ; boucles for et while ; fonctions Python ; vocabulaire ensembliste ; négation, implication, réciproque, contraposée ; raisonnements.',
}


def programme_page():
    h = head('Programme · Seconde | Maths', 'Programme de mathématiques de Seconde générale et technologique applicable à la rentrée 2026 et correspondance avec les leçons et exercices du site.',
             '../', 'page', ['interface.js'])
    rows = '\n'.join(f'<tr><td>{COVER[L["slug"]]}</td><td><a href="cours/{L["slug"]}.html">{"Repère" if L.get("transversal") else num(i)} · {L["title"]}</a></td>'
                     f'<td><a href="exercices/{L["slug"]}.html">6 exercices<span class="sr-only"> : {L["title"]}</span></a></td></tr>' for i, L in enumerate(LESSONS, 1))
    body = ['<body>', BRAND('../'), nav('../', '', ('programme', 'page')),
            '<main id="contenu" class="container section-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="lecons.html">Leçons de Seconde</a><span>/</span><span aria-current="page">Programme</span></nav>',
            '<header class="page-intro"><p class="eyebrow">RÉFÉRENCES · 12 NOVEMBRE 2026</p><h1>Le programme de Seconde<span class="title-dot">.</span></h1><p>Ce que le parcours couvre et le texte officiel applicable en Seconde générale et technologique.</p></header>',
            switch('programme', '../', 'seconde', 'Choisir le programme'),
            '<section class="source-panel"><h2>Le texte applicable en 2026–2027</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Calendrier des programmes de Seconde"><table><caption>Programme de mathématiques de la classe de Seconde</caption><thead><tr><th>Année scolaire</th><th>Référence</th></tr></thead><tbody>'
            '<tr><td>À partir de 2026–2027</td><td>Programme de Seconde générale et technologique, arrêté du 26 février 2026, BO n° 14 du 2 avril 2026, NOR <a href="https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A">MENE2602914A</a></td></tr>'
            '<tr><td>Jusqu’en 2025–2026</td><td>Programme de 2019, remplacé à la rentrée 2026</td></tr></tbody></table></div>'
            '<p>Le programme comporte quatre parties thématiques : nombres et calculs, algèbre ; géométrie ; fonctions ; statistiques et probabilités. Trois parties transversales se travaillent toute l’année sans chapitre dédié : vocabulaire ensembliste et logique ; algorithmique et programmation en Python ; automatismes. Le site leur consacre un repère et l’annexe de calcul rapide.</p>'
            '<p>Les leçons du site sont des rédactions pédagogiques originales : elles ne sont ni rédigées ni certifiées par le ministère. Sources : <a href="https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt">programmes et ressources en mathématiques sur Éduscol</a>.</p></section>',
            '<section class="source-panel" id="automatismes"><h2>Les automatismes</h2><p>Comparer deux nombres, calculer avec des fractions et des puissances, passer d’une écriture à une autre, convertir des unités, développer et factoriser, résoudre les équations simples, traduire une évolution par un coefficient, lire une courbe, appliquer Pythagore, Thalès ou la trigonométrie, lire un diagramme ou une boîte à moustaches, calculer une probabilité simple : ces capacités se travaillent souvent, de tête. Elles préparent l’épreuve anticipée de mathématiques de Première.</p>'
            '<p>Entraîne-toi avec les <a href="../annexes/calcul-rapide.html?niveau=seconde">automatismes de Seconde du calcul rapide</a> et, pour les bases du collège, avec les <a href="../troisieme/exercices.html">exercices de 3e</a>.</p></section>',
            '<section class="source-panel"><h2>Correspondance avec les contenus du parcours</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Couverture du parcours de Seconde"><table><caption>Quinze chapitres et un repère transversal</caption><thead><tr><th>Notions et capacités</th><th>Leçon</th><th>Entraînement</th></tr></thead><tbody>\n'
            + rows + '\n</tbody></table></div><p>Les 96 modèles d’exercices proposent des variantes numériques locales. Ils ne prétendent pas couvrir toutes les formulations possibles ni remplacer une progression menée en classe.</p></section>',
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
    print('ok', len(LESSONS))
