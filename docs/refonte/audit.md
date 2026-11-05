# Audit de l'état actuel (avant refonte)

Branche `refonte-graphique`, partie de `main` au commit `617d8a6` (lots 1 à 6 fusionnés). Le site a été audité dans Chromium, à 375, 768 et 1 280 px.

## Méthode

- **Skills** :
  - `ui-ux-pro-max` : j'ai lu ses règles (`references/quick-reference.md`) et ses données de typographie. Son script de recherche n'a pas pu tourner : l'exécution d'un script tiers fraîchement téléchargé a été refusée par la politique de sécurité de la session. Ses règles sont donc appliquées à la main et citées par leur identifiant, par exemple `touch-target-size`.
  - `apple-design` : j'ai lu les pages HIG `typography.md`, `accessibility.md`, `layout.md`, `color.md` et `motion.md`. Elles sont citées sous la forme `fichier › section`. Le site est un site web : seuls les principes et les fondations s'appliquent (accessibilité, couleur, typographie, mise en page, écriture), pas les conventions propres à iOS.
- **Captures** : 13 gabarits × 3 largeurs dans `docs/refonte/avant/`, plus la page entière à 375 px pour l'accueil, deux leçons et deux séries.
- **Mesures** : relevées dans le navigateur (`docs/refonte/avant/mesures-avant.json`) ; contrastes calculés à partir des valeurs hexadécimales.

## Mesures de référence (375 × 812 px)

| Mesure | Valeur avant |
|---|---|
| « Vérifier », exercice 1 : second degré / probabilités conditionnelles / loi binomiale (T) | 1 528 / 1 473 / 1 605 px |
| Début du contenu de la leçon : second degré / probabilités conditionnelles / logarithme (T) | 765 / 801 / 757 px (premier écran : 812 px) |
| « Ce que tu vas savoir faire », même ordre | 1 317 / 1 353 / 1 337 px |
| Partie 1 du cours, même ordre | 1 689 / 1 699 / 1 738 px |
| Hauteur de l'en-tête | 172 px, sur toutes les pages |
| Plus petit texte affiché | 11 px (surtitres en capitales) ; 6 à 9 px dans l'illustration de l'accueil |
| Texte sous 14 px | 683 caractères sur 9 130 dans une leçon ; 406 sur 1 672 dans une série |
| Couleurs hexadécimales distinctes en dur | 346, dans 10 fichiers CSS |
| Poids CSS | 111,8 Ko (10 fichiers) ; aucune police web |
| LCP / CLS (accueil, leçon, série, en local) | 40 à 44 ms / 0 |

## Constats

### Niveau 1 : gêne la révision

| # | Constat | Mesure | Référence |
|---|---|---|---|
| R1 | **Série sur téléphone : « Vérifier » est à deux écrans du haut.** Trois niveaux de cartes (série > exercice > un cadre par champ) ajoutent marges et bordures. Chaque champ prend environ 70 px au lieu de 50. | Vérifier à 1 473–1 605 px | `layout.md › Order content by relative importance` ; `ui-ux-pro-max › content-priority` |
| R2 | **Les boutons d'exercice 1 à 8 font 35 × 44 px** : moins de 44 px de large, collés les uns aux autres. Leur état (fait, actif) passe surtout par la couleur. | 35 × 44 px, espacement 5 px | `accessibility.md › Offer sufficiently sized controls` (44 × 44 pt) ; `touch-spacing` ; `color-not-only` |
| R3 | **Légende vert / rouge à 11,5 px**, détachée des réponses qu'elle explique. | 11,5 px | `typography.md › Use font sizes that most people can read easily` (minimum 11 pt, défaut 17 pt) |
| R4 | **En-tête mobile de 172 px** répété sur chaque page. Les liens de navigation font 28 px de haut. Le logo « m » disparaît sous 600 px. | 172 px ; liens 95 × 28 px | `touch-target-size` ; `content-priority` |
| R5 | **Leçon : le cours commence sous le premier écran.** Étapes 1-2-3, « Mon confort de lecture », « Pourquoi ces méthodes ? » et sommaire passent avant le contenu. | Début du contenu à 757–801 px ; objectifs à environ 1 330 px | `layout.md › Use progressive disclosure` |
| R6 | **Bordure des champs de réponse à 2,4:1** (`#aaa5b2` sur blanc) : le champ à remplir se distingue mal. | 2,4:1 (minimum WCAG 1.4.11 : 3:1) | `color-accessible-pairs` |
| R7 | **Calcul rapide : boutons radio de 18 × 18 px.** Le libellé est cliquable, mais la cible visible reste petite. | 18 × 18 px | `web-target-size` (24 × 24 px minimum) |

### Niveau 2 : gêne la lecture

| # | Constat | Mesure | Référence |
|---|---|---|---|
| L1 | **Petits textes partout** : surtitres en capitales espacées (« 02 / PARCOURS INTERACTIF »), intitulés de champs, légendes, liens « Pourquoi ces méthodes ? ». | 11 à 13 px ; 7 % du texte d'une leçon, 24 % d'une série | `typography.md` ; `readable-font-size` |
| L2 | **Le thème a dérivé.** `interface.css` redéfinit la palette d'origine : fond gris froid `#f7f8fa` au lieu du papier `#f8f7f3`, violet `#5948c5` au lieu de `#604bd1`, encre `#242936`. C'est ce gris froid que le navigateur affiche aujourd'hui. | Calculé dans le navigateur : `rgb(247, 248, 250)` | `color.md › Avoid using the same color to mean different things` ; `consistency` |
| L3 | **Quatre couleurs de domaine dans les leçons** (violet, sarcelle, rose, bleu) : une seconde identité, et un code que l'élève doit apprendre. | 4 teintes + leurs nuances | `color.md` (une couleur, un sens) |
| L4 | **Pas d'échelle typographique.** 310 déclarations `font-size` en dur, corps à 16 px. Titres en police système. Georgia n'apparaît que deux fois. | 16 px de corps | `font-scale` ; `typography.md › Conveying hierarchy` |
| L5 | **Formules en simple texte gras.** Pas de chiffres tabulaires, et des coupures de ligne possibles au milieu d'une expression. | — | `number-tabular` |
| L6 | **Cibles secondaires petites** : « Pourquoi ces méthodes ? » fait 21 px de haut, les liens du sommaire 38 px. | 21 px, 38 px | `touch-target-size` |

### Niveau 3 : cosmétique

| # | Constat |
|---|---|
| C1 | 346 couleurs en dur. Variables en double (`--green`, `--exercise` et `--success` presque identiques) et deux blocs `:root` concurrents (`styles.css`, `interface.css`). |
| C2 | Rayons de 8 à 24 px et ombres de forces différentes selon les fichiers, sans échelle. |
| C3 | Pas de mode sombre. Il est facultatif selon le brief : je ne le propose pas dans cette refonte (voir `direction.md`). |
| C4 | Cartes de l'accueil et des catalogues très arrondies (24 px) : un registre « application » plus que « manuel ». |

## Ce qui marche et reste

- **Accueil** : titre « Les maths, un peu plus claires. », illustration de f(x) = x + 1, mini-question.
- **Colonne de lecture** d'environ 70 caractères dans les leçons sur ordinateur.
- **Série** : ordre énoncé → réponses → Vérifier → correction → indices sur téléphone. Noms de boutons stables.
- **Fondations** :
  - tableaux de signes accessibles ;
  - typographie française ;
  - CLS à 0 ;
  - versions sans JavaScript ;
  - noms de liens uniques ;
  - mode texte agrandi et lecture concentrée.
- **Palette d'origine** : chaque couple texte / fond essentiel dépasse 4,5:1. Encre sur papier : 14,2:1. Violet sur blanc : 6,1:1. Vert sur blanc : 7,0:1. Rouge sur blanc : 6,3:1.

## Lecture « craft » (apple-design)

- **Point de vue** : l'accueil en a un, avec la droite tracée, la question posée tout de suite et le titre terminé par un point. Les pages intérieures l'ont perdu : gris froid, cartes génériques, typographie système. Elles ressemblent à un tableau de bord plus qu'à un manuel.
- **Accessoire à retirer** : le cadre autour de chaque champ de réponse, qui n'apporte aucune information.
- **Où dépenser l'audace** : dans les titres (serif éditoriale) et dans l'énoncé de l'exercice. Le reste doit rester calme.

**Note globale** : *Needs work* (« à retravailler »). Aucun problème bloquant, mais plusieurs constats de niveau élevé (R1, R2, R4, R5, R6). Ils touchent tous l'efficacité de la révision sur téléphone.
