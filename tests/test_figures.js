/* Moteur de figures : validité des SVG, étiquettes lisibles, justesse
   géométrique recalculée à partir du SVG, reproductibilité. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const F = require(path.join(ROOT, 'assets', 'figures.js'));
const C = require('./figures_controle.js');
const exemples = require('./figures_exemples.js');

let controles = 0;
const proche = (a, b, tol, message) => { controles++; assert.ok(Math.abs(a - b) <= tol, (message || '') + ' : ' + a + ' au lieu de ' + b + ' (tolérance ' + tol + ')'); };
const valide = (desc, nom) => {
  const html = F.html(desc);
  const defauts = C.controler(html);
  controles++;
  assert.deepEqual(defauts, [], (nom || desc.titre) + ' : ' + defauts.join(' ; '));
  return C.analyser(html);
};

/* Hasard reproductible pour les essais en série. */
function hasard(graine) {
  let etat = graine >>> 0;
  const suivant = () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {reel: (a, b) => a + (b - a) * suivant(), entier: (a, b) => a + Math.floor(suivant() * (b - a + 1))};
}

/* ---------- 1. Le moteur se charge aussi dans un navigateur (window.Figures) ---------- */
{
  const bac = {window: {}};
  vm.createContext(bac);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'figures.js'), 'utf8'), bac, {filename: 'figures.js'});
  assert.equal(typeof bac.window.Figures.svg, 'function');
  /* Le socle seul dessine les repères ; il nomme le fichier manquant pour le reste. */
  const charger = nom => vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', nom), 'utf8'), bac, {filename: nom});
  const identiques = (liste, quoi) => { for (const exemple of liste) assert.equal(bac.window.Figures.svg(exemple), F.svg(exemple), quoi + ' : même SVG dans le navigateur et dans Node'); };
  const socle = d => d.type === 'repere';
  const axes = d => socle(d) || d.type === 'arbre' || d.type === 'pascal' || (d.type === 'statistiques' && !/circulaire|venn/.test(d.elements[0].t));
  identiques(exemples.filter(socle), 'socle seul');
  assert.ok(exemples.filter(socle).length >= 5, 'exemples dessinés par le socle seul');
  assert.throws(() => bac.window.Figures.svg(exemples.find(d => d.type === 'figure')), /figures-geometrie\.js/, 'géométrie demandée au socle seul');
  assert.throws(() => bac.window.Figures.svg(exemples.find(d => d.type === 'statistiques')), /figures-statistiques\.js/, 'diagramme demandé au socle seul');
  charger('figures-statistiques.js');
  identiques(exemples.filter(axes), 'socle, statistiques et probabilités');
  assert.ok(exemples.filter(axes).length > exemples.filter(socle).length, 'diagrammes dessinés sans la géométrie');
  charger('figures-geometrie.js');
  identiques(exemples, 'moteur complet');
  const source = ['figures.js', 'figures-statistiques.js', 'figures-geometrie.js'].map(nom => fs.readFileSync(path.join(ROOT, 'assets', nom), 'utf8')).join('');
  assert.ok(!/\beval\s*\(|new Function|Math\.random|Date\.now|\(\?<[=!]/.test(source), 'ni eval, ni aléatoire, ni date, ni lookbehind');
  assert.ok(!/style=|<style|<marker/.test(source), 'aucun attribut style ni marqueur dans le moteur');
}

/* ---------- 2. Figures d'exemple : contrôles généraux, reproductibilité, JSON ---------- */
assert.ok(exemples.length >= 45, 'galerie complète');
const identifiants = new Set();
for (const desc of exemples) {
  valide(desc);
  const html = F.html(desc);
  assert.equal(F.html(desc), html, desc.titre + ' : deux appels, même SVG');
  assert.equal(F.html(JSON.parse(JSON.stringify(desc))), html, desc.titre + ' : description sérialisable en JSON');
  assert.ok(/^[\x20-\x7e -￿]*$/.test(html), desc.titre + ' : pas de caractère de contrôle');
  identifiants.add(/aria-labelledby="([^" ]+)/.exec(html)[1]);
}
assert.equal(identifiants.size, exemples.length, 'un identifiant différent par figure');
assert.ok(/id="mon-id"/.test(F.svg(exemples[0], {id: 'mon-id'})), 'identifiant imposé');
/* Coordonnées à 0,1 px : aucun attribut géométrique n'a plus d'une décimale. */
for (const desc of exemples) {
  const svg = F.svg(desc);
  for (const m of svg.matchAll(/\s(?:x|y|x1|y1|x2|y2|cx|cy|r|d)="([^"]*)"/g)) {
    for (const v of m[1].match(/-?\d+\.\d+/g) || []) { controles++; assert.ok(v.split('.')[1].length === 1, desc.titre + ' : ' + v + ' arrondi à 0,1 px'); }
  }
}
/* Description accessible. */
{
  const svg = F.svg(Object.assign({}, exemples[10], {description: 'La courbe passe par (2 ; 3).'}));
  assert.ok(/aria-labelledby="(fig-\w+) \1-d"/.test(svg) && /<desc id="fig-\w+-d">La courbe passe par \(2 ; 3\)\.<\/desc>/.test(svg), 'balise desc reliée');
  assert.ok(/&lt;b&gt;/.test(F.svg(F.figure('<b>').point('A', 0, 0).point('B', 1, 1).segment('A', 'B').description())), 'titre échappé');
}

/* ---------- 3. Expressions et nombres ---------- */
{
  const cas = [['x^2-14', 4, 2], ['2x+1', 3, 7], ['1/x', 4, 0.25], ['sqrt(x)', 9, 3], ['-x^2', 2, -4], ['(x-2)^2-3', 2, -3], ['abs(x)', -5, 5],
    ['log(x)', 100, 2], ['1,2x', 45, 54], ['1.5^n', 2, 2.25], ['x³ − 2x', 2, 4], ['2(x+1)(x-3)', 1, -8], ['exp(0)+ln(1)+x', 1, 2], ['3 × x²', 2, 12], ['x^-1', 4, 0.25]];
  for (const [src, x, y] of cas) proche(F.fonction(src)(x), y, 1e-9, src);
  for (const mauvais of ['alert(1)', 'x)', '2+', 'window.x', 'x;y']) assert.throws(() => F.fonction(mauvais), /illisible/, mauvais);
  assert.equal(F.nombre(-2.5), '−2,5');
  assert.equal(F.nombre(11.666, 2), '11,67');
  assert.equal(F.nombre(-0.001, 1), '0');
  assert.equal(F.nombre(3), '3');
  assert.equal(F.typographie("L'aire : 40 cm ; 12 % ?"), 'L\u2019aire\u00a0: 40\u00a0cm\u202f; 12\u00a0%\u202f?');
}

/* ---------- 4. Géométrie : longueurs, angles, alignements ---------- */
{
  /* Pythagore : rapports de longueurs et angle droit. */
  for (const [ab, ac] of [[6, 8], [3, 4], [5, 12], [9, 2], [1, 1], [7, 24]]) {
    const a = valide(F.figure('Triangle rectangle ' + ab + ' et ' + ac).point('A', 0, 0).point('B', ab, 0).point('C', 0, ac).polygone(['A', 'B', 'C'])
      .angle_droit('A', 'B', 'C').cote('A', 'B', String(ab)).cote('A', 'C', String(ac)).cote('B', 'C', '?').description());
    const p = C.pointsNommes(a);
    proche(C.distance(p.A, p.B) / C.distance(p.A, p.C), ab / ac, 0.012 * ab / ac, 'rapport AB/AC');
    proche(C.distance(p.B, p.C) / C.distance(p.A, p.B), Math.hypot(ab, ac) / ab, 0.012 * Math.hypot(ab, ac) / ab, 'rapport BC/AB');
    proche(C.angle(p.A, p.B, p.C), 90, 0.5, 'angle droit en A');
    for (const ecart of C.anglesDroits(a)) proche(ecart, 0, 1.5, 'codage de l’angle droit');
  }
  /* Angles droits quelconques : le codage suit les vecteurs, quelle que soit l'orientation. */
  const h = hasard(11);
  for (let i = 0; i < 200; i++) {
    const t = h.reel(0, 2 * Math.PI), l1 = h.reel(2, 9), l2 = h.reel(2, 9), ox = h.reel(-5, 5), oy = h.reel(-5, 5);
    const A = [ox, oy], B = [ox + l1 * Math.cos(t), oy + l1 * Math.sin(t)], Cc = [ox - l2 * Math.sin(t), oy + l2 * Math.cos(t)];
    const a = valide(F.figure('Triangle rectangle tourné').point('A', A[0], A[1]).point('B', B[0], B[1]).point('C', Cc[0], Cc[1])
      .polygone(['A', 'B', 'C']).angle_droit('A', 'B', 'C').cote('A', 'B', '5,2').cote('B', 'C', '?').description(), 'triangle tourné ' + i);
    const p = C.pointsNommes(a);
    proche(C.angle(p.A, p.B, p.C), 90, 0.5, 'angle droit dessiné');
    proche(C.distance(p.A, p.B) / C.distance(p.A, p.C), l1 / l2, 0.015 * l1 / l2, 'échelle uniforme');
  }
  /* Thalès : M sur [AB], N sur [AC], AM/AB = AN/AC, (MN) parallèle à (BC). Configuration papillon comprise. */
  for (let i = 0; i < 200; i++) {
    const k = i % 2 ? h.reel(0.25, 0.8) : -h.reel(0.35, 0.9);
    const A = [h.reel(-1, 1), h.reel(4, 7)], B = [h.reel(-4, -1), h.reel(-1, 1)], Cc = [h.reel(3, 8), h.reel(-1, 1)];
    const fig = F.figure('Thalès').point('A', A[0], A[1], {marque: k < 0}).point('B', B[0], B[1]).point('C', Cc[0], Cc[1])
      .point('M', null, null, {sur: ['A', 'B'], k}).point('N', null, null, {sur: ['A', 'C'], k});
    if (k > 0) fig.polygone(['A', 'B', 'C']).segment('M', 'N');
    else fig.segment('B', 'M').segment('C', 'N').segment('B', 'C').segment('M', 'N');
    const a = valide(fig.description(), 'Thalès ' + i);
    const p = C.pointsNommes(a);
    proche(C.ecartDroite(p.M, p.A, p.B), 0, 0.5, 'M sur (AB)');
    proche(C.ecartDroite(p.N, p.A, p.C), 0, 0.5, 'N sur (AC)');
    proche(C.distance(p.A, p.M) / C.distance(p.A, p.B), Math.abs(k), 0.01, 'AM/AB');
    proche(C.distance(p.A, p.N) / C.distance(p.A, p.C), Math.abs(k), 0.01, 'AN/AC');
    const u = [p.N[0] - p.M[0], p.N[1] - p.M[1]], v = [p.C[0] - p.B[0], p.C[1] - p.B[1]];
    proche(Math.asin(Math.abs(u[0] * v[1] - u[1] * v[0]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180 / Math.PI, 0, 0.5, '(MN) parallèle à (BC)');
  }
  /* Homothétie : O, M, M′ alignés et OM′ = |k| × OM ; image de l'autre côté de O si k < 0. */
  for (const k of [2, -2, 0.5, -0.5, 3, -1.5]) {
    const base = [[2, 1], [3, 3], [1, 2.5]], noms = ['A', 'B', 'D'];
    const fig = F.figure('Homothétie de rapport ' + k).point('O', 0, 0, {marque: true});
    base.forEach((q, i) => fig.point(noms[i], q[0], q[1]).point(noms[i] + '′', k * q[0], k * q[1]));
    fig.polygone(noms).polygone(noms.map(n => n + '′'), {epais: true});
    const a = valide(fig.description());
    const p = C.pointsNommes(a);
    for (const n of noms) {
      proche(C.ecartDroite(p.O, p[n], p[n + '′']), 0, 0.5, 'O, ' + n + ', ' + n + '′ alignés');
      proche(C.distance(p.O, p[n + '′']) / C.distance(p.O, p[n]), Math.abs(k), 0.02 * Math.abs(k) + 0.01, 'O' + n + '′ = |k| × O' + n);
      const s = (p[n][0] - p.O[0]) * (p[n + '′'][0] - p.O[0]) + (p[n][1] - p.O[1]) * (p[n + '′'][1] - p.O[1]);
      controles++;
      assert.ok(k > 0 ? s > 0 : s < 0, 'image du bon côté de O pour k = ' + k);
    }
  }
  /* Objets concrets : l'échelle, le mur et le sol gardent les proportions (3 ; 4 ; 5). */
  {
    const a = valide(F.figure('Échelle').sol(-1, 5, 0).mur(0, 0, 5, {cote: 'g'}).point('P', 3, 0, {pos: 'ne'}).point('S', 0, 4, {pos: 'o'}).echelle('P', 'S').description());
    const e = a.lignes.find(l => l.f === 'echelle'), sol = a.lignes.find(l => l.f === 'sol'), mur = a.lignes.find(l => l.f === 'mur');
    proche(C.distance([e.x1, e.y1], [e.x2, e.y2]) / C.distance([sol.x1, sol.y1], [sol.x2, sol.y2]), 5 / 6, 0.01, 'échelle de 5 pour un sol de 6');
    proche(Math.abs(mur.x1 - mur.x2), 0, 0.01, 'mur vertical');
    proche(Math.abs(sol.y1 - sol.y2), 0, 0.01, 'sol horizontal');
  }
}

/* ---------- 5. Repères : points sur leurs courbes, discontinuités, échelles ---------- */
{
  const h = hasard(23);
  const lire = (a, texte) => a.textes.find(t => t.texte === texte);
  for (let i = 0; i < 300; i++) {
    const p = [h.entier(-3, 3) || 1, h.entier(-4, 4), h.entier(-5, 5)];
    const familles = [
      ['(' + p[0] + ')x+(' + p[1] + ')', x => p[0] * x + p[1]],
      ['0.3(' + p[0] + ')(x-(' + p[1] + '))^2+(' + p[2] + ')', x => 0.3 * p[0] * Math.pow(x - p[1], 2) + p[2]],
      ['0.1x^3-x+(' + p[2] + ')', x => 0.1 * x * x * x - x + p[2]],
      ['(' + p[0] + ')/x', x => p[0] / x],
      ['sqrt(x+5)+(' + p[2] + ')', x => Math.sqrt(x + 5) + p[2]]
    ];
    const [src, f] = familles[i % familles.length];
    const fig = F.repere('Courbe ' + src, {xmin: -5, xmax: 5, ymin: -8, ymax: 8}).courbe(src, {nom: 'C_f'});
    const xs = [-4.5, -2, -0.5, 1, 2.5, 4].filter(x => Math.abs(f(x)) < 7.5);
    xs.forEach(x => fig.point(x, f(x)));
    const a = valide(fig.description(), src);
    const points = a.cercles.filter(c => c.f === 'point');
    assert.equal(points.length, xs.length);
    for (const c of points) proche(C.ecartCourbes(a, [c.x, c.y]), 0, 0.5, src + ' : point sur la courbe');
    /* Aucune courbe ne traverse une asymptote. */
    const x0 = a.lignes.find(l => l.f === 'axe-y').x1;
    for (const c of a.chemins.filter(q => q.f === 'courbe')) {
      if (/\/x/.test(src)) { controles++; assert.ok(c.points.every(q => q[0] <= x0 + 0.1) || c.points.every(q => q[0] >= x0 - 0.1), src + ' : rien à travers x = 0'); }
    }
  }
  /* Droites exactes, tangente au point de contact, lecture et antécédents. */
  {
    const a = valide(F.repere('y = 2x + 1', {xmin: -3, xmax: 4, ymin: -3, ymax: 8}).droite_affine(2, 1, {nom: 'y = 2x + 1'}).point(0, 1).point(1, 3).point(-2, -3).escalier(1, 3, 1, 2).description());
    for (const c of a.cercles.filter(q => q.f === 'point')) proche(C.ecartCourbes(a, [c.x, c.y]), 0, 0.5, 'point sur la droite');
    const ux = lire(a, '2').x - lire(a, '1').x, e = a.chemins.find(c => c.f === 'escalier');
    proche(e.points[1][0] - e.points[0][0], ux, 0.2, 'escalier : +1 en x');
    const uy = a.textes.filter(t => t.ancre === 'end' && t.texte === '2')[0].y - a.textes.filter(t => t.ancre === 'end' && t.texte === '4')[0].y;
    proche(e.points[1][1] - e.points[2][1], uy, 0.2, 'escalier : +2 en y');
  }
  {
    const f = 'x^2', a = valide(F.repere('Antécédents de 4', {xmin: -3, xmax: 3, ymin: -1, ymax: 8}).courbe(f).antecedents(4, {f}).intervalle_solutions(-2, 2).description());
    const pts = a.cercles.filter(c => c.f === 'point').map(c => c.x).sort((u, v) => u - v);
    assert.equal(pts.length, 2, 'deux antécédents');
    proche(pts[0], lire(a, '−2').x, 0.3, 'antécédent −2');
    proche(pts[1], lire(a, '2').x, 0.3, 'antécédent 2');
    const inter = a.lignes.find(l => l.f === 'intervalle');
    proche(inter.x1, pts[0], 0.3, 'intervalle de −2…');
    proche(inter.x2, pts[1], 0.3, '… à 2');
  }
  {
    const f = '0.5x^2', a = valide(F.repere('Tangente', {xmin: -1, xmax: 5, ymin: -1, ymax: 9}).courbe(f).tangente(f, 2).secante(f, 1, 3, {pointilles: true}).description());
    const t = a.lignes.find(l => l.f === 'tangente'), s = a.lignes.find(l => l.f === 'secante');
    const pente = l => -(l.y2 - l.y1) / (l.x2 - l.x1);
    const ux = lire(a, '2').x - lire(a, '1').x, gy = a.textes.filter(q => q.ancre === 'end'), uy = (gy.find(q => q.texte === '2').y - gy.find(q => q.texte === '4').y) / 2;
    proche(pente(t) * ux / uy, 2, 0.03, 'pente de la tangente en 2');
    proche(pente(s) * ux / uy, 2, 0.03, 'pente de la sécante entre 1 et 3');
    for (const c of a.cercles.filter(q => q.f === 'point')) proche(C.ecartCourbes(a, [c.x, c.y], ['courbe']), 0, 0.5, 'points de contact sur la courbe');
  }
  /* Repère orthonormé : même unité sur les deux axes. */
  {
    const a = valide(F.repere('Orthonormé', {xmin: -4, xmax: 4, ymin: -3, ymax: 3, orthonorme: true}).courbe('abs(x)-2').description());
    const gx = a.textes.filter(t => t.ancre === 'middle'), gy = a.textes.filter(t => t.ancre === 'end');
    proche(gx.find(t => t.texte === '2').x - gx.find(t => t.texte === '1').x, gy.find(t => t.texte === '1').y - gy.find(t => t.texte === '2').y, 0.15, 'unités égales');
  }
  /* Grands nombres : au moins une valeur lisible par axe, sans chevauchement. */
  for (const [xmax, ymax] of [[60, 80], [1000, 5000], [45, 54], [0.8, 0.05], [12, 100000]]) {
    const a = valide(F.repere('Axes jusqu’à ' + xmax + ' et ' + ymax, {xmin: 0, xmax, ymin: 0, ymax, nom_x: 'quantité', nom_y: 'prix en €'}).droite_affine(ymax / xmax, 0).description());
    controles++;
    assert.ok(a.textes.filter(t => /^[\d,]+$/.test(t.texte) && t.ancre === 'middle').length >= 1 && a.textes.filter(t => /^[\d,]+$/.test(t.texte) && t.ancre === 'end').length >= 1, 'une valeur lisible par axe');
  }
  /* Nuage : chaque point est à sa place par rapport aux graduations. */
  {
    const pts = [[1, 12], [2, 15], [4, 22], [5, 24], [7, 33], [9, 39]];
    const a = valide(F.repere('Nuage', {xmin: 0, xmax: 10, ymin: 0, ymax: 50, pas_x: 2, pas_y: 10}).nuage(pts).point_moyen(14 / 3, 145 / 6, 'G').description());
    const x2 = lire(a, '2').x, x4 = lire(a, '4').x, gy = a.textes.filter(t => t.ancre === 'end'), y10 = gy.find(t => t.texte === '10').y - 4, y20 = gy.find(t => t.texte === '20').y - 4;
    const dessines = a.cercles.filter(c => c.f === 'nuage');
    pts.forEach((p, i) => {
      proche(dessines[i].x, x2 + (p[0] - 2) * (x4 - x2) / 2, 0.3, 'abscisse du point ' + i);
      proche(dessines[i].y, y10 + (p[1] - 10) * (y20 - y10) / 10, 0.3, 'ordonnée du point ' + i);
    });
  }
}

/* ---------- 6. Droite numérique, solides, arbres, statistiques, Pascal, tracé ---------- */
{
  /* Droite numérique : crochets tournés du bon côté. */
  const a = valide(F.droite_numerique('Intervalle [−2 ; 3[', {min: -5, max: 5, pas: 1}).intervalle(-2, 3, {ouvert_b: true}).description());
  const inter = a.lignes.find(l => l.f === 'intervalle'), crochets = a.chemins.filter(c => c.points.length === 4);
  const sens = c => Math.sign(c.points[0][0] - c.points[1][0]);
  const gauche = crochets.find(c => Math.abs(c.points[1][0] - inter.x1) < 0.2), droit = crochets.find(c => Math.abs(c.points[1][0] - inter.x2) < 0.2);
  assert.equal(sens(gauche), 1, 'crochet fermé en −2 : tourné vers l’intervalle');
  assert.equal(sens(droit), 1, 'crochet ouvert en 3 : tourné vers l’extérieur');
  const t = n => a.textes.find(q => q.texte === n);
  proche(inter.x1, t('−2').x, 0.2, 'début en −2');
  proche(inter.x2, t('3').x, 0.2, 'fin en 3');

  /* Perspective cavalière : fuyantes à 45°, coefficient 0,5, arêtes cachées en pointillés. */
  for (const [L, l, h] of [[40, 25, 30], [4, 4, 4], [10, 2, 3]]) {
    const s = valide(F.espace('Pavé ' + L + ' × ' + l + ' × ' + h).pave(L, l, h, {noms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']}).description());
    const seg = (m, n) => s.lignes.find(q => q.pts === m + ' ' + n), AB = seg('A', 'B'), BC = seg('B', 'C'), AE = seg('E', 'A'), AD = seg('A', 'D');
    const lon = q => C.distance([q.x1, q.y1], [q.x2, q.y2]);
    proche(lon(BC) / lon(AB), 0.5 * l / L, 0.01, 'coefficient 0,5 sur la fuyante');
    proche(lon(AE) / lon(AB), h / L, 0.01, 'hauteur à l’échelle');
    proche(C.angle([BC.x1, BC.y1], [BC.x2, BC.y2], [BC.x1 + 10, BC.y1]), 45, 0.6, 'fuyante à 45°');
    assert.ok(/stroke-dasharray/.test(AD.attrs) && !/stroke-dasharray/.test(AB.attrs), 'arête cachée en pointillés, arête visible en trait plein');
    assert.equal(s.lignes.filter(q => q.f === 'segment' && /stroke-dasharray/.test(q.attrs)).length, 3, 'trois arêtes cachées');
  }
  for (const k of [0.25, 0.5, 0.75]) {
    const s = valide(F.espace('Section, k = ' + k).section_pyramide(6, 10, k, {noms: ['A', 'B', 'C', 'D', 'S', 'H'], noms_section: ['I', 'J', 'K', 'L']}).description());
    const p = C.pointsNommes(s);
    proche(C.distance(p.S, p.I) / C.distance(p.S, p.A), k, 0.015, 'SI/SA = k');
    proche(C.distance(p.I, p.J) / C.distance(p.A, p.B), k, 0.015, 'IJ/AB = k');
  }
  for (const d of [F.espace('Cylindre').cylindre(3, 7, {cotes: ['3 cm', '7 cm']}), F.espace('Cône').cone(4, 9, {cotes: ['4 cm', '9 cm']}), F.espace('Boule').boule(5, {cotes: ['5 cm']}),
    F.espace('Pyramide').pyramide_carree(6, 10, {cotes: ['6 cm', '10 cm'], noms: ['A', 'B', 'C', 'D', 'S', 'H']}), F.espace('Cube').cube(10, {cotes: ['10 cm']})]) valide(d.description());

  /* Arbres : nombre de branches, chemin mis en évidence. */
  const branche = (p, enfants) => ['R', 'B'].map((n, i) => ({nom: n, p: i ? '2/5' : '3/5', enfants}));
  const arbre = valide(F.arbre('Deux tirages', branche(0, branche(1)), {chemin: ['R', 'R'], feuilles: ['9/25', '6/25', '6/25', '4/25']}).description());
  assert.equal(arbre.lignes.filter(l => /^branche/.test(l.f)).length, 6, 'six branches');
  assert.equal(arbre.lignes.filter(l => l.f === 'branche chemin').length, 2, 'deux branches épaisses sur le chemin R-R');
  assert.equal(arbre.textes.filter(q => q.texte === '3/5').length, 3);
  assert.ok(arbre.textes.some(q => q.texte === '9/25'), 'probabilité du chemin en bout de branche');
  const h = hasard(5);
  for (let i = 0; i < 60; i++) {
    const noeud = (d, prof) => Array.from({length: h.entier(2, 3)}, (_, j) => ({nom: 'ABC'[j] + (d ? '′' : ''), p: '0,' + h.entier(1, 9) + (h.entier(0, 1) ? h.entier(1, 9) : ''), enfants: d + 1 < prof ? noeud(d + 1, prof) : undefined}));
    valide(F.arbre('Arbre ' + i, noeud(0, h.entier(2, 3))).description());
  }

  /* Statistiques. */
  const b = valide(F.statistiques('Boîte').boite(4, 8, 11, 14, 19).description());
  for (const v of ['4', '8', '11', '14', '19']) assert.ok(b.textes.some(q => q.texte === v), 'valeur ' + v + ' de la boîte');
  const g = n => b.textes.filter(q => q.texte === n).sort((u, v) => v.y - u.y)[0].x;
  proche(b.lignes.find(l => l.f === 'mediane').x1, g('10') + (g('15') - g('10')) / 5, 0.3, 'médiane à 11');
  const roue = valide(F.statistiques('Roue').diagramme_circulaire([{nom: 'Rouge', angle: 120}, {nom: 'Bleu', angle: 90}, {nom: 'Vert', angle: 60}, {nom: 'Jaune', angle: 90}]).description());
  const rayons = roue.lignes.filter(l => l.f === 'segment').map(l => Math.atan2(-(l.y2 - l.y1), l.x2 - l.x1) * 180 / Math.PI);
  proche(((rayons[0] - rayons[1]) % 360 + 360) % 360, 120, 0.6, 'secteur de 120°');
  proche(((rayons[1] - rayons[2]) % 360 + 360) % 360, 90, 0.6, 'secteur de 90°');
  for (let i = 0; i < 60; i++) {
    const n = h.entier(3, 7), valeurs = Array.from({length: n}, () => h.entier(1, 30));
    valide(F.statistiques('Barres ' + i).diagramme_barres(valeurs.map((_, j) => String(8 + j)), valeurs, {nom_x: 'note', nom_y: 'effectif'}).description());
    const tri = Array.from({length: 5}, () => h.entier(0, 60)).sort((u, v) => u - v);
    if (new Set(tri).size === 5) valide(F.statistiques('Boîte ' + i).boite(tri[0], tri[1], tri[2], tri[3], tri[4], {valeurs: false}).description());
    const p = 0.1 + 0.1 * h.entier(0, 8), k = h.entier(2, 6), loi = Array.from({length: k + 1}, (_, j) => { let c = 1; for (let u = 0; u < j; u++) c = c * (k - u) / (u + 1); return c * Math.pow(p, j) * Math.pow(1 - p, k - j); });
    valide(F.statistiques('Loi binomiale ' + i).diagramme_batons(loi.map((_, j) => j), loi, {nom_x: 'k', nom_y: 'probabilité'}).description());
  }

  /* Triangle de Pascal : coefficients exacts. */
  const pascal = valide(F.pascal('Triangle de Pascal', 8, {coefficient: [6, 2]}).description());
  for (const v of ['15', '20', '56', '70']) assert.ok(pascal.textes.some(q => q.texte === v), 'coefficient ' + v);
  assert.equal(pascal.textes.filter(q => q.texte === '1').length, 17, 'bords du triangle');
  assert.equal(pascal.cercles.filter(c => c.f === 'coefficient').length, 1);

  /* Tracé du lutin : polygone régulier fermé, côtés égaux. */
  for (const n of [3, 4, 5, 6, 8]) {
    const tr = valide(F.programme_trace('Polygone à ' + n + ' côtés', n, 360 / n).description());
    const cotes = tr.lignes.filter(l => l.f === 'segment');
    assert.equal(cotes.length, n);
    for (const c of cotes) proche(C.distance([c.x1, c.y1], [c.x2, c.y2]), C.distance([cotes[0].x1, cotes[0].y1], [cotes[0].x2, cotes[0].y2]), 0.25, 'côtés égaux');
    proche(C.distance([cotes[0].x1, cotes[0].y1], [cotes[n - 1].x2, cotes[n - 1].y2]), 0, 0.25, 'tracé fermé');
  }
}

/* ---------- 7. Essais en série : étiquettes lisibles sur des figures tirées au hasard ---------- */
{
  const h = hasard(7);
  for (let i = 0; i < 400; i++) {
    /* Triangle quelconque, ni plat ni minuscule, avec trois cotes et un angle. */
    const A = [h.reel(-5, 5), h.reel(-5, 5)], B = [h.reel(-5, 5), h.reel(-5, 5)], D = [h.reel(-5, 5), h.reel(-5, 5)];
    const aire = Math.abs((B[0] - A[0]) * (D[1] - A[1]) - (D[0] - A[0]) * (B[1] - A[1])) / 2;
    const perimetre = Math.hypot(B[0] - A[0], B[1] - A[1]) + Math.hypot(D[0] - B[0], D[1] - B[1]) + Math.hypot(A[0] - D[0], A[1] - D[1]);
    if (aire / (perimetre * perimetre) > 0.02) {
      valide(F.figure('Triangle ' + i).point('A', A[0], A[1]).point('B', B[0], B[1]).point('C', D[0], D[1]).polygone(['A', 'B', 'C'])
        .cote('A', 'B', F.nombre(h.reel(1, 20), 1) + ' cm').cote('B', 'C', '?').cote('A', 'C', F.nombre(h.reel(1, 20), 1) + ' cm').angle('A', 'B', 'C', {texte: h.entier(20, 80) + '°'}).description());
    }
    /* Deux droites sécantes et la lecture de leur intersection. */
    const m1 = h.entier(-3, 3) || 1, p1 = h.entier(-4, 4), m2 = h.entier(-3, 3) || 2, p2 = h.entier(-4, 4);
    if (m1 !== m2) {
      const xi = (p2 - p1) / (m1 - m2), yi = m1 * xi + p1;
      const fig = F.repere('Droites ' + i, {xmin: -6, xmax: 6, ymin: -8, ymax: 8}).droite_affine(m1, p1, {nom: 'd_1'}).droite_affine(m2, p2, {nom: 'd_2', pointilles: true});
      if (Math.abs(xi) < 5.5 && Math.abs(yi) < 7.5) fig.lecture(xi, yi);
      valide(fig.description());
    }
    /* Parabole : racines, sommet et zone de signe. */
    const r1 = h.entier(-4, 0), r2 = h.entier(1, 5), a = h.entier(0, 1) ? 0.5 : -0.5, xs = (r1 + r2) / 2;
    valide(F.repere('Parabole ' + i, {xmin: -6, xmax: 7, ymin: -8, ymax: 8}).courbe(a + '(x-(' + r1 + '))(x-(' + r2 + '))', {nom: 'C_f'})
      .point(r1, 0, F.nombre(r1)).point(r2, 0, F.nombre(r2)).point(xs, a * (xs - r1) * (xs - r2), 'S').zone_signe(r1, r2, a > 0 ? 'négative' : 'positive', {signe: a > 0 ? '-' : '+'}).description());
    /* Droite numérique : intervalle, point quelconque, centre et rayon. */
    const x1 = h.entier(-8, 2);
    valide(F.droite_numerique('Intervalle ' + i, {min: -10, max: 10, pas: 1}).intervalle(x1, x1 + h.entier(1, 6), {ouvert_a: h.entier(0, 1) === 1}).point(h.reel(-9, 9), 'M').description());
    valide(F.droite_numerique('Distance ' + i, {min: -10, max: 10, pas: 2}).centre_rayon(h.entier(-4, 4), h.entier(1, 5)).description());
    /* Vecteur entre deux points à coordonnées entières. */
    const P = [h.entier(-4, 4), h.entier(-4, 4)], Q = [h.entier(-4, 4), h.entier(-4, 4)];
    if (P[0] !== Q[0] || P[1] !== Q[1]) valide(F.repere('Vecteur ' + i, {xmin: -5, xmax: 5, ymin: -5, ymax: 5, orthonorme: true, hauteur: 260}).point(P[0], P[1], 'A').point(Q[0], Q[1], 'B').vecteur(P[0], P[1], Q[0], Q[1], 'AB').description());
    /* Quadrilatère, diagonales, codage. */
    const q = [[h.reel(0, 2), h.reel(0, 2)], [h.reel(5, 8), h.reel(0, 2)], [h.reel(5, 8), h.reel(4, 6)], [h.reel(0, 2), h.reel(4, 6)]], fq = F.figure('Quadrilatère ' + i);
    'ABCD'.split('').forEach((n, j) => fq.point(n, q[j][0], q[j][1]));
    valide(fq.polygone(['A', 'B', 'C', 'D']).segment('A', 'C', {pointilles: true}).segment('B', 'D', {pointilles: true}).codage('A', 'B', 1).cote('A', 'B', '5').cote('B', 'C', '3').description());
    /* Nuage, droite d'ajustement et point moyen ; roue à trois secteurs. */
    const nuage = Array.from({length: h.entier(4, 9)}, (_, j) => [j + 1, Math.round(h.reel(5, 45))]);
    valide(F.repere('Nuage ' + i, {xmin: 0, xmax: 10, ymin: 0, ymax: 50, pas_x: 2, pas_y: 10, nom_x: 'rang', nom_y: 'ventes'}).nuage(nuage).droite_affine(h.reel(1, 4), h.reel(0, 10), {nom: 'D'}).point_moyen(h.reel(3, 7), h.reel(15, 35), 'G').description());
    const s1 = h.entier(40, 150), s2 = h.entier(40, 120);
    valide(F.statistiques('Roue ' + i).diagramme_circulaire([{nom: 'Rouge', angle: s1}, {nom: 'Bleu', angle: s2}, {nom: 'Vert', angle: 360 - s1 - s2}]).description());
  }
}

/* ---------- 8. Figures des leçons : contrôles généraux et nombres du texte ---------- */
{
  const lecons = require(path.join(ROOT, 'tools', 'figures_lecons.js'));
  const noms = Object.keys(lecons);
  assert.ok(noms.length >= 100, 'figures des quatre niveaux');
  for (const n of noms) {
    const html = F.html(lecons[n], {id: 'fig-' + n, nom: n});
    controles++;
    assert.deepEqual(C.controler(html), [], n);
    assert.ok(html.indexOf('data-figure="' + n + '"') > 0 && html.indexOf('id="fig-' + n + '"') > 0, n + ' : nom et identifiant');
    assert.equal(F.html(JSON.parse(JSON.stringify(lecons[n])), {id: 'fig-' + n, nom: n}), html, n + ' : description sérialisable');
  }
  const mesure = n => { const a = C.analyser(F.svg(lecons[n])); return [a, C.pointsNommes(a)]; };
  /* Pythagore : 6 et 8 dans le rapport 3/4, angle droit en A. */
  let [a, p] = mesure('3-pythagore');
  proche(C.distance(p.A, p.B) / C.distance(p.A, p.C), 6 / 8, 0.01, 'AB/AC');
  proche(C.angle(p.A, p.B, p.C), 90, 0.5, 'angle droit en A');
  [a, p] = mesure('3-pythagore-cote');
  proche(C.distance(p.F, p.G) / C.distance(p.E, p.F), 13 / 5, 0.03, 'FG/EF');
  /* Thalès : AM/AB = AN/AC = 3/5, (MN) parallèle à (BC), BC/AB = 7/5. */
  [a, p] = mesure('3-thales');
  proche(C.distance(p.A, p.M) / C.distance(p.A, p.B), 0.6, 0.01, 'AM/AB');
  proche(C.distance(p.A, p.N) / C.distance(p.A, p.C), 0.6, 0.01, 'AN/AC');
  proche(C.distance(p.B, p.C) / C.distance(p.A, p.B), 7 / 5, 0.02, 'BC/AB');
  proche(C.ecartDroite(p.M, p.A, p.B), 0, 0.5, 'M sur [AB]');
  proche(Math.abs((p.N[1] - p.M[1]) / (p.N[0] - p.M[0]) - (p.C[1] - p.B[1]) / (p.C[0] - p.B[0])), 0, 0.01, '(MN) parallèle à (BC)');
  /* Trigonométrie : angle de 35° dessiné à 35°. */
  [a, p] = mesure('3-trigo-longueur');
  proche(C.angle(p.A, p.B, p.C), 35, 0.5, 'angle de 35°');
  proche(C.angle(p.B, p.A, p.C), 90, 0.5, 'angle droit en B');
  /* Projeté orthogonal : angle droit en H. */
  [a, p] = mesure('2-projete');
  proche(C.angle(p.H, p.M, p.P), 90, 0.6, 'angle droit en H');
  /* Points annoncés sur leur courbe. */
  for (const n of ['3-fonctions-image', '3-affine', '2-droite-reduite', '2-minimum', '2-optimisation', '1-fonctions-courbe', '1-derivee-tangente', 't-exp-intermediaire', 't-inverse-tangente', 't-inverse-cout', 't-log-courbe']) {
    const fig = C.analyser(F.svg(lecons[n])), points = fig.cercles.filter(c => c.f === 'point');
    assert.ok(points.length >= 1, n + ' : au moins un point');
    for (const c of points) proche(C.ecartCourbes(fig, [c.x, c.y]), 0, 0.6, n + ' : point sur la courbe');
  }
}

/* ---------- 9. Le contrôle lui-même repère les défauts ---------- */
{
  const bon = F.html(F.figure('Segment').point('A', 0, 0).point('B', 4, 2).segment('A', 'B').description());
  assert.ok(C.controler(bon.replace('<figcaption>', '<figcaption>Autre ')).some(d => /figcaption/.test(d)), 'titre et légende différents détectés');
  assert.ok(C.controler(bon.replace('<svg ', '<svg style="color:red" ')).some(d => /style/.test(d)), 'attribut style détecté');
  assert.ok(C.controler(bon.replace(/x1="[^"]+"/, 'x1="NaN"')).some(d => /NaN/.test(d)), 'NaN détecté');
  assert.ok(C.controler(bon.replace(/x1="[^"]+"/, 'x1="900"')).some(d => /hors du cadre/.test(d)), 'tracé hors du cadre détecté');
  assert.ok(C.controler(bon.replace('</g></svg>', '</svg>')).some(d => /ferm/.test(d)), 'balise non fermée détectée');
  const double = bon.replace(/(<text [^>]*>[^<]*<\/text>)/, '$1$1');
  assert.ok(C.controler(double).some(d => /superposées/.test(d)), 'étiquettes superposées détectées');
}

console.log('Figures : ' + exemples.length + ' exemples, ' + controles + ' contrôles réussis.');
