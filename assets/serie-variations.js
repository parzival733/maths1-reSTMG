/* Série variations : extrait de assets/variants-analyse.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, productSignTable, variationTable, signTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, times, poly, affine, eur, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  const CONTINUOUS = [
    {what: 'x kilogrammes de chocolat', unit: 'kg', one: 'kilogramme'},
    {what: 'x mètres de câble', unit: 'm', one: 'mètre'},
    {what: 'x litres de peinture', unit: 'L', one: 'litre'}
  ];


  register('variations', [
    { // 1. Dériver un polynôme du second degré
      base: {a: 3, b: -4, c: 5, x: 1},
      params: r => ({a: r.nonZero(1, 5), b: r.nonZero(1, 9), c: r.int(-9, 9), x: r.nonZero(1, 3)}),
      coefs: ['a', 'b', 'c'],
      difficulty: ({a, b, c, x}) => score({steps: 3, values: [a, b, c, 2 * a, 2 * a * x + b]}),
      verify: ({a, b, x}, v) => v[0] === 2 * a && v[1] === b && v[2] === v[0] * x + v[1],
      build: ({a, b, c, x}, o) => E(o, `On donne <strong>f(x) = ${poly([a, b, c])}</strong>.`,
        [N('Coefficient A de f′(x) = Ax + B', 2 * a), N('Coefficient B', b), N(`f′(${fr(x)})`, 2 * a * x + b)],
        C('on dérive terme à terme : la dérivée de ax² est 2ax, celle de bx est b et celle d’une constante est 0.',
          [`La dérivée de ${term(a, 'x²', true)} est ${term(2 * a, 'x', true)}, celle de ${term(b, 'x', true)} est ${fr(b)}${c ? `, celle de ${fr(c)} est 0` : ''} : f′(x) = ${affine(2 * a, b)}.`, `f′(${fr(x)}) = ${fr(2 * a)} × ${pa(x)}${sg(b)} = ${fr(2 * a * x + b)}.`],
          `f′(x) = ${affine(2 * a, b)} et f′(${fr(x)}) = ${fr(2 * a * x + b)}.`),
        tasks('Complète f′(x) = Ax + B.', `Calcule f′(${fr(x)}).`))
    },
    { // 2. Dériver un polynôme de degré trois
      base: {a: 1, b: -6, d: 4, x: 2},
      params: r => ({a: r.nonZero(1, 3), b: r.nonZero(1, 6), d: r.int(-9, 9), x: r.nonZero(1, 3)}),
      coefs: ['a', 'b', 'd'],
      difficulty: ({a, b, x}) => score({steps: 3, values: [a, b, 3 * a, 2 * b, 3 * a * x * x + 2 * b * x]}),
      verify: ({a, b, x}, v) => v[0] === 3 * a && v[1] === 2 * b && v[2] === v[0] * x * x + v[1] * x,
      build: ({a, b, d, x}, o) => E(o, `Soit <strong>g(x) = ${poly([a, b, 0, d])}</strong>.`,
        [N('Coefficient A de g′(x) = Ax² + Bx', 3 * a), N('Coefficient B', 2 * b), N(`g′(${fr(x)})`, 3 * a * x * x + 2 * b * x)],
        C('on dérive terme à terme : (x³)′ = 3x², (x²)′ = 2x et la dérivée d’une constante est nulle.',
          [`g′(x) = ${poly([3 * a, 2 * b, 0])}.`, `g′(${fr(x)}) = ${times(3 * a, x * x, true)}${times(2 * b, x)} = ${fr(3 * a * x * x)}${sg(2 * b * x)} = ${fr(3 * a * x * x + 2 * b * x)}.`],
          `g′(x) = ${poly([3 * a, 2 * b, 0])} et g′(${fr(x)}) = ${fr(3 * a * x * x + 2 * b * x)}.`),
        tasks('Complète g′(x) = Ax² + Bx.', `Calcule g′(${fr(x)}).`))
    },
    { // 3. Utiliser le signe de la dérivée
      base: {a: 1, h: 3, k: -7},
      params: r => ({a: r.pick([1, -1, 2, -2]), h: r.nonZero(1, 5), k: r.int(-9, 9)}),
      coefs: ['a', 'h', 'k'],
      difficulty: ({a, h, k}) => score({steps: 4, values: [a, -2 * a * h, a * h * h + k, h, k]}),
      verify: ({a, h, k}, v) => { const f = x => a * (x - h) ** 2 + k; return 2 * a * v[0] - 2 * a * h === 0 && v[1] === f(v[0]) && v[2] === (a > 0 ? 'Décroissante' : 'Croissante') && v[3] === (a > 0 ? 'Minimum' : 'Maximum'); },
      build: ({a, h, k}, o) => {
        const b = -2 * a * h, c = a * h * h + k, f = x => a * (x - h) ** 2 + k;
        return E(o, `On étudie <strong>f(x) = ${poly([a, b, c])}</strong> sur ℝ.`,
          [N('Zéro de la dérivée', h), N('Valeur de l’extremum', k), S(`Variation pour x < ${fr(h)}`, a > 0 ? 'Décroissante' : 'Croissante', ['Croissante', 'Décroissante']),
           S('Nature de l’extremum', a > 0 ? 'Minimum' : 'Maximum', ['Minimum', 'Maximum'])],
          C('on calcule f′(x), on étudie son signe, puis on en déduit les variations de f et la valeur de l’extremum.',
            [`f′(x) = ${affine(2 * a, b)} = 0 ⇔ x = ${fr(h)}.`, `f(${fr(h)}) = ${times(a, pa(h) + '²', true)}${times(b, h)}${sg(c)} = ${fr(a * h * h)}${sg(b * h)}${sg(c)} = ${fr(k)}.`],
            `f est ${a > 0 ? 'décroissante puis croissante' : 'croissante puis décroissante'} : elle admet un ${a > 0 ? 'minimum' : 'maximum'} égal à ${fr(k)}, atteint en x = ${fr(h)}.`,
            variationTable('Signe de f′(x) et variations de f', 'f', [M + '∞', h, '+∞'], [null, k, null], a > 0 ? [-1, 1] : [1, -1])),
          tasks(`Calcule le zéro de f′(x) = ${affine(2 * a, b)}.`, 'Trouve la nature et la valeur de l’extremum de f.', `Indique la variation pour x < ${fr(h)}.`));
      }
    },
    { // 4. Maximiser un bénéfice
      base: {ctx: 0, m: 1, h: 6, k: 16},
      params: r => ({ctx: r.int(0, 2), m: r.int(1, 2), h: r.int(3, 8), k: r.int(5, 60)}),
      difficulty: ({m, h, k}) => score({steps: 4, values: [-2 * m, 2 * m * h, k - m * h * h, h, k]}),
      verify: ({m, h, k}, v) => { const B = x => -m * (x - h) ** 2 + k; return v[0] * v[2] + v[1] === 0 && v[0] === -2 * m && B(v[2]) === v[3] && B(v[2] + 1) < v[3]; },
      build: ({ctx, m, h, k}, o) => {
        const c = k - m * h * h, B = x => -m * (x - h) ** 2 + k, top = 2 * h;
        const k2 = [
          {intro: 'Une entreprise vend x centaines d’objets. Son bénéfice, en centaines d’euros, est', unit: 'centaines d’euros', end: `le bénéfice maximal est de ${eur(k * 100)}, atteint pour ${fr(h * 100)} objets vendus.`},
          {intro: 'Un artisan vend x dizaines de bijoux. Son bénéfice, en centaines d’euros, est', unit: 'centaines d’euros', end: `le bénéfice maximal est de ${eur(k * 100)}, atteint pour ${fr(h * 10)} bijoux vendus.`},
          {intro: 'Une ferme produit x tonnes de pommes. Son bénéfice, en milliers d’euros, est', unit: 'milliers d’euros', end: `le bénéfice maximal est de ${eur(k * 1000)}, atteint pour ${h} tonnes produites.`}
        ][ctx];
        return E(o, `${k2.intro} <strong>B(x) = ${poly([-m, 2 * m * h, c])}</strong> sur [0 ; ${top}].`,
          [N('Coefficient a de B′(x) = ax + b', -2 * m), N('Coefficient b de B′(x)', 2 * m * h), N('x optimal', h), N('Bénéfice maximal, en ' + k2.unit, k)],
          C('on calcule B′(x), on étudie son signe sur [0 ; ' + top + '] ; le maximum est atteint là où B′ passe du positif au négatif.',
            [`B′(x) = ${affine(-2 * m, 2 * m * h)} ; B′(x) = 0 ⇔ x = ${h}. B′(x) > 0 pour x < ${h} et B′(x) < 0 pour x > ${h}.`,
             `B(${h}) = ${times(-m, h + '²', true)} + ${2 * m * h} × ${h}${sg(c)} = ${fr(-m * h * h)}${sg(2 * m * h * h)}${sg(c)} = ${fr(k)}.`],
            k2.end + ` (B est exprimé en ${k2.unit}.)`,
            variationTable('Signe de B′(x) et variations de B sur [0 ; ' + top + ']', 'B', [0, h, top], [B(0), k, B(top)], [1, -1])),
          tasks('Écris B′(x) = ax + b.', 'Trouve l’abscisse du maximum et sa valeur.'));
      }
    },
    { // 5. Étudier un polynôme de degré trois
      base: {a: 1, d: 1, c: 0},
      params: r => ({a: r.nonZero(1, 2), d: r.int(1, 2), c: r.int(-5, 5)}),
      difficulty: ({a, d, c}) => score({steps: 5, values: [a, d, 3 * a, 3 * a * d * d, 2 * a * d ** 3 + c, -2 * a * d ** 3 + c]}),
      verify: ({a, d, c}, v) => { const h = x => a * x ** 3 - 3 * a * d * d * x + c, hp = x => 3 * a * (x * x - d * d); return hp(v[0]) === 0 && hp(v[1]) === 0 && v[0] < v[1] && v[2] === h(v[0]) && v[3] === h(v[1]) && v[4] === (hp(0) < 0 ? 'Décroissante' : 'Croissante'); },
      build: ({a, d, c}, o) => {
        const h = x => a * x ** 3 - 3 * a * d * d * x + c, L = d + 1;
        const dir = a > 0 ? 'Décroissante' : 'Croissante';
        return E(o, `Sur [${fr(-L)} ; ${L}], on considère <strong>h(x) = ${poly([a, 0, -3 * a * d * d, c])}</strong>, avec h′(x) = ${poly([3 * a, 0, -3 * a * d * d])}.`,
          [N('Premier zéro de h′', -d), N('Second zéro de h′', d), N(`h(${fr(-d)})`, h(-d)), N(`h(${d})`, h(d)), S(`Sur ]${fr(-d)} ; ${d}[`, dir, ['Croissante', 'Décroissante'])],
          C('on factorise h′(x), on dresse son tableau de signes, puis on en déduit les variations de h sur l’intervalle.',
            [`h′(x) = ${fr(3 * a)}(x² − ${d * d}) = ${fr(3 * a)}(x + ${d})(x − ${d}) : h′ s’annule en ${fr(-d)} et en ${d}.`,
             `h(${fr(-d)}) = ${fr(h(-d))} et h(${d}) = ${fr(h(d))}.`],
            `entre ${fr(-d)} et ${d}, h′(x) est ${a > 0 ? 'négative' : 'positive'} : h y est ${dir.toLowerCase()}.`,
            variationTable(`Signe de h′(x) et variations de h sur [${fr(-L)} ; ${L}]`, 'h', [-L, -d, d, L], [h(-L), h(-d), h(d), h(L)], a > 0 ? [1, -1, 1] : [-1, 1, -1])),
          {title: 'Étudier un polynôme de degré trois', ...tasks('Donne les deux zéros de h′.', `Calcule h(${fr(-d)}) et h(${d}).`, `Choisis le sens de variation sur ]${fr(-d)} ; ${d}[.`)});
      }
    },
    { // 6. Factoriser une dérivée
      base: {m: 6, A: 1},
      params: r => ({m: r.nonZero(2, 6), A: r.nonZero(1, 6)}),
      coefs: ['m', 'A'],
      difficulty: ({m, A}) => score({steps: 3, values: [m, m * A, A]}),
      verify: ({m, A}, v) => { const p = x => m * x * x - m * A * x; return v[0] === A && p(v[1]) === 0 && p(v[2]) === 0 && v[1] < v[2] && v[3] === (p((v[1] + v[2]) / 2) > 0 ? 'Positif' : 'Négatif'); },
      build: ({m, A}, o) => {
        const lo = Math.min(0, A), hi = Math.max(0, A), sign = m > 0 ? 'Négatif' : 'Positif';
        return E(o, `Une fonction p a pour dérivée <strong>p′(x) = ${poly([m, -m * A, 0])}</strong>. Écris p′(x) = ${fr(m)}x(x − A), puis trouve ses zéros et son signe entre eux.`,
          [N('A', A), N('Plus petit zéro', lo), N('Plus grand zéro', hi), S(`Signe de p′(x) pour ${fr(lo)} < x < ${fr(hi)}`, sign, ['Positif', 'Négatif', 'Nul'])],
          C('on factorise par ' + fr(m) + 'x, on lit les zéros (un produit est nul si l’un des facteurs est nul), puis on dresse le tableau de signes.',
            [`On met ${fr(m)}x en facteur : p′(x) = ${poly([m, -m * A, 0])} = ${fr(m)}x${A > 0 ? `(x − ${A})` : `(x + ${-A})`}, donc A = ${fr(A)}.`],
            `les zéros sont ${fr(lo)} et ${fr(hi)} ; entre eux, p′(x) est ${sign.toLowerCase()}.`,
            productSignTable('Signe de p′(x)', m, lo, hi)),
          tasks(`Retrouve la factorisation p′(x) = ${fr(m)}x(x − A).`, 'Trouve ses deux zéros.', 'Donne le signe de p′(x) entre ces zéros.'));
      }
    },
    { // 7. Comprendre un coût marginal
      base: {ctx: 0, a: 2, b: 10, c: 100, x0: 5},
      params: r => ({ctx: r.int(0, 2), a: r.int(1, 3), b: r.int(5, 20), c: r.pick([50, 100, 150, 200]), x0: r.int(3, 10)}),
      accept: ({a, b, c, x0}) => a * x0 * x0 + b * x0 + c <= 1000,
      decimals: 1,
      difficulty: ({a, b, c, x0}) => { const C0 = a * x0 * x0 + b * x0 + c, Cp = 2 * a * x0 + b; return score({steps: 3, values: [a, b, c, C0, Cp, Cp / 10]}); },
      verify: ({a, b, c, x0}, v) => v[0] === a * x0 * x0 + b * x0 + c && v[1] === 2 * a * x0 + b && Math.abs(v[2] - 0.1 * v[1]) < 1e-9,
      build: ({ctx, a, b, c, x0}, o) => {
        const k = CONTINUOUS[ctx], C0 = a * x0 * x0 + b * x0 + c, Cp = 2 * a * x0 + b, rise = F(0.1 * Cp, 6);
        return E(o, `Le coût, en euros, de ${k.what} est <strong>C(x) = ${poly([a, b, c])}</strong>, pour x ≥ 0. Sa dérivée est C′(x) = ${affine(2 * a, b)}.`,
          [N(`C(${x0}), en €`, C0), N(`C′(${x0}), en € par ${k.unit}`, Cp), N(`Hausse estimée pour 0,1 ${k.unit} de plus, en €`, rise)],
          C('la dérivée C′(x₀) mesure le coût d’une unité supplémentaire autour de x₀ : pour un petit écart h, la hausse du coût vaut environ h × C′(x₀).',
            [`C(${x0}) = ${times(a, x0 * x0, true)} + ${b} × ${x0} + ${c} = ${C0} et C′(${x0}) = ${2 * a} × ${x0} + ${b} = ${Cp}.`, `Hausse ≈ 0,1 × ${Cp} = ${fr(rise)}.`],
            `produire ${x0} ${k.unit} coûte ${eur(C0)} ; produire 0,1 ${k.unit} de plus coûte environ ${eur(rise)} supplémentaires.`),
          tasks(`Calcule C(${x0}).`, `Calcule C′(${x0}).`, `Estime la hausse de coût pour 0,1 ${k.unit} de plus autour de ${x0}.`));
      }
    },
    { // 8. Optimiser une recette sur un intervalle
      base: {ctx: 0, m: 2, h: 5, c: 30},
      params: r => ({ctx: r.int(0, 1), m: r.int(1, 3), h: r.int(3, 7), c: r.int(10, 60)}),
      difficulty: ({m, h, c}) => score({steps: 5, values: [-2 * m, 2 * m * h, c, c + m * h * h, h]}),
      verify: ({m, h, c}, v) => { const R = x => -m * x * x + 2 * m * h * x + c; return v[0] * v[2] + v[1] === 0 && v[3] === R(0) && v[4] === R(v[2]) && v[5] === R(2 * h) && R(v[2] - 1) < v[4]; },
      build: ({ctx, m, h, c}, o) => {
        const R = x => -m * x * x + 2 * m * h * x + c, max = c + m * h * h, top = 2 * h;
        const k = ctx
          ? {intro: `Une salle de spectacle fixe le prix x, en euros, d’une place. Sa recette, en centaines d’euros, est`, end: `la recette maximale est de ${eur(max * 100)}, obtenue pour une place à ${eur(h)}.`}
          : {intro: `Une recette, en centaines d’euros, dépend du nombre x de centaines d’articles vendus :`, end: `la recette maximale est de ${eur(max * 100)}, atteinte pour ${fr(h * 100)} articles vendus.`};
        return E(o, `${k.intro} <strong>R(x) = ${poly([-m, 2 * m * h, c])}</strong> sur [0 ; ${top}].`,
          [N('Coefficient a de R′(x) = ax + b', -2 * m), N('Coefficient b de R′(x)', 2 * m * h), N('x optimal', h), N('R(0)', c), N(`R(${h})`, max), N(`R(${top})`, c)],
          C('on calcule R′(x), on étudie son signe, on dresse le tableau de variations, puis on compare la valeur au sommet aux valeurs aux bornes.',
            [`R′(x) = ${affine(-2 * m, 2 * m * h)} ; R′(x) = 0 ⇔ x = ${h}, avec R′(x) > 0 avant ${h} et R′(x) < 0 après.`,
             `R(0) = ${c} ; R(${h}) = ${times(-m, h + '²', true)} + ${2 * m * h} × ${h} + ${c} = ${fr(-m * h * h)}${sg(2 * m * h * h)}${sg(c)} = ${max} ; R(${top}) = ${c}.`],
            k.end + ' (R est exprimé en centaines d’euros.)',
            variationTable(`Signe de R′(x) et variations de R sur [0 ; ${top}]`, 'R', [0, h, top], [c, max, c], [1, -1])),
          tasks('Calcule R′(x) = ax + b.', 'Trouve la valeur de x pour laquelle R est maximale.', `Calcule R(0), R(${h}) et R(${top}).`));
      }
    }
  ]);

  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, {frame, sample, pointsIn} = V;
  const xy = pts => pts.map(p => [p[0], p[1]]);
  const liste = pts => pts.map(p => `${p[2]}(${fr(p[0])} ; ${fr(p[1])})`).join(', ');
  /* Parabole ax² + c et sa tangente au point d'abscisse x0. */
  const tangenteFig = ({a, x0, c}, titre) => { const f = x => a * x * x + c, e = Math.abs(x0) + 2, m = 2 * a * x0, t = x => m * (x - x0) + f(x0), expr = `(${a})*x^2+(${c})`;
    return {c: FG.repere(typeof titre === 'string' ? titre : `Courbe de f et sa tangente au point d’abscisse ${fr(x0)}`, frame([-e, e], sample(f, -e, e).concat([t(-e / 2), t(e / 2), t(0)])))
      .courbe(expr).tangente(expr, x0).point(x0, f(x0)).description()}; };
  /* Courbe sur [x1 ; x2] et lecture de son extremum (h ; k). */
  const extremumFig = (titre, expr, f, x1, x2, h, k, options) => ({c: FG.repere(titre, frame([x1, x2], sample(f, x1, x2), options)).courbe(expr, {de: x1, a: x2}).lecture(h, k).description()});
  /* Coût C(x) = ax² + bx + c sur [0 ; 2x₀] et sa tangente au point d'abscisse x₀. */
  const coutFig = ({a, b, c, x0}) => { const f = x => a * x * x + b * x + c, expr = `(${a})*x^2+(${b})*x+(${c})`;
    return {c: FG.repere(`Courbe du coût et sa tangente en x = ${fr(x0)} : près de ce point, la courbe suit la tangente`, frame([2 * x0], sample(f, 0, 2 * x0), {nom_x: 'x', nom_y: 'C(x)'}))
      .courbe(expr, {de: 0, a: 2 * x0}).tangente(expr, x0).point(x0, f(x0)).description()}; };
  V.illustrate('variations', [null, null,
    ({a, h, k}) => { const f = x => a * (x - h) ** 2 + k;
      return extremumFig(`Courbe de f : ${a > 0 ? 'minimum' : 'maximum'} ${fr(k)}, atteint en x = ${fr(h)}`, `(${a})*(x-(${h}))^2+(${k})`, f, h - 3, h + 3, h, k); },
    ({m, h, k}) => extremumFig(`Courbe de B sur [0 ; ${2 * h}] : maximum ${fr(k)}, atteint en x = ${h}`, `(${-m})*(x-(${h}))^2+(${k})`, x => -m * (x - h) ** 2 + k, 0, 2 * h, h, k, {nom_x: 'x', nom_y: 'B(x)'}),
    ({a, d, c}) => { const h = x => a * x ** 3 - 3 * a * d * d * x + c, L = d + 1;
      return {c: FG.repere(`Courbe de h sur [${fr(-L)} ; ${L}] : la variation change en x = ${fr(-d)} et en x = ${d}`, frame([-L, L], sample(h, -L, L)))
        .courbe(`(${a})*x^3+(${-3 * a * d * d})*x+(${c})`, {de: -L, a: L}).lecture(-d, h(-d)).lecture(d, h(d)).description()}; },
    null, coutFig,
    ({m, h, c}) => extremumFig(`Courbe de R sur [0 ; ${2 * h}] : maximum ${fr(c + m * h * h)}, atteint en x = ${h}`, `(${-m})*x^2+(${2 * m * h})*x+(${c})`, x => -m * x * x + 2 * m * h * x + c, 0, 2 * h, h, c + m * h * h, {nom_x: 'x', nom_y: 'R(x)'})
  ]);
  /* Nuage des points de l'énoncé ; le corrigé y ajoute une droite, le point moyen ou une lecture. */
  const nuageFig = (statement, plus, titre, corrige) => { const pts = pointsIn(statement), cadre = frame(pts.map(p => p[0] + 1).concat(plus ? [plus[0]] : []), pts.map(p => p[1]).concat(plus ? [plus[1]] : []));
    const base = t => FG.repere(t, cadre).nuage(xy(pts)), f = {e: base(`Nuage des points ${liste(pts)}`).description()};
    if (corrige) f.c = corrige(base(titre)).description();
    return f; };
})();
