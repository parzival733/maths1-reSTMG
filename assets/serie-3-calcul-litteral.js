/* Série 3-calcul-litteral : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-calcul-litteral': [
      T({ // Développer et réduire
        base: {k: 3, a: 2, b: 5, c: 4, d: 1},
        params: r => ({k: r.nonZero(2, 7), a: r.nonZero(1, 6), b: r.nonZero(1, 9), c: r.int(2, 7), d: r.nonZero(1, 9)}),
        accept: ({k, a, c, b, d}) => k * a !== c && k * b !== c * d,
        difficulty: ({k, a, b, c, d}) => score({steps: 3, values: [k * a, k * b, c * d, k * a - c, k * b - c * d], negatives: true}),
        verify: ({k, a, b, c, d}, v) => [-2, 0, 3].every(x => k * (a * x + b) - c * (x + d) === v[0] * x + v[1]),
        build: ({k, a, b, c, d}) => { const A = k * a - c, B = k * b - c * d;
          return item('Développer et réduire', `Développe et réduis A = ${fr(k)}(${lin(a, b)}) ${M} ${c}(x${sg(d)}).`,
            [Q('Coefficient de x', A), Q('Terme constant', B)],
            C('on distribue chaque facteur sur la parenthèse, en changeant les signes de la seconde à cause du signe moins, puis on regroupe.',
              [`${fr(k)}(${lin(a, b)}) = ${lin(k * a, k * b)} et ${M}${c}(x${sg(d)}) = ${lin(-c, -c * d)}.`, `A = ${lin(k * a, k * b)}${mono(-c, 'x', false)}${sg(-c * d)} = ${lin(A, B)}.`],
              `A = ${lin(A, B)}.`),
            'Le signe moins devant ' + c + ' change le signe des deux termes de la parenthèse.'); }
      }),
      T({ // Double distributivité
        base: {a: 2, b: 3, c: 1, d: -4},
        params: r => ({a: r.int(1, 5), b: r.nonZero(1, 9), c: r.int(1, 5), d: r.nonZero(1, 9)}),
        accept: ({a, b, c, d}) => a * d + b * c !== 0 && (a > 1 || c > 1),
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a * c, a * d + b * c, b * d], negatives: true}),
        verify: ({a, b, c, d}, v) => [-1, 0, 2].every(x => (a * x + b) * (c * x + d) === v[0] * x * x + v[1] * x + v[2]),
        build: ({a, b, c, d}) => item('Utiliser la double distributivité', `Développe et réduis B = (${lin(a, b)})(${lin(c, d)}). On note B = αx² + βx + γ.`,
          [Q('Coefficient de x² (α)', a * c), Q('Coefficient de x (β)', a * d + b * c), Q('Terme constant (γ)', b * d)],
          C('chaque terme de la première parenthèse multiplie chaque terme de la seconde : quatre produits.',
            [`B = ${mono(a)} × ${mono(c)} + ${mono(a)} × ${pa(d)} + ${pa(b)} × ${mono(c)} + ${pa(b)} × ${pa(d)}.`, `B = ${mono(a * c, 'x²')}${mono(a * d, 'x', false)}${mono(b * c, 'x', false)}${sg(b * d)} = ${quad(a * c, a * d + b * c, b * d)}.`],
            `B = ${quad(a * c, a * d + b * c, b * d)}.`),
          'Écris les quatre produits avant de regrouper les termes en x.')
      }),
      T({ // Identités remarquables
        base: {kind: 0, b: 1, a: 3},
        params: r => ({kind: r.int(0, 2), b: r.int(1, 5), a: r.int(1, 9)}),
        accept: ({b, a}) => b !== a || b === 1,
        difficulty: ({b, a}) => score({steps: 3, values: [b * b, 2 * a * b, a * a]}),
        verify: ({kind, b, a}, v) => [-1, 0, 3].every(x => [(b * x + a) ** 2, (b * x - a) ** 2, (b * x + a) * (b * x - a)][kind] === v[0] * x * x + v[1] * x + v[2]),
        build: ({kind, b, a}) => {
          const bx = mono(b), expr = [`(${bx} + ${a})²`, `(${bx} ${M} ${a})²`, `(${bx} + ${a})(${bx} ${M} ${a})`][kind];
          const coefs = [[b * b, 2 * a * b, a * a], [b * b, -2 * a * b, a * a], [b * b, 0, -a * a]][kind];
          const rule = ['(u + v)² = u² + 2uv + v²', '(u − v)² = u² − 2uv + v²', '(u + v)(u − v) = u² − v²'][kind];
          return item('Reconnaître une identité remarquable', `Développe C = ${expr}. On note C = αx² + βx + γ.`,
            [Q('Coefficient de x² (α)', coefs[0]), Q('Coefficient de x (β)', coefs[1]), Q('Terme constant (γ)', coefs[2])],
            C(`on applique ${rule}, avec u = ${bx} et v = ${a}.`,
              [kind === 2 ? `C = (${bx})² ${M} ${a}² = ${quad(...coefs)}.` : `C = (${bx})² ${kind ? M : '+'} 2 × ${bx} × ${a} + ${a}² = ${quad(...coefs)}.`],
              `C = ${quad(...coefs)}.`),
            kind === 2 ? 'Le produit d’une somme par une différence ne contient pas de terme en x.' : 'N’oublie pas le double produit 2uv.');
        }
      }),
      T({ // Factoriser une différence de carrés
        base: {p: 3, q: 5},
        params: r => ({p: r.int(1, 9), q: r.int(1, 12)}),
        accept: ({p, q}) => gcd(p, q) === 1 && p * p <= 81,
        difficulty: ({p, q}) => score({steps: 2, values: [p * p, q * q]}),
        verify: ({p, q}, v) => v[0] * v[0] === p * p && v[1] * v[1] === q * q && v[0] > 0 && v[1] > 0,
        build: ({p, q}) => item('Factoriser une différence de deux carrés', `Factorise D = ${mono(p * p, 'x²')} ${M} ${q * q} sous la forme (px ${M} q)(px + q), avec p et q positifs.`,
          [Q('Valeur de p', p), Q('Valeur de q', q)],
          C('on reconnaît u² − v² = (u − v)(u + v).',
            [`${mono(p * p, 'x²')} = (${mono(p)})² et ${q * q} = ${q}².`],
            `D = (${mono(p)} ${M} ${q})(${mono(p)} + ${q}) : p = ${p} et q = ${q}.`),
          'Cherche de quoi chaque terme est le carré.')
      }),
      T({ // Facteur commun
        base: {g: 3, u: 2, v: 5},
        params: r => ({g: r.int(2, 9), u: r.int(1, 7), v: r.nonZero(1, 9)}),
        accept: ({u, v}) => gcd(u, Math.abs(v)) === 1 && u !== Math.abs(v),
        difficulty: ({g, u, v}) => score({steps: 2, values: [g * u, g * v], negatives: false}),
        verify: ({g, u, v}, v2) => v2[0] === g && v2[0] * v2[1] === g * u && v2[0] * v2[2] === g * v,
        build: ({g, u, v}) => item('Factoriser par un facteur commun', `Factorise E = ${mono(g * u, 'x²')}${mono(g * v, 'x', false)} sous la forme ax(bx + c), avec a le plus grand entier positif possible.`,
          [Q('Valeur de a', g), Q('Valeur de b', u), Q('Valeur de c', v)],
          C('on repère le facteur commun aux deux termes : le plus grand diviseur commun des coefficients, et x.',
            [`${mono(g * u, 'x²')} = ${g}x × ${mono(u)} et ${mono(g * v, 'x')} = ${g}x × ${pa(v)}.`],
            `E = ${g}x(${lin(u, v)}) : a = ${g}, b = ${u} et c = ${fr(v)}.`),
          'Développe ta réponse pour vérifier que tu retrouves E.')
      }),
      T({ // Programme de calcul
        base: {a: 3, n: 4},
        params: r => ({a: r.int(1, 9), n: r.nonZero(1, 9)}),
        accept: ({a, n}) => a !== Math.abs(n),
        difficulty: ({a, n}) => score({steps: 3, values: [(n + a) ** 2, 2 * a, a * a], negatives: n < 0}),
        verify: ({a, n}, v) => v[0] === (n + a) ** 2 - n * n && v[1] === 2 * a && v[2] === a * a,
        build: ({a, n}) => item('Démontrer avec un programme de calcul', `Programme : choisir un nombre ; lui ajouter ${a} ; élever le résultat au carré ; soustraire le carré du nombre de départ. On note x le nombre de départ et R le résultat, R = αx + β.`,
          [Q(`Résultat pour ${fr(n)}`, (n + a) ** 2 - n * n), Q('Coefficient α', 2 * a), Q('Terme β', a * a)],
          C('on traduit chaque étape en expression, puis on développe avec (x + a)² = x² + 2ax + a².',
            [`Avec ${fr(n)} : (${fr(n)} + ${a})² ${M} ${pa(n)}² = ${(n + a) ** 2} ${M} ${n * n} = ${fr((n + a) ** 2 - n * n)}.`, `En général : R = (x + ${a})² ${M} x² = x² + ${2 * a}x + ${a * a} ${M} x² = ${2 * a}x + ${a * a}.`],
            `pour ${fr(n)}, on obtient ${fr((n + a) ** 2 - n * n)} ; en général R = ${2 * a}x + ${a * a}.`),
          'Vérifie ton expression générale avec le nombre testé.')
      })
    ],

    /* ---------- 05 · Équations et inéquations ---------- */
  };

  const basics = {
    '3-calcul-litteral': ['Développer transforme un produit en somme ; factoriser fait l’inverse.', 'Développe 2(x + 3) : quel est le terme constant ?', '6', '2 × 3 = 6.'],
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
