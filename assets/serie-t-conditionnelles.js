/* Série t-conditionnelles : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-conditionnelles': [
      T({ // Choisir la population de référence
        base: {n: 105, a: 41, b: 11, t: 31},
        params: r => { const n = r.int(80, 200), a = r.int(20, Math.floor(n / 2)), b = r.int(5, a - 5); return {n, a, b, t: r.int(b + 5, n - (a - b) - 5)}; },
        difficulty: ({n, a, b, t}) => score({steps: 2, values: [n, a, b, t, b / a, t / n]}),
        verify: ({n, a, b, t}, v) => close(v[0], b / a) && close(v[1], t / n),
        build: ({n, a, b, t}) => item('Choisir la population de référence', `Une enquête fictive porte sur ${n} clients. L’événement A (« être abonné ») concerne ${a} clients, dont ${b} sont satisfaits. Au total, ${t} clients sont satisfaits (événement B).`,
          [Q('P(B | A)', b / a), Q('P(B)', t / n)],
          C('P<sub>A</sub>(B), aussi notée P(B | A), est la probabilité de B sachant A : la population de référence est celle de A, donc le dénominateur est l’effectif de A ; pour P(B), c’est l’effectif total.',
            [`P<sub>A</sub>(B) = ${b}/${a} ${eq(b / a)} ; P(B) = ${t}/${n} ${eq(t / n)}.`],
            `parmi les abonnés, la proportion de satisfaits est d’environ ${fr(r3(b / a))} ; sur toute la population, elle est d’environ ${fr(r3(t / n))}.`),
          'Après « sachant A », le dénominateur est l’effectif de A.')
      }),
      T({ // Deux branches et probabilités totales
        base: {a: 0.3, p: 0.1, q: 0.2},
        params: r => ({a: tenth(r), p: tenth(r), q: tenth(r)}),
        accept: ({p, q}) => p !== q,
        difficulty: ({a, p, q}) => score({steps: 3, values: [a, p, q, a * p, a * p + (1 - a) * q]}),
        verify: ({a, p, q}, v) => close(v[0], a * p) && close(v[1], v[0] + (1 - a) * q),
        build: ({a, p, q}) => { const j = F(a * p, 6), t = F(a * p + (1 - a) * q, 6); return item('Deux branches et probabilités totales', `P(A) = ${fr(a)}, P<sub>A</sub>(D) = ${fr(p)} et P<sub>non A</sub>(D) = ${fr(q)}. A et non A forment une partition.`,
          [Q('P(A ∩ D)', j), Q('P(D)', t)],
          C('on multiplie les probabilités le long d’un chemin de l’arbre ; la formule des probabilités totales additionne les chemins qui mènent à D.',
            [`P(A ∩ D) = ${fr(a)} × ${fr(p)} = ${fr(j)}.`, `P(D) = ${fr(a)} × ${fr(p)} + ${fr(1 - a)} × ${fr(q)} = ${fr(j)} + ${fr(F((1 - a) * q, 6))} = ${fr(t)}.`],
            `P(A ∩ D) = ${fr(j)} et P(D) = ${fr(t)}.`),
          'Multiplie le long de chaque chemin, puis additionne les chemins menant à D.'); }
      }),
      T({ // Partition en trois groupes
        base: {a: 0.2, b: 0.2, pa: 0.1, pb: 0.2, pc: 0.3},
        params: r => ({a: r.int(1, 5) / 10, b: r.int(1, 4) / 10, pa: tenth(r), pb: tenth(r), pc: tenth(r)}),
        accept: ({a, b, pa, pb, pc}) => a + b < 0.95 && new Set([pa, pb, pc]).size === 3,
        difficulty: ({a, b, pa, pb, pc}) => score({steps: 4, values: [a, b, 1 - a - b, pa, pb, pc, a * pa + b * pb + (1 - a - b) * pc]}),
        verify: ({a, b, pa, pb, pc}, v) => close(v[0], 1 - a - b) && close(v[1], a * pa + b * pb + v[0] * pc),
        build: ({a, b, pa, pb, pc}) => { const c = F(1 - a - b, 6), t = F(a * pa + b * pb + c * pc, 6); return item('Partition en trois groupes', `A, B et C forment une partition : P(A) = ${fr(a)} et P(B) = ${fr(b)}. Les probabilités de l’événement D dans A, B et C sont respectivement ${fr(pa)} ; ${fr(pb)} ; ${fr(pc)}.`,
          [Q('P(C)', c), Q('P(D)', t)],
          C('les probabilités des groupes d’une partition ont pour somme 1 ; la formule des probabilités totales pondère chaque probabilité conditionnelle par le poids de son groupe.',
            [`P(C) = 1 − ${fr(a)} − ${fr(b)} = ${fr(c)}.`, `P(D) = ${fr(a)} × ${fr(pa)} + ${fr(b)} × ${fr(pb)} + ${fr(c)} × ${fr(pc)} = ${fr(t)}.`],
            `P(C) = ${fr(c)} et P(D) = ${fr(t)} ; ce n’est pas la moyenne simple des trois probabilités.`),
          'Vérifie que les poids des groupes totalisent 1. La moyenne des taux doit être pondérée.'); }
      }),
      T({ // Inverser une condition
        base: {a: 0.3, p: 0.8, q: 0.1},
        params: r => ({a: tenth(r), p: tenth(r), q: tenth(r)}),
        accept: ({p, q}) => p !== q,
        difficulty: ({a, p, q}) => { const t = a * p + (1 - a) * q; return score({steps: 4, values: [a, p, q, t, a * p / t]}); },
        verify: ({a, p, q}, v) => close(v[0], a * p + (1 - a) * q) && close(v[1], a * p / v[0]),
        build: ({a, p, q}) => { const j = F(a * p, 6), t = F(a * p + (1 - a) * q, 6); return item('Inverser une condition', `P(A) = ${fr(a)}, P<sub>A</sub>(B) = ${fr(p)} et P<sub>non A</sub>(B) = ${fr(q)}.`,
          [Q('P(B)', t), Q('P(A | B)', j / t)],
          C('on calcule P(B) avec la formule des probabilités totales, puis on inverse le conditionnement : P<sub>B</sub>(A) = P(A ∩ B)/P(B).',
            [`P(B) = ${fr(a)} × ${fr(p)} + ${fr(1 - a)} × ${fr(q)} = ${fr(t)}.`, `P<sub>B</sub>(A) = ${fr(j)}/${fr(t)} ${eq(j / t)}.`],
            `P(B) = ${fr(t)} et P<sub>B</sub>(A) ${eq(j / t)} : ce n’est pas P<sub>A</sub>(B) = ${fr(p)}.`),
          'Calcule la probabilité totale avant de changer la condition.'); }
      }),
      T({ // Vérifier une indépendance
        base: {a: 0.3, b: 0.4, ind: 0, d: -0.06},
        params: r => { const ind = r.int(0, 1); return {a: r.int(2, 7) / 10, b: r.int(2, 7) / 10, ind, d: ind ? 0 : r.pick([-0.06, -0.04, -0.02, 0.02, 0.04, 0.06])}; },
        accept: ({a, b, d}) => { const j = F(a * b + d, 6); return j > Math.max(0, a + b - 1) && j < Math.min(a, b); },
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, a * b]}),
        verify: ({a, b, d}, v) => close(v[0], a * b) && v[1] === (d === 0 ? 'oui' : 'non'),
        build: ({a, b, ind, d}) => { const j = F(a * b + d, 6); return item('Vérifier une indépendance', `P(A) = ${fr(a)}, P(B) = ${fr(b)} et P(A ∩ B) = ${fr(j)}.`,
          [Q('P(A) × P(B)', a * b), choice('A et B sont-ils indépendants ?', ind ? 'oui' : 'non', ['oui', 'non'])],
          C('A et B sont indépendants si et seulement si P(A ∩ B) = P(A) × P(B).',
            [`P(A) × P(B) = ${fr(a)} × ${fr(b)} = ${fr(F(a * b, 6))}, ${ind ? 'égal à' : 'différent de'} P(A ∩ B) = ${fr(j)}.`],
            `A et B ${ind ? 'sont' : 'ne sont pas'} indépendants. « Indépendants » ne veut pas dire « incompatibles ».`),
          'Compare l’intersection au produit ; « indépendant » ne signifie pas « incompatible ».'); }
      }),
      T({ // Interpréter un contrôle de qualité
        base: {d: 0.02, se: 0.9, fp: 0.1},
        params: r => ({d: r.pick([0.01, 0.02, 0.05, 0.1]), se: r.pick([0.8, 0.9, 0.95, 0.99]), fp: r.pick([0.02, 0.05, 0.1])}),
        difficulty: ({d, se, fp}) => score({steps: 4, values: [d, se, fp, d * se + (1 - d) * fp, d * se / (d * se + (1 - d) * fp)]}),
        verify: ({d, se, fp}, v) => close(v[0], d * se + (1 - d) * fp) && close(v[1], d * se / v[0]),
        build: ({d, se, fp}) => { const j = F(d * se, 6), t = F(d * se + (1 - d) * fp, 6); return item('Interpréter un contrôle de qualité', `Dans un modèle fictif, ${fr(100 * d)} % des articles sont défectueux (D). Le contrôle signale (S) ${fr(100 * se)} % des articles défectueux et ${fr(100 * fp)} % des articles non défectueux.`,
          [Q('P(S)', t), Q('P(D | S)', j / t)],
          C('probabilités totales pour P(S), puis inversion du conditionnement : P<sub>S</sub>(D) = P(D ∩ S)/P(S).',
            [`P(S) = ${fr(d)} × ${fr(se)} + ${fr(1 - d)} × ${fr(fp)} = ${fr(t)}.`, `P<sub>S</sub>(D) = ${fr(j)}/${fr(t)} ${eq(j / t)}.`],
            `parmi les articles signalés, la proportion de défectueux est d’environ ${fr(r3(j / t))} : elle dépend aussi de la proportion initiale de défauts, pas seulement du taux de détection.`),
          'Un taux de détection n’est pas la probabilité d’un défaut sachant un signal.'); }
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-conditionnelles': ['Précise la population sur laquelle porte la probabilité.', 'Un chemin porte 0,5 puis 0,4. Quelle est sa probabilité ?', '0.2', 'Multiplie les probabilités le long du chemin.'],
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
