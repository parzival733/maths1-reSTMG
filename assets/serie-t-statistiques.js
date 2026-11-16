/* Série t-statistiques : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-statistiques': [
      T({ // Point moyen
        base: {a: 3, b: 6, s: 1, pat: 0},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-5, 20), s: r.int(0, 5), pat: r.int(0, 3)}),
        difficulty: ({a, b, s}) => score({steps: 3, values: [s + 1, s + 4, a * (s + 4) + b + 2, s + 2.5, a * (s + 2.5) + b]}),
        verify: ({a, b, s, pat}, v) => { const x = [1, 2, 3, 4].map(i => s + i), e = PATTERNS[pat], y = x.map((t, i) => a * t + b + e[i]); return close(v[0], (x[0] + x[1] + x[2] + x[3]) / 4) && close(v[1], (y[0] + y[1] + y[2] + y[3]) / 4); },
        build: ({a, b, s, pat}) => {
          const x = [1, 2, 3, 4].map(i => s + i), e = PATTERNS[pat], y = x.map((t, i) => a * t + b + e[i]);
          return item('Point moyen', `Quatre observations fictives : ${x.map((t, i) => `(${t} ; ${fr(y[i])})`).join(', ')}. Donne les coordonnées du point moyen G.`,
            [Q('Abscisse moyenne', s + 2.5), Q('Ordonnée moyenne', a * (s + 2.5) + b)],
            C('le point moyen a pour coordonnées la moyenne des abscisses et la moyenne des ordonnées, calculées séparément.',
              [`x̄ = (${x.join(' + ')})/4 = ${fr(s + 2.5)} ; ȳ = (${addAll(y)})/4 = ${fr(a * (s + 2.5) + b)}.`],
              `G(${fr(s + 2.5)} ; ${fr(a * (s + 2.5) + b)}).`),
            'Ne mélange pas les deux colonnes de données.');
        }
      }),
      T({ // Droite passant par deux points moyens
        base: {a: 3, b: 4, x1: 2, dx: 2},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-9, 12), x1: r.int(1, 4), dx: r.int(2, 5)}),
        difficulty: ({a, b, x1, dx}) => score({steps: 3, values: [x1, x1 + dx, a * x1 + b, a * (x1 + dx) + b, a, b]}),
        verify: ({a, b, x1, dx}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * (x1 + dx) + v[1] === a * (x1 + dx) + b,
        build: ({a, b, x1, dx}) => { const x2 = x1 + dx, y1 = a * x1 + b, y2 = a * x2 + b; return item('Droite passant par deux points moyens', `Une droite d’ajustement passe par G₁(${x1} ; ${fr(y1)}) et G₂(${x2} ; ${fr(y2)}). Écris son équation y = ax + b.`,
          [Q('a', a), Q('b', b)],
          C('le coefficient directeur vaut (y₂ − y₁)/(x₂ − x₁) ; on obtient b en utilisant l’un des deux points.',
            [`a = (${diff(y2, y1)})/(${x2} − ${x1}) = ${fr(y2 - y1)}/${dx} = ${fr(a)}.`, `b = ${fr(y1)} − ${pa(a)} × ${x1} = ${fr(b)}.`],
            `la droite a pour équation y = ${affine(a, b)}.`),
          'Calcule une pente, puis utilise un des points pour retrouver l’ordonnée à l’origine.'); }
      }),
      T({ // Prévoir et qualifier
        base: {a: 3, b: 11, inside: 0, x: 12},
        params: r => { const inside = r.int(0, 1); return {a: r.int(2, 8), b: r.int(5, 30), inside, x: inside ? r.int(2, 9) : r.pick([0, 11, 12, 13, 15])}; },
        difficulty: ({a, b, x}) => score({steps: 2, values: [a, b, x, a * x + b]}),
        verify: ({a, b, x}, v) => v[0] === a * x + b && v[1] === (x >= 1 && x <= 10 ? 'interpolation' : 'extrapolation'),
        build: ({a, b, x}) => { const kind = x >= 1 && x <= 10 ? 'interpolation' : 'extrapolation'; return item('Prévoir et qualifier', `Le modèle y = ${affine(a, b)} a été ajusté pour des valeurs de x de 1 à 10. On l’utilise en x = ${x}.`,
          [Q('Valeur estimée', a * x + b), choice('Nature de l’estimation', kind, ['interpolation', 'extrapolation'])],
          C('on remplace x dans le modèle ; une estimation dans la plage observée est une interpolation, en dehors c’est une extrapolation.',
            [`y = ${a} × ${x} + ${b} = ${a * x + b}.`],
            `l’estimation vaut ${a * x + b} ; c’est une ${kind}${kind === 'extrapolation' ? ', plus fragile car hors de la plage observée' : ''}. Une estimation ne prouve pas la valeur réelle.`),
          'Compare l’abscisse demandée à l’intervalle des observations.'); }
      }),
      T({ // Changement de variable carré
        base: {a: 3, b: 4, x: 3},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-5, 15), x: r.int(2, 6)}),
        difficulty: ({a, b, x}) => score({steps: 2, values: [a, b, x * x, a * x * x + b]}),
        verify: ({a, b, x}, v) => v[0] === x * x && v[1] === a * v[0] + b,
        build: ({a, b, x}) => item('Changement de variable carré', `On pose z = x². Dans le nouveau repère, le modèle ajusté est y = ${affine(a, b, 'z')}. On prend x = ${x}.`,
          [Q('z', x * x), Q('y estimé', a * x * x + b)],
          C('on calcule d’abord la nouvelle variable z, puis on applique la droite d’ajustement en z.',
            [`z = ${x}² = ${x * x} ; y = ${times(a, x * x, true)}${sg(b)} = ${fr(a * x * x + b)}.`],
            `le modèle donne y = ${fr(a * x * x + b)} ; dans les variables initiales, le modèle est y = ${poly([a, 0, b])}, qui n’est pas une droite.`),
          'Calcule d’abord la nouvelle variable, puis applique la droite ajustée.')
      }),
      T({ // Ajustement logarithmique
        base: {a: 0.2, b: 2, x: 3},
        params: r => ({a: r.pick([0.05, 0.1, 0.2, 0.3, -0.1, -0.2]), b: r.pick([1, 2, 3]), x: r.int(1, 5)}),
        difficulty: ({a, b, x}) => score({steps: 3, values: [a, b, x, 10 ** (a * x + b), 10 ** a]}),
        verify: ({a, b, x}, v) => close(Math.log10(v[0]), a * x + b) && close(Math.log10(v[1]), a),
        build: ({a, b, x}) => { const z = F(a * x + b, 6); return item('Ajustement logarithmique', `Pour y > 0, on pose z = log(y). La droite ajustée est z = ${affine(a, b)}.`,
          [Q(`y estimé pour x = ${x}`, 10 ** z), Q('Coefficient multiplicateur quand x augmente de 1', 10 ** a)],
          C('on calcule z, puis on revient à y avec y = 10<sup>z</sup> ; le modèle initial est exponentiel : y = 10<sup>b</sup> × (10<sup>a</sup>)<sup>x</sup>.',
            [`z = ${fr(a)} × ${x} + ${b} = ${fr(z)}, donc y = 10<sup>${fr(z)}</sup> ≈ ${fr(r3(10 ** z))}.`, `Quand x augmente de 1, y est multiplié par 10<sup>${fr(a)}</sup> ≈ ${fr(r3(10 ** a))}.`],
            `y ≈ ${fr(r3(10 ** z))} pour x = ${x} ; le coefficient multiplicateur est d’environ ${fr(r3(10 ** a))}.`),
          'Le retour de log(y) à y se fait par une puissance de dix, pas par une multiplication par dix.'); }
      }),
      T({ // Comparer deux ajustements
        base: {a: 3, b: 4, e: 2},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-5, 10), e: r.nonZero(1, 4)}),
        difficulty: ({a, b, e}) => score({steps: 4, values: [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e, 6 * e * e, 9 * e * e]}),
        verify: ({a, b, e}, v) => { const y = [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e], ss = c => y.reduce((s, t, i) => s + (t - (a * (i + 1) + c)) ** 2, 0); return v[0] === ss(b) && v[1] === ss(b + e); },
        build: ({a, b, e}) => {
          const y = [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e], rA = [e, -2 * e, e], rB = [0, -3 * e, 0];
          return item('Comparer deux ajustements', `Données : (1 ; ${fr(y[0])}), (2 ; ${fr(y[1])}), (3 ; ${fr(y[2])}). Modèle A : y = ${affine(a, b)}. Modèle B : y = ${affine(a, b + e)}. Calcule la somme des carrés des écarts pour chacun.`,
            [Q('Somme pour A', 6 * e * e), Q('Somme pour B', 9 * e * e)],
            C('pour chaque point, on calcule l’écart vertical « observé − modèle », on l’élève au carré, puis on additionne ; le meilleur des deux modèles est celui dont la somme est la plus petite.',
              [`Écarts pour A : ${rA.map(fr).join(' ; ')}, somme des carrés : ${rA.map(t => t * t).join(' + ')} = ${6 * e * e}.`, `Écarts pour B : ${rB.map(fr).join(' ; ')}, somme des carrés : ${9 * e * e}.`],
              `selon ce critère, le modèle A est préférable (${6 * e * e} < ${9 * e * e}), parmi ces deux candidats seulement.`),
            'Calcule les écarts verticaux, élève chacun au carré, puis additionne.');
        }
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-statistiques': ['Repère les variables, les unités et le modèle proposé.', 'Calcule la moyenne de 2 et 4.', '3', 'Additionne les deux valeurs puis divise par deux.'],
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  /* Figures calculées avec les paramètres de chaque variante. Celles des séries de statistiques
     et de probabilités sont dans assets/terminale-figures.js. */
  const FG = window.Figures;
  if (FG) {
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
