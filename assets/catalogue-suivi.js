/* Catalogues des leçons et des exercices : si le suivi local est activé, chaque carte
   affiche où en est l'élève sur ce chapitre. Rien n'est affiché sinon. */
(() => {
  'use strict';
  const A = window.MathsAcquis;
  if (!A || !A.store || !A.store.enabled) return;
  const bySlug = {};
  for (const skill of A.store.all('tout')) {   // « tout » : les notions des trois niveaux
    const slug = skill.exercises.split('/').pop().replace('.html', '');
    // « Fractions » et « Calcul » partagent la même série : on garde la notion la plus travaillée.
    if (!bySlug[slug] || skill.attempts > bySlug[slug].attempts) bySlug[slug] = skill;
  }
  document.querySelectorAll('a.lesson-card').forEach(card => {
    const match = (card.getAttribute('href') || '').match(/([\w-]+)\.html$/);
    const skill = match && bySlug[match[1]];
    if (!skill || !skill.attempts || card.querySelector('.card-progress')) return;
    const badge = document.createElement('span');
    badge.className = 'card-progress';
    badge.id = 'suivi-' + match[1];
    card.setAttribute('aria-describedby', badge.id);
    badge.dataset.stage = skill.overdue ? 'due' : String(skill.stage);
    badge.textContent = skill.overdue ? skill.label + ' · à revoir' : skill.label;
    const read = card.querySelector('.read-link');
    card.insertBefore(badge, read);
  });
})();
