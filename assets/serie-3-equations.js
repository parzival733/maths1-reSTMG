/* Série 3-equations : extrait de assets/troisieme-exercices.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant la 3e.');
  const {N, S, C, F, score, fmt, signTable} = V;
  const {num: fr, paren: pa, signed: sg, frac, gcd, MINUS: M, NBSP} = fmt;
  // Valeur exacte, ou arrondie au centième (ou à `digits` décimales).
  const Q = (label, value, digits = 2) => N(label, F(value, 9), 1e-8, digits);
  const r2 = (x, d = 2) => Math.round(x * 10 ** d + (x >= 0 ? 1e-9 : -1e-9)) / 10 ** d;
  // « = 12 » si la valeur est exacte à d décimales, sinon « ≈ 12,35 ».
  const eq = (x, d = 2) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '= ' + fr(x) : '≈ ' + fr(r2(x, d)));
  // « 12 » si la valeur est exacte à d décimales, sinon « environ 12,35 ».
  const about = (x, d = 2) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '' : 'environ ') + fr(r2(x, d));
  const lcm = (a, b) => a / gcd(a, b) * b;
  const sup = n => '<sup>' + fr(n) + '</sup>';
  const SUP = n => String(n).replace(/-/g, '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const code = text => '<code>' + text + '</code>';
  const sum = list => list.reduce((a, b) => a + b, 0);
  const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const smallest = n => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return d; return n; };
  const close = (a, b, eps = 1e-7) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));
  const sameFrac = (x, n, d) => close(x, n / d);
  const deg = Math.PI / 180;
  // Monôme « 3x », « −x », « x² » ; affine(a, b) → « 3x − 2 ».
  const mono = (a, v = 'x', first = true) => fmt.term(a, v, first);
  const lin = (a, b, v = 'x') => fmt.poly([a, b], v);
  const quad = (a, b, c) => fmt.poly([a, b, c]);
  // Écriture décimale exacte de digits × 10^shift (digits entier), sans erreur d'arrondi.
  function decimal(digits, shift) {
    let s = String(digits);
    if (shift >= 0) s += '0'.repeat(shift);
    else {
      const k = -shift;
      if (s.length <= k) s = '0'.repeat(k - s.length + 1) + s;
      s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k);
      s = s.replace(/0+$/, '').replace(/\.$/, '');
    }
    const [i, d] = s.split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, fmt.NNBSP) + (d ? ',' + d : '');
  }
  const table = (caption, columns, rows, first) => signTable(caption, columns.map(c => (typeof c === 'number' ? fr(c) : c)),
    rows.map(row => ({label: row.label, cells: row.cells.map(c => (typeof c === 'number' ? fr(c) : c))})), first);
  const TASKS = ['Renseigne chaque champ. Si le résultat n’est pas exact, arrondis au centième, sauf indication contraire. Une fraction est acceptée.'];
  const item = (title, statement, fields, correction, hint) => ({
    title, statement, fields, correction: Array.isArray(correction) ? correction : [correction],
    hint, level: 'Troisième', tasks: TASKS
  });
  // Nombres de collège : au plus 100 000 en valeur absolue dans les réponses.
  const T = model => ({limit: 100000, decimals: 6, ...model});

  const models = {
    /* ---------- 01 · Nombres premiers et arithmétique ---------- */
    '3-equations': [
      T({ // ax + b = c
        base: {a: 3, b: 5, s: 4},
        params: r => ({a: r.nonZero(2, 9), b: r.nonZero(1, 20), s: r.nonZero(1, 12)}),
        difficulty: ({a, b, s}) => score({steps: 2, values: [a, b, a * s + b, s]}),
        verify: ({a, b, s}, v) => v[0] === a * s && a * v[1] + b === a * s + b,
        build: ({a, b, s}) => { const c = a * s + b; return item('Résoudre une équation du premier degré', `Résous l’équation ${lin(a, b)} = ${fr(c)}.`,
          [Q(`Valeur de ${mono(a)}`, a * s), Q('Solution x', s)],
          C('on isole le terme en x en retirant ' + fr(b) + ' aux deux membres, puis on divise par ' + fr(a) + '.',
            [`${mono(a)} = ${fr(c)} ${M} ${pa(b)} = ${fr(a * s)}.`, `x = ${fr(a * s)} ÷ ${pa(a)} = ${fr(s)}.`],
            `la solution est x = ${fr(s)}. Vérification : ${fr(a)} × ${pa(s)}${sg(b)} = ${fr(c)}.`),
          'Ce qu’on fait d’un côté de l’égalité, on le fait de l’autre.'); }
      }),
      T({ // ax + b = cx + d
        base: {a: 5, b: -3, c: 2, d: 9},
        params: r => ({a: r.nonZero(1, 9), b: r.nonZero(1, 15), c: r.nonZero(1, 9), d: r.nonZero(1, 15)}),
        accept: ({a, c, b, d}) => a !== c && d !== b,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a - c, d - b], fractions: (d - b) % (a - c) !== 0, negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === a - c && close(a * v[1] + b, c * v[1] + d),
        build: ({a, b, c, d}) => { const k = a - c, rhs = d - b;
          return item('Résoudre une équation avec x dans les deux membres', `Résous l’équation ${lin(a, b)} = ${lin(c, d)}.`,
            [Q('Coefficient de x après regroupement', k), Q('Solution x', rhs / k)],
            C('on regroupe les termes en x dans le membre de gauche et les nombres dans celui de droite.',
              [`${mono(a)}${mono(-c, 'x', false)} = ${fr(d)} ${M} ${pa(b)}, soit ${mono(k)} = ${fr(rhs)}.`, `x = ${fr(rhs)} ÷ ${pa(k)} = ${frac(rhs, k)}.`],
              `la solution est x = ${frac(rhs, k)}.`),
            'Retire ' + mono(c) + ' aux deux membres pour regrouper les x.'); }
      }),
      T({ // Équation produit nul
        base: {a: 2, b: -6, c: 1, d: 5},
        params: r => ({a: r.int(1, 5), b: r.nonZero(1, 12), c: r.int(1, 5), d: r.nonZero(1, 12)}),
        accept: ({a, b, c, d}) => b * c !== a * d && b % a === 0 && d % c === 0,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [b / a, d / c, a, c], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] < v[1] && [v[0], v[1]].every(x => close((a * x + b) * (c * x + d), 0)),
        build: ({a, b, c, d}) => { const x1 = -b / a, x2 = -d / c, lo = Math.min(x1, x2), hi = Math.max(x1, x2);
          return item('Résoudre une équation produit nul', `Résous l’équation (${lin(a, b)})(${lin(c, d)}) = 0.`,
            [Q('Plus petite solution', lo), Q('Plus grande solution', hi)],
            C('un produit est nul si et seulement si l’un au moins de ses facteurs est nul.',
              [`${lin(a, b)} = 0 donne x = ${fr(x1)} ; ${lin(c, d)} = 0 donne x = ${fr(x2)}.`],
              `l’équation a deux solutions : ${fr(lo)} et ${fr(hi)}.`),
            'Résous séparément chaque facteur égal à 0.'); }
      }),
      T({ // ax² = c
        base: {a: 3, s: 5},
        params: r => ({a: r.int(1, 6), s: r.int(2, 12)}),
        accept: ({a, s}) => a * s * s <= 600,
        difficulty: ({a, s}) => score({steps: 2, values: [a * s * s, s * s]}),
        verify: ({a, s}, v) => v[0] === s * s && v[1] * v[1] * a === a * s * s && v[1] > 0 && v[2] === -v[1],
        build: ({a, s}) => { const c = a * s * s; return item('Résoudre x² = k', `Résous l’équation ${mono(a, 'x²')} = ${c}.`,
          [Q('Valeur de x²', s * s), Q('Solution positive', s), Q('Solution négative', -s)],
          C('on se ramène à x² = k ; si k > 0, l’équation a deux solutions : √k et −√k.',
            [a > 1 ? `x² = ${c} ÷ ${a} = ${s * s}.` : `x² = ${c}.`, `√${s * s} = ${s}.`],
            `les solutions sont ${s} et ${M}${s}.`),
          'Un carré vaut ' + (s * s) + ' pour deux nombres opposés.'); }
      }),
      T({ // Inéquation
        base: {a: 3, b: -2, c: 10},
        params: r => ({a: r.nonZero(2, 7), b: r.nonZero(1, 15), c: r.int(-15, 20)}),
        accept: ({a, b, c}) => c !== b && Math.abs(c - b) % Math.abs(a) === 0,
        difficulty: ({a, b, c}) => score({steps: 3, values: [a, b, c, (c - b) / a]}),
        verify: ({a, b, c}, v) => close(v[0], (c - b) / a) && (v[1] === 'x < frontière') === (a > 0),
        build: ({a, b, c}) => { const s = (c - b) / a, less = a > 0;
          return item('Résoudre une inéquation', `Résous l’inéquation ${lin(a, b)} < ${fr(c)}.`,
            [Q('Valeur frontière', s), S('Les solutions sont les nombres x tels que', less ? 'x < frontière' : 'x > frontière', ['x < frontière', 'x > frontière'])],
            C('on isole x comme dans une équation ; diviser par un nombre négatif change le sens de l’inégalité.',
              [`${mono(a)} < ${fr(c)} ${M} ${pa(b)}, soit ${mono(a)} < ${fr(c - b)}.`, less ? `On divise par ${a}, positif : x < ${fr(s)}.` : `On divise par ${fr(a)}, négatif : le sens change, x > ${fr(s)}.`],
              `les solutions sont les nombres ${less ? 'strictement inférieurs' : 'strictement supérieurs'} à ${fr(s)}.`),
            'Regarde le signe du nombre par lequel tu divises.'); }
      }),
      T({ // Mise en équation : rectangle
        base: {w: 12, d: 5},
        params: r => ({w: r.int(3, 40), d: r.int(1, 20)}),
        difficulty: ({w, d}) => score({steps: 3, values: [w, d, 4 * w + 2 * d]}),
        verify: ({w, d}, v) => 2 * (v[0] + v[1]) === 4 * w + 2 * d && v[1] - v[0] === d,
        build: ({w, d}) => { const P = 4 * w + 2 * d; return item('Mettre un problème en équation', `La longueur d’un rectangle dépasse sa largeur de ${d} cm. Son périmètre vaut ${P} cm. On note x la largeur.`,
          [Q('Largeur, en cm', w), Q('Longueur, en cm', w + d)],
          C('on exprime la longueur en fonction de x, puis on écrit le périmètre : 2 × (largeur + longueur).',
            [`Longueur : x + ${d}. Périmètre : 2(x + x + ${d}) = 4x + ${2 * d}.`, `4x + ${2 * d} = ${P}, donc 4x = ${P - 2 * d} et x = ${w}.`],
            `la largeur mesure ${w} cm et la longueur ${w + d} cm. Vérification : 2 × (${w} + ${w + d}) = ${P}.`),
          'Écris le périmètre avec la seule inconnue x.'); }
      })
    ],

    /* ---------- 06 · Proportionnalité et pourcentages ---------- */
  };

  const basics = {
    '3-equations': ['Une solution est une valeur de x qui rend l’égalité vraie.', 'Résous x + 5 = 12.', '7', 'Retire 5 aux deux membres.'],
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();

  /* ---------- Figures des exercices ----------
     Chaque figure est calculée avec les paramètres de la variante. La figure de l'énoncé
     montre les données, jamais la réponse : l'inconnue est notée « ? », un angle droit ou
     un parallélisme à démontrer n'est pas codé. `c` est une figure réservée au corrigé. */
  const FG = window.Figures;
  const tri = (a, b, c) => { const x = (a * a + b * b - c * c) / (2 * b); return a + b > c && a + c > b && b + c > a ? [x, Math.sqrt(Math.max(0, a * a - x * x))] : null; };
  const lisible = pts => { /* triangle ni trop plat ni dégénéré */
    const [A, B, D] = pts, aire = Math.abs((B[0] - A[0]) * (D[1] - A[1]) - (D[0] - A[0]) * (B[1] - A[1])) / 2;
    const per = Math.hypot(B[0] - A[0], B[1] - A[1]) + Math.hypot(D[0] - B[0], D[1] - B[1]) + Math.hypot(A[0] - D[0], A[1] - D[1]);
    return aire / (per * per) > 0.012;
  };
  const rectangle = (titre, noms, droit, p1, p2, cotes, extra) => { /* triangle rectangle : sommet de l'angle droit, puis les deux autres */
    if (!lisible([[0, 0], [p1, 0], [0, p2]])) return null;
    const f = FG.figure(titre, {hauteur: 210}).point(droit, 0, 0).point(noms[0], p1, 0).point(noms[1], 0, p2)
      .polygone([droit, noms[0], noms[1]]).angle_droit(droit, noms[0], noms[1]);
    cotes.forEach(c => f.cote(c[0], c[1], c[2]));
    if (extra) extra(f);
    return f.description();
  };
  /* Points nommés lus dans l'énoncé : « A(1 ; −2) » donne A = [1, −2]. La figure reprend ainsi exactement les données affichées. */
  const pointsDe = texte => {
    const out = {};
    for (const m of V.visible(texte).matchAll(/([A-Z]′?)\s*\(\s*([−-]?\d+(?:,\d+)?)\s*;\s*([−-]?\d+(?:,\d+)?)\s*\)/g)) out[m[1]] = [m[2], m[3]].map(t => parseFloat(t.replace('−', '-').replace(',', '.')));
    return out;
  };
  /* Repère orthonormé qui contient l'origine et tous les points donnés, avec une marge d'une unité. */
  const repereDe = (titre, liste) => {
    const xs = liste.map(p => p[0]).concat([0]), ys = liste.map(p => p[1]).concat([0]);
    const etendue = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 2, pas = etendue > 16 ? 2 : 1;
    /* Quand tous les points sont à gauche ou en dessous de l'origine, les noms des deux axes se rejoindraient dans le coin : on prolonge l'axe. */
    const haut = v => v + (v === 0 ? 2 * pas + 1 : 1);
    return FG.repere(titre, {xmin: Math.min(...xs) - 1, xmax: haut(Math.max(...xs)), ymin: Math.min(...ys) - 1, ymax: haut(Math.max(...ys)), pas_x: pas, pas_y: pas, orthonorme: true, hauteur: 300});
  };
  const placer = (r, pts, noms) => { noms.forEach(n => r.point(pts[n][0], pts[n][1], n)); return r; };
  const liste = pts => Object.keys(pts).map(n => `${n}(${fr(pts[n][0])} ; ${fr(pts[n][1])})`).join(', ');
  const FIGURES = {
  };
  if (FG) for (const [slug, liste] of Object.entries(FIGURES)) liste.forEach((figure, i) => {
    if (!figure) return;
    const modele = models[slug][i];
    models[slug][i] = Object.assign({}, modele, {build: p => {
      const exercice = modele.build(p), f = figure(p, exercice) || {};
      if (f.e) exercice.figure = f.e;
      if (f.c) exercice.figure_correction = f.c;
      return exercice;
    }});
  });
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  window.TroisiemeExercises = {slugs: Object.keys(models), count: 6};
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
    const root = document.querySelector('[data-troisieme-chapter]');
    const node = document.getElementById('exercise-data');
    if (root && node) {
      const slug = root.dataset.troisiemeChapter;
      if (!models[slug]) throw new Error('Chapitre de 3e inconnu : ' + slug);
      node.textContent = JSON.stringify({slug, exercises: models[slug].map((_, i) => V.original(slug, i))});
    }
  }
})();
