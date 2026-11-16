/* Série 3-transformations : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-transformations': [
      T({ // Homothétie
        base: {k: 2, a: 3, L: 5},
        params: r => ({k: r.pick([-3, -2, -1.5, -0.5, 0.5, 1.5, 2, 3]), a: r.int(2, 9), L: r.int(2, 12)}),
        difficulty: ({k, a, L}) => score({steps: 2, values: [Math.abs(k) * a, Math.abs(k) * L], decimals: !Number.isInteger(k)}),
        verify: ({k, a, L}, v) => close(v[0], Math.abs(k) * a) && close(v[1], Math.abs(k) * L) && (v[2] === 'du même côté que A') === (k > 0),
        build: ({k, a, L}) => { const same = k > 0, K = Math.abs(k);
          return item('Construire l’image par une homothétie', `L’homothétie h de centre O et de rapport ${fr(k)} transforme A en A′ et B en B′. OA = ${a} cm et AB = ${L} cm.`,
            [Q('OA′, en cm', K * a), Q('A′B′, en cm', K * L), S('Par rapport à O, A′ est', same ? 'du même côté que A' : 'du côté opposé à A', ['du même côté que A', 'du côté opposé à A'])],
            C('une homothétie de rapport k multiplie les longueurs par |k| ; si k > 0, A′ est sur la demi-droite [OA), si k < 0 de l’autre côté de O.',
              [`OA′ = ${fr(K)} × ${a} = ${fr(K * a)} cm ; A′B′ = ${fr(K)} × ${L} = ${fr(K * L)} cm.`],
              `OA′ = ${fr(K * a)} cm, A′B′ = ${fr(K * L)} cm, et A′ est ${same ? 'du même côté que A' : 'du côté opposé à A'} par rapport à O.`),
            'Le signe du rapport donne le côté ; sa valeur sans le signe donne les longueurs.'); }
      }),
      T({ // Réduction d'un solide
        base: {k: 0.5, A: 36, V: 120},
        params: r => ({k: r.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]), A: r.int(10, 80), V: 10 * r.int(5, 60)}),
        difficulty: ({k, A, V}) => score({steps: 3, values: [k * k * A, k ** 3 * V], decimals: true}),
        verify: ({k, A, V}, v) => close(v[0], k * k * A) && close(v[1], k ** 3 * V),
        build: ({k, A, V}) => item('Réduire un solide', `Une pyramide a une base d’aire ${A} cm² et un volume de ${V} cm³. On la coupe parallèlement à sa base : la petite pyramide obtenue est une réduction de rapport ${fr(k)}.`,
          [Q('Aire de la petite base, en cm²', k * k * A), Q('Volume de la petite pyramide, en cm³', k ** 3 * V)],
          C('dans une réduction de rapport k, les aires sont multipliées par k² et les volumes par k³.',
            [`Aire : ${A} × ${fr(k)}² = ${A} × ${fr(k * k)} ${eq(k * k * A)} cm².`, `Volume : ${V} × ${fr(k)}³ = ${V} × ${fr(k ** 3)} ${eq(k ** 3 * V)} cm³.`],
            `la petite base mesure ${about(k * k * A)} cm² et le petit volume ${about(k ** 3 * V)} cm³.`),
          'Aire : puissance 2 ; volume : puissance 3.')
      }),
      T({ // Translation
        base: {xa: 1, ya: 2, xb: -2, yb: 1, xc: 3, yc: -1},
        params: r => ({xa: r.int(-6, 6), ya: r.int(-6, 6), xb: r.int(-6, 6), yb: r.int(-6, 6), xc: r.int(-6, 6), yc: r.int(-6, 6)}),
        accept: ({xb, yb, xc, yc, xa, ya}) => (xb !== xc || yb !== yc) && Math.abs(xa + xc - xb) <= 12 && Math.abs(ya + yc - yb) <= 12 && xc !== xb && yc !== yb,
        difficulty: () => score({steps: 3, values: [12], negatives: true}),
        verify: ({xa, ya, xb, yb, xc, yc}, v) => v[0] - xa === xc - xb && v[1] - ya === yc - yb,
        build: ({xa, ya, xb, yb, xc, yc}) => { const dx = xc - xb, dy = yc - yb;
          return item('Calculer l’image par une translation', `Dans un repère, B(${fr(xb)} ; ${fr(yb)}), C(${fr(xc)} ; ${fr(yc)}) et A(${fr(xa)} ; ${fr(ya)}). On note A′ l’image de A par la translation qui transforme B en C.`,
            [Q('Abscisse de A′', xa + dx), Q('Ordonnée de A′', ya + dy)],
            C('une translation déplace tous les points de la même façon : le déplacement de B vers C s’applique à A.',
              [`De B à C : ${dx >= 0 ? '+' : M}${Math.abs(dx)} en abscisse et ${dy >= 0 ? '+' : M}${Math.abs(dy)} en ordonnée.`, `A′(${fr(xa)}${sg(dx)} ; ${fr(ya)}${sg(dy)}) = A′(${fr(xa + dx)} ; ${fr(ya + dy)}).`],
              `A′(${fr(xa + dx)} ; ${fr(ya + dy)}).`),
            'Calcule d’abord le déplacement horizontal et vertical de B vers C.'); }
      }),
      T({ // Symétries
        base: {kind: 0, x: 3, y: -2},
        params: r => ({kind: r.int(0, 2), x: r.nonZero(1, 9), y: r.nonZero(1, 9)}),
        accept: ({x, y}) => x !== y,
        difficulty: () => score({steps: 2, values: [9], negatives: true}),
        verify: ({kind, x, y}, v) => v[0] === [-x, x, -x][kind] && v[1] === [-y, -y, y][kind],
        build: ({kind, x, y}) => { const name = ['la symétrie de centre O (origine du repère)', 'la symétrie d’axe des abscisses', 'la symétrie d’axe des ordonnées'][kind];
          const img = [[-x, -y], [x, -y], [-x, y]][kind];
          return item('Calculer l’image par une symétrie', `Dans un repère orthonormé d’origine O, P(${fr(x)} ; ${fr(y)}). On note P′ l’image de P par ${name}.`,
            [Q('Abscisse de P′', img[0]), Q('Ordonnée de P′', img[1])],
            C(['la symétrie de centre O change les deux coordonnées en leurs opposées.', 'la symétrie d’axe des abscisses garde l’abscisse et change l’ordonnée en son opposée.', 'la symétrie d’axe des ordonnées change l’abscisse en son opposée et garde l’ordonnée.'][kind],
              [`P′(${fr(img[0])} ; ${fr(img[1])}).`],
              `l’image de P est P′(${fr(img[0])} ; ${fr(img[1])}).`),
            'Fais un petit schéma : l’axe ou le centre est à mi-chemin entre P et P′.'); }
      }),
      T({ // Rotation d'un polygone régulier
        base: {n: 6, k: 10},
        params: r => ({n: r.pick([3, 4, 5, 6, 8, 9, 10, 12]), k: r.int(2, 30)}),
        accept: ({n, k}) => k % n !== 0 && k > n,
        difficulty: ({n, k}) => score({steps: 2, values: [360 / n, k]}),
        verify: ({n, k}, v) => close(v[0], 360 / n) && v[1] === k % n,
        build: ({n, k}) => item('Utiliser une rotation', `Un polygone régulier à ${n} côtés a pour centre O et pour sommets S₀, S₁, …, S${String(n - 1).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d])}, dans le sens inverse des aiguilles d’une montre. La rotation r de centre O transforme S₀ en S₁. On applique ${k} fois la rotation r à S₀ et on obtient Sₘ.`,
          [Q('Angle de la rotation r, en degrés', 360 / n), Q('Numéro m du sommet obtenu', k % n)],
          C('les sommets d’un polygone régulier sont régulièrement répartis autour du centre : l’angle entre deux sommets voisins vaut 360° ÷ nombre de sommets.',
            [`Angle : 360 ÷ ${n} = ${fr(360 / n)}°.`, `${k} rotations font avancer de ${k} sommets ; après ${n} rotations on revient à S₀ : ${k} = ${n} × ${Math.floor(k / n)} + ${k % n}.`],
            `l’angle vaut ${fr(360 / n)}° et on obtient le sommet S${String(k % n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d])} : m = ${k % n}.`),
          'Le reste de la division de ' + k + ' par ' + n + ' donne le sommet atteint.')
      }),
      T({ // Retrouver le rapport d'homothétie
        base: {a: 4, b: 6, same: 1, L: 3},
        params: r => ({a: r.int(2, 10), b: r.int(2, 15), same: r.int(0, 1), L: r.int(2, 9)}),
        accept: ({a, b}) => a !== b && (2 * b) % a === 0,
        difficulty: ({a, b, L}) => score({steps: 2, values: [b / a, b / a * L], decimals: (b % a) !== 0, negatives: false}),
        verify: ({a, b, same, L}, v) => close(v[0], (same ? 1 : -1) * b / a) && close(v[1], b / a * L),
        build: ({a, b, same, L}) => { const k = (same ? 1 : -1) * b / a;
          return item('Retrouver le rapport d’une homothétie', `Une homothétie de centre O transforme M en M′, avec OM = ${a} cm et OM′ = ${b} cm. M′ est ${same ? 'sur la demi-droite [OM)' : 'de l’autre côté de O par rapport à M'}. Elle transforme un segment de ${L} cm en un segment image.`,
            [Q('Rapport de l’homothétie', k), Q('Longueur du segment image, en cm', b / a * L)],
            C('le rapport k vérifie |k| = OM′ ÷ OM ; il est positif si M′ est du même côté que M, négatif sinon.',
              [`|k| = ${b} ÷ ${a} = ${fr(b / a)} ; ${same ? 'même côté : k > 0' : 'côté opposé : k < 0'}.`, `Segment image : ${fr(b / a)} × ${L} = ${fr(b / a * L)} cm.`],
              `k = ${fr(k)} et le segment image mesure ${fr(b / a * L)} cm. ${b > a ? 'C’est un agrandissement.' : 'C’est une réduction.'}`),
            'Les longueurs sont multipliées par la valeur sans signe du rapport.'); }
      })
    ],

    /* ---------- 16 · Algorithmique et programmation ---------- */
  };

  const basics = {
    '3-transformations': ['Une transformation conserve ou multiplie les longueurs selon sa nature.', 'Une homothétie de rapport 3 transforme 2 cm en ?', '6', 'Multiplie par 3.'],
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
    '3-transformations': [
      ({k, a, L}) => { const B = [a + L * Math.cos(1.2), L * Math.sin(1.2)];
        const base = titre => FG.figure(titre, {hauteur: 220}).point('O', 0, 0, {marque: true}).point('A', a, 0).point('B', B[0], B[1]).segment('O', 'A').segment('A', 'B');
        return {e: base(`Une figure possible : OA = ${a} cm et AB = ${L} cm`).cote('O', 'A', a + ' cm').cote('A', 'B', L + ' cm').description(),
          c: base(`Homothétie de centre O et de rapport ${fr(k)} : A′ et B′ sont ${k > 0 ? 'du même côté que A et B' : 'de l’autre côté de O'}`)
            .point('A′', k * a, 0).point('B′', k * B[0], k * B[1]).segment('O', 'A′', {pointilles: true, fin: true}).segment(k > 0 ? 'B' : 'O', 'B′', {pointilles: true, fin: true})
            .segment('O', 'B', {pointilles: true, fin: true}).segment('A′', 'B′').description()}; },
      ({k}) => ({e: FG.espace(`Schéma : pyramide coupée parallèlement à sa base, la petite pyramide est une réduction de rapport ${fr(k)}`, {hauteur: 240}).section_pyramide(6, 8, k, {hauteur: false}).description()}),
      (p, ex) => { const pts = pointsDe(ex.statement), image = [pts.A[0] + pts.C[0] - pts.B[0], pts.A[1] + pts.C[1] - pts.B[1]];
        const base = titre => placer(repereDe(titre, [pts.A, pts.B, pts.C, image]).vecteur(pts.B[0], pts.B[1], pts.C[0], pts.C[1]), pts, ['A', 'B', 'C']);
        return {e: base(`Points ${liste(pts)} et vecteur de la translation, de B vers C`).description(),
          c: base(`Le même déplacement que de B vers C, appliqué à partir de A, donne A′`).vecteur(pts.A[0], pts.A[1], image[0], image[1], null, {pointilles: true}).point(image[0], image[1], 'A′').description()}; },
      ({kind, x, y}) => { const img = [[-x, -y], [x, -y], [-x, y]][kind], nom = ['de centre O', 'd’axe des abscisses', 'd’axe des ordonnées'][kind];
        const m = Math.max(Math.abs(x), Math.abs(y)) / 2, base = titre => repereDe(titre, [[x, y], [-x, -y], [x, -y], [-x, y], [m, m], [-m, -m]]).point(x, y, 'P');
        return {e: base(`Point P(${fr(x)} ; ${fr(y)}) dans un repère orthonormé d’origine O`).description(),
          c: base(`P et son image P′ par la symétrie ${nom}`).segment(x, y, img[0], img[1], {pointilles: true, fin: true}).point(img[0], img[1], 'P′').description()}; },
      ({n, k}) => { const S = i => [2 * Math.cos(2 * Math.PI * i / n), 2 * Math.sin(2 * Math.PI * i / n)], nom = i => 'S' + String(i).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
        const base = titre => { const f = FG.figure(titre, {hauteur: 240}).point('O', 0, 0, {marque: true});
          for (let i = 0; i < n; i++) f.point(nom(i), S(i)[0], S(i)[1]);
          return f.polygone(Array.from({length: n}, (_, i) => nom(i))); };
        return {e: base(`Polygone régulier à ${n} côtés, de centre O`).description(),
          c: base(`La rotation de centre O qui transforme S₀ en S₁ : un ${n === 3 ? 'tiers' : n === 4 ? 'quart' : n + 'ᵉ'} de tour`)
            .segment('O', nom(0), {pointilles: true, fin: true}).segment('O', nom(1), {pointilles: true, fin: true}).angle('O', nom(0), nom(1), {texte: fr(360 / n) + '°'}).description()}; },
      ({a, b, same}) => { const xm = same ? b : -b;
        return {e: FG.figure(`Points O, M et M′ alignés : OM = ${a} cm et OM′ = ${b} cm`, {hauteur: 110, marge: 30}).point('O', 0, 0, {marque: true, pos: 'n'}).point('M', a, 0, {marque: true, pos: 'n'}).point('M′', xm, 0, {marque: true, pos: 'n'})
          .segment([Math.min(0, xm, a), 0], [Math.max(0, xm, a), 0]).cote_fleche('O', 'M', a + ' cm', {pos: 's', decalage: same && a > b ? 36 : 14}).cote_fleche('O', 'M′', b + ' cm', {pos: 's', decalage: same && b > a ? 36 : 14}).description()}; }
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
