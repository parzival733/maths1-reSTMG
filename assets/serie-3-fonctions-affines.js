/* Série 3-fonctions-affines : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-fonctions-affines': [
      T({ // Fonction linéaire
        base: {a: 25, p: 4, r: 7},
        params: r => ({a: r.nonZero(5, 45), p: r.int(2, 12), r: r.int(2, 20)}),
        accept: ({a, p, r}) => a % 5 === 0 && Math.abs(a) !== 10 && p !== r,
        difficulty: ({a, p, r}) => score({steps: 2, values: [a * p / 10, a * r / 10], decimals: true}),
        verify: ({a, p, r}, v) => close(v[0] * p, a * p / 10) && close(v[1], v[0] * r),
        build: ({a, p, r}) => { const k = a / 10; return item('Déterminer une fonction linéaire', `f est une fonction linéaire telle que f(${p}) = ${fr(k * p)}. On écrit f(x) = ax.`,
          [Q('Coefficient a', k), Q(`f(${r})`, k * r)],
          C('pour une fonction linéaire, f(x) = ax, donc a = f(p) ÷ p.',
            [`a = ${fr(k * p)} ÷ ${p} = ${fr(k)}.`, `f(${r}) = ${fr(k)} × ${r} = ${fr(r2(k * r))}.`],
            `f(x) = ${fr(k)}x et f(${r}) = ${fr(r2(k * r))}.`),
          'Divise l’image par le nombre de départ.'); }
      }),
      T({ // Fonction affine par deux images
        base: {a: 3, b: -2, x1: 1, x2: 4},
        params: r => ({a: r.nonZero(1, 6), b: r.nonZero(1, 12), x1: r.int(-4, 3), x2: r.int(1, 8)}),
        accept: ({x1, x2}) => x2 > x1 && x1 !== 0,
        difficulty: ({a, b, x1, x2}) => score({steps: 3, values: [a * x1 + b, a * x2 + b, x2 - x1], negatives: true}),
        verify: ({a, b, x1, x2}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * x2 + v[1] === a * x2 + b,
        build: ({a, b, x1, x2}) => { const y1 = a * x1 + b, y2 = a * x2 + b;
          return item('Déterminer une fonction affine', `g est affine, g(${fr(x1)}) = ${fr(y1)} et g(${x2}) = ${fr(y2)}. On écrit g(x) = ax + b.`,
            [Q('Coefficient a', a), Q('Ordonnée à l’origine b', b)],
            C('a = (g(x₂) − g(x₁)) ÷ (x₂ − x₁), puis b se déduit d’une image connue.',
              [`a = (${fmt.diff(y2, y1)}) ÷ (${fmt.diff(x2, x1)}) = ${fr(y2 - y1)} ÷ ${x2 - x1} = ${fr(a)}.`, `b = ${fr(y2)} ${M} ${pa(a)} × ${x2} = ${fr(b)}.`],
              `g(x) = ${lin(a, b)}.`),
            'Le coefficient a mesure la variation de g(x) quand x augmente de 1.'); }
      }),
      T({ // Pourcentage et fonction linéaire
        base: {t: 20, up: 1, P: 45},
        params: r => ({t: r.pick([5, 10, 15, 20, 25, 30, 40]), up: r.int(0, 1), P: r.int(12, 150)}),
        difficulty: ({t, P}) => score({steps: 2, values: [t, P, P * (1 + t / 100)], decimals: true}),
        verify: ({t, up, P}, v) => close(v[0], 1 + (up ? 1 : -1) * t / 100) && close(v[1], v[0] * P),
        build: ({t, up, P}) => { const k = 1 + (up ? 1 : -1) * t / 100;
          return item('Modéliser une évolution par une fonction linéaire', `Une ${up ? 'hausse' : 'baisse'} de ${t} % est modélisée par une fonction linéaire f : x ↦ ax, où x est le prix initial.`,
            [Q('Coefficient a', k, 3), Q(`f(${P})`, k * P)],
            C(`une ${up ? 'hausse' : 'baisse'} de t % multiplie le prix par 1 ${up ? '+' : M} t/100.`,
              [`a = ${fr(k)}.`, `f(${P}) = ${fr(k)} × ${P} = ${fr(r2(k * P))}.`],
              `f(x) = ${fr(k)}x ; un prix de ${P} € devient ${fr(r2(k * P))} €.`),
            'Le coefficient d’une évolution en pourcentage est un coefficient multiplicateur.'); }
      }),
      T({ // Intersection de deux droites
        base: {a: 2, b: 1, c: -1, s: 3},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-10, 10), c: r.nonZero(1, 6), s: r.int(-6, 6)}),
        accept: ({a, c, s}) => a !== c && s !== 0,
        difficulty: ({a, b, c, s}) => score({steps: 3, values: [a - c, a * s + b, s], negatives: true}),
        verify: ({a, b, c, s}, v) => { const d = a * s + b - c * s; return a * v[0] + b === c * v[0] + d && v[1] === a * v[0] + b; },
        build: ({a, b, c, s}) => { const d = a * s + b - c * s, y = a * s + b;
          return item('Trouver le point d’intersection', `f(x) = ${lin(a, b)} et g(x) = ${lin(c, d)}. Les droites représentant f et g se coupent en un point.`,
            [Q('Abscisse du point d’intersection', s), Q('Ordonnée du point d’intersection', y)],
            C('au point d’intersection, f(x) = g(x) : on résout cette équation, puis on calcule l’image.',
              [`${lin(a, b)} = ${lin(c, d)} donne ${mono(a - c)} = ${fr(d - b)}, donc x = ${fr(s)}.`, `f(${fr(s)}) = ${fr(a)} × ${pa(s)}${sg(b)} = ${fr(y)}.`],
              `les droites se coupent au point (${fr(s)} ; ${fr(y)}).`),
            'Vérifie que g donne la même ordonnée que f.'); }
      }),
      T({ // Comparer deux tarifs
        base: {m: 8, S: 35, n: 5, k: 6},
        params: r => ({m: r.int(5, 15), S: 5 * r.int(2, 12), n: r.int(2, 10), k: r.int(3, 15)}),
        accept: ({m, n, S}) => n < m && S % (m - n) !== 0,
        difficulty: ({m, S, n, k}) => score({steps: 3, values: [m * k, S + n * k, S / (m - n)]}),
        verify: ({m, S, n, k}, v) => v[0] === m * k && v[1] === S + n * k && S + n * v[2] < m * v[2] && !(S + n * (v[2] - 1) < m * (v[2] - 1)),
        build: ({m, S, n, k}) => { const N0 = Math.floor(S / (m - n)) + 1;
          return item('Comparer deux tarifs', `Piscine : tarif A à ${m} € l’entrée ; tarif B avec un abonnement de ${S} € puis ${n} € l’entrée.`,
            [Q(`Coût de ${k} entrées au tarif A, en €`, m * k), Q(`Coût de ${k} entrées au tarif B, en €`, S + n * k), Q('Nombre minimal d’entrées pour que B soit moins cher', N0)],
            C('on modélise les tarifs par f(x) = ' + m + 'x (linéaire) et g(x) = ' + S + ' + ' + n + 'x (affine), puis on résout g(x) < f(x).',
              [`f(${k}) = ${m * k} € et g(${k}) = ${S + n * k} €.`, `${S} + ${n}x < ${m}x donne ${S} < ${m - n}x, soit x > ${fr(r2(S / (m - n)))}.`],
              `B devient moins cher à partir de ${N0} entrées.`),
            'Le nombre d’entrées est un entier : prends le premier entier qui convient.'); }
      }),
      T({ // Sens de variation
        base: {a: -3, b: 7, k: 4},
        params: r => ({a: r.nonZero(1, 8), b: r.int(-12, 12), k: r.int(-6, 9)}),
        accept: ({k, b}) => k !== 0 && b !== 0,
        difficulty: ({a, b, k}) => score({steps: 2, values: [a * k + b, a, b], negatives: true}),
        verify: ({a, b, k}, v) => (v[0] === 'croissante') === (a > 0) && v[1] === a * k + b,
        build: ({a, b, k}) => item('Lire le sens de variation', `f(x) = ${lin(a, b)}. Indique le sens de variation de f, puis calcule f(${fr(k)}).`,
          [S('f est', a > 0 ? 'croissante' : 'décroissante', ['croissante', 'décroissante']), Q(`f(${fr(k)})`, a * k + b)],
          C('une fonction affine x ↦ ax + b est croissante si a > 0 et décroissante si a < 0.',
            [`a = ${fr(a)} est ${a > 0 ? 'positif' : 'négatif'}.`, `f(${fr(k)}) = ${fr(a)} × ${pa(k)}${sg(b)} = ${fr(a * k + b)}.`],
            `f est ${a > 0 ? 'croissante' : 'décroissante'} et f(${fr(k)}) = ${fr(a * k + b)}.`),
          'Seul le signe du coefficient de x décide du sens de variation.')
      })
    ],

    /* ---------- 09 · Statistiques ---------- */
  };

  const basics = {
    '3-fonctions-affines': ['Une fonction affine s’écrit f(x) = ax + b ; elle est linéaire si b = 0.', 'f(x) = 3x + 1. Calcule f(2).', '7', '3 × 2 + 1.'],
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
    '3-fonctions-affines': [null, null, null,
      ({a, b, c, s}) => { const d = a * s + b - c * s, y = a * s + b, x1 = Math.min(0, s) - 2, x2 = Math.max(0, s) + 2;
        const ys = [a * x1 + b, a * x2 + b, c * x1 + d, c * x2 + d, 0].sort((u, v) => u - v);
        return {c: FG.repere(`Les droites de f et de g se coupent au point (${fr(s)} ; ${fr(y)})`, {xmin: x1, xmax: x2, ymin: ys[0], ymax: ys[4], hauteur: 280})
          .droite_affine(a, b, {nom: 'f'}).droite_affine(c, d, {nom: 'g', pointilles: true}).lecture(s, y).description()}; },
      ({m, S, n, k}) => { const x0 = S / (m - n), xmax = Math.max(k + 1, Math.ceil(1.7 * x0));
        return {c: FG.repere(`Tarif A et tarif B : B devient moins cher après ${fr(r2(x0))} entrées`, {xmin: 0, xmax, ymin: 0, ymax: m * xmax, nom_x: 'entrées', nom_y: 'coût (€)', hauteur: 280})
          .droite_affine(m, 0, {nom: 'A'}).droite_affine(n, S, {nom: 'B', pointilles: true}).lecture(x0, m * x0, {vx: '≈ ' + fr(r2(x0)), vy: false}).description()}; }
    ],
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
