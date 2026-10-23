/* Direct, optional progress access. No redirect and no storage write. */
(() => {
  'use strict';
  const progress=document.getElementById('mes-progres');
  function reveal(){
    if(progress && location.hash==='#mes-progres'){
      progress.open=true;
      progress.scrollIntoView({block:'start',behavior:'instant'});
    }
  }
  window.addEventListener('hashchange',reveal);
  document.addEventListener('click',event=>{
    const a=event.target.closest('a');
    if(!a||!progress)return;
    const u=new URL(a.href,location.href);
    if(u.origin===location.origin && u.pathname===location.pathname && u.hash==='#mes-progres'){
      progress.open=true;
      if(location.hash==='#mes-progres')progress.scrollIntoView({block:'start',behavior:'instant'});
    }
  });
  reveal();
})();
/* Keep the selected school level when leaving a diagnostic or a revision. */
(() => {
  'use strict';
  if(!document.querySelector('[data-return-exercises]'))return;
  const root=new URL('../',document.currentScript.src);
  const setLinks=()=>{
    const level=document.getElementById('practice-level')||document.getElementById('progress-level');
    const terminale=(level?.value||new URLSearchParams(location.search).get('niveau'))==='terminale';
    const catalogue=new URL((terminale?'terminale/':'')+'exercices.html',root);
    for(const link of document.querySelectorAll('a[href]')){
      const url=new URL(link.href,location.href);
      if(link.hasAttribute('data-return-exercises') || (url.origin===root.origin && url.hash==='#mes-progres')){
        link.href=catalogue.href+(url.hash==='#mes-progres'?'#mes-progres':'');
      }
      if(link.closest('.main-nav')&&link.textContent.trim()==='Exercices')link.href=catalogue.href;
    }
  };
  document.addEventListener('change',e=>{if(['practice-level','progress-level'].includes(e.target.id))setLinks();});
  setLinks();
})();
