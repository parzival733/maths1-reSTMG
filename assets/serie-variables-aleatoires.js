/* Série variables-aleatoires : extrait de assets/variants-probabilites.js par tools/build_series.py.
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
            [`Issues favorables : ${c} sur ${faces}, donc P(X = 1) = ${simplified(c, faces)} ${exactOrApprox(p)} et P(X = 0) = ${simplified(faces - c, faces)} ${exactOrApprox(1 - p)}.`,
             `E(X) = 0 × P(X = 0) + 1 × P(X = 1) = ${frac(c, faces)}.`],
            `P(X = 1) = ${frac(c, faces)}, P(X = 0) = ${frac(faces - c, faces)} et E(X) = ${frac(c, faces)} (${fair(p)}).`),
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
            `la fréquence observée ${fr(f)} est ${f > p ? 'supérieure' : 'inférieure'} à p ; un écart de ${fr(Math.abs(f - p))} peut s’expliquer par la fluctuation d’échantillonnage.`),
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
  V.illustrate('variables-aleatoires', [null,
    ({s, p0, p1}) => ({e: FG.statistiques('Loi de X : un bâton par valeur, de hauteur égale à sa probabilité').diagramme_batons([s, s + 1, s + 2], [p0, p1, F(1 - p0 - p1, 6)], {nom_x: 'valeur de X', nom_y: 'probabilité'}).description()}),
    null, null, null, null, null, null
  ]);
})();
