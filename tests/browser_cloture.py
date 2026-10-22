"""Accessibility/performance lab. This is not a WCAG certificate or a human study."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import os,json,statistics
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.qa-cloture'
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'")
  super().end_headers()
def save(name,value):
 OUT.mkdir(exist_ok=True);(OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}/'
 axe=Path(os.environ['AXE_PATH']).read_text()
 representative=['index.html','lecons.html','terminale/lecons.html','cours/fonctions.html','exercices/fonctions.html','terminale/exercices/t-inverse.html','sujets.html','annexes/calcul-rapide.html','diagnostic.html','revisions.html','mes-progres.html','entrainement/sujet-blanc-1.html','entrainement/problemes.html']
 report={'engine':'axe-core 4.10.3','tags':['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'],'mode':'real local HTTP; no mock storage','pages':[],'states':[],'layout':[],'limitations':['Not a formal RGAA/WCAG conformance audit.','No human NVDA/VoiceOver or classroom study performed.'],'violations':[]};failures=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(**({'executable_path':os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']} if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {}))
  def inspect(page,name):
   page.evaluate(axe)
   result=page.evaluate("async tags=>await axe.run(document,{runOnly:{type:'tag',values:tags}})",report['tags'])
   issues=[{'id':x['id'],'impact':x['impact'],'help':x['help'],'nodes':[{'target':n['target'],'summary':n.get('failureSummary'),'html':n['html'][:400]} for n in x['nodes']]} for x in result['violations']]
   report['violations'].extend({'page':name,**x} for x in issues)
   report['pages'].append({'path':name,'violations':len(issues),'manual_review':[{'id':x['id'],'nodes':len(x['nodes'])} for x in result['incomplete']]})
  for file in sorted(ROOT.rglob('*.html')):
   name=file.relative_to(ROOT).as_posix()
   if any(x.startswith('.') for x in file.relative_to(ROOT).parts):continue
   ctx=browser.new_context(viewport={'width':1280,'height':900});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(origin+name,wait_until='networkidle');inspect(page,name)
   if errors:failures.append({'path':name,'javascript':errors})
   ctx.close()
  save('accessibility.json',report)
  for name in representative:
   ctx=browser.new_context(viewport={'width':1280,'height':900});page=ctx.new_page();page.goto(origin+name,wait_until='load')
   page.keyboard.press('Tab');skip=page.evaluate("document.activeElement.classList.contains('skip-link')")
   page.keyboard.press('Enter');bypass=page.evaluate("document.activeElement.id==='contenu'")
   if not(skip and bypass):failures.append({'path':name,'skip_link':False})
   client=ctx.new_cdp_session(page);client.send('Accessibility.enable');tree=client.send('Accessibility.getFullAXTree')['nodes']
   controls=[x for x in tree if not x.get('ignored') and x.get('role',{}).get('value') in ['button','textbox','combobox','spinbutton','slider','radio','checkbox']]
   unnamed=[x.get('role',{}).get('value') for x in controls if not x.get('name',{}).get('value')]
   if unnamed:failures.append({'path':name,'unnamed_accessible_controls':unnamed})
   for width,scale,spacing in [(320,1,False),(1280,2,False),(320,1,True)]:
    page.set_viewport_size({'width':width,'height':900});page.reload(wait_until='load')
    if scale==2:page.evaluate("() => {const nodes=[...document.querySelectorAll('body *')].filter(e=>!['SCRIPT','STYLE','SVG','PATH'].includes(e.tagName));const sizes=nodes.map(e=>parseFloat(getComputedStyle(e).fontSize));nodes.forEach((e,i)=>e.style.fontSize=(sizes[i]*2)+'px');}")
    if spacing:page.add_style_tag(content='* {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p {margin-bottom:2em!important}')
    overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth+2')
    row={'path':name,'width':width,'textScale':scale,'textSpacing':spacing,'no_global_overflow':not overflow};report['layout'].append(row)
    if overflow:
     row['offenders']=page.evaluate("[...document.querySelectorAll('main *,header *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2&&getComputedStyle(e).display!=='none').slice(0,10).map(e=>({tag:e.tagName,cls:e.className,id:e.id}))")
     failures.append(row)
    if width==320 and not spacing:page.screenshot(path=str(OUT/(name.replace('/','-')+'-320.png')))
   ctx.close()
  ctx=browser.new_context();page=ctx.new_page();page.goto(origin+'diagnostic.html')
  page.locator('#practice-start').focus();page.keyboard.press('Enter');page.locator('#practice-answer').focus();page.keyboard.type('1/2')
  page.locator('#practice-next').focus();page.keyboard.press('Enter');assert '2' in page.locator('#practice-counter').inner_text()
  inspect(page,'diagnostic:question2');page.locator('#practice-stop').focus();page.once('dialog',lambda d:d.accept());page.keyboard.press('Enter')
  assert page.locator('#practice-results').is_visible();inspect(page,'diagnostic:bilan');report['states'].append('keyboard diagnostic start, answer, next, finish and result')
  page.goto(origin+'revisions.html');page.locator('#practice-start').click();page.locator('#practice-answer').fill('not-a-number');page.locator('#practice-check').click()
  assert page.locator('#practice-answer').get_attribute('aria-invalid')=='true';inspect(page,'revision:invalid-input')
  page.locator('#practice-hint').click();page.locator('#practice-reveal').click();inspect(page,'revision:help-and-correction')
  page.goto(origin+'mes-progres.html');page.locator('#progress-enable').click();inspect(page,'progress:enabled')
  page.once('dialog',lambda d:d.accept());page.locator('#progress-disable').click();assert page.evaluate("localStorage.getItem('maths-stmgdls:acquis:v1')") is None
  report['states'].append('tracking opt-in and deletion with real localStorage');ctx.close();save('accessibility.json',report)
  performance={'profile':{'downloadMbps':1.6,'uploadKbps':750,'latencyMs':150,'cpuSlowdown':4,'cache':'disabled','runsPerPage':3,'origin':'local HTTP laboratory, not field metrics'},'pages':[]}
  for name in ['index.html','cours/fonctions.html','exercices/fonctions.html','terminale/exercices/t-inverse.html','sujets.html','diagnostic.html','revisions.html','annexes/calcul-rapide.html']:
   runs=[]
   for i in range(3):
    ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1);page=ctx.new_page();cdp=ctx.new_cdp_session(page)
    cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
    cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':150,'downloadThroughput':1600000/8,'uploadThroughput':750000/8});cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    page.add_init_script("window.__lab={lcp:0,cls:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lab.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__lab.cls+=e.value})).observe({type:'layout-shift',buffered:true});")
    page.goto(origin+name,wait_until='networkidle');page.wait_for_timeout(250)
    data=page.evaluate("()=>{const n=performance.getEntriesByType('navigation')[0],r=performance.getEntriesByType('resource');return {...window.__lab,domReady:n.domContentLoadedEventEnd,load:n.loadEventEnd,requests:r.length+1,bytes:n.transferSize+r.reduce((s,x)=>s+x.transferSize,0)}}")
    action='#practice-start' if name in ['diagnostic.html','revisions.html'] else '#rapid-start' if name=='annexes/calcul-rapide.html' else 'button[type=submit]' if 'exercices/' in name else None
    if action:data['actionMs']=page.locator(action).first.evaluate("async e=>{const t=performance.now();e.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return performance.now()-t}")
    runs.append(data);ctx.close()
   performance['pages'].append({'path':name,'runs':runs,'median':{k:round(statistics.median(x[k] for x in runs),2) for k in runs[0]}})
  budgets=[]
  for row in performance['pages']:
   m=row['median'];passed=m['bytes']<=400000 and m['lcp']<=5000 and m['cls']<=.1 and m.get('actionMs',0)<=300
   budgets.append({'path':row['path'],'passed':passed})
   if not passed:failures.append({'performance':row['path'],'median':m})
  performance['budgets']={'maxBytes':400000,'maxLcpMs':5000,'maxCls':.1,'maxActionMs':300,'results':budgets};save('performance.json',performance);browser.close()
 server.shutdown();server.server_close();report['failures']=failures;save('accessibility.json',report)
 print('CLOTURE:',len(report['pages']),'page/state scans;',len(report['violations']),'axe violations;',len(failures),'additional failures')
 if report['violations'] or failures:raise SystemExit('Review .qa-cloture reports; no false conformity claim.')
if __name__=='__main__':main()
