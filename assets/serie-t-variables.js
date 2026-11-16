/* Série t-variables : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-variables': [
      T({ // Loi discrète et espérance
        base: {a: 3, c: 2, pi: 0},
        params: r => ({a: r.int(2, 20), c: r.int(2, 3), pi: r.int(0, 4)}),
        difficulty: ({a, c, pi}) => { const p = LAWS[pi]; return score({steps: 3, values: [-a, c * a, ...p, -a * p[0] + c * a * p[2], p[1] + p[2]]}); },
        verify: ({a, c, pi}, v) => { const p = LAWS[pi]; return close(v[0], -a * p[0] + 0 * p[1] + c * a * p[2]) && close(v[1], 1 - p[0]); },
        build: ({a, c, pi}) => {
          const p = LAWS[pi], e = F(-a * p[0] + c * a * p[2], 6);
          return item('Loi discrète et espérance', `X prend les valeurs ${M}${a}, 0 et ${c * a}, avec les probabilités ${p.map(fr).join(' ; ')}.`,
            [Q('E(X)', e), Q('P(X ≥ 0)', p[1] + p[2])],
            C('l’espérance est la moyenne des valeurs pondérée par leurs probabilités ; une probabilité cumulée est une somme de probabilités.',
              [`E(X) = (${M}${a}) × ${fr(p[0])} + ${c * a} × ${fr(p[2])} = ${fr(e)} (la valeur 0 n’ajoute rien).`, `P(X ≥ 0) = ${fr(p[1])} + ${fr(p[2])} = ${fr(F(p[1] + p[2], 6))}.`],
              `E(X) = ${fr(e)} et P(X ≥ 0) = ${fr(F(p[1] + p[2], 6))}.`),
            'L’espérance est une moyenne pondérée ; une probabilité cumulée est une somme de probabilités.');
        }
      }),
      T({ // Gain brut et gain net
        base: {v: 11, cost: 3, p: 0.3},
        params: r => ({v: r.int(5, 30), cost: r.int(1, 6), p: tenth(r)}),
        accept: ({v, cost, p}) => v > cost && F(p * v - cost, 6) !== 0,
        difficulty: ({v, cost, p}) => score({steps: 3, values: [v, cost, p, v - cost, p * v - cost]}),
        verify: ({v, cost, p}, v2) => v2[0] === v - cost && close(v2[1], p * v2[0] + (1 - p) * -cost),
        build: ({v, cost, p}) => { const e = F(p * v - cost, 6); return item('Gain brut et gain net', `Jeu fictif : on paie ${eur(cost)} ; on reçoit ${eur(v)} avec la probabilité ${fr(p)}, sinon rien. X est le gain net.`,
          [Q('Gain net en cas de succès, en €', v - cost), Q('E(X), en €', e)],
          C('le gain net retire la participation dans chaque issue, y compris en cas de succès ; l’espérance pondère les gains nets par leurs probabilités.',
            [`Gain net : ${v} − ${cost} = ${v - cost} en cas de succès, ${M}${cost} sinon.`, `E(X) = ${fr(p)} × ${v - cost} + ${fr(1 - p)} × (${M}${cost}) = ${fr(e)}.`],
            `E(X) = ${eur(e)} : en moyenne, le joueur ${e > 0 ? 'gagne' : 'perd'} ${eur(Math.abs(e))} par partie ; ce n’est pas une promesse pour une partie.`),
          'Retire la participation dans chacune des issues, y compris lors d’un gain.'); }
      }),
      T({ // Compléter une loi
        base: {p: 0.3, q: 0.3, x2: 2, x3: 5},
        params: r => ({p: r.int(1, 5) / 10, q: r.int(1, 5) / 10, x2: r.int(1, 4), x3: r.int(5, 10)}),
        accept: ({p, q}) => p + q < 0.95,
        difficulty: ({p, q, x2, x3}) => score({steps: 3, values: [p, q, 1 - p - q, x2, x3, x2 * q + x3 * (1 - p - q)]}),
        verify: ({p, q, x2, x3}, v) => close(p + q + v[0], 1) && close(v[1], x2 * q + x3 * v[0]),
        build: ({p, q, x2, x3}) => { const rr = F(1 - p - q, 6), e = F(x2 * q + x3 * rr, 6); return item('Compléter une loi', `X prend les valeurs 0, ${x2} et ${x3}. Les deux premières probabilités sont ${fr(p)} et ${fr(q)}.`,
          [Q(`Probabilité de ${x3}`, rr), Q('E(X)', e)],
          C('les probabilités d’une loi sont positives et ont pour somme 1 ; on calcule ensuite l’espérance.',
            [`P(X = ${x3}) = 1 − ${fr(p)} − ${fr(q)} = ${fr(rr)}.`, `E(X) = ${x2} × ${fr(q)} + ${x3} × ${fr(rr)} = ${fr(e)}.`],
            `P(X = ${x3}) = ${fr(rr)} et E(X) = ${fr(e)}.`),
          'Contrôle d’abord que toutes les probabilités sont positives et de somme 1.'); }
      }),
      T({ // Nombre de succès et fréquence
        base: {n: 6, p: 0.3},
        params: r => ({n: r.int(5, 30), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 2, values: [n, p, n * p]}),
        verify: ({n, p}, v) => close(v[0], n * p) && close(v[1], v[0] / n),
        build: ({n, p}) => item('Nombre de succès et fréquence', `X suit la loi binomiale B(${n} ; ${fr(p)}). La fréquence de succès est F = X/${n}.`,
          [Q('E(X)', n * p), Q('E(F)', p)],
          C('E(X) = np ; diviser X par n divise aussi son espérance par n.',
            [`E(X) = ${n} × ${fr(p)} = ${fr(F(n * p, 6))} ; E(F) = E(X)/${n} = ${fr(p)}.`],
            `E(X) = ${fr(F(n * p, 6))} et E(F) = ${fr(p)} ; un échantillon ne donne pas forcément cette fréquence.`),
          'Ne confonds pas la moyenne du nombre de succès et la moyenne de la fréquence.')
      }),
      T({ // Lire plusieurs échantillons
        base: {k: 5, n: 20, pat: 0},
        params: r => ({k: r.int(3, 12), n: r.pick([20, 25, 50]), pat: r.int(0, 2)}),
        difficulty: ({k, n}) => score({steps: 3, values: [k, n, 4 * n, (k + 0.5) / n]}),
        verify: ({k, n, pat}, v) => { const l = OFFSETS[pat].map(o => k + o); return v[0] === 4 * n && close(v[1], l.reduce((a, b) => a + b, 0) / (4 * n)); },
        build: ({k, n, pat}) => { const l = OFFSETS[pat].map(o => k + o), s = l.reduce((a, b) => a + b, 0); return item('Lire plusieurs échantillons', `Quatre échantillons de ${n} essais donnent les nombres de succès : ${l.join(' ; ')}.`,
          [Q('Nombre total d’essais', 4 * n), Q('Moyenne des quatre fréquences', s / (4 * n))],
          C('on calcule une fréquence par échantillon, puis leur moyenne ; comme les tailles sont égales, c’est aussi le total des succès divisé par le total des essais.',
            [`Total des essais : 4 × ${n} = ${4 * n} ; moyenne des fréquences : (${l.join(' + ')})/(4 × ${n}) = ${s}/${4 * n} ${eq(s / (4 * n))}.`],
            `il y a ${4 * n} essais et la moyenne des fréquences ${eq(s / (4 * n))} ; N = 4 est le nombre d’échantillons et n = ${n} leur taille.`),
          'Calcule une fréquence par échantillon, puis leur moyenne ; ici les tailles sont identiques.'); }
      }),
      T({ // Distribution simulée et modèle
        base: {c0: 3, c1: 4, c2: 5, c3: 2, p: 0.4},
        params: r => ({c0: r.int(1, 30), c1: r.int(1, 30), c2: r.int(1, 30), c3: r.int(1, 30), p: r.pick([0.3, 0.4, 0.5])}),
        difficulty: ({c0, c1, c2, c3}) => { const N = c0 + c1 + c2 + c3; return score({steps: 3, values: [N, (c1 + 2 * c2 + 3 * c3) / N, 1.2]}); },
        verify: ({c0, c1, c2, c3, p}, v) => v[0] === c0 + c1 + c2 + c3 && close(v[1], (c1 + 2 * c2 + 3 * c3) / v[0]) && close(v[2], 3 * p),
        build: ({c0, c1, c2, c3, p}) => { const N = c0 + c1 + c2 + c3, m = (c1 + 2 * c2 + 3 * c3) / N; return item('Distribution simulée et modèle', `On simule X suivant la loi binomiale B(3 ; ${fr(p)}). Pour X = 0, 1, 2 et 3, les effectifs observés sont ${c0} ; ${c1} ; ${c2} ; ${c3}.`,
          [Q('Nombre de simulations', N), Q('Moyenne observée de X', m), Q('Espérance théorique', 3 * p)],
          C('la moyenne observée se calcule avec les effectifs ; l’espérance théorique avec les paramètres du modèle : E(X) = np.',
            [`N = ${c0} + ${c1} + ${c2} + ${c3} = ${N} ; moyenne : (1 × ${c1} + 2 × ${c2} + 3 × ${c3})/${N} ${eq(m)}.`, `E(X) = 3 × ${fr(p)} = ${fr(F(3 * p, 6))}.`],
            `la moyenne observée ${eq(m)} et l’espérance ${fr(F(3 * p, 6))} peuvent différer : un écart n’invalide pas automatiquement le modèle.`),
          'Pour la moyenne observée, utilise les effectifs ; pour l’espérance, utilise les paramètres du modèle.'); }
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-variables': ['Ne confonds pas moyenne théorique et résultat observé.', 'X vaut 0 ou 10, chaque valeur avec probabilité 0,5. Calcule E(X).', '5', 'Calcule 0 fois 0,5 plus 10 fois 0,5.'],
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
