"""Static structure, local links, lesson snippets and numerical regression tests.
Run from any directory: python3 tests/validate_site.py
Only Python's standard library is required. Does not request external URLs.
"""
from __future__ import annotations
import ast
import json
import csv
import math
import re
import statistics
from collections import Counter
from fractions import Fraction
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
COURSES = ['fonctions', 'second-degre', 'suites', 'suites-arithmetiques',
           'suites-geometriques', 'derivees', 'variations',
           'statistiques-deux-variables', 'probabilites-conditionnelles',
           'bernoulli', 'variables-aleatoires', 'calcul', 'evolutions',
           'logique', 'statistiques-descriptives', 'python-tableur']

class Page(HTMLParser):
    def __init__(self, text: str):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.tags = Counter()
        self.classes = Counter()
        self.text = []
        self.pre_blocks = []
        self.current_pre = None
        self.lang = None
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags[tag] += 1
        self.classes.update(a.get('class', '').split())
        if tag == 'html':
            self.lang = a.get('lang')
        if 'id' in a:
            self.ids.append(a['id'])
        for key in ('href', 'src'):
            if key in a:
                self.links.append(a[key])
        if tag == 'pre':
            self.current_pre = []

    def handle_endtag(self, tag):
        if tag == 'pre' and self.current_pre is not None:
            self.pre_blocks.append(''.join(self.current_pre))
            self.current_pre = None

    def handle_data(self, data):
        self.text.append(data)
        if self.current_pre is not None:
            self.current_pre.append(data)


def load_functions(page: Page) -> dict:
    """Execute only function definitions and approved standard-library imports."""
    body = []
    for block in page.pre_blocks:
        for node in ast.parse(block).body:
            if isinstance(node, ast.FunctionDef):
                body.append(node)
            elif isinstance(node, ast.ImportFrom) and node.module in {'random', 'statistics', 'math'}:
                body.append(node)
    module = ast.Module(body=body, type_ignores=[])
    namespace = {}
    exec(compile(module, '<lesson-functions>', 'exec'), namespace)
    return namespace


def main():
    paths = (sorted(ROOT.glob('*.html')) + sorted((ROOT / 'cours').glob('*.html'))
             + sorted((ROOT / 'exercices').glob('*.html')))
    pages = {path.resolve(): Page(path.read_text(encoding='utf-8')) for path in paths}
    assert {p.stem for p in (ROOT / 'cours').glob('*.html')} == set(COURSES)
    links_checked = 0
    snippets = 0
    for path, page in pages.items():
        name = str(path.relative_to(ROOT))
        assert page.lang == 'fr', (name, 'lang')
        assert page.tags['h1'] == 1, (name, 'h1')
        assert page.tags['main'] == 1 and 'contenu' in page.ids, (name, 'main')
        assert len(page.ids) == len(set(page.ids)), (name, 'duplicate id')
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            assert not url.path.startswith('/'), (name, 'absolute internal path', link)
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_relative_to(ROOT), (name, 'path escapes site', link)
            assert target.is_file(), (name, 'missing target', link)
            if url.fragment and target.suffix == '.html':
                target_page = pages.get(target)
                if target_page is None:
                    target_page = Page(target.read_text(encoding='utf-8'))
                assert unquote(url.fragment) in target_page.ids, (name, 'missing anchor', link)
            links_checked += 1
        if path.parent.name == 'cours':
            assert page.classes['lesson-content'] == 1, name
            assert page.classes['lesson-immersive'] == 1, name
            assert page.classes['lesson-reading-controls'] == 1, name
            assert page.classes['learning-path'] == 1, name
            assert page.classes['support-scaffold'] == 1, name
            assert page.classes['study-quiz'] == 2, name
            assert page.classes['study-solution'] == 2, name
            assert page.classes['study-review'] == 1, name
            assert page.classes['check'] >= 1 and page.tags['summary'] >= 1, name
            assert page.tags['h2'] >= 6, name
            assert '../programme.html' in page.links, name
            assert '../pedagogie.html' in page.links, name
            assert any(link.startswith('../assets/apprentissage.css') for link in page.links), name
            assert any(link.startswith('../assets/apprentissage.js') for link in page.links), name
            words = len(re.findall(r'\w+', ' '.join(page.text)))
            assert words >= 550, (name, 'lesson too short', words)
            for i, block in enumerate(page.pre_blocks):
                compile(block, f'{name}:block{i}', 'exec')
                snippets += 1
    catalog = pages[(ROOT / 'lecons.html').resolve()]
    assert catalog.classes['lesson-card'] == 16
    assert catalog.classes['catalog-learning-guide'] == 1
    assert 'pedagogie.html' in catalog.links
    assert {f'cours/{slug}.html' for slug in COURSES}.issubset(catalog.links)
    # L'atelier numérique est isolé des quinze leçons principales.
    # Les 13 programmes déplacés s'ajoutent aux 7 exemples d'origine.
    optional = pages[(ROOT / 'cours' / 'python-tableur.html').resolve()]
    assert len(optional.pre_blocks) == 20, ('atelier', len(optional.pre_blocks))
    assert 'bibliotheque-code' in optional.ids
    catalog_raw = (ROOT / 'lecons.html').read_text(encoding='utf-8')
    exercises_raw = (ROOT / 'exercices.html').read_text(encoding='utf-8')
    assert 'data-category="atelier"' in catalog_raw
    assert 'option value="atelier"' in catalog_raw
    assert '121 exercices de mathématiques dans 15 séries' in exercises_raw
    assert '8 exercices de programmation transversaux' in exercises_raw
    for slug in COURSES:
        if slug == 'python-tableur':
            continue
        lesson_html = (ROOT / 'cours' / (slug + '.html')).read_text(encoding='utf-8')
        assert '<pre' not in lesson_html.lower(), ('programme affiche dans la lecon', slug)
        assert '<code' not in lesson_html.lower(), ('instruction affichee dans la lecon', slug)
    assert 'Calcul des pentes près de 2' in (ROOT / 'cours' / 'derivees.html').read_text(encoding='utf-8')
    assert 'Suivre les rangs à la main' in (ROOT / 'cours' / 'suites.html').read_text(encoding='utf-8')
    sources = pages[(ROOT / 'programme.html').resolve()]
    assert {f'cours/{slug}.html' for slug in COURSES}.issubset(sources.links)
    exercises_catalog = pages[(ROOT / 'exercices.html').resolve()]
    assert exercises_catalog.classes['lesson-card'] == len(COURSES)
    assert {f'exercices/{slug}.html' for slug in COURSES}.issubset(exercises_catalog.links)
    count_exercises = 0
    for slug in COURSES:
        page = pages[(ROOT / 'exercices' / f'{slug}.html').resolve()]
        assert f'../cours/{slug}.html' in page.links, slug
        lesson = pages[(ROOT / 'cours' / f'{slug}.html').resolve()]
        assert f'../exercices/{slug}.html' in lesson.links, slug

        # Toutes les séries disposent du même moteur et des variantes par thème.
        for filename in ('exercices-renderer.js','exercices-variants.js',
                         'variants-fonctions.js','variants-suites.js',
                         'variants-analyse.js','variants-probabilites.js',
                         'variants-reperes.js','variants-donnees.js','exercices.js'):
            assert any(link.startswith('../assets/' + filename) for link in page.links), (slug, filename)

        if slug == 'fonctions':
            assert page.classes['exercise-block'] == 9
            assert page.classes['check'] == 9
            count_exercises += 9
            continue

        source = (ROOT / 'exercices' / f'{slug}.html').read_text(encoding='utf-8')
        match = re.search(r'<script type="application/json" id="exercise-data">([\s\S]*?)</script>', source)
        assert match, (slug, 'missing exercise JSON')
        info = json.loads(match.group(1))
        assert info['slug'] == slug
        assert len(info['exercises']) == 8, (slug, len(info['exercises']))
        for number, exercise in enumerate(info['exercises'], start=1):
            assert exercise['title'] and exercise['statement'], (slug, number, 'missing text')
            assert len(exercise['tasks']) >= 1, (slug, number, 'missing tasks')
            assert exercise['correction'] and all(exercise['correction']), (slug, number, 'correction')
            assert len(exercise['fields']) >= 2, (slug, number, 'answers')
            for field in exercise['fields']:
                assert field['label'] and field['answer'], (slug, number, 'empty answer')
                if 'options' in field:
                    assert field['answer'] in field['options'], (slug, number, 'missing select value')
                else:
                    try:
                        assert math.isfinite(float(field['answer'].replace(',', '.')))
                    except ValueError:
                        assert field.get('type') == 'text', (slug, number, field)

        count_exercises += len(info['exercises'])

    assert count_exercises == 129, count_exercises
    print(f'EXERCISES OK: {len(COURSES)} chapters; {count_exercises} exercises validated.')
    print(f'STATIC OK: {len(pages)} HTML pages; 16 lessons; {links_checked} local links; {snippets} Python blocks compiled.')

    # Les fonctions de test restent disponibles dans la bibliothèque Python
    # facultative, mais ne figurent plus dans les cours de mathématiques.
    archived_functions = load_functions(optional)
    def funcs(slug):
        assert slug in COURSES
        return archived_functions

    f = funcs('fonctions')
    lo, hi = f['encadrement_racine2']()
    assert math.isclose(lo, 1.41) and math.isclose(hi, 1.42)
    assert lo * lo < 2 < hi * hi
    f = funcs('suites')
    assert f['stock'](0) == 200 and math.isclose(f['stock'](2), 218)
    f = funcs('suites-arithmetiques')
    assert f['premier_mois'](1025) == 17
    assert f['somme_arithmetique'](100, 20, 5) == 900
    f = funcs('suites-geometriques')
    assert f['seuil_capital'](1500)[0] == 11
    assert f['premier_depassement']() == 12
    assert math.isclose(f['somme_geometrique'](100, 0.5, 3), 187.5)
    f = funcs('derivees')
    assert math.isclose(f['pente_secante'](lambda x: x*x, 2, 0.01), 4.01)
    f = funcs('bernoulli')
    assert f['nombre_succes'](4, 0) == 0 and f['nombre_succes'](4, 1) == 4
    f = funcs('variables-aleatoires')
    assert f['simuler_frequences'](10, 20, 0) == [0] * 10
    assert f['simuler_frequences'](10, 20, 1) == [1] * 10
    for args in [(1, 20, 0.3), (10, 0, 0.3), (10, 20, 1.2)]:
        try:
            f['simuler_frequences'](*args)
        except ValueError:
            pass
        else:
            raise AssertionError(('validation not raised', args))
    f = funcs('python-tableur')
    assert math.isclose(f['valeur_finale'](200, .15), 230)
    assert math.isclose(f['taux_evolution'](200, 230), .15)
    cubic = lambda x: x**3 - 3*x*x - 9*x + 2
    assert [cubic(x) for x in [-2, -1, 3, 5]] == [0, 7, -25, 7]
    assert math.isclose(6 * .3**2 * .7**2, .2646)
    assert math.isclose(1 - .7**4, .7599)
    assert -2*Fraction(1, 2) + Fraction(1, 3) + 4*Fraction(1, 6) == 0
    assert math.isclose(.7*.02 + .3*.05, .029)
    assert math.isclose(1.12*.95, 1.064)
    assert math.isclose(212.80 / 1.064, 200)
    x, y = [1, 2, 3, 4], [12, 15, 19, 22]
    xm, ym = statistics.mean(x), statistics.mean(y)
    a = sum((xi-xm)*(yi-ym) for xi, yi in zip(x, y)) / sum((xi-xm)**2 for xi in x)
    assert math.isclose(a, 3.4) and math.isclose(ym-a*xm, 8.5)
    durations = [8, 10, 10, 12, 14, 16, 18, 20]
    assert statistics.mean(durations) == 13.5 and statistics.median(durations) == 13
    assert statistics.pvariance(durations) == 15.75
    with (ROOT / 'donnees' / 'naissances-france-2018-2023.csv').open(encoding='utf-8', newline='') as file:
        reader = csv.reader(file)
        assert next(reader) == ['annee', 'naissances']
        data = [[int(a), int(b)] for a, b in reader]
    assert data == [[2018, 758590], [2019, 753383], [2020, 735196], [2021, 742052], [2022, 725997], [2023, 677803]]
    assert math.isclose(statistics.mean(row[1] for row in data), 732170.1666666666)
    assert [r for r in data if r[0] >= 2020 and r[1] < 740000] == [[2020, 735196], [2022, 725997], [2023, 677803]]
    print('NUMERICAL OK: lesson functions, thresholds, sums, derivatives, adjustment, probabilities, descriptive statistics, CSV and simulation boundary cases.')

if __name__ == '__main__':
    main()
