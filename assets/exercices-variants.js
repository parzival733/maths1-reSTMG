/* Générateur de variantes à graine. Chaque modèle déclare comment tirer ses
   paramètres, les contraintes qui les rendent acceptables, son score de
   difficulté et la construction de la fiche. Énoncé, réponses et correction
   partagent les mêmes valeurs. Aucun appel réseau ni stockage. */
(() => {
  'use strict';
  const factories = new Map();
  const MAX_TRIES = 200;
  const BAND = 0.2;
  const MINUS = '−';
  const NNBSP = ' ';
  const NBSP = ' ';

  /* ---------- Hasard reproductible (mulberry32) ---------- */
  function rng(seed) {
    let state = (Number(seed) >>> 0) || 0x9e3779b9;
    const next = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = (min, max) => {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) throw new Error('Plage invalide');
      return min + Math.floor(next() * (max - min + 1));
    };
    const pick = list => {
      if (!list || !list.length) throw new Error('Liste vide');
      return list[Math.floor(next() * list.length)];
    };
    const shuffle = list => {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    return {
      next, int, pick, shuffle,
      sign: () => (next() < 0.5 ? -1 : 1),
      chance: p => next() < p,
      pickDistinct: (list, n) => {
        if (n > list.length) throw new Error('Pas assez de valeurs distinctes');
        return shuffle(list).slice(0, n);
      },
      // Entier non nul de valeur absolue comprise entre min et max.
      nonZero: (min, max) => int(min, max) * (next() < 0.5 ? -1 : 1)
    };
  }

  let fallbackCounter = 0;
  function randomSeed() {
    try {
      const c = typeof globalThis !== 'undefined' && globalThis.crypto;
      if (c && typeof c.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        c.getRandomValues(buffer);
        return buffer[0] >>> 0;
      }
    } catch (error) { /* repli ci-dessous */ }
    fallbackCounter = (fallbackCounter + 1) >>> 0;
    return (Date.now() ^ Math.imul(fallbackCounter, 0x9e3779b1)) >>> 0;
  }

  /* ---------- Écriture mathématique ---------- */
  const F = (value, digits = 4) => Number(Number(value).toFixed(digits));

  function plain(value, digits) {
    let x = F(value, digits);
    if (Object.is(x, -0)) x = 0;
    let text = Math.abs(x).toFixed(digits);
    if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
    return {negative: x < 0, text};
  }

  // Nombre affiché à la française : signe moins typographique, virgule décimale
  // et espace fine insécable par groupe de trois chiffres à partir de 1 000.
  function num(value, options = {}) {
    if (typeof value === 'string') return value;
    const digits = options.digits == null ? 6 : options.digits;
    const {negative, text} = plain(value, digits);
    let [int, dec] = text.split('.');
    if (!options.raw && int.length >= 4) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
    return (negative ? MINUS : '') + int + (dec ? ',' + dec : '');
  }
  const FR = (value, digits = 4) => num(value, {digits});
  // Nombre négatif entre parenthèses, pour une substitution : 3 × (−2).
  const paren = (value, options) => (Number(value) < 0 ? '(' + num(value, options) + ')' : num(value, options));
  // « + 3 » ou « − 3 », pour écrire un terme après un autre.
  // Un terme nul n'est pas écrit (« + 0 » est évité).
  const signed = (value, options) => (Number(value) === 0 ? '' : (Number(value) < 0 ? ' ' + MINUS + ' ' : ' + ') + num(Math.abs(value), options));
  // Différence a − b pour une substitution ; « a − 0 » s'écrit simplement a.
  const diff = (a, b, options) => (Number(b) === 0 ? num(a, options) : num(a, options) + ' ' + MINUS + ' ' + paren(b, options));

  // Terme d'un polynôme : term(−1, 'x²', true) → « −x² » ; term(3, 'x') → « + 3x ».
  function term(coef, monomial = '', first = false, options) {
    if (!coef) return '';
    const abs = Math.abs(coef);
    const body = monomial && abs === 1 ? monomial : num(abs, options) + monomial;
    if (first) return (coef < 0 ? MINUS : '') + body;
    return (coef < 0 ? ' ' + MINUS + ' ' : ' + ') + body;
  }
  // Produit d'un coefficient par une valeur substituée, sans « 1 × » ni « + (−a) » :
  // times(−1, '6²', true) → « −6² » ; times(−12, 2) → « − 12 × 2 » ; times(1, −4, true)
  // → « −4 ». Un facteur numérique négatif n'est parenthésé qu'après un signe ou un ×.
  function times(coef, factor, first = false, options) {
    if (!coef) return first ? '0' : '';
    const abs = Math.abs(coef), zero = factor === 0;
    if (typeof factor === 'number') factor = first && coef === 1 ? num(factor, options) : paren(factor, options);
    // Un facteur nul garde le produit explicite (« −1 × 0 ») plutôt que « −0 ».
    const body = abs === 1 && !zero ? factor : num(abs, options) + ' × ' + factor;
    if (first) return (coef < 0 ? MINUS : '') + body;
    return (coef < 0 ? ' ' + MINUS + ' ' : ' + ') + body;
  }
  const POWERS = ['', '', '²', '³', '⁴', '⁵', '⁶'];
  // poly([1, −3, 2]) → « x² − 3x + 2 ». Coefficients du plus haut degré au constant.
  function poly(coefs, variable = 'x', options) {
    const degree = coefs.length - 1;
    let out = '';
    coefs.forEach((coef, i) => {
      const d = degree - i;
      const monomial = d === 0 ? '' : variable + POWERS[d];
      out += term(coef, monomial, out === '', options);
    });
    return out || '0';
  }
  // Facteur (x − r) : fact(2) → « (x − 2) », fact(−3) → « (x + 3) », fact(0) → « x ».
  const fact = (root, variable = 'x') => (root === 0 ? variable
    : '(' + variable + (root > 0 ? ' ' + MINUS + ' ' : ' + ') + num(Math.abs(root)) + ')');
  // Facteur sans parenthèses, pour une ligne de tableau de signes.
  const bare = (root, variable = 'x') => fact(root, variable).replace(/^\(|\)$/g, '');
  const affine = (a, b, variable = 'x') => poly([a, b], variable);
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  // Fraction simplifiée, écrite n/d (ou un entier).
  function frac(n, d) {
    if (!d) throw new Error('Dénominateur nul');
    const g = gcd(n, d) || 1, sign = (n < 0) !== (d < 0) ? -1 : 1;
    const a = Math.abs(n) / g, b = Math.abs(d) / g;
    return b === 1 ? num(sign * a) : (sign < 0 ? MINUS : '') + a + '/' + b;
  }
  const pct = (value, digits = 2) => num(value, {digits}) + NBSP + '%';
  // Montant en euros : entier tel quel, sinon toujours deux décimales (« 460,20 € »).
  const eur = value => {
    const x = F(value, 2);
    if (Number.isInteger(x)) return num(x) + NBSP + '€';
    const [int, dec] = Math.abs(x).toFixed(2).split('.');
    return (x < 0 ? MINUS : '') + num(Number(int)) + ',' + dec + NBSP + '€';
  };
  const interval = (a, b, left = '[', right = ']') => left + num(a) + ' ; ' + num(b) + right;

  /* ---------- Corrigés structurés ---------- */
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

  // Méthode → Calculs → Conclusion rédigée. Les tableaux s'insèrent après les calculs.
  // Après les deux-points, une phrase commence par une minuscule (« Le » → « le »),
  // sauf s'il s'agit d'une formule (« A(2) », « Q₁ »).
  // Minuscule après « Méthode : », sauf pour une notation comme Card(A).
  const afterColon = text => String(text).replace(/^([A-ZÀ-Ý])(?=[a-zà-ÿ’'])(?![a-zà-ÿ’']*\()/, c => c.toLowerCase());
  function C(method, calculations, conclusion, extras = []) {
    const out = ['<strong>Méthode' + NBSP + ':</strong> ' + afterColon(method)];
    (Array.isArray(calculations) ? calculations : [calculations]).forEach((line, i) => {
      out.push(i === 0 ? '<strong>Calculs' + NBSP + ':</strong> ' + afterColon(line) : line);
    });
    (Array.isArray(extras) ? extras : [extras]).filter(Boolean).forEach(x => out.push(x));
    out.push('<strong>Conclusion' + NBSP + ':</strong> ' + afterColon(conclusion));
    return out;
  }

  // Tableau de signes accessible : un vrai tableau avec en-têtes de colonnes
  // (intervalles et valeurs remarquables) et de lignes (facteurs).
  function signTable(caption, columns, rows, first = 'x') {
    const head = '<tr><th scope="col">' + first + '</th>' + columns.map(c => '<th scope="col">' + c + '</th>').join('') + '</tr>';
    const body = rows.map(row => '<tr><th scope="row">' + row.label + '</th>'
      + row.cells.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('');
    // Zone défilante atteignable au clavier, nommée par la légende du tableau.
    return '<div class="table-scroll" tabindex="0" role="region" aria-label="' + escapeHtml(caption.replace(/<[^>]*>/g, '')) + '"><table class="sign-table"><caption>' + caption + '</caption><thead>'
      + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }
  const signOf = v => (v > 0 ? '+' : v < 0 ? MINUS : '0');
  const bounds = (lo, hi) => ({
    L: lo == null ? MINUS + '∞' : num(lo), H: hi == null ? '+∞' : num(hi),
    lb: lo == null ? ']' : '[', rb: hi == null ? '[' : ']'
  });
  // Signe de k(x − r)(x − s), avec r < s, sur ℝ ou sur [lo ; hi] ; name nomme la
  // dernière ligne (le produit ou la fonction étudiée).
  function productSignTable(caption, k, r, s, lo, hi, name = 'Produit') {
    const {L, H, lb, rb} = bounds(lo, hi);
    const cols = [lb + L + ' ; ' + num(r) + '[', num(r), ']' + num(r) + ' ; ' + num(s) + '[', num(s), ']' + num(s) + ' ; ' + H + rb];
    const at = [r - 1, r, (r + s) / 2, s, s + 1];
    const rows = [];
    if (k !== 1) rows.push({label: num(k), cells: at.map(() => signOf(k))});
    rows.push({label: bare(r), cells: at.map(x => signOf(x - r))});
    rows.push({label: bare(s), cells: at.map(x => signOf(x - s))});
    rows.push({label: name, cells: at.map(x => signOf(k * (x - r) * (x - s)))});
    return signTable(caption, cols, rows);
  }
  // Signe de ax + b sur ℝ ou sur [lo ; hi] (racine r = −b/a dans l'intervalle) ;
  // variable nomme la première colonne (x par défaut).
  function affineSignTable(caption, label, a, root, lo, hi, variable = 'x') {
    const {L, H, lb, rb} = bounds(lo, hi);
    return signTable(caption, [lb + L + ' ; ' + num(root) + '[', num(root), ']' + num(root) + ' ; ' + H + rb],
      [{label, cells: [signOf(-a), '0', signOf(a)]}], variable);
  }
  // Tableau de variations : points = abscisses (bornes et points critiques),
  // values = images affichées (null pour une borne infinie), signs = signe de la
  // dérivée sur chaque intervalle.
  function variationTable(caption, fname, points, values, signs, options = {}) {
    const cols = [], d = [], v = [];
    points.forEach((x, i) => {
      cols.push(typeof x === 'string' ? x : num(x));
      d.push(i === 0 || i === points.length - 1 ? '' : '0');
      v.push(values[i] == null ? '' : num(values[i]));
      if (i < points.length - 1) {
        const a = typeof x === 'string' ? x : num(x), b = typeof points[i + 1] === 'string' ? points[i + 1] : num(points[i + 1]);
        cols.push(']' + a + ' ; ' + b + '[');
        d.push(signs[i] > 0 ? '+' : MINUS);
        v.push(signs[i] > 0 ? '<span aria-hidden="true">↗</span> croissante' : '<span aria-hidden="true">↘</span> décroissante');
      }
    });
    const rows = [{label: 'Variations de ' + fname, cells: v}];
    if (options.derivative !== false) rows.unshift({label: 'Signe de ' + fname + '′(x)', cells: d});
    return signTable(caption, cols, rows);
  }

  /* ---------- Fiches et champs ---------- */
  const N = (label, value, tolerance, rounding) => ({
    label, answer: String(typeof value === 'number' ? F(value, 9) : value),
    ...(tolerance === undefined ? {} : {tolerance: String(tolerance)}),
    ...(rounding === undefined ? {} : {rounding: String(rounding)})
  });
  // Choix : l'indice de la bonne réponse dans la liste déclarée sert aux contrôles
  // d'équilibre. shuffle: true mélange l'ordre affiché (pas pour une échelle naturelle).
  const S = (label, answer, options, settings = {}) => ({
    label, answer, options,
    choice: options.findIndex(o => (typeof o === 'string' ? o : o.value) === answer),
    ...(settings.shuffle ? {shuffle: true} : {})
  });
  const E = (original, statement, fields, correction, options = {}) => ({
    title: options.title || original?.title || 'Nouvelle variante',
    level: original?.level || 'Entraînement',
    statement,
    tasks: options.tasks || ['Complète les réponses demandées, puis vérifie ta démarche.'],
    fields,
    correction: Array.isArray(correction) ? correction : [correction],
    hint: options.hint || 'Repère les données de l’énoncé et la méthode du cours. Effectue le calcul avant de consulter la correction.'
  });

  /* ---------- Score de difficulté ---------- */
  // Repère simple et transparent : nombre d'étapes, taille des nombres manipulés,
  // présence de négatifs, de décimaux et de fractions.
  function score({values = [], steps = 1, fractions = false, negatives, decimals}) {
    const finite = values.filter(Number.isFinite);
    const max = finite.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    const neg = negatives == null ? finite.some(v => v < 0) : negatives;
    const dec = decimals == null ? finite.some(v => Math.abs(v - Math.round(v)) > 1e-9) : decimals;
    return F(6 * steps + 10 * Math.log10(1 + max) + (neg ? 3 : 0) + (dec ? 3 : 0) + (fractions ? 4 : 0), 3);
  }

  /* ---------- Contrôle de la mise en forme ---------- */
  const FORBIDDEN = [
    [/\+\s*[−-]/, 'signe + suivi d’un signe −'],
    [/[−-]\s*[−-]\d/, 'double signe moins'],
    [/(?<![\d,.])1x(?![\d,])/, 'coefficient 1 écrit'],
    [/[+−]\s*0\b(?![,.]\d)/, 'terme nul écrit'],
    [/\bNaN\b|undefined|Infinity|\[object/, 'valeur non numérique'],
    [/\d\.\d/, 'point décimal visible'],
    [/(?<![\wÀ-ÿ])-\s?\d/, 'tiret au lieu du signe moins']
  ];
  // Texte visible : sans balises ni code Python/tableur. Les cellules de tableau
  // sont séparées pour ne pas lire « + − » entre deux colonnes.
  const visible = html => String(html)
    .replace(/<code\b[\s\S]*?<\/code>/gi, ' ⟨code⟩ ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<\/(td|th)>/gi, ' ¦ ')
    .replace(/<sup>/gi, '^').replace(/<sub>/gi, '_')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  function lint(exercise) {
    const parts = [exercise.statement, ...(exercise.correction || []), exercise.hint || '',
      ...(exercise.tasks || []), ...exercise.fields.map(f => f.label),
      ...exercise.fields.flatMap(f => (f.options || []).map(o => (typeof o === 'string' ? o : o.label)))];
    const problems = [];
    for (const label of [...exercise.fields.map(f => f.label), ...exercise.fields.flatMap(f => (f.options || []).map(o => (typeof o === 'string' ? o : o.label)))]) {
      if (/&(?:lt|gt|amp|nbsp);|<[a-z]/i.test(label)) problems.push('balise ou entité dans un libellé : « ' + label + ' »');
    }
    for (const html of [exercise.statement, ...(exercise.correction || []), ...(exercise.tasks || [])]) {
      if (/<(?![a-zA-Z\/!])/.test(html)) problems.push('chevron non échappé : « ' + html.slice(0, 60) + ' »');
    }
    for (const part of parts) {
      const text = visible(part);
      for (const [pattern, name] of FORBIDDEN) {
        const match = text.match(pattern);
        if (match) problems.push(name + ' : « ' + text.slice(Math.max(0, match.index - 25), match.index + 25) + ' »');
      }
    }
    return problems;
  }

  /* ---------- Saisie ---------- */
  const decimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

  function readNumber(value) {
    const input = String(value).trim().replace(/[−–—]/g, '-')
      .replace(/\s+/g, '').replace(/,/g, '.');
    const parts = input.split('/');
    if (parts.length === 1 && decimalPattern.test(parts[0])) {
      const n = Number(parts[0]);
      return Number.isFinite(n) ? n : NaN;
    }
    if (parts.length === 2 && parts.every(part => decimalPattern.test(part))) {
      const numerator = Number(parts[0]), denominator = Number(parts[1]);
      const n = numerator / denominator;
      return denominator !== 0 && Number.isFinite(n) ? n : NaN;
    }
    return NaN;
  }

  function unorderedValues(value) {
    const input = String(value).trim().replace(/^\{|\}$/g, '')
      .replace(/\bx\s*=\s*/gi, '');
    const tokens = /;|\bet\b/i.test(input) ? input.split(/\s*(?:;|\bet\b)\s*/i) : input.split(/\s*,\s*/);
    if (tokens.length < 2 || tokens.some(token => !token.trim())) return null;
    const numbers = tokens.map(readNumber);
    return numbers.every(Number.isFinite) ? numbers.sort((a, b) => a - b) : null;
  }

  // Comparaison utilisée avant et pendant la révélation des corrections.
  function matchesAnswer(value, expected, type = 'text', tolerance, rounding) {
    if (!String(value).trim()) return false;
    const answers = String(expected).split('|');

    if (type === 'number') {
      const actual = readNumber(value);
      if (!Number.isFinite(actual)) return false;
      const threshold = tolerance === '' || tolerance == null
        ? 0.000001 : Number(tolerance);
      if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) return false;
      return answers.some(item => {
        const target = readNumber(item);
        if (!Number.isFinite(target)) return false;
        if (Math.abs(actual - target) <= threshold + Number.EPSILON * Math.max(1, Math.abs(target))) return true;
        if (rounding == null || rounding === '') return false;
        const digits = Number(rounding);
        if (!Number.isInteger(digits) || digits < 0 || digits > 6) return false;
        const scale = 10 ** digits;
        const rounded = Math.sign(target) * Math.round(Math.abs(target) * scale + 1e-9) / scale;
        return Math.abs(actual - rounded) <= 1e-9;
      });
    }

    if (type === 'unordered-list') {
      const actual = unorderedValues(value);
      if (!actual) return false;
      return answers.some(item => {
        const target = unorderedValues(item);
        return target && target.length === actual.length
          && actual.every((number, index) => Math.abs(number - target[index]) < 1e-9);
      });
    }

    const normal = text => String(text).trim().toLowerCase()
      .replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/\s+/g, '');
    return answers.some(item => normal(value) === normal(item));
  }

  /* ---------- Modèles ---------- */
  function validModel(m) {
    return m && typeof m.params === 'function' && typeof m.build === 'function'
      && typeof m.difficulty === 'function' && m.base && typeof m.base === 'object';
  }

  function register(slug, models) {
    if (factories.has(slug) || !Array.isArray(models) || !models.every(validModel)) {
      throw new Error('Modèles invalides pour ' + slug);
    }
    models.forEach((m, i) => {
      m.reference = m.difficulty(m.base);
      if (!(m.reference > 0)) throw new Error('Difficulté de référence invalide : ' + slug + '/' + i);
      if (m.accept && !m.accept(m.base)) throw new Error('Paramètres de référence refusés : ' + slug + '/' + i);
    });
    factories.set(slug, models);
  }

  function model(slug, index) {
    const models = factories.get(slug);
    if (!models || index < 0 || index >= models.length) {
      throw new Error('Variante introuvable : ' + slug + ', exercice ' + (index + 1));
    }
    return models[index];
  }

  const inBand = (m, p) => {
    const d = m.difficulty(p);
    return d >= m.reference * (1 - BAND) - 1e-9 && d <= m.reference * (1 + BAND) + 1e-9;
  };

  // Signature indépendante de l'ordre : deux tirages aux mêmes valeurs, même
  // permutées, sont considérés comme identiques.
  function signature(params) {
    return Object.values(params).map(v => (typeof v === 'number' ? String(F(v, 6)) : JSON.stringify(v)))
      .sort().join('|');
  }

  function check(slug, index, result) {
    if (!result || !result.statement || !Array.isArray(result.fields) || result.fields.length < 2) {
      throw new Error('Exercice incomplet : ' + slug + ', n° ' + (index + 1));
    }
    for (const field of result.fields) {
      if (!field.label || field.answer === undefined || field.answer === '') throw new Error('Réponse manquante : ' + slug);
      if (field.options && !field.options.some(option =>
        (typeof option === 'string' ? option : option.value) === field.answer)) {
        throw new Error('Choix correct absent : ' + slug + ', ' + field.label);
      }
      if (!field.options && field.type !== 'text' && field.type !== 'unordered-list' && !Number.isFinite(readNumber(field.answer))) {
        throw new Error('Réponse numérique non finie : ' + slug + ', ' + field.label);
      }
    }
    if (!result.correction?.length || !result.correction.every(Boolean)) {
      throw new Error('Correction manquante : ' + slug);
    }
    return result;
  }

  // Dans le HTML de l'énoncé et du corrigé, un chevron qui n'ouvre pas de balise
  // est échappé (« x < 3 » devient « x &lt; 3 ») ; libellés et options sont
  // échappés plus tard par le rendu.
  const safe = html => String(html).replace(/<(?![a-zA-Z\/!])/g, '&lt;');

  function assemble(slug, index, m, params, original, r) {
    const result = check(slug, index, m.build(params, original || {}));
    result.statement = safe(result.statement);
    result.correction = result.correction.map(safe);
    result.tasks = (result.tasks || []).map(safe);
    if (result.hint) result.hint = safe(result.hint);
    if (r) {
      result.fields.forEach(field => {
        if (field.options && field.shuffle) field.options = r.shuffle(field.options);
      });
    }
    result.params = params;
    result.signature = signature(params);
    result.choiceKey = result.fields.filter(f => f.options).map(f => f.choice).join(',');
    result.difficulty = m.difficulty(params);
    result.reference = m.reference;
    return result;
  }

  // Même graine → même exercice. Le rang de la variante n'intervient jamais.
  function generate(slug, index, seed, original = {}) {
    const m = model(slug, index);
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Graine invalide : ' + seed);
    const r = rng(seed);
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      const params = m.params(r);
      if ((!m.accept || m.accept(params)) && inBand(m, params)) {
        const result = assemble(slug, index, m, params, original, r);
        result.seed = seed;
        result.attempts = attempt;
        return result;
      }
    }
    // Repli sûr et signalé : les tests vérifient qu'il n'est jamais nécessaire.
    const result = assemble(slug, index, m, m.base, original, null);
    result.seed = seed;
    result.fallback = true;
    return result;
  }

  // Exercice d'origine (variante 1), construit avec les paramètres de référence.
  function originalOf(slug, index, original = {}) {
    const m = model(slug, index);
    return assemble(slug, index, m, m.base, original, null);
  }

  const memoryFor = (slug, index) => ({sigs: [signature(model(slug, index).base)], choices: []});

  // Variante suivante sans répétition récente : les 10 dernières signatures sont
  // refusées, ainsi qu'une même bonne réponse à choix sortie deux fois de suite.
  // La mémoire n'est pas modifiée ici (voir remember).
  function nextVariant(slug, index, memory, original = {}, seedSource = randomSeed) {
    const m = model(slug, index);
    const window = Math.min(10, Math.max(1, (m.space || 1000) - 1));
    let best = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const candidate = generate(slug, index, seedSource() >>> 0, original);
      const repeated = memory.sigs.slice(-window).includes(candidate.signature);
      const keys = memory.choices.slice(-2);
      const sameChoice = candidate.choiceKey && keys.length === 2 && keys.every(k => k === candidate.choiceKey);
      if (!repeated && !sameChoice) { best = candidate; break; }
      if (!repeated && !best) best = candidate;
    }
    return best || generate(slug, index, seedSource() >>> 0, original);
  }

  // La variante n'entre en mémoire que lorsqu'elle est réellement affichée.
  function remember(memory, exercise) {
    memory.sigs.push(exercise.signature);
    if (exercise.choiceKey) memory.choices.push(exercise.choiceKey);
    if (memory.sigs.length > 20) memory.sigs.splice(0, memory.sigs.length - 20);
    if (memory.choices.length > 20) memory.choices.splice(0, memory.choices.length - 20);
    return memory;
  }

  const describe = (slug, index) => {
    const m = model(slug, index);
    return {reference: m.reference, band: BAND, space: m.space, limit: m.limit,
      decimals: m.decimals, coefs: m.coefs, choiceExceptions: m.choiceExceptions || {},
      base: m.base, verify: m.verify, difficulty: m.difficulty, accept: m.accept};
  };
  const count = slug => (factories.get(slug) || []).length;
  const slugs = () => Array.from(factories.keys());

  const fmt = {num, FR, paren, signed, diff, term, times, poly, fact, bare, affine, frac, pct, eur, interval, gcd, signOf, MINUS, NBSP, NNBSP};
  window.ExerciseVariants = {
    register, generate, original: originalOf, nextVariant, remember, memoryFor, randomSeed, rng,
    describe, count, slugs, signature, score, lint, visible, FORBIDDEN, BAND, MAX_TRIES,
    N, S, F, FR, E, C, signTable, productSignTable, affineSignTable, variationTable, escapeHtml, fmt, matchesAnswer, readNumber
  };
})();
