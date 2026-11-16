/* Série 3-fonctions : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-fonctions': [
      T({ // Images par une formule
        base: {a: 2, b: -3, c: 1, n: 3, m: -2},
        params: r => ({a: r.nonZero(1, 4), b: r.nonZero(1, 7), c: r.int(-9, 9), n: r.int(1, 6), m: r.int(-6, -1)}),
        accept: ({a, b, c, n, m}) => c !== 0 && a * n * n + b * n + c !== 0 && a * m * m + b * m + c !== 0,
        difficulty: ({a, b, c, n, m}) => score({steps: 3, values: [a * n * n + b * n + c, a * m * m + b * m + c], negatives: true}),
        verify: ({a, b, c, n, m}, v) => v[0] === a * n ** 2 + b * n + c && v[1] === a * m ** 2 + b * m + c,
        build: ({a, b, c, n, m}) => { const f = x => a * x * x + b * x + c;
          return item('Calculer des images', `La fonction f est définie par f(x) = ${quad(a, b, c)}. Calcule f(${n}) et f(${fr(m)}).`,
            [Q(`f(${n})`, f(n)), Q(`f(${fr(m)})`, f(m))],
            C('pour calculer une image, on remplace x par la valeur donnée, en mettant les nombres négatifs entre parenthèses.',
              [`f(${n}) = ${fmt.times(a, n + '²', true)}${fmt.times(b, n)}${sg(c)} = ${fr(f(n))}.`, `f(${fr(m)}) = ${fmt.times(a, '(' + fr(m) + ')²', true)}${fmt.times(b, m)}${sg(c)} = ${fr(f(m))}.`],
              `f(${n}) = ${fr(f(n))} et f(${fr(m)}) = ${fr(f(m))}.`),
            'Le carré d’un nombre négatif est positif : (' + fr(m) + ')² = ' + m * m + '.'); }
      }),
      T({ // Lecture d'un tableau de valeurs
        base: {a: 3, b: -1, x0: 2, i: 0},
        params: r => ({a: r.nonZero(2, 6), b: r.int(-9, 9), x0: r.int(-2, 3), i: r.int(0, 5)}),
        accept: ({x0, i}) => x0 !== i - 2,
        difficulty: ({a, b}) => score({steps: 2, values: [3 * a + b, -2 * a + b], negatives: true}),
        verify: ({a, b, x0, i}, v) => v[0] === a * x0 + b && a * v[1] + b === a * (i - 2) + b,
        build: ({a, b, x0, i}) => { const xs = [-2, -1, 0, 1, 2, 3], ys = xs.map(x => a * x + b), y0 = ys[i], ante = xs[i];
          return item('Lire un tableau de valeurs', 'Voici un tableau de valeurs d’une fonction f.' + table('Tableau de valeurs de f', xs, [{label: 'f(x)', cells: ys}], 'x'),
            [Q(`Image de ${fr(x0)}`, a * x0 + b), Q(`Antécédent de ${fr(y0)}`, ante)],
            C('l’image se lit sur la ligne f(x), sous la valeur de x ; un antécédent se lit sur la ligne x, au-dessus de la valeur de f(x).',
              [`Sous x = ${fr(x0)}, on lit ${fr(a * x0 + b)}.`, `Au-dessus de ${fr(y0)}, on lit x = ${fr(ante)}.`],
              `l’image de ${fr(x0)} est ${fr(a * x0 + b)} et l’antécédent de ${fr(y0)} est ${fr(ante)}.`),
            'Image : on part de x. Antécédent : on part de f(x).'); }
      }),
      T({ // Antécédent par le calcul
        base: {a: 4, b: -5, s: 3},
        params: r => ({a: r.nonZero(2, 9), b: r.nonZero(1, 15), s: r.nonZero(1, 10)}),
        difficulty: ({a, b, s}) => score({steps: 3, values: [a, b, a * s + b, s], negatives: true}),
        verify: ({a, b, s}, v) => v[0] === b && a * v[1] + b === a * s + b,
        build: ({a, b, s}) => { const y = a * s + b; return item('Calculer un antécédent', `g(x) = ${lin(a, b)}. Calcule g(0), puis l’antécédent de ${fr(y)} par g.`,
          [Q('g(0)', b), Q(`Antécédent de ${fr(y)}`, s)],
          C('un antécédent de y est un nombre x tel que g(x) = y : on résout une équation.',
            [`g(0) = ${fr(a)} × 0${sg(b)} = ${fr(b)}.`, `${lin(a, b)} = ${fr(y)} donne ${mono(a)} = ${fr(y - b)}, donc x = ${fr(s)}.`],
            `g(0) = ${fr(b)} et l’antécédent de ${fr(y)} est ${fr(s)}.`),
          'Pose l’équation g(x) = ' + fr(y) + '.'); }
      }),
      T({ // Un point sur la courbe ?
        base: {b: -2, c: 3, p: 4, on: 1, k: 2},
        params: r => ({b: r.int(-6, 6), c: r.int(-9, 9), p: r.nonZero(1, 6), on: r.int(0, 1), k: r.nonZero(1, 5)}),
        accept: ({b, c}) => b !== 0 && c !== 0,
        difficulty: ({b, c, p}) => score({steps: 2, values: [p * p + b * p + c], negatives: true}),
        verify: ({b, c, p, on, k}, v) => v[0] === p * p + b * p + c && (v[1] === 'oui') === !!on,
        build: ({b, c, p, on, k}) => { const fp = p * p + b * p + c, q = on ? fp : fp + k;
          return item('Tester l’appartenance d’un point', `f(x) = ${quad(1, b, c)}. Le point A(${fr(p)} ; ${fr(q)}) appartient-il à la courbe de f ?`,
            [Q(`f(${fr(p)})`, fp), S('A est-il sur la courbe ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('un point appartient à la courbe lorsque son ordonnée est l’image de son abscisse.',
              [`f(${fr(p)}) = ${pa(p)}²${fmt.times(b, p)}${sg(c)} = ${fr(fp)}.`],
              on ? `f(${fr(p)}) = ${fr(q)} : A appartient à la courbe.` : `f(${fr(p)}) = ${fr(fp)} ≠ ${fr(q)} : A n’appartient pas à la courbe.`),
            'Calcule l’image de l’abscisse et compare-la à l’ordonnée.'); }
      }),
      T({ // Tarif de taxi
        base: {P: 4, k: 15, d: 12, D: 20},
        params: r => ({P: r.int(2, 8), k: r.int(11, 25), d: r.int(3, 30), D: r.int(5, 40)}),
        accept: ({d, D}) => d !== D,
        difficulty: ({P, k, d, D}) => score({steps: 3, values: [P + k * d / 10, P + k * D / 10], decimals: true}),
        verify: ({P, k, d, D}, v) => close(v[0], P + k / 10 * d) && close(P + k / 10 * v[1], P + k / 10 * D),
        build: ({P, k, d, D}) => { const u = k / 10, f = x => P + u * x, M2 = f(D);
          return item('Utiliser une fonction en contexte', `Un taxi facture une prise en charge de ${P} € puis ${fr(u)} € par kilomètre. On note f(x) le prix, en €, d’une course de x km : f(x) = ${P} + ${fr(u)}x.`,
            [Q(`Prix d’une course de ${d} km, en €`, f(d)), Q(`Distance parcourue pour ${fr(r2(M2))} €, en km`, D)],
            C('on calcule une image pour le prix, et on résout f(x) = prix pour la distance.',
              [`f(${d}) = ${P} + ${fr(u)} × ${d} = ${fr(r2(f(d)))} €.`, `${P} + ${fr(u)}x = ${fr(r2(M2))} donne ${fr(u)}x = ${fr(r2(M2 - P))}, puis x = ${D}.`],
              `une course de ${d} km coûte ${fr(r2(f(d)))} € ; pour ${fr(r2(M2))} €, on parcourt ${D} km.`),
            'Le prix d’une course est une image ; la distance correspondant à un prix est un antécédent.'); }
      }),
      T({ // Antécédents de 0 par ax² − c
        base: {a: 1, s: 4},
        params: r => ({a: r.int(1, 5), s: r.int(2, 15)}),
        accept: ({a, s}) => a * s * s <= 500,
        difficulty: ({s}) => score({steps: 2, values: [s]}),
        verify: ({a, s}, v) => v[0] === -a * s * s && a * v[1] * v[1] === a * s * s && a * v[2] * v[2] === a * s * s && v[1] < 0 && v[2] > 0,
        build: ({a, s}) => { const c = a * s * s;
          return item('Trouver les antécédents de 0', `h(x) = ${mono(a, 'x²')} ${M} ${c}. Calcule h(0), puis les antécédents de 0 par h.`,
            [Q('h(0)', -c), Q('Antécédent négatif de 0', -s), Q('Antécédent positif de 0', s)],
            C('les antécédents de 0 sont les solutions de h(x) = 0' + (a > 1 ? ', c’est-à-dire ' + a + 'x² = ' + c + ', puis x² = ' + s * s + '.' : ', c’est-à-dire x² = ' + c + '.'),
              [`h(0) = ${a > 1 ? a + ' × ' : ''}0² ${M} ${c} = ${M}${c}.`, `x² = ${s * s} pour x = ${s} ou x = ${M}${s}.`],
              `h(0) = ${M}${c} ; 0 a deux antécédents : ${M}${s} et ${s}.`),
            'Un nombre et son opposé ont le même carré.'); }
      })
    ],

    /* ---------- 08 · Fonctions linéaires et affines ---------- */
  };

  const basics = {
    '3-fonctions': ['L’image de a par f est f(a) ; un antécédent de b est un nombre x tel que f(x) = b.', 'f(x) = 2x. Calcule f(5).', '10', 'Remplace x par 5.'],
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
    '3-fonctions': [null, null, null,
      ({b, c, p, on, k}) => { const fp = p * p + b * p + c, q = on ? fp : fp + k, w = Math.max(0.5, Math.min(3, 9 / Math.abs(2 * p + b))); /* fenêtre resserrée quand la courbe est raide : un écart d'une unité reste visible */
        return {c: FG.repere(on ? `A est sur la courbe de f : son ordonnée est f(${fr(p)})` : `A n’est pas sur la courbe de f : son ordonnée n’est pas f(${fr(p)})`,
          Object.assign({xmin: p - w, xmax: p + w, ymin: Math.min(fp, q) - 8, ymax: Math.max(fp, q) + 8, hauteur: 260}, p + w <= 0 && Math.max(fp, q) + 8 <= 6 ? {nom_y: ''} : {}))
          .courbe(`x^2${b < 0 ? '-' : '+'}${Math.abs(b)}x${c < 0 ? '-' : '+'}${Math.abs(c)}`, {nom: 'C_f'}).lecture(p, fp, {vx: false}).point(p, q, 'A', {pos: on ? ['se', 'no'] : (q > fp) === (2 * p + b > 0) ? ['o', 'no', 'so'] : ['e', 'se', 'ne']}).description()}; }
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
