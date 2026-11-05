'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx=vm.createContext({window:{},console});
for(const file of ['exercices-variants.js',...fs.readdirSync('assets').filter(n=>/^variants-.*\.js$/.test(n)),'terminale-exercices.js'])vm.runInContext(fs.readFileSync(path.join('assets',file),'utf8'),ctx);
const V=ctx.window.ExerciseVariants,clean=s=>s.replace(/<[^>]*>/g,' ').replace(/\u2212/g,'-');
let intervals=0,coordinates=0,independent=0;
const slugs=['fonctions','second-degre','suites','suites-arithmetiques','suites-geometriques','derivees','variations','statistiques-deux-variables','probabilites-conditionnelles','bernoulli','variables-aleatoires','calcul','evolutions','logique','statistiques-descriptives','python-tableur',...ctx.window.TerminaleExercises.slugs];
for(const slug of slugs)for(let index=0;index<(slug.startsWith('t-')?6:slug==='fonctions'?9:8);index++)for(let seed=1;seed<=240;seed++){
 const q=V.generate(slug,index,seed,{}),st=clean(q.statement),p=q.params;
 const interval=st.match(/(?:sur|\u2208)\s*\[\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\]/i);
 if(interval){const low=Number(interval[1].replace(',','.')),high=Number(interval[2].replace(',','.'));assert.ok(low<high,[slug,index,seed]);intervals++;
  for(const field of q.fields){const m=clean(field.label).match(/\b[fgphqRCB](?:\u2032|')?\(\s*(-?\d+(?:[.,]\d+)?)\s*\)/);if(m){const x=Number(m[1].replace(',','.'));assert.ok(x>=low&&x<=high,[slug,index,seed,field.label,low,high]);coordinates++;}}
 }
 // Recalculs indépendants à partir des paramètres du tirage.
 if(slug==='fonctions'&&index===6){const r=+q.fields[1].answer;assert.ok(interval);assert.ok(r>=+interval[1]&&r<=+interval[2]);assert.equal(p.m*r-p.m*p.root,0);independent++;}
 if(slug==='second-degre'&&index===5){const [x,max,r1,r2]=q.fields.map(f=>+f.answer);assert.ok(r1>=0&&r2<=2*x);assert.equal((r1+r2)/2,x);assert.ok(max>0);independent++;}
 if(slug==='variations'&&index===4){const [r1,r2,v1,v2]=q.fields.map(f=>+f.answer);assert.ok(r1<r2);assert.equal(v1-p.c,-(v2-p.c));assert.ok(interval&&r1>=+interval[1]&&r2<=+interval[2]);independent++;}
 if(slug==='t-inverse'&&index===0){assert.ok(Math.abs(+q.fields[0].answer*p.x1-1)<1e-8);assert.ok(Math.abs(+q.fields[1].answer*p.x2-1)<1e-8);assert.ok(p.x1!==0&&p.x2!==0);independent++;}
 if(slug==='t-inverse'&&index===3){assert.equal(+q.fields[0].answer,p.m);assert.ok(p.m>0);assert.equal(+q.fields[1].answer,p.m+p.m*p.m/p.m+p.b);independent++;}
 if(slug==='t-logarithme'){if(index===0){assert.equal(+q.fields[0].answer,p.h);assert.equal(+q.fields[1].answer,p.j);}if(index===2)assert.equal(+q.fields[1].answer,+q.fields[0].answer+(p.strict?1:0));if(index===3)assert.equal(+q.fields[1].answer,+q.fields[0].answer+1);if(index===4){const x=+q.fields[0].answer;assert.ok(x>0);assert.ok(Math.abs(Math.log10(x)-+q.fields[1].answer)<1e-8);}independent++;}
 if(slug==='t-conditionnelles'&&index===4){const j=p.a*p.b+p.d;assert.ok(j>=Math.max(0,p.a+p.b-1)&&j<=Math.min(p.a,p.b));independent++;}
}
assert.equal(V.matchesAnswer('1,5 ; -2,5','-2.5;1.5','unordered-list'),true);
assert.equal(V.matchesAnswer('1,5 et -2,5','-2.5;1.5','unordered-list'),true);
for(const bad of ['1/0','Infinity','0x10','NaN'])assert.equal(V.matchesAnswer(bad,'1','number'),false);
console.log(`DOMAINES OK: ${intervals} bounded-domain variants, ${coordinates} requested coordinates, ${independent} independent checks; strict thresholds and decimal-comma lists.`);
