"""Refonte graphique : petits ajouts de présentation dans le HTML commun, appliqués de
façon idempotente par finalize_site.py. Aucun contenu pédagogique n'est modifié.

- Catalogues : chaque carte porte son domaine en toutes lettres (icône ajoutée par
  assets/refonte.css), au lieu d'une couleur propre à chaque domaine. Les cartes
  d'exercices reprennent le domaine de la leçon du même chapitre.
- Les cartes de leçons indiquent le nombre d'exercices de la série du chapitre, et les
  deux catalogues chargent assets/catalogue-suivi.js (progression locale, seulement si
  le suivi est activé).
"""
from pathlib import Path
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
    version = re.search(r'assets/typographie\.js\?v=([\w-]+)', text).group(1)
    new = f'<script src="{base}assets/{name}?v={version}" defer></script>'
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


def apply(root: Path):
    catalogs(root)
    tracking(root)


if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1])
