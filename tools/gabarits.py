"""Ajouts de présentation dans le HTML commun, appliqués de façon idempotente par
finalize_site.py. Aucun contenu pédagogique n'est modifié.

- Catalogues : chaque carte porte son domaine en toutes lettres et en couleur ; les
  cartes d'exercices reprennent le domaine de la leçon du même chapitre. Leçons et
  séries portent le même domaine sur <body data-domain>.
- Les cartes de leçons indiquent le nombre d'exercices de la série du chapitre, et les
  deux catalogues chargent assets/catalogue-suivi.js (progression locale, seulement si
  le suivi est activé).
"""
from pathlib import Path
import html
import re

DOMAINS = {'analyse': 'Analyse', 'statistiques': 'Statistiques', 'probabilites': 'Probabilités',
           'reperes': 'Repères', 'atelier': 'Atelier'}
CATALOGS = [('lecons.html', 'exercices.html', 'cours/', 'exercices/'),
            ('terminale/lecons.html', 'terminale/exercices.html', 'cours/', 'exercices/')]
CARD = re.compile(r'<a class="lesson-card"([^>]*)>')


def label(category):
    return f'<span class="card-domain" data-domain="{category}">{DOMAINS[category]}</span>'


def add_domains(text, category_of):
    def card(match):
        attrs = match.group(1)
        href = re.search(r'href="([^"]+)"', attrs).group(1)
        category = re.search(r'data-category="([^"]+)"', attrs)
        category = category.group(1) if category else category_of(href)
        if category not in DOMAINS:
            return match.group(0)
        if 'data-category=' not in attrs:
            attrs += f' data-category="{category}"'
        return f'<a class="lesson-card"{attrs}>'
    text = CARD.sub(card, text)
    text = re.sub(r'<span class="card-domain"[^>]*>[^<]*</span>', '', text)
    return re.sub(r'(<a class="lesson-card"[^>]*data-category="(\w+)"[^>]*>)(<span class="course-code">[^<]*</span>)',
                  lambda m: m.group(1) + m.group(3) + (label(m.group(2)) if m.group(2) in DOMAINS else ''), text)


def catalogs(root: Path):
    for lessons, exercises, course_dir, exercise_dir in CATALOGS:
        lesson_path, exercise_path = root / lessons, root / exercises
        lesson_text = lesson_path.read_text(encoding='utf-8')
        slugs = {re.search(r'href="[^"]*?([\w-]+)\.html"', m.group(1)).group(1): c
                 for m in CARD.finditer(lesson_text)
                 for c in re.findall(r'data-category="([^"]+)"', m.group(1))}
        new = add_domains(lesson_text, lambda href: None)
        if new != lesson_text:
            lesson_path.write_text(new, encoding='utf-8')
        exercise_text = exercise_path.read_text(encoding='utf-8')
        slug_of = lambda href: slugs.get(re.search(r'([\w-]+)\.html', href).group(1))
        new = add_domains(exercise_text, slug_of)
        if new != exercise_text:
            exercise_path.write_text(new, encoding='utf-8')


CODE = re.compile(r'(<a class="lesson-card"[^>]*href="[^"]*?([\w-]+)\.html"[^>]*><span class="course-code">)([^<]*?)(?: · \d+ EXERCICES)?(</span>)')


def exercise_counts(text):
    return {m.group(1): m.group(2) for m in re.finditer(
        r'<a class="lesson-card"[^>]*href="[^"]*?([\w-]+)\.html"[^>]*><span class="course-code">[^<]*· (\d+) EXERCICES</span>', text)}


def add_counts(lesson_text, counts):
    def card(m):
        n = counts.get(m.group(2))
        code = m.group(3).rstrip()
        return m.group(1) + code + (f' · {n} EXERCICES' if n else '') + m.group(4)
    return CODE.sub(card, lesson_text)


def add_script(text, base, name):
    tag = f'<script src="{base}assets/{name}?v='
    if tag in text:
        return text
    new = f'<script src="{base}assets/{name}" defer></script>'
    anchor = re.search(r'<script src="[^"]*assets/typographie\.js[^"]*" defer></script>', text)
    return text[:anchor.start()] + new + text[anchor.start():]


def tracking(root: Path):
    for lessons, exercises, _, _ in CATALOGS:
        base = '../' if lessons.startswith('terminale/') else ''
        lesson_path, exercise_path = root / lessons, root / exercises
        counts = exercise_counts(exercise_path.read_text(encoding='utf-8'))
        for path in (lesson_path, exercise_path):
            text = path.read_text(encoding='utf-8')
            new = add_counts(text, counts) if path == lesson_path else text
            if 'assets/acquis.js' not in new:
                new = add_script(new, base, 'acquis.js')
            new = add_script(new, base, 'catalogue-suivi.js')
            if new != text:
                path.write_text(new, encoding='utf-8')


def page_domains(root: Path):
    """Leçons et séries : le thème du chapitre, tel que le donnent les catalogues, sur <body>
    (data-domain), pour colorer leur surtitre comme leur carte."""
    for _, exercises, _, _ in CATALOGS:
        folder = (root / exercises).parent
        text = (root / exercises).read_text(encoding='utf-8')
        domains = {m.group(1): m.group(2) for m in re.finditer(
            r'<a class="lesson-card"[^>]*href="exercices/([\w-]+)\.html"[^>]*data-category="(\w+)"', text)}
        for slug, domain in domains.items():
            for page in (folder / 'exercices' / f'{slug}.html', folder / 'cours' / f'{slug}.html'):
                if not page.exists() or domain not in DOMAINS:
                    continue
                html = page.read_text(encoding='utf-8')
                body = re.search(r'<body[^>]*>', html).group(0)
                new_body = re.sub(r' data-domain="\w+"', '', body)[:-1] + f' data-domain="{domain}">'
                new = html.replace(body, new_body, 1)
                if new != html:
                    page.write_text(new, encoding='utf-8')


# Encadrés « Définition » et « Méthode » : paragraphes du cours déjà rédigés, repérés par
# leur début. Le texte n'est pas modifié : il est seulement entouré d'un bloc typé.
BOXES = {
    'definition': {
        'cours/bernoulli.html': ['Une épreuve de Bernoulli est une expérience'],
        'cours/derivees.html': ['Lorsque les pentes des sécantes tendent', 'La droite obtenue comme position limite'],
        'cours/evolutions.html': ['Si une grandeur passe de VI à VF'],
        'cours/fonctions.html': ['Une fonction f associe à chaque nombre x'],
        'cours/logique.html': ['Un ensemble rassemble des éléments', 'L’intersection A ∩ B contient', 'Une implication « si P, alors Q »'],
        'cours/python-tableur.html': ['Une variable donne un nom à une valeur'],
        'cours/second-degre.html': ['Un polynôme du second degré s’écrit', 'Une racine de f est un nombre r'],
        'cours/statistiques-descriptives.html': ['La population est l’ensemble des individus'],
        'cours/suites.html': ['Une suite associe un nombre réel'],
        'cours/variations.html': ['La recette est la somme encaissée'],
        'terminale/cours/t-conditionnelles.html': ['PA(B) signifie'],
        'terminale/cours/t-suites.html': ['Trois nombres a, b, c sont des termes consécutifs'],
    },
    'method': {
        'cours/calcul.html': ['Pour comparer a et b, on peut étudier'],
        'cours/derivees.html': ['Pour obtenir la forme réduite'],
        'cours/evolutions.html': ['Pour calculer un taux, soustrais'],
        'cours/fonctions.html': ['Pour résoudre f(x) < k'],
        'cours/python-tableur.html': ['Pour vérifier un algorithme, dresser'],
        'cours/suites-geometriques.html': ['Pour calculer sans tableur, écris'],
        'terminale/cours/t-outils.html': ['Pour construire la ligne suivante'],
    },
}


def plain(fragment):
    text = html.unescape(re.sub(r'<[^>]+>', '', fragment))
    return re.sub(r'[\s\u00a0\u202f]+', ' ', text).strip()


def lesson_boxes(root: Path):
    for kind, pages in BOXES.items():
        for name, starts in pages.items():
            path = root / name
            text = path.read_text(encoding='utf-8')
            new = text
            for start in starts:
                key = plain(start)
                done = [m for m in re.finditer(rf'<div class="{kind}">(<p>[\s\S]*?</p>)</div>', new) if plain(m.group(1)).startswith(key)]
                if done:
                    continue
                hits = [m for m in re.finditer(r'<p>([\s\S]*?)</p>', new) if plain(m.group(1)).startswith(key)]
                assert len(hits) == 1, (name, start, len(hits))
                m = hits[0]
                new = new[:m.start()] + f'<div class="{kind}">' + m.group(0) + '</div>' + new[m.end():]
            if new != text:
                path.write_text(new, encoding='utf-8')


def apply(root: Path):
    catalogs(root)
    tracking(root)
    page_domains(root)
    lesson_boxes(root)


if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1])
