/* Série 3-fractions : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-fractions': [
      T({ // Somme de fractions
        base: {a: 2, b: 3, c: 1, d: 4},
        params: r => ({a: r.int(1, 9), b: r.int(2, 9), c: r.int(1, 9), d: r.int(2, 12)}),
        accept: ({a, b, c, d}) => b !== d && gcd(a, b) === 1 && gcd(c, d) === 1 && lcm(b, d) <= 60,
        difficulty: ({b, d}) => score({steps: 2, values: [b, d, lcm(b, d)], fractions: true}),
        verify: ({a, b, c, d}, v) => v[0] * b * d === v[1] * (a * d + c * b) && gcd(v[0], v[1]) === 1,
        build: ({a, b, c, d}) => {
          const L = lcm(b, d), n = a * L / b + c * L / d, g = gcd(n, L);
          return item('Additionner deux fractions', `Calcule ${a}/${b} + ${c}/${d} et donne le résultat sous forme de fraction irréductible.`,
            [Q('Numérateur', n / g), Q('Dénominateur', L / g)],
            C('on écrit les deux fractions avec un même dénominateur, puis on additionne les numérateurs.',
              [`Dénominateur commun : ${L}. ${a}/${b} = ${a * L / b}/${L} et ${c}/${d} = ${c * L / d}/${L}.`, `${a * L / b}/${L} + ${c * L / d}/${L} = ${n}/${L}${g > 1 ? ` = ${n / g}/${L / g}` : ''}.`],
              `${a}/${b} + ${c}/${d} = ${frac(n, L)}.`),
            'On n’additionne jamais les dénominateurs : cherche d’abord un dénominateur commun.');
        }
      }),
      T({ // Quotient de fractions
        base: {s: 1, a: 3, b: 4, c: 5, d: 6},
        params: r => ({s: r.sign(), a: r.int(1, 9), b: r.int(2, 9), c: r.int(1, 9), d: r.int(2, 9)}),
        accept: ({a, b, c, d}) => gcd(a, b) === 1 && gcd(c, d) === 1 && a * d <= 81 && b * c <= 81 && a * d !== b * c,
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a * d, b * c], fractions: true, negatives: false}),
        verify: ({s, a, b, c, d}, v) => v[0] * b * c === s * v[1] * a * d && gcd(v[0], v[1]) === 1 && v[1] > 0,
        build: ({s, a, b, c, d}) => {
          const n = s * a * d, m = b * c, g = gcd(n, m), first = s < 0 ? `(${M}${a}/${b})` : `${a}/${b}`;
          return item('Diviser par une fraction', `Calcule ${first} ÷ ${c}/${d} et donne le résultat sous forme de fraction irréductible (le signe porte sur le numérateur).`,
            [Q('Numérateur', n / g), Q('Dénominateur', m / g)],
            C('diviser par une fraction revient à multiplier par son inverse.',
              [`${first} ÷ ${c}/${d} = ${first} × ${d}/${c} = ${frac(n, 1)}/${m}${g > 1 ? ` = ${frac(n / g, 1)}/${m / g}` : ''}.`],
              `le quotient vaut ${frac(n, m)}.`),
            'L’inverse de ' + c + '/' + d + ' est ' + d + '/' + c + '.');
        }
      }),
      T({ // Priorités avec des relatifs
        base: {a: 5, b: 3, c: 2, d: -4},
        params: r => ({a: r.nonZero(1, 12), b: r.nonZero(2, 9), c: r.nonZero(1, 9), d: r.nonZero(1, 9)}),
        accept: ({c, d, a, b}) => c !== d && a - b * (c - d) !== 0,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a, b, c, d, c - d, a - b * (c - d)], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === c - d && v[1] === a - b * v[0],
        build: ({a, b, c, d}) => { const p = c - d, E = a - b * p; return item('Calculer avec des relatifs', `E = ${fr(a)} ${M} ${pa(b)} × (${fr(c)} ${M} ${pa(d)}).`,
          [Q('Valeur de la parenthèse', p), Q('Valeur de E', E)],
          C('on calcule d’abord la parenthèse, puis la multiplication, et enfin la soustraction.',
            [`${fr(c)} ${M} ${pa(d)} = ${fr(p)}.`, `${pa(b)} × ${pa(p)} = ${fr(b * p)}, puis E = ${fr(a)} ${M} ${pa(b * p)} = ${fr(E)}.`],
            `la parenthèse vaut ${fr(p)} et E = ${fr(E)}.`),
          'Soustraire un nombre revient à ajouter son opposé.'); }
      }),
      T({ // Fraction d'une quantité et du reste
        base: {T: 120, a: 1, b: 4, c: 2, d: 3},
        params: r => ({T: 10 * r.int(6, 40), a: r.int(1, 4), b: r.pick([3, 4, 5, 6, 8, 10]), c: r.int(1, 3), d: r.pick([2, 3, 4, 5])}),
        accept: ({T, a, b, c, d}) => a < b && c < d && gcd(a, b) === 1 && gcd(c, d) === 1 && (T * a) % b === 0 && ((T - T * a / b) * c) % d === 0,
        difficulty: ({T}) => score({steps: 3, values: [T], fractions: true}),
        verify: ({T, a, b, c, d}, v) => v[0] * b === T * a && v[1] === (T - v[0]) * (d - c) / d,
        build: ({T, a, b, c, d}) => { const e1 = T * a / b, rest = T - e1, e2 = rest * c / d, end = rest - e2;
          return item('Prendre une fraction du reste', `Léa dispose de ${T} €. Elle dépense ${a}/${b} de cette somme, puis ${c}/${d} de ce qui lui reste.`,
            [Q('Première dépense, en €', e1), Q('Somme restante à la fin, en €', end)],
            C('prendre une fraction d’une quantité revient à multiplier cette quantité par la fraction. La seconde fraction porte sur le reste, pas sur le total.',
              [`${a}/${b} × ${T} = ${e1} € ; il reste ${T} ${M} ${e1} = ${rest} €.`, `${c}/${d} × ${rest} = ${e2} € ; il reste ${rest} ${M} ${e2} = ${end} €.`],
              `la première dépense est de ${e1} € et il reste ${end} € à Léa.`),
            'Calcule d’abord ce qui reste après la première dépense.'); }
      }),
      T({ // Comparer deux fractions
        base: {a: 5, b: 8, c: 7, d: 12, swap: 0},
        params: r => ({a: r.int(1, 11), b: r.int(3, 12), c: r.int(1, 11), d: r.int(3, 12), swap: r.int(0, 1)}),
        accept: ({a, b, c, d}) => a < b && c < d && b !== d && gcd(a, b) === 1 && gcd(c, d) === 1 && a * d !== b * c && lcm(b, d) <= 60,
        difficulty: ({b, d}) => score({steps: 2, values: [b, d, lcm(b, d)], fractions: true}),
        verify: ({a, b, c, d, swap}, v) => { const f = [[a, b], [c, d]]; if (swap) f.reverse(); const big = f[0][0] * f[1][1] > f[1][0] * f[0][1] ? f[0] : f[1]; return v[0] === big.join('/') && close(v[1], Math.abs(a / b - c / d)); },
        build: ({a, b, c, d, swap}) => {
          let f = [[a, b], [c, d]]; if (swap) f = f.reverse();
          const [[p, q], [s, t]] = f, L = lcm(q, t), big = p * t > s * q ? `${p}/${q}` : `${s}/${t}`;
          return item('Comparer deux fractions', `Compare ${p}/${q} et ${s}/${t}, puis calcule leur écart (la plus grande moins la plus petite).`,
            [S('La plus grande fraction', big, [`${p}/${q}`, `${s}/${t}`]), Q('Écart entre les deux fractions', Math.abs(p / q - s / t))],
            C('on écrit les deux fractions avec un même dénominateur ; la plus grande a alors le plus grand numérateur.',
              [`${p}/${q} = ${p * L / q}/${L} et ${s}/${t} = ${s * L / t}/${L}.`, `Écart : ${Math.abs(p * L / q - s * L / t)}/${L}${gcd(Math.abs(p * L / q - s * L / t), L) > 1 ? ' = ' + frac(Math.abs(p * L / q - s * L / t), L) : ''}.`],
              `${big} est la plus grande ; l’écart vaut ${frac(Math.abs(p * L / q - s * L / t), L)}.`),
            'Un plus grand dénominateur ne donne pas une plus grande fraction : compare avec un dénominateur commun.');
        }
      }),
      T({ // Expression fractionnaire avec priorités
        base: {a: 3, b: 4, c: 1, d: 2, e: 2, f: 3},
        params: r => ({a: r.int(1, 9), b: r.int(2, 9), c: r.int(1, 5), d: r.int(2, 6), e: r.int(1, 5), f: r.int(2, 7)}),
        accept: ({a, b, c, d, e, f}) => gcd(a, b) === 1 && gcd(c, d) === 1 && gcd(e, f) === 1 && lcm(b, d * f) <= 84 && a * d * f !== c * e * b,
        difficulty: ({b, d, f}) => score({steps: 3, values: [b, d * f, lcm(b, d * f)], fractions: true}),
        verify: ({a, b, c, d, e, f}, v) => close(v[0], c * e / (d * f)) && close(v[1], a / b - c * e / (d * f)),
        build: ({a, b, c, d, e, f}) => {
          const pn = c * e, pd = d * f, L = lcm(b, pd), n = a * L / b - pn * L / pd;
          return item('Respecter les priorités avec des fractions', `Calcule A = ${a}/${b} ${M} ${c}/${d} × ${e}/${f}.`,
            [Q('Valeur du produit', pn / pd), Q('Valeur de A', n / L)],
            C('la multiplication est prioritaire sur la soustraction : on calcule le produit, puis on réduit au même dénominateur.',
              [`${c}/${d} × ${e}/${f} = ${pn}/${pd}${gcd(pn, pd) > 1 ? ' = ' + frac(pn, pd) : ''}.`, `A = ${a * L / b}/${L} ${M} ${pn * L / pd}/${L} = ${frac(n, L)}.`],
              `le produit vaut ${frac(pn, pd)} et A = ${frac(n, L)}.`),
            'Ne soustrais pas avant d’avoir effectué la multiplication.');
        }
      })
    ],

    /* ---------- 03 · Puissances et notation scientifique ---------- */
  };

  const basics = {
    '3-fractions': ['Écris les fractions avec un même dénominateur avant d’additionner ou de comparer.', 'Calcule 1/2 + 1/4.', '3/4', '1/2 = 2/4.'],
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
