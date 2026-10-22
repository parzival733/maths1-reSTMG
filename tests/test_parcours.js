'use strict';
const assert=require('node:assert/strict'),B=require('../assets/parcours-data.js'),Q=require('../assets/calcul-rapide-data.js'),A=require('../assets/acquis.js');
assert.equal(B.templates.length,63);const samples=[];
for(const t of B.templates)for(let seed=0;seed<160;seed++){
 const q=B.generate(t.id,seed);assert.ok(A.skills[q.skill]);assert.ok(q.prompt&&q.solution&&q.hint&&q.variant);
 assert.ok(Q.check(q.expected,q),t.id);assert.equal(Q.check('',q),false);assert.equal(Q.check('1/0',q),false);
 assert.equal(Q.check('Infinity',q),false);assert.equal(Q.check('0x10',q),false);assert.ok(q.ref?.length);
 samples.push(q);
}
for(let seed=0;seed<150;seed++)for(const level of ['premiere','terminale']){
 const qs=B.diagnostic(level,seed);assert.equal(qs.length,10);const skills={};for(const q of qs)skills[q.skill]=(skills[q.skill]||0)+1;
 assert.equal(Object.keys(skills).length,5);assert.ok(Object.values(skills).every(n=>n===2));
 assert.equal(new Set(qs.map(q=>q.prompt)).size,10,'duplicate diagnostic '+level+'/'+seed);
 const mixed=B.session({level,skills:['fractions'],count:20,seed});assert.equal(mixed.length,20);
 assert.equal(new Set(mixed.map(q=>q.prompt)).size,20);
 if(level==='premiere')assert.ok(mixed.every(q=>q.level!=='terminale'));
 assert.ok(mixed.slice(0,14).every(q=>q.skill==='fractions'));
}
const p=B.generate('p-successives',1);assert.equal(B.mistake('0',p).code,'taux-addition');assert.equal(B.mistake(p.expected,p),null);
const c=B.generate('r-population',1);assert.equal(B.mistake(c.traps[0].value,c).code,'population-reference');
if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(samples));else console.log('PARCOURS OK: 10080 exact questions, 300 diagnostics, 6000 mixed questions, level filters and targeted feedback.');
