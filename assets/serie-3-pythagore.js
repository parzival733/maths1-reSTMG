/* Série 3-pythagore : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-pythagore': [
      T({ // Hypoténuse
        base: {a: 6, b: 8},
        params: r => ({a: r.int(3, 20), b: r.int(3, 20)}),
        accept: ({a, b}) => a < b,
        difficulty: ({a, b}) => score({steps: 3, values: [a * a + b * b], decimals: true}),
        verify: ({a, b}, w) => w[0] === a * a + b * b && close(w[1], Math.sqrt(w[0])),
        build: ({a, b}) => { const s2 = a * a + b * b, c = Math.sqrt(s2);
          return item('Calculer l’hypoténuse', `Le triangle ABC est rectangle en A, avec AB = ${a} cm et AC = ${b} cm.`,
            [Q('BC², en cm²', s2), Q('BC, en cm (au dixième)', c, 1)],
            C('dans un triangle rectangle, le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés (théorème de Pythagore).',
              [`BC² = AB² + AC² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${s2}.`, `BC = √${s2} ${eq(c, 1)} cm.`],
              `BC ${eq(c, 1)} cm.`),
            'L’hypoténuse est le côté opposé à l’angle droit, ici [BC].'); }
      }),
      T({ // Côté de l'angle droit
        base: {a: 5, c: 13},
        params: r => ({a: r.int(3, 20), c: r.int(6, 30)}),
        accept: ({a, c}) => c > a + 1,
        difficulty: ({a, c}) => score({steps: 3, values: [c * c, c * c - a * a], decimals: true}),
        verify: ({a, c}, w) => w[0] === c * c - a * a && close(w[1], Math.sqrt(w[0])),
        build: ({a, c}) => { const s2 = c * c - a * a, b = Math.sqrt(s2);
          return item('Calculer un côté de l’angle droit', `Le triangle EFG est rectangle en E, avec EF = ${a} cm et FG = ${c} cm.`,
            [Q('EG², en cm²', s2), Q('EG, en cm (au dixième)', b, 1)],
            C('on écrit l’égalité de Pythagore avec l’hypoténuse [FG], puis on isole EG².',
              [`FG² = EF² + EG², donc EG² = ${c}² ${M} ${a}² = ${c * c} ${M} ${a * a} = ${s2}.`, `EG = √${s2} ${eq(b, 1)} cm.`],
              `EG ${eq(b, 1)} cm.`),
            'Ici on soustrait : l’hypoténuse est le plus grand côté.'); }
      }),
      T({ // Réciproque
        base: {t: 0, k: 2, on: 1, s: 1},
        params: r => ({t: r.int(0, 5), k: r.int(1, 4), on: r.int(0, 1), s: r.sign()}),
        accept: ({t, k}) => [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t][2] * k <= 60,
        difficulty: () => score({steps: 3, values: [1500]}),
        verify: ({t, k, on, s}, v) => { const [a, b, c0] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t].map(x => x * k), c = on ? c0 : c0 + s; return v[0] === c * c && v[1] === a * a + b * b && (v[2] === 'oui') === (c * c === a * a + b * b); },
        build: ({t, k, on, s}) => { const [a, b, c0] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t].map(x => x * k), c = on ? c0 : c0 + s;
          return item('Utiliser la réciproque de Pythagore', `Un triangle RST a pour côtés RS = ${a} cm, ST = ${b} cm et RT = ${c} cm. Est-il rectangle ?`,
            [Q('Carré du plus grand côté', c * c), Q('Somme des carrés des deux autres côtés', a * a + b * b), S('Le triangle est-il rectangle ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('on compare le carré du plus grand côté à la somme des carrés des deux autres : s’ils sont égaux, le triangle est rectangle (réciproque) ; sinon, il ne l’est pas.',
              [`RT² = ${c}² = ${c * c}.`, `RS² + ST² = ${a * a} + ${b * b} = ${a * a + b * b}.`],
              on ? `RT² = RS² + ST² : RST est rectangle en S.` : `${c * c} ≠ ${a * a + b * b} : RST n’est pas rectangle.`),
            'Repère le plus grand côté : c’est le seul candidat pour l’hypoténuse.'); }
      }),
      T({ // Échelle contre un mur
        base: {L: 50, d: 14},
        params: r => ({L: r.int(25, 60), d: r.int(5, 20)}),
        accept: ({L, d}) => d * 3 < L,
        difficulty: ({L, d}) => score({steps: 3, values: [L * L / 100, Math.sqrt(L * L - d * d) / 10], decimals: true}),
        verify: ({L, d}, w) => close(w[0], Math.sqrt((L / 10) ** 2 - (d / 10) ** 2)),
        build: ({L, d}) => { const l = L / 10, x = d / 10, h = Math.sqrt(l * l - x * x);
          return item('Résoudre un problème avec Pythagore', `Une échelle de ${fr(l)} m est appuyée contre un mur vertical. Son pied est à ${fr(x)} m du mur, sur un sol horizontal.`,
            [Q('Hauteur atteinte, en m (au centième)', h), Q('Carré de la hauteur, en m²', l * l - x * x, 4)],
            C('le mur, le sol et l’échelle forment un triangle rectangle dont l’hypoténuse est l’échelle.',
              [`h² = ${fr(l)}² ${M} ${fr(x)}² = ${fr(l * l)} ${M} ${fr(x * x)} = ${fr(r2(l * l - x * x, 4))}.`, `h = √${fr(r2(l * l - x * x, 4))} ${eq(h)} m.`],
              `l’échelle atteint ${about(h)} m de hauteur.`),
            'L’échelle est le plus grand côté : c’est l’hypoténuse.'); }
      }),
      T({ // Diagonale d'écran
        base: {w: 48, h: 27},
        params: r => ({w: r.int(20, 80), h: r.int(12, 50)}),
        accept: ({w, h}) => w > h * 1.2,
        difficulty: ({w, h}) => score({steps: 3, values: [w * w + h * h, Math.sqrt(w * w + h * h)], decimals: true}),
        verify: ({w, h}, v) => close(v[0], Math.sqrt(w * w + h * h)) && close(v[1], Math.sqrt(w * w + h * h) / 2.54),
        build: ({w, h}) => { const d = Math.sqrt(w * w + h * h);
          return item('Calculer la diagonale d’un écran', `Un écran rectangulaire mesure ${w} cm de large et ${h} cm de haut. Un pouce mesure 2,54 cm.`,
            [Q('Diagonale, en cm (au dixième)', d, 1), Q('Diagonale, en pouces (à l’unité)', d / 2.54, 0)],
            C('la diagonale partage le rectangle en deux triangles rectangles ; on applique le théorème de Pythagore.',
              [`d² = ${w}² + ${h}² = ${w * w + h * h} ; d ${eq(d, 1)} cm.`, `En pouces : d ÷ 2,54 ${eq(d / 2.54, 0)}.`],
              `la diagonale mesure ${about(d, 1)} cm, soit ${about(d / 2.54, 0)} pouces.`),
            'Garde la valeur non arrondie de d pour la conversion.'); }
      }),
      T({ // Distance dans un repère
        base: {x1: 1, y1: 2, x2: 4, y2: 6},
        params: r => ({x1: r.int(-6, 6), y1: r.int(-6, 6), x2: r.int(-6, 6), y2: r.int(-6, 6)}),
        accept: ({x1, y1, x2, y2}) => x1 !== x2 && y1 !== y2,
        difficulty: ({x1, y1, x2, y2}) => score({steps: 3, values: [(x2 - x1) ** 2 + (y2 - y1) ** 2], negatives: true, decimals: true}),
        verify: ({x1, y1, x2, y2}, v) => v[0] === (x2 - x1) ** 2 + (y2 - y1) ** 2 && close(v[1], Math.sqrt(v[0])),
        build: ({x1, y1, x2, y2}) => { const dx = x2 - x1, dy = y2 - y1, s2 = dx * dx + dy * dy;
          return item('Calculer une distance dans un repère', `Dans un repère orthonormé (unité 1 cm), A(${fr(x1)} ; ${fr(y1)}) et B(${fr(x2)} ; ${fr(y2)}).`,
            [Q('AB², en cm²', s2), Q('AB, en cm (au dixième)', Math.sqrt(s2), 1)],
            C('on trace le triangle rectangle de côtés horizontal et vertical : leurs longueurs sont les écarts des abscisses et des ordonnées.',
              [`Écart horizontal : |${fmt.diff(x2, x1)}| = ${Math.abs(dx)} ; écart vertical : |${fmt.diff(y2, y1)}| = ${Math.abs(dy)}.`, `AB² = ${Math.abs(dx)}² + ${Math.abs(dy)}² = ${s2} ; AB ${eq(Math.sqrt(s2), 1)} cm.`],
              `AB ${eq(Math.sqrt(s2), 1)} cm.`),
            'Un écart est une longueur : il est toujours positif.'); }
      })
    ],

    /* ---------- 13 · Théorème de Thalès ---------- */
  };

  const basics = {
    '3-pythagore': ['Le théorème de Pythagore ne s’applique qu’à un triangle rectangle.', 'Combien vaut 3² + 4² ?', '25', '9 + 16.'],
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
    '3-pythagore': [
      ({a, b}) => ({e: rectangle(`Triangle ABC rectangle en A : AB = ${a} cm, AC = ${b} cm`, ['C', 'B'], 'A', b, a, [['A', 'B', a + ' cm'], ['A', 'C', b + ' cm'], ['B', 'C', '?']])}),
      ({a, c}) => ({e: rectangle(`Triangle EFG rectangle en E : EF = ${a} cm, FG = ${c} cm`, ['G', 'F'], 'E', Math.sqrt(c * c - a * a), a, [['E', 'F', a + ' cm'], ['F', 'G', c + ' cm'], ['E', 'G', '?']])}),
      ({t, k, on, s}) => { const [a, b, c0] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t].map(x => x * k), c = on ? c0 : c0 + s, R = tri(a, b, c);
        if (!R || !lisible([[0, 0], [b, 0], R])) return {};
        return {e: FG.figure(`Triangle RST : RS = ${a} cm, ST = ${b} cm, RT = ${c} cm`, {hauteur: 210}).point('S', 0, 0).point('T', b, 0).point('R', R[0], R[1])
          .polygone(['R', 'S', 'T']).cote('R', 'S', a + ' cm').cote('S', 'T', b + ' cm').cote('R', 'T', c + ' cm').description()}; },
      ({L, d}) => { const l = L / 10, x = d / 10, h = Math.sqrt(l * l - x * x);
        return {e: FG.figure(`Échelle de ${fr(l)} m, pied à ${fr(x)} m du mur`, {hauteur: 230}).sol(-0.25 * l, x + 0.3 * l, 0).mur(0, 0, h * 1.08, {cote: 'g'})
          .point('P', x, 0, {muet: true}).point('S', 0, h, {muet: true}).point('O', 0, 0, {muet: true}).echelle('P', 'S').angle_droit('O', 'P', 'S')
          .cote_fleche('O', 'P', fr(x) + ' m', {pos: 's', decalage: 14}).cote('P', 'S', fr(l) + ' m', {pos: 'ne'}).cote_fleche('O', 'S', '?', {pos: 'o', decalage: 16}).description()}; },
      ({w, h}) => ({e: FG.figure(`Écran de ${w} cm de large et de ${h} cm de haut, avec sa diagonale`).polygone([[0, 0], [w, 0], [w, h], [0, h]])
        .segment([0, 0], [w, h], {pointilles: true}).angle_droit([w, 0], [0, 0], [w, h]).cote([0, 0], [w, 0], w + ' cm', {pos: 's'}).cote([w, 0], [w, h], h + ' cm', {pos: 'e'}).cote([0, 0], [w, h], '?', {pos: 'no'}).description()}),
      ({x1, y1, x2, y2}) => { const base = (titre) => FG.repere(titre, {xmin: -7, xmax: 7, ymin: -7, ymax: 7, pas_x: 1, pas_y: 1, orthonorme: true, hauteur: 300})
          .segment(x1, y1, x2, y2, {epais: true}).point(x1, y1, 'A').point(x2, y2, 'B');
        return {e: base(`Points A(${fr(x1)} ; ${fr(y1)}) et B(${fr(x2)} ; ${fr(y2)}) dans un repère orthonormé`).description(),
          c: base(`Triangle rectangle d’hypoténuse [AB] : écarts ${Math.abs(x2 - x1)} et ${Math.abs(y2 - y1)}`).segment(x1, y1, x2, y1, {pointilles: true}).segment(x2, y1, x2, y2, {pointilles: true})
            .texte((x1 + x2) / 2, y1, String(Math.abs(x2 - x1)), {pos: y2 > y1 ? 's' : 'n'}).texte(x2, (y1 + y2) / 2, String(Math.abs(y2 - y1)), {pos: x2 > x1 ? 'e' : 'o'}).description()}; }
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
