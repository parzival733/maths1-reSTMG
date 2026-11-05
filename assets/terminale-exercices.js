/* Terminale STMG : 54 modèles déclaratifs. Calculs et corrections issus des mêmes
   paramètres ; la calculatrice est autorisée, avec des valeurs raisonnables.
   Le moteur, le score et la révélation des réponses sont ceux de Première. */
(() => {
  'use strict';
  const V = window.ExerciseVariants;
  if (!V) throw new Error('Le moteur de variantes doit être chargé avant Terminale.');
  const {N, S, C, F, score, fmt, productSignTable, variationTable, signTable} = V;
  const {num: fr, paren: pa, signed: sg, diff, term, poly, affine, frac, pct, eur, MINUS: M} = fmt;
  // Valeur exacte, ou arrondie au millième (ou à `digits` décimales).
  const Q = (label, value, digits = 3) => N(label, F(value, 9), 1e-8, digits);
  const choice = (label, answer, options, settings) => S(label, answer, options, settings);
  const r3 = (x, d = 3) => Math.round(x * 10 ** d + (x >= 0 ? 1e-9 : -1e-9)) / 10 ** d;
  const eq = (x, d = 3) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-7 ? '= ' + fr(x) : '≈ ' + fr(r3(x, d)));
  const sub = k => String(k).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
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
            [`m = (${fr(a)} + ${pa(b)})/2 = ${fr(m)} ; la raison vaut ${diff(m, a)} = ${fr(r)}.`],
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
            [`u${sub(n)} = ${a} + ${n} × ${pa(r)} = ${fr(last)}. Du rang 0 au rang ${n}, il y a ${n + 1} termes.`, `S = ${n + 1} × (${a} + ${pa(last)})/2 = ${fr(sum)}.`],
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
    't-exponentielles': [
      T({ // Du discret au continu
        base: {k: 4, a: 3, x: 3},
        params: r => ({k: r.int(2, 10), a: r.int(2, 5), x: r.int(2, 4)}),
        accept: ({k, a, x}) => k * a ** x <= 5000 && k % a !== 0,
        difficulty: ({k, a, x}) => score({steps: 2, values: [k, a, x, k * a ** x, k / a]}),
        verify: ({k, a, x}, v) => v[0] === k * a ** x && close(v[1] * a, k),
        build: ({k, a, x}) => item('Du discret au continu', `f(x) = ${k} × ${a}<sup>x</sup> pour tout réel x.`,
          [Q(`f(${x})`, k * a ** x), Q(`f(${M}1)`, k / a)],
          C('on remplace x par la valeur demandée ; un exposant négatif donne un inverse : a<sup>−1</sup> = 1/a.',
            [`f(${x}) = ${k} × ${a}<sup>${x}</sup> = ${k} × ${a ** x} = ${fr(k * a ** x)}.`, `f(${M}1) = ${k} × ${a}<sup>${M}1</sup> = ${k}/${a} ${eq(k / a)}.`],
            `f(${x}) = ${fr(k * a ** x)} et f(${M}1) = ${k}/${a} ${eq(k / a)} : un exposant négatif ne rend pas l’image négative.`),
          'Un exposant négatif donne un inverse, pas un nombre négatif.')
      }),
      T({ // Propriétés des puissances
        base: {a: 3, m: 3, n: 2},
        params: r => { const m = r.int(2, 8); return {a: r.int(2, 10), m, n: r.int(1, m + 2)}; },
        accept: ({a, m, n}) => n !== m && a ** (m + n) <= 50000,
        difficulty: ({a, m, n}) => score({steps: 2, values: [a, m, n]}),
        verify: ({a, m, n}, v) => v[0] === a ** m * a ** n && close(v[1], a ** m / a ** n, 1e-6),
        build: ({a, m, n}) => item('Propriétés des puissances', `Calcule A = ${a}<sup>${m}</sup> × ${a}<sup>${n}</sup> et B = ${a}<sup>${m}</sup> ÷ ${a}<sup>${n}</sup>.`,
          [Q('A', a ** (m + n)), Q('B', a ** (m - n))],
          C('pour une même base, a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup> et a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup>.',
            [`A = ${a}<sup>${m}+${n}</sup> = ${a}<sup>${m + n}</sup> = ${fr(a ** (m + n))} ; B = ${a}<sup>${m}−${n}</sup> = ${a}<sup>${fr(m - n)}</sup> ${m - n < 0 ? `= 1/${a ** (n - m)} ` : ''}${eq(a ** (m - n))}.`],
            `A = ${fr(a ** (m + n))} et B ${eq(a ** (m - n))}${m - n < 0 ? ' : un exposant négatif donne un inverse' : ''}.`),
          'Les bases doivent être identiques pour additionner ou soustraire les exposants.')
      }),
      T({ // Signe du coefficient et variation
        base: {want: 1, sk: -1, k: 3, a: 2},
        params: r => {
          const want = r.int(0, 2), sk = r.sign(), k = r.int(2, 9);
          // want : 0 croissante, 1 décroissante, 2 constante ; la base est choisie en conséquence.
          const up = want === 2 ? null : (want === 0) === (sk > 0);
          return {want, sk, k, a: want === 2 ? 1 : up ? r.pick([1.5, 2, 3]) : r.pick([0.25, 0.5, 0.8])};
        },
        difficulty: ({k, a}) => score({steps: 2, values: [k, a], decimals: false}),
        verify: ({sk, k, a}, v) => v[0] === sk * k && v[1] === (a === 1 ? 'constante' : sk * (a - 1) > 0 ? 'croissante' : 'décroissante'),
        build: ({sk, k, a}) => {
          const kk = sk * k, dir = a === 1 ? 'constante' : kk * (a - 1) > 0 ? 'croissante' : 'décroissante';
          return item('Signe du coefficient et variation', `f(x) = ${pa(kk)} × ${fr(a)}<sup>x</sup>. Étudie f sur ℝ.`,
            [Q('f(0)', kk), choice('Variation', dir, ['croissante', 'décroissante', 'constante'])],
            C('a<sup>0</sup> = 1 donne f(0) = k ; x ↦ a<sup>x</sup> est croissante si a > 1, décroissante si 0 < a < 1, constante si a = 1 ; un coefficient négatif inverse le sens de variation.',
              [`f(0) = ${pa(kk)} × 1 = ${fr(kk)}. La base ${fr(a)} est ${a === 1 ? 'égale à 1' : a > 1 ? 'supérieure à 1' : 'comprise entre 0 et 1'} et le coefficient ${fr(kk)} est ${kk > 0 ? 'positif' : 'négatif'}.`],
              `f est ${dir} sur ℝ.`),
            'Examine séparément la base a et le signe du coefficient k.');
        }
      }),
      T({ // Taux annuel moyen
        base: {v0: 1000, q: 1.2},
        params: r => ({v0: r.pick([400, 500, 800, 1000, 2000, 2500, 5000, 10000]), q: r.pick([0.8, 0.9, 1.05, 1.1, 1.2, 1.3, 1.5])}),
        accept: ({v0, q}) => Number.isInteger(F(v0 * q * q, 6)),
        difficulty: ({v0, q}) => score({steps: 3, values: [v0, v0 * q * q, q, (q - 1) * 100]}),
        verify: ({v0, q}, v) => close(v[0] * v[0], q * q) && close(v[1], (v[0] - 1) * 100),
        build: ({v0, q}) => { const vf = F(v0 * q * q, 6); return item('Taux annuel moyen', `Une quantité passe de ${fr(v0)} à ${fr(vf)} en deux ans. On cherche le taux qui, appliqué chaque année, donne la même évolution.`,
          [Q('Coefficient annuel moyen', q), Q('Taux annuel moyen en %', (q - 1) * 100)],
          C('le coefficient global sur deux ans est le carré du coefficient annuel moyen : on prend sa racine carrée (moyenne géométrique), puis on retranche 1.',
            [`Coefficient global : ${fr(vf)}/${fr(v0)} = ${fr(q * q)} ; coefficient annuel : √${fr(q * q)} = ${fr(q)}.`, `Taux : (${fr(q)} − 1) × 100 = ${fr((q - 1) * 100)}.`],
            `le taux annuel moyen est de ${q > 1 ? '+' : ''}${pct((q - 1) * 100)}.`),
          'La moyenne des coefficients est géométrique : le coefficient recherché au carré doit redonner le coefficient global.'); }
      }),
      T({ // Deux taux successifs différents
        base: {a: 6, b: 3, order: 0},
        params: r => ({a: r.int(2, 20), b: r.int(2, 20), order: r.int(0, 1)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => { const g = (1 + a / 100) * (1 - b / 100); return score({steps: 3, values: [a, b, g, 100 * (g - 1), 100 * (Math.sqrt(g) - 1)]}); },
        verify: ({a, b}, v) => { const g = (1 + a / 100) * (1 - b / 100); return close(v[0], 100 * (g - 1)) && close((1 + v[1] / 100) ** 2, g); },
        build: ({a, b, order}) => {
          const g = (1 + a / 100) * (1 - b / 100);
          return item('Deux taux successifs différents', `Une valeur ${order ? `diminue de ${b} %, puis augmente de ${a} %` : `augmente de ${a} %, puis diminue de ${b} %`} sur deux périodes de même durée.`,
            [Q('Taux global en %', 100 * (g - 1)), Q('Taux moyen par période en %', 100 * (Math.sqrt(g) - 1))],
            C('on multiplie les coefficients multiplicateurs ; le taux moyen correspond à la racine carrée du coefficient global (et non à la moyenne des taux).',
              [`Coefficient global : (1 + ${fr(a / 100)}) × (1 − ${fr(b / 100)}) = ${fr(F(g, 6))} ; taux global : ${eq(100 * (g - 1))} %.`, `Taux moyen : (√${fr(F(g, 6))} − 1) × 100 ${eq(100 * (Math.sqrt(g) - 1))} %.`],
              `l’évolution globale est d’environ ${fr(r3(100 * (g - 1)))} %, soit environ ${fr(r3(100 * (Math.sqrt(g) - 1)))} % par période en moyenne.`),
            'Multiplie les coefficients multiplicateurs ; ne fais pas la moyenne arithmétique des taux.');
        }
      }),
      T({ // Intercaler un point exponentiel
        base: {k: 5, q: 3, x0: 0},
        params: r => ({k: r.int(2, 20), q: r.int(2, 5), x0: r.int(0, 3)}),
        difficulty: ({k, q, x0}) => score({steps: 3, values: [x0, x0 + 2, k, k * q * q, k * q]}),
        verify: ({k, q, x0}, v) => v[0] === x0 + 1 && v[1] * v[1] === k * k * q * q,
        build: ({k, q, x0}) => item('Intercaler un point exponentiel', `Une courbe d’équation y = K × a<sup>x</sup>, avec K > 0 et a > 0, passe par A(${x0} ; ${k}) et B(${x0 + 2} ; ${k * q * q}). Cherche le point de la courbe d’abscisse située à mi-chemin.`,
          [Q('Abscisse du point', x0 + 1), Q('Ordonnée du point', k * q)],
          C('pour un modèle exponentiel, l’abscisse du point intermédiaire est la moyenne arithmétique des abscisses, et son ordonnée la moyenne géométrique des ordonnées.',
            [`Abscisse : (${x0} + ${x0 + 2})/2 = ${x0 + 1}. Ordonnée : √(${k} × ${k * q * q}) = √${k * k * q * q} = ${k * q}.`],
            `le point cherché est (${x0 + 1} ; ${k * q}) ; la moyenne arithmétique ${fr((k + k * q * q) / 2)} des ordonnées ne convient pas.`),
          'Pour un modèle exponentiel positif, utilise la moyenne arithmétique des abscisses et géométrique des ordonnées.')
      })
    ],
    't-logarithme': [
      T({ // Logarithmes de puissances de dix
        base: {h: 2, j: -2, form: 0},
        params: r => ({h: r.int(1, 6), j: r.int(-4, -1), form: r.int(0, 1)}),
        space: 48,
        difficulty: ({h, j}) => score({steps: 2, values: [h, j]}),
        verify: ({h, j}, v) => v[0] === h && v[1] === j,
        build: ({h, j, form}) => item('Logarithmes de puissances de dix', form
          ? `Calcule log(10<sup>${h}</sup>) et log(1/10<sup>${-j}</sup>). log désigne le logarithme décimal.`
          : `Calcule log(${fr(10 ** h)}) et log(${fr(10 ** j)}). log désigne le logarithme décimal.`,
          [Q('Premier logarithme', h), Q('Second logarithme', j)],
          C('le logarithme décimal d’une puissance de 10 est son exposant : log(10<sup>n</sup>) = n pour tout entier n.',
            [`${form ? `10<sup>${h}</sup>` : fr(10 ** h)} = 10<sup>${h}</sup>, donc son logarithme vaut ${h}.`, `${form ? `1/10<sup>${-j}</sup>` : fr(10 ** j)} = 10<sup>${M}${-j}</sup>, donc son logarithme vaut ${fr(j)}.`],
            `les logarithmes valent ${h} et ${fr(j)} ; un logarithme est négatif lorsque le nombre est compris entre 0 et 1.`),
          'Demande-toi à quelle puissance de 10 correspond chaque nombre.')
      }),
      T({ // Transformer produit, quotient et puissance
        base: {a: 3, b: 2},
        params: r => ({a: r.int(1, 20), b: r.int(1, 15)}),
        accept: ({a, b}) => a !== b,
        difficulty: ({a, b}) => score({steps: 3, values: [a / 10, b / 10, (a + b) / 10, (a - b) / 10, 3 * a / 10]}),
        verify: ({a, b}, v) => close(v[0], (a + b) / 10) && close(v[1], (a - b) / 10) && close(v[2], 3 * a / 10),
        build: ({a, b}) => { const la = a / 10, lb = b / 10; return item('Transformer produit, quotient et puissance', `A et B sont deux nombres strictement positifs, avec log(A) = ${fr(la)} et log(B) = ${fr(lb)}.`,
          [Q('log(A × B)', la + lb), Q('log(A / B)', la - lb), Q('log(A³)', 3 * la)],
          C('log(AB) = log(A) + log(B), log(A/B) = log(A) − log(B) et log(A<sup>n</sup>) = n × log(A).',
            [`log(AB) = ${fr(la)} + ${fr(lb)} = ${fr(F(la + lb, 6))} ; log(A/B) = ${fr(la)} − ${fr(lb)} = ${fr(F(la - lb, 6))} ; log(A<sup>3</sup>) = 3 × ${fr(la)} = ${fr(F(3 * la, 6))}.`],
            `log(AB) = ${fr(F(la + lb, 6))}, log(A/B) = ${fr(F(la - lb, 6))} et log(A<sup>3</sup>) = ${fr(F(3 * la, 6))}. Il n’existe pas de règle analogue pour log(A + B).`),
          'Produit devient somme ; quotient devient différence ; puissance devient multiplication.'); }
      }),
      T({ // Équation et seuil
        base: {a: 3, x: 4, strict: 1},
        params: r => ({a: r.int(2, 9), x: r.int(2, 15), strict: r.int(0, 1)}),
        accept: ({a, x}) => a ** x <= 6000,
        difficulty: ({a, x}) => score({steps: 3, values: [a, x]}),
        verify: ({a, x, strict}, v) => a ** v[0] === a ** x && (strict ? a ** v[1] > a ** x && !(a ** (v[1] - 1) > a ** x) : a ** v[1] >= a ** x && !(a ** (v[1] - 1) >= a ** x)),
        build: ({a, x, strict}) => { const b = a ** x, sym = strict ? '>' : '≥'; return item('Équation et seuil', `Résous ${a}<sup>x</sup> = ${fr(b)}, puis cherche le premier entier naturel n tel que ${a}<sup>n</sup> ${sym} ${fr(b)}.`,
          [Q('Solution réelle x', x), Q('Premier entier n', strict ? x + 1 : x)],
          C('on applique log aux deux membres : log(a<sup>x</sup>) = x × log(a), donc x = log(b)/log(a). Pour le seuil, a > 1 : n ↦ a<sup>n</sup> est croissante.',
            [`x = log(${fr(b)})/log(${a}) = ${x}.`, strict ? `L’inégalité stricte impose n > ${x} : le premier entier est ${x + 1}.` : `L’inégalité large est vérifiée dès n = ${x}.`],
            `la solution réelle est ${x} et le premier entier n tel que ${a}<sup>n</sup> ${sym} ${fr(b)} est ${strict ? x + 1 : x}.`),
          'Résous d’abord pour un réel, puis tiens compte du caractère strict ou large du seuil.'); }
      }),
      T({ // Seuil d'une décroissance
        base: {m: 3, v0: 1100},
        params: r => ({m: r.int(2, 7), v0: 100 * r.int(5, 30)}),
        difficulty: ({m, v0}) => score({steps: 3, values: [v0, v0 / 2 ** m, m]}),
        verify: ({m, v0}, v) => close(v0 * 0.5 ** v[0], v0 / 2 ** m) && v[1] === v[0] + 1,
        build: ({m, v0}) => { const b = v0 / 2 ** m; return item('Seuil d’une décroissance', `v(n) = ${fr(v0)} × 0,5<sup>n</sup>. Pour quel rang atteint-on exactement ${fr(b)} ? Quel est le premier rang strictement en dessous ?`,
          [Q('Rang d’égalité', m), Q('Premier rang strictement en dessous', m + 1)],
          C('on résout l’équation avec le logarithme ; comme log(0,5) < 0, diviser une inégalité par log(0,5) en change le sens.',
            [`${fr(v0)} × 0,5<sup>n</sup> = ${fr(b)} ⇔ 0,5<sup>n</sup> = ${fr(b / v0)} ⇔ n = log(${fr(b / v0)})/log(0,5) = ${m}.`, `v(n) < ${fr(b)} ⇔ n > ${m}, car la suite est strictement décroissante.`],
            `l’égalité a lieu au rang ${m} ; le premier rang strictement en dessous de ${fr(b)} est ${m + 1}.`),
          'La suite décroît. Contrôle le rang trouvé et le rang précédent.'); }
      }),
      T({ // L'inconnue est la base
        base: {a: 3, x: 3},
        params: r => ({a: r.int(2, 5), x: r.int(2, 14)}),
        accept: ({a, x}) => x ** a <= 100000,
        difficulty: ({a}) => score({steps: 2, values: [a]}),
        verify: ({a, x}, v) => v[0] ** a === x ** a && v[0] > 0 && close(v[1], Math.log10(x)),
        build: ({a, x}) => { const b = x ** a; return item('L’inconnue est la base', `Résous x<sup>${a}</sup> = ${fr(b)} avec x strictement positif, puis donne log(x). Attention : ici, l’inconnue est la base et l’exposant ${a} est connu.`,
          [Q('x positif', x), Q('log(x)', Math.log10(x))],
          C(`quand l’inconnue est la base, on prend la racine d’ordre ${a} : x = b<sup>1/${a}</sup>. On peut aussi écrire ${a} log(x) = log(b).`,
            [`x = ${fr(b)}<sup>1/${a}</sup> = ${x}, car ${x}<sup>${a}</sup> = ${fr(b)}.`, `log(x) = log(${fr(b)})/${a} = log(${x}) ≈ ${fr(r3(Math.log10(x)))}.`],
            `x = ${x} et log(x) ≈ ${fr(r3(Math.log10(x)))}.`),
          'Distingue a<sup>x</sup> (inconnue en exposant) et x<sup>a</sup> (inconnue en base) ; ici l’exposant est connu.'); }
      }),
      T({ // Ordre de grandeur et nombre de chiffres
        base: {kind: 0, h: 3, lead: 3, tail: 1},
        params: r => { const kind = r.int(0, 2), h = r.int(2, 6); return {kind, h, lead: kind ? 0 : r.int(1, 9), tail: kind === 1 ? r.int(1, 9) : kind ? 0 : r.int(0, 99)}; },
        difficulty: ({h}) => score({steps: 3, values: [h, h + 1]}),
        verify: ({kind, h, lead, tail}, v) => { const n = kind === 0 ? lead * 10 ** h + tail : kind === 1 ? 10 ** (h + 1) - tail : 10 ** h; return 10 ** v[0] <= n && n < 10 ** (v[0] + 1) && v[1] === String(n).length; },
        build: ({kind, h, lead, tail}) => {
          const n = kind === 0 ? lead * 10 ** h + tail : kind === 1 ? 10 ** (h + 1) - tail : 10 ** h, k = h;
          const warn = kind === 1 ? ` Attention : ${fr(n)} est juste en dessous de 10<sup>${h + 1}</sup> ; log(N) ≈ ${fr(r3(Math.log10(n), 4))} est très proche de ${h + 1} mais lui reste inférieur.`
            : kind === 2 ? ` Ici N est exactement une puissance de 10 : log(N) = ${h}, et N a ${h + 1} chiffres.` : '';
          return item('Ordre de grandeur et nombre de chiffres', `On considère l’entier N = ${fr(n)}. Détermine l’entier k tel que 10<sup>k</sup> ≤ N < 10<sup>k+1</sup>, puis le nombre de chiffres de N.`,
            [Q('k', k), Q('Nombre de chiffres', k + 1)],
            C('k est la partie entière de log(N) ; un entier N tel que 10<sup>k</sup> ≤ N < 10<sup>k+1</sup> s’écrit avec k + 1 chiffres.',
              [`${fr(10 ** k)} ≤ ${fr(n)} < ${fr(10 ** (k + 1))}, donc ${k} ≤ log(N) < ${k + 1}.${warn}`],
              `k = ${k} et N a ${k + 1} chiffres.`),
            'Un entier compris entre 10 puissance k (inclus) et 10 puissance k + 1 (exclu) a k + 1 chiffres.');
        }
      })
    ],
    't-inverse': [
      T({ // Images par la fonction inverse
        base: {x1: 3, x2: -3},
        params: r => ({x1: r.pick([2, 3, 4, 5, 8, 10, 0.5, 0.25]), x2: -r.pick([2, 3, 4, 5, 8, 10, 0.5, 0.25])}),
        space: 64,
        difficulty: ({x1, x2}) => score({steps: 2, values: [x1, x2, 1 / x1, 1 / x2]}),
        verify: ({x1, x2}, v) => close(v[0] * x1, 1) && close(v[1] * x2, 1),
        build: ({x1, x2}) => item('Images par la fonction inverse', `f(x) = 1/x pour x non nul. Calcule f(${fr(x1)}) et f(${fr(x2)}).`,
          [Q(`f(${fr(x1)})`, 1 / x1), Q(`f(${fr(x2)})`, 1 / x2)],
          C('l’image de x par la fonction inverse est 1/x ; l’inverse d’un nombre a le même signe que lui, et 0 n’a pas d’image.',
            [`f(${fr(x1)}) = 1/${fr(x1)} ${eq(1 / x1)} ; f(${fr(x2)}) = 1/(${fr(x2)}) ${eq(1 / x2)}.`],
            `f(${fr(x1)}) ${eq(1 / x1)} et f(${fr(x2)}) ${eq(1 / x2)}. Une fraction exacte est acceptée.`),
          'Garde le signe du nombre dans le dénominateur.')
      }),
      T({ // Dériver une somme
        base: {k: 9, a: 3},
        params: r => ({k: r.int(2, 20), a: r.int(1, 6)}),
        difficulty: ({k, a}) => score({steps: 3, values: [k, a, a + k / a, 1 - k / (a * a)]}),
        verify: ({k, a}, v) => close(v[0], a + k / a) && close(v[1], 1 - k / (a * a)),
        build: ({k, a}) => item('Dériver une somme', `f(x) = x + ${k}/x pour x > 0. Calcule l’image et le nombre dérivé en x = ${a}.`,
          [Q(`f(${a})`, a + k / a), Q(`f′(${a})`, 1 - k / (a * a))],
          C(`la dérivée de x est 1 et celle de k/x est −k/x² : f′(x) = 1 − ${k}/x².`,
            [`f(${a}) = ${a} + ${k}/${a} ${eq(a + k / a)}.`, `f′(${a}) = 1 − ${k}/${a * a} ${eq(1 - k / (a * a))}.`],
            `f(${a}) ${eq(a + k / a)} et f′(${a}) ${eq(1 - k / (a * a))}.`),
          'La dérivée de 1/x est −1/x², puis on multiplie par le coefficient.')
      }),
      T({ // Lire les asymptotes
        base: {b: 3, k: 4, c: 0},
        params: r => ({b: r.nonZero(1, 9), k: r.nonZero(1, 9), c: r.int(-4, 4)}),
        difficulty: ({b, k, c}) => score({steps: 2, values: [b, k, c]}),
        verify: ({b, c}, v) => v[0] === c && v[1] === b,
        build: ({b, k, c}) => {
          const den = c === 0 ? 'x' : `(x ${c > 0 ? M : '+'} ${Math.abs(c)})`, expr = `${fr(b)} ${k > 0 ? '+' : M} ${Math.abs(k)}/${den}`;
          return item('Lire les asymptotes', `f(x) = ${expr} pour x ≠ ${fr(c)}. Donne les équations des asymptotes x = A et y = B à la courbe de f.`,
            [Q('A (asymptote verticale)', c), Q('B (asymptote horizontale)', b)],
            C('le quotient devient très grand en valeur absolue quand son dénominateur s’annule (asymptote verticale) ; il se rapproche de 0 quand x devient très grand en valeur absolue (asymptote horizontale).',
              [`Le dénominateur s’annule pour x = ${fr(c)} : la droite x = ${fr(c)} est asymptote verticale.`, `Quand x devient très grand en valeur absolue, ${Math.abs(k)}/${den} se rapproche de 0 et f(x) de ${fr(b)}.`],
              `les asymptotes sont x = ${fr(c)} et y = ${fr(b)}.`),
            'Sépare le terme constant de la fraction qui tend vers zéro pour les grandes valeurs absolues de x.');
        }
      }),
      T({ // Minimiser un coût moyen
        base: {m: 3, b: 6},
        params: r => ({m: r.int(2, 12), b: r.int(1, 30)}),
        difficulty: ({m, b}) => score({steps: 4, values: [m * m, b, m, 2 * m + b]}),
        verify: ({m, b}, v) => { const Cx = x => x + m * m / x + b; return close(1 - m * m / (v[0] * v[0]), 0) && close(v[1], Cx(v[0])) && Cx(v[0] - 0.5) > v[1] && Cx(v[0] + 0.5) > v[1]; },
        build: ({m, b}) => item('Minimiser un coût moyen', `Modèle fictif : le coût moyen est C(x) = x + ${m * m}/x + ${b}, pour x > 0. Cherche son minimum.`,
          [Q('Valeur de x au minimum', m), Q('Coût minimal', 2 * m + b)],
          C('on calcule C′(x), on met au même dénominateur, on étudie son signe sur ]0 ; +∞[ puis on dresse le tableau de variations.',
            [`C′(x) = 1 − ${m * m}/x² = (x² − ${m * m})/x² = (x − ${m})(x + ${m})/x². Sur ]0 ; +∞[, x + ${m} > 0 et x² > 0 : C′(x) a le signe de x − ${m}.`,
             `C(${m}) = ${m} + ${m * m}/${m} + ${b} = ${2 * m + b}.`],
            `C est décroissante sur ]0 ; ${m}] puis croissante : le coût minimal vaut ${2 * m + b}, atteint pour x = ${m}.`,
            variationTable('Signe de C′(x) et variations de C', 'C', ['0', m, '+∞'], [null, 2 * m + b, null], [-1, 1])),
          'Dérive, mets au même dénominateur et étudie le signe sur le domaine positif.')
      }),
      T({ // Tangente à une fonction inverse
        base: {a: 3, k: 18},
        params: r => ({a: r.int(1, 5), k: r.int(1, 30)}),
        difficulty: ({a, k}) => score({steps: 3, values: [a, k, k / a, -k / (a * a), 2 * k / a]}),
        verify: ({a, k}, v) => close(v[0], -k / (a * a)) && close(v[0] * a + v[1], k / a),
        build: ({a, k}) => { const m = -k / (a * a), p = 2 * k / a; return item('Tangente à une fonction inverse', `f(x) = ${k}/x pour x > 0. Écris la tangente à la courbe de f en x = ${a} sous la forme y = mx + p.`,
          [Q('m', m), Q('p', p)],
          C('la tangente en a a pour équation y = f′(a)(x − a) + f(a), avec f′(x) = −k/x².',
            [`m = f′(${a}) = −${k}/${a * a} ${eq(m)} ; f(${a}) = ${k}/${a} ${eq(k / a)}.`, `p = f(${a}) − m × ${a} = ${k}/${a} + ${k}/${a} = ${2 * k}/${a} ${eq(p)}.`],
            `la tangente a pour équation y ${Number.isInteger(m) && Number.isInteger(p) ? '=' : '≈'} ${affine(r3(m), r3(p))} (valeurs exactes : m = −${k}/${a * a} et p = ${2 * k}/${a}).`),
          'Utilise y = f(a) + f′(a)(x − a), puis développe.'); }
      }),
      T({ // Polynôme et inverse
        base: {a: 2, b: 3, k: 4, x: 2},
        params: r => ({a: r.int(1, 4), b: r.int(-4, 5), k: r.int(1, 12), x: r.int(1, 3)}),
        difficulty: ({a, b, k, x}) => score({steps: 4, values: [a, b, k, a * x ** 3 + b * x * x - 2 * x + k / x, 3 * a * x * x + 2 * b * x - 2 - k / (x * x)]}),
        verify: ({a, b, k, x}, v) => close(v[0], a * x ** 3 + b * x * x - 2 * x + k / x) && close(v[1], 3 * a * x * x + 2 * b * x - 2 - k / (x * x)),
        build: ({a, b, k, x}) => {
          const fx = a * x ** 3 + b * x * x - 2 * x + k / x, dx = 3 * a * x * x + 2 * b * x - 2 - k / (x * x);
          return item('Polynôme et inverse', `f(x) = ${poly([a, b, -2, 0])} + ${k}/x, avec x > 0.`,
            [Q(`f(${x})`, fx), Q(`f′(${x})`, dx)],
            C('on dérive terme à terme : (x³)′ = 3x², (x²)′ = 2x, (x)′ = 1 et (k/x)′ = −k/x².',
              [`f′(x) = ${poly([3 * a, 2 * b, -2])} − ${k}/x².`, `f(${x}) ${eq(fx)} et f′(${x}) ${eq(dx)}.`],
              `f(${x}) ${eq(fx)} et f′(${x}) ${eq(dx)}.`),
            'Dérive chaque terme séparément avant l’application numérique.');
        }
      })
    ],
    't-statistiques': [
      T({ // Point moyen
        base: {a: 3, b: 6, s: 1, pat: 0},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-5, 20), s: r.int(0, 5), pat: r.int(0, 3)}),
        difficulty: ({a, b, s}) => score({steps: 3, values: [s + 1, s + 4, a * (s + 4) + b + 2, s + 2.5, a * (s + 2.5) + b]}),
        verify: ({a, b, s, pat}, v) => { const x = [1, 2, 3, 4].map(i => s + i), e = PATTERNS[pat], y = x.map((t, i) => a * t + b + e[i]); return close(v[0], (x[0] + x[1] + x[2] + x[3]) / 4) && close(v[1], (y[0] + y[1] + y[2] + y[3]) / 4); },
        build: ({a, b, s, pat}) => {
          const x = [1, 2, 3, 4].map(i => s + i), e = PATTERNS[pat], y = x.map((t, i) => a * t + b + e[i]);
          return item('Point moyen', `Quatre observations fictives : ${x.map((t, i) => `(${t} ; ${fr(y[i])})`).join(', ')}. Donne les coordonnées du point moyen G.`,
            [Q('Abscisse moyenne', s + 2.5), Q('Ordonnée moyenne', a * (s + 2.5) + b)],
            C('le point moyen a pour coordonnées la moyenne des abscisses et la moyenne des ordonnées, calculées séparément.',
              [`x̄ = (${x.join(' + ')})/4 = ${fr(s + 2.5)} ; ȳ = (${addAll(y)})/4 = ${fr(a * (s + 2.5) + b)}.`],
              `G(${fr(s + 2.5)} ; ${fr(a * (s + 2.5) + b)}).`),
            'Ne mélange pas les deux colonnes de données.');
        }
      }),
      T({ // Droite passant par deux points moyens
        base: {a: 3, b: 4, x1: 2, dx: 2},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-9, 12), x1: r.int(1, 4), dx: r.int(2, 5)}),
        difficulty: ({a, b, x1, dx}) => score({steps: 3, values: [x1, x1 + dx, a * x1 + b, a * (x1 + dx) + b, a, b]}),
        verify: ({a, b, x1, dx}, v) => v[0] * x1 + v[1] === a * x1 + b && v[0] * (x1 + dx) + v[1] === a * (x1 + dx) + b,
        build: ({a, b, x1, dx}) => { const x2 = x1 + dx, y1 = a * x1 + b, y2 = a * x2 + b; return item('Droite passant par deux points moyens', `Une droite d’ajustement passe par G₁(${x1} ; ${fr(y1)}) et G₂(${x2} ; ${fr(y2)}). Écris son équation y = ax + b.`,
          [Q('a', a), Q('b', b)],
          C('le coefficient directeur vaut (y₂ − y₁)/(x₂ − x₁) ; on obtient b en utilisant l’un des deux points.',
            [`a = (${diff(y2, y1)})/(${x2} − ${x1}) = ${fr(y2 - y1)}/${dx} = ${fr(a)}.`, `b = ${fr(y1)} − ${pa(a)} × ${x1} = ${fr(b)}.`],
            `la droite a pour équation y = ${affine(a, b)}.`),
          'Calcule une pente, puis utilise un des points pour retrouver l’ordonnée à l’origine.'); }
      }),
      T({ // Prévoir et qualifier
        base: {a: 3, b: 11, inside: 0, x: 12},
        params: r => { const inside = r.int(0, 1); return {a: r.int(2, 8), b: r.int(5, 30), inside, x: inside ? r.int(2, 9) : r.pick([0, 11, 12, 13, 15])}; },
        difficulty: ({a, b, x}) => score({steps: 2, values: [a, b, x, a * x + b]}),
        verify: ({a, b, x}, v) => v[0] === a * x + b && v[1] === (x >= 1 && x <= 10 ? 'interpolation' : 'extrapolation'),
        build: ({a, b, x}) => { const kind = x >= 1 && x <= 10 ? 'interpolation' : 'extrapolation'; return item('Prévoir et qualifier', `Le modèle y = ${affine(a, b)} a été ajusté pour des valeurs de x de 1 à 10. On l’utilise en x = ${x}.`,
          [Q('Valeur estimée', a * x + b), choice('Nature de l’estimation', kind, ['interpolation', 'extrapolation'])],
          C('on remplace x dans le modèle ; une estimation dans la plage observée est une interpolation, en dehors c’est une extrapolation.',
            [`y = ${a} × ${x} + ${b} = ${a * x + b}.`],
            `l’estimation vaut ${a * x + b} ; c’est une ${kind}${kind === 'extrapolation' ? ', plus fragile car hors de la plage observée' : ''}. Une estimation ne prouve pas la valeur réelle.`),
          'Compare l’abscisse demandée à l’intervalle des observations.'); }
      }),
      T({ // Changement de variable carré
        base: {a: 3, b: 4, x: 3},
        params: r => ({a: r.nonZero(1, 6), b: r.int(-5, 15), x: r.int(2, 6)}),
        difficulty: ({a, b, x}) => score({steps: 2, values: [a, b, x * x, a * x * x + b]}),
        verify: ({a, b, x}, v) => v[0] === x * x && v[1] === a * v[0] + b,
        build: ({a, b, x}) => item('Changement de variable carré', `On pose z = x². Dans le nouveau repère, le modèle ajusté est y = ${affine(a, b, 'z')}. On prend x = ${x}.`,
          [Q('z', x * x), Q('y estimé', a * x * x + b)],
          C('on calcule d’abord la nouvelle variable z, puis on applique la droite d’ajustement en z.',
            [`z = ${x}² = ${x * x} ; y = ${fr(a)} × ${x * x}${sg(b)} = ${fr(a * x * x + b)}.`],
            `y ≈ ${fr(a * x * x + b)} ; dans les variables initiales, le modèle est y = ${poly([a, 0, b])}, qui n’est pas une droite.`),
          'Calcule d’abord la nouvelle variable, puis applique la droite ajustée.')
      }),
      T({ // Ajustement logarithmique
        base: {a: 0.2, b: 2, x: 3},
        params: r => ({a: r.pick([0.05, 0.1, 0.2, 0.3, -0.1, -0.2]), b: r.pick([1, 2, 3]), x: r.int(1, 5)}),
        difficulty: ({a, b, x}) => score({steps: 3, values: [a, b, x, 10 ** (a * x + b), 10 ** a]}),
        verify: ({a, b, x}, v) => close(Math.log10(v[0]), a * x + b) && close(Math.log10(v[1]), a),
        build: ({a, b, x}) => { const z = F(a * x + b, 6); return item('Ajustement logarithmique', `Pour y > 0, on pose z = log(y). La droite ajustée est z = ${affine(a, b)}.`,
          [Q(`y estimé pour x = ${x}`, 10 ** z), Q('Coefficient multiplicateur quand x augmente de 1', 10 ** a)],
          C('on calcule z, puis on revient à y avec y = 10<sup>z</sup> ; le modèle initial est exponentiel : y = 10<sup>b</sup> × (10<sup>a</sup>)<sup>x</sup>.',
            [`z = ${fr(a)} × ${x} + ${b} = ${fr(z)}, donc y = 10<sup>${fr(z)}</sup> ≈ ${fr(r3(10 ** z))}.`, `Quand x augmente de 1, y est multiplié par 10<sup>${fr(a)}</sup> ≈ ${fr(r3(10 ** a))}.`],
            `y ≈ ${fr(r3(10 ** z))} pour x = ${x} ; le coefficient multiplicateur est d’environ ${fr(r3(10 ** a))}.`),
          'Le retour de log(y) à y se fait par une puissance de dix, pas par une multiplication par dix.'); }
      }),
      T({ // Comparer deux ajustements
        base: {a: 3, b: 4, e: 2},
        params: r => ({a: r.nonZero(1, 5), b: r.int(-5, 10), e: r.nonZero(1, 4)}),
        difficulty: ({a, b, e}) => score({steps: 4, values: [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e, 6 * e * e, 9 * e * e]}),
        verify: ({a, b, e}, v) => { const y = [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e], ss = c => y.reduce((s, t, i) => s + (t - (a * (i + 1) + c)) ** 2, 0); return v[0] === ss(b) && v[1] === ss(b + e); },
        build: ({a, b, e}) => {
          const y = [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e], rA = [e, -2 * e, e], rB = [0, -3 * e, 0];
          return item('Comparer deux ajustements', `Données : (1 ; ${fr(y[0])}), (2 ; ${fr(y[1])}), (3 ; ${fr(y[2])}). Modèle A : y = ${affine(a, b)}. Modèle B : y = ${affine(a, b + e)}. Calcule la somme des carrés des écarts pour chacun.`,
            [Q('Somme pour A', 6 * e * e), Q('Somme pour B', 9 * e * e)],
            C('pour chaque point, on calcule l’écart vertical « observé − modèle », on l’élève au carré, puis on additionne ; le meilleur des deux modèles est celui dont la somme est la plus petite.',
              [`Écarts pour A : ${rA.map(fr).join(' ; ')}, somme des carrés : ${rA.map(t => t * t).join(' + ')} = ${6 * e * e}.`, `Écarts pour B : ${rB.map(fr).join(' ; ')}, somme des carrés : ${9 * e * e}.`],
              `selon ce critère, le modèle A est préférable (${6 * e * e} < ${9 * e * e}), parmi ces deux candidats seulement.`),
            'Calcule les écarts verticaux, élève chacun au carré, puis additionne.');
        }
      })
    ],
    't-conditionnelles': [
      T({ // Choisir la population de référence
        base: {n: 105, a: 41, b: 11, t: 31},
        params: r => { const n = r.int(80, 200), a = r.int(20, Math.floor(n / 2)), b = r.int(5, a - 5); return {n, a, b, t: r.int(b + 5, n - (a - b) - 5)}; },
        difficulty: ({n, a, b, t}) => score({steps: 2, values: [n, a, b, t, b / a, t / n]}),
        verify: ({n, a, b, t}, v) => close(v[0], b / a) && close(v[1], t / n),
        build: ({n, a, b, t}) => item('Choisir la population de référence', `Une enquête fictive porte sur ${n} clients. L’événement A (« être abonné ») concerne ${a} clients, dont ${b} sont satisfaits. Au total, ${t} clients sont satisfaits (événement B).`,
          [Q('P(B | A)', b / a), Q('P(B)', t / n)],
          C('P<sub>A</sub>(B), aussi notée P(B | A), est la probabilité de B sachant A : la population de référence est celle de A, donc le dénominateur est l’effectif de A ; pour P(B), c’est l’effectif total.',
            [`P<sub>A</sub>(B) = ${b}/${a} ${eq(b / a)} ; P(B) = ${t}/${n} ${eq(t / n)}.`],
            `parmi les abonnés, la proportion de satisfaits est d’environ ${fr(r3(b / a))} ; sur toute la population, elle est d’environ ${fr(r3(t / n))}.`),
          'Après « sachant A », le dénominateur est l’effectif de A.')
      }),
      T({ // Deux branches et probabilités totales
        base: {a: 0.3, p: 0.1, q: 0.2},
        params: r => ({a: tenth(r), p: tenth(r), q: tenth(r)}),
        accept: ({p, q}) => p !== q,
        difficulty: ({a, p, q}) => score({steps: 3, values: [a, p, q, a * p, a * p + (1 - a) * q]}),
        verify: ({a, p, q}, v) => close(v[0], a * p) && close(v[1], v[0] + (1 - a) * q),
        build: ({a, p, q}) => { const j = F(a * p, 6), t = F(a * p + (1 - a) * q, 6); return item('Deux branches et probabilités totales', `P(A) = ${fr(a)}, P<sub>A</sub>(D) = ${fr(p)} et P<sub>non A</sub>(D) = ${fr(q)}. A et non A forment une partition.`,
          [Q('P(A ∩ D)', j), Q('P(D)', t)],
          C('on multiplie les probabilités le long d’un chemin de l’arbre ; la formule des probabilités totales additionne les chemins qui mènent à D.',
            [`P(A ∩ D) = ${fr(a)} × ${fr(p)} = ${fr(j)}.`, `P(D) = ${fr(a)} × ${fr(p)} + ${fr(1 - a)} × ${fr(q)} = ${fr(j)} + ${fr(F((1 - a) * q, 6))} = ${fr(t)}.`],
            `P(A ∩ D) = ${fr(j)} et P(D) = ${fr(t)}.`),
          'Multiplie le long de chaque chemin, puis additionne les chemins menant à D.'); }
      }),
      T({ // Partition en trois groupes
        base: {a: 0.2, b: 0.2, pa: 0.1, pb: 0.2, pc: 0.3},
        params: r => ({a: r.int(1, 5) / 10, b: r.int(1, 4) / 10, pa: tenth(r), pb: tenth(r), pc: tenth(r)}),
        accept: ({a, b, pa, pb, pc}) => a + b < 0.95 && new Set([pa, pb, pc]).size === 3,
        difficulty: ({a, b, pa, pb, pc}) => score({steps: 4, values: [a, b, 1 - a - b, pa, pb, pc, a * pa + b * pb + (1 - a - b) * pc]}),
        verify: ({a, b, pa, pb, pc}, v) => close(v[0], 1 - a - b) && close(v[1], a * pa + b * pb + v[0] * pc),
        build: ({a, b, pa, pb, pc}) => { const c = F(1 - a - b, 6), t = F(a * pa + b * pb + c * pc, 6); return item('Partition en trois groupes', `A, B et C forment une partition : P(A) = ${fr(a)} et P(B) = ${fr(b)}. Les probabilités de l’événement D dans A, B et C sont respectivement ${fr(pa)} ; ${fr(pb)} ; ${fr(pc)}.`,
          [Q('P(C)', c), Q('P(D)', t)],
          C('les probabilités des groupes d’une partition ont pour somme 1 ; la formule des probabilités totales pondère chaque probabilité conditionnelle par le poids de son groupe.',
            [`P(C) = 1 − ${fr(a)} − ${fr(b)} = ${fr(c)}.`, `P(D) = ${fr(a)} × ${fr(pa)} + ${fr(b)} × ${fr(pb)} + ${fr(c)} × ${fr(pc)} = ${fr(t)}.`],
            `P(C) = ${fr(c)} et P(D) = ${fr(t)} ; ce n’est pas la moyenne simple des trois probabilités.`),
          'Vérifie que les poids des groupes totalisent 1. La moyenne des taux doit être pondérée.'); }
      }),
      T({ // Inverser une condition
        base: {a: 0.3, p: 0.8, q: 0.1},
        params: r => ({a: tenth(r), p: tenth(r), q: tenth(r)}),
        accept: ({p, q}) => p !== q,
        difficulty: ({a, p, q}) => { const t = a * p + (1 - a) * q; return score({steps: 4, values: [a, p, q, t, a * p / t]}); },
        verify: ({a, p, q}, v) => close(v[0], a * p + (1 - a) * q) && close(v[1], a * p / v[0]),
        build: ({a, p, q}) => { const j = F(a * p, 6), t = F(a * p + (1 - a) * q, 6); return item('Inverser une condition', `P(A) = ${fr(a)}, P<sub>A</sub>(B) = ${fr(p)} et P<sub>non A</sub>(B) = ${fr(q)}.`,
          [Q('P(B)', t), Q('P(A | B)', j / t)],
          C('on calcule P(B) avec la formule des probabilités totales, puis on inverse le conditionnement : P<sub>B</sub>(A) = P(A ∩ B)/P(B).',
            [`P(B) = ${fr(a)} × ${fr(p)} + ${fr(1 - a)} × ${fr(q)} = ${fr(t)}.`, `P<sub>B</sub>(A) = ${fr(j)}/${fr(t)} ${eq(j / t)}.`],
            `P(B) = ${fr(t)} et P<sub>B</sub>(A) ${eq(j / t)} : ce n’est pas P<sub>A</sub>(B) = ${fr(p)}.`),
          'Calcule la probabilité totale avant de changer la condition.'); }
      }),
      T({ // Vérifier une indépendance
        base: {a: 0.3, b: 0.4, ind: 0, d: -0.06},
        params: r => { const ind = r.int(0, 1); return {a: r.int(2, 7) / 10, b: r.int(2, 7) / 10, ind, d: ind ? 0 : r.pick([-0.06, -0.04, -0.02, 0.02, 0.04, 0.06])}; },
        accept: ({a, b, d}) => { const j = F(a * b + d, 6); return j > Math.max(0, a + b - 1) && j < Math.min(a, b); },
        difficulty: ({a, b}) => score({steps: 2, values: [a, b, a * b]}),
        verify: ({a, b, d}, v) => close(v[0], a * b) && v[1] === (d === 0 ? 'oui' : 'non'),
        build: ({a, b, ind, d}) => { const j = F(a * b + d, 6); return item('Vérifier une indépendance', `P(A) = ${fr(a)}, P(B) = ${fr(b)} et P(A ∩ B) = ${fr(j)}.`,
          [Q('P(A) × P(B)', a * b), choice('A et B sont-ils indépendants ?', ind ? 'oui' : 'non', ['oui', 'non'])],
          C('A et B sont indépendants si et seulement si P(A ∩ B) = P(A) × P(B).',
            [`P(A) × P(B) = ${fr(a)} × ${fr(b)} = ${fr(F(a * b, 6))}, ${ind ? 'égal à' : 'différent de'} P(A ∩ B) = ${fr(j)}.`],
            `A et B ${ind ? 'sont' : 'ne sont pas'} indépendants. « Indépendants » ne veut pas dire « incompatibles ».`),
          'Compare l’intersection au produit ; « indépendant » ne signifie pas « incompatible ».'); }
      }),
      T({ // Interpréter un contrôle de qualité
        base: {d: 0.02, se: 0.9, fp: 0.1},
        params: r => ({d: r.pick([0.01, 0.02, 0.05, 0.1]), se: r.pick([0.8, 0.9, 0.95, 0.99]), fp: r.pick([0.02, 0.05, 0.1])}),
        difficulty: ({d, se, fp}) => score({steps: 4, values: [d, se, fp, d * se + (1 - d) * fp, d * se / (d * se + (1 - d) * fp)]}),
        verify: ({d, se, fp}, v) => close(v[0], d * se + (1 - d) * fp) && close(v[1], d * se / v[0]),
        build: ({d, se, fp}) => { const j = F(d * se, 6), t = F(d * se + (1 - d) * fp, 6); return item('Interpréter un contrôle de qualité', `Dans un modèle fictif, ${fr(100 * d)} % des articles sont défectueux (D). Le contrôle signale (S) ${fr(100 * se)} % des articles défectueux et ${fr(100 * fp)} % des articles non défectueux.`,
          [Q('P(S)', t), Q('P(D | S)', j / t)],
          C('probabilités totales pour P(S), puis inversion du conditionnement : P<sub>S</sub>(D) = P(D ∩ S)/P(S).',
            [`P(S) = ${fr(d)} × ${fr(se)} + ${fr(1 - d)} × ${fr(fp)} = ${fr(t)}.`, `P<sub>S</sub>(D) = ${fr(j)}/${fr(t)} ${eq(j / t)}.`],
            `parmi les articles signalés, la proportion de défectueux est d’environ ${fr(r3(j / t))} : elle dépend aussi de la proportion initiale de défauts, pas seulement du taux de détection.`),
          'Un taux de détection n’est pas la probabilité d’un défaut sachant un signal.'); }
      })
    ],
    't-binomiale': [
      T({ // Identifier une loi binomiale
        base: {ctx: 0, n: 5, p: 0.2},
        params: r => ({ctx: r.int(0, 2), n: r.int(4, 20), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 2, values: [n, p, n * p]}),
        verify: ({n, p}, v) => v[0] === n && close(v[1], p) && close(v[2], v[0] * v[1]),
        build: ({ctx, n, p}) => {
          const k = [`On répète ${n} essais indépendants, de même probabilité de succès ${fr(p)}. X compte les succès.`,
            `Un joueur tire ${n} fois au but ; chaque tir est réussi avec la probabilité ${fr(p)}, indépendamment des autres. X compte les tirs réussis.`,
            `On prélève ${n} pièces dans une très grande production ; chacune est défectueuse avec la probabilité ${fr(p)}, indépendamment des autres. X compte les pièces défectueuses.`][ctx];
          return item('Identifier une loi binomiale', k, [Q('n', n), Q('p', p), Q('E(X)', n * p)],
            C('X compte les succès dans n épreuves de Bernoulli identiques et indépendantes : X suit la loi binomiale B(n ; p), d’espérance np.',
              [`n = ${n}, p = ${fr(p)} ; E(X) = ${n} × ${fr(p)} = ${fr(F(n * p, 6))}.`],
              `X suit B(${n} ; ${fr(p)}) et E(X) = ${fr(F(n * p, 6))} : c’est le nombre moyen de succès sur un grand nombre de répétitions de l’expérience.`),
            'Vérifie les trois conditions : nombre fixé, indépendance, probabilité constante.');
        }
      }),
      T({ // Triangle de Pascal
        base: {n: 6, k: 3},
        params: r => { const n = r.int(4, 10); return {n, k: r.int(1, n - 1)}; },
        difficulty: ({n, k}) => score({steps: 3, values: [n, k]}),
        verify: ({n, k}, v) => v[0] === binom(n - 1, k - 1) + binom(n - 1, k) && v[1] === Array.from({length: n + 1}, (_, j) => binom(n, j)).reduce((a, b) => a + b, 0),
        build: ({n, k}) => {
          const row = Array.from({length: n + 1}, (_, j) => binom(n, j));
          return item('Triangle de Pascal', `Dans la ligne n = ${n} du triangle de Pascal (la première ligne est n = 0), cherche C(${n}, ${k}) et la somme des coefficients de cette ligne.`,
            [Q(`C(${n}, ${k})`, binom(n, k)), Q('Somme de la ligne', 2 ** n)],
            C('chaque coefficient intérieur est la somme des deux coefficients situés au-dessus de lui ; la ligne n compte les chemins à n épreuves et sa somme vaut 2<sup>n</sup>.',
              [`Ligne ${n} : ${row.join(' ; ')} (positions numérotées à partir de 0).`, `C(${n}, ${k}) = C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${binom(n - 1, k - 1)} + ${binom(n - 1, k)} = ${binom(n, k)}.`],
              `C(${n}, ${k}) = ${binom(n, k)} et la somme de la ligne vaut 2<sup>${n}</sup> = ${2 ** n}.`),
            'Construis les lignes successives ; les positions sont numérotées à partir de 0.');
        }
      }),
      T({ // Aucun succès ou tous les succès
        base: {n: 4, p: 0.3},
        params: r => ({n: r.int(3, 8), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 2, values: [n, p, (1 - p) ** n, p ** n]}),
        verify: ({n, p}, v) => close(v[0], mass(n, p, 0)) && close(v[1], mass(n, p, n)),
        build: ({n, p}) => item('Aucun succès ou tous les succès', `X suit la loi binomiale B(${n} ; ${fr(p)}).`,
          [Q('P(X = 0)', (1 - p) ** n), Q(`P(X = ${n})`, p ** n)],
          C('« aucun succès » et « tous les succès » correspondent chacun à un seul chemin de l’arbre : P(X = 0) = (1 − p)<sup>n</sup> et P(X = n) = p<sup>n</sup>.',
            [`P(X = 0) = ${fr(1 - p)}<sup>${n}</sup> ${eq((1 - p) ** n)} ; P(X = ${n}) = ${fr(p)}<sup>${n}</sup> ${eq(p ** n)}.`],
            `P(X = 0) ${eq((1 - p) ** n)} et P(X = ${n}) ${eq(p ** n)}.`),
          'Ne multiplie pas par n pour un événement qui correspond à un seul chemin.')
      }),
      T({ // Un succès ou un seul échec
        base: {n: 5, p: 0.3},
        params: r => ({n: r.int(4, 8), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 3, values: [n, p, mass(n, p, 1), mass(n, p, n - 1)]}),
        verify: ({n, p}, v) => close(v[0], n * p * (1 - p) ** (n - 1)) && close(v[1], n * p ** (n - 1) * (1 - p)),
        build: ({n, p}) => item('Un succès ou un seul échec', `X suit la loi binomiale B(${n} ; ${fr(p)}).`,
          [Q('P(X = 1)', mass(n, p, 1)), Q(`P(X = ${n - 1})`, mass(n, p, n - 1))],
          C('un seul succès (ou un seul échec) peut être placé à n positions : il y a n chemins de même probabilité.',
            [`P(X = 1) = ${n} × ${fr(p)} × ${fr(1 - p)}<sup>${n - 1}</sup> ${eq(mass(n, p, 1))}.`, `P(X = ${n - 1}) = ${n} × ${fr(p)}<sup>${n - 1}</sup> × ${fr(1 - p)} ${eq(mass(n, p, n - 1))}.`],
            `P(X = 1) ${eq(mass(n, p, 1))} et P(X = ${n - 1}) ${eq(mass(n, p, n - 1))}.`),
          'Choisis la place du succès unique ou de l’échec unique : il y a n choix.')
      }),
      T({ // Exactement k et au moins un
        base: {n: 6, k: 3, p: 0.3},
        params: r => { const n = r.int(5, 10); return {n, k: r.int(2, n - 2), p: tenth(r)}; },
        difficulty: ({n, k, p}) => score({steps: 4, values: [n, k, binom(n, k), mass(n, p, k), 1 - (1 - p) ** n]}),
        verify: ({n, k, p}, v) => close(v[0], binom(n, k) * p ** k * (1 - p) ** (n - k)) && close(v[1], 1 - mass(n, p, 0)),
        build: ({n, k, p}) => item('Exactement k et au moins un', `X suit la loi binomiale B(${n} ; ${fr(p)}).`,
          [Q(`P(X = ${k})`, mass(n, p, k)), Q('P(X ≥ 1)', 1 - (1 - p) ** n)],
          C('P(X = k) = C(n, k) p<sup>k</sup>(1 − p)<sup>n−k</sup> ; « au moins un » est l’événement contraire de « aucun ».',
            [`P(X = ${k}) = ${binom(n, k)} × ${fr(p)}<sup>${k}</sup> × ${fr(1 - p)}<sup>${n - k}</sup> ${eq(mass(n, p, k))}.`, `P(X ≥ 1) = 1 − ${fr(1 - p)}<sup>${n}</sup> ${eq(1 - (1 - p) ** n)}.`],
            `P(X = ${k}) ${eq(mass(n, p, k))} et P(X ≥ 1) ${eq(1 - (1 - p) ** n)}.`),
          'Pour exactement k, compte les chemins. Pour au moins un, passe par l’événement contraire.')
      }),
      T({ // Probabilités cumulées
        base: {n: 5, k: 2, p: 0.3},
        params: r => { const n = r.int(4, 8); return {n, k: r.int(1, n - 1), p: tenth(r)}; },
        difficulty: ({n, k, p}) => score({steps: 4, values: [n, k, cumulative(n, p, k), 1 - cumulative(n, p, k - 1)]}),
        verify: ({n, k, p}, v) => close(v[0], cumulative(n, p, k)) && close(v[1], Array.from({length: n - k + 1}, (_, j) => mass(n, p, k + j)).reduce((a, b) => a + b, 0)),
        build: ({n, k, p}) => item('Probabilités cumulées', `X suit la loi binomiale B(${n} ; ${fr(p)}). Calcule « au plus ${k} » et « au moins ${k} ».`,
          [Q(`P(X ≤ ${k})`, cumulative(n, p, k)), Q(`P(X ≥ ${k})`, 1 - cumulative(n, p, k - 1))],
          C(`« au plus ${k} » regroupe les valeurs de 0 à ${k} ; « au moins ${k} » est le contraire de « au plus ${k - 1} ». La valeur ${k} est incluse dans les deux événements.`,
            [`P(X ≤ ${k}) = P(X = 0) + … + P(X = ${k}) ${eq(cumulative(n, p, k))}.`, `P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1}) ${eq(1 - cumulative(n, p, k - 1))}.`],
            `P(X ≤ ${k}) ${eq(cumulative(n, p, k))} et P(X ≥ ${k}) ${eq(1 - cumulative(n, p, k - 1))}.`),
          'Le contraire de « X au moins k » est « X au plus k − 1 », et non « X au plus k ».')
      })
    ],
    't-variables': [
      T({ // Loi discrète et espérance
        base: {a: 3, c: 2, pi: 0},
        params: r => ({a: r.int(2, 20), c: r.int(2, 3), pi: r.int(0, 4)}),
        difficulty: ({a, c, pi}) => { const p = LAWS[pi]; return score({steps: 3, values: [-a, c * a, ...p, -a * p[0] + c * a * p[2], p[1] + p[2]]}); },
        verify: ({a, c, pi}, v) => { const p = LAWS[pi]; return close(v[0], -a * p[0] + 0 * p[1] + c * a * p[2]) && close(v[1], 1 - p[0]); },
        build: ({a, c, pi}) => {
          const p = LAWS[pi], e = F(-a * p[0] + c * a * p[2], 6);
          return item('Loi discrète et espérance', `X prend les valeurs ${M}${a}, 0 et ${c * a}, avec les probabilités ${p.map(fr).join(' ; ')}.`,
            [Q('E(X)', e), Q('P(X ≥ 0)', p[1] + p[2])],
            C('l’espérance est la moyenne des valeurs pondérée par leurs probabilités ; une probabilité cumulée est une somme de probabilités.',
              [`E(X) = (${M}${a}) × ${fr(p[0])} + ${c * a} × ${fr(p[2])} = ${fr(e)} (la valeur 0 n’ajoute rien).`, `P(X ≥ 0) = ${fr(p[1])} + ${fr(p[2])} = ${fr(F(p[1] + p[2], 6))}.`],
              `E(X) = ${fr(e)} et P(X ≥ 0) = ${fr(F(p[1] + p[2], 6))}.`),
            'L’espérance est une moyenne pondérée ; une probabilité cumulée est une somme de probabilités.');
        }
      }),
      T({ // Gain brut et gain net
        base: {v: 11, cost: 3, p: 0.3},
        params: r => ({v: r.int(5, 30), cost: r.int(1, 6), p: tenth(r)}),
        accept: ({v, cost, p}) => v > cost && F(p * v - cost, 6) !== 0,
        difficulty: ({v, cost, p}) => score({steps: 3, values: [v, cost, p, v - cost, p * v - cost]}),
        verify: ({v, cost, p}, v2) => v2[0] === v - cost && close(v2[1], p * v2[0] + (1 - p) * -cost),
        build: ({v, cost, p}) => { const e = F(p * v - cost, 6); return item('Gain brut et gain net', `Jeu fictif : on paie ${eur(cost)} ; on reçoit ${eur(v)} avec la probabilité ${fr(p)}, sinon rien. X est le gain net.`,
          [Q('Gain net en cas de succès, en €', v - cost), Q('E(X), en €', e)],
          C('le gain net retire la participation dans chaque issue, y compris en cas de succès ; l’espérance pondère les gains nets par leurs probabilités.',
            [`Gain net : ${v} − ${cost} = ${v - cost} en cas de succès, ${M}${cost} sinon.`, `E(X) = ${fr(p)} × ${v - cost} + ${fr(1 - p)} × (${M}${cost}) = ${fr(e)}.`],
            `E(X) = ${eur(e)} : en moyenne, le joueur ${e > 0 ? 'gagne' : 'perd'} ${eur(Math.abs(e))} par partie ; ce n’est pas une promesse pour une partie.`),
          'Retire la participation dans chacune des issues, y compris lors d’un gain.'); }
      }),
      T({ // Compléter une loi
        base: {p: 0.3, q: 0.3, x2: 2, x3: 5},
        params: r => ({p: r.int(1, 5) / 10, q: r.int(1, 5) / 10, x2: r.int(1, 4), x3: r.int(5, 10)}),
        accept: ({p, q}) => p + q < 0.95,
        difficulty: ({p, q, x2, x3}) => score({steps: 3, values: [p, q, 1 - p - q, x2, x3, x2 * q + x3 * (1 - p - q)]}),
        verify: ({p, q, x2, x3}, v) => close(p + q + v[0], 1) && close(v[1], x2 * q + x3 * v[0]),
        build: ({p, q, x2, x3}) => { const rr = F(1 - p - q, 6), e = F(x2 * q + x3 * rr, 6); return item('Compléter une loi', `X prend les valeurs 0, ${x2} et ${x3}. Les deux premières probabilités sont ${fr(p)} et ${fr(q)}.`,
          [Q(`Probabilité de ${x3}`, rr), Q('E(X)', e)],
          C('les probabilités d’une loi sont positives et ont pour somme 1 ; on calcule ensuite l’espérance.',
            [`P(X = ${x3}) = 1 − ${fr(p)} − ${fr(q)} = ${fr(rr)}.`, `E(X) = ${x2} × ${fr(q)} + ${x3} × ${fr(rr)} = ${fr(e)}.`],
            `P(X = ${x3}) = ${fr(rr)} et E(X) = ${fr(e)}.`),
          'Contrôle d’abord que toutes les probabilités sont positives et de somme 1.'); }
      }),
      T({ // Nombre de succès et fréquence
        base: {n: 6, p: 0.3},
        params: r => ({n: r.int(5, 30), p: tenth(r)}),
        difficulty: ({n, p}) => score({steps: 2, values: [n, p, n * p]}),
        verify: ({n, p}, v) => close(v[0], n * p) && close(v[1], v[0] / n),
        build: ({n, p}) => item('Nombre de succès et fréquence', `X suit la loi binomiale B(${n} ; ${fr(p)}). La fréquence de succès est F = X/${n}.`,
          [Q('E(X)', n * p), Q('E(F)', p)],
          C('E(X) = np ; diviser X par n divise aussi son espérance par n.',
            [`E(X) = ${n} × ${fr(p)} = ${fr(F(n * p, 6))} ; E(F) = E(X)/${n} = ${fr(p)}.`],
            `E(X) = ${fr(F(n * p, 6))} et E(F) = ${fr(p)} ; un échantillon ne donne pas forcément cette fréquence.`),
          'Ne confonds pas la moyenne du nombre de succès et la moyenne de la fréquence.')
      }),
      T({ // Lire plusieurs échantillons
        base: {k: 5, n: 20, pat: 0},
        params: r => ({k: r.int(3, 12), n: r.pick([20, 25, 50]), pat: r.int(0, 2)}),
        difficulty: ({k, n}) => score({steps: 3, values: [k, n, 4 * n, (k + 0.5) / n]}),
        verify: ({k, n, pat}, v) => { const l = OFFSETS[pat].map(o => k + o); return v[0] === 4 * n && close(v[1], l.reduce((a, b) => a + b, 0) / (4 * n)); },
        build: ({k, n, pat}) => { const l = OFFSETS[pat].map(o => k + o), s = l.reduce((a, b) => a + b, 0); return item('Lire plusieurs échantillons', `Quatre échantillons de ${n} essais donnent les nombres de succès : ${l.join(' ; ')}.`,
          [Q('Nombre total d’essais', 4 * n), Q('Moyenne des quatre fréquences', s / (4 * n))],
          C('on calcule une fréquence par échantillon, puis leur moyenne ; comme les tailles sont égales, c’est aussi le total des succès divisé par le total des essais.',
            [`Total des essais : 4 × ${n} = ${4 * n} ; moyenne des fréquences : (${l.join(' + ')})/(4 × ${n}) = ${s}/${4 * n} ${eq(s / (4 * n))}.`],
            `il y a ${4 * n} essais et la moyenne des fréquences ${eq(s / (4 * n))} ; N = 4 est le nombre d’échantillons et n = ${n} leur taille.`),
          'Calcule une fréquence par échantillon, puis leur moyenne ; ici les tailles sont identiques.'); }
      }),
      T({ // Distribution simulée et modèle
        base: {c0: 3, c1: 4, c2: 5, c3: 2, p: 0.4},
        params: r => ({c0: r.int(1, 30), c1: r.int(1, 30), c2: r.int(1, 30), c3: r.int(1, 30), p: r.pick([0.3, 0.4, 0.5])}),
        difficulty: ({c0, c1, c2, c3}) => { const N = c0 + c1 + c2 + c3; return score({steps: 3, values: [N, (c1 + 2 * c2 + 3 * c3) / N, 1.2]}); },
        verify: ({c0, c1, c2, c3, p}, v) => v[0] === c0 + c1 + c2 + c3 && close(v[1], (c1 + 2 * c2 + 3 * c3) / v[0]) && close(v[2], 3 * p),
        build: ({c0, c1, c2, c3, p}) => { const N = c0 + c1 + c2 + c3, m = (c1 + 2 * c2 + 3 * c3) / N; return item('Distribution simulée et modèle', `On simule X suivant la loi binomiale B(3 ; ${fr(p)}). Pour X = 0, 1, 2 et 3, les effectifs observés sont ${c0} ; ${c1} ; ${c2} ; ${c3}.`,
          [Q('Nombre de simulations', N), Q('Moyenne observée de X', m), Q('Espérance théorique', 3 * p)],
          C('la moyenne observée se calcule avec les effectifs ; l’espérance théorique avec les paramètres du modèle : E(X) = np.',
            [`N = ${c0} + ${c1} + ${c2} + ${c3} = ${N} ; moyenne : (1 × ${c1} + 2 × ${c2} + 3 × ${c3})/${N} ${eq(m)}.`, `E(X) = 3 × ${fr(p)} = ${fr(F(3 * p, 6))}.`],
            `la moyenne observée ${eq(m)} et l’espérance ${fr(F(3 * p, 6))} peuvent différer : un écart n’invalide pas automatiquement le modèle.`),
          'Pour la moyenne observée, utilise les effectifs ; pour l’espérance, utilise les paramètres du modèle.'); }
      })
    ],
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
    't-suites': ['Distingue un terme, une raison et une somme.', 'Additionne 10 + 20 + 30.', '60', 'Regroupe 10 et 30, puis ajoute 20.'],
    't-exponentielles': ['Une évolution relative constante se traduit par des multiplications.', 'Calcule 2 puissance 3.', '8', 'Multiplie trois facteurs égaux à 2.'],
    't-logarithme': ['Le logarithme décimal retrouve un exposant de dix.', 'Calcule log(100).', '2', 'Cherche k tel que 10 puissance k vaut 100.'],
    't-inverse': ['Vérifie le domaine : on ne divise jamais par zéro.', 'Calcule 1/4.', '0.25', 'Une fraction exacte ou 0,25 convient.'],
    't-statistiques': ['Repère les variables, les unités et le modèle proposé.', 'Calcule la moyenne de 2 et 4.', '3', 'Additionne les deux valeurs puis divise par deux.'],
    't-conditionnelles': ['Précise la population sur laquelle porte la probabilité.', 'Un chemin porte 0,5 puis 0,4. Quelle est sa probabilité ?', '0.2', 'Multiplie les probabilités le long du chemin.'],
    't-binomiale': ['X compte des succès parmi un nombre fixé d’essais indépendants.', 'Avec trois essais, combien de chemins ont un seul succès ?', '3', 'Place le succès en première, deuxième ou troisième position.'],
    't-variables': ['Ne confonds pas moyenne théorique et résultat observé.', 'X vaut 0 ou 10, chaque valeur avec probabilité 0,5. Calcule E(X).', '5', 'Calcule 0 fois 0,5 plus 10 fois 0,5.'],
    't-outils': ['Suis les variables ligne par ligne, sans changer l’ordre des instructions.', 'On part de s = 0 et on ajoute 3 deux fois. Que vaut s ?', '6', 'Les valeurs successives sont 0, puis 3, puis la valeur finale.']
  };
  const clean = s => V.visible(s).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim();
  for (const [slug, list] of Object.entries(models)) V.register(slug, list);
  window.TerminaleExercises = {slugs: Object.keys(models), count: 6, binom, mass, cumulative};
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
