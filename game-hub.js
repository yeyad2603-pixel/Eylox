/* ============================================================
   EYLOX — Game Hub (Roblox-style enhancements)
   Live player counters, server pulse, "Play with Party" integration,
   trending badges, and per-game experience display on cards.
   ============================================================ */
'use strict';

(function EyloxGameHub() {
  const page = document.body?.dataset?.page || '';
  if (!['games','home'].some(p => page.startsWith(p))) return;

  const TRENDING = ['ninja-dash','space-blaster','obby-world-3d','sky-riders'];
  const HOT_NEW   = ['obby-world-3d','city-roleplay-3d','pirate-bay-3d'];

  /* ── Real session counts from localStorage ── */
  function getSessionCounts(windowMs) {
    try {
      if (window.EyloxSessionTracker) return window.EyloxSessionTracker.countAll(windowMs);
      const cutoff = Date.now() - (windowMs || 86400000);
      const map = {};
      JSON.parse(localStorage.getItem('eylox_game_sessions') || '[]')
        .filter(s => s.t >= cutoff)
        .forEach(s => { map[s.id] = (map[s.id] || 0) + 1; });
      return map;
    } catch { return {}; }
  }

  let _countCache = null, _countTs = 0;
  function liveCount(id) {
    if (!_countCache || Date.now() - _countTs > 29000) {
      _countCache = getSessionCounts(86400000);
      _countTs = Date.now();
    }
    return _countCache[id] || 0;
  }

  function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    if (n === 0) return 'No one';
    return String(n);
  }

  function fmtLabel(n) {
    if (n === 0) return 'No one playing yet';
    return fmt(n) + (n === 1 ? ' playing' : ' playing');
  }

  /* ── Inject styles ── */
  if (!document.getElementById('gh-style')) {
    const s = document.createElement('style');
    s.id = 'gh-style';
    s.textContent = `
      .gh-live{position:absolute;top:8px;left:8px;z-index:5;background:rgba(0,0,0,.68);backdrop-filter:blur(6px);border:1px solid rgba(74,222,128,.35);border-radius:20px;padding:2px 8px;font-size:.65rem;font-weight:800;color:#4ade80;font-family:'Nunito',sans-serif;display:flex;align-items:center;gap:4px;pointer-events:none;}
      .gh-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:gh-pulse 1.8s ease infinite;}
      @keyframes gh-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
      .gh-badge{position:absolute;top:8px;right:8px;z-index:6;border-radius:6px;padding:3px 7px;font-size:.58rem;font-weight:800;font-family:'Fredoka One',cursive;letter-spacing:.5px;pointer-events:none;}
      .gh-badge-trend{background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;box-shadow:0 2px 10px rgba(245,158,11,.4);}
      .gh-badge-new{background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;box-shadow:0 2px 10px rgba(59,130,246,.4);}
      .gh-badge-hot{background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;box-shadow:0 2px 10px rgba(168,85,247,.4);}
      .gh-xp{font-size:.62rem;color:#a78bfa;font-weight:700;margin-top:2px;display:block;}
      .gh-party-btn{display:none;margin-top:4px;width:100%;padding:5px;background:linear-gradient(135deg,rgba(124,58,237,.6),rgba(168,85,247,.6));border:1px solid rgba(167,139,250,.35);color:#e9d5ff;border-radius:8px;font-family:'Fredoka One',cursive;font-size:.75rem;cursor:pointer;transition:background .15s;}
      .gh-party-btn:hover{background:linear-gradient(135deg,rgba(124,58,237,.85),rgba(168,85,247,.85));}
      .game-card:hover .gh-party-btn{display:block;}
      .gh-server-pill{display:inline-flex;align-items:center;gap:4px;background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);border-radius:99px;padding:1px 7px;font-size:.6rem;font-weight:800;color:#93c5fd;margin-left:6px;}
      .gh-rank-strip{font-size:.6rem;color:#fde68a;font-weight:700;margin-top:1px;}
    `;
    document.head.appendChild(s);
  }

  /* ── Enhance a single game card ── */
  function enhanceCard(card) {
    if (card.dataset.ghDone) return;
    card.dataset.ghDone = '1';
    card.style.position = 'relative';

    const id = card.dataset.gameId || card.querySelector('[data-id]')?.dataset.id || '';
    const count = liveCount(id);

    /* Live player counter */
    const live = document.createElement('div');
    live.className = 'gh-live';
    live.innerHTML = `<span class="gh-dot"></span>${fmtLabel(count)}`;
    live.dataset.gid = id;
    const thumb = card.querySelector('.card-thumb');
    if (thumb) thumb.appendChild(live);
    else card.prepend(live);

    /* Trending / New / Hot badge */
    const allCounts = Object.values(_countCache || {});
    const maxCount = allCounts.length ? Math.max(...allCounts) : 0;
    let badgeClass = '', badgeText = '';
    if (TRENDING.includes(id) && count === maxCount && count > 0) { badgeClass = 'gh-badge-trend'; badgeText = '🔥 TRENDING'; }
    else if (HOT_NEW.includes(id)) { badgeClass = 'gh-badge-hot'; badgeText = '✨ NEW 3D'; }
    else if (count > 0 && maxCount > 0 && count >= maxCount * 0.75) { badgeClass = 'gh-badge-hot'; badgeText = '⚡ HOT'; }

    if (badgeClass) {
      const badge = document.createElement('div');
      badge.className = `gh-badge ${badgeClass}`;
      badge.textContent = badgeText;
      if (thumb) thumb.appendChild(badge);
      else card.prepend(badge);
    }

    /* Per-game XP / rank */
    const hsKey = `eylox_hs_${id?.replace(/-/g,'_')}`;
    const hs = localStorage.getItem(hsKey);
    const body = card.querySelector('.card-body');
    if (body && hs) {
      const xpEl = document.createElement('span');
      xpEl.className = 'gh-xp';
      xpEl.textContent = `Your best: ${hs}`;
      const meta = body.querySelector('.card-meta');
      if (meta) meta.after(xpEl);
    }

    /* Friends playing */
    const friendsLabel = friendsPlayingLabel(id);
    if (body && friendsLabel) {
      const fl = document.createElement('span');
      fl.className = 'gh-friends';
      fl.textContent = `🤝 ${friendsLabel}`;
      fl.style.cssText = 'font-size:.62rem;color:#34d399;font-weight:700;margin-top:1px;display:block;';
      const meta = body.querySelector('.card-meta');
      if (meta) meta.after(fl); else body.prepend(fl);
    }

    /* Play with Party button */
    const partyBtn = document.createElement('button');
    partyBtn.className = 'gh-party-btn';
    partyBtn.textContent = '🎮 Play with Party';
    partyBtn.addEventListener('click', e => {
      e.stopPropagation();
      const title = card.querySelector('.card-title')?.textContent || id;
      if (window.EyloxParty?.isInParty()) {
        window.EyloxParty.setGame(title);
        window.EyloxToast?.(`Party game set to ${title}!`, 'success', 2000);
      } else {
        window.EyloxToast?.('Create a party first (🎮 button, bottom-right)!', 'info', 3000);
      }
    });
    if (body) body.appendChild(partyBtn);
  }

  /* ── Update hot-card player counts ── */
  function updateHotCards() {
    document.querySelectorAll('.hot-card[data-game-id]').forEach(card => {
      const id = card.dataset.gameId || '';
      const count = liveCount(id);
      const el = card.querySelector('.hot-players');
      if (el) el.textContent = count === 0 ? '👥 No one yet' : `👥 ${fmtLabel(count)}`;
    });
  }

  /* ── Friends playing indicator ── */
  function friendsPlayingLabel(id) {
    try {
      const friends = JSON.parse(localStorage.getItem('eylox_friends') || '[]');
      const sessions = JSON.parse(localStorage.getItem('eylox_game_sessions') || '[]');
      const cutoff = Date.now() - 3600000; // last 1h
      const friendNames = new Set(friends.map(f => (f.username || '').toLowerCase()));
      const count = sessions.filter(s => s.id === id && s.t >= cutoff && friendNames.has((s.user || '').toLowerCase())).length;
      return count > 0 ? `${count} friend${count > 1 ? 's' : ''} playing` : null;
    } catch { return null; }
  }

  /* ── Enhance all cards now + watch for new ones ── */
  function enhanceAll() {
    document.querySelectorAll('.game-card').forEach(enhanceCard);
    updateHotCards();
  }

  const obs = new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) {
        if (n.classList?.contains('game-card')) enhanceCard(n);
        else n.querySelectorAll?.('.game-card').forEach(enhanceCard);
      }
    }));
  });
  obs.observe(document.body, { childList: true, subtree: true });

  /* ── Refresh live counters every 30s ── */
  setInterval(() => {
    _countCache = null; // force re-read from localStorage
    document.querySelectorAll('.gh-live[data-gid]').forEach(el => {
      el.innerHTML = `<span class="gh-dot"></span>${fmtLabel(liveCount(el.dataset.gid))}`;
    });
    updateHotCards();
  }, 30000);

  document.addEventListener('DOMContentLoaded', enhanceAll);
  if (document.readyState !== 'loading') enhanceAll();

})();
