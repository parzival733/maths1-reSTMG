# Contenu des 16 leçons de 3e (données pour le générateur de pages).
# Chaque section : (titre h2, HTML). Les encadrés reprennent les classes du site.

def box(kind, html, title=None):
    t = f'<h3>{title}</h3>' if title else ''
    return f'<div class="{kind}">{t}{html}</div>'

D = lambda html, t=None: box('definition', html, t)
F = lambda html: f'<div class="formula">{html}</div>'
EX = lambda title, html: box('example', html, title)
W = lambda title, html: box('warning', html, title)
MTH = lambda html, t=None: box('method', html, t)


import zlib

def fig(title, body, w=320, h=200):
    key = zlib.crc32(title.encode()) % 99999
    return (f'<figure class="lesson-figure"><svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="fig-{key}">'
            f'<title id="fig-{key}">{title}</title>'
            f'<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">{body}</g></svg>'
            f'<figcaption>{title}</figcaption></figure>')


def txt(x, y, s, anchor='middle'):
    return f'<text x="{x}" y="{y}" fill="currentColor" stroke="none" font-size="15" text-anchor="{anchor}">{s}</text>'


LESSONS = [
  dict(slug='3-arithmetique', title='Nombres premiers et arithmétique', domain='nombres',
    lead='Décomposer un entier, simplifier une fraction et résoudre des problèmes de partage.',
    card='Diviseurs, nombres premiers, décomposition et fractions irréductibles.',
    ex_card='Décompositions, fractions irréductibles, partages et multiples communs.',
    keywords='diviseur multiple premier décomposition facteurs irréductible division euclidienne',
    objectives='Reconnaître un diviseur ou un multiple, savoir si un nombre est premier, décomposer un entier en produit de facteurs premiers, puis utiliser cette décomposition pour simplifier une fraction ou résoudre un problème de partage.',
    steps=['Écris la division ou la décomposition demandée.', 'Teste les diviseurs premiers dans l’ordre : 2, 3, 5, 7, 11…', 'Conclus en répondant à la question du contexte.'],
    sections=[
      ('Diviseurs et multiples', D('<p>Si a = b × k avec k entier, on dit que b est un <strong>diviseur</strong> de a et que a est un <strong>multiple</strong> de b. Par exemple, 42 = 6 × 7 : 6 divise 42 et 42 est un multiple de 6.</p>')
        + '<p>La <strong>division euclidienne</strong> de a par b (b non nul) donne un quotient q et un reste r tels que a = b × q + r, avec 0 ≤ r &lt; b. Le reste est nul exactement lorsque b divise a.</p>'
        + EX('Ranger des œufs', '<p>200 œufs dans des boîtes de 12 : 12 × 16 = 192 et 200 − 192 = 8. On écrit 200 = 12 × 16 + 8 : 16 boîtes pleines et 8 œufs restants.</p>')
        + '<p>Critères utiles : un entier est divisible par 2 si son chiffre des unités est pair, par 5 s’il se termine par 0 ou 5, par 3 (ou par 9) si la somme de ses chiffres est divisible par 3 (ou par 9).</p>'),
      ('Nombres premiers', D('<p>Un <strong>nombre premier</strong> est un entier qui a exactement deux diviseurs : 1 et lui-même. Les premiers sont 2, 3, 5, 7, 11, 13, 17, 19, 23, 29…</p>')
        + '<p>1 n’est pas premier : il n’a qu’un seul diviseur. 2 est le seul nombre premier pair.</p>'
        + MTH('<p>Pour savoir si n est premier, on teste les nombres premiers p tels que p × p ≤ n. Si aucun ne divise n, alors n est premier.</p>', 'Tester un nombre')
        + EX('Le cas de 97', '<p>On teste 2, 3, 5 et 7 (car 11 × 11 = 121 dépasse 97). Aucun ne divise 97 : 97 est premier.</p>')),
      ('Décomposer en produit de facteurs premiers', '<p>Tout entier supérieur ou égal à 2 s’écrit comme un produit de nombres premiers, et cette écriture est unique à l’ordre près.</p>'
        + EX('Décomposer 360', '<p>360 = 2 × 180 = 2 × 2 × 90 = 2 × 2 × 2 × 45 = 2 × 2 × 2 × 3 × 15 = 2 × 2 × 2 × 3 × 3 × 5.</p><p>On écrit 360 = 2³ × 3² × 5.</p>')
        + '<p>On divise d’abord par 2 autant de fois que possible, puis par 3, par 5, etc. On s’arrête quand le quotient vaut 1.</p>'),
      ('Simplifier une fraction', D('<p>Une fraction est <strong>irréductible</strong> lorsque son numérateur et son dénominateur n’ont pas d’autre diviseur commun que 1.</p>')
        + MTH('<p>On décompose numérateur et dénominateur, puis on supprime les facteurs premiers communs.</p>')
        + EX('Simplifier 84/126', '<p>84 = 2² × 3 × 7 et 126 = 2 × 3² × 7. Les facteurs communs sont 2, 3 et 7, soit 42. Donc 84/126 = 2/3.</p>')),
      ('Problèmes de partage et de rendez-vous', '<p>Pour former le <strong>plus grand nombre de lots identiques</strong> avec toutes les pièces, on cherche le plus grand diviseur commun aux quantités. Pour savoir quand deux phénomènes réguliers <strong>se reproduisent ensemble</strong>, on cherche le plus petit multiple commun non nul.</p>'
        + EX('Deux partages', '<p>Avec 48 roses et 36 tulipes : 48 = 2⁴ × 3 et 36 = 2² × 3². Le plus grand diviseur commun est 2² × 3 = 12 : 12 bouquets de 4 roses et 3 tulipes.</p><p>Deux bus partent toutes les 6 min et toutes les 8 min : les multiples de 8 sont 8, 16, 24… et 24 est le premier multiple de 6. Ils repartent ensemble 24 min plus tard.</p>')
        + W('Lire la question', '<p>Le nombre de bouquets et le nombre de fleurs par bouquet sont deux réponses différentes : vérifie que le produit redonne bien les quantités de départ.</p>')),
    ],
    quiz1=(1, 'Premier ou non ?', 'Lequel de ces nombres est premier ?', ['51', '57', '53'], 'c', 'Calcule la somme des chiffres de 51 et de 57.', '51 = 3 × 17 et 57 = 3 × 19 ; 53 n’est divisible ni par 2, ni par 3, ni par 5, ni par 7.'),
    quiz2=(3, 'Fraction irréductible', 'Quelle est la forme irréductible de 45/60 ?', ['3/4', '9/12', '15/20'], 'a', 'Cherche le plus grand diviseur commun de 45 et 60.', '45 = 3² × 5 et 60 = 2² × 3 × 5 : on divise par 15, ce qui donne 3/4.'),
    check=('Décompose 252 en produit de facteurs premiers.', '252 = 2 × 126 = 2 × 2 × 63 = 2 × 2 × 3 × 21 = 2 × 2 × 3 × 3 × 7, soit 252 = 2² × 3² × 7.'),
    recap='Un nombre premier a exactement deux diviseurs. Décomposer en facteurs premiers permet de simplifier une fraction et de trouver diviseurs ou multiples communs. Toujours vérifier en recalculant le produit.'),

  dict(slug='3-fractions', title='Fractions et nombres relatifs', domain='nombres',
    lead='Additionner, multiplier, diviser et respecter les priorités, avec des signes et des fractions.',
    card='Opérations sur les fractions, relatifs et priorités de calcul.',
    ex_card='Sommes, quotients, priorités, fractions d’une quantité et comparaisons.',
    keywords='fraction relatif priorité dénominateur commun inverse quotient opposé',
    objectives='Calculer avec des nombres relatifs en respectant les priorités, additionner et comparer des fractions, multiplier et diviser des fractions, et prendre une fraction d’une quantité.',
    steps=['Repère l’opération prioritaire.', 'Réduis au même dénominateur pour une somme ou une comparaison.', 'Simplifie le résultat et vérifie son signe.'],
    sections=[
      ('Les priorités de calcul', '<p>On effectue d’abord les calculs entre parenthèses, puis les puissances, puis les multiplications et divisions, et enfin les additions et soustractions, de gauche à droite.</p>'
        + D('<p>Deux nombres sont <strong>opposés</strong> si leur somme vaut 0. Soustraire un nombre revient à ajouter son opposé : 5 − (−3) = 5 + 3 = 8.</p>')
        + '<p>Le produit de deux nombres de même signe est positif ; le produit de deux nombres de signes contraires est négatif.</p>'
        + EX('Un calcul avec des relatifs', '<p>E = 4 − 3 × (2 − 7) = 4 − 3 × (−5) = 4 + 15 = 19.</p>')),
      ('Additionner et soustraire des fractions', F('a/d + b/d = (a + b)/d')
        + MTH('<p>Si les dénominateurs sont différents, on écrit les fractions avec un dénominateur commun (un multiple commun des dénominateurs), puis on additionne les numérateurs.</p>')
        + EX('Deux tiers plus un quart', '<p>2/3 + 1/4 = 8/12 + 3/12 = 11/12.</p>')
        + W('Erreur fréquente', '<p>On n’additionne jamais les dénominateurs : 1/2 + 1/3 ne vaut pas 2/5, mais 5/6.</p>')),
      ('Multiplier et diviser', F('a/b × c/d = (a × c)/(b × d)  et  a/b ÷ c/d = a/b × d/c')
        + '<p>L’<strong>inverse</strong> d’un nombre non nul x est le nombre qui, multiplié par x, donne 1. L’inverse de c/d est d/c. Diviser par un nombre revient à multiplier par son inverse.</p>'
        + EX('Un quotient', '<p>3/4 ÷ 5/6 = 3/4 × 6/5 = 18/20 = 9/10.</p>')),
      ('Comparer des fractions', '<p>Pour comparer deux fractions, on les écrit avec un même dénominateur positif : la plus grande est celle qui a le plus grand numérateur. On peut aussi comparer leurs écritures décimales, si elles sont exactes.</p>'
        + EX('5/8 ou 7/12 ?', '<p>5/8 = 15/24 et 7/12 = 14/24 : 5/8 est la plus grande, de 1/24.</p>')),
      ('Fraction d’une quantité', '<p>Prendre la fraction a/b d’une quantité Q revient à calculer a/b × Q. Quand une deuxième fraction porte sur un <strong>reste</strong>, on calcule d’abord ce reste.</p>'
        + EX('Dépenser une partie du reste', '<p>Sur 120 €, on dépense 1/4 : 30 €, il reste 90 €. On dépense ensuite 2/3 du reste : 60 €. Il reste 30 €.</p>')),
    ],
    quiz1=(1, 'Somme de fractions', 'Combien vaut 1/2 + 1/3 ?', ['2/5', '5/6', '1/6'], 'b', 'Écris les deux fractions avec le dénominateur 6.', '1/2 = 3/6 et 1/3 = 2/6, donc la somme vaut 5/6.'),
    quiz2=(2, 'Diviser par une fraction', 'Combien vaut 2 ÷ 1/4 ?', ['1/2', '8', '2/4'], 'b', 'Diviser par 1/4 revient à multiplier par 4.', '2 ÷ 1/4 = 2 × 4 = 8 : il y a 8 quarts dans 2.'),
    check=('Calcule A = 3/4 − 1/2 × 2/3.', 'La multiplication est prioritaire : 1/2 × 2/3 = 1/3. Puis A = 9/12 − 4/12 = 5/12.'),
    recap='Priorités : parenthèses, puissances, × et ÷, puis + et −. Somme : même dénominateur. Produit : numérateurs et dénominateurs entre eux. Quotient : multiplier par l’inverse.'),

  dict(slug='3-puissances', title='Puissances et notation scientifique', domain='nombres',
    lead='Écrire de très grands et de très petits nombres, et calculer avec les puissances de 10.',
    card='Puissances, puissances de 10, notation scientifique et préfixes.',
    ex_card='Puissances de 10, notation scientifique, signes et ordres de grandeur.',
    keywords='puissance exposant notation scientifique préfixe giga nano ordre de grandeur',
    objectives='Calculer une puissance d’un nombre relatif, utiliser les règles de calcul sur les puissances de 10, écrire un nombre en notation scientifique et relier les préfixes (kilo, méga, micro…) aux puissances de 10.',
    steps=['Repère la base et l’exposant.', 'Applique la règle de calcul adaptée.', 'Contrôle l’ordre de grandeur du résultat.'],
    sections=[
      ('Puissance d’un nombre', D('<p>Pour un entier n ≥ 1, a<sup>n</sup> est le produit de n facteurs égaux à a. Pour a non nul, a<sup>0</sup> = 1 et a<sup>−n</sup> = 1/a<sup>n</sup>.</p>')
        + EX('Le signe compte', '<p>(−2)<sup>4</sup> = (−2) × (−2) × (−2) × (−2) = 16, mais −2<sup>4</sup> = −(2 × 2 × 2 × 2) = −16. Un nombre pair de facteurs négatifs donne un produit positif.</p>')),
      ('Puissances de 10', F('10<sup>m</sup> × 10<sup>p</sup> = 10<sup>m + p</sup> ; 10<sup>m</sup> ÷ 10<sup>p</sup> = 10<sup>m − p</sup> ; (10<sup>m</sup>)<sup>p</sup> = 10<sup>m × p</sup>')
        + '<p>10<sup>n</sup> s’écrit 1 suivi de n zéros ; 10<sup>−n</sup> s’écrit 0,0…01 avec le chiffre 1 au n-ième rang après la virgule.</p>'
        + EX('Un calcul', '<p>(10<sup>5</sup> × 10<sup>−2</sup>) ÷ 10 = 10<sup>3</sup> ÷ 10<sup>1</sup> = 10<sup>2</sup> = 100.</p>')),
      ('La notation scientifique', D('<p>La <strong>notation scientifique</strong> d’un nombre positif est a × 10<sup>n</sup>, avec 1 ≤ a &lt; 10 et n entier relatif.</p>')
        + MTH('<p>On place la virgule juste après le premier chiffre non nul. L’exposant n compte de combien de rangs la virgule s’est déplacée : positif pour un nombre supérieur à 10, négatif pour un nombre inférieur à 1.</p>')
        + EX('Deux conversions', '<p>34 700 000 = 3,47 × 10<sup>7</sup> et 0,000 052 = 5,2 × 10<sup>−5</sup>.</p>')),
      ('Calculer en notation scientifique', '<p>Pour un produit, on multiplie les nombres a entre eux et les puissances de 10 entre elles, puis on réajuste si le nombre obtenu dépasse 10.</p>'
        + EX('Un produit', '<p>(4 × 10<sup>3</sup>) × (5 × 10<sup>6</sup>) = 20 × 10<sup>9</sup> = 2 × 10<sup>10</sup>.</p>')
        + '<p>Cette écriture permet de comparer rapidement des ordres de grandeur : la lumière parcourt environ 3 × 10<sup>5</sup> km par seconde, la distance Terre–Soleil vaut environ 1,5 × 10<sup>8</sup> km.</p>'),
      ('Les préfixes', '<p>Les unités utilisent des préfixes qui correspondent à des puissances de 10 :</p>'
        + '<div class="table-scroll" tabindex="0" role="region" aria-label="Préfixes et puissances de 10"><table><caption>Préfixes et puissances de 10</caption><thead><tr><th scope="col">Préfixe</th><th scope="col">Symbole</th><th scope="col">Puissance</th></tr></thead><tbody>'
        + ''.join(f'<tr><td>{a}</td><td>{b}</td><td>10<sup>{c}</sup></td></tr>' for a, b, c in [('téra', 'T', '12'), ('giga', 'G', '9'), ('méga', 'M', '6'), ('kilo', 'k', '3'), ('milli', 'm', '−3'), ('micro', 'µ', '−6'), ('nano', 'n', '−9')])
        + '</tbody></table></div>'
        + EX('Un fichier', '<p>3,2 Go = 3,2 × 10<sup>9</sup> octets.</p>')),
    ],
    quiz1=(1, 'Le signe d’une puissance', 'Combien vaut (−3)<sup>2</sup> ?', ['−9', '9', '−6'], 'b', 'Deux facteurs négatifs donnent un produit positif.', '(−3)<sup>2</sup> = (−3) × (−3) = 9.'),
    quiz2=(3, 'Notation scientifique', 'Quelle est la notation scientifique de 0,0045 ?', ['4,5 × 10<sup>−3</sup>', '45 × 10<sup>−4</sup>', '4,5 × 10<sup>3</sup>'], 'a', 'Le nombre a doit être compris entre 1 et 10.', 'La virgule se déplace de 3 rangs vers la droite : 0,0045 = 4,5 × 10<sup>−3</sup>.'),
    check=('Donne la notation scientifique de (6 × 10<sup>−2</sup>) × (5 × 10<sup>7</sup>).', '6 × 5 = 30 et 10<sup>−2</sup> × 10<sup>7</sup> = 10<sup>5</sup> ; 30 × 10<sup>5</sup> = 3 × 10<sup>6</sup>.'),
    recap='a<sup>n</sup> : n facteurs égaux à a, et attention au signe. On additionne les exposants pour un produit de puissances de 10. Notation scientifique : a × 10<sup>n</sup> avec 1 ≤ a < 10.'),

  dict(slug='3-calcul-litteral', title='Calcul littéral', domain='nombres',
    lead='Développer, factoriser et utiliser les identités remarquables pour démontrer.',
    card='Distributivité, identités remarquables, factorisation et programmes de calcul.',
    ex_card='Développer, réduire, factoriser et démontrer avec une expression.',
    keywords='développer factoriser distributivité identité remarquable carré expression programme de calcul',
    objectives='Développer et réduire une expression, utiliser la double distributivité et les identités remarquables, factoriser par un facteur commun ou une différence de deux carrés, et traduire un programme de calcul pour démontrer une propriété.',
    steps=['Repère la forme : produit à développer ou somme à factoriser.', 'Applique une règle à la fois, en écrivant chaque produit.', 'Réduis, puis vérifie avec une valeur de x.'],
    sections=[
      ('Développer avec la distributivité', F('k(a + b) = ka + kb  et  (a + b)(c + d) = ac + ad + bc + bd')
        + EX('Simple et double distributivité', '<p>3(2x + 5) − 4(x + 1) = 6x + 15 − 4x − 4 = 2x + 11.</p><p>(2x + 3)(x − 4) = 2x² − 8x + 3x − 12 = 2x² − 5x − 12.</p>')
        + W('Le signe moins', '<p>Un signe moins devant une parenthèse change le signe de <strong>tous</strong> les termes de la parenthèse : −(x − 4) = −x + 4.</p>')),
      ('Les identités remarquables', F('(a + b)² = a² + 2ab + b²<br>(a − b)² = a² − 2ab + b²<br>(a + b)(a − b) = a² − b²')
        + EX('Les appliquer', '<p>(x + 3)² = x² + 6x + 9 ; (2x − 5)² = 4x² − 20x + 25 ; (3x + 1)(3x − 1) = 9x² − 1.</p>')
        + W('Le double produit', '<p>(x + 3)² ne vaut pas x² + 9 : il manque le double produit 2 × x × 3 = 6x. Teste avec x = 1 : 4² = 16, alors que 1 + 9 = 10.</p>')),
      ('Factoriser', D('<p><strong>Factoriser</strong>, c’est transformer une somme en produit. C’est l’opération inverse du développement.</p>')
        + MTH('<p>On cherche un facteur commun à tous les termes, ou on reconnaît une identité remarquable, le plus souvent a² − b² = (a − b)(a + b).</p>')
        + EX('Deux factorisations', '<p>6x² + 15x = 3x × 2x + 3x × 5 = 3x(2x + 5).</p><p>9x² − 25 = (3x)² − 5² = (3x − 5)(3x + 5).</p>')),
      ('Démontrer avec le calcul littéral', '<p>Une lettre permet d’écrire un raisonnement valable pour <strong>tous</strong> les nombres. Un exemple numérique peut illustrer, mais il ne démontre pas.</p>'
        + EX('Un programme de calcul', '<p>Programme : choisir x, ajouter 3, élever au carré, soustraire x². On obtient (x + 3)² − x² = x² + 6x + 9 − x² = 6x + 9. Le résultat est donc toujours un multiple de 3.</p>')
        + '<p>Pour montrer qu’une affirmation est fausse, un seul <strong>contre-exemple</strong> suffit.</p>'),
    ],
    quiz1=(1, 'Une identité', 'Quel est le développement de (x − 4)² ?', ['x² − 16', 'x² − 8x + 16', 'x² + 16'], 'b', 'N’oublie pas le double produit −2 × x × 4.', '(x − 4)² = x² − 8x + 16.'),
    quiz2=(2, 'Factoriser', 'Quelle est une factorisation de x² − 49 ?', ['(x − 7)(x + 7)', '(x − 7)²', 'x(x − 49)'], 'a', 'Reconnais une différence de deux carrés.', 'x² − 49 = x² − 7² = (x − 7)(x + 7).'),
    check=('Développe et réduis (2x + 1)² − (x − 3)(x + 3).', '(2x + 1)² = 4x² + 4x + 1 et (x − 3)(x + 3) = x² − 9. Donc 4x² + 4x + 1 − x² + 9 = 3x² + 4x + 10.'),
    recap='Développer : produit vers somme. Factoriser : somme vers produit. Les trois identités remarquables servent dans les deux sens. Vérifier une égalité avec une valeur de x permet de repérer une erreur.'),

  dict(slug='3-equations', title='Équations et inéquations', domain='nombres',
    lead='Mettre un problème en équation, le résoudre et vérifier la solution.',
    card='Équations du premier degré, produit nul, x² = k et inéquations.',
    ex_card='Équations, produits nuls, inéquations et mises en équation.',
    keywords='équation inéquation inconnue solution produit nul racine carrée mise en équation',
    objectives='Résoudre une équation du premier degré, une équation produit nul et une équation x² = k, résoudre une inéquation en tenant compte du signe, et mettre un problème en équation.',
    steps=['Choisis l’inconnue et écris l’équation.', 'Isole x en effectuant la même opération sur les deux membres.', 'Vérifie la solution dans l’équation de départ et réponds à la question.'],
    sections=[
      ('Résoudre une équation du premier degré', D('<p>Une <strong>solution</strong> d’une équation est une valeur de l’inconnue qui rend l’égalité vraie.</p>')
        + '<p>On ne change pas les solutions en ajoutant (ou soustrayant) un même nombre aux deux membres, ni en les multipliant (ou divisant) par un même nombre non nul.</p>'
        + EX('x dans les deux membres', '<p>5x − 3 = 2x + 9 donne 5x − 2x = 9 + 3, soit 3x = 12, donc x = 4. Vérification : 5 × 4 − 3 = 17 et 2 × 4 + 9 = 17.</p>')),
      ('Équation produit nul', D('<p>Un produit de facteurs est nul si et seulement si l’un au moins de ses facteurs est nul.</p>')
        + EX('Deux solutions', '<p>(2x − 6)(x + 5) = 0 équivaut à 2x − 6 = 0 ou x + 5 = 0, soit x = 3 ou x = −5.</p>')
        + '<p>On factorise souvent d’abord : x² − 4x = 0 s’écrit x(x − 4) = 0, ce qui donne x = 0 ou x = 4.</p>'),
      ('L’équation x² = k', '<p>Si k &gt; 0, l’équation x² = k a deux solutions : √k et −√k. Si k = 0, la seule solution est 0. Si k &lt; 0, il n’y a pas de solution, car un carré est toujours positif ou nul.</p>'
        + EX('Un exemple', '<p>3x² = 75 donne x² = 25, donc x = 5 ou x = −5.</p>')),
      ('Résoudre une inéquation', '<p>On résout comme une équation, avec une règle supplémentaire : <strong>multiplier ou diviser par un nombre négatif change le sens de l’inégalité</strong>.</p>'
        + EX('Un changement de sens', '<p>−2x + 1 &lt; 7 donne −2x &lt; 6, puis x &gt; −3 (on a divisé par −2). Les solutions sont les nombres strictement supérieurs à −3.</p>')
        + W('Vérifier avec une valeur', '<p>Teste un nombre : x = 0 donne −2 × 0 + 1 = 1, qui est bien inférieur à 7. 0 est supérieur à −3 : la réponse est cohérente.</p>')),
      ('Mettre un problème en équation', MTH('<p>1. Choisir l’inconnue et préciser son unité. 2. Traduire l’énoncé par une équation. 3. Résoudre. 4. Vérifier et conclure par une phrase.</p>')
        + EX('Un rectangle', '<p>La longueur dépasse la largeur x de 5 cm et le périmètre vaut 58 cm : 2(x + x + 5) = 58, soit 4x + 10 = 58, donc x = 12. Le rectangle mesure 12 cm sur 17 cm.</p>')),
    ],
    quiz1=(1, 'Une équation', 'Quelle est la solution de 4x + 7 = 3 ?', ['x = −1', 'x = 1', 'x = 2,5'], 'a', 'Retire 7 aux deux membres, puis divise par 4.', '4x = 3 − 7 = −4, donc x = −1.'),
    quiz2=(3, 'Le sens de l’inégalité', 'Quelles sont les solutions de −3x &gt; 12 ?', ['x &gt; −4', 'x &lt; −4', 'x &gt; 4'], 'b', 'On divise par −3, un nombre négatif.', 'Diviser par −3 change le sens : x &lt; −4.'),
    check=('Résous (x − 2)(3x + 9) = 0.', 'x − 2 = 0 donne x = 2 ; 3x + 9 = 0 donne x = −3. Les solutions sont 2 et −3.'),
    recap='Même opération sur les deux membres. Produit nul : un facteur au moins est nul. x² = k a deux solutions si k > 0. Diviser une inégalité par un négatif change son sens. Toujours vérifier.'),

  dict(slug='3-proportionnalite', title='Proportionnalité et pourcentages', domain='fonctions',
    lead='Reconnaître une situation de proportionnalité et calculer avec des pourcentages, des ratios et des échelles.',
    card='Quatrième proportionnelle, pourcentages, évolutions, ratios et échelles.',
    ex_card='Prix unitaires, pourcentages, coefficients, ratios et échelles.',
    keywords='proportionnalité pourcentage coefficient multiplicateur ratio échelle évolution quatrième proportionnelle',
    objectives='Reconnaître et utiliser une situation de proportionnalité, calculer et appliquer un pourcentage, passer d’une évolution en pourcentage à un coefficient multiplicateur, partager selon un ratio et utiliser une échelle.',
    steps=['Vérifie que la situation est proportionnelle.', 'Passe par l’unité ou par un coefficient.', 'Contrôle l’ordre de grandeur et l’unité du résultat.'],
    sections=[
      ('Reconnaître la proportionnalité', D('<p>Deux grandeurs sont <strong>proportionnelles</strong> si l’on obtient les valeurs de l’une en multipliant celles de l’autre par un même nombre, le coefficient de proportionnalité.</p>')
        + '<p>Graphiquement, une situation de proportionnalité est représentée par des points alignés avec l’origine du repère.</p>'
        + EX('Le prix des pommes', '<p>4 kg coûtent 9,40 €. Un kilogramme coûte 9,40 ÷ 4 = 2,35 €, et 7 kg coûtent 2,35 × 7 = 16,45 €.</p>')),
      ('Pourcentages', F('Pourcentage = partie ÷ total × 100')
        + '<p>Prendre t % d’une quantité revient à la multiplier par t/100. Ainsi, 15 % de 80 € valent 0,15 × 80 = 12 €.</p>'
        + EX('Une proportion', '<p>7 nageurs sur 25 adhérents : 7 ÷ 25 × 100 = 28 %.</p>')),
      ('Évolutions et coefficient multiplicateur', F('Hausse de t % : × (1 + t/100)    Baisse de t % : × (1 − t/100)')
        + EX('Une baisse puis une valeur initiale', '<p>Un prix de 80 € baisse de 15 % : 80 × 0,85 = 68 €.</p><p>Après une hausse de 20 %, un prix vaut 72 € : le prix initial est 72 ÷ 1,2 = 60 €.</p>')
        + W('Pas de pourcentage à l’envers', '<p>Retirer 20 % à 72 € donne 57,60 €, pas 60 € : pour revenir en arrière, on divise par le coefficient.</p>')),
      ('Ratios', D('<p>Partager une quantité dans le <strong>ratio</strong> a : b, c’est la découper en a + b parts égales et en donner a à l’un et b à l’autre.</p>')
        + EX('Un partage', '<p>150 € dans le ratio 2 : 3 : 5 parts de 30 €, soit 60 € et 90 €.</p>')),
      ('Échelles', '<p>Sur une carte à l’échelle 1/25 000, les longueurs réelles sont 25 000 fois plus grandes : 1 cm sur la carte représente 25 000 cm, soit 250 m.</p>'
        + EX('Une distance', '<p>4,5 cm sur la carte : 4,5 × 25 000 = 112 500 cm = 1 125 m = 1,125 km.</p>')),
    ],
    quiz1=(2, 'Un coefficient', 'Par quel nombre multiplie-t-on un prix qui augmente de 8 % ?', ['0,08', '1,08', '0,92'], 'b', 'On ajoute 8 % du prix au prix lui-même.', '1 + 8/100 = 1,08.'),
    quiz2=(3, 'Un ratio', 'On partage 60 bonbons dans le ratio 1 : 3. Combien reçoit le second ?', ['20', '45', '15'], 'b', 'Compte d’abord le nombre de parts : 1 + 3.', '4 parts de 15 bonbons : le second en reçoit 3 × 15 = 45.'),
    check=('Un vélo coûte 240 € après une remise de 20 %. Quel était son prix avant la remise ?', 'Le coefficient vaut 0,8 : 240 ÷ 0,8 = 300 €.'),
    recap='Proportionnalité : un même coefficient. Évolution de t % : coefficient 1 ± t/100. Pour retrouver une valeur initiale, diviser par le coefficient. Ratio a : b : a + b parts égales.'),

  dict(slug='3-fonctions', title='Notion de fonction', domain='fonctions',
    lead='Passer d’une formule à un tableau et à un graphique, et distinguer image et antécédent.',
    card='Images, antécédents, tableaux de valeurs et courbes.',
    ex_card='Images, antécédents, tableaux, appartenance à une courbe et contextes.',
    keywords='fonction image antécédent tableau de valeurs courbe représentation graphique',
    objectives='Comprendre qu’une fonction associe un unique nombre à chaque nombre, calculer une image, déterminer un antécédent par le calcul, dans un tableau ou sur un graphique, et utiliser une fonction pour modéliser une situation.',
    steps=['Identifie ce qui est donné : x ou f(x).', 'Calcule (image) ou résous une équation (antécédent).', 'Interprète le résultat dans le contexte.'],
    sections=[
      ('Image et antécédent', D('<p>Une <strong>fonction</strong> f associe à chaque nombre x un unique nombre noté f(x), appelé <strong>image</strong> de x. Si f(a) = b, on dit que a est un <strong>antécédent</strong> de b.</p>')
        + '<p>On note f : x ↦ f(x). Un nombre a exactement une image, mais il peut avoir zéro, un ou plusieurs antécédents.</p>'
        + EX('Avec une formule', '<p>f(x) = 2x² − 3x + 1 : f(3) = 2 × 9 − 9 + 1 = 10 et f(−2) = 2 × 4 + 6 + 1 = 15.</p>')),
      ('Tableau de valeurs', '<p>Un tableau de valeurs donne quelques images. On lit une image sur la deuxième ligne, sous la valeur de x, et un antécédent sur la première ligne, au-dessus de la valeur de f(x).</p>'
        + '<div class="table-scroll" tabindex="0" role="region" aria-label="Exemple de tableau de valeurs"><table><caption>Exemple : f(x) = x² − 1</caption><thead><tr><th scope="col">x</th><th scope="col">−2</th><th scope="col">−1</th><th scope="col">0</th><th scope="col">1</th><th scope="col">2</th></tr></thead><tbody><tr><th scope="row">f(x)</th><td>3</td><td>0</td><td>−1</td><td>0</td><td>3</td></tr></tbody></table></div>'
        + '<p>Ici, 3 a deux antécédents dans le tableau : −2 et 2.</p>'),
      ('Représentation graphique', D('<p>La <strong>courbe</strong> de f est l’ensemble des points de coordonnées (x ; f(x)). Un point M(a ; b) appartient à la courbe si et seulement si f(a) = b.</p>')
        + fig('Lecture graphique : l’image de 2 est 3', '<path d="M30 170H300M50 190V15" stroke-width="1.5"/><path d="M40 180 Q120 175 170 90 T260 20" stroke-width="3"/><path d="M190 170V68H50" stroke-dasharray="5 5" stroke-width="1.5"/>' + txt(190, 188, '2') + txt(38, 72, '3') + txt(295, 160, 'x') + txt(62, 22, 'y'))
        + MTH('<p>Image de a : on part de a sur l’axe des abscisses, on monte jusqu’à la courbe et on lit l’ordonnée. Antécédents de b : on part de b sur l’axe des ordonnées, on cherche les points de la courbe à cette hauteur et on lit leurs abscisses.</p>')),
      ('Calculer un antécédent', '<p>Chercher les antécédents de b par f, c’est résoudre l’équation f(x) = b.</p>'
        + EX('Deux cas', '<p>g(x) = 4x − 5 : l’antécédent de 7 vérifie 4x − 5 = 7, donc x = 3.</p><p>h(x) = x² − 16 : les antécédents de 0 vérifient x² = 16, donc x = 4 ou x = −4.</p>')),
      ('Modéliser une situation', '<p>Une fonction traduit la dépendance entre deux grandeurs : le prix d’une course en fonction de la distance, la hauteur d’une balle en fonction du temps… On précise toujours ce que représentent x et f(x), avec leurs unités.</p>'
        + EX('Un taxi', '<p>f(x) = 4 + 1,5x donne le prix en euros d’une course de x km. f(12) = 22 : 12 km coûtent 22 €.</p>')),
    ],
    quiz1=(1, 'Image ou antécédent ?', 'On sait que f(5) = 2. Quelle phrase est correcte ?', ['2 est l’image de 5', '5 est l’image de 2', '2 est un antécédent de 5'], 'a', 'L’image est le résultat obtenu à partir de x.', 'f(5) = 2 signifie que l’image de 5 est 2, et que 5 est un antécédent de 2.'),
    quiz2=(2, 'Un point de la courbe', 'f(x) = x² + 1. Quel point appartient à la courbe de f ?', ['(2 ; 4)', '(2 ; 5)', '(5 ; 2)'], 'b', 'Calcule f(2).', 'f(2) = 4 + 1 = 5, donc le point (2 ; 5) appartient à la courbe.'),
    check=('f(x) = 3x − 2. Calcule f(−1), puis l’antécédent de 10.', 'f(−1) = −3 − 2 = −5. 3x − 2 = 10 donne 3x = 12, donc x = 4.'),
    recap='Image : on remplace x par la valeur. Antécédent : on résout f(x) = b. Sur un graphique, l’image se lit sur l’axe des ordonnées et l’antécédent sur l’axe des abscisses.'),

  dict(slug='3-fonctions-affines', title='Fonctions linéaires et affines', domain='fonctions',
    lead='Reconnaître une fonction affine, déterminer son expression et comparer des modèles.',
    card='Coefficient directeur, ordonnée à l’origine, droites et comparaisons de tarifs.',
    ex_card='Expressions, deux points, pourcentages, intersections et tarifs.',
    keywords='fonction affine linéaire coefficient directeur ordonnée à l’origine droite proportionnalité tarif',
    objectives='Reconnaître une fonction linéaire ou affine, interpréter ses coefficients, déterminer son expression à partir de deux images, lire son sens de variation et utiliser deux droites pour comparer des situations.',
    steps=['Repère la forme ax + b et les valeurs de a et b.', 'Utilise deux images connues pour trouver a, puis b.', 'Interprète a (variation) et b (valeur de départ).'],
    sections=[
      ('Fonctions linéaires', D('<p>Une fonction <strong>linéaire</strong> s’écrit f(x) = ax. Elle modélise une situation de proportionnalité, de coefficient a. Sa représentation graphique est une droite qui passe par l’origine.</p>')
        + EX('Une hausse en pourcentage', '<p>Une hausse de 20 % est modélisée par f(x) = 1,2x : un prix de 45 € devient 54 €.</p>')),
      ('Fonctions affines', D('<p>Une fonction <strong>affine</strong> s’écrit f(x) = ax + b. Sa représentation graphique est une droite : a est son <strong>coefficient directeur</strong> et b son <strong>ordonnée à l’origine</strong>.</p>')
        + fig('Droite d’équation y = 2x + 1 : quand x augmente de 1, y augmente de 2', '<path d="M30 170H300M60 190V15" stroke-width="1.5"/><path d="M40 190L210 20" stroke-width="3"/><path d="M110 120H140V90" stroke-dasharray="5 5" stroke-width="1.5"/>' + txt(125, 136, '+1') + txt(162, 110, '+2') + txt(48, 156, '1') + txt(295, 160, 'x') + txt(72, 22, 'y'))
        + '<p>Si a &gt; 0, la fonction est croissante ; si a &lt; 0, elle est décroissante ; si a = 0, elle est constante. Une fonction linéaire est une fonction affine avec b = 0.</p>'),
      ('Déterminer une expression', F('a = (f(x₂) − f(x₁)) ÷ (x₂ − x₁)')
        + MTH('<p>On calcule a avec deux images, puis on trouve b en remplaçant x par une valeur connue : b = f(x₁) − a × x₁.</p>')
        + EX('Deux images', '<p>g(1) = 1 et g(4) = 10 : a = (10 − 1) ÷ (4 − 1) = 3, puis b = 1 − 3 × 1 = −2. Donc g(x) = 3x − 2.</p>')),
      ('Comparer deux modèles', '<p>Deux droites d’équations y = ax + b et y = cx + d (avec a ≠ c) se coupent en un point dont l’abscisse est la solution de ax + b = cx + d.</p>'
        + EX('Deux tarifs de piscine', '<p>Tarif A : 8 € l’entrée, soit f(x) = 8x. Tarif B : 35 € d’abonnement et 5 € l’entrée, soit g(x) = 35 + 5x. g(x) &lt; f(x) équivaut à 35 &lt; 3x, soit x &gt; 11,67 : le tarif B devient plus avantageux à partir de 12 entrées.</p>')
        + W('Un nombre entier', '<p>Un nombre d’entrées est un entier : on conclut avec le premier entier qui convient, pas avec la valeur décimale.</p>')),
    ],
    quiz1=(1, 'Lire les coefficients', 'f(x) = −2x + 5. Que vaut l’ordonnée à l’origine ?', ['−2', '5', '3'], 'b', 'C’est l’image de 0.', 'f(0) = 5 : la droite coupe l’axe des ordonnées au point (0 ; 5).'),
    quiz2=(2, 'Sens de variation', 'Quelle fonction est décroissante ?', ['f(x) = 3x − 7', 'g(x) = −0,5x + 4', 'h(x) = 2x'], 'b', 'Regarde le signe du coefficient de x.', 'Le coefficient −0,5 est négatif : g est décroissante.'),
    check=('h est affine avec h(0) = 4 et h(2) = 10. Donne son expression.', 'b = h(0) = 4 et a = (10 − 4) ÷ (2 − 0) = 3, donc h(x) = 3x + 4.'),
    recap='Linéaire : f(x) = ax, droite par l’origine, proportionnalité. Affine : f(x) = ax + b ; a se calcule avec deux images, b est l’image de 0. Le signe de a donne le sens de variation.'),

  dict(slug='3-statistiques', title='Statistiques', domain='statistiques',
    lead='Résumer une série par sa moyenne, sa médiane et son étendue, et comparer des séries.',
    card='Moyenne, moyenne pondérée, médiane, étendue et fréquences.',
    ex_card='Moyennes, médianes, fréquences, notes manquantes et dispersion.',
    keywords='moyenne médiane étendue fréquence effectif série statistique dispersion pondérée',
    objectives='Calculer une moyenne simple ou pondérée, déterminer une médiane, calculer une étendue et une fréquence, et utiliser ces indicateurs pour comparer deux séries.',
    steps=['Range les données ou complète le tableau des effectifs.', 'Calcule l’indicateur demandé avec sa formule.', 'Interprète le résultat dans le contexte, avec son unité.'],
    sections=[
      ('Moyenne', F('Moyenne = somme des valeurs ÷ effectif total')
        + '<p>Avec un tableau d’effectifs, chaque valeur compte autant de fois que son effectif : c’est une <strong>moyenne pondérée</strong>.</p>'
        + EX('Frères et sœurs', '<p>Valeurs 0, 1, 2, 3 avec les effectifs 3, 5, 8, 4 : (0 × 3 + 1 × 5 + 2 × 8 + 3 × 4) ÷ 20 = 33 ÷ 20 = 1,65.</p>')),
      ('Médiane', D('<p>La <strong>médiane</strong> partage la série <strong>rangée dans l’ordre croissant</strong> en deux groupes de même effectif : au moins la moitié des valeurs lui sont inférieures ou égales, au moins la moitié lui sont supérieures ou égales.</p>')
        + MTH('<p>Pour n valeurs rangées : si n est impair, la médiane est la valeur de rang (n + 1)/2 ; si n est pair, c’est la moyenne des valeurs de rangs n/2 et n/2 + 1.</p>')
        + EX('Huit temps de trajet', '<p>2 ; 3 ; 4 ; 5 ; 6 ; 7 ; 8 ; 9 : la médiane est (5 + 6) ÷ 2 = 5,5 min.</p>')
        + W('Ranger d’abord', '<p>Prendre la valeur du milieu de la liste sans la ranger donne en général un résultat faux.</p>')),
      ('Étendue et dispersion', F('Étendue = plus grande valeur − plus petite valeur')
        + '<p>L’étendue mesure la <strong>dispersion</strong> : plus elle est faible, plus les valeurs sont regroupées. Deux séries peuvent avoir la même moyenne et des étendues très différentes.</p>'
        + EX('Deux groupes', '<p>A : 10 ; 11 ; 12 ; 12 ; 13 (étendue 3). B : 6 ; 9 ; 10 ; 15 ; 18 (étendue 12). Les résultats du groupe A sont plus homogènes.</p>')),
      ('Fréquences', F('Fréquence = effectif de la valeur ÷ effectif total')
        + '<p>Une fréquence est un nombre entre 0 et 1, souvent exprimé en pourcentage. La somme des fréquences de toutes les valeurs vaut 1, soit 100 %.</p>'),
      ('Raisonner sur les sommes', '<p>La moyenne permet de retrouver la somme des valeurs : somme = moyenne × effectif. C’est utile pour une note manquante.</p>'
        + EX('Une note à obtenir', '<p>4 notes de moyenne 11 : somme 44. Pour une moyenne de 12 avec 5 notes, il faut une somme de 60, donc une note de 16.</p>')),
    ],
    quiz1=(1, 'Médiane', 'Quelle est la médiane de la série 3 ; 9 ; 4 ; 7 ; 5 ?', ['4', '5', '7'], 'b', 'Range d’abord les valeurs.', 'Série rangée : 3 ; 4 ; 5 ; 7 ; 9. La valeur du milieu est 5.'),
    quiz2=(3, 'Fréquence', 'Dans une classe de 25 élèves, 10 font du sport. Quelle est la fréquence en pourcentage ?', ['10 %', '40 %', '25 %'], 'b', 'Calcule 10 ÷ 25.', '10 ÷ 25 = 0,4, soit 40 %.'),
    check=('Série : 12 ; 15 ; 8 ; 15 ; 10 ; 12. Calcule la moyenne, la médiane et l’étendue.', 'Somme 72, moyenne 72 ÷ 6 = 12. Série rangée : 8 ; 10 ; 12 ; 12 ; 15 ; 15, médiane (12 + 12) ÷ 2 = 12. Étendue : 15 − 8 = 7.'),
    recap='Moyenne : somme ÷ effectif (pondérée avec un tableau). Médiane : série rangée, valeur centrale. Étendue : max − min. Fréquence : effectif ÷ total.'),

  dict(slug='3-probabilites', title='Probabilités', domain='probabilites',
    lead='Calculer une probabilité, utiliser l’événement contraire et enchaîner deux épreuves.',
    card='Équiprobabilité, événement contraire, arbres et fréquences.',
    ex_card='Urnes, dés, tirages avec et sans remise, fréquences et roues.',
    keywords='probabilité équiprobable événement contraire arbre tirage remise fréquence issue',
    objectives='Calculer la probabilité d’un événement dans une situation d’équiprobabilité, utiliser l’événement contraire, représenter deux épreuves successives par un arbre et relier fréquence observée et probabilité.',
    steps=['Décris les issues possibles et vérifie si elles sont équiprobables.', 'Compte les issues favorables ou utilise un arbre.', 'Contrôle que la probabilité est comprise entre 0 et 1.'],
    sections=[
      ('Vocabulaire', D('<p>Une <strong>expérience aléatoire</strong> a plusieurs <strong>issues</strong> possibles, sans qu’on puisse prévoir laquelle se produira. Un <strong>événement</strong> est un ensemble d’issues.</p>')
        + '<p>La probabilité d’un événement est un nombre entre 0 (événement impossible) et 1 (événement certain). La somme des probabilités de toutes les issues vaut 1.</p>'),
      ('Équiprobabilité', F('P(A) = nombre d’issues favorables ÷ nombre total d’issues')
        + '<p>Cette formule n’est valable que si toutes les issues ont la même probabilité : dé équilibré, boules indiscernables au toucher, tirage au hasard…</p>'
        + EX('Une urne', '<p>5 rouges, 3 bleues, 2 vertes : P(rouge) = 5/10 = 1/2.</p>')),
      ('Événement contraire', F('P(non A) = 1 − P(A)')
        + EX('Ne pas tirer une bleue', '<p>Dans l’urne précédente, P(non bleue) = 1 − 3/10 = 7/10.</p>')
        + '<p>L’événement contraire est très utile pour « au moins un » : le contraire de « au moins un rouge » est « aucun rouge ».</p>'),
      ('Deux épreuves successives', '<p>On représente deux épreuves par un <strong>arbre</strong>. La probabilité d’un chemin est le produit des probabilités inscrites sur ses branches.</p>'
        + fig('Arbre de deux tirages avec remise dans un sac de 3 rouges et 2 bleus', '<path d="M20 100L110 45M20 100L110 155M130 45L220 20M130 45L220 70M130 155L220 130M130 155L220 180" stroke-width="1.5"/>' + txt(118, 50, 'R') + txt(118, 160, 'B') + txt(232, 25, 'R') + txt(232, 75, 'B') + txt(232, 135, 'R') + txt(232, 185, 'B') + txt(55, 62, '3/5') + txt(55, 145, '2/5') + txt(170, 25, '3/5') + txt(170, 72, '2/5') + txt(170, 135, '3/5') + txt(170, 180, '2/5') + txt(290, 25, '9/25'), 320, 200)
        + EX('Avec et sans remise', '<p>Avec remise : P(R puis R) = 3/5 × 3/5 = 9/25. Sans remise, il ne reste que 4 jetons au second tirage : P(R puis R) = 3/5 × 2/4 = 3/10.</p>')),
      ('Fréquence et probabilité', '<p>Quand on répète un grand nombre de fois une expérience, la <strong>fréquence</strong> observée d’un événement se rapproche en général de sa probabilité. Sur un petit nombre d’essais, l’écart peut être important.</p>'
        + EX('300 lancers', '<p>Le 6 sort 56 fois sur 300 : fréquence 56/300 ≈ 0,19, proche de la probabilité 1/6 ≈ 0,17.</p>')),
    ],
    quiz1=(2, 'Événement contraire', 'P(A) = 0,35. Que vaut P(non A) ?', ['0,35', '0,65', '1,35'], 'b', 'Les deux probabilités ont pour somme 1.', 'P(non A) = 1 − 0,35 = 0,65.'),
    quiz2=(3, 'Un arbre', 'On lance deux fois une pièce équilibrée. Quelle est la probabilité d’obtenir deux fois pile ?', ['1/2', '1/4', '1/3'], 'b', 'Multiplie les probabilités le long du chemin.', '1/2 × 1/2 = 1/4.'),
    check=('On tire une carte au hasard parmi 10 cartes numérotées de 1 à 10. Quelle est la probabilité d’obtenir un nombre premier ?', 'Les nombres premiers sont 2, 3, 5 et 7 : 4 issues favorables sur 10, soit 4/10 = 2/5.'),
    recap='Équiprobabilité : favorables ÷ possibles. P(non A) = 1 − P(A). Sur un arbre, on multiplie le long d’un chemin. La fréquence se rapproche de la probabilité sur un grand nombre d’essais.'),

  dict(slug='3-grandeurs', title='Grandeurs, aires et volumes', domain='geometrie',
    lead='Calculer avec des grandeurs composées, convertir des unités, calculer des volumes et se repérer dans l’espace.',
    card='Vitesses, conversions, volumes, sections de solides, latitude et longitude.',
    ex_card='Vitesses, conversions, pavés, cylindres, pyramides et boules.',
    keywords='vitesse grandeur composée conversion volume litre cylindre pyramide cône boule aire section latitude longitude sphère',
    objectives='Calculer et convertir une vitesse, utiliser les unités de volume et de contenance, et calculer les volumes d’un pavé, d’un cylindre, d’une pyramide, d’un cône et d’une boule.',
    steps=['Note les unités de chaque donnée.', 'Convertis avant de calculer si les unités ne sont pas compatibles.', 'Écris le résultat avec son unité et un arrondi adapté.'],
    sections=[
      ('Vitesse moyenne', F('v = d ÷ t   d = v × t   t = d ÷ v')
        + '<p>Une vitesse est une <strong>grandeur quotient</strong>. En km/h, la distance est en kilomètres et la durée en heures.</p>'
        + EX('Un car', '<p>30 km en 25 min : 25 min = 25/60 h, donc v = 30 × 60 ÷ 25 = 72 km/h.</p>')
        + W('Les heures ne sont pas décimales', '<p>1 h 30 min = 1,5 h, mais 1 h 20 min ne vaut pas 1,2 h : 20 min = 20/60 h ≈ 0,33 h.</p>')),
      ('Convertir une vitesse', '<p>1 km/h = 1 000 m ÷ 3 600 s, donc on divise par 3,6 pour passer des km/h aux m/s, et on multiplie par 3,6 pour l’inverse. 90 km/h = 25 m/s.</p>'),
      ('Volumes et contenances', F('1 dm³ = 1 L   1 cm³ = 1 mL   1 m³ = 1 000 L')
        + '<p>Volume d’un pavé droit : longueur × largeur × hauteur. Volume d’un cylindre de rayon r et de hauteur h : π × r² × h.</p>'
        + EX('Un aquarium', '<p>40 cm × 25 cm × 30 cm = 30 000 cm³ = 30 dm³ = 30 L.</p>')),
      ('Pyramides et cônes', F('V = aire de la base × hauteur ÷ 3')
        + EX('Une pyramide', '<p>Base carrée de 6 cm de côté et hauteur 10 cm : V = 36 × 10 ÷ 3 = 120 cm³.</p>')
        + '<p>Un cône de rayon r et de hauteur h a pour volume π × r² × h ÷ 3, soit le tiers du cylindre de même base et de même hauteur.</p>'),
      ('La boule', F('Aire de la sphère = 4 × π × r²   Volume de la boule = 4/3 × π × r³')
        + EX('Une boule dans un cube', '<p>Rayon 5 cm : V = 4/3 × π × 125 ≈ 523,6 cm³. Le cube qui la contient exactement a pour arête 10 cm et un volume de 1 000 cm³.</p>')),
      ('Sections et repérage dans l’espace', '<p>Couper un solide par un plan donne une <strong>section plane</strong>. La section d’un pavé droit par un plan parallèle à une face est un rectangle de mêmes dimensions que cette face ; celle d’un cylindre par un plan parallèle à la base est un disque de même rayon. La section d’une pyramide ou d’un cône par un plan parallèle à la base est une <strong>réduction</strong> de la base.</p>'
        + '<p>La section d’une sphère par un plan est un cercle ; lorsque le plan passe par le centre, on obtient un <strong>grand cercle</strong>, de même rayon que la sphère.</p>'
        + D('<p>Dans un pavé droit, on repère un point par son <strong>abscisse</strong>, son <strong>ordonnée</strong> et son <strong>altitude</strong>. Sur la Terre, assimilée à une sphère, on repère un lieu par sa <strong>latitude</strong> (de 0° à 90° Nord ou Sud, mesurée depuis l’équateur) et sa <strong>longitude</strong> (de 0° à 180° Est ou Ouest, mesurée depuis le méridien de Greenwich).</p>')
        + EX('Une section de cône', '<p>Un cône de hauteur 12 cm a une base de rayon 6 cm. On le coupe parallèlement à la base, à 4 cm du sommet : le coefficient de réduction vaut 4/12 = 1/3, donc la section est un disque de rayon 2 cm.</p>')),
    ],
    quiz1=(1, 'Une conversion', 'Combien vaut 72 km/h en m/s ?', ['20 m/s', '259,2 m/s', '7,2 m/s'], 'a', 'Divise par 3,6.', '72 ÷ 3,6 = 20 m/s.'),
    quiz2=(3, 'Pyramide ou prisme ?', 'Un prisme et une pyramide ont la même base et la même hauteur. Le volume de la pyramide est…', ['le même', 'trois fois plus petit', 'deux fois plus petit'], 'b', 'Pense à la division par 3 de la formule.', 'Le volume de la pyramide est le tiers de celui du prisme.'),
    check=('Une piscine pavé droit mesure 8 m × 4 m × 1,5 m. Quelle est sa contenance en litres ?', 'V = 8 × 4 × 1,5 = 48 m³, soit 48 000 L.'),
    recap='v = d ÷ t, avec des unités cohérentes ; ÷ 3,6 pour passer des km/h aux m/s. 1 dm³ = 1 L. Pyramide et cône : aire de base × hauteur ÷ 3. Boule : 4/3 × π × r³.'),

  dict(slug='3-pythagore', title='Théorème de Pythagore', domain='geometrie',
    lead='Calculer une longueur dans un triangle rectangle et démontrer qu’un triangle est rectangle ou non.',
    card='Théorème, réciproque, contraposée et distances dans un repère.',
    ex_card='Hypoténuses, côtés, réciproque, échelles, écrans et repères.',
    keywords='Pythagore hypoténuse triangle rectangle réciproque carré racine distance repère',
    objectives='Utiliser le théorème de Pythagore pour calculer une longueur, utiliser sa réciproque ou sa contraposée pour savoir si un triangle est rectangle, et calculer une distance dans un repère.',
    steps=['Repère l’angle droit et l’hypoténuse.', 'Écris l’égalité de Pythagore avec les noms des côtés.', 'Calcule, puis prends la racine carrée et arrondis.'],
    sections=[
      ('Le théorème', D('<p>Si un triangle ABC est rectangle en A, alors BC² = AB² + AC². Le côté [BC], opposé à l’angle droit, est l’<strong>hypoténuse</strong> : c’est le plus grand côté.</p>')
        + fig('Triangle ABC rectangle en A, d’hypoténuse [BC]', '<path d="M60 160L60 40L260 160Z"/><path d="M60 145H75V160" stroke-width="1.5"/>' + txt(48, 175, 'A') + txt(50, 36, 'B') + txt(272, 175, 'C') + txt(40, 105, '6') + txt(160, 180, '8') + txt(175, 92, '?'))
        + EX('Calculer l’hypoténuse', '<p>AB = 6 cm et AC = 8 cm : BC² = 36 + 64 = 100, donc BC = √100 = 10 cm.</p>')),
      ('Calculer un côté de l’angle droit', '<p>On écrit toujours l’égalité avec l’hypoténuse seule dans un membre, puis on isole le carré cherché.</p>'
        + EX('Un côté', '<p>EFG rectangle en E, EF = 5 et FG = 13 : FG² = EF² + EG², donc EG² = 169 − 25 = 144 et EG = 12.</p>')
        + W('Soustraire, pas additionner', '<p>Si l’on cherche un côté de l’angle droit, il est plus petit que l’hypoténuse : on soustrait des carrés.</p>')),
      ('Réciproque et contraposée', '<p>On compare le carré du plus grand côté à la somme des carrés des deux autres :</p>'
        + '<ul><li>s’ils sont <strong>égaux</strong>, le triangle est rectangle (réciproque du théorème) ;</li><li>s’ils sont <strong>différents</strong>, le triangle n’est pas rectangle (contraposée).</li></ul>'
        + EX('Deux triangles', '<p>Côtés 6, 8, 10 : 10² = 100 et 6² + 8² = 100, le triangle est rectangle. Côtés 6, 8, 11 : 121 ≠ 100, il ne l’est pas.</p>')),
      ('Distance dans un repère', '<p>Dans un repère orthonormé, AB² = (x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)² : les écarts horizontal et vertical sont les côtés d’un triangle rectangle d’hypoténuse [AB].</p>'
        + EX('Deux points', '<p>A(1 ; 2) et B(4 ; 6) : AB² = 3² + 4² = 25, donc AB = 5.</p>')),
      ('Problèmes concrets', '<p>Échelle contre un mur, diagonale d’un écran, rampe… On repère un angle droit dans la situation, on fait un schéma codé, puis on applique le théorème.</p>'
        + EX('Une échelle', '<p>Échelle de 5 m, pied à 1,4 m du mur : h² = 25 − 1,96 = 23,04, donc h = 4,8 m.</p>')),
    ],
    quiz1=(1, 'L’hypoténuse', 'ABC est rectangle en B. Quel côté est l’hypoténuse ?', ['[AB]', '[AC]', '[BC]'], 'b', 'L’hypoténuse est opposée à l’angle droit.', 'L’angle droit est en B : l’hypoténuse est le côté qui ne contient pas B, [AC].'),
    quiz2=(3, 'Rectangle ou non ?', 'Un triangle a pour côtés 5, 12 et 13. Est-il rectangle ?', ['Oui', 'Non', 'On ne peut pas savoir'], 'a', 'Compare 13² et 5² + 12².', '13² = 169 et 5² + 12² = 25 + 144 = 169 : le triangle est rectangle.'),
    check=('Un rectangle mesure 9 cm sur 12 cm. Calcule la longueur de sa diagonale.', 'd² = 9² + 12² = 81 + 144 = 225, donc d = 15 cm.'),
    recap='Triangle rectangle : hypoténuse² = somme des carrés des deux autres côtés. Pour savoir si un triangle est rectangle, comparer le carré du plus grand côté à la somme des deux autres carrés.'),

  dict(slug='3-thales', title='Théorème de Thalès', domain='geometrie',
    lead='Calculer des longueurs avec des droites parallèles, démontrer un parallélisme et agrandir une figure.',
    card='Configurations, réciproque, agrandissements, réductions et triangles semblables.',
    ex_card='Triangles, papillons, réciproque, ombres, aires et triangles semblables.',
    keywords='Thalès parallèles rapport proportionnel agrandissement réduction triangles semblables papillon',
    objectives='Utiliser le théorème de Thalès dans les deux configurations, utiliser sa réciproque pour démontrer un parallélisme, et relier agrandissement, réduction et triangles semblables.',
    steps=['Vérifie l’alignement des points et le parallélisme.', 'Écris les trois rapports égaux, petit triangle au numérateur.', 'Choisis deux rapports avec une seule inconnue et calcule.'],
    sections=[
      ('Le théorème de Thalès', D('<p>Si les points A, M, B et A, N, C sont alignés et si les droites (MN) et (BC) sont parallèles, alors AM/AB = AN/AC = MN/BC.</p>')
        + fig('Configuration de Thalès : (MN) parallèle à (BC)', '<path d="M40 170L160 30L290 170Z"/><path d="M88 114L208 114" stroke-width="2.5"/>' + txt(28, 182, 'B') + txt(160, 22, 'A') + txt(300, 182, 'C') + txt(76, 112, 'M') + txt(222, 112, 'N'))
        + EX('Calculer deux longueurs', '<p>AM = 3, AB = 5, AN = 4 et BC = 7 : MN = 7 × 3/5 = 4,2 et AC = 4 × 5/3 ≈ 6,67.</p>')),
      ('La configuration « papillon »', '<p>Le théorème s’applique aussi quand les deux triangles sont opposés par le sommet A : B et M sont de part et d’autre de A, ainsi que C et N. Les rapports s’écrivent de la même façon.</p>'
        + fig('Configuration papillon : triangles opposés par le sommet A', '<path d="M30 40L160 110L270 170M40 170L160 110L285 40M30 40L40 170M270 170L285 40"/>' + txt(20, 36, 'B') + txt(28, 186, 'C') + txt(160, 135, 'A') + txt(282, 186, 'M') + txt(296, 36, 'N'))),
      ('La réciproque', '<p>Si les points A, M, B et A, N, C sont alignés <strong>dans le même ordre</strong> et si AM/AB = AN/AC, alors (MN) et (BC) sont parallèles. Si les rapports sont différents, les droites ne sont pas parallèles.</p>'
        + MTH('<p>Pour comparer deux fractions sans arrondi, on utilise les produits en croix : a/b = c/d équivaut à a × d = b × c.</p>')
        + EX('Un parallélisme', '<p>AM/AB = 3/5 et AN/AC = 6/10 = 3/5 : les droites sont parallèles.</p>')),
      ('Agrandissements et réductions', F('Longueurs × k   Aires × k²   Volumes × k³')
        + '<p>Si k &gt; 1, c’est un agrandissement ; si 0 &lt; k &lt; 1, c’est une réduction. Les angles sont conservés.</p>'
        + EX('Une figure agrandie', '<p>Une figure de 10 cm² agrandie à l’échelle 3 a une aire de 10 × 9 = 90 cm².</p>')),
      ('Triangles semblables', D('<p>Deux triangles sont <strong>semblables</strong> lorsque leurs angles sont deux à deux égaux. Leurs côtés homologues sont alors proportionnels : l’un est un agrandissement ou une réduction de l’autre.</p>')
        + EX('Mesurer avec une ombre', '<p>Un bâton de 1,5 m a une ombre de 1,2 m ; un arbre a une ombre de 9,6 m, soit 8 fois plus. L’arbre mesure 8 × 1,5 = 12 m.</p>')),
    ],
    quiz1=(1, 'Les rapports', 'Dans la configuration de Thalès, quel rapport est égal à AM/AB ?', ['AN/AC', 'AC/AN', 'MN/AB'], 'a', 'Les côtés du petit triangle sont au numérateur.', 'AM/AB = AN/AC = MN/BC.'),
    quiz2=(4, 'Les aires', 'Une figure est réduite de moitié (k = 0,5). Son aire est multipliée par…', ['0,5', '0,25', '2'], 'b', 'Les aires sont multipliées par k².', '0,5² = 0,25 : l’aire est divisée par 4.'),
    check=('(MN) // (BC), AM = 4, AB = 10 et BC = 15. Calcule MN.', 'MN/BC = AM/AB donne MN = 15 × 4/10 = 6.'),
    recap='Points alignés et droites parallèles : trois rapports égaux. Réciproque : rapports égaux et même ordre donnent le parallélisme. Échelle k : longueurs × k, aires × k², volumes × k³.'),

  dict(slug='3-trigonometrie', title='Trigonométrie', domain='geometrie',
    lead='Calculer une longueur ou un angle dans un triangle rectangle avec le cosinus, le sinus ou la tangente.',
    card='Cosinus, sinus, tangente, angles et hauteurs inaccessibles.',
    ex_card='Longueurs, angles, pentes de rampes et hauteurs inaccessibles.',
    keywords='cosinus sinus tangente angle triangle rectangle adjacent opposé hypoténuse pente',
    objectives='Nommer les côtés d’un triangle rectangle par rapport à un angle aigu, utiliser le cosinus, le sinus et la tangente pour calculer une longueur, et utiliser la calculatrice pour déterminer un angle.',
    steps=['Repère l’angle utilisé, l’hypoténuse, le côté opposé et le côté adjacent.', 'Choisis la formule qui relie les deux côtés utiles (CAH SOH TOA).', 'Calcule avec la calculatrice en degrés et arrondis.'],
    sections=[
      ('Nommer les côtés', '<p>Dans un triangle rectangle, pour un angle aigu donné : l’<strong>hypoténuse</strong> est opposée à l’angle droit, le côté <strong>opposé</strong> ne touche pas l’angle, le côté <strong>adjacent</strong> touche l’angle et n’est pas l’hypoténuse.</p>'
        + fig('Triangle ABC rectangle en B : côtés adjacent et opposé à l’angle en A', '<path d="M40 160L260 160L260 40Z"/><path d="M245 160V145H260" stroke-width="1.5"/><path d="M80 160A40 40 0 0 0 76 141" stroke-width="1.5"/>' + txt(28, 176, 'A') + txt(270, 176, 'B') + txt(270, 36, 'C') + txt(150, 180, 'adjacent') + txt(290, 105, 'opposé', 'start') + txt(130, 90, 'hypoténuse'))),
      ('Les trois formules', F('cos(angle) = adjacent ÷ hypoténuse<br>sin(angle) = opposé ÷ hypoténuse<br>tan(angle) = opposé ÷ adjacent')
        + '<p>Moyen mnémotechnique : CAH SOH TOA. Le cosinus et le sinus d’un angle aigu sont compris entre 0 et 1.</p>'),
      ('Calculer une longueur', MTH('<p>On écrit la formule avec les noms des côtés, puis on isole la longueur cherchée.</p>')
        + EX('Avec le cosinus', '<p>AC = 12 cm et l’angle en A mesure 35° : cos(35°) = AB/12, donc AB = 12 × cos(35°) ≈ 9,8 cm.</p>')
        + EX('Avec la tangente', '<p>RS = 8 cm et l’angle en R mesure 50° : ST = 8 × tan(50°) ≈ 9,5 cm.</p>')),
      ('Calculer un angle', '<p>On calcule d’abord le cosinus, le sinus ou la tangente de l’angle, puis on utilise la touche arccos (cos⁻¹), arcsin (sin⁻¹) ou arctan (tan⁻¹) de la calculatrice, réglée en degrés.</p>'
        + EX('Un angle', '<p>KL = 7 et KM = 10 (hypoténuse) : cos(K) = 0,7, donc K ≈ 46°.</p>')
        + W('Mode degrés', '<p>Si la calculatrice est en radians, cos(60) ne vaut pas 0,5 : vérifie le réglage avec cet exemple.</p>')),
      ('Hauteurs inaccessibles et pentes', '<p>La trigonométrie permet de mesurer sans accéder : hauteur d’un immeuble, largeur d’une rivière, inclinaison d’une rampe.</p>'
        + EX('Un immeuble', '<p>À 30 m du pied, on voit le sommet sous 40°, les yeux à 1,6 m du sol : h = 30 × tan(40°) + 1,6 ≈ 26,8 m.</p>')
        + '<p>Une pente de 8 % signifie un dénivelé de 8 m pour 100 m à l’horizontale : tan(α) = 0,08, soit α ≈ 4,6°. Une pente en pourcentage n’est pas un angle.</p>'),
    ],
    quiz1=(1, 'Choisir la formule', 'On connaît l’hypoténuse et on cherche le côté opposé à l’angle. Quelle formule utiliser ?', ['Le cosinus', 'Le sinus', 'La tangente'], 'b', 'SOH : sinus, opposé, hypoténuse.', 'sin(angle) = opposé ÷ hypoténuse.'),
    quiz2=(3, 'Une valeur impossible', 'Lequel de ces nombres ne peut pas être le cosinus d’un angle aigu ?', ['0,3', '0,95', '1,2'], 'c', 'L’adjacent est plus petit que l’hypoténuse.', 'Le cosinus d’un angle aigu est compris entre 0 et 1 : 1,2 est impossible.'),
    check=('DEF est rectangle en E, DE = 6 cm et EF = 6 cm. Que vaut l’angle EDF ?', 'tan(D) = EF/DE = 1, donc D = 45°. C’est cohérent : le triangle est rectangle et isocèle.'),
    recap='CAH SOH TOA dans un triangle rectangle. Écrire la formule avec les noms des côtés, isoler l’inconnue, calculer en degrés. Pour un angle, utiliser arccos, arcsin ou arctan.'),

  dict(slug='3-transformations', title='Transformations et homothéties', domain='geometrie',
    lead='Construire l’image d’une figure par une symétrie, une translation, une rotation ou une homothétie.',
    card='Symétries, translations, rotations, homothéties et effets sur les grandeurs.',
    ex_card='Homothéties, réductions de solides, translations, symétries et rotations.',
    keywords='transformation symétrie translation rotation homothétie rapport image agrandissement',
    objectives='Reconnaître et utiliser les symétries, translations et rotations, construire l’image d’une figure par une homothétie, et connaître l’effet d’une homothétie sur les longueurs, les aires et les volumes.',
    steps=['Identifie la transformation et ses éléments (centre, axe, vecteur, angle, rapport).', 'Construis ou calcule l’image d’un point à la fois.', 'Vérifie ce qui est conservé : longueurs, angles, alignements.'],
    sections=[
      ('Symétries et translations', '<p>Une <strong>symétrie axiale</strong> « plie » la figure le long d’un axe ; une <strong>symétrie centrale</strong> la fait tourner d’un demi-tour autour d’un point. Une <strong>translation</strong> la fait glisser selon une direction, un sens et une longueur.</p>'
        + EX('Dans un repère', '<p>L’image de P(3 ; −2) par la symétrie de centre O est P′(−3 ; 2). Si une translation transforme B(−2 ; 1) en C(3 ; −1), elle déplace chaque point de +5 en abscisse et −2 en ordonnée.</p>')
        + '<p>Ces transformations conservent les longueurs, les angles, les aires et l’alignement.</p>'),
      ('Rotations', D('<p>La <strong>rotation</strong> de centre O et d’angle α fait tourner chaque point autour de O d’un angle α, dans un sens donné. Elle conserve les distances au centre : OM′ = OM.</p>')
        + EX('Polygone régulier', '<p>Dans un hexagone régulier de centre O, la rotation de centre O et d’angle 360° ÷ 6 = 60° envoie chaque sommet sur le suivant.</p>')),
      ('Homothéties', D('<p>L’<strong>homothétie</strong> de centre O et de rapport k (k non nul) transforme un point M en M′ tel que O, M, M′ soient alignés et OM′ = |k| × OM. Si k &gt; 0, M′ est du même côté que M par rapport à O ; si k &lt; 0, il est de l’autre côté.</p>')
        + fig('Homothétie de centre O et de rapport 2 : le triangle image est deux fois plus grand', '<path d="M40 160L80 120L110 150Z" stroke-width="1.5"/><path d="M40 160L120 80L180 140Z"/><path d="M40 160L180 140M40 160L120 80" stroke-dasharray="4 5" stroke-width="1"/>' + txt(30, 176, 'O') + txt(82, 112, 'M') + txt(126, 74, 'M′'))
        + EX('Des longueurs', '<p>Avec k = 2, OA = 3 cm donne OA′ = 6 cm ; un segment de 5 cm devient un segment de 10 cm. Avec k = −2, les longueurs sont les mêmes, mais l’image est de l’autre côté de O.</p>')),
      ('Effets sur les grandeurs', F('Longueurs × |k|   Aires × k²   Volumes × |k|³')
        + '<p>Une homothétie conserve les angles et l’alignement. Si |k| &gt; 1, c’est un agrandissement ; si |k| &lt; 1, une réduction.</p>'
        + EX('Une pyramide coupée', '<p>La section d’une pyramide parallèle à sa base donne une petite pyramide, réduction de la grande. Avec k = 0,5 : aire de base × 0,25 et volume × 0,125.</p>')),
    ],
    quiz1=(1, 'Ce qui est conservé', 'Quelle transformation ne conserve pas les longueurs ?', ['Une rotation', 'Une translation', 'Une homothétie de rapport 3'], 'c', 'Une homothétie multiplie les longueurs par |k|.', 'Avec k = 3, les longueurs sont multipliées par 3.'),
    quiz2=(3, 'Un rapport négatif', 'Une homothétie de rapport −0,5 transforme un segment de 8 cm en un segment de…', ['−4 cm', '4 cm', '16 cm'], 'b', 'Une longueur est toujours positive.', 'On multiplie par |−0,5| = 0,5 : 8 × 0,5 = 4 cm.'),
    check=('Une maquette est une réduction de rapport 1/50 d’un bâtiment. Le volume réel vaut 2 500 m³. Quel est le volume de la maquette ?', '2 500 × (1/50)³ = 2 500 ÷ 125 000 = 0,02 m³, soit 20 L.'),
    recap='Symétries, translations et rotations conservent longueurs et angles. Homothétie de rapport k : longueurs × |k|, aires × k², volumes × |k|³ ; le signe de k donne le côté de l’image.'),

  dict(slug='3-algorithmique', title='Algorithmique et programmation', domain='reperes', transversal=True,
    lead='Lire, exécuter et écrire des programmes avec des variables, des boucles et des conditions.',
    card='Variables, boucles, conditions, listes et tracés, en Scratch.',
    ex_card='Programmes, boucles, conditions, polygones et listes.',
    keywords='algorithme programme Scratch variable boucle répéter condition si liste tracé',
    objectives='Exécuter un programme pas à pas, utiliser des variables, des boucles « répéter » et « répéter jusqu’à », des instructions conditionnelles, et programmer un tracé géométrique.',
    steps=['Note la valeur de chaque variable au départ.', 'Exécute les instructions dans l’ordre, en complétant un tableau de suivi.', 'Vérifie la condition d’arrêt de chaque boucle.'],
    sections=[
      ('Variables', D('<p>Une <strong>variable</strong> est une case mémoire qui porte un nom et contient une valeur. L’instruction « mettre x à 5 » remplace la valeur de x ; « ajouter 3 à x » l’augmente de 3.</p>')
        + EX('Un programme de calcul', '<p>Demander x, mettre résultat à 3 × x − 4, dire résultat : pour 5, le programme dit 11. Pour obtenir 29, il faut choisir 11, solution de 3x − 4 = 29.</p>')),
      ('Boucles', '<p>La boucle « répéter n fois » exécute un bloc un nombre fixé de fois. La boucle « répéter jusqu’à condition » s’arrête dès que la condition devient vraie : le nombre de tours n’est pas connu à l’avance.</p>'
        + MTH('<p>Pour suivre une boucle, dresse un tableau avec une ligne par tour et une colonne par variable.</p>', 'Tableau de suivi')
        + EX('Doubler jusqu’à dépasser 100', '<p>x part de 3 et est multiplié par 2 jusqu’à dépasser 100 : 3, 6, 12, 24, 48, 96, 192. La boucle fait 6 tours.</p>')),
      ('Instructions conditionnelles', '<p>« si condition alors… sinon… » exécute un bloc ou l’autre selon que la condition est vraie ou fausse.</p>'
        + EX('Deux entrées', '<p>Si x &gt; 10, dire 2x − 10, sinon dire 10 − x. Pour 14 : 18. Pour 6 : 4.</p>')
        + W('Inégalité stricte', '<p>Avec la condition x &gt; 10, la valeur x = 10 va dans la partie « sinon ».</p>')),
      ('Listes, compteurs et accumulateurs', '<p>Pour parcourir une liste, on traite chaque élément à tour de rôle. Un <strong>compteur</strong> augmente de 1 quand un élément vérifie une condition ; un <strong>accumulateur</strong> additionne ces éléments.</p>'),
      ('Programmer un tracé', '<p>Pour tracer un polygone régulier à n côtés, le lutin répète n fois « avancer, tourner de 360° ÷ n ». L’angle de rotation est l’angle extérieur du polygone, pas son angle intérieur.</p>'
        + EX('Un hexagone', '<p>Répéter 6 fois : avancer de 50, tourner de 60°. Le lutin parcourt 300 pas et revient à son point de départ.</p>')),
    ],
    quiz1=(2, 'Une boucle', 's vaut 2. On répète 4 fois « ajouter 3 à s ». Que vaut s ?', ['14', '12', '9'], 'a', 'Le premier tour donne 5.', '2 + 4 × 3 = 14.'),
    quiz2=(4, 'Un triangle équilatéral', 'De combien de degrés le lutin doit-il tourner à chaque sommet pour tracer un triangle équilatéral ?', ['60°', '120°', '180°'], 'b', 'Il fait un tour complet en trois rotations.', '360° ÷ 3 = 120°. L’angle intérieur, 60°, ne convient pas.'),
    check=('Liste : 4 ; 11 ; 7 ; 15 ; 9. Pour chaque e, si e > 8 alors ajouter e à t (t vaut 0 au départ). Que vaut t à la fin ?', 'Les éléments supérieurs à 8 sont 11, 15 et 9 : t = 35.'),
    recap='Une variable garde une valeur jusqu’à sa prochaine modification. Suivre une boucle avec un tableau. Une condition stricte exclut la valeur limite. Polygone régulier : tourner de 360° ÷ n.'),
]
