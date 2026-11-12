# Contenu des 16 leçons de Seconde générale et technologique (programme 2026).
from lecons_troisieme import D, F, EX, W, MTH, fig, txt

LESSONS2 = [
  dict(slug='2-arithmetique', title='Arithmétique', domain='nombres',
    lead='Multiples, diviseurs, parité et nombres premiers, avec de premières démonstrations.',
    card='Multiples, diviseurs, parité, nombres premiers et fractions irréductibles.',
    ex_card='Multiples, restes, démonstrations sur la parité, primalité et fractions.',
    keywords='multiple diviseur pair impair premier irréductible ℕ ℤ démonstration',
    objectives='Utiliser les notations ℕ et ℤ, reconnaître multiples et diviseurs, raisonner sur la parité, tester si un entier est premier, écrire une fraction sous forme irréductible et démontrer des propriétés simples avec des lettres.',
    steps=['Traduis la situation avec un entier k : a = kb, n = 2k ou n = 2k + 1.', 'Calcule ou transforme l’expression obtenue.', 'Conclus par une phrase qui répond à la question.'],
    sections=[
      ('Entiers naturels et relatifs', D('<p>ℕ désigne l’ensemble des <strong>entiers naturels</strong> 0, 1, 2, 3… et ℤ celui des <strong>entiers relatifs</strong> …, −2, −1, 0, 1, 2… On écrit 5 ∈ ℕ, −3 ∈ ℤ et −3 ∉ ℕ.</p>')
        + D('<p>Soit a et b deux entiers. On dit que a est un <strong>multiple</strong> de b (ou que b est un <strong>diviseur</strong> de a) s’il existe un entier k tel que a = kb.</p>')
        + EX('Un exemple', '<p>91 = 7 × 13 : 91 est un multiple de 7 et de 13. 92 = 7 × 13 + 1 : 92 n’est pas un multiple de 7, car le reste de la division par 7 vaut 1.</p>')),
      ('Démontrer avec des lettres', '<p>Un entier est <strong>pair</strong> s’il s’écrit 2k et <strong>impair</strong> s’il s’écrit 2k + 1, avec k entier.</p>'
        + EX('Somme de deux multiples', '<p>Si a = kn et b = k′n, alors a + b = (k + k′)n : la somme de deux multiples de n est un multiple de n.</p>')
        + EX('Le carré d’un impair', '<p>Si n = 2k + 1, alors n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1. Comme 2k² + 2k est entier, n² est impair.</p>')
        + W('Un exemple ne démontre pas', '<p>Vérifier sur 3, 5 et 7 ne prouve pas la propriété pour tous les impairs : seul le calcul avec la lettre k le fait.</p>')),
      ('Nombres premiers', D('<p>Un entier naturel est <strong>premier</strong> s’il a exactement deux diviseurs positifs : 1 et lui-même.</p>')
        + MTH('<p>Si n ≥ 2 n’est pas premier, il a un diviseur premier p tel que p² ≤ n. Pour tester n, il suffit donc d’essayer les nombres premiers jusqu’à √n.</p>')
        + EX('Le cas de 221', '<p>√221 ≈ 14,9 : on teste 2, 3, 5, 7, 11 et 13. 221 = 13 × 17 : 221 n’est pas premier.</p>')),
      ('Fractions irréductibles', '<p>Une fraction a/b est irréductible lorsque a et b n’ont pas d’autre diviseur positif commun que 1. On l’obtient en divisant numérateur et dénominateur par leur plus grand diviseur commun, souvent repéré grâce à la décomposition en facteurs premiers.</p>'
        + EX('Simplifier 240/375', '<p>240 = 2⁴ × 3 × 5 et 375 = 3 × 5³ : le facteur commun est 15, donc 240/375 = 16/25.</p>')),
      ('Algorithmes', '<p>Pour tester si a est multiple de b, on regarde si le reste de la division est nul : en Python, <code>a % b == 0</code>. Une boucle permet de chercher le plus grand multiple de a inférieur ou égal à b, ou de tester tous les diviseurs possibles d’un entier.</p>'),
    ],
    quiz1=(2, 'Une démonstration', 'Si n = 2k + 1, que vaut n² ?', ['4k² + 1', '4k² + 4k + 1', '2k² + 1'], 'b', 'Utilise (a + b)² = a² + 2ab + b².', '(2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1.'),
    quiz2=(3, 'Tester un nombre', 'Jusqu’à quel nombre faut-il tester les diviseurs premiers de 150 ?', ['75', '12', '50'], 'b', 'Calcule √150.', '√150 ≈ 12,2 : il suffit de tester les nombres premiers jusqu’à 12.'),
    check=('Démontre que le produit de deux entiers pairs est un multiple de 4.', 'Si a = 2k et b = 2k′, alors ab = 4kk′, et kk′ est entier : ab est un multiple de 4.'),
    recap='a est multiple de b s’il existe un entier k tel que a = kb. On démontre avec des lettres (2k, 2k + 1). Pour tester un nombre premier n, on essaie les nombres premiers jusqu’à √n.'),

  dict(slug='2-nombres-reels', title='Nombres réels et intervalles', domain='nombres',
    lead='Situer un réel, utiliser intervalles et valeur absolue, encadrer et arrondir.',
    card='ℝ, intervalles, valeur absolue, distance, encadrements et chiffres significatifs.',
    ex_card='Intervalles, distances, valeurs absolues, encadrements et arrondis.',
    keywords='réel intervalle valeur absolue distance encadrement décimal rationnel irrationnel chiffres significatifs',
    objectives='Situer un réel sur la droite numérique, représenter un intervalle et décider si un réel lui appartient, interpréter |x − a| comme une distance, encadrer un réel et arrondir avec un nombre de chiffres significatifs adapté.',
    steps=['Représente la situation sur une droite graduée.', 'Traduis la condition avec un intervalle ou une distance.', 'Vérifie les bornes : incluses ou exclues ?'],
    sections=[
      ('Les ensembles de nombres', '<p>On distingue ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ. 𝔻 contient les <strong>décimaux</strong> (écriture décimale finie), ℚ les <strong>rationnels</strong> (quotients d’entiers) et ℝ tous les nombres de la droite numérique.</p>'
        + EX('Des exemples', '<p>1/3 est rationnel mais pas décimal : 3 × 0,333…3 ne vaut jamais 1. √2 et π sont <strong>irrationnels</strong> : ils ne s’écrivent pas comme quotient de deux entiers.</p>')),
      ('Intervalles', '<p>[a ; b] contient les réels x tels que a ≤ x ≤ b ; ]a ; b[ ceux tels que a < x < b. Un crochet tourné vers l’extérieur exclut la borne. [a ; +∞[ contient les réels supérieurs ou égaux à a.</p>'
        + EX('Intersection et réunion', '<p>[−3 ; 5] ∩ [−1 ; 15] = [−1 ; 5] (les réels communs) et [−3 ; 5] ∪ [−1 ; 15] = [−3 ; 15] (les réels de l’un au moins).</p>')),
      ('Valeur absolue et distance', D('<p>La <strong>valeur absolue</strong> |a| est la distance entre a et 0. La distance entre deux réels a et b vaut |a − b|.</p>')
        + F('|x − a| ≤ r  ⟺  x ∈ [a − r ; a + r]')
        + EX('Un intervalle centré', '<p>|x − 3| ≤ 7 signifie que x est à une distance au plus 7 de 3 : x ∈ [−4 ; 10].</p>')),
      ('Encadrer et arrondir', '<p>Un <strong>encadrement décimal</strong> à 10<sup>−n</sup> près encadre un réel par deux décimaux consécutifs à n chiffres après la virgule. Par exemple 1,41 ≤ √2 < 1,42, car 1,41² = 1,9881 et 1,42² = 2,0164. Un algorithme de <strong>balayage</strong> obtient cet encadrement : on augmente x par pas de 0,01 tant que x² reste inférieur à 2.</p>'
        + MTH('<p>Arrondir à n <strong>chiffres significatifs</strong> : on compte à partir du premier chiffre non nul et on arrondit au dernier chiffre conservé. 0,004 618 ≈ 0,0046 avec 2 chiffres significatifs.</p>')
        + W('Les zéros de tête', '<p>Dans 0,004 618, les zéros situés avant le 4 ne sont pas significatifs.</p>')),
    ],
    quiz1=(2, 'Un intervalle', 'Le réel 6 appartient-il à [−2 ; 6[ ?', ['Oui', 'Non', 'Cela dépend'], 'b', 'Regarde le crochet de droite.', 'Le crochet ouvert en 6 exclut cette borne.'),
    quiz2=(3, 'Une distance', 'Que vaut la distance entre −4 et 5 ?', ['1', '9', '−9'], 'b', 'Calcule |−4 − 5|.', '|−4 − 5| = |−9| = 9.'),
    check=('Traduis −1 ≤ x ≤ 7 avec une valeur absolue.', 'Le centre est 3 et le rayon 4 : |x − 3| ≤ 4.'),
    recap='ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ. |a − b| est la distance entre a et b. |x − a| ≤ r équivaut à x ∈ [a − r ; a + r]. Les chiffres significatifs se comptent à partir du premier chiffre non nul.'),

  dict(slug='2-calcul-algebrique', title='Calcul algébrique', domain='nombres',
    lead='Puissances, racines carrées, identités remarquables et formules à transformer.',
    card='Puissances, racines carrées, identités remarquables et transformations de formules.',
    ex_card='Puissances, racines, factorisations, fractions et formules.',
    keywords='puissance racine carrée identité remarquable factoriser développer formule isoler fraction',
    objectives='Calculer avec des puissances entières relatives et des racines carrées, utiliser les identités remarquables dans les deux sens, choisir la forme d’une expression adaptée au problème et isoler une variable dans une formule.',
    steps=['Repère la forme de l’expression et le but : développer, factoriser, simplifier ?', 'Applique une règle à la fois en écrivant le calcul.', 'Contrôle avec une valeur numérique.'],
    sections=[
      ('Puissances', F('a<sup>m</sup> × a<sup>n</sup> = a<sup>m + n</sup>   a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m − n</sup>   (a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup>   (ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup>')
        + '<p>Pour a non nul, a<sup>−n</sup> = 1/a<sup>n</sup>. Ainsi (2/3)<sup>−2</sup> = (3/2)<sup>2</sup> = 9/4.</p>'),
      ('Racines carrées', D('<p>Pour a ≥ 0, √a est le nombre positif dont le carré vaut a. Pour tout réel a, √(a²) = |a|.</p>')
        + F('√(ab) = √a × √b  et  √(a/b) = √a / √b  (a ≥ 0, b > 0)')
        + EX('Simplifier', '<p>√72 = √(36 × 2) = 6√2.</p>')
        + W('Pas de règle pour la somme', '<p>√(a + b) < √a + √b pour a et b strictement positifs : √(9 + 16) = 5, mais √9 + √16 = 7.</p>')),
      ('Identités remarquables', F('(a + b)² = a² + 2ab + b²   (a − b)² = a² − 2ab + b²   (a + b)(a − b) = a² − b²')
        + '<p>Géométriquement, un carré de côté a + b se découpe en un carré a², un carré b² et deux rectangles ab : d’où (a + b)² = a² + 2ab + b². On les utilise pour développer, mais aussi pour <strong>factoriser</strong> : 16x² − 72x + 81 = (4x − 9)² et 25 − x² = (5 − x)(5 + x).</p>'
        + MTH('<p>Choisir la forme : la forme factorisée sert à trouver où une expression s’annule ou son signe, la forme développée à calculer une image ou comparer des coefficients.</p>')),
      ('Expressions fractionnaires', '<p>On réduit au même dénominateur pour additionner : 1/x + 1/(x + 1) = (2x + 1)/(x(x + 1)) pour x ≠ 0 et x ≠ −1. On précise toujours les valeurs interdites.</p>'),
      ('Isoler une variable', '<p>Dans une formule, on effectue la même opération dans les deux membres pour exprimer une grandeur en fonction des autres.</p>'
        + EX('Trois formules', '<p>U = RI donne I = U/R ; d = vt donne t = d/v ; P = 2(L + ℓ) donne ℓ = P/2 − L.</p>')),
    ],
    quiz1=(2, 'Une racine', 'Quelle est l’écriture simplifiée de √50 ?', ['25√2', '5√2', '2√5'], 'b', '50 = 25 × 2.', '√50 = √25 × √2 = 5√2.'),
    quiz2=(3, 'Factoriser', 'Quelle est la forme factorisée de x² + 6x + 9 ?', ['(x + 9)²', '(x + 3)²', '(x + 3)(x − 3)'], 'b', 'Repère a² + 2ab + b².', 'x² + 6x + 9 = x² + 2 × x × 3 + 3² = (x + 3)².'),
    check=('Écris (2³ × 5⁻²)/(2⁻¹ × 5) sous la forme 2ᵃ × 5ᵇ.', '2³ ÷ 2⁻¹ = 2⁴ et 5⁻² ÷ 5¹ = 5⁻³ : on obtient 2⁴ × 5⁻³.'),
    recap='Règles des puissances, √(ab) = √a√b mais pas de règle pour une somme. Les identités remarquables servent dans les deux sens. Isoler une variable : même opération dans les deux membres.'),

  dict(slug='2-equations', title='Équations et inéquations', domain='nombres',
    lead='Résoudre, comparer et modéliser avec des égalités et des inégalités.',
    card='Inégalités, équations et inéquations du premier degré, produit nul, x² = a.',
    ex_card='Inéquations, produits nuls, x² = a, a/x = b et encadrements.',
    keywords='équation inéquation inégalité ensemble solutions produit nul encadrement comparer différence',
    objectives='Opérer sur des inégalités, comparer deux nombres par différence ou par quotient, résoudre équations et inéquations du premier degré, équations produit nul et équations x² = a, et modéliser un problème par une inéquation.',
    steps=['Écris l’équation ou l’inéquation et précise l’inconnue.', 'Transforme-la en gardant l’ensemble des solutions.', 'Écris l’ensemble S des solutions et vérifie une valeur.'],
    sections=[
      ('Opérer sur des inégalités', '<p>On peut ajouter un même nombre aux deux membres d’une inégalité, et additionner deux inégalités de même sens. Multiplier par un réel strictement positif conserve le sens ; par un réel strictement négatif, on le change.</p>'
        + EX('Encadrer une différence', '<p>Si 2 ≤ x ≤ 5 et −1 ≤ y ≤ 3, alors −3 ≤ −y ≤ 1, donc −1 ≤ x − y ≤ 6.</p>')
        + MTH('<p>Pour comparer A et B, on étudie le signe de A − B ; pour des nombres strictement positifs, on peut aussi comparer A/B à 1.</p>')),
      ('Équations et inéquations du premier degré', '<p>On isole x en regroupant les termes en x d’un côté. L’ensemble des solutions d’une inéquation s’écrit souvent sous forme d’intervalle.</p>'
        + EX('Un changement de sens', '<p>5x + 5 ≤ 8x + 9 donne −3x ≤ 4, puis x ≥ −4/3 : S = [−4/3 ; +∞[.</p>')),
      ('Produit nul et équation x² = a', D('<p>Un produit est nul si et seulement si l’un au moins de ses facteurs est nul.</p>')
        + EX('Deux équations', '<p>(4x − 7)(x − 2) = 0 a pour solutions 7/4 et 2. x² = 74 a pour solutions √74 et −√74 ; x² = −3 n’a pas de solution réelle.</p>')
        + '<p>L’équation a/x = b (x ≠ 0, b ≠ 0) équivaut à x = a/b.</p>'),
      ('Modéliser par une inéquation', '<p>On traduit la contrainte du problème, on résout, puis on interprète : un nombre de séances ou d’objets est un entier.</p>'
        + EX('Deux tarifs', '<p>14 € la séance ou 85 € de forfait puis 4 € la séance : 85 + 4x < 14x donne x > 8,5. Le forfait est plus avantageux à partir de 9 séances.</p>')),
    ],
    quiz1=(1, 'Le sens', 'Si −2x > 6, que peut-on dire de x ?', ['x > −3', 'x < −3', 'x > 3'], 'b', 'On divise par −2.', 'Diviser par −2, négatif, change le sens : x < −3.'),
    quiz2=(3, 'Produit nul', 'Quelles sont les solutions de x(x + 5) = 0 ?', ['0 et 5', '0 et −5', '−5 seulement'], 'b', 'Un des deux facteurs est nul.', 'x = 0 ou x + 5 = 0, soit x = −5.'),
    check=('Résous 3 − 2x ≥ x + 9.', '−3x ≥ 6 donne x ≤ −2 : S = ]−∞ ; −2].'),
    recap='Multiplier une inégalité par un négatif change son sens. Produit nul : un facteur nul. x² = a : deux solutions si a > 0. On écrit l’ensemble des solutions et on l’interprète dans le contexte.'),

  dict(slug='2-vecteurs', title='Vecteurs', domain='geometrie',
    lead='Translations, sommes de vecteurs, coordonnées et normes dans un repère orthonormé.',
    card='Translations, égalité, somme, relation de Chasles, coordonnées, norme et milieu.',
    ex_card='Coordonnées, combinaisons, normes, milieux, parallélogrammes et Chasles.',
    keywords='vecteur translation Chasles somme coordonnées norme milieu parallélogramme',
    objectives='Représenter un vecteur associé à une translation, utiliser l’égalité, la somme et la relation de Chasles, calculer les coordonnées d’un vecteur, d’une somme ou d’un produit par un réel, une norme et les coordonnées d’un milieu.',
    steps=['Fais une figure et place les vecteurs.', 'Traduis la relation vectorielle en coordonnées.', 'Calcule abscisses et ordonnées séparément.'],
    sections=[
      ('Vecteurs et translations', D('<p>La translation qui transforme A en B est associée au <strong>vecteur</strong> <span class="vec"><span class="sr-only">vecteur </span>AB</span>, défini par sa direction (celle de la droite (AB)), son sens (de A vers B) et sa <strong>norme</strong> (la longueur AB).</p>')
        + '<p><span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>CD</span> si et seulement si ABDC est un parallélogramme (éventuellement aplati). Le vecteur nul <span class="vec"><span class="sr-only">vecteur </span>0</span> est associé à la translation qui ne déplace aucun point.</p>'),
      ('Somme et relation de Chasles', F('<span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>BC</span> = <span class="vec"><span class="sr-only">vecteur </span>AC</span>')
        + '<p>Pour additionner deux vecteurs, on les place « bout à bout ». Le produit d’un vecteur <span class="vec"><span class="sr-only">vecteur </span>u</span> non nul par un réel k a la même direction, le même sens si k > 0, le sens contraire si k < 0, et une norme multipliée par |k|.</p>'
        + EX('Un parallélogramme', '<p>ABCD est un parallélogramme si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>DC</span>, ou encore <span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>AD</span> = <span class="vec"><span class="sr-only">vecteur </span>AC</span>.</p>')),
      ('Coordonnées', F('<span class="vec"><span class="sr-only">vecteur </span>AB</span>(x<sub>B</sub> − x<sub>A</sub> ; y<sub>B</sub> − y<sub>A</sub>)')
        + '<p>Si <span class="vec"><span class="sr-only">vecteur </span>u</span>(x ; y) et <span class="vec"><span class="sr-only">vecteur </span>v</span>(x′ ; y′), alors <span class="vec"><span class="sr-only">vecteur </span>u</span> + <span class="vec"><span class="sr-only">vecteur </span>v</span>(x + x′ ; y + y′) et k<span class="vec"><span class="sr-only">vecteur </span>u</span>(kx ; ky).</p>'
        + EX('Calculer', '<p>A(1 ; −2) et B(4 ; 3) : <span class="vec"><span class="sr-only">vecteur </span>AB</span>(3 ; 5). Avec <span class="vec"><span class="sr-only">vecteur </span>u</span>(2 ; −1) et <span class="vec"><span class="sr-only">vecteur </span>v</span>(3 ; 4) : 2<span class="vec"><span class="sr-only">vecteur </span>u</span> − <span class="vec"><span class="sr-only">vecteur </span>v</span>(1 ; −6).</p>')),
      ('Norme et milieu', F('‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ = √(x² + y²)   I((x<sub>A</sub> + x<sub>B</sub>)/2 ; (y<sub>A</sub> + y<sub>B</sub>)/2)')
        + '<p>Ces formules sont valables dans un repère orthonormé. La norme découle du théorème de Pythagore. I est le milieu de [AB] si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AI</span> = <span class="vec"><span class="sr-only">vecteur </span>IB</span>.</p>'
        + EX('Une distance', '<p>A(−1 ; 2) et B(5 ; 10) : AB = √(6² + 8²) = 10 et le milieu est I(2 ; 6).</p>')),
    ],
    quiz1=(2, 'Chasles', 'Que vaut <span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>BC</span> + <span class="vec"><span class="sr-only">vecteur </span>CA</span> ?', ['<span class="vec"><span class="sr-only">vecteur </span>AC</span>', 'le vecteur nul', '2<span class="vec"><span class="sr-only">vecteur </span>AB</span>'], 'b', 'Enchaîne les vecteurs.', '<span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>BC</span> = <span class="vec"><span class="sr-only">vecteur </span>AC</span>, et <span class="vec"><span class="sr-only">vecteur </span>AC</span> + <span class="vec"><span class="sr-only">vecteur </span>CA</span> = <span class="vec"><span class="sr-only">vecteur </span>AA</span> = <span class="vec"><span class="sr-only">vecteur </span>0</span>.'),
    quiz2=(3, 'Coordonnées', 'A(2 ; 5) et B(−1 ; 9). Quelles sont les coordonnées de <span class="vec"><span class="sr-only">vecteur </span>AB</span> ?', ['(−3 ; 4)', '(3 ; −4)', '(1 ; 14)'], 'a', 'Arrivée moins départ.', '(−1 − 2 ; 9 − 5) = (−3 ; 4).'),
    check=('A(1 ; 1), B(5 ; 2), C(6 ; 6). Trouve D tel que ABCD soit un parallélogramme.', '<span class="vec"><span class="sr-only">vecteur </span>AB</span>(4 ; 1) = <span class="vec"><span class="sr-only">vecteur </span>DC</span>(6 − x ; 6 − y) donne x = 2 et y = 5 : D(2 ; 5).'),
    recap='<span class="vec"><span class="sr-only">vecteur </span>AB</span> : direction, sens, norme. <span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>BC</span> = <span class="vec"><span class="sr-only">vecteur </span>AC</span>. Coordonnées : arrivée moins départ. Repère orthonormé : ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ = √(x² + y²) et milieu = moyenne des coordonnées.'),

  dict(slug='2-colinearite', title='Colinéarité et géométrie repérée', domain='geometrie',
    lead='Le déterminant pour démontrer alignements et parallélismes, et le projeté orthogonal.',
    card='Colinéarité, déterminant, alignement, parallélisme, distances et projeté orthogonal.',
    ex_card='Déterminants, alignements, coordonnées manquantes, triangles et projetés.',
    keywords='colinéaire déterminant alignement parallélisme projeté orthogonal distance repère',
    objectives='Reconnaître deux vecteurs colinéaires, calculer un déterminant, démontrer un alignement ou un parallélisme, calculer des distances pour étudier une figure et utiliser le projeté orthogonal d’un point sur une droite.',
    steps=['Choisis les vecteurs utiles (<span class="vec"><span class="sr-only">vecteur </span>AB</span>, <span class="vec"><span class="sr-only">vecteur </span>AC</span>…).', 'Calcule leurs coordonnées, puis le déterminant.', 'Conclus : nul ou non nul, et ce que cela signifie pour la figure.'],
    sections=[
      ('Colinéarité', D('<p>Deux vecteurs <span class="vec"><span class="sr-only">vecteur </span>u</span> et <span class="vec"><span class="sr-only">vecteur </span>v</span> sont <strong>colinéaires</strong> s’il existe un réel k tel que <span class="vec"><span class="sr-only">vecteur </span>v</span> = k<span class="vec"><span class="sr-only">vecteur </span>u</span> (ou si <span class="vec"><span class="sr-only">vecteur </span>u</span> est nul) : ils ont la même direction.</p>')
        + F('det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = xy′ − x′y')
        + '<p>Dans une base orthonormée, <span class="vec"><span class="sr-only">vecteur </span>u</span>(x ; y) et <span class="vec"><span class="sr-only">vecteur </span>v</span>(x′ ; y′) sont colinéaires si et seulement si det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = 0, c’est-à-dire si leurs coordonnées sont proportionnelles.</p>'),
      ('Alignement et parallélisme', '<p>A, B et C sont alignés si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>AC</span> sont colinéaires. (AB) et (CD) sont parallèles si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>CD</span> sont colinéaires.</p>'
        + EX('Trois points', '<p>A(0 ; 1), B(2 ; 5), C(6 ; 13) : <span class="vec"><span class="sr-only">vecteur </span>AB</span>(2 ; 4) et <span class="vec"><span class="sr-only">vecteur </span>AC</span>(6 ; 12), det = 2 × 12 − 6 × 4 = 0 : les points sont alignés.</p>')),
      ('Distances et nature d’une figure', '<p>Dans un repère orthonormé, AB² = (x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)². On compare des carrés de distances pour prouver qu’un triangle est isocèle, ou qu’il est rectangle grâce à la réciproque du théorème de Pythagore.</p>'),
      ('Projeté orthogonal', D('<p>Le <strong>projeté orthogonal</strong> d’un point M sur une droite d est le point H de d tel que (MH) soit perpendiculaire à d. C’est le point de d le plus proche de M : pour tout point P de d, MP ≥ MH.</p>')
        + fig('Le projeté orthogonal H de M sur la droite d', '<path d="M20 160L300 160" /><path d="M150 40L150 160" stroke-dasharray="5 5" stroke-width="1.5"/><path d="M150 40L240 160" stroke-width="1.2"/><path d="M150 148H162V160" stroke-width="1.5"/>' + txt(150, 30, 'M') + txt(150, 182, 'H') + txt(245, 182, 'P') + txt(290, 150, 'd'))
        + '<p>Dans le triangle MHP rectangle en H, l’hypoténuse MP est plus longue que MH. On en déduit aussi cos²(α) + sin²(α) = 1 pour un angle aigu α d’un triangle rectangle.</p>'),
    ],
    quiz1=(1, 'Déterminant', 'Que vaut det((2 ; 3), (4 ; 6)) ?', ['0', '24', '−12'], 'a', 'Calcule 2 × 6 − 4 × 3.', '12 − 12 = 0 : les vecteurs sont colinéaires.'),
    quiz2=(3, 'Projeté', 'Le projeté orthogonal de M sur d est…', ['le milieu de d', 'le point de d le plus proche de M', 'un point quelconque de d'], 'b', 'Pense au triangle rectangle MHP.', 'Pour tout P de d, MP ≥ MH : H réalise la distance minimale.'),
    check=('<span class="vec"><span class="sr-only">vecteur </span>u</span>(3 ; −2) et <span class="vec"><span class="sr-only">vecteur </span>v</span>(−6 ; m) : pour quelle valeur de m sont-ils colinéaires ?', 'det = 3m − (−6)(−2) = 3m − 12 = 0, donc m = 4.'),
    recap='Colinéaires ⟺ det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = xy′ − x′y = 0. Alignement : <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>AC</span> colinéaires. Parallélisme : vecteurs directeurs colinéaires. Le projeté orthogonal est le point de la droite le plus proche.'),

  dict(slug='2-droites', title='Droites du plan', domain='geometrie',
    lead='Équations de droites, pentes, droites parallèles ou sécantes et systèmes.',
    card='Vecteur directeur, équations cartésienne et réduite, pente et systèmes linéaires.',
    ex_card='Équations réduites, vecteurs directeurs, appartenance, positions et systèmes.',
    keywords='droite équation cartésienne réduite pente coefficient directeur vecteur directeur système',
    objectives='Déterminer une équation de droite à partir de deux points, d’un point et d’un vecteur directeur ou d’une pente, lire une pente, tester l’appartenance d’un point, étudier la position de deux droites et résoudre un système de deux équations à deux inconnues.',
    steps=['Identifie les données : deux points, un point et un vecteur, une pente ?', 'Calcule la pente ou écris la condition de colinéarité.', 'Vérifie l’équation avec un point connu.'],
    sections=[
      ('Équations cartésiennes', '<p>Une droite d passant par A et de vecteur directeur <span class="vec"><span class="sr-only">vecteur </span>u</span>(−b ; a) est l’ensemble des points M tels que det(<span class="vec"><span class="sr-only">vecteur </span>AM</span>, <span class="vec"><span class="sr-only">vecteur </span>u</span>) = 0. Elle a une <strong>équation cartésienne</strong> ax + by + c = 0, avec (a ; b) ≠ (0 ; 0).</p>'
        + '<p>Un point appartient à d si et seulement si ses coordonnées vérifient l’équation.</p>'),
      ('Équation réduite et pente', F('y = mx + p   avec   m = (y<sub>B</sub> − y<sub>A</sub>)/(x<sub>B</sub> − x<sub>A</sub>)')
        + '<p>Toute droite non parallèle à l’axe des ordonnées a une <strong>équation réduite</strong> y = mx + p : m est la <strong>pente</strong> (ou coefficient directeur), p l’ordonnée à l’origine. Le vecteur (1 ; m) dirige la droite. Une droite parallèle à l’axe des ordonnées a une équation x = c.</p>'
        + EX('Deux points', '<p>A(2 ; 14) et B(5 ; 23) : m = 9/3 = 3 et p = 14 − 3 × 2 = 8. (AB) : y = 3x + 8.</p>')),
      ('Position de deux droites', '<p>Deux droites d’équations réduites y = mx + p et y = m′x + p′ sont parallèles si et seulement si m = m′ ; sinon, elles sont sécantes. Avec des équations cartésiennes, on compare les vecteurs directeurs à l’aide du déterminant.</p>'),
      ('Systèmes linéaires', '<p>Les coordonnées du point d’intersection de deux droites sécantes sont la solution d’un système de deux équations à deux inconnues. On le résout par substitution ou par combinaison.</p>'
        + EX('Cahiers et stylos', '<p>2x + 6y = 78 et 5x + 4y = 107 : 4 × (1) − 6 × (2) donne −22x = −330, donc x = 15 et y = 8.</p>')
        + W('Vérifier', '<p>On remplace toujours la solution dans les <strong>deux</strong> équations.</p>')),
    ],
    quiz1=(2, 'Une pente', 'Quelle est la pente de la droite 3x − y + 2 = 0 ?', ['3', '−3', '2'], 'a', 'Isole y.', 'y = 3x + 2 : la pente vaut 3.'),
    quiz2=(3, 'Position', 'y = 2x + 1 et y = 2x − 5 sont…', ['sécantes', 'parallèles', 'confondues'], 'b', 'Compare les pentes et les ordonnées à l’origine.', 'Même pente 2, ordonnées à l’origine différentes : parallèles distinctes.'),
    check=('Donne l’équation réduite de la droite passant par A(−1 ; 4) de pente −2.', 'y = −2x + p et 4 = −2 × (−1) + p, donc p = 2 : y = −2x + 2.'),
    recap='Équation cartésienne ax + by + c = 0 ; équation réduite y = mx + p, m étant la pente. Parallèles ⟺ même pente. Point d’intersection : solution d’un système.'),

  dict(slug='2-fonctions', title='Généralités sur les fonctions', domain='fonctions',
    lead='Ensemble de définition, courbe, parité et résolutions graphiques ou algébriques.',
    card='Ensemble de définition, courbe représentative, parité et résolution de f(x) = k.',
    ex_card='Domaines de définition, courbes, parité, équations et modélisation.',
    keywords='fonction ensemble de définition courbe paire impaire image antécédent résolution graphique',
    objectives='Déterminer un ensemble de définition, exploiter l’équation y = f(x) d’une courbe, reconnaître une fonction paire ou impaire, résoudre f(x) = k, f(x) < k, f(x) = g(x) et f(x) < g(x) graphiquement ou algébriquement, et modéliser une situation par une fonction.',
    steps=['Précise l’ensemble de définition.', 'Choisis la méthode : graphique, algébrique ou numérique.', 'Écris l’ensemble des solutions et vérifie-le sur la courbe.'],
    sections=[
      ('Ensemble de définition', '<p>Une fonction f associe à chaque réel x d’un ensemble D un unique réel f(x). D est l’<strong>ensemble de définition</strong>, souvent un intervalle ou une réunion d’intervalles.</p>'
        + EX('Deux contraintes', '<p>f(x) = 1/(x − 6) est définie pour x ≠ 6. g(x) = √(x − 4) est définie pour x ≥ 4, sur [4 ; +∞[.</p>')),
      ('Courbe représentative', D('<p>La courbe de f est l’ensemble des points M(x ; y) tels que x ∈ D et y = f(x). On dit que y = f(x) est une équation de la courbe.</p>')
        + '<p>Pour savoir si un point est sur la courbe, on calcule l’image de son abscisse et on la compare à son ordonnée.</p>'),
      ('Parité', D('<p>f définie sur un ensemble symétrique par rapport à 0 est <strong>paire</strong> si f(−x) = f(x) : sa courbe est symétrique par rapport à l’axe des ordonnées. Elle est <strong>impaire</strong> si f(−x) = −f(x) : sa courbe est symétrique par rapport à l’origine.</p>')
        + EX('Trois cas', '<p>x² + 1 est paire, x³ − 2x est impaire, x² + x n’est ni paire ni impaire (f(1) = 2 et f(−1) = 0).</p>')),
      ('Résoudre des équations et inéquations', MTH('<p>Graphiquement, les solutions de f(x) = k sont les abscisses des points de la courbe d’ordonnée k ; celles de f(x) < g(x) sont les abscisses où la courbe de f est sous celle de g. Algébriquement, on se ramène à une forme connue.</p>')
        + EX('Avec la fonction carré', '<p>x² − 14 = 2 équivaut à x² = 16, soit x = 4 ou x = −4.</p>')),
      ('Modéliser', '<p>Une fonction traduit la dépendance entre deux grandeurs. L’aire d’un rectangle de périmètre 38 cm et de largeur x est A(x) = x(19 − x), pour x ∈ ]0 ; 19[ : l’ensemble de définition vient du contexte.</p>'),
    ],
    quiz1=(1, 'Domaine', 'Sur quel ensemble est définie x ↦ √(x + 3) ?', ['[−3 ; +∞[', ']−∞ ; −3]', '[3 ; +∞['], 'a', 'Il faut x + 3 ≥ 0.', 'x + 3 ≥ 0 équivaut à x ≥ −3.'),
    quiz2=(3, 'Parité', 'f(x) = 5x³. f est…', ['paire', 'impaire', 'ni paire ni impaire'], 'b', 'Calcule f(−x).', 'f(−x) = 5(−x)³ = −5x³ = −f(x).'),
    check=('f(x) = 2x − 1 et g(x) = −x + 5. Résous f(x) ≤ g(x).', '2x − 1 ≤ −x + 5 donne 3x ≤ 6, soit x ≤ 2 : S = ]−∞ ; 2].'),
    recap='Ensemble de définition : pas de division par 0, pas de racine d’un négatif. M(a ; b) est sur la courbe si f(a) = b. Paire : f(−x) = f(x) ; impaire : f(−x) = −f(x).'),

  dict(slug='2-fonctions-reference', title='Fonctions de référence', domain='fonctions',
    lead='Carré, inverse, racine carrée, cube et valeur absolue : courbes, variations et équations.',
    card='Fonctions carré, inverse, racine carrée, cube et valeur absolue.',
    ex_card='Équations et inéquations avec les fonctions de référence, comparaisons.',
    keywords='fonction carré inverse racine carrée cube valeur absolue parabole hyperbole courbe',
    objectives='Connaître la définition, la courbe, le sens de variation et le signe des fonctions de référence, et les utiliser pour résoudre f(x) = k et f(x) < k ou comparer des nombres.',
    steps=['Identifie la fonction de référence en jeu.', 'Utilise sa courbe ou son sens de variation.', 'Écris les solutions, en tenant compte de l’ensemble de définition.'],
    sections=[
      ('Fonction carré', '<p>x ↦ x², définie sur ℝ, est décroissante sur ]−∞ ; 0] et croissante sur [0 ; +∞[. Sa courbe est une <strong>parabole</strong> symétrique par rapport à l’axe des ordonnées : la fonction est paire.</p>'
        + fig('Courbes des fonctions carré (trait plein) et cube (pointillés)', '<path d="M20 160H300M160 190V10" stroke-width="1.2"/><path d="M80 20Q160 300 240 20" stroke-width="2.5"/><path d="M100 190C140 140 150 160 160 160S180 180 220 130" stroke-dasharray="6 4" stroke-width="2"/>' + txt(292, 150, 'x') + txt(172, 20, 'y'))
        + EX('Une inéquation', '<p>x² ≤ 64 équivaut à −8 ≤ x ≤ 8. x² > 9 équivaut à x < −3 ou x > 3.</p>')
        + MTH('<p>Si 0 ≤ a < b, alors b² − a² = (b − a)(b + a) > 0, donc a² < b² : la fonction carré est croissante sur [0 ; +∞[.</p>', 'Démontrer une variation')),
      ('Fonction inverse', '<p>x ↦ 1/x, définie sur ℝ privé de 0, est décroissante sur ]−∞ ; 0[ et sur ]0 ; +∞[. Sa courbe est une <strong>hyperbole</strong>, symétrique par rapport à l’origine : la fonction est impaire.</p>'
        + W('Pas de décroissance sur ℝ privé de 0', '<p>−1 < 1, et pourtant 1/(−1) = −1 < 1/1 = 1 : la fonction inverse n’est pas décroissante sur ℝ privé de 0 tout entier.</p>')),
      ('Fonction racine carrée', '<p>x ↦ √x, définie sur [0 ; +∞[, est croissante. Pour x ∈ [0 ; 1], √x ≥ x ; pour x ≥ 1, √x ≤ x.</p>'
        + EX('Une équation', '<p>√x = 6 pour x = 36 ; √x ≤ 4 pour x ∈ [0 ; 16].</p>')),
      ('Fonctions cube et valeur absolue', '<p>x ↦ x³, définie sur ℝ, est croissante et impaire. Pour x ≥ 1, x³ ≥ x², et pour x ∈ [0 ; 1], x³ ≤ x².</p>'
        + '<p>x ↦ |x| vaut x si x ≥ 0 et −x si x < 0 : décroissante sur ]−∞ ; 0], croissante sur [0 ; +∞[, paire. |x − a| = r a pour solutions a − r et a + r.</p>'),
    ],
    quiz1=(1, 'Carré', 'Quelles sont les solutions de x² = 25 ?', ['5', '−5 et 5', '12,5'], 'b', 'Deux nombres opposés ont le même carré.', 'x = 5 ou x = −5.'),
    quiz2=(2, 'Inverse', 'Comparer 1/3 et 1/7 : lequel est le plus grand ?', ['1/3', '1/7', 'Ils sont égaux'], 'a', 'L’inverse est décroissante sur ]0 ; +∞[.', '3 < 7 et la fonction inverse inverse l’ordre : 1/3 > 1/7.'),
    check=('Résous x³ = −27, puis |x + 2| = 5.', 'x = −3 ; puis x + 2 = 5 ou x + 2 = −5, soit x = 3 ou x = −7.'),
    recap='Carré : parabole, paire. Inverse : hyperbole, impaire, décroissante sur chaque intervalle. Racine : croissante sur [0 ; +∞[. Cube : croissante, impaire. Valeur absolue : distance à 0.'),

  dict(slug='2-variations', title='Variations et extremums', domain='fonctions',
    lead='Lire et utiliser un sens de variation, trouver un maximum ou un minimum.',
    card='Croissance, tableaux de variations, extremums, fonctions affines et optimisation.',
    ex_card='Extremums, taux d’accroissement, optimisation et comparaisons d’images.',
    keywords='variation croissante décroissante tableau de variations maximum minimum extremum optimisation affine',
    objectives='Relier courbe et tableau de variations, déterminer un extremum sur un intervalle, interpréter le coefficient directeur d’une fonction affine comme taux d’accroissement, comparer des images et traiter des problèmes d’optimisation.',
    steps=['Établis ou lis le sens de variation sur chaque intervalle.', 'Repère les changements de sens et les bornes.', 'Compare les valeurs pour conclure sur l’extremum.'],
    sections=[
      ('Sens de variation', D('<p>f est <strong>croissante</strong> sur un intervalle I si, pour tous a ≤ b dans I, f(a) ≤ f(b) : elle conserve l’ordre. Elle est <strong>décroissante</strong> si elle inverse l’ordre. Monotone signifie croissante ou décroissante.</p>')
        + '<p>Un <strong>tableau de variations</strong> résume ces informations avec des flèches et les valeurs remarquables.</p>'),
      ('Maximum et minimum', D('<p>M est le <strong>maximum</strong> de f sur I s’il existe a dans I tel que f(a) = M et f(x) ≤ M pour tout x de I. On définit de même un minimum.</p>')
        + EX('Avec un carré', '<p>f(x) = (x − 2)² − 3 : comme (x − 2)² ≥ 0, f(x) ≥ −3 pour tout x, et f(2) = −3. Le minimum vaut −3, atteint en 2.</p>')),
      ('Fonctions affines', F('f(x) = mx + p   m = (f(b) − f(a))/(b − a)')
        + '<p>m est le <strong>taux d’accroissement</strong> : quand x augmente de 1, f(x) varie de m. f est croissante si m > 0, décroissante si m < 0, constante si m = 0. Sur un intervalle fermé, ses extremums sont aux bornes.</p>'),
      ('Optimisation', '<p>On modélise la grandeur à optimiser par une fonction, puis on cherche son extremum, par le calcul, par lecture graphique ou à l’aide d’un algorithme de balayage ou de dichotomie.</p>'
        + EX('Le rectangle d’aire maximale', '<p>Périmètre 36 cm : A(x) = x(18 − x) = 81 − (x − 9)². L’aire est maximale, égale à 81 cm², pour x = 9 : c’est un carré.</p>')),
    ],
    quiz1=(1, 'Conserver l’ordre', 'f est décroissante sur [0 ; 5]. Que peut-on dire de f(1) et f(4) ?', ['f(1) ≤ f(4)', 'f(1) ≥ f(4)', 'On ne peut rien dire'], 'b', 'Décroissante : l’ordre est inversé.', '1 ≤ 4, donc f(1) ≥ f(4).'),
    quiz2=(2, 'Un extremum', 'Quel est le maximum de f(x) = 5 − (x + 1)² ?', ['5, atteint en −1', '−1, atteint en 5', '5, atteint en 1'], 'a', 'Un carré est positif ou nul.', 'f(x) ≤ 5 et f(−1) = 5.'),
    check=('f(x) = −3x + 7 sur [−2 ; 4]. Donne son maximum et son minimum.', 'f est décroissante : max f(−2) = 13, min f(4) = −5.'),
    recap='Croissante : conserve l’ordre ; décroissante : l’inverse. Un extremum est atteint en un point. Affine : m est le taux d’accroissement, extremums aux bornes. Optimiser : modéliser, puis chercher l’extremum.'),

  dict(slug='2-signes', title='Signe d’une expression', domain='fonctions',
    lead='Tableaux de signes de produits et de quotients pour résoudre des inéquations.',
    card='Signe d’une fonction affine, tableaux de signes, inéquations produit et quotient.',
    ex_card='Signes de fonctions affines, produits, quotients et contextes économiques.',
    keywords='signe tableau de signes produit quotient inéquation valeur interdite fonction affine',
    objectives='Déterminer le signe d’une fonction affine, dresser le tableau de signes d’un produit ou d’un quotient de facteurs affines, et résoudre des inéquations du type A(x)B(x) ≥ 0 ou A(x)/B(x) > 0.',
    steps=['Factorise l’expression si nécessaire.', 'Étudie le signe de chaque facteur sur une ligne du tableau.', 'Applique la règle des signes, puis lis les solutions.'],
    sections=[
      ('Signe d’une fonction affine', '<p>f(x) = mx + p (m ≠ 0) s’annule en x₀ = −p/m. Elle est du signe de m à droite de x₀ et du signe contraire à gauche.</p>'
        + '<div class="table-scroll" tabindex="0" role="region" aria-label="Signe de 2x − 6"><table><caption>Signe de 2x − 6</caption><thead><tr><th scope="col">x</th><th scope="col">−∞ ; 3</th><th scope="col">3</th><th scope="col">3 ; +∞</th></tr></thead><tbody><tr><th scope="row">2x − 6</th><td>−</td><td>0</td><td>+</td></tr></tbody></table></div>'),
      ('Tableau de signes d’un produit', MTH('<p>Une ligne par facteur, puis une dernière ligne pour le produit : il est positif quand le nombre de facteurs négatifs est pair.</p>')
        + EX('Un produit', '<p>(x + 1)(x − 4) est positif sur ]−∞ ; −1] ∪ [4 ; +∞[ et négatif sur [−1 ; 4] : l’inéquation (x + 1)(x − 4) ≥ 0 a pour solutions ]−∞ ; −1] ∪ [4 ; +∞[.</p>')),
      ('Signe d’un quotient', '<p>A(x)/B(x) a le même signe que A(x)B(x), mais n’est pas défini là où B(x) = 0 : on marque cette <strong>valeur interdite</strong> par une double barre dans le tableau.</p>'
        + W('La valeur interdite', '<p>(x − 2)/(x + 5) > 0 a pour solutions ]−∞ ; −5[ ∪ ]2 ; +∞[ : −5 est toujours exclu, même avec une inégalité large.</p>')),
      ('Interpréter en contexte', '<p>Le signe d’un bénéfice, d’une différence de coûts ou d’une vitesse indique un gain ou une perte, un tarif plus avantageux, un sens de déplacement.</p>'
        + EX('Un bénéfice', '<p>B(x) = (x − 20)(80 − x) est positif pour x ∈ ]20 ; 80[ : l’entreprise est bénéficiaire entre 20 et 80 objets vendus.</p>')),
    ],
    quiz1=(1, 'Affine', 'Quel est le signe de −3x + 6 pour x > 2 ?', ['Positif', 'Négatif', 'Nul'], 'b', 'Le coefficient de x est −3.', 'À droite de 2, l’expression a le signe de −3 : négatif.'),
    quiz2=(2, 'Un produit', 'Combien de facteurs négatifs faut-il pour qu’un produit de trois facteurs non nuls soit positif ?', ['0 ou 2', '1 ou 3', '3 seulement'], 'a', 'Règle des signes.', 'Un nombre pair de facteurs négatifs donne un produit positif.'),
    check=('Résous x² − 9 < 0.', 'x² − 9 = (x − 3)(x + 3) est négatif entre les racines : S = ]−3 ; 3[.'),
    recap='mx + p a le signe de m à droite de sa racine. Produit : règle des signes dans un tableau. Quotient : même signe que le produit, avec une valeur interdite toujours exclue.'),

  dict(slug='2-evolutions', title='Proportions et évolutions', domain='statistiques',
    lead='Pourcentages, pourcentages de pourcentages, taux et évolutions successives.',
    card='Proportions, pourcentages de pourcentages, taux d’évolution et coefficients.',
    ex_card='Taux, évolutions successives, évolutions réciproques et proportions.',
    keywords='proportion pourcentage taux évolution coefficient multiplicateur réciproque successive variation',
    objectives='Exprimer une proportion, calculer un pourcentage de pourcentage, distinguer variation absolue et relative, passer d’un taux à un coefficient multiplicateur et calculer une évolution globale ou réciproque.',
    steps=['Identifie la valeur de référence (le tout, la valeur de départ).', 'Passe par les coefficients multiplicateurs.', 'Revient au pourcentage et interprète.'],
    sections=[
      ('Proportions', F('p = effectif de la sous-population / effectif de la population')
        + '<p>Si A est inclus dans B, lui-même inclus dans E, la proportion de A dans E est le produit des proportions : p<sub>A/E</sub> = p<sub>A/B</sub> × p<sub>B/E</sub>.</p>'
        + EX('Pourcentage de pourcentage', '<p>40 % des élèves sont en Seconde et 25 % d’entre eux font de l’escalade : 0,4 × 0,25 = 0,1, soit 10 % du lycée.</p>')),
      ('Variation absolue et taux d’évolution', F('Variation absolue : V₂ − V₁   Taux : t = (V₂ − V₁)/V₁   Coefficient : CM = V₂/V₁ = 1 + t')
        + EX('Un abonnement', '<p>De 250 € à 200 € : variation absolue −50 €, taux −0,2 soit −20 %, coefficient 0,8.</p>')),
      ('Évolutions successives', '<p>Les coefficients multiplicateurs se multiplient. Une hausse de 20 % suivie d’une baisse de 10 % donne 1,2 × 0,9 = 1,08 : une hausse globale de 8 %, et non de 10 %.</p>'),
      ('Évolution réciproque', '<p>Pour revenir à la valeur initiale, on applique l’inverse du coefficient. Après une hausse de 25 % (CM = 1,25), il faut multiplier par 1/1,25 = 0,8, soit une baisse de 20 %.</p>'
        + W('Pas de symétrie', '<p>Une hausse de t % ne se compense pas par une baisse de t % : 1,25 × 0,75 = 0,9375.</p>')),
    ],
    quiz1=(1, 'Proportion', '30 % des 600 spectateurs sont venus en bus. Combien sont-ils ?', ['30', '180', '200'], 'b', 'Calcule 0,3 × 600.', '0,3 × 600 = 180.'),
    quiz2=(3, 'Global', 'Deux hausses successives de 10 % donnent une hausse globale de…', ['20 %', '21 %', '11 %'], 'b', 'Multiplie les coefficients.', '1,1 × 1,1 = 1,21, soit +21 %.'),
    check=('Un prix baisse de 40 %. Quelle hausse le ramène à sa valeur initiale ?', 'CM = 0,6 ; coefficient réciproque 1/0,6 ≈ 1,667, soit une hausse d’environ 66,7 %.'),
    recap='Proportions emboîtées : on multiplie. Taux t = (V₂ − V₁)/V₁ et CM = 1 + t. Évolutions successives : produit des CM. Évolution réciproque : inverse du CM.'),

  dict(slug='2-statistiques', title='Statistique descriptive', domain='statistiques',
    lead='Moyenne, écart type, médiane, quartiles et séries regroupées en classes.',
    card='Moyenne, linéarité, écart type, quartiles et séries regroupées en classes.',
    ex_card='Moyennes, écarts types, classes, quartiles et comparaisons de séries.',
    keywords='moyenne écart type médiane quartile écart interquartile classe histogramme dispersion',
    objectives='Calculer et interpréter moyenne, écart type, médiane et quartiles, utiliser la linéarité de la moyenne, exploiter une série regroupée en classes et comparer deux séries à l’aide d’indicateurs.',
    steps=['Organise les données : liste triée ou tableau d’effectifs.', 'Calcule les indicateurs avec la calculatrice ou Python.', 'Interprète : position (moyenne, médiane) et dispersion (écart type, écart interquartile).'],
    sections=[
      ('Moyenne et écart type', F('x̄ = (n₁x₁ + … + n<sub>p</sub>x<sub>p</sub>)/N   s = √((n₁(x₁ − x̄)² + … + n<sub>p</sub>(x<sub>p</sub> − x̄)²)/N)')
        + '<p>L’<strong>écart type</strong> mesure la dispersion des valeurs autour de la moyenne. Il s’exprime dans la même unité que les données.</p>'
        + '<p>Si chaque valeur x devient ax + b, la moyenne devient ax̄ + b et l’écart type |a|s.</p>'),
      ('Médiane et quartiles', D('<p>Sur une série rangée, Q₁ est la plus petite valeur telle qu’au moins 25 % des valeurs lui soient inférieures ou égales ; Q₃ de même avec 75 %. L’<strong>écart interquartile</strong> Q₃ − Q₁ mesure la dispersion de la moitié centrale.</p>')
        + EX('12 valeurs', '<p>12 × 0,25 = 3 : Q₁ est la 3e valeur ; 12 × 0,75 = 9 : Q₃ est la 9e.</p>')
        + W('Sensibilité', '<p>Ajouter une valeur très grande modifie beaucoup la moyenne, très peu la médiane.</p>')),
      ('Séries regroupées en classes', '<p>Avec des classes de même amplitude, on représente la série par un histogramme. Le polygone des fréquences cumulées permet de lire une estimation de la médiane et des quartiles. Pour la moyenne, on remplace chaque classe par son centre. La <strong>classe médiane</strong> contient la valeur de rang N/2, repérée avec les effectifs cumulés croissants ; on peut estimer la médiane en supposant la répartition uniforme dans cette classe.</p>'),
      ('Comparer deux séries', '<p>On compare la position (moyennes ou médianes) et la dispersion (écarts types, ou écarts interquartiles). À moyenne égale, la série de plus petit écart type est la plus homogène.</p>'
        + MTH('<p>Une fonction Python peut renvoyer la moyenne m et l’écart type s d’une série, puis compter la proportion de valeurs dans [m − 2s ; m + 2s].</p>')),
    ],
    quiz1=(1, 'Linéarité', 'Une série a pour moyenne 12 et écart type 3. On ajoute 5 à chaque valeur. Nouvel écart type ?', ['3', '8', '15'], 'a', 'Ajouter une constante décale sans disperser.', 'L’écart type reste 3 ; la moyenne devient 17.'),
    quiz2=(2, 'Quartile', 'Série rangée de 20 valeurs : quel est le rang de Q₁ ?', ['5', '10', '15'], 'a', 'Calcule 20 × 0,25.', '20 × 0,25 = 5 : Q₁ est la 5e valeur.'),
    check=('Notes : 8, 10, 12, 14 avec les effectifs 2, 5, 4, 1. Calcule la moyenne.', '(16 + 50 + 48 + 14) ÷ 12 = 128 ÷ 12 ≈ 10,67.'),
    recap='Moyenne et écart type : position et dispersion. ax + b : moyenne ax̄ + b, écart type |a|s. Quartiles sur la série rangée. Classes : centres et classe médiane.'),

  dict(slug='2-tableaux-croises', title='Tableaux croisés', domain='statistiques',
    lead='Croiser deux variables qualitatives et calculer fréquences marginales et conditionnelles.',
    card='Tableaux croisés d’effectifs, fréquences marginales et conditionnelles.',
    ex_card='Fréquences marginales et conditionnelles, tableaux à compléter, filtres.',
    keywords='tableau croisé fréquence conditionnelle marginale effectif double entrée filtre',
    objectives='Lire et compléter un tableau croisé d’effectifs, calculer des fréquences marginales et conditionnelles, passer de pourcentages à des effectifs et filtrer une population selon des critères combinés par ET, OU et NON.',
    steps=['Repère la population de référence : le total général, une ligne ou une colonne.', 'Lis ou complète les effectifs utiles.', 'Divise par l’effectif de la population de référence.'],
    sections=[
      ('Tableau croisé d’effectifs', '<p>Un tableau croisé (ou à double entrée) répartit une population selon deux variables qualitatives. Les totaux des lignes et des colonnes sont les <strong>effectifs marginaux</strong>.</p>'
        + '<div class="table-scroll" tabindex="0" role="region" aria-label="Exemple de tableau croisé"><table><caption>Instrument et niveau</caption><thead><tr><th scope="col">Niveau</th><th scope="col">Instrument</th><th scope="col">Pas d’instrument</th><th scope="col">Total</th></tr></thead><tbody><tr><th scope="row">Seconde</th><td>30</td><td>45</td><td>75</td></tr><tr><th scope="row">Première</th><td>50</td><td>25</td><td>75</td></tr><tr><th scope="row">Total</th><td>80</td><td>70</td><td>150</td></tr></tbody></table></div>'),
      ('Fréquences marginales', '<p>Une fréquence marginale rapporte un total de ligne ou de colonne à l’effectif total : 80/150 ≈ 53 % des élèves jouent d’un instrument.</p>'),
      ('Fréquences conditionnelles', D('<p>La fréquence de B <strong>parmi</strong> A se calcule en divisant l’effectif de A ∩ B par l’effectif de A.</p>')
        + EX('Deux lectures', '<p>Parmi les élèves de Seconde, 30/75 = 40 % jouent d’un instrument. Parmi les musiciens, 30/80 = 37,5 % sont en Seconde.</p>')
        + W('Attention au dénominateur', '<p>« La fréquence des musiciens parmi les Secondes » et « la fréquence des Secondes parmi les musiciens » ne sont pas égales en général.</p>')),
      ('Filtrer une population', '<p>On sélectionne les individus vérifiant une condition : A ET B (intersection), A OU B (réunion), NON A (complémentaire). Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B). Avec Python ou un tableur, ces filtres s’appliquent à un fichier de données.</p>'),
    ],
    quiz1=(2, 'Marginale', 'Dans le tableau exemple, quelle est la fréquence des élèves de Première ?', ['50 %', '75 %', '37,5 %'], 'a', 'Total de la ligne Première sur le total général.', '75/150 = 0,5.'),
    quiz2=(3, 'Conditionnelle', 'Parmi les élèves sans instrument, quelle part est en Première ?', ['25/150', '25/70', '25/75'], 'b', 'La population de référence est la colonne « Pas d’instrument ».', '25 élèves sur les 70 sans instrument.'),
    check=('Sur 200 clients, 120 sont des femmes, 90 prennent un dessert, dont 50 femmes. Combien d’hommes ne prennent pas de dessert ?', '80 hommes, dont 40 avec dessert : 40 hommes sans dessert.'),
    recap='Fréquence marginale : total d’une ligne ou d’une colonne sur l’effectif total. Fréquence conditionnelle : on divise par l’effectif de la sous-population de référence. ET, OU, NON servent à filtrer.'),

  dict(slug='2-probabilites', title='Probabilités et échantillonnage', domain='probabilites',
    lead='Modéliser le hasard, utiliser des arbres et des probabilités conditionnelles, estimer par échantillonnage.',
    card='Loi de probabilité, P(A ∪ B), arbres, probabilités conditionnelles et échantillons.',
    ex_card='Réunions, arbres, conditionnelles, faux positifs, trois épreuves et échantillons.',
    keywords='probabilité univers événement réunion intersection arbre conditionnelle échantillon fluctuation',
    objectives='Définir une loi de probabilité, calculer P(A ∪ B), dénombrer avec tableaux et arbres, calculer des probabilités pour deux ou trois épreuves, utiliser une probabilité conditionnelle P_A(B) et estimer une probabilité par une fréquence observée sur un échantillon.',
    steps=['Décris l’univers et les événements dans la langue naturelle, puis en symboles.', 'Construis un tableau ou un arbre pondéré.', 'Calcule, en distinguant P(A ∩ B), P_A(B) et P_B(A).'],
    sections=[
      ('Loi de probabilité', '<p>L’univers Ω est l’ensemble des issues. Une loi de probabilité associe à chaque issue un nombre positif, la somme valant 1. La probabilité d’un événement est la somme des probabilités de ses issues ; en situation d’équiprobabilité, P(A) = Card(A)/Card(Ω).</p>'
        + F('P(A ∪ B) + P(A ∩ B) = P(A) + P(B)   P(Ā) = 1 − P(A)')),
      ('Probabilités conditionnelles', D('<p>Si P(A) ≠ 0, la probabilité de B <strong>sachant</strong> A est P_A(B) = P(A ∩ B)/P(A).</p>')
        + '<p>Sur un arbre pondéré, les branches issues de A portent des probabilités conditionnelles, et P(A ∩ B) = P(A) × P_A(B) : on multiplie le long d’un chemin.</p>'
        + EX('Un arbre', '<p>P(A) = 0,6 et P_A(B) = 0,3 : P(A ∩ B) = 0,18 et P(A ∩ B̄) = 0,6 × 0,7 = 0,42.</p>')),
      ('Ne pas confondre P_A(B) et P_B(A)', '<p>Dans un dépistage, P(positif sachant malade) peut être élevée alors que P(malade sachant positif) est faible, si la maladie est rare : les faux positifs sont nombreux parmi les tests positifs. Un tableau croisé d’effectifs rend le calcul clair.</p>'
        + W('Le dénominateur', '<p>« Sachant positif » : on divise par le nombre total de tests positifs, vrais et faux.</p>')),
      ('Plusieurs épreuves et échantillonnage', '<p>Pour trois épreuves indépendantes de même probabilité de succès p, P(trois succès) = p³ et P(au moins un succès) = 1 − (1 − p)³.</p>'
        + '<p>Sur un échantillon aléatoire de taille n, la fréquence f observée estime p. Le plus souvent (dans environ 95 % des échantillons), |f − p| ≤ 1/√n. Une simulation en Python permet de l’observer : c’est une version simple de la <strong>loi des grands nombres</strong>, selon laquelle la fréquence se rapproche de p quand n devient grand.</p>'
        + EX('Une pièce', '<p>p = 0,3 et n = 100 : 1/√100 = 0,1. Une fréquence de 0,36 est dans la marge habituelle.</p>')),
    ],
    quiz1=(1, 'Réunion', 'P(A) = 0,5, P(B) = 0,4 et P(A ∩ B) = 0,1. Que vaut P(A ∪ B) ?', ['0,9', '0,8', '0,2'], 'b', 'Soustrais l’intersection.', '0,5 + 0,4 − 0,1 = 0,8.'),
    quiz2=(2, 'Conditionnelle', 'P(A) = 0,4 et P(A ∩ B) = 0,1. Que vaut P_A(B) ?', ['0,04', '0,25', '0,5'], 'b', 'Divise P(A ∩ B) par P(A).', '0,1 ÷ 0,4 = 0,25.'),
    check=('Un dé équilibré est lancé trois fois. Quelle est la probabilité d’obtenir au moins un 6 ?', '1 − (5/6)³ = 1 − 125/216 = 91/216 ≈ 0,42.'),
    recap='P(A ∪ B) = P(A) + P(B) − P(A ∩ B). P_A(B) = P(A ∩ B)/P(A), et on multiplie le long d’un chemin d’arbre. P_A(B) ≠ P_B(A) en général. Échantillon de taille n : |f − p| ≤ 1/√n le plus souvent.'),

  dict(slug='2-algorithmique', title='Algorithmique et logique', domain='reperes', transversal=True,
    lead='Programmer en Python et raisonner avec rigueur : variables, boucles, fonctions, implications.',
    card='Variables, conditions, boucles, fonctions Python, ensembles et raisonnements.',
    ex_card='Fonctions Python, boucles for et while, booléens, implications et affectations.',
    keywords='Python variable boucle for while fonction booléen implication réciproque contraposée ensemble logique',
    objectives='Utiliser des variables de différents types, des conditions, des boucles bornées et non bornées et des fonctions en Python ; utiliser le vocabulaire des ensembles ; formuler une négation, une implication, sa réciproque et sa contraposée ; raisonner par contre-exemple, disjonction des cas ou par l’absurde.',
    steps=['Lis le programme ou la proposition ligne par ligne.', 'Suis les valeurs des variables dans un tableau, ou cherche un contre-exemple.', 'Conclus en vérifiant chaque cas.'],
    sections=[
      ('Variables et instructions', '<p>Une variable a un type : entier (<code>int</code>), flottant (<code>float</code>), booléen (<code>bool</code>) ou chaîne de caractères (<code>str</code>). L’affectation <code>a = a + b</code> remplace la valeur de a en utilisant les valeurs actuelles.</p>'
        + '<pre><code>def f(x):\n    if x &gt; 0:\n        return 2*x\n    else:\n        return -x</code></pre>'),
      ('Boucles', '<p><code>for i in range(a, b)</code> parcourt les entiers de a à b − 1 : le nombre de tours est connu. <code>while condition:</code> répète tant que la condition est vraie : le nombre de tours dépend des calculs. Avec <code>from random import random</code>, une fonction peut simuler une expérience aléatoire et être appelée de nombreuses fois.</p>'
        + EX('Première puissance supérieure à 300', '<p>u = 5, puis u = u × 2 tant que u &lt; 300 : 5, 10, 20, 40, 80, 160, 320. La boucle s’arrête après 6 tours.</p>')),
      ('Ensembles', '<p>On note x ∈ A l’appartenance, A ⊂ B l’inclusion, A ∩ B l’intersection, A ∪ B la réunion, Ā le complémentaire et Ø l’ensemble vide. Card(A) est le nombre d’éléments d’un ensemble fini. Un <strong>couple</strong> (a ; b) est ordonné ; l’ensemble des couples d’éléments de A et de B est le produit cartésien A × B.</p>'),
      ('Propositions et raisonnements', D('<p>L’implication « si A alors B » a pour <strong>réciproque</strong> « si B alors A » et pour <strong>contraposée</strong> « si non B alors non A ». Une implication et sa contraposée sont vraies ou fausses en même temps ; la réciproque peut avoir une autre valeur.</p>')
        + EX('Multiples', '<p>« Si n est multiple de 6, alors n est multiple de 3 » est vraie. Sa réciproque est fausse : 3 est multiple de 3 sans être multiple de 6 (contre-exemple).</p>')
        + '<p>La négation de « A et B » est « non A ou non B ». On raisonne aussi par disjonction des cas (n pair, puis n impair) ou par l’absurde, comme pour démontrer que √2 est irrationnel.</p>'),
    ],
    quiz1=(2, 'range', 'Combien de tours fait la boucle <code>for i in range(2, 9)</code> ?', ['9', '7', '8'], 'b', 'La borne 9 est exclue.', 'i prend les valeurs 2, 3, 4, 5, 6, 7, 8 : 7 tours.'),
    quiz2=(4, 'Contraposée', 'Quelle est la contraposée de « si x > 2 alors x² > 4 » ?', ['si x² > 4 alors x > 2', 'si x² ≤ 4 alors x ≤ 2', 'si x ≤ 2 alors x² ≤ 4'], 'b', 'Contraposée : si non B alors non A.', 'Non B : x² ≤ 4 ; non A : x ≤ 2.'),
    check=('a = 3, b = 5, puis b = a + b, a = a * b, b = a − b. Que valent a et b ?', 'b = 8, a = 24, puis b = 24 − 8 = 16 : a = 24 et b = 16.'),
    recap='Suivre un programme dans un tableau de valeurs. range(a, b) exclut b ; while répète tant que la condition est vraie. Implication et contraposée ont la même valeur de vérité ; un contre-exemple suffit à réfuter.'),
]
