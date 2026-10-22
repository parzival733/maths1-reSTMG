/* A small bridge to the existing exact-arithmetic bank; no second correction engine. */
(function(root){
  'use strict';
  const Q=root.QuickMath||(typeof require==='function'?require('./calcul-rapide-data.js'):null);
  const P=root.MathsAcquis||(typeof require==='function'?require('./acquis.js'):null);
  function rng(seed){let x=(Number(seed)>>>0)||1;return(a,b)=>{x^=x<<13;x^=x>>>17;x^=x<<5;return a+(x>>>0)%(b-a+1);};}
  const extras=[
    {id:'r-population',level:'premiere',course:'cours/probabilites-conditionnelles',topic:'probabilites',fn:r=>{
      const a=40+10*r(0,3),b=10+5*r(0,3);return{prompt:`Parmi 100 clients, ${a} sont abonn\u00e9s. Parmi ces abonn\u00e9s, ${b} viennent \u00e0 v\u00e9lo. Quelle est la probabilit\u00e9 de venir \u00e0 v\u00e9lo sachant que le client est abonn\u00e9 ?`,expected:Q.fraction(b,a),hint:'Quelle population est impos\u00e9e par le mot \u00ab sachant \u00bb ?',solution:`La population de r\u00e9f\u00e9rence est celle des ${a} abonn\u00e9s. La probabilit\u00e9 est ${b}/${a} = ${Q.fraction(b,a)}, et non ${b}/100.`,traps:[{value:Q.fraction(b,100),code:'population-reference',message:`Tu as pris les 100 clients comme d\u00e9nominateur. Ici on se limite aux ${a} abonn\u00e9s.`}],ref:[b,a,'/']};}},
    {id:'r-boucle',level:'premiere',course:'cours/python-tableur',topic:'algebre',fn:r=>{
      const u=r(1,8),n=r(2,6),d=r(2,5);return{prompt:`On pose u = ${u}. On r\u00e9p\u00e8te ${n} fois l'instruction u = u + ${d}. Quelle est la valeur finale de u ?`,expected:String(u+n*d),hint:'Fais un tableau : valeur initiale puis une ligne par passage.',solution:`Chaque passage ajoute ${d}. Apr\u00e8s ${n} passages : u = ${u} + ${n} \u00d7 ${d} = ${u+n*d}.`,ref:[u,n,d,'*','+']};}},
    {id:'r-range',level:'premiere',course:'cours/python-tableur',topic:'algebre',fn:r=>{
      const n=r(3,8);return{prompt:`Python : s = 0 ; puis, pour k dans range(1, ${n+1}), on fait s = s + k. Quelle est la valeur finale de s ?`,expected:String(n*(n+1)/2),hint:'La borne de fin de range est exclue. Commence par la liste des valeurs de k.',solution:`On additionne 1, 2, ..., ${n}, soit ${n*(n+1)/2}. Ce n'est pas seulement le dernier k.`,ref:[n,n+1,'*',2,'/']};}},
    {id:'r-contre-exemple',level:'premiere',course:'cours/logique',topic:'algebre',fn:r=>{
      const a=r(2,8);return{prompt:`\u00ab Tout nombre dont le carr\u00e9 vaut ${a*a} est positif. \u00bb Donne un nombre qui contredit cette affirmation.`,expected:String(-a),hint:'Teste aussi l\u2019oppos\u00e9 du nombre positif.',solution:`${-a} est n\u00e9gatif et (${-a})\u00b2 = ${a*a}. Un seul contre-exemple suffit \u00e0 invalider une affirmation universelle.`,ref:[0,a,'-']};}},
    {id:'r-bernoulli',level:'premiere',course:'cours/bernoulli',topic:'probabilites',fn:r=>{
      const d=r(2,5);return{prompt:`Deux essais ind\u00e9pendants ont chacun une probabilit\u00e9 de succ\u00e8s 1/${d}. Quelle est la probabilit\u00e9 de deux succ\u00e8s ?`,expected:Q.fraction(1,d*d),hint:'Suis le chemin succ\u00e8s, puis succ\u00e8s.',solution:`L'ind\u00e9pendance permet de multiplier : (1/${d}) \u00d7 (1/${d}) = ${Q.fraction(1,d*d)}.`,ref:[1,d,'/',1,d,'/','*']};}},
    {id:'r-t-conditions',level:'terminale',course:'terminale/cours/t-conditionnelles',topic:'probabilites',fn:r=>{
      const a=r(2,7);return{prompt:`A et non A forment une partition. P(A) = ${a}/10, P(D sachant A) = 1/2 et P(D sachant non A) = 1/5. Calcule P(D).`,expected:Q.fraction(3*a+20,100),hint:'Additionne les probabilit\u00e9s des deux chemins qui aboutissent \u00e0 D.',solution:`P(D) = (${a}/10)(1/2) + (${10-a}/10)(1/5) = ${Q.fraction(3*a+20,100)}.`,ref:[a,10,'/',1,2,'/','*',10-a,10,'/',1,5,'/','*','+']};}},
    {id:'r-t-stats',level:'terminale',course:'terminale/cours/t-statistiques',topic:'statistiques',fn:r=>{
      const x=r(2,5),a=r(1,4),b=r(1,5);return{prompt:`On pose z = x\u00b2. L'ajustement est y = ${a}z + ${b}. Estime y pour x = ${x}.`,expected:String(a*x*x+b),hint:'Calcule z avant d\u2019utiliser la droite.',solution:`z = ${x*x}, puis y = ${a} \u00d7 ${x*x} + ${b} = ${a*x*x+b}.`,ref:[x,2,'pow',a,'*',b,'+']};}},
    {id:'r-t-esperance',level:'terminale',course:'terminale/cours/t-variables',topic:'probabilites',fn:r=>{
      const a=r(1,5);return{prompt:`X vaut ${-a}, 0 ou ${3*a}, avec les probabilit\u00e9s 1/4, 1/2 et 1/4. Calcule E(X).`,expected:Q.fraction(a,2),hint:'Multiplie chaque valeur par sa probabilit\u00e9, puis additionne.',solution:`E(X) = (${-a})(1/4) + 0 + (${3*a})(1/4) = ${Q.fraction(a,2)}.`,ref:[-a,4,'/',3*a,4,'/','+']};}},
    {id:'r-t-outils',level:'terminale',course:'terminale/cours/t-outils',topic:'algebre',fn:r=>{
      const a=r(2,8),n=r(2,5);return{prompt:`On pose u = ${a} et s = 0. On r\u00e9p\u00e8te ${n} fois : d'abord s = s + u, puis u = 2u. Quelle est la valeur finale de s ?`,expected:String(a*(2**n-1)),hint:'Note la valeur ajout\u00e9e AVANT chaque doublement.',solution:`s = ${Array.from({length:n},(_,i)=>a*2**i).join(' + ')} = ${a*(2**n-1)}. Le dernier u, calcul\u00e9 apr\u00e8s la derni\u00e8re addition, n'est pas ajout\u00e9.`,ref:[a,2,n,'pow',1,'-','*']};}}
  ];
  const templates=[...Q.templates,...extras.map(({fn,...t})=>({...t,method:'feuille'}))].map(t=>({...t,skill:P.skillFor(t)}));
  function generate(id,seed){
    const extra=extras.find(t=>t.id===id),q=extra?{...extra.fn(rng(seed)),id:extra.id,level:extra.level,course:extra.course,topic:extra.topic,method:'feuille',unit:''}:Q.generate(id,seed);
    q.skill=P.skillFor(q);q.variant=P.hash(q.prompt);q.seed=seed;
    if(!P.skills[q.skill]||!Q.parse(q.expected))throw new Error('Question invalide.');
    if(q.id==='p-successives')q.traps=[{value:'0',code:'taux-addition',message:'Tu sembles avoir additionn\u00e9 les deux taux oppos\u00e9s. Multiplie les coefficients : les deux pourcentages ne portent pas sur la m\u00eame valeur.'}];
    return q;
  }
  function diagnostic(level,seed){
    const ids=['g-fraction-denominateur','g-fraction-quotient','p-retour','p-successives','p-image','p-antecedent',...(level==='terminale'?['p-arithmetique','p-arithmetique']:['g-moyenne','p-moyenne-ponderee']),'r-population','p-conditionnelle'];
    return ids.map((id,i)=>generate(id,(seed+i*7919)>>>0));
  }
  function session({level='premiere',skills=[],count=10,seed=1}={}){
    if(!['premiere','terminale'].includes(level)||!Number.isInteger(count)||count<1||count>20)throw new Error('S\u00e9rie invalide.');
    const r=rng(seed),pool=templates.filter(t=>level==='terminale'||t.level!=='terminale'),target=pool.filter(t=>skills.includes(t.skill));
    const questions=[],seen=new Set();
    for(let i=0;i<count;i++){
      const deck=target.length&&i<Math.ceil(count*.7)?target:pool;let q;
      for(let j=0;j<80;j++){const t=deck[r(0,deck.length-1)];q=generate(t.id,r(1,2147483647));if(!seen.has(q.prompt))break;}
      seen.add(q.prompt);questions.push(q);
    }
    return questions;
  }
  function mistake(value,q){return(q.traps||[]).find(t=>Q.check(value,{expected:t.value,unit:q.unit}))||null;}
  const api={templates,generate,diagnostic,session,mistake};root.ParcoursBank=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
