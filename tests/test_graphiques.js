/* Vérifie les mathématiques des quatre visualisations sans navigateur. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const sandbox = {window: {}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'assets/graphiques-interactifs.js'),'utf8'),sandbox,
  {filename:'graphiques-interactifs.js'});
const g=sandbox.window.GraphiquesInteractifs;
assert.ok(g && typeof g.init === 'function');
const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, a+' should equal '+b);
let checks=0;
for (const a of [-3,-2,-1,-.5,0,.5,1,2,3]) {
  for (const b of [-4,-2,0,2,4]) {
    for (const x of [-6,-2,0,2,6]) {
      close(g.affine({a,b},x),a*x+b);
      checks++;
    }
    if (a) close(g.affine({a,b},-b/a),0);
    else close(g.affine({a,b},-5),b);
  }
}
for(const a of [-2,-1,-.5,.5,1,2]) {
  for(const h of [-3,-1,0,1,3]) {
    for(const k of [-4,-2,0,2,4]) {
      const p={a,h,k};
      close(g.quadratic(p,h),k);
      const roots=g.roots(p);
      assert.equal(roots.length,k===0?1: k/a<0?2:0);
      for (const r of roots) close(g.quadratic(p,r),0);
      if(roots.length===2)close((roots[0]+roots[1])/2,h);
      checks++;
    }
  }
}
for(const u0 of [0,2,5,8]) for(const r of [-2,0,.5,1.5,3]) {
  for(let n=0;n<=6;n++){
    close(g.arithmetic({u0,r},n),u0+n*r);
    close(g.arithmetic({u0,r},n+1)-g.arithmetic({u0,r},n),r);
    checks++;
  }
}
for(const v0 of [0,2,5,8]) for(const q of [.5,.8,1,1.2,1.6]) {
  for(let n=0;n<=6;n++){
    close(g.geometric({v0,q},n),v0*q**n);
    close(g.geometric({v0,q},n+1),q*g.geometric({v0,q},n));
    checks++;
  }
}
for(let t=-3;t<=5;t+=.25) {
  close(g.tangent(t,t),g.curve(t));
  const epsilon=.00001;
  close((g.curve(t+epsilon)-g.curve(t-epsilon))/(2*epsilon),g.slope(t));
  close(g.tangent(t,t+1)-g.tangent(t,t),g.slope(t));
  checks++;
}
assert.equal(g.slope(1),0);
assert.equal(g.fmt(2.5),'2,5');
assert.equal(g.fmt(-2),'\u22122');
// Courbe du logarithme décimal (leçon de Terminale) : valeurs exactes et domaine.
assert.equal(g.logarithm({},100),2);
assert.ok(Math.abs(g.logarithm({},2)-0.30103)<1e-5);
assert.ok(Number.isNaN(g.logarithm({},0)) && Number.isNaN(g.logarithm({},-1)));
for (const [slug,type] of [
 ['fonctions','affine'],['second-degre','second'],['suites','suites'],
 ['derivees','derivee'],['variations','variations']
]){
  const page=fs.readFileSync(path.join(root,'cours',slug+'.html'),'utf8');
  assert.ok(page.includes('class="math-lab" data-lab="'+type+'"'),slug+' lacks interactive module');
  assert.ok(page.includes('graphiques-interactifs.js?v='),slug+' lacks script');
  assert.ok(page.includes('graphiques-interactifs.css?v='),slug+' lacks style');
}
console.log('GRAPHIQUES OK: '+checks+' cas numériques, cinq cours, quatre visualisations.');
