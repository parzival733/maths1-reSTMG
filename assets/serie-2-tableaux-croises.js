/* Série 2-tableaux-croises : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-tableaux-croises': [
      T({ // Fréquence marginale
        base: {a: 30, b: 45, c: 50, d: 25},
        params: r => ({a: r.int(5, 80), b: r.int(5, 80), c: r.int(5, 80), d: r.int(5, 80)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d], decimals: true}),
        verify: ({a, b, c, d}, v) => v[0] === a + b + c + d && close(v[1], (a + c) / (a + b + c + d)),
        build: ({a, b, c, d}) => { const N = a + b + c + d;
          return item('Calculer une fréquence marginale', 'Sondage dans un lycée sur la pratique d’un instrument.' + table('Tableau croisé', ['Instrument', 'Pas d’instrument'], [{label: 'Seconde', cells: [a, b]}, {label: 'Première', cells: [c, d]}], 'Niveau'),
            [Q('Effectif total', N), Q('Fréquence des élèves qui jouent d’un instrument', (a + c) / N)],
            C('une fréquence marginale se calcule sur le total d’une ligne ou d’une colonne, divisé par l’effectif total.',
              [`N = ${a} + ${b} + ${c} + ${d} = ${N}.`, `(${a} + ${c}) ÷ ${N} ${eq((a + c) / N)}.`],
              `environ ${fr(r2(100 * (a + c) / N))} % des élèves jouent d’un instrument.`),
            'Additionne la colonne Instrument.'); }
      }),
      T({ // Fréquence conditionnelle
        base: {a: 30, b: 45, c: 50, d: 25},
        params: r => ({a: r.int(5, 80), b: r.int(5, 80), c: r.int(5, 80), d: r.int(5, 80)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d], decimals: true}),
        verify: ({a, b, c, d}, v) => close(v[0], a / (a + b)) && close(v[1], a / (a + c)),
        build: ({a, b, c, d}) => item('Distinguer deux fréquences conditionnelles', 'Sondage dans un lycée sur la pratique d’un instrument.' + table('Tableau croisé', ['Instrument', 'Pas d’instrument'], [{label: 'Seconde', cells: [a, b]}, {label: 'Première', cells: [c, d]}], 'Niveau'),
          [Q('Parmi les élèves de Seconde, fréquence des musiciens', a / (a + b)), Q('Parmi les musiciens, fréquence des élèves de Seconde', a / (a + c))],
          C('une fréquence conditionnelle se calcule dans une sous-population : on divise par l’effectif de cette sous-population.',
            [`${a} ÷ (${a} + ${b}) ${eq(a / (a + b))}.`, `${a} ÷ (${a} + ${c}) ${eq(a / (a + c))}.`],
            'les deux fréquences n’ont pas le même dénominateur : elles ne sont pas égales en général.'),
          'Repère d’abord la population de référence (« parmi… »).')
      }),
      T({ // Compléter un tableau
        base: {N: 200, k: 60, l: 45, m: 40},
        params: r => ({N: 10 * r.int(10, 50), k: r.int(30, 70), l: r.int(30, 70), m: r.int(20, 80)}),
        accept: ({N, k, l, m}) => { const r1 = Math.round(N * k / 100), c1 = Math.round(N * l / 100), a = Math.round(Math.min(r1, c1) * m / 100); return a > 0 && r1 - a > 0 && c1 - a > 0 && N - r1 - c1 + a > 0; },
        difficulty: ({N}) => score({steps: 3, values: [N]}),
        verify: ({N, k, l, m}, v) => { const r1 = Math.round(N * k / 100), c1 = Math.round(N * l / 100), a = Math.round(Math.min(r1, c1) * m / 100); return v[0] === r1 - a && v[1] === c1 - a && v[2] === N - r1 - c1 + a; },
        build: ({N, k, l, m}) => { const r1 = Math.round(N * k / 100), c1 = Math.round(N * l / 100), a = Math.round(Math.min(r1, c1) * m / 100);
          return item('Compléter un tableau croisé', `Sur ${N} clients, ${r1} sont des femmes et ${c1} ont pris un dessert ; ${a} femmes ont pris un dessert.`,
            [Q('Femmes sans dessert', r1 - a), Q('Hommes avec dessert', c1 - a), Q('Hommes sans dessert', N - r1 - c1 + a)],
            C('on complète par différences, en utilisant les totaux de lignes et de colonnes.',
              [`${r1} ${M} ${a} = ${r1 - a} ; ${c1} ${M} ${a} = ${c1 - a}.`, `${N} ${M} ${r1} ${M} ${c1 - a} = ${N - r1 - c1 + a}.`],
              `${r1 - a}, ${c1 - a} et ${N - r1 - c1 + a}.`),
            'Dessine le tableau à double entrée avec ses totaux.'); }
      }),
      T({ // Des pourcentages aux effectifs
        base: {N: 800, p: 60, q: 30},
        params: r => ({N: 100 * r.int(2, 30), p: r.pick([20, 30, 40, 50, 60, 70, 80]), q: r.pick([10, 20, 25, 30, 40, 50, 60])}),
        difficulty: ({N, p, q}) => score({steps: 3, values: [N, N * p * q / 10000]}),
        verify: ({N, p, q}, v) => close(v[0], N * p / 100) && close(v[1], N * p * q / 10000),
        build: ({N, p, q}) => item('Construire un tableau à partir de pourcentages', `Sur ${N} spectateurs, ${p} % ont moins de 25 ans ; parmi eux, ${q} % sont venus en train.`,
          [Q('Spectateurs de moins de 25 ans', N * p / 100), Q('Spectateurs de moins de 25 ans venus en train', N * p * q / 10000)],
          C('on passe des fréquences conditionnelles aux effectifs en multipliant.',
            [`${N} × ${fr(p / 100)} = ${fr(N * p / 100)} ; ${fr(N * p / 100)} × ${fr(q / 100)} = ${fr(N * p * q / 10000)}.`],
            `${fr(N * p / 100)} et ${fr(N * p * q / 10000)}.`),
          'Le second pourcentage porte sur les moins de 25 ans.')
      }),
      T({ // Réunion et intersection
        base: {a: 30, b: 45, c: 50, d: 25},
        params: r => ({a: r.int(5, 60), b: r.int(5, 60), c: r.int(5, 60), d: r.int(5, 60)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d]}),
        verify: ({a, b, c}, v) => v[0] === a && v[1] === a + b + c,
        build: ({a, b, c, d}) => item('Utiliser « et » et « ou »', 'Élèves selon la langue et l’option.' + table('Tableau croisé', ['Latin', 'Pas de latin'], [{label: 'Espagnol', cells: [a, b]}, {label: 'Allemand', cells: [c, d]}], 'Langue'),
          [Q('Élèves qui font espagnol ET latin', a), Q('Élèves qui font espagnol OU latin', a + b + c)],
          C('« et » : la case commune ; « ou » : l’un au moins des deux, sans compter deux fois la case commune.',
            [`ET : ${a}. OU : ${a + b} (espagnol) + ${a + c} (latin) ${M} ${a} = ${a + b + c}.`],
            `${a} élèves font les deux, ${a + b + c} font l’un au moins.`),
          'Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B).')
      }),
      T({ // Filtre sur deux critères
        base: {n: 120, p: 35, q: 50},
        params: r => ({n: 20 * r.int(3, 25), p: r.pick([20, 25, 30, 35, 40, 45, 50, 55, 60]), q: r.pick([20, 25, 40, 50, 60, 75, 80])}),
        accept: ({n, p, q}) => (n * p * q) % 10000 === 0,
        difficulty: ({n}) => score({steps: 3, values: [n]}),
        verify: ({n, p, q}, v) => v[0] === n * p / 100 && v[1] === n * p / 100 - n * p * q / 10000,
        build: ({n, p, q}) => { const A = n * p / 100, AB = n * p * q / 10000;
          return item('Filtrer selon deux critères', `Un fichier compte ${n} élèves ; ${p} % sont internes et, parmi les internes, ${q} % ont une bourse. On filtre avec la condition « interne ET NON boursier ».`,
            [Q('Nombre d’internes', A), Q('Internes non boursiers', A - AB)],
            C('NON boursier parmi les internes : on retire les internes boursiers.',
              [`${n} × ${fr(p / 100)} = ${fr(A)} ; ${fr(A)} × ${fr(q / 100)} = ${fr(AB)}.`, `${fr(A)} ${M} ${fr(AB)} = ${fr(A - AB)}.`],
              `${fr(A - AB)} élèves sont internes et non boursiers.`),
            'Applique les critères l’un après l’autre.'); }
      })
    ],

    /* ---------- 15 · Probabilités ---------- */
  };

  const basics = {
    '2-tableaux-croises': ['Une fréquence conditionnelle se calcule dans une sous-population.', 'Parmi 40 filles, 10 font du judo : fréquence ?', '0,25', '10 ÷ 40.'],
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
