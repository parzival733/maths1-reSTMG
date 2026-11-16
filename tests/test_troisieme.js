/* Troisième : 96 modèles contrôlés sur 2 000 graines chacun, avec le moteur de
   production : bande de difficulté, variété, mise en forme, arrondis, recalcul
   indépendant, choix équilibrés et aides. */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const SEEDS = 2000;
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const filename of ['assets/figures.js', 'assets/figures-statistiques.js', 'assets/figures-geometrie.js', 'assets/exercices-variants.js', 'assets/troisieme-exercices.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, filename), 'utf8'), sandbox, {filename});
}
const V = sandbox.window.ExerciseVariants;
const T = sandbox.window.TroisiemeExercises;
assert.equal(T.slugs.length, 16);
assert.equal(T.count, 6);
const clean = (problems, where) => assert.equal(problems.length, 0, where + ' : ' + Array.from(problems).join(' | '));
const MISSION_PATTERNS = [/\+\s*[−-]/, /[−-]\s*[−-]\d/, /(?<![\d,.])1x/, /[+−]\s*0\b(?![,.]\d)/, /\bNaN\b|undefined|Infinity/, /\d\.\d/];
const FC = require('./figures_controle.js');
const avecFigure = new Set();
let figures = 0;
/* Longueurs, angles et points recalculés à partir du SVG de la figure. */
const proche = (a, b, tol, where) => assert.ok(Math.abs(a - b) <= tol, where + ' : ' + a + ' au lieu de ' + b);
function coherence(slug, index, e, where) {
  const P = e.params, cle = slug + '/' + index;
  if (e.figure_correction) {
    const a = FC.analyser(sandbox.window.Figures.svg(e.figure_correction)), p = FC.pointsNommes(a);
    if (cle === '3-transformations/0') {
      proche(FC.ecartDroite(p['A′'], p.O, p.A), 0, 0.6, where + ' : O, A et A′ alignés');
      proche(FC.distance(p.O, p['A′']) / FC.distance(p.O, p.A), Math.abs(P.k), 0.04 * Math.abs(P.k) + 0.02, where + ' : OA′ = |k| × OA');
      proche(FC.distance(p.O, p['B′']) / FC.distance(p.O, p.B), Math.abs(P.k), 0.04 * Math.abs(P.k) + 0.02, where + ' : OB′ = |k| × OB');
    }
    if (cle === '3-fonctions/3') {
      const ecarts = a.cercles.filter(c => c.f === 'point').map(c => FC.ecartCourbes(a, [c.x, c.y]));
      proche(Math.min(...ecarts), 0, 0.6, where + ' : point de la courbe');
      assert.equal(Math.max(...ecarts) > 3, !P.on, where + ' : A sur la courbe seulement si son ordonnée est l’image');
    }
  }
  if (!e.figure) return;
  const a = FC.analyser(sandbox.window.Figures.svg(e.figure)), p = FC.pointsNommes(a);
  if (cle === '3-pythagore/0') { proche(FC.distance(p.A, p.B) / FC.distance(p.A, p.C), P.a / P.b, 0.03 * P.a / P.b + 0.01, where + ' AB/AC'); proche(FC.angle(p.A, p.B, p.C), 90, 0.6, where + ' angle droit'); }
  if (cle === '3-pythagore/1') proche(FC.distance(p.F, p.G) / FC.distance(p.E, p.F), P.c / P.a, 0.03 * P.c / P.a + 0.01, where + ' FG/EF');
  if (cle === '3-pythagore/2') assert.equal(a.chemins.filter(c => c.f === 'angle-droit').length, 0, where + ' : angle droit non codé dans une réciproque');
  if (cle === '3-thales/0') { proche(FC.distance(p.A, p.M) / FC.distance(p.A, p.B), P.am / P.ab, 0.02, where + ' AM/AB'); proche(FC.ecartDroite(p.N, p.A, p.C), 0, 0.6, where + ' N sur (AC)'); }
  if (cle === '3-thales/2') assert.equal(a.chemins.filter(c => c.f === 'parallele').length, 0, where + ' : parallélisme non codé dans une réciproque');
  if (cle === '3-trigonometrie/0') proche(FC.angle(p.A, p.B, p.C), P.a, 0.7, where + ' angle en A');
  if (cle === '3-trigonometrie/2') proche(FC.angle(p.R, p.S, p.T), P.a, 0.7, where + ' angle en R');
  if (cle === '3-transformations/0') assert.ok(!a.textes.some(t => /′/.test(t.texte)), where + ' : images absentes de l’énoncé');
  if (cle === '3-transformations/3') assert.equal(a.cercles.filter(c => c.f === 'point').length, 1, where + ' : P seul dans l’énoncé');
  if (cle === '3-transformations/5') proche(FC.distance(p.O, p['M′']) / FC.distance(p.O, p.M), P.b / P.a, 0.04 * P.b / P.a + 0.02, where + ' : OM′/OM');
  if (['3-pythagore/0', '3-pythagore/1', '3-pythagore/3', '3-pythagore/4', '3-thales/1', '3-thales/3', '3-thales/5', '3-trigonometrie/0', '3-trigonometrie/1', '3-trigonometrie/2', '3-trigonometrie/3', '3-trigonometrie/5'].indexOf(cle) >= 0) assert.ok(a.textes.some(t => t.texte === '?'), where + ' : inconnue notée « ? »');
}
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
      /* Figures : valides, lisibles, sans la réponse dans l'énoncé. */
      if (e.figure || e.figure_correction) {
        clean(FC.controlerExercice(sandbox.window.Figures, e, V.visible), where + ' : figure');
        figures += (e.figure ? 1 : 0) + (e.figure_correction ? 1 : 0);
        avecFigure.add(slug + '/' + index);
        coherence(slug, index, e, where);
      }
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
assert.deepEqual(Object.fromEntries(Object.entries(Array.from(avecFigure).reduce((o, c) => { const k = c.split('/')[0]; o[k] = (o[k] || 0) + 1; return o; }, {})).sort()), Object.fromEntries(Object.entries({'3-pythagore': 6, '3-thales': 5, '3-trigonometrie': 6, '3-grandeurs': 4, '3-transformations': 6, '3-probabilites': 3, '3-fonctions': 1, '3-fonctions-affines': 2, '3-statistiques': 1, '3-algorithmique': 1}).sort()), 'modèles avec figure');
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(cases));
else console.log(`TROISIEME OK: 96 modèles × ${SEEDS} graines = ${variants} variantes ; bande de difficulté, ${choiceFields} champs à choix équilibrés, mise en forme, arrondis, recalcul et aides.`);
if (!process.argv.includes('--json')) console.log(`Figures des exercices : ${figures} figures contrôlées sur ${avecFigure.size} modèles.`);
