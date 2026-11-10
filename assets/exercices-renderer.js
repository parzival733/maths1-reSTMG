(() => {
  const root = document.querySelector('[data-interactive-exercises][data-generated-exercises]');
  const dataNode = document.getElementById('exercise-data');
  const mount = document.getElementById('exercise-mounted');

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  // Les libellés existants « en % » et « en € » déclarent déjà l'unité attendue.
  const unitForLabel = label => window.ExerciseVariants?.unitForLabel?.(label)
    || (/\ben\s*%|^Pourcentage$/i.test(label) ? '%'
    : /\ben\s*(?:€|euros?)(?:\s|$)/i.test(label) ? '€' : '');

  // La consigne utilise le format déclaré, jamais la valeur de la solution.
  function answerFormat(type, rounding, unit) {
    if (type === 'unordered-list') return {
      placeholder: 'Valeurs séparées par ;',
      description: 'Sépare les valeurs par un point-virgule. Leur ordre est libre.'
    };
    if (type !== 'number') return null;
    let placeholder = unit ? 'En ' + unit : 'Nombre';
    let description = 'Nombre entier, décimal (virgule ou point) ou fraction.';
    if (unit) description += ' Unité attendue : ' + unit + '.';
    const digits = Number(rounding);
    if (rounding != null && rounding !== '' && Number.isInteger(digits) && digits >= 0 && digits <= 6) {
      placeholder += digits ? ' · ' + digits + ' déc.' : ' · entier';
      description += digits ? ' Un arrondi à ' + digits + ' décimale' + (digits > 1 ? 's' : '') + ' est accepté.'
        : ' Un arrondi à l’unité est accepté.';
    }
    return {placeholder, description};
  }

  function makeInput(field) {
    const answer = String(field.answer);
    const expected = escapeHtml(answer);
    const label = escapeHtml(field.label);
    const tolerance = field.tolerance == null ? '' : ' data-tolerance="' + escapeHtml(field.tolerance) + '"';
    const rounding = field.rounding == null ? '' : ' data-rounding="' + escapeHtml(field.rounding) + '"';
    const unit = field.unit || unitForLabel(field.label);
    const unitAttribute = unit ? ' data-unit="' + escapeHtml(unit) + '"' : '';
    const group = field.answerGroup ? ' data-answer-group="' + escapeHtml(field.answerGroup) + '"' : '';

    if (field.options) {
      const options = field.options.map(option => {
        const entry = typeof option === 'string' ? {value: option, label: option} : option;
        return '<option value="' + escapeHtml(entry.value) + '">' + escapeHtml(entry.label) + '</option>';
      }).join('');
      return '<label class="answer-row"><span>' + label + '</span>'
        + '<select data-expect="' + expected + '" aria-label="' + label + '">'
        + '<option value="">Choisir…</option>' + options + '</select>'
        + '<small class="answer-status" aria-live="polite"></small></label>';
    }

    const numeric = field.type !== 'text' && field.type !== 'unordered-list';
    return '<label class="answer-row"><span>' + label + '</span>'
      + '<input type="text" autocomplete="off"'
      + (numeric ? ' inputmode="decimal" data-type="number"'
        : field.type === 'unordered-list' ? ' inputmode="text" data-type="unordered-list"' : ' inputmode="text"')
      + ' data-expect="' + expected + '"' + tolerance + rounding + unitAttribute + group
      + ' aria-label="' + label + '" placeholder="Ta réponse">'
      + '<small class="answer-status" aria-live="polite"></small></label>';
  }

  // Formule courte en gras dans l'énoncé (≤ 32 caractères, avec un signe ou un chiffre) :
  // classe .math, pour un dessin unique, des chiffres tabulaires et aucune coupure.
  const mathify = html => String(html).replace(/<strong>([^<]{1,32})<\/strong>/g, (whole, text) =>
    /[=<>≤≥×÷−+²³ⁿ√∈∩∪]|[a-zA-Z]\(|\d/.test(text) ? '<strong class="math">' + text + '</strong>' : whole);

  function makeExercise(exercise, index) {
    if (!Array.isArray(exercise.fields) || exercise.fields.length === 0) {
      throw new Error('Il manque les réponses de l’exercice ' + (index + 1));
    }
    const questions = Array.isArray(exercise.tasks) && exercise.tasks.length
      ? '<ol>' + exercise.tasks.map(task => '<li>' + mathify(task) + '</li>').join('') + '</ol>' : '';
    const hint = exercise.hint
      ? '<details class="hint"><summary>Indice</summary><p>' + exercise.hint + '</p></details>' : '';
    const correction = Array.isArray(exercise.correction) ? exercise.correction : [exercise.correction];
    // Un tableau (tableau de signes ou de variations) n'est pas placé dans un paragraphe.
    const paragraphs = correction.map(p => (/^\s*<(div|table)\b/i.test(p) ? p : '<p>' + p + '</p>')).join('');
    const fields = exercise.fields.map(makeInput).join('');
    return '<article class="exercise-block" id="exercice-' + (index + 1) + '">'
      + '<div class="exercise-workspace">'
      + '<section class="exercise-statement"><div class="exercise-head">'
      + '<span class="exercise-number">' + String(index + 1).padStart(2, '0') + '</span>'
      + '<div><p class="exercise-kicker">' + escapeHtml(exercise.level || 'S’entraîner') + '</p>'
      + '<h2>' + escapeHtml(exercise.title) + '</h2></div></div>'
      + '<p>' + mathify(exercise.statement) + '</p>' + questions + hint + '</section>'
      + '<form class="exercise-form" novalidate><h3>Tes réponses</h3>'
      + '<div class="answer-grid two">' + fields + '</div>'
      + '<div class="exercise-actions">'
      + '<button class="button button-primary" type="submit">Vérifier</button>'
      + '<button class="button button-secondary" type="button" data-action="reset">Effacer</button>'
      + '<button class="button variant-refresh" type="button" data-action="new-variant" hidden>Nouvelle variante ↻</button>'
      + '</div><p class="exercise-feedback" role="status" aria-live="polite"></p>'
      + '<details class="check"><summary>Voir la correction détaillée</summary>'
      + paragraphs + '</details></form></div></article>';
  }

  // Expose le même gabarit pour renouveler une question sans recharger la page.
  window.ExerciseRenderer = {makeExercise, unitForLabel, answerFormat};
  if (!root || !dataNode || !mount) return;

  let chapter;
  try {
    chapter = JSON.parse(dataNode.textContent);
  } catch (error) {
    // Si le moteur des variantes n'a pas chargé, la Terminale dispose encore
    // des énoncés et corrigés statiques préparés pour la lecture sans JavaScript.
    const warning = document.createElement('p');
    warning.className = 'catalog-notice';
    warning.setAttribute('role', 'status');
    warning.textContent = 'Les exercices interactifs sont indisponibles. Recharge la page pour réessayer ; les énoncés et corrigés restent disponibles ci-dessous.';
    mount.replaceChildren(warning);
    const offline = root.querySelector('noscript[data-offline-series]');
    if (offline) {
      const template = document.createElement('template');
      template.innerHTML = offline.textContent;
      const series = template.content.querySelector('.offline-series');
      if (series) mount.append(series);
    }
    root.removeAttribute('aria-busy');
    return;
  }
  if (!chapter || !Array.isArray(chapter.exercises) || chapter.exercises.length === 0) {
    throw new Error('Le chapitre doit contenir des exercices.');
  }
  root.dataset.chapter = chapter.slug;

  const length = chapter.exercises.length;
  const steps = chapter.exercises.map((exercise, index) =>
    '<button type="button" data-step="' + index + '" aria-label="Exercice ' + (index + 1)
    + '">' + (index + 1) + '</button>').join('');

  mount.innerHTML =
    '<section class="exercise-progress" aria-label="Progression dans la série">'
      + '<div class="exercise-progress-top">'
      + '<strong id="exercise-progress-label">0 / ' + length + ' exercices validés</strong>'
      + '<span class="score-chip">Score <span id="exercise-score">0/' + length + '</span></span>'
      + '</div><div class="progress-track" aria-hidden="true">'
      + '<span id="exercise-progress-fill"></span></div>'
      + '<nav class="exercise-stepper" aria-label="Choisir un exercice">' + steps + '</nav>'
      + '<p class="correction-legend">'
      + '<span class="legend-cases">Cases : <span><i class="legend-dot" aria-hidden="true"></i> juste,</span>'
      + '<span><i class="legend-dot wrong" aria-hidden="true"></i> fausse ou vide, puis corrigée.</span></span>'
      + '<span class="legend-steps">Numéros : <span><i class="legend-mark is-complete" aria-hidden="true"></i> validé,</span> <span><i class="legend-mark is-wrong" aria-hidden="true"></i> à revoir,</span> <span><i class="legend-mark is-revealed" aria-hidden="true"></i> correction vue.</span></span></p></section>'
      + '<section class="exercise-stage" aria-label="Exercices du chapitre">'
      + chapter.exercises.map(makeExercise).join('') + '</section>'
      + '<nav class="exercise-linear-nav" aria-label="Navigation entre les exercices">'
      + '<button class="button button-secondary" type="button" data-nav="previous">'
      + '← Exercice précédent</button>'
      + '<span class="nav-help">Tu peux aussi utiliser les numéros en haut.</span>'
      + '<button class="button button-primary" type="button" data-nav="next">'
      + 'Exercice suivant →</button></nav>'
      + '<div class="exercise-links">'
      + '<a href="../cours/' + encodeURIComponent(chapter.slug) + '.html">← Revoir la leçon</a>'
      + '<a href="../exercices.html">Tous les exercices</a></div>';

  // La feuille de style reste identique ; le nombre de colonnes est défini
  // par le script autorisé, sans attribut style analysé depuis du HTML.
  mount.querySelector('.exercise-stepper').style.setProperty('--exercise-steps', String(length));
  root.removeAttribute('aria-busy');
})();
