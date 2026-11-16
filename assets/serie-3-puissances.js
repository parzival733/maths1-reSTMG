/* Série 3-puissances : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-puissances': [
      T({ // Puissances de 10
        base: {a: 5, b: -2, c: 1},
        params: r => ({a: r.int(-5, 7), b: r.int(-6, 6), c: r.int(-4, 5)}),
        accept: ({a, b, c}) => a + b - c >= -3 && a + b - c <= 4 && a !== 0 && b !== 0 && c !== 0 && a !== b,
        difficulty: ({a, b, c}) => score({steps: 2, values: [a, b, c]}),
        verify: ({a, b, c}, v) => v[0] === a + b - c && close(v[1], 10 ** v[0]),
        build: ({a, b, c}) => { const n = a + b - c; return item('Calculer avec des puissances de 10', `Écris A = (10${sup(a)} × 10${sup(b)}) ÷ 10${sup(c)} sous la forme 10<sup>n</sup>, puis donne son écriture décimale.`,
          [Q('Exposant n', n), Q('Écriture décimale de A', 10 ** n, 4)],
          C('10<sup>m</sup> × 10<sup>p</sup> = 10<sup>m + p</sup> et 10<sup>m</sup> ÷ 10<sup>p</sup> = 10<sup>m − p</sup>.',
            [`10${sup(a)} × 10${sup(b)} = 10${sup(a + b)}.`, `10${sup(a + b)} ÷ 10${sup(c)} = 10${sup(n)}.`],
            `A = 10${sup(n)} = ${decimal(1, n)}.`),
          'Additionne les exposants pour un produit, soustrais-les pour un quotient.'); }
      }),
      T({ // Notation scientifique
        base: {m: 347, e: 7},
        params: r => ({m: r.int(11, 999), e: r.int(-6, 9)}),
        accept: ({m, e}) => m % 10 !== 0 && e !== 0 && e !== 1 && e !== -1,
        difficulty: ({e}) => score({steps: 2, values: [Math.abs(e) * 10]}),
        verify: ({m, e}, v) => { const k = String(m).length - 1; return close(v[0], m / 10 ** k) && v[1] === e && v[0] >= 1 && v[0] < 10; },
        build: ({m, e}) => { const k = String(m).length - 1, a = m / 10 ** k, text = decimal(m, e - k);
          return item('Écrire en notation scientifique', `Écris le nombre ${text} en notation scientifique a × 10<sup>n</sup>, avec 1 ≤ a < 10.`,
            [Q('Nombre a', a, 3), Q('Exposant n', e)],
            C('on place la virgule après le premier chiffre non nul ; n compte de combien de rangs la virgule s’est déplacée (positif pour un grand nombre, négatif pour un petit).',
              [`${text} = ${fr(a)} × 10${sup(e)}.`],
              `a = ${fr(a)} et n = ${fr(e)}.`),
            e > 0 ? 'Le nombre est grand : l’exposant est positif.' : 'Le nombre est inférieur à 1 : l’exposant est négatif.'); }
      }),
      T({ // Produit en notation scientifique
        base: {a: 25, b: 36, m: 3, n: 5},
        params: r => ({a: r.int(11, 99), b: r.int(11, 99), m: r.int(-4, 8), n: r.int(-5, 8)}),
        accept: ({a, b, m, n}) => a % 10 !== 0 && b % 10 !== 0 && m !== 0 && n !== 0 && m + n !== 0,
        difficulty: ({m, n}) => score({steps: 3, values: [Math.abs(m + n) * 10], decimals: true}),
        verify: ({a, b, m, n}, v) => close(v[0] * 10 ** v[1], a * b / 100 * 10 ** (m + n)) && v[0] >= 1 && v[0] < 10,
        build: ({a, b, m, n}) => {
          const x = a / 10, y = b / 10, p = a * b / 100, shift = p >= 10 ? 1 : 0, mant = p / 10 ** shift, e = m + n + shift;
          return item('Multiplier en notation scientifique', `Calcule (${fr(x)} × 10${sup(m)}) × (${fr(y)} × 10${sup(n)}) et donne le résultat en notation scientifique.`,
            [Q('Nombre a', mant, 4), Q('Exposant n', e)],
            C('on multiplie les nombres décimaux entre eux et les puissances de 10 entre elles, puis on ajuste pour avoir 1 ≤ a < 10.',
              [`${fr(x)} × ${fr(y)} = ${fr(p)} et 10${sup(m)} × 10${sup(n)} = 10${sup(m + n)}.`, shift ? `${fr(p)} × 10${sup(m + n)} = ${fr(mant)} × 10${sup(e)}.` : `${fr(p)} est déjà compris entre 1 et 10.`],
              `le produit vaut ${fr(mant)} × 10${sup(e)}.`),
            'Si le produit des nombres décimaux dépasse 10, divise-le par 10 et ajoute 1 à l’exposant.');
        }
      }),
      T({ // Puissance d'un négatif
        space: 18,
        base: {a: 2, n: 4},
        params: r => ({a: r.int(2, 6), n: r.int(2, 5)}),
        accept: ({a, n}) => a ** n <= 2000,
        difficulty: ({a, n}) => score({steps: 2, values: [a, n], negatives: true}),
        verify: ({a, n}, v) => v[0] === (-a) ** n && v[1] === -(a ** n),
        build: ({a, n}) => { const p = a ** n, pos = n % 2 === 0;
          return item('Calculer la puissance d’un nombre négatif', `Calcule (${M}${a})${sup(n)} et ${M}${a}${sup(n)}.`,
            [Q(`(${M}${a})${SUP(n)}`, (-a) ** n), Q(`${M}${a}${SUP(n)}`, -p)],
            C('dans (−a)<sup>n</sup>, le signe moins est élevé à la puissance ; dans −a<sup>n</sup>, seul a l’est.',
              [`(${M}${a})${sup(n)} = ${Array(n).fill(`(${M}${a})`).join(' × ')} = ${fr((-a) ** n)} : ${n} facteurs négatifs, ${pos ? 'nombre pair, produit positif' : 'nombre impair, produit négatif'}.`, `${M}${a}${sup(n)} = ${M}(${Array(n).fill(a).join(' × ')}) = ${fr(-p)}.`],
              `(${M}${a})${sup(n)} = ${fr((-a) ** n)} et ${M}${a}${sup(n)} = ${fr(-p)}.`),
            'Compte le nombre de facteurs négatifs pour trouver le signe.'); }
      }),
      T({ // Durée d'un signal
        base: {d: 15, k: 8},
        params: r => ({d: r.int(12, 99), k: r.int(7, 9)}),
        accept: ({d}) => d % 10 !== 0,
        difficulty: ({d, k}) => score({steps: 3, values: [d * 10 ** (k - 1) / 3e5], decimals: true}),
        verify: ({d, k}, v) => { const t = d * 10 ** (k - 1) / 3e5; return close(v[0], t) && close(v[1], t / 60); },
        build: ({d, k}) => { const x = d / 10, D = d * 10 ** (k - 1), t = D / 3e5;
          return item('Utiliser la notation scientifique en contexte', `Un signal radio voyage à 3 × 10${sup(5)} km/s. Il doit parcourir ${fr(x)} × 10${sup(k)} km.`,
            [Q('Durée du trajet, en s', t, 0), Q('Durée du trajet, en min', t / 60, 1)],
            C('durée = distance ÷ vitesse, en gardant les unités cohérentes (km et km/s donnent des secondes).',
              [`t = (${fr(x)} × 10${sup(k)}) ÷ (3 × 10${sup(5)}) = ${fr(x / 3, 4)} × 10${sup(k - 5)} ${eq(t, 0)} s.`, `En minutes : ${fr(r2(t, 0))} ÷ 60 ${eq(t / 60, 1)} min.`],
              `le signal met ${about(t, 0)} s, soit ${about(t / 60, 1)} min.`),
            'Divise la distance par la vitesse, puis convertis les secondes en minutes (÷ 60).'); }
      }),
      T({ // Préfixes et puissances de 10
        base: {q: 32, p: 2, u: 0},
        params: r => ({q: r.int(11, 99), p: r.int(0, 6), u: r.int(0, 3)}),
        accept: ({q}) => q % 10 !== 0,
        difficulty: () => score({steps: 2, values: [9], decimals: true}),
        verify: ({q, p}, v) => close(v[0], q / 10) && v[1] === [3, 6, 9, 12, -3, -6, -9][p],
        build: ({q, p, u}) => {
          const names = ['kilo', 'méga', 'giga', 'téra', 'milli', 'micro', 'nano'], sym = ['k', 'M', 'G', 'T', 'm', 'µ', 'n'], e = [3, 6, 9, 12, -3, -6, -9][p];
          const unit = [['octet', 'o'], ['mètre', 'm'], ['gramme', 'g'], ['watt', 'W']][u];
          return item('Traduire un préfixe en puissance de 10', `Le préfixe ${names[p]} (${sym[p]}) correspond à une puissance de 10. Écris ${fr(q / 10)} ${sym[p]}${unit[1]} en ${unit[0]}s, sous la forme a × 10<sup>n</sup>.`,
            [Q('Nombre a', q / 10, 3), Q('Exposant n', e)],
            C(`${names[p]} signifie × 10${sup(e)}.`,
              [`${fr(q / 10)} ${sym[p]}${unit[1]} = ${fr(q / 10)} × 10${sup(e)} ${unit[1]}.`],
              `a = ${fr(q / 10)} et n = ${fr(e)}.`),
            'Retiens : kilo 10³, méga 10⁶, giga 10⁹, téra 10¹², milli 10⁻³, micro 10⁻⁶, nano 10⁻⁹.');
        }
      })
    ],

    /* ---------- 04 · Calcul littéral ---------- */
  };

  const basics = {
    '3-puissances': ['10 puissance n s’écrit avec n zéros si n est positif.', 'Combien vaut 10³ ?', '1000', 'Trois facteurs égaux à 10.'],
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
