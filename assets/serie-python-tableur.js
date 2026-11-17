/* Série python-tableur : extrait de assets/variants-donnees.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
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
          C(`${dir ? 'diminuer' : 'augmenter'} de t % revient à multiplier par 1 ${dir ? M : '+'} t/100 ; dans le tableur, une cellule affichée en pourcentage contient déjà t/100 (15 % vaut 0,15), d’où le facteur (1 ${dir ? M : '+'} B2). Des références relatives se décalent lors de la recopie vers le bas.`,
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
  /* ---------- Figures : calculées avec les paramètres de chaque variante ---------- */
  const FG = window.Figures;
})();
