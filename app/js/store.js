/* =====================================================================
   FrigoFlash : état (localStorage), moteur de recettes et calcul d'impact
   Aucune dépendance. Expose window.FF.store, FF.engine, FF.impact, FF.fmt
   ===================================================================== */
(function () {
  const D = window.FF_DATA;
  const KEY = 'frigoflash.v1';
  const DAY = 86400000;
  const FF = (window.FF = window.FF || {});

  /* ---------- Utilitaires de date ---------- */
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }
  function daysAgo(n, h, m) { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h || 19, m || 0, 0, 0); return d.toISOString(); }
  function dayIndex(iso) { return Math.round((startOfDay(Date.now()) - startOfDay(iso)) / DAY); }
  const uid = () => Math.random().toString(36).slice(2, 9);

  /* ---------- État ---------- */
  function defaultState() {
    return {
      v: 1,
      onboarded: false,
      prenom: 'Inès',
      regime: 'aucun',          // aucun | vege | vegan | halal
      allergies: [],            // gluten | lactose | oeufs
      favoris: D.FAVORIS_INITIAUX.map(f => ({ ...f })),
      flashs: D.FLASHS_INITIAUX.map(f => ({ id: uid(), frigo: f.frigo, date: daysAgo(f.j, 19, 12), removed: [], added: [], cooked: [] })),
      cuisines: D.HISTORIQUE.map(h => ({ date: daysAgo(h.j, 20, 5), titre: h.titre, g: h.g }))
    };
  }

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : null;
    } catch (e) { state = null; }
    if (!state || state.v !== 1) state = defaultState();
    return state;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* mode privé : l'app marche quand même */ } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} state = defaultState(); save(); return state; }

  FF.store = {
    get state() { return state; },
    load, save, reset, uid,
    frigo: id => D.FRIGOS.find(f => f.id === id),
    flash: id => state.flashs.find(f => f.id === id),
    lastFlash: () => state.flashs[state.flashs.length - 1],
    newFlash(frigoId, photo) {
      const f = { id: uid(), frigo: frigoId, date: new Date().toISOString(), removed: [], added: [], cooked: [], photo: !!photo };
      state.flashs.push(f);
      state.flashs = state.flashs.slice(-10);
      save();
      return f;
    },
    isFav: (frigo, recette) => state.favoris.some(f => f.frigo === frigo && f.recette === recette),
    toggleFav(frigo, recette) {
      const i = state.favoris.findIndex(f => f.frigo === frigo && f.recette === recette);
      if (i >= 0) state.favoris.splice(i, 1); else state.favoris.unshift({ frigo, recette });
      save();
      return i < 0;
    },
    cook(entry) { state.cuisines.push({ date: new Date().toISOString(), ...entry }); save(); }
  };

  /* ---------- Moteur de recettes (simule la réponse de l'IA) ---------- */
  function suggestion(id) { return D.SUGGESTIONS.find(s => s.id === id); }

  /* Ingrédients de la session : ceux du frigo + ceux ajoutés à la main */
  function ingredients(flash) {
    const fr = FF.store.frigo(flash.frigo);
    const base = fr.ingredients.map(i => ({ ...i, removed: flash.removed.includes(i.id) }));
    const added = flash.added.map(a => ({ urgence: 'basse', g: 0, frais: false, ...a, added: true, removed: false }));
    return base.concat(added);
  }
  function available(flash) {
    const m = new Map();
    ingredients(flash).forEach(i => { if (!i.removed) m.set(i.id, i); });
    return m;
  }

  function evaluate(flash, r) {
    const fr = FF.store.frigo(flash.frigo);
    const have = available(flash);
    const present = [], manque = [];
    r.utilise.forEach(u => {
      const ing = fr.ingredients.find(i => i.id === u.ref);
      if (have.has(u.ref)) present.push({ ...ing, used: u.g, qteRecette: u.qte || ing.qte });
      else manque.push({ id: u.ref, nom: ing.nom, emoji: ing.emoji, retire: true });
    });
    r.manque.forEach(id => {
      const s = suggestion(id);
      if (have.has(id)) present.push({ ...have.get(id), used: 0, qteRecette: '', ajoute: true });
      else manque.push({ id, nom: s.nom, emoji: s.emoji });
    });
    const sauves = present.filter(p => p.frais && p.used > 0 && !p.ajoute);
    const savedG = sauves.reduce((s, p) => s + p.used, 0);
    return {
      recette: r,
      present, manque,
      placard: r.placard,
      savedG,
      savedN: sauves.length,
      urgents: present.filter(p => p.urgence === 'haute'),
      full: manque.length === 0,
      degraded: manque.length > r.manque.length   // un ingrédient prévu a été retiré
    };
  }

  function compatible(r, prefs) {
    if (prefs.regime === 'vege' && !r.vege) return false;
    if (prefs.regime === 'vegan' && !r.vegan) return false;
    if (prefs.regime === 'halal' && !r.halal) return false;
    return !(prefs.allergies || []).some(a => r.allergenes.includes(a));
  }

  /* Classement : recettes compatibles, 1 ingrédient manquant au maximum,
     ordre de pertinence anti-gaspi prévu par l'« IA », recettes dégradées par une correction en dernier */
  function rank(flash, prefs) {
    const fr = FF.store.frigo(flash.frigo);
    return fr.recettes
      .filter(r => compatible(r, prefs))
      .map((r, i) => ({ ...evaluate(flash, r), i }))
      .filter(e => e.manque.length <= 1)
      .sort((a, b) => (a.degraded - b.degraded) || (a.i - b.i));
  }

  FF.engine = { ingredients, available, evaluate, rank, compatible, suggestion };

  /* ---------- Impact (méthode : 01-analyse.md, 7.4) ---------- */
  FF.impact = {
    compute() {
      const c = state.cuisines.map(x => ({ ...x, d: dayIndex(x.date) })).filter(x => x.d >= 0);
      const last28 = c.filter(x => x.d < 28);
      const g = last28.reduce((s, x) => s + x.g, 0);
      const weeks = [3, 2, 1, 0].map(w => c.filter(x => x.d >= w * 7 && x.d < w * 7 + 7).reduce((s, x) => s + x.g, 0) / 1000);
      const days = new Set(c.map(x => x.d));
      let streak = 0, d = days.has(0) ? 0 : 1;
      while (days.has(d)) { streak++; d++; }
      const week = [];
      for (let i = 6; i >= 0; i--) {
        const dt = new Date(Date.now() - i * DAY);
        week.push({ label: 'DLMMJVS'[dt.getDay()], done: days.has(i), today: i === 0 });
      }
      const kg = g / 1000;
      return {
        kg,
        eur: kg * D.IMPACT.eurParKg,
        co2: kg * D.IMPACT.co2ParKg,
        meals: last28.length,
        todayG: c.filter(x => x.d === 0).reduce((s, x) => s + x.g, 0),
        allTimeKg: c.reduce((s, x) => s + x.g, 0) / 1000,
        weeks, streak, week
      };
    },
    euros: g => g / 1000 * D.IMPACT.eurParKg,
    co2: g => g / 1000 * D.IMPACT.co2ParKg
  };

  /* ---------- Formats français ---------- */
  const nf = (min, max) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: min, maximumFractionDigits: max });
  const f1 = nf(1, 1), f2 = nf(2, 2), f0 = nf(0, 0), fx = nf(0, 2);
  FF.fmt = {
    kg: n => f1.format(n),
    eur: n => f2.format(n),
    int: n => f0.format(n),
    num: n => fx.format(n),
    g: g => g < 1000 ? f0.format(g) + ' g' : f1.format(g / 1000) + ' kg'
  };
})();
