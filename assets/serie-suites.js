/* Série suites : extrait de assets/variants-suites.js par tools/build_series.py.
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


  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, {frame} = V;
  /* Points (n ; uₙ) d'une suite arithmétique de premier terme a et de raison r, du rang 0 au rang N. */
  const pointsFig = (titre, a, r, N) => ({c: FG.repere(titre, frame([N + 0.6], [a, a + r * N], {nom_x: 'n', nom_y: 'uₙ'})).suite_points(`(${a})+(${r})*n`, 0, N).description()});
  /* Deux croissances sur le même repère : ajout constant (ronds) et multiplication constante (croix). */
  const comparerFig = (a, q, r, R, noms) => { const g = Array.from({length: R + 1}, (_, n) => [n, a * q ** n]);
    return {c: FG.repere(`Les deux suites du rang 0 au rang ${R} : ajout constant en ronds, multiplication constante en croix`, frame([R + 0.6], [a + r * R, a * q ** R], {nom_x: 'n', nom_y: 'valeur'}))
      .suite_points(`(${a})+(${r})*n`, 0, R).nuage(g, {forme: 'croix'}).legende([{forme: 'rond', texte: noms[0]}, {forme: 'croix', texte: noms[1]}]).description()}; };
  V.illustrate('suites', [null, null, null, null, null,
    ({start, r, k, m}) => pointsFig(`Points (n ; uₙ) : alignés, on monte de ${r} à chaque rang`, start, r, Math.max(k, m) + 1),
    ({a, b}) => pointsFig('Points (n ; uₙ) du rang 0 au rang 6 : isolés et alignés', b, a, 6),
    ({a, q, r, R}) => comparerFig(a, q, r, R, ['uₙ', 'vₙ'])
  ]);
})();
