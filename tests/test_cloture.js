'use strict';
/* Exhaustive finite parameter cycles plus semantic domain contracts.
   Validation of declared constraints is not a universal theorem about prose. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const B=require('../assets/parcours-data.js'),Q=require('../assets/calcul-rapide-data.js'),A=require('../assets/acquis.js');
let traps=0;const codes=new Set();
for(const id of Object.keys(A.skills))assert.ok(B.templates.some(t=>t.skill===id),'unrepresented skill '+id);
for(const t of B.templates)for(let seed=0;seed<160;seed++){
 const q=B.generate(t.id,seed);
 assert.equal(B.mistake(q.expected,q),null,'a correct answer must never trigger a diagnosis');
 for(const trap of q.traps||[]){assert.ok(A.errorLabels[trap.code],trap.code);assert.equal(Q.check(trap.value,q),false);assert.ok(B.mistake(trap.value,q));codes.add(trap.code);traps++;}
}
assert.ok(codes.size>=12);
const ctx=vm.createContext({window:{},console});
for(const f of ['exercices-variants.js',...fs.readdirSync('assets').filter(n=>/^variants-.*\.js$/.test(n)),'terminale-exercices.js'])vm.runInContext(fs.readFileSync('assets/'+f,'utf8'),ctx);
const V=ctx.window.ExerciseVariants;
const first=fs.readdirSync('exercices').filter(x=>x.endsWith('.html')).map(x=>x.slice(0,-5));
const clean=s=>String(s).replace(/<[^>]*>/g,' ').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/[\u2212\u2013]/g,'-');
function domainCheck(q,{lo=-Infinity,hi=Infinity,openLo=false,openHi=false,nonzero=false,answerIndices=[]}={}){
 const inside=x=>Number.isFinite(x)&&(!nonzero||x!==0)&&(openLo?x>lo:x>=lo)&&(openHi?x<hi:x<=hi);
 let checked=0;
 for(const f of q.fields){
  const text=clean(f.label),m=text.match(/(?:\b[fgphqRCB](?:\u2032|')?\(\s*|\bx\s*=\s*)(-?\d+(?:[.,]\d+)?)/);
  if(m){assert.ok(inside(Number(m[1].replace(',','.'))),JSON.stringify({label:f.label,lo,hi,nonzero}));checked++;}
 }
 for(const i of answerIndices){assert.ok(inside(Number(q.fields[i].answer)),q.fields[i].label);checked++;}
 return checked;
}
function contract(slug,i,cycle){
 const k=2+cycle%24,c=1+(cycle-1)%24;
 if(slug==='fonctions'&&i===6)return{lo:0,hi:k+5,answerIndices:[1]};
 if(slug==='fonctions'&&i===7)return{lo:0,openLo:true};
 if(slug==='second-degre'&&i===5)return{lo:0,hi:2*(k+3),answerIndices:[0,2,3]};
 if(slug==='second-degre'&&i===7)return{lo:0,hi:k+6};
 if(slug==='variations'&&i===3)return{lo:0,hi:2*(k+3),answerIndices:[2]};
 if(slug==='variations'&&i===4){const d=1+k%3;return{lo:-d-1,hi:d+1,answerIndices:[0,1]};}
 if(slug==='variations'&&i===6)return{lo:0};
 if(slug==='variations'&&i===7)return{lo:0,hi:2*(k+2),answerIndices:[2]};
 if(slug==='logique'&&i===6)return{lo:-k-3,hi:k+3};
 if(slug==='t-inverse')return i===1||i===3||i===5?{lo:0,openLo:true,answerIndices:i===3?[0]:[]}:{nonzero:true};
 return null;
}
let models=0,variants=0,coordinates=0;
for(const slug of [...first,...ctx.window.TerminaleExercises.slugs])for(let i=0;i<(slug.startsWith('t-')?6:slug==='fonctions'?9:8);i++){
 models++;
 for(let cycle=1;cycle<=24;cycle++){
  const q=V.generate(slug,i,cycle,{}),later=V.generate(slug,i,cycle+24,{});
  assert.equal(JSON.stringify(q),JSON.stringify(later),'cycle does not cover model '+slug+'/'+i);
  for(const f of q.fields){assert.equal(V.matchesAnswer(f.answer,f.answer,f.options?'text':f.type||'number',f.tolerance,f.rounding),true);}
  const d=contract(slug,i,cycle);if(d)coordinates+=domainCheck(q,d);
  // Every explicitly bounded generated function with a numeric request has a contract.
  const declared=clean(q.statement).match(/(?:sur(?: l.intervalle)?|\u2208)\s*\[\s*(-?\d+)\s*;\s*(-?\d+)\s*\]/i);
  const explicit=!!declared;
  if(declared&&d){assert.equal(+declared[1],d.lo,'domain lower endpoint drift');assert.equal(+declared[2],d.hi,'domain upper endpoint drift');}
  if(explicit&&q.fields.some(f=>/(?:\b[fgphqRCB](?:\u2032|')?\(|\bx\s*=)\s*-?\d/.test(clean(f.label))))assert.ok(d,'unclassified bounded function '+slug+'/'+i);
  variants++;
 }
}
assert.equal(models,183);assert.equal(variants,4392);
// Prove the guard fails on invalid and excluded endpoints, not merely valid samples.
for(const [x,d] of [[-1,{lo:0,hi:5}],[6,{lo:0,hi:5}],[0,{lo:0,openLo:true}],[0,{nonzero:true}]])assert.throws(()=>domainCheck({fields:[{label:`f(${x})`,answer:'0'}]},d));
assert.equal(domainCheck({fields:[{label:'f(-2)',answer:'-0.5'}]},{nonzero:true}),1);
console.log(`CLOTURE MATH OK: ${models} models, ${variants} distinct parameter states, ${coordinates} semantic domain coordinates, ${traps} wrong-answer traps, ${codes.size} error families, 26 skills covered.`);
