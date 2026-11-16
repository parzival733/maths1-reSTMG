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
  assert.equal(A.templates.length,83);
  assert.equal(A.templates.filter(t=>t.level==='bases').length,18);
  assert.equal(A.templates.filter(t=>t.level==='premiere').length,24);
  assert.equal(A.templates.filter(t=>t.level==='terminale').length,12);
  assert.equal(A.templates.filter(t=>t.level==='troisieme').length,14);
  assert.equal(A.templates.filter(t=>t.level==='seconde').length,15);
  assert.equal(new Set(A.templates.map(t=>t.id)).size,83);
  /* Lectures graphiques : figure valide, droite passant par le point à lire, valeur lisible sur le quadrillage, réponse absente de la légende. */
  const F=require('../assets/figures.js'),FC=require('./figures_controle.js');
  const lecture=(q,where)=>{
    const svg=F.svg(q.figure),defauts=FC.controler(svg);
    assert.deepEqual(defauts,[],where+' : '+defauts.join(' ; '));
    const o=q.figure.options,droite=q.figure.elements.find(e=>e.t==='droite_affine'),[n,d]=A.parse(q.expected),v=Number(n)/Number(d);
    const dans=(x,y)=>x>=o.xmin&&x<=o.xmax&&y>=o.ymin&&y<=o.ymax,entier=x=>Math.abs(x-Math.round(x))<1e-9;
    const point={'c-lire-image':()=>[q.ref[1],v],'c-lire-antecedent':()=>[v,q.ref[0]],'s-lire-ordonnee':()=>[0,v],'s-lire-zero':()=>[v,0]}[q.id];
    if(point){const [x,y]=point();assert.ok(entier(x)&&entier(y)&&dans(x,y)&&Math.abs(droite.m*x+droite.p-y)<1e-9,where+' : point à lire sur la droite, sur un nœud du quadrillage');}
    else{assert.equal(q.id,'s-lire-pente');assert.ok(Math.abs(droite.m-v)<1e-9,where+' : pente de la droite');
      const A0=q.figure.elements.find(e=>e.t==='point');assert.ok(Math.abs(droite.m*A0.x+droite.p-A0.y)<1e-9&&dans(A0.x+Number(d),A0.y+Number(n)),where+' : A et le point suivant du quadrillage sont sur la droite');}
    assert.ok(!/\d/.test(q.figure.titre),where+' : la légende ne donne aucune valeur');
    return 1;
  };
  let total=0,lectures=0;
  for(const t of A.templates) {
    assert.ok(fs.existsSync(path.join(__dirname,'..',t.course+'.html')),t.course);
    assert.ok(A.topics[t.topic]);
    for(let seed=0;seed<192;seed++) {
      const q=A.generate(t.id,seed);
      assert.ok(A.check(q.expected,q),q.id);
      const [n,d]=A.parse(q.expected);
      assert.ok(A.check(`${n*7n}/${d*7n}`,q));
      assert.equal(A.check(`${n+d}/${d}`,q),false);
      // Short prompts and equations are intentional for mental arithmetic.
      // The method is also explained by the hint; Python independently checks the arithmetic.
      assert.ok(q.solution.length>=8&&q.hint.length>12&&q.prompt.length>=10,`${q.id}/${seed}: incomplete pedagogical content`);
      assert.ok(Array.isArray(q.ref)&&q.ref.length>0);
      assert.deepEqual(q,A.generate(t.id,seed));
      assert.equal(!!q.figure,!!t.figure,`${q.id}: figure annoncée par le modèle`);
      if(q.figure) lectures+=lecture(q,`${q.id}/${seed}`);
      for(const v of ['','   ','Infinity','NaN','0x10','1/0','1//2','1/2/3','alert(1)','<script>'])assert.equal(A.check(v,q),false,[q.id,v]);
      total++;
    }
  }
  assert.equal(lectures,5*192);
  /* Sans le moteur de figures dans la page, les lectures graphiques ne sont pas proposées ; les parcours de révision ne les reprennent pas. */
  global.window={};
  assert.ok(A.eligible({level:'troisieme'}).every(t=>!t.figure)&&A.eligible({level:'troisieme'}).length===12);
  global.window={Figures:F};
  assert.equal(A.eligible({level:'seconde'}).length,15);
  delete global.window;
  assert.ok(require('../assets/parcours-data.js').templates.every(t=>!t.figure));
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
  for(const level of ['bac','bases','premiere','terminale','troisieme','seconde'])for(const method of ['mixte','mental','feuille'])for(let seed=0;seed<50;seed++) {
    const opts={level,method,count:20,seed};
    const qs=A.session(opts);assert.equal(qs.length,20);
    assert.deepEqual(qs,A.session(opts));
    assert.ok(qs.every(q=>level==='bac'?['bases','premiere'].includes(q.level):q.level===level));
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
  console.log(`CALCUL RAPIDE OK: ${total} variantes, fractions exactes, filtres et aucun modele Terminale, 3e ou Seconde dans le parcours de l'epreuve anticipee.`);
}
