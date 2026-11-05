"""Terminale structure and independent numerical regression tests.
Run: python3 tests/test_terminale.py (Python standard library and Node only).
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import math
import re
import subprocess
from validate_site import Page, load_functions

ROOT = Path(__file__).resolve().parent.parent
SLUGS = ['t-suites','t-exponentielles','t-logarithme','t-inverse',
         't-statistiques','t-conditionnelles','t-binomiale','t-variables','t-outils']


def check_structure():
    paths = sorted((ROOT / 'terminale').rglob('*.html'))
    assert len(paths) == 21, len(paths)
    all_pages = {p.resolve(): Page(p.read_text(encoding='utf-8'))
                 for p in ROOT.rglob('*.html') if '.git' not in p.parts and 'docs' not in p.parts}
    checked = 0
    for path in paths:
        page = all_pages[path.resolve()]
        assert page.lang == 'fr' and page.tags['h1'] == 1, path
        assert page.tags['main'] == 1 and 'contenu' in page.ids, path
        assert len(page.ids) == len(set(page.ids)), path
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            assert not url.path.startswith('/'), (path, link)
            target = (path.parent / unquote(url.path)).resolve() if url.path else path.resolve()
            assert target.is_relative_to(ROOT) and target.is_file(), (path, link)
            if url.fragment and target.suffix == '.html':
                assert unquote(url.fragment) in all_pages[target].ids, (path, link)
            checked += 1
    for name in ['lecons','exercices']:
        first = all_pages[(ROOT / (name + '.html')).resolve()]
        terminal = all_pages[(ROOT / 'terminale' / (name + '.html')).resolve()]
        assert first.classes['lesson-card'] == 16, name
        assert terminal.classes['lesson-card'] == 9, name
        assert 'terminale/' + name + '.html' in first.links
        assert '../' + name + '.html' in terminal.links
        assert first.classes['level-switch'] == 1
        assert terminal.classes['level-switch'] == 1
    for slug in SLUGS:
        lesson_path = ROOT / 'terminale' / 'cours' / (slug + '.html')
        exercise_path = ROOT / 'terminale' / 'exercices' / (slug + '.html')
        lesson = all_pages[lesson_path.resolve()]
        exercise = all_pages[exercise_path.resolve()]
        for cls in ['lesson-content','lesson-immersive','learning-path','lesson-reading-controls',
                    'support-scaffold','study-review','course-pagination']:
            assert lesson.classes[cls] == 1, (slug,cls)
        assert lesson.classes['study-quiz'] == lesson.classes['study-solution'] == 2, slug
        assert lesson.classes['check'] >= 1 and lesson.tags['h2'] >= 6, slug
        assert len(re.findall(r'\w+', ' '.join(lesson.text))) >= 550, slug
        assert '../exercices/' + slug + '.html' in lesson.links
        assert '../cours/' + slug + '.html' in exercise.links
        assert '../programme.html' in lesson.links
        for i, block in enumerate(lesson.pre_blocks):
            compile(block, str(lesson_path) + ':' + str(i), 'exec')
        text = exercise_path.read_text(encoding='utf-8')
        assert 'data-terminale-chapter="' + slug + '"' in text
        scripts = ['exercices-variants.js','terminale-exercices.js','exercices-renderer.js','exercices.js']
        positions = [text.index('../../assets/' + script) for script in scripts]
        assert positions == sorted(positions), slug
        assert 'exercise-data' in exercise.ids and 'exercise-mounted' in exercise.ids
        assert exercise.tags['noscript'] == 1
    namespace = load_functions(all_pages[(ROOT / 'terminale/cours/t-outils.html').resolve()])
    assert namespace['somme_carres'](4) == 30
    assert namespace['somme_carres'](0) == 0
    assert namespace['somme_geometrique'](100,.5,4) == 187.5
    assert namespace['somme_geometrique'](3,1,4) == 12
    assert namespace['pascal'](4) == [1,4,6,4,1]
    assert namespace['distribution_binomiale'](3,0,10) == [10,0,0,0]
    assert namespace['distribution_binomiale'](3,1,10) == [0,0,0,10]
    assert sum(namespace['distribution_binomiale'](5,.3,100)) == 100
    print(f'TERMINALE STRUCTURE OK: 21 pages, 18 quizzes, {checked} links and Python examples.')


PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]]
LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]]
OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]]


def prob(n, p, k):
    return math.comb(n, k) * p ** k * (1 - p) ** (n - k)


def expected(slug, i, P):
    """Recalcul indépendant des réponses à partir des paramètres tirés."""
    g = P.get
    if slug == 't-suites':
        if i == 0: return [g('a') + g('r'), g('r')]
        if i == 1: return [math.sqrt(g('a') * g('a') * g('q') ** 2), g('q')]
        if i == 2:
            values = [g('a') + j * g('r') for j in range(g('n') + 1)]
            return [values[-1], len(values), sum(values)]
        if i == 3:
            values = [g('a') * g('q') ** j for j in range(g('n'))]
            return [values[-1], sum(values)]
        if i == 4:
            f = [lambda k: k * k, lambda k: k, lambda k: 2 * k - 1][g('kind')]
            return [f(g('n')), sum(f(k) for k in range(g('m'), g('n') + 1))]
        capital = 0
        for _ in range(g('n')):
            capital = capital * (1 + g('t') / 100) + g('d')
        return [g('n') * g('d'), capital]
    if slug == 't-exponentielles':
        if i == 0: return [g('k') * g('a') ** g('x'), g('k') / g('a')]
        if i == 1: return [g('a') ** (g('m') + g('n')), g('a') ** g('m') / g('a') ** g('n')]
        if i == 2:
            k, a = g('sk') * g('k'), g('a')
            return [k, 'constante' if a == 1 else ('croissante' if k * a ** 1 > k * a ** 0 else 'd\u00e9croissante')]
        if i == 3:
            vf = round(g('v0') * g('q') ** 2)
            r = math.sqrt(vf / g('v0'))
            return [r, 100 * (r - 1)]
        if i == 4:
            gl = (1 + g('a') / 100) * (1 - g('b') / 100)
            return [100 * (gl - 1), 100 * (math.sqrt(gl) - 1)]
        return [g('x0') + 1, math.sqrt(g('k') * g('k') * g('q') ** 2)]
    if slug == 't-logarithme':
        if i == 0: return [math.log10(10 ** g('h')), math.log10(10.0 ** g('j'))]
        if i == 1:
            la, lb = g('a') / 10, g('b') / 10
            return [math.log10(10 ** la * 10 ** lb), math.log10(10 ** la / 10 ** lb), math.log10((10 ** la) ** 3)]
        if i == 2:
            a, b = g('a'), g('a') ** g('x')
            n = 0
            while not (a ** n > b if g('strict') else a ** n >= b):
                n += 1
            return [math.log(b) / math.log(a), n]
        if i == 3:
            b = g('v0') / 2 ** g('m')
            n = 0
            while not math.isclose(g('v0') * 0.5 ** n, b): n += 1
            m = 0
            while not g('v0') * 0.5 ** m < b: m += 1
            return [n, m]
        if i == 4:
            x = (g('x') ** g('a')) ** (1 / g('a'))
            return [x, math.log10(x)]
        kind, h = g('kind'), g('h')
        n = g('lead') * 10 ** h + g('tail') if kind == 0 else (10 ** (h + 1) - g('tail') if kind == 1 else 10 ** h)
        return [len(str(n)) - 1, len(str(n))]
    if slug == 't-inverse':
        if i == 0: return [1 / g('x1'), 1 / g('x2')]
        if i == 1: return [g('a') + g('k') / g('a'), 1 - g('k') / g('a') ** 2]
        if i == 2: return [g('c'), g('b')]
        if i == 3:
            m, b = g('m'), g('b')
            xs = [m * t / 1000 for t in range(1, 3000)]
            best = min(xs, key=lambda x: x + m * m / x + b)
            return [round(best, 2), best + m * m / best + b]
        if i == 4: return [-g('k') / g('a') ** 2, 2 * g('k') / g('a')]
        a, b, k, x = g('a'), g('b'), g('k'), g('x')
        return [a * x ** 3 + b * x * x - 2 * x + k / x, 3 * a * x * x + 2 * b * x - 2 - k / x ** 2]
    if slug == 't-statistiques':
        if i == 0:
            xs = [g('s') + j for j in range(1, 5)]
            ys = [g('a') * x + g('b') + e for x, e in zip(xs, PATTERNS[g('pat')])]
            return [sum(xs) / 4, sum(ys) / 4]
        if i == 1:
            x1, x2 = g('x1'), g('x1') + g('dx')
            y1, y2 = g('a') * x1 + g('b'), g('a') * x2 + g('b')
            a = (y2 - y1) / (x2 - x1)
            return [a, y1 - a * x1]
        if i == 2:
            x = g('x')
            return [g('a') * x + g('b'), 'interpolation' if 1 <= x <= 10 else 'extrapolation']
        if i == 3: return [g('x') ** 2, g('a') * g('x') ** 2 + g('b')]
        if i == 4: return [10 ** (g('a') * g('x') + g('b')), 10 ** g('a')]
        a, b, e = g('a'), g('b'), g('e')
        ys = [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e]
        return [sum((y - (a * x + b)) ** 2 for x, y in enumerate(ys, 1)), sum((y - (a * x + b + e)) ** 2 for x, y in enumerate(ys, 1))]
    if slug == 't-conditionnelles':
        if i == 0: return [g('b') / g('a'), g('t') / g('n')]
        if i == 1: return [g('a') * g('p'), g('a') * g('p') + (1 - g('a')) * g('q')]
        if i == 2:
            c = 1 - g('a') - g('b')
            return [c, g('a') * g('pa') + g('b') * g('pb') + c * g('pc')]
        if i == 3:
            t = g('a') * g('p') + (1 - g('a')) * g('q')
            return [t, g('a') * g('p') / t]
        if i == 4:
            j = round(g('a') * g('b') + g('d'), 6)
            return [g('a') * g('b'), 'oui' if math.isclose(j, g('a') * g('b')) else 'non']
        t = g('d') * g('se') + (1 - g('d')) * g('fp')
        return [t, g('d') * g('se') / t]
    if slug == 't-binomiale':
        n, p = g('n'), g('p')
        if i == 0: return [n, p, sum(k * prob(n, p, k) for k in range(n + 1))]
        if i == 1:
            row = [1]
            for _ in range(n): row = [1] + [x + y for x, y in zip(row, row[1:])] + [1]
            return [row[g('k')], sum(row)]
        if i == 2: return [prob(n, p, 0), prob(n, p, n)]
        if i == 3: return [prob(n, p, 1), prob(n, p, n - 1)]
        k = g('k')
        if i == 4: return [prob(n, p, k), 1 - prob(n, p, 0)]
        return [sum(prob(n, p, j) for j in range(k + 1)), sum(prob(n, p, j) for j in range(k, n + 1))]
    if slug == 't-variables':
        if i == 0:
            pr = LAWS[g('pi')]
            values = [-g('a'), 0, g('c') * g('a')]
            return [sum(v * q for v, q in zip(values, pr)), pr[1] + pr[2]]
        if i == 1:
            net = g('v') - g('cost')
            return [net, g('p') * net + (1 - g('p')) * -g('cost')]
        if i == 2:
            r = 1 - g('p') - g('q')
            return [r, g('x2') * g('q') + g('x3') * r]
        if i == 3: return [g('n') * g('p'), g('p')]
        if i == 4:
            counts = [g('k') + o for o in OFFSETS[g('pat')]]
            return [4 * g('n'), sum(c / g('n') for c in counts) / 4]
        counts = [g('c0'), g('c1'), g('c2'), g('c3')]
        return [sum(counts), sum(k * c for k, c in enumerate(counts)) / sum(counts), 3 * g('p')]
    if slug == 't-outils':
        if i == 0:
            f = [lambda k: k * k, lambda k: k, lambda k: 2 * k + 1][g('kind')]
            ks = list(range(g('start'), g('n') + 1))
            return [len(ks), sum(f(k) for k in ks)]
        if i == 1:
            u, s = g('a'), 0
            for _ in range(g('n')):
                if g('order'):
                    u *= g('q'); s += u
                else:
                    s += u; u *= g('q')
            return [s, u]
        if i == 2:
            row = [1]
            for _ in range(g('n') + 1): row = [1] + [x + y for x, y in zip(row, row[1:])] + [1]
            return [row[g('k1')], row[g('k2')]]
        if i == 3: return ['=B2*C2' if g('kind') else '=B2*$E$1', g('v') * g('coef')]
        if i == 4:
            values = [x for x in range(g('c'), g('c') + 6)
                      if (((x > g('limit')) or (x % 2 == g('par'))) if g('op') else ((x > g('limit')) and (x % 2 == g('par'))))]
            return [len(values), sum(values)]
        count = sum(1 for x in g('draws') if x < g('p'))
        return [count, count / 6]
    raise AssertionError(slug)


def check_numbers():
    result = subprocess.run(['node', str(ROOT / 'tests/test_terminale.js'), '--json'],
                            check=True, capture_output=True, text=True, timeout=300)
    cases = json.loads(result.stdout)
    assert len(cases) == 2592, len(cases)
    for case in cases:
        answers = expected(case['slug'], case['index'], case['params'])
        assert len(answers) == len(case['answers']), case
        for actual, expect in zip(case['answers'], answers):
            if isinstance(expect, str):
                assert actual == expect, (case, expect)
            else:
                tol = 0.006 if (case['slug'], case['index']) == ('t-inverse', 3) else 1e-9
                assert math.isclose(float(actual), expect, rel_tol=1e-9, abs_tol=tol), (case, expect)
    print(f'TERMINALE NUMERICAL OK: {len(cases)} variants independently recomputed in Python from their parameters; 54 models.')


if __name__ == '__main__':
    check_structure()
    check_numbers()
