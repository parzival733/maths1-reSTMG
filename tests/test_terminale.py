"""Terminale structure and independent numerical regression tests.
Run: python3 tests/test_terminale.py (Python standard library and Node only).
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import math
import re
import subprocess
from validate_site import Page, load_functions

ROOT = Path(__file__).resolve().parent.parent
SLUGS = ['t-suites','t-exponentielles','t-logarithme','t-inverse',
         't-statistiques','t-conditionnelles','t-binomiale','t-variables','t-outils']


def check_structure():
    paths = sorted((ROOT / 'terminale').rglob('*.html'))
    assert len(paths) == 21, len(paths)
    all_pages = {p.resolve(): Page(p.read_text(encoding='utf-8'))
                 for p in ROOT.rglob('*.html') if '.git' not in p.parts}
    checked = 0
    for path in paths:
        page = all_pages[path.resolve()]
        assert page.lang == 'fr' and page.tags['h1'] == 1, path
        assert page.tags['main'] == 1 and 'contenu' in page.ids, path
        assert len(page.ids) == len(set(page.ids)), path
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            assert not url.path.startswith('/'), (path, link)
            target = (path.parent / unquote(url.path)).resolve() if url.path else path.resolve()
            assert target.is_relative_to(ROOT) and target.is_file(), (path, link)
            if url.fragment and target.suffix == '.html':
                assert unquote(url.fragment) in all_pages[target].ids, (path, link)
            checked += 1
    for name in ['lecons','exercices']:
        first = all_pages[(ROOT / (name + '.html')).resolve()]
        terminal = all_pages[(ROOT / 'terminale' / (name + '.html')).resolve()]
        assert first.classes['lesson-card'] == 16, name
        assert terminal.classes['lesson-card'] == 9, name
        assert 'terminale/' + name + '.html' in first.links
        assert '../' + name + '.html' in terminal.links
        assert first.classes['level-switch'] == 1
        assert terminal.classes['level-switch'] == 1
    for slug in SLUGS:
        lesson_path = ROOT / 'terminale' / 'cours' / (slug + '.html')
        exercise_path = ROOT / 'terminale' / 'exercices' / (slug + '.html')
        lesson = all_pages[lesson_path.resolve()]
        exercise = all_pages[exercise_path.resolve()]
        for cls in ['lesson-content','lesson-immersive','learning-path','lesson-reading-controls',
                    'support-scaffold','study-review','course-pagination']:
            assert lesson.classes[cls] == 1, (slug,cls)
        assert lesson.classes['study-quiz'] == lesson.classes['study-solution'] == 2, slug
        assert lesson.classes['check'] >= 1 and lesson.tags['h2'] >= 6, slug
        assert len(re.findall(r'\w+', ' '.join(lesson.text))) >= 550, slug
        assert '../exercices/' + slug + '.html' in lesson.links
        assert '../cours/' + slug + '.html' in exercise.links
        assert '../programme.html' in lesson.links
        for i, block in enumerate(lesson.pre_blocks):
            compile(block, str(lesson_path) + ':' + str(i), 'exec')
        text = exercise_path.read_text(encoding='utf-8')
        assert 'data-terminale-chapter="' + slug + '"' in text
        scripts = ['exercices-variants.js','terminale-exercices.js','exercices-renderer.js','exercices.js']
        positions = [text.index('../../assets/' + script) for script in scripts]
        assert positions == sorted(positions), slug
        assert 'exercise-data' in exercise.ids and 'exercise-mounted' in exercise.ids
        assert exercise.tags['noscript'] == 1
    namespace = load_functions(all_pages[(ROOT / 'terminale/cours/t-outils.html').resolve()])
    assert namespace['somme_carres'](4) == 30
    assert namespace['somme_carres'](0) == 0
    assert namespace['somme_geometrique'](100,.5,4) == 187.5
    assert namespace['somme_geometrique'](3,1,4) == 12
    assert namespace['pascal'](4) == [1,4,6,4,1]
    assert namespace['distribution_binomiale'](3,0,10) == [10,0,0,0]
    assert namespace['distribution_binomiale'](3,1,10) == [0,0,0,10]
    assert sum(namespace['distribution_binomiale'](5,.3,100)) == 100
    print(f'TERMINALE STRUCTURE OK: 21 pages, 18 quizzes, {checked} links and Python examples.')


def expected(slug,i,c):
    if slug=='t-suites':
        a=2+c; r=2+c%4; q=2+c%2
        if i==0:return [sum([a,a+2*r])/2,r]
        if i==1:return [math.sqrt(a*a*q*q),q]
        if i==2:
            a=20+5*c; r=2+c%4; n=5+c%4; values=[a+j*r for j in range(n+1)];return [values[-1],len(values),sum(values)]
        if i==3:
            n=3+c%4;values=[(2+c)*2**j for j in range(n)];return [values[-1],sum(values)]
        if i==4:
            n=3+c%6;return [n*n,sum(k*k for k in range(1,n+1))]
        d=100+10*c;q=1.02+.01*(c%3);n=3+c%3;return [n*d,sum(d*q**j for j in range(n))]
    if slug=='t-exponentielles':
        if i==0:
            k=3+c;a=2+c%2;x=2+c%3;return [k*math.prod([a]*x),k/a]
        if i==1:
            a=2+c%2;m=2+c%3;n=1+c%2;return [a**m*a**n,a**m/a**n]
        if i==2:
            k=(-1 if c%2 else 1)*(2+c);a=1 if c%6==0 else (.5 if c%3==0 else 2);return [k,'constante' if a==1 else ('croissante' if k*a>k else 'd\u00e9croissante')]
        if i==3:
            q=(11+c%4)/10;v=round(1000*q*q);r=(v/1000)**.5;return [r,100*(r-1)]
        if i==4:
            g=(100+5+c)*(100-2-c%5)/10000;return [100*(g-1),100*(g**.5-1)]
        return [1,(4+c)*(2+c%2)]
    if slug=='t-logarithme':
        if i==0:return [1+c%5,-1-c%3]
        if i==1:
            a=(2+c)/10;b=(1+c%4)/10;return [math.log10(10**a*10**b),math.log10(10**a/10**b)]
        if i==2:return [3+c%4,4+c%4]
        if i==3:return [2+c%5,3+c%5]
        if i==4:return [2+c%6,math.log10(2+c%6)]
        n=3*10**(2+c%4)+c;return [len(str(n))-1,len(str(n))]
    if slug=='t-inverse':
        if i==0:return [1/(2+c%8),-1/(2+c%8)]
        if i==1:
            k=(2+c%4)**2;a=2+c%3;return [a+k/a,1-k/a**2]
        if i==2:return [0,2+c]
        if i==3:
            m=2+c%6;b=5+c;return [m,m+m*m/m+b]
        if i==4:
            a=2+c%3;k=a*a*(1+c%4);m=-k/a**2;return [m,k/a-m*a]
        a=1+c%3;b=2+c%4;k=3+c;x=1+c%2;return [a*x**3+b*x*x-2*x+k/x,3*a*x*x+2*b*x-2-k/x**2]
    if slug=='t-statistiques':
        if i==0:
            a=2+c%3;b=5+c;s=c%4;x=[1+s,2+s,3+s,4+s];y=[a*v+b+e for v,e in zip(x,[1,-1,-1,1])];return [sum(x)/4,sum(y)/4]
        if i==1:return [2+c%4,3+c]
        if i==2:
            x=12 if c%2 else 5;return [(2+c%5)*x+10+c,'extrapolation' if x>10 else 'interpolation']
        if i==3:
            x=2+c%3;return [x*x,(2+c%4)*x*x+3+c]
        if i==4:
            a=(1+c%3)/10;b=1+c%2;x=2+c%3;return [10**b*(10**a)**x,10**a]
        a=2+c%3;b=3+c;e=1+c%3;y=[a+b+e,2*a+b-2*e,3*a+b+e];return [sum((v-(a*x+b))**2 for x,v in enumerate(y,1)),sum((v-(a*x+b+e))**2 for x,v in enumerate(y,1))]
    if slug=='t-conditionnelles':
        if i==0:return [(10+c)/(40+c),(30+c)/(100+5*c)]
        if i==1:
            a=(2+c%5)/10;return [a*.1,a*.1+(1-a)*.2]
        if i==2:
            a=(1+c%3)/10;d=.8-a;return [d,a*.1+.2*.2+d*.3]
        if i==3:
            a=(2+c%5)/10;t=a*.8+(1-a)*.1;return [t,a*.8/t]
        if i==4:return [((2+c%5)/10)*.4,'oui' if c%2==0 else 'non']
        d=(1+c%3)/100;t=d*.9+(1-d)*.1;return [t,d*.9/t]
    if slug=='t-binomiale':
        if i==0:
            n=4+c%7;p=(1+c%4)/10;return [n,p,sum(k*math.comb(n,k)*p**k*(1-p)**(n-k) for k in range(n+1))]
        if i==1:
            n=5+c%6;k=2+c%3;return [math.comb(n,k),sum(math.comb(n,j) for j in range(n+1))]
        if i==2:n=3+c%5;p=(2+c%4)/10;klist=[0,n]
        elif i==3:n=4+c%5;p=(2+c%3)/10;klist=[1,n-1]
        elif i==4:n=5+c%4;p=(2+c%3)/10;k=2+c%2
        else:n=4+c%5;p=(2+c%3)/10;k=2
        probabilities=[math.comb(n,k)*p**k*(1-p)**(n-k) for k in range(n+1)]
        assert abs(sum(probabilities)-1)<1e-12
        if i<4:return [probabilities[k] for k in klist]
        if i==4:return [probabilities[k],sum(probabilities[1:])]
        return [sum(probabilities[:k+1]),sum(probabilities[k:])]
    if slug=='t-variables':
        if i==0:
            a=2+c;return [-a*.2+2*a*.3,.8]
        if i==1:
            v=10+c;cost=2+c%3;p=(2+c%2)/10;return [v-cost,(v-cost)*p-cost*(1-p)]
        if i==2:
            p=(2+c%3)/10;r=1-p-.3;return [r,.6+5*r]
        if i==3:return [(5+c%6)*.3,.3]
        if i==4:
            k=4+c%8;return [80,sum([k,k+1,k-1,k+2])/80]
        counts=[2+c,3+c,4+c,1+c];return [sum(counts),sum(k*v for k,v in enumerate(counts))/sum(counts),1.2]
    if slug=='t-outils':
        if i==0:
            n=3+c%7;return [n,sum(j*j for j in range(1,n+1))]
        if i==1:
            u=2+c;s=0
            for _ in range(3+c%4):s+=u;u*=2
            return [s,u]
        if i==2:
            row=[1]
            for _ in range(4+c%4):row=[1]+[a+b for a,b in zip(row,row[1:])]+[1]
            return [row[1],row[2]]
        if i==3:return ['=B2*$E$1',(100+10*c)*1.1]
        if i==4:
            values=[x for x in range(c,c+6) if x>c+1 and x%2==0];return [len(values),sum(values)]
        p=(2+c%4)/10;count=sum(x<p for x in [.1,.2,.4,.5,.7,.9]);return [count,count/6]
    raise AssertionError(slug)


def check_numbers():
    result = subprocess.run(['node', str(ROOT / 'tests/test_terminale.js'), '--json'],
                            check=True, capture_output=True, text=True, timeout=60)
    cases = json.loads(result.stdout)
    assert len(cases) == 2592
    for case in cases:
        answers=expected(case['slug'],case['index'],case['c'])
        assert len(answers)==len(case['answers']),case
        for actual,expect in zip(case['answers'],answers):
            if isinstance(expect,str):assert actual==expect,(case,expect)
            else:assert math.isclose(float(actual),expect,rel_tol=1e-10,abs_tol=1e-10),(case,expect)
    print(f'TERMINALE NUMERICAL OK: {len(cases)} variants independently recomputed in Python; 54 models.')


if __name__ == '__main__':
    check_structure()
    check_numbers()
