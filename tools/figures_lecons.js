/* Figures des leçons des quatre niveaux. Chaque figure est décrite ici avec les
   nombres du texte qu'elle accompagne ; tools/figures_lecons.py la place dans
   l'élément <figure class="lesson-figure" data-figure="nom"> de la page.
   `node tools/figures_lecons.js` écrit toutes les descriptions en JSON. */
'use strict';
const path = require('node:path');
const F = require(path.resolve(__dirname, '..', 'assets', 'figures.js'));

const figures = {};
const def = (nom, b, description) => {
  if (figures[nom]) throw new Error('Figure déclarée deux fois : ' + nom);
  const d = typeof b.description === 'function' ? b.description() : b;
  if (description) d.description = description;
  figures[nom] = d;
};
const petit = {largeur: 210, hauteur: 180};

/* ====================================================================== 3e */

/* Fonctions */
const f3 = '0.25x^2+2';
def('3-fonctions-image', F.repere('Lecture graphique : l’image de 2 est 3', {xmin: -5, xmax: 5, ymin: -1, ymax: 8})
  .courbe(f3, {nom: 'C_f', nom_x: -3.6}).lecture(2, 3),
'En partant de 2 sur l’axe des abscisses, on monte jusqu’à la courbe, puis on lit 3 sur l’axe des ordonnées.');
def('3-fonctions-antecedents', F.repere('Lecture graphique : les antécédents de 6 sont −4 et 4', {xmin: -5, xmax: 5, ymin: -1, ymax: 8})
  .courbe(f3, {nom: 'C_f', nom_x: -2}).antecedents(6, {f: f3}),
'La droite horizontale d’ordonnée 6 coupe la courbe en deux points, d’abscisses −4 et 4.');

/* Fonctions linéaires et affines */
def('3-lineaire', F.repere('Droite d’équation y = 1,2x : elle passe par l’origine et par le point (45 ; 54)',
  {xmin: 0, xmax: 60, ymin: 0, ymax: 72, pas_x: 15, pas_y: 18, nom_x: 'prix initial (€)', nom_y: 'nouveau prix (€)'})
  .droite_affine(1.2, 0, {nom: 'y = 1,2x', nom_x: 24}).lecture(45, 54),
'La droite passe par l’origine. Pour un prix initial de 45 €, on lit un nouveau prix de 54 €.');
def('3-affine', F.repere('Droite d’équation y = 2x + 1 : quand x augmente de 1, y augmente de 2', {xmin: -3, xmax: 4, ymin: -3, ymax: 8})
  .droite_affine(2, 1, {nom: 'y = 2x + 1', nom_x: 2.9}).point(0, 1, 'b = 1', {pos: ['se', 'e']}).escalier(1, 3, 1, 2),
'La droite coupe l’axe des ordonnées en 1 (ordonnée à l’origine). Entre x = 1 et x = 2, elle monte de 3 à 5.');
def('3-tarifs', F.repere('Tarifs de piscine : les droites de f et de g se coupent pour x ≈ 11,67',
  {xmin: 0, xmax: 20, ymin: 0, ymax: 160, pas_x: 5, pas_y: 40, nom_x: 'nombre d’entrées', nom_y: 'prix en €'})
  .droite_affine(8, 0, {nom: 'f (tarif A)', nom_x: 17}).droite_affine(5, 35, {nom: 'g (tarif B)', pointilles: true, nom_x: 4})
  .lecture(35 / 3, 280 / 3, {vx: '≈ 11,67', vy: false}),
'La droite de f part de l’origine, celle de g part de 35 €. Elles se coupent pour x ≈ 11,67 : à partir de 12 entrées, g est en dessous de f.');

/* Proportionnalité */
def('3-proportionnalite', F.groupe('Points alignés avec l’origine : proportionnalité ; droite qui ne passe pas par l’origine : pas de proportionnalité', [
  F.repere('Proportionnalité', Object.assign({xmin: 0, xmax: 5, ymin: 0, ymax: 10}, petit)).nuage([[1, 2], [2, 4], [3, 6], [4, 8]]).droite_affine(2, 0, {pointilles: true, fin: true}),
  F.repere('Pas de proportionnalité', Object.assign({xmin: 0, xmax: 5, ymin: 0, ymax: 10}, petit)).nuage([[1, 3], [2, 5], [3, 7], [4, 9]]).droite_affine(2, 1, {pointilles: true, fin: true})
]));
def('3-echelle', F.figure('Échelle 1/25 000 : 4,5 cm sur la carte représentent 1 125 m sur le terrain', {hauteur: 110, marge: 30})
  .segment([0, 0], [4.5, 0], {epais: true})
  .cote_fleche([0, 0], [4.5, 0], '4,5 cm sur la carte', {pos: 'n', decalage: 12})
  .cote_fleche([0, 0], [4.5, 0], '1 125 m sur le terrain', {pos: 's', decalage: 12}));

/* Statistiques */
def('3-stat-barres', F.statistiques('Frères et sœurs : valeurs 0, 1, 2, 3 d’effectifs 3, 5, 8, 4')
  .diagramme_barres(['0', '1', '2', '3'], [3, 5, 8, 4], {nom_x: 'frères et sœurs', nom_y: 'effectif', pas_y: 2, valeurs_affichees: true}));
def('3-stat-etendue', (() => {
  const d = F.droite_numerique('Groupes A et B : étendue 3 pour A, étendue 12 pour B', {min: 5, max: 19, pas: 1, noms_lignes: ['A', 'B']});
  [10, 11, 12, 13].forEach(v => d.point(v, null, {ligne: 0, valeur: false}));
  d.point(12, null, {ligne: 0, valeur: false, empile: 1}).distance(10, 13, 'étendue 3', {ligne: 0});
  [6, 9, 10, 15, 18].forEach(v => d.point(v, null, {ligne: 1, valeur: false}));
  return d.distance(6, 18, 'étendue 12', {ligne: 1});
})(), 'Groupe A : 10, 11, 12, 12, 13. Groupe B : 6, 9, 10, 15, 18.');

/* Probabilités */
def('3-proba-roue', F.statistiques('Une roue qui donne les mêmes probabilités que l’urne : rouge 180°, bleu 108°, vert 72°')
  .diagramme_circulaire([{nom: 'rouge', angle: 180}, {nom: 'bleu', angle: 108}, {nom: 'vert', angle: 72}], {depart: 180}));
const tirage = suite => [{nom: 'R', p: '3/5', enfants: suite}, {nom: 'B', p: '2/5', enfants: suite}];
def('3-proba-arbre', F.arbre('Arbre de deux tirages avec remise dans un sac de 3 rouges et 2 bleus',
  tirage([{nom: 'R', p: '3/5'}, {nom: 'B', p: '2/5'}]), {chemin: ['R', 'R'], feuilles: ['3/5 × 3/5 = 9/25']}));

/* Grandeurs et solides */
def('3-volumes', F.groupe('Pavé droit de 40 cm × 25 cm × 30 cm ; cylindre de rayon r et de hauteur h', [
  F.espace('Pavé droit', petit).pave(40, 25, 30, {cotes: ['40 cm', '25 cm', '30 cm']}),
  F.espace('Cylindre', Object.assign({}, petit, {largeur: 150})).cylindre(3, 7, {cotes: ['r', 'h']})
]));
def('3-pyramide-cone', F.groupe('Pyramide à base carrée de 6 cm de côté et de hauteur 10 cm ; cône de rayon r et de hauteur h', [
  F.espace('Pyramide', Object.assign({}, petit, {hauteur: 210})).pyramide_carree(6, 10, {cotes: ['6 cm', '10 cm']}),
  F.espace('Cône', Object.assign({}, petit, {largeur: 150, hauteur: 210})).cone(3, 7, {cotes: ['r', 'h']})
]));
def('3-boule', F.espace('Boule de rayon 5 cm dans le cube d’arête 10 cm qui la contient exactement', {hauteur: 220})
  .cube(10, {cotes: ['10 cm']}).boule(5, {centre: [5, 5, 5], cotes: ['5 cm']}));
def('3-sections', F.groupe('Section d’un pavé droit par un plan parallèle à une face ; section d’un cône de hauteur 12 cm et de rayon 6 cm, à 4 cm du sommet', [
  F.espace('Section rectangulaire', petit).pave(8, 6, 5)
    .polygone([[3, 0, 0], [3, 6, 0], [3, 6, 5], [3, 0, 5]], {plein: 0.16, hachures: true}),
  F.espace('Disque de rayon 2 cm', petit)
    .ellipse([0, 0, 0], 6, null, {arriere: true}).segment([-6, 0, 0], [0, 0, 12]).segment([6, 0, 0], [0, 0, 12])
    .ellipse([0, 0, 8], 2, null, {arriere: true, plein: 0.16})
    .segment([0, 0, 0], [0, 0, 12], {pointilles: true, fin: true}).segment([0, 0, 0], [6, 0, 0], {pointilles: true, fin: true})
    .segment([0, 0, 8], [2, 0, 8], {fin: true})
    .cote([0, 0, -1.8], [6, 0, -1.8], '6 cm', {pos: 's'})
    .cote_fleche([6, 0, 8], [6, 0, 12], '4 cm', {pos: 'e', decalage: 6})
    .cote_fleche([-6, 0, 0], [-6, 0, 12], '12 cm', {pos: 'o', decalage: 6})
]));

/* Pythagore */
def('3-pythagore', F.figure('Triangle ABC rectangle en A, d’hypoténuse [BC]')
  .point('A', 0, 0).point('B', 0, 6).point('C', 8, 0).polygone(['A', 'B', 'C']).angle_droit('A', 'B', 'C')
  .cote('A', 'B', '6 cm').cote('A', 'C', '8 cm').cote('B', 'C', '?'));
def('3-pythagore-cote', F.figure('Triangle EFG rectangle en E : EF = 5, hypoténuse FG = 13', {hauteur: 170})
  .point('E', 0, 0).point('F', 0, 5).point('G', 12, 0).polygone(['E', 'F', 'G']).angle_droit('E', 'F', 'G')
  .cote('E', 'F', '5').cote('F', 'G', '13 (hypoténuse)').cote('E', 'G', '?'));
def('3-pythagore-repere', F.repere('A(1 ; 2) et B(4 ; 6) : écart horizontal 3, écart vertical 4',
  {xmin: 0, xmax: 6, ymin: 0, ymax: 7, orthonorme: true, hauteur: 290})
  .segment(1, 2, 4, 2, {pointilles: true}).segment(4, 2, 4, 6, {pointilles: true}).segment(1, 2, 4, 6, {epais: true})
  .point(1, 2, 'A', {pos: ['so', 'o']}).point(4, 6, 'B', {pos: ['ne', 'e']})
  .texte(2.5, 2, '3', {pos: 's'}).texte(4, 4, '4', {pos: 'e'}),
'Le segment [AB] est l’hypoténuse d’un triangle rectangle dont les côtés mesurent 3 et 4.');
def('3-pythagore-echelle', F.figure('Échelle de 5 m, pied à 1,4 m du mur', {hauteur: 230})
  .sol(-0.8, 2.6, 0).mur(0, 0, 5.3, {cote: 'g'}).point('P', 1.4, 0, {muet: true}).point('S', 0, 4.8, {muet: true}).point('O', 0, 0, {muet: true})
  .echelle('P', 'S').angle_droit('O', 'P', 'S')
  .cote_fleche('O', 'P', '1,4 m', {pos: 's', decalage: 14}).cote('P', 'S', '5 m', {pos: 'ne'}).cote_fleche('O', 'S', 'h', {pos: 'o', decalage: 16}));

/* Thalès : AB = 5, AC = 20/3, BC = 7, à l'échelle. */
{
  const A = [19 / 9, Math.sqrt(25 - 361 / 81)];
  def('3-thales', F.figure('Configuration de Thalès : (MN) parallèle à (BC)', {hauteur: 220})
    .point('A', A[0], A[1]).point('B', 0, 0).point('C', 7, 0)
    .point('M', null, null, {sur: ['A', 'B'], k: 0.6}).point('N', null, null, {sur: ['A', 'C'], k: 0.6})
    .polygone(['A', 'B', 'C']).segment('M', 'N').parallele('M', 'N').parallele('B', 'C')
    .cote('A', 'M', '3').cote('A', 'N', '4').cote('B', 'C', '7').cote_fleche('A', 'B', 'AB = 5', {decalage: 26}));
}
def('3-papillon', F.figure('Configuration papillon : triangles opposés par le sommet A', {hauteur: 220})
  .point('A', 0, 0, {pos: 'n'}).point('B', -3.4, 1.9).point('C', -2.6, -2.4)
  .point('M', null, null, {sur: ['A', 'B'], k: -0.6}).point('N', null, null, {sur: ['A', 'C'], k: -0.6})
  .segment('B', 'M').segment('C', 'N').segment('B', 'C').segment('M', 'N').parallele('B', 'C').parallele('N', 'M'));
{
  const cas = (titre, kn) => F.figure(titre, Object.assign({}, petit, {hauteur: 210}))
    .point('A', 0, 0).point('B', -3, -4).point('C', 6, -8)
    .point('M', null, null, {sur: ['A', 'B'], k: 0.6}).point('N', null, null, {sur: ['A', 'C'], k: kn})
    .polygone(['A', 'B', 'C']).segment('M', 'N')
    .cote('A', 'M', '3').cote('M', 'B', '2').cote('A', 'N', String(10 * kn)).cote('N', 'C', String(10 - 10 * kn));
  def('3-reciproque', F.groupe('Rapports égaux : (MN) et (BC) sont parallèles ; rapports différents : elles ne le sont pas', [
    cas('3/5 = 6/10', 0.6), cas('3/5 ≠ 5/10', 0.5)]));
}
def('3-semblables', F.figure('Deux triangles semblables : mêmes angles, côtés proportionnels', {hauteur: 170})
  .point('A', 0, 0).point('B', 4, 0).point('C', 1, 3).point('D', 6, 0).point('E', 12, 0).point('F', 7.5, 4.5)
  .polygone(['A', 'B', 'C']).polygone(['D', 'E', 'F'])
  .angle('A', 'B', 'C', {rayon: 14}).angle('D', 'E', 'F', {rayon: 14}).angle('B', 'C', 'A', {rayon: 14, double: true}).angle('E', 'F', 'D', {rayon: 14, double: true}));
def('3-ombres', F.figure('Bâton de 1,5 m et son ombre de 1,2 m ; arbre et son ombre de 9,6 m', {hauteur: 250})
  .sol(-1, 14.4, 0).baton([0, 0], [0, 1.5]).sapin(4, 0, 12)
  .segment([0, 1.5], [1.2, 0], {pointilles: true, fin: true}).segment([4, 12], [13.6, 0], {pointilles: true, fin: true})
  .ombre([0, 0], [1.2, 0]).ombre([4, 0], [13.6, 0])
  .cote([0, 0], [0, 1.5], '1,5 m', {pos: 'no'}).cote_fleche([0, 0], [1.2, 0], '1,2 m', {pos: 's', decalage: 12})
  .cote_fleche([4, 0], [13.6, 0], '9,6 m', {pos: 's', decalage: 12}).cote_fleche([4, 0], [4, 12], '?', {pos: 'o', decalage: 58}));

/* Trigonométrie */
def('3-trigo-noms', F.figure('Triangle ABC rectangle en B : côtés adjacent et opposé à l’angle en A', {hauteur: 190})
  .point('A', 0, 0).point('B', 8, 0).point('C', 8, 5).polygone(['A', 'B', 'C']).angle_droit('B', 'A', 'C').angle('A', 'B', 'C', {rayon: 26})
  .cote('A', 'B', 'côté adjacent').cote('B', 'C', 'côté opposé').cote('A', 'C', 'hypoténuse'));
def('3-trigo-longueur', F.figure('Triangle ABC rectangle en B : AC = 12 cm, angle de 35° en A')
  .point('A', 0, 0).point('B', 12 * Math.cos(35 * Math.PI / 180), 0).point('C', 12 * Math.cos(35 * Math.PI / 180), 12 * Math.sin(35 * Math.PI / 180))
  .polygone(['A', 'B', 'C']).angle_droit('B', 'A', 'C').angle('A', 'B', 'C', {texte: '35°', rayon: 28}).cote('A', 'C', '12 cm').cote('A', 'B', '?'));
{
  const h = 30 * Math.tan(40 * Math.PI / 180) + 1.6;
  def('3-trigo-immeuble', F.figure('Immeuble vu à 30 m sous un angle de 40°, les yeux à 1,6 m du sol', {hauteur: 240})
    .sol(-3, 36, 0).immeuble(30, 0, 5, h).observateur(0, 0, 1.6)
    .segment([0, 1.6], [30, 1.6], {pointilles: true, fin: true}).segment([0, 1.6], [30, h], {pointilles: true, fin: true})
    .angle([0, 1.6], [30, 1.6], [30, h], {texte: '40°', rayon: 34})
    .cote_fleche([0, 0], [30, 0], '30 m', {pos: 's', decalage: 14}).cote([0, 0], [0, 1.6], '1,6 m', {pos: 'o'}).cote_fleche([35, 0], [35, h], 'h', {pos: 'e', decalage: 10}));
}
def('3-trigo-rampe', F.figure('Pente de 8 % : 8 m de dénivelé pour 100 m à l’horizontale', {hauteur: 100, marge: 30})
  .rampe([[0, 0], [100, 0], [100, 8]]).angle_droit([100, 0], [0, 0], [100, 8], {taille: 6})
  .cote([0, 0], [100, 0], '100 m', {pos: 's'}).cote([100, 0], [100, 8], '8 m', {pos: 'e'}).angle([0, 0], [100, 0], [100, 8], {rayon: 70}).texte(26, 2, 'α', {pos: 'n', dist: 2}));

/* Transformations */
def('3-symetrie-axiale', F.figure('Symétrie d’axe (d) : la figure et son image se superposent par pliage', {hauteur: 190})
  .point('A', -4, 1).point('B', -1, 0.4).point('C', -2, 3).point('A′', 4, 1).point('B′', 1, 0.4).point('C′', 2, 3)
  .polygone(['A', 'B', 'C']).polygone(['A′', 'B′', 'C′']).droite([0, 0], [0, 3], {pointilles: true, nom: '(d)'})
  .segment('C', 'C′', {pointilles: true, fin: true}).codage('C', [0, 3], 2).codage([0, 3], 'C′', 2).angle_droit([0, 3], [0, 4], 'C′', {taille: 6}));
def('3-symetrie-translation', F.groupe('Symétrie de centre O : P(3 ; −2) a pour image P′(−3 ; 2) ; translation qui transforme B(−2 ; 1) en C(3 ; −1)', [
  F.repere('Symétrie centrale', Object.assign({xmin: -4, xmax: 4, ymin: -3, ymax: 3, orthonorme: true}, petit))
    .segment(3, -2, -3, 2, {pointilles: true, fin: true}).point(3, -2, 'P', {pos: ['se', 's']}).point(-3, 2, 'P′', {pos: ['no', 'n']}),
  F.repere('Translation', Object.assign({xmin: -4, xmax: 4, ymin: -3, ymax: 3, orthonorme: true}, petit))
    .vecteur(-2, 1, 3, -1).point(-2, 1, 'B', {pos: ['no', 'n']}).point(3, -1, 'C', {pos: ['se', 's']}).escalier(-2, 1, 5, -2)
]));
{
  const s = Array.from({length: 6}, (_, i) => [2 * Math.cos(i * Math.PI / 3), 2 * Math.sin(i * Math.PI / 3)]);
  const fig = F.figure('Hexagone régulier de centre O : la rotation de 60° envoie chaque sommet sur le suivant', {hauteur: 210}).point('O', 0, 0, {marque: true, pos: 'so'});
  'ABCDEF'.split('').forEach((n, i) => fig.point(n, s[i][0], s[i][1]));
  def('3-rotation', fig.polygone(['A', 'B', 'C', 'D', 'E', 'F']).segment('O', 'A', {pointilles: true, fin: true}).segment('O', 'B', {pointilles: true, fin: true})
    .angle('O', 'A', 'B', {texte: '60°'}).rotation_fleche('O', [2.45, 0], 60));
}
{
  const homothetie = (titre, k) => {
    const base = [[2.4, 1.8], [3.6, 2.2], [2.2, 3]], fig = F.figure(titre, Object.assign({}, petit, {hauteur: 200})).point('O', 0, 0, {marque: true, pos: k > 0 ? 'so' : 'e'});
    'ABC'.split('').forEach((n, i) => fig.point(n, base[i][0], base[i][1]).point(n + '′', k * base[i][0], k * base[i][1]));
    fig.polygone(['A', 'B', 'C']).polygone(['A′', 'B′', 'C′'], {epais: true});
    'ABC'.split('').forEach(n => fig.segment('O', k > 0 ? n + '′' : n, {pointilles: true, fin: true}).segment('O', k > 0 ? n : n + '′', {pointilles: true, fin: true}));
    return fig;
  };
  def('3-homothetie', F.groupe('Homothéties de centre O : avec k = 2, l’image est du même côté de O ; avec k = −2, elle est de l’autre côté', [
    homothetie('k = 2', 2), homothetie('k = −2', -2)]));
}
def('3-pyramide-reduite', F.espace('Pyramide coupée parallèlement à sa base : la petite pyramide est une réduction de rapport 0,5', {hauteur: 230})
  .section_pyramide(6, 10, 0.5, {hauteur: false}));
def('3-trace', F.programme_trace('Hexagone tracé par le lutin : 6 fois « avancer de 50, tourner de 60° »', 6, 60, {cote: '50', hauteur: 210}));

/* ================================================================= Seconde */

/* Nombres réels */
def('2-intervalles-bornes', F.droite_numerique('Intervalle fermé [a ; b] et intervalle ouvert ]a ; b[', {min: -5, max: 5, pas: 1, graduations: false, noms_lignes: ['[a ; b]', ']a ; b['], largeur: 300})
  .intervalle(-2, 3, {ligne: 0, textes: ['a', 'b']}).intervalle(-2, 3, {ligne: 1, ouvert_a: true, ouvert_b: true, textes: ['a', 'b']}));
def('2-intervalles', F.droite_numerique('[−3 ; 5] et [−1 ; 15] : intersection [−1 ; 5], réunion [−3 ; 15]',
  {min: -5, max: 17, pas: 2, noms_lignes: ['[−3 ; 5]', '[−1 ; 15]', 'intersection', 'réunion']})
  .intervalle(-3, 5, {ligne: 0}).intervalle(-1, 15, {ligne: 1}).intervalle(-1, 5, {ligne: 2}).intervalle(-3, 15, {ligne: 3}));
def('2-valeur-absolue', F.droite_numerique('|x − 3| ≤ 7 : les réels situés à une distance au plus 7 de 3', {min: -6, max: 12, pas: 2})
  .centre_rayon(3, 7));

/* Vecteurs */
def('2-vecteurs-egaux', F.figure('Vecteurs AB et CD égaux : ABDC est un parallélogramme', {hauteur: 190})
  .point('A', 0, 0).point('B', 4, 1).point('C', 1, 3).point('D', 5, 4)
  .segment('A', 'C', {pointilles: true, fin: true}).segment('B', 'D', {pointilles: true, fin: true}).vecteur('A', 'B', 'AB').vecteur('C', 'D', 'CD'));
def('2-chasles', F.groupe('Relation de Chasles : AB et BC placés bout à bout donnent AC ; règle du parallélogramme : AB + AD = AC', [
  F.figure('Bout à bout', petit).point('A', 0, 0).point('B', 4, 3).point('C', 7, 0.5)
    .vecteur('A', 'B', 'AB').vecteur('B', 'C', 'BC').vecteur('A', 'C', 'AC', {pointilles: true}),
  F.figure('Parallélogramme', petit).point('A', 0, 0).point('B', 5, 0.6).point('D', 1.6, 3).point('C', 6.6, 3.6)
    .vecteur('A', 'B', 'AB').vecteur('A', 'D', 'AD').vecteur('A', 'C', 'AC', {pointilles: true})
    .segment('B', 'C', {pointilles: true, fin: true}).segment('D', 'C', {pointilles: true, fin: true})
]));
def('2-coordonnees', F.repere('A(1 ; −2) et B(4 ; 3) : le vecteur AB a pour coordonnées (3 ; 5)', {xmin: -1, xmax: 6, ymin: -3, ymax: 4, orthonorme: true, hauteur: 300})
  .escalier(1, -2, 3, 5).vecteur(1, -2, 4, 3, 'AB').point(1, -2, 'A', {pos: ['so', 'o']}).point(4, 3, 'B', {pos: ['ne', 'n']}));
def('2-norme-milieu', F.repere('A(−1 ; 2), B(5 ; 10) et le milieu I(2 ; 6) de [AB] : écarts 6 et 8, AB = 10', {xmin: -2, xmax: 7, ymin: 0, ymax: 11, orthonorme: true, hauteur: 330})
  .segment(-1, 2, 5, 2, {pointilles: true}).segment(5, 2, 5, 10, {pointilles: true}).segment(-1, 2, 5, 10, {epais: true})
  .point(-1, 2, 'A', {pos: ['so', 'o']}).point(5, 10, 'B', {pos: ['ne', 'e']}).point(2, 6, 'I', {pos: ['no', 'n']})
  .texte(2, 2, '6', {pos: 's'}).texte(5, 6, '8', {pos: 'e'}));

/* Colinéarité */
def('2-alignes', F.repere('A(0 ; 1), B(2 ; 5) et C(6 ; 13) sont alignés', {xmin: -1, xmax: 8, ymin: 0, ymax: 14, pas_y: 2})
  .droite_affine(2, 1, {pointilles: true, fin: true}).escalier(0, 1, 2, 4).escalier(2, 5, 4, 8)
  .point(0, 1, 'A', {pos: ['se', 'e']}).point(2, 5, 'B', {pos: ['no', 'o']}).point(6, 13, 'C', {pos: ['no', 'o']}),
'De A à B, on avance de 2 et on monte de 4. De B à C, on avance de 4 et on monte de 8 : les déplacements sont proportionnels.');
{
  const M = [3.2, 4.6], u = [8, 2], t = (M[0] * u[0] + M[1] * u[1]) / (u[0] * u[0] + u[1] * u[1]), H = [t * u[0], t * u[1]];
  def('2-projete', F.figure('Le projeté orthogonal H de M sur la droite d', {hauteur: 190})
    .point('M', M[0], M[1]).point('H', H[0], H[1], {pos: ['s', 'se']}).point('P', 6.6, 1.65, {pos: ['s', 'se']})
    .droite([0, 0], [8, 2], {nom: 'd'}).segment('M', 'H').segment('M', 'P', {pointilles: true}).angle_droit('H', 'M', 'P', {taille: 8}));
}

/* Droites */
def('2-droite-reduite', F.repere('Droite (AB) d’équation y = 3x + 8, avec A(2 ; 14) et B(5 ; 23)', {xmin: 0, xmax: 7, ymin: 0, ymax: 28, pas_y: 4})
  .droite_affine(3, 8, {nom: 'y = 3x + 8', nom_x: 5.9}).escalier(2, 14, 3, 9).point(0, 8, 'p = 8', {pos: 'se'})
  .point(2, 14, 'A', {pos: ['no', 'n']}).point(5, 23, 'B', {pos: ['no', 'n']}),
'La droite coupe l’axe des ordonnées en 8. De A à B, x augmente de 3 et y de 9 : la pente vaut 3.');
def('2-positions', F.groupe('Même pente : droites parallèles ; pentes différentes : droites sécantes', [
  F.repere('m = m′ : parallèles', Object.assign({xmin: -3, xmax: 3, ymin: -3, ymax: 3, graduations: false}, petit)).droite_affine(1, 1).droite_affine(1, -1.5, {pointilles: true}),
  F.repere('m ≠ m′ : sécantes', Object.assign({xmin: -3, xmax: 3, ymin: -3, ymax: 3, graduations: false}, petit)).droite_affine(1, 1).droite_affine(-0.5, 0.5, {pointilles: true})
]));
def('2-systeme', F.repere('Les droites d’équations 2x + 6y = 78 et 5x + 4y = 107 se coupent au point (15 ; 8)', {xmin: 0, xmax: 24, ymin: 0, ymax: 16, pas_x: 3, pas_y: 2})
  .courbe('13-x/3', {nom: '2x + 6y = 78', nom_x: 21, pos: ['n']}).courbe('26.75-1.25x', {nom: '5x + 4y = 107', pointilles: true, nom_x: 11, pos: ['ne', 'e']}).lecture(15, 8),
'Le point d’intersection des deux droites a pour coordonnées (15 ; 8), solution du système.');

/* Fonctions */
def('2-courbe', F.repere('Le point A est sur la courbe de f : son ordonnée est l’image de son abscisse. Le point B n’y est pas', {xmin: -1, xmax: 5, ymin: -1, ymax: 5, graduations: false})
  .courbe('0.5(x-2)^2+1', {nom: 'C_f', nom_x: 0.2}).point(3.5, 2.125, 'A', {pos: ['se', 'e']}).point(1.5, 3.2, 'B', {pos: ['ne', 'n']}));
def('2-parite', F.groupe('x² + 1 : courbe symétrique par rapport à l’axe des ordonnées ; x³ − 2x : courbe symétrique par rapport à l’origine', [
  F.repere('Fonction paire', Object.assign({xmin: -3, xmax: 3, ymin: -1, ymax: 8}, petit)).courbe('x^2+1').lecture(2, 5, {vx: false, vy: false}).lecture(-2, 5, {vx: false, vy: false}),
  F.repere('Fonction impaire', Object.assign({xmin: -3, xmax: 3, ymin: -5, ymax: 5}, petit)).courbe('x^3-2x').segment(-2, -4, 2, 4, {pointilles: true, fin: true}).point(2, 4).point(-2, -4)
]));
def('2-resoudre', F.repere('Courbe de x² − 14 et droite d’ordonnée 2 : les solutions sont −4 et 4', {xmin: -6, xmax: 6, ymin: -16, ymax: 12, pas_x: 2, pas_y: 4})
  .courbe('x^2-14', {nom: 'y = x² − 14', nom_x: -3.2, pos: ['o', 'so']}).antecedents(2, {f: 'x^2-14'}),
'La droite horizontale d’ordonnée 2 coupe la courbe aux points d’abscisses −4 et 4.');

/* Fonctions de référence */
def('2-carre', F.repere('Fonction carré : x² ≤ 64 pour x entre −8 et 8', {xmin: -10, xmax: 10, ymin: 0, ymax: 100, pas_x: 2, pas_y: 20})
  .courbe('x^2', {nom: 'y = x²', nom_x: 9.3}).antecedents(64, {f: 'x^2'}).intervalle_solutions(-8, 8),
'La parabole est sous la droite d’ordonnée 64 pour x compris entre −8 et 8.');
def('2-inverse', F.repere('Fonction inverse : une hyperbole en deux branches, rien pour x = 0', {xmin: -5, xmax: 5, ymin: -5, ymax: 5, orthonorme: true, hauteur: 300})
  .courbe('1/x', {nom: 'y = 1/x', nom_x: 2.2}).point(1, 1).point(-1, -1),
'La branche de droite passe par (1 ; 1), celle de gauche par (−1 ; −1). Aucune ne traverse l’axe des ordonnées.');
def('2-racine', F.repere('Courbes de √x et de x sur [0 ; 4] : elles se coupent en (0 ; 0) et (1 ; 1)', {xmin: 0, xmax: 4, ymin: 0, ymax: 4, pas_x: 1, pas_y: 1, orthonorme: true, hauteur: 300})
  .courbe('sqrt(x)', {nom: 'y = √x', nom_x: 3.1}).droite_affine(1, 0, {nom: 'y = x', pointilles: true, nom_x: 2.6}).point(1, 1),
'Entre 0 et 1, la courbe de la racine carrée est au-dessus de la droite ; après 1, elle est en dessous.');
def('2-cube-abs', F.groupe('Fonction cube : courbe symétrique par rapport à l’origine ; fonction valeur absolue : deux demi-droites', [
  F.repere('y = x³', Object.assign({xmin: -2, xmax: 2, ymin: -8, ymax: 8, pas_y: 4}, petit)).courbe('x^3').point(1, 1).point(-1, -1),
  F.repere('y = |x|', Object.assign({xmin: -3, xmax: 3, ymin: -1, ymax: 4}, petit)).courbe('abs(x)')
]));

/* Variations */
def('2-variation', F.repere('Une fonction croissante puis décroissante : la courbe monte, puis descend', {xmin: -1, xmax: 7, ymin: 0, ymax: 6, graduations: false})
  .courbe('-0.4(x-3)^2+5', {de: -0.2, a: 6.2}).point(3, 5, 'maximum', {pos: 'n'}).texte(1.5, 1.3, 'croissante').texte(4.7, 1.3, 'décroissante'));
def('2-minimum', F.repere('f(x) = (x − 2)² − 3 : minimum −3, atteint en 2', {xmin: -2, xmax: 6, ymin: -4, ymax: 8, pas_y: 2})
  .courbe('(x-2)^2-3', {nom: 'C_f', nom_x: 4.6}).lecture(2, -3),
'Le point le plus bas de la courbe a pour coordonnées (2 ; −3).');
def('2-optimisation', F.repere('Aire A(x) = x(18 − x) : maximum 81 cm² pour x = 9', {xmin: 0, xmax: 18, ymin: 0, ymax: 90, pas_x: 3, pas_y: 27, nom_x: 'largeur x (cm)', nom_y: 'aire (cm²)'})
  .courbe('x(18-x)').lecture(9, 81),
'La courbe monte jusqu’au point (9 ; 81), puis redescend.');

/* Signes */
def('2-signe-affine', F.repere('2x − 6 s’annule en 3 : négative avant 3, positive après', {xmin: -1, xmax: 7, ymin: -8, ymax: 8, pas_y: 4})
  .droite_affine(2, -6, {nom: 'y = 2x − 6', nom_x: 5.6}).zone_signe(null, 3, 'négative', {signe: '-'}).zone_signe(3, null, 'positive', {signe: '+'}).point(3, 0));
def('2-signe-produit', F.repere('(x + 1)(x − 4) : positif avant −1 et après 4, négatif entre −1 et 4', {xmin: -4, xmax: 7, ymin: -8, ymax: 8, pas_y: 4})
  .droite_affine(1, 1, {pointilles: true, fin: true, nom: 'x + 1', nom_x: 5.4}).droite_affine(1, -4, {pointilles: true, fin: true, nom: 'x − 4', nom_x: -1.5})
  .courbe('(x+1)(x-4)', {nom: 'produit', nom_x: 4.95, pos: ['e', 'se']})
  .zone_signe(null, -1, '+', {signe: '+'}).zone_signe(-1, 4, '−', {signe: '-'}).zone_signe(4, null, '+', {signe: '+'}).point(-1, 0).point(4, 0),
'Les deux droites (en pointillés) s’annulent en −1 et en 4. La courbe du produit est au-dessus de l’axe avant −1 et après 4, en dessous entre −1 et 4.');

/* Probabilités et statistiques */
def('2-proba-arbre', F.arbre('Arbre pondéré : P(A) = 0,6 et P_A(B) = 0,3',
  [{nom: 'A', p: '0,6', enfants: [{nom: 'B', p: '0,3', feuille: 'P(A ∩ B) = 0,18'}, {nom: 'B̄', p: '0,7', feuille: 'P(A ∩ B̄) = 0,42'}]},
    {nom: 'Ā', p: '0,4', enfants: [{nom: 'B'}, {nom: 'B̄'}]}], {chemin: ['A', 'B'], largeur: 340}));
def('2-stat-dispersion', (() => {
  const d = F.droite_numerique('Deux séries de même moyenne : valeurs regroupées (petit écart type) ou dispersées (grand écart type)',
    {min: 0, max: 20, pas: 2, graduations: false, noms_lignes: ['valeurs regroupées', 'valeurs dispersées']});
  [8, 9, 9.5, 10, 10.5, 11, 12].forEach(v => d.point(v, null, {ligne: 0, valeur: false}));
  [2, 5, 8, 10, 12, 15, 18].forEach(v => d.point(v, null, {ligne: 1, valeur: false}));
  return d;
})());

/* ================================================================ Première */

/* Fonctions */
def('1-fonctions-courbe', (() => {
  const r = F.repere('Courbe de f(x) = (x − 2)² − 1 sur [0 ; 4]', {xmin: -1, xmax: 5, ymin: -2, ymax: 4}).courbe('(x-2)^2-1', {de: 0, a: 4});
  [[0, 3], [1, 0], [2, -1], [3, 0], [4, 3]].forEach(p => r.point(p[0], p[1]));
  return r;
})(), 'La courbe passe par (0 ; 3), (1 ; 0), (2 ; −1), (3 ; 0) et (4 ; 3). Elle est négative entre 1 et 3 et possède un minimum égal à −1 en 2.');
def('1-fonctions-secante', F.repere('Sécantes à la courbe de x² : pente 4 entre 1 et 3, pente 7 entre 3 et 4', {xmin: 0, xmax: 5, ymin: 0, ymax: 20, pas_y: 4})
  .courbe('x^2', {nom: 'y = x²', nom_x: 4.3, pos: ['no', 'o']}).secante('x^2', 1, 3, {nom: 'pente 4', demi: 0.7}).secante('x^2', 3, 4, {nom: 'pente 7', pointilles: true, demi: 0.45}),
'La sécante entre les points d’abscisses 1 et 3 monte de 8 pour 2 ; celle entre 3 et 4 monte de 7 pour 1.');

/* Second degré */
{
  const cas = (titre, f) => F.repere(titre, {xmin: -3, xmax: 3, ymin: -3, ymax: 5, graduations: false, largeur: 150, hauteur: 150, nom_x: '', nom_y: ''}).courbe(f);
  def('1-second-positions', F.groupe('Une parabole peut ne pas couper l’axe horizontal, le toucher en un point ou le couper en deux points', [
    cas('Aucune racine', 'x^2+1.2'), cas('Une racine', 'x^2'), cas('Deux racines', 'x^2-2')]));
}
const f1 = '2(x-1)(x-4)';
def('1-second-signe', F.repere('Signe de 2(x − 1)(x − 4) : positif à l’extérieur des racines 1 et 4, négatif entre elles', {xmin: -1, xmax: 6, ymin: -6, ymax: 10, pas_y: 2})
  .courbe(f1).zone_signe(null, 1, '+', {signe: '+'}).zone_signe(1, 4, '−', {signe: '-'}).zone_signe(4, null, '+', {signe: '+'}).point(1, 0).point(4, 0),
'La parabole coupe l’axe horizontal en 1 et en 4. Elle est au-dessus de l’axe avant 1 et après 4, en dessous entre 1 et 4.');
def('1-second-sommet', F.repere('Parabole de 2(x − 1)(x − 4) : axe x = 2,5 et sommet S(2,5 ; −4,5)', {xmin: -1, xmax: 6, ymin: -6, ymax: 10, pas_y: 2})
  .courbe(f1).droite_verticale(2.5, {pointilles: true, fin: true, nom: 'x = 2,5'}).point(1, 0).point(4, 0).point(2.5, -4.5, 'S', {pos: ['s', 'se']}),
'Les points (1 ; 0) et (4 ; 0) sont symétriques par rapport à la droite verticale x = 2,5, qui passe par le sommet S(2,5 ; −4,5).');
def('1-second-benefice', F.repere('Bénéfice B(x) = −2(x − 1)(x − 5), en centaines d’euros pour x dizaines d’articles : positif entre 1 et 5, maximal en 3',
  {xmin: 0, xmax: 6, ymin: -12, ymax: 10, pas_y: 4, nom_x: 'x', nom_y: 'B(x)'})
  .courbe('-2(x-1)(x-5)', {de: 0, a: 6}).zone_signe(1, 5, 'bénéfice', {signe: '-'}).lecture(3, 8, {vx: false}).point(1, 0).point(5, 0),
'La courbe est au-dessus de l’axe horizontal entre 1 et 5. Son point le plus haut est (3 ; 8).');

/* Dérivées */
def('1-derivee-secantes', (() => {
  const r = F.repere('Courbe de x² : les sécantes passant par A(2 ; 4) se rapprochent de la tangente, de pente 4', {xmin: 0, xmax: 4, ymin: 0, ymax: 14, pas_x: 1, pas_y: 2})
    .courbe('x^2');
  [3.5, 3, 2.5].forEach(b => r.secante('x^2', 2, b, {pointilles: true, fin: true}));
  return r.tangente('x^2', 2, {nom: 'tangente', epais: true}).point(2, 4, 'A', {pos: ['no', 'o']});
})(), 'Trois sécantes (en pointillés) relient A aux points d’abscisses 3,5, 3 et 2,5 ; leurs pentes 5,5, 5 et 4,5 se rapprochent de 4, pente de la tangente (trait épais).');
def('1-derivee-tangente', F.repere('Tangente en A(2 ; 4) : elle passe par P(1 ; 0) et Q(3 ; 8), sa pente vaut 4', {xmin: -1, xmax: 4, ymin: -2, ymax: 10, pas_y: 2})
  .courbe('x^2').tangente('x^2', 2).escalier(1, 0, 2, 8).point(2, 4, 'A', {pos: ['no', 'o']}).point(1, 0, 'P', {pos: ['se', 's']}).point(3, 8, 'Q', {pos: ['no', 'o']}),
'De P à Q, la tangente avance de 2 et monte de 8.');

/* Variations */
{
  const commun = {xmin: -2, xmax: 5, largeur: 320, hauteur: 190};
  def('1-variations-degre3', F.groupe('f(x) = x³ − 3x² − 9x + 2 et sa dérivée sur [−2 ; 5] : f change de sens là où f′ s’annule, en −1 et en 3', [
    F.repere('Courbe de f', Object.assign({ymin: -30, ymax: 10, pas_y: 10, nom_y: 'f(x)'}, commun)).courbe('x^3-3x^2-9x+2')
      .lecture(-1, 7, {vy: false}).lecture(3, -25, {vy: false}),
    F.repere('Courbe de f′', Object.assign({ymin: -15, ymax: 40, pas_y: 10, nom_y: 'f′(x)'}, commun)).courbe('3x^2-6x-9')
      .zone_signe(null, -1, '+', {signe: '+'}).zone_signe(-1, 3, '−', {signe: '-'}).zone_signe(3, null, '+', {signe: '+'}).point(-1, 0).point(3, 0)
  ], {vertical: true}),
  'En haut, f monte jusqu’à 7 en −1, descend jusqu’à −25 en 3, puis remonte. En bas, f′ est positive avant −1, négative entre −1 et 3, positive après 3.');
}
def('1-variations-benefice', F.repere('Bénéfice B(q) = −q² + 12q − 20, en centaines d’euros pour q dizaines d’articles : maximum 16 pour q = 6',
  {xmin: 0, xmax: 12, ymin: -24, ymax: 20, pas_x: 2, pas_y: 8, nom_x: 'q', nom_y: 'B(q)'})
  .courbe('-x^2+12x-20', {de: 0, a: 12}).lecture(6, 16),
'La courbe monte de −20 à 16 entre 0 et 6, puis redescend à −20 en 12.');

/* Suites */
def('1-suites-nuage', F.repere('Points (n ; u(n)) de la suite u(n) = n² + 2, pour n de 0 à 4', {xmin: 0, xmax: 5, ymin: 0, ymax: 20, pas_x: 1, pas_y: 4, nom_x: 'n', nom_y: 'u(n)'})
  .suite_points('n^2+2', 0, 4),
'Les points (0 ; 2), (1 ; 3), (2 ; 6), (3 ; 11) et (4 ; 18) ne sont pas reliés et ne sont pas alignés.');
def('1-arithmetique-points', F.repere('Suite arithmétique : points alignés, on monte de r quand n augmente de 1', {xmin: 0, xmax: 6, ymin: 0, ymax: 10, graduations: false, nom_x: 'n', nom_y: 'u(n)'})
  .droite_affine(1.4, 1.6, {pointilles: true, fin: true}).suite_points('1.6+1.4n', 0, 5).escalier(2, 4.4, 1, 1.4, {tx: '+1', ty: '+r'}).texte(0, 1.6, 'u(0)', {pos: 'se'}));
def('1-geometriques-croissances', (() => {
  const g = Array.from({length: 21}, (_, n) => [n, 1000 * Math.pow(1.04, n)]);
  return F.repere('A(n) = 1 000 + 50n et G(n) = 1 000 × 1,04ⁿ : G dépasse A à partir du rang 12', {xmin: 0, xmax: 20, ymin: 1000, ymax: 2200, pas_x: 4, pas_y: 200, nom_x: 'n', nom_y: 'valeur'})
    .suite_points('1000+50n', 0, 20).nuage(g, {forme: 'croix'}).droite_verticale(12, {pointilles: true, fin: true, nom: 'rang 12'})
    .legende([{forme: 'rond', texte: 'A(n)'}, {forme: 'croix', texte: 'G(n)'}]);
})(), 'Jusqu’au rang 11, les points de A (ronds) sont au-dessus de ceux de G (croix). À partir du rang 12, ceux de G passent au-dessus et s’en éloignent.');

/* Statistiques */
def('1-stats-boite', F.statistiques('Diagramme en boîte des huit durées : minimum 8, Q₁ = 10, médiane 13, Q₃ = 16, maximum 20')
  .boite(8, 10, 13, 16, 20, {nom_x: 'durée (min)', pas: 2}));
def('1-stats-histogramme', F.repere('Histogramme à classes inégales : hauteurs 2 et 1,5, aires proportionnelles aux effectifs 20 et 30',
  {xmin: 0, xmax: 30, ymin: 0, ymax: 2.5, pas_x: 10, pas_y: 0.5, grille: 'y', origine: false, nom_x: 'valeur', nom_y: 'effectif ÷ largeur'})
  .rect(0, 0, 10, 2, {plein: true}).rect(10, 0, 30, 1.5, {plein: true}).texte(5, 1, '20').texte(20, 0.75, '30'));
const nuage1 = [[1, 12], [2, 15], [3, 19], [4, 22]];
def('1-deux-variables-nuage', F.repere('Nuage de points et droite y = 3,4x + 8,5',
  {xmin: 0, xmax: 5, ymin: 0, ymax: 30, pas_y: 5, nom_x: 'budget (centaines d’€)', nom_y: 'articles (dizaines)'})
  .droite_affine(3.4, 8.5, {nom: 'y = 3,4x + 8,5', nom_x: 3.6, pos: ['se', 's']}).nuage(nuage1).point_moyen(2.5, 17, 'G', {pos: ['no', 'n']}),
'Les points observés sont (1 ; 12), (2 ; 15), (3 ; 19), (4 ; 22). Le point moyen est G(2,5 ; 17). La droite d’ajustement passe près des quatre points.');
def('1-deux-variables-extrapolation', F.repere('Interpolation dans la plage observée (x entre 1 et 4), extrapolation au-delà : pour x = 6, le modèle donne 28,9',
  {xmin: 0, xmax: 7, ymin: 0, ymax: 35, pas_y: 5, nom_x: 'budget (centaines d’€)', nom_y: 'articles (dizaines)'})
  .rect(1, 0, 4, 35, {plein: 0.1, sans_contour: true}).texte(2.5, 32, 'plage observée').texte(5.5, 32, 'extrapolation')
  .droite_affine(3.4, 8.5).nuage(nuage1).point_moyen(2.5, 17, 'G', {pos: ['se', 's']}).lecture(6, 28.9),
'La bande grisée couvre les abscisses observées, de 1 à 4 ; le point moyen G(2,5 ; 17) s’y trouve. Le point d’abscisse 6 est en dehors.');

/* Probabilités */
def('1-proba-venn', F.statistiques('Les 200 clients : 30 dans A seulement, 90 dans A et B, 20 dans B seulement, 60 ni dans A ni dans B', {hauteur: 190})
  .diagramme_venn('A', 'B', {a_seul: 30, inter: 90, b_seul: 20, hors: 60}, {zone: 'inter'}));
def('1-proba-arbre', F.arbre('Arbre pondéré des fournisseurs : P(A) = 0,70, puis défaut D ou non',
  [{nom: 'A', p: '0,70', enfants: [{nom: 'D', p: '0,02', feuille: '0,014'}, {nom: 'D̄', p: '0,98', feuille: '0,686'}]},
    {nom: 'Ā', p: '0,30', enfants: [{nom: 'D', p: '0,05', feuille: '0,015'}, {nom: 'D̄', p: '0,95', feuille: '0,285'}]}], {chemins: [['A', 'D'], ['Ā', 'D']]}));
const essais = (p, q, n) => (n ? [{nom: 'S', p, enfants: essais(p, q, n - 1)}, {nom: 'E', p: q, enfants: essais(p, q, n - 1)}] : undefined);
def('1-bernoulli-deux', F.arbre('Deux essais avec p = 0,2 : les chemins SE et ES donnent exactement un succès', essais('0,2', '0,8', 2),
  {chemins: [['S', 'E'], ['E', 'S']], feuilles: ['SS : 0,04', 'SE : 0,16', 'ES : 0,16', 'EE : 0,64']}));
def('1-bernoulli-trois', F.arbre('Trois essais avec p = 0,2 : les chemins SSE, SES et ESS donnent exactement deux succès', essais('0,2', '0,8', 3),
  {chemins: [['S', 'S', 'E'], ['S', 'E', 'S'], ['E', 'S', 'S']], feuilles: ['0,008', '0,032', '0,032', '0,128', '0,032', '0,128', '0,128', '0,512']}));
def('1-loi-batons', F.statistiques('Loi de X : P(X = −2) = 1/2, P(X = 1) = 1/3, P(X = 4) = 1/6')
  .diagramme_batons([-2, 1, 4], [1 / 2, 1 / 3, 1 / 6], {nom_x: 'gain net (€)', nom_y: 'probabilité', pas_y: 0.1}));

/* Logique et ensembles */
def('1-logique-intervalles', F.droite_numerique('A = [−2 ; 3] et B = ]1 ; 5] : intersection ]1 ; 3], réunion [−2 ; 5]',
  {min: -4, max: 7, pas: 1, noms_lignes: ['A', 'B', 'A ∩ B', 'A ∪ B']})
  .intervalle(-2, 3, {ligne: 0}).intervalle(1, 5, {ligne: 1, ouvert_a: true}).intervalle(1, 3, {ligne: 2, ouvert_a: true}).intervalle(-2, 5, {ligne: 3}));
{
  const venn = (titre, zone) => F.statistiques(titre, {largeur: 150, hauteur: 110}).diagramme_venn('A', 'B', {}, {zone});
  def('1-logique-venn', F.groupe('Intersection, réunion et complémentaire : la partie grisée est l’ensemble nommé', [
    venn('A ∩ B', 'inter'), venn('A ∪ B', 'union'), venn('Ā', 'hors_a')]));
}

/* =============================================================== Terminale */

/* Suites et sommes */
def('t-suites-versements', F.statistiques('Six versements de 100 € à 200 € : leur somme vaut 900 €')
  .diagramme_barres(['1', '2', '3', '4', '5', '6'], [100, 120, 140, 160, 180, 200], {nom_x: 'versement', nom_y: 'montant (€)', pas_y: 50, valeurs_affichees: true}));
def('t-suites-capital', F.statistiques('Valeur finale de chaque versement de 100 € : 104,04 €, 102 € et 100 €, soit 306,04 €')
  .diagramme_barres(['1er', '2e', '3e'], [104.04, 102, 100], {nom_x: 'versement', nom_y: 'valeur finale (€)', pas_y: 25, ymax: 125, valeurs_affichees: true}));

/* Exponentielles */
def('t-exp-prolongement', F.repere('u(n) = 100 × 1,2ⁿ aux rangs entiers, prolongée par la courbe de f(x) = 100 × 1,2ˣ',
  {xmin: 0, xmax: 6, ymin: 0, ymax: 300, pas_y: 50, nom_x: 'x', nom_y: 'valeur'})
  .courbe('100*1.2^x', {fin: true}).suite_points('100*1.2^n', 0, 6),
'Les points d’abscisses entières 0 à 6 sont sur la courbe continue, qui donne aussi une valeur entre deux rangs.');
{
  const cas = (titre, f) => F.repere(titre, Object.assign({xmin: -3, xmax: 3, ymin: 0, ymax: 5, graduations: false}, petit)).courbe(f).point(0, 1, '1', {pos: ['no', 'o']});
  def('t-exp-variations', F.groupe('Fonction x ↦ aˣ : croissante si a > 1, décroissante si 0 < a < 1 ; elle passe toujours par (0 ; 1)', [
    cas('a > 1', '1.7^x'), cas('0 < a < 1', '0.6^x')]));
}
def('t-exp-intermediaire', F.repere('Entre A(0 ; 4) et B(2 ; 36), la courbe exponentielle passe par (1 ; 12)', {xmin: -1, xmax: 3, ymin: 0, ymax: 48, pas_y: 12})
  .courbe('4*3^x').point(0, 4, 'A', {pos: ['se', 'e']}).point(2, 36, 'B', {pos: ['no', 'o']}).lecture(1, 12),
'Le point d’abscisse 1, milieu de 0 et 2, a pour ordonnée 12, moyenne géométrique de 4 et 36.');

/* Logarithme */
def('t-log-courbe', F.repere('Courbe de la fonction log : elle passe par (1 ; 0), (10 ; 1) et (100 ; 2)', {xmin: 0, xmax: 110, ymin: -1, ymax: 3, pas_x: 10, pas_y: 1})
  .courbe('log(x)', {de: 0.1}).point(1, 0).point(10, 1).point(100, 2).lecture(10, 1, {point: false}).lecture(100, 2, {point: false}),
'La courbe monte très vite près de 0, puis de plus en plus lentement : il faut passer de 10 à 100 pour gagner une unité.');
def('t-log-seuil', F.repere('f(x) = 500 × 1,04ˣ atteint 1 000 pour x ≈ 17,67', {xmin: 0, xmax: 25, ymin: 0, ymax: 1500, pas_x: 5, pas_y: 250, nom_x: 'périodes', nom_y: 'quantité'})
  .courbe('500*1.04^x').antecedents(1000, {f: '500*1.04^x'}),
'La droite horizontale d’ordonnée 1 000 coupe la courbe au point d’abscisse 17,67 environ : le premier rang entier qui convient est 18.');

/* Fonction inverse */
def('t-inverse-asymptotes', F.repere('g(x) = 5 + 3/x : asymptote verticale x = 0 et asymptote horizontale y = 5', {xmin: -6, xmax: 6, ymin: -4, ymax: 14, pas_x: 2, pas_y: 2})
  .courbe('5+3/x').asymptote_h(5, {nom: 'y = 5'}),
'Les deux branches de la courbe se rapprochent de la droite horizontale y = 5 à gauche et à droite, et longent l’axe vertical près de 0.');
def('t-inverse-tangente', F.repere('f(x) = 4/x : tangente au point A(2 ; 2), d’équation y = −x + 4', {xmin: 0, xmax: 8, ymin: 0, ymax: 8, orthonorme: true, hauteur: 300})
  .courbe('4/x', {de: 0.4}).tangente('4/x', 2, {nom: 'y = −x + 4'}).point(2, 2, 'A', {pos: ['ne', 'e']}),
'La tangente coupe les axes en (0 ; 4) et (4 ; 0) et touche la courbe en A(2 ; 2).');
def('t-inverse-cout', F.repere('Coût moyen C(x) = x + 16/x + 5 : minimum 13, atteint pour x = 4', {xmin: 0, xmax: 12, ymin: 0, ymax: 30, pas_x: 2, pas_y: 5, nom_x: 'x', nom_y: 'coût moyen'})
  .courbe('x+16/x+5', {de: 0.5}).lecture(4, 13),
'La courbe descend jusqu’au point (4 ; 13), puis remonte.');

/* Statistiques à deux variables */
def('t-stats-mayer', F.repere('Méthode de Mayer : la droite passe par les points moyens G₁(1,5 ; 13,5) et G₂(3,5 ; 20,5)',
  {xmin: 0, xmax: 5, ymin: 0, ymax: 30, pas_y: 5, nom_x: 'budget (centaines d’€)', nom_y: 'articles (dizaines)'})
  .droite_affine(3.5, 8.25).nuage(nuage1).point_moyen(1.5, 13.5, 'G₁', {pos: ['no', 'n']}).point_moyen(3.5, 20.5, 'G₂', {pos: ['no', 'n']}),
'Les quatre observations sont des points pleins ; G₁ et G₂, entourés, sont les points moyens des deux moitiés du nuage.');
{
  const p = {largeur: 210, hauteur: 190};
  def('t-stats-carre', F.groupe('Avec z = x², les points du modèle y = 2x² + 3 s’alignent sur la droite y = 2z + 3', [
    F.repere('(x ; y) : courbure', Object.assign({xmin: 0, xmax: 5, ymin: 0, ymax: 40, pas_y: 10}, p)).courbe('2x^2+3', {fin: true, pointilles: true}).nuage([[1, 5], [2, 11], [3, 21], [4, 35]]),
    F.repere('(z ; y) : alignement', Object.assign({xmin: 0, xmax: 20, ymin: 0, ymax: 40, pas_x: 4, pas_y: 10, nom_x: 'z'}, p)).droite_affine(2, 3, {fin: true, pointilles: true}).nuage([[1, 5], [4, 11], [9, 21], [16, 35]])
  ]));
  const pts = [0, 1, 2, 3, 4].map(x => [x, Math.pow(10, 0.2 * x + 1)]);
  def('t-stats-log', F.groupe('Avec z = log(y), les points du modèle log(y) = 0,2x + 1 s’alignent', [
    F.repere('(x ; y) : courbure', Object.assign({xmin: 0, xmax: 5, ymin: 0, ymax: 80, pas_y: 20}, p)).courbe('10^(0.2x+1)', {fin: true, pointilles: true}).nuage(pts),
    F.repere('(x ; z) : alignement', Object.assign({xmin: 0, xmax: 5, ymin: 0, ymax: 2, pas_y: 0.5, nom_y: 'z'}, p)).droite_affine(0.2, 1, {fin: true, pointilles: true}).nuage(pts.map(q => [q[0], 0.2 * q[0] + 1]))
  ]));
}

/* Probabilités */
def('t-cond-arbre', F.arbre('Arbre pondéré : P(A) = 0,6 et P_A(B) = 0,2',
  [{nom: 'A', p: '0,6', enfants: [{nom: 'B', p: '0,2', feuille: 'P(A ∩ B) = 0,12'}, {nom: 'B̄', p: '0,8'}]},
    {nom: 'Ā', p: '0,4', enfants: [{nom: 'B'}, {nom: 'B̄'}]}], {chemin: ['A', 'B'], largeur: 340}));
def('t-cond-trois', F.arbre('Trois groupes de poids 0,2, 0,3 et 0,5 : P(D) = 0,002 + 0,006 + 0,020 = 0,028',
  [['A', '0,2', '0,01', '0,99', '0,002'], ['B', '0,3', '0,02', '0,98', '0,006'], ['C', '0,5', '0,04', '0,96', '0,020']]
    .map(g => ({nom: g[0], p: g[1], enfants: [{nom: 'D', p: g[2], feuille: g[4]}, {nom: 'D̄', p: g[3]}]})),
  {chemins: [['A', 'D'], ['B', 'D'], ['C', 'D']]}));
def('t-binomiale-pascal', F.pascal('Triangle de Pascal jusqu’à n = 5 : 10 chemins avec exactement 2 succès sur 5 essais', 5, {coefficient: [5, 2]}));
{
  const loi = [0, 1, 2, 3, 4, 5].map(k => [1, 5, 10, 10, 5, 1][k] * Math.pow(0.2, k) * Math.pow(0.8, 5 - k));
  def('t-binomiale-batons', F.statistiques('Loi binomiale B(5 ; 0,2) : P(X = 2) = 0,2048')
    .diagramme_batons([0, 1, 2, 3, 4, 5], loi, {nom_x: 'k', nom_y: 'P(X = k)', pas_y: 0.1}),
  'Les probabilités valent environ 0,328 pour 0, 0,410 pour 1, 0,205 pour 2, 0,051 pour 3, 0,006 pour 4 et 0,0003 pour 5.');
}
def('t-variables-loi', F.statistiques('Loi de X : P(X = −2) = 0,2, P(X = 0) = 0,5, P(X = 4) = 0,3')
  .diagramme_batons([-2, 0, 4], [0.2, 0.5, 0.3], {nom_x: 'valeur de X', nom_y: 'probabilité', pas_y: 0.1}));

/* Sujets blancs, brevet blanc et problèmes : les nombres sont ceux de chaque sujet. */
def('3-brevet-rampe', F.figure('Triangle ABC rectangle en B, à l’échelle : AB = 4 m et BC = 0,3 m', {largeur: 340, hauteur: 110})
  .point('A', 0, 0).point('B', 4, 0).point('C', 4, 0.3).polygone(['A', 'B', 'C']).angle_droit('B', 'A', 'C', {taille: 7})
  .cote('A', 'B', '4 m').cote_fleche('B', 'C', '0,3 m'));
def('3-brevet-tarifs', F.repere('Tarif A en trait plein, tarif B en pointillés : même prix, 54 €, pour 12 entrées',
  {xmin: 0, xmax: 24, ymin: 0, ymax: 110, pas_x: 4, pas_y: 20, nom_x: 'entrées', nom_y: 'prix (€)', hauteur: 260})
  .droite_affine(4.5, 0, {nom: 'A'}).droite_affine(2, 30, {nom: 'B', pointilles: true}).lecture(12, 54),
'La droite du tarif A part de l’origine ; celle du tarif B part de 30 €. Elles se coupent au point (12 ; 54) ; au-delà de 12 entrées, la droite du tarif B est en dessous.');
def('s-blanc1-benefice', F.repere('Courbe de B sur [0 ; 10] : bénéfice nul pour x = 2 et x = 10, maximal en x = 6',
  {xmin: 0, xmax: 11, ymin: -22, ymax: 20, pas_x: 2, pas_y: 5, nom_x: 'x', nom_y: 'B(x)', hauteur: 260})
  .courbe('-x^2+12x-20', {de: 0, a: 10}).point(2, 0).point(10, 0).lecture(6, 16),
'La courbe part du point (0 ; −20), coupe l’axe des abscisses en 2, monte jusqu’au point (6 ; 16), puis redescend jusqu’au point (10 ; 0).');
{
  const donnees = [[1, 12], [2, 16], [3, 18], [4, 22]], cadre = {xmin: 0, xmax: 7, ymin: 0, ymax: 32, pas_x: 1, pas_y: 5, nom_x: 'période', nom_y: 'visites (centaines)', hauteur: 260};
  def('s-blanc2-nuage', F.repere('Nuage des quatre observations (1 ; 12), (2 ; 16), (3 ; 18), (4 ; 22)', cadre).nuage(donnees));
  def('s-blanc2-droite', F.repere('La droite (G₁G₂), d’équation y = 3x + 9,5, prolongée jusqu’à x = 6', cadre)
    .droite_affine(3, 9.5).nuage(donnees).point_moyen(1.5, 14, 'G₁', {pos: ['no', 'n']}).point_moyen(3.5, 20, 'G₂', {pos: ['no', 'n']}).lecture(6, 27.5),
  'La droite passe par G₁(1,5 ; 14) et G₂(3,5 ; 20). En x = 6, hors de la plage des observations, elle donne 27,5.');
}
def('s-probleme-tarifs', F.repere('A(t) = 12 + 3t en trait plein, B(t) = 5t en pointillés : même prix, 30 €, pour 6 heures',
  {xmin: 0, xmax: 10, ymin: 0, ymax: 52, pas_x: 2, pas_y: 10, nom_x: 'heures', nom_y: 'prix (€)', hauteur: 260})
  .droite_affine(3, 12, {nom: 'A'}).droite_affine(5, 0, {nom: 'B', pointilles: true}).lecture(6, 30),
'La droite de A part de 12 € ; celle de B part de l’origine. Elles se coupent au point (6 ; 30) ; au-delà de 6 heures, la droite de A est en dessous.');
def('s-probleme-extrapolation', F.repere('Droite y = 3x + 20 : en trait épais sur l’axe, la plage observée de 1 à 4',
  {xmin: 0, xmax: 7, ymin: 0, ymax: 45, pas_x: 1, pas_y: 10, nom_x: 'période', nom_y: 'visites (centaines)', hauteur: 260})
  .droite_affine(3, 20).intervalle_solutions(1, 4).lecture(3, 29).lecture(6, 38),
'En x = 3, dans la plage observée, la droite donne 29 : c’est une interpolation. En x = 6, hors de cette plage, elle donne 38 : c’est une extrapolation.');
/* Version sans JavaScript du graphique à manipuler : la droite de départ, f(x) = x + 1. */
def('1-fonctions-affine', F.repere('Droite de f(x) = x + 1 : pente 1, ordonnée à l’origine 1, image f(2) = 3',
  {xmin: -6, xmax: 6, ymin: -6, ymax: 8, pas_x: 2, pas_y: 2, hauteur: 260}).droite_affine(1, 1).escalier(0, 1, 1, 1).lecture(2, 3),
'La droite coupe l’axe des ordonnées en 1 et l’axe des abscisses en −1 ; elle monte de 1 quand x augmente de 1.');

module.exports = figures;
if (require.main === module) process.stdout.write(JSON.stringify(figures));
