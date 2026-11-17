/* Série suites-arithmetiques : extrait de assets/variants-suites.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt} = V;
  const {num: fr, paren: pa, signed: sg, term, times, pct, eur, MINUS: M} = fmt;
  const sub = k => String(k).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
  const u = (k, name = 'u') => name + sub(k);
  const sup = k => String(k).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const ORDINAL = {3: 'troisième', 4: 'quatrième', 5: 'cinquième', 6: 'sixième', 7: 'septième'};
  const COUNT = {3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six'};
  const places = x => { const t = String(F(x, 9)); return t.includes('.') ? t.split('.')[1].length : 0; };
  // Puissances d'exposant 10 fournies à l'élève (5 décimales).
  const POW10 = {1.05: 1.62889, 1.1: 2.59374, 1.2: 6.19174, 1.3: 13.78585};
  // Puissances fournies pour un rang lointain de 8, 10 ou 12 (5 décimales).
  const POW = {1.05: {8: 1.47746, 10: 1.62889, 12: 1.79586}, 1.1: {8: 2.14359, 10: 2.59374, 12: 3.13843},
    1.2: {8: 4.29982, 10: 6.19174, 12: 8.9161}, 1.3: {8: 8.15731, 10: 13.78585, 12: 23.29809}};
  const round2 = x => Math.round(x * 100 + 1e-9) / 100;
  const tasks = (...list) => ({tasks: list});


  register('suites-arithmetiques', [
    { // 1. Reconnaître une suite et sa raison
      base: {kind: 0, a: 8, r: 5, q: 0},
      params: r => { const kind = r.int(0, 1); return kind ? {kind, a: r.int(1, 5), r: 0, q: r.pick([2, 3])} : {kind, a: r.int(1, 30), r: r.nonZero(2, 9), q: 0}; },
      accept: ({kind, a, r}) => kind === 1 || [0, 1, 2, 3, 4].every(i => a + i * r !== 0),
      difficulty: ({kind, a, r, q}) => {
        const t = kind ? [a, a * q, a * q * q, a * q ** 3, a * q ** 4] : [a, a + r, a + 2 * r, a + 3 * r, a + 4 * r];
        return score({steps: 3, values: [...t, kind ? q : r]});
      },
      verify: ({kind, a, r, q}, v) => (kind ? v[0] === q && v[1] === a * q ** 4 : v[0] === r && v[1] === a + 4 * r) && v[2] === (kind ? 'Géométrique' : 'Arithmétique'),
      build: ({kind, a, r, q}, o) => {
        const t = kind ? [a, a * q, a * q * q, a * q ** 3] : [a, a + r, a + 2 * r, a + 3 * r], next = kind ? a * q ** 4 : a + 4 * r;
        const diffs = t.slice(1).map((x, i) => x - t[i]);
        return E(o, `On observe les termes <strong>${t.map(fr).join(' ; ')}</strong> (rangs 0 à 3).`,
          [N('Raison (r ou q)', kind ? q : r), N('Terme suivant', next), S('Nature', kind ? 'Géométrique' : 'Arithmétique', ['Arithmétique', 'Géométrique', 'Ni l’une ni l’autre'])],
          C('on calcule les différences entre termes consécutifs ; si elles ne sont pas constantes, on calcule les quotients.',
            kind ? [`Différences : ${diffs.map(fr).join(' ; ')} : elles ne sont pas constantes.`, `Quotients : ${t.slice(1).map((x, i) => `${fr(x)}/${fr(t[i])}`).join(' = ')} = ${q}.`]
              : [`Différences : ${t.slice(1).map((x, i) => `${fr(x)} − ${pa(t[i])}`).join(' = ')} = ${fr(r)}.`],
            kind ? `la suite est géométrique de raison ${q} ; le terme suivant est ${fr(t[3])} × ${q} = ${fr(next)}.`
              : `la suite est arithmétique de raison ${fr(r)} ; le terme suivant est ${fr(t[3])}${sg(r)} = ${fr(next)}.`),
          {title: 'Reconnaître une suite et sa raison', ...tasks('Donne la raison.', 'Donne le terme suivant.', 'Identifie la nature de la suite.')});
      }
    },
    { // 2. Raison et sens de variation
      base: {start: 12, r: -3, k1: 1, k2: 4, k3: 6},
      params: r => ({start: r.int(0, 30), r: r.nonZero(2, 6), k1: r.int(1, 3), k2: r.int(4, 6), k3: r.int(7, 9)}),
      coefs: ['r'],
      difficulty: ({start, r, k1, k2, k3}) => score({steps: 4, values: [start, r, start + k1 * r, start + k2 * r, start + k3 * r]}),
      verify: ({start, r, k1, k2, k3}, v) => v[0] === start + k1 * r && v[1] === start + k2 * r && v[2] === start + k3 * r && v[3] === (r > 0 ? 'Croissante' : 'Décroissante'),
      build: ({start, r, k1, k2, k3}, o) => {
        const val = k => start + k * r, line = k => k === 1 ? `${u(1)} = ${fr(val(1))}` : `${u(k)} = ${start}${times(r, k)} = ${fr(val(k))}`;
        return E(o, `La suite vérifie <strong>u₀ = ${start}</strong> et <strong>uₙ₊₁ = uₙ${sg(r)}</strong>.`,
          [N(u(k1), val(k1)), N(u(k2), val(k2)), N(u(k3), val(k3)), S('Variation', r > 0 ? 'Croissante' : 'Décroissante', ['Croissante', 'Décroissante'])],
          C(`la suite est arithmétique de raison ${fr(r)} : uₙ = u₀ + n × r. Le signe de la raison donne le sens de variation.`,
            [`uₙ = ${start}${sg(r)}n, donc ${line(k1)}, ${line(k2)} et ${line(k3)}.`],
            `la raison ${fr(r)} est ${r > 0 ? 'positive' : 'négative'} : la suite est ${r > 0 ? 'croissante' : 'décroissante'}.`),
          {title: 'Raison et sens de variation', ...tasks(`Donne ${u(k1)}, ${u(k2)} et ${u(k3)}.`, 'Détermine son sens de variation.')});
      }
    },
    { // 3. Reconstituer un premier terme
      base: {r: 4, k: 3, u0: 5, q: 10},
      params: r => ({r: r.nonZero(2, 7), k: r.int(2, 5), u0: r.int(-10, 20), q: r.int(8, 12)}),
      accept: ({u0, r, k}) => u0 + k * r !== 0,
      coefs: ['r'],
      difficulty: ({r, k, u0, q}) => score({steps: 2, values: [r, u0 + k * r, u0, u0 + q * r]}),
      verify: ({r, k, u0, q}, v) => v[0] + k * r === u0 + k * r && v[1] === v[0] + q * r,
      build: ({r, k, u0, q}, o) => {
        const uk = u0 + k * r;
        return E(o, `On sait que (uₙ) est arithmétique, de raison <strong>${fr(r)}</strong>, avec <strong>${u(k)} = ${fr(uk)}</strong>.`,
          [N('u₀', u0), N(u(q), u0 + q * r)],
          C(`pour une suite arithmétique, ${u(k)} = u₀ + ${k}r : on « remonte » ${k} rangs pour retrouver u₀, puis on utilise uₙ = u₀ + nr.`,
            [`u₀ = ${u(k)} − ${k} × ${pa(r)} = ${fr(uk)} − ${pa(k * r)} = ${fr(u0)}.`, `${u(q)} = ${fr(u0)} + ${q} × ${pa(r)} = ${fr(u0 + q * r)}.`],
            `u₀ = ${fr(u0)} et ${u(q)} = ${fr(u0 + q * r)}.`),
          tasks('Retrouve u₀.', `Calcule ${u(q)}.`));
      }
    },
    { // 4. Atteindre un seuil
      base: {dir: 1, start: 100, r: 15, m: 7, j: 15},
      params: r => { const rate = r.int(5, 20), dir = r.sign(); return {dir, start: r.int(5, 15) * 10 + (dir < 0 ? 200 : 0), r: rate, m: r.int(5, 9), j: r.int(1, rate)}; },
      accept: ({dir, start, r, m}) => dir > 0 || start - r * m > 0,
      difficulty: ({dir, start, r, m, j}) => score({steps: 3, values: [start, r, start + dir * (r * (m - 1) + j), start + dir * r * (m - 1), m]}),
      verify: ({dir, start, r, m, j}, v) => {
        const target = start + dir * (r * (m - 1) + j), ok = n => (dir > 0 ? start + r * n >= target : start - r * n <= target);
        return v[0] === start + dir * r * (m - 1) && ok(v[1]) && !ok(v[1] - 1);
      },
      build: ({dir, start, r, m, j}, o) => {
        const target = start + dir * (r * (m - 1) + j), sym = dir > 0 ? '≥' : '≤', prev = start + dir * r * (m - 1);
        const q = (target - start) / (dir * r);
        return E(o, `On considère <strong>uₙ = ${start}${sg(dir * r)}n</strong>, pour n ≥ 0.`,
          [N(u(m - 1), prev), N(`Premier rang où uₙ ${sym} ${target}`, m)],
          C('on calcule le terme demandé, puis on résout l’inéquation en isolant n ; on choisit le premier entier qui convient et on contrôle le rang précédent.',
            [`${u(m - 1)} = ${start}${sg(dir * r)} × ${m - 1} = ${prev}.`,
             dir > 0 ? `${start} + ${r}n ≥ ${target} ⇔ ${r}n ≥ ${target - start} ⇔ n ≥ ${target - start}/${r}${Number.isInteger(q) ? ` = ${q}` : ` ≈ ${fr(q, {digits: 2})}`}.`
               : `${start} − ${r}n ≤ ${target} ⇔ ${r}n ≥ ${start - target} ⇔ n ≥ ${start - target}/${r}${Number.isInteger(q) ? ` = ${q}` : ` ≈ ${fr(q, {digits: 2})}`}.`],
            `le premier rang est ${m} : ${u(m - 1)} = ${prev} ne convient pas, alors que ${u(m)} = ${start + dir * r * m} ${sym} ${target}.`),
          {title: 'Atteindre un seuil', ...tasks(`Calcule ${u(m - 1)}.`, `Trouve le premier rang où uₙ ${sym} ${target}.`)});
      }
    },
    { // 5. Somme de cinq termes
      base: {a: 2, r: 3, c: 5},
      params: r => ({a: r.int(-5, 20), r: r.nonZero(2, 7), c: r.int(4, 6)}),
      accept: ({a, r, c}) => Array.from({length: c}, (_, i) => a + i * r).every(x => x !== 0),
      coefs: ['r'],
      difficulty: ({a, r, c}) => score({steps: 3, values: [...Array.from({length: 5}, (_, i) => a + i * r), c * (2 * a + (c - 1) * r) / 2]}),
      verify: ({a, r, c}, v) => v[0] === a && v[1] === a + (c - 1) * r && v[2] === Array.from({length: c}, (_, i) => a + i * r).reduce((s, x) => s + x, 0),
      build: ({a, r, c}, o) => {
        const t = Array.from({length: c}, (_, i) => a + i * r), last = t[c - 1], S = c * (a + last) / 2;
        return E(o, `Une suite arithmétique commence par <strong>${t.map(fr).join(' ; ')}</strong>.`,
          [N('Premier terme', a), N(`${ORDINAL[c][0].toUpperCase()}${ORDINAL[c].slice(1)} terme`, last), N(`Somme des ${COUNT[c]} termes`, S)],
          C('pour une suite arithmétique, la somme de termes consécutifs vaut : nombre de termes × (premier terme + dernier terme)/2.',
            [`S = ${last ? `${c} × (${fr(a)}${sg(last)})/2 = ${c} × ${pa(a + last)}/2` : `${c} × ${pa(a)}/2`} = ${fr(S)}.`, `Contrôle : ${t.map(fr).join(' + ').replace(/\+ −/g, '− ')} = ${fr(S)}.`],
            `la somme des ${COUNT[c]} premiers termes vaut ${fr(S)}.`),
          {title: `Somme de ${COUNT[c]} termes`, ...tasks(`Donne le premier et le ${ORDINAL[c]} terme.`, `Calcule la somme de ces ${COUNT[c]} termes.`)});
      }
    },
    { // 6. Rangs commençant à 1
      base: {u1: 7, r: 2, n: 10},
      params: r => ({u1: r.int(-5, 20), r: r.nonZero(1, 6), n: r.pick([8, 10, 12, 15])}),
      accept: ({u1, r, n}) => u1 !== 0 && u1 + (n - 1) * r !== 0 && Number.isInteger(n * (2 * u1 + (n - 1) * r) / 2),
      coefs: ['r'],
      difficulty: ({u1, r, n}) => score({steps: 2, values: [u1, r, u1 + (n - 1) * r, n * (2 * u1 + (n - 1) * r) / 2]}),
      verify: ({u1, r, n}, v) => v[0] === u1 + (n - 1) * r && v[1] === Array.from({length: n}, (_, i) => u1 + i * r).reduce((a, b) => a + b, 0),
      build: ({u1, r, n}, o) => {
        const un = u1 + (n - 1) * r, sum = n * (u1 + un) / 2;
        return E(o, `Une suite arithmétique a pour premier terme <strong>u₁ = ${fr(u1)}</strong> et pour raison <strong>r = ${fr(r)}</strong>.`,
          [N(u(n), un), N(`Somme u₁ + … + ${u(n)}`, sum)],
          C(`le premier rang est 1 : pour aller de u₁ à ${u(n)}, on ajoute ${n - 1} fois la raison. Il y a ${n} termes à additionner.`,
            [`${u(n)} = u₁ + ${n - 1}r = ${fr(u1)} + ${n - 1} × ${pa(r)} = ${fr(un)}.`, `S = ${n} × (u₁ + ${u(n)})/2 = ${un ? `${n} × (${fr(u1)}${sg(un)})/2` : `${n} × ${pa(u1)}/2`} = ${fr(sum)}.`],
            `${u(n)} = ${fr(un)} et la somme des ${n === 10 ? 'dix' : n} termes vaut ${fr(sum)}.`),
          tasks(`Calcule ${u(n)}.`, `Calcule la somme u₁ + … + ${u(n)}.`));
      }
    },
    { // 7. Arithmétique ou géométrique ?
      base: {which: 0, a: 4, r: 4, b: 3, q: 2},
      params: r => ({which: r.int(0, 1), a: r.int(1, 10), r: r.nonZero(2, 6), b: r.int(1, 5), q: r.pick([2, 3])}),
      accept: ({a, r, b, q}) => b * q ** 3 <= 200 && a + 3 * r !== 0,
      difficulty: ({a, r, b, q}) => score({steps: 3, values: [a, a + r, a + 2 * r, a + 3 * r, b, b * q, b * q * q, b * q ** 3]}),
      verify: ({which, r, q}, v) => v[0] === (which ? 'B' : 'A') && v[1] === r && v[2] === q,
      build: ({which, a, r, b, q}, o) => {
        const ar = [0, 1, 2, 3].map(i => a + i * r), geo = [0, 1, 2, 3].map(i => b * q ** i);
        const A = which ? geo : ar, B = which ? ar : geo, nameA = which ? 'B' : 'A', nameG = which ? 'A' : 'B';
        return E(o, `On te propose les suites A : <strong>${A.map(fr).join(' ; ')}</strong> et B : <strong>${B.map(fr).join(' ; ')}</strong>.`,
          [S('Suite arithmétique', nameA, ['A', 'B', 'Les deux', 'Aucune']), N('Raison de la suite arithmétique', r), N('Coefficient multiplicateur de la suite géométrique', q)],
          C('on calcule les différences successives (constantes pour une suite arithmétique) et les quotients successifs (constants pour une suite géométrique).',
            [`${nameA} : les différences valent toutes ${fr(r)}.`, `${nameG} : les différences ${geo.slice(1).map((x, i) => fr(x - geo[i])).join(' ; ')} ne sont pas constantes, mais chaque terme est le précédent multiplié par ${q}.`],
            `${nameA} est arithmétique de raison ${fr(r)} ; ${nameG} est géométrique de raison ${q}.`),
          tasks('Identifie la suite arithmétique.', 'Donne la raison de cette suite.', 'Donne le coefficient multiplicateur de l’autre suite.'));
      }
    },
    { // 8. Prévoir une baisse régulière
      base: {ctx: 0, start: 300, r: 7, n: 12, m: 10},
      params: r => ({ctx: r.int(0, 2), start: r.int(15, 40) * 10, r: r.int(3, 12), n: r.int(10, 15), m: r.int(6, 10)}),
      accept: ({start, r, n, m}) => start - n * r > 0 && n !== m + 1,
      limit: 2000,
      difficulty: ({start, r, n, m}) => score({steps: 4, values: [start, r, start - n * r, start - m * r, 5 * start - 10 * r]}),
      verify: ({start, r, n, m}, v) => {
        const lim = start - m * r, un = k => start - r * k;
        return v[0] === un(n) && un(v[1]) < lim && un(v[1] - 1) >= lim && v[2] === [0, 1, 2, 3, 4].reduce((s, k) => s + un(k), 0);
      },
      build: ({ctx, start, r, n, m}, o) => {
        const lim = start - m * r, sum = 5 * start - 10 * r;
        const c = [
          {intro: `Une entreprise a <strong>${start} clients</strong> au rang 0 puis en perd <strong>${r} par mois</strong>`, unit: 'clients', per: 'mois'},
          {intro: `Une cuve contient <strong>${start} litres</strong> d’eau au rang 0 et perd <strong>${r} litres par jour</strong>`, unit: 'litres', per: 'jours'},
          {intro: `Un stock compte <strong>${start} cahiers</strong> au rang 0 et diminue de <strong>${r} cahiers par semaine</strong>`, unit: 'cahiers', per: 'semaines'}
        ][ctx];
        return E(o, `${c.intro} : uₙ = ${start} − ${r}n.`,
          [N(u(n), start - n * r), N(`Premier rang avec strictement moins de ${lim} ${c.unit}`, m + 1), N('Somme u₀ + u₁ + u₂ + u₃ + u₄', sum)],
          C(`la suite est arithmétique de premier terme ${start} et de raison ${M}${r}. Pour le seuil strict, on cherche le rang où l’égalité a lieu, puis le rang suivant.`,
            [`${u(n)} = ${start} − ${r} × ${n} = ${start - n * r}.`,
             `${start} − ${r}n = ${lim} ⇔ n = ${m} : au rang ${m}, il reste exactement ${lim} ${c.unit} ; au rang ${m + 1}, il en reste ${start - (m + 1) * r}.`,
             `Somme : ${[0, 1, 2, 3, 4].map(k => start - k * r).join(' + ')} = ${fr(sum)}, ou 5 × (${start} + ${start - 4 * r})/2 = ${fr(sum)}.`],
            `au rang ${n}, il reste ${start - n * r} ${c.unit} ; on passe strictement sous ${lim} ${c.unit} au rang ${m + 1}, soit après ${m + 1} ${c.per} ; la somme demandée vaut ${fr(sum)}.`),
          {title: 'Prévoir une baisse régulière', ...tasks(`Calcule ${u(n)}.`, `Trouve le premier rang avec strictement moins de ${lim} ${c.unit}.`, 'Calcule u₀ + u₁ + u₂ + u₃ + u₄.')});
      }
    }
  ]);

  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, {frame} = V;
  /* Points (n ; uₙ) d'une suite arithmétique de premier terme a et de raison r, du rang 0 au rang N. */
  const pointsFig = (titre, a, r, N) => ({c: FG.repere(titre, frame([N + 0.6], [a, a + r * N], {nom_x: 'n', nom_y: 'uₙ'})).suite_points(`(${a})+(${r})*n`, 0, N).description()});
  /* Deux croissances sur le même repère : ajout constant (ronds) et multiplication constante (croix). */
  const comparerFig = (a, q, r, R, noms) => { const g = Array.from({length: R + 1}, (_, n) => [n, a * q ** n]);
    return {c: FG.repere(`Les deux suites du rang 0 au rang ${R} : ajout constant en ronds, multiplication constante en croix`, frame([R + 0.6], [a + r * R, a * q ** R], {nom_x: 'n', nom_y: 'valeur'}))
      .suite_points(`(${a})+(${r})*n`, 0, R).nuage(g, {forme: 'croix'}).legende([{forme: 'rond', texte: noms[0]}, {forme: 'croix', texte: noms[1]}]).description()}; };
  V.illustrate('suites-arithmetiques', [null, null, null, null, null, null, null,
    ({start, r, n}) => pointsFig(`Points (n ; uₙ) du rang 0 au rang ${n + 1} : alignés, on descend de ${r} à chaque rang`, start, -r, n + 1)
  ]);
})();
