"""Construit public/, le seul dossier publié : pages, assets, données liées et fichiers
de configuration de l'hébergeur. Échoue si une page ou une feuille de style renvoie
vers un fichier local absent de public/.

    python3 tools/build_public.py

Bibliothèque standard uniquement.
"""
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, unquote
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public'
PAGE_DIRS = ('cours', 'exercices', 'terminale', 'entrainement', 'annexes', 'donnees')
ROOT_FILES = ('_headers', 'robots.txt', 'sitemap.xml', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png')


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.found = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if value and name in ('href', 'src', 'poster', 'data-src'):
                self.found.append(value)
            elif value and name == 'srcset':
                self.found += [part.strip().split(' ')[0] for part in value.split(',') if part.strip()]


def local_target(page, link):
    """Chemin relatif à la racine du site, ou None pour un lien externe ou interne à la page."""
    parts = urlsplit(link)
    if parts.scheme or parts.netloc or link.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
        return None
    path = unquote(parts.path)
    if not path:
        return None
    if path.startswith('/'):
        target = PurePosixPath(path.lstrip('/'))
    else:
        target = PurePosixPath(page).parent / path
    resolved = []
    for part in target.parts:
        if part == '..':
            if resolved:
                resolved.pop()
        elif part != '.':
            resolved.append(part)
    return '/'.join(resolved)


def pages():
    found = sorted(p for p in ROOT.glob('*.html'))
    for folder in PAGE_DIRS:
        found += sorted((ROOT / folder).rglob('*.html'))
    return found


def copy(rel):
    source, target = ROOT / rel, OUT / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    html_pages = [p.relative_to(ROOT).as_posix() for p in pages()]
    for rel in html_pages:
        copy(rel)
    for path in sorted((ROOT / 'assets').rglob('*')):
        if path.is_file():
            copy(path.relative_to(ROOT).as_posix())
    for rel in ROOT_FILES:
        copy(rel)

    # Fichiers de données : seulement ceux qu'une page lie.
    linked = {}
    for rel in html_pages:
        parser = Links()
        parser.feed((ROOT / rel).read_text(encoding='utf-8'))
        for link in parser.found:
            target = local_target(rel, link)
            if target:
                linked.setdefault(target, rel)
    for target in sorted(linked):
        if target.startswith('donnees/') and (ROOT / target).is_file() and not (OUT / target).exists():
            copy(target)

    # Feuilles de style : url(...) relatives (polices, icônes).
    for css in sorted((OUT / 'assets').rglob('*.css')):
        rel = css.relative_to(OUT).as_posix()
        for link in re.findall(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)', css.read_text(encoding='utf-8')):
            target = local_target(rel, link)
            if target:
                linked.setdefault(target, rel)

    missing = []
    for target, source in sorted(linked.items()):
        candidate = OUT / target
        if candidate.is_file() or (candidate.is_dir() and (candidate / 'index.html').is_file()):
            continue
        if not target or (OUT / (target + '.html')).is_file():
            continue
        missing.append(f'{source} -> {target}')
    if missing:
        sys.exit('Liens vers des fichiers absents de public/ :\n  ' + '\n  '.join(missing))

    files = [p for p in OUT.rglob('*') if p.is_file()]
    size = sum(p.stat().st_size for p in files)
    print(f'PUBLIC OK : {len(html_pages)} pages, {len(files)} fichiers, {size / 1e6:.1f} Mo dans public/.')


if __name__ == '__main__':
    main()
