"""Independent paper checks, cohort mapping, examples and delivery contract."""
from pathlib import Path
from fractions import Fraction as F
from html import unescape
from html.parser import HTMLParser
import json,re,subprocess,math
R=Path(__file__).resolve().parents[1]
class Content(HTMLParser):
 def __init__(self,text):
  super().__init__();self.text=[];self.pre=[];self.active=None;self.feed(text)
 def handle_starttag(self,tag,attrs):
  if tag=='pre':self.active=[]
 def handle_endtag(self,tag):
  if tag=='pre' and self.active is not None:self.pre.append(''.join(self.active));self.active=None
 def handle_data(self,s):
  self.text.append(s)
  if self.active is not None:self.active.append(s)
def main():
 subprocess.run(['node','tests/test_cloture.js'],cwd=R,check=True)
 papers=json.loads((R/'donnees/entrainements.json').read_text())
 # References written independently from the expression stacks in the source data.
 autos=[[F(3,4)+F(1,8),(-3)**2-8,F(15,100)*80,50*F(6,5),64/F(4,5),5,-7,2,5+4*3,2*2**3,F(7,10),F(8+10+15,3)],
        [F(2,3)/F(4,9),4-3*(-2),F(100-80,80)*100,(F(11,10)*F(6,5)-1)*100,3,3,F(8-2,3-1),3*2**2,12+4*3,F(3,10)*F(1,2),F(2*10+16,3),8*F(1,4)]]
 expected=[[
 ['-20','[2;10]','6','croissante puis decroissante','1600','0'],
 ['144','18/25','4/5','non','2/3','24/25']],
 [['120','80+20n','6','125','625/4','160'],['17','20','3','19/2','2750','extrapolation']]]
 for si,s in enumerate(papers):
  for q,v in zip(s['autos'],autos[si]):assert F(q['answer'])==v,(s['id'],q)
  for bi,p in enumerate(s['problems']):
   assert [q['answer'] for q in p['questions']]==expected[si][bi]
   assert p['math_points']==6 and p['language_points']==1
  text=' '.join(Content((R/'entrainement'/f"{s['id']}.html").read_text()).text)
  assert '20 points' in text and '6 points' in text and '14' in text
  for q in s['autos']:assert q['answer'] in text,('HTML correction drift',s['id'],q['answer'])
 # Domain and optimum of subject 1, and exact interpretation units.
 benefit=lambda x:-x*x+12*x-20
 assert benefit(2)==benefit(10)==0 and benefit(6)*100==1600
 assert all(benefit(F(i,10))<=benefit(6) for i in range(101))
 assert F(96,120)!=F(144,200) and 1-F(1,5)**2==F(24,25)
 assert 80+5*20<200<=80+6*20 and 80*F(5,4)**3==F(625,4)
 xs=[1,2,3,4];ys=[12,16,18,22];a=F((18+22)-(12+16),4);b=F(12+16,2)-a*F(3,2)
 assert a==3 and b==F(19,2) and (a*6+b)*100==2750
 cov=json.loads((R/'donnees/couverture-programme.json').read_text())
 assert len(cov['cohorts'])==3 and len(cov['skills'])==26
 for s in cov['skills']:
  assert s['templates'] and (R/s['course']).is_file() and (R/s['exercises']).is_file()
  assert (s['id'].startswith('t-'))==(s['level']=='terminale')
 assert set(cov['sources'])=={'premiere2026','terminale2019','terminale2027','epreuve2028'}
 # Initial HTML/JSON questions use explicit domains too; variants alone are insufficient.
 checked_initial=0
 for path in sorted((R/'exercices').glob('*.html')):
  raw=path.read_text()
  embedded=re.search(r'<script type="application/json" id="exercise-data">([\s\S]*?)</script>',raw)
  if not embedded:continue
  for index,q in enumerate(json.loads(embedded[1])['exercises']):
   st=unescape(re.sub('<[^>]*>',' ',q['statement'])).replace('\u2212','-')
   domain=re.search(r'(?:sur|\u2208)\s*\[\s*(-?\d+)\s*;\s*(-?\d+)\s*\]',st,re.I)
   if not domain:continue
   low,high=map(int,domain.groups());assert low<=high
   for field in q['fields']:
    label=unescape(field['label']).replace('\u2212','-')
    coordinate=re.search(r'(?:\b[fgphqRCB](?:\u2032|\')?\(\s*|\bx\s*=\s*)(-?\d+(?:[.,]\d+)?)',label)
    if coordinate:
     x=F(coordinate[1].replace(',','.'));assert low<=x<=high,(path,index,label,low,high);checked_initial+=1
    if any(word in label.lower() for word in ['optim','racine','z\u00e9ro']):
     assert low<=F(field['answer'])<=high,(path,index,label);checked_initial+=1
 assert checked_initial>=15,checked_initial
 # Handwritten function graph [0;4], affine sign [0;6], positive-speed inverse.
 raw=(R/'exercices/fonctions.html').read_text()
 for marker,low,high in [('exercice-3',0,4),('exercice-7',0,6),('exercice-8',1,10000)]:
  block=raw.split('id="'+marker+'"',1)[1].split('</article>',1)[0]
  for x in re.findall(r'<span>[gpt]\((-?\d+)\)',block):assert low<=int(x)<=high

 # Execute new algorithmic situations separately and check exact independent results.
 content=Content((R/'terminale/cours/t-outils.html').read_text());ns={}
 for code in content.pre:exec(compile(code,'t-outils','exec'),ns)
 assert ns['point_intermediaire'](0,100,2,144)==(1,120)
 for args in [(0,0,1,1),(0,1,0,2)]:
  try:ns['point_intermediaire'](*args)
  except ValueError:pass
  else:raise AssertionError('invalid domain accepted')
 points=[(1,12),(2,16),(3,18),(4,22)]
 assert [ns['ecart_carre'](points,a,b) for a,b in [(3,9),(3,9.5),(4,7)]]==[2,1,4]
 assert ns['meilleur_ajustement'](points,[(3,9),(3,9.5),(4,7)])==(3,9.5)
 assert '2, 1 et 4' in ' '.join(content.text)
 for name in ['recette-cloture.md','audit-et-arbitrages.md','validation-humaine.md']:
  assert (R/'docs'/name).is_file()
 print('CLOTURE OK: exact paper answers, domains, scores, 3 cohorts, 26 skill routes, algorithmic examples and delivery documents.')
if __name__=='__main__':main()
