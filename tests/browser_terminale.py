import os
"""Browser regression tests for both-level navigation and Terminale components."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent
SLUGS = ['t-suites','t-exponentielles','t-logarithme','t-inverse',
         't-statistiques','t-conditionnelles','t-binomiale','t-variables','t-outils']


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def no_overflow(page):
    dimensions = page.evaluate('''() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
    })''')
    assert dimensions['scroll'] <= dimensions['client'] + 1, (page.url, dimensions)


def fill_correct(slide):
    slide.locator('[data-expect]').evaluate_all('''els => els.forEach(el => {
        el.value = el.dataset.expect;
        el.dispatchEvent(new Event('input', {bubbles:true}));
        el.dispatchEvent(new Event('change', {bubbles:true}));
    })''')


def main():
    server = ThreadingHTTPServer(('127.0.0.1',0), partial(QuietHandler,directory=str(ROOT.parent)))
    worker = Thread(target=server.serve_forever,daemon=True)
    worker.start()
    base = f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'
    output = ROOT / '.qa-terminale'
    output.mkdir(exist_ok=True)
    errors = []
    failed = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(**({"executable_path":os.environ["PLAYWRIGHT_CHROMIUM_EXECUTABLE"]} if os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE") else {}))
            context = browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce')
            page = context.new_page()
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.on('response',lambda response: failed.append((response.status,response.url)) if response.status>=400 else None)
            for name in ['lecons','exercices']:
                page.goto(base + name + '.html')
                assert page.locator('.lesson-card').count() == 16
                page.locator('.level-switch a[href="terminale/' + name + '.html"]').click()
                expect(page).to_have_url(base + 'terminale/' + name + '.html')
                assert page.locator('.lesson-card').count() == 9
                expect(page.locator('.level-switch a[aria-current="page"]')).to_contain_text('Terminale')
                page.locator('.level-switch a[href="../' + name + '.html"]').click()
                expect(page).to_have_url(base + name + '.html')
            page.goto(base + 'terminale/lecons.html')
            page.locator('#course-search').fill('zzznothing')
            expect(page.locator('#no-results')).to_be_visible()
            page.locator('#course-search').fill('')
            page.locator('#course-category').select_option('analyse')
            assert page.locator('.lesson-card:visible').count() == 4
            page.locator('#course-category').select_option('')
            page.screenshot(path=str(output/'catalogue-desktop.png'))
            for slug in SLUGS:
                page.goto(base + f'terminale/cours/{slug}.html')
                expect(page.locator('.lesson-toc')).to_be_visible()
                assert page.locator('.lesson-toc nav a').count() >= 6
                assert page.locator('.course-pagination a').count() == 2
                for quiz in page.locator('.study-quiz').all():
                    answer = quiz.get_attribute('data-correct')
                    quiz.locator('input[value="'+answer+'"]').check()
                    quiz.locator('button[type="submit"]').click()
                    expect(quiz.locator('.study-feedback')).to_have_attribute('data-result','correct')
                page.locator('#reading-large-toggle').click()
                assert page.locator('body').evaluate("e=>e.classList.contains('reading-large')")
                page.locator('#reading-large-toggle').click()
                page.locator('#reading-focus-toggle').click()
                assert page.locator('body').evaluate("e=>e.classList.contains('reading-focus')")
                page.locator('#reading-focus-toggle').click()
                no_overflow(page)
                if slug=='t-suites':
                    page.locator('.study-quiz').first.scroll_into_view_if_needed()
                    page.screenshot(path=str(output/'lecon-desktop.png'))
            page.goto(base + 'terminale/cours/t-variables.html')
            for probability, expected_mean in [('0','0'),('1','1')]:
                page.locator('[name="p"]').fill(probability)
                page.locator('[name="n"]').fill('10')
                page.locator('[name="N"]').fill('20')
                page.locator('#simulation-form button').click()
                expect(page.locator('#simulation-output')).to_contain_text('Fr\u00e9quence moyenne : '+expected_mean)
            for slug in SLUGS:
                page.goto(base + f'terminale/exercices/{slug}.html')
                expect(page.locator('.exercise-block')).to_have_count(6)
                expect(page.locator('#exercise-score')).to_have_text('0/6')
                assert page.locator('main').get_attribute('data-chapter') == slug
                assert page.locator('main').get_attribute('aria-busy') is None
                assert page.locator('.coaching-hint').count() == 18
                initial = page.locator('#exercice-1 .exercise-statement > p').first.inner_text()
                for index in range(6):
                    page.locator(f'[data-step="{index}"]').click()
                    slide = page.locator(f'#exercice-{index+1}')
                    fill_correct(slide)
                    slide.locator('button[type="submit"]').click()
                    expect(page.locator('#exercise-score')).to_have_text(f'{index+1}/6')
                page.locator('[data-step="0"]').click()
                page.locator('#exercice-1 [data-action="new-variant"]').click()
                expect(page.locator('#exercise-score')).to_have_text('5/6')
                slide = page.locator('#exercice-1')
                assert slide.locator('.exercise-statement > p').first.inner_text() != initial
                slide.locator('[data-expect]').evaluate_all('''els=>els.forEach(el=>{
                    if(el.tagName==='SELECT') el.value=Array.from(el.options).find(o=>o.value && o.value!==el.dataset.expect).value;
                    else el.value='999999';
                    el.dispatchEvent(new Event('input',{bubbles:true}));
                })''')
                slide.locator('button[type="submit"]').click()
                slide.locator('button[type="submit"]').click()
                expect(slide.locator('.coaching-bridge')).to_be_visible()
                slide.locator('details.check summary').click()
                expect(slide.locator('.exercise-form')).to_have_attribute('data-revealed','true')
                assert slide.locator('.was-wrong').count() > 0
                expect(page.locator('#exercise-score')).to_have_text('5/6')
                slide.locator('[data-action="reset"]').click()
                fill_correct(slide)
                slide.locator('button[type="submit"]').click()
                expect(page.locator('#exercise-score')).to_have_text('6/6')
                assert page.locator('.exercise-links a').first.get_attribute('href') == '../cours/'+slug+'.html'
                no_overflow(page)
                if slug=='t-binomiale':
                    page.screenshot(path=str(output/'exercices-desktop.png'))
                page.reload()
                expect(page.locator('#exercise-score')).to_have_text('0/6')
            # Every new page, plus shared entries, must fit narrow screens.
            routes=['index.html','lecons.html','exercices.html','terminale/lecons.html',
                    'terminale/exercices.html','terminale/programme.html']
            routes += [f'terminale/{kind}/{slug}.html' for kind in ['cours','exercices'] for slug in SLUGS]
            for width in [390,320]:
                page.set_viewport_size({'width':width,'height':844})
                for route in routes:
                    page.goto(base+route)
                    no_overflow(page)
                    if width==390 and route in ['terminale/lecons.html','terminale/exercices/t-binomiale.html']:
                        page.screenshot(path=str(output/('catalogue-mobile.png' if route.endswith('lecons.html') else 'exercices-mobile.png')))
            # Original lesson header also loses the old level-only badge.
            page.set_viewport_size({'width':1280,'height':900})
            page.goto(base+'cours/fonctions.html')
            assert not page.locator('.level-badge').is_visible()
            context.close()
            context = browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
            page = context.new_page()
            for slug in SLUGS:
                page.goto(base+f'terminale/cours/{slug}.html')
                expect(page.locator('.lesson-content')).to_be_visible()
                assert page.locator('.study-solution').count() == 2
                expect(page.locator('.lesson-reading-controls')).to_be_hidden()
                page.locator('.study-solution summary').first.click()
                assert page.locator('.study-solution').first.get_attribute('open') is not None
                no_overflow(page)
            context.close()
            browser.close()
        assert not errors, errors
        assert not failed, failed
        print('BROWSER TERMINALE OK: 54 exercises; 18 quizzes; navigation, scores, variants, corrections, simulation, 320/390px and no-JavaScript lessons.')
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=5)


if __name__ == '__main__':
    main()
