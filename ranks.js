/* ============================================================
   EYLOX — Rank System
   75 named ranks across 20 tiers, mapped 1:1 to levels.
   Levels are derived from XP (coins).  XP_PER_LEVEL = 500.
   ============================================================ */
'use strict';

(function EyloxRanksSystem() {

  const XP_PER_LEVEL = 500;

  /* ── Full Rank Table ── */
  const RANKS = [
    /* ── Bronze Tier ── */
    { level:1,  name:'Bronze Core Alpha',       emoji:'🟤',        tier:'Bronze',     color:'#cd7f32', glow:'rgba(205,127,50,.55)' },
    { level:2,  name:'Bronze Core Beta',        emoji:'🟤⚡',      tier:'Bronze',     color:'#cd7f32', glow:'rgba(205,127,50,.55)' },
    { level:3,  name:'Bronze Core Omega',       emoji:'🟤👑',      tier:'Bronze',     color:'#cd7f32', glow:'rgba(205,127,50,.55)' },
    { level:4,  name:'Bronze Pulse Alpha',      emoji:'🟤🔥',      tier:'Bronze',     color:'#cd7f32', glow:'rgba(205,127,50,.55)' },
    { level:5,  name:'Bronze Pulse Beta',       emoji:'🟤⚡',      tier:'Bronze',     color:'#cd7f32', glow:'rgba(205,127,50,.55)' },
    { level:6,  name:'Bronze Pulse Omega',      emoji:'🟤👑',      tier:'Bronze',     color:'#cd7f32', glow:'rgba(205,127,50,.55)' },
    /* ── Silver Tier ── */
    { level:7,  name:'Silver Flux Alpha',       emoji:'⚪',        tier:'Silver',     color:'#c0c0c0', glow:'rgba(192,192,192,.55)' },
    { level:8,  name:'Silver Flux Beta',        emoji:'⚪⚡',      tier:'Silver',     color:'#c0c0c0', glow:'rgba(192,192,192,.55)' },
    { level:9,  name:'Silver Flux Omega',       emoji:'⚪👑',      tier:'Silver',     color:'#c0c0c0', glow:'rgba(192,192,192,.55)' },
    { level:10, name:'Silver Storm Alpha',      emoji:'🌪️',       tier:'Silver',     color:'#c0c0c0', glow:'rgba(192,192,192,.55)' },
    { level:11, name:'Silver Storm Beta',       emoji:'🌪️⚡',     tier:'Silver',     color:'#c0c0c0', glow:'rgba(192,192,192,.55)' },
    { level:12, name:'Silver Storm Omega',      emoji:'🌪️👑',     tier:'Silver',     color:'#c0c0c0', glow:'rgba(192,192,192,.55)' },
    /* ── Gold Tier ── */
    { level:13, name:'Gold Nova Alpha',         emoji:'🟡',        tier:'Gold',       color:'#ffd700', glow:'rgba(255,215,0,.6)' },
    { level:14, name:'Gold Nova Beta',          emoji:'🟡⚡',      tier:'Gold',       color:'#ffd700', glow:'rgba(255,215,0,.6)' },
    { level:15, name:'Gold Nova Omega',         emoji:'🟡👑',      tier:'Gold',       color:'#ffd700', glow:'rgba(255,215,0,.6)' },
    { level:16, name:'Gold Inferno Alpha',      emoji:'🔥',        tier:'Gold',       color:'#ffd700', glow:'rgba(255,215,0,.6)' },
    { level:17, name:'Gold Inferno Beta',       emoji:'🔥⚡',      tier:'Gold',       color:'#ffd700', glow:'rgba(255,215,0,.6)' },
    { level:18, name:'Gold Inferno Omega',      emoji:'🔥👑',      tier:'Gold',       color:'#ffd700', glow:'rgba(255,215,0,.6)' },
    /* ── Platinum Tier ── */
    { level:19, name:'Platinum Pulse Alpha',    emoji:'🔷',        tier:'Platinum',   color:'#e5e4e2', glow:'rgba(229,228,226,.55)' },
    { level:20, name:'Platinum Pulse Beta',     emoji:'🔷⚡',      tier:'Platinum',   color:'#e5e4e2', glow:'rgba(229,228,226,.55)' },
    { level:21, name:'Platinum Pulse Omega',    emoji:'🔷👑',      tier:'Platinum',   color:'#e5e4e2', glow:'rgba(229,228,226,.55)' },
    { level:22, name:'Platinum Phantom Alpha',  emoji:'👻',        tier:'Platinum',   color:'#e5e4e2', glow:'rgba(229,228,226,.55)' },
    { level:23, name:'Platinum Phantom Beta',   emoji:'👻⚡',      tier:'Platinum',   color:'#e5e4e2', glow:'rgba(229,228,226,.55)' },
    { level:24, name:'Platinum Phantom Omega',  emoji:'👻👑',      tier:'Platinum',   color:'#e5e4e2', glow:'rgba(229,228,226,.55)' },
    /* ── Diamond Tier ── */
    { level:25, name:'Diamond Vortex Alpha',    emoji:'💎',        tier:'Diamond',    color:'#b9f2ff', glow:'rgba(185,242,255,.6)' },
    { level:26, name:'Diamond Vortex Beta',     emoji:'💎⚡',      tier:'Diamond',    color:'#b9f2ff', glow:'rgba(185,242,255,.6)' },
    { level:27, name:'Diamond Vortex Omega',    emoji:'💎👑',      tier:'Diamond',    color:'#b9f2ff', glow:'rgba(185,242,255,.6)' },
    { level:28, name:'Diamond Eclipse Alpha',   emoji:'🌑',        tier:'Diamond',    color:'#b9f2ff', glow:'rgba(185,242,255,.6)' },
    { level:29, name:'Diamond Eclipse Beta',    emoji:'🌑⚡',      tier:'Diamond',    color:'#b9f2ff', glow:'rgba(185,242,255,.6)' },
    { level:30, name:'Diamond Eclipse Omega',   emoji:'🌑👑',      tier:'Diamond',    color:'#b9f2ff', glow:'rgba(185,242,255,.6)' },
    /* ── Crystal Tier ── */
    { level:31, name:'Crystal Zenith Alpha',    emoji:'❄️',        tier:'Crystal',    color:'#a0e8ff', glow:'rgba(160,232,255,.6)' },
    { level:32, name:'Crystal Zenith Beta',     emoji:'❄️⚡',      tier:'Crystal',    color:'#a0e8ff', glow:'rgba(160,232,255,.6)' },
    { level:33, name:'Crystal Zenith Omega',    emoji:'❄️👑',      tier:'Crystal',    color:'#a0e8ff', glow:'rgba(160,232,255,.6)' },
    /* ── Elite Tier ── */
    { level:34, name:'Elite Eylux Alpha',       emoji:'👑',        tier:'Elite',      color:'#f472b6', glow:'rgba(244,114,182,.6)' },
    { level:35, name:'Elite Eylux Beta',        emoji:'👑⚡',      tier:'Elite',      color:'#f472b6', glow:'rgba(244,114,182,.6)' },
    { level:36, name:'Elite Eylux Omega',       emoji:'👑🌌',      tier:'Elite',      color:'#f472b6', glow:'rgba(244,114,182,.6)' },
    /* ── Master Tier ── */
    { level:37, name:'Master Nebula Alpha',     emoji:'🌌',        tier:'Master',     color:'#818cf8', glow:'rgba(129,140,248,.6)' },
    { level:38, name:'Master Nebula Beta',      emoji:'🌌⚡',      tier:'Master',     color:'#818cf8', glow:'rgba(129,140,248,.6)' },
    { level:39, name:'Master Nebula Omega',     emoji:'🌌👑',      tier:'Master',     color:'#818cf8', glow:'rgba(129,140,248,.6)' },
    /* ── Titan Tier ── */
    { level:40, name:'Titan Surge Alpha',       emoji:'⚡',        tier:'Titan',      color:'#fbbf24', glow:'rgba(251,191,36,.6)' },
    { level:41, name:'Titan Surge Beta',        emoji:'⚡🔥',      tier:'Titan',      color:'#fbbf24', glow:'rgba(251,191,36,.6)' },
    { level:42, name:'Titan Surge Omega',       emoji:'⚡👑',      tier:'Titan',      color:'#fbbf24', glow:'rgba(251,191,36,.6)' },
    /* ── Mythic Tier ── */
    { level:43, name:'Mythic Glow Alpha',       emoji:'🌠',        tier:'Mythic',     color:'#c084fc', glow:'rgba(192,132,252,.6)' },
    { level:44, name:'Mythic Glow Beta',        emoji:'🌠⚡',      tier:'Mythic',     color:'#c084fc', glow:'rgba(192,132,252,.6)' },
    { level:45, name:'Mythic Glow Omega',       emoji:'🌠👑',      tier:'Mythic',     color:'#c084fc', glow:'rgba(192,132,252,.6)' },
    /* ── Legendary Tier ── */
    { level:46, name:'Legendary Nova Alpha',    emoji:'☄️',        tier:'Legendary',  color:'#f97316', glow:'rgba(249,115,22,.6)' },
    { level:47, name:'Legendary Nova Beta',     emoji:'☄️⚡',      tier:'Legendary',  color:'#f97316', glow:'rgba(249,115,22,.6)' },
    { level:48, name:'Legendary Nova Omega',    emoji:'☄️👑',      tier:'Legendary',  color:'#f97316', glow:'rgba(249,115,22,.6)' },
    /* ── Galactic Tier ── */
    { level:49, name:'Galactic Prime Alpha',    emoji:'🪐',        tier:'Galactic',   color:'#34d399', glow:'rgba(52,211,153,.6)' },
    { level:50, name:'Galactic Prime Beta',     emoji:'🪐⚡',      tier:'Galactic',   color:'#34d399', glow:'rgba(52,211,153,.6)' },
    { level:51, name:'Galactic Prime Omega',    emoji:'🪐👑',      tier:'Galactic',   color:'#34d399', glow:'rgba(52,211,153,.6)' },
    /* ── Cosmic Tier ── */
    { level:52, name:'Cosmic Eylox Alpha',      emoji:'🚀',        tier:'Cosmic',     color:'#2dd4bf', glow:'rgba(45,212,191,.6)' },
    { level:53, name:'Cosmic Eylox Beta',       emoji:'🚀⚡',      tier:'Cosmic',     color:'#2dd4bf', glow:'rgba(45,212,191,.6)' },
    { level:54, name:'Cosmic Eylox Omega',      emoji:'🚀👑',      tier:'Cosmic',     color:'#2dd4bf', glow:'rgba(45,212,191,.6)' },
    /* ── Universal Tier ── */
    { level:55, name:'Universal Crown Alpha',   emoji:'👑🌌',      tier:'Universal',  color:'#a78bfa', glow:'rgba(167,139,250,.65)' },
    { level:56, name:'Universal Crown Beta',    emoji:'👑⚡',      tier:'Universal',  color:'#a78bfa', glow:'rgba(167,139,250,.65)' },
    { level:57, name:'Universal Crown Omega',   emoji:'👑🔥',      tier:'Universal',  color:'#a78bfa', glow:'rgba(167,139,250,.65)' },
    /* ── Infinity Tier ── */
    { level:58, name:'Infinity Core Alpha',     emoji:'♾️',        tier:'Infinity',   color:'#e879f9', glow:'rgba(232,121,249,.65)' },
    { level:59, name:'Infinity Core Beta',      emoji:'♾️⚡',      tier:'Infinity',   color:'#e879f9', glow:'rgba(232,121,249,.65)' },
    { level:60, name:'Infinity Core Omega',     emoji:'♾️👑',      tier:'Infinity',   color:'#e879f9', glow:'rgba(232,121,249,.65)' },
    /* ── Eternal Tier ── */
    { level:61, name:'Eternal Lux Alpha',       emoji:'✨',        tier:'Eternal',    color:'#fde68a', glow:'rgba(253,230,138,.65)' },
    { level:62, name:'Eternal Lux Beta',        emoji:'✨⚡',      tier:'Eternal',    color:'#fde68a', glow:'rgba(253,230,138,.65)' },
    { level:63, name:'Eternal Lux Omega',       emoji:'✨👑',      tier:'Eternal',    color:'#fde68a', glow:'rgba(253,230,138,.65)' },
    /* ── Celestial Tier ── */
    { level:64, name:'Celestial Overlord Alpha',emoji:'🌟',        tier:'Celestial',  color:'#fbbf24', glow:'rgba(251,191,36,.7)' },
    { level:65, name:'Celestial Overlord Beta', emoji:'🌟⚡',      tier:'Celestial',  color:'#fbbf24', glow:'rgba(251,191,36,.7)' },
    { level:66, name:'Celestial Overlord Omega',emoji:'🌟👑',      tier:'Celestial',  color:'#fbbf24', glow:'rgba(251,191,36,.7)' },
    /* ── Void Tier ── */
    { level:67, name:'Void Emperor Alpha',      emoji:'🌑👑',      tier:'Void',       color:'#6366f1', glow:'rgba(99,102,241,.65)' },
    { level:68, name:'Void Emperor Beta',       emoji:'🌑⚡',      tier:'Void',       color:'#6366f1', glow:'rgba(99,102,241,.65)' },
    { level:69, name:'Void Emperor Omega',      emoji:'🌑🔥',      tier:'Void',       color:'#6366f1', glow:'rgba(99,102,241,.65)' },
    /* ── Omni Tier ── */
    { level:70, name:'Omni Legend Alpha',       emoji:'🔥',        tier:'Omni',       color:'#fb923c', glow:'rgba(251,146,60,.65)' },
    { level:71, name:'Omni Legend Beta',        emoji:'🔥⚡',      tier:'Omni',       color:'#fb923c', glow:'rgba(251,146,60,.65)' },
    { level:72, name:'Omni Legend Omega',       emoji:'🔥👑',      tier:'Omni',       color:'#fb923c', glow:'rgba(251,146,60,.65)' },
    /* ── Final Max Rank ── */
    { level:73, name:'Eylox Godspeed Alpha',    emoji:'⚡🚀',      tier:'GODSPEED',   color:'#f0abfc', glow:'rgba(240,171,252,.8)', isMax:false },
    { level:74, name:'Eylox Godspeed Beta',     emoji:'⚡🚀🔥',    tier:'GODSPEED',   color:'#f0abfc', glow:'rgba(240,171,252,.8)', isMax:false },
    { level:75, name:'Eylox Godspeed Omega',    emoji:'⚡🚀🌌',    tier:'GODSPEED',   color:'#f0abfc', glow:'rgba(240,171,252,.8)', isMax:true  },
  ];

  const MAX_RANK = RANKS[RANKS.length - 1];

  /* ── Get rank for a given level (capped at max) ── */
  function getRank(level) {
    if (level >= MAX_RANK.level) return MAX_RANK;
    return RANKS.find(r => r.level === level) || RANKS[0];
  }

  /* ── Get rank from XP (coins) ── */
  function getRankFromXP(xp) {
    const lvl = Math.min(MAX_RANK.level, Math.floor((xp || 0) / XP_PER_LEVEL) + 1);
    return getRank(lvl);
  }

  /* ── Get XP progress within current level ── */
  function getXPProgress(xp) {
    const lvl     = Math.min(MAX_RANK.level, Math.floor((xp || 0) / XP_PER_LEVEL) + 1);
    const xpIn    = (xp || 0) % XP_PER_LEVEL;
    const pct     = Math.round(xpIn / XP_PER_LEVEL * 100);
    const toNext  = XP_PER_LEVEL - xpIn;
    const isAtMax = lvl >= MAX_RANK.level;
    return { level: lvl, xpIn, pct, toNext, isAtMax };
  }

  /* ── Build rank card HTML (reusable) ── */
  function buildRankCard(rank, progress) {
    const { level, xpIn, pct, toNext, isAtMax } = progress;
    const circ  = 2 * Math.PI * 20;
    const offset = circ * (1 - pct / 100);
    const nextRank = getRank(level + 1);
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,.04);border:1px solid ${rank.color}33;border-radius:14px">
        <div style="font-size:1.8rem;flex-shrink:0">${rank.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.65rem;font-weight:900;color:${rank.color};opacity:.7;text-transform:uppercase;letter-spacing:.06em">${rank.tier}</div>
          <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${rank.name}</div>
          ${isAtMax ? `<div style="font-size:.65rem;color:${rank.color};margin-top:3px">MAX RANK 🏆</div>` : `
            <div style="margin-top:5px;background:rgba(255,255,255,.06);border-radius:99px;height:4px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${rank.color};border-radius:99px;transition:width .8s ease;box-shadow:0 0 6px ${rank.glow}"></div>
            </div>
            <div style="font-size:.6rem;color:rgba(255,255,255,.4);margin-top:3px">${xpIn.toLocaleString()} / ${XP_PER_LEVEL} XP · ${toNext.toLocaleString()} to ${nextRank.name}</div>
          `}
        </div>
        <div style="text-align:center;flex-shrink:0">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="3"/>
            <circle cx="24" cy="24" r="20" fill="none"
              stroke="${rank.color}" stroke-width="3" stroke-linecap="round"
              stroke-dasharray="${circ.toFixed(2)}"
              stroke-dashoffset="${offset.toFixed(2)}"
              transform="rotate(-90 24 24)"
              style="transition:stroke-dashoffset 1s ease;filter:drop-shadow(0 0 4px ${rank.glow})"/>
            <text x="24" y="29" text-anchor="middle" font-family="Fredoka One,cursive" font-size="14" fill="${rank.color}">${level}</text>
          </svg>
        </div>
      </div>
    `;
  }

  /* ── Inject rank CSS ── */
  function injectRankCSS() {
    if (document.getElementById('ranks-css')) return;
    const s = document.createElement('style');
    s.id = 'ranks-css';
    s.textContent = `
      @keyframes rankGlow { 0%,100%{opacity:.6} 50%{opacity:1} }
      .rank-godspeed-badge {
        background:linear-gradient(135deg,#7c3aed,#ec4899,#fbbf24);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
        background-clip:text;
        animation:rankGlow 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(s);
  }

  injectRankCSS();

  /* ── Public API ── */
  window.EyloxRanks = {
    RANKS,
    XP_PER_LEVEL,
    MAX_RANK,
    getRank,
    getRankFromXP,
    getXPProgress,
    buildRankCard,
  };

})();
