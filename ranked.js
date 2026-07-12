/* ============================================================
   EYLOX — Ranked Match System v1.0
   - ELO rating (starting 1000)
   - Rank tiers: Bronze → Silver → Gold → Plat → Diamond → Champion
   - Match history, win/loss streaks
   - Seasonal rankings with localStorage
   ============================================================ */
'use strict';

(function EyloxRanked() {

  /* ── Rank tiers ── */
  const TIERS = [
    { name: 'Bronze',    minElo: 0,    color: '#cd7f32', emoji: '🥉', glow: 'rgba(205,127,50,.3)' },
    { name: 'Silver',    minElo: 1100, color: '#c0c0c0', emoji: '🥈', glow: 'rgba(192,192,192,.3)' },
    { name: 'Gold',      minElo: 1300, color: '#ffd700', emoji: '🥇', glow: 'rgba(255,215,0,.35)' },
    { name: 'Platinum',  minElo: 1500, color: '#4db6ac', emoji: '💎', glow: 'rgba(77,182,172,.35)' },
    { name: 'Diamond',   minElo: 1700, color: '#60a5fa', emoji: '💠', glow: 'rgba(96,165,250,.4)' },
    { name: 'Champion',  minElo: 1900, color: '#a78bfa', emoji: '👑', glow: 'rgba(167,139,250,.5)' },
  ];

  const K_FACTOR = 32; /* ELO K-factor */
  const WIN_ELO_BASE  = 25;
  const LOSS_ELO_BASE = -18;

  /* ── State ── */
  function loadState() {
    try { return JSON.parse(localStorage.getItem('eylox_ranked') || 'null') || _defaultState(); } catch { return _defaultState(); }
  }
  function _defaultState() {
    return { elo: 1000, wins: 0, losses: 0, streak: 0, bestStreak: 0, matches: [], season: 1, peakElo: 1000, placement: false };
  }
  function saveState(s) {
    try { localStorage.setItem('eylox_ranked', JSON.stringify(s)); } catch {}
  }

  /* ── ELO calculation ── */
  function calcEloChange(myElo, oppElo, won) {
    const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
    return Math.round(K_FACTOR * ((won ? 1 : 0) - expected));
  }

  /* ── Get tier from ELO ── */
  function getTier(elo) {
    return [...TIERS].reverse().find(t => elo >= t.minElo) || TIERS[0];
  }

  /* ── Get progress within tier (0–100) ── */
  function getTierProgress(elo) {
    const tier = getTier(elo);
    const idx  = TIERS.indexOf(tier);
    const next = TIERS[idx + 1];
    if (!next) return 100;
    const range = next.minElo - tier.minElo;
    const prog  = elo - tier.minElo;
    return Math.min(100, Math.max(0, Math.round((prog / range) * 100)));
  }

  /* ── Simulate opponent ── */
  function genOpponent(myElo) {
    const variance = 150 + Math.random() * 200;
    const oppElo   = Math.max(800, Math.round(myElo + (Math.random() - 0.5) * variance));
    const names    = ['PixelKnight','StarDancer','NightOwl','CryptoFox','BladeRunner','GhostHawk','NeonStar','IronWolf','CyberLink','VoidWalker','SkyBandit','AceRacer'];
    return { elo: oppElo, name: names[Math.floor(Math.random() * names.length)] + '#' + Math.floor(1000 + Math.random() * 9000), tier: getTier(oppElo) };
  }

  /* ── Record match result ── */
  function recordMatch(won, gameId, score) {
    const state = loadState();
    const opp   = genOpponent(state.elo);
    const delta = calcEloChange(state.elo, opp.elo, won);

    state.elo      = Math.max(100, state.elo + delta);
    state.peakElo  = Math.max(state.peakElo, state.elo);
    if (won) { state.wins++; state.streak = Math.max(0, state.streak) + 1; }
    else     { state.losses++; state.streak = Math.min(0, state.streak) - 1; }
    state.bestStreak = Math.max(state.bestStreak, state.streak);

    const match = {
      ts: Date.now(), won, delta, newElo: state.elo,
      opponent: opp, gameId, score,
      tier: getTier(state.elo).name,
    };
    state.matches.unshift(match);
    if (state.matches.length > 50) state.matches.pop();
    saveState(state);

    /* Update user coins for ranked win */
    if (won) {
      try {
        const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
        if (u) { u.coins = (u.coins || 0) + 50; u.wins = (u.wins || 0) + 1; localStorage.setItem('eylox_user', JSON.stringify(u)); }
      } catch {}
    }

    /* Show rank-up notification */
    const prevTier = getTier(state.elo - delta).name;
    const newTier  = getTier(state.elo).name;
    if (prevTier !== newTier && state.elo > state.elo - delta) {
      setTimeout(() => showRankUp(newTier), 500);
    }

    return { match, state, tier: getTier(state.elo), progress: getTierProgress(state.elo) };
  }

  /* ── Show rank-up celebration ── */
  function showRankUp(tierName) {
    const tier = TIERS.find(t => t.name === tierName);
    if (!tier) return;
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;inset:0;z-index:99999;pointer-events:none;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.7);animation:fadeInOut 3s ease forwards;
    `;
    el.innerHTML = `
      <div style="text-align:center;animation:scaleIn .4s cubic-bezier(.34,1.56,.64,1) both">
        <div style="font-size:5rem;filter:drop-shadow(0 0 20px ${tier.glow})">${tier.emoji}</div>
        <div style="font-family:'Fredoka One',cursive;font-size:2.2rem;color:${tier.color};text-shadow:0 0 30px ${tier.glow};margin-top:8px">RANK UP!</div>
        <div style="font-size:1.4rem;color:#fff;font-weight:800;margin-top:4px">${tier.emoji} ${tier.name}</div>
        <div style="color:rgba(255,255,255,.5);font-size:.9rem;margin-top:8px">You've reached ${tier.name} rank!</div>
      </div>`;
    if (!document.getElementById('rankup-style')) {
      const s = document.createElement('style');
      s.id = 'rankup-style';
      s.textContent = '@keyframes fadeInOut{0%{opacity:0}15%{opacity:1}75%{opacity:1}100%{opacity:0}}@keyframes scaleIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
    if (window.EyloxToast) EyloxToast(`${tier.emoji} Rank Up! You're now ${tier.name}!`, 'success', 4000);
  }

  /* ── Matchmaking queue UI ── */
  let _queueTimer = null;
  function enterQueue(onMatch) {
    const state    = loadState();
    const oppTime  = 2000 + Math.random() * 3000;
    clearTimeout(_queueTimer);
    _queueTimer = setTimeout(() => {
      const opp = genOpponent(state.elo);
      onMatch(opp);
    }, oppTime);
    return () => clearTimeout(_queueTimer); /* cancel fn */
  }

  /* ── Inject Ranked HUD badge into topbar ── */
  function injectRankedBadge() {
    if (document.getElementById('tb-ranked-badge')) return;
    const state  = loadState();
    const tier   = getTier(state.elo);
    const coinsEl = document.querySelector('.tb-coins, #topbarCoins');
    if (!coinsEl) return;
    const badge = document.createElement('div');
    badge.id    = 'tb-ranked-badge';
    badge.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:1px;cursor:pointer;
    `;
    badge.innerHTML = `
      <div style="background:linear-gradient(135deg,rgba(167,139,250,.15),rgba(124,58,237,.1));border:1px solid rgba(167,139,250,.25);border-radius:99px;padding:3px 10px;font-size:.75rem;font-weight:800;color:${tier.color};white-space:nowrap;line-height:1.3;filter:drop-shadow(0 0 6px ${tier.glow})">${tier.emoji} ${tier.name}</div>
      <div style="font-size:.58rem;color:rgba(167,139,250,.4);font-weight:700">${state.elo} ELO</div>
    `;
    badge.title = `Ranked: ${tier.name} — ${state.elo} ELO (${state.wins}W/${state.losses}L)`;
    badge.addEventListener('click', () => window.location.href = 'leaderboard.html');
    const ref = document.getElementById('topbarLevel') || coinsEl.parentNode;
    ref.parentNode?.insertBefore(badge, ref);
    /* CSS */
    if (!document.getElementById('ranked-badge-css')) {
      const s = document.createElement('style');
      s.id = 'ranked-badge-css';
      s.textContent = `#tb-ranked-badge:hover > div:first-child { filter: brightness(1.2) drop-shadow(0 0 10px ${tier.glow}) !important; }`;
      document.head.appendChild(s);
    }
  }

  /* ── Leaderboard data ── */
  function getLeaderboard() {
    const state = loadState();
    const user  = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; } })();
    /* Simulate other players around the user's ELO */
    const base  = state.elo;
    const fakes = [
      { rank:1, username:'EyloxMaster',  elo: base+400+Math.floor(Math.random()*200), tier: getTier(base+400) },
      { rank:2, username:'ProGamer99',   elo: base+280+Math.floor(Math.random()*100), tier: getTier(base+280) },
      { rank:3, username:'StarHunter',   elo: base+180+Math.floor(Math.random()*80),  tier: getTier(base+180) },
      { rank:4, username:'NightWolf',    elo: base+90+Math.floor(Math.random()*60),   tier: getTier(base+90) },
      { rank:5, username: user.username || 'You', elo: base, tier: getTier(base), isMe: true },
      { rank:6, username:'BladeRush',    elo: Math.max(800,base-80),  tier: getTier(Math.max(800,base-80)) },
      { rank:7, username:'PixelStorm',   elo: Math.max(800,base-160), tier: getTier(Math.max(800,base-160)) },
      { rank:8, username:'IronWing',     elo: Math.max(800,base-240), tier: getTier(Math.max(800,base-240)) },
    ];
    return fakes;
  }

  /* ── Expose API ── */
  window.EyloxRanked = {
    getState:       loadState,
    getTier,
    getTierProgress,
    getTiers:       () => TIERS,
    recordMatch,
    enterQueue,
    getLeaderboard,
    showRankUp,
  };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    injectRankedBadge();
    /* Poll for ELO changes */
    setInterval(injectRankedBadge, 10000);
  });

})();
