"""Normalise toutes les pages du site : navigation, en-tête mobile, feuilles de style et
scripts, polices préchargées, métadonnées, URL canoniques, sitemap et robots.txt.
Idempotent ; à relancer après toute modification d'une page ou d'un asset.
"""
from pathlib import Path
from html import escape,unescape
import hashlib
import base64
import re
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://mathstmgdls.pages.dev'
from navigation_simple import apply as simplify_navigation, ALIASES
from lecons import apply as apply_lessons
from figures_lecons import apply as apply_figures
from typographie import apply as apply_typography
from liens_accessibles import apply as apply_link_names
from gabarits import apply as apply_templates
# Chaque série de Première ne charge que le générateur de son chapitre : les
# autres fichiers alourdiraient la page sans servir.
GENERATOR={'fonctions':'fonctions','second-degre':'fonctions',
  'suites':'suites','suites-arithmetiques':'suites','suites-geometriques':'suites',
  'derivees':'analyse','variations':'analyse','statistiques-deux-variables':'analyse',
  'probabilites-conditionnelles':'probabilites','bernoulli':'probabilites','variables-aleatoires':'probabilites',
  'calcul':'reperes','evolutions':'reperes','logique':'reperes',
  'statistiques-descriptives':'donnees','python-tableur':'donnees'}

def asset_version(name,cache={}):
    """Empreinte courte du contenu d'un asset : le cache du navigateur change avec le fichier."""
    if name not in cache:
        cache[name]=hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest()[:10]
    return cache[name]

def with_versions(text):
    return re.sub(r'(assets/([\w-]+\.(?:css|js)))(?:\?v=[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+asset_version(m.group(2)) if (ROOT/'assets'/m.group(2)).is_file() else m.group(0),text)

def template(rel):
    """Gabarit d'une page : il choisit sa feuille de style et l'attribut data-gabarit."""
    if rel=='index.html':return 'accueil'
    if rel.startswith(('cours/','terminale/cours/','troisieme/cours/','seconde/cours/')):return 'lecon'
    if rel.startswith(('exercices/','terminale/exercices/','troisieme/exercices/','seconde/exercices/')):return 'serie'
    if rel in ('lecons.html','exercices.html','terminale/lecons.html','terminale/exercices.html','troisieme/lecons.html','troisieme/exercices.html','seconde/lecons.html','seconde/exercices.html','progresser.html'):return 'catalogue'
    if rel=='annexes/calcul-rapide.html':return 'calcul-rapide'
    if rel in ('sujets.html','preparer-bac.html'):return 'sujets'
    return 'page'

def keep_own_generator(rel,text):
    slug=rel.removeprefix('exercices/').removesuffix('.html')
    if not rel.startswith('exercices/') or slug not in GENERATOR:return text
    own=GENERATOR[slug]
    return re.sub(r'[ \t]*<script src="\.\./assets/variants-(\w+)\.js[^"]*" defer></script>\n?',
                  lambda m:m.group(0) if m.group(1)==own else '',text)


# Séries de Première et de Terminale dont au moins un exercice porte une figure : elles seules
# chargent le moteur (les séries de 3e et de Seconde le reçoivent de leur générateur).
SERIES_ILLUSTREES={'exercices/':{'second-degre','suites','suites-geometriques','derivees','variations','statistiques-deux-variables',
    'probabilites-conditionnelles','bernoulli','variables-aleatoires','statistiques-descriptives'},
  'terminale/exercices/':{'t-exponentielles','t-inverse','t-statistiques','t-conditionnelles','t-binomiale','t-variables'}}

# Parmi elles, celles dont les figures sont des arbres, des diagrammes ou un triangle de Pascal.
SERIES_STATISTIQUES={'statistiques-descriptives','variables-aleatoires','probabilites-conditionnelles','bernoulli','t-conditionnelles','t-binomiale','t-variables'}
# Séries de Terminale dont les figures sont décrites dans assets/terminale-figures.js.
SERIES_TERMINALE_FIGURES={'t-statistiques','t-conditionnelles','t-binomiale','t-variables'}

def series_figures(rel,text):
    """Charge le moteur de figures (et sa partie statistique si la série s'en sert) avant le moteur de variantes sur les séries illustrées ; en Première, le
    rendu passe après les modèles, qui calculent les figures des énoncés initiaux."""
    for prefix,slugs in SERIES_ILLUSTREES.items():
        if not rel.startswith(prefix):continue
        base='../'*rel.count('/')
        text=re.sub(r'[ \t]*<script src="[^"]*assets/(figures|figures-statistiques|terminale-figures)\.js[^"]*" defer></script>\n?','',text)
        slug=rel.removeprefix(prefix).removesuffix('.html')
        if slug in slugs:
            files=['figures.js']+(['figures-statistiques.js'] if slug in SERIES_STATISTIQUES else [])
            text,count=re.subn(r'([ \t]*)(<script src="[^"]*assets/exercices-variants\.js)',
                lambda m:''.join(f'{m.group(1)}<script src="{base}assets/{f}" defer></script>\n' for f in files)+m.group(1)+m.group(2),text,count=1)
            if count!=1:raise ValueError(f'{rel} : moteur de variantes introuvable.')
            if slug in SERIES_TERMINALE_FIGURES:
                text,count=re.subn(r'([ \t]*)(<script src="[^"]*assets/terminale-exercices\.js[^"]*" defer></script>\n?)',
                    lambda m:f'{m.group(1)}{m.group(2)}{m.group(1)}<script src="{base}assets/terminale-figures.js" defer></script>\n',text,count=1)
                if count!=1:raise ValueError(f'{rel} : modèles de Terminale introuvables.')
        renderer=re.search(r'[ \t]*<script src="[^"]*assets/exercices-renderer\.js[^"]*" defer></script>\n?',text)
        runner=re.search(r'<script src="[^"]*assets/exercices\.js',text)
        if prefix=='exercices/' and renderer and runner and renderer.start()<text.find('assets/exercices-variants.js')<runner.start():
            text=text[:renderer.start()]+text[renderer.end():]
            at=re.search(r'<script src="[^"]*assets/exercices\.js',text).start()
            text=text[:at]+renderer.group(0).strip()+text[at:]
    return text


def update_style_policy():
    """Autorise uniquement les blocs CSS statiques exacts du site par leur SHA-256."""
    hashes=set()
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') or p in ('docs', 'public', 'node_modules') for p in path.relative_to(ROOT).parts):continue
        for css in re.findall(r'<style\b[^>]*>([\s\S]*?)</style\s*>',path.read_text(),re.I):
            digest=base64.b64encode(hashlib.sha256(css.encode('utf-8')).digest()).decode('ascii')
            hashes.add("'sha256-"+digest+"'")
    path=ROOT/'_headers'
    text=path.read_text()
    text,count=re.subn(r'(?<![\w-])style-src\s+[^;\n]+',"style-src 'self' "+' '.join(sorted(hashes)),text)
    if count!=1:raise ValueError('La CSP doit contenir une seule directive style-src.')
    if any(len(line)>2000 for line in text.splitlines()):raise ValueError('Une ligne de _headers dépasse la limite de Cloudflare Pages.')
    path.write_text(text)

def main():
    simplify_navigation(ROOT)
    apply_lessons(ROOT)
    apply_figures(ROOT)
    urls=[]
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') or p in ('docs', 'public') for p in path.relative_to(ROOT).parts):continue
        if path.name=='404.html':
            # Page d'erreur : seulement les jetons et la version des feuilles de style.
            page=path.read_text()
            if 'assets/tokens.css' not in page:
                page=re.sub(r'(<link rel="stylesheet" href=")', lambda m: '<link rel="stylesheet" href="/assets/tokens.css">\n'+m.group(1), page, count=1)
            page=re.sub(r'\s*<link rel="(?:icon|apple-touch-icon)"[^>]*>','',page)
            # Servie à n'importe quelle adresse, y compris sur une préversion.
            page=page.replace('</title>','</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"><link rel="apple-touch-icon" href="/apple-touch-icon.png">',1)
            path.write_text(page)
            continue
        text=path.read_text();rel=path.relative_to(ROOT).as_posix();base='../'*(len(path.relative_to(ROOT).parts)-1)
        target=ALIASES.get(rel,rel)
        canonical=ORIGIN+('/' if target=='index.html' else '/'+target.removesuffix('.html'))
        nav=re.search(r'<nav class="main-nav"[^>]*>(.*?)</nav>',text,re.S)
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
        # Signal de défilement des tableaux larges : pages qui contiennent un tableau défilant ou qui en produisent (séries).
        if ('table-scroll' in text or 'table-wrap' in text or template(rel)=='serie') and 'assets/tableaux.js' not in text:
            text=text.replace('</head>',f'<script src="{base}assets/tableaux.js" defer></script></head>',1)
        text=series_figures(rel,keep_own_generator(rel,text))
        if template(rel)=='serie' and 'assets/saisie-nombres.js' not in text:
            text=text.replace('</head>',f'<script src="{base}assets/saisie-nombres.js" defer></script></head>',1)
        # Icônes du site (onglet, favoris, écran d'accueil du téléphone).
        text=re.sub(r'\s*<link rel="(?:icon|apple-touch-icon)"[^>]*>','',text)
        text=text.replace('</title>',f'</title><link rel="icon" href="{base}favicon.svg" type="image/svg+xml"><link rel="icon" href="{base}favicon.ico" sizes="16x16 32x32 48x48"><link rel="apple-touch-icon" href="{base}apple-touch-icon.png">',1)
        # Polices du site préchargées : prêtes avant le premier affichage, le texte ne se décale pas.
        text=re.sub(r'<link rel="preload" href="[^"]*assets/fonts/[^"]*"[^>]*>\n?','',text)
        fonts=''.join(f'<link rel="preload" href="{base}assets/fonts/{name}.woff2" as="font" type="font/woff2" crossorigin>\n' for name in ('stmg-sans-regular','stmg-sans-bold','stmg-serif-semibold','stmg-symboles-latin','stmg-symboles-maths'))
        text=re.sub(r'(<link rel="stylesheet" href=")', lambda m: fonts+m.group(1), text, count=1)
        # Feuilles de style : jetons, base, composants, puis la feuille du gabarit de la page.
        text=re.sub(r'\s*<link rel="stylesheet" href="[^"]*assets/[\w-]+\.css[^"]*">','',text)
        sheets=''.join(f'\n<link rel="stylesheet" href="{base}assets/{name}.css">' for name in ('tokens','base','components',template(rel)))
        text=re.sub(r'(<link rel="preload" href="[^"]*assets/fonts/[^"]*"[^>]*>\n?)(?![\s\S]*<link rel="preload" href="[^"]*assets/fonts/)', lambda m: m.group(1).rstrip('\n')+sheets+'\n', text, count=1)
        text=re.sub(r'<body(?![^>]*data-gabarit)', f'<body data-gabarit="{template(rel)}"', text, count=1)
        text=re.sub(r'(<body[^>]*data-gabarit=")[^"]*', lambda m: m.group(1)+template(rel), text, count=1)
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
    apply_templates(ROOT)
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
    # Versions des scripts et feuilles de style, une fois tous les outils passés.
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') or p in ('docs', 'public') for p in path.relative_to(ROOT).parts):continue
        text=path.read_text();new=with_versions(text)
        if new!=text:path.write_text(new)
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+escape(u)+'</loc></url>\n' for u in urls)+'</urlset>\n')
    (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+ORIGIN+'/sitemap.xml\n')
    update_style_policy()
    print('SEO OK:',len(urls),'canonical URLs indexed.')
if __name__=='__main__':main()
