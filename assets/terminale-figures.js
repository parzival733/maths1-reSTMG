/* Terminale STMG : figures des séries de statistiques et de probabilités, calculées avec les
   paramètres de chaque variante. À charger après assets/terminale-exercices.js et le moteur de
   figures (assets/figures.js et assets/figures-statistiques.js). */
(() => {
  'use strict';
  const V = window.ExerciseVariants, T = window.TerminaleExercises, FG = window.Figures;
  if (!V || !T || !FG) return;
  const {F, fmt: {num: fr}, frame: fenetre} = V, {mass, PATTERNS, LAWS} = T;
  const points = (xs, ys) => xs.map((x, i) => [x, ys[i]]);
  const liste = pts => pts.map(p => `(${fr(p[0])} ; ${fr(p[1])})`).join(', ');
  const d4 = x => fr(F(x, 4));
  /* Arbre à deux niveaux : groupes [{nom, p, q}] puis l'événement et son contraire ; `complet` écrit les compléments et le poids de chaque chemin vers l'événement. */
  const arbreDe = (titre, groupes, evt, complet) => FG.arbre(titre, groupes.map(g => ({nom: g.nom, p: g.p == null ? '?' : d4(g.p), enfants: [
    {nom: evt, p: d4(g.q), feuille: complet ? '→ ' + d4(g.p * g.q) : undefined},
    {nom: evt + '̄', p: complet ? d4(1 - g.q) : '?'}]})),
    Object.assign({largeur: 340, hauteur: groupes.length > 2 ? 300 : 220}, complet ? {chemins: groupes.map(g => [g.nom, evt])} : {})).description();
  V.illustrate('t-statistiques', [
    ({a, b, s, pat}) => { const x = [1, 2, 3, 4].map(i => s + i), y = x.map((t, i) => a * t + b + PATTERNS[pat][i]), pts = points(x, y), cadre = fenetre(x.concat(s + 5), y);
      return {e: FG.repere(`Nuage des quatre observations ${liste(pts)}`, cadre).nuage(pts).description(),
        c: FG.repere(`Le point moyen G est au centre du nuage`, cadre).nuage(pts).point_moyen(s + 2.5, a * (s + 2.5) + b, 'G').description()}; },
    ({a, b, x1, dx}) => { const x2 = x1 + dx, y1 = a * x1 + b, y2 = a * x2 + b, cadre = fenetre([x2 + 1], [y1, y2, b]);
      const base = titre => FG.repere(titre, cadre);
      return {e: base(`Points moyens G₁(${x1} ; ${fr(y1)}) et G₂(${x2} ; ${fr(y2)})`).point_moyen(x1, y1, 'G₁').point_moyen(x2, y2, 'G₂').description(),
        c: base(`Droite (G₁G₂) : elle coupe l’axe des ordonnées en b`).droite_affine(a, b).point_moyen(x1, y1, 'G₁').point_moyen(x2, y2, 'G₂').description()}; },
    ({a, b, x}) => ({c: FG.repere(`Droite du modèle : en trait épais sur l’axe, la plage observée de 1 à 10 ; l’estimation est lue en x = ${x}`,
      fenetre([16], [a * 16 + b], {xmin: -1, nom_x: 'x', nom_y: 'y'})).droite_affine(a, b).intervalle_solutions(1, 10).lecture(x, a * x + b).description()}),
    null, null,
    ({a, b, e}) => { const y = [a + b + e, 2 * a + b - 2 * e, 3 * a + b + e], pts = points([1, 2, 3], y), cadre = fenetre([4], y.concat([b, b + e, 4 * a + b, 4 * a + b + e]));
      return {e: FG.repere(`Nuage des trois données ${liste(pts)}`, cadre).nuage(pts).description(),
        c: FG.repere(`Modèle A en trait plein, modèle B en pointillés : les écarts sont les distances verticales des points à chaque droite`, cadre)
          .droite_affine(a, b, {nom: 'A'}).droite_affine(a, b + e, {nom: 'B', pointilles: true}).nuage(pts).description()}; }
  ]);
  V.illustrate('t-conditionnelles', [null,
    ({a, p, q}) => ({e: arbreDe(`Arbre pondéré avec les données : P(A) = ${fr(a)}, puis D sachant A et D sachant Ā`, [{nom: 'A', p: a, q: p}, {nom: 'Ā', p: null, q}], 'D'),
      c: arbreDe(`On multiplie le long de chaque chemin qui mène à D, puis on additionne`, [{nom: 'A', p: a, q: p}, {nom: 'Ā', p: 1 - a, q}], 'D', true)}),
    ({a, b, pa, pb, pc}) => ({e: arbreDe(`Arbre pondéré avec les données : trois groupes A, B et C, puis l’événement D dans chaque groupe`, [{nom: 'A', p: a, q: pa}, {nom: 'B', p: b, q: pb}, {nom: 'C', p: null, q: pc}], 'D'),
      c: arbreDe(`Trois chemins mènent à D : on additionne leurs probabilités`, [{nom: 'A', p: a, q: pa}, {nom: 'B', p: b, q: pb}, {nom: 'C', p: 1 - a - b, q: pc}], 'D', true)}),
    ({a, p, q}) => ({c: arbreDe(`Les deux chemins qui mènent à B ; celui qui passe par A sert à calculer la probabilité de A sachant B`, [{nom: 'A', p: a, q: p}, {nom: 'Ā', p: 1 - a, q}], 'B', true)}),
    null,
    ({d, se, fp}) => ({c: arbreDe(`Arbre du contrôle : D pour « défectueux », S pour « signalé »`, [{nom: 'D', p: d, q: se}, {nom: 'D̄', p: 1 - d, q: fp}], 'S', true)})
  ]);
  V.illustrate('t-binomiale', [null,
    ({n, k}) => ({c: FG.pascal(`Triangle de Pascal jusqu’à la ligne n = ${n} : le coefficient entouré est C(${n}, ${k})`, n, {coefficient: [n, k], largeur: n > 7 ? 400 : 340, hauteur: 60 + 24 * n}).description()}),
    null, null, null, null
  ]);
  V.illustrate('t-variables', [
    ({a, c, pi}) => ({e: FG.statistiques(`Loi de X : un bâton par valeur, de hauteur égale à sa probabilité`).diagramme_batons([-a, 0, c * a], LAWS[pi], {nom_x: 'valeur de X', nom_y: 'probabilité'}).description()}),
    null, null, null, null,
    ({c0, c1, c2, c3, p}) => { const N = c0 + c1 + c2 + c3;
      return {c: FG.statistiques(`Loi binomiale B(3 ; ${fr(p)}) et fréquences observées sur ${N} simulations`)
        .diagramme_batons([0, 1, 2, 3], [0, 1, 2, 3].map(j => mass(3, p, j)), {observe: [c0, c1, c2, c3].map(v => v / N), nom_x: 'valeur de X', nom_y: 'probabilité ou fréquence'}).description()}; }
  ]);
})();
