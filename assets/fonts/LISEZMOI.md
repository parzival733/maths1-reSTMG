# Polices du site

| Fichier | Police d'origine | Modification |
|---|---|---|
| `stmg-serif-semibold.woff2` | Source Serif 4 (Adobe), graisse 600, taille optique 32 | Instance statique, sous-ensemble des caractères du site |
| `stmg-sans-regular.woff2` | Source Sans 3 (Adobe), graisse 400 | Instance statique, sous-ensemble |
| `stmg-sans-bold.woff2` | Source Sans 3 (Adobe), graisse 700 | Instance statique, sous-ensemble |
| `stmg-symboles-latin.woff2` | Noto Sans (The Noto Project Authors), graisse 400 | Sous-ensemble : ₙ, ₘ, ₖ, ᵢ, ₊, ⁺, ⁻, ȳ… |
| `stmg-symboles-maths.woff2` | Noto Sans Math (The Noto Project Authors) | Sous-ensemble : ∩, ∪, ∈, ∉, ⊂, ⇔, ⇒, ℝ, ℕ, ∅… |

Toutes sont sous licence SIL Open Font License 1.1 (`OFL-source-serif-4.txt`, `OFL-source-sans-3.txt`, `OFL-noto-sans.txt`, `OFL-noto-sans-math.txt`). Leur nom « Source » est réservé : les versions réduites portent donc les noms « STMG Serif » et « STMG Sans ».

Sous-ensemble : latin de base, latin-1, ligatures françaises, ponctuation typographique (y compris les espaces insécables) et signes mathématiques présents dans les pages. Les signes absents de Source Sans 3 et Source Serif 4 (ₙ, ∪, ∈, ⇔, ℝ…) viennent de « STMG Symboles », déclarée avec `unicode-range` : un seul dessin partout au lieu de la police du système. Les versions réduites sont renommées pour respecter la licence.
