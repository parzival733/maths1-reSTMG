"""Virgule tactile : saisie réelle, curseur, score et variantes sous la CSP du site.

STMG_TEST_BROWSER=webkit permet de rejouer ces cas avec le moteur de Safari.
Le clavier système iOS lui-même exige une vérification sur un appareil physique.
"""
import functools
import os
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect
from http_security import SecurityHandler

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.qa-decimal'
NUMERIC = '.answer-row input[inputmode="decimal"]'


class Quiet(SecurityHandler):
    def log_message(self, *args):
        pass


def main():
    OUT.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    pages = sorted(ROOT.glob('exercices/*.html')) + sorted(ROOT.glob('terminale/exercices/*.html'))
    errors = []
    try:
        with sync_playwright() as w:
            engine = os.environ.get('STMG_TEST_BROWSER', 'chromium')
            options = {'executable_path': os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']} if engine == 'chromium' and os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {}
            browser = getattr(w, engine).launch(**options)
            checked = 0
            for width, theme in [(320, 'light'), (390, 'dark')]:
                context = browser.new_context(viewport={'width': width, 'height': 844},
                    is_mobile=True, has_touch=True, locale='fr-FR', color_scheme=theme)
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                context.on('console', lambda message: errors.append(message.text)
                    if message.type == 'error' and 'Content Security Policy' in message.text else None)
                for path in pages:
                    name = path.relative_to(ROOT).as_posix()
                    page.goto(base + name)
                    fields = page.locator(NUMERIC)
                    assert fields.count() > 0, name
                    expect(page.locator('.answer-decimal')).to_have_count(fields.count())
                    assert page.evaluate("matchMedia('(any-pointer: coarse)').matches")
                    # Toutes les questions, y compris celles qui sont normalement masquées.
                    sizes = page.evaluate("""() => {
                      document.querySelectorAll('.exercise-block').forEach(s => s.hidden = false);
                      return [...document.querySelectorAll('.answer-row input[inputmode="decimal"]')].map(e => {
                        const b=e.parentElement.querySelector('.answer-decimal');
                        return {width:e.getBoundingClientRect().width,buttonWidth:b.offsetWidth,buttonHeight:b.offsetHeight,name:b.getAttribute('aria-label')};
                      });
                    }""")
                    assert all(x['width'] >= 120 and x['buttonWidth'] >= 44 and x['buttonHeight'] >= 44
                        and x['name'].startswith('Insérer une virgule') for x in sizes), (name, width, sizes)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (name, width)
                    checked += len(sizes)
                context.close()

            context = browser.new_context(viewport={'width': 390, 'height': 844},
                is_mobile=True, has_touch=True, locale='en-US')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base + 'exercices/suites-geometriques.html#exercice-4')
            slide = page.locator('#exercice-4')
            field = slide.locator('[data-expect]').nth(2)
            decimal = field.locator('..').locator('.answer-decimal')
            sign = field.locator('..').locator('.answer-sign')
            decimal.tap()
            expect(field).to_have_value('0,')
            expect(field).to_be_focused()
            page.keyboard.insert_text('5')
            expect(field).to_have_value('0,5')
            expect(slide.locator('.exercise-feedback')).to_have_text('')
            field.fill('')
            sign.tap()
            decimal.tap()
            page.keyboard.insert_text('5')
            expect(field).to_have_value('−0,5')
            expect(field).to_be_focused()

            for value, start, end, expected, caret in [
                ('1234', 2, 2, '12,34', 3),
                ('1234', 1, 3, '1,4', 2),
                ('12.5', 2, 3, '12,5', 3),
                ('1234', 0, 4, '0,', 2),
                ('−12', 1, 3, '−0,', 3),
                ('12/34', 4, 4, '12/3,4', 5),
                ('1,2/34', 6, 6, '1,2/34,', 7),
            ]:
                field.fill(value)
                field.evaluate('(e,p)=>e.setSelectionRange(...p)', [start, end])
                decimal.tap()
                expect(field).to_have_value(expected)
                expect(field).to_be_focused()
                assert field.evaluate('e=>e.selectionStart') == caret
            for value in ['12,5', '12.5', '1,2/3,4']:
                field.fill(value)
                decimal.tap()
                expect(field).to_have_value(value)

            # Saisie d'une réponse correcte avec la touche tactile, pas avec fill('182,51').
            for control, value in zip(slide.locator('[data-expect]').all(), ['138', '158,7', '182', '1,15']):
                control.fill(value)
            decimal.tap()
            page.keyboard.insert_text('51')
            expect(field).to_have_value('182,51')
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            expect(page.locator('#exercise-score')).to_have_text('1/8')
            decimal.tap()  # Pas de deuxième virgule, ni de perte d'un score déjà validé.
            expect(field).to_have_value('182,51')
            expect(page.locator('#exercise-score')).to_have_text('1/8')
            # Le viewport évite de réinitialiser l'émulation tactile de Chromium.
            page.screenshot(path=str(OUT / (engine + '-virgule-validee.png')))
            slide.locator('details.check > summary').tap()
            expect(decimal).to_be_disabled()
            expect(sign).to_be_disabled()
            slide.locator('[data-action=reset]').tap()
            expect(decimal).to_be_enabled()
            expect(sign).to_be_enabled()
            expect(field).to_have_value('')
            field.fill('0')
            slide.locator('button[type=submit]').tap()
            slide.locator('[data-action=new-variant]').tap()
            expect(slide.locator('.answer-decimal')).to_have_count(slide.locator('input[inputmode=decimal]').count())
            fresh = slide.locator('input[inputmode=decimal]').first
            fresh.locator('..').locator('.answer-decimal').tap()
            expect(fresh).to_have_value('0,')
            expect(fresh).to_be_focused()
            page.emulate_media(media='print')
            assert slide.locator('.answer-decimal').evaluate_all("xs => xs.every(e => getComputedStyle(e).display === 'none')")
            context.close()

            # Un ordinateur à souris garde le même affichage.
            desktop = browser.new_context(viewport={'width': 1440, 'height': 900}, has_touch=False)
            page = desktop.new_page()
            page.goto(base + 'exercices/suites.html')
            assert not page.evaluate("matchMedia('(any-pointer: coarse)').matches")
            expect(page.locator('.answer-sign').first).to_be_visible()
            expect(page.locator('.answer-decimal').first).to_be_hidden()
            desktop.close()
            browser.close()
            assert not errors, errors
            print(f'VIRGULE {engine} OK : {len(pages)} séries, {checked} champs/thèmes tactiles, curseur, nombres négatifs, score, corrigé, reset et variante.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
