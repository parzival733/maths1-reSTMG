/* Optional timer and deliberate printing of answers. No grading or stored drafts. */
(() => {
 'use strict';const $=id=>document.getElementById(id),T=window.QuickCountdown;
 let clock=null,timer=T?new T():null,phase='ready',printing=false,resumeAfterPrint=false,previousDetails=[];
 const text=ms=>{const sec=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');};
 function tick(){if(!timer)return;$('exam-clock').textContent=text(timer.left());if(phase==='running'&&timer.left()<=0){timer.stop();phase='finished';clearInterval(clock);$('exam-pause').hidden=true;$('exam-stop').hidden=true;$('exam-status').textContent='Temps \u00e9coul\u00e9. Termine ta phrase, puis compare ta copie au corrig\u00e9 et au bar\u00e8me. Aucune note automatique.';}}
 function pause(){if(phase!=='running')return;tick();if(phase!=='running')return;timer.pause();clearInterval(clock);phase='paused';$('exam-pause').textContent='Reprendre';$('exam-status').textContent='Chrono en pause. Les questions sur feuille restent accessibles.';}
 function resume(){if(phase!=='paused')return;timer.resume();phase='running';$('exam-pause').textContent='Pause';$('exam-status').textContent='Compte \u00e0 rebours repris.';clock=setInterval(tick,250);tick();}
 if(timer){document.querySelector('.exam-timer-ui').hidden=false;
 $('exam-start').addEventListener('click',()=>{const minutes=Number($('exam-minutes').value);if(!Number.isInteger(minutes)||minutes<15||minutes>240){$('exam-status').textContent='Choisis une dur\u00e9e enti\u00e8re entre 15 et 240 minutes.';return;}if(['running','paused'].includes(phase)&&!confirm('Recommencer le chrono ?'))return;clearInterval(clock);timer.start(minutes*60000);phase='running';$('exam-pause').hidden=false;$('exam-stop').hidden=false;$('exam-pause').textContent='Pause';$('exam-status').textContent='Le chrono est lanc\u00e9. Changer d\u2019onglet ne le suspend pas.';clock=setInterval(tick,250);tick();});
 $('exam-pause').addEventListener('click',()=>phase==='paused'?resume():pause());
 $('exam-stop').addEventListener('click',()=>{tick();timer.stop();clearInterval(clock);phase='finished';$('exam-pause').hidden=true;$('exam-stop').hidden=true;$('exam-status').textContent='Chrono arr\u00eat\u00e9. Relis ta copie avant le corrig\u00e9.';});document.addEventListener('visibilitychange',tick);}
 function before(){if(printing)return;printing=true;resumeAfterPrint=phase==='running';if(resumeAfterPrint)pause();const include=$('exam-include-answers').checked;document.body.classList.toggle('exam-print-answers',include);previousDetails=[...document.querySelectorAll('.exam-correction')].map(d=>[d,d.open]);if(include)previousDetails.forEach(([d])=>d.open=true);}
 function after(){document.body.classList.remove('exam-print-answers');previousDetails.forEach(([d,open])=>d.open=open);printing=false;if(resumeAfterPrint)resume();resumeAfterPrint=false;}
 document.querySelectorAll('[data-print-exam]').forEach(b=>b.addEventListener('click',()=>{before();window.print();}));window.addEventListener('beforeprint',before);window.addEventListener('afterprint',after);
})();
