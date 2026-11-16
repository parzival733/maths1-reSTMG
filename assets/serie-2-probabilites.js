/* Série 2-probabilites : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-probabilites': [
      T({ // P(A ∪ B)
        base: {a: 45, b: 30, c: 15},
        params: r => ({a: r.int(10, 70), b: r.int(10, 70), c: r.int(2, 30)}),
        accept: ({a, b, c}) => c < Math.min(a, b) && a + b - c <= 100,
        difficulty: () => score({steps: 2, values: [1], decimals: true}),
        verify: ({a, b, c}, v) => close(v[0], (a + b - c) / 100) && close(v[1], 1 - (a + b - c) / 100),
        build: ({a, b, c}) => item('Calculer P(A ∪ B)', `P(A) = ${fr(a / 100)}, P(B) = ${fr(b / 100)} et P(A ∩ B) = ${fr(c / 100)}.`,
          [Q('P(A ∪ B)', (a + b - c) / 100), Q('P de « ni A ni B »', 1 - (a + b - c) / 100)],
          C('P(A ∪ B) = P(A) + P(B) − P(A ∩ B) ; « ni A ni B » est le contraire de A ∪ B.',
            [`${fr(a / 100)} + ${fr(b / 100)} ${M} ${fr(c / 100)} = ${fr((a + b - c) / 100)}.`, `1 ${M} ${fr((a + b - c) / 100)} = ${fr(1 - (a + b - c) / 100)}.`],
            `P(A ∪ B) = ${fr((a + b - c) / 100)} et P(ni A ni B) = ${fr(1 - (a + b - c) / 100)}.`),
          'L’intersection serait comptée deux fois sans la soustraction.')
      }),
      T({ // Arbre pondéré
        base: {p: 60, q: 30},
        params: r => ({p: r.int(2, 18) * 5, q: r.int(2, 18) * 5}),
        difficulty: () => score({steps: 3, values: [1], decimals: true}),
        verify: ({p, q}, v) => close(v[0], p * q / 10000) && close(v[1], p * (100 - q) / 10000),
        build: ({p, q}) => item('Lire un arbre pondéré', `On choisit un élève au hasard. A : « il prend le car », avec P(A) = ${fr(p / 100)}. Parmi ceux qui prennent le car, ${q} % arrivent en retard (B).`,
          [Q('P(A ∩ B)', p * q / 10000), Q('P(A ∩ B̄)', p * (100 - q) / 10000)],
          C('sur un arbre, P(A ∩ B) = P(A) × P_A(B) : on multiplie le long du chemin.',
            [`P_A(B) = ${fr(q / 100)} et P_A(B̄) = ${fr(1 - q / 100)}.`, `P(A ∩ B) = ${fr(p / 100)} × ${fr(q / 100)} = ${fr(p * q / 10000)} ; P(A ∩ B̄) = ${fr(p / 100)} × ${fr(1 - q / 100)} = ${fr(p * (100 - q) / 10000)}.`],
            `${fr(p * q / 10000)} et ${fr(p * (100 - q) / 10000)}.`),
          'Les branches issues d’un même nœud ont pour somme 1.')
      }),
      T({ // Probabilité conditionnelle depuis un tableau
        base: {a: 18, b: 42, c: 12, d: 28},
        params: r => ({a: r.int(3, 40), b: r.int(3, 40), c: r.int(3, 40), d: r.int(3, 40)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d], fractions: true}),
        verify: ({a, b, c}, v) => sameFrac(v[0], a, a + b) && sameFrac(v[1], a, a + c),
        build: ({a, b, c, d}) => item('Calculer une probabilité conditionnelle', 'On choisit au hasard un participant à un tournoi.' + table('Participants', ['Gagnant', 'Perdant'], [{label: 'Club A', cells: [a, b]}, {label: 'Club B', cells: [c, d]}], 'Club'),
          [Q('P_A(G) : gagnant sachant club A', a / (a + b)), Q('P_G(A) : club A sachant gagnant', a / (a + c))],
          C('P_A(G) = P(A ∩ G) / P(A) ; avec des effectifs, on divise par l’effectif de A.',
            [`P_A(G) = ${a}/${a + b}${gcd(a, a + b) > 1 ? ' = ' + frac(a, a + b) : ''}.`, `P_G(A) = ${a}/${a + c}${gcd(a, a + c) > 1 ? ' = ' + frac(a, a + c) : ''}.`],
            `P_A(G) = ${frac(a, a + b)} et P_G(A) = ${frac(a, a + c)} : ce ne sont pas les mêmes probabilités.`),
          'Le « sachant » désigne la population de référence.')
      }),
      T({ // Faux positifs
        base: {N: 10000, m: 2, se: 95, sp: 90},
        params: r => ({N: 10000, m: r.pick([1, 2, 3, 5, 10]), se: r.pick([90, 95, 98, 99]), sp: r.pick([85, 90, 95, 98])}),
        space: 60,
        difficulty: () => score({steps: 3, values: [10000], decimals: true}),
        verify: ({N, m, se, sp}, v) => { const M2 = N * m / 100, TP = M2 * se / 100, FP = (N - M2) * (100 - sp) / 100; return close(v[0], TP + FP) && close(v[1], TP / (TP + FP)); },
        build: ({N, m, se, sp}) => { const M2 = N * m / 100, TP = M2 * se / 100, FP = (N - M2) * (100 - sp) / 100;
          return item('Interpréter un test de dépistage', `Dans une population de ${fr(N)} personnes, ${m} % sont malades. Le test est positif pour ${se} % des malades et pour ${100 - sp} % des personnes saines.`,
            [Q('Nombre de tests positifs', TP + FP), Q('P(malade sachant positif)', TP / (TP + FP))],
            C('on raisonne sur des effectifs : malades positifs (vrais positifs) et sains positifs (faux positifs).',
              [`Malades : ${fr(M2)} ; vrais positifs : ${fr(TP)}. Sains : ${fr(N - M2)} ; faux positifs : ${fr(FP)}.`, `P_positif(malade) = ${fr(TP)} ÷ ${fr(TP + FP)} ${eq(TP / (TP + FP))}.`],
              `seule une proportion d’environ ${fr(r2(100 * TP / (TP + FP)))} % des positifs est malade : P_positif(malade) est très différente de P_malade(positif).`),
            'Construis le tableau croisé malade / sain et positif / négatif.'); }
      }),
      T({ // Trois épreuves
        base: {p: 70},
        params: r => ({p: r.int(10, 19) * 5}),
        space: 10,
        difficulty: () => score({steps: 3, values: [1], decimals: true}),
        verify: ({p}, v) => close(v[0], (p / 100) ** 3) && close(v[1], 1 - (1 - p / 100) ** 3),
        build: ({p}) => { const q = p / 100;
          return item('Enchaîner trois épreuves', `Un joueur réussit un tir avec la probabilité ${fr(q)}, indépendamment d’un tir à l’autre. Il tire trois fois.`,
            [Q('P(trois réussites)', q ** 3, 4), Q('P(au moins une réussite)', 1 - (1 - q) ** 3, 4)],
            C('on multiplie le long d’un chemin de l’arbre ; « au moins une » est le contraire de « aucune ».',
              [`${fr(q)}³ = ${fr(r2(q ** 3, 4))}.`, `1 ${M} ${fr(r2(1 - q, 2))}³ = ${fr(r2(1 - (1 - q) ** 3, 4))}.`],
              `${fr(r2(q ** 3, 4))} et ${fr(r2(1 - (1 - q) ** 3, 4))}.`),
            'Passe par l’événement contraire.'); }
      }),
      T({ // Échantillonnage
        base: {p: 30, n: 100, d: 6},
        params: r => ({p: r.pick([20, 25, 30, 40, 50, 60]), n: r.pick([25, 100, 400, 625, 2500]), d: r.int(-15, 15)}),
        accept: ({p, n, d}) => p * n / 100 + d * Math.sqrt(n) / 10 > 0 && Number.isInteger(p * n / 100 + Math.round(d * Math.sqrt(n) / 10)),
        difficulty: () => score({steps: 3, values: [1], decimals: true}),
        verify: ({p, n, d}, v) => { const k = p * n / 100 + Math.round(d * Math.sqrt(n) / 10), f = k / n; return close(v[0], f) && (v[1] === 'oui') === (Math.abs(f - p / 100) <= 1 / Math.sqrt(n) + 1e-12); },
        build: ({p, n, d}) => { const k = p * n / 100 + Math.round(d * Math.sqrt(n) / 10), f = k / n, e = 1 / Math.sqrt(n), ok = Math.abs(f - p / 100) <= e + 1e-12;
          return item('Comparer une fréquence à une probabilité', `Une pièce truquée donne « pile » avec la probabilité ${fr(p / 100)}. Sur un échantillon de ${n} lancers, on obtient ${k} piles.`,
            [Q('Fréquence observée', f, 4), S(`|f − p| ≤ 1/√${n} ?`, ok ? 'oui' : 'non', ['oui', 'non'])],
            C('pour un échantillon de taille n, l’écart |f − p| est en général inférieur ou égal à 1/√n (dans environ 95 % des échantillons).',
              [`f = ${k}/${n} = ${fr(f)} ; 1/√${n} = ${fr(e)}.`, `|${fr(f)} ${M} ${fr(p / 100)}| = ${fr(r2(Math.abs(f - p / 100), 4))}.`],
              ok ? 'l’écart est dans la marge habituelle.' : 'l’écart dépasse la marge habituelle : l’échantillon est inhabituel pour ce modèle.'),
            'Calcule l’écart entre la fréquence et la probabilité.'); }
      })
    ],

    /* ---------- 16 · Algorithmique et logique ---------- */
  };

  const basics = {
    '2-probabilites': ['Sur un arbre, on multiplie les probabilités le long d’un chemin.', 'P(A) = 0,5 et P_A(B) = 0,4 : P(A ∩ B) ?', '0,2', '0,5 × 0,4.'],
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
    '2-probabilites': [null,
      ({p, q}) => { const P = p / 100, Q = q / 100, non = [{nom: 'B'}, {nom: 'B̄'}];
        return {e: FG.arbre(`Arbre pondéré : P(A) = ${fr(P)} et, parmi ceux qui prennent le car, ${q} % de retards`,
            [{nom: 'A', p: fr(P), enfants: [{nom: 'B', p: q + ' %'}, {nom: 'B̄', p: '?'}]}, {nom: 'Ā', p: '?', enfants: non}], {largeur: 340}).description(),
          c: FG.arbre(`On multiplie les probabilités le long de chaque chemin : P(A ∩ B) en haut, P(A ∩ B̄) en dessous`,
            [{nom: 'A', p: fr(P), enfants: [{nom: 'B', p: fr(Q), feuille: '→ ' + fr(r2(P * Q, 4))}, {nom: 'B̄', p: fr(r2(1 - Q, 4)), feuille: '→ ' + fr(r2(P * (1 - Q), 4))}]},
              {nom: 'Ā', p: fr(r2(1 - P, 4)), enfants: non}], {chemins: [['A', 'B'], ['A', 'B̄']], largeur: 340}).description()}; },
      null,
      ({m, se, sp}) => ({c: FG.arbre(`Arbre du dépistage : M pour « malade », + pour « test positif »`,
        [{nom: 'M', p: fr(m / 100), enfants: [{nom: '+', p: fr(se / 100)}, {nom: '−', p: fr(r2(1 - se / 100, 4))}]},
          {nom: 'M̄', p: fr(r2(1 - m / 100, 4)), enfants: [{nom: '+', p: fr(r2(1 - sp / 100, 4))}, {nom: '−', p: fr(sp / 100)}]}], {chemins: [['M', '+'], ['M̄', '+']], largeur: 340}).description()}),
      ({p}) => { const q = p / 100, niveau = suite => [{nom: 'R', p: fr(q), enfants: suite}, {nom: 'R̄', p: fr(r2(1 - q, 4)), enfants: suite}];
        return {c: FG.arbre(`Arbre des trois tirs : R pour « réussi », probabilité ${fr(q)} à chaque tir`, niveau(niveau(niveau(undefined))), {chemin: ['R', 'R', 'R'], hauteur: 300, largeur: 340}).description()}; }
    ]
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
