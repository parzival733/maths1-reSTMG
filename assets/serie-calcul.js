/* Série calcul : extrait de assets/variants-reperes.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, productSignTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, times, poly, fact, affine, frac, gcd, pct, eur, MINUS: M} = fmt;
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
            `${fr(h)} h = ${fr(60 * h)} min, ${fr(km)} km = ${fr(1000 * km)} m et ${dir ? `${v} km/h = ${fr(conv)} m/s` : `${v} m/s = ${fr(conv)} km/h`}.`),
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
             `A(x) = ${affine(a, a * p)}${term(s * b, 'x')}${sg(s * b * q)} = ${affine(c, d)} ; A(${fr(x)}) = ${times(c, x, true)}${sg(d)} = ${fr(c * x + d)}.`],
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

})();
