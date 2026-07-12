/* ============================================================
   EYLOX — Live Events System v2.0
   Concerts, battles, treasure hunts, tournaments, live
   announcements, countdowns, event rewards, auto-teleport.
   ============================================================ */
'use strict';

(function EyloxLiveEvents() {

  /* ── Event types ── */
  const EVENT_TYPES = {
    concert:     { icon:'🎵', color:'#ec4899', label:'Concert' },
    battle:      { icon:'⚔️', color:'#ef4444', label:'Battle Royale' },
    treasure:    { icon:'🪙', color:'#f59e0b', label:'Treasure Hunt' },
    tournament:  { icon:'🏆', color:'#a78bfa', label:'Tournament' },
    update:      { icon:'🚀', color:'#60a5fa', label:'Major Update' },
    challenge:   { icon:'🎯', color:'#22c55e', label:'Daily Challenge' },
    party:       { icon:'🎉', color:'#f97316', label:'Party Event' },
  };

  /* ── Game page for each event (auto-teleport destination) ── */
  const EVENT_GAME_URL = {
    'ev_concert_001':    'games.html',
    'ev_battle_001':     'game3d-obby.html',
    'ev_treasure_001':   'game3d-treasure.html',
    'ev_tournament_001': 'game3d-city.html',
    'ev_challenge_001':  'games.html',
    'ev_party_001':      'game3d-city.html',
    'ev_pirate_001':     'game3d-pirate.html',
  };

  /* ── Simulated live events schedule ── */
  function _generateEvents() {
    const now = Date.now();
    const H = 3600000;
    return [
      {
        id: 'ev_concert_001',
        type: 'concert',
        title: 'Neon Beats Live',
        description: 'An in-game concert featuring procedural music and light shows. Attend to earn the exclusive "Bass Drop" emote!',
        startTime: now + 2 * H,
        endTime:   now + 4 * H,
        reward: { coins: 200, wins: 0, item: 'bass_drop_emote' },
        maxParticipants: 500,
        joined: false,
        gameUrl: 'games.html'
      },
      {
        id: 'ev_battle_001',
        type: 'battle',
        title: 'Eylox Battle Royale',
        description: 'Last squad standing wins! 50 players, shrinking zone, random weapon drops. Top 3 get exclusive rewards.',
        startTime: now + 30 * 60000,
        endTime:   now + 90 * 60000,
        reward: { coins: 0, wins: 3, item: 'battle_crown' },
        maxParticipants: 50,
        joined: false,
        gameUrl: 'game3d-obby.html'
      },
      {
        id: 'ev_treasure_001',
        type: 'treasure',
        title: 'Gold Rush Hunt',
        description: 'Hidden treasure chests scattered across the world. Find them all before time runs out!',
        startTime: now + 6 * H,
        endTime:   now + 9 * H,
        reward: { coins: 350, wins: 1, item: 'gold_compass' },
        maxParticipants: 200,
        joined: false,
        gameUrl: 'game3d-treasure.html'
      },
      {
        id: 'ev_tournament_001',
        type: 'tournament',
        title: 'Weekly Championship',
        description: 'The biggest ranked tournament of the week. Single-elimination bracket. Champion gets a trophy + 5 Wins.',
        startTime: now + 24 * H,
        endTime:   now + 30 * H,
        reward: { coins: 500, wins: 5, item: 'champion_trophy' },
        maxParticipants: 64,
        joined: false,
        gameUrl: 'game3d-city.html'
      },
      {
        id: 'ev_challenge_001',
        type: 'challenge',
        title: "Today's Daily Challenge",
        description: 'Complete 3 games in any world without losing. Bonus coins for speed runs!',
        startTime: now - H,
        endTime:   now + 23 * H,
        reward: { coins: 150, wins: 0 },
        maxParticipants: Infinity,
        joined: false,
        gameUrl: 'games.html'
      },
      {
        id: 'ev_pirate_001',
        type: 'battle',
        title: 'Pirate Sea Battle',
        description: 'Sail the seas and battle other pirates! Sink the most ships to claim the treasure and earn exclusive Wins.',
        startTime: now + 4 * H,
        endTime:   now + 7 * H,
        reward: { coins: 100, wins: 2, item: 'pirate_flag' },
        maxParticipants: 30,
        joined: false,
        gameUrl: 'game3d-pirate.html'
      },
    ];
  }

  let _events = [];
  function getEvents() { return _events; }

  function loadEvents() {
    try {
      const saved = JSON.parse(localStorage.getItem('eylox_live_events') || 'null');
      /* Refresh events that have all ended */
      if (!saved || saved.every(e => Date.now() > e.endTime)) {
        _events = _generateEvents();
        localStorage.setItem('eylox_live_events', JSON.stringify(_events));
      } else {
        _events = saved;
      }
    } catch {
      _events = _generateEvents();
    }
  }

  function saveEvents() {
    localStorage.setItem('eylox_live_events', JSON.stringify(_events));
  }

  /* ── Join Event — with auto-teleport when LIVE ── */
  function joinEvent(eventId) {
    const ev = _events.find(e => e.id === eventId);
    if (!ev) return;
    if (ev.joined) {
      /* If LIVE and already joined, offer instant re-teleport */
      if (Date.now() >= ev.startTime && Date.now() <= ev.endTime) {
        _teleportToEvent(ev);
      } else {
        _toast('Already joined this event!', 'info');
      }
      return;
    }
    if (Date.now() > ev.endTime) { _toast('This event has already ended.', 'warn'); return; }
    ev.joined = true;
    saveEvents();
    document.dispatchEvent(new CustomEvent('eylox:event:joined', { detail: ev }));
    /* If event is LIVE NOW → teleport immediately */
    if (Date.now() >= ev.startTime && Date.now() <= ev.endTime) {
      _teleportToEvent(ev);
    } else {
      _toast(`✅ Joined: ${ev.title}! Starts in ${_countdown(ev.startTime)}`, 'success');
      /* Challenges that are active get reward right away */
      if (ev.type === 'challenge') setTimeout(() => _checkClaim(eventId), 1000);
    }
    _refreshEventPanel();
  }

  /* ── Teleport overlay → redirect to game page ── */
  function _teleportToEvent(ev) {
    const cfg = EVENT_TYPES[ev.type] || { icon:'🎮', color:'#a78bfa', label:'Event' };
    /* Close events panel */
    const panel = document.getElementById('eylox-events-panel');
    if (panel) panel.remove();
    /* Inject teleport CSS if needed */
    if (!document.getElementById('eylox-teleport-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-teleport-css';
      s.textContent = `
        @keyframes tpIn   { from{opacity:0;transform:scale(1.08)} to{opacity:1;transform:scale(1)} }
        @keyframes tpOut  { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(.9)} }
        @keyframes tpPulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes tpSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        #eylox-teleport-overlay {
          position:fixed;inset:0;z-index:999999;
          background:radial-gradient(ellipse at center,rgba(30,10,60,.97) 0%,rgba(5,2,15,.99) 100%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;
          animation:tpIn .4s ease both;
        }
        .tp-icon { font-size:4rem; animation:tpPulse 1s ease-in-out infinite; }
        .tp-ring {
          width:100px;height:100px;border-radius:50%;
          border:3px solid transparent;
          border-top-color:${cfg.color};border-right-color:${cfg.color}66;
          animation:tpSpin .9s linear infinite;
          position:absolute;
        }
        .tp-portal { position:relative;width:100px;height:100px;display:flex;align-items:center;justify-content:center; }
        .tp-title { font-size:1.3rem;font-weight:900;color:#fff;text-align:center; }
        .tp-sub   { font-size:.82rem;color:rgba(200,190,230,.55);text-align:center; }
        .tp-bar-wrap { width:220px;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden; }
        .tp-bar { height:100%;background:${cfg.color};border-radius:99px;width:0%;transition:width 1.8s ease; }
      `;
      document.head.appendChild(s);
    }
    const overlay = document.createElement('div');
    overlay.id = 'eylox-teleport-overlay';
    overlay.innerHTML = `
      <div class="tp-portal">
        <div class="tp-ring"></div>
        <div class="tp-icon">${cfg.icon}</div>
      </div>
      <div class="tp-title">${ev.title}</div>
      <div class="tp-sub">Teleporting you to the event world…</div>
      <div class="tp-bar-wrap"><div class="tp-bar" id="tp-bar"></div></div>
      <div style="font-size:.7rem;color:rgba(200,190,230,.3);margin-top:-12px">Reward on win: ${ev.reward.wins ? `🏆 ${ev.reward.wins} Wins` : `🪙 ${ev.reward.coins} Coins`}</div>
    `;
    document.body.appendChild(overlay);
    /* Animate progress bar */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const bar = document.getElementById('tp-bar');
        if (bar) bar.style.width = '100%';
      });
    });
    /* Store which event the player is joining so on return we can grant reward */
    localStorage.setItem('eylox_pending_event', JSON.stringify({ id: ev.id, type: ev.reward.wins ? 'wins' : 'Eylux', amount: ev.reward.wins || ev.reward.coins }));
    /* Redirect after 2s */
    const dest = ev.gameUrl || 'games.html';
    setTimeout(() => {
      overlay.style.animation = 'tpOut .4s ease both';
      setTimeout(() => { window.location.href = dest; }, 400);
    }, 2000);
  }

  function _checkClaim(eventId) {
    const ev = _events.find(e => e.id === eventId);
    if (!ev?.joined || ev.claimed) return;
    ev.claimed = true;
    saveEvents();
    _grantReward(ev);
  }

  function _grantReward(ev) {
    const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
    let msg = '';
    if (ev.reward.wins) {
      user.wins = (user.wins || 0) + ev.reward.wins;
      msg = `🏆 +${ev.reward.wins} Wins from ${ev.title}!`;
    } else if (ev.reward.coins) {
      user.coins = (user.coins || 0) + ev.reward.coins;
      msg = `🪙 +${ev.reward.coins} Coins from ${ev.title}!`;
    }
    localStorage.setItem('eylox_user', JSON.stringify(user));
    if (msg) _toast(msg, 'success');
    /* Inventory item reward */
    if (ev.reward.item) {
      try {
        const inv = JSON.parse(localStorage.getItem('eylox_inventory') || '[]');
        if (!inv.some(i => i.id === ev.reward.item)) {
          inv.push({ id: ev.reward.item, name: ev.reward.item.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), rarity:'rare', type:'cosmetic', icon: EVENT_TYPES[ev.type]?.icon || '🎁', source: ev.title });
          localStorage.setItem('eylox_inventory', JSON.stringify(inv));
        }
      } catch {}
    }
    document.dispatchEvent(new CustomEvent('eylox:event:reward', { detail: { ev, reward: ev.reward } }));
  }

  /* ── Check for pending event reward on page load ── */
  function checkPendingEventReward() {
    try {
      const pending = JSON.parse(localStorage.getItem('eylox_pending_event') || 'null');
      if (!pending) return;
      localStorage.removeItem('eylox_pending_event');
      const ev = _events.find(e => e.id === pending.id);
      if (!ev || ev.claimed) return;
      /* Show a "Did you win?" prompt after 3s */
      setTimeout(() => _showEventReturnPrompt(ev), 3000);
    } catch {}
  }

  function _showEventReturnPrompt(ev) {
    const cfg = EVENT_TYPES[ev.type] || { icon:'🎮', color:'#a78bfa', label:'Event' };
    const rewardText = ev.reward.wins ? `🏆 ${ev.reward.wins} Wins` : `🪙 ${ev.reward.coins} Coins`;
    if (!document.getElementById('eylox-event-return-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-event-return-css';
      s.textContent = `@keyframes erIn { from{opacity:0;transform:translateY(20px) scale(.95)} to{opacity:1;transform:none} }
      #eylox-event-return { animation:erIn .4s cubic-bezier(.34,1.56,.64,1) both; }`;
      document.head.appendChild(s);
    }
    const el = document.createElement('div');
    el.id = 'eylox-event-return';
    el.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:99999;
      background:rgba(10,3,28,.98);border:1.5px solid ${cfg.color}55;border-radius:20px;
      padding:20px 24px;min-width:280px;max-width:90vw;
      box-shadow:0 16px 48px rgba(0,0,0,.6),0 0 20px ${cfg.color}22;text-align:center;`;
    el.innerHTML = `
      <div style="font-size:2rem;margin-bottom:8px">${cfg.icon}</div>
      <div style="font-size:.9rem;font-weight:900;color:#fff;margin-bottom:4px">${ev.title}</div>
      <div style="font-size:.72rem;color:rgba(200,190,230,.5);margin-bottom:16px">Did you win the event?</div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button onclick="EyloxLiveEvents._claimEventWin('${ev.id}','won')" style="flex:1;padding:10px 16px;border-radius:99px;background:${cfg.color};border:none;color:#fff;font-weight:900;font-size:.82rem;cursor:pointer">🏆 I Won! (+${rewardText})</button>
        <button onclick="EyloxLiveEvents._claimEventWin('${ev.id}','lost')" style="padding:10px 16px;border-radius:99px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4);font-size:.78rem;font-weight:700;cursor:pointer">Didn't win</button>
      </div>
    `;
    document.body.appendChild(el);
    /* Auto-dismiss after 30s */
    setTimeout(() => { if (el.parentNode) el.remove(); }, 30000);
  }

  /* ── Countdown helper ── */
  function _countdown(ts) {
    const diff = ts - Date.now();
    if (diff <= 0) return 'LIVE NOW';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function _statusLabel(ev) {
    const now = Date.now();
    if (now < ev.startTime) return { label: `Starts in ${_countdown(ev.startTime)}`, color: '#60a5fa', live: false };
    if (now >= ev.startTime && now <= ev.endTime) return { label: '🔴 LIVE NOW', color: '#ef4444', live: true };
    return { label: 'Ended', color: 'rgba(255,255,255,.2)', live: false };
  }

  /* ── Live Events Panel ── */
  function openEventsPanel() {
    if (document.getElementById('eylox-events-panel')) {
      document.getElementById('eylox-events-panel').remove(); return;
    }
    loadEvents();
    _buildEventsPanel();
  }

  function _buildEventsPanel() {
    if (!document.getElementById('eylox-events-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-events-css';
      s.textContent = `
        @keyframes evPanelIn { from{opacity:0;transform:translate(-50%,-54%) scale(.94)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes liveRing  { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
        .ev-card { background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.12);border-radius:14px;padding:14px;margin-bottom:10px;transition:border-color .2s; }
        .ev-card:hover { border-color:rgba(167,139,250,.28); }
        .ev-live-dot { width:8px;height:8px;border-radius:50%;background:#ef4444;animation:liveRing 1.5s infinite;flex-shrink:0; }
      `;
      document.head.appendChild(s);
    }
    const panel = document.createElement('div');
    panel.id = 'eylox-events-panel';
    panel.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99996;
      background:rgba(10,3,28,.98);border:1px solid rgba(167,139,250,.25);border-radius:24px;
      width:min(520px,95vw);max-height:85vh;overflow-y:auto;
      box-shadow:0 24px 80px rgba(0,0,0,.7);
      animation:evPanelIn .3s cubic-bezier(.34,1.56,.64,1) both;
    `;
    panel.innerHTML = `
      <div style="padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <div style="font-size:1.1rem;font-weight:900;color:#fff">🔥 Live Events</div>
            <div style="font-size:.65rem;color:rgba(167,139,250,.4);margin-top:2px">Join events to earn exclusive rewards</div>
          </div>
          <button onclick="document.getElementById('eylox-events-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:32px;height:32px;color:rgba(255,255,255,.5);cursor:pointer">×</button>
        </div>
        <div id="ev-list">${_eventsListHTML()}</div>
      </div>
    `;
    document.body.appendChild(panel);
    /* Start live countdown updater */
    const timer = setInterval(() => {
      const evList = document.getElementById('ev-list');
      if (!evList) { clearInterval(timer); return; }
      evList.innerHTML = _eventsListHTML();
    }, 1000);
  }

  function _eventsListHTML() {
    return _events.map(ev => {
      const cfg = EVENT_TYPES[ev.type] || { icon:'🎮', color:'#a78bfa', label:'Event' };
      const status = _statusLabel(ev);
      return `
        <div class="ev-card">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="width:44px;height:44px;border-radius:12px;background:${cfg.color}22;border:1px solid ${cfg.color}44;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">${cfg.icon}</div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                ${status.live ? '<div class="ev-live-dot"></div>' : ''}
                <div style="font-size:.85rem;font-weight:900;color:#fff">${ev.title}</div>
              </div>
              <div style="font-size:.65rem;font-weight:700;color:${cfg.color};margin-bottom:6px">${cfg.label}</div>
              <div style="font-size:.72rem;color:rgba(200,190,230,.55);margin-bottom:8px;line-height:1.4">${ev.description}</div>
              <!-- Rewards -->
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
                ${ev.reward.coins ? `<span style="font-size:.65rem;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:99px;padding:2px 8px;color:#f59e0b;font-weight:800">🪙 ${ev.reward.coins}</span>` : ''}
                ${ev.reward.xp ? `<span style="font-size:.65rem;background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.25);border-radius:99px;padding:2px 8px;color:#60a5fa;font-weight:800">⭐ ${ev.reward.xp} XP</span>` : ''}
                ${ev.reward.item ? `<span style="font-size:.65rem;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.25);border-radius:99px;padding:2px 8px;color:#a78bfa;font-weight:800">🎁 Exclusive Item</span>` : ''}
              </div>
              <!-- Status row -->
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:.68rem;font-weight:800;color:${status.color}">${status.label}</span>
                ${ev.claimed ? '<span style="font-size:.7rem;color:#22c55e;font-weight:900">✓ Reward Claimed</span>'
                  : ev.joined ? '<span style="font-size:.7rem;color:#a78bfa;font-weight:900">✓ Joined</span>'
                  : Date.now() > ev.endTime ? '<span style="font-size:.7rem;color:rgba(255,255,255,.2)">Ended</span>'
                  : `<button onclick="EyloxLiveEvents.joinEvent('${ev.id}')" style="background:rgba(167,139,250,.18);border:1px solid rgba(167,139,250,.35);border-radius:99px;padding:6px 16px;color:#e0d4ff;cursor:pointer;font-size:.75rem;font-weight:800;transition:all .15s" onmouseover="this.style.background='rgba(167,139,250,.3)'" onmouseout="this.style.background='rgba(167,139,250,.18)'">Join Event</button>`}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function _refreshEventPanel() {
    const evList = document.getElementById('ev-list');
    if (evList) evList.innerHTML = _eventsListHTML();
  }

  /* ── Live Banner (shown at top of page for LIVE events) ── */
  function checkLiveBanner() {
    const liveEv = _events.find(e => Date.now() >= e.startTime && Date.now() <= e.endTime);
    if (!liveEv) return;
    if (document.getElementById('eylox-live-banner')) return;
    const cfg = EVENT_TYPES[liveEv.type] || { icon:'🔴', color:'#a78bfa', label:'Event' };
    const banner = document.createElement('div');
    banner.id = 'eylox-live-banner';
    banner.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:99995;
      background:linear-gradient(90deg,${cfg.color}22,rgba(10,3,28,.9),${cfg.color}22);
      border-bottom:1px solid ${cfg.color}44;
      padding:8px 16px;display:flex;align-items:center;gap:10px;
      cursor:pointer;
    `;
    banner.innerHTML = `
      <div style="width:8px;height:8px;border-radius:50%;background:${cfg.color};animation:liveRing 1.5s infinite;flex-shrink:0"></div>
      <div style="font-size:.8rem;font-weight:900;color:#fff;flex:1">${cfg.icon} ${liveEv.title} is LIVE NOW!</div>
      <div style="font-size:.72rem;color:rgba(255,255,255,.5)">Ends in ${_countdown(liveEv.endTime)}</div>
      <button onclick="document.getElementById('eylox-live-banner').remove()" style="background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:1rem;padding:0 4px">×</button>
    `;
    banner.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') openEventsPanel(); });
    document.body.appendChild(banner);
  }

  /* ── In-game live event announcements ── */
  function announceEvent(ev) {
    const cfg = EVENT_TYPES[ev.type] || { icon:'🎮', color:'#a78bfa', label:'Event' };
    const ann = document.createElement('div');
    ann.style.cssText = `
      position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:99994;
      background:rgba(10,3,28,.95);border:1px solid ${cfg.color}55;border-radius:99px;
      padding:10px 24px;display:flex;align-items:center;gap:10px;
      box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 20px ${cfg.color}22;
      animation:annIn .4s cubic-bezier(.34,1.56,.64,1) both;
      white-space:nowrap;
    `;
    ann.innerHTML = `<span style="font-size:1.2rem">${cfg.icon}</span><span style="font-size:.85rem;font-weight:800;color:#fff">${ev.title} is starting!</span><span style="font-size:.75rem;color:${cfg.color}">Click to join →</span>`;
    if (!document.getElementById('eylox-ann-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-ann-css';
      s.textContent = `@keyframes annIn { from{opacity:0;transform:translateX(-50%) translateY(-20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }`;
      document.head.appendChild(s);
    }
    ann.addEventListener('click', () => { openEventsPanel(); ann.remove(); });
    document.body.appendChild(ann);
    setTimeout(() => { ann.style.transition = 'opacity .5s'; ann.style.opacity = '0'; setTimeout(() => ann.remove(), 500); }, 6000);
  }

  /* ── Claim win / loss after returning from event game ── */
  function _claimEventWin(eventId, result) {
    const el = document.getElementById('eylox-event-return');
    if (el) el.remove();
    const ev = _events.find(e => e.id === eventId);
    if (!ev || ev.claimed) return;
    ev.claimed = true;
    saveEvents();
    if (result === 'won') {
      _grantReward(ev);
      /* Celebration particles */
      ['🏆','⭐','🎉','💰','✨'].forEach((em, i) => {
        const p = document.createElement('div');
        p.textContent = em;
        p.style.cssText = `position:fixed;z-index:999999;font-size:1.8rem;left:${20+i*18}vw;bottom:60px;pointer-events:none;transition:all 1.5s ease-out;opacity:1`;
        document.body.appendChild(p);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          p.style.transform = `translateY(-${80+Math.random()*60}px) rotate(${-30+Math.random()*60}deg)`;
          p.style.opacity = '0';
        }));
        setTimeout(() => p.remove(), 1600);
      });
    } else {
      _toast(`Better luck next time! Check back for more events.`, 'info');
    }
  }

  /* ── Schedule checker ── */
  function startScheduler() {
    setInterval(() => {
      const now = Date.now();
      _events.forEach(ev => {
        /* Fire "starting soon" announcement 5 min before */
        if (!ev._announcedSoon && ev.startTime - now <= 5 * 60000 && ev.startTime > now) {
          ev._announcedSoon = true;
          announceEvent(ev);
        }
        /* Fire live banner when event starts */
        if (!ev._wentLive && now >= ev.startTime && now <= ev.endTime) {
          ev._wentLive = true;
          checkLiveBanner();
          /* Auto-teleport players who already joined when event goes live */
          if (ev.joined && !ev.claimed) {
            setTimeout(() => {
              if (document.visibilityState !== 'hidden') _teleportToEvent(ev);
            }, 2000);
          }
        }
      });
    }, 30000);
  }

  /* ── Topbar Events button ── */
  function injectEventsBtn() {
    if (document.getElementById('tb-events-btn')) return;
    const topbar = document.querySelector('.topbar-right, .tb-right, .topbar');
    if (!topbar) return;
    const liveCount = _events.filter(e => Date.now() >= e.startTime && Date.now() <= e.endTime).length;
    const btn = document.createElement('button');
    btn.id = 'tb-events-btn';
    btn.title = 'Live Events';
    btn.style.cssText = `position:relative;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:5px 10px;cursor:pointer;font-size:.78rem;color:rgba(200,190,230,.7);font-weight:800;transition:all .18s`;
    btn.innerHTML = `🔥 Events${liveCount ? `<span style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#ef4444;border-radius:50%;font-size:.55rem;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900">${liveCount}</span>` : ''}`;
    btn.addEventListener('click', () => openEventsPanel());
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(167,139,250,.22)'; btn.style.color = '#e0d4ff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(167,139,250,.1)'; btn.style.color = 'rgba(200,190,230,.7)'; });
    topbar.appendChild(btn);
  }

  function _toast(msg, type) {
    if (window.EyloxToast) EyloxToast(msg, type, 3000);
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    setTimeout(checkPendingEventReward, 2500);
    startScheduler();
  });

  /* ── Public API ── */
  window.EyloxLiveEvents = { openEventsPanel, joinEvent, getEvents, announceEvent, _claimEventWin };

})();
