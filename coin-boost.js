/* ============================================================
   EYLOX — coin-boost.js
   2× Coin Boost system.
   - Shop sells boost for 200 Eylux (1-hour duration).
   - Active boost shown as a top banner on every hub page.
   - Games read eylox_coin_boost to multiply their final awards.
   - Also grants 25 bonus Eylux every 5 min while active.
   ============================================================ */
'use strict';

(function EyloxCoinBoost() {
  const BOOST_KEY   = 'eylox_coin_boost';
  const TICK_MS     = 5 * 60 * 1000; /* 5 minutes */
  const TICK_COINS  = 25;

  function getBoost() {
    try { return JSON.parse(localStorage.getItem(BOOST_KEY) || 'null'); } catch { return null; }
  }
  function clearBoost() { localStorage.removeItem(BOOST_KEY); }
  function getUser() { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } }
  function saveUser(u) { localStorage.setItem('eylox_user', JSON.stringify(u)); }

  function isActive() {
    const b = getBoost();
    return b && b.expires > Date.now();
  }

  function remaining() {
    const b = getBoost();
    if (!b) return 0;
    return Math.max(0, b.expires - Date.now());
  }

  function fmt(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /* ── Activate a new boost ── */
  function activate(durationMs = 3600000) {
    localStorage.setItem(BOOST_KEY, JSON.stringify({
      expires:    Date.now() + durationMs,
      multiplier: 2,
      lastTick:   Date.now(),
    }));
    showBanner();
    if (window.Notifs?.push) {
      window.Notifs.push('⚡ 2× Eylux Boost Activated!', 'Earn double Eylux for the next hour!', 'eylux');
    }
    /* Trigger notification via localStorage */
    const notifs = (() => { try { return JSON.parse(localStorage.getItem('eylox_notifications') || '[]'); } catch { return []; } })();
    notifs.unshift({ id:Date.now(), title:'⚡ 2× Eylux Boost!', body:'Double Eylux for 1 hour!', type:'eylux', read:false, time:Date.now() });
    localStorage.setItem('eylox_notifications', JSON.stringify(notifs.slice(0,50)));
  }
  window.EyloxActivateBoost = activate;

  /* ── Passive tick coins ── */
  function tick() {
    if (!isActive()) return;
    const b = getBoost();
    if (!b) return;
    const elapsed = Date.now() - (b.lastTick || Date.now());
    if (elapsed < TICK_MS) return;
    const u = getUser();
    if (!u) return;
    u.coins = Math.min((u.coins || 0) + TICK_COINS, 1e9);
    saveUser(u);
    b.lastTick = Date.now();
    localStorage.setItem(BOOST_KEY, JSON.stringify(b));
    /* Floating coin toast */
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,#92400e,#f59e0b,#fde68a);
      color:#1a0800;font-family:'Fredoka One',cursive;font-size:.9rem;
      padding:8px 20px;border-radius:99px;z-index:99999;
      box-shadow:0 4px 20px rgba(245,158,11,.5);
      animation:boost-tick-in .4s cubic-bezier(.34,1.56,.64,1) both;
      pointer-events:none;
    `;
    el.textContent = `⚡ +${TICK_COINS} Eylux Boost!`;
    if (!document.getElementById('boost-tick-kf')) {
      const kf = document.createElement('style');
      kf.id = 'boost-tick-kf';
      kf.textContent = `@keyframes boost-tick-in{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes boost-tick-out{to{opacity:0;transform:translateX(-50%) translateY(-12px)}}`;
      document.head.appendChild(kf);
    }
    document.body.appendChild(el);
    setTimeout(() => { el.style.animation = 'boost-tick-out .35s ease forwards'; setTimeout(() => el.remove(), 360); }, 2500);
  }

  /* ── Top banner ── */
  let _banner = null;
  let _ticker = null;

  function showBanner() {
    if (!isActive() || document.getElementById('boost-banner')) return;
    /* Skip game pages */
    const page = document.body?.dataset?.page || '';
    if (page.startsWith('game')) return;

    if (!document.getElementById('boost-banner-css')) {
      const s = document.createElement('style');
      s.id = 'boost-banner-css';
      s.textContent = `
        #boost-banner {
          position:fixed; top:0; left:0; right:0; z-index:9997;
          background:linear-gradient(90deg,#92400e,#d97706,#f59e0b,#d97706,#92400e);
          background-size:200% 100%;
          animation:boost-shimmer 3s linear infinite;
          color:#1a0800; font-family:'Fredoka One',cursive;
          padding:7px 16px; display:flex; align-items:center; justify-content:center;
          gap:10px; font-size:.85rem; box-shadow:0 2px 16px rgba(245,158,11,.4);
        }
        @keyframes boost-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        #boost-banner-close {
          background:rgba(0,0,0,.2); border:none; border-radius:50%;
          width:20px; height:20px; cursor:pointer; font-size:.75rem;
          display:flex;align-items:center;justify-content:center;
          color:#1a0800; position:absolute; right:12px;
        }
        body.has-boost-banner .topbar { top:35px !important; }
        body.has-boost-banner .sidebar { top:35px !important; }
      `;
      document.head.appendChild(s);
    }

    _banner = document.createElement('div');
    _banner.id = 'boost-banner';
    _banner.innerHTML = `<span style="font-size:1rem">⚡</span> <span>2× Eylux Boost Active!</span> <span id="boost-timer" style="background:rgba(0,0,0,.2);padding:2px 8px;border-radius:99px;font-size:.8rem">${fmt(remaining())}</span> <button id="boost-banner-close" title="Dismiss">✕</button>`;
    document.body.prepend(_banner);
    document.body.classList.add('has-boost-banner');

    document.getElementById('boost-banner-close').addEventListener('click', () => {
      _banner?.remove(); _banner = null;
      document.body.classList.remove('has-boost-banner');
    });

    /* Countdown ticker */
    clearInterval(_ticker);
    _ticker = setInterval(() => {
      const rem = remaining();
      const timerEl = document.getElementById('boost-timer');
      if (timerEl) timerEl.textContent = fmt(rem);
      if (rem <= 0) {
        clearInterval(_ticker);
        _banner?.remove(); _banner = null;
        document.body.classList.remove('has-boost-banner');
        clearBoost();
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a0840;border:1px solid rgba(167,139,250,.3);color:#9d8ec7;font-family:Nunito,sans-serif;font-weight:800;font-size:.85rem;padding:10px 20px;border-radius:99px;z-index:99999;pointer-events:none;';
        el.textContent = '⚡ Eylux Boost Expired';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
      }
      /* Passive tick */
      tick();
    }, 1000);
  }

  function removeBanner() {
    clearInterval(_ticker);
    _banner?.remove(); _banner = null;
    document.body.classList.remove('has-boost-banner');
  }

  /* ── Boot ── */
  function boot() {
    if (isActive()) showBanner();
    else clearBoost();
    /* Refresh on storage change (cross-tab activation) */
    window.addEventListener('storage', e => {
      if (e.key !== BOOST_KEY) return;
      if (isActive()) showBanner(); else removeBanner();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /* Expose for shop integration */
  window.EyloxBoost = { activate, isActive, remaining, getMultiplier: () => isActive() ? 2 : 1 };

})();
