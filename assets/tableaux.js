/* Tableaux plus larges que l'écran : tant qu'il reste des colonnes à faire défiler,
   le bord droit du tableau s'estompe (classe is-clipped, voir components.css). */
(() => {
  'use strict';
  const SELECTOR = '.table-scroll, .table-wrap';
  const update = box => box.classList.toggle('is-clipped', box.scrollWidth - box.clientWidth - box.scrollLeft > 2);
  let pending = false;
  const all = () => { pending = false; document.querySelectorAll(SELECTOR).forEach(update); };
  const later = () => { if (!pending) { pending = true; requestAnimationFrame(all); } };
  document.addEventListener('scroll', event => { if (event.target instanceof Element && event.target.matches(SELECTOR)) update(event.target); }, true);
  // Un corrigé qu'on déplie, un exercice qu'on affiche ou une nouvelle variante peuvent révéler un tableau.
  document.addEventListener('toggle', later, true);
  window.addEventListener('resize', later);
  new MutationObserver(later).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']});
  later();
})();
