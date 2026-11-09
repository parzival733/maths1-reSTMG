/* Le correcteur essentiel doit charger sans lookbehind (Safari avant 16.4). */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');

for (const name of ['exercices-variants.js', 'typographie.js']) {
  const source = fs.readFileSync(path.join(ROOT, 'assets', name), 'utf8');
  assert.ok(!/\(\?<[=!]/.test(source), name + ' : pas de lookbehind bloquant le chargement');
}

const sandbox = {window: {}, document: {readyState: 'loading', addEventListener() {}}};
vm.createContext(sandbox);
for (const name of ['exercices-variants.js', 'typographie.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', name), 'utf8'), sandbox);
}
const V = sandbox.window.ExerciseVariants;
for (const [typed, expected] of [['5', '5'], ['11', '11'], ['20', '20'], ['−11', '-11'], ['158,7', '158.7']]) {
  assert.ok(V.matchesAnswer(typed, expected, 'number'), typed);
}
assert.ok(!V.matchesAnswer('21', '20', 'number'));
assert.ok(V.matchesAnswer('−20 %', '-20', 'number', undefined, undefined, '%'));
assert.ok(V.matchesAnswer('182,51 €', '182.505', 'number', undefined, '2', '€'));
assert.ok(!V.matchesAnswer('20 %', '0.2', 'number'));
assert.ok(!V.matchesAnswer('20 %', '20', 'number'));
assert.ok(!V.matchesAnswer('0,2 %', '20', 'number', undefined, undefined, '%'));
assert.ok(!V.matchesAnswer('182,50 €', '182.505', 'number', undefined, '2', '€'));
assert.ok(!V.matchesAnswer('182,51 %', '182.505', 'number', undefined, '2', '€'));
assert.ok(V.matchesAnswerInGroup('5', ['1', '5'], ['1']));
assert.ok(V.matchesAnswerInGroup('1', ['1', '5'], ['5']));
assert.ok(V.matchesAnswerInGroup('1', ['1', '5'], ['']));
assert.ok(!V.matchesAnswerInGroup('1', ['1', '5'], ['1,0']));
assert.ok(!V.matchesAnswerInGroup('2', ['1', '5'], ['5']));

// Le changement de syntaxe conserve les mêmes règles de mise en forme.
const NB = '\u00a0', NNB = '\u202f', LETTER = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
const UNITS = '(?:€|%|km/h|m/s|kWh|km|cm|mm|kg|min|h|L|°C|ans?|mois)';
const reference = [
  [new RegExp('(?<=[' + LETTER + "])'(?=[" + LETTER + '])', 'g'), '’'],
  [new RegExp('(?:(?<=\\S)|^)[ ' + NB + '](?=:(?:\\s|$))', 'g'), NB],
  [new RegExp('(?:(?<=\\S)|^)[ ' + NB + '](?=[;!?](?:\\s|$|[»)]))', 'g'), NNB],
  [new RegExp('«[ ' + NNB + NB + ']?', 'g'), '«' + NB],
  [new RegExp('[ ' + NNB + NB + ']?»', 'g'), NB + '»'],
  [new RegExp('(?<=\\d) (?=' + UNITS + '(?![' + LETTER + '\\d/]))', 'g'), NB]
];
const samples = ["l'exercice d'aujourd'hui", ': ; ! ?', ' : au début', 'x : valeur ; autre ! oui ?',
  '« une réponse »', '12 € ; 5 % ; 3 kg ; 2 km/h', '12 euros ; 5 mots ; 1 xyz'];
const models = JSON.parse(fs.readFileSync(path.join(ROOT, 'exercices/suites.html'), 'utf8')
  .match(/<script type="application\/json" id="exercise-data">([\s\S]*?)<\/script>/)[1]);
for (const e of models.exercises) samples.push(e.statement, ...e.tasks, ...e.correction);
for (const sample of samples) {
  const expected = reference.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), sample);
  assert.equal(sandbox.window.FrenchTypography.fix(sample), expected, sample);
}

const geometric = JSON.parse(fs.readFileSync(path.join(ROOT, 'exercices/suites-geometriques.html'), 'utf8')
  .match(/<script type="application\/json" id="exercise-data">([\s\S]*?)<\/script>/)[1]);
const capital = geometric.exercises[3].fields[2];
assert.ok(V.matchesAnswer('182,51', capital.answer, 'number', capital.tolerance, capital.rounding));
assert.ok(V.matchesAnswer('182,505', capital.answer, 'number', capital.tolerance, capital.rounding));
assert.ok(!V.matchesAnswer('182,50', capital.answer, 'number', capital.tolerance, capital.rounding));
for (const name of ['variants-fonctions.js', 'variants-suites.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', name), 'utf8'), sandbox);
}
for (let seed = 1; seed <= 300; seed++) {
  for (const [index, offset] of [[1, 0], [5, 2], [6, 1]]) {
    const e = V.generate('second-degre', index, seed);
    const roots = e.fields.slice(offset, offset + 2);
    assert.ok(roots.every(f => f.answerGroup === 'roots'));
    const expected = roots.map(f => f.answer);
    assert.ok(V.matchesAnswerInGroup(expected[1], expected, [expected[0]]));
    assert.ok(V.matchesAnswerInGroup(expected[0], expected, [expected[1]]));
    assert.ok(!V.matchesAnswerInGroup(expected[0], expected, [expected[0]]));
  }
  const root = V.generate('fonctions', 8, seed);
  assert.ok(root.title.includes('√' + root.params.n));
  const sum = V.generate('suites-arithmetiques', 4, seed);
  const word = {4: 'quatre', 5: 'cinq', 6: 'six'}[sum.params.c];
  assert.ok(sum.title.includes(word));
}
console.log('SAFARI OK : chargement sans lookbehind, typographie inchangée, nombres français et centimes.');
