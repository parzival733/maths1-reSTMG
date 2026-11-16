/* Contrôles communs des figures, à partir du SVG produit (jamais des données
   internes du moteur) : validité, cadre, accessibilité, étiquettes lisibles,
   et outils de mesure pour recalculer longueurs, angles et points. */
'use strict';

const num = v => parseFloat(v);
const attr = (balise, nom) => {
  const m = new RegExp('(?:^|\\s)' + nom + '="([^"]*)"').exec(balise);
  return m ? m[1] : null;
};
const decoder = s => s.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/* Points d'un attribut d : M, L, H, V, Z et les extrémités des arcs A. */
function pointsChemin(d) {
  const pts = [];
  const re = /([MLHVAZ])([^MLHVAZ]*)/g;
  let m, x = 0, y = 0;
  while ((m = re.exec(d))) {
    const v = m[2].trim().split(/[\s,]+/).filter(Boolean).map(num);
    if (m[1] === 'M' || m[1] === 'L') { x = v[0]; y = v[1]; }
    else if (m[1] === 'H') x = v[0];
    else if (m[1] === 'V') y = v[0];
    else if (m[1] === 'A') { x = v[5]; y = v[6]; }
    else continue;
    pts.push([x, y]);
  }
  return pts;
}

/* Découpe le SVG en éléments mesurables. Les panneaux d'un groupe sont remis dans le repère global. */
function analyser(svg) {
  const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  const out = {w: vb ? num(vb[1]) : NaN, h: vb ? num(vb[2]) : NaN, lignes: [], chemins: [], cercles: [], textes: [], erreurs: []};
  const pile = [];
  const re = /<(\/?)([a-zA-Z]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;
  let m, dernier = 0, texte = null;
  const contexte = () => {
    let dx = 0, dy = 0, taille = 14, ancre = 'start', panneau = 0;
    for (const p of pile) {
      const t = /translate\(([-\d.]+)[ ,]([-\d.]+)\)/.exec(attr(p.attrs, 'transform') || '');
      if (t) { dx += num(t[1]); dy += num(t[2]); }
      if (attr(p.attrs, 'font-size')) taille = num(attr(p.attrs, 'font-size'));
      if (attr(p.attrs, 'text-anchor')) ancre = attr(p.attrs, 'text-anchor');
      if (attr(p.attrs, 'data-panneau')) panneau = num(attr(p.attrs, 'data-panneau'));
    }
    return {dx, dy, taille, ancre, panneau};
  };
  while ((m = re.exec(svg))) {
    const entre = svg.slice(dernier, m.index);
    if (/[<>]/.test(entre)) out.erreurs.push('chevron isolé : ' + entre.slice(0, 30));
    dernier = re.lastIndex;
    const [, ferme, nom, attrs, auto] = m;
    if (ferme) {
      const haut = pile.pop();
      if (!haut || haut.nom !== nom) out.erreurs.push('balise mal fermée : ' + nom);
      if (nom === 'text' && texte) {
        texte.texte = decoder(svg.slice(texte.debut, m.index));
        out.textes.push(texte);
        texte = null;
      }
      continue;
    }
    const c = contexte();
    const donnees = {f: attr(attrs, 'data-f'), pts: attr(attrs, 'data-pts'), panneau: c.panneau, attrs};
    if (nom === 'line') out.lignes.push(Object.assign(donnees, {x1: num(attr(attrs, 'x1')) + c.dx, y1: num(attr(attrs, 'y1')) + c.dy, x2: num(attr(attrs, 'x2')) + c.dx, y2: num(attr(attrs, 'y2')) + c.dy}));
    else if (nom === 'path') out.chemins.push(Object.assign(donnees, {d: attr(attrs, 'd'), points: pointsChemin(attr(attrs, 'd') || '').map(p => [p[0] + c.dx, p[1] + c.dy])}));
    else if (nom === 'circle') out.cercles.push(Object.assign(donnees, {x: num(attr(attrs, 'cx')) + c.dx, y: num(attr(attrs, 'cy')) + c.dy, r: num(attr(attrs, 'r'))}));
    else if (nom === 'text') {
      texte = {x: num(attr(attrs, 'x')) + c.dx, y: num(attr(attrs, 'y')) + c.dy, taille: attr(attrs, 'font-size') ? num(attr(attrs, 'font-size')) : c.taille,
        ancre: attr(attrs, 'text-anchor') || c.ancre, panneau: c.panneau, sousTitre: !!attr(attrs, 'data-sous-titre'), debut: re.lastIndex};
    }
    if (!auto) pile.push({nom, attrs});
  }
  if (pile.length) out.erreurs.push('balises non fermées : ' + pile.map(p => p.nom).join(', '));
  for (const t of out.textes) {
    /* Boîte approchée : largeur 0,6 × taille × nombre de caractères. */
    const l = 0.6 * t.taille * Array.from(t.texte).length;
    const x0 = t.ancre === 'start' ? t.x : t.ancre === 'end' ? t.x - l : t.x - l / 2;
    t.boite = [x0, t.y - 0.8 * t.taille, x0 + l, t.y + 0.2 * t.taille];
  }
  return out;
}

/* Contrôles généraux. `source` est un <svg> seul ou un bloc <figure> complet. Renvoie la liste des défauts. */
function controler(source) {
  const defauts = [];
  const svg = (/<svg[\s\S]*<\/svg>/.exec(source) || [''])[0];
  if (!svg) return ['pas de balise svg'];
  if (/NaN|Infinity|undefined|null/.test(svg.replace(/>[^<]*</g, '><'))) defauts.push('valeur NaN, Infinity, undefined ou null dans un attribut');
  if (/\sstyle\s*=|<style/i.test(source)) defauts.push('attribut ou balise style');
  if (/<marker|<script|<foreignObject|\son\w+=/i.test(svg)) defauts.push('élément interdit');
  const a = analyser(svg);
  defauts.push(...a.erreurs);
  if (!(a.w > 0 && a.h > 0)) defauts.push('viewBox illisible');
  /* Accessibilité. */
  const titre = /<title id="([^"]+)">([^<]*)<\/title>/.exec(svg);
  const lien = /aria-labelledby="([^"]+)"/.exec(svg);
  if (!/role="img"/.test(svg)) defauts.push('role="img" absent');
  if (!titre || !titre[2].trim()) defauts.push('titre absent ou vide');
  else if (!lien || lien[1].split(' ')[0] !== titre[1]) defauts.push('aria-labelledby ne désigne pas le titre');
  const legende = /<figcaption>([^<]*)<\/figcaption>/.exec(source);
  if (/<figure/.test(source)) {
    if (!legende) defauts.push('figcaption absent');
    else if (titre && legende[1] !== titre[2]) defauts.push('titre et figcaption différents');
  }
  const ids = (svg.match(/\sid="[^"]+"/g) || []);
  if (new Set(ids).size !== ids.length) defauts.push('identifiant répété dans la figure');
  /* Tout tient dans le cadre. */
  const hors = (x, y) => !(x >= -0.05 && y >= -0.05 && x <= a.w + 0.05 && y <= a.h + 0.05);
  for (const l of a.lignes) if (hors(l.x1, l.y1) || hors(l.x2, l.y2)) defauts.push('ligne hors du cadre (' + [l.x1, l.y1, l.x2, l.y2] + ')');
  for (const c of a.chemins) for (const p of c.points) if (hors(p[0], p[1])) { defauts.push('chemin hors du cadre (' + p + ')'); break; }
  for (const c of a.cercles) if (hors(c.x - c.r, c.y - c.r) || hors(c.x + c.r, c.y + c.r)) defauts.push('cercle hors du cadre');
  for (const t of a.textes) if (hors(t.boite[0], t.boite[1]) || hors(t.boite[2], t.boite[3])) defauts.push('texte hors du cadre : « ' + t.texte + ' »');
  /* Étiquettes : aucune ne recouvre une autre. */
  for (let i = 0; i < a.textes.length; i++) for (let j = i + 1; j < a.textes.length; j++) {
    const p = a.textes[i], q = a.textes[j];
    if (p.boite[0] < q.boite[2] - 0.5 && q.boite[0] < p.boite[2] - 0.5 && p.boite[1] < q.boite[3] - 0.5 && q.boite[1] < p.boite[3] - 0.5) defauts.push('étiquettes superposées : « ' + p.texte + ' » et « ' + q.texte + ' »');
  }
  for (const t of a.textes) if (!t.texte.trim()) defauts.push('étiquette vide');
  return defauts;
}

/* Position en pixels des points nommés, lue sur les polygones, segments, vecteurs et croix. */
function pointsNommes(a) {
  const pts = {};
  const poser = (nom, p) => { if (nom && !(nom in pts)) pts[nom] = p; };
  for (const c of a.chemins) if (c.f === 'polygone' && c.pts) c.pts.split(' ').forEach((n, i) => poser(n, c.points[i]));
  for (const l of a.lignes) {
    if (!l.pts) continue;
    const n = l.pts.split(' ');
    if (l.f === 'point') poser(n[0], [(l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2]);
    else if (l.f === 'segment' || l.f === 'baton') { poser(n[0], [l.x1, l.y1]); poser(n[1], [l.x2, l.y2]); }
    else if (l.f === 'vecteur') poser(n[0], [l.x1, l.y1]);
  }
  return pts;
}

const distance = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/* Angle en degrés au sommet s entre [sp) et [sq). */
function angle(s, p, q) {
  const u = [p[0] - s[0], p[1] - s[1]], v = [q[0] - s[0], q[1] - s[1]];
  return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))))) * 180 / Math.PI;
}
/* Écart en pixels du point p à la droite (ab). */
function ecartDroite(p, a, b) {
  return Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / distance(a, b);
}
/* Distance en pixels du point p à la ligne brisée pts. */
function ecartLigne(p, pts) {
  let min = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], l2 = Math.pow(distance(a, b), 2) || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2));
    min = Math.min(min, distance(p, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]));
  }
  return min;
}
/* Distance du point p à la courbe (ou droite) la plus proche du repère. */
function ecartCourbes(a, p, familles) {
  const f = familles || ['courbe', 'droite', 'tangente', 'secante', 'ligne'];
  let min = Infinity;
  for (const c of a.chemins) if (f.indexOf(c.f) >= 0) min = Math.min(min, ecartLigne(p, c.points));
  for (const l of a.lignes) if (f.indexOf(l.f) >= 0) min = Math.min(min, ecartLigne(p, [[l.x1, l.y1], [l.x2, l.y2]]));
  return min;
}
/* Angles droits codés : écart à 90° de chaque petit carré. */
function anglesDroits(a) {
  return a.chemins.filter(c => c.f === 'angle-droit').map(c => Math.abs(angle(c.points[1], c.points[0], c.points[2]) - 90));
}

/* Figure dont les nombres écrits sont surtout des graduations : repère, droite numérique, diagramme sur des axes. */
const gradue = d => d.type === 'repere' || d.type === 'droite_numerique'
  || (d.type === 'statistiques' && !(d.elements || []).some(x => x.t === 'diagramme_circulaire' || x.t === 'diagramme_venn'));

/* Figures d'un exercice à variantes. `F` est le moteur, `e` l'exercice produit, `visible` rend le texte lisible
   d'un énoncé. Renvoie la liste des défauts : figure invalide, illisible, ou réponse attendue affichée dans la
   figure de l'énoncé (hors figures graduées) alors qu'elle n'est pas une donnée de l'énoncé. */
function controlerExercice(F, e, visible) {
  const defauts = [];
  for (const cle of ['figure', 'figure_correction']) {
    if (!e[cle]) continue;
    let html;
    try { html = F.html(e[cle], {classe: 'exercise-figure', id: 'figure-' + cle}); } catch (erreur) { defauts.push(cle + ' : ' + erreur.message); continue; }
    controler(html).forEach(d => defauts.push(cle + ' : ' + d));
    if (cle !== 'figure' || gradue(e[cle])) continue;
    const enonce = visible(e.statement), textes = analyser(html).textes.map(t => t.texte);
    for (const champ of e.fields) {
      if (champ.options) continue;
      const valeur = String(champ.answer).replace('.', ',').replace('-', '−');
      if (new RegExp('(^|[^\\d,])' + valeur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\d,])').test(enonce)) continue;
      if (textes.some(t => new RegExp('(^|[^\\d,])' + valeur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\d,])').test(t))) defauts.push('la figure de l’énoncé affiche la réponse ' + valeur);
    }
  }
  return defauts;
}

module.exports = {controlerExercice, analyser, controler, pointsNommes, pointsChemin, distance, angle, ecartDroite, ecartLigne, ecartCourbes, anglesDroits};
