/* Question d’accueil : vérification locale d’une seule réponse, sans stockage.
   Sans JavaScript, la question et la réponse dépliable restent lisibles. */
(() => {
  'use strict';
  const form = document.getElementById('home-try');
  if (!form) return;
  const input = document.getElementById('home-try-answer');
  const feedback = document.getElementById('home-try-feedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.trim().replace(/\s+/g, '').replace(',', '.');
    if (!raw) { feedback.textContent = 'Écris un nombre, puis vérifie.'; feedback.dataset.result = 'retry'; return; }
    const value = Number(raw);
    if (value === 3) {
      feedback.textContent = 'Bravo : f(2) = 2 + 1 = 3. Le point de la droite d’abscisse 2 a pour ordonnée 3.';
      feedback.dataset.result = 'correct';
    } else {
      feedback.textContent = 'Pas encore : remplace x par 2 dans x + 1, puis recommence.';
      feedback.dataset.result = 'retry';
    }
  });
})();
