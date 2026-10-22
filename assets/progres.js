/* Local dashboard. JSON files are validated and rendered only with textContent. */
(() => {
  'use strict';
  const A=window.MathsAcquis;if(!A)return;
  const $=id=>document.getElementById(id),panel=$('progress-controls');if(!panel)return;
  const level=$('progress-level');level.value=new URLSearchParams(location.search).get('niveau')==='terminale'?'terminale':'premiere';
  const say=text=>{$('progress-message').textContent=text;};
  const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
  function draw(){
    const active=A.store.enabled;
    $('progress-state').textContent=active?'Suivi local activ\u00e9':'Le suivi est d\u00e9sactiv\u00e9';
    $('progress-enable').hidden=active;$('progress-disable').hidden=!active;$('progress-export').disabled=!active;
    const list=$('progress-list');list.replaceChildren();
    const items=A.store.all(level.value).filter(s=>s.last).sort((a,b)=>(a.due||Infinity)-(b.due||Infinity));
    const due=items.filter(s=>s.overdue);
    $('progress-overview').textContent=!active?'Tu peux utiliser toutes les ressources sans activer le suivi.':items.length?`${items.length} notion(s) observ\u00e9e(s), ${due.length} \u00e0 revoir maintenant. Il ne s'agit pas d'une note ni d'un diagnostic d\u00e9finitif.`:'Aucune observation pour le moment. Commence par le diagnostic ou un exercice.';
    $('progress-review').href='revisions.html?niveau='+level.value;
    $('progress-diagnostic').href='diagnostic.html?niveau='+level.value;
    for(const s of items){
      const item=node('article','', 'progress-card');
      item.append(node('h3',A.skills[s.skill].label));
      item.append(node('p',s.label,'progress-evidence'));
      item.append(node('p',`${s.independent} r\u00e9ussite(s) autonome(s) sur ${s.attempts} premi\u00e8re(s) tentative(s).`));
      item.append(node('p',s.overdue?'R\u00e9vision propos\u00e9e : maintenant.':'Prochaine reprise propos\u00e9e : '+new Date(s.due).toLocaleDateString('fr-FR')+'.'));
      const recurrent=Object.entries(s.errors).filter(([,n])=>n>=2).map(([key])=>A.errorLabels[key]);
      if(recurrent.length)item.append(node('p','Point \u00e0 v\u00e9rifier dans les prochains exercices : '+recurrent.join(', ')+'.'));
      const links=node('p','', 'action-row');
      for(const [label,href] of [['Revoir la le\u00e7on',s.course],['Exercices du chapitre',s.exercises]]){const a=node('a',label);a.href=href;links.append(a);}
      const review=node('a','R\u00e9vision cibl\u00e9e');review.href='revisions.html?niveau='+level.value+'&notion='+encodeURIComponent(s.skill);links.append(review);item.append(links);list.append(item);
    }
    if(!items.length)list.append(node('p','Tes prochains essais appara\u00eetront ici si le suivi est activ\u00e9. Une r\u00e9ponse r\u00e9v\u00e9l\u00e9e ou aid\u00e9e n\u2019est jamais compt\u00e9e comme une r\u00e9ussite autonome.'));
    if(A.store.error)say('Le stockage local est indisponible ou invalide. Les cours et exercices fonctionnent toujours. Tu peux exporter un autre fichier valide ou repartir de z\u00e9ro en activant le suivi.');
  }
  $('progress-enable').addEventListener('click',()=>{const ok=A.store.enable();draw();say(ok?'Suivi activ\u00e9. Seuls tes prochains essais seront conserv\u00e9s sur cet appareil.':'Enregistrement impossible dans ce navigateur. Aucun compte ni service distant ne sera utilis\u00e9.');});
  $('progress-disable').addEventListener('click',()=>{if(!window.confirm('Effacer tous les progr\u00e8s de ce site sur cet appareil et d\u00e9sactiver le suivi ?'))return;const ok=A.store.remove();draw();say(ok?'Tous les progr\u00e8s ont \u00e9t\u00e9 effac\u00e9s. Le suivi est d\u00e9sactiv\u00e9.':'La suppression a \u00e9chou\u00e9. Utilise les r\u00e9glages de stockage du navigateur.');});
  $('progress-export').addEventListener('click',()=>{const text=A.store.exportJSON();if(!text)return;const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='mes-progres-maths-stmg.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Export cr\u00e9\u00e9. Il peut contenir tes dates et r\u00e9sultats : garde-le pour toi.');});
  $('progress-import').addEventListener('change',async event=>{
    const input=event.target,file=input.files?.[0];if(!file)return;
    try{
      if(file.size>200000)throw new Error('Le fichier doit faire moins de 200 ko.');
      const text=await file.text(),data=A.store.inspectImport(text);
      if(!window.confirm(`Importer ${data.events.length} observation(s), remplacer les progr\u00e8s actuels et activer le suivi local ?`))return;
      if(!A.store.importJSON(text))throw new Error('Stockage local indisponible.');draw();say('Import termin\u00e9. Les observations de plus de 180 jours et les entr\u00e9es invalides sont ignor\u00e9es.');
    }catch(error){say(error.message);}finally{input.value='';}
  });
  level.addEventListener('change',draw);window.addEventListener('storage',e=>{if(e.key===A.KEY)draw();});
  panel.hidden=false;draw();
})();
