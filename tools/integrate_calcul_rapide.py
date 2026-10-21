"""Integration idempotente des entrees de l'annexe. Python standard uniquement.
Ne touche ni aux cours ni aux exercices existants.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
ENTRYPOINTS = ['index.html', 'lecons.html', 'exercices.html', 'terminale/lecons.html', 'terminale/exercices.html']
for name in ENTRYPOINTS:
    path = ROOT / name
    text = path.read_text(encoding='utf-8')
    prefix = '../' if name.startswith('terminale/') else ''
    href = prefix + 'annexes/calcul-rapide.html'
    if 'has-rapid-link' not in text:
        def body(match):
            attrs = match[1]
            if 'class="' in attrs:
                attrs = attrs.replace('class="', 'class="has-rapid-link ', 1)
            else:
                attrs += ' class="has-rapid-link"'
            return '<body' + attrs + '>'
        text, count = re.subn(r'<body([^>]*)>', body, text, count=1)
        assert count == 1, name
    if 'calcul-rapide.css' not in text:
        text = text.replace('</head>', f'<link rel="stylesheet" href="{prefix}assets/calcul-rapide.css?v=1"></head>', 1)
    def navigation(match):
        if 'calcul-rapide.html' in match[2]:
            return match[0]
        return match[1] + match[2] + f'<a href="{href}">Calcul rapide</a>' + match[3]
    text, count = re.subn(r'(<nav class="main-nav"[^>]*>)(.*?)(</nav>)', navigation, text, count=1, flags=re.S)
    assert count == 1, name
    if 'id="annexe-calcul-rapide"' not in text:
        card = f'''<aside id="annexe-calcul-rapide" class="rapid-entry" aria-labelledby="annexe-calcul-title"><p class="eyebrow">ANNEXE / SANS CALCULATRICE</p><h2 id="annexe-calcul-title">Calcul mental et calcul rapide sur feuille</h2><p>Des series courtes, des methodes et des fiches imprimables pour le bac de Premiere. Les prolongements Terminale sont separes du parcours bac.</p><a href="{href}">Ouvrir l'annexe de calcul rapide \u2192</a></aside>'''
        card = card.replace('Des series courtes, des methodes', 'Des s\u00e9ries courtes, des m\u00e9thodes').replace('Premiere.', 'Premi\u00e8re.').replace('separes', 's\u00e9par\u00e9s')
        assert '</main>' in text
        text = text.replace('</main>', card + '\n</main>', 1)
    path.write_text(text, encoding='utf-8')

css_path = ROOT / 'assets/calcul-rapide.css'
css = css_path.read_text(encoding='utf-8')
if 'Le corrige de la fiche ne se revele pas dans la previsualisation' not in css:
    css += '\n/* Le corrige de la fiche ne se revele pas dans la previsualisation. */\n@media screen { .rapid-paper-solutions { display:none; } }\n'
css_path.write_text(css, encoding='utf-8')

html_path = ROOT / 'annexes/calcul-rapide.html'
html = html_path.read_text(encoding='utf-8')
if 'Imprimer le corrig\u00e9 retire' not in html:
    anchor = 'Imprimer aussi le corrig\u00e9 sur des pages s\u00e9par\u00e9es</label>'
    assert anchor in html
    html = html.replace(anchor, anchor + '<p class="rapid-small">Imprimer le corrig\u00e9 retire les points des r\u00e9ponses non encore valid\u00e9es, m\u00eame si tu annules ensuite l\u2019impression. La fiche sans corrig\u00e9 ne change pas le score.</p>', 1)
html_path.write_text(html, encoding='utf-8')

readme_path = ROOT / 'README.md'
readme = readme_path.read_text(encoding='utf-8')
readme = readme.replace('Au total : **25 ressources de cours', 'Pour les deux parcours de chapitres, hors annexe de calcul rapide : **25 ressources de cours')
if '## Annexe : calcul rapide sans calculatrice' not in readme:
    readme += '''

## Annexe : calcul rapide sans calculatrice

`annexes/calcul-rapide.html` est une annexe distincte des catalogues de chapitres. L'accueil et les quatre catalogues y donnent acces par la navigation et un encadre. Aucun cours ni exercice existant n'est remplace.

La banque `assets/calcul-rapide-data.js` comprend **54 modeles** : 18 bases generales, 24 calculs lies aux chapitres de Premiere et 12 prolongements Terminale. Le parcours par defaut « Bac Premiere » exclut strictement les 12 modeles Terminale. On peut choisir le niveau, la notion, le calcul mental ou sur feuille et une serie de 5, 10 ou 20 questions. Les tirages sont reproductibles par graine, sans promesse de nouveaute indefinie.

Chaque question comprend un indice, une correction expliquee et un lien vers sa lecon. Le bilan compte seulement les reponses justes au premier essai ; les corrections revelees ne rapportent pas de point. Les fractions equivalentes et les decimaux exacts sont acceptes par comparaison rationnelle (BigInt), sans eval et sans arrondis arbitraires. Le chronometre est facultatif, sans limite de temps, et se met en pause quand l'onglet est masque.

Une fiche imprimable reprend la serie courante. Les corrections sont masquees dans la previsualisation et absentes de l'impression par defaut. Une case permet de les imprimer sur des pages separees ; les reponses non encore validees ne peuvent alors plus rapporter de point. Douze methodes et une serie papier de douze questions restent accessibles sans JavaScript. Aucun compte, suivi, transmission ou stockage persistant.

Reference de l'epreuve pour 2026-2027 (session 2028) : [note de service du 11 septembre 2026](https://www.education.gouv.fr/bo/2026/Special4/MENE2622640N), qui prevoit des questions a reponses courtes et interdit la calculatrice. Cette annexe ne constitue ni un sujet officiel ni une preparation exhaustive a toute l'epreuve.

Tests supplementaires :

```sh
node tests/test_calcul_rapide.js
python3 tests/test_calcul_rapide.py
python3 tests/browser_calcul_rapide.py
```

Le script `tools/integrate_calcul_rapide.py` rend l'ajout des liens idempotent. Il n'est pas necessaire pour servir le site : les fichiers publies sont statiques. Le workflow permanent `calcul-rapide.yml` verifie l'annexe en lecture seule.
'''
readme_path.write_text(readme, encoding='utf-8')
print('Integration OK: five entrypoints, printable answer protection and documentation.')
