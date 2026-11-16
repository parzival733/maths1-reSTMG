/* Série 2-statistiques : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-statistiques': [
      T({ // Moyenne et écart type
        base: {v: [8, 10, 12, 14], e: [2, 5, 4, 1]},
        params: r => { const s = r.int(4, 10), step = r.int(1, 4); return {v: [0, 1, 2, 3].map(i => s + i * step), e: [0, 1, 2, 3].map(() => r.int(1, 8))}; },
        difficulty: ({v, e}) => score({steps: 3, values: [sum(e), v[3]], decimals: true}),
        verify: ({v, e}, w) => close(w[0], sum(v.map((x, i) => x * e[i])) / sum(e)) && close(w[1], std(v, e)),
        build: ({v, e}) => { const n = sum(e), m = sum(v.map((x, i) => x * e[i])) / n, s = std(v, e);
          return item('Calculer une moyenne et un écart type', 'Durées de trajet, en minutes, d’un groupe d’élèves.' + table('Durées de trajet', v, [{label: 'Effectif', cells: e}], 'Durée'),
            [Q('Moyenne', m), Q('Écart type', s)],
            C('moyenne = Σ nᵢxᵢ / N ; écart type = √(Σ nᵢ(xᵢ − x̄)² / N), à calculer de préférence avec la calculatrice ou Python.',
              [`N = ${n} ; moyenne ${eq(m)}.`, `Écart type ${eq(s)}.`],
              `moyenne environ ${fr(r2(m))} min, écart type environ ${fr(r2(s))} min.`),
            'L’écart type mesure la dispersion autour de la moyenne.'); }
      }),
      T({ // Linéarité de la moyenne
        base: {m: 12, s: 3, a: 2, b: 5},
        params: r => ({m: r.int(5, 40), s: r.int(1, 8), a: r.pick([-2, 0.5, 1.5, 2, 3, 4]), b: r.int(-10, 20)}),
        accept: ({b}) => b !== 0,
        difficulty: ({m, a, b}) => score({steps: 2, values: [a * m + b], decimals: true}),
        verify: ({m, s, a, b}, v) => close(v[0], a * m + b) && close(v[1], Math.abs(a) * s),
        build: ({m, s, a, b}) => item('Utiliser la linéarité de la moyenne', `Une série a pour moyenne ${m} et pour écart type ${s}. On transforme chaque valeur x en ${fr(a)}x${sg(b)}.`,
          [Q('Nouvelle moyenne', a * m + b), Q('Nouvel écart type', Math.abs(a) * s)],
          C('la moyenne subit la même transformation ; l’écart type est multiplié par |a| et n’est pas modifié par l’ajout de b.',
            [`${fr(a)} × ${m}${sg(b)} = ${fr(a * m + b)} ; |${fr(a)}| × ${s} = ${fr(Math.abs(a) * s)}.`],
            `moyenne ${fr(a * m + b)}, écart type ${fr(Math.abs(a) * s)}.`),
          'Ajouter une constante décale les valeurs sans changer leur dispersion.')
      }),
      T({ // Série regroupée en classes
        base: {e: [4, 9, 12, 5]},
        params: r => ({e: [0, 1, 2, 3].map(() => r.int(2, 20))}),
        difficulty: ({e}) => score({steps: 3, values: [sum(e)], decimals: true}),
        verify: ({e}, w) => { const n = sum(e); let c = 0, k = 0; while (c + e[k] < n / 2) { c += e[k]; k++; } return close(w[0], sum(e.map((x, i) => x * (5 + 10 * i))) / n) && w[1] === 10 * k; },
        build: ({e}) => { const n = sum(e), m = sum(e.map((x, i) => x * (5 + 10 * i))) / n; let c = 0, k = 0; while (c + e[k] < n / 2) { c += e[k]; k++; }
          return item('Exploiter une série regroupée en classes', 'Temps passé sur un exercice, en minutes.' + table('Répartition en classes', ['[0 ; 10[', '[10 ; 20[', '[20 ; 30[', '[30 ; 40['], [{label: 'Effectif', cells: e}], 'Durée'),
            [Q('Moyenne (avec les centres des classes)', m), Q('Borne inférieure de la classe médiane', 10 * k)],
            C('on remplace chaque classe par son centre (5, 15, 25, 35) ; la classe médiane contient la valeur de rang N/2 dans les effectifs cumulés.',
              [`Moyenne : (5 × ${e[0]} + 15 × ${e[1]} + 25 × ${e[2]} + 35 × ${e[3]}) ÷ ${n} ${eq(m)}.`, `N/2 = ${fr(n / 2)} ; effectifs cumulés : ${e.map((_, i) => sum(e.slice(0, i + 1))).join(', ')}.`],
              `moyenne environ ${fr(r2(m))} min ; classe médiane [${10 * k} ; ${10 * k + 10}[.`),
            'Calcule les effectifs cumulés croissants.'); }
      }),
      T({ // Quartiles
        base: {v: [3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 20, 22]},
        params: r => ({v: Array.from({length: r.pick([10, 11, 12, 13])}, () => r.int(1, 40))}),
        accept: ({v}) => new Set(v).size === v.length,
        difficulty: ({v}) => score({steps: 3, values: [Math.max(...v)]}),
        verify: ({v}, w) => { const [a, b] = quartiles(v); return w[0] === a && w[1] === b && w[2] === b - a; },
        build: ({v}) => { const s = [...v].sort((a, b) => a - b), n = s.length, [q1, q3] = quartiles(v);
          return item('Déterminer des quartiles', `Série de ${n} valeurs : ${v.join(' ; ')}.`,
            [Q('Premier quartile Q₁', q1), Q('Troisième quartile Q₃', q3), Q('Écart interquartile', q3 - q1)],
            C('Q₁ est la plus petite valeur telle qu’au moins 25 % des valeurs lui soient inférieures ou égales ; Q₃ de même avec 75 %.',
              [`Série rangée : ${s.join(' ; ')}.`, `${n} × 0,25 = ${fr(n / 4)} : Q₁ est la ${Math.ceil(n / 4)}e valeur ; ${n} × 0,75 = ${fr(3 * n / 4)} : Q₃ est la ${Math.ceil(3 * n / 4)}e.`],
              `Q₁ = ${q1}, Q₃ = ${q3}, écart interquartile ${q3 - q1}.`),
            'Range la série avant de compter les rangs.'); }
      }),
      T({ // Ajout d'une valeur
        base: {n: 9, m: 12, x: 22},
        params: r => ({n: r.int(4, 25), m: r.int(8, 18), x: r.int(1, 20)}),
        accept: ({m, x}) => x !== m,
        difficulty: ({n, m, x}) => score({steps: 3, values: [n * m + x], decimals: true}),
        verify: ({n, m, x}, v) => v[0] === n * m && close(v[1], (n * m + x) / (n + 1)),
        build: ({n, m, x}) => item('Mesurer l’effet d’une nouvelle valeur', `Une série de ${n} notes a une moyenne de ${m}. On ajoute la note ${x}.`,
          [Q('Somme des notes initiales', n * m), Q('Nouvelle moyenne', (n * m + x) / (n + 1))],
          C('somme = moyenne × effectif ; on ajoute la nouvelle valeur et on divise par le nouvel effectif.',
            [`${n} × ${m} = ${n * m} ; (${n * m} + ${x}) ÷ ${n + 1} ${eq((n * m + x) / (n + 1))}.`],
            `la moyenne passe de ${m} à environ ${fr(r2((n * m + x) / (n + 1)))} : elle ${x > m ? 'augmente' : 'diminue'}.`),
          'Raisonne sur les sommes.')
      }),
      T({ // Comparer deux séries par l'écart type
        base: {a: [10, 11, 12, 13, 14], b: [6, 9, 12, 15, 18], swap: 0},
        params: r => { const c = r.int(11, 15), s1 = r.int(1, 2), s2 = r.int(3, 5); return {a: [-2, -1, 0, 1, 2].map(i => c + i * s1), b: [-2, -1, 0, 1, 2].map(i => c + i * s2), swap: r.int(0, 1)}; },
        space: 40,
        difficulty: () => score({steps: 3, values: [20], decimals: true}),
        verify: ({a, b, swap}, w) => { const [x, y] = swap ? [b, a] : [a, b], one = [1, 1, 1, 1, 1]; return close(w[0], std(x, one)) && close(w[1], std(y, one)) && w[2] === (std(x, one) < std(y, one) ? 'Classe A' : 'Classe B'); },
        build: ({a, b, swap}) => { const [x, y] = swap ? [b, a] : [a, b], one = [1, 1, 1, 1, 1], sx = std(x, one), sy = std(y, one);
          return item('Comparer deux séries', `Moyennes de cinq élèves, sur 20. Classe A : ${x.map(fr).join(' ; ')}. Classe B : ${y.map(fr).join(' ; ')}. Les deux classes ont la même moyenne.`,
            [Q('Écart type de A', sx), Q('Écart type de B', sy), S('Classe aux résultats les plus homogènes', sx < sy ? 'Classe A' : 'Classe B', ['Classe A', 'Classe B'])],
            C('à moyenne égale, la série de plus petit écart type est la plus regroupée autour de la moyenne.',
              [`σ_A ${eq(sx)} et σ_B ${eq(sy)}.`],
              `la classe ${sx < sy ? 'A' : 'B'} a les résultats les plus homogènes.`),
            'Utilise la calculatrice en mode statistiques.'); }
      })
    ],

    /* ---------- 14 · Tableaux croisés ---------- */
  };

  const basics = {
    '2-statistiques': ['La moyenne résume le centre, l’écart type la dispersion.', 'Moyenne de 6, 8 et 10 ?', '8', '24 ÷ 3.'],
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
    '2-statistiques': [null, null,
      ({e}) => ({e: FG.statistiques(`Histogramme des durées : effectif de chaque classe`).histogramme([0, 10, 20, 30, 40], e, {nom_x: 'durée (min)', nom_y: 'effectif'}).description()}),
      ({v}) => { const t = [...v].sort((x, y) => x - y), n = t.length, [q1, q3] = quartiles(v), med = n % 2 ? t[(n - 1) / 2] : (t[n / 2 - 1] + t[n / 2]) / 2;
        return {c: FG.statistiques(`Diagramme en boîte : minimum, Q₁, médiane, Q₃ et maximum de la série`).boite(t[0], q1, med, q3, t[n - 1]).description()}; },
      null,
      ({a, b, swap}) => { const [x, y] = swap ? [b, a] : [a, b], tous = x.concat(y), lo = Math.floor(Math.min(...tous)), hi = Math.ceil(Math.max(...tous));
        const d = FG.droite_numerique(`Moyennes des classes A et B : plus les points sont resserrés, plus l’écart type est petit`, {min: lo - 1, max: hi + 1, pas: pasDe(hi - lo + 2), noms_lignes: ['A', 'B']});
        [x, y].forEach((serie, ligne) => { const vus = {};
          serie.forEach(v => { d.point(v, null, {ligne, valeur: false, empile: vus[v] || 0}); vus[v] = (vus[v] || 0) + 1; }); });
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
