/* Vérification des 129 générateurs de Première, sans navigateur.
   Pour chaque modèle et 2 000 graines : validité, reproductibilité, variété,
   bande de difficulté, plages, équilibre des réponses à choix, mise en forme,
   recalcul indépendant et absence de répétition sur 10 variantes consécutives. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SEEDS = 2000;
const files = [
  'assets/exercices-variants.js',
  'assets/variants-fonctions.js',
  'assets/fonctions-coaching.js',
  'assets/coaching-general.js',
  'assets/coaching-algebre.js',
  'assets/coaching-suites.js',
  'assets/coaching-analyse.js',
  'assets/coaching-probabilites.js',
  'assets/coaching-reperes.js',
  'assets/coaching-donnees.js',
  'assets/variants-suites.js',
  'assets/variants-analyse.js',
  'assets/variants-probabilites.js',
  'assets/variants-reperes.js',
  'assets/variants-donnees.js'
];
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const filename of files) vm.runInContext(fs.readFileSync(path.join(ROOT, filename), 'utf8'), sandbox, {filename});
const V = sandbox.window.ExerciseVariants;
const {generate, matchesAnswer, fmt} = V;
const slugs = [
  'fonctions', 'second-degre', 'suites', 'suites-arithmetiques',
  'suites-geometriques', 'derivees', 'variations',
  'statistiques-deux-variables', 'probabilites-conditionnelles',
  'bernoulli', 'variables-aleatoires', 'calcul', 'evolutions',
  'logique', 'statistiques-descriptives', 'python-tableur'
];

/* ---------- Générateur pseudo-aléatoire ---------- */
{
  const a = V.rng(42), b = V.rng(42);
  for (let i = 0; i < 200; i++) assert.equal(a.next(), b.next(), 'même graine, même suite');
  const r = V.rng(7), seen = new Set();
  for (let i = 0; i < 5000; i++) { const x = r.int(-3, 4); assert.ok(Number.isInteger(x) && x >= -3 && x <= 4); seen.add(x); }
  assert.equal(seen.size, 8, 'int(min, max) atteint toutes les valeurs');
  for (let i = 0; i < 500; i++) {
    assert.ok([1, 2, 3].includes(r.pick([1, 2, 3])));
    assert.ok([-1, 1].includes(r.sign()));
    assert.ok(r.nonZero(1, 5) !== 0);
    const d = r.pickDistinct([1, 2, 3, 4, 5], 3);
    assert.equal(new Set(d).size, 3);
  }
  const sh = r.shuffle([1, 2, 3, 4, 5]);
  assert.deepEqual([...sh].sort(), [1, 2, 3, 4, 5]);
  let yes = 0; for (let i = 0; i < 10000; i++) if (r.chance(0.3)) yes++;
  assert.ok(yes > 2700 && yes < 3300, 'chance(p) respecte la probabilité');
  const seeds = new Set(Array.from({length: 50}, () => V.randomSeed()));
  assert.ok(seeds.size > 45, 'graines issues de crypto.getRandomValues');
  assert.ok(!('pad' in V), 'pad() a été supprimé : aucune dépendance au numéro de cycle');
}

/* ---------- Écriture mathématique ---------- */
{
  const M = '−';
  assert.equal(fmt.poly([1, -3, 2]), `x² ${M} 3x + 2`);
  assert.equal(fmt.poly([-1, 0, 5]), `${M}x² + 5`);
  assert.equal(fmt.poly([2, 1, 0]), 'x² + x'.replace('x²', '2x²'));
  assert.equal(fmt.poly([0, 0, 0]), '0');
  assert.equal(fmt.term(1, 'x²', true), 'x²');
  assert.equal(fmt.term(-1, 'x', false), ` ${M} x`);
  assert.equal(fmt.term(0, 'x'), '');
  assert.equal(fmt.signed(-3), ` ${M} 3`);
  assert.equal(fmt.signed(4), ' + 4');
  assert.equal(fmt.signed(0), '');
  assert.equal(fmt.fact(2), `(x ${M} 2)`);
  assert.equal(fmt.fact(-2), '(x + 2)');
  assert.equal(fmt.fact(0), 'x');
  assert.equal(fmt.affine(-2, 8), `${M}2x + 8`);
  assert.equal(fmt.affine(1, -1), `x ${M} 1`);
  assert.equal(fmt.num(-2.5), `${M}2,5`);
  assert.equal(fmt.num(1600), '1 600');
  assert.equal(fmt.paren(-3), `(${M}3)`);
  assert.equal(fmt.diff(5, 0), '5');
  assert.equal(fmt.diff(5, -2), `5 ${M} (${M}2)`);
  assert.equal(fmt.frac(4, 2), '2');
  assert.equal(fmt.frac(6, 8), '3/4');
  assert.equal(fmt.eur(460.2), '460,20 €');
  // Le contrôle détecte bien les artefacts interdits (preuve que le test peut échouer).
  for (const bad of ['1x² + −3x', 'x − −3', '(x − −2)', '1x + 2', 'x + 0', 'NaN', 'undefined', '2.5', '-3'])
    assert.ok(V.lint({statement: bad, fields: [{label: 'a', answer: '1'}], correction: ['ok']}).length > 0, 'motif non détecté : ' + bad);
  assert.equal(V.lint({statement: `x² ${M} 3x + 2 ; 0,5 ; x ≥ 0 ; 10<sup>${M}3</sup> ; <code>x = x - 2</code>`, fields: [{label: 'a', answer: '1'}], correction: ['ok']}).length, 0);
}

/* ---------- Motifs interdits, exactement ceux du cahier des charges ---------- */
const MISSION_PATTERNS = [/\+\s*[−-]/, /[−-]\s*[−-]\d/, /(?<![\d,.])1x/, /[+−]\s*0\b(?![,.]\d)/, /\bNaN\b|undefined|Infinity/, /\d\.\d/];
function visibleParts(e) {
  return [e.statement, ...e.correction, e.hint || '', ...(e.tasks || []), ...e.fields.map(f => f.label),
    ...e.fields.flatMap(f => (f.options || []).map(o => (typeof o === 'string' ? o : o.label)))].map(V.visible);
}

/* ---------- Banque complète ---------- */
// Les tableaux du bac à sable n'ont pas le même prototype : on compare leur contenu.
const clean = (problems, where) => assert.equal(problems.length, 0, where + ' : ' + Array.from(problems).join(' | '));
const numeric = f => !f.options && f.type !== 'text' && f.type !== 'unordered-list';
const valuesOf = e => e.fields.map(f => (f.options || f.type ? f.answer : Number(f.answer)));
const decimalsOf = x => { const t = String(Number(Number(x).toFixed(9))); return t.includes('.') ? t.split('.')[1].length : 0; };
let models = 0, variants = 0, choiceFields = 0;
const report = [];
for (const slug of slugs) {
  const page = fs.readFileSync(path.join(ROOT, 'exercices', slug + '.html'), 'utf8');
  const embedded = page.match(/<script type="application\/json" id="exercise-data">([\s\S]*?)<\/script>/);
  const originals = embedded ? JSON.parse(embedded[1]).exercises : [];
  const expected = slug === 'fonctions' ? 9 : 8;
  assert.equal(V.count(slug), expected, slug + ' : nombre de modèles');
  for (let index = 0; index < expected; index++) {
    const d = V.describe(slug, index);
    const statements = new Set(), freq = {};
    const limit = d.limit || 1000, maxDec = d.decimals == null ? 2 : d.decimals;
    // L'exercice d'origine (variante 1) passe les mêmes contrôles.
    const base = V.original(slug, index, originals[index] || {});
    clean(V.lint(base), slug + '/' + index + ' : mise en forme de la variante 1');
    assert.ok(d.verify(base.params, valuesOf(base)), slug + '/' + index + ' : recalcul de la variante 1');
    for (let seed = 1; seed <= SEEDS; seed++) {
      const e = generate(slug, index, seed, originals[index] || {});
      const where = slug + '/' + index + '/graine ' + seed;
      // Validation existante.
      assert.ok(e.statement.includes('<'), where + ' : énoncé mis en forme');
      assert.ok(e.fields.length >= 2, where + ' : interactif');
      assert.ok(e.correction.join(' ').length > 40 && e.correction.every(Boolean), where + ' : correction');
      assert.ok(e.tasks.length >= 1, where + ' : consignes');
      assert.ok(/Méthode/.test(e.correction[0]) && /Conclusion/.test(e.correction[e.correction.length - 1]), where + ' : corrigé Méthode → Conclusion');
      // Même graine, même sortie.
      if (seed % 4 === 1) assert.equal(JSON.stringify(generate(slug, index, seed, originals[index] || {})), JSON.stringify(e), where + ' : reproductible');
      // Difficulté dans la bande, sans repli.
      assert.ok(!e.fallback, where + ' : 200 tirages sans repli');
      assert.ok(e.difficulty >= e.reference * 0.8 - 1e-9 && e.difficulty <= e.reference * 1.2 + 1e-9, where + ' : difficulté hors bande');
      // Plages déclarées.
      for (const c of d.coefs || []) assert.ok(Number.isInteger(e.params[c]) && Math.abs(e.params[c]) <= 10, where + ' : coefficient ' + c);
      e.fields.forEach((f, j) => {
        if (f.options) {
          assert.ok(f.options.some(o => (typeof o === 'string' ? o : o.value) === f.answer), where + ' : choix correct absent');
          assert.ok(f.choice >= 0, where + ' : indice du bon choix');
          (freq[j] = freq[j] || {})[f.choice] = (freq[j][f.choice] || 0) + 1;
          assert.equal(matchesAnswer(f.answer, f.answer, 'text'), true);
          return;
        }
        if (f.type === 'unordered-list') { assert.equal(matchesAnswer(f.answer.split(';').reverse().join(';'), f.answer, f.type), true); return; }
        const x = Number(f.answer);
        assert.ok(Number.isFinite(x), where + ' : réponse non finie ' + f.label);
        assert.ok(Math.abs(x) <= limit, where + ' : ' + f.label + ' = ' + x + ' dépasse ' + limit);
        if (f.tolerance == null || Number(f.tolerance) < 1e-5) assert.ok(decimalsOf(x) <= maxDec, where + ' : trop de décimales pour ' + f.label);
        if (f.tolerance != null) assert.ok(Number(f.tolerance) <= 0.0049, where + ' : tolérance trop large');
        assert.equal(matchesAnswer(f.answer, f.answer, 'number', f.tolerance, f.rounding), true, where + ' : solution refusée');
        assert.equal(matchesAnswer(String(x + 10), f.answer, 'number', f.tolerance, f.rounding), false);
      });
      // Mise en forme.
      clean(V.lint(e), where);
      for (const text of visibleParts(e)) for (const pattern of MISSION_PATTERNS) assert.ok(!pattern.test(text), where + ' : motif interdit ' + pattern + ' dans « ' + text.slice(0, 80) + ' »');
      // La correction recalcule bien les réponses attendues.
      assert.ok(d.verify(e.params, valuesOf(e)), where + ' : recalcul indépendant');
      statements.add(e.statement + '|' + e.fields.map(f => f.label).join('|'));
      variants++;
    }
    // Variété : au moins 40 énoncés distincts, ou le maximum combinatoire documenté.
    const need = Math.min(40, d.space || 40);
    assert.ok(statements.size >= need, slug + '/' + index + ' : ' + statements.size + ' énoncés distincts < ' + need);
    // Équilibre de chaque bonne réponse possible (30 à 70 %).
    for (const [j, counts] of Object.entries(freq)) {
      choiceFields++;
      for (const [k, n] of Object.entries(counts)) {
        const share = n / SEEDS;
        if (!(d.choiceExceptions || {})[j]) assert.ok(share >= 0.3 && share <= 0.7, slug + '/' + index + ' : réponse ' + k + ' du champ ' + j + ' à ' + (100 * share).toFixed(1) + ' %');
      }
      report.push(slug + '/' + (index + 1) + ' champ ' + j + ' : ' + Object.values(counts).map(n => (100 * n / SEEDS).toFixed(0) + ' %').join(' / '));
    }
    // Anti-répétition : 10 variantes consécutives sans signature identique.
    let state = 2024 + index;
    const source = () => (state = (Math.imul(state, 1103515245) + 12345) >>> 0);
    for (let run = 0; run < 3; run++) {
      const memory = V.memoryFor(slug, index), sigs = [], keys = [];
      for (let t = 0; t < 15; t++) { const e = V.nextVariant(slug, index, memory, {}, source); V.remember(memory, e); sigs.push(e.signature); keys.push(e.choiceKey); }
      const window = Math.min(10, Math.max(1, (d.space || 1000) - 1));
      for (let t = 0; t < sigs.length; t++) for (let u = Math.max(0, t - window + 1); u < t; u++) assert.notEqual(sigs[t], sigs[u], slug + '/' + index + ' : répétition parmi 10 variantes');
      for (let t = 2; t < keys.length; t++) if (keys[t]) assert.ok(!(keys[t] === keys[t - 1] && keys[t] === keys[t - 2]), slug + '/' + index + ' : même bonne réponse à choix trois fois de suite');
    }
    models++;
  }
}
assert.equal(models, 129);

/* ---------- Correcteur : formes acceptées et refusées ---------- */
const positive = [
  ['0,833', '0.8333', 'number', '0.000051', '3'], ['0,8333', '0.8333', 'number', '0.000051', '3'], ['5/6', '0.8333', 'number', '0.000051', '3'],
  ['1,41421356', '1.41', 'number', '0.0049'], ['5/12', '0.417', 'number', '0.00049'], ['1/2', '0.5', 'number'], ['2/4', '0.5', 'number'],
  ['−3', '-3', 'number'], ['1 600', '1600', 'number'], ['5;3', '3;5', 'unordered-list'], ['3,5', '3;5', 'unordered-list'],
  ['x = 5 et x = 3', '3;5', 'unordered-list'], ['t>=4', 't>=4', 'text'], ['t ≥ 4', 't ≥ 4', 'text']
];
const negative = [
  ['0,834', '0.8333', 'number', '0.000051', '3'], ['0,334', '0.3333', 'number', '0.000051', '3'], ['1,42', '1.41', 'number', '0.0049'],
  ['0,418', '0.417', 'number', '0.00049'], ['2/0', '0.5', 'number'], ['0x10', '16', 'number'], ['Infinity', '1', 'number'],
  ['3;3', '3;5', 'unordered-list'], ['3;5;7', '3;5', 'unordered-list'], ['t ≥ 4', 't>=4', 'text']
];
for (const p of positive) assert.equal(matchesAnswer(...p), true, 'Réponse correcte refusée : ' + p.join(' / '));
for (const p of negative) assert.equal(matchesAnswer(...p), false, 'Réponse fausse acceptée : ' + p.join(' / '));

/* ---------- Aides du chapitre Fonctions ---------- */
const coaching = sandbox.window.FonctionsCoaching;
assert.ok(coaching && typeof coaching.build === 'function');
assert.equal(coaching.originals.length, 9);
assert.match(coaching.build(0, coaching.originals[0]).hints[2], /3 × 4 − 5/);
const bridgeSolutions = ['7', '11', '5', '3', '5', '3', '5', '2', '3'];
let coachingCases = 0;
// Les indices sont insérés comme texte (textContent) : on les échappe avant le contrôle.
const lintHint = text => V.lint({statement: V.escapeHtml(text), fields: [{label: 'a', answer: '1'}], correction: ['ok']});
for (let index = 0; index < 9; index++) {
  const initial = coaching.build(index, coaching.originals[index]);
  assert.equal(initial.hints.length, 3);
  assert.equal(initial.bridge.a, bridgeSolutions[index]);
  for (const h of initial.hints) clean(lintHint(h), 'indice de l’origine ' + index);
  for (let seed = 1; seed <= SEEDS; seed++) {
    const ex = generate('fonctions', index, seed, {});
    const c = ex.coachingContext;
    assert.ok(c && typeof c === 'object', 'Contexte d’aide manquant ' + index + '/' + seed);
    const help = coaching.build(index, c);
    assert.equal(help.hints.length, 3);
    assert.ok(help.hints.every(h => typeof h === 'string' && h.length >= 25));
    for (const h of help.hints) clean(lintHint(h), 'indice ' + index + '/' + seed + ' : ' + h);
    assert.ok(help.diagnose.length > 50);
    assert.equal(help.bridge.a, bridgeSolutions[index]);
    const v = ex.fields.map(f => f.answer), num = i => Number(v[i]);
    // Les valeurs citées par l'aide sont celles de la variante, avec leurs signes.
    switch (index) {
      case 0: assert.equal(c.target, c.a * c.xt + c.b); assert.ok(help.hints[2].includes(fmt.num(c.target))); assert.ok(help.hints[2].includes(fmt.affine(c.a, c.b))); break;
      case 1: assert.equal(num(3), (c.total - c.fix) / c.rate); assert.ok(help.hints[2].includes(String(c.total))); break;
      case 2: assert.equal(v[2], c.lo + ';' + c.hi); assert.equal(num(4), c.h); assert.ok(help.hints[2].includes(c.dir > 0 ? '− 1' : '+ 1')); break;
      case 3: assert.equal(num(0), c.a); assert.equal(num(1), c.b); assert.equal(c.y1, c.a * c.x1 + c.b); assert.equal(num(2), c.a * c.xq + c.b); break;
      case 4: assert.equal(num(0), c.fixed + c.t0 * c.rateA); assert.equal(c.fixed, (c.rateB - c.rateA) * c.k); assert.ok(help.hints[1].includes(c.q ? 'B(t) ≤ A(t)' : 'A(t) ≤ B(t)')); break;
      case 5: assert.ok(help.hints[1].includes(c.kind ? fmt.affine(c.a, c.b) : fmt.term(c.a, 'x²', true))); break;
      case 6: assert.equal(num(1), c.root); assert.equal(c.b, -c.a * c.root); assert.ok(help.hints[1].includes(c.a > 0 ? 'positif' : 'négatif')); break;
      case 7: assert.equal(num(0), c.D / c.speeds[0]); assert.ok(help.hints[2].includes(String(c.speeds[2]))); break;
      case 8: assert.ok(c.low * c.low < c.n && c.high * c.high > c.n); assert.ok(help.hints[2].includes('√' + c.n)); break;
    }
    coachingCases++;
  }
}

/* ---------- Aides des 120 autres modèles ---------- */
const allCoaching = sandbox.window.ExerciseCoaching;
const expectedBridges = {
  'second-degre': ['-3', '2', '1', '4', '1', '8', '4', '-1'],
  'suites': ['10', '11', '2.5', '6', '3', '3', '7', '20'],
  'suites-arithmetiques': ['4', '14', '5', '4', '30', '9', '3', '30'],
  'suites-geometriques': ['3', '80', '20', '110', '3', '30', '14.4', '64'],
  'derivees': ['4', '6', '4', '4', '5', '100.8', '5', '10'],
  'variations': ['6', '4', '-5', '3', '2', '5', '1.4', '20'],
  'statistiques-deux-variables': ['4', '2', '14', '2', 'oui', '11', 'oui', '3'],
  'probabilites-conditionnelles': ['7', '0.5', '0.375', '0.2', '0.1', '0.5', '0.4', '0.09'],
  'bernoulli': ['0.3', '0.25', '0.5', '0.375', '0.875', '0.0625', '0.0625', '0.5'],
  'variables-aleatoires': ['0.5', '1.3', '1', '3', '0.4', '0.3', '0.2', '0.1'],
  'calcul': ['23', '0.75', '32', '5', '90', '7', '4', '4'],
  'evolutions': ['20', '99', '96', '121', '0.8', '100', '20', '25'],
  'logique': ['2', '3', '6', 'oui', 'oui', '3', '5', '3'],
  'statistiques-descriptives': ['0.3', '5', '10', '8', '2', '12', '4', '4'],
  'python-tableur': ['20', 'accepté', '11', '7', '9', '5', '110', '2021']
};
let otherCases = 0;
for (const [slug, solutions] of Object.entries(expectedBridges)) {
  const page = fs.readFileSync(path.join(ROOT, 'exercices', slug + '.html'), 'utf8');
  const initial = JSON.parse(page.match(/<script type="application\/json" id="exercise-data">([\s\S]*?)<\/script>/)[1]).exercises;
  assert.equal(initial.length, 8);
  for (let index = 0; index < 8; index++) {
    for (let seed = 0; seed <= 400; seed++) {
      const ex = seed ? generate(slug, index, seed, initial[index]) : initial[index];
      const help = allCoaching.build(slug, index, ex);
      assert.ok(help, 'Aide manquante ' + slug + '/' + index + '/' + seed);
      assert.equal(help.hints.length, 3);
      assert.ok(help.hints.every(h => h.length >= 35), 'Indice trop court ' + slug + '/' + index);
      const facts = allCoaching.context(ex);
      assert.ok(facts.length > 0, 'Aucune donnée contextuelle');
      assert.ok(help.hints[2].includes(facts), 'Données de l’énoncé absentes de l’indice ' + slug + '/' + index + '/' + seed);
      // Le code Python cité dans l'indice garde son tiret (opérateur) : on l'écarte du contrôle.
      const codes = [...String(ex.statement).matchAll(/<code>([\s\S]*?)<\/code>/g)].map(m => m[1].replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&'));
      if (seed) for (const h of help.hints) clean(lintHint(codes.reduce((t, c) => t.split(c).join(' '), h)), 'indice ' + slug + '/' + index + '/' + seed);
      assert.equal(help.bridge.a, solutions[index], 'Tremplin ' + slug + '/' + index);
      assert.ok(help.bridge.q.startsWith('Exemple indépendant : '));
      assert.ok(help.diagnose.includes('Piste à vérifier'));
      otherCases++;
    }
  }
}

console.log('VARIANTS OK: ' + models + ' modèles × ' + SEEDS + ' graines = ' + variants + ' variantes ; difficulté dans la bande ±20 % à 100 %, '
  + choiceFields + ' champs à choix équilibrés (30–70 %), aucun motif interdit, recalcul indépendant, 10 variantes consécutives sans répétition.');
console.log('AIDES OK: ' + coachingCases + ' situations Fonctions et ' + otherCases + ' situations des 120 autres modèles, indices conformes à chaque tirage.');
if (process.argv.includes('--report')) console.log(report.join('\n'));
