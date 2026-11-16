/* Série 2-variations : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-variations': [
      T({ // Extremum d'une fonction du second degré
        base: {a: 1, al: 2, be: -3},
        params: r => ({a: r.nonZero(1, 3), al: r.int(-5, 5), be: r.int(-9, 9)}),
        accept: ({al, be}) => al !== 0 && be !== 0,
        difficulty: ({a, al, be}) => score({steps: 3, values: [a, al, be], negatives: true}),
        verify: ({a, al, be}, v) => v[0] === al && v[1] === be && (v[2] === 'minimum') === (a > 0),
        build: ({a, al, be}) => { const b = -2 * a * al, c = a * al * al + be;
          return item('Déterminer un extremum', `f(x) = ${a === 1 ? '' : a === -1 ? M : fr(a)}(x${sg(-al)})²${sg(be)}, soit f(x) = ${quad(a, b, c)}.`,
            [Q('Abscisse de l’extremum', al), Q('Valeur de l’extremum', be), S('Il s’agit d’un', a > 0 ? 'minimum' : 'maximum', ['minimum', 'maximum'])],
            C('un carré est toujours positif ou nul : (x − ' + pa(al) + ')² ≥ 0, avec égalité pour x = ' + fr(al) + '.',
              [a > 0 ? `f(x) ≥ ${fr(be)} pour tout x, et f(${fr(al)}) = ${fr(be)}.` : `f(x) ≤ ${fr(be)} pour tout x, car a = ${fr(a)} < 0, et f(${fr(al)}) = ${fr(be)}.`],
              `f admet un ${a > 0 ? 'minimum' : 'maximum'} égal à ${fr(be)}, atteint en x = ${fr(al)}.`),
            'Utilise la forme avec le carré.'); }
      }),
      T({ // Taux d'accroissement
        base: {x1: 1, y1: 4, x2: 5, m: -2},
        params: r => ({x1: r.int(-6, 4), y1: r.int(-12, 12), x2: r.int(1, 10), m: r.nonZero(1, 4)}),
        accept: ({x1, x2}) => x2 > x1,
        difficulty: ({m}) => score({steps: 2, values: [m, 20], negatives: true}),
        verify: ({x1, y1, x2, m}, v) => close(v[0], m) && (v[1] === 'croissante') === (m > 0),
        build: ({x1, y1, x2, m}) => { const y2 = y1 + m * (x2 - x1);
          return item('Interpréter un taux d’accroissement', `f est affine, f(${fr(x1)}) = ${fr(y1)} et f(${fr(x2)}) = ${fr(y2)}.`,
            [Q('Coefficient directeur m', m), S('f est', m > 0 ? 'croissante' : 'décroissante', ['croissante', 'décroissante'])],
            C('m est le taux d’accroissement : (f(x₂) − f(x₁)) ÷ (x₂ − x₁) ; son signe donne le sens de variation.',
              [`m = (${fmt.diff(y2, y1)}) ÷ (${fmt.diff(x2, x1)}) = ${fr(y2 - y1)} ÷ ${x2 - x1} = ${fr(m)}.`],
              `m = ${fr(m)} : f est ${m > 0 ? 'croissante' : 'décroissante'}.`),
            'Quand x augmente de 1, f(x) varie de m.'); }
      }),
      T({ // Optimisation d'aire
        base: {P: 36},
        params: r => ({P: 4 * r.int(3, 50)}),
        space: 48,
        difficulty: ({P}) => score({steps: 3, values: [P]}),
        verify: ({P}, v) => v[0] === P / 4 && v[1] === P * P / 16,
        build: ({P}) => { const h = P / 2, s = P / 4;
          return item('Résoudre un problème d’optimisation', `Parmi les rectangles de périmètre ${P} cm, on cherche celui d’aire maximale. Avec une largeur x : A(x) = x(${h} ${M} x) = ${fr(s * s)} ${M} (x ${M} ${s})².`,
            [Q('Largeur optimale, en cm', s), Q('Aire maximale, en cm²', s * s)],
            C('A(x) = ' + fr(s * s) + ' − (x − ' + s + ')² est maximale quand le carré est nul.',
              [`x = ${s}, la longueur vaut ${h} ${M} ${s} = ${s} : c’est un carré.`],
              `l’aire maximale est ${s * s} cm², pour un carré de ${s} cm de côté.`),
            'Développe la forme proposée pour vérifier qu’elle est égale à x(' + h + ' − x).'); }
      }),
      T({ // Comparer des images par monotonie
        base: {kind: 0, a: 3, b: 7},
        params: r => ({kind: r.int(0, 1), a: r.int(1, 20) / 2, b: r.int(1, 20) / 2}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], decimals: true}),
        verify: ({kind, a, b}, v) => { const f = x => (kind ? 1 / x : Math.sqrt(x)); return (v[0] === 'f(a)') === (f(a) > f(b)); },
        build: ({kind, a, b}) => { const f = x => (kind ? 1 / x : Math.sqrt(x)), name = kind ? 'inverse' : 'racine carrée', big = f(a) > f(b) ? 'f(a)' : 'f(b)';
          return item('Comparer des images', `f est la fonction ${name}. Sans calculer, compare f(a) et f(b) pour a = ${fr(a)} et b = ${fr(b)}, puis vérifie.`,
            [S('La plus grande image est', big, ['f(a)', 'f(b)']), Q('f(a)', f(a), 3), Q('f(b)', f(b), 3)],
            C(kind ? 'la fonction inverse est décroissante sur ]0 ; +∞[ : elle inverse l’ordre.' : 'la fonction racine carrée est croissante sur [0 ; +∞[ : elle conserve l’ordre.',
              [`${fr(Math.min(a, b))} < ${fr(Math.max(a, b))}.`],
              `${big} est la plus grande.`),
            'Utilise le sens de variation, pas un calcul.'); }
      }),
      T({ // Extremums d'une fonction affine sur un intervalle
        base: {m: -2, p: 5, a: -1, b: 4},
        params: r => ({m: r.nonZero(1, 5), p: r.int(-9, 9), a: r.int(-6, 2), b: r.int(3, 9)}),
        difficulty: ({m, p, a, b}) => score({steps: 2, values: [m * a + p, m * b + p], negatives: true}),
        verify: ({m, p, a, b}, v) => v[0] === Math.max(m * a + p, m * b + p) && v[1] === Math.min(m * a + p, m * b + p),
        build: ({m, p, a, b}) => { const fa = m * a + p, fb = m * b + p;
          return item('Trouver les extremums sur un intervalle', `f(x) = ${lin(m, p)} sur l’intervalle [${fr(a)} ; ${fr(b)}].`,
            [Q('Maximum de f', Math.max(fa, fb)), Q('Minimum de f', Math.min(fa, fb))],
            C('une fonction affine est monotone : ses extremums sur un intervalle fermé sont atteints aux bornes.',
              [`f est ${m > 0 ? 'croissante' : 'décroissante'} (m = ${fr(m)}).`, `f(${fr(a)}) = ${fr(fa)} et f(${fr(b)}) = ${fr(fb)}.`],
              `maximum ${fr(Math.max(fa, fb))}, minimum ${fr(Math.min(fa, fb))}.`),
            'Calcule les images des deux bornes.'); }
      }),
      T({ // Lecture d'un tableau de variations
        base: {x0: -3, x1: 1, x2: 5, y0: 2, y1: 7, y2: -1},
        params: r => { const x0 = r.int(-8, -2), x1 = r.int(-1, 3), x2 = r.int(4, 10); const y1 = r.int(2, 12); return {x0, x1, x2, y0: y1 - r.int(1, 8), y1, y2: y1 - r.int(1, 15)}; },
        accept: ({y0, y2}) => y0 !== y2,
        difficulty: ({y1, y2}) => score({steps: 2, values: [y1, y2], negatives: true}),
        verify: ({x1, y0, y1, y2}, v) => v[0] === y1 && v[1] === x1 && v[2] === Math.min(y0, y2),
        build: ({x0, x1, x2, y0, y1, y2}) => item('Lire un tableau de variations', `Sur [${fr(x0)} ; ${fr(x2)}], f est croissante de f(${fr(x0)}) = ${fr(y0)} à f(${fr(x1)}) = ${fr(y1)}, puis décroissante jusqu’à f(${fr(x2)}) = ${fr(y2)}.`,
          [Q('Maximum de f', y1), Q('Abscisse du maximum', x1), Q('Minimum de f', Math.min(y0, y2))],
          C('le maximum est au changement de sens de variation ; le minimum est atteint à l’une des bornes.',
            [`Max : f(${fr(x1)}) = ${fr(y1)}. Min : le plus petit de ${fr(y0)} et ${fr(y2)}.`],
            `max ${fr(y1)} en ${fr(x1)} ; min ${fr(Math.min(y0, y2))}.`),
          'Compare les valeurs aux deux bornes.')
      })
    ],

    /* ---------- 11 · Signe d'une expression ---------- */
  };

  const basics = {
    '2-variations': ['Une fonction croissante conserve l’ordre, une fonction décroissante l’inverse.', 'f(x) = −2x + 1 : que vaut f(3) ?', '−5', '−6 + 1.'],
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
    '2-variations': [
      ({a, al, be}) => { const f = x => a * (x - al) ** 2 + be;
        return {c: FG.repere(`${a > 0 ? 'Minimum' : 'Maximum'} ${fr(be)}, atteint en x = ${fr(al)}`, cadre([f], Math.min(al - 3, -1), Math.max(al + 3, 1), {hauteur: 280}))
          .courbe(`(${a})*(x-(${al}))^2+(${be})`, {nom: 'C_f'}).lecture(al, be).description()}; },
      null,
      ({P}) => { const h = P / 2, s = P / 4;
        return {c: FG.repere(`L’aire est maximale pour x = ${fr(s)} : elle vaut alors ${fr(s * s)} cm²`, {xmin: 0, xmax: h, ymin: 0, ymax: 1.14 * s * s, nom_x: 'x (cm)', nom_y: 'aire (cm²)', hauteur: 260})
          .courbe(`x*(${h}-x)`).lecture(s, s * s).description()}; },
      null,
      ({m, p, a, b}) => { const f = x => m * x + p;
        return {c: FG.repere(`Sur [${fr(a)} ; ${fr(b)}], f est ${m > 0 ? 'croissante' : 'décroissante'} : ses extremums sont atteints aux bornes`, cadre([f], Math.min(a, 0) - 1, Math.max(b, 0) + 1, {hauteur: 280}, [f(a), f(b)], a, b))
          .segment(a, f(a), b, f(b), {epais: true}).lecture(a, f(a)).lecture(b, f(b)).description()}; },
      ({x0, x1, x2, y0, y1, y2}) => ({c: FG.repere(`Une courbe possible : elle monte jusqu’au point (${fr(x1)} ; ${fr(y1)}), puis redescend`,
        {xmin: Math.min(x0, 0) - 1, xmax: Math.max(x2, 0) + 1, ymin: Math.min(y0, y2, 0) - 1, ymax: Math.max(y1, 0) + 1, hauteur: 280})
        .ligne_brisee([[x0, y0], [x1, y1], [x2, y2]]).point(x0, y0).point(x2, y2).lecture(x1, y1).description()})
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
