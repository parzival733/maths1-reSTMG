/* Série 3-statistiques : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-statistiques': [
      T({ // Moyenne et étendue
        base: {v: [12, 8, 15, 10, 14, 9, 16]},
        params: r => ({v: Array.from({length: 7}, () => r.int(4, 20))}),
        accept: ({v}) => Math.max(...v) - Math.min(...v) >= 5,
        difficulty: ({v}) => score({steps: 2, values: [sum(v), Math.max(...v)], decimals: !Number.isInteger(sum(v) / 7)}),
        verify: ({v}, w) => close(w[0], sum(v) / 7) && w[1] === Math.max(...v) - Math.min(...v),
        build: ({v}) => item('Calculer une moyenne et une étendue', `Voici les notes sur 20 d’un élève : ${v.join(' ; ')}.`,
          [Q('Moyenne', sum(v) / 7), Q('Étendue', Math.max(...v) - Math.min(...v))],
          C('moyenne = somme des valeurs ÷ nombre de valeurs ; étendue = plus grande valeur − plus petite valeur.',
            [`Somme : ${v.join(' + ')} = ${sum(v)} ; ${sum(v)} ÷ 7 ${eq(sum(v) / 7)}.`, `Étendue : ${Math.max(...v)} ${M} ${Math.min(...v)} = ${Math.max(...v) - Math.min(...v)}.`],
            `la moyenne vaut ${about(sum(v) / 7)} et l’étendue ${Math.max(...v) - Math.min(...v)}.`),
          'Il y a 7 notes : divise la somme par 7.')
      }),
      T({ // Médiane
        base: {v: [3, 7, 2, 9, 5, 4, 8, 6]},
        params: r => ({v: Array.from({length: r.pick([7, 8, 9, 10])}, () => r.int(1, 30))}),
        accept: ({v}) => new Set(v).size === v.length,
        difficulty: ({v}) => score({steps: 3, values: [Math.max(...v), sum(v) / v.length]}),
        verify: ({v}, w) => { const s = [...v].sort((a, b) => a - b), n = s.length; return close(w[0], n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) && close(w[1], sum(v) / n); },
        build: ({v}) => { const s = [...v].sort((a, b) => a - b), n = s.length, med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
          return item('Déterminer une médiane', `Temps de trajet, en minutes, de ${n} élèves : ${v.join(' ; ')}.`,
            [Q('Médiane', med), Q('Moyenne', sum(v) / n)],
            C('on range les valeurs dans l’ordre croissant ; la médiane partage la série en deux groupes de même effectif.',
              [`Série rangée : ${s.join(' ; ')}.`, n % 2 ? `${n} valeurs : la médiane est la ${(n + 1) / 2}e, soit ${med}.` : `${n} valeurs : la médiane est la moyenne des ${n / 2}e et ${n / 2 + 1}e, soit (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${fr(med)}.`, `Moyenne : ${sum(v)} ÷ ${n} ${eq(sum(v) / n)}.`],
              `la médiane vaut ${fr(med)} min et la moyenne ${about(sum(v) / n)} min.`),
            'Range d’abord les valeurs ; ne prends pas la valeur du milieu de la liste non triée.'); }
      }),
      T({ // Moyenne pondérée
        base: {e: [3, 5, 8, 4]},
        params: r => ({e: Array.from({length: 4}, () => r.int(1, 15))}),
        difficulty: ({e}) => score({steps: 3, values: [sum(e), e[1] + 2 * e[2] + 3 * e[3]], decimals: true}),
        verify: ({e}, w) => w[0] === sum(e) && close(w[1], (e[1] + 2 * e[2] + 3 * e[3]) / sum(e)),
        build: ({e}) => { const n = sum(e), s2 = e[1] + 2 * e[2] + 3 * e[3];
          return item('Calculer une moyenne pondérée', 'On a demandé à des élèves combien de frères et sœurs ils ont.' + table('Nombre de frères et sœurs', [0, 1, 2, 3], [{label: 'Effectif', cells: e}], 'Frères et sœurs'),
            [Q('Effectif total', n), Q('Nombre moyen de frères et sœurs', s2 / n)],
            C('moyenne pondérée = somme des produits valeur × effectif ÷ effectif total.',
              [`Effectif total : ${e.join(' + ')} = ${n}.`, `0 × ${e[0]} + 1 × ${e[1]} + 2 × ${e[2]} + 3 × ${e[3]} = ${s2} ; ${s2} ÷ ${n} ${eq(s2 / n)}.`],
              `${n} élèves ont répondu ; ils ont en moyenne ${about(s2 / n)} frère ou sœur.`),
            'Chaque valeur compte autant de fois que son effectif.'); }
      }),
      T({ // Fréquence
        base: {e: [12, 7, 5, 6], i: 1},
        params: r => ({e: Array.from({length: 4}, () => r.int(3, 30)), i: r.int(0, 3)}),
        difficulty: ({e, i}) => score({steps: 2, values: [sum(e), 100 * e[i] / sum(e)], decimals: true}),
        verify: ({e, i}, w) => w[0] === sum(e) && close(w[1], 100 * e[i] / sum(e)),
        build: ({e, i}) => { const names = ['Bus', 'Vélo', 'Voiture', 'À pied'], n = sum(e);
          return item('Calculer une fréquence', 'Mode de transport des élèves d’un collège.' + table('Mode de transport', names, [{label: 'Effectif', cells: e}], 'Transport'),
            [Q('Effectif total', n), Q(`Fréquence de « ${names[i]} », en %`, 100 * e[i] / n, 1)],
            C('fréquence = effectif de la valeur ÷ effectif total ; on multiplie par 100 pour l’exprimer en pourcentage.',
              [`Effectif total : ${e.join(' + ')} = ${n}.`, `${e[i]} ÷ ${n} × 100 ${eq(100 * e[i] / n, 1)} %.`],
              `la fréquence de « ${names[i]} » est d’${about(100 * e[i] / n, 1)} %.`),
            'La somme des fréquences de toutes les modalités vaut 100 %.'); }
      }),
      T({ // Note nécessaire
        base: {n: 4, m: 11, t: 12},
        params: r => ({n: r.int(3, 6), m: r.int(8, 14), t: r.int(10, 15)}),
        accept: ({n, m, t}) => { const x = t * (n + 1) - n * m; return t !== m && x >= 0 && x <= 20; },
        difficulty: ({n, m, t}) => score({steps: 3, values: [n * m, t * (n + 1)]}),
        verify: ({n, m, t}, v) => v[0] === n * m && (v[0] + v[1]) / (n + 1) === t,
        build: ({n, m, t}) => { const x = t * (n + 1) - n * m; return item('Atteindre une moyenne', `Sam a ${n} notes et sa moyenne est ${m}. Il veut obtenir ${t} de moyenne après une nouvelle note.`,
          [Q('Somme des notes actuelles', n * m), Q('Note nécessaire', x)],
          C('la somme des notes vaut moyenne × nombre de notes ; avec la nouvelle note, il y aura ' + (n + 1) + ' notes.',
            [`Somme actuelle : ${n} × ${m} = ${n * m}.`, `Somme visée : ${t} × ${n + 1} = ${t * (n + 1)} ; note : ${t * (n + 1)} ${M} ${n * m} = ${x}.`],
            `il faut à Sam une note de ${x} pour atteindre ${t} de moyenne.`),
          'Raisonne sur les sommes de notes, pas sur les moyennes.'); }
      }),
      T({ // Comparer deux séries
        base: {a: [11, 12, 10, 13, 12], b: [6, 15, 18, 9, 10], swap: 0},
        params: r => { const c = r.int(9, 13); return {a: Array.from({length: 5}, () => c + r.int(-2, 2)), b: Array.from({length: 5}, () => c + r.int(-7, 7)), swap: r.int(0, 1)}; },
        accept: ({a, b}) => { const ea = Math.max(...a) - Math.min(...a), eb = Math.max(...b) - Math.min(...b); return eb >= ea + 4 && ea >= 1 && Math.min(...b) >= 0 && Math.max(...b) <= 20; },
        difficulty: () => score({steps: 3, values: [20]}),
        verify: ({a, b, swap}, v) => { const [x, y] = swap ? [b, a] : [a, b], ex = Math.max(...x) - Math.min(...x), ey = Math.max(...y) - Math.min(...y); return v[0] === ex && v[1] === ey && v[2] === (ex < ey ? 'Groupe A' : 'Groupe B'); },
        build: ({a, b, swap}) => { const [x, y] = swap ? [b, a] : [a, b], ex = Math.max(...x) - Math.min(...x), ey = Math.max(...y) - Math.min(...y);
          return item('Comparer la dispersion de deux séries', `Notes à un contrôle. Groupe A : ${x.join(' ; ')}. Groupe B : ${y.join(' ; ')}.`,
            [Q('Étendue du groupe A', ex), Q('Étendue du groupe B', ey), S('Groupe aux résultats les plus homogènes', ex < ey ? 'Groupe A' : 'Groupe B', ['Groupe A', 'Groupe B'])],
            C('l’étendue mesure l’écart entre la plus grande et la plus petite valeur : plus elle est faible, plus la série est homogène.',
              [`A : ${Math.max(...x)} ${M} ${Math.min(...x)} = ${ex}. B : ${Math.max(...y)} ${M} ${Math.min(...y)} = ${ey}.`],
              `le groupe ${ex < ey ? 'A' : 'B'} a la plus petite étendue : ses résultats sont les plus homogènes.`),
            'Compare les étendues, pas les moyennes.'); }
      })
    ],

    /* ---------- 10 · Probabilités ---------- */
  };

  const basics = {
    '3-statistiques': ['Moyenne, médiane et étendue résument une série de façons différentes.', 'Moyenne de 4 et 10 ?', '7', 'Additionne puis divise par 2.'],
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
    '3-statistiques': [null, null, null, null, null,
      ({a, b, swap}) => { const [x, y] = swap ? [b, a] : [a, b], tous = x.concat(y), lo = Math.min(...tous), hi = Math.max(...tous);
        const d = FG.droite_numerique(`Notes des groupes A et B : plus les points sont resserrés, plus le groupe est homogène`, {min: lo - 1, max: hi + 1, pas: hi - lo > 12 ? 2 : 1, noms_lignes: ['A', 'B']});
        [x, y].forEach((serie, ligne) => { const vus = {};
          serie.forEach(v => { d.point(v, null, {ligne, valeur: false, empile: vus[v] || 0}); vus[v] = (vus[v] || 0) + 1; });
          d.distance(Math.min(...serie), Math.max(...serie), 'étendue ' + (Math.max(...serie) - Math.min(...serie)), {ligne}); });
        return {c: d.description()}; }
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
