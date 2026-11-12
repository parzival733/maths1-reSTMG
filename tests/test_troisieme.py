"""Structure des pages de 3e : leçons, séries, catalogues et programme.
Run: python3 tests/test_troisieme.py (bibliothèque standard de Python uniquement).
Les calculs des 96 modèles sont contrôlés par tests/test_troisieme.js.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
from validate_site import Page

ROOT = Path(__file__).resolve().parent.parent
SLUGS = ['3-arithmetique', '3-fractions', '3-puissances', '3-calcul-litteral', '3-equations',
         '3-proportionnalite', '3-fonctions', '3-fonctions-affines', '3-statistiques', '3-probabilites',
         '3-grandeurs', '3-pythagore', '3-thales', '3-trigonometrie', '3-transformations', '3-algorithmique']


def main():
    folder = ROOT / 'troisieme'
    paths = sorted(folder.rglob('*.html'))
    assert len(paths) == 37, len(paths)
    assert {p.stem for p in (folder / 'cours').glob('*.html')} == set(SLUGS)
    assert {p.stem for p in (folder / 'exercices').glob('*.html')} == set(SLUGS)
    pages = {p.resolve(): Page(p.read_text(encoding='utf-8')) for p in ROOT.rglob('*.html')
             if not any(x.startswith('.') or x in ('docs', 'public') for x in p.relative_to(ROOT).parts)}
    links = 0
    for path in paths:
        page, text = pages[path.resolve()], path.read_text(encoding='utf-8')
        assert page.lang == 'fr' and page.tags['h1'] == 1 and page.tags['main'] == 1, path
        assert 'contenu' in page.ids and len(page.ids) == len(set(page.ids)), path
        nav = re.search(r'<nav class="main-nav"[^>]*>[\s\S]*?</nav>', text).group()
        assert nav.count('<a ') == 5 and '>Brevet</a>' in nav, path
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path.resolve()
            assert target.is_relative_to(ROOT) and target.is_file(), (path, link)
            if url.fragment and target.suffix == '.html':
                assert unquote(url.fragment) in pages[target].ids, (path, link)
            links += 1
    for slug in SLUGS:
        lesson = folder / 'cours' / f'{slug}.html'
        page, text = pages[lesson.resolve()], lesson.read_text(encoding='utf-8')
        for cls, n in [('lesson-content', 1), ('lesson-immersive', 1), ('learning-path', 1), ('support-scaffold', 1),
                       ('study-quiz', 2), ('study-solution', 2), ('study-review', 1)]:
            assert page.classes[cls] == n, (slug, cls)
        assert page.classes['check'] >= 1 and page.tags['h2'] >= 6, slug
        assert '<article class="lesson-content"><aside class="lesson-prerequisites"' in text, slug
        assert all(day in text for day in ('J+1', 'J+7', 'J+21')), slug
        words = len(re.findall(r'\w+', ' '.join(page.text)))
        assert words >= 550, (slug, words)
        assert f'href="../exercices/{slug}.html"' in text, slug
        series = (folder / 'exercices' / f'{slug}.html').read_text(encoding='utf-8')
        assert f'data-troisieme-chapter="{slug}"' in series and 'troisieme-exercices.js' in series, slug
        assert series.count('data-offline-series') == 1 and series.count('<section class="exam-block">') == 6, slug
        assert 'variants-' not in series and 'terminale-exercices.js' not in series, slug
    # Catalogues : seize cartes, domaine affiché, sélecteur des quatre niveaux.
    for name in ['lecons', 'exercices']:
        text = (folder / f'{name}.html').read_text(encoding='utf-8')
        assert text.count('<a class="lesson-card"') == 16 and text.count('class="card-domain"') == 16, name
        switch = re.search(r'<nav class="level-switch"[\s\S]*?</nav>', text).group()
        assert switch.count('<a ') == 4 and 'aria-current="page">3e</a>' in switch, name
        for other in (ROOT / f'{name}.html', ROOT / 'terminale' / f'{name}.html'):
            assert '>3e</a>' in re.search(r'<nav class="level-switch"[\s\S]*?</nav>', other.read_text(encoding='utf-8')).group(), other
    progress = (folder / 'exercices.html').read_text(encoding='utf-8')
    assert 'data-level="troisieme"' in progress and '<option value="troisieme">' in progress
    programme = (folder / 'programme.html').read_text(encoding='utf-8')
    assert 'id="brevet"' in programme and 'MENE2018714A' in programme and programme.count('6 exercices') == 16
    brevet = (folder / 'brevet.html').read_text(encoding='utf-8')
    assert 'sujet-blanc.html' in brevet and 'dnb-sujet-de-reference' in brevet
    blanc = (folder / 'sujet-blanc.html').read_text(encoding='utf-8')
    assert blanc.count('<section class="exam-block') == 4 and 'exam-correction' in blanc and 'examen.js' in blanc
    # Recalcul indépendant des réponses du sujet blanc.
    from fractions import Fraction as Fr
    import math
    assert Fr(2, 3) + Fr(5, 6) == Fr(3, 2) and 5 - 3 * (-4) == 17 and Fr(15, 100) * 240 == 36 and Fr(13 + 7, 4) == 5
    assert 2 * 2 * 3 * 7 == 84 and math.hypot(6, 8) == 10 and sorted([12, 3, 15, 8, 7])[2] == 8
    assert round(math.hypot(4, 0.3), 2) == 4.01 and round(math.degrees(math.atan(0.3 / 4)), 1) == 4.3
    assert Fr(3, 10) / 4 == Fr(75, 1000) and Fr(3, 10) / Fr(5, 100) == 6
    assert Fr(30, Fr(45, 10) - 2) == 12 and Fr(45, 10) * 20 == 90 and 30 + 2 * 20 == 70
    primes = [n for n in range(2, 21) if all(n % d for d in range(2, n))]
    assert len(primes) == 8 and len([n for n in range(1, 21) if n % 5 == 0]) == 4 and len(range(13, 21)) == 8
    home = (ROOT / 'index.html').read_text(encoding='utf-8')
    for href in ['troisieme/lecons.html', 'troisieme/exercices.html', 'lecons.html', 'exercices.html',
                 'terminale/lecons.html', 'terminale/exercices.html']:
        assert f'href="{href}"' in home, href
    assert home.count('class="level-step ') == 4
    print(f'TROISIEME OK: 37 pages, 16 leçons et 16 séries, {links} liens locaux vérifiés, sélecteur de niveau sur l’accueil et les catalogues.')


if __name__ == '__main__':
    main()
