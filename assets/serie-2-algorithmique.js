/* Série 2-algorithmique : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-algorithmique': [
      T({ // Fonction Python
        base: {a: 3, b: -2, c: 1, n: 2},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-6, 6), c: r.int(-9, 9), n: r.int(-5, 6)}),
        accept: ({b, c, n}) => b !== 0 && c !== 0 && n !== 0,
        difficulty: ({a, b, c, n}) => score({steps: 2, values: [a * n * n + b * n + c], negatives: true}),
        verify: ({a, b, c, n}, v) => v[0] === a * n * n + b * n + c && v[1] === a * 4 - b * 2 + c,
        build: ({a, b, c, n}) => item('Exécuter une fonction Python', 'On considère la fonction suivante.' + py(['def f(x):', `    return ${pyTerm(a, 'x**2', true)} ${pyTerm(b, 'x')} ${pyTerm(c, '')}`]),
          [Q(`Valeur renvoyée par f(${fr(n)})`, a * n * n + b * n + c), Q('Valeur renvoyée par f(−2)', a * 4 - b * 2 + c)],
          C('x**2 est le carré de x ; on remplace x par la valeur de l’argument.',
            [`f(${fr(n)}) = ${fr(a)} × ${pa(n)}² + ${pa(b)} × ${pa(n)} + ${pa(c)} = ${fr(a * n * n + b * n + c)}.`, `f(${M}2) = ${fr(a)} × 4 + ${pa(b)} × (${M}2) + ${pa(c)} = ${fr(a * 4 - b * 2 + c)}.`],
            `${fr(a * n * n + b * n + c)} et ${fr(a * 4 - b * 2 + c)}.`),
          'Respecte les priorités : la puissance avant la multiplication.')
      }),
      T({ // Boucle while
        base: {u: 5, q: 2, M: 300},
        params: r => ({u: r.int(1, 20), q: r.pick([2, 3, 1.5]), M: 50 * r.int(2, 40)}),
        accept: ({u, M}) => M > 4 * u,
        difficulty: ({u, q, M}) => { let x = u, n = 0; while (x < M) { x *= q; n++; } return score({steps: 3, values: [n, M]}); },
        verify: ({u, q, M}, v) => close(u * q ** v[0], v[1]) && v[1] >= M && u * q ** (v[0] - 1) < M,
        build: ({u, q, M}) => { let x = u, n = 0; const seen = [u]; while (x < M) { x *= q; n++; seen.push(r2(x, 4)); }
          return item('Suivre une boucle non bornée', 'On exécute le programme suivant.' + py([`u = ${u}`, 'n = 0', `while u < ${M}:`, `    u = u * ${q}`, '    n = n + 1']),
            [Q('Valeur finale de n', n), Q('Valeur finale de u', x, 4)],
            C('la boucle tourne tant que la condition u < ' + M + ' est vraie ; elle s’arrête dès que u atteint ou dépasse ' + M + '.',
              [`Valeurs successives de u : ${seen.map(s => fr(s)).join(' ; ')}.`],
              `n = ${n} et u = ${fr(r2(x, 4))}.`),
            'Dresse un tableau des valeurs de n et u.'); }
      }),
      T({ // Boucle for
        base: {a: 1, b: 6, k: 2},
        params: r => ({a: r.int(0, 5), b: r.int(6, 15), k: r.int(1, 3)}),
        difficulty: ({a, b, k}) => { let s = 0; for (let i = a; i < b; i++) s += k * i; return score({steps: 2, values: [s, b - a]}); },
        verify: ({a, b, k}, v) => { let s = 0; for (let i = a; i < b; i++) s += k * i; return v[0] === b - a && v[1] === s; },
        build: ({a, b, k}) => { let s = 0; const terms = []; for (let i = a; i < b; i++) { s += k * i; terms.push(k * i); }
          return item('Suivre une boucle bornée', 'On exécute le programme suivant.' + py(['s = 0', `for i in range(${a}, ${b}):`, `    s = s + ${k}*i`]),
            [Q('Nombre de tours de boucle', b - a), Q('Valeur finale de s', s)],
            C(`range(${a}, ${b}) parcourt les entiers de ${a} à ${b - 1} : le dernier, ${b}, est exclu.`,
              [`s = ${terms.join(' + ')} = ${s}.`],
              `${b - a} tours et s = ${s}.`),
            'range(a, b) s’arrête juste avant b.'); }
      }),
      T({ // Conditions et booléens
        base: {v: [3, 8, 12, 7, 15, 10, 4], s: 6},
        params: r => ({v: Array.from({length: 7}, () => r.int(1, 30)), s: r.int(5, 20)}),
        accept: ({v, s}) => { const a = v.filter(x => x > s && x % 2 === 0).length, o = v.filter(x => x > s || x % 2 === 0).length; return a >= 1 && o > a && o < 7; },
        difficulty: () => score({steps: 2, values: [7]}),
        verify: ({v, s}, w) => w[0] === v.filter(x => x > s && x % 2 === 0).length && w[1] === v.filter(x => x > s || x % 2 === 0).length,
        build: ({v, s}) => { const and = v.filter(x => x > s && x % 2 === 0), or = v.filter(x => x > s || x % 2 === 0);
          return item('Utiliser ET et OU', `Liste : ${v.join(' ; ')}. On compte les nombres x tels que ${code(`x > ${s} and x % 2 == 0`)}, puis ceux tels que ${code(`x > ${s} or x % 2 == 0`)}.`,
            [Q('Nombre avec « and »', and.length), Q('Nombre avec « or »', or.length)],
            C('« and » exige les deux conditions ; « or » en exige au moins une. x % 2 == 0 signifie que x est pair.',
              [`ET : ${and.join(' ; ')}.`, `OU : ${or.join(' ; ')}.`],
              `${and.length} avec « and », ${or.length} avec « or ».`),
            'Teste chaque nombre de la liste.'); }
      }),
      T({ // Implication et réciproque
        base: {a: 6, b: 3, kind: 1},
        params: r => { const kind = r.int(0, 1), x = r.int(2, 9), m = r.int(2, 5); return kind ? {a: x * m, b: x, kind} : {a: x, b: x * m, kind}; },
        accept: ({a, b}) => a !== b,
        difficulty: () => score({steps: 2, values: [40]}),
        verify: ({a, b}, v) => (v[0] === 'vraie') === (a % b === 0) && (v[1] === 'vraie') === (b % a === 0) && v[2] === lcm(a, b),
        build: ({a, b}) => { const imp = a % b === 0, rec = b % a === 0, L = lcm(a, b);
          return item('Étudier une implication', `Proposition P : « si un entier n est multiple de ${a}, alors n est multiple de ${b} ».`,
            [S('P est', imp ? 'vraie' : 'fausse', ['vraie', 'fausse']), S('Sa réciproque est', rec ? 'vraie' : 'fausse', ['vraie', 'fausse']), Q(`Plus petit entier positif multiple de ${a} et de ${b}`, L)],
            C('une implication « si A alors B » est fausse dès qu’un contre-exemple vérifie A sans vérifier B.',
              [imp ? `${a} = ${b} × ${a / b} : tout multiple de ${a} est multiple de ${b}.` : `${a} est multiple de ${a} mais pas de ${b} : contre-exemple.`,
               `Réciproque : « si n est multiple de ${b}, alors n est multiple de ${a} ». ${rec ? 'Elle est vraie.' : `${b} en est un contre-exemple.`}`],
              `P est ${imp ? 'vraie' : 'fausse'}, sa réciproque est ${rec ? 'vraie' : 'fausse'}.`),
            'Cherche un contre-exemple simple : le nombre lui-même.'); }
      }),
      T({ // Affectations successives
        base: {a: 3, b: 5},
        params: r => ({a: r.int(-9, 9), b: r.int(-9, 9)}),
        accept: ({a, b}) => a !== b && a !== 0 && b !== 0,
        difficulty: ({a, b}) => score({steps: 3, values: [a * (a + b)], negatives: true}),
        verify: ({a, b}, v) => { let x = a, y = b; y = x + y; x = x * y; y = x - y; return v[0] === x && v[1] === y; },
        build: ({a, b}) => { let x = a, y = b; y = x + y; const y1 = y; x = x * y; y = x - y;
          return item('Exécuter des affectations', 'On exécute les instructions suivantes, dans l’ordre.' + py([`a = ${a}`, `b = ${b}`, 'b = a + b', 'a = a * b', 'b = a - b']),
            [Q('Valeur finale de a', x), Q('Valeur finale de b', y)],
            C('chaque affectation utilise les valeurs des variables au moment où elle est exécutée.',
              [`b = ${fr(a)} + ${pa(b)} = ${fr(y1)} ; a = ${fr(a)} × ${pa(y1)} = ${fr(x)} ; b = ${fr(x)} ${M} ${pa(y1)} = ${fr(y)}.`],
              `a = ${fr(x)} et b = ${fr(y)}.`),
            'Note les valeurs après chaque ligne.'); }
      })
    ]
  };

  const basics = {
    '2-algorithmique': ['Exécute le programme ligne par ligne en notant les variables.', 'x = 3 puis x = x * 2 + 1 : que vaut x ?', '7', '3 × 2 + 1.']
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
