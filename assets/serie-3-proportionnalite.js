/* Série 3-proportionnalite : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-proportionnalite': [
      T({ // Quatrième proportionnelle
        base: {u: 235, a: 4, c: 7},
        params: r => ({u: r.int(105, 495), a: r.int(2, 9), c: r.int(2, 15)}),
        accept: ({u, a, c}) => a !== c && u % 5 === 0,
        difficulty: ({u, a, c}) => score({steps: 2, values: [u * a / 100, u * c / 100], decimals: true}),
        verify: ({u, a, c}, v) => close(v[0], u / 100) && close(v[1], u * a / 100 / a * c),
        build: ({u, a, c}) => { const p = u / 100, total = p * a;
          return item('Calculer une quatrième proportionnelle', `${a} kg de pommes coûtent ${fr(total)} €. Le prix est proportionnel à la masse.`,
            [Q('Prix d’un kilogramme, en €', p), Q(`Prix de ${c} kg, en €`, p * c)],
            C('dans une situation de proportionnalité, on passe par l’unité : on divise par la masse achetée.',
              [`${fr(total)} ÷ ${a} = ${fr(p)} € le kilogramme.`, `${fr(p)} × ${c} = ${fr(r2(p * c))} €.`],
              `le kilogramme coûte ${fr(p)} € et ${c} kg coûtent ${fr(r2(p * c))} €.`),
            'Calcule d’abord le prix d’un seul kilogramme.'); }
      }),
      T({ // Calculer un pourcentage
        base: {N: 25, k: 7},
        params: r => ({N: r.pick([20, 24, 25, 28, 30, 32, 40, 50, 80, 120, 150, 200, 250, 400]), k: r.int(1, 60)}),
        accept: ({N, k}) => k < N,
        difficulty: ({N, k}) => score({steps: 2, values: [N, k, 100 * k / N]}),
        verify: ({N, k}, v) => close(v[0], 100 * k / N) && v[1] === N - k,
        build: ({N, k}) => item('Exprimer une proportion en pourcentage', `Dans un club de ${N} adhérents, ${k} pratiquent la natation.`,
          [Q('Part des nageurs, en %', 100 * k / N, 1), Q('Adhérents qui ne nagent pas', N - k)],
          C('pourcentage = effectif de la partie ÷ effectif total × 100.',
            [`${k} ÷ ${N} × 100 ${eq(100 * k / N, 1)} %.`, `${N} ${M} ${k} = ${N - k}.`],
            `${about(100 * k / N, 1)} % des adhérents nagent ; ${N - k} ne nagent pas.`),
          'Divise par l’effectif total, pas par l’effectif restant.')
      }),
      T({ // Coefficient multiplicateur
        base: {P: 80, t: 15, up: 0},
        params: r => ({P: 5 * r.int(4, 60), t: r.pick([5, 10, 12, 15, 20, 25, 30, 35, 40]), up: r.int(0, 1)}),
        difficulty: ({P, t}) => score({steps: 2, values: [P, t, P * (1 + t / 100)], decimals: true}),
        verify: ({P, t, up}, v) => close(v[0], up ? 1 + t / 100 : 1 - t / 100) && close(v[1], P * v[0]),
        build: ({P, t, up}) => { const k = up ? 1 + t / 100 : 1 - t / 100;
          return item('Appliquer une évolution en pourcentage', `Un article coûte ${P} €. Son prix ${up ? 'augmente' : 'baisse'} de ${t} %.`,
            [Q('Coefficient multiplicateur', k, 3), Q('Nouveau prix, en €', P * k)],
            C(`${up ? 'augmenter' : 'baisser'} de t % revient à multiplier par 1 ${up ? '+' : M} t/100.`,
              [`Coefficient : 1 ${up ? '+' : M} ${t}/100 = ${fr(k)}.`, `${P} × ${fr(k)} = ${fr(r2(P * k))} €.`],
              `le coefficient vaut ${fr(k)} et le nouveau prix est ${fr(r2(P * k))} €.`),
            'Le coefficient d’une ' + (up ? 'hausse est supérieur' : 'baisse est inférieur') + ' à 1.'); }
      }),
      T({ // Retrouver la valeur initiale
        base: {P: 60, t: 20, up: 1},
        params: r => ({P: 10 * r.int(3, 40), t: r.pick([10, 20, 25, 30, 40, 50]), up: r.int(0, 1)}),
        difficulty: ({P, t}) => score({steps: 2, values: [P, t, P * (1 + t / 100)], decimals: true}),
        verify: ({P, t, up}, v) => close(v[0], up ? 1 + t / 100 : 1 - t / 100) && close(v[1] * v[0], P * (up ? 1 + t / 100 : 1 - t / 100)),
        build: ({P, t, up}) => { const k = up ? 1 + t / 100 : 1 - t / 100, Q2 = P * k;
          return item('Retrouver un prix avant évolution', `Après une ${up ? 'hausse' : 'baisse'} de ${t} %, un abonnement coûte ${fr(Q2)} €.`,
            [Q('Coefficient multiplicateur', k, 3), Q('Prix avant l’évolution, en €', P)],
            C('prix final = prix initial × coefficient ; on retrouve le prix initial en divisant par le coefficient.',
              [`Coefficient : ${fr(k)}.`, `${fr(Q2)} ÷ ${fr(k)} = ${P} €.`],
              `l’abonnement coûtait ${P} € avant l’évolution. Retirer ${t} % au prix final ne donnerait pas ce résultat.`),
            'Divise par le coefficient ; n’applique pas le pourcentage inverse.'); }
      }),
      T({ // Partage selon un ratio
        base: {a: 2, b: 3, k: 30},
        params: r => ({a: r.int(1, 7), b: r.int(2, 9), k: r.int(5, 60)}),
        accept: ({a, b}) => a < b && gcd(a, b) === 1,
        difficulty: ({a, b, k}) => score({steps: 2, values: [(a + b) * k, a * k, b * k]}),
        verify: ({a, b, k}, v) => v[0] + v[1] === (a + b) * k && v[0] * b === v[1] * a,
        build: ({a, b, k}) => { const S2 = (a + b) * k; return item('Partager selon un ratio', `Deux associés se partagent ${S2} € dans le ratio ${a} : ${b}.`,
          [Q('Part du premier, en €', a * k), Q('Part du second, en €', b * k)],
          C('le ratio a : b découpe la somme en a + b parts égales ; le premier en reçoit a, le second b.',
            [`${a} + ${b} = ${a + b} parts ; une part vaut ${S2} ÷ ${a + b} = ${k} €.`, `${a} × ${k} = ${a * k} € et ${b} × ${k} = ${b * k} €.`],
            `le premier reçoit ${a * k} € et le second ${b * k} €.`),
          'Commence par compter le nombre total de parts.'); }
      }),
      T({ // Échelle d'une carte
        base: {d: 45, E: 25000},
        params: r => ({d: r.int(12, 99), E: r.pick([10000, 20000, 25000, 50000, 100000, 200000, 250000])}),
        accept: ({d}) => d % 10 !== 0,
        difficulty: ({d, E}) => score({steps: 2, values: [d * E / 1000], decimals: true}),
        verify: ({d, E}, v) => close(v[0], d / 10 * E / 100) && close(v[1], v[0] / 1000),
        build: ({d, E}) => { const c = d / 10, m = c * E / 100;
          return item('Utiliser une échelle', `Sur une carte à l’échelle 1/${fr(E)}, deux villages sont séparés de ${fr(c)} cm.`,
            [Q('Distance réelle, en m', m), Q('Distance réelle, en km', m / 1000, 3)],
            C('à l’échelle 1/' + fr(E) + ', 1 cm sur la carte représente ' + fr(E) + ' cm en réalité.',
              [`${fr(c)} × ${fr(E)} = ${fr(c * E)} cm = ${fr(m)} m.`, `${fr(m)} m = ${fr(m / 1000)} km.`],
              `les villages sont distants de ${fr(m)} m, soit ${fr(m / 1000)} km.`),
            'Multiplie par le dénominateur de l’échelle, puis convertis : 100 cm = 1 m.'); }
      })
    ],

    /* ---------- 07 · Notion de fonction ---------- */
  };

  const basics = {
    '3-proportionnalite': ['Deux grandeurs proportionnelles se déduisent l’une de l’autre par une même multiplication.', '3 cahiers coûtent 6 €. Combien coûte un cahier ?', '2', 'Divise 6 par 3.'],
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
