/* Aides progressives : probabilités conditionnelles, Bernoulli et variables aléatoires. */
(()=>{
'use strict';
window.ExerciseCoaching.register("probabilites-conditionnelles", [
  [
    "L'union A ∪ B compte les éléments appartenant à au moins un des événements.",
    "Additionne les effectifs de A et B en retirant l'intersection comptée deux fois.",
    "calcule l'effectif de l'union avec A + B − intersection ; pour une probabilité, divise l'effectif favorable par l'effectif total et utilise 1 − P(A) pour le complémentaire.",
    "ne compte pas les personnes de l'intersection deux fois et conserve le même effectif total au dénominateur.",
    [
      "Si |A| = 5, |B| = 4 et |A ∩ B| = 2, combien d'éléments dans A ∪ B ?",
      "7",
      "5 + 4 − 2 = 7."
    ]
  ],
  [
    "Une probabilité conditionnelle est une proportion calculée dans le groupe connu.",
    "Repère quel groupe suit la barre verticale | et prends son effectif comme dénominateur.",
    "pour une probabilité sachant un groupe, divise l’effectif favorable de ce groupe par l’effectif du groupe ; pour la probabilité globale, additionne les cas favorables des deux groupes puis divise par l’effectif total.",
    "une probabilité sachant un groupe ne se divise pas par l’effectif total.",
    [
      "Sur 6 utilisateurs mobiles, 3 sont abonnés. Que vaut P(abonné | mobile) ?",
      "0.5",
      "3/6 = 0,5."
    ]
  ],
  [
    "Inverser la condition change le groupe utilisé comme dénominateur.",
    "Compte tout le groupe qui suit la barre « | » avant de chercher la part de l’autre événement parmi lui.",
    "pour P(A | B), divise l’effectif de l’intersection par l’effectif de B. Pour une probabilité simple ou une intersection, divise par le total général.",
    "ne confonds pas P(A | B) avec P(B | A) : inverser le conditionnement change le dénominateur.",
    [
      "Parmi 8 abonnés, 3 utilisent un mobile. Que vaut P(mobile | abonné) ?",
      "0.375",
      "3/8 = 0,375."
    ]
  ],
  [
    "Dans un arbre, la probabilité d'un chemin est le produit des probabilités sur ses branches.",
    "Commence par trouver la probabilité de l'événement non A.",
    "multiplie les probabilités le long du chemin A puis B et non A puis B ; additionne ensuite ces deux chemins incompatibles pour obtenir P(B).",
    "sur un même chemin on multiplie ; entre deux chemins distincts menant à B on additionne.",
    [
      "Si P(A) = 0,5 et P(B | A) = 0,4, que vaut P(A ∩ B) ?",
      "0.2",
      "0,5 × 0,4 = 0,2."
    ]
  ],
  [
    "Deux événements indépendants vérifient P(A ∩ B) = P(A) × P(B).",
    "Calcule le produit des probabilités données.",
    "compare le produit à la probabilité de l'intersection ; pour l'union, utilise P(A) + P(B) − P(A ∩ B).",
    "indépendance n'est pas incompatibilité : deux événements indépendants peuvent arriver ensemble.",
    [
      "Si P(A) = 0,5 et P(B) = 0,2 et s'ils sont indépendants, combien vaut P(A ∩ B) ?",
      "0.1",
      "0,5 × 0,2 = 0,1."
    ]
  ],
  [
    "L’indépendance se teste en comparant P(A ∩ B) et P(A)P(B).",
    "Écris séparément le produit P(A)P(B) et l'intersection donnée.",
    "si ces deux résultats sont égaux, les événements sont indépendants ; sinon, ils ne le sont pas. Pour la probabilité conditionnelle, divise P(A ∩ B) par P(A).",
    "pour P(B | A), le dénominateur est P(A), pas P(B).",
    [
      "Si P(A ∩ B) = 0,2 et P(A) = 0,4, combien vaut P(B | A) ?",
      "0.5",
      "0,2/0,4 = 0,5."
    ]
  ],
  [
    "Dans un tableau d'effectifs, une fréquence conditionnelle se calcule au sein de la catégorie connue.",
    "Sépare le nombre de cas favorables dans chaque groupe et l’effectif de chaque groupe.",
    "dans chaque groupe, divise les cas favorables par l’effectif du groupe ; pour le total, additionne les cas favorables puis divise par la population entière.",
    "un groupe et la population entière n'ont pas le même dénominateur.",
    [
      "Sur 30 personnes, 12 achètent. Quelle est la fréquence d'achat ?",
      "0.4",
      "12/30 = 0,4."
    ]
  ],
  [
    "Pour trouver P(D | T), il faut d’abord calculer P(T) avec la formule des probabilités totales.",
    "Calcule les deux chemins de l’arbre qui mènent à T : D puis T, et non D puis T.",
    "multiplie les probabilités sur chacun des deux chemins ; additionne-les pour P(T), puis divise P(D ∩ T) par P(T) : c’est l’inversion du conditionnement.",
    "le taux de détection P(T | D) ne représente pas directement P(D | T).",
    [
      "Si 10 % des objets sont défectueux et 90 % de ceux-ci sont détectés, que vaut P(défaut ∩ positif) ?",
      "0.09",
      "0,10 × 0,90 = 0,09."
    ]
  ]
]);
window.ExerciseCoaching.register("bernoulli", [
  [
    "Une épreuve de Bernoulli a exactement deux issues : succès ou échec.",
    "Repère la probabilité du succès p avant de chercher celle de l'échec.",
    "utilise P(échec) = 1 − p et rappelle qu'il n'existe que deux résultats possibles pour cette épreuve.",
    "les deux probabilités doivent avoir une somme de 1.",
    [
      "Si P(succès) = 0,7, combien vaut P(échec) ?",
      "0.3",
      "1 − 0,7 = 0,3."
    ]
  ],
  [
    "Lors d'essais indépendants, les probabilités d'un chemin se multiplient.",
    "Calcule q = 1 − p puis distingue SS, SE et EE.",
    "multiplie p par p pour SS, p par q pour SE et q par q pour EE ; l'ordre S puis E compte dans un chemin précis.",
    "P(SE) ne doit pas être doublée si l'on demande précisément le chemin SE.",
    [
      "Pour deux essais avec p = 0,5, quelle est la probabilité de SS ?",
      "0.25",
      "0,5 × 0,5 = 0,25."
    ]
  ],
  [
    "Exactement un succès en deux essais correspond à deux chemins possibles : SE ou ES.",
    "Trouve d'abord q = 1 − p.",
    "calcule p × q sur chaque chemin, additionne-les pour un seul succès, puis utilise q² pour aucun et 1 − q² pour au moins un.",
    "la formule « au moins un » se calcule souvent plus simplement avec l'événement contraire.",
    [
      "Pour deux essais avec p = 0,5, quelle est la probabilité d'exactement un succès ?",
      "0.5",
      "Les chemins SE et ES valent chacun 0,25 : somme 0,5."
    ]
  ],
  [
    "Pour trois essais indépendants, les chemins identiques se comptent avec leur multiplicité.",
    "Calcule q puis écris une probabilité pour trois succès et une pour trois échecs.",
    "utilise p³ pour SSS et q³ pour EEE ; exactement deux succès correspond à trois ordres, donc 3 × p² × q.",
    "ne confonds pas exactement deux succès et au moins deux succès.",
    [
      "Avec trois essais et p = 0,5, quelle est la probabilité d'exactement deux succès ?",
      "0.375",
      "Il existe 3 chemins, chacun de probabilité 0,5³ : 3/8 = 0,375."
    ]
  ],
  [
    "L'événement « au moins un succès » est le contraire de « aucun succès ».",
    "Calcule d'abord q = 1 − p et la probabilité d'aucun succès.",
    "pour trois essais, calcule q³, puis 1 − q³ ; pour exactement un succès, compte les trois positions possibles du succès.",
    "attention : un succès exactement et au moins un succès ne signifient pas la même chose.",
    [
      "Avec trois essais et p = 0,5, quelle est la probabilité d'au moins un succès ?",
      "0.875",
      "1 − (0,5)³ = 1 − 0,125 = 0,875."
    ]
  ],
  [
    "Dans quatre essais indépendants, la probabilité d'un chemin répété se calcule par une puissance.",
    "Commence par q = 1 − p.",
    "utilise q⁴ pour aucun succès, 1 − q⁴ pour au moins un et p⁴ pour quatre succès.",
    "pour quatre succès il faut multiplier p quatre fois, et non ajouter p quatre fois.",
    [
      "Avec quatre essais et p = 0,5, quelle est la probabilité de quatre succès ?",
      "0.0625",
      "0,5⁴ = 1/16 = 0,0625."
    ]
  ],
  [
    "Avec remise, le contenu de l'urne redevient identique après chaque tirage.",
    "Compare ce qui change entre deux tirages avec remise et sans remise.",
    "avec remise, deux tirages rouges indépendants ont une probabilité (r/N) × (r/N), où r est le nombre de jetons rouges ; sans remise, les probabilités du second tirage dépendent du premier.",
    "sans remise, le contenu de l’urne change après le premier tirage : les tirages ne sont pas indépendants.",
    [
      "Dans une urne de 4 jetons dont 1 rouge, probabilité de deux rouges avec remise ?",
      "0.0625",
      "(1/4)² = 1/16 = 0,0625."
    ]
  ],
  [
    "Au moins deux succès en trois essais rassemble les cas de deux et de trois succès.",
    "Calcule séparément P(exactement 2 succès) et P(3 succès).",
    "utilise 3p²q pour deux succès puis p³ pour trois succès ; additionne ces deux cas incompatibles.",
    "le facteur 3 correspond aux trois positions possibles de l'unique échec.",
    [
      "Avec trois essais et p = 0,5, quelle est la probabilité d'au moins deux succès ?",
      "0.5",
      "3 × (0,5)³ + (0,5)³ = 4/8 = 0,5."
    ]
  ]
]);
window.ExerciseCoaching.register("variables-aleatoires", [
  [
    "Une variable indicatrice vaut 1 quand l'événement arrive et 0 sinon.",
    "Compte le nombre d'issues du dé qui vérifient la condition.",
    "divise les issues favorables par le nombre de faces pour obtenir P(X = 1), puis fais le complément à 1 ; pour une variable de Bernoulli, l’espérance vaut P(X = 1).",
    "P(X = 0) et P(X = 1) doivent totaliser 1.",
    [
      "Avec un dé, si le succès correspond à 3 faces sur 6, que vaut P(succès) ?",
      "0.5",
      "3/6 = 0,5."
    ]
  ],
  [
    "L'espérance d'une variable discrète est une moyenne pondérée par les probabilités.",
    "Contrôle d'abord que la somme des probabilités vaut 1.",
    "calcule E(X) en multipliant chaque valeur par sa probabilité puis en additionnant ; pour P(X ≥ k), additionne les probabilités des valeurs supérieures ou égales à k.",
    "une probabilité et une valeur prise par X jouent des rôles différents dans l'espérance.",
    [
      "Si P(X=0)=0,2, P(X=1)=0,3 et P(X=2)=0,5, que vaut E(X) ?",
      "1.3",
      "0 × 0,2 + 1 × 0,3 + 2 × 0,5 = 1,3."
    ]
  ],
  [
    "L'espérance d'un gain s'obtient en multipliant chaque gain ou perte par sa probabilité.",
    "Associe le signe négatif à la perte et le signe positif au gain.",
    "écris E(X) = gain positif × sa probabilité − montant perdu × probabilité de perte ; compare le résultat à zéro pour conclure.",
    "une espérance négative ne signifie pas qu'on perdra à chaque partie.",
    [
      "On perd 2 € avec probabilité 0,5 et gagne 4 € avec probabilité 0,5. Espérance ? ",
      "1",
      "−2 × 0,5 + 4 × 0,5 = 1 €."
    ]
  ],
  [
    "La variable de Bernoulli d'un seul essai vaut 0 ou 1 ; le nombre attendu de succès sur n essais est différent.",
    "Calcule d'abord P(X = 0) et E(X) pour un seul essai.",
    "utilise P(X = 0) = 1 − p et E(X) = p ; pour n essais, multiplie n par p sans confondre ce total avec E(X).",
    "l'espérance de la variable X d'un essai n'est pas n × p.",
    [
      "Pour 10 essais avec p = 0,3, quel est le nombre moyen de succès ?",
      "3",
      "10 × 0,3 = 3."
    ]
  ],
  [
    "Pour savoir si un jeu est favorable, calcule l'espérance en tenant compte des pertes.",
    "Associe la probabilité à chaque montant, y compris le gain négatif.",
    "écris E(X) = gain × P(gain) − perte × P(perte) ; le résultat est favorable si l'espérance est positive.",
    "les probabilités de gain et de perte totalisent 1, mais les montants peuvent être différents.",
    [
      "On gagne 10 € avec probabilité 0,2 et perd 2 € avec probabilité 0,8. Espérance ?",
      "0.4",
      "10 × 0,2 − 2 × 0,8 = 0,4 €."
    ]
  ],
  [
    "La fréquence observée est un rapport d'effectifs ; elle n'est pas toujours égale à la probabilité théorique.",
    "Distingue le nombre de succès réellement observé et le nombre moyen attendu.",
    "calcule fréquence = succès observés / effectif ; calcule effectif moyen = n × p, puis soustrais p à la fréquence.",
    "ne confonds pas fréquence exprimée entre 0 et 1 et effectif exprimé en nombre de succès.",
    [
      "Sur 100 essais, 30 succès sont observés. Quelle est la fréquence ?",
      "0.3",
      "30/100 = 0,3."
    ]
  ],
  [
    "Un échantillon peut avoir une fréquence différente de la probabilité théorique.",
    "Calcule le rapport nombre de succès / nombre d'essais.",
    "compare la fréquence observée f à p, puis calcule la différence f − p en conservant son signe.",
    "une fluctuation statistique ne signifie pas que le modèle théorique est forcément faux.",
    [
      "Sur 50 essais, on compte 10 succès. Quelle est la fréquence ?",
      "0.2",
      "10/50 = 0,2."
    ]
  ],
  [
    "La proximité d'une fréquence à p se juge par l'écart absolu |f − p|.",
    "Calcule les deux fréquences sans oublier que les effectifs diffèrent.",
    "divise les succès par 100 pour le premier échantillon et par 200 pour le second, puis calcule les deux écarts absolus à p.",
    "la fréquence la plus proche de p a le plus petit écart absolu, pas nécessairement le plus petit nombre de succès.",
    [
      "Si p=0,5, que vaut l'écart absolu d'une fréquence f=0,6 ?",
      "0.1",
      "|0,6 − 0,5| = 0,1."
    ]
  ]
]);
})();
