# FrigoFlash : l'app (prototype HTML/CSS/JS)

**Ouvrir `index.html` en double-clic.** Aucun serveur, aucune connexion, aucune clé API : polices, icônes, illustrations et données de démo sont embarquées. Sur ordinateur, l'app s'affiche dans un cadre de téléphone avec un panneau d'aide à la démo ; sur un vrai téléphone (largeur ≤ 440 px), elle passe en plein écran.

## Parcours de démo (< 60 s)
1. **Flasher mon frigo** → choisir *Frigo étudiant* (ou importer une photo : elle reste sur l'appareil et l'analyse simulée renvoie le frigo étudiant).
2. Analyse animée (≈ 3,5 s) → ingrédients détectés. Retirer la bière, ajouter « farine » : les galettes passent à 100 %.
3. **Voir mes 3 recettes** → *Riz sauté aux œufs et courgette* → **J'ai cuisiné ça !** → confettis, +650 g.
4. **Voir mon impact** : 2,6 → 3,2 kg, 12,80 €, 8,0 kg CO₂e, 12 repas, série de 4 jours.

Pour rejouer la démo : *Impact › Réinitialiser la démo* (ou le bouton du panneau sur ordinateur). `Échap` = retour.

## Écrans
| | Écran | Où |
|---|---|---|
| E0 | Splash (logo + effet flash) | `splash()` |
| E1 | Onboarding 3 slides + prénom, régime, allergies | `SCREENS.onboarding` |
| E2 | Accueil : bouton Flash, « à manger vite », compteur, favoris, derniers flashs | `SCREENS.home` |
| E3 | Feuille « Quel frigo on flashe ? » (4 frigos + import photo) | `openFrigoSheet()` |
| E4 | Analyse animée (scan, messages, ingrédients trouvés) | `SCREENS.scan` |
| E5 | Ingrédients : retirer / remettre / ajouter, « pourquoi vite » | `SCREENS.ingredients` |
| E6 | 3 recettes classées anti-gaspi, « Autres idées », filtres régime | `SCREENS.recettes` |
| E7 | Fiche recette, « J'ai cuisiné ça ! », célébration | `SCREENS.recette`, `cook()` |
| E8 | Impact : compteurs animés, histogramme 4 semaines, série, réglages | `SCREENS.impact` |
| E9 | Mode cuisine pas à pas avec minuteur | `SCREENS.cuisine` |
| E10 | Badges (dans E8) | `SCREENS.impact` |

## Fichiers
- `css/tokens.css`, `css/components.css` : DA (version corrigée après revue), `css/fonts/`
- `css/app.css` : styles propres à l'app, uniquement à partir des tokens
- `js/data.js` : 4 frigos, 18 recettes, historique fictif (même format JSON qu'une vraie IA en V2)
- `js/store.js` : état `localStorage` (`frigoflash.v1`), moteur de classement, calcul d'impact
- `js/app.js` : navigation, écrans, feuilles, animations
- `js/icons.js` : icônes Lucide embarquées (+ `pause`)
- `assets/` : logos et illustrations de la DA

## Règles de calcul (01-analyse.md, 7.4)
- kg sauvés = poids des ingrédients **frais** utilisés (pâtes, conserves, sauces ne comptent pas)
- € = kg × 4 (ADEME) · CO₂e = kg × 2,5 (FAO 2013)
- Une recette s'affiche si elle respecte régime et allergies et qu'il manque au plus 1 ingrédient. Retirer un ingrédient le fait passer en « manquant ».
