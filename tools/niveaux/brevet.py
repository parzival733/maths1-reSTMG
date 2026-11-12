"""Pages « Brevet » de 3e : format de l'épreuve, sujets officiels et sujet blanc corrigé."""
from troisieme import BRAND, FOOTER, head, nav

TOOLBAR = ('<section class="exam-toolbar no-print" aria-label="Temps et impression"><div class="exam-timer-ui" hidden><label>Durée en minutes <input id="exam-minutes" type="number" min="15" max="240" step="1" value="120"></label>'
           '<div class="action-row"><button class="button practice-secondary" id="exam-start" type="button">Démarrer le compte à rebours</button><button class="button practice-secondary" id="exam-pause" type="button" hidden>Pause</button>'
           '<button class="button practice-secondary" id="exam-stop" type="button" hidden>Arrêter</button><span class="exam-clock" id="exam-clock" role="timer" aria-live="off">120:00</span></div>'
           '<label class="exam-autopause"><input type="checkbox" id="exam-autopause" checked> Mettre le chrono en pause si je quitte l’onglet (décoche pour une simulation stricte)</label>'
           '<p id="exam-status" role="status" aria-live="polite">Le chrono est facultatif. Les questions restent accessibles.</p></div>'
           '<label><input type="checkbox" id="exam-include-answers"> Inclure le corrigé à l’impression</label><button type="button" class="button button-primary" data-print-exam>Imprimer le sujet</button></section>')
SPACE = '<div class="exam-answer-space" aria-hidden="true"></div>'

AUTOS = [  # (énoncé, méthode, calcul, conclusion)
    ('Calculer 2/3 + 5/6 et donner le résultat sous forme d’une fraction irréductible.', 'on réduit au même dénominateur.', '2/3 = 4/6, donc 2/3 + 5/6 = 9/6 = 3/2.', '<strong>3/2</strong>'),
    ('Calculer 5 − 3 × (−4).', 'la multiplication passe avant la soustraction.', '3 × (−4) = −12, donc 5 − (−12) = 5 + 12 = 17.', '<strong>17</strong>'),
    ('Écrire 0,000 72 en notation scientifique.', 'on place la virgule après le premier chiffre non nul et on compte les rangs.', 'la virgule se déplace de 4 rangs vers la droite.', '<strong>7,2 × 10<sup>−4</sup></strong>'),
    ('Calculer 15 % de 240 €.', '15 % de 240, c’est 0,15 × 240, ou 10 % plus 5 %.', '24 + 12 = 36.', '<strong>36 €</strong>'),
    ('Résoudre l’équation 4x − 7 = 13.', 'on isole x.', '4x = 20, donc x = 5.', '<strong>x = 5</strong>'),
    ('Développer et réduire (x + 3)².', 'identité remarquable (a + b)² = a² + 2ab + b².', 'x² + 2 × x × 3 + 3².', '<strong>x² + 6x + 9</strong>'),
    ('f est la fonction définie par f(x) = −2x + 5. Calculer l’image de 3 par f.', 'on remplace x par 3.', 'f(3) = −6 + 5.', '<strong>f(3) = −1</strong>'),
    ('Décomposer 84 en produit de facteurs premiers.', 'on divise par les nombres premiers dans l’ordre.', '84 = 2 × 42 = 2 × 2 × 21 = 2 × 2 × 3 × 7.', '<strong>84 = 2² × 3 × 7</strong>'),
    ('Un triangle est rectangle ; les côtés de l’angle droit mesurent 6 cm et 8 cm. Donner la longueur de l’hypoténuse.', 'théorème de Pythagore.', '6² + 8² = 36 + 64 = 100 et √100 = 10.', '<strong>10 cm</strong>'),
    ('Donner la médiane de la série : 12 ; 3 ; 15 ; 8 ; 7.', 'on range les valeurs dans l’ordre croissant.', '3 ; 7 ; 8 ; 12 ; 15 : 5 valeurs, la 3e est au milieu.', '<strong>8</strong>'),
    ('Une urne contient 3 boules rouges et 5 boules bleues. On tire une boule au hasard. Donner la probabilité d’obtenir une boule rouge.', 'nombre de cas favorables sur nombre de cas possibles.', '3 boules rouges sur 8 boules.', '<strong>3/8</strong>'),
    ('Convertir 2,5 h en heures et minutes.', '0,5 h est une demi-heure.', '0,5 × 60 min = 30 min.', '<strong>2 h 30 min</strong>'),
]


def exam_body():
    autos = ''.join(f'<li>{q}{SPACE}</li>' for q, *_ in AUTOS)
    autos_corr = ''.join(f'<li><strong>Méthode :</strong> {m} <strong>Calcul :</strong> {c} <strong>Conclusion :</strong> {r}. <em>(0,5 point)</em></li>' for _, m, c, r in AUTOS)
    return f'''<header class="page-intro"><p class="eyebrow">ENTRAÎNEMENT ORIGINAL · NON OFFICIEL</p><h1>Sujet blanc · Brevet de mathématiques</h1><p>Programme de 3e 2026–2027, au format de l’épreuve du brevet à partir de la session 2027.</p></header>
<div class="exam-intro"><strong>2 heures</strong><strong>Partie 1 sans calculatrice</strong><strong>20 points</strong></div>
<p>Travaille sur une copie. La partie 1 dure 20 minutes, sans calculatrice et sans justification. Dans la partie 2, avec calculatrice, justifie tes réponses : les recherches et les démarches engagées, même non abouties, peuvent rapporter des points. La maîtrise de la langue est évaluée sur 2 points, plus particulièrement sur les réponses aux questions en gras.</p>
{TOOLBAR}
<section class="exam-block exam-automatisms"><h2>Partie 1 · Automatismes <span class="exam-points">6 points · 20 minutes</span></h2><p>Calculatrice interdite. Douze questions à réponse courte, chacune sur 0,5 point. Aucune justification n’est demandée.</p><ol>{autos}</ol></section>
<section class="exam-block"><h2>Partie 2 · Exercice 1 · Une rampe d’accès <span class="exam-points">5 points</span></h2><p>Calculatrice autorisée. Pour accéder à l’entrée d’une bibliothèque, on installe une rampe. Elle est modélisée par le triangle ABC rectangle en B : la longueur horizontale AB vaut 4 m et la hauteur BC à franchir vaut 0,3 m. La rampe correspond au segment [AC].</p><ol><li>Calculer la longueur AC de la rampe. Arrondir au centimètre.</li><li>Calculer la mesure de l’angle BAC. Arrondir au dixième de degré.</li><li><strong>La pente d’une rampe est le quotient BC ÷ AB. Une règle d’accessibilité impose une pente inférieure ou égale à 5 %. Cette rampe la respecte-t-elle ? Justifier.</strong></li><li>Quelle longueur horizontale AB faudrait-il, au minimum, pour respecter cette règle avec la même hauteur ?</li></ol></section>
<section class="exam-block"><h2>Partie 2 · Exercice 2 · Deux tarifs de piscine <span class="exam-points">5 points</span></h2><p>Une piscine propose deux tarifs. Tarif A : 4,50 € l’entrée. Tarif B : un abonnement annuel de 30 €, puis 2 € par entrée. On note x le nombre d’entrées dans l’année, A(x) et B(x) les prix payés en euros avec chaque tarif.</p><ol><li>Calculer le prix payé pour 10 entrées avec chaque tarif.</li><li>Exprimer A(x) et B(x) en fonction de x. Laquelle de ces deux fonctions est linéaire ?</li><li>Résoudre l’équation 4,5x = 30 + 2x et interpréter la solution.</li><li><strong>Inès prévoit d’aller 20 fois à la piscine cette année. Quel tarif lui conseiller ? Justifier par des calculs, puis rédiger le conseil.</strong></li><li>Dans un tableur, la colonne A contient les nombres d’entrées à partir de la cellule A2. Quelle formule écrire en B2, puis recopier vers le bas, pour obtenir le prix avec le tarif B ?</li></ol></section>
<section class="exam-block"><h2>Partie 2 · Exercice 3 · Jetons numérotés <span class="exam-points">4 points</span></h2><p>Un sac contient vingt jetons numérotés de 1 à 20, indiscernables au toucher. On tire un jeton au hasard.</p><ol><li>Quelle est la probabilité d’obtenir un multiple de 5 ?</li><li>Quelle est la probabilité d’obtenir un nombre premier ?</li><li><strong>Léa affirme : « J’ai plus de chances de tirer un nombre pair que de tirer un nombre supérieur à 12. » A-t-elle raison ? Justifier.</strong></li><li>Un programme simule 1 000 tirages avec remise et obtient 207 multiples de 5. Calculer la fréquence observée et la comparer à la probabilité de la question 1.</li></ol></section>
<details class="exam-correction"><summary>Corrigé expliqué et barème</summary><h2>Partie 1 · 6 points</h2><ol>{autos_corr}</ol>
<h2>Exercice 1 · 5 points</h2><ol>
<li><p><strong>Méthode :</strong> le triangle ABC est rectangle en B, donc le théorème de Pythagore s’applique. <strong>Calcul :</strong> AC² = AB² + BC² = 4² + 0,3² = 16 + 0,09 = 16,09, donc AC = √16,09 ≈ 4,011 m. <strong>Conclusion :</strong> la rampe mesure environ <strong>4,01 m</strong>. <em>(1 point)</em></p></li>
<li><p><strong>Méthode :</strong> on connaît le côté opposé à l’angle et le côté adjacent : on utilise la tangente. <strong>Calcul :</strong> tan(BAC) = BC ÷ AB = 0,3 ÷ 4 = 0,075, donc BAC = arctan(0,075) ≈ 4,29°. <strong>Conclusion :</strong> l’angle BAC mesure environ <strong>4,3°</strong>. <em>(1 point)</em></p></li>
<li><p><strong>Calcul :</strong> BC ÷ AB = 0,3 ÷ 4 = 0,075, soit 7,5 %. <strong>Conclusion :</strong> 7,5 % est supérieur à 5 % : la pente est trop forte, <strong>la rampe ne respecte pas la règle</strong>. <em>(1,5 point, dont une part pour la rédaction)</em></p></li>
<li><p><strong>Méthode :</strong> il faut 0,3 ÷ AB ≤ 0,05. <strong>Calcul :</strong> AB ≥ 0,3 ÷ 0,05 = 6. <strong>Conclusion :</strong> il faut une longueur horizontale d’au moins <strong>6 m</strong>. <em>(1,5 point)</em></p></li></ol>
<h2>Exercice 2 · 5 points</h2><ol>
<li><p><strong>Calculs :</strong> tarif A : 10 × 4,50 = 45 € ; tarif B : 30 + 10 × 2 = 50 €. <strong>Conclusion :</strong> <strong>45 € et 50 €</strong>. <em>(0,5 point)</em></p></li>
<li><p>A(x) = 4,5x et B(x) = 30 + 2x. <strong>A est linéaire</strong> (de la forme ax) ; B est affine, non linéaire. <em>(0,5 point)</em></p></li>
<li><p><strong>Calcul :</strong> 4,5x − 2x = 30, soit 2,5x = 30, donc x = 12. <strong>Conclusion :</strong> pour <strong>12 entrées</strong>, les deux tarifs coûtent le même prix : 4,5 × 12 = 54 €. <em>(1,5 point)</em></p></li>
<li><p><strong>Calculs :</strong> A(20) = 90 € et B(20) = 30 + 40 = 70 €. <strong>Conclusion :</strong> pour 20 entrées, le tarif B est le moins cher ; il fait économiser 20 €. On conseille donc à Inès de <strong>prendre le tarif B</strong>. <em>(1,5 point, dont une part pour la rédaction)</em></p></li>
<li><p>En B2 : <strong>=30+2*A2</strong>, puis on recopie vers le bas. <em>(1 point)</em></p></li></ol>
<h2>Exercice 3 · 4 points</h2><ol>
<li><p>Les multiples de 5 sont 5, 10, 15 et 20 : 4 jetons sur 20. <strong>P = 4/20 = 1/5</strong>. <em>(1 point)</em></p></li>
<li><p>Les nombres premiers inférieurs ou égaux à 20 sont 2, 3, 5, 7, 11, 13, 17 et 19 : 8 jetons. <strong>P = 8/20 = 2/5</strong>. <em>(1 point)</em></p></li>
<li><p>Il y a 10 nombres pairs, donc P(pair) = 10/20. Les nombres supérieurs à 12 sont 13, 14, …, 20 : il y en a 8, donc P = 8/20. Comme 10/20 > 8/20, <strong>Léa a raison</strong>. <em>(1,5 point, dont une part pour la rédaction)</em></p></li>
<li><p>Fréquence : 207 ÷ 1 000 = <strong>0,207</strong>. Elle est proche de la probabilité 1/5 = 0,2 : c’est cohérent, car sur un grand nombre de tirages la fréquence se rapproche de la probabilité. <em>(0,5 point)</em></p></li></ol>
<h2>Maîtrise de la langue · 2 points</h2><p>Les 2 points sont compris dans les 14 points de la partie 2. Ils valorisent des phrases complètes, un vocabulaire juste (hypoténuse, tangente, probabilité, fonction linéaire), les unités et une conclusion qui répond à la question, en particulier sur les questions en gras.</p>
<p><strong>Exemple de réponse valorisée</strong> (exercice 2, question 4) : « Avec le tarif A, Inès paierait 4,50 × 20 = 90 €. Avec le tarif B, elle paierait 30 + 2 × 20 = 70 €. Le tarif B lui fait donc économiser 20 € : je lui conseille de prendre l’abonnement. »</p>
<p><strong>Exemple de réponse pénalisée</strong> : « B c mieux 70 ». Le calcul est juste, mais il n’y a ni phrase, ni comparaison, ni unité.</p>
<p><strong>Total : 6 + 5 + 5 + 4 = 20 points.</strong> La répartition des points est celle du site, pas un barème officiel.</p></details>
<p class="evo-small">Format vérifié le 12 novembre 2026 : <a href="https://eduscol.education.gouv.fr/5607/les-epreuves-du-dnb">les épreuves du DNB sur Éduscol</a>. Ce sujet n’a pas été publié ni certifié par le ministère.</p>
<p class="action-row no-print"><a href="brevet.html">Revenir à la préparation du brevet</a><a href="../annexes/calcul-rapide.html?niveau=troisieme">Travailler les automatismes</a></p>'''


OFFICIAL = [
    ('Sujet de référence n° 1 du brevet 2027', 'Éduscol · PDF', 'https://eduscol.education.gouv.fr/sites/default/files/document/dnb-sujet-de-reference-mathematiques-serie-generale-n01-129658.pdf'),
    ('Sujet de référence n° 2 du brevet 2027', 'Éduscol · PDF', 'https://eduscol.education.gouv.fr/sites/default/files/document/dnb-sujet-de-reference-mathematiques-serie-generale-n02-129661.pdf'),
    ('Sujets zéro, liste des automatismes et définition de l’épreuve', 'Éduscol · page', 'https://eduscol.education.gouv.fr/5607/les-epreuves-du-dnb'),
    ('Sujets de la session 2026 (métropole, Antilles-Guyane, Amérique du Nord, Asie…)', 'Ministère · page', 'https://www.education.gouv.fr/reussir-au-lycee/brevet-bac-et-cap-les-sujets-des-examens-2024-414462'),
]


def brevet_page():
    h = head('Préparer le brevet · 3e | Maths', 'Préparer l’épreuve de mathématiques du brevet 2027 : format, sujets de référence officiels, sujet blanc corrigé et automatismes sans calculatrice.', '../', 'page', ['interface.js'])
    links = ''.join(f'<li><a href="{u}">{t}</a> <span class="evo-small">({s})</span></li>' for t, s, u in OFFICIAL)
    body = ['<body>', BRAND('../'), nav('../', '', ('brevet', 'page')),
            '<main id="contenu" class="container section-page" tabindex="-1"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="lecons.html">Leçons de 3e</a><span>/</span><span aria-current="page">Brevet</span></nav>',
            '<header class="page-intro"><p class="eyebrow">DIPLÔME NATIONAL DU BREVET · SESSION 2027</p><h1>Préparer le brevet<span class="title-dot">.</span></h1><p>L’épreuve de mathématiques, des sujets officiels pour s’entraîner et un sujet blanc corrigé au nouveau format.</p></header>',
            '<section class="source-panel" id="format"><h2>L’épreuve en bref</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Organisation de l’épreuve de mathématiques du brevet"><table><caption>2 heures, coefficient 2, note sur 20</caption><thead><tr><th>Partie</th><th>Durée</th><th>Points</th><th>Calculatrice</th></tr></thead><tbody>'
            '<tr><td>1. Automatismes : questions à réponses courtes, sans justification</td><td>20 minutes</td><td>6</td><td>Interdite</td></tr>'
            '<tr><td>2. Raisonnement et résolution de problèmes</td><td>1 heure 40</td><td>14, dont 2 de maîtrise de la langue</td><td>Autorisée</td></tr></tbody></table></div>'
            '<p>À partir de la session 2027, les sujets portent sur le programme de la classe de 3e. La copie de la partie 1 est ramassée au bout de 20 minutes. Dans la partie 2, la maîtrise de la langue est évaluée plus particulièrement sur les réponses aux questions en gras : écris des phrases, nomme les grandeurs, donne les unités et conclus.</p>'
            '<p><a href="programme.html#brevet">Le programme de 3e et les textes officiels →</a></p></section>',
            '<section class="source-panel" id="sujet-blanc"><h2>Sujet blanc corrigé</h2><p>Un sujet original au format 2027 : douze automatismes, puis trois exercices sur Pythagore et la trigonométrie, les fonctions et le tableur, les probabilités. Chrono facultatif, impression et corrigé détaillé avec barème.</p>'
            '<p><a class="button button-primary" href="sujet-blanc.html">Ouvrir le sujet blanc</a></p></section>',
            f'<section class="source-panel" id="sujets-officiels"><h2>Sujets officiels</h2><p>Ces documents s’ouvrent chez leur éditeur. Les sujets de 2026 portaient sur tout le cycle 4 ; ils restent un bon entraînement.</p><ul>{links}</ul></section>',
            '<section class="source-panel" id="automatismes"><h2>Travailler les automatismes</h2><p>La partie 1 se prépare par des séries courtes et régulières, sans calculatrice : fractions, priorités, puissances, pourcentages, équations, Pythagore, statistiques et probabilités simples.</p>'
            '<p class="action-row"><a class="button button-primary" href="../annexes/calcul-rapide.html?niveau=troisieme">Automatismes de 3e</a><a class="button practice-secondary" href="exercices.html">Exercices de 3e</a></p></section>',
            '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)


def sujet_blanc_page():
    h = head('Sujet blanc du brevet · 3e | Maths', 'Sujet blanc original de mathématiques au format du brevet 2027 : automatismes sans calculatrice, trois exercices, chrono facultatif et corrigé avec barème.', '../', 'page', ['compte-rebours.js', 'examen.js'])
    body = ['<body>', BRAND('../'), nav('../', '', ('brevet', 'location')),
            '<main id="contenu" class="container section-page evo-page" tabindex="-1">', exam_body(), '</main>', FOOTER('../') + '</body></html>\n']
    return h + ''.join(body)
