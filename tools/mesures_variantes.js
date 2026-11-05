'use strict';
/* Mesures du rapport (docs/rapport-ameliorations.md, sections 3 et 4) : cinq variantes
   de cinq modèles avec leur score de difficulté, puis la répartition des bonnes réponses
   à choix sur 2 000 tirages de chaque modèle. Usage : node tools/mesures_variantes.js
   Les graines sont aléatoires, comme sur le site ; chaque ligne se reproduit avec
   ExerciseVariants.generate(chapitre, rang, graine). */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const sandbox = {window: {}}; vm.createContext(sandbox);
for (const f of ['exercices-variants.js','variants-fonctions.js','variants-suites.js','variants-analyse.js','variants-probabilites.js','variants-reperes.js','variants-donnees.js','terminale-exercices.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'assets',f),'utf8'), sandbox, {filename: f});
const V = sandbox.window.ExerciseVariants;
const SUP = {x: 'ˣ', n: 'ⁿ', 2: '²', 3: '³'};
const show = s => V.visible(s).replace(/\^([xn23])/g, (_, c) => SUP[c]).replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
const fmt = a => String(a).replace(/-/g, '−').replace(/(\d)\.(\d)/g, '$1,$2');
const out = {models: [], twoWay: [], multi: []};
for (const [slug, i] of [['second-degre', 5], ['suites-geometriques', 4], ['probabilites-conditionnelles', 7], ['derivees', 0], ['t-logarithme', 2]]) {
  const base = V.original(slug, i), rows = [], contexts = {};
  for (let k = 0; k < 5; k++) {
    const seed = crypto.randomInt(2 ** 31);
    const e = V.generate(slug, i, seed);
    rows.push({seed, statement: show(e.statement).slice(0, 150), difficulty: +e.difficulty.toFixed(1), ratio: +(e.difficulty / e.reference).toFixed(2), answers: e.fields.map(f => fmt(f.answer)).join(' ; ')});
  }
  let lo = Infinity, hi = 0, distinct = new Set();
  for (let n = 0; n < 2000; n++) { const e = V.generate(slug, i, crypto.randomInt(2 ** 31)); const r = e.difficulty / e.reference; lo = Math.min(lo, r); hi = Math.max(hi, r); distinct.add(show(e.statement)); const c = show(e.statement).split(/[,.]/)[0].slice(0, 40); contexts[c] = (contexts[c] || 0) + 1; }
  out.models.push({slug, index: i, reference: +base.reference.toFixed(1), base: show(base.statement).slice(0, 150), baseAnswers: base.fields.map(f => fmt(f.answer)).join(' ; '), rows,
    band: [+lo.toFixed(2), +hi.toFixed(2)], distinctOf2000: distinct.size, contexts: Object.keys(contexts).length > 1 && Object.keys(contexts).length < 8 ? Object.entries(contexts).map(([k, v]) => k + ' : ' + Math.round(v / 20) + ' %') : null});
}
for (const slug of V.slugs()) for (let i = 0; i < V.count(slug); i++) {
  const counts = {}, N = 2000;
  for (let n = 0; n < N; n++) { const e = V.generate(slug, i, crypto.randomInt(2 ** 31)); e.fields.forEach((f, j) => { if (f.options) (counts[j] = counts[j] || {})[f.answer] = ((counts[j] || {})[f.answer] || 0) + 1; }); }
  for (const [j, c] of Object.entries(counts)) {
    const values = Object.entries(c).map(([a, n]) => [a, 100 * n / N]).sort((a, b) => b[1] - a[1]);
    const item = {slug, index: i + 1, field: +j + 1, values: values.length, max: +values[0][1].toFixed(1), min: +values[values.length - 1][1].toFixed(1), shares: values.map(([a, s]) => a + ' ' + Math.round(s) + ' %').join(' · ').slice(0, 160)};
    (values.length === 2 ? out.twoWay : out.multi).push(item);
  }
}
const s = l => ({fields: l.length, min: Math.min(...l.map(x => x.min)), max: Math.max(...l.map(x => x.max))});
out.summary = {twoWay: s(out.twoWay), multi: s(out.multi), multiWorst: [...out.multi].sort((a, b) => b.max - a.max).slice(0, 6), twoWayWorst: [...out.twoWay].sort((a, b) => b.max - a.max).slice(0, 6)};
console.log(JSON.stringify(out, null, 1));
