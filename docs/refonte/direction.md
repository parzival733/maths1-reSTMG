# Direction de la refonte graphique

**Statut : à valider.** Rien n'est encore appliqué aux pages du site. `assets/tokens.css` et `assets/fonts/` existent, mais aucune page ne les charge.

Maquettes :
- `docs/refonte/maquettes/serie.html` ;
- `docs/refonte/maquettes/lecon.html` ;
- `docs/refonte/maquettes/entete.html`.

Leurs captures sont dans `docs/refonte/maquettes/captures/`.

## Intention en une phrase

Un manuel soigné sur papier chaud, avec des titres en serif et une encre violette pour apprendre, du vert pour s'entraîner et réussir. Les retours sont nets, mais rien ne bouge pendant la lecture.

La signature tient à deux éléments :
- **le titre en serif**, qui donne la touche académique ;
- **le filet violet en marge de l'énoncé**, qui désigne ce qu'il faut lire.

Tout le reste reste calme.

## 1. Couleurs (jetons de `assets/tokens.css`)

La palette d'origine est conservée. Le site retrouve son papier chaud `#f8f7f3` : `interface.css` l'avait remplacé par un gris froid `#f7f8fa` (constat L2 de l'audit).

| Jeton | Valeur | Rôle | Contraste |
|---|---|---|---|
| `--color-bg` | `#f8f7f3` | papier | — |
| `--color-surface` | `#ffffff` | cartes, champs | — |
| `--color-surface-sunken` | `#f2f0ea` | zones secondaires | — |
| `--color-text` | `#252436` | encre | 14,2:1 sur papier |
| `--color-text-muted` | `#5f5d6b` | texte secondaire (au lieu de `#656372`) | 6,0:1 sur papier, 6,4:1 sur blanc |
| `--color-line` | `#e4e2e9` | filets décoratifs | 1,3:1, décoratif seulement |
| `--color-line-strong` | `#857f92` | contours de champs et de boutons | 3,9:1 sur blanc (avant : `#aaa5b2`, 2,4:1) |
| `--color-learn` | `#604bd1` | apprendre, liens, focus | 6,1:1 sur blanc, 5,7:1 sur papier |
| `--color-learn-strong` / `-soft` | `#4f3bb5` / `#efebfc` | texte sur fond violet doux | 6,8:1 |
| `--color-practice` | `#246453` | s'entraîner, « Vérifier », réussite | 7,0:1 sur blanc ; blanc sur vert : 7,0:1 |
| `--color-practice-strong` / `-soft` | `#1b4d40` / `#e8f3ee` | texte de réussite | 8,5:1 |
| `--color-success` | = practice | fusion de `--green`, `--exercise` et `--success` | — |
| `--color-danger` | `#a53c42` | « À revoir » | 6,3:1 sur blanc, 5,5:1 sur `#fbeced` |
| `--color-warning` / `-soft` | `#7a4f00` / `#fbf1dc` | encadré « Attention » seulement | 6,4:1 |
| `--color-warning-line` | `#a8740f` | filet de l'encadré « Attention » | 4,1:1 sur blanc |

- **Domaines des leçons** : les quatre couleurs (violet, sarcelle, rose, bleu) disparaissent. Le domaine est indiqué par une icône et un libellé (« 02 · Analyse ») en violet. L'élève n'a plus de code couleur à apprendre.
- **Mode sombre** : pas dans cette refonte. Il faudrait vérifier chaque composant, et les graphiques interactifs, contre AA. Le risque est élevé pour un bénéfice faible sur un site de révision. Je propose de le traiter dans un lot séparé si tu le souhaites.

## 2. Typographie

| Rôle | Police | Pourquoi |
|---|---|---|
| Titres | **Source Serif 4**, demi-gras, taille optique 32 | Serif éditoriale sobre, au dessin de manuel. 26 Ko. |
| Corps, interface, formules | **Source Sans 3**, regular et gras | Très lisible et conçue pour aller avec Source Serif. Elle couvre le prime ′ (460 emplois), les indices ₀ à ₉, ∩, ≤, ≥, √, ≈, ∞ et Σ. 17 Ko par graisse. |

- **Pourquoi pas Atkinson Hyperlegible ?** Je l'ai testée : il lui manque ′, ₀ à ₉, ∩, →, ↗ et ↘, soit environ 2 000 emplois sur le site. Les formules seraient composées dans deux polices à la fois.
- **Poids** : 61 Ko pour les trois fichiers, sous le budget de 120 Ko, en `font-display: swap`, servis depuis le site (`font-src 'self'`).
- **Licence** : SIL OFL 1.1, fichiers de licence dans `assets/fonts/`. Le nom « Source » est réservé par Adobe : les versions réduites s'appellent donc « STMG Serif » et « STMG Sans » (`assets/fonts/LISEZMOI.md`).
- **Signes absents des deux polices** : environ 20 signes rares (ₙ, ∪, ∈, ⇔, ℝ…) s'affichent avec la police du système. Ils représentent environ 490 emplois sur tout le site.
- **CLS** : à la mise en œuvre, des polices de repli ajustées (`size-adjust`, `ascent-override`) éviteront que le texte se décale quand la police arrive. Le budget CLS ≤ 0,1 reste contrôlé par `browser_cloture.py`.

### Échelle (rapport 1,2)

| Jeton | Téléphone | Ordinateur | Usage |
|---|---|---|---|
| `--text-caps` | 13 px | 13 px | surtitres en capitales seulement (graisse 700, interlettrage 0,06 em) |
| `--text-sm` | 14 px | 14 px | **plus petit texte de lecture** : légendes, retours, fil d'Ariane |
| `--text-base` | 17 px | 18 px | corps (aujourd'hui 16 px) |
| `--text-md` | 20 px | 21 px | titres de niveau 3 |
| `--text-lg` | 24 px | 26 px | titres de niveau 2 |
| `--text-xl` | 29 px | 34 px | titres de page |
| `--text-2xl` | 35 px | 42 px | réservé (l'accueil garde son titre actuel) |

Interligne du corps : 1,6. Colonne de lecture : 68 caractères (`--measure`), comme aujourd'hui.

### Formules

La classe `.math` applique des chiffres tabulaires, le vrai signe −, aucune coupure de ligne à l'intérieur et le gras actuel. Elle sera posée par les générateurs (`exercices-variants.js`) et les outils (`tools/`), sans édition à la main page par page. Chiffres tabulaires aussi pour les scores, les chronos, les tableaux et les barèmes.

## 3. Espaces, formes et mouvement

- **Espacements** : pas de 4 px, jetons `--space-1` à `--space-16`.
- **Rayons** : 6, 10 et 16 px, au lieu de 8 à 24 px aujourd'hui. Le registre devient celui d'un manuel plutôt que d'une application.
- **Ombres** : deux niveaux seulement, très légers.
- **Cibles tactiles** : 44 × 44 px minimum (`--target-min`).
- **Mouvement** : 120 et 180 ms, seulement pour l'apparition d'une correction et le changement d'exercice. Durée nulle si `prefers-reduced-motion`. Pas de rebond, pas de boucle.

## 4. Composants (maquettes)

### a. Série d'exercices (`serie.html`)

- **Une seule carte par exercice.** Les champs de réponse forment une liste simple, sans cadre autour de chaque champ. L'intitulé et le champ sont sur la même ligne quand la place suffit, sinon le champ passe dessous.
- **Énoncé** : filet violet de 3 px en marge (recommandé). Une variante quadrillée à 5 mm est visible dans la maquette (lien « quadrillage 5 mm ») ; je la trouve plus chargée à la lecture d'un énoncé long.
- **Boutons d'exercice** :
  - une ligne de 8 sur ordinateur ;
  - une grille de 4 × 2 sous 440 px, avec des boutons d'environ 80 × 44 px au lieu de 35 × 44 ;
  - leur état se lit sans la couleur : ✓ juste, ✗ à revoir (bord en pointillés), œil pour « correction vue », fond foncé pour « en cours » ;
  - nom accessible complet (« Exercice 3, à revoir ») ;
  - la légende passe à 14 px, avec les mêmes icônes.
- **Retours** : icône + texte + couleur + bordure épaisse du champ. Les mots actuels ne changent pas (« Correct ✓ », « À revoir. Essaie encore. »).
- **Ordre conservé** :
  - sur téléphone : énoncé → réponses → Vérifier → correction → indices ;
  - sur ordinateur : énoncé et aides à gauche, réponses à droite, comme aujourd'hui.
- **Libellés inchangés** : « Vérifier », « Effacer », « Nouvelle variante ↻ », « Voir la correction détaillée », « Indice 1 · Comprendre »…

### b. Leçon (`lecon.html`)

- **Une barre compacte** remplace les quatre blocs qui précèdent le cours :
  - « Options de lecture » regroupe les étapes 1-2-3, « Agrandir le texte », « Lecture concentrée » et « Pourquoi ces méthodes ? » ;
  - « Sommaire · 8 parties » reste à côté.
  - Ce sont deux éléments `details` : la barre fonctionne sans JavaScript.
- **Bouton fixe « Sommaire »** en bas à droite sur téléphone, comme un lien vers le sommaire. Il disparaît sur ordinateur, où le sommaire reste en colonne latérale fixe comme aujourd'hui (non représenté dans la maquette).
- **Encadrés typés** : Définition, Méthode, Exemple, À retenir, Attention, Pause mémoire. Ils ont tous la même structure : filet de 3 px, icône, titre en capitales de 13 px. L'ambre est réservé à « Attention ».
- **Tableaux de signes et de variations** : structure accessible inchangée, chiffres tabulaires, flèches colorées et doublées du symbole (↗ ↘).

### c. En-tête (`entete.html`)

- **Téléphone** : une ligne de 56 px avec le logo « m » (de retour), « maths. » et le bouton « Menu ». Le panneau contient les cinq destinations dans le même ordre, en lignes de 48 px ; la page en cours est signalée par un fond et par le texte « Page actuelle ».
  - Sans JavaScript : un élément `details` natif.
  - Avec JavaScript : `aria-expanded`, Échap, piège du focus, fermeture au clic extérieur.
- **Ordinateur** : la barre actuelle est affinée. Les liens passent à 44 px de haut et la page en cours reçoit un fond et un soulignement.
- **Compactage au défilement** : non retenu. Avec 56 px, il n'apporte presque rien.

## 5. Ce qui ne change pas

- **Contenus** : les textes des leçons et des exercices, les URL, les noms de boutons, l'ordre des étapes et la numérotation.
- **Accueil** : il ne reçoit que les jetons, les polices et l'en-tête mobile.
- **Acquis** :
  - versions sans JavaScript ;
  - tableaux accessibles ;
  - typographie française ;
  - noms de liens uniques ;
  - suivi local facultatif ;
  - texte agrandi et lecture concentrée.

## 6. Mesures attendues (maquettes, à 375 × 812 px)

| Mesure | Avant | Maquette |
|---|---|---|
| « Vérifier », exercice 1 de la série sur le second degré | 1 528 px | 1 194 px |
| Début du contenu de la leçon (second degré) | 765 px | 535 px |
| « Ce que tu vas savoir faire » | 1 317 px | 770 px (dans le premier écran) |
| Hauteur de l'en-tête | 172 px | 57 px |
| Plus petit texte de lecture | 11 px | 14 px (13 px pour les capitales) |
| Boutons d'exercice | 35 × 44 px | environ 80 × 44 px |
| Contour des champs | 2,4:1 | 3,9:1 |

Les maquettes contiennent une ligne de note en haut de page. Les mesures définitives seront prises sur le site lui-même.

## 7. Décisions à valider

1. **Énoncé** : filet violet (recommandé) ou quadrillage 5 mm.
2. **Polices** : Source Serif 4 + Source Sans 3 (recommandé, meilleure couverture des formules), ou Atkinson Hyperlegible pour le corps malgré les signes manquants.
3. **Retour au papier chaud** `#f8f7f3` sur toutes les pages, au lieu du gris froid actuel. C'est le changement le plus visible.
4. **Mode sombre** : reporté à un lot séparé.
5. **Bouton fixe « Sommaire »** sur téléphone dans les leçons : oui ou non.
6. **Boutons d'exercice** en grille 4 × 2 sur téléphone (recommandé) ou ligne défilante.
