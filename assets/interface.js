/* Only navigation presentation: no teaching text or exercise data is modified. */
(() => {
  'use strict';
  const toc = document.querySelector('.lesson-toc');
  if (!toc || toc.hidden) return;
  const details = document.createElement('details');
  details.className = 'ui-toc';
  const summary = document.createElement('summary');
  summary.textContent = 'Dans cette leçon';
  details.append(summary);
  while (toc.firstChild) details.append(toc.firstChild);
  toc.append(details);
  const desktop = window.matchMedia('(min-width: 741px)');
  const adapt = () => { details.open = desktop.matches; };
  adapt();
  desktop.addEventListener('change', adapt);
})();
