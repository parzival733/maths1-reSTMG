/* Evidence listener: existing exercise scores and correction engines stay independent. */
(() => {
  'use strict';
  const A=window.MathsAcquis;if(!A)return;
  const attempted=new WeakSet(),aided=new WeakSet();
  const status=document.querySelector('[data-local-status]');
  function refresh(){if(status)status.textContent=A.store.enabled?'Suivi local activ\u00e9 sur cet appareil.':'Aucun r\u00e9sultat conserv\u00e9. Le suivi local est facultatif.';}
  function notify(){refresh();window.dispatchEvent(new Event('maths:progress'));}
  document.addEventListener('maths:attempt',event=>{if(A.store.record(event.detail))notify();else refresh();});
  function record(form,outcome){
    if(attempted.has(form))return;attempted.add(form);
    const slide=form.closest('.exercise-block'),root=document.querySelector('[data-chapter]');
    if(!slide||!root)return;
    const skill=root.dataset.chapter;
    const statement=slide.querySelector('.exercise-statement');
    const variant=A.hash((statement?.textContent||'').replace(/\s+/g,' ').trim());
    if(A.store.record({skill,outcome,variant,template:skill+':'+slide.id,source:'chapitre',error:''}))notify();
  }
  document.addEventListener('toggle',event=>{
    const el=event.target;if(!el.open)return;
    const quiz=el.closest('.study-quiz');if(quiz){const f=quiz.querySelector('form');if(f)aided.add(f);}
    const slide=el.closest('.exercise-block');if(!slide)return;
    const form=slide.querySelector('.exercise-form');if(!form)return;
    if(el.matches('details.check'))record(form,'revealed');else aided.add(form);
  },true);
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const slide=button.closest('.exercise-block'),form=slide?.querySelector('.exercise-form');
    if(form && button.closest('.coaching-panel'))aided.add(form);
    // Reset does not create fresh evidence for an already seen concrete problem.
  },true);
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(form.matches('.exercise-form')&&window.ExerciseVariants){
      if(form.dataset.revealed==='true')return;
      const fields=[...form.querySelectorAll('[data-expect]')];if(!fields.length)return;
      const right=fields.every(c=>window.ExerciseVariants.matchesAnswer(c.value,c.dataset.expect,c.dataset.type||'text',c.dataset.tolerance,c.dataset.rounding));
      record(form,right?(aided.has(form)?'assisted':'independent'):'retry');
    }
    if(form.closest('.study-quiz')&&!attempted.has(form)){
      const quiz=form.closest('.study-quiz'),selected=form.querySelector('input:checked');if(!selected)return;
      attempted.add(form);const skill=document.body.dataset.course;if(!A.skills[skill])return;
      const helped=aided.has(form)||[...quiz.querySelectorAll('details')].some(d=>d.open);
      if(A.store.record({skill,outcome:selected.value===quiz.dataset.correct?(helped?'assisted':'independent'):'retry',source:'memoire',variant:A.hash(quiz.textContent),template:skill+':memoire:'+([...document.querySelectorAll('.study-quiz')].indexOf(quiz))}))notify();
    }
  },true);
  window.addEventListener('storage',e=>{if(e.key===A.KEY)notify();});
  refresh();
})();
