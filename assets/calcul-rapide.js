/* Interface de l'annexe. Aucun reseau, stockage, eval ou dependance. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), A=window.QuickMath;
  const app=$('rapid-app'), loading=$('rapid-loading');
  if(!app)return;
  if(!A){loading.textContent='La série interactive n’a pas pu se charger. Les méthodes et la série papier restent disponibles ci-dessous.';return;}
  const names={bases:'Bases générales',premiere:'Première STMG',terminale:'Terminale STMG',bac:'Bac Première · bases et chapitres de Première'};
  let questions=[],states=[],current=0,options={},series=0,finished=false;
  let elapsed=0,activeAt=null,clock=null;
  const urlSeed=new URLSearchParams(location.search).get('seed');
  const initialSeed=urlSeed&&/^\d{1,10}$/.test(urlSeed)?Number(urlSeed)>>>0:
    (window.crypto&&window.crypto.getRandomValues?window.crypto.getRandomValues(new Uint32Array(1))[0]:Date.now()>>>0);
  function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
  function timeText(ms){const s=Math.floor(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
  function milliseconds(){return elapsed+(activeAt===null?0:performance.now()-activeAt);}
  function tick(){$('rapid-time').textContent=timeText(milliseconds());}
  function pause(){if(activeAt!==null){elapsed+=performance.now()-activeAt;activeAt=null;}if(clock!==null){clearInterval(clock);clock=null;}tick();}
  function resume(){if(!questions.length||finished||document.hidden||!$('rapid-timer-enable').checked||activeAt!==null)return;activeAt=performance.now();clock=setInterval(tick,500);tick();}
  function countScore(){return states.filter(s=>s.first===true).length;}
  function progress(){
    $('rapid-progress-text').textContent=`Question ${current+1} sur ${questions.length} · ${countScore()} réussite(s) au premier essai / ${questions.length}`;
    $('rapid-progress').max=questions.length;$('rapid-progress').value=current+1;
  }
  function refreshTopics(){
    const select=$('rapid-topic'),old=select.value;
    const list=A.eligible({level:$('rapid-level').value,method:$('rapid-method').value});
    select.replaceChildren(new Option('Toutes les notions du parcours','all'));
    [...new Set(list.map(t=>t.topic))].forEach(key=>select.add(new Option(A.topics[key],key)));
    if([...select.options].some(o=>o.value===old))select.value=old;
  }
  function render(focus=false){
    const q=questions[current],s=states[current];if(!q)return;
    $('rapid-card').dataset.template=q.id;
    $('rapid-meta').textContent=`${names[q.level]} · ${A.topics[q.topic]} · ${q.method==='mental'?'Plutôt de tête':'Quelques lignes sur feuille'}`;
    $('rapid-question-title').textContent=q.prompt;
    const input=$('rapid-answer');input.value=s.value;input.readOnly=s.revealed;
    input.classList.toggle('is-correct',s.correct===true);
    input.classList.toggle('is-wrong',s.correct===false&&s.first!==null);
    input.setAttribute('aria-invalid',s.correct===false&&s.first!==null?'true':'false');
    $('rapid-unit').textContent=q.unit?`(en ${q.unit})`:'';
    $('rapid-check').disabled=s.revealed;
    $('rapid-feedback').textContent=s.message;
    $('rapid-feedback').className='rapid-feedback'+(s.message?(s.correct?' is-correct':' is-wrong'):'');
    $('rapid-hint').textContent=q.hint;$('rapid-hint').hidden=!s.hint;
    $('rapid-hint-button').setAttribute('aria-expanded',String(s.hint));
    const sol=$('rapid-solution');sol.replaceChildren(node('strong',`Réponse exacte : ${q.expected}${q.unit?' '+q.unit:''}`),node('p',q.solution));sol.hidden=!s.revealed;
    $('rapid-solution-button').setAttribute('aria-expanded',String(s.revealed));
    $('rapid-course-link').href='../'+q.course+'.html';
    $('rapid-course-link').textContent=`Revoir la leçon liée · ${A.topics[q.topic]} →`;
    $('rapid-previous').disabled=current===0;
    $('rapid-next').textContent=current===questions.length-1?'Voir mon bilan':'Suivante →';
    progress();if(focus)$('rapid-question-title').focus();
  }
  function save(){if(questions.length&&!states[current].revealed)states[current].value=$('rapid-answer').value;}
  function prepare(focus=true){
    try{
      const seed=(initialSeed+Math.imul(series,2654435761))>>>0;
      const nextOptions={level:$('rapid-level').value,method:$('rapid-method').value,topic:$('rapid-topic').value,count:Number($('rapid-count').value),seed};
      const next=A.session(nextOptions);
      if(!next.length)throw new Error('Aucune question pour ce choix. Choisis toutes les notions ou une autre façon de travailler.');
      pause();elapsed=0;finished=false;options=nextOptions;series++;questions=next;current=0;
      states=questions.map(()=>({value:'',first:null,correct:null,hint:false,revealed:false,message:''}));
      app.dataset.seed=String(seed);app.dataset.level=options.level;app.dataset.method=options.method;app.dataset.topic=options.topic;app.dataset.count=String(options.count);
      $('rapid-error').hidden=true;$('rapid-session').hidden=false;$('rapid-result').hidden=true;
      $('rapid-worksheet').hidden=true;$('rapid-preview').setAttribute('aria-expanded','false');$('rapid-print-answers').checked=false;
      const scope=$('rapid-scope');scope.classList.toggle('is-terminale',options.level==='terminale');
      scope.textContent=options.level==='terminale'?'Prolongement Terminale : ces questions ne sont pas des prérequis de l’épreuve anticipée de Première.':`${names[options.level]} : aucune notion propre à la Terminale dans cette série.`;
      render(focus);tick();resume();
    }catch(e){$('rapid-error').textContent=e.message||'La série ne peut pas être préparée.';$('rapid-error').hidden=false;}
  }
  function validate(event){
    event.preventDefault();save();const q=questions[current],s=states[current];if(!q||s.revealed)return;
    if(!A.parse(s.value,q.unit)){
      $('rapid-feedback').textContent='Écris un nombre ou une fraction valide, par exemple −3, 1,25 ou 2/3. Le dénominateur ne peut pas être nul.';
      $('rapid-feedback').className='rapid-feedback is-wrong';$('rapid-answer').setAttribute('aria-invalid','true');return;
    }
    const right=A.check(s.value,q);if(s.first===null)s.first=right;s.correct=right;
    s.message=right?(s.first?'Juste dès le premier essai. Explique aussi ta méthode sur feuille.':'Juste après un nouvel essai. La méthode progresse ; le score du premier essai reste inchangé.'):'Pas encore. Vérifie le signe et les étapes ; utilise une fraction si le résultat n’est pas un décimal fini.';
    render(false);
  }
  function reveal(){
    save();const s=states[current];if(s.first===null)s.first=false;
    s.revealed=true;s.message=s.first?'Correction consultée après une réponse juste.':'Correction affichée : aucun point ajouté. Relis la méthode avant la question suivante.';
    render(false);
  }
  function finish(){
    save();finished=true;pause();$('rapid-session').hidden=true;$('rapid-result').hidden=false;
    const unanswered=states.filter(s=>s.first===null).length,afterRetry=states.filter(s=>s.first===false&&s.correct&&!s.revealed).length;
    $('rapid-score').textContent=`${countScore()} / ${questions.length} réponses justes au premier essai.`;
    const topics=[...new Set(questions.filter((_,i)=>states[i].first!==true).map(q=>A.topics[q.topic]))];
    let text=topics.length?`À reprendre calmement : ${topics.join(', ')}.`:'Toutes les réponses sont justes au premier essai. Essaie une autre série ou explique les méthodes sans regarder.';
    if(unanswered)text+=` ${unanswered} question(s) sans réponse vérifiée ne rapportent pas de point.`;
    if(afterRetry)text+=` ${afterRetry} question(s) ont été réussies après un nouvel essai.`;
    if($('rapid-timer-enable').checked)text+=` Temps indicatif : ${timeText(milliseconds())}.`;
    $('rapid-review').textContent=text;$('rapid-result-title').focus();
  }
  function buildSheet(){
    const qlist=$('rapid-paper-questions'),alist=$('rapid-paper-answers');qlist.replaceChildren();alist.replaceChildren();
    $('rapid-sheet-meta').textContent=`${names[options.level]} · ${questions.length} questions · série ${options.seed}`;
    questions.forEach(q=>{
      const li=node('li');li.append(node('p',q.prompt+(q.unit?` Réponse en ${q.unit}.`:'')),node('div','Réponse et étapes :','rapid-blank'));qlist.append(li);
      const answer=node('li');answer.append(node('strong',`${q.expected}${q.unit?' '+q.unit:''}. `),node('span',q.solution));alist.append(answer);
    });
  }
  function beforePrint(){
    if(!questions.length)return;
    save();pause();buildSheet();document.body.classList.add('rapid-printing');
    const answers=$('rapid-print-answers').checked;document.body.classList.toggle('rapid-print-answers',answers);
    if(answers){
      states.forEach(s=>{if(s.first===null)s.first=false;s.revealed=true;s.message=s.first?'Corrigé imprimé après une réponse juste.':'Corrigé imprimé : aucun point ajouté.';});
      render(false);
      if(!$('rapid-result').hidden){$('rapid-score').textContent=`${countScore()} / ${questions.length} réponses justes au premier essai.`;}
    }
  }
  $('rapid-settings').addEventListener('submit',event=>{event.preventDefault();prepare(true);});
  $('rapid-level').addEventListener('change',refreshTopics);$('rapid-method').addEventListener('change',refreshTopics);
  $('rapid-answer-form').addEventListener('submit',validate);
  $('rapid-answer').addEventListener('input',()=>{save();$('rapid-answer').setAttribute('aria-invalid','false');});
  $('rapid-hint-button').addEventListener('click',()=>{save();states[current].hint=!states[current].hint;render(false);});
  $('rapid-solution-button').addEventListener('click',reveal);
  $('rapid-previous').addEventListener('click',()=>{save();if(current>0){current--;render(true);}});
  $('rapid-next').addEventListener('click',()=>{save();if(current<questions.length-1){current++;render(true);}else finish();});
  $('rapid-return').addEventListener('click',()=>{$('rapid-result').hidden=true;$('rapid-session').hidden=false;current=Math.max(0,states.findIndex(s=>s.first!==true));render(true);});
  $('rapid-timer-enable').addEventListener('change',()=>{$('rapid-timer').hidden=!$('rapid-timer-enable').checked;if($('rapid-timer-enable').checked)resume();else pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume();});
  $('rapid-preview').addEventListener('click',()=>{save();buildSheet();const sheet=$('rapid-worksheet');sheet.hidden=!sheet.hidden;$('rapid-preview').setAttribute('aria-expanded',String(!sheet.hidden));if(!sheet.hidden)sheet.scrollIntoView({block:'start',behavior:'auto'});});
  $('rapid-print').addEventListener('click',()=>{beforePrint();window.print();});
  window.addEventListener('beforeprint',beforePrint);
  window.addEventListener('afterprint',()=>{document.body.classList.remove('rapid-printing','rapid-print-answers');resume();});
  window.addEventListener('pagehide',pause);
  try{refreshTopics();prepare(false);app.hidden=false;loading.hidden=true;}
  catch(e){loading.textContent='La série interactive est indisponible. Utilise les méthodes et la série papier ci-dessous.';}
})();
