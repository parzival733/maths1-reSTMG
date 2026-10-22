"""Idempotent metadata and navigation finalizer for the static site.
Run after generating any catalogue. No runtime dependency.
"""
from pathlib import Path
from html import escape,unescape
import re
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://mathstmgdls.pages.dev'
VERSION='20261023-cloture1'

def main():
    urls=[]
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') for p in path.relative_to(ROOT).parts):continue
        if path.name=='404.html':continue
        text=path.read_text();rel=path.relative_to(ROOT).as_posix();base='../'*(len(path.relative_to(ROOT).parts)-1)
        canonical=ORIGIN+('/' if rel=='index.html' else '/'+rel.removesuffix('.html'))
        nav=re.search(r'<nav class="main-nav"[^>]*>(.*?)</nav>',text,re.S)
        if nav and '>Progresser</a>' not in nav[0]:text=text[:nav.end()-6]+f'<a href="{base}progresser.html">Progresser</a>'+text[nav.end()-6:]
        if 'assets/evolution.css' not in text:text=text.replace('</head>',f'<link rel="stylesheet" href="{base}assets/evolution.css?v={VERSION}"></head>',1)
        text=re.sub(r'(assets/(?:interface|evolution)\.css\?v=)[^"\s]+',r'\g<1>'+VERSION,text)
        text=re.sub(r'(assets/(?:acquis|parcours|parcours-data|progres|exercices)\.js\?v=)[^"\s]+',r'\g<1>'+VERSION,text)
        if 'footer-links' not in text and '</footer>' in text:
            text=text.replace('</footer>',f'<div class="container footer-links"><a href="{base}mes-progres.html">Mes progr\u00e8s</a> \u00b7 <a href="{base}a-propos.html">\u00c0 propos et donn\u00e9es</a> \u00b7 <a href="{base}accessibilite.html">Accessibilit\u00e9</a></div></footer>')
        if '<meta property="og:type"' not in text:
            title=re.search(r'<title>(.*?)</title>',text).group(1)
            description=re.search(r'<meta name="description" content="([^"]*)"',text)
            text=text.replace('</head>',f'<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:url" content="{canonical}"><meta property="og:description" content="{description.group(1) if description else title}"></head>',1)
        text=re.sub(r'<link rel="canonical"[^>]*>','',text)
        text=text.replace('</head>',f'<link rel="canonical" href="{canonical}"></head>',1)
        if rel=='sujets.html' and 'href="preparer-bac.html"' not in text:
            point=text.index('</header>',text.index('<header class="page-intro'))+9
            text=text[:point]+'<aside class="evo-note"><p><strong>Premi\u00e8re 2026\u20132027 :</strong> les PDF ci-dessous sont des archives, pas des sujets blancs pour la nouvelle \u00e9preuve.</p><a class="button button-primary" href="preparer-bac.html">Pr\u00e9parer le format actuel : sujets blancs et corrig\u00e9s</a></aside>'+text[point:]
        path.write_text(text)
        if 'name="robots" content="noindex' not in text:urls.append(canonical)
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+escape(u)+'</loc></url>\n' for u in urls)+'</urlset>\n')
    (ROOT/'robots.txt').write_text('User-agent: *\nDisallow: /tests/\nDisallow: /tools/\nDisallow: /.github/\nSitemap: '+ORIGIN+'/sitemap.xml\n')
    print('SEO OK:',len(urls),'canonical URLs indexed.')
if __name__=='__main__':main()
