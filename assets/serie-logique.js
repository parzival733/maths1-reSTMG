/* Série logique : extrait de assets/variants-reperes.js par tools/build_series.py.
   Ne pas modifier ce fichier : corriger la source, puis relancer l'outil. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  const {register, E, N, S, C, F, score, fmt, productSignTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, times, poly, fact, affine, frac, gcd, pct, eur, MINUS: M} = fmt;
  const tasks = (...list) => ({tasks: list});
  const SUP = {'-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'};
  const sup = n => String(n).split('').map(c => SUP[c]).join('');
  const places = x => { const t = String(F(x, 9)); return t.includes('.') ? t.split('.')[1].length : 0; };
  const red = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const decimalDen = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const approx2 = (label, value) => N(label, F(value, 6), 0.001, 2);



  // Propositions sur les réels : texte, valeur de vérité et justification.
  const PROPS = [
    k => ['Pour tout réel x, x² ≥ 0', true, 'le carré d’un réel est toujours positif ou nul'],
    k => [`Il existe un réel x tel que x² = ${k * k}`, true, `x = ${k} convient`],
    k => [`Pour tout réel x, x² + ${k} > 0`, true, `x² ≥ 0, donc x² + ${k} ≥ ${k} > 0`],
    k => [`Il existe un réel x tel que ${k}x + 1 = 0`, true, `x = ${M}1/${k} convient`],
    k => [`Pour tout réel x, (x − ${k})² ≥ 0`, true, 'un carré est toujours positif ou nul'],
    k => ['Il existe un réel x tel que x² = 0', true, 'x = 0 convient'],
    k => ['Pour tout réel x, x² > 0', false, 'x = 0 est un contre-exemple, car 0² = 0'],
    k => [`Il existe un réel x tel que x² = ${M}${k}`, false, 'un carré ne peut pas être négatif'],
    k => [`Pour tout réel x, (x + ${k})² = x² + ${k * k}`, false, `pour x = 1, (1 + ${k})² = ${(1 + k) ** 2} alors que 1 + ${k * k} = ${1 + k * k}`],
    k => [`Pour tout réel x, x² ≥ ${k}`, false, `x = 0 est un contre-exemple, car 0 < ${k}`],
    k => [`Il existe un réel x tel que x² + ${k} = 0`, false, `x² + ${k} ≥ ${k} > 0 pour tout x`],
    k => [`Pour tout réel x > 0, x > ${k}`, false, `x = 1 est un contre-exemple`]
  ];
  const EXACT = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [1, 8], [3, 8]], ROUND = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 7], [1, 9], [2, 9]];

  register('logique', [
    { // 1. Intersection, union et appartenance
      base: {A: [1, 2, 3], B: [3, 4], t: 2},
      params: r => {
        const A = r.pickDistinct([1, 2, 3, 4, 5, 6, 7, 8, 9], r.int(3, 4)).sort((x, y) => x - y);
        const B = r.pickDistinct([1, 2, 3, 4, 5, 6, 7, 8, 9], r.int(2, 4)).sort((x, y) => x - y);
        const want = r.int(0, 1), pool = want ? B : [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => !B.includes(x));
        return {A, B, t: r.pick(pool)};
      },
      accept: ({A, B}) => A.some(x => B.includes(x)) && JSON.stringify(A) !== JSON.stringify(B),
      difficulty: ({A, B}) => score({steps: 3, values: [A.length, B.length, A.filter(x => B.includes(x)).length, new Set([...A, ...B]).size, ...A, ...B]}),
      verify: ({A, B, t}, v) => v[0] === A.filter(x => B.includes(x)).length && v[0] + v[1] === A.length + B.length && v[2] === (B.includes(t) ? 'Oui' : 'Non'),
      build: ({A, B, t}, o) => {
        const I = A.filter(x => B.includes(x)), U = [...new Set([...A, ...B])].sort((x, y) => x - y), inB = B.includes(t);
        return E(o, `On considère <strong>A = {${A.join(' ; ')}}</strong> et <strong>B = {${B.join(' ; ')}}</strong>.`,
          [N('Card(A ∩ B)', I.length), N('Card(A ∪ B)', U.length), S(`${t} ∈ B ?`, inB ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('A ∩ B contient les éléments communs aux deux ensembles ; A ∪ B contient les éléments de l’un ou de l’autre, comptés une seule fois.',
            [`A ∩ B = {${I.join(' ; ')}} et A ∪ B = {${U.join(' ; ')}}.`, `Contrôle : Card(A ∪ B) = ${A.length} + ${B.length} − ${I.length} = ${U.length}.`],
            `Card(A ∩ B) = ${I.length}, Card(A ∪ B) = ${U.length} ; ${t} ${inB ? 'appartient' : 'n’appartient pas'} à B.`),
          tasks('Compte les éléments communs.', 'Compte les éléments de l’union.', `Indique si ${t} appartient à B.`));
      }
    },
    { // 2. Intervalles : intersection et union
      base: {a: -2, b: 5, c: 3, d: 8, la: 0, lb: 0, t: 3},
      params: r => {
        const a = r.int(-6, 2), b = a + r.int(4, 8), c = r.int(a + 2, b - 2), d = b + r.int(1, 6), want = r.int(0, 1);
        return {a, b, c, d, la: r.int(0, 1), lb: r.int(0, 1), t: want ? r.int(c, b - 1) : r.int(a + 1, c - 1)};
      },
      accept: ({a, b, c}) => c - a >= 2 && b - c >= 2,
      difficulty: ({a, b, c, d}) => score({steps: 3, values: [a, b, c, d]}),
      verify: ({a, b, c, d, la, lb, t}, v) => v[0] === `${lb ? ']' : '['}${fr(c)} ; ${fr(b)}]` && v[1] === `${la ? ']' : '['}${fr(a)} ; ${fr(d)}]` && v[2] === ((lb ? t > c : t >= c) && t <= b ? 'Oui' : 'Non'),
      build: ({a, b, c, d, la, lb, t}, o) => {
        const I = `${la ? ']' : '['}${fr(a)} ; ${fr(b)}]`, J = `${lb ? ']' : '['}${fr(c)} ; ${fr(d)}]`;
        const inter = `${lb ? ']' : '['}${fr(c)} ; ${fr(b)}]`, union = `${la ? ']' : '['}${fr(a)} ; ${fr(d)}]`, both = (lb ? t > c : t >= c) && t <= b;
        return E(o, `On pose <strong>I = ${I}</strong> et <strong>J = ${J}</strong>.`,
          [S('I ∩ J', inter, [`[${fr(c)} ; ${fr(b)}]`, `]${fr(c)} ; ${fr(b)}]`, `[${fr(a)} ; ${fr(d)}]`, `[${fr(a)} ; ${fr(c)}[ ∪ ]${fr(b)} ; ${fr(d)}]`], {shuffle: true}),
           S('I ∪ J', union, [`[${fr(a)} ; ${fr(d)}]`, `]${fr(a)} ; ${fr(d)}]`, `[${fr(c)} ; ${fr(b)}]`, `[${fr(a)} ; ${fr(c)}] ∪ [${fr(b)} ; ${fr(d)}]`], {shuffle: true}),
           S(`${fr(t)} appartient-il à I et à J ?`, both ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('on place les deux intervalles sur une droite graduée : l’intersection est la partie commune, l’union la réunion des deux ; un crochet tourné vers l’extérieur exclut la borne.',
            [`La partie commune va de ${fr(c)} (${lb ? 'exclu' : 'inclus'}, comme dans J) à ${fr(b)} (inclus) ; les intervalles se chevauchent, donc l’union va de ${fr(a)} (${la ? 'exclu' : 'inclus'}) à ${fr(d)}.`],
            `I ∩ J = ${inter} et I ∪ J = ${union} ; ${fr(t)} ${both ? 'appartient aux deux intervalles' : t === c ? 'n’appartient pas à J, dont la borne ' + fr(c) + ' est exclue' : 'n’appartient pas à J'}.`),
          tasks('Choisis I ∩ J.', 'Choisis I ∪ J.', `Indique si ${fr(t)} appartient aux deux intervalles.`));
      }
    },
    { // 3. Produit cartésien
      base: {nA: 2, nB: 3, want: 1, kind: 0},
      params: r => { const want = r.int(0, 1); return {nA: r.int(2, 4), nB: r.int(2, 6), want, kind: want ? 0 : r.int(0, 1)}; },
      space: 45,
      difficulty: ({nA, nB}) => score({steps: 3, values: [nA, nB, nA * nB]}),
      verify: ({nA, nB, want}, v) => v[0] === nA && v[1] === nB && v[2] === v[0] * v[1] && v[3] === (want ? 'Oui' : 'Non'),
      build: ({nA, nB, want, kind}, o) => {
        const A = ['a', 'b', 'c', 'd'].slice(0, nA), B = Array.from({length: nB}, (_, i) => i + 1);
        const couple = want ? `(${A[nA - 1]} ; ${B[1]})` : kind ? `(${B[1]} ; ${A[0]})` : `(${A[0]} ; ${nB + 1})`;
        const why = want ? `${A[nA - 1]} ∈ A et ${B[1]} ∈ B` : kind ? `la première composante doit appartenir à A : l’ordre compte` : `${nB + 1} n’appartient pas à B`;
        return E(o, `Soit <strong>A = {${A.join(' ; ')}}</strong> et <strong>B = {${B.join(' ; ')}}</strong>.`,
          [N('Card(A)', nA), N('Card(B)', nB), N('Card(A × B)', nA * nB), S(`${couple} ∈ A × B ?`, want ? 'Oui' : 'Non', ['Oui', 'Non'])],
          C('A × B est l’ensemble des couples (x ; y) avec x dans A et y dans B ; Card(A × B) = Card(A) × Card(B).',
            [`Card(A × B) = ${nA} × ${nB} = ${nA * nB}.`],
            `${couple} ${want ? 'appartient' : 'n’appartient pas'} à A × B, car ${why}.`),
          {title: 'Couples ordonnés', ...tasks('Calcule Card(A) et Card(B).', 'Calcule Card(A × B).', `Indique si le couple ${couple} appartient à A × B.`)});
      }
    },
    { // 4. Vrai ou faux ?
      base: {k: 2, i: 0, j: 6, l: 1},
      params: r => { const [i, j, l] = r.pickDistinct(PROPS.map((_, n) => n), 3); return {k: r.int(2, 9), i, j, l}; },
      space: 1000,
      difficulty: ({k}) => score({steps: 3, values: [k, k * k]}),
      verify: ({k, i, j, l}, v) => [i, j, l].every((n, m) => v[m] === (PROPS[n](k)[1] ? 'Vrai' : 'Faux')),
      build: ({k, i, j, l}, o) => {
        const ps = [i, j, l].map(n => PROPS[n](k));
        return E(o, `On raisonne sur l’ensemble des <strong>nombres réels</strong>. Indique si chaque proposition est vraie ou fausse : <strong>${ps.map(([text]) => text).join(' ; ')}</strong>.`,
          ps.map(([text, truth]) => S(text, truth ? 'Vrai' : 'Faux', ['Vrai', 'Faux'])),
          C('une proposition « pour tout » est fausse dès qu’on trouve un contre-exemple ; une proposition « il existe » est vraie dès qu’on trouve un exemple.',
            ps.map(([text, truth, why]) => `« ${text} » : ${truth ? 'vrai' : 'faux'}, car ${why}.`),
            `les réponses sont : ${ps.map(([, truth]) => (truth ? 'vrai' : 'faux')).join(', ')}.`),
          {title: 'Vrai ou faux ?', ...tasks('Pour chaque proposition, cherche un exemple ou un contre-exemple.')});
      }
    },
    { // 5. Implication et réciproque
      base: {lo: 1, gap: 2, dir: 0},
      params: r => ({lo: r.int(-3, 6), gap: r.int(1, 4), dir: r.int(0, 1)}),
      difficulty: ({lo, gap}) => score({steps: 3, values: [lo, lo + gap, lo + 1]}),
      verify: ({lo, gap, dir}, v) => v[0] === (dir ? 'Fausse' : 'Vraie') && v[1] === (dir ? 'Vraie' : 'Fausse') && v[2] > lo && !(v[2] > lo + gap) && !(v[2] - 1 > lo),
      build: ({lo, gap, dir}, o) => {
        const hi = lo + gap, P = dir ? `x > ${fr(lo)} ⇒ x > ${fr(hi)}` : `x > ${fr(hi)} ⇒ x > ${fr(lo)}`, R = dir ? `x > ${fr(hi)} ⇒ x > ${fr(lo)}` : `x > ${fr(lo)} ⇒ x > ${fr(hi)}`;
        return E(o, `On compare les propositions « x > ${fr(hi)} » et « x > ${fr(lo)} » pour x réel. On étudie l’implication <strong>${P}</strong>.`,
          [S(`L’implication ${P}`, dir ? 'Fausse' : 'Vraie', ['Vraie', 'Fausse']), S(`Sa réciproque ${R}`, dir ? 'Vraie' : 'Fausse', ['Vraie', 'Fausse']),
           N('Plus petit entier qui est un contre-exemple de l’implication fausse', lo + 1)],
          C('une implication « si A alors B » est fausse dès qu’un exemple vérifie A sans vérifier B ; la réciproque échange A et B.',
            [`Si x > ${fr(hi)}, alors x > ${fr(lo)} puisque ${fr(hi)} > ${fr(lo)} : « x > ${fr(hi)} ⇒ x > ${fr(lo)} » est vraie.`,
             `Pour x = ${fr(lo + 1)}, on a x > ${fr(lo)} mais pas x > ${fr(hi)} : « x > ${fr(lo)} ⇒ x > ${fr(hi)} » est fausse. Aucun entier plus petit ne vérifie x > ${fr(lo)}.`],
            `l’implication étudiée est ${dir ? 'fausse' : 'vraie'} et sa réciproque est ${dir ? 'vraie' : 'fausse'} ; le plus petit entier contre-exemple est ${fr(lo + 1)}.`),
          {title: 'Implication et réciproque', ...tasks('Dis si l’implication est vraie.', 'Dis si sa réciproque est vraie.', 'Donne le plus petit entier qui est un contre-exemple de celle qui est fausse.')});
      }
    },
    { // 6. Identité, équation ou valeur approchée
      base: {a: 3, sol: 3, b: 2, k: 1, idq: 0, kind: 1, f: 0},
      params: r => { const kind = r.int(0, 1); return {a: r.int(2, 6), sol: r.nonZero(1, 9), b: r.nonZero(1, 12), k: r.int(1, 6), idq: r.int(0, 1), kind, f: r.int(0, (kind ? ROUND : EXACT).length - 1)}; },
      accept: ({a, sol, b}) => a * sol + b !== 0,
      difficulty: ({a, sol, b, k}) => score({steps: 3, values: [a, b, a * sol + b, sol, k, 2 * k, k * k]}),
      verify: ({a, sol, b, idq, kind}, v) => a * v[0] + b === a * sol + b && v[1] === (idq ? 'Équation avec une seule solution' : 'Identité') && v[2] === (kind ? '≈' : '='),
      build: ({a, sol, b, k, idq, kind, f}, o) => {
        const t = a * sol + b, [p, q] = (kind ? ROUND : EXACT)[f], dec = kind ? fr(Math.round(1000 * p / q) / 1000) : fr(p / q);
        const eq2 = idq ? `(x + ${k})² = x² + ${k * k}` : `(x + ${k})² = x² + ${2 * k}x + ${k * k}`;
        return E(o, `On examine <strong>${affine(a, b)} = ${fr(t)}</strong>, l’égalité <strong>${eq2}</strong> et l’écriture décimale de ${p}/${q}.`,
          [N('Solution de la première égalité', sol), S('La deuxième égalité est', idq ? 'Équation avec une seule solution' : 'Identité', ['Identité', 'Équation avec une seule solution']),
           S(`Signe à écrire entre ${p}/${q} et ${dec}`, kind ? '≈' : '=', ['=', '≈'])],
          C('une identité est vraie pour tout x ; une équation ne l’est que pour certaines valeurs. Une écriture décimale arrondie s’écrit avec ≈.',
            [`${affine(a, b)} = ${fr(t)} ⇔ ${fr(a)}x = ${fr(t - b)} ⇔ x = ${fr(sol)}.`,
             idq ? `(x + ${k})² = x² + ${2 * k}x + ${k * k} ; l’égalité devient ${2 * k}x = 0, vraie seulement pour x = 0.` : `En développant, (x + ${k})² = x² + ${2 * k}x + ${k * k} pour tout x.`,
             kind ? `${p}/${q} = ${fr(p / q, {digits: 5})}… n’a pas d’écriture décimale finie : ${p}/${q} ≈ ${dec}.` : `${p}/${q} = ${dec} exactement.`],
            `la solution est ${fr(sol)} ; la deuxième égalité est ${idq ? 'une équation qui a une seule solution (x = 0)' : 'une identité'} ; on écrit ${p}/${q} ${kind ? '≈' : '='} ${dec}.`),
          {title: 'Identité ou équation ?', ...tasks('Résous la première égalité.', 'Indique la nature de la deuxième égalité.', 'Choisis le signe qui convient.')});
      }
    },
    { // 7. Résoudre une inéquation-produit
      base: {r1: -2, gap: 4, extra: 3, op: 0, t: 3},
      params: r => { const r1 = r.int(-4, 1), gap = r.int(2, 6); return {r1, gap, extra: r.int(1, 3), op: r.int(0, 1), t: r.pick([r1 - 1, r1 + 1, r1 + gap + 1])}; },
      accept: ({r1, gap, t}) => r1 !== 0 && r1 + gap !== 0 && t !== 0 && t !== r1 && t !== r1 + gap,
      difficulty: ({r1, gap, extra, t}) => { const r2 = r1 + gap; return score({steps: 4, values: [r1, r2, r1 * r2, (t - r1) * (t - r2), Math.max(-r1, r2) + extra]}); },
      verify: ({r1, gap, extra, op, t}, v) => {
        const r2 = r1 + gap, L = Math.max(-r1, r2) + extra, P = x => (x - r1) * (x - r2);
        return v[0] === P(0) && v[1] === P(t) && v[2] === (op ? `]${fr(r1)} ; ${fr(r2)}[` : `[${fr(-L)} ; ${fr(r1)}[ ∪ ]${fr(r2)} ; ${L}]`);
      },
      build: ({r1, gap, extra, op, t}, o) => {
        const r2 = r1 + gap, L = Math.max(-r1, r2) + extra, sym = op ? '<' : '>', P = x => (x - r1) * (x - r2);
        const ext = `[${fr(-L)} ; ${fr(r1)}[ ∪ ]${fr(r2)} ; ${L}]`, int = `]${fr(r1)} ; ${fr(r2)}[`, ans = op ? int : ext;
        return E(o, `Sur [${fr(-L)} ; ${L}], on cherche les réels x tels que <strong>${fact(r1)}${fact(r2)} ${sym} 0</strong>.`,
          [N('Pour x = 0', P(0)), N(`Pour x = ${fr(t)}`, P(t)), S('Ensemble des solutions', ans, [ext, int, `[${fr(r1)} ; ${fr(r2)}]`, `[${fr(-L)} ; ${fr(r1)}] ∪ [${fr(r2)} ; ${L}]`], {shuffle: true})],
          C('on cherche les zéros des facteurs, on dresse le tableau de signes sur l’intervalle d’étude, puis on garde les intervalles où le produit a le signe demandé ; l’inégalité stricte exclut les zéros.',
            [`Pour x = 0 : ${pa(-r1)} × ${pa(-r2)} = ${fr(P(0))} ; pour x = ${fr(t)} : ${pa(t - r1)} × ${pa(t - r2)} = ${fr(P(t))}.`],
            `le produit est ${op ? 'strictement négatif entre les zéros' : 'strictement positif à l’extérieur des zéros'} : l’ensemble des solutions est ${ans}.`,
            productSignTable(`Signe de ${fact(r1)}${fact(r2)} sur [${fr(-L)} ; ${L}]`, 1, r1, r2, -L, L)),
          {title: 'Résoudre une inéquation-produit', ...tasks(`Calcule l’expression pour x = 0 et pour x = ${fr(t)}.`, 'Choisis l’ensemble des solutions.')});
      }
    },
    { // 8. Filtrer une liste avec ET et OU
      base: {vals: [8, 10, 11, 14, 20, 21], par: 0, m: 10, M: 20},
      params: r => {
        const s = r.int(1, 20), vals = r.pickDistinct(Array.from({length: 16}, (_, i) => s + i), 6).sort((a, b) => a - b);
        const m = vals[1] + r.int(0, 1), M = vals[4] + r.int(-1, 0);
        return {vals, par: r.int(0, 1), m, M};
      },
      accept: ({vals, par, m, M}) => {
        const ok = x => (x % 2 === 0) === (par === 0), et = vals.filter(x => ok(x) && x >= m && x <= M), ou = vals.filter(x => ok(x) || x > M);
        return m < M && et.length >= 1 && et.length <= 4 && ou.length > et.length && ou.length < 6;
      },
      difficulty: ({vals}) => score({steps: 4, values: vals}),
      verify: ({vals, par, m, M}, v) => {
        const ok = x => (x % 2 === 0) === (par === 0);
        return v[0] === vals.filter(x => ok(x) && x >= m && x <= M).length && v[1] === vals.filter(x => ok(x) || x > M).length && v[2] === Math.max(...vals.filter(x => ok(x) && x >= m && x <= M));
      },
      build: ({vals, par, m, M}, o) => {
        const name = par ? 'impairs' : 'pairs', ok = x => (x % 2 === 0) === (par === 0);
        const et = vals.filter(x => ok(x) && x >= m && x <= M), ou = vals.filter(x => ok(x) || x > M);
        return E(o, `On considère la liste <strong>${vals.join(' ; ')}</strong>.`,
          [N(`Valeurs ${name} ET comprises entre ${m} et ${M} inclus`, et.length), N(`Valeurs ${name} OU strictement supérieures à ${M}`, ou.length), N('Plus grande valeur retenue par le filtre ET', Math.max(...et))],
          C('avec ET, une valeur doit vérifier les deux conditions à la fois ; avec OU, il suffit qu’elle en vérifie au moins une.',
            [`Filtre ET : ${et.join(' ; ')}.`, `Filtre OU : ${ou.join(' ; ')}.`],
            `le filtre ET garde ${et.length} valeur${et.length > 1 ? 's' : ''}, le filtre OU en garde ${ou.length} ; la plus grande valeur du filtre ET est ${Math.max(...et)}.`),
          {title: 'Filtrer une liste avec ET et OU', ...tasks(`Compte les valeurs ${name} ET comprises entre ${m} et ${M} inclus.`, `Compte les valeurs ${name} OU strictement supérieures à ${M}.`, 'Donne la plus grande valeur retenue par le premier filtre.')});
      }
    }
  ]);
})();
