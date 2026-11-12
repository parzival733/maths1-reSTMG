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
import base64
import hashlib
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public'
PAGE_DIRS = ('cours', 'exercices', 'terminale', 'troisieme', 'entrainement', 'annexes', 'donnees')
ROOT_FILES = ('_headers', 'robots.txt', 'sitemap.xml', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png')
ASSET_SUFFIXES = frozenset(('.js', '.css', '.svg', '.png', '.ico', '.jpg', '.jpeg',
                            '.webp', '.avif', '.woff', '.woff2', '.ttf', '.otf'))
FONT_LICENSES = frozenset(('OFL-noto-sans.txt', 'OFL-noto-sans-math.txt',
                           'OFL-source-sans-3.txt', 'OFL-source-serif-4.txt'))


def check_source(rel):
    """Refuse les liens symboliques, y compris dans les dossiers parents."""
    path = Path(rel)
    if path.is_absolute() or '..' in path.parts:
        raise ValueError(f'Chemin de publication interdit : {rel}')
    for item in (path, *path.parents):
        if (ROOT / item).is_symlink():
            raise ValueError(f'Lien symbolique interdit dans public/ : {rel}')


def public_asset(rel):
    path = PurePosixPath(rel)
    if path == PurePosixPath('assets/fonts/LISEZMOI.md'):
        return False
    if any(part.startswith('.') for part in path.parts):
        raise ValueError(f'Fichier caché interdit dans public/ : {rel}')
    license_file = path.parent == PurePosixPath('assets/fonts') and path.name in FONT_LICENSES
    if path.suffix.lower() not in ASSET_SUFFIXES and not license_file:
        raise ValueError(f'Type de fichier non autorisé dans les assets publics : {rel}')
    return True


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
    check_source(rel)
    source, target = ROOT / rel, OUT / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def check_style_policy(html_pages):
    """Échoue avant publication si la CSP bloquerait les styles statiques."""
    headers = (ROOT / '_headers').read_text(encoding='utf-8')
    rule = re.search(r'(?<![\w-])style-src\s+([^;\n]+)', headers)
    allowed = set(rule.group(1).split()) if rule else set()
    for rel in html_pages:
        for css in re.findall(r'<style\b[^>]*>([\s\S]*?)</style\s*>',
                              (ROOT / rel).read_text(encoding='utf-8'), re.I):
            digest = base64.b64encode(hashlib.sha256(css.encode('utf-8')).digest()).decode('ascii')
            if "'sha256-" + digest + "'" not in allowed:
                raise ValueError(f'Empreinte CSS absente de la CSP : {rel}. '
                                 'Exécuter python3 tools/finalize_site.py avant la publication.')


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    html_pages = [p.relative_to(ROOT).as_posix() for p in pages()]
    check_style_policy(html_pages)
    for rel in html_pages:
        copy(rel)
    for path in sorted((ROOT / 'assets').rglob('*')):
        rel = path.relative_to(ROOT).as_posix()
        check_source(rel)
        if path.is_file() and public_asset(rel):
            copy(rel)
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
            if PurePosixPath(target).suffix.lower() != '.csv':
                raise ValueError(f'Donnée non autorisée dans public/ : {target}')
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
