/* Série 2-equations : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-equations': [
      T({ // Inéquation avec x des deux côtés
        base: {a: 5, b: -3, c: 2, d: 9},
        params: r => ({a: r.nonZero(1, 9), b: r.nonZero(1, 15), c: r.nonZero(1, 9), d: r.nonZero(1, 15)}),
        accept: ({a, c, b, d}) => a !== c && d !== b && Math.abs(a - c) <= 8,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a - c, d - b], negatives: true, fractions: (d - b) % (a - c) !== 0}),
        verify: ({a, b, c, d}, v) => close(v[0], (d - b) / (a - c)) && (v[1] === 'x ≤ frontière') === (a - c > 0),
        build: ({a, b, c, d}) => { const k = a - c, s = (d - b) / k;
          return item('Résoudre une inéquation du premier degré', `Résous ${lin(a, b)} ≤ ${lin(c, d)}.`,
            [Q('Valeur frontière', s), S('Les solutions vérifient', k > 0 ? 'x ≤ frontière' : 'x ≥ frontière', ['x ≤ frontière', 'x ≥ frontière'])],
            C('on regroupe les x, puis on divise par leur coefficient ; diviser par un nombre négatif change le sens de l’inégalité.',
              [`${mono(k)} ≤ ${fr(d - b)}.`, k > 0 ? `x ≤ ${frac(d - b, k)}.` : `On divise par ${fr(k)} < 0 : x ≥ ${frac(d - b, k)}.`],
              `S = ${k > 0 ? ']−∞ ; ' + frac(d - b, k) + ']' : '[' + frac(d - b, k) + ' ; +∞['}.`),
            'Regarde le signe du coefficient de x après regroupement.'); }
      }),
      T({ // Produit nul à racines fractionnaires
        base: {a: 2, b: -3, c: 3, d: 4},
        params: r => ({a: r.int(1, 6), b: r.nonZero(1, 12), c: r.int(1, 6), d: r.nonZero(1, 12)}),
        accept: ({a, b, c, d}) => b * c !== a * d && (b % a !== 0 || d % c !== 0) && gcd(Math.abs(b), a) === 1 && gcd(Math.abs(d), c) === 1,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [b, d, a, c], negatives: true, fractions: true}),
        verify: ({a, b, c, d}, v) => v[0] < v[1] && [v[0], v[1]].every(x => close((a * x + b) * (c * x + d), 0, 1e-6)),
        build: ({a, b, c, d}) => { const x1 = -b / a, x2 = -d / c, lo = Math.min(x1, x2), hi = Math.max(x1, x2);
          return item('Résoudre une équation produit nul', `Résous (${lin(a, b)})(${lin(c, d)}) = 0.`,
            [Q('Plus petite solution', lo), Q('Plus grande solution', hi)],
            C('un produit est nul si et seulement si l’un de ses facteurs est nul.',
              [`${lin(a, b)} = 0 donne x = ${frac(-b, a)} ; ${lin(c, d)} = 0 donne x = ${frac(-d, c)}.`],
              `S = {${frac(Math.round(lo * a * c), a * c)} ; ${frac(Math.round(hi * a * c), a * c)}}.`),
            'Les solutions peuvent être des fractions : garde-les sous forme exacte.'); }
      }),
      T({ // x² = a
        base: {a: 20},
        params: r => ({a: r.int(2, 150)}),
        accept: ({a}) => !Number.isInteger(Math.sqrt(a)),
        difficulty: ({a}) => score({steps: 2, values: [a], decimals: true}),
        verify: ({a}, v) => close(v[0], -Math.sqrt(a)) && close(v[1], Math.sqrt(a)),
        build: ({a}) => { const [k, m] = sqrtFree(a), exact = k > 1 ? `${k}√${m}` : `√${a}`;
          return item('Résoudre x² = a', `Résous x² = ${a}. Donne les solutions arrondies au centième.`,
            [Q('Solution négative', -Math.sqrt(a)), Q('Solution positive', Math.sqrt(a))],
            C('si a > 0, l’équation x² = a a deux solutions : √a et −√a.',
              [k > 1 ? `√${a} = ${exact} ${eq(Math.sqrt(a))}.` : `√${a} ${eq(Math.sqrt(a))}.`],
              `S = {${M}${exact} ; ${exact}}, soit environ ${M}${fr(r2(Math.sqrt(a)))} et ${fr(r2(Math.sqrt(a)))}.`),
            'N’oublie pas la solution négative.'); }
      }),
      T({ // a / x = b
        base: {a: 12, b: 5, c: 8},
        params: r => ({a: r.nonZero(2, 40), b: r.nonZero(2, 15), c: r.nonZero(2, 15)}),
        accept: ({b, c}) => b !== c,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], fractions: true}),
        verify: ({a, b, c}, v) => close(a / v[0], b) && close(a / v[1], c),
        build: ({a, b, c}) => item('Résoudre a/x = b', `Résous ${fr(a)}/x = ${fr(b)}, puis ${fr(a)}/x = ${fr(c)} (x ≠ 0).`,
          [Q(`Solution de ${fr(a)}/x = ${fr(b)}`, a / b), Q(`Solution de ${fr(a)}/x = ${fr(c)}`, a / c)],
          C('pour x ≠ 0 et b ≠ 0, a/x = b équivaut à a = bx, donc x = a/b.',
            [`x = ${fr(a)}/${pa(b)}${frac(a, b) === fr(a) + '/' + fr(b) ? '' : ' = ' + frac(a, b)} ; x = ${fr(a)}/${pa(c)}${frac(a, c) === fr(a) + '/' + fr(c) ? '' : ' = ' + frac(a, c)}.`],
            `x = ${frac(a, b)}, puis x = ${frac(a, c)}.`),
          'Multiplie les deux membres par x.')
      }),
      T({ // Modéliser par une inéquation
        base: {S: 45, m: 9, n: 5},
        params: r => ({S: 5 * r.int(4, 30), m: r.int(6, 20), n: r.int(2, 12)}),
        accept: ({S, m, n}) => n < m && S % (m - n) !== 0,
        difficulty: ({S, m, n}) => score({steps: 3, values: [S, S / (m - n)], decimals: true}),
        verify: ({S, m, n}, v) => close(v[0], S / (m - n)) && v[1] === Math.floor(S / (m - n)) + 1,
        build: ({S, m, n}) => { const s = S / (m - n), N0 = Math.floor(s) + 1;
          return item('Modéliser par une inéquation', `Une salle de sport propose deux tarifs : ${m} € la séance, ou un forfait de ${S} € puis ${n} € la séance. On note x le nombre de séances.`,
            [Q('Valeur frontière', s), Q('Nombre minimal de séances pour que le forfait soit moins cher', N0)],
            C(`le forfait est moins cher si ${S} + ${n}x < ${m}x.`,
              [`${S} < ${m - n}x, soit x > ${frac(S, m - n)} ${eq(s)}.`],
              `le forfait devient plus avantageux à partir de ${N0} séances.`),
            'Le nombre de séances est entier.'); }
      }),
      T({ // Encadrements et inégalités
        base: {a: 2, b: 5, c: -1, d: 3},
        params: r => { const a = r.int(-8, 6), c = r.int(-8, 6); return {a, b: a + r.int(1, 8), c, d: c + r.int(1, 8)}; },
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a, b, c, d], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === a - d && v[1] === b - c && v[2] === -2 * b && v[3] === -2 * a,
        build: ({a, b, c, d}) => item('Opérer sur des inégalités', `On sait que ${fr(a)} ≤ x ≤ ${fr(b)} et ${fr(c)} ≤ y ≤ ${fr(d)}. Encadre x ${M} y, puis ${M}2x.`,
          [Q('Minimum de x − y', a - d), Q('Maximum de x − y', b - c), Q('Minimum de −2x', -2 * b), Q('Maximum de −2x', -2 * a)],
          C('on peut additionner des inégalités de même sens ; multiplier par un nombre négatif change le sens.',
            [`${fr(-d)} ≤ ${M}y ≤ ${fr(-c)}, donc ${fr(a - d)} ≤ x ${M} y ≤ ${fr(b - c)}.`, `En multipliant par ${M}2 : ${fr(-2 * b)} ≤ ${M}2x ≤ ${fr(-2 * a)}.`],
            `${fr(a - d)} ≤ x ${M} y ≤ ${fr(b - c)} et ${fr(-2 * b)} ≤ ${M}2x ≤ ${fr(-2 * a)}.`),
          'Pour soustraire y, ajoute l’encadrement de −y, dont les bornes sont échangées.')
      })
    ],

    /* ---------- 05 · Vecteurs ---------- */
  };

  const basics = {
    '2-equations': ['Multiplier une inégalité par un négatif change son sens.', 'Résous −x < 4 : x est supérieur à quel nombre ?', '−4', 'On multiplie par −1 et on change le sens.'],
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
