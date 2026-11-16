/* Série 3-trigonometrie : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-trigonometrie': [
      T({ // Cosinus : côté adjacent
        base: {h: 12, a: 35},
        params: r => ({h: r.int(5, 30), a: r.int(15, 75)}),
        difficulty: ({h, a}) => score({steps: 3, values: [h * Math.cos(a * deg)], decimals: true}),
        verify: ({h, a}, v) => close(v[0], h * Math.cos(a * deg)),
        build: ({h, a}) => { const x = h * Math.cos(a * deg);
          return item('Calculer une longueur avec le cosinus', `ABC est rectangle en B, avec AC = ${h} cm et l’angle BAC = ${a}°.`,
            [Q('AB, en cm (au dixième)', x, 1), Q('cos(BAC), au centième', Math.cos(a * deg))],
            C('dans un triangle rectangle, cos(angle) = côté adjacent ÷ hypoténuse.',
              [`cos(${a}°) = AB/AC, donc AB = ${h} × cos(${a}°).`, `AB ${eq(x, 1)} cm.`],
              `AB ${eq(x, 1)} cm.`),
            'Repère l’hypoténuse, puis le côté adjacent à l’angle connu.'); }
      }),
      T({ // Sinus : côté opposé
        base: {h: 10, a: 40},
        params: r => ({h: r.int(5, 30), a: r.int(15, 75)}),
        difficulty: ({h, a}) => score({steps: 3, values: [h * Math.sin(a * deg)], decimals: true}),
        verify: ({h, a}, v) => close(v[0], h * Math.sin(a * deg)),
        build: ({h, a}) => { const x = h * Math.sin(a * deg);
          return item('Calculer une longueur avec le sinus', `DEF est rectangle en E, avec DF = ${h} cm et l’angle EDF = ${a}°.`,
            [Q('EF, en cm (au dixième)', x, 1), Q('sin(EDF), au centième', Math.sin(a * deg))],
            C('dans un triangle rectangle, sin(angle) = côté opposé ÷ hypoténuse.',
              [`sin(${a}°) = EF/DF, donc EF = ${h} × sin(${a}°).`, `EF ${eq(x, 1)} cm.`],
              `EF ${eq(x, 1)} cm.`),
            'Le côté opposé à l’angle D est celui qui ne touche pas D.'); }
      }),
      T({ // Tangente
        base: {d: 8, a: 50},
        params: r => ({d: r.int(3, 25), a: r.int(15, 70)}),
        difficulty: ({d, a}) => score({steps: 3, values: [d * Math.tan(a * deg)], decimals: true}),
        verify: ({d, a}, v) => close(v[0], d * Math.tan(a * deg)),
        build: ({d, a}) => { const x = d * Math.tan(a * deg);
          return item('Calculer une longueur avec la tangente', `RST est rectangle en S, avec RS = ${d} cm et l’angle SRT = ${a}°.`,
            [Q('ST, en cm (au dixième)', x, 1), Q('tan(SRT), au centième', Math.tan(a * deg))],
            C('dans un triangle rectangle, tan(angle) = côté opposé ÷ côté adjacent.',
              [`tan(${a}°) = ST/RS, donc ST = ${d} × tan(${a}°).`, `ST ${eq(x, 1)} cm.`],
              `ST ${eq(x, 1)} cm.`),
            'La tangente n’utilise pas l’hypoténuse.'); }
      }),
      T({ // Angle par le cosinus
        base: {adj: 7, hyp: 10},
        params: r => ({adj: r.int(2, 20), hyp: r.int(4, 25)}),
        accept: ({adj, hyp}) => adj < hyp && adj / hyp < 0.95 && adj / hyp > 0.1,
        difficulty: ({adj, hyp}) => score({steps: 3, values: [Math.acos(adj / hyp) / deg], decimals: true}),
        verify: ({adj, hyp}, v) => close(v[0], adj / hyp) && close(v[1], Math.acos(adj / hyp) / deg),
        build: ({adj, hyp}) => { const ang = Math.acos(adj / hyp) / deg;
          return item('Calculer un angle', `KLM est rectangle en L, avec KL = ${adj} cm et KM = ${hyp} cm.`,
            [Q('cos(LKM), au centième', adj / hyp), Q('Angle LKM, en degrés (à l’unité)', ang, 0)],
            C('on calcule le cosinus de l’angle, puis on utilise la touche arccos (ou cos⁻¹) de la calculatrice.',
              [`cos(LKM) = KL/KM = ${adj}/${hyp} ${eq(adj / hyp)}.`, `LKM = arccos(${adj}/${hyp}) ${eq(ang, 0)}°.`],
              `l’angle LKM mesure ${about(ang, 0)}°.`),
            'Vérifie que la calculatrice est réglée en degrés.'); }
      }),
      T({ // Pente d'une rampe
        base: {h: 12, d: 150},
        params: r => ({h: r.int(5, 40), d: 10 * r.int(6, 40)}),
        accept: ({h, d}) => h / d < 0.25,
        difficulty: ({h, d}) => score({steps: 3, values: [100 * h / d, Math.atan(h / d) / deg], decimals: true}),
        verify: ({h, d}, v) => close(v[0], 100 * h / d) && close(v[1], Math.atan(h / d) / deg),
        build: ({h, d}) => { const ang = Math.atan(h / d) / deg;
          return item('Étudier la pente d’une rampe', `Une rampe s’élève de ${h} cm sur une distance horizontale de ${d} cm.`,
            [Q('Pente, en %', 100 * h / d, 1), Q('Angle avec l’horizontale, en degrés (au dixième)', ang, 1)],
            C('la pente en % est le dénivelé pour 100 de distance horizontale ; l’angle se calcule avec la tangente.',
              [`Pente : ${h} ÷ ${d} × 100 ${eq(100 * h / d, 1)} %.`, `tan(α) = ${h}/${d}, donc α ${eq(ang, 1)}°.`],
              `la pente est d’${about(100 * h / d, 1)} % et l’angle d’${about(ang, 1)}°.`),
            'Une pente en % n’est pas un angle en degrés.'); }
      }),
      T({ // Hauteur d'un bâtiment
        base: {d: 30, a: 40, e: 16},
        params: r => ({d: r.int(10, 60), a: r.int(20, 60), e: r.int(14, 18)}),
        difficulty: ({d, a}) => score({steps: 3, values: [d * Math.tan(a * deg)], decimals: true}),
        verify: ({d, a, e}, v) => close(v[0], d * Math.tan(a * deg)) && close(v[1], v[0] + e / 10),
        build: ({d, a, e}) => { const x = d * Math.tan(a * deg), eye = e / 10;
          return item('Mesurer une hauteur inaccessible', `Debout à ${d} m d’un immeuble, une personne dont les yeux sont à ${fr(eye)} m du sol voit le haut de l’immeuble sous un angle de ${a}° au-dessus de l’horizontale.`,
            [Q('Hauteur au-dessus des yeux, en m (au dixième)', x, 1), Q('Hauteur de l’immeuble, en m (au dixième)', x + eye, 1)],
            C('le regard horizontal, la façade et la ligne de visée forment un triangle rectangle ; on utilise la tangente, puis on ajoute la hauteur des yeux.',
              [`tan(${a}°) = h/${d}, donc h = ${d} × tan(${a}°) ${eq(x, 1)} m.`, `Hauteur totale : ${fr(r2(x, 3))} + ${fr(eye)} ${eq(x + eye, 1)} m.`],
              `l’immeuble mesure ${about(x + eye, 1)} m.`),
            'N’oublie pas la hauteur des yeux au-dessus du sol.'); }
      })
    ],

    /* ---------- 15 · Transformations ---------- */
  };

  const basics = {
    '3-trigonometrie': ['Cosinus, sinus et tangente se calculent dans un triangle rectangle.', 'Dans un triangle rectangle, combien vaut la somme des deux angles aigus ?', '90', 'La somme des trois angles vaut 180°.'],
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
    '3-trigonometrie': [
      ({h, a}) => ({e: rectangle(`Triangle ABC rectangle en B : AC = ${h} cm, angle BAC de ${a}°`, ['A', 'C'], 'B', h * Math.cos(a * deg), h * Math.sin(a * deg), [['A', 'C', h + ' cm'], ['A', 'B', '?']], f => f.angle('A', 'B', 'C', {texte: a + '°', rayon: 26}))}),
      ({h, a}) => ({e: rectangle(`Triangle DEF rectangle en E : DF = ${h} cm, angle EDF de ${a}°`, ['D', 'F'], 'E', h * Math.cos(a * deg), h * Math.sin(a * deg), [['D', 'F', h + ' cm'], ['E', 'F', '?']], f => f.angle('D', 'E', 'F', {texte: a + '°', rayon: 26}))}),
      ({d, a}) => ({e: rectangle(`Triangle RST rectangle en S : RS = ${d} cm, angle SRT de ${a}°`, ['R', 'T'], 'S', d, d * Math.tan(a * deg), [['R', 'S', d + ' cm'], ['S', 'T', '?']], f => f.angle('R', 'S', 'T', {texte: a + '°', rayon: 26}))}),
      ({adj, hyp}) => ({e: rectangle(`Triangle KLM rectangle en L : KL = ${adj} cm, KM = ${hyp} cm`, ['K', 'M'], 'L', adj, Math.sqrt(hyp * hyp - adj * adj), [['K', 'L', adj + ' cm'], ['K', 'M', hyp + ' cm']], f => f.angle('K', 'L', 'M', {texte: '?', rayon: 26}))}),
      ({h, d}) => ({e: FG.figure(`Rampe : ${h} cm de dénivelé pour ${d} cm à l’horizontale`, {hauteur: 120, marge: 30}).rampe([[0, 0], [d, 0], [d, h]]).angle_droit([d, 0], [0, 0], [d, h], {taille: 6})
        .cote([0, 0], [d, 0], d + ' cm', {pos: 's'}).cote([d, 0], [d, h], h + ' cm', {pos: 'e'}).description()}),
      ({d, a, e}) => { const eye = e / 10, H = d * Math.tan(a * deg) + eye, l = Math.max(4, 0.18 * d);
        return {e: FG.figure(`Immeuble vu à ${d} m sous un angle de ${a}°, les yeux à ${fr(eye)} m du sol`, {hauteur: 240})
          .sol(-0.1 * d, d + l * 1.2, 0).immeuble(d, 0, l, H).observateur(0, 0, eye)
          .segment([0, eye], [d, eye], {pointilles: true, fin: true}).segment([0, eye], [d, H], {pointilles: true, fin: true}).angle([0, eye], [d, eye], [d, H], {texte: a + '°', rayon: 34})
          .cote_fleche([0, 0], [d, 0], d + ' m', {pos: 's', decalage: 14}).cote_fleche([d + l, 0], [d + l, H], '?', {pos: 'e', decalage: 10}).description()}; }
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
