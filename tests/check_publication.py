"""Contrôle en lecture seule du site publié par Cloudflare Pages.

Construit public/ comme l'hébergeur, puis vérifie sur le site en ligne que :
- chaque page et chaque fichier publié répondent 200, identiques à public/ ;
- les fichiers internes du dépôt (docs, tests, outils, README, workflows) répondent 404 ;
- une adresse inconnue répond une vraie 404, avec la page d'erreur du site ;
- URL canoniques, robots, sitemap et politique de sécurité sont en place.

    python3 tests/check_publication.py [--attempts N]
"""
from __future__ import annotations
import argparse
import hashlib
import json
import subprocess
import sys
import time
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
ORIGIN = 'https://mathstmgdls.pages.dev'
ALIASES = {'progresser.html': 'exercices.html', 'preparer-bac.html': 'sujets.html'}
# Fichiers du dépôt qui ne doivent jamais être servis.
PRIVATE = ('docs/audit-et-arbitrages.md', 'docs/maintenance.md', 'docs/validation-humaine.md',
           'tests/check_publication.py', 'tests/validate_site.py', 'tools/finalize_site.py',
           'tools/build_public.py', 'README.md', '.github/workflows/verification.yml',
           'donnees/README.md', 'donnees/sujets.json', '.gitignore')


def fetch(path: str):
    request = Request(ORIGIN + '/' + path,
                      headers={'User-Agent': 'MathsSTMG-DeploymentCheck/1.0', 'Cache-Control': 'no-cache'})
    try:
        with urlopen(request, timeout=20) as response:
            return response.status, response.headers, response.read(), response.url
    except HTTPError as error:
        return error.code, error.headers, error.read(), error.url


def published_files():
    return sorted(p.relative_to(PUBLIC).as_posix() for p in PUBLIC.rglob('*')
                  if p.is_file() and p.name != '_headers')


def verify():
    checked = []
    for path in published_files():
        status, headers, body, url = fetch(path)
        assert status == 200, (path, status)
        assert urlsplit(url).netloc == urlsplit(ORIGIN).netloc, url
        expected_body = (PUBLIC / path).read_bytes()
        if path != '404.html':
            assert hashlib.sha256(body).digest() == hashlib.sha256(expected_body).digest(), (path, 'published version differs')
        if path.endswith('.html') and path != '404.html':
            target = ALIASES.get(path, path)
            expected = ORIGIN + ('/' if target == 'index.html' else '/' + target[:-5])
            assert ('rel="canonical" href="' + expected + '"').encode() in body, path
            assert "script-src 'self'" in headers.get('Content-Security-Policy', ''), (path, 'CSP missing')
        if path == 'robots.txt':
            assert headers.get_content_type() == 'text/plain', headers.get('Content-Type')
        if path == 'sitemap.xml':
            published = {e.text for e in ET.fromstring(body).findall('{*}url/{*}loc')}
            local = {e.text for e in ET.fromstring(expected_body).findall('{*}url/{*}loc')}
            assert published == local, 'sitemap differs'
        checked.append({'path': path, 'status': status})
    private = []
    for path in PRIVATE:
        status, _, _, _ = fetch(path)
        assert status == 404, (path, 'internal file is public', status)
        private.append({'path': path, 'status': status})
    missing = 'controle-404-' + uuid.uuid4().hex + '/introuvable'
    status, _, body, _ = fetch(missing)
    assert status == 404 and b'ERREUR 404' in body, ('missing page', status)
    return {'ok': True, 'origin': ORIGIN, 'files': checked, 'private': private, 'missing_page_status': status}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--attempts', type=int, default=12)
    args = parser.parse_args()
    if not 1 <= args.attempts <= 20:
        parser.error('--attempts must be between 1 and 20')
    subprocess.run([sys.executable, str(ROOT / 'tools' / 'build_public.py')], check=True)
    output = ROOT / '.qa-publication'
    output.mkdir(exist_ok=True)
    failure = None
    for attempt in range(1, args.attempts + 1):
        try:
            report = verify()
            (output / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
            print(f"PUBLICATION OK : {len(report['files'])} fichiers publiés identiques à public/, "
                  f"{len(report['private'])} fichiers internes en 404, vraie page 404, CSP et URL canoniques.", flush=True)
            return
        except (AssertionError, URLError, TimeoutError, ET.ParseError) as error:
            failure = str(error)
            print(f'CHECK {attempt}/{args.attempts}: {failure}', flush=True)
            if attempt < args.attempts:
                time.sleep(15)
    (output / 'report.json').write_text(json.dumps({'ok': False, 'origin': ORIGIN, 'error': failure}, indent=2), encoding='utf-8')
    raise SystemExit('Published version could not be verified: ' + str(failure))


if __name__ == '__main__':
    main()
