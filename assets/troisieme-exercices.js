/* Troisième : 96 modèles déclaratifs (16 chapitres × 6), programme de cycle 4 et
   préparation du brevet. Énoncés, réponses et corrections sont calculés à partir
   des mêmes paramètres ; les nombres restent adaptés au collège.
   Le moteur, le score et la révélation des réponses sont ceux des autres niveaux. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant la 3e.');
  const {N, S, C, F, score, fmt, signTable} = V;
  const {num: fr, paren: pa, signed: sg, frac, gcd, MINUS: M, NBSP} = fmt;
  // Valeur exacte, ou arrondie au centième (ou à `digits` décimales).
  const Q = (label, value, digits = 2) => N(label, F(value, 9), 1e-8, digits);
  const r2 = (x, d = 2) => Math.round(x * 10 ** d + (x >= 0 ? 1e-9 : -1e-9)) / 10 ** d;
  // « = 12 » si la valeur est exacte à d décimales, sinon « ≈ 12,35 ».
  const eq = (x, d = 2) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '= ' + fr(x) : '≈ ' + fr(r2(x, d)));
  // « 12 » si la valeur est exacte à d décimales, sinon « environ 12,35 ».
  const about = (x, d = 2) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '' : 'environ ') + fr(r2(x, d));
  const lcm = (a, b) => a / gcd(a, b) * b;
  const sup = n => '<sup>' + fr(n) + '</sup>';
  const SUP = n => String(n).replace(/-/g, '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const code = text => '<code>' + text + '</code>';
  const sum = list => list.reduce((a, b) => a + b, 0);
  const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const smallest = n => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return d; return n; };
  const close = (a, b, eps = 1e-7) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));
  const sameFrac = (x, n, d) => close(x, n / d);
  const deg = Math.PI / 180;
  // Monôme « 3x », « −x », « x² » ; affine(a, b) → « 3x − 2 ».
  const mono = (a, v = 'x', first = true) => fmt.term(a, v, first);
  const lin = (a, b, v = 'x') => fmt.poly([a, b], v);
  const quad = (a, b, c) => fmt.poly([a, b, c]);
  // Écriture décimale exacte de digits × 10^shift (digits entier), sans erreur d'arrondi.
  function decimal(digits, shift) {
    let s = String(digits);
    if (shift >= 0) s += '0'.repeat(shift);
    else {
      const k = -shift;
      if (s.length <= k) s = '0'.repeat(k - s.length + 1) + s;
      s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k);
      s = s.replace(/0+$/, '').replace(/\.$/, '');
    }
    const [i, d] = s.split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, fmt.NNBSP) + (d ? ',' + d : '');
  }
  const table = (caption, columns, rows, first) => signTable(caption, columns.map(c => (typeof c === 'number' ? fr(c) : c)),
    rows.map(row => ({label: row.label, cells: row.cells.map(c => (typeof c === 'number' ? fr(c) : c))})), first);
  const TASKS = ['Renseigne chaque champ. Si le résultat n’est pas exact, arrondis au centième, sauf indication contraire. Une fraction est acceptée.'];
  const item = (title, statement, fields, correction, hint) => ({
    title, statement, fields, correction: Array.isArray(correction) ? correction : [correction],
    hint, level: 'Troisième', tasks: TASKS
  });
  // Nombres de collège : au plus 100 000 en valeur absolue dans les réponses.
  const T = model => ({limit: 100000, decimals: 6, ...model});

  const models = {
    /* ---------- 01 · Nombres premiers et arithmétique ---------- */
    '3-arithmetique': [
      T({ // Décomposition en facteurs premiers
        base: {a: 3, b: 2, c: 1, d: 0},
        params: r => ({a: r.int(0, 5), b: r.int(0, 3), c: r.int(0, 2), d: r.int(0, 1)}),
        accept: ({a, b, c, d}) => { const n = 2 ** a * 3 ** b * 5 ** c * 7 ** d; return n >= 60 && n <= 5000 && [a, b, c, d].filter(Boolean).length >= 2; },
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [2 ** a * 3 ** b * 5 ** c * 7 ** d]}),
        verify: ({a, b, c, d}, v) => 2 ** v[0] * 3 ** v[1] * 5 ** v[2] * 7 ** v[3] === 2 ** a * 3 ** b * 5 ** c * 7 ** d,
        build: ({a, b, c, d}) => {
          const n = 2 ** a * 3 ** b * 5 ** c * 7 ** d;
          const steps = []; let m = n;
          for (const p of [2, 3, 5, 7]) while (m % p === 0) { steps.push(`${fr(m)} = ${p} × ${fr(m / p)}`); m /= p; }
          const factors = [...Array(a).fill(2), ...Array(b).fill(3), ...Array(c).fill(5), ...Array(d).fill(7)];
          return item('Décomposer en facteurs premiers', `Décompose ${fr(n)} en produit de facteurs premiers, sous la forme 2<sup>a</sup> × 3<sup>b</sup> × 5<sup>c</sup> × 7<sup>d</sup>. Un exposant peut être nul.`,
            [Q('Exposant de 2', a), Q('Exposant de 3', b), Q('Exposant de 5', c), Q('Exposant de 7', d)],
            C('on divise successivement par les nombres premiers 2, 3, 5 puis 7, tant que la division tombe juste.',
              [steps.join(' ; ') + '.', `${fr(n)} = ${factors.join(' × ')}.`],
              `${fr(n)} = 2${sup(a)} × 3${sup(b)} × 5${sup(c)} × 7${sup(d)} : a = ${a}, b = ${b}, c = ${c} et d = ${d}.`),
            'Commence par diviser par 2 autant de fois que possible, puis passe à 3, 5 et 7.');
        }
      }),
      T({ // Fraction irréductible
        base: {p: 3, q: 4, k: 6},
        params: r => ({p: r.int(1, 15), q: r.int(2, 16), k: r.int(2, 12)}),
        accept: ({p, q, k}) => gcd(p, q) === 1 && p !== q && p * k <= 200 && q * k <= 200,
        difficulty: ({p, q, k}) => score({steps: 2, values: [p * k, q * k]}),
        verify: ({p, q, k}, v) => v[0] * q * k === v[1] * p * k && gcd(v[0], v[1]) === 1 && v[1] > 0,
        build: ({p, q, k}) => item('Rendre une fraction irréductible', `Rends la fraction ${p * k}/${q * k} irréductible. Donne le numérateur puis le dénominateur de la fraction obtenue.`,
          [Q('Numérateur', p), Q('Dénominateur', q)],
          C('on cherche le plus grand diviseur commun du numérateur et du dénominateur, puis on divise les deux par ce nombre.',
            [`${p * k} = ${k} × ${p} et ${q * k} = ${k} × ${q}.`, `${p} et ${q} n’ont plus de diviseur commun autre que 1.`],
            `${p * k}/${q * k} = ${p}/${q}, fraction irréductible.`),
          'Décompose le numérateur et le dénominateur, puis supprime les facteurs communs.')
      }),
      T({ // Nombre premier ou non
        base: {kind: 1, n: 91},
        params: r => {
          const kind = r.int(0, 1);
          const primes = []; for (let n = 53; n <= 199; n += 2) if (isPrime(n)) primes.push(n);
          const composite = [49, 51, 57, 77, 87, 91, 111, 117, 119, 121, 129, 133, 141, 143, 153, 161, 169, 171, 177, 183, 187, 189];
          return {kind, n: r.pick(kind ? composite : primes)};
        },
        difficulty: ({n}) => score({steps: 2, values: [n]}),
        verify: ({n}, v) => (v[0] === 'oui') === isPrime(n) && v[1] === smallest(n),
        build: ({n}) => {
          const prime = isPrime(n), d = smallest(n), tried = [2, 3, 5, 7, 11, 13].filter(p => p * p <= n);
          return item('Reconnaître un nombre premier', `Le nombre ${n} est-il premier ? Donne aussi son plus petit diviseur premier.`,
            [S(`${n} est-il premier ?`, prime ? 'oui' : 'non', ['oui', 'non']), Q('Plus petit diviseur premier', d)],
            C('un nombre est premier s’il a exactement deux diviseurs : 1 et lui-même. On teste les nombres premiers dont le carré ne dépasse pas ce nombre.',
              [prime ? `Ni ${tried.join(', ni ')} ne divisent ${n}, et ${[11, 13, 17][[7, 11, 13].indexOf(tried[tried.length - 1])]}² = ${[11, 13, 17][[7, 11, 13].indexOf(tried[tried.length - 1])] ** 2} dépasse déjà ${n}.` : `${n} = ${d} × ${n / d}, et les nombres premiers plus petits que ${d} ne divisent pas ${n}.`],
              prime ? `${n} est premier ; son plus petit diviseur premier est ${n} lui-même.` : `${n} n’est pas premier ; son plus petit diviseur premier est ${d}.`),
            'Teste 2, 3, 5, 7, 11 et 13. La somme des chiffres renseigne sur la divisibilité par 3.');
        }
      }),
      T({ // Bouquets identiques
        base: {g: 12, p: 4, q: 3},
        params: r => ({g: r.int(2, 15), p: r.int(2, 9), q: r.int(2, 9)}),
        accept: ({g, p, q}) => gcd(p, q) === 1 && p !== q && g * p <= 200 && g * q <= 200,
        difficulty: ({g, p, q}) => score({steps: 3, values: [g * p, g * q]}),
        verify: ({g, p, q}, v) => v[0] === gcd(g * p, g * q) && v[0] * v[1] === g * p && v[0] * v[2] === g * q,
        build: ({g, p, q}) => { const A = g * p, B = g * q; return item('Former des lots identiques', `Un fleuriste dispose de ${A} roses et de ${B} tulipes. Il veut composer le plus grand nombre possible de bouquets identiques en utilisant toutes les fleurs.`,
          [Q('Nombre de bouquets', g), Q('Roses par bouquet', p), Q('Tulipes par bouquet', q)],
          C('le nombre de bouquets divise à la fois le nombre de roses et le nombre de tulipes ; on prend le plus grand diviseur commun.',
            [`${A} = ${g} × ${p} et ${B} = ${g} × ${q}, avec ${p} et ${q} sans diviseur commun autre que 1 : le plus grand diviseur commun est ${g}.`, `${A} ÷ ${g} = ${p} et ${B} ÷ ${g} = ${q}.`],
            `il peut composer ${g} bouquets de ${p} roses et ${q} tulipes.`),
          'Cherche un diviseur commun à ' + A + ' et ' + B + ', le plus grand possible.'); }
      }),
      T({ // Phares et multiples communs
        base: {a: 6, b: 8},
        params: r => ({a: r.int(4, 20), b: r.int(5, 30)}),
        accept: ({a, b}) => a < b && b % a !== 0 && gcd(a, b) > 1 && lcm(a, b) <= 300,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, lcm(a, b)]}),
        verify: ({a, b}, v) => v[0] % a === 0 && v[0] % b === 0 && v[0] === lcm(a, b) && v[1] * a === v[0],
        build: ({a, b}) => { const m = lcm(a, b); return item('Retrouver un multiple commun', `Deux phares s’allument ensemble à minuit. Le premier s’allume toutes les ${a} secondes, le second toutes les ${b} secondes.`,
          [Q('Secondes avant le prochain allumage commun', m), Q('Allumages du premier phare pendant ce temps', m / a)],
          C('les deux phares s’allument ensemble aux multiples communs de ' + a + ' et de ' + b + ' ; on cherche le plus petit multiple commun non nul.',
            [`Multiples de ${b} : ${[1, 2, 3, 4].map(k => b * k).join(', ')}… Le premier qui est aussi multiple de ${a} est ${m}.`, `${m} ÷ ${a} = ${m / a}.`],
            `ils se rallument ensemble ${m} secondes plus tard ; le premier phare s’est allumé ${m / a} fois pendant cette durée (sans compter minuit).`),
          'Écris les multiples du plus grand des deux nombres et teste-les.'); }
      }),
      T({ // Division euclidienne
        base: {a: 350, b: 12},
        params: r => ({a: r.int(100, 999), b: r.int(6, 24)}),
        accept: ({a, b}) => a % b !== 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b]}),
        verify: ({a, b}, v) => v[0] * b + v[1] === a && v[1] >= 0 && v[1] < b,
        build: ({a, b}) => { const q = Math.floor(a / b), rest = a % b; return item('Effectuer une division euclidienne', `On range ${a} œufs dans des boîtes de ${b}. Toutes les boîtes remplies sont complètes.`,
          [Q('Nombre de boîtes pleines', q), Q('Œufs restants', rest)],
          C('on effectue la division euclidienne de ' + a + ' par ' + b + ' : a = b × q + r avec 0 ≤ r < b.',
            [`${b} × ${q} = ${b * q} et ${a} ${M} ${b * q} = ${rest}.`, `${a} = ${b} × ${q} + ${rest}, avec ${rest} < ${b}.`],
            `on remplit ${q} boîtes et il reste ${rest} œufs.`),
          'Le reste doit être strictement inférieur à ' + b + '.'); }
      })
    ],

    /* ---------- 02 · Fractions et nombres relatifs ---------- */
    '3-fractions': [
      T({ // Somme de fractions
        base: {a: 2, b: 3, c: 1, d: 4},
        params: r => ({a: r.int(1, 9), b: r.int(2, 9), c: r.int(1, 9), d: r.int(2, 12)}),
        accept: ({a, b, c, d}) => b !== d && gcd(a, b) === 1 && gcd(c, d) === 1 && lcm(b, d) <= 60,
        difficulty: ({b, d}) => score({steps: 2, values: [b, d, lcm(b, d)], fractions: true}),
        verify: ({a, b, c, d}, v) => v[0] * b * d === v[1] * (a * d + c * b) && gcd(v[0], v[1]) === 1,
        build: ({a, b, c, d}) => {
          const L = lcm(b, d), n = a * L / b + c * L / d, g = gcd(n, L);
          return item('Additionner deux fractions', `Calcule ${a}/${b} + ${c}/${d} et donne le résultat sous forme de fraction irréductible.`,
            [Q('Numérateur', n / g), Q('Dénominateur', L / g)],
            C('on écrit les deux fractions avec un même dénominateur, puis on additionne les numérateurs.',
              [`Dénominateur commun : ${L}. ${a}/${b} = ${a * L / b}/${L} et ${c}/${d} = ${c * L / d}/${L}.`, `${a * L / b}/${L} + ${c * L / d}/${L} = ${n}/${L}${g > 1 ? ` = ${n / g}/${L / g}` : ''}.`],
              `${a}/${b} + ${c}/${d} = ${frac(n, L)}.`),
            'On n’additionne jamais les dénominateurs : cherche d’abord un dénominateur commun.');
        }
      }),
      T({ // Quotient de fractions
        base: {s: 1, a: 3, b: 4, c: 5, d: 6},
        params: r => ({s: r.sign(), a: r.int(1, 9), b: r.int(2, 9), c: r.int(1, 9), d: r.int(2, 9)}),
        accept: ({a, b, c, d}) => gcd(a, b) === 1 && gcd(c, d) === 1 && a * d <= 81 && b * c <= 81 && a * d !== b * c,
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a * d, b * c], fractions: true, negatives: false}),
        verify: ({s, a, b, c, d}, v) => v[0] * b * c === s * v[1] * a * d && gcd(v[0], v[1]) === 1 && v[1] > 0,
        build: ({s, a, b, c, d}) => {
          const n = s * a * d, m = b * c, g = gcd(n, m), first = s < 0 ? `(${M}${a}/${b})` : `${a}/${b}`;
          return item('Diviser par une fraction', `Calcule ${first} ÷ ${c}/${d} et donne le résultat sous forme de fraction irréductible (le signe porte sur le numérateur).`,
            [Q('Numérateur', n / g), Q('Dénominateur', m / g)],
            C('diviser par une fraction revient à multiplier par son inverse.',
              [`${first} ÷ ${c}/${d} = ${first} × ${d}/${c} = ${frac(n, 1)}/${m}${g > 1 ? ` = ${frac(n / g, 1)}/${m / g}` : ''}.`],
              `le quotient vaut ${frac(n, m)}.`),
            'L’inverse de ' + c + '/' + d + ' est ' + d + '/' + c + '.');
        }
      }),
      T({ // Priorités avec des relatifs
        base: {a: 5, b: 3, c: 2, d: -4},
        params: r => ({a: r.nonZero(1, 12), b: r.nonZero(2, 9), c: r.nonZero(1, 9), d: r.nonZero(1, 9)}),
        accept: ({c, d, a, b}) => c !== d && a - b * (c - d) !== 0,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a, b, c, d, c - d, a - b * (c - d)], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === c - d && v[1] === a - b * v[0],
        build: ({a, b, c, d}) => { const p = c - d, E = a - b * p; return item('Calculer avec des relatifs', `E = ${fr(a)} ${M} ${pa(b)} × (${fr(c)} ${M} ${pa(d)}).`,
          [Q('Valeur de la parenthèse', p), Q('Valeur de E', E)],
          C('on calcule d’abord la parenthèse, puis la multiplication, et enfin la soustraction.',
            [`${fr(c)} ${M} ${pa(d)} = ${fr(p)}.`, `${pa(b)} × ${pa(p)} = ${fr(b * p)}, puis E = ${fr(a)} ${M} ${pa(b * p)} = ${fr(E)}.`],
            `la parenthèse vaut ${fr(p)} et E = ${fr(E)}.`),
          'Soustraire un nombre revient à ajouter son opposé.'); }
      }),
      T({ // Fraction d'une quantité et du reste
        base: {T: 120, a: 1, b: 4, c: 2, d: 3},
        params: r => ({T: 10 * r.int(6, 40), a: r.int(1, 4), b: r.pick([3, 4, 5, 6, 8, 10]), c: r.int(1, 3), d: r.pick([2, 3, 4, 5])}),
        accept: ({T, a, b, c, d}) => a < b && c < d && gcd(a, b) === 1 && gcd(c, d) === 1 && (T * a) % b === 0 && ((T - T * a / b) * c) % d === 0,
        difficulty: ({T}) => score({steps: 3, values: [T], fractions: true}),
        verify: ({T, a, b, c, d}, v) => v[0] * b === T * a && v[1] === (T - v[0]) * (d - c) / d,
        build: ({T, a, b, c, d}) => { const e1 = T * a / b, rest = T - e1, e2 = rest * c / d, end = rest - e2;
          return item('Prendre une fraction du reste', `Léa dispose de ${T} €. Elle dépense ${a}/${b} de cette somme, puis ${c}/${d} de ce qui lui reste.`,
            [Q('Première dépense, en €', e1), Q('Somme restante à la fin, en €', end)],
            C('prendre une fraction d’une quantité revient à multiplier cette quantité par la fraction. La seconde fraction porte sur le reste, pas sur le total.',
              [`${a}/${b} × ${T} = ${e1} € ; il reste ${T} ${M} ${e1} = ${rest} €.`, `${c}/${d} × ${rest} = ${e2} € ; il reste ${rest} ${M} ${e2} = ${end} €.`],
              `la première dépense est de ${e1} € et il reste ${end} € à Léa.`),
            'Calcule d’abord ce qui reste après la première dépense.'); }
      }),
      T({ // Comparer deux fractions
        base: {a: 5, b: 8, c: 7, d: 12, swap: 0},
        params: r => ({a: r.int(1, 11), b: r.int(3, 12), c: r.int(1, 11), d: r.int(3, 12), swap: r.int(0, 1)}),
        accept: ({a, b, c, d}) => a < b && c < d && b !== d && gcd(a, b) === 1 && gcd(c, d) === 1 && a * d !== b * c && lcm(b, d) <= 60,
        difficulty: ({b, d}) => score({steps: 2, values: [b, d, lcm(b, d)], fractions: true}),
        verify: ({a, b, c, d, swap}, v) => { const f = [[a, b], [c, d]]; if (swap) f.reverse(); const big = f[0][0] * f[1][1] > f[1][0] * f[0][1] ? f[0] : f[1]; return v[0] === big.join('/') && close(v[1], Math.abs(a / b - c / d)); },
        build: ({a, b, c, d, swap}) => {
          let f = [[a, b], [c, d]]; if (swap) f = f.reverse();
          const [[p, q], [s, t]] = f, L = lcm(q, t), big = p * t > s * q ? `${p}/${q}` : `${s}/${t}`;
          return item('Comparer deux fractions', `Compare ${p}/${q} et ${s}/${t}, puis calcule leur écart (la plus grande moins la plus petite).`,
            [S('La plus grande fraction', big, [`${p}/${q}`, `${s}/${t}`]), Q('Écart entre les deux fractions', Math.abs(p / q - s / t))],
            C('on écrit les deux fractions avec un même dénominateur ; la plus grande a alors le plus grand numérateur.',
              [`${p}/${q} = ${p * L / q}/${L} et ${s}/${t} = ${s * L / t}/${L}.`, `Écart : ${Math.abs(p * L / q - s * L / t)}/${L}${gcd(Math.abs(p * L / q - s * L / t), L) > 1 ? ' = ' + frac(Math.abs(p * L / q - s * L / t), L) : ''}.`],
              `${big} est la plus grande ; l’écart vaut ${frac(Math.abs(p * L / q - s * L / t), L)}.`),
            'Un plus grand dénominateur ne donne pas une plus grande fraction : compare avec un dénominateur commun.');
        }
      }),
      T({ // Expression fractionnaire avec priorités
        base: {a: 3, b: 4, c: 1, d: 2, e: 2, f: 3},
        params: r => ({a: r.int(1, 9), b: r.int(2, 9), c: r.int(1, 5), d: r.int(2, 6), e: r.int(1, 5), f: r.int(2, 7)}),
        accept: ({a, b, c, d, e, f}) => gcd(a, b) === 1 && gcd(c, d) === 1 && gcd(e, f) === 1 && lcm(b, d * f) <= 84 && a * d * f !== c * e * b,
        difficulty: ({b, d, f}) => score({steps: 3, values: [b, d * f, lcm(b, d * f)], fractions: true}),
        verify: ({a, b, c, d, e, f}, v) => close(v[0], c * e / (d * f)) && close(v[1], a / b - c * e / (d * f)),
        build: ({a, b, c, d, e, f}) => {
          const pn = c * e, pd = d * f, L = lcm(b, pd), n = a * L / b - pn * L / pd;
          return item('Respecter les priorités avec des fractions', `Calcule A = ${a}/${b} ${M} ${c}/${d} × ${e}/${f}.`,
            [Q('Valeur du produit', pn / pd), Q('Valeur de A', n / L)],
            C('la multiplication est prioritaire sur la soustraction : on calcule le produit, puis on réduit au même dénominateur.',
              [`${c}/${d} × ${e}/${f} = ${pn}/${pd}${gcd(pn, pd) > 1 ? ' = ' + frac(pn, pd) : ''}.`, `A = ${a * L / b}/${L} ${M} ${pn * L / pd}/${L} = ${frac(n, L)}.`],
              `le produit vaut ${frac(pn, pd)} et A = ${frac(n, L)}.`),
            'Ne soustrais pas avant d’avoir effectué la multiplication.');
        }
      })
    ],

    /* ---------- 03 · Puissances et notation scientifique ---------- */
    '3-puissances': [
      T({ // Puissances de 10
        base: {a: 5, b: -2, c: 1},
        params: r => ({a: r.int(-5, 7), b: r.int(-6, 6), c: r.int(-4, 5)}),
        accept: ({a, b, c}) => a + b - c >= -3 && a + b - c <= 4 && a !== 0 && b !== 0 && c !== 0 && a !== b,
        difficulty: ({a, b, c}) => score({steps: 2, values: [a, b, c]}),
        verify: ({a, b, c}, v) => v[0] === a + b - c && close(v[1], 10 ** v[0]),
        build: ({a, b, c}) => { const n = a + b - c; return item('Calculer avec des puissances de 10', `Écris A = (10${sup(a)} × 10${sup(b)}) ÷ 10${sup(c)} sous la forme 10<sup>n</sup>, puis donne son écriture décimale.`,
          [Q('Exposant n', n), Q('Écriture décimale de A', 10 ** n, 4)],
          C('10<sup>m</sup> × 10<sup>p</sup> = 10<sup>m + p</sup> et 10<sup>m</sup> ÷ 10<sup>p</sup> = 10<sup>m − p</sup>.',
            [`10${sup(a)} × 10${sup(b)} = 10${sup(a + b)}.`, `10${sup(a + b)} ÷ 10${sup(c)} = 10${sup(n)}.`],
            `A = 10${sup(n)} = ${decimal(1, n)}.`),
          'Additionne les exposants pour un produit, soustrais-les pour un quotient.'); }
      }),
      T({ // Notation scientifique
        base: {m: 347, e: 7},
        params: r => ({m: r.int(11, 999), e: r.int(-6, 9)}),
        accept: ({m, e}) => m % 10 !== 0 && e !== 0 && e !== 1 && e !== -1,
        difficulty: ({e}) => score({steps: 2, values: [Math.abs(e) * 10]}),
        verify: ({m, e}, v) => { const k = String(m).length - 1; return close(v[0], m / 10 ** k) && v[1] === e && v[0] >= 1 && v[0] < 10; },
        build: ({m, e}) => { const k = String(m).length - 1, a = m / 10 ** k, text = decimal(m, e - k);
          return item('Écrire en notation scientifique', `Écris le nombre ${text} en notation scientifique a × 10<sup>n</sup>, avec 1 ≤ a < 10.`,
            [Q('Nombre a', a, 3), Q('Exposant n', e)],
            C('on place la virgule après le premier chiffre non nul ; n compte de combien de rangs la virgule s’est déplacée (positif pour un grand nombre, négatif pour un petit).',
              [`${text} = ${fr(a)} × 10${sup(e)}.`],
              `a = ${fr(a)} et n = ${fr(e)}.`),
            e > 0 ? 'Le nombre est grand : l’exposant est positif.' : 'Le nombre est inférieur à 1 : l’exposant est négatif.'); }
      }),
      T({ // Produit en notation scientifique
        base: {a: 25, b: 36, m: 3, n: 5},
        params: r => ({a: r.int(11, 99), b: r.int(11, 99), m: r.int(-4, 8), n: r.int(-5, 8)}),
        accept: ({a, b, m, n}) => a % 10 !== 0 && b % 10 !== 0 && m !== 0 && n !== 0 && m + n !== 0,
        difficulty: ({m, n}) => score({steps: 3, values: [Math.abs(m + n) * 10], decimals: true}),
        verify: ({a, b, m, n}, v) => close(v[0] * 10 ** v[1], a * b / 100 * 10 ** (m + n)) && v[0] >= 1 && v[0] < 10,
        build: ({a, b, m, n}) => {
          const x = a / 10, y = b / 10, p = a * b / 100, shift = p >= 10 ? 1 : 0, mant = p / 10 ** shift, e = m + n + shift;
          return item('Multiplier en notation scientifique', `Calcule (${fr(x)} × 10${sup(m)}) × (${fr(y)} × 10${sup(n)}) et donne le résultat en notation scientifique.`,
            [Q('Nombre a', mant, 4), Q('Exposant n', e)],
            C('on multiplie les nombres décimaux entre eux et les puissances de 10 entre elles, puis on ajuste pour avoir 1 ≤ a < 10.',
              [`${fr(x)} × ${fr(y)} = ${fr(p)} et 10${sup(m)} × 10${sup(n)} = 10${sup(m + n)}.`, shift ? `${fr(p)} × 10${sup(m + n)} = ${fr(mant)} × 10${sup(e)}.` : `${fr(p)} est déjà compris entre 1 et 10.`],
              `le produit vaut ${fr(mant)} × 10${sup(e)}.`),
            'Si le produit des nombres décimaux dépasse 10, divise-le par 10 et ajoute 1 à l’exposant.');
        }
      }),
      T({ // Puissance d'un négatif
        space: 18,
        base: {a: 2, n: 4},
        params: r => ({a: r.int(2, 6), n: r.int(2, 5)}),
        accept: ({a, n}) => a ** n <= 2000,
        difficulty: ({a, n}) => score({steps: 2, values: [a, n], negatives: true}),
        verify: ({a, n}, v) => v[0] === (-a) ** n && v[1] === -(a ** n),
        build: ({a, n}) => { const p = a ** n, pos = n % 2 === 0;
          return item('Calculer la puissance d’un nombre négatif', `Calcule (${M}${a})${sup(n)} et ${M}${a}${sup(n)}.`,
            [Q(`(${M}${a})${SUP(n)}`, (-a) ** n), Q(`${M}${a}${SUP(n)}`, -p)],
            C('dans (−a)<sup>n</sup>, le signe moins est élevé à la puissance ; dans −a<sup>n</sup>, seul a l’est.',
              [`(${M}${a})${sup(n)} = ${Array(n).fill(`(${M}${a})`).join(' × ')} = ${fr((-a) ** n)} : ${n} facteurs négatifs, ${pos ? 'nombre pair, produit positif' : 'nombre impair, produit négatif'}.`, `${M}${a}${sup(n)} = ${M}(${Array(n).fill(a).join(' × ')}) = ${fr(-p)}.`],
              `(${M}${a})${sup(n)} = ${fr((-a) ** n)} et ${M}${a}${sup(n)} = ${fr(-p)}.`),
            'Compte le nombre de facteurs négatifs pour trouver le signe.'); }
      }),
      T({ // Durée d'un signal
        base: {d: 15, k: 8},
        params: r => ({d: r.int(12, 99), k: r.int(7, 9)}),
        accept: ({d}) => d % 10 !== 0,
        difficulty: ({d, k}) => score({steps: 3, values: [d * 10 ** (k - 1) / 3e5], decimals: true}),
        verify: ({d, k}, v) => { const t = d * 10 ** (k - 1) / 3e5; return close(v[0], t) && close(v[1], t / 60); },
        build: ({d, k}) => { const x = d / 10, D = d * 10 ** (k - 1), t = D / 3e5;
          return item('Utiliser la notation scientifique en contexte', `Un signal radio voyage à 3 × 10${sup(5)} km/s. Il doit parcourir ${fr(x)} × 10${sup(k)} km.`,
            [Q('Durée du trajet, en s', t, 0), Q('Durée du trajet, en min', t / 60, 1)],
            C('durée = distance ÷ vitesse, en gardant les unités cohérentes (km et km/s donnent des secondes).',
              [`t = (${fr(x)} × 10${sup(k)}) ÷ (3 × 10${sup(5)}) = ${fr(x / 3, 4)} × 10${sup(k - 5)} ${eq(t, 0)} s.`, `En minutes : ${fr(r2(t, 0))} ÷ 60 ${eq(t / 60, 1)} min.`],
              `le signal met ${about(t, 0)} s, soit ${about(t / 60, 1)} min.`),
            'Divise la distance par la vitesse, puis convertis les secondes en minutes (÷ 60).'); }
      }),
      T({ // Préfixes et puissances de 10
        base: {q: 32, p: 2, u: 0},
        params: r => ({q: r.int(11, 99), p: r.int(0, 6), u: r.int(0, 3)}),
        accept: ({q}) => q % 10 !== 0,
        difficulty: () => score({steps: 2, values: [9], decimals: true}),
        verify: ({q, p}, v) => close(v[0], q / 10) && v[1] === [3, 6, 9, 12, -3, -6, -9][p],
        build: ({q, p, u}) => {
          const names = ['kilo', 'méga', 'giga', 'téra', 'milli', 'micro', 'nano'], sym = ['k', 'M', 'G', 'T', 'm', 'µ', 'n'], e = [3, 6, 9, 12, -3, -6, -9][p];
          const unit = [['octet', 'o'], ['mètre', 'm'], ['gramme', 'g'], ['watt', 'W']][u];
          return item('Traduire un préfixe en puissance de 10', `Le préfixe ${names[p]} (${sym[p]}) correspond à une puissance de 10. Écris ${fr(q / 10)} ${sym[p]}${unit[1]} en ${unit[0]}s, sous la forme a × 10<sup>n</sup>.`,
            [Q('Nombre a', q / 10, 3), Q('Exposant n', e)],
            C(`${names[p]} signifie × 10${sup(e)}.`,
              [`${fr(q / 10)} ${sym[p]}${unit[1]} = ${fr(q / 10)} × 10${sup(e)} ${unit[1]}.`],
              `a = ${fr(q / 10)} et n = ${fr(e)}.`),
            'Retiens : kilo 10³, méga 10⁶, giga 10⁹, téra 10¹², milli 10⁻³, micro 10⁻⁶, nano 10⁻⁹.');
        }
      })
    ],

    /* ---------- 04 · Calcul littéral ---------- */
    '3-calcul-litteral': [
      T({ // Développer et réduire
        base: {k: 3, a: 2, b: 5, c: 4, d: 1},
        params: r => ({k: r.nonZero(2, 7), a: r.nonZero(1, 6), b: r.nonZero(1, 9), c: r.int(2, 7), d: r.nonZero(1, 9)}),
        accept: ({k, a, c, b, d}) => k * a !== c && k * b !== c * d,
        difficulty: ({k, a, b, c, d}) => score({steps: 3, values: [k * a, k * b, c * d, k * a - c, k * b - c * d], negatives: true}),
        verify: ({k, a, b, c, d}, v) => [-2, 0, 3].every(x => k * (a * x + b) - c * (x + d) === v[0] * x + v[1]),
        build: ({k, a, b, c, d}) => { const A = k * a - c, B = k * b - c * d;
          return item('Développer et réduire', `Développe et réduis A = ${fr(k)}(${lin(a, b)}) ${M} ${c}(x${sg(d)}).`,
            [Q('Coefficient de x', A), Q('Terme constant', B)],
            C('on distribue chaque facteur sur la parenthèse, en changeant les signes de la seconde à cause du signe moins, puis on regroupe.',
              [`${fr(k)}(${lin(a, b)}) = ${lin(k * a, k * b)} et ${M}${c}(x${sg(d)}) = ${lin(-c, -c * d)}.`, `A = ${lin(k * a, k * b)}${mono(-c, 'x', false)}${sg(-c * d)} = ${lin(A, B)}.`],
              `A = ${lin(A, B)}.`),
            'Le signe moins devant ' + c + ' change le signe des deux termes de la parenthèse.'); }
      }),
      T({ // Double distributivité
        base: {a: 2, b: 3, c: 1, d: -4},
        params: r => ({a: r.int(1, 5), b: r.nonZero(1, 9), c: r.int(1, 5), d: r.nonZero(1, 9)}),
        accept: ({a, b, c, d}) => a * d + b * c !== 0 && (a > 1 || c > 1),
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a * c, a * d + b * c, b * d], negatives: true}),
        verify: ({a, b, c, d}, v) => [-1, 0, 2].every(x => (a * x + b) * (c * x + d) === v[0] * x * x + v[1] * x + v[2]),
        build: ({a, b, c, d}) => item('Utiliser la double distributivité', `Développe et réduis B = (${lin(a, b)})(${lin(c, d)}). On note B = αx² + βx + γ.`,
          [Q('Coefficient de x² (α)', a * c), Q('Coefficient de x (β)', a * d + b * c), Q('Terme constant (γ)', b * d)],
          C('chaque terme de la première parenthèse multiplie chaque terme de la seconde : quatre produits.',
            [`B = ${mono(a)} × ${mono(c)} + ${mono(a)} × ${pa(d)} + ${pa(b)} × ${mono(c)} + ${pa(b)} × ${pa(d)}.`, `B = ${mono(a * c, 'x²')}${mono(a * d, 'x', false)}${mono(b * c, 'x', false)}${sg(b * d)} = ${quad(a * c, a * d + b * c, b * d)}.`],
            `B = ${quad(a * c, a * d + b * c, b * d)}.`),
          'Écris les quatre produits avant de regrouper les termes en x.')
      }),
      T({ // Identités remarquables
        base: {kind: 0, b: 1, a: 3},
        params: r => ({kind: r.int(0, 2), b: r.int(1, 5), a: r.int(1, 9)}),
        accept: ({b, a}) => b !== a || b === 1,
        difficulty: ({b, a}) => score({steps: 3, values: [b * b, 2 * a * b, a * a]}),
        verify: ({kind, b, a}, v) => [-1, 0, 3].every(x => [(b * x + a) ** 2, (b * x - a) ** 2, (b * x + a) * (b * x - a)][kind] === v[0] * x * x + v[1] * x + v[2]),
        build: ({kind, b, a}) => {
          const bx = mono(b), expr = [`(${bx} + ${a})²`, `(${bx} ${M} ${a})²`, `(${bx} + ${a})(${bx} ${M} ${a})`][kind];
          const coefs = [[b * b, 2 * a * b, a * a], [b * b, -2 * a * b, a * a], [b * b, 0, -a * a]][kind];
          const rule = ['(u + v)² = u² + 2uv + v²', '(u − v)² = u² − 2uv + v²', '(u + v)(u − v) = u² − v²'][kind];
          return item('Reconnaître une identité remarquable', `Développe C = ${expr}. On note C = αx² + βx + γ.`,
            [Q('Coefficient de x² (α)', coefs[0]), Q('Coefficient de x (β)', coefs[1]), Q('Terme constant (γ)', coefs[2])],
            C(`on applique ${rule}, avec u = ${bx} et v = ${a}.`,
              [kind === 2 ? `C = (${bx})² ${M} ${a}² = ${quad(...coefs)}.` : `C = (${bx})² ${kind ? M : '+'} 2 × ${bx} × ${a} + ${a}² = ${quad(...coefs)}.`],
              `C = ${quad(...coefs)}.`),
            kind === 2 ? 'Le produit d’une somme par une différence ne contient pas de terme en x.' : 'N’oublie pas le double produit 2uv.');
        }
      }),
      T({ // Factoriser une différence de carrés
        base: {p: 3, q: 5},
        params: r => ({p: r.int(1, 9), q: r.int(1, 12)}),
        accept: ({p, q}) => gcd(p, q) === 1 && p * p <= 81,
        difficulty: ({p, q}) => score({steps: 2, values: [p * p, q * q]}),
        verify: ({p, q}, v) => v[0] * v[0] === p * p && v[1] * v[1] === q * q && v[0] > 0 && v[1] > 0,
        build: ({p, q}) => item('Factoriser une différence de deux carrés', `Factorise D = ${mono(p * p, 'x²')} ${M} ${q * q} sous la forme (px ${M} q)(px + q), avec p et q positifs.`,
          [Q('Valeur de p', p), Q('Valeur de q', q)],
          C('on reconnaît u² − v² = (u − v)(u + v).',
            [`${mono(p * p, 'x²')} = (${mono(p)})² et ${q * q} = ${q}².`],
            `D = (${mono(p)} ${M} ${q})(${mono(p)} + ${q}) : p = ${p} et q = ${q}.`),
          'Cherche de quoi chaque terme est le carré.')
      }),
      T({ // Facteur commun
        base: {g: 3, u: 2, v: 5},
        params: r => ({g: r.int(2, 9), u: r.int(1, 7), v: r.nonZero(1, 9)}),
        accept: ({u, v}) => gcd(u, Math.abs(v)) === 1 && u !== Math.abs(v),
        difficulty: ({g, u, v}) => score({steps: 2, values: [g * u, g * v], negatives: false}),
        verify: ({g, u, v}, v2) => v2[0] === g && v2[0] * v2[1] === g * u && v2[0] * v2[2] === g * v,
        build: ({g, u, v}) => item('Factoriser par un facteur commun', `Factorise E = ${mono(g * u, 'x²')}${mono(g * v, 'x', false)} sous la forme ax(bx + c), avec a le plus grand entier positif possible.`,
          [Q('Valeur de a', g), Q('Valeur de b', u), Q('Valeur de c', v)],
          C('on repère le facteur commun aux deux termes : le plus grand diviseur commun des coefficients, et x.',
            [`${mono(g * u, 'x²')} = ${g}x × ${mono(u)} et ${mono(g * v, 'x')} = ${g}x × ${pa(v)}.`],
            `E = ${g}x(${lin(u, v)}) : a = ${g}, b = ${u} et c = ${fr(v)}.`),
          'Développe ta réponse pour vérifier que tu retrouves E.')
      }),
      T({ // Programme de calcul
        base: {a: 3, n: 4},
        params: r => ({a: r.int(1, 9), n: r.nonZero(1, 9)}),
        accept: ({a, n}) => a !== Math.abs(n),
        difficulty: ({a, n}) => score({steps: 3, values: [(n + a) ** 2, 2 * a, a * a], negatives: n < 0}),
        verify: ({a, n}, v) => v[0] === (n + a) ** 2 - n * n && v[1] === 2 * a && v[2] === a * a,
        build: ({a, n}) => item('Démontrer avec un programme de calcul', `Programme : choisir un nombre ; lui ajouter ${a} ; élever le résultat au carré ; soustraire le carré du nombre de départ. On note x le nombre de départ et R le résultat, R = αx + β.`,
          [Q(`Résultat pour ${fr(n)}`, (n + a) ** 2 - n * n), Q('Coefficient α', 2 * a), Q('Terme β', a * a)],
          C('on traduit chaque étape en expression, puis on développe avec (x + a)² = x² + 2ax + a².',
            [`Avec ${fr(n)} : (${fr(n)} + ${a})² ${M} ${pa(n)}² = ${(n + a) ** 2} ${M} ${n * n} = ${fr((n + a) ** 2 - n * n)}.`, `En général : R = (x + ${a})² ${M} x² = x² + ${2 * a}x + ${a * a} ${M} x² = ${2 * a}x + ${a * a}.`],
            `pour ${fr(n)}, on obtient ${fr((n + a) ** 2 - n * n)} ; en général R = ${2 * a}x + ${a * a}.`),
          'Vérifie ton expression générale avec le nombre testé.')
      })
    ],

    /* ---------- 05 · Équations et inéquations ---------- */
    '3-equations': [
      T({ // ax + b = c
        base: {a: 3, b: 5, s: 4},
        params: r => ({a: r.nonZero(2, 9), b: r.nonZero(1, 20), s: r.nonZero(1, 12)}),
        difficulty: ({a, b, s}) => score({steps: 2, values: [a, b, a * s + b, s]}),
        verify: ({a, b, s}, v) => v[0] === a * s && a * v[1] + b === a * s + b,
        build: ({a, b, s}) => { const c = a * s + b; return item('Résoudre une équation du premier degré', `Résous l’équation ${lin(a, b)} = ${fr(c)}.`,
          [Q(`Valeur de ${mono(a)}`, a * s), Q('Solution x', s)],
          C('on isole le terme en x en retirant ' + fr(b) + ' aux deux membres, puis on divise par ' + fr(a) + '.',
            [`${mono(a)} = ${fr(c)} ${M} ${pa(b)} = ${fr(a * s)}.`, `x = ${fr(a * s)} ÷ ${pa(a)} = ${fr(s)}.`],
            `la solution est x = ${fr(s)}. Vérification : ${fr(a)} × ${pa(s)}${sg(b)} = ${fr(c)}.`),
          'Ce qu’on fait d’un côté de l’égalité, on le fait de l’autre.'); }
      }),
      T({ // ax + b = cx + d
        base: {a: 5, b: -3, c: 2, d: 9},
        params: r => ({a: r.nonZero(1, 9), b: r.nonZero(1, 15), c: r.nonZero(1, 9), d: r.nonZero(1, 15)}),
        accept: ({a, c, b, d}) => a !== c && d !== b,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a - c, d - b], fractions: (d - b) % (a - c) !== 0, negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === a - c && close(a * v[1] + b, c * v[1] + d),
        build: ({a, b, c, d}) => { const k = a - c, rhs = d - b;
          return item('Résoudre une équation avec x dans les deux membres', `Résous l’équation ${lin(a, b)} = ${lin(c, d)}.`,
            [Q('Coefficient de x après regroupement', k), Q('Solution x', rhs / k)],
            C('on regroupe les termes en x dans le membre de gauche et les nombres dans celui de droite.',
              [`${mono(a)}${mono(-c, 'x', false)} = ${fr(d)} ${M} ${pa(b)}, soit ${mono(k)} = ${fr(rhs)}.`, `x = ${fr(rhs)} ÷ ${pa(k)} = ${frac(rhs, k)}.`],
              `la solution est x = ${frac(rhs, k)}.`),
            'Retire ' + mono(c) + ' aux deux membres pour regrouper les x.'); }
      }),
      T({ // Équation produit nul
        base: {a: 2, b: -6, c: 1, d: 5},
        params: r => ({a: r.int(1, 5), b: r.nonZero(1, 12), c: r.int(1, 5), d: r.nonZero(1, 12)}),
        accept: ({a, b, c, d}) => b * c !== a * d && b % a === 0 && d % c === 0,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [b / a, d / c, a, c], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] < v[1] && [v[0], v[1]].every(x => close((a * x + b) * (c * x + d), 0)),
        build: ({a, b, c, d}) => { const x1 = -b / a, x2 = -d / c, lo = Math.min(x1, x2), hi = Math.max(x1, x2);
          return item('Résoudre une équation produit nul', `Résous l’équation (${lin(a, b)})(${lin(c, d)}) = 0.`,
            [Q('Plus petite solution', lo), Q('Plus grande solution', hi)],
            C('un produit est nul si et seulement si l’un au moins de ses facteurs est nul.',
              [`${lin(a, b)} = 0 donne x = ${fr(x1)} ; ${lin(c, d)} = 0 donne x = ${fr(x2)}.`],
              `l’équation a deux solutions : ${fr(lo)} et ${fr(hi)}.`),
            'Résous séparément chaque facteur égal à 0.'); }
      }),
      T({ // ax² = c
        base: {a: 3, s: 5},
        params: r => ({a: r.int(1, 6), s: r.int(2, 12)}),
        accept: ({a, s}) => a * s * s <= 600,
        difficulty: ({a, s}) => score({steps: 2, values: [a * s * s, s * s]}),
        verify: ({a, s}, v) => v[0] === s * s && v[1] * v[1] * a === a * s * s && v[1] > 0 && v[2] === -v[1],
        build: ({a, s}) => { const c = a * s * s; return item('Résoudre x² = k', `Résous l’équation ${mono(a, 'x²')} = ${c}.`,
          [Q('Valeur de x²', s * s), Q('Solution positive', s), Q('Solution négative', -s)],
          C('on se ramène à x² = k ; si k > 0, l’équation a deux solutions : √k et −√k.',
            [a > 1 ? `x² = ${c} ÷ ${a} = ${s * s}.` : `x² = ${c}.`, `√${s * s} = ${s}.`],
            `les solutions sont ${s} et ${M}${s}.`),
          'Un carré vaut ' + (s * s) + ' pour deux nombres opposés.'); }
      }),
      T({ // Inéquation
        base: {a: 3, b: -2, c: 10},
        params: r => ({a: r.nonZero(2, 7), b: r.nonZero(1, 15), c: r.int(-15, 20)}),
        accept: ({a, b, c}) => c !== b && Math.abs(c - b) % Math.abs(a) === 0,
        difficulty: ({a, b, c}) => score({steps: 3, values: [a, b, c, (c - b) / a]}),
        verify: ({a, b, c}, v) => close(v[0], (c - b) / a) && (v[1] === 'x < frontière') === (a > 0),
        build: ({a, b, c}) => { const s = (c - b) / a, less = a > 0;
          return item('Résoudre une inéquation', `Résous l’inéquation ${lin(a, b)} < ${fr(c)}.`,
            [Q('Valeur frontière', s), S('Les solutions sont les nombres x tels que', less ? 'x < frontière' : 'x > frontière', ['x < frontière', 'x > frontière'])],
            C('on isole x comme dans une équation ; diviser par un nombre négatif change le sens de l’inégalité.',
              [`${mono(a)} < ${fr(c)} ${M} ${pa(b)}, soit ${mono(a)} < ${fr(c - b)}.`, less ? `On divise par ${a}, positif : x < ${fr(s)}.` : `On divise par ${fr(a)}, négatif : le sens change, x > ${fr(s)}.`],
              `les solutions sont les nombres ${less ? 'strictement inférieurs' : 'strictement supérieurs'} à ${fr(s)}.`),
            'Regarde le signe du nombre par lequel tu divises.'); }
      }),
      T({ // Mise en équation : rectangle
        base: {w: 12, d: 5},
        params: r => ({w: r.int(3, 40), d: r.int(1, 20)}),
        difficulty: ({w, d}) => score({steps: 3, values: [w, d, 4 * w + 2 * d]}),
        verify: ({w, d}, v) => 2 * (v[0] + v[1]) === 4 * w + 2 * d && v[1] - v[0] === d,
        build: ({w, d}) => { const P = 4 * w + 2 * d; return item('Mettre un problème en équation', `La longueur d’un rectangle dépasse sa largeur de ${d} cm. Son périmètre vaut ${P} cm. On note x la largeur.`,
          [Q('Largeur, en cm', w), Q('Longueur, en cm', w + d)],
          C('on exprime la longueur en fonction de x, puis on écrit le périmètre : 2 × (largeur + longueur).',
            [`Longueur : x + ${d}. Périmètre : 2(x + x + ${d}) = 4x + ${2 * d}.`, `4x + ${2 * d} = ${P}, donc 4x = ${P - 2 * d} et x = ${w}.`],
            `la largeur mesure ${w} cm et la longueur ${w + d} cm. Vérification : 2 × (${w} + ${w + d}) = ${P}.`),
          'Écris le périmètre avec la seule inconnue x.'); }
      })
    ],

    /* ---------- 06 · Proportionnalité et pourcentages ---------- */
    '3-proportionnalite': [
      T({ // Quatrième proportionnelle
        base: {u: 235, a: 4, c: 7},
        params: r => ({u: r.int(105, 495), a: r.int(2, 9), c: r.int(2, 15)}),
        accept: ({u, a, c}) => a !== c && u % 5 === 0,
        difficulty: ({u, a, c}) => score({steps: 2, values: [u * a / 100, u * c / 100], decimals: true}),
        verify: ({u, a, c}, v) => close(v[0], u / 100) && close(v[1], u * a / 100 / a * c),
        build: ({u, a, c}) => { const p = u / 100, total = p * a;
          return item('Calculer une quatrième proportionnelle', `${a} kg de pommes coûtent ${fr(total)} €. Le prix est proportionnel à la masse.`,
            [Q('Prix d’un kilogramme, en €', p), Q(`Prix de ${c} kg, en €`, p * c)],
            C('dans une situation de proportionnalité, on passe par l’unité : on divise par la masse achetée.',
              [`${fr(total)} ÷ ${a} = ${fr(p)} € le kilogramme.`, `${fr(p)} × ${c} = ${fr(r2(p * c))} €.`],
              `le kilogramme coûte ${fr(p)} € et ${c} kg coûtent ${fr(r2(p * c))} €.`),
            'Calcule d’abord le prix d’un seul kilogramme.'); }
      }),
      T({ // Calculer un pourcentage
        base: {N: 25, k: 7},
        params: r => ({N: r.pick([20, 24, 25, 28, 30, 32, 40, 50, 80, 120, 150, 200, 250, 400]), k: r.int(1, 60)}),
        accept: ({N, k}) => k < N,
        difficulty: ({N, k}) => score({steps: 2, values: [N, k, 100 * k / N]}),
        verify: ({N, k}, v) => close(v[0], 100 * k / N) && v[1] === N - k,
        build: ({N, k}) => item('Exprimer une proportion en pourcentage', `Dans un club de ${N} adhérents, ${k} pratiquent la natation.`,
          [Q('Part des nageurs, en %', 100 * k / N, 1), Q('Adhérents qui ne nagent pas', N - k)],
          C('pourcentage = effectif de la partie ÷ effectif total × 100.',
            [`${k} ÷ ${N} × 100 ${eq(100 * k / N, 1)} %.`, `${N} ${M} ${k} = ${N - k}.`],
            `${about(100 * k / N, 1)} % des adhérents nagent ; ${N - k} ne nagent pas.`),
          'Divise par l’effectif total, pas par l’effectif restant.')
      }),
      T({ // Coefficient multiplicateur
        base: {P: 80, t: 15, up: 0},
        params: r => ({P: 5 * r.int(4, 60), t: r.pick([5, 10, 12, 15, 20, 25, 30, 35, 40]), up: r.int(0, 1)}),
        difficulty: ({P, t}) => score({steps: 2, values: [P, t, P * (1 + t / 100)], decimals: true}),
        verify: ({P, t, up}, v) => close(v[0], up ? 1 + t / 100 : 1 - t / 100) && close(v[1], P * v[0]),
        build: ({P, t, up}) => { const k = up ? 1 + t / 100 : 1 - t / 100;
          return item('Appliquer une évolution en pourcentage', `Un article coûte ${P} €. Son prix ${up ? 'augmente' : 'baisse'} de ${t} %.`,
            [Q('Coefficient multiplicateur', k, 3), Q('Nouveau prix, en €', P * k)],
            C(`${up ? 'augmenter' : 'baisser'} de t % revient à multiplier par 1 ${up ? '+' : M} t/100.`,
              [`Coefficient : 1 ${up ? '+' : M} ${t}/100 = ${fr(k)}.`, `${P} × ${fr(k)} = ${fr(r2(P * k))} €.`],
              `le coefficient vaut ${fr(k)} et le nouveau prix est ${fr(r2(P * k))} €.`),
            'Le coefficient d’une ' + (up ? 'hausse est supérieur' : 'baisse est inférieur') + ' à 1.'); }
      }),
      T({ // Retrouver la valeur initiale
        base: {P: 60, t: 20, up: 1},
        params: r => ({P: 10 * r.int(3, 40), t: r.pick([10, 20, 25, 30, 40, 50]), up: r.int(0, 1)}),
        difficulty: ({P, t}) => score({steps: 2, values: [P, t, P * (1 + t / 100)], decimals: true}),
        verify: ({P, t, up}, v) => close(v[0], up ? 1 + t / 100 : 1 - t / 100) && close(v[1] * v[0], P * (up ? 1 + t / 100 : 1 - t / 100)),
        build: ({P, t, up}) => { const k = up ? 1 + t / 100 : 1 - t / 100, Q2 = P * k;
          return item('Retrouver un prix avant évolution', `Après une ${up ? 'hausse' : 'baisse'} de ${t} %, un abonnement coûte ${fr(Q2)} €.`,
            [Q('Coefficient multiplicateur', k, 3), Q('Prix avant l’évolution, en €', P)],
            C('prix final = prix initial × coefficient ; on retrouve le prix initial en divisant par le coefficient.',
              [`Coefficient : ${fr(k)}.`, `${fr(Q2)} ÷ ${fr(k)} = ${P} €.`],
              `l’abonnement coûtait ${P} € avant l’évolution. Retirer ${t} % au prix final ne donnerait pas ce résultat.`),
            'Divise par le coefficient ; n’applique pas le pourcentage inverse.'); }
      }),
      T({ // Partage selon un ratio
        base: {a: 2, b: 3, k: 30},
        params: r => ({a: r.int(1, 7), b: r.int(2, 9), k: r.int(5, 60)}),
        accept: ({a, b}) => a < b && gcd(a, b) === 1,
        difficulty: ({a, b, k}) => score({steps: 2, values: [(a + b) * k, a * k, b * k]}),
        verify: ({a, b, k}, v) => v[0] + v[1] === (a + b) * k && v[0] * b === v[1] * a,
        build: ({a, b, k}) => { const S2 = (a + b) * k; return item('Partager selon un ratio', `Deux associés se partagent ${S2} € dans le ratio ${a} : ${b}.`,
          [Q('Part du premier, en €', a * k), Q('Part du second, en €', b * k)],
          C('le ratio a : b découpe la somme en a + b parts égales ; le premier en reçoit a, le second b.',
            [`${a} + ${b} = ${a + b} parts ; une part vaut ${S2} ÷ ${a + b} = ${k} €.`, `${a} × ${k} = ${a * k} € et ${b} × ${k} = ${b * k} €.`],
            `le premier reçoit ${a * k} € et le second ${b * k} €.`),
          'Commence par compter le nombre total de parts.'); }
      }),
      T({ // Échelle d'une carte
        base: {d: 45, E: 25000},
        params: r => ({d: r.int(12, 99), E: r.pick([10000, 20000, 25000, 50000, 100000, 200000, 250000])}),
        accept: ({d}) => d % 10 !== 0,
        difficulty: ({d, E}) => score({steps: 2, values: [d * E / 1000], decimals: true}),
        verify: ({d, E}, v) => close(v[0], d / 10 * E / 100) && close(v[1], v[0] / 1000),
        build: ({d, E}) => { const c = d / 10, m = c * E / 100;
          return item('Utiliser une échelle', `Sur une carte à l’échelle 1/${fr(E)}, deux villages sont séparés de ${fr(c)} cm.`,
            [Q('Distance réelle, en m', m), Q('Distance réelle, en km', m / 1000, 3)],
            C('à l’échelle 1/' + fr(E) + ', 1 cm sur la carte représente ' + fr(E) + ' cm en réalité.',
              [`${fr(c)} × ${fr(E)} = ${fr(c * E)} cm = ${fr(m)} m.`, `${fr(m)} m = ${fr(m / 1000)} km.`],
              `les villages sont distants de ${fr(m)} m, soit ${fr(m / 1000)} km.`),
            'Multiplie par le dénominateur de l’échelle, puis convertis : 100 cm = 1 m.'); }
      })
    ],

    /* ---------- 07 · Notion de fonction ---------- */
    '3-fonctions': [
      T({ // Images par une formule
        base: {a: 2, b: -3, c: 1, n: 3, m: -2},
        params: r => ({a: r.nonZero(1, 4), b: r.nonZero(1, 7), c: r.int(-9, 9), n: r.int(1, 6), m: r.int(-6, -1)}),
        accept: ({a, b, c, n, m}) => c !== 0 && a * n * n + b * n + c !== 0 && a * m * m + b * m + c !== 0,
        difficulty: ({a, b, c, n, m}) => score({steps: 3, values: [a * n * n + b * n + c, a * m * m + b * m + c], negatives: true}),
        verify: ({a, b, c, n, m}, v) => v[0] === a * n ** 2 + b * n + c && v[1] === a * m ** 2 + b * m + c,
        build: ({a, b, c, n, m}) => { const f = x => a * x * x + b * x + c;
          return item('Calculer des images', `La fonction f est définie par f(x) = ${quad(a, b, c)}. Calcule f(${n}) et f(${fr(m)}).`,
            [Q(`f(${n})`, f(n)), Q(`f(${fr(m)})`, f(m))],
            C('pour calculer une image, on remplace x par la valeur donnée, en mettant les nombres négatifs entre parenthèses.',
              [`f(${n}) = ${fmt.times(a, n + '²', true)}${fmt.times(b, n)}${sg(c)} = ${fr(f(n))}.`, `f(${fr(m)}) = ${fmt.times(a, '(' + fr(m) + ')²', true)}${fmt.times(b, m)}${sg(c)} = ${fr(f(m))}.`],
              `f(${n}) = ${fr(f(n))} et f(${fr(m)}) = ${fr(f(m))}.`),
            'Le carré d’un nombre négatif est positif : (' + fr(m) + ')² = ' + m * m + '.'); }
      }),
      T({ // Lecture d'un tableau de valeurs
        base: {a: 3, b: -1, x0: 2, i: 0},
        params: r => ({a: r.nonZero(2, 6), b: r.int(-9, 9), x0: r.int(-2, 3), i: r.int(0, 5)}),
        accept: ({x0, i}) => x0 !== i - 2,
        difficulty: ({a, b}) => score({steps: 2, values: [3 * a + b, -2 * a + b], negatives: true}),
        verify: ({a, b, x0, i}, v) => v[0] === a * x0 + b && a * v[1] + b === a * (i - 2) + b,
        build: ({a, b, x0, i}) => { const xs = [-2, -1, 0, 1, 2, 3], ys = xs.map(x => a * x + b), y0 = ys[i], ante = xs[i];
          return item('Lire un tableau de valeurs', 'Voici un tableau de valeurs d’une fonction f.' + table('Tableau de valeurs de f', xs, [{label: 'f(x)', cells: ys}], 'x'),
            [Q(`Image de ${fr(x0)}`, a * x0 + b), Q(`Antécédent de ${fr(y0)}`, ante)],
            C('l’image se lit sur la ligne f(x), sous la valeur de x ; un antécédent se lit sur la ligne x, au-dessus de la valeur de f(x).',
              [`Sous x = ${fr(x0)}, on lit ${fr(a * x0 + b)}.`, `Au-dessus de ${fr(y0)}, on lit x = ${fr(ante)}.`],
              `l’image de ${fr(x0)} est ${fr(a * x0 + b)} et l’antécédent de ${fr(y0)} est ${fr(ante)}.`),
            'Image : on part de x. Antécédent : on part de f(x).'); }
      }),
      T({ // Antécédent par le calcul
        base: {a: 4, b: -5, s: 3},
        params: r => ({a: r.nonZero(2, 9), b: r.nonZero(1, 15), s: r.nonZero(1, 10)}),
        difficulty: ({a, b, s}) => score({steps: 3, values: [a, b, a * s + b, s], negatives: true}),
        verify: ({a, b, s}, v) => v[0] === b && a * v[1] + b === a * s + b,
        build: ({a, b, s}) => { const y = a * s + b; return item('Calculer un antécédent', `g(x) = ${lin(a, b)}. Calcule g(0), puis l’antécédent de ${fr(y)} par g.`,
          [Q('g(0)', b), Q(`Antécédent de ${fr(y)}`, s)],
          C('un antécédent de y est un nombre x tel que g(x) = y : on résout une équation.',
            [`g(0) = ${fr(a)} × 0${sg(b)} = ${fr(b)}.`, `${lin(a, b)} = ${fr(y)} donne ${mono(a)} = ${fr(y - b)}, donc x = ${fr(s)}.`],
            `g(0) = ${fr(b)} et l’antécédent de ${fr(y)} est ${fr(s)}.`),
          'Pose l’équation g(x) = ' + fr(y) + '.'); }
      }),
      T({ // Un point sur la courbe ?
        base: {b: -2, c: 3, p: 4, on: 1, k: 2},
        params: r => ({b: r.int(-6, 6), c: r.int(-9, 9), p: r.nonZero(1, 6), on: r.int(0, 1), k: r.nonZero(1, 5)}),
        accept: ({b, c}) => b !== 0 && c !== 0,
        difficulty: ({b, c, p}) => score({steps: 2, values: [p * p + b * p + c], negatives: true}),
        verify: ({b, c, p, on, k}, v) => v[0] === p * p + b * p + c && (v[1] === 'oui') === !!on,
        build: ({b, c, p, on, k}) => { const fp = p * p + b * p + c, q = on ? fp : fp + k;
          return item('Tester l’appartenance d’un point', `f(x) = ${quad(1, b, c)}. Le point A(${fr(p)} ; ${fr(q)}) appartient-il à la courbe de f ?`,
            [Q(`f(${fr(p)})`, fp), S('A est-il sur la courbe ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('un point appartient à la courbe lorsque son ordonnée est l’image de son abscisse.',
              [`f(${fr(p)}) = ${pa(p)}²${fmt.times(b, p)}${sg(c)} = ${fr(fp)}.`],
              on ? `f(${fr(p)}) = ${fr(q)} : A appartient à la courbe.` : `f(${fr(p)}) = ${fr(fp)} ≠ ${fr(q)} : A n’appartient pas à la courbe.`),
            'Calcule l’image de l’abscisse et compare-la à l’ordonnée.'); }
      }),
      T({ // Tarif de taxi
        base: {P: 4, k: 15, d: 12, D: 20},
        params: r => ({P: r.int(2, 8), k: r.int(11, 25), d: r.int(3, 30), D: r.int(5, 40)}),
        accept: ({d, D}) => d !== D,
        difficulty: ({P, k, d, D}) => score({steps: 3, values: [P + k * d / 10, P + k * D / 10], decimals: true}),
        verify: ({P, k, d, D}, v) => close(v[0], P + k / 10 * d) && close(P + k / 10 * v[1], P + k / 10 * D),
        build: ({P, k, d, D}) => { const u = k / 10, f = x => P + u * x, M2 = f(D);
          return item('Utiliser une fonction en contexte', `Un taxi facture une prise en charge de ${P} € puis ${fr(u)} € par kilomètre. On note f(x) le prix, en €, d’une course de x km : f(x) = ${P} + ${fr(u)}x.`,
            [Q(`Prix d’une course de ${d} km, en €`, f(d)), Q(`Distance parcourue pour ${fr(r2(M2))} €, en km`, D)],
            C('on calcule une image pour le prix, et on résout f(x) = prix pour la distance.',
              [`f(${d}) = ${P} + ${fr(u)} × ${d} = ${fr(r2(f(d)))} €.`, `${P} + ${fr(u)}x = ${fr(r2(M2))} donne ${fr(u)}x = ${fr(r2(M2 - P))}, puis x = ${D}.`],
              `une course de ${d} km coûte ${fr(r2(f(d)))} € ; pour ${fr(r2(M2))} €, on parcourt ${D} km.`),
            'Le prix d’une course est une image ; la distance correspondant à un prix est un antécédent.'); }
      }),
      T({ // Antécédents de 0 par ax² − c
        base: {a: 1, s: 4},
        params: r => ({a: r.int(1, 5), s: r.int(2, 15)}),
        accept: ({a, s}) => a * s * s <= 500,
        difficulty: ({s}) => score({steps: 2, values: [s]}),
        verify: ({a, s}, v) => v[0] === -a * s * s && a * v[1] * v[1] === a * s * s && a * v[2] * v[2] === a * s * s && v[1] < 0 && v[2] > 0,
        build: ({a, s}) => { const c = a * s * s;
          return item('Trouver les antécédents de 0', `h(x) = ${mono(a, 'x²')} ${M} ${c}. Calcule h(0), puis les antécédents de 0 par h.`,
            [Q('h(0)', -c), Q('Antécédent négatif de 0', -s), Q('Antécédent positif de 0', s)],
            C('les antécédents de 0 sont les solutions de h(x) = 0' + (a > 1 ? ', c’est-à-dire ' + a + 'x² = ' + c + ', puis x² = ' + s * s + '.' : ', c’est-à-dire x² = ' + c + '.'),
              [`h(0) = ${a > 1 ? a + ' × ' : ''}0² ${M} ${c} = ${M}${c}.`, `x² = ${s * s} pour x = ${s} ou x = ${M}${s}.`],
              `h(0) = ${M}${c} ; 0 a deux antécédents : ${M}${s} et ${s}.`),
            'Un nombre et son opposé ont le même carré.'); }
      })
    ],

    /* ---------- 08 · Fonctions linéaires et affines ---------- */
    '3-fonctions-affines': [
      T({ // Fonction linéaire
        base: {a: 25, p: 4, r: 7},
        params: r => ({a: r.nonZero(5, 45), p: r.int(2, 12), r: r.int(2, 20)}),
        accept: ({a, p, r}) => a % 5 === 0 && Math.abs(a) !== 10 && p !== r,
        difficulty: ({a, p, r}) => score({steps: 2, values: [a * p / 10, a * r / 10], decimals: true}),
        verify: ({a, p, r}, v) => close(v[0] * p, a * p / 10) && close(v[1], v[0] * r),
        build: ({a, p, r}) => { const k = a / 10; return item('Déterminer une fonction linéaire', `f est une fonction linéaire telle que f(${p}) = ${fr(k * p)}. On écrit f(x) = ax.`,
          [Q('Coefficient a', k), Q(`f(${r})`, k * r)],
          C('pour une fonction linéaire, f(x) = ax, donc a = f(p) ÷ p.',
            [`a = ${fr(k * p)} ÷ ${p} = ${fr(k)}.`, `f(${r}) = ${fr(k)} × ${r} = ${fr(r2(k * r))}.`],
            `f(x) = ${fr(k)}x et f(${r}) = ${fr(r2(k * r))}.`),
          'Divise l’image par le nombre de départ.'); }
      }),
      T({ // Fonction affine par deux images
        base: {a: 3, b: -2, x1: 1, x2: 4},
        params: r => ({a: r.nonZero(1, 6), b: r.nonZero(1, 12), x1: r.int(-4, 3), x2: r.int(1, 8)}),
        accept: ({x1, x2}) => x2 > x1 && x1 !== 0,
        difficulty: ({a, b, x1, x2}) => score({steps: 3, values: [a * x1 + b, a * x2 + b, x2 - x1], negatives: true}),
        verify: ({a, b, x1, x2}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * x2 + v[1] === a * x2 + b,
        build: ({a, b, x1, x2}) => { const y1 = a * x1 + b, y2 = a * x2 + b;
          return item('Déterminer une fonction affine', `g est affine, g(${fr(x1)}) = ${fr(y1)} et g(${x2}) = ${fr(y2)}. On écrit g(x) = ax + b.`,
            [Q('Coefficient a', a), Q('Ordonnée à l’origine b', b)],
            C('a = (g(x₂) − g(x₁)) ÷ (x₂ − x₁), puis b se déduit d’une image connue.',
              [`a = (${fmt.diff(y2, y1)}) ÷ (${fmt.diff(x2, x1)}) = ${fr(y2 - y1)} ÷ ${x2 - x1} = ${fr(a)}.`, `b = ${fr(y2)} ${M} ${pa(a)} × ${x2} = ${fr(b)}.`],
              `g(x) = ${lin(a, b)}.`),
            'Le coefficient a mesure la variation de g(x) quand x augmente de 1.'); }
      }),
      T({ // Pourcentage et fonction linéaire
        base: {t: 20, up: 1, P: 45},
        params: r => ({t: r.pick([5, 10, 15, 20, 25, 30, 40]), up: r.int(0, 1), P: r.int(12, 150)}),
        difficulty: ({t, P}) => score({steps: 2, values: [t, P, P * (1 + t / 100)], decimals: true}),
        verify: ({t, up, P}, v) => close(v[0], 1 + (up ? 1 : -1) * t / 100) && close(v[1], v[0] * P),
        build: ({t, up, P}) => { const k = 1 + (up ? 1 : -1) * t / 100;
          return item('Modéliser une évolution par une fonction linéaire', `Une ${up ? 'hausse' : 'baisse'} de ${t} % est modélisée par une fonction linéaire f : x ↦ ax, où x est le prix initial.`,
            [Q('Coefficient a', k, 3), Q(`f(${P})`, k * P)],
            C(`une ${up ? 'hausse' : 'baisse'} de t % multiplie le prix par 1 ${up ? '+' : M} t/100.`,
              [`a = ${fr(k)}.`, `f(${P}) = ${fr(k)} × ${P} = ${fr(r2(k * P))}.`],
              `f(x) = ${fr(k)}x ; un prix de ${P} € devient ${fr(r2(k * P))} €.`),
            'Le coefficient d’une évolution en pourcentage est un coefficient multiplicateur.'); }
      }),
      T({ // Intersection de deux droites
        base: {a: 2, b: 1, c: -1, s: 3},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-10, 10), c: r.nonZero(1, 6), s: r.int(-6, 6)}),
        accept: ({a, c, s}) => a !== c && s !== 0,
        difficulty: ({a, b, c, s}) => score({steps: 3, values: [a - c, a * s + b, s], negatives: true}),
        verify: ({a, b, c, s}, v) => { const d = a * s + b - c * s; return a * v[0] + b === c * v[0] + d && v[1] === a * v[0] + b; },
        build: ({a, b, c, s}) => { const d = a * s + b - c * s, y = a * s + b;
          return item('Trouver le point d’intersection', `f(x) = ${lin(a, b)} et g(x) = ${lin(c, d)}. Les droites représentant f et g se coupent en un point.`,
            [Q('Abscisse du point d’intersection', s), Q('Ordonnée du point d’intersection', y)],
            C('au point d’intersection, f(x) = g(x) : on résout cette équation, puis on calcule l’image.',
              [`${lin(a, b)} = ${lin(c, d)} donne ${mono(a - c)} = ${fr(d - b)}, donc x = ${fr(s)}.`, `f(${fr(s)}) = ${fr(a)} × ${pa(s)}${sg(b)} = ${fr(y)}.`],
              `les droites se coupent au point (${fr(s)} ; ${fr(y)}).`),
            'Vérifie que g donne la même ordonnée que f.'); }
      }),
      T({ // Comparer deux tarifs
        base: {m: 8, S: 35, n: 5, k: 6},
        params: r => ({m: r.int(5, 15), S: 5 * r.int(2, 12), n: r.int(2, 10), k: r.int(3, 15)}),
        accept: ({m, n, S}) => n < m && S % (m - n) !== 0,
        difficulty: ({m, S, n, k}) => score({steps: 3, values: [m * k, S + n * k, S / (m - n)]}),
        verify: ({m, S, n, k}, v) => v[0] === m * k && v[1] === S + n * k && S + n * v[2] < m * v[2] && !(S + n * (v[2] - 1) < m * (v[2] - 1)),
        build: ({m, S, n, k}) => { const N0 = Math.floor(S / (m - n)) + 1;
          return item('Comparer deux tarifs', `Piscine : tarif A à ${m} € l’entrée ; tarif B avec un abonnement de ${S} € puis ${n} € l’entrée.`,
            [Q(`Coût de ${k} entrées au tarif A, en €`, m * k), Q(`Coût de ${k} entrées au tarif B, en €`, S + n * k), Q('Nombre minimal d’entrées pour que B soit moins cher', N0)],
            C('on modélise les tarifs par f(x) = ' + m + 'x (linéaire) et g(x) = ' + S + ' + ' + n + 'x (affine), puis on résout g(x) < f(x).',
              [`f(${k}) = ${m * k} € et g(${k}) = ${S + n * k} €.`, `${S} + ${n}x < ${m}x donne ${S} < ${m - n}x, soit x > ${fr(r2(S / (m - n)))}.`],
              `B devient moins cher à partir de ${N0} entrées.`),
            'Le nombre d’entrées est un entier : prends le premier entier qui convient.'); }
      }),
      T({ // Sens de variation
        base: {a: -3, b: 7, k: 4},
        params: r => ({a: r.nonZero(1, 8), b: r.int(-12, 12), k: r.int(-6, 9)}),
        accept: ({k, b}) => k !== 0 && b !== 0,
        difficulty: ({a, b, k}) => score({steps: 2, values: [a * k + b, a, b], negatives: true}),
        verify: ({a, b, k}, v) => (v[0] === 'croissante') === (a > 0) && v[1] === a * k + b,
        build: ({a, b, k}) => item('Lire le sens de variation', `f(x) = ${lin(a, b)}. Indique le sens de variation de f, puis calcule f(${fr(k)}).`,
          [S('f est', a > 0 ? 'croissante' : 'décroissante', ['croissante', 'décroissante']), Q(`f(${fr(k)})`, a * k + b)],
          C('une fonction affine x ↦ ax + b est croissante si a > 0 et décroissante si a < 0.',
            [`a = ${fr(a)} est ${a > 0 ? 'positif' : 'négatif'}.`, `f(${fr(k)}) = ${fr(a)} × ${pa(k)}${sg(b)} = ${fr(a * k + b)}.`],
            `f est ${a > 0 ? 'croissante' : 'décroissante'} et f(${fr(k)}) = ${fr(a * k + b)}.`),
          'Seul le signe du coefficient de x décide du sens de variation.')
      })
    ],

    /* ---------- 09 · Statistiques ---------- */
    '3-statistiques': [
      T({ // Moyenne et étendue
        base: {v: [12, 8, 15, 10, 14, 9, 16]},
        params: r => ({v: Array.from({length: 7}, () => r.int(4, 20))}),
        accept: ({v}) => Math.max(...v) - Math.min(...v) >= 5,
        difficulty: ({v}) => score({steps: 2, values: [sum(v), Math.max(...v)], decimals: !Number.isInteger(sum(v) / 7)}),
        verify: ({v}, w) => close(w[0], sum(v) / 7) && w[1] === Math.max(...v) - Math.min(...v),
        build: ({v}) => item('Calculer une moyenne et une étendue', `Voici les notes sur 20 d’un élève : ${v.join(' ; ')}.`,
          [Q('Moyenne', sum(v) / 7), Q('Étendue', Math.max(...v) - Math.min(...v))],
          C('moyenne = somme des valeurs ÷ nombre de valeurs ; étendue = plus grande valeur − plus petite valeur.',
            [`Somme : ${v.join(' + ')} = ${sum(v)} ; ${sum(v)} ÷ 7 ${eq(sum(v) / 7)}.`, `Étendue : ${Math.max(...v)} ${M} ${Math.min(...v)} = ${Math.max(...v) - Math.min(...v)}.`],
            `la moyenne vaut ${about(sum(v) / 7)} et l’étendue ${Math.max(...v) - Math.min(...v)}.`),
          'Il y a 7 notes : divise la somme par 7.')
      }),
      T({ // Médiane
        base: {v: [3, 7, 2, 9, 5, 4, 8, 6]},
        params: r => ({v: Array.from({length: r.pick([7, 8, 9, 10])}, () => r.int(1, 30))}),
        accept: ({v}) => new Set(v).size === v.length,
        difficulty: ({v}) => score({steps: 3, values: [Math.max(...v), sum(v) / v.length]}),
        verify: ({v}, w) => { const s = [...v].sort((a, b) => a - b), n = s.length; return close(w[0], n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) && close(w[1], sum(v) / n); },
        build: ({v}) => { const s = [...v].sort((a, b) => a - b), n = s.length, med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
          return item('Déterminer une médiane', `Temps de trajet, en minutes, de ${n} élèves : ${v.join(' ; ')}.`,
            [Q('Médiane', med), Q('Moyenne', sum(v) / n)],
            C('on range les valeurs dans l’ordre croissant ; la médiane partage la série en deux groupes de même effectif.',
              [`Série rangée : ${s.join(' ; ')}.`, n % 2 ? `${n} valeurs : la médiane est la ${(n + 1) / 2}e, soit ${med}.` : `${n} valeurs : la médiane est la moyenne des ${n / 2}e et ${n / 2 + 1}e, soit (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${fr(med)}.`, `Moyenne : ${sum(v)} ÷ ${n} ${eq(sum(v) / n)}.`],
              `la médiane vaut ${fr(med)} min et la moyenne ${about(sum(v) / n)} min.`),
            'Range d’abord les valeurs ; ne prends pas la valeur du milieu de la liste non triée.'); }
      }),
      T({ // Moyenne pondérée
        base: {e: [3, 5, 8, 4]},
        params: r => ({e: Array.from({length: 4}, () => r.int(1, 15))}),
        difficulty: ({e}) => score({steps: 3, values: [sum(e), e[1] + 2 * e[2] + 3 * e[3]], decimals: true}),
        verify: ({e}, w) => w[0] === sum(e) && close(w[1], (e[1] + 2 * e[2] + 3 * e[3]) / sum(e)),
        build: ({e}) => { const n = sum(e), s2 = e[1] + 2 * e[2] + 3 * e[3];
          return item('Calculer une moyenne pondérée', 'On a demandé à des élèves combien de frères et sœurs ils ont.' + table('Nombre de frères et sœurs', [0, 1, 2, 3], [{label: 'Effectif', cells: e}], 'Frères et sœurs'),
            [Q('Effectif total', n), Q('Nombre moyen de frères et sœurs', s2 / n)],
            C('moyenne pondérée = somme des produits valeur × effectif ÷ effectif total.',
              [`Effectif total : ${e.join(' + ')} = ${n}.`, `0 × ${e[0]} + 1 × ${e[1]} + 2 × ${e[2]} + 3 × ${e[3]} = ${s2} ; ${s2} ÷ ${n} ${eq(s2 / n)}.`],
              `${n} élèves ont répondu ; ils ont en moyenne ${about(s2 / n)} frère ou sœur.`),
            'Chaque valeur compte autant de fois que son effectif.'); }
      }),
      T({ // Fréquence
        base: {e: [12, 7, 5, 6], i: 1},
        params: r => ({e: Array.from({length: 4}, () => r.int(3, 30)), i: r.int(0, 3)}),
        difficulty: ({e, i}) => score({steps: 2, values: [sum(e), 100 * e[i] / sum(e)], decimals: true}),
        verify: ({e, i}, w) => w[0] === sum(e) && close(w[1], 100 * e[i] / sum(e)),
        build: ({e, i}) => { const names = ['Bus', 'Vélo', 'Voiture', 'À pied'], n = sum(e);
          return item('Calculer une fréquence', 'Mode de transport des élèves d’un collège.' + table('Mode de transport', names, [{label: 'Effectif', cells: e}], 'Transport'),
            [Q('Effectif total', n), Q(`Fréquence de « ${names[i]} », en %`, 100 * e[i] / n, 1)],
            C('fréquence = effectif de la valeur ÷ effectif total ; on multiplie par 100 pour l’exprimer en pourcentage.',
              [`Effectif total : ${e.join(' + ')} = ${n}.`, `${e[i]} ÷ ${n} × 100 ${eq(100 * e[i] / n, 1)} %.`],
              `la fréquence de « ${names[i]} » est d’${about(100 * e[i] / n, 1)} %.`),
            'La somme des fréquences de toutes les modalités vaut 100 %.'); }
      }),
      T({ // Note nécessaire
        base: {n: 4, m: 11, t: 12},
        params: r => ({n: r.int(3, 6), m: r.int(8, 14), t: r.int(10, 15)}),
        accept: ({n, m, t}) => { const x = t * (n + 1) - n * m; return t !== m && x >= 0 && x <= 20; },
        difficulty: ({n, m, t}) => score({steps: 3, values: [n * m, t * (n + 1)]}),
        verify: ({n, m, t}, v) => v[0] === n * m && (v[0] + v[1]) / (n + 1) === t,
        build: ({n, m, t}) => { const x = t * (n + 1) - n * m; return item('Atteindre une moyenne', `Sam a ${n} notes et sa moyenne est ${m}. Il veut obtenir ${t} de moyenne après une nouvelle note.`,
          [Q('Somme des notes actuelles', n * m), Q('Note nécessaire', x)],
          C('la somme des notes vaut moyenne × nombre de notes ; avec la nouvelle note, il y aura ' + (n + 1) + ' notes.',
            [`Somme actuelle : ${n} × ${m} = ${n * m}.`, `Somme visée : ${t} × ${n + 1} = ${t * (n + 1)} ; note : ${t * (n + 1)} ${M} ${n * m} = ${x}.`],
            `il faut à Sam une note de ${x} pour atteindre ${t} de moyenne.`),
          'Raisonne sur les sommes de notes, pas sur les moyennes.'); }
      }),
      T({ // Comparer deux séries
        base: {a: [11, 12, 10, 13, 12], b: [6, 15, 18, 9, 10], swap: 0},
        params: r => { const c = r.int(9, 13); return {a: Array.from({length: 5}, () => c + r.int(-2, 2)), b: Array.from({length: 5}, () => c + r.int(-7, 7)), swap: r.int(0, 1)}; },
        accept: ({a, b}) => { const ea = Math.max(...a) - Math.min(...a), eb = Math.max(...b) - Math.min(...b); return eb >= ea + 4 && ea >= 1 && Math.min(...b) >= 0 && Math.max(...b) <= 20; },
        difficulty: () => score({steps: 3, values: [20]}),
        verify: ({a, b, swap}, v) => { const [x, y] = swap ? [b, a] : [a, b], ex = Math.max(...x) - Math.min(...x), ey = Math.max(...y) - Math.min(...y); return v[0] === ex && v[1] === ey && v[2] === (ex < ey ? 'Groupe A' : 'Groupe B'); },
        build: ({a, b, swap}) => { const [x, y] = swap ? [b, a] : [a, b], ex = Math.max(...x) - Math.min(...x), ey = Math.max(...y) - Math.min(...y);
          return item('Comparer la dispersion de deux séries', `Notes à un contrôle. Groupe A : ${x.join(' ; ')}. Groupe B : ${y.join(' ; ')}.`,
            [Q('Étendue du groupe A', ex), Q('Étendue du groupe B', ey), S('Groupe aux résultats les plus homogènes', ex < ey ? 'Groupe A' : 'Groupe B', ['Groupe A', 'Groupe B'])],
            C('l’étendue mesure l’écart entre la plus grande et la plus petite valeur : plus elle est faible, plus la série est homogène.',
              [`A : ${Math.max(...x)} ${M} ${Math.min(...x)} = ${ex}. B : ${Math.max(...y)} ${M} ${Math.min(...y)} = ${ey}.`],
              `le groupe ${ex < ey ? 'A' : 'B'} a la plus petite étendue : ses résultats sont les plus homogènes.`),
            'Compare les étendues, pas les moyennes.'); }
      })
    ],

    /* ---------- 10 · Probabilités ---------- */
    '3-probabilites': [
      T({ // Urne
        base: {r: 5, b: 3, v: 2},
        params: r => ({r: r.int(1, 12), b: r.int(1, 12), v: r.int(1, 12)}),
        accept: ({r, b, v}) => r + b + v <= 30 && r !== b,
        difficulty: ({r, b, v}) => score({steps: 2, values: [r + b + v], fractions: true}),
        verify: ({r, b, v}, w) => sameFrac(w[0], r, r + b + v) && sameFrac(w[1], r + v, r + b + v),
        build: ({r, b, v}) => { const t = r + b + v; return item('Calculer une probabilité simple', `Une urne contient ${r} boules rouges, ${b} bleues et ${v} vertes, indiscernables au toucher. On tire une boule au hasard.`,
          [Q('Probabilité de tirer une rouge', r / t), Q('Probabilité de ne pas tirer une bleue', (r + v) / t)],
          C('les issues sont équiprobables : probabilité = nombre d’issues favorables ÷ nombre total d’issues.',
            [`Il y a ${t} boules. P(rouge) = ${r}/${t}${gcd(r, t) > 1 ? ' = ' + frac(r, t) : ''}.`, `P(pas bleue) = 1 ${M} ${b}/${t} = ${frac(r + v, t)}.`],
            `P(rouge) = ${frac(r, t)} et P(pas bleue) = ${frac(r + v, t)}.`),
          'Utilise l’événement contraire : ne pas tirer une bleue.'); }
      }),
      T({ // Dé à n faces
        base: {n: 6, k: 3, m: 4},
        params: r => ({n: r.pick([6, 8, 10, 12, 20]), k: r.int(2, 5), m: r.int(2, 15)}),
        accept: ({n, k, m}) => m < n && k < n,
        difficulty: ({n}) => score({steps: 2, values: [n], fractions: true}),
        verify: ({n, k, m}, w) => { let a = 0, b = 0; for (let f = 1; f <= n; f++) { if (f % k === 0) a++; if (f > m) b++; } return sameFrac(w[0], a, n) && sameFrac(w[1], b, n); },
        build: ({n, k, m}) => { const mult = Math.floor(n / k), above = n - m, list = Array.from({length: mult}, (_, i) => k * (i + 1));
          return item('Utiliser un dé équilibré', `On lance un dé équilibré à ${n} faces numérotées de 1 à ${n}.`,
            [Q(`P(obtenir un multiple de ${k})`, mult / n), Q(`P(obtenir un nombre supérieur à ${m})`, above / n)],
            C('chaque face a la même probabilité 1/' + n + ' ; on compte les faces favorables.',
              [`Multiples de ${k} : ${list.join(', ')}, soit ${mult} faces : ${mult}/${n}${gcd(mult, n) > 1 ? ' = ' + frac(mult, n) : ''}.`, `Nombres de ${m + 1} à ${n} : ${above} faces : ${above}/${n}${gcd(above, n) > 1 ? ' = ' + frac(above, n) : ''}.`],
              `P(multiple de ${k}) = ${frac(mult, n)} et P(supérieur à ${m}) = ${frac(above, n)}.`),
            '« Supérieur à ' + m + ' » signifie strictement plus grand : ' + m + ' n’est pas compté.'); }
      }),
      T({ // Deux tirages avec remise
        base: {r: 3, b: 2},
        params: r => ({r: r.int(1, 9), b: r.int(1, 9)}),
        accept: ({r, b}) => r !== b,
        difficulty: ({r, b}) => score({steps: 3, values: [(r + b) ** 2], fractions: true}),
        verify: ({r, b}, w) => sameFrac(w[0], r * r, (r + b) ** 2) && sameFrac(w[1], (r + b) ** 2 - b * b, (r + b) ** 2),
        build: ({r, b}) => { const t = r + b; return item('Enchaîner deux tirages avec remise', `Un sac contient ${r} jetons rouges et ${b} jetons bleus. On tire un jeton, on le remet, puis on en tire un second.`,
          [Q('P(deux jetons rouges)', r * r / (t * t)), Q('P(au moins un jeton rouge)', 1 - b * b / (t * t))],
          C('avec remise, les deux tirages se font dans les mêmes conditions ; sur un arbre, on multiplie les probabilités le long d’un chemin.',
            [`P(R puis R) = ${r}/${t} × ${r}/${t} = ${frac(r * r, t * t)}.`, `« Au moins un rouge » est le contraire de « deux bleus » : 1 ${M} ${b}/${t} × ${b}/${t} = ${frac(t * t - b * b, t * t)}.`],
            `P(deux rouges) = ${frac(r * r, t * t)} et P(au moins un rouge) = ${frac(t * t - b * b, t * t)}.`),
          'Pour « au moins un », passe par l’événement contraire.'); }
      }),
      T({ // Deux tirages sans remise
        base: {r: 4, b: 3},
        params: r => ({r: r.int(2, 9), b: r.int(2, 9)}),
        accept: ({r, b}) => r !== b,
        difficulty: ({r, b}) => score({steps: 3, values: [(r + b) * (r + b - 1)], fractions: true}),
        verify: ({r, b}, w) => { const t = r + b; return sameFrac(w[0], r * (r - 1), t * (t - 1)) && sameFrac(w[1], r * (r - 1) + b * (b - 1), t * (t - 1)); },
        build: ({r, b}) => { const t = r + b, d = t * (t - 1);
          return item('Enchaîner deux tirages sans remise', `Une boîte contient ${r} billes rouges et ${b} billes bleues. On tire successivement deux billes, sans remettre la première.`,
            [Q('P(deux billes rouges)', r * (r - 1) / d), Q('P(deux billes de même couleur)', (r * (r - 1) + b * (b - 1)) / d)],
            C('sans remise, la composition de la boîte change après le premier tirage : il reste ' + (t - 1) + ' billes.',
              [`P(R puis R) = ${r}/${t} × ${r - 1}/${t - 1} = ${frac(r * (r - 1), d)}.`, `P(B puis B) = ${b}/${t} × ${b - 1}/${t - 1} = ${frac(b * (b - 1), d)} ; même couleur : ${frac(r * (r - 1), d)} + ${frac(b * (b - 1), d)} = ${frac(r * (r - 1) + b * (b - 1), d)}.`],
              `P(deux rouges) = ${frac(r * (r - 1), d)} et P(même couleur) = ${frac(r * (r - 1) + b * (b - 1), d)}.`),
            'Au second tirage, il manque une bille de la couleur tirée.'); }
      }),
      T({ // Fréquence et probabilité
        base: {N: 300, k: 56},
        params: r => ({N: 60 * r.int(1, 10), k: r.int(5, 120)}),
        accept: ({N, k}) => k < N / 3 && k > N / 12,
        difficulty: ({N, k}) => score({steps: 2, values: [N, k, k / N], decimals: true}),
        verify: ({N, k}, v) => close(v[0], k / N) && v[1] === N / 6,
        build: ({N, k}) => item('Comparer fréquence et probabilité', `On lance ${N} fois un dé équilibré à six faces. Le 6 sort ${k} fois.`,
          [Q('Fréquence d’apparition du 6', k / N), Q('Nombre de 6 attendu en moyenne', N / 6)],
          C('la fréquence observée est le nombre d’apparitions ÷ nombre de lancers ; la probabilité théorique d’un 6 vaut 1/6.',
            [`Fréquence : ${k} ÷ ${N} ${eq(k / N)}.`, `Nombre attendu : ${N} × 1/6 = ${N / 6}.`],
            `la fréquence vaut ${about(k / N)}, alors que la probabilité est 1/6 ≈ 0,17 : sur ${N} lancers, on attendait environ ${N / 6} six. L’écart diminue en général quand le nombre de lancers augmente.`),
          'La fréquence se calcule sur les lancers réalisés ; la probabilité ne dépend pas de l’expérience.')
      }),
      T({ // Roue de loterie
        base: {a: 90, b: 120},
        params: r => ({a: 10 * r.int(2, 18), b: 10 * r.int(2, 18)}),
        accept: ({a, b}) => a + b <= 300 && a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, 360], fractions: true}),
        verify: ({a, b}, w) => sameFrac(w[0], a, 360) && sameFrac(w[1], 360 - a - b, 360),
        build: ({a, b}) => { const c = 360 - a - b; return item('Utiliser une roue', `Une roue équilibrée a trois secteurs : rouge (${a}°), jaune (${b}°) et bleu (le reste).`,
          [Q('P(rouge)', a / 360), Q('P(bleu)', c / 360)],
          C('la probabilité d’un secteur est proportionnelle à son angle : angle ÷ 360°.',
            [`P(rouge) = ${a}/360 = ${frac(a, 360)}.`, `Angle bleu : 360 ${M} ${a} ${M} ${b} = ${c}° ; P(bleu) = ${frac(c, 360)}.`],
            `P(rouge) = ${frac(a, 360)} et P(bleu) = ${frac(c, 360)}.`),
          'Un tour complet mesure 360°.'); }
      })
    ],

    /* ---------- 11 · Grandeurs et mesures ---------- */
    '3-grandeurs': [
      T({ // Vitesse moyenne
        base: {v: 72, t: 25, D: 40},
        params: r => ({v: 6 * r.int(5, 20), t: 5 * r.int(2, 18), D: r.int(10, 120)}),
        accept: ({v, t, D}) => (v * t) % 60 === 0 && D !== v * t / 60,
        difficulty: ({v, t, D}) => score({steps: 3, values: [v, v * t / 60, 60 * D / v], decimals: true}),
        verify: ({v, t, D}, w) => close(w[0], v) && close(w[1], 60 * D / v),
        build: ({v, t, D}) => { const d = v * t / 60; return item('Calculer une vitesse moyenne', `Un car parcourt ${fr(d)} km en ${t} min, à vitesse constante.`,
          [Q('Vitesse, en km/h', v), Q(`Durée pour parcourir ${D} km, en min`, 60 * D / v, 1)],
          C('vitesse = distance ÷ durée ; on convertit la durée en heures pour obtenir des km/h.',
            [`${t} min = ${t}/60 h, donc v = ${fr(d)} ÷ (${t}/60) = ${fr(d)} × 60 ÷ ${t} = ${v} km/h.`, `Durée : ${D} ÷ ${v} h = ${D} × 60 ÷ ${v} ${eq(60 * D / v, 1)} min.`],
            `le car roule à ${v} km/h et parcourt ${D} km en ${about(60 * D / v, 1)} min.`),
          'Une heure compte 60 minutes : ne divise pas par 100.'); }
      }),
      T({ // Conversion km/h → m/s
        base: {v: 90},
        params: r => ({v: r.int(20, 130)}),
        difficulty: ({v}) => score({steps: 2, values: [v, v / 3.6], decimals: true}),
        verify: ({v}, w) => close(w[0], v / 3.6) && close(w[1], v / 3.6 * 10),
        build: ({v}) => item('Convertir une vitesse', `Une voiture roule à ${v} km/h.`,
          [Q('Vitesse, en m/s', v / 3.6), Q('Distance parcourue en 10 s, en m', v / 3.6 * 10, 1)],
          C('1 km = 1 000 m et 1 h = 3 600 s : v km/h = v × 1 000 ÷ 3 600 m/s = v ÷ 3,6 m/s.',
            [`${v} ÷ 3,6 ${eq(v / 3.6)} m/s.`, `En 10 s : ${v} ÷ 3,6 × 10 ${eq(v / 3.6 * 10, 1)} m.`],
            `la voiture roule à ${about(v / 3.6)} m/s et parcourt ${about(v / 3.6 * 10, 1)} m en 10 s.`),
          'Divise par 3,6 pour passer des km/h aux m/s.')
      }),
      T({ // Pavé droit et contenance
        base: {L: 40, l: 25, h: 30},
        params: r => ({L: 5 * r.int(4, 16), l: 5 * r.int(2, 10), h: 5 * r.int(2, 12)}),
        accept: ({L, l, h}) => L > l && L * l * h <= 100000,
        difficulty: ({L, l, h}) => score({steps: 2, values: [L * l * h / 1000], decimals: true}),
        verify: ({L, l, h}, w) => w[0] === L * l * h && close(w[1], w[0] / 1000),
        build: ({L, l, h}) => { const Vc = L * l * h; return item('Calculer un volume et une contenance', `Un aquarium a la forme d’un pavé droit de ${L} cm sur ${l} cm, et de ${h} cm de hauteur.`,
          [Q('Volume, en cm³', Vc), Q('Contenance, en L', Vc / 1000, 3)],
          C('volume d’un pavé droit = longueur × largeur × hauteur ; 1 L = 1 dm³ = 1 000 cm³.',
            [`V = ${L} × ${l} × ${h} = ${fr(Vc)} cm³.`, `${fr(Vc)} cm³ = ${fr(Vc / 1000)} L.`],
            `l’aquarium a un volume de ${fr(Vc)} cm³, soit une contenance de ${fr(Vc / 1000)} L.`),
          'Divise les cm³ par 1 000 pour obtenir des litres.'); }
      }),
      T({ // Cylindre
        base: {r: 4, h: 10},
        params: r => ({r: r.int(2, 12), h: r.int(5, 30)}),
        difficulty: ({r, h}) => score({steps: 3, values: [Math.PI * r * r * h], decimals: true}),
        verify: ({r, h}, w) => close(w[0], Math.PI * r * r * h) && close(w[1], Math.PI * r * r * h / 1000),
        build: ({r, h}) => { const Vc = Math.PI * r * r * h; return item('Calculer le volume d’un cylindre', `Une boîte cylindrique a un rayon de ${r} cm et une hauteur de ${h} cm.`,
          [Q('Volume, en cm³ (au cm³ près)', Vc, 0), Q('Contenance, en L (au centième)', Vc / 1000)],
          C('volume d’un cylindre = aire de la base × hauteur = π × r² × h.',
            [`V = π × ${r}² × ${h} = ${r * r * h}π ${eq(Vc, 0)} cm³.`, `En litres : ${eq(Vc / 1000)} L.`],
            `la boîte a un volume d’${about(Vc, 0)} cm³, soit ${about(Vc / 1000)} L.`),
          'Garde la valeur exacte (avec π) jusqu’au dernier arrondi.'); }
      }),
      T({ // Pyramide
        base: {c: 6, h: 10},
        params: r => ({c: r.int(3, 15), h: r.int(4, 24)}),
        accept: ({c, h}) => c !== h,
        difficulty: ({c, h}) => score({steps: 3, values: [c * c, c * c * h / 3], decimals: (c * c * h) % 3 !== 0}),
        verify: ({c, h}, w) => w[0] === c * c && close(w[1], c * c * h / 3),
        build: ({c, h}) => item('Calculer le volume d’une pyramide', `Une pyramide a pour base un carré de ${c} cm de côté et une hauteur de ${h} cm.`,
          [Q('Aire de la base, en cm²', c * c), Q('Volume, en cm³', c * c * h / 3)],
          C('volume d’une pyramide (ou d’un cône) = aire de la base × hauteur ÷ 3.',
            [`Aire de la base : ${c} × ${c} = ${c * c} cm².`, `V = ${c * c} × ${h} ÷ 3 ${eq(c * c * h / 3)} cm³.`],
            `la base mesure ${c * c} cm² et le volume vaut ${(c * c * h) % 3 ? 'environ ' + fr(r2(c * c * h / 3)) : fr(c * c * h / 3)} cm³.`),
          'N’oublie pas de diviser par 3.')
      }),
      T({ // Boule dans un cube
        space: 27,
        base: {h: 10},
        params: r => ({h: r.int(4, 30)}),
        difficulty: ({h}) => score({steps: 3, values: [h / 2], decimals: true}),
        verify: ({h}, w) => close(w[0], 4 / 3 * Math.PI * (h / 2) ** 3) && close(w[1], h ** 3 - 4 / 3 * Math.PI * (h / 2) ** 3),
        build: ({h}) => { const r = h / 2, B = 4 / 3 * Math.PI * r ** 3, K = h ** 3;
          return item('Calculer le volume d’une boule', `Une boule de rayon ${fr(r)} cm est placée dans une boîte cubique de ${h} cm d’arête, qu’elle touche sur chaque face.`,
            [Q('Volume de la boule, en cm³', B, 1), Q('Volume laissé vide dans la boîte, en cm³', K - B, 1)],
            C('volume d’une boule = 4/3 × π × r³ ; volume d’un cube = arête³.',
              [`Boule : 4/3 × π × ${fr(r)}³ ${eq(B, 1)} cm³.`, `Cube : ${h}³ = ${fr(K)} cm³ ; vide : ${fr(K)} ${M} ${fr(r2(B, 1))} ${eq(K - B, 1)} cm³.`],
              `la boule occupe ${about(B, 1)} cm³ et il reste ${about(K - B, 1)} cm³ de vide.`),
            'L’arête du cube vaut le diamètre de la boule, soit 2r.'); }
      })
    ],

    /* ---------- 12 · Théorème de Pythagore ---------- */
    '3-pythagore': [
      T({ // Hypoténuse
        base: {a: 6, b: 8},
        params: r => ({a: r.int(3, 20), b: r.int(3, 20)}),
        accept: ({a, b}) => a < b,
        difficulty: ({a, b}) => score({steps: 3, values: [a * a + b * b], decimals: true}),
        verify: ({a, b}, w) => w[0] === a * a + b * b && close(w[1], Math.sqrt(w[0])),
        build: ({a, b}) => { const s2 = a * a + b * b, c = Math.sqrt(s2);
          return item('Calculer l’hypoténuse', `Le triangle ABC est rectangle en A, avec AB = ${a} cm et AC = ${b} cm.`,
            [Q('BC², en cm²', s2), Q('BC, en cm (au dixième)', c, 1)],
            C('dans un triangle rectangle, le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés (théorème de Pythagore).',
              [`BC² = AB² + AC² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${s2}.`, `BC = √${s2} ${eq(c, 1)} cm.`],
              `BC ${eq(c, 1)} cm.`),
            'L’hypoténuse est le côté opposé à l’angle droit, ici [BC].'); }
      }),
      T({ // Côté de l'angle droit
        base: {a: 5, c: 13},
        params: r => ({a: r.int(3, 20), c: r.int(6, 30)}),
        accept: ({a, c}) => c > a + 1,
        difficulty: ({a, c}) => score({steps: 3, values: [c * c, c * c - a * a], decimals: true}),
        verify: ({a, c}, w) => w[0] === c * c - a * a && close(w[1], Math.sqrt(w[0])),
        build: ({a, c}) => { const s2 = c * c - a * a, b = Math.sqrt(s2);
          return item('Calculer un côté de l’angle droit', `Le triangle EFG est rectangle en E, avec EF = ${a} cm et FG = ${c} cm.`,
            [Q('EG², en cm²', s2), Q('EG, en cm (au dixième)', b, 1)],
            C('on écrit l’égalité de Pythagore avec l’hypoténuse [FG], puis on isole EG².',
              [`FG² = EF² + EG², donc EG² = ${c}² ${M} ${a}² = ${c * c} ${M} ${a * a} = ${s2}.`, `EG = √${s2} ${eq(b, 1)} cm.`],
              `EG ${eq(b, 1)} cm.`),
            'Ici on soustrait : l’hypoténuse est le plus grand côté.'); }
      }),
      T({ // Réciproque
        base: {t: 0, k: 2, on: 1, s: 1},
        params: r => ({t: r.int(0, 5), k: r.int(1, 4), on: r.int(0, 1), s: r.sign()}),
        accept: ({t, k}) => [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t][2] * k <= 60,
        difficulty: () => score({steps: 3, values: [1500]}),
        verify: ({t, k, on, s}, v) => { const [a, b, c0] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t].map(x => x * k), c = on ? c0 : c0 + s; return v[0] === c * c && v[1] === a * a + b * b && (v[2] === 'oui') === (c * c === a * a + b * b); },
        build: ({t, k, on, s}) => { const [a, b, c0] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]][t].map(x => x * k), c = on ? c0 : c0 + s;
          return item('Utiliser la réciproque de Pythagore', `Un triangle RST a pour côtés RS = ${a} cm, ST = ${b} cm et RT = ${c} cm. Est-il rectangle ?`,
            [Q('Carré du plus grand côté', c * c), Q('Somme des carrés des deux autres côtés', a * a + b * b), S('Le triangle est-il rectangle ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('on compare le carré du plus grand côté à la somme des carrés des deux autres : s’ils sont égaux, le triangle est rectangle (réciproque) ; sinon, il ne l’est pas.',
              [`RT² = ${c}² = ${c * c}.`, `RS² + ST² = ${a * a} + ${b * b} = ${a * a + b * b}.`],
              on ? `RT² = RS² + ST² : RST est rectangle en S.` : `${c * c} ≠ ${a * a + b * b} : RST n’est pas rectangle.`),
            'Repère le plus grand côté : c’est le seul candidat pour l’hypoténuse.'); }
      }),
      T({ // Échelle contre un mur
        base: {L: 50, d: 14},
        params: r => ({L: r.int(25, 60), d: r.int(5, 20)}),
        accept: ({L, d}) => d * 3 < L,
        difficulty: ({L, d}) => score({steps: 3, values: [L * L / 100, Math.sqrt(L * L - d * d) / 10], decimals: true}),
        verify: ({L, d}, w) => close(w[0], Math.sqrt((L / 10) ** 2 - (d / 10) ** 2)),
        build: ({L, d}) => { const l = L / 10, x = d / 10, h = Math.sqrt(l * l - x * x);
          return item('Résoudre un problème avec Pythagore', `Une échelle de ${fr(l)} m est appuyée contre un mur vertical. Son pied est à ${fr(x)} m du mur, sur un sol horizontal.`,
            [Q('Hauteur atteinte, en m (au centième)', h), Q('Carré de la hauteur, en m²', l * l - x * x, 4)],
            C('le mur, le sol et l’échelle forment un triangle rectangle dont l’hypoténuse est l’échelle.',
              [`h² = ${fr(l)}² ${M} ${fr(x)}² = ${fr(l * l)} ${M} ${fr(x * x)} = ${fr(r2(l * l - x * x, 4))}.`, `h = √${fr(r2(l * l - x * x, 4))} ${eq(h)} m.`],
              `l’échelle atteint ${about(h)} m de hauteur.`),
            'L’échelle est le plus grand côté : c’est l’hypoténuse.'); }
      }),
      T({ // Diagonale d'écran
        base: {w: 48, h: 27},
        params: r => ({w: r.int(20, 80), h: r.int(12, 50)}),
        accept: ({w, h}) => w > h * 1.2,
        difficulty: ({w, h}) => score({steps: 3, values: [w * w + h * h, Math.sqrt(w * w + h * h)], decimals: true}),
        verify: ({w, h}, v) => close(v[0], Math.sqrt(w * w + h * h)) && close(v[1], Math.sqrt(w * w + h * h) / 2.54),
        build: ({w, h}) => { const d = Math.sqrt(w * w + h * h);
          return item('Calculer la diagonale d’un écran', `Un écran rectangulaire mesure ${w} cm de large et ${h} cm de haut. Un pouce mesure 2,54 cm.`,
            [Q('Diagonale, en cm (au dixième)', d, 1), Q('Diagonale, en pouces (à l’unité)', d / 2.54, 0)],
            C('la diagonale partage le rectangle en deux triangles rectangles ; on applique le théorème de Pythagore.',
              [`d² = ${w}² + ${h}² = ${w * w + h * h} ; d ${eq(d, 1)} cm.`, `En pouces : d ÷ 2,54 ${eq(d / 2.54, 0)}.`],
              `la diagonale mesure ${about(d, 1)} cm, soit ${about(d / 2.54, 0)} pouces.`),
            'Garde la valeur non arrondie de d pour la conversion.'); }
      }),
      T({ // Distance dans un repère
        base: {x1: 1, y1: 2, x2: 4, y2: 6},
        params: r => ({x1: r.int(-6, 6), y1: r.int(-6, 6), x2: r.int(-6, 6), y2: r.int(-6, 6)}),
        accept: ({x1, y1, x2, y2}) => x1 !== x2 && y1 !== y2,
        difficulty: ({x1, y1, x2, y2}) => score({steps: 3, values: [(x2 - x1) ** 2 + (y2 - y1) ** 2], negatives: true, decimals: true}),
        verify: ({x1, y1, x2, y2}, v) => v[0] === (x2 - x1) ** 2 + (y2 - y1) ** 2 && close(v[1], Math.sqrt(v[0])),
        build: ({x1, y1, x2, y2}) => { const dx = x2 - x1, dy = y2 - y1, s2 = dx * dx + dy * dy;
          return item('Calculer une distance dans un repère', `Dans un repère orthonormé (unité 1 cm), A(${fr(x1)} ; ${fr(y1)}) et B(${fr(x2)} ; ${fr(y2)}).`,
            [Q('AB², en cm²', s2), Q('AB, en cm (au dixième)', Math.sqrt(s2), 1)],
            C('on trace le triangle rectangle de côtés horizontal et vertical : leurs longueurs sont les écarts des abscisses et des ordonnées.',
              [`Écart horizontal : |${fmt.diff(x2, x1)}| = ${Math.abs(dx)} ; écart vertical : |${fmt.diff(y2, y1)}| = ${Math.abs(dy)}.`, `AB² = ${Math.abs(dx)}² + ${Math.abs(dy)}² = ${s2} ; AB ${eq(Math.sqrt(s2), 1)} cm.`],
              `AB ${eq(Math.sqrt(s2), 1)} cm.`),
            'Un écart est une longueur : il est toujours positif.'); }
      })
    ],

    /* ---------- 13 · Théorème de Thalès ---------- */
    '3-thales': [
      T({ // Configuration triangle
        base: {am: 3, ab: 5, an: 4, bc: 7},
        params: r => ({am: r.int(2, 9), ab: r.int(4, 15), an: r.int(2, 12), bc: r.int(3, 16)}),
        accept: ({am, ab}) => am < ab && gcd(am, ab) === 1,
        difficulty: ({am, ab, an, bc}) => score({steps: 3, values: [bc * am / ab, an * ab / am], decimals: true}),
        verify: ({am, ab, an, bc}, v) => close(v[0] * ab, bc * am) && close(v[1] * am, an * ab),
        build: ({am, ab, an, bc}) => { const mn = bc * am / ab, ac = an * ab / am;
          return item('Calculer une longueur avec Thalès', `M ∈ [AB] et N ∈ [AC] ; les droites (MN) et (BC) sont parallèles. AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm et BC = ${bc} cm.`,
            [Q('MN, en cm', mn), Q('AC, en cm', ac)],
            C('d’après le théorème de Thalès : AM/AB = AN/AC = MN/BC.',
              [`MN = BC × AM/AB = ${bc} × ${am}/${ab} ${eq(mn)} cm.`, `AC = AN × AB/AM = ${an} × ${ab}/${am} ${eq(ac)} cm.`],
              `MN ${eq(mn)} cm et AC ${eq(ac)} cm.`),
            'Écris les trois rapports en mettant au numérateur les côtés du petit triangle.'); }
      }),
      T({ // Configuration papillon
        base: {ab: 6, am: 4, bc: 9, ac: 7},
        params: r => ({ab: r.int(3, 14), am: r.int(2, 12), bc: r.int(3, 16), ac: r.int(3, 14)}),
        accept: ({ab, am}) => ab !== am && gcd(ab, am) > 1,
        difficulty: ({ab, am, bc, ac}) => score({steps: 3, values: [bc * am / ab, ac * am / ab], decimals: true}),
        verify: ({ab, am, bc, ac}, v) => close(v[0] * ab, bc * am) && close(v[1] * ab, ac * am),
        build: ({ab, am, bc, ac}) => { const mn = bc * am / ab, an = ac * am / ab;
          return item('Utiliser Thalès en configuration papillon', `Les droites (BM) et (CN) se coupent en A, avec A entre B et M et A entre C et N ; (BC) et (MN) sont parallèles. AB = ${ab} cm, AM = ${am} cm, BC = ${bc} cm et AC = ${ac} cm.`,
            [Q('MN, en cm', mn), Q('AN, en cm', an)],
            C('d’après le théorème de Thalès : AM/AB = AN/AC = MN/BC.',
              [`Rapport : AM/AB = ${am}/${ab} = ${frac(am, ab)}.`, `MN = ${bc} × ${frac(am, ab)} ${eq(mn)} cm ; AN = ${ac} × ${frac(am, ab)} ${eq(an)} cm.`],
              `MN ${eq(mn)} cm et AN ${eq(an)} cm.`),
            'Les deux triangles sont opposés par le sommet A ; les rapports se forment de la même façon.'); }
      }),
      T({ // Réciproque de Thalès
        base: {am: 3, ab: 5, k: 2, on: 1, s: 1},
        params: r => ({am: r.int(2, 8), ab: r.int(4, 12), k: r.int(2, 4), on: r.int(0, 1), s: r.sign()}),
        accept: ({am, ab}) => am < ab && gcd(am, ab) === 1,
        difficulty: () => score({steps: 3, values: [40], fractions: true}),
        verify: ({am, ab, k, on, s}, v) => { const an = am * k + (on ? 0 : s), ac = ab * k; return sameFrac(v[0], am, ab) && sameFrac(v[1], an, ac) && (v[2] === 'oui') === (am * ac === an * ab); },
        build: ({am, ab, k, on, s}) => { const an = am * k + (on ? 0 : s), ac = ab * k;
          return item('Utiliser la réciproque de Thalès', `A, M, B sont alignés dans cet ordre, ainsi que A, N, C. AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm et AC = ${ac} cm. Les droites (MN) et (BC) sont-elles parallèles ?`,
            [Q('AM/AB', am / ab, 3), Q('AN/AC', an / ac, 3), S('(MN) et (BC) sont-elles parallèles ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('on compare les rapports AM/AB et AN/AC, les points étant alignés dans le même ordre : s’ils sont égaux, les droites sont parallèles (réciproque) ; sinon, elles ne le sont pas.',
              [`AM/AB = ${am}/${ab} et AN/AC = ${an}/${ac}${gcd(an, ac) > 1 ? ' = ' + frac(an, ac) : ''}.`, `Produits en croix : ${am} × ${ac} = ${am * ac} et ${an} × ${ab} = ${an * ab}.`],
              on ? 'les rapports sont égaux : (MN) et (BC) sont parallèles.' : 'les rapports sont différents : (MN) et (BC) ne sont pas parallèles.'),
            'Compare les fractions avec un produit en croix plutôt qu’avec des valeurs arrondies.'); }
      }),
      T({ // Hauteur d'un arbre par l'ombre
        base: {h: 15, s: 12, S: 96},
        params: r => ({h: r.int(10, 20), s: r.int(5, 30), S: r.int(40, 200)}),
        accept: ({s, S}) => S > 2 * s,
        difficulty: ({h, s, S}) => score({steps: 3, values: [h * S / s / 100], decimals: true}),
        verify: ({h, s, S}, v) => close(v[0], h / 10 * (S / 10) / (s / 10)),
        build: ({h, s, S}) => { const bh = h / 10, bs = s / 10, as = S / 10, H = bh * as / bs;
          return item('Mesurer une hauteur avec une ombre', `Au même instant, un bâton vertical de ${fr(bh)} m a une ombre de ${fr(bs)} m, et un arbre vertical a une ombre de ${fr(as)} m. Les rayons du soleil sont parallèles.`,
            [Q('Hauteur de l’arbre, en m', H, 1), Q('Rapport ombre de l’arbre / ombre du bâton', as / bs)],
            C('les rayons parallèles forment une configuration de Thalès : hauteur et ombre sont proportionnelles.',
              [`Rapport : ${fr(as)} ÷ ${fr(bs)} ${eq(as / bs)}.`, `H = ${fr(bh)} × ${fr(as)} ÷ ${fr(bs)} ${eq(H, 1)} m.`],
              `l’arbre mesure ${about(H, 1)} m.`),
            'L’ombre de l’arbre est combien de fois plus longue que celle du bâton ?'); }
      }),
      T({ // Agrandissement et aire
        base: {k: 3, L: 4, A: 10},
        params: r => ({k: r.pick([0.5, 1.5, 2, 2.5, 3, 4, 0.2, 0.4]), L: r.int(2, 15), A: r.int(5, 60)}),
        difficulty: ({k, L, A}) => score({steps: 2, values: [k * L, k * k * A], decimals: !Number.isInteger(k)}),
        verify: ({k, L, A}, v) => close(v[0], k * L) && close(v[1], k * k * A),
        build: ({k, L, A}) => { const big = k > 1;
          return item(big ? 'Agrandir une figure' : 'Réduire une figure', `Une figure d’aire ${A} cm² possède un côté de ${L} cm. On ${big ? 'l’agrandit' : 'la réduit'} à l’échelle ${fr(k)}.`,
            [Q('Longueur du côté image, en cm', k * L), Q('Aire de la figure image, en cm²', k * k * A)],
            C('dans un agrandissement ou une réduction de rapport k, les longueurs sont multipliées par k et les aires par k².',
              [`Côté : ${L} × ${fr(k)} = ${fr(k * L)} cm.`, `Aire : ${A} × ${fr(k)}² = ${A} × ${fr(k * k)} = ${fr(k * k * A)} cm².`],
              `le côté image mesure ${fr(k * L)} cm et l’aire image ${fr(k * k * A)} cm².`),
            'L’aire n’est pas multipliée par k, mais par k × k.'); }
      }),
      T({ // Triangles semblables
        base: {a: 4, b: 6, c: 7, k: 15},
        params: r => ({a: r.int(3, 10), b: r.int(4, 12), c: r.int(5, 15), k: r.pick([5, 15, 20, 25, 30, 35, 40])}),
        accept: ({a, b, c}) => a < b && b < c && c < a + b,
        difficulty: ({a, b, c, k}) => score({steps: 3, values: [b * k / 10, c * k / 10], decimals: k % 10 !== 0}),
        verify: ({a, b, c, k}, v) => close(v[0], k / 10) && close(v[1], b * v[0]) && close(v[2], c * v[0]),
        build: ({a, b, c, k}) => { const q = k / 10;
          return item('Utiliser des triangles semblables', `Les triangles ABC et DEF sont semblables, avec AB = ${a} cm, AC = ${b} cm, BC = ${c} cm. Le côté DE, homologue de AB, mesure ${fr(a * q)} cm.`,
            [Q('Rapport de DEF par rapport à ABC', q), Q('DF, en cm', b * q), Q('EF, en cm', c * q)],
            C('deux triangles semblables ont des côtés homologues proportionnels : on calcule le rapport, puis on multiplie.',
              [`k = DE/AB = ${fr(a * q)}/${a} = ${fr(q)}.`, `DF = ${b} × ${fr(q)} = ${fr(b * q)} cm ; EF = ${c} × ${fr(q)} = ${fr(c * q)} cm.`],
              `le rapport vaut ${fr(q)}, DF = ${fr(b * q)} cm et EF = ${fr(c * q)} cm.`),
            'Associe chaque côté à son homologue avant de calculer.'); }
      })
    ],

    /* ---------- 14 · Trigonométrie ---------- */
    '3-trigonometrie': [
      T({ // Cosinus : côté adjacent
        base: {h: 12, a: 35},
        params: r => ({h: r.int(5, 30), a: r.int(15, 75)}),
        difficulty: ({h, a}) => score({steps: 3, values: [h * Math.cos(a * deg)], decimals: true}),
        verify: ({h, a}, v) => close(v[0], h * Math.cos(a * deg)),
        build: ({h, a}) => { const x = h * Math.cos(a * deg);
          return item('Calculer une longueur avec le cosinus', `ABC est rectangle en B, avec AC = ${h} cm et l’angle BAC = ${a}°.`,
            [Q('AB, en cm (au dixième)', x, 1), Q('cos(BAC), au centième', Math.cos(a * deg))],
            C('dans un triangle rectangle, cos(angle) = côté adjacent ÷ hypoténuse.',
              [`cos(${a}°) = AB/AC, donc AB = ${h} × cos(${a}°).`, `AB ${eq(x, 1)} cm.`],
              `AB ${eq(x, 1)} cm.`),
            'Repère l’hypoténuse, puis le côté adjacent à l’angle connu.'); }
      }),
      T({ // Sinus : côté opposé
        base: {h: 10, a: 40},
        params: r => ({h: r.int(5, 30), a: r.int(15, 75)}),
        difficulty: ({h, a}) => score({steps: 3, values: [h * Math.sin(a * deg)], decimals: true}),
        verify: ({h, a}, v) => close(v[0], h * Math.sin(a * deg)),
        build: ({h, a}) => { const x = h * Math.sin(a * deg);
          return item('Calculer une longueur avec le sinus', `DEF est rectangle en E, avec DF = ${h} cm et l’angle EDF = ${a}°.`,
            [Q('EF, en cm (au dixième)', x, 1), Q('sin(EDF), au centième', Math.sin(a * deg))],
            C('dans un triangle rectangle, sin(angle) = côté opposé ÷ hypoténuse.',
              [`sin(${a}°) = EF/DF, donc EF = ${h} × sin(${a}°).`, `EF ${eq(x, 1)} cm.`],
              `EF ${eq(x, 1)} cm.`),
            'Le côté opposé à l’angle D est celui qui ne touche pas D.'); }
      }),
      T({ // Tangente
        base: {d: 8, a: 50},
        params: r => ({d: r.int(3, 25), a: r.int(15, 70)}),
        difficulty: ({d, a}) => score({steps: 3, values: [d * Math.tan(a * deg)], decimals: true}),
        verify: ({d, a}, v) => close(v[0], d * Math.tan(a * deg)),
        build: ({d, a}) => { const x = d * Math.tan(a * deg);
          return item('Calculer une longueur avec la tangente', `RST est rectangle en S, avec RS = ${d} cm et l’angle SRT = ${a}°.`,
            [Q('ST, en cm (au dixième)', x, 1), Q('tan(SRT), au centième', Math.tan(a * deg))],
            C('dans un triangle rectangle, tan(angle) = côté opposé ÷ côté adjacent.',
              [`tan(${a}°) = ST/RS, donc ST = ${d} × tan(${a}°).`, `ST ${eq(x, 1)} cm.`],
              `ST ${eq(x, 1)} cm.`),
            'La tangente n’utilise pas l’hypoténuse.'); }
      }),
      T({ // Angle par le cosinus
        base: {adj: 7, hyp: 10},
        params: r => ({adj: r.int(2, 20), hyp: r.int(4, 25)}),
        accept: ({adj, hyp}) => adj < hyp && adj / hyp < 0.95 && adj / hyp > 0.1,
        difficulty: ({adj, hyp}) => score({steps: 3, values: [Math.acos(adj / hyp) / deg], decimals: true}),
        verify: ({adj, hyp}, v) => close(v[0], adj / hyp) && close(v[1], Math.acos(adj / hyp) / deg),
        build: ({adj, hyp}) => { const ang = Math.acos(adj / hyp) / deg;
          return item('Calculer un angle', `KLM est rectangle en L, avec KL = ${adj} cm et KM = ${hyp} cm.`,
            [Q('cos(LKM), au centième', adj / hyp), Q('Angle LKM, en degrés (à l’unité)', ang, 0)],
            C('on calcule le cosinus de l’angle, puis on utilise la touche arccos (ou cos⁻¹) de la calculatrice.',
              [`cos(LKM) = KL/KM = ${adj}/${hyp} ${eq(adj / hyp)}.`, `LKM = arccos(${adj}/${hyp}) ${eq(ang, 0)}°.`],
              `l’angle LKM mesure ${about(ang, 0)}°.`),
            'Vérifie que la calculatrice est réglée en degrés.'); }
      }),
      T({ // Pente d'une rampe
        base: {h: 12, d: 150},
        params: r => ({h: r.int(5, 40), d: 10 * r.int(6, 40)}),
        accept: ({h, d}) => h / d < 0.25,
        difficulty: ({h, d}) => score({steps: 3, values: [100 * h / d, Math.atan(h / d) / deg], decimals: true}),
        verify: ({h, d}, v) => close(v[0], 100 * h / d) && close(v[1], Math.atan(h / d) / deg),
        build: ({h, d}) => { const ang = Math.atan(h / d) / deg;
          return item('Étudier la pente d’une rampe', `Une rampe s’élève de ${h} cm sur une distance horizontale de ${d} cm.`,
            [Q('Pente, en %', 100 * h / d, 1), Q('Angle avec l’horizontale, en degrés (au dixième)', ang, 1)],
            C('la pente en % est le dénivelé pour 100 de distance horizontale ; l’angle se calcule avec la tangente.',
              [`Pente : ${h} ÷ ${d} × 100 ${eq(100 * h / d, 1)} %.`, `tan(α) = ${h}/${d}, donc α ${eq(ang, 1)}°.`],
              `la pente est d’${about(100 * h / d, 1)} % et l’angle d’${about(ang, 1)}°.`),
            'Une pente en % n’est pas un angle en degrés.'); }
      }),
      T({ // Hauteur d'un bâtiment
        base: {d: 30, a: 40, e: 16},
        params: r => ({d: r.int(10, 60), a: r.int(20, 60), e: r.int(14, 18)}),
        difficulty: ({d, a}) => score({steps: 3, values: [d * Math.tan(a * deg)], decimals: true}),
        verify: ({d, a, e}, v) => close(v[0], d * Math.tan(a * deg)) && close(v[1], v[0] + e / 10),
        build: ({d, a, e}) => { const x = d * Math.tan(a * deg), eye = e / 10;
          return item('Mesurer une hauteur inaccessible', `Debout à ${d} m d’un immeuble, une personne dont les yeux sont à ${fr(eye)} m du sol voit le haut de l’immeuble sous un angle de ${a}° au-dessus de l’horizontale.`,
            [Q('Hauteur au-dessus des yeux, en m (au dixième)', x, 1), Q('Hauteur de l’immeuble, en m (au dixième)', x + eye, 1)],
            C('le regard horizontal, la façade et la ligne de visée forment un triangle rectangle ; on utilise la tangente, puis on ajoute la hauteur des yeux.',
              [`tan(${a}°) = h/${d}, donc h = ${d} × tan(${a}°) ${eq(x, 1)} m.`, `Hauteur totale : ${fr(r2(x, 3))} + ${fr(eye)} ${eq(x + eye, 1)} m.`],
              `l’immeuble mesure ${about(x + eye, 1)} m.`),
            'N’oublie pas la hauteur des yeux au-dessus du sol.'); }
      })
    ],

    /* ---------- 15 · Transformations ---------- */
    '3-transformations': [
      T({ // Homothétie
        base: {k: 2, a: 3, L: 5},
        params: r => ({k: r.pick([-3, -2, -1.5, -0.5, 0.5, 1.5, 2, 3]), a: r.int(2, 9), L: r.int(2, 12)}),
        difficulty: ({k, a, L}) => score({steps: 2, values: [Math.abs(k) * a, Math.abs(k) * L], decimals: !Number.isInteger(k)}),
        verify: ({k, a, L}, v) => close(v[0], Math.abs(k) * a) && close(v[1], Math.abs(k) * L) && (v[2] === 'du même côté que A') === (k > 0),
        build: ({k, a, L}) => { const same = k > 0, K = Math.abs(k);
          return item('Construire l’image par une homothétie', `L’homothétie h de centre O et de rapport ${fr(k)} transforme A en A′ et B en B′. OA = ${a} cm et AB = ${L} cm.`,
            [Q('OA′, en cm', K * a), Q('A′B′, en cm', K * L), S('Par rapport à O, A′ est', same ? 'du même côté que A' : 'du côté opposé à A', ['du même côté que A', 'du côté opposé à A'])],
            C('une homothétie de rapport k multiplie les longueurs par |k| ; si k > 0, A′ est sur la demi-droite [OA), si k < 0 de l’autre côté de O.',
              [`OA′ = ${fr(K)} × ${a} = ${fr(K * a)} cm ; A′B′ = ${fr(K)} × ${L} = ${fr(K * L)} cm.`],
              `OA′ = ${fr(K * a)} cm, A′B′ = ${fr(K * L)} cm, et A′ est ${same ? 'du même côté que A' : 'du côté opposé à A'} par rapport à O.`),
            'Le signe du rapport donne le côté ; sa valeur sans le signe donne les longueurs.'); }
      }),
      T({ // Réduction d'un solide
        base: {k: 0.5, A: 36, V: 120},
        params: r => ({k: r.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]), A: r.int(10, 80), V: 10 * r.int(5, 60)}),
        difficulty: ({k, A, V}) => score({steps: 3, values: [k * k * A, k ** 3 * V], decimals: true}),
        verify: ({k, A, V}, v) => close(v[0], k * k * A) && close(v[1], k ** 3 * V),
        build: ({k, A, V}) => item('Réduire un solide', `Une pyramide a une base d’aire ${A} cm² et un volume de ${V} cm³. On la coupe parallèlement à sa base : la petite pyramide obtenue est une réduction de rapport ${fr(k)}.`,
          [Q('Aire de la petite base, en cm²', k * k * A), Q('Volume de la petite pyramide, en cm³', k ** 3 * V)],
          C('dans une réduction de rapport k, les aires sont multipliées par k² et les volumes par k³.',
            [`Aire : ${A} × ${fr(k)}² = ${A} × ${fr(k * k)} ${eq(k * k * A)} cm².`, `Volume : ${V} × ${fr(k)}³ = ${V} × ${fr(k ** 3)} ${eq(k ** 3 * V)} cm³.`],
            `la petite base mesure ${about(k * k * A)} cm² et le petit volume ${about(k ** 3 * V)} cm³.`),
          'Aire : puissance 2 ; volume : puissance 3.')
      }),
      T({ // Translation
        base: {xa: 1, ya: 2, xb: -2, yb: 1, xc: 3, yc: -1},
        params: r => ({xa: r.int(-6, 6), ya: r.int(-6, 6), xb: r.int(-6, 6), yb: r.int(-6, 6), xc: r.int(-6, 6), yc: r.int(-6, 6)}),
        accept: ({xb, yb, xc, yc, xa, ya}) => (xb !== xc || yb !== yc) && Math.abs(xa + xc - xb) <= 12 && Math.abs(ya + yc - yb) <= 12 && xc !== xb && yc !== yb,
        difficulty: () => score({steps: 3, values: [12], negatives: true}),
        verify: ({xa, ya, xb, yb, xc, yc}, v) => v[0] - xa === xc - xb && v[1] - ya === yc - yb,
        build: ({xa, ya, xb, yb, xc, yc}) => { const dx = xc - xb, dy = yc - yb;
          return item('Calculer l’image par une translation', `Dans un repère, B(${fr(xb)} ; ${fr(yb)}), C(${fr(xc)} ; ${fr(yc)}) et A(${fr(xa)} ; ${fr(ya)}). On note A′ l’image de A par la translation qui transforme B en C.`,
            [Q('Abscisse de A′', xa + dx), Q('Ordonnée de A′', ya + dy)],
            C('une translation déplace tous les points de la même façon : le déplacement de B vers C s’applique à A.',
              [`De B à C : ${dx >= 0 ? '+' : M}${Math.abs(dx)} en abscisse et ${dy >= 0 ? '+' : M}${Math.abs(dy)} en ordonnée.`, `A′(${fr(xa)}${sg(dx)} ; ${fr(ya)}${sg(dy)}) = A′(${fr(xa + dx)} ; ${fr(ya + dy)}).`],
              `A′(${fr(xa + dx)} ; ${fr(ya + dy)}).`),
            'Calcule d’abord le déplacement horizontal et vertical de B vers C.'); }
      }),
      T({ // Symétries
        base: {kind: 0, x: 3, y: -2},
        params: r => ({kind: r.int(0, 2), x: r.nonZero(1, 9), y: r.nonZero(1, 9)}),
        accept: ({x, y}) => x !== y,
        difficulty: () => score({steps: 2, values: [9], negatives: true}),
        verify: ({kind, x, y}, v) => v[0] === [-x, x, -x][kind] && v[1] === [-y, -y, y][kind],
        build: ({kind, x, y}) => { const name = ['la symétrie de centre O (origine du repère)', 'la symétrie d’axe des abscisses', 'la symétrie d’axe des ordonnées'][kind];
          const img = [[-x, -y], [x, -y], [-x, y]][kind];
          return item('Calculer l’image par une symétrie', `Dans un repère orthonormé d’origine O, P(${fr(x)} ; ${fr(y)}). On note P′ l’image de P par ${name}.`,
            [Q('Abscisse de P′', img[0]), Q('Ordonnée de P′', img[1])],
            C(['la symétrie de centre O change les deux coordonnées en leurs opposées.', 'la symétrie d’axe des abscisses garde l’abscisse et change l’ordonnée en son opposée.', 'la symétrie d’axe des ordonnées change l’abscisse en son opposée et garde l’ordonnée.'][kind],
              [`P′(${fr(img[0])} ; ${fr(img[1])}).`],
              `l’image de P est P′(${fr(img[0])} ; ${fr(img[1])}).`),
            'Fais un petit schéma : l’axe ou le centre est à mi-chemin entre P et P′.'); }
      }),
      T({ // Rotation d'un polygone régulier
        base: {n: 6, k: 10},
        params: r => ({n: r.pick([3, 4, 5, 6, 8, 9, 10, 12]), k: r.int(2, 30)}),
        accept: ({n, k}) => k % n !== 0 && k > n,
        difficulty: ({n, k}) => score({steps: 2, values: [360 / n, k]}),
        verify: ({n, k}, v) => close(v[0], 360 / n) && v[1] === k % n,
        build: ({n, k}) => item('Utiliser une rotation', `Un polygone régulier à ${n} côtés a pour centre O et pour sommets S₀, S₁, …, S${String(n - 1).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d])}, dans le sens inverse des aiguilles d’une montre. La rotation r de centre O transforme S₀ en S₁. On applique ${k} fois la rotation r à S₀ et on obtient Sₘ.`,
          [Q('Angle de la rotation r, en degrés', 360 / n), Q('Numéro m du sommet obtenu', k % n)],
          C('les sommets d’un polygone régulier sont régulièrement répartis autour du centre : l’angle entre deux sommets voisins vaut 360° ÷ nombre de sommets.',
            [`Angle : 360 ÷ ${n} = ${fr(360 / n)}°.`, `${k} rotations font avancer de ${k} sommets ; après ${n} rotations on revient à S₀ : ${k} = ${n} × ${Math.floor(k / n)} + ${k % n}.`],
            `l’angle vaut ${fr(360 / n)}° et on obtient le sommet S${String(k % n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d])} : m = ${k % n}.`),
          'Le reste de la division de ' + k + ' par ' + n + ' donne le sommet atteint.')
      }),
      T({ // Retrouver le rapport d'homothétie
        base: {a: 4, b: 6, same: 1, L: 3},
        params: r => ({a: r.int(2, 10), b: r.int(2, 15), same: r.int(0, 1), L: r.int(2, 9)}),
        accept: ({a, b}) => a !== b && (2 * b) % a === 0,
        difficulty: ({a, b, L}) => score({steps: 2, values: [b / a, b / a * L], decimals: (b % a) !== 0, negatives: false}),
        verify: ({a, b, same, L}, v) => close(v[0], (same ? 1 : -1) * b / a) && close(v[1], b / a * L),
        build: ({a, b, same, L}) => { const k = (same ? 1 : -1) * b / a;
          return item('Retrouver le rapport d’une homothétie', `Une homothétie de centre O transforme M en M′, avec OM = ${a} cm et OM′ = ${b} cm. M′ est ${same ? 'sur la demi-droite [OM)' : 'de l’autre côté de O par rapport à M'}. Elle transforme un segment de ${L} cm en un segment image.`,
            [Q('Rapport de l’homothétie', k), Q('Longueur du segment image, en cm', b / a * L)],
            C('le rapport k vérifie |k| = OM′ ÷ OM ; il est positif si M′ est du même côté que M, négatif sinon.',
              [`|k| = ${b} ÷ ${a} = ${fr(b / a)} ; ${same ? 'même côté : k > 0' : 'côté opposé : k < 0'}.`, `Segment image : ${fr(b / a)} × ${L} = ${fr(b / a * L)} cm.`],
              `k = ${fr(k)} et le segment image mesure ${fr(b / a * L)} cm. ${b > a ? 'C’est un agrandissement.' : 'C’est une réduction.'}`),
            'Les longueurs sont multipliées par la valeur sans signe du rapport.'); }
      })
    ],

    /* ---------- 16 · Algorithmique et programmation ---------- */
    '3-algorithmique': [
      T({ // Programme à entrée
        base: {a: 3, b: -4, n: 5, y: 11},
        params: r => ({a: r.nonZero(2, 6), b: r.nonZero(1, 12), n: r.int(-6, 9), y: r.int(-6, 9)}),
        accept: ({n, y}) => n !== y && n !== 0 && y !== 0,
        difficulty: ({a, b, n, y}) => score({steps: 2, values: [a * n + b, a * y + b], negatives: true}),
        verify: ({a, b, n, y}, v) => v[0] === a * n + b && a * v[1] + b === a * y + b,
        build: ({a, b, n, y}) => { const out = a * y + b; return item('Exécuter un programme', `Un programme Scratch demande un nombre x, puis ${code('mettre résultat à (' + fr(a) + ' * x) + (' + fr(b) + ')')} et dit le résultat.`,
          [Q(`Résultat affiché pour x = ${fr(n)}`, a * n + b), Q(`Nombre choisi si le résultat affiché est ${fr(out)}`, y)],
          C('le programme calcule ' + lin(a, b) + ' ; pour remonter au nombre de départ, on résout une équation.',
            [`Pour ${fr(n)} : ${fr(a)} × ${pa(n)}${sg(b)} = ${fr(a * n + b)}.`, `${lin(a, b)} = ${fr(out)} donne ${mono(a)} = ${fr(out - b)}, donc x = ${fr(y)}.`],
            `le programme affiche ${fr(a * n + b)} pour ${fr(n)} ; il faut choisir ${fr(y)} pour obtenir ${fr(out)}.`),
          'Écris l’expression calculée par le programme.'); }
      }),
      T({ // Boucle « répéter »
        base: {s0: 5, a: 4, k: 6, t: 20},
        params: r => ({s0: r.int(0, 20), a: r.int(2, 9), k: r.int(3, 12), t: r.int(15, 60)}),
        accept: ({s0, t}) => t > s0 + 5,
        difficulty: ({s0, a, k}) => score({steps: 3, values: [s0 + a * k, k]}),
        verify: ({s0, a, k, t}, v) => v[0] === s0 + a * k && s0 + a * v[1] >= t && s0 + a * (v[1] - 1) < t,
        build: ({s0, a, k, t}) => { const need = Math.ceil((t - s0) / a);
          return item('Suivre une boucle', `On exécute : ${code('mettre s à ' + s0)} puis ${code('répéter ' + k + ' fois : ajouter ' + a + ' à s')}.`,
            [Q('Valeur finale de s', s0 + a * k), Q(`Nombre minimal de répétitions pour que s atteigne au moins ${t}`, need)],
            C('à chaque tour de boucle, s augmente de ' + a + ' : après n tours, s = ' + s0 + ' + ' + a + 'n.',
              [`Après ${k} tours : ${s0} + ${a} × ${k} = ${s0 + a * k}.`, `${s0} + ${a}n ≥ ${t} donne n ≥ ${fr(r2((t - s0) / a))}, soit au moins ${need} tours.`],
              `s vaut ${s0 + a * k} à la fin ; il faut au moins ${need} répétitions pour atteindre ${t}.`),
            'Dresse un tableau des valeurs de s tour après tour.'); }
      }),
      T({ // Instruction conditionnelle
        base: {s: 10, p: 14, q: 6},
        params: r => ({s: r.int(5, 20), p: r.int(1, 30), q: r.int(1, 30)}),
        accept: ({s, p, q}) => p > s && q < s,
        difficulty: ({s, p, q}) => score({steps: 2, values: [2 * p - s, s - q]}),
        verify: ({s, p, q}, v) => v[0] === 2 * p - s && v[1] === s - q,
        build: ({s, p, q}) => item('Exécuter une instruction conditionnelle', `Programme : demander x ; ${code('si x > ' + s + ' alors dire (2 * x) − ' + s + ' sinon dire ' + s + ' − x')}.`,
          [Q(`Nombre dit pour x = ${p}`, 2 * p - s), Q(`Nombre dit pour x = ${q}`, s - q)],
          C('on teste la condition x > ' + s + ' : si elle est vraie, on exécute la première instruction ; sinon, la seconde.',
            [`${p} > ${s} est vrai : 2 × ${p} ${M} ${s} = ${2 * p - s}.`, `${q} > ${s} est faux : ${s} ${M} ${q} = ${s - q}.`],
            `le programme dit ${2 * p - s} pour ${p} et ${s - q} pour ${q}.`),
          'Vérifie d’abord si la condition est vraie ou fausse.')
      }),
      T({ // Tracer un polygone
        base: {n: 6, L: 50},
        params: r => ({n: r.pick([3, 4, 5, 6, 8, 9, 10, 12]), L: 10 * r.int(2, 15)}),
        difficulty: ({n, L}) => score({steps: 2, values: [360 / n, n * L]}),
        verify: ({n, L}, v) => close(v[0], 360 / n) && v[1] === n * L,
        build: ({n, L}) => item('Programmer le tracé d’un polygone', `Pour tracer un polygone régulier à ${n} côtés, un lutin exécute ${code('répéter ' + n + ' fois : avancer de ' + L + ' ; tourner de a degrés')}.`,
          [Q('Angle a, en degrés', 360 / n), Q('Longueur totale parcourue, en pas', n * L)],
          C('le lutin fait un tour complet en ' + n + ' rotations égales ; il tourne donc de 360° ÷ ' + n + ' à chaque fois.',
            [`a = 360 ÷ ${n} = ${fr(360 / n)}°.`, `Parcours : ${n} × ${L} = ${n * L} pas.`],
            `a = ${fr(360 / n)}° et le lutin parcourt ${n * L} pas.`),
          'L’angle dont tourne le lutin n’est pas l’angle intérieur du polygone.')
      }),
      T({ // Boucle « répéter jusqu'à »
        base: {a: 3, q: 2, M: 100},
        params: r => ({a: r.int(1, 9), q: r.pick([2, 3]), M: 10 * r.int(5, 100)}),
        accept: ({a, M}) => M > 4 * a,
        difficulty: ({a, q, M}) => { let x = a, n = 0; while (x <= M) { x *= q; n++; } return score({steps: 3, values: [x, n]}); },
        verify: ({a, q, M}, v) => v[1] === a * q ** v[0] && v[1] > M && a * q ** (v[0] - 1) <= M,
        build: ({a, q, M}) => { let x = a, n = 0; const seen = [a]; while (x <= M) { x *= q; n++; seen.push(x); }
          return item('Suivre une boucle « répéter jusqu’à »', `On exécute : ${code('mettre x à ' + a)} puis ${code('répéter jusqu’à x > ' + M + ' : mettre x à x * ' + q)}.`,
            [Q('Nombre de tours de boucle', n), Q('Valeur finale de x', x)],
            C('on teste la condition avant chaque tour ; la boucle s’arrête dès que x dépasse ' + M + '.',
              [`Valeurs successives de x : ${seen.join(' ; ')}.`],
              `la boucle fait ${n} tours et x vaut ${x} à la fin.`),
            'Écris toutes les valeurs prises par x.'); }
      }),
      T({ // Compter et additionner dans une liste
        base: {v: [12, 5, 18, 9, 21, 7, 15], s: 10},
        params: r => ({v: Array.from({length: 7}, () => r.int(1, 30)), s: r.int(8, 20)}),
        accept: ({v, s}) => { const n = v.filter(x => x > s).length; return n >= 2 && n <= 5 && !v.includes(s); },
        difficulty: ({v, s}) => score({steps: 2, values: [sum(v.filter(x => x > s))]}),
        verify: ({v, s}, w) => w[0] === v.filter(x => x > s).length && w[1] === sum(v.filter(x => x > s)),
        build: ({v, s}) => { const kept = v.filter(x => x > s);
          return item('Parcourir une liste', `La liste L contient ${v.join(' ; ')}. Pour chaque élément e de L : ${code('si e > ' + s + ' alors ajouter 1 à n et ajouter e à t')} (n et t valent 0 au départ).`,
            [Q('Valeur finale de n', kept.length), Q('Valeur finale de t', sum(kept))],
            C('n compte les éléments strictement supérieurs à ' + s + ' et t les additionne.',
              [`Éléments supérieurs à ${s} : ${kept.join(' ; ')}.`, `n = ${kept.length} et t = ${kept.join(' + ')} = ${sum(kept)}.`],
              `n = ${kept.length} et t = ${sum(kept)}.`),
            'Une valeur égale à ' + s + ' ne vérifierait pas la condition e > ' + s + '.'); }
      })
    ]
  };

  const basics = {
    '3-arithmetique': ['Un diviseur de n est un entier qui donne une division exacte de n.', 'Combien de fois 6 tient-il dans 42 ?', '7', '6 × 7 = 42.'],
    '3-fractions': ['Écris les fractions avec un même dénominateur avant d’additionner ou de comparer.', 'Calcule 1/2 + 1/4.', '3/4', '1/2 = 2/4.'],
    '3-puissances': ['10 puissance n s’écrit avec n zéros si n est positif.', 'Combien vaut 10³ ?', '1000', 'Trois facteurs égaux à 10.'],
    '3-calcul-litteral': ['Développer transforme un produit en somme ; factoriser fait l’inverse.', 'Développe 2(x + 3) : quel est le terme constant ?', '6', '2 × 3 = 6.'],
    '3-equations': ['Une solution est une valeur de x qui rend l’égalité vraie.', 'Résous x + 5 = 12.', '7', 'Retire 5 aux deux membres.'],
    '3-proportionnalite': ['Deux grandeurs proportionnelles se déduisent l’une de l’autre par une même multiplication.', '3 cahiers coûtent 6 €. Combien coûte un cahier ?', '2', 'Divise 6 par 3.'],
    '3-fonctions': ['L’image de a par f est f(a) ; un antécédent de b est un nombre x tel que f(x) = b.', 'f(x) = 2x. Calcule f(5).', '10', 'Remplace x par 5.'],
    '3-fonctions-affines': ['Une fonction affine s’écrit f(x) = ax + b ; elle est linéaire si b = 0.', 'f(x) = 3x + 1. Calcule f(2).', '7', '3 × 2 + 1.'],
    '3-statistiques': ['Moyenne, médiane et étendue résument une série de façons différentes.', 'Moyenne de 4 et 10 ?', '7', 'Additionne puis divise par 2.'],
    '3-probabilites': ['Avec des issues équiprobables : issues favorables ÷ issues possibles.', 'Probabilité d’obtenir pile avec une pièce équilibrée ?', '1/2', 'Deux issues, une favorable.'],
    '3-grandeurs': ['Vérifie les unités avant de calculer, et convertis si nécessaire.', 'Combien de minutes dans 1,5 h ?', '90', '0,5 h = 30 min.'],
    '3-pythagore': ['Le théorème de Pythagore ne s’applique qu’à un triangle rectangle.', 'Combien vaut 3² + 4² ?', '25', '9 + 16.'],
    '3-thales': ['Thalès demande deux droites parallèles et des points alignés.', 'Un triangle est agrandi deux fois. Un côté de 3 cm devient ?', '6', 'Multiplie par 2.'],
    '3-trigonometrie': ['Cosinus, sinus et tangente se calculent dans un triangle rectangle.', 'Dans un triangle rectangle, combien vaut la somme des deux angles aigus ?', '90', 'La somme des trois angles vaut 180°.'],
    '3-transformations': ['Une transformation conserve ou multiplie les longueurs selon sa nature.', 'Une homothétie de rapport 3 transforme 2 cm en ?', '6', 'Multiplie par 3.'],
    '3-algorithmique': ['Exécute le programme ligne par ligne en notant la valeur des variables.', 'x vaut 4 ; on lui ajoute 3 deux fois. Que vaut x ?', '10', '4 puis 7 puis 10.']
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  window.TroisiemeExercises = {slugs: Object.keys(models), count: 6};
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
    const root = document.querySelector('[data-troisieme-chapter]');
    const node = document.getElementById('exercise-data');
    if (root && node) {
      const slug = root.dataset.troisiemeChapter;
      if (!models[slug]) throw new Error('Chapitre de 3e inconnu : ' + slug);
      node.textContent = JSON.stringify({slug, exercises: models[slug].map((_, i) => V.original(slug, i))});
    }
  }
})();
