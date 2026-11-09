/* Typographie française du texte produit par JavaScript (exercices, aides, bilans) :
   mêmes règles que tools/typographie.py pour le HTML statique. Le code, les champs
   de saisie et les listes déroulantes ne sont jamais modifiés. */
(() => {
  'use strict';
  const NBSP = String.fromCharCode(160), NNBSP = String.fromCharCode(8239);
  const LETTER = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
  const UNITS = '(?:€|%|km/h|m/s|kWh|km|cm|mm|kg|min|h|L|°C|ans?|mois)';
  const RULES = [
    [new RegExp('([' + LETTER + "])'(?=[" + LETTER + '])', 'g'), '$1’'],
    [new RegExp('(^|\\S)[ ' + NBSP + '](?=:(?:\\s|$))', 'g'), '$1' + NBSP],
    [new RegExp('(^|\\S)[ ' + NBSP + '](?=[;!?](?:\\s|$|[»)]))', 'g'), '$1' + NNBSP],
    [new RegExp('«[ ' + NNBSP + NBSP + ']?', 'g'), '«' + NBSP],
    [new RegExp('[ ' + NNBSP + NBSP + ']?»', 'g'), NBSP + '»'],
    [new RegExp('(\\d) (?=' + UNITS + '(?![' + LETTER + '\\d/]))', 'g'), '$1' + NBSP]
  ];
  const SKIP = 'script, style, pre, code, textarea, svg, select, input';
  const fix = text => RULES.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);

  function polish(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const parent = root.parentElement;
      if (!parent || parent.closest(SKIP)) return;
      const value = fix(root.nodeValue);
      if (value !== root.nodeValue) root.nodeValue = value;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.matches(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(polish);
  }

  window.FrenchTypography = {fix, polish};
  const start = () => {
    polish(document.body);
    // Texte ajouté ou modifié ensuite (nouvelle variante, aide, bilan) : même traitement.
    new MutationObserver(records => records.forEach(record => {
      if (record.type === 'characterData') polish(record.target);
      record.addedNodes.forEach(polish);
    })).observe(document.body, {childList: true, subtree: true, characterData: true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
