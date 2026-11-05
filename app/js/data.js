/* =====================================================================
   FrigoFlash : données de démo (aucune API appelée)
   Même forme que ce que renverrait un modèle vision en V2 (voir 01-analyse.md, 7.3).
   Chargé en <script> (et pas par fetch) pour marcher en ouvrant index.html directement.

   Ingrédient : id, nom, emoji, qte, urgence (haute | moyenne | basse), raison, g (poids moyen),
                frais (true = périssable, compte dans les kg sauvés ; riz sec, pâtes, conserves = false)
   Recette    : utilise [{ref, g}] (ingrédients du frigo), placard [noms], manque [ids de SUGGESTIONS],
                vege / vegan / halal, allergenes [gluten | lactose | oeufs], etapes [{t, min?}]
   Placard de base toujours supposé : sel, poivre, huile, eau.
   ===================================================================== */
(function () {
  const IMG = 'assets/illustrations/';

  const FRIGOS = [
    {
      id: 'etudiant',
      nom: 'Frigo étudiant',
      court: 'étudiant',
      illu: IMG + 'frigos/frigo-etudiant.svg',
      accroche: 'Le classique de coloc',
      messages: ['J’ouvre la porte…', 'Je repère des œufs 🥚', 'Un reste de riz, parfait 🍚', 'Cette courgette a l’air pressée 🥒', 'Je cherche les meilleures recettes…'],
      ingredients: [
        { id: 'courgette', nom: 'courgette', emoji: '🥒', qte: '1', urgence: 'haute', raison: 'un peu molle, là depuis 9 jours', g: 250, frais: true },
        { id: 'riz', nom: 'reste de riz cuit', emoji: '🍚', qte: '1 bol', urgence: 'moyenne', raison: 'cuit il y a 2 jours', g: 250, frais: true },
        { id: 'oeufs', nom: 'œufs', emoji: '🥚', qte: '×6', urgence: 'basse', g: 300, frais: true },
        { id: 'emmental', nom: 'emmental râpé', emoji: '🧀', qte: '1 sachet', urgence: 'basse', g: 150, frais: false },
        { id: 'oignon', nom: 'oignon', emoji: '🧅', qte: '1', urgence: 'basse', g: 100, frais: false },
        { id: 'soja', nom: 'sauce soja', emoji: '🍶', qte: '1 flacon', urgence: 'basse', g: 0, frais: false },
        { id: 'biere', nom: 'bière', emoji: '🍺', qte: '1', urgence: 'basse', g: 0, frais: false }
      ],
      recettes: [
        {
          id: 'riz-saute', titre: 'Riz sauté aux œufs et courgette', temps: 15, niveau: 'Facile',
          img: IMG + 'recettes/riz-saute-oeufs-courgette.svg',
          utilise: [{ ref: 'riz', g: 250 }, { ref: 'oeufs', g: 150, qte: '3' }, { ref: 'courgette', g: 250 }, { ref: 'soja', g: 0, qte: '2 c. à soupe' }],
          placard: ['huile', 'poivre'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['gluten', 'oeufs'],
          etapes: [
            { t: 'Coupe la courgette en petits dés.' },
            { t: 'Fais chauffer 1 c. à soupe d’huile dans une grande poêle et fais revenir la courgette à feu vif.', min: 4 },
            { t: 'Ajoute le riz, émiette-le bien et laisse-le dorer sans trop remuer.', min: 3 },
            { t: 'Pousse le riz sur le côté, casse 3 œufs dans la poêle et brouille-les, puis mélange tout.', min: 1 },
            { t: 'Arrose de 2 c. à soupe de sauce soja, poivre, et sers bien chaud.' }
          ]
        },
        {
          id: 'omelette', titre: 'Omelette courgette-fromage', temps: 10, niveau: 'Facile',
          img: IMG + 'recettes/omelette-courgette-fromage.svg',
          utilise: [{ ref: 'oeufs', g: 200, qte: '4' }, { ref: 'courgette', g: 150, qte: '½' }, { ref: 'emmental', g: 60, qte: '1 poignée' }],
          placard: ['huile', 'sel', 'poivre'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['oeufs', 'lactose'],
          etapes: [
            { t: 'Râpe la moitié de la courgette et presse-la dans tes mains pour enlever l’eau.' },
            { t: 'Bats 4 œufs avec du sel et du poivre, puis ajoute la courgette et une poignée d’emmental.' },
            { t: 'Verse dans une poêle huilée bien chaude et laisse cuire à feu moyen.', min: 5 },
            { t: 'Plie l’omelette en deux et fais-la glisser dans l’assiette.' }
          ]
        },
        {
          id: 'galettes', titre: 'Galettes de riz croustillantes', temps: 25, niveau: 'Moyen',
          img: IMG + 'recettes/galettes-riz-croustillantes.svg',
          utilise: [{ ref: 'riz', g: 250 }, { ref: 'oeufs', g: 50, qte: '1' }, { ref: 'emmental', g: 50 }, { ref: 'oignon', g: 50, qte: '½' }],
          placard: ['huile', 'sel', 'poivre'], manque: ['farine'],
          vege: true, vegan: false, halal: true, allergenes: ['gluten', 'oeufs', 'lactose'],
          etapes: [
            { t: 'Hache finement le demi-oignon.' },
            { t: 'Mélange le riz, 1 œuf, l’emmental, l’oignon et 2 c. à soupe de farine. Sale, poivre.' },
            { t: 'Forme 6 petites galettes bien tassées avec tes mains mouillées.' },
            { t: 'Fais-les dorer dans l’huile chaude, 4 min de chaque côté.', min: 8 },
            { t: 'Égoutte sur du papier absorbant et sers avec un filet de sauce soja.' }
          ]
        },
        {
          id: 'oeufs-soja', titre: 'Œufs brouillés soja-oignon', temps: 10, niveau: 'Facile',
          emojis: ['🥚', '🧅', '🍶'],
          utilise: [{ ref: 'oeufs', g: 150, qte: '3' }, { ref: 'oignon', g: 50, qte: '½' }, { ref: 'soja', g: 0, qte: '1 c. à soupe' }],
          placard: ['huile'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['oeufs', 'gluten'],
          etapes: [
            { t: 'Émince le demi-oignon et fais-le fondre dans un peu d’huile.', min: 3 },
            { t: 'Ajoute 3 œufs battus avec la sauce soja et remue doucement à feu doux.', min: 2 },
            { t: 'Retire du feu quand c’est encore crémeux : ça finit de cuire tout seul.' }
          ]
        },
        {
          id: 'poelee-courgette', titre: 'Poêlée courgette-oignon au soja', temps: 12, niveau: 'Facile',
          emojis: ['🥒', '🧅'],
          utilise: [{ ref: 'courgette', g: 250 }, { ref: 'oignon', g: 100 }, { ref: 'soja', g: 0, qte: '1 c. à soupe' }],
          placard: ['huile', 'poivre'], manque: [],
          vege: true, vegan: true, halal: true, allergenes: ['gluten'],
          etapes: [
            { t: 'Coupe la courgette en demi-rondelles et l’oignon en lamelles.' },
            { t: 'Fais-les sauter à feu vif dans 1 c. à soupe d’huile.', min: 6 },
            { t: 'Déglace avec la sauce soja, poivre et sers tel quel ou sur du riz.' }
          ]
        }
      ]
    },
    {
      id: 'dimanche',
      nom: 'Frigo du dimanche soir',
      court: 'du dimanche',
      illu: IMG + 'frigos/frigo-dimanche.svg',
      accroche: 'Les restes du week-end',
      messages: ['J’ouvre la porte…', 'Ces tomates ont l’air pressées 🍅', 'Ce yaourt te supplie 🥛', 'Du jambon, du poivron… 🫑', 'Je cherche les meilleures recettes…'],
      ingredients: [
        { id: 'tomates', nom: 'tomates', emoji: '🍅', qte: '×4', urgence: 'haute', raison: 'molles au toucher', g: 400, frais: true },
        { id: 'yaourt', nom: 'yaourt nature', emoji: '🥛', qte: '×2', urgence: 'haute', raison: 'date limite demain', g: 250, frais: true },
        { id: 'jambon', nom: 'jambon', emoji: '🥓', qte: '3 tranches', urgence: 'moyenne', raison: 'paquet ouvert il y a 3 jours', g: 120, frais: true },
        { id: 'creme', nom: 'crème fraîche', emoji: '🫙', qte: '1 pot', urgence: 'moyenne', raison: 'pot entamé', g: 200, frais: true },
        { id: 'poivron', nom: 'poivron', emoji: '🫑', qte: '1', urgence: 'basse', g: 200, frais: true },
        { id: 'oeufs', nom: 'œufs', emoji: '🥚', qte: '×4', urgence: 'basse', g: 200, frais: true },
        { id: 'pates', nom: 'pâtes', emoji: '🍝', qte: '1 paquet', urgence: 'basse', g: 0, frais: false }
      ],
      recettes: [
        {
          id: 'shakshuka', titre: 'Shakshuka express', temps: 20, niveau: 'Facile',
          img: IMG + 'recettes/shakshuka-express.svg',
          utilise: [{ ref: 'tomates', g: 400, qte: '4' }, { ref: 'oeufs', g: 200, qte: '4' }, { ref: 'poivron', g: 100, qte: '½' }],
          placard: ['huile', 'sel', 'poivre'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['oeufs'],
          etapes: [
            { t: 'Coupe le demi-poivron en lanières et les tomates en dés.' },
            { t: 'Fais revenir le poivron dans l’huile, puis ajoute les tomates. Sale, poivre et laisse compoter.', min: 8 },
            { t: 'Creuse 4 petits puits dans la sauce et casse un œuf dans chacun.' },
            { t: 'Couvre et laisse cuire jusqu’à ce que les blancs soient pris.', min: 5 },
            { t: 'Sers directement dans la poêle, avec du pain si tu en as.' }
          ]
        },
        {
          id: 'pates-cremeuses', titre: 'Pâtes crémeuses jambon-poivron', temps: 20, niveau: 'Facile',
          img: IMG + 'recettes/pates-cremeuses-jambon-poivron.svg',
          utilise: [{ ref: 'pates', g: 0, qte: '200 g' }, { ref: 'creme', g: 200, qte: '1 pot' }, { ref: 'jambon', g: 120, qte: '3 tranches' }, { ref: 'poivron', g: 100, qte: '½' }],
          placard: ['sel', 'poivre'], manque: [],
          vege: false, vegan: false, halal: false, allergenes: ['gluten', 'lactose'],
          etapes: [
            { t: 'Fais cuire les pâtes dans une grande casserole d’eau salée.', min: 10 },
            { t: 'Pendant ce temps, fais revenir le poivron en dés, puis ajoute le jambon coupé en lanières.', min: 4 },
            { t: 'Verse la crème, poivre généreusement et laisse frémir.', min: 2 },
            { t: 'Égoutte les pâtes et mélange-les à la sauce. C’est prêt.' }
          ]
        },
        {
          id: 'poivrons-rotis', titre: 'Poivrons et tomates rôtis, sauce yaourt', temps: 30, niveau: 'Facile',
          img: IMG + 'recettes/poivrons-tomates-rotis-yaourt.svg',
          utilise: [{ ref: 'poivron', g: 100, qte: '½' }, { ref: 'tomates', g: 300, qte: '3' }, { ref: 'yaourt', g: 250, qte: '2' }],
          placard: ['huile', 'sel', 'poivre'], manque: ['ail'],
          vege: true, vegan: false, halal: true, allergenes: ['lactose'],
          etapes: [
            { t: 'Préchauffe le four à 220 °C. Coupe le poivron et les tomates en gros morceaux.' },
            { t: 'Étale-les sur une plaque, arrose d’huile, sale et rôtis.', min: 20 },
            { t: 'Mélange les yaourts avec l’ail écrasé, du sel et un filet d’huile.' },
            { t: 'Étale la sauce dans l’assiette et pose les légumes rôtis par-dessus.' }
          ]
        },
        {
          id: 'salade-pates', titre: 'Salade de pâtes tomate-yaourt', temps: 15, niveau: 'Facile',
          emojis: ['🍝', '🍅', '🫑'],
          utilise: [{ ref: 'pates', g: 0, qte: '150 g' }, { ref: 'tomates', g: 200, qte: '2' }, { ref: 'yaourt', g: 125, qte: '1' }, { ref: 'poivron', g: 50, qte: '¼' }],
          placard: ['huile', 'sel', 'poivre'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['gluten', 'lactose'],
          etapes: [
            { t: 'Fais cuire les pâtes, puis passe-les sous l’eau froide.', min: 10 },
            { t: 'Coupe les tomates et le poivron en petits dés.' },
            { t: 'Mélange le yaourt avec un filet d’huile, sel, poivre : c’est ta sauce.' },
            { t: 'Mélange le tout. Encore meilleur après 10 min au frais.' }
          ]
        },
        {
          id: 'oeufs-cocotte', titre: 'Œufs cocotte crème-jambon', temps: 15, niveau: 'Facile',
          emojis: ['🥚', '🥓', '🫙'],
          utilise: [{ ref: 'oeufs', g: 200, qte: '4' }, { ref: 'creme', g: 100, qte: '4 c. à soupe' }, { ref: 'jambon', g: 60, qte: '2 tranches' }],
          placard: ['sel', 'poivre'], manque: [],
          vege: false, vegan: false, halal: false, allergenes: ['oeufs', 'lactose'],
          etapes: [
            { t: 'Préchauffe le four à 180 °C. Coupe le jambon en petits morceaux.' },
            { t: 'Dans 4 ramequins : 1 c. à soupe de crème, du jambon, puis 1 œuf. Sale, poivre.' },
            { t: 'Enfourne au bain-marie, jusqu’à ce que le blanc soit pris.', min: 10 }
          ]
        }
      ]
    },
    {
      id: 'vege',
      nom: 'Frigo végé',
      court: 'végé',
      illu: IMG + 'frigos/frigo-vege.svg',
      accroche: 'Plein de bonnes intentions',
      messages: ['J’ouvre la porte…', 'Ces épinards commencent à faner 🥬', 'De la feta, miam 🧀', 'Des pois chiches en renfort 🫘', 'Je cherche les meilleures recettes…'],
      ingredients: [
        { id: 'epinards', nom: 'épinards frais', emoji: '🥬', qte: '1 sachet', urgence: 'haute', raison: 'les feuilles fanent', g: 200, frais: true },
        { id: 'feta', nom: 'feta', emoji: '🧀', qte: '1 bloc', urgence: 'moyenne', raison: 'ouverte il y a 4 jours', g: 150, frais: true },
        { id: 'carottes', nom: 'carottes', emoji: '🥕', qte: '×4', urgence: 'basse', g: 300, frais: true },
        { id: 'citron', nom: 'citron', emoji: '🍋', qte: '1', urgence: 'basse', g: 100, frais: true },
        { id: 'poischiches', nom: 'pois chiches', emoji: '🫘', qte: '1 boîte', urgence: 'basse', g: 0, frais: false },
        { id: 'coco', nom: 'lait de coco', emoji: '🥥', qte: '1 brique', urgence: 'basse', g: 0, frais: false }
      ],
      recettes: [
        {
          id: 'salade-carottes', titre: 'Salade carottes-feta-citron', temps: 10, niveau: 'Facile',
          img: IMG + 'recettes/salade-carottes-feta-citron.svg',
          utilise: [{ ref: 'carottes', g: 300, qte: '4' }, { ref: 'feta', g: 100, qte: '⅔ du bloc' }, { ref: 'citron', g: 50, qte: '½' }, { ref: 'epinards', g: 100, qte: '2 poignées' }],
          placard: ['huile', 'poivre'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['lactose'],
          etapes: [
            { t: 'Râpe les carottes et mets-les dans un saladier avec les épinards.' },
            { t: 'Émiette la feta par-dessus.' },
            { t: 'Arrose du jus d’un demi-citron et de 2 c. à soupe d’huile, poivre et mélange.' }
          ]
        },
        {
          id: 'curry', titre: 'Curry pois chiches-épinards', temps: 25, niveau: 'Facile',
          img: IMG + 'recettes/curry-pois-chiches-epinards.svg',
          utilise: [{ ref: 'epinards', g: 200, qte: '1 sachet' }, { ref: 'poischiches', g: 0, qte: '1 boîte' }, { ref: 'coco', g: 0, qte: '1 brique' }, { ref: 'carottes', g: 100, qte: '1' }],
          placard: ['huile', 'sel'], manque: ['curry'],
          vege: true, vegan: true, halal: true, allergenes: [],
          etapes: [
            { t: 'Coupe la carotte en rondelles fines et fais-la revenir dans l’huile avec 1 c. à soupe de curry.', min: 3 },
            { t: 'Ajoute les pois chiches égouttés et le lait de coco, laisse mijoter.', min: 12 },
            { t: 'Ajoute les épinards à la fin : ils fondent en 1 minute.', min: 1 },
            { t: 'Goûte, sale, et sers avec du riz si tu en as.' }
          ]
        },
        {
          id: 'houmous', titre: 'Houmous minute sans tahini', temps: 10, niveau: 'Facile',
          img: IMG + 'recettes/houmous-minute.svg',
          utilise: [{ ref: 'poischiches', g: 0, qte: '1 boîte' }, { ref: 'citron', g: 50, qte: '½' }, { ref: 'carottes', g: 200, qte: '2, en bâtonnets' }],
          placard: ['huile', 'sel', 'eau'], manque: [],
          vege: true, vegan: true, halal: true, allergenes: [],
          etapes: [
            { t: 'Égoutte les pois chiches en gardant un peu de leur jus.' },
            { t: 'Mixe-les (ou écrase-les à la fourchette) avec le jus d’un demi-citron, 3 c. à soupe d’huile et du sel.' },
            { t: 'Détends avec un peu de jus ou d’eau jusqu’à ce que ce soit crémeux.' },
            { t: 'Sers avec les carottes coupées en bâtonnets.' }
          ]
        },
        {
          id: 'epinards-coco', titre: 'Épinards fondants au lait de coco', temps: 10, niveau: 'Facile',
          emojis: ['🥬', '🥥', '🍋'],
          utilise: [{ ref: 'epinards', g: 200, qte: '1 sachet' }, { ref: 'coco', g: 0, qte: '½ brique' }, { ref: 'citron', g: 30, qte: '1 filet' }],
          placard: ['sel', 'poivre'], manque: [],
          vege: true, vegan: true, halal: true, allergenes: [],
          etapes: [
            { t: 'Fais chauffer le lait de coco dans une poêle.', min: 2 },
            { t: 'Ajoute les épinards et remue jusqu’à ce qu’ils fondent.', min: 2 },
            { t: 'Sale, poivre et ajoute un filet de citron juste avant de servir.' }
          ]
        },
        {
          id: 'galettes-pc', titre: 'Galettes pois chiches-feta', temps: 25, niveau: 'Moyen',
          emojis: ['🫘', '🧀', '🥬'],
          utilise: [{ ref: 'poischiches', g: 0, qte: '1 boîte' }, { ref: 'feta', g: 100 }, { ref: 'epinards', g: 100, qte: '2 poignées' }],
          placard: ['huile', 'sel', 'poivre'], manque: ['oeufs'],
          vege: true, vegan: false, halal: true, allergenes: ['oeufs', 'lactose'],
          etapes: [
            { t: 'Écrase les pois chiches, hache les épinards et émiette la feta.' },
            { t: 'Mélange avec 1 œuf, sale peu (la feta l’est déjà) et poivre.' },
            { t: 'Forme des galettes et dore-les à la poêle, 3 min de chaque côté.', min: 6 }
          ]
        }
      ]
    },
    {
      id: 'vide',
      nom: 'Frigo (presque) vide',
      court: 'presque vide',
      illu: IMG + 'frigos/frigo-vide.svg',
      accroche: 'Fin de mois difficile',
      vide: true,
      blague: 'Ton frigo est plus vide que mon compte en fin de mois. Voici 3 recettes de placard !',
      messages: ['J’ouvre la porte…', 'Il y a de l’écho ici… 🕸️', 'Ah si, du beurre ! 🧈', 'Un citron solitaire 🍋', 'J’improvise avec ton placard…'],
      ingredients: [
        { id: 'beurre', nom: 'beurre', emoji: '🧈', qte: '1 plaquette', urgence: 'basse', g: 50, frais: true },
        { id: 'citron', nom: 'citron', emoji: '🍋', qte: '1', urgence: 'moyenne', raison: 'tout seul depuis 2 semaines', g: 100, frais: true },
        { id: 'moutarde', nom: 'moutarde', emoji: '🟡', qte: '1 pot', urgence: 'basse', g: 0, frais: false }
      ],
      recettes: [
        {
          id: 'pates-citron', titre: 'Pâtes beurre-citron', temps: 15, niveau: 'Facile',
          img: IMG + 'recettes/placard-pates-beurre-citron.svg',
          utilise: [{ ref: 'beurre', g: 30, qte: '1 noix' }, { ref: 'citron', g: 50, qte: '½' }],
          placard: ['pâtes', 'sel', 'poivre'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['gluten', 'lactose'],
          etapes: [
            { t: 'Fais cuire 100 g de pâtes dans l’eau salée.', min: 10 },
            { t: 'Égoutte en gardant un fond d’eau de cuisson.' },
            { t: 'Ajoute le beurre, le zeste et le jus d’un demi-citron, poivre et mélange vivement.' }
          ]
        },
        {
          id: 'riz-moutarde', titre: 'Riz crémeux à la moutarde', temps: 20, niveau: 'Facile',
          img: IMG + 'recettes/placard-riz-moutarde.svg',
          utilise: [{ ref: 'moutarde', g: 0, qte: '1 c. à soupe' }, { ref: 'beurre', g: 20, qte: '1 noix' }, { ref: 'citron', g: 20, qte: '1 filet' }],
          placard: ['riz', 'sel', 'eau'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['lactose'],
          etapes: [
            { t: 'Fais cuire 80 g de riz dans l’eau salée.', min: 12 },
            { t: 'Égoutte, puis ajoute le beurre et la moutarde hors du feu.' },
            { t: 'Un filet de citron pour réveiller le tout, et c’est prêt.' }
          ]
        },
        {
          id: 'tartines', titre: 'Tartines beurre-citron grillées', temps: 5, niveau: 'Facile',
          img: IMG + 'recettes/placard-tartines-beurre-citron.svg',
          utilise: [{ ref: 'beurre', g: 20, qte: '1 noix' }, { ref: 'citron', g: 30, qte: '1 zeste' }],
          placard: ['pain de mie', 'sel'], manque: [],
          vege: true, vegan: false, halal: true, allergenes: ['gluten', 'lactose'],
          etapes: [
            { t: 'Fais griller 2 tranches de pain de mie.', min: 3 },
            { t: 'Beurre-les encore chaudes et râpe un peu de zeste de citron dessus, avec une pincée de sel.' }
          ]
        }
      ]
    }
  ];

  /* Ingrédients qu'on peut ajouter à la main (correction de l'IA, écran E5).
     Ajouter « farine » rend les galettes faisables à 100 % : effet démo garanti. */
  const SUGGESTIONS = [
    { id: 'farine', nom: 'farine', emoji: '🌾', g: 0, frais: false },
    { id: 'ail', nom: 'ail', emoji: '🧄', g: 0, frais: false },
    { id: 'curry', nom: 'curry en poudre', emoji: '🍛', g: 0, frais: false },
    { id: 'oeufs', nom: 'œufs', emoji: '🥚', g: 200, frais: true },
    { id: 'lait', nom: 'lait', emoji: '🥛', g: 250, frais: true },
    { id: 'tomates', nom: 'tomates', emoji: '🍅', g: 300, frais: true },
    { id: 'pain', nom: 'pain', emoji: '🥖', g: 150, frais: true },
    { id: 'fromage', nom: 'fromage', emoji: '🧀', g: 100, frais: true },
    { id: 'pommes', nom: 'pommes', emoji: '🍎', g: 300, frais: true },
    { id: 'salade', nom: 'salade', emoji: '🥗', g: 150, frais: true }
  ];

  /* Facteurs d'impact (01-analyse.md, 7.4) */
  const IMPACT = { eurParKg: 4, co2ParKg: 2.5 };

  /* Historique fictif d'Inès (≈ 4 semaines), en jours avant aujourd'hui.
     Fenêtres de 7 jours : S1 0,5 kg · S2 0,65 · S3 0,8 · cette semaine 0,6 (+ 0,65 ce soir = 1,25).
     Total 2,55 kg et 11 repas ; après le riz sauté de la démo : 3,2 kg, 12 repas, série de 4 jours. */
  const HISTORIQUE = [
    { j: 1, titre: 'Shakshuka express', g: 200 },
    { j: 2, titre: 'Salade carottes-feta-citron', g: 250 },
    { j: 3, titre: 'Houmous minute sans tahini', g: 150 },
    { j: 8, titre: 'Pâtes crémeuses jambon-poivron', g: 300 },
    { j: 10, titre: 'Omelette courgette-fromage', g: 250 },
    { j: 12, titre: 'Curry pois chiches-épinards', g: 250 },
    { j: 15, titre: 'Pâtes beurre-citron', g: 250 },
    { j: 17, titre: 'Shakshuka express', g: 200 },
    { j: 19, titre: 'Salade de pâtes tomate-yaourt', g: 200 },
    { j: 22, titre: 'Riz sauté aux œufs et courgette', g: 250 },
    { j: 26, titre: 'Poivrons et tomates rôtis, sauce yaourt', g: 250 }
  ];

  /* Flashs et favoris préenregistrés pour que l'accueil ne soit pas vide */
  const FLASHS_INITIAUX = [
    { frigo: 'vege', j: 6 },
    { frigo: 'dimanche', j: 3 }
  ];
  const FAVORIS_INITIAUX = [
    { frigo: 'dimanche', recette: 'shakshuka' },
    { frigo: 'vege', recette: 'salade-carottes' }
  ];

  window.FF_DATA = { FRIGOS, SUGGESTIONS, IMPACT, HISTORIQUE, FLASHS_INITIAUX, FAVORIS_INITIAUX };
})();
