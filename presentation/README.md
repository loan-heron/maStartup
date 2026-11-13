# FrigoFlash : présentation (étape 4)

## Version 10 minutes (à utiliser pour la soutenance)
- `FrigoFlash.pdf` : 10 slides + 5 annexes (questions du jury, plan B si la démo plante).
- `FrigoFlash-notes-oral.pdf` : le texte de l'oral, avec le temps de chaque slide, qui parle (A ou B) et des repères chrono. 8 min 40 de parole prévue, ≈ 1 min 20 de marge.
- Source : `index.html` (`index.html#notes` affiche les notes).

| # | Slide | Qui | Temps |
|---|---|---|---|
| 1 | Couverture | A + B | 0:20 |
| 2 | Le constat en chiffres | A | 0:50 |
| 3 | L'insight et la cible | A | 0:50 |
| 4 | La solution en 3 temps | B | 0:40 |
| 5 | Démo live (A commente) | B | 2:00 |
| 6 | La marque | B | 0:40 |
| 7 | Concurrence | A | 0:40 |
| 8 | Business model et projections | A | 1:00 |
| 9 | Le making-of IA | A + B | 1:10 |
| 10 | Conclusion | A + B | 0:30 |

## Version longue (archive)
- `FrigoFlash-long.pdf` + `FrigoFlash-long-notes-oral.pdf` : les 28 slides d'origine (12-15 min). Source : `index-long.html`.

## Modifier
- Prénoms des présentateurs : `SPEAKERS` en bas de `index.html` (et de `index-long.html`).
- Logo : `LOGO_VERSION = "1.1"` pour utiliser la retouche proposée (fichiers `assets/logo/symbole-v1.1*.svg`).
- Regénérer les 4 PDF : `node build.js` (Playwright + Chromium).

Captures de l'app prises à 390 × 844 @2x (`app/`).
