/* Série 2-signes : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-signes': [
      T({ // Signe d'une fonction affine
        base: {a: -2, b: 6},
        params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 20)}),
        accept: ({a, b}) => b % a === 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, b / a], negatives: true}),
        verify: ({a, b}, v) => v[0] === -b / a && v[1] === (a > 0 ? 'positif' : 'négatif'),
        build: ({a, b}) => { const x0 = -b / a;
          return item('Étudier le signe d’une fonction affine', `f(x) = ${lin(a, b)}. Détermine la valeur qui annule f, et le signe de f(x) pour x > ${fr(x0)}.`,
            [Q('Valeur qui annule f', x0), S(`Signe de f(x) pour x > ${fr(x0)}`, a > 0 ? 'positif' : 'négatif', ['positif', 'négatif'])],
            C('une fonction affine s’annule en −b/a et prend, après cette valeur, le signe de a.',
              [`${lin(a, b)} = 0 pour x = ${fr(x0)}.`, `a = ${fr(a)} est ${signWord(a)}.`],
              `f(x) est ${a > 0 ? 'positif' : 'négatif'} pour x > ${fr(x0)}.`),
            'Le signe de a donne le signe à droite de la racine.'); }
      }),
      T({ // Signe d'un produit entre les racines
        base: {r1: -2, r2: 3, a: 1},
        params: r => ({r1: r.int(-9, 4), r2: r.int(-4, 9), a: r.sign()}),
        accept: ({r1, r2}) => r1 < r2,
        difficulty: ({r1, r2}) => score({steps: 3, values: [r1, r2], negatives: true}),
        verify: ({r1, r2, a}, v) => v[0] === r1 && v[1] === r2 && v[2] === (a > 0 ? 'négatif' : 'positif'),
        build: ({r1, r2, a}) => { const f1 = fmt.fact(r1), f2 = fmt.fact(r2), expr = (a < 0 ? M : '') + f1 + f2, mid = a > 0 ? 'négatif' : 'positif';
          return item('Dresser un tableau de signes', `Étudie le signe de P(x) = ${expr}.`,
            [Q('Plus petite racine', r1), Q('Plus grande racine', r2), S('Signe de P(x) entre les racines', mid, ['positif', 'négatif'])],
            C('on étudie le signe de chaque facteur, puis on applique la règle des signes.',
              [`Les facteurs s’annulent en ${fr(r1)} et ${fr(r2)}.`, `Entre les deux, ${fmt.bare(r1)} > 0 et ${fmt.bare(r2)} < 0${a < 0 ? ', et le signe moins inverse le tout' : ''}.`],
              `P(x) est ${mid} sur ]${fr(r1)} ; ${fr(r2)}[.`),
            'Teste une valeur entre les deux racines.'); }
      }),
      T({ // Inéquation produit
        base: {r1: -1, r2: 4, pos: 1},
        params: r => ({r1: r.int(-9, 5), r2: r.int(-4, 10), pos: r.int(0, 1)}),
        accept: ({r1, r2}) => r1 < r2,
        difficulty: ({r1, r2}) => score({steps: 3, values: [r1, r2], negatives: true}),
        verify: ({r1, r2, pos}, v) => v[0] === r1 && v[1] === r2 && v[2] === (pos ? 'à l’extérieur des racines' : 'entre les racines'),
        build: ({r1, r2, pos}) => item('Résoudre une inéquation produit', `Résous ${fmt.fact(r1)}${fmt.fact(r2)} ${pos ? '≥' : '≤'} 0.`,
          [Q('Plus petite racine', r1), Q('Plus grande racine', r2), S('Les solutions sont', pos ? 'à l’extérieur des racines' : 'entre les racines', ['entre les racines', 'à l’extérieur des racines'])],
          C('le produit est positif quand les deux facteurs ont le même signe, négatif sinon.',
            [`Pour x < ${fr(r1)}, les deux facteurs sont négatifs ; entre ${fr(r1)} et ${fr(r2)}, ils sont de signes contraires ; pour x > ${fr(r2)}, ils sont positifs.`],
            pos ? `S = ]−∞ ; ${fr(r1)}] ∪ [${fr(r2)} ; +∞[.` : `S = [${fr(r1)} ; ${fr(r2)}].`),
          'Les racines sont incluses : l’inégalité est large.')
      }),
      T({ // Quotient
        base: {a: 2, b: -5, pos: 1},
        params: r => ({a: r.int(-9, 9), b: r.int(-9, 9), pos: r.int(0, 1)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 3, values: [a, b], negatives: true}),
        verify: ({a, b, pos}, v) => v[0] === b && v[1] === a && v[2] === (pos ? 'à l’extérieur' : 'entre les deux valeurs'),
        build: ({a, b, pos}) => { const lo = Math.min(a, b), hi = Math.max(a, b);
          return item('Étudier le signe d’un quotient', `Résous (${fmt.bare(a)}) / ${fmt.fact(b)} ${pos ? '>' : '<'} 0.`,
            [Q('Valeur interdite', b), Q('Valeur qui annule le numérateur', a), S('Les solutions sont', pos ? 'à l’extérieur' : 'entre les deux valeurs', ['entre les deux valeurs', 'à l’extérieur'])],
            C('un quotient a le signe du produit de ses termes ; la valeur interdite est exclue.',
              [`Le quotient est positif quand numérateur et dénominateur ont le même signe (x < ${fr(lo)} ou x > ${fr(hi)}), négatif entre ${fr(lo)} et ${fr(hi)}.`],
              pos ? `S = ]−∞ ; ${fr(lo)}[ ∪ ]${fr(hi)} ; +∞[.` : `S = ]${fr(lo)} ; ${fr(hi)}[.`),
            'La valeur interdite n’est jamais solution.'); }
      }),
      T({ // Signe de x² − k
        base: {s: 3, t: 5},
        params: r => ({s: r.int(2, 15), t: r.int(-20, 20)}),
        accept: ({s, t}) => Math.abs(t) !== s,
        difficulty: () => score({steps: 2, values: [10]}),
        verify: ({s, t}, v) => v[0] === -s && v[1] === s && v[2] === (t * t > s * s ? 'positif' : 'négatif'),
        build: ({s, t}) => item('Factoriser pour étudier un signe', `Étudie le signe de x² ${M} ${s * s} en factorisant, puis donne son signe en x = ${fr(t)}.`,
          [Q('Plus petite racine', -s), Q('Plus grande racine', s), S(`Signe en x = ${fr(t)}`, t * t > s * s ? 'positif' : 'négatif', ['positif', 'négatif'])],
          C('x² − ' + s * s + ' = (x − ' + s + ')(x + ' + s + ') ; on fait un tableau de signes.',
            [`${fr(t)} est ${Math.abs(t) < s ? 'entre' : 'à l’extérieur de'} ${M}${s} et ${s}.`],
            `x² ${M} ${s * s} est négatif sur ]${M}${s} ; ${s}[ et positif ailleurs.`),
          'Reconnais une différence de deux carrés.')
      }),
      T({ // Bénéfice positif
        base: {a: 20, b: 80},
        params: r => ({a: r.int(5, 60), b: r.int(40, 200)}),
        accept: ({a, b}) => b > a + 10,
        difficulty: ({a, b}) => score({steps: 3, values: [a, b]}),
        verify: ({a, b}, v) => v[0] === a && v[1] === b,
        build: ({a, b}) => item('Interpréter un signe en contexte', `Le bénéfice, en euros, pour x objets vendus est B(x) = (x ${M} ${a})(${b} ${M} x). Pour quels x l’entreprise est-elle bénéficiaire (B(x) > 0) ?`,
          [Q('Borne inférieure', a), Q('Borne supérieure', b)],
          C('les deux facteurs sont positifs ensemble entre ' + a + ' et ' + b + '.',
            [`x ${M} ${a} > 0 pour x > ${a} ; ${b} ${M} x > 0 pour x < ${b}.`],
            `B(x) > 0 pour x ∈ ]${a} ; ${b}[.`),
          'Le second facteur est décroissant.')
      })
    ],

    /* ---------- 12 · Proportions et évolutions ---------- */
  };

  const basics = {
    '2-signes': ['Un produit est positif quand ses facteurs ont le même signe.', 'Combien vaut (−2) × (−5) ?', '10', 'Deux facteurs négatifs donnent un produit positif.'],
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
    '2-signes': [
      ({a, b}) => { const x0 = -b / a, f = x => a * x + b;
        return {c: FG.repere(`f s’annule en ${fr(x0)} : elle est ${a > 0 ? 'négative avant, positive après' : 'positive avant, négative après'}`, cadre([f], Math.min(x0 - 4, -1), Math.max(x0 + 4, 1), {hauteur: 280}))
          .droite_affine(a, b).zone_signe(null, x0, a > 0 ? '−' : '+', {signe: a > 0 ? '-' : '+'}).zone_signe(x0, null, a > 0 ? '+' : '−', {signe: a > 0 ? '+' : '-'}).point(x0, 0).description()}; },
      ({r1, r2, a}) => ({c: parabole(a, r1, r2, `P(x) est ${a > 0 ? 'négatif' : 'positif'} entre les racines ${fr(r1)} et ${fr(r2)}, ${a > 0 ? 'positif' : 'négatif'} à l’extérieur`)}),
      ({r1, r2}) => ({c: parabole(1, r1, r2, `Le produit est négatif entre ${fr(r1)} et ${fr(r2)}, positif à l’extérieur`)}),
      null,
      ({s, t}) => ({c: parabole(1, -s, s, `x² − ${s * s} est négatif entre ${fr(-s)} et ${s}, positif à l’extérieur`, t)}),
      ({a, b}) => { const d = (b - a) / 4, f = x => (x - a) * (b - x), x1 = a - d <= 2 * d ? Math.min(0, a - d) : a - d;
        return {c: FG.repere(`Le bénéfice est positif entre ${fr(a)} et ${fr(b)} objets vendus`, cadre([f], x1, b + d, {hauteur: 280, nom_x: 'x', nom_y: 'B(x)'}))
          .courbe(`(x-(${a}))*((${b})-x)`).zone_signe(null, a, '−', {signe: '-'}).zone_signe(a, b, '+', {signe: '+'}).zone_signe(b, null, '−', {signe: '-'}).point(a, 0).point(b, 0).description()}; }
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
