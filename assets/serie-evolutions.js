/* Série evolutions : extrait de assets/variants-reperes.js par tools/build_series.py.
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

})();
