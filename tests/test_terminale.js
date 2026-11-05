/* Terminale : 54 modèles contrôlés sur 2 000 graines chacun, avec le moteur de
   production. `--json` exporte des cas (paramètres et réponses) pour le
   recalcul indépendant en Python (tests/test_terminale.py). */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const SEEDS = 2000;
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const filename of ['assets/exercices-variants.js', 'assets/terminale-exercices.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, filename), 'utf8'), sandbox, {filename});
}
const V = sandbox.window.ExerciseVariants;
const T = sandbox.window.TerminaleExercises;
assert.equal(T.slugs.length, 9);
assert.equal(T.count, 6);
const clean = (problems, where) => assert.equal(problems.length, 0, where + ' : ' + Array.from(problems).join(' | '));
const MISSION_PATTERNS = [/\+\s*[−-]/, /[−-]\s*[−-]\d/, /(?<![\d,.])1x/, /[+−]\s*0\b(?![,.]\d)/, /\bNaN\b|undefined|Infinity/, /\d\.\d/];
const cases = [];
let variants = 0, choiceFields = 0;
for (const slug of T.slugs) {
  for (let index = 0; index < T.count; index++) {
    const d = V.describe(slug, index), statements = new Set(), freq = {};
    const base = V.original(slug, index);
    clean(V.lint(base), slug + '/' + index + ' : variante 1');
    assert.ok(d.verify(base.params, base.fields.map(f => (f.options ? f.answer : Number(f.answer)))), slug + '/' + index + ' : recalcul de la variante 1');
    for (let seed = 1; seed <= SEEDS; seed++) {
      const e = V.generate(slug, index, seed), where = slug + '/' + index + '/graine ' + seed;
      assert.ok(e.title && e.statement && e.hint && e.correction.length && e.fields.length >= 2, where);
      assert.ok(/Méthode/.test(e.correction[0]) && /Conclusion/.test(e.correction[e.correction.length - 1]), where + ' : corrigé structuré');
      if (seed % 4 === 1) assert.equal(JSON.stringify(V.generate(slug, index, seed)), JSON.stringify(e), where + ' : reproductible');
      assert.ok(!e.fallback, where + ' : sans repli');
      assert.ok(e.difficulty >= e.reference * 0.8 - 1e-9 && e.difficulty <= e.reference * 1.2 + 1e-9, where + ' : difficulté hors bande');
      e.fields.forEach((field, j) => {
        const type = field.options ? 'text' : (field.type || 'number');
        assert.equal(V.matchesAnswer(field.answer, field.answer, type, field.tolerance, field.rounding), true, where + ' : ' + field.label);
        assert.equal(V.matchesAnswer('', field.answer, type, field.tolerance, field.rounding), false);
        if (field.options) {
          assert.ok(field.options.includes(field.answer));
          assert.equal(V.matchesAnswer('wrong', field.answer, type), false);
          (freq[j] = freq[j] || {})[field.choice] = (freq[j][field.choice] || 0) + 1;
        } else {
          const value = Number(field.answer);
          assert.ok(Number.isFinite(value) && Math.abs(value) <= (d.limit || 100000), where + ' : valeur raisonnable ' + field.label);
          const digits = Number(field.rounding), scale = 10 ** digits;
          const rounded = Math.sign(value) * Math.round(Math.abs(value) * scale + 1e-9) / scale;
          assert.equal(V.matchesAnswer(String(rounded).replace('.', ','), field.answer, type, field.tolerance, field.rounding), true, where + ' : arrondi refusé');
          assert.equal(V.matchesAnswer(String(value + 10), field.answer, type, field.tolerance, field.rounding), false);
        }
      });
      clean(V.lint(e), where);
      for (const part of [e.statement, ...e.correction, ...e.fields.map(f => f.label)].map(V.visible))
        for (const pattern of MISSION_PATTERNS) assert.ok(!pattern.test(part), where + ' : motif interdit ' + pattern + ' dans « ' + part.slice(0, 80) + ' »');
      assert.ok(d.verify(e.params, e.fields.map(f => (f.options ? f.answer : Number(f.answer)))), where + ' : recalcul indépendant');
      const help = sandbox.window.ExerciseCoaching.build(slug, index, e);
      assert.equal(help.hints.length, 3);
      assert.ok(help.hints.every(Boolean));
      assert.ok(help.bridge.a && help.bridge.help && help.diagnose);
      assert.ok(help.hints[2].includes(V.visible(e.statement).replace(/⟨code⟩/g, '').replace(/\s+/g, ' ').trim().slice(0, 30)));
      statements.add(e.statement + '|' + e.fields.map(f => f.label).join('|'));
      if (seed <= 48) cases.push({slug, index, seed, params: e.params, answers: e.fields.map(x => x.answer)});
      variants++;
    }
    assert.ok(statements.size >= Math.min(40, d.space || 40), slug + '/' + index + ' : ' + statements.size + ' énoncés distincts');
    for (const [j, counts] of Object.entries(freq)) {
      choiceFields++;
      for (const n of Object.values(counts)) assert.ok(n / SEEDS >= 0.3 && n / SEEDS <= 0.7, slug + '/' + index + ' : choix déséquilibré ' + JSON.stringify(counts));
    }
    let state = 99 + index;
    const source = () => (state = (Math.imul(state, 1103515245) + 12345) >>> 0);
    const memory = V.memoryFor(slug, index), sigs = [];
    for (let t = 0; t < 15; t++) { const e = V.nextVariant(slug, index, memory, {}, source); V.remember(memory, e); sigs.push(e.signature); }
    for (let t = 0; t < sigs.length; t++) for (let u = Math.max(0, t - 9); u < t; u++) assert.notEqual(sigs[t], sigs[u], slug + '/' + index + ' : répétition');
    // Les deux premiers tirages consécutifs sont différents : graines indépendantes.
    assert.notEqual(sigs[0], sigs[1]);
  }
}
for (let n = 1; n <= 10; n++) {
  let row = 0;
  for (let k = 0; k <= n; k++) row += T.binom(n, k);
  assert.equal(row, 2 ** n);
  for (const p of [0, .1, .3, .5, .9, 1]) {
    let total = 0, expectation = 0;
    for (let k = 0; k <= n; k++) { const probability = T.mass(n, p, k); total += probability; expectation += k * probability; }
    assert.ok(Math.abs(total - 1) < 1e-10);
    assert.ok(Math.abs(expectation - n * p) < 1e-10);
  }
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(cases));
else console.log(`TERMINALE OK: 54 modèles × ${SEEDS} graines = ${variants} variantes ; bande de difficulté, ${choiceFields} champs à choix équilibrés, mise en forme, arrondis, recalcul, aides et lois binomiales.`);
