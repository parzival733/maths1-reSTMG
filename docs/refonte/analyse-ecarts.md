# Analyse des écarts : site en ligne et prompt de refonte

Mesures du 6 novembre 2026, faites sur `main` (`e7a766c`, la version en ligne). Toutes les pages ont été parcourues dans Chromium, en clair et en sombre, à 375 px. Chaque chiffre ci-dessous vient d'un script et non d'une estimation.

## Verdict

La refonte a traité les fondations (jetons, contrastes, en-tête, série, leçon) mais **pas l'homogénéité des composants**. Une bonne partie du site garde ses anciens boutons, ses anciens champs et ses anciennes aides, simplement recolorés. Le résultat est disparate, surtout en mode sombre, et c'est ce que montre ta capture. Côté contenu, les variantes changent bien leurs nombres mais pas toujours ce qu'elles demandent : dans les suites, ce sont toujours les mêmes rangs.

On est donc loin de deux promesses du prompt : « composants homogènes, même structure partout » et « un ouvrage académique soigné ».

## 1. Variantes : des rangs qui ne changent jamais (gêne la révision)

Mesure sur 300 tirages de chacun des 183 modèles :

- **17 exercices sur les termes d'une suite** demandent toujours les mêmes rangs. Seuls le premier terme et la raison changent :

  | Chapitre | Exercice | Toujours demandé |
  |---|---|---|
  | Suites | 3, 4, 5 | v₀, v₁, v₂ · w₁, w₂, w₃ · u₁, u₂, u₃ |
  | Suites | 8 | u₂, v₂, u₁₀, v₁₀, « au rang 10 » |
  | Suites arithmétiques | 1, 2, 5, 6 | terme suivant · u₁, u₄, u₆ · cinquième terme · u₁₀ et somme jusqu'à u₁₀ |
  | Suites géométriques | 2, 3, 4, 6, 7 | u₁, u₂, u₃ · v₀, v₁, v₂ · cinquième terme · A₁₀, G₁₀ |
  | Terminale, suites | 1, 2 | mêmes grandeurs |
  | Terminale, logarithme | 4 | mêmes rangs d'égalité |
  | Python et tableur | 6 | même nombre de passages |

- **96 modèles sur 183** gardent exactement les mêmes intitulés de réponse. Ce n'est pas toujours un défaut (« Coefficient a » reste « Coefficient a »). En revanche, quand l'intitulé contient un rang ou une abscisse (u₅, f(3)), l'élève refait le même exercice avec d'autres nombres et finit par retenir la position plutôt que la méthode.

**Correction proposée** :
- tirer les rangs dans une plage adaptée : par exemple u_k, u_{k+1}, u_{k+2} avec k entre 0 et 4, ou un rang lointain entre 8 et 15 ;
- garder la bande de difficulté de ±20 % et des valeurs calculables sans calculatrice en Première ;
- produire corrigés, aides et tableaux à partir des mêmes paramètres, pour qu'ils restent justes ;
- ajouter un test qui échoue si un modèle « de rang » ne fait jamais varier ses rangs.

## 2. Polices : trois causes de mélange visible (gêne la lecture)

Hors code, le texte utilise bien STMG Sans et STMG Serif partout, sauf la page 404, en police système. Le mélange que tu vois a trois causes précises :

1. **Signes mathématiques absents des polices.** Le système les dessine avec une autre police, au milieu d'une formule. C'est surtout visible en serif :
   - 13 titres et formules en serif contiennent un tel signe (∩ ×8, ⇔ ×5, ȳ ×4, ₙ ×2, ₘ ×2, ∪, ∅, ⇒) ;
   - les questions du calcul rapide, en serif, contiennent souvent uₙ et uₙ₊₁ ;
   - la police sans-serif manque elle aussi ₙ, ∪, ∈, ⇔, ℝ et une dizaine d'autres signes.
2. **Serif et sans-serif mêlées dans les formules.** Les encadrés « Formule · à retenir » et les questions du calcul rapide sont en serif, alors que les mêmes expressions sont en sans-serif dans le texte et les réponses. Une même formule change donc de dessin d'un bloc à l'autre.
3. **La classe `.math` n'est pas posée.** Elle était prévue dans la direction, mais elle n'existe aujourd'hui que dans `tokens.css`. Les formules restent du texte ordinaire.

Le préchargement n'est pas en cause : la police du site est bien chargée dès la première visite, même en 3G simulée.

**Correction proposée** :
- composer toutes les formules dans une seule police, la sans-serif ; garder la serif pour les titres de page et de partie seulement ;
- ajouter un petit fichier de symboles (environ 5 Ko, sous licence OFL) qui couvre ₙ, ₊, ∩, ∪, ∈, ⇔, ℝ, ȳ… dans le même dessin. C'est une troisième police, alors que le brief en limitait le nombre à deux : **à valider** ;
- poser la classe `.math` par les générateurs et les outils, puis passer la page 404 aux polices du site.

## 3. Boutons, champs et aides : aucun système commun (gêne la lecture, et parfois la révision)

| Mesure | Valeur |
|---|---|
| Styles de boutons distincts sur le site | **43** |
| Rayons d'angle utilisés | 0, 6, 8, 9, 10 et 999 px |
| Tailles de texte des boutons | 14, 15, 16 et 17 px |
| Graisses | 400, 600, 650, 700, 750 et 800 |
| Hauteurs | de 25 à 90 px (les éléments dépliables varient le plus) |
| Couleur du bouton principal « Vérifier » | vert dans les séries, violet dans le calcul rapide, la révision guidée, l'accueil et les pauses mémoire |
| Champs restés blancs en mode sombre | 7 : question de l'accueil (ta capture) et champs des 6 graphiques interactifs |

**Composants non refaits, et pourtant très visibles** (capture : `analyse-composants-sombre.jpg`) :
- **Question de l'accueil** (ta capture) : champ blanc, bouton violet pastel épais à bord clair en mode sombre, grand vide sous le bouton.
- **Diagnostic et révision guidée** :
  - « Précédente » ressemble à un bouton désactivé, « Question suivante » est un aplat violet épais ;
  - « Je ne sais pas encore » et « Terminer la série » ont encore deux autres styles ;
  - les liens du bas sont en texte nu.
- **Calcul rapide** :
  - « Vérifier » fait 61 px de haut, en graisse normale ;
  - « Suivante » est un bloc violet plein en mode sombre ;
  - « Un indice » et « Voir la correction » ont des bords violet clair.
- **Pauses mémoire et quiz des leçons** : « Vérifier ma réponse » est en violet pastel en mode sombre.
- **Mes progrès** et **graphiques interactifs** : boutons et champs d'origine.
- **Éléments dépliables** (indices, « Voir la réponse », conditions, corrigés) : 12 styles différents.

**Cause** : en mode sombre, le bouton principal violet devient un violet très clair avec un texte foncé. C'est conforme aux contrastes, mais pâteux. Et rien n'impose un même composant partout.

**Correction proposée** : un vrai système de trois boutons, appliqué à tout le site.

| Bouton | Usage | Style |
|---|---|---|
| **Principal** | une seule action par écran : Vérifier, Commencer, Question suivante… | vert pour s'entraîner, violet pour apprendre ; même hauteur (44 px), même rayon (10 px), même texte (16 px, graisse 700) |
| **Secondaire** | Effacer, Précédente, Un indice… | contour neutre |
| **Lien** | Terminer, Revoir la leçon… | texte souligné |

S'y ajoutent :
- un seul style de champ, identique en clair et en sombre ;
- un seul style d'élément dépliable ;
- en mode sombre, des boutons principaux en teinte moyenne avec un texte blanc, au lieu du pastel.

## 4. Autres points de lecture

- **Bouton fixe « Sommaire »** : il recouvre le texte du cours pendant la lecture, en contradiction avec la règle « aucun effet qui attire l'œil pendant la lecture ». Correction proposée : le réduire à une icône discrète, ou ne l'afficher que quand on remonte la page.
- **Bilan du diagnostic** et **filtres des sujets sur mobile** : jamais retravaillés.
- **Légende des séries** sur téléphone : quatre lignes, encore dense.

## 5. Points du prompt initial non tenus

| Demande du prompt | État |
|---|---|
| Composants homogènes, même structure partout | **Non** : 43 styles de boutons (section 3) |
| Classe `.math` posée par les générateurs | **Non** : définie mais pas appliquée |
| Catalogues : progression locale si le suivi est activé, nombre d'exercices sur les cartes de leçons | **Non** |
| Suppression des règles mortes | **Non** : le CSS passe de 112 à 156 Ko, car la refonte s'ajoute aux anciennes feuilles |
| Encadrés Définition, Méthode, Exemple, À retenir, Attention, Pause mémoire | **Partiel** : faits pour les types qui existent ; « Définition » et « Méthode » ne sont pas balisés dans les leçons |
| Diagnostic, révision guidée, calcul rapide : bilan clair | **Partiel** : chrono conforme, bilans non retravaillés |
| Sujets : filtres compacts sur mobile | **Non** |
| Audit final `apple-design` | **Superficiel** : il n'a pas relevé ces disparités |
| Variantes imprévisibles (lots précédents) | **Partiel** : nombres variés, rangs figés dans 17 exercices |

## Plan proposé, par ordre d'impact sur la révision

1. **Système de composants** (boutons, champs, éléments dépliables), appliqué à tout le site en clair et en sombre, avec un test qui échoue au-delà d'un petit nombre de styles. Il corrige directement ta capture et la majorité des blocs disgracieux.
2. **Variantes** : rangs et abscisses tirés au hasard dans les 17 exercices concernés, puis revue des 96 modèles aux intitulés fixes. Test de variété.
3. **Formules et polices** : une seule police pour les formules, fichier de symboles (à valider), pose de la classe `.math`, page 404.
4. **Lecture** : bouton « Sommaire » discret, bilans du diagnostic et du calcul rapide, filtres des sujets.
5. **Nettoyage** : suppression des règles mortes des anciennes feuilles, et nombre d'exercices et progression sur les cartes des catalogues.

Chaque lot fera l'objet d'un commit séparé, avec la batterie complète, des captures avant / après en clair et en sombre, et une mise en ligne après ta validation.
