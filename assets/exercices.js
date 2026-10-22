/* Vérification et répétition procédurale : les corrections restent consultables
   avant de passer à la variante suivante. */
(() => {
  'use strict';
  const root = document.querySelector('[data-interactive-exercises]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.exercise-block'));
  const steps = Array.from(root.querySelectorAll('[data-step]'));
  const prev = root.querySelector('[data-nav="previous"]');
  const next = root.querySelector('[data-nav="next"]');
  const progressFill = root.querySelector('#exercise-progress-fill');
  const progressLabel = root.querySelector('#exercise-progress-label');
  const scoreText = root.querySelector('#exercise-score');
  const slug = root.dataset.chapter || 'fonctions';
  const generator = window.ExerciseVariants;
  const renderer = window.ExerciseRenderer;
  // Les énoncés initiaux des 15 autres chapitres sont dans leur JSON intégré.
  // La même fiche et ses variantes alimentent les indices sans lire les solutions.
  const originalExercises = (() => {
    const node = document.getElementById('exercise-data');
    if (!node) return [];
    try {
      const chapter = JSON.parse(node.textContent);
      return chapter.slug === slug && Array.isArray(chapter.exercises)
        ? chapter.exercises : [];
    } catch (error) {
      console.error('Données de départ illisibles pour les aides pédagogiques', error);
      return [];
    }
  })();
  const completed = new Set();
  const states = slides.map(slide => ({
    cycle: 0,
    variantsShown: 0,
    shown: null,
    offset: Math.floor(Math.random() * 24),
    pending: null,
    original: {
      title: slide.querySelector('.exercise-head h2')?.textContent || 'Exercice',
      level: slide.querySelector('.exercise-kicker')?.textContent || 'Entraînement'
    }
  }));
  let current = 0;

  // Validation identique avant et pendant la révélation des corrections.
  function isCorrect(control) {
    return !!generator && generator.matchesAnswer(
      control.value, control.dataset.expect || '', control.dataset.type || 'text',
      control.dataset.tolerance, control.dataset.rounding
    );
  }

  function revealAnswers(form) {
    form.querySelectorAll('.answer-row').forEach(row => {
      const controls = Array.from(row.querySelectorAll('[data-expect]'));
      let right = 0;
      let answered = 0;
      controls.forEach(control => {
        // Capturer la tentative de l'élève AVANT d'afficher la solution.
        const wasCorrect = isCorrect(control);
        if (wasCorrect) right++;
        if (control.value.trim()) answered++;

        const answer = (control.dataset.expect || '').split('|')[0].trim();
        if (control.tagName === 'SELECT') {
          const match = Array.from(control.options)
            .find(option => option.value === answer
              || option.value.replace(/\s+/g, '') === answer.replace(/\s+/g, ''));
          if (match) control.value = match.value;
          control.disabled = true;
        } else {
          control.value = control.dataset.type === 'number'
            ? answer.replace(/\./g, ',')
            : answer.replace(/;/g, ' ; ');
          control.readOnly = true;
        }
        control.classList.toggle('answer-was-correct', wasCorrect);
        control.classList.toggle('answer-was-wrong', !wasCorrect);
      });

      const allRight = controls.length > 0 && right === controls.length;
      row.classList.remove('is-correct', 'is-wrong');
      row.classList.add('is-revealed');
      row.classList.toggle('was-correct', allRight);
      row.classList.toggle('was-wrong', !allRight);
      const status = row.querySelector('.answer-status');
      if (status) {
        status.textContent = allRight
          ? '✓ Tu avais juste. Solution affichée.'
          : answered === 0
            ? '✗ Non répondu. Solution affichée.'
            : controls.length > 1
              ? '✗ ' + right + '/' + controls.length + ' juste(s) avant correction. Solutions affichées.'
              : '✗ Ta réponse était fausse. Solution affichée.';
      }
    });
  }

  function markRow(row) {
    const controls = Array.from(row.querySelectorAll('[data-expect]'));
    controls.forEach(control => control.setAttribute('aria-invalid', String(Boolean(control.value.trim()) && !isCorrect(control))));
    const hasEmpty = controls.some(control => !control.value.trim());
    const correct = controls.length > 0 && controls.every(isCorrect);
    row.classList.toggle('is-correct', correct);
    row.classList.toggle('is-wrong', !correct && !hasEmpty);
    const status = row.querySelector('.answer-status');
    if (status) status.textContent = correct ? 'Correct ✓'
      : hasEmpty ? 'Réponse à compléter.' : 'À revoir. Essaie encore.';
    return correct;
  }

  function updateProgress() {
    const total = slides.length, done = completed.size;
    if (progressFill) progressFill.style.width = (total ? 100 * done / total : 0) + '%';
    if (progressLabel) progressLabel.textContent = done + ' / ' + total + ' exercices validés';
    if (scoreText) scoreText.textContent = done + '/' + total;
    steps.forEach((button, index) => {
      button.classList.toggle('is-complete', completed.has(index));
      button.setAttribute('aria-label', 'Exercice ' + (index + 1) + (completed.has(index) ? ', validé' : ''));
    });
  }

  function showSlide(index, focus = false) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.hidden = !active;
      slide.classList.toggle('is-active', active);
    });
    steps.forEach((button, i) => {
      const active = i === current;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
    });
    if (prev) prev.disabled = current === 0;
    if (next) {
      next.disabled = current === slides.length - 1;
      next.textContent = current === slides.length - 1 ? 'Fin de la série' : 'Exercice suivant →';
    }
    const slide = slides[current];
    history.replaceState(null, '', '#' + slide.id);
    if (focus) {
      const heading = slide.querySelector('h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    }
  }

  // Compare les données réellement montrées à l'élève, pas seulement
  // le numéro du tirage : un premier tirage peut recopier l'énoncé initial.
  function pedagogicalSignature(index, exercise) {
    if (slug === 'fonctions' && window.FonctionsCoaching) {
      const c = (exercise && exercise.coachingContext)
        || window.FonctionsCoaching.originals[index];
      return window.FonctionsCoaching.build(index, c)?.hints?.[2] || '';
    }
    return window.ExerciseCoaching && exercise
      ? window.ExerciseCoaching.context(exercise) : '';
  }

  function queueVariant(index, form, button, force = false) {
    if (!generator || !renderer) return false;
    const state = states[index];
    if (force || !state.pending) {
      const shown = state.shown || originalExercises[index];
      const previous = pedagogicalSignature(index, shown);
      let candidate, attempts = 0;
      do {
        state.cycle++;
        candidate = generator.generate(slug, index,
          state.cycle + state.offset, state.original);
        attempts++;
      } while (attempts < 24 && previous
        && pedagogicalSignature(index, candidate) === previous);
      state.pending = candidate;
    }
    button.hidden = false;
    button.textContent = 'Nouvelle variante ↻';
    return true;
  }

  function activateVariant(index) {
    const state = states[index];
    if (!state.pending || !renderer) return;
    const coachingContext = state.pending;

    // Remplacer seulement l'exercice : la navigation et les scores restent intacts.
    const template = document.createElement('template');
    template.innerHTML = renderer.makeExercise(state.pending, index).trim();
    const slide = template.content.firstElementChild;
    if (!slide || slide.id !== 'exercice-' + (index + 1)) {
      throw new Error('Impossible de construire la variante ' + (index + 1));
    }
    const kicker = slide.querySelector('.exercise-kicker');
    if (kicker) kicker.textContent += ' · variante ' + (state.variantsShown + 2);
    slides[index].replaceWith(slide);
    slides[index] = slide;
    state.shown = state.pending;
    state.variantsShown++;
    state.pending = null;
    completed.delete(index);
    updateProgress();
    wireSlide(slide, index, coachingContext);
    showSlide(index, true);
  }

  // Le prototype Fonctions est conservé ; les autres chapitres utilisent
  // leurs fiches de méthodes spécifiques, avec les valeurs de la variante en cours.
  function addCoaching(slide, form, index, context) {
    let data = null;
    if (slug === 'fonctions' && window.FonctionsCoaching) {
      data = window.FonctionsCoaching.build(index,
        (context && context.coachingContext) || window.FonctionsCoaching.originals[index]);
    } else if (slug !== 'fonctions' && window.ExerciseCoaching) {
      data = window.ExerciseCoaching.build(
        slug, index, context && context.fields ? context : originalExercises[index]);
    }
    if (!data || !Array.isArray(data.hints) || data.hints.length !== 3 || !data.bridge) return;
    const statement = slide.querySelector('.exercise-statement');
    if (!statement) return;
    const panel = document.createElement('section');
    panel.className = 'coaching-panel';
    panel.setAttribute('aria-label', 'Aide progressive');
    const title = document.createElement('h3');
    title.textContent = 'Besoin d’un coup de pouce ?';
    panel.append(title);
    const intro = document.createElement('p');
    intro.textContent = 'Choisis une aide à ton rythme, sans afficher la correction.';
    panel.append(intro);
    const hints = data.hints;
    const names = ['Comprendre', 'Commencer', 'Méthode'];
    hints.forEach((hint, level) => {
      const details = document.createElement('details');
      details.className = 'coaching-hint';
      const summary = document.createElement('summary');
      summary.textContent = 'Indice ' + (level + 1) + ' · ' + names[level];
      const explanation = document.createElement('p');
      explanation.textContent = hint;
      details.append(summary, explanation);
      panel.append(details);
    });
    const feedback = document.createElement('p');
    feedback.className = 'coaching-diagnosis';
    feedback.setAttribute('role', 'status');
    feedback.hidden = true;
    feedback.textContent = data.diagnose;
    panel.append(feedback);
    const bridge = document.createElement('details');
    bridge.className = 'coaching-bridge';
    bridge.hidden = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Exercice tremplin · je reprends les bases';
    const note = document.createElement('p');
    note.textContent = 'Cet exemple indépendant est volontairement plus simple : ses nombres restent fixes.';
    const question = document.createElement('p');
    question.textContent = data.bridge.q;
    const answer = document.createElement('input');
    answer.type = 'text';
    answer.className = 'coaching-bridge-answer';
    answer.autocomplete = 'off';
    answer.setAttribute('aria-label', 'Réponse à l’exercice tremplin');
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'button button-secondary';
    check.textContent = 'Vérifier mon tremplin';
    const result = document.createElement('p');
    result.setAttribute('role', 'status');
    check.addEventListener('click', () => {
      const numeric = /^[+-]?\d+(?:[.,]\d+)?$/.test(data.bridge.a);
      const good = generator && generator.matchesAnswer
        ? generator.matchesAnswer(answer.value, data.bridge.a, numeric ? 'number' : 'text')
        : answer.value.trim().toLowerCase() === data.bridge.a.trim().toLowerCase();
      result.textContent = good
        ? 'Bravo ! Tu peux réessayer l’exercice principal.'
        : 'Pas encore. ' + data.bridge.help;
      result.classList.toggle('is-success',good);
    });
    bridge.append(summary, note, question, answer, check, result);
    panel.append(bridge);
    // Éviter de présenter en plus un indice générique, parfois inadapté.
    // Il reste dans le HTML si JavaScript est désactivé.
    const oldHint = statement.querySelector('details.hint');
    if (oldHint) oldHint.hidden = true;
    statement.append(panel);
    let failures = 0;
    form.addEventListener('submit', () => {
      if (form.dataset.revealed === 'true') return;
      const rows = Array.from(form.querySelectorAll('.answer-row'));
      const wrong = rows.some(row => {
        const controls = Array.from(row.querySelectorAll('[data-expect]'));
        return controls.some(control => !isCorrect(control));
      });
      const attempted = Array.from(form.querySelectorAll('[data-expect]'))
        .some(control => control.value.trim());
      if (wrong && attempted) {
        failures++;
        feedback.hidden = false;
        if (failures >= 2) bridge.hidden = false;
      } else {
        failures = 0;
        feedback.hidden = true;
        bridge.hidden = true;
        bridge.open = false;
      }
    });
    form.addEventListener('reset', () => {
      failures = 0;
      feedback.hidden = true;
      bridge.hidden = true;
      bridge.open = false;
      answer.value = '';
      result.textContent = '';
    });
  }

  function wireSlide(slide, index, coachingContext) {
    const form = slide.querySelector('.exercise-form');
    if (form) addCoaching(slide, form, index, coachingContext);
    if (!form) return;
    form.querySelectorAll('.answer-row').forEach((row, r) => {
      const status = row.querySelector('.answer-status');
      if (status) { status.id = slug + '-feedback-' + index + '-' + r; row.querySelectorAll('[data-expect]').forEach(c => c.setAttribute('aria-describedby', status.id)); }
    });
    const reset = form.querySelector('[data-action="reset"]');
    const correction = form.querySelector('details.check');
    const actions = form.querySelector('.exercise-actions');
    let variant = form.querySelector('[data-action="new-variant"]');
    if (!variant && actions) {
      variant = document.createElement('button');
      variant.type = 'button';
      variant.className = 'button variant-refresh';
      variant.dataset.action = 'new-variant';
      variant.textContent = 'Nouvelle variante ↻';
      variant.hidden = true;
      actions.append(variant);
    }
    if (variant) variant.addEventListener('click', () => activateVariant(index));

    if (correction) {
      correction.addEventListener('toggle', () => {
        if (!correction.open || form.dataset.revealed === 'true') return;
        form.dataset.revealed = 'true';
        revealAnswers(form);
        const ready = variant && queueVariant(index, form, variant);
        const summary = form.querySelector('.exercise-feedback');
        if (summary) summary.textContent = 'Les solutions sont affichées en vert ou rouge selon ta réponse. '
          + (ready ? 'Tu peux passer à une nouvelle variante sans gagner de point.' : 'Efface pour recommencer.');
      });
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const summary = form.querySelector('.exercise-feedback');
      if (form.dataset.revealed === 'true') {
        if (summary) summary.textContent = 'Le corrigé est affiché : efface les réponses ou essaie une nouvelle variante.';
        return;
      }
      const rows = Array.from(form.querySelectorAll('.answer-row'));
      const results = rows.map(markRow);
      const correctCount = results.filter(Boolean).length;
      const allCorrect = results.length > 0 && correctCount === rows.length;
      if (allCorrect) completed.add(index);
      else completed.delete(index);
      updateProgress();

      // Chaque clic sur Vérifier prépare un nouveau tirage, même si un
      // précédent était en attente ; ouvrir le corrigé ne consomme rien.
      const ready = variant && queueVariant(index, form, variant, true);
      if (summary) summary.textContent = (allCorrect
        ? 'Exercice validé. Bravo ! '
        : correctCount + ' réponse(s) correcte(s) sur ' + rows.length + '. Tu peux corriger ton essai. ')
        + (ready ? 'Une nouvelle variante avec de nouvelles valeurs est prête.' : '');
    });

    const onChange = event => {
      const row = event.target.closest('.answer-row');
      if (!row) return;
      if (completed.delete(index)) updateProgress();
      event.target.setAttribute('aria-invalid', 'false');
      row.classList.remove('is-correct', 'is-wrong', 'is-revealed');
      const status = row.querySelector('.answer-status');
      if (status) status.textContent = '';
    };
    form.addEventListener('input', onChange);
    form.addEventListener('change', onChange);

    if (reset) {
      reset.addEventListener('click', () => {
        form.reset();
        delete form.dataset.revealed;
        if (correction) correction.open = false;
        completed.delete(index);
        states[index].pending = null;
        if (variant) variant.hidden = true;
        form.querySelectorAll('[data-expect]').forEach(control => {
          control.readOnly = false;
          control.disabled = false;
          control.classList.remove('answer-was-correct', 'answer-was-wrong');
        });
        form.querySelectorAll('.answer-row').forEach(row => row.classList.remove(
          'is-correct', 'is-wrong', 'is-revealed', 'was-correct', 'was-wrong'));
        form.querySelectorAll('.answer-status').forEach(status => { status.textContent = ''; });
        const summary = form.querySelector('.exercise-feedback');
        if (summary) summary.textContent = '';
        updateProgress();
      });
    }
  }

  slides.forEach((slide, index) => wireSlide(slide, index));
  steps.forEach((button, index) => button.addEventListener('click', () => showSlide(index, true)));
  if (prev) prev.addEventListener('click', () => showSlide(current - 1, true));
  if (next) next.addEventListener('click', () => showSlide(current + 1, true));
  const hash = location.hash.match(/^#exercice-(\d+)$/);
  updateProgress();
  showSlide(hash ? Number(hash[1]) - 1 : 0);
})();