/* Série 2-calcul-algebrique : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-calcul-algebrique': [
      T({ // Puissances
        base: {m: 5, n: 3, p: 2, q: 4},
        params: r => ({m: r.int(-4, 8), n: r.int(-4, 8), p: r.int(-4, 6), q: r.int(-4, 6)}),
        accept: ({m, n, p, q}) => m !== p && n !== q && m && n && p && q,
        difficulty: ({m, n, p, q}) => score({steps: 3, values: [m, n, p, q], negatives: true}),
        verify: ({m, n, p, q}, v) => v[0] === m - p && v[1] === n - q,
        build: ({m, n, p, q}) => item('Calculer avec des puissances', `Écris A = (2${sup(m)} × 3${sup(n)}) ÷ (2${sup(p)} × 3${sup(q)}) sous la forme 2<sup>a</sup> × 3<sup>b</sup>.`,
          [Q('Exposant a', m - p), Q('Exposant b', n - q)],
          C('x<sup>m</sup> ÷ x<sup>p</sup> = x<sup>m − p</sup>, pour chaque base séparément.',
            [`2${sup(m)} ÷ 2${sup(p)} = 2${sup(m - p)} et 3${sup(n)} ÷ 3${sup(q)} = 3${sup(n - q)}.`],
            `A = 2${sup(m - p)} × 3${sup(n - q)}.`),
          'Ne mélange pas les bases 2 et 3.')
      }),
      T({ // Racines carrées
        base: {k: 3, m: 5},
        params: r => ({k: r.int(2, 12), m: r.pick([2, 3, 5, 6, 7, 10, 11, 13])}),
        accept: ({k, m}) => k * k * m <= 1500,
        difficulty: ({k, m}) => score({steps: 2, values: [k, m]}),
        verify: ({k, m}, v) => v[0] * v[0] * v[1] === k * k * m && sqrtFree(v[1])[0] === 1,
        build: ({k, m}) => { const n = k * k * m;
          return item('Simplifier une racine carrée', `Écris √${n} sous la forme a√b, avec a et b entiers et b le plus petit possible.`,
            [Q('Valeur de a', k), Q('Valeur de b', m)],
            C('pour a et b positifs, √(ab) = √a × √b : on fait apparaître le plus grand carré qui divise ' + n + '.',
              [`${n} = ${k * k} × ${m} = ${k}² × ${m}.`, `√${n} = √${k * k} × √${m} = ${k}√${m}.`],
              `√${n} = ${k}√${m}.`),
            'Cherche un carré parfait (4, 9, 16, 25…) qui divise ' + n + '.'); }
      }),
      T({ // Identité remarquable à l'envers
        base: {p: 2, q: 3},
        params: r => ({p: r.int(1, 7), q: r.int(1, 15)}),
        accept: ({p, q}) => gcd(p, q) === 1 && p * p <= 49,
        difficulty: () => score({steps: 2, values: [20]}),
        verify: ({p, q}, v) => v[0] * v[0] === p * p && v[1] * v[1] === q * q && 2 * v[0] * v[1] === 2 * p * q,
        build: ({p, q}) => item('Factoriser avec une identité remarquable', `Factorise E = ${quad(p * p, -2 * p * q, q * q)} sous la forme (ax ${M} b)², avec a et b positifs.`,
          [Q('Valeur de a', p), Q('Valeur de b', q)],
          C('on reconnaît u² − 2uv + v² = (u − v)².',
            [`${mono(p * p, 'x²')} = (${mono(p)})², ${q * q} = ${q}² et 2 × ${mono(p)} × ${q} = ${mono(2 * p * q)}.`],
            `E = (${mono(p)} ${M} ${q})².`),
          'Vérifie le double produit avant de conclure.')
      }),
      T({ // Puissances de fractions
        base: {a: 2, b: 3, n: 2},
        params: r => ({a: r.int(1, 7), b: r.int(2, 9), n: r.int(2, 3)}),
        accept: ({a, b, n}) => gcd(a, b) === 1 && b ** n <= 729 && a !== 1,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], fractions: true}),
        verify: ({a, b, n}, v) => close(v[0], (a / b) ** n) && close(v[1], (b / a) ** n),
        build: ({a, b, n}) => item('Calculer des puissances de fractions', `Calcule (${a}/${b})${sup(n)} et (${a}/${b})${sup(-n)}.`,
          [Q(`(${a}/${b})${SUP(n)}`, (a / b) ** n, 4), Q(`(${a}/${b})${SUP(-n)}`, (b / a) ** n, 4)],
          C('(a/b)<sup>n</sup> = a<sup>n</sup>/b<sup>n</sup> et x<sup>−n</sup> = 1/x<sup>n</sup>, donc (a/b)<sup>−n</sup> = (b/a)<sup>n</sup>.',
            [`(${a}/${b})${sup(n)} = ${a ** n}/${b ** n}.`, `(${a}/${b})${sup(-n)} = (${b}/${a})${sup(n)} = ${frac(b ** n, a ** n)}.`],
            `${a ** n}/${b ** n} et ${frac(b ** n, a ** n)}.`),
          'Un exposant négatif inverse la fraction.')
      }),
      T({ // Isoler une variable
        base: {kind: 0, x: 12, y: 3},
        params: r => ({kind: r.int(0, 2), x: r.int(2, 60), y: r.int(2, 20)}),
        accept: ({x, y}) => x !== y,
        difficulty: ({x, y}) => score({steps: 2, values: [x * y], decimals: true}),
        verify: ({kind, x, y}, v) => close(v[0], [x / y, x / y, x / 2 - y][kind]),
        build: ({kind, x, y}) => {
          const spec = [
            ['U = R × I', `U = ${x} V et R = ${y} Ω`, 'I = U ÷ R', 'Intensité I, en A', x / y, `I = ${x} ÷ ${y}`],
            ['d = v × t', `d = ${x} km et v = ${y} km/h`, 't = d ÷ v', 'Durée t, en h', x / y, `t = ${x} ÷ ${y}`],
            ['P = 2(L + ℓ)', `P = ${x} cm et L = ${y} cm`, 'ℓ = P ÷ 2 − L', 'Largeur ℓ, en cm', x / 2 - y, `ℓ = ${x} ÷ 2 ${M} ${y}`]][kind];
          return item('Isoler une variable dans une formule', `On utilise la formule ${spec[0]}, avec ${spec[1]}. Isole l’inconnue, puis calcule-la.`,
            [Q(spec[3], spec[4]), Q('Valeur arrondie au dixième', spec[4], 1)],
            C(`on transforme la formule pour obtenir ${spec[2]}.`, [`${spec[5]} ${eq(spec[4])}.`], `${spec[2].split(' ')[0]} ${eq(spec[4])}.`),
            'Effectue la même opération dans les deux membres pour isoler la lettre.');
        }
      }),
      T({ // √(a + b) et √a + √b
        base: {a: 9, b: 16, o: 0},
        params: r => ({a: r.int(2, 80), b: r.int(2, 80), o: r.int(0, 1)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a + b], decimals: true}),
        verify: ({a, b}, v) => close(v[0], Math.sqrt(a + b)) && close(v[1], Math.sqrt(a) + Math.sqrt(b)) && v[2] === '√a + √b',
        build: ({a, b, o}) => { const x = Math.sqrt(a + b), y = Math.sqrt(a) + Math.sqrt(b), opts = o ? ['√a + √b', '√(a + b)'] : ['√(a + b)', '√a + √b'];
          return item('Comparer √(a + b) et √a + √b', `Pour a = ${a} et b = ${b}, calcule √(a + b) et √a + √b, puis compare-les.`,
            [Q('√(a + b)', x), Q('√a + √b', y), S('La plus grande valeur est', '√a + √b', opts)],
            C('pour a et b strictement positifs, √(a + b) < √a + √b : la racine carrée d’une somme n’est jamais la somme des racines.',
              [`√${a + b} ${eq(x)} et √${a} + √${b} ${eq(y)}.`, '(√a + √b)² = a + b + 2√(ab), qui est strictement supérieur à a + b.'],
              `√(a + b) < √a + √b.`),
            'Élève les deux nombres au carré pour les comparer.'); }
      })
    ],

    /* ---------- 04 · Équations et inéquations ---------- */
  };

  const basics = {
    '2-calcul-algebrique': ['√(ab) = √a × √b pour a et b positifs.', 'Simplifie √12 sous la forme a√3 : a ?', '2', '12 = 4 × 3.'],
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
