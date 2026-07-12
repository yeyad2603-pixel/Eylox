/* ============================================================
   EYLOX — level-badge.js
   Topbar level badge with SVG XP ring and full rank names.
   Requires ranks.js to be loaded first for EyloxRanks data.
   ============================================================ */
'use strict';

(function EyloxLevelBadge() {
  const XP_PER_LEVEL = 500;

  function getRanks() {
    return window.EyloxRanks || null;
  }

  /* Fallback when ranks.js is not loaded */
  const FALLBACK_TIERS = [
    { min:1,  max:6,  label:'Bronze',    color:'#cd7f32', glow:'rgba(205,127,50,.4)',   emoji:'🟤' },
    { min:7,  max:12, label:'Silver',    color:'#c0c0c0', glow:'rgba(192,192,192,.4)',  emoji:'⚪' },
    { min:13, max:18, label:'Gold',      color:'#ffd700', glow:'rgba(255,215,0,.4)',    emoji:'🟡' },
    { min:19, max:24, label:'Platinum',  color:'#e5e4e2', glow:'rgba(229,228,226,.4)',  emoji:'🔷' },
    { min:25, max:30, label:'Diamond',   color:'#b9f2ff', glow:'rgba(185,242,255,.4)',  emoji:'💎' },
    { min:31, max:36, label:'Elite',     color:'#f472b6', glow:'rgba(244,114,182,.4)',  emoji:'👑' },
    { min:37, max:45, label:'Master',    color:'#818cf8', glow:'rgba(129,140,248,.4)',  emoji:'🌌' },
    { min:46, max:57, label:'Legendary', color:'#f97316', glow:'rgba(249,115,22,.4)',   emoji:'☄️' },
    { min:58, max:66, label:'Eternal',   color:'#fde68a', glow:'rgba(253,230,138,.4)',  emoji:'✨' },
    { min:67, max:72, label:'Omni',      color:'#fb923c', glow:'rgba(251,146,60,.4)',   emoji:'🔥' },
    { min:73, max:Infinity, label:'GODSPEED', color:'#f0abfc', glow:'rgba(240,171,252,.5)', emoji:'⚡🚀' },
  ];

  function getFallbackTier(lvl) {
    return FALLBACK_TIERS.find(t => lvl >= t.min && lvl <= t.max) || FALLBACK_TIERS[0];
  }

  function getRankData(lvl) {
    const R = getRanks();
    if (R) {
      const rank = R.getRank(lvl);
      return { name: rank.name, color: rank.color, glow: rank.glow, emoji: rank.emoji, tier: rank.tier };
    }
    const fb = getFallbackTier(lvl);
    return { name: fb.label, color: fb.color, glow: fb.glow, emoji: fb.emoji, tier: fb.label };
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; }
  }

  /* ── Build badge inner HTML ── */
  function buildBadgeHTML(lvl, pct, rankData) {
    const R = 10, C = 14;
    const circ  = 2 * Math.PI * R;
    const offset = circ * (1 - pct / 100);
    const isGodspeed = rankData.tier === 'GODSPEED';
    return `
      <svg width="${C*2}" height="${C*2}" viewBox="0 0 ${C*2} ${C*2}" style="flex-shrink:0">
        <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="2.5"/>
        <circle id="lvl-ring-fill" cx="${C}" cy="${C}" r="${R}" fill="none"
          stroke="${rankData.color}" stroke-width="2.5" stroke-linecap="round"
          stroke-dasharray="${circ.toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}"
          transform="rotate(-90 ${C} ${C})"
          style="transition:stroke-dashoffset 1s cubic-bezier(.22,.61,.36,1);${isGodspeed?'filter:drop-shadow(0 0 3px '+rankData.glow+')':''}"/>
      </svg>
      <div id="lvl-num" style="line-height:1;text-align:center">
        <div style="font-family:'Fredoka One',cursive;font-size:.82rem;color:${rankData.color};line-height:1${isGodspeed?';text-shadow:0 0 8px '+rankData.glow:''}">${lvl}</div>
        <div style="font-size:.44rem;font-weight:900;color:rgba(255,255,255,.4);letter-spacing:.4px;margin-top:1px;max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${rankData.tier.toUpperCase()}</div>
      </div>
    `;
  }

  let _badge    = null;
  let _lastLvl  = -1;
  let _lastPct  = -1;

  function injectBadge() {
    if (document.getElementById('lvl-badge')) return;

    if (!document.getElementById('lvl-badge-css')) {
      const s = document.createElement('style');
      s.id = 'lvl-badge-css';
      s.textContent = `
        #lvl-badge {
          display:inline-flex; align-items:center; justify-content:center; gap:5px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          border-radius:99px; padding:4px 10px 4px 5px;
          cursor:pointer; position:relative; flex-shrink:0;
          transition:background .2s, box-shadow .2s;
          user-select:none;
        }
        #lvl-badge:hover { background:rgba(255,255,255,.12); }

        @keyframes lvl-up-burst {
          0%   { transform:scale(1); }
          40%  { transform:scale(1.4); }
          70%  { transform:scale(.9); }
          100% { transform:scale(1); }
        }
        #lvl-badge.lvl-up { animation:lvl-up-burst .6s cubic-bezier(.34,1.56,.64,1); }

        /* Rank tooltip */
        #lvl-tooltip {
          position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%);
          background:#1a0840; border:1px solid rgba(167,139,250,.3);
          border-radius:14px; padding:12px 16px; min-width:220px;
          font-family:'Nunito',sans-serif; font-size:.78rem; font-weight:700;
          color:#9d8ec7; box-shadow:0 8px 32px rgba(0,0,0,.5);
          pointer-events:none; z-index:99999;
          animation:tt-in .18s ease both;
          white-space:nowrap;
        }
        @keyframes tt-in { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        #lvl-tooltip strong { color:#f0e8ff; }

        /* Godspeed glow animation */
        @keyframes godspeedPulse {
          0%,100% { border-color:rgba(240,171,252,.2); box-shadow:0 0 8px rgba(240,171,252,.2); }
          50%     { border-color:rgba(240,171,252,.5); box-shadow:0 0 16px rgba(240,171,252,.4); }
        }
        #lvl-badge.is-godspeed { animation:godspeedPulse 2s ease-in-out infinite; }
      `;
      document.head.appendChild(s);
    }

    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight) return;

    _badge    = document.createElement('div');
    _badge.id = 'lvl-badge';

    /* Click → rank tooltip */
    let _tt = null;
    _badge.addEventListener('click', e => {
      e.stopPropagation();
      if (_tt) { _tt.remove(); _tt = null; return; }
      const u = getUser();
      if (!u) return;
      const coins    = u.coins || 0;
      const lvl      = Math.min(75, Math.floor(coins / XP_PER_LEVEL) + 1);
      const xpIn     = coins % XP_PER_LEVEL;
      const pct      = Math.round(xpIn / XP_PER_LEVEL * 100);
      const rankData = getRankData(lvl);
      const R        = getRanks();
      const nextRank = R ? R.getRank(lvl + 1) : null;
      const isMax    = lvl >= 75;

      _tt = document.createElement('div');
      _tt.id = 'lvl-tooltip';
      _tt.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.3rem">${rankData.emoji}</span>
          <div>
            <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:#fff">${rankData.name}</div>
            <div style="font-size:.65rem;color:${rankData.color};font-weight:900;opacity:.8">${rankData.tier}</div>
          </div>
        </div>
        <div style="font-size:.73rem;color:rgba(255,255,255,.5);margin-bottom:5px">Level <strong>${lvl}</strong> · ${xpIn.toLocaleString()} / ${XP_PER_LEVEL} XP</div>
        <div style="background:rgba(255,255,255,.06);border-radius:99px;height:5px;overflow:hidden;margin-bottom:5px">
          <div style="height:100%;width:${pct}%;background:${rankData.color};border-radius:99px;transition:width .8s ease;box-shadow:0 0 6px ${rankData.glow}"></div>
        </div>
        ${isMax
          ? `<div style="color:${rankData.color};font-weight:900;font-size:.72rem">👑 MAX RANK ACHIEVED</div>`
          : `<div style="font-size:.68rem;opacity:.65">${(XP_PER_LEVEL - xpIn).toLocaleString()} XP to ${nextRank ? nextRank.name : 'next rank'}</div>`
        }
      `;
      _badge.appendChild(_tt);
      const close = () => { _tt?.remove(); _tt = null; document.removeEventListener('click', close); };
      setTimeout(() => document.addEventListener('click', close, { once:true }), 50);
    });

    const avatar = topbarRight.querySelector('.tb-avatar');
    topbarRight.insertBefore(_badge, avatar || null);

    updateBadge(true);
  }

  function updateBadge(initial = false) {
    if (!_badge) return;
    const u = getUser();
    if (!u) return;
    const coins    = u.coins || 0;
    const lvl      = Math.min(75, Math.floor(coins / XP_PER_LEVEL) + 1);
    const xpIn     = coins % XP_PER_LEVEL;
    const pct      = Math.round(xpIn / XP_PER_LEVEL * 100);
    const rankData = getRankData(lvl);

    if (!initial && lvl === _lastLvl && pct === _lastPct) return;

    /* Level-up burst */
    if (!initial && lvl > _lastLvl && _lastLvl !== -1) {
      _badge.classList.remove('lvl-up');
      void _badge.offsetWidth;
      _badge.classList.add('lvl-up');
      _badge.style.boxShadow = `0 0 24px ${rankData.glow}`;
      setTimeout(() => { _badge.style.boxShadow = ''; _badge.classList.remove('lvl-up'); }, 800);
      /* Toast the new rank name */
      if (window.EyloxToast) window.EyloxToast(`${rankData.emoji} Rank Up! ${rankData.name}`, 'success', 4000);
    }

    _lastLvl = lvl;
    _lastPct = pct;

    _badge.innerHTML = buildBadgeHTML(lvl, pct, rankData);
    _badge.style.borderColor = `${rankData.color}44`;

    /* Godspeed glow */
    _badge.classList.toggle('is-godspeed', rankData.tier === 'GODSPEED');

    /* Near level-up glow */
    if (pct >= 90 && rankData.tier !== 'GODSPEED') {
      _badge.style.boxShadow = `0 0 14px ${rankData.glow}`;
      _badge.title = `${rankData.name} · ${100-pct}% to level up!`;
    } else {
      _badge.style.boxShadow = '';
      _badge.title = `${rankData.name} · Level ${lvl} · ${pct}% XP`;
    }
  }

  /* ── Boot ── */
  function boot() {
    injectBadge();
    setInterval(() => updateBadge(), 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }

  window.addEventListener('storage', e => {
    if (e.key === 'eylox_user') updateBadge();
  });

})();
