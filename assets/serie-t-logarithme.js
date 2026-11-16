/* Série t-logarithme : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-logarithme': [
      T({ // Logarithmes de puissances de dix
        base: {h: 2, j: -2, form: 0},
        params: r => ({h: r.int(1, 6), j: r.int(-4, -1), form: r.int(0, 1)}),
        space: 48,
        difficulty: ({h, j}) => score({steps: 2, values: [h, j]}),
        verify: ({h, j}, v) => v[0] === h && v[1] === j,
        build: ({h, j, form}) => item('Logarithmes de puissances de dix', form
          ? `Calcule log(10<sup>${h}</sup>) et log(1/10<sup>${-j}</sup>). log désigne le logarithme décimal.`
          : `Calcule log(${fr(10 ** h)}) et log(${fr(10 ** j)}). log désigne le logarithme décimal.`,
          [Q('Premier logarithme', h), Q('Second logarithme', j)],
          C('le logarithme décimal d’une puissance de 10 est son exposant : log(10<sup>n</sup>) = n pour tout entier n.',
            [`${form ? `10<sup>${h}</sup>` : fr(10 ** h)} = 10<sup>${h}</sup>, donc son logarithme vaut ${h}.`, `${form ? `1/10<sup>${-j}</sup>` : fr(10 ** j)} = 10<sup>${M}${-j}</sup>, donc son logarithme vaut ${fr(j)}.`],
            `les logarithmes valent ${h} et ${fr(j)} ; un logarithme est négatif lorsque le nombre est compris entre 0 et 1.`),
          'Demande-toi à quelle puissance de 10 correspond chaque nombre.')
      }),
      T({ // Transformer produit, quotient et puissance
        base: {a: 3, b: 2},
        params: r => ({a: r.int(1, 20), b: r.int(1, 15)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 3, values: [a / 10, b / 10, (a + b) / 10, (a - b) / 10, 3 * a / 10]}),
        verify: ({a, b}, v) => close(v[0], (a + b) / 10) && close(v[1], (a - b) / 10) && close(v[2], 3 * a / 10),
        build: ({a, b}) => { const la = a / 10, lb = b / 10; return item('Transformer produit, quotient et puissance', `A et B sont deux nombres strictement positifs, avec log(A) = ${fr(la)} et log(B) = ${fr(lb)}.`,
          [Q('log(A × B)', la + lb), Q('log(A / B)', la - lb), Q('log(A³)', 3 * la)],
          C('log(AB) = log(A) + log(B), log(A/B) = log(A) − log(B) et log(A<sup>n</sup>) = n × log(A).',
            [`log(AB) = ${fr(la)} + ${fr(lb)} = ${fr(F(la + lb, 6))} ; log(A/B) = ${fr(la)} − ${fr(lb)} = ${fr(F(la - lb, 6))} ; log(A<sup>3</sup>) = 3 × ${fr(la)} = ${fr(F(3 * la, 6))}.`],
            `log(AB) = ${fr(F(la + lb, 6))}, log(A/B) = ${fr(F(la - lb, 6))} et log(A<sup>3</sup>) = ${fr(F(3 * la, 6))}. Il n’existe pas de règle analogue pour log(A + B).`),
          'Produit devient somme ; quotient devient différence ; puissance devient multiplication.'); }
      }),
      T({ // Équation et seuil
        base: {a: 3, x: 4, strict: 1},
        params: r => ({a: r.int(2, 9), x: r.int(2, 15), strict: r.int(0, 1)}),
        accept: ({a, x}) => a ** x <= 6000,
        difficulty: ({a, x}) => score({steps: 3, values: [a, x]}),
        verify: ({a, x, strict}, v) => a ** v[0] === a ** x && (strict ? a ** v[1] > a ** x && !(a ** (v[1] - 1) > a ** x) : a ** v[1] >= a ** x && !(a ** (v[1] - 1) >= a ** x)),
        build: ({a, x, strict}) => { const b = a ** x, sym = strict ? '>' : '≥'; return item('Équation et seuil', `Résous ${a}<sup>x</sup> = ${fr(b)}, puis cherche le premier entier naturel n tel que ${a}<sup>n</sup> ${sym} ${fr(b)}.`,
          [Q('Solution réelle x', x), Q('Premier entier n', strict ? x + 1 : x)],
          C('on applique log aux deux membres : log(a<sup>x</sup>) = x × log(a), donc x = log(b)/log(a). Pour le seuil, a > 1 : n ↦ a<sup>n</sup> est croissante.',
            [`x = log(${fr(b)})/log(${a}) = ${x}.`, strict ? `L’inégalité stricte impose n > ${x} : le premier entier est ${x + 1}.` : `L’inégalité large est vérifiée dès n = ${x}.`],
            `la solution réelle est ${x} et le premier entier n tel que ${a}<sup>n</sup> ${sym} ${fr(b)} est ${strict ? x + 1 : x}.`),
          'Résous d’abord pour un réel, puis tiens compte du caractère strict ou large du seuil.'); }
      }),
      T({ // Seuil d'une décroissance
        base: {m: 3, v0: 1100},
        params: r => ({m: r.int(2, 7), v0: 100 * r.int(5, 30)}),
        difficulty: ({m, v0}) => score({steps: 3, values: [v0, v0 / 2 ** m, m]}),
        verify: ({m, v0}, v) => close(v0 * 0.5 ** v[0], v0 / 2 ** m) && v[1] === v[0] + 1,
        build: ({m, v0}) => { const b = v0 / 2 ** m; return item('Seuil d’une décroissance', `v(n) = ${fr(v0)} × 0,5<sup>n</sup>. Pour quel rang atteint-on exactement ${fr(b)} ? Quel est le premier rang strictement en dessous ?`,
          [Q('Rang d’égalité', m), Q('Premier rang strictement en dessous', m + 1)],
          C('on résout l’équation avec le logarithme ; comme log(0,5) < 0, diviser une inégalité par log(0,5) en change le sens.',
            [`${fr(v0)} × 0,5<sup>n</sup> = ${fr(b)} ⇔ 0,5<sup>n</sup> = ${fr(b / v0)} ⇔ n = log(${fr(b / v0)})/log(0,5) = ${m}.`, `v(n) < ${fr(b)} ⇔ n > ${m}, car la suite est strictement décroissante.`],
            `l’égalité a lieu au rang ${m} ; le premier rang strictement en dessous de ${fr(b)} est ${m + 1}.`),
          'La suite décroît. Contrôle le rang trouvé et le rang précédent.'); }
      }),
      T({ // L'inconnue est la base
        base: {a: 3, x: 3},
        params: r => ({a: r.int(2, 5), x: r.int(2, 14)}),
        accept: ({a, x}) => x ** a <= 100000,
        difficulty: ({a}) => score({steps: 2, values: [a]}),
        verify: ({a, x}, v) => v[0] ** a === x ** a && v[0] > 0 && close(v[1], Math.log10(x)),
        build: ({a, x}) => { const b = x ** a; return item('L’inconnue est la base', `Résous x<sup>${a}</sup> = ${fr(b)} avec x strictement positif, puis donne log(x). Attention : ici, l’inconnue est la base et l’exposant ${a} est connu.`,
          [Q('x positif', x), Q('log(x)', Math.log10(x))],
          C(`quand l’inconnue est la base, on prend la racine d’ordre ${a} : x = b<sup>1/${a}</sup>. On peut aussi écrire ${a} log(x) = log(b).`,
            [`x = ${fr(b)}<sup>1/${a}</sup> = ${x}, car ${x}<sup>${a}</sup> = ${fr(b)}.`, `log(x) = log(${fr(b)})/${a} = log(${x}) ≈ ${fr(r3(Math.log10(x)))}.`],
            `x = ${x} et log(x) ≈ ${fr(r3(Math.log10(x)))}.`),
          'Distingue a<sup>x</sup> (inconnue en exposant) et x<sup>a</sup> (inconnue en base) ; ici l’exposant est connu.'); }
      }),
      T({ // Ordre de grandeur et nombre de chiffres
        base: {kind: 0, h: 3, lead: 3, tail: 1},
        params: r => { const kind = r.int(0, 2), h = r.int(2, 6); return {kind, h, lead: kind ? 0 : r.int(1, 9), tail: kind === 1 ? r.int(1, 9) : kind ? 0 : r.int(0, 99)}; },
        difficulty: ({h}) => score({steps: 3, values: [h, h + 1]}),
        verify: ({kind, h, lead, tail}, v) => { const n = kind === 0 ? lead * 10 ** h + tail : kind === 1 ? 10 ** (h + 1) - tail : 10 ** h; return 10 ** v[0] <= n && n < 10 ** (v[0] + 1) && v[1] === String(n).length; },
        build: ({kind, h, lead, tail}) => {
          const n = kind === 0 ? lead * 10 ** h + tail : kind === 1 ? 10 ** (h + 1) - tail : 10 ** h, k = h;
          const warn = kind === 1 ? ` Attention : ${fr(n)} est juste en dessous de 10<sup>${h + 1}</sup> ; log(N) ≈ ${fr(r3(Math.log10(n), 4))} est très proche de ${h + 1} mais lui reste inférieur.`
            : kind === 2 ? ` Ici N est exactement une puissance de 10 : log(N) = ${h}, et N a ${h + 1} chiffres.` : '';
          return item('Ordre de grandeur et nombre de chiffres', `On considère l’entier N = ${fr(n)}. Détermine l’entier k tel que 10<sup>k</sup> ≤ N < 10<sup>k+1</sup>, puis le nombre de chiffres de N.`,
            [Q('k', k), Q('Nombre de chiffres', k + 1)],
            C('k est la partie entière de log(N) ; un entier N tel que 10<sup>k</sup> ≤ N < 10<sup>k+1</sup> s’écrit avec k + 1 chiffres.',
              [`${fr(10 ** k)} ≤ ${fr(n)} < ${fr(10 ** (k + 1))}, donc ${k} ≤ log(N) < ${k + 1}.${warn}`],
              `k = ${k} et N a ${k + 1} chiffres.`),
            'Un entier compris entre 10 puissance k (inclus) et 10 puissance k + 1 (exclu) a k + 1 chiffres.');
        }
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-logarithme': ['Le logarithme décimal retrouve un exposant de dix.', 'Calcule log(100).', '2', 'Cherche k tel que 10 puissance k vaut 100.'],
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
