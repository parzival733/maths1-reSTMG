/* Seconde générale et technologique : 96 modèles déclaratifs (16 chapitres × 6),
   programme de 2026 (BO n° 14 du 2 avril 2026). Énoncés, réponses et corrections
   sont calculés à partir des mêmes paramètres.
   Le moteur, le score et la révélation des réponses sont ceux des autres niveaux. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant la Seconde.');
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
    hint, level: 'Seconde', tasks: TASKS
  });
  // Réponses limitées à 100 000 en valeur absolue.
  const T = model => ({limit: 100000, decimals: 6, ...model});

  const sqrtFree = n => { let k = 1, m = n; for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; } return [k, m]; };
  const sig = (x, n) => { if (x === 0) return 0; const e = Math.floor(Math.log10(Math.abs(x))) + 1 - n; return Math.round(x / 10 ** e) * 10 ** e; };
  const det = (a, b, c, d) => a * d - b * c;
  // Terme d’une expression Python : signe séparé par des espaces, coefficient 1 omis.
  const pyTerm = (k, v, first = false) => {
    const m = Math.abs(k), body = v ? (m === 1 ? v : m + '*' + v) : String(m);
    return first ? (k < 0 ? '-' : '') + body : (k < 0 ? '- ' : '+ ') + body;
  };
  const vec = (x, y) => '(' + fr(x) + ' ; ' + fr(y) + ')';
  const py = lines => '<pre><code>' + lines.map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n') + '</code></pre>';
  const std = (vals, eff) => { const n = sum(eff), m = sum(vals.map((v, i) => v * eff[i])) / n; return Math.sqrt(sum(vals.map((v, i) => eff[i] * (v - m) ** 2)) / n); };
  const quartiles = list => { const s = [...list].sort((a, b) => a - b), n = s.length; return [s[Math.ceil(n / 4) - 1], s[Math.ceil(3 * n / 4) - 1]]; };
  const signWord = v => (v > 0 ? 'positif' : 'négatif');
  // « a + b » sans écrire « + 0 ».
  const plus = (a, b) => (b === 0 ? fr(a) : fr(a) + ' + ' + pa(b));
  // « t − a » sans écrire « − 0 ».
  const tMinus = (t, a) => (a === 0 ? t : t + (a > 0 ? ' ' + M + ' ' : ' + ') + fr(Math.abs(a)));

  const models = {
    /* ---------- 01 · Arithmétique ---------- */
    '2-arithmetique': [
      T({ // Multiple ou non
        base: {kind: 1, b: 7, q: 13, r: 3},
        params: r => ({kind: r.int(0, 1), b: r.int(3, 19), q: r.int(8, 60), r: r.int(1, 18)}),
        accept: ({b, r}) => r < b,
        difficulty: ({b, q}) => score({steps: 2, values: [b * q]}),
        verify: ({kind, b, q, r}, v) => { const a = b * q + (kind ? r : 0); return (v[0] === 'oui') === (a % b === 0) && v[1] === a % b; },
        build: ({kind, b, q, r}) => { const a = b * q + (kind ? r : 0), rest = a % b;
          return item('Reconnaître un multiple', `Le nombre ${a} est-il un multiple de ${b} ? Donne aussi le reste de la division euclidienne de ${a} par ${b}.`,
            [S(`${a} est-il multiple de ${b} ?`, rest ? 'non' : 'oui', ['oui', 'non']), Q('Reste', rest)],
            C(`a est multiple de b s’il existe un entier k tel que a = k × b, c’est-à-dire si le reste de la division de a par b est nul.`,
              [rest ? `${a} = ${b} × ${Math.floor(a / b)} + ${rest}.` : `${a} = ${b} × ${q}, reste nul.`],
              rest ? `le reste vaut ${rest} : ${a} n’est pas un multiple de ${b}.` : `${a} = ${b} × ${q} : c’est un multiple de ${b}.`),
            'Effectue la division euclidienne.'); }
      }),
      T({ // Plus grand multiple inférieur
        base: {a: 13, b: 200},
        params: r => ({a: r.int(6, 40), b: r.int(100, 999)}),
        accept: ({a, b}) => b % a !== 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b]}),
        verify: ({a, b}, v) => v[1] === a * v[0] && v[1] <= b && v[1] + a > b,
        build: ({a, b}) => { const k = Math.floor(b / a);
          return item('Trouver le plus grand multiple inférieur', `Détermine le plus grand multiple de ${a} inférieur ou égal à ${b}, sous la forme ${a} × k.`,
            [Q('Valeur de k', k), Q('Multiple obtenu', a * k)],
            C('k est le quotient de la division euclidienne de ' + b + ' par ' + a + '.',
              [`${b} = ${a} × ${k} + ${b - a * k}, avec ${b - a * k} < ${a}.`, `${a} × ${k + 1} = ${a * (k + 1)} dépasse ${b}.`],
              `le plus grand multiple de ${a} inférieur ou égal à ${b} est ${a * k}.`),
            'Un algorithme le trouve en ajoutant ' + a + ' tant que le résultat ne dépasse pas ' + b + '.'); }
      }),
      T({ // Carré d'un impair
        base: {k: 6},
        params: r => ({k: r.int(3, 60)}),
        difficulty: () => score({steps: 3, values: [50]}),
        verify: ({k}, v) => 2 * v[0] + 1 === 2 * k + 1 && 2 * v[1] + 1 === (2 * k + 1) ** 2,
        build: ({k}) => { const n = 2 * k + 1, m = 2 * k * k + 2 * k;
          return item('Démontrer qu’un carré impair est impair', `n = ${n} est impair : n = 2k + 1. On démontre que n² s’écrit 2m + 1, avec m entier.`,
            [Q('Valeur de k', k), Q('Valeur de m', m)],
            C('si n = 2k + 1, alors n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1 : n² est impair, avec m = 2k² + 2k.',
              [`${n} = 2 × ${k} + 1.`, `m = 2 × ${k}² + 2 × ${k} = ${m}, et 2 × ${m} + 1 = ${n * n} = ${n}².`],
              `k = ${k} et m = ${m}.`),
            'Développe (2k + 1)², puis factorise 2 dans les premiers termes.'); }
      }),
      T({ // Fraction irréductible
        base: {p: 7, q: 12, k: 18},
        params: r => ({p: r.int(2, 30), q: r.int(3, 40), k: r.int(6, 40)}),
        accept: ({p, q, k}) => gcd(p, q) === 1 && p !== q && p * k <= 999 && q * k <= 999,
        difficulty: ({p, q, k}) => score({steps: 3, values: [p * k, q * k], fractions: true}),
        verify: ({p, q, k}, v) => v[0] * q === v[1] * p && gcd(v[0], v[1]) === 1 && v[1] > 0,
        build: ({p, q, k}) => item('Écrire une fraction sous forme irréductible', `Écris ${p * k}/${q * k} sous forme irréductible.`,
          [Q('Numérateur', p), Q('Dénominateur', q)],
          C('on divise numérateur et dénominateur par leur plus grand diviseur commun.',
            [`${p * k} = ${k} × ${p} et ${q * k} = ${k} × ${q}, et ${p} et ${q} n’ont pas d’autre diviseur commun que 1.`],
            `${p * k}/${q * k} = ${p}/${q}.`),
          'Décompose les deux nombres en produits de facteurs premiers.')
      }),
      T({ // Tester la primalité
        base: {kind: 1, n: 221},
        params: r => { const kind = r.int(0, 1); const primes = [], comp = [];
          for (let n = 151; n <= 499; n += 2) { if (isPrime(n)) primes.push(n); else if (n % 3 && n % 5) comp.push(n); }
          return {kind, n: r.pick(kind ? comp : primes)}; },
        difficulty: ({n}) => score({steps: 3, values: [n]}),
        verify: ({n}, v) => (v[0] === 'oui') === isPrime(n) && v[1] === smallest(n),
        build: ({n}) => { const p = isPrime(n), d = smallest(n), lim = Math.floor(Math.sqrt(n));
          return item('Tester si un nombre est premier', `Le nombre ${n} est-il premier ? Donne son plus petit diviseur premier.`,
            [S(`${n} est-il premier ?`, p ? 'oui' : 'non', ['oui', 'non']), Q('Plus petit diviseur premier', d)],
            C(`il suffit de tester les nombres premiers inférieurs ou égaux à √${n} ≈ ${fr(r2(Math.sqrt(n), 1))}.`,
              [p ? `Aucun nombre premier jusqu’à ${lim} ne divise ${n}.` : `${n} = ${d} × ${n / d}.`],
              p ? `${n} est premier.` : `${n} n’est pas premier ; son plus petit diviseur premier est ${d}.`),
            'Si n n’est pas premier, il a un diviseur premier p tel que p² ≤ n.'); }
      }),
      T({ // Multiples dans un intervalle
        base: {a: 7, A: 50, B: 130},
        params: r => ({a: r.int(3, 25), A: r.int(20, 300), B: r.int(100, 900)}),
        accept: ({a, A, B}) => B - A >= 3 * a && A % a !== 0,
        difficulty: ({a, B}) => score({steps: 3, values: [a, B]}),
        verify: ({a, A, B}, v) => v[0] % a === 0 && v[0] >= A && v[0] - a < A && v[1] === Math.floor(B / a) - Math.floor((A - 1) / a),
        build: ({a, A, B}) => { const first = Math.ceil(A / a) * a, last = Math.floor(B / a) * a, n = (last - first) / a + 1;
          return item('Compter des multiples', `On s’intéresse aux multiples de ${a} compris entre ${A} et ${B} (inclus).`,
            [Q('Plus petit de ces multiples', first), Q('Nombre de ces multiples', n)],
            C('les multiples de ' + a + ' sont régulièrement espacés de ' + a + ' : on repère le premier et le dernier, puis on compte les pas.',
              [`Premier : ${a} × ${first / a} = ${first}. Dernier : ${a} × ${last / a} = ${last}.`, `Nombre : ${last / a} ${M} ${first / a} + 1 = ${n}.`],
              `le premier est ${first} et il y en a ${n}.`),
            'N’oublie pas de compter le premier multiple : ajoute 1.'); }
      })
    ],

    /* ---------- 02 · Nombres réels ---------- */
    '2-nombres-reels': [
      T({ // Appartenance à un intervalle
        base: {a: -2, b: 5, kind: 1, x: 5},
        params: r => { const a = r.int(-9, 5), b = a + r.int(3, 12), kind = r.int(0, 1);
          return {a, b, kind, x: kind ? r.pick([b, a - r.int(1, 4), b + r.int(1, 4)]) : r.int(a, b - 1)}; },
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, b - a]}),
        verify: ({a, b, x}, v) => (v[0] === 'oui') === (x >= a && x < b) && v[1] === b - a,
        build: ({a, b, x}) => { const ok = x >= a && x < b;
          return item('Utiliser un intervalle', `On considère l’intervalle I = ${fmt.interval(a, b, '[', '[')}. Le réel ${fr(x)} appartient-il à I ? Quelle est l’amplitude de I ?`,
            [S(`${fr(x)} appartient-il à I ?`, ok ? 'oui' : 'non', ['oui', 'non']), Q('Amplitude de I', b - a)],
            C(`I contient les réels x tels que ${fr(a)} ≤ x < ${fr(b)} : le crochet tourné vers l’extérieur exclut la borne ${fr(b)}.`,
              [ok ? `${fr(a)} ≤ ${fr(x)} < ${fr(b)}.` : x === b ? `${fr(b)} est exclu par le crochet.` : `${fr(x)} est en dehors de [${fr(a)} ; ${fr(b)}].`, `Amplitude : ${fmt.diff(b, a)} = ${b - a}.`],
              `${fr(x)} ${ok ? 'appartient' : 'n’appartient pas'} à I, d’amplitude ${b - a}.`),
            'Regarde le sens de chaque crochet.'); }
      }),
      T({ // Distance entre deux réels
        base: {a: -3, b: 8},
        params: r => ({a: r.int(-30, 30), b: r.int(-30, 30)}),
        accept: ({a, b}) => Math.abs(a - b) >= 3 && a !== 0 && b !== 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, a - b], negatives: true}),
        verify: ({a, b}, v) => v[0] === Math.abs(a - b) && close(v[1], (a + b) / 2),
        build: ({a, b}) => item('Calculer une distance sur la droite numérique', `Sur la droite numérique, A a pour abscisse ${fr(a)} et B pour abscisse ${fr(b)}.`,
          [Q('Distance AB = |a − b|', Math.abs(a - b)), Q('Abscisse du milieu de [AB]', (a + b) / 2)],
          C('la distance entre deux réels a et b est |a − b| ; le milieu a pour abscisse (a + b)/2.',
            [`|${fmt.diff(a, b)}| = |${fr(a - b)}| = ${Math.abs(a - b)}.`, `(${fr(a)} + ${pa(b)}) ÷ 2 = ${fr((a + b) / 2)}.`],
            `AB = ${Math.abs(a - b)} et le milieu a pour abscisse ${fr((a + b) / 2)}.`),
          'Une distance est toujours positive.')
      }),
      T({ // |x − a| ≤ r
        base: {a: 3, r: 2},
        params: r => ({a: r.int(-15, 15), r: r.int(1, 12) / (r.chance(0.3) ? 2 : 1)}),
        accept: ({a}) => a !== 0,
        difficulty: ({a, r}) => score({steps: 2, values: [a, r, a + r], negatives: true}),
        verify: ({a, r}, v) => close(v[0], a - r) && close(v[1], a + r),
        build: ({a, r}) => item('Traduire une valeur absolue en intervalle', `Écris l’ensemble des réels x tels que |x ${a > 0 ? M : '+'} ${fr(Math.abs(a))}| ≤ ${fr(r)} sous la forme d’un intervalle [m ; M].`,
          [Q('Borne m', a - r), Q('Borne M', a + r)],
          C(`|x − a| ≤ r signifie que la distance entre x et a est au plus r : x ∈ [a − r ; a + r].`,
            [`Ici a = ${fr(a)} et r = ${fr(r)}.`, `[${fr(a)} ${M} ${fr(r)} ; ${fr(a)} + ${fr(r)}] = [${fr(a - r)} ; ${fr(a + r)}].`],
            `l’ensemble cherché est [${fr(a - r)} ; ${fr(a + r)}].`),
          `Repère le centre a : |x ${a > 0 ? M : '+'} ${fr(Math.abs(a))}| est la distance entre x et ${fr(a)}.`)
      }),
      T({ // Encadrement décimal
        base: {n: 7, k: 2},
        params: r => ({n: r.int(2, 99), k: r.int(1, 3)}),
        accept: ({n}) => !Number.isInteger(Math.sqrt(n)),
        difficulty: ({n}) => score({steps: 2, values: [n], decimals: true}),
        verify: ({n, k}, v) => { const s = Math.sqrt(n); return v[0] <= s && s < v[1] && close(v[1] - v[0], 10 ** -k); },
        build: ({n, k}) => { const lo = Math.floor(Math.sqrt(n) * 10 ** k) / 10 ** k, hi = r2(lo + 10 ** -k, k);
          return item('Encadrer un nombre irrationnel', `Donne un encadrement de √${n} d’amplitude 10${sup(-k)}, par deux décimaux à ${k} chiffre${k > 1 ? 's' : ''} après la virgule.`,
            [Q('Borne inférieure', lo, k), Q('Borne supérieure', hi, k)],
            C('on cherche deux décimaux consécutifs à 10<sup>−' + k + '</sup> près dont les carrés encadrent ' + n + '.',
              [`${fr(lo)}² = ${fr(r2(lo * lo, 2 * k))} et ${fr(hi)}² = ${fr(r2(hi * hi, 2 * k))}.`, `${fr(r2(lo * lo, 2 * k))} ≤ ${n} < ${fr(r2(hi * hi, 2 * k))}.`],
              `${fr(lo)} ≤ √${n} < ${fr(hi)}.`),
            'Un algorithme par balayage augmente la borne de 10⁻ⁿ tant que son carré reste inférieur au nombre.'); }
      }),
      T({ // Chiffres significatifs
        base: {m: 34567, e: -2},
        params: r => ({m: r.int(10001, 99999), e: r.int(-6, 0)}),
        accept: ({m}) => m % 100 > 9 && m % 1000 > 99,
        difficulty: ({e}) => score({steps: 2, values: [Math.abs(e) * 10], decimals: true}),
        verify: ({m, e}, v) => { const x = m * 10 ** e; return close(v[0], sig(x, 2)) && close(v[1], sig(x, 3)); },
        build: ({m, e}) => { const x = m * 10 ** e, a = sig(x, 2), b = sig(x, 3);
          return item('Arrondir avec des chiffres significatifs', `Une mesure donne ${decimal(m, e)}. Arrondis-la avec 2 chiffres significatifs, puis avec 3.`,
            [Q('Arrondi à 2 chiffres significatifs', a, 9), Q('Arrondi à 3 chiffres significatifs', b, 9)],
            C('on compte les chiffres à partir du premier chiffre non nul, puis on arrondit au dernier chiffre conservé.',
              [`${decimal(m, e)} ≈ ${decimal(Math.round(m / 1000), e + 3)} (2 chiffres) et ≈ ${decimal(Math.round(m / 100), e + 2)} (3 chiffres).`],
              `${decimal(Math.round(m / 1000), e + 3)} et ${decimal(Math.round(m / 100), e + 2)}.`),
            'Les zéros placés avant le premier chiffre non nul ne comptent pas.'); }
      }),
      T({ // Intersection et réunion d'intervalles
        base: {a: -3, b: 4, c: 1, d: 9},
        params: r => { const a = r.int(-12, 6), b = a + r.int(3, 12), c = r.int(a + 1, b - 1), d = b + r.int(1, 10); return {a, b, c, d}; },
        difficulty: ({a, d}) => score({steps: 2, values: [a, d], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === Math.max(a, c) && v[1] === Math.min(b, d) && v[2] === Math.min(a, c) && v[3] === Math.max(b, d),
        build: ({a, b, c, d}) => item('Réunir et intersecter des intervalles', `I = [${fr(a)} ; ${fr(b)}] et J = [${fr(c)} ; ${fr(d)}]. Détermine I ∩ J = [m ; M] et I ∪ J = [p ; P].`,
          [Q('m', c), Q('M', b), Q('p', a), Q('P', d)],
          C('I ∩ J contient les réels qui sont dans les deux intervalles ; I ∪ J ceux qui sont dans l’un au moins.',
            [`Sur la droite numérique : ${fr(a)} < ${fr(c)} < ${fr(b)} < ${fr(d)}.`],
            `I ∩ J = [${fr(c)} ; ${fr(b)}] et I ∪ J = [${fr(a)} ; ${fr(d)}].`),
          'Représente les deux intervalles sur une même droite graduée.')
      })
    ],

    /* ---------- 03 · Calcul algébrique ---------- */
    '2-calcul-algebrique': [
      T({ // Puissances
        base: {m: 5, n: 3, p: 2, q: 4},
        params: r => ({m: r.int(-4, 8), n: r.int(-4, 8), p: r.int(-4, 6), q: r.int(-4, 6)}),
        accept: ({m, n, p, q}) => m !== p && n !== q && m && n && p && q,
        difficulty: ({m, n, p, q}) => score({steps: 3, values: [m, n, p, q], negatives: true}),
        verify: ({m, n, p, q}, v) => v[0] === m - p && v[1] === n - q,
        build: ({m, n, p, q}) => item('Calculer avec des puissances', `Écris A = (2${sup(m)} × 3${sup(n)}) ÷ (2${sup(p)} × 3${sup(q)}) sous la forme 2<sup>a</sup> × 3<sup>b</sup>.`,
          [Q('Exposant a', m - p), Q('Exposant b', n - q)],
          C('x<sup>m</sup> ÷ x<sup>p</sup> = x<sup>m − p</sup>, pour chaque base séparément.',
            [`2${sup(m)} ÷ 2${sup(p)} = 2${sup(m - p)} et 3${sup(n)} ÷ 3${sup(q)} = 3${sup(n - q)}.`],
            `A = 2${sup(m - p)} × 3${sup(n - q)}.`),
          'Ne mélange pas les bases 2 et 3.')
      }),
      T({ // Racines carrées
        base: {k: 3, m: 5},
        params: r => ({k: r.int(2, 12), m: r.pick([2, 3, 5, 6, 7, 10, 11, 13])}),
        accept: ({k, m}) => k * k * m <= 1500,
        difficulty: ({k, m}) => score({steps: 2, values: [k, m]}),
        verify: ({k, m}, v) => v[0] * v[0] * v[1] === k * k * m && sqrtFree(v[1])[0] === 1,
        build: ({k, m}) => { const n = k * k * m;
          return item('Simplifier une racine carrée', `Écris √${n} sous la forme a√b, avec a et b entiers et b le plus petit possible.`,
            [Q('Valeur de a', k), Q('Valeur de b', m)],
            C('pour a et b positifs, √(ab) = √a × √b : on fait apparaître le plus grand carré qui divise ' + n + '.',
              [`${n} = ${k * k} × ${m} = ${k}² × ${m}.`, `√${n} = √${k * k} × √${m} = ${k}√${m}.`],
              `√${n} = ${k}√${m}.`),
            'Cherche un carré parfait (4, 9, 16, 25…) qui divise ' + n + '.'); }
      }),
      T({ // Identité remarquable à l'envers
        base: {p: 2, q: 3},
        params: r => ({p: r.int(1, 7), q: r.int(1, 15)}),
        accept: ({p, q}) => gcd(p, q) === 1 && p * p <= 49,
        difficulty: () => score({steps: 2, values: [20]}),
        verify: ({p, q}, v) => v[0] * v[0] === p * p && v[1] * v[1] === q * q && 2 * v[0] * v[1] === 2 * p * q,
        build: ({p, q}) => item('Factoriser avec une identité remarquable', `Factorise E = ${quad(p * p, -2 * p * q, q * q)} sous la forme (ax ${M} b)², avec a et b positifs.`,
          [Q('Valeur de a', p), Q('Valeur de b', q)],
          C('on reconnaît u² − 2uv + v² = (u − v)².',
            [`${mono(p * p, 'x²')} = (${mono(p)})², ${q * q} = ${q}² et 2 × ${mono(p)} × ${q} = ${mono(2 * p * q)}.`],
            `E = (${mono(p)} ${M} ${q})².`),
          'Vérifie le double produit avant de conclure.')
      }),
      T({ // Puissances de fractions
        base: {a: 2, b: 3, n: 2},
        params: r => ({a: r.int(1, 7), b: r.int(2, 9), n: r.int(2, 3)}),
        accept: ({a, b, n}) => gcd(a, b) === 1 && b ** n <= 729 && a !== 1,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], fractions: true}),
        verify: ({a, b, n}, v) => close(v[0], (a / b) ** n) && close(v[1], (b / a) ** n),
        build: ({a, b, n}) => item('Calculer des puissances de fractions', `Calcule (${a}/${b})${sup(n)} et (${a}/${b})${sup(-n)}.`,
          [Q(`(${a}/${b})${SUP(n)}`, (a / b) ** n, 4), Q(`(${a}/${b})${SUP(-n)}`, (b / a) ** n, 4)],
          C('(a/b)<sup>n</sup> = a<sup>n</sup>/b<sup>n</sup> et x<sup>−n</sup> = 1/x<sup>n</sup>, donc (a/b)<sup>−n</sup> = (b/a)<sup>n</sup>.',
            [`(${a}/${b})${sup(n)} = ${a ** n}/${b ** n}.`, `(${a}/${b})${sup(-n)} = (${b}/${a})${sup(n)} = ${frac(b ** n, a ** n)}.`],
            `${a ** n}/${b ** n} et ${frac(b ** n, a ** n)}.`),
          'Un exposant négatif inverse la fraction.')
      }),
      T({ // Isoler une variable
        base: {kind: 0, x: 12, y: 3},
        params: r => ({kind: r.int(0, 2), x: r.int(2, 60), y: r.int(2, 20)}),
        accept: ({x, y}) => x !== y,
        difficulty: ({x, y}) => score({steps: 2, values: [x * y], decimals: true}),
        verify: ({kind, x, y}, v) => close(v[0], [x / y, x / y, x / 2 - y][kind]),
        build: ({kind, x, y}) => {
          const spec = [
            ['U = R × I', `U = ${x} V et R = ${y} Ω`, 'I = U ÷ R', 'Intensité I, en A', x / y, `I = ${x} ÷ ${y}`],
            ['d = v × t', `d = ${x} km et v = ${y} km/h`, 't = d ÷ v', 'Durée t, en h', x / y, `t = ${x} ÷ ${y}`],
            ['P = 2(L + ℓ)', `P = ${x} cm et L = ${y} cm`, 'ℓ = P ÷ 2 − L', 'Largeur ℓ, en cm', x / 2 - y, `ℓ = ${x} ÷ 2 ${M} ${y}`]][kind];
          return item('Isoler une variable dans une formule', `On utilise la formule ${spec[0]}, avec ${spec[1]}. Isole l’inconnue, puis calcule-la.`,
            [Q(spec[3], spec[4]), Q('Valeur arrondie au dixième', spec[4], 1)],
            C(`on transforme la formule pour obtenir ${spec[2]}.`, [`${spec[5]} ${eq(spec[4])}.`], `${spec[2].split(' ')[0]} ${eq(spec[4])}.`),
            'Effectue la même opération dans les deux membres pour isoler la lettre.');
        }
      }),
      T({ // √(a + b) et √a + √b
        base: {a: 9, b: 16, o: 0},
        params: r => ({a: r.int(2, 80), b: r.int(2, 80), o: r.int(0, 1)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a + b], decimals: true}),
        verify: ({a, b}, v) => close(v[0], Math.sqrt(a + b)) && close(v[1], Math.sqrt(a) + Math.sqrt(b)) && v[2] === '√a + √b',
        build: ({a, b, o}) => { const x = Math.sqrt(a + b), y = Math.sqrt(a) + Math.sqrt(b), opts = o ? ['√a + √b', '√(a + b)'] : ['√(a + b)', '√a + √b'];
          return item('Comparer √(a + b) et √a + √b', `Pour a = ${a} et b = ${b}, calcule √(a + b) et √a + √b, puis compare-les.`,
            [Q('√(a + b)', x), Q('√a + √b', y), S('La plus grande valeur est', '√a + √b', opts)],
            C('pour a et b strictement positifs, √(a + b) < √a + √b : la racine carrée d’une somme n’est jamais la somme des racines.',
              [`√${a + b} ${eq(x)} et √${a} + √${b} ${eq(y)}.`, '(√a + √b)² = a + b + 2√(ab), qui est strictement supérieur à a + b.'],
              `√(a + b) < √a + √b.`),
            'Élève les deux nombres au carré pour les comparer.'); }
      })
    ],

    /* ---------- 04 · Équations et inéquations ---------- */
    '2-equations': [
      T({ // Inéquation avec x des deux côtés
        base: {a: 5, b: -3, c: 2, d: 9},
        params: r => ({a: r.nonZero(1, 9), b: r.nonZero(1, 15), c: r.nonZero(1, 9), d: r.nonZero(1, 15)}),
        accept: ({a, c, b, d}) => a !== c && d !== b && Math.abs(a - c) <= 8,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a - c, d - b], negatives: true, fractions: (d - b) % (a - c) !== 0}),
        verify: ({a, b, c, d}, v) => close(v[0], (d - b) / (a - c)) && (v[1] === 'x ≤ frontière') === (a - c > 0),
        build: ({a, b, c, d}) => { const k = a - c, s = (d - b) / k;
          return item('Résoudre une inéquation du premier degré', `Résous ${lin(a, b)} ≤ ${lin(c, d)}.`,
            [Q('Valeur frontière', s), S('Les solutions vérifient', k > 0 ? 'x ≤ frontière' : 'x ≥ frontière', ['x ≤ frontière', 'x ≥ frontière'])],
            C('on regroupe les x, puis on divise par leur coefficient ; diviser par un nombre négatif change le sens de l’inégalité.',
              [`${mono(k)} ≤ ${fr(d - b)}.`, k > 0 ? `x ≤ ${frac(d - b, k)}.` : `On divise par ${fr(k)} < 0 : x ≥ ${frac(d - b, k)}.`],
              `S = ${k > 0 ? ']−∞ ; ' + frac(d - b, k) + ']' : '[' + frac(d - b, k) + ' ; +∞['}.`),
            'Regarde le signe du coefficient de x après regroupement.'); }
      }),
      T({ // Produit nul à racines fractionnaires
        base: {a: 2, b: -3, c: 3, d: 4},
        params: r => ({a: r.int(1, 6), b: r.nonZero(1, 12), c: r.int(1, 6), d: r.nonZero(1, 12)}),
        accept: ({a, b, c, d}) => b * c !== a * d && (b % a !== 0 || d % c !== 0) && gcd(Math.abs(b), a) === 1 && gcd(Math.abs(d), c) === 1,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [b, d, a, c], negatives: true, fractions: true}),
        verify: ({a, b, c, d}, v) => v[0] < v[1] && [v[0], v[1]].every(x => close((a * x + b) * (c * x + d), 0, 1e-6)),
        build: ({a, b, c, d}) => { const x1 = -b / a, x2 = -d / c, lo = Math.min(x1, x2), hi = Math.max(x1, x2);
          return item('Résoudre une équation produit nul', `Résous (${lin(a, b)})(${lin(c, d)}) = 0.`,
            [Q('Plus petite solution', lo), Q('Plus grande solution', hi)],
            C('un produit est nul si et seulement si l’un de ses facteurs est nul.',
              [`${lin(a, b)} = 0 donne x = ${frac(-b, a)} ; ${lin(c, d)} = 0 donne x = ${frac(-d, c)}.`],
              `S = {${frac(Math.round(lo * a * c), a * c)} ; ${frac(Math.round(hi * a * c), a * c)}}.`),
            'Les solutions peuvent être des fractions : garde-les sous forme exacte.'); }
      }),
      T({ // x² = a
        base: {a: 20},
        params: r => ({a: r.int(2, 150)}),
        accept: ({a}) => !Number.isInteger(Math.sqrt(a)),
        difficulty: ({a}) => score({steps: 2, values: [a], decimals: true}),
        verify: ({a}, v) => close(v[0], -Math.sqrt(a)) && close(v[1], Math.sqrt(a)),
        build: ({a}) => { const [k, m] = sqrtFree(a), exact = k > 1 ? `${k}√${m}` : `√${a}`;
          return item('Résoudre x² = a', `Résous x² = ${a}. Donne les solutions arrondies au centième.`,
            [Q('Solution négative', -Math.sqrt(a)), Q('Solution positive', Math.sqrt(a))],
            C('si a > 0, l’équation x² = a a deux solutions : √a et −√a.',
              [k > 1 ? `√${a} = ${exact} ${eq(Math.sqrt(a))}.` : `√${a} ${eq(Math.sqrt(a))}.`],
              `S = {${M}${exact} ; ${exact}}, soit environ ${M}${fr(r2(Math.sqrt(a)))} et ${fr(r2(Math.sqrt(a)))}.`),
            'N’oublie pas la solution négative.'); }
      }),
      T({ // a / x = b
        base: {a: 12, b: 5, c: 8},
        params: r => ({a: r.nonZero(2, 40), b: r.nonZero(2, 15), c: r.nonZero(2, 15)}),
        accept: ({b, c}) => b !== c,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], fractions: true}),
        verify: ({a, b, c}, v) => close(a / v[0], b) && close(a / v[1], c),
        build: ({a, b, c}) => item('Résoudre a/x = b', `Résous ${fr(a)}/x = ${fr(b)}, puis ${fr(a)}/x = ${fr(c)} (x ≠ 0).`,
          [Q(`Solution de ${fr(a)}/x = ${fr(b)}`, a / b), Q(`Solution de ${fr(a)}/x = ${fr(c)}`, a / c)],
          C('pour x ≠ 0 et b ≠ 0, a/x = b équivaut à a = bx, donc x = a/b.',
            [`x = ${fr(a)}/${pa(b)}${frac(a, b) === fr(a) + '/' + fr(b) ? '' : ' = ' + frac(a, b)} ; x = ${fr(a)}/${pa(c)}${frac(a, c) === fr(a) + '/' + fr(c) ? '' : ' = ' + frac(a, c)}.`],
            `x = ${frac(a, b)}, puis x = ${frac(a, c)}.`),
          'Multiplie les deux membres par x.')
      }),
      T({ // Modéliser par une inéquation
        base: {S: 45, m: 9, n: 5},
        params: r => ({S: 5 * r.int(4, 30), m: r.int(6, 20), n: r.int(2, 12)}),
        accept: ({S, m, n}) => n < m && S % (m - n) !== 0,
        difficulty: ({S, m, n}) => score({steps: 3, values: [S, S / (m - n)], decimals: true}),
        verify: ({S, m, n}, v) => close(v[0], S / (m - n)) && v[1] === Math.floor(S / (m - n)) + 1,
        build: ({S, m, n}) => { const s = S / (m - n), N0 = Math.floor(s) + 1;
          return item('Modéliser par une inéquation', `Une salle de sport propose deux tarifs : ${m} € la séance, ou un forfait de ${S} € puis ${n} € la séance. On note x le nombre de séances.`,
            [Q('Valeur frontière', s), Q('Nombre minimal de séances pour que le forfait soit moins cher', N0)],
            C(`le forfait est moins cher si ${S} + ${n}x < ${m}x.`,
              [`${S} < ${m - n}x, soit x > ${frac(S, m - n)} ${eq(s)}.`],
              `le forfait devient plus avantageux à partir de ${N0} séances.`),
            'Le nombre de séances est entier.'); }
      }),
      T({ // Encadrements et inégalités
        base: {a: 2, b: 5, c: -1, d: 3},
        params: r => { const a = r.int(-8, 6), c = r.int(-8, 6); return {a, b: a + r.int(1, 8), c, d: c + r.int(1, 8)}; },
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a, b, c, d], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === a - d && v[1] === b - c && v[2] === -2 * b && v[3] === -2 * a,
        build: ({a, b, c, d}) => item('Opérer sur des inégalités', `On sait que ${fr(a)} ≤ x ≤ ${fr(b)} et ${fr(c)} ≤ y ≤ ${fr(d)}. Encadre x ${M} y, puis ${M}2x.`,
          [Q('Minimum de x − y', a - d), Q('Maximum de x − y', b - c), Q('Minimum de −2x', -2 * b), Q('Maximum de −2x', -2 * a)],
          C('on peut additionner des inégalités de même sens ; multiplier par un nombre négatif change le sens.',
            [`${fr(-d)} ≤ ${M}y ≤ ${fr(-c)}, donc ${fr(a - d)} ≤ x ${M} y ≤ ${fr(b - c)}.`, `En multipliant par ${M}2 : ${fr(-2 * b)} ≤ ${M}2x ≤ ${fr(-2 * a)}.`],
            `${fr(a - d)} ≤ x ${M} y ≤ ${fr(b - c)} et ${fr(-2 * b)} ≤ ${M}2x ≤ ${fr(-2 * a)}.`),
          'Pour soustraire y, ajoute l’encadrement de −y, dont les bornes sont échangées.')
      })
    ],

    /* ---------- 05 · Vecteurs ---------- */
    '2-vecteurs': [
      T({ // Coordonnées de AB
        base: {xa: 1, ya: -2, xb: 4, yb: 3},
        params: r => ({xa: r.int(-9, 9), ya: r.int(-9, 9), xb: r.int(-9, 9), yb: r.int(-9, 9)}),
        accept: ({xa, ya, xb, yb}) => xa !== xb && ya !== yb,
        difficulty: () => score({steps: 2, values: [18], negatives: true}),
        verify: ({xa, ya, xb, yb}, v) => v[0] === xb - xa && v[1] === yb - ya,
        build: ({xa, ya, xb, yb}) => item('Calculer les coordonnées d’un vecteur', `Dans un repère orthonormé, A${vec(xa, ya)} et B${vec(xb, yb)}. Calcule les coordonnées du vecteur <span class="vec"><span class="sr-only">vecteur </span>AB</span>.`,
          [Q('Abscisse du vecteur AB', xb - xa), Q('Ordonnée du vecteur AB', yb - ya)],
          C('<span class="vec"><span class="sr-only">vecteur </span>AB</span> a pour coordonnées (x<sub>B</sub> − x<sub>A</sub> ; y<sub>B</sub> − y<sub>A</sub>).',
            [`${fmt.diff(xb, xa)} = ${fr(xb - xa)} et ${fmt.diff(yb, ya)} = ${fr(yb - ya)}.`],
            `<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(xb - xa, yb - ya)}.`),
          'Arrivée moins départ.')
      }),
      T({ // Combinaison linéaire
        base: {a: 2, b: -1, c: 3, d: 4, k: 2, l: -1},
        params: r => ({a: r.int(-6, 6), b: r.int(-6, 6), c: r.int(-6, 6), d: r.int(-6, 6), k: r.nonZero(2, 4), l: r.nonZero(1, 3)}),
        accept: ({a, b, c, d}) => det(a, b, c, d) !== 0,
        difficulty: () => score({steps: 3, values: [30], negatives: true}),
        verify: ({a, b, c, d, k, l}, v) => v[0] === k * a + l * c && v[1] === k * b + l * d,
        build: ({a, b, c, d, k, l}) => item('Combiner deux vecteurs', `<span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>v</span>${vec(c, d)}. Calcule les coordonnées de <span class="vec"><span class="sr-only">vecteur </span>w</span> = ${fr(k)}<span class="vec"><span class="sr-only">vecteur </span>u</span> ${l > 0 ? '+' : M} ${Math.abs(l) === 1 ? '' : Math.abs(l)}<span class="vec"><span class="sr-only">vecteur </span>v</span>.`,
          [Q('Abscisse du vecteur w', k * a + l * c), Q('Ordonnée du vecteur w', k * b + l * d)],
          C('on multiplie les coordonnées par le réel, puis on additionne coordonnée par coordonnée.',
            [`${fr(k)} × ${pa(a)} + ${pa(l)} × ${pa(c)} = ${fr(k * a + l * c)}.`, `${fr(k)} × ${pa(b)} + ${pa(l)} × ${pa(d)} = ${fr(k * b + l * d)}.`],
            `<span class="vec"><span class="sr-only">vecteur </span>w</span>${vec(k * a + l * c, k * b + l * d)}.`),
          'Traite les abscisses, puis les ordonnées.')
      }),
      T({ // Norme
        base: {a: 3, b: -4},
        params: r => ({a: r.nonZero(1, 12), b: r.nonZero(1, 12)}),
        difficulty: ({a, b}) => score({steps: 2, values: [a * a + b * b], decimals: true}),
        verify: ({a, b}, v) => v[0] === a * a + b * b && close(v[1], Math.sqrt(v[0])),
        build: ({a, b}) => { const n2 = a * a + b * b;
          return item('Calculer une norme', `Dans une base orthonormée, <span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)}. Calcule ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖² puis ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖.`,
            [Q('Norme de u au carré', n2), Q('Norme de u', Math.sqrt(n2))],
            C('dans une base orthonormée, ‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ = √(x² + y²), conséquence du théorème de Pythagore.',
              [`‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖² = ${pa(a)}² + ${pa(b)}² = ${n2}.`, `‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ = √${n2} ${eq(Math.sqrt(n2))}.`],
              `‖<span class="vec"><span class="sr-only">vecteur </span>u</span>‖ ${eq(Math.sqrt(n2))}.`),
            'Une norme est une longueur, donc positive.'); }
      }),
      T({ // Milieu
        base: {xa: -3, ya: 2, xb: 5, yb: 7},
        params: r => ({xa: r.int(-12, 12), ya: r.int(-12, 12), xb: r.int(-12, 12), yb: r.int(-12, 12)}),
        accept: ({xa, ya, xb, yb}) => xa !== xb && ya !== yb,
        difficulty: () => score({steps: 2, values: [12], negatives: true}),
        verify: ({xa, ya, xb, yb}, v) => close(2 * v[0], xa + xb) && close(2 * v[1], ya + yb),
        build: ({xa, ya, xb, yb}) => item('Calculer les coordonnées d’un milieu', `A${vec(xa, ya)} et B${vec(xb, yb)}. Calcule les coordonnées du milieu I de [AB].`,
          [Q('Abscisse de I', (xa + xb) / 2), Q('Ordonnée de I', (ya + yb) / 2)],
          C('I est le milieu de [AB] si <span class="vec"><span class="sr-only">vecteur </span>AI</span> = <span class="vec"><span class="sr-only">vecteur </span>IB</span> ; ses coordonnées sont les moyennes de celles de A et B.',
            [`x<sub>I</sub> = (${plus(xa, xb)}) ÷ 2 = ${fr((xa + xb) / 2)} ; y<sub>I</sub> = (${plus(ya, yb)}) ÷ 2 = ${fr((ya + yb) / 2)}.`],
            `I${vec((xa + xb) / 2, (ya + yb) / 2)}.`),
          'Fais la moyenne des abscisses, puis des ordonnées.')
      }),
      T({ // Parallélogramme
        base: {xa: 1, ya: 1, xb: 5, yb: 2, xc: 6, yc: 6},
        params: r => ({xa: r.int(-8, 8), ya: r.int(-8, 8), xb: r.int(-8, 8), yb: r.int(-8, 8), xc: r.int(-8, 8), yc: r.int(-8, 8)}),
        accept: ({xa, ya, xb, yb, xc, yc}) => det(xb - xa, yb - ya, xc - xa, yc - ya) !== 0,
        difficulty: () => score({steps: 3, values: [16], negatives: true}),
        verify: ({xa, ya, xb, yb, xc, yc}, v) => xb - xa === xc - v[0] && yb - ya === yc - v[1],
        build: ({xa, ya, xb, yb, xc, yc}) => { const xd = xa + xc - xb, yd = ya + yc - yb;
          return item('Compléter un parallélogramme', `A${vec(xa, ya)}, B${vec(xb, yb)} et C${vec(xc, yc)}. Détermine D tel que ABCD soit un parallélogramme.`,
            [Q('Abscisse de D', xd), Q('Ordonnée de D', yd)],
            C('ABCD est un parallélogramme si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>DC</span>.',
              [`<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(xb - xa, yb - ya)} et <span class="vec"><span class="sr-only">vecteur </span>DC</span>(${fr(xc)} ${M} x ; ${fr(yc)} ${M} y).`, `x = ${fmt.diff(xc, xb - xa)} = ${fr(xd)} et y = ${fmt.diff(yc, yb - ya)} = ${fr(yd)}.`],
              `D${vec(xd, yd)}.`),
            'Attention à l’ordre des sommets : <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>DC</span>, et non <span class="vec"><span class="sr-only">vecteur </span>AB</span> = <span class="vec"><span class="sr-only">vecteur </span>CD</span>.'); }
      }),
      T({ // Relation de Chasles
        base: {xa: 0, ya: 2, u1: 3, u2: 1, v1: -1, v2: 4},
        params: r => ({xa: r.int(-6, 6), ya: r.int(-6, 6), u1: r.nonZero(1, 6), u2: r.int(-6, 6), v1: r.nonZero(1, 6), v2: r.int(-6, 6)}),
        accept: ({u1, u2, v1, v2}) => det(u1, u2, v1, v2) !== 0,
        difficulty: () => score({steps: 3, values: [12], negatives: true}),
        verify: ({xa, ya, u1, u2, v1, v2}, v) => v[0] === u1 + v1 && v[1] === u2 + v2 && v[2] === xa + u1 + v1 && v[3] === ya + u2 + v2,
        build: ({xa, ya, u1, u2, v1, v2}) => item('Utiliser la relation de Chasles', `A${vec(xa, ya)}, <span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(u1, u2)} et <span class="vec"><span class="sr-only">vecteur </span>BC</span>${vec(v1, v2)}. Calcule <span class="vec"><span class="sr-only">vecteur </span>AC</span>, puis les coordonnées de C.`,
          [Q('Abscisse du vecteur AC', u1 + v1), Q('Ordonnée du vecteur AC', u2 + v2), Q('Abscisse de C', xa + u1 + v1), Q('Ordonnée de C', ya + u2 + v2)],
          C('relation de Chasles : <span class="vec"><span class="sr-only">vecteur </span>AB</span> + <span class="vec"><span class="sr-only">vecteur </span>BC</span> = <span class="vec"><span class="sr-only">vecteur </span>AC</span>. Puis C est l’image de A par la translation de vecteur <span class="vec"><span class="sr-only">vecteur </span>AC</span>.',
            [`<span class="vec"><span class="sr-only">vecteur </span>AC</span>(${plus(u1, v1)} ; ${plus(u2, v2)}) = <span class="vec"><span class="sr-only">vecteur </span>AC</span>${vec(u1 + v1, u2 + v2)}.`, `C(${plus(xa, u1 + v1)} ; ${plus(ya, u2 + v2)}) = C${vec(xa + u1 + v1, ya + u2 + v2)}.`],
            `<span class="vec"><span class="sr-only">vecteur </span>AC</span>${vec(u1 + v1, u2 + v2)} et C${vec(xa + u1 + v1, ya + u2 + v2)}.`),
          'Les vecteurs s’enchaînent : l’arrivée de l’un est le départ du suivant.')
      })
    ],

    /* ---------- 06 · Colinéarité et géométrie repérée ---------- */
    '2-colinearite': [
      T({ // Déterminant
        base: {a: 2, b: 3, k: 2, on: 1, s: 1},
        params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 8), k: r.nonZero(2, 4), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 2, values: [40], negatives: true}),
        verify: ({a, b, k, on, s}, v) => { const c = k * a, d = k * b + (on ? 0 : s); return v[0] === det(a, b, c, d) && (v[1] === 'oui') === (v[0] === 0); },
        build: ({a, b, k, on, s}) => { const c = k * a, d = k * b + (on ? 0 : s), D = det(a, b, c, d);
          return item('Tester la colinéarité', `<span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>v</span>${vec(c, d)}. Calcule det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>). Les vecteurs sont-ils colinéaires ?`,
            [Q('Déterminant de u et v', D), S('Colinéaires ?', D === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = xy′ − x′y ; deux vecteurs sont colinéaires si et seulement si leur déterminant est nul.',
              [`det = ${fr(a)} × ${pa(d)} ${M} ${pa(c)} × ${pa(b)} = ${fr(D)}.`],
              D === 0 ? 'le déterminant est nul : <span class="vec"><span class="sr-only">vecteur </span>u</span> et <span class="vec"><span class="sr-only">vecteur </span>v</span> sont colinéaires.' : 'le déterminant n’est pas nul : <span class="vec"><span class="sr-only">vecteur </span>u</span> et <span class="vec"><span class="sr-only">vecteur </span>v</span> ne sont pas colinéaires.'),
            'Croise les coordonnées : abscisse de l’un par ordonnée de l’autre.'); }
      }),
      T({ // Alignement
        base: {xa: 1, ya: 2, dx: 2, dy: 3, k: 3, on: 0, s: 1},
        params: r => ({xa: r.int(-6, 6), ya: r.int(-6, 6), dx: r.nonZero(1, 4), dy: r.nonZero(1, 4), k: r.int(2, 3), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 3, values: [30], negatives: true}),
        verify: ({dx, dy, k, on, s}, v) => { const D = det(dx, dy, k * dx, k * dy + (on ? 0 : s)); return v[0] === D && (v[1] === 'oui') === (D === 0); },
        build: ({xa, ya, dx, dy, k, on, s}) => { const B = [xa + dx, ya + dy], Cc = [xa + k * dx, ya + k * dy + (on ? 0 : s)], D = det(dx, dy, Cc[0] - xa, Cc[1] - ya);
          return item('Démontrer un alignement', `A${vec(xa, ya)}, B${vec(...B)} et C${vec(...Cc)}. Les points A, B et C sont-ils alignés ?`,
            [Q('Déterminant des vecteurs AB et AC', D), S('A, B et C sont-ils alignés ?', D === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('A, B et C sont alignés si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>AC</span> sont colinéaires.',
              [`<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(dx, dy)} et <span class="vec"><span class="sr-only">vecteur </span>AC</span>${vec(Cc[0] - xa, Cc[1] - ya)}.`, `det = ${fr(dx)} × ${pa(Cc[1] - ya)} ${M} ${pa(Cc[0] - xa)} × ${pa(dy)} = ${fr(D)}.`],
              D === 0 ? 'les points A, B et C sont alignés.' : 'les points A, B et C ne sont pas alignés.'),
            'Calcule d’abord les coordonnées de <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>AC</span>.'); }
      }),
      T({ // Paramètre de colinéarité
        base: {a: 2, b: 5, c: 4},
        params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 9), c: r.nonZero(1, 12)}),
        accept: ({a, c}) => Math.abs(a) !== Math.abs(c),
        difficulty: ({a, b, c}) => score({steps: 2, values: [b * c / a], fractions: (b * c) % a !== 0, negatives: true}),
        verify: ({a, b, c}, v) => close(a * v[0] - b * c, 0) && close(v[1], c / a),
        build: ({a, b, c}) => item('Trouver une coordonnée manquante', `<span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>v</span>(${fr(c)} ; m). Pour quelle valeur de m les vecteurs sont-ils colinéaires ? On a alors <span class="vec"><span class="sr-only">vecteur </span>v</span> = k<span class="vec"><span class="sr-only">vecteur </span>u</span>.`,
          [Q('Valeur de m', b * c / a), Q('Valeur de k', c / a)],
          C('colinéaires équivaut à det(<span class="vec"><span class="sr-only">vecteur </span>u</span>, <span class="vec"><span class="sr-only">vecteur </span>v</span>) = 0, soit ' + fr(a) + ' × m − ' + pa(c) + ' × ' + pa(b) + ' = 0.',
            [`${fr(a)}m = ${fr(b * c)}, donc m = ${frac(b * c, a)}.`, `k = ${fr(c)} ÷ ${pa(a)} = ${frac(c, a)}.`],
            `m = ${frac(b * c, a)} et <span class="vec"><span class="sr-only">vecteur </span>v</span> = ${frac(c, a)} <span class="vec"><span class="sr-only">vecteur </span>u</span>.`),
          'Écris que le déterminant est nul.')
      }),
      T({ // Triangle isocèle ?
        base: {xa: 0, ya: 0, b1: 3, b2: 4, kind: 1},
        params: r => ({xa: r.int(-5, 5), ya: r.int(-5, 5), b1: r.nonZero(1, 6), b2: r.nonZero(1, 6), kind: r.int(0, 1)}),
        accept: ({b1, b2}) => Math.abs(b1) !== Math.abs(b2) && b1 !== -1,
        difficulty: () => score({steps: 3, values: [60]}),
        verify: ({b1, b2, kind}, v) => { const c = kind ? [b2, -b1] : [b2, b1 + 1]; return v[0] === b1 * b1 + b2 * b2 && v[1] === c[0] ** 2 + c[1] ** 2 && (v[2] === 'oui') === (v[0] === v[1]); },
        build: ({xa, ya, b1, b2, kind}) => { const c = kind ? [b2, -b1] : [b2, b1 + 1], B = [xa + b1, ya + b2], Cc = [xa + c[0], ya + c[1]], AB2 = b1 * b1 + b2 * b2, AC2 = c[0] ** 2 + c[1] ** 2;
          return item('Étudier la nature d’un triangle', `A${vec(xa, ya)}, B${vec(...B)} et C${vec(...Cc)}. Le triangle ABC est-il isocèle en A ?`,
            [Q('AB²', AB2), Q('AC²', AC2), S('ABC est-il isocèle en A ?', AB2 === AC2 ? 'oui' : 'non', ['oui', 'non'])],
            C('dans un repère orthonormé, AB² = (x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)².',
              [`AB² = ${pa(b1)}² + ${pa(b2)}² = ${AB2}.`, `AC² = ${pa(c[0])}² + ${pa(c[1])}² = ${AC2}.`],
              AB2 === AC2 ? 'AB = AC : ABC est isocèle en A.' : 'AB ≠ AC : ABC n’est pas isocèle en A.'),
            'Compare les carrés des distances, inutile de prendre les racines.'); }
      }),
      T({ // Projeté orthogonal sur la droite y = x
        base: {x: 5, y: 1},
        params: r => ({x: r.int(-9, 9), y: r.int(-9, 9)}),
        accept: ({x, y}) => x !== y && Math.abs(x - y) >= 2,
        difficulty: () => score({steps: 3, values: [9], decimals: true, negatives: true}),
        verify: ({x, y}, v) => close(v[0], (x + y) / 2) && close(v[1], (x + y) / 2) && close(v[2], Math.abs(x - y) / Math.SQRT2),
        build: ({x, y}) => { const h = (x + y) / 2, d = Math.abs(x - y) / Math.SQRT2;
          return item('Déterminer un projeté orthogonal', `Dans un repère orthonormé, Δ est la droite d’équation y = x et M${vec(x, y)}. On note H le projeté orthogonal de M sur Δ.`,
            [Q('Abscisse de H', h), Q('Ordonnée de H', h), Q('Distance MH', d)],
            C('H est sur Δ, donc H(t ; t), et <span class="vec"><span class="sr-only">vecteur </span>MH</span> est orthogonal au vecteur directeur (1 ; 1) de Δ : (' + tMinus('t', x) + ') + (' + tMinus('t', y) + ') = 0.',
              [`2t = ${fr(x + y)}, donc t = ${fr(h)}.`, `MH² = (${fmt.diff(h, x)})² + (${fmt.diff(h, y)})² = ${fr(2 * (h - x) ** 2)} ; MH ${eq(d)}.`],
              `H${vec(h, h)} et MH ${eq(d)}. H est le point de Δ le plus proche de M.`),
            'Le projeté orthogonal est le point de la droite le plus proche de M.'); }
      }),
      T({ // Parallélisme de deux droites
        base: {a: 1, b: 2, k: 2, on: 1, s: 1},
        params: r => ({a: r.nonZero(1, 6), b: r.nonZero(1, 6), k: r.nonZero(1, 3), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 3, values: [30], negatives: true}),
        verify: ({a, b, k, on, s}, v) => { const D = det(a, b, k * a, k * b + (on ? 0 : s)); return v[0] === D && (v[1] === 'oui') === (D === 0); },
        build: ({a, b, k, on, s}) => { const A = [0, 1], B = [a, 1 + b], Cc = [3, -2], Dd = [3 + k * a, -2 + k * b + (on ? 0 : s)], D = det(a, b, Dd[0] - 3, Dd[1] + 2);
          return item('Démontrer un parallélisme', `A${vec(...A)}, B${vec(...B)}, C${vec(...Cc)} et D${vec(...Dd)}. Les droites (AB) et (CD) sont-elles parallèles ?`,
            [Q('Déterminant des vecteurs AB et CD', D), S('(AB) et (CD) sont-elles parallèles ?', D === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('(AB) et (CD) sont parallèles si et seulement si <span class="vec"><span class="sr-only">vecteur </span>AB</span> et <span class="vec"><span class="sr-only">vecteur </span>CD</span> sont colinéaires.',
              [`<span class="vec"><span class="sr-only">vecteur </span>AB</span>${vec(a, b)} et <span class="vec"><span class="sr-only">vecteur </span>CD</span>${vec(Dd[0] - 3, Dd[1] + 2)} ; det = ${fr(a)} × ${pa(Dd[1] + 2)} ${M} ${pa(Dd[0] - 3)} × ${pa(b)} = ${fr(D)}.`],
              D === 0 ? 'les droites (AB) et (CD) sont parallèles.' : 'les droites (AB) et (CD) sont sécantes.'),
            'Utilise le déterminant des deux vecteurs directeurs.'); }
      })
    ],

    /* ---------- 07 · Droites du plan ---------- */
    '2-droites': [
      T({ // Équation réduite par deux points
        base: {m: 2, p: -1, x1: 1, x2: 4},
        params: r => ({m: r.nonZero(1, 5) / r.pick([1, 1, 2]), p: r.int(-8, 8), x1: r.int(-5, 3), x2: r.int(2, 8)}),
        accept: ({m, x1, x2}) => x1 < x2 && Number.isInteger(m * x1) && Number.isInteger(m * x2),
        difficulty: ({m, p}) => score({steps: 3, values: [m, p], negatives: true}),
        verify: ({m, p, x1, x2}, v) => close(v[0] * x1 + v[1], m * x1 + p) && close(v[0] * x2 + v[1], m * x2 + p),
        build: ({m, p, x1, x2}) => { const y1 = m * x1 + p, y2 = m * x2 + p;
          return item('Déterminer l’équation réduite d’une droite', `A${vec(x1, y1)} et B${vec(x2, y2)}. Détermine l’équation réduite y = mx + p de la droite (AB).`,
            [Q('Pente m', m), Q('Ordonnée à l’origine p', p)],
            C('m = (y<sub>B</sub> − y<sub>A</sub>) ÷ (x<sub>B</sub> − x<sub>A</sub>), puis p = y<sub>A</sub> − m x<sub>A</sub>.',
              [`m = (${fmt.diff(y2, y1)}) ÷ (${fmt.diff(x2, x1)}) = ${fr(y2 - y1)} ÷ ${fr(x2 - x1)} = ${fr(m)}.`, `p = ${fr(y1)} ${M} ${pa(m)} × ${pa(x1)} = ${fr(p)}.`],
              `(AB) : y = ${lin(m, p)}.`),
            'Vérifie avec le point B.'); }
      }),
      T({ // Point et vecteur directeur
        base: {x0: 2, y0: -1, u1: 3, u2: 6},
        params: r => ({x0: r.int(-6, 6), y0: r.int(-6, 6), u1: r.nonZero(1, 5), u2: r.nonZero(1, 9)}),
        accept: ({u1, u2}) => u2 % u1 === 0 || (2 * u2) % u1 === 0,
        difficulty: ({u1, u2}) => score({steps: 3, values: [u2 / u1, u1, u2], negatives: true}),
        verify: ({x0, y0, u1, u2}, v) => close(v[0], u2 / u1) && close(v[1], y0 - u2 / u1 * x0),
        build: ({x0, y0, u1, u2}) => { const m = u2 / u1, p = y0 - m * x0;
          return item('Utiliser un vecteur directeur', `La droite d passe par A${vec(x0, y0)} et a pour vecteur directeur <span class="vec"><span class="sr-only">vecteur </span>u</span>${vec(u1, u2)}.`,
            [Q('Pente de d', m), Q('Ordonnée à l’origine de d', p)],
            C('un vecteur directeur (a ; b) avec a ≠ 0 donne la pente m = b/a ; on trouve p avec le point A.',
              [`m = ${fr(u2)} ÷ ${pa(u1)} = ${fr(m)}.`, `p = ${fr(y0)} ${M} ${pa(m)} × ${pa(x0)} = ${fr(p)}.`],
              `d : y = ${lin(m, p)}.`),
            'Un vecteur directeur indique de combien on monte quand on avance.'); }
      }),
      T({ // Appartenance à une droite
        base: {a: 2, b: -3, c: 4, x: 1, on: 1, s: 1},
        params: r => ({a: r.nonZero(1, 6), b: r.nonZero(1, 6), c: r.int(-9, 9), x: r.int(-5, 5), on: r.int(0, 1), s: r.sign()}),
        accept: ({b, a, c, x}) => (a * x + c) % b === 0 && c !== 0,
        difficulty: () => score({steps: 2, values: [30], negatives: true}),
        verify: ({a, b, c, x, on, s}, v) => { const y = -(a * x + c) / b + (on ? 0 : s); return v[0] === a * x + b * y + c && (v[1] === 'oui') === (v[0] === 0); },
        build: ({a, b, c, x, on, s}) => { const y = -(a * x + c) / b + (on ? 0 : s), val = a * x + b * y + c;
          return item('Tester l’appartenance à une droite', `La droite d a pour équation cartésienne ${lin(a, 0).replace(/ $/, '')}${mono(b, 'y', false)}${sg(c)} = 0. Le point M${vec(x, y)} appartient-il à d ?`,
            [Q('Valeur de ax + by + c en M', val), S('M appartient-il à d ?', val === 0 ? 'oui' : 'non', ['oui', 'non'])],
            C('M appartient à d si et seulement si ses coordonnées vérifient l’équation.',
              [`${fr(a)} × ${pa(x)} + ${pa(b)} × ${pa(y)}${sg(c)} = ${fr(val)}.`],
              val === 0 ? 'M appartient à d.' : 'M n’appartient pas à d.'),
            'Remplace x et y par les coordonnées de M.'); }
      }),
      T({ // Parallèles ou sécantes
        base: {m: 2, p: 1, k: 2, on: 1, s: 1},
        params: r => ({m: r.nonZero(1, 5), p: r.int(-6, 6), k: r.nonZero(1, 3), on: r.int(0, 1), s: r.sign()}),
        difficulty: () => score({steps: 3, values: [20], negatives: true}),
        verify: ({m, k, on, s}, v) => { const a = k * m + (on ? 0 : s), m2 = a / k; return close(v[0], m2) && (v[1] === 'parallèles') === close(m2, m); },
        build: ({m, p, k, on, s}) => { const a = k * m + (on ? 0 : s), m2 = a / k, c = 3 * k;
          return item('Parallèles ou sécantes ?', `d₁ : y = ${lin(m, p)} et d₂ : ${mono(a)}${mono(-k, 'y', false)}${sg(c)} = 0. Les droites sont-elles parallèles ou sécantes ?`,
            [Q('Pente de d₂', m2), S('d₁ et d₂ sont', close(m2, m) ? 'parallèles' : 'sécantes', ['parallèles', 'sécantes'])],
            C('deux droites non verticales sont parallèles si et seulement si elles ont la même pente.',
              [`d₂ : ${k === 1 ? '' : fr(k)}y = ${lin(a, c)}, soit y = ${lin(m2, c / k)}.`],
              close(m2, m) ? `même pente ${fr(m)} : d₁ et d₂ sont parallèles.` : `pentes ${fr(m)} et ${fr(m2)} différentes : d₁ et d₂ sont sécantes.`),
            'Mets d₂ sous forme réduite.'); }
      }),
      T({ // Système en contexte
        base: {x: 2, y: 3, a: 2, b: 3, c: 1, d: 4},
        params: r => ({x: 10 * r.int(1, 30) / 10, y: r.int(1, 12), a: r.int(1, 6), b: r.int(1, 6), c: r.int(1, 6), d: r.int(1, 6)}),
        accept: ({a, b, c, d}) => det(a, b, c, d) !== 0,
        difficulty: ({x, y}) => score({steps: 3, values: [x, y, 50]}),
        verify: ({x, y, a, b, c, d}, v) => close(a * v[0] + b * v[1], a * x + b * y) && close(c * v[0] + d * v[1], c * x + d * y),
        build: ({x, y, a, b, c, d}) => { const e = a * x + b * y, f = c * x + d * y, D = det(a, b, c, d);
          return item('Résoudre un système', `${a} cahier${a > 1 ? 's' : ''} et ${b} stylo${b > 1 ? 's' : ''} coûtent ${fr(e)} € ; ${c} cahier${c > 1 ? 's' : ''} et ${d} stylo${d > 1 ? 's' : ''} coûtent ${fr(f)} €. On note x le prix d’un cahier et y celui d’un stylo.`,
            [Q('Prix d’un cahier x, en €', x), Q('Prix d’un stylo y, en €', y)],
            C('on résout le système par combinaison : on élimine une inconnue en multipliant les équations.',
              [`${mono(a)}${mono(b, 'y', false)} = ${fr(e)} et ${mono(c)}${mono(d, 'y', false)} = ${fr(f)} ; le déterminant ${fr(a)} × ${d} ${M} ${b} × ${c} = ${fr(D)} n’est pas nul : une seule solution.`,
               `${d} × (1) ${M} ${b} × (2) : ${mono(D)} = ${fr(d * e - b * f)}, donc x = ${fr(x)} ; puis y = ${fr(y)}.`],
              `un cahier coûte ${fr(x)} € et un stylo ${fr(y)} €.`),
            'Vérifie la solution dans les deux équations.'); }
      }),
      T({ // Intersection de deux droites cartésiennes
        base: {x: 1, y: 2, a: 1, b: 1, c: 2, d: -1},
        params: r => ({x: r.int(-6, 6), y: r.int(-6, 6), a: r.nonZero(1, 4), b: r.nonZero(1, 4), c: r.nonZero(1, 4), d: r.nonZero(1, 4)}),
        accept: ({a, b, c, d}) => det(a, b, c, d) !== 0,
        difficulty: () => score({steps: 3, values: [24], negatives: true}),
        verify: ({x, y, a, b, c, d}, v) => a * v[0] + b * v[1] === a * x + b * y && c * v[0] + d * v[1] === c * x + d * y,
        build: ({x, y, a, b, c, d}) => { const e = a * x + b * y, f = c * x + d * y;
          return item('Calculer un point d’intersection', `d₁ : ${mono(a)}${mono(b, 'y', false)} = ${fr(e)} et d₂ : ${mono(c)}${mono(d, 'y', false)} = ${fr(f)}. Détermine leur point d’intersection.`,
            [Q('Abscisse', x), Q('Ordonnée', y)],
            C('les coordonnées du point d’intersection vérifient les deux équations : on résout le système.',
              [`Le déterminant ${fr(a)} × ${pa(d)} ${M} ${pa(b)} × ${pa(c)} = ${fr(det(a, b, c, d))} n’est pas nul : les droites sont sécantes.`, `Par combinaison, x = ${fr(x)} et y = ${fr(y)}.`],
              `les droites se coupent en ${vec(x, y)}.`),
            'Vérifie en remplaçant dans les deux équations.'); }
      })
    ],

    /* ---------- 08 · Généralités sur les fonctions ---------- */
    '2-fonctions': [
      T({ // Ensemble de définition
        base: {a: 3, b: -2},
        params: r => ({a: r.nonZero(1, 12), b: r.nonZero(1, 12)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], negatives: true}),
        verify: ({a, b}, v) => v[0] === a && v[1] === b,
        build: ({a, b}) => item('Déterminer un ensemble de définition', `f(x) = 1/(x ${a > 0 ? M : '+'} ${Math.abs(a)}) et g(x) = √(x ${b > 0 ? M : '+'} ${Math.abs(b)}).`,
          [Q('Valeur interdite pour f', a), Q('Plus petite valeur où g est définie', b)],
          C('on ne divise pas par 0, et on ne prend la racine carrée que d’un nombre positif ou nul.',
            [`x ${a > 0 ? M : '+'} ${Math.abs(a)} = 0 pour x = ${fr(a)} : f est définie sur ℝ privé de ${fr(a)}.`, `x ${b > 0 ? M : '+'} ${Math.abs(b)} ≥ 0 pour x ≥ ${fr(b)} : g est définie sur [${fr(b)} ; +∞[.`],
            `la valeur interdite de f est ${fr(a)} ; g est définie à partir de ${fr(b)}.`),
          'Cherche ce qui rend le calcul impossible.')
      }),
      T({ // Point sur une courbe
        base: {a: 2, b: 1, c: 3, x: 2, on: 1, k: 1},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-6, 6), c: r.nonZero(1, 6), x: r.int(-5, 6), on: r.int(0, 1), k: r.nonZero(1, 3)}),
        accept: ({x, c}) => x + c !== 0 && x !== 0,
        difficulty: ({a, b, c, x}) => score({steps: 2, values: [(a * x + b) / (x + c)], fractions: true}),
        verify: ({a, b, c, x, on, k}, v) => { const y = (a * x + b) / (x + c); return close(v[0], y) && (v[1] === 'oui') === !!on; },
        build: ({a, b, c, x, on, k}) => { const y = (a * x + b) / (x + c), yp = on ? y : y + k;
          return item('Exploiter l’équation d’une courbe', `f(x) = (${lin(a, b)})/(x${sg(c)}). Le point M(${fr(x)} ; ${frac(Math.round(yp * (x + c)), x + c)}) est-il sur la courbe de f ?`,
            [Q(`f(${fr(x)})`, y), S('M est-il sur la courbe ?', on ? 'oui' : 'non', ['oui', 'non'])],
            C('M(x ; y) appartient à la courbe de f si et seulement si y = f(x).',
              [`f(${fr(x)}) = (${fr(a)} × ${pa(x)}${sg(b)}) ÷ (${fr(x)}${sg(c)}) = ${frac(a * x + b, x + c)}.`],
              on ? 'les coordonnées vérifient y = f(x) : M est sur la courbe.' : 'y ≠ f(x) : M n’est pas sur la courbe.'),
            'Compare l’ordonnée de M avec l’image de son abscisse.'); }
      }),
      T({ // Parité
        base: {kind: 0, a: 2, b: 3},
        params: r => ({kind: r.int(0, 2), a: r.nonZero(1, 5), b: r.nonZero(1, 6)}),
        difficulty: ({a, b}) => score({steps: 2, values: [8 * a + 2 * b], negatives: true}),
        verify: ({kind, a, b}, v) => { const f = x => [a * x * x + b, a * x ** 3 + b * x, a * x * x + b * x][kind]; return v[0] === f(2) && v[1] === f(-2) && v[2] === ['paire', 'impaire', 'ni paire ni impaire'][kind]; },
        build: ({kind, a, b}) => { const expr = [quad(a, 0, b), fmt.poly([a, 0, b, 0]), quad(a, b, 0)][kind], f = x => [a * x * x + b, a * x ** 3 + b * x, a * x * x + b * x][kind];
          return item('Étudier la parité d’une fonction', `f(x) = ${expr}, définie sur ℝ. Calcule f(2) et f(${M}2), puis indique si f est paire, impaire ou ni l’une ni l’autre.`,
            [Q('f(2)', f(2)), Q('f(−2)', f(-2)), S('f est', ['paire', 'impaire', 'ni paire ni impaire'][kind], ['paire', 'impaire', 'ni paire ni impaire'])],
            C('f est paire si f(−x) = f(x) pour tout x (courbe symétrique par rapport à l’axe des ordonnées) ; impaire si f(−x) = −f(x) (symétrie par rapport à l’origine).',
              [['f(−x) = ' + expr + ' = f(x).', 'f(−x) = −(' + expr + ') = −f(x).', `f(2) = ${fr(f(2))} et f(${M}2) = ${fr(f(-2))} : ni égaux, ni opposés.`][kind]],
              `f est ${['paire', 'impaire', 'ni paire ni impaire'][kind]}.`),
            'Remplace x par −x dans l’expression.'); }
      }),
      T({ // f(x) = k avec la fonction carré décalée
        base: {c: 4, k: 12},
        params: r => ({c: r.int(1, 20), k: r.int(-10, 60)}),
        accept: ({c, k}) => k + c > 0 && Number.isInteger(Math.sqrt(k + c)) && k + c > 1,
        difficulty: ({c, k}) => score({steps: 2, values: [c, k]}),
        verify: ({c, k}, v) => close(v[0] * v[0] - c, k) && close(v[1] * v[1] - c, k) && v[0] < v[1],
        build: ({c, k}) => { const s = Math.sqrt(k + c);
          return item('Résoudre f(x) = k', `f(x) = x² ${M} ${c}. Résous l’équation f(x) = ${fr(k)}.`,
            [Q('Plus petite solution', -s), Q('Plus grande solution', s)],
            C('on se ramène à x² = a, puis on utilise la fonction carré.',
              [`x² ${M} ${c} = ${fr(k)} donne x² = ${k + c}.`, `x = ${s} ou x = ${M}${s}.`],
              `S = {${M}${s} ; ${s}}.`),
            'Sur la courbe, ce sont les abscisses des points d’ordonnée ' + fr(k) + '.'); }
      }),
      T({ // f(x) < g(x) pour deux fonctions affines
        base: {a: 3, b: -1, c: 1, d: 5},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-9, 9), c: r.nonZero(1, 6), d: r.int(-9, 9)}),
        accept: ({a, c, b, d}) => a !== c && (d - b) % (a - c) === 0 && b !== d,
        difficulty: ({a, b, c, d}) => score({steps: 3, values: [a - c, d - b], negatives: true}),
        verify: ({a, b, c, d}, v) => v[0] === (d - b) / (a - c) && (v[1] === 'x < frontière') === (a - c > 0),
        build: ({a, b, c, d}) => { const s = (d - b) / (a - c), k = a - c;
          return item('Comparer deux fonctions', `f(x) = ${lin(a, b)} et g(x) = ${lin(c, d)}. Résous f(x) < g(x) : sur quel intervalle la courbe de f est-elle sous celle de g ?`,
            [Q('Abscisse du point d’intersection', s), S('La courbe de f est sous celle de g pour', k > 0 ? 'x < frontière' : 'x > frontière', ['x < frontière', 'x > frontière'])],
            C('f(x) < g(x) équivaut à (a − c)x < d − b.',
              [`${mono(k)} < ${fr(d - b)}.`, k > 0 ? `x < ${fr(s)}.` : `On divise par ${fr(k)} < 0 : x > ${fr(s)}.`],
              `f(x) < g(x) pour x ${k > 0 ? '<' : '>'} ${fr(s)}.`),
            'Regroupe les termes en x.'); }
      }),
      T({ // Modéliser une aire
        base: {P: 20, k: 3},
        params: r => ({P: 2 * r.int(5, 40), k: r.int(1, 15)}),
        accept: ({P, k}) => k < P / 2,
        difficulty: ({P, k}) => score({steps: 3, values: [k * (P / 2 - k)]}),
        verify: ({P, k}, v) => v[0] === P / 2 && v[1] === k * (P / 2 - k),
        build: ({P, k}) => { const h = P / 2;
          return item('Modéliser par une fonction', `Un rectangle a un périmètre de ${P} cm. On note x sa largeur, en cm, et A(x) son aire : A(x) = x(${h} ${M} x).`,
            [Q('Borne supérieure de l’ensemble de définition', h), Q(`A(${k}), en cm²`, k * (h - k))],
            C('la longueur vaut ' + h + ' − x, et doit être positive : x ∈ ]0 ; ' + h + '[.',
              [`A(${k}) = ${k} × (${h} ${M} ${k}) = ${k * (h - k)}.`],
              `A est définie sur ]0 ; ${h}[ et A(${k}) = ${k * (h - k)} cm².`),
            'Demi-périmètre = longueur + largeur.'); }
      })
    ],

    /* ---------- 09 · Fonctions de référence ---------- */
    '2-fonctions-reference': [
      T({ // Carré : inéquation
        base: {s: 3},
        params: r => ({s: r.int(2, 15)}),
        space: 14,
        difficulty: () => score({steps: 2, values: [10]}),
        verify: ({s}, v) => v[0] === -s && v[1] === s,
        build: ({s}) => item('Résoudre x² ≤ k', `Résous x² ≤ ${s * s}. Donne l’ensemble des solutions sous la forme [a ; b].`,
          [Q('a', -s), Q('b', s)],
          C('la fonction carré est décroissante sur ]−∞ ; 0] et croissante sur [0 ; +∞[ ; x² = ' + s * s + ' pour x = ±' + s + '.',
            [`Sur la courbe y = x², les points sous la droite y = ${s * s} ont une abscisse entre ${M}${s} et ${s}.`],
            `S = [${M}${s} ; ${s}].`),
          'Fais un croquis de la parabole.')
      }),
      T({ // Inverse
        base: {k: 4},
        params: r => ({k: r.pick([2, 4, 5, 8, 10, 20, 25, 0.5, 0.25, 0.2])}),
        space: 10,
        difficulty: () => score({steps: 2, values: [10], decimals: true}),
        verify: ({k}, v) => close(v[0], 1 / k) && close(v[1], 1 / k),
        build: ({k}) => item('Utiliser la fonction inverse', `Résous 1/x = ${fr(k)}, puis l’inéquation 1/x > ${fr(k)} sur ]0 ; +∞[, de solution ]0 ; b[.`,
          [Q('Solution de 1/x = ' + fr(k), 1 / k), Q('b', 1 / k)],
          C('la fonction inverse est décroissante sur ]0 ; +∞[ : 1/x > k équivaut à x < 1/k.',
            [`1/x = ${fr(k)} pour x = 1/${fr(k)} = ${fr(1 / k)}.`],
            `x = ${fr(1 / k)} et S = ]0 ; ${fr(1 / k)}[.`),
          'Décroissante : l’inégalité change de sens.')
      }),
      T({ // Racine carrée
        base: {k: 3, m: 5},
        params: r => ({k: r.int(2, 15), m: r.int(2, 12)}),
        accept: ({k, m}) => k !== m,
        difficulty: ({k, m}) => score({steps: 2, values: [k * k, m * m]}),
        verify: ({k, m}, v) => v[0] === k * k && v[1] === m * m,
        build: ({k, m}) => item('Utiliser la fonction racine carrée', `Résous √x = ${k}, puis √x ≤ ${m}, de solution [0 ; b].`,
          [Q('Solution de √x = ' + k, k * k), Q('b', m * m)],
          C('la fonction racine carrée est définie et croissante sur [0 ; +∞[.',
            [`√x = ${k} pour x = ${k}² = ${k * k}.`, `√x ≤ ${m} équivaut à 0 ≤ x ≤ ${m * m}.`],
            `x = ${k * k} et S = [0 ; ${m * m}].`),
          'Élève au carré : la fonction carré est croissante sur les positifs.')
      }),
      T({ // Cube
        base: {a: 3, b: -2},
        params: r => ({a: r.int(2, 10), b: r.int(-10, -2)}),
        difficulty: () => score({steps: 2, values: [100], negatives: true}),
        verify: ({a, b}, v) => v[0] ** 3 === a ** 3 && v[1] ** 3 === b ** 3,
        build: ({a, b}) => item('Utiliser la fonction cube', `Résous x³ = ${a ** 3}, puis x³ = ${fr(b ** 3)}.`,
          [Q(`Solution de x³ = ${a ** 3}`, a), Q(`Solution de x³ = ${fr(b ** 3)}`, b)],
          C('la fonction cube est strictement croissante sur ℝ : chaque équation x³ = k a une seule solution, de même signe que k.',
            [`${a}³ = ${a ** 3} et (${M}${Math.abs(b)})³ = ${fr(b ** 3)}.`],
            `x = ${a}, puis x = ${fr(b)}.`),
          'Un cube négatif vient d’un nombre négatif.')
      }),
      T({ // Valeur absolue
        base: {a: 2, r: 5},
        params: r => ({a: r.int(-12, 12), r: r.int(1, 12)}),
        accept: ({a}) => a !== 0,
        difficulty: ({a, r}) => score({steps: 2, values: [a, r, a + r], negatives: true}),
        verify: ({a, r}, v) => v[0] < v[1] && Math.abs(v[0] - a) === r && Math.abs(v[1] - a) === r,
        build: ({a, r}) => item('Résoudre |x − a| = r', `Résous |x ${a > 0 ? M : '+'} ${Math.abs(a)}| = ${r}.`,
          [Q('Plus petite solution', a - r), Q('Plus grande solution', a + r)],
          C('|x − a| = r signifie que x est à la distance r de a : x = a − r ou x = a + r.',
            [`a = ${fr(a)} : x = ${fr(a)} ${M} ${r} ou x = ${fr(a)} + ${r}.`],
            `S = {${fr(a - r)} ; ${fr(a + r)}}.`),
          'Pense à la distance sur la droite numérique.')
      }),
      T({ // Comparer des carrés
        base: {a: -3, b: 2, kind: 0},
        params: r => { const kind = r.int(0, 1); const a = r.int(2, 12), b = r.int(2, 12); return {a: kind ? a : -a, b: kind ? b : -b, kind}; },
        accept: ({a, b}) => a !== b,
        difficulty: () => score({steps: 2, values: [100], negatives: true}),
        verify: ({a, b}, v) => v[0] === a * a && v[1] === b * b && v[2] === (a * a > b * b ? `${fr(a)}²` : `${fr(b)}²`),
        build: ({a, b}) => { const pos = a > 0;
          return item('Comparer des carrés', `Sans calculatrice, compare ${pa(a)}² et ${pa(b)}², puis vérifie par le calcul.`,
            [Q(`${fr(a)}²`, a * a), Q(`${fr(b)}²`, b * b), S('Le plus grand est', a * a > b * b ? `${fr(a)}²` : `${fr(b)}²`, [`${fr(a)}²`, `${fr(b)}²`])],
            C(pos ? 'la fonction carré est croissante sur [0 ; +∞[ : elle conserve l’ordre des positifs.' : 'la fonction carré est décroissante sur ]−∞ ; 0] : elle inverse l’ordre des négatifs.',
              [`${fr(Math.min(a, b))} < ${fr(Math.max(a, b))}, donc ${pos ? fr(Math.min(a, b)) + '² < ' + fr(Math.max(a, b)) + '²' : pa(Math.min(a, b)) + '² > ' + pa(Math.max(a, b)) + '²'}.`],
              `le plus grand est ${a * a > b * b ? pa(a) : pa(b)}² = ${Math.max(a * a, b * b)}.`),
            'Regarde le signe des deux nombres.'); }
      })
    ],

    /* ---------- 10 · Variations et extremums ---------- */
    '2-variations': [
      T({ // Extremum d'une fonction du second degré
        base: {a: 1, al: 2, be: -3},
        params: r => ({a: r.nonZero(1, 3), al: r.int(-5, 5), be: r.int(-9, 9)}),
        accept: ({al, be}) => al !== 0 && be !== 0,
        difficulty: ({a, al, be}) => score({steps: 3, values: [a, al, be], negatives: true}),
        verify: ({a, al, be}, v) => v[0] === al && v[1] === be && (v[2] === 'minimum') === (a > 0),
        build: ({a, al, be}) => { const b = -2 * a * al, c = a * al * al + be;
          return item('Déterminer un extremum', `f(x) = ${a === 1 ? '' : a === -1 ? M : fr(a)}(x${sg(-al)})²${sg(be)}, soit f(x) = ${quad(a, b, c)}.`,
            [Q('Abscisse de l’extremum', al), Q('Valeur de l’extremum', be), S('Il s’agit d’un', a > 0 ? 'minimum' : 'maximum', ['minimum', 'maximum'])],
            C('un carré est toujours positif ou nul : (x − ' + pa(al) + ')² ≥ 0, avec égalité pour x = ' + fr(al) + '.',
              [a > 0 ? `f(x) ≥ ${fr(be)} pour tout x, et f(${fr(al)}) = ${fr(be)}.` : `f(x) ≤ ${fr(be)} pour tout x, car a = ${fr(a)} < 0, et f(${fr(al)}) = ${fr(be)}.`],
              `f admet un ${a > 0 ? 'minimum' : 'maximum'} égal à ${fr(be)}, atteint en x = ${fr(al)}.`),
            'Utilise la forme avec le carré.'); }
      }),
      T({ // Taux d'accroissement
        base: {x1: 1, y1: 4, x2: 5, m: -2},
        params: r => ({x1: r.int(-6, 4), y1: r.int(-12, 12), x2: r.int(1, 10), m: r.nonZero(1, 4)}),
        accept: ({x1, x2}) => x2 > x1,
        difficulty: ({m}) => score({steps: 2, values: [m, 20], negatives: true}),
        verify: ({x1, y1, x2, m}, v) => close(v[0], m) && (v[1] === 'croissante') === (m > 0),
        build: ({x1, y1, x2, m}) => { const y2 = y1 + m * (x2 - x1);
          return item('Interpréter un taux d’accroissement', `f est affine, f(${fr(x1)}) = ${fr(y1)} et f(${fr(x2)}) = ${fr(y2)}.`,
            [Q('Coefficient directeur m', m), S('f est', m > 0 ? 'croissante' : 'décroissante', ['croissante', 'décroissante'])],
            C('m est le taux d’accroissement : (f(x₂) − f(x₁)) ÷ (x₂ − x₁) ; son signe donne le sens de variation.',
              [`m = (${fmt.diff(y2, y1)}) ÷ (${fmt.diff(x2, x1)}) = ${fr(y2 - y1)} ÷ ${x2 - x1} = ${fr(m)}.`],
              `m = ${fr(m)} : f est ${m > 0 ? 'croissante' : 'décroissante'}.`),
            'Quand x augmente de 1, f(x) varie de m.'); }
      }),
      T({ // Optimisation d'aire
        base: {P: 36},
        params: r => ({P: 4 * r.int(3, 50)}),
        space: 48,
        difficulty: ({P}) => score({steps: 3, values: [P]}),
        verify: ({P}, v) => v[0] === P / 4 && v[1] === P * P / 16,
        build: ({P}) => { const h = P / 2, s = P / 4;
          return item('Résoudre un problème d’optimisation', `Parmi les rectangles de périmètre ${P} cm, on cherche celui d’aire maximale. Avec une largeur x : A(x) = x(${h} ${M} x) = ${fr(s * s)} ${M} (x ${M} ${s})².`,
            [Q('Largeur optimale, en cm', s), Q('Aire maximale, en cm²', s * s)],
            C('A(x) = ' + fr(s * s) + ' − (x − ' + s + ')² est maximale quand le carré est nul.',
              [`x = ${s}, la longueur vaut ${h} ${M} ${s} = ${s} : c’est un carré.`],
              `l’aire maximale est ${s * s} cm², pour un carré de ${s} cm de côté.`),
            'Développe la forme proposée pour vérifier qu’elle est égale à x(' + h + ' − x).'); }
      }),
      T({ // Comparer des images par monotonie
        base: {kind: 0, a: 3, b: 7},
        params: r => ({kind: r.int(0, 1), a: r.int(1, 20) / 2, b: r.int(1, 20) / 2}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b], decimals: true}),
        verify: ({kind, a, b}, v) => { const f = x => (kind ? 1 / x : Math.sqrt(x)); return (v[0] === 'f(a)') === (f(a) > f(b)); },
        build: ({kind, a, b}) => { const f = x => (kind ? 1 / x : Math.sqrt(x)), name = kind ? 'inverse' : 'racine carrée', big = f(a) > f(b) ? 'f(a)' : 'f(b)';
          return item('Comparer des images', `f est la fonction ${name}. Sans calculer, compare f(a) et f(b) pour a = ${fr(a)} et b = ${fr(b)}, puis vérifie.`,
            [S('La plus grande image est', big, ['f(a)', 'f(b)']), Q('f(a)', f(a), 3), Q('f(b)', f(b), 3)],
            C(kind ? 'la fonction inverse est décroissante sur ]0 ; +∞[ : elle inverse l’ordre.' : 'la fonction racine carrée est croissante sur [0 ; +∞[ : elle conserve l’ordre.',
              [`${fr(Math.min(a, b))} < ${fr(Math.max(a, b))}.`],
              `${big} est la plus grande.`),
            'Utilise le sens de variation, pas un calcul.'); }
      }),
      T({ // Extremums d'une fonction affine sur un intervalle
        base: {m: -2, p: 5, a: -1, b: 4},
        params: r => ({m: r.nonZero(1, 5), p: r.int(-9, 9), a: r.int(-6, 2), b: r.int(3, 9)}),
        difficulty: ({m, p, a, b}) => score({steps: 2, values: [m * a + p, m * b + p], negatives: true}),
        verify: ({m, p, a, b}, v) => v[0] === Math.max(m * a + p, m * b + p) && v[1] === Math.min(m * a + p, m * b + p),
        build: ({m, p, a, b}) => { const fa = m * a + p, fb = m * b + p;
          return item('Trouver les extremums sur un intervalle', `f(x) = ${lin(m, p)} sur l’intervalle [${fr(a)} ; ${fr(b)}].`,
            [Q('Maximum de f', Math.max(fa, fb)), Q('Minimum de f', Math.min(fa, fb))],
            C('une fonction affine est monotone : ses extremums sur un intervalle fermé sont atteints aux bornes.',
              [`f est ${m > 0 ? 'croissante' : 'décroissante'} (m = ${fr(m)}).`, `f(${fr(a)}) = ${fr(fa)} et f(${fr(b)}) = ${fr(fb)}.`],
              `maximum ${fr(Math.max(fa, fb))}, minimum ${fr(Math.min(fa, fb))}.`),
            'Calcule les images des deux bornes.'); }
      }),
      T({ // Lecture d'un tableau de variations
        base: {x0: -3, x1: 1, x2: 5, y0: 2, y1: 7, y2: -1},
        params: r => { const x0 = r.int(-8, -2), x1 = r.int(-1, 3), x2 = r.int(4, 10); const y1 = r.int(2, 12); return {x0, x1, x2, y0: y1 - r.int(1, 8), y1, y2: y1 - r.int(1, 15)}; },
        accept: ({y0, y2}) => y0 !== y2,
        difficulty: ({y1, y2}) => score({steps: 2, values: [y1, y2], negatives: true}),
        verify: ({x1, y0, y1, y2}, v) => v[0] === y1 && v[1] === x1 && v[2] === Math.min(y0, y2),
        build: ({x0, x1, x2, y0, y1, y2}) => item('Lire un tableau de variations', `Sur [${fr(x0)} ; ${fr(x2)}], f est croissante de f(${fr(x0)}) = ${fr(y0)} à f(${fr(x1)}) = ${fr(y1)}, puis décroissante jusqu’à f(${fr(x2)}) = ${fr(y2)}.`,
          [Q('Maximum de f', y1), Q('Abscisse du maximum', x1), Q('Minimum de f', Math.min(y0, y2))],
          C('le maximum est au changement de sens de variation ; le minimum est atteint à l’une des bornes.',
            [`Max : f(${fr(x1)}) = ${fr(y1)}. Min : le plus petit de ${fr(y0)} et ${fr(y2)}.`],
            `max ${fr(y1)} en ${fr(x1)} ; min ${fr(Math.min(y0, y2))}.`),
          'Compare les valeurs aux deux bornes.')
      })
    ],

    /* ---------- 11 · Signe d'une expression ---------- */
    '2-signes': [
      T({ // Signe d'une fonction affine
        base: {a: -2, b: 6},
        params: r => ({a: r.nonZero(1, 8), b: r.nonZero(1, 20)}),
        accept: ({a, b}) => b % a === 0,
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, b / a], negatives: true}),
        verify: ({a, b}, v) => v[0] === -b / a && v[1] === (a > 0 ? 'positif' : 'négatif'),
        build: ({a, b}) => { const x0 = -b / a;
          return item('Étudier le signe d’une fonction affine', `f(x) = ${lin(a, b)}. Détermine la valeur qui annule f, et le signe de f(x) pour x > ${fr(x0)}.`,
            [Q('Valeur qui annule f', x0), S(`Signe de f(x) pour x > ${fr(x0)}`, a > 0 ? 'positif' : 'négatif', ['positif', 'négatif'])],
            C('une fonction affine s’annule en −b/a et prend, après cette valeur, le signe de a.',
              [`${lin(a, b)} = 0 pour x = ${fr(x0)}.`, `a = ${fr(a)} est ${signWord(a)}.`],
              `f(x) est ${a > 0 ? 'positif' : 'négatif'} pour x > ${fr(x0)}.`),
            'Le signe de a donne le signe à droite de la racine.'); }
      }),
      T({ // Signe d'un produit entre les racines
        base: {r1: -2, r2: 3, a: 1},
        params: r => ({r1: r.int(-9, 4), r2: r.int(-4, 9), a: r.sign()}),
        accept: ({r1, r2}) => r1 < r2,
        difficulty: ({r1, r2}) => score({steps: 3, values: [r1, r2], negatives: true}),
        verify: ({r1, r2, a}, v) => v[0] === r1 && v[1] === r2 && v[2] === (a > 0 ? 'négatif' : 'positif'),
        build: ({r1, r2, a}) => { const f1 = fmt.fact(r1), f2 = fmt.fact(r2), expr = (a < 0 ? M : '') + f1 + f2, mid = a > 0 ? 'négatif' : 'positif';
          return item('Dresser un tableau de signes', `Étudie le signe de P(x) = ${expr}.`,
            [Q('Plus petite racine', r1), Q('Plus grande racine', r2), S('Signe de P(x) entre les racines', mid, ['positif', 'négatif'])],
            C('on étudie le signe de chaque facteur, puis on applique la règle des signes.',
              [`Les facteurs s’annulent en ${fr(r1)} et ${fr(r2)}.`, `Entre les deux, ${fmt.bare(r1)} > 0 et ${fmt.bare(r2)} < 0${a < 0 ? ', et le signe moins inverse le tout' : ''}.`],
              `P(x) est ${mid} sur ]${fr(r1)} ; ${fr(r2)}[.`),
            'Teste une valeur entre les deux racines.'); }
      }),
      T({ // Inéquation produit
        base: {r1: -1, r2: 4, pos: 1},
        params: r => ({r1: r.int(-9, 5), r2: r.int(-4, 10), pos: r.int(0, 1)}),
        accept: ({r1, r2}) => r1 < r2,
        difficulty: ({r1, r2}) => score({steps: 3, values: [r1, r2], negatives: true}),
        verify: ({r1, r2, pos}, v) => v[0] === r1 && v[1] === r2 && v[2] === (pos ? 'à l’extérieur des racines' : 'entre les racines'),
        build: ({r1, r2, pos}) => item('Résoudre une inéquation produit', `Résous ${fmt.fact(r1)}${fmt.fact(r2)} ${pos ? '≥' : '≤'} 0.`,
          [Q('Plus petite racine', r1), Q('Plus grande racine', r2), S('Les solutions sont', pos ? 'à l’extérieur des racines' : 'entre les racines', ['entre les racines', 'à l’extérieur des racines'])],
          C('le produit est positif quand les deux facteurs ont le même signe, négatif sinon.',
            [`Pour x < ${fr(r1)}, les deux facteurs sont négatifs ; entre ${fr(r1)} et ${fr(r2)}, ils sont de signes contraires ; pour x > ${fr(r2)}, ils sont positifs.`],
            pos ? `S = ]−∞ ; ${fr(r1)}] ∪ [${fr(r2)} ; +∞[.` : `S = [${fr(r1)} ; ${fr(r2)}].`),
          'Les racines sont incluses : l’inégalité est large.')
      }),
      T({ // Quotient
        base: {a: 2, b: -5, pos: 1},
        params: r => ({a: r.int(-9, 9), b: r.int(-9, 9), pos: r.int(0, 1)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 3, values: [a, b], negatives: true}),
        verify: ({a, b, pos}, v) => v[0] === b && v[1] === a && v[2] === (pos ? 'à l’extérieur' : 'entre les deux valeurs'),
        build: ({a, b, pos}) => { const lo = Math.min(a, b), hi = Math.max(a, b);
          return item('Étudier le signe d’un quotient', `Résous (${fmt.bare(a)}) / ${fmt.fact(b)} ${pos ? '>' : '<'} 0.`,
            [Q('Valeur interdite', b), Q('Valeur qui annule le numérateur', a), S('Les solutions sont', pos ? 'à l’extérieur' : 'entre les deux valeurs', ['entre les deux valeurs', 'à l’extérieur'])],
            C('un quotient a le signe du produit de ses termes ; la valeur interdite est exclue.',
              [`Le quotient est positif quand numérateur et dénominateur ont le même signe (x < ${fr(lo)} ou x > ${fr(hi)}), négatif entre ${fr(lo)} et ${fr(hi)}.`],
              pos ? `S = ]−∞ ; ${fr(lo)}[ ∪ ]${fr(hi)} ; +∞[.` : `S = ]${fr(lo)} ; ${fr(hi)}[.`),
            'La valeur interdite n’est jamais solution.'); }
      }),
      T({ // Signe de x² − k
        base: {s: 3, t: 5},
        params: r => ({s: r.int(2, 15), t: r.int(-20, 20)}),
        accept: ({s, t}) => Math.abs(t) !== s,
        difficulty: () => score({steps: 2, values: [10]}),
        verify: ({s, t}, v) => v[0] === -s && v[1] === s && v[2] === (t * t > s * s ? 'positif' : 'négatif'),
        build: ({s, t}) => item('Factoriser pour étudier un signe', `Étudie le signe de x² ${M} ${s * s} en factorisant, puis donne son signe en x = ${fr(t)}.`,
          [Q('Plus petite racine', -s), Q('Plus grande racine', s), S(`Signe en x = ${fr(t)}`, t * t > s * s ? 'positif' : 'négatif', ['positif', 'négatif'])],
          C('x² − ' + s * s + ' = (x − ' + s + ')(x + ' + s + ') ; on fait un tableau de signes.',
            [`${fr(t)} est ${Math.abs(t) < s ? 'entre' : 'à l’extérieur de'} ${M}${s} et ${s}.`],
            `x² ${M} ${s * s} est négatif sur ]${M}${s} ; ${s}[ et positif ailleurs.`),
          'Reconnais une différence de deux carrés.')
      }),
      T({ // Bénéfice positif
        base: {a: 20, b: 80},
        params: r => ({a: r.int(5, 60), b: r.int(40, 200)}),
        accept: ({a, b}) => b > a + 10,
        difficulty: ({a, b}) => score({steps: 3, values: [a, b]}),
        verify: ({a, b}, v) => v[0] === a && v[1] === b,
        build: ({a, b}) => item('Interpréter un signe en contexte', `Le bénéfice, en euros, pour x objets vendus est B(x) = (x ${M} ${a})(${b} ${M} x). Pour quels x l’entreprise est-elle bénéficiaire (B(x) > 0) ?`,
          [Q('Borne inférieure', a), Q('Borne supérieure', b)],
          C('les deux facteurs sont positifs ensemble entre ' + a + ' et ' + b + '.',
            [`x ${M} ${a} > 0 pour x > ${a} ; ${b} ${M} x > 0 pour x < ${b}.`],
            `B(x) > 0 pour x ∈ ]${a} ; ${b}[.`),
          'Le second facteur est décroissant.')
      })
    ],

    /* ---------- 12 · Proportions et évolutions ---------- */
    '2-evolutions': [
      T({ // Taux d'évolution
        base: {v1: 80, v2: 92},
        params: r => ({v1: 10 * r.int(2, 50), v2: 10 * r.int(2, 60)}),
        accept: ({v1, v2}) => v1 !== v2 && Math.abs(v2 - v1) / v1 < 1,
        difficulty: ({v1, v2}) => score({steps: 2, values: [v1, v2], decimals: true}),
        verify: ({v1, v2}, v) => close(v[0], v2 / v1) && close(v[1], 100 * (v2 - v1) / v1),
        build: ({v1, v2}) => item('Calculer un taux d’évolution', `Une valeur passe de ${v1} à ${v2}.`,
          [Q('Coefficient multiplicateur', v2 / v1, 4), Q('Taux d’évolution, en %', 100 * (v2 - v1) / v1)],
          C('coefficient = V₂/V₁ et taux = (V₂ − V₁)/V₁ = coefficient − 1.',
            [`${v2} ÷ ${v1} ${eq(v2 / v1, 4)}.`, `(${v2} ${M} ${v1}) ÷ ${v1} × 100 ${eq(100 * (v2 - v1) / v1)} %.`],
            `le taux est d’environ ${fr(r2(100 * (v2 - v1) / v1))} %.`),
          'Divise par la valeur de départ.')
      }),
      T({ // Évolutions successives
        base: {t1: 20, t2: 10},
        params: r => ({t1: r.pick([5, 10, 12, 15, 20, 25, 30, 40, 50]), t2: r.pick([5, 10, 15, 20, 25, 30, 40]), s: r.int(0, 1)}),
        difficulty: ({t1, t2}) => score({steps: 3, values: [t1, t2], decimals: true}),
        verify: ({t1, t2, s}, v) => { const k = (1 + t1 / 100) * (1 + (s ? 1 : -1) * t2 / 100); return close(v[0], k) && close(v[1], 100 * (k - 1)); },
        build: ({t1, t2, s}) => { const k1 = 1 + t1 / 100, k2 = 1 + (s ? 1 : -1) * t2 / 100, k = k1 * k2;
          return item('Enchaîner deux évolutions', `Un prix augmente de ${t1} %, puis ${s ? 'augmente' : 'baisse'} de ${t2} %.`,
            [Q('Coefficient global', k, 4), Q('Taux global, en %', 100 * (k - 1))],
            C('les coefficients multiplicateurs se multiplient ; les taux ne s’additionnent pas.',
              [`${fr(k1)} × ${fr(k2)} = ${fr(r2(k, 4))}.`],
              `l’évolution globale est de ${fr(r2(100 * (k - 1)))} %.`),
            'Calcule chaque coefficient, puis multiplie.'); }
      }),
      T({ // Évolution réciproque
        base: {t: 25, up: 1},
        params: r => ({t: r.pick([5, 10, 20, 25, 30, 40, 50, 60, 75, 80]), up: r.int(0, 1)}),
        space: 20,
        difficulty: () => score({steps: 2, values: [50], decimals: true}),
        verify: ({t, up}, v) => { const k = 1 + (up ? 1 : -1) * t / 100; return close(v[0], 1 / k) && close(v[1], 100 * (1 / k - 1)); },
        build: ({t, up}) => { const k = 1 + (up ? 1 : -1) * t / 100;
          return item('Calculer une évolution réciproque', `Après une ${up ? 'hausse' : 'baisse'} de ${t} %, quelle évolution ramène à la valeur de départ ?`,
            [Q('Coefficient réciproque', 1 / k, 4), Q('Taux réciproque, en %', 100 * (1 / k - 1))],
            C('le coefficient réciproque est l’inverse du coefficient.',
              [`1 ÷ ${fr(k)} ${eq(1 / k, 4)}.`],
              `il faut une évolution d’environ ${fr(r2(100 * (1 / k - 1)))} %, et non de ${up ? M : '+'}${t} %.`),
            'Une hausse de ' + t + ' % ne se compense pas par une baisse de ' + t + ' %.'); }
      }),
      T({ // Pourcentage de pourcentage
        base: {N: 1200, p: 40, q: 25},
        params: r => ({N: 100 * r.int(5, 60), p: r.pick([20, 25, 30, 40, 45, 50, 60, 75]), q: r.pick([10, 15, 20, 25, 30, 40, 50])}),
        difficulty: ({N, p, q}) => score({steps: 3, values: [N, N * p * q / 10000]}),
        verify: ({N, p, q}, v) => close(v[0], p * q / 100) && close(v[1], N * p * q / 10000),
        build: ({N, p, q}) => item('Calculer un pourcentage de pourcentage', `Dans un lycée de ${N} élèves, ${p} % sont en Seconde, et ${q} % des élèves de Seconde font de l’escalade.`,
          [Q('Part des grimpeurs de Seconde dans le lycée, en %', p * q / 100), Q('Nombre de grimpeurs de Seconde', N * p * q / 10000)],
          C('prendre q % de p % revient à multiplier les proportions : p/100 × q/100.',
            [`${p}/100 × ${q}/100 = ${fr(p * q / 10000)}, soit ${fr(p * q / 100)} %.`, `${N} × ${fr(p * q / 10000)} = ${fr(N * p * q / 10000)}.`],
            `${fr(p * q / 100)} % du lycée, soit ${fr(N * p * q / 10000)} élèves.`),
          'Les ensembles sont emboîtés : la seconde proportion porte sur les élèves de Seconde.')
      }),
      T({ // Variation absolue et relative
        base: {v1: 250, v2: 200},
        params: r => ({v1: 5 * r.int(10, 200), v2: 5 * r.int(10, 200)}),
        accept: ({v1, v2}) => v1 !== v2 && Math.abs(v2 - v1) / v1 <= 0.9,
        difficulty: ({v1, v2}) => score({steps: 2, values: [v1, v2], decimals: true}),
        verify: ({v1, v2}, v) => v[0] === v2 - v1 && close(v[1], 100 * (v2 - v1) / v1),
        build: ({v1, v2}) => item('Distinguer variation absolue et relative', `Le nombre d’abonnés passe de ${v1} à ${v2}.`,
          [Q('Variation absolue', v2 - v1), Q('Variation relative, en %', 100 * (v2 - v1) / v1)],
          C('variation absolue : V₂ − V₁ (dans l’unité de la grandeur) ; variation relative : (V₂ − V₁)/V₁ (sans unité).',
            [`${v2} ${M} ${v1} = ${fr(v2 - v1)}.`, `${fr(v2 - v1)} ÷ ${v1} × 100 ${eq(100 * (v2 - v1) / v1)} %.`],
            `variation absolue ${fr(v2 - v1)}, relative environ ${fr(r2(100 * (v2 - v1) / v1))} %.`),
          'La variation relative se calcule par rapport à la valeur de départ.')
      }),
      T({ // Partie et tout
        base: {p: 35, k: 4},
        params: r => ({p: r.pick([5, 8, 12, 15, 20, 24, 25, 30, 35, 40, 45, 60, 75]), k: r.int(2, 60)}),
        difficulty: ({p, k}) => score({steps: 2, values: [p, k * 100]}),
        verify: ({p, k}, v) => close(v[0], k * 100) && close(v[1], k * (100 - p)),
        build: ({p, k}) => { const total = k * 100, part = k * p;
          return item('Retrouver le tout à partir d’une partie', `${part} personnes, soit ${p} % des inscrits, ont participé à une course.`,
            [Q('Nombre d’inscrits', total), Q('Inscrits n’ayant pas couru', total - part)],
            C('partie = proportion × tout, donc tout = partie ÷ proportion.',
              [`${part} ÷ ${fr(p / 100)} = ${total}.`],
              `${total} inscrits, dont ${total - part} n’ont pas couru.`),
            'Divise par ' + fr(p / 100) + ', ne multiplie pas.'); }
      })
    ],

    /* ---------- 13 · Statistiques ---------- */
    '2-statistiques': [
      T({ // Moyenne et écart type
        base: {v: [8, 10, 12, 14], e: [2, 5, 4, 1]},
        params: r => { const s = r.int(4, 10), step = r.int(1, 4); return {v: [0, 1, 2, 3].map(i => s + i * step), e: [0, 1, 2, 3].map(() => r.int(1, 8))}; },
        difficulty: ({v, e}) => score({steps: 3, values: [sum(e), v[3]], decimals: true}),
        verify: ({v, e}, w) => close(w[0], sum(v.map((x, i) => x * e[i])) / sum(e)) && close(w[1], std(v, e)),
        build: ({v, e}) => { const n = sum(e), m = sum(v.map((x, i) => x * e[i])) / n, s = std(v, e);
          return item('Calculer une moyenne et un écart type', 'Durées de trajet, en minutes, d’un groupe d’élèves.' + table('Durées de trajet', v, [{label: 'Effectif', cells: e}], 'Durée'),
            [Q('Moyenne', m), Q('Écart type', s)],
            C('moyenne = Σ nᵢxᵢ / N ; écart type = √(Σ nᵢ(xᵢ − x̄)² / N), à calculer de préférence avec la calculatrice ou Python.',
              [`N = ${n} ; moyenne ${eq(m)}.`, `Écart type ${eq(s)}.`],
              `moyenne environ ${fr(r2(m))} min, écart type environ ${fr(r2(s))} min.`),
            'L’écart type mesure la dispersion autour de la moyenne.'); }
      }),
      T({ // Linéarité de la moyenne
        base: {m: 12, s: 3, a: 2, b: 5},
        params: r => ({m: r.int(5, 40), s: r.int(1, 8), a: r.pick([-2, 0.5, 1.5, 2, 3, 4]), b: r.int(-10, 20)}),
        accept: ({b}) => b !== 0,
        difficulty: ({m, a, b}) => score({steps: 2, values: [a * m + b], decimals: true}),
        verify: ({m, s, a, b}, v) => close(v[0], a * m + b) && close(v[1], Math.abs(a) * s),
        build: ({m, s, a, b}) => item('Utiliser la linéarité de la moyenne', `Une série a pour moyenne ${m} et pour écart type ${s}. On transforme chaque valeur x en ${fr(a)}x${sg(b)}.`,
          [Q('Nouvelle moyenne', a * m + b), Q('Nouvel écart type', Math.abs(a) * s)],
          C('la moyenne subit la même transformation ; l’écart type est multiplié par |a| et n’est pas modifié par l’ajout de b.',
            [`${fr(a)} × ${m}${sg(b)} = ${fr(a * m + b)} ; |${fr(a)}| × ${s} = ${fr(Math.abs(a) * s)}.`],
            `moyenne ${fr(a * m + b)}, écart type ${fr(Math.abs(a) * s)}.`),
          'Ajouter une constante décale les valeurs sans changer leur dispersion.')
      }),
      T({ // Série regroupée en classes
        base: {e: [4, 9, 12, 5]},
        params: r => ({e: [0, 1, 2, 3].map(() => r.int(2, 20))}),
        difficulty: ({e}) => score({steps: 3, values: [sum(e)], decimals: true}),
        verify: ({e}, w) => { const n = sum(e); let c = 0, k = 0; while (c + e[k] < n / 2) { c += e[k]; k++; } return close(w[0], sum(e.map((x, i) => x * (5 + 10 * i))) / n) && w[1] === 10 * k; },
        build: ({e}) => { const n = sum(e), m = sum(e.map((x, i) => x * (5 + 10 * i))) / n; let c = 0, k = 0; while (c + e[k] < n / 2) { c += e[k]; k++; }
          return item('Exploiter une série regroupée en classes', 'Temps passé sur un exercice, en minutes.' + table('Répartition en classes', ['[0 ; 10[', '[10 ; 20[', '[20 ; 30[', '[30 ; 40['], [{label: 'Effectif', cells: e}], 'Durée'),
            [Q('Moyenne (avec les centres des classes)', m), Q('Borne inférieure de la classe médiane', 10 * k)],
            C('on remplace chaque classe par son centre (5, 15, 25, 35) ; la classe médiane contient la valeur de rang N/2 dans les effectifs cumulés.',
              [`Moyenne : (5 × ${e[0]} + 15 × ${e[1]} + 25 × ${e[2]} + 35 × ${e[3]}) ÷ ${n} ${eq(m)}.`, `N/2 = ${fr(n / 2)} ; effectifs cumulés : ${e.map((_, i) => sum(e.slice(0, i + 1))).join(', ')}.`],
              `moyenne environ ${fr(r2(m))} min ; classe médiane [${10 * k} ; ${10 * k + 10}[.`),
            'Calcule les effectifs cumulés croissants.'); }
      }),
      T({ // Quartiles
        base: {v: [3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 20, 22]},
        params: r => ({v: Array.from({length: r.pick([10, 11, 12, 13])}, () => r.int(1, 40))}),
        accept: ({v}) => new Set(v).size === v.length,
        difficulty: ({v}) => score({steps: 3, values: [Math.max(...v)]}),
        verify: ({v}, w) => { const [a, b] = quartiles(v); return w[0] === a && w[1] === b && w[2] === b - a; },
        build: ({v}) => { const s = [...v].sort((a, b) => a - b), n = s.length, [q1, q3] = quartiles(v);
          return item('Déterminer des quartiles', `Série de ${n} valeurs : ${v.join(' ; ')}.`,
            [Q('Premier quartile Q₁', q1), Q('Troisième quartile Q₃', q3), Q('Écart interquartile', q3 - q1)],
            C('Q₁ est la plus petite valeur telle qu’au moins 25 % des valeurs lui soient inférieures ou égales ; Q₃ de même avec 75 %.',
              [`Série rangée : ${s.join(' ; ')}.`, `${n} × 0,25 = ${fr(n / 4)} : Q₁ est la ${Math.ceil(n / 4)}e valeur ; ${n} × 0,75 = ${fr(3 * n / 4)} : Q₃ est la ${Math.ceil(3 * n / 4)}e.`],
              `Q₁ = ${q1}, Q₃ = ${q3}, écart interquartile ${q3 - q1}.`),
            'Range la série avant de compter les rangs.'); }
      }),
      T({ // Ajout d'une valeur
        base: {n: 9, m: 12, x: 22},
        params: r => ({n: r.int(4, 25), m: r.int(8, 18), x: r.int(1, 20)}),
        accept: ({m, x}) => x !== m,
        difficulty: ({n, m, x}) => score({steps: 3, values: [n * m + x], decimals: true}),
        verify: ({n, m, x}, v) => v[0] === n * m && close(v[1], (n * m + x) / (n + 1)),
        build: ({n, m, x}) => item('Mesurer l’effet d’une nouvelle valeur', `Une série de ${n} notes a une moyenne de ${m}. On ajoute la note ${x}.`,
          [Q('Somme des notes initiales', n * m), Q('Nouvelle moyenne', (n * m + x) / (n + 1))],
          C('somme = moyenne × effectif ; on ajoute la nouvelle valeur et on divise par le nouvel effectif.',
            [`${n} × ${m} = ${n * m} ; (${n * m} + ${x}) ÷ ${n + 1} ${eq((n * m + x) / (n + 1))}.`],
            `la moyenne passe de ${m} à environ ${fr(r2((n * m + x) / (n + 1)))} : elle ${x > m ? 'augmente' : 'diminue'}.`),
          'Raisonne sur les sommes.')
      }),
      T({ // Comparer deux séries par l'écart type
        base: {a: [10, 11, 12, 13, 14], b: [6, 9, 12, 15, 18], swap: 0},
        params: r => { const c = r.int(11, 15), s1 = r.int(1, 2), s2 = r.int(3, 5); return {a: [-2, -1, 0, 1, 2].map(i => c + i * s1), b: [-2, -1, 0, 1, 2].map(i => c + i * s2), swap: r.int(0, 1)}; },
        space: 40,
        difficulty: () => score({steps: 3, values: [20], decimals: true}),
        verify: ({a, b, swap}, w) => { const [x, y] = swap ? [b, a] : [a, b], one = [1, 1, 1, 1, 1]; return close(w[0], std(x, one)) && close(w[1], std(y, one)) && w[2] === (std(x, one) < std(y, one) ? 'Classe A' : 'Classe B'); },
        build: ({a, b, swap}) => { const [x, y] = swap ? [b, a] : [a, b], one = [1, 1, 1, 1, 1], sx = std(x, one), sy = std(y, one);
          return item('Comparer deux séries', `Moyennes de cinq élèves, sur 20. Classe A : ${x.map(fr).join(' ; ')}. Classe B : ${y.map(fr).join(' ; ')}. Les deux classes ont la même moyenne.`,
            [Q('Écart type de A', sx), Q('Écart type de B', sy), S('Classe aux résultats les plus homogènes', sx < sy ? 'Classe A' : 'Classe B', ['Classe A', 'Classe B'])],
            C('à moyenne égale, la série de plus petit écart type est la plus regroupée autour de la moyenne.',
              [`σ_A ${eq(sx)} et σ_B ${eq(sy)}.`],
              `la classe ${sx < sy ? 'A' : 'B'} a les résultats les plus homogènes.`),
            'Utilise la calculatrice en mode statistiques.'); }
      })
    ],

    /* ---------- 14 · Tableaux croisés ---------- */
    '2-tableaux-croises': [
      T({ // Fréquence marginale
        base: {a: 30, b: 45, c: 50, d: 25},
        params: r => ({a: r.int(5, 80), b: r.int(5, 80), c: r.int(5, 80), d: r.int(5, 80)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d], decimals: true}),
        verify: ({a, b, c, d}, v) => v[0] === a + b + c + d && close(v[1], (a + c) / (a + b + c + d)),
        build: ({a, b, c, d}) => { const N = a + b + c + d;
          return item('Calculer une fréquence marginale', 'Sondage dans un lycée sur la pratique d’un instrument.' + table('Tableau croisé', ['Instrument', 'Pas d’instrument'], [{label: 'Seconde', cells: [a, b]}, {label: 'Première', cells: [c, d]}], 'Niveau'),
            [Q('Effectif total', N), Q('Fréquence des élèves qui jouent d’un instrument', (a + c) / N)],
            C('une fréquence marginale se calcule sur le total d’une ligne ou d’une colonne, divisé par l’effectif total.',
              [`N = ${a} + ${b} + ${c} + ${d} = ${N}.`, `(${a} + ${c}) ÷ ${N} ${eq((a + c) / N)}.`],
              `environ ${fr(r2(100 * (a + c) / N))} % des élèves jouent d’un instrument.`),
            'Additionne la colonne Instrument.'); }
      }),
      T({ // Fréquence conditionnelle
        base: {a: 30, b: 45, c: 50, d: 25},
        params: r => ({a: r.int(5, 80), b: r.int(5, 80), c: r.int(5, 80), d: r.int(5, 80)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d], decimals: true}),
        verify: ({a, b, c, d}, v) => close(v[0], a / (a + b)) && close(v[1], a / (a + c)),
        build: ({a, b, c, d}) => item('Distinguer deux fréquences conditionnelles', 'Sondage dans un lycée sur la pratique d’un instrument.' + table('Tableau croisé', ['Instrument', 'Pas d’instrument'], [{label: 'Seconde', cells: [a, b]}, {label: 'Première', cells: [c, d]}], 'Niveau'),
          [Q('Parmi les élèves de Seconde, fréquence des musiciens', a / (a + b)), Q('Parmi les musiciens, fréquence des élèves de Seconde', a / (a + c))],
          C('une fréquence conditionnelle se calcule dans une sous-population : on divise par l’effectif de cette sous-population.',
            [`${a} ÷ (${a} + ${b}) ${eq(a / (a + b))}.`, `${a} ÷ (${a} + ${c}) ${eq(a / (a + c))}.`],
            'les deux fréquences n’ont pas le même dénominateur : elles ne sont pas égales en général.'),
          'Repère d’abord la population de référence (« parmi… »).')
      }),
      T({ // Compléter un tableau
        base: {N: 200, k: 60, l: 45, m: 40},
        params: r => ({N: 10 * r.int(10, 50), k: r.int(30, 70), l: r.int(30, 70), m: r.int(20, 80)}),
        accept: ({N, k, l, m}) => { const r1 = Math.round(N * k / 100), c1 = Math.round(N * l / 100), a = Math.round(Math.min(r1, c1) * m / 100); return a > 0 && r1 - a > 0 && c1 - a > 0 && N - r1 - c1 + a > 0; },
        difficulty: ({N}) => score({steps: 3, values: [N]}),
        verify: ({N, k, l, m}, v) => { const r1 = Math.round(N * k / 100), c1 = Math.round(N * l / 100), a = Math.round(Math.min(r1, c1) * m / 100); return v[0] === r1 - a && v[1] === c1 - a && v[2] === N - r1 - c1 + a; },
        build: ({N, k, l, m}) => { const r1 = Math.round(N * k / 100), c1 = Math.round(N * l / 100), a = Math.round(Math.min(r1, c1) * m / 100);
          return item('Compléter un tableau croisé', `Sur ${N} clients, ${r1} sont des femmes et ${c1} ont pris un dessert ; ${a} femmes ont pris un dessert.`,
            [Q('Femmes sans dessert', r1 - a), Q('Hommes avec dessert', c1 - a), Q('Hommes sans dessert', N - r1 - c1 + a)],
            C('on complète par différences, en utilisant les totaux de lignes et de colonnes.',
              [`${r1} ${M} ${a} = ${r1 - a} ; ${c1} ${M} ${a} = ${c1 - a}.`, `${N} ${M} ${r1} ${M} ${c1 - a} = ${N - r1 - c1 + a}.`],
              `${r1 - a}, ${c1 - a} et ${N - r1 - c1 + a}.`),
            'Dessine le tableau à double entrée avec ses totaux.'); }
      }),
      T({ // Des pourcentages aux effectifs
        base: {N: 800, p: 60, q: 30},
        params: r => ({N: 100 * r.int(2, 30), p: r.pick([20, 30, 40, 50, 60, 70, 80]), q: r.pick([10, 20, 25, 30, 40, 50, 60])}),
        difficulty: ({N, p, q}) => score({steps: 3, values: [N, N * p * q / 10000]}),
        verify: ({N, p, q}, v) => close(v[0], N * p / 100) && close(v[1], N * p * q / 10000),
        build: ({N, p, q}) => item('Construire un tableau à partir de pourcentages', `Sur ${N} spectateurs, ${p} % ont moins de 25 ans ; parmi eux, ${q} % sont venus en train.`,
          [Q('Spectateurs de moins de 25 ans', N * p / 100), Q('Spectateurs de moins de 25 ans venus en train', N * p * q / 10000)],
          C('on passe des fréquences conditionnelles aux effectifs en multipliant.',
            [`${N} × ${fr(p / 100)} = ${fr(N * p / 100)} ; ${fr(N * p / 100)} × ${fr(q / 100)} = ${fr(N * p * q / 10000)}.`],
            `${fr(N * p / 100)} et ${fr(N * p * q / 10000)}.`),
          'Le second pourcentage porte sur les moins de 25 ans.')
      }),
      T({ // Réunion et intersection
        base: {a: 30, b: 45, c: 50, d: 25},
        params: r => ({a: r.int(5, 60), b: r.int(5, 60), c: r.int(5, 60), d: r.int(5, 60)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d]}),
        verify: ({a, b, c}, v) => v[0] === a && v[1] === a + b + c,
        build: ({a, b, c, d}) => item('Utiliser « et » et « ou »', 'Élèves selon la langue et l’option.' + table('Tableau croisé', ['Latin', 'Pas de latin'], [{label: 'Espagnol', cells: [a, b]}, {label: 'Allemand', cells: [c, d]}], 'Langue'),
          [Q('Élèves qui font espagnol ET latin', a), Q('Élèves qui font espagnol OU latin', a + b + c)],
          C('« et » : la case commune ; « ou » : l’un au moins des deux, sans compter deux fois la case commune.',
            [`ET : ${a}. OU : ${a + b} (espagnol) + ${a + c} (latin) ${M} ${a} = ${a + b + c}.`],
            `${a} élèves font les deux, ${a + b + c} font l’un au moins.`),
          'Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B).')
      }),
      T({ // Filtre sur deux critères
        base: {n: 120, p: 35, q: 50},
        params: r => ({n: 20 * r.int(3, 25), p: r.pick([20, 25, 30, 35, 40, 45, 50, 55, 60]), q: r.pick([20, 25, 40, 50, 60, 75, 80])}),
        accept: ({n, p, q}) => (n * p * q) % 10000 === 0,
        difficulty: ({n}) => score({steps: 3, values: [n]}),
        verify: ({n, p, q}, v) => v[0] === n * p / 100 && v[1] === n * p / 100 - n * p * q / 10000,
        build: ({n, p, q}) => { const A = n * p / 100, AB = n * p * q / 10000;
          return item('Filtrer selon deux critères', `Un fichier compte ${n} élèves ; ${p} % sont internes et, parmi les internes, ${q} % ont une bourse. On filtre avec la condition « interne ET NON boursier ».`,
            [Q('Nombre d’internes', A), Q('Internes non boursiers', A - AB)],
            C('NON boursier parmi les internes : on retire les internes boursiers.',
              [`${n} × ${fr(p / 100)} = ${fr(A)} ; ${fr(A)} × ${fr(q / 100)} = ${fr(AB)}.`, `${fr(A)} ${M} ${fr(AB)} = ${fr(A - AB)}.`],
              `${fr(A - AB)} élèves sont internes et non boursiers.`),
            'Applique les critères l’un après l’autre.'); }
      })
    ],

    /* ---------- 15 · Probabilités ---------- */
    '2-probabilites': [
      T({ // P(A ∪ B)
        base: {a: 45, b: 30, c: 15},
        params: r => ({a: r.int(10, 70), b: r.int(10, 70), c: r.int(2, 30)}),
        accept: ({a, b, c}) => c < Math.min(a, b) && a + b - c <= 100,
        difficulty: () => score({steps: 2, values: [1], decimals: true}),
        verify: ({a, b, c}, v) => close(v[0], (a + b - c) / 100) && close(v[1], 1 - (a + b - c) / 100),
        build: ({a, b, c}) => item('Calculer P(A ∪ B)', `P(A) = ${fr(a / 100)}, P(B) = ${fr(b / 100)} et P(A ∩ B) = ${fr(c / 100)}.`,
          [Q('P(A ∪ B)', (a + b - c) / 100), Q('P de « ni A ni B »', 1 - (a + b - c) / 100)],
          C('P(A ∪ B) = P(A) + P(B) − P(A ∩ B) ; « ni A ni B » est le contraire de A ∪ B.',
            [`${fr(a / 100)} + ${fr(b / 100)} ${M} ${fr(c / 100)} = ${fr((a + b - c) / 100)}.`, `1 ${M} ${fr((a + b - c) / 100)} = ${fr(1 - (a + b - c) / 100)}.`],
            `P(A ∪ B) = ${fr((a + b - c) / 100)} et P(ni A ni B) = ${fr(1 - (a + b - c) / 100)}.`),
          'L’intersection serait comptée deux fois sans la soustraction.')
      }),
      T({ // Arbre pondéré
        base: {p: 60, q: 30},
        params: r => ({p: r.int(2, 18) * 5, q: r.int(2, 18) * 5}),
        difficulty: () => score({steps: 3, values: [1], decimals: true}),
        verify: ({p, q}, v) => close(v[0], p * q / 10000) && close(v[1], p * (100 - q) / 10000),
        build: ({p, q}) => item('Lire un arbre pondéré', `On choisit un élève au hasard. A : « il prend le car », avec P(A) = ${fr(p / 100)}. Parmi ceux qui prennent le car, ${q} % arrivent en retard (B).`,
          [Q('P(A ∩ B)', p * q / 10000), Q('P(A ∩ B̄)', p * (100 - q) / 10000)],
          C('sur un arbre, P(A ∩ B) = P(A) × P_A(B) : on multiplie le long du chemin.',
            [`P_A(B) = ${fr(q / 100)} et P_A(B̄) = ${fr(1 - q / 100)}.`, `P(A ∩ B) = ${fr(p / 100)} × ${fr(q / 100)} = ${fr(p * q / 10000)} ; P(A ∩ B̄) = ${fr(p / 100)} × ${fr(1 - q / 100)} = ${fr(p * (100 - q) / 10000)}.`],
            `${fr(p * q / 10000)} et ${fr(p * (100 - q) / 10000)}.`),
          'Les branches issues d’un même nœud ont pour somme 1.')
      }),
      T({ // Probabilité conditionnelle depuis un tableau
        base: {a: 18, b: 42, c: 12, d: 28},
        params: r => ({a: r.int(3, 40), b: r.int(3, 40), c: r.int(3, 40), d: r.int(3, 40)}),
        difficulty: ({a, b, c, d}) => score({steps: 2, values: [a + b + c + d], fractions: true}),
        verify: ({a, b, c}, v) => sameFrac(v[0], a, a + b) && sameFrac(v[1], a, a + c),
        build: ({a, b, c, d}) => item('Calculer une probabilité conditionnelle', 'On choisit au hasard un participant à un tournoi.' + table('Participants', ['Gagnant', 'Perdant'], [{label: 'Club A', cells: [a, b]}, {label: 'Club B', cells: [c, d]}], 'Club'),
          [Q('P_A(G) : gagnant sachant club A', a / (a + b)), Q('P_G(A) : club A sachant gagnant', a / (a + c))],
          C('P_A(G) = P(A ∩ G) / P(A) ; avec des effectifs, on divise par l’effectif de A.',
            [`P_A(G) = ${a}/${a + b}${gcd(a, a + b) > 1 ? ' = ' + frac(a, a + b) : ''}.`, `P_G(A) = ${a}/${a + c}${gcd(a, a + c) > 1 ? ' = ' + frac(a, a + c) : ''}.`],
            `P_A(G) = ${frac(a, a + b)} et P_G(A) = ${frac(a, a + c)} : ce ne sont pas les mêmes probabilités.`),
          'Le « sachant » désigne la population de référence.')
      }),
      T({ // Faux positifs
        base: {N: 10000, m: 2, se: 95, sp: 90},
        params: r => ({N: 10000, m: r.pick([1, 2, 3, 5, 10]), se: r.pick([90, 95, 98, 99]), sp: r.pick([85, 90, 95, 98])}),
        space: 60,
        difficulty: () => score({steps: 3, values: [10000], decimals: true}),
        verify: ({N, m, se, sp}, v) => { const M2 = N * m / 100, TP = M2 * se / 100, FP = (N - M2) * (100 - sp) / 100; return close(v[0], TP + FP) && close(v[1], TP / (TP + FP)); },
        build: ({N, m, se, sp}) => { const M2 = N * m / 100, TP = M2 * se / 100, FP = (N - M2) * (100 - sp) / 100;
          return item('Interpréter un test de dépistage', `Dans une population de ${fr(N)} personnes, ${m} % sont malades. Le test est positif pour ${se} % des malades et pour ${100 - sp} % des personnes saines.`,
            [Q('Nombre de tests positifs', TP + FP), Q('P(malade sachant positif)', TP / (TP + FP))],
            C('on raisonne sur des effectifs : malades positifs (vrais positifs) et sains positifs (faux positifs).',
              [`Malades : ${fr(M2)} ; vrais positifs : ${fr(TP)}. Sains : ${fr(N - M2)} ; faux positifs : ${fr(FP)}.`, `P_positif(malade) = ${fr(TP)} ÷ ${fr(TP + FP)} ${eq(TP / (TP + FP))}.`],
              `seule une proportion d’environ ${fr(r2(100 * TP / (TP + FP)))} % des positifs est malade : P_positif(malade) est très différente de P_malade(positif).`),
            'Construis le tableau croisé malade / sain et positif / négatif.'); }
      }),
      T({ // Trois épreuves
        base: {p: 70},
        params: r => ({p: r.int(10, 19) * 5}),
        space: 10,
        difficulty: () => score({steps: 3, values: [1], decimals: true}),
        verify: ({p}, v) => close(v[0], (p / 100) ** 3) && close(v[1], 1 - (1 - p / 100) ** 3),
        build: ({p}) => { const q = p / 100;
          return item('Enchaîner trois épreuves', `Un joueur réussit un tir avec la probabilité ${fr(q)}, indépendamment d’un tir à l’autre. Il tire trois fois.`,
            [Q('P(trois réussites)', q ** 3, 4), Q('P(au moins une réussite)', 1 - (1 - q) ** 3, 4)],
            C('on multiplie le long d’un chemin de l’arbre ; « au moins une » est le contraire de « aucune ».',
              [`${fr(q)}³ = ${fr(r2(q ** 3, 4))}.`, `1 ${M} ${fr(r2(1 - q, 2))}³ = ${fr(r2(1 - (1 - q) ** 3, 4))}.`],
              `${fr(r2(q ** 3, 4))} et ${fr(r2(1 - (1 - q) ** 3, 4))}.`),
            'Passe par l’événement contraire.'); }
      }),
      T({ // Échantillonnage
        base: {p: 30, n: 100, d: 6},
        params: r => ({p: r.pick([20, 25, 30, 40, 50, 60]), n: r.pick([25, 100, 400, 625, 2500]), d: r.int(-15, 15)}),
        accept: ({p, n, d}) => p * n / 100 + d * Math.sqrt(n) / 10 > 0 && Number.isInteger(p * n / 100 + Math.round(d * Math.sqrt(n) / 10)),
        difficulty: () => score({steps: 3, values: [1], decimals: true}),
        verify: ({p, n, d}, v) => { const k = p * n / 100 + Math.round(d * Math.sqrt(n) / 10), f = k / n; return close(v[0], f) && (v[1] === 'oui') === (Math.abs(f - p / 100) <= 1 / Math.sqrt(n) + 1e-12); },
        build: ({p, n, d}) => { const k = p * n / 100 + Math.round(d * Math.sqrt(n) / 10), f = k / n, e = 1 / Math.sqrt(n), ok = Math.abs(f - p / 100) <= e + 1e-12;
          return item('Comparer une fréquence à une probabilité', `Une pièce truquée donne « pile » avec la probabilité ${fr(p / 100)}. Sur un échantillon de ${n} lancers, on obtient ${k} piles.`,
            [Q('Fréquence observée', f, 4), S(`|f − p| ≤ 1/√${n} ?`, ok ? 'oui' : 'non', ['oui', 'non'])],
            C('pour un échantillon de taille n, l’écart |f − p| est en général inférieur ou égal à 1/√n (dans environ 95 % des échantillons).',
              [`f = ${k}/${n} = ${fr(f)} ; 1/√${n} = ${fr(e)}.`, `|${fr(f)} ${M} ${fr(p / 100)}| = ${fr(r2(Math.abs(f - p / 100), 4))}.`],
              ok ? 'l’écart est dans la marge habituelle.' : 'l’écart dépasse la marge habituelle : l’échantillon est inhabituel pour ce modèle.'),
            'Calcule l’écart entre la fréquence et la probabilité.'); }
      })
    ],

    /* ---------- 16 · Algorithmique et logique ---------- */
    '2-algorithmique': [
      T({ // Fonction Python
        base: {a: 3, b: -2, c: 1, n: 2},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-6, 6), c: r.int(-9, 9), n: r.int(-5, 6)}),
        accept: ({b, c, n}) => b !== 0 && c !== 0 && n !== 0,
        difficulty: ({a, b, c, n}) => score({steps: 2, values: [a * n * n + b * n + c], negatives: true}),
        verify: ({a, b, c, n}, v) => v[0] === a * n * n + b * n + c && v[1] === a * 4 - b * 2 + c,
        build: ({a, b, c, n}) => item('Exécuter une fonction Python', 'On considère la fonction suivante.' + py(['def f(x):', `    return ${pyTerm(a, 'x**2', true)} ${pyTerm(b, 'x')} ${pyTerm(c, '')}`]),
          [Q(`Valeur renvoyée par f(${fr(n)})`, a * n * n + b * n + c), Q('Valeur renvoyée par f(−2)', a * 4 - b * 2 + c)],
          C('x**2 est le carré de x ; on remplace x par la valeur de l’argument.',
            [`f(${fr(n)}) = ${fr(a)} × ${pa(n)}² + ${pa(b)} × ${pa(n)} + ${pa(c)} = ${fr(a * n * n + b * n + c)}.`, `f(${M}2) = ${fr(a)} × 4 + ${pa(b)} × (${M}2) + ${pa(c)} = ${fr(a * 4 - b * 2 + c)}.`],
            `${fr(a * n * n + b * n + c)} et ${fr(a * 4 - b * 2 + c)}.`),
          'Respecte les priorités : la puissance avant la multiplication.')
      }),
      T({ // Boucle while
        base: {u: 5, q: 2, M: 300},
        params: r => ({u: r.int(1, 20), q: r.pick([2, 3, 1.5]), M: 50 * r.int(2, 40)}),
        accept: ({u, M}) => M > 4 * u,
        difficulty: ({u, q, M}) => { let x = u, n = 0; while (x < M) { x *= q; n++; } return score({steps: 3, values: [n, M]}); },
        verify: ({u, q, M}, v) => close(u * q ** v[0], v[1]) && v[1] >= M && u * q ** (v[0] - 1) < M,
        build: ({u, q, M}) => { let x = u, n = 0; const seen = [u]; while (x < M) { x *= q; n++; seen.push(r2(x, 4)); }
          return item('Suivre une boucle non bornée', 'On exécute le programme suivant.' + py([`u = ${u}`, 'n = 0', `while u < ${M}:`, `    u = u * ${q}`, '    n = n + 1']),
            [Q('Valeur finale de n', n), Q('Valeur finale de u', x, 4)],
            C('la boucle tourne tant que la condition u < ' + M + ' est vraie ; elle s’arrête dès que u atteint ou dépasse ' + M + '.',
              [`Valeurs successives de u : ${seen.map(s => fr(s)).join(' ; ')}.`],
              `n = ${n} et u = ${fr(r2(x, 4))}.`),
            'Dresse un tableau des valeurs de n et u.'); }
      }),
      T({ // Boucle for
        base: {a: 1, b: 6, k: 2},
        params: r => ({a: r.int(0, 5), b: r.int(6, 15), k: r.int(1, 3)}),
        difficulty: ({a, b, k}) => { let s = 0; for (let i = a; i < b; i++) s += k * i; return score({steps: 2, values: [s, b - a]}); },
        verify: ({a, b, k}, v) => { let s = 0; for (let i = a; i < b; i++) s += k * i; return v[0] === b - a && v[1] === s; },
        build: ({a, b, k}) => { let s = 0; const terms = []; for (let i = a; i < b; i++) { s += k * i; terms.push(k * i); }
          return item('Suivre une boucle bornée', 'On exécute le programme suivant.' + py(['s = 0', `for i in range(${a}, ${b}):`, `    s = s + ${k}*i`]),
            [Q('Nombre de tours de boucle', b - a), Q('Valeur finale de s', s)],
            C(`range(${a}, ${b}) parcourt les entiers de ${a} à ${b - 1} : le dernier, ${b}, est exclu.`,
              [`s = ${terms.join(' + ')} = ${s}.`],
              `${b - a} tours et s = ${s}.`),
            'range(a, b) s’arrête juste avant b.'); }
      }),
      T({ // Conditions et booléens
        base: {v: [3, 8, 12, 7, 15, 10, 4], s: 6},
        params: r => ({v: Array.from({length: 7}, () => r.int(1, 30)), s: r.int(5, 20)}),
        accept: ({v, s}) => { const a = v.filter(x => x > s && x % 2 === 0).length, o = v.filter(x => x > s || x % 2 === 0).length; return a >= 1 && o > a && o < 7; },
        difficulty: () => score({steps: 2, values: [7]}),
        verify: ({v, s}, w) => w[0] === v.filter(x => x > s && x % 2 === 0).length && w[1] === v.filter(x => x > s || x % 2 === 0).length,
        build: ({v, s}) => { const and = v.filter(x => x > s && x % 2 === 0), or = v.filter(x => x > s || x % 2 === 0);
          return item('Utiliser ET et OU', `Liste : ${v.join(' ; ')}. On compte les nombres x tels que ${code(`x > ${s} and x % 2 == 0`)}, puis ceux tels que ${code(`x > ${s} or x % 2 == 0`)}.`,
            [Q('Nombre avec « and »', and.length), Q('Nombre avec « or »', or.length)],
            C('« and » exige les deux conditions ; « or » en exige au moins une. x % 2 == 0 signifie que x est pair.',
              [`ET : ${and.join(' ; ')}.`, `OU : ${or.join(' ; ')}.`],
              `${and.length} avec « and », ${or.length} avec « or ».`),
            'Teste chaque nombre de la liste.'); }
      }),
      T({ // Implication et réciproque
        base: {a: 6, b: 3, kind: 1},
        params: r => { const kind = r.int(0, 1), x = r.int(2, 9), m = r.int(2, 5); return kind ? {a: x * m, b: x, kind} : {a: x, b: x * m, kind}; },
        accept: ({a, b}) => a !== b,
        difficulty: () => score({steps: 2, values: [40]}),
        verify: ({a, b}, v) => (v[0] === 'vraie') === (a % b === 0) && (v[1] === 'vraie') === (b % a === 0) && v[2] === lcm(a, b),
        build: ({a, b}) => { const imp = a % b === 0, rec = b % a === 0, L = lcm(a, b);
          return item('Étudier une implication', `Proposition P : « si un entier n est multiple de ${a}, alors n est multiple de ${b} ».`,
            [S('P est', imp ? 'vraie' : 'fausse', ['vraie', 'fausse']), S('Sa réciproque est', rec ? 'vraie' : 'fausse', ['vraie', 'fausse']), Q(`Plus petit entier positif multiple de ${a} et de ${b}`, L)],
            C('une implication « si A alors B » est fausse dès qu’un contre-exemple vérifie A sans vérifier B.',
              [imp ? `${a} = ${b} × ${a / b} : tout multiple de ${a} est multiple de ${b}.` : `${a} est multiple de ${a} mais pas de ${b} : contre-exemple.`,
               `Réciproque : « si n est multiple de ${b}, alors n est multiple de ${a} ». ${rec ? 'Elle est vraie.' : `${b} en est un contre-exemple.`}`],
              `P est ${imp ? 'vraie' : 'fausse'}, sa réciproque est ${rec ? 'vraie' : 'fausse'}.`),
            'Cherche un contre-exemple simple : le nombre lui-même.'); }
      }),
      T({ // Affectations successives
        base: {a: 3, b: 5},
        params: r => ({a: r.int(-9, 9), b: r.int(-9, 9)}),
        accept: ({a, b}) => a !== b && a !== 0 && b !== 0,
        difficulty: ({a, b}) => score({steps: 3, values: [a * (a + b)], negatives: true}),
        verify: ({a, b}, v) => { let x = a, y = b; y = x + y; x = x * y; y = x - y; return v[0] === x && v[1] === y; },
        build: ({a, b}) => { let x = a, y = b; y = x + y; const y1 = y; x = x * y; y = x - y;
          return item('Exécuter des affectations', 'On exécute les instructions suivantes, dans l’ordre.' + py([`a = ${a}`, `b = ${b}`, 'b = a + b', 'a = a * b', 'b = a - b']),
            [Q('Valeur finale de a', x), Q('Valeur finale de b', y)],
            C('chaque affectation utilise les valeurs des variables au moment où elle est exécutée.',
              [`b = ${fr(a)} + ${pa(b)} = ${fr(y1)} ; a = ${fr(a)} × ${pa(y1)} = ${fr(x)} ; b = ${fr(x)} ${M} ${pa(y1)} = ${fr(y)}.`],
              `a = ${fr(x)} et b = ${fr(y)}.`),
            'Note les valeurs après chaque ligne.'); }
      })
    ]
  };

  const basics = {
    '2-arithmetique': ['a est multiple de b s’il existe un entier k tel que a = kb.', '91 est-il premier ? Donne son plus petit diviseur.', '7', '91 = 7 × 13.'],
    '2-nombres-reels': ['Un intervalle regroupe les réels compris entre deux bornes.', 'Amplitude de [2 ; 9] ?', '7', '9 − 2.'],
    '2-calcul-algebrique': ['√(ab) = √a × √b pour a et b positifs.', 'Simplifie √12 sous la forme a√3 : a ?', '2', '12 = 4 × 3.'],
    '2-equations': ['Multiplier une inégalité par un négatif change son sens.', 'Résous −x < 4 : x est supérieur à quel nombre ?', '−4', 'On multiplie par −1 et on change le sens.'],
    '2-vecteurs': ['Le vecteur AB a pour coordonnées (x_B − x_A ; y_B − y_A).', 'A(1 ; 2), B(4 ; 6) : abscisse du vecteur AB ?', '3', '4 − 1.'],
    '2-colinearite': ['Deux vecteurs sont colinéaires si leur déterminant est nul.', 'det((1 ; 2), (3 ; 6)) ?', '0', '1 × 6 − 3 × 2.'],
    '2-droites': ['La pente d’une droite est (y_B − y_A)/(x_B − x_A).', 'Pente de la droite passant par (0 ; 1) et (2 ; 5) ?', '2', '(5 − 1) ÷ 2.'],
    '2-fonctions': ['Un point est sur la courbe de f si son ordonnée est l’image de son abscisse.', 'f(x) = x² : f(−3) ?', '9', '(−3)² = 9.'],
    '2-fonctions-reference': ['Carré, inverse, racine carrée, cube et valeur absolue sont les fonctions de référence.', '√49 ?', '7', '7² = 49.'],
    '2-variations': ['Une fonction croissante conserve l’ordre, une fonction décroissante l’inverse.', 'f(x) = −2x + 1 : que vaut f(3) ?', '−5', '−6 + 1.'],
    '2-signes': ['Un produit est positif quand ses facteurs ont le même signe.', 'Combien vaut (−2) × (−5) ?', '10', 'Deux facteurs négatifs donnent un produit positif.'],
    '2-evolutions': ['Évoluer de t % revient à multiplier par 1 + t/100.', 'Coefficient d’une baisse de 15 % ?', '0,85', '1 − 0,15.'],
    '2-statistiques': ['La moyenne résume le centre, l’écart type la dispersion.', 'Moyenne de 6, 8 et 10 ?', '8', '24 ÷ 3.'],
    '2-tableaux-croises': ['Une fréquence conditionnelle se calcule dans une sous-population.', 'Parmi 40 filles, 10 font du judo : fréquence ?', '0,25', '10 ÷ 40.'],
    '2-probabilites': ['Sur un arbre, on multiplie les probabilités le long d’un chemin.', 'P(A) = 0,5 et P_A(B) = 0,4 : P(A ∩ B) ?', '0,2', '0,5 × 0,4.'],
    '2-algorithmique': ['Exécute le programme ligne par ligne en notant les variables.', 'x = 3 puis x = x * 2 + 1 : que vaut x ?', '7', '3 × 2 + 1.']
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  window.SecondeExercises = {slugs: Object.keys(models), count: 6};
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
    const root = document.querySelector('[data-seconde-chapter]');
    const node = document.getElementById('exercise-data');
    if (root && node) {
      const slug = root.dataset.secondeChapter;
      if (!models[slug]) throw new Error('Chapitre de Seconde inconnu : ' + slug);
      node.textContent = JSON.stringify({slug, exercises: models[slug].map((_, i) => V.original(slug, i))});
    }
  }
})();
