#!/usr/bin/env python3
"""Poids de chaque page : HTML, scripts, feuilles de style et polices qu'elle charge, sans compression.

Le contrôle dans le navigateur (tests/browser_cloture.py) mesure une page témoin ; celui-ci
couvre toutes les pages, en additionnant la taille des fichiers locaux qu'elles chargent.
Le favicon et les requêtes faites par les scripts ne sont pas comptés.
"""
import re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUDGET = 400_000  # octets, comme dans tests/browser_cloture.py
# Ce qu'un navigateur ajoute à la somme des fichiers (en-têtes HTTP, favicon) : environ 10 ko mesurés.
MARGE = 12_000


def locaux(page, texte):
    """Fichiers locaux chargés par une page : src et href de scripts, styles, polices préchargées."""
    out = set()
    for lien in re.findall(r'<(?:script|link)\b[^>]*?(?:src|href)="([^"#]+)"', texte):
        if '//' in lien or not re.search(r'\.(js|css|woff2)(\?|$)', lien):
            continue
        chemin = (page.parent / lien.split('?')[0]).resolve()
        if chemin.is_file():
            out.add(chemin)
    # Polices déclarées par les feuilles de style chargées.
    for css in [p for p in out if p.suffix == '.css']:
        for url in re.findall(r'url\(["\']?([^)"\']+\.woff2)', css.read_text(encoding='utf-8')):
            chemin = (css.parent / url).resolve()
            if chemin.is_file():
                out.add(chemin)
    return out


def main():
    pages = [ROOT / p for p in subprocess.check_output(['git', 'ls-files', '*.html'], cwd=ROOT, text=True).split()
             if not p.startswith(('docs/', 'public/', 'tests/'))]
    poids = {}
    for page in pages:
        texte = page.read_text(encoding='utf-8')
        poids[page.relative_to(ROOT).as_posix()] = len(texte.encode()) + sum(f.stat().st_size for f in locaux(page, texte))
    trop = {p: v for p, v in poids.items() if v + MARGE > BUDGET}
    assert not trop, 'Pages au-dessus du budget de poids : ' + ', '.join(f'{p} ({v // 1000} ko)' for p, v in sorted(trop.items()))
    lourde = max(poids, key=poids.get)
    print(f'POIDS OK : {len(poids)} pages sous {BUDGET // 1000} ko ; la plus lourde, {lourde}, pèse environ {(poids[lourde] + MARGE) // 1000} ko.')


if __name__ == '__main__':
    main()
