/* Série 2-fonctions-reference : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-fonctions-reference': [
      T({ // Carré : inéquation
        base: {s: 3},
        params: r => ({s: r.int(2, 15)}),
        space: 14,
        difficulty: () => score({steps: 2, values: [10]}),
        verify: ({s}, v) => v[0] === -s && v[1] === s,
        build: ({s}) => item('Résoudre x² ≤ k', `Résous x² ≤ ${s * s}. Donne l’ensemble des solutions sous la forme [a ; b].`,
          [Q('a', -s), Q('b', s)],
          C('la fonction carré est décroissante sur ]−∞ ; 0] et croissante sur [0 ; +∞[ ; x² = ' + s * s + ' pour x = ±' + s + '.',
            [`Sur la courbe y = x², les points sous la droite y = ${s * s} ont une abscisse entre ${M}${s} et ${s}.`],
            `S = [${M}${s} ; ${s}].`),
          'Fais un croquis de la parabole.')
      }),
      T({ // Inverse
        base: {k: 4},
        params: r => ({k: r.pick([2, 4, 5, 8, 10, 20, 25, 0.5, 0.25, 0.2])}),
        space: 10,
        difficulty: () => score({steps: 2, values: [10], decimals: true}),
        verify: ({k}, v) => close(v[0], 1 / k) && close(v[1], 1 / k),
        build: ({k}) => item('Utiliser la fonction inverse', `Résous 1/x = ${fr(k)}, puis l’inéquation 1/x > ${fr(k)} sur ]0 ; +∞[, de solution ]0 ; b[.`,
          [Q('Solution de 1/x = ' + fr(k), 1 / k), Q('b', 1 / k)],
          C('la fonction inverse est décroissante sur ]0 ; +∞[ : 1/x > k équivaut à x < 1/k.',
            [`1/x = ${fr(k)} pour x = 1/${fr(k)} = ${fr(1 / k)}.`],
            `x = ${fr(1 / k)} et S = ]0 ; ${fr(1 / k)}[.`),
          'Décroissante : l’inégalité change de sens.')
      }),
      T({ // Racine carrée
        base: {k: 3, m: 5},
        params: r => ({k: r.int(2, 15), m: r.int(2, 12)}),
        accept: ({k, m}) => k !== m,
        difficulty: ({k, m}) => score({steps: 2, values: [k * k, m * m]}),
        verify: ({k, m}, v) => v[0] === k * k && v[1] === m * m,
        build: ({k, m}) => item('Utiliser la fonction racine carrée', `Résous √x = ${k}, puis √x ≤ ${m}, de solution [0 ; b].`,
          [Q('Solution de √x = ' + k, k * k), Q('b', m * m)],
          C('la fonction racine carrée est définie et croissante sur [0 ; +∞[.',
            [`√x = ${k} pour x = ${k}² = ${k * k}.`, `√x ≤ ${m} équivaut à 0 ≤ x ≤ ${m * m}.`],
            `x = ${k * k} et S = [0 ; ${m * m}].`),
          'Élève au carré : la fonction carré est croissante sur les positifs.')
      }),
      T({ // Cube
        base: {a: 3, b: -2},
        params: r => ({a: r.int(2, 10), b: r.int(-10, -2)}),
        difficulty: () => score({steps: 2, values: [100], negatives: true}),
        verify: ({a, b}, v) => v[0] ** 3 === a ** 3 && v[1] ** 3 === b ** 3,
        build: ({a, b}) => item('Utiliser la fonction cube', `Résous x³ = ${a ** 3}, puis x³ = ${fr(b ** 3)}.`,
          [Q(`Solution de x³ = ${a ** 3}`, a), Q(`Solution de x³ = ${fr(b ** 3)}`, b)],
          C('la fonction cube est strictement croissante sur ℝ : chaque équation x³ = k a une seule solution, de même signe que k.',
            [`${a}³ = ${a ** 3} et (${M}${Math.abs(b)})³ = ${fr(b ** 3)}.`],
            `x = ${a}, puis x = ${fr(b)}.`),
          'Un cube négatif vient d’un nombre négatif.')
      }),
      T({ // Valeur absolue
        base: {a: 2, r: 5},
        params: r => ({a: r.int(-12, 12), r: r.int(1, 12)}),
        accept: ({a}) => a !== 0,
        difficulty: ({a, r}) => score({steps: 2, values: [a, r, a + r], negatives: true}),
        verify: ({a, r}, v) => v[0] < v[1] && Math.abs(v[0] - a) === r && Math.abs(v[1] - a) === r,
        build: ({a, r}) => item('Résoudre |x − a| = r', `Résous |x ${a > 0 ? M : '+'} ${Math.abs(a)}| = ${r}.`,
          [Q('Plus petite solution', a - r), Q('Plus grande solution', a + r)],
          C('|x − a| = r signifie que x est à la distance r de a : x = a − r ou x = a + r.',
            [`a = ${fr(a)} : x = ${fr(a)} ${M} ${r} ou x = ${fr(a)} + ${r}.`],
            `S = {${fr(a - r)} ; ${fr(a + r)}}.`),
          'Pense à la distance sur la droite numérique.')
      }),
      T({ // Comparer des carrés
        base: {a: -3, b: 2, kind: 0},
        params: r => { const kind = r.int(0, 1); const a = r.int(2, 12), b = r.int(2, 12); return {a: kind ? a : -a, b: kind ? b : -b, kind}; },
        accept: ({a, b}) => a !== b,
        difficulty: () => score({steps: 2, values: [100], negatives: true}),
        verify: ({a, b}, v) => v[0] === a * a && v[1] === b * b && v[2] === (a * a > b * b ? `${fr(a)}²` : `${fr(b)}²`),
        build: ({a, b}) => { const pos = a > 0;
          return item('Comparer des carrés', `Sans calculatrice, compare ${pa(a)}² et ${pa(b)}², puis vérifie par le calcul.`,
            [Q(`${fr(a)}²`, a * a), Q(`${fr(b)}²`, b * b), S('Le plus grand est', a * a > b * b ? `${fr(a)}²` : `${fr(b)}²`, [`${fr(a)}²`, `${fr(b)}²`])],
            C(pos ? 'la fonction carré est croissante sur [0 ; +∞[ : elle conserve l’ordre des positifs.' : 'la fonction carré est décroissante sur ]−∞ ; 0] : elle inverse l’ordre des négatifs.',
              [`${fr(Math.min(a, b))} < ${fr(Math.max(a, b))}, donc ${pos ? fr(Math.min(a, b)) + '² < ' + fr(Math.max(a, b)) + '²' : pa(Math.min(a, b)) + '² > ' + pa(Math.max(a, b)) + '²'}.`],
              `le plus grand est ${a * a > b * b ? pa(a) : pa(b)}² = ${Math.max(a * a, b * b)}.`),
            'Regarde le signe des deux nombres.'); }
      })
    ],

    /* ---------- 10 · Variations et extremums ---------- */
  };

  const basics = {
    '2-fonctions-reference': ['Carré, inverse, racine carrée, cube et valeur absolue sont les fonctions de référence.', '√49 ?', '7', '7² = 49.'],
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
    '2-fonctions-reference': [
      ({s}) => ({c: FG.repere(`x² ≤ ${s * s} : la parabole est sous la droite y = ${s * s} entre ${fr(-s)} et ${s}`, {xmin: -s - 2, xmax: s + 2, ymin: 0, ymax: 1.3 * s * s, hauteur: 260})
        .courbe('x^2', {nom: 'y = x²'}).antecedents(s * s, {f: 'x^2'}).intervalle_solutions(-s, s).description()}),
      ({k}) => ({c: FG.repere(`Sur ]0 ; +∞[, 1/x dépasse ${fr(k)} avant ${fr(1 / k)}`, {xmin: 0, xmax: 3 / k, ymin: 0, ymax: 2.6 * k, hauteur: 260})
        .courbe('1/x', {de: 0.05 / k, nom: 'y = 1/x'}).antecedents(k, {f: '1/x', xs: [1 / k]}).intervalle_solutions(0, 1 / k, {ouvert_a: true, ouvert_b: true}).description()}),
      ({k, m}) => { const g = Math.max(k, m);
        return {c: FG.repere(`√x = ${k} pour x = ${k * k} ; √x ≤ ${m} jusqu’à x = ${m * m}`, {xmin: 0, xmax: 1.15 * g * g, ymin: 0, ymax: g + 1, hauteur: 260})
          .courbe('sqrt(x)', {nom: 'y = √x'}).lecture(k * k, k).lecture(m * m, m).intervalle_solutions(0, m * m).description()}; },
      ({a, b}) => { const etendue = Math.max(a, b, 0) ** 3 - Math.min(a, b, 0) ** 3, visible = v => Math.abs(v ** 3) > 0.12 * etendue && undefined;
        return {c: FG.repere(`Chaque nombre a un seul antécédent par la fonction cube : ${fr(a)} pour ${fr(a ** 3)}, ${fr(b)} pour ${fr(b ** 3)}`, cadre([x => x ** 3], Math.min(a, b, 0) - 0.6, Math.max(a, b, 0) + 0.6, {hauteur: 280}))
        .courbe('x^3', {nom: 'y = x³'}).lecture(a, a ** 3, {vy: visible(a)}).lecture(b, b ** 3, {vy: visible(b)}).description()}; },
      ({a, r}) => ({c: FG.droite_numerique(`Les deux réels situés à la distance ${fr(r)} de ${fr(a)}`, {min: a - r - 2, max: a + r + 2, pas: pasDe(2 * r + 4)})
        .point(a - r).point(a).point(a + r).distance(a - r, a, fr(r)).distance(a, a + r, fr(r)).description()})
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
