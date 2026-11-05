# FrigoFlash : présentation (étape 4)

- `FrigoFlash.pdf` : 28 slides 16:9, avec sur chaque slide qui parle (présentateur A ou B).
- `FrigoFlash-notes-oral.pdf` : le texte de l'oral, slide par slide.
- `index.html` : la source. Ouvrir dans Chrome ; `index.html#notes` affiche les notes.

## Modifier
- Prénoms des présentateurs : `SPEAKERS` en bas de `index.html`.
- Logo : `LOGO_VERSION = "1.1"` pour utiliser la retouche proposée (slide 17, fichiers `assets/logo/symbole-v1.1*.svg`).
- Regénérer les PDF : `OUT=. node build.js` (Playwright + Chromium).

Captures de l'app prises à 390 × 844 @2x sur la branche de l'app (`app/`).
