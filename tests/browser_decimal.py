"""Menu commun, curseur et espacement des réponses sur Chromium/WebKit.

Les profils mobiles ne reproduisent pas le clavier système d'un iPhone physique.
"""
import functools
import os
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect
from http_security import SecurityHandler
from input_symbols import choose_symbol, symbol_button

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.qa-decimal'


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
                for path in pages:
                    name = path.relative_to(ROOT).as_posix()
                    page.goto(base + name)
                    page.evaluate("document.querySelectorAll('.exercise-block').forEach(e=>e.hidden=false)")
                    page.evaluate("async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))}")
                    layout = page.evaluate("""() => {
                      return [...document.querySelectorAll('.exercise-form')].map(form => {
                        const fields=[...form.querySelectorAll('.answer-row input[data-expect]')];
                        const rows=[...form.querySelectorAll('.answer-row')];
                        const controls=[...form.querySelectorAll('.answer-row input,.answer-row select')];
                        const rects=controls.map(e=>e.getBoundingClientRect());
                        const gaps=rows.slice(1).map((e,i)=>e.getBoundingClientRect().top-rows[i].getBoundingClientRect().bottom);
                        return {id:form.closest('article').id,fields:fields.length,menus:form.querySelectorAll('.answer-symbols-toggle').length,
                          top:!!form.querySelector(':scope > .answer-tools > h3'),
                          rowsGaps:gaps,
                          captionGaps:rows.filter(e=>e.firstElementChild?.tagName==='SPAN').map(e=>e.querySelector('input,select').getBoundingClientRect().top-e.firstElementChild.getBoundingClientRect().bottom),
                          widths:rects.map(r=>r.width),lefts:rects.map(r=>r.left),
                          heights:controls.map(e=>e.offsetHeight),fontSizes:controls.map(e=>parseFloat(getComputedStyle(e).fontSize))};
                      });
                    }""")
                    for form in layout:
                        assert form['menus'] == (1 if form['fields'] else 0), (name, form)
                        if form['fields']:assert form['top'], name
                        assert all(abs(g-16) < .1 for g in form['rowsGaps']), (name, form)
                        assert all(abs(g-8)<.1 for g in form['captionGaps']), (name, form)
                        assert all(x >= 120 for x in form['widths']), (name, form)
                        assert not form['widths'] or max(form['widths'])-min(form['widths']) < .1, (name, form)
                        assert not form['lefts'] or max(form['lefts'])-min(form['lefts']) < .1, (name, form)
                        assert all(h==48 for h in form['heights']), (name, form)
                        assert all(s>=16 for s in form['fontSizes']), (name, form)
                        checked += form['fields']
                    expect(page.locator('.answer-input,.answer-sign,.answer-decimal')).to_have_count(0)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (name, width)
                context.close()

            for mobile, width in [(True,390), (False,1440)]:
                context = browser.new_context(viewport={'width':width,'height':844},is_mobile=mobile,has_touch=mobile,color_scheme='dark')
                page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
                page.goto(base+'exercices/fonctions.html')
                form=page.locator('#exercice-1 .exercise-form')
                field=form.locator('[data-expect]').nth(1)
                for value,start,end,key,expected,caret in [
                    ('1234',2,2,'minus','12−34',3),
                    ('1234',1,3,'plus','1+4',2),
                    ('1234',2,2,'decimal','12,34',3),
                    ('1234',1,3,'fraction','1/4',2),
                    ('12/34',3,3,'minus','12/−34',4),
                    ('1234',0,0,'minus','−1234',1),
                    ('1234',4,4,'minus','1234−',5),
                ]:
                    field.fill(value)
                    field.evaluate('(e,p)=>e.setSelectionRange(...p)',[start,end])
                    # Le vrai menu commun est actionné sans refocaliser le champ.
                    toggle=form.locator('.answer-symbols-toggle')
                    toggle.tap() if mobile else toggle.click()
                    symbol_button(field,key).tap() if mobile else symbol_button(field,key).click()
                    expect(field).to_have_value(expected);expect(field).to_be_focused()
                    assert field.evaluate('e=>e.selectionStart')==caret
                    assert field.evaluate('e=>e.selectionEnd')==caret
                    expect(form.locator('.answer-symbols-panel')).to_be_hidden()
                # Un événement de sélection tardif après perte de focus ne remplace pas la position mémorisée.
                field.fill('1234');field.evaluate('e=>e.setSelectionRange(2,2)')
                toggle=form.locator('.answer-symbols-toggle')
                toggle.tap() if mobile else toggle.click()
                field.evaluate("e=>{e.setSelectionRange(0,0);document.dispatchEvent(new Event('selectionchange'));}")
                symbol_button(field,'decimal').tap() if mobile else symbol_button(field,'decimal').click()
                expect(field).to_have_value('12,34')
                expect(form.locator('.exercise-feedback')).to_have_text('')
                # Un cadre unique au focus, sans contour distant ni changement de dimensions.
                focus=field.evaluate("e=>{const s=getComputedStyle(e);return {outline:s.outlineStyle,offset:s.outlineOffset,border:s.borderTopWidth,shadow:s.boxShadow,width:e.getBoundingClientRect().width,height:e.offsetHeight}}")
                assert focus['outline']=='none' and focus['offset']=='0px' and focus['border']=='2px' and focus['shadow']=='none',focus
                field.evaluate('e=>e.blur()')
                assert field.evaluate('e=>e.offsetHeight')==focus['height']
                if mobile:
                    field.focus()
                    page.screenshot(path=str(OUT/(engine+'-champs-reguliers.png')))

                # Le menu agit sur le dernier champ, pas sur le premier de la fiche.
                third=form.locator('[data-expect]').nth(2);third.fill('56')
                choose_symbol(third,'fraction',touch=mobile);page.keyboard.insert_text('2')
                expect(third).to_have_value('56/2');expect(field).to_have_value('12,34')
                toggle=form.locator('.answer-symbols-toggle');toggle.tap() if mobile else toggle.click()
                expect(form.locator('.answer-symbols-target')).to_contain_text(third.get_attribute('aria-label'))
                if mobile:page.screenshot(path=str(OUT/(engine+'-menu-commun.png')))
                page.keyboard.press('Escape');expect(toggle).to_be_focused()
                toggle.tap() if mobile else toggle.click()
                field.tap() if mobile else field.click()
                expect(form.locator('.answer-symbols-panel')).to_be_hidden()
                # Vraie réponse juste entrée avec le signe au début choisi explicitement.
                for control in form.locator('[data-expect]').all():
                    control.fill(control.get_attribute('data-expect').split('|')[0].replace('.',',').replace('-','−'))
                first=form.locator('[data-expect]').first
                first.fill('11');first.evaluate('e=>e.setSelectionRange(0,0)')
                choose_symbol(first,'minus',touch=mobile)
                form.locator('button[type=submit]').tap() if mobile else form.locator('button[type=submit]').click()
                expect(form.locator('.exercise-feedback')).to_contain_text('Exercice validé')
                form.locator('details.check > summary').tap() if mobile else form.locator('details.check > summary').click()
                expect(toggle).to_be_disabled()
                form.locator('[data-action=reset]').tap() if mobile else form.locator('[data-action=reset]').click()
                expect(toggle).to_be_enabled()
                first.fill('0');form.locator('button[type=submit]').click();form.locator('[data-action=new-variant]').click()
                expect(page.locator('#exercice-1 .answer-symbols-toggle')).to_have_count(1)
                fresh=page.locator('#exercice-1 [data-expect]').last
                fresh.fill('1');choose_symbol(fresh,'fraction',touch=mobile);page.keyboard.insert_text('2')
                expect(fresh).to_have_value('1/2')
                context.close()
            browser.close()
            assert not errors,errors
            print(f'SIGNES {engine} OK : {len(pages)} séries, {checked} champs/thèmes, menu commun, insertion au curseur, sélection tardive, cadres uniques et espacements constants.')
    finally:
        server.shutdown();server.server_close()


if __name__=='__main__':main()
