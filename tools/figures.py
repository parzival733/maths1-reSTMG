"""Pont vers le moteur de figures (assets/figures.js).

Les pages générées en Python décrivent une figure par un dictionnaire, envoyé
en JSON à node ; le SVG revient tel que le navigateur le calculerait. Leçons,
exercices et sujets partagent ainsi exactement le même code.

    from figures import figure_html
    figure_html({'type': 'figure', 'titre': 'Triangle ABC rectangle en A', 'elements': [
        {'t': 'point', 'nom': 'A', 'x': 0, 'y': 0}, {'t': 'point', 'nom': 'B', 'x': 6, 'y': 0},
        {'t': 'point', 'nom': 'C', 'x': 0, 'y': 8}, {'t': 'polygone', 'points': ['A', 'B', 'C']},
        {'t': 'angle_droit', 'sommet': 'A', 'p': 'B', 'q': 'C'}]})

`python3 tools/figures.py` écrit la galerie de contrôle `.qa-figures/galerie.html`
(toutes les figures d'exemple de tests/figures_exemples.js, thèmes clair et sombre).
"""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MOTEUR = ROOT / 'assets' / 'figures.js'
SCRIPT = """const F = require(process.argv[1]);
let brut = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => { brut += d; });
process.stdin.on('end', () => {
  const lot = JSON.parse(brut);
  process.stdout.write(JSON.stringify(lot.map(x => F[x.sortie](x.figure, x.options))));
});"""
_cache = {}


def rendre_lot(demandes):
    """Rend plusieurs figures en un seul appel à node.

    `demandes` : liste de (sortie, description, options) avec sortie « svg » ou « html ».
    """
    cles = [json.dumps(d, ensure_ascii=False, sort_keys=True) for d in demandes]
    manquantes = [i for i, c in enumerate(cles) if c not in _cache]
    if manquantes:
        lot = [{'sortie': demandes[i][0], 'figure': demandes[i][1], 'options': demandes[i][2]} for i in manquantes]
        resultat = subprocess.run(['node', '-e', SCRIPT, str(MOTEUR)], input=json.dumps(lot, ensure_ascii=False),
                                  capture_output=True, text=True, encoding='utf-8', cwd=ROOT)
        if resultat.returncode:
            raise RuntimeError('Figure impossible à calculer :\n' + resultat.stderr)
        for i, sortie in zip(manquantes, json.loads(resultat.stdout)):
            _cache[cles[i]] = sortie
    return [_cache[c] for c in cles]


def figure_svg(description, identifiant=None):
    """SVG seul (balise <svg>, titre et description accessibles compris)."""
    return rendre_lot([('svg', description, {'id': identifiant} if identifiant else None)])[0]


def figure_html(description, classe='lesson-figure', identifiant=None):
    """Bloc <figure> complet : SVG et <figcaption> identique au titre."""
    options = {'classe': classe}
    if identifiant:
        options['id'] = identifiant
    return rendre_lot([('html', description, options)])[0]


def galerie():
    exemples = json.loads(subprocess.check_output(
        ['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(ROOT / 'tests' / 'figures_exemples.js')],
        text=True, encoding='utf-8', cwd=ROOT))
    blocs = rendre_lot([('html', d, None) for d in exemples])
    style = ('body{font:15px system-ui,sans-serif;margin:16px}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));'
             'gap:12px;padding:16px;margin-bottom:16px}figure{margin:0}svg{display:block;max-width:100%;height:auto}'
             'figcaption{font-size:13px;opacity:.75}.clair{background:#fff;color:#252436}.sombre{background:#1d1c28;color:#ecebf5}'
             '.fig-c1{color:#0b5e96}.fig-c2{color:#bc570c}.sombre .fig-c1{color:#7cc4ff}.sombre .fig-c2{color:#ffad6b}')
    page = ('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Galerie des figures</title><style>' + style + '</style>'
            + ''.join('<section class="' + theme + '">' + ''.join(blocs) + '</section>' for theme in ('clair', 'sombre')) + '</html>')
    sortie = ROOT / '.qa-figures'
    sortie.mkdir(exist_ok=True)
    (sortie / 'galerie.html').write_text(page, encoding='utf-8')
    print(len(blocs), 'figures dans', sortie / 'galerie.html')


if __name__ == '__main__':
    galerie()
