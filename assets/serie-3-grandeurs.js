/* Série 3-grandeurs : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-grandeurs': [
      T({ // Vitesse moyenne
        base: {v: 72, t: 25, D: 40},
        params: r => ({v: 6 * r.int(5, 20), t: 5 * r.int(2, 18), D: r.int(10, 120)}),
        accept: ({v, t, D}) => (v * t) % 60 === 0 && D !== v * t / 60,
        difficulty: ({v, t, D}) => score({steps: 3, values: [v, v * t / 60, 60 * D / v], decimals: true}),
        verify: ({v, t, D}, w) => close(w[0], v) && close(w[1], 60 * D / v),
        build: ({v, t, D}) => { const d = v * t / 60; return item('Calculer une vitesse moyenne', `Un car parcourt ${fr(d)} km en ${t} min, à vitesse constante.`,
          [Q('Vitesse, en km/h', v), Q(`Durée pour parcourir ${D} km, en min`, 60 * D / v, 1)],
          C('vitesse = distance ÷ durée ; on convertit la durée en heures pour obtenir des km/h.',
            [`${t} min = ${t}/60 h, donc v = ${fr(d)} ÷ (${t}/60) = ${fr(d)} × 60 ÷ ${t} = ${v} km/h.`, `Durée : ${D} ÷ ${v} h = ${D} × 60 ÷ ${v} ${eq(60 * D / v, 1)} min.`],
            `le car roule à ${v} km/h et parcourt ${D} km en ${about(60 * D / v, 1)} min.`),
          'Une heure compte 60 minutes : ne divise pas par 100.'); }
      }),
      T({ // Conversion km/h → m/s
        base: {v: 90},
        params: r => ({v: r.int(20, 130)}),
        difficulty: ({v}) => score({steps: 2, values: [v, v / 3.6], decimals: true}),
        verify: ({v}, w) => close(w[0], v / 3.6) && close(w[1], v / 3.6 * 10),
        build: ({v}) => item('Convertir une vitesse', `Une voiture roule à ${v} km/h.`,
          [Q('Vitesse, en m/s', v / 3.6), Q('Distance parcourue en 10 s, en m', v / 3.6 * 10, 1)],
          C('1 km = 1 000 m et 1 h = 3 600 s : v km/h = v × 1 000 ÷ 3 600 m/s = v ÷ 3,6 m/s.',
            [`${v} ÷ 3,6 ${eq(v / 3.6)} m/s.`, `En 10 s : ${v} ÷ 3,6 × 10 ${eq(v / 3.6 * 10, 1)} m.`],
            `la voiture roule à ${about(v / 3.6)} m/s et parcourt ${about(v / 3.6 * 10, 1)} m en 10 s.`),
          'Divise par 3,6 pour passer des km/h aux m/s.')
      }),
      T({ // Pavé droit et contenance
        base: {L: 40, l: 25, h: 30},
        params: r => ({L: 5 * r.int(4, 16), l: 5 * r.int(2, 10), h: 5 * r.int(2, 12)}),
        accept: ({L, l, h}) => L > l && L * l * h <= 100000,
        difficulty: ({L, l, h}) => score({steps: 2, values: [L * l * h / 1000], decimals: true}),
        verify: ({L, l, h}, w) => w[0] === L * l * h && close(w[1], w[0] / 1000),
        build: ({L, l, h}) => { const Vc = L * l * h; return item('Calculer un volume et une contenance', `Un aquarium a la forme d’un pavé droit de ${L} cm sur ${l} cm, et de ${h} cm de hauteur.`,
          [Q('Volume, en cm³', Vc), Q('Contenance, en L', Vc / 1000, 3)],
          C('volume d’un pavé droit = longueur × largeur × hauteur ; 1 L = 1 dm³ = 1 000 cm³.',
            [`V = ${L} × ${l} × ${h} = ${fr(Vc)} cm³.`, `${fr(Vc)} cm³ = ${fr(Vc / 1000)} L.`],
            `l’aquarium a un volume de ${fr(Vc)} cm³, soit une contenance de ${fr(Vc / 1000)} L.`),
          'Divise les cm³ par 1 000 pour obtenir des litres.'); }
      }),
      T({ // Cylindre
        base: {r: 4, h: 10},
        params: r => ({r: r.int(2, 12), h: r.int(5, 30)}),
        difficulty: ({r, h}) => score({steps: 3, values: [Math.PI * r * r * h], decimals: true}),
        verify: ({r, h}, w) => close(w[0], Math.PI * r * r * h) && close(w[1], Math.PI * r * r * h / 1000),
        build: ({r, h}) => { const Vc = Math.PI * r * r * h; return item('Calculer le volume d’un cylindre', `Une boîte cylindrique a un rayon de ${r} cm et une hauteur de ${h} cm.`,
          [Q('Volume, en cm³ (au cm³ près)', Vc, 0), Q('Contenance, en L (au centième)', Vc / 1000)],
          C('volume d’un cylindre = aire de la base × hauteur = π × r² × h.',
            [`V = π × ${r}² × ${h} = ${r * r * h}π ${eq(Vc, 0)} cm³.`, `En litres : ${eq(Vc / 1000)} L.`],
            `la boîte a un volume d’${about(Vc, 0)} cm³, soit ${about(Vc / 1000)} L.`),
          'Garde la valeur exacte (avec π) jusqu’au dernier arrondi.'); }
      }),
      T({ // Pyramide
        base: {c: 6, h: 10},
        params: r => ({c: r.int(3, 15), h: r.int(4, 24)}),
        accept: ({c, h}) => c !== h,
        difficulty: ({c, h}) => score({steps: 3, values: [c * c, c * c * h / 3], decimals: (c * c * h) % 3 !== 0}),
        verify: ({c, h}, w) => w[0] === c * c && close(w[1], c * c * h / 3),
        build: ({c, h}) => item('Calculer le volume d’une pyramide', `Une pyramide a pour base un carré de ${c} cm de côté et une hauteur de ${h} cm.`,
          [Q('Aire de la base, en cm²', c * c), Q('Volume, en cm³', c * c * h / 3)],
          C('volume d’une pyramide (ou d’un cône) = aire de la base × hauteur ÷ 3.',
            [`Aire de la base : ${c} × ${c} = ${c * c} cm².`, `V = ${c * c} × ${h} ÷ 3 ${eq(c * c * h / 3)} cm³.`],
            `la base mesure ${c * c} cm² et le volume vaut ${(c * c * h) % 3 ? 'environ ' + fr(r2(c * c * h / 3)) : fr(c * c * h / 3)} cm³.`),
          'N’oublie pas de diviser par 3.')
      }),
      T({ // Boule dans un cube
        space: 27,
        base: {h: 10},
        params: r => ({h: r.int(4, 30)}),
        difficulty: ({h}) => score({steps: 3, values: [h / 2], decimals: true}),
        verify: ({h}, w) => close(w[0], 4 / 3 * Math.PI * (h / 2) ** 3) && close(w[1], h ** 3 - 4 / 3 * Math.PI * (h / 2) ** 3),
        build: ({h}) => { const r = h / 2, B = 4 / 3 * Math.PI * r ** 3, K = h ** 3;
          return item('Calculer le volume d’une boule', `Une boule de rayon ${fr(r)} cm est placée dans une boîte cubique de ${h} cm d’arête, qu’elle touche sur chaque face.`,
            [Q('Volume de la boule, en cm³', B, 1), Q('Volume laissé vide dans la boîte, en cm³', K - B, 1)],
            C('volume d’une boule = 4/3 × π × r³ ; volume d’un cube = arête³.',
              [`Boule : 4/3 × π × ${fr(r)}³ ${eq(B, 1)} cm³.`, `Cube : ${h}³ = ${fr(K)} cm³ ; vide : ${fr(K)} ${M} ${fr(r2(B, 1))} ${eq(K - B, 1)} cm³.`],
              `la boule occupe ${about(B, 1)} cm³ et il reste ${about(K - B, 1)} cm³ de vide.`),
            'L’arête du cube vaut le diamètre de la boule, soit 2r.'); }
      })
    ],

    /* ---------- 12 · Théorème de Pythagore ---------- */
  };

  const basics = {
    '3-grandeurs': ['Vérifie les unités avant de calculer, et convertis si nécessaire.', 'Combien de minutes dans 1,5 h ?', '90', '0,5 h = 30 min.'],
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
    '3-grandeurs': [null, null,
      ({L, l, h}) => ({e: FG.espace(`Pavé droit de ${L} cm sur ${l} cm, de hauteur ${h} cm`, {hauteur: 210}).pave(L, l, h, {cotes: [L + ' cm', l + ' cm', h + ' cm']}).description()}),
      ({r, h}) => ({e: FG.espace(`Cylindre de rayon ${r} cm et de hauteur ${h} cm`, {hauteur: 210}).cylindre(r, h, {cotes: [r + ' cm', h + ' cm']}).description()}),
      ({c, h}) => ({e: FG.espace(`Pyramide à base carrée de ${c} cm de côté et de hauteur ${h} cm`, {hauteur: 230}).pyramide_carree(c, h, {cotes: [c + ' cm', h + ' cm']}).description()}),
      ({h}) => ({e: FG.espace(`Boule de rayon ${fr(h / 2)} cm dans un cube d’arête ${h} cm`, {hauteur: 220}).cube(h, {cotes: [h + ' cm']}).boule(h / 2, {centre: [h / 2, h / 2, h / 2], cotes: [fr(h / 2) + ' cm']}).description()})
    ]
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
