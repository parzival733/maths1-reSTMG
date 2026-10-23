"""Catalogue, preservation, navigation, filters, mobile and no-JavaScript regression tests."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from collections import Counter
import json, re, hashlib, subprocess, os
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.links=[];self.tags=Counter();self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);self.tags[tag]+=1
        if 'id' in a:self.ids.append(a['id'])
        for k in ['src','href']:
            if k in a:self.links.append(a[k])
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    data=json.loads((ROOT/'donnees/sujets.json').read_text())
    assert len(data)==41 and len({r['url'] for r in data})==41
    assert Counter(r['level'] for r in data)=={'premiere':10,'terminale':31}
    assert sum(r['kind']=='zero' for r in data)==2
    for r in data:
        assert r['pages']>0 and len(r['sha256'])==64
        assert r['url'].startswith('https://') and r['url'].endswith('.pdf')
        host=urlsplit(r['url']).hostname
        assert host in {'www.apmep.fr','www.education.gouv.fr','eduscol.education.gouv.fr','www.sujetdebac.fr'}
        if host=='www.sujetdebac.fr':assert r['source']=='Sujetdebac.fr'
    assert data[1]['url'].endswith('metropole_SG-v2.pdf'),'Metropole must not link to the Antilles-Guyane original'
    # The existing immutable content manifest covers 50 teaching areas and 22 engines.
    manifest=json.loads((ROOT/'tests/interface-content.json').read_text())
    for name,expected in manifest.items():
        text=(ROOT/name).read_text()
        value=re.search(r'<main\b[\s\S]*?</main>',text).group() if expected['part']=='main' else text
        assert hashlib.sha256(value.encode()).hexdigest()==expected['sha256'],name
    paths=[p for p in ROOT.rglob('*.html') if not any(x.startswith('.') for x in p.relative_to(ROOT).parts)]
    pages={p.resolve():Page(p.read_text()) for p in paths}
    for p in paths:
        text=p.read_text();page=pages[p.resolve()]
        assert page.tags['h1']==1 and page.tags['main']==1
        assert len(page.ids)==len(set(page.ids)),p
        if p.name=='404.html':continue
        nav=re.search(r'<nav\b[^>]*class="main-nav"[^>]*>[\s\S]*?</nav>',text).group()
        assert nav.count('<a ')==5 and nav.count('>Sujets</a>')==1,p
        for link in page.links:
            u=urlsplit(link)
            if u.scheme or u.netloc:continue
            target=(p.parent/unquote(u.path)).resolve() if u.path else p.resolve()
            assert target.is_file(),(p,link)
            if u.fragment and target.suffix=='.html':assert unquote(u.fragment) in pages[target].ids,(p,link)
    # Idempotent regeneration: no duplicated tabs, no changes to unrelated files.
    watched=[*paths,ROOT/'assets/interface.css',ROOT/'tests/test_interface.py',ROOT/'README.md']
    before={str(p):p.read_bytes() for p in watched}
    subprocess.run(['python3','tools/build_sujets.py'],cwd=ROOT,check=True)
    assert all(p.read_bytes()==before[str(p)] for p in watched)
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT.parent)))
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'
    out=ROOT/'.qa-sujets';out.mkdir(exist_ok=True)
    errors=[];external=[]
    try:
        with sync_playwright() as p:
            exe=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
            browser=p.chromium.launch(**({'executable_path':exe} if exe else {}))
            context=browser.new_context(viewport={'width':1280,'height':960})
            page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda r:external.append(r.url) if urlsplit(r.url).hostname!='127.0.0.1' else None)
            page.goto(base+'sujets.html')
            expect(page.locator('.subject-card')).to_have_count(41)
            expect(page.locator('.subject-card:visible')).to_have_count(10)
            expect(page.locator('#subjects-context')).to_contain_text('2027')
            page.screenshot(path=str(out/'sujets-premiere-desktop.png'),full_page=True)
            page.locator('input[value=terminale]').check()
            expect(page.locator('.subject-card:visible')).to_have_count(31)
            page.locator('#subjects-year').select_option('2019')
            expect(page.locator('.subject-card:visible')).to_have_count(9)
            page.locator('#subjects-search').fill('caledonie')
            expect(page.locator('.subject-card:visible')).to_have_count(2)
            page.reload();expect(page.locator('.subject-card:visible')).to_have_count(2)
            page.locator('#subjects-search').fill('no-such-subject')
            expect(page.locator('#subjects-empty')).to_be_visible()
            expect(page.locator('.subjects-group:visible')).to_have_count(0)
            page.locator('[data-reset-subjects]').first.click()
            expect(page.locator('.subject-card:visible')).to_have_count(10)
            page.locator('#subjects-search').fill('metropole septembre')
            expect(page.locator('.subject-card:visible')).to_have_count(1)
            page.goto(base+'sujets.html?niveau=all')
            expect(page.locator('.subject-card:visible')).to_have_count(41)
            for a in page.locator('.subject-footer a').all():
                assert a.get_attribute('target')=='_blank' and 'noopener' in a.get_attribute('rel')
                assert 'nouvel onglet' in a.get_attribute('aria-label')
            # Verify popup semantics without depending on an external website during browser tests.
            context.route('https://www.education.gouv.fr/**',lambda route:route.fulfill(status=200,content_type='text/html',body='<title>PDF source</title>'))
            with page.expect_popup() as popup:page.locator('.subject-footer a').first.click()
            popup.value.wait_for_load_state();assert 'education.gouv.fr' in popup.value.url;popup.value.close()
            external.clear()
            for width in [320,390,768,1280]:
                page.set_viewport_size({'width':width,'height':960})
                for name in ['sujets.html','index.html','lecons.html','cours/fonctions.html','exercices/fonctions.html','terminale/lecons.html','terminale/cours/t-logarithme.html','annexes/calcul-rapide.html']:
                    page.goto(base+name)
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(name,width)
                    links=page.locator('.main-nav a');expect(links).to_have_count(5)
                    for link in links.all():
                        assert link.bounding_box()['height']>=44
                        assert link.evaluate('e=>e.scrollWidth<=e.clientWidth+1'),('clipped nav',name,width)
                    if name=='sujets.html':
                        if width in [320,390]:page.screenshot(path=str(out/f'sujets-premiere-{width}.png'),full_page=True)
                        page.locator('input[value=premiere]').focus();page.keyboard.press('ArrowRight')
                        expect(page.locator('input[value=terminale]')).to_be_checked()
                        page.locator('#subjects-year').select_option('2020')
                        expect(page.locator('.subject-card:visible')).to_have_count(4)
                        if width==1280:page.screenshot(path=str(out/'sujets-terminale-desktop.png'),full_page=True)
                    else:
                        page.get_by_role('link',name='Sujets',exact=True).click()
                        expected_level = 'terminale' if name.startswith('terminale/') else 'premiere'
                        expect(page.locator('input[name=level][value=' + expected_level + ']')).to_be_checked()
                        expect(page.locator('.subject-card:visible')).to_have_count(31 if expected_level == 'terminale' else 10)
            assert not external,('unexpected external page load',external)
            nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900})
            plain=nojs.new_page();plain.goto(base+'sujets.html')
            expect(plain.locator('.subject-card:visible')).to_have_count(41)
            expect(plain.locator('#subjects-filters')).to_be_hidden()
            expect(plain.locator('#subjects-static-nav')).to_be_visible()
            assert not errors,errors
            nojs.close();context.close();browser.close()
    finally:server.shutdown();server.server_close()
    print(f'SUJETS OK: 41 PDFs, 72 protected areas, {len(paths)} pages, filters, keyboard, no-JS and 320/390/768/1280px.')

if __name__=='__main__':main()
