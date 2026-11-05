"""Refonte graphique : petits ajouts de présentation dans le HTML commun, appliqués de
façon idempotente par finalize_site.py. Aucun contenu pédagogique n'est modifié.

- Catalogues : chaque carte porte son domaine en toutes lettres (icône ajoutée par
  assets/refonte.css), au lieu d'une couleur propre à chaque domaine. Les cartes
  d'exercices reprennent le domaine de la leçon du même chapitre.
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


def apply(root: Path):
    catalogs(root)


if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1])
