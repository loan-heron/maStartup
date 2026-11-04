# FrigoFlash : direction artistique v1.0

> Étape 2 du pipeline (analyse → **DA** → dev → présentation). 4 novembre 2026.
> Source : `../01-analyse.md` (v2) et `../01-analyse-critique.md`. Piste retenue : **« l'éclair d'abord »** (recommandée par la critique).
> Vue d'ensemble visuelle : ouvrir **`styleguide.html`** dans un navigateur. Aperçus PNG des maquettes : `apercus/`.

---

## 0. En une phrase

**Un jaune éclair qui donne envie de taper, une encre qui structure, de la menthe pour « sauvé » et du corail pour « vite », sur un fond crème chaleureux.** Le style mêle des cartes douces (ombres légères, coins 24 px) et des éléments « pop » d'action (contour encre 2 px + ombre dure décalée) : on voit tout de suite ce qui se tape.

## 1. Arborescence livrée

```
02-da/
├── 02-direction-artistique.md   ← ce document (charte + règles pour le dev)
├── styleguide.html              ← page visuelle : logo, palette, typo, icônes, illustrations, composants, motion
├── tokens.css                   ← design tokens (couleurs, typo, espacements, rayons, ombres, motion, mode sombre)
├── components.css               ← composants UI prêts à l'emploi (préfixe ff-)
├── fonts/                       ← Bricolage Grotesque + DM Sans en woff2 (OFL), chargées par tokens.css
├── icons/icons.js               ← 41 icônes Lucide embarquées (marche en file://, sans CDN) + svg/ + licence
├── logo/                        ← 12 SVG (horizontal, vertical, symbole, négatif, mono, icône d'app, favicon)
├── illustrations/frigos/        ← 4 frigos de démo (étudiant, dimanche, végé, vide)
├── illustrations/recettes/      ← 12 visuels recettes (assiettes vues du dessus)
├── maquettes/                   ← E2-accueil.html, E6-recettes.html, E8-impact.html (390 × 844)
└── apercus/                     ← PNG @2x des 3 maquettes (écran + version défilée complète)
```

Tout fonctionne **en ouvrant les fichiers directement** (`file://`), sans serveur ni connexion : polices et icônes sont embarquées.

## 2. Logo

**Idée** : un frigo à deux portes dont **la poignée est un éclair**, avec les **trois rayons d'un flash** d'appareil photo en haut à droite. Frigo (le lieu) + Flash (la photo, l'idée instantanée), en 6 formes.

| Fichier | Usage |
|---|---|
| `logo-horizontal.svg` | Version principale sur fond clair. « Flash » est souligné au surligneur jaune |
| `logo-horizontal-negatif.svg` | Sur fond encre : symbole jaune, « Flash » en jaune |
| `logo-vertical.svg` | Couverture de la présentation, splash |
| `logo-horizontal-mono-encre.svg` / `-mono-blanc.svg` | Impression N&B, tampon, fond photo |
| `symbole.svg`, `symbole-negatif.svg`, `symbole-mono-*.svg` | Symbole seul (en-tête d'app, avatar) |
| `icone-app.svg` (fond jaune) / `icone-app-sombre.svg` | Icône d'app 512 px, arrondi 114 px |
| `favicon.svg` | Onglet navigateur (sans rayons, lisible à 16 px) |

- Logotype : Bricolage Grotesque ExtraBold, vectorisé (pas de dépendance à la police).
- **Zone de protection** : ¼ de la hauteur du symbole tout autour. **Taille mini** : symbole 16 px, logo horizontal 96 px de large.
- **Interdits** : logo jaune sur fond clair (invisible), texte blanc sur jaune, rotation, déformation, dégradé, ombre, autre police.
- Écart volontaire avec la critique : rien de vert sapin, pas de feuille dans le logo (cliché écolo).

## 3. Couleurs

| Rôle | Token | HEX | Règle |
|---|---|---|---|
| **Jaune éclair** (signature) | `--ff-flash-400` | `#FFD60A` | Bouton Flash, CTA, surligneur, 1ʳᵉ série de graphiques. **Texte encre dessus, jamais blanc.** ≤ 15 % de l'écran |
| Jaune pressé | `--ff-flash-500` | `#F2C500` | État `:active` |
| Jaune clair | `--ff-flash-100` | `#FFF3B0` | Fonds d'icônes « kg », visuels recettes |
| Jaune texte | `--ff-flash-700` | `#7A5E00` | Texte jaune sur fond clair (5,4:1) |
| **Menthe** | `--ff-menthe-400` | `#3DDBA0` | Fraîcheur, succès, « sauvé », série € |
| Menthe clair / texte | `--ff-menthe-100` / `-700` | `#DDF8EC` / `#0A7D5C` | Pastille « Sauve 3 aliments » (4,6:1) |
| **Corail** (urgence) | `--ff-corail-400` | `#FF6B4A` | « À manger vite » : toujours avec le **sablier** et le **mot** |
| Corail clair / texte | `--ff-corail-100` / `-700` | `#FFE6DE` / `#B5371D` | Chip urgente (5,0:1) |
| **Encre** | `--ff-encre-900` | `#16171D` | Texte, logo, contours pop, cartes sombres |
| Gris texte | `--ff-gris-600` | `#5E5A52` | Texte secondaire (6,9:1 sur blanc) |
| Gris décor | `--ff-gris-400` | `#8A847A` | Placeholders, décor. Pas pour du texte < 18 px |
| Bordure | `--ff-gris-200` | `#E9E1D2` | Bordures, séparateurs |
| **Crème** | `--ff-creme-50` | `#FFF8EC` | Fond de l'app |
| Blanc | `--ff-blanc` | `#FFFFFF` | Cartes |
| Focus | `--focus` | `#2F6BFF` | Anneau de focus clavier, hors palette exprès |

**Contrastes vérifiés (WCAG AA)** : encre/jaune 12,7:1 · encre/crème 16,9:1 · menthe texte/menthe clair 4,6:1 · corail texte/corail clair 5,0:1 · jaune/encre 12,7:1 · blanc/jaune **1,4:1 (interdit)**.

**Dataviz** (app + PDF) : `--dv-1` jaune = kg · `--dv-2` menthe = € · `--dv-3` corail = CO₂e · `--dv-4` encre = repas / référence · `--dv-5` lilas `#9B8CFF` en réserve. Barres arrondies 10 px, valeur au-dessus, période en cours **hachurée** (pas seulement plus claire).

**Mode sombre** : prévu dans `tokens.css` via `[data-theme="dark"]` (fond `#121318`, surfaces `#1C1D24`). Optionnel pour le MVP.

## 4. Typographie

- **Bricolage Grotesque** (titres, chiffres) : grotesque expressive au dessin un peu « fait main », gourmande sans être enfantine. Graisses 700-800.
- **DM Sans** (texte, interface) : très lisible en petit. Graisses 400 / 500 / 700.
- Fichiers dans `fonts/` (woff2, sous-ensemble latin qui inclut é, è, à, ç, **œ**), déclarés dans `tokens.css`.

| Niveau | Token | Taille / interligne | Police | Exemple |
|---|---|---|---|---|
| Display | `--fs-display` | 44 / 1.0, -3 % | Bricolage 800, `tabular-nums` | « 3,2 kg » |
| H1 | `--fs-h1` | 32 / 1.05 | Bricolage 800 | « On sauve quoi ce soir ? » |
| H2 | `--fs-h2` | 24 / 1.15 | Bricolage 700 | Titre de fiche recette |
| H3 | `--fs-h3` | 19 / 1.2 | Bricolage 700 | Titre de carte, de section |
| Body | `--fs-body` | 16 / 1.5 | DM Sans 400 | Étapes de recette (jamais < 16 px) |
| Small | `--fs-small` | 14 / 1.4 | DM Sans 500 | Méta : temps, niveau |
| Caption | `--fs-caption` | 12 / 1.3 | DM Sans 700 | Onglets, unités, surtitres en capitales (+6 % d'espacement) |

Le **surligneur jaune** (`.ff-mark`), repris du logo, met en valeur **un seul mot par écran** : « ce soir », « 0 courses ».

## 5. Iconographie

- **Lucide 0.460** (ISC), trait 2 px, 24 px ; trait 2,4 dans les pastilles pleines. Embarquées dans `icons/icons.js` :
  ```html
  <i data-icon="zap" data-size="24" data-stroke="2"></i>
  <script src="icons/icons.js"></script>   <!-- rend automatiquement ; FFIcons.render(el) après un rendu JS -->
  ```
- Correspondance : Accueil `house` · Flash `zap` · Impact `chart-no-axes-column` · Photo `camera` · Importer `image-up` · Temps `clock` · Niveau `chef-hat` · Favori `heart` · Sauvé `leaf` · **Urgence `hourglass`** · Manque `shopping-basket` · € `euro` · CO₂ `cloud` · Repas `utensils` · Série `flame` · Réinitialiser `rotate-ccw` · Célébration `sparkles` · Verrouillé `lock`.
- **Ingrédients** : emoji + nom en texte (« 🥒 courgette »), jamais l'emoji seul.

## 6. Illustrations

Style **flat, contour encre 3 px**, couleurs de la palette, aucune photo, pas de mascotte.

- **Frigos de démo** (`illustrations/frigos/`, 300 × 360) : frigo ouvert vu de face, porte à droite, lumière jaune. Les aliments urgents portent une **pastille corail avec sablier**. Le frigo vide a une toile d'araignée (le ton humoristique de 8.3).
  - `frigo-etudiant.svg` : œufs, riz, emmental, oignon, sauce soja, bière, **courgette urgente**
  - `frigo-dimanche.svg` : œufs, jambon, crème, pâtes, poivron, **yaourts et tomates urgents**
  - `frigo-vege.svg` : feta, citron, pois chiches, lait de coco, carottes, **épinards urgents**
  - `frigo-vide.svg` : moutarde, beurre, un citron
- **Recettes** (`illustrations/recettes/`, 360 × 200, s'utilise en `object-fit: cover`) : assiette, bol ou poêle vus du dessus sur fond jaune clair, menthe clair ou corail clair, avec les 3 rayons du logo. 12 visuels : les 3 recettes citées pour chaque frigo + 3 recettes de placard.
- **Pour les recettes sans visuel** (le dev en ajoutera pour atteindre 5 par frigo) : réutiliser le visuel le plus proche, ou un bloc de repli : fond `--ff-flash-100` / `--ff-menthe-100` / `--ff-corail-100` (en alternance) + 2-3 emojis des ingrédients principaux à 40 px, centrés.

## 7. Composants (`components.css`)

| Composant | Classe | Notes |
|---|---|---|
| Cadre téléphone | `.ff-stage > .ff-phone > .ff-screen` | 390 × 844 sur ordi, plein écran sous 440 px |
| **Bouton Flash** (signature) | `.ff-flash` | Jaune, contour encre, ombre dure 6 px. Au tap : `.is-flashing` (voile blanc 600 ms) |
| Boutons | `.ff-btn`, `--dark`, `--secondary`, `--ghost`, `--block`, `--lg` | Zone tactile ≥ 48 px, s'enfoncent de 2 px |
| Barre d'onglets | `.ff-tabbar`, `.ff-tab`, `.ff-tab-flash` | Accueil · [Flash surélevé] · Impact ; onglet actif `aria-current="page"` |
| Chips ingrédients | `.ff-chip`, `--urgent`, `--removed`, `--add`, `--selected` | Urgent = corail + sablier + « vite » ; retiré = barré + pointillés |
| Pastilles | `.ff-pill--save`, `--full`, `--missing`, `--urgent`, `--flash` | « Sauve 3 aliments », « 100 % ton frigo », « Manque : farine » |
| Carte recette | `.ff-recipe` (+ `--compact`) | Visuel 9:5, rang, favori, méta, pastilles |
| Compteurs | `.ff-stats > .ff-stat--kg/--eur/--co2/--meals` | Chiffres Bricolage 800 tabulaires |
| Mini compteur | `.ff-impact-strip` | Bandeau encre de l'accueil |
| Série, badges | `.ff-streak`, `.ff-achievements` | `is-done`, `is-today`, `is-locked` |
| Régime | `.ff-segment` | Boutons `aria-pressed` |
| Champ | `.ff-field`, `.ff-input` | Focus : bord encre + halo jaune clair |
| Réglages | `.ff-list`, `.ff-list__item` | |
| Feuille du bas (E3) | `.ff-sheet-backdrop`, `.ff-sheet`, `.ff-sheet__grip` | Monte en 360 ms |
| Toast | `.ff-toast` | Célébration « +650 g sauvés » |
| Scan (E4) | `.ff-scan`, `.ff-scan__line` | Ligne jaune lumineuse qui balaie |
| Apparition | `.ff-reveal` | Décalage 120 ms entre les 3 cartes |

## 8. Motion

| Moment | Durée | Courbe | Ce qui se passe |
|---|---|---|---|
| Splash (E0) | ≤ 1,2 s | `--ease-out` | Symbole qui grossit (0,8 → 1) puis flash blanc plein écran (0,95 → 0 en 600 ms), puis l'accueil |
| Tap bouton Flash | 120 + 600 ms | `--ease-spring` | Enfoncement 4 px + voile blanc `.is-flashing` |
| Feuille « Choisir un frigo » | 360 ms | `--ease-out` | `translateY(100 %)` → 0, fond assombri en 220 ms |
| Scan (E4) | ≈ 3 s | `--ease-in-out` | Ligne qui balaie (1,6 s aller-retour), messages toutes les 900 ms |
| Ingrédients (E5) | 220 ms, décalage 40 ms | `--ease-out` | Chips en cascade |
| 3 recettes (E6) | 360 ms, décalage 120 ms | `--ease-spring` | Montée de 24 px + zoom 0,96 → 1, une par une |
| « J'ai cuisiné ça ! » | 1,2 s | `--ease-out` | ≈ 60 confettis (jaune, menthe, corail, encre) + toast |
| Compteurs | 800 ms | `--ease-out` | Comptage de l'ancienne à la nouvelle valeur |

Courbes : `--ease-out` `cubic-bezier(.22,1,.36,1)` · `--ease-spring` `cubic-bezier(.34,1.56,.64,1)` · `--ease-in-out` `cubic-bezier(.65,0,.35,1)`. Avec `prefers-reduced-motion`, durées à 0 et ligne de scan fixe (déjà géré dans les CSS).

## 9. Maquettes (E2, E6, E8)

HTML statique 390 × 844, uniquement à partir des tokens et des composants. Données = parcours démo de l'analyse (Inès, frigo étudiant).

- **E2 Accueil** : « Salut Inès », titre « On sauve quoi *ce soir* ? », gros bouton Flash, rappel « À manger vite d'après ton flash d'hier », bandeau du mois (3,2 kg · 12,80 € · 12 repas), favoris en carrousel, derniers flashs.
- **E6 3 recettes** : « 3 idées, *0 courses.* », pastilles « Priorité : courgette » et régime ; carte n° 1 en grand (« Meilleur anti-gaspi », sauve 3 aliments · 650 g, 100 % ton frigo), n° 2 et n° 3 en compact (la 3ᵉ affiche « Manque : farine »), bouton « Autres idées ».
- **E8 Impact** : carte héros encre 3,2 kg + « +650 g ce soir », histogramme sur 4 semaines (0,6 · 0,9 · 1,05 · 0,65 = 3,2 kg), tuiles € / CO₂e / repas / série, sources sous les chiffres (4 €/kg ADEME, 2,5 kg CO₂e/kg FAO 2013), série de la semaine, 3 badges dont 2 verrouillés, réglages (régime, allergies, réinitialiser la démo).

Chiffres cohérents avec l'analyse v2 : 3,2 kg × 4 € = 12,80 € ; 3,2 kg × 2,5 = 8,0 kg CO₂e.

## 10. Consignes pour le développeur (étape 3)

1. Importer dans cet ordre : `tokens.css`, `components.css`, puis le CSS propre de l'app ; `icons.js` en fin de `<body>`. Copier `fonts/`, `icons/`, `logo/`, `illustrations/` dans le repo (les chemins des polices sont relatifs à `tokens.css`).
2. Utiliser les **rôles** (`--bg`, `--text`, `--primary`, `--urgent`…) plutôt que les couleurs brutes : le mode sombre marchera tout seul.
3. Écrans non maquettés, à construire avec les composants :
   - **E0 Splash** : fond jaune, `logo-vertical` centré, effet flash (section 8).
   - **E1 Onboarding** : 3 slides (illustration frigo, assiette, compteur), titre H1, texte body, points de pagination encre, « Passer » en `.ff-btn--ghost`, dernière slide avec `.ff-segment` du régime + `.ff-btn--block`.
   - **E3 Choisir un frigo** : `.ff-sheet` avec une grille 2 × 2 de cartes blanches (illustration frigo + nom + « 7 ingrédients »), puis `.ff-btn--dark` « Importer une photo » (`<input type="file" accept="image/*" capture="environment">`).
   - **E4 Analyse** : illustration ou photo dans `.ff-scan` (floutée à 2 px), messages en H3 qui changent (« Je fouille… », « Ces tomates ont l'air pressées 🍅 »).
   - **E5 Ingrédients** : titre « 7 trouvés, 1 à sauver vite », `.ff-chips` (urgents en premier), `.ff-chip--add`, CTA collant en bas « Voir mes 3 recettes ».
   - **E7 Fiche recette** : visuel recette en haut (pleine largeur, 260 px), H2, méta, liste d'ingrédients cochés (icône `check` menthe ; manquant = `shopping-basket` gris), étapes numérotées dans des pastilles encre, CTA collant « J'ai cuisiné ça ! » → confettis + toast.
4. Accessibilité : texte ≥ 16 px, zones tactiles ≥ 48 px, `aria-label` sur les boutons-icônes, urgence jamais par la couleur seule, focus visible (`--focus`).
5. Ne pas ajouter de couleur hors tokens. Si un besoin apparaît, le signaler à la revue.

## 11. Pour la présentation (étape 4)

- Couverture : fond jaune `#FFD60A`, `logo-vertical`, signature « Un flash. Trois recettes. Zéro gâchis. ».
- Intercalaires : fond encre, titre Bricolage 800 crème, un mot surligné jaune.
- Graphiques : couleurs `--dv-1` à `--dv-4`, mêmes règles que l'histogramme de E8.
- Captures : `apercus/*.png` (@2x) ; illustrations réutilisables telles quelles.

## 12. Choix et justifications (pour la revue critique)

| Choix | Pourquoi |
|---|---|
| Jaune éclair en signature | Porte le nom (« Flash »), se démarque du vert omniprésent de l'anti-gaspi (Too Good To Go, applis bio), donne envie de taper |
| Fond crème plutôt que blanc | Chaleur « cuisine », moins clinique ; les cartes blanches ressortent |
| Contours encre + ombres dures sur l'action uniquement | Énergie pop (Duolingo / BeReal) sans surcharger : les cartes restent douces, seul ce qui se tape « pop » |
| Corail pour l'urgence, + sablier + texte | Chaud mais pas anxiogène (pas de rouge alerte) ; lisible par les daltoniens |
| Illustrations flat contour encre | Cohérentes avec les contours des boutons, sans droits d'image, faisables en SVG à la main |
| Polices embarquées | La démo ne dépend pas du Wi-Fi de la salle |
| Pas de feuille ni de planète | Évite les clichés écolo (brief 10.6) ; l'impact passe par les chiffres positifs |

Risques connus : le jaune peut fatiguer s'il déborde (règle des 15 %) ; le symbole frigo + éclair centré pourrait évoquer une batterie, d'où l'éclair décalé à droite en poignée et les rayons du flash.
