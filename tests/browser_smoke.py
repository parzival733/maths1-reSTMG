"""End-to-end checks against the actual static site at a project subdirectory URL.
Development dependencies: playwright==1.55.0 and its Chromium browser.
Run python3 tests/browser_smoke.py from any directory.
"""
from __future__ import annotations
import os
import functools
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    handler = functools.partial(QuietHandler, directory=str(ROOT.parent))
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}/{quote(ROOT.name)}/'
    errors, failed_responses = [], []
    paths = (sorted(ROOT.glob('*.html')) + sorted((ROOT / 'cours').glob('*.html'))
             + sorted((ROOT / 'exercices').glob('*.html')))
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(**({"executable_path":os.environ["PLAYWRIGHT_CHROMIUM_EXECUTABLE"]} if os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE") else {}))
            context = browser.new_context()
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda response: failed_responses.append(response.url) if response.status >= 400 else None)
            checks = 0
            for width in [320, 390, 768, 1440]:
                page.set_viewport_size({'width': width, 'height': 900})
                for path in paths:
                    name = path.relative_to(ROOT).as_posix()
                    response = page.goto(base + name, wait_until='networkidle')
                    assert response.status == 200, name
                    expect(page.locator('h1')).to_be_visible()
                    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), (name, width, 'horizontal overflow')
                    if name.startswith('exercices/'):
                        expected = 9 if name == 'exercices/fonctions.html' else 8
                        expect(page.locator('.exercise-block')).to_have_count(expected)
                        expect(page.locator('.exercise-stepper button')).to_have_count(expected)
                        expect(page.locator('#exercice-1')).to_be_visible()
                        expect(page.locator('#exercice-2')).to_be_hidden()
                        expect(page.locator('.coaching-panel')).to_have_count(expected)
                        expect(page.locator('.coaching-hint')).to_have_count(expected * 3)
                        expect(page.locator('.coaching-bridge')).to_have_count(expected)
                    if name.startswith('cours/'):
                        expect(page.locator('.lesson-toc')).to_be_visible()
                        expect(page.locator('.lesson-content')).to_be_visible()
                        expect(page.locator('.support-scaffold')).to_have_count(1)
                        expect(page.locator('.study-quiz')).to_have_count(2)
                        expect(page.locator('.study-quiz form:visible')).to_have_count(2)
                        expect(page.locator('.lesson-reading-controls')).to_be_visible()
                        assert page.locator('.lesson-toc nav a').count() >= 6
                        assert page.evaluate("Array.from(document.querySelectorAll('.lesson-toc nav a')).every(a => document.getElementById(decodeURIComponent(a.hash.slice(1))))"), name
                    checks += 1
            page.set_viewport_size({'width': 390, 'height': 844})



            # Parcours papier : aucun bloc de code dans les 15 leçons de mathématiques.
            # Les 13 programmes déplacés restent disponibles dans l'atelier séparé.
            core_lessons = [
                'fonctions', 'second-degre', 'suites', 'suites-arithmetiques',
                'suites-geometriques', 'derivees', 'variations', 'statistiques-deux-variables',
                'probabilites-conditionnelles', 'bernoulli', 'variables-aleatoires',
                'calcul', 'evolutions', 'logique', 'statistiques-descriptives'
            ]
            for slug in core_lessons:
                page.goto(base + 'cours/' + slug + '.html')
                expect(page.locator('.lesson-content pre')).to_have_count(0)
                expect(page.locator('.lesson-content code')).to_have_count(0)
            page.goto(base + 'cours/derivees.html')
            expect(page.get_by_text('Calcul des pentes près de 2')).to_be_visible()
            page.goto(base + 'cours/python-tableur.html')
            expect(page.locator('.python-library')).to_have_count(1)
            expect(page.locator('.python-library details.check')).to_have_count(13)
            expect(page.locator('.lesson-content pre')).to_have_count(20)
            lib = page.locator('.python-library details.check').filter(has_text='Calculer la pente')
            lib.locator('summary').click()
            expect(lib.locator('pre')).to_contain_text('pente_secante')
            page.goto(base + 'lecons.html')
            page.locator('#course-category').select_option('atelier')
            expect(page.locator('.lesson-card:visible')).to_have_count(1)
            expect(page.locator('.lesson-card:visible')).to_contain_text('Python')
            page.locator('#course-category').select_option('reperes')
            expect(page.locator('.lesson-card:visible')).to_have_count(4)
            page.locator('#course-category').select_option('')
            expect(page.locator('.lesson-card:visible')).to_have_count(16)
            page.goto(base + 'exercices.html')
            expect(page.locator('#atelier .lesson-card')).to_have_count(1)
            expect(page.locator('#reperes .lesson-card')).to_have_count(4)
            page.goto(base + 'exercices/python-tableur.html')
            expect(page.locator('h1')).to_contain_text('Atelier numérique : Python et tableur')
            expect(page.locator('.exercise-block')).to_have_count(8)
            print('PARCOURS PAPIER OK: 15 leçons sans code, atelier facultatif, 13 programmes transférés, 121 + 8 exercices.')

            # Graphiques interactifs : rendu, clavier, calcul, retour au réglage initial.
            # Le module de la tangente est aussi présent dans la leçon Variations.
            graph_cases = [
                ('fonctions','affine','a','3','1'),
                ('second-degre','second','a','-2','1'),
                ('suites','suites','r','4','1'),
                ('derivees','derivee','t','2','2'),
                ('variations','variations','t','2','2'),
            ]
            for slug, kind, param, expected_answer, initial_setting in graph_cases:
                page.goto(base + f'cours/{slug}.html')
                lab = page.locator(f'.math-lab[data-lab="{kind}"]')
                expect(lab).to_be_visible()
                expect(lab.locator('svg[role="img"]')).to_be_visible()
                expect(lab.locator('svg title')).to_have_count(1)
                expect(lab.locator('svg desc')).to_have_count(1)
                assert lab.locator('svg path').count() >= 1 if kind != 'suites' else lab.locator('svg circle').count() >= 14
                assert lab.locator('svg').get_attribute('aria-labelledby')
                assert lab.locator('[data-parameter]').count() >= 1
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (slug,'graph overflow')
                description_before = lab.locator('svg desc').text_content()
                details_before = lab.locator('.math-lab__readout').text_content()
                response = lab.locator('.math-lab__question')
                response.locator('input').fill(expected_answer)
                response.locator('button[type="submit"]').click()
                expect(response.locator('[data-result="correct"]')).to_contain_text('Bravo')
                expected_second = {'fonctions':'1', 'second-degre':'1',
                    'suites':'2,88', 'derivees':'-1', 'variations':'-1'}[slug]
                response.locator('button[type="button"]').click()
                expect(response.locator('label')).to_contain_text('Question 2/3')
                response.locator('input').fill(expected_second)
                response.locator('button[type="submit"]').click()
                expect(response.locator('[data-result="correct"]')).to_contain_text('Bravo')
                expected_third = {'fonctions':'-1', 'second-degre':'-1',
                    'suites':'6', 'derivees':'1', 'variations':'1'}[slug]
                response.locator('button[type="button"]').click()
                expect(response.locator('label')).to_contain_text('Question 3/3')
                response.locator('input').fill(expected_third)
                response.locator('button[type="submit"]').click()
                expect(response.locator('[data-result="correct"]')).to_contain_text('Bravo')
                controller = lab.locator(f'[data-parameter="{param}"]')
                if kind == 'second':
                    controller.select_option('-1')
                else:
                    controller.focus()
                    controller.press('ArrowRight')
                details_after = lab.locator('.math-lab__readout').text_content()
                assert details_before != details_after, slug + ': explication inchangée'
                assert description_before != lab.locator('svg desc').text_content(), slug + ': svg inchangé'
                expect(response.locator('input')).to_have_value('')
                expect(response.locator('label')).to_contain_text('Question 1/3')
                expect(response.locator('.math-lab__feedback')).to_have_text('')
                response.locator('input').fill('abc')
                response.locator('button[type="submit"]').click()
                expect(response.locator('.math-lab__feedback')).to_contain_text('Entre un nombre')
                lab.locator('.math-lab__actions button').click()
                expect(controller).to_have_value(initial_setting)
                expect(lab.locator('.math-lab__readout')).to_have_text(details_before)
                expect(response.locator('.math-lab__feedback')).to_have_text('')
            # Cas limites : droite constante, trois cas de racines, tangente horizontale.
            page.goto(base + 'cours/fonctions.html')
            lab = page.locator('.math-lab')
            lab.locator('[data-parameter="a"]').evaluate("""input => {
                input.value = '0'; input.dispatchEvent(new Event('input', {bubbles: true}));
            }""")
            expect(lab.locator('.math-lab__readout')).to_contain_text('constante')
            lab.locator('[data-parameter="b"]').evaluate("""input => {
                input.value = '0'; input.dispatchEvent(new Event('input', {bubbles: true}));
            }""")
            expect(lab.locator('.math-lab__readout')).to_contain_text('Tous les réels sont antécédents de 0')
            lab.locator('[data-parameter="b"]').evaluate("""input => {
                input.value = '1'; input.dispatchEvent(new Event('input', {bubbles: true}));
            }""")
            expect(lab.locator('.math-lab__readout')).to_contain_text('zéro n’a pas d’antécédent')
            page.goto(base + 'cours/second-degre.html')
            lab = page.locator('.math-lab')
            lab.locator('[data-parameter="a"]').select_option('-1')
            expect(lab.locator('.math-lab__readout')).to_contain_text('Aucune racine réelle')
            lab.locator('[data-parameter="a"]').select_option('1')
            expect(lab.locator('.math-lab__readout')).to_contain_text('Racines')
            expect(lab.locator('.math-lab__readout')).to_contain_text('entre les racines')
            lab.locator('[data-parameter="k"]').evaluate("""input => {
                input.value = '0'; input.dispatchEvent(new Event('input', {bubbles: true}));
            }""")
            expect(lab.locator('.math-lab__readout')).to_contain_text('La courbe touche l’axe')
            page.goto(base + 'cours/derivees.html')
            lab = page.locator('.math-lab')
            lab.locator('[data-parameter="t"]').evaluate("""input => {
                input.value = '1'; input.dispatchEvent(new Event('input', {bubbles: true}));
            }""")
            expect(lab.locator('.math-lab__readout')).to_contain_text('La tangente est horizontale')
            page.goto(base + 'cours/suites.html')
            lab = page.locator('.math-lab')
            lab.locator('[data-parameter="q"]').evaluate("""input => {
                input.value = '1.6'; input.dispatchEvent(new Event('input', {bubbles: true}));
            }""")
            expect(lab.locator('.math-lab__readout')).to_contain_text('v₄ ≈')
            expect(lab.locator('svg circle')).to_have_count(14)

            print('GRAPH BROWSER OK : 5 pages, 4 types, souris/clavier, quiz et réinitialisation.')

            # Extension : parcourir les 15 chapitres (hors Fonctions).
            # L'aide est présente avant la première vérification et suit la variante.
            other_chapters = [
                'second-degre', 'suites', 'suites-arithmetiques', 'suites-geometriques',
                'derivees', 'variations', 'statistiques-deux-variables',
                'probabilites-conditionnelles', 'bernoulli', 'variables-aleatoires',
                'calcul', 'evolutions', 'logique',
                'statistiques-descriptives', 'python-tableur'
            ]
            mini_answers = {
                'second-degre': '-3', 'suites': '10', 'suites-arithmetiques': '4',
                'suites-geometriques': '3', 'derivees': '4', 'variations': '6',
                'statistiques-deux-variables': '4',
                'probabilites-conditionnelles': '7', 'bernoulli': '0.3',
                'variables-aleatoires': '0.5', 'calcul': '23',
                'evolutions': '20', 'logique': '2',
                'statistiques-descriptives': '0.3', 'python-tableur': '20'
            }
            for slug in other_chapters:
                page.goto(base + 'exercices/' + slug + '.html')
                panel = page.locator('#exercice-1 .coaching-panel')
                expect(panel).to_be_visible()
                expect(panel.locator('.coaching-hint')).to_have_count(3)
                summary = panel.locator('.coaching-hint summary').first
                summary.click()
                expect(panel.locator('.coaching-hint').first.locator('p')).to_be_visible()
                original_method = panel.locator('.coaching-hint').nth(2).text_content()
                form = page.locator('#exercice-1 .exercise-form')
                form.locator('input[data-expect]').first.fill('99999')
                form.locator('button[type="submit"]').click()
                expect(panel.locator('.coaching-diagnosis')).to_be_visible()
                expect(panel.locator('.coaching-bridge')).to_be_hidden()
                form.locator('button[type="submit"]').click()
                expect(panel.locator('.coaching-bridge')).to_be_visible()
                panel.locator('.coaching-bridge summary').click()
                panel.locator('.coaching-bridge-answer').fill(mini_answers[slug])
                panel.locator('.coaching-bridge button').click()
                expect(panel.locator('.coaching-bridge p[role="status"]')).to_contain_text('Bravo')
                expect(page.locator('#exercise-score')).to_have_text('0/8')
                form.locator('[data-action="new-variant"]').click()
                new_panel = page.locator('#exercice-1 .coaching-panel')
                expect(new_panel).to_be_visible()
                updated_method = new_panel.locator('.coaching-hint').nth(2).text_content()
                assert updated_method != original_method, slug + ' : dernier indice non actualisé'
                expect(new_panel.locator('.coaching-bridge')).to_be_hidden()
                expect(page.locator('#exercice-1 .coaching-hint')).to_have_count(3)
            print('COACHING BROWSER OK : 15 chapitres, aides et tremplins vérifiés.')

            page.goto(base + 'exercices/fonctions.html')
            expect(page.locator('.exercise-block')).to_have_count(9)
            expect(page.locator('details.check')).to_have_count(9)
            expect(page.locator('#exercice-1')).to_be_visible()
            expect(page.locator('#exercice-2')).to_be_hidden()
            # L'aide initiale présente bien les données de l'énoncé affiché.
            expect(page.locator('#exercice-1 .coaching-panel')).to_have_count(1)
            expect(page.locator('#exercice-1 .coaching-hint')).to_have_count(3)
            original_help = page.locator('#exercice-1 .coaching-hint').nth(2).text_content()
            assert '3 × 4 − 5' in original_help and ' = 10' in original_help
            first_inputs = page.locator('#exercice-1 input[data-expect]')
            values = ['-11', '-5', '7', '5', '0']
            assert first_inputs.count() == len(values)
            for control, value in zip(first_inputs.all(), values):
                control.fill(value)
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercice-1 .answer-row.is-correct')).to_have_count(5)
            expect(page.locator('#exercise-score')).to_have_text('1/9')
            page.locator('[data-nav="next"]').click()
            expect(page.locator('#exercice-2')).to_be_visible()
            expect(page.locator('#exercice-1')).to_be_hidden()
            page.locator('[data-step="0"]').click()
            expect(page.locator('#exercice-1')).to_be_visible()
            page.locator('#exercice-1 details.check summary').click()
            assert page.locator('#exercice-1 details.check').evaluate('(el) => el.open')
            expect(page.locator('#exercice-1 .answer-row.is-revealed')).to_have_count(5)
            expect(page.locator('#exercice-1 input.answer-was-correct')).to_have_count(5)
            expect(page.locator('#exercice-1 .answer-row.was-correct')).to_have_count(5)
            for control, expected in zip(first_inputs.all(), values):
                expect(control).to_have_value(expected)
            expect(page.locator('#exercise-score')).to_have_text('1/9')

            # Afficher le corrigé remplit aussi les formules, sans augmenter le score.
            page.locator('[data-step="1"]').click()
            second_inputs = page.locator('#exercice-2 input[data-expect]')
            # Mélange de réponses justes, fausses et une réponse absente.
            second_inputs.nth(0).fill('18')
            second_inputs.nth(1).fill('99')
            second_inputs.nth(2).fill('42')
            page.locator('#exercice-2 details.check summary').click()
            expect(page.locator('#exercice-2 .answer-row.is-revealed')).to_have_count(3)
            expect(page.locator('#exercice-2 input.answer-was-correct')).to_have_count(2)
            expect(page.locator('#exercice-2 input.answer-was-wrong')).to_have_count(2)
            expect(page.locator('#exercice-2 .answer-row.was-correct')).to_have_count(1)
            expect(page.locator('#exercice-2 .answer-row.was-wrong')).to_have_count(2)
            first_color = second_inputs.nth(0).evaluate('(el) => getComputedStyle(el).backgroundColor')
            wrong_color = second_inputs.nth(1).evaluate('(el) => getComputedStyle(el).backgroundColor')
            assert first_color != wrong_color, 'Les bulles vertes et rouges doivent être visibles.'
            for control, expected in zip(second_inputs.all(), ['18', '6', '42', '7']):
                expect(control).to_have_value(expected)
            page.locator('#exercice-2 button[type="submit"]').click()
            expect(page.locator('#exercise-score')).to_have_text('1/9')
            page.locator('#exercice-2 [data-action="reset"]').click()
            expect(page.locator('#exercice-2 details.check')).not_to_have_attribute('open', '')
            expect(page.locator('#exercice-2 input.answer-was-correct')).to_have_count(0)
            expect(page.locator('#exercice-2 input.answer-was-wrong')).to_have_count(0)
            for control in second_inputs.all():
                expect(control).to_have_value('')
            for control, value in zip(second_inputs.all(), ['18', '6', '42', '7']):
                control.fill(value)
            page.locator('#exercice-2 button[type="submit"]').click()
            expect(page.locator('#exercise-score')).to_have_text('2/9')

            # Les réponses à choix, les intervalles et les virgules sont pris en charge.
            page.locator('[data-step="2"]').click()
            # Deux antécédents restent corrects même dans l'ordre inverse.
            page.locator('#exercice-3 input[data-type="unordered-list"]').fill('3 ; 1')
            page.locator('#exercice-3 button[type="submit"]').click()
            assert 'is-correct' in page.locator('#exercice-3 .answer-row:has(input[data-type="unordered-list"])').get_attribute('class')
            page.locator('#exercice-3 details.check summary').click()
            expect(page.locator('#exercice-3 input[data-type="unordered-list"][data-expect="1;3"]')).to_have_value('1 ; 3')
            expect(page.locator('#exercice-3 select[data-expect="]1;3["]')).to_have_value(']1 ; 3[')
            expect(page.locator('#exercice-3 select.answer-was-wrong')).to_have_count(1)
            expect(page.locator('#exercice-3 select[data-expect="]1;3["]')).to_be_disabled()
            expect(page.locator('#exercise-score')).to_have_text('2/9')
            page.locator('[data-step="8"]').click()
            page.locator('#exercice-9 details.check summary').click()
            last_inputs = page.locator('#exercice-9 input[data-expect]')
            for control, expected in zip(last_inputs.all(), ['4,9729', '5,0176', '2,23', '2,24']):
                expect(control).to_have_value(expected)
            expect(page.locator('#exercise-score')).to_have_text('2/9')

            # Chapitre 1 : la validation prépare une nouvelle question sans
            # effacer le résultat avant l'action de l'élève.
            page.locator('[data-step="0"]').click()
            statement_before = page.locator('#exercice-1 .exercise-statement > p').inner_text()
            expect(page.locator('#exercice-1 [data-action="new-variant"]')).to_be_visible()
            page.locator('#exercice-1 [data-action="new-variant"]').click()
            expect(page.locator('.exercise-block')).to_have_count(9)
            new_statement = page.locator('#exercice-1 .exercise-statement > p').inner_text()
            assert new_statement != statement_before
            expect(page.locator('#exercise-score')).to_have_text('1/9')
            expect(page.locator('#exercice-1 .exercise-kicker')).to_contain_text('variante 2')
            # Régression : la méthode réutilise le coefficient ET la cible de la variante.
            changed_help = page.locator('#exercice-1 .coaching-hint').nth(2).text_content()
            model_values = [float(c.get_attribute('data-expect')) for c in
                            page.locator('#exercice-1 input[data-expect]').all()]
            a_coefficient = (model_values[2] - model_values[1]) / 4
            target = 5 * a_coefficient + model_values[1]
            assert f'{int(a_coefficient)} × 4' in changed_help, changed_help
            assert f' = {int(target)}' in changed_help, changed_help
            assert '3 × 4 − 5' not in changed_help, changed_help
            expect(page.locator('#exercice-1 .coaching-hint')).to_have_count(3)

            for control in page.locator('#exercice-1 input[data-expect]').all():
                control.fill(control.get_attribute('data-expect').split('|')[0])
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercise-score')).to_have_text('2/9')
            page.locator('#exercice-1 input[data-expect]').first.fill('99999')
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercise-score')).to_have_text('1/9')
            page.locator('#exercice-1 [data-action="new-variant"]').click()
            assert page.locator('#exercice-1 .exercise-statement > p').inner_text() != new_statement
            expect(page.locator('#exercice-1 .exercise-kicker')).to_contain_text('variante 3')


            # Deux vraies tentatives erronées débloquent un exercice indépendant.
            page.locator('#exercice-1 input[data-expect]').first.fill('99999')
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercice-1 .coaching-diagnosis')).to_be_visible()
            expect(page.locator('#exercice-1 .coaching-bridge')).to_be_hidden()
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercice-1 .coaching-bridge')).to_be_visible()
            page.locator('#exercice-1 .coaching-bridge summary').click()
            page.locator('#exercice-1 .coaching-bridge-answer').fill('14/2')
            page.locator('#exercice-1 .coaching-bridge button').click()
            expect(page.locator('#exercice-1 .coaching-bridge p[role="status"]')).to_contain_text('Bravo')
            expect(page.locator('#exercise-score')).to_have_text('1/9')
            page.locator('#exercice-1 [data-action="reset"]').click()
            expect(page.locator('#exercice-1 .coaching-bridge')).to_be_hidden()
            # Une réussite efface le compteur d'échecs précédent.
            first = page.locator('#exercice-1 input[data-expect]')
            first.first.fill('99999')
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercice-1 .coaching-bridge')).to_be_hidden()
            for field in first.all():
                field.fill(field.get_attribute('data-expect'))
            page.locator('#exercice-1 button[type="submit"]').click()
            first.first.fill('99999')
            page.locator('#exercice-1 button[type="submit"]').click()
            expect(page.locator('#exercice-1 .coaching-bridge')).to_be_hidden()


            # Sur les 9 exercices, l'indice n° 3 suit deux tirages successifs.
            page.goto(base + 'exercices/fonctions.html')
            for i in range(9):
                page.locator(f'[data-step="{i}"]').click()
                panel = page.locator(f'#exercice-{i+1} .coaching-panel')
                expect(panel).to_have_count(1)
                expect(panel.locator('.coaching-hint')).to_have_count(3)
                help = panel.locator('.coaching-hint').nth(2)
                form = page.locator(f'#exercice-{i+1} .exercise-form')
                form.locator('button[type="submit"]').click()
                form.locator('[data-action="new-variant"]').click()
                first_generated = page.locator(f'#exercice-{i+1} .coaching-hint').nth(2).text_content()
                form = page.locator(f'#exercice-{i+1} .exercise-form')
                form.locator('button[type="submit"]').click()
                form.locator('[data-action="new-variant"]').click()
                second_generated = page.locator(f'#exercice-{i+1} .coaching-hint').nth(2).text_content()
                assert first_generated != second_generated, f'Indice figé pour exercice {i+1}'
                expect(page.locator(f'#exercice-{i+1} .coaching-hint')).to_have_count(3)

            # Tous les nouveaux parcours : valider, consulter, recommencer.
            extra_slugs = ['second-degre','suites','suites-arithmetiques','suites-geometriques','derivees','variations','statistiques-deux-variables','probabilites-conditionnelles','bernoulli','variables-aleatoires','calcul','evolutions','logique','statistiques-descriptives','python-tableur']
            for slug in extra_slugs:
                page.goto(base + f'exercices/{slug}.html')
                expect(page.locator('.exercise-block')).to_have_count(8)
                first = page.locator('#exercice-1 [data-expect]')
                assert first.count() >= 2, slug
                for control in first.all():
                    value = control.get_attribute('data-expect').split('|')[0]
                    if control.evaluate('(el) => el.tagName === "SELECT"'):
                        control.select_option(value=value)
                    else:
                        control.fill(value)
                page.locator('#exercice-1 button[type="submit"]').click()
                expect(page.locator('#exercise-score')).to_have_text('1/8')
                page.locator('#exercice-1 details.check summary').click()
                expect(page.locator('#exercice-1 .answer-row.was-correct')).to_have_count(first.count())
                expect(page.locator('#exercice-1 [data-action="new-variant"]')).to_be_visible()
                old_question = page.locator('#exercice-1 .exercise-statement > p').inner_text()
                page.locator('#exercice-1 [data-action="new-variant"]').click()
                expect(page.locator('#exercice-1')).to_be_visible()
                assert page.locator('#exercice-1 .exercise-statement > p').inner_text() != old_question, slug
                expect(page.locator('#exercise-score')).to_have_text('0/8')
                for control in page.locator('#exercice-1 [data-expect]').all():
                    value = control.get_attribute('data-expect').split('|')[0]
                    if control.evaluate('(el) => el.tagName === "SELECT"'):
                        control.select_option(value=value)
                    else:
                        control.fill(value)
                page.locator('#exercice-1 button[type="submit"]').click()
                expect(page.locator('#exercise-score')).to_have_text('1/8')
                page.locator('[data-nav="next"]').click()
                expect(page.locator('#exercice-2')).to_be_visible()
                page.locator('#exercice-2 details.check summary').click()
                expect(page.locator('#exercice-2 .answer-row.was-wrong')).not_to_have_count(0)
                expect(page.locator('#exercise-score')).to_have_text('1/8')
                page.locator('#exercice-2 [data-action="reset"]').click()
                expect(page.locator('#exercice-2 .answer-row.is-revealed')).to_have_count(0)
                # Après une erreur ou une correction, le score ne progresse pas.
                page.locator('#exercice-2 button[type="submit"]').click()
                expect(page.locator('#exercice-2 [data-action="new-variant"]')).to_be_visible()
                expect(page.locator('#exercise-score')).to_have_text('1/8')

            # Régression exécutée dans le navigateur, et pas uniquement dans Node.
            assert page.evaluate("""() => {
                const match = window.ExerciseVariants.matchesAnswer;
                return match('0,833','0.8333','number','0.000051','3')
                    && !match('0,834','0.8333','number','0.000051','3')
                    && match('2/4','0.5','number')
                    && match('5 ; 3','3;5','unordered-list')
                    && !match('3 ; 3','3;5','unordered-list');
            }""")

            # Questions actives et lecture accessible dans les 16 cours.
            lesson_slugs = ['fonctions', 'second-degre', 'suites',
                            'suites-arithmetiques', 'suites-geometriques',
                            'derivees', 'variations', 'statistiques-deux-variables',
                            'probabilites-conditionnelles', 'bernoulli',
                            'variables-aleatoires', 'calcul', 'evolutions',
                            'logique', 'statistiques-descriptives', 'python-tableur']
            for slug in lesson_slugs:
                page.goto(base + f'cours/{slug}.html')
                quiz1, quiz2 = page.locator('.study-quiz').first, page.locator('.study-quiz').last
                expected = quiz1.get_attribute('data-correct')
                quiz1.locator(f'input[value="{expected}"]').check()
                quiz1.locator('button[type="submit"]').click()
                expect(quiz1.locator('.study-feedback')).to_contain_text('Bien joué')
                assert quiz1.locator('.study-feedback').get_attribute('data-result') == 'correct'
                wrong = next(value for value in ['a', 'b', 'c'] if value != quiz2.get_attribute('data-correct'))
                quiz2.locator(f'input[value="{wrong}"]').check()
                quiz2.locator('button[type="submit"]').click()
                expect(quiz2.locator('.study-feedback')).to_contain_text('Pas encore')
                quiz2.locator(f'input[value="{quiz2.get_attribute("data-correct")}"]').check()
                quiz2.locator('button[type="submit"]').click()
                expect(quiz2.locator('.study-feedback')).to_contain_text('Bien joué')
                quiz2.locator('details summary').click()
                expect(quiz2.locator('details.study-solution')).to_have_attribute('open', '')

            # Ajustement de lecture et couleurs qui aident sans remplacer les mots.
            # "Suites" possede les trois types de bloc : formule, exemple, avertissement.
            page.goto(base + 'cours/suites.html')
            initial_size = page.locator('.lesson-content').evaluate('(el) => parseFloat(getComputedStyle(el).fontSize)')
            page.locator('#reading-large-toggle').click()
            enlarged_size = page.locator('.lesson-content').evaluate('(el) => parseFloat(getComputedStyle(el).fontSize)')
            assert enlarged_size > initial_size, (initial_size, enlarged_size)
            expect(page.locator('#reading-large-toggle')).to_have_attribute('aria-pressed', 'true')
            page.locator('#reading-focus-toggle').click()
            expect(page.locator('.lesson-toc')).to_be_hidden()
            expect(page.locator('.lesson-content')).to_be_visible()
            page.locator('#reading-focus-toggle').click()
            expect(page.locator('.lesson-toc')).to_be_visible()
            visual_colors = page.evaluate("""() => ({
                formula: getComputedStyle(document.querySelector('.lesson-content .formula')).backgroundColor,
                example: getComputedStyle(document.querySelector('.lesson-content .example')).backgroundColor,
                warning: getComputedStyle(document.querySelector('.lesson-content .warning')).backgroundColor
            })""")
            assert len(set(visual_colors.values())) == 3, visual_colors
            page.locator('.support-scaffold summary').click()
            expect(page.locator('.support-scaffold')).to_have_attribute('open', '')

            page.goto(base + 'lecons.html')
            expect(page.locator('.lesson-card:visible')).to_have_count(16)
            page.locator('#course-search').fill('derivee')
            expect(page.locator('.lesson-card:visible')).to_have_count(2)
            page.locator('#course-search').fill('')
            page.locator('#course-category').select_option('probabilites')
            expect(page.locator('.lesson-card:visible')).to_have_count(3)
            page.locator('#course-search').fill('xyznotfound')
            expect(page.locator('#no-results')).to_be_visible()
            expect(page.locator('.lesson-card:visible')).to_have_count(0)
            page.locator('#course-search').fill('')
            page.locator('#course-category').select_option('')
            page.locator('a.lesson-card[href="cours/fonctions.html"]').click()
            expect(page).to_have_url(base + 'cours/fonctions.html')
            check = page.locator('details.check').first
            check.locator('summary').click()
            assert check.evaluate('(el) => el.open')
            page.evaluate("window.dispatchEvent(new Event('beforeprint'))")
            assert page.locator('details:not([open])').count() == 0
            page.evaluate("window.dispatchEvent(new Event('afterprint'))")
            assert check.evaluate('(el) => el.open')
            page.locator('.course-pagination a').last.click()
            expect(page).to_have_url(base + 'cours/second-degre.html')
            page.goto(base + 'cours/variables-aleatoires.html')
            for probability in ['0', '1', '0.3']:
                page.locator('[name="p"]').fill(probability)
                page.locator('[name="n"]').fill('20')
                page.locator('[name="N"]').fill('40')
                page.locator('#simulation-form button').click()
                expect(page.locator('#simulation-output table tbody tr')).to_have_count(3)
                assert page.locator('.sim-bars span').count() == 10
                assert '40' in page.locator('#simulation-output').inner_text()
                if probability in ['0', '1']:
                    counts = page.locator('#simulation-output tbody tr td:nth-child(2)').all_text_contents()
                    assert counts == ['40', '40', '40'], (probability, counts)
                bins = page.locator('#simulation-output details li').all_text_contents()
                assert sum(int(item.split(':')[-1].strip().split()[0]) for item in bins) == 40
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
            page.locator('[name="n"]').fill('0')
            page.evaluate("document.querySelector('#simulation-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}))")
            assert 'Choisir' in page.locator('#simulation-output').inner_text()
            nojs = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
            static = nojs.new_page()
            static.goto(base + 'lecons.html')
            expect(static.locator('.lesson-card:visible')).to_have_count(16)
            expect(static.locator('.catalog-tools')).to_be_hidden()
            static.locator('a.lesson-card[href="cours/calcul.html"]').click()
            expect(static.locator('.lesson-content')).to_be_visible()
            expect(static.locator('.lesson-toc')).to_be_hidden()
            static.locator('details.check summary').click()
            assert static.locator('details.check').evaluate('(el) => el.open')
            expect(static.locator('.study-quiz')).to_have_count(2)
            expect(static.locator('.study-quiz form')).to_have_count(2)
            expect(static.locator('.study-quiz form').first).to_be_hidden()
            static.locator('.study-solution').first.locator('summary').click()
            expect(static.locator('.study-solution').first).to_have_attribute('open', '')
            assert static.evaluate("document.querySelector('.lesson-content').getBoundingClientRect().width >= document.querySelector('.lesson-layout').getBoundingClientRect().width - 2")
            static.goto(base + 'cours/fonctions.html')
            expect(static.locator('.math-lab h3')).to_be_visible()
            expect(static.locator('.math-lab__plot')).to_have_count(0)
            expect(static.locator('.math-lab')).to_contain_text('Active JavaScript')
            nojs.close()
            assert not errors, errors
            assert not failed_responses, failed_responses
            browser.close()
            print(f'BROWSER OK: {checks} page/width combinations (320, 390, 768, 1440 px); search, filters, TOCs, corrections, print events, navigation, simulation and no-JavaScript fallback.')
            print('No JavaScript exceptions, no HTTP errors, no global horizontal overflow.')
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)

if __name__ == '__main__':
    main()
