/* Aides progressives : calcul, pourcentages d'évolution et logique. */
(()=>{
'use strict';
window.ExerciseCoaching.register("calcul", [
  [
    "Les priorités opératoires sont : puissances, parenthèses, multiplications et divisions, puis additions et soustractions.",
    "Compare l'expression avec parenthèses à celle qui n'en possède pas.",
    "dans le premier calcul, multiplie avant d’additionner ou de soustraire ; dans le deuxième, commence par les parenthèses. Pour −k², calcule d’abord k² puis applique le signe moins ; (−k)² est le carré de −k.",
    "−k² et (−k)² ne désignent pas le même nombre.",
    [
      "Que vaut 3 + 4 × 5 ?",
      "23",
      "Il faut calculer 4 × 5 avant d'ajouter 3."
    ]
  ],
  [
    "Pour additionner des fractions, il faut un dénominateur commun ; pour les multiplier, on multiplie les numérateurs et dénominateurs.",
    "Cherche un multiple commun aux deux dénominateurs de chaque somme.",
    "mets les fractions de la somme et de la différence au même dénominateur ; multiplie directement les numérateurs et les dénominateurs pour le produit, puis simplifie et donne l’écriture décimale exacte.",
    "simplifie la fraction obtenue avant de chercher son écriture décimale ; n’arrondis pas.",
    [
      "Combien vaut 1/2 + 1/4 ?",
      "0.75",
      "1/2 = 2/4, donc la somme vaut 3/4 = 0,75."
    ]
  ],
  [
    "Multiplier deux puissances de même base revient à additionner leurs exposants.",
    "Traite le calcul de puissances, celui de 10 et la racine carrée séparément.",
    "utilise aᵐ × aⁿ = aᵐ⁺ⁿ et aᵐ ÷ aⁿ = aᵐ⁻ⁿ ; pour 10⁻ⁿ calcule 1/10ⁿ ; pour √m cherche le nombre positif dont le carré vaut m.",
    "une racine carrée est la valeur positive, et un exposant négatif signifie un inverse.",
    [
      "Que vaut 2³ × 2² ?",
      "32",
      "2³ × 2² = 2⁵ = 32."
    ]
  ],
  [
    "Une proportion de proportion se calcule en appliquant deux pourcentages successifs.",
    "Commence par déterminer l'effectif du premier sous-groupe.",
    "multiplie l’effectif total par le premier taux décimal, puis multiplie ce résultat par le second taux décimal. Pour le pourcentage final, divise par l’effectif initial et multiplie par 100.",
    "la seconde proportion porte sur le premier sous-groupe, pas directement sur toute la population.",
    [
      "Parmi 40 personnes, la moitié sont membres ; un quart des membres est bénévole. Combien de bénévoles ?",
      "5",
      "40 × 0,5 × 0,25 = 5."
    ]
  ],
  [
    "Une conversion change d'unité mais pas la grandeur physique.",
    "Repère les facteurs 60, 1 000 et 3,6 associés aux unités.",
    "multiplie les heures par 60 et les kilomètres par 1 000 ; multiplie par 3,6 pour passer des m/s aux km/h, divise par 3,6 pour passer des km/h aux m/s.",
    "ne divise pas par 60 quand tu passes des heures aux minutes.",
    [
      "Combien de minutes font 1,5 heure ?",
      "90",
      "1,5 × 60 = 90 minutes."
    ]
  ],
  [
    "Développer signifie multiplier chaque terme d'une parenthèse par son coefficient.",
    "Distribue les coefficients puis rassemble les termes en x et les constantes.",
    "distribue séparément chaque coefficient sur sa parenthèse, avec le signe placé devant ; réduis ensuite, puis remplace x par la valeur demandée.",
    "attention au signe devant la deuxième parenthèse : un moins change le signe de chacun de ses termes.",
    [
      "Dans 2(x + 3) − (x − 1), quelle est la constante après réduction ?",
      "7",
      "2x + 6 − x + 1 = x + 7."
    ]
  ],
  [
    "Une différence de deux carrés se factorise en (x − a)(x + a).",
    "Cherche le nombre dont le carré est le terme constant positif.",
    "utilise x² − a² = (x − a)(x + a), annule les deux facteurs ; pour l'équation affine, isole x en retirant la constante avant de diviser.",
    "les deux racines d'une différence de carrés sont opposées.",
    [
      "Quelle est la racine positive de x² − 16 = 0 ?",
      "4",
      "x² = 16 a pour racine positive 4."
    ]
  ],
  [
    "Dans une inéquation, les opérations se font des deux côtés, en gardant l'attention sur le signe.",
    "Isole d'abord x dans la première inéquation, puis traite celle sur le budget.",
    "retire la constante des deux membres puis divise par le coefficient de x ; pour la durée, écris frais fixes + tarif × h ≤ budget et garde h ≥ 0.",
    "diviser par un nombre négatif change le sens de l’inégalité ; diviser par un nombre positif le conserve.",
    [
      "Pour 2x + 3 ≤ 11, quelle est la borne supérieure de x ?",
      "4",
      "2x ≤ 8, donc x ≤ 4."
    ]
  ]
]);
window.ExerciseCoaching.register("evolutions", [
  [
    "Un taux d'évolution compare la différence entre la valeur finale et la valeur initiale à cette dernière.",
    "Calcule la variation absolue avant le pourcentage.",
    "utilise variation = final − initial ; puis taux en % = variation/initial × 100 et coefficient multiplicateur = final/initial.",
    "pour un taux relatif, on divise par le prix initial, pas par le prix final.",
    [
      "Un article passe de 100 € à 120 €. Quelle est sa hausse en % ?",
      "20",
      "(120 − 100)/100 × 100 = 20 %."
    ]
  ],
  [
    "Des évolutions successives se calculent en multipliant les coefficients multiplicateurs.",
    "Transforme chaque hausse ou baisse en coefficient distinct.",
    "calcule le prix après la première évolution avec son coefficient ; applique ensuite le second coefficient au nouveau prix, et non au prix initial.",
    "une hausse de 10 % suivie d'une baisse de 10 % ne ramène pas au départ.",
    [
      "Un prix de 100 € augmente de 10 %, puis baisse de 10 %. Prix final ?",
      "99",
      "100 × 1,10 × 0,90 = 99 €."
    ]
  ],
  [
    "Une hausse et une baisse du même pourcentage ne s’annulent pas.",
    "Convertis la hausse et la baisse en deux coefficients différents.",
    "multiplie (1 + t/100) par (1 − t/100) pour le coefficient global ; multiplie ensuite la valeur initiale par ce coefficient et déduis le taux global.",
    "les pourcentages successifs ne s'additionnent pas car leur base change.",
    [
      "Une valeur 100 augmente de 20 %, puis baisse de 20 %. Valeur finale ?",
      "96",
      "100 × 1,20 × 0,80 = 96."
    ]
  ],
  [
    "Deux évolutions identiques successives correspondent au carré d’un coefficient multiplicateur.",
    "Calcule d’abord le coefficient d’une seule évolution.",
    "écris q = 1 + t/100 (ou 1 − t/100 pour une baisse), puis calcule q² et la valeur finale initial × q² ; le taux global vaut (q² − 1) × 100.",
    "deux hausses de t % n'équivalent pas exactement à une hausse de 2t %.",
    [
      "Une valeur de 100 augmente de 10 % deux fois. Valeur finale ?",
      "121",
      "100 × 1,1² = 121."
    ]
  ],
  [
    "Pour revenir à la valeur avant une évolution, utilise l'inverse du coefficient multiplicateur.",
    "Commence par trouver le coefficient qui annule la multiplication initiale.",
    "calcule q réciproque = 1/q ; le taux réciproque en % est (1/q − 1) × 100. Contrôle en multipliant la valeur finale par 1/q.",
    "le pourcentage réciproque n'est généralement pas l'opposé exact du pourcentage initial.",
    [
      "Si le coefficient d'évolution vaut 1,25, quel est son coefficient réciproque ?",
      "0.8",
      "1/1,25 = 0,8."
    ]
  ],
  [
    "Un prix après évolution est le produit du prix initial par le coefficient multiplicateur.",
    "Transforme le pourcentage d’évolution en coefficient multiplicateur.",
    "écris prix final = prix initial × q, puis divise le prix final par q. Pour le taux réciproque, calcule (1/q − 1) × 100.",
    "retrouver le prix initial impose de diviser par le coefficient, pas d’appliquer le pourcentage opposé.",
    [
      "Un article coûte 80 € après 20 % de réduction. Quel était son prix initial ?",
      "100",
      "80 ÷ 0,8 = 100 €."
    ]
  ],
  [
    "Une variation d'indice entre deux années se calcule relativement à l'année de départ de la variation.",
    "Distingue une variation en pourcentage et une différence de points d'indice.",
    "calcule le taux de l'année 1 à 2 par (indice2/indice1 − 1) × 100 ; recommence à partir de l'indice2 pour la suite. Les points se trouvent par soustraction.",
    "une perte de 20 points d'indice n'est pas nécessairement une baisse de 20 %.",
    [
      "Un indice passe de 100 à 120. Quelle est la variation en pourcentage ?",
      "20",
      "(120/100 − 1) × 100 = 20 %."
    ]
  ],
  [
    "Les points de pourcentage mesurent une différence de taux ; le pourcentage relatif mesure la hausse par rapport au taux initial.",
    "Soustrais les deux pourcentages pour trouver les points gagnés.",
    "calcule d'abord taux final − taux initial pour les points ; puis divise cette différence par le taux initial et multiplie par 100 pour le pourcentage relatif.",
    "une hausse de 5 points n'est pas nécessairement une hausse relative de 5 %.",
    [
      "Une proportion passe de 20 % à 25 %. Quelle est la hausse relative en % ?",
      "25",
      "(25 − 20)/20 × 100 = 25 %."
    ]
  ]
]);
window.ExerciseCoaching.register("logique", [
  [
    "L'intersection garde seulement les éléments communs aux deux ensembles ; l'union garde tous les éléments distincts.",
    "Écris les deux ensembles puis coche les éléments communs.",
    "compte les éléments communs pour card(A ∩ B), puis compte chaque élément une seule fois dans l'union. Pour l'appartenance, regarde seulement B.",
    "l'union ne compte pas deux fois un élément figurant dans les deux ensembles.",
    [
      "Pour A = {1,2,3} et B = {2,3,4}, combien d'éléments dans A ∩ B ?",
      "2",
      "Les éléments communs sont 2 et 3."
    ]
  ],
  [
    "L'intersection de deux intervalles est la zone commune ; leur union contient les deux zones.",
    "Repère la plus grande borne inférieure et la plus petite borne supérieure.",
    "pour l'intersection, prends le chevauchement des intervalles ; pour l'union, assemble leurs extrémités car ils se recouvrent. Vérifie les crochets.",
    "un crochet fermé signifie que la borne est comprise dans l'intervalle.",
    [
      "Pour I = [1 ; 4] et J = [3 ; 5], quelle est la borne inférieure de I ∩ J ?",
      "3",
      "L'intersection est [3 ; 4]."
    ]
  ],
  [
    "Un produit cartésien A × B rassemble des couples ordonnés (a ; b).",
    "Compte séparément les éléments de A et les éléments de B.",
    "le nombre de couples vaut card(A) × card(B). Pour tester un couple, vérifie le premier élément dans A et le second dans B.",
    "dans un couple du produit A × B, l'ordre des deux ensembles compte.",
    [
      "Si A contient 2 éléments et B en contient 3, combien de couples dans A × B ?",
      "6",
      "2 × 3 = 6."
    ]
  ],
  [
    "Une proposition universelle doit être vraie pour tous les x ; une proposition existentielle suffit avec un exemple.",
    "Cherche un contre-exemple pour une phrase qui commence par « pour tout ».",
    "pour « pour tout », cherche un contre-exemple (x = 0 ou x = 1 conviennent souvent) ; pour « il existe », cherche un exemple, ou montre qu’aucun nombre ne convient.",
    "il suffit d'un contre-exemple pour rendre une affirmation universelle fausse.",
    [
      "Pour tout réel x, x² ≥ 0 est-il vrai ? (oui/non)",
      "oui",
      "Le carré d'un réel est toujours positif ou nul."
    ]
  ],
  [
    "L'implication « si P alors Q » ne signifie pas que la réciproque est vraie.",
    "Vérifie d'abord que le seuil le plus fort entraîne le seuil le plus faible.",
    "pour la réciproque, prends une valeur comprise strictement entre les deux seuils : elle vérifie le seuil faible mais pas le seuil fort.",
    "une réciproque doit se tester séparément et peut échouer.",
    [
      "Si x > 5, est-il forcément vrai que x > 3 ? (oui/non)",
      "oui",
      "Tout nombre supérieur à 5 est aussi supérieur à 3."
    ]
  ],
  [
    "Une équation cherche ses solutions ; une identité est vraie pour toutes les valeurs permises.",
    "Résous l'équation affine avant d'étudier l'égalité avec le carré.",
    "pour l'équation, retire la constante puis divise. Pour l'identité, développe (x + a)² ; pour un arrondi, utilise le symbole ≈.",
    "un signe = exprime une égalité exacte ; un arrondi doit se signaler.",
    [
      "Résous 2x + 3 = 9. Combien vaut x ?",
      "3",
      "2x = 6, donc x = 3."
    ]
  ],
  [
    "Un produit (x − r)(x − s) change de signe en chacune de ses racines.",
    "Commence par déterminer les racines et le signe au milieu.",
    "dresse le tableau de signes : pour « > 0 », garde l’extérieur des racines ; pour « < 0 », l’intérieur ; respecte les bornes du domaine donné.",
    "les racines sont exclues d’une inégalité stricte, même si les bornes du domaine restent incluses.",
    [
      "Que vaut (x − 2)(x + 2) pour x = 3 ?",
      "5",
      "(3 − 2)(3 + 2) = 5."
    ]
  ],
  [
    "Un filtre ET retient les valeurs qui satisfont toutes les conditions ; un filtre OU n'en demande qu'une.",
    "Parcours les valeurs une par une pour chaque condition.",
    "pour ET, garde seulement les valeurs qui vérifient la condition de parité et sont dans l’intervalle ; pour OU, garde celles qui vérifient l’une ou l’autre condition. Compte ensuite sans doublon.",
    "avec OU, une valeur répondant aux deux conditions n'est comptée qu'une fois.",
    [
      "Dans 1 ; 2 ; 3 ; 4 ; 6 ; 7, combien de nombres sont pairs ET entre 2 et 6 ?",
      "3",
      "Les nombres 2, 4 et 6 conviennent."
    ]
  ]
]);
})();
