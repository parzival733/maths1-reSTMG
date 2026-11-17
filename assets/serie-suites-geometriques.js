/* Série suites-geometriques : extrait de assets/variants-suites.js par tools/build_series.py.
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
          [...[1, 2, 3].map(i => ({...N(w(i), F(x[i - 1], 6), undefined, money ? 2 : undefined),
            ...(money ? {unit: '€'} : {})})), N('Raison q', q)],
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
  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures, {frame} = V;
  /* Points (n ; uₙ) d'une suite arithmétique de premier terme a et de raison r, du rang 0 au rang N. */
  const pointsFig = (titre, a, r, N) => ({c: FG.repere(titre, frame([N + 0.6], [a, a + r * N], {nom_x: 'n', nom_y: 'uₙ'})).suite_points(`(${a})+(${r})*n`, 0, N).description()});
  /* Deux croissances sur le même repère : ajout constant (ronds) et multiplication constante (croix). */
  const comparerFig = (a, q, r, R, noms) => { const g = Array.from({length: R + 1}, (_, n) => [n, a * q ** n]);
    return {c: FG.repere(`Les deux suites du rang 0 au rang ${R} : ajout constant en ronds, multiplication constante en croix`, frame([R + 0.6], [a + r * R, a * q ** R], {nom_x: 'n', nom_y: 'valeur'}))
      .suite_points(`(${a})+(${r})*n`, 0, R).nuage(g, {forme: 'croix'}).legende([{forme: 'rond', texte: noms[0]}, {forme: 'croix', texte: noms[1]}]).description()}; };
  V.illustrate('suites-geometriques', [null, null, null, null, null, null,
    ({a, q, r, R}) => comparerFig(a, q, r, R, ['Aₙ', 'Gₙ']),
    ({v, t, n}) => { const q = 1 - t / 100, pts = Array.from({length: n + 3}, (_, k) => [k, v * q ** k]);
      return {c: FG.repere(`Valeur année après année : multipliée par ${fr(q)} à chaque rang, les points ne sont pas alignés`, frame([n + 2.6], [v], {nom_x: 'année', nom_y: 'valeur (€)'})).nuage(pts).description()}; }
  ]);
})();
