/* Diagnostic and spaced practice. Optional storage is separate from the practice UI. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),app=$('practice-app'),B=window.ParcoursBank,A=window.MathsAcquis,Q=window.QuickMath;
  if(!app||!B||!A||!Q)return;
  const diagnostic=app.dataset.mode==='diagnostic';
  const params=new URLSearchParams(location.search),level=$('practice-level');
  level.value=params.get('niveau')==='terminale'?'terminale':'premiere';
  let questions=[],states=[],current=0,finished=false,series=0;
  const seed=()=>{if(window.crypto?.getRandomValues)return crypto.getRandomValues(new Uint32Array(1))[0];return Date.now()>>>0;};
  const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
  const methods={fractions:'Pour additionner, mets au m\u00eame d\u00e9nominateur. Pour diviser, multiplie par la fraction inverse.',evolutions:'Traduis chaque taux par un coefficient. Multiplie pour des \u00e9volutions successives ; divise pour retrouver la valeur initiale.',fonctions:'Une image se calcule en rempla\u00e7ant x. Un ant\u00e9c\u00e9dent se cherche en r\u00e9solvant une \u00e9quation.','probabilites-conditionnelles':'Rep\u00e8re la population de r\u00e9f\u00e9rence. Multiplie le long d\u2019un chemin ; additionne des chemins incompatibles.'};
  function options(){
    const select=$('practice-skill');if(!select)return;
    const previous=select.value||params.get('notion');select.replaceChildren(new Option('Mes priorit\u00e9s puis un m\u00e9lange','auto'));
    const available=[...new Set(B.templates.filter(t=>level.value==='terminale'||t.level!=='terminale').map(t=>t.skill))];
    available.forEach(key=>select.add(new Option(A.skills[key].label,key)));
    if(available.includes(previous))select.value=previous;
  }
  function fresh(){return{value:'',first:null,correct:null,aided:false,revealed:false,recorded:false,error:'',message:''};}
  function save(){if(questions.length&&!finished&&!states[current].revealed)states[current].value=$('practice-answer').value;}
  function record(i,outcome){
    const q=questions[i],s=states[i];if(s.recorded)return;s.recorded=true;
    A.store.record({skill:q.skill,source:diagnostic?'diagnostic':'revision',template:q.id,variant:q.variant,outcome,error:s.error});
  }
  function render(focus=true){
    const q=questions[current],s=states[current];
    $('practice-counter').textContent=`Question ${current+1} sur ${questions.length}`;
    $('practice-title').textContent=q.prompt;$('practice-skill-name').textContent=A.skills[q.skill].label;
    $('practice-answer').value=s.value;$('practice-answer').readOnly=s.revealed||finished;
    $('practice-unit').textContent=q.unit?'R\u00e9ponse en '+q.unit+'.':'';
    $('practice-feedback').textContent=s.message;
    $('practice-feedback').className=s.correct?'practice-feedback success':'practice-feedback';
    $('practice-answer').setAttribute('aria-invalid',String(s.correct===false));
    $('practice-previous').disabled=current===0;
    $('practice-next').textContent=current===questions.length-1?'Voir mon bilan':'Question suivante';
    $('practice-check').hidden=diagnostic;$('practice-check').disabled=s.revealed||finished;
    $('practice-helpers').hidden=diagnostic;
    $('practice-hint-text').hidden=true;$('practice-method-text').hidden=true;
    $('practice-hint').setAttribute('aria-expanded','false');$('practice-method').setAttribute('aria-expanded','false');
    $('practice-solution').hidden=!s.revealed;
    $('practice-solution').replaceChildren(node('strong','R\u00e9ponse : '+q.expected+(q.unit?' '+q.unit:'')),node('p',q.solution));
    $('practice-course').href=q.course+'.html';$('practice-course').textContent='Revoir la le\u00e7on';
    $('practice-equivalent').hidden=diagnostic||(!s.revealed&&s.first===null);
    if(focus)$('practice-title').focus();
  }
  function start(event){
    event.preventDefault();
    const focus=$('practice-skill')?.value,priority=focus&&focus!=='auto'?[focus]:A.store.all(level.value).filter(s=>s.overdue||s.last&&s.stage===0).map(s=>s.skill);
    questions=diagnostic?B.diagnostic(level.value,seed()):B.session({level:level.value,skills:priority,count:Number($('practice-count').value),seed:seed()});
    states=questions.map(fresh);current=0;finished=false;series++;
    $('practice-setup').hidden=true;$('practice-work').hidden=false;$('practice-result').hidden=true;
    $('practice-context').textContent=diagnostic?'Pas de note d\u00e9finitive : deux questions par comp\u00e9tence de base. Tu peux passer une question.':priority.length?'Environ 70 % de questions sur les priorit\u00e9s disponibles, puis un m\u00e9lange. Les chapitres non couverts par cette banque restent accessibles dans Mes progr\u00e8s.':'Un m\u00e9lange de notions pour retrouver la bonne m\u00e9thode. Les r\u00e9visions sont facultatives.';
    render();
  }
  function validate(event){
    event.preventDefault();if(finished)return;save();if(diagnostic){next();return;}
    const q=questions[current],s=states[current];if(s.revealed)return;
    if(!Q.parse(s.value,q.unit)){$('practice-feedback').textContent='Entre un nombre ou une fraction valide (par exemple -3, 1,25 ou 2/3).';$('practice-answer').setAttribute('aria-invalid','true');return;}
    const right=Q.check(s.value,q),trap=B.mistake(s.value,q);s.correct=right;
    if(s.first===null){s.first=right;s.error=trap?.code||'';record(current,right?(s.aided?'assisted':'independent'):'retry');}
    s.message=right?(s.aided?'Juste avec une aide. Reviens un autre jour sans regarder la m\u00e9thode.':s.first?'Juste au premier essai. Explique la m\u00e9thode avec tes mots.':'Juste apr\u00e8s reprise. Ce progr\u00e8s ne remplace pas le premier essai enregistr\u00e9.'):(trap?.message||'Pas encore. V\u00e9rifie le signe, les unit\u00e9s et les \u00e9tapes ; utilise une fraction exacte si n\u00e9cessaire.');
    render(false);
  }
  function next(){save();if(current<questions.length-1){current++;render();}else finish();}
  function finish(){
    save();finished=true;
    questions.forEach((q,i)=>{
      const s=states[i];if(s.first!==null)return;
      if(Q.parse(s.value,q.unit)){s.first=s.correct=Q.check(s.value,q);s.error=B.mistake(s.value,q)?.code||'';record(i,s.first?(s.aided?'assisted':'independent'):'retry');}
      else if(diagnostic){s.first=false;record(i,'skip');}
    });
    $('practice-work').hidden=true;$('practice-result').hidden=false;
    const results=$('practice-results');results.replaceChildren();
    const groups=[...new Set(questions.map(q=>q.skill))];
    groups.forEach(skill=>{
      const indices=questions.map((q,i)=>q.skill===skill?i:-1).filter(i=>i>=0),right=indices.filter(i=>states[i].first===true&&!states[i].aided).length;
      const card=node('article','');card.className='progress-card';card.append(node('h3',A.skills[skill].label));
      card.append(node('p',`${right}/${indices.length} r\u00e9ponse(s) juste(s) sans aide au premier essai.`));
      card.append(node('p',right===indices.length?'Bien engag\u00e9 : \u00e0 v\u00e9rifier avec d\u2019autres questions, un autre jour.':right?'Une m\u00e9thode \u00e0 reprendre, sans repartir de z\u00e9ro.':'Revois l\u2019exemple guid\u00e9 avant une nouvelle s\u00e9rie.'));
      const links=node('p','');links.className='action-row';
      for(const [label,href]of[['Le\u00e7on',A.skills[skill].course],['Exercices',A.skills[skill].exercises],['Reprise cibl\u00e9e','revisions.html?niveau='+level.value+'&notion='+skill]]){const a=node('a',label);a.href=href;links.append(a);}card.append(links);results.append(card);
    });
    const details=$('practice-corrections');details.replaceChildren();
    questions.forEach((q,i)=>{const d=node('details',''),sum=node('summary',`${i+1}. ${q.prompt}`);d.append(sum,node('p',states[i].value?'Ta r\u00e9ponse : '+states[i].value:'Question sans r\u00e9ponse.'),node('p','R\u00e9ponse : '+q.expected+(q.unit?' '+q.unit:'')),node('p',q.solution));details.append(d);});
    $('practice-save-note').textContent=A.store.enabled?'Ces observations sont enregistr\u00e9es uniquement sur cet appareil. Consulte Mes progr\u00e8s pour les reprises propos\u00e9es.':'Ce bilan reste dans cette page uniquement. Active le suivi local avant une prochaine s\u00e9ance pour conserver tes futurs r\u00e9sultats.';
    $('practice-result-title').focus();
  }
  $('practice-settings').addEventListener('submit',start);$('practice-form').addEventListener('submit',validate);
  $('practice-next').addEventListener('click',next);$('practice-previous').addEventListener('click',()=>{save();if(current>0){current--;render();}});
  $('practice-skip').addEventListener('click',()=>{states[current].value='';$('practice-answer').value='';if(!diagnostic)record(current,'skip');next();});
  $('practice-hint').addEventListener('click',()=>{save();states[current].aided=true;$('practice-hint-text').textContent=questions[current].hint;$('practice-hint-text').hidden=false;$('practice-hint').setAttribute('aria-expanded','true');});
  $('practice-method').addEventListener('click',()=>{save();states[current].aided=true;$('practice-method-text').textContent=methods[questions[current].skill]||'Rep\u00e8re les donn\u00e9es, choisis la formule du cours et remplace les valeurs en gardant les parenth\u00e8ses. Contr\u00f4le le signe et les unit\u00e9s.';$('practice-method-text').hidden=false;$('practice-method').setAttribute('aria-expanded','true');});
  $('practice-reveal').addEventListener('click',()=>{save();const s=states[current];if(s.first===null){s.first=false;record(current,'revealed');}s.revealed=true;s.message='Correction affich\u00e9e : elle ne compte pas comme r\u00e9ussite autonome.';render(false);});
  $('practice-equivalent').addEventListener('click',()=>{const old=questions[current];let q;for(let n=0;n<40;n++){q=B.generate(old.id,seed());if(q.prompt!==old.prompt)break;}questions[current]=q;states[current]=fresh();render();});
  $('practice-again').addEventListener('click',()=>{$('practice-setup').hidden=false;$('practice-result').hidden=true;$('practice-start').focus();});
  $('practice-stop').addEventListener('click',()=>{if(window.confirm('Terminer maintenant et consulter le bilan des r\u00e9ponses saisies ?'))finish();});
  level.addEventListener('change',options);options();app.hidden=false;$('practice-loading').hidden=true;
})();
