/* Aides progressives pour dérivées, variations et statistiques à deux variables. */
(()=>{
'use strict';
window.ExerciseCoaching.register("derivees", [
  [
    "La pente d'une sécante compare deux points d'une courbe.",
    "Calcule séparément les deux images aux abscisses indiquées.",
    "utilise le quotient (f(x₂) − f(x₁))/(x₂ − x₁) avec les deux abscisses de l’énoncé ; au numérateur, la variation verticale et au dénominateur, la variation horizontale.",
    "le taux de variation se calcule avec une différence de deux images, pas leur somme.",
    [
      "Avec f(x) = x², quelle est la pente de la sécante entre x = 1 et x = 3 ?",
      "4",
      "(9 − 1)/(3 − 1) = 4."
    ]
  ],
  [
    "Le nombre dérivé est la limite des pentes des sécantes quand l'écart h devient très petit.",
    "Repère d'abord l'abscisse fixe du point et les deux valeurs de h.",
    "calcule [f(x + h) − f(x)]/h pour h = 0,1 puis h = 0,01 ; compare avec la limite obtenue lorsque h tend vers 0.",
    "ne remplace pas h par zéro dans une fraction dont le dénominateur contient h.",
    [
      "Pour f(x) = x², combien vaut f′(3) ?",
      "6",
      "La dérivée de x² est 2x : 2 × 3 = 6."
    ]
  ],
  [
    "Le nombre dérivé en un point est la pente de la tangente en ce point.",
    "Lis le coefficient devant x dans l'équation de la tangente.",
    "dans y = mx + b, la pente donne f′(x₀) ; remplace ensuite x par l'abscisse du point de tangence pour obtenir f(x₀).",
    "le terme constant b n'est pas la pente : la pente est le coefficient de x.",
    [
      "Quelle est la pente de la droite y = 4x + 1 ?",
      "4",
      "Le coefficient de x est 4."
    ]
  ],
  [
    "Une tangente à f(x) au point x₀ a pour pente f′(x₀) et passe par (x₀ ; f(x₀)).",
    "Calcule la valeur de la fonction puis sa dérivée à l'abscisse indiquée.",
    "forme m = f′(x₀), puis l’équation y = m(x − x₀) + f(x₀). Développe-la pour isoler l’ordonnée à l’origine.",
    "l’ordonnée à l’origine se calcule avec le point de tangence : p = f(x₀) − m x₀.",
    [
      "Pour f(x) = x², quelle est la pente de la tangente en x = 2 ?",
      "4",
      "f′(x) = 2x, donc f′(2) = 4."
    ]
  ],
  [
    "La dérivée d'une fonction affine ax + b est la constante a.",
    "Cherche le coefficient de x avant d'étudier la variation.",
    "recopie a comme valeur de la dérivée, calcule l’image en remplaçant x par l’abscisse demandée, puis examine le signe de a pour le sens de variation.",
    "la constante ajoutée à la fonction n'intervient pas dans sa dérivée.",
    [
      "Si g(x) = 5x + 2, combien vaut g′(2) ?",
      "5",
      "La dérivée de g est 5 partout."
    ]
  ],
  [
    "Pour une petite variation de x, la dérivée estime la variation de la fonction.",
    "Calcule le coût au point de départ et la dérivée en ce point.",
    "applique l'approximation C(x + 0,1) ≈ C(x) + 0,1 × C′(x), en gardant les unités en euros.",
    "l'augmentation estimée est 0,1 × la pente, pas la pente entière.",
    [
      "Si C(10) = 100 et C′(10) = 8, estime C(10,1).",
      "100.8",
      "100 + 0,1 × 8 = 100,8."
    ]
  ],
  [
    "Le signe du coefficient directeur d’une tangente donne son sens de variation.",
    "Calcule d'abord l'ordonnée du point où elle touche la courbe.",
    "écris la droite y = mx + p, remplace x par l’abscisse du point et y par l’image ; résous pour p, puis observe le signe de m.",
    "le carré d’un nombre négatif est positif, mais la pente de la tangente peut être négative.",
    [
      "La droite y = −2x + b passe par (1 ; 3). Combien vaut b ?",
      "5",
      "3 = −2 × 1 + b, donc b = 5."
    ]
  ],
  [
    "La tangente et la courbe partagent le même point au point de tangence.",
    "Utilise les coordonnées du point pour f(x₀), puis la pente indiquée pour f′(x₀).",
    "écris y = mx + b avec la pente connue ; impose le passage par A pour trouver b, puis substitue l'abscisse demandée.",
    "attention à ne pas confondre la pente de la tangente avec son ordonnée à l'origine.",
    [
      "Une droite de pente −3 passe par (2 ; 4). Combien vaut b dans y = −3x + b ?",
      "10",
      "4 = −6 + b donne b = 10."
    ]
  ]
]);
window.ExerciseCoaching.register("variations", [
  [
    "On dérive un polynôme terme à terme.",
    "Repère les termes en x², en x et la constante.",
    "utilise (ax²)′ = 2ax, (bx)′ = b et (c)′ = 0 ; remplace ensuite x par la valeur demandée.",
    "la dérivée d'une constante est zéro ; veille au signe du coefficient de x.",
    [
      "Dans f(x) = 3x² − 4x + 1, quel est le coefficient de x dans f′(x) ?",
      "6",
      "f′(x) = 6x − 4."
    ]
  ],
  [
    "La dérivée de x³ est 3x² et celle de x² est 2x.",
    "Dérive le terme cubique puis le terme quadratique.",
    "écris g′(x) = 3ax² + 2bx avec les coefficients de g (et leurs signes), puis remplace x par la valeur demandée.",
    "n'oublie ni les exposants qui diminuent de un, ni le signe du terme négatif.",
    [
      "Si g(x) = x³ − 2x², combien vaut g′(2) ?",
      "4",
      "g′(x) = 3x² − 4x ; en x = 2, cela vaut 12 − 8 = 4."
    ]
  ],
  [
    "Le signe de la dérivée donne le sens de variation de la fonction.",
    "Cherche d'abord la valeur qui annule f′(x).",
    "écris f′(x) = 2a(x − h), étudie son signe de part et d’autre de h (il dépend du signe de a), puis calcule f(h), valeur de l’extremum.",
    "le zéro de la dérivée est l’abscisse de l’extremum et non sa valeur.",
    [
      "Pour f(x) = (x − 3)² − 5, quelle est la valeur minimale ?",
      "-5",
      "Le carré est nul pour x = 3, donc le minimum vaut −5."
    ]
  ],
  [
    "Une parabole tournée vers le bas atteint un maximum à son sommet.",
    "Calcule d’abord B′(x) à partir de l’expression développée.",
    "lis les coefficients de B′(x) = ax + b ; annule B′ pour retrouver la quantité optimale, évalue B en ce point, puis convertis selon l’unité de l’énoncé.",
    "ne confonds pas la quantité optimale en abscisse et le montant du bénéfice maximal.",
    [
      "Pour B(x) = −2(x − 3)² + 12, quelle quantité maximise B ?",
      "3",
      "Le maximum est atteint quand x − 3 = 0."
    ]
  ],
  [
    "Une dérivée factorisée en (x − r)(x + r) s'annule en deux valeurs opposées.",
    "Commence par trouver les deux racines du facteur x² − d².",
    "sépare l’intervalle en trois parties ; entre −d et d, x² − d² est négatif, puis tiens compte du signe du coefficient devant. Calcule ensuite les valeurs de la fonction aux zéros.",
    "une dérivée négative indique une fonction décroissante, une dérivée positive une fonction croissante.",
    [
      "La dérivée 3(x² − 4) a combien de zéros réels ?",
      "2",
      "x² − 4 = 0 pour x = −2 et x = 2."
    ]
  ],
  [
    "Factoriser la dérivée permet de repérer ses zéros et son signe.",
    "Mets en facteur le coefficient commun et x.",
    "écris p′(x) = m × x × (x − A), puis étudie le signe du produit entre les deux zéros 0 et A, sans oublier le signe de m.",
    "entre les deux zéros, x et x − A sont de signes contraires.",
    [
      "Quel est le second zéro de p′(x) = 2x(x − 5) ?",
      "5",
      "La dérivée s'annule pour x = 0 ou x = 5."
    ]
  ],
  [
    "La dérivée d'un coût sert à estimer une petite hausse de production.",
    "Commence par calculer C(x) et C′(x) à l'abscisse indiquée.",
    "multiplie la dérivée par la variation 0,1 ; cette valeur est une hausse estimée, pas le nouveau coût total.",
    "attention aux unités : C′(x) exprime un coût par unité ; il faut le multiplier par 0,1.",
    [
      "Si C′(10) = 14, quelle est la hausse estimée pour 0,1 unité ?",
      "1.4",
      "14 × 0,1 = 1,4."
    ]
  ],
  [
    "Pour optimiser une recette quadratique, examine le signe de sa dérivée.",
    "Calcule les coefficients de la dérivée avant de trouver son zéro.",
    "annule R′(x) pour trouver x optimal, puis évalue R(0), R(x optimal) et R à l'autre borne pour comparer les recettes.",
    "le maximum sur un intervalle se vérifie aussi aux bornes, pas seulement au point critique.",
    [
      "Pour R(x) = −(x − 4)² + 20, quelle est la recette maximale ?",
      "20",
      "Au sommet x = 4, le carré est nul, donc R = 20."
    ]
  ]
]);
window.ExerciseCoaching.register("statistiques-deux-variables", [
  [
    "Le point moyen a pour coordonnées les moyennes séparées des abscisses et des ordonnées.",
    "Compte d'abord les couples puis additionne les x et les y séparément.",
    "divise chacune des deux sommes par le nombre de couples : x moyen = somme des x / effectif et y moyen = somme des y / effectif.",
    "le point moyen n'est pas un des couples observés par obligation.",
    [
      "Pour les points (1 ; 2) et (3 ; 6), quelle est l'ordonnée moyenne ?",
      "4",
      "(2 + 6)/2 = 4."
    ]
  ],
  [
    "Une droite passant par deux points est déterminée par une pente et une ordonnée à l'origine.",
    "Calcule le changement de y puis le changement de x entre A et B.",
    "utilise a = (yB − yA)/(xB − xA), puis b = yA − a × xA. Pour prévoir, remplace x par la valeur demandée dans y = ax + b.",
    "soustrais les coordonnées dans le même ordre au numérateur et au dénominateur.",
    [
      "Pour A(1 ; 3) et B(3 ; 7), quelle est la pente de la droite ?",
      "2",
      "(7 − 3)/(3 − 1) = 2."
    ]
  ],
  [
    "La pente d'un modèle linéaire donne la variation prévue de y pour une unité supplémentaire de x.",
    "Lis d'abord le coefficient devant x puis la constante.",
    "pour la prévision, remplace x par la valeur demandée dans y = ax + b ; la variation de y pour une unité de x en plus correspond à la pente a.",
    "l'ordonnée à l'origine b n'est pas le gain marginal : c'est la valeur du modèle à x = 0.",
    [
      "Si y = 4x + 2, quelle valeur obtient-on pour x = 3 ?",
      "14",
      "4 × 3 + 2 = 14."
    ]
  ],
  [
    "Des points alignés permettent de construire un modèle affine.",
    "Choisis deux points d'abscisses différentes et calcule leur taux de variation.",
    "trouve a grâce aux différences de coordonnées, puis trouve b en remplaçant les coordonnées d'un point dans y = ax + b.",
    "une pente doit utiliser une différence d'abscisses non nulle.",
    [
      "Pour les points (1 ; 3) et (2 ; 5), quelle est la pente ?",
      "2",
      "La variation verticale est 2 pour une variation horizontale de 1."
    ]
  ],
  [
    "Une interpolation reste dans la plage observée ; une extrapolation en sort.",
    "Compare chaque valeur de x au domaine de données indiqué.",
    "calcule les deux valeurs de y avec la droite ; classe chaque calcul selon que son abscisse appartient ou non à l'intervalle d'observation.",
    "une prévision hors de la plage mesurée doit être interprétée avec prudence.",
    [
      "Si les données couvrent x de 1 à 5, la prévision en x = 6 est-elle une extrapolation ? (oui/non)",
      "oui",
      "Oui, car 6 est hors de [1 ; 5]."
    ]
  ],
  [
    "Comparer le point moyen à un ajustement permet de contrôler la cohérence du modèle.",
    "Calcule séparément les moyennes des quatre abscisses et des quatre ordonnées.",
    "remplace l'abscisse moyenne dans l'équation proposée pour vérifier le point moyen, puis réutilise la même équation avec l'abscisse demandée.",
    "pour une moyenne, divise par quatre ; pour une prévision, remplace x dans la droite.",
    [
      "Si y = 2x + 3, quelle valeur prévoit-on pour x = 4 ?",
      "11",
      "2 × 4 + 3 = 11."
    ]
  ],
  [
    "Le domaine observé aide à juger la fiabilité d'une prévision.",
    "Repère la plage des abscisses mesurées puis classe les deux valeurs à prévoir.",
    "substitue les deux abscisses dans l’expression de la droite ; détermine ensuite laquelle sort de l’intervalle des observations.",
    "ne confonds pas calcul mathématique possible et prévision statistiquement prudente.",
    [
      "Si on a mesuré pour 1 ≤ x ≤ 5, x = 8 est-il hors de la plage ? (oui/non)",
      "oui",
      "Oui, 8 est supérieur à 5."
    ]
  ],
  [
    "Une liaison statistique montre une association, pas nécessairement une cause.",
    "Observe l’évolution de la seconde grandeur quand la première augmente d’une unité.",
    "calcule la pente à partir de deux couples, puis l’ordonnée à l’origine. Réponds ensuite à la question : une variation commune (corrélation) n’établit pas une cause, d’autres facteurs peuvent intervenir.",
    "une droite bien ajustée ne démontre pas, à elle seule, qu’une grandeur cause l’autre.",
    [
      "Entre (1 ; 2) et (2 ; 5), quelle est la pente ?",
      "3",
      "La différence des ordonnées vaut 3 pour un pas de 1."
    ]
  ]
]);
})();
