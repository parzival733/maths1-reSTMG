/* Corrigés structurés (Méthode → Calculs → Conclusion) des exercices d'origine de
   Première, écrits dans le JSON des pages. Le corrigé vient du modèle déclaratif
   appliqué aux paramètres d'origine ; quelques exercices dont l'énoncé d'origine
   emploie d'autres lettres ou d'autres unités reçoivent un corrigé adapté.
   Usage : node tools/original_corrections.js > corrections.json
   (lu par tools/apply_original_corrections.py). */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const f of ['exercices-variants.js', 'variants-fonctions.js', 'variants-suites.js', 'variants-analyse.js',
  'variants-probabilites.js', 'variants-reperes.js', 'variants-donnees.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', f), 'utf8'), sandbox, {filename: f});
}
const V = sandbox.window.ExerciseVariants;
const {C} = V;
const last = (list, text) => [...list.slice(0, -1), C('x', 'x', text).pop()];
const swap = (list, pairs) => list.map(line => pairs.reduce((s, [a, b]) => s.split(a).join(b), line));

// Corrigés adaptés : l'énoncé d'origine nomme autrement les coefficients ou ne
// précise pas l'unité de x ; le corrigé du modèle sert de base quand il convient.
const OVERRIDES = {
  'second-degre/5': b => last(b, 'le bénéfice maximal est de 16 centaines d’euros, soit 1 600 €, atteint pour x = 5 ; le bénéfice est nul pour x = 1 et pour x = 9.'),
  'suites-geometriques/7': b => swap(b, [['l’objet vaut', 'l’appareil vaut']]),
  'derivees/3': () => C('la tangente au point d’abscisse 1 a pour coefficient directeur f′(1) et passe par le point (1 ; f(1)) : on trouve b en remplaçant x et y par les coordonnées de ce point dans y = ax + b.',
    ['f(1) = 1² = 1 et a = f′(1) = 2.', 'La tangente passe par (1 ; 1) : 1 = 2 × 1 + b, donc b = 1 − 2 = −1.'],
    'f(1) = 1 ; la tangente a pour équation y = 2x − 1, donc a = 2 et b = −1.'),
  'derivees/5': b => last(b, 'produire 20 unités coûte 500 € ; à ce niveau, une unité supplémentaire coûte environ 30 €, donc C(20,1) ≈ 503 €.'),
  'derivees/6': b => swap(b, [['+ p = ', '+ b = '], [' + p, donc p = ', ' + b, donc b = ']]),
  'variations/3': b => last(b, 'B est maximal pour x = 6 : le bénéfice maximal est de 16 centaines d’euros, soit 1 600 €.'),
  'variations/6': b => last(b, 'produire 5 unités coûte 200 € ; C′(5) = 30 € par unité, donc 0,1 unité de plus coûte environ 3 € supplémentaires.'),
  'variations/7': b => last(b, 'R est maximale pour x = 5, où elle vaut 80 ; aux bornes, R(0) = R(10) = 30.'),
  'probabilites-conditionnelles/6': () => C('pour une probabilité sachant un groupe, on divise par l’effectif de ce groupe ; pour la probabilité globale, on divise le nombre total d’achats par l’effectif total.',
    ['P(achat | femme) = 28/70 = 0,4 ; P(achat | homme) = 10/50 = 0,2.', 'P(achat) = (28 + 10)/120 = 38/120 ≈ 0,317.'],
    'la probabilité globale, P(achat) ≈ 0,317, est comprise entre les deux probabilités conditionnelles : c’est une moyenne pondérée par la taille des deux groupes.',
    V.signTable('Tableau des effectifs', ['Achat', 'Pas d’achat', 'Total'], [
      {label: 'Femmes', cells: [28, 42, 70]}, {label: 'Hommes', cells: [10, 40, 50]}, {label: 'Total', cells: [38, 82, 120]}], 'Effectifs')),
  'evolutions/6': () => C('l’évolution en % entre deux dates se calcule avec (indice d’arrivée/indice de départ − 1) × 100 ; la différence de deux indices s’exprime en points d’indice, ce n’est pas un pourcentage.',
    ['De 100 à 115 : (115/100 − 1) × 100 = 15, soit +15 %.', 'De 115 à 92 : (92/115 − 1) × 100 = (0,8 − 1) × 100 = −20, soit −20 % ; l’écart entre les deux indices vaut 115 − 92 = 23 points.'],
    'l’indice augmente de 15 % de 2019 à 2020 ; de 2020 à 2021, il perd 23 points d’indice, ce qui correspond à une baisse de 20 %.'),
  'logique/2': b => swap(b, [['(b ; 2)', '(a ; 2)'], ['car b ∈ A', 'car a ∈ A']]),
  // La page Fonctions demande une lecture graphique, sans formule pour g.
  'fonctions/2': b => C('une image se lit sur l’axe vertical à partir d’une abscisse ; les antécédents de 0 sont les abscisses des points où la courbe coupe l’axe horizontal ; le signe de g se lit selon que la courbe est au-dessus ou au-dessous de cet axe.',
    ['Le point de la courbe d’abscisse 0 a pour ordonnée 3 : g(0) = 3. Le sommet a pour coordonnées (2 ; −1) : g(2) = −1.',
     'La courbe coupe l’axe horizontal en x = 1 et en x = 3 : ce sont les antécédents de 0. Elle est sous l’axe entre 1 et 3, au-dessus à l’extérieur.'],
    'le minimum de g vaut −1, atteint en x = 2. L’inégalité stricte exclut les zéros : l’ensemble des solutions de g(x) < 0 est ]1 ; 3[.',
    V.signTable('Signe de g(x) sur [0 ; 4], lu sur la courbe', ['[0 ; 1[', '1', ']1 ; 3[', '3', ']3 ; 4]'], [{label: 'g(x)', cells: ['+', '0', '−', '0', '+']}]))
};

// Valeurs données dans l'énoncé pour garder l'exercice faisable sans calculatrice.
const GIVEN = {
  'suites/7': ' On donne 1,2¹⁰ ≈ 6,19174.',
  'suites-geometriques/6': ' On donne 1,1¹⁰ ≈ 2,59374.',
  'statistiques-descriptives/4': ' On donne √2 ≈ 1,414.'
};

const out = {};
for (const slug of V.slugs()) {
  const file = path.join(root, 'exercices', slug + '.html');
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<script type="application\/json" id="exercise-data">([\s\S]*?)<\/script>/);
  if (!match) continue;
  out[slug] = JSON.parse(match[1]).exercises.map((o, i) => {
    const key = slug + '/' + i, base = V.original(slug, i, o).correction;
    const correction = OVERRIDES[key] ? OVERRIDES[key](base, o) : base;
    return {correction, given: GIVEN[key] || ''};
  });
}
// La page Fonctions est écrite en HTML : ses neuf exercices d'origine ont les
// paramètres de base des modèles.
out.fonctions = Array.from({length: V.count('fonctions')}, (_, i) => {
  const base = V.original('fonctions', i).correction, key = 'fonctions/' + i;
  return {correction: OVERRIDES[key] ? OVERRIDES[key](base) : base, given: ''};
});
process.stdout.write(JSON.stringify(out));
