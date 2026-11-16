/* Série 2-vecteurs : extrait de assets/seconde-exercices.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant la Seconde.');
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
    hint, level: 'Seconde', tasks: TASKS
  });
  // Réponses limitées à 100 000 en valeur absolue.
  const T = model => ({limit: 100000, decimals: 6, ...model});

  const sqrtFree = n => { let k = 1, m = n; for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; } return [k, m]; };
  const sig = (x, n) => { if (x === 0) return 0; const e = Math.floor(Math.log10(Math.abs(x))) + 1 - n; return Math.round(x / 10 ** e) * 10 ** e; };
  const det = (a, b, c, d) => a * d - b * c;
  // Terme d’une expression Python : signe séparé par des espaces, coefficient 1 omis.
  const pyTerm = (k, v, first = false) => {
    const m = Math.abs(k), body = v ? (m === 1 ? v : m + '*' + v) : String(m);
    return first ? (k < 0 ? '-' : '') + body : (k < 0 ? '- ' : '+ ') + body;
  };
  const vec = (x, y) => '(' + fr(x) + ' ; ' + fr(y) + ')';
  const py = lines => '<pre><code>' + lines.map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n') + '</code></pre>';
  const std = (vals, eff) => { const n = sum(eff), m = sum(vals.map((v, i) => v * eff[i])) / n; return Math.sqrt(sum(vals.map((v, i) => eff[i] * (v - m) ** 2)) / n); };
  const quartiles = list => { const s = [...list].sort((a, b) => a - b), n = s.length; return [s[Math.ceil(n / 4) - 1], s[Math.ceil(3 * n / 4) - 1]]; };
  const signWord = v => (v > 0 ? 'positif' : 'négatif');
  // « a + b » sans écrire « + 0 ».
  const plus = (a, b) => (b === 0 ? fr(a) : fr(a) + ' + ' + pa(b));
  // « t − a » sans écrire « − 0 ».
  const tMinus = (t, a) => (a === 0 ? t : t + (a > 0 ? ' ' + M + ' ' : ' + ') + fr(Math.abs(a)));

  const models = {
    /* ---------- 01 · Arithmétique ---------- */
    '2-vecteurs': [
      T({ // Coordonnées de AB
        base: {xa: 1, ya: -2, xb: 4, yb: 3},
        params: r => ({xa: r.int(-9, 9), ya: r.int(-9, 9), xb: r.int(-9, 9), yb: r.int(-9, 9)}),
        accept: ({xa, ya, xb, yb}) => xa !== xb && ya !== yb,
        difficulty: () => score({steps: 2, values: [18], negatives: true}),
        verify: ({xa, ya, xb, yb}, v) => v[0] === xb - xa && v[1] === yb - ya,
        build: ({xa, ya, xb, yb}) => item('Calculer les coordonnées d’un vecteur', `Dans un repère orthonormé, A${vec(xa, ya)} et B${vec(xb, yb)}. Calcule les coordonnées du vecteur <span class="vec"><span class="sr-only">vecteur </span>AB</span>.`,
          [Q('Abscisse du vecteur AB', xb - xa), Q('Ordonnée du vecteur AB', yb - ya)],
          C('<span class="vec"><span class="sr-only">vecteur </span>AB</span> a pour coordonnées (x<sub>B</sub> − x<sub>A</sub> ; y<sub>B</sub> − y<sub>A</sub>).',
            [`${fmt.diff(xb, xa)} = ${fr(xb - xa)} et ${fmt.diff(yb, ya)} = ${fr(yb - ya)}.`],
            `<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(xb - xa, yb - ya)}.`),
          'Arrivée moins départ.')
      }),
      T({ // Combinaison linéaire
        base: {a: 2, b: -1, c: 3, d: 4, k: 2, l: -1},
        params: r => ({a: r.int(-6, 6), b: r.int(-6, 6), c: r.int(-6, 6), d: r.int(-6, 6), k: r.nonZero(2, 4), l: r.nonZero(1, 3)}),
        accept: ({a, b, c, d}) => det(a, b, c, d) !== 0,
        difficulty: () => score({steps: 3, values: [30], negatives: true}),
        verify: ({a, b, c, d, k, l}, v) => v[0] === k * a + l * c && v[1] === k * b + l * d,
        build: ({a, b, c, d, k, l}) => item('Combiner deux vecteurs', `<span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>v</span>${vec(c, d)}. Calcule les coordonnées de <span class="vec"><span class="sr-only">vecteur </span>w</span> = ${fr(k)}<span class="vec"><span class="sr-only">vecteur </span>u</span> ${l > 0 ? '+' : M} ${Math.abs(l) === 1 ? '' : Math.abs(l)}<span class="vec"><span class="sr-only">vecteur </span>v</span>.`,
          [Q('Abscisse du vecteur w', k * a + l * c), Q('Ordonnée du vecteur w', k * b + l * d)],
          C('on multiplie les coordonnées par le réel, puis on additionne coordonnée par coordonnée.',
            [`${fr(k)} × ${pa(a)} + ${pa(l)} × ${pa(c)} = ${fr(k * a + l * c)}.`, `${fr(k)} × ${pa(b)} + ${pa(l)} × ${pa(d)} = ${fr(k * b + l * d)}.`],
            `<span class="vec"><span class="sr-only">vecteur </span>w</span>${vec(k * a + l * c, k * b + l * d)}.`),
          'Traite les abscisses, puis les ordonnées.')
      }),
      T({ // Norme
        base: {a: 3, b: -4},
        params: r => ({a: r.nonZero(1, 12), b: r.nonZero(1, 12)}),
        difficulty: ({a, b}) => score({steps: 2, values: [a * a + b * b], decimals: true}),
        verify: ({a, b}, v) => v[0] === a * a + b * b && close(v[1], Math.sqrt(v[0])),
        build: ({a, b}) => { const n2 = a * a + b * b;
          return item('Calculer une norme', `Dans une base orthonormée, <span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)}. Calcule ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖² puis ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖.`,
            [Q('Norme de u au carré', n2), Q('Norme de u', Math.sqrt(n2))],
            C('dans une base orthonormée, ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ = √(x² + y²), conséquence du théorème de Pythagore.',
              [`‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖² = ${pa(a)}² + ${pa(b)}² = ${n2}.`, `‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ = √${n2} ${eq(Math.sqrt(n2))}.`],
              `‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ ${eq(Math.sqrt(n2))}.`),
            'Une norme est une longueur, donc positive.'); }
      }),
      T({ // Milieu
        base: {xa: -3, ya: 2, xb: 5, yb: 7},
        params: r => ({xa: r.int(-12, 12), ya: r.int(-12, 12), xb: r.int(-12, 12), yb: r.int(-12, 12)}),
        accept: ({xa, ya, xb, yb}) => xa !== xb && ya !== yb,
        difficulty: () => score({steps: 2, values: [12], negatives: true}),
        verify: ({xa, ya, xb, yb}, v) => close(2 * v[0], xa + xb) && close(2 * v[1], ya + yb),
        build: ({xa, ya, xb, yb}) => item('Calculer les coordonnées d’un milieu', `A${vec(xa, ya)} et B${vec(xb, yb)}. Calcule les coordonnées du milieu I de [AB].`,
          [Q('Abscisse de I', (xa + xb) / 2), Q('Ordonnée de I', (ya + yb) / 2)],
          C('I est le milieu de [AB] si <span class="vec"><span class="sr-only">vecteur </span>AI</span> = <span class="vec"><span class="sr-only">vecteur </span>IB</span> ; ses coordonnées sont les moyennes de celles de A et B.',
            [`x<sub>I</sub> = (${plus(xa, xb)}) ÷ 2 = ${fr((xa + xb) / 2)} ; y<sub>I</sub> = (${plus(ya, yb)}) ÷ 2 = ${fr((ya + yb) / 2)}.`],
            `I${vec((xa + xb) / 2, (ya + yb) / 2)}.`),
          'Fais la moyenne des abscisses, puis des ordonnées.')
      }),
      T({ // Parallélogramme
        base: {xa: 1, ya: 1, xb: 5, yb: 2, xc: 6, yc: 6},
        params: r => ({xa: r.int(-8, 8), ya: r.int(-8, 8), xb: r.int(-8, 8), yb: r.int(-8, 8), xc: r.int(-8, 8), yc: r.int(-8, 8)}),
        accept: ({xa, ya, xb, yb, xc, yc}) => det(xb - xa, yb - ya, xc - xa, yc - ya) !== 0,
        difficulty: () => score({steps: 3, values: [16], negatives: true}),
        verify: ({xa, ya, xb, yb, xc, yc}, v) => xb - xa === xc - v[0] && yb - ya === yc - v[1],
        build: ({xa, ya, xb, yb, xc, yc}) => { const xd = xa + xc - xb, yd = ya + yc - yb;
          return item('Compléter un parallélogramme', `A${vec(xa, ya)}, B${vec(xb, yb)} et C${vec(xc, yc)}. Détermine D tel que ABCD soit un parallélogramme.`,
            [Q('Abscisse de D', xd), Q('Ordonnée de D', yd)],
            C('ABCD est un parallélogramme si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>DC</span>.',
              [`<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(xb - xa, yb - ya)} et <span class="vec"><span class="sr-only">vecteur </span>DC</span>(${fr(xc)} ${M} x ; ${fr(yc)} ${M} y).`, `x = ${fmt.diff(xc, xb - xa)} = ${fr(xd)} et y = ${fmt.diff(yc, yb - ya)} = ${fr(yd)}.`],
              `D${vec(xd, yd)}.`),
            'Attention à l’ordre des sommets : <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>DC</span>, et non <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>CD</span>.'); }
      }),
      T({ // Relation de Chasles
        base: {xa: 0, ya: 2, u1: 3, u2: 1, v1: -1, v2: 4},
        params: r => ({xa: r.int(-6, 6), ya: r.int(-6, 6), u1: r.nonZero(1, 6), u2: r.int(-6, 6), v1: r.nonZero(1, 6), v2: r.int(-6, 6)}),
        accept: ({u1, u2, v1, v2}) => det(u1, u2, v1, v2) !== 0,
        difficulty: () => score({steps: 3, values: [12], negatives: true}),
        verify: ({xa, ya, u1, u2, v1, v2}, v) => v[0] === u1 + v1 && v[1] === u2 + v2 && v[2] === xa + u1 + v1 && v[3] === ya + u2 + v2,
        build: ({xa, ya, u1, u2, v1, v2}) => item('Utiliser la relation de Chasles', `A${vec(xa, ya)}, <span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(u1, u2)} et <span class="vec"><span class="sr-only">vecteur </span>BC</span>${vec(v1, v2)}. Calcule <span class="vec"><span class="sr-only">vecteur </span>AC</span>, puis les coordonnées de C.`,
          [Q('Abscisse du vecteur AC', u1 + v1), Q('Ordonnée du vecteur AC', u2 + v2), Q('Abscisse de C', xa + u1 + v1), Q('Ordonnée de C', ya + u2 + v2)],
          C('relation de Chasles : <span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>BC</span> = <span class="vec"><span class="sr-only">vecteur </span>AC</span>. Puis C est l’image de A par la translation de vecteur <span class="vec"><span class="sr-only">vecteur </span>AC</span>.',
            [`<span class="vec"><span class="sr-only">vecteur </span>AC</span>(${plus(u1, v1)} ; ${plus(u2, v2)}) = <span class="vec"><span class="sr-only">vecteur </span>AC</span>${vec(u1 + v1, u2 + v2)}.`, `C(${plus(xa, u1 + v1)} ; ${plus(ya, u2 + v2)}) = C${vec(xa + u1 + v1, ya + u2 + v2)}.`],
            `<span class="vec"><span class="sr-only">vecteur </span>AC</span>${vec(u1 + v1, u2 + v2)} et C${vec(xa + u1 + v1, ya + u2 + v2)}.`),
          'Les vecteurs s’enchaînent : l’arrivée de l’un est le départ du suivant.')
      })
    ],

    /* ---------- 06 · Colinéarité et géométrie repérée ---------- */
  };

  const basics = {
    '2-vecteurs': ['Le vecteur AB a pour coordonnées (x_B − x_A ; y_B − y_A).', 'A(1 ; 2), B(4 ; 6) : abscisse du vecteur AB ?', '3', '4 − 1.'],
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  /* ---------- Figures des exercices ----------
     Chaque figure est calculée avec les données de la variante. La figure de l'énoncé montre
     les données, jamais la réponse ; `c` est une figure réservée au corrigé (alignement,
     parallélisme, nature d'un triangle, point cherché). */
  const FG = window.Figures;

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
  /* Pas des graduations d'une droite numérique selon son étendue. */
  const pasDe = etendue => (etendue > 60 ? 10 : etendue > 30 ? 5 : etendue > 14 ? 2 : 1);
  /* Cadre d'un repère qui contient l'axe des abscisses et les courbes données entre x1 et x2. */
  const cadre = (fs, x1, x2, options, plus, de, a) => {
    const ys = [0].concat(plus || []), u = de == null ? x1 : de, v = a == null ? x2 : a;
    for (const f of fs) for (let i = 0; i <= 40; i++) ys.push(f(u + (v - u) * i / 40));
    const lo = Math.min(...ys), hi = Math.max(...ys), marge = 0.08 * (hi - lo || 1);
    return Object.assign({xmin: x1, xmax: x2, ymin: lo - marge, ymax: hi + marge}, options || {});
  };
  /* Parabole a(x − r1)(x − r2) avec le signe du produit de part et d'autre des racines. */
  const parabole = (a, r1, r2, titre, t) => { const f = x => a * (x - r1) * (x - r2), e = Math.max(2, (r2 - r1) / 2), dehors = a > 0 ? '+' : '-', dedans = a > 0 ? '-' : '+', texte = s => (s === '+' ? '+' : '−');
    const x1 = Math.min(r1 - e, -1, t == null ? 0 : t - 1), x2 = Math.max(r2 + e, 1, t == null ? 0 : t + 1);
    return FG.repere(titre, cadre([f], x1, x2, {hauteur: 280}, [], r1 - e, r2 + e)).courbe(`(${a})*(x-(${r1}))*(x-(${r2}))`)
      .zone_signe(null, r1, texte(dehors), {signe: dehors}).zone_signe(r1, r2, texte(dedans), {signe: dedans}).zone_signe(r2, null, texte(dehors), {signe: dehors}).point(r1, 0).point(r2, 0).description(); };
  const FIGURES = {
    '2-vecteurs': [
      (p, ex) => { const pts = pointsDe(ex.statement);
        return {e: placer(repereDe(`Points ${liste(pts)} et vecteur AB`, [pts.A, pts.B]).vecteur(pts.A[0], pts.A[1], pts.B[0], pts.B[1]), pts, ['A', 'B']).description()}; },
      null, null,
      (p, ex) => { const pts = pointsDe(ex.statement), base = titre => placer(repereDe(titre, [pts.A, pts.B]).segment(pts.A[0], pts.A[1], pts.B[0], pts.B[1]), pts, ['A', 'B']);
        return {e: base(`Points ${liste(pts)} et segment [AB]`).description(),
          c: base(`Le milieu I du segment [AB]`).point((pts.A[0] + pts.B[0]) / 2, (pts.A[1] + pts.B[1]) / 2, 'I').description()}; },
      (p, ex) => { const pts = pointsDe(ex.statement), D = [pts.A[0] + pts.C[0] - pts.B[0], pts.A[1] + pts.C[1] - pts.B[1]];
        const base = titre => placer(repereDe(titre, [pts.A, pts.B, pts.C, D]).segment(pts.A[0], pts.A[1], pts.B[0], pts.B[1]).segment(pts.B[0], pts.B[1], pts.C[0], pts.C[1]), pts, ['A', 'B', 'C']);
        return {e: base(`Points ${liste(pts)} et segments [AB] et [BC]`).description(),
          c: base(`Parallélogramme ABCD : les vecteurs AB et DC sont égaux`).segment(pts.C[0], pts.C[1], D[0], D[1], {pointilles: true}).segment(D[0], D[1], pts.A[0], pts.A[1], {pointilles: true}).point(D[0], D[1], 'D').description()}; }
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
  window.SecondeExercises = {slugs: Object.keys(models), count: 6};
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
    const root = document.querySelector('[data-seconde-chapter]');
    const node = document.getElementById('exercise-data');
    if (root && node) {
      const slug = root.dataset.secondeChapter;
      if (!models[slug]) throw new Error('Chapitre de Seconde inconnu : ' + slug);
      node.textContent = JSON.stringify({slug, exercises: models[slug].map((_, i) => V.original(slug, i))});
    }
  }
})();
