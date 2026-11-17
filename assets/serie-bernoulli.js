/* Série bernoulli : extrait de assets/variants-probabilites.js par tools/build_series.py.
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

  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, d4 = x => fr(F(x, 4));
  /* Arbre à deux niveaux : A ou non A, puis B ou non B ; `complet` écrit les compléments et le poids des chemins vers B. */
  const arbreFig = (titre, noms, pA, pBA, pBnA, complet) => { const [A, nA, B, nB] = noms;
    const branche = (nom, p, q) => ({nom, p: p == null ? '?' : d4(p), enfants: [{nom: B, p: d4(q), feuille: complet ? '→ ' + d4(p * q) : undefined}, {nom: nB, p: complet ? d4(1 - q) : '?'}]});
    return FG.arbre(titre, [branche(A, pA, pBA), branche(nA, complet ? 1 - pA : null, pBnA)], Object.assign({largeur: 340}, complet ? {chemins: [[A, B], [nA, B]]} : {})).description(); };
  /* Arbre de n essais indépendants : S pour « succès » (probabilité p), E pour « échec ». */
  const essais = (p, n) => (n ? [{nom: 'S', p: d4(p), enfants: essais(p, n - 1)}, {nom: 'E', p: d4(1 - p), enfants: essais(p, n - 1)}] : undefined);
  const chemins = (n, garder) => { let tous = [[]];
    for (let i = 0; i < n; i++) tous = tous.flatMap(c => [c.concat('S'), c.concat('E')]);
    return tous.filter(c => garder(c.filter(x => x === 'S').length)); };
  const essaisFig = (titre, p, n, garder) => ({c: FG.arbre(titre, essais(p, n), {chemins: chemins(n, garder), largeur: 340, hauteur: n > 2 ? 300 : 220}).description()});
  V.illustrate('bernoulli', [null,
    ({p}) => essaisFig('Arbre des deux essais : en trait épais, les deux chemins avec exactement un succès', p, 2, k => k === 1),
    null,
    ({p}) => essaisFig('Arbre des trois essais : en trait épais, les trois chemins avec exactement deux succès', p, 3, k => k === 2),
    null, null, null,
    ({p}) => essaisFig('Arbre des trois essais : en trait épais, les quatre chemins avec au moins deux succès', p, 3, k => k >= 2)
  ]);
})();
