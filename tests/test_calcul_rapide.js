'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const A=require('../assets/calcul-rapide-data.js');
if(process.argv.includes('--export')) {
  const samples=[];
  for(const t of A.templates)for(let seed=0;seed<160;seed++)samples.push(A.generate(t.id,seed));
  process.stdout.write(JSON.stringify(samples));
} else {
  assert.equal(A.templates.length,54);
  assert.equal(A.templates.filter(t=>t.level==='bases').length,18);
  assert.equal(A.templates.filter(t=>t.level==='premiere').length,24);
  assert.equal(A.templates.filter(t=>t.level==='terminale').length,12);
  assert.equal(new Set(A.templates.map(t=>t.id)).size,54);
  let total=0;
  for(const t of A.templates) {
    assert.ok(fs.existsSync(path.join(__dirname,'..',t.course+'.html')),t.course);
    assert.ok(A.topics[t.topic]);
    for(let seed=0;seed<192;seed++) {
      const q=A.generate(t.id,seed);
      assert.ok(A.check(q.expected,q),q.id);
      const [n,d]=A.parse(q.expected);
      assert.ok(A.check(`${n*7n}/${d*7n}`,q));
      assert.equal(A.check(`${n+d}/${d}`,q),false);
      // A short prompt such as "Calcule 11 au carre" is intentional.
      assert.ok(q.solution.length>15&&q.hint.length>12&&q.prompt.length>=10,`${q.id}/${seed}: incomplete pedagogical content`);
      assert.ok(Array.isArray(q.ref)&&q.ref.length>0);
      assert.deepEqual(q,A.generate(t.id,seed));
      for(const v of ['','   ','Infinity','NaN','0x10','1/0','1//2','1/2/3','alert(1)','<script>'])assert.equal(A.check(v,q),false,[q.id,v]);
      total++;
    }
  }
  assert.equal(A.check('2/4',{expected:'1/2'}),true);
  assert.equal(A.check('0,5',{expected:'1/2'}),true);
  assert.equal(A.check('−1,25',{expected:'-5/4'}),true);
  assert.equal(A.check('25%',{expected:'1/4'}),true);
  assert.equal(A.check('25 %',{expected:'25',unit:'%'}),true);
  assert.equal(A.check('0,25',{expected:'25',unit:'%'}),false);
  assert.equal(A.check('12 €',{expected:'12',unit:'€'}),true);
  assert.equal(A.check('1 200',{expected:'1200'}),true);
  assert.equal(A.check('0,333',{expected:'1/3'}),false);
  assert.equal(A.check('0,333333333333',{expected:'1/3'}),false);
  assert.equal(A.check('1/-2',{expected:'-1/2'}),true);
  assert.equal(A.parse('1'.repeat(81)),null);
  for(const level of ['bac','bases','premiere','terminale'])for(const method of ['mixte','mental','feuille'])for(let seed=0;seed<50;seed++) {
    const opts={level,method,count:20,seed};
    const qs=A.session(opts);assert.equal(qs.length,20);
    assert.deepEqual(qs,A.session(opts));
    assert.ok(qs.every(q=>level==='bac'?q.level!=='terminale':q.level===level));
    assert.ok(qs.every(q=>method==='mixte'||q.method===method));
    for(const topic of [...new Set(A.eligible(opts).map(t=>t.topic))]) {
      const filtered=A.session({...opts,topic,count:5});
      assert.equal(filtered.length,5);assert.ok(filtered.every(q=>q.topic===topic));
    }
  }
  assert.deepEqual(A.session({level:'bac',topic:'logarithme'}),[]);
  assert.throws(()=>A.session({level:'unknown'}));
  assert.throws(()=>A.session({count:21}));
  assert.throws(()=>A.generate('unknown'));
  assert.notDeepEqual(A.session({seed:1}),A.session({seed:2}));
  for(const f of ['calcul-rapide-data.js','calcul-rapide.js']) {
    const code=fs.readFileSync(path.join(__dirname,'..','assets',f),'utf8');
    assert.equal(/\beval\s*\(|\bfetch\s*\(|\blocalStorage\b|\bsessionStorage\b|\bXMLHttpRequest\b/.test(code),false);
  }
  console.log(`CALCUL RAPIDE OK: ${total} variantes, fractions exactes, filtres et aucun modele Terminale dans le parcours bac.`);
}
