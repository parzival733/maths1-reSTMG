'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = {window: {}, document: {querySelector() { return null; }, getElementById() { return null; }}};
vm.createContext(context);
for (const file of ['exercices-variants.js', 'exercices-renderer.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', file), 'utf8'), context);
}
const V = context.window.ExerciseVariants;
const cases = [
  ['Durée pour 60 €, en h', '7', ['7 h', '7 heures', '14/2 h', '7,0 H'], ['7 min', '420 minutes', '7 €']],
  ['2,5 h en minutes', '150', ['150 min', '150 minutes', '300/2 min'], ['150 h', '150 m', '2,5 h']],
  ['0,75 km en m', '750', ['750 m', '750 mètres', '750 metres'], ['750 km', '0,75 km', '750 min']],
  ['18 m/s en km/h', '64.8', ['64,8 km/h', '64.8 km / h'], ['64,8 m/s', '64,8 h']],
  ['Vitesse en m/s', '18', ['18 m/s', '36/2 m / s'], ['18 m', '18 km/h']],
  ['C′(5), en €/unité', '12.5', ['12,5 €/unité', '12.5 EUR/unite', '12,5 euros par unité'], ['12,5 €', '12,5 h']],
  ['Écart en points d’indice', '4', ['4 points', "4 points d'indice", '4 points d’indice'], ['4 %', '4 h']],
  ['Gain en points', '2', ['2 points', '2 point'], ['2 %', '2 points d’indice']],
  ['Prix en €', '20', ['20 €', '20 EUR', '20 euros'], ['20 %', '20 h']],
  ['Taux en %', '-20', ['−20 %', '-20%'], ['−0,2 %', '−20 €']]
];
let checked = 0;
for (const [label, expected, good, bad] of cases) {
  const unit = V.unitForLabel(label);
  assert.ok(unit, label);
  for (const value of good) { assert.ok(V.matchesAnswer(value, expected, 'number', undefined, undefined, unit), label + ': ' + value); checked++; }
  for (const value of bad) { assert.ok(!V.matchesAnswer(value, expected, 'number', undefined, undefined, unit), label + ': ' + value); checked++; }
  assert.ok(V.matchesAnswer(expected, expected, 'number', undefined, undefined, unit));
}
for (const label of ['Coefficient en k = 1', 'Formule en B3', 'Premier rang strictement en dessous']) {
  assert.equal(V.unitForLabel(label), '');
}
assert.ok(!V.matchesAnswer('7 h', '7', 'number'));
assert.ok(!V.matchesAnswer('7 bananes', '7', 'number', undefined, undefined, 'bananes'));
assert.ok(!V.matchesAnswer('1/0 h', '7', 'number', undefined, undefined, 'h'));
assert.ok(V.matchesAnswer('182,51 €', '182.505', 'number', undefined, '2', '€'));
const R = context.window.ExerciseRenderer;
assert.equal(R.unitForLabel('Durée en h'), 'h');
assert.match(R.answerFormat('number', '3', 'h').description, /3 décimales/);
assert.match(R.answerFormat('unordered-list').description, /ordre est libre/);
console.log('FORMATS OK : ' + checked + ' réponses avec unités, mauvaises unités refusées, aucune conversion implicite.');
