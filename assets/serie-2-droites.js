/* Série 2-droites : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-droites': [
      T({ // Équation réduite par deux points
        base: {m: 2, p: -1, x1: 1, x2: 4},
        params: r => ({m: r.nonZero(1, 5) / r.pick([1, 1, 2]), p: r.int(-8, 8), x1: r.int(-5, 3), x2: r.int(2, 8)}),
        accept: ({m, x1, x2}) => x1 < x2 && Number.isInteger(m * x1) && Number.isInteger(m * x2),
        difficulty: ({m, p}) => score({steps: 3, values: [m, p], negatives: true}),
        verify: ({m, p, x1, x2}, v) => close(v[0] * x1 + v[1], m * x1 + p) && close(v[0] * x2 + v[1], m * x2 + p),
        build: ({m, p, x1, x2}) => { const y1 = m * x1 + p, y2 = m * x2 + p;
          return item('Déterminer l’équation réduite d’une droite', `A${vec(x1, y1)} et B${vec(x2, y2)}. Détermine l’équation réduite y = mx + p de la droite (AB).`,
            [Q('Pente m', m), Q('Ordonnée à l’origine p', p)],
            C('m = (y<sub>B</sub> − y<sub>A</sub>) ÷ (x<sub>B</sub> − x<sub>A</sub>), puis p = y<sub>A</sub> − m x<sub>A</sub>.',
              [`m = (${fmt.diff(y2, y1)}) ÷ (${fmt.diff(x2, x1)}) = ${fr(y2 - y1)} ÷ ${fr(x2 - x1)} = ${fr(m)}.`, `p = ${fr(y1)} ${M} ${pa(m)} × ${pa(x1)} = ${fr(p)}.`],
              `(AB) : y = ${lin(m, p)}.`),
            'Vérifie avec le point B.'); }
      }),
      T({ // Point et vecteur directeur
        base: {x0: 2, y0: -1, u1: 3, u2: 6},
        params: r => ({x0: r.int(-6, 6), y0: r.int(-6, 6), u1: r.nonZero(1, 5), u2: r.nonZero(1, 9)}),
        accept: ({u1, u2}) => u2 % u1 === 0 || (2 * u2) % u1 === 0,
        difficulty: ({u1, u2}) => score({steps: 3, values: [u2 / u1, u1, u2], negatives: true}),
        verify: ({x0, y0, u1, u2}, v) => close(v[0], u2 / u1) && close(v[1], y0 - u2 / u1 * x0),
        build: ({x0, y0, u1, u2}) => { const m = u2 / u1, p = y0 - m * x0;
          return item('Utiliser un vecteur directeur', `La droite d passe par A${vec(x0, y0)} et a pour vecteur directeur <span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(u1, u2)}.`,
            [Q('Pente de d', m), Q('Ordonnée à l’origine de d', p)],
            C('un vecteur directeur (a ; b) avec a ≠ 0 donne la pente m = b/a ; on trouve p avec le point A.',
              [`m = ${fr(u2)} ÷ ${pa(u1)} = ${fr(m)}.`, `p = ${fr(y0)} ${M} ${pa(m)} × ${pa(x0)} = ${fr(p)}.`],
              `d : y = ${lin(m, p)}.`),
            'Un vecteur directeur indique de combien on monte quand on avance.'); }
      }),
      T({ // Appartenance à une droite
        base: {a: 2, b: -3, c: 4, x: 1, on: 1, s: 1},
        params: r => ({a: r.nonZero(1, 6), b: r.nonZero(1, 6), c: r.int(-9, 9), x: r.int(-5, 5), on: r.int(0, 1), s: r.sign()}),
        accept: ({b, a, c, x}) => (a * x + c) % b === 0 && c !== 0,
        difficulty: () => score({steps: 2, values: [30], negatives: true}),
        verify: ({a, b, c, x, on, s}, v) => { const y = -(a * x + c) / b + (on ? 0 : s); return v[0] === a * x + b * y + c && (v[1] === 'oui') === (v[0] === 0); },
        build: ({a, b, c, x, on, s}) => { const y = -(a * x + c) / b + (on ? 0 : s), val = a * x + b * y + c;
          return item('Tester l’appartenance à une droite', `La droite d a pour équation cartésienne ${lin(a, 0).replace(/ $/, '')}${mono(b, 'y', false)}${sg(c)} = 0. Le point M${vec(x, y)} appartient-il à d ?`,
            [Q('Valeur de ax + by + c en M', val), S('M appartient-il à d ?', val === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('M appartient à d si et seulement si ses coordonnées vérifient l’équation.',
              [`${fr(a)} × ${pa(x)} + ${pa(b)} × ${pa(y)}${sg(c)} = ${fr(val)}.`],
              val === 0 ? 'M appartient à d.' : 'M n’appartient pas à d.'),
            'Remplace x et y par les coordonnées de M.'); }
      }),
      T({ // Parallèles ou sécantes
        base: {m: 2, p: 1, k: 2, on: 1, s: 1},
        params: r => ({m: r.nonZero(1, 5), p: r.int(-6, 6), k: r.nonZero(1, 3), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 3, values: [20], negatives: true}),
        verify: ({m, k, on, s}, v) => { const a = k * m + (on ? 0 : s), m2 = a / k; return close(v[0], m2) && (v[1] === 'parallèles') === close(m2, m); },
        build: ({m, p, k, on, s}) => { const a = k * m + (on ? 0 : s), m2 = a / k, c = 3 * k;
          return item('Parallèles ou sécantes ?', `d₁ : y = ${lin(m, p)} et d₂ : ${mono(a)}${mono(-k, 'y', false)}${sg(c)} = 0. Les droites sont-elles parallèles ou sécantes ?`,
            [Q('Pente de d₂', m2), S('d₁ et d₂ sont', close(m2, m) ? 'parallèles' : 'sécantes', ['parallèles', 'sécantes'])],
            C('deux droites non verticales sont parallèles si et seulement si elles ont la même pente.',
              [`d₂ : ${k === 1 ? '' : fr(k)}y = ${lin(a, c)}, soit y = ${lin(m2, c / k)}.`],
              close(m2, m) ? `même pente ${fr(m)} : d₁ et d₂ sont parallèles.` : `pentes ${fr(m)} et ${fr(m2)} différentes : d₁ et d₂ sont sécantes.`),
            'Mets d₂ sous forme réduite.'); }
      }),
      T({ // Système en contexte
        base: {x: 2, y: 3, a: 2, b: 3, c: 1, d: 4},
        params: r => ({x: 10 * r.int(1, 30) / 10, y: r.int(1, 12), a: r.int(1, 6), b: r.int(1, 6), c: r.int(1, 6), d: r.int(1, 6)}),
        accept: ({a, b, c, d}) => det(a, b, c, d) !== 0,
        difficulty: ({x, y}) => score({steps: 3, values: [x, y, 50]}),
        verify: ({x, y, a, b, c, d}, v) => close(a * v[0] + b * v[1], a * x + b * y) && close(c * v[0] + d * v[1], c * x + d * y),
        build: ({x, y, a, b, c, d}) => { const e = a * x + b * y, f = c * x + d * y, D = det(a, b, c, d);
          return item('Résoudre un système', `${a} cahier${a > 1 ? 's' : ''} et ${b} stylo${b > 1 ? 's' : ''} coûtent ${fr(e)} € ; ${c} cahier${c > 1 ? 's' : ''} et ${d} stylo${d > 1 ? 's' : ''} coûtent ${fr(f)} €. On note x le prix d’un cahier et y celui d’un stylo.`,
            [Q('Prix d’un cahier x, en €', x), Q('Prix d’un stylo y, en €', y)],
            C('on résout le système par combinaison : on élimine une inconnue en multipliant les équations.',
              [`${mono(a)}${mono(b, 'y', false)} = ${fr(e)} et ${mono(c)}${mono(d, 'y', false)} = ${fr(f)} ; le déterminant ${fr(a)} × ${d} ${M} ${b} × ${c} = ${fr(D)} n’est pas nul : une seule solution.`,
               `${d} × (1) ${M} ${b} × (2) : ${mono(D)} = ${fr(d * e - b * f)}, donc x = ${fr(x)} ; puis y = ${fr(y)}.`],
              `un cahier coûte ${fr(x)} € et un stylo ${fr(y)} €.`),
            'Vérifie la solution dans les deux équations.'); }
      }),
      T({ // Intersection de deux droites cartésiennes
        base: {x: 1, y: 2, a: 1, b: 1, c: 2, d: -1},
        params: r => ({x: r.int(-6, 6), y: r.int(-6, 6), a: r.nonZero(1, 4), b: r.nonZero(1, 4), c: r.nonZero(1, 4), d: r.nonZero(1, 4)}),
        accept: ({a, b, c, d}) => det(a, b, c, d) !== 0,
        difficulty: () => score({steps: 3, values: [24], negatives: true}),
        verify: ({x, y, a, b, c, d}, v) => a * v[0] + b * v[1] === a * x + b * y && c * v[0] + d * v[1] === c * x + d * y,
        build: ({x, y, a, b, c, d}) => { const e = a * x + b * y, f = c * x + d * y;
          return item('Calculer un point d’intersection', `d₁ : ${mono(a)}${mono(b, 'y', false)} = ${fr(e)} et d₂ : ${mono(c)}${mono(d, 'y', false)} = ${fr(f)}. Détermine leur point d’intersection.`,
            [Q('Abscisse', x), Q('Ordonnée', y)],
            C('les coordonnées du point d’intersection vérifient les deux équations : on résout le système.',
              [`Le déterminant ${fr(a)} × ${pa(d)} ${M} ${pa(b)} × ${pa(c)} = ${fr(det(a, b, c, d))} n’est pas nul : les droites sont sécantes.`, `Par combinaison, x = ${fr(x)} et y = ${fr(y)}.`],
              `les droites se coupent en ${vec(x, y)}.`),
            'Vérifie en remplaçant dans les deux équations.'); }
      })
    ],

    /* ---------- 08 · Généralités sur les fonctions ---------- */
  };

  const basics = {
    '2-droites': ['La pente d’une droite est (y_B − y_A)/(x_B − x_A).', 'Pente de la droite passant par (0 ; 1) et (2 ; 5) ?', '2', '(5 − 1) ÷ 2.'],
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
    '2-droites': [
      (p, ex) => { const pts = pointsDe(ex.statement);
        return {e: placer(repereDe(`Points ${liste(pts)} et droite (AB)`, [pts.A, pts.B]).segment(pts.A[0], pts.A[1], pts.B[0], pts.B[1]), pts, ['A', 'B']).description()}; },
      ({x0, y0, u1, u2}) => { const m = u2 / u1, base = titre => repereDe(titre, [[x0, y0], [x0 + u1, y0 + u2]]).vecteur(x0, y0, x0 + u1, y0 + u2, 'u').point(x0, y0, 'A');
        return {e: base(`Point A(${fr(x0)} ; ${fr(y0)}) et vecteur directeur u(${fr(u1)} ; ${fr(u2)}), tracé à partir de A`).description(),
          c: base(`La droite d passe par A et suit la direction du vecteur u`).droite_affine(m, y0 - m * x0, {pointilles: true, fin: true, nom: 'd'}).description()}; },
      ({a, b, c, x, on, s}) => { const yd = -(a * x + c) / b, y = yd + (on ? 0 : s);
        return {c: repereDe(on ? `Le point M est sur la droite d` : `Le point M n’est pas sur la droite d`, [[x, y], [x, yd], [x - 2, y], [x + 2, y]]).droite_affine(-a / b, -c / b, {nom: 'd'}).point(x, y, 'M').description()}; },
      ({m, p, k, on, s}) => { const m2 = (k * m + (on ? 0 : s)) / k;
        if (on && p === 3) return {};
        return {c: FG.repere(on ? `Les droites d₁ et d₂ ont la même pente : elles sont parallèles` : `Les droites d₁ et d₂ n’ont pas la même pente : elles sont sécantes`, cadre([x => m * x + p, x => m2 * x + 3], -4, 4, {hauteur: 280}))
          .droite_affine(m, p, {nom: 'd₁'}).droite_affine(m2, 3, {nom: 'd₂', pointilles: true}).description()}; },
      null,
      ({x, y, a, b, c, d}) => { const e = a * x + b * y, f = c * x + d * y, r = repereDe(`Les droites d₁ et d₂ se coupent au point (${fr(x)} ; ${fr(y)})`, [[x, y], [x - 3, y - 3], [x + 3, y + 3]]);
        const droite = (u, v, w, nom, pointilles) => (v !== 0 ? r.droite_affine(-u / v, w / v, {nom, pointilles}) : r.droite_verticale(w / u, {nom, pointilles}));
        droite(a, b, e, 'd₁', false); droite(c, d, f, 'd₂', true);
        return {c: r.lecture(x, y).description()}; }
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
