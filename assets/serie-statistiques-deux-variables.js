/* Série statistiques-deux-variables : extrait de assets/variants-analyse.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, productSignTable, variationTable, signTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, times, poly, affine, eur, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  const CONTINUOUS = [
    {what: 'x kilogrammes de chocolat', unit: 'kg', one: 'kilogramme'},
    {what: 'x mètres de câble', unit: 'm', one: 'mètre'},
    {what: 'x litres de peinture', unit: 'L', one: 'litre'}
  ];



  register('statistiques-deux-variables', [
    { // 1. Comprendre une série de couples
      base: {s: 0, y0: 12, t: 1, d1: 3, d2: 4, d3: 3},
      params: r => ({s: r.int(0, 5), y0: r.int(5, 40), t: r.sign(), d1: r.int(1, 6), d2: r.int(1, 6), d3: r.int(1, 6)}),
      accept: ({y0, t, d1, d2, d3}) => y0 + t * (d1 + d2 + d3) > 0,
      decimals: 2,
      difficulty: ({s, y0, t, d1, d2, d3}) => { const ys = [y0, y0 + t * d1, y0 + t * (d1 + d2), y0 + t * (d1 + d2 + d3)]; return score({steps: 3, values: [...ys, s + 2.5, ys.reduce((a, b) => a + b) / 4]}); },
      verify: ({s, y0, t, d1, d2, d3}, v) => { const ys = [y0, y0 + t * d1, y0 + t * (d1 + d2), y0 + t * (d1 + d2 + d3)]; return v[0] === 4 && v[1] * 4 === 4 * s + 10 && Math.abs(v[2] * 4 - ys.reduce((a, b) => a + b)) < 1e-9; },
      build: ({s, y0, t, d1, d2, d3}, o) => {
        const xs = [1, 2, 3, 4].map(i => s + i), ys = [y0, y0 + t * d1, y0 + t * (d1 + d2), y0 + t * (d1 + d2 + d3)];
        const my = ys.reduce((a, b) => a + b) / 4;
        return E(o, `Les points observés sont <strong>${xs.map((x, i) => `(${x} ; ${ys[i]})`).join(', ')}</strong>.`,
          [N('Nombre de couples', 4), N('Abscisse moyenne', s + 2.5), N('Ordonnée moyenne', my)],
          C('chaque couple est une observation ; le point moyen G a pour coordonnées la moyenne des abscisses et la moyenne des ordonnées.',
            [`x̄ = (${xs.join(' + ')})/4 = ${fr(s + 2.5)} ; ȳ = (${ys.join(' + ')})/4 = ${ys.reduce((a, b) => a + b)}/4 = ${fr(my)}.`],
            `il y a 4 couples et G(${fr(s + 2.5)} ; ${fr(my)}).`),
          tasks('Indique le nombre d’observations.', 'Calcule les coordonnées du point moyen G.'));
      }
    },
    { // 2. Déterminer une droite d'ajustement
      base: {x1: 2, dx: 4, a: 3, b: 1, k: 2},
      params: r => ({x1: r.int(0, 4), dx: r.pick([2, 3, 4, 5]), a: r.nonZero(1, 6), b: r.nonZero(1, 9), k: r.int(1, 4)}),
      accept: ({x1, dx, a, b, k}) => k < dx && a * x1 + b !== 0 && a * (x1 + dx) + b !== 0,
      coefs: ['a', 'b'],
      difficulty: ({x1, dx, a, b, k}) => score({steps: 3, values: [a * x1 + b, a * (x1 + dx) + b, a, b, a * (x1 + k) + b]}),
      verify: ({x1, dx, a, b, k}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * (x1 + dx) + v[1] === a * (x1 + dx) + b && v[2] === a * (x1 + k) + b,
      build: ({x1, dx, a, b, k}, o) => {
        const x2 = x1 + dx, y1 = a * x1 + b, y2 = a * x2 + b, xq = x1 + k;
        return E(o, `Une droite d’ajustement passe par <strong>A(${x1} ; ${fr(y1)})</strong> et <strong>B(${x2} ; ${fr(y2)})</strong>.`,
          [N('Pente a', a), N('Ordonnée b', b), N(`Estimation pour x = ${xq}`, a * xq + b)],
          C('la pente vaut a = (y<sub>B</sub> − y<sub>A</sub>)/(x<sub>B</sub> − x<sub>A</sub>) ; on obtient b avec les coordonnées de A, puis on utilise y = ax + b.',
            [`a = (${diff(y2, y1)})/(${diff(x2, x1)}) = ${fr(y2 - y1)}/${dx} = ${fr(a)}.`, `b = ${x1 ? `${fr(y1)}${times(-a, x1)}` : fr(y1)} = ${fr(b)}. Pour x = ${xq} : y = ${times(a, xq, true)}${sg(b)} = ${fr(a * xq + b)}.`],
            `la droite a pour équation y = ${affine(a, b)} ; elle donne y = ${fr(a * xq + b)} pour x = ${xq}.`),
          tasks('Détermine a et b dans y = ax + b.', `Estime y pour x = ${xq}.`));
      }
    },
    { // 3. Interpréter un modèle en contexte
      base: {ctx: 0, a: 5, b: 10, xq: 6},
      params: r => {
        const ctx = r.int(0, 2);
        if (ctx === 1) return {ctx, a: r.int(2, 6), b: r.int(60, 100), xq: r.int(5, 15)};
        if (ctx === 2) return {ctx, a: r.int(1, 2), b: r.int(4, 8), xq: r.int(2, 5)};
        return {ctx, a: r.int(2, 9), b: r.int(5, 30), xq: r.int(4, 9)};
      },
      accept: ({ctx, a, b, xq}) => (ctx === 1 ? b - a * xq > 0 : ctx === 2 ? a * xq + b <= 20 : true),
      difficulty: ({ctx, a, b, xq}) => { const s = ctx === 1 ? -a : a; return score({steps: 3, values: [s, b, s * xq + b]}); },
      verify: ({ctx, a, b, xq}, v) => { const s = ctx === 1 ? -a : a; return v[0] === s && v[1] === b && v[2] === s * xq + b && v[3] === s; },
      build: ({ctx, a, b, xq}, o) => {
        const s = ctx === 1 ? -a : a, y = s * xq + b;
        const k = [
          {intro: `Le chiffre d’affaires y (en milliers d’euros) est estimé par <strong>y = ${affine(s, b)}</strong>, où x est le nombre de campagnes publicitaires.`, gain: 'Gain prévu pour une campagne de plus', unit: 'milliers d’euros',
            end: `pour ${xq} campagnes, le chiffre d’affaires prévu est de ${fr(y)} milliers d’euros, soit ${eur(y * 1000)} ; chaque campagne supplémentaire ajoute environ ${fr(a)} milliers d’euros.`},
          {intro: `La consommation y d’un chauffage (en kWh par jour) est estimée par <strong>y = ${affine(s, b)}</strong>, où x est la température extérieure en °C.`, gain: 'Variation de y pour 1 °C de plus', unit: 'kWh',
            end: `à ${xq} °C, la consommation prévue est de ${fr(y)} kWh par jour ; chaque degré de plus fait baisser la consommation d’environ ${fr(a)} kWh.`},
          {intro: `La note y (sur 20) d’un élève est estimée par <strong>y = ${affine(s, b)}</strong>, où x est le nombre d’heures de révision.`, gain: 'Gain prévu pour une heure de plus', unit: 'points',
            end: `pour ${xq} heures de révision, la note prévue est ${fr(y)}/20 ; chaque heure de plus ajoute environ ${fr(a)} point${a > 1 ? 's' : ''} dans ce modèle.`}
        ][ctx];
        return E(o, k.intro,
          [N('Pente a', s), N('Ordonnée à l’origine b', b), N(`Prévision pour x = ${xq}`, y), N(k.gain, s)],
          C('dans y = ax + b, la pente a est la variation de y quand x augmente de 1 ; b est la valeur de y pour x = 0. On remplace x pour prévoir.',
            [`a = ${fr(s)} et b = ${fr(b)} ; pour x = ${xq} : y = ${times(s, xq, true)} + ${b} = ${fr(y)}.`],
            k.end + ' Une prévision par un modèle reste une estimation.'),
          tasks('Donne la pente et l’ordonnée à l’origine.', `Estime y pour x = ${xq}.`, 'Interprète la pente.'));
      }
    },
    { // 4. Nuage aligné
      base: {a: 2, b: 2, xp: 5},
      params: r => ({a: r.nonZero(1, 6), b: r.int(-8, 10), xp: r.int(5, 8)}),
      accept: ({a, b, xp}) => [1, 2, 3, 4, xp].every(x => a * x + b !== 0) && b !== 0,
      coefs: ['a', 'b'],
      difficulty: ({a, b, xp}) => score({steps: 3, values: [a, b, a + b, 2 * a + b, 3 * a + b, 4 * a + b, xp * a + b]}),
      verify: ({a, b, xp}, v) => v[0] === a && v[1] === b && v[2] === xp * v[0] + v[1],
      build: ({a, b, xp}, o) => {
        const pts = [1, 2, 3, 4].map(x => `(${x} ; ${fr(a * x + b)})`);
        return E(o, `Un petit nuage est formé des points <strong>${pts.join(', ')}</strong>.`,
          [N('Pente', a), N('Ordonnée à l’origine', b), N(`Valeur prévue à x = ${xp}`, xp * a + b)],
          C('les points sont alignés : la pente est la variation de y quand x augmente de 1 ; on trouve l’ordonnée à l’origine avec un point.',
            [`Quand x augmente de 1, y varie de ${fr(a)} : a = ${fr(a)}.`, `Avec (1 ; ${fr(a + b)}) : ${fr(a + b)} = ${times(a, 1, true)} + b, donc b = ${fr(a + b)}${sg(-a)} = ${fr(b)}.`],
            `la droite a pour équation y = ${affine(a, b)} et donne ${fr(xp * a + b)} pour x = ${xp}.`),
          tasks('Donne la pente de la droite qui les relie.', 'Détermine l’ordonnée à l’origine.', `Prévois y pour x = ${xp}.`));
      }
    },
    { // 5. Interpoler ou extrapoler ?
      base: {a: 8, b: 15, lo: 1, span: 4, xin: 3, out: 2, order: 0},
      params: r => { const lo = r.int(1, 3), span = r.int(3, 6); return {a: r.int(2, 9), b: r.int(5, 30), lo, span, xin: r.int(lo + 1, lo + span - 1), out: r.int(1, 4), order: r.int(0, 1)}; },
      difficulty: ({a, b, lo, span, xin, out}) => score({steps: 3, values: [a, b, a * xin + b, a * (lo + span + out) + b]}),
      verify: ({a, b, lo, span, xin, out, order}, v) => {
        const xo = lo + span + out, x1 = order ? xo : xin, x2 = order ? xin : xo;
        return v[0] === a * x1 + b && v[1] === a * x2 + b && v[2] === (order ? 'Extrapolation' : 'Interpolation') && v[3] === (order ? 'Interpolation' : 'Extrapolation');
      },
      build: ({a, b, lo, span, xin, out, order}, o) => {
        const hi = lo + span, xo = hi + out, x1 = order ? xo : xin, x2 = order ? xin : xo;
        const kind = x => (x >= lo && x <= hi ? 'Interpolation' : 'Extrapolation');
        return E(o, `On a mesuré une grandeur pour <strong>${lo} ≤ x ≤ ${hi}</strong> et retenu l’ajustement <strong>y = ${affine(a, b)}</strong>.`,
          [N(`Prévision pour x = ${x1}`, a * x1 + b), N(`Prévision pour x = ${x2}`, a * x2 + b),
           S(`x = ${x1}`, kind(x1), ['Interpolation', 'Extrapolation']), S(`x = ${x2}`, kind(x2), ['Interpolation', 'Extrapolation'])],
          C(`on remplace x dans l’équation ; une estimation est une interpolation si x est dans la plage observée [${lo} ; ${hi}], une extrapolation sinon.`,
            [`Pour x = ${x1} : y = ${a} × ${x1} + ${b} = ${a * x1 + b} ; pour x = ${x2} : y = ${a} × ${x2} + ${b} = ${a * x2 + b}.`],
            `x = ${xin} est dans [${lo} ; ${hi}] : interpolation. x = ${xo} est hors de cette plage : extrapolation, à interpréter avec prudence.`),
          tasks(`Calcule y pour x = ${x1} puis x = ${x2}.`, 'Classe les deux estimations.'));
      }
    },
    { // 6. Passer par le point moyen
      base: {y1: 10, d1: 3, d2: 2, d3: 3, x0: 1, far: 1},
      params: r => ({y1: r.int(5, 30), d1: r.int(1, 6), d2: r.int(1, 6), d3: r.int(1, 6), x0: r.int(1, 3), far: r.int(1, 2)}),
      decimals: 2,
      difficulty: ({y1, d1, d2, d3, x0, far}) => {
        const ys = [y1, y1 + d1, y1 + d1 + d2, y1 + d1 + d2 + d3], my = ys.reduce((a, b) => a + b) / 4, a = (3 * (ys[3] - ys[0]) + (ys[2] - ys[1])) / 10;
        const mx = x0 + 1.5, xp = x0 + 3 + far;
        return score({steps: 4, values: [...ys, a, my - mx * a, my, xp * a + my - mx * a]});
      },
      verify: ({y1, d1, d2, d3, x0, far}, v) => {
        const ys = [y1, y1 + d1, y1 + d1 + d2, y1 + d1 + d2 + d3], my = ys.reduce((a, b) => a + b) / 4, mx = x0 + 1.5, xp = x0 + 3 + far;
        const a = [0, 1, 2, 3].reduce((s, k, i) => s + (x0 + k - mx) * (ys[i] - my), 0) / 5, b = my - mx * a;
        return v[0] === mx && Math.abs(v[1] - my) < 1e-9 && Math.abs(v[2] - (a * mx + b)) < 1e-9 && Math.abs(v[3] - (xp * a + b)) < 1e-9;
      },
      build: ({y1, d1, d2, d3, x0, far}, o) => {
        const ys = [y1, y1 + d1, y1 + d1 + d2, y1 + d1 + d2 + d3], my = ys.reduce((a, b) => a + b) / 4;
        const xs = [x0, x0 + 1, x0 + 2, x0 + 3], mx = x0 + 1.5, xp = x0 + 3 + far;
        const a = F((3 * (ys[3] - ys[0]) + (ys[2] - ys[1])) / 10, 6), b = F(my - mx * a, 6), yp = F(xp * a + b, 6);
        return E(o, `Pour les données x : <strong>${xs.join(' ; ')}</strong> et y : <strong>${ys.join(' ; ')}</strong>, on propose la droite d’ajustement <strong>y = ${affine(a, b)}</strong>.`,
          [N('x moyen', mx), N('y moyen', my), N(`Valeur de la droite en x = ${fr(mx)}`, my), N(`Estimation pour x = ${xp}`, yp)],
          C('on calcule les coordonnées du point moyen G ; une droite d’ajustement par les moindres carrés passe par G ; on l’utilise ensuite pour estimer y.',
            [`x̄ = (${xs.join(' + ')})/4 = ${fr(mx)} ; ȳ = (${ys.join(' + ')})/4 = ${fr(my)}.`, `En x = ${fr(mx)} : y = ${fr(a)} × ${fr(mx)}${sg(b)} = ${fr(my)} ; en x = ${xp} : y = ${fr(a)} × ${xp}${sg(b)} = ${fr(yp)}.`],
            `la droite passe par G(${fr(mx)} ; ${fr(my)}) et prévoit y = ${fr(yp)} pour x = ${xp}.`),
          tasks('Calcule les coordonnées de G.', `Vérifie la valeur donnée par la droite en x = ${fr(mx)}.`, `Prévois y en x = ${xp}.`));
      }
    },
    { // 7. Portée d'une prévision
      base: {a: 0.8, b: 25, lo: 10, span: 40, k: 2, out: 20, order: 0},
      params: r => ({a: r.pick([0.5, 0.8, 1.2, 1.5, 2, 2.5]), b: r.int(5, 40), lo: r.pick([0, 10, 20]), span: r.pick([30, 40, 50]), k: r.int(1, 2), out: r.pick([10, 20, 30]), order: r.int(0, 1)}),
      decimals: 1,
      difficulty: ({a, b, lo, k, span, out}) => score({steps: 3, values: [a, b, a * (lo + 10 * k) + b, a * (lo + span + out) + b]}),
      verify: ({a, b, lo, span, k, out, order}, v) => { const xin = lo + 10 * k, xo = lo + span + out, x1 = order ? xo : xin, x2 = order ? xin : xo; return Math.abs(v[0] - (a * x1 + b)) < 1e-9 && Math.abs(v[1] - (a * x2 + b)) < 1e-9 && v[2] === `x = ${xo}`; },
      build: ({a, b, lo, span, k, out, order}, o) => {
        const hi = lo + span, xin = lo + 10 * k, xo = hi + out, x1 = order ? xo : xin, x2 = order ? xin : xo;
        return E(o, `On possède des mesures pour <strong>${lo} ≤ x ≤ ${hi}</strong> et un ajustement <strong>y = ${affine(a, b)}</strong>.`,
          [N(`y pour x = ${x1}`, F(a * x1 + b, 6)), N(`y pour x = ${x2}`, F(a * x2 + b, 6)), S('Extrapolation', `x = ${xo}`, [`x = ${x1}`, `x = ${x2}`, 'Les deux'])],
          C(`on remplace x dans l’équation ; on compare ensuite chaque valeur de x à la plage des mesures [${lo} ; ${hi}].`,
            [`Pour x = ${x1} : y = ${fr(a)} × ${x1} + ${b} = ${fr(a * x1 + b)} ; pour x = ${x2} : y = ${fr(a)} × ${x2} + ${b} = ${fr(a * x2 + b)}.`],
            `x = ${xo} est hors de [${lo} ; ${hi}] : c’est le calcul qui extrapole ; la valeur obtenue en x = ${xin} est une interpolation.`),
          tasks(`Estime y en x = ${x1} et en x = ${x2}.`, 'Identifie le calcul qui extrapole.'));
      }
    },
    { // 8. Corrélation et causalité
      base: {ctx: 0, a: 2, b: 9, q: 0},
      params: r => ({ctx: r.int(0, 1), a: r.int(1, 6), b: r.int(3, 20), q: r.int(0, 1)}),
      difficulty: ({a, b}) => score({steps: 2, values: [a + b, 2 * a + b, 3 * a + b, 4 * a + b, a, b]}),
      verify: ({a, b, q}, v) => v[0] === a && v[1] === b && v[2] === (q ? 'Oui' : 'Non'),
      build: ({ctx, a, b, q}, o) => {
        const pts = [1, 2, 3, 4].map(x => `(${x} ; ${a * x + b})`).join(', ');
        const k = ctx
          ? {intro: `Sur plusieurs journées d’été, on relève (nombre de glaces vendues, en centaines ; nombre de coups de soleil soignés) : <strong>${pts}</strong>.`,
            cause: 'Ces données prouvent-elles que manger des glaces provoque des coups de soleil ?', link: 'Ces données montrent-elles que les deux grandeurs varient ensemble ?',
            other: 'l’ensoleillement, qui fait augmenter à la fois les ventes de glaces et les coups de soleil'}
          : {intro: `Les observations (dépenses publicitaires ; ventes) sont <strong>${pts}</strong>, en unités adaptées.`,
            cause: 'La corrélation prouve-t-elle que la publicité cause seule les ventes ?', link: 'Ces données montrent-elles que les ventes augmentent avec les dépenses publicitaires ?',
            other: 'la saison, les prix ou la concurrence'};
        return E(o, k.intro,
          [N('Pente', a), N('Ordonnée à l’origine', b), S(q ? k.link : k.cause, q ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('les points sont alignés : on lit la pente et l’ordonnée à l’origine ; une corrélation décrit une variation commune, elle ne démontre pas une cause.',
            [`Quand x augmente de 1, y augmente de ${a} : la pente vaut ${a}. Avec (1 ; ${a + b}), on trouve b = ${a + b} − ${a} = ${b}.`],
            `les points sont sur la droite y = ${affine(a, b)} : les deux grandeurs varient ensemble. ${q ? 'La réponse est donc oui.' : 'Cela ne prouve pas un lien de cause à effet : la réponse est non.'} Un autre facteur peut intervenir, par exemple ${k.other}.`),
          {title: 'Garder l’esprit critique', ...tasks('Calcule la pente et l’ordonnée à l’origine de la droite.', 'Réponds à la question posée sur la relation entre les deux grandeurs.')});
      }
    }
  ]);
  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, {frame, sample, pointsIn} = V;
  const xy = pts => pts.map(p => [p[0], p[1]]);
  const liste = pts => pts.map(p => `${p[2]}(${fr(p[0])} ; ${fr(p[1])})`).join(', ');
  /* Parabole ax² + c et sa tangente au point d'abscisse x0. */
  const tangenteFig = ({a, x0, c}, titre) => { const f = x => a * x * x + c, e = Math.abs(x0) + 2, m = 2 * a * x0, t = x => m * (x - x0) + f(x0), expr = `(${a})*x^2+(${c})`;
    return {c: FG.repere(typeof titre === 'string' ? titre : `Courbe de f et sa tangente au point d’abscisse ${fr(x0)}`, frame([-e, e], sample(f, -e, e).concat([t(-e / 2), t(e / 2), t(0)])))
      .courbe(expr).tangente(expr, x0).point(x0, f(x0)).description()}; };
  /* Courbe sur [x1 ; x2] et lecture de son extremum (h ; k). */
  const extremumFig = (titre, expr, f, x1, x2, h, k, options) => ({c: FG.repere(titre, frame([x1, x2], sample(f, x1, x2), options)).courbe(expr, {de: x1, a: x2}).lecture(h, k).description()});
  /* Coût C(x) = ax² + bx + c sur [0 ; 2x₀] et sa tangente au point d'abscisse x₀. */
  const coutFig = ({a, b, c, x0}) => { const f = x => a * x * x + b * x + c, expr = `(${a})*x^2+(${b})*x+(${c})`;
    return {c: FG.repere(`Courbe du coût et sa tangente en x = ${fr(x0)} : près de ce point, la courbe suit la tangente`, frame([2 * x0], sample(f, 0, 2 * x0), {nom_x: 'x', nom_y: 'C(x)'}))
      .courbe(expr, {de: 0, a: 2 * x0}).tangente(expr, x0).point(x0, f(x0)).description()}; };
  /* Nuage des points de l'énoncé ; le corrigé y ajoute une droite, le point moyen ou une lecture. */
  const nuageFig = (statement, plus, titre, corrige) => { const pts = pointsIn(statement), cadre = frame(pts.map(p => p[0] + 1).concat(plus ? [plus[0]] : []), pts.map(p => p[1]).concat(plus ? [plus[1]] : []));
    const base = t => FG.repere(t, cadre).nuage(xy(pts)), f = {e: base(`Nuage des points ${liste(pts)}`).description()};
    if (corrige) f.c = corrige(base(titre)).description();
    return f; };
  V.illustrate('statistiques-deux-variables', [
    ({s}, ex) => { const pts = pointsIn(ex.statement), my = pts.reduce((t, p) => t + p[1], 0) / 4;
      return nuageFig(ex.statement, null, 'Le point moyen G est au centre du nuage', r => r.point_moyen(s + 2.5, my, 'G')); },
    (p, ex) => { const [A, B] = pointsIn(ex.statement), m = (B[1] - A[1]) / (B[0] - A[0]), b = A[1] - m * A[0], cadre = frame([B[0] + 1], [A[1], B[1], b]);
      const base = t => FG.repere(t, cadre);
      return {e: base(`Points ${liste([A, B])}`).point(A[0], A[1], 'A').point(B[0], B[1], 'B').description(),
        c: base('Droite (AB) : sa pente et son ordonnée à l’origine').droite_affine(m, b).point(A[0], A[1], 'A').point(B[0], B[1], 'B').description()}; },
    null,
    ({a, b, xp}, ex) => nuageFig(ex.statement, [xp + 1, a * xp + b], `Les points sont alignés : la droite se prolonge jusqu’à x = ${xp}`, r => r.droite_affine(a, b).lecture(xp, a * xp + b)),
    null,
    ({x0}, ex) => { const xs = [0, 1, 2, 3].map(i => x0 + i), ys = ex.statement.match(/y : <strong>([^<]+)</)[1].split(' ; ').map(Number), my = ys.reduce((t, v) => t + v, 0) / 4, mx = x0 + 1.5;
      const a = xs.reduce((t, x, i) => t + (x - mx) * (ys[i] - my), 0) / 5, b = my - mx * a, pts = xs.map((x, i) => [x, ys[i]]), cadre = frame([x0 + 6], ys.concat([b, a * (x0 + 6) + b]));
      const base = t => FG.repere(t, cadre).nuage(pts);
      return {e: base(`Nuage des quatre données : x de ${x0} à ${x0 + 3}`).description(),
        c: base('La droite d’ajustement passe par le point moyen G').droite_affine(a, b).point_moyen(mx, my, 'G').description()}; },
    null,
    (p, ex) => nuageFig(ex.statement)
  ]);
})();
