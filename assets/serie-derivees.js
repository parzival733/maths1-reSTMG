/* Série derivees : extrait de assets/variants-analyse.js par tools/build_series.py.
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

  register('derivees', [
    { // 1. Pente d'une sécante
      base: {a: 1, b: 0, x1: 1, x2: 3},
      params: r => { const x1 = r.int(-2, 2); return {a: r.nonZero(1, 3), b: r.int(-5, 5), x1, x2: x1 + r.pick([2, 4])}; },
      accept: ({a, b, x1, x2}) => x1 + x2 !== 0 && a * x1 * x1 + b !== 0,
      coefs: ['a', 'b'],
      difficulty: ({a, b, x1, x2}) => score({steps: 3, values: [a, b, a * x1 * x1 + b, a * x2 * x2 + b, a * (x1 + x2)]}),
      verify: ({a, b, x1, x2}, v) => v[0] === a * x1 * x1 + b && v[1] === a * x2 * x2 + b && v[2] * (x2 - x1) === v[1] - v[0],
      build: ({a, b, x1, x2}, o) => {
        const f = x => a * x * x + b, s = a * (x1 + x2);
        return E(o, `La fonction est <strong>f(x) = ${term(a, 'x²', true)}${term(b)}</strong>. On considère les points de sa courbe d’abscisses ${fr(x1)} et ${fr(x2)}.`,
          [N(`f(${fr(x1)})`, f(x1)), N(`f(${fr(x2)})`, f(x2)), N('Pente de la sécante', s)],
          C('la pente de la sécante passant par deux points de la courbe est le taux de variation [f(x₂) − f(x₁)]/(x₂ − x₁).',
            [`f(${fr(x1)}) = ${fr(f(x1))} et f(${fr(x2)}) = ${fr(f(x2))}.`, `Pente = (${diff(f(x2), f(x1))})/(${diff(x2, x1)}) = ${fr(f(x2) - f(x1))}/${x2 - x1} = ${fr(s)}.`],
            `la sécante passe par (${fr(x1)} ; ${fr(f(x1))}) et (${fr(x2)} ; ${fr(f(x2))}) ; sa pente vaut ${fr(s)}.`),
          tasks(`Calcule f(${fr(x1)}) et f(${fr(x2)}).`, 'Calcule la pente de la sécante entre ces deux points.'));
      }
    },
    { // 2. Approcher une pente instantanée
      base: {a: 1, x: 2, c: 0},
      params: r => ({a: r.nonZero(1, 3), x: r.nonZero(1, 6), c: r.int(-5, 5)}),
      coefs: ['a', 'x', 'c'],
      decimals: 2,
      difficulty: ({a, x}) => score({steps: 3, values: [a, x, a * (2 * x + 0.1), a * (2 * x + 0.01), 2 * a * x]}),
      verify: ({a, x, c}, v) => {
        const f = t => a * t * t + c;
        return Math.abs(v[0] - (f(x + 0.1) - f(x)) / 0.1) < 1e-9 && Math.abs(v[1] - (f(x + 0.01) - f(x)) / 0.01) < 1e-7 && v[2] === 2 * a * x;
      },
      build: ({a, x, c}, o) => {
        const rate = h => F(a * (2 * x + h), 6), d = 2 * a * x;
        return E(o, `Pour <strong>f(x) = ${term(a, 'x²', true)}${term(c)}</strong>, on étudie les sécantes issues du point d’abscisse ${fr(x)}, avec un écart h = 0,1 puis h = 0,01.`,
          [N('Taux pour h = 0,1', rate(0.1)), N('Taux pour h = 0,01', rate(0.01)), N(`Nombre dérivé estimé f′(${fr(x)})`, d)],
          C(`le taux de variation entre ${fr(x)} et ${fr(x)} + h vaut [f(${fr(x)} + h) − f(${fr(x)})]/h ; quand h se rapproche de 0, il se rapproche du nombre dérivé.`,
            [`f(${fr(x)} + h) − f(${fr(x)}) = ${times(a, `[(${fr(x)} + h)² − ${pa(x)}²]`, true)}${c ? ' (la constante ' + fr(c) + ' disparaît)' : ''} = ${times(a, `(${fr(2 * x)}h + h²)`, true)}, donc le taux vaut ${a === 1 ? `${fr(2 * x)} + h` : times(a, `(${fr(2 * x)} + h)`, true)}.`,
             `Pour h = 0,1 : ${fr(rate(0.1))} ; pour h = 0,01 : ${fr(rate(0.01))}.`],
            `les taux se rapprochent de ${fr(d)} : on estime f′(${fr(x)}) = ${fr(d)}.`),
          tasks(`Calcule [f(${fr(x)} + 0,1) − f(${fr(x)})]/0,1.`, `Calcule [f(${fr(x)} + 0,01) − f(${fr(x)})]/0,01.`, 'Indique la valeur qui semble approchée.'));
      }
    },
    { // 3. Lire une tangente
      base: {m: 3, p: 2, x: 1},
      params: r => ({m: r.nonZero(1, 6), p: r.nonZero(1, 9), x: r.nonZero(1, 4)}),
      coefs: ['m', 'p'],
      difficulty: ({m, p, x}) => score({steps: 2, values: [m, p, x, m * x + p]}),
      verify: ({m, p, x}, v) => v[0] === m && v[1] === m * x + p,
      build: ({m, p, x}, o) => E(o, `La tangente à la courbe d’une fonction f au point d’abscisse ${fr(x)} a pour équation <strong>y = ${affine(m, p)}</strong>.`,
        [N(`f′(${fr(x)})`, m), N(`f(${fr(x)})`, m * x + p)],
        C('le nombre dérivé f′(a) est le coefficient directeur de la tangente au point d’abscisse a ; ce point appartient à la fois à la courbe et à la tangente.',
          [`Le coefficient directeur de la tangente est ${fr(m)}, donc f′(${fr(x)}) = ${fr(m)}.`, `Au point de tangence : y = ${times(m, x, true)}${sg(p)} = ${fr(m * x + p)}.`],
          `f′(${fr(x)}) = ${fr(m)} et f(${fr(x)}) = ${fr(m * x + p)}.`),
        tasks(`Donne f′(${fr(x)}), la pente de cette tangente.`, `Donne f(${fr(x)}), l’ordonnée du point de tangence.`))
    },
    { // 4. Trouver une équation de tangente
      base: {a: 1, x0: 1, c: 0},
      params: r => ({a: r.nonZero(1, 3), x0: r.nonZero(1, 3), c: r.int(-5, 5)}),
      accept: ({a, x0, c}) => a * x0 * x0 + c !== 0 && c !== a * x0 * x0,
      coefs: ['a', 'x0', 'c'],
      difficulty: ({a, x0, c}) => score({steps: 3, values: [a, x0, a * x0 * x0 + c, 2 * a * x0, c - a * x0 * x0]}),
      verify: ({a, x0, c}, v) => v[0] === a * x0 * x0 + c && v[1] === 2 * a * x0 && v[1] * x0 + v[2] === v[0],
      build: ({a, x0, c}, o) => {
        const y0 = a * x0 * x0 + c, m = 2 * a * x0, p = y0 - m * x0;
        return E(o, `On connaît <strong>f(x) = ${term(a, 'x²', true)}${term(c)}</strong> et <strong>f′(${fr(x0)}) = ${fr(m)}</strong>. On cherche la tangente au point d’abscisse ${fr(x0)}, sous la forme y = mx + p.`,
          [N(`f(${fr(x0)})`, y0), N('Coefficient directeur m', m), N('Ordonnée à l’origine p', p)],
          C('la tangente au point d’abscisse a a pour équation y = f′(a)(x − a) + f(a) ; on développe pour obtenir y = mx + p.',
            [`f(${fr(x0)}) = ${times(a, pa(x0) + '²', true)}${sg(c)} = ${fr(y0)} et m = f′(${fr(x0)}) = ${fr(m)}.`,
             `La tangente passe par (${fr(x0)} ; ${fr(y0)}) : ${fr(y0)} = ${fr(m)} × ${pa(x0)} + p, donc p = ${fr(y0)} − ${pa(m * x0)} = ${fr(p)}.`],
            `la tangente a pour équation y = ${affine(m, p)}.`),
          tasks(`Calcule f(${fr(x0)}).`, `Donne les coefficients m et p de la tangente en x = ${fr(x0)}.`));
      }
    },
    { // 5. Fonction affine et dérivée
      base: {a: 5, b: 7, x: 2},
      params: r => ({a: r.nonZero(1, 9), b: r.nonZero(1, 9), x: r.nonZero(1, 4)}),
      coefs: ['a', 'b'],
      difficulty: ({a, b, x}) => score({steps: 3, values: [a, b, x, a * x + b]}),
      verify: ({a, b, x}, v) => v[0] === a && v[1] === a * x + b && v[2] === (a > 0 ? 'Croissante' : 'Décroissante'),
      build: ({a, b, x}, o) => E(o, `Une fonction est <strong>g(x) = ${affine(a, b)}</strong>.`,
        [N(`g′(${fr(x)})`, a), N(`g(${fr(x)})`, a * x + b), S('Variation', a > 0 ? 'Croissante' : 'Décroissante', ['Croissante', 'Décroissante', 'Constante'])],
        C('la dérivée d’une fonction affine x ↦ ax + b est la constante a ; le signe de la dérivée donne le sens de variation.',
          [`g′(x) = ${fr(a)} pour tout x, donc g′(${fr(x)}) = ${fr(a)}.`, `g(${fr(x)}) = ${times(a, x, true)}${sg(b)} = ${fr(a * x + b)}.`],
          `la dérivée est ${a > 0 ? 'positive' : 'négative'} : g est ${a > 0 ? 'croissante' : 'décroissante'} sur ℝ.`),
        tasks(`Calcule sa dérivée en x = ${fr(x)}.`, `Calcule g(${fr(x)}).`, 'Choisis le sens de variation.'))
    },
    { // 6. Estimer un coût avec la tangente
      base: {ctx: 0, a: 0.5, b: 10, c: 100, x0: 20},
      params: r => ({ctx: r.int(0, 2), a: r.pick([0.5, 1, 1.5, 2]), b: r.int(5, 15), c: r.pick([50, 100, 150, 200]), x0: r.pick([10, 12, 15, 20])}),
      accept: ({a, b, c, x0}) => a * x0 * x0 + b * x0 + c + 0.1 * (2 * a * x0 + b) <= 1000,
      decimals: 2,
      difficulty: ({a, b, c, x0}) => { const C0 = a * x0 * x0 + b * x0 + c, Cp = 2 * a * x0 + b; return score({steps: 4, values: [a, b, c, C0, Cp, C0 + 0.1 * Cp]}); },
      verify: ({a, b, c, x0}, v) => Math.abs(v[0] - (a * x0 * x0 + b * x0 + c)) < 1e-9 && v[1] === 2 * a * x0 + b && Math.abs(v[2] - (v[0] + 0.1 * v[1])) < 1e-9,
      build: ({ctx, a, b, c, x0}, o) => {
        const k = CONTINUOUS[ctx], C0 = a * x0 * x0 + b * x0 + c, Cp = 2 * a * x0 + b, est = F(C0 + 0.1 * Cp, 6);
        return E(o, `Le coût de fabrication, en euros, de ${k.what} est <strong>C(x) = ${poly([a, b, c])}</strong>. On admet que C′(x) = ${affine(2 * a, b)}.`,
          [N(`C(${x0}), en €`, C0), N(`C′(${x0}), en € par ${k.unit}`, Cp), N(`Estimation de C(${fr(x0 + 0.1)}), en €`, est)],
          C('près de x₀, la courbe est proche de sa tangente : C(x₀ + h) ≈ C(x₀) + h × C′(x₀) pour un petit écart h.',
            [`C(${x0}) = ${times(a, x0 * x0, true)} + ${b} × ${x0} + ${c} = ${fr(C0)} et C′(${x0}) = ${times(2 * a, x0, true)} + ${b} = ${fr(Cp)}.`,
             `C(${fr(x0 + 0.1)}) ≈ ${fr(C0)} + 0,1 × ${fr(Cp)} = ${fr(est)}.`],
            `produire ${x0} ${k.unit} coûte ${eur(C0)} ; à ce niveau, un ${k.one} de plus coûte environ ${eur(Cp)}, donc C(${fr(x0 + 0.1)}) ≈ ${eur(est)}.`),
          {title: 'Interpréter un coût marginal', ...tasks(`Calcule le coût pour x = ${x0}.`, `Calcule C′(${x0}).`, `Estime C(${fr(x0 + 0.1)}) à l’aide de la tangente.`)});
      }
    },
    { // 7. Sens d'une tangente
      base: {a: 1, x0: -1, c: 0},
      params: r => ({a: r.nonZero(1, 3), x0: r.nonZero(1, 3), c: r.int(-5, 5)}),
      accept: ({a, x0, c}) => a * x0 * x0 + c !== 0 && c !== a * x0 * x0,
      coefs: ['a', 'x0', 'c'],
      difficulty: ({a, x0, c}) => score({steps: 3, values: [a, x0, a * x0 * x0 + c, 2 * a * x0, c - a * x0 * x0]}),
      verify: ({a, x0, c}, v) => v[0] === a * x0 * x0 + c && 2 * a * x0 * x0 + v[1] === v[0] && v[2] === (a * x0 > 0 ? 'Croissante' : 'Décroissante'),
      build: ({a, x0, c}, o) => {
        const y0 = a * x0 * x0 + c, s = 2 * a * x0, p = y0 - s * x0;
        return E(o, `Pour <strong>f(x) = ${term(a, 'x²', true)}${term(c)}</strong>, on connaît <strong>f′(${fr(x0)}) = ${fr(s)}</strong>. La tangente au point d’abscisse ${fr(x0)} a pour équation y = ${term(s, 'x', true)} + p.`,
          [N(`f(${fr(x0)})`, y0), N('Ordonnée à l’origine p', p), S('Sens de variation de la tangente', s > 0 ? 'Croissante' : 'Décroissante', ['Croissante', 'Décroissante'])],
          C('la tangente passe par le point (x₀ ; f(x₀)) et a pour coefficient directeur f′(x₀) ; le signe de ce coefficient donne son sens de variation.',
            [`f(${fr(x0)}) = ${times(a, pa(x0) + '²', true)}${sg(c)} = ${fr(y0)}.`, `${fr(y0)} = ${fr(s)} × ${pa(x0)} + p = ${fr(s * x0)} + p, donc p = ${fr(y0)} − ${pa(s * x0)} = ${fr(p)}.`],
            `la tangente y = ${affine(s, p)} a un coefficient directeur ${s > 0 ? 'positif' : 'négatif'} : elle est ${s > 0 ? 'croissante' : 'décroissante'}.`),
          {title: 'Sens d’une tangente', ...tasks(`Calcule f(${fr(x0)}).`, 'Trouve p dans l’équation de la tangente.', 'Indique son sens de variation.')});
      }
    },
    { // 8. Exploiter une pente et un point
      base: {x: 3, y: 7, m: -4, dx: 2},
      params: r => ({x: r.nonZero(1, 5), y: r.int(-9, 12), m: r.nonZero(1, 6), dx: r.int(1, 3)}),
      accept: ({x, y, m}) => y - m * x !== 0 && y !== 0,
      coefs: ['m'],
      difficulty: ({x, y, m, dx}) => score({steps: 4, values: [x, y, m, y - m * x, m * (x + dx) + y - m * x]}),
      verify: ({x, y, m, dx}, v) => v[0] === y && v[1] === m && m * x + v[2] === y && v[3] === m * (x + dx) + v[2],
      build: ({x, y, m, dx}, o) => {
        const b = y - m * x, x2 = x + dx;
        return E(o, `Au point <strong>A(${fr(x)} ; ${fr(y)})</strong>, une courbe possède une tangente de pente <strong>${fr(m)}</strong>.`,
          [N(`f(${fr(x)})`, y), N(`f′(${fr(x)})`, m), N('Ordonnée à l’origine b de la tangente', b), N(`Ordonnée de la tangente en x = ${fr(x2)}`, m * x2 + b)],
          C('le point de tangence donne f(x₀) et la pente donne f′(x₀) ; on trouve b en écrivant que A est sur la droite y = mx + b.',
            [`f(${fr(x)}) = ${fr(y)} et f′(${fr(x)}) = ${fr(m)}.`, `${fr(y)} = ${times(m, x, true)} + b, donc b = ${fr(y)} − ${pa(m * x)} = ${fr(b)}.`,
             `En x = ${fr(x2)} : y = ${times(m, x2, true)}${sg(b)} = ${fr(m * x2 + b)}.`],
            `la tangente a pour équation y = ${affine(m, b)} ; en x = ${fr(x2)}, son ordonnée vaut ${fr(m * x2 + b)}.`),
          tasks(`Donne f(${fr(x)}) et f′(${fr(x)}).`, 'Détermine b dans l’équation de la tangente.', `Calcule l’ordonnée de cette tangente en x = ${fr(x2)}.`));
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
  V.illustrate('derivees', [
    ({a, b, x1, x2}) => { const f = x => a * x * x + b, u = Math.min(x1, -x2) - 1, v = Math.max(x2, -x1) + 1, expr = `(${a})*x^2+(${b})`;
      return {c: FG.repere(`La sécante passe par les points de la courbe d’abscisses ${fr(x1)} et ${fr(x2)}`, frame([u, v], sample(f, u, v))).courbe(expr).secante(expr, x1, x2).description()}; },
    ({a, x, c}) => { const f = t => a * t * t + c, e = Math.abs(x) + 2, expr = `(${a})*x^2+(${c})`, t = u => 2 * a * x * (u - x) + f(x);
      return {c: FG.repere(`En pointillés, la sécante entre les abscisses ${fr(x)} et ${fr(x + 1)} (h = 1) ; en trait plein, la tangente en ${fr(x)}. Quand h diminue, la sécante se rapproche de la tangente`,
        frame([-e, e], sample(f, -e, e).concat([t(-e / 2), t(e / 2), t(0)]))).courbe(expr).secante(expr, x, x + 1, {pointilles: true}).tangente(expr, x).description()}; },
    ({m, p, x}) => { const k = (m > 0 ? -1 : 1) * Math.max(1, Math.abs(m) / 2) / 2, g = t => m * t + p + k * (t - x) * (t - x), u = Math.min(-1, x - 3), v = Math.max(1, x + 3), expr = `(${m})*x+(${p})+(${k})*(x-(${x}))^2`;
      return {e: FG.repere(`Une courbe possible pour f et sa tangente au point d’abscisse ${fr(x)}`, frame([u, v], sample(g, u, v).concat([m * u + p, m * v + p])))
        .courbe(expr).tangente(expr, x).point(x, m * x + p).description()}; },
    tangenteFig, null, coutFig, tangenteFig,
    ({x, y, m, dx}) => { const b = y - m * x;
      return {c: FG.repere(`Tangente en A : droite de pente ${fr(m)} qui passe par A`, frame([x, x + dx + 1], [y, b, m * (x + dx) + b]))
        .droite_affine(m, b).point(x, y, 'A').lecture(x + dx, m * (x + dx) + b).description()}; }
  ]);
  /* Nuage des points de l'énoncé ; le corrigé y ajoute une droite, le point moyen ou une lecture. */
  const nuageFig = (statement, plus, titre, corrige) => { const pts = pointsIn(statement), cadre = frame(pts.map(p => p[0] + 1).concat(plus ? [plus[0]] : []), pts.map(p => p[1]).concat(plus ? [plus[1]] : []));
    const base = t => FG.repere(t, cadre).nuage(xy(pts)), f = {e: base(`Nuage des points ${liste(pts)}`).description()};
    if (corrige) f.c = corrige(base(titre)).description();
    return f; };
})();
