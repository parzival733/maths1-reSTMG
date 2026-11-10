"""Régressions de l'audit global, sur le vrai moteur et sous la CSP du site."""
import functools
import os
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect
from http_security import SecurityHandler

ROOT = Path(__file__).resolve().parents[1]


class Quiet(SecurityHandler):
    def log_message(self, *args):
        pass


def fill_expected(slide):
    for field in slide.locator('[data-expect]').all():
        value = field.get_attribute('data-expect').split('|')[0]
        if field.evaluate('e => e.tagName') == 'SELECT':
            value = field.locator('option').evaluate_all(
                '(xs,v)=>xs.find(x=>x.value.replace(/\\s/g,"")===v.replace(/\\s/g,"")).value', value)
            field.select_option(value)
        else:
            field.fill(value.replace('.', ',').replace('-', '−'))


def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as w:
            engine = os.environ.get('STMG_TEST_BROWSER', 'chromium')
            options = {'executable_path': os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']} if engine == 'chromium' and os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {}
            browser = getattr(w, engine).launch(**options)
            context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='fr-FR')
            context.add_init_script("""(() => {
              const original = window.matchMedia.bind(window), active = new Set();
              window.__responsiveListeners = () => active.size;
              window.matchMedia = query => {
                const media = original(query);
                if (query.replace(/\\s/g, '') === '(max-width:900px)') {
                  const add = media.addEventListener.bind(media), remove = media.removeEventListener.bind(media);
                  media.addEventListener = (type, fn, ...args) => { if (type === 'change') active.add(fn); return add(type, fn, ...args); };
                  media.removeEventListener = (type, fn, ...args) => { if (type === 'change') active.delete(fn); return remove(type, fn, ...args); };
                }
                return media;
              };
            })()""")
            page = context.new_page()
            page.goto(base)
            for answer in ['3', '3,0', '6/2', '−6 / −2', '3e0']:
                page.locator('#home-try-answer').fill(answer)
                page.locator('#home-try button').tap()
                expect(page.locator('#home-try-feedback')).to_have_attribute('data-result', 'correct')
                expect(page.locator('#home-try-answer')).to_have_attribute('aria-invalid', 'false')
            for answer in ['', '0x3', '1/0', '3x', '2']:
                page.locator('#home-try-answer').fill(answer)
                page.locator('#home-try button').tap()
                expect(page.locator('#home-try-feedback')).to_have_attribute('data-result', 'retry')

            page.goto(base + 'exercices/fonctions.html#exercice-2')
            slide = page.locator('#exercice-2')
            fill_expected(slide)
            duration = slide.locator('[data-unit=h]')
            expect(duration).to_have_count(1)
            duration.fill('7 heures')
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            duration.fill('7 min')
            slide.locator('button[type=submit]').tap()
            expect(duration).to_have_attribute('aria-invalid', 'true')
            expect(slide.locator('.answer-status').last).to_contain_text('Format non reconnu')
            assert 'h' in duration.get_attribute('placeholder')
            descriptions = duration.get_attribute('aria-describedby').split()
            assert len(descriptions) >= 2
            for identifier in descriptions:
                expect(page.locator('[id="' + identifier + '"]')).to_have_count(1)

            page.goto(base + 'exercices/suites.html')
            initial = page.evaluate('__responsiveListeners()')
            first = page.locator('#exercice-1')
            first.locator('button[type=submit]').tap()
            expect(first.locator('[data-action=new-variant]')).to_be_hidden()
            assert 'is-wrong' not in (page.locator('[data-step="0"]').get_attribute('class') or '')
            fill_expected(first)
            first.locator('button[type=submit]').tap()
            for index in range(1, 8):
                page.locator('[data-step="' + str(index) + '"]').tap()
                page.locator('#exercice-' + str(index + 1) + ' details.check > summary').tap()
            expect(page.locator('.series-recap')).to_be_visible()
            expect(page.locator('.series-recap .recap-count').first).to_have_text('1')
            page.locator('[data-step="0"]').tap()
            for _ in range(30):
                first = page.locator('#exercice-1')
                if first.locator('[data-action=new-variant]').is_hidden():
                    first.locator('[data-expect]').first.fill('0')
                    first.locator('button[type=submit]').tap()
                first.locator('[data-action=new-variant]').tap()
            assert page.evaluate('__responsiveListeners()') <= initial + 1
            for width in [1280, 320, 900, 390]:
                page.set_viewport_size({'width': width, 'height': 844})
                page.wait_for_function("width => {const p=document.querySelector('#exercice-1 .coaching-panel');return width<=900?p.previousElementSibling?.matches('.exercise-form'):p.parentElement.matches('.exercise-statement')}", arg=width)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            expect(page.locator('#exercice-1 .coaching-panel')).to_have_count(1)
            browser.close()
            print(f'GLOBAL {engine} OK : unités, formats accessibles, accueil, bilan sans tentative vide, 30 variantes et écouteurs bornés.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
