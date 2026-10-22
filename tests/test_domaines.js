'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx=vm.createContext({window:{},console});
for(const file of ['exercices-variants.js',...fs.readdirSync('assets').filter(n=>/^variants-.*\.js$/.test(n)),'terminale-exercices.js'])vm.runInContext(fs.readFileSync(path.join('assets',file),'utf8'),ctx);
const V=ctx.window.ExerciseVariants,clean=s=>s.replace(/<[^>]*>/g,' ').replace(/\u2212/g,'-');
let intervals=0,coordinates=0,independent=0;
const slugs=['fonctions','second-degre','suites','suites-arithmetiques','suites-geometriques','derivees','variations','statistiques-deux-variables','probabilites-conditionnelles','bernoulli','variables-aleatoires','calcul','evolutions','logique','statistiques-descriptives','python-tableur',...ctx.window.TerminaleExercises.slugs];
for(const slug of slugs)for(let index=0;index<(slug.startsWith('t-')?6:slug==='fonctions'?9:8);index++)for(let cycle=1;cycle<=240;cycle++){
 const q=V.generate(slug,index,cycle,{}),st=clean(q.statement);
 const interval=st.match(/(?:sur|\u2208)\s*\[\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\]/i);
 if(interval){const low=Number(interval[1].replace(',','.')),high=Number(interval[2].replace(',','.'));assert.ok(low<=high);intervals++;
  for(const field of q.fields){const m=clean(field.label).match(/\b[fgphqRCB](?:\u2032|')?\(\s*(-?\d+(?:[.,]\d+)?)\s*\)/);if(m){const x=Number(m[1].replace(',','.'));assert.ok(x>=low&&x<=high,[slug,index,cycle,field.label,low,high]);coordinates++;}}
 }
 if(slug==='fonctions'&&index===6){const a=+q.fields[1].answer;assert.ok(interval);assert.ok(a>=+interval[1]&&a<=+interval[2]);independent++;}
 if(slug==='second-degre'&&index===5){const [x,max,r1,r2]=q.fields.map(f=>+f.answer);assert.ok(r1>=0&&r2<=2*x);assert.equal((r1+r2)/2,x);assert.ok(max>0);independent++;}
 if(slug==='variations'&&index===4){const [r1,r2,v1,v2]=q.fields.map(f=>+f.answer);assert.ok(r1<r2);assert.equal(v1,-v2);assert.ok(interval&&r1>=+interval[1]&&r2<=+interval[2]);independent++;}
 if(slug==='t-inverse'&&index===0){const c=1+(cycle-1)%24,a=2+c%8;assert.equal(+q.fields[0].answer,1/a);assert.equal(+q.fields[1].answer,-1/a);assert.ok(a!==0);independent++;}
 if(slug==='t-inverse'&&index===3){const c=1+(cycle-1)%24,m=2+c%6,b=5+c;assert.equal(+q.fields[0].answer,m);assert.ok(m>0);assert.equal(+q.fields[1].answer,m+m*m/m+b);independent++;}
 if(slug==='t-logarithme'){const c=1+(cycle-1)%24; if(index===0){assert.equal(+q.fields[0].answer,1+c%5);assert.equal(+q.fields[1].answer,-1-c%3);}if(index===2||index===3)assert.equal(+q.fields[1].answer,+q.fields[0].answer+1);if(index===4){const x=+q.fields[0].answer;assert.ok(x>0);assert.ok(Math.abs(Math.log10(x)-+q.fields[1].answer)<1e-12);}independent++;}
 if(slug==='t-conditionnelles'&&index===4){const c=1+(cycle-1)%24,a=(2+c%5)/10,b=.4,j=a*b*(c%2===0?1:.5);assert.ok(j>=Math.max(0,a+b-1)&&j<=Math.min(a,b));independent++;}
}
assert.equal(V.matchesAnswer('1,5 ; -2,5','-2.5;1.5','unordered-list'),true);
assert.equal(V.matchesAnswer('1,5 et -2,5','-2.5;1.5','unordered-list'),true);
for(const bad of ['1/0','Infinity','0x10','NaN'])assert.equal(V.matchesAnswer(bad,'1','number'),false);
console.log(`DOMAINES OK: ${intervals} bounded-domain variants, ${coordinates} requested coordinates, ${independent} independent checks; strict thresholds and decimal-comma lists.`);
