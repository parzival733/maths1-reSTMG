/* Signe moins accessible avec les claviers décimaux des téléphones. */
(() => {
  'use strict';
  const buttons = new WeakMap();
  let sequence = 0;
  const selector = '.answer-row input[inputmode="decimal"]';

  function enhance(input) {
    if (buttons.has(input)) return;
    let row = input.closest('.answer-row');
    if (!row) return;
    if (!input.id) {
      let id;
      do { id = 'reponse-numerique-' + (++sequence); }
      while (document.getElementById(id));
      input.id = id;
    }
    const caption = Array.from(row.children).find(child => child.tagName === 'SPAN');
    const name = input.getAttribute('aria-label') || (caption && caption.textContent.trim()) || 'la réponse';
    if (row.tagName === 'LABEL') {
      const container = document.createElement('div');
      Array.from(row.attributes).forEach(attribute => {
        if (attribute.name !== 'for') container.setAttribute(attribute.name, attribute.value);
      });
      while (row.firstChild) container.append(row.firstChild);
      row.replaceWith(container);
      row = container;
      if (caption) {
        const label = document.createElement('label');
        label.htmlFor = input.id;
        while (caption.firstChild) label.append(caption.firstChild);
        caption.append(label);
      }
    }
    if (!input.getAttribute('aria-label') && !caption) input.setAttribute('aria-label', name);
    const group = document.createElement('div');
    group.className = 'answer-input';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-sign';
    button.textContent = '−';
    button.setAttribute('aria-label', 'Ajouter ou retirer le signe moins : ' + name);
    button.title = 'Ajouter ou retirer le signe moins';
    buttons.set(input, button);
    input.before(group);
    group.append(input, button);
    const sync = () => { button.disabled = input.disabled || input.readOnly; };
    sync();
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => {
      if (input.disabled || input.readOnly) return;
      const value = input.value;
      const start = input.selectionStart == null ? value.length : input.selectionStart;
      const end = input.selectionEnd == null ? start : input.selectionEnd;
      const space = (value.match(/^\s*/) || [''])[0].length;
      const sign = value.charAt(space);
      let delta = 0;
      if (!value.trim()) {
        input.value = '−';
      } else if (/[-−–—]/.test(sign)) {
        input.value = value.slice(0, space) + value.slice(space + 1);
        delta = -1;
      } else if (sign === '+') {
        input.value = value.slice(0, space) + '−' + value.slice(space + 1);
      } else {
        input.value = value.slice(0, space) + '−' + value.slice(space);
        delta = 1;
      }
      input.focus();
      const move = position => Math.max(0, Math.min(input.value.length, position + (position >= space ? delta : 0)));
      if (!value.trim()) input.setSelectionRange(1, 1);
      else input.setSelectionRange(move(start), move(end));
      input.dispatchEvent(new Event('input', {bubbles: true}));
    });
  }

  function start() {
    const root = document.querySelector('[data-interactive-exercises]');
    if (!root) return;
    const scan = node => {
      if (node.nodeType !== 1) return;
      if (node.matches(selector)) enhance(node);
      node.querySelectorAll(selector).forEach(enhance);
    };
    scan(root);
    new MutationObserver(records => records.forEach(record => {
      if (record.type === 'childList') record.addedNodes.forEach(scan);
      else {
        const button = buttons.get(record.target);
        if (button) button.disabled = record.target.disabled || record.target.readOnly;
      }
    })).observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['readonly', 'disabled']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
