/* Série second-degre : extrait de assets/variants-fonctions.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, score, fmt, productSignTable, affineSignTable, variationTable} = V;
  const {num: fr, paren: pa, signed: sg, term, poly, fact, bare, affine, eur, MINUS: M} = fmt;
  const coefText = k => (k === 1 ? '' : k === -1 ? M : fr(k));
  const rootField = (label, value) => ({...N(label, value), answerGroup: 'roots'});

  function parabolaGraph(h, dir) {
    const top = dir > 0 ? 3 : 1, y = v => 60 + 50 * (top - v), y0 = y(0);
    const ends = y(3 * dir), vertex = y(-dir), control = 2 * vertex - ends;
    const xs = [h - 2, h - 1, h, h + 1, h + 2], px = [90, 195, 300, 405, 510];
    const label = 'Parabole de g ' + (dir > 0 ? 'tournée vers le haut' : 'tournée vers le bas')
      + ', tracée de x = ' + fr(h - 2) + ' à x = ' + fr(h + 2) + '. Elle coupe l’axe des abscisses en '
      + fr(h - 1) + ' et ' + fr(h + 1) + ' ; son ' + (dir > 0 ? 'minimum' : 'maximum') + ' vaut ' + fr(-dir)
      + ', atteint en ' + fr(h) + ' ; aux deux extrémités, g vaut ' + fr(3 * dir) + '.';
    return `<svg class="variant-graph" viewBox="0 0 580 310" role="img" aria-label="${label}">
        <rect width="580" height="310" rx="12" fill="#fbfdfc"/>
        <g stroke="#dde5e3" stroke-width="1"><path d="M90 60H510M90 110H510M90 160H510M90 210H510M90 260H510M195 35V287M300 35V287M405 35V287"/></g>
        <g stroke="#555b63" stroke-width="2"><path d="M65 ${y0}H535M90 290V30"/></g>
        <path d="M90 ${ends} Q300 ${control} 510 ${ends}" stroke="#246453" stroke-width="3.5" fill="none"/>
        <g fill="#246453"><circle cx="195" cy="${y0}" r="5"/><circle cx="300" cy="${vertex}" r="5"/><circle cx="405" cy="${y0}" r="5"/></g>
        <g font-size="15" font-family="Arial,sans-serif" fill="#343c45" text-anchor="middle">
          ${xs.map((x, i) => `<text x="${px[i]}" y="${y0 + 22}">${fr(x)}</text>`).join('')}
          <text x="63" y="${vertex + 5}">${fr(-dir)}</text><text x="63" y="${ends + 5}">${fr(3 * dir)}</text>
          <text x="545" y="${y0 + 5}">x</text>
        </g></svg>`;
  }

  // Plus grand entier k tel que (k/100)² ≤ n, sans erreur d'arrondi.
  function lowHundredth(n) {
    let k = Math.floor(Math.sqrt(n) * 100);
    while ((k + 1) * (k + 1) <= 10000 * n) k++;
    while (k * k > 10000 * n) k--;
    return k;
  }
  const SPEEDS = [[60, 80, 120], [40, 60, 80], [50, 75, 100], [30, 40, 60]];
  const LCM = [240, 240, 300, 120];


  register('second-degre', [
    { // 1. Identifier une parabole
      base: {a: 2, b: -3, c: 1, form: 0},
      params: r => ({a: r.nonZero(1, 4), b: r.nonZero(1, 9), c: r.nonZero(1, 9), form: r.int(0, 1)}),
      coefs: ['a', 'b', 'c'],
      difficulty: ({a, b, c}) => score({steps: 4, values: [a, b, c]}),
      verify: ({a, b, c}, v) => v[0] === a && v[1] === b && v[2] === c && v[3] === (a > 0 ? 'Vers le haut' : 'Vers le bas'),
      build: ({a, b, c, form}, o) => {
        const expr = form ? fr(c) + term(b, 'x') + term(a, 'x²') : poly([a, b, c]);
        return E(o, `On considère <strong>f(x) = ${expr}</strong>. Identifie les coefficients a, b et c de l’écriture ax² + bx + c, puis le sens d’ouverture de la parabole.`,
          [N('Coefficient a', a), N('Coefficient b', b), N('Coefficient c', c), S('Ouverture', a > 0 ? 'Vers le haut' : 'Vers le bas', ['Vers le haut', 'Vers le bas'])],
          C('on range les termes dans l’ordre ax² + bx + c en gardant leur signe ; le signe de a donne le sens d’ouverture.',
            [`f(x) = ${poly([a, b, c])}, donc a = ${fr(a)}, b = ${fr(b)} et c = ${fr(c)}.`],
            `comme a = ${fr(a)} est ${a > 0 ? 'positif' : 'négatif'}, la parabole est tournée ${a > 0 ? 'vers le haut' : 'vers le bas'}.`));
      }
    },
    { // 2. Lire des racines et le signe entre elles
      base: {k: 1, r: 1, s: 5},
      params: r => { const root = r.int(-5, 4); return {k: r.pick([1, -1, 2, -2]), r: root, s: root + r.int(2, 6)}; },
      coefs: ['k', 'r', 's'],
      difficulty: ({k, r, s}) => score({steps: 3, values: [k, r, s]}),
      verify: ({k, r, s}, v) => k * (v[0] - r) * (v[0] - s) === 0 && k * (v[1] - r) * (v[1] - s) === 0 && v[0] < v[1]
        && v[2] === (k * ((r + s) / 2 - r) * ((r + s) / 2 - s) > 0 ? 'Positif' : 'Négatif'),
      build: ({k, r, s}, o) => {
        const sign = k > 0 ? 'Négatif' : 'Positif';
        return E(o, `On donne <strong>g(x) = ${coefText(k)}${fact(r)}${fact(s)}</strong>. Trouve ses deux racines et le signe de g(x) pour ${fr(r)} < x < ${fr(s)}.`,
          [rootField('Première racine', r), rootField('Deuxième racine', s), S('Signe entre les racines', sign, ['Positif', 'Négatif', 'Nul'])],
          C('un produit est nul si et seulement si l’un de ses facteurs est nul ; le signe du produit se lit dans un tableau de signes.',
            [`${r === 0 ? 'le facteur x s’annule pour x = 0' : `${bare(r)} = 0 ⇔ x = ${fr(r)}`} et ${s === 0 ? 'le facteur x s’annule pour x = 0' : `${bare(s)} = 0 ⇔ x = ${fr(s)}`}.`],
            `les racines sont ${fr(r)} et ${fr(s)}. Entre elles, g(x) est ${sign.toLowerCase()}${k === 1 ? '' : ` (le coefficient ${fr(k)} est ${k > 0 ? 'positif' : 'négatif'})`}.`,
            productSignTable('Signe de g(x)', k, r, s)));
      }
    },
    { // 3. Développer et vérifier une racine
      base: {r: 2, s: -3},
      params: r => ({r: r.nonZero(1, 6), s: r.nonZero(1, 6)}),
      accept: ({r, s}) => r !== s && r + s !== 0,
      coefs: ['r', 's'],
      difficulty: ({r, s}) => score({steps: 3, values: [r, s, -(r + s), r * s]}),
      verify: ({r, s}, v) => [r, s].every(x => x * x + v[0] * x + v[1] === 0) && v[2] === 0,
      build: ({r, s}, o) => {
        const b = -(r + s), c = r * s;
        return E(o, `Soit <strong>h(x) = ${fact(r)}${fact(s)}</strong>. Développe h(x) sous la forme x² + bx + c, puis vérifie que ${fr(r)} est une racine.`,
          [N('Coefficient b', b), N('Coefficient c', c), N(`h(${fr(r)})`, 0)],
          C('on multiplie chaque terme de la première parenthèse par chaque terme de la seconde, puis on réduit ; pour vérifier une racine, on remplace x dans la forme factorisée.',
            [`h(x) = x²${term(-s, 'x')}${term(-r, 'x')}${term(c)} = ${poly([1, b, c])}.`,
             `h(${fr(r)}) = (${fr(r)} ${M} ${pa(r)}) × (${fr(r)} ${s > 0 ? M : '+'} ${fr(Math.abs(s))}) = 0 × ${pa(r - s)} = 0.`],
            `b = ${fr(b)}, c = ${fr(c)}, et ${fr(r)} est bien une racine de h.`));
      }
    },
    { // 4. Sommet, extremum et racines d'une forme canonique
      base: {h: 3, d: 2, dir: 1},
      params: r => ({h: r.int(-4, 6), d: r.int(1, 4), dir: r.sign()}),
      coefs: ['h', 'd'],
      difficulty: ({h, d}) => score({steps: 5, values: [h, d * d, h - d, h + d]}),
      verify: ({h, d, dir}, v) => {
        const p = x => dir * ((x - h) ** 2 - d * d);
        return v[0] === h && v[1] === p(h) && p(v[2]) === 0 && p(v[3]) === 0 && v[2] < v[3] && v[4] === (dir > 0 ? 'Minimum' : 'Maximum');
      },
      build: ({h, d, dir}, o) => {
        const expr = dir > 0 ? `${fact(h)}² − ${d * d}` : `${M}${fact(h)}² + ${d * d}`, ext = -dir * d * d;
        return E(o, `Soit <strong>p(x) = ${expr}</strong>. Retrouve l’axe de symétrie, la nature et la valeur de l’extremum, puis les deux racines.`,
          [N('Axe : x =', h), N('Valeur de l’extremum', ext), N('Petite racine', h - d), N('Grande racine', h + d),
           S('Nature de l’extremum', dir > 0 ? 'Minimum' : 'Maximum', ['Minimum', 'Maximum'])],
          C('dans une forme canonique, le carré est positif ou nul et ne s’annule qu’en un point : l’abscisse du sommet. Pour les racines, on isole le carré.',
            [dir > 0 ? `${fact(h)}² ≥ 0, donc p(x) ≥ ${M}${d * d}, avec égalité pour x = ${fr(h)}.` : `${fact(h)}² ≥ 0, donc p(x) ≤ ${d * d}, avec égalité pour x = ${fr(h)}.`,
             `p(x) = 0 ⇔ ${fact(h)}² = ${d * d} ⇔ ${bare(h)} = ${M}${d} ou ${bare(h)} = ${d} ⇔ x = ${fr(h - d)} ou x = ${fr(h + d)}.`],
            `l’axe de symétrie est la droite x = ${fr(h)} ; le ${dir > 0 ? 'minimum' : 'maximum'} de p vaut ${fr(ext)}, atteint en x = ${fr(h)} ; les racines sont ${fr(h - d)} et ${fr(h + d)}.`,
            variationTable('Variations de p', 'p', [M + '∞', h, '+∞'], [null, ext, null], dir > 0 ? [-1, 1] : [1, -1], {derivative: false})));
      }
    },
    { // 5. Dresser un signe avec un coefficient
      base: {m: -2, r: 1, s: 4, x: 2},
      params: r => { const lo = r.int(-3, 3), s = lo + r.int(3, 6); return {m: r.nonZero(1, 3), r: lo, s, x: r.int(lo + 1, s - 1)}; },
      accept: ({r, s, x}) => r !== 0 && s !== 0 && x !== 0,
      coefs: ['m', 'r', 's'],
      difficulty: ({m, r, s, x}) => score({steps: 3, values: [m, r, s, m * r * s, m * (x - r) * (x - s)]}),
      verify: ({m, r, s, x}, v) => v[0] === m * (0 - r) * (0 - s) && v[1] === m * (x - r) * (x - s) && v[2] === (v[1] > 0 ? 'Positif' : 'Négatif'),
      build: ({m, r, s, x}, o) => {
        const fx = m * (x - r) * (x - s), sign = m < 0 ? 'Positif' : 'Négatif';
        return E(o, `La fonction est <strong>f(x) = ${coefText(m)}${fact(r)}${fact(s)}</strong>. Calcule f(0) et f(${fr(x)}), puis donne le signe de f entre ses racines.`,
          [N('f(0)', m * r * s), N(`f(${fr(x)})`, fx), S(`Sur ]${fr(r)} ; ${fr(s)}[`, sign, ['Positif', 'Négatif', 'Nul'])],
          C('on remplace x dans chaque facteur avant de multiplier ; pour le signe, on dresse le tableau de signes des facteurs et du coefficient.',
            [`f(0) = ${fr(m)} × ${pa(-r)} × ${pa(-s)} = ${fr(m * r * s)} et f(${fr(x)}) = ${fr(m)} × ${pa(x - r)} × ${pa(x - s)} = ${fr(fx)}.`],
            `entre ${fr(r)} et ${fr(s)}, les deux facteurs sont de signes contraires ; multiplié par ${fr(m)}, f(x) est ${sign.toLowerCase()} sur ]${fr(r)} ; ${fr(s)}[.`,
            productSignTable('Signe de f(x)', m, r, s)));
      }
    },
    { // 6. Maximiser un bénéfice
      base: {ctx: 0, m: 1, r: 1, half: 4},
      params: r => ({ctx: r.int(0, 2), m: r.int(1, 2), r: r.int(1, 4), half: r.int(2, 5)}),
      difficulty: ({m, r, half}) => { const s = r + 2 * half; return score({steps: 5, values: [-m, m * (r + s), -m * r * s, r + half, m * half * half]}); },
      verify: ({m, r, half}, v) => {
        const s = r + 2 * half, B = x => -m * (x - r) * (x - s);
        return v[0] === r + half && v[1] === B(v[0]) && B(v[0] - 1) < v[1] && B(v[0] + 1) < v[1] && B(v[2]) === 0 && B(v[3]) === 0 && v[2] < v[3];
      },
      build: ({ctx, m, r, half}, o) => {
        const s = r + 2 * half, h = r + half, max = m * half * half, top = r + s;
        const c = [
          {intro: 'Une entreprise fabrique et vend x centaines d’objets. Son bénéfice, en centaines d’euros, est', q: 'Quantité optimale, en centaines', unit: 'centaines d’euros',
            end: `Le bénéfice maximal est de ${eur(max * 100)}, atteint pour ${fr(h * 100)} objets vendus ; le bénéfice est nul pour ${fr(r * 100)} et pour ${fr(s * 100)} objets.`},
          {intro: 'Une association fixe le prix x, en euros, d’un billet de concert. Son bénéfice, en centaines d’euros, est', q: 'Prix optimal, en €', unit: 'centaines d’euros',
            end: `Le bénéfice maximal est de ${eur(max * 100)}, obtenu pour un billet à ${eur(h)} ; le bénéfice est nul pour des billets à ${eur(r)} et à ${eur(s)}.`},
          {intro: 'Une coopérative produit x tonnes de fruits. Son bénéfice, en milliers d’euros, est', q: 'Production optimale, en t', unit: 'milliers d’euros',
            end: `Le bénéfice maximal est de ${eur(max * 1000)}, atteint pour ${h} tonnes produites ; le bénéfice est nul pour ${r} et pour ${s} tonnes.`}
        ][ctx];
        const B = x => -m * (x - r) * (x - s);
        return E(o, `${c.intro} <strong>B(x) = ${poly([-m, m * top, -m * r * s])}</strong>, pour x ∈ [0 ; ${top}]. Trouve la valeur de x qui donne le maximum, le bénéfice maximal et les valeurs de x pour lesquelles B(x) = 0.`,
          [N(c.q, h), N('Bénéfice maximal, en ' + c.unit, max), rootField('Première racine', r), rootField('Deuxième racine', s)],
          C('le coefficient de x² est négatif : la parabole est tournée vers le bas et le maximum est atteint au sommet, d’abscisse −b/(2a). On écrit ensuite la forme canonique pour trouver les racines.',
            [`x<sub>S</sub> = −${fr(m * top)}/(2 × ${pa(-m)}) = ${h} et B(${h}) = ${fr(max)}. On en déduit B(x) = ${M}${m === 1 ? '' : fr(m)}${fact(h)}² + ${fr(max)}.`,
             `B(x) = 0 ⇔ ${fact(h)}² = ${half * half} ⇔ x = ${h} − ${half} = ${r} ou x = ${h} + ${half} = ${s}.`],
            c.end + ` Les valeurs de B sont exprimées en ${c.unit}.`,
            variationTable('Variations de B sur [0 ; ' + top + ']', 'B', [0, h, top], [B(0), max, B(top)], [1, -1], {derivative: false})));
      }
    },
    { // 7. Relier racines et sommet
      base: {dir: 1, r: 1, half: 1},
      params: r => ({dir: r.sign(), r: r.int(-7, 7), half: r.int(1, 4)}),
      accept: ({r, half}) => r !== 0 && r + 2 * half !== 0 && r + half !== 0,
      space: 44,
      coefs: ['r'],
      difficulty: ({r, half}) => { const s = r + 2 * half; return score({steps: 5, values: [r + s, r * s, r, s, r + half, half * half]}); },
      verify: ({dir, r, half}, v) => {
        const s = r + 2 * half, q = x => dir * (x - r) * (x - s);
        return v[0] === q(0) && q(v[1]) === 0 && q(v[2]) === 0 && v[1] < v[2] && v[3] === (v[1] + v[2]) / 2 && v[4] === q(v[3])
          && v[5] === (dir > 0 ? 'Minimum' : 'Maximum');
      },
      build: ({dir, r, half}, o) => {
        const s = r + 2 * half, v = r + half, ext = -dir * half * half;
        const coefs = [dir, -dir * (r + s), dir * r * s];
        return E(o, `On étudie <strong>q(x) = ${poly(coefs)}</strong>. Calcule q(0), trouve les racines (ce sont des entiers), puis l’abscisse du sommet et la valeur de l’extremum.`,
          [N('q(0)', dir * r * s), rootField('Première racine', r), rootField('Deuxième racine', s), N('Abscisse du sommet', v), N('Valeur de l’extremum', ext),
           S('Nature de l’extremum', dir > 0 ? 'Minimum' : 'Maximum', ['Minimum', 'Maximum'])],
          C(`on cherche deux entiers r et s tels que q(x) = ${dir > 0 ? '' : M}(x − r)(x − s) ; la parabole étant symétrique, le sommet est au milieu des racines.`,
            [`q(0) = ${fr(dir * r * s)}. On vérifie que q(x) = ${coefText(dir)}${fact(r)}${fact(s)} en développant : on retrouve ${poly(coefs)}.`,
             `Les racines sont ${fr(r)} et ${fr(s)}, donc x<sub>S</sub> = (${fr(r)}${sg(s)})/2 = ${fr(v)} et q(${fr(v)}) = ${dir > 0 ? '' : M + '('}${pa(v - r)} × ${pa(v - s)}${dir > 0 ? '' : ')'} = ${fr(ext)}.`],
            `les racines sont ${fr(r)} et ${fr(s)} ; le sommet a pour abscisse ${fr(v)} et q admet un ${dir > 0 ? 'minimum' : 'maximum'} égal à ${fr(ext)}, atteint en x = ${fr(v)}.`,
            variationTable('Variations de q', 'q', [M + '∞', v, '+∞'], [null, ext, null], dir > 0 ? [-1, 1] : [1, -1], {derivative: false})));
      }
    },
    { // 8. Résoudre une inéquation-produit
      base: {r: 2, half: 2, extra: 2, op: 0},
      params: r => ({r: r.int(1, 4), half: r.int(1, 3), extra: r.int(1, 3), op: r.int(0, 1)}),
      difficulty: ({r, half, extra}) => { const s = r + 2 * half, R = s + extra; return score({steps: 4, values: [r * s, half * half, (R - r) * (R - s), r, s, R]}); },
      verify: ({r, half, extra, op}, v) => {
        const s = r + 2 * half, R = s + extra, P = x => (x - r) * (x - s);
        return v[0] === P(0) && v[1] === P(r + half) && v[2] === P(R) && v[3] === (op ? `[0 ; ${r}] ∪ [${s} ; ${R}]` : `[${r} ; ${s}]`);
      },
      build: ({r, half, extra, op}, o) => {
        const s = r + 2 * half, R = s + extra, mid = r + half, sym = op ? '≥' : '≤';
        const inner = `[${r} ; ${s}]`, outer = `[0 ; ${r}] ∪ [${s} ; ${R}]`, answer = op ? outer : inner;
        return E(o, `On étudie <strong>${fact(r)}${fact(s)} ${sym} 0</strong> sur [0 ; ${R}].`,
          [N('Pour x = 0', r * s), N(`Pour x = ${mid}`, -half * half), N(`Pour x = ${R}`, (R - r) * (R - s)),
           S('Ensemble des solutions', answer, [`]${r} ; ${s}[`, inner, outer, `[0 ; ${r}[ ∪ ]${s} ; ${R}]`], {shuffle: true})],
          C('on cherche les racines des facteurs, on dresse le tableau de signes sur [0 ; ' + R + '], puis on garde les intervalles où le produit a le signe demandé.',
            [`En 0 : (${M}${r}) × (${M}${s}) = ${r * s} ; en ${mid} : ${half} × (${M}${half}) = ${M}${half * half} ; en ${R} : ${R - r} × ${R - s} = ${(R - r) * (R - s)}.`],
            `le produit est ${op ? 'positif ou nul à l’extérieur des racines' : 'négatif ou nul entre les racines'}. L’inégalité est large (${sym}), donc les racines ${r} et ${s} sont incluses : l’ensemble des solutions est ${answer}.`,
            productSignTable('Signe de ' + fact(r) + fact(s) + ' sur [0 ; ' + R + ']', 1, r, s, 0, R)));
      }
    }
  ]);
  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, {frame, sample} = V;
  /* Parabole k(x − r)(x − s) : racines, signe de part et d'autre, et sommet si demandé. */
  const paraboleFig = (titre, k, r, s, options) => { const o = options || {}, f = x => k * (x - r) * (x - s), e = Math.max(2, (s - r) / 2), x1 = o.de == null ? r - e : o.de, x2 = o.a == null ? s + e : o.a;
    const dehors = k > 0 ? '+' : '-', dedans = k > 0 ? '-' : '+', texte = t => (t === '+' ? '+' : M);
    const fig = FG.repere(titre, frame([x1, x2], sample(f, x1, x2))).courbe(`(${k})*(x-(${r}))*(x-(${s}))`, {de: x1, a: x2});
    if (o.signes) fig.zone_signe(x1 < r ? null : r, r, texte(dehors), {signe: dehors}).zone_signe(r, s, texte(dedans), {signe: dedans}).zone_signe(s, null, texte(dehors), {signe: dehors});
    if (o.axe) fig.droite_verticale((r + s) / 2, {pointilles: true, fin: true});
    if (o.sommet) fig.lecture((r + s) / 2, f((r + s) / 2));
    if (o.solutions) o.solutions.forEach(i => fig.intervalle_solutions(i[0], i[1]));
    return {c: fig.point(r, 0).point(s, 0).description()}; };
  V.illustrate('second-degre', [null,
    ({k, r, s}) => paraboleFig(`Courbe de g : elle coupe l’axe des abscisses en ${fr(r)} et en ${fr(s)}`, k, r, s, {signes: true}),
    null,
    ({h, d, dir}) => paraboleFig(`Courbe de p : axe de symétrie x = ${fr(h)} en pointillés, sommet et racines`, dir, h - d, h + d, {axe: true, sommet: true}),
    ({m, r, s}) => paraboleFig(`Courbe de f : signe de f(x) de part et d’autre des racines ${fr(r)} et ${fr(s)}`, m, r, s, {signes: true}),
    ({m, r, half}) => paraboleFig(`Courbe de B sur [0 ; ${2 * r + 2 * half}] : bénéfice nul aux deux racines, maximal au sommet`, -m, r, r + 2 * half, {sommet: true, de: 0, a: 2 * r + 2 * half}),
    ({dir, r, half}) => paraboleFig(`Courbe de q : le sommet est au milieu des racines ${fr(r)} et ${fr(r + 2 * half)}`, dir, r, r + 2 * half, {sommet: true}),
    ({r, half, extra, op}) => { const s = r + 2 * half, R = s + extra;
      return paraboleFig(`Courbe du produit sur [0 ; ${R}] : en trait épais sur l’axe, les solutions`, 1, r, s, {de: 0, a: R, solutions: op ? [[0, r], [s, R]] : [[r, s]]}); }
  ]);
})();
