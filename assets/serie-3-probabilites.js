/* Série 3-probabilites : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-probabilites': [
      T({ // Urne
        base: {r: 5, b: 3, v: 2},
        params: r => ({r: r.int(1, 12), b: r.int(1, 12), v: r.int(1, 12)}),
        accept: ({r, b, v}) => r + b + v <= 30 && r !== b,
        difficulty: ({r, b, v}) => score({steps: 2, values: [r + b + v], fractions: true}),
        verify: ({r, b, v}, w) => sameFrac(w[0], r, r + b + v) && sameFrac(w[1], r + v, r + b + v),
        build: ({r, b, v}) => { const t = r + b + v; return item('Calculer une probabilité simple', `Une urne contient ${r} boules rouges, ${b} bleues et ${v} vertes, indiscernables au toucher. On tire une boule au hasard.`,
          [Q('Probabilité de tirer une rouge', r / t), Q('Probabilité de ne pas tirer une bleue', (r + v) / t)],
          C('les issues sont équiprobables : probabilité = nombre d’issues favorables ÷ nombre total d’issues.',
            [`Il y a ${t} boules. P(rouge) = ${r}/${t}${gcd(r, t) > 1 ? ' = ' + frac(r, t) : ''}.`, `P(pas bleue) = 1 ${M} ${b}/${t} = ${frac(r + v, t)}.`],
            `P(rouge) = ${frac(r, t)} et P(pas bleue) = ${frac(r + v, t)}.`),
          'Utilise l’événement contraire : ne pas tirer une bleue.'); }
      }),
      T({ // Dé à n faces
        base: {n: 6, k: 3, m: 4},
        params: r => ({n: r.pick([6, 8, 10, 12, 20]), k: r.int(2, 5), m: r.int(2, 15)}),
        accept: ({n, k, m}) => m < n && k < n,
        difficulty: ({n}) => score({steps: 2, values: [n], fractions: true}),
        verify: ({n, k, m}, w) => { let a = 0, b = 0; for (let f = 1; f <= n; f++) { if (f % k === 0) a++; if (f > m) b++; } return sameFrac(w[0], a, n) && sameFrac(w[1], b, n); },
        build: ({n, k, m}) => { const mult = Math.floor(n / k), above = n - m, list = Array.from({length: mult}, (_, i) => k * (i + 1));
          return item('Utiliser un dé équilibré', `On lance un dé équilibré à ${n} faces numérotées de 1 à ${n}.`,
            [Q(`P(obtenir un multiple de ${k})`, mult / n), Q(`P(obtenir un nombre supérieur à ${m})`, above / n)],
            C('chaque face a la même probabilité 1/' + n + ' ; on compte les faces favorables.',
              [`Multiples de ${k} : ${list.join(', ')}, soit ${mult} faces : ${mult}/${n}${gcd(mult, n) > 1 ? ' = ' + frac(mult, n) : ''}.`, `Nombres de ${m + 1} à ${n} : ${above} faces : ${above}/${n}${gcd(above, n) > 1 ? ' = ' + frac(above, n) : ''}.`],
              `P(multiple de ${k}) = ${frac(mult, n)} et P(supérieur à ${m}) = ${frac(above, n)}.`),
            '« Supérieur à ' + m + ' » signifie strictement plus grand : ' + m + ' n’est pas compté.'); }
      }),
      T({ // Deux tirages avec remise
        base: {r: 3, b: 2},
        params: r => ({r: r.int(1, 9), b: r.int(1, 9)}),
        accept: ({r, b}) => r !== b,
        difficulty: ({r, b}) => score({steps: 3, values: [(r + b) ** 2], fractions: true}),
        verify: ({r, b}, w) => sameFrac(w[0], r * r, (r + b) ** 2) && sameFrac(w[1], (r + b) ** 2 - b * b, (r + b) ** 2),
        build: ({r, b}) => { const t = r + b; return item('Enchaîner deux tirages avec remise', `Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire un jeton, on le remet, puis on en tire un second.`,
          [Q('P(deux jetons rouges)', r * r / (t * t)), Q('P(au moins un jeton rouge)', 1 - b * b / (t * t))],
          C('avec remise, les deux tirages se font dans les mêmes conditions ; sur un arbre, on multiplie les probabilités le long d’un chemin.',
            [`P(R puis R) = ${r}/${t} × ${r}/${t} = ${frac(r * r, t * t)}.`, `« Au moins un rouge » est le contraire de « deux bleus » : 1 ${M} ${b}/${t} × ${b}/${t} = ${frac(t * t - b * b, t * t)}.`],
            `P(deux rouges) = ${frac(r * r, t * t)} et P(au moins un rouge) = ${frac(t * t - b * b, t * t)}.`),
          'Pour « au moins un », passe par l’événement contraire.'); }
      }),
      T({ // Deux tirages sans remise
        base: {r: 4, b: 3},
        params: r => ({r: r.int(2, 9), b: r.int(2, 9)}),
        accept: ({r, b}) => r !== b,
        difficulty: ({r, b}) => score({steps: 3, values: [(r + b) * (r + b - 1)], fractions: true}),
        verify: ({r, b}, w) => { const t = r + b; return sameFrac(w[0], r * (r - 1), t * (t - 1)) && sameFrac(w[1], r * (r - 1) + b * (b - 1), t * (t - 1)); },
        build: ({r, b}) => { const t = r + b, d = t * (t - 1);
          return item('Enchaîner deux tirages sans remise', `Une boîte contient ${r} billes rouges et ${b} billes bleues. On tire successivement deux billes, sans remettre la première.`,
            [Q('P(deux billes rouges)', r * (r - 1) / d), Q('P(deux billes de même couleur)', (r * (r - 1) + b * (b - 1)) / d)],
            C('sans remise, la composition de la boîte change après le premier tirage : il reste ' + (t - 1) + ' billes.',
              [`P(R puis R) = ${r}/${t} × ${r - 1}/${t - 1} = ${frac(r * (r - 1), d)}.`, `P(B puis B) = ${b}/${t} × ${b - 1}/${t - 1} = ${frac(b * (b - 1), d)} ; même couleur : ${frac(r * (r - 1), d)} + ${frac(b * (b - 1), d)} = ${frac(r * (r - 1) + b * (b - 1), d)}.`],
              `P(deux rouges) = ${frac(r * (r - 1), d)} et P(même couleur) = ${frac(r * (r - 1) + b * (b - 1), d)}.`),
            'Au second tirage, il manque une bille de la couleur tirée.'); }
      }),
      T({ // Fréquence et probabilité
        base: {N: 300, k: 56},
        params: r => ({N: 60 * r.int(1, 10), k: r.int(5, 120)}),
        accept: ({N, k}) => k < N / 3 && k > N / 12,
        difficulty: ({N, k}) => score({steps: 2, values: [N, k, k / N], decimals: true}),
        verify: ({N, k}, v) => close(v[0], k / N) && v[1] === N / 6,
        build: ({N, k}) => item('Comparer fréquence et probabilité', `On lance ${N} fois un dé équilibré à six faces. Le 6 sort ${k} fois.`,
          [Q('Fréquence d’apparition du 6', k / N), Q('Nombre de 6 attendu en moyenne', N / 6)],
          C('la fréquence observée est le nombre d’apparitions ÷ nombre de lancers ; la probabilité théorique d’un 6 vaut 1/6.',
            [`Fréquence : ${k} ÷ ${N} ${eq(k / N)}.`, `Nombre attendu : ${N} × 1/6 = ${N / 6}.`],
            `la fréquence vaut ${about(k / N)}, alors que la probabilité est 1/6 ≈ 0,17 : sur ${N} lancers, on attendait environ ${N / 6} six. L’écart diminue en général quand le nombre de lancers augmente.`),
          'La fréquence se calcule sur les lancers réalisés ; la probabilité ne dépend pas de l’expérience.')
      }),
      T({ // Roue de loterie
        base: {a: 90, b: 120},
        params: r => ({a: 10 * r.int(2, 18), b: 10 * r.int(2, 18)}),
        accept: ({a, b}) => a + b <= 300 && a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, 360], fractions: true}),
        verify: ({a, b}, w) => sameFrac(w[0], a, 360) && sameFrac(w[1], 360 - a - b, 360),
        build: ({a, b}) => { const c = 360 - a - b; return item('Utiliser une roue', `Une roue équilibrée a trois secteurs : rouge (${a}°), jaune (${b}°) et bleu (le reste).`,
          [Q('P(rouge)', a / 360), Q('P(bleu)', c / 360)],
          C('la probabilité d’un secteur est proportionnelle à son angle : angle ÷ 360°.',
            [`P(rouge) = ${a}/360 = ${frac(a, 360)}.`, `Angle bleu : 360 ${M} ${a} ${M} ${b} = ${c}° ; P(bleu) = ${frac(c, 360)}.`],
            `P(rouge) = ${frac(a, 360)} et P(bleu) = ${frac(c, 360)}.`),
          'Un tour complet mesure 360°.'); }
      })
    ],

    /* ---------- 11 · Grandeurs et mesures ---------- */
  };

  const basics = {
    '3-probabilites': ['Avec des issues équiprobables : issues favorables ÷ issues possibles.', 'Probabilité d’obtenir pile avec une pièce équilibrée ?', '1/2', 'Deux issues, une favorable.'],
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
    '3-probabilites': [null, null,
      ({r, b}) => { const t = r + b, niveau = () => [{nom: 'R', p: r + '/' + t}, {nom: 'B', p: b + '/' + t}];
        return {c: FG.arbre(`Arbre des deux tirages avec remise : ${r} rouges et ${b} bleus`, niveau().map(n => Object.assign(n, {enfants: niveau()})), {chemin: ['R', 'R']}).description()}; },
      ({r, b}) => { const t = r + b;
        return {c: FG.arbre(`Arbre des deux tirages sans remise : ${r} rouges et ${b} bleues, puis ${t - 1} billes au second tirage`,
          [{nom: 'R', p: r + '/' + t, enfants: [{nom: 'R', p: (r - 1) + '/' + (t - 1)}, {nom: 'B', p: b + '/' + (t - 1)}]},
            {nom: 'B', p: b + '/' + t, enfants: [{nom: 'R', p: r + '/' + (t - 1)}, {nom: 'B', p: (b - 1) + '/' + (t - 1)}]}], {chemins: [['R', 'R'], ['B', 'B']]}).description()}; },
      null,
      ({a, b}) => ({e: FG.statistiques(`Roue à trois secteurs : rouge ${a}°, jaune ${b}°, bleu pour le reste`)
        .diagramme_circulaire([{nom: 'rouge', angle: a}, {nom: 'jaune', angle: b}, {nom: 'bleu', angle: 360 - a - b, texte: '?'}]).description()})
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
