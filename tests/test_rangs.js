'use strict';
/* Variété des rangs : un modèle dont les réponses portent sur un terme de suite
   (u₅, v₁₀, A₂…) ou sur un rang (« au rang 10 ») doit demander d'autres rangs
   d'une variante à l'autre, et pas seulement d'autres nombres. */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert');
const root = path.resolve(__dirname, '..');
const sandbox = {window: {crypto: require('node:crypto').webcrypto}};
sandbox.crypto = sandbox.window.crypto;
vm.createContext(sandbox);
for (const file of ['exercices-variants.js', 'variants-fonctions.js', 'variants-suites.js', 'variants-analyse.js', 'variants-probabilites.js',
  'variants-reperes.js', 'variants-donnees.js', 'terminale-exercices.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', file), 'utf8'), sandbox, {filename: file});
}
const V = sandbox.window.ExerciseVariants;
// Terme d'une suite (lettre de suite suivie d'un indice) ou rang écrit en toutes lettres.
const RANK = /(?:^|[^A-Za-z])[uvwAG][₀-₉]|au rang \d|rangs? \d/;
let checked = 0;
for (const slug of V.slugs()) {
  for (let i = 0; i < V.count(slug); i++) {
    const labels = V.original(slug, i).fields.map(f => f.label).join(' ; ');
    if (!RANK.test(labels)) continue;
    checked++;
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed++) seen.add(V.generate(slug, i, seed * 7919).fields.map(f => f.label).join(' ; '));
    assert.ok(seen.size >= 2, `${slug}, exercice ${i + 1} : les rangs demandés ne changent jamais (${labels})`);
  }
}
assert.ok(checked >= 15, 'trop peu de modèles de rangs détectés : ' + checked);
console.log(`RANGS OK : ${checked} modèles portant sur des rangs, chacun demande plusieurs rangs différents selon la variante.`);
