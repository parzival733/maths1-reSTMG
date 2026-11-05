/* Repères : calcul, évolutions en pourcentage, logique et ensembles. Modèles
   déclaratifs ; les calculs restent faisables sans calculatrice. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, productSignTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, poly, fact, affine, frac, gcd, pct, eur, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  const SUP = {'-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'};
  const sup = n => String(n).split('').map(c => SUP[c]).join('');
  const places = x => { const t = String(F(x, 9)); return t.includes('.') ? t.split('.')[1].length : 0; };
  const red = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const decimalDen = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const approx2 = (label, value) => N(label, F(value, 6), 0.001, 2);

  register('calcul', [
    { // 1. Respecter les priorités
      base: {form: 0, a: 3, b: 4, d: 5, k: 2, q: 0},
      params: r => ({form: r.int(0, 1), a: r.int(2, 12), b: r.int(2, 9), d: r.int(2, 9), k: r.int(2, 9), q: r.int(0, 1)}),
      accept: ({form, a, b}) => form === 0 || a !== b,
      limit: 200,
      difficulty: ({form, a, b, d, k}) => { const s = form ? -1 : 1; return score({steps: 4, values: [a, b, d, a + s * b * d, (a + s * b) * d, k * k], negatives: true}); },
      verify: ({form, a, b, d, k, q}, v) => v[1] - v[0] === a * d - a && v[0] === a + (form ? -1 : 1) * b * d && v[2] === (q ? 1 : -1) * k * k,
      build: ({form, a, b, d, k, q}, o) => {
        const op = form ? M : '+', s = form ? -1 : 1, e1 = a + s * b * d, e2 = (a + s * b) * d, e3 = (q ? 1 : -1) * k * k;
        const l3 = q ? `(${M}${k})²` : `${M}${k}²`;
        return E(o, `On calcule des expressions numériques sans calculatrice : <strong>${a} ${op} ${b} × ${d}</strong>, <strong>(${a} ${op} ${b}) × ${d}</strong> et <strong>${l3}</strong>.`,
          [N(`${a} ${op} ${b} × ${d}`, e1), N(`(${a} ${op} ${b}) × ${d}`, e2), N(l3, e3)],
          C('on effectue d’abord les calculs entre parenthèses, puis les puissances, puis les multiplications, et enfin les additions et soustractions.',
            [`${a} ${op} ${b} × ${d} = ${a} ${op} ${b * d} = ${fr(e1)} ; (${a} ${op} ${b}) × ${d} = ${fr(a + s * b)} × ${d} = ${fr(e2)}.`,
             q ? `(${M}${k})² = (${M}${k}) × (${M}${k}) = ${k * k}.` : `${M}${k}² = ${M}(${k}²) = ${M}${k * k} : la puissance passe avant le signe moins.`],
            `${a} ${op} ${b} × ${d} = ${fr(e1)}, (${a} ${op} ${b}) × ${d} = ${fr(e2)} et ${l3} = ${fr(e3)}.`),
          tasks(`Calcule ${a} ${op} ${b} × ${d}.`, `Calcule (${a} ${op} ${b}) × ${d}.`, `Calcule ${l3}.`));
      }
    },
    { // 2. Manipuler des fractions
      base: {a: 3, b: 4, c: 1, k: 2, p: 2, q: 3, s: 5, u: 1, w: 2, g: 1, h: 3},
      params: r => {
        const b = r.pick([2, 4, 5, 8, 10]), k = r.pick([2, 4]), q = r.pick([3, 7, 9]), w = r.pick([2, 4, 5, 10]), h = r.pick([3, 6, 9]);
        const co = n => Array.from({length: n - 1}, (_, i) => i + 1).filter(x => gcd(x, n) === 1);
        const s = r.pick([2, 4, 5, 8, 10]);
        return {a: r.pick(co(b)), b, c: r.pick(co(k * b)), k, p: r.pick(co(q).filter(x => gcd(x, s) === 1)), q, s, u: r.pick(co(w)), w, g: r.pick(co(h)), h};
      },
      accept: ({a, b, c, k, p, q, s, u, w, g, h}) => gcd(a, b) === 1 && gcd(c, k * b) === 1 && gcd(p, q) === 1 && gcd(u, w) === 1 && gcd(g, h) === 1
        && gcd(p, s) === 1 && p % s !== 0 && (k * a + c) % (k * b) !== 0 && red(u * h + g * w, w * h)[1] > 1
        && places((k * a + c) / (k * b)) <= 3 && places(p / s) <= 3 && places(u / w) <= 3,
      decimals: 3, limit: 200,
      difficulty: ({a, b, c, k, p, q, s, u, w, g, h}) => { const [e, f] = red(u * h + g * w, w * h); return score({steps: 6, fractions: true, values: [a, b, c, k * b, (k * a + c) / (k * b), p, q, s, p / s, e, f, g, h, u / w]}); },
      verify: ({a, b, c, k, p, s, u, w, g, h}, v) => { const [e, f] = red(u * h + g * w, w * h); return Math.abs(v[0] - (a / b + c / (k * b))) < 1e-9 && Math.abs(v[1] - p / s) < 1e-9 && Math.abs(v[2] - (e / f - g / h)) < 1e-9; },
      build: ({a, b, c, k, p, q, s, u, w, g, h}, o) => {
        const [e, f] = red(u * h + g * w, w * h), S1 = (k * a + c) / (k * b), L = f * h / gcd(f, h);
        const l1 = `${a}/${b} + ${c}/${k * b}`, l2 = `(${p}/${q}) × (${q}/${s})`, l3 = `${e}/${f} − ${g}/${h}`;
        return E(o, `Calcule sans calculatrice <strong>${l1}</strong>, <strong>${l2}</strong> et <strong>${l3}</strong>, puis donne les résultats sous forme décimale exacte.`,
          [N(l1, S1), N(l2, p / s), N(l3, u / w)],
          C('pour additionner ou soustraire, on réduit au même dénominateur ; pour multiplier, on multiplie numérateurs et dénominateurs, puis on simplifie.',
            [`${l1} = ${k * a}/${k * b} + ${c}/${k * b} = ${k * a + c}/${k * b}${frac(k * a + c, k * b) === (k * a + c) + '/' + (k * b) ? '' : ' = ' + frac(k * a + c, k * b)} = ${fr(S1)}.`,
             `${l2} = ${p * q}/${q * s} = ${frac(p, s)} = ${fr(p / s)}.`,
             `${l3} = ${e * L / f}/${L} − ${g * L / h}/${L} = ${e * L / f - g * L / h}/${L}${frac(u, w) === (e * L / f - g * L / h) + '/' + L ? '' : ' = ' + frac(u, w)} = ${fr(u / w)}.`],
            `${l1} = ${fr(S1)}, ${l2} = ${fr(p / s)} et ${l3} = ${fr(u / w)}.`),
          {title: 'Manipuler des fractions', ...tasks(`Calcule ${l1}.`, `Calcule ${l2}.`, `Calcule ${l3}.`)});
      }
    },
    { // 3. Puissances et racine carrée
      base: {B: 2, op: 0, a: 3, b: 4, n: 3, k: 9},
      params: r => { const B = r.pick([2, 3]), op = r.int(0, 1); return {B, op, a: r.int(2, B === 2 ? 6 : 4), b: r.int(1, B === 2 ? 4 : 3), n: r.int(1, 4), k: r.int(4, 14)}; },
      accept: ({B, op, a, b}) => { const e = op ? a - b : a + b; return e >= 1 && B ** e <= 128 && (op === 0 || a > b); },
      decimals: 4, limit: 200,
      difficulty: ({B, op, a, b, n, k}) => score({steps: 3, values: [B ** (op ? a - b : a + b), 10 ** -n, k * k]}),
      verify: ({B, op, a, b, n, k}, v) => v[0] === (op ? B ** a / B ** b : B ** a * B ** b) && Math.abs(v[1] * 10 ** n - 1) < 1e-9 && v[2] * v[2] === k * k && v[2] > 0,
      build: ({B, op, a, b, n, k}, o) => {
        const e = op ? a - b : a + b, l1 = `${B}${sup(a)} ${op ? '÷' : '×'} ${B}${sup(b)}`;
        return E(o, `Calcule <strong>${B}<sup>${a}</sup> ${op ? '÷' : '×'} ${B}<sup>${b}</sup></strong>, <strong>10<sup>${M}${n}</sup></strong> et <strong>√${k * k}</strong>.`,
          [N(l1, B ** e), N(`10${sup(-n)}`, F(10 ** -n, 6)), N(`√${k * k}`, k)],
          C(`pour un même nombre, a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup> et a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup> ; 10<sup>−n</sup> = 1/10<sup>n</sup> ; √(k²) = k pour k positif.`,
            [`${B}<sup>${a}</sup> ${op ? '÷' : '×'} ${B}<sup>${b}</sup> = ${B}<sup>${e}</sup> = ${B ** e}.`, `10<sup>${M}${n}</sup> = 1/${fr(10 ** n)} = ${fr(10 ** -n)} ; √${k * k} = ${k} car ${k}² = ${k * k}.`],
            `${l1} = ${B ** e}, 10${sup(-n)} = ${fr(10 ** -n)} et √${k * k} = ${k}.`),
          tasks(`Calcule ${l1}.`, `Calcule 10${sup(-n)}.`, `Calcule √${k * k}.`));
      }
    },
    { // 4. Proportion de proportion
      base: {ctx: 0, T: 240, p1: 60, p2: 25},
      params: r => ({ctx: r.int(0, 2), T: r.pick([200, 240, 300, 400, 500, 600]), p1: r.pick([20, 25, 40, 50, 60, 75, 80]), p2: r.pick([10, 20, 25, 50])}),
      accept: ({T, p1, p2}) => Number.isInteger(T * p1 / 100) && Number.isInteger(T * p1 * p2 / 10000),
      decimals: 2,
      difficulty: ({T, p1, p2}) => score({steps: 3, values: [T, T * p1 / 100, T * p1 * p2 / 10000, p1 * p2 / 100]}),
      verify: ({T, p1, p2}, v) => v[0] === T * p1 / 100 && v[1] === v[0] * p2 / 100 && Math.abs(v[2] - 100 * v[1] / T) < 1e-9,
      build: ({ctx, T, p1, p2}, o) => {
        const m = T * p1 / 100, n = m * p2 / 100, part = p1 * p2 / 100;
        const k = [
          {intro: `Un groupe de ${T} personnes compte <strong>${p1} % de membres</strong> d’une association. Parmi ces membres, ${p2} % sont bénévoles.`, a: 'Nombre de membres', b: 'Nombre de bénévoles', who: 'bénévoles'},
          {intro: `Un club de ${T} adhérents compte <strong>${p1} % de licenciés en compétition</strong>. Parmi eux, ${p2} % sont juniors.`, a: 'Nombre de licenciés en compétition', b: 'Nombre de juniors en compétition', who: 'juniors en compétition'},
          {intro: `Une entreprise de ${T} salariés compte <strong>${p1} % de salariés à temps partiel</strong>. Parmi eux, ${p2} % sont en télétravail.`, a: 'Nombre de salariés à temps partiel', b: 'Nombre en télétravail', who: 'salariés à temps partiel en télétravail'}
        ][ctx];
        return E(o, k.intro,
          [N(k.a, m), N(k.b, n), N('Part du groupe entier, en %', part)],
          C('prendre p % d’une quantité revient à la multiplier par p/100 ; une proportion de proportion se calcule en multipliant les deux proportions.',
            [`${T} × ${fr(p1 / 100)} = ${m} ; ${m} × ${fr(p2 / 100)} = ${n}.`, `${fr(p1 / 100)} × ${fr(p2 / 100)} = ${fr(part / 100)}, soit ${pct(part)} (contrôle : ${n}/${T} = ${fr(part / 100)}).`],
            `il y a ${n} ${k.who}, soit ${pct(part)} du groupe entier.`),
          tasks('Calcule le premier effectif.', 'Calcule le second effectif.', 'Calcule la part du groupe entier qu’il représente, en %.'));
      }
    },
    { // 5. Convertir des unités
      base: {h: 2.5, km: 0.75, dir: 0, v: 18},
      params: r => { const dir = r.int(0, 1); return {h: r.pick([0.25, 0.5, 0.75, 1.25, 1.5, 1.75, 2.5, 3.5]), km: r.pick([0.05, 0.25, 0.3, 0.45, 0.5, 0.75, 0.8, 0.95]), dir, v: dir ? r.pick([18, 36, 54, 72, 90, 108]) : r.pick([5, 10, 15, 18, 20, 25, 30])}; },
      decimals: 1, limit: 1000,
      difficulty: ({h, km, dir, v}) => score({steps: 3, values: [h, km, v, 60 * h, 1000 * km, dir ? v / 3.6 : 3.6 * v]}),
      verify: ({h, km, dir, v}, x) => Math.abs(x[0] - 60 * h) < 1e-9 && Math.abs(x[1] - 1000 * km) < 1e-9 && Math.abs(dir ? x[2] * 3.6 - v : x[2] - 3.6 * v) < 1e-9,
      build: ({h, km, dir, v}, o) => {
        const conv = dir ? v / 3.6 : 3.6 * v, l3 = dir ? `${v} km/h en m/s` : `${v} m/s en km/h`;
        return E(o, `On prépare un trajet. Convertis <strong>${fr(h)} h en minutes</strong>, <strong>${fr(km)} km en mètres</strong> et <strong>${l3}</strong>.`,
          [N(`${fr(h)} h en minutes`, F(60 * h, 6)), N(`${fr(km)} km en mètres`, F(1000 * km, 6)), N(l3, F(conv, 6))],
          C('1 h = 60 min et 1 km = 1 000 m ; 1 m/s = 3 600 m/h = 3,6 km/h, donc on multiplie par 3,6 pour passer des m/s aux km/h et on divise par 3,6 pour l’inverse.',
            [`${fr(h)} × 60 = ${fr(60 * h)} min ; ${fr(km)} × 1 000 = ${fr(1000 * km)} m.`, dir ? `${v} ÷ 3,6 = ${fr(conv)} m/s.` : `${v} × 3,6 = ${fr(conv)} km/h.`],
            `${fr(h)} h = ${fr(60 * h)} min, ${fr(km)} km = ${fr(1000 * km)} m et ${l3.replace(' en ', ' = ')} : ${fr(conv)} ${dir ? 'm/s' : 'km/h'}.`),
          tasks(`Convertis ${fr(h)} h en minutes.`, `Convertis ${fr(km)} km en mètres.`, `Convertis ${l3}.`));
      }
    },
    { // 6. Développer et réduire
      base: {a: 3, p: 2, s: -1, b: 2, q: -1, x: 4},
      params: r => ({a: r.int(2, 6), p: r.nonZero(1, 6), s: r.sign(), b: r.int(2, 6), q: r.nonZero(1, 6), x: r.int(-3, 5)}),
      accept: ({a, p, s, b, q}) => a + s * b !== 0 && a * p + s * b * q !== 0,
      coefs: ['a', 'p', 'b', 'q'],
      difficulty: ({a, p, s, b, q, x}) => { const c = a + s * b, d = a * p + s * b * q; return score({steps: 4, values: [a, a * p, b, b * q, c, d, c * x + d]}); },
      verify: ({a, p, s, b, q, x}, v) => { const A = t => a * (t + p) + s * b * (t + q); return v[0] === A(1) - A(0) && v[1] === A(0) && v[2] === A(x); },
      build: ({a, p, s, b, q, x}, o) => {
        const c = a + s * b, d = a * p + s * b * q;
        const expr = `${a}${fact(-p)} ${s > 0 ? '+' : M} ${b}${fact(-q)}`;
        return E(o, `On considère <strong>A(x) = ${expr}</strong>.`,
          [N('Coefficient a de A(x) = ax + b', c), N('Constante b', d), N(`A(${fr(x)})`, c * x + d)],
          C('on distribue chaque facteur (attention au signe placé devant la deuxième parenthèse), puis on regroupe les termes en x et les constantes.',
            [`${a}${fact(-p)} = ${affine(a, a * p)} et ${s > 0 ? '' : M}${b}${fact(-q)} = ${affine(s * b, s * b * q)}.`,
             `A(x) = ${affine(a, a * p)}${term(s * b, 'x')}${sg(s * b * q)} = ${affine(c, d)} ; A(${fr(x)}) = ${fr(c)} × ${pa(x)}${sg(d)} = ${fr(c * x + d)}.`],
            `A(x) = ${affine(c, d)} et A(${fr(x)}) = ${fr(c * x + d)}.`),
          tasks('Complète la forme A(x) = ax + b.', `Calcule A(${fr(x)}).`));
      }
    },
    { // 7. Factoriser et résoudre
      base: {k: 3, m: 2, n: 7, sol: 6},
      params: r => ({k: r.int(2, 12), m: r.nonZero(2, 9), n: r.nonZero(1, 15), sol: r.nonZero(1, 10)}),
      accept: ({m, n, sol}) => m * sol + n !== 0,
      limit: 200,
      difficulty: ({k, m, n, sol}) => score({steps: 4, values: [k * k, m, n, m * sol + n, sol]}),
      verify: ({k, m, n, sol}, v) => v[0] * v[0] === k * k && v[1] * v[1] === k * k && v[0] < 0 && m * v[2] + n === m * sol + n && v[3] === -k * k,
      build: ({k, m, n, sol}, o) => {
        const t = m * sol + n;
        return E(o, `On travaille avec <strong>x² − ${k * k}</strong> et l’équation <strong>${affine(m, n)} = ${fr(t)}</strong>.`,
          [N('Racine négative de x² − ' + k * k, -k), N('Racine positive', k), N('Solution de l’équation', sol), N(`x² − ${k * k} pour x = 0`, -k * k)],
          C('on reconnaît une différence de deux carrés a² − b² = (a − b)(a + b) ; pour l’équation du premier degré, on isole x.',
            [`x² − ${k * k} = x² − ${k}² = (x − ${k})(x + ${k}) : les racines sont ${M}${k} et ${k}.`, `${affine(m, n)} = ${fr(t)} ⇔ ${term(m, 'x', true)} = ${fr(t - n)} ⇔ x = ${fr(sol)}.`],
            `les racines de x² − ${k * k} sont ${M}${k} et ${k} ; l’équation a pour solution ${fr(sol)} ; pour x = 0, x² − ${k * k} vaut ${M}${k * k}.`),
          tasks(`Donne les deux racines de x² − ${k * k} = 0.`, `Résous ${affine(m, n)} = ${fr(t)}.`, `Calcule x² − ${k * k} pour x = 0.`));
      }
    },
    { // 8. Résoudre des inéquations
      base: {a: 3, b: -4, bnd: 5, sym: 0, fix: 18, rate: 6, hmax: 7, q: 0},
      params: r => ({a: r.nonZero(2, 6), b: r.nonZero(1, 12), bnd: r.int(-5, 8), sym: r.int(0, 1), fix: r.int(10, 30), rate: r.int(2, 9), hmax: r.int(3, 10), q: r.int(0, 1)}),
      accept: ({a, b, bnd}) => a * bnd + b !== 0 && a * bnd !== 0,
      difficulty: ({a, b, bnd, fix, rate, hmax}) => score({steps: 5, values: [a, b, a * bnd + b, bnd, fix, rate, fix + rate * hmax, hmax]}),
      verify: ({a, b, bnd, sym, fix, rate, hmax, q}, v) => {
        const c = a * bnd + b, holds = x => (sym ? a * x + b >= c : a * x + b <= c), le = holds(bnd - 1);
        return v[0] === bnd && v[1] === (le ? `]${M}∞ ; ${fr(bnd)}]` : `[${fr(bnd)} ; +∞[`) && fix + rate * v[2] === fix + rate * hmax && v[3] === (q ? `]${hmax} ; +∞[` : `[0 ; ${hmax}]`);
      },
      build: ({a, b, bnd, sym, fix, rate, hmax, q}, o) => {
        const c = a * bnd + b, op = sym ? '≥' : '≤', flip = a < 0, le = (sym === 0) !== flip, res = le ? '≤' : '≥';
        const set = le ? `]${M}∞ ; ${fr(bnd)}]` : `[${fr(bnd)} ; +∞[`, budget = fix + rate * hmax;
        const set2 = q ? `]${hmax} ; +∞[` : `[0 ; ${hmax}]`;
        return E(o, `Résous <strong>${affine(a, b)} ${op} ${fr(c)}</strong>. Une location coûte <strong>${fix} + ${rate}h €</strong> pour h heures, avec h ≥ 0, et le budget maximal est de <strong>${eur(budget)}</strong>.`,
          [N('Borne de l’ensemble des solutions', bnd), S(`Solutions de ${affine(a, b)} ${op} ${fr(c)}`, set, [`]${M}∞ ; ${fr(bnd)}]`, `[${fr(bnd)} ; +∞[`, `]${M}∞ ; ${fr(bnd)}[`, `]${fr(bnd)} ; +∞[`], {shuffle: true}),
           N('Durée maximale en h', hmax), S(q ? 'Durées pour lesquelles le coût dépasse le budget' : 'Durées autorisées par le budget', set2, [`[0 ; ${hmax}]`, `]${hmax} ; +∞[`, `]0 ; ${hmax}[`, `[${hmax} ; +∞[`], {shuffle: true})],
          C('on isole x comme dans une équation ; si l’on divise les deux membres par un nombre négatif, on change le sens de l’inégalité.',
            [`${affine(a, b)} ${op} ${fr(c)} ⇔ ${term(a, 'x', true)} ${op} ${fr(c - b)} ⇔ x ${res} ${fr(bnd)}${flip ? ` (on divise par ${fr(a)}, qui est négatif : le sens change)` : ''}.`,
             `${fix} + ${rate}h ≤ ${budget} ⇔ ${rate}h ≤ ${budget - fix} ⇔ h ≤ ${hmax}.`],
            `les solutions de la première inéquation forment ${set}. Avec h ≥ 0, le budget est respecté pour h ∈ [0 ; ${hmax}] ; ${q ? `il est dépassé pour h ∈ ]${hmax} ; +∞[` : `la durée maximale est de ${hmax} h`}.`),
          tasks(`Résous ${affine(a, b)} ${op} ${fr(c)}.`, `Trouve la durée maximale h avec ${fix} + ${rate}h ≤ ${budget}.`, 'Choisis l’intervalle demandé.'));
      }
    }
  ]);

  register('evolutions', [
    { // 1. Variation absolue et relative
      base: {ctx: 0, v0: 80, t: 25},
      params: r => ({ctx: r.int(0, 2), v0: r.pick([20, 40, 50, 80, 120, 150, 200, 250]), t: r.pick([-50, -40, -25, -20, -10, -5, 5, 10, 20, 25, 40, 50])}),
      accept: ({v0, t}) => places(v0 * (1 + t / 100)) <= 2,
      decimals: 2,
      difficulty: ({v0, t}) => score({steps: 3, values: [v0, v0 * (1 + t / 100), v0 * t / 100, t, 1 + t / 100]}),
      verify: ({v0, t}, v) => Math.abs(v[0] - v0 * t / 100) < 1e-9 && Math.abs(v[1] - 100 * v[0] / v0) < 1e-9 && Math.abs(v[2] - (v0 + v[0]) / v0) < 1e-9,
      build: ({ctx, v0, t}, o) => {
        const v1 = F(v0 * (1 + t / 100), 6), d = F(v1 - v0, 6), q = F(1 + t / 100, 6);
        const what = ['Un article', 'Le loyer mensuel d’un studio', 'Un abonnement mensuel'][ctx];
        return E(o, `${what} passe de <strong>${eur(v0)} à ${eur(v1)}</strong>.`,
          [N('Variation absolue, en €', d), N('Taux d’évolution, en %', t), N('Coefficient multiplicateur', q)],
          C('variation absolue = valeur finale − valeur initiale ; taux = variation absolue/valeur initiale ; coefficient multiplicateur = valeur finale/valeur initiale = 1 + taux.',
            [`${fr(v1)} − ${fr(v0)} = ${fr(d)} € ; ${fr(d)}/${fr(v0)} = ${fr(t / 100)}, soit ${t > 0 ? '+' : ''}${pct(t)} ; ${fr(v1)}/${fr(v0)} = ${fr(q)}.`],
            `le prix ${t > 0 ? 'augmente' : 'baisse'} de ${eur(Math.abs(d))}, soit une évolution de ${t > 0 ? '+' : ''}${pct(t)} ; le coefficient multiplicateur vaut ${fr(q)}.`),
          {title: 'Variation absolue et relative', ...tasks('Calcule la variation en euros.', 'Calcule le taux d’évolution en %.', 'Donne le coefficient multiplicateur.')});
      }
    },
    { // 2. Deux évolutions successives
      base: {p: 250, t1: 12, t2: -10},
      params: r => ({p: r.pick([100, 200, 250, 400, 500, 800]), t1: r.pick([5, 10, 12, 15, 20, 25, -5, -10, -20]), t2: r.pick([-5, -10, -20, -25, 5, 10, 20])}),
      accept: ({p, t1, t2}) => t1 !== -t2 && places(p * (1 + t1 / 100) * (1 + t2 / 100)) <= 2 && p * (1 + t1 / 100) <= 1000 && p * (1 + t1 / 100) * (1 + t2 / 100) <= 1000,
      decimals: 2,
      difficulty: ({p, t1, t2}) => score({steps: 3, values: [p, 1 + t1 / 100, p * (1 + t1 / 100), p * (1 + t1 / 100) * (1 + t2 / 100)]}),
      verify: ({p, t1, t2}, v) => Math.abs(v[0] - (1 + t1 / 100)) < 1e-9 && Math.abs(v[1] - p * v[0]) < 1e-9 && Math.abs(v[2] - v[1] * (1 + t2 / 100)) < 1e-9,
      build: ({p, t1, t2}, o) => {
        const q1 = F(1 + t1 / 100, 6), q2 = F(1 + t2 / 100, 6), mid = F(p * q1, 6), end = F(mid * q2, 6);
        const w = t => (t > 0 ? `augmente de ${t} %` : `baisse de ${-t} %`);
        return E(o, `Un prix initial de <strong>${eur(p)}</strong> ${w(t1)}, puis le prix obtenu ${w(t2)}.`,
          [N('Coefficient de la première évolution', q1), N('Prix après la première évolution, en €', mid), N('Prix final, en €', end)],
          C('chaque évolution de t % correspond à une multiplication par 1 + t/100 ; la seconde s’applique au prix obtenu après la première.',
            [`Coefficients : ${fr(q1)} puis ${fr(q2)}.`, `${fr(p)} × ${fr(q1)} = ${fr(mid)} € puis ${fr(mid)} × ${fr(q2)} = ${fr(end)} €.`],
            `le prix final est de ${eur(end)}.`),
          {title: 'Deux évolutions successives', ...tasks('Donne le coefficient de la première évolution.', 'Calcule le prix après la première évolution.', 'Calcule le prix final.')});
      }
    },
    { // 3. Une hausse et une baisse de même taux
      base: {v: 100, t: 20, order: 0},
      params: r => ({v: r.pick([50, 100, 200, 400, 500]), t: r.pick([10, 20, 25, 30, 40, 50]), order: r.int(0, 1)}),
      accept: ({v, t}) => places(v * (1 - t * t / 10000)) <= 2,
      decimals: 4,
      difficulty: ({v, t}) => score({steps: 3, values: [v, t, v * (1 - t * t / 10000), 1 - t * t / 10000, -t * t / 100]}),
      verify: ({v, t}, x) => Math.abs(x[0] - v * (1 + t / 100) * (1 - t / 100)) < 1e-9 && Math.abs(x[1] * v - x[0]) < 1e-9 && Math.abs(x[2] - (x[1] - 1) * 100) < 1e-9,
      build: ({v, t, order}, o) => {
        const q = F(1 - t * t / 10000, 6), end = F(v * q, 6), a = F(1 + t / 100, 6), b = F(1 - t / 100, 6);
        return E(o, `Une valeur de <strong>${v}</strong> ${order ? `diminue de ${t} %, puis augmente de ${t} %` : `augmente de ${t} %, puis diminue de ${t} %`}.`,
          [N('Valeur finale', end), N('Coefficient global', q), N('Taux global, en %', F(-t * t / 100, 6))],
          C('on multiplie les coefficients multiplicateurs ; une hausse et une baisse de même taux ne se compensent pas.',
            [`Coefficient global : ${order ? `${fr(b)} × ${fr(a)}` : `${fr(a)} × ${fr(b)}`} = ${fr(q)}.`, `Valeur finale : ${v} × ${fr(q)} = ${fr(end)} ; taux global : (${fr(q)} − 1) × 100 = ${fr(-t * t / 100)}.`],
            `la valeur finale est ${fr(end)} : globalement, elle baisse de ${pct(t * t / 100)}, et non de 0 %.`),
          {title: 'Une hausse et une baisse', ...tasks('Calcule la valeur finale.', 'Détermine le coefficient global.', 'Calcule le taux global en %.')});
      }
    },
    { // 4. Deux évolutions identiques
      base: {v: 100, t: 10, dir: 1},
      params: r => ({v: r.pick([50, 100, 200, 250, 400, 500, 800, 1000]), t: r.pick([5, 10, 20, 25, 30, 40, 50]), dir: r.sign()}),
      accept: ({v, t, dir}) => v * (1 + dir * t / 100) ** 2 <= 1000,
      decimals: 4,
      difficulty: ({v, t, dir}) => { const q = (1 + dir * t / 100) ** 2; return score({steps: 3, values: [v, q, v * q, (q - 1) * 100]}); },
      verify: ({v, t, dir}, x) => Math.abs(x[0] - (1 + dir * t / 100) ** 2) < 1e-9 && Math.abs(x[1] - v * x[0]) < 1e-9 && Math.abs(x[2] - (x[0] - 1) * 100) < 1e-9,
      build: ({v, t, dir}, o) => {
        const c = F(1 + dir * t / 100, 6), q = F(c * c, 6), end = F(v * q, 6), rate = F((q - 1) * 100, 6);
        return E(o, `Une valeur de ${v} subit deux ${dir > 0 ? 'hausses' : 'baisses'} successives de <strong>${t} %</strong>.`,
          [N('Coefficient global', q), N('Valeur finale', end), N('Taux global, en %', rate)],
          C(`chaque ${dir > 0 ? 'hausse' : 'baisse'} de ${t} % multiplie par ${fr(c)} ; deux évolutions successives multiplient par ${fr(c)}².`,
            [`${fr(c)}² = ${fr(q)} ; ${v} × ${fr(q)} = ${fr(end)} ; (${fr(q)} − 1) × 100 = ${fr(rate)}.`],
            `la valeur finale est ${fr(end)}, soit une évolution globale de ${rate > 0 ? '+' : ''}${pct(rate)} (et non ${dir > 0 ? '+' : M}${2 * t} %).`),
          {title: 'Deux évolutions identiques', ...tasks('Calcule le coefficient global.', 'Détermine la valeur finale.', 'Calcule le taux global en %.')});
      }
    },
    { // 5. Retrouver la valeur de départ
      base: {q: 1.25, v0: 80},
      params: r => ({q: r.pick([1.25, 2, 1.6, 2.5, 0.8, 0.5, 0.4, 0.625]), v0: r.pick([40, 80, 120, 160, 200, 400])}),
      accept: ({q, v0}) => Number.isInteger(F(v0 * q, 6)) && v0 * q <= 1000,
      decimals: 3,
      difficulty: ({q, v0}) => score({steps: 3, values: [v0, v0 * q, q, 1 / q, (1 / q - 1) * 100]}),
      verify: ({q, v0}, v) => Math.abs(v[0] * q - 1) < 1e-9 && Math.abs(v[1] - (v[0] - 1) * 100) < 1e-9 && Math.abs(v[2] - v0 * q * v[0]) < 1e-9,
      build: ({q, v0}, o) => {
        const v1 = F(v0 * q, 6), t = F((q - 1) * 100, 6), rq = F(1 / q, 6), rt = F((rq - 1) * 100, 6);
        return E(o, `Une valeur passe de <strong>${eur(v0)} à ${eur(v1)}</strong>, soit une évolution de ${t > 0 ? '+' : ''}${pct(t)}.`,
          [N('Coefficient multiplicateur réciproque', rq), N('Taux réciproque, en %', rt), N(`Valeur retrouvée à partir de ${v1} €, en €`, v0)],
          C('l’évolution réciproque ramène à la valeur de départ : son coefficient est l’inverse 1/q du coefficient de départ.',
            [`q = ${fr(v1)}/${fr(v0)} = ${fr(q)} ; 1/${fr(q)} = ${fr(rq)}, soit un taux de (${fr(rq)} − 1) × 100 = ${fr(rt)}.`, `${fr(v1)} × ${fr(rq)} = ${fr(v0)}.`],
            `pour revenir de ${eur(v1)} à ${eur(v0)}, il faut une évolution de ${rt > 0 ? '+' : ''}${pct(rt)}, et non de ${t > 0 ? M : '+'}${pct(Math.abs(t))}.`),
          {title: 'Retrouver la valeur de départ', ...tasks('Donne le coefficient multiplicateur réciproque.', 'Calcule le taux réciproque en %.', 'Calcule la valeur obtenue en revenant en arrière.')});
      }
    },
    { // 6. Remonter à un prix initial
      base: {dir: 0, t: 20, P: 80},
      params: r => { const dir = r.int(0, 1); return {dir, t: dir ? r.pick([25, 60, 100, 150]) : r.pick([20, 50, 60]), P: r.pick([40, 60, 80, 100, 120, 160, 200, 240, 400])}; },
      accept: ({dir, t, P}) => Number.isInteger(F(P * (1 + (dir ? t : -t) / 100), 6)) && P * (1 + (dir ? t : -t) / 100) <= 1000,
      decimals: 3,
      difficulty: ({dir, t, P}) => { const q = 1 + (dir ? t : -t) / 100; return score({steps: 3, values: [t, q, P, P * q, (1 / q - 1) * 100]}); },
      verify: ({dir, t, P}, v) => { const q = 1 + (dir ? t : -t) / 100; return Math.abs(v[0] - q) < 1e-9 && Math.abs(v[1] * v[0] - P * q) < 1e-9 && Math.abs(v[2] - (1 / v[0] - 1) * 100) < 1e-9; },
      build: ({dir, t, P}, o) => {
        const q = F(1 + (dir ? t : -t) / 100, 6), after = F(P * q, 6), back = F((1 / q - 1) * 100, 6);
        return E(o, `Après ${dir ? `une hausse de <strong>${t} %</strong>` : `une réduction de <strong>${t} %</strong>`}, un produit coûte <strong>${eur(after)}</strong>.`,
          [N(`Coefficient de ${dir ? 'la hausse' : 'la baisse'}`, q), N('Prix initial, en €', P), N(`${dir ? 'Baisse' : 'Hausse'} réciproque, en %`, back)],
          C('si P est le prix initial, P × q = prix final : on divise le prix final par q pour retrouver P.',
            [`q = 1 ${dir ? '+' : M} ${fr(t / 100)} = ${fr(q)} ; ${fr(q)} × P = ${fr(after)} ⇔ P = ${fr(after)}/${fr(q)} = ${fr(P)}.`, `Pour revenir de ${fr(after)} à ${fr(P)}, on multiplie par 1/${fr(q)} = ${fr(1 / q)}, soit ${fr(back)} %.`],
            `le prix initial était de ${eur(P)} ; l’évolution réciproque est de ${back > 0 ? '+' : ''}${pct(back)}.`),
          {title: 'Remonter à un prix initial', ...tasks('Donne le coefficient de l’évolution.', 'Retrouve le prix initial.', 'Trouve l’évolution réciproque en %.')});
      }
    },
    { // 7. Lire un indice base 100
      base: {y0: 2019, t1: 15, t2: -20},
      params: r => ({y0: r.int(2016, 2022), t1: r.pick([-20, -15, -10, -5, 5, 10, 15, 20, 25, 30]), t2: r.pick([-25, -20, -10, -5, 5, 10, 20, 25])}),
      accept: ({t1, t2}) => places((100 + t1) * (1 + t2 / 100)) <= 2,
      decimals: 2,
      difficulty: ({t1, t2}) => { const i1 = 100 + t1, i2 = i1 * (1 + t2 / 100); return score({steps: 3, values: [100, i1, i2, t1, t2, i2 - i1]}); },
      verify: ({t1, t2}, v) => { const i1 = 100 + t1, i2 = F(i1 * (1 + t2 / 100), 6); return v[0] === i1 - 100 && Math.abs(v[1] - (i2 / i1 - 1) * 100) < 1e-9 && Math.abs(v[2] - (i2 - i1)) < 1e-9; },
      build: ({y0, t1, t2}, o) => {
        const i1 = 100 + t1, i2 = F(i1 * (1 + t2 / 100), 6), dp = F(i2 - i1, 6);
        return E(o, `Un indice est égal à <strong>100 en ${y0}, ${fr(i1)} en ${y0 + 1} et ${fr(i2)} en ${y0 + 2}</strong>.`,
          [N(`${y0} → ${y0 + 1}, en %`, t1), N(`${y0 + 1} → ${y0 + 2}, en %`, t2), N(`Variation de l’indice de ${y0 + 1} à ${y0 + 2}, en points`, dp)],
          C('l’évolution en % entre deux dates se calcule avec (indice d’arrivée/indice de départ − 1) × 100 ; une différence d’indices s’exprime en points, ce n’est pas un pourcentage.',
            [`De 100 à ${fr(i1)} : ${t1 > 0 ? '+' : ''}${pct(t1)}.`, `De ${fr(i1)} à ${fr(i2)} : (${fr(i2)}/${fr(i1)} − 1) × 100 = ${fr(t2)} ; ${fr(i2)} − ${fr(i1)} = ${fr(dp)} points.`],
            `de ${y0 + 1} à ${y0 + 2}, l’indice varie de ${fr(dp)} points, ce qui correspond à une évolution de ${t2 > 0 ? '+' : ''}${pct(t2)}.`),
          tasks(`Calcule l’évolution de ${y0} à ${y0 + 1} en %.`, `Calcule l’évolution de ${y0 + 1} à ${y0 + 2} en %.`, 'Donne la variation de l’indice en points.'));
      }
    },
    { // 8. Points de pourcentage ou pourcentage relatif ?
      base: {a: 30, d: 5, q: 0},
      params: r => ({a: r.int(10, 60), d: r.nonZero(2, 9), q: r.int(0, 1)}),
      decimals: 2,
      difficulty: ({a, d}) => score({steps: 3, values: [a, a + d, d, 100 * d / a]}),
      verify: ({a, d, q}, v) => v[0] === d && Math.abs(v[1] - 100 * d / a) < 0.006 && v[2] === (q ? 'Pourcentage relatif' : 'Points de pourcentage'),
      build: ({a, d, q}, o) => {
        const b = a + d, rel = 100 * d / a;
        return E(o, `Dans une enquête, la proportion passe de <strong>${a} % à ${b} %</strong>.`,
          [N('Écart en points de pourcentage', d), approx2('Variation relative en %, au centième', rel),
           S(q ? `Le résultat de (${b} − ${a})/${a} × 100 s’exprime en` : `L’écart ${b} − ${a} s’exprime en`, q ? 'Pourcentage relatif' : 'Points de pourcentage', ['Points de pourcentage', 'Pourcentage relatif'])],
          C('la différence de deux pourcentages s’exprime en points de pourcentage ; la variation relative rapporte cette différence à la valeur de départ.',
            [`${b} − ${a} = ${fr(d)} points ; (${fr(d)}/${a}) × 100 ${Math.abs(rel * 100 - Math.round(rel * 100)) < 1e-9 ? '=' : '≈'} ${fr(Math.round(rel * 100) / 100)} %.`],
            `la proportion ${d > 0 ? 'gagne' : 'perd'} ${Math.abs(d)} points de pourcentage, ce qui représente une variation relative d’environ ${fr(Math.round(rel * 100) / 100)} %.`),
          {title: 'Points de pourcentage ou % ?', ...tasks('Calcule l’écart en points de pourcentage.', 'Calcule la variation relative en %, au centième.', 'Choisis l’unité qui convient.')});
      }
    }
  ]);

  // Propositions sur les réels : texte, valeur de vérité et justification.
  const PROPS = [
    k => ['Pour tout réel x, x² ≥ 0', true, 'le carré d’un réel est toujours positif ou nul'],
    k => [`Il existe un réel x tel que x² = ${k * k}`, true, `x = ${k} convient`],
    k => [`Pour tout réel x, x² + ${k} > 0`, true, `x² ≥ 0, donc x² + ${k} ≥ ${k} > 0`],
    k => [`Il existe un réel x tel que ${k}x + 1 = 0`, true, `x = ${M}1/${k} convient`],
    k => [`Pour tout réel x, (x − ${k})² ≥ 0`, true, 'un carré est toujours positif ou nul'],
    k => ['Il existe un réel x tel que x² = 0', true, 'x = 0 convient'],
    k => ['Pour tout réel x, x² > 0', false, 'x = 0 est un contre-exemple, car 0² = 0'],
    k => [`Il existe un réel x tel que x² = ${M}${k}`, false, 'un carré ne peut pas être négatif'],
    k => [`Pour tout réel x, (x + ${k})² = x² + ${k * k}`, false, `pour x = 1, (1 + ${k})² = ${(1 + k) ** 2} alors que 1 + ${k * k} = ${1 + k * k}`],
    k => [`Pour tout réel x, x² ≥ ${k}`, false, `x = 0 est un contre-exemple, car 0 < ${k}`],
    k => [`Il existe un réel x tel que x² + ${k} = 0`, false, `x² + ${k} ≥ ${k} > 0 pour tout x`],
    k => [`Pour tout réel x > 0, x > ${k}`, false, `x = 1 est un contre-exemple`]
  ];
  const EXACT = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [1, 8], [3, 8]], ROUND = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 7], [1, 9], [2, 9]];

  register('logique', [
    { // 1. Intersection, union et appartenance
      base: {A: [1, 2, 3], B: [3, 4], t: 2},
      params: r => {
        const A = r.pickDistinct([1, 2, 3, 4, 5, 6, 7, 8, 9], r.int(3, 4)).sort((x, y) => x - y);
        const B = r.pickDistinct([1, 2, 3, 4, 5, 6, 7, 8, 9], r.int(2, 4)).sort((x, y) => x - y);
        const want = r.int(0, 1), pool = want ? B : [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => !B.includes(x));
        return {A, B, t: r.pick(pool)};
      },
      accept: ({A, B}) => A.some(x => B.includes(x)) && JSON.stringify(A) !== JSON.stringify(B),
      difficulty: ({A, B}) => score({steps: 3, values: [A.length, B.length, A.filter(x => B.includes(x)).length, new Set([...A, ...B]).size, ...A, ...B]}),
      verify: ({A, B, t}, v) => v[0] === A.filter(x => B.includes(x)).length && v[0] + v[1] === A.length + B.length && v[2] === (B.includes(t) ? 'Oui' : 'Non'),
      build: ({A, B, t}, o) => {
        const I = A.filter(x => B.includes(x)), U = [...new Set([...A, ...B])].sort((x, y) => x - y), inB = B.includes(t);
        return E(o, `On considère <strong>A = {${A.join(' ; ')}}</strong> et <strong>B = {${B.join(' ; ')}}</strong>.`,
          [N('Card(A ∩ B)', I.length), N('Card(A ∪ B)', U.length), S(`${t} ∈ B ?`, inB ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('A ∩ B contient les éléments communs aux deux ensembles ; A ∪ B contient les éléments de l’un ou de l’autre, comptés une seule fois.',
            [`A ∩ B = {${I.join(' ; ')}} et A ∪ B = {${U.join(' ; ')}}.`, `Contrôle : Card(A ∪ B) = ${A.length} + ${B.length} − ${I.length} = ${U.length}.`],
            `Card(A ∩ B) = ${I.length}, Card(A ∪ B) = ${U.length} ; ${t} ${inB ? 'appartient' : 'n’appartient pas'} à B.`),
          tasks('Compte les éléments communs.', 'Compte les éléments de l’union.', `Indique si ${t} appartient à B.`));
      }
    },
    { // 2. Intervalles : intersection et union
      base: {a: -2, b: 5, c: 3, d: 8, la: 0, lb: 0, t: 3},
      params: r => {
        const a = r.int(-6, 2), b = a + r.int(4, 8), c = r.int(a + 2, b - 2), d = b + r.int(1, 6), want = r.int(0, 1);
        return {a, b, c, d, la: r.int(0, 1), lb: r.int(0, 1), t: want ? r.int(c, b - 1) : r.int(a + 1, c - 1)};
      },
      accept: ({a, b, c}) => c - a >= 2 && b - c >= 2,
      difficulty: ({a, b, c, d}) => score({steps: 3, values: [a, b, c, d]}),
      verify: ({a, b, c, d, la, lb, t}, v) => v[0] === `${lb ? ']' : '['}${fr(c)} ; ${fr(b)}]` && v[1] === `${la ? ']' : '['}${fr(a)} ; ${fr(d)}]` && v[2] === ((lb ? t > c : t >= c) && t <= b ? 'Oui' : 'Non'),
      build: ({a, b, c, d, la, lb, t}, o) => {
        const I = `${la ? ']' : '['}${fr(a)} ; ${fr(b)}]`, J = `${lb ? ']' : '['}${fr(c)} ; ${fr(d)}]`;
        const inter = `${lb ? ']' : '['}${fr(c)} ; ${fr(b)}]`, union = `${la ? ']' : '['}${fr(a)} ; ${fr(d)}]`, both = (lb ? t > c : t >= c) && t <= b;
        return E(o, `On pose <strong>I = ${I}</strong> et <strong>J = ${J}</strong>.`,
          [S('I ∩ J', inter, [`[${fr(c)} ; ${fr(b)}]`, `]${fr(c)} ; ${fr(b)}]`, `[${fr(a)} ; ${fr(d)}]`, `[${fr(a)} ; ${fr(c)}[ ∪ ]${fr(b)} ; ${fr(d)}]`], {shuffle: true}),
           S('I ∪ J', union, [`[${fr(a)} ; ${fr(d)}]`, `]${fr(a)} ; ${fr(d)}]`, `[${fr(c)} ; ${fr(b)}]`, `[${fr(a)} ; ${fr(c)}] ∪ [${fr(b)} ; ${fr(d)}]`], {shuffle: true}),
           S(`${fr(t)} appartient-il à I et à J ?`, both ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('on place les deux intervalles sur une droite graduée : l’intersection est la partie commune, l’union la réunion des deux ; un crochet tourné vers l’extérieur exclut la borne.',
            [`La partie commune va de ${fr(c)} (${lb ? 'exclu' : 'inclus'}, comme dans J) à ${fr(b)} (inclus) ; les intervalles se chevauchent, donc l’union va de ${fr(a)} (${la ? 'exclu' : 'inclus'}) à ${fr(d)}.`],
            `I ∩ J = ${inter} et I ∪ J = ${union} ; ${fr(t)} ${both ? 'appartient aux deux intervalles' : t === c ? 'n’appartient pas à J, dont la borne ' + fr(c) + ' est exclue' : 'n’appartient pas à J'}.`),
          tasks('Choisis I ∩ J.', 'Choisis I ∪ J.', `Indique si ${fr(t)} appartient aux deux intervalles.`));
      }
    },
    { // 3. Produit cartésien
      base: {nA: 2, nB: 3, want: 1, kind: 0},
      params: r => { const want = r.int(0, 1); return {nA: r.int(2, 4), nB: r.int(2, 6), want, kind: want ? 0 : r.int(0, 1)}; },
      space: 45,
      difficulty: ({nA, nB}) => score({steps: 3, values: [nA, nB, nA * nB]}),
      verify: ({nA, nB, want}, v) => v[0] === nA && v[1] === nB && v[2] === v[0] * v[1] && v[3] === (want ? 'Oui' : 'Non'),
      build: ({nA, nB, want, kind}, o) => {
        const A = ['a', 'b', 'c', 'd'].slice(0, nA), B = Array.from({length: nB}, (_, i) => i + 1);
        const couple = want ? `(${A[nA - 1]} ; ${B[1]})` : kind ? `(${B[1]} ; ${A[0]})` : `(${A[0]} ; ${nB + 1})`;
        const why = want ? `${A[nA - 1]} ∈ A et ${B[1]} ∈ B` : kind ? `la première composante doit appartenir à A : l’ordre compte` : `${nB + 1} n’appartient pas à B`;
        return E(o, `Soit <strong>A = {${A.join(' ; ')}}</strong> et <strong>B = {${B.join(' ; ')}}</strong>.`,
          [N('Card(A)', nA), N('Card(B)', nB), N('Card(A × B)', nA * nB), S(`${couple} ∈ A × B ?`, want ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('A × B est l’ensemble des couples (x ; y) avec x dans A et y dans B ; Card(A × B) = Card(A) × Card(B).',
            [`Card(A × B) = ${nA} × ${nB} = ${nA * nB}.`],
            `${couple} ${want ? 'appartient' : 'n’appartient pas'} à A × B, car ${why}.`),
          {title: 'Couples ordonnés', ...tasks('Calcule Card(A) et Card(B).', 'Calcule Card(A × B).', `Indique si le couple ${couple} appartient à A × B.`)});
      }
    },
    { // 4. Vrai ou faux ?
      base: {k: 2, i: 0, j: 6, l: 1},
      params: r => { const [i, j, l] = r.pickDistinct(PROPS.map((_, n) => n), 3); return {k: r.int(2, 9), i, j, l}; },
      space: 1000,
      difficulty: ({k}) => score({steps: 3, values: [k, k * k]}),
      verify: ({k, i, j, l}, v) => [i, j, l].every((n, m) => v[m] === (PROPS[n](k)[1] ? 'Vrai' : 'Faux')),
      build: ({k, i, j, l}, o) => {
        const ps = [i, j, l].map(n => PROPS[n](k));
        return E(o, `On raisonne sur l’ensemble des <strong>nombres réels</strong>. Indique si chaque proposition est vraie ou fausse : <strong>${ps.map(([text]) => text).join(' ; ')}</strong>.`,
          ps.map(([text, truth]) => S(text, truth ? 'Vrai' : 'Faux', ['Vrai', 'Faux'])),
          C('une proposition « pour tout » est fausse dès qu’on trouve un contre-exemple ; une proposition « il existe » est vraie dès qu’on trouve un exemple.',
            ps.map(([text, truth, why]) => `« ${text} » : ${truth ? 'vrai' : 'faux'}, car ${why}.`),
            `les réponses sont : ${ps.map(([, truth]) => (truth ? 'vrai' : 'faux')).join(', ')}.`),
          {title: 'Vrai ou faux ?', ...tasks('Pour chaque proposition, cherche un exemple ou un contre-exemple.')});
      }
    },
    { // 5. Implication et réciproque
      base: {lo: 1, gap: 2, dir: 0},
      params: r => ({lo: r.int(-3, 6), gap: r.int(1, 4), dir: r.int(0, 1)}),
      difficulty: ({lo, gap}) => score({steps: 3, values: [lo, lo + gap, lo + 1]}),
      verify: ({lo, gap, dir}, v) => v[0] === (dir ? 'Fausse' : 'Vraie') && v[1] === (dir ? 'Vraie' : 'Fausse') && v[2] > lo && !(v[2] > lo + gap) && !(v[2] - 1 > lo),
      build: ({lo, gap, dir}, o) => {
        const hi = lo + gap, P = dir ? `x > ${fr(lo)} ⇒ x > ${fr(hi)}` : `x > ${fr(hi)} ⇒ x > ${fr(lo)}`, R = dir ? `x > ${fr(hi)} ⇒ x > ${fr(lo)}` : `x > ${fr(lo)} ⇒ x > ${fr(hi)}`;
        return E(o, `On compare les propositions « x > ${fr(hi)} » et « x > ${fr(lo)} » pour x réel. On étudie l’implication <strong>${P}</strong>.`,
          [S(`L’implication ${P}`, dir ? 'Fausse' : 'Vraie', ['Vraie', 'Fausse']), S(`Sa réciproque ${R}`, dir ? 'Vraie' : 'Fausse', ['Vraie', 'Fausse']),
           N('Plus petit entier qui est un contre-exemple de l’implication fausse', lo + 1)],
          C('une implication « si A alors B » est fausse dès qu’un exemple vérifie A sans vérifier B ; la réciproque échange A et B.',
            [`Si x > ${fr(hi)}, alors x > ${fr(lo)} puisque ${fr(hi)} > ${fr(lo)} : « x > ${fr(hi)} ⇒ x > ${fr(lo)} » est vraie.`,
             `Pour x = ${fr(lo + 1)}, on a x > ${fr(lo)} mais pas x > ${fr(hi)} : « x > ${fr(lo)} ⇒ x > ${fr(hi)} » est fausse. Aucun entier plus petit ne vérifie x > ${fr(lo)}.`],
            `l’implication étudiée est ${dir ? 'fausse' : 'vraie'} et sa réciproque est ${dir ? 'vraie' : 'fausse'} ; le plus petit entier contre-exemple est ${fr(lo + 1)}.`),
          {title: 'Implication et réciproque', ...tasks('Dis si l’implication est vraie.', 'Dis si sa réciproque est vraie.', 'Donne le plus petit entier qui est un contre-exemple de celle qui est fausse.')});
      }
    },
    { // 6. Identité, équation ou valeur approchée
      base: {a: 3, sol: 3, b: 2, k: 1, idq: 0, kind: 1, f: 0},
      params: r => { const kind = r.int(0, 1); return {a: r.int(2, 6), sol: r.nonZero(1, 9), b: r.nonZero(1, 12), k: r.int(1, 6), idq: r.int(0, 1), kind, f: r.int(0, (kind ? ROUND : EXACT).length - 1)}; },
      accept: ({a, sol, b}) => a * sol + b !== 0,
      difficulty: ({a, sol, b, k}) => score({steps: 3, values: [a, b, a * sol + b, sol, k, 2 * k, k * k]}),
      verify: ({a, sol, b, idq, kind}, v) => a * v[0] + b === a * sol + b && v[1] === (idq ? 'Équation avec une seule solution' : 'Identité') && v[2] === (kind ? '≈' : '='),
      build: ({a, sol, b, k, idq, kind, f}, o) => {
        const t = a * sol + b, [p, q] = (kind ? ROUND : EXACT)[f], dec = kind ? fr(Math.round(1000 * p / q) / 1000) : fr(p / q);
        const eq2 = idq ? `(x + ${k})² = x² + ${k * k}` : `(x + ${k})² = x² + ${2 * k}x + ${k * k}`;
        return E(o, `On examine <strong>${affine(a, b)} = ${fr(t)}</strong>, l’égalité <strong>${eq2}</strong> et l’écriture décimale de ${p}/${q}.`,
          [N('Solution de la première égalité', sol), S('La deuxième égalité est', idq ? 'Équation avec une seule solution' : 'Identité', ['Identité', 'Équation avec une seule solution']),
           S(`Signe à écrire entre ${p}/${q} et ${dec}`, kind ? '≈' : '=', ['=', '≈'])],
          C('une identité est vraie pour tout x ; une équation ne l’est que pour certaines valeurs. Une écriture décimale arrondie s’écrit avec ≈.',
            [`${affine(a, b)} = ${fr(t)} ⇔ ${fr(a)}x = ${fr(t - b)} ⇔ x = ${fr(sol)}.`,
             idq ? `(x + ${k})² = x² + ${2 * k}x + ${k * k} ; l’égalité devient ${2 * k}x = 0, vraie seulement pour x = 0.` : `En développant, (x + ${k})² = x² + ${2 * k}x + ${k * k} pour tout x.`,
             kind ? `${p}/${q} = ${fr(p / q, {digits: 5})}… n’a pas d’écriture décimale finie : ${p}/${q} ≈ ${dec}.` : `${p}/${q} = ${dec} exactement.`],
            `la solution est ${fr(sol)} ; la deuxième égalité est ${idq ? 'une équation qui a une seule solution (x = 0)' : 'une identité'} ; on écrit ${p}/${q} ${kind ? '≈' : '='} ${dec}.`),
          {title: 'Identité ou équation ?', ...tasks('Résous la première égalité.', 'Indique la nature de la deuxième égalité.', 'Choisis le signe qui convient.')});
      }
    },
    { // 7. Résoudre une inéquation-produit
      base: {r1: -2, gap: 4, extra: 3, op: 0, t: 3},
      params: r => { const r1 = r.int(-4, 1), gap = r.int(2, 6); return {r1, gap, extra: r.int(1, 3), op: r.int(0, 1), t: r.pick([r1 - 1, r1 + 1, r1 + gap + 1])}; },
      accept: ({r1, gap, t}) => r1 !== 0 && r1 + gap !== 0 && t !== 0 && t !== r1 && t !== r1 + gap,
      difficulty: ({r1, gap, extra, t}) => { const r2 = r1 + gap; return score({steps: 4, values: [r1, r2, r1 * r2, (t - r1) * (t - r2), Math.max(-r1, r2) + extra]}); },
      verify: ({r1, gap, extra, op, t}, v) => {
        const r2 = r1 + gap, L = Math.max(-r1, r2) + extra, P = x => (x - r1) * (x - r2);
        return v[0] === P(0) && v[1] === P(t) && v[2] === (op ? `]${fr(r1)} ; ${fr(r2)}[` : `[${fr(-L)} ; ${fr(r1)}[ ∪ ]${fr(r2)} ; ${L}]`);
      },
      build: ({r1, gap, extra, op, t}, o) => {
        const r2 = r1 + gap, L = Math.max(-r1, r2) + extra, sym = op ? '<' : '>', P = x => (x - r1) * (x - r2);
        const ext = `[${fr(-L)} ; ${fr(r1)}[ ∪ ]${fr(r2)} ; ${L}]`, int = `]${fr(r1)} ; ${fr(r2)}[`, ans = op ? int : ext;
        return E(o, `Sur [${fr(-L)} ; ${L}], on cherche les réels x tels que <strong>${fact(r1)}${fact(r2)} ${sym} 0</strong>.`,
          [N('Pour x = 0', P(0)), N(`Pour x = ${fr(t)}`, P(t)), S('Ensemble des solutions', ans, [ext, int, `[${fr(r1)} ; ${fr(r2)}]`, `[${fr(-L)} ; ${fr(r1)}] ∪ [${fr(r2)} ; ${L}]`], {shuffle: true})],
          C('on cherche les zéros des facteurs, on dresse le tableau de signes sur l’intervalle d’étude, puis on garde les intervalles où le produit a le signe demandé ; l’inégalité stricte exclut les zéros.',
            [`Pour x = 0 : ${pa(-r1)} × ${pa(-r2)} = ${fr(P(0))} ; pour x = ${fr(t)} : ${pa(t - r1)} × ${pa(t - r2)} = ${fr(P(t))}.`],
            `le produit est ${op ? 'strictement négatif entre les zéros' : 'strictement positif à l’extérieur des zéros'} : l’ensemble des solutions est ${ans}.`,
            productSignTable(`Signe de ${fact(r1)}${fact(r2)} sur [${fr(-L)} ; ${L}]`, 1, r1, r2, -L, L)),
          {title: 'Résoudre une inéquation-produit', ...tasks(`Calcule l’expression pour x = 0 et pour x = ${fr(t)}.`, 'Choisis l’ensemble des solutions.')});
      }
    },
    { // 8. Filtrer une liste avec ET et OU
      base: {vals: [8, 10, 11, 14, 20, 21], par: 0, m: 10, M: 20},
      params: r => {
        const s = r.int(1, 20), vals = r.pickDistinct(Array.from({length: 16}, (_, i) => s + i), 6).sort((a, b) => a - b);
        const m = vals[1] + r.int(0, 1), M = vals[4] + r.int(-1, 0);
        return {vals, par: r.int(0, 1), m, M};
      },
      accept: ({vals, par, m, M}) => {
        const ok = x => (x % 2 === 0) === (par === 0), et = vals.filter(x => ok(x) && x >= m && x <= M), ou = vals.filter(x => ok(x) || x > M);
        return m < M && et.length >= 1 && et.length <= 4 && ou.length > et.length && ou.length < 6;
      },
      difficulty: ({vals}) => score({steps: 4, values: vals}),
      verify: ({vals, par, m, M}, v) => {
        const ok = x => (x % 2 === 0) === (par === 0);
        return v[0] === vals.filter(x => ok(x) && x >= m && x <= M).length && v[1] === vals.filter(x => ok(x) || x > M).length && v[2] === Math.max(...vals.filter(x => ok(x) && x >= m && x <= M));
      },
      build: ({vals, par, m, M}, o) => {
        const name = par ? 'impairs' : 'pairs', ok = x => (x % 2 === 0) === (par === 0);
        const et = vals.filter(x => ok(x) && x >= m && x <= M), ou = vals.filter(x => ok(x) || x > M);
        return E(o, `On considère la liste <strong>${vals.join(' ; ')}</strong>.`,
          [N(`Valeurs ${name} ET comprises entre ${m} et ${M} inclus`, et.length), N(`Valeurs ${name} OU strictement supérieures à ${M}`, ou.length), N('Plus grande valeur retenue par le filtre ET', Math.max(...et))],
          C('avec ET, une valeur doit vérifier les deux conditions à la fois ; avec OU, il suffit qu’elle en vérifie au moins une.',
            [`Filtre ET : ${et.join(' ; ')}.`, `Filtre OU : ${ou.join(' ; ')}.`],
            `le filtre ET garde ${et.length} valeur${et.length > 1 ? 's' : ''}, le filtre OU en garde ${ou.length} ; la plus grande valeur du filtre ET est ${Math.max(...et)}.`),
          {title: 'Filtrer une liste avec ET et OU', ...tasks(`Compte les valeurs ${name} ET comprises entre ${m} et ${M} inclus.`, `Compte les valeurs ${name} OU strictement supérieures à ${M}.`, 'Donne la plus grande valeur retenue par le premier filtre.')});
      }
    }
  ]);
})();
