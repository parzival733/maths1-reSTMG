/* Filtrage progressif: tous les liens PDF existent deja en HTML, sans reseau ni stockage. */
(() => {
  'use strict';
  const root = document.querySelector('[data-subjects]');
  if (!root) return;
  const form = document.getElementById('subjects-filters');
  const query = document.getElementById('subjects-search');
  const year = document.getElementById('subjects-year');
  const radios = [...form.querySelectorAll('input[name="level"]')];
  const groups = [...root.querySelectorAll('.subjects-group')];
  const cards = [...root.querySelectorAll('.subject-card')];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const text = new Map(cards.map(card => [card, normalize(card.textContent)]));
  const level = () => radios.find(radio => radio.checked).value;
  const eligible = card => level() === 'all' || card.dataset.level === level();
  function years(preferred = 'all') {
    const values = [...new Set(cards.filter(eligible).map(card => card.dataset.year))].sort().reverse();
    year.replaceChildren(new Option('Toutes', 'all'), ...values.map(value => new Option(value, value)));
    year.value = values.includes(preferred) ? preferred : 'all';
  }
  function update(writeURL = true) {
    const words = normalize(query.value).split(' ').filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const visible = eligible(card) && (year.value === 'all' || year.value === card.dataset.year) && words.every(word => text.get(card).includes(word));
      card.hidden = !visible;
      if (visible) count++;
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.subject-card')].some(card => !card.hidden); });
    document.getElementById('subjects-count').textContent = `${count} sujet${count === 1 ? '' : 's'} affich\u00e9${count === 1 ? '' : 's'} sur 41`;
    document.getElementById('subjects-empty').hidden = count !== 0;
    const notes = {
      premiere: 'Premi\u00e8re : 8 sujets de 2026 et 2 sujets z\u00e9ro. Ces archives ne sont pas des sujets 2027 : respecte les consignes du PDF et les attendus de ton ann\u00e9e.',
      terminale: 'Terminale : anciens sujets STMG de 2017 \u00e0 2020. Ils ne pr\u00e9parent pas \u00e0 eux seuls l\u2019\u00e9preuve de Premi\u00e8re et peuvent pr\u00e9voir une calculatrice.',
      all: 'Les deux niveaux sont s\u00e9par\u00e9s ci-dessous. Les anciens sujets de Terminale ne sont pas des sujets de l\u2019\u00e9preuve anticip\u00e9e de Premi\u00e8re.'
    };
    document.getElementById('subjects-context').textContent = notes[level()];
    if (writeURL) {
      const url = new URL(location.href);
      url.searchParams.set('niveau', level());
      if (year.value === 'all') url.searchParams.delete('annee'); else url.searchParams.set('annee', year.value);
      if (query.value.trim()) url.searchParams.set('q', query.value.trim()); else url.searchParams.delete('q');
      try { history.replaceState(null, '', url); } catch (_) { /* Le catalogue fonctionne aussi en fichier local. */ }
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    const value = ['premiere', 'terminale', 'all'].includes(params.get('niveau')) ? params.get('niveau') : 'premiere';
    radios.forEach(radio => { radio.checked = radio.value === value; });
    query.value = (params.get('q') || '').slice(0,100);
    years(params.get('annee') || 'all');
    update(false);
  }
  function reset() {
    radios.forEach(radio => { radio.checked = radio.value === 'premiere'; });
    query.value = ''; years(); update(); query.focus();
  }
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  radios.forEach(radio => radio.addEventListener('change', () => { years(); update(); }));
  query.addEventListener('input', () => update());
  year.addEventListener('change', () => update());
  document.querySelectorAll('[data-reset-subjects]').forEach(button => button.addEventListener('click', reset));
  window.addEventListener('popstate', restore);
  restore();
  form.hidden = false;
  document.getElementById('subjects-static-nav').hidden = true;
})();
