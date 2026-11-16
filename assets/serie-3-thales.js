/* Série 3-thales : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-thales': [
      T({ // Configuration triangle
        base: {am: 3, ab: 5, an: 4, bc: 7},
        params: r => ({am: r.int(2, 9), ab: r.int(4, 15), an: r.int(2, 12), bc: r.int(3, 16)}),
        accept: ({am, ab}) => am < ab && gcd(am, ab) === 1,
        difficulty: ({am, ab, an, bc}) => score({steps: 3, values: [bc * am / ab, an * ab / am], decimals: true}),
        verify: ({am, ab, an, bc}, v) => close(v[0] * ab, bc * am) && close(v[1] * am, an * ab),
        build: ({am, ab, an, bc}) => { const mn = bc * am / ab, ac = an * ab / am;
          return item('Calculer une longueur avec Thalès', `M ∈ [AB] et N ∈ [AC] ; les droites (MN) et (BC) sont parallèles. AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm et BC = ${bc} cm.`,
            [Q('MN, en cm', mn), Q('AC, en cm', ac)],
            C('d’après le théorème de Thalès : AM/AB = AN/AC = MN/BC.',
              [`MN = BC × AM/AB = ${bc} × ${am}/${ab} ${eq(mn)} cm.`, `AC = AN × AB/AM = ${an} × ${ab}/${am} ${eq(ac)} cm.`],
              `MN ${eq(mn)} cm et AC ${eq(ac)} cm.`),
            'Écris les trois rapports en mettant au numérateur les côtés du petit triangle.'); }
      }),
      T({ // Configuration papillon
        base: {ab: 6, am: 4, bc: 9, ac: 7},
        params: r => ({ab: r.int(3, 14), am: r.int(2, 12), bc: r.int(3, 16), ac: r.int(3, 14)}),
        accept: ({ab, am}) => ab !== am && gcd(ab, am) > 1,
        difficulty: ({ab, am, bc, ac}) => score({steps: 3, values: [bc * am / ab, ac * am / ab], decimals: true}),
        verify: ({ab, am, bc, ac}, v) => close(v[0] * ab, bc * am) && close(v[1] * ab, ac * am),
        build: ({ab, am, bc, ac}) => { const mn = bc * am / ab, an = ac * am / ab;
          return item('Utiliser Thalès en configuration papillon', `Les droites (BM) et (CN) se coupent en A, avec A entre B et M et A entre C et N ; (BC) et (MN) sont parallèles. AB = ${ab} cm, AM = ${am} cm, BC = ${bc} cm et AC = ${ac} cm.`,
            [Q('MN, en cm', mn), Q('AN, en cm', an)],
            C('d’après le théorème de Thalès : AM/AB = AN/AC = MN/BC.',
              [`Rapport : AM/AB = ${am}/${ab} = ${frac(am, ab)}.`, `MN = ${bc} × ${frac(am, ab)} ${eq(mn)} cm ; AN = ${ac} × ${frac(am, ab)} ${eq(an)} cm.`],
              `MN ${eq(mn)} cm et AN ${eq(an)} cm.`),
            'Les deux triangles sont opposés par le sommet A ; les rapports se forment de la même façon.'); }
      }),
      T({ // Réciproque de Thalès
        base: {am: 3, ab: 5, k: 2, on: 1, s: 1},
        params: r => ({am: r.int(2, 8), ab: r.int(4, 12), k: r.int(2, 4), on: r.int(0, 1), s: r.sign()}),
        accept: ({am, ab}) => am < ab && gcd(am, ab) === 1,
        difficulty: () => score({steps: 3, values: [40], fractions: true}),
        verify: ({am, ab, k, on, s}, v) => { const an = am * k + (on ? 0 : s), ac = ab * k; return sameFrac(v[0], am, ab) && sameFrac(v[1], an, ac) && (v[2] === 'oui') === (am * ac === an * ab); },
        build: ({am, ab, k, on, s}) => { const an = am * k + (on ? 0 : s), ac = ab * k;
          return item('Utiliser la réciproque de Thalès', `A, M, B sont alignés dans cet ordre, ainsi que A, N, C. AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm et AC = ${ac} cm. Les droites (MN) et (BC) sont-elles parallèles ?`,
            [Q('AM/AB', am / ab, 3), Q('AN/AC', an / ac, 3), S('(MN) et (BC) sont-elles parallèles ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('on compare les rapports AM/AB et AN/AC, les points étant alignés dans le même ordre : s’ils sont égaux, les droites sont parallèles (réciproque) ; sinon, elles ne le sont pas.',
              [`AM/AB = ${am}/${ab} et AN/AC = ${an}/${ac}${gcd(an, ac) > 1 ? ' = ' + frac(an, ac) : ''}.`, `Produits en croix : ${am} × ${ac} = ${am * ac} et ${an} × ${ab} = ${an * ab}.`],
              on ? 'les rapports sont égaux : (MN) et (BC) sont parallèles.' : 'les rapports sont différents : (MN) et (BC) ne sont pas parallèles.'),
            'Compare les fractions avec un produit en croix plutôt qu’avec des valeurs arrondies.'); }
      }),
      T({ // Hauteur d'un arbre par l'ombre
        base: {h: 15, s: 12, S: 96},
        params: r => ({h: r.int(10, 20), s: r.int(5, 30), S: r.int(40, 200)}),
        accept: ({s, S}) => S > 2 * s,
        difficulty: ({h, s, S}) => score({steps: 3, values: [h * S / s / 100], decimals: true}),
        verify: ({h, s, S}, v) => close(v[0], h / 10 * (S / 10) / (s / 10)),
        build: ({h, s, S}) => { const bh = h / 10, bs = s / 10, as = S / 10, H = bh * as / bs;
          return item('Mesurer une hauteur avec une ombre', `Au même instant, un bâton vertical de ${fr(bh)} m a une ombre de ${fr(bs)} m, et un arbre vertical a une ombre de ${fr(as)} m. Les rayons du soleil sont parallèles.`,
            [Q('Hauteur de l’arbre, en m', H, 1), Q('Rapport ombre de l’arbre / ombre du bâton', as / bs)],
            C('les rayons parallèles forment une configuration de Thalès : hauteur et ombre sont proportionnelles.',
              [`Rapport : ${fr(as)} ÷ ${fr(bs)} ${eq(as / bs)}.`, `H = ${fr(bh)} × ${fr(as)} ÷ ${fr(bs)} ${eq(H, 1)} m.`],
              `l’arbre mesure ${about(H, 1)} m.`),
            'L’ombre de l’arbre est combien de fois plus longue que celle du bâton ?'); }
      }),
      T({ // Agrandissement et aire
        base: {k: 3, L: 4, A: 10},
        params: r => ({k: r.pick([0.5, 1.5, 2, 2.5, 3, 4, 0.2, 0.4]), L: r.int(2, 15), A: r.int(5, 60)}),
        difficulty: ({k, L, A}) => score({steps: 2, values: [k * L, k * k * A], decimals: !Number.isInteger(k)}),
        verify: ({k, L, A}, v) => close(v[0], k * L) && close(v[1], k * k * A),
        build: ({k, L, A}) => { const big = k > 1;
          return item(big ? 'Agrandir une figure' : 'Réduire une figure', `Une figure d’aire ${A} cm² possède un côté de ${L} cm. On ${big ? 'l’agrandit' : 'la réduit'} à l’échelle ${fr(k)}.`,
            [Q('Longueur du côté image, en cm', k * L), Q('Aire de la figure image, en cm²', k * k * A)],
            C('dans un agrandissement ou une réduction de rapport k, les longueurs sont multipliées par k et les aires par k².',
              [`Côté : ${L} × ${fr(k)} = ${fr(k * L)} cm.`, `Aire : ${A} × ${fr(k)}² = ${A} × ${fr(k * k)} = ${fr(k * k * A)} cm².`],
              `le côté image mesure ${fr(k * L)} cm et l’aire image ${fr(k * k * A)} cm².`),
            'L’aire n’est pas multipliée par k, mais par k × k.'); }
      }),
      T({ // Triangles semblables
        base: {a: 4, b: 6, c: 7, k: 15},
        params: r => ({a: r.int(3, 10), b: r.int(4, 12), c: r.int(5, 15), k: r.pick([5, 15, 20, 25, 30, 35, 40])}),
        accept: ({a, b, c}) => a < b && b < c && c < a + b,
        difficulty: ({a, b, c, k}) => score({steps: 3, values: [b * k / 10, c * k / 10], decimals: k % 10 !== 0}),
        verify: ({a, b, c, k}, v) => close(v[0], k / 10) && close(v[1], b * v[0]) && close(v[2], c * v[0]),
        build: ({a, b, c, k}) => { const q = k / 10;
          return item('Utiliser des triangles semblables', `Les triangles ABC et DEF sont semblables, avec AB = ${a} cm, AC = ${b} cm, BC = ${c} cm. Le côté DE, homologue de AB, mesure ${fr(a * q)} cm.`,
            [Q('Rapport de DEF par rapport à ABC', q), Q('DF, en cm', b * q), Q('EF, en cm', c * q)],
            C('deux triangles semblables ont des côtés homologues proportionnels : on calcule le rapport, puis on multiplie.',
              [`k = DE/AB = ${fr(a * q)}/${a} = ${fr(q)}.`, `DF = ${b} × ${fr(q)} = ${fr(b * q)} cm ; EF = ${c} × ${fr(q)} = ${fr(c * q)} cm.`],
              `le rapport vaut ${fr(q)}, DF = ${fr(b * q)} cm et EF = ${fr(c * q)} cm.`),
            'Associe chaque côté à son homologue avant de calculer.'); }
      })
    ],

    /* ---------- 14 · Trigonométrie ---------- */
  };

  const basics = {
    '3-thales': ['Thalès demande deux droites parallèles et des points alignés.', 'Un triangle est agrandi deux fois. Un côté de 3 cm devient ?', '6', 'Multiplie par 2.'],
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
    '3-thales': [
      ({am, ab, an, bc}) => { const ac = an * ab / am, A = tri(ab, bc, ac);
        if (!A || !lisible([[0, 0], [bc, 0], A])) return {};
        return {e: FG.figure(`Triangle ABC avec M sur [AB] et N sur [AC] : (MN) parallèle à (BC)`, {hauteur: 220}).point('B', 0, 0).point('C', bc, 0).point('A', A[0], A[1])
          .point('M', null, null, {sur: ['A', 'B'], k: am / ab}).point('N', null, null, {sur: ['A', 'C'], k: am / ab})
          .polygone(['A', 'B', 'C']).segment('M', 'N').parallele('M', 'N').parallele('B', 'C')
          .cote('A', 'M', am + ' cm').cote('A', 'N', an + ' cm').cote('B', 'C', bc + ' cm').cote_fleche('A', 'B', 'AB = ' + ab + ' cm', {decalage: 26}).description()}; },
      ({ab, am, bc, ac}) => { const A = tri(ab, bc, ac);
        if (!A || !lisible([[0, 0], [bc, 0], A])) return {};
        return {e: FG.figure(`Configuration papillon : (BC) parallèle à (MN), droites sécantes en A`, {hauteur: 230}).point('B', 0, 0).point('C', bc, 0).point('A', A[0], A[1])
          .point('M', null, null, {sur: ['A', 'B'], k: -am / ab}).point('N', null, null, {sur: ['A', 'C'], k: -am / ab})
          .segment('B', 'M').segment('C', 'N').segment('B', 'C').segment('M', 'N').parallele('B', 'C').parallele('N', 'M')
          .cote('A', 'B', ab + ' cm').cote('A', 'M', am + ' cm').cote('B', 'C', bc + ' cm').cote('A', 'C', ac + ' cm').cote('M', 'N', '?').description()}; },
      ({am, ab, k, on, s}) => { const an = am * k + (on ? 0 : s), ac = ab * k, u = [Math.cos(-2.0), Math.sin(-2.0)], v = [Math.cos(-0.9), Math.sin(-0.9)];
        return {e: FG.figure(`Points A, M, B alignés et A, N, C alignés : AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm, AC = ${ac} cm`, {hauteur: 230})
          .point('A', 0, 0).point('B', ab * u[0], ab * u[1]).point('C', ac * v[0], ac * v[1]).point('M', am * u[0], am * u[1]).point('N', an * v[0], an * v[1])
          .polygone(['A', 'B', 'C']).segment('M', 'N').cote('A', 'M', am + ' cm').cote('A', 'N', an + ' cm')
          .cote_fleche('A', 'B', 'AB = ' + ab + ' cm', {decalage: 26}).cote_fleche('A', 'C', 'AC = ' + ac + ' cm', {decalage: 26}).description()}; },
      ({h, s, S}) => { const bh = h / 10, bs = s / 10, as = S / 10, H = bh * as / bs, x = bs + 0.25 * as;
        return {e: FG.figure(`Bâton de ${fr(bh)} m et son ombre de ${fr(bs)} m ; arbre et son ombre de ${fr(as)} m`, {hauteur: 250})
          .sol(-0.08 * as, x + as * 1.06, 0).baton([0, 0], [0, bh]).sapin(x, 0, H, {l: Math.min(0.45 * H, 0.4 * as)})
          .segment([0, bh], [bs, 0], {pointilles: true, fin: true}).segment([x, H], [x + as, 0], {pointilles: true, fin: true}).ombre([0, 0], [bs, 0]).ombre([x, 0], [x + as, 0])
          .cote([0, 0], [0, bh], fr(bh) + ' m', {pos: 'no'}).cote_fleche([0, 0], [bs, 0], fr(bs) + ' m', {pos: 's', decalage: 12})
          .cote_fleche([x, 0], [x + as, 0], fr(as) + ' m', {pos: 's', decalage: 12}).cote([x, 0], [x, H], '?', {pos: 'e'}).description()}; },
      null,
      ({a, b, c, k}) => { const q = k / 10, P = tri(a, c, b), d = c + Math.max(1.5, 0.25 * c);
        if (!P || !lisible([[0, 0], [c, 0], P])) return {};
        return {e: FG.figure(`Triangles semblables ABC et DEF : AB = ${a} cm, AC = ${b} cm, BC = ${c} cm, DE = ${fr(a * q)} cm`, {hauteur: 200})
          .point('B', 0, 0).point('C', c, 0).point('A', P[0], P[1]).point('E', d, 0).point('F', d + c * q, 0).point('D', d + P[0] * q, P[1] * q)
          .polygone(['A', 'B', 'C']).polygone(['D', 'E', 'F']).cote('A', 'B', a + ' cm').cote('A', 'C', b + ' cm').cote('B', 'C', c + ' cm')
          .cote('D', 'E', fr(a * q) + ' cm').cote('D', 'F', '?').cote('E', 'F', '?').description()}; }
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
