/* Série 3-arithmetique : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-arithmetique': [
      T({ // Décomposition en facteurs premiers
        base: {a: 3, b: 2, c: 1, d: 0},
        params: r => ({a: r.int(0, 5), b: r.int(0, 3), c: r.int(0, 2), d: r.int(0, 1)}),
        accept: ({a, b, c, d}) => { const n = 2 ** a * 3 ** b * 5 ** c * 7 ** d; return n >= 60 && n <= 5000 && [a, b, c, d].filter(Boolean).length >= 2; },
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [2 ** a * 3 ** b * 5 ** c * 7 ** d]}),
        verify: ({a, b, c, d}, v) => 2 ** v[0] * 3 ** v[1] * 5 ** v[2] * 7 ** v[3] === 2 ** a * 3 ** b * 5 ** c * 7 ** d,
        build: ({a, b, c, d}) => {
          const n = 2 ** a * 3 ** b * 5 ** c * 7 ** d;
          const steps = []; let m = n;
          for (const p of [2, 3, 5, 7]) while (m % p === 0) { steps.push(`${fr(m)} = ${p} × ${fr(m / p)}`); m /= p; }
          const factors = [...Array(a).fill(2), ...Array(b).fill(3), ...Array(c).fill(5), ...Array(d).fill(7)];
          return item('Décomposer en facteurs premiers', `Décompose ${fr(n)} en produit de facteurs premiers, sous la forme 2<sup>a</sup> × 3<sup>b</sup> × 5<sup>c</sup> × 7<sup>d</sup>. Un exposant peut être nul.`,
            [Q('Exposant de 2', a), Q('Exposant de 3', b), Q('Exposant de 5', c), Q('Exposant de 7', d)],
            C('on divise successivement par les nombres premiers 2, 3, 5 puis 7, tant que la division tombe juste.',
              [steps.join(' ; ') + '.', `${fr(n)} = ${factors.join(' × ')}.`],
              `${fr(n)} = 2${sup(a)} × 3${sup(b)} × 5${sup(c)} × 7${sup(d)} : a = ${a}, b = ${b}, c = ${c} et d = ${d}.`),
            'Commence par diviser par 2 autant de fois que possible, puis passe à 3, 5 et 7.');
        }
      }),
      T({ // Fraction irréductible
        base: {p: 3, q: 4, k: 6},
        params: r => ({p: r.int(1, 15), q: r.int(2, 16), k: r.int(2, 12)}),
        accept: ({p, q, k}) => gcd(p, q) === 1 && p !== q && p * k <= 200 && q * k <= 200,
        difficulty: ({p, q, k}) => score({steps: 2, values: [p * k, q * k]}),
        verify: ({p, q, k}, v) => v[0] * q * k === v[1] * p * k && gcd(v[0], v[1]) === 1 && v[1] > 0,
        build: ({p, q, k}) => item('Rendre une fraction irréductible', `Rends la fraction ${p * k}/${q * k} irréductible. Donne le numérateur puis le dénominateur de la fraction obtenue.`,
          [Q('Numérateur', p), Q('Dénominateur', q)],
          C('on cherche le plus grand diviseur commun du numérateur et du dénominateur, puis on divise les deux par ce nombre.',
            [`${p * k} = ${k} × ${p} et ${q * k} = ${k} × ${q}.`, `${p} et ${q} n’ont plus de diviseur commun autre que 1.`],
            `${p * k}/${q * k} = ${p}/${q}, fraction irréductible.`),
          'Décompose le numérateur et le dénominateur, puis supprime les facteurs communs.')
      }),
      T({ // Nombre premier ou non
        base: {kind: 1, n: 91},
        params: r => {
          const kind = r.int(0, 1);
          const primes = []; for (let n = 53; n <= 199; n += 2) if (isPrime(n)) primes.push(n);
          const composite = [49, 51, 57, 77, 87, 91, 111, 117, 119, 121, 129, 133, 141, 143, 153, 161, 169, 171, 177, 183, 187, 189];
          return {kind, n: r.pick(kind ? composite : primes)};
        },
        difficulty: ({n}) => score({steps: 2, values: [n]}),
        verify: ({n}, v) => (v[0] === 'oui') === isPrime(n) && v[1] === smallest(n),
        build: ({n}) => {
          const prime = isPrime(n), d = smallest(n), tried = [2, 3, 5, 7, 11, 13].filter(p => p * p <= n);
          return item('Reconnaître un nombre premier', `Le nombre ${n} est-il premier ? Donne aussi son plus petit diviseur premier.`,
            [S(`${n} est-il premier ?`, prime ? 'oui' : 'non', ['oui', 'non']), Q('Plus petit diviseur premier', d)],
            C('un nombre est premier s’il a exactement deux diviseurs : 1 et lui-même. On teste les nombres premiers dont le carré ne dépasse pas ce nombre.',
              [prime ? `Ni ${tried.join(', ni ')} ne divisent ${n}, et ${[11, 13, 17][[7, 11, 13].indexOf(tried[tried.length - 1])]}² = ${[11, 13, 17][[7, 11, 13].indexOf(tried[tried.length - 1])] ** 2} dépasse déjà ${n}.` : `${n} = ${d} × ${n / d}, et les nombres premiers plus petits que ${d} ne divisent pas ${n}.`],
              prime ? `${n} est premier ; son plus petit diviseur premier est ${n} lui-même.` : `${n} n’est pas premier ; son plus petit diviseur premier est ${d}.`),
            'Teste 2, 3, 5, 7, 11 et 13. La somme des chiffres renseigne sur la divisibilité par 3.');
        }
      }),
      T({ // Bouquets identiques
        base: {g: 12, p: 4, q: 3},
        params: r => ({g: r.int(2, 15), p: r.int(2, 9), q: r.int(2, 9)}),
        accept: ({g, p, q}) => gcd(p, q) === 1 && p !== q && g * p <= 200 && g * q <= 200,
        difficulty: ({g, p, q}) => score({steps: 3, values: [g * p, g * q]}),
        verify: ({g, p, q}, v) => v[0] === gcd(g * p, g * q) && v[0] * v[1] === g * p && v[0] * v[2] === g * q,
        build: ({g, p, q}) => { const A = g * p, B = g * q; return item('Former des lots identiques', `Un fleuriste dispose de ${A} roses et de ${B} tulipes. Il veut composer le plus grand nombre possible de bouquets identiques en utilisant toutes les fleurs.`,
          [Q('Nombre de bouquets', g), Q('Roses par bouquet', p), Q('Tulipes par bouquet', q)],
          C('le nombre de bouquets divise à la fois le nombre de roses et le nombre de tulipes ; on prend le plus grand diviseur commun.',
            [`${A} = ${g} × ${p} et ${B} = ${g} × ${q}, avec ${p} et ${q} sans diviseur commun autre que 1 : le plus grand diviseur commun est ${g}.`, `${A} ÷ ${g} = ${p} et ${B} ÷ ${g} = ${q}.`],
            `il peut composer ${g} bouquets de ${p} roses et ${q} tulipes.`),
          'Cherche un diviseur commun à ' + A + ' et ' + B + ', le plus grand possible.'); }
      }),
      T({ // Phares et multiples communs
        base: {a: 6, b: 8},
        params: r => ({a: r.int(4, 20), b: r.int(5, 30)}),
        accept: ({a, b}) => a < b && b % a !== 0 && gcd(a, b) > 1 && lcm(a, b) <= 300,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, lcm(a, b)]}),
        verify: ({a, b}, v) => v[0] % a === 0 && v[0] % b === 0 && v[0] === lcm(a, b) && v[1] * a === v[0],
        build: ({a, b}) => { const m = lcm(a, b); return item('Retrouver un multiple commun', `Deux phares s’allument ensemble à minuit. Le premier s’allume toutes les ${a} secondes, le second toutes les ${b} secondes.`,
          [Q('Secondes avant le prochain allumage commun', m), Q('Allumages du premier phare pendant ce temps', m / a)],
          C('les deux phares s’allument ensemble aux multiples communs de ' + a + ' et de ' + b + ' ; on cherche le plus petit multiple commun non nul.',
            [`Multiples de ${b} : ${[1, 2, 3, 4].map(k => b * k).join(', ')}… Le premier qui est aussi multiple de ${a} est ${m}.`, `${m} ÷ ${a} = ${m / a}.`],
            `ils se rallument ensemble ${m} secondes plus tard ; le premier phare s’est allumé ${m / a} fois pendant cette durée (sans compter minuit).`),
          'Écris les multiples du plus grand des deux nombres et teste-les.'); }
      }),
      T({ // Division euclidienne
        base: {a: 350, b: 12},
        params: r => ({a: r.int(100, 999), b: r.int(6, 24)}),
        accept: ({a, b}) => a % b !== 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b]}),
        verify: ({a, b}, v) => v[0] * b + v[1] === a && v[1] >= 0 && v[1] < b,
        build: ({a, b}) => { const q = Math.floor(a / b), rest = a % b; return item('Effectuer une division euclidienne', `On range ${a} œufs dans des boîtes de ${b}. Toutes les boîtes remplies sont complètes.`,
          [Q('Nombre de boîtes pleines', q), Q('Œufs restants', rest)],
          C('on effectue la division euclidienne de ' + a + ' par ' + b + ' : a = b × q + r avec 0 ≤ r < b.',
            [`${b} × ${q} = ${b * q} et ${a} ${M} ${b * q} = ${rest}.`, `${a} = ${b} × ${q} + ${rest}, avec ${rest} < ${b}.`],
            `on remplit ${q} boîtes et il reste ${rest} œufs.`),
          'Le reste doit être strictement inférieur à ' + b + '.'); }
      })
    ],

    /* ---------- 02 · Fractions et nombres relatifs ---------- */
  };

  const basics = {
    '3-arithmetique': ['Un diviseur de n est un entier qui donne une division exacte de n.', 'Combien de fois 6 tient-il dans 42 ?', '7', '6 × 7 = 42.'],
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
