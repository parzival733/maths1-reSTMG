/* Menu de navigation sur téléphone : un bouton « Menu » ouvre les cinq destinations.
   Échap ou un clic à l'extérieur ferment le panneau ; le focus reste dans le menu tant
   qu'il est ouvert. Chargé sans defer dans <head> : la classe js-menu est posée avant le
   premier affichage ; sans JavaScript, la navigation complète reste affichée. */
document.documentElement.classList.add('js-menu');
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const header = document.querySelector('.site-header');
  const button = header && header.querySelector('.menu-toggle');
  const nav = header && header.querySelector('.main-nav');
  if (!button || !nav) return;
  const links = () => Array.from(nav.querySelectorAll('a'));
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';

  function close(returnFocus) {
    if (!isOpen()) return;
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Menu';
    header.classList.remove('menu-open');
    if (returnFocus) button.focus();
  }
  function open() {
    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Fermer';
    header.classList.add('menu-open');
    const current = nav.querySelector('[aria-current]') || links()[0];
    if (current) current.focus();
  }

  button.addEventListener('click', () => (isOpen() ? close(true) : open()));
  document.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    if (event.key !== 'Tab') return;
    const items = [...links(), button];   // ordre du document : liens puis bouton
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', event => {
    if (isOpen() && !header.contains(event.target)) close(false);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(false); });
  // Sur un écran large, la barre complète est visible : le panneau n'a plus lieu d'être.
  window.matchMedia('(min-width: 900px)').addEventListener('change', event => { if (event.matches) close(false); });
});
