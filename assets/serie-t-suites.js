/* Série t-suites : extrait de assets/terminale-exercices.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant Terminale.');
  const {N, S, C, F, score, fmt, productSignTable, variationTable, signTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, times, poly, affine, frac, pct, eur, MINUS: M} = fmt;
  // Valeur exacte, ou arrondie au millième (ou à `digits` décimales).
  const Q = (label, value, digits = 3) => N(label, F(value, 9), 1e-8, digits);
  const choice = (label, answer, options, settings) => S(label, answer, options, settings);
  const r3 = (x, d = 3) => Math.round(x * 10 ** d + (x >= 0 ? 1e-9 : -1e-9)) / 10 ** d;
  const eq = (x, d = 3) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '= ' + fr(x) : '≈ ' + fr(r3(x, d)));
  const sub = k => String(k).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
  // Quotient n/d écrit sans « /1 ».
  const over = (n, d) => (d === 1 ? fr(n) : fr(n) + '/' + d);
  const tenth = r => r.int(1, 9) / 10;
  const code = text => '<code>' + text + '</code>';
  // Somme écrite sans « + − » : addAll([3, −2, 5]) → « 3 − 2 + 5 ».
  const addAll = list => list.map((x, i) => (i ? sg(x) : fr(x))).join('');
  const binom = (n, k) => {
    if (k < 0 || k > n) return 0;
    let v = 1;
    for (let j = 1; j <= Math.min(k, n - k); j++) v = v * (n - j + 1) / j;
    return Math.round(v);
  };
  const mass = (n, p, k) => binom(n, k) * p ** k * (1 - p) ** (n - k);
  const cumulative = (n, p, k) => { let s = 0; for (let j = 0; j <= k; j++) s += mass(n, p, j); return s; };
  const TASKS = ['Renseigne chaque champ. Pour un résultat non exact, arrondis au millième, sauf indication contraire. La calculatrice peut servir à contrôler les calculs.'];
  const item = (title, statement, fields, correction, hint) => ({
    title, statement, fields, correction: Array.isArray(correction) ? correction : [correction],
    hint, level: 'Terminale STMG', tasks: TASKS
  });
  // Les nombres de Terminale restent raisonnables : au plus 100 000 en valeur absolue.
  const T = model => ({limit: 100000, decimals: 6, ...model});
  const close = (a, b, eps = 1e-7) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));

  const models = {
    't-suites': [
      T({ // Moyenne arithmétique
        base: {a: 3, r: 3},
        params: r => ({a: r.int(-10, 30), r: r.nonZero(2, 15)}),
        accept: ({a, r}) => a !== 0 && a + 2 * r !== 0 && a + r !== 0,
        difficulty: ({a, r}) => score({steps: 2, values: [a, a + 2 * r, a + r, r]}),
        verify: ({a, r}, v) => v[0] - a === (a + 2 * r) - v[0] && v[1] === v[0] - a,
        build: ({a, r}) => { const b = a + 2 * r, m = a + r; return item('Moyenne arithmétique', `Les nombres ${fr(a)}, m et ${fr(b)} sont trois termes consécutifs d’une suite arithmétique.`,
          [Q('m', m), Q('Raison', r)],
          C('dans une suite arithmétique, le terme du milieu est la moyenne arithmétique de ses deux voisins : m = (a + b)/2.',
            [`m = (${fr(a)}${sg(b)})/2 = ${fr(m)} ; la raison vaut ${diff(m, a)} = ${fr(r)}.`],
            `m = ${fr(m)} et la raison vaut ${fr(r)} : on passe de ${fr(a)} à ${fr(m)} puis à ${fr(b)} en ajoutant ${fr(r)}.`),
          'Les deux augmentations doivent être égales. Calcule le milieu des deux nombres connus.'); }
      }),
      T({ // Moyenne géométrique
        base: {a: 3, q: 3},
        params: r => ({a: r.int(2, 20), q: r.pick([1.5, 2, 2.5, 3, 4, 5])}),
        accept: ({a, q}) => a * q * q <= 1000 && Number.isInteger(a * q) && Number.isInteger(a * q * q),
        difficulty: ({q}) => score({steps: 2, values: [q]}),
        verify: ({a, q}, v) => v[0] * v[0] === a * a * q * q && v[0] > 0 && v[1] * a === v[0],
        build: ({a, q}) => { const b = a * q * q, m = a * q; return item('Moyenne géométrique', `Les nombres positifs ${a}, m et ${b} sont trois termes consécutifs d’une suite géométrique.`,
          [Q('m positif', m), Q('Raison positive', q)],
          C('dans une suite géométrique à termes positifs, le terme du milieu est la moyenne géométrique de ses voisins : m² = a × b.',
            [`m² = ${a} × ${fr(b)} = ${fr(a * b)}, donc m = √${fr(a * b)} = ${fr(m)} ; puis q = ${fr(m)}/${a} = ${fr(q)}.`],
            `m = ${fr(m)} et la raison vaut ${fr(q)}.`),
          'Le terme du milieu vérifie m² = premier × dernier.'); }
      }),
      T({ // Somme arithmétique et rangs
        base: {a: 25, r: 3, n: 6},
        params: r => ({a: r.int(5, 60), r: r.nonZero(2, 9), n: r.int(5, 12)}),
        accept: ({a, r, n}) => a + n * r > 0,
        difficulty: ({a, r, n}) => score({steps: 3, values: [a, r, n, a + n * r, (n + 1) * (2 * a + n * r) / 2]}),
        verify: ({a, r, n}, v) => v[0] === a + n * r && v[1] === n + 1 && v[2] === Array.from({length: n + 1}, (_, k) => a + k * r).reduce((x, y) => x + y, 0),
        build: ({a, r, n}) => { const last = a + n * r, sum = (n + 1) * (a + last) / 2; return item('Somme arithmétique et rangs', `u₀ = ${a} et uₙ₊₁ = uₙ${sg(r)}. On additionne les termes du rang 0 au rang ${n}, bornes comprises.`,
          [Q(`u${sub(n)}`, last), Q('Nombre de termes', n + 1), Q('Somme', sum)],
          C('pour une suite arithmétique, uₙ = u₀ + nr, et la somme de termes consécutifs vaut nombre de termes × (premier + dernier)/2.',
            [`u${sub(n)} = ${a} + ${n} × ${pa(r)} = ${fr(last)}. Du rang 0 au rang ${n}, il y a ${n + 1} termes.`, `S = ${last ? `${n + 1} × (${a}${sg(last)})/2` : `${n + 1} × ${a}/2`} = ${fr(sum)}.`],
            `u${sub(n)} = ${fr(last)}, il y a ${n + 1} termes et leur somme vaut ${fr(sum)}.`),
          'Compte les termes avant de choisir la formule : de 0 à n, il y en a n + 1.'); }
      }),
      T({ // Somme géométrique
        base: {a: 3, q: 2, n: 4},
        params: r => ({a: r.int(2, 15), q: r.pick([2, 3]), n: r.int(3, 6)}),
        accept: ({a, q, n}) => a * q ** (n - 1) <= 2000,
        difficulty: ({a, q, n}) => score({steps: 3, values: [a, q, n, a * q ** (n - 1), a * (q ** n - 1) / (q - 1)]}),
        verify: ({a, q, n}, v) => v[0] === a * q ** (n - 1) && v[1] === Array.from({length: n}, (_, k) => a * q ** k).reduce((x, y) => x + y, 0),
        build: ({a, q, n}) => { const last = a * q ** (n - 1), sum = a * (q ** n - 1) / (q - 1); return item('Somme géométrique', `u₀ = ${a} et la suite est géométrique de raison q = ${q}. On additionne les ${n} premiers termes, de u₀ à u${sub(n - 1)}.`,
          [Q('Dernier terme additionné', last), Q('Somme', sum)],
          C('le terme de rang k vaut u₀ × q<sup>k</sup> ; la somme des n premiers termes vaut u₀ × (q<sup>n</sup> − 1)/(q − 1).',
            [`Dernier terme : ${a} × ${q}<sup>${n - 1}</sup> = ${fr(last)}.`, `S = ${a} × (${q}<sup>${n}</sup> − 1)/(${q} − 1) = ${a} × ${q ** n - 1}/${q - 1} = ${fr(sum)}.`],
            `le dernier terme additionné est ${fr(last)} et la somme vaut ${fr(sum)}.`),
          'Avec n termes, la puissance de la formule de somme est n ; celle du dernier terme est n − 1.'); }
      }),
      T({ // Lire le symbole somme
        base: {kind: 0, m: 1, n: 4},
        params: r => { const m = r.int(1, 3); return {kind: r.int(0, 2), m, n: r.int(m + 3, 12)}; },
        difficulty: ({kind, m, n}) => { const f = [k => k * k, k => k, k => 2 * k - 1][kind]; let s = 0; for (let k = m; k <= n; k++) s += f(k); return score({steps: 2, values: [n, f(n), s]}); },
        verify: ({kind, m, n}, v) => { const f = [k => k * k, k => k, k => 2 * k - 1][kind]; let s = 0; for (let k = m; k <= n; k++) s += f(k); return v[0] === f(n) && v[1] === s; },
        build: ({kind, m, n}) => {
          const f = [k => k * k, k => k, k => 2 * k - 1][kind], txt = ['k²', 'k', '(2k − 1)'][kind];
          const terms = []; let s = 0; for (let k = m; k <= n; k++) { terms.push(f(k)); s += f(k); }
          return item('Lire le symbole somme', `S = ∑<sub>k = ${m}</sub><sup>${n}</sup> ${txt}, c’est-à-dire la somme des nombres ${txt} pour k allant de ${m} à ${n}.`,
            [Q('Dernier nombre additionné', f(n)), Q('Somme S', s)],
            C('on remplace k par chaque entier de ' + m + ' à ' + n + ' et on additionne les nombres obtenus.',
              [`S = ${terms.join(' + ')} = ${fr(s)}.`],
              `le dernier nombre additionné est ${f(n)} (pour k = ${n}) et S = ${fr(s)}.`),
            kind === 0 ? 'Développe la notation en une addition. Il ne s’agit pas du carré de la somme.' : 'Développe la notation en une addition, en commençant à la borne inférieure.');
        }
      }),
      T({ // Versements en fin de période
        base: {d: 110, t: 3, n: 4},
        params: r => ({d: 10 * r.int(5, 50), t: r.int(1, 5), n: r.int(3, 6)}),
        difficulty: ({d, t, n}) => { const q = 1 + t / 100; return score({steps: 4, values: [d, q, n * d, d * (q ** n - 1) / (q - 1)]}); },
        verify: ({d, t, n}, v) => { let c = 0; for (let j = 0; j < n; j++) c = c * (1 + t / 100) + d; return v[0] === n * d && close(v[1], c); },
        build: ({d, t, n}) => {
          const q = 1 + t / 100, cap = d * (q ** n - 1) / (q - 1);
          return item('Versements en fin de période', `Modèle fictif sans frais : capital initial nul, taux annuel de ${t} %, puis versement de ${eur(d)} en fin de chaque année, pendant ${n} ans.`,
            [Q('Total des versements, en €', n * d, 2), Q('Capital juste après le dernier versement, au centime', cap, 2)],
            C(`chaque versement rapporte ${t} % par année complète de placement ; le premier est multiplié par ${fr(q)}<sup>${n - 1}</sup>, le dernier n’a pas encore rapporté d’intérêts. On reconnaît une somme géométrique.`,
              [`Total versé : ${n} × ${d} = ${fr(n * d)} €.`, `Capital : ${d} × (1 + ${fr(q)} + … + ${fr(q)}<sup>${n - 1}</sup>) = ${d} × (${fr(q)}<sup>${n}</sup> − 1)/(${fr(q)} − 1) ≈ ${fr(r3(cap, 2))} €.`],
              `après le dernier versement, le capital vaut environ ${eur(r3(cap, 2))}, dont ${eur(r3(cap - n * d, 2))} d’intérêts.`),
            'Place les versements sur une frise : celui de la dernière année est multiplié par 1.');
        }
      })
    ],
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-suites': ['Distingue un terme, une raison et une somme.', 'Additionne 10 + 20 + 30.', '60', 'Regroupe 10 et 30, puis ajoute 20.'],
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  /* Figures calculées avec les paramètres de chaque variante. Celles des séries de statistiques
     et de probabilités sont dans assets/terminale-figures.js. */
  const FG = window.Figures;
  if (FG) {
  }
  window.TerminaleExercises = {slugs: Object.keys(models), count: 6, binom, mass, cumulative, PATTERNS, LAWS};
  window.ExerciseCoaching = {
    context: exercise => (exercise ? exercise.statement : ''),
    build: (slug, index, exercise) => {
      if (!basics[slug] || !exercise) return null;
      const b = basics[slug];
      return {hints: [b[0], clean(exercise.hint), 'Dans cet essai : ' + clean(exercise.statement)],
        diagnose: 'Piste à vérifier : ' + clean(exercise.hint),
        bridge: {q: 'Exemple indépendant : ' + b[1], a: b[2], help: b[3]}};
    }
  };
  if (typeof document !== 'undefined') {
    const root = document.querySelector('[data-terminale-chapter]');
    const node = document.getElementById('exercise-data');
    if (root && node) {
      const slug = root.dataset.terminaleChapter;
      if (!models[slug]) throw new Error('Chapitre Terminale inconnu : ' + slug);
      node.textContent = JSON.stringify({slug, exercises: models[slug].map((_, i) => V.original(slug, i))});
    }
  }
})();
