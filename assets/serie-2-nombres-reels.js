/* Série 2-nombres-reels : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-nombres-reels': [
      T({ // Appartenance à un intervalle
        base: {a: -2, b: 5, kind: 1, x: 5},
        params: r => { const a = r.int(-9, 5), b = a + r.int(3, 12), kind = r.int(0, 1);
          return {a, b, kind, x: kind ? r.pick([b, a - r.int(1, 4), b + r.int(1, 4)]) : r.int(a, b - 1)}; },
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, b - a]}),
        verify: ({a, b, x}, v) => (v[0] === 'oui') === (x >= a && x < b) && v[1] === b - a,
        build: ({a, b, x}) => { const ok = x >= a && x < b;
          return item('Utiliser un intervalle', `On considère l’intervalle I = ${fmt.interval(a, b, '[', '[')}. Le réel ${fr(x)} appartient-il à I ? Quelle est l’amplitude de I ?`,
            [S(`${fr(x)} appartient-il à I ?`, ok ? 'oui' : 'non', ['oui', 'non']), Q('Amplitude de I', b - a)],
            C(`I contient les réels x tels que ${fr(a)} ≤ x < ${fr(b)} : le crochet tourné vers l’extérieur exclut la borne ${fr(b)}.`,
              [ok ? `${fr(a)} ≤ ${fr(x)} < ${fr(b)}.` : x === b ? `${fr(b)} est exclu par le crochet.` : `${fr(x)} est en dehors de [${fr(a)} ; ${fr(b)}].`, `Amplitude : ${fmt.diff(b, a)} = ${b - a}.`],
              `${fr(x)} ${ok ? 'appartient' : 'n’appartient pas'} à I, d’amplitude ${b - a}.`),
            'Regarde le sens de chaque crochet.'); }
      }),
      T({ // Distance entre deux réels
        base: {a: -3, b: 8},
        params: r => ({a: r.int(-30, 30), b: r.int(-30, 30)}),
        accept: ({a, b}) => Math.abs(a - b) >= 3 && a !== 0 && b !== 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, a - b], negatives: true}),
        verify: ({a, b}, v) => v[0] === Math.abs(a - b) && close(v[1], (a + b) / 2),
        build: ({a, b}) => item('Calculer une distance sur la droite numérique', `Sur la droite numérique, A a pour abscisse ${fr(a)} et B pour abscisse ${fr(b)}.`,
          [Q('Distance AB = |a − b|', Math.abs(a - b)), Q('Abscisse du milieu de [AB]', (a + b) / 2)],
          C('la distance entre deux réels a et b est |a − b| ; le milieu a pour abscisse (a + b)/2.',
            [`|${fmt.diff(a, b)}| = |${fr(a - b)}| = ${Math.abs(a - b)}.`, `(${fr(a)} + ${pa(b)}) ÷ 2 = ${fr((a + b) / 2)}.`],
            `AB = ${Math.abs(a - b)} et le milieu a pour abscisse ${fr((a + b) / 2)}.`),
          'Une distance est toujours positive.')
      }),
      T({ // |x − a| ≤ r
        base: {a: 3, r: 2},
        params: r => ({a: r.int(-15, 15), r: r.int(1, 12) / (r.chance(0.3) ? 2 : 1)}),
        accept: ({a}) => a !== 0,
        difficulty: ({a, r}) => score({steps: 2, values: [a, r, a + r], negatives: true}),
        verify: ({a, r}, v) => close(v[0], a - r) && close(v[1], a + r),
        build: ({a, r}) => item('Traduire une valeur absolue en intervalle', `Écris l’ensemble des réels x tels que |x ${a > 0 ? M : '+'} ${fr(Math.abs(a))}| ≤ ${fr(r)} sous la forme d’un intervalle [m ; M].`,
          [Q('Borne m', a - r), Q('Borne M', a + r)],
          C(`|x − a| ≤ r signifie que la distance entre x et a est au plus r : x ∈ [a − r ; a + r].`,
            [`Ici a = ${fr(a)} et r = ${fr(r)}.`, `[${fr(a)} ${M} ${fr(r)} ; ${fr(a)} + ${fr(r)}] = [${fr(a - r)} ; ${fr(a + r)}].`],
            `l’ensemble cherché est [${fr(a - r)} ; ${fr(a + r)}].`),
          `Repère le centre a : |x ${a > 0 ? M : '+'} ${fr(Math.abs(a))}| est la distance entre x et ${fr(a)}.`)
      }),
      T({ // Encadrement décimal
        base: {n: 7, k: 2},
        params: r => ({n: r.int(2, 99), k: r.int(1, 3)}),
        accept: ({n}) => !Number.isInteger(Math.sqrt(n)),
        difficulty: ({n}) => score({steps: 2, values: [n], decimals: true}),
        verify: ({n, k}, v) => { const s = Math.sqrt(n); return v[0] <= s && s < v[1] && close(v[1] - v[0], 10 ** -k); },
        build: ({n, k}) => { const lo = Math.floor(Math.sqrt(n) * 10 ** k) / 10 ** k, hi = r2(lo + 10 ** -k, k);
          return item('Encadrer un nombre irrationnel', `Donne un encadrement de √${n} d’amplitude 10${sup(-k)}, par deux décimaux à ${k} chiffre${k > 1 ? 's' : ''} après la virgule.`,
            [Q('Borne inférieure', lo, k), Q('Borne supérieure', hi, k)],
            C('on cherche deux décimaux consécutifs à 10<sup>−' + k + '</sup> près dont les carrés encadrent ' + n + '.',
              [`${fr(lo)}² = ${fr(r2(lo * lo, 2 * k))} et ${fr(hi)}² = ${fr(r2(hi * hi, 2 * k))}.`, `${fr(r2(lo * lo, 2 * k))} ≤ ${n} < ${fr(r2(hi * hi, 2 * k))}.`],
              `${fr(lo)} ≤ √${n} < ${fr(hi)}.`),
            'Un algorithme par balayage augmente la borne de 10⁻ⁿ tant que son carré reste inférieur au nombre.'); }
      }),
      T({ // Chiffres significatifs
        base: {m: 34567, e: -2},
        params: r => ({m: r.int(10001, 99999), e: r.int(-6, 0)}),
        accept: ({m}) => m % 100 > 9 && m % 1000 > 99,
        difficulty: ({e}) => score({steps: 2, values: [Math.abs(e) * 10], decimals: true}),
        verify: ({m, e}, v) => { const x = m * 10 ** e; return close(v[0], sig(x, 2)) && close(v[1], sig(x, 3)); },
        build: ({m, e}) => { const x = m * 10 ** e, a = sig(x, 2), b = sig(x, 3);
          return item('Arrondir avec des chiffres significatifs', `Une mesure donne ${decimal(m, e)}. Arrondis-la avec 2 chiffres significatifs, puis avec 3.`,
            [Q('Arrondi à 2 chiffres significatifs', a, 9), Q('Arrondi à 3 chiffres significatifs', b, 9)],
            C('on compte les chiffres à partir du premier chiffre non nul, puis on arrondit au dernier chiffre conservé.',
              [`${decimal(m, e)} ≈ ${decimal(Math.round(m / 1000), e + 3)} (2 chiffres) et ≈ ${decimal(Math.round(m / 100), e + 2)} (3 chiffres).`],
              `${decimal(Math.round(m / 1000), e + 3)} et ${decimal(Math.round(m / 100), e + 2)}.`),
            'Les zéros placés avant le premier chiffre non nul ne comptent pas.'); }
      }),
      T({ // Intersection et réunion d'intervalles
        base: {a: -3, b: 4, c: 1, d: 9},
        params: r => { const a = r.int(-12, 6), b = a + r.int(3, 12), c = r.int(a + 1, b - 1), d = b + r.int(1, 10); return {a, b, c, d}; },
        difficulty: ({a, d}) => score({steps: 2, values: [a, d], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === Math.max(a, c) && v[1] === Math.min(b, d) && v[2] === Math.min(a, c) && v[3] === Math.max(b, d),
        build: ({a, b, c, d}) => item('Réunir et intersecter des intervalles', `I = [${fr(a)} ; ${fr(b)}] et J = [${fr(c)} ; ${fr(d)}]. Détermine I ∩ J = [m ; M] et I ∪ J = [p ; P].`,
          [Q('m', c), Q('M', b), Q('p', a), Q('P', d)],
          C('I ∩ J contient les réels qui sont dans les deux intervalles ; I ∪ J ceux qui sont dans l’un au moins.',
            [`Sur la droite numérique : ${fr(a)} < ${fr(c)} < ${fr(b)} < ${fr(d)}.`],
            `I ∩ J = [${fr(c)} ; ${fr(b)}] et I ∪ J = [${fr(a)} ; ${fr(d)}].`),
          'Représente les deux intervalles sur une même droite graduée.')
      })
    ],

    /* ---------- 03 · Calcul algébrique ---------- */
  };

  const basics = {
    '2-nombres-reels': ['Un intervalle regroupe les réels compris entre deux bornes.', 'Amplitude de [2 ; 9] ?', '7', '9 − 2.'],
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
    '2-nombres-reels': [
      ({a, b, x}) => { const lo = Math.min(a, x) - 2, hi = Math.max(b, x) + 2, ok = x >= a && x < b;
        const base = titre => FG.droite_numerique(titre, {min: lo, max: hi, pas: pasDe(hi - lo)}).intervalle(a, b, {ouvert_b: true});
        return {e: base(`L’intervalle I = [${fr(a)} ; ${fr(b)}[ sur la droite numérique`).description(),
          c: base(`Le réel ${fr(x)} ${ok ? 'appartient' : 'n’appartient pas'} à I`).point(x, null, {ligne: 0, haut: true}).description()}; },
      ({a, b}) => { const lo = Math.min(a, b) - 2, hi = Math.max(a, b) + 2, base = titre => FG.droite_numerique(titre, {min: lo, max: hi, pas: pasDe(hi - lo)}).point(a, 'A').point(b, 'B');
        return {e: base(`Points A et B d’abscisses ${fr(a)} et ${fr(b)}`).description(),
          c: base(`La distance AB est l’écart entre les deux abscisses`).distance(a, b, 'AB = ' + fr(Math.abs(a - b))).description()}; },
      ({a, r}) => ({c: FG.droite_numerique(`Les réels situés à une distance au plus ${fr(r)} de ${fr(a)}`, {min: a - r - 2, max: a + r + 2, pas: pasDe(2 * r + 4)}).centre_rayon(a, r).description()}),
      null, null,
      ({a, b, c, d}) => { const lo = Math.min(a, c) - 1, hi = Math.max(b, d) + 1, m = Math.max(a, c), M2 = Math.min(b, d), options = noms => ({min: lo, max: hi, pas: pasDe(hi - lo), noms_lignes: noms});
        const base = (titre, noms) => FG.droite_numerique(titre, options(noms)).intervalle(a, b, {ligne: 0}).intervalle(c, d, {ligne: 1});
        return {e: base(`Les intervalles I = [${fr(a)} ; ${fr(b)}] et J = [${fr(c)} ; ${fr(d)}]`, ['I', 'J']).description(),
          c: m <= M2 ? base(`Intersection : la partie commune à I et J ; réunion : tout ce qui est couvert par I ou J`, ['I', 'J', 'I ∩ J', 'I ∪ J']).intervalle(m, M2, {ligne: 2}).intervalle(Math.min(a, c), Math.max(b, d), {ligne: 3}).description() : null}; }
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
