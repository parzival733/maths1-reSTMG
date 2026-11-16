/* Série t-binomiale : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-binomiale': [
      T({ // Identifier une loi binomiale
        base: {ctx: 0, n: 5, p: 0.2},
        params: r => ({ctx: r.int(0, 2), n: r.int(4, 20), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 2, values: [n, p, n * p]}),
        verify: ({n, p}, v) => v[0] === n && close(v[1], p) && close(v[2], v[0] * v[1]),
        build: ({ctx, n, p}) => {
          const k = [`On répète ${n} essais indépendants, de même probabilité de succès ${fr(p)}. X compte les succès.`,
            `Un joueur tire ${n} fois au but ; chaque tir est réussi avec la probabilité ${fr(p)}, indépendamment des autres. X compte les tirs réussis.`,
            `On prélève ${n} pièces dans une très grande production ; chacune est défectueuse avec la probabilité ${fr(p)}, indépendamment des autres. X compte les pièces défectueuses.`][ctx];
          return item('Identifier une loi binomiale', k, [Q('n', n), Q('p', p), Q('E(X)', n * p)],
            C('X compte les succès dans n épreuves de Bernoulli identiques et indépendantes : X suit la loi binomiale B(n ; p), d’espérance np.',
              [`n = ${n}, p = ${fr(p)} ; E(X) = ${n} × ${fr(p)} = ${fr(F(n * p, 6))}.`],
              `X suit B(${n} ; ${fr(p)}) et E(X) = ${fr(F(n * p, 6))} : c’est le nombre moyen de succès sur un grand nombre de répétitions de l’expérience.`),
            'Vérifie les trois conditions : nombre fixé, indépendance, probabilité constante.');
        }
      }),
      T({ // Triangle de Pascal
        base: {n: 6, k: 3},
        params: r => { const n = r.int(4, 10); return {n, k: r.int(1, n - 1)}; },
        difficulty: ({n, k}) => score({steps: 3, values: [n, k]}),
        verify: ({n, k}, v) => v[0] === binom(n - 1, k - 1) + binom(n - 1, k) && v[1] === Array.from({length: n + 1}, (_, j) => binom(n, j)).reduce((a, b) => a + b, 0),
        build: ({n, k}) => {
          const row = Array.from({length: n + 1}, (_, j) => binom(n, j));
          return item('Triangle de Pascal', `Dans la ligne n = ${n} du triangle de Pascal (la première ligne est n = 0), cherche C(${n}, ${k}) et la somme des coefficients de cette ligne.`,
            [Q(`C(${n}, ${k})`, binom(n, k)), Q('Somme de la ligne', 2 ** n)],
            C('chaque coefficient intérieur est la somme des deux coefficients situés au-dessus de lui ; la ligne n compte les chemins à n épreuves et sa somme vaut 2<sup>n</sup>.',
              [`Ligne ${n} : ${row.join(' ; ')} (positions numérotées à partir de 0).`, `C(${n}, ${k}) = C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${binom(n - 1, k - 1)} + ${binom(n - 1, k)} = ${binom(n, k)}.`],
              `C(${n}, ${k}) = ${binom(n, k)} et la somme de la ligne vaut 2<sup>${n}</sup> = ${2 ** n}.`),
            'Construis les lignes successives ; les positions sont numérotées à partir de 0.');
        }
      }),
      T({ // Aucun succès ou tous les succès
        base: {n: 4, p: 0.3},
        params: r => ({n: r.int(3, 8), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 2, values: [n, p, (1 - p) ** n, p ** n]}),
        verify: ({n, p}, v) => close(v[0], mass(n, p, 0)) && close(v[1], mass(n, p, n)),
        build: ({n, p}) => item('Aucun succès ou tous les succès', `X suit la loi binomiale B(${n} ; ${fr(p)}).`,
          [Q('P(X = 0)', (1 - p) ** n), Q(`P(X = ${n})`, p ** n)],
          C('« aucun succès » et « tous les succès » correspondent chacun à un seul chemin de l’arbre : P(X = 0) = (1 − p)<sup>n</sup> et P(X = n) = p<sup>n</sup>.',
            [`P(X = 0) = ${fr(1 - p)}<sup>${n}</sup> ${eq((1 - p) ** n)} ; P(X = ${n}) = ${fr(p)}<sup>${n}</sup> ${eq(p ** n)}.`],
            `P(X = 0) ${eq((1 - p) ** n)} et P(X = ${n}) ${eq(p ** n)}.`),
          'Ne multiplie pas par n pour un événement qui correspond à un seul chemin.')
      }),
      T({ // Un succès ou un seul échec
        base: {n: 5, p: 0.3},
        params: r => ({n: r.int(4, 8), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 3, values: [n, p, mass(n, p, 1), mass(n, p, n - 1)]}),
        verify: ({n, p}, v) => close(v[0], n * p * (1 - p) ** (n - 1)) && close(v[1], n * p ** (n - 1) * (1 - p)),
        build: ({n, p}) => item('Un succès ou un seul échec', `X suit la loi binomiale B(${n} ; ${fr(p)}).`,
          [Q('P(X = 1)', mass(n, p, 1)), Q(`P(X = ${n - 1})`, mass(n, p, n - 1))],
          C('un seul succès (ou un seul échec) peut être placé à n positions : il y a n chemins de même probabilité.',
            [`P(X = 1) = ${n} × ${fr(p)} × ${fr(1 - p)}<sup>${n - 1}</sup> ${eq(mass(n, p, 1))}.`, `P(X = ${n - 1}) = ${n} × ${fr(p)}<sup>${n - 1}</sup> × ${fr(1 - p)} ${eq(mass(n, p, n - 1))}.`],
            `P(X = 1) ${eq(mass(n, p, 1))} et P(X = ${n - 1}) ${eq(mass(n, p, n - 1))}.`),
          'Choisis la place du succès unique ou de l’échec unique : il y a n choix.')
      }),
      T({ // Exactement k et au moins un
        base: {n: 6, k: 3, p: 0.3},
        params: r => { const n = r.int(5, 10); return {n, k: r.int(2, n - 2), p: tenth(r)}; },
        difficulty: ({n, k, p}) => score({steps: 4, values: [n, k, binom(n, k), mass(n, p, k), 1 - (1 - p) ** n]}),
        verify: ({n, k, p}, v) => close(v[0], binom(n, k) * p ** k * (1 - p) ** (n - k)) && close(v[1], 1 - mass(n, p, 0)),
        build: ({n, k, p}) => item('Exactement k et au moins un', `X suit la loi binomiale B(${n} ; ${fr(p)}).`,
          [Q(`P(X = ${k})`, mass(n, p, k)), Q('P(X ≥ 1)', 1 - (1 - p) ** n)],
          C('P(X = k) = C(n, k) p<sup>k</sup>(1 − p)<sup>n−k</sup> ; « au moins un » est l’événement contraire de « aucun ».',
            [`P(X = ${k}) = ${binom(n, k)} × ${fr(p)}<sup>${k}</sup> × ${fr(1 - p)}<sup>${n - k}</sup> ${eq(mass(n, p, k))}.`, `P(X ≥ 1) = 1 − ${fr(1 - p)}<sup>${n}</sup> ${eq(1 - (1 - p) ** n)}.`],
            `P(X = ${k}) ${eq(mass(n, p, k))} et P(X ≥ 1) ${eq(1 - (1 - p) ** n)}.`),
          'Pour exactement k, compte les chemins. Pour au moins un, passe par l’événement contraire.')
      }),
      T({ // Probabilités cumulées
        base: {n: 5, k: 2, p: 0.3},
        params: r => { const n = r.int(4, 8); return {n, k: r.int(1, n - 1), p: tenth(r)}; },
        difficulty: ({n, k, p}) => score({steps: 4, values: [n, k, cumulative(n, p, k), 1 - cumulative(n, p, k - 1)]}),
        verify: ({n, k, p}, v) => close(v[0], cumulative(n, p, k)) && close(v[1], Array.from({length: n - k + 1}, (_, j) => mass(n, p, k + j)).reduce((a, b) => a + b, 0)),
        build: ({n, k, p}) => item('Probabilités cumulées', `X suit la loi binomiale B(${n} ; ${fr(p)}). Calcule « au plus ${k} » et « au moins ${k} ».`,
          [Q(`P(X ≤ ${k})`, cumulative(n, p, k)), Q(`P(X ≥ ${k})`, 1 - cumulative(n, p, k - 1))],
          C(`« au plus ${k} » regroupe les valeurs de 0 à ${k} ; « au moins ${k} » est le contraire de « au plus ${k - 1} ». La valeur ${k} est incluse dans les deux événements.`,
            [`P(X ≤ ${k}) = P(X = 0) + … + P(X = ${k}) ${eq(cumulative(n, p, k))}.`, `P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1}) ${eq(1 - cumulative(n, p, k - 1))}.`],
            `P(X ≤ ${k}) ${eq(cumulative(n, p, k))} et P(X ≥ ${k}) ${eq(1 - cumulative(n, p, k - 1))}.`),
          'Le contraire de « X au moins k » est « X au plus k − 1 », et non « X au plus k ».')
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-binomiale': ['X compte des succès parmi un nombre fixé d’essais indépendants.', 'Avec trois essais, combien de chemins ont un seul succès ?', '3', 'Place le succès en première, deuxième ou troisième position.'],
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
