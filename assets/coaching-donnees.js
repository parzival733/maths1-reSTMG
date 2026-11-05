/* Aides progressives : statistiques descriptives et Python/tableur. */
(()=>{
'use strict';
window.ExerciseCoaching.register("statistiques-descriptives", [
  [
    "Une fréquence est un effectif rapporté à l'effectif total.",
    "Repère le nombre de personnes appartenant à la catégorie étudiée.",
    "calcule fréquence = effectif de la catégorie / total, puis pourcentage = fréquence × 100. Pour le complément, soustrais l'effectif de la catégorie au total.",
    "une fréquence entre 0 et 1 et un pourcentage entre 0 et 100 représentent la même proportion.",
    [
      "Sur 40 personnes, 12 viennent à vélo. Quelle est leur fréquence ?",
      "0.3",
      "12/40 = 0,3."
    ]
  ],
  [
    "La moyenne est la somme des valeurs divisée par leur nombre ; l'étendue est la différence entre extrêmes.",
    "Compte les valeurs avant de calculer leur somme.",
    "divise la somme par l'effectif pour la moyenne, puis soustrais la plus petite valeur à la plus grande pour l'étendue.",
    "l'étendue n'est pas une moyenne : elle ne nécessite pas de division.",
    [
      "Quelle est la moyenne de 2 ; 4 ; 6 ; 8 ?",
      "5",
      "(2 + 4 + 6 + 8)/4 = 5."
    ]
  ],
  [
    "Une moyenne pondérée prend en compte les coefficients de chaque valeur.",
    "Multiplie chaque note par son coefficient avant d'additionner.",
    "calcule somme pondérée = note1 × coefficient1 + note2 × coefficient2 ; divise ensuite par la somme des coefficients.",
    "ne divise pas par le nombre de notes si leurs coefficients ne sont pas identiques.",
    [
      "Notes 6 coefficient 1 et 12 coefficient 2 : moyenne pondérée ?",
      "10",
      "(6 × 1 + 12 × 2)/(1 + 2) = 10."
    ]
  ],
  [
    "Médiane et quartiles se déterminent à partir d'une série ordonnée.",
    "Repère les positions centrales et les rangs des quartiles.",
    "pour n valeurs (n pair), fais la moyenne des deux valeurs centrales pour la médiane ; Q₁ et Q₃ sont les valeurs de rangs n/4 et 3n/4 arrondis à l’entier supérieur ; calcule enfin Q₃ − Q₁.",
    "attention au rang des quartiles : ici on utilise les rangs arrondis à l'entier supérieur.",
    [
      "Dans 1 ; 3 ; 5 ; 7 ; 9 ; 11 ; 13 ; 15, quelle est la médiane ?",
      "8",
      "Les deux valeurs centrales sont 7 et 9 : (7 + 9)/2 = 8."
    ]
  ],
  [
    "L'écart-type est la racine carrée de la variance.",
    "Calcule la moyenne puis les écarts des valeurs à cette moyenne.",
    "élève au carré chacun des écarts, calcule leur moyenne pour obtenir la variance, puis prends sa racine carrée et arrondis au centième.",
    "la variance s'exprime au carré des unités ; seul l'écart-type retrouve l'unité de la série.",
    [
      "Quelle est la variance (avec division par 4) de 1 ; 3 ; 3 ; 5 ?",
      "2",
      "Moyenne 3 ; carrés des écarts : 4, 0, 0, 4 ; variance = 8/4 = 2."
    ]
  ],
  [
    "Pour des catégories distinctes, l'effectif de A ou B est la somme des deux effectifs.",
    "Repère le total et les effectifs de chaque catégorie.",
    "calcule fréquence A = effectif A / total et fréquence B = effectif B / total ; additionne ensuite les effectifs disjoints A et B pour leur union.",
    "si les catégories sont disjointes, il n'y a pas d'intersection à soustraire.",
    [
      "Dans un groupe, A compte 5 et B compte 7 personnes distinctes. Combien dans A ou B ?",
      "12",
      "5 + 7 = 12."
    ]
  ],
  [
    "Deux séries de même moyenne peuvent avoir des dispersions différentes.",
    "Calcule les deux moyennes avant de comparer les étendues.",
    "cherche pour chaque série le maximum et le minimum, puis calcule étendue = maximum − minimum ; compare les deux résultats.",
    "une plus grande étendue signifie davantage de dispersion selon cet indicateur, pas une moyenne supérieure.",
    [
      "Pour 1 ; 2 ; 4 ; 5, quelle est l'étendue ?",
      "4",
      "5 − 1 = 4."
    ]
  ],
  [
    "La médiane se situe au centre de la liste triée, tandis que la moyenne dépend de toutes les valeurs.",
    "Vérifie l'ordre des six nombres et trouve les troisième et quatrième.",
    "calcule la moyenne avec la somme divisée par six ; calcule la médiane avec (troisième + quatrième)/2, puis soustrais la plus petite valeur à la plus grande.",
    "dans une série de six valeurs, la médiane est la moyenne des deux valeurs centrales.",
    [
      "Quelle est la médiane de 1 ; 1 ; 1 ; 7 ; 9 ; 11 ?",
      "4",
      "La troisième valeur vaut 1, la quatrième 7, donc (1 + 7)/2 = 4."
    ]
  ]
]);
window.ExerciseCoaching.register("python-tableur", [
  [
    "En Python, une affectation remplace la valeur actuelle d'une variable.",
    "Exécute les instructions dans l'ordre donné, de haut en bas.",
    "écris la nouvelle valeur de x après l'addition, puis utilise cette valeur mise à jour pour calculer y ; x = x + a n'est pas une équation à résoudre.",
    "si x change avant le calcul de y, c'est le nouveau x qui est utilisé.",
    [
      "En Python, x = 3 puis x = x + 2 puis y = x * 4. Combien vaut y ?",
      "20",
      "x devient 5, puis y = 5 × 4 = 20."
    ]
  ],
  [
    "Une condition if teste une affirmation vraie ou fausse.",
    "Compare chaque nombre au seuil avec l’opérateur indiqué (>= ou >).",
    "si le test est vrai, le programme affiche le premier message ; sinon le second. Teste aussi exactement le seuil : >= accepte l’égalité, > la refuse.",
    "l’opérateur >= signifie supérieur OU égal ; > signifie strictement supérieur.",
    [
      "Si on teste points >= 10 avec points = 10, le résultat est-il accepté ou refusé ?",
      "accepté",
      "L'égalité compte, car 10 >= 10 est vrai."
    ]
  ],
  [
    "Une fonction Python renvoie la valeur calculée par son instruction return.",
    "Remplace le paramètre par la valeur passée à la fonction.",
    "évalue l’expression renvoyée en commençant par le produit du tarif par le paramètre, puis ajoute la partie fixe, pour chacune des valeurs demandées.",
    "le paramètre change à chaque appel, mais la formule reste la même.",
    [
      "Si prix(h) renvoie 5 + 2*h, combien vaut prix(3) ?",
      "11",
      "5 + 2 × 3 = 11."
    ]
  ],
  [
    "Les indices d'une liste Python commencent à zéro.",
    "Écris les positions 0, 1, 2… sous les éléments de la liste.",
    "notes[0] renvoie le premier élément, notes[1] le deuxième, etc. ; len(notes) compte les éléments de la liste.",
    "le troisième élément a l'indice 2, pas l'indice 3.",
    [
      "Si notes = [3, 5, 7], combien vaut notes[2] ?",
      "7",
      "L'élément d'indice 2 est le troisième : 7."
    ]
  ],
  [
    "Affecter notes[1] modifie un élément ; append ajoute un nouvel élément à la fin.",
    "Fais d’abord la modification à l’indice indiqué, puis l’ajout.",
    "recopie la liste après l’affectation notes[i] = nouvelle valeur, puis ajoute la valeur de append en dernière position. Compte enfin les éléments.",
    "remplacer un élément ne change pas la longueur ; append l'augmente de un.",
    [
      "notes = [1,2,3], puis notes[1] = 9. Combien vaut notes[1] ?",
      "9",
      "L'indice 1 est le deuxième élément, qui devient 9."
    ]
  ],
  [
    "Une boucle répète une opération pour les valeurs de range, en commençant à zéro.",
    "Calcule la somme de la liste puis examine chaque valeur face au seuil.",
    "pour le compteur, sélectionne chaque nombre ≥ seuil ; range(n) parcourt exactement n valeurs, de 0 à n − 1.",
    "range(n) ne compte pas n + 1 passages : la dernière valeur est n − 1.",
    [
      "Combien de passages produit range(5) ?",
      "5",
      "Les indices sont 0, 1, 2, 3 et 4 : cinq passages."
    ]
  ],
  [
    "Dans un tableur, un pourcentage s'applique avec un coefficient multiplicateur.",
    "Repère les cellules de valeur et de taux sur la même ligne.",
    "écris =A2*(1+B2) pour une hausse ou =A2*(1-B2) pour une baisse ; lors de la recopie en ligne 3, les références relatives deviennent A3 et B3.",
    "le taux inscrit en B2 représente une proportion : ajouter B2 directement au prix serait incorrect.",
    [
      "Si A2 = 100 et B2 = 10 %, que vaut =A2*(1+B2) ?",
      "110",
      "100 × 1,10 = 110."
    ]
  ],
  [
    "Un fichier CSV sépare les valeurs en colonnes et comporte souvent une ligne d'en-tête.",
    "Sépare les lignes de données de la ligne qui nomme les colonnes.",
    "compte les lignes de données, additionne les ventes, divise leur somme par le nombre de lignes, puis retrouve l’année correspondant à la valeur maximale.",
    "la ligne d'en-tête ne compte pas comme une vente ; l'année du maximum se lit sur la même ligne.",
    [
      "CSV : 2020,3 puis 2021,7 puis 2022,5. Quelle est l'année du maximum ?",
      "2021",
      "La valeur maximale est 7 et se trouve sur la ligne 2021."
    ]
  ]
]);
})();
