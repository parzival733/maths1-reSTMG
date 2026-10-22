/* Générateur procédural de variantes. Chaque fiche est construite à partir
   de paramètres : énoncé, réponses et correction partagent les mêmes valeurs.
   Aucun appel réseau ni stockage ; uniquement du JavaScript local. */
(() => {
  'use strict';
  const factories = new Map();
  const N = (label, value, tolerance, rounding) => ({
    label, answer: String(value),
    ...(tolerance === undefined ? {} : {tolerance: String(tolerance)}),
    ...(rounding === undefined ? {} : {rounding: String(rounding)})
  });
  const S = (label, answer, options) => ({label, answer, options});
  const F = (value, digits = 4) => Number(value.toFixed(digits));
  const FR = (value, digits = 4) => String(F(value, digits)).replace('.', ',');
  // Période 24 : les bornes voisines restent distinctes même pour les exercices
  // dont le modèle utilise des restes modulo 2, 3, 4, 5 ou 7.
  const pad = cycle => 2 + (cycle % 24);
  const E = (original, statement, fields, correction, options = {}) => ({
    title: options.title || original?.title || 'Nouvelle variante',
    level: original?.level || 'Entraînement',
    statement,
    tasks: options.tasks || ['Complète les réponses demandées, puis vérifie ta démarche.'],
    fields,
    correction: Array.isArray(correction) ? correction : [correction],
    hint: options.hint || 'Repère les données de l’énoncé et la méthode du cours. Effectue le calcul avant de consulter la correction.'
  });

  // Convertir des nombres français et des fractions de manière contrôlée.
  // Number() seul accepterait aussi Infinity ou des formats hexadécimaux.
  const decimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

  function readNumber(value) {
    const input = String(value).trim().replace(/[−–—]/g, '-')
      .replace(/\s+/g, '').replace(/,/g, '.');
    const parts = input.split('/');
    if (parts.length === 1 && decimalPattern.test(parts[0])) {
      const n = Number(parts[0]);
      return Number.isFinite(n) ? n : NaN;
    }
    if (parts.length === 2 && parts.every(part => decimalPattern.test(part))) {
      const numerator = Number(parts[0]), denominator = Number(parts[1]);
      const n = numerator / denominator;
      return denominator !== 0 && Number.isFinite(n) ? n : NaN;
    }
    return NaN;
  }

  function unorderedValues(value) {
    const input = String(value).trim().replace(/^\{|\}$/g, '')
      .replace(/\bx\s*=\s*/gi, '');
    const tokens = /;|\bet\b/i.test(input) ? input.split(/\s*(?:;|\bet\b)\s*/i) : input.split(/\s*,\s*/);
    if (tokens.length < 2 || tokens.some(token => !token.trim())) return null;
    const numbers = tokens.map(readNumber);
    return numbers.every(Number.isFinite) ? numbers.sort((a, b) => a - b) : null;
  }

  // Comparaison utilisée avant et pendant la révélation des corrections.
  function matchesAnswer(value, expected, type = 'text', tolerance, rounding) {
    if (!String(value).trim()) return false;
    const answers = String(expected).split('|');

    if (type === 'number') {
      const actual = readNumber(value);
      if (!Number.isFinite(actual)) return false;
      const threshold = tolerance === '' || tolerance == null
        ? 0.000001 : Number(tolerance);
      if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) return false;
      return answers.some(item => {
        const target = readNumber(item);
        if (!Number.isFinite(target)) return false;
        if (Math.abs(actual - target) <= threshold + Number.EPSILON * Math.max(1, Math.abs(target))) return true;
        if (rounding == null || rounding === '') return false;
        const digits = Number(rounding);
        if (!Number.isInteger(digits) || digits < 0 || digits > 6) return false;
        const scale = 10 ** digits;
        const rounded = Math.sign(target) * Math.round(Math.abs(target) * scale + 1e-9) / scale;
        return Math.abs(actual - rounded) <= 1e-9;
      });
    }

    if (type === 'unordered-list') {
      const actual = unorderedValues(value);
      if (!actual) return false;
      return answers.some(item => {
        const target = unorderedValues(item);
        return target && target.length === actual.length
          && actual.every((number, index) => Math.abs(number - target[index]) < 1e-9);
      });
    }

    const normal = text => String(text).trim().toLowerCase()
      .replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/\s+/g, '');
    return answers.some(item => normal(value) === normal(item));
  }

  function register(slug, generators) {
    if (factories.has(slug) || !Array.isArray(generators) || !generators.every(g => typeof g === 'function')) {
      throw new Error('Générateurs invalides pour ' + slug);
    }
    factories.set(slug, generators);
  }

  function generate(slug, index, cycle, original = {}) {
    const generators = factories.get(slug);
    if (!generators || index < 0 || index >= generators.length || !Number.isInteger(cycle) || cycle < 1) {
      throw new Error('Variante introuvable : ' + slug + ', exercice ' + (index + 1));
    }
    const result = generators[index](cycle, original);
    if (!result || !result.statement || !Array.isArray(result.fields) || result.fields.length < 2) {
      throw new Error('Exercice incomplet : ' + slug + ', n° ' + (index + 1));
    }
    for (const field of result.fields) {
      if (!field.label || field.answer === undefined || field.answer === '') throw new Error('Réponse manquante : ' + slug);
      if (field.options && !field.options.some(option =>
        (typeof option === 'string' ? option : option.value) === field.answer)) {
        throw new Error('Choix correct absent : ' + slug + ', ' + field.label);
      }
      if (!field.options && field.type !== 'text' && field.type !== 'unordered-list' && !Number.isFinite(readNumber(field.answer))) {
        throw new Error('Réponse numérique non finie : ' + slug + ', ' + field.label);
      }
    }
    if (!result.correction?.length || !result.correction.every(Boolean)) {
      throw new Error('Correction manquante : ' + slug);
    }
    return result;
  }

  window.ExerciseVariants = {register, generate, N, S, F, FR, pad, E, matchesAnswer};
})();