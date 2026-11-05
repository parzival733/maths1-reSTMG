"""Idempotent metadata and navigation finalizer for the static site.
Run after generating any catalogue. No runtime dependency.
"""
from pathlib import Path
from html import escape,unescape
import re
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://mathstmgdls.pages.dev'
VERSION='20261023-simple1'
ASSET_VERSION='20261105-variantes1'
ASSET_NAMES='|'.join(re.escape(n) for n in ['exercices-variants.js','exercices-renderer.js','exercices.js','fonctions-coaching.js','terminale-exercices.js','calcul-rapide-data.js','calcul-rapide.js','parcours-data.js','parcours.js','exercices.css','compte-rebours.js','cours.js']+[f'variants-{n}.js' for n in ['fonctions','suites','analyse','probabilites','reperes','donnees']]+[f'coaching-{n}.js' for n in ['general','algebre','suites','analyse','probabilites','reperes','donnees']])
from navigation_simple import apply as simplify_navigation, ALIASES
# Chaque série de Première ne charge que le générateur de son chapitre : les
# autres fichiers alourdiraient la page sans servir.
GENERATOR={'fonctions':'fonctions','second-degre':'fonctions',
  'suites':'suites','suites-arithmetiques':'suites','suites-geometriques':'suites',
  'derivees':'analyse','variations':'analyse','statistiques-deux-variables':'analyse',
  'probabilites-conditionnelles':'probabilites','bernoulli':'probabilites','variables-aleatoires':'probabilites',
  'calcul':'reperes','evolutions':'reperes','logique':'reperes',
  'statistiques-descriptives':'donnees','python-tableur':'donnees'}

def keep_own_generator(rel,text):
    slug=rel.removeprefix('exercices/').removesuffix('.html')
    if not rel.startswith('exercices/') or slug not in GENERATOR:return text
    own=GENERATOR[slug]
    return re.sub(r'[ \t]*<script src="\.\./assets/variants-(\w+)\.js[^"]*" defer></script>\n?',
                  lambda m:m.group(0) if m.group(1)==own else '',text)

def main():
    simplify_navigation(ROOT)
    urls=[]
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') for p in path.relative_to(ROOT).parts):continue
        if path.name=='404.html':continue
        text=path.read_text();rel=path.relative_to(ROOT).as_posix();base='../'*(len(path.relative_to(ROOT).parts)-1)
        target=ALIASES.get(rel,rel)
        canonical=ORIGIN+('/' if target=='index.html' else '/'+target.removesuffix('.html'))
        nav=re.search(r'<nav class="main-nav"[^>]*>(.*?)</nav>',text,re.S)
        if 'assets/evolution.css' not in text:text=text.replace('</head>',f'<link rel="stylesheet" href="{base}assets/evolution.css?v={VERSION}"></head>',1)
        text=re.sub(r'(assets/(?:interface|evolution)\.css\?v=)[^"\s]+',r'\g<1>'+VERSION,text)
        text=re.sub(r'(assets/(?:acquis|progres)\.js\?v=)[^"\s]+',r'\g<1>'+VERSION,text)
        # Moteur de variantes, générateurs, aides et banques : une version commune,
        # ajoutée si besoin, pour qu'aucun navigateur ne mélange ancien et nouveau code.
        text=keep_own_generator(rel,text)
        text=re.sub(r'(assets/(?:'+ASSET_NAMES+r'))(?:\?v=[^"\s]*)?(?=")',r'\g<1>?v='+ASSET_VERSION,text)
        if 'footer-links' not in text and '</footer>' in text:
            text=text.replace('</footer>',f'<div class="container footer-links"><a href="{base}exercices.html#mes-progres">Mes progr\u00e8s</a> \u00b7 <a href="{base}a-propos.html">\u00c0 propos et donn\u00e9es</a> \u00b7 <a href="{base}accessibilite.html">Accessibilit\u00e9</a></div></footer>')
        if '<meta property="og:type"' not in text:
            title=re.search(r'<title>(.*?)</title>',text).group(1)
            description=re.search(r'<meta name="description" content="([^"]*)"',text)
            text=text.replace('</head>',f'<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:url" content="{canonical}"><meta property="og:description" content="{description.group(1) if description else title}"></head>',1)
        text=re.sub(r'<link rel="canonical"[^>]*>','',text)
        text=text.replace('</head>',f'<link rel="canonical" href="{canonical}"></head>',1)
        path.write_text(text)
        if 'name="robots" content="noindex' not in text:urls.append(canonical)
    # Aliases are rendered last so a fresh catalogue build and a simple finalization
    # produce identical output. No redirect or new navigation step is introduced.
    for old,new in ALIASES.items():
        text=(ROOT/new).read_text()
        text=re.sub(r'<meta name="robots"[^>]*>|<link rel="canonical"[^>]*>','',text)
        canonical=ORIGIN+'/'+new.removesuffix('.html')
        text=text.replace('</head>',f'<meta name="robots" content="noindex,follow"><link rel="canonical" href="{canonical}"></head>',1)
        (ROOT/old).write_text(text)
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+escape(u)+'</loc></url>\n' for u in urls)+'</urlset>\n')
    (ROOT/'robots.txt').write_text('User-agent: *\nDisallow: /tests/\nDisallow: /tools/\nDisallow: /.github/\nSitemap: '+ORIGIN+'/sitemap.xml\n')
    print('SEO OK:',len(urls),'canonical URLs indexed.')
if __name__=='__main__':main()
