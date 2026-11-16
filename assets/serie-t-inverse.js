/* Série t-inverse : extrait de assets/terminale-exercices.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant Terminale.');
  const {N, S, C, F, score, fmt, productSignTable, variationTable, signTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, times, poly, affine, frac, pct, eur, MINUS: M} = fmt;
  // Valeur exacte, ou arrondie au millième (ou à `digits` décimales).
  const Q = (label, value, digits = 3) => N(label, F(value, 9), 1e-8, digits);
  const choice = (label, answer, options, settings) => S(label, answer, options, settings);
  const r3 = (x, d = 3) => Math.round(x * 10 ** d + (x >= 0 ? 1e-9 : -1e-9)) / 10 ** d;
  const eq = (x, d = 3) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '= ' + fr(x) : '≈ ' + fr(r3(x, d)));
  const sub = k => String(k).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
  // Quotient n/d écrit sans « /1 ».
  const over = (n, d) => (d === 1 ? fr(n) : fr(n) + '/' + d);
  const tenth = r => r.int(1, 9) / 10;
  const code = text => '<code>' + text + '</code>';
  // Somme écrite sans « + − » : addAll([3, −2, 5]) → « 3 − 2 + 5 ».
  const addAll = list => list.map((x, i) => (i ? sg(x) : fr(x))).join('');
  const binom = (n, k) => {
    if (k < 0 || k > n) return 0;
    let v = 1;
    for (let j = 1; j <= Math.min(k, n - k); j++) v = v * (n - j + 1) / j;
    return Math.round(v);
  };
  const mass = (n, p, k) => binom(n, k) * p ** k * (1 - p) ** (n - k);
  const cumulative = (n, p, k) => { let s = 0; for (let j = 0; j <= k; j++) s += mass(n, p, j); return s; };
  const TASKS = ['Renseigne chaque champ. Pour un résultat non exact, arrondis au millième, sauf indication contraire. La calculatrice peut servir à contrôler les calculs.'];
  const item = (title, statement, fields, correction, hint) => ({
    title, statement, fields, correction: Array.isArray(correction) ? correction : [correction],
    hint, level: 'Terminale STMG', tasks: TASKS
  });
  // Les nombres de Terminale restent raisonnables : au plus 100 000 en valeur absolue.
  const T = model => ({limit: 100000, decimals: 6, ...model});
  const close = (a, b, eps = 1e-7) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));

  const models = {
    't-inverse': [
      T({ // Images par la fonction inverse
        base: {x1: 3, x2: -3},
        params: r => ({x1: r.pick([2, 3, 4, 5, 8, 10, 0.5, 0.25]), x2: -r.pick([2, 3, 4, 5, 8, 10, 0.5, 0.25])}),
        space: 64,
        difficulty: ({x1, x2}) => score({steps: 2, values: [x1, x2, 1 / x1, 1 / x2]}),
        verify: ({x1, x2}, v) => close(v[0] * x1, 1) && close(v[1] * x2, 1),
        build: ({x1, x2}) => item('Images par la fonction inverse', `f(x) = 1/x pour x non nul. Calcule f(${fr(x1)}) et f(${fr(x2)}).`,
          [Q(`f(${fr(x1)})`, 1 / x1), Q(`f(${fr(x2)})`, 1 / x2)],
          C('l’image de x par la fonction inverse est 1/x ; l’inverse d’un nombre a le même signe que lui, et 0 n’a pas d’image.',
            [`f(${fr(x1)}) = 1/${fr(x1)} ${eq(1 / x1)} ; f(${fr(x2)}) = 1/(${fr(x2)}) ${eq(1 / x2)}.`],
            `f(${fr(x1)}) ${eq(1 / x1)} et f(${fr(x2)}) ${eq(1 / x2)}. Une fraction exacte est acceptée.`),
          'Garde le signe du nombre dans le dénominateur.')
      }),
      T({ // Dériver une somme
        base: {k: 9, a: 3},
        params: r => ({k: r.int(2, 20), a: r.int(1, 6)}),
        difficulty: ({k, a}) => score({steps: 3, values: [k, a, a + k / a, 1 - k / (a * a)]}),
        verify: ({k, a}, v) => close(v[0], a + k / a) && close(v[1], 1 - k / (a * a)),
        build: ({k, a}) => item('Dériver une somme', `f(x) = x + ${k}/x pour x > 0. Calcule l’image et le nombre dérivé en x = ${a}.`,
          [Q(`f(${a})`, a + k / a), Q(`f′(${a})`, 1 - k / (a * a))],
          C(`la dérivée de x est 1 et celle de k/x est −k/x² : f′(x) = 1 − ${k}/x².`,
            [`f(${a}) = ${a} + ${over(k, a)} ${eq(a + k / a)}.`, `f′(${a}) = 1 − ${over(k, a * a)} ${eq(1 - k / (a * a))}.`],
            `f(${a}) ${eq(a + k / a)} et f′(${a}) ${eq(1 - k / (a * a))}.`),
          'La dérivée de 1/x est −1/x², puis on multiplie par le coefficient.')
      }),
      T({ // Lire les asymptotes
        base: {b: 3, k: 4, c: 0},
        params: r => ({b: r.nonZero(1, 9), k: r.nonZero(1, 9), c: r.int(-4, 4)}),
        difficulty: ({b, k, c}) => score({steps: 2, values: [b, k, c]}),
        verify: ({b, c}, v) => v[0] === c && v[1] === b,
        build: ({b, k, c}) => {
          const den = c === 0 ? 'x' : `(x ${c > 0 ? M : '+'} ${Math.abs(c)})`, expr = `${fr(b)} ${k > 0 ? '+' : M} ${Math.abs(k)}/${den}`;
          return item('Lire les asymptotes', `f(x) = ${expr} pour x ≠ ${fr(c)}. Donne les équations des asymptotes x = A et y = B à la courbe de f.`,
            [Q('A (asymptote verticale)', c), Q('B (asymptote horizontale)', b)],
            C('le quotient devient très grand en valeur absolue quand son dénominateur s’annule (asymptote verticale) ; il se rapproche de 0 quand x devient très grand en valeur absolue (asymptote horizontale).',
              [`Le dénominateur s’annule pour x = ${fr(c)} : la droite x = ${fr(c)} est asymptote verticale.`, `Quand x devient très grand en valeur absolue, ${Math.abs(k)}/${den} se rapproche de 0 et f(x) de ${fr(b)}.`],
              `les asymptotes sont x = ${fr(c)} et y = ${fr(b)}.`),
            'Sépare le terme constant de la fraction qui tend vers zéro pour les grandes valeurs absolues de x.');
        }
      }),
      T({ // Minimiser un coût moyen
        base: {m: 3, b: 6},
        params: r => ({m: r.int(2, 12), b: r.int(1, 30)}),
        difficulty: ({m, b}) => score({steps: 4, values: [m * m, b, m, 2 * m + b]}),
        verify: ({m, b}, v) => { const Cx = x => x + m * m / x + b; return close(1 - m * m / (v[0] * v[0]), 0) && close(v[1], Cx(v[0])) && Cx(v[0] - 0.5) > v[1] && Cx(v[0] + 0.5) > v[1]; },
        build: ({m, b}) => item('Minimiser un coût moyen', `Modèle fictif : le coût moyen est C(x) = x + ${m * m}/x + ${b}, pour x > 0. Cherche son minimum.`,
          [Q('Valeur de x au minimum', m), Q('Coût minimal', 2 * m + b)],
          C('on calcule C′(x), on met au même dénominateur, on étudie son signe sur ]0 ; +∞[ puis on dresse le tableau de variations.',
            [`C′(x) = 1 − ${m * m}/x² = (x² − ${m * m})/x² = (x − ${m})(x + ${m})/x². Sur ]0 ; +∞[, x + ${m} > 0 et x² > 0 : C′(x) a le signe de x − ${m}.`,
             `C(${m}) = ${m} + ${m * m}/${m} + ${b} = ${2 * m + b}.`],
            `C est décroissante sur ]0 ; ${m}] puis croissante : le coût minimal vaut ${2 * m + b}, atteint pour x = ${m}.`,
            variationTable('Signe de C′(x) et variations de C', 'C', ['0', m, '+∞'], [null, 2 * m + b, null], [-1, 1])),
          'Dérive, mets au même dénominateur et étudie le signe sur le domaine positif.')
      }),
      T({ // Tangente à une fonction inverse
        base: {a: 3, k: 18},
        params: r => ({a: r.int(1, 5), k: r.int(1, 30)}),
        difficulty: ({a, k}) => score({steps: 3, values: [a, k, k / a, -k / (a * a), 2 * k / a]}),
        verify: ({a, k}, v) => close(v[0], -k / (a * a)) && close(v[0] * a + v[1], k / a),
        build: ({a, k}) => { const m = -k / (a * a), p = 2 * k / a; return item('Tangente à une fonction inverse', `f(x) = ${k}/x pour x > 0. Écris la tangente à la courbe de f en x = ${a} sous la forme y = mx + p.`,
          [Q('m', m), Q('p', p)],
          C('la tangente en a a pour équation y = f′(a)(x − a) + f(a), avec f′(x) = −k/x².',
            [a === 1 ? `m = f′(1) = −${k} ; f(1) = ${k}.` : `m = f′(${a}) = −${k}/${a * a} ${eq(m)} ; f(${a}) = ${k}/${a} ${eq(k / a)}.`,
             a === 1 ? `p = f(1) − m × 1 = ${k} + ${k} = ${2 * k}.` : `p = f(${a}) − m × ${a} = ${k}/${a} + ${k}/${a} = ${2 * k}/${a} ${eq(p)}.`],
            Number.isInteger(m) && Number.isInteger(p) ? `la tangente a pour équation y = ${affine(m, p)}.`
              : `la tangente a pour équation y ≈ ${affine(r3(m), r3(p))} (valeurs exactes : m = −${k}/${a * a} et p = ${over(2 * k, a)}).`),
          'Utilise y = f(a) + f′(a)(x − a), puis développe.'); }
      }),
      T({ // Polynôme et inverse
        base: {a: 2, b: 3, k: 4, x: 2},
        params: r => ({a: r.int(1, 4), b: r.int(-4, 5), k: r.int(1, 12), x: r.int(1, 3)}),
        difficulty: ({a, b, k, x}) => score({steps: 4, values: [a, b, k, a * x ** 3 + b * x * x - 2 * x + k / x, 3 * a * x * x + 2 * b * x - 2 - k / (x * x)]}),
        verify: ({a, b, k, x}, v) => close(v[0], a * x ** 3 + b * x * x - 2 * x + k / x) && close(v[1], 3 * a * x * x + 2 * b * x - 2 - k / (x * x)),
        build: ({a, b, k, x}) => {
          const fx = a * x ** 3 + b * x * x - 2 * x + k / x, dx = 3 * a * x * x + 2 * b * x - 2 - k / (x * x);
          return item('Polynôme et inverse', `f(x) = ${poly([a, b, -2, 0])} + ${k}/x, avec x > 0.`,
            [Q(`f(${x})`, fx), Q(`f′(${x})`, dx)],
            C('on dérive terme à terme : (x³)′ = 3x², (x²)′ = 2x, (x)′ = 1 et (k/x)′ = −k/x².',
              [`f′(x) = ${poly([3 * a, 2 * b, -2])} − ${k}/x².`, `f(${x}) ${eq(fx)} et f′(${x}) ${eq(dx)}.`],
              `f(${x}) ${eq(fx)} et f′(${x}) ${eq(dx)}.`),
            'Dérive chaque terme séparément avant l’application numérique.');
        }
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-inverse': ['Vérifie le domaine : on ne divise jamais par zéro.', 'Calcule 1/4.', '0.25', 'Une fraction exacte ou 0,25 convient.'],
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  /* Figures calculées avec les paramètres de chaque variante. Celles des séries de statistiques
     et de probabilités sont dans assets/terminale-figures.js. */
  const FG = window.Figures;
  if (FG) {
    V.illustrate('t-inverse', [null, null,
    ({b, k, c}) => { const e = Math.max(4, 2 * Math.abs(k));
      return {c: FG.repere(`Asymptotes de la courbe : la droite verticale x = ${fr(c)} et la droite horizontale y = ${fr(b)}`,
        {xmin: Math.min(c - 5, -1), xmax: Math.max(c + 5, 1), ymin: Math.min(b - e, -1), ymax: Math.max(b + e, 1), hauteur: 280})
        .courbe(`(${b})+(${k})/(x-(${c}))`).asymptote_v(c, {nom: 'x = ' + fr(c)}).asymptote_h(b, Math.abs(b) < 0.3 * e ? {} : {nom: 'y = ' + fr(b)}).description()}; },
    ({m, b}) => ({c: FG.repere(`Coût moyen C(x) = x + ${m * m}/x + ${b} : minimum ${2 * m + b}, atteint pour x = ${m}`,
      {xmin: 0, xmax: 3 * m, ymin: 0, ymax: Math.ceil((2 * m + b) * 1.6 + 2), hauteur: 280, nom_x: 'x', nom_y: 'coût moyen'})
      .courbe(`x+(${m * m})/x+(${b})`, {de: m / 8}).lecture(m, 2 * m + b).description()}),
    ({a, k}) => ({c: FG.repere(`Courbe de f(x) = ${k}/x et sa tangente au point d’abscisse ${a}`,
      {xmin: 0, xmax: 2 * a + 1, ymin: 0, ymax: 2.3 * k / a, hauteur: 280})
      .courbe(`(${k})/x`, {de: a / 8}).tangente(`(${k})/x`, a).point(a, k / a, 'A').description()}),
    null
  ]);
  }
  window.TerminaleExercises = {slugs: Object.keys(models), count: 6, binom, mass, cumulative, PATTERNS, LAWS};
  window.ExerciseCoaching = {
    context: exercise => (exercise ? exercise.statement : ''),
    build: (slug, index, exercise) => {
      if (!basics[slug] || !exercise) return null;
      const b = basics[slug];
      return {hints: [b[0], clean(exercise.hint), 'Dans cet essai : ' + clean(exercise.statement)],
        diagnose: 'Piste à vérifier : ' + clean(exercise.hint),
        bridge: {q: 'Exemple indépendant : ' + b[1], a: b[2], help: b[3]}};
    }
  };
  if (typeof document !== 'undefined') {
    const root = document.querySelector('[data-terminale-chapter]');
    const node = document.getElementById('exercise-data');
    if (root && node) {
      const slug = root.dataset.terminaleChapter;
      if (!models[slug]) throw new Error('Chapitre Terminale inconnu : ' + slug);
      node.textContent = JSON.stringify({slug, exercises: models[slug].map((_, i) => V.original(slug, i))});
    }
  }
})();
