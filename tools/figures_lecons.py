"""Figures des leçons et des sujets : remplit chaque <figure class="lesson-figure" data-figure="nom">.

Les figures sont décrites dans tools/figures_lecons.js avec les nombres du texte.
Une leçon ne contient que l'emplacement :

    <figure class="lesson-figure" data-figure="3-pythagore"></figure>

`apply(ROOT)` (appelé par finalize_site.py) calcule le SVG avec assets/figures.js et
l'écrit dans l'emplacement. L'opération est idempotente : une figure déjà à jour
n'est pas modifiée. Un nom inconnu arrête la normalisation.

`python3 tools/figures_lecons.py` écrit la galerie de relecture
`.qa-figures/lecons.html` (toutes les figures des leçons, thèmes clair et sombre).
"""
from pathlib import Path
import json
import re
import subprocess

import figures

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tools' / 'figures_lecons.js'
EMPLACEMENT = re.compile(r'<figure class="lesson-figure(?: figure-large)?" data-figure="([^"]+)">[\s\S]*?</figure>')
# Leçons des quatre niveaux, puis sujets blancs et problèmes (entrainement/) et brevet blanc (troisieme/).
DOSSIERS = ('cours', 'terminale/cours', 'troisieme/cours', 'seconde/cours', 'entrainement', 'troisieme')
_descriptions = None


def descriptions():
    """Descriptions de toutes les figures des leçons, par nom."""
    global _descriptions
    if _descriptions is None:
        _descriptions = json.loads(subprocess.check_output(['node', str(SOURCE)], text=True, encoding='utf-8', cwd=ROOT))
    return _descriptions


def emplacement(nom):
    """Emplacement vide à écrire dans le texte d'une leçon."""
    if nom not in descriptions():
        raise KeyError('Figure de leçon inconnue : ' + nom)
    return f'<figure class="lesson-figure" data-figure="{nom}"></figure>'


def rendu(noms):
    """Bloc <figure> complet de chaque figure demandée."""
    connues = descriptions()
    inconnues = [n for n in noms if n not in connues]
    if inconnues:
        raise KeyError('Figures de leçon inconnues : ' + ', '.join(inconnues))
    blocs = figures.rendre_lot([('html', connues[n], {'id': 'fig-' + n, 'nom': n}) for n in noms])
    return dict(zip(noms, blocs))


def remplir(texte):
    noms = EMPLACEMENT.findall(texte)
    if not noms:
        return texte
    blocs = rendu(list(dict.fromkeys(noms)))
    return EMPLACEMENT.sub(lambda m: blocs[m.group(1)], texte)


def pages(root):
    for dossier in DOSSIERS:
        yield from sorted((root / dossier).glob('*.html'))


def apply(root: Path):
    for page in pages(root):
        texte = page.read_text(encoding='utf-8')
        nouveau = remplir(texte)
        if nouveau != texte:
            page.write_text(nouveau, encoding='utf-8')


def galerie():
    noms = list(descriptions())
    blocs = rendu(noms)
    style = ('body{font:15px system-ui,sans-serif;margin:16px}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));'
             'gap:14px;padding:16px;margin-bottom:16px}figure{margin:0}svg{display:block;max-width:100%;height:auto}'
             'figcaption{font-size:13px;opacity:.75}code{font-size:12px;opacity:.6}.clair{background:#fff;color:#252436}.sombre{background:#1d1c28;color:#ecebf5}'
             '.fig-c1{color:#0b5e96}.fig-c2{color:#bc570c}.sombre .fig-c1{color:#7cc4ff}.sombre .fig-c2{color:#ffad6b}')
    corps = ''.join('<section class="' + theme + '">' + ''.join('<div><code>' + n + '</code>' + blocs[n] + '</div>' for n in noms) + '</section>'
                    for theme in ('clair', 'sombre'))
    sortie = ROOT / '.qa-figures'
    sortie.mkdir(exist_ok=True)
    (sortie / 'lecons.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Figures des leçons</title><style>'
                                        + style + '</style>' + corps + '</html>', encoding='utf-8')
    print(len(noms), 'figures dans', sortie / 'lecons.html')


if __name__ == '__main__':
    galerie()
