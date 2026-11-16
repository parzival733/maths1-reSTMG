/* Figures d'exemple : une par famille du moteur (assets/figures.js).
   Elles servent aux contrôles de tests/test_figures.js et à la galerie de
   relecture écrite par `python3 tools/figures.py`. */
'use strict';
const path = require('node:path');
const F = require(path.resolve(__dirname, '..', 'assets', 'figures.js'));
const ex = [];
const add = b => ex.push(typeof b.description === 'function' ? b.description() : b);

// Géométrie plane
add(F.figure('Triangle ABC rectangle en A : AB = 6, AC = 8').point('A',0,0).point('B',6,0).point('C',0,8).polygone(['A','B','C']).angle_droit('A','B','C').cote('A','B','6').cote('A','C','8').cote('B','C','?'));
add(F.figure('Thalès : (MN) parallèle à (BC)').point('A',1,6).point('B',0,0).point('C',8,0).point('M',null,null,{sur:['A','B'],k:0.6}).point('N',null,null,{sur:['A','C'],k:0.6}).polygone(['A','B','C']).segment('M','N').parallele('M','N').parallele('B','C').cote('A','M','3'));
add(F.figure('Configuration papillon').point('A',0,0).point('B',-3,2).point('C',-2,-2.5).point('M',null,null,{sur:['A','B'],k:-0.6}).point('N',null,null,{sur:['A','C'],k:-0.6}).droite('B','M').droite('C','N').segment('B','C').segment('M','N').parallele('B','C').parallele('N','M'));
add(F.figure('Trigonométrie : angle de 35° en A').point('A',0,0).point('B',9.83,0).point('C',9.83,6.88).polygone(['A','B','C']).angle_droit('B','A','C').angle('A','B','C',{texte:'35°'}).cote('A','C','12').cote('B','C','?'));
add(F.figure('Échelle contre un mur').sol(-1,5,0).mur(0,0,5,{cote:'g'}).point('P',3,0,{pos:'ne'}).point('S',0,4,{pos:'o'}).point('O',0,0,{muet:true}).echelle('P','S').angle_droit('O','P','S').cote_fleche('O','P','3 m',{pos:'s',decalage:14}).cote('P','S','5 m'));
add(F.figure('Immeuble vu sous un angle de 40°').sol(-2,34,0).immeuble(30,0,4,26.8).observateur(0,0,1.6).point('Y',0,1.6,{muet:true}).point('H',30,1.6,{muet:true}).point('T',30,26.8,{muet:true}).segment('Y','H',{pointilles:true}).segment('Y','T',{pointilles:true}).angle('Y','H','T',{texte:'40°',rayon:30}).cote_fleche([0,0],[30,0],'30 m',{pos:'s',decalage:16}));
add(F.figure('Homothétie de centre O et de rapport 2').point('O',0,0).point('A',2,1).point('B',3,3).point('C',1,2.5).point("A′",4,2).point("B′",6,6).point("C′",2,5).polygone(['A','B','C']).polygone(["A′","B′","C′"],{epais:true}).demi_droite('O',"A′",{pointilles:true,fin:true}).demi_droite('O',"B′",{pointilles:true,fin:true}).demi_droite('O',"C′",{pointilles:true,fin:true}));
add(F.figure('Rotation de 60° dans un hexagone régulier').point('O',0,0,{marque:true}).point('A',2,0).point('B',1,1.732).point('C',-1,1.732).point('D',-2,0).point('E',-1,-1.732).point('F',1,-1.732).polygone(['A','B','C','D','E','F']).segment('O','A',{pointilles:true}).segment('O','B',{pointilles:true}).angle('O','A','B',{texte:'60°'}).rotation_fleche('O',[2.5,0],60));
add(F.figure('Vecteurs égaux : ABDC est un parallélogramme').point('A',0,0).point('B',4,1).point('C',1,3).point('D',5,4).polygone(['A','B','D','C'],{pointilles:true,fin:true}).vecteur('A','B','u').vecteur('C','D','u').codage('A','C',2).codage('B','D',2));
add(F.figure('Bâton, arbre et ombres').sol(-1,13,0).sapin(9,0,6).baton([2,0],[2,1.5]).point('S',12,0,{muet:true}).segment([9,6],[12,0],{pointilles:true}).segment([2,1.5],[2.75,0],{pointilles:true}).ombre([2,0],[2.75,0]).ombre([9,0],[12,0]).cote([2,0],[2,1.5],'1,5 m',{pos:'o'}).cote_fleche([9,0],[9,6],'?',{pos:'e',decalage:34}));
// Repères
add(F.repere('Courbe de f : image de 2 et antécédents de 3',{xmin:-1,xmax:6,ymin:-1,ymax:5}).courbe('-0.5(x-3)^2+3.5',{nom:'C_f'}).lecture(2,3).antecedents(3,{f:'-0.5(x-3)^2+3.5'}));
add(F.repere('Droite d’équation y = 2x + 1',{xmin:-3,xmax:4,ymin:-3,ymax:8}).droite_affine(2,1,{nom:'y = 2x + 1'}).point(0,1,'1').escalier(1,3,1,2));
add(F.repere('Prix en fonction du nombre d’entrées',{xmin:0,xmax:20,ymin:0,ymax:160,pas_x:5,pas_y:40,nom_x:'nombre d’entrées',nom_y:'prix en €'}).droite_affine(8,0,{nom:'f'}).droite_affine(5,35,{nom:'g',pointilles:true}).lecture(35/3,280/3,{vx:'≈ 11,67',vy:false}));
add(F.repere('Fonction inverse',{xmin:-4,xmax:4,ymin:-4,ymax:4,orthonorme:true,hauteur:260}).courbe('1/x',{nom:'y = 1/x'}).asymptote_v(0).asymptote_h(0));
add(F.repere('Fonction carré : x² ≤ 4',{xmin:-3,xmax:3,ymin:-1,ymax:8}).courbe('x^2',{nom:'y = x²'}).antecedents(4,{f:'x^2'}).intervalle_solutions(-2,2));
add(F.repere('Signe de 2x − 6',{xmin:-1,xmax:7,ymin:-8,ymax:8,pas_y:4}).droite_affine(2,-6).zone_signe(null,3,'négative',{signe:'-'}).zone_signe(3,null,'positive',{signe:'+'}).point(3,0,'3',{pos:'no'}));
add(F.repere('Tangente et sécante',{xmin:-1,xmax:5,ymin:-1,ymax:9}).courbe('0.5x^2',{nom:'C_f'}).secante('0.5x^2',1,3,{pointilles:true}).tangente('0.5x^2',1,{nom:'T'}));
add(F.repere('Nuage de points et droite d’ajustement',{xmin:0,xmax:10,ymin:0,ymax:50,pas_x:2,pas_y:10,nom_x:'x',nom_y:'y'}).nuage([[1,12],[2,15],[4,22],[5,24],[7,33],[9,39]]).droite_affine(3.4,8.5,{nom:'y = 3,4x + 8,5'}).point_moyen(4.67,24.17,'G'));
add(F.repere('Prix moyen avec coupure des axes',{xmin:2018,xmax:2024,ymin:40,ymax:60,pas_x:1,pas_y:5,nom_x:'année',nom_y:'prix en €'}).ligne_brisee([[2018,45],[2019,46],[2020,48],[2021,50],[2022,54],[2023,55]]));
add(F.repere('Suite arithmétique et suite géométrique',{xmin:0,xmax:8,ymin:0,ymax:30,pas_x:1,pas_y:5,nom_x:'n',nom_y:'u_n'}).suite_points('3+2n',0,8).suite_points('1.5^n',0,8,{}).vecteur(1,20,3,24,'u'));
// Droites numériques
add(F.droite_numerique('Intervalle [−2 ; 3[',{min:-5,max:5,pas:1}).intervalle(-2,3,{ouvert_b:true}));
add(F.droite_numerique('|x − 2| ≤ 3',{min:-3,max:7,pas:1}).centre_rayon(2,3));
add(F.droite_numerique('Réunion et intersection',{min:-4,max:8,pas:1,noms_lignes:['I','J','I ∩ J']}).intervalle(-2,4,{ligne:0}).intervalle(1,null,{ligne:1,ouvert_a:true}).intervalle(1,4,{ligne:2,ouvert_a:true}));
add(F.droite_numerique('Distance entre −1,5 et 2,5',{min:-3,max:4,pas:1}).point(-1.5,'A').point(2.5,'B').distance(-1.5,2.5,'4'));
// Espace
add(F.espace('Pavé de 40 cm × 25 cm × 30 cm').pave(40,25,30,{cotes:['40 cm','25 cm','30 cm']}));
add(F.espace('Pyramide à base carrée').pyramide_carree(6,10,{cotes:['6 cm','10 cm'],noms:['A','B','C','D','S','H']}));
add(F.espace('Cylindre').cylindre(3,7,{cotes:['r','h']}));
add(F.espace('Cône').cone(3,7,{cotes:['r','h']}));
add(F.espace('Boule dans un cube').cube(10,{cotes:['10 cm']}).boule(5,{centre:[5,5,5],cotes:['5 cm']}));
add(F.espace('Section d’une pyramide, k = 0,5').section_pyramide(6,10,0.5));
// Arbres
add(F.arbre('Deux tirages avec remise',[{nom:'R',p:'3/5',enfants:[{nom:'R',p:'3/5',feuille:'9/25'},{nom:'B',p:'2/5',feuille:'6/25'}]},{nom:'B',p:'2/5',enfants:[{nom:'R',p:'3/5',feuille:'6/25'},{nom:'B',p:'2/5',feuille:'4/25'}]}],{chemin:['R','R']}));
add(F.arbre('Arbre à trois branches',[{nom:'A',p:'0,5',enfants:[{nom:'D',p:'0,02'},{nom:'D̄',p:'0,98'}]},{nom:'B',p:'0,3',enfants:[{nom:'D',p:'0,05'},{nom:'D̄',p:'0,95'}]},{nom:'C',p:'0,2',enfants:[{nom:'D',p:'0,1'},{nom:'D̄',p:'0,9'}]}],{chemins:[['B','D']]}));
add(F.arbre('Trois essais',[0,1].map(a=>({nom:a?'E':'S',p:a?'0,7':'0,3',enfants:[0,1].map(b=>({nom:b?'E':'S',p:b?'0,7':'0,3',enfants:[0,1].map(c=>({nom:c?'E':'S',p:c?'0,7':'0,3'}))}))})),{chemins:[['S','S','E'],['S','E','S'],['E','S','S']]}));
add(F.arbre('Probabilités conditionnelles',[{nom:'A',p:'P(A)',enfants:[{nom:'B',p:'P_A(B)'},{nom:'B̄',p:'P_A(B̄)'}]},{nom:'Ā',p:'P(Ā)',enfants:[{nom:'B',p:'P_{Ā}(B)'},{nom:'B̄',p:'P_{Ā}(B̄)'}]}]));
// Statistiques
add(F.statistiques('Notes d’une classe').diagramme_barres([8,9,10,12,14,15],[2,3,5,6,3,1],{nom_x:'note',nom_y:'effectif'}));
add(F.statistiques('Deux séries').diagramme_barres(['T1','T2','T3','T4'],[12,15,9,14],{valeurs2:[10,16,12,11],noms_series:['2025','2026']}));
add(F.statistiques('Loi et distribution observée').diagramme_batons([0,1,2,3],[0.125,0.375,0.375,0.125],{observe:[0.1,0.42,0.33,0.15],nom_x:'k',nom_y:'probabilité'}));
add(F.statistiques('Histogramme').histogramme([0,10,20,30,40],[4,9,6,2],{nom_x:'durée (min)',nom_y:'effectif'}));
add(F.statistiques('Boîte à moustaches').boite(4,8,11,14,19));
add(F.statistiques('Deux séries comparées',{}).boite(null,null,null,null,null,{boites:[{min:4,q1:8,med:11,q3:14,max:19,nom:'A'},{min:6,q1:10,med:11,q3:12,max:15,nom:'B'}],valeurs:false}));
add(F.statistiques('Roue de loterie').diagramme_circulaire([{nom:'Rouge',angle:120},{nom:'Bleu',angle:90},{nom:'Vert',angle:60},{nom:'Jaune',angle:90}]));
add(F.statistiques('Indices base 100').courbe_indices([2020,2021,2022,2023,2024],[100,104,110,108,115]));
add(F.statistiques('Intersection de A et B').diagramme_venn('A','B',{a_seul:12,inter:5,b_seul:8,hors:10},{zone:'inter',univers:'Ω'}));
add(F.statistiques('Complémentaire de A ∪ B').diagramme_venn('A','B',{a_seul:12,inter:5,b_seul:8,hors:10},{zone:'hors'}));
add(F.pascal('Triangle de Pascal',6,{coefficient:[5,2],ligne:4}));
add(F.programme_trace('Hexagone tracé par le lutin',6,60,{cote:'50'}));
add(F.groupe('Proportionnel ou non',[F.repere('Proportionnel',{xmin:0,xmax:5,ymin:0,ymax:10,largeur:200,hauteur:170}).nuage([[1,2],[2,4],[3,6],[4,8]]).droite_affine(2,0,{pointilles:true,fin:true}),F.repere('Non proportionnel',{xmin:0,xmax:5,ymin:0,ymax:10,largeur:200,hauteur:170}).nuage([[1,3],[2,5],[3,7],[4,9]]).droite_affine(2,1,{pointilles:true,fin:true})]));
module.exports = ex;
