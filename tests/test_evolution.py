"""Independent arithmetic, content preservation, routing, metadata and fallback checks."""
from pathlib import Path
from fractions import Fraction
from urllib.parse import urlsplit,unquote
import hashlib,json,re,subprocess,xml.etree.ElementTree as ET
from test_calcul_rapide import reference,Page
ROOT=Path(__file__).resolve().parents[1]
def main():
 samples=json.loads(subprocess.check_output(['node','tests/test_parcours.js','--json'],cwd=ROOT,text=True))
 assert len(samples)==10080
 for q in samples:
  assert reference(q['ref'])==Fraction(q['expected']),(q['id'],q['prompt'],q['expected'])
  assert (ROOT/(q['course']+'.html')).is_file()
 for path,data in json.loads((ROOT/'tests/evolution-mathematics.json').read_text()).items():
  text=(ROOT/path).read_text()
  if data['kind']=='exercise-json':
   obj=json.loads(re.search(r'<script type="application/json" id="exercise-data">([\s\S]*?)</script>',text)[1]); items=[{k:v for k,v in e.items() if k in {'statement','tasks','fields','correction'}} for e in obj['exercises']]
   content=json.dumps(items,sort_keys=True,ensure_ascii=True).encode()
  else:content=(ROOT/path).read_bytes()
  assert hashlib.sha256(content).hexdigest()==data['sha256'],('mathematics changed',path)
 papers=json.loads((ROOT/'donnees/entrainements.json').read_text())
 for subject in papers:
  assert len(subject['autos'])==12
  assert sum(q['points'] for q in subject['autos'])==6
  for q in subject['autos']:
   if q.get('ref'):assert reference(q['ref'])==Fraction(q['answer']),(subject['id'],q)
  print('EXAM STRUCTURE',subject['id'],list(subject.keys()))
  for p in subject['problems']:
   assert p['math_points']==6 and p['language_points']==1,p
   assert sum(q['points'] for q in p['questions'])==6,p
   for q in p['questions']:
    if q.get('ref'):assert reference(q['ref'])==Fraction(q['answer']),(subject['id'],q)
  assert sum(p['math_points']+p['language_points'] for p in subject['problems'])==14
  html=(ROOT/'entrainement'/f"{subject['id']}.html").read_text()
  assert 'exam-include-answers' in html and 'exam-correction' in html
 pages={p:Page(p.read_text()) for p in ROOT.rglob('*.html') if not any(x.startswith('.') for x in p.relative_to(ROOT).parts)}
 indexed=set()
 for path,page in pages.items():
  html=path.read_text();name=path.relative_to(ROOT).as_posix()
  assert page.lang=='fr' and page.h1==page.main==1,name
  assert len(page.ids)==len(set(page.ids)),('duplicate IDs',name)
  assert not re.search('[\x00-\x08\x0b\x0c\x0e-\x1f]',html),name
  for link in page.links:
   u=urlsplit(link)
   if u.scheme or u.netloc:continue
   target=(path.parent/unquote(u.path)).resolve() if u.path else path
   assert target.is_relative_to(ROOT) and target.is_file(),(name,link)
   if u.fragment:assert unquote(u.fragment) in pages[target].ids,(name,link)
  canon=re.findall('<link rel="canonical" href="([^"]+)"',html)
  assert (not canon if name=='404.html' else len(canon)==1 and canon[0].startswith('https://mathstmgdls.pages.dev/')),name
  assert '<meta name="description"' in html,name
  if 'noindex' not in html:indexed.add(canon[0])
 sitemap=ET.fromstring((ROOT/'sitemap.xml').read_text())
 locations=[x.text for x in sitemap.findall('{*}url/{*}loc')]
 assert len(locations)==len(set(locations)) and set(locations)==indexed
 assert 'Sitemap: https://mathstmgdls.pages.dev/sitemap.xml' in (ROOT/'robots.txt').read_text()
 assert 'noindex' in (ROOT/'404.html').read_text()
 assert sum('data-offline-series' in p.read_text() for p in pages)==24
 print(f'EVOLUTION OK: {len(pages)} pages, {len(locations)} canonical URLs, 10080 independent rational recalculations, original mathematical banks preserved.')
if __name__=='__main__':main()
