/* ============================================================
   EYLOX — Season Pass v1.0
   Battle pass with 30 levels, free + premium rewards,
   XP progress, animated UI, and auto-claim on level-up
   ============================================================ */
'use strict';

(function EyloxSeasonPass() {

  const SP_KEY       = 'eylox_season_pass';
  const SEASON_NUM   = 3;
  const TOTAL_LEVELS = 30;
  const XP_PER_LEVEL = 1000;

  /* ── Season Pass State ── */
  function getState() {
    try {
      const raw = localStorage.getItem(SP_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      season: SEASON_NUM,
      xp: 0,
      level: 0,
      isPremium: false,
      claimed: {},     // { "free_5": true, "premium_12": true }
    };
  }

  function saveState(state) {
    localStorage.setItem(SP_KEY, JSON.stringify(state));
  }

  function addXP(amount) {
    const state = getState();
    state.xp = (state.xp || 0) + amount;
    let leveled = false;
    while (state.xp >= XP_PER_LEVEL && state.level < TOTAL_LEVELS) {
      state.xp -= XP_PER_LEVEL;
      state.level++;
      leveled = true;
      autoClaimRewards(state);
    }
    if (state.level >= TOTAL_LEVELS) state.xp = 0;
    saveState(state);
    if (leveled) refreshPanel();
    return state;
  }

  function unlockPremium() {
    const state = getState();
    state.isPremium = true;
    saveState(state);
    autoClaimRewards(state);
    return state;
  }

  function autoClaimRewards(state) {
    for (let lvl = 1; lvl <= state.level; lvl++) {
      const freeKey = `free_${lvl}`;
      if (!state.claimed[freeKey]) {
        state.claimed[freeKey] = true;
        grantReward(REWARDS[lvl - 1]?.free);
      }
      if (state.isPremium) {
        const premKey = `premium_${lvl}`;
        if (!state.claimed[premKey]) {
          state.claimed[premKey] = true;
          grantReward(REWARDS[lvl - 1]?.premium);
        }
      }
    }
  }

  function claimReward(track, level) {
    const state = getState();
    if (level > state.level) return false;
    if (track === 'premium' && !state.isPremium) return false;
    const key = `${track}_${level}`;
    if (state.claimed[key]) return false;
    state.claimed[key] = true;
    grantReward(REWARDS[level - 1]?.[track]);
    saveState(state);
    refreshPanel();
    return true;
  }

  function grantReward(reward) {
    if (!reward) return;
    try {
      const user = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (user) {
        if (reward.coins) user.coins = (user.coins || 0) + reward.coins;
        if (reward.gems)  user.gems  = (user.gems  || 0) + reward.gems;
        if (reward.xp)    user.xp    = (user.xp    || 0) + reward.xp;
        localStorage.setItem('eylox_user', JSON.stringify(user));
      }
    } catch {}
  }

  /* ── Reward Definitions (30 levels) ── */
  const REWARDS = [
    // Level 1
    { free: { type:'Eylux',   label:'50 Coins',      icon:'🪙', coins:50 },
      premium: { type:'skin',  label:'Neon Gloves',   icon:'🧤', rarity:'rare' } },
    // Level 2
    { free: { type:'xp',     label:'+200 XP Boost',  icon:'⭐', xp:200 },
      premium: { type:'Eylux', label:'150 Coins',     icon:'🪙', coins:150 } },
    // Level 3
    { free: { type:'Eylux',  label:'100 Coins',       icon:'🪙', coins:100 },
      premium: { type:'emote', label:'Victory Dance',  icon:'💃', rarity:'rare' } },
    // Level 4
    { free: { type:'xp',     label:'+500 XP Boost',  icon:'⭐', xp:500 },
      premium: { type:'gems',  label:'10 Gems',        icon:'💎', gems:10 } },
    // Level 5
    { free: { type:'badge',  label:'Season 3 Badge',  icon:'🏅', rarity:'common' },
      premium: { type:'skin',  label:'Cyber Suit',     icon:'🦾', rarity:'epic' } },
    // Level 6
    { free: { type:'Eylux',  label:'200 Coins',       icon:'🪙', coins:200 },
      premium: { type:'Eylux', label:'300 Coins',      icon:'🪙', coins:300 } },
    // Level 7
    { free: { type:'emote',  label:'Cool Wave',       icon:'👋', rarity:'common' },
      premium: { type:'effect', label:'Purple Aura',   icon:'✨', rarity:'rare' } },
    // Level 8
    { free: { type:'xp',     label:'+1000 XP Boost', icon:'⭐', xp:1000 },
      premium: { type:'skin',  label:'Galaxy Hood',    icon:'🌌', rarity:'epic' } },
    // Level 9
    { free: { type:'Eylux',  label:'300 Coins',       icon:'🪙', coins:300 },
      premium: { type:'gems',  label:'25 Gems',        icon:'💎', gems:25 } },
    // Level 10
    { free: { type:'banner', label:'Season Banner',   icon:'🚩', rarity:'rare' },
      premium: { type:'skin',  label:'Legendary Mask', icon:'👺', rarity:'legendary' } },
    // Level 11
    { free: { type:'Eylux',  label:'250 Coins',       icon:'🪙', coins:250 },
      premium: { type:'emote', label:'Power Slide',    icon:'⚡', rarity:'rare' } },
    // Level 12
    { free: { type:'xp',     label:'+800 XP Boost',  icon:'⭐', xp:800 },
      premium: { type:'effect', label:'Fire Trail',    icon:'🔥', rarity:'epic' } },
    // Level 13
    { free: { type:'Eylux',  label:'400 Coins',       icon:'🪙', coins:400 },
      premium: { type:'Eylux', label:'500 Coins',      icon:'🪙', coins:500 } },
    // Level 14
    { free: { type:'emote',  label:'Flex',            icon:'💪', rarity:'common' },
      premium: { type:'skin',  label:'Shadow Cloak',   icon:'🦇', rarity:'epic' } },
    // Level 15
    { free: { type:'badge',  label:'Halfway Badge',   icon:'🎯', rarity:'rare' },
      premium: { type:'gems',  label:'50 Gems',        icon:'💎', gems:50 } },
    // Level 16
    { free: { type:'Eylux',  label:'350 Coins',       icon:'🪙', coins:350 },
      premium: { type:'effect', label:'Lightning Aura', icon:'⚡', rarity:'legendary' } },
    // Level 17
    { free: { type:'xp',     label:'+1500 XP Boost', icon:'⭐', xp:1500 },
      premium: { type:'skin',  label:'Dragon Armor',   icon:'🐲', rarity:'legendary' } },
    // Level 18
    { free: { type:'Eylux',  label:'500 Coins',       icon:'🪙', coins:500 },
      premium: { type:'Eylux', label:'700 Coins',      icon:'🪙', coins:700 } },
    // Level 19
    { free: { type:'emote',  label:'Celebration',     icon:'🎊', rarity:'rare' },
      premium: { type:'effect', label:'Snowstorm',     icon:'❄️', rarity:'epic' } },
    // Level 20
    { free: { type:'banner', label:'Elite Banner',    icon:'👑', rarity:'epic' },
      premium: { type:'skin',  label:'Phoenix Wings',  icon:'🦅', rarity:'legendary' } },
    // Level 21
    { free: { type:'Eylux',  label:'600 Coins',       icon:'🪙', coins:600 },
      premium: { type:'gems',  label:'75 Gems',        icon:'💎', gems:75 } },
    // Level 22
    { free: { type:'xp',     label:'+2000 XP Boost', icon:'⭐', xp:2000 },
      premium: { type:'emote', label:'Royal Bow',      icon:'🎭', rarity:'epic' } },
    // Level 23
    { free: { type:'Eylux',  label:'700 Coins',       icon:'🪙', coins:700 },
      premium: { type:'effect', label:'Galaxy Trail',  icon:'🌌', rarity:'legendary' } },
    // Level 24
    { free: { type:'emote',  label:'Champion',        icon:'🏆', rarity:'rare' },
      premium: { type:'skin',  label:'Void Knight',    icon:'🖤', rarity:'legendary' } },
    // Level 25
    { free: { type:'badge',  label:'Season 3 Elite',  icon:'💫', rarity:'legendary' },
      premium: { type:'Eylux', label:'1000 Coins',     icon:'🪙', coins:1000 } },
    // Level 26
    { free: { type:'Eylux',  label:'800 Coins',       icon:'🪙', coins:800 },
      premium: { type:'gems',  label:'100 Gems',       icon:'💎', gems:100 } },
    // Level 27
    { free: { type:'xp',     label:'+3000 XP Boost', icon:'⭐', xp:3000 },
      premium: { type:'effect', label:'Aurora Crown',  icon:'🌈', rarity:'legendary' } },
    // Level 28
    { free: { type:'Eylux',  label:'1000 Coins',      icon:'🪙', coins:1000 },
      premium: { type:'skin',  label:'Celestial God',  icon:'✨', rarity:'legendary' } },
    // Level 29
    { free: { type:'emote',  label:'Grand Finale',    icon:'🎆', rarity:'legendary' },
      premium: { type:'gems',  label:'200 Gems',       icon:'💎', gems:200 } },
    // Level 30
    { free: { type:'banner', label:'Legend Banner',   icon:'🏆', rarity:'legendary' },
      premium: { type:'skin',  label:'Season 3 Skin',  icon:'👾', rarity:'legendary' } },
  ];

  const RARITY_COLORS = {
    common: '#9d9d9d', rare: '#4fc3f7', epic: '#a78bfa', legendary: '#fbbf24'
  };

  /* ── Inject Styles ── */
  function injectStyles() {
    if (document.getElementById('sp-css')) return;
    const s = document.createElement('style');
    s.id = 'sp-css';
    s.textContent = `
      @keyframes spFadeIn   { from{opacity:0} to{opacity:1} }
      @keyframes spSlideUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
      @keyframes spShine    { 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes spBounce   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
      @keyframes spFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      @keyframes spPulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
      @keyframes spGlow     { 0%,100%{box-shadow:0 0 8px rgba(167,139,250,.4)} 50%{box-shadow:0 0 20px rgba(167,139,250,.9)} }
      @keyframes spConfetti {
        0%   { transform:translateY(-20px) rotate(0deg);   opacity:1; }
        100% { transform:translateY(80px)  rotate(720deg); opacity:0; }
      }
      #sp-overlay { animation:spFadeIn .2s ease; }
      #sp-overlay .sp-inner { animation:spSlideUp .35s cubic-bezier(.34,1.56,.64,1); }
      .sp-reward-card {
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        padding:10px 6px; border-radius:12px; border:1.5px solid; cursor:pointer;
        transition:all .2s; min-width:70px; max-width:90px; position:relative; overflow:hidden;
        flex-shrink:0;
      }
      .sp-reward-card:hover { transform:translateY(-3px); }
      .sp-reward-card.claimable { animation:spGlow .8s ease infinite; }
      .sp-reward-card.claimed { opacity:.55; }
      .sp-reward-card.locked { opacity:.4; cursor:default; }
      .sp-claim-btn {
        padding:4px 10px; border-radius:99px; border:none; cursor:pointer;
        font-size:.62rem; font-weight:900; transition:all .15s;
        background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff;
        margin-top:4px; white-space:nowrap;
      }
      .sp-claim-btn:hover { transform:scale(1.08); }
      .sp-xp-bar {
        height:12px; border-radius:99px; overflow:hidden;
        background:rgba(255,255,255,.08); position:relative;
      }
      .sp-xp-fill {
        height:100%; border-radius:99px;
        background:linear-gradient(90deg,#a78bfa,#60a5fa,#4ade80);
        background-size:200% auto;
        animation:spShine 3s linear infinite;
        transition:width .6s cubic-bezier(.34,1.56,.64,1);
      }
      .sp-track-label {
        font-size:.65rem; font-weight:900; text-transform:uppercase;
        letter-spacing:.06em; padding:3px 10px; border-radius:99px;
      }
      .sp-reward-scroll {
        display:flex; gap:8px; overflow-x:auto; padding:8px 4px;
        scrollbar-width:thin; scrollbar-color:rgba(167,139,250,.2) transparent;
        scroll-snap-type:x mandatory;
      }
      .sp-reward-scroll::-webkit-scrollbar { height:4px; }
      .sp-reward-scroll::-webkit-scrollbar-track { background:transparent; }
      .sp-reward-scroll::-webkit-scrollbar-thumb { background:rgba(167,139,250,.3); border-radius:99px; }
      .sp-level-num {
        font-size:.58rem; font-weight:900; color:rgba(167,139,250,.45);
        text-align:center; margin-bottom:4px;
      }
      .sp-legendary-shine::after {
        content:''; position:absolute; inset:0;
        background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%);
        animation:spShine 2s linear infinite; background-size:200% auto;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Build Modal ── */
  function openSeasonPass() {
    if (document.getElementById('sp-overlay')) return;
    injectStyles();
    const state = getState();

    const overlay = document.createElement('div');
    overlay.id = 'sp-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,1,8,.94);z-index:99990;display:flex;align-items:center;justify-content:center;padding:12px;backdrop-filter:blur(6px)';

    overlay.innerHTML = buildModal(state);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeSeasonPass();
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    scrollToCurrentLevel(state.level);
  }

  function buildModal(state) {
    const xpPct = Math.min(100, Math.round((state.xp / XP_PER_LEVEL) * 100));
    const totalXPNeeded = TOTAL_LEVELS * XP_PER_LEVEL;
    const totalXPEarned = Math.min(state.level * XP_PER_LEVEL + state.xp, totalXPNeeded);
    const overallPct = Math.round((totalXPEarned / totalXPNeeded) * 100);

    return `
      <div class="sp-inner" style="background:linear-gradient(160deg,#0c0520 0%,#07030f 100%);border:1px solid rgba(167,139,250,.25);border-radius:24px;width:100%;max-width:780px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,.8),0 0 80px rgba(124,58,237,.1)">

        <!-- HEADER -->
        <div style="padding:22px 24px 18px;border-bottom:1px solid rgba(167,139,250,.1);flex-shrink:0;background:linear-gradient(135deg,rgba(124,58,237,.25) 0%,rgba(79,195,247,.08) 100%);border-radius:24px 24px 0 0;position:relative;overflow:hidden">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(124,58,237,.2) 0%,transparent 60%);pointer-events:none"></div>

          <button onclick="closeSeasonPass()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.5);border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:.9rem;z-index:1">✕</button>

          <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;position:relative">
            <div style="font-size:2.8rem;animation:spFloat 3s ease-in-out infinite">🎮</div>
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);border-radius:99px;padding:3px 12px;font-size:.65rem;font-weight:900;letter-spacing:1px;color:#a78bfa;margin-bottom:6px">
                ✦ SEASON ${SEASON_NUM} PASS
              </div>
              <div style="font-family:'Fredoka One',cursive;font-size:1.6rem;background:linear-gradient(135deg,#a78bfa,#60a5fa,#4ade80);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1">
                Season ${SEASON_NUM}: Neon Eclipse
              </div>
              <div style="font-size:.78rem;color:rgba(200,190,230,.55);font-weight:700;margin-top:2px">
                Complete challenges · Earn XP · Unlock rewards
              </div>
            </div>
          </div>

          <!-- Level & XP Progress -->
          <div style="display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin-bottom:10px">
            <div style="text-align:center">
              <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#a78bfa;line-height:1">${state.level}</div>
              <div style="font-size:.6rem;color:rgba(167,139,250,.45);font-weight:800">LEVEL</div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:.65rem;color:rgba(167,139,250,.4);margin-bottom:6px">
                <span>Level ${state.level} → ${state.level + 1 <= TOTAL_LEVELS ? state.level + 1 : 'MAX'}</span>
                <span>${state.xp} / ${XP_PER_LEVEL} XP</span>
              </div>
              <div class="sp-xp-bar">
                <div class="sp-xp-fill" id="sp-current-fill" style="width:${xpPct}%"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:.58rem;color:rgba(167,139,250,.3);margin-top:4px">
                <span>Overall: ${overallPct}% complete</span>
                <span>${TOTAL_LEVELS - state.level} levels remaining</span>
              </div>
            </div>
            <div style="text-align:center">
              <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#fbbf24;line-height:1">30</div>
              <div style="font-size:.6rem;color:rgba(251,191,36,.45);font-weight:800">MAX</div>
            </div>
          </div>

          <!-- Premium Badge -->
          ${state.isPremium
            ? '<div style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.08));border:1px solid rgba(251,191,36,.35);border-radius:99px;padding:4px 14px;font-size:.7rem;font-weight:900;color:#fbbf24">👑 PREMIUM PASS ACTIVE</div>'
            : `<button onclick="EyloxSeasonPass._buyPremium()" style="background:linear-gradient(135deg,#d97706,#fbbf24,#d97706);background-size:200% auto;animation:spShine 3s linear infinite;border:none;border-radius:99px;padding:6px 20px;color:#000;font-weight:900;font-size:.78rem;cursor:pointer;box-shadow:0 4px 16px rgba(251,191,36,.4)">👑 Unlock Premium Pass — 800 Coins</button>`
          }
        </div>

        <!-- REWARD TRACKS -->
        <div style="overflow-y:auto;flex:1;padding:16px 20px;scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.2) transparent">

          <!-- Track Labels -->
          <div style="display:flex;gap:10px;margin-bottom:12px;align-items:center">
            <div style="display:flex;gap:8px;align-items:center">
              <div class="sp-track-label" style="background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.25);color:#60a5fa">FREE</div>
              <div class="sp-track-label" style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:#fbbf24">👑 PREMIUM</div>
            </div>
            <div style="flex:1;height:1px;background:rgba(167,139,250,.1)"></div>
            <div style="font-size:.65rem;color:rgba(167,139,250,.35);font-weight:800">Scroll to see all 30 levels →</div>
          </div>

          <!-- Free Track -->
          <div style="margin-bottom:16px">
            <div style="font-size:.68rem;color:rgba(96,165,250,.6);font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;display:flex;align-items:center;gap:6px">
              <div style="width:14px;height:2px;background:#60a5fa;border-radius:99px"></div>
              Free Track
            </div>
            <div class="sp-reward-scroll" id="sp-free-track">
              ${buildTrack(state, 'free')}
            </div>
          </div>

          <!-- Premium Track -->
          <div style="margin-bottom:16px">
            <div style="font-size:.68rem;color:rgba(251,191,36,.6);font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;display:flex;align-items:center;gap:6px">
              <div style="width:14px;height:2px;background:#fbbf24;border-radius:99px"></div>
              👑 Premium Track ${!state.isPremium ? '(Locked)' : ''}
            </div>
            <div class="sp-reward-scroll" id="sp-premium-track">
              ${buildTrack(state, 'premium')}
            </div>
          </div>

          <!-- Bonus Section -->
          <div style="background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.1);border-radius:16px;padding:16px 20px;margin-bottom:12px">
            <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:900;text-transform:uppercase;margin-bottom:12px">🚀 Earn XP Faster</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
              ${[
                ['🎮','Play Games','+50 XP per game'],
                ['🏆','Win Matches','+100 XP per win'],
                ['📅','Daily Login','+200 XP per day'],
                ['🤝','Add Friends','+150 XP per friend'],
                ['🌟','Complete Missions','+300 XP per mission'],
                ['💬','Clan Activity','+75 XP per day'],
              ].map(([icon,title,xp]) => `
                <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.1);border-radius:10px;padding:10px;text-align:center">
                  <div style="font-size:1.3rem;margin-bottom:4px">${icon}</div>
                  <div style="font-size:.7rem;font-weight:800;color:#e0d4ff;margin-bottom:2px">${title}</div>
                  <div style="font-size:.62rem;color:#a78bfa;font-weight:800">${xp}</div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Debug: Add XP (dev mode) -->
          <div style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:10px 14px;display:flex;gap:8px;align-items:center">
            <div style="font-size:.7rem;color:rgba(167,139,250,.35);font-weight:700;flex:1">Test Mode</div>
            <button onclick="EyloxSeasonPass._testAddXP(500)" style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:5px 10px;color:#a78bfa;font-size:.7rem;font-weight:800;cursor:pointer">+500 XP</button>
            <button onclick="EyloxSeasonPass._testAddXP(2000)" style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:5px 10px;color:#a78bfa;font-size:.7rem;font-weight:800;cursor:pointer">+2000 XP</button>
          </div>
        </div>

      </div>
    `;
  }

  function buildTrack(state, track) {
    return REWARDS.map((reward, i) => {
      const level = i + 1;
      const r = reward[track];
      if (!r) return '';

      const isPremiumTrack = track === 'premium';
      const isUnlocked = state.level >= level;
      const isClaimed = !!state.claimed[`${track}_${level}`];
      const canClaim = isUnlocked && !isClaimed && (!isPremiumTrack || state.isPremium);
      const isLocked = !isUnlocked || (isPremiumTrack && !state.isPremium);

      const rarity = r.rarity || 'common';
      const rarityColor = RARITY_COLORS[rarity] || '#a78bfa';
      const isLegendary = rarity === 'legendary';
      const isCurrent = state.level === level - 1 && !isUnlocked;

      let borderColor = isLocked ? 'rgba(100,100,120,.2)' : isClaimed ? 'rgba(74,222,128,.25)' : canClaim ? rarityColor : 'rgba(167,139,250,.15)';
      let bg = isLocked ? 'rgba(20,10,40,.6)' : isClaimed ? 'rgba(74,222,128,.06)' : canClaim ? `rgba(${rarityColor === '#fbbf24' ? '251,191,36' : rarityColor === '#a78bfa' ? '167,139,250' : rarityColor === '#4fc3f7' ? '79,195,247' : '167,139,250'},.1)` : 'rgba(167,139,250,.05)';

      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:0;scroll-snap-align:start">
          <div class="sp-level-num">LV.${level}</div>
          <div class="sp-reward-card ${canClaim ? 'claimable' : ''} ${isClaimed ? 'claimed' : ''} ${isLocked ? 'locked' : ''} ${isLegendary && !isLocked ? 'sp-legendary-shine' : ''}"
            data-level="${level}" data-track="${track}"
            style="border-color:${borderColor};background:${bg};${isCurrent ? 'border-style:dashed;border-color:rgba(167,139,250,.5)' : ''}"
            onclick="${canClaim ? `EyloxSeasonPass._claim('${track}',${level})` : ''}"
            title="${r.label}${isClaimed ? ' (Claimed)' : isLocked ? ' (Locked)' : canClaim ? ' — Click to claim!' : ''}"
          >
            ${isPremiumTrack && isLocked && !state.isPremium ? '<div style="position:absolute;top:2px;right:4px;font-size:.65rem">🔒</div>' : ''}
            ${isClaimed ? '<div style="position:absolute;top:2px;right:4px;font-size:.75rem">✅</div>' : ''}

            <div style="font-size:1.5rem;margin-bottom:3px;${isLocked ? 'filter:grayscale(70%)' : ''}">${r.icon}</div>
            <div style="font-size:.6rem;font-weight:800;text-align:center;color:${isLocked ? 'rgba(150,140,170,.4)' : rarity === 'legendary' ? '#fbbf24' : rarity === 'epic' ? '#a78bfa' : rarity === 'rare' ? '#4fc3f7' : '#9d9d9d'};max-width:68px;white-space:normal;line-height:1.2">${r.label}</div>

            ${rarity !== 'common' && !isLocked ? `<div style="font-size:.52rem;font-weight:900;color:${rarityColor};text-transform:uppercase;letter-spacing:.05em;margin-top:2px">${rarity}</div>` : ''}

            ${canClaim ? '<button class="sp-claim-btn">Claim!</button>' : ''}
          </div>

          ${level < TOTAL_LEVELS ? `<div style="width:2px;height:8px;background:linear-gradient(to bottom,rgba(167,139,250,.2),transparent);margin:0 auto"></div>` : ''}
        </div>
      `;
    }).join('');
  }

  function refreshPanel() {
    const overlay = document.getElementById('sp-overlay');
    if (!overlay) return;
    const state = getState();
    const inner = overlay.querySelector('.sp-inner');
    if (inner) {
      inner.outerHTML = buildModal(state).match(/<div class="sp-inner"[\s\S]*/)?.[0] || '';
      scrollToCurrentLevel(state.level);
    }
  }

  function scrollToCurrentLevel(level) {
    setTimeout(() => {
      const freeTrack = document.getElementById('sp-free-track');
      if (freeTrack) {
        const cards = freeTrack.querySelectorAll('.sp-reward-card');
        const targetIdx = Math.max(0, level - 1);
        if (cards[targetIdx]) {
          cards[targetIdx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 200);
  }

  function showClaimAnimation(card, reward) {
    const confetti = [];
    const colors = ['#a78bfa','#60a5fa','#4ade80','#fbbf24','#f472b6'];
    for (let i = 0; i < 12; i++) {
      const c = document.createElement('div');
      c.style.cssText = `position:fixed;width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]};pointer-events:none;z-index:99999;animation:spConfetti .8s ease forwards;left:${Math.random()*window.innerWidth}px;top:${Math.random()*window.innerHeight*0.5}px;animation-delay:${Math.random()*0.3}s`;
      document.body.appendChild(c);
      confetti.push(c);
    }
    setTimeout(() => confetti.forEach(c => c.remove()), 1200);

    toast(`✅ ${reward.label} claimed!`, 'success');
  }

  function closeSeasonPass() {
    const ov = document.getElementById('sp-overlay');
    if (!ov) return;
    ov.style.animation = 'spFadeIn .15s ease reverse forwards';
    setTimeout(() => { ov.remove(); document.body.style.overflow = ''; }, 150);
  }

  function toast(msg, type) {
    if (window.EyloxToast) { EyloxToast(msg, type, 2500); return; }
    const colors = { success:'#4ade80', warn:'#fde68a', info:'#60a5fa' };
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(8,2,22,.95);border:1px solid ${colors[type]||'#a78bfa'};color:#fff;padding:10px 22px;border-radius:99px;font-size:.82rem;font-weight:800;z-index:100000;animation:spFadeIn .3s ease both;white-space:nowrap;box-shadow:0 4px 24px rgba(0,0,0,.6)`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  /* ── Public API ── */
  window.EyloxSeasonPass = {
    open: openSeasonPass,
    close: closeSeasonPass,
    addXP,
    getState,

    _claim(track, level) {
      const success = claimReward(track, level);
      if (success) {
        const reward = REWARDS[level - 1]?.[track];
        const card = document.querySelector(`[data-level="${level}"][data-track="${track}"]`);
        if (card) showClaimAnimation(card, reward);
      }
    },
    _buyPremium() {
      const state = getState();
      const user = (() => { try { return JSON.parse(localStorage.getItem('eylox_user')||'null'); } catch { return null; } })();
      if (user && (user.coins || 0) < 800) {
        toast('Not enough coins! Need 800 coins.', 'warn'); return;
      }
      if (!confirm('Unlock Premium Pass for 800 Coins?')) return;
      if (user) { user.coins -= 800; localStorage.setItem('eylox_user', JSON.stringify(user)); }
      unlockPremium();
      toast('👑 Premium Pass activated! All premium rewards unlocked!', 'success');
      setTimeout(() => {
        const ov = document.getElementById('sp-overlay');
        if (ov) { ov.remove(); document.body.style.overflow = ''; setTimeout(openSeasonPass, 100); }
      }, 800);
    },
    _testAddXP(amount) {
      addXP(amount);
      toast(`+${amount} XP added!`, 'info');
      const ov = document.getElementById('sp-overlay');
      if (ov) {
        ov.remove(); document.body.style.overflow = '';
        setTimeout(openSeasonPass, 100);
      }
    },
  };

  window.openSeasonPass  = openSeasonPass;
  window.closeSeasonPass = closeSeasonPass;

  /* ── Auto-wire Season Pass buttons ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-season-pass],[data-open-season-pass],.open-season-pass');
      if (btn) { e.preventDefault(); openSeasonPass(); }
    });

    /* Award XP for game events */
    document.addEventListener('eylox:game:win',  () => addXP(100));
    document.addEventListener('eylox:game:play', () => addXP(50));
    document.addEventListener('eylox:daily:login', () => addXP(200));
    document.addEventListener('eylox:friend:added', () => addXP(150));
  });

})();
