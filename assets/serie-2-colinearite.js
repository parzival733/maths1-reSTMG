/* Série 2-colinearite : extrait de assets/seconde-exercices.js par tools/build_series.py.
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
    '2-colinearite': [
      T({ // Déterminant
        base: {a: 2, b: 3, k: 2, on: 1, s: 1},
        params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 8), k: r.nonZero(2, 4), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 2, values: [40], negatives: true}),
        verify: ({a, b, k, on, s}, v) => { const c = k * a, d = k * b + (on ? 0 : s); return v[0] === det(a, b, c, d) && (v[1] === 'oui') === (v[0] === 0); },
        build: ({a, b, k, on, s}) => { const c = k * a, d = k * b + (on ? 0 : s), D = det(a, b, c, d);
          return item('Tester la colinéarité', `<span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>v</span>${vec(c, d)}. Calcule det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>). Les vecteurs sont-ils colinéaires ?`,
            [Q('Déterminant de u et v', D), S('Colinéaires ?', D === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = xy′ − x′y ; deux vecteurs sont colinéaires si et seulement si leur déterminant est nul.',
              [`det = ${fr(a)} × ${pa(d)} ${M} ${pa(c)} × ${pa(b)} = ${fr(D)}.`],
              D === 0 ? 'le déterminant est nul : <span class="vec"><span class="sr-only">vecteur </span>u</span> et <span class="vec"><span class="sr-only">vecteur </span>v</span> sont colinéaires.' : 'le déterminant n’est pas nul : <span class="vec"><span class="sr-only">vecteur </span>u</span> et <span class="vec"><span class="sr-only">vecteur </span>v</span> ne sont pas colinéaires.'),
            'Croise les coordonnées : abscisse de l’un par ordonnée de l’autre.'); }
      }),
      T({ // Alignement
        base: {xa: 1, ya: 2, dx: 2, dy: 3, k: 3, on: 0, s: 1},
        params: r => ({xa: r.int(-6, 6), ya: r.int(-6, 6), dx: r.nonZero(1, 4), dy: r.nonZero(1, 4), k: r.int(2, 3), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 3, values: [30], negatives: true}),
        verify: ({dx, dy, k, on, s}, v) => { const D = det(dx, dy, k * dx, k * dy + (on ? 0 : s)); return v[0] === D && (v[1] === 'oui') === (D === 0); },
        build: ({xa, ya, dx, dy, k, on, s}) => { const B = [xa + dx, ya + dy], Cc = [xa + k * dx, ya + k * dy + (on ? 0 : s)], D = det(dx, dy, Cc[0] - xa, Cc[1] - ya);
          return item('Démontrer un alignement', `A${vec(xa, ya)}, B${vec(...B)} et C${vec(...Cc)}. Les points A, B et C sont-ils alignés ?`,
            [Q('Déterminant des vecteurs AB et AC', D), S('A, B et C sont-ils alignés ?', D === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('A, B et C sont alignés si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>AC</span> sont colinéaires.',
              [`<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(dx, dy)} et <span class="vec"><span class="sr-only">vecteur </span>AC</span>${vec(Cc[0] - xa, Cc[1] - ya)}.`, `det = ${fr(dx)} × ${pa(Cc[1] - ya)} ${M} ${pa(Cc[0] - xa)} × ${pa(dy)} = ${fr(D)}.`],
              D === 0 ? 'les points A, B et C sont alignés.' : 'les points A, B et C ne sont pas alignés.'),
            'Calcule d’abord les coordonnées de <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>AC</span>.'); }
      }),
      T({ // Paramètre de colinéarité
        base: {a: 2, b: 5, c: 4},
        params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 9), c: r.nonZero(1, 12)}),
        accept: ({a, c}) => Math.abs(a) !== Math.abs(c),
        difficulty: ({a, b, c}) => score({steps: 2, values: [b * c / a], fractions: (b * c) % a !== 0, negatives: true}),
        verify: ({a, b, c}, v) => close(a * v[0] - b * c, 0) && close(v[1], c / a),
        build: ({a, b, c}) => item('Trouver une coordonnée manquante', `<span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>v</span>(${fr(c)} ; m). Pour quelle valeur de m les vecteurs sont-ils colinéaires ? On a alors <span class="vec"><span class="sr-only">vecteur </span>v</span> = k<span class="vec"><span class="sr-only">vecteur </span>u</span>.`,
          [Q('Valeur de m', b * c / a), Q('Valeur de k', c / a)],
          C('colinéaires équivaut à det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = 0, soit ' + fr(a) + ' × m − ' + pa(c) + ' × ' + pa(b) + ' = 0.',
            [`${fr(a)}m = ${fr(b * c)}, donc m = ${frac(b * c, a)}.`, `k = ${fr(c)} ÷ ${pa(a)} = ${frac(c, a)}.`],
            `m = ${frac(b * c, a)} et <span class="vec"><span class="sr-only">vecteur </span>v</span> = ${frac(c, a)} <span class="vec"><span class="sr-only">vecteur </span>u</span>.`),
          'Écris que le déterminant est nul.')
      }),
      T({ // Triangle isocèle ?
        base: {xa: 0, ya: 0, b1: 3, b2: 4, kind: 1},
        params: r => ({xa: r.int(-5, 5), ya: r.int(-5, 5), b1: r.nonZero(1, 6), b2: r.nonZero(1, 6), kind: r.int(0, 1)}),
        accept: ({b1, b2}) => Math.abs(b1) !== Math.abs(b2) && b1 !== -1,
        difficulty: () => score({steps: 3, values: [60]}),
        verify: ({b1, b2, kind}, v) => { const c = kind ? [b2, -b1] : [b2, b1 + 1]; return v[0] === b1 * b1 + b2 * b2 && v[1] === c[0] ** 2 + c[1] ** 2 && (v[2] === 'oui') === (v[0] === v[1]); },
        build: ({xa, ya, b1, b2, kind}) => { const c = kind ? [b2, -b1] : [b2, b1 + 1], B = [xa + b1, ya + b2], Cc = [xa + c[0], ya + c[1]], AB2 = b1 * b1 + b2 * b2, AC2 = c[0] ** 2 + c[1] ** 2;
          return item('Étudier la nature d’un triangle', `A${vec(xa, ya)}, B${vec(...B)} et C${vec(...Cc)}. Le triangle ABC est-il isocèle en A ?`,
            [Q('AB²', AB2), Q('AC²', AC2), S('ABC est-il isocèle en A ?', AB2 === AC2 ? 'oui' : 'non', ['oui', 'non'])],
            C('dans un repère orthonormé, AB² = (x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)².',
              [`AB² = ${pa(b1)}² + ${pa(b2)}² = ${AB2}.`, `AC² = ${pa(c[0])}² + ${pa(c[1])}² = ${AC2}.`],
              AB2 === AC2 ? 'AB = AC : ABC est isocèle en A.' : 'AB ≠ AC : ABC n’est pas isocèle en A.'),
            'Compare les carrés des distances, inutile de prendre les racines.'); }
      }),
      T({ // Projeté orthogonal sur la droite y = x
        base: {x: 5, y: 1},
        params: r => ({x: r.int(-9, 9), y: r.int(-9, 9)}),
        accept: ({x, y}) => x !== y && Math.abs(x - y) >= 2,
        difficulty: () => score({steps: 3, values: [9], decimals: true, negatives: true}),
        verify: ({x, y}, v) => close(v[0], (x + y) / 2) && close(v[1], (x + y) / 2) && close(v[2], Math.abs(x - y) / Math.SQRT2),
        build: ({x, y}) => { const h = (x + y) / 2, d = Math.abs(x - y) / Math.SQRT2;
          return item('Déterminer un projeté orthogonal', `Dans un repère orthonormé, Δ est la droite d’équation y = x et M${vec(x, y)}. On note H le projeté orthogonal de M sur Δ.`,
            [Q('Abscisse de H', h), Q('Ordonnée de H', h), Q('Distance MH', d)],
            C('H est sur Δ, donc H(t ; t), et <span class="vec"><span class="sr-only">vecteur </span>MH</span> est orthogonal au vecteur directeur (1 ; 1) de Δ : (' + tMinus('t', x) + ') + (' + tMinus('t', y) + ') = 0.',
              [`2t = ${fr(x + y)}, donc t = ${fr(h)}.`, `MH² = (${fmt.diff(h, x)})² + (${fmt.diff(h, y)})² = ${fr(2 * (h - x) ** 2)} ; MH ${eq(d)}.`],
              `H${vec(h, h)} et MH ${eq(d)}. H est le point de Δ le plus proche de M.`),
            'Le projeté orthogonal est le point de la droite le plus proche de M.'); }
      }),
      T({ // Parallélisme de deux droites
        base: {a: 1, b: 2, k: 2, on: 1, s: 1},
        params: r => ({a: r.nonZero(1, 6), b: r.nonZero(1, 6), k: r.nonZero(1, 3), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 3, values: [30], negatives: true}),
        verify: ({a, b, k, on, s}, v) => { const D = det(a, b, k * a, k * b + (on ? 0 : s)); return v[0] === D && (v[1] === 'oui') === (D === 0); },
        build: ({a, b, k, on, s}) => { const A = [0, 1], B = [a, 1 + b], Cc = [3, -2], Dd = [3 + k * a, -2 + k * b + (on ? 0 : s)], D = det(a, b, Dd[0] - 3, Dd[1] + 2);
          return item('Démontrer un parallélisme', `A${vec(...A)}, B${vec(...B)}, C${vec(...Cc)} et D${vec(...Dd)}. Les droites (AB) et (CD) sont-elles parallèles ?`,
            [Q('Déterminant des vecteurs AB et CD', D), S('(AB) et (CD) sont-elles parallèles ?', D === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('(AB) et (CD) sont parallèles si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>CD</span> sont colinéaires.',
              [`<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>CD</span>${vec(Dd[0] - 3, Dd[1] + 2)} ; det = ${fr(a)} × ${pa(Dd[1] + 2)} ${M} ${pa(Dd[0] - 3)} × ${pa(b)} = ${fr(D)}.`],
              D === 0 ? 'les droites (AB) et (CD) sont parallèles.' : 'les droites (AB) et (CD) sont sécantes.'),
            'Utilise le déterminant des deux vecteurs directeurs.'); }
      })
    ],

    /* ---------- 07 · Droites du plan ---------- */
  };

  const basics = {
    '2-colinearite': ['Deux vecteurs sont colinéaires si leur déterminant est nul.', 'det((1 ; 2), (3 ; 6)) ?', '0', '1 × 6 − 3 × 2.'],
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
    '2-colinearite': [null,
      (p, ex) => { const pts = pointsDe(ex.statement);
        return {c: placer(repereDe(`Points ${liste(pts)} et droite (AB)`, [pts.A, pts.B, pts.C]), pts, ['A', 'B', 'C']).polygone([pts.A, pts.B], {pointilles: true, fin: true}).description()}; },
      null,
      (p, ex) => { const pts = pointsDe(ex.statement);
        return {c: placer(repereDe(`Triangle ABC : ${liste(pts)}`, [pts.A, pts.B, pts.C]).polygone([pts.A, pts.B, pts.C]), pts, ['A', 'B', 'C']).description()}; },
      ({x, y}) => { const h = (x + y) / 2, cadre = [[x, y], [h, h], [Math.min(x, y) - 1, Math.min(x, y) - 1], [Math.max(x, y) + 1, Math.max(x, y) + 1]];
        const base = titre => repereDe(titre, cadre).droite_affine(1, 0, {nom: 'Δ'}).point(x, y, 'M');
        return {e: base(`Droite Δ d’équation y = x et point M(${fr(x)} ; ${fr(y)})`).description(),
          c: base(`Le projeté orthogonal H de M sur Δ : (MH) est perpendiculaire à Δ`).segment(x, y, h, h, {pointilles: true}).point(h, h, 'H').description()}; },
      (p, ex) => { const pts = pointsDe(ex.statement);
        return {c: placer(repereDe(`Droites (AB) et (CD) : ${liste(pts)}`, [pts.A, pts.B, pts.C, pts.D]).segment(pts.A[0], pts.A[1], pts.B[0], pts.B[1]).segment(pts.C[0], pts.C[1], pts.D[0], pts.D[1]), pts, ['A', 'B', 'C', 'D']).description()}; }
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
