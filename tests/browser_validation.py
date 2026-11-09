"""Une panne technique ne doit jamais devenir une erreur de mathématiques.

Par défaut Chromium ; STMG_TEST_BROWSER=webkit permet le même contrôle avec WebKit.
"""
import functools
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def fill_answers(slide, values):
    for i, value in enumerate(values):
        slide.locator('[data-expect]').nth(i).fill(value)


def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            engine = os.environ.get('STMG_TEST_BROWSER', 'chromium')
            options = ({'executable_path': os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']}
                       if engine == 'chromium' and os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {})
            browser = getattr(p, engine).launch(**options)
            context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True,
                                          has_touch=True, locale='fr-FR')
            page = context.new_page()
            page.goto(base + 'exercices/suites.html')
            slide = page.locator('#exercice-1')
            page.evaluate('MathsAcquis.store.enable()')
            slide.locator('button[type=submit]').tap()
            assert page.evaluate('MathsAcquis.store.read().events.length') == 0
            fill_answers(slide, ['5', '11', '20'])
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            assert page.evaluate('MathsAcquis.store.read().events[0].outcome') == 'independent'
            slide.locator('details.check > summary').tap()
            expect(slide.locator('.answer-was-correct')).to_have_count(3)
            expect(slide.locator('.answer-was-wrong')).to_have_count(0)
            slide.locator('[data-action=reset]').tap()
            fill_answers(slide, ['0', '0', '0'])
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('[aria-invalid=true]')).to_have_count(3)
            slide.locator('[data-action=reset]').tap()
            expect(slide.locator('[aria-invalid=true]')).to_have_count(0)

            page.goto(base + 'exercices/suites-geometriques.html#exercice-4')
            slide = page.locator('#exercice-4')
            fill_answers(slide, ['138', '158,7', '182,51', '1,15'])
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            fill_answers(slide, ['138 €', '158,7 EUR', '182,51 €', '1,15'])
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            page.goto(base + 'exercices/suites-geometriques.html#exercice-2')
            slide = page.locator('#exercice-2')
            fill_answers(slide, ['400', '320', '256', '−20 %'])
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            page.goto(base + 'exercices/second-degre.html#exercice-2')
            page.evaluate('MathsAcquis.store.remove(); MathsAcquis.store.enable()')
            slide = page.locator('#exercice-2')
            fill_answers(slide, ['5', '1'])
            slide.locator('select').select_option('Négatif')
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            assert page.evaluate('MathsAcquis.store.read().events[0].outcome') == 'independent'
            slide.locator('details.check > summary').tap()
            expect(slide.locator('.answer-was-correct')).to_have_count(3)
            expect(slide.locator('.answer-was-wrong')).to_have_count(0)
            expect(slide.locator('.answer-attempt').first).to_contain_text('5')
            expect(slide.locator('[data-expect]').first).to_have_value('1')
            slide.locator('[data-action=reset]').tap()
            expect(slide.locator('.answer-attempt')).to_have_count(0)
            fill_answers(slide, ['5', '5'])
            slide.locator('select').select_option('Négatif')
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).not_to_contain_text('Exercice validé')
            # Même sémantique dans les variantes générées.
            slide.locator('[data-action=new-variant]').tap()
            fields = slide.locator('[data-expect]')
            expected = fields.evaluate_all('(cs) => cs.map(c => c.dataset.expect)')
            fill_answers(slide, [expected[1], expected[0]])
            fields.nth(2).select_option(expected[2])
            slide.locator('button[type=submit]').tap()
            expect(slide.locator('.exercise-feedback')).to_contain_text('Exercice validé')
            page.close()

            # Deux pannes : fichier absent et moteur incomplet, même si le corrigé est disponible.
            for incomplete in [False, True]:
                failed = context.new_page()
                def intercept(route):
                    if incomplete:
                        route.fulfill(status=200, content_type='application/javascript', body='window.ExerciseVariants = {};')
                    else:
                        route.abort()
                failed.route('**/assets/exercices-variants.js*', intercept)
                failed.goto(base + 'exercices/suites.html')
                slide = failed.locator('#exercice-1')
                expect(slide.locator('button[type=submit]')).to_be_disabled()
                expect(slide.locator('.exercise-feedback')).to_contain_text('indisponible')
                failed.evaluate('MathsAcquis.store.remove(); MathsAcquis.store.enable()')
                fill_answers(slide, ['5', '11', '20'])
                # Une soumission forcée reste protégée (Entrée, code tiers, etc.).
                slide.locator('form').evaluate("f => f.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))")
                expect(slide.locator('[aria-invalid=true], .is-wrong')).to_have_count(0)
                assert failed.evaluate('MathsAcquis.store.read().events.length') == 0
                slide.locator('details.check > summary').tap()
                expect(slide.locator('.answer-was-wrong, .was-wrong, .answer-was-correct')).to_have_count(0)
                expect(slide.locator('.answer-status')).to_have_text(['Solution affichée. Ta réponse n’a pas été évaluée.'] * 3)
                expect(failed.locator('#exercise-score')).to_have_text('0/8')
                slide.locator('[data-action=reset]').tap()
                expect(slide.locator('.exercise-feedback')).to_contain_text('indisponible')
                failed.close()

            failed = context.new_page()
            failed.route('**/assets/exercices-variants.js*', lambda route: route.abort())
            failed.goto(base + 'terminale/exercices/t-suites.html#exercice-1')
            expect(failed.locator('#exercise-mounted > [role=status]')).to_contain_text('indisponibles')
            expect(failed.locator('#exercise-mounted .offline-series .exam-block')).to_have_count(6)
            failed.locator('#exercise-mounted .offline-solution > summary').first.tap()
            expect(failed.locator('#exercise-mounted .offline-solution').first).to_have_attribute('open', '')
            browser.close()
            print(f'VALIDATION {engine} OK : nombres français, centimes, panne sans faux négatif, suivi et reset.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
