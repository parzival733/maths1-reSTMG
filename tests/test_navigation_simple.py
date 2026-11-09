"""Direct access and useful home graph regression. No external requests."""
from pathlib import Path
from html.parser import HTMLParser
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from urllib.parse import urlsplit
import re,json,hashlib,subprocess,os,math
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def end_headers(self):
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'")
  super().end_headers()
def main():
 pages=[p for p in R.rglob('*.html') if not any(x.startswith('.') or x in ('docs', 'public') for x in p.relative_to(R).parts)]
 for p in pages:
  text=p.read_text()
  if p.name=='404.html':
   nav=re.search(r'<nav[^>]*>[\s\S]*?</nav>',text)[0]
   assert nav.count('<a ')==4 and '>Progresser</a>' not in nav,p
  else:
   nav=re.search(r'<nav class="main-nav"[^>]*>[\s\S]*?</nav>',text)[0]
   assert nav.count('<a ')==5 and '>Progresser</a>' not in nav,p
  assert not re.search(r'href="(?:\.\./)*(?:progresser|preparer-bac|mes-progres)\.html',text),p
 for name in ['exercices.html','terminale/exercices.html']:
  text=(R/name).read_text()
  assert text.count('id="mes-progres"')==text.count('id="progress-controls"')==1
  assert 'inline-progress' in text and 'progress-data' in text
 text=(R/'index.html').read_text()
 assert 'evo-home-entry' not in text
 art=re.search(r'<svg class="function-graph"[\s\S]*?</svg>',text)[0]
 expected=json.loads((R/'tests/home-art-baseline.json').read_text())
 assert hashlib.sha256(art.encode()).hexdigest()==expected['sha256']
 # Le graphique et les deux inclinaisons historiques sont restaurés
 # à la demande de l’utilisateur. Les styles restent propres à l’accueil.
 assert 'd="M40 210 240 10"' in art and 'cx="140" cy="110"' in art
 assert 'role="img"' in art and 'f(2) = 3' in art
 home=(R/'assets/accueil.css').read_text()
 others=''.join(p.read_text() for p in sorted((R/'assets').glob('*.css')) if p.name!='accueil.css')
 assert not re.search(r'\.graph-paper\s*\{|\.art-bottom\s*\{|\.hero-art\s*\{[^}]*(?:transform|rotate|background|border)',others)
 assert 'rotate(1.5deg)' in home and 'rotate(-3deg)' in home
 before={p:p.read_bytes() for p in pages}
 subprocess.run(['python3','tools/finalize_site.py'],cwd=R,check=True)
 assert all(p.read_bytes()==s for p,s in before.items()),'finalization must be idempotent'
 subprocess.run(['python3','tools/build_sujets.py'],cwd=R,check=True)
 assert all(p.read_bytes()==s for p,s in before.items()),'catalogue build must preserve navigation'
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(R.parent)))
 Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/{R.name}/'
 out=R/'.qa-navigation';out.mkdir(exist_ok=True);errors=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(**({'executable_path':os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']} if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {}))
  for name in ['index.html','exercices.html','terminale/exercices.html','sujets.html','progresser.html','preparer-bac.html']:
   for width in [320,390,1280]:
    context=browser.new_context(viewport={'width':width,'height':950});page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+name,wait_until='load')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(name,width)
    expect(page.locator('.main-nav a')).to_have_count(5)
    if name.endswith('exercices.html') or name=='progresser.html':
     expect(page.locator('.catalog-group').first).to_be_visible()
     assert not page.locator('#mes-progres').evaluate('e=>e.open')
     assert not page.evaluate('MathsAcquis.store.enabled')
     page.locator('#mes-progres > summary').click()
     expect(page.locator('#progress-enable')).to_be_visible()
     assert not page.evaluate('MathsAcquis.store.enabled'),'opening must not opt in'
     page.locator('#progress-enable').click()
     assert page.evaluate('MathsAcquis.store.enabled')
     expect(page.locator('#progress-summary')).to_contain_text('activ')
     page.locator('#mes-progres > summary').click()
    if name=='index.html':
     for sel,angle in [('.hero-art',1.5),('.graph-paper',-3)]:
      actual=page.locator(sel).evaluate('e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return Math.atan2(m.b,m.a)*180/Math.PI}')
      assert math.isclose(actual,angle,abs_tol=0.001),(sel,actual)
     assert page.locator('.graph-paper').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(255, 255, 255)'
    if name=='sujets.html':
     expect(page.locator('#sujets-blancs a[href*="sujet-blanc-"]')).to_have_count(2)
     expect(page.locator('.subject-card')).to_have_count(41)
    if width in [390,1280] and name in ['index.html','exercices.html','sujets.html']:
     page.screenshot(path=str(out/(name+f'-{width}.png')),full_page=True)
    context.close()
  # Data saved through the existing store remain accessible in the inline panel.
  context=browser.new_context();page=context.new_page();page.goto(base+'exercices.html#mes-progres')
  assert page.locator('#mes-progres').evaluate('e=>e.open')
  page.locator('#progress-enable').click()
  page.evaluate("MathsAcquis.store.record({skill:'fonctions',source:'chapitre',template:'fonctions:0',variant:MathsAcquis.hash('navigation-check'),outcome:'independent',error:''})")
  saved=page.evaluate('localStorage.getItem(MathsAcquis.KEY)')
  page.reload();expect(page.locator('#progress-list .progress-card')).to_have_count(1)
  assert page.evaluate('localStorage.getItem(MathsAcquis.KEY)')==saved
  page.locator('.progress-data > summary').click()
  with page.expect_download() as download:page.locator('#progress-export').click()
  assert download.value.suggested_filename.endswith('.json')
  page.once('dialog',lambda d:d.accept());page.locator('#progress-disable').click()
  assert page.evaluate('localStorage.getItem(MathsAcquis.KEY)') is None
  # A Terminale pupil can return without being silently switched to Premiere.
  page.goto(base+'revisions.html?niveau=terminale');expect(page.locator('.return-to-exercises')).to_have_attribute('href',base+'terminale/exercices.html')
  page.locator('#practice-level').select_option('premiere');expect(page.locator('.return-to-exercises')).to_have_attribute('href',base+'exercices.html')
  page.goto(base+'terminale/exercices.html#mes-progres');assert page.locator('#mes-progres').evaluate('e=>e.open')
  assert page.locator('#progress-level').input_value()=='terminale'
  page.locator('#progress-enable').click();page.evaluate("MathsAcquis.store.record({skill:'t-inverse',source:'chapitre',template:'t-inverse:0',variant:MathsAcquis.hash('terminal-navigation'),outcome:'retry',error:''})")
  page.reload();expect(page.locator('#progress-list .progress-card')).to_have_count(1)
  for href in page.locator('#progress-list a').evaluate_all('es=>es.map(e=>e.href)'):
   assert '/terminale/terminale/' not in href and urlsplit(href).path.startswith('/'+R.name+'/'),href
  context.close()
  # Chapters, annals, and subjects remain readable without JavaScript.
  context=browser.new_context(java_script_enabled=False);page=context.new_page()
  for name in ['exercices.html','terminale/exercices.html']:
   page.goto(base+name);expect(page.locator('.catalog-group').first).to_be_visible()
  page.goto(base+'sujets.html');expect(page.locator('.subject-card:visible')).to_have_count(41)
  context.close();browser.close()
 server.shutdown();server.server_close();assert not errors,errors
 print('NAVIGATION OK: five entries; direct subjects; inline optional progress, persistence/export/delete; selected level; original graph and tilted frames; no-JS and mobile.')
if __name__=='__main__':main()
