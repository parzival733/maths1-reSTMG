/* Série 2-evolutions : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-evolutions': [
      T({ // Taux d'évolution
        base: {v1: 80, v2: 92},
        params: r => ({v1: 10 * r.int(2, 50), v2: 10 * r.int(2, 60)}),
        accept: ({v1, v2}) => v1 !== v2 && Math.abs(v2 - v1) / v1 < 1,
        difficulty: ({v1, v2}) => score({steps: 2, values: [v1, v2], decimals: true}),
        verify: ({v1, v2}, v) => close(v[0], v2 / v1) && close(v[1], 100 * (v2 - v1) / v1),
        build: ({v1, v2}) => item('Calculer un taux d’évolution', `Une valeur passe de ${v1} à ${v2}.`,
          [Q('Coefficient multiplicateur', v2 / v1, 4), Q('Taux d’évolution, en %', 100 * (v2 - v1) / v1)],
          C('coefficient = V₂/V₁ et taux = (V₂ − V₁)/V₁ = coefficient − 1.',
            [`${v2} ÷ ${v1} ${eq(v2 / v1, 4)}.`, `(${v2} ${M} ${v1}) ÷ ${v1} × 100 ${eq(100 * (v2 - v1) / v1)} %.`],
            `le taux est d’environ ${fr(r2(100 * (v2 - v1) / v1))} %.`),
          'Divise par la valeur de départ.')
      }),
      T({ // Évolutions successives
        base: {t1: 20, t2: 10},
        params: r => ({t1: r.pick([5, 10, 12, 15, 20, 25, 30, 40, 50]), t2: r.pick([5, 10, 15, 20, 25, 30, 40]), s: r.int(0, 1)}),
        difficulty: ({t1, t2}) => score({steps: 3, values: [t1, t2], decimals: true}),
        verify: ({t1, t2, s}, v) => { const k = (1 + t1 / 100) * (1 + (s ? 1 : -1) * t2 / 100); return close(v[0], k) && close(v[1], 100 * (k - 1)); },
        build: ({t1, t2, s}) => { const k1 = 1 + t1 / 100, k2 = 1 + (s ? 1 : -1) * t2 / 100, k = k1 * k2;
          return item('Enchaîner deux évolutions', `Un prix augmente de ${t1} %, puis ${s ? 'augmente' : 'baisse'} de ${t2} %.`,
            [Q('Coefficient global', k, 4), Q('Taux global, en %', 100 * (k - 1))],
            C('les coefficients multiplicateurs se multiplient ; les taux ne s’additionnent pas.',
              [`${fr(k1)} × ${fr(k2)} = ${fr(r2(k, 4))}.`],
              `l’évolution globale est de ${fr(r2(100 * (k - 1)))} %.`),
            'Calcule chaque coefficient, puis multiplie.'); }
      }),
      T({ // Évolution réciproque
        base: {t: 25, up: 1},
        params: r => ({t: r.pick([5, 10, 20, 25, 30, 40, 50, 60, 75, 80]), up: r.int(0, 1)}),
        space: 20,
        difficulty: () => score({steps: 2, values: [50], decimals: true}),
        verify: ({t, up}, v) => { const k = 1 + (up ? 1 : -1) * t / 100; return close(v[0], 1 / k) && close(v[1], 100 * (1 / k - 1)); },
        build: ({t, up}) => { const k = 1 + (up ? 1 : -1) * t / 100;
          return item('Calculer une évolution réciproque', `Après une ${up ? 'hausse' : 'baisse'} de ${t} %, quelle évolution ramène à la valeur de départ ?`,
            [Q('Coefficient réciproque', 1 / k, 4), Q('Taux réciproque, en %', 100 * (1 / k - 1))],
            C('le coefficient réciproque est l’inverse du coefficient.',
              [`1 ÷ ${fr(k)} ${eq(1 / k, 4)}.`],
              `il faut une évolution d’environ ${fr(r2(100 * (1 / k - 1)))} %, et non de ${up ? M : '+'}${t} %.`),
            'Une hausse de ' + t + ' % ne se compense pas par une baisse de ' + t + ' %.'); }
      }),
      T({ // Pourcentage de pourcentage
        base: {N: 1200, p: 40, q: 25},
        params: r => ({N: 100 * r.int(5, 60), p: r.pick([20, 25, 30, 40, 45, 50, 60, 75]), q: r.pick([10, 15, 20, 25, 30, 40, 50])}),
        difficulty: ({N, p, q}) => score({steps: 3, values: [N, N * p * q / 10000]}),
        verify: ({N, p, q}, v) => close(v[0], p * q / 100) && close(v[1], N * p * q / 10000),
        build: ({N, p, q}) => item('Calculer un pourcentage de pourcentage', `Dans un lycée de ${N} élèves, ${p} % sont en Seconde, et ${q} % des élèves de Seconde font de l’escalade.`,
          [Q('Part des grimpeurs de Seconde dans le lycée, en %', p * q / 100), Q('Nombre de grimpeurs de Seconde', N * p * q / 10000)],
          C('prendre q % de p % revient à multiplier les proportions : p/100 × q/100.',
            [`${p}/100 × ${q}/100 = ${fr(p * q / 10000)}, soit ${fr(p * q / 100)} %.`, `${N} × ${fr(p * q / 10000)} = ${fr(N * p * q / 10000)}.`],
            `${fr(p * q / 100)} % du lycée, soit ${fr(N * p * q / 10000)} élèves.`),
          'Les ensembles sont emboîtés : la seconde proportion porte sur les élèves de Seconde.')
      }),
      T({ // Variation absolue et relative
        base: {v1: 250, v2: 200},
        params: r => ({v1: 5 * r.int(10, 200), v2: 5 * r.int(10, 200)}),
        accept: ({v1, v2}) => v1 !== v2 && Math.abs(v2 - v1) / v1 <= 0.9,
        difficulty: ({v1, v2}) => score({steps: 2, values: [v1, v2], decimals: true}),
        verify: ({v1, v2}, v) => v[0] === v2 - v1 && close(v[1], 100 * (v2 - v1) / v1),
        build: ({v1, v2}) => item('Distinguer variation absolue et relative', `Le nombre d’abonnés passe de ${v1} à ${v2}.`,
          [Q('Variation absolue', v2 - v1), Q('Variation relative, en %', 100 * (v2 - v1) / v1)],
          C('variation absolue : V₂ − V₁ (dans l’unité de la grandeur) ; variation relative : (V₂ − V₁)/V₁ (sans unité).',
            [`${v2} ${M} ${v1} = ${fr(v2 - v1)}.`, `${fr(v2 - v1)} ÷ ${v1} × 100 ${eq(100 * (v2 - v1) / v1)} %.`],
            `variation absolue ${fr(v2 - v1)}, relative environ ${fr(r2(100 * (v2 - v1) / v1))} %.`),
          'La variation relative se calcule par rapport à la valeur de départ.')
      }),
      T({ // Partie et tout
        base: {p: 35, k: 4},
        params: r => ({p: r.pick([5, 8, 12, 15, 20, 24, 25, 30, 35, 40, 45, 60, 75]), k: r.int(2, 60)}),
        difficulty: ({p, k}) => score({steps: 2, values: [p, k * 100]}),
        verify: ({p, k}, v) => close(v[0], k * 100) && close(v[1], k * (100 - p)),
        build: ({p, k}) => { const total = k * 100, part = k * p;
          return item('Retrouver le tout à partir d’une partie', `${part} personnes, soit ${p} % des inscrits, ont participé à une course.`,
            [Q('Nombre d’inscrits', total), Q('Inscrits n’ayant pas couru', total - part)],
            C('partie = proportion × tout, donc tout = partie ÷ proportion.',
              [`${part} ÷ ${fr(p / 100)} = ${total}.`],
              `${total} inscrits, dont ${total - part} n’ont pas couru.`),
            'Divise par ' + fr(p / 100) + ', ne multiplie pas.'); }
      })
    ],

    /* ---------- 13 · Statistiques ---------- */
  };

  const basics = {
    '2-evolutions': ['Évoluer de t % revient à multiplier par 1 + t/100.', 'Coefficient d’une baisse de 15 % ?', '0,85', '1 − 0,15.'],
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
