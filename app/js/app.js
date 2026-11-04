/* =====================================================================
   FrigoFlash : interface (navigation, écrans E0 → E9, feuilles, animations)
   JavaScript pur, aucune dépendance, marche en ouvrant index.html (file://).
   ===================================================================== */
(function () {
  'use strict';
  const D = window.FF_DATA, FF = window.FF, S = FF.store, E = FF.engine, I = FF.impact, F = FF.fmt;
  const $ = (s, r) => (r || document).querySelector(s);
  const phone = $('#phone'), screensEl = $('#screens'), tabbar = $('#tabbar'), statusbar = $('#statusbar');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ic = (n, size, stroke) => window.FFIcons.svg(n, { size: size || 24, stroke: stroke || 2 });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, reduced.matches ? Math.min(ms, 60) : ms));
  FF.photos = {};          // photos importées : gardées en mémoire seulement, jamais envoyées ni stockées

  const REGIMES = [['aucun', 'Aucun'], ['vege', 'Végé'], ['vegan', 'Vegan'], ['halal', 'Halal']];
  const ALLERGIES = [['gluten', 'Gluten'], ['lactose', 'Lactose'], ['oeufs', 'Œufs']];
  const regLabel = id => (REGIMES.find(r => r[0] === id) || REGIMES[0])[1];
  const allLabel = list => list.length ? list.map(a => ALLERGIES.find(x => x[0] === a)[1].toLowerCase()).join(', ') : 'aucune';

  /* =================================================================
     Navigation : une pile d'écrans, transitions avec Web Animations
     ================================================================= */
  let stack = [];
  let current = null;   // { name, params, el, restore, timers: [] }

  function show(name, params, dir, restore) {
    params = params || {};
    const def = SCREENS[name];
    const old = current && current.el;
    if (current) leave(current);
    const el = document.createElement('section');
    el.className = 'screen ff-screen' + (def.tab ? '' : ' no-tab') + (def.cls ? ' ' + def.cls : '');
    const ctx = { name, params, el, restore: !!restore, timers: [] };
    current = ctx;
    el.innerHTML = def.render(params, ctx);
    screensEl.appendChild(el);
    if (def.mount) def.mount(el, params, ctx);

    // habillage : onglets, barre d'état
    tabbar.classList.toggle('is-hidden', !def.tab);
    tabbar.querySelectorAll('.ff-tab').forEach(t => {
      if (t.dataset.tab === def.tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    statusbar.classList.toggle('is-clear', def.sb === 'clear' || def.sb === 'light');
    statusbar.classList.toggle('is-light', def.sb === 'light');

    if (restore && restore.scroll) el.scrollTop = restore.scroll;
    animate(el, old, dir || 'fade');
    if (dir !== 'none') {
      const h = el.querySelector('h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }
  function leave(ctx) {
    ctx.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    const def = SCREENS[ctx.name];
    if (def.leave) def.leave(ctx);
  }
  function animate(el, old, dir) {
    if (!old) return;
    old.classList.add('is-leaving');
    const done = () => old.remove();
    if (reduced.matches || dir === 'none' || !el.animate) return done();
    const o = { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' };
    if (dir === 'forward') {
      el.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], o);
      old.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-30%)', opacity: 0.4 }], Object.assign({ fill: 'forwards' }, o)).onfinish = done;
    } else if (dir === 'back') {
      old.style.zIndex = 2;
      el.animate([{ transform: 'translateX(-30%)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], o);
      old.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], Object.assign({ fill: 'forwards' }, o)).onfinish = done;
    } else if (dir === 'up') {
      el.animate([{ transform: 'translateY(48px)', opacity: 0 }, { transform: 'none', opacity: 1 }], Object.assign({}, o, { duration: 460 }));
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = done;
    } else {
      el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: o.easing });
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = done;
    }
  }
  function go(name, params) {
    if (current) stack.push({ name: current.name, params: current.params, scroll: current.el.scrollTop });
    show(name, params, 'forward');
  }
  function back() {
    const prev = stack.pop();
    if (!prev) return tab('home');
    show(prev.name, prev.params, 'back', prev);
  }
  function tab(name) {
    stack = [];
    if (current && current.name === name) { current.el.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }); return; }
    show(name, {}, 'fade');
  }
  function rerender(params) {
    if (!current) return;
    show(current.name, params || current.params, 'none', { scroll: current.el.scrollTop });
  }
  FF.nav = { go, back, tab, show };

  /* =================================================================
     Petits composants partagés
     ================================================================= */
  function visual(r, k) {
    return r.img
      ? `<img src="${r.img}" alt="">`
      : `<div class="emoji-visual v${(k || 0) % 3}" aria-hidden="true">${r.emojis.join('')}</div>`;
  }
  function metas(r) {
    return `<div class="ff-recipe__metas"><span class="ff-meta">${ic('clock', 16)}${r.temps}&nbsp;min</span><span class="ff-meta">${ic('chef-hat', 16)}${r.niveau}</span></div>`;
  }
  function pills(ev, compact) {
    const save = ev.savedN > 0
      ? `<span class="ff-pill ff-pill--save">${ic('leaf', 14, 2.4)}Sauve ${ev.savedN}${compact ? '' : ` aliment${ev.savedN > 1 ? 's' : ''} · ${F.g(ev.savedG)}`}</span>`
      : `<span class="ff-pill ff-pill--save">${ic('leaf', 14, 2.4)}Placard</span>`;
    const st = ev.full
      ? `<span class="ff-pill ff-pill--full">${ic('check', 14, 3)}100&nbsp;%${compact ? '' : ' ton frigo'}</span>`
      : `<span class="ff-pill ff-pill--missing">${ic('shopping-basket', 14)}Manque&nbsp;: ${esc(ev.manque[0].nom)}</span>`;
    return `<div class="ff-recipe__pills">${save}${st}</div>`;
  }
  function favBtn(frigo, r, size) {
    const on = S.isFav(frigo, r.id);
    return `<button class="ff-recipe__fav" type="button" data-action="fav" data-frigo="${frigo}" data-recette="${r.id}" aria-pressed="${on}" aria-label="Favori : ${esc(r.titre)}">${ic('heart', size || 20)}</button>`;
  }
  function frigoName(flash) { return flash.photo ? 'Ta photo' : S.frigo(flash.frigo).nom; }
  function segRegime(sel) {
    return `<div class="ff-segment" role="group" aria-label="Régime">${REGIMES.map(([id, l]) => `<button type="button" data-reg="${id}" aria-pressed="${sel === id}">${l}</button>`).join('')}</div>`;
  }
  function segAllergies(list) {
    return `<div class="ff-segment" role="group" aria-label="Allergies">${ALLERGIES.map(([id, l]) => `<button type="button" data-all="${id}" aria-pressed="${list.includes(id)}">${l}</button>`).join('')}</div>`;
  }
  function bindSegments(root) {
    root.querySelectorAll('[data-reg]').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('[data-reg]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    root.querySelectorAll('[data-all]').forEach(b => b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    }));
  }
  function readSegments(root) {
    const reg = root.querySelector('[data-reg][aria-pressed="true"]');
    return {
      regime: reg ? reg.dataset.reg : 'aucun',
      allergies: [...root.querySelectorAll('[data-all][aria-pressed="true"]')].map(b => b.dataset.all)
    };
  }
  function relDay(iso) {
    const d = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
    if (d <= 0) return 'Aujourd’hui';
    if (d === 1) return 'Hier';
    return `Il y a ${d} jours`;
  }
  function resolveRecipe(p) {
    const flash = (p.flash && S.flash(p.flash)) || { frigo: p.frigo, removed: [], added: [], cooked: [], virtual: true };
    const fr = S.frigo(flash.frigo);
    const r = fr.recettes.find(x => x.id === p.recette);
    return { flash, fr, r, ev: E.evaluate(flash, r) };
  }

  /* ---------- Toasts, confettis, compteurs ---------- */
  function toast(html, iconName) {
    const t = document.createElement('div');
    t.className = 'ff-toast';
    t.innerHTML = ic(iconName || 'sparkles', 20, 2.4) + '<span>' + html + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 260); }, 2200);
  }
  function confetti() {
    if (reduced.matches) return;
    const c = document.createElement('div');
    c.className = 'confetti';
    const cols = ['var(--ff-flash-400)', 'var(--ff-menthe-400)', 'var(--ff-corail-400)', 'var(--ff-encre-900)'];
    for (let i = 0; i < 64; i++) {
      const p = document.createElement('i');
      if (i % 3 === 0) p.className = 'round';
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = cols[i % 4];
      p.style.setProperty('--x', (Math.random() * 180 - 90) + 'px');
      p.style.setProperty('--y', (520 + Math.random() * 380) + 'px');
      p.style.setProperty('--r', (Math.random() * 1000 - 500) + 'deg');
      p.style.setProperty('--delay', (Math.random() * 0.3) + 's');
      p.style.setProperty('--d', (1.1 + Math.random() * 0.7) + 's');
      c.appendChild(p);
    }
    phone.appendChild(c);
    setTimeout(() => c.remove(), 2400);
  }
  function countUp(el, from, to, fmt, dur) {
    if (reduced.matches || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), d = dur || 900;
    const step = now => {
      const k = Math.min(1, (now - t0) / d);
      el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = fmt(from);
    requestAnimationFrame(step);
  }
  function beep() {
    try {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      const a = new A(), o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination); o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, a.currentTime);
      [0, 0.25, 0.5].forEach(t => { g.gain.exponentialRampToValueAtTime(0.25, a.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + 0.18); });
      o.start(); o.stop(a.currentTime + 0.75);
    } catch (e) { /* pas de son, pas grave */ }
  }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  /* =================================================================
     Feuilles du bas (E3 et réglages)
     ================================================================= */
  let sheet = null;
  function openSheet(html, opts) {
    opts = opts || {};
    closeSheet(true);
    const bd = document.createElement('div');
    bd.className = 'ff-sheet-backdrop';
    const sh = document.createElement('div');
    sh.className = 'ff-sheet';
    sh.setAttribute('role', 'dialog');
    sh.setAttribute('aria-modal', 'true');
    sh.setAttribute('aria-label', opts.label || '');
    sh.innerHTML = '<div class="ff-sheet__grip"></div>' + html;
    phone.append(bd, sh);
    sheet = { bd, sh, prev: document.activeElement };
    bd.addEventListener('click', () => closeSheet());
    sh.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
    if (opts.mount) opts.mount(sh);
    setTimeout(() => {
      const f = sh.querySelector('[autofocus]') || sh.querySelector('button:not([data-close]), input, [href]');
      if (f) f.focus({ preventScroll: true });
    }, 60);
    return sh;
  }
  function closeSheet(instant) {
    if (!sheet) return;
    const { bd, sh, prev } = sheet;
    sheet = null;
    if (instant || reduced.matches) { bd.remove(); sh.remove(); }
    else {
      bd.classList.add('is-closing'); sh.classList.add('is-closing');
      setTimeout(() => { bd.remove(); sh.remove(); }, 240);
    }
    if (prev && document.contains(prev) && !instant) prev.focus({ preventScroll: true });
  }
  const sheetHead = (title, id) => `<div class="sheet-head"><h2 class="ff-h2" id="${id || ''}">${title}</h2><button class="ff-icon-btn" type="button" data-close aria-label="Fermer">${ic('x')}</button></div>`;

  /* E3 : choisir un frigo */
  function openFrigoSheet() {
    const cards = D.FRIGOS.map(f => `
      <button class="frigo-card" type="button" data-frigo="${f.id}">
        <img src="${f.illu}" alt="">
        <b>${f.nom}</b>
        <span class="ff-meta">${f.vide ? '3 ingrédients…' : f.ingredients.length + ' ingrédients'}</span>
      </button>`).join('');
    openSheet(`
      ${sheetHead('Quel frigo on flashe&nbsp;?')}
      <p class="sheet-sub">Choisis un frigo de démo ou prends ta propre photo.</p>
      <div class="frigo-grid">${cards}</div>
      <div class="or">ou</div>
      <label class="ff-btn ff-btn--dark ff-btn--lg ff-btn--block import-btn">
        ${ic('camera', 22)}Prendre ou importer une photo
        <input class="sr-only" type="file" accept="image/*" capture="environment">
      </label>
      <p class="demo-note">${ic('info', 16)}<span>Mode démo : ta photo reste sur ton téléphone. L’analyse est simulée et renvoie le frigo étudiant.</span></p>`,
    {
      label: 'Choisir un frigo',
      mount(sh) {
        sh.querySelectorAll('[data-frigo]').forEach(b => b.addEventListener('click', () => startFlash(b.dataset.frigo)));
        const input = sh.querySelector('input[type=file]');
        input.addEventListener('change', () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const rd = new FileReader();
          rd.onload = () => startFlash('etudiant', rd.result);
          rd.readAsDataURL(file);
        });
      }
    });
  }
  function startFlash(frigoId, photo) {
    closeSheet(true);
    const f = S.newFlash(frigoId, photo);
    if (photo) FF.photos[f.id] = photo;
    stack = [{ name: 'home', params: {}, scroll: 0 }];
    show('scan', { flash: f.id }, 'up');
  }

  function openPrefsSheet() {
    const st = S.state;
    openSheet(`
      ${sheetHead('Tes préférences')}
      <p class="sheet-sub">Je ne te propose que des recettes compatibles. C’est gratuit, pour toujours.</p>
      <div class="prefs">
        <div><p class="ff-overline">Régime</p>${segRegime(st.regime)}</div>
        <div><p class="ff-overline">Allergies et intolérances</p>${segAllergies(st.allergies)}</div>
      </div>
      <button class="ff-btn ff-btn--lg ff-btn--block" type="button" data-save>Enregistrer</button>`,
    {
      label: 'Préférences',
      mount(sh) {
        bindSegments(sh);
        sh.querySelector('[data-save]').addEventListener('click', () => {
          Object.assign(S.state, readSegments(sh));
          S.save();
          closeSheet();
          toast('Préférences enregistrées', 'check');
          if (current && (current.name === 'recettes' || current.name === 'impact')) rerender(Object.assign({}, current.params, { offset: 0 }));
        });
      }
    });
  }

  function openNameSheet() {
    openSheet(`
      ${sheetHead('Ton prénom')}
      <form class="add-form" style="margin:8px 0 4px">
        <input class="ff-input" id="name-input" value="${esc(S.state.prenom)}" maxlength="20" autocomplete="given-name" aria-label="Ton prénom" autofocus>
        <button class="ff-btn" type="submit">OK</button>
      </form>`,
    {
      label: 'Prénom',
      mount(sh) {
        sh.querySelector('form').addEventListener('submit', e => {
          e.preventDefault();
          const v = sh.querySelector('input').value.trim();
          S.state.prenom = v || 'Inès';
          S.save(); closeSheet(); rerender();
        });
      }
    });
  }

  function openResetSheet() {
    openSheet(`
      ${sheetHead('Réinitialiser la démo&nbsp;?')}
      <p class="sheet-sub" style="font-size:16px">Tout revient comme au premier lancement : introduction, historique d’Inès, favoris. Pratique avant de présenter.</p>
      <div class="stack">
        <button class="ff-btn ff-btn--dark ff-btn--lg ff-btn--block" type="button" data-reset>${ic('rotate-ccw', 20)}Oui, réinitialiser</button>
        <button class="ff-btn ff-btn--ghost ff-btn--block" type="button" data-close>Annuler</button>
      </div>`,
    { label: 'Réinitialiser la démo', mount(sh) { sh.querySelector('[data-reset]').addEventListener('click', resetDemo); } });
  }
  function resetDemo() {
    closeSheet(true);
    S.reset();
    FF.photos = {};
    stack = [];
    if (current) leave(current);
    current = null;
    screensEl.innerHTML = '';
    tabbar.classList.add('is-hidden');
    splash(() => show('onboarding', {}, 'fade'));
  }

  /* Ajout d'un ingrédient (correction de l'IA, E5) */
  function openAddSheet(flash, onDone) {
    const have = new Set(E.ingredients(flash).filter(i => !i.removed).map(i => i.id));
    const sug = D.SUGGESTIONS.filter(s => !have.has(s.id));
    openSheet(`
      ${sheetHead('Ajouter un ingrédient')}
      <p class="sheet-sub">J’ai raté quelque chose&nbsp;? Ajoute-le, je recalcule les recettes.</p>
      <form class="add-form">
        <input class="ff-input" placeholder="Ex. : farine" maxlength="24" autocomplete="off" aria-label="Nom de l’ingrédient">
        <button class="ff-btn" type="submit">Ajouter</button>
      </form>
      <div class="add-suggest"><p class="ff-overline" style="margin-bottom:8px">Suggestions</p>
        <div class="ff-chips">${sug.map(s => `<button type="button" class="ff-chip" data-sug="${s.id}"><span class="ff-chip__emoji" aria-hidden="true">${s.emoji}</span>${esc(s.nom)}${ic('plus', 16, 2.4)}</button>`).join('')}</div>
      </div>`,
    {
      label: 'Ajouter un ingrédient',
      mount(sh) {
        const add = item => {
          if (flash.removed.includes(item.id)) flash.removed = flash.removed.filter(x => x !== item.id);
          else if (!E.ingredients(flash).some(i => i.id === item.id)) flash.added.push(item);
          S.save(); closeSheet(); onDone();
          toast(`${item.emoji} ${esc(item.nom)} ajouté`, 'plus');
        };
        sh.querySelectorAll('[data-sug]').forEach(b => b.addEventListener('click', () => {
          const s = E.suggestion(b.dataset.sug);
          add({ id: s.id, nom: s.nom, emoji: s.emoji, g: s.g, frais: s.frais });
        }));
        sh.querySelector('form').addEventListener('submit', e => {
          e.preventDefault();
          const v = sh.querySelector('input').value.trim();
          if (!v) return;
          const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe');
          const s = D.SUGGESTIONS.find(x => norm(x.nom) === norm(v) || norm(x.nom).startsWith(norm(v)));
          add(s ? { id: s.id, nom: s.nom, emoji: s.emoji, g: s.g, frais: s.frais }
            : { id: 'c-' + norm(v).replace(/[^a-z0-9]+/g, '-'), nom: v, emoji: '🧺', g: 0, frais: false });
        });
      }
    });
  }

  /* Célébration après « J'ai cuisiné ça ! » */
  function cook(p) {
    const { flash, fr, r, ev } = resolveRecipe(p);
    if (!flash.virtual && flash.cooked.includes(r.id)) return;
    FF.prevImpact = I.compute();
    S.cook({ titre: r.titre, g: ev.savedG, frigo: fr.id, recette: r.id });
    if (!flash.virtual) { flash.cooked.push(r.id); S.save(); }
    const im = I.compute();
    confetti();
    buzz([30, 40, 60]);
    if (current && current.name === 'recette') rerender();
    const g = ev.savedG;
    const stats = g > 0
      ? `<div><b>≈ ${F.eur(I.euros(g))}&nbsp;€</b><span>de nourriture</span></div><div><b>${F.kg(I.co2(g))}&nbsp;kg</b><span>CO₂e évités</span></div>`
      : `<div><b>${im.meals}</b><span>repas ce mois</span></div><div><b>0&nbsp;€</b><span>de courses</span></div>`;
    openSheet(`
      <div class="celebrate">
        <div class="celebrate__medal">${ic('sparkles', 40, 2.4)}</div>
        <h2 class="ff-h1">Bien joué&nbsp;!</h2>
        <p>${g > 0 ? `<span class="big-g">${F.g(g)}</span> sauvés de la poubelle 🎉` : 'Un repas maison de plus, zéro gâchis 🎉'}</p>
        <div class="celebrate__stats">${stats}<div><b>${im.streak}&nbsp;j&nbsp;🔥</b><span>de série</span></div></div>
        <div class="celebrate__actions">
          <button class="ff-btn ff-btn--lg ff-btn--block" type="button" data-impact>Voir mon impact${ic('arrow-right', 20)}</button>
          <button class="ff-btn ff-btn--ghost ff-btn--block" type="button" data-close>Rester sur la recette</button>
        </div>
      </div>`,
    {
      label: 'Bien joué',
      mount(sh) { sh.querySelector('[data-impact]').addEventListener('click', () => { closeSheet(true); tab('impact'); }); }
    });
  }

  /* =================================================================
     Actions déclenchées par data-action (délégation sur le téléphone)
     ================================================================= */
  const ACTIONS = {
    back: () => back(),
    tab: a => { closeSheet(true); tab(a.dataset.tab); },
    flash: a => {
      if (a.classList.contains('ff-flash')) {
        a.classList.remove('is-flashing'); void a.offsetWidth; a.classList.add('is-flashing');
        buzz(15);
        setTimeout(openFrigoSheet, reduced.matches ? 0 : 280);
      } else openFrigoSheet();
    },
    'open-recipe': a => go('recette', { flash: a.dataset.flash || null, frigo: a.dataset.frigo, recette: a.dataset.recette }),
    reopen: a => go('recettes', { flash: a.dataset.flash }),
    fav: a => {
      const on = S.toggleFav(a.dataset.frigo, a.dataset.recette);
      phone.querySelectorAll(`[data-action="fav"][data-frigo="${a.dataset.frigo}"][data-recette="${a.dataset.recette}"]`)
        .forEach(b => b.setAttribute('aria-pressed', String(on)));
      if (on && a.animate && !reduced.matches) a.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      toast(on ? 'Ajouté à tes favoris' : 'Retiré de tes favoris', 'heart');
    },
    prefs: () => openPrefsSheet(),
    name: () => openNameSheet(),
    reset: () => openResetSheet(),
    intro: () => show('onboarding', { again: true }, 'up')
  };
  phone.addEventListener('click', e => {
    const a = e.target.closest('[data-action]');
    if (!a || !phone.contains(a)) return;
    const fn = ACTIONS[a.dataset.action];
    if (fn) { e.preventDefault(); fn(a, e); }
  });

  /* =================================================================
     Écrans
     ================================================================= */
  const SCREENS = {};

  /* ---------- E1 Onboarding ---------- */
  SCREENS.onboarding = {
    render(p) {
      const st = S.state, im = I.compute();
      return `
      <div class="onb">
        <div class="onb__top">
          <img src="assets/logo/logo-horizontal.svg" alt="FrigoFlash" style="height:30px;width:auto">
          <button class="ff-btn ff-btn--ghost" type="button" data-onb="skip">Passer</button>
        </div>
        <div class="onb__viewport">
          <div class="onb__track">
            <div class="onb__slide" aria-roledescription="diapositive">
              <div class="onb__art onb__art--1">
                <img src="assets/illustrations/frigos/frigo-etudiant.svg" alt="">
                <span class="onb__badge">${ic('camera', 30, 2.4)}</span>
              </div>
              <div class="onb__text"><h1 class="ff-h1">Photographie <span class="ff-mark">ton frigo</span></h1>
                <p>Pas besoin de taper tes ingrédients un par un&nbsp;: une photo suffit, l’IA reconnaît tout.</p></div>
            </div>
            <div class="onb__slide" aria-roledescription="diapositive">
              <div class="onb__art onb__art--2"><div class="onb__plates">
                <img src="assets/illustrations/recettes/shakshuka-express.svg" alt="">
                <img src="assets/illustrations/recettes/riz-saute-oeufs-courgette.svg" alt="">
                <img src="assets/illustrations/recettes/salade-carottes-feta-citron.svg" alt="">
              </div></div>
              <div class="onb__text"><h2 class="ff-h1">L’IA trouve <span class="ff-mark">3 recettes</span></h2>
                <p>Faisables tout de suite, en priorité avec ce qui risque de finir à la poubelle.</p></div>
            </div>
            <div class="onb__slide" aria-roledescription="diapositive">
              <div class="onb__art onb__art--3"><div class="onb__impact">
                <span class="ff-overline" style="color:var(--text-on-ink);opacity:.7">Ton compteur</span>
                <div class="big">${F.kg(im.kg)}<small>&nbsp;kg</small></div>
                <div class="row"><span class="ff-pill">${ic('euro', 14, 2.4)}${F.eur(im.eur)}&nbsp;€</span><span class="ff-pill">${ic('cloud', 14, 2.4)}${F.kg(im.co2)}&nbsp;kg CO₂e</span><span class="ff-pill">${ic('flame', 14, 2.4)}${im.streak}&nbsp;jour${im.streak > 1 ? 's' : ''}</span></div>
              </div></div>
              <div class="onb__text"><h2 class="ff-h1">Sauve ta bouffe, ton budget, <span class="ff-mark">la planète</span></h2>
                <p>Chaque recette cuisinée fait grimper ton compteur&nbsp;: kilos, euros et CO₂ évités.</p></div>
            </div>
            <div class="onb__slide" aria-roledescription="diapositive">
              <div class="onb__setup">
                <div class="onb__text"><h2 class="ff-h1">On fait <span class="ff-mark">connaissance</span></h2>
                  <p>Pour des recettes que tu peux vraiment manger.</p></div>
                <div class="ff-field"><label for="onb-name">Ton prénom</label>
                  <input class="ff-input" id="onb-name" value="${esc(st.prenom)}" maxlength="20" autocomplete="given-name"></div>
                <div><p class="ff-overline">Ton régime</p>${segRegime(st.regime)}</div>
                <div><p class="ff-overline">Allergies ou intolérances</p>${segAllergies(st.allergies)}</div>
                <p class="ff-small ff-muted" style="margin:0">Régime et allergies sont gratuits, pour toujours. Tu pourras les changer dans Impact.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="onb__bottom">
          <div class="dots" aria-hidden="true"><span class="is-on"></span><span></span><span></span><span></span></div>
          <button class="ff-btn ff-btn--lg ff-btn--block" type="button" data-onb="next">Suivant${ic('arrow-right', 20)}</button>
        </div>
      </div>`;
    },
    mount(el, p, ctx) {
      const track = $('.onb__track', el), slides = el.querySelectorAll('.onb__slide');
      const dots = el.querySelectorAll('.dots span'), nextBtn = $('[data-onb="next"]', el), skip = $('[data-onb="skip"]', el);
      const N = slides.length;
      let i = 0;
      const goTo = k => {
        i = Math.max(0, Math.min(N - 1, k));
        track.style.transform = `translateX(${-i * 100}%)`;
        dots.forEach((d, j) => d.classList.toggle('is-on', j === i));
        slides.forEach((s, j) => s.setAttribute('aria-hidden', String(j !== i)));
        slides.forEach((s, j) => s.querySelectorAll('button, input').forEach(x => { x.tabIndex = j === i ? 0 : -1; }));
        nextBtn.innerHTML = i === N - 1 ? `C’est parti&nbsp;!${ic('zap', 20, 2.4)}` : `Suivant${ic('arrow-right', 20)}`;
        skip.style.visibility = i === N - 1 ? 'hidden' : 'visible';
      };
      ctx.goTo = d => goTo(i + d);
      goTo(0);
      bindSegments(el);
      nextBtn.addEventListener('click', () => {
        if (i < N - 1) return goTo(i + 1);
        Object.assign(S.state, readSegments(el));
        S.state.prenom = $('#onb-name', el).value.trim() || 'Inès';
        S.state.onboarded = true;
        S.save();
        stack = [];
        show('home', {}, 'up');
      });
      skip.addEventListener('click', () => goTo(N - 1));
      let x0 = null;
      const vp = $('.onb__viewport', el);
      vp.addEventListener('pointerdown', e => { x0 = e.clientX; });
      vp.addEventListener('pointerup', e => {
        if (x0 === null) return;
        const dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) goTo(i + (dx < 0 ? 1 : -1));
      });
    },
    key(e, ctx) {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') ctx.goTo(1);
      if (e.key === 'ArrowLeft') ctx.goTo(-1);
    }
  };

  /* ---------- E2 Accueil ---------- */
  SCREENS.home = {
    tab: 'home',
    render() {
      const st = S.state, im = I.compute();
      const h = new Date().getHours();
      const moment = h < 11 ? 'aujourd’hui' : h < 15 ? 'ce midi' : 'ce soir';
      const last = S.lastFlash();
      let nudge = '';
      if (last) {
        const live = E.ingredients(last).filter(x => !x.removed);
        let urg = live.filter(x => x.urgence === 'haute');
        if (!urg.length) urg = live.filter(x => x.urgence === 'moyenne');
        if (urg.length) {
          nudge = `<button class="nudge" type="button" data-action="reopen" data-flash="${last.id}" style="width:100%;border:0;text-align:left;font:inherit">
            <span class="nudge__icon">${ic('hourglass', 18, 2.4)}</span>
            <span class="ff-small" style="flex:1"><b>À manger vite</b> d’après ton dernier flash&nbsp;: ${urg.map(x => `${x.emoji}&nbsp;${esc(x.nom)}`).join(', ')}</span>
            ${ic('chevron-right', 20)}
          </button>`;
        }
      }
      const favs = st.favoris.map(f => {
        const fr = S.frigo(f.frigo), r = fr && fr.recettes.find(x => x.id === f.recette);
        if (!r) return '';
        return `<button class="ff-recipe ff-recipe--compact fav-card" type="button" data-action="open-recipe" data-frigo="${fr.id}" data-recette="${r.id}">
          <div class="ff-recipe__visual">${visual(r, 1)}</div>
          <div class="ff-recipe__body"><b>${esc(r.titre)}</b><span class="ff-meta">${ic('clock', 14)}${r.temps}&nbsp;min</span></div>
        </button>`;
      }).join('');
      const flashs = st.flashs.slice(-3).reverse().map(f => {
        const fr = S.frigo(f.frigo);
        const n = E.ingredients(f).filter(x => !x.removed).length;
        const k = Math.min(3, E.rank(f, st).length);
        return `<button class="ff-card history" type="button" data-action="reopen" data-flash="${f.id}">
          <span class="history__thumb"><img src="${fr.illu}" alt="">${f.photo ? `<span class="cam">${ic('camera', 12, 2.6)}</span>` : ''}</span>
          <div><b>${esc(frigoName(f))}</b><div class="ff-meta">${relDay(f.date)} · ${n} ingrédients · ${k} recettes</div></div>
          <span class="chev">${ic('chevron-right')}</span>
        </button>`;
      }).join('');
      return `
      <header class="ff-topbar">
        <div class="hello"><img src="assets/logo/symbole.svg" width="34" height="34" alt="FrigoFlash"><span>Salut ${esc(st.prenom)} 👋</span></div>
        <button class="avatar" type="button" data-action="tab" data-tab="impact" aria-label="Mon impact et mes réglages">${esc(st.prenom.charAt(0).toUpperCase())}</button>
      </header>
      <main class="ff-pad">
        <h1 class="ff-h1 home-title">On sauve quoi <span class="ff-mark">${moment}</span>&nbsp;?</h1>
        <button class="ff-flash" type="button" data-action="flash">
          <span class="ff-flash__icon">${ic('camera', 30, 2.4)}<svg class="ff-flash__rays" viewBox="0 0 24 24" fill="none" stroke="#16171D" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 12l6-6M10 20h10M2 8V1"/></svg></span>
          <span><span class="ff-flash__title">Flasher mon frigo</span><span class="ff-flash__sub" style="display:block">1 photo, 3 recettes, 0 courses</span></span>
        </button>
        ${nudge}
        <div class="section-head"><h2 class="ff-h3">Ces 4 semaines</h2><button class="ff-textlink" type="button" data-action="tab" data-tab="impact" style="border:0;background:none">Voir tout</button></div>
        <div class="ff-impact-strip">
          <div><b>${F.kg(im.kg)}&nbsp;kg</b><span>sauvés</span></div>
          <div><b>${F.eur(im.eur)}&nbsp;€</b><span>de nourriture</span></div>
          <div><b>${im.meals}</b><span>repas</span></div>
        </div>
        <div class="section-head"><h2 class="ff-h3">Tes favoris</h2></div>
        ${favs ? `<div class="rail">${favs}</div>` : `<div class="empty">${ic('heart', 20)}<span>Touche le cœur d’une recette pour la retrouver ici.</span></div>`}
        <div class="section-head" style="margin-top:16px"><h2 class="ff-h3">Derniers flashs</h2></div>
        <div class="stack">${flashs || `<div class="empty">${ic('zap', 20)}<span>Ton premier flash apparaîtra ici.</span></div>`}</div>
      </main>`;
    }
  };

  /* ---------- E4 Analyse ---------- */
  SCREENS.scan = {
    render(p) {
      const flash = S.flash(p.flash), fr = S.frigo(flash.frigo);
      const photo = FF.photos[flash.id];
      return `
      <div class="scan-wrap">
        <div class="scan-head"><span class="ff-overline scan-live">Analyse en cours</span><span class="ff-pill ff-pill--missing">Mode démo</span></div>
        <h1 class="sr-only">Analyse de ${esc(frigoName(flash))}</h1>
        <div class="ff-scan" id="scanbox">
          <img src="${photo || fr.illu}" alt="" class="${photo ? 'is-photo' : ''}">
          <div class="scan-corners" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div class="ff-scan__line"></div>
          <div class="scan-flash"></div>
        </div>
        <div class="scan-msg" aria-live="polite"><p class="ff-h3">${fr.messages[0]}</p></div>
        <div class="scan-progress" aria-hidden="true"><span></span></div>
        <div class="scan-found" aria-hidden="true"></div>
        <button class="ff-btn ff-btn--ghost scan-cancel" type="button" data-scan="cancel">Annuler</button>
      </div>`;
    },
    mount(el, p, ctx) {
      const flash = S.flash(p.flash), fr = S.frigo(flash.frigo);
      const T = reduced.matches ? 600 : 3600;
      const msgs = fr.messages, ings = fr.ingredients;
      const box = $('#scanbox', el), msg = $('.scan-msg', el), bar = $('.scan-progress span', el), found = $('.scan-found', el);
      const at = (ms, fn) => ctx.timers.push(setTimeout(fn, ms));
      at(60, () => box.classList.add('is-sharp'));
      msgs.forEach((m, k) => k && at(k * T / msgs.length, () => { msg.innerHTML = `<p class="ff-h3">${m}</p>`; }));
      ings.forEach((x, k) => at((k + 1) * T / (ings.length + 1), () => {
        found.insertAdjacentHTML('beforeend', `<span class="ff-pill ${x.urgence === 'haute' ? 'is-urgent' : ''}">${x.emoji} ${esc(x.nom)}</span>`);
      }));
      for (let k = 1; k <= 6; k++) at(k * T / 6 - 500, () => { bar.style.width = Math.min(100, k * 100 / 6 + 4) + '%'; });
      at(T + 350, () => { buzz(20); stack = [{ name: 'home', params: {}, scroll: 0 }]; show('ingredients', { flash: flash.id }, 'forward'); });
      $('[data-scan="cancel"]', el).addEventListener('click', () => SCREENS.scan.cancel(ctx));
    },
    cancel(ctx) {
      const id = ctx.params.flash;
      S.state.flashs = S.state.flashs.filter(f => f.id !== id);
      S.save();
      stack = [];
      show('home', {}, 'fade');
    }
  };

  /* ---------- E5 Ingrédients détectés ---------- */
  SCREENS.ingredients = {
    cls: 'is-flow',
    render(p) {
      const flash = S.flash(p.flash), fr = S.frigo(flash.frigo);
      return `
      <header class="ff-topbar">
        <button class="ff-icon-btn" type="button" data-action="back" aria-label="Retour">${ic('chevron-left')}</button>
        <span class="ff-overline topbar-title">${esc(frigoName(flash))}</span>
        <span class="topbar-spacer"></span>
      </header>
      <div class="ing-head"><h1 class="ff-h1" id="ing-title"></h1>
        <p class="lead">Touche un ingrédient pour le retirer si je me suis trompé.</p></div>
      <div class="ing-body grow">
        <div class="ff-chips" id="chips"></div>
        <div id="why"></div>
        <p class="placard-note">${ic('info', 16)}Toujours dans ton placard&nbsp;: sel, poivre, huile, eau.</p>
        ${flash.photo ? `<div class="info-card">${ic('camera', 18)}<span><b>Mode démo.</b> Ta photo n’est envoyée nulle part : l’analyse simulée renvoie le frigo étudiant. En V2, un vrai modèle vision s’en charge.</span></div>` : ''}
        ${fr.vide ? `<div class="info-card">${ic('info', 18)}<span>Pas grand-chose ici… Je vais piocher dans ton placard de secours (pâtes, riz, pain de mie).</span></div>` : ''}
      </div>
      <div class="cta-bar"><button class="ff-btn ff-btn--lg ff-btn--block" type="button" data-see>Voir mes 3 recettes${ic('arrow-right', 20)}</button></div>`;
    },
    mount(el, p, ctx) {
      const flash = S.flash(p.flash);
      const order = { haute: 0, moyenne: 1, basse: 2 };
      const paint = first => {
        const list = E.ingredients(flash).slice().sort((a, b) => (a.added - b.added) || (order[a.urgence] - order[b.urgence]));
        const live = list.filter(x => !x.removed);
        const urgent = live.filter(x => x.urgence === 'haute').length;
        const n = live.length, s = n > 1 ? 's' : '';
        const fr = S.frigo(flash.frigo);
        $('#ing-title', el).innerHTML = fr.vide
          ? `${n} trouvé${s}… <span class="ff-mark">c’est maigre</span>&nbsp;🕸️`
          : urgent ? `${n} trouvé${s}, <span class="ff-mark">${urgent}&nbsp;à sauver&nbsp;vite</span>`
            : `${n} trouvé${s}, <span class="ff-mark">rien d’urgent</span>`;
        $('#chips', el).innerHTML = list.map((x, k) => {
          const isU = !x.removed && x.urgence === 'haute', isM = !x.removed && x.urgence === 'moyenne';
          const cls = x.removed ? 'ff-chip--removed' : isU ? 'ff-chip--urgent' : x.added ? 'ff-chip--added' : '';
          const tag = isU ? `<span class="ff-chip__tag">${ic('hourglass', 13, 2.6)}vite</span>` : isM ? `<span class="ff-chip__tag chip-soon">${ic('clock', 13, 2.4)}bientôt</span>` : '';
          const label = (x.removed ? 'Remettre ' : 'Retirer ') + x.nom + (isU ? ', à manger vite' : isM ? ', à manger bientôt' : '');
          return `<button type="button" class="ff-chip ${cls} ${first ? 'is-in' : ''}" style="animation-delay:${k * 40}ms" data-id="${esc(x.id)}" aria-label="${esc(label)}">
            <span class="ff-chip__emoji" aria-hidden="true">${x.emoji}</span>${esc(x.nom)}${tag}<span class="ff-chip__x">${ic(x.removed ? 'rotate-ccw' : 'x', 16, 2.4)}</span></button>`;
        }).join('') + `<button type="button" class="ff-chip ff-chip--add ${first ? 'is-in' : ''}" style="animation-delay:${list.length * 40}ms" data-add>${ic('plus', 18, 2.4)}Ajouter</button>`;
        const why = live.filter(x => x.raison && (x.urgence === 'haute' || x.urgence === 'moyenne'));
        $('#why', el).innerHTML = why.length ? `<section class="ff-card why"><h2 class="ff-overline" style="margin:0">Pourquoi «&nbsp;vite&nbsp;»&nbsp;?</h2>
          ${why.map(x => `<div class="why__row"><span aria-hidden="true">${x.emoji}</span><div><b class="${x.urgence === 'haute' ? 'is-urgent' : ''}">${esc(x.nom)}</b> : ${esc(x.raison)}</div></div>`).join('')}
          <p class="ff-small ff-muted" style="margin:0">L’IA croise l’aspect visible et la durée de conservation habituelle de chaque produit.</p></section>` : '';
      };
      paint(!ctx.restore);
      $('#chips', el).addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.hasAttribute('data-add')) return openAddSheet(flash, () => paint(false));
        const id = b.dataset.id;
        if (flash.added.some(a => a.id === id)) flash.added = flash.added.filter(a => a.id !== id);
        else if (flash.removed.includes(id)) flash.removed = flash.removed.filter(x => x !== id);
        else flash.removed.push(id);
        S.save();
        paint(false);
        const nb = $(`#chips [data-id="${CSS.escape(id)}"]`, el);
        if (nb) nb.focus({ preventScroll: true });
      });
      $('[data-see]', el).addEventListener('click', () => go('recettes', { flash: flash.id }));
    }
  };

  /* ---------- E6 Résultats : 3 recettes ---------- */
  SCREENS.recettes = {
    tab: 'flash',
    render(p, ctx) {
      const st = S.state, flash = S.flash(p.flash), fr = S.frigo(flash.frigo);
      const ranked = E.rank(flash, st);
      const n = ranked.length, off = p.offset || 0;
      const shown = n <= 3 ? ranked : [0, 1, 2].map(k => ranked[(off + k) % n]);
      const fullN = shown.filter(x => x.full).length;
      const title = fr.vide ? `Frigo vide&nbsp;? <span class="ff-mark">Pas de panique.</span>`
        : !shown.length ? `Aucune idée <span class="ff-mark">compatible</span>`
          : fullN === shown.length ? `${shown.length} idée${shown.length > 1 ? 's' : ''}, <span class="ff-mark">0 courses.</span>`
            : `${shown.length} idées, <span class="ff-mark">${fullN} sans courses.</span>`;
      const urg = E.ingredients(flash).filter(x => !x.removed && x.urgence === 'haute').map(x => x.nom);
      const prefTxt = `Régime&nbsp;: ${regLabel(st.regime).toLowerCase()}${st.allergies.length ? ' · sans ' + allLabel(st.allergies) : ''}`;
      const card = (ev, k) => {
        const r = ev.recette;
        const link = `<a class="ff-recipe__link" href="#" data-action="open-recipe" data-flash="${flash.id}" data-frigo="${fr.id}" data-recette="${r.id}">${esc(r.titre)}</a>`;
        if (k === 0) {
          const best = off === 0 && ev.savedN > 0 && !ev.degraded;
          return `<article class="ff-recipe ff-reveal">
            <div class="ff-recipe__visual">${visual(r, k)}
              <span class="ff-recipe__rank ff-pill ff-pill--flash rank-pill">${ic('zap', 14, 2.6)}${best ? 'Meilleur anti-gaspi' : 'Idée 1'}</span>
              ${favBtn(fr.id, r)}</div>
            <div class="ff-recipe__body"><h2 class="ff-h3">${link}</h2>${metas(r)}${pills(ev)}</div>
          </article>`;
        }
        return `<article class="ff-recipe ff-recipe--compact ff-reveal">
          <div class="ff-recipe__visual">${visual(r, k)}</div>
          <div class="ff-recipe__body">
            <div class="compact-top"><span class="ff-overline">Idée ${k + 1}</span>${favBtn(fr.id, r, 18)}</div>
            <h2 class="ff-h3">${link}</h2>${metas(r)}${pills(ev, true)}
          </div>
        </article>`;
      };
      const few = shown.length < 3
        ? `<div class="info-card">${ic('info', 18)}<span>${shown.length ? `Seulement ${shown.length} idée${shown.length > 1 ? 's' : ''} compatible${shown.length > 1 ? 's' : ''}` : 'Rien de compatible'} avec tes préférences dans ce frigo. Change-les ou ajoute un ingrédient.</span></div>` : '';
      return `
      <header class="ff-topbar">
        <button class="ff-icon-btn" type="button" data-action="back" aria-label="Retour">${ic('chevron-left')}</button>
        <span class="ff-overline topbar-title">${esc(frigoName(flash))} · ${E.ingredients(flash).filter(x => !x.removed).length} ingrédients</span>
        <button class="ff-icon-btn" type="button" data-action="prefs" aria-label="Préférences : régime et allergies">${ic('sliders-horizontal', 20)}</button>
      </header>
      <div class="results-head ff-pad" style="padding:0 var(--gutter)">
        <h1 class="ff-h1">${title}</h1>
        <div class="context">
          ${urg.length ? `<span class="ff-pill ff-pill--urgent">${ic('hourglass', 14, 2.4)}Priorité&nbsp;: ${esc(urg.slice(0, 2).join(', '))}</span>` : ''}
          <button class="pill-btn" type="button" data-action="prefs"><span class="ff-pill ff-pill--missing">${prefTxt}${ic('chevron-right', 14)}</span></button>
        </div>
      </div>
      ${fr.vide && shown.length ? `<div class="ff-card--ink ff-card joke"><span aria-hidden="true">🕸️</span><p>${fr.blague}</p></div>` : ''}
      <div class="cards ${ctx.restore ? 'no-reveal' : ''}">
        ${shown.map(card).join('')}
        ${few}
        ${n > 3 ? `<button class="ff-btn ff-btn--secondary ff-btn--block" type="button" data-more style="margin-top:4px">${ic('rotate-ccw', 18)}Autres idées</button>` : ''}
        ${!shown.length ? `<button class="ff-btn ff-btn--block" type="button" data-action="prefs">Modifier mes préférences</button>` : ''}
      </div>`;
    },
    mount(el, p) {
      const more = $('[data-more]', el);
      if (more) more.addEventListener('click', () => {
        const n = E.rank(S.flash(p.flash), S.state).length;
        show('recettes', Object.assign({}, p, { offset: ((p.offset || 0) + 3) % n }), 'fade');
      });
    }
  };

  /* ---------- E7 Fiche recette ---------- */
  SCREENS.recette = {
    cls: 'no-top is-flow',
    sb: 'clear',
    render(p) {
      const { flash, fr, r, ev } = resolveRecipe(p);
      const cooked = !flash.virtual && flash.cooked.includes(r.id);
      const on = S.isFav(fr.id, r.id);
      const rows = ev.present.map(x => `<li><span class="tick">${ic('check', 16, 3)}</span>
          <span class="name">${x.emoji} ${esc(x.nom)}${x.urgence === 'haute' ? ` <span class="ff-pill ff-pill--urgent" style="height:24px;font-size:12px;vertical-align:1px">${ic('hourglass', 12, 2.6)}vite</span>` : ''}</span>
          <span class="qty">${esc(x.qteRecette || '')}</span></li>`).join('')
        + ev.manque.map(x => `<li class="is-missing"><span class="tick">${ic('shopping-basket', 15)}</span><span class="name">${x.emoji} ${esc(x.nom)}</span><span class="qty">${x.retire ? 'retiré' : 'à acheter'}</span></li>`).join('');
      const steps = r.etapes.map(s => `<li><div><p>${esc(s.t)}</p>${s.min ? `<span class="ff-meta">${ic('timer', 15)}${s.min}&nbsp;min</span>` : ''}</div></li>`).join('');
      const from = flash.photo ? 'Avec ta photo' : fr.vide ? 'Recette de placard' : 'Avec ton ' + fr.nom.charAt(0).toLowerCase() + fr.nom.slice(1);
      return `
      <div class="detail-visual">${visual(r, 0)}
        <div class="detail-actions">
          <button class="ff-icon-btn" type="button" data-action="back" aria-label="Retour">${ic('chevron-left')}</button>
          <button class="ff-icon-btn" type="button" data-action="fav" data-frigo="${fr.id}" data-recette="${r.id}" aria-pressed="${on}" aria-label="Favori : ${esc(r.titre)}">${ic('heart', 22)}</button>
        </div>
      </div>
      <div class="detail-body grow">
        <span class="ff-overline">${esc(from)}</span>
        <h1 class="ff-h2">${esc(r.titre)}</h1>
        ${metas(r)}
        ${pills(ev)}
        <section class="detail-section"><h2 class="ff-h3">Ingrédients</h2>
          <ul class="ing-list">${rows}</ul>
          <p class="placard-line">Du placard&nbsp;: ${r.placard.join(', ')}</p>
        </section>
        <section class="detail-section"><h2 class="ff-h3">Étapes</h2><ol class="steps">${steps}</ol></section>
        ${ev.savedG > 0 ? `<div class="save-preview"><span class="ico">${ic('leaf', 18, 2.4)}</span><div>En cuisinant ça, tu sauves <b>${F.g(ev.savedG)}</b> de la poubelle<br>≈ ${F.eur(I.euros(ev.savedG))}&nbsp;€ · ${F.kg(I.co2(ev.savedG))}&nbsp;kg CO₂e évités</div></div>` : ''}
      </div>
      <div class="cta-bar">
        <button class="ff-btn ff-btn--secondary cook-mode-btn" type="button" data-cookmode aria-label="Mode cuisine pas à pas">${ic('play', 18)}Pas à pas</button>
        <button class="ff-btn ff-btn--lg ff-btn--block" type="button" data-cooked ${cooked ? 'disabled' : ''}>${cooked ? ic('check', 20, 3) + 'Cuisiné, bravo&nbsp;!' : ic('sparkles', 20, 2.4) + 'J’ai cuisiné ça&nbsp;!'}</button>
      </div>`;
    },
    mount(el, p) {
      $('[data-cooked]', el).addEventListener('click', () => cook(p));
      $('[data-cookmode]', el).addEventListener('click', () => go('cuisine', p));
    }
  };

  /* ---------- E9 Mode cuisine pas à pas ---------- */
  SCREENS.cuisine = {
    cls: 'is-ink',
    sb: 'light',
    render(p) {
      const { r } = resolveRecipe(p);
      return `
      <div class="cook">
        <div class="cook__top">
          <button class="ff-icon-btn" type="button" data-action="back" aria-label="Quitter le mode cuisine">${ic('x')}</button>
          <span class="cook__title">${esc(r.titre)}</span>
          <span class="ff-pill ff-pill--flash">${ic('clock', 14, 2.4)}${r.temps}&nbsp;min</span>
        </div>
        <div class="cook__bars" aria-hidden="true">${r.etapes.map(() => '<span></span>').join('')}</div>
        <h1 class="sr-only">Mode cuisine : ${esc(r.titre)}</h1>
        <div class="cook__main" aria-live="polite"></div>
        <div class="cook__nav">
          <button class="ff-btn ff-btn--on-ink ff-btn--lg" type="button" data-cook="prev">${ic('chevron-left')}Précédent</button>
          <button class="ff-btn ff-btn--lg" type="button" data-cook="next"></button>
        </div>
      </div>`;
    },
    mount(el, p, ctx) {
      const { flash, r } = resolveRecipe(p);
      const N = r.etapes.length;
      const main = $('.cook__main', el), bars = el.querySelectorAll('.cook__bars span');
      const prev = $('[data-cook="prev"]', el), next = $('[data-cook="next"]', el);
      let i = 0, timer = null, left = 0, total = 0;
      const C = 2 * Math.PI * 37;
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
      ctx.stop = stop;
      const mmss = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      const paintTimer = () => {
        const t = $('.timer', main); if (!t) return;
        $('.timer__time', t).textContent = mmss(left);
        $('.bar', t).style.strokeDashoffset = String(C * (1 - left / total));
        $('[data-timer="toggle"]', t).innerHTML = timer ? ic('pause', 18) + 'Pause' : ic('play', 18) + (left === total ? 'Lancer' : left === 0 ? 'Terminé' : 'Reprendre');
        t.classList.toggle('is-done', left === 0);
      };
      const paint = () => {
        stop();
        const s = r.etapes[i];
        bars.forEach((b, j) => b.classList.toggle('is-on', j <= i));
        total = left = (s.min || 0) * 60;
        main.innerHTML = `<div class="cook__num">Étape ${i + 1} sur ${N}</div><p class="cook__text">${esc(s.t)}</p>` + (s.min ? `
          <div class="timer"><div class="timer__ring"><svg viewBox="0 0 84 84" aria-hidden="true"><circle class="track" cx="42" cy="42" r="37"/><circle class="bar" cx="42" cy="42" r="37" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><span class="timer__time" role="timer">${mmss(left)}</span></div>
            <div><p style="margin:0 0 8px;font-weight:700">Minuteur · ${s.min}&nbsp;min</p><div class="timer__ctrl">
              <button class="ff-btn" type="button" data-timer="toggle"></button>
              <button class="ff-btn ff-btn--on-ink" type="button" data-timer="reset" aria-label="Remettre le minuteur à zéro">${ic('rotate-ccw', 18)}</button>
            </div></div></div>` : '');
        prev.disabled = i === 0;
        const cooked = !flash.virtual && flash.cooked.includes(r.id);
        next.innerHTML = i < N - 1 ? `Suivant${ic('chevron-right')}` : cooked ? `Terminer${ic('check', 20, 3)}` : `J’ai cuisiné ça&nbsp;!${ic('sparkles', 20, 2.4)}`;
        paintTimer();
      };
      main.addEventListener('click', e => {
        const b = e.target.closest('[data-timer]'); if (!b) return;
        if (b.dataset.timer === 'reset') { stop(); left = total; return paintTimer(); }
        if (timer) { stop(); return paintTimer(); }
        if (left === 0) left = total;
        timer = setInterval(() => {
          left = Math.max(0, left - 1);
          if (left === 0) { stop(); beep(); buzz([200, 100, 200]); toast('Minuteur terminé, étape suivante&nbsp;!', 'timer'); }
          paintTimer();
        }, 1000);
        ctx.timers.push(timer);
        paintTimer();
      });
      const step = d => {
        if (i + d >= N) {
          const cooked = !flash.virtual && flash.cooked.includes(r.id);
          back();
          if (!cooked) setTimeout(() => cook(p), reduced.matches ? 0 : 420);
          return;
        }
        i = Math.max(0, i + d); paint();
      };
      ctx.step = step;
      prev.addEventListener('click', () => step(-1));
      next.addEventListener('click', () => step(1));
      let x0 = null;
      main.addEventListener('pointerdown', e => { x0 = e.clientX; });
      main.addEventListener('pointerup', e => {
        if (x0 === null) return;
        const dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 60 && !(i === N - 1 && dx < 0)) step(dx < 0 ? 1 : -1);
      });
      paint();
    },
    leave(ctx) { if (ctx.stop) ctx.stop(); },
    key(e, ctx) {
      if (e.key === 'ArrowRight') ctx.step(1);
      if (e.key === 'ArrowLeft') ctx.step(-1);
    }
  };

  /* ---------- E8 Impact (+ E10 badges, réglages) ---------- */
  SCREENS.impact = {
    tab: 'impact',
    render() {
      const st = S.state, im = I.compute();
      const max = Math.max(0.5, ...im.weeks);
      const xs = [14, 92, 170, 248];
      const bars = im.weeks.map((v, k) => {
        const h = Math.max(4, Math.round(v / max * 99));
        return `<rect class="${k === 3 ? 'bar-now' : ''}" x="${xs[k]}" y="${104 - h}" width="52" height="${h}" rx="10" fill="${k === 3 ? 'url(#hatch)' : 'var(--dv-1)'}"/>
          <text class="v" x="${xs[k] + 26}" y="${104 - h - 7}" text-anchor="middle">${F.num(v)}</text>`;
      }).join('');
      const labels = ['S1', 'S2', 'S3', 'Cette sem.'].map((l, k) => `<text x="${xs[k] + 26}" y="122" text-anchor="middle" class="${k === 3 ? 'now' : ''}">${l}</text>`).join('');
      const aria = 'Kilos sauvés par semaine : ' + im.weeks.map((v, k) => (k === 3 ? 'cette semaine ' : 'S' + (k + 1) + ' ') + F.num(v) + ' kg').join(', ');
      const days = im.week.map(d => `<div class="ff-streak__day ${d.done ? 'is-done' : ''} ${d.today && !d.done ? 'is-today' : ''}">
          <span class="ff-streak__dot">${d.done ? (d.today ? ic('zap', 16, 2.6) : ic('check', 16, 3)) : ''}</span>${d.label}</div>`).join('');
      const badge = (ok, iconName, title, prog) => `<div class="ff-achievement ${ok ? '' : 'is-locked'}">
          <span class="ff-achievement__medal">${ok ? ic(iconName, 28, 2.4) : ic('lock', 24)}</span>${title}${!ok && prog ? `<small>${prog}</small>` : ''}</div>`;
      const allMeals = st.cuisines.length;
      return `
      <header class="ff-topbar"><div><div class="ff-overline">4 dernières semaines</div><h1 class="ff-h1">Ton impact</h1></div></header>
      <main class="ff-pad">
        <section class="ff-card--ink hero" aria-label="Nourriture sauvée">
          <svg class="hero__rays" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 12l6-6M10 20h10M2 8V1"/></svg>
          <div class="hero__label">Nourriture sauvée de la poubelle</div>
          <div class="hero__value"><span data-count="kg">${F.kg(im.kg)}</span><small>&nbsp;kg</small></div>
          <div class="hero__today">${im.todayG ? `<span class="ff-pill">+${F.g(im.todayG)} aujourd’hui</span>` : ''}</div>
          <svg class="chart" viewBox="0 -14 310 144" width="100%" role="img" aria-label="${aria}">
            <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#FFD60A"/><path d="M0 0v6" stroke="#16171D" stroke-width="2.4"/></pattern></defs>
            <path d="M0 104H310" stroke="rgba(255,248,236,.18)"/>
            ${bars}${labels}
          </svg>
        </section>
        <div class="ff-stats" style="margin-top:12px">
          <div class="ff-stat ff-stat--eur"><span class="ff-stat__icon">${ic('euro', 20, 2.4)}</span><span class="ff-stat__value"><span data-count="eur">${F.eur(im.eur)}</span><span class="ff-stat__unit">€</span></span><span class="ff-stat__label">de nourriture sauvée</span></div>
          <div class="ff-stat ff-stat--co2"><span class="ff-stat__icon">${ic('cloud', 20, 2.4)}</span><span class="ff-stat__value"><span data-count="co2">${F.kg(im.co2)}</span><span class="ff-stat__unit">kg</span></span><span class="ff-stat__label">CO₂e évités</span></div>
          <div class="ff-stat ff-stat--meals"><span class="ff-stat__icon">${ic('utensils', 20, 2.4)}</span><span class="ff-stat__value"><span data-count="meals">${im.meals}</span></span><span class="ff-stat__label">repas cuisinés</span></div>
          <div class="ff-stat ff-stat--kg"><span class="ff-stat__icon">${ic('flame', 20, 2.4)}</span><span class="ff-stat__value"><span data-count="streak">${im.streak}</span><span class="ff-stat__unit">jour${im.streak > 1 ? 's' : ''}</span></span><span class="ff-stat__label">de série</span></div>
        </div>
        <p class="eq">≈ 4&nbsp;€ par kg sauvé (ADEME) · 2,5&nbsp;kg CO₂e par kg (FAO 2013)</p>

        <h2 class="ff-h3 sec">Ta série 🔥</h2>
        <div class="ff-card" role="img" aria-label="Série : ${im.streak} jour${im.streak > 1 ? 's' : ''} d’affilée"><div class="ff-streak">${days}</div></div>

        <h2 class="ff-h3 sec">Badges</h2>
        <div class="ff-achievements">
          ${badge(allMeals > 0, 'zap', 'Premier sauvetage')}
          ${badge(im.allTimeKg >= 5, 'trophy', '5&nbsp;kg sauvés', `${F.kg(im.allTimeKg)} / 5&nbsp;kg`)}
          ${badge(im.streak >= 7, 'award', 'Série de 7&nbsp;jours', `${im.streak} / 7&nbsp;j`)}
        </div>

        <h2 class="ff-h3 sec">Réglages</h2>
        <div class="ff-list">
          <button class="ff-list__item" type="button" data-action="name">${ic('user', 20)}Prénom<span class="val">${esc(st.prenom)}${ic('chevron-right', 16)}</span></button>
          <button class="ff-list__item" type="button" data-action="prefs">${ic('leaf', 20)}Régime<span class="val">${regLabel(st.regime)}${ic('chevron-right', 16)}</span></button>
          <button class="ff-list__item" type="button" data-action="prefs">${ic('info', 20)}Allergies<span class="val">${allLabel(st.allergies).replace(/^./, c => c.toUpperCase())}${ic('chevron-right', 16)}</span></button>
          <button class="ff-list__item" type="button" data-action="intro">${ic('play', 20)}Revoir l’introduction<span class="val">${ic('chevron-right', 16)}</span></button>
          <button class="ff-list__item is-danger" type="button" data-action="reset">${ic('rotate-ccw', 20)}Réinitialiser la démo<span class="val">${ic('chevron-right', 16)}</span></button>
        </div>
        <p class="about"><img src="assets/logo/symbole.svg" alt="">FrigoFlash · prototype en mode démo<br>Analyse simulée : aucune photo ne quitte ton téléphone.<br>Conçu et codé entièrement avec l’IA.</p>
      </main>`;
    },
    mount(el, p, ctx) {
      const from = FF.prevImpact;
      FF.prevImpact = null;
      if (!from || ctx.restore) return;
      const im = I.compute();
      const fmts = { kg: F.kg, eur: F.eur, co2: F.kg, meals: F.int, streak: F.int };
      el.querySelectorAll('[data-count]').forEach(n => {
        const k = n.dataset.count;
        setTimeout(() => countUp(n, from[k], im[k], fmts[k], 1000), 250);
      });
      const bar = $('.bar-now', el);
      if (bar && bar.animate && !reduced.matches && im.weeks[3] > 0) {
        bar.style.transformBox = 'fill-box';
        bar.style.transformOrigin = 'bottom';
        bar.animate([{ transform: `scaleY(${Math.max(0.05, from.weeks[3] / im.weeks[3])})` }, { transform: 'none' }],
          { duration: 1000, delay: 250, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      }
    }
  };

  /* =================================================================
     E0 Splash, horloge, clavier, démarrage
     ================================================================= */
  function splash(next) {
    const s = document.createElement('div');
    s.className = 'splash';
    s.innerHTML = '<img src="assets/logo/logo-vertical.svg" alt="FrigoFlash"><div class="splash__flash"></div>';
    phone.appendChild(s);
    const q = reduced.matches ? 0.2 : 1;
    setTimeout(() => s.classList.add('is-flashing'), 650 * q);
    setTimeout(() => { next(); s.classList.add('is-out'); }, 900 * q);
    setTimeout(() => s.remove(), 1250 * q);
  }

  function tick() {
    const d = new Date();
    $('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (sheet) return closeSheet();
      if (!current) return;
      if (current.name === 'scan') return SCREENS.scan.cancel(current);
      if (stack.length) return back();
    }
    if (e.key === 'Tab' && sheet) {   // garder le focus dans la feuille
      const f = [...sheet.sh.querySelectorAll('button:not([disabled]), input, [href], label.import-btn input')].filter(x => x.offsetParent !== null || x.type === 'file');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (!sheet && current && SCREENS[current.name].key) SCREENS[current.name].key(e, current);
  });

  // le cadre ne doit jamais défiler (un focus peut le faire bouger malgré overflow: hidden)
  phone.addEventListener('scroll', () => { phone.scrollTop = 0; phone.scrollLeft = 0; });

  document.querySelector('[data-panel="reset"]').addEventListener('click', openResetSheet);

  // Démarrage
  window.FFIcons.render(document);
  S.load();
  tick(); setInterval(tick, 20000);
  splash(() => (S.state.onboarded ? show('home', {}, 'fade') : show('onboarding', {}, 'fade')));
})();
