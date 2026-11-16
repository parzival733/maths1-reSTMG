/* Série 3-algorithmique : extrait de assets/troisieme-exercices.js par tools/build_series.py.
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
    '3-algorithmique': [
      T({ // Programme à entrée
        base: {a: 3, b: -4, n: 5, y: 11},
        params: r => ({a: r.nonZero(2, 6), b: r.nonZero(1, 12), n: r.int(-6, 9), y: r.int(-6, 9)}),
        accept: ({n, y}) => n !== y && n !== 0 && y !== 0,
        difficulty: ({a, b, n, y}) => score({steps: 2, values: [a * n + b, a * y + b], negatives: true}),
        verify: ({a, b, n, y}, v) => v[0] === a * n + b && a * v[1] + b === a * y + b,
        build: ({a, b, n, y}) => { const out = a * y + b; return item('Exécuter un programme', `Un programme Scratch demande un nombre x, puis ${code('mettre résultat à (' + fr(a) + ' * x) + (' + fr(b) + ')')} et dit le résultat.`,
          [Q(`Résultat affiché pour x = ${fr(n)}`, a * n + b), Q(`Nombre choisi si le résultat affiché est ${fr(out)}`, y)],
          C('le programme calcule ' + lin(a, b) + ' ; pour remonter au nombre de départ, on résout une équation.',
            [`Pour ${fr(n)} : ${fr(a)} × ${pa(n)}${sg(b)} = ${fr(a * n + b)}.`, `${lin(a, b)} = ${fr(out)} donne ${mono(a)} = ${fr(out - b)}, donc x = ${fr(y)}.`],
            `le programme affiche ${fr(a * n + b)} pour ${fr(n)} ; il faut choisir ${fr(y)} pour obtenir ${fr(out)}.`),
          'Écris l’expression calculée par le programme.'); }
      }),
      T({ // Boucle « répéter »
        base: {s0: 5, a: 4, k: 6, t: 20},
        params: r => ({s0: r.int(0, 20), a: r.int(2, 9), k: r.int(3, 12), t: r.int(15, 60)}),
        accept: ({s0, t}) => t > s0 + 5,
        difficulty: ({s0, a, k}) => score({steps: 3, values: [s0 + a * k, k]}),
        verify: ({s0, a, k, t}, v) => v[0] === s0 + a * k && s0 + a * v[1] >= t && s0 + a * (v[1] - 1) < t,
        build: ({s0, a, k, t}) => { const need = Math.ceil((t - s0) / a);
          return item('Suivre une boucle', `On exécute : ${code('mettre s à ' + s0)} puis ${code('répéter ' + k + ' fois : ajouter ' + a + ' à s')}.`,
            [Q('Valeur finale de s', s0 + a * k), Q(`Nombre minimal de répétitions pour que s atteigne au moins ${t}`, need)],
            C('à chaque tour de boucle, s augmente de ' + a + ' : après n tours, s = ' + s0 + ' + ' + a + 'n.',
              [`Après ${k} tours : ${s0} + ${a} × ${k} = ${s0 + a * k}.`, `${s0} + ${a}n ≥ ${t} donne n ≥ ${fr(r2((t - s0) / a))}, soit au moins ${need} tours.`],
              `s vaut ${s0 + a * k} à la fin ; il faut au moins ${need} répétitions pour atteindre ${t}.`),
            'Dresse un tableau des valeurs de s tour après tour.'); }
      }),
      T({ // Instruction conditionnelle
        base: {s: 10, p: 14, q: 6},
        params: r => ({s: r.int(5, 20), p: r.int(1, 30), q: r.int(1, 30)}),
        accept: ({s, p, q}) => p > s && q < s,
        difficulty: ({s, p, q}) => score({steps: 2, values: [2 * p - s, s - q]}),
        verify: ({s, p, q}, v) => v[0] === 2 * p - s && v[1] === s - q,
        build: ({s, p, q}) => item('Exécuter une instruction conditionnelle', `Programme : demander x ; ${code('si x > ' + s + ' alors dire (2 * x) − ' + s + ' sinon dire ' + s + ' − x')}.`,
          [Q(`Nombre dit pour x = ${p}`, 2 * p - s), Q(`Nombre dit pour x = ${q}`, s - q)],
          C('on teste la condition x > ' + s + ' : si elle est vraie, on exécute la première instruction ; sinon, la seconde.',
            [`${p} > ${s} est vrai : 2 × ${p} ${M} ${s} = ${2 * p - s}.`, `${q} > ${s} est faux : ${s} ${M} ${q} = ${s - q}.`],
            `le programme dit ${2 * p - s} pour ${p} et ${s - q} pour ${q}.`),
          'Vérifie d’abord si la condition est vraie ou fausse.')
      }),
      T({ // Tracer un polygone
        base: {n: 6, L: 50},
        params: r => ({n: r.pick([3, 4, 5, 6, 8, 9, 10, 12]), L: 10 * r.int(2, 15)}),
        difficulty: ({n, L}) => score({steps: 2, values: [360 / n, n * L]}),
        verify: ({n, L}, v) => close(v[0], 360 / n) && v[1] === n * L,
        build: ({n, L}) => item('Programmer le tracé d’un polygone', `Pour tracer un polygone régulier à ${n} côtés, un lutin exécute ${code('répéter ' + n + ' fois : avancer de ' + L + ' ; tourner de a degrés')}.`,
          [Q('Angle a, en degrés', 360 / n), Q('Longueur totale parcourue, en pas', n * L)],
          C('le lutin fait un tour complet en ' + n + ' rotations égales ; il tourne donc de 360° ÷ ' + n + ' à chaque fois.',
            [`a = 360 ÷ ${n} = ${fr(360 / n)}°.`, `Parcours : ${n} × ${L} = ${n * L} pas.`],
            `a = ${fr(360 / n)}° et le lutin parcourt ${n * L} pas.`),
          'L’angle dont tourne le lutin n’est pas l’angle intérieur du polygone.')
      }),
      T({ // Boucle « répéter jusqu'à »
        base: {a: 3, q: 2, M: 100},
        params: r => ({a: r.int(1, 9), q: r.pick([2, 3]), M: 10 * r.int(5, 100)}),
        accept: ({a, M}) => M > 4 * a,
        difficulty: ({a, q, M}) => { let x = a, n = 0; while (x <= M) { x *= q; n++; } return score({steps: 3, values: [x, n]}); },
        verify: ({a, q, M}, v) => v[1] === a * q ** v[0] && v[1] > M && a * q ** (v[0] - 1) <= M,
        build: ({a, q, M}) => { let x = a, n = 0; const seen = [a]; while (x <= M) { x *= q; n++; seen.push(x); }
          return item('Suivre une boucle « répéter jusqu’à »', `On exécute : ${code('mettre x à ' + a)} puis ${code('répéter jusqu’à x > ' + M + ' : mettre x à x * ' + q)}.`,
            [Q('Nombre de tours de boucle', n), Q('Valeur finale de x', x)],
            C('on teste la condition avant chaque tour ; la boucle s’arrête dès que x dépasse ' + M + '.',
              [`Valeurs successives de x : ${seen.join(' ; ')}.`],
              `la boucle fait ${n} tours et x vaut ${x} à la fin.`),
            'Écris toutes les valeurs prises par x.'); }
      }),
      T({ // Compter et additionner dans une liste
        base: {v: [12, 5, 18, 9, 21, 7, 15], s: 10},
        params: r => ({v: Array.from({length: 7}, () => r.int(1, 30)), s: r.int(8, 20)}),
        accept: ({v, s}) => { const n = v.filter(x => x > s).length; return n >= 2 && n <= 5 && !v.includes(s); },
        difficulty: ({v, s}) => score({steps: 2, values: [sum(v.filter(x => x > s))]}),
        verify: ({v, s}, w) => w[0] === v.filter(x => x > s).length && w[1] === sum(v.filter(x => x > s)),
        build: ({v, s}) => { const kept = v.filter(x => x > s);
          return item('Parcourir une liste', `La liste L contient ${v.join(' ; ')}. Pour chaque élément e de L : ${code('si e > ' + s + ' alors ajouter 1 à n et ajouter e à t')} (n et t valent 0 au départ).`,
            [Q('Valeur finale de n', kept.length), Q('Valeur finale de t', sum(kept))],
            C('n compte les éléments strictement supérieurs à ' + s + ' et t les additionne.',
              [`Éléments supérieurs à ${s} : ${kept.join(' ; ')}.`, `n = ${kept.length} et t = ${kept.join(' + ')} = ${sum(kept)}.`],
              `n = ${kept.length} et t = ${sum(kept)}.`),
            'Une valeur égale à ' + s + ' ne vérifierait pas la condition e > ' + s + '.'); }
      })
    ]
  };

  const basics = {
    '3-algorithmique': ['Exécute le programme ligne par ligne en notant la valeur des variables.', 'x vaut 4 ; on lui ajoute 3 deux fois. Que vaut x ?', '10', '4 puis 7 puis 10.']
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
    '3-algorithmique': [null, null, null,
      ({n, L}) => ({c: FG.programme_trace(`Polygone à ${n} côtés tracé par le lutin : ${n} fois « avancer de ${L}, tourner de ${fr(360 / n)}° »`, n, 360 / n, {cote: String(L), hauteur: 220}).description()})
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
