/* Progressive enhancement only: every lesson and answer remains in static HTML. */
'use strict';
const courseOrder = [
  ['fonctions', 'Fonctions et droites'], ['second-degre', 'Polynômes du second degré'],
  ['suites', 'Découvrir les suites'], ['suites-arithmetiques', 'Suites arithmétiques'],
  ['suites-geometriques', 'Suites géométriques'], ['derivees', 'Nombre dérivé et tangente'],
  ['variations', 'Dérivées, variations et optimisation'], ['statistiques-deux-variables', 'Statistiques à deux variables'],
  ['probabilites-conditionnelles', 'Probabilités conditionnelles et indépendance'], ['bernoulli', 'Épreuves de Bernoulli répétées'],
  ['variables-aleatoires', 'Variables aléatoires et simulation'], ['calcul', 'Calcul et proportions'],
  ['evolutions', 'Évolutions en pourcentage'], ['logique', 'Ensembles et raisonnement'],
  ['statistiques-descriptives', 'Lire et résumer des données'], ['python-tableur', 'Python, listes et tableur']
];
const normalizeText = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const slug = text => normalizeText(text).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const toc = document.querySelector('.lesson-toc');
const content = document.querySelector('.lesson-content');
if (toc && content) {
  const nav = toc.querySelector('nav');
  content.querySelectorAll('h2').forEach((heading, i) => {
    if (!heading.id) heading.id = `${i + 1}-${slug(heading.textContent)}`;
    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;
    nav.append(a);
  });
  // Sommaire écrit dans la page (tools/lecons.py) : ouvert sur ordinateur, replié sur
  // téléphone, refermé après le choix d'une partie.
  const details = toc.querySelector('details.ui-toc');
  if (details) {
    const summary = details.querySelector('summary');
    const parts = nav.querySelectorAll('a').length;
    if (summary) summary.textContent = 'Sommaire de la leçon · ' + parts + ' parties';
    const desktop = window.matchMedia('(min-width: 741px)');
    const adapt = () => { details.open = desktop.matches; };
    adapt();
    desktop.addEventListener('change', adapt);
    details.addEventListener('click', event => {
      if (event.target.closest('nav a') && !desktop.matches) details.open = false;
    });
  }
  toc.hidden = false;
  const printButton = toc.querySelector('button');
  if (printButton) printButton.addEventListener('click', () => window.print());
  const index = courseOrder.findIndex(([id]) => id === document.body.dataset.course);
  const pagination = document.querySelector('.course-pagination');
  if (pagination && index >= 0) {
    if (index > 0) {
      const a = document.createElement('a');
      a.href = `${courseOrder[index - 1][0]}.html`;
      a.textContent = `← ${courseOrder[index - 1][1]}`;
      pagination.append(a);
    }
    if (index < courseOrder.length - 1) {
      const a = document.createElement('a');
      a.href = `${courseOrder[index + 1][0]}.html`;
      a.textContent = `${courseOrder[index + 1][1]} →`;
      pagination.append(a);
    }
  }
}
// Un seul bouton ouvre ou referme toutes les corrections de la leçon. Il est écrit
// dans la page (tools/lecons.py) et reste masqué sans JavaScript.
const correctionsButton = document.querySelector('[data-corrections-toggle]');
if (content && correctionsButton) {
  const corrections = Array.from(content.querySelectorAll('details.study-solution, details.check'));
  const status = correctionsButton.parentElement.querySelector('[role="status"]');
  const allOpen = () => corrections.length > 0 && corrections.every(item => item.open);
  const label = () => {
    correctionsButton.textContent = (allOpen() ? 'Masquer' : 'Afficher') + ' toutes les corrections (' + corrections.length + ')';
  };
  correctionsButton.addEventListener('click', () => {
    const open = !allOpen();
    corrections.forEach(item => { item.open = open; });
    label();
    if (status) status.textContent = open ? 'Toutes les corrections sont affichées.' : 'Toutes les corrections sont masquées.';
  });
  corrections.forEach(item => item.addEventListener('toggle', label));
  label();
}
// Include all corrections in the browser's print output, then restore the reader's state.
let printClosedDetails = [];
window.addEventListener('beforeprint', () => {
  printClosedDetails = Array.from(document.querySelectorAll('details:not([open])'));
  printClosedDetails.forEach(item => { item.open = true; });
});
window.addEventListener('afterprint', () => {
  printClosedDetails.forEach(item => { item.open = false; });
  printClosedDetails = [];
});
const tools = document.querySelector('.catalog-tools');
if (tools) {
  tools.hidden = false;
  const search = document.querySelector('#course-search');
  const category = document.querySelector('#course-category');
  const cards = Array.from(document.querySelectorAll('.lesson-card'));
  const filter = () => {
    const terms = normalizeText(search.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach(card => {
      const text = normalizeText(`${card.textContent} ${card.dataset.keywords || ''}`);
      const match = terms.every(term => text.includes(term)) && (!category.value || card.dataset.category === category.value);
      card.hidden = !match;
      if (match) visible++;
    });
    document.querySelectorAll('.catalog-group').forEach(group => {
      group.hidden = !Array.from(group.querySelectorAll('.lesson-card')).some(card => !card.hidden);
    });
    // Décompte par nature : chapitres, repères et atelier, comme dans le catalogue.
    const kinds = {chapitre: ['chapitre', 'chapitres'], reperes: ['repère', 'repères'], atelier: ['atelier', 'ateliers']};
    const tally = list => {
      const counts = new Map();
      list.forEach(card => { const kind = kinds[card.dataset.category] || kinds.chapitre; counts.set(kind, (counts.get(kind) || 0) + 1); });
      return [...counts].map(([[one, many], n]) => n + ' ' + (n > 1 ? many : one)).join(' · ');
    };
    const shown = cards.filter(card => !card.hidden);
    document.querySelector('#result-count').textContent = visible === cards.length ? tally(cards)
      : `${visible} leçon${visible > 1 ? 's' : ''} affichée${visible > 1 ? 's' : ''} sur ${cards.length}${visible ? ' : ' + tally(shown) : ''}`;
    document.querySelector('#no-results').hidden = visible !== 0;
  };
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  filter();
}
// Client-side Bernoulli simulation; no data is sent or stored.
const simulation = document.querySelector('#simulation-form');
if (simulation) {
  simulation.addEventListener('submit', event => {
    event.preventDefault();
    const p = Number(simulation.elements.p.value);
    const n = Number(simulation.elements.n.value);
    const N = Number(simulation.elements.N.value);
    const output = document.querySelector('#simulation-output');
    if (!Number.isFinite(p) || p < 0 || p > 1 || !Number.isInteger(n) || n < 1 || n > 2000 || !Number.isInteger(N) || N < 2 || N > 1000) {
      output.textContent = 'Choisir p entre 0 et 1, n entier de 1 à 2 000, et N entier de 2 à 1 000.';
      return;
    }
    const frequencies = Array.from({length: N}, () => {
      let successes = 0;
      for (let i = 0; i < n; i++) if (Math.random() < p) successes++;
      return successes / n;
    });
    const mean = frequencies.reduce((a, b) => a + b, 0) / N;
    const s = Math.sqrt(frequencies.reduce((sum, f) => sum + (f - mean) ** 2, 0) / N);
    const format = x => x.toLocaleString('fr-FR', {maximumFractionDigits: 4});
    output.replaceChildren();
    const intro = document.createElement('p');
    intro.textContent = `Simulation terminée : ${N} échantillons de ${n} essais. Fréquence moyenne : ${format(mean)} ; écart-type observé s : ${format(s)}. Les résultats fluctuent à chaque lancement.`;
    output.append(intro);
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = 'Fréquences à une distance au plus égale à k × s de p';
    table.append(caption);
    const thead = document.createElement('thead');
    const headrow = document.createElement('tr');
    ['k', 'Effectif', 'Pourcentage'].forEach(text => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = text; headrow.append(th); });
    thead.append(headrow); table.append(thead);
    const tbody = document.createElement('tbody');
    [1, 2, 3].forEach(k => {
      const count = frequencies.filter(f => Math.abs(f - p) <= k * s + 1e-12).length;
      const tr = document.createElement('tr');
      [k, count, `${format(100 * count / N)} %`].forEach(text => { const td = document.createElement('td'); td.textContent = text; tr.append(td); });
      tbody.append(tr);
    });
    table.append(tbody); output.append(table);
    const bins = Array(10).fill(0);
    frequencies.forEach(f => { bins[Math.min(9, Math.floor(f * 10))]++; });
    const bars = document.createElement('div'); bars.className = 'sim-bars'; bars.setAttribute('aria-hidden', 'true');
    const max = Math.max(...bins, 1);
    bins.forEach(count => { const bar = document.createElement('span'); bar.style.height = `${100 * count / max}%`; bars.append(bar); });
    output.append(bars);
    const label = document.createElement('p'); label.textContent = 'Histogramme : dix classes de largeur 0,1 entre 0 et 1. La dernière inclut 1. La hauteur est proportionnelle à l’effectif.'; output.append(label);
    const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Données accessibles de l’histogramme'; details.append(summary);
    const list = document.createElement('ul'); bins.forEach((count, i) => { const li = document.createElement('li'); li.textContent = `[${format(i / 10)} ; ${format((i + 1) / 10)}${i === 9 ? ']' : '['} : ${count} échantillon(s)`; list.append(li); }); details.append(list); output.append(details);
  });
}
