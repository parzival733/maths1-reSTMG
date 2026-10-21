"""Browser regressions for quick calculation, served below a GitHub Pages-like prefix."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PREFIX='/maths1-reSTMG'
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        if path.startswith(PREFIX+'/'):path=path[len(PREFIX):]
        return super().translate_path(path)
    def log_message(self,*args):pass

def sample(page):
    return page.evaluate('''() => { const d=document.getElementById('rapid-app').dataset;
    return QuickMath.session({level:d.level,method:d.method,topic:d.topic,count:Number(d.count),seed:Number(d.seed)}); }''')

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
    thread=Thread(target=server.serve_forever,daemon=True);thread.start()
    base=f'http://127.0.0.1:{server.server_port}{PREFIX}'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            context=browser.new_context(viewport={'width':1280,'height':900})
            page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            url=base+'/annexes/calcul-rapide.html?seed=42'
            page.goto(url);expect(page.locator('#rapid-app')).to_be_visible()
            qs=sample(page);assert len(qs)==10 and all(q['level']!='terminale' for q in qs)
            answer=page.locator('#rapid-answer')
            answer.fill('1/0');page.locator('#rapid-check').click()
            expect(page.locator('#rapid-feedback')).to_contain_text('fraction valide')
            answer.fill(qs[0]['expected']);answer.press('Enter')
            expect(page.locator('#rapid-feedback')).to_contain_text('Juste dès le premier essai')
            page.locator('#rapid-check').click()
            expect(page.locator('#rapid-progress-text')).to_contain_text('1 réussite(s)')
            page.locator('#rapid-next').click();answer.fill('999999');page.locator('#rapid-check').click()
            page.locator('#rapid-hint-button').click();expect(page.locator('#rapid-hint')).to_be_visible()
            answer.fill(qs[1]['expected']);page.locator('#rapid-check').click()
            expect(page.locator('#rapid-feedback')).to_contain_text('Juste après un nouvel essai')
            expect(page.locator('#rapid-progress-text')).to_contain_text('1 réussite(s)')
            page.locator('#rapid-previous').click();expect(answer).to_have_value(qs[0]['expected'])
            page.locator('#rapid-next').click();page.locator('#rapid-next').click()
            page.locator('#rapid-solution-button').click()
            expect(page.locator('#rapid-solution')).to_be_visible();expect(page.locator('#rapid-check')).to_be_disabled()
            expect(page.locator('#rapid-progress-text')).to_contain_text('1 réussite(s)')
            for _ in range(7):page.locator('#rapid-next').click()
            page.locator('#rapid-next').click()
            expect(page.locator('#rapid-result')).to_be_visible();expect(page.locator('#rapid-score')).to_contain_text('1 / 10')
            expect(page.locator('#rapid-review')).to_contain_text('sans réponse vérifiée')
            page.locator('#rapid-return').click();expect(page.locator('#rapid-session')).to_be_visible()
            page.locator('#rapid-level').select_option('bases');page.locator('#rapid-method').select_option('mental')
            page.locator('#rapid-topic').select_option('fractions');page.locator('#rapid-count').select_option('5')
            page.locator('#rapid-settings button[type=submit]').click()
            qs=sample(page);assert len(qs)==5 and all(q['level']=='bases' and q['method']=='mental' and q['topic']=='fractions' for q in qs)
            expect(page.locator('#rapid-progress-text')).to_contain_text('0 réussite(s)')
            page.locator('#rapid-level').select_option('terminale');page.locator('#rapid-method').select_option('feuille')
            page.locator('#rapid-settings button[type=submit]').click()
            qs=sample(page);assert all(q['level']=='terminale' for q in qs)
            expect(page.locator('#rapid-scope')).to_contain_text('ne sont pas des prérequis')
            page.locator('#rapid-preview').click();expect(page.locator('#rapid-worksheet')).to_be_visible()
            expect(page.locator('#rapid-paper-questions > li')).to_have_count(5)
            expect(page.locator('#rapid-paper-solutions')).to_be_hidden()
            assert not page.locator('#rapid-print-answers').is_checked()
            page.evaluate("window.dispatchEvent(new Event('beforeprint'))")
            page.emulate_media(media='print')
            expect(page.locator('#rapid-worksheet')).to_be_visible();expect(page.locator('#rapid-paper-solutions')).to_be_hidden()
            expect(page.locator('#rapid-card')).to_be_hidden()
            page.emulate_media(media='screen');page.evaluate("window.dispatchEvent(new Event('afterprint'))")
            page.locator('#rapid-print-answers').check()
            page.evaluate("window.dispatchEvent(new Event('beforeprint'))");page.emulate_media(media='print')
            expect(page.locator('#rapid-paper-solutions')).to_be_visible()
            assert page.locator('#rapid-paper-solutions').evaluate("e=>getComputedStyle(e).breakBefore")=='page'
            page.emulate_media(media='screen');page.evaluate("window.dispatchEvent(new Event('afterprint'))")
            expect(page.locator('#rapid-check')).to_be_disabled()
            expect(page.locator('#rapid-progress-text')).to_contain_text('0 réussite(s)')
            page.locator('#rapid-settings button[type=submit]').click()
            assert not page.locator('#rapid-print-answers').is_checked()
            page.locator('#rapid-timer-enable').check();expect(page.locator('#rapid-timer')).to_be_visible()
            page.wait_for_timeout(1200);assert page.locator('#rapid-time').inner_text()!='0:00'
            page.locator('#rapid-timer-enable').uncheck();expect(page.locator('#rapid-timer')).to_be_hidden()
            # A settings change must not silently change the in-progress series.
            old=sample(page);page.locator('#rapid-level').select_option('bac');assert sample(page)==old
            page.locator('#rapid-settings button[type=submit]').click();assert all(q['level']!='terminale' for q in sample(page))
            output=ROOT/'.qa-rapide';output.mkdir(exist_ok=True)
            for width in [320,390,768,1280]:
                page.set_viewport_size({'width':width,'height':900});page.goto(url)
                expect(page.locator('#rapid-app')).to_be_visible()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),('overflow annex',width)
                page.screenshot(path=str(output/f'annexe-{width}.png'),full_page=True)
            for name in ['index.html','lecons.html','exercices.html','terminale/lecons.html','terminale/exercices.html']:
                for width in [320,390,1280]:
                    page.set_viewport_size({'width':width,'height':900});page.goto(base+'/'+name)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),('overflow entry',name,width)
                    link=page.locator('.main-nav a').filter(has_text='Calcul rapide')
                    expect(link).to_have_count(1)
                    if width==390:
                        link.click();expect(page.locator('#rapid-app')).to_be_visible()
            assert not errors,errors
            nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':850})
            plain=nojs.new_page();plain.goto(url)
            expect(plain.locator('#rapid-app')).to_be_hidden()
            expect(plain.locator('#serie-papier')).to_be_visible()
            expect(plain.locator('#methodes details')).to_have_count(12)
            plain.locator('#methodes summary').first.click()
            expect(plain.locator('#methodes details').first).to_have_attribute('open','')
            plain.get_by_text('Corrigé des bases',exact=True).click()
            expect(plain.locator('#serie-papier details').first).to_have_attribute('open','')
            assert plain.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            nojs.close();context.close();browser.close()
            print('NAVIGATEUR CALCUL RAPIDE OK: reponses, score, filtres, impression sans fuite, chrono, 320/390/768/1280 px, sous-repertoire et sans JavaScript.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':main()
