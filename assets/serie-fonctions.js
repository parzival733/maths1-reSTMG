/* Série fonctions : extrait de assets/variants-fonctions.js par tools/build_series.py.
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

  register('fonctions', [
    { // 1. Images et antécédents d'une fonction affine
      base: {a: 3, b: -5, x1: -2, x2: 4, xt: 5},
      params: r => ({a: r.nonZero(2, 5), b: r.nonZero(1, 9), x1: r.int(-4, -1), x2: r.int(2, 5), xt: r.int(2, 7)}),
      accept: p => p.xt !== p.x2,
      coefs: ['a', 'b'],
      difficulty: ({a, b, x1, x2, xt}) => score({steps: 5, values: [a, b, a * x1 + b, a * x2 + b, a * xt + b, x1, x2, xt]}),
      verify: ({a, b, x1, x2, xt}, v) => v[0] === a * x1 + b && v[1] === b && v[2] === a * x2 + b
        && a * v[3] + b === a * xt + b && a * v[4] + b === b,
      build: ({a, b, x1, x2, xt}, o) => {
        const f = x => a * x + b, target = f(xt);
        return {...E(o, `On considère <strong>f(x) = ${affine(a, b)}</strong>. Calcule f(${fr(x1)}), f(0) et f(${x2}), puis les antécédents de ${fr(target)} et de ${fr(b)}.`,
          [N(`f(${fr(x1)})`, f(x1)), N('f(0)', b), N(`f(${x2})`, f(x2)), N('Antécédent de ' + fr(target), xt), N('Antécédent de ' + fr(b), 0)],
          C('pour une image, on remplace x par la valeur donnée ; pour un antécédent de y, on résout l’équation f(x) = y.',
            [`f(${fr(x1)}) = ${fr(a)} × ${pa(x1)}${sg(b)} = ${fr(f(x1))} ; f(0) = ${fr(b)} ; f(${x2}) = ${fr(a)} × ${x2}${sg(b)} = ${fr(f(x2))}.`,
             `f(x) = ${fr(target)} ⇔ ${affine(a, b)} = ${fr(target)} ⇔ ${fr(a)}x = ${fr(target - b)} ⇔ x = ${xt}. De même, f(x) = ${fr(b)} ⇔ ${fr(a)}x = 0 ⇔ x = 0.`],
            `les images demandées sont ${fr(f(x1))}, ${fr(b)} et ${fr(f(x2))} ; l’antécédent de ${fr(target)} est ${xt} et celui de ${fr(b)} est 0.`)),
          coachingContext: {a, b, target, x1, x2, xt}};
      }
    },
    { // 2. Construire un tarif
      base: {ctx: 0, fix: 18, rate: 6, h: 4, t: 7},
      params: r => {
        const ctx = r.int(0, 2);
        const ranges = [[[10, 30], [4, 12]], [[20, 50], [12, 30]], [[3, 9], [1, 3]]][ctx];
        return {ctx, fix: r.int(...ranges[0]), rate: r.int(...ranges[1]), h: r.int(2, 6), t: r.int(5, 10)};
      },
      accept: p => p.t !== p.h && p.fix !== p.rate,
      difficulty: ({fix, rate, h, t}) => score({steps: 4, values: [fix, rate, fix + rate * h, fix + rate * t]}),
      verify: ({fix, rate, h, t}, v) => v[0] === fix && v[1] === rate && v[2] === fix + rate * h && fix + rate * v[3] === fix + rate * t,
      build: ({ctx, fix, rate, h, t}, o) => {
        const total = fix + rate * t, at = fix + rate * h;
        const c = [
          {intro: 'Une entreprise de location facture', fixed: 'de frais fixes', per: 'par heure', what: 't heures', unit: 'h', ask: 'la durée correspondant à', lab: 'Durée pour ', res: `${t} heures`},
          {intro: 'Une salle de sport demande', fixed: 'de frais d’inscription', per: 'par mois', what: 't mois', unit: 'mois', ask: 'le nombre de mois correspondant à', lab: 'Nombre de mois pour ', res: `${t} mois`},
          {intro: 'Un service de livraison facture', fixed: 'de prise en charge', per: 'par kilomètre', what: 't kilomètres', unit: 'km', ask: 'la distance correspondant à', lab: 'Distance pour ', res: `${t} km`}
        ][ctx];
        return {...E(o, `${c.intro} <strong>${eur(fix)} ${c.fixed}</strong> puis <strong>${eur(rate)} ${c.per}</strong>. On note C(t) le prix, en euros, pour ${c.what}. Calcule C(${h}), puis ${c.ask} un prix de ${eur(total)}.`,
          [N('Frais fixes, en €', fix), N(`Prix ${c.per}, en €`, rate), N(`C(${h}), en €`, at), N(c.lab + eur(total) + ', en ' + c.unit, t)],
          C('le prix est la somme d’une partie fixe et d’une partie proportionnelle : C(t) = frais fixes + tarif × t. Pour retrouver t, on résout une équation du premier degré.',
            [`C(t) = ${fr(fix)} + ${fr(rate)}t, donc C(${h}) = ${fr(fix)} + ${fr(rate)} × ${h} = ${fr(at)}.`,
             `C(t) = ${fr(total)} ⇔ ${fr(rate)}t = ${fr(total)} − ${fr(fix)} = ${fr(total - fix)} ⇔ t = ${fr(total - fix)}/${fr(rate)} = ${t}.`],
            `le prix pour ${h} ${c.unit} est de ${eur(at)}, et un prix de ${eur(total)} correspond à ${c.res}.`)),
          coachingContext: {fix, rate, total, h, unit: c.unit}};
      }
    },
    { // 3. Lire une parabole sur un graphique
      base: {h: 2, dir: 1, q: 0},
      params: r => ({h: r.int(-3, 5), dir: r.sign(), q: r.int(0, 1)}),
      space: 36,
      difficulty: ({h}) => score({steps: 6, values: [h - 2, h - 1, h, h + 1, h + 2, 3, -1]}),
      verify: ({h, dir}, v) => {
        const g = x => dir * ((x - h) ** 2 - 1);
        return v[0] === g(h - 2) && v[1] === g(h) && v[3] === g(h) && v[4] === h && g(h - 1) === 0 && g(h + 1) === 0;
      },
      build: ({h, dir, q}, o) => {
        const lo = h - 1, hi = h + 1, a = h - 2, b = h + 2, sym = q ? '>' : '<';
        const inner = `]${fr(lo)} ; ${fr(hi)}[`, outer = `[${fr(a)} ; ${fr(lo)}[ ∪ ]${fr(hi)} ; ${fr(b)}]`;
        const answer = (dir > 0) === (q === 0) ? inner : outer;
        const expr = dir > 0 ? `${fact(h)}² − 1` : `${M}${fact(h)}² + 1`;
        const ext = dir > 0 ? 'minimum' : 'maximum';
        return {...E(o, `Observe la parabole de <strong>g(x) = ${expr}</strong> sur [${fr(a)} ; ${fr(b)}]. Les graduations sont régulières.<br>${parabolaGraph(h, dir)}`,
          [N(`g(${fr(a)})`, 3 * dir), N(`g(${fr(h)})`, -dir), {label: 'Antécédents de 0', type: 'unordered-list', answer: `${lo};${hi}`},
           N(dir > 0 ? 'Minimum de g' : 'Maximum de g', -dir), N('Atteint pour x =', h),
           S(`Solutions de g(x) ${sym} 0`, answer, [`[${fr(lo)} ; ${fr(hi)}]`, inner, outer, `[${fr(a)} ; ${fr(lo)}] ∪ [${fr(hi)} ; ${fr(b)}]`], {shuffle: true})],
          C('une image se lit sur l’axe vertical à partir d’une abscisse ; les antécédents de 0 sont les abscisses des points d’intersection avec l’axe horizontal ; le signe de g se lit selon que la courbe est au-dessus ou au-dessous de cet axe.',
            [`g(${fr(a)}) = ${dir > 0 ? '' : M}(${M}2)² ${dir > 0 ? M + ' 1' : '+ 1'} = ${fr(3 * dir)} et g(${fr(h)}) = ${fr(-dir)}.`,
             `g(x) = 0 ⇔ ${fact(h)}² = 1 ⇔ x = ${fr(lo)} ou x = ${fr(hi)}. On le confirme en factorisant : g(x) = ${coefText(dir)}${fact(lo)}${fact(hi)}. La courbe est ${dir > 0 ? 'sous' : 'au-dessus de'} l’axe entre ces deux valeurs, et ${dir > 0 ? 'au-dessus' : 'au-dessous'} à l’extérieur.`],
            `le ${ext} de g vaut ${fr(-dir)}, atteint en x = ${fr(h)}. L’inégalité stricte exclut les zéros : l’ensemble des solutions de g(x) ${sym} 0 est ${answer}.`,
            productSignTable(`Signe de g(x) sur [${fr(a)} ; ${fr(b)}]`, dir, lo, hi, a, b, 'g(x)'))),
          coachingContext: {h, lo, hi, dir, q}};
      }
    },
    { // 4. Déterminer une fonction affine à partir de deux points
      base: {a: 3, b: 2, x1: 1, x2: 4, xq: 10},
      params: r => { const x1 = r.int(-2, 3); return {a: r.nonZero(1, 5), b: r.nonZero(1, 8), x1, x2: x1 + r.int(2, 4), xq: r.int(5, 10)}; },
      accept: ({a, b, x1, x2, xq}) => x1 !== 0 && xq !== x2 && a !== b && a * x1 + b !== 0 && a * x2 + b !== 0,
      coefs: ['a', 'b'],
      difficulty: ({a, b, x1, x2, xq}) => score({steps: 4, values: [a, b, a * x1 + b, a * x2 + b, x1, x2, a * xq + b]}),
      verify: ({a, b, x1, x2, xq}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * x2 + v[1] === a * x2 + b && v[2] === a * xq + b
        && v[3] === (a > 0 ? 'Croissante' : 'Décroissante'),
      build: ({a, b, x1, x2, xq}, o) => {
        const y1 = a * x1 + b, y2 = a * x2 + b, hq = a * xq + b;
        return {...E(o, `Une droite passe par <strong>A(${fr(x1)} ; ${fr(y1)})</strong> et <strong>B(${fr(x2)} ; ${fr(y2)})</strong>. Elle représente la fonction affine h(x) = ax + b. Trouve a et b, calcule h(${xq}) et donne le sens de variation de h.`,
          [N('Coefficient directeur a', a), N('Ordonnée à l’origine b', b), N(`h(${xq})`, hq),
           S('Sens de variation de h', a > 0 ? 'Croissante' : 'Décroissante', ['Croissante', 'Décroissante', 'Constante'])],
          C('le coefficient directeur vaut a = (y<sub>B</sub> − y<sub>A</sub>)/(x<sub>B</sub> − x<sub>A</sub>) ; on obtient ensuite b en écrivant que A est sur la droite.',
            [`a = (${fr(y2)} − ${pa(y1)})/(${fr(x2)} − ${pa(x1)}) = ${fr(y2 - y1)}/${fr(x2 - x1)} = ${fr(a)}.`,
             `A est sur la droite : ${fr(y1)} = ${fr(a)} × ${pa(x1)} + b, donc b = ${fr(y1)} − ${pa(a * x1)} = ${fr(b)}. Alors h(${xq}) = ${fr(a)} × ${xq}${sg(b)} = ${fr(hq)}.`],
            `h(x) = ${affine(a, b)} et h(${xq}) = ${fr(hq)}. Comme a = ${fr(a)} est ${a > 0 ? 'positif' : 'négatif'}, h est ${a > 0 ? 'croissante' : 'décroissante'}.`)),
          coachingContext: {a, b, y1, y2, x1, x2, xq}};
      }
    },
    { // 5. Comparer deux tarifs
      base: {ctx: 0, rA: 9, diff: 5, k: 4, t0: 2, q: 0},
      params: r => ({ctx: r.int(0, 1), rA: r.int(3, 12), diff: r.int(2, 6), k: r.int(3, 8), t0: r.int(1, 2), q: r.int(0, 1)}),
      difficulty: ({rA, diff, k, t0}) => score({steps: 4, values: [diff * k, rA, rA + diff, diff * k + rA * t0, (rA + diff) * t0, k]}),
      verify: ({rA, diff, k, t0, q}, v) => v[0] === diff * k + rA * t0 && v[1] === (rA + diff) * t0
        && diff * k + rA * v[2] === (rA + diff) * v[2] && v[3] === (q ? `t ≤ ${k}` : `t ≥ ${k}`),
      build: ({ctx, rA, diff, k, t0, q}, o) => {
        const fixed = diff * k, rB = rA + diff, A = fixed + rA * t0, B = rB * t0;
        const intro = ctx
          ? `Deux formules de cours de musique : avec la formule A, on paie <strong>${eur(fixed)} d’inscription puis ${eur(rA)} par séance</strong> ; avec la formule B, <strong>${eur(rB)} par séance</strong>, sans inscription. Pour t séances, les prix en euros sont A(t) = ${fr(fixed)} + ${fr(rA)}t et B(t) = ${fr(rB)}t.`
          : `Deux offres de location : <strong>A(t) = ${fr(fixed)} + ${fr(rA)}t</strong> et <strong>B(t) = ${fr(rB)}t</strong>, où t est la durée en heures et les prix sont en euros.`;
        const ask = q ? 'B(t) ≤ A(t) lorsque' : 'A(t) ≤ B(t) lorsque', answer = q ? `t ≤ ${k}` : `t ≥ ${k}`;
        const when = t0 === 1 ? (ctx ? '1 séance' : '1 heure') : (ctx ? `${t0} séances` : `${t0} heures`);
        return {...E(o, `${intro} Compare les deux prix pour t = ${t0}, trouve la valeur de t pour laquelle ils sont égaux, puis résous l’inéquation demandée.`,
          [N(`A(${t0}), en €`, A), N(`B(${t0}), en €`, B), N(ctx ? 'Nombre de séances à l’égalité' : 'Durée d’égalité, en h', k),
           S(ask, answer, [`t < ${k}`, `t ≤ ${k}`, `t ≥ ${k}`, `t > ${k}`])],
          C('on calcule les deux prix pour la même valeur de t, puis on résout l’équation A(t) = B(t) et l’inéquation en regroupant les termes en t d’un même côté.',
            [`A(${t0}) = ${fr(fixed)} + ${fr(rA)} × ${t0} = ${fr(A)} et B(${t0}) = ${fr(rB)} × ${t0} = ${fr(B)}.`,
             `A(t) = B(t) ⇔ ${fr(fixed)} + ${fr(rA)}t = ${fr(rB)}t ⇔ ${fr(fixed)} = ${fr(diff)}t ⇔ t = ${k}.`,
             q ? `B(t) ≤ A(t) ⇔ ${fr(rB)}t ≤ ${fr(fixed)} + ${fr(rA)}t ⇔ ${fr(diff)}t ≤ ${fr(fixed)} ⇔ t ≤ ${k}.`
               : `A(t) ≤ B(t) ⇔ ${fr(fixed)} + ${fr(rA)}t ≤ ${fr(rB)}t ⇔ ${fr(fixed)} ≤ ${fr(diff)}t ⇔ t ≥ ${k}.`,
             `Autre lecture : B(t) − A(t) = ${fr(diff)}t − ${fr(fixed)} s’annule pour t = ${k} et son coefficient ${fr(diff)} est positif.`],
            `pour ${when}, A coûte ${eur(A)} et B ${eur(B)}. Les deux prix sont égaux pour ${ctx ? `${k} séances` : `${k} heures`} (t = ${k}) ; ${q ? `la formule B est au plus aussi chère que A lorsque t ≤ ${k}` : `la formule A est au plus aussi chère que B lorsque t ≥ ${k}`}.`,
            affineSignTable('Signe de B(t) − A(t) pour t ≥ 0', 'B(t) − A(t)', diff, k, 0, null, 't'))),
          coachingContext: {fixed, rateA: rA, rateB: rB, k, t0, q}};
      }
    },
    { // 6. Taux de variation : affine ou non ?
      base: {kind: 0, a: 1, b: 0, x1: 2, x2: 5},
      params: r => { const kind = r.int(0, 1), x1 = r.int(1, 3); return {kind, a: r.nonZero(1, 3), b: kind ? r.nonZero(1, 6) : 0, x1, x2: x1 + r.int(2, 3)}; },
      accept: ({kind, a, b, x1, x2}) => [x1, x2, x2 + 1].every(x => (kind ? a * x + b : a * x * x) !== 0),
      coefs: ['a', 'b'],
      difficulty: ({kind, a, b, x1, x2}) => {
        const q = x => (kind ? a * x + b : a * x * x);
        return score({steps: 4, values: [q(x1), q(x2), q(x2 + 1), (q(x2) - q(x1)) / (x2 - x1), q(x2 + 1) - q(x2)]});
      },
      verify: ({kind, a, b, x1, x2}, v) => {
        const q = x => (kind ? a * x + b : a * x * x), x3 = x2 + 1;
        return v[0] * (x2 - x1) === q(x2) - q(x1) && v[1] === q(x3) - q(x2) && v[2] === (v[0] === v[1] ? 'Affine' : 'Non affine');
      },
      build: ({kind, a, b, x1, x2}, o) => {
        const x3 = x2 + 1, q = x => (kind ? a * x + b : a * x * x);
        const t1 = (q(x2) - q(x1)) / (x2 - x1), t2 = q(x3) - q(x2), expr = kind ? affine(a, b) : term(a, 'x²', true);
        const equal = t1 === t2;
        return {...E(o, `On considère <strong>q(x) = ${expr}</strong>. Calcule les taux de variation de q entre ${x1} et ${x2}, puis entre ${x2} et ${x3}, et conclus.`,
          [N(`Entre ${x1} et ${x2}`, t1), N(`Entre ${x2} et ${x3}`, t2),
           S('Conclusion', equal ? 'Affine' : 'Non affine', ['Affine', 'Non affine', 'Constante'])],
          C('le taux de variation entre u et v est [q(v) − q(u)]/(v − u). Une fonction affine a le même taux sur tous les intervalles ; des taux différents prouvent que q n’est pas affine.',
            [`q(${x1}) = ${fr(q(x1))}, q(${x2}) = ${fr(q(x2))} et q(${x3}) = ${fr(q(x3))}.`,
             `Entre ${x1} et ${x2} : [${fr(q(x2))} − ${pa(q(x1))}]/(${x2} − ${x1}) = ${fr(t1)}. Entre ${x2} et ${x3} : [${fr(q(x3))} − ${pa(q(x2))}]/(${x3} − ${x2}) = ${fr(t2)}.`],
            equal ? `les deux taux valent ${fr(t1)} : c’est cohérent avec la forme affine q(x) = ${expr}, dont le coefficient directeur est ${fr(a)}.`
              : `les taux ${fr(t1)} et ${fr(t2)} sont différents, donc q n’est pas une fonction affine.`)),
          coachingContext: {kind, a, b, x1, x2, x3}};
      }
    },
    { // 7. Variations et signe d'une fonction affine sur un intervalle
      base: {m: -2, root: 4, max: 6},
      params: r => { const root = r.int(1, 7); return {m: r.nonZero(1, 5), root, max: root + r.int(1, 4)}; },
      coefs: ['m'],
      difficulty: ({m, root, max}) => score({steps: 3, values: [m, -m * root, root, max]}),
      verify: ({m, root, max}, v) => m * v[1] - m * root === 0
        && v[0] === (m > 0 ? 'Croissante' : 'Décroissante') && v[2] === (m < 0 ? `[0 ; ${root}]` : `[${root} ; ${max}]`),
      build: ({m, root, max}, o) => {
        const b = -m * root, answer = m < 0 ? `[0 ; ${root}]` : `[${root} ; ${max}]`;
        return {...E(o, `On considère <strong>p(x) = ${affine(m, b)}</strong> sur [0 ; ${max}]. Étudie son sens de variation et son signe.`,
          [S('Sens de variation', m > 0 ? 'Croissante' : 'Décroissante', ['Croissante', 'Décroissante', 'Constante']), N('Solution de p(x) = 0', root),
           S('Solutions de p(x) ≥ 0', answer, [`[0 ; ${root}]`, `[${root} ; ${max}]`, `]0 ; ${root}[`, `]${root} ; ${max}]`], {shuffle: true})],
          C('le signe du coefficient directeur donne le sens de variation ; on résout p(x) = 0, puis on dresse le tableau de signes sur l’intervalle d’étude.',
            [`Le coefficient directeur ${fr(m)} est ${m > 0 ? 'positif' : 'négatif'} : p est ${m > 0 ? 'croissante' : 'décroissante'}.`,
             m === 1 ? `p(x) = 0 ⇔ ${affine(m, b)} = 0 ⇔ x = ${root}.` : `p(x) = 0 ⇔ ${term(m, 'x', true)} = ${fr(-b)} ⇔ x = ${root}.`],
            `sur [0 ; ${max}], p(x) ≥ 0 pour x ∈ ${answer} : la borne ${root}, où p s’annule, est incluse.`,
            affineSignTable('Signe de p(x) sur [0 ; ' + max + ']', 'p(x)', m, root, 0, max))),
          coachingContext: {a: m, b, root, max}};
      }
    },
    { // 8. Un modèle inversement proportionnel
      base: {set: 0, m: 1, dir: 0, q: 0},
      params: r => ({set: r.int(0, 3), m: r.int(1, 3), dir: r.int(0, 1), q: r.int(0, 1)}),
      accept: ({set, m}) => LCM[set] * m <= 720,
      space: 44,
      difficulty: ({set, m}) => {
        const D = LCM[set] * m;
        return score({steps: 5, values: [D, ...SPEEDS[set], ...SPEEDS[set].map(s => D / s)]});
      },
      verify: ({set, m, dir, q}, v) => {
        const s = SPEEDS[set], D = LCM[set] * m;
        return v[0] * s[0] === D && v[1] * s[1] === D && v[2] * s[2] === D && v[0] === 2 * v[2]
          && v[3] === (dir ? 'La durée double' : 'La durée est divisée par deux') && v[4] === (q ? 'Non' : 'Oui');
      },
      build: ({set, m, dir, q}, o) => {
        const s = SPEEDS[set], D = LCM[set] * m, t = s.map(v => D / v);
        return {...E(o, `Pour parcourir <strong>${fr(D)} km</strong> à vitesse constante v (en km/h), la durée en heures est <strong>t(v) = ${fr(D)}/v</strong>, avec v > 0.`,
          [N(`t(${s[0]}), en h`, t[0]), N(`t(${s[1]}), en h`, t[1]), N(`t(${s[2]}), en h`, t[2]),
           S(dir ? `Quand la vitesse passe de ${s[2]} à ${s[0]} km/h` : `Quand la vitesse passe de ${s[0]} à ${s[2]} km/h`,
             dir ? 'La durée double' : 'La durée est divisée par deux', ['La durée double', 'La durée est divisée par deux', 'La durée ne change pas'], {shuffle: true}),
           S(q ? 'La durée est-elle proportionnelle à la vitesse ?' : 'La durée est-elle inversement proportionnelle à la vitesse ?', q ? 'Non' : 'Oui', ['Oui', 'Non'])],
          C('à distance fixée, durée = distance ÷ vitesse. Deux grandeurs sont inversement proportionnelles lorsque leur produit est constant.',
            [`t(${s[0]}) = ${fr(D)}/${s[0]} = ${fr(t[0])} h, t(${s[1]}) = ${fr(D)}/${s[1]} = ${fr(t[1])} h et t(${s[2]}) = ${fr(D)}/${s[2]} = ${fr(t[2])} h.`,
             `Le produit v × t(v) vaut toujours ${fr(D)} : quand la vitesse est multipliée par 2, la durée est divisée par 2, et inversement.`],
            `${dir ? `en passant de ${s[2]} à ${s[0]} km/h, la durée double` : `en passant de ${s[0]} à ${s[2]} km/h, la durée est divisée par deux`}. La durée est inversement proportionnelle à la vitesse ; elle ne lui est pas proportionnelle.`)),
          coachingContext: {D, speeds: s}};
      }
    },
    { // 9. Encadrer une racine carrée par balayage
      base: {n: 5},
      params: r => ({n: r.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20])}),
      space: 16, decimals: 4,
      difficulty: ({n}) => { const k = lowHundredth(n); return score({steps: 4, values: [n, k / 100, (k + 1) / 100, k * k / 10000, (k + 1) ** 2 / 10000]}); },
      verify: ({n}, v) => v[2] * v[2] < n && v[3] * v[3] > n && Math.abs(v[3] - v[2] - 0.01) < 1e-9
        && Math.abs(v[0] - v[2] * v[2]) < 1e-9 && Math.abs(v[1] - v[3] * v[3]) < 1e-9,
      build: ({n}, o) => {
        const k = lowHundredth(n), low = k / 100, high = (k + 1) / 100, l2 = k * k / 10000, h2 = (k + 1) ** 2 / 10000;
        return {...E(o, `Cherche un encadrement au centième de la solution positive de <strong>x² = ${n}</strong>. Calcule les carrés de deux centièmes consécutifs, puis encadre √${n}.`,
          [N(`${fr(low)}²`, l2, 0.00001), N(`${fr(high)}²`, h2, 0.00001), N('Borne inférieure', low), N('Borne supérieure', high)],
          C('on calcule les carrés de deux nombres positifs voisins et on les compare à ' + n + ' ; la fonction carré étant croissante sur [0 ; +∞[, l’ordre des carrés donne l’ordre des nombres.',
            [`${fr(low)}² = ${fr(l2)} et ${fr(high)}² = ${fr(h2)}.`, `On a ${fr(l2)} < ${n} < ${fr(h2)}.`],
            `${fr(low)} < √${n} < ${fr(high)} : c’est l’encadrement de √${n} au centième.`), {title: 'Encadrer √' + n}),
          coachingContext: {n, low, high}};
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
})();
