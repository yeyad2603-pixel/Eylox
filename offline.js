/* ============================================================
   EYLOX — Offline Manager v1.0
   Full offline support: connection detection, local data store,
   API patching, sync queue, offline UI, and graceful degradation.
   ============================================================ */
'use strict';

(function EyloxOffline() {

  /* ═══════════════════════════════════════════════════════════
     SECTION 1 — CONNECTION STATE

     Two DISTINCT signals are tracked, on purpose:

     • _deviceOffline — is the device itself genuinely offline
       (navigator.onLine === false, i.e. the OS/browser reports no
       network route at all — wifi off, airplane mode, cable
       unplugged). This is the ONLY thing allowed to trigger the
       full-screen "Connection Lost" takeover (Eylox Dash) and the
       big red offline indicator, per design: that experience should
       never fire just because our own server had a hiccup while the
       user's internet is fine.

     • _serverReachable — can EYLOX's own server actually be reached
       right now. A probe failure here (server down, CORS misconfig,
       page opened via file://, dev server not running, etc.) is a
       COMPLETELY different problem from "the user is offline," and
       must never be reported as "Connection Lost" — it gets its own
       small, non-blocking "Server Unreachable" indicator instead, and
       API calls fall back to local data exactly like genuine offline
       mode does (the practical effect is the same either way: we
       cannot reach the server, so use local data + queue writes).

     A probe result of "server unreachable" only takes effect after
     PROBE_FAILURE_THRESHOLD consecutive failures, so a single
     transient blip (one slow request, one dropped packet) doesn't
     flip any UI state.
  ═══════════════════════════════════════════════════════════ */
  let _deviceOffline   = !navigator.onLine;
  let _serverReachable = navigator.onLine; // optimistic until first probe completes
  let _probeFailStreak = 0;
  const PROBE_FAILURE_THRESHOLD = 2;

  let _probeTimer = null;
  const POLL_HEALTHY   = 20000; // both signals good — poll relaxed
  const POLL_DEGRADED  = 5000;  // something's wrong — poll fast so recovery is snappy

  /* The API server's own origin — kept in sync with api.js's `API` constant.
     Probed independently of the page's own origin so "the page's static host
     is reachable" and "EYLOX's backend is reachable" are never conflated. */
  const API_ORIGIN = 'http://localhost:3001';

  function abortSignalWithTimeout(ms) {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
    /* Fallback for older browsers without AbortSignal.timeout */
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), ms);
    return ctrl.signal;
  }

  async function probeOnce(url, options) {
    try {
      const res = await fetch(url, Object.assign({
        cache: 'no-store',
        signal: abortSignalWithTimeout(5000),
      }, options));
      return !!(res && res.ok);
    } catch {
      return false;
    }
  }

  /* Reachable if EITHER the page's own host OR EYLOX's API server responds —
     a real backend outage and a static-host hiccup are reported the same way
     to the user (server unreachable), so either success is enough to clear it. */
  async function probeConnection() {
    const [sameOriginOk, apiOk] = await Promise.all([
      probeOnce('./sw.js?_probe=' + Date.now(), { method: 'HEAD' }),
      probeOnce(API_ORIGIN + '/health', { method: 'GET', mode: 'cors' }),
    ]);
    return sameOriginOk || apiOk;
  }

  function rescheduleProbeTimer() {
    if (_probeTimer) clearInterval(_probeTimer);
    const interval = (_deviceOffline || !_serverReachable) ? POLL_DEGRADED : POLL_HEALTHY;
    _probeTimer = setInterval(updateOnlineState, interval);
  }

  async function updateOnlineState() {
    const deviceOnline = navigator.onLine;
    const wasDeviceOffline   = _deviceOffline;
    const wasServerReachable = _serverReachable;

    if (!deviceOnline) {
      /* Trust the browser's own signal immediately — no debounce needed,
         this event is reliable (interface actually went down). */
      _probeFailStreak = 0;
      _deviceOffline   = true;
      _serverReachable = false;
    } else {
      const probeOk = await probeConnection();
      _deviceOffline = false; // navigator says we have a network route — never "genuinely offline"

      if (probeOk) {
        _probeFailStreak = 0;
        _serverReachable = true;
      } else {
        _probeFailStreak++;
        if (_probeFailStreak >= PROBE_FAILURE_THRESHOLD) _serverReachable = false;
        /* else: keep the previous _serverReachable value — one bad probe
           is not enough evidence to change anything. */
      }
    }

    if (_deviceOffline !== wasDeviceOffline) {
      if (_deviceOffline) onGenuinelyOffline(); else onGenuinelyOnline();
    } else if (_serverReachable !== wasServerReachable) {
      if (_serverReachable) onServerReachable(); else onServerUnreachable();
    }

    rescheduleProbeTimer();
  }

  function onGenuinelyOffline() {
    showOfflineIndicator('offline');
    patchAPIs();
    /* Dispatch custom event so other modules (Eylox Dash) can react */
    window.dispatchEvent(new CustomEvent('eylox-offline'));
  }

  function onGenuinelyOnline() {
    showOfflineIndicator('syncing');
    processSyncQueue().then(() => {
      showOfflineIndicator('online');
      setTimeout(hideOfflineIndicator, 3500);
    });
    window.dispatchEvent(new CustomEvent('eylox-online'));
  }

  function onServerUnreachable() {
    showOfflineIndicator('server');
    patchAPIs(); // fall back to local data — we can't reach the server either way
  }

  function onServerReachable() {
    showOfflineIndicator('syncing');
    processSyncQueue().then(() => {
      showOfflineIndicator('online');
      setTimeout(hideOfflineIndicator, 3500);
    });
  }

  /* React instantly to real browser connectivity events... */
  window.addEventListener('online',  () => updateOnlineState());
  window.addEventListener('offline', () => updateOnlineState());
  /* ...and keep polling as a safety net (interval adapts to current health). */
  rescheduleProbeTimer();
  /* First probe shortly after load */
  setTimeout(updateOnlineState, 2000);

  /* ═══════════════════════════════════════════════════════════
     SECTION 2 — OFFLINE INDICATOR UI
  ═══════════════════════════════════════════════════════════ */
  let _indicator = null;

  /* style.css already ships every rule these components need. This is a
     defensive fallback ONLY, so the indicator/modal/toast still render
     correctly on the off chance a page loads offline.js without style.css.
     (Previously this was called but never defined anywhere — a silent
     ReferenceError that broke showOfflineModal()/showInstallPrompt()'s
     fallback path whenever they ran.) Idempotent: injects at most once. */
  let _cssInjected = false;
  function injectIndicatorCSS() {
    if (_cssInjected || document.getElementById('eylox-offline-fallback-css')) return;
    _cssInjected = true;
    const style = document.createElement('style');
    style.id = 'eylox-offline-fallback-css';
    style.textContent = `
      #eylox-offline-indicator{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-120px);z-index:999998;display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:99px;font-family:'Nunito',sans-serif;font-size:.78rem;font-weight:800;backdrop-filter:blur(20px);transition:transform .35s cubic-bezier(.16,1,.3,1),background .3s,border-color .3s,color .3s;pointer-events:none}
      #eylox-offline-indicator.visible{transform:translateX(-50%) translateY(0)}
      #eylox-offline-indicator.offline-state{background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.35);color:#fca5a5}
      #eylox-offline-indicator.server-state{background:rgba(245,158,11,.18);border:1px solid rgba(245,158,11,.35);color:#fcd34d}
      #eylox-offline-indicator.online-state{background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.32);color:#86efac}
      #eylox-offline-indicator.syncing-state{background:rgba(96,165,250,.15);border:1px solid rgba(96,165,250,.3);color:#93c5fd}
      .eylox-offline-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
      .offline-state .eylox-offline-dot{background:#f87171;animation:offDotPulse 1.2s ease-in-out infinite}
      .server-state .eylox-offline-dot{background:#f59e0b;animation:offDotPulse 1.2s ease-in-out infinite}
      .online-state .eylox-offline-dot{background:#4ade80}
      .syncing-state .eylox-offline-dot{background:#60a5fa;animation:offDotPulse .8s ease-in-out infinite}
      @keyframes offDotPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.6}}
      #eylox-offline-topbar-badge{display:none;align-items:center;gap:4px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);border-radius:99px;padding:3px 10px;font-size:.68rem;font-weight:800;color:#fca5a5;white-space:nowrap;cursor:default;animation:offDotPulse 2s ease-in-out infinite}
      #eylox-offline-topbar-badge.server-badge{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.25);color:#fcd34d}
      body.eylox-is-offline #eylox-offline-topbar-badge,body.eylox-server-unreachable #eylox-offline-topbar-badge{display:flex}
      #eylox-offline-modal{position:fixed;inset:0;z-index:9999;background:rgba(3,1,12,.82);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}
      #eylox-offline-modal.open{opacity:1;pointer-events:all}
      #eylox-offline-modal-card{max-width:360px;background:rgba(18,10,38,.97);border:1px solid rgba(167,139,250,.25);border-radius:20px;padding:28px 24px;text-align:center;font-family:'Nunito',sans-serif}
      #eylox-offline-modal-card .ofm-icon{font-size:2.2rem}
      #eylox-offline-modal-card .ofm-title{font-family:'Fredoka One',cursive;color:#fff;font-size:1.1rem;margin:10px 0}
      #eylox-offline-modal-card .ofm-text{color:rgba(210,195,240,.7);font-size:.82rem;font-weight:700;line-height:1.5;margin-bottom:18px}
      #eylox-offline-modal-card .ofm-close{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;padding:10px 24px;font-family:'Fredoka One',cursive;cursor:pointer}
      .eylox-offline-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(18,10,38,.97);border:1px solid rgba(167,139,250,.25);color:#fff;padding:10px 20px;border-radius:99px;font-size:.8rem;font-weight:700;z-index:99999;opacity:1;transition:opacity .3s}
    `;
    document.head.appendChild(style);
  }

  const INDICATOR_TEXT = {
    offline: '📡 Offline Mode — all features work locally',
    server:  '⚠️ Server unreachable — retrying… (your internet is fine, EYLOX’s server isn’t responding)',
    syncing: '☁️ Back online — syncing…',
    online:  '✅ Synced & online',
  };
  const INDICATOR_CLASS = {
    offline: 'offline-state',
    server:  'server-state',
    syncing: 'syncing-state',
    online:  'online-state',
  };

  function showOfflineIndicator(state) {
    injectIndicatorCSS();
    if (!_indicator) {
      _indicator = document.createElement('div');
      _indicator.id = 'eylox-offline-indicator';
      _indicator.innerHTML = '<div class="eylox-offline-dot"></div><span id="eylox-offline-label"></span>';
      document.body.appendChild(_indicator);
    }
    const label = document.getElementById('eylox-offline-label');
    _indicator.className = '';
    _indicator.classList.add(INDICATOR_CLASS[state] || 'syncing-state');
    if (label) label.textContent = INDICATOR_TEXT[state] || '';
    setTimeout(() => _indicator.classList.add('visible'), 30);
    /* Body classes reflect exactly one of: genuinely offline, or server
       unreachable while genuinely online — never both, never conflated. */
    document.body.classList.toggle('eylox-is-offline', state === 'offline');
    document.body.classList.toggle('eylox-server-unreachable', state === 'server');
    injectTopbarBadge(state);
  }

  function hideOfflineIndicator() {
    if (_indicator) _indicator.classList.remove('visible');
    document.body.classList.remove('eylox-is-offline', 'eylox-server-unreachable');
    injectTopbarBadge(null);
  }

  const BADGE_CONTENT = {
    offline: { html: '📡 OFFLINE', title: "You're in offline mode. All data is saved locally." },
    server:  { html: '⚠️ SERVER UNREACHABLE', title: "Your internet is fine, but EYLOX's server isn't responding. Retrying automatically…" },
  };

  function injectTopbarBadge(state) {
    const content = BADGE_CONTENT[state];
    let badge = document.getElementById('eylox-offline-topbar-badge');
    if (!badge && content) {
      badge = document.createElement('div');
      badge.id = 'eylox-offline-topbar-badge';
      const topbarRight = document.querySelector('.topbar-right');
      if (topbarRight) topbarRight.prepend(badge);
    }
    if (badge && content) {
      badge.innerHTML = content.html;
      badge.title = content.title;
      badge.classList.toggle('server-badge', state === 'server');
    }
  }

  /* ── Offline modal (shown when user tries a live-only feature) ── */
  function showOfflineModal(featureName) {
    injectIndicatorCSS();
    let modal = document.getElementById('eylox-offline-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'eylox-offline-modal';
      modal.innerHTML = `
        <div id="eylox-offline-modal-card">
          <span class="ofm-icon">📡</span>
          <div class="ofm-title">You're Offline</div>
          <div class="ofm-text" id="ofm-feature-text">
            ${featureName || 'This feature'} requires an internet connection.
            Don't worry — your coins, progress, and game data are all saved locally.
            Connect to the internet to use live features.
          </div>
          <button class="ofm-close" id="ofm-close-btn">Got it</button>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById('ofm-close-btn').addEventListener('click', hideOfflineModal);
      modal.addEventListener('click', e => { if (e.target === modal) hideOfflineModal(); });
    } else {
      const txt = modal.querySelector('#ofm-feature-text');
      if (txt) txt.textContent = `${featureName || 'This feature'} requires an internet connection. Your local data is safe.`;
    }
    modal.classList.add('open');
  }

  function hideOfflineModal() {
    const modal = document.getElementById('eylox-offline-modal');
    if (modal) modal.classList.remove('open');
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION 3 — LOCAL DATA STORE
  ═══════════════════════════════════════════════════════════ */
  function ls(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  /* ── Local Friends ── */
  function getLocalFriends() {
    const stored = ls('eylox_friends_local', []);
    if (stored.length) return { friends: stored };
    /* Build from player pool if nothing else */
    const pool = ls('eylox_player_pool', []);
    const sample = pool.slice(0, 6).map(p => ({
      id: p.id, username: p.username, avatar: p.avatar || '🎮',
      status: Math.random() > 0.5 ? 'online' : 'offline',
      coins: p.coins || 0, wins: p.wins || 0,
    }));
    return { friends: sample };
  }

  /* ── Local Leaderboard ── */
  function getLocalLeaderboard(category = 'Eylux') {
    const user  = ls('eylox_user', {});
    const pool  = ls('eylox_player_pool', []);
    const me = {
      id: 'me', username: user.username || 'You',
      avatar: user.avatar || '🎮',
      coins: user.coins || 0, wins: user.wins || 0,
      Eyltrophs: user.Eyltrophs || 0,
      rank: 0,
    };
    const entries = [me, ...pool.slice(0, 49).map(p => ({
      id: p.id, username: p.username, avatar: p.avatar || '🎮',
      coins: p.coins || Math.floor(Math.random() * 50000) + 1000,
      wins: p.wins || Math.floor(Math.random() * 500),
      Eyltrophs: p.Eyltrophs || Math.floor(Math.random() * 200),
    }))];
    const key = category === 'wins' ? 'wins' : category === 'Eyltrophs' ? 'Eyltrophs' : 'Eylux';
    entries.sort((a, b) => (b[key] || 0) - (a[key] || 0));
    entries.forEach((e, i) => { e.rank = i + 1; });
    return { entries, category, season: 'Season 1', offline: true };
  }

  /* ── Local Messages ── */
  function getLocalConversations() {
    return ls('eylox_dm_list', []).map(c => ({
      ...c,
      offline: true,
    }));
  }

  function getLocalConversation(userId) {
    return ls(`eylox_dm_${userId}`, []);
  }

  /* ── Local Notifications ── */
  function getLocalNotifications() {
    return ls('eylox_notifications_local', [
      { id: 1, type: 'info', message: 'You\'re in offline mode. All your progress is saved.', read: false, createdAt: new Date().toISOString() },
    ]);
  }

  /* ── Local Achievements ── */
  const ACHIEVEMENT_CATALOG = [
    { code:'first_game',    name:'First Steps',         icon:'🎮', rarity:'common',    description:'Play your first game.',            reward:{ coins:100 } },
    { code:'win_10',        name:'Ten Wins',            icon:'🏆', rarity:'rare',      description:'Win 10 events.',                   reward:{ coins:500 } },
    { code:'coins_1000',    name:'Coin Collector',      icon:'💰', rarity:'common',    description:'Earn 1,000 coins.',               reward:{ coins:200 } },
    { code:'coins_10000',   name:'Rich Player',         icon:'💎', rarity:'epic',      description:'Earn 10,000 coins.',              reward:{ coins:1000 } },
    { code:'daily_7',       name:'Week Warrior',        icon:'🔥', rarity:'rare',      description:'Log in 7 days in a row.',          reward:{ coins:700 } },
    { code:'daily_30',      name:'Monthly Master',      icon:'📅', rarity:'epic',      description:'Log in 30 days in a row.',         reward:{ coins:3000 } },
    { code:'events_5',      name:'Arena Fighter',       icon:'⚔️', rarity:'rare',      description:'Enter 5 live events.',             reward:{ coins:500 } },
    { code:'events_20',     name:'Event Champion',      icon:'🎯', rarity:'epic',      description:'Enter 20 live events.',            reward:{ coins:2000 } },
    { code:'level_10',      name:'Rising Star',         icon:'⭐', rarity:'rare',      description:'Reach level 10.',                  reward:{ coins:1000 } },
    { code:'level_25',      name:'Veteran',             icon:'🌟', rarity:'epic',      description:'Reach level 25.',                  reward:{ coins:5000 } },
    { code:'shop_first',    name:'Shopper',             icon:'🛒', rarity:'common',    description:'Buy your first item from the Shop.',reward:{ coins:100 } },
    { code:'add_owner',     name:'Creator\'s Friend',   icon:'👑', rarity:'legendary', description:'Add the creator "Eylox" as a friend.',reward:{ coins:10000 } },
  ];

  function getLocalAchievements() {
    const unlocked = ls('eylox_achievements_unlocked', []);
    const user = ls('eylox_user', {});
    return ACHIEVEMENT_CATALOG.map(a => ({
      ...a,
      unlocked: unlocked.includes(a.code),
      progress: getAchievementProgress(a.code, user),
    }));
  }

  function getAchievementProgress(code, user) {
    const coins = user.coins || 0;
    const wins  = user.wins  || 0;
    const lvl   = user.level || 1;
    const streak= ls('eylox_login_streak', 0);
    const events= ls('eylox_event_history', []).length;
    switch (code) {
      case 'first_game':  return { current: coins > 0 ? 1 : 0, target: 1 };
      case 'win_10':      return { current: wins, target: 10 };
      case 'coins_1000':  return { current: Math.min(coins, 1000), target: 1000 };
      case 'coins_10000': return { current: Math.min(coins, 10000), target: 10000 };
      case 'daily_7':     return { current: Math.min(streak, 7), target: 7 };
      case 'daily_30':    return { current: Math.min(streak, 30), target: 30 };
      case 'events_5':    return { current: Math.min(events, 5), target: 5 };
      case 'events_20':   return { current: Math.min(events, 20), target: 20 };
      case 'level_10':    return { current: Math.min(lvl, 10), target: 10 };
      case 'level_25':    return { current: Math.min(lvl, 25), target: 25 };
      default:            return { current: 0, target: 1 };
    }
  }

  /* ── Local Shop Catalog ── */
  const OFFLINE_SHOP_ITEMS = [
    { id:'av001', name:'Ninja Warrior',  icon:'🥷', type:'avatar',  rarity:'common',    price:200,  currency:'Eylux', description:'A classic ninja avatar skin.' },
    { id:'av002', name:'Space Ranger',   icon:'🚀', type:'avatar',  rarity:'rare',      price:500,  currency:'Eylux', description:'Explore the cosmos in style.' },
    { id:'av003', name:'Dragon Slayer',  icon:'🐉', type:'avatar',  rarity:'epic',      price:1200, currency:'Eylux', description:'Harness the power of the dragon.' },
    { id:'av004', name:'Diamond King',   icon:'💎', type:'avatar',  rarity:'legendary', price:5000, currency:'Eylux', description:'The rarest avatar on Eylox.' },
    { id:'ef001', name:'Fire Trail',     icon:'🔥', type:'effect',  rarity:'rare',      price:800,  currency:'Eylux', description:'Leave a flame trail as you move.' },
    { id:'ef002', name:'Star Aura',      icon:'⭐', type:'effect',  rarity:'epic',      price:1500, currency:'Eylux', description:'A glowing aura of stars surrounds you.' },
    { id:'ef003', name:'Lightning Ring', icon:'⚡', type:'effect',  rarity:'legendary', price:4000, currency:'Eylux', description:'Electric lightning orbits your avatar.' },
    { id:'gp001', name:'2× XP Boost',   icon:'📈', type:'pass',    rarity:'rare',      price:1000, currency:'Eylux', description:'Earn double XP from all events for 7 days.' },
    { id:'gp002', name:'Coin Magnet',    icon:'🧲', type:'pass',    rarity:'epic',      price:2000, currency:'Eylux', description:'+50% coins from every game for 3 days.' },
    { id:'gp003', name:'VIP Pass',       icon:'👑', type:'pass',    rarity:'legendary', price:0,    currency:'wins',  description:'Access VIP events and exclusive rooms.', winsPrice: 50 },
    { id:'bst001',name:'Daily Boost',    icon:'🚀', type:'boost',   rarity:'common',    price:150,  currency:'Eylux', description:'+25% coin gain for 24 hours.' },
    { id:'bst002',name:'Event Shield',   icon:'🛡️', type:'boost',   rarity:'rare',      price:600,  currency:'Eylux', description:'If you lose an event, your entry fee is refunded once.' },
    { id:'rw001', name:'Starter Pack',   icon:'🎁', type:'reward',  rarity:'common',    price:0,    currency:'free',  description:'Free 500 coins for new players!', claimable: true },
    { id:'rw002', name:'Daily Login',    icon:'📅', type:'reward',  rarity:'common',    price:0,    currency:'free',  description:'Claim your daily login bonus.', daily: true },
  ];

  function getLocalShopItems(category = 'all') {
    const owned = ls('eylox_inventory', []);
    return OFFLINE_SHOP_ITEMS
      .filter(i => category === 'all' || i.type === category)
      .map(i => ({ ...i, owned: owned.includes(i.id) }));
  }

  /* ── Local Communities ── */
  const DEFAULT_COMMUNITIES = [
    { id:'c1', name:'Ninja Dash Club',   avatar:'🥷', members:1234, category:'action',   description:'Speedrun tips and trick sharing for Ninja Dash.' },
    { id:'c2', name:'Eylox Racers',      avatar:'🏎️', members:867,  category:'racing',   description:'The official Neon Racer community.' },
    { id:'c3', name:'Ocean Cleanup Crew',avatar:'🌊', members:543,  category:'casual',   description:'Relax and clean up the ocean together.' },
    { id:'c4', name:'Diamond Hunters',   avatar:'💎', members:2109, category:'adventure',description:'Crystal Catcher strategies and screenshots.' },
    { id:'c5', name:'Eylox Official',    avatar:'🎮', members:9999, category:'general',  description:'The official Eylox platform community.' },
  ];

  function getLocalCommunities() {
    const stored = ls('eylox_communities_local', null);
    return stored || DEFAULT_COMMUNITIES;
  }

  /* ── Offline Daily Reward (based on device date) ── */
  function getOfflineDailyReward() {
    const today = new Date().toDateString();
    const lastClaim = ls('eylox_daily_last', '');
    if (lastClaim === today) return null;
    const streak = (ls('eylox_login_streak', 0) || 0);
    const newStreak = streak + 1;
    const reward = Math.min(50 + newStreak * 25, 500); // 75→500 coins, capped
    return { coins: reward, streak: newStreak, today };
  }

  function claimOfflineDailyReward() {
    const reward = getOfflineDailyReward();
    if (!reward) return null;
    lsSet('eylox_daily_last', reward.today);
    lsSet('eylox_login_streak', reward.streak);
    const user = ls('eylox_user', {});
    if (user) {
      user.coins = (user.coins || 0) + reward.coins;
      lsSet('eylox_user', user);
    }
    return reward;
  }

  /* ── Check and auto-claim daily reward ── */
  function maybeClaimDailyReward() {
    if (!ls('eylox_user')) return;
    const reward = getOfflineDailyReward();
    if (!reward) return;
    claimOfflineDailyReward();
    /* Show a toast if the platform's toast function exists */
    setTimeout(() => {
      if (typeof window.showToast === 'function') {
        window.showToast(`🎁 Daily reward: +${reward.coins} coins! (Day ${reward.streak})`, '#4ade80');
      } else {
        showOfflineToast(`🎁 Daily reward: +${reward.coins} coins! Login streak: ${reward.streak} days`);
      }
    }, 2500);
  }

  function showOfflineToast(msg) {
    const t = document.createElement('div');
    t.className = 'eylox-offline-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 350); }, 3500);
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION 4 — SYNC QUEUE
  ═══════════════════════════════════════════════════════════ */
  function enqueue(action) {
    const queue = ls('eylox_sync_queue', []);
    queue.push({ ...action, id: Date.now() + Math.random(), ts: Date.now() });
    lsSet('eylox_sync_queue', queue.slice(-100)); // Keep last 100
  }

  async function processSyncQueue() {
    const queue = ls('eylox_sync_queue', []);
    if (!queue.length) return;
    const failed = [];
    for (const action of queue) {
      try {
        await replayAction(action);
      } catch {
        failed.push(action);
      }
    }
    lsSet('eylox_sync_queue', failed);
    if (queue.length - failed.length > 0) {
      console.log(`[Eylox Offline] Synced ${queue.length - failed.length} queued actions.`);
    }
  }

  async function replayAction(action) {
    /* The actual `request` function from api.js — replay the real API call */
    if (typeof request !== 'function') return;
    const { method, path, body } = action;
    if (!method || !path) return;
    await request(method, path, body || null, true);
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION 5 — API PATCHING
     Override API namespace methods to serve local data when offline.
     These run AFTER DOMContentLoaded so the API objects exist.
  ═══════════════════════════════════════════════════════════ */
  function patchAPIs() {
    /* ── Friends ── */
    if (typeof Friends !== 'undefined' && !Friends._offlinePatched) {
      Friends._offlinePatched = true;
      const _origList = Friends.list.bind(Friends);
      Friends.list = async () => _serverReachable ? _origList() : getLocalFriends();

      const _origSend = Friends.sendRequest.bind(Friends);
      Friends.sendRequest = async (username) => {
        if (!_serverReachable) {
          enqueue({ method:'POST', path:'/friends/request', body:{ toUsername: username } });
          showOfflineToast(`✅ Friend request to ${username} queued — will send when online.`);
          return { queued: true };
        }
        return _origSend(username);
      };
    }

    /* ── Messages ── */
    if (typeof Messages !== 'undefined' && !Messages._offlinePatched) {
      Messages._offlinePatched = true;
      const _origConvs = Messages.getConversations.bind(Messages);
      Messages.getConversations = async () => _serverReachable ? _origConvs() : getLocalConversations();

      const _origConv = Messages.getConversation.bind(Messages);
      Messages.getConversation = async (uid, page) => _serverReachable ? _origConv(uid, page) : getLocalConversation(uid);

      const _origSend = Messages.send.bind(Messages);
      Messages.send = async (recipientId, content) => {
        if (!_serverReachable) {
          enqueue({ method:'POST', path:'/messages/send', body:{ recipientId, content } });
          /* Save to local dm log */
          const log = ls(`eylox_dm_${recipientId}`, []);
          const user = ls('eylox_user', {});
          log.push({ id: Date.now(), senderId: user?.id || 'me', content, createdAt: new Date().toISOString(), offline: true });
          lsSet(`eylox_dm_${recipientId}`, log.slice(-200));
          return { queued: true, offline: true };
        }
        return _origSend(recipientId, content);
      };
    }

    /* ── Notifications ── */
    if (typeof Notifications !== 'undefined' && !Notifications._offlinePatched) {
      Notifications._offlinePatched = true;
      const _origAll = Notifications.getAll.bind(Notifications);
      Notifications.getAll = async (params) => _serverReachable ? _origAll(params) : { notifications: getLocalNotifications() };
      const _origCount = Notifications.getUnreadCount.bind(Notifications);
      Notifications.getUnreadCount = async () => _serverReachable ? _origCount() : { count: getLocalNotifications().filter(n => !n.read).length };
    }

    /* ── Leaderboards ── */
    if (typeof Leaderboards !== 'undefined' && !Leaderboards._offlinePatched) {
      Leaderboards._offlinePatched = true;
      const _origAll = Leaderboards.getAll.bind(Leaderboards);
      Leaderboards.getAll = async (params) => _serverReachable ? _origAll(params) : [getLocalLeaderboard('Eylux'), getLocalLeaderboard('wins')];
      const _origCat = Leaderboards.getByCategory.bind(Leaderboards);
      Leaderboards.getByCategory = async (cat) => _serverReachable ? _origCat(cat) : getLocalLeaderboard(cat);
    }

    /* ── Achievements ── */
    if (typeof Achievements !== 'undefined' && !Achievements._offlinePatched) {
      Achievements._offlinePatched = true;
      const _origAll = Achievements.getAll.bind(Achievements);
      Achievements.getAll = async (params) => _serverReachable ? _origAll(params) : getLocalAchievements();
      const _origUser = Achievements.getUserAchievements.bind(Achievements);
      Achievements.getUserAchievements = async (uid) => _serverReachable ? _origUser(uid) : getLocalAchievements().filter(a => a.unlocked);

      const _origUnlock = Achievements.unlock.bind(Achievements);
      Achievements.unlock = async (code) => {
        /* Always unlock locally */
        const unlocked = ls('eylox_achievements_unlocked', []);
        if (!unlocked.includes(code)) {
          unlocked.push(code);
          lsSet('eylox_achievements_unlocked', unlocked);
          /* Reward locally */
          const ach = ACHIEVEMENT_CATALOG.find(a => a.code === code);
          if (ach?.reward?.coins) {
            const user = ls('eylox_user', {});
            if (user) { user.coins = (user.coins || 0) + ach.reward.coins; lsSet('eylox_user', user); }
          }
        }
        if (!_serverReachable) {
          enqueue({ method:'POST', path:`/achievements/${code}/unlock`, body: null });
          return { unlocked: true, offline: true };
        }
        return _origUnlock(code);
      };
    }

    /* ── Communities ── */
    if (typeof Communities !== 'undefined' && !Communities._offlinePatched) {
      Communities._offlinePatched = true;
      const _origAll = Communities.getAll.bind(Communities);
      Communities.getAll = async (params) => _serverReachable ? _origAll(params) : getLocalCommunities();

      const _origJoin = Communities.join.bind(Communities);
      Communities.join = async (id) => {
        if (!_serverReachable) {
          enqueue({ method:'POST', path:`/communities/${id}/join`, body: null });
          /* Save locally */
          const joined = ls('eylox_communities_joined', []);
          if (!joined.includes(id)) { joined.push(id); lsSet('eylox_communities_joined', joined); }
          return { joined: true, offline: true };
        }
        return _origJoin(id);
      };
    }

    /* ── Games ── */
    if (typeof Games !== 'undefined' && !Games._offlinePatched) {
      Games._offlinePatched = true;
      const OFFLINE_GAMES = [
        { id:'ninja-dash',    name:'Ninja Dash',     icon:'🥷', type:'2d', description:'Sprint through neon cities.', url:'game.html', coins:true },
        { id:'block-stacker', name:'Block Stacker',  icon:'🧱', type:'3d', description:'Stack perfect towers.',        url:'game3d-obby.html', wins:true },
        { id:'ocean-cleanup', name:'Ocean Cleanup',  icon:'🌊', type:'3d', description:'Sail and collect treasures.',  url:'game3d-pirate.html', wins:true },
        { id:'neon-racer',    name:'Neon Racer',     icon:'🏎️', type:'3d', description:'Full-throttle street racing.', url:'game3d-city.html', wins:true },
        { id:'crystal',       name:'Crystal Catcher',icon:'💎', type:'3d', description:'Dive into treasure caverns.',  url:'game3d-treasure.html', wins:true },
        { id:'candy-chaos',   name:'Candy Chaos',    icon:'🍬', type:'3d', description:'Sweet chaotic fun.',           url:'game3d-obby.html', wins:true },
      ];
      const _origList = Games.list.bind(Games);
      Games.list = async (params) => _serverReachable ? _origList(params) : OFFLINE_GAMES;
    }

    /* ── Marketplace / Shop ── */
    if (typeof Marketplace !== 'undefined' && !Marketplace._offlinePatched) {
      Marketplace._offlinePatched = true;
      const _origItems = Marketplace.getItems.bind(Marketplace);
      Marketplace.getItems = async (params) => _serverReachable ? _origItems(params) : getLocalShopItems();
      const _origFeatured = Marketplace.getFeatured.bind(Marketplace);
      Marketplace.getFeatured = async () => _serverReachable ? _origFeatured() : getLocalShopItems('avatar').slice(0, 4);
      const _origInv = Marketplace.getInventory.bind(Marketplace);
      Marketplace.getInventory = async () => _serverReachable ? _origInv() : (ls('eylox_inventory', []));

      const _origBuy = Marketplace.buy.bind(Marketplace);
      Marketplace.buy = async (itemId) => {
        const item = OFFLINE_SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return null;
        const user = ls('eylox_user', {});
        if (!user) return null;
        const cost = item.currency === 'wins' ? 0 : (item.price || 0);
        if (cost > 0 && (user.coins || 0) < cost) return { error: 'Not enough coins', offline: true };
        user.coins = (user.coins || 0) - cost;
        lsSet('eylox_user', user);
        const inv = ls('eylox_inventory', []);
        if (!inv.includes(itemId)) { inv.push(itemId); lsSet('eylox_inventory', inv); }
        if (!_serverReachable) enqueue({ method:'POST', path:`/marketplace/items/${itemId}/buy`, body: null });
        return { success: true, item, offline: !_serverReachable };
      };
    }
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION 6 — GAME STATE PERSISTENCE
     Ensure all game progress is always saved locally
  ═══════════════════════════════════════════════════════════ */
  function ensureGameStatePersistence() {
    /* Intercept beforeunload to flush any pending game state */
    window.addEventListener('beforeunload', () => {
      const user = ls('eylox_user', null);
      if (user?.username) {
        lsSet(`eylox_userdata_${user.username}`, user);
      }
    });

    /* Periodic auto-save every 30 seconds */
    setInterval(() => {
      const user = ls('eylox_user', null);
      if (user?.username) {
        lsSet(`eylox_userdata_${user.username}`, user);
        lsSet('eylox_autosave_ts', Date.now());
      }
    }, 30000);
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION 7 — INSTALL PROMPT (PWA)
  ═══════════════════════════════════════════════════════════ */
  let _deferredInstall = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredInstall = e;
    if (!ls('eylox_install_dismissed', false)) {
      setTimeout(showInstallPrompt, 8000);
    }
  });

  function showInstallPrompt() {
    if (!_deferredInstall) return;
    if (ls('eylox_install_dismissed', false)) return;

    /* Prefer the FAB panel if available — avoids a second floating element */
    if (window.EyloxFAB) {
      if (!document.getElementById('efab-install')) {
        window.EyloxFAB.add({
          id:    'install',
          icon:  '📲',
          label: 'Install App',
          bg:    'linear-gradient(135deg,#0f172a,#334155)',
          color: '#94a3b8',
          async onClick() {
            await _deferredInstall?.prompt();
            _deferredInstall = null;
            window.EyloxFAB.remove('install');
          },
        });
      }
      return;
    }

    /* Fallback: standalone card (only when FAB panel isn't present) */
    if (document.getElementById('eylox-install-prompt')) return;
    injectIndicatorCSS();
    const prompt = document.createElement('div');
    prompt.id = 'eylox-install-prompt';
    prompt.style.cssText = `
      position:fixed;bottom:80px;right:18px;z-index:99999;
      background:rgba(8,4,22,.97);border:1px solid rgba(167,139,250,.28);border-radius:16px;
      padding:18px 20px;max-width:290px;
      box-shadow:0 20px 60px rgba(0,0,0,.65);
      backdrop-filter:blur(20px);font-family:'Nunito',sans-serif;
    `;
    prompt.innerHTML = `
      <div style="font-size:1.5rem;margin-bottom:8px">📲</div>
      <div style="font-weight:900;color:#fff;font-size:.9rem;margin-bottom:6px;font-family:'Fredoka One',cursive">Install Eylox</div>
      <div style="font-size:.76rem;color:rgba(210,195,240,.6);font-weight:700;line-height:1.5;margin-bottom:14px">
        Play offline, faster load times, and a native app experience — no app store needed!
      </div>
      <div style="display:flex;gap:8px">
        <button id="eylox-install-yes" style="flex:1;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;padding:9px;font-family:'Fredoka One',cursive;font-size:.86rem;cursor:pointer">Install</button>
        <button id="eylox-install-no"  style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:rgba(167,139,250,.7);border-radius:10px;padding:9px 14px;font-family:'Fredoka One',cursive;font-size:.86rem;cursor:pointer">Later</button>
      </div>`;
    document.body.appendChild(prompt);
    document.getElementById('eylox-install-yes').addEventListener('click', async () => {
      prompt.remove(); await _deferredInstall.prompt(); _deferredInstall = null;
    });
    document.getElementById('eylox-install-no').addEventListener('click', () => {
      prompt.remove(); lsSet('eylox_install_dismissed', true);
    });
  }

  window.addEventListener('appinstalled', () => {
    _deferredInstall = null;
    showOfflineToast('🎉 Eylox installed! You can now play offline anytime.');
  });

  /* ═══════════════════════════════════════════════════════════
     SECTION 8 — INIT
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    ensureGameStatePersistence();
    maybeClaimDailyReward();

    /* If already offline on load, show indicator and patch APIs immediately */
    if (!navigator.onLine) {
      _serverReachable = false;
      showOfflineIndicator('offline');
      /* Patch after a short delay to ensure API objects are defined */
      setTimeout(patchAPIs, 500);
    }

    /* Ensure APIs are patched for offline use whenever they change */
    setTimeout(patchAPIs, 800);
  });

  /* ── Public API ── */
  window.EyloxOffline = {
    /* Genuine device connectivity — this is what gates the full-screen
       "Connection Lost" experience (Eylox Dash). A server-side hiccup while
       the device itself is online does NOT flip this to false. */
    isOnline:          () => !_deviceOffline,
    /* Can EYLOX's own server currently be reached (independent of device
       connectivity — false here with isOnline() true means "server unreachable"). */
    isServerReachable: () => _serverReachable,
    showModal:         showOfflineModal,
    hideModal:         hideOfflineModal,
    getLeaderboard:    getLocalLeaderboard,
    getFriends:        getLocalFriends,
    getShopItems:      getLocalShopItems,
    getAchievements:   getLocalAchievements,
    getCommunities:    getLocalCommunities,
    getNotifications:  getLocalNotifications,
    claimDailyReward:  claimOfflineDailyReward,
    syncQueue:         processSyncQueue,
    showInstallPrompt,
    enqueue,
  };

})();
