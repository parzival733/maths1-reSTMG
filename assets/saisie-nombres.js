/* Menu de signes utilisables dans les réponses numériques, y compris sur téléphone. */
(() => {
  'use strict';
  const controls = new WeakMap();
  let opened = null;
  let sequence = 0;
  const selector = '.answer-row input[inputmode="decimal"]';

  function numericRange(input) {
    const value = input.value.trimEnd(), unit = input.dataset.unit;
    let limit = input.value.length;
    if (unit && value.endsWith(unit)) limit = value.slice(0, -unit.length).trimEnd().length;
    return {
      start: Math.min(input.selectionStart == null ? limit : input.selectionStart, limit),
      end: Math.min(input.selectionEnd == null ? limit : input.selectionEnd, limit), limit
    };
  }

  function insertDecimal(input) {
    if (input.disabled || input.readOnly) return;
    const value = input.value;
    const {start, end, limit} = numericRange(input);
    // Dans une fraction, chaque opérande peut avoir son propre séparateur.
    const from = value.slice(0, start).lastIndexOf('/') + 1;
    const slash = value.indexOf('/', end);
    const to = slash < 0 ? limit : Math.min(slash, limit);
    const left = value.slice(from, start), right = value.slice(end, to);
    const before = left.search(/[.,]/), after = right.search(/[.,]/);
    input.focus();
    // Ne pas ajouter un deuxième séparateur au même nombre.
    if (before >= 0 || after >= 0) {
      const position = before >= 0 ? from + before + 1 : end + after + 1;
      input.setSelectionRange(position, position);
      return;
    }
    const insertion = /^\s*[+−–—-]?\s*$/.test(left) ? '0,' : ',';
    input.setRangeText(insertion, start, end, 'end');
    if (input.value !== value) input.dispatchEvent(new Event('input', {bubbles: true}));
  }

  function changeSign(input, symbol) {
    const value = input.value;
    const {start, end, limit} = numericRange(input);
    const number = value.slice(0, limit), suffix = value.slice(limit);
    const space = (number.match(/^\s*/) || [''])[0].length;
    const sign = number.charAt(space);
    const same = symbol === '+' ? sign === '+' : /[-−–—]/.test(sign);
    let delta = 0;
    if (!number.trim()) input.value = symbol + suffix;
    else if (same) { input.value = number.slice(0, space) + number.slice(space + 1) + suffix; delta = -1; }
    else if (/[+−–—-]/.test(sign)) input.value = number.slice(0, space) + symbol + number.slice(space + 1) + suffix;
    else { input.value = number.slice(0, space) + symbol + number.slice(space) + suffix; delta = 1; }
    const move = position => Math.max(0, Math.min(input.value.length, position + (position >= space ? delta : 0)));
    if (!number.trim()) input.setSelectionRange(1, 1);
    else input.setSelectionRange(move(start), move(end));
  }

  function insertFraction(input) {
    const {start, end, limit} = numericRange(input);
    const before = input.value.slice(0, start).indexOf('/');
    const after = input.value.slice(end, limit).indexOf('/');
    if (before >= 0 || after >= 0) {
      const position = before >= 0 ? before + 1 : end + after + 1;
      input.setSelectionRange(position, position);
    } else input.setRangeText('/', start, end, 'end');
  }

  function insertUnit(input) {
    const unit = input.dataset.unit;
    if (!unit) return;
    const engine = window.ExerciseVariants;
    if (Number.isFinite(engine?.readQuantity?.(input.value, unit))
        && !Number.isFinite(engine?.readNumber?.(input.value))) return;
    if (input.value.trimEnd().endsWith(unit)) return;
    input.value = input.value.trimEnd() + '\u00a0' + unit;
    const position = numericRange(input).limit;
    input.setSelectionRange(position, position);
  }

  function enhance(input) {
    if (controls.has(input)) return;
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
    if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', name);
    const group = document.createElement('div');
    group.className = 'answer-input';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'answer-symbols-toggle';
    toggle.textContent = 'Signes';
    toggle.setAttribute('aria-label', 'Signes pour ' + name);
    toggle.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.className = 'answer-symbols-panel';
    panel.id = input.id + '-signes';
    panel.hidden = true;
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Signes pour ' + name);
    toggle.setAttribute('aria-controls', panel.id);
    let selection = [input.value.length, input.value.length];
    const remember = () => {
      if (input.selectionStart != null) selection = [input.selectionStart, input.selectionEnd];
    };
    const items = [];
    const close = returnFocus => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (opened === state) opened = null;
      if (returnFocus && !toggle.disabled) toggle.focus();
    };
    const state = {input, group, close, toggle, panel, sync: () => {
      const disabled = input.disabled || input.readOnly;
      [toggle, ...items].forEach(button => { button.disabled = disabled; });
      if (disabled) close(false);
    }};
    const symbols = [
      ['minus', '−', 'Signe moins'], ['plus', '+', 'Signe plus'],
      ['decimal', ',', 'Virgule'], ['fraction', '/', 'Fraction']
    ];
    if (input.dataset.unit) symbols.push(['unit', input.dataset.unit, 'Unité demandée']);
    symbols.forEach(([key, symbol, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.symbol = key;
      const glyph = document.createElement('span');
      glyph.className = 'answer-symbol-glyph';
      glyph.textContent = symbol;
      glyph.setAttribute('aria-hidden', 'true');
      button.append(glyph, document.createTextNode(label));
      button.setAttribute('aria-label', label + ' : ' + symbol);
      // Ne pas annuler pointerdown : cela supprime le clic tactile dans WebKit.
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => {
        if (input.disabled || input.readOnly) return;
        close(false);
        input.focus();
        input.setSelectionRange(...selection);
        const before = input.value;
        if (key === 'decimal') insertDecimal(input);
        else {
          if (key === 'minus' || key === 'plus') changeSign(input, symbol);
          else if (key === 'fraction') insertFraction(input);
          else insertUnit(input);
          if (input.value !== before) input.dispatchEvent(new Event('input', {bubbles: true}));
        }
        remember();
      });
      items.push(button);
      panel.append(button);
    });
    controls.set(input, state);
    input.before(group);
    group.append(input, toggle, panel);
    state.sync();
    ['select', 'keyup', 'pointerup', 'input', 'focusout'].forEach(type => input.addEventListener(type, remember));
    input.addEventListener('focus', () => { if (opened === state) close(false); });
    toggle.addEventListener('mousedown', event => event.preventDefault());
    toggle.addEventListener('click', () => {
      if (input.disabled || input.readOnly) return;
      if (!panel.hidden) { close(true); return; }
      remember();
      if (opened) opened.close(false);
      opened = state;
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      panel.scrollIntoView({block: 'nearest'});
      items[0].focus({preventScroll: true});
    });
    panel.addEventListener('keydown', event => {
      const index = items.indexOf(document.activeElement);
      let next = null;
      if (event.key === 'ArrowDown') next = (index + 1) % items.length;
      if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = items.length - 1;
      if (next != null) { event.preventDefault(); items[next].focus(); }
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
        const state = controls.get(record.target);
        if (state) state.sync();
      }
      if (opened && !opened.input.isConnected) opened.close(false);
    })).observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['readonly', 'disabled']});
  }
  document.addEventListener('click', event => {
    if (opened && !opened.panel.contains(event.target) && !opened.toggle.contains(event.target)) opened.close(false);
  });
  document.addEventListener('focusin', event => {
    if (opened && !opened.group.contains(event.target)) opened.close(false);
  });
  document.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') { event.preventDefault(); opened.close(true); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
