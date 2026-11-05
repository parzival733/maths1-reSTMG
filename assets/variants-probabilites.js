/* Probabilités conditionnelles, épreuves de Bernoulli et variables aléatoires :
   modèles déclaratifs. Les probabilités tirées ont au plus deux décimales ;
   les quotients non décimaux sont demandés au millième. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, signTable} = V;
  const {num: fr, paren: pa, signed: sg, eur, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  // Valeur exacte, ou arrondie au millième (une saisie plus précise est acceptée).
  const approx = (label, value) => N(label, F(value, 6), 0.0001, 3);
  const r3 = x => fr(Math.round(x * 1000 + 1e-9) / 1000);
  const exactOrApprox = x => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-9 ? '= ' + fr(x) : '≈ ' + r3(x));
  const about = x => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-9 ? 'vaut ' + fr(x) : 'vaut environ ' + r3(x));
  const tenth = r => r.int(1, 9) / 10;
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
            `les deux probabilités conditionnelles n’ont pas le même dénominateur ; au millième, P(${k.B}) ${exactOrApprox(tot / T)}.`,
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
            `la probabilité globale ${exactOrApprox(tot / T)} est comprise entre les deux probabilités conditionnelles : c’est une moyenne pondérée par la taille des groupes.`,
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
          C('on lit l’arbre (D puis T) ; la formule des probabilités totales donne P(T), puis l’inversion du conditionnement donne P<sub>T</sub>(D) = P(D ∩ T)/P(T).',
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

  register('bernoulli', [
    { // 1. Une épreuve à deux issues
      base: {ctx: 0, p: 0.3},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27,
      difficulty: ({p}) => bern(2, [p, 1 - p, 2]),
      verify: ({p}, v) => Math.abs(v[0] + p - 1) < 1e-9 && v[1] === 2,
      build: ({ctx, p}, o) => E(o, BCTX[ctx](p),
        [N('P(échec)', F(1 - p, 6)), N('Nombre d’issues', 2)],
        C('une épreuve de Bernoulli a exactement deux issues, succès et échec ; leurs probabilités ont pour somme 1.',
          [`P(échec) = 1 − ${fr(p)} = ${fr(1 - p)}.`],
          `il y a 2 issues et P(échec) = ${fr(1 - p)}.`),
        tasks('Donne la probabilité de l’échec.', 'Indique le nombre d’issues.'))
    },
    { // 2. Deux essais indépendants
      base: {ctx: 0, p: 0.4},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27, decimals: 2,
      difficulty: ({p}) => bern(3, [p, 1 - p, p * p, p * (1 - p), (1 - p) ** 2]),
      verify: ({p}, v) => Math.abs(v[0] - p * p) < 1e-9 && Math.abs(v[1] - p * (1 - p)) < 1e-9 && Math.abs(v[2] - (1 - p) ** 2) < 1e-9,
      build: ({ctx, p}, o) => { const q = F(1 - p, 6); return E(o, BCTX[ctx](p) + ' On répète deux fois l’épreuve, de façon indépendante. On note S un succès et E un échec.',
        [N('P(SS)', F(p * p, 6)), N('P(SE)', F(p * q, 6)), N('P(EE)', F(q * q, 6))],
        C('les essais étant indépendants, la probabilité d’un chemin de l’arbre est le produit des probabilités de ses branches.',
          [`P(SS) = ${fr(p)} × ${fr(p)} = ${fr(p * p)} ; P(SE) = ${fr(p)} × ${fr(q)} = ${fr(p * q)} ; P(EE) = ${fr(q)} × ${fr(q)} = ${fr(q * q)}.`],
          `P(SS) = ${fr(p * p)}, P(SE) = ${fr(p * q)} et P(EE) = ${fr(q * q)}.`),
        tasks('Calcule P(SS), P(SE) et P(EE).')); }
    },
    { // 3. Un succès, aucun, au moins un
      base: {ctx: 0, p: 0.4},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27, decimals: 2,
      difficulty: ({p}) => bern(4, [p, 1 - p, 2 * p * (1 - p), (1 - p) ** 2, 1 - (1 - p) ** 2]),
      verify: ({p}, v) => Math.abs(v[0] - 2 * p * (1 - p)) < 1e-9 && Math.abs(v[1] - (1 - p) ** 2) < 1e-9 && Math.abs(v[1] + v[2] - 1) < 1e-9,
      build: ({ctx, p}, o) => { const q = F(1 - p, 6); return E(o, BCTX[ctx](p) + ' On effectue deux essais indépendants.',
        [N('Exactement un succès', F(2 * p * q, 6)), N('Aucun succès', F(q * q, 6)), N('Au moins un succès', F(1 - q * q, 6))],
        C('« exactement un succès » correspond à deux chemins (SE et ES) ; « au moins un succès » est l’événement contraire de « aucun succès ».',
          [`P(exactement un) = 2 × ${fr(p)} × ${fr(q)} = ${fr(2 * p * q)} ; P(aucun) = ${fr(q)}² = ${fr(q * q)}.`, `P(au moins un) = 1 − ${fr(q * q)} = ${fr(1 - q * q)}.`],
          `P(exactement un succès) = ${fr(2 * p * q)}, P(aucun) = ${fr(q * q)} et P(au moins un) = ${fr(1 - q * q)}.`),
        tasks('Calcule la probabilité d’obtenir exactement un succès.', 'Calcule la probabilité de n’obtenir aucun succès, puis au moins un.')); }
    },
    { // 4. Trois essais indépendants
      base: {ctx: 0, p: 0.5},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27, decimals: 3,
      difficulty: ({p}) => bern(4, [p, 1 - p, p ** 3, (1 - p) ** 3, 3 * p * p * (1 - p)]),
      verify: ({p}, v) => Math.abs(v[0] - p ** 3) < 1e-9 && Math.abs(v[1] - (1 - p) ** 3) < 1e-9 && Math.abs(v[2] - 3 * p * p * (1 - p)) < 1e-9,
      build: ({ctx, p}, o) => { const q = F(1 - p, 6); return E(o, BCTX[ctx](p) + ' On répète l’épreuve <strong>3 fois</strong>, de façon indépendante.',
        [N('P(SSS)', F(p ** 3, 6)), N('P(EEE)', F(q ** 3, 6)), N('Exactement deux succès', F(3 * p * p * q, 6))],
        C('on multiplie les probabilités le long d’un chemin ; « exactement deux succès » regroupe 3 chemins (SSE, SES, ESS) de même probabilité.',
          [`P(SSS) = ${fr(p)}³ = ${fr(p ** 3)} ; P(EEE) = ${fr(q)}³ = ${fr(q ** 3)}.`, `P(exactement deux) = 3 × ${fr(p)}² × ${fr(q)} = 3 × ${fr(p * p)} × ${fr(q)} = ${fr(3 * p * p * q)}.`],
          `P(SSS) = ${fr(p ** 3)}, P(EEE) = ${fr(q ** 3)} et P(exactement deux succès) = ${fr(3 * p * p * q)}.`),
        {title: 'Trois essais indépendants', ...tasks('Calcule P(SSS) et P(EEE).', 'Calcule la probabilité d’exactement deux succès.')}); }
    },
    { // 5. Zéro, au moins un, exactement un succès sur trois essais
      base: {ctx: 0, p: 0.2},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27, decimals: 3,
      difficulty: ({p}) => bern(4, [p, 1 - p, (1 - p) ** 3, 1 - (1 - p) ** 3, 3 * p * (1 - p) ** 2]),
      verify: ({p}, v) => Math.abs(v[0] - (1 - p) ** 3) < 1e-9 && Math.abs(v[0] + v[1] - 1) < 1e-9 && Math.abs(v[2] - 3 * p * (1 - p) ** 2) < 1e-9,
      build: ({ctx, p}, o) => { const q = F(1 - p, 6); return E(o, BCTX[ctx](p) + ' On effectue <strong>trois essais indépendants</strong>.',
        [N('Zéro succès', F(q ** 3, 6)), N('Au moins un succès', F(1 - q ** 3, 6)), N('Exactement un succès', F(3 * p * q * q, 6))],
        C('« au moins un succès » est le contraire de « zéro succès » ; « exactement un succès » regroupe 3 chemins.',
          [`P(zéro succès) = ${fr(q)}³ = ${fr(q ** 3)} ; P(au moins un) = 1 − ${fr(q ** 3)} = ${fr(1 - q ** 3)}.`, `P(exactement un) = 3 × ${fr(p)} × ${fr(q)}² = 3 × ${fr(p)} × ${fr(q * q)} = ${fr(3 * p * q * q)}.`],
          `P(zéro succès) = ${fr(q ** 3)}, P(au moins un) = ${fr(1 - q ** 3)} et P(exactement un) = ${fr(3 * p * q * q)}.`),
        tasks('Calcule la probabilité de zéro succès.', 'Déduis-en celle d’au moins un succès.', 'Calcule celle d’exactement un succès.')); }
    },
    { // 6. Quatre essais indépendants
      base: {ctx: 0, p: 0.3},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27, decimals: 4,
      difficulty: ({p}) => bern(4, [p, 1 - p, (1 - p) ** 4, 1 - (1 - p) ** 4, p ** 4]),
      verify: ({p}, v) => Math.abs(v[0] - (1 - p) ** 4) < 1e-9 && Math.abs(v[0] + v[1] - 1) < 1e-9 && Math.abs(v[2] - p ** 4) < 1e-9,
      build: ({ctx, p}, o) => { const q = F(1 - p, 6); return E(o, BCTX[ctx](p) + ' On réalise <strong>4 essais indépendants</strong>.',
        [N('Aucun succès', F(q ** 4, 6)), N('Au moins un succès', F(1 - q ** 4, 6)), N('Quatre succès', F(p ** 4, 6))],
        C('un seul chemin donne « aucun succès » (EEEE) et un seul donne « quatre succès » ; « au moins un » est le contraire de « aucun ».',
          [`P(aucun) = ${fr(q)}⁴ = ${fr(q * q)}² = ${fr(q ** 4)} ; P(au moins un) = 1 − ${fr(q ** 4)} = ${fr(1 - q ** 4)}.`, `P(quatre succès) = ${fr(p)}⁴ = ${fr(p * p)}² = ${fr(p ** 4)}.`],
          `P(aucun succès) = ${fr(q ** 4)}, P(au moins un) = ${fr(1 - q ** 4)} et P(quatre succès) = ${fr(p ** 4)}.`),
        tasks('Calcule la probabilité d’aucun succès, puis d’au moins un succès.', 'Calcule la probabilité de quatre succès.')); }
    },
    { // 7. Avec ou sans remise
      base: {n: 4, k: 1, order: 0},
      params: r => { const n = r.int(4, 10); return {n, k: r.int(1, Math.min(3, n - 2)), order: r.int(0, 1)}; },
      decimals: 4,
      difficulty: ({n, k}) => score({steps: 3, values: [n, k, k / n, (k / n) ** 2]}),
      verify: ({n, k, order}, v) => v[order ? 1 : 0] === 'Oui' && v[order ? 0 : 1] === 'Non' && Math.abs(v[2] - (k / n) ** 2) < 5e-4,
      build: ({n, k, order}, o) => {
        const p = (k / n) ** 2;
        const withR = S('Avec remise : tirages indépendants ?', 'Oui', ['Oui', 'Non']), without = S('Sans remise : tirages indépendants ?', 'Non', ['Oui', 'Non']);
        return E(o, `Une urne contient <strong>${n} jetons, dont ${k === 1 ? 'un rouge' : k + ' rouges'}</strong>. On tire deux jetons successivement, avec ou sans remise.`,
          [...(order ? [without, withR] : [withR, without]), approx('P(deux rouges) avec remise', p)],
          C('avec remise, la composition de l’urne est la même à chaque tirage : les tirages sont indépendants. Sans remise, le premier tirage modifie l’urne.',
            [`Avec remise : P(RR) = ${k}/${n} × ${k}/${n} = ${k * k}/${n * n} ${exactOrApprox(p)}.`],
            `les tirages avec remise sont indépendants, pas ceux sans remise ; avec remise, P(deux rouges) ${exactOrApprox(p)}.`),
          {title: 'Avec ou sans remise', ...tasks('Indique si les tirages sont indépendants dans chaque cas.', 'Calcule la probabilité d’obtenir deux jetons rouges avec remise.')});
      }
    },
    { // 8. Au moins deux succès sur trois
      base: {ctx: 0, p: 0.6},
      params: r => ({ctx: r.int(0, 2), p: tenth(r)}),
      space: 27, decimals: 3,
      difficulty: ({p}) => bern(4, [p, 1 - p, 3 * p * p * (1 - p), p ** 3, 3 * p * p * (1 - p) + p ** 3]),
      verify: ({p}, v) => Math.abs(v[0] - 3 * p * p * (1 - p)) < 1e-9 && Math.abs(v[1] - p ** 3) < 1e-9 && Math.abs(v[2] - v[0] - v[1]) < 1e-9,
      build: ({ctx, p}, o) => { const q = F(1 - p, 6), two = F(3 * p * p * q, 6), three = F(p ** 3, 6); return E(o, BCTX[ctx](p) + ' On répète l’épreuve <strong>3 fois</strong>, de façon indépendante.',
        [N('Exactement 2 succès', two), N('3 succès', three), N('Au moins 2 succès', F(two + three, 6))],
        C('« au moins deux succès » est la réunion des événements incompatibles « exactement deux » et « trois succès » : on additionne leurs probabilités.',
          [`P(exactement 2) = 3 × ${fr(p)}² × ${fr(q)} = ${fr(two)} ; P(3) = ${fr(p)}³ = ${fr(three)}.`, `P(au moins 2) = ${fr(two)} + ${fr(three)} = ${fr(two + three)}.`],
          `P(exactement 2 succès) = ${fr(two)}, P(3 succès) = ${fr(three)} et P(au moins 2 succès) = ${fr(two + three)}.`),
        tasks('Calcule les probabilités d’exactement 2 et de 3 succès.', 'Déduis-en la probabilité d’au moins 2 succès.')); }
    }
  ]);

  const EVENTS = [
    ['pair', f => Math.floor(f / 2)], ['impair', f => Math.ceil(f / 2)], ['un multiple de 3', f => Math.floor(f / 3)],
    ...[1, 2, 3, 4, 5].map(k => [`inférieur ou égal à ${k}`, () => k]), ...[2, 3, 4, 5, 6].map(k => [`supérieur ou égal à ${k}`, f => f - k + 1])
  ];
  const fair = x => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-9 ? fr(x) : '≈ ' + r3(x));

  register('variables-aleatoires', [
    { // 1. Variable de Bernoulli sur un dé
      base: {faces: 6, ev: 0},
      params: r => ({faces: r.pick([4, 6, 8, 10, 12]), ev: r.int(0, EVENTS.length - 1)}),
      accept: ({faces, ev}) => { const c = EVENTS[ev][1](faces); return c > 0 && c < faces; },
      decimals: 3,
      difficulty: ({faces, ev}) => { const c = EVENTS[ev][1](faces); return score({steps: 3, values: [faces, c, c / faces], decimals: false}); },
      verify: ({faces, ev}, v) => { const c = EVENTS[ev][1](faces); return Math.abs(v[0] - c / faces) < 5e-4 && Math.abs(v[0] + v[1] - 1) < 1e-3 && Math.abs(v[2] - v[0]) < 1e-9; },
      build: ({faces, ev}, o) => {
        const [name, count] = EVENTS[ev], c = count(faces), p = c / faces;
        return E(o, `On lance un dé équilibré à ${faces} faces numérotées de 1 à ${faces}. <strong>X vaut 1 si le résultat est ${name}</strong>, et 0 sinon.`,
          [approx('P(X = 1)', p), approx('P(X = 0)', 1 - p), approx('E(X)', p)],
          C('les issues sont équiprobables : P(X = 1) = nombre d’issues favorables / nombre d’issues. X suit une loi de Bernoulli, donc E(X) = P(X = 1).',
            [`Issues favorables : ${c} sur ${faces}, donc P(X = 1) = ${c}/${faces} ${exactOrApprox(p)} et P(X = 0) = ${faces - c}/${faces} ${exactOrApprox(1 - p)}.`,
             `E(X) = 0 × P(X = 0) + 1 × P(X = 1) = ${c}/${faces}.`],
            `P(X = 1) = ${c}/${faces}, P(X = 0) = ${faces - c}/${faces} et E(X) = ${c}/${faces} (${fair(p)}).`),
          {title: 'Variable de Bernoulli', ...tasks('Calcule P(X = 1) et P(X = 0).', 'Calcule E(X).')});
      }
    },
    { // 2. Loi à trois valeurs
      base: {s: 0, p0: 0.2, p1: 0.5},
      params: r => ({s: r.int(0, 3), p0: r.int(1, 6) / 10, p1: r.int(1, 6) / 10}),
      accept: ({p0, p1}) => p0 + p1 < 0.95,
      decimals: 2,
      difficulty: ({s, p0, p1}) => { const p2 = 1 - p0 - p1; return score({steps: 4, values: [s, s + 2, p0, p1, p2, s * p0 + (s + 1) * p1 + (s + 2) * p2, p1 + p2]}); },
      verify: ({s, p0, p1}, v) => { const p2 = 1 - p0 - p1; return v[0] === 1 && Math.abs(v[1] - (s * p0 + (s + 1) * p1 + (s + 2) * p2)) < 1e-9 && Math.abs(v[2] - p1 - p2) < 1e-9; },
      build: ({s, p0, p1}, o) => {
        const p2 = F(1 - p0 - p1, 6), mean = F(s * p0 + (s + 1) * p1 + (s + 2) * p2, 6);
        const terms = [[s, p0], [s + 1, p1], [s + 2, p2]].filter(([x]) => x !== 0).map(([x, p]) => `${x} × ${fr(p)}`).join(' + ');
        return E(o, `Une variable aléatoire X prend les valeurs ${s}, ${s + 1} et ${s + 2} avec les probabilités respectives <strong>${fr(p0)} ; ${fr(p1)} ; ${fr(p2)}</strong>.`,
          [N('Somme des probabilités', 1), N('Espérance E(X)', mean), N(`P(X ≥ ${s + 1})`, F(p1 + p2, 6))],
          C('les probabilités d’une loi ont pour somme 1 ; l’espérance est la moyenne des valeurs pondérée par leurs probabilités.',
            [`${fr(p0)} + ${fr(p1)} + ${fr(p2)} = 1.`, `E(X) = ${terms} = ${fr(mean)} ; P(X ≥ ${s + 1}) = ${fr(p1)} + ${fr(p2)} = ${fr(p1 + p2)}.`],
            `la loi est bien une loi de probabilité ; E(X) = ${fr(mean)} et P(X ≥ ${s + 1}) = ${fr(p1 + p2)}.`),
          tasks('Vérifie la somme des probabilités.', 'Calcule E(X).', `Calcule P(X ≥ ${s + 1}).`));
      }
    },
    { // 3. Gain moyen d'un jeu
      base: {ctx: 0, loss: 2, gain: 5, p: 0.3, want: 1},
      params: r => {
        // Le signe voulu de l'espérance est tiré d'abord : la réponse à choix reste équilibrée.
        const want = r.int(0, 1), p = tenth(r), loss = r.int(1, 6), t = loss * (1 - p) / p;
        const gain = want ? Math.floor(t) + r.int(1, 6) : r.int(2, Math.max(2, Math.ceil(t) - 1));
        return {ctx: r.int(0, 2), loss, gain, p, want};
      },
      accept: ({loss, gain, p, want}) => { const e = F(gain * p - loss * (1 - p), 6); return gain >= 2 && gain <= 20 && e !== 0 && (e > 0) === (want === 1); },
      decimals: 2,
      difficulty: ({loss, gain, p}) => score({steps: 3, values: [-loss, gain, p, 1 - p, gain * p - loss * (1 - p)]}),
      verify: ({loss, gain, p}, v) => Math.abs(v[0] - p) < 1e-9 && Math.abs(v[1] - (gain * p - loss * (1 - p))) < 1e-9 && v[2] === (v[1] > 0 ? 'Oui' : 'Non'),
      build: ({ctx, loss, gain, p}, o) => {
        const q = F(1 - p, 6), e = F(gain * p - loss * q, 6);
        const intro = ['Le gain X d’un jeu fictif', 'Le gain X d’un jeu de fléchettes fictif', 'Le gain X d’une tombola fictive'][ctx];
        return E(o, `${intro} vaut <strong>${M}${eur(loss)}</strong> avec probabilité ${fr(q)} ou <strong>+${eur(gain)}</strong> avec probabilité ${fr(p)}.`,
          [N('P(gain positif)', p), N('E(X), en €', e), S('Espérance positive ?', e > 0 ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('l’espérance est la moyenne des gains pondérée par leurs probabilités ; elle s’interprète comme un gain moyen sur un grand nombre de parties.',
            [`E(X) = (${M}${loss}) × ${fr(q)} + ${gain} × ${fr(p)} = ${fr(-loss * q)} + ${fr(gain * p)} = ${fr(e)}.`],
            `E(X) = ${eur(e)} : sur un grand nombre de parties, le joueur ${e > 0 ? 'gagne' : 'perd'} en moyenne ${eur(Math.abs(e))} par partie. Cela ne prédit pas le résultat d’une seule partie.`),
          tasks('Donne la probabilité d’un gain positif.', 'Calcule E(X).', 'Indique si l’espérance est positive.'));
      }
    },
    { // 4. Nombre moyen de succès
      base: {ctx: 0, p: 0.4, n: 20},
      params: r => ({ctx: r.int(0, 2), p: tenth(r), n: r.pick([10, 20, 30, 50, 100])}),
      decimals: 1,
      difficulty: ({p, n}) => score({steps: 3, values: [p, 1 - p, n, n * p]}),
      verify: ({p, n}, v) => Math.abs(v[0] - (1 - p)) < 1e-9 && Math.abs(v[1] - p) < 1e-9 && Math.abs(v[2] - n * v[1]) < 1e-9,
      build: ({ctx, p, n}, o) => E(o, `${BCTX[ctx](p)} On note X la variable qui vaut 1 en cas de succès et 0 en cas d’échec <strong>pour un seul essai</strong>. On réalise aussi ${n} essais indépendants de même probabilité.`,
        [N('P(X = 0)', F(1 - p, 6)), N('E(X)', p), N(`Nombre moyen de succès sur ${n} essais`, F(n * p, 6))],
        C('pour une variable de Bernoulli de paramètre p, E(X) = p ; sur n essais indépendants, le nombre moyen de succès vaut n × p.',
          [`P(X = 0) = 1 − ${fr(p)} = ${fr(1 - p)} et E(X) = ${fr(p)}.`, `${n} × ${fr(p)} = ${fr(n * p)}.`],
          `en moyenne, on peut s’attendre à ${fr(n * p)} succès sur ${n} essais ; une série réelle peut s’en écarter.`),
        tasks('Calcule P(X = 0) et E(X).', `Calcule le nombre moyen de succès sur ${n} essais.`))
    },
    { // 5. Jeu favorable ou non
      base: {ctx: 0, gain: 10, loss: 4, p: 0.25, want: 0},
      params: r => {
        const want = r.int(0, 1), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75]), loss = r.int(1, 10), t = loss * (1 - p) / p;
        const gain = want ? Math.floor(t) + r.int(1, 8) : r.int(4, Math.max(4, Math.ceil(t) - 1));
        return {ctx: r.int(0, 1), gain, loss, p, want};
      },
      accept: ({gain, loss, p, want}) => { const e = F(gain * p - loss * (1 - p), 6); return e !== 0 && (e > 0) === (want === 1); },
      decimals: 2,
      difficulty: ({gain, loss, p}) => score({steps: 3, values: [gain, -loss, p, 1 - p, gain * p - loss * (1 - p)]}),
      verify: ({gain, loss, p}, v) => Math.abs(v[0] - p) < 1e-9 && Math.abs(v[1] - (gain * p - loss * (1 - p))) < 1e-9 && v[2] === (v[1] > 0 ? 'Oui' : 'Non'),
      build: ({ctx, gain, loss, p}, o) => {
        const q = F(1 - p, 6), e = F(gain * p - loss * q, 6);
        return E(o, `${ctx ? 'Un jeu de grattage fictif' : 'Un jeu fictif'} permet de gagner <strong>${eur(gain)}</strong> avec probabilité ${fr(p)} ou de perdre <strong>${eur(loss)}</strong> avec probabilité ${fr(q)}.`,
          [N('P(X > 0)', p), N('Espérance, en €', e), S('Favorable au joueur ?', e > 0 ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('on calcule l’espérance du gain X ; le jeu est favorable au joueur si E(X) > 0.',
            [`E(X) = ${gain} × ${fr(p)} − ${loss} × ${fr(q)} = ${fr(gain * p)} − ${fr(loss * q)} = ${fr(e)}.`],
            `E(X) = ${eur(e)} : le jeu est ${e > 0 ? 'favorable' : 'défavorable'} au joueur sur un grand nombre de parties.`),
          {title: 'Jeu favorable ou non ?', ...tasks('Donne P(X > 0).', 'Calcule l’espérance.', 'Conclus.')});
      }
    },
    { // 6. Fréquence observée et effectif attendu
      base: {p: 0.4, dev: -3},
      params: r => ({p: r.int(2, 18) / 20, dev: r.nonZero(1, 8)}),
      decimals: 2,
      difficulty: ({p, dev}) => score({steps: 3, values: [100, p, 100 * p + dev, (100 * p + dev) / 100, dev / 100]}),
      verify: ({p, dev}, v) => Math.abs(v[0] - (100 * p + dev) / 100) < 1e-9 && Math.abs(v[1] - 100 * p) < 1e-9 && Math.abs(v[2] - (v[0] - p)) < 1e-9,
      build: ({p, dev}, o) => {
        const c = Math.round(100 * p + dev), f = c / 100;
        return E(o, `Dans <strong>100 essais</strong> avec une probabilité théorique de succès <strong>p = ${fr(p)}</strong>, on observe <strong>${c} succès</strong>.`,
          [N('Fréquence observée', f), N('Effectif moyen attendu', F(100 * p, 6)), N('Écart f − p', F(f - p, 6))],
          C('la fréquence observée est le nombre de succès divisé par le nombre d’essais ; l’effectif attendu vaut n × p.',
            [`f = ${c}/100 = ${fr(f)} ; 100 × ${fr(p)} = ${fr(100 * p)}.`, `f − p = ${fr(f)} − ${fr(p)} = ${fr(f - p)}.`],
            `la fréquence observée ${fr(f)} est ${f > p ? 'supérieure' : 'inférieure'} à p ; un écart de ${fr(Math.abs(f - p))} relève de la fluctuation d’échantillonnage.`),
          tasks('Calcule la fréquence observée.', 'Calcule l’effectif moyen attendu.', 'Calcule l’écart f − p.'));
      }
    },
    { // 7. Fluctuation d'une fréquence
      base: {n: 50, p: 0.3, dev: 3, q: 0},
      params: r => ({n: r.pick([20, 25, 50, 100]), p: tenth(r), dev: r.nonZero(1, 5), q: r.int(0, 1)}),
      accept: ({n, p, dev}) => { const c = n * p + dev; return Number.isInteger(Math.round(c * 1e6) / 1e6) && c > 0 && c < n; },
      decimals: 2,
      difficulty: ({n, p, dev}) => score({steps: 3, values: [n, p, n * p + dev, (n * p + dev) / n, dev / n]}),
      verify: ({n, p, dev, q}, v) => Math.abs(v[0] - (n * p + dev) / n) < 1e-9 && Math.abs(v[1] - (v[0] - p)) < 1e-9 && v[2] === (q ? 'Non' : 'Oui'),
      build: ({n, p, dev, q}, o) => {
        const c = Math.round(n * p + dev), f = c / n;
        return E(o, `On simule <strong>${n} essais</strong> avec une probabilité théorique de succès <strong>p = ${fr(p)}</strong>. Un échantillon présente <strong>${c} succès</strong>.`,
          [N('Fréquence observée f', f), N('f − p', F(f - p, 6)),
           S(q ? 'La fréquence observée est-elle forcément égale à p ?' : `Un autre échantillon de ${n} essais peut-il donner une fréquence différente ?`, q ? 'Non' : 'Oui', ['Oui', 'Non'])],
          C('la fréquence d’un échantillon fluctue d’un échantillon à l’autre autour de la probabilité théorique.',
            [`f = ${c}/${n} = ${fr(f)} et f − p = ${fr(f)} − ${fr(p)} = ${fr(f - p)}.`],
            `la fréquence observée n’est pas forcément égale à p, et un autre échantillon peut donner une fréquence différente.`),
          tasks('Calcule la fréquence observée.', 'Calcule l’écart f − p.', 'Réponds à la question sur la fluctuation.'));
      }
    },
    { // 8. Comparer deux échantillons
      base: {p: 0.35, d1: 5, d2: 0, want: 1},
      params: r => {
        const want = r.int(0, 1), d1 = r.nonZero(1, 6), m = 2 * Math.abs(d1);
        return {p: r.int(4, 12) / 20, d1, d2: r.sign() * (want ? r.int(1, m - 1) : r.int(m + 1, m + 8)), want};
      },
      accept: ({d1, d2, want}) => Math.abs(d1) / 100 !== Math.abs(d2) / 200 && (Math.abs(d2) / 200 < Math.abs(d1) / 100) === (want === 1),
      decimals: 3,
      difficulty: ({p, d1, d2}) => score({steps: 4, values: [100 * p + d1, 200 * p + d2, p, p + d1 / 100, p + d2 / 200, Math.abs(d1) / 100]}),
      verify: ({p, d1, d2}, v) => Math.abs(v[0] - (p + d1 / 100)) < 1e-9 && Math.abs(v[1] - (p + d2 / 200)) < 1e-9 && v[2] === (Math.abs(v[1] - p) < Math.abs(v[0] - p) ? 'Seconde' : 'Première') && Math.abs(v[3] - Math.abs(v[0] - p)) < 1e-9,
      build: ({p, d1, d2}, o) => {
        const c1 = Math.round(100 * p + d1), c2 = Math.round(200 * p + d2), f1 = c1 / 100, f2 = c2 / 200;
        const second = Math.abs(f2 - p) < Math.abs(f1 - p);
        return E(o, `Deux simulations ont donné <strong>${c1} succès sur 100 essais</strong> et <strong>${c2} succès sur 200 essais</strong>. La probabilité théorique est <strong>p = ${fr(p)}</strong>.`,
          [N('Première fréquence', f1), N('Seconde fréquence', f2), S('La plus proche de p', second ? 'Seconde' : 'Première', ['Première', 'Seconde']), N('Écart absolu de la première fréquence à p', F(Math.abs(f1 - p), 6))],
          C('on calcule chaque fréquence, puis la distance à p de chacune ; la plus proche est celle dont l’écart absolu est le plus petit.',
            [`f₁ = ${c1}/100 = ${fr(f1)} et f₂ = ${c2}/200 = ${fr(f2)}.`, `|f₁ − p| = ${fr(Math.abs(f1 - p))} et |f₂ − p| = ${fr(Math.abs(f2 - p))}.`],
            `la ${second ? 'seconde' : 'première'} fréquence est la plus proche de p. Un échantillon plus grand fluctue en général moins, mais ce n’est pas garanti pour une seule simulation.`),
          tasks('Calcule les deux fréquences.', 'Indique laquelle est la plus proche de p.', 'Calcule l’écart absolu de la première fréquence à p.'));
      }
    }
  ]);
})();
