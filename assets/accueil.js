/* Question d’accueil : vérification locale d’une seule réponse, sans stockage.
   Sans JavaScript, la question et la réponse dépliable restent lisibles. */
(() => {
  'use strict';
  const form = document.getElementById('home-try');
  if (!form) return;
  const input = document.getElementById('home-try-answer');
  const feedback = document.getElementById('home-try-feedback');
  const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const readNumber = raw => {
    const parts = raw.replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').split('/');
    if (parts.length < 1 || parts.length > 2 || !parts.every(part => decimal.test(part))) return NaN;
    if (parts.length === 2 && Number(parts[1]) === 0) return NaN;
    const value = Number(parts[0]) / (parts.length === 2 ? Number(parts[1]) : 1);
    return Number.isFinite(value) ? value : NaN;
  };
  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.trim();
    const value = readNumber(raw);
    input.setAttribute('aria-invalid', String(value !== 3));
    if (!Number.isFinite(value)) { feedback.textContent = 'Écris un nombre ou une fraction valide. Le dénominateur ne peut pas être nul.'; feedback.dataset.result = 'retry'; return; }
    if (value === 3) {
      feedback.textContent = 'Bravo : f(2) = 2 + 1 = 3. Le point de la droite d’abscisse 2 a pour ordonnée 3.';
      feedback.dataset.result = 'correct';
    } else {
      feedback.textContent = 'Pas encore : remplace x par 2 dans x + 1, puis recommence.';
      feedback.dataset.result = 'retry';
    }
  });
})();
