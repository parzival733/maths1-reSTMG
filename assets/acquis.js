/* Optional, local-only learning evidence. No account, network call or raw answer. */
(function(root) {
  'use strict';
  const KEY='maths-stmgdls:acquis:v1',DAY=86400000,LIMIT=500,RETENTION=180*DAY;
  const names={calcul:'Calcul et proportions',fractions:'Fractions',evolutions:'Pourcentages et \u00e9volutions',fonctions:'Fonctions et droites','second-degre':'Second degr\u00e9',suites:'Suites : premiers rep\u00e8res','suites-arithmetiques':'Suites arithm\u00e9tiques','suites-geometriques':'Suites g\u00e9om\u00e9triques',derivees:'Tangentes et nombre d\u00e9riv\u00e9',variations:'D\u00e9riv\u00e9es et variations','statistiques-descriptives':'Statistiques descriptives','statistiques-deux-variables':'Statistiques \u00e0 deux variables','probabilites-conditionnelles':'Probabilit\u00e9s conditionnelles',bernoulli:'R\u00e9p\u00e9titions de Bernoulli','variables-aleatoires':'Esp\u00e9rance et simulation',logique:'Raisonnement et logique','python-tableur':'Algorithmique et tableur','t-suites':'Terminale : suites et sommes','t-exponentielles':'Terminale : exponentielles','t-logarithme':'Terminale : logarithme','t-inverse':'Terminale : inverse et optimisation','t-statistiques':'Terminale : ajustements','t-conditionnelles':'Terminale : conditionnement','t-binomiale':'Terminale : loi binomiale','t-variables':'Terminale : esp\u00e9rance','t-outils':'Terminale : outils num\u00e9riques'};
  const skills=Object.fromEntries(Object.entries(names).map(([id,label])=>[id,Object.freeze({id,label,level:id.startsWith('t-')?'terminale':'premiere',course:(id.startsWith('t-')?'terminale/':'')+'cours/'+(id==='fractions'?'calcul':id)+'.html',exercises:(id.startsWith('t-')?'terminale/':'')+'exercices/'+(id==='fractions'?'calcul':id)+'.html'})]));
  const outcomes=new Set(['independent','assisted','retry','revealed','skip']);
  const sources=new Set(['chapitre','calcul','diagnostic','revision','memoire']);
  function hash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
  function skillFor(q){if(q.topic==='fractions'&&q.level!=='terminale')return'fractions';return String(q.course||'').split('/').pop().replace(/\.html$/,'');}
  function validateEvent(e,now){
    if(!e||typeof e!=='object'||!Object.hasOwn(skills,e.skill)||!outcomes.has(e.outcome)||!sources.has(e.source))return null;
    if(!Number.isSafeInteger(e.at)||e.at<now-RETENTION||e.at>now+300000)return null;
    if(typeof e.variant!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(e.variant))return null;
    if(typeof e.template!=='string'||!/^[a-zA-Z0-9:_-]{1,80}$/.test(e.template))return null;
    const error=['taux-addition','population-reference','image-antecedent',''].includes(e.error)?e.error:'';
    return{skill:e.skill,outcome:e.outcome,source:e.source,at:e.at,variant:e.variant,template:e.template,error};
  }
  function clean(raw,now){
    if(!raw||raw.version!==1||raw.enabled!==true||!Array.isArray(raw.events)||raw.events.length>LIMIT)return null;
    const events=raw.events.map(e=>validateEvent(e,now)).filter(Boolean).sort((a,b)=>a.at-b.at);
    return{version:1,enabled:true,events};
  }
  function createStore(storage,clock=()=>Date.now()){
    let error='';
    function read(){try{const txt=storage&&storage.getItem(KEY);if(!txt)return null;if(txt.length>200000){error='invalid';return null;}const raw=JSON.parse(txt),value=clean(raw,clock());if(!value)error='invalid';else if(value.events.length!==raw.events.length)write(value);return value;}catch(_){error='unavailable';return null;}}
    function write(data){try{if(!storage)throw new Error();storage.setItem(KEY,JSON.stringify(data));error='';return true;}catch(_){error='unavailable';return false;}}
    function enable(){return write(read()||{version:1,enabled:true,events:[]});}
    function remove(){try{if(!storage)throw new Error();storage.removeItem(KEY);error='';return true;}catch(_){error='unavailable';return false;}}
    function record(input){
      const data=read();if(!data)return false;const e=validateEvent({...input,at:clock()},clock());if(!e)return false;
      // Rechecking the same concrete problem in 24 hours is not new evidence.
      if(data.events.some(p=>p.skill===e.skill&&p.variant===e.variant&&e.at-p.at<DAY))return false;
      data.events.push(e);data.events=data.events.slice(-LIMIT);return write(data);
    }
    function summary(skill,now=clock()){
      const events=(read()?.events||[]).filter(e=>e.skill===skill&&e.at<=now).sort((a,b)=>a.at-b.at);
      let stage=0,anchor=null,seen=new Set();
      for(const e of events){
        if(e.outcome!=='independent'){stage=0;anchor=e;seen=new Set();continue;}
        if(stage===0){stage=1;anchor=e;seen.add(e.variant);}
        else if(e.at-anchor.at>=2*DAY&&!seen.has(e.variant)){stage=Math.min(3,stage+1);anchor=e;seen.add(e.variant);}
      }
      const last=events.at(-1)||null,interval=stage===0?1:stage===1?2:stage===2?7:21,due=anchor?anchor.at+interval*DAY:null;
      const label=!last?'Pas encore observ\u00e9':last.outcome==='assisted'?'\u00c0 refaire sans aide':stage===0?'\u00c0 reprendre':stage===1?'R\u00e9ussite r\u00e9cente':stage===2?'Revu \u00e0 distance':'R\u00e9ussites espac\u00e9es';
      const errors={};for(const e of events)if(e.error)errors[e.error]=(errors[e.error]||0)+1;
      return{skill,label,stage,last,due,overdue:due!==null&&due<=now,attempts:events.length,independent:events.filter(e=>e.outcome==='independent').length,errors};
    }
    function all(level='premiere'){return Object.values(skills).filter(s=>level==='terminale'||s.level==='premiere').map(s=>({...s,...summary(s.id)}));}
    function exportJSON(){const data=read();return data?JSON.stringify(data,null,2):null;}
    function inspectImport(text){
      if(typeof text!=='string'||text.length>200000)throw new Error('Fichier trop volumineux (200 ko maximum).');
      let raw;try{raw=JSON.parse(text);}catch(_){throw new Error('Ce fichier n\u2019est pas un JSON valide.');}
      const data=clean(raw,clock());if(!data)throw new Error('Format ou version non pris en charge. Aucun changement effectu\u00e9.');return data;
    }
    function importJSON(text){return write(inspectImport(text));}
    return{read,enable,remove,record,summary,all,exportJSON,inspectImport,importJSON,get error(){return error;},get enabled(){return!!read();}};
  }
  let storage=null;try{storage=root.localStorage;}catch(_){}
  const api={KEY,DAY,LIMIT,RETENTION,skills:Object.freeze(skills),hash,skillFor,createStore,store:createStore(storage)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MathsAcquis=api;
})(typeof window!=='undefined'?window:globalThis);
