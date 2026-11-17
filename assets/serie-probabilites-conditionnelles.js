/* Série probabilites-conditionnelles : extrait de assets/variants-probabilites.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, signTable} = V;
  const {num: fr, paren: pa, signed: sg, eur, frac, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  // Valeur exacte, ou arrondie au millième (une saisie plus précise est acceptée).
  const approx = (label, value) => N(label, F(value, 6), 0.0001, 3);
  const r3 = x => fr(Math.round(x * 1000 + 1e-9) / 1000);
  // Valeur exacte si elle s'écrit avec au plus quatre décimales (0,0625), sinon arrondi au millième.
  const exactOrApprox = x => (Math.abs(x * 10000 - Math.round(x * 10000)) < 1e-9 ? '= ' + fr(x) : '≈ ' + r3(x));
  const about = x => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-9 ? 'vaut ' + fr(x) : 'vaut environ ' + r3(x));
  const tenth = r => r.int(1, 9) / 10;
  // « 3/6 = 1/2 » quand la fraction se simplifie, « 1/6 » sinon.
  const simplified = (n, d) => (fmt.gcd(n, d) > 1 ? `${n}/${d} = ${fmt.frac(n, d)}` : `${n}/${d}`);
  const effectifs = (caption, cols, rows) => signTable(caption, cols, rows, 'Effectifs');

  register('probabilites-conditionnelles', [
    { // 1. Union, intersection et complémentaire
      base: {ctx: 0, T: 100, nA: 60, nB: 40, nI: 20},
      params: r => {
        const T = r.pick([50, 100, 200]), k = T / 50, nA = k * r.int(10, 35), nB = k * r.int(10, 35);
        return {ctx: r.int(0, 2), T, nA, nB, nI: k * r.int(2, Math.min(nA, nB) / k - 2)};
      },
      accept: ({T, nA, nB, nI}) => nA + nB - nI < T && nA !== nB,
      difficulty: ({T, nA, nB, nI}) => score({steps: 3, values: [T, nA, nB, nI, nA + nB - nI, nI / T, 1 - nA / T]}),
      verify: ({T, nA, nB, nI}, v) => v[0] + nI === nA + nB && Math.abs(v[1] * T - nI) < 1e-9 && Math.abs((1 - v[2]) * T - nA) < 1e-9,
      build: ({ctx, T, nA, nB, nI}, o) => {
        const k = [
          `Parmi <strong>${T} personnes</strong>, ${nA} pratiquent un sport (événement A), ${nB} jouent d’un instrument (événement B) et ${nI} font les deux.`,
          `Dans une entreprise de <strong>${T} salariés</strong>, ${nA} parlent anglais (A), ${nB} parlent espagnol (B) et ${nI} parlent les deux langues.`,
          `Sur <strong>${T} clients</strong> d’une boutique, ${nA} ont acheté un pantalon (A), ${nB} une chemise (B) et ${nI} les deux.`
        ][ctx];
        const union = nA + nB - nI;
        return E(o, k + ' On choisit une personne au hasard.',
          [N('Effectif de A ∪ B', union), N('P(A ∩ B)', nI / T), N('P(non A)', 1 - nA / T)],
          C('on ne compte pas deux fois les personnes de l’intersection : card(A ∪ B) = card(A) + card(B) − card(A ∩ B). En situation d’équiprobabilité, une probabilité est un effectif divisé par l’effectif total.',
            [`card(A ∪ B) = ${nA} + ${nB} − ${nI} = ${union}.`, `P(A ∩ B) = ${nI}/${T} = ${fr(nI / T)} et P(non A) = 1 − ${nA}/${T} = ${fr(1 - nA / T)}.`],
            `${union} personnes sont dans A ou dans B ; P(A ∩ B) = ${fr(nI / T)} et P(non A) = ${fr(1 - nA / T)}.`),
          tasks('Calcule l’effectif de A ∪ B.', 'Calcule P(A ∩ B) et P(non A).'));
      }
    },
    { // 2. Probabilités conditionnelles dans un tableau
      base: {ctx: 0, T: 200, m: 80, a1: 40, a2: 50},
      params: r => { const T = r.pick([100, 200]), m = (T / 10) * r.int(3, 6); return {ctx: r.int(0, 1), T, m, a1: r.int(Math.ceil(m / 5), Math.floor(4 * m / 5)), a2: r.int(Math.ceil((T - m) / 5), Math.floor(4 * (T - m) / 5))}; },
      accept: ({m, a1, T, a2}) => a1 / m !== a2 / (T - m),
      difficulty: ({T, m, a1, a2}) => score({steps: 4, values: [T, m, a1, a2, a1 / m, a2 / (T - m), (a1 + a2) / T]}),
      verify: ({T, m, a1, a2}, v) => Math.abs(v[0] - a1 / m) < 5e-4 && Math.abs(v[1] - a2 / (T - m)) < 5e-4 && Math.abs(v[2] - (a1 + a2) / T) < 5e-4,
      build: ({ctx, T, m, a1, a2}, o) => {
        const k = ctx
          ? {intro: `Sur <strong>${T} spectateurs</strong>, ${m} ont réservé en ligne, dont ${a1} avec un tarif réduit. Parmi les ${T - m} autres, ${a2} ont un tarif réduit.`, A: 'en ligne', nA: 'non en ligne', B: 'réduit', rowA: 'En ligne', rowN: 'Au guichet', colB: 'Tarif réduit', colN: 'Plein tarif'}
          : {intro: `Sur <strong>${T} clients</strong>, ${m} utilisent l’application mobile, dont ${a1} sont abonnés. Parmi les ${T - m} autres, ${a2} sont abonnés.`, A: 'mobile', nA: 'non mobile', B: 'abonné', rowA: 'Mobile', rowN: 'Autres', colB: 'Abonnés', colN: 'Non abonnés'};
        const tot = a1 + a2;
        return E(o, k.intro + ' On choisit une personne au hasard.',
          [approx(`P(${k.B} | ${k.A})`, a1 / m), approx(`P(${k.B} | ${k.nA})`, a2 / (T - m)), approx(`P(${k.B})`, tot / T)],
          C('sachant un événement, on se restreint à cette sous-population : le dénominateur est son effectif et non l’effectif total.',
            [`P(${k.B} | ${k.A}) = ${a1}/${m} ${exactOrApprox(a1 / m)} ; P(${k.B} | ${k.nA}) = ${a2}/${T - m} ${exactOrApprox(a2 / (T - m))}.`,
             `P(${k.B}) = (${a1} + ${a2})/${T} = ${tot}/${T} ${exactOrApprox(tot / T)}.`],
            `P(${k.B} | ${k.A}) ${exactOrApprox(a1 / m)} et P(${k.B} | ${k.nA}) ${exactOrApprox(a2 / (T - m))} : ces deux probabilités conditionnelles n’ont pas le même dénominateur. Sur toute la population, P(${k.B}) ${exactOrApprox(tot / T)}.`,
            effectifs('Tableau des effectifs', [k.colB, k.colN, 'Total'], [
              {label: k.rowA, cells: [a1, m - a1, m]}, {label: k.rowN, cells: [a2, T - m - a2, T - m]}, {label: 'Total', cells: [tot, T - tot, T]}])),
          tasks('Calcule les deux probabilités conditionnelles.', 'Calcule la probabilité sur toute la population.'));
      }
    },
    { // 3. Inverser une condition dans un tableau
      base: {ctx: 0, T: 200, m: 80, a1: 40, a2: 50},
      params: r => { const T = r.pick([100, 200]), m = (T / 10) * r.int(3, 6); return {ctx: r.int(0, 1), T, m, a1: r.int(Math.ceil(m / 5), Math.floor(4 * m / 5)), a2: r.int(Math.ceil((T - m) / 5), Math.floor(4 * (T - m) / 5))}; },
      accept: ({T, a1}) => T === 100 || a1 % 2 === 0,
      difficulty: ({T, m, a1, a2}) => score({steps: 4, values: [T, m, a1, a2, a1 / (a1 + a2), a1 / T, m / T]}),
      verify: ({T, m, a1, a2}, v) => Math.abs(v[0] - a1 / (a1 + a2)) < 5e-4 && Math.abs(v[1] * T - a1) < 1e-9 && Math.abs(v[2] * T - m) < 1e-9,
      build: ({ctx, T, m, a1, a2}, o) => {
        const k = ctx
          ? {intro: `Sur <strong>${T} spectateurs</strong>, ${m} ont réservé en ligne et ${a1 + a2} ont un tarif réduit ; ${a1} ont à la fois réservé en ligne et un tarif réduit.`, A: 'en ligne', B: 'réduit'}
          : {intro: `Sur <strong>${T} clients</strong>, ${m} utilisent l’application mobile et ${a1 + a2} sont abonnés ; ${a1} sont à la fois sur mobile et abonnés.`, A: 'mobile', B: 'abonné'};
        const subs = a1 + a2;
        return E(o, k.intro + ' On choisit une personne au hasard.',
          [approx(`P(${k.A} | ${k.B})`, a1 / subs), N(`P(${k.A} ∩ ${k.B})`, a1 / T), N(`P(${k.A})`, m / T)],
          C(`inverser le conditionnement change la population de référence : pour P(${k.A} | ${k.B}), on divise par l’effectif de « ${k.B} ». Une intersection se rapporte à l’effectif total.`,
            [`P(${k.A} | ${k.B}) = ${a1}/${subs} ${exactOrApprox(a1 / subs)}.`, `P(${k.A} ∩ ${k.B}) = ${a1}/${T} = ${fr(a1 / T)} et P(${k.A}) = ${m}/${T} = ${fr(m / T)}.`],
            `P(${k.A} | ${k.B}) ${exactOrApprox(a1 / subs)}, alors que P(${k.A} ∩ ${k.B}) = ${fr(a1 / T)} : ce ne sont pas les mêmes probabilités.`),
          {title: 'Inverser une condition', ...tasks(`Calcule P(${k.A} | ${k.B}).`, `Calcule P(${k.A} ∩ ${k.B}) et P(${k.A}).`)});
      }
    },
    { // 4. Arbre et formule des probabilités totales
      base: {pA: 0.3, pBA: 0.8, pBnA: 0.2},
      params: r => ({pA: tenth(r), pBA: tenth(r), pBnA: tenth(r)}),
      accept: ({pBA, pBnA}) => pBA !== pBnA,
      decimals: 2,
      difficulty: ({pA, pBA, pBnA}) => score({steps: 4, values: [pA, pBA, pBnA, pA * pBA, (1 - pA) * pBnA, pA * pBA + (1 - pA) * pBnA]}),
      verify: ({pA, pBA, pBnA}, v) => Math.abs(v[0] - pA * pBA) < 1e-9 && Math.abs(v[1] - (1 - pA) * pBnA) < 1e-9 && Math.abs(v[2] - v[0] - v[1]) < 1e-9,
      build: ({pA, pBA, pBnA}, o) => {
        const i1 = F(pA * pBA, 6), i2 = F((1 - pA) * pBnA, 6), pB = F(i1 + i2, 6);
        return E(o, `Un arbre de probabilités donne <strong>P(A) = ${fr(pA)}</strong>, <strong>P<sub>A</sub>(B) = ${fr(pBA)}</strong> et <strong>P<sub>non A</sub>(B) = ${fr(pBnA)}</strong>.`,
          [N('P(A ∩ B)', i1), N('P(non A ∩ B)', i2), N('P(B)', pB)],
          C('on multiplie les probabilités le long d’un chemin de l’arbre ; A et non A formant une partition, la formule des probabilités totales donne P(B) = P(A ∩ B) + P(non A ∩ B).',
            [`P(A ∩ B) = ${fr(pA)} × ${fr(pBA)} = ${fr(i1)} ; P(non A) = 1 − ${fr(pA)} = ${fr(1 - pA)} et P(non A ∩ B) = ${fr(1 - pA)} × ${fr(pBnA)} = ${fr(i2)}.`,
             `P(B) = ${fr(i1)} + ${fr(i2)} = ${fr(pB)}.`],
            `P(A ∩ B) = ${fr(i1)}, P(non A ∩ B) = ${fr(i2)} et P(B) = ${fr(pB)}.`),
          tasks('Calcule les probabilités des deux chemins qui mènent à B.', 'Calcule P(B).'));
      }
    },
    { // 5. Indépendance et réunion
      base: {pA: 0.4, pB: 0.25, ind: 1, shift: 0},
      params: r => { const ind = r.int(0, 1); return {pA: r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8]), pB: r.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), ind, shift: ind ? 0 : r.pick([-0.1, -0.05, 0.05, 0.1])}; },
      accept: ({pA, pB, shift}) => { const i = F(pA * pB + shift, 6); return i > Math.max(0, pA + pB - 1) && i < Math.min(pA, pB); },
      decimals: 3,
      difficulty: ({pA, pB, shift}) => score({steps: 3, values: [pA, pB, pA * pB, pA * pB + shift, pA + pB - pA * pB - shift]}),
      verify: ({pA, pB, shift}, v) => Math.abs(v[0] - pA * pB) < 1e-9 && v[1] === (shift === 0 ? 'Oui' : 'Non') && Math.abs(v[2] - (pA + pB - pA * pB - shift)) < 1e-9,
      build: ({pA, pB, ind, shift}, o) => {
        const prod = F(pA * pB, 6), inter = F(pA * pB + shift, 6), uni = F(pA + pB - inter, 6);
        return E(o, `On donne <strong>P(A) = ${fr(pA)}</strong>, <strong>P(B) = ${fr(pB)}</strong> et <strong>P(A ∩ B) = ${fr(inter)}</strong>.`,
          [N('P(A) × P(B)', prod), S('A et B sont-ils indépendants ?', ind ? 'Oui' : 'Non', ['Oui', 'Non']), N('P(A ∪ B)', uni)],
          C('A et B sont indépendants si et seulement si P(A ∩ B) = P(A) × P(B). Pour la réunion, P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
            [`P(A) × P(B) = ${fr(pA)} × ${fr(pB)} = ${fr(prod)}, ${ind ? 'égal' : 'différent de'} P(A ∩ B) = ${fr(inter)}.`, `P(A ∪ B) = ${fr(pA)} + ${fr(pB)} − ${fr(inter)} = ${fr(uni)}.`],
            `A et B ${ind ? 'sont' : 'ne sont pas'} indépendants, et P(A ∪ B) = ${fr(uni)}.`),
          {title: 'Tester une indépendance', ...tasks('Calcule P(A) × P(B).', 'Conclus sur l’indépendance.', 'Calcule P(A ∪ B).')});
      }
    },
    { // 6. Indépendance et probabilité conditionnelle
      base: {pA: 0.5, pB: 0.4, ind: 0, pBA: 0.6},
      params: r => { const pB = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7]), ind = r.int(0, 1); return {pA: r.pick([0.2, 0.4, 0.5, 0.8]), pB, ind, pBA: ind ? pB : tenth(r)}; },
      accept: ({pA, pB, ind, pBA}) => (ind ? pBA === pB : pBA !== pB) && pA * pBA <= pB && pA + pB - pA * pBA <= 1,
      decimals: 2,
      difficulty: ({pA, pB, pBA}) => score({steps: 3, values: [pA, pB, pA * pBA, pA * pB, pBA]}),
      verify: ({pA, pB, pBA}, v) => Math.abs(v[0] - pA * pB) < 1e-9 && v[1] === (Math.abs(pA * pBA - v[0]) < 1e-9 ? 'Oui' : 'Non') && Math.abs(v[2] * pA - pA * pBA) < 1e-9,
      build: ({pA, pB, ind, pBA}, o) => {
        const inter = F(pA * pBA, 6), prod = F(pA * pB, 6);
        return E(o, `On donne <strong>P(A) = ${fr(pA)}</strong>, <strong>P(B) = ${fr(pB)}</strong> et <strong>P(A ∩ B) = ${fr(inter)}</strong>.`,
          [N('P(A) × P(B)', prod), S('Indépendants ?', ind ? 'Oui' : 'Non', ['Oui', 'Non']), N('P(B | A)', pBA)],
          C('on compare P(A ∩ B) au produit P(A) × P(B) ; la probabilité conditionnelle vaut P(B | A) = P(A ∩ B)/P(A).',
            [`P(A) × P(B) = ${fr(prod)}, ${ind ? 'égal à' : 'différent de'} P(A ∩ B) = ${fr(inter)}.`, `P(B | A) = ${fr(inter)}/${fr(pA)} = ${fr(pBA)}.`],
            ind ? `A et B sont indépendants : savoir que A est réalisé ne change pas la probabilité de B (P(B | A) = P(B) = ${fr(pB)}).`
              : `A et B ne sont pas indépendants : P(B | A) = ${fr(pBA)} est différent de P(B) = ${fr(pB)}.`),
          {title: 'Indépendance et conditionnement', ...tasks('Calcule P(A)P(B).', 'Conclus sur l’indépendance.', 'Calcule P(B | A).')});
      }
    },
    { // 7. Comparer deux groupes
      base: {ctx: 0, n1: 70, p1: 0.4, n2: 50, p2: 0.2},
      params: r => ({ctx: r.int(0, 2), n1: 10 * r.int(3, 8), p1: tenth(r), n2: 10 * r.int(3, 8), p2: tenth(r)}),
      accept: ({p1, p2, n1, n2}) => p1 !== p2 && n1 !== n2,
      difficulty: ({n1, p1, n2, p2}) => score({steps: 4, values: [n1 + n2, n1, n2, n1 * p1, n2 * p2, (n1 * p1 + n2 * p2) / (n1 + n2)]}),
      verify: ({n1, p1, n2, p2}, v) => Math.abs(v[0] - p1) < 1e-9 && Math.abs(v[1] - p2) < 1e-9 && Math.abs(v[2] - (n1 * p1 + n2 * p2) / (n1 + n2)) < 5e-4,
      build: ({ctx, n1, p1, n2, p2}, o) => {
        const b1 = Math.round(n1 * p1), b2 = Math.round(n2 * p2), T = n1 + n2, tot = b1 + b2;
        const k = [
          {intro: `Une enquête porte sur <strong>${T} personnes</strong> : ${n1} adultes, dont ${b1} ont acheté un article, et ${n2} adolescents, dont ${b2} ont acheté.`, g1: 'adulte', g2: 'adolescent', ev: 'achat', c1: 'Achat', c2: 'Pas d’achat', r1: 'Adultes', r2: 'Adolescents'},
          {intro: `Un lycée compte <strong>${T} élèves</strong> : ${n1} en Première, dont ${b1} pratiquent un sport en club, et ${n2} en Terminale, dont ${b2} pratiquent un sport en club.`, g1: 'Première', g2: 'Terminale', ev: 'sport', c1: 'Sport en club', c2: 'Pas de sport', r1: 'Première', r2: 'Terminale'},
          {intro: `Une boutique reçoit <strong>${T} clients</strong> : ${n1} le matin, dont ${b1} paient par carte, et ${n2} l’après-midi, dont ${b2} paient par carte.`, g1: 'matin', g2: 'après-midi', ev: 'carte', c1: 'Carte', c2: 'Autre paiement', r1: 'Matin', r2: 'Après-midi'}
        ][ctx];
        return E(o, k.intro + ' On choisit une personne au hasard.',
          [N(`P(${k.ev} | ${k.g1})`, p1), N(`P(${k.ev} | ${k.g2})`, p2), approx(`P(${k.ev}), au millième`, tot / T)],
          C('pour une probabilité sachant un groupe, on divise par l’effectif de ce groupe ; pour la probabilité globale, on divise le nombre total de cas favorables par l’effectif total.',
            [`P(${k.ev} | ${k.g1}) = ${b1}/${n1} = ${fr(p1)} ; P(${k.ev} | ${k.g2}) = ${b2}/${n2} = ${fr(p2)}.`, `P(${k.ev}) = (${b1} + ${b2})/${T} = ${tot}/${T} ${exactOrApprox(tot / T)}.`],
            `la probabilité globale, P(${k.ev}) ${exactOrApprox(tot / T)}, est comprise entre les deux probabilités conditionnelles : c’est une moyenne pondérée par la taille des groupes.`,
            effectifs('Tableau des effectifs', [k.c1, k.c2, 'Total'], [
              {label: k.r1, cells: [b1, n1 - b1, n1]}, {label: k.r2, cells: [b2, n2 - b2, n2]}, {label: 'Total', cells: [tot, T - tot, T]}])),
          tasks('Calcule la probabilité dans chacun des deux groupes.', 'Calcule la probabilité sur toute la population.'));
      }
    },
    { // 8. Test, probabilités totales et inversion du conditionnement
      base: {ctx: 0, d: 0.1, se: 0.9, fp: 0.2},
      params: r => ({ctx: r.int(0, 2), d: r.pick([0.05, 0.1, 0.2]), se: r.pick([0.8, 0.9, 0.95]), fp: r.pick([0.05, 0.1, 0.2])}),
      decimals: 4,
      difficulty: ({d, se, fp}) => score({steps: 4, values: [d, se, fp, d * se, d * se + (1 - d) * fp, d * se / (d * se + (1 - d) * fp)]}),
      verify: ({d, se, fp}, v) => Math.abs(v[0] - d * se) < 1e-9 && Math.abs(v[1] - (v[0] + (1 - d) * fp)) < 1e-9 && Math.abs(v[2] - v[0] / v[1]) < 5e-4,
      build: ({ctx, d, se, fp}, o) => {
        const j = F(d * se, 6), other = F((1 - d) * fp, 6), t = F(j + other, 6);
        const k = [
          {intro: `Dans un contrôle de fabrication, <strong>${fr(100 * d)} % des pièces sont défectueuses</strong> (D). Un test est positif (T) pour ${fr(100 * se)} % des pièces défectueuses et pour ${fr(100 * fp)} % des autres.`, D: 'D', T: 'T', end: 'qu’une pièce soit défectueuse sachant que le test est positif'},
          {intro: `Dans une population, <strong>${fr(100 * d)} % des personnes ont une maladie</strong> (D). Un test de dépistage est positif (T) pour ${fr(100 * se)} % des malades et pour ${fr(100 * fp)} % des personnes non malades.`, D: 'D', T: 'T', end: 'qu’une personne soit malade sachant que son test est positif'},
          {intro: `Sur une messagerie, <strong>${fr(100 * d)} % des messages sont indésirables</strong> (D). Le filtre signale (T) ${fr(100 * se)} % des messages indésirables et ${fr(100 * fp)} % des autres.`, D: 'D', T: 'T', end: 'qu’un message soit indésirable sachant qu’il est signalé'}
        ][ctx];
        return E(o, k.intro,
          [N('P(D ∩ T)', j), N('P(T)', t), approx('P(D | T), au millième', j / t)],
          C('on lit l’arbre (D puis T) ; la formule des probabilités totales donne P(T), puis l’inversion du conditionnement donne P(D | T) = P(D ∩ T)/P(T).',
            [`P(D ∩ T) = ${fr(d)} × ${fr(se)} = ${fr(j)} ; P(non D ∩ T) = ${fr(1 - d)} × ${fr(fp)} = ${fr(other)}.`, `P(T) = ${fr(j)} + ${fr(other)} = ${fr(t)} ; P(D | T) = ${fr(j)}/${fr(t)} ≈ ${r3(j / t)}.`],
            `la probabilité ${k.end} ${about(j / t)} : elle dépend aussi de la proportion initiale ${fr(d)}, pas seulement de la fiabilité du test.`),
          {title: 'Inverser une probabilité conditionnelle', ...tasks('Calcule P(D ∩ T).', 'Calcule P(T) avec la formule des probabilités totales.', 'Calcule P(D | T).')});
      }
    }
  ]);

  const BCTX = [
    p => `Une épreuve de Bernoulli a pour probabilité de succès <strong>p = ${fr(p)}</strong>.`,
    p => `Un joueur réussit un tir au but avec la probabilité <strong>p = ${fr(p)}</strong> ; on appelle succès un tir réussi.`,
    p => `Une graine germe avec la probabilité <strong>p = ${fr(p)}</strong> ; on appelle succès une graine qui germe.`
  ];
  const bern = (steps, values) => score({steps, values});


  const EVENTS = [
    ['pair', f => Math.floor(f / 2)], ['impair', f => Math.ceil(f / 2)], ['un multiple de 3', f => Math.floor(f / 3)],
    ...[1, 2, 3, 4, 5].map(k => [`inférieur ou égal à ${k}`, () => k]), ...[2, 3, 4, 5, 6].map(k => [`supérieur ou égal à ${k}`, f => f - k + 1])
  ];
  const fair = x => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-9 ? fr(x) : '≈ ' + r3(x));

  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, d4 = x => fr(F(x, 4));
  /* Arbre à deux niveaux : A ou non A, puis B ou non B ; `complet` écrit les compléments et le poids des chemins vers B. */
  const arbreFig = (titre, noms, pA, pBA, pBnA, complet) => { const [A, nA, B, nB] = noms;
    const branche = (nom, p, q) => ({nom, p: p == null ? '?' : d4(p), enfants: [{nom: B, p: d4(q), feuille: complet ? '→ ' + d4(p * q) : undefined}, {nom: nB, p: complet ? d4(1 - q) : '?'}]});
    return FG.arbre(titre, [branche(A, pA, pBA), branche(nA, complet ? 1 - pA : null, pBnA)], Object.assign({largeur: 340}, complet ? {chemins: [[A, B], [nA, B]]} : {})).description(); };
  V.illustrate('probabilites-conditionnelles', [null, null, null,
    ({pA, pBA, pBnA}) => ({e: arbreFig(`Arbre pondéré avec les données : P(A) = ${fr(pA)}, puis B sachant A et B sachant Ā`, ['A', 'Ā', 'B', 'B̄'], pA, pBA, pBnA),
      c: arbreFig('On multiplie le long de chaque chemin qui mène à B, puis on additionne', ['A', 'Ā', 'B', 'B̄'], pA, pBA, pBnA, true)}),
    null, null, null,
    ({d, se, fp}) => ({c: arbreFig('Arbre du test : les deux chemins qui mènent à un test positif T', ['D', 'D̄', 'T', 'T̄'], d, se, fp, true)})
  ]);
  /* Arbre de n essais indépendants : S pour « succès » (probabilité p), E pour « échec ». */
  const essais = (p, n) => (n ? [{nom: 'S', p: d4(p), enfants: essais(p, n - 1)}, {nom: 'E', p: d4(1 - p), enfants: essais(p, n - 1)}] : undefined);
  const chemins = (n, garder) => { let tous = [[]];
    for (let i = 0; i < n; i++) tous = tous.flatMap(c => [c.concat('S'), c.concat('E')]);
    return tous.filter(c => garder(c.filter(x => x === 'S').length)); };
  const essaisFig = (titre, p, n, garder) => ({c: FG.arbre(titre, essais(p, n), {chemins: chemins(n, garder), largeur: 340, hauteur: n > 2 ? 300 : 220}).description()});
})();
