# FrigoFlash : revue critique de la DA (étape 2)

> Relecture de tout `02-da/` : charte, 12 logos, tokens, composants, 16 illustrations, 3 maquettes rendues dans Chromium à 390 × 844. Contrastes recalculés, zones tactiles mesurées dans le navigateur.
> **Les corrections marquées ✅ sont déjà appliquées dans les fichiers.**

## Verdict

**Très bonne DA, prête pour le dev.** Elle suit fidèlement le brief v2 (piste « l'éclair d'abord », Bricolage + DM Sans, illustrations SVG, pas de mascotte, chiffres ADEME/FAO cohérents) et va plus loin que demandé : polices et icônes embarquées (marche en `file://` sans Wi-Fi), mode sombre dans les tokens, `prefers-reduced-motion` géré. Les maquettes ont une vraie personnalité (contours encre + ombre dure sur ce qui se tape, surligneur jaune) sans tomber dans les clichés IA ou écolo.

Note : **16,5/20**. Les points faibles sont des détails d'exécution, sauf un sujet de fond : le logo.

## 1. Ce qui est réussi (à ne pas casser au dev)

- **Système de couleurs par rôle** (`--primary`, `--urgent`…) : contrastes texte tous ≥ 4,5:1, vérifiés (encre/jaune 12,7 · menthe 700/100 4,6 · corail 700/100 5,0 · gris 600/crème 6,5).
- **Urgence jamais portée par la couleur seule** : corail + sablier + mot « vite ».
- **Surligneur jaune repris du logo**, un mot par écran : signature forte et peu coûteuse.
- **Illustrations des frigos** : lisibles, drôles (toile d'araignée du frigo vide), aliments urgents marqués. Elles vont faire la démo.
- **E8** : la carte héros encre + chiffre jaune 64 px est le meilleur écran ; sources affichées sous les chiffres, ce qui répond d'avance au jury.
- Consignes pour le dev très concrètes (section 10 de la charte) : écrans non maquettés décrits composant par composant.

## 2. Corrections appliquées ✅

| # | Problème trouvé | Correction |
|---|---|---|
| 1 | **Zones tactiles < 44 px** mesurées : favoris 40 et 36 px, chips 40 px, boutons du régime 40 px, liens « Voir tout » / « Tout » 21 px de haut | Favoris 44 px, chips 44 px, régime 44 px, liens texte 44 px (`components.css`, maquettes E2/E6) ; nouvelle classe `.ff-textlink` |
| 2 | **Pastilles en 13 px** alors qu'elles portent une info clé (« Manque : farine », « Sauve 3 aliments ») | `.ff-pill` passe à 14 px / 28 px de haut |
| 3 | **Carte recette non cliquable** et piège pour le dev : le bouton favori est dans la carte ; envelopper la carte dans un `<a>` donnerait un bouton dans un lien (HTML invalide, clic sur ♥ qui ouvre la recette) | Motif « lien étiré » ajouté : `.ff-recipe__link::after` couvre la carte, favori au-dessus (`z-index: 2`), focus clavier sur toute la carte |
| 4 | **E8 incohérent** : série de 4 jours cette semaine (L M M J) mais semaine en cours à 0,65 kg, soit uniquement les 650 g de ce soir | Histogramme corrigé : 0,5 · 0,65 · 0,8 · **1,25** (total toujours 3,2 kg), libellé accessible mis à jour |
| 5 | **Bouton « Partager » sur E8** sans fonction prévue au MVP : un bouton mort devant le jury | Retiré de la maquette (l'icône reste dispo pour la V2) |
| 6 | E2 : « d'après ton flash **d'hier** » suggère la mémoire du frigo, prévue en V2 | « d'après ton **dernier** flash » (faisable : on garde le dernier résultat dans `localStorage`) |
| 7 | Aperçus PNG périmés après ces changements | `apercus/` régénérés (@2x, écran + complet) |

## 3. À traiter (non corrigé ici, décision ou travail du dev)

### 3.1 Logo : risque « batterie qui charge » (le plus important)
Un rectangle noir arrondi + un éclair au centre se lit d'abord comme une **icône de batterie / de recharge** ; la DA l'a elle-même noté. À 24-48 px (icône d'app, favicon), le trait de porte disparaît presque et il ne reste que « rectangle + éclair ». Originalité : correcte, pas mémorable.

Pistes, du plus simple au plus fort, à faire seulement si le temps le permet (le dev n'en dépend pas) :
1. Ajouter **2 petits pieds** sous le frigo et **arrondir davantage le haut** (silhouette frigo vintage) : 2 formes de plus.
2. Faire **sortir l'éclair du bord droit** pour qu'il soit vraiment une poignée, et non un symbole posé au milieu.
3. Garder les **rayons du flash** même sur le favicon (ce sont eux qui disent « photo »).

Décision proposée : **garder le logo pour le dev**, retoucher éventuellement avant la présentation PDF.

### 3.2 Dataviz sur fond clair
Jaune et menthe n'ont que **1,3:1 et 1,7:1** sur la crème : des barres jaunes sur une slide claire seront quasi invisibles (WCAG demande 3:1 pour les éléments graphiques). **Règle pour le PDF** : graphiques jaune/menthe **sur fond encre** (comme E8), ou sur fond clair avec un contour encre 2 px sur chaque barre ou point.

### 3.3 Pour le dev
- **Deux boutons Flash sur l'accueil** (la grosse carte et l'onglet central) : c'est voulu et ça marche, mais les deux doivent ouvrir **la même feuille E3**.
- Le bouton Flash central de la barre d'onglets n'a pas de texte visible : garder un `aria-label="Flasher mon frigo"`.
- « 12,80 € **économisés** » : c'est la **valeur** des aliments sauvés, pas de l'argent en poche. Libellé plus honnête possible : « de nourriture sauvée ». À garder tel quel si on assume, mais à savoir défendre à l'oral.
- Le corail sert à la fois à l'urgence et à la série CO₂e des graphiques ; acceptable, mais ne jamais mettre les deux côte à côte sur un même écran.
- Illustrations des recettes en vignette compacte (104 px) : l'assiette est coupée. C'est joli, mais pour les recettes ajoutées, centrer le plat dans le SVG.
- Les SVG contiennent un gros bloc de métadonnées (signature de provenance, ≈ 8 Ko chacun) : sans effet sur le rendu, ne pas le supprimer à la main.
- Le repo GitHub (`da/` sur la branche du thread DA) contient la version **d'avant** cette revue : copier les fichiers de `/mnt/project-files/frigoflash/02-da/` qui ont changé (`components.css`, `02-direction-artistique.md`, `maquettes/*.html`, `apercus/*.png`, ce fichier).

## 4. Check-list pour la critique de l'app (étape 3)

Démo complète < 60 s · ouverture directe en `file://` · zones tactiles ≥ 44 px · aucune couleur hors tokens · lien étiré sur les cartes · urgence = couleur + icône + mot · compteurs animés en chiffres tabulaires · `prefers-reduced-motion` · bouton « Réinitialiser la démo » fonctionnel · aucun bouton sans action.
