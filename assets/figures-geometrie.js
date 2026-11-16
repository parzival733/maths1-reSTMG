/* Moteur de figures, seconde partie : géométrie plane, droite numérique,
   solides en perspective cavalière et tracé d'un programme. S'ajoute à
   assets/figures.js, qui doit être chargé avant. */
(function (racine, fabrique) {
  if (typeof module === 'object' && module && module.exports) module.exports = fabrique;
  else fabrique(racine.Figures);
})(typeof window !== 'undefined' ? window : globalThis, function (Figures) {
  'use strict';
  const {HUIT, PETIT, TAILLE, TIRETS, R2, ROSE, MOINS, arcPoints, autour, couper, direction, liste, places, trait, unite, decimales, graduations, longueur, nb, pasJoli} = Figures.interne;

  /* ---------- Géométrie plane (échelle uniforme) ---------- */
  function geo(T, desc, m) {
    const els = desc.elements || [], o = desc.options || {};
    const pts = {};
    const R = r => {
      if (Array.isArray(r)) return r;
      if (!(r in pts)) throw new Error('Point inconnu : ' + r);
      return pts[r];
    };
    for (const e of els) {
      if (e.t !== 'point') continue;
      if (e.sur) { const a = R(e.sur[0]), b = R(e.sur[1]); pts[e.nom] = [a[0] + e.k * (b[0] - a[0]), a[1] + e.k * (b[1] - a[1])]; }
      else pts[e.nom] = [e.x, e.y];
    }
    /* Étendue mathématique. */
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const voir = p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); };
    for (const e of els) {
      for (const k of ['a', 'b', 'sommet', 'p', 'q']) if (e[k] != null && (typeof e[k] === 'string' || Array.isArray(e[k]))) voir(R(e[k]));
      if (e.points) e.points.forEach(p => voir(R(p)));
      if (e.trou) e.trou.forEach(p => voir(R(p)));
      switch (e.t) {
        case 'point': voir(pts[e.nom]); break;
        case 'cercle': case 'arc_cercle': { const c = R(e.centre); voir([c[0] - e.rayon, c[1] - e.rayon]); voir([c[0] + e.rayon, c[1] + e.rayon]); break; }
        case 'ellipse': { const c = R(e.centre); voir([c[0] - e.rx, c[1] - e.ry]); voir([c[0] + e.rx, c[1] + e.ry]); break; }
        case 'rotation_fleche': { const c = R(e.centre), p = R(e.p), r = Math.hypot(p[0] - c[0], p[1] - c[1]), a = Math.atan2(p[1] - c[1], p[0] - c[0]) + e.angle * Math.PI / 180; voir(p); voir([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); break; }
        case 'texte': voir([e.x, e.y]); break;
        case 'sol': voir([e.x1, e.y]); voir([e.x2, e.y]); break;
        case 'mur': voir([e.x, e.y1]); voir([e.x, e.y2]); break;
        case 'immeuble': voir([e.x, e.y]); voir([e.x + e.l, e.y + e.h]); break;
        case 'sapin': { const l = e.l || 0.45 * e.h; voir([e.x - l / 2, e.y]); voir([e.x + l / 2, e.y + e.h]); break; }
        case 'observateur': voir([e.x, e.y]); voir([e.x, e.y + e.h]); break;
        default:
      }
    }
    if (o.cadre) { x0 = o.cadre[0]; y0 = o.cadre[1]; x1 = o.cadre[2]; y1 = o.cadre[3]; }
    if (!Number.isFinite(x0)) { x0 = y0 = 0; x1 = y1 = 1; }
    const L = T.w - m[0] - m[2], H = T.h - m[1] - m[3];
    const dx = x1 - x0, dy = y1 - y0;
    const k = dx < 1e-9 && dy < 1e-9 ? 1 : Math.min(dx < 1e-9 ? Infinity : L / dx, dy < 1e-9 ? Infinity : H / dy);
    const ox = m[0] + (L - k * dx) / 2, oy = m[1] + (H - k * dy) / 2;
    const px = p => [ox + (p[0] - x0) * k, oy + (y1 - p[1]) * k];
    const Q = r => px(R(r));
    const nom = r => (typeof r === 'string' ? r : '');

    /* Centre de la figure et voisins de chaque point, pour placer les noms à l'extérieur. */
    const noms = Object.keys(pts);
    let gx = 0, gy = 0;
    if (noms.length) { for (const n of noms) { const p = px(pts[n]); gx += p[0]; gy += p[1]; } gx /= noms.length; gy /= noms.length; }
    else { gx = ox + k * dx / 2; gy = oy + k * dy / 2; }
    const voisins = {};
    const lier = (a, b) => {
      if (typeof a === 'string') (voisins[a] = voisins[a] || []).push(Q(b));
      if (typeof b === 'string') (voisins[b] = voisins[b] || []).push(Q(a));
    };
    for (const e of els) {
      if (['segment', 'droite', 'demi_droite', 'vecteur', 'echelle', 'baton'].indexOf(e.t) >= 0) lier(e.a, e.b);
      if ((e.t === 'polygone' || e.t === 'rampe') && e.points) e.points.forEach((p, i) => { if (i + 1 < e.points.length || e.ouvert !== true) lier(p, e.points[(i + 1) % e.points.length]); });
    }
    const dehors = (p, n) => ((p[0] - gx) * n[0] + (p[1] - gy) * n[1] < 0 ? [-n[0], -n[1]] : n);

    for (const e of els) {
      switch (e.t) {
        case 'point': {
          const p = px(pts[e.nom]);
          if (e.marque) T.croix(p[0], p[1], 3, {e: 1.4, f: 'point', pts: e.nom});
          if (e.muet || e.nom[0] === '_') break;
          let dirs;
          if (e.pos != null) dirs = Array.isArray(e.pos) ? liste(e.pos).concat(HUIT) : [direction(e.pos)];
          else {
            let sx = 0, sy = 0;
            for (const v of voisins[e.nom] || []) { const u = unite([v[0] - p[0], v[1] - p[1]]); sx -= u[0]; sy -= u[1]; }
            if (Math.hypot(sx, sy) < 0.3) { sx = p[0] - gx; sy = p[1] - gy; }
            if (Math.hypot(sx, sy) < 0.3) { sx = 0; sy = -1; }
            dirs = autour(unite([sx, sy]));
          }
          T.etiquette(p[0], p[1], e.etiquette || e.nom, {dirs, dist: e.marque ? 7 : 5});
          break;
        }
        case 'segment': { const a = Q(e.a), b = Q(e.b); T.ligne(a[0], a[1], b[0], b[1], Object.assign(trait(e), {f: 'segment', pts: nom(e.a) + ' ' + nom(e.b)})); break; }
        case 'rampe':
        case 'polygone': {
          const p = e.points.map(Q);
          if (e.plein || e.t === 'rampe') T.fond(p, typeof e.plein === 'number' ? e.plein : 0.12, e.trou ? e.trou.map(Q) : null);
          if (e.hachures) T.hachurer(p);
          if (!e.sans_contour) T.poly(p, Object.assign(trait(e), {ferme: e.ouvert !== true, f: 'polygone', pts: e.points.map(nom).join(' ')}));
          break;
        }
        case 'hachures': T.hachurer(e.points.map(Q)); break;
        case 'droite':
        case 'demi_droite': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), G = 4000;
          const c = couper(e.t === 'droite' ? a[0] - u[0] * G : a[0], e.t === 'droite' ? a[1] - u[1] * G : a[1], a[0] + u[0] * G, a[1] + u[1] * G, 3, 3, T.w - 3, T.h - 3);
          if (!c) break;
          T.ligne(c[0], c[1], c[2], c[3], Object.assign(trait(e), {f: e.t, pts: nom(e.a) + ' ' + nom(e.b)}));
          if (e.nom) { const n = [-u[1], u[0]]; T.etiquette(c[2] - u[0] * 16, c[3] - u[1] * 16, e.nom, {dirs: [n, [-n[0], -n[1]]], dist: 4}); }
          break;
        }
        case 'cercle': { const c = Q(e.centre); T.cercle(c[0], c[1], e.rayon * k, Object.assign(trait(e), {f: 'cercle'})); break; }
        case 'arc_cercle': { const c = Q(e.centre); T.arc(c[0], c[1], e.rayon * k, e.rayon * k, e.debut * Math.PI / 180, e.fin * Math.PI / 180, trait(e)); break; }
        case 'ellipse': {
          const c = Q(e.centre), rx = e.rx * k, ry = e.ry * k;
          if (e.plein) T.fond(arcPoints(c, 1, 0, 2 * Math.PI, 36).map(p => [c[0] + (p[0] - c[0]) * rx, c[1] + (p[1] - c[1]) * ry]), typeof e.plein === 'number' ? e.plein : 0.12);
          if (e.arriere) { T.arc(c[0], c[1], rx, ry, Math.PI, 2 * Math.PI, trait(e)); T.arc(c[0], c[1], rx, ry, 0, Math.PI, {t: TIRETS, e: 1.2}); }
          else { T.arc(c[0], c[1], rx, ry, 0, Math.PI, trait(e)); T.arc(c[0], c[1], rx, ry, Math.PI, 2 * Math.PI, trait(e)); }
          break;
        }
        case 'angle_droit': {
          const s = Q(e.sommet), u = unite([Q(e.p)[0] - s[0], Q(e.p)[1] - s[1]]), v = unite([Q(e.q)[0] - s[0], Q(e.q)[1] - s[1]]), t = e.taille || 9;
          T.poly([[s[0] + u[0] * t, s[1] + u[1] * t], [s[0] + (u[0] + v[0]) * t, s[1] + (u[1] + v[1]) * t], [s[0] + v[0] * t, s[1] + v[1] * t]],
            {e: 1.2, f: 'angle-droit', pts: nom(e.sommet) + ' ' + nom(e.p) + ' ' + nom(e.q)});
          break;
        }
        case 'angle': {
          const s = Q(e.sommet), u = unite([Q(e.p)[0] - s[0], Q(e.p)[1] - s[1]]), v = unite([Q(e.q)[0] - s[0], Q(e.q)[1] - s[1]]), r = e.rayon || 22;
          const a1 = Math.atan2(-u[1], u[0]);
          let da = Math.atan2(-v[1], v[0]) - a1;
          while (da > Math.PI) da -= 2 * Math.PI;
          while (da < -Math.PI) da += 2 * Math.PI;
          T.arc(s[0], s[1], r, r, a1, a1 + da, {e: 1.2, f: 'angle'});
          if (e.double) T.arc(s[0], s[1], r + 3, r + 3, a1, a1 + da, {e: 1.2});
          if (e.texte != null) {
            const am = a1 + da / 2, b = [Math.cos(am), -Math.sin(am)];
            T.etiquette(s[0] + b[0] * (r + (e.double ? 3 : 0)), s[1] + b[1] * (r + (e.double ? 3 : 0)), e.texte, {dirs: [b, [b[0], b[1], 10], [b[0], b[1], 16]], dist: 3, taille: e.taille || PETIT + 1});
          }
          break;
        }
        case 'cote': {
          const a = Q(e.a), b = Q(e.b), mi = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = unite([b[0] - a[0], b[1] - a[1]]);
          let n = dehors(mi, [-u[1], u[0]]);
          if (e.interieur) n = [-n[0], -n[1]];
          const en = (v, t) => [v[0], v[1], 4, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], op = [-n[0], -n[1]];
          let dirs = [en(n, 0.5), en(op, 0.5), en(n, 0.35), en(n, 0.65), en(op, 0.35), en(op, 0.65)];
          if (e.pos != null) { const l = liste(e.pos); dirs = Array.isArray(e.pos) ? l.map(v => en(v, 0.5)).concat(l.map(v => en(v, 0.35)), l.map(v => en(v, 0.65))) : [en(l[0], 0.5)]; }
          T.etiquette(mi[0], mi[1], e.texte, {dirs, dist: 4, taille: e.taille});
          break;
        }
        case 'cote_fleche': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), d = e.decalage || 14;
          let n = dehors([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [-u[1], u[0]]);
          if (e.pos != null) n = direction(e.pos);
          const a2 = [a[0] + n[0] * d, a[1] + n[1] * d], b2 = [b[0] + n[0] * d, b[1] + n[1] * d];
          T.ligne(a[0] + n[0] * 3, a[1] + n[1] * 3, a[0] + n[0] * (d + 3), a[1] + n[1] * (d + 3), {e: 1});
          T.ligne(b[0] + n[0] * 3, b[1] + n[1] * 3, b[0] + n[0] * (d + 3), b[1] + n[1] * (d + 3), {e: 1});
          T.ligne(a2[0] + u[0] * 5, a2[1] + u[1] * 5, b2[0] - u[0] * 5, b2[1] - u[1] * 5, {e: 1.2, f: 'cote-fleche'});
          T.tete(a2[0], a2[1], -u[0], -u[1], 6);
          T.tete(b2[0], b2[1], u[0], u[1], 6);
          T.etiquette((a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2, e.texte, {dirs: [n], dist: 3});
          break;
        }
        case 'codage': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), s = unite([-u[1] + 0.35 * u[0], u[0] + 0.35 * u[1]]), n = e.n || 1;
          for (let i = 0; i < n; i++) {
            const off = (i - (n - 1) / 2) * 3.5, cx = (a[0] + b[0]) / 2 + u[0] * off, cy = (a[1] + b[1]) / 2 + u[1] * off;
            T.ligne(cx - s[0] * 4.5, cy - s[1] * 4.5, cx + s[0] * 4.5, cy + s[1] * 4.5, {e: 1.2, f: 'codage'});
          }
          break;
        }
        case 'parallele':
        case 'sens': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), n = [-u[1], u[0]], t = e.position == null ? 0.5 : e.position;
          const c = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          if (e.t === 'sens') { T.tete(c[0] + u[0] * 4, c[1] + u[1] * 4, u[0], u[1], 8); break; }
          for (let i = 0; i < (e.n || 1); i++) {
            const q = [c[0] + u[0] * (3 - i * 5), c[1] + u[1] * (3 - i * 5)];
            T.poly([[q[0] - u[0] * 5 + n[0] * 4, q[1] - u[1] * 5 + n[1] * 4], q, [q[0] - u[0] * 5 - n[0] * 4, q[1] - u[1] * 5 - n[1] * 4]], {e: 1.2, f: 'parallele'});
          }
          break;
        }
        case 'vecteur': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]);
          T.ligne(a[0], a[1], b[0] - u[0] * 5, b[1] - u[1] * 5, Object.assign(trait(e), {f: 'vecteur', pts: nom(e.a) + ' ' + nom(e.b)}));
          T.tete(b[0], b[1], u[0], u[1], 8, {c: e.couleur, f: 'pointe'});
          if (e.nom) {
            const mi = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = dehors(mi, [-u[1], u[0]]);
            T.etiquette(mi[0], mi[1], e.nom, {dirs: [n, [-n[0], -n[1]]], dist: 4, fleche: e.fleche !== false});
          }
          break;
        }
        case 'rotation_fleche': {
          const c = Q(e.centre), p = Q(e.p), r = Math.hypot(p[0] - c[0], p[1] - c[1]), a0 = Math.atan2(-(p[1] - c[1]), p[0] - c[0]), a1 = a0 + e.angle * Math.PI / 180;
          const marge = Math.min(0.5, 7 / r) * (e.angle > 0 ? 1 : -1);
          T.arc(c[0], c[1], r, r, a0, a1 - marge * 0.6, {e: 1.2, t: '3 3', f: 'rotation'});
          const s = e.angle > 0 ? 1 : -1;
          T.tete(c[0] + r * Math.cos(a1), c[1] - r * Math.sin(a1), -Math.sin(a1) * s, -Math.cos(a1) * s, 7);
          break;
        }
        case 'texte': {
          const p = px([e.x, e.y]), taille = e.taille || TAILLE;
          if (e.pos != null) T.etiquette(p[0], p[1], e.texte, {dirs: liste(e.pos), dist: e.dist == null ? 5 : e.dist, taille});
          else T.texte(p[0], p[1] + 0.3 * taille, e.texte, {prio: 6, taille, ancre: e.ancre});
          break;
        }
        case 'sol': {
          const a = px([e.x1, e.y]), b = px([e.x2, e.y]);
          T.ligne(a[0], a[1], b[0], b[1], {e: 2, f: 'sol'});
          for (let x = a[0] + 6; x < b[0]; x += 10) T.ligne(x, a[1] + 1, x - 5, a[1] + 6, {e: 1});
          break;
        }
        case 'mur': {
          const a = px([e.x, e.y1]), b = px([e.x, e.y2]), s = e.cote === 'g' ? -1 : 1;
          T.ligne(a[0], a[1], b[0], b[1], {e: 2, f: 'mur'});
          for (let y = a[1] - 6; y > b[1]; y -= 10) T.ligne(a[0] + s, y, a[0] + 6 * s, y + 5, {e: 1});
          break;
        }
        case 'echelle': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), n = [-u[1] * 2.5, u[0] * 2.5], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
          T.ligne(a[0] + n[0], a[1] + n[1], b[0] + n[0], b[1] + n[1], {e: 1.4, f: 'echelle', pts: nom(e.a) + ' ' + nom(e.b)});
          T.ligne(a[0] - n[0], a[1] - n[1], b[0] - n[0], b[1] - n[1], {e: 1.4});
          for (let d = 8; d < l - 4; d += 11) T.ligne(a[0] + u[0] * d + n[0], a[1] + u[1] * d + n[1], a[0] + u[0] * d - n[0], a[1] + u[1] * d - n[1], {e: 1, leger: true});
          break;
        }
        case 'baton': { const a = Q(e.a), b = Q(e.b); T.ligne(a[0], a[1], b[0], b[1], {e: 3.4, f: 'baton', pts: nom(e.a) + ' ' + nom(e.b)}); break; }
        case 'ombre': { const a = Q(e.a), b = Q(e.b); T.ligne(a[0], a[1] + 3, b[0], b[1] + 3, {e: 4, op: 0.35, f: 'ombre', leger: true}); break; }
        case 'immeuble': {
          const a = px([e.x, e.y]), b = px([e.x + e.l, e.y + e.h]), et = e.etages || 4, tr = e.travees || 2;
          T.poly([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], {ferme: true, f: 'immeuble'});
          const lw = (b[0] - a[0]) / tr, lh = (a[1] - b[1]) / et;
          for (let i = 0; i < tr; i++) for (let j = 0; j < et; j++) {
            const x = a[0] + (i + 0.3) * lw, y = b[1] + (j + 0.3) * lh;
            T.poly([[x, y], [x + lw * 0.4, y], [x + lw * 0.4, y + lh * 0.4], [x, y + lh * 0.4]], {ferme: true, e: 0.8, leger: true});
          }
          break;
        }
        case 'sapin': {
          const l = e.l || 0.45 * e.h, a = px([e.x, e.y]), t = px([e.x, e.y + 0.22 * e.h]), g = px([e.x - l / 2, e.y + 0.2 * e.h]), d = px([e.x + l / 2, e.y + 0.2 * e.h]), s = px([e.x, e.y + e.h]);
          T.ligne(a[0], a[1], t[0], t[1], {e: 3, f: 'tronc'});
          T.fond([g, d, s], 0.12);
          T.poly([g, d, s], {ferme: true, f: 'sapin'});
          break;
        }
        case 'observateur': {
          const a = px([e.x, e.y]), y = px([e.x, e.y + e.h]);
          T.ligne(a[0], a[1], y[0], y[1] + 4, {e: 2.4, f: 'observateur'});
          T.cercle(y[0], y[1], 4, {e: 1.4});
          break;
        }
        default: throw new Error('Élément inconnu dans une figure : ' + e.t);
      }
    }
  }

  /* ---------- Droite numérique ---------- */
  function droiteNumerique(T, desc, m) {
    const o = desc.options || {}, els = desc.elements || [];
    const min = o.min == null ? -5 : o.min, max = o.max == null ? 5 : o.max, pas = o.pas || pasJoli(max - min, 10);
    const lignes = 1 + Math.max.apply(null, [0].concat(els.map(e => e.ligne || 0)));
    const g = m[0] + 10, d = T.w - m[2] - 14;
    const X = x => g + (x - min) * (d - g) / (max - min);
    const yL = i => T.h / 2 + (i - (lignes - 1) / 2) * 58 + 2;
    const dec = decimales(pas);
    for (let i = 0; i < lignes; i++) {
      const y = yL(i);
      T.ligne(g - 10, y, d + 8, y, {e: 1.4, f: 'axe', leger: true});
      T.tete(d + 14, y, 1, 0, 7);
      const gr = graduations(min, max, pas), large = Math.max.apply(null, gr.map(v => longueur(nb(v, dec)))) * 0.6 * PETIT + 5;
      const saut = Math.max(1, Math.ceil(large / (pas * (d - g) / (max - min))));
      for (const v of gr) {
        T.ligne(X(v), y - 3, X(v), y + 3, {e: 1.2, leger: true});
        if (o.graduations !== false && Math.round(v / pas) % saut === 0) T.texte(X(v), y + 17, nb(v, dec), {prio: 1, souple: true, taille: PETIT});
      }
      if (o.noms_lignes && o.noms_lignes[i]) T.texte(g - 10, y - 16, o.noms_lignes[i], {prio: 6, taille: PETIT + 1, ancre: 'start'});
    }
    const valeur = (x, y, texte) => T.texte(X(x), y + 17, texte == null ? nb(x) : texte, {prio: 3, taille: PETIT, repli: [0, 13]});
    const distance = (a, b, texte, y) => {
      const xa = X(a), xb = X(b), h = y - 15;
      T.ligne(xa + 5, h, xb - 5, h, {e: 1.2, f: 'distance'});
      T.tete(xa, h, -1, 0, 6);
      T.tete(xb, h, 1, 0, 6);
      if (texte != null) T.etiquette((xa + xb) / 2, h, texte, {dirs: [ROSE.n], dist: 3, taille: PETIT + 1});
    };
    const intervalle = (e, y) => {
      const xa = e.a == null ? g - 10 : X(e.a), xb = e.b == null ? d + 4 : X(e.b);
      T.ligne(xa, y, xb, y, {e: 4, f: 'intervalle'});
      const tx = e.textes || [];
      if (e.a != null) { T.crochet(xa, y, e.ouvert_a ? -1 : 1); if (e.valeurs !== false) valeur(e.a, y, tx[0]); }
      if (e.b != null) { T.crochet(xb, y, e.ouvert_b ? 1 : -1); if (e.valeurs !== false) valeur(e.b, y, tx[1]); }
    };
    const point = (e, y) => {
      T.disque(X(e.x), y - 7 * (e.empile || 0), 3, {f: 'point'});
      if (e.nom) T.etiquette(X(e.x), y, e.nom, {dirs: [ROSE.n, ROSE.ne, ROSE.no], dist: 6});
      if (e.valeur !== false) valeur(e.x, y, typeof e.valeur === 'string' ? e.valeur : null);
    };
    for (const e of els) {
      const y = yL(e.ligne || 0);
      switch (e.t) {
        case 'point': point(e, y); break;
        case 'intervalle': intervalle(e, y); break;
        case 'distance': distance(e.a, e.b, e.texte, y); break;
        case 'centre_rayon': {
          intervalle({a: e.a - e.r, b: e.a + e.r}, y);
          point({x: e.a, nom: e.nom}, y);
          const texte = e.texte == null ? nb(e.r) : e.texte;
          distance(e.a - e.r, e.a, texte, y);
          distance(e.a, e.a + e.r, texte, y);
          break;
        }
        case 'texte': T.texte(X(e.x), y - 22, e.texte, {prio: 6, taille: PETIT + 1}); break;
        default: throw new Error('Élément inconnu sur une droite numérique : ' + e.t);
      }
    }
  }

  /* ---------- Solides en perspective cavalière (45°, coefficient 0,5) ---------- */
  const FUITE = 0.5 * R2;
  const projeter = p => [p[0] + FUITE * p[1], p[2] + FUITE * p[1]];

  function espaceVersPlan(desc) {
    const out = [], noms3 = {};
    let auto = 0;
    const cree = (p3, nom, extra) => {
      const n = nom || '_' + (++auto);
      noms3[n] = p3;
      const p = projeter(p3);
      out.push(Object.assign({t: 'point', nom: n, x: p[0], y: p[1]}, extra || {}));
      return n;
    };
    const ref = r => (Array.isArray(r) ? projeter(r) : r);
    const seg = (a, b, cache) => out.push({t: 'segment', a, b, pointilles: !!cache, fin: !!cache});
    const cote = (a, b, texte, pos) => { if (texte != null && texte !== '') out.push({t: 'cote', a, b, texte: String(texte), pos}); };
    const dec = (e, p) => { const og = e.origine || [0, 0, 0]; return [p[0] + og[0], p[1] + og[1], p[2] + og[2]]; };
    const pyramide = (e, hauteur) => {
      const c = e.c, h = e.h, n = e.noms || [], cs = e.cotes || [];
      const A = cree(dec(e, [0, 0, 0]), n[0], {pos: ['so', 'o']}), B = cree(dec(e, [c, 0, 0]), n[1], {pos: ['se', 's']}), C = cree(dec(e, [c, c, 0]), n[2], {pos: ['e', 'ne']}), D = cree(dec(e, [0, c, 0]), n[3], {pos: ['o', 'no']});
      const S = cree(dec(e, [c / 2, c / 2, h]), n[4], {pos: ['n']}), H = cree(dec(e, [c / 2, c / 2, 0]), n[5], {pos: ['s', 'se', 'so']});
      seg(A, B); seg(B, C); seg(S, A); seg(S, B); seg(S, C);
      seg(A, D, true); seg(D, C, true); seg(S, D, true);
      if (hauteur) {
        seg(S, H, true); seg(A, C, true); seg(B, D, true);
        out.push({t: 'angle_droit', sommet: H, p: S, q: B, taille: 6});
        if (cs[1] != null) { const s2 = projeter(dec(e, [c / 2, c / 2, h])), c2 = projeter(dec(e, [c, c, 0])); out.push({t: 'cote_fleche', a: [c2[0], s2[1] - h], b: [c2[0], s2[1]], texte: String(cs[1]), pos: 'e', decalage: 20}); }
      }
      cote(A, B, cs[0], 's');
      return {A, B, C, D, S, H};
    };
    for (const e of desc.elements || []) {
      switch (e.t) {
        case 'cube':
        case 'pave': {
          const L = e.t === 'cube' ? e.a : e.L, l = e.t === 'cube' ? e.a : e.l, h = e.t === 'cube' ? e.a : e.h, n = e.noms || [], cs = e.cotes || [];
          const v = [[0, 0, 0], [L, 0, 0], [L, l, 0], [0, l, 0], [0, 0, h], [L, 0, h], [L, l, h], [0, l, h]].map((p, i) => cree(dec(e, p), n[i], {pos: [['so'], ['se'], ['e'], ['no', 'o'], ['o'], ['se', 'e'], ['ne'], ['no']][i]}));
          [[0, 1], [1, 5], [5, 4], [4, 0], [1, 2], [2, 6], [6, 5], [4, 7], [7, 6]].forEach(a => seg(v[a[0]], v[a[1]]));
          [[0, 3], [3, 2], [3, 7]].forEach(a => seg(v[a[0]], v[a[1]], true));
          cote(v[0], v[1], cs[0], 's'); cote(v[1], v[2], cs[1], 'se'); cote(v[0], v[4], cs[2], 'o');
          break;
        }
        case 'pyramide_carree': pyramide(e, true); break;
        case 'section_pyramide': {
          const q = pyramide(e, e.hauteur !== false), c = e.c, h = e.h, k = e.k, n = e.noms_section || [];
          const s = [c / 2, c / 2, h], coin = p => cree(dec(e, [s[0] + k * (p[0] - s[0]), s[1] + k * (p[1] - s[1]), h * (1 - k)]), n.shift());
          const a = coin([0, 0]), b = coin([c, 0]), cc = coin([c, c]), d = coin([0, c]);
          out.push({t: 'polygone', points: [a, b, cc, d], plein: 0.14, sans_contour: true});
          seg(a, b); seg(b, cc); seg(cc, d, true); seg(d, a, true);
          if (e.cotes && e.cotes[2] != null) cote(a, b, e.cotes[2], 'n');
          void q;
          break;
        }
        case 'cylindre': {
          const r = e.r, h = e.h, cs = e.cotes || [], og = projeter(e.origine || [0, 0, 0]), O = [og[0], og[1]], S = [og[0], og[1] + h];
          out.push({t: 'ellipse', centre: O, rx: r, ry: 0.3 * r, arriere: true}, {t: 'ellipse', centre: S, rx: r, ry: 0.3 * r});
          out.push({t: 'segment', a: [O[0] - r, O[1]], b: [S[0] - r, S[1]]}, {t: 'segment', a: [O[0] + r, O[1]], b: [S[0] + r, S[1]]});
          out.push({t: 'point', nom: '_c' + (++auto), x: S[0], y: S[1], marque: true}, {t: 'segment', a: S, b: [S[0] + r, S[1]], fin: true});
          cote([S[0], S[1] + 0.3 * r], [S[0] + r, S[1] + 0.3 * r], cs[0], 'n'); cote([O[0] + r, O[1]], [S[0] + r, S[1]], cs[1], 'e');
          break;
        }
        case 'cone': {
          const r = e.r, h = e.h, cs = e.cotes || [], og = projeter(e.origine || [0, 0, 0]), O = [og[0], og[1]], S = [og[0], og[1] + h];
          out.push({t: 'ellipse', centre: O, rx: r, ry: 0.3 * r, arriere: true});
          out.push({t: 'segment', a: [O[0] - r, O[1]], b: S}, {t: 'segment', a: [O[0] + r, O[1]], b: S});
          out.push({t: 'segment', a: O, b: S, pointilles: true, fin: true}, {t: 'segment', a: O, b: [O[0] + r, O[1]], pointilles: true, fin: true});
          out.push({t: 'angle_droit', sommet: O, p: S, q: [O[0] + r, O[1]], taille: 7});
          cote([O[0], O[1] - 0.3 * r], [O[0] + r, O[1] - 0.3 * r], cs[0], 's'); cote(O, S, cs[1], ['o', 'e']);
          break;
        }
        case 'boule': {
          const r = e.r, cs = e.cotes || [], O = projeter(e.centre || [0, 0, 0]);
          out.push({t: 'cercle', centre: O, rayon: r}, {t: 'ellipse', centre: O, rx: r, ry: 0.3 * r, arriere: true});
          out.push({t: 'point', nom: '_c' + (++auto), x: O[0], y: O[1], marque: true}, {t: 'segment', a: O, b: [O[0] + r, O[1]], pointilles: true, fin: true});
          cote([O[0], O[1]], [O[0] + 0.76 * r, O[1]], cs[0], ['n', 's']);
          break;
        }
        case 'point': cree([e.x, e.y, e.z], e.nom, {pos: e.pos, marque: e.marque, muet: e.muet}); break;
        case 'ellipse': out.push(Object.assign({}, e, {centre: ref(e.centre), ry: e.ry == null ? 0.3 * e.rx : e.ry})); break;
        case 'texte': { const p = projeter([e.x, e.y, e.z]); out.push({t: 'texte', x: p[0], y: p[1], texte: e.texte, pos: e.pos}); break; }
        case 'polygone': out.push(Object.assign({}, e, {points: e.points.map(ref)})); break;
        default: {
          const c = Object.assign({}, e);
          for (const k of ['a', 'b', 'sommet', 'p', 'q']) if (c[k] != null) c[k] = ref(c[k]);
          out.push(c);
        }
      }
    }
    return {options: desc.options, elements: out};
  }

  /* ---------- Tracé d'un programme (lutin) ---------- */
  function traceVersPlan(desc) {
    const o = desc.options || {}, n = o.cotes, pas = o.longueur || 1, s = o.sens === 'droite' ? -1 : 1, els = [];
    let x = 0, y = 0, cap = 0;
    const pts = [[0, 0]];
    for (let i = 0; i < n; i++) {
      x += pas * Math.cos(cap * Math.PI / 180); y += pas * Math.sin(cap * Math.PI / 180);
      pts.push([Math.round(x * 1e9) / 1e9, Math.round(y * 1e9) / 1e9]);
      cap += s * o.angle;
    }
    for (let i = 0; i < n; i++) els.push({t: 'segment', a: pts[i], b: pts[i + 1]});
    els.push({t: 'sens', a: pts[0], b: pts[1]});
    els.push({t: 'point', nom: '_d', x: 0, y: 0, marque: true}, {t: 'texte', x: 0, y: 0, texte: o.depart || 'départ', pos: s > 0 ? 'so' : 'no', taille: PETIT});
    if (o.cote != null) els.push({t: 'cote', a: pts[0], b: pts[1], texte: String(o.cote), pos: s > 0 ? 's' : 'n'});
    return {options: {largeur: o.largeur, hauteur: o.hauteur, marge: o.marge}, elements: els};
  }

  return Figures.etendre({
    rendus: {
      figure: geo,
      droite_numerique: droiteNumerique,
      espace: (T, d, m) => geo(T, espaceVersPlan(d), m),
      programme_trace: (T, d, m) => geo(T, traceVersPlan(d), m)
    },
    dimensions: {droite_numerique: desc => [320, 96 + 58 * Math.max.apply(null, [0].concat((desc.elements || []).map(e => e.ligne || 0)))]},
    signatures: {
      figure: {
        point: ['nom', 'x', 'y'], segment: ['a', 'b'], polygone: ['points'], droite: ['a', 'b'], demi_droite: ['a', 'b'],
        cercle: ['centre', 'rayon'], arc_cercle: ['centre', 'rayon', 'debut', 'fin'], ellipse: ['centre', 'rx', 'ry'],
        angle_droit: ['sommet', 'p', 'q'], angle: ['sommet', 'p', 'q'], cote: ['a', 'b', 'texte'], cote_fleche: ['a', 'b', 'texte'],
        codage: ['a', 'b', 'n'], parallele: ['a', 'b'], sens: ['a', 'b'], vecteur: ['a', 'b', 'nom'], rotation_fleche: ['centre', 'p', 'angle'],
        texte: ['x', 'y', 'texte'], hachures: ['points'], sol: ['x1', 'x2', 'y'], mur: ['x', 'y1', 'y2'], echelle: ['a', 'b'],
        baton: ['a', 'b'], ombre: ['a', 'b'], immeuble: ['x', 'y', 'l', 'h'], sapin: ['x', 'y', 'h'], observateur: ['x', 'y', 'h'], rampe: ['points']
      },
      droite_numerique: {point: ['x', 'nom'], intervalle: ['a', 'b'], distance: ['a', 'b', 'texte'], centre_rayon: ['a', 'r'], texte: ['x', 'texte']},
      espace: {
        pave: ['L', 'l', 'h'], cube: ['a'], pyramide_carree: ['c', 'h'], cylindre: ['r', 'h'], cone: ['r', 'h'], boule: ['r'], section_pyramide: ['c', 'h', 'k'],
        point: ['nom', 'x', 'y', 'z'], segment: ['a', 'b'], polygone: ['points'], ellipse: ['centre', 'rx', 'ry'], cote: ['a', 'b', 'texte'], cote_fleche: ['a', 'b', 'texte'], angle_droit: ['sommet', 'p', 'q'], texte: ['x', 'y', 'z', 'texte']
      }
    },
    constructeurs: sorties => ({
      programme_trace: (titre, cotes, angle, options) => sorties({type: 'programme_trace', titre, options: Object.assign({cotes, angle}, options || {})})
    })
  });
});
