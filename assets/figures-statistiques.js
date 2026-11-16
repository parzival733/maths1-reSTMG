/* Moteur de figures, statistiques et probabilités : arbres pondérés, diagrammes en barres, en bâtons,
   histogramme, boîte, diagramme circulaire, courbe d'indices, diagramme de
   Venn et triangle de Pascal. S'ajoute à assets/figures.js, qui doit être
   chargé avant ; les diagrammes circulaires et de Venn demandent aussi
   assets/figures-geometrie.js. */
(function (racine, fabrique) {
  if (typeof module === 'object' && module && module.exports) module.exports = fabrique;
  else fabrique(racine.Figures);
})(typeof window !== 'undefined' ? window : globalThis, function (Figures) {
  'use strict';
  const {PETIT, TAILLE, arcPoints, unite, longueur, nb, pasJoli, rendu} = Figures.interne;

  /* ---------- Arbre pondéré ---------- */
  function feuillesDe(n) { return n.enfants && n.enfants.length ? n.enfants.reduce((s, c) => s + feuillesDe(c), 0) : 1; }
  function profondeur(n) { return n.enfants && n.enfants.length ? 1 + Math.max.apply(null, n.enfants.map(profondeur)) : 0; }

  function arbre(T, desc, m) {
    const copie = n => ({nom: n.nom, p: n.p, feuille: n.feuille, epais: n.epais, enfants: (n.enfants || []).map(copie)});
    const o = desc.options || {}, racine = {enfants: (desc.niveaux || []).map(copie)};
    const total = feuillesDe(racine), prof = profondeur(racine);
    const chemins = (o.chemins || (o.chemin ? [o.chemin] : [])).map(c => c.join('\u0001'));
    const colonne = (T.w - m[0] - m[2] - 8) / prof, ligne = (T.h - m[1] - m[3]) / total;
    let rang = 0;
    const feuilles = [];
    (function poser(n, d) {
      n._x = m[0] + 4 + d * colonne;
      if (n.enfants && n.enfants.length) { n.enfants.forEach(c => poser(c, d + 1)); n._y = n.enfants.reduce((s, c) => s + c._y, 0) / n.enfants.length; }
      else { n._y = m[1] + (rang++ + 0.5) * ligne; feuilles.push(n); }
    })(racine, 0);
    const demi = n => (n.nom == null ? 0 : 0.3 * TAILLE * longueur(n.nom) + 5);
    T.disque(racine._x, racine._y, 2.4);
    (function dessiner(n, piste) {
      (n.enfants || []).forEach(c => {
        const suite = piste.concat([c.nom]), cle = suite.join('\u0001');
        const epais = c.epais || chemins.some(ch => ch === cle || ch.indexOf(cle + '\u0001') === 0);
        const a = [n._x + (n === racine ? 4 : demi(n)), n._y], b = [c._x - demi(c), c._y];
        T.ligne(a[0], a[1], b[0], b[1], {e: epais ? 3.4 : 1.4, f: epais ? 'branche chemin' : 'branche'});
        if (c.nom != null) T.texte(c._x, c._y + 5, c.nom, {prio: 6, gras: epais});
        if (c.p != null) {
          const u = unite([b[0] - a[0], b[1] - a[1]]), haut = [u[1], -u[0]], n1 = b[1] > a[1] + 1 ? [-haut[0], -haut[1]] : haut;
          T.etiquette(a[0] + (b[0] - a[0]) * 0.5, a[1] + (b[1] - a[1]) * 0.5, c.p, {dirs: [n1, [-n1[0], -n1[1]]], dist: 3, taille: PETIT});
        }
        dessiner(c, suite);
      });
    })(racine, []);
    feuilles.forEach((f, i) => {
      const texte = f.feuille != null ? f.feuille : (o.feuilles || [])[i];
      if (texte != null) T.texte(f._x + demi(f) + 6, f._y + 4.5, texte, {prio: 6, taille: PETIT, ancre: 'start'});
    });
  }

  /* ---------- Diagrammes statistiques ---------- */
  const plafond = (v, pas) => Math.ceil(v / pas - 1e-9) * pas;

  function statistiquesVers(desc) {
    const e = (desc.elements || [])[0], o = Object.assign({}, desc.options || {});
    if (!e) throw new Error('Diagramme statistique vide');
    const els = [];
    const base = (extra) => ({type: 'repere', options: Object.assign({origine: false, nom_x: e.nom_x || '', nom_y: e.nom_y || ''}, extra, o), elements: els});
    switch (e.t) {
      case 'diagramme_barres': {
        const n = e.categories.length, tous = e.valeurs.concat(e.valeurs2 || []), pas = e.pas_y || pasJoli(Math.max.apply(null, tous), 5), deux = !!e.valeurs2;
        e.categories.forEach((c, i) => {
          els.push({t: 'rect', x1: i + (deux ? 0.14 : 0.2), y1: 0, x2: i + (deux ? 0.5 : 0.8), y2: e.valeurs[i], plein: true});
          if (deux) els.push({t: 'rect', x1: i + 0.5, y1: 0, x2: i + 0.86, y2: e.valeurs2[i], hachures: true});
          els.push({t: 'etiquette_x', x: i + 0.5, texte: String(c)});
          if (e.valeurs_affichees && !deux) els.push({t: 'texte', x: i + 0.5, y: e.valeurs[i], texte: nb(e.valeurs[i]), pos: 'n', taille: PETIT});
        });
        if (deux && e.noms_series) els.push({t: 'legende', position: e.legende, entrees: [{forme: 'plein', texte: e.noms_series[0]}, {forme: 'hachures', texte: e.noms_series[1]}]});
        return base({xmin: 0, xmax: n, ymin: 0, ymax: e.ymax || plafond(Math.max.apply(null, tous) * (deux && e.noms_series ? 1.25 : 1.02), pas), pas_y: pas, grille: 'y', graduations_x: false});
      }
      case 'diagramme_batons': {
        const tous = e.probabilites.concat(e.observe || []), pas = e.pas_y || pasJoli(Math.max.apply(null, tous), 5), deux = !!e.observe;
        e.valeurs.forEach((x, i) => {
          els.push({t: 'baton', x, y: e.probabilites[i], decalage: deux ? -3 : 0});
          if (deux) els.push({t: 'baton', x, y: e.observe[i], decalage: 4, pointilles: true});
        });
        if (deux) { const ns = e.noms_series || ['modèle', 'observé']; els.push({t: 'legende', position: e.legende, entrees: [{forme: 'trait', texte: ns[0]}, {forme: 'tirets', texte: ns[1]}]}); }
        const xs = e.valeurs.slice().sort((a, b) => a - b), ecart = xs.length > 1 ? xs[1] - xs[0] : 1;
        return base({xmin: xs[0] - 0.7 * ecart, xmax: xs[xs.length - 1] + 0.7 * ecart, ymin: 0, ymax: e.ymax || plafond(Math.max.apply(null, tous) * (deux ? 1.3 : 1.02), pas), pas_y: pas, pas_x: ecart, valeurs_x: xs, grille: 'y', axe_y: 'gauche', coupure: false});
      }
      case 'histogramme': {
        const pas = e.pas_y || pasJoli(Math.max.apply(null, e.effectifs), 5), b = e.bornes;
        e.effectifs.forEach((v, i) => els.push({t: 'rect', x1: b[i], y1: 0, x2: b[i + 1], y2: v, plein: true}));
        return base({xmin: b[0], xmax: b[b.length - 1], ymin: 0, ymax: e.ymax || plafond(Math.max.apply(null, e.effectifs) * 1.02, pas), pas_y: pas, pas_x: b[1] - b[0], valeurs_x: b, grille: 'y'});
      }
      case 'courbe_indices': {
        const n = e.dates.length, ref = e.base == null ? 100 : e.base, tous = e.indices.concat([ref]);
        const pas = e.pas_y || pasJoli(Math.max.apply(null, tous) - Math.min.apply(null, tous), 4);
        const ymin = Math.floor(Math.min.apply(null, tous) / pas + 1e-9) * pas - pas, ymax = plafond(Math.max.apply(null, tous), pas) + pas;
        e.dates.forEach((d, i) => els.push({t: 'etiquette_x', x: i + 0.5, texte: String(d)}));
        els.push({t: 'segment', x1: 0, y1: ref, x2: n, y2: ref, pointilles: true, fin: true});
        els.push({t: 'texte', x: n, y: ref, texte: 'base ' + nb(ref), pos: 'no', taille: PETIT});
        els.push({t: 'ligne_brisee', points: e.indices.map((v, i) => [i + 0.5, v])});
        return base({xmin: 0, xmax: n, ymin: Math.max(0, ymin), ymax, pas_y: pas, grille: 'y', graduations_x: false, nom_y: e.nom_y || 'indice'});
      }
      case 'boite': {
        const bs = e.boites || [e], tous = [];
        bs.forEach(b => tous.push(b.min, b.max));
        const lo = Math.min.apply(null, tous), hi = Math.max.apply(null, tous), pas = e.pas || pasJoli(hi - lo, 6);
        bs.forEach((b, i) => els.push({t: 'boite', min: b.min, q1: b.q1, med: b.med, q3: b.q3, max: b.max, y: bs.length - i - 0.5 - (bs.length === 1 ? 0.12 : 0), demi: bs.length === 1 ? 0.22 : 0.26, nom: b.nom, valeurs: e.valeurs}));
        return base({xmin: e.xmin != null ? e.xmin : Math.floor(lo / pas + 1e-9) * pas, xmax: e.xmax != null ? e.xmax : plafond(hi, pas), ymin: 0, ymax: bs.length, pas_x: pas, axe_y: false, grille: 'x', hauteur: o.hauteur || (bs.length === 1 ? 120 : 170)});
      }
      case 'diagramme_circulaire': {
        const total = e.secteurs.reduce((s, c) => s + (c.angle != null ? c.angle : c.valeur), 0), parValeur = e.secteurs[0].angle == null;
        let a = e.depart == null ? 90 : e.depart;
        els.push({t: 'cercle', centre: [0, 0], rayon: 1});
        for (const c of e.secteurs) {
          const ang = parValeur ? 360 * c.valeur / total : c.angle, r0 = a * Math.PI / 180, mi = a - ang / 2;
          els.push({t: 'segment', a: [0, 0], b: [Math.cos(r0), Math.sin(r0)]});
          /* Un secteur étroit n'a pas la place d'accueillir son angle : il est écrit avec le nom, à l'extérieur. */
          const mesure = c.texte != null ? c.texte : nb(ang, 1) + '°', etroit = ang < 45, mr = mi * Math.PI / 180;
          if (e.angles !== false && !etroit) els.push({t: 'texte', x: 0.6 * Math.cos(mr), y: 0.6 * Math.sin(mr), texte: mesure, taille: PETIT});
          const nom = e.angles !== false && etroit ? (c.nom ? c.nom + ' (' + mesure + ')' : mesure) : c.nom;
          if (nom) els.push({t: 'texte', x: Math.cos(mr), y: Math.sin(mr), texte: nom, pos: [mi, mi + 22, mi - 22, mi + 40, mi - 40], taille: PETIT + 1});
          a -= ang;
        }
        return {type: 'figure', options: Object.assign({marge: 30}, o), elements: els};
      }
      case 'diagramme_venn': {
        const r = 1, d = 1.1, cA = [-d / 2, 0], cB = [d / 2, 0], th = Math.acos(d / 2 / r), N = 28, PI = Math.PI;
        const lentille = arcPoints(cA, r, -th, th, N).concat(arcPoints(cB, r, PI - th, PI + th, N));
        const union = arcPoints(cA, r, th, 2 * PI - th, 2 * N).concat(arcPoints(cB, r, -(PI - th), PI - th, 2 * N));
        const cadre = [[-2.1, -1.45], [2.1, -1.45], [2.1, 1.45], [-2.1, 1.45]];
        const zones = {inter: lentille, union, A: arcPoints(cA, r, 0, 2 * PI, 3 * N), B: arcPoints(cB, r, 0, 2 * PI, 3 * N),
          A_seul: arcPoints(cA, r, th, 2 * PI - th, 2 * N).concat(arcPoints(cB, r, PI + th, PI - th, N)),
          B_seul: arcPoints(cB, r, -(PI - th), PI - th, 2 * N).concat(arcPoints(cA, r, th, -th, N))};
        if (e.zone === 'hors') els.push({t: 'polygone', points: cadre, trou: union, plein: 0.16, sans_contour: true});
        else if (e.zone === 'hors_a') els.push({t: 'polygone', points: cadre, trou: zones.A, plein: 0.16, sans_contour: true});
        else if (zones[e.zone]) els.push({t: 'polygone', points: zones[e.zone], plein: 0.16, sans_contour: true});
        els.push({t: 'polygone', points: cadre}, {t: 'cercle', centre: cA, rayon: r}, {t: 'cercle', centre: cB, rayon: r});
        els.push({t: 'texte', x: cA[0] - 0.75, y: 0.75, texte: e.nom_a || 'A', pos: 'no', dist: 1}, {t: 'texte', x: cB[0] + 0.75, y: 0.75, texte: e.nom_b || 'B', pos: 'ne', dist: 1});
        const ef = e.effectifs || {};
        const ecrire = (x, y, v) => { if (v != null) els.push({t: 'texte', x, y, texte: typeof v === 'number' ? nb(v) : v, taille: PETIT + 1}); };
        ecrire(-1.0, 0, ef.a_seul); ecrire(0, 0, ef.inter); ecrire(1.0, 0, ef.b_seul); ecrire(1.6, -1.12, ef.hors);
        if (e.univers) els.push({t: 'texte', x: -1.85, y: 1.15, texte: e.univers, taille: PETIT + 1});
        return {type: 'figure', options: Object.assign({marge: 8}, o), elements: els};
      }
      default: throw new Error('Diagramme inconnu : ' + e.t);
    }
  }

  /* ---------- Triangle de Pascal ---------- */
  function pascal(T, desc) {
    const o = desc.options || {}, n = o.n, pasX = 30, pasY = 24;
    const cx = T.w / 2 + 22, y0 = T.h / 2 - n * pasY / 2 + 5;
    let ligne = [1];
    for (let i = 0; i <= n; i++) {
      const y = y0 + i * pasY, surligne = o.ligne === i;
      T.texte(cx - (n / 2) * pasX - 28, y, 'n\u00a0=\u00a0' + i, {prio: 6, taille: PETIT, ancre: 'end'});
      ligne.forEach((v, k) => {
        const x = cx + (k - i / 2) * pasX, vise = o.coefficient && o.coefficient[0] === i && o.coefficient[1] === k;
        T.texte(x, y, String(v), {prio: 6, gras: surligne || vise, taille: PETIT + 1});
        if (vise) T.cercle(x, y - 4.5, 12, {e: 1.6, f: 'coefficient', leger: true});
      });
      if (surligne) {
        const xa = cx - (i / 2) * pasX - 14, xb = cx + (i / 2) * pasX + 14;
        T.poly([[xa, y - 15], [xb, y - 15], [xb, y + 6], [xa, y + 6]], {ferme: true, e: 1.4, f: 'ligne', leger: true});
      }
      const suivante = [1];
      for (let k = 1; k <= i; k++) suivante.push(ligne[k - 1] + ligne[k]);
      suivante.push(1);
      ligne = suivante;
    }
  }

  return Figures.etendre({
    rendus: {
      arbre,
      statistiques: (T, d, m) => { const r = statistiquesVers(d); return rendu(r.type)(T, r, m); },
      pascal
    },
    dimensions: {
      arbre: desc => { const r = {enfants: desc.niveaux || []}; return [profondeur(r) > 2 ? 400 : 320, Math.max(110, feuillesDe(r) * 30 + 44)]; },
      pascal: desc => [Math.max(320, (desc.options.n + 1) * 30 + 120), (desc.options.n + 1) * 24 + 24],
      statistiques: desc => { const e = (desc.elements || [])[0]; return [320, e && e.t === 'boite' ? ((e.boites || [e]).length === 1 ? 120 : 170) : e && e.t === 'diagramme_venn' ? 210 : 200]; }
    },
    signatures: {
      statistiques: {
      diagramme_barres: ['categories', 'valeurs'], diagramme_batons: ['valeurs', 'probabilites'], histogramme: ['bornes', 'effectifs'],
      boite: ['min', 'q1', 'med', 'q3', 'max'], diagramme_circulaire: ['secteurs'], courbe_indices: ['dates', 'indices'], diagramme_venn: ['nom_a', 'nom_b', 'effectifs']
    }
    },
    constructeurs: sorties => ({
      arbre: (titre, niveaux, options) => sorties({type: 'arbre', titre, niveaux, options: options || {}}),
      pascal: (titre, n, options) => sorties({type: 'pascal', titre, options: Object.assign({n}, options || {})})
    })
  });
});
