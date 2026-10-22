"""Idempotent HTML integration, with no changes to mathematical statements."""
from pathlib import Path
from html import escape,unescape
import re,json,subprocess
ROOT=Path(__file__).resolve().parents[1];V='20261022-evolution1';origin='https://mathstmgdls.pages.dev'
# Deliberately targeted curricular wording, without changing mathematical examples.
replacements={
 'Atelier facultatif :':'Atelier num\u00e9rique :',
 'Atelier num\u00e9rique facultatif':'Atelier num\u00e9rique transversal',
 'atelier num\u00e9rique facultatif':'atelier num\u00e9rique transversal',
 'ATELIER FACULTATIF / ALGORITHMIQUE':'ATELIER TRANSVERSAL / ALGORITHMIQUE',
 'Un approfondissement facultatif':'Une pratique transversale du programme',
 '\u00c0 consulter uniquement pour approfondir la programmation et le tableur. Le parcours principal de r\u00e9vision privil\u00e9gie les m\u00e9thodes sans calculatrice.':'Python et le tableur font partie de la formation. Consulte ces outils au fil des chapitres et travaille aussi la lecture d\u2019algorithmes sur feuille. La r\u00e9vision sans calculatrice reste distincte.',
 'exercices facultatifs':'exercices num\u00e9riques',
 '8 exercices de programmation facultatifs':'8 exercices de programmation transversaux',
 'programmation facultative':'programmation transversale',
 'Les exemples ne sont donc pas regroup\u00e9s uniquement dans un chapitre informatique :':'Les programmes sont regroup\u00e9s dans un atelier pour faciliter leur consultation, mais leur usage doit accompagner les notions :',
}
for rel in ['cours/python-tableur.html','programme.html','lecons.html','exercices.html','exercices/python-tableur.html']:
 p=ROOT/rel;s=p.read_text()
 for a,b in replacements.items():s=s.replace(a,b)
 s=s.replace('Les programmes Python et les formules de tableur sont regroup\u00e9s ici, \u00e0 part du parcours de r\u00e9vision sans calculatrice. Ils restent disponibles pour les activit\u00e9s d\u2019algorithmique en classe ou pour les \u00e9l\u00e8ves int\u00e9ress\u00e9s.','Python et le tableur font partie du programme. Cet atelier rassemble les outils \u00e0 mobiliser au fil des chapitres ; la lecture et l\u2019explication des algorithmes se travaillent aussi sur feuille.')
 p.write_text(s)
# Record the changed pedagogical requirement in its test rather than preserving the ambiguous wording.
p=ROOT/'tests/validate_site.py';s=p.read_text().replace('8 exercices de programmation facultatifs','8 exercices de programmation transversaux');p.write_text(s)
# Header, footer and metadata are generated for every page without touching lesson bodies.
for p in sorted(ROOT.rglob('*.html')):
 if any(x.startswith('.') for x in p.relative_to(ROOT).parts) or p.name=='404.html':continue
 s=p.read_text();rel=p.relative_to(ROOT).as_posix();base='../'*(len(p.relative_to(ROOT).parts)-1)
 if 'assets/evolution.css' not in s:s=s.replace('</head>',f'<link rel="stylesheet" href="{base}assets/evolution.css?v={V}"></head>',1)
 nav=re.search(r'<nav class="main-nav"[^>]*>(.*?)</nav>',s,re.S)
 if nav and '>Progresser</a>' not in nav[0]:
  s=s[:nav.end()-6]+f'<a href="{base}progresser.html">Progresser</a>'+s[nav.end()-6:]
 if rel.startswith('terminale/'):
  s=s.replace(f'href="{base}sujets.html"',f'href="{base}sujets.html?niveau=terminale"')
 if 'class="footer-links"' not in s:
  s=s.replace('</footer></body>',f'<div class="container footer-links"><a href="{base}mes-progres.html">Mes progr\u00e8s</a> \u00b7 <a href="{base}a-propos.html">\u00c0 propos et donn\u00e9es</a> \u00b7 <a href="{base}accessibilite.html">Accessibilit\u00e9</a></div></footer></body>') if '</footer></body>' in s else s.replace('</footer>',f'<div class="container footer-links"><a href="{base}mes-progres.html">Mes progr\u00e8s</a> \u00b7 <a href="{base}a-propos.html">\u00c0 propos et donn\u00e9es</a> \u00b7 <a href="{base}accessibilite.html">Accessibilit\u00e9</a></div></footer>')
 canonical=origin+('/' if rel=='index.html' else '/'+rel.removesuffix('.html'))
 if 'rel="canonical"' not in s:s=s.replace('</head>',f'<link rel="canonical" href="{canonical}"></head>',1)
 if 'name="description"' not in s:
  h=re.sub('<[^>]+>','',re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S)[1]);s=s.replace('</head>',f'<meta name="description" content="{escape(h,quote=True)} : exercices, m\u00e9thodes et corrections en math\u00e9matiques STMG."></head>',1)
 title=unescape(re.search(r'<title>(.*?)</title>',s,re.S)[1]);desc=re.search(r'<meta name="description" content="([^"]*)"',s)
 if 'property="og:title"' not in s:
  tags=f'<meta property="og:type" content="website"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:description" content="{desc[1] if desc else "Maths STMG"}">'
  s=s.replace('</head>',tags+'</head>',1)
 if rel.startswith(('cours/','exercices/','terminale/cours/','terminale/exercices/')) or rel=='annexes/calcul-rapide.html':
  if 'assets/acquis.js' not in s:s=s.replace('</head>',f'<script src="{base}assets/acquis.js?v={V}" defer></script><script src="{base}assets/suivi-exercices.js?v={V}" defer></script></head>',1)
 s=s.replace('interface.css?v=20261021-sujets1','interface.css?v='+V)
 p.write_text(s)
# First screen: explicit levels and a small way into the new resources.
p=ROOT/'index.html';s=p.read_text();anchor='<p class="hero-note">'
idx=s.find(anchor)
if idx>=0 and 'level-home' not in s:
 end=s.find('</p>',idx)+4
 s=s[:end]+'''<nav class="level-switch level-home" aria-label="Choisir mon niveau"><a href="lecons.html">Premi\u00e8re STMG</a><a href="terminale/lecons.html">Terminale STMG</a></nav>'''+s[end:]
s=s if 'evo-home-entry' in s else s.replace('</main>','''<section class="rapid-entry evo-home-entry"><h2>Choisir ma prochaine \u00e9tape</h2><p>Faire le point, reprendre une difficult\u00e9 ou r\u00e9diger un sujet blanc. Tout reste accessible sans compte.</p><p class="action-row"><a class="button button-primary" href="progresser.html">Mon parcours de travail</a><a href="preparer-bac.html">Pr\u00e9parer l\u2019\u00e9preuve de Premi\u00e8re</a></p></section></main>''',1);p.write_text(s)

p=ROOT/'annexes/calcul-rapide.html';s=p.read_text();s=s.replace('Aucun r\u00e9sultat n\u2019est enregistr\u00e9 apr\u00e8s rechargement.','Sans suivi local activ\u00e9, aucun r\u00e9sultat n\u2019est conserv\u00e9 apr\u00e8s rechargement. Les r\u00e9ponses saisies ne sont jamais sauvegard\u00e9es.');p.write_text(s)
