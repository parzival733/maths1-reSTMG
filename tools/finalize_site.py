"""Idempotent metadata and navigation finalizer for the static site.
Run after generating any catalogue. No runtime dependency.
"""
from pathlib import Path
from html import escape,unescape
import re
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://mathstmgdls.pages.dev'
VERSION='20261023-simple1'
ASSET_VERSION='20261106-refonte1'
# Toutes les feuilles de style partagent une version, changée à chaque refonte visuelle.
STYLE_VERSION='20261106-refonte1'
ASSET_NAMES='|'.join(re.escape(n) for n in ['exercices-variants.js','exercices-renderer.js','exercices.js','fonctions-coaching.js','terminale-exercices.js','calcul-rapide-data.js','calcul-rapide.js','parcours-data.js','parcours.js','exercices.css','compte-rebours.js','cours.js','cours.css','interface.js','graphiques-interactifs.js','graphiques-interactifs.css','examen.js','calcul-rapide.css','typographie.js','accueil.js','menu.js']+[f'variants-{n}.js' for n in ['fonctions','suites','analyse','probabilites','reperes','donnees']]+[f'coaching-{n}.js' for n in ['general','algebre','suites','analyse','probabilites','reperes','donnees']])
from navigation_simple import apply as simplify_navigation, ALIASES
from lecons import apply as apply_lessons
from typographie import apply as apply_typography
from liens_accessibles import apply as apply_link_names
from refonte_gabarits import apply as apply_refonte
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
    apply_lessons(ROOT)
    urls=[]
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') or p == 'docs' for p in path.relative_to(ROOT).parts):continue
        if path.name=='404.html':
            # Page d'erreur : seulement les jetons et la version des feuilles de style.
            page=path.read_text()
            if 'assets/tokens.css' not in page:
                page=re.sub(r'(<link rel="stylesheet" href=")', lambda m: '<link rel="stylesheet" href="/assets/tokens.css">\n'+m.group(1), page, count=1)
            path.write_text(re.sub(r'(assets/[\w-]+\.css)(?:\?v=[^"\s]*)?(?=")',r'\g<1>?v='+STYLE_VERSION,page))
            continue
        text=path.read_text();rel=path.relative_to(ROOT).as_posix();base='../'*(len(path.relative_to(ROOT).parts)-1)
        target=ALIASES.get(rel,rel)
        canonical=ORIGIN+('/' if target=='index.html' else '/'+target.removesuffix('.html'))
        nav=re.search(r'<nav class="main-nav"[^>]*>(.*?)</nav>',text,re.S)
        if 'assets/evolution.css' not in text:text=text.replace('</head>',f'<link rel="stylesheet" href="{base}assets/evolution.css?v={VERSION}"></head>',1)
        # En-tête mobile : bouton « Menu » après la navigation, script dédié et règle sans JavaScript.
        if 'class="main-nav"' in text and 'class="menu-toggle"' not in text:
            text=re.sub(r'(<nav class="main-nav")([^>]*>[\s\S]*?</nav>)', r'\1 id="navigation-principale"\2<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation-principale">Menu</button>', text, count=1)
        if 'class="menu-toggle"' in text:
            text=re.sub(r'<nav class="main-nav"(?![^>]*\bid=)', '<nav class="main-nav" id="navigation-principale"', text, count=1)
        # menu.js est chargé tôt, sans defer : il marque la page avant le premier affichage
        # (pas de décalage) ; sans JavaScript, la navigation complète reste visible.
        text=re.sub(r'<noscript><style data-menu-noscript>[\s\S]*?</noscript>','',text)
        text=re.sub(r'<script src="[^"]*assets/menu\.js[^"]*"( defer)?></script>\n?','',text)
        if 'class="menu-toggle"' in text:
            text=text.replace('</title>',f'</title><script src="{base}assets/menu.js"></script>',1)
        # Typographie française du texte produit par JavaScript (tools/typographie.py pour le HTML).
        if 'assets/typographie.js' not in text:text=text.replace('</head>',f'<script src="{base}assets/typographie.js" defer></script></head>',1)
        text=re.sub(r'(assets/(?:interface|evolution)\.css\?v=)[^"\s]+',r'\g<1>'+VERSION,text)
        text=re.sub(r'(assets/(?:acquis|progres)\.js\?v=)[^"\s]+',r'\g<1>'+VERSION,text)
        # Moteur de variantes, générateurs, aides et banques : une version commune,
        # ajoutée si besoin, pour qu'aucun navigateur ne mélange ancien et nouveau code.
        text=keep_own_generator(rel,text)
        text=re.sub(r'(assets/(?:'+ASSET_NAMES+r'))(?:\?v=[^"\s]*)?(?=")',r'\g<1>?v='+ASSET_VERSION,text)
        # Polices du site préchargées : prêtes avant le premier affichage, le texte ne se décale pas.
        text=re.sub(r'<link rel="preload" href="[^"]*assets/fonts/[^"]*"[^>]*>\n?','',text)
        fonts=''.join(f'<link rel="preload" href="{base}assets/fonts/{name}.woff2" as="font" type="font/woff2" crossorigin>\n' for name in ('stmg-sans-regular','stmg-sans-bold','stmg-serif-semibold','stmg-symboles-latin','stmg-symboles-maths'))
        text=re.sub(r'(<link rel="stylesheet" href=")', lambda m: fonts+m.group(1), text, count=1)
        # Jetons de design chargés avant toute autre feuille de style.
        if 'assets/tokens.css' not in text:
            text=re.sub(r'(<link rel="stylesheet" href=")', lambda m: f'<link rel="stylesheet" href="{base}assets/tokens.css">\n'+m.group(1), text, count=1)
        # Couche de la refonte graphique, chargée après toutes les autres feuilles.
        text=re.sub(r'\s*<link rel="stylesheet" href="[^"]*assets/refonte\.css[^"]*">','',text)
        last=list(re.finditer(r'<link rel="stylesheet" href="[^"]*">',text))
        if last:
            end=last[-1].end(); text=text[:end]+f'\n<link rel="stylesheet" href="{base}assets/refonte.css">'+text[end:]
        text=re.sub(r'(assets/[\w-]+\.css)(?:\?v=[^"\s]*)?(?=")',r'\g<1>?v='+STYLE_VERSION,text)
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
    apply_refonte(ROOT)
    apply_link_names(ROOT)
    apply_typography(ROOT)
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
