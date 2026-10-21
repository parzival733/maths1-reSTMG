"""Presentation, countdown, keyboard/mobile, and unchanged teaching-content checks."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import hashlib
import json
import os
import re
import subprocess
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
INLINE = os.environ.get('UI_INLINE') == '1'

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

def main():
    manifest = json.loads((ROOT/'tests/interface-content.json').read_text())
    for path, data in manifest.items():
        text = (ROOT/path).read_text(encoding='utf-8')
        part = re.search(r'<main\b[\s\S]*?</main>', text).group() if data['part']=='main' else text
        assert hashlib.sha256(part.encode()).hexdigest() == data['sha256'], ('changed teaching content', path)
    subprocess.run(['node','tests/test_countdown.js'],cwd=ROOT,check=True)
    print(f'CONTENU INCHANGE: {len(manifest)} zones de cours, exercices et moteurs compares octet par octet.')
    server = ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    output = ROOT/'.qa-interface';output.mkdir(exist_ok=True)
    errors=[]
    try:
        with sync_playwright() as p:
            launch={'executable_path':os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']} if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {}
            browser=p.chromium.launch(**launch)
            def load(name, width=1280, js=True):
                context=browser.new_context(viewport={'width':width,'height':900},java_script_enabled=js)
                page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
                if INLINE:
                    from bs4 import BeautifulSoup
                    from urllib.parse import urlsplit
                    doc=BeautifulSoup((ROOT/name).read_text(),'html.parser');scripts=[]
                    for el in doc.select('link[rel=stylesheet]'):
                        style=doc.new_tag('style');style.string=((ROOT/name).parent/urlsplit(el['href']).path).read_text();el.replace_with(style)
                    for el in doc.select('script[src]'):
                        scripts.append(((ROOT/name).parent/urlsplit(el['src']).path).read_text());el.decompose()
                    page.set_content(str(doc))
                    if js:
                        for script in scripts:page.add_script_tag(content=script)
                else:page.goto(base+name)
                return page
            def samples(page):
                return page.evaluate('''() => { const d=document.getElementById('rapid-app').dataset; return QuickMath.session({level:d.level,method:d.method,topic:d.topic,count:Number(d.count),seed:Number(d.seed)}); }''')
            page=load('annexes/calcul-rapide.html')
            page.clock.install()
            expect(page.locator('#rapid-app')).to_have_attribute('data-phase','ready')
            expect(page.locator('#rapid-work')).to_be_hidden()
            expect(page.locator('input[name=level]')).to_have_count(4)
            page.clock.fast_forward(600000)
            expect(page.locator('#rapid-app')).to_have_attribute('data-phase','ready')
            page.locator('#rapid-minutes').fill('0');page.locator('#rapid-seconds').fill('0')
            page.locator('#rapid-start').click();expect(page.locator('#rapid-error')).to_contain_text('15 secondes')
            page.locator('#rapid-seconds').fill('30');page.locator('#rapid-start').click()
            expect(page.locator('#rapid-time')).to_have_text('00:30')
            assert all(q['level']!='terminale' for q in samples(page))
            page.clock.fast_forward(10000);expect(page.locator('#rapid-time')).to_have_text('00:20')
            page.locator('#rapid-answer').fill(samples(page)[0]['expected'])
            page.locator('#rapid-pause').click();expect(page.locator('#rapid-app')).to_have_attribute('data-phase','paused')
            expect(page.locator('#rapid-card')).to_be_hidden()
            page.clock.fast_forward(120000);expect(page.locator('#rapid-time')).to_have_text('00:20')
            page.locator('#rapid-configure').click();page.locator('input[name=level][value=terminale]').check()
            old=page.locator('#rapid-app').get_attribute('data-seed')
            page.locator('#rapid-cancel-setup').click()
            expect(page.locator('#rapid-app')).to_have_attribute('data-phase','paused')
            expect(page.locator('#rapid-app')).to_have_attribute('data-seed',old)
            page.locator('#rapid-pause').click()
            expect(page.locator('#rapid-answer')).to_have_value(samples(page)[0]['expected'])
            page.clock.fast_forward(20000)
            expect(page.locator('#rapid-app')).to_have_attribute('data-phase','finished')
            expect(page.locator('#rapid-result-title')).to_contain_text('Temps écoulé')
            expect(page.locator('#rapid-score')).to_contain_text('1 / 10')
            page.locator('#rapid-return').click()
            expect(page.locator('#rapid-check')).to_be_disabled()
            assert page.locator('#rapid-answer').evaluate('el=>el.readOnly')
            page.locator('#rapid-solution-button').click();expect(page.locator('#rapid-progress-text')).to_contain_text('1 réussite')
            # Reconfiguration puis delai d'arriere-plan : la duree n'est pas remise a zero.
            page.locator('#rapid-configure').click();page.locator('input[name=level][value=bac]').check()
            page.locator('#rapid-start').click();page.clock.fast_forward(5000)
            page.locator('#rapid-configure').click();page.clock.fast_forward(120000)
            page.locator('#rapid-cancel-setup').click();expect(page.locator('#rapid-time')).to_have_text('00:25')
            page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
            page.clock.fast_forward(26000)
            page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
            expect(page.locator('#rapid-result-title')).to_contain_text('Temps écoulé')
            # Imprimer met en pause, sans effacer une pause manuelle ni reprendre un bilan termine.
            page.locator('#rapid-configure').click();page.locator('[data-minutes="2"]').click();page.locator('#rapid-start').click()
            page.clock.fast_forward(10000)
            page.evaluate("dispatchEvent(new Event('beforeprint'))");expect(page.locator('#rapid-app')).to_have_attribute('data-phase','paused')
            page.clock.fast_forward(120000)
            page.evaluate("dispatchEvent(new Event('afterprint'))");expect(page.locator('#rapid-time')).to_have_text('01:50')
            expect(page.locator('#rapid-app')).to_have_attribute('data-phase','running')
            page.locator('#rapid-pause').click();page.evaluate("dispatchEvent(new Event('beforeprint'));dispatchEvent(new Event('afterprint'))")
            expect(page.locator('#rapid-app')).to_have_attribute('data-phase','paused')
            page.locator('#rapid-configure').click();page.locator('#rapid-timer-none').check();page.locator('#rapid-start').click()
            expect(page.locator('#rapid-timer')).to_be_hidden()
            page.clock.fast_forward(3600000);expect(page.locator('#rapid-app')).to_have_attribute('data-phase','running')
            page.context.close()
            # Every screen uses the same stylesheet and a usable four-link navigation.
            paths=sorted(p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*.html') if not any(part.startswith('.') for part in p.relative_to(ROOT).parts))
            representatives=['index.html','lecons.html','exercices.html','cours/fonctions.html','exercices/fonctions.html','terminale/lecons.html','terminale/cours/t-logarithme.html','annexes/calcul-rapide.html']
            for name in (representatives if INLINE else paths):
                for width in [320,390,1280]:
                    page=load(name,width)
                    expect(page.locator('h1')).to_be_visible()
                    expect(page.locator('.main-nav a')).to_have_count(4)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),('overflow',name,width)
                    if name in representatives and width in [390,1280]:
                        page.screenshot(path=str(output/f'{name.replace("/","-")}-{width}.png'),full_page=False)
                    if '/cours/' in '/'+name:
                        expect(page.locator('.ui-toc')).to_have_count(1)
                        assert page.locator('.ui-toc').evaluate('e=>e.open') == (width>740)
                        if width==390:
                            page.locator('.ui-toc > summary').click();expect(page.locator('.ui-toc nav')).to_be_visible()
                    page.context.close()
            # Dense display of training never causes a mobile overflow; keyboard control remains native.
            for width in [320,390,768,1280]:
                page=load('annexes/calcul-rapide.html',width)
                page.locator('input[name=level][value=bac]').focus();page.keyboard.press('ArrowRight')
                expect(page.locator('input[name=level][value=bases]')).to_be_checked()
                page.locator('[data-minutes="5"]').click();expect(page.locator('#rapid-minutes')).to_have_value('5')
                page.locator('#rapid-start').click()
                expect(page.locator('#rapid-card')).to_be_visible()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
                page.screenshot(path=str(output/f'chrono-session-{width}.png'),full_page=False)
                page.locator('#rapid-paper-tools > summary').click();page.locator('#rapid-preview').click()
                page.evaluate("dispatchEvent(new Event('beforeprint'))");page.emulate_media(media='print')
                expect(page.locator('#rapid-paper-solutions')).to_be_hidden();expect(page.locator('#rapid-worksheet')).to_be_visible()
                page.context.close()
            plain=load('annexes/calcul-rapide.html',390,js=False)
            expect(plain.locator('#rapid-app')).to_be_hidden();expect(plain.locator('#methodes details')).to_have_count(12)
            expect(plain.locator('#serie-papier')).to_be_visible();plain.context.close()
            assert not errors,errors
            browser.close()
    finally:server.shutdown();server.server_close()
    print('INTERFACE OK: configuration, timer, pause, delai masque, bilan fige, papier, clavier, mobile et contenus preserves.')

if __name__=='__main__':main()
