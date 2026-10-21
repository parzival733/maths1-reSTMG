/* Terminale regression tests with the production variant engine. */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const filename of ['assets/exercices-variants.js','assets/terminale-exercices.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),sandbox,{filename});
}
const V=sandbox.window.ExerciseVariants;
const T=sandbox.window.TerminaleExercises;
assert.equal(T.slugs.length,9);
assert.equal(T.count,6);
const cases=[];
for (const slug of T.slugs) {
  for (let index=0;index<T.count;index++) {
    let previous='';
    for (let cycle=1;cycle<=48;cycle++) {
      const e=V.generate(slug,index,cycle);
      assert.ok(e.title && e.statement && e.hint && e.correction.length && e.fields.length>=2);
      assert.notEqual(e.statement,previous,`${slug}/${index}/${cycle}: consecutive duplicate`);
      previous=e.statement;
      for(const field of e.fields) {
        const type=field.options?'text':(field.type||'number');
        assert.equal(V.matchesAnswer(field.answer,field.answer,type,field.tolerance,field.rounding),true);
        assert.equal(V.matchesAnswer('',field.answer,type,field.tolerance,field.rounding),false);
        if(field.options) {
          assert.ok(field.options.includes(field.answer));
          assert.equal(V.matchesAnswer('wrong',field.answer,type),false);
        } else {
          assert.ok(Number.isFinite(Number(field.answer)));
          const value=Number(field.answer);
          const digits=Number(field.rounding);
          const scale=10**digits;
          const rounded=Math.sign(value)*Math.round(Math.abs(value)*scale+1e-9)/scale;
          assert.equal(V.matchesAnswer(String(rounded).replace('.',','),field.answer,type,field.tolerance,field.rounding),true);
          assert.equal(V.matchesAnswer(String(value+10),field.answer,type,field.tolerance,field.rounding),false);
        }
      }
      const help=sandbox.window.ExerciseCoaching.build(slug,index,e);
      assert.equal(help.hints.length,3);
      assert.ok(help.hints.every(Boolean));
      assert.ok(help.bridge.a && help.bridge.help && help.diagnose);
      assert.ok(help.hints[2].includes(e.statement.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()));
      cases.push({slug,index,cycle,c:1+(cycle-1)%24,answers:e.fields.map(x=>x.answer)});
    }
  }
}
for(let n=1;n<=10;n++) {
  let row=0;
  for(let k=0;k<=n;k++) row+=T.binom(n,k);
  assert.equal(row,2**n);
  for(const p of [0,.1,.3,.5,.9,1]) {
    let total=0,expectation=0;
    for(let k=0;k<=n;k++) {const probability=T.mass(n,p,k);total+=probability;expectation+=k*probability;}
    assert.ok(Math.abs(total-1)<1e-10);
    assert.ok(Math.abs(expectation-n*p)<1e-10);
  }
}
if(process.argv.includes('--json')) process.stdout.write(JSON.stringify(cases));
else console.log('TERMINALE OK: 54 models; 2592 variants; answers, rounding, hints and binomial boundaries.');
