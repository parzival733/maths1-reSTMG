/* Série 2-arithmetique : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-arithmetique': [
      T({ // Multiple ou non
        base: {kind: 1, b: 7, q: 13, r: 3},
        params: r => ({kind: r.int(0, 1), b: r.int(3, 19), q: r.int(8, 60), r: r.int(1, 18)}),
        accept: ({b, r}) => r < b,
        difficulty: ({b, q}) => score({steps: 2, values: [b * q]}),
        verify: ({kind, b, q, r}, v) => { const a = b * q + (kind ? r : 0); return (v[0] === 'oui') === (a % b === 0) && v[1] === a % b; },
        build: ({kind, b, q, r}) => { const a = b * q + (kind ? r : 0), rest = a % b;
          return item('Reconnaître un multiple', `Le nombre ${a} est-il un multiple de ${b} ? Donne aussi le reste de la division euclidienne de ${a} par ${b}.`,
            [S(`${a} est-il multiple de ${b} ?`, rest ? 'non' : 'oui', ['oui', 'non']), Q('Reste', rest)],
            C(`a est multiple de b s’il existe un entier k tel que a = k × b, c’est-à-dire si le reste de la division de a par b est nul.`,
              [rest ? `${a} = ${b} × ${Math.floor(a / b)} + ${rest}.` : `${a} = ${b} × ${q}, reste nul.`],
              rest ? `le reste vaut ${rest} : ${a} n’est pas un multiple de ${b}.` : `${a} = ${b} × ${q} : c’est un multiple de ${b}.`),
            'Effectue la division euclidienne.'); }
      }),
      T({ // Plus grand multiple inférieur
        base: {a: 13, b: 200},
        params: r => ({a: r.int(6, 40), b: r.int(100, 999)}),
        accept: ({a, b}) => b % a !== 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b]}),
        verify: ({a, b}, v) => v[1] === a * v[0] && v[1] <= b && v[1] + a > b,
        build: ({a, b}) => { const k = Math.floor(b / a);
          return item('Trouver le plus grand multiple inférieur', `Détermine le plus grand multiple de ${a} inférieur ou égal à ${b}, sous la forme ${a} × k.`,
            [Q('Valeur de k', k), Q('Multiple obtenu', a * k)],
            C('k est le quotient de la division euclidienne de ' + b + ' par ' + a + '.',
              [`${b} = ${a} × ${k} + ${b - a * k}, avec ${b - a * k} < ${a}.`, `${a} × ${k + 1} = ${a * (k + 1)} dépasse ${b}.`],
              `le plus grand multiple de ${a} inférieur ou égal à ${b} est ${a * k}.`),
            'Un algorithme le trouve en ajoutant ' + a + ' tant que le résultat ne dépasse pas ' + b + '.'); }
      }),
      T({ // Carré d'un impair
        base: {k: 6},
        params: r => ({k: r.int(3, 60)}),
        difficulty: () => score({steps: 3, values: [50]}),
        verify: ({k}, v) => 2 * v[0] + 1 === 2 * k + 1 && 2 * v[1] + 1 === (2 * k + 1) ** 2,
        build: ({k}) => { const n = 2 * k + 1, m = 2 * k * k + 2 * k;
          return item('Démontrer qu’un carré impair est impair', `n = ${n} est impair : n = 2k + 1. On démontre que n² s’écrit 2m + 1, avec m entier.`,
            [Q('Valeur de k', k), Q('Valeur de m', m)],
            C('si n = 2k + 1, alors n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1 : n² est impair, avec m = 2k² + 2k.',
              [`${n} = 2 × ${k} + 1.`, `m = 2 × ${k}² + 2 × ${k} = ${m}, et 2 × ${m} + 1 = ${n * n} = ${n}².`],
              `k = ${k} et m = ${m}.`),
            'Développe (2k + 1)², puis factorise 2 dans les premiers termes.'); }
      }),
      T({ // Fraction irréductible
        base: {p: 7, q: 12, k: 18},
        params: r => ({p: r.int(2, 30), q: r.int(3, 40), k: r.int(6, 40)}),
        accept: ({p, q, k}) => gcd(p, q) === 1 && p !== q && p * k <= 999 && q * k <= 999,
        difficulty: ({p, q, k}) => score({steps: 3, values: [p * k, q * k], fractions: true}),
        verify: ({p, q, k}, v) => v[0] * q === v[1] * p && gcd(v[0], v[1]) === 1 && v[1] > 0,
        build: ({p, q, k}) => item('Écrire une fraction sous forme irréductible', `Écris ${p * k}/${q * k} sous forme irréductible.`,
          [Q('Numérateur', p), Q('Dénominateur', q)],
          C('on divise numérateur et dénominateur par leur plus grand diviseur commun.',
            [`${p * k} = ${k} × ${p} et ${q * k} = ${k} × ${q}, et ${p} et ${q} n’ont pas d’autre diviseur commun que 1.`],
            `${p * k}/${q * k} = ${p}/${q}.`),
          'Décompose les deux nombres en produits de facteurs premiers.')
      }),
      T({ // Tester la primalité
        base: {kind: 1, n: 221},
        params: r => { const kind = r.int(0, 1); const primes = [], comp = [];
          for (let n = 151; n <= 499; n += 2) { if (isPrime(n)) primes.push(n); else if (n % 3 && n % 5) comp.push(n); }
          return {kind, n: r.pick(kind ? comp : primes)}; },
        difficulty: ({n}) => score({steps: 3, values: [n]}),
        verify: ({n}, v) => (v[0] === 'oui') === isPrime(n) && v[1] === smallest(n),
        build: ({n}) => { const p = isPrime(n), d = smallest(n), lim = Math.floor(Math.sqrt(n));
          return item('Tester si un nombre est premier', `Le nombre ${n} est-il premier ? Donne son plus petit diviseur premier.`,
            [S(`${n} est-il premier ?`, p ? 'oui' : 'non', ['oui', 'non']), Q('Plus petit diviseur premier', d)],
            C(`il suffit de tester les nombres premiers inférieurs ou égaux à √${n} ≈ ${fr(r2(Math.sqrt(n), 1))}.`,
              [p ? `Aucun nombre premier jusqu’à ${lim} ne divise ${n}.` : `${n} = ${d} × ${n / d}.`],
              p ? `${n} est premier.` : `${n} n’est pas premier ; son plus petit diviseur premier est ${d}.`),
            'Si n n’est pas premier, il a un diviseur premier p tel que p² ≤ n.'); }
      }),
      T({ // Multiples dans un intervalle
        base: {a: 7, A: 50, B: 130},
        params: r => ({a: r.int(3, 25), A: r.int(20, 300), B: r.int(100, 900)}),
        accept: ({a, A, B}) => B - A >= 3 * a && A % a !== 0,
        difficulty: ({a, B}) => score({steps: 3, values: [a, B]}),
        verify: ({a, A, B}, v) => v[0] % a === 0 && v[0] >= A && v[0] - a < A && v[1] === Math.floor(B / a) - Math.floor((A - 1) / a),
        build: ({a, A, B}) => { const first = Math.ceil(A / a) * a, last = Math.floor(B / a) * a, n = (last - first) / a + 1;
          return item('Compter des multiples', `On s’intéresse aux multiples de ${a} compris entre ${A} et ${B} (inclus).`,
            [Q('Plus petit de ces multiples', first), Q('Nombre de ces multiples', n)],
            C('les multiples de ' + a + ' sont régulièrement espacés de ' + a + ' : on repère le premier et le dernier, puis on compte les pas.',
              [`Premier : ${a} × ${first / a} = ${first}. Dernier : ${a} × ${last / a} = ${last}.`, `Nombre : ${last / a} ${M} ${first / a} + 1 = ${n}.`],
              `le premier est ${first} et il y en a ${n}.`),
            'N’oublie pas de compter le premier multiple : ajoute 1.'); }
      })
    ],

    /* ---------- 02 · Nombres réels ---------- */
  };

  const basics = {
    '2-arithmetique': ['a est multiple de b s’il existe un entier k tel que a = kb.', '91 est-il premier ? Donne son plus petit diviseur.', '7', '91 = 7 × 13.'],
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
