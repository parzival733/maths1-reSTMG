/* Série 2-fonctions : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-fonctions': [
      T({ // Ensemble de définition
        base: {a: 3, b: -2},
        params: r => ({a: r.nonZero(1, 12), b: r.nonZero(1, 12)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], negatives: true}),
        verify: ({a, b}, v) => v[0] === a && v[1] === b,
        build: ({a, b}) => item('Déterminer un ensemble de définition', `f(x) = 1/(x ${a > 0 ? M : '+'} ${Math.abs(a)}) et g(x) = √(x ${b > 0 ? M : '+'} ${Math.abs(b)}).`,
          [Q('Valeur interdite pour f', a), Q('Plus petite valeur où g est définie', b)],
          C('on ne divise pas par 0, et on ne prend la racine carrée que d’un nombre positif ou nul.',
            [`x ${a > 0 ? M : '+'} ${Math.abs(a)} = 0 pour x = ${fr(a)} : f est définie sur ℝ privé de ${fr(a)}.`, `x ${b > 0 ? M : '+'} ${Math.abs(b)} ≥ 0 pour x ≥ ${fr(b)} : g est définie sur [${fr(b)} ; +∞[.`],
            `la valeur interdite de f est ${fr(a)} ; g est définie à partir de ${fr(b)}.`),
          'Cherche ce qui rend le calcul impossible.')
      }),
      T({ // Point sur une courbe
        base: {a: 2, b: 1, c: 3, x: 2, on: 1, k: 1},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-6, 6), c: r.nonZero(1, 6), x: r.int(-5, 6), on: r.int(0, 1), k: r.nonZero(1, 3)}),
        accept: ({x, c}) => x + c !== 0 && x !== 0,
        difficulty: ({a, b, c, x}) => score({steps: 2, values: [(a * x + b) / (x + c)], fractions: true}),
        verify: ({a, b, c, x, on, k}, v) => { const y = (a * x + b) / (x + c); return close(v[0], y) && (v[1] === 'oui') === !!on; },
        build: ({a, b, c, x, on, k}) => { const y = (a * x + b) / (x + c), yp = on ? y : y + k;
          return item('Exploiter l’équation d’une courbe', `f(x) = (${lin(a, b)})/(x${sg(c)}). Le point M(${fr(x)} ; ${frac(Math.round(yp * (x + c)), x + c)}) est-il sur la courbe de f ?`,
            [Q(`f(${fr(x)})`, y), S('M est-il sur la courbe ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('M(x ; y) appartient à la courbe de f si et seulement si y = f(x).',
              [`f(${fr(x)}) = (${fr(a)} × ${pa(x)}${sg(b)}) ÷ (${fr(x)}${sg(c)}) = ${frac(a * x + b, x + c)}.`],
              on ? 'les coordonnées vérifient y = f(x) : M est sur la courbe.' : 'y ≠ f(x) : M n’est pas sur la courbe.'),
            'Compare l’ordonnée de M avec l’image de son abscisse.'); }
      }),
      T({ // Parité
        base: {kind: 0, a: 2, b: 3},
        params: r => ({kind: r.int(0, 2), a: r.nonZero(1, 5), b: r.nonZero(1, 6)}),
        difficulty: ({a, b}) => score({steps: 2, values: [8 * a + 2 * b], negatives: true}),
        verify: ({kind, a, b}, v) => { const f = x => [a * x * x + b, a * x ** 3 + b * x, a * x * x + b * x][kind]; return v[0] === f(2) && v[1] === f(-2) && v[2] === ['paire', 'impaire', 'ni paire ni impaire'][kind]; },
        build: ({kind, a, b}) => { const expr = [quad(a, 0, b), fmt.poly([a, 0, b, 0]), quad(a, b, 0)][kind], f = x => [a * x * x + b, a * x ** 3 + b * x, a * x * x + b * x][kind];
          return item('Étudier la parité d’une fonction', `f(x) = ${expr}, définie sur ℝ. Calcule f(2) et f(${M}2), puis indique si f est paire, impaire ou ni l’une ni l’autre.`,
            [Q('f(2)', f(2)), Q('f(−2)', f(-2)), S('f est', ['paire', 'impaire', 'ni paire ni impaire'][kind], ['paire', 'impaire', 'ni paire ni impaire'])],
            C('f est paire si f(−x) = f(x) pour tout x (courbe symétrique par rapport à l’axe des ordonnées) ; impaire si f(−x) = −f(x) (symétrie par rapport à l’origine).',
              [['f(−x) = ' + expr + ' = f(x).', 'f(−x) = −(' + expr + ') = −f(x).', `f(2) = ${fr(f(2))} et f(${M}2) = ${fr(f(-2))} : ni égaux, ni opposés.`][kind]],
              `f est ${['paire', 'impaire', 'ni paire ni impaire'][kind]}.`),
            'Remplace x par −x dans l’expression.'); }
      }),
      T({ // f(x) = k avec la fonction carré décalée
        base: {c: 4, k: 12},
        params: r => ({c: r.int(1, 20), k: r.int(-10, 60)}),
        accept: ({c, k}) => k + c > 0 && Number.isInteger(Math.sqrt(k + c)) && k + c > 1,
        difficulty: ({c, k}) => score({steps: 2, values: [c, k]}),
        verify: ({c, k}, v) => close(v[0] * v[0] - c, k) && close(v[1] * v[1] - c, k) && v[0] < v[1],
        build: ({c, k}) => { const s = Math.sqrt(k + c);
          return item('Résoudre f(x) = k', `f(x) = x² ${M} ${c}. Résous l’équation f(x) = ${fr(k)}.`,
            [Q('Plus petite solution', -s), Q('Plus grande solution', s)],
            C('on se ramène à x² = a, puis on utilise la fonction carré.',
              [`x² ${M} ${c} = ${fr(k)} donne x² = ${k + c}.`, `x = ${s} ou x = ${M}${s}.`],
              `S = {${M}${s} ; ${s}}.`),
            'Sur la courbe, ce sont les abscisses des points d’ordonnée ' + fr(k) + '.'); }
      }),
      T({ // f(x) < g(x) pour deux fonctions affines
        base: {a: 3, b: -1, c: 1, d: 5},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-9, 9), c: r.nonZero(1, 6), d: r.int(-9, 9)}),
        accept: ({a, c, b, d}) => a !== c && (d - b) % (a - c) === 0 && b !== d,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a - c, d - b], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === (d - b) / (a - c) && (v[1] === 'x < frontière') === (a - c > 0),
        build: ({a, b, c, d}) => { const s = (d - b) / (a - c), k = a - c;
          return item('Comparer deux fonctions', `f(x) = ${lin(a, b)} et g(x) = ${lin(c, d)}. Résous f(x) < g(x) : sur quel intervalle la courbe de f est-elle sous celle de g ?`,
            [Q('Abscisse du point d’intersection', s), S('La courbe de f est sous celle de g pour', k > 0 ? 'x < frontière' : 'x > frontière', ['x < frontière', 'x > frontière'])],
            C('f(x) < g(x) équivaut à (a − c)x < d − b.',
              [`${mono(k)} < ${fr(d - b)}.`, k > 0 ? `x < ${fr(s)}.` : `On divise par ${fr(k)} < 0 : x > ${fr(s)}.`],
              `f(x) < g(x) pour x ${k > 0 ? '<' : '>'} ${fr(s)}.`),
            'Regroupe les termes en x.'); }
      }),
      T({ // Modéliser une aire
        base: {P: 20, k: 3},
        params: r => ({P: 2 * r.int(5, 40), k: r.int(1, 15)}),
        accept: ({P, k}) => k < P / 2,
        difficulty: ({P, k}) => score({steps: 3, values: [k * (P / 2 - k)]}),
        verify: ({P, k}, v) => v[0] === P / 2 && v[1] === k * (P / 2 - k),
        build: ({P, k}) => { const h = P / 2;
          return item('Modéliser par une fonction', `Un rectangle a un périmètre de ${P} cm. On note x sa largeur, en cm, et A(x) son aire : A(x) = x(${h} ${M} x).`,
            [Q('Borne supérieure de l’ensemble de définition', h), Q(`A(${k}), en cm²`, k * (h - k))],
            C('la longueur vaut ' + h + ' − x, et doit être positive : x ∈ ]0 ; ' + h + '[.',
              [`A(${k}) = ${k} × (${h} ${M} ${k}) = ${k * (h - k)}.`],
              `A est définie sur ]0 ; ${h}[ et A(${k}) = ${k * (h - k)} cm².`),
            'Demi-périmètre = longueur + largeur.'); }
      })
    ],

    /* ---------- 09 · Fonctions de référence ---------- */
  };

  const basics = {
    '2-fonctions': ['Un point est sur la courbe de f si son ordonnée est l’image de son abscisse.', 'f(x) = x² : f(−3) ?', '9', '(−3)² = 9.'],
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
    '2-fonctions': [null, null,
      ({kind, a, b}) => { const f = x => [a * x * x + b, a * x ** 3 + b * x, a * x * x + b * x][kind], src = [`(${a})*x^2+(${b})`, `(${a})*x^3+(${b})*x`, `(${a})*x^2+(${b})*x`][kind];
        const titre = f(2) === f(-2) ? `f(−2) = f(2) : la courbe est symétrique par rapport à l’axe des ordonnées` : f(2) === -f(-2) ? `f(−2) = −f(2) : la courbe est symétrique par rapport à l’origine` : `f(−2) n’est égal ni à f(2) ni à −f(2) : la courbe n’a aucune de ces deux symétries`;
        return {c: FG.repere(titre, cadre([f], -2.6, 2.6, {hauteur: 280})).courbe(src).lecture(2, f(2)).lecture(-2, f(-2)).description()}; },
      ({c, k}) => { const s = Math.sqrt(k + c), src = `x^2-(${c})`;
        return {c: FG.repere(`La droite y = ${fr(k)} coupe la courbe de f en deux points : deux solutions`, {xmin: -s - 2, xmax: s + 2, ymin: Math.min(-c, 0) - 0.08 * (k + c), ymax: Math.max(k, 0) + 0.25 * (k + c), hauteur: 280})
          .courbe(src, {nom: 'C_f'}).antecedents(k, {f: src}).description()}; },
      ({a, b, c, d}) => { const s = (d - b) / (a - c), x1 = Math.min(0, s) - 3, x2 = Math.max(0, s) + 3;
        return {c: FG.repere(`La courbe de f est sous celle de g ${a > c ? 'avant' : 'après'} le point d’intersection, d’abscisse ${fr(s)}`, cadre([x => a * x + b, x => c * x + d], x1, x2, {hauteur: 280}))
          .droite_affine(a, b, {nom: 'f'}).droite_affine(c, d, {nom: 'g', pointilles: true}).lecture(s, a * s + b, {vy: false}).intervalle_solutions(a > c ? null : s, a > c ? s : null, {ouvert_a: true, ouvert_b: true}).description()}; },
      ({P, k}) => { const h = P / 2;
        return {c: FG.repere(`Aire A(x) du rectangle selon sa largeur x, pour x entre 0 et ${fr(h)}`, {xmin: 0, xmax: h, ymin: 0, ymax: 1.12 * h * h / 4, nom_x: 'x (cm)', nom_y: 'aire (cm²)', hauteur: 260})
          .courbe(`x*(${h}-x)`).lecture(k, k * (h - k)).description()}; }
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
