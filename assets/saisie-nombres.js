/* Un menu par exercice ; insertion dans le dernier champ utilisé, au curseur. */
(() => {
  'use strict';
  const controls = new WeakMap();
  const positions = new WeakMap();
  const selector = '.answer-row input[data-expect]';
  let opened = null, sequence = 0;

  function remember(input) {
    if (input && document.activeElement === input && input.selectionStart != null) {
      positions.set(input, {value: input.value, start: input.selectionStart,
        end: input.selectionEnd, direction: input.selectionDirection || 'none'});
    }
  }

  function savedPosition(input) {
    const saved = positions.get(input);
    if (saved && saved.value === input.value) return {...saved};
    return {start: input.value.length, end: input.value.length, direction: 'none'};
  }

  function enhance(form) {
    if (controls.has(form)) return;
    const fields = Array.from(form.querySelectorAll(selector));
    if (!fields.length) return;
    const heading = form.querySelector(':scope > h3');
    if (!heading) return;
    const bar = document.createElement('div');
    bar.className = 'answer-tools';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'answer-symbols-toggle';
    toggle.textContent = 'Signes';
    toggle.setAttribute('aria-label', 'Signes pour la réponse active');
    toggle.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.className = 'answer-symbols-panel';
    let id;
    do { id = 'signes-exercice-' + (++sequence); } while (document.getElementById(id));
    panel.id = id;
    panel.hidden = true;
    panel.setAttribute('role', 'group');
    toggle.setAttribute('aria-controls', id);
    const target = document.createElement('p');
    target.className = 'answer-symbols-target';
    panel.append(target);
    const items = [];
    const close = returnFocus => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (opened === state) opened = null;
      if (returnFocus && !toggle.disabled) toggle.focus();
    };
    const state = {form, bar, toggle, panel, close, active: fields[0], sync: () => {
      const input = state.active;
      const disabled = !input || input.disabled || input.readOnly || !input.isConnected;
      toggle.disabled = disabled;
      items.forEach(button => { button.disabled = disabled; });
      const name = input && (input.getAttribute('aria-label')
        || input.closest('.answer-row')?.querySelector('span')?.textContent.trim());
      target.textContent = name ? 'Pour : ' + name : 'Choisis un champ de réponse.';
      panel.setAttribute('aria-label', name ? 'Signes pour ' + name : 'Signes');
      const unitButton = items.find(button => button.dataset.symbol === 'unit');
      unitButton.hidden = !input?.dataset.unit;
      unitButton.firstElementChild.textContent = input?.dataset.unit || '';
      const separator = items.find(button => button.dataset.symbol === 'separator');
      separator.hidden = input?.dataset.type !== 'unordered-list';
      if (disabled) close(false);
    }};
    const symbols = [
      ['minus', '−', 'Signe moins'], ['plus', '+', 'Signe plus'],
      ['decimal', ',', 'Virgule'], ['fraction', '/', 'Fraction'],
      ['separator', ';', 'Séparer les valeurs'], ['unit', '', 'Unité demandée']
    ];
    symbols.forEach(([key, symbol, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.symbol = key;
      const glyph = document.createElement('span');
      glyph.className = 'answer-symbol-glyph';
      glyph.textContent = symbol;
      glyph.setAttribute('aria-hidden', 'true');
      button.append(glyph, document.createTextNode(label));
      button.setAttribute('aria-label', label);
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => {
        const input = state.active;
        if (!input || input.disabled || input.readOnly) return;
        // Copier la position AVANT focus(), qui peut déplacer le curseur sur iOS.
        const selection = savedPosition(input);
        close(false);
        input.focus();
        input.setSelectionRange(selection.start, selection.end, selection.direction);
        let text = key === 'unit' ? input.dataset.unit : symbol;
        if (!text) return;
        if (key === 'unit' && selection.start > 0 && !/\s/.test(input.value[selection.start - 1])) text = '\u00a0' + text;
        const before = input.value;
        input.setRangeText(text, selection.start, selection.end, 'end');
        if (input.value !== before) input.dispatchEvent(new Event('input', {bubbles: true}));
        remember(input);
      });
      items.push(button);
      panel.append(button);
    });
    controls.set(form, state);
    heading.before(bar);
    bar.append(heading, toggle, panel);
    state.sync();

    form.addEventListener('focusin', event => {
      if (event.target.matches(selector)) {
        state.active = event.target;
        close(false);
        state.sync();
      } else if (event.target.matches('.answer-row select')) {
        state.active = null;
        close(false);
        state.sync();
      }
    });
    ['input', 'select', 'keyup', 'pointerup', 'touchend'].forEach(type => {
      form.addEventListener(type, event => { if (event.target.matches(selector)) remember(event.target); });
    });
    const capture = () => remember(state.active);
    // Capture avant le flou, sans annuler pointerdown (sinon WebKit perd le clic).
    ['pointerdown', 'touchstart', 'mousedown'].forEach(type => toggle.addEventListener(type, capture));
    toggle.addEventListener('mousedown', event => event.preventDefault());
    toggle.addEventListener('click', () => {
      if (toggle.disabled) return;
      if (!panel.hidden) { close(true); return; }
      capture();
      if (opened) opened.close(false);
      opened = state;
      state.sync();
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      panel.scrollIntoView({block: 'nearest'});
      items.find(button => !button.hidden && !button.disabled)?.focus({preventScroll: true});
    });
    panel.addEventListener('keydown', event => {
      const available = items.filter(button => !button.hidden && !button.disabled);
      const index = available.indexOf(document.activeElement);
      let next = null;
      if (event.key === 'ArrowDown') next = (index + 1) % available.length;
      if (event.key === 'ArrowUp') next = (index - 1 + available.length) % available.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = available.length - 1;
      if (next != null) { event.preventDefault(); available[next]?.focus(); }
    });
  }

  function start() {
    const root = document.querySelector('[data-interactive-exercises]');
    if (!root) return;
    const scan = node => {
      if (node.nodeType !== 1) return;
      if (node.matches('.exercise-form')) enhance(node);
      node.querySelectorAll('.exercise-form').forEach(enhance);
    };
    scan(root);
    new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'childList') record.addedNodes.forEach(scan);
        else if (record.target.matches(selector)) controls.get(record.target.closest('.exercise-form'))?.sync();
      });
      if (opened && !opened.form.isConnected) opened.close(false);
    }).observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['readonly', 'disabled']});
  }
  document.addEventListener('selectionchange', () => {
    const input = document.activeElement;
    if (input?.matches(selector)) remember(input);
  });
  document.addEventListener('click', event => {
    if (opened && !opened.panel.contains(event.target) && !opened.toggle.contains(event.target)) opened.close(false);
  });
  document.addEventListener('focusin', event => {
    if (opened && !opened.form.contains(event.target)) opened.close(false);
  });
  document.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') { event.preventDefault(); opened.close(true); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
