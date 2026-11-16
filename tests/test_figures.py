"""Figures : pont Python vers le moteur, typographie et figures des pages publiées."""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import figures  # noqa: E402
import typographie  # noqa: E402

NODE = "const F=require(process.argv[1]);process.stdout.write(JSON.stringify(require(process.argv[2]).map(d=>[d,F.svg(d),F.html(d)])))"
exemples = json.loads(subprocess.check_output(
    ['node', '-e', NODE, str(ROOT / 'assets' / 'figures.js'), str(ROOT / 'tests' / 'figures_exemples.js')],
    text=True, encoding='utf-8', cwd=ROOT))
assert len(exemples) >= 45, 'galerie complète'

# 1. Le pont Python rend exactement ce que le moteur calcule dans node, figure par figure ou par lot.
for description, svg, html in exemples:
    assert figures.figure_svg(description) == svg, description['titre']
    assert figures.figure_html(description) == html, description['titre']
lot = figures.rendre_lot([('html', d, None) for d, _, _ in exemples])
assert lot == [html for _, _, html in exemples], 'rendu par lot identique'
premiere = exemples[0][0]
assert 'id="fig-essai"' in figures.figure_svg(premiere, 'fig-essai')
assert figures.figure_html(premiere, classe='exercise-figure').startswith('<figure class="exercise-figure"><svg ')
try:
    figures.figure_svg({'type': 'inconnu', 'titre': 'x'})
except RuntimeError as erreur:
    assert 'Type de figure inconnu' in str(erreur)
else:
    raise AssertionError('une description invalide doit échouer clairement')


# 2. Le moteur applique déjà la typographie française : l'outil du site ne change plus rien,
#    le titre accessible et la légende restent donc identiques.
for description, _, html in exemples:
    assert typographie.fix_html('<main>' + html + '</main>') == '<main>' + html + '</main>', description['titre'] + ' : typographie définitive'
    titre = re.search(r'<title[^>]*>([^<]*)</title>', html).group(1)
    assert titre == typographie.fix_text(description['titre']), 'titre mis en forme comme le reste du site'
phrase = "Le point d'intersection : A ; B ? « oui » à 40 cm, 12 % et 3 h"
assert figures.figure_html({'type': 'figure', 'titre': phrase, 'elements': [{'t': 'point', 'nom': 'A', 'x': 0, 'y': 0}]}).count(
    typographie.fix_text(phrase).replace('&', '&amp;')) == 2, 'mêmes règles que tools/typographie.py'

# 3. Figures des pages : identifiants uniques, aucun style intégré, titre et légende identiques,
#    et chaque figure de leçon est exactement celle que décrit tools/figures_lecons.js.
import figures_lecons  # noqa: E402

pages = sorted(p for p in ROOT.rglob('*.html') if not any(part in ('public', 'node_modules', 'tools') or part.startswith('.') for part in p.relative_to(ROOT).parts))
total = 0
for page in pages:
    texte = page.read_text(encoding='utf-8')
    texte = re.sub(r'<noscript[\s\S]*?</noscript>', '', texte)
    ids = re.findall(r'\sid="([^"]+)"', texte)
    for bloc in re.findall(r'<figure class="(?:lesson|exercise)-figure[^>]*>[\s\S]*?</figure>', texte):
        total += 1
        nom = str(page.relative_to(ROOT))
        svg = re.search(r'<svg[\s\S]*?</svg>', bloc)
        assert svg, nom + ' : figure sans SVG'
        assert not re.search(r'\sstyle\s*=|<style', bloc), nom + ' : style intégré dans une figure'
        assert 'role="img"' in svg.group(0), nom + ' : role="img" absent'
        titre = re.search(r'<title id="([^"]+)">([^<]*)</title>', svg.group(0))
        legende = re.search(r'<figcaption>([^<]*)</figcaption>', bloc)
        assert titre and legende and titre.group(2) == legende.group(1), nom + ' : titre et légende différents'
        assert re.search(r'aria-labelledby="' + re.escape(titre.group(1)) + r'[" ]', svg.group(0)), nom + ' : aria-labelledby'
        assert ids.count(titre.group(1)) == 1, nom + ' : identifiant de figure répété (' + titre.group(1) + ')'
        assert not re.search(r'NaN|Infinity|undefined', svg.group(0)), nom + ' : valeur invalide'

descriptions = figures_lecons.descriptions()
placees = {}
for page in figures_lecons.pages(ROOT):
    texte = page.read_text(encoding='utf-8')
    assert figures_lecons.remplir(texte) == texte, f'{page.relative_to(ROOT)} : figures à recalculer (python3 tools/finalize_site.py)'
    for nom in re.findall(r'data-figure="([^"]+)"', texte):
        assert nom not in placees, f'figure {nom} placée deux fois ({placees.get(nom)} et {page.name})'
        placees[nom] = page.name
        assert nom.split('-')[0] == {'cours': '1', 'terminale/cours': 't', 'troisieme/cours': '3', 'seconde/cours': '2', 'entrainement': 's', 'troisieme': '3'}[str(page.parent.relative_to(ROOT))], f'{nom} : préfixe de niveau'
assert set(placees) == set(descriptions), 'figures décrites mais jamais placées : ' + ', '.join(sorted(set(descriptions) - set(placees)))
assert not list(ROOT.glob('cours/*.html')) or all('class="figure"' not in p.read_text(encoding='utf-8') for p in figures_lecons.pages(ROOT)), 'figure dessinée à la main dans une leçon'

print(f'Figures : pont Python identique au moteur pour {len(exemples)} exemples ; {total} figures contrôlées dans {len(pages)} pages, dont {len(placees)} figures de leçon.')
