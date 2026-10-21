"""Independent rational arithmetic and static checks for the quick-calculation annex."""
from fractions import Fraction
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import math
import subprocess

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.h1=0; self.main=0; self.lang=None
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag=='html':self.lang=attrs.get('lang')
        if tag=='h1':self.h1+=1
        if tag=='main':self.main+=1
        for key in ['href','src']:
            if key in attrs:self.links.append(attrs[key])

def reference(tokens):
    stack=[]
    for t in tokens:
        if isinstance(t,int):
            stack.append(Fraction(t)); continue
        if t=='sqrt':
            x=stack.pop(); assert x>=0
            n,d=math.isqrt(x.numerator),math.isqrt(x.denominator)
            assert n*n==x.numerator and d*d==x.denominator
            stack.append(Fraction(n,d)); continue
        b=stack.pop(); a=stack.pop()
        if t=='+':result=a+b
        elif t=='-':result=a-b
        elif t=='*':result=a*b
        elif t=='/':result=a/b
        elif t=='pow':
            assert b.denominator==1
            result=a**b.numerator
        elif t=='choose':
            assert a.denominator==b.denominator==1
            result=Fraction(math.comb(a.numerator,b.numerator))
        else:raise AssertionError(t)
        stack.append(result)
    assert len(stack)==1
    return stack[0]

def main():
    samples=json.loads(subprocess.check_output(['node','tests/test_calcul_rapide.js','--export'],cwd=ROOT,text=True,encoding='utf-8'))
    assert len(samples)==54*160
    for q in samples:
        value=Fraction(q['expected'])
        assert value==reference(q['ref']), (q['id'],q['prompt'],q['expected'])
        if q['id'] in ['p-conditionnelle','p-contraire','p-arbre','t-binomiale']:
            assert 0<=value<=1
        if q['id']=='t-derivee-inverse':assert value<0
        if q['id']=='p-successives':assert value<0
        assert q['level'] in ['bases','premiere','terminale']
        assert (ROOT/(q['course']+'.html')).is_file()
    pages={p.resolve():Page(p.read_text(encoding='utf-8')) for p in ROOT.rglob('*.html') if '.git' not in p.parts}
    targets=['annexes/calcul-rapide.html','index.html','lecons.html','exercices.html','terminale/lecons.html','terminale/exercices.html']
    links=0
    for name in targets:
        path=(ROOT/name).resolve();page=pages[path]
        assert page.lang=='fr' and page.h1==page.main==1,name
        assert len(page.ids)==len(set(page.ids)),name
        for link in page.links:
            u=urlsplit(link)
            if u.scheme or u.netloc:continue
            assert not u.path.startswith('/'),(name,link)
            dest=(path.parent/unquote(u.path)).resolve() if u.path else path
            assert dest.is_relative_to(ROOT) and dest.is_file(),(name,link)
            if u.fragment:assert unquote(u.fragment) in pages[dest].ids,(name,link)
            links+=1
        if name!='annexes/calcul-rapide.html':
            assert sum('annexes/calcul-rapide.html' in link for link in page.links)>=2,name
            assert 'annexe-calcul-rapide' in page.ids
    html=(ROOT/'annexes/calcul-rapide.html').read_text(encoding='utf-8')
    for required in ['MENE2622640N','2026–2027','2028','réponses courtes','sans calculatrice','rapid-print-answers','rapid-paper-solutions','series' if False else 'serie-papier']:
        assert required in html,required
    assert html.count('<details>')==15
    for file in ['assets/calcul-rapide.js','assets/calcul-rapide-data.js']:
        subprocess.run(['node','--check',file],cwd=ROOT,check=True)
    print(f'CALCUL RAPIDE INDEPENDANT OK: {len(samples)} recalculs rationnels; {links} liens; 5 entrees; serie papier et methodes sans JavaScript.')

if __name__=='__main__':main()
