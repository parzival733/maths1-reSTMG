/* Suites, suites arithmétiques et suites géométriques : modèles déclaratifs.
   Les puissances d'exposant 10 sont données dans l'énoncé : la Première se
   travaille sans calculatrice. */
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

  register('suites', [
    { // 1. Lire des termes avec une formule explicite
      base: {a: 5, r: 3, n1: 2, n2: 5},
      params: r => ({a: r.nonZero(1, 12), r: r.nonZero(2, 9), n1: r.int(2, 4), n2: r.int(5, 8)}),
      coefs: ['r'],
      difficulty: ({a, r, n1, n2}) => score({steps: 3, values: [a, r, a + r * n1, a + r * n2]}),
      verify: ({a, r, n1, n2}, v) => v[0] === a && v[1] - v[0] === r * n1 && v[2] - v[0] === r * n2,
      build: ({a, r, n1, n2}, o) => E(o, `La suite (uₙ) est définie pour n ≥ 0 par <strong>uₙ = ${fr(a)}${term(r, 'n')}</strong>.`,
        [N('u₀', a), N(u(n1), a + r * n1), N(u(n2), a + r * n2)],
        C('on remplace n par le rang demandé dans la formule explicite, en effectuant la multiplication avant l’addition.',
          [`u₀ = ${fr(a)} ; ${u(n1)} = ${fr(a)}${sg(r)} × ${n1} = ${fr(a + r * n1)} ; ${u(n2)} = ${fr(a)}${sg(r)} × ${n2} = ${fr(a + r * n2)}.`],
          `u₀ = ${fr(a)}, ${u(n1)} = ${fr(a + r * n1)} et ${u(n2)} = ${fr(a + r * n2)}.`),
        tasks(`Calcule les termes de rangs 0, ${n1} et ${n2}.`))
    },
    { // 2. Calculer par récurrence
      base: {start: 4, r: 2, k2: 3, k3: 6},
      params: r => ({start: r.int(-5, 15), r: r.nonZero(1, 6), k2: r.int(2, 4), k3: r.int(5, 7)}),
      coefs: ['r'],
      difficulty: ({start, r, k2, k3}) => score({steps: 3, values: [start, r, start + r, start + r * k2, start + r * k3]}),
      verify: ({start, r, k2, k3}, v) => v[0] - start === r && v[1] - start === k2 * r && v[2] - start === k3 * r,
      build: ({start, r, k2, k3}, o) => {
        const terms = Array.from({length: k3 + 1}, (_, i) => start + i * r);
        return E(o, `On donne <strong>u₀ = ${fr(start)}</strong> et <strong>uₙ₊₁ = uₙ${sg(r)}</strong>.`,
          [N('u₁', start + r), N(u(k2), start + k2 * r), N(u(k3), start + k3 * r)],
          C(`chaque terme s’obtient en ${r > 0 ? 'ajoutant' : 'retranchant'} ${fr(Math.abs(r))} au précédent : la suite est arithmétique de raison ${fr(r)}, donc uₙ = u₀ + n × ${pa(r)}.`,
            [`Termes successifs : ${terms.map(fr).join(' ; ')}.`, `Par exemple ${u(k3)} = ${fr(start)} + ${k3} × ${pa(r)} = ${fr(start + k3 * r)}.`],
            `u₁ = ${fr(start + r)}, ${u(k2)} = ${fr(start + k2 * r)} et ${u(k3)} = ${fr(start + k3 * r)}.`),
          tasks(`Trouve u₁, ${u(k2)} et ${u(k3)}.`));
      }
    },
    { // 3. Identifier un modèle : ajout ou multiplication constants
      base: {kind: 0, a: 100, q: 0.9, d: 0, k: 0},
      params: r => { const kind = r.int(0, 1); return {kind, a: r.pick([20, 40, 50, 60, 80, 100, 200]), q: kind ? 0 : r.pick([0.5, 0.8, 0.9, 1.1, 1.2, 1.5, 2]), d: kind ? r.nonZero(2, 15) : 0, k: r.int(0, 2)}; },
      accept: ({kind, a, q, k}) => kind === 1 || (places(a * q ** (k + 2)) <= 2 && a * q ** (k + 2) <= 1000 && (k === 0 || places(a * q ** k) <= 2)),
      difficulty: ({kind, a, q, d, k}) => score({steps: 4, values: kind ? [a, d, a + k * d, a + (k + 2) * d] : [a, q, a * q ** k, a * q ** (k + 2)]}),
      verify: ({kind, a, q, d, k}, v) => { const at = i => kind ? a + i * d : a * q ** i; return [0, 1, 2].every(i => Math.abs(v[i] - at(k + i)) < 1e-9) && v[3] === (kind ? 'Arithmétique' : 'Géométrique'); },
      build: ({kind, a, q, d, k}, o) => {
        const at = i => F(kind ? a + i * d : a * q ** i, 6), ranks = [k, k + 1, k + 2];
        const line = i => kind ? (i === 0 ? `v₀ = ${fr(a)}` : `${u(i, 'v')} = ${fr(a)}${i === 1 ? sg(d) : `${sg(d)} × ${i}`} = ${fr(at(i))}`)
          : i === 0 ? `v₀ = ${fr(a)} × ${fr(q)}⁰ = ${fr(a)}` : i === 1 ? `v₁ = ${fr(a)} × ${fr(q)} = ${fr(at(1))}`
          : `${u(i, 'v')} = ${fr(a)} × ${fr(q)}${sup(i)} = ${fr(a)} × ${fr(F(q ** i, 6))} = ${fr(at(i))}`;
        return E(o, `Une suite est définie par <strong>vₙ = ${kind ? fr(a) + term(d, 'n') : fr(a) + ' × ' + fr(q) + 'ⁿ'}</strong>.`,
          [...ranks.map(i => N(u(i, 'v'), at(i))), S('Modèle', kind ? 'Arithmétique' : 'Géométrique', ['Arithmétique', 'Géométrique', 'Constante'])],
          C(`on calcule les ${k ? 'termes demandés' : 'premiers termes'} avec la formule, puis on regarde comment on passe d’un terme au suivant : ajout d’un même nombre (arithmétique) ou multiplication par un même nombre (géométrique).`,
            [ranks.map(line).join(' ; ') + '.'],
            kind ? `on ajoute ${fr(d)} à chaque rang : la suite est arithmétique de raison ${fr(d)}.` : `on multiplie chaque terme par ${fr(q)} : la suite est géométrique de raison ${fr(q)}.`),
          {title: 'Identifier un modèle de suite', ...tasks(`Calcule ${ranks.map(i => u(i, 'v')).join(', ').replace(/, ([^,]*)$/, ' et $1')}.`, 'Identifie le type d’évolution.')});
      }
    },
    { // 4. Interpréter le sens de variation d'une suite récurrente
      base: {start: 20, r: -3, j: 0},
      params: r => ({start: r.int(5, 30), r: r.nonZero(1, 6), j: r.int(0, 4)}),
      coefs: ['r'],
      difficulty: ({start, r}) => score({steps: 4, values: [start, r, start + 3 * r]}),
      verify: ({start, r}, v) => v[0] - start === r && v[1] - v[0] === r && v[2] - v[1] === r && v[3] === (r > 0 ? 'Croissante' : 'Décroissante'),
      build: ({start, r, j}, o) => {
        const w = i => u(j + i, 'w');
        return E(o, `On donne <strong>${w(0)} = ${start}</strong> et <strong>wₙ₊₁ = wₙ${sg(r)}</strong>.`,
          [N(w(1), start + r), N(w(2), start + 2 * r), N(w(3), start + 3 * r), S('Variation', r > 0 ? 'Croissante' : 'Décroissante', ['Croissante', 'Décroissante', 'Constante'])],
          C('on applique la relation de récurrence rang après rang ; le signe de wₙ₊₁ − wₙ donne le sens de variation.',
            [`${start} → ${fr(start + r)} → ${fr(start + 2 * r)} → ${fr(start + 3 * r)}.`, `Pour tout n, wₙ₊₁ − wₙ = ${fr(r)}, qui est ${r > 0 ? 'positif' : 'négatif'}.`],
            `${w(1)} = ${fr(start + r)}, ${w(2)} = ${fr(start + 2 * r)}, ${w(3)} = ${fr(start + 3 * r)} ; la suite est strictement ${r > 0 ? 'croissante' : 'décroissante'}.`),
          {title: 'Interpréter le sens de variation', ...tasks(`Calcule les termes de rangs ${j + 1}, ${j + 2} et ${j + 3}.`, 'Indique le sens de variation.')});
      }
    },
    { // 5. Comparer des écarts
      base: {a: 2, b: 1, k: 1},
      params: r => ({a: r.nonZero(1, 4), b: r.nonZero(1, 9), k: r.int(0, 3)}),
      coefs: ['a', 'b'],
      difficulty: ({a, b, k}) => score({steps: 5, values: [a, b, a * k * k + b, a * (k + 1) ** 2 + b, a * (k + 2) ** 2 + b, a * (2 * k + 1), a * (2 * k + 3)]}),
      verify: ({a, b, k}, v) => [0, 1, 2].every(i => v[i] === a * (k + i) ** 2 + b) && v[3] === v[1] - v[0] && v[4] === v[2] - v[1] && v[3] !== v[4],
      build: ({a, b, k}, o) => {
        const val = n => a * n * n + b, r = [k, k + 1, k + 2];
        return E(o, `On considère <strong>uₙ = ${term(a, 'n²', true)}${term(b)}</strong>.`,
          [...r.map(n => N(u(n), val(n))), N(`Premier écart ${u(k + 1)} − ${u(k)}`, val(k + 1) - val(k)), N(`Deuxième écart ${u(k + 2)} − ${u(k + 1)}`, val(k + 2) - val(k + 1))],
          C('on calcule les termes en remplaçant n, puis les différences entre termes consécutifs : une suite arithmétique a des écarts constants.',
            [r.map(n => n ? `${u(n)} = ${times(a, n * n, true)}${sg(b)} = ${fr(val(n))}` : `${u(0)} = ${fr(b)}`).join(' ; ') + '.',
             `${u(k + 1)} − ${u(k)} = ${fr(val(k + 1) - val(k))} et ${u(k + 2)} − ${u(k + 1)} = ${fr(val(k + 2) - val(k + 1))}.`],
            `les écarts ${fr(val(k + 1) - val(k))} et ${fr(val(k + 2) - val(k + 1))} ne sont pas égaux : la suite n’est pas arithmétique.`),
          tasks(`Calcule ${u(k)}, ${u(k + 1)} et ${u(k + 2)}.`, `Calcule les écarts ${u(k + 1)} − ${u(k)} et ${u(k + 2)} − ${u(k + 1)}.`));
      }
    },
    { // 6. Suivre une quantité qui augmente régulièrement
      base: {ctx: 0, start: 50, r: 12, k: 4, m: 5, j: 0},
      params: r => { const rate = r.int(5, 20); return {ctx: r.int(0, 2), start: r.int(20, 80), r: rate, k: r.int(3, 6), m: r.int(4, 9), j: r.int(0, rate - 1)}; },
      accept: ({k, m}) => k !== m,
      difficulty: ({start, r, k, m, j}) => score({steps: 4, values: [start, r, start + r * k, start + r * m - j, m]}),
      verify: ({start, r, k, m, j}, v) => {
        const target = start + r * m - j;
        return v[0] === r && v[1] === start + r * k && start + r * v[2] >= target && start + r * (v[2] - 1) < target;
      },
      build: ({ctx, start, r, k, m, j}, o) => {
        const target = start + r * m - j;
        const c = [
          {intro: `Un magasin dispose de <strong>${start} articles</strong> au départ et en reçoit <strong>${r} de plus chaque semaine</strong>. Le rang n désigne le nombre de semaines écoulées.`, unit: 'articles', per: 'semaines'},
          {intro: `Un club compte <strong>${start} adhérents</strong> et en gagne <strong>${r} chaque mois</strong>. Le rang n désigne le nombre de mois écoulés.`, unit: 'adhérents', per: 'mois'},
          {intro: `Une tirelire contient <strong>${eur(start)}</strong> et on y dépose <strong>${eur(r)} chaque mois</strong>. Le rang n désigne le nombre de mois écoulés.`, unit: '€', per: 'mois'}
        ][ctx];
        const quotient = (target - start) / r;
        return E(o, c.intro,
          [N('Raison r', r), N(`Valeur au rang ${k}`, start + r * k), N(`Premier rang avec au moins ${target} ${c.unit}`, m)],
          C(`la quantité augmente de ${r} ${c.unit} à chaque rang : c’est une suite arithmétique de premier terme u₀ = ${start} et de raison ${r}, donc uₙ = ${start} + ${r}n. On résout ensuite une inéquation.`,
            [`${u(k)} = ${start}${times(r, k)} = ${start + r * k}.`,
             `${start} + ${r}n ≥ ${target} ⇔ ${r}n ≥ ${target - start} ⇔ n ≥ ${target - start}/${r}${Number.isInteger(quotient) ? ` = ${quotient}` : ` ≈ ${fr(quotient, {digits: 2})}`}. Vérification : ${u(m - 1)} = ${start + r * (m - 1)} < ${target} et ${u(m)} = ${start + r * m} ≥ ${target}.`],
            `il y a ${start + r * k} ${c.unit} au rang ${k}, et on atteint au moins ${target} ${c.unit} à partir du rang ${m}, c’est-à-dire après ${m} ${c.per}.`),
          tasks(`Complète uₙ = ${start} + r × n.`, `Calcule la valeur au rang ${k}.`, `Trouve le premier rang avec au moins ${target} ${c.unit}.`));
      }
    },
    { // 7. Représenter une suite par des points
      base: {a: 5, b: 2, q: 0, s: 0},
      params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 9), q: r.int(0, 1), s: r.int(0, 4)}),
      coefs: ['a', 'b'],
      difficulty: ({a, b, s}) => { const n = [[0, 2, 4], [1, 3, 5], [0, 3, 6], [2, 4, 6], [1, 2, 3]][s]; return score({steps: 3, values: [a, b, ...n.map(k => a * k + b)]}); },
      verify: ({a, b, q, s}, v) => { const n = [[0, 2, 4], [1, 3, 5], [0, 3, 6], [2, 4, 6], [1, 2, 3]][s]; return n.every((k, i) => v[i] === a * k + b) && v[3] === (q ? 'Non' : 'Oui'); },
      build: ({a, b, q, s}, o) => {
        const n = [[0, 2, 4], [1, 3, 5], [0, 3, 6], [2, 4, 6], [1, 2, 3]][s], val = k => a * k + b;
        const line = k => k ? `${u(k)} = ${times(a, k, true)}${sg(b)} = ${fr(val(k))}` : `${u(0)} = ${fr(b)}`;
        return E(o, `Pour <strong>uₙ = ${term(a, 'n', true)}${term(b)}</strong>, on place les points de coordonnées (n ; uₙ).`,
          [...n.map(k => N(`À n = ${k}`, val(k))),
           S(q ? 'Relie-t-on ces points par une courbe continue ?' : 'Représente-t-on la suite par des points isolés ?', q ? 'Non' : 'Oui', ['Oui', 'Non'])],
          C('une suite n’est définie que pour des rangs entiers : chaque rang n donne un point (n ; uₙ), sans tracer de courbe entre eux.',
            [n.map(line).join(', ').replace(/, ([^,]*)$/, ' et $1') + '.'],
            `les points sont ${n.map(k => `(${k} ; ${fr(val(k))})`).join(', ').replace(/, ([^,]*)$/, ' et $1')}. On représente la suite par des points isolés, que l’on ne relie pas par une courbe continue.`),
          tasks(`Donne les ordonnées des points de rangs ${n[0]}, ${n[1]} et ${n[2]}.`, 'Explique comment on représente une suite.'));
      }
    },
    { // 8. Comparer une croissance par ajout et par multiplication
      base: {a: 10, q: 1.2, want: 0, r: 5, s: 2, R: 10},
      params: r => {
        const a = r.pick([10, 20, 50]), q = r.pick([1.1, 1.2, 1.3]), R = r.pick([8, 10, 12]), T = (a * q ** R - a) / R;
        return {a, q, want: r.int(0, 1), r: r.int(1, Math.max(2, Math.ceil(2 * T))), s: r.int(2, 3), R};
      },
      accept: ({a, q, want, r, s, R}) => {
        const vR = a * q ** R, uR = a + R * r;
        return Math.abs(uR - vR) >= 1 && (uR > vR) === (want === 1) && vR <= 1000 && round2(a * POW[q][R]) === round2(vR) && places(a * q ** s) <= 2;
      },
      decimals: 2,
      difficulty: ({a, q, r, s, R}) => score({steps: 5, values: [a, r, a + s * r, a * q ** s, a + R * r, a * q ** R]}),
      verify: ({a, q, r, s, R}, v) => v[0] === a + s * r && Math.abs(v[1] - a * q ** s) < 1e-9 && v[2] === a + R * r
        && Math.abs(v[3] - a * q ** R) < 0.005 && v[4] === (v[2] > v[3] ? 'uₙ' : 'vₙ'),
      build: ({a, q, r, s, R}, o) => {
        const vR = a * q ** R, uR = a + R * r, uBig = uR > vR, vs = F(a * q ** s, 6);
        return E(o, `Deux suites modélisent une croissance : <strong>uₙ = ${a} + ${r}n</strong> et <strong>vₙ = ${a} × ${fr(q)}ⁿ</strong>. On donne ${fr(q)}${sup(R)} ≈ ${fr(POW[q][R])}.`,
          [N(u(s), a + s * r), N(u(s, 'v'), vs), N(u(R), uR), N(`${u(R, 'v')} (au centième)`, round2(vR), 0.0049), S(`Au rang ${R}, la plus grande est`, uBig ? 'uₙ' : 'vₙ', ['uₙ', 'vₙ'])],
          C('pour uₙ, on ajoute la même quantité à chaque rang (formule affine) ; pour vₙ, on multiplie par le même coefficient (puissance de ' + fr(q) + ').',
            [`${u(s)} = ${a}${times(r, s)} = ${a + s * r} et ${u(s, 'v')} = ${a} × ${fr(q)}${sup(s)} = ${a} × ${fr(F(q ** s, 6))} = ${fr(vs)}.`,
             `${u(R)} = ${a}${times(r, R)} = ${uR} et ${u(R, 'v')} = ${a} × ${fr(q)}${sup(R)} ≈ ${a} × ${fr(POW[q][R])} ≈ ${fr(round2(vR))}.`],
            uBig ? `au rang ${R}, uₙ est encore la plus grande : ${uR} > ${fr(round2(vR))}.`
              : `au rang ${R}, la suite géométrique a dépassé l’autre : ${fr(round2(vR))} > ${uR}.`),
          tasks(`Calcule ${u(s)} et ${u(s, 'v')}.`, `Calcule ${u(R)} et ${u(R, 'v')} (au centième).`, `Indique quel modèle est le plus grand au rang ${R}.`));
      }
    }
  ]);

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
          tasks(`Donne le premier et le ${ORDINAL[c]} terme.`, `Calcule la somme de ces ${COUNT[c]} termes.`));
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

  register('suites-geometriques', [
    { // 1. Reconnaître une raison et un taux
      base: {a: 200, q: 1.05},
      params: r => ({a: r.pick([100, 200, 300, 400, 500, 600, 800, 1000]), q: r.pick([0.5, 0.6, 0.8, 0.9, 0.95, 1.05, 1.1, 1.2, 1.25, 1.5])}),
      accept: ({a, q}) => a * q ** 3 <= 1000 && places(a * q ** 3) <= 3,
      decimals: 3,
      difficulty: ({a, q}) => score({steps: 3, values: [a, a * q, a * q * q, a * q ** 3, q, (q - 1) * 100]}),
      verify: ({a, q}, v) => Math.abs(v[0] * a - a * q) < 1e-9 && Math.abs(v[1] - (q - 1) * 100) < 1e-9 && Math.abs(v[2] - a * q ** 3) < 1e-9,
      build: ({a, q}, o) => {
        const t = [a, a * q, a * q * q], next = a * q ** 3, rate = (q - 1) * 100;
        return E(o, `Une suite géométrique commence par <strong>${t.map(x => fr(x)).join(' ; ')}</strong>.`,
          [N('Raison q', q), N('Taux d’évolution en %', F(rate, 6)), N('Terme suivant', F(next, 6))],
          C('la raison est le quotient de deux termes consécutifs ; le taux correspondant vaut (q − 1) × 100 % ; le terme suivant s’obtient en multipliant par q.',
            [`${fr(t[1])}/${fr(t[0])} = ${fr(q)} et ${fr(t[2])}/${fr(t[1])} = ${fr(q)} : le quotient est constant.`, `(${fr(q)} − 1) × 100 = ${fr(rate)} ; ${fr(t[2])} × ${fr(q)} = ${fr(next)}.`],
            `q = ${fr(q)}, ce qui correspond à ${rate > 0 ? 'une hausse' : 'une baisse'} de ${pct(Math.abs(rate))} par rang ; le terme suivant vaut ${fr(next)}.`),
          tasks('Trouve la raison q.', 'Donne le taux d’évolution correspondant.', 'Calcule le terme suivant.'));
      }
    },
    { // 2. Une évolution répétée
      base: {u0: 500, q: 0.8, j: 0},
      params: r => ({u0: r.pick([100, 200, 250, 300, 400, 500, 600, 800, 1000]), q: r.pick([0.5, 0.6, 0.8, 0.9, 1.1, 1.2, 1.5]), j: r.int(0, 4)}),
      accept: ({u0, q}) => u0 * q ** 3 <= 1000 && places(u0 * q ** 3) <= 3,
      decimals: 3,
      difficulty: ({u0, q}) => score({steps: 4, values: [u0, u0 * q, u0 * q * q, u0 * q ** 3, q, (q - 1) * 100]}),
      verify: ({u0, q}, v) => Math.abs(v[0] - u0 * q) < 1e-9 && Math.abs(v[1] - v[0] * q) < 1e-9 && Math.abs(v[2] - v[1] * q) < 1e-9 && Math.abs(v[3] - (q - 1) * 100) < 1e-9,
      build: ({u0, q, j}, o) => {
        const t = [u0, u0 * q, u0 * q * q, u0 * q ** 3], rate = (q - 1) * 100, w = i => u(j + i);
        return E(o, `On donne <strong>${w(0)} = ${fr(u0)}</strong> et <strong>uₙ₊₁ = ${fr(q)}uₙ</strong>.`,
          [N(w(1), F(t[1], 6)), N(w(2), F(t[2], 6)), N(w(3), F(t[3], 6)), N('Taux d’évolution par période, en %', F(rate, 6))],
          C('on multiplie chaque terme par le même coefficient q ; un coefficient q correspond à un taux de (q − 1) × 100 %.',
            [`${t.map(x => fr(x)).join(' → ')} (multiplication par ${fr(q)} à chaque étape).`, `(${fr(q)} − 1) × 100 = ${fr(rate)}.`],
            `${w(1)} = ${fr(t[1])}, ${w(2)} = ${fr(t[2])}, ${w(3)} = ${fr(t[3])} ; le coefficient ${fr(q)} correspond à ${rate > 0 ? 'une hausse' : 'une baisse'} de ${pct(Math.abs(rate))} par période.`),
          {title: 'Une évolution répétée', ...tasks(`Calcule ${w(1)}, ${w(2)} et ${w(3)}.`, 'Donne le taux d’évolution à chaque étape.')});
      }
    },
    { // 3. Utiliser la formule explicite
      base: {v0: 80, q: 1.1, k: 0},
      params: r => ({v0: r.pick([20, 40, 50, 60, 80, 100, 120, 200]), q: r.pick([0.8, 0.9, 1.05, 1.1, 1.2, 1.5]), k: r.int(0, 1)}),
      accept: ({v0, q, k}) => places(v0 * q ** (k + 2)) <= 2 && places(v0 * q ** k) <= 2,
      difficulty: ({v0, q, k}) => score({steps: 3, values: [v0, v0 * q ** k, v0 * q ** (k + 2), (q - 1) * 100]}),
      verify: ({v0, q, k}, v) => [0, 1, 2].every(i => Math.abs(v[i] - v0 * q ** (k + i)) < 1e-9) && Math.abs(v[3] - (q - 1) * 100) < 1e-9,
      build: ({v0, q, k}, o) => {
        const rate = (q - 1) * 100, at = i => F(v0 * q ** i, 6), r = [k, k + 1, k + 2];
        return E(o, `La suite est définie par <strong>vₙ = ${fr(v0)} × ${fr(q)}ⁿ</strong>.`,
          [...r.map(i => N(u(i, 'v'), at(i))), N('Évolution par rang, en %', F(rate, 6))],
          C(`on remplace n par ${r[0]}, ${r[1]} et ${r[2]} dans vₙ = v₀ × qⁿ (avec q⁰ = 1) ; le coefficient q correspond à un taux de (q − 1) × 100 %.`,
            [r.map(i => i === 0 ? `v₀ = ${fr(v0)}` : `${u(i, 'v')} = ${fr(v0)} × ${fr(q)}${i > 1 ? sup(i) : ''}${i > 1 ? ` = ${fr(v0)} × ${fr(F(q ** i, 6))}` : ''} = ${fr(at(i))}`).join(' ; ') + '.'],
            `le coefficient ${fr(q)} correspond à ${rate > 0 ? 'une hausse' : 'une baisse'} de ${pct(Math.abs(rate))} à chaque rang.`),
          tasks(`Calcule ${r.map(i => u(i, 'v')).join(', ').replace(/, ([^,]*)$/, ' et $1')}.`, 'Détermine le pourcentage d’évolution par rang.'));
      }
    },
    { // 4. Prévoir une croissance en pourcentage
      base: {ctx: 0, c: 120, t: 15, j: 0},
      params: r => ({ctx: r.int(0, 2), c: r.pick([100, 120, 200, 250, 400, 500]), t: r.pick([2, 4, 5, 10, 15, 20]), j: r.int(0, 3)}),
      accept: ({c, t}) => places(c * (1 + t / 100) ** 3) <= 3 && c * (1 + t / 100) ** 3 <= 1000,
      decimals: 3,
      difficulty: ({c, t}) => { const q = 1 + t / 100; return score({steps: 4, values: [c, c * q, c * q * q, c * q ** 3, q]}); },
      verify: ({c, t}, v) => { const q = 1 + t / 100; return Math.abs(v[0] - c * q) < 1e-9 && Math.abs(v[1] - c * q * q) < 1e-9 && Math.abs(v[2] - c * q ** 3) < 1e-9 && Math.abs(v[3] - q) < 1e-9; },
      build: ({ctx, c, t, j}, o) => {
        const q = 1 + t / 100, x = [c * q, c * q * q, c * q ** 3], w = i => u(j + i);
        const later = [`Un capital vaut <strong>${eur(c)}</strong> au bout de ${j} an${j > 1 ? 's' : ''} et augmente ensuite de <strong>${t} % par an</strong>. On note uₙ le capital, en euros, après n années : ${w(0)} = ${fr(c)}.`,
          `Au bout de ${j} an${j > 1 ? 's' : ''}, un loyer mensuel vaut <strong>${eur(c)}</strong> ; il augmente ensuite de <strong>${t} % chaque année</strong>. On note uₙ le loyer, en euros, après n années : ${w(0)} = ${fr(c)}.`,
          `Après ${j} heure${j > 1 ? 's' : ''}, une culture de levures a une masse de <strong>${fr(c)} g</strong>, qui augmente ensuite de <strong>${t} % par heure</strong>. On note uₙ la masse, en grammes, après n heures : ${w(0)} = ${fr(c)}.`][ctx];
        const k = [
          {intro: `Un capital initial de <strong>${eur(c)}</strong> augmente de <strong>${t} % par an</strong>. On note uₙ le capital, en euros, après n années : uₙ = ${fr(c)} × ${fr(q)}ⁿ.`, unit: '€', who: 'le capital', per: 'année'},
          {intro: `Un loyer mensuel de <strong>${eur(c)}</strong> augmente de <strong>${t} % chaque année</strong>. On note uₙ le loyer, en euros, après n années : uₙ = ${fr(c)} × ${fr(q)}ⁿ.`, unit: '€', who: 'le loyer', per: 'année'},
          {intro: `Une culture de levures a une masse de <strong>${fr(c)} g</strong> qui augmente de <strong>${t} % par heure</strong>. On note uₙ la masse, en grammes, après n heures : uₙ = ${fr(c)} × ${fr(q)}ⁿ.`, unit: 'g', who: 'la masse', per: 'heure'}
        ][ctx];
        const money = k.unit === '€';
        return E(o, j ? later : k.intro,
          [N(w(1), F(x[0], 6), undefined, money ? 2 : undefined), N(w(2), F(x[1], 6), undefined, money ? 2 : undefined), N(w(3), F(x[2], 6), undefined, money ? 2 : undefined), N('Raison q', q)],
          C(`augmenter de ${t} % revient à multiplier par 1 + ${t}/100 = ${fr(q)} : la suite est géométrique de raison ${fr(q)}.`,
            [`${w(1)} = ${fr(c)} × ${fr(q)} = ${fr(x[0])} ; ${w(2)} = ${fr(x[0])} × ${fr(q)} = ${fr(x[1])} ; ${w(3)} = ${fr(x[1])} × ${fr(q)} = ${fr(x[2])}.`],
            `au bout de ${j + 3} ${k.per}s, ${k.who} vaut ${fr(x[2])} ${k.unit}${money ? ` (${eur(Math.round(x[2] * 100 + 1e-9) / 100)} au centime près)` : ''}.`),
          tasks(`Calcule ${w(1)}, ${w(2)} et ${w(3)}.`, 'Donne la raison de la suite.'));
      }
    },
    { // 5. Déterminer un premier seuil
      base: {dir: 1, a: 100, q: 1.2, m: 4, target: 200},
      params: r => {
        const dir = r.sign(), a = r.pick([50, 100, 200, 500]), q = dir > 0 ? r.pick([1.1, 1.2, 1.5, 2]) : r.pick([0.5, 0.8, 0.9]), m = r.int(2, 4);
        const lo = Math.min(a * q ** (m - 1), a * q ** m), hi = Math.max(a * q ** (m - 1), a * q ** m);
        const cands = [];
        for (let t = Math.ceil(lo / 10) * 10; t <= hi; t += 10) if (dir > 0 ? t > lo && t <= hi : t >= lo && t < hi) cands.push(t);
        return {dir, a, q, m, target: cands.length ? r.pick(cands) : 0};
      },
      accept: ({a, q, m, target}) => target > 0 && a * q ** m <= 1000 && a * q ** (m - 1) <= 1000 && places(a * q ** m) <= 4,
      decimals: 4,
      difficulty: ({a, q, m, target}) => score({steps: 3, values: [a, a * q ** (m - 1), a * q ** m, target]}),
      verify: ({dir, a, q, target}, v) => {
        const ok = n => (dir > 0 ? a * q ** n >= target : a * q ** n <= target);
        return ok(v[2]) && !ok(v[2] - 1) && Math.abs(v[0] - a * q ** (v[2] - 1)) < 1e-9 && Math.abs(v[1] - a * q ** v[2]) < 1e-9;
      },
      build: ({dir, a, q, m, target}, o) => {
        const sym = dir > 0 ? '≥' : '≤', before = a * q ** (m - 1), at = a * q ** m;
        return E(o, `On étudie <strong>uₙ = ${fr(a)} × ${fr(q)}ⁿ</strong>.`,
          [N(u(m - 1), F(before, 6)), N(u(m), F(at, 6)), N(`Premier rang où uₙ ${sym} ${target}`, m)],
          C(`la suite est ${dir > 0 ? 'croissante (q > 1)' : 'décroissante (0 < q < 1)'} ; on calcule deux termes voisins et on les compare au seuil.`,
            [`${u(m - 1)} = ${fr(a)} × ${fr(q)}${['', '', '²', '³', '⁴'][m - 1] || ''} = ${fr(before)}, qui ne vérifie pas uₙ ${sym} ${target}.`,
             `${u(m)} = ${fr(a)} × ${fr(q)}${['', '', '²', '³', '⁴'][m]} = ${fr(at)} ${sym} ${target}.`],
            `le premier rang où uₙ ${sym} ${target} est ${m}.`),
          tasks(`Calcule ${u(m - 1)} et ${u(m)}.`, `Trouve le premier rang où uₙ ${sym} ${target}.`));
      }
    },
    { // 6. Sommer des termes
      base: {a: 100, q: 0.5, c: 4},
      params: r => { const q = r.pick([0.5, 2, 3]); return {q, a: q === 0.5 ? 8 * r.int(1, 25) : r.int(2, 30), c: r.int(3, 5)}; },
      accept: ({a, q, c}) => a * q ** c <= 1000 && places(a * q ** c) <= 3 && Array.from({length: c}, (_, k) => a * q ** k).reduce((s, x) => s + x, 0) <= 1000,
      decimals: 3,
      difficulty: ({a, q, c}) => score({steps: 3, values: [a, a * q, a * q * q, a * q ** 3, a * q ** c, Array.from({length: c}, (_, k) => a * q ** k).reduce((s, x) => s + x, 0)]}),
      verify: ({a, q, c}, v) => v[0] === q && Math.abs(v[1] - Array.from({length: c}, (_, k) => a * q ** k).reduce((s, x) => s + x, 0)) < 1e-9 && Math.abs(v[2] - a * q ** c) < 1e-9,
      build: ({a, q, c}, o) => {
        const t = Array.from({length: c}, (_, k) => a * q ** k), sum = t.reduce((x, y) => x + y, 0), next = a * q ** c;
        const Next = ORDINAL[c + 1][0].toUpperCase() + ORDINAL[c + 1].slice(1);
        return E(o, `Une suite géométrique a les termes <strong>${t.map(x => fr(x)).join(' ; ')}</strong>.`,
          [N('Raison q', q), N(`Somme des ${COUNT[c]} termes`, F(sum, 6)), N(`${Next} terme`, F(next, 6))],
          C(`la raison est le quotient de deux termes consécutifs ; on additionne ensuite les ${COUNT[c]} termes donnés, puis on multiplie le dernier par q.`,
            [`q = ${fr(t[1])}/${fr(t[0])} = ${fr(q)}.`, `S = ${t.map(x => fr(x)).join(' + ')} = ${fr(sum)} ; terme suivant : ${fr(t[c - 1])} × ${fr(q)} = ${fr(next)}.`],
            `q = ${fr(q)}, la somme des ${COUNT[c]} termes vaut ${fr(sum)} et le ${ORDINAL[c + 1]} terme vaut ${fr(next)}.`),
          tasks('Donne la raison q.', `Calcule la somme des ${COUNT[c]} termes.`, `Détermine le ${ORDINAL[c + 1]} terme.`));
      }
    },
    { // 7. Comparer deux modèles
      base: {a: 100, q: 1.1, want: 0, r: 15, s: 2, R: 10},
      params: r => {
        const a = r.pick([100, 200]), q = r.pick([1.05, 1.1, 1.2]), R = r.pick([8, 10, 12]), T = (a * q ** R - a) / R;
        return {a, q, want: r.int(0, 1), r: r.int(2, Math.max(3, Math.ceil(2 * T))), s: r.int(2, 3), R};
      },
      accept: ({a, q, want, r, s, R}) => {
        const g = a * q ** R, A = a + R * r;
        return Math.abs(A - g) >= 3 && (A > g) === (want === 1) && g <= 1000 && A <= 1000 && round2(a * POW[q][R]) === round2(g) && places(a * q ** s) <= 2;
      },
      decimals: 2,
      difficulty: ({a, q, r, s, R}) => score({steps: 5, values: [a, r, a + s * r, a * q ** s, a + R * r, a * q ** R]}),
      verify: ({a, q, r, s, R}, v) => v[0] === a + s * r && Math.abs(v[1] - a * q ** s) < 1e-9 && v[2] === a + R * r && Math.abs(v[3] - a * q ** R) < 0.005
        && v[4] === (v[2] > v[3] ? 'Arithmétique' : 'Géométrique'),
      build: ({a, q, r, s, R}, o) => {
        const g = a * q ** R, A = a + R * r, aBig = A > g, gs = F(a * q ** s, 6);
        return E(o, `Une population suit deux modèles fictifs : <strong>Aₙ = ${a} + ${r}n</strong> et <strong>Gₙ = ${a} × ${fr(q)}ⁿ</strong>. On donne ${fr(q)}${sup(R)} ≈ ${fr(POW[q][R])}.`,
          [N(u(s, 'A'), a + s * r), N(u(s, 'G'), gs), N(u(R, 'A'), A), N(`${u(R, 'G')} (au centième)`, round2(g), 0.0049), S(`Plus grand au rang ${R}`, aBig ? 'Arithmétique' : 'Géométrique', ['Arithmétique', 'Géométrique'])],
          C('le modèle arithmétique ajoute ' + r + ' à chaque rang ; le modèle géométrique multiplie par ' + fr(q) + '. On calcule les deux au même rang avant de comparer.',
            [`${u(s, 'A')} = ${a} + ${s} × ${r} = ${a + s * r} et ${u(s, 'G')} = ${a} × ${fr(F(q ** s, 6))} = ${fr(gs)}.`, `${u(R, 'A')} = ${a} + ${R} × ${r} = ${A} et ${u(R, 'G')} ≈ ${a} × ${fr(POW[q][R])} ≈ ${fr(round2(g))}.`],
            aBig ? `au rang ${R}, le modèle arithmétique reste le plus grand (${A} > ${fr(round2(g))}).` : `au rang ${R}, le modèle géométrique dépasse le modèle arithmétique (${fr(round2(g))} > ${A}).`),
          tasks(`Calcule ${u(s, 'A')} et ${u(s, 'G')}.`, `Calcule ${u(R, 'A')} et ${u(R, 'G')}, au centième.`, `Indique lequel est le plus grand au rang ${R}.`));
      }
    },
    { // 8. Interpréter une diminution répétée
      base: {ctx: 0, v: 1000, t: 10, n: 3},
      params: r => ({ctx: r.int(0, 2), v: r.pick([400, 500, 800, 1000]), t: r.pick([10, 20, 30, 40, 50]), n: r.int(2, 4)}),
      accept: ({v, t, n}) => places(v * (1 - t / 100) ** n) <= 3,
      decimals: 3,
      difficulty: ({v, t, n}) => { const q = 1 - t / 100; return score({steps: 4, values: [v, q, v * q ** n, (q ** n - 1) * 100]}); },
      verify: ({v, t, n}, x) => { const q = 1 - t / 100; return Math.abs(x[0] - q) < 1e-9 && Math.abs(x[1] - v * x[0] ** n) < 1e-9 && Math.abs(x[2] - (x[1] - v) / v * 100) < 1e-9; },
      build: ({ctx, v, t, n}, o) => {
        const q = 1 - t / 100, end = v * q ** n, rate = (q ** n - 1) * 100, qn = F(q ** n, 9);
        const what = ['Un appareil électroménager', 'Un vélo électrique', 'Une console de jeux'][ctx];
        return E(o, `${what} vaut <strong>${eur(v)}</strong> à l’achat et perd <strong>${t} % de sa valeur chaque année</strong>.`,
          [N('Coefficient multiplicateur annuel', q), N(`Valeur au bout de ${n} ans, en €`, F(end, 6)), N(`Taux d’évolution global sur ${n} ans, en %`, F(rate, 6))],
          C(`perdre ${t} % revient à multiplier par 1 − ${t}/100 = ${fr(q)} ; sur ${['', '', 'deux', 'trois', 'quatre'][n]} ans, on multiplie par ${fr(q)}${sup(n)}. Le taux global se calcule à partir du coefficient global.`,
            [`Valeur au bout de ${n} ans : ${fr(v)} × ${fr(q)}${sup(n)} = ${fr(v)} × ${fr(qn)} = ${fr(F(end, 6))}.`, `Taux global : (${fr(qn)} − 1) × 100 = ${fr(F(rate, 6))}.`],
            `au bout de ${n} ans, l’objet vaut ${eur(F(end, 6))} ; sa valeur a baissé de ${pct(F(Math.abs(rate), 6))}, et non de ${n} × ${t} = ${n * t} %.`),
          tasks('Donne le coefficient multiplicateur annuel.', `Calcule la valeur au bout de ${n} ans.`, `Calcule le taux d’évolution global sur ${n} ans.`));
      }
    }
  ]);
})();
