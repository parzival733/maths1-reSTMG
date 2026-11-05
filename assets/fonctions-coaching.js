/* Indices contextualisés du chapitre Fonctions.
   Les trois niveaux d'indice reprennent les valeurs de la variante affichée,
   avec la même écriture que l'énoncé (signe moins, pas de « + − »).
   Les exercices tremplins sont des exemples distincts de la variante courante. */
(() => {
  'use strict';

  // Paramètres des exercices d'origine écrits dans la page HTML.
  const originals = [
    {a: 3, b: -5, target: 10, x1: -2, x2: 4, xt: 5},
    {fix: 18, rate: 6, total: 60, h: 4, unit: 'h'},
    {h: 2, lo: 1, hi: 3, dir: 1, q: 0},
    {a: 3, b: 2, y1: 5, y2: 14, x1: 1, x2: 4, xq: 10},
    {fixed: 20, rateA: 9, rateB: 14, k: 4, t0: 2, q: 0},
    {kind: 0, a: 1, b: 0, x1: 2, x2: 5, x3: 6},
    {a: -2, b: 8, root: 4, max: 6},
    {D: 240, speeds: [60, 80, 120]},
    {n: 5, low: 2.23, high: 2.24}
  ];

  const V = window.ExerciseVariants;
  const f = V ? V.fmt : null;
  const fr = n => (f ? f.num(n) : String(n).replace('.', ','));
  const pa = n => (f ? f.paren(n) : (n < 0 ? '(' + fr(n) + ')' : fr(n)));
  const sg = n => (f ? f.signed(n) : (n < 0 ? ' − ' : ' + ') + fr(Math.abs(n)));
  const affine = (a, b) => (f ? f.affine(a, b) : fr(a) + 'x' + sg(b));
  const term = (a, mono) => (f ? f.term(a, mono, true) : fr(a) + mono);
  const square = h => (h === 0 ? 'x²' : '(x ' + (h > 0 ? '−' : '+') + ' ' + fr(Math.abs(h)) + ')²');
  const bridge = (q, a, help) => ({q, a: String(a), help});
  const make = (hints, diagnose, exercise) => ({hints, diagnose, bridge: exercise});

  function build(index, c) {
    if (!c) return null;
    switch (index) {
      case 0: {
        const x2 = c.x2 == null ? 4 : c.x2;
        return make([
          'Une image est la valeur obtenue en remplaçant x. Un antécédent est une valeur de x à retrouver.',
          'Avec f(x) = ' + affine(c.a, c.b) + ', pour calculer f(' + fr(x2) + '), remplace x par ' + fr(x2) + '. Pour l’antécédent de ' + fr(c.target) + ', pose f(x) = ' + fr(c.target) + '.',
          'Commence par f(' + fr(x2) + ') = ' + fr(c.a) + ' × ' + pa(x2) + sg(c.b) + '. Pour l’antécédent de ' + fr(c.target) + ', résous ' + affine(c.a, c.b) + ' = ' + fr(c.target) + ' en isolant x.'
        ], 'Vérifie que tu n’as pas confondu image et antécédent. Pour l’image, tu remplaces x ; pour l’antécédent, tu cherches x.',
        bridge('Exemple indépendant : si u(x) = 2x + 1, combien vaut u(3) ?', 7, 'Remplace x par 3 : 2 × 3 + 1 = 7.'));
      }
      case 1: {
        const h = c.h == null ? 4 : c.h, unit = c.unit || 'h';
        return make([
          'Le prix total comprend une partie fixe et une partie proportionnelle à la quantité.',
          'Pour ' + h + ' ' + unit + ', multiplie ' + fr(c.rate) + ' € par ' + h + ' puis ajoute les ' + fr(c.fix) + ' € fixes.',
          'Écris C(' + h + ') = ' + fr(c.fix) + ' + ' + fr(c.rate) + ' × ' + h + '. Pour retrouver la quantité correspondant à ' + fr(c.total) + ' €, résous ' + fr(c.fix) + ' + ' + fr(c.rate) + 't = ' + fr(c.total) + ' en retirant la partie fixe puis en divisant.'
        ], 'Vérifie que la partie fixe n’est ajoutée qu’une fois. Pour retrouver la quantité, ne divise pas le prix total directement par le tarif.',
        bridge('Exemple indépendant : 5 € fixes puis 2 € par heure. Combien pour 3 h ?', 11, '5 + 2 × 3 = 11 €.'));
      }
      case 2: {
        const dir = c.dir == null ? 1 : c.dir, a = c.h - 2;
        const expr = dir > 0 ? square(c.h) + ' − 1' : '−' + square(c.h) + ' + 1';
        return make([
          'Sur un graphique, x se lit sur l’axe horizontal et g(x) sur l’axe vertical.',
          'Pour une image, pars d’une abscisse. Pour un antécédent de 0, repère les points où la courbe coupe l’axe horizontal.',
          'Pour g(' + fr(a) + '), remplace x par ' + fr(a) + ' dans g(x) = ' + expr + '. Pour les antécédents de 0, pose ' + square(c.h) + ' = 1. Le signe de g se lit selon que la courbe est au-dessus ou au-dessous de l’axe horizontal.'
        ], 'Vérifie que tu lis les antécédents sur l’axe horizontal, et qu’une inégalité stricte n’inclut pas les zéros.',
        bridge('Exemple indépendant : si une courbe passe par (2 ; 5), quelle est l’image de 2 ?', 5, 'Le point a pour abscisse 2 et pour ordonnée 5.'));
      }
      case 3: {
        const x1 = c.x1 == null ? 1 : c.x1, x2 = c.x2 == null ? 4 : c.x2, xq = c.xq == null ? 10 : c.xq;
        return make([
          'Pour une droite, cherche d’abord le coefficient directeur a, puis l’ordonnée à l’origine b.',
          'Entre A(' + fr(x1) + ' ; ' + fr(c.y1) + ') et B(' + fr(x2) + ' ; ' + fr(c.y2) + '), divise la variation des ordonnées par celle des abscisses.',
          'Écris a = (' + fr(c.y2) + ' − ' + pa(c.y1) + ')/(' + fr(x2) + ' − ' + pa(x1) + '), puis ' + fr(c.y1) + ' = a × ' + pa(x1) + ' + b. Utilise ensuite h(' + fr(xq) + ') = a × ' + fr(xq) + ' + b ; le signe de a donne le sens de variation.'
        ], 'Pour calculer la pente, soustrais les coordonnées dans le même ordre au numérateur et au dénominateur.',
        bridge('Exemple indépendant : une droite passe par (0 ; 2) et (1 ; 5). Quel est son coefficient directeur ?', 3, '(5 − 2)/(1 − 0) = 3.'));
      }
      case 4: {
        const t0 = c.t0 == null ? 2 : c.t0, q = c.q || 0;
        return make([
          'Pour comparer deux offres, utilise la même valeur de t dans les deux formules.',
          'Pour l’égalité, pose A(t) = B(t). Pour comparer, écris l’inéquation demandée (' + (q ? 'B(t) ≤ A(t)' : 'A(t) ≤ B(t)') + ').',
          'Pour t = ' + t0 + ', calcule A(' + t0 + ') = ' + fr(c.fixed) + ' + ' + fr(c.rateA) + ' × ' + t0 + ' et B(' + t0 + ') = ' + fr(c.rateB) + ' × ' + t0 + '. Pour l’égalité, pars de ' + fr(c.fixed) + ' + ' + fr(c.rateA) + 't = ' + fr(c.rateB) + 't, puis remplace = par l’inégalité demandée.'
        ], 'Le seuil d’égalité n’est pas à lui seul l’intervalle de comparaison. Pense à vérifier le sens de l’inégalité après avoir regroupé les termes.',
        bridge('Exemple indépendant : A(t) = 10 + 2t et B(t) = 4t. Pour quelle durée sont-ils égaux ?', 5, '10 + 2t = 4t, donc 10 = 2t et t = 5.'));
      }
      case 5: {
        const x1 = c.x1 == null ? 2 : c.x1, x2 = c.x2 == null ? 5 : c.x2, x3 = c.x3 == null ? x2 + 1 : c.x3;
        const expr = c.kind ? affine(c.a, c.b) : term(c.a, 'x²');
        const q = x => (c.kind ? fr(c.a) + ' × ' + pa(x) + sg(c.b) : fr(c.a) + ' × ' + pa(x) + '²');
        return make([
          'Un taux de variation est une différence d’images divisée par une différence d’abscisses.',
          'Pour q(x) = ' + expr + ', commence par calculer q(' + x1 + '), q(' + x2 + ') et q(' + x3 + ').',
          'Écris le premier taux : [q(' + x2 + ') − q(' + x1 + ')]/(' + x2 + ' − ' + x1 + ') avec q(' + x2 + ') = ' + q(x2) + '. Pour le second, remplace ' + x1 + ' et ' + x2 + ' par ' + x2 + ' et ' + x3 + '. Compare les deux taux pour décider si q peut être affine.'
        ], 'Vérifie que tu divises bien par la différence des abscisses et que les deux taux ne sont pas automatiquement égaux.',
        bridge('Exemple indépendant : entre (1 ; 2) et (3 ; 8), quel est le taux de variation ?', 3, '(8 − 2)/(3 − 1) = 3.'));
      }
      case 6:
        return make([
          'Pour une fonction affine, le signe du coefficient de x donne le sens de variation.',
          'Dans p(x) = ' + affine(c.a, c.b) + ', le coefficient de x est ' + (c.a > 0 ? 'positif' : 'négatif') + '. Pour chercher le zéro, pose p(x) = 0.',
          'Résous ' + affine(c.a, c.b) + ' = 0. Ensuite, pour p(x) ≥ 0 sur [0 ; ' + fr(c.max) + '], conserve les abscisses où la droite est sur ou au-dessus de l’axe horizontal.'
        ], 'Vérifie le signe du coefficient directeur. Attention : dans p(x) ≥ 0, la borne où p(x) = 0 est incluse.',
        bridge('Exemple indépendant : pour u(x) = −x + 5, quelle est la solution de u(x) = 0 ?', 5, '−x + 5 = 0 revient à x = 5.'));
      case 7: {
        const s = c.speeds || [60, 80, 120];
        return make([
          'À distance fixée, durée = distance ÷ vitesse.',
          'Dans t(v) = ' + fr(c.D) + '/v, remplace v par ' + s[0] + ', ' + s[1] + ' puis ' + s[2] + '. N’oublie pas les heures.',
          'Écris t(' + s[0] + ') = ' + fr(c.D) + '/' + s[0] + ', t(' + s[1] + ') = ' + fr(c.D) + '/' + s[1] + ' et t(' + s[2] + ') = ' + fr(c.D) + '/' + s[2] + '. Compare t(' + s[0] + ') et t(' + s[2] + ') pour comprendre ce qui se passe lorsque la vitesse double ou est divisée par deux.'
        ], 'Vérifie que tu as divisé la distance par la vitesse, et non l’inverse. Ce modèle est inversement proportionnel, pas affine.',
        bridge('Exemple indépendant : combien de temps pour parcourir 100 km à 50 km/h ?', 2, 'Durée = distance ÷ vitesse = 100 ÷ 50 = 2 h.'));
      }
      case 8:
        return make([
          'Pour encadrer une racine carrée positive, compare les carrés de deux nombres positifs voisins.',
          'Teste les deux bornes ' + fr(c.low) + ' et ' + fr(c.high) + ' en calculant leurs carrés, puis compare les résultats à ' + c.n + '.',
          'Écris ' + fr(c.low) + '² et ' + fr(c.high) + '², puis vérifie lequel est plus petit et lequel est plus grand que ' + c.n + '. Comme la fonction carré est croissante sur les nombres positifs, tu peux en déduire l’encadrement de √' + c.n + '.'
        ], 'Vérifie que tu compares les deux carrés à ' + c.n + ' avant d’écrire l’encadrement, et que les bornes sont des centièmes consécutifs.',
        bridge('Exemple indépendant : quelle est la racine carrée positive de 9 ?', 3, '3² = 9, donc √9 = 3.'));
      default:
        return null;
    }
  }

  window.FonctionsCoaching = {originals, build};
})();
