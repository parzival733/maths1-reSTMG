/* Série t-exponentielles : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-exponentielles': [
      T({ // Du discret au continu
        base: {k: 4, a: 3, x: 3},
        params: r => ({k: r.int(2, 10), a: r.int(2, 5), x: r.int(2, 4)}),
        accept: ({k, a, x}) => k * a ** x <= 5000 && k % a !== 0,
        difficulty: ({k, a, x}) => score({steps: 2, values: [k, a, x, k * a ** x, k / a]}),
        verify: ({k, a, x}, v) => v[0] === k * a ** x && close(v[1] * a, k),
        build: ({k, a, x}) => item('Du discret au continu', `f(x) = ${k} × ${a}<sup>x</sup> pour tout réel x.`,
          [Q(`f(${x})`, k * a ** x), Q(`f(${M}1)`, k / a)],
          C('on remplace x par la valeur demandée ; un exposant négatif donne un inverse : a<sup>−1</sup> = 1/a.',
            [`f(${x}) = ${k} × ${a}<sup>${x}</sup> = ${k} × ${a ** x} = ${fr(k * a ** x)}.`, `f(${M}1) = ${k} × ${a}<sup>${M}1</sup> = ${k}/${a} ${eq(k / a)}.`],
            `f(${x}) = ${fr(k * a ** x)} et f(${M}1) = ${k}/${a} ${eq(k / a)} : un exposant négatif ne rend pas l’image négative.`),
          'Un exposant négatif donne un inverse, pas un nombre négatif.')
      }),
      T({ // Propriétés des puissances
        base: {a: 3, m: 3, n: 2},
        params: r => { const m = r.int(2, 8); return {a: r.int(2, 10), m, n: r.int(1, m + 2)}; },
        accept: ({a, m, n}) => n !== m && a ** (m + n) <= 50000,
        difficulty: ({a, m, n}) => score({steps: 2, values: [a, m, n]}),
        verify: ({a, m, n}, v) => v[0] === a ** m * a ** n && close(v[1], a ** m / a ** n, 1e-6),
        build: ({a, m, n}) => item('Propriétés des puissances', `Calcule A = ${a}<sup>${m}</sup> × ${a}<sup>${n}</sup> et B = ${a}<sup>${m}</sup> ÷ ${a}<sup>${n}</sup>.`,
          [Q('A', a ** (m + n)), Q('B', a ** (m - n))],
          C('pour une même base, a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup> et a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup>.',
            [`A = ${a}<sup>${m}+${n}</sup> = ${a}<sup>${m + n}</sup> = ${fr(a ** (m + n))} ; B = ${a}<sup>${m}−${n}</sup> = ${a}<sup>${fr(m - n)}</sup> ${m - n < 0 ? `= 1/${a ** (n - m)} ` : ''}${eq(a ** (m - n))}.`],
            `A = ${fr(a ** (m + n))} et B ${eq(a ** (m - n))}${m - n < 0 ? ' : un exposant négatif donne un inverse' : ''}.`),
          'Les bases doivent être identiques pour additionner ou soustraire les exposants.')
      }),
      T({ // Signe du coefficient et variation
        base: {want: 1, sk: -1, k: 3, a: 2},
        params: r => {
          const want = r.int(0, 2), sk = r.sign(), k = r.int(2, 9);
          // want : 0 croissante, 1 décroissante, 2 constante ; la base est choisie en conséquence.
          const up = want === 2 ? null : (want === 0) === (sk > 0);
          return {want, sk, k, a: want === 2 ? 1 : up ? r.pick([1.5, 2, 3]) : r.pick([0.25, 0.5, 0.8])};
        },
        difficulty: ({k, a}) => score({steps: 2, values: [k, a], decimals: false}),
        verify: ({sk, k, a}, v) => v[0] === sk * k && v[1] === (a === 1 ? 'constante' : sk * (a - 1) > 0 ? 'croissante' : 'décroissante'),
        build: ({sk, k, a}) => {
          const kk = sk * k, dir = a === 1 ? 'constante' : kk * (a - 1) > 0 ? 'croissante' : 'décroissante';
          return item('Signe du coefficient et variation', `f(x) = ${pa(kk)} × ${fr(a)}<sup>x</sup>. Étudie f sur ℝ.`,
            [Q('f(0)', kk), choice('Variation', dir, ['croissante', 'décroissante', 'constante'])],
            C('a<sup>0</sup> = 1 donne f(0) = k ; x ↦ a<sup>x</sup> est croissante si a > 1, décroissante si 0 < a < 1, constante si a = 1 ; un coefficient négatif inverse le sens de variation.',
              [`f(0) = ${pa(kk)} × 1 = ${fr(kk)}. La base ${fr(a)} est ${a === 1 ? 'égale à 1' : a > 1 ? 'supérieure à 1' : 'comprise entre 0 et 1'} et le coefficient ${fr(kk)} est ${kk > 0 ? 'positif' : 'négatif'}.`],
              `f est ${dir} sur ℝ.`),
            'Examine séparément la base a et le signe du coefficient k.');
        }
      }),
      T({ // Taux annuel moyen
        base: {v0: 1000, q: 1.2},
        params: r => ({v0: r.pick([400, 500, 800, 1000, 2000, 2500, 5000, 10000]), q: r.pick([0.8, 0.9, 1.05, 1.1, 1.2, 1.3, 1.5])}),
        accept: ({v0, q}) => Number.isInteger(F(v0 * q * q, 6)),
        difficulty: ({v0, q}) => score({steps: 3, values: [v0, v0 * q * q, q, (q - 1) * 100]}),
        verify: ({v0, q}, v) => close(v[0] * v[0], q * q) && close(v[1], (v[0] - 1) * 100),
        build: ({v0, q}) => { const vf = F(v0 * q * q, 6); return item('Taux annuel moyen', `Une quantité passe de ${fr(v0)} à ${fr(vf)} en deux ans. On cherche le taux qui, appliqué chaque année, donne la même évolution.`,
          [Q('Coefficient annuel moyen', q), Q('Taux annuel moyen en %', (q - 1) * 100)],
          C('le coefficient global sur deux ans est le carré du coefficient annuel moyen : on prend sa racine carrée (moyenne géométrique), puis on retranche 1.',
            [`Coefficient global : ${fr(vf)}/${fr(v0)} = ${fr(q * q)} ; coefficient annuel : √${fr(q * q)} = ${fr(q)}.`, `Taux : (${fr(q)} − 1) × 100 = ${fr((q - 1) * 100)}.`],
            `le taux annuel moyen est de ${q > 1 ? '+' : ''}${pct((q - 1) * 100)}.`),
          'La moyenne des coefficients est géométrique : le coefficient recherché au carré doit redonner le coefficient global.'); }
      }),
      T({ // Deux taux successifs différents
        base: {a: 6, b: 3, order: 0},
        params: r => ({a: r.int(2, 20), b: r.int(2, 20), order: r.int(0, 1)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => { const g = (1 + a / 100) * (1 - b / 100); return score({steps: 3, values: [a, b, g, 100 * (g - 1), 100 * (Math.sqrt(g) - 1)]}); },
        verify: ({a, b}, v) => { const g = (1 + a / 100) * (1 - b / 100); return close(v[0], 100 * (g - 1)) && close((1 + v[1] / 100) ** 2, g); },
        build: ({a, b, order}) => {
          const g = (1 + a / 100) * (1 - b / 100);
          return item('Deux taux successifs différents', `Une valeur ${order ? `diminue de ${b} %, puis augmente de ${a} %` : `augmente de ${a} %, puis diminue de ${b} %`} sur deux périodes de même durée.`,
            [Q('Taux global en %', 100 * (g - 1)), Q('Taux moyen par période en %', 100 * (Math.sqrt(g) - 1))],
            C('on multiplie les coefficients multiplicateurs ; le taux moyen correspond à la racine carrée du coefficient global (et non à la moyenne des taux).',
              [`Coefficient global : (1 + ${fr(a / 100)}) × (1 − ${fr(b / 100)}) = ${fr(F(g, 6))} ; taux global : ${eq(100 * (g - 1))} %.`, `Taux moyen : (√${fr(F(g, 6))} − 1) × 100 ${eq(100 * (Math.sqrt(g) - 1))} %.`],
              `l’évolution globale est d’environ ${fr(r3(100 * (g - 1)))} %, soit environ ${fr(r3(100 * (Math.sqrt(g) - 1)))} % par période en moyenne.`),
            'Multiplie les coefficients multiplicateurs ; ne fais pas la moyenne arithmétique des taux.');
        }
      }),
      T({ // Intercaler un point exponentiel
        base: {k: 5, q: 3, x0: 0},
        params: r => ({k: r.int(2, 20), q: r.int(2, 5), x0: r.int(0, 3)}),
        difficulty: ({k, q, x0}) => score({steps: 3, values: [x0, x0 + 2, k, k * q * q, k * q]}),
        verify: ({k, q, x0}, v) => v[0] === x0 + 1 && v[1] * v[1] === k * k * q * q,
        build: ({k, q, x0}) => item('Intercaler un point exponentiel', `Une courbe d’équation y = K × a<sup>x</sup>, avec K > 0 et a > 0, passe par A(${x0} ; ${k}) et B(${x0 + 2} ; ${k * q * q}). Cherche le point de la courbe d’abscisse située à mi-chemin.`,
          [Q('Abscisse du point', x0 + 1), Q('Ordonnée du point', k * q)],
          C('pour un modèle exponentiel, l’abscisse du point intermédiaire est la moyenne arithmétique des abscisses, et son ordonnée la moyenne géométrique des ordonnées.',
            [`Abscisse : (${x0} + ${x0 + 2})/2 = ${x0 + 1}. Ordonnée : √(${k} × ${k * q * q}) = √${k * k * q * q} = ${k * q}.`],
            `le point cherché est (${x0 + 1} ; ${k * q}) ; la moyenne arithmétique ${fr((k + k * q * q) / 2)} des ordonnées ne convient pas.`),
          'Pour un modèle exponentiel positif, utilise la moyenne arithmétique des abscisses et géométrique des ordonnées.')
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-exponentielles': ['Une évolution relative constante se traduit par des multiplications.', 'Calcule 2 puissance 3.', '8', 'Multiplie trois facteurs égaux à 2.'],
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  /* Figures calculées avec les paramètres de chaque variante. Celles des séries de statistiques
     et de probabilités sont dans assets/terminale-figures.js. */
  const FG = window.Figures;
  if (FG) {
    V.illustrate('t-exponentielles', [
    ({k, a, x}) => ({c: FG.repere('Courbe de f : elle reste au-dessus de l’axe des abscisses, même pour x négatif', V.frame([-1.5, x + 0.4], [k * a ** x]))
      .courbe(`(${k})*(${a})^x`, {de: -1.5, a: x}).point(x, k * a ** x).point(-1, k / a).description()}),
    null, null, null, null,
    ({k, q, x0}) => { const cadre = V.frame([x0 + 2.4], [k * q * q * 1.05], {xmin: Math.min(0, x0 - 0.4)});
      return {e: FG.repere(`Points A(${x0} ; ${k}) et B(${x0 + 2} ; ${k * q * q})`, cadre).point(x0, k, 'A').point(x0 + 2, k * q * q, 'B').description(),
        c: FG.repere(`La courbe passe par A et B ; à mi-chemin, l’ordonnée est la moyenne géométrique ${k * q}`, cadre).courbe(`(${k})*(${q})^(x-(${x0}))`)
          .point(x0, k, 'A').point(x0 + 2, k * q * q, 'B').lecture(x0 + 1, k * q).description()}; }
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
