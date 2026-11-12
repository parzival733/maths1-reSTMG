"""Blocs communs des leçons, appliqués de façon idempotente par finalize_site.py :
encadré « Prérequis » en tête de leçon et routine de révision J+1 / J+7 / J+21.
Le texte propre à chaque leçon (consignes de révision de Terminale, remarques
des anciens « Appuis ») est conservé dans les nouveaux blocs.
"""
from pathlib import Path
import re

# Leçon -> prérequis (lien, ce qu'il faut savoir) et remarque éventuelle.
PREREQUISITES = {
    'cours/fonctions.html': ([('calcul.html', 'Calcul et proportions', 'développer, réduire et résoudre une équation du premier degré'),
                              ('logique.html', 'Ensembles et raisonnement', 'lire et écrire un intervalle')],
                             'Les contextes économiques ci-dessous sont fictifs.'),
    'cours/second-degre.html': ([('fonctions.html', 'Fonctions et droites', 'calculer une image et lire un graphique'),
                                 ('calcul.html', 'Calcul et proportions', 'développer et utiliser la règle du produit nul')], ''),
    'cours/suites.html': ([('fonctions.html', 'Fonctions et droites', 'remplacer une variable par une valeur dans une formule')],
                          'On peut calculer et tracer les premiers termes directement sur papier.'),
    'cours/suites-arithmetiques.html': ([('suites.html', 'Découvrir les suites', 'distinguer rang et terme, utiliser une récurrence')], ''),
    'cours/suites-geometriques.html': ([('suites.html', 'Découvrir les suites', 'rang, terme et récurrence'),
                                       ('evolutions.html', 'Évolutions en pourcentage', 'passer d’un taux à un coefficient multiplicateur'),
                                       ('suites-arithmetiques.html', 'Suites arithmétiques', 'comparer avec une évolution par ajouts constants')], ''),
    'cours/derivees.html': ([('fonctions.html', 'Fonctions et droites', 'coefficient directeur et taux de variation')], ''),
    'cours/variations.html': ([('derivees.html', 'Nombre dérivé et tangente', 'calculer un nombre dérivé'),
                               ('second-degre.html', 'Polynômes du second degré', 'étudier le signe d’une expression factorisée')], ''),
    'cours/statistiques-deux-variables.html': ([('fonctions.html', 'Fonctions et droites', 'équation d’une droite'),
                                               ('statistiques-descriptives.html', 'Lire et résumer des données', 'moyenne et lecture des données')], ''),
    'cours/probabilites-conditionnelles.html': ([('logique.html', 'Ensembles et raisonnement', 'intersection, réunion et complémentaire'),
                                                ('calcul.html', 'Calcul et proportions', 'fractions et proportions')], ''),
    'cours/bernoulli.html': ([('probabilites-conditionnelles.html', 'Probabilités conditionnelles', 'arbres pondérés et indépendance')], ''),
    'cours/variables-aleatoires.html': ([('bernoulli.html', 'Épreuves de Bernoulli', 'répéter une épreuve à deux issues'),
                                        ('statistiques-descriptives.html', 'Lire et résumer des données', 'moyenne pondérée et écart-type')], ''),
    'cours/calcul.html': ([], 'Aucun prérequis de Première : il suffit des calculs de collège (fractions, priorités opératoires, pourcentages simples). C’est un repère à consulter dès qu’un calcul bloque.'),
    'cours/evolutions.html': ([('calcul.html', 'Calcul et proportions', 'calculer une proportion et un pourcentage')], ''),
    'cours/logique.html': ([('calcul.html', 'Calcul et proportions', 'manipuler des nombres et des inégalités')], ''),
    'cours/statistiques-descriptives.html': ([('calcul.html', 'Calcul et proportions', 'proportions, fractions et moyennes simples')], ''),
    'cours/python-tableur.html': ([('suites.html', 'Découvrir les suites', 'calculer des termes par récurrence'),
                                  ('calcul.html', 'Calcul et proportions', 'écrire un calcul avec les bonnes priorités')], ''),
    'terminale/cours/t-suites.html': ([('../../cours/suites-arithmetiques.html', 'Suites arithmétiques (Première)', 'formule explicite et somme de termes'),
                                      ('../../cours/suites-geometriques.html', 'Suites géométriques (Première)', 'raison et coefficient multiplicateur')], ''),
    'terminale/cours/t-exponentielles.html': ([('../../cours/suites-geometriques.html', 'Suites géométriques (Première)', 'puissances d’un coefficient'),
                                              ('../../cours/evolutions.html', 'Évolutions en pourcentage (Première)', 'coefficients multiplicateurs'),
                                              ('t-suites.html', 'Suites et sommes', 'moyennes géométriques')], ''),
    'terminale/cours/t-logarithme.html': ([('t-exponentielles.html', 'Fonctions exponentielles', 'puissances et exponentielles de base a'),
                                          ('../../cours/calcul.html', 'Calcul et proportions (Première)', 'équations et inéquations')], ''),
    'terminale/cours/t-inverse.html': ([('../../cours/derivees.html', 'Nombre dérivé et tangente (Première)', 'équation de tangente'),
                                       ('../../cours/variations.html', 'Dérivées et variations (Première)', 'signe de la dérivée et tableau de variations'),
                                       ('../../cours/second-degre.html', 'Polynômes du second degré (Première)', 'signe d’un produit')], ''),
    'terminale/cours/t-conditionnelles.html': ([('../../cours/probabilites-conditionnelles.html', 'Probabilités conditionnelles (Première)', 'conditionnement et indépendance')],
                                              'Les rappels sont conservés pour la cohorte de Terminale qui a suivi le programme de Première 2019.'),
    'terminale/cours/t-binomiale.html': ([('../../cours/bernoulli.html', 'Épreuves de Bernoulli (Première)', 'répétitions indépendantes et arbres'),
                                         ('t-conditionnelles.html', 'Conditionnement et probabilités totales', 'indépendance'),
                                         ('../../cours/variables-aleatoires.html', 'Variables aléatoires (Première)', 'loi et espérance')], ''),
    'terminale/cours/t-variables.html': ([('../../cours/variables-aleatoires.html', 'Variables aléatoires (Première)', 'loi, espérance et simulation'),
                                         ('t-binomiale.html', 'Loi binomiale', 'probabilités d’un nombre de succès'),
                                         ('../../cours/statistiques-descriptives.html', 'Lire et résumer des données (Première)', 'moyennes et dispersion')], ''),
    'terminale/cours/t-statistiques.html': ([('../../cours/statistiques-deux-variables.html', 'Statistiques à deux variables (Première)', 'nuage de points, point moyen et droite d’ajustement'),
                                            ('t-logarithme.html', 'Logarithme décimal', 'utiliser log pour un changement de variable')], ''),
    'terminale/cours/t-outils.html': ([('../../cours/python-tableur.html', 'Atelier Python et tableur (Première)', 'variables, boucles et recopie de formules'),
                                      ('t-suites.html', 'Suites et sommes', 'termes et sommes calculés pas à pas')], ''),
    'troisieme/cours/3-arithmetique.html': ([], 'Il suffit de connaître les tables de multiplication et de savoir poser une division.'),
    'troisieme/cours/3-fractions.html': ([('3-arithmetique.html', 'Nombres premiers et arithmétique', 'simplifier une fraction')], ''),
    'troisieme/cours/3-puissances.html': ([('3-fractions.html', 'Fractions et nombres relatifs', 'appliquer la règle des signes d’un produit')], ''),
    'troisieme/cours/3-calcul-litteral.html': ([('3-fractions.html', 'Fractions et nombres relatifs', 'respecter les priorités avec des relatifs')], ''),
    'troisieme/cours/3-equations.html': ([('3-calcul-litteral.html', 'Calcul littéral', 'développer et factoriser une expression')], ''),
    'troisieme/cours/3-proportionnalite.html': ([('3-fractions.html', 'Fractions et nombres relatifs', 'prendre une fraction d’une quantité')], ''),
    'troisieme/cours/3-fonctions.html': ([('3-calcul-litteral.html', 'Calcul littéral', 'remplacer une lettre par un nombre'),
                                         ('3-equations.html', 'Équations et inéquations', 'résoudre une équation du premier degré')], ''),
    'troisieme/cours/3-fonctions-affines.html': ([('3-fonctions.html', 'Notion de fonction', 'calculer une image et un antécédent'),
                                                 ('3-proportionnalite.html', 'Proportionnalité et pourcentages', 'utiliser un coefficient de proportionnalité')], ''),
    'troisieme/cours/3-statistiques.html': ([('3-proportionnalite.html', 'Proportionnalité et pourcentages', 'calculer un pourcentage')], ''),
    'troisieme/cours/3-probabilites.html': ([('3-fractions.html', 'Fractions et nombres relatifs', 'multiplier et simplifier des fractions'),
                                            ('3-statistiques.html', 'Statistiques', 'calculer une fréquence')], ''),
    'troisieme/cours/3-grandeurs.html': ([('3-proportionnalite.html', 'Proportionnalité et pourcentages', 'passer par l’unité'),
                                         ('3-puissances.html', 'Puissances et notation scientifique', 'utiliser les puissances de 10')], ''),
    'troisieme/cours/3-pythagore.html': ([('3-equations.html', 'Équations et inéquations', 'résoudre une équation x² = k')], ''),
    'troisieme/cours/3-thales.html': ([('3-proportionnalite.html', 'Proportionnalité et pourcentages', 'calculer une quatrième proportionnelle')], ''),
    'troisieme/cours/3-trigonometrie.html': ([('3-pythagore.html', 'Théorème de Pythagore', 'repérer l’hypoténuse d’un triangle rectangle')], ''),
    'troisieme/cours/3-transformations.html': ([('3-thales.html', 'Théorème de Thalès', 'agrandir ou réduire une figure')], ''),
    'troisieme/cours/3-algorithmique.html': ([('3-calcul-litteral.html', 'Calcul littéral', 'traduire un programme de calcul')], ''),
}

TOGGLE = re.compile(r'<div class="lesson-corrections-toggle">[\s\S]*?</div>(?:<noscript><style>\.lesson-corrections-toggle\{display:none\}</style></noscript>)?')
TOC = re.compile(r'<aside class="lesson-toc"[^>]*>[\s\S]*?</aside>')
# Sans JavaScript, le sommaire, les options de lecture et le bouton des corrections
# n'ont pas d'effet : ils sont masqués et la leçon occupe toute la largeur.
NOSCRIPT = ('<noscript><style>.lesson-toc,.lesson-reading-controls,.lesson-corrections-toggle,.lesson-options-toggle,.toc-fab{display:none!important}'
            '.lesson-layout{grid-template-columns:minmax(0,1fr)!important}</style></noscript>')
OPTIONS = '<button class="lesson-options-toggle" type="button" aria-expanded="false" aria-controls="options-lecture">Options de lecture</button>'
FAB = '<a class="toc-fab" href="#sommaire-lecon">Sommaire</a>'
CORRECTIONS = re.compile(r'<details class="(?:study-solution|check)"')


def corrections_toggle(count):
    # Bouton écrit dans la page pour réserver sa place (pas de décalage au chargement) ;
    # assets/cours.js le relie aux corrections, et il reste masqué sans JavaScript.
    return (f'<div class="lesson-corrections-toggle"><button type="button" data-corrections-toggle>Afficher toutes les corrections ({count})</button>'
            '<p class="lesson-corrections-toggle__hint">Essaie d’abord seul : une correction ouverte compte comme une aide dans le suivi facultatif.</p>'
            '<p class="sr-only" role="status"></p></div>')


def table_of_contents(parts):
    # Sommaire écrit dans la page, replié par défaut : assets/cours.js remplit les liens
    # et l'ouvre sur ordinateur, sans décaler la leçon au chargement.
    return (f'<aside class="lesson-toc" id="sommaire-lecon"><details class="ui-toc"><summary>Sommaire de la leçon · {parts} parties</summary>'
            '<h2>Dans cette leçon</h2><nav aria-label="Sommaire de la leçon"></nav>'
            '<button class="print-button" type="button">Imprimer le cours</button></details></aside>')


OLD_SUPPORT = re.compile(r'<p(?: class="prerequisites")?>\s*Appuis? :[\s\S]*?</p>')
BOX = re.compile(r'<aside class="lesson-prerequisites"[\s\S]*?</aside>')
REVIEW = re.compile(r'<section class="study-review"[^>]*>([\s\S]*?)</section>')


def prerequisites_box(items, note):
    lines = ''.join(f'<li><a href="{href}">{title}</a> : {what}.</li>' for href, title, what in items)
    body = f'<p>Avant de commencer, vérifie que tu sais :</p><ul>{lines}</ul>' if items else ''
    extra = f'<p>{note}</p>' if note else ''
    return (f'<aside class="lesson-prerequisites" aria-labelledby="prerequis-titre"><p class="lesson-prerequisites__title" id="prerequis-titre">Prérequis</p>'
            f'{body}{extra}</aside>')


def review_block(heading_tag, series_title, specific):
    own = f'<p><strong>Pour cette leçon :</strong> {specific}</p>' if specific else ''
    return (f'<section class="study-review" aria-label="Routine de révision"><{heading_tag}>Ta routine de révision : J+1, J+7, J+21</{heading_tag}>'
            '<ol><li><strong>J+1, demain :</strong> relis la leçon en dix minutes, puis réécris de mémoire la partie « À retenir » et compare.</li>'
            '<li><strong>J+7, dans une semaine :</strong> refais les pauses mémoire de cette leçon sans regarder les réponses ; reprends la partie du cours de chaque erreur.</li>'
            f'<li><strong>J+21, dans trois semaines :</strong> refais la série d’exercices « {series_title} » en entier, avec de nouvelles variantes, sans regarder le cours.</li></ol>'
            f'{own}<p>Note ces trois dates dans ton agenda. Si une étape bloque, reviens à la partie concernée avant de passer à la suivante.</p></section>')


def apply(root: Path):
    for rel, (items, note) in PREREQUISITES.items():
        path = root / rel
        text = path.read_text(encoding='utf-8')
        original = text
        title = re.sub(r'<[^>]+>', '', re.search(r'<h1>(.*?)</h1>', text).group(1))
        # 1. Prérequis : encadré en tête de leçon (remplace une ligne « Appui(s) » éventuelle).
        text = OLD_SUPPORT.sub('', text, count=1)
        box = prerequisites_box(items, note)
        if BOX.search(text):
            text = BOX.sub(lambda _: box, text, count=1)
        else:
            text = re.sub(r'(<article class="lesson-content">)', lambda m: m.group(1) + box, text, count=1)
        # Bouton unique pour toutes les corrections, juste sous les prérequis.
        toggle = corrections_toggle(len(CORRECTIONS.findall(text.split('<article class="lesson-content">', 1)[1])))
        if TOGGLE.search(text):
            text = TOGGLE.sub(lambda _: toggle, text, count=1)
        else:
            text = re.sub(r'(<aside class="lesson-prerequisites"[\s\S]*?</aside>)', lambda m: m.group(1) + toggle, text, count=1)
        # Sommaire et options de lecture présents dès le HTML (pas de décalage au chargement).
        article = text.split('<article class="lesson-content">', 1)[1].split('</article>', 1)[0]
        text = TOC.sub(lambda _: table_of_contents(len(re.findall(r'<h2[ >]', article))), text, count=1)
        text = re.sub(r'(<div class="lesson-reading-controls"[^>]*?) hidden', r'\1', text, count=1)
        # Téléphone : un bouton « Options de lecture » replie les étapes et le confort de lecture ;
        # un lien fixe « Sommaire » ramène au sommaire (assets/menu.js).
        text = re.sub(r'<button class="lesson-options-toggle"[^>]*>[^<]*</button>', '', text)
        text = re.sub(r'<div class="lesson-reading-controls"(?![^>]*\bid=)', '<div class="lesson-reading-controls" id="options-lecture"', text, count=1)
        text = text.replace('<div class="lesson-reading-controls"', OPTIONS + '<div class="lesson-reading-controls"', 1)
        text = re.sub(r'<a class="toc-fab"[^>]*>[\s\S]*?</a>', '', text)
        text = text.replace('</article>', '</article>' + FAB, 1) if '<article class="lesson-content">' in text else text
        for old in re.findall(r'<noscript><style>\.lesson-toc,[\s\S]*?</noscript>', text):
            if old != NOSCRIPT:
                text = text.replace(old, '')
        if NOSCRIPT not in text:
            text = text.replace('</head>', NOSCRIPT + '</head>', 1)
        # Lien en double : « Pourquoi ces méthodes ? » figure déjà en haut de la leçon.
        text = re.sub(r'(<a href="\.\./programme\.html">Programme et sources</a>)\s*·\s*<a href="\.\./\.\./pedagogie\.html">Méthodes d’apprentissage</a>', r'\1', text)
        # 2. Routine de révision concrète, avec le lien vers la série du chapitre.
        match = REVIEW.search(text)
        inner = match.group(1)
        heading = re.search(r'<(h[23])>', inner).group(1)
        specific = ''
        if rel.startswith('terminale/'):
            kept = re.search(r'<p><strong>Pour cette leçon\s*:</strong>\s*([\s\S]*?)</p>', inner)
            if kept:
                specific = kept.group(1)
            elif 'J+21' not in inner:
                first = re.search(r'</h[23]>\s*<p>([\s\S]*?)</p>', inner)
                specific = first.group(1) if first else ''
        text = text[:match.start()] + review_block(heading, title, specific) + text[match.end():]
        if text != original:
            path.write_text(text, encoding='utf-8')


if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1])
