/* Série t-outils : extrait de assets/terminale-exercices.js par tools/build_series.py.
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
    't-outils': [
      T({ // Compteur et accumulateur
        base: {kind: 0, start: 1, n: 4},
        params: r => ({kind: r.int(0, 2), start: r.int(0, 2), n: r.int(3, 9)}),
        difficulty: ({kind, start, n}) => { const f = [k => k * k, k => k, k => 2 * k + 1][kind]; let s = 0; for (let k = start; k <= n; k++) s += f(k); return score({steps: 3, values: [n, s]}); },
        verify: ({kind, start, n}, v) => { const f = [k => k * k, k => k, k => 2 * k + 1][kind]; let s = 0, c = 0; for (let k = start; k <= n; k++) { s += f(k); c++; } return v[0] === c && v[1] === s; },
        build: ({kind, start, n}) => {
          const f = [k => k * k, k => k, k => 2 * k + 1][kind], e = ['k*k', 'k', '2*k + 1'][kind], terms = [];
          let s = 0; for (let k = start; k <= n; k++) { terms.push(f(k)); s += f(k); }
          return item('Compteur et accumulateur', `Python : ${code('s = 0')}, puis ${code(`for k in range(${start}, ${n + 1}): s += ${e}`)}.`,
            [Q('Nombre de passages', n + 1 - start), Q('Valeur finale de s', s)],
            C(`range(${start}, ${n + 1}) fournit les entiers de ${start} à ${n} (la borne de fin est exclue) ; s accumule les valeurs successives.`,
              [`Valeurs ajoutées : ${terms.join(' ; ')}, soit ${n + 1 - start} passages.`, `s = ${terms.join(' + ')} = ${s}.`],
              `la boucle fait ${n + 1 - start} passages et s vaut ${s} à la fin.`),
            'La borne de fin de range est exclue. Initialise une somme à zéro.');
        }
      }),
      T({ // Ordre des instructions
        base: {a: 3, n: 4, q: 2, order: 0},
        params: r => ({a: r.int(2, 9), n: r.int(3, 6), q: r.pick([2, 3]), order: r.int(0, 1)}),
        accept: ({a, n, q}) => a * q ** n <= 10000,
        difficulty: ({a, n, q}) => score({steps: 3, values: [a, n, a * q ** n, a * (q ** (n + 1) - 1) / (q - 1)]}),
        verify: ({a, n, q, order}, v) => { let u = a, s = 0; for (let j = 0; j < n; j++) { if (order) { u *= q; s += u; } else { s += u; u *= q; } } return v[0] === s && v[1] === u; },
        build: ({a, n, q, order}) => {
          let u = a, s = 0; const added = [];
          for (let j = 0; j < n; j++) { if (order) { u *= q; s += u; added.push(u); } else { s += u; added.push(u); u *= q; } }
          const first = order ? code(`u = ${q}*u`) : code('s = s + u'), second = order ? code('s = s + u') : code(`u = ${q}*u`);
          return item('Ordre des instructions', `Initialement u = ${a} et s = 0. On répète ${n} fois : d’abord ${first}, puis ${second}.`,
            [Q('s final', s), Q('u final', u)],
            C('on suit les variables passage par passage, dans l’ordre exact des instructions (un tableau passage / valeur ajoutée / nouvelle valeur de u aide).',
              [`Valeurs ajoutées à s : ${added.join(' ; ')}.`, `s = ${added.join(' + ')} = ${s} et u = ${a} × ${q}<sup>${n}</sup> = ${u}.`],
              order ? `s = ${s} : chaque nouvelle valeur de u est ajoutée après la multiplication ; u vaut ${u}.` : `s = ${s} : la dernière valeur de u (${u}) n’a pas été ajoutée.`),
            'Fais un tableau avec trois colonnes : passage, valeur ajoutée, nouvelle valeur de u.');
        }
      }),
      T({ // Construire la ligne suivante de Pascal
        base: {n: 4, k1: 1, k2: 2},
        params: r => { const n = r.int(3, 9), [k1, k2] = r.pickDistinct(Array.from({length: n}, (_, j) => j + 1), 2).sort((a, b) => a - b); return {n, k1, k2}; },
        difficulty: ({n, k1, k2}) => score({steps: 3, values: [n + 1, binom(n + 1, k1), binom(n + 1, k2)]}),
        verify: ({n, k1, k2}, v) => v[0] === binom(n, k1 - 1) + binom(n, k1) && v[1] === binom(n, k2 - 1) + binom(n, k2),
        build: ({n, k1, k2}) => {
          const row = Array.from({length: n + 1}, (_, j) => binom(n, j)), next = Array.from({length: n + 2}, (_, j) => binom(n + 1, j));
          return item('Construire la ligne suivante de Pascal', `On a construit la ligne n = ${n} du triangle de Pascal : ${row.join(' ; ')}. On veut la ligne n = ${n + 1}, dont les positions commencent en k = 0.`,
            [Q(`Coefficient en k = ${k1}`, binom(n + 1, k1)), Q(`Coefficient en k = ${k2}`, binom(n + 1, k2))],
            C('la nouvelle ligne commence et finit par 1 ; chaque coefficient intérieur est la somme des deux coefficients voisins de la ligne précédente.',
              [`Ligne ${n + 1} : ${next.join(' ; ')}.`, `En k = ${k1} : ${binom(n, k1 - 1)} + ${binom(n, k1)} = ${binom(n + 1, k1)} ; en k = ${k2} : ${binom(n, k2 - 1)} + ${binom(n, k2)} = ${binom(n + 1, k2)}.`],
              `les coefficients cherchés valent ${binom(n + 1, k1)} et ${binom(n + 1, k2)}.`),
            'Construis une nouvelle liste : modifier l’ancienne pendant sa lecture peut corrompre les sommes.');
        }
      }),
      T({ // Recopie dans le tableur
        base: {v: 110, kind: 0, coef: 1.1},
        params: r => ({v: 10 * r.int(5, 30), kind: r.int(0, 1), coef: r.pick([1.05, 1.1, 1.2, 0.9, 0.95])}),
        difficulty: ({v, coef}) => score({steps: 2, values: [v, coef, v * coef]}),
        verify: ({v, kind, coef}, x) => x[0] === (kind ? '=B2*C2' : '=B2*$E$1') && close(x[1], v * coef),
        build: ({v, kind, coef}) => {
          const formula = kind ? '=B2*C2' : '=B2*$E$1';
          const intro = kind
            ? `B2 contient ${v} et C2 contient ${fr(coef)}. En B3, on veut multiplier B2 par le coefficient de la même ligne, écrit dans la colonne C, puis recopier vers le bas : chaque ligne utilise son propre coefficient.`
            : `B2 contient ${v} et E1 contient ${fr(coef)}. En B3, on veut multiplier B2 par le coefficient de E1, puis recopier vers le bas en gardant toujours E1.`;
          return item('Recopie dans le tableur', intro,
            [choice('Formule en B3', formula, ['=B2*$E$1', '=B2*E1', '=$B$2*E1', '=B2*C2'], {shuffle: true}), Q('Valeur de B3', v * coef)],
            C('une référence relative (B2) se décale lors de la recopie ; une référence absolue ($E$1) reste fixe.',
              [kind ? 'Le coefficient change à chaque ligne : on garde des références relatives, =B2*C2 devenant =B3*C3 en B4.' : 'Le coefficient est commun à toutes les lignes : on fige E1 avec $E$1 ; recopiée en B4, la formule devient =B3*$E$1.',
               `B3 = ${v} × ${fr(coef)} = ${fr(F(v * coef, 6))}.`],
            `on écrit ${formula} en B3, qui vaut ${fr(F(v * coef, 6))}.`),
            kind ? 'Chaque ligne a son coefficient : aucune référence ne doit être figée.' : 'Fige le coefficient commun, pas le terme précédent.');
        }
      }),
      T({ // Filtrer avec deux conditions
        base: {c: 1, limit: 2, par: 0, op: 0},
        params: r => { const c = r.int(1, 20); return {c, limit: c + r.int(0, 3), par: r.int(0, 1), op: r.int(0, 1)}; },
        accept: ({c, limit, par, op}) => { const l = Array.from({length: 6}, (_, i) => c + i), ok = x => (x % 2 === 0) === (par === 0), f = l.filter(x => (op ? x > limit || ok(x) : x > limit && ok(x))); return f.length >= 1 && f.length <= 5; },
        difficulty: ({c}) => score({steps: 3, values: [c, c + 5, 3 * c + 9]}),
        verify: ({c, limit, par, op}, v) => { const l = Array.from({length: 6}, (_, i) => c + i), ok = x => (x % 2 === 0) === (par === 0), f = l.filter(x => (op ? x > limit || ok(x) : x > limit && ok(x))); return v[0] === f.length && v[1] === f.reduce((a, b) => a + b, 0); },
        build: ({c, limit, par, op}) => {
          const l = Array.from({length: 6}, (_, i) => c + i), ok = x => (x % 2 === 0) === (par === 0), f = l.filter(x => (op ? x > limit || ok(x) : x > limit && ok(x)));
          const cond = `x > ${limit} ${op ? 'or' : 'and'} x % 2 == ${par ? 1 : 0}`, name = par ? 'impaires' : 'paires';
          return item('Filtrer avec deux conditions', `La liste est [${l.join(', ')}]. On garde les valeurs strictement supérieures à ${limit} ${op ? 'OU' : 'ET'} ${name}.`,
            [Q('Nombre de valeurs gardées', f.length), Q('Somme des valeurs gardées', f.reduce((a, b) => a + b, 0))],
            C(`en Python, la condition s’écrit ${code(cond)} ; avec ${op ? 'or, une seule des deux conditions suffit' : 'and, les deux conditions doivent être vraies en même temps'}.`,
              [`Valeurs conservées : ${f.join(' ; ')}.`],
              `on garde ${f.length} valeur${f.length > 1 ? 's' : ''}, de somme ${f.reduce((a, b) => a + b, 0)}.`),
            op ? 'Avec OU, une valeur est gardée dès qu’elle vérifie l’une des deux conditions.' : 'Une valeur doit respecter les deux conditions simultanément ; ET ne signifie pas OU.');
        }
      }),
      T({ // Simuler une Bernoulli
        base: {p: 0.3, draws: [0.1, 0.2, 0.4, 0.5, 0.7, 0.9]},
        params: r => { const p = r.int(2, 8) / 10; return {p, draws: r.pickDistinct([0.05, 0.1, 0.15, 0.2, 0.3, 0.35, 0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.8, 0.9, 0.95, p], 6).sort((a, b) => a - b)}; },
        accept: ({p, draws}) => { const n = draws.filter(x => x < p).length; return n >= 1 && n <= 5; },
        difficulty: ({p}) => score({steps: 2, values: [p, 6]}),
        verify: ({p, draws}, v) => v[0] === draws.filter(x => x < p).length && close(v[1], v[0] / 6),
        build: ({p, draws}) => {
          const won = draws.filter(x => x < p), equal = draws.some(x => x === p);
          return item('Simuler une Bernoulli', `Probabilité p = ${fr(p)}. Pour lire l’algorithme, on fournit six tirages U : ${draws.map(fr).join(' ; ')}. Il y a succès lorsque U < p.`,
            [Q('Nombre de succès', won.length), Q('Fréquence observée', won.length / 6)],
            C('on compte les tirages strictement inférieurs à p ; la fréquence est ce nombre divisé par le nombre de tirages.',
              [`Tirages inférieurs à ${fr(p)} : ${won.map(fr).join(' ; ')}${equal ? ` (le tirage égal à ${fr(p)} n’est pas compté)` : ''}.`, `Fréquence : ${won.length}/6 ${eq(won.length / 6)}.`],
              `on obtient ${won.length} succès, soit une fréquence ${eq(won.length / 6)}. Une vraie simulation utilise un générateur pseudo-aléatoire.`),
            'Lis le symbole < : une valeur égale à p n’est pas comptée par cet algorithme.');
        }
      })
    ]
  };
  // Bruits de moyenne nulle, lois à trois valeurs et décalages d'échantillons.
  const PATTERNS = [[1, -1, -1, 1], [-1, 1, 1, -1], [2, -1, -2, 1], [0, 1, -1, 0]];
  const LAWS = [[0.2, 0.5, 0.3], [0.1, 0.6, 0.3], [0.3, 0.3, 0.4], [0.25, 0.5, 0.25], [0.4, 0.4, 0.2]];
  const OFFSETS = [[0, 1, -1, 2], [0, 2, -1, 1], [1, 0, 2, -1]];

  const basics = {
    't-outils': ['Suis les variables ligne par ligne, sans changer l’ordre des instructions.', 'On part de s = 0 et on ajoute 3 deux fois. Que vaut s ?', '6', 'Les valeurs successives sont 0, puis 3, puis la valeur finale.']
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
