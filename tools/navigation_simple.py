"""Small, idempotent navigation changes. Keep all mathematical resources intact."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qs, unquote
import posixpath, re
ALIASES={'progresser.html':'exercices.html','preparer-bac.html':'sujets.html'}
VERSION='20261023-simple1'

def apply(root):
    root=Path(root)
    template=(root/'tools/templates/inline-progress.fragment').read_text()
    for filename,level,base in [('exercices.html','premiere',''),('terminale/exercices.html','terminale','../')]:
        path=root/filename;text=path.read_text()
        if 'id="mes-progres"' not in text:
            intro=re.search(r'<(?:section|header) class="page-intro"[^>]*>[\s\S]*?</(?:section|header)>',text)
            assert intro,filename
            extra=(f'<div class="exercise-shortcuts">'
                   f'<a href="{base}revisions.html?niveau={level}">R\u00e9vision guid\u00e9e</a>'
                   f'<a href="{base}diagnostic.html?niveau={level}">Tester mes bases</a></div>')
            extra+=template.replace('{base}',base).replace('{level}',level)
            text=text[:intro.end()]+extra+text[intro.end():]
        # A short instruction replaces the long inventory above the actual chapters.
        intro=re.search(r'<(?:section|header) class="page-intro"[^>]*>[\s\S]*?</(?:section|header)>',text)
        if intro:
            count='16' if level=='premiere' else '9'
            short=f'<p>{count} s\u00e9ries avec variantes et corrections. Choisis un chapitre et commence.</p>'
            block=re.sub(r'<p>(?:[\s\S]*?)</p>',lambda m:short,intro[0],count=1)
            text=text[:intro.start()]+block+text[intro.end():]
        text=text.replace('<span>Pas de chapitre en t\u00eate ?</span>','').replace('R\u00e9vision rapide</a>','R\u00e9vision guid\u00e9e</a>')
        for src in ['acquis.js','progres.js','navigation-simple.js']:
            if 'assets/'+src not in text:
                text=text.replace('</head>',f'<script src="{base}assets/{src}?v={VERSION}" defer></script></head>')
        path.write_text(text)
    # Remove the home relay: courses and exercises are already directly available.
    path=root/'index.html';text=path.read_text()
    text=re.sub(r'<section class="rapid-entry evo-home-entry">[\s\S]*?</section>','',text)
    path.write_text(text)
    # The subjects themselves are one click away, not behind an additional portal.
    path=root/'sujets.html';text=path.read_text()
    text=re.sub(r'<aside class="evo-note">[\s\S]*?href="preparer-bac.html"[\s\S]*?</aside>','',text)
    if 'id="sujets-blancs"' not in text:
        intro=re.search(r'<header class="page-intro[^\"]*"[^>]*>[\s\S]*?</header>',text)
        assert intro
        extra='''<section class="simple-exam-entry" id="sujets-blancs" aria-labelledby="blancs-title"><h2 id="blancs-title">Sujets blancs corrig\u00e9s \u00b7 Premi\u00e8re</h2><p>Des entra\u00eenements du site, non officiels. Sujet, chrono r\u00e9glable, corrig\u00e9 et bar\u00e8me au m\u00eame endroit.</p><div class="action-row"><a class="button button-primary" href="entrainement/sujet-blanc-1.html">Sujet blanc 1</a><a class="button button-primary" href="entrainement/sujet-blanc-2.html">Sujet blanc 2</a><a href="entrainement/problemes.html">Probl\u00e8mes corrig\u00e9s \u00b7 Premi\u00e8re et Terminale</a></div><details class="ui-disclosure"><summary>Conditions de l'\u00e9preuve et conseils pour la copie</summary><p>Pour la Premi\u00e8re 2026\u20132027 : \u00e9preuve en 2027 pour le bac 2028. Deux heures sans calculatrice, coefficient 2, questions \u00e0 r\u00e9ponses courtes sur 6 points et deux ou trois exercices sur 14 points. Les 2 points de langue sont compris dans les 20 points.</p><p>Nomme les grandeurs et les unit\u00e9s, respecte le domaine, justifie ta m\u00e9thode et conclus dans le contexte. Garde les valeurs exactes avant d'arrondir et relis tes phrases.</p><p><a href="https://www.education.gouv.fr/bo/2026/Special4/MENE2622640N">Texte officiel</a> \u00b7 <a href="programme.html">Programme de Premi\u00e8re</a> \u00b7 <a href="annexes/calcul-rapide.html">Calcul rapide sans calculatrice</a></p></details><p class="evo-small">Les 41 PDF ci-dessous sont des archives : ils ne reproduisent pas tous le format actuel. Les consignes et les programmes peuvent diff\u00e9rer.</p></section>'''
        text=text[:intro.end()]+extra+text[intro.end():]
    path.write_text(text)
    # Real activities keep their own pages, with a visible exit to the chosen catalogue.
    for filename in ['diagnostic.html','revisions.html','mes-progres.html']:
        path=root/filename;text=path.read_text()
        if 'class="return-to-exercises"' not in text:
            text=re.sub(r'(<main\b[^>]*>)',r'\1<a class="return-to-exercises" data-return-exercises href="exercices.html">← Retour aux exercices</a>',text,count=1)
        if 'assets/navigation-simple.js' not in text:
            text=text.replace('</head>',f'<script src="assets/navigation-simple.js?v={VERSION}" defer></script></head>')
        path.write_text(text)
    for path in sorted(root.rglob('*.html')):
        rel=path.relative_to(root).as_posix()
        if any(x.startswith('.') for x in path.relative_to(root).parts) or rel in ALIASES:continue
        text=path.read_text();base='../'*(len(path.relative_to(root).parts)-1)
        terminale=rel.startswith('terminale/')
        # Remove the sixth top-level entry on every page, including the error page.
        def nav(m):
            content=re.sub(r'<a\b[^>]*>Progresser</a>','',m[0])
            if rel in ['diagnostic.html','revisions.html','mes-progres.html']:
                content=re.sub(r'(<a href="exercices.html")',r'\1 aria-current="location"',content)
            return content
        text=re.sub(r'<nav class="main-nav"[^>]*>[\s\S]*?</nav>',nav,text,count=1)
        # Repeated finalization must not duplicate aria-current on activities.
        text=re.sub(r'( aria-current="location"){2,}',r' aria-current="location"',text)
        def direct(m):
            href=m[1];u=urlsplit(href)
            if u.scheme or u.netloc:return m[0]
            target=posixpath.normpath(posixpath.join(posixpath.dirname(rel),unquote(u.path)))
            is_term=terminale or parse_qs(u.query).get('niveau')==['terminale']
            exercise=base+('terminale/' if is_term else '')+'exercices.html'
            if target=='progresser.html':return 'href="'+exercise+'"'
            if target=='preparer-bac.html':return 'href="'+base+'sujets.html#sujets-blancs"'
            if target=='mes-progres.html':return 'href="'+exercise+'#mes-progres"'
            return m[0]
        text=re.sub(r'href="([^"]+)"',direct,text)
        path.write_text(text)
    # Old bookmarked hub URLs display the useful destination directly, without a redirect.
    # Exclude them from indexing: regular navigation never points to these aliases.
    for old,new in ALIASES.items():
        text=(root/new).read_text()
        text=re.sub(r'<meta name="robots"[^>]*>','',text)
        text=text.replace('</head>','<meta name="robots" content="noindex,follow"></head>',1)
        (root/old).write_text(text)
