/* Annexe de calcul rapide. Donnees et calculs locaux, sans dependance.
   54 modeles : 18 bases, 24 Premiere, 12 Terminale.
   Les expressions ref sont reservees aux tests independants en Python. */
(() => {
  'use strict';
  const topics = {nombres:'Nombres, priorités et puissances', fractions:'Fractions', pourcentages:'Proportions et évolutions', unites:'Unités et durées', algebre:'Équations et calcul littéral', fonctions:'Fonctions et second degré', suites:'Suites et sommes', derivees:'Dérivées et tangentes', statistiques:'Statistiques', probabilites:'Probabilités et espérance', exponentielles:'Exponentielles et taux moyen', logarithme:'Logarithme et seuils', inverse:'Fonction inverse', binomiale:'Loi binomiale'};
  const registry = [];
  const gcd = (a,b) => { a = Math.abs(a); b = Math.abs(b); while(b) [a,b]=[b,a%b]; return a||1; };
  function fraction(n,d=1) {
    if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||!d) throw new Error('Fraction invalide');
    if(d<0) { n=-n; d=-d; }
    const g=gcd(n,d); n/=g; d/=g;
    return d===1 ? String(n) : `${n}/${d}`;
  }
  const fr = n => String(n).replace('.',',');
  const addend = n => n<0 ? `− ${-n}` : `+ ${n}`;
  function random(seed) {
    let a=Number(seed)>>>0;
    const next=()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
    return {int:(a,b)=>a+Math.floor(next()*(b-a+1)),pick:xs=>xs[Math.floor(next()*xs.length)],next};
  }
  function add(id,level,topic,method,course,fn) { registry.push({id,level,topic,method,course,fn}); }
  // Une reponse est toujours numerique, entiere, decimale exacte ou fraction.
  const Q=(prompt,n,d,hint,solution,ref,unit='')=>({prompt,expected:fraction(n,d),hint,solution,ref,unit});
  const calc='cours/calcul';
  const evol='cours/evolutions';
  add('g-priorites','bases','nombres','mental',calc,r=>{const a=r.int(2,12),b=r.int(2,9),c=r.int(2,9);return Q(`Calcule ${a} + ${b} × ${c}.`,a+b*c,1,'Effectue la multiplication avant l’addition.',`${b} × ${c} = ${b*c}, puis ${a} + ${b*c} = ${a+b*c}.`,[a,b,c,'*','+']);});
  add('g-parentheses','bases','nombres','feuille',calc,r=>{const a=r.int(3,15),b=r.int(2,9),c=r.int(2,8);return Q(`Calcule (${a} + ${b}) × ${c}.`,(a+b)*c,1,'Commence par l’intérieur des parenthèses.',`${a} + ${b} = ${a+b}, puis ${a+b} × ${c} = ${(a+b)*c}.`,[a,b,'+',c,'*']);});
  add('g-signes','bases','nombres','mental',calc,r=>{const a=r.int(2,20),b=r.int(2,20);return Q(`Calcule −${a} − (−${b}).`,b-a,1,'Soustraire un nombre négatif revient à ajouter son opposé.',`−${a} − (−${b}) = −${a} + ${b} = ${b-a}.`,[0,a,'-',b,'+']);});
  add('g-fois25','bases','nombres','mental',calc,r=>{const a=4*r.int(3,24);return Q(`Calcule ${a} × 25.`,25*a,1,'25 = 100 ÷ 4 : divise d’abord par 4.',`${a} ÷ 4 = ${a/4} ; ${a/4} × 100 = ${25*a}.`,[a,100,'*',4,'/']);});
  add('g-fois99','bases','nombres','mental',calc,r=>{const a=r.int(12,65);return Q(`Calcule ${a} × 99.`,a*99,1,'99 = 100 − 1 : multiplie par 100, puis retire une fois le nombre.',`${a} × 99 = ${a*100} − ${a} = ${a*99}.`,[a,100,'*',a,'-']);});
  add('g-div5','bases','nombres','mental',calc,r=>{const a=5*r.int(11,89);return Q(`Calcule ${a} ÷ 5.`,a,5,'Diviser par 5 revient à multiplier par 2 puis à diviser par 10.',`${a} × 2 = ${2*a} ; ${2*a} ÷ 10 = ${a/5}.`,[a,2,'*',10,'/']);});
  add('g-decimaux','bases','nombres','mental',calc,r=>{const a=r.int(12,98);return Q(`Calcule ${fr(a/10)} × 100.`,a*10,1,'Chaque chiffre change de deux rangs dans la numération.',`${fr(a/10)} × 10 = ${a}, puis encore × 10 donne ${a*10}.`,[a,10,'/',100,'*']);});
  add('g-fraction-somme','bases','fractions','mental',calc,r=>{const d=r.pick([3,4,5,6,8]),a=r.int(1,d-1),b=r.int(1,d-1);return Q(`Calcule ${a}/${d} + ${b}/${d}.`,a+b,d,'Les dénominateurs sont égaux : additionne seulement les numérateurs.',`(${a} + ${b})/${d} = ${fraction(a+b,d)}. Simplifie si possible.`,[a,d,'/',b,d,'/','+']);});
  add('g-fraction-denominateur','bases','fractions','feuille',calc,r=>{const a=r.int(1,7),b=r.int(1,7);return Q(`Calcule ${a}/2 + ${b}/4.`,2*a+b,4,'Écris la première fraction avec le dénominateur 4.',`${a}/2 = ${2*a}/4 ; la somme vaut ${2*a+b}/4 = ${fraction(2*a+b,4)}.`,[a,2,'/',b,4,'/','+']);});
  add('g-fraction-produit','bases','fractions','mental',calc,r=>{const a=r.int(1,9),b=r.int(2,8),c=r.int(2,9);return Q(`Calcule (${a}/${b}) × (${b}/${c}).`,a,c,'Simplifie le facteur commun au numérateur et au dénominateur avant de multiplier.',`(${a} × ${b})/(${b} × ${c}) = ${a}/${c} = ${fraction(a,c)}.`,[a,b,'/',b,c,'/','*']);});
  add('g-fraction-quotient','bases','fractions','feuille',calc,r=>{const a=r.int(1,9),b=r.int(2,8),c=r.int(2,9);return Q(`Calcule (${a}/${b}) ÷ (${c}/${b}).`,a,c,'Diviser par une fraction non nulle revient à multiplier par son inverse.',`(${a}/${b}) × (${b}/${c}) = ${fraction(a,c)}.`,[a,b,'/',c,b,'/','/']);});
  add('g-puissance','bases','nombres','mental',calc,r=>{const n=r.int(2,7);return Q(`Calcule 2 puissance ${n}.`,2**n,1,'Multiplie successivement par 2 ; ne multiplie pas 2 par l’exposant.',`2 puissance ${n} = ${Array(n).fill('2').join(' × ')} = ${2**n}.`,[2,n,'pow']);});
  add('g-puissance10','bases','nombres','mental',calc,r=>{const a=r.int(-3,5),b=r.int(-3,5);return Q(`10^(${a}) × 10^(${b}) = 10^k. Donne k.`,a+b,1,'Dans un produit de puissances de même base, additionne les exposants.',`k = ${a} ${addend(b)} = ${a+b}.`,[a,b,'+']);});
  add('g-carre','bases','nombres','feuille',calc,r=>{const a=r.int(1,9);return Q(`Calcule ${10+a}².`,(10+a)**2,1,'Utilise (10 + a)² = 100 + 20a + a².',`${10+a}² = 100 + ${20*a} + ${a*a} = ${(10+a)**2}.`,[10,a,'+',2,'pow']);});
  add('g-proportion','bases','pourcentages','mental',calc,r=>{const a=80*r.int(1,12),p=r.pick([5,10,20,25,50,75]);return Q(`Calcule ${p} % de ${a}.`,a*p,100,'10 % est un dixième, 25 % un quart et 50 % la moitié.',`${p} % de ${a} = ${a} × ${p}/100 = ${a*p/100}.`,[a,p,'*',100,'/']);});
  add('g-unites','bases','unites','mental',calc,r=>{const a=25*r.int(3,39);return Q(`Convertis ${a} cm en mètres.`,a,100,'1 m = 100 cm : divise le nombre de centimètres par 100.',`${a} ÷ 100 = ${fr(a/100)} m.`,[a,100,'/'],'m');});
  add('g-duree','bases','unites','mental',calc,r=>{const a=r.int(1,5),b=r.pick([5,10,15,20,25,30,40,45,50]);return Q(`Convertis ${a} h ${b} min en minutes.`,60*a+b,1,'Une heure contient 60 minutes, pas 100.',`${a} × 60 + ${b} = ${60*a+b} minutes.`,[a,60,'*',b,'+'],'min');});
  add('g-moyenne','bases','statistiques','mental','cours/statistiques-descriptives',r=>{const a=r.int(5,17),d=r.int(1,3);return Q(`Calcule la moyenne de ${a-d}, ${a} et ${a+d}.`,a,1,'Les trois valeurs sont régulièrement espacées autour de celle du milieu.',`(${a-d} + ${a} + ${a+d})/3 = ${3*a}/3 = ${a}.`,[a-d,a,'+',a+d,'+',3,'/']);});
  add('p-hausse','premiere','pourcentages','mental',evol,r=>{const a=5*r.int(4,30);return Q(`Un prix de ${a} € augmente de 20 %. Quel est le nouveau prix ?`,6*a,5,'20 % = un cinquième : ajoute un cinquième du prix initial.',`${a} + ${a/5} = ${6*a/5} €. Le coefficient multiplicateur est 1,20.`,[a,a,5,'/','+'],'€');});
  add('p-baisse','premiere','pourcentages','mental',evol,r=>{const a=10*r.int(3,40);return Q(`Un prix de ${a} € diminue de 10 %. Quel est le nouveau prix ?`,9*a,10,'Retire un dixième du prix initial.',`${a} − ${a/10} = ${9*a/10} €.`,[a,a,10,'/','-'],'€');});
  add('p-retour','premiere','pourcentages','mental',evol,r=>{const a=r.int(8,40);return Q(`Après une hausse de 25 %, un prix vaut ${5*a} €. Quel était le prix initial ?`,4*a,1,'Le prix final vaut 5/4 du prix initial. Multiplie-le par 4/5.',`${5*a} ÷ 1,25 = ${5*a} × 4/5 = ${4*a} €. On ne retire pas 25 % du prix final.`,[5*a,4,'*',5,'/'],'€');});
  add('p-successives','premiere','pourcentages','feuille',evol,r=>{const t=r.pick([10,20,30,50]);return Q(`Une quantité augmente de ${t} %, puis diminue de ${t} %. Donne le taux global en %, avec son signe.`,-t*t,100,'Multiplie les deux coefficients ; les taux ne s’annulent pas.',`(1 + ${t}/100)(1 − ${t}/100) = 1 − (${t}/100)². Le taux global est −${t*t}/100 % = ${fr(-t*t/100)} %.`,[100+t,100,'/',100-t,100,'/','*',1,'-',100,'*'],'%');});
  add('p-taux','premiere','pourcentages','feuille',evol,r=>{const a=r.int(1,8),t=r.pick([-25,-20,-10,10,20,25,50]),v0=100*a,v1=(100+t)*a;return Q(`Une valeur passe de ${v0} à ${v1}. Donne son taux d’évolution en %, avec son signe.`,t,1,'Divise la variation par la valeur initiale, puis multiplie par 100.',`(${v1} − ${v0})/${v0} × 100 = ${t} %.`,[v1,v0,'-',v0,'/',100,'*'],'%');});
  add('p-equation','premiere','algebre','feuille',calc,r=>{const a=r.int(2,7),b=r.int(1,15),x=r.int(-4,8),c=a*x+b;return Q(`Résous ${a}x + ${b} = ${c}. Donne x.`,x,1,'Soustrais le terme constant des deux côtés, puis divise par le coefficient de x.',`${a}x = ${c} − ${b} = ${a*x}, donc x = ${x}.`,[c,b,'-',a,'/']);});
  add('p-developpement','premiere','algebre','feuille',calc,r=>{const a=r.int(2,7),b=r.int(1,9),c=r.int(1,8);return Q(`Développe ${a}(x + ${b}) + ${c}x. Quel est le coefficient de x ?`,a+c,1,'Distribue le premier facteur, puis rassemble les termes en x.',`${a}x + ${a*b} + ${c}x = ${a+c}x + ${a*b}. Le coefficient de x est ${a+c}.`,[a,c,'+']);});
  add('p-image','premiere','fonctions','mental','cours/fonctions',r=>{const a=r.pick([-3,-2,2,3,4]),b=r.int(1,9),x=r.int(-3,5);return Q(`f(x) = ${a}x + ${b}. Calcule f(${x}).`,a*x+b,1,'Remplace chaque x par la valeur indiquée ; garde les parenthèses si elle est négative.',`f(${x}) = ${a} × (${x}) + ${b} = ${a*x+b}.`,[a,x,'*',b,'+']);});
  add('p-antecedent','premiere','fonctions','feuille','cours/fonctions',r=>{const a=r.int(2,6),b=r.int(1,8),x=r.int(-3,7),y=a*x+b;return Q(`f(x) = ${a}x + ${b}. Quel est l’antécédent de ${y} ?`,x,1,'Cherche x tel que f(x) soit égal au nombre donné.',`${a}x + ${b} = ${y}, donc x = (${y} − ${b})/${a} = ${x}.`,[y,b,'-',a,'/']);});
  add('p-pente','premiere','fonctions','feuille','cours/fonctions',r=>{const x=r.int(-2,3),y=r.int(-5,5),d=r.int(2,5),a=r.pick([-3,-2,-1,1,2,3]);return Q(`A(${x} ; ${y}) et B(${x+d} ; ${y+a*d}). Quelle est la pente de (AB) ?`,a,1,'Calcule variation de y ÷ variation de x, dans le même ordre.',`(${y+a*d} − (${y}))/(${x+d} − (${x})) = ${a*d}/${d} = ${a}.`,[y+a*d,y,'-',x+d,x,'-','/']);});
  add('p-sommet','premiere','fonctions','mental','cours/second-degre',r=>{const a=r.int(1,5),b=a+r.int(2,7);return Q(`f(x) = (x − ${a})(x − ${b}). Quelle est l’abscisse du sommet ?`,a+b,2,'L’axe de symétrie passe au milieu des deux racines.',`Les racines sont ${a} et ${b}. Leur milieu est (${a} + ${b})/2 = ${fraction(a+b,2)}.`,[a,b,'+',2,'/']);});
  add('p-second-image','premiere','fonctions','mental','cours/second-degre',r=>{const a=r.int(1,7),b=r.int(1,7);return Q(`f(x) = (x − ${a})(x + ${b}). Calcule f(0).`,-a*b,1,'Remplace x par 0 dans chacun des deux facteurs.',`f(0) = (−${a}) × ${b} = ${-a*b}.`,[0,a,'-',b,'*']);});
  add('p-arithmetique','premiere','suites','mental','cours/suites-arithmetiques',r=>{const a=r.int(3,20),d=r.pick([-3,-2,2,3,4]),n=r.int(2,8);return Q(`u₀ = ${a} et uₙ₊₁ = uₙ ${addend(d)}. Calcule u${n}.`,a+n*d,1,'Du rang 0 au rang n, il y a n ajouts de la raison.',`u${n} = ${a} + ${n} × (${d}) = ${a+n*d}.`,[a,n,d,'*','+']);});
  add('p-geometrique','premiere','suites','mental','cours/suites-geometriques',r=>{const a=r.int(2,8),q=r.pick([2,3]),n=r.int(2,3);return Q(`u₀ = ${a} et uₙ₊₁ = ${q}uₙ. Calcule u${n}.`,a*q**n,1,'Multiplie par la raison à chaque étape, ou utilise u₀ × qⁿ.',`u${n} = ${a} × ${q}^${n} = ${a*q**n}.`,[a,q,n,'pow','*']);});
  add('p-recurrence','premiere','suites','feuille','cours/suites',r=>{const a=4*r.int(2,10),b=2*r.int(1,6);return Q(`u₀ = ${a} et uₙ₊₁ = 0,5uₙ + ${b}. Calcule u₂.`,a+6*b,4,'Calcule u₁ avant de calculer u₂ ; la règle s’applique deux fois.',`u₁ = ${a/2+b}. Puis u₂ = 0,5 × ${a/2+b} + ${b} = ${a/4+1.5*b}.`,[a,2,'/',b,'+',2,'/',b,'+']);});
  add('p-derivee','premiere','derivees','feuille','cours/variations',r=>{const a=r.int(1,5),b=r.int(1,8),c=r.int(1,7),x=r.int(-2,4);return Q(`f(x) = ${a}x² + ${b}x + ${c}. Calcule f′(${x}).`,2*a*x+b,1,'Dérive d’abord : (ax² + bx + c)′ = 2ax + b.',`f′(x) = ${2*a}x + ${b} ; f′(${x}) = ${2*a} × (${x}) + ${b} = ${2*a*x+b}.`,[2,a,'*',x,'*',b,'+']);});
  add('p-tangente','premiere','derivees','feuille','cours/derivees',r=>{const a=r.int(1,5),v=r.int(2,12),s=r.pick([-3,-2,1,2,3]),d=r.int(1,3);return Q(`f(${a}) = ${v} et f′(${a}) = ${s}. Sur la tangente en x = ${a}, quelle est l’ordonnée pour x = ${a+d} ?`,v+s*d,1,'Sur la tangente, y = f(a) + f′(a)(x − a). Ce n’est pas nécessairement f(x).',`y = ${v} + (${s}) × (${a+d} − ${a}) = ${v+s*d}.`,[v,s,a+d,a,'-','*','+']);});
  add('p-moyenne-ponderee','premiere','statistiques','feuille','cours/statistiques-descriptives',r=>{const a=r.int(5,14),b=r.int(10,20),n=r.int(1,3),m=r.int(1,3);return Q(`Deux notes : ${a} coefficient ${n}, et ${b} coefficient ${m}. Calcule la moyenne pondérée.`,a*n+b*m,n+m,'Additionne les produits note × coefficient, puis divise par la somme des coefficients.',`(${a} × ${n} + ${b} × ${m})/(${n} + ${m}) = ${fraction(a*n+b*m,n+m)}.`,[a,n,'*',b,m,'*','+',n,m,'+','/']);});
  add('p-mediane','premiere','statistiques','mental','cours/statistiques-descriptives',r=>{const a=r.int(2,12),d=r.int(1,4);return Q(`Donne la médiane de cette série ordonnée : ${[0,1,2,3,4].map(i=>a+i*d).join(' ; ')}.`,a+2*d,1,'Avec cinq valeurs, la médiane est la troisième, pas la troisième moins la première.',`La troisième valeur est ${a+2*d} ; deux valeurs sont avant et deux après.`,[a,2,d,'*','+']);});
  add('p-point-moyen','premiere','statistiques','mental','cours/statistiques-deux-variables',r=>{const a=r.int(1,6),b=r.int(7,15),y=r.int(2,8),z=r.int(9,18);return Q(`Deux observations : (${a} ; ${y}) et (${b} ; ${z}). Donne l’abscisse du point moyen G.`,a+b,2,'L’abscisse de G est la moyenne des abscisses, sans utiliser les ordonnées.',`xG = (${a} + ${b})/2 = ${fraction(a+b,2)}.`,[a,b,'+',2,'/']);});
  add('p-conditionnelle','premiere','probabilites','mental','cours/probabilites-conditionnelles',r=>{const n=10*r.int(2,6),k=r.int(2,n-2);return Q(`Parmi ${n} élèves ayant choisi A, ${k} ont aussi choisi B. Calcule P(B sachant A).`,k,n,'La population de référence est celle qui a choisi A.',`P(B sachant A) = ${k}/${n} = ${fraction(k,n)}.`,[k,n,'/']);});
  add('p-contraire','premiere','probabilites','mental','cours/probabilites-conditionnelles',r=>{const a=r.int(1,9);return Q(`P(A) = ${fr(a/10)}. Calcule la probabilité de l’événement contraire de A.`,10-a,10,'Un événement et son contraire ont des probabilités dont la somme vaut 1.',`1 − ${fr(a/10)} = ${fr((10-a)/10)} = ${fraction(10-a,10)}.`,[1,a,10,'/','-']);});
  add('p-arbre','premiere','probabilites','feuille','cours/probabilites-conditionnelles',r=>{const a=r.int(1,4),b=r.int(1,3);return Q(`P(A) = ${b}/4 et P(B sachant A) = ${a}/5. Calcule P(A et B).`,a*b,20,'Multiplie les probabilités le long d’un même chemin.',`P(A et B) = (${b}/4) × (${a}/5) = ${fraction(a*b,20)}.`,[b,4,'/',a,5,'/','*']);});
  add('p-esperance','premiere','probabilites','feuille','cours/variables-aleatoires',r=>{const a=r.int(2,12),b=r.int(1,3);return Q(`X vaut ${a} avec probabilité ${b}/4, et 0 sinon. Calcule E(X).`,a*b,4,'Multiplie chaque valeur par sa probabilité, puis additionne.',`E(X) = ${a} × ${b}/4 + 0 × ${4-b}/4 = ${fraction(a*b,4)}.`,[a,b,4,'/','*',0,'+']);});
  add('t-somme-arithmetique','terminale','suites','feuille','terminale/cours/t-suites',r=>{const a=r.int(2,10),d=r.int(1,5),n=r.int(4,8),last=a+(n-1)*d,terms=Array.from({length:n},(_,i)=>a+i*d),ref=[terms[0]];for(const t of terms.slice(1))ref.push(t,'+');return Q(`Suite arithmétique : u₀ = ${a}, raison ${d}. Calcule u₀ + … + u${n-1}.`,n*(a+last),2,'Compte les termes : du rang 0 au rang n − 1, il y en a n.',`Dernier terme : ${last}. Somme = ${n} × (${a} + ${last})/2 = ${n*(a+last)/2}.`,ref);});
  add('t-somme-geometrique','terminale','suites','feuille','terminale/cours/t-suites',r=>{const a=r.int(1,6),n=r.int(3,5),terms=Array.from({length:n},(_,i)=>a*2**i),ref=[terms[0]];for(const t of terms.slice(1))ref.push(t,'+');return Q(`Suite géométrique : u₀ = ${a}, raison 2. Calcule u₀ + … + u${n-1}.`,a*(2**n-1),1,'Écris les quelques termes, ou utilise u₀(1 − qⁿ)/(1 − q).',`${terms.join(' + ')} = ${a*(2**n-1)}. Il y a ${n} termes.`,ref);});
  add('t-moyenne-geometrique','terminale','suites','mental','terminale/cours/t-suites',r=>{const a=r.int(2,6),b=r.int(2,8);return Q(`Calcule la moyenne géométrique de ${a*a} et ${b*b}.`,a*b,1,'Pour deux nombres positifs, elle vaut la racine carrée de leur produit.',`√(${a*a} × ${b*b}) = √((${a} × ${b})²) = ${a*b}.`,[a*a,b*b,'*','sqrt']);});
  add('t-taux-moyen','terminale','exponentielles','feuille','terminale/cours/t-exponentielles',r=>{const a=r.pick([8,9,11,12,15]);return Q(`En deux ans, une valeur passe de 100 à ${a*a}. Quel est le taux annuel moyen en % ?`,10*a-100,1,'Cherche le coefficient annuel positif dont le carré est le coefficient global.',`Coefficient global : ${a*a}/100 = (${a}/10)². Coefficient annuel : ${fr(a/10)} ; taux moyen : ${10*a-100} %.`,[a*a,100,'/','sqrt',1,'-',100,'*'],'%');});
  add('t-exponentielle','terminale','exponentielles','mental','terminale/cours/t-exponentielles',r=>{const a=r.int(2,9);return Q(`f(x) = ${a*a}^x. Calcule f(1/2).`,a,1,'Pour une base positive, a^(1/2) est la racine carrée de a.',`f(1/2) = √${a*a} = ${a}, car ${a}² = ${a*a}.`,[a*a,'sqrt']);});
  add('t-logarithme','terminale','logarithme','mental','terminale/cours/t-logarithme',r=>{const n=r.int(-3,5),v=n>=0?String(10**n):fr(10**n);return Q(`Calcule log(${v}), où log est le logarithme décimal.`,n,1,'Reconnais une puissance de 10 : log(10ⁿ) = n.',`${v} = 10^(${n}), donc log(${v}) = ${n}.`,[n]);});
  add('t-log-produit','terminale','logarithme','mental','terminale/cours/t-logarithme',r=>{const a=r.int(-3,4),b=r.int(-3,4);return Q(`Calcule log(10^(${a}) × 10^(${b})).`,a+b,1,'Additionne les exposants, puis utilise log(10ᵏ) = k.',`10^(${a}) × 10^(${b}) = 10^(${a+b}) ; le logarithme vaut ${a+b}.`,[a,b,'+']);});
  add('t-seuil','terminale','logarithme','feuille','terminale/cours/t-logarithme',r=>{const k=r.int(2,7);return Q(`Quel est le plus petit entier n ≥ 0 tel que 2ⁿ soit strictement supérieur à ${2**k} ?`,k+1,1,'Repère d’abord l’égalité, puis respecte le mot « strictement ».',`2^${k} = ${2**k} ne convient pas. 2^${k+1} = ${2**(k+1)} > ${2**k}. Le premier rang est ${k+1}.`,[k,1,'+']);});
  add('t-inverse','terminale','inverse','mental','terminale/cours/t-inverse',r=>{const k=r.int(2,15),x=r.pick([-5,-4,-3,-2,2,3,4,5]);return Q(`f(x) = ${k}/x pour x ≠ 0. Calcule f(${x}).`,k,x,'Remplace x par la valeur indiquée et simplifie la fraction.',`f(${x}) = ${k}/(${x}) = ${fraction(k,x)}.`,[k,x,'/']);});
  add('t-derivee-inverse','terminale','inverse','feuille','terminale/cours/t-inverse',r=>{const k=r.int(2,12),x=r.pick([-4,-3,-2,2,3,4]);return Q(`f(x) = ${k}/x pour x ≠ 0. Calcule f′(${x}).`,-k,x*x,'La dérivée de k/x est −k/x². Mets la valeur négative de x entre parenthèses.',`f′(${x}) = −${k}/(${x})² = ${fraction(-k,x*x)}.`,[0,k,'-',x,2,'pow','/']);});
  add('t-binomiale','terminale','binomiale','feuille','terminale/cours/t-binomiale',r=>{const n=r.int(3,5),c=n*(n-1)/2;return Q(`X suit la loi binomiale de paramètres n = ${n} et p = 1/2. Calcule P(X = 2).`,c,2**n,'Compte les choix des deux succès, puis multiplie par la probabilité d’un chemin.',`Il y a ${c} choix des deux succès. Chaque chemin a pour probabilité 1/2^${n}. Donc P(X = 2) = ${fraction(c,2**n)}.`,[n,2,'choose',2,n,'pow','/']);});
  add('t-esperance-binomiale','terminale','binomiale','mental','terminale/cours/t-binomiale',r=>{const n=4*r.int(2,8),a=r.int(1,3);return Q(`X suit la loi binomiale de paramètres n = ${n} et p = ${a}/4. Calcule E(X).`,n*a,4,'L’espérance d’une loi binomiale est n × p.',`E(X) = ${n} × ${a}/4 = ${n*a/4}.`,[n,a,4,'/','*']);});

  function bigintGcd(a,b) { a=a<0n?-a:a;b=b<0n?-b:b;while(b)[a,b]=[b,a%b];return a||1n; }
  function decimal(s) {
    if(!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(s)) return null;
    const sign=s[0]==='-'?-1n:1n; s=s.replace(/^[+-]/,'');
    const [a,b='']=s.split('.'); if(b.length>12) return null;
    return [sign*BigInt((a||'0')+b),10n**BigInt(b.length)];
  }
  function parse(value,unit='') {
    let s=String(value).trim().replace(/[−–—]/g,'-').replace(/\s+/g,'').replace(/,/g,'.');
    if(s.length>80||!s)return null;
    if(unit==='€'&&s.endsWith('€'))s=s.slice(0,-1);
    let percent=false;
    if(s.endsWith('%')){percent=unit!=='%';s=s.slice(0,-1);}
    const parts=s.split('/');if(parts.length>2)return null;
    const a=decimal(parts[0]),b=parts.length===2?decimal(parts[1]):[1n,1n];
    if(!a||!b||b[0]===0n)return null;
    let n=a[0]*b[1],d=a[1]*b[0]*(percent?100n:1n);if(d<0n){n=-n;d=-d;}
    const g=bigintGcd(n,d);return [n/g,d/g];
  }
  function check(value,q) { const a=parse(value,q.unit),b=parse(q.expected);return !!(a&&b&&a[0]===b[0]&&a[1]===b[1]); }
  function eligible({level='bac',method='mixte',topic='all'}={}) {
    if(!['bac','bases','premiere','terminale'].includes(level))throw new Error('Niveau inconnu');
    if(!['mixte','mental','feuille'].includes(method))throw new Error('Méthode inconnue');
    return registry.filter(t=>(level==='bac'?t.level!=='terminale':t.level===level)&&(method==='mixte'||t.method===method)&&(topic==='all'||t.topic===topic));
  }
  function generate(id,seed=1) {
    const t=registry.find(t=>t.id===id);if(!t)throw new Error('Modèle inconnu');
    const q=t.fn(random(seed));
    if(!q.prompt||!q.hint||!q.solution||!parse(q.expected))throw new Error('Question incomplète');
    return {...q,id:t.id,level:t.level,topic:t.topic,method:t.method,course:t.course};
  }
  function session(options={}) {
    const {count=10,seed=1}=options;
    if(!Number.isInteger(count)||count<1||count>20)throw new Error('Nombre de questions invalide');
    const pool=eligible(options);if(!pool.length)return [];
    const r=random(seed),deck=[];
    while(deck.length<count){const batch=pool.slice();for(let i=batch.length-1;i>0;i--){const j=r.int(0,i);[batch[i],batch[j]]=[batch[j],batch[i]];}deck.push(...batch);}
    const seen=new Set();
    return deck.slice(0,count).map(t=>{let q;for(let tries=0;tries<60;tries++){q=generate(t.id,r.int(0,2147483647));if(!seen.has(q.prompt))break;}seen.add(q.prompt);return q;});
  }
  const api={templates:registry.map(({fn,...meta})=>Object.freeze(meta)),topics:Object.freeze(topics),eligible,generate,session,parse,check,fraction};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.QuickMath=api;
})();
