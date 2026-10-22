"""Build the static subject catalogue and add navigation; never rewrite teaching content."""
from pathlib import Path
import json, re, html, hashlib
ROOT = Path(__file__).resolve().parents[1]
H = html.escape
NAV_CSS = '''
/* Cinquieme onglet: libelles entiers et navigation utilisable sur petit ecran. */
@media(max-width:520px) {
  .site-header .main-nav { grid-template-columns:.95fr .9fr 1.15fr .85fr 1.5fr; }
  .site-header .main-nav a,.rapid-page .main-nav a,.has-rapid-link .main-nav a { white-space:normal; text-align:center; line-height:1.35; padding-inline:3px; }
}
'''

def card(row):
    kinds={'zero':'Sujet z\u00e9ro officiel','secours':'Sujet de secours','remplacement':'Session de remplacement','sujet':'Sujet d\u2019examen'}
    level='Premi\u00e8re technologique' if row['level']=='premiere' else 'Terminale STMG \u00b7 ancien bac'
    note=''
    if row['year']!=row['archive_year']:
        note=f'<p class="subject-note">\u00c9preuve de {row["year"]}, class\u00e9e dans les archives {row["archive_year"]} de l\u2019APMEP.</p>'
    return f'''<article class="subject-card" id="{row['id']}" data-level="{row['level']}" data-year="{row['year']}" data-kind="{row['kind']}">
<div class="subject-body"><p class="subject-label">{H(kinds[row['kind']])}</p><h3>{H(row['title'])}</h3><p class="subject-date">{H(row['date'])}</p><p class="subject-origin">{H(level)}<br>Source : {H(row['source'])}</p>{note}</div>
<div class="subject-footer"><a href="{H(row['url'],quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{H('Ouvrir le PDF : '+row['title']+', '+row['date']+' \u2014 source '+row['source']+' (nouvel onglet)',quote=True)}">Ouvrir le PDF <span aria-hidden="true">\u2197</span></a><span class="subject-pages">PDF \u00b7 {row['pages']} pages</span></div>
</article>'''

def build():
    data=json.loads((ROOT/'donnees/sujets.json').read_text(encoding='utf-8'))
    assert len(data)==41 and len({r['url'] for r in data})==41
    groups=[('premiere-2026','Premi\u00e8re \u00b7 sujets 2026','Les \u00e9nonc\u00e9s de l\u2019\u00e9preuve anticip\u00e9e de la voie technologique.',[r for r in data if r['level']=='premiere' and r['kind']!='zero']),('sujets-zero','Premi\u00e8re \u00b7 sujets z\u00e9ro','Deux mod\u00e8les officiels, pour d\u00e9couvrir le format de l\u2019\u00e9preuve de 2026.',[r for r in data if r['kind']=='zero'])]
    for y in [2020,2019,2018,2017]:
        groups.append((f'terminale-{y}',f'Terminale STMG \u00b7 {y}','Ancien programme : v\u00e9rifie les notions et les outils autoris\u00e9s dans le sujet.',[r for r in data if r['level']=='terminale' and r['year']==y]))
    sections=[]
    for ident,title,desc,rows in groups:
        sections.append(f'<section class="subjects-group" id="{ident}" aria-labelledby="{ident}-title"><header><h2 id="{ident}-title">{H(title)}</h2><p>{H(desc)}</p></header><div class="subjects-grid">'+ '\n'.join(card(row) for row in rows)+'</div></section>')
    document='''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f7f8fa"><title>Sujets de maths | Premi\u00e8re\u2013Terminale STMG</title><meta name="description" content="41 sujets de math\u00e9matiques en PDF : Premi\u00e8re technologique 2026, sujets z\u00e9ro et anciens sujets de Terminale STMG 2017-2020. Recherche par niveau, ann\u00e9e et centre.">
<link rel="stylesheet" href="assets/styles.css"><link rel="stylesheet" href="assets/cours.css"><link rel="stylesheet" href="assets/interface.css?v=20261021-sujets1"><link rel="stylesheet" href="assets/sujets.css?v=1"><script src="assets/sujets.js?v=1" defer></script></head>
<body class="subjects-page"><a class="skip-link" href="#contenu">Aller au contenu</a>
<header class="site-header"><div class="container header-inner"><a class="brand" href="index.html" aria-label="Maths, accueil"><span class="brand-mark" aria-hidden="true">m<span>.</span></span><span>maths<span class="brand-dot">.</span></span></a><nav class="main-nav" aria-label="Navigation principale"><a href="index.html">Accueil</a><a href="lecons.html">Le\u00e7ons</a><a href="exercices.html">Exercices</a><a href="sujets.html" aria-current="page">Sujets</a><a href="annexes/calcul-rapide.html">Calcul rapide</a></nav></div></header>
<main id="contenu" class="container section-page subjects-main" tabindex="-1" data-subjects>
<nav class="breadcrumb" aria-label="Fil d\u2019Ariane"><a href="index.html">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">Sujets</span></nav>
<header class="page-intro subjects-intro"><p class="eyebrow">PREMI\u00c8RE &amp; TERMINALE STMG</p><h1>Les sujets<span class="title-dot">.</span></h1><p>Une annale, une feuille, et c\u2019est parti. Retrouve les <strong>41 sujets en PDF</strong>, class\u00e9s par niveau et par ann\u00e9e. Les corrig\u00e9s ne sont pas inclus.</p></header>
<form id="subjects-filters" class="subjects-controls" hidden>
<fieldset class="subjects-levels"><legend>Quel niveau ?</legend><label><input type="radio" name="level" value="premiere" checked><span>Premi\u00e8re \u00b7 10</span></label><label><input type="radio" name="level" value="terminale"><span>Terminale \u00b7 31</span></label><label><input type="radio" name="level" value="all"><span>Tout \u00b7 41</span></label></fieldset>
<div class="subjects-filters"><label for="subjects-search">Chercher un sujet<input id="subjects-search" type="search" placeholder="Ex. : M\u00e9tropole, Polyn\u00e9sie, septembre\u2026" maxlength="100" autocomplete="off" aria-controls="subjects-list"></label><label for="subjects-year">Ann\u00e9e<select id="subjects-year" aria-controls="subjects-list"><option value="all">Toutes</option><option>2026</option><option>2020</option><option>2019</option><option>2018</option><option>2017</option></select></label><button class="subjects-reset" type="button" data-reset-subjects>R\u00e9initialiser</button></div>
</form>
<nav id="subjects-static-nav" class="subjects-static-nav" aria-label="Acc\u00e9der aux sujets"><a href="#premiere-2026">Premi\u00e8re 2026</a><a href="#sujets-zero">Sujets z\u00e9ro</a><a href="#terminale-2020">Archives Terminale</a></nav>
<p id="subjects-context" class="subjects-context">Les sujets de Premi\u00e8re et les anciennes annales de Terminale correspondent \u00e0 des \u00e9preuves diff\u00e9rentes. Respecte les consignes de chaque PDF et les attendus de ton ann\u00e9e.</p>
<p id="subjects-count" class="subjects-status" role="status" aria-live="polite" aria-atomic="true">41 sujets disponibles \u00b7 ouverture du PDF dans un nouvel onglet</p>
<noscript><p class="subjects-status">Tous les sujets restent accessibles ci-dessous sans JavaScript. Utilise les liens de section pour te d\u00e9placer.</p></noscript>
<div id="subjects-list">'''+ '\n'.join(sections)+'''</div>
<section id="subjects-empty" class="subjects-empty" hidden><h2>Aucun sujet ne correspond.</h2><p>Essaie un autre centre ou une autre ann\u00e9e.</p><button class="subjects-reset" type="button" data-reset-subjects>Revenir aux sujets de Premi\u00e8re</button></section>
<details class="ui-disclosure"><summary>Sources, t\u00e9l\u00e9chargement et rep\u00e8res de programme</summary>
<p>Chaque bouton ouvre directement le PDF chez sa source, dans un nouvel onglet. Tu peux ensuite le t\u00e9l\u00e9charger ou l\u2019imprimer avec les commandes du lecteur PDF. Aucune copie n\u2019est r\u00e9h\u00e9berg\u00e9e ici ; la source est indiqu\u00e9e sur chaque fiche.</p>
<p><strong>Premi\u00e8re :</strong> les huit sujets et les deux sujets z\u00e9ro sont li\u00e9s \u00e0 l\u2019\u00e9preuve de 2026. Ils ne constituent pas des sujets officiels pour 2027 ni une garantie de conformit\u00e9 au programme actuel. <a href="programme.html">Voir les rep\u00e8res de Premi\u00e8re</a>.</p>
<p><strong>Terminale :</strong> les 31 sujets de 2017 \u00e0 2020 rel\u00e8vent de l\u2019ancien bac STMG. Leurs consignes peuvent autoriser une calculatrice. Ces archives ne doivent pas \u00eatre confondues avec l\u2019\u00e9preuve anticip\u00e9e de Premi\u00e8re. <a href="terminale/programme.html">Voir les rep\u00e8res de Terminale</a>.</p>
<p>Remerciements \u00e0 l\u2019\u00c9ducation nationale, \u00c9duscol et aux b\u00e9n\u00e9voles de l\u2019APMEP pour la mise \u00e0 disposition de ces ressources. Le sujet M\u00e9tropole de septembre 2026 est accessible via Sujetdebac.fr. Les liens externes d\u00e9pendent de leurs \u00e9diteurs ; les PDF ne sont charg\u00e9s qu\u2019apr\u00e8s ton clic.</p>
<p><a href="https://www.apmep.fr/Epreuve-anticipee-2026" target="_blank" rel="noopener noreferrer">Archives APMEP de Premi\u00e8re (nouvel onglet)</a> \u00b7 <a href="https://www.apmep.fr/Mentions-legales" target="_blank" rel="noopener noreferrer">Conditions APMEP (nouvel onglet)</a></p>
</details>
<p class="subjects-back">Envie de travailler une notion avant le sujet ? <a href="lecons.html">Revoir une le\u00e7on</a> ou <a href="annexes/calcul-rapide.html">faire une s\u00e9rie de calcul rapide</a>.</p>
</main><footer class="site-footer"><div class="container footer-inner"><p><strong>maths.</strong> Comprendre, puis pratiquer.</p><p>Math\u00e9matiques \u00b7 Premi\u00e8re\u2013Terminale STMG</p></div></footer></body></html>
'''
    (ROOT/'sujets.html').write_text(document,encoding='utf-8')
    paths=[p for p in ROOT.rglob('*.html') if not any(part.startswith('.') for part in p.relative_to(ROOT).parts)]
    for path in paths:
        if path.name=='404.html':continue
        text=path.read_text(encoding='utf-8')
        prefix='../'*len(path.relative_to(ROOT).parts[:-1])
        def add_nav(m):
            nav=m.group()
            if re.search(r'>Sujets</a>',nav):return nav
            # Insert before Calcul rapide, consistently on every page.
            new=f'<a href="{prefix}sujets.html">Sujets</a>'
            nav,n=re.subn(r'(?=<a\b[^>]*>Calcul rapide</a>)',lambda _:new,nav,count=1)
            assert n==1,('missing common navigation',path)
            return nav
        text,n=re.subn(r'<nav\b[^>]*class="main-nav"[^>]*>[\s\S]*?</nav>',add_nav,text,count=1)
        assert n==1,('missing nav',path)
        text=re.sub(r'(assets/interface\.css\?v=)[^"\s]+',r'\g<1>20261021-sujets1',text)
        path.write_text(text,encoding='utf-8')
    p=ROOT/'assets/interface.css'
    s=p.read_text(encoding='utf-8')
    if 'Cinquieme onglet:' not in s:p.write_text(s+NAV_CSS,encoding='utf-8')
    p=ROOT/'tests/test_interface.py'
    s=p.read_text(encoding='utf-8').replace("expect(page.locator('.main-nav a')).to_have_count(4)","expect(page.locator('.main-nav a')).to_have_count(5)")
    p.write_text(s,encoding='utf-8')
    p=ROOT/'README.md';s=p.read_text(encoding='utf-8')
    if '## Sujets et annales' not in s:
        s+='''\n\n## Sujets et annales\n\n`sujets.html` est le catalogue statique de 41 PDF : 8 sujets de Premi\u00e8re technologique 2026, 2 sujets z\u00e9ro et 31 archives de Terminale STMG (2017\u20132020). L\u2019onglet Sujets est pr\u00e9sent dans la navigation de toutes les pages. Les niveaux, les programmes et les sources sont distingu\u00e9s. Les corrig\u00e9s ne sont pas inclus.\n\nLes PDF s\u2019ouvrent chez leur source dans un nouvel onglet, sans iframe, sans copie r\u00e9h\u00e9berg\u00e9e et sans chargement externe avant le clic. Le lecteur PDF permet le t\u00e9l\u00e9chargement ou l\u2019impression. APMEP est cr\u00e9dit\u00e9e selon ses [conditions de liens](https://www.apmep.fr/Mentions-legales).\n\n`donnees/sujets.json` conserve les m\u00e9tadonn\u00e9es et empreintes des fichiers fournis. L\u2019ann\u00e9e du filtre est celle de l\u2019\u00e9preuve ; le sujet de mars 2019 en Nouvelle-Cal\u00e9donie reste explicitement rattach\u00e9 aux archives APMEP 2018. `tools/build_sujets.py` produit le HTML et ajoute les liens de navigation de fa\u00e7on idempotente. Le site ne n\u00e9cessite pas ce script pour fonctionner.\n\n`assets/sujets.js` ajoute seulement la recherche (sans distinction des accents), le filtre par ann\u00e9e et le choix du niveau. Le parcours par d\u00e9faut est Premi\u00e8re ; les 41 liens restent lisibles sans JavaScript. `?niveau=terminale` ouvre directement les archives de Terminale. Aucune r\u00e9ponse ni donn\u00e9e personnelle n\u2019est stock\u00e9e.\n\nContr\u00f4les : `python3 tests/test_sujets.py` (structure, contenu, mobile, filtres et navigation) et `python3 tests/check_sujets_sources.py` (v\u00e9rification r\u00e9seau explicite des PDF, non n\u00e9cessaire pour servir le site).\n'''
        p.write_text(s,encoding='utf-8')
    print(f'SUJETS BUILD OK: 41 links; navigation on {len(paths)} pages.')

if __name__=='__main__':
    build()
    from finalize_site import main as finalize
    finalize()

# After regenerating the catalogue, run tools/finalize_site.py to restore shared links and metadata.
