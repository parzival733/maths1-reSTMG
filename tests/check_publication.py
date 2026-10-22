"""Read-only deployment smoke test for the public Cloudflare Pages site.

Compare selected published files to this checkout, then verify real 404s,
canonical URLs, robots, sitemap and security headers. No credentials required.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import time
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://mathstmgdls.pages.dev'
FILES = ('index.html', 'progresser.html', 'diagnostic.html', 'revisions.html',
         'mes-progres.html', 'preparer-bac.html', 'entrainement/sujet-blanc-1.html',
         'entrainement/sujet-blanc-2.html', 'assets/acquis.js', 'assets/parcours.js',
         'assets/exercices.js', 'robots.txt', 'sitemap.xml')

def fetch(path: str):
    request = Request(ORIGIN + '/' + path,
                      headers={'User-Agent': 'MathsSTMG-DeploymentCheck/1.0', 'Cache-Control': 'no-cache'})
    try:
        with urlopen(request, timeout=20) as response:
            return response.status, response.headers, response.read(), response.url
    except HTTPError as error:
        return error.code, error.headers, error.read(), error.url

def verify():
    checked = []
    for path in FILES:
        status, headers, body, url = fetch(path)
        assert status == 200, (path, status)
        assert urlsplit(url).netloc == urlsplit(ORIGIN).netloc, url
        assert hashlib.sha256(body).digest() == hashlib.sha256((ROOT / path).read_bytes()).digest(), (path, 'published version differs')
        if path.endswith('.html'):
            expected = ORIGIN + ('/' if path == 'index.html' else '/' + path[:-5])
            assert ('rel="canonical" href="' + expected + '"').encode() in body, path
            assert "script-src 'self'" in headers.get('Content-Security-Policy', ''), (path, 'CSP missing')
        if path == 'robots.txt':
            assert headers.get_content_type() == 'text/plain', headers.get('Content-Type')
        if path == 'sitemap.xml':
            sitemap = ET.fromstring(body)
            assert len(sitemap.findall('{*}url')) == 69
        checked.append({'path': path, 'status': status, 'url': url, 'matches_checkout': True})
    missing = 'controle-404-' + uuid.uuid4().hex + '/introuvable'
    status, _, body, _ = fetch(missing)
    assert status == 404 and b'ERREUR 404' in body, ('missing page', status)
    return {'ok': True, 'origin': ORIGIN, 'files': checked, 'missing_page_status': status}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--attempts', type=int, default=12)
    args = parser.parse_args()
    if not 1 <= args.attempts <= 20:
        parser.error('--attempts must be between 1 and 20')
    output = ROOT / '.qa-publication'
    output.mkdir(exist_ok=True)
    failure = None
    for attempt in range(1, args.attempts + 1):
        try:
            report = verify()
            (output / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
            print('PUBLICATION OK:', len(FILES), 'files match the checkout; real HTTP 404, CSP and canonical URLs.', flush=True)
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
