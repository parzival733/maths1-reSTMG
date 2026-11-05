/* Dérivées, variations et statistiques à deux variables : modèles déclaratifs. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, productSignTable, variationTable, signTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, poly, affine, eur, MINUS: M} = fmt;
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
            [`f(${fr(x)} + h) − f(${fr(x)}) = ${fr(a)} × [(${fr(x)} + h)² − ${pa(x)}²]${c ? ' (la constante ' + fr(c) + ' disparaît)' : ''} = ${fr(a)} × (${fr(2 * x)}h + h²), donc le taux vaut ${fr(a)} × (${fr(2 * x)} + h).`,
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
          [`Le coefficient directeur de la tangente est ${fr(m)}, donc f′(${fr(x)}) = ${fr(m)}.`, `Au point de tangence : y = ${fr(m)} × ${pa(x)}${sg(p)} = ${fr(m * x + p)}.`],
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
            [`f(${fr(x0)}) = ${fr(a)} × ${pa(x0)}²${sg(c)} = ${fr(y0)} et m = f′(${fr(x0)}) = ${fr(m)}.`,
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
          [`g′(x) = ${fr(a)} pour tout x, donc g′(${fr(x)}) = ${fr(a)}.`, `g(${fr(x)}) = ${fr(a)} × ${pa(x)}${sg(b)} = ${fr(a * x + b)}.`],
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
            [`C(${x0}) = ${fr(a)} × ${x0 * x0} + ${b} × ${x0} + ${c} = ${fr(C0)} et C′(${x0}) = ${fr(2 * a)} × ${x0} + ${b} = ${fr(Cp)}.`,
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
            [`f(${fr(x0)}) = ${fr(a)} × ${pa(x0)}²${sg(c)} = ${fr(y0)}.`, `${fr(y0)} = ${fr(s)} × ${pa(x0)} + p = ${fr(s * x0)} + p, donc p = ${fr(y0)} − ${pa(s * x0)} = ${fr(p)}.`],
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
            [`f(${fr(x)}) = ${fr(y)} et f′(${fr(x)}) = ${fr(m)}.`, `${fr(y)} = ${fr(m)} × ${pa(x)} + b, donc b = ${fr(y)} − ${pa(m * x)} = ${fr(b)}.`,
             `En x = ${fr(x2)} : y = ${fr(m)} × ${pa(x2)}${sg(b)} = ${fr(m * x2 + b)}.`],
            `la tangente a pour équation y = ${affine(m, b)} ; en x = ${fr(x2)}, son ordonnée vaut ${fr(m * x2 + b)}.`),
          tasks(`Donne f(${fr(x)}) et f′(${fr(x)}).`, 'Détermine b dans l’équation de la tangente.', `Calcule l’ordonnée de cette tangente en x = ${fr(x2)}.`));
      }
    }
  ]);

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
          [`g′(x) = ${poly([3 * a, 2 * b, 0])}.`, `g′(${fr(x)}) = ${fr(3 * a)} × ${x * x} + ${pa(2 * b)} × ${pa(x)} = ${fr(3 * a * x * x)} + ${pa(2 * b * x)} = ${fr(3 * a * x * x + 2 * b * x)}.`],
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
            [`f′(x) = ${affine(2 * a, b)} = 0 ⇔ x = ${fr(h)}.`, `f(${fr(h)}) = ${fr(a)} × ${pa(h)}² + ${pa(b)} × ${pa(h)}${sg(c)} = ${fr(k)}.`],
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
             `B(${h}) = ${pa(-m)} × ${h * h} + ${2 * m * h} × ${h}${sg(c)} = ${fr(k)}.`],
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
            [`C(${x0}) = ${a} × ${x0 * x0} + ${b} × ${x0} + ${c} = ${C0} et C′(${x0}) = ${2 * a} × ${x0} + ${b} = ${Cp}.`, `Hausse ≈ 0,1 × ${Cp} = ${fr(rise)}.`],
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
             `R(0) = ${c} ; R(${h}) = ${pa(-m)} × ${h * h} + ${2 * m * h} × ${h} + ${c} = ${max} ; R(${top}) = ${c}.`],
            k.end + ' (R est exprimé en centaines d’euros.)',
            variationTable(`Signe de R′(x) et variations de R sur [0 ; ${top}]`, 'R', [0, h, top], [c, max, c], [1, -1])),
          tasks('Calcule R′(x) = ax + b.', 'Trouve la valeur de x pour laquelle R est maximale.', `Calcule R(0), R(${h}) et R(${top}).`));
      }
    }
  ]);

  register('statistiques-deux-variables', [
    { // 1. Comprendre une série de couples
      base: {s: 0, y0: 12, t: 1, d1: 3, d2: 4, d3: 3},
      params: r => ({s: r.int(0, 5), y0: r.int(5, 40), t: r.sign(), d1: r.int(1, 6), d2: r.int(1, 6), d3: r.int(1, 6)}),
      accept: ({y0, t, d1, d2, d3}) => y0 + t * (d1 + d2 + d3) > 0,
      decimals: 2,
      difficulty: ({s, y0, t, d1, d2, d3}) => { const ys = [y0, y0 + t * d1, y0 + t * (d1 + d2), y0 + t * (d1 + d2 + d3)]; return score({steps: 3, values: [...ys, s + 2.5, ys.reduce((a, b) => a + b) / 4]}); },
      verify: ({s, y0, t, d1, d2, d3}, v) => { const ys = [y0, y0 + t * d1, y0 + t * (d1 + d2), y0 + t * (d1 + d2 + d3)]; return v[0] === 4 && v[1] * 4 === 4 * s + 10 && Math.abs(v[2] * 4 - ys.reduce((a, b) => a + b)) < 1e-9; },
      build: ({s, y0, t, d1, d2, d3}, o) => {
        const xs = [1, 2, 3, 4].map(i => s + i), ys = [y0, y0 + t * d1, y0 + t * (d1 + d2), y0 + t * (d1 + d2 + d3)];
        const my = ys.reduce((a, b) => a + b) / 4;
        return E(o, `Les points observés sont <strong>${xs.map((x, i) => `(${x} ; ${ys[i]})`).join(', ')}</strong>.`,
          [N('Nombre de couples', 4), N('Abscisse moyenne', s + 2.5), N('Ordonnée moyenne', my)],
          C('chaque couple est une observation ; le point moyen G a pour coordonnées la moyenne des abscisses et la moyenne des ordonnées.',
            [`x̄ = (${xs.join(' + ')})/4 = ${fr(s + 2.5)} ; ȳ = (${ys.join(' + ')})/4 = ${ys.reduce((a, b) => a + b)}/4 = ${fr(my)}.`],
            `il y a 4 couples et G(${fr(s + 2.5)} ; ${fr(my)}).`),
          tasks('Indique le nombre d’observations.', 'Calcule les coordonnées du point moyen G.'));
      }
    },
    { // 2. Déterminer une droite d'ajustement
      base: {x1: 2, dx: 4, a: 3, b: 1, k: 2},
      params: r => ({x1: r.int(0, 4), dx: r.pick([2, 3, 4, 5]), a: r.nonZero(1, 6), b: r.nonZero(1, 9), k: r.int(1, 4)}),
      accept: ({x1, dx, a, b, k}) => k < dx && a * x1 + b !== 0 && a * (x1 + dx) + b !== 0,
      coefs: ['a', 'b'],
      difficulty: ({x1, dx, a, b, k}) => score({steps: 3, values: [a * x1 + b, a * (x1 + dx) + b, a, b, a * (x1 + k) + b]}),
      verify: ({x1, dx, a, b, k}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * (x1 + dx) + v[1] === a * (x1 + dx) + b && v[2] === a * (x1 + k) + b,
      build: ({x1, dx, a, b, k}, o) => {
        const x2 = x1 + dx, y1 = a * x1 + b, y2 = a * x2 + b, xq = x1 + k;
        return E(o, `Une droite d’ajustement passe par <strong>A(${x1} ; ${fr(y1)})</strong> et <strong>B(${x2} ; ${fr(y2)})</strong>.`,
          [N('Pente a', a), N('Ordonnée b', b), N(`Estimation pour x = ${xq}`, a * xq + b)],
          C('la pente vaut a = (y<sub>B</sub> − y<sub>A</sub>)/(x<sub>B</sub> − x<sub>A</sub>) ; on obtient b avec les coordonnées de A, puis on utilise y = ax + b.',
            [`a = (${diff(y2, y1)})/(${diff(x2, x1)}) = ${fr(y2 - y1)}/${dx} = ${fr(a)}.`, `b = ${x1 ? `${fr(y1)} − ${pa(a)} × ${x1}` : fr(y1)} = ${fr(b)}. Pour x = ${xq} : y = ${fr(a)} × ${xq}${sg(b)} = ${fr(a * xq + b)}.`],
            `la droite a pour équation y = ${affine(a, b)} ; elle donne y = ${fr(a * xq + b)} pour x = ${xq}.`),
          tasks('Détermine a et b dans y = ax + b.', `Estime y pour x = ${xq}.`));
      }
    },
    { // 3. Interpréter un modèle en contexte
      base: {ctx: 0, a: 5, b: 10, xq: 6},
      params: r => {
        const ctx = r.int(0, 2);
        if (ctx === 1) return {ctx, a: r.int(2, 6), b: r.int(60, 100), xq: r.int(5, 15)};
        if (ctx === 2) return {ctx, a: r.int(1, 2), b: r.int(4, 8), xq: r.int(2, 5)};
        return {ctx, a: r.int(2, 9), b: r.int(5, 30), xq: r.int(4, 9)};
      },
      accept: ({ctx, a, b, xq}) => (ctx === 1 ? b - a * xq > 0 : ctx === 2 ? a * xq + b <= 20 : true),
      difficulty: ({ctx, a, b, xq}) => { const s = ctx === 1 ? -a : a; return score({steps: 3, values: [s, b, s * xq + b]}); },
      verify: ({ctx, a, b, xq}, v) => { const s = ctx === 1 ? -a : a; return v[0] === s && v[1] === b && v[2] === s * xq + b && v[3] === s; },
      build: ({ctx, a, b, xq}, o) => {
        const s = ctx === 1 ? -a : a, y = s * xq + b;
        const k = [
          {intro: `Le chiffre d’affaires y (en milliers d’euros) est estimé par <strong>y = ${affine(s, b)}</strong>, où x est le nombre de campagnes publicitaires.`, gain: 'Gain prévu pour une campagne de plus', unit: 'milliers d’euros',
            end: `pour ${xq} campagnes, le chiffre d’affaires prévu est de ${fr(y)} milliers d’euros, soit ${eur(y * 1000)} ; chaque campagne supplémentaire ajoute environ ${fr(a)} milliers d’euros.`},
          {intro: `La consommation y d’un chauffage (en kWh par jour) est estimée par <strong>y = ${affine(s, b)}</strong>, où x est la température extérieure en °C.`, gain: 'Variation de y pour 1 °C de plus', unit: 'kWh',
            end: `à ${xq} °C, la consommation prévue est de ${fr(y)} kWh par jour ; chaque degré de plus fait baisser la consommation d’environ ${fr(a)} kWh.`},
          {intro: `La note y (sur 20) d’un élève est estimée par <strong>y = ${affine(s, b)}</strong>, où x est le nombre d’heures de révision.`, gain: 'Gain prévu pour une heure de plus', unit: 'points',
            end: `pour ${xq} heures de révision, la note prévue est ${fr(y)}/20 ; chaque heure de plus ajoute environ ${fr(a)} point${a > 1 ? 's' : ''} dans ce modèle.`}
        ][ctx];
        return E(o, k.intro,
          [N('Pente a', s), N('Ordonnée à l’origine b', b), N(`Prévision pour x = ${xq}`, y), N(k.gain, s)],
          C('dans y = ax + b, la pente a est la variation de y quand x augmente de 1 ; b est la valeur de y pour x = 0. On remplace x pour prévoir.',
            [`a = ${fr(s)} et b = ${fr(b)} ; pour x = ${xq} : y = ${fr(s)} × ${xq} + ${b} = ${fr(y)}.`],
            k.end + ' Une prévision par un modèle reste une estimation.'),
          tasks('Donne la pente et l’ordonnée à l’origine.', `Estime y pour x = ${xq}.`, 'Interprète la pente.'));
      }
    },
    { // 4. Nuage aligné
      base: {a: 2, b: 2},
      params: r => ({a: r.nonZero(1, 6), b: r.int(-8, 10)}),
      accept: ({a, b}) => [1, 2, 3, 4, 5].every(x => a * x + b !== 0) && b !== 0,
      coefs: ['a', 'b'],
      difficulty: ({a, b}) => score({steps: 3, values: [a, b, a + b, 2 * a + b, 3 * a + b, 4 * a + b, 5 * a + b]}),
      verify: ({a, b}, v) => v[0] === a && v[1] === b && v[2] === 5 * v[0] + v[1],
      build: ({a, b}, o) => {
        const pts = [1, 2, 3, 4].map(x => `(${x} ; ${fr(a * x + b)})`);
        return E(o, `Un petit nuage est formé des points <strong>${pts.join(', ')}</strong>.`,
          [N('Pente', a), N('Ordonnée à l’origine', b), N('Valeur prévue à x = 5', 5 * a + b)],
          C('les points sont alignés : la pente est la variation de y quand x augmente de 1 ; on trouve l’ordonnée à l’origine avec un point.',
            [`Quand x augmente de 1, y varie de ${fr(a)} : a = ${fr(a)}.`, `Avec (1 ; ${fr(a + b)}) : ${fr(a + b)} = ${fr(a)} × 1 + b, donc b = ${fr(b)}.`],
            `la droite a pour équation y = ${affine(a, b)} et donne ${fr(5 * a + b)} pour x = 5.`),
          tasks('Donne la pente de la droite qui les relie.', 'Détermine l’ordonnée à l’origine.', 'Prévois y pour x = 5.'));
      }
    },
    { // 5. Interpoler ou extrapoler ?
      base: {a: 8, b: 15, lo: 1, span: 4, xin: 3, out: 2, order: 0},
      params: r => { const lo = r.int(1, 3), span = r.int(3, 6); return {a: r.int(2, 9), b: r.int(5, 30), lo, span, xin: r.int(lo + 1, lo + span - 1), out: r.int(1, 4), order: r.int(0, 1)}; },
      difficulty: ({a, b, lo, span, xin, out}) => score({steps: 3, values: [a, b, a * xin + b, a * (lo + span + out) + b]}),
      verify: ({a, b, lo, span, xin, out, order}, v) => {
        const xo = lo + span + out, x1 = order ? xo : xin, x2 = order ? xin : xo;
        return v[0] === a * x1 + b && v[1] === a * x2 + b && v[2] === (order ? 'Extrapolation' : 'Interpolation') && v[3] === (order ? 'Interpolation' : 'Extrapolation');
      },
      build: ({a, b, lo, span, xin, out, order}, o) => {
        const hi = lo + span, xo = hi + out, x1 = order ? xo : xin, x2 = order ? xin : xo;
        const kind = x => (x >= lo && x <= hi ? 'Interpolation' : 'Extrapolation');
        return E(o, `On a mesuré une grandeur pour <strong>${lo} ≤ x ≤ ${hi}</strong> et retenu l’ajustement <strong>y = ${affine(a, b)}</strong>.`,
          [N(`Prévision pour x = ${x1}`, a * x1 + b), N(`Prévision pour x = ${x2}`, a * x2 + b),
           S(`x = ${x1}`, kind(x1), ['Interpolation', 'Extrapolation']), S(`x = ${x2}`, kind(x2), ['Interpolation', 'Extrapolation'])],
          C(`on remplace x dans l’équation ; une estimation est une interpolation si x est dans la plage observée [${lo} ; ${hi}], une extrapolation sinon.`,
            [`Pour x = ${x1} : y = ${a} × ${x1} + ${b} = ${a * x1 + b} ; pour x = ${x2} : y = ${a} × ${x2} + ${b} = ${a * x2 + b}.`],
            `x = ${xin} est dans [${lo} ; ${hi}] : interpolation. x = ${xo} est hors de cette plage : extrapolation, à interpréter avec prudence.`),
          tasks(`Calcule y pour x = ${x1} puis x = ${x2}.`, 'Classe les deux estimations.'));
      }
    },
    { // 6. Passer par le point moyen
      base: {y1: 10, d1: 3, d2: 2, d3: 3},
      params: r => ({y1: r.int(5, 30), d1: r.int(1, 6), d2: r.int(1, 6), d3: r.int(1, 6)}),
      decimals: 2,
      difficulty: ({y1, d1, d2, d3}) => {
        const ys = [y1, y1 + d1, y1 + d1 + d2, y1 + d1 + d2 + d3], my = ys.reduce((a, b) => a + b) / 4, a = (3 * (ys[3] - ys[0]) + (ys[2] - ys[1])) / 10;
        return score({steps: 4, values: [...ys, a, my - 2.5 * a, my, 5 * a + my - 2.5 * a]});
      },
      verify: ({y1, d1, d2, d3}, v) => {
        const ys = [y1, y1 + d1, y1 + d1 + d2, y1 + d1 + d2 + d3], my = ys.reduce((a, b) => a + b) / 4;
        const a = [1, 2, 3, 4].reduce((s, x, i) => s + (x - 2.5) * (ys[i] - my), 0) / 5, b = my - 2.5 * a;
        return v[0] === 2.5 && Math.abs(v[1] - my) < 1e-9 && Math.abs(v[2] - (a * 2.5 + b)) < 1e-9 && Math.abs(v[3] - (5 * a + b)) < 1e-9;
      },
      build: ({y1, d1, d2, d3}, o) => {
        const ys = [y1, y1 + d1, y1 + d1 + d2, y1 + d1 + d2 + d3], my = ys.reduce((a, b) => a + b) / 4;
        const a = F((3 * (ys[3] - ys[0]) + (ys[2] - ys[1])) / 10, 6), b = F(my - 2.5 * a, 6), y5 = F(5 * a + b, 6);
        return E(o, `Pour les données x : <strong>1 ; 2 ; 3 ; 4</strong> et y : <strong>${ys.join(' ; ')}</strong>, on propose la droite d’ajustement <strong>y = ${affine(a, b)}</strong>.`,
          [N('x moyen', 2.5), N('y moyen', my), N('Valeur de la droite en x = 2,5', my), N('Estimation pour x = 5', y5)],
          C('on calcule les coordonnées du point moyen G ; une droite d’ajustement par les moindres carrés passe par G ; on l’utilise ensuite pour estimer y.',
            [`x̄ = (1 + 2 + 3 + 4)/4 = 2,5 ; ȳ = (${ys.join(' + ')})/4 = ${fr(my)}.`, `En x = 2,5 : y = ${fr(a)} × 2,5${sg(b)} = ${fr(my)} ; en x = 5 : y = ${fr(a)} × 5${sg(b)} = ${fr(y5)}.`],
            `la droite passe par G(2,5 ; ${fr(my)}) et prévoit y = ${fr(y5)} pour x = 5.`),
          tasks('Calcule les coordonnées de G.', 'Vérifie la valeur donnée par la droite en x = 2,5.', 'Prévois y en x = 5.'));
      }
    },
    { // 7. Portée d'une prévision
      base: {a: 0.8, b: 25, lo: 10, span: 40, k: 2, out: 20, order: 0},
      params: r => ({a: r.pick([0.5, 0.8, 1.2, 1.5, 2, 2.5]), b: r.int(5, 40), lo: r.pick([0, 10, 20]), span: r.pick([30, 40, 50]), k: r.int(1, 2), out: r.pick([10, 20, 30]), order: r.int(0, 1)}),
      decimals: 1,
      difficulty: ({a, b, lo, k, span, out}) => score({steps: 3, values: [a, b, a * (lo + 10 * k) + b, a * (lo + span + out) + b]}),
      verify: ({a, b, lo, span, k, out, order}, v) => { const xin = lo + 10 * k, xo = lo + span + out, x1 = order ? xo : xin, x2 = order ? xin : xo; return Math.abs(v[0] - (a * x1 + b)) < 1e-9 && Math.abs(v[1] - (a * x2 + b)) < 1e-9 && v[2] === `x = ${xo}`; },
      build: ({a, b, lo, span, k, out, order}, o) => {
        const hi = lo + span, xin = lo + 10 * k, xo = hi + out, x1 = order ? xo : xin, x2 = order ? xin : xo;
        return E(o, `On possède des mesures pour <strong>${lo} ≤ x ≤ ${hi}</strong> et un ajustement <strong>y = ${affine(a, b)}</strong>.`,
          [N(`y pour x = ${x1}`, F(a * x1 + b, 6)), N(`y pour x = ${x2}`, F(a * x2 + b, 6)), S('Extrapolation', `x = ${xo}`, [`x = ${x1}`, `x = ${x2}`, 'Les deux'])],
          C(`on remplace x dans l’équation ; on compare ensuite chaque valeur de x à la plage des mesures [${lo} ; ${hi}].`,
            [`Pour x = ${x1} : y = ${fr(a)} × ${x1} + ${b} = ${fr(a * x1 + b)} ; pour x = ${x2} : y = ${fr(a)} × ${x2} + ${b} = ${fr(a * x2 + b)}.`],
            `x = ${xo} est hors de [${lo} ; ${hi}] : c’est le calcul qui extrapole ; la valeur obtenue en x = ${xin} est une interpolation.`),
          tasks(`Estime y en x = ${x1} et en x = ${x2}.`, 'Identifie le calcul qui extrapole.'));
      }
    },
    { // 8. Corrélation et causalité
      base: {ctx: 0, a: 2, b: 9, q: 0},
      params: r => ({ctx: r.int(0, 1), a: r.int(1, 6), b: r.int(3, 20), q: r.int(0, 1)}),
      difficulty: ({a, b}) => score({steps: 2, values: [a + b, 2 * a + b, 3 * a + b, 4 * a + b, a, b]}),
      verify: ({a, b, q}, v) => v[0] === a && v[1] === b && v[2] === (q ? 'Oui' : 'Non'),
      build: ({ctx, a, b, q}, o) => {
        const pts = [1, 2, 3, 4].map(x => `(${x} ; ${a * x + b})`).join(', ');
        const k = ctx
          ? {intro: `Sur plusieurs journées d’été, on relève (nombre de glaces vendues, en centaines ; nombre de coups de soleil soignés) : <strong>${pts}</strong>.`,
            cause: 'Ces données prouvent-elles que manger des glaces provoque des coups de soleil ?', link: 'Ces données montrent-elles que les deux grandeurs varient ensemble ?',
            other: 'l’ensoleillement, qui fait augmenter à la fois les ventes de glaces et les coups de soleil'}
          : {intro: `Les observations (dépenses publicitaires ; ventes) sont <strong>${pts}</strong>, en unités adaptées.`,
            cause: 'La corrélation prouve-t-elle que la publicité cause seule les ventes ?', link: 'Ces données montrent-elles que les ventes augmentent avec les dépenses publicitaires ?',
            other: 'la saison, les prix ou la concurrence'};
        return E(o, k.intro,
          [N('Pente', a), N('Ordonnée à l’origine', b), S(q ? k.link : k.cause, q ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('les points sont alignés : on lit la pente et l’ordonnée à l’origine ; une corrélation décrit une variation commune, elle ne démontre pas une cause.',
            [`Quand x augmente de 1, y augmente de ${a} : la pente vaut ${a}. Avec (1 ; ${a + b}), on trouve b = ${a + b} − ${a} = ${b}.`],
            `les points sont sur la droite y = ${affine(a, b)} : les deux grandeurs varient ensemble. ${q ? 'La réponse est donc oui.' : 'Cela ne prouve pas un lien de cause à effet : la réponse est non.'} Un autre facteur peut intervenir, par exemple ${k.other}.`),
          {title: 'Garder l’esprit critique', ...tasks('Calcule la pente et l’ordonnée à l’origine de la droite.', 'Réponds à la question posée sur la relation entre les deux grandeurs.')});
      }
    }
  ]);
})();
