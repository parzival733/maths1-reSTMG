/* Statistiques descriptives et atelier Python/tableur : modèles déclaratifs. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt} = V;
  const {num: fr, diff, pct, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  const places = x => { const t = String(F(x, 9)); return t.includes('.') ? t.split('.')[1].length : 0; };
  const sum = list => list.reduce((a, b) => a + b, 0);
  const sorted = list => list.slice().sort((a, b) => a - b);
  const round2 = x => Math.round(x * 100 + 1e-9) / 100;
  const SQRT = {2: 1.414, 5: 2.236, 8: 2.828, 10: 3.162, 13: 3.606, 20: 4.472};
  const code = text => '<code>' + text + '</code>';
  // Couples (d ; e) des écarts symétriques et série « asymétrique » de six valeurs.
  const PAIRS = [[2, 0], [1, 1], [3, 1], [2, 2], [4, 0], [3, 3], [4, 2], [5, 1], [4, 4], [6, 2], [5, 5], [7, 1]];
  function SERIES({k, a, b, c, left}) {
    const right = [k, k, k, k + a, k + b, k + c];
    if (!left) return right;
    const top = k + c;
    return right.map(x => top + k - x).reverse();
  }


  register('statistiques-descriptives', [
    { // 1. Effectifs et fréquences
      base: {ctx: 0, T: 80, n: 30},
      params: r => { const T = r.pick([20, 25, 40, 50, 80, 100, 200]); return {ctx: r.int(0, 2), T, n: r.int(Math.ceil(T / 10), Math.floor(9 * T / 10))}; },
      accept: ({T, n}) => places(n / T) <= 3 && 2 * n !== T,
      decimals: 3,
      difficulty: ({T, n}) => score({steps: 3, values: [T, n, n / T, 100 * n / T, T - n]}),
      verify: ({T, n}, v) => Math.abs(v[0] * T - n) < 1e-9 && Math.abs(v[1] - 100 * v[0]) < 1e-9 && v[2] + n === T,
      build: ({ctx, T, n}, o) => {
        const f = n / T, k = [
          {intro: `Sur <strong>${T} personnes</strong> interrogées, ${n} viennent au travail à vélo.`, a: 'du vélo', other: 'ne viennent pas à vélo'},
          {intro: `Sur <strong>${T} élèves</strong> d’un lycée, ${n} pratiquent la natation.`, a: 'de la natation', other: 'ne pratiquent pas la natation'},
          {intro: `Sur <strong>${T} clients</strong> d’un magasin, ${n} paient en espèces.`, a: 'du paiement en espèces', other: 'ne paient pas en espèces'}
        ][ctx];
        return E(o, k.intro,
          [N('Fréquence', F(f, 6)), N('Pourcentage', F(100 * f, 6)), N('Effectif complémentaire', T - n)],
          C('fréquence = effectif de la catégorie/effectif total ; un pourcentage est une fréquence multipliée par 100.',
            [`f = ${n}/${T} = ${fr(f)}, soit ${pct(100 * f)}.`, `${T} − ${n} = ${T - n}.`],
            `la fréquence ${k.a} est ${fr(f)}, soit ${pct(100 * f)} ; ${T - n} personnes ${k.other}.`),
          tasks('Calcule la fréquence.', 'Exprime-la en pourcentage.', 'Calcule l’effectif complémentaire.'));
      }
    },
    { // 2. Moyenne et étendue
      base: {vals: [6, 8, 10, 12]},
      params: r => ({vals: sorted(Array.from({length: r.int(4, 5)}, () => r.int(2, 20)))}),
      accept: ({vals}) => vals[0] !== vals[vals.length - 1],
      decimals: 2,
      difficulty: ({vals}) => score({steps: 3, values: [...vals, sum(vals), sum(vals) / vals.length]}),
      verify: ({vals}, v) => v[0] === vals.length && Math.abs(v[1] * v[0] - sum(vals)) < 1e-9 && v[2] === Math.max(...vals) - Math.min(...vals),
      build: ({vals}, o) => {
        const n = vals.length, m = sum(vals) / n, e = vals[n - 1] - vals[0];
        return E(o, `On a relevé les valeurs <strong>${vals.join(' ; ')}</strong>.`,
          [N('Effectif', n), N('Moyenne', F(m, 6)), N('Étendue', e)],
          C('la moyenne est la somme des valeurs divisée par l’effectif ; l’étendue est la différence entre la plus grande et la plus petite valeur.',
            [`Effectif : ${n}. Moyenne : (${vals.join(' + ')})/${n} = ${sum(vals)}/${n} = ${fr(m)}.`, `Étendue : ${vals[n - 1]} − ${vals[0]} = ${e}.`],
            `l’effectif est ${n}, la moyenne vaut ${fr(m)} et l’étendue ${e}.`),
          tasks('Calcule l’effectif.', 'Calcule la moyenne.', 'Calcule l’étendue.'));
      }
    },
    { // 3. Moyenne pondérée
      base: {g1: 12, c1: 2, g2: 18, c2: 3},
      params: r => ({g1: r.int(5, 19), c1: r.int(1, 4), g2: r.int(5, 19), c2: r.int(1, 4)}),
      accept: ({g1, c1, g2, c2}) => g1 !== g2 && c1 !== c2 && places((c1 * g1 + c2 * g2) / (c1 + c2)) <= 2,
      decimals: 2,
      difficulty: ({g1, c1, g2, c2}) => score({steps: 3, values: [g1, g2, c1 + c2, c1 * g1 + c2 * g2, (c1 * g1 + c2 * g2) / (c1 + c2)]}),
      verify: ({g1, c1, g2, c2}, v) => v[0] === c1 + c2 && v[1] === c1 * g1 + c2 * g2 && Math.abs(v[2] * v[0] - v[1]) < 1e-9,
      build: ({g1, c1, g2, c2}, o) => {
        const s = c1 * g1 + c2 * g2, t = c1 + c2, m = s / t;
        return E(o, `Une élève a obtenu la note <strong>${g1} avec le coefficient ${c1}</strong> et la note <strong>${g2} avec le coefficient ${c2}</strong>.`,
          [N('Total des coefficients', t), N('Somme pondérée', s), N('Moyenne pondérée', F(m, 6))],
          C('chaque note est multipliée par son coefficient ; on divise la somme obtenue par la somme des coefficients.',
            [`Somme pondérée : ${g1} × ${c1} + ${g2} × ${c2} = ${g1 * c1} + ${g2 * c2} = ${s} ; total des coefficients : ${c1} + ${c2} = ${t}.`, `Moyenne : ${s}/${t} = ${fr(m)}.`],
            `la moyenne pondérée est ${fr(m)}/20 ; elle est plus proche de la note qui a le plus grand coefficient.`),
          tasks('Calcule le total des coefficients.', 'Calcule la somme pondérée.', 'Calcule la moyenne.'));
      }
    },
    { // 4. Médiane et quartiles
      base: {vals: [8, 10, 10, 12, 14, 16, 18, 20]},
      params: r => { const n = r.pick([8, 10, 12]); let x = r.int(2, 10); return {vals: Array.from({length: n}, (_, i) => (i === 0 ? x : (x += r.int(0, 3))))}; },
      accept: ({vals}) => new Set(vals).size >= vals.length - 3,
      decimals: 1,
      difficulty: ({vals}) => score({steps: 4, values: vals}),
      verify: ({vals}, v) => {
        const n = vals.length, q = k => vals[Math.ceil(k * n / 4) - 1];
        const below = vals.filter(x => x <= v[0]).length, above = vals.filter(x => x >= v[0]).length;
        return below >= n / 2 && above >= n / 2 && v[1] === q(1) && v[2] === q(3) && v[3] === v[2] - v[1];
      },
      build: ({vals}, o) => {
        const n = vals.length, med = (vals[n / 2 - 1] + vals[n / 2]) / 2, r1 = Math.ceil(n / 4), r3 = Math.ceil(3 * n / 4), Q1 = vals[r1 - 1], Q3 = vals[r3 - 1];
        return E(o, `On considère la série ordonnée <strong>${vals.join(' ; ')}</strong> (${n} valeurs).`,
          [N('Médiane', med), N('Q₁', Q1), N('Q₃', Q3), N('Écart interquartile', Q3 - Q1)],
          C('l’effectif étant pair, la médiane est la moyenne des deux valeurs centrales ; Q₁ et Q₃ sont les valeurs de rangs n/4 et 3n/4, arrondis à l’entier supérieur.',
            [`Médiane : (${vals[n / 2 - 1]} + ${vals[n / 2]})/2 = ${fr(med)} (valeurs de rangs ${n / 2} et ${n / 2 + 1}).`,
             `n/4 = ${fr(n / 4)}, donc Q₁ est la valeur de rang ${r1} : ${Q1} ; 3n/4 = ${fr(3 * n / 4)}, donc Q₃ est la valeur de rang ${r3} : ${Q3}.`],
            `médiane = ${fr(med)}, Q₁ = ${Q1}, Q₃ = ${Q3} et l’écart interquartile vaut ${Q3} − ${Q1} = ${Q3 - Q1}.`),
          tasks('Calcule la médiane.', 'Calcule Q₁ et Q₃ avec les rangs arrondis à l’entier supérieur.', 'Calcule l’écart interquartile.'));
      }
    },
    { // 5. Variance et écart-type
      base: {m: 4, pair: 0},
      params: r => ({m: r.int(5, 15), pair: r.int(0, 11)}),
      accept: ({m, pair}) => m - PAIRS[pair][0] >= 1,
      space: 120,
      decimals: 2,
      difficulty: ({m, pair}) => { const [d, e] = PAIRS[pair]; return score({steps: 4, values: [m - d, m - e, m + e, m + d, (d * d + e * e) / 2, Math.sqrt((d * d + e * e) / 2)]}); },
      verify: ({m, pair}, v) => { const [d, e] = PAIRS[pair], xs = [m - d, m - e, m + e, m + d]; return v[0] === sum(xs) / 4 && Math.abs(v[1] - sum(xs.map(x => (x - v[0]) ** 2)) / 4) < 1e-9 && Math.abs(v[2] - Math.sqrt(v[1])) < 0.006; },
      build: ({m, pair}, o) => {
        const [d, e] = PAIRS[pair], xs = [m - d, m - e, m + e, m + d], Vr = (d * d + e * e) / 2, sd = Math.sqrt(Vr), exact = Number.isInteger(sd);
        return E(o, `On considère <strong>${xs.join(' ; ')}</strong>. Ici, la variance est la moyenne des carrés des écarts à la moyenne.${exact ? '' : ` On donne √${fr(Vr)} ≈ ${fr(SQRT[Vr])}.`}`,
          [N('Moyenne', m), N('Variance', Vr), N('Écart-type, au centième', round2(sd), 0.0049)],
          C('on calcule la moyenne, puis les écarts à la moyenne, leurs carrés et la moyenne de ces carrés (la variance) ; l’écart-type est la racine carrée de la variance.',
            [`Moyenne : (${xs.join(' + ')})/4 = ${m}. Écarts : ${xs.map(x => fr(x - m)).join(' ; ')}.`,
             `Variance : (${xs.map(x => (x - m) ** 2).filter(Boolean).join(' + ')})/4${e === 0 ? ' (les deux écarts nuls n’ajoutent rien)' : ''} = ${fr(Vr)} ; écart-type : √${fr(Vr)} ${exact ? '= ' + sd : '≈ ' + fr(round2(sd))}.`],
            `la moyenne vaut ${m}, la variance ${fr(Vr)} et l’écart-type ${exact ? sd : 'environ ' + fr(round2(sd))}.`),
          {title: 'Écart-type et dispersion', ...tasks('Calcule la moyenne.', 'Calcule la variance.', 'Déduis-en l’écart-type, au centième.')});
      }
    },
    { // 6. Fréquences d'un tableau
      base: {ctx: 0, T: 40, a: 10, b: 12},
      params: r => { const T = r.pick([20, 25, 40, 50, 80, 100]); return {ctx: r.int(0, 2), T, a: r.int(Math.ceil(T / 10), Math.floor(T / 2)), b: r.int(Math.ceil(T / 10), Math.floor(T / 2))}; },
      accept: ({T, a, b}) => a !== b && T - a - b > 0 && places(a / T) <= 3 && places(b / T) <= 3,
      decimals: 3,
      difficulty: ({T, a, b}) => score({steps: 4, values: [T, a, b, a / T, b / T, a + b, (a + b) / T]}),
      verify: ({T, a, b}, v) => Math.abs(v[0] * T - a) < 1e-9 && Math.abs(v[1] * T - b) < 1e-9 && v[2] === a + b && Math.abs(v[3] - v[0] - v[1]) < 1e-9,
      build: ({ctx, T, a, b}, o) => {
        const c = T - a - b, k = [
          `Une population de <strong>${T} clients</strong> est répartie en trois catégories : A (${a}), B (${b}) et C (${c}).`,
          `Les <strong>${T} adhérents</strong> d’une médiathèque ont choisi une formule : A (${a}), B (${b}) ou C (${c}).`,
          `Les <strong>${T} salariés</strong> d’une entreprise viennent en train (A : ${a}), en bus (B : ${b}) ou en voiture (C : ${c}).`
        ][ctx];
        return E(o, k,
          [N('Fréquence de A', F(a / T, 6)), N('Fréquence de B', F(b / T, 6)), N('Effectif de A ou B', a + b), N('Fréquence de A ou B', F((a + b) / T, 6))],
          C('la fréquence d’une catégorie est son effectif divisé par l’effectif total ; A et B étant disjointes, on additionne leurs effectifs (et leurs fréquences).',
            [`f(A) = ${a}/${T} = ${fr(a / T)} ; f(B) = ${b}/${T} = ${fr(b / T)}.`, `Effectif de A ou B : ${a} + ${b} = ${a + b} ; fréquence : ${a + b}/${T} = ${fr((a + b) / T)}.`],
            `f(A) = ${fr(a / T)}, f(B) = ${fr(b / T)} ; A ou B regroupe ${a + b} personnes, soit une fréquence de ${fr((a + b) / T)}.`),
          tasks('Calcule la fréquence de A et celle de B.', 'Calcule l’effectif de A ou B.', 'Calcule la fréquence de A ou B.'));
      }
    },
    { // 7. Comparer deux séries
      base: {m: 5, s1: 1, s2: 5, which: 0},
      params: r => ({m: r.int(5, 12), s1: r.int(1, 2), s2: r.int(3, 6), which: r.int(0, 1)}),
      accept: ({m, s2}) => m - s2 >= 0,
      difficulty: ({m, s1, s2}) => score({steps: 4, values: [m - s2, m - 1, m + 1, m + s2, m - s1, m + s1, 2 * s2]}),
      verify: ({m, s1, s2, which}, v) => v[0] === m && v[1] === m && v[2] === 2 * (which ? s2 : s1) && v[3] === 2 * (which ? s1 : s2) && v[4] === (v[2] > v[3] ? 'A' : 'B'),
      build: ({m, s1, s2, which}, o) => {
        const small = [m - s1, m - s1, m + s1, m + s1], big = [m - s2, m - 1, m + 1, m + s2], A = which ? big : small, B = which ? small : big;
        const eA = A[3] - A[0], eB = B[3] - B[0];
        return E(o, `Deux équipes ont obtenu les résultats A : <strong>${A.join(' ; ')}</strong> et B : <strong>${B.join(' ; ')}</strong>.`,
          [N('Moyenne A', m), N('Moyenne B', m), N('Étendue A', eA), N('Étendue B', eB), S('Équipe la plus dispersée selon l’étendue', eA > eB ? 'A' : 'B', ['A', 'B', 'Même dispersion'])],
          C('on compare des séries de même moyenne à l’aide d’un indicateur de dispersion, ici l’étendue.',
            [`Moyenne A = ${sum(A)}/4 = ${m} et moyenne B = ${sum(B)}/4 = ${m}.`, `Étendue A = ${diff(A[3], A[0])}${A[0] ? ' = ' + eA : ''} ; étendue B = ${diff(B[3], B[0])}${B[0] ? ' = ' + eB : ''}.`],
            `les deux équipes ont la même moyenne (${m}), mais l’équipe ${eA > eB ? 'A' : 'B'} est la plus dispersée selon l’étendue.`),
          tasks('Calcule la moyenne de chaque équipe.', 'Calcule l’étendue de chaque équipe.', 'Indique quelle équipe est la plus dispersée.'));
      }
    },
    { // 8. Moyenne ou médiane ?
      base: {k: 2, a: 6, b: 8, c: 10, left: 0},
      params: r => { const a = r.int(4, 8), b = a + r.int(1, 3); return {k: r.int(1, 6), a, b, c: b + r.int(1, 3), left: r.int(0, 1)}; },
      accept: ({k, a, b, c, left}) => { const xs = SERIES({k, a, b, c, left}); return sum(xs) % 3 === 0 && sum(xs) / 6 !== (xs[2] + xs[3]) / 2; },
      decimals: 1,
      difficulty: p => { const xs = SERIES(p); return score({steps: 4, values: [...xs, sum(xs) / 6, (xs[2] + xs[3]) / 2]}); },
      verify: (p, v) => { const xs = SERIES(p); return Math.abs(v[0] * 6 - sum(xs)) < 1e-9 && v[1] === (xs[2] + xs[3]) / 2 && v[2] === xs[5] - xs[0] && v[3] === (v[1] < v[0] ? 'Médiane' : 'Moyenne'); },
      build: (p, o) => {
        const xs = SERIES(p), mean = sum(xs) / 6, med = (xs[2] + xs[3]) / 2, smaller = med < mean ? 'Médiane' : 'Moyenne';
        return E(o, `Les ventes quotidiennes de six jours sont <strong>${xs.join(' ; ')}</strong>, déjà triées.`,
          [N('Moyenne', F(mean, 6)), N('Médiane', med), N('Étendue', xs[5] - xs[0]), S('Indicateur le plus petit', smaller, ['Moyenne', 'Médiane', 'Égaux'])],
          C('la moyenne utilise toutes les valeurs ; la médiane, ici la moyenne des 3e et 4e valeurs, n’est pas sensible aux valeurs extrêmes.',
            [`Moyenne : ${sum(xs)}/6 = ${fr(mean)} ; médiane : (${xs[2]} + ${xs[3]})/2 = ${fr(med)} ; étendue : ${xs[5]} − ${xs[0]} = ${xs[5] - xs[0]}.`],
            `la ${smaller.toLowerCase()} est la plus petite : quelques valeurs ${med < mean ? 'élevées tirent la moyenne vers le haut' : 'faibles tirent la moyenne vers le bas'}.`),
          tasks('Calcule la moyenne.', 'Calcule la médiane.', 'Calcule l’étendue.', 'Indique l’indicateur le plus petit.'));
      }
    }
  ]);

  register('python-tableur', [
    { // 1. Suivre les affectations
      base: {x: 3, op: 0, add: 2, coef: 4, q: 0},
      params: r => ({x: r.int(2, 12), op: r.int(0, 2), add: r.int(2, 6), coef: r.int(2, 6), q: r.int(0, 1)}),
      accept: ({x, op, add}) => op !== 1 || x - add > 0,
      difficulty: ({x, op, add, coef}) => { const f = [x + add, x - add, x * add][op]; return score({steps: 2, values: [x, add, f, f * coef]}); },
      verify: ({x, op, add, coef, q}, v) => v[0] === [x + add, x - add, x * add][op] && v[1] === v[0] * coef && v[2] === (q ? 'Non' : 'Oui'),
      build: ({x, op, add, coef, q}, o) => {
        const sym = ['+', '-', '*'][op], f = [x + add, x - add, x * add][op], ins = `x = x ${sym} ${add}`;
        return E(o, `Voici un programme Python : ${code(`x = ${x}`)}, puis ${code(ins)}, puis ${code(`y = x * ${coef}`)}.`,
          [N('x final', f), N('y final', f * coef), S(q ? 'La deuxième instruction est-elle une équation à résoudre ?' : 'La deuxième instruction est-elle une affectation ?', q ? 'Non' : 'Oui', ['Oui', 'Non'])],
          C('en Python, le signe = affecte à la variable de gauche la valeur calculée à droite ; on exécute les instructions dans l’ordre.',
            [`x vaut d’abord ${x}, puis ${x} ${['+', M, '×'][op]} ${add} = ${f}.`, `y = ${f} × ${coef} = ${f * coef}.`],
            `x vaut ${f} et y vaut ${f * coef} ; ${code(ins)} est une affectation (on remplace la valeur de x), pas une équation à résoudre.`),
          tasks('Donne la valeur finale de x.', 'Donne la valeur finale de y.', 'Réponds à la question sur l’instruction.'));
      }
    },
    { // 2. Lire une condition
      base: {ctx: 0, limit: 18, op: 0, d1: 1, d2: 2, order: 0},
      params: r => ({ctx: r.int(0, 2), limit: r.int(12, 25), op: r.int(0, 1), d1: r.int(1, 3), d2: r.int(1, 3), order: r.int(0, 1)}),
      space: 2000,
      difficulty: ({limit, d1, d2}) => score({steps: 3, values: [limit, limit - d1, limit + d2]}),
      verify: ({ctx, limit, op, d1, d2, order}, v) => {
        const k = [['majeur', 'mineur'], ['accepté', 'refusé'], ['alerte', 'normal']][ctx], xs = order ? [limit + d2, limit - d1] : [limit - d1, limit + d2];
        return xs.every((x, t) => v[t] === ((op ? x > limit : x >= limit) ? k[0] : k[1])) && v[2] === (op ? 'Non' : 'Oui');
      },
      build: ({ctx, limit, op, d1, d2, order}, o) => {
        const k = [{v: 'age', t: 'majeur', f: 'mineur'}, {v: 'points', t: 'accepté', f: 'refusé'}, {v: 'temperature', t: 'alerte', f: 'normal'}][ctx];
        const sym = op ? '&gt;' : '&gt;=', below = limit - d1, above = limit + d2, xs = order ? [above, below] : [below, above];
        const res = x => (op ? x > limit : x >= limit) ? k.t : k.f;
        return E(o, `Le programme teste ${code(`if ${k.v} ${sym} ${limit}:`)} puis affiche « ${k.t} » si le test est vrai, « ${k.f} » sinon.`,
          [S(`${k.v} = ${xs[0]}`, res(xs[0]), [k.t, k.f]), S(`${k.v} = ${xs[1]}`, res(xs[1]), [k.t, k.f]), S(`${k.v} = ${limit} : test vrai ?`, op ? 'Non' : 'Oui', ['Oui', 'Non'])],
          C(`on remplace la variable par sa valeur et on évalue le test ; l’opérateur ${op ? '> signifie « strictement supérieur »' : '>= signifie « supérieur ou égal »'}.`,
            [`${xs[0]} ${op ? '>' : '≥'} ${limit} est ${(op ? xs[0] > limit : xs[0] >= limit) ? 'vrai' : 'faux'} : « ${res(xs[0])} ». ${xs[1]} ${op ? '>' : '≥'} ${limit} est ${(op ? xs[1] > limit : xs[1] >= limit) ? 'vrai' : 'faux'} : « ${res(xs[1])} ».`],
            `pour ${k.v} = ${limit}, le test est ${op ? 'faux : l’égalité ne suffit pas avec >' : 'vrai : l’égalité est acceptée avec >='}.`),
          tasks(`Indique ce qui s’affiche pour ${k.v} = ${xs[0]}.`, `Indique ce qui s’affiche pour ${k.v} = ${xs[1]}.`, `Indique si le test est vrai pour ${k.v} = ${limit}.`));
      }
    },
    { // 3. Utiliser une fonction Python
      base: {ctx: 0, fee: 12, rate: 5, h2: 3, h3: 5},
      params: r => ({ctx: r.int(0, 2), fee: r.int(5, 20), rate: r.int(2, 9), h2: r.int(2, 4), h3: r.int(5, 8)}),
      difficulty: ({fee, rate, h2, h3}) => score({steps: 3, values: [fee, rate, fee + rate * h2, fee + rate * h3]}),
      verify: ({fee, rate, h2, h3}, v) => v[0] === fee && v[1] - v[0] === rate * h2 && v[2] - v[0] === rate * h3,
      build: ({ctx, fee, rate, h2, h3}, o) => {
        const k = [{f: 'prix', x: 'h'}, {f: 'cout', x: 'n'}, {f: 'tarif', x: 'km'}][ctx];
        return E(o, `On programme ${code(`def ${k.f}(${k.x}): return ${fee} + ${rate}*${k.x}`)} (le ${code('return')} est normalement sur une ligne indentée).`,
          [N(`${k.f}(0)`, fee), N(`${k.f}(${h2})`, fee + rate * h2), N(`${k.f}(${h3})`, fee + rate * h3)],
          C(`la fonction renvoie ${fee} + ${rate} × ${k.x} : on remplace ${k.x} par la valeur donnée en argument.`,
            [`${k.f}(0) = ${fee} ; ${k.f}(${h2}) = ${fee} + ${rate} × ${h2} = ${fee + rate * h2} ; ${k.f}(${h3}) = ${fee} + ${rate} × ${h3} = ${fee + rate * h3}.`],
            `la fonction renvoie ${fee}, ${fee + rate * h2} et ${fee + rate * h3}.`),
          tasks(`Calcule ${k.f}(0), ${k.f}(${h2}) et ${k.f}(${h3}).`));
      }
    },
    { // 4. Lire une liste
      base: {vals: [8, 12, 15], i: 0, j: 2},
      params: r => { const n = r.int(3, 5), [i, j] = r.pickDistinct(Array.from({length: n}, (_, t) => t), 2); return {vals: Array.from({length: n}, () => r.int(5, 20)), i, j}; },
      difficulty: ({vals}) => score({steps: 3, values: [...vals, vals.length]}),
      verify: ({vals, i, j}, v) => v[0] === vals[i] && v[1] === vals[j] && v[2] === vals.length,
      build: ({vals, i, j}, o) => E(o, `En Python, on définit ${code(`notes = [${vals.join(', ')}]`)}.`,
        [N(`notes[${i}]`, vals[i]), N(`notes[${j}]`, vals[j]), N('len(notes)', vals.length)],
        C('les indices d’une liste Python commencent à 0 ; len renvoie le nombre d’éléments.',
          [vals.map((x, t) => `notes[${t}] = ${x}`).join(' ; ') + '.'],
          `notes[${i}] = ${vals[i]}, notes[${j}] = ${vals[j]} et len(notes) = ${vals.length} ; l’indice ${vals.length} serait hors de la liste.`),
        tasks(`Donne notes[${i}].`, `Donne notes[${j}].`, 'Calcule len(notes).'))
    },
    { // 5. Modifier une liste
      base: {vals: [8, 12, 15], k: 1, nv: 13, app: 16},
      params: r => { const n = r.int(3, 4); return {vals: Array.from({length: n}, () => r.int(5, 20)), k: r.int(0, n - 1), nv: r.int(5, 20), app: r.int(5, 20)}; },
      accept: ({vals, k, nv}) => vals[k] !== nv,
      difficulty: ({vals, nv, app}) => score({steps: 3, values: [...vals, nv, app, vals.length + 1]}),
      verify: ({vals, k, nv, app}, v) => { const l = vals.slice(); l[k] = nv; l.push(app); return v[0] === l.length && v[1] === l[k] && v[2] === l[l.length - 1]; },
      build: ({vals, k, nv, app}, o) => {
        const l = vals.slice(); l[k] = nv; l.push(app);
        return E(o, `On exécute ${code(`notes = [${vals.join(', ')}]`)}, puis ${code(`notes[${k}] = ${nv}`)} et ${code(`notes.append(${app})`)}.`,
          [N('Longueur finale', l.length), N(`notes[${k}]`, nv), N('Dernier élément', app)],
          C('une affectation notes[i] = valeur remplace l’élément d’indice i ; append ajoute un élément à la fin de la liste.',
            [`Après la modification : [${vals.map((x, t) => (t === k ? nv : x)).join(', ')}] ; après append : [${l.join(', ')}].`],
            `la liste finale a ${l.length} éléments, notes[${k}] vaut ${nv} et le dernier élément est ${app}.`),
          tasks('Donne la longueur finale.', `Donne notes[${k}].`, 'Donne le dernier élément.'));
      }
    },
    { // 6. Boucle et compteur
      base: {vals: [3, 7, 2, 10], thr: 5, R: 5},
      params: r => ({vals: Array.from({length: r.int(4, 5)}, () => r.int(1, 15)), thr: r.int(4, 10), R: r.int(3, 8)}),
      accept: ({vals, thr}) => { const c = vals.filter(x => x >= thr).length; return c >= 1 && c < vals.length; },
      difficulty: ({vals, R}) => score({steps: 3, values: [...vals, sum(vals), R]}),
      verify: ({vals, thr, R}, v) => v[0] === sum(vals) && v[1] === vals.filter(x => x >= thr).length && v[2] === R,
      build: ({vals, thr, R}, o) => {
        const big = vals.filter(x => x >= thr);
        return E(o, `La liste est ${code(`valeurs = [${vals.join(', ')}]`)}. Un programme additionne les valeurs et compte celles qui sont supérieures ou égales à ${thr}.`,
          [N('Somme des valeurs', sum(vals)), N(`Nombre de valeurs ≥ ${thr}`, big.length), N(`Passages de for i in range(${R})`, R)],
          C('un accumulateur part de 0 et ajoute chaque valeur ; un compteur ajoute 1 à chaque valeur qui vérifie la condition ; range(n) parcourt 0, 1, …, n − 1.',
            [`Somme : ${vals.join(' + ')} = ${sum(vals)}.`, `Valeurs ≥ ${thr} : ${big.join(' ; ')} ; range(${R}) donne ${Array.from({length: R}, (_, t) => t).join(', ')}.`],
            `la somme vaut ${sum(vals)}, le compteur vaut ${big.length} et la boucle effectue ${R} passages.`),
          tasks('Calcule la somme.', `Compte les valeurs ≥ ${thr}.`, `Compte les passages de for i in range(${R}).`));
      }
    },
    { // 7. Recopier une formule de tableur
      base: {a2: 80, b2: 15, a3: 100, b3: 10, dir: 0},
      params: r => ({a2: 10 * r.int(4, 20), b2: r.pick([5, 10, 15, 20, 25]), a3: 10 * r.int(4, 20), b3: r.pick([5, 10, 15, 20, 25]), dir: r.int(0, 1)}),
      accept: ({a2, a3, b2, b3}) => a2 !== a3 && b2 !== b3,
      decimals: 2,
      difficulty: ({a2, b2, a3, b3}) => score({steps: 3, values: [a2, b2, a3, b3, a2 * (1 + b2 / 100), a3 * (1 + b3 / 100)]}),
      verify: ({a2, b2, a3, b3, dir}, v) => { const s = dir ? -1 : 1; return v[0] === (dir ? '=A2*(1-B2)' : '=A2*(1+B2)') && Math.abs(v[1] - a2 * (1 + s * b2 / 100)) < 1e-9 && Math.abs(v[2] - a3 * (1 + s * b3 / 100)) < 1e-9; },
      build: ({a2, b2, a3, b3, dir}, o) => {
        const s = dir ? -1 : 1, c2 = F(a2 * (1 + s * b2 / 100), 6), c3 = F(a3 * (1 + s * b3 / 100), 6), formula = dir ? '=A2*(1-B2)' : '=A2*(1+B2)';
        return E(o, `Une feuille comporte <strong>A2 = ${a2}</strong>, <strong>B2 = ${b2} %</strong>, <strong>A3 = ${a3}</strong> et <strong>B3 = ${b3} %</strong>. En C2, on calcule le prix ${dir ? 'diminué' : 'augmenté'} du taux de la colonne B, puis on recopie la formule en C3.`,
          [S('Formule à écrire en C2', formula, ['=A2*(1+B2)', '=A2*(1-B2)', '=A2+B2', '=A2*(1+B3)'], {shuffle: true}), N('C2', c2), N('C3', c3)],
          C(`${dir ? 'diminuer' : 'augmenter'} de t % revient à multiplier par 1 ${dir ? M : '+'} t ; des références relatives se décalent lors de la recopie vers le bas.`,
            [`En C2 : ${formula} donne ${a2} × ${fr(1 + s * b2 / 100)} = ${fr(c2)}.`, `Recopiée en C3, la formule devient ${formula.replace(/2/g, '3')}, soit ${a3} × ${fr(1 + s * b3 / 100)} = ${fr(c3)}.`],
            `on écrit ${formula} en C2 ; C2 vaut ${fr(c2)} et C3 vaut ${fr(c3)}.`),
          tasks('Choisis la formule à mettre en C2 pour une recopie simple.', 'Donne les valeurs de C2 et de C3 après recopie.'));
      }
    },
    { // 8. Lire un petit fichier CSV
      base: {y0: 2022, sales: [20, 25, 18]},
      params: r => ({y0: r.int(2018, 2022), sales: Array.from({length: r.int(3, 5)}, () => r.int(10, 40))}),
      accept: ({sales}) => sales.filter(x => x === Math.max(...sales)).length === 1 && places(sum(sales) / sales.length) <= 2,
      limit: 3000, decimals: 2,
      difficulty: ({sales}) => score({steps: 4, values: [...sales, sum(sales), sum(sales) / sales.length]}),
      verify: ({y0, sales}, v) => v[0] === sales.length && v[1] === sum(sales) && Math.abs(v[2] * v[0] - v[1]) < 1e-9 && v[3] === y0 + sales.indexOf(Math.max(...sales)),
      build: ({y0, sales}, o) => {
        const n = sales.length, best = y0 + sales.indexOf(Math.max(...sales)), mean = sum(sales) / n;
        return E(o, `Un fichier comporte les lignes ${[code('annee,ventes'), ...sales.map((x, t) => code(`${y0 + t},${x}`))].join(', ')}.`,
          [N('Lignes de données (hors en-tête)', n), N('Total des ventes', sum(sales)), N('Moyenne des ventes', F(mean, 6)), N('Année du maximum', best)],
          C('la première ligne d’un fichier CSV contient les noms des colonnes ; chaque ligne suivante est un enregistrement, dont les champs sont séparés par des virgules.',
            [`Il y a ${n} lignes de données. Total : ${sales.join(' + ')} = ${sum(sales)} ; moyenne : ${sum(sales)}/${n} = ${fr(mean)}.`],
            `le total des ventes est ${sum(sales)}, la moyenne ${fr(mean)}, et le maximum ${Math.max(...sales)} est atteint en ${best}.`),
          tasks('Compte les lignes de données, hors en-tête.', 'Calcule le total des ventes.', 'Calcule la moyenne des ventes.', 'Indique l’année du maximum.'));
      }
    }
  ]);
})();
