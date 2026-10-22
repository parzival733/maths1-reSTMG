"""Browser regression: opt-in, diagnostics, evidence, print, timer and responsive UI.
UI_INLINE=1 is a visual-only fallback in environments with blocked browser navigation.
The CI run uses the real HTTP origin and its storage/CSP, never the fallback.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from urllib.parse import urlsplit
import os,json
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
INLINE=os.environ.get('UI_INLINE')=='1'
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def end_headers(self):
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'")
  super().end_headers()
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/'
 out=ROOT/'.qa-evolution';out.mkdir(exist_ok=True);errors=[]
 with sync_playwright() as p:
  exe=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE');browser=p.chromium.launch(**({'executable_path':exe} if exe else {}))
  def load(name,width=1280,js=True,context=None):
   context=context or browser.new_context(viewport={'width':width,'height':960},java_script_enabled=js)
   page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   if INLINE:
    from bs4 import BeautifulSoup
    doc=BeautifulSoup((ROOT/name).read_text(),'html.parser');scripts=[]
    for link in doc.select('link[rel=stylesheet]'):
     style=doc.new_tag('style');style.string=((ROOT/name).parent/urlsplit(link['href']).path).read_text();link.replace_with(style)
    for script in doc.select('script[src]'):
     scripts.append(((ROOT/name).parent/urlsplit(script['src']).path).read_text());script.decompose()
    page.set_content(str(doc))
    if js:
     page.add_script_tag(content="Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__saved?.[k]||null,setItem:(k,v)=>{window.__saved||={};window.__saved[k]=v;},removeItem:k=>delete(window.__saved||{})[k]}})")
     for script in scripts:page.add_script_tag(content=script)
   else:page.goto(base+name,wait_until='load')
   return page
  names=['index.html','progresser.html','mes-progres.html','diagnostic.html','revisions.html','preparer-bac.html','entrainement/sujet-blanc-1.html','entrainement/sujet-blanc-2.html','entrainement/problemes.html','a-propos.html','accessibilite.html','sujets.html','cours/fonctions.html','terminale/exercices/t-inverse.html']
  for name in ([] if os.environ.get('UI_FAST')=='1' else names):
   for width in [320,390,768,1280]:
    page=load(name,width);expect(page.locator('h1')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('overflow',name,width)
    expect(page.locator('.main-nav a')).to_have_count(6)
    if width in [390,1280] and name in ['progresser.html','preparer-bac.html','mes-progres.html','entrainement/sujet-blanc-1.html']:
     page.screenshot(path=str(out/(name.replace('/','-')+f'-{width}.png')))
    page.context.close()
  # Ten exact answers, five competence observations. No per-question grading in diagnostic.
  page=load('diagnostic.html');page.locator('#practice-start').click()
  for i in range(10):
   assert page.locator('#practice-check').is_hidden()
   answer=page.locator('#practice-solution strong').text_content().split(': ',1)[1]
   page.locator('#practice-answer').fill(answer);page.locator('#practice-next').click()
  expect(page.locator('#practice-results .progress-card')).to_have_count(5)
  assert page.locator('#practice-results').text_content().count('2/2')==5
  assert page.evaluate('MathsAcquis.store.enabled') is False
  page.screenshot(path=str(out/'diagnostic-bilan.png'));page.context.close()
  # Targeted review, help attribution, correction, equivalent and first-attempt history.
  page=load('revisions.html');page.evaluate('MathsAcquis.store.enable()')
  page.locator('#practice-skill').select_option('fractions');page.locator('#practice-start').click()
  old=page.locator('#practice-title').text_content();answer=page.locator('#practice-solution strong').text_content().split(': ',1)[1]
  page.locator('#practice-hint').click();page.locator('#practice-answer').fill(answer);page.locator('#practice-check').click()
  events=page.evaluate('MathsAcquis.store.read().events');assert events[0]['outcome']=='assisted',events
  page.locator('#practice-equivalent').click();assert page.locator('#practice-title').text_content()!=old
  page.locator('#practice-reveal').click();events=page.evaluate('MathsAcquis.store.read().events');assert events[-1]['outcome']=='revealed'
  assert not any('value' in e or 'answer' in e for e in events)
  page.context.close()
  # Existing exercise score is independent of optional evidence; edited answers invalidate score.
  context=browser.new_context();page=load('exercices/fonctions.html',context=context)
  page.evaluate('MathsAcquis.store.enable()')
  slide=page.locator('.exercise-block').first
  slide.locator('[data-expect]').evaluate_all("es=>es.forEach(e=>{e.value=e.dataset.expect;e.dispatchEvent(new Event('input',{bubbles:true}));})")
  slide.locator('button[type=submit]').first.click();expect(page.locator('#exercise-score')).to_have_text('1/9')
  assert page.evaluate('MathsAcquis.store.read().events[0].outcome')=='independent'
  slide.locator('input[data-expect]').first.fill('99');expect(page.locator('#exercise-score')).to_have_text('0/9')
  if not INLINE:
   page.reload();expect(page.locator('#exercise-score')).to_have_text('0/9');assert page.evaluate('MathsAcquis.store.read().events.length')==1
   page.goto(base+'mes-progres.html');expect(page.locator('#progress-list .progress-card')).to_have_count(1)
   with page.expect_download() as dl:page.locator('#progress-export').click()
   assert dl.value.suggested_filename.endswith('.json')
   page.on('dialog',lambda d:d.accept());page.locator('#progress-disable').click()
   assert page.evaluate('localStorage.getItem(MathsAcquis.KEY)') is None
   page.locator('#progress-import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{broken'})
   expect(page.locator('#progress-message')).to_contain_text('valide');assert not page.evaluate('MathsAcquis.store.enabled')
  context.close()
  # Original quick-calculation bank: revealed print answers cannot be autonomous evidence.
  page=load('annexes/calcul-rapide.html');page.evaluate('MathsAcquis.store.enable()');page.locator('#rapid-timer-none').check();page.locator('#rapid-start').click()
  q=page.evaluate("()=>{const d=document.getElementById('rapid-app').dataset;return QuickMath.session({level:d.level,method:d.method,topic:d.topic,count:+d.count,seed:+d.seed})[0]}")
  page.locator('#rapid-hint-button').click();page.locator('#rapid-answer').fill(q['expected']);page.locator('#rapid-check').click()
  assert page.evaluate('MathsAcquis.store.read().events[0].outcome')=='assisted'
  page.locator('#rapid-paper-tools > summary').click();page.locator('#rapid-print-answers').check();page.evaluate("dispatchEvent(new Event('beforeprint'))")
  events=page.evaluate('MathsAcquis.store.read().events');assert len({e['variant'] for e in events})>1;assert all(e['outcome'] in ['assisted','revealed'] for e in events)
  page.evaluate("dispatchEvent(new Event('afterprint'))");page.context.close()
  # Optional exam timer, print without correction by default, deliberate inclusion and restoration.
  page=load('entrainement/sujet-blanc-1.html');page.clock.install()
  page.locator('#exam-minutes').fill('15');page.locator('#exam-start').click();expect(page.locator('#exam-clock')).to_have_text('15:00')
  page.clock.fast_forward(60000);expect(page.locator('#exam-clock')).to_have_text('14:00')
  page.locator('#exam-pause').click();page.clock.fast_forward(60000);expect(page.locator('#exam-clock')).to_have_text('14:00')
  page.locator('#exam-pause').click();page.evaluate("dispatchEvent(new Event('beforeprint'))");page.emulate_media(media='print')
  expect(page.locator('.exam-correction')).to_be_hidden();page.pdf(path=str(out/'sujet-sans-corrige.pdf'),format='A4',margin={'top':'16mm','bottom':'16mm','left':'18mm','right':'18mm'})
  page.evaluate("dispatchEvent(new Event('afterprint'))");page.emulate_media(media='screen');page.locator('#exam-include-answers').check()
  page.evaluate("dispatchEvent(new Event('beforeprint'))");page.emulate_media(media='print');expect(page.locator('.exam-correction')).to_be_visible()
  page.pdf(path=str(out/'sujet-avec-corrige.pdf'),format='A4',margin={'top':'16mm','bottom':'16mm','left':'18mm','right':'18mm'})
  page.evaluate("dispatchEvent(new Event('afterprint'))");page.emulate_media(media='screen');assert not page.locator('.exam-correction').evaluate('e=>e.open')
  page.clock.fast_forward(14*60000);expect(page.locator('#exam-status')).to_contain_text('Temps');page.context.close()
  # Graph has a keyboard-operable control and a data table derived from the same parameters.
  page=load('cours/fonctions.html');expect(page.locator('.math-lab__values-table')).to_have_count(1)
  page.locator('.math-lab__data > summary').click();before=page.locator('.math-lab__values-table').inner_text();slider=page.locator('.math-lab input[type=range]').first
  slider.focus();page.keyboard.press('ArrowRight');assert page.locator('.math-lab__values-table').inner_text()!=before
  page.context.close()
  for name in ['exercices/second-degre.html','terminale/exercices/t-inverse.html']:
   page=load(name,390,js=False);expect(page.locator('.offline-series')).to_be_visible();assert page.locator('.offline-series .exam-block').count()>=6;page.context.close()
  assert not errors,errors
  browser.close()
 server.shutdown();server.server_close()
 print('EVOLUTION BROWSER OK: responsive UI, diagnostic, optional tracking, help/correction evidence, timer, print, graphs and no-JS exercises. Mode:', 'INLINE (storage mocked; not a persistence/CSP certification)' if INLINE else 'real HTTP, localStorage and CSP')
if __name__=='__main__':main()
