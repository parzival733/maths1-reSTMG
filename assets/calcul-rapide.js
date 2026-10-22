/* Interface de l'annexe : choix explicites, compte a rebours et bilan fige. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), A = window.QuickMath;
  const app = $('rapid-app'), loading = $('rapid-loading');
  if (!app) return;
  if (!A || !window.QuickCountdown) {
    loading.textContent = 'La série interactive n’a pas pu se charger. Les méthodes et la série papier restent disponibles ci-dessous.';
    return;
  }
  const names = {bac:'Bac de Première', bases:'Bases du calcul', premiere:'Chapitres de Première', terminale:'Chapitres de Terminale'};
  const timer = new window.QuickCountdown();
  let questions = [], states = [], current = 0, options = {}, series = 0;
  let phase = 'ready', timed = false, clock = null, warned = false, reason = '';
  let configWasRunning = false, printing = false, printWasRunning = false;
  const urlSeed = new URLSearchParams(location.search).get('seed');
  const initialSeed = urlSeed && /^\d{1,10}$/.test(urlSeed) ? Number(urlSeed) >>> 0 :
    (window.crypto && window.crypto.getRandomValues ? window.crypto.getRandomValues(new Uint32Array(1))[0] : Date.now() >>> 0);
  const selectedLevel = () => document.querySelector('input[name="level"]:checked').value;
  const score = () => states.filter(s => s.first === true).length;
  function setPhase(value) { phase = value; app.dataset.phase = value; }
  function node(tag, text) { const el = document.createElement(tag); el.textContent = text; return el; }
  function timeText(ms) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
  function stopTicking() { if (clock !== null) clearInterval(clock); clock = null; }
  function paintTime() { $('rapid-time').textContent = timeText(timer.left()); }
  function tick() {
    if (!timed) return;
    paintTime();
    if (phase !== 'running') return;
    if (timer.left() <= 0) { finish('timeout'); return; }
    if (timer.left() <= 30000 && !warned) {
      warned = true; $('rapid-timer').dataset.warning = 'true';
      $('rapid-timer-message').textContent = 'Il reste moins de 30 secondes.';
    }
  }
  function startTicking() { stopTicking(); if (timed && phase === 'running') clock = setInterval(tick, 250); tick(); }
  function pause() {
    if (phase !== 'running' || !timed) return;
    tick(); if (phase !== 'running') return;
    save(); timer.pause(); stopTicking(); setPhase('paused');
    $('rapid-pause').textContent = 'Reprendre'; $('rapid-pause').setAttribute('aria-label','Reprendre le compte à rebours');
    $('rapid-timer-message').textContent = 'Le compte à rebours est en pause.';
    render(); paintTime();
  }
  function resume() {
    if (phase !== 'paused') return;
    timer.resume(); setPhase('running');
    $('rapid-pause').textContent = 'Pause'; $('rapid-pause').setAttribute('aria-label','Mettre le compte à rebours en pause');
    $('rapid-timer-message').textContent = 'Le compte à rebours a repris.';
    render(); startTicking();
  }
  function active() { tick(); return phase === 'running'; }
  function refreshTopics() {
    const select = $('rapid-topic'), old = select.value;
    const list = A.eligible({level:selectedLevel(), method:$('rapid-method').value});
    select.replaceChildren(new Option('Toutes les notions', 'all'));
    [...new Set(list.map(t => t.topic))].forEach(key => select.add(new Option(A.topics[key], key)));
    if ([...select.options].some(o => o.value === old)) select.value = old;
  }
  function durationControls() {
    const enabled = $('rapid-timer-enable').checked;
    $('rapid-duration-fields').hidden = !enabled;
    $('rapid-minutes').disabled = !enabled; $('rapid-seconds').disabled = !enabled;
  }
  function progress() {
    $('rapid-progress-text').textContent = `Question ${current+1} sur ${questions.length} · ${score()} réussite(s) au premier essai / ${questions.length}`;
    $('rapid-progress').max = questions.length; $('rapid-progress').value = current+1;
  }
  function render(focus = false) {
    const q = questions[current], s = states[current]; if (!q) return;
    const paused = phase === 'paused', frozen = phase === 'finished';
    $('rapid-card').hidden = paused; $('rapid-question-nav').hidden = paused;
    $('rapid-pause-screen').hidden = !paused; $('rapid-finish').disabled = frozen;
    $('rapid-card').dataset.template = q.id;
    $('rapid-meta').textContent = `${names[q.level]} · ${A.topics[q.topic]} · ${q.method === 'mental' ? 'De tête' : 'Sur feuille'}`;
    $('rapid-question-title').textContent = q.prompt;
    const input = $('rapid-answer'); input.value = s.value; input.readOnly = s.revealed || frozen || paused;
    input.classList.toggle('is-correct', s.correct === true);
    input.classList.toggle('is-wrong', s.correct === false && s.first !== null);
    input.setAttribute('aria-invalid', s.correct === false && s.first !== null ? 'true' : 'false');
    $('rapid-unit').textContent = q.unit ? `(en ${q.unit})` : '';
    $('rapid-check').disabled = s.revealed || frozen || paused;
    $('rapid-feedback').textContent = s.message;
    $('rapid-feedback').className = 'rapid-feedback' + (s.message ? (s.correct ? ' is-correct' : ' is-wrong') : '');
    $('rapid-hint').textContent = q.hint; $('rapid-hint').hidden = !s.hint;
    $('rapid-hint-button').setAttribute('aria-expanded', String(s.hint));
    const sol = $('rapid-solution');
    sol.replaceChildren(node('strong', `Réponse exacte : ${q.expected}${q.unit ? ' '+q.unit : ''}`), node('p', q.solution)); sol.hidden = !s.revealed;
    $('rapid-solution-button').setAttribute('aria-expanded', String(s.revealed));
    $('rapid-course-link').href = '../' + q.course + '.html';
    $('rapid-course-link').textContent = `Revoir la leçon liée · ${A.topics[q.topic]} →`;
    $('rapid-previous').disabled = current === 0;
    $('rapid-next').textContent = current === questions.length-1 ? (frozen ? 'Retour au bilan' : 'Voir mon bilan') : 'Suivante →';
    progress(); if (focus && !paused) $('rapid-question-title').focus();
  }
  function save() {
    if (questions.length && phase === 'running' && !states[current].revealed) states[current].value = $('rapid-answer').value;
  }
  function prepare() {
    try {
      const nextTimed = $('rapid-timer-enable').checked;
      const minutes = Number($('rapid-minutes').value), seconds = Number($('rapid-seconds').value);
      const duration = (minutes*60 + seconds)*1000;
      if (nextTimed && (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || minutes > 120 || seconds < 0 || seconds > 59 || duration < 15000 || duration > 7200000)) {
        throw new Error('Choisis une durée totale entre 15 secondes et 120 minutes. Les secondes vont de 0 à 59.');
      }
      const seed = (initialSeed + Math.imul(series,2654435761)) >>> 0;
      const nextOptions = {level:selectedLevel(), method:$('rapid-method').value, topic:$('rapid-topic').value, count:Number($('rapid-count').value), seed};
      const next = A.session(nextOptions);
      if (!next.length) throw new Error('Aucune question pour ce choix. Choisis toutes les notions ou une autre façon de travailler.');
      stopTicking(); timer.stop(); options = nextOptions; questions = next; current = 0; series++;
      states = questions.map(() => ({value:'', first:null, correct:null, hint:false, revealed:false, message:''}));
      timed = nextTimed; warned = false; reason = ''; configWasRunning = false;
      app.dataset.seed = String(seed); app.dataset.level = options.level; app.dataset.method = options.method; app.dataset.topic = options.topic; app.dataset.count = String(options.count);
      $('rapid-error').hidden = true; $('rapid-setup').hidden = true; $('rapid-work').hidden = false;
      $('rapid-session').hidden = false; $('rapid-result').hidden = true;
      $('rapid-worksheet').hidden = true; $('rapid-preview').setAttribute('aria-expanded','false'); $('rapid-print-answers').checked = false;
      $('rapid-paper-tools').open = false;
      $('rapid-session-label').textContent = `${names[options.level]} · ${questions.length} questions`;
      $('rapid-session-description').textContent = timed ? `Durée choisie : ${timeText(duration)} pour toute la série.` : 'Sans limite de temps.';
      const scope = $('rapid-scope'); scope.classList.toggle('is-terminale', options.level === 'terminale');
      scope.textContent = options.level === 'terminale' ? 'Prolongement Terminale : ces questions ne sont pas des prérequis de l’épreuve anticipée de Première.' : `${names[options.level]} : aucune notion propre à la Terminale dans cette série.`;
      $('rapid-timer').hidden = !timed; $('rapid-timer').dataset.warning = 'false';
      $('rapid-timer-message').textContent = '';
      $('rapid-pause').textContent = 'Pause'; $('rapid-pause').setAttribute('aria-label','Mettre le compte à rebours en pause');
      $('rapid-pause').hidden = !timed;
      setPhase('running'); if (timed) timer.start(duration);
      render(true); startTicking(); $('rapid-work').scrollIntoView({block:'start', behavior:'auto'});
    } catch (error) {
      $('rapid-error').textContent = error.message || 'La série ne peut pas être préparée.';
      $('rapid-error').hidden = false; $('rapid-error').focus();
    }
  }
  function remember(q,s,outcome) {
    if (s.progressRecorded) return; s.progressRecorded = true;
    if (!window.MathsAcquis) return;
    const A = window.MathsAcquis;
    document.dispatchEvent(new CustomEvent('maths:attempt', {detail:{
      skill:A.skillFor(q),source:'calcul',template:q.id,variant:A.hash(q.prompt),outcome,
      error:q.id==='p-successives' && A && window.QuickMath.check(s.value,{expected:'0',unit:q.unit})?'taux-addition':''
    }}));
  }
  function validate(event) {
    event.preventDefault(); if (!active()) return;
    save(); const q = questions[current], s = states[current]; if (!q || s.revealed) return;
    if (!A.parse(s.value, q.unit)) {
      $('rapid-feedback').textContent = 'Écris un nombre ou une fraction valide, par exemple −3, 1,25 ou 2/3. Le dénominateur ne peut pas être nul.';
      $('rapid-feedback').className = 'rapid-feedback is-wrong'; $('rapid-answer').setAttribute('aria-invalid','true'); return;
    }
    const right = A.check(s.value,q); if (s.first === null) { s.first = right; remember(q,s,right?(s.usedHint?'assisted':'independent'):'retry'); } s.correct = right;
    s.message = right ? (s.first ? 'Juste dès le premier essai. Explique aussi ta méthode sur feuille.' : 'Juste après un nouvel essai. La méthode progresse ; le score du premier essai reste inchangé.') : 'Pas encore. Vérifie le signe et les étapes ; utilise une fraction si le résultat n’est pas un décimal fini.';
    render();
  }
  function reveal() {
    tick(); if (phase === 'paused' || phase === 'ready') return;
    save(); const s = states[current];
    if (phase !== 'finished' && s.first === null) { s.first = false; remember(questions[current],s,'revealed'); }
    s.revealed = true; s.message = s.first ? 'Correction consultée après une réponse juste.' : 'Correction affichée : aucun point ajouté. Relis la méthode avant la question suivante.';
    render();
  }
  function showResult() {
    $('rapid-session').hidden = true; $('rapid-result').hidden = false;
    $('rapid-result-title').textContent = reason === 'timeout' ? 'Temps écoulé · ton bilan' : 'Ton bilan';
    $('rapid-score').textContent = `${score()} / ${questions.length} réponses justes au premier essai.`;
    const unanswered = states.filter(s => s.first === null).length;
    const topics = [...new Set(questions.filter((_,i) => states[i].first !== true).map(q => A.topics[q.topic]))];
    let text = topics.length ? `À reprendre calmement : ${topics.join(', ')}.` : 'Toutes les réponses sont justes au premier essai. Essaie une autre série ou explique les méthodes sans regarder.';
    if (unanswered) text += ` ${unanswered} question(s) sans réponse vérifiée ne rapportent pas de point.`;
    if (timed) text += ` Temps utilisé : ${timeText(timer.elapsed())} sur ${timeText(timer.duration)}.`;
    text += ' Le bilan est terminé. Tu peux revoir les questions et les corrections sans modifier le score.';
    $('rapid-review').textContent = text; $('rapid-result-title').focus();
  }
  function finish(endReason = 'manual') {
    if (phase === 'finished') { showResult(); return; }
    if (!questions.length) return;
    save();
    // Les reponses deja saisies mais non verifiees sont prises en compte une seule fois.
    questions.forEach((q,i) => {
      const s = states[i];
      if (s.first === null && !s.revealed && A.parse(s.value,q.unit)) {
        s.first = s.correct = A.check(s.value,q);
        remember(q,s,s.first?(s.usedHint?'assisted':'independent'):'retry');
        s.message = s.correct ? 'Réponse juste enregistrée au moment du bilan.' : 'Réponse enregistrée au moment du bilan. Consulte la correction pour comprendre.';
      }
    });
    reason = endReason; timer.stop(); stopTicking(); setPhase('finished'); $('rapid-pause').hidden = true;
    $('rapid-setup').hidden = true; $('rapid-work').hidden = false; showResult();
  }
  function configure() {
    tick(); save(); configWasRunning = phase === 'running' && timed;
    if (configWasRunning) pause();
    $('rapid-setup').hidden = false; $('rapid-work').hidden = true;
    $('rapid-cancel-setup').hidden = false; $('rapid-start').textContent = 'Démarrer une nouvelle série';
    $('rapid-setup-title').focus(); $('rapid-setup').scrollIntoView({block:'start',behavior:'auto'});
  }
  function buildSheet() {
    const qlist = $('rapid-paper-questions'), alist = $('rapid-paper-answers'); qlist.replaceChildren(); alist.replaceChildren();
    $('rapid-sheet-meta').textContent = `${names[options.level]} · ${questions.length} questions · série ${options.seed}`;
    questions.forEach(q => {
      const li = node('li',''), blank = node('div','Réponse et étapes :'); blank.className = 'rapid-blank';
      li.append(node('p',q.prompt + (q.unit ? ` Réponse en ${q.unit}.` : '')),blank); qlist.append(li);
      const answer = node('li',''); answer.append(node('strong',`${q.expected}${q.unit ? ' '+q.unit : ''}. `),node('span',q.solution)); alist.append(answer);
    });
  }
  function beforePrint() {
    if (!questions.length || printing) return;
    printing = true; tick(); save(); printWasRunning = phase === 'running' && timed;
    if (printWasRunning) pause();
    buildSheet(); document.body.classList.add('rapid-printing');
    const answers = $('rapid-print-answers').checked; document.body.classList.toggle('rapid-print-answers', answers);
    if (answers) {
      states.forEach((s,i) => { if (phase !== 'finished' && s.first === null) { s.first = false; remember(questions[i],s,'revealed'); } s.revealed = true; s.message = s.first ? 'Corrigé imprimé après une réponse juste.' : 'Corrigé imprimé : aucun point ajouté.'; });
      render();
    }
  }
  $('rapid-settings').addEventListener('submit', event => { event.preventDefault(); prepare(); });
  document.querySelectorAll('input[name="level"]').forEach(input => input.addEventListener('change', refreshTopics));
  $('rapid-method').addEventListener('change', refreshTopics);
  document.querySelectorAll('input[name="timing"]').forEach(input => input.addEventListener('change', durationControls));
  document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => { $('rapid-minutes').value = button.dataset.minutes; $('rapid-seconds').value = '0'; }));
  $('rapid-answer-form').addEventListener('submit', validate);
  $('rapid-answer').addEventListener('input', () => { if (active()) save(); $('rapid-answer').setAttribute('aria-invalid','false'); });
  $('rapid-hint-button').addEventListener('click', () => { tick(); if (phase === 'paused') return; save(); states[current].usedHint = true; states[current].hint = !states[current].hint; render(); });
  $('rapid-solution-button').addEventListener('click', reveal);
  $('rapid-previous').addEventListener('click', () => { tick(); if (phase === 'paused' || $('rapid-session').hidden) return; save(); if (current > 0) { current--; render(true); } });
  $('rapid-next').addEventListener('click', () => { tick(); if (phase === 'paused' || $('rapid-session').hidden) return; save(); if (current < questions.length-1) { current++; render(true); } else finish(); });
  $('rapid-return').addEventListener('click', () => { $('rapid-result').hidden = true; $('rapid-session').hidden = false; current = Math.max(0, states.findIndex(s => s.first !== true)); render(true); });
  $('rapid-finish').addEventListener('click', () => { tick(); if (phase !== 'finished') finish(); });
  $('rapid-pause').addEventListener('click', () => { if (phase === 'paused') resume(); else pause(); });
  $('rapid-configure').addEventListener('click', configure);
  $('rapid-cancel-setup').addEventListener('click', () => { $('rapid-setup').hidden = true; $('rapid-work').hidden = false; if (configWasRunning) resume(); configWasRunning = false; if (phase === 'finished') showResult(); else render(true); });
  // Changer d'onglet ne suspend pas un compte a rebours. A la reprise, l'echeance fait foi.
  document.addEventListener('visibilitychange', tick); window.addEventListener('pageshow', tick);
  $('rapid-preview').addEventListener('click', () => { save(); buildSheet(); const sheet = $('rapid-worksheet'); sheet.hidden = !sheet.hidden; $('rapid-preview').setAttribute('aria-expanded',String(!sheet.hidden)); if (!sheet.hidden) sheet.scrollIntoView({block:'start',behavior:'auto'}); });
  $('rapid-print').addEventListener('click', () => { beforePrint(); window.print(); });
  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', () => { document.body.classList.remove('rapid-printing','rapid-print-answers'); printing = false; if (printWasRunning && phase === 'paused') resume(); printWasRunning = false; });
  refreshTopics(); durationControls(); setPhase('ready'); app.hidden = false; loading.hidden = true;
})();
