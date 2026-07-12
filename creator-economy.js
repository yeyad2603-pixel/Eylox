/* ============================================================
   EYLOX — Creator Economy v1.0
   Eylux + Premium Tokens, creator earnings, marketplace,
   daily reward streak, transparent payouts dashboard.
   ============================================================ */
'use strict';

(function EyloxEconomy() {

  const ECO_KEY        = 'eylox_economy';
  const MARKET_KEY     = 'eylox_marketplace';
  const COIN_TO_TOKEN  = 500;   /* 500 coins = 1 Premium Token */
  const TOKEN_PAYOUT   = 0.001; /* $0.001 per token (display only) */

  /* ── Economy state ── */
  function getEco() {
    const user = _user();
    if (!user.username) return null;
    try {
      const raw = localStorage.getItem(`${ECO_KEY}_${user.username}`);
      const defaults = {
        username: user.username,
        tokens: 0,
        tokensEarned: 0,
        tokensSpent: 0,
        coinsEarned: 0,
        creatorEarnings: 0,    /* tokens earned from others playing your games */
        transactions: [],      /* last 50 */
        dailyStreak: 0,
        lastClaimDate: null,
        streakRecord: 0,
        publishedGames: [],
        totalPlays: 0          /* plays on your published games */
      };
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch { return null; }
  }

  function saveEco(eco) {
    if (!eco?.username) return;
    localStorage.setItem(`${ECO_KEY}_${eco.username}`, JSON.stringify(eco));
  }

  function _user() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; }
  }

  /* ── Token operations ── */
  function addTokens(amount, reason) {
    const eco = getEco();
    if (!eco) return;
    eco.tokens += amount;
    eco.tokensEarned += amount;
    _logTx(eco, 'earn', amount, reason);
    saveEco(eco);
    _refreshWidget();
    document.dispatchEvent(new CustomEvent('eylox:eco:tokens', { detail: { amount, reason, eco } }));
  }

  function spendTokens(amount, reason) {
    const eco = getEco();
    if (!eco) return false;
    if (eco.tokens < amount) { _toast('Not enough Premium Tokens!', 'warn'); return false; }
    eco.tokens -= amount;
    eco.tokensSpent += amount;
    _logTx(eco, 'spend', -amount, reason);
    saveEco(eco);
    _refreshWidget();
    return true;
  }

  function convertCoinsToTokens(coins) {
    const user = _user();
    if ((user.coins || 0) < coins) { _toast('Not enough coins!', 'warn'); return false; }
    if (coins < COIN_TO_TOKEN) { _toast(`Minimum conversion: ${COIN_TO_TOKEN} coins`, 'warn'); return false; }
    const tokens = Math.floor(coins / COIN_TO_TOKEN);
    user.coins = (user.coins || 0) - (tokens * COIN_TO_TOKEN);
    localStorage.setItem('eylox_user', JSON.stringify(user));
    addTokens(tokens, `Converted ${tokens * COIN_TO_TOKEN} coins`);
    _toast(`✅ Converted → ${tokens} Premium Token${tokens !== 1 ? 's' : ''}!`, 'success');
    return true;
  }

  function _logTx(eco, type, amount, reason) {
    eco.transactions = [{
      type, amount, reason, date: Date.now(),
      balance: eco.tokens + amount
    }, ...eco.transactions].slice(0, 50);
  }

  /* ── Daily Reward Streak ── */
  const STREAK_REWARDS = [
    { day:1,  coins:50,   tokens:0, label:'Day 1' },
    { day:2,  coins:75,   tokens:0, label:'Day 2' },
    { day:3,  coins:100,  tokens:0, label:'Day 3' },
    { day:4,  coins:150,  tokens:0, label:'Day 4' },
    { day:5,  coins:200,  tokens:1, label:'Day 5 🎖️' },
    { day:6,  coins:250,  tokens:1, label:'Day 6' },
    { day:7,  coins:500,  tokens:3, label:'Day 7 👑 MEGA' },
  ];

  function claimDailyReward() {
    const eco = getEco();
    if (!eco) return;
    const today = new Date().toDateString();
    if (eco.lastClaimDate === today) { _toast('Daily reward already claimed today!', 'info'); return; }
    /* Check if streak continues (claimed yesterday) */
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (eco.lastClaimDate !== yesterday) eco.dailyStreak = 0;
    eco.dailyStreak = (eco.dailyStreak % 7) + 1;
    eco.lastClaimDate = today;
    eco.streakRecord = Math.max(eco.streakRecord, eco.dailyStreak);
    saveEco(eco);
    /* Grant reward */
    const reward = STREAK_REWARDS[eco.dailyStreak - 1];
    const user = _user();
    user.coins = (user.coins || 0) + reward.coins;
    localStorage.setItem('eylox_user', JSON.stringify(user));
    if (reward.tokens > 0) addTokens(reward.tokens, `Day ${eco.dailyStreak} streak reward`);
    /* XP */
    if (window.EyloxMeta) EyloxMeta.addXP(50 * eco.dailyStreak, 'daily_streak');
    _showStreakClaim(eco.dailyStreak, reward);
    if (eco.dailyStreak >= 7 && window.EyloxMeta) EyloxMeta.unlockAchievement('daily7');
    document.dispatchEvent(new CustomEvent('eylox:eco:streak', { detail: { streak: eco.dailyStreak, reward } }));
  }

  function _showStreakClaim(day, reward) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(12px)`;
    overlay.innerHTML = `
      <div style="background:rgba(10,3,28,.98);border:1px solid rgba(245,158,11,.3);border-radius:24px;padding:32px;text-align:center;max-width:320px;box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 40px rgba(245,158,11,.1);animation:metaLvlPop .4s cubic-bezier(.34,1.56,.64,1) both">
        <div style="font-size:3rem;margin-bottom:8px">${day === 7 ? '👑' : '📅'}</div>
        <div style="font-size:.7rem;font-weight:900;color:#f59e0b;letter-spacing:2px;text-transform:uppercase">Day ${day} ${day===7?'MEGA ':' '}Reward</div>
        <div style="font-size:2rem;font-weight:900;color:#fff;margin:12px 0">${reward.label}</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px">
          <div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:12px;padding:10px 16px">
            <div style="font-size:1.2rem;font-weight:900;color:#f59e0b">🪙 ${reward.coins}</div>
            <div style="font-size:.6rem;color:rgba(245,158,11,.5)">Coins</div>
          </div>
          ${reward.tokens ? `<div style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.3);border-radius:12px;padding:10px 16px">
            <div style="font-size:1.2rem;font-weight:900;color:#a78bfa">💎 ${reward.tokens}</div>
            <div style="font-size:.6rem;color:rgba(167,139,250,.5)">Tokens</div>
          </div>` : ''}
        </div>
        <!-- Streak dots -->
        <div style="display:flex;gap:4px;justify-content:center;margin-bottom:20px">
          ${STREAK_REWARDS.map((r,i) => `<div style="width:${i===6?'28px':'20px'};height:${i===6?'28px':'20px'};border-radius:50%;background:${i<day?'linear-gradient(135deg,#f59e0b,#ef4444)':'rgba(255,255,255,.08)'};border:1px solid ${i<day?'rgba(245,158,11,.5)':'rgba(255,255,255,.1)'};display:flex;align-items:center;justify-content:center;font-size:${i===6?'.7rem':'.55rem'};transition:all .3s" style="animation-delay:${i*.08}s">${i<day?'✓':i+1}</div>`).join('')}
        </div>
        <button onclick="this.closest('div[style]').remove()" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);border-radius:99px;padding:10px 28px;color:#f59e0b;cursor:pointer;font-weight:900;font-size:.85rem">Claim!</button>
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 8000);
  }

  /* ── Auto-check daily reward on load ── */
  function checkAutoClaim() {
    const eco = getEco();
    if (!eco) return;
    const today = new Date().toDateString();
    if (eco.lastClaimDate !== today) {
      /* Show claim button notification after 2s */
      setTimeout(() => {
        const btn = document.getElementById('daily-claim-btn');
        if (btn) btn.classList.add('pulse');
        _toast('📅 Daily reward available! Claim it in the Economy panel.', 'info');
      }, 2000);
    }
  }

  /* ── Marketplace ── */
  function getMarketItems() {
    try {
      const items = JSON.parse(localStorage.getItem(MARKET_KEY) || 'null');
      return items || _defaultMarketItems();
    } catch { return _defaultMarketItems(); }
  }

  function _defaultMarketItems() {
    return [
      { id:'skin_wizard',    name:'Wizard Skin',       icon:'🧙', type:'skin',    rarity:'rare',      coinPrice:800,  tokenPrice:2,  creator:'Eylox',   sales:1240 },
      { id:'hat_crown',      name:'Gold Crown Hat',    icon:'👑', type:'hat',     rarity:'legendary', coinPrice:2000, tokenPrice:5,  creator:'Eylox',   sales:456 },
      { id:'effect_sparkle', name:'Sparkle Effect',    icon:'✨', type:'effect',  rarity:'epic',      coinPrice:1200, tokenPrice:3,  creator:'PixelWolf',sales:789 },
      { id:'outfit_ninja',   name:'Ninja Outfit',      icon:'🥷', type:'outfit',  rarity:'rare',      coinPrice:600,  tokenPrice:1,  creator:'StormRider',sales:2100 },
      { id:'trail_rainbow',  name:'Rainbow Trail',     icon:'🌈', type:'effect',  rarity:'epic',      coinPrice:1500, tokenPrice:4,  creator:'Eylox',   sales:320 },
      { id:'emote_robot',    name:'Robot Dance Emote', icon:'🤖', type:'emote',   rarity:'rare',      coinPrice:400,  tokenPrice:1,  creator:'CyberNova',sales:3400 },
      { id:'badge_legend',   name:'Legend Badge',      icon:'🏅', type:'badge',   rarity:'legendary', coinPrice:5000, tokenPrice:12, creator:'Eylox',   sales:88 },
      { id:'nameplate_neon', name:'Neon Nameplate',    icon:'💜', type:'cosmetic',rarity:'epic',      coinPrice:900,  tokenPrice:2,  creator:'GlitchByte',sales:670 },
    ];
  }

  function buyItem(itemId, useTokens) {
    const items = getMarketItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const user = _user();
    const eco  = getEco();
    if (!eco) return;

    if (useTokens) {
      if (!spendTokens(item.tokenPrice, `Bought: ${item.name}`)) return;
    } else {
      if ((user.coins || 0) < item.coinPrice) { _toast('Not enough coins!', 'warn'); return; }
      user.coins -= item.coinPrice;
      localStorage.setItem('eylox_user', JSON.stringify(user));
    }

    /* Add to meta inventory */
    if (window.EyloxMeta) {
      EyloxMeta.addItem({
        id: itemId, name: item.name, icon: item.icon,
        rarity: item.rarity, type: item.type, source: 'Marketplace'
      });
    }

    /* Creator earnings: 30% of token price goes to creator */
    if (useTokens && item.creator !== user.username) {
      const creatorEco = JSON.parse(localStorage.getItem(`${ECO_KEY}_${item.creator}`) || '{}');
      creatorEco.creatorEarnings = (creatorEco.creatorEarnings || 0) + Math.floor(item.tokenPrice * 0.3);
      creatorEco.tokens = (creatorEco.tokens || 0) + Math.floor(item.tokenPrice * 0.3);
      localStorage.setItem(`${ECO_KEY}_${item.creator}`, JSON.stringify(creatorEco));
    }

    item.sales = (item.sales || 0) + 1;
    localStorage.setItem(MARKET_KEY, JSON.stringify(items));
    _toast(`🛍️ Purchased: ${item.name}!`, 'success');
    _refreshMarketPanel();
  }

  /* ── Publish Game (creator) ── */
  function publishGame(gameId, gameName) {
    const eco = getEco();
    if (!eco) return;
    if (eco.publishedGames.includes(gameId)) return;
    eco.publishedGames.push(gameId);
    saveEco(eco);
    addTokens(5, `Published game: ${gameName}`);
    if (window.EyloxMeta) EyloxMeta.unlockAchievement('create1');
    _toast(`🚀 "${gameName}" published! +5 Premium Tokens`, 'success');
  }

  function recordGamePlay(creatorUsername, gameId) {
    const eco = getEco();
    if (!eco) return;
    eco.totalPlays++;
    saveEco(eco);
    if (window.EyloxMeta) EyloxMeta.trackGame(gameId);
    /* If user is the creator: earn creator tokens every 100 plays */
    if (eco.username === creatorUsername) {
      const creatorEco = JSON.parse(localStorage.getItem(`${ECO_KEY}_${creatorUsername}`) || '{}');
      creatorEco.totalPlays = (creatorEco.totalPlays || 0) + 1;
      if (creatorEco.totalPlays % 100 === 0) {
        const earned = 2;
        creatorEco.creatorEarnings = (creatorEco.creatorEarnings || 0) + earned;
        creatorEco.tokens = (creatorEco.tokens || 0) + earned;
        localStorage.setItem(`${ECO_KEY}_${creatorUsername}`, JSON.stringify(creatorEco));
        if (eco.username === creatorUsername) _toast(`🎮 Your game hit ${creatorEco.totalPlays} plays! +${earned} Tokens earned`, 'success');
      } else {
        localStorage.setItem(`${ECO_KEY}_${creatorUsername}`, JSON.stringify(creatorEco));
      }
    }
  }

  /* ── Economy Panel UI ── */
  function openEconomyPanel() {
    if (document.getElementById('eylox-eco-panel')) { document.getElementById('eylox-eco-panel').remove(); return; }
    _buildEconomyPanel();
  }

  function _buildEconomyPanel() {
    const eco = getEco();
    const user = _user();
    if (!eco) return;
    if (!document.getElementById('eylox-eco-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-eco-css';
      s.textContent = `
        @keyframes ecoPanelIn { from{opacity:0;transform:translate(-50%,-54%) scale(.94)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .eco-tab { padding:7px 14px;border-radius:99px;cursor:pointer;font-size:.75rem;font-weight:800;color:rgba(167,139,250,.5);border:1px solid transparent;transition:all .15s; }
        .eco-tab.active { background:rgba(167,139,250,.15);border-color:rgba(167,139,250,.3);color:#e0d4ff; }
        .market-card { background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px;padding:12px;transition:border-color .2s; }
        .market-card:hover { border-color:rgba(167,139,250,.25); }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)} 50%{box-shadow:0 0 0 8px rgba(245,158,11,0)} }
        .pulse { animation:pulse 1.5s infinite!important; }
      `;
      document.head.appendChild(s);
    }

    const panel = document.createElement('div');
    panel.id = 'eylox-eco-panel';
    panel.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99996;
      background:rgba(10,3,28,.98);border:1px solid rgba(245,158,11,.2);border-radius:24px;
      width:min(540px,95vw);max-height:87vh;overflow-y:auto;
      box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 40px rgba(245,158,11,.05);
      animation:ecoPanelIn .3s cubic-bezier(.34,1.56,.64,1) both;
    `;

    const today = new Date().toDateString();
    const canClaim = eco.lastClaimDate !== today;

    panel.innerHTML = `
      <div style="padding:24px">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <div style="font-size:1.1rem;font-weight:900;color:#fff">💎 Economy</div>
            <div style="font-size:.65rem;color:rgba(245,158,11,.4)">Coins · Tokens · Marketplace · Creator Earnings</div>
          </div>
          <button onclick="document.getElementById('eylox-eco-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:32px;height:32px;color:rgba(255,255,255,.5);cursor:pointer">×</button>
        </div>
        <!-- Balance cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
          <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:14px;padding:14px;text-align:center">
            <div style="font-size:1.5rem;font-weight:900;color:#f59e0b">🪙 ${(user.coins||0).toLocaleString()}</div>
            <div style="font-size:.65rem;color:rgba(245,158,11,.5);margin-top:2px">Eylux</div>
          </div>
          <div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:14px;padding:14px;text-align:center">
            <div style="font-size:1.5rem;font-weight:900;color:#a78bfa">💎 ${eco.tokens}</div>
            <div style="font-size:.65rem;color:rgba(167,139,250,.5);margin-top:2px">Premium Tokens</div>
          </div>
        </div>
        <!-- Daily reward button -->
        <button id="daily-claim-btn" onclick="EyloxEconomy.claimDailyReward()" style="width:100%;background:${canClaim?'rgba(245,158,11,.15)':'rgba(255,255,255,.04)'};border:1px solid ${canClaim?'rgba(245,158,11,.35)':'rgba(255,255,255,.1)'};border-radius:12px;padding:12px;color:${canClaim?'#f59e0b':'rgba(255,255,255,.3)'};cursor:${canClaim?'pointer':'default'};font-weight:800;font-size:.85rem;margin-bottom:16px;transition:all .2s" ${canClaim?'':'disabled'}>
          📅 ${canClaim ? `Claim Day ${Math.min((eco.dailyStreak%7)+1,7)} Reward (Streak: ${eco.dailyStreak} days)` : 'Daily reward claimed ✓ Come back tomorrow!'}
        </button>
        <!-- Tabs -->
        <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap" id="eco-tabs">
          <div class="eco-tab active" onclick="EyloxEconomy._switchEcoTab('market',this)">🛍️ Marketplace</div>
          <div class="eco-tab" onclick="EyloxEconomy._switchEcoTab('convert',this)">🔄 Convert</div>
          <div class="eco-tab" onclick="EyloxEconomy._switchEcoTab('creator',this)">🎮 Creator</div>
          <div class="eco-tab" onclick="EyloxEconomy._switchEcoTab('history',this)">📋 History</div>
        </div>
        <!-- Tab content -->
        <div id="eco-tab-content">${_marketplaceHTML()}</div>
      </div>
    `;
    document.body.appendChild(panel);
    document.addEventListener('click', _ecoOutsideClick);
  }

  function _ecoOutsideClick(e) {
    const panel = document.getElementById('eylox-eco-panel');
    if (panel && !panel.contains(e.target) && !e.target.closest('#tb-eco-btn')) {
      panel.remove();
      document.removeEventListener('click', _ecoOutsideClick);
    }
  }

  const RARITY_COLORS = { common:'#9ca3af', rare:'#60a5fa', epic:'#a78bfa', legendary:'#f59e0b' };

  function _marketplaceHTML() {
    const items = getMarketItems();
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${items.map(item => `
          <div class="market-card">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:1.4rem">${item.icon}</span>
              <div>
                <div style="font-size:.78rem;font-weight:800;color:#fff">${item.name}</div>
                <div style="font-size:.6rem;color:${RARITY_COLORS[item.rarity]||'#9ca3af'}">${item.rarity} · ${item.sales} sold</div>
              </div>
            </div>
            <div style="font-size:.6rem;color:rgba(167,139,250,.4);margin-bottom:6px">by ${item.creator}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              <button onclick="EyloxEconomy._buy('${item.id}',false)" style="flex:1;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:99px;padding:5px;color:#f59e0b;cursor:pointer;font-size:.65rem;font-weight:800">🪙 ${item.coinPrice}</button>
              <button onclick="EyloxEconomy._buy('${item.id}',true)" style="flex:1;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.25);border-radius:99px;padding:5px;color:#a78bfa;cursor:pointer;font-size:.65rem;font-weight:800">💎 ${item.tokenPrice}</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function _convertHTML() {
    const eco = getEco();
    const user = _user();
    return `
      <div>
        <div style="background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:14px;padding:16px;margin-bottom:12px">
          <div style="font-size:.65rem;font-weight:900;color:rgba(167,139,250,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Coins → Premium Tokens</div>
          <div style="font-size:.78rem;color:rgba(200,190,230,.6);margin-bottom:10px">Rate: ${COIN_TO_TOKEN} Coins = 1 Premium Token</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="flex:1;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:10px;text-align:center">
              <div style="font-size:1rem;font-weight:900;color:#f59e0b">🪙 ${(user.coins||0).toLocaleString()}</div>
              <div style="font-size:.6rem;color:rgba(245,158,11,.4)">Your coins</div>
            </div>
            <div style="font-size:1.2rem;color:rgba(167,139,250,.4)">→</div>
            <div style="flex:1;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:10px;text-align:center">
              <div style="font-size:1rem;font-weight:900;color:#a78bfa">💎 ${Math.floor((user.coins||0)/COIN_TO_TOKEN)}</div>
              <div style="font-size:.6rem;color:rgba(167,139,250,.4)">Max tokens</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${[500,1000,2000,5000].map(coins => `<button onclick="EyloxEconomy._convert(${coins})" style="flex:1;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:99px;padding:8px;color:#f59e0b;cursor:pointer;font-size:.7rem;font-weight:800;min-width:70px">🪙${coins}<br>→💎${coins/COIN_TO_TOKEN}</button>`).join('')}
          </div>
        </div>
        <div style="background:rgba(34,197,94,.05);border:1px solid rgba(34,197,94,.1);border-radius:14px;padding:14px">
          <div style="font-size:.65rem;font-weight:900;color:rgba(34,197,94,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Token Value (Display only)</div>
          <div style="font-size:.82rem;color:rgba(200,190,230,.6)">Your ${eco?.tokens||0} tokens ≈ <span style="color:#22c55e;font-weight:900">$${((eco?.tokens||0)*TOKEN_PAYOUT).toFixed(3)}</span> in creator credits</div>
          <div style="font-size:.65rem;color:rgba(200,190,230,.3);margin-top:4px">Creator earnings are tracked but not real-money payouts. This is a game platform feature.</div>
        </div>
      </div>
    `;
  }

  function _creatorHTML() {
    const eco = getEco();
    if (!eco) return '';
    return `
      <div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
          ${[
            {icon:'🎮',label:'Published Games',val:eco.publishedGames.length},
            {icon:'👁️',label:'Total Plays',val:eco.totalPlays},
            {icon:'💎',label:'Creator Tokens',val:eco.creatorEarnings},
          ].map(s=>`<div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.1);border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:1.2rem">${s.icon}</div>
            <div style="font-size:1rem;font-weight:900;color:#fff">${s.val}</div>
            <div style="font-size:.58rem;color:rgba(167,139,250,.4)">${s.label}</div>
          </div>`).join('')}
        </div>
        <div style="background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:14px;padding:14px">
          <div style="font-size:.65rem;font-weight:900;color:rgba(167,139,250,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">How Creator Earnings Work</div>
          <div style="font-size:.75rem;color:rgba(200,190,230,.5);line-height:1.6">
            • Publish a game in Eylox Studio → earn <strong style="color:#a78bfa">5 tokens</strong><br>
            • Every 100 plays on your game → earn <strong style="color:#a78bfa">2 tokens</strong><br>
            • When someone buys your item with tokens → you earn <strong style="color:#a78bfa">30%</strong><br>
            • Sell items in the Marketplace to earn recurring income
          </div>
        </div>
      </div>
    `;
  }

  function _historyHTML() {
    const eco = getEco();
    if (!eco) return '';
    return `
      <div style="display:flex;flex-direction:column;gap:4px">
        ${!eco.transactions.length ? '<div style="text-align:center;color:rgba(167,139,250,.3);padding:20px">No transactions yet.</div>' :
          eco.transactions.map(tx => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(167,139,250,.04);border-radius:10px">
              <span style="font-size:1rem">${tx.type==='earn'?'↑':'↓'}</span>
              <div style="flex:1">
                <div style="font-size:.75rem;font-weight:800;color:#fff">${tx.reason}</div>
                <div style="font-size:.62rem;color:rgba(167,139,250,.4)">${new Date(tx.date).toLocaleDateString()}</div>
              </div>
              <div style="font-size:.78rem;font-weight:900;color:${tx.amount>0?'#22c55e':'#ef4444'}">${tx.amount>0?'+':''}${tx.amount} 💎</div>
            </div>
          `).join('')}
      </div>
    `;
  }

  function _refreshMarketPanel() {
    const content = document.getElementById('eco-tab-content');
    if (content) content.innerHTML = _marketplaceHTML();
  }

  /* ── Widget: token display in topbar (disabled) ── */
  function injectTokenWidget() {
    /* Economy topbar button removed per user request */
    return;
  }

  function _refreshWidget() {
    const btn = document.getElementById('tb-eco-btn');
    if (!btn) return;
    const eco = getEco();
    btn.textContent = `💎 ${eco?.tokens||0}`;
  }

  function _toast(msg, type) {
    if (window.EyloxToast) EyloxToast(msg, type, 2500);
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectTokenWidget, 800);
    checkAutoClaim();
  });

  /* ── Public API ── */
  window.EyloxEconomy = {
    openPanel: openEconomyPanel,
    addTokens, spendTokens, convertCoinsToTokens,
    claimDailyReward, publishGame, recordGamePlay, buyItem,
    getEco,
    _buy: buyItem,
    _convert: convertCoinsToTokens,
    _switchEcoTab(tab, el) {
      document.querySelectorAll('.eco-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      const content = document.getElementById('eco-tab-content');
      if (!content) return;
      if (tab === 'market')  content.innerHTML = _marketplaceHTML();
      if (tab === 'convert') content.innerHTML = _convertHTML();
      if (tab === 'creator') content.innerHTML = _creatorHTML();
      if (tab === 'history') content.innerHTML = _historyHTML();
    }
  };

})();
