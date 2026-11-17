#!/usr/bin/env node
/* Fichiers d'exercices par série (assets/serie-*.js, produits par tools/build_series.py) :
   chaque fichier donne exactement les mêmes exercices que le fichier complet de son niveau
   (ou, en Première, que l'ensemble des fichiers variants-*.js),
   et chaque page de série charge son fichier et les seules parties du moteur de figures
   dont ses figures ont besoin. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const lire = nom => fs.readFileSync(path.join(ROOT, 'assets', nom), 'utf8');
const MOTEUR = ['figures.js', 'figures-statistiques.js', 'figures-geometrie.js'];
const NIVEAUX = [
  {source: 'troisieme-exercices.js', dossier: 'troisieme/exercices', api: 'TroisiemeExercises', suite: []},
  {source: 'seconde-exercices.js', dossier: 'seconde/exercices', api: 'SecondeExercises', suite: []},
  {source: 'terminale-exercices.js', dossier: 'terminale/exercices', api: 'TerminaleExercises', suite: ['terminale-figures.js']}
];
const FAMILLES = {repere: 'figures.js', statistiques: 'figures-statistiques.js', pascal: 'figures-statistiques.js', arbre: 'figures-statistiques.js',
  figure: 'figures-geometrie.js', droite_numerique: 'figures-geometrie.js', espace: 'figures-geometrie.js', programme_trace: 'figures-geometrie.js'};
const SEEDS = 120;

function bac(fichiers) {
  const s = {window: {}, console};
  vm.createContext(s);
  for (const f of fichiers) vm.runInContext(lire(f), s, {filename: f});
  return s.window;
}
/* Parties du moteur que demande une figure (un diagramme circulaire ou de Venn se dessine avec la géométrie). */
function parties(d, vues) {
  if (!d) return;
  if (d.type === 'groupe') { d.figures.forEach(x => parties(x, vues)); return; }
  vues.add('figures.js');
  vues.add(FAMILLES[d.type]);
  if (d.type === 'statistiques' && /circulaire|venn/.test(d.elements[0].t)) vues.add('figures-geometrie.js');
}

let series = 0, comparaisons = 0;
for (const niveau of NIVEAUX) {
  const complet = bac(MOTEUR.concat(['exercices-variants.js', niveau.source], niveau.suite));
  for (const slug of complet[niveau.api].slugs) {
    const fichier = 'serie-' + slug + '.js';
    assert.ok(fs.existsSync(path.join(ROOT, 'assets', fichier)), fichier + ' manquant');
    assert.ok(lire(fichier).length < lire(niveau.source).length / 3, fichier + ' : plus léger que le fichier du niveau');
    const seul = bac(MOTEUR.concat(['exercices-variants.js', fichier], niveau.suite));
    assert.deepEqual(Array.from(seul[niveau.api].slugs), [slug], fichier + ' : une seule série');
    const A = complet.ExerciseVariants, B = seul.ExerciseVariants, vues = new Set();
    assert.equal(B.count(slug), A.count(slug), slug + ' : nombre de modèles');
    for (let i = 0; i < A.count(slug); i++) {
      for (let seed = 0; seed <= SEEDS; seed++) {
        const a = seed ? A.generate(slug, i, seed) : A.original(slug, i), b = seed ? B.generate(slug, i, seed) : B.original(slug, i);
        assert.equal(JSON.stringify(b), JSON.stringify(a), `${slug}/${i}/${seed} : même exercice avec le fichier de la série`);
        parties(a.figure, vues); parties(a.figure_correction, vues);
        comparaisons++;
      }
      assert.equal(JSON.stringify(seul.ExerciseCoaching.build(slug, i, B.original(slug, i))), JSON.stringify(complet.ExerciseCoaching.build(slug, i, A.original(slug, i))), slug + ' : mêmes aides');
    }
    /* La page charge le fichier de sa série, pas celui du niveau, et exactement les parties du moteur utiles. */
    const head = fs.readFileSync(path.join(ROOT, niveau.dossier, slug + '.html'), 'utf8').split('</head>')[0];
    assert.ok(head.includes('assets/' + fichier) && !head.includes('assets/' + niveau.source), slug + ' : la page charge le fichier de sa série');
    assert.ok(head.indexOf('assets/exercices-variants.js') < head.indexOf('assets/' + fichier) && head.indexOf('assets/' + fichier) < head.indexOf('assets/exercices-renderer.js'), slug + ' : ordre des scripts');
    for (const partie of MOTEUR) assert.equal(head.includes('assets/' + partie + '?') || head.includes('assets/' + partie + '"'), vues.has(partie), `${slug} : ${partie} ${vues.has(partie) ? 'manque dans la page' : 'chargé sans besoin'}`);
    series++;
  }
}
/* Première : les modèles viennent des fichiers variants-*.js ; la page ne charge que le fichier de sa série. */
{
  const groupes = fs.readdirSync(path.join(ROOT, 'assets')).filter(n => /^variants-[a-z]+\.js$/.test(n)).sort();
  const complet = bac(MOTEUR.concat(['exercices-variants.js'], groupes)), A = complet.ExerciseVariants;
  for (const slug of A.slugs()) {
    const fichier = 'serie-' + slug + '.js';
    assert.ok(fs.existsSync(path.join(ROOT, 'assets', fichier)), fichier + ' manquant');
    const B = bac(MOTEUR.concat(['exercices-variants.js', fichier])).ExerciseVariants, vues = new Set();
    assert.deepEqual(Array.from(B.slugs()), [slug], fichier + ' : une seule série');
    assert.equal(B.count(slug), A.count(slug), slug + ' : nombre de modèles');
    for (let i = 0; i < A.count(slug); i++) for (let seed = 0; seed <= SEEDS; seed++) {
      const a = seed ? A.generate(slug, i, seed) : A.original(slug, i), b = seed ? B.generate(slug, i, seed) : B.original(slug, i);
      assert.equal(JSON.stringify(b), JSON.stringify(a), `${slug}/${i}/${seed} : même exercice avec le fichier de la série`);
      parties(a.figure, vues); parties(a.figure_correction, vues);
      comparaisons++;
    }
    const head = fs.readFileSync(path.join(ROOT, 'exercices', slug + '.html'), 'utf8').split('</head>')[0];
    assert.ok(head.includes('assets/' + fichier) && !/assets\/variants-/.test(head), slug + ' : la page charge le fichier de sa série');
    for (const partie of MOTEUR) assert.equal(head.includes('assets/' + partie + '?') || head.includes('assets/' + partie + '"'), vues.has(partie), `${slug} : ${partie} ${vues.has(partie) ? 'manque dans la page' : 'chargé sans besoin'}`);
    series++;
  }
}
console.log(`SERIES OK : ${series} fichiers de série, ${comparaisons} exercices identiques à ceux du fichier complet.`);
