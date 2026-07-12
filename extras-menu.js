/* ============================================================
   EYLOX — Extras Menu
   Floating panel with tabs, injected on all hub pages.
   Opens via the ✨ button added to the topbar.
   ============================================================ */
'use strict';

(function EyloxExtrasMenu() {
  const page = document.body?.dataset?.page || '';
  if (['login', 'landing', 'game'].some(p => page.startsWith(p))) return;

  /* ── CSS ── */
  const CSS = `
    #em-btn {
      background: linear-gradient(135deg,#7c3aed,#a855f7);
      border: none; border-radius: 50%;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.05rem; cursor: pointer;
      box-shadow: 0 4px 16px rgba(124,58,237,.5);
      transition: transform .18s, box-shadow .18s;
      flex-shrink: 0;
    }
    #em-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(124,58,237,.7); }
    #em-btn.open  { background: linear-gradient(135deg,#4c1d95,#7c3aed); }

    #em-panel {
      position: fixed;
      top: 62px; right: 16px;
      width: min(400px, calc(100vw - 24px));
      background: linear-gradient(160deg,#130838,#0a0220);
      border: 1px solid rgba(167,139,250,.25);
      border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0,0,0,.75), 0 0 0 1px rgba(167,139,250,.08);
      z-index: 9985;
      overflow: hidden;
      animation: em-drop .22s cubic-bezier(.34,1.56,.64,1);
      display: flex; flex-direction: column;
      max-height: calc(100vh - 80px);
    }
    @keyframes em-drop { from { opacity:0; transform:translateY(-10px) scale(.97); } to { opacity:1; transform:none; } }

    #em-tabs {
      display: flex; gap: 0;
      border-bottom: 1px solid rgba(167,139,250,.15);
      overflow-x: auto; scrollbar-width: none;
      flex-shrink: 0;
    }
    #em-tabs::-webkit-scrollbar { display: none; }

    .em-tab {
      flex-shrink: 0;
      background: transparent; border: none;
      border-bottom: 3px solid transparent;
      color: rgba(157,142,199,.5);
      font-family: 'Nunito', sans-serif; font-weight: 800; font-size: .75rem;
      padding: 12px 14px;
      cursor: pointer;
      transition: color .15s, border-color .15s;
      white-space: nowrap;
    }
    .em-tab:hover { color: #a78bfa; }
    .em-tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }

    #em-body {
      overflow-y: auto; flex: 1;
      scrollbar-width: thin; scrollbar-color: rgba(167,139,250,.2) transparent;
    }
    #em-body::-webkit-scrollbar { width: 4px; }
    #em-body::-webkit-scrollbar-track { background: transparent; }
    #em-body::-webkit-scrollbar-thumb { background: rgba(167,139,250,.2); border-radius: 99px; }

    .em-section { padding: 16px; }
    .em-section + .em-section { border-top: 1px solid rgba(167,139,250,.08); }

    .em-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid rgba(167,139,250,.06);
    }
    .em-row:last-child { border-bottom: none; }
    .em-row-icon { font-size: 1.2rem; flex-shrink: 0; width: 32px; text-align: center; }
    .em-row-body { flex: 1; min-width: 0; }
    .em-row-title { font-size: .82rem; font-weight: 800; color: #f0e8ff; }
    .em-row-sub   { font-size: .65rem; font-weight: 700; color: rgba(157,142,199,.5); margin-top: 1px; }
    .em-row-val   { font-family: 'Fredoka One', cursive; font-size: .9rem; color: #fde68a; flex-shrink: 0; }

    .em-stat-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;
    }
    .em-stat-box {
      background: rgba(167,139,250,.07); border: 1px solid rgba(167,139,250,.12);
      border-radius: 12px; padding: 12px;
      display: flex; align-items: center; gap: 8px;
    }
    .em-stat-num { font-family: 'Fredoka One', cursive; font-size: 1.1rem; line-height: 1; }
    .em-stat-lbl { font-size: .6rem; font-weight: 800; color: rgba(157,142,199,.5); text-transform: uppercase; letter-spacing: .4px; margin-top: 2px; }

    .em-link-btn {
      display: block; width: 100%; text-align: center; text-decoration: none;
      background: rgba(167,139,250,.1); border: 1px solid rgba(167,139,250,.2);
      border-radius: 10px; padding: 9px; margin-top: 10px;
      color: #a78bfa; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: .8rem;
      cursor: pointer; transition: background .15s;
    }
    .em-link-btn:hover { background: rgba(167,139,250,.18); }

    .em-mission-bar {
      height: 4px; border-radius: 99px; background: rgba(167,139,250,.1); overflow: hidden; margin-top: 10px;
    }
    .em-mission-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#7c3aed,#a78bfa); transition: width .5s ease; }

    .em-streak-dots { display: flex; gap: 6px; justify-content: center; margin: 12px 0; flex-wrap: wrap; }
    .em-dot {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-weight: 900; border: 2px solid; font-size: .62rem;
    }

    .em-close {
      position: absolute; top: 10px; right: 12px;
      background: rgba(167,139,250,.08); border: 1px solid rgba(167,139,250,.15);
      color: rgba(157,142,199,.5); width: 24px; height: 24px; border-radius: 50%;
      cursor: pointer; font-size: .75rem;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s, color .15s;
    }
    .em-close:hover { background: rgba(248,113,113,.2); color: #f87171; }
  `;

  function injectCSS() {
    if (document.getElementById('em-css')) return;
    const s = document.createElement('style');
    s.id = 'em-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Helpers ── */
  function ls(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || fallback); } catch { return JSON.parse(fallback); }
  }
  function ago(ts) {
    const d = Date.now() - ts;
    if (d < 60000)    return 'just now';
    if (d < 3600000)  return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }

  /* ── Tab renderers ── */
  const TABS = [
    { id: 'stats',    label: '📊 Stats' },
    { id: 'missions', label: '📋 Missions' },
    { id: 'streak',   label: '🔥 Streak' },
    { id: 'rank',     label: '🏆 Rank' },
    { id: 'activity', label: '⚡ Activity' },
    { id: 'quick',    label: '⚙️ Quick' },
  ];

  function renderStats() {
    const u = ls('eylox_user', 'null');
    if (!u) return '<div class="em-section" style="text-align:center;color:rgba(157,142,199,.5);font-size:.85rem;padding:30px">Log in to see your stats.</div>';
    const rp      = ls('eylox_recently_played', '[]');
    const friends = ls('eylox_friends', '[]');
    const claimed = ls('eylox_claimed_achievements', '[]');
    const dr      = ls('eylox_daily_rewards', '{}');
    const boxes = [
      { icon: '🪙', val: (u.coins || 0).toLocaleString(), lbl: 'Eylux',   color: '#fde68a' },
      { icon: '🏆', val: (u.wins  || 0).toLocaleString(), lbl: 'Wins',    color: '#a78bfa' },
      { icon: '🎮', val: new Set(rp.map(e => e?.id || e)).size, lbl: 'Games',   color: '#60a5fa' },
      { icon: '🤝', val: friends.length,                  lbl: 'Friends', color: '#4ade80' },
      { icon: '🎖️', val: claimed.length,                  lbl: 'Eylicons',  color: '#fb923c' },
      { icon: '🔥', val: (dr.streak || 0) + 'd',          lbl: 'Streak',  color: '#f472b6' },
    ];
    return `
      <div class="em-section">
        <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:#f0e8ff;margin-bottom:10px">
          ${u.avatar || '🎮'} ${u.username}
        </div>
        <div class="em-stat-grid">
          ${boxes.map(b => `
            <div class="em-stat-box">
              <div style="font-size:1.3rem">${b.icon}</div>
              <div>
                <div class="em-stat-num" style="color:${b.color}">${b.val}</div>
                <div class="em-stat-lbl">${b.lbl}</div>
              </div>
            </div>`).join('')}
        </div>
        <a href="profile.html" class="em-link-btn">View Full Profile →</a>
      </div>`;
  }

  function renderMissions() {
    const KEY = 'eylox_missions_today';
    const MISSIONS = [
      { id:'play_game',  icon:'🎮', title:'Play Any Game',    coins:100,  check:()=>{ const rp=ls('eylox_recently_played','[]'); const mid=new Date().setHours(0,0,0,0); return rp.some(e=>(e.playedAt||0)>=mid); } },
      { id:'earn_coins', icon:'💰', title:'Coin Collector',   coins:150,  check:()=>{ const lb=ls('eylox_lb_entries','[]'); const mid=new Date().setHours(0,0,0,0); return lb.filter(e=>e.ts>=mid).reduce((s,e)=>s+(e.score||0),0)>=500; } },
      { id:'chat_msg',   icon:'💬', title:'Social Butterfly', coins:75,   check:()=>{ const cc=ls('eylox_chat_count','{}'); return (cc[new Date().toDateString()]||0)>=1; } },
      { id:'join_event', icon:'⚡', title:'Event Joiner',     coins:200,  check:()=>ls('eylox_joined_events','[]').length>=1 },
      { id:'visit_shop', icon:'🛒', title:'Window Shopper',   coins:50,   check:()=>{ const vp=ls('eylox_pages_visited','{}'); return !!(vp[new Date().toDateString()]?.['shop.html']); } },
    ];
    let d = {};
    try {
      const raw = ls(KEY, '{}');
      d = raw.date === new Date().toDateString() ? raw : { date: new Date().toDateString(), claimed: [] };
    } catch {}
    const claimed = d.claimed || [];
    const done = MISSIONS.filter(m => m.check() || claimed.includes(m.id)).length;
    const pct  = Math.round(done / MISSIONS.length * 100);

    return `
      <div class="em-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:#f0e8ff">Daily Missions</div>
          <div style="font-size:.72rem;font-weight:800;color:#a78bfa">${claimed.length}/${MISSIONS.length} claimed</div>
        </div>
        <div class="em-mission-bar"><div class="em-mission-fill" style="width:${pct}%"></div></div>
        <div style="margin-top:12px">
          ${MISSIONS.map(m => {
            const isClaimed = claimed.includes(m.id);
            const isDone    = m.check();
            return `
            <div class="em-row">
              <div class="em-row-icon" style="${isClaimed?'opacity:.35':''}">${m.icon}</div>
              <div class="em-row-body">
                <div class="em-row-title" style="${isClaimed?'text-decoration:line-through;opacity:.4':''}">${m.title}</div>
              </div>
              ${isClaimed
                ? `<span style="font-size:.7rem;font-weight:900;color:#4ade80">✅ +${m.coins}</span>`
                : isDone
                  ? `<button onclick="EyloxClaimMission('${m.id}');this.closest('#em-panel').querySelector('[data-tab=missions]').click()" style="background:linear-gradient(135deg,#4ade80,#22c55e);border:none;border-radius:8px;padding:4px 10px;color:#052e16;font-family:'Nunito',sans-serif;font-weight:900;font-size:.68rem;cursor:pointer;flex-shrink:0">+${m.coins}🪙</button>`
                  : `<span style="font-size:.7rem;font-weight:800;color:rgba(157,142,199,.3)">+${m.coins}🪙</span>`}
            </div>`;
          }).join('')}
        </div>
        <a href="profile.html#missions" class="em-link-btn">All Missions →</a>
      </div>`;
  }

  function renderStreak() {
    const dr = ls('eylox_daily_rewards', '{}');
    const streak = dr.streak || 0;
    const lastClaim = dr.lastClaim || 0;
    const totalClaimed = dr.totalClaimed || 0;
    const nextIn = lastClaim ? Math.max(0, 86400000 - (Date.now() - lastClaim)) : 0;
    const h = Math.floor(nextIn / 3600000);
    const m = Math.floor((nextIn % 3600000) / 60000);
    const COINS = [100, 200, 350, 500, 750, 1000, 2000];
    const dots = COINS.map((r, i) => {
      const n = i + 1;
      const sty = n < streak  ? 'background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border-color:#a78bfa'
                : n === streak ? 'background:linear-gradient(135deg,#f59e0b,#fde68a);color:#1a0800;border-color:#fde68a;box-shadow:0 0 10px rgba(245,158,11,.45)'
                               : 'background:rgba(167,139,250,.06);color:rgba(157,142,199,.35);border-color:rgba(167,139,250,.18)';
      return `<div class="em-dot" style="${sty}" title="Day ${n}: ${r>=1000?Math.floor(r/1000)+'K':r} coins"><span>${n}</span></div>`;
    }).join('');
    return `
      <div class="em-section">
        <div style="text-align:center;font-family:'Fredoka One',cursive;font-size:1.1rem;color:${streak>0?'#fde68a':'rgba(157,142,199,.5)'}">
          ${streak > 0 ? `🔥 ${streak}-Day Streak!` : 'No streak yet'}
        </div>
        <div class="em-streak-dots">${dots}</div>
        <div style="text-align:center;font-size:.72rem;font-weight:700;color:rgba(157,142,199,.5)">
          ${lastClaim && nextIn > 0 ? `Next reward in ${h}h ${m}m` : '✅ Claim your daily reward now!'}
        </div>
        ${totalClaimed > 0 ? `<div style="text-align:center;font-size:.65rem;color:rgba(157,142,199,.3);margin-top:4px">Total claimed: ${totalClaimed} days</div>` : ''}
      </div>`;
  }

  function renderRank() {
    const u   = ls('eylox_user', 'null');
    const lb  = ls('eylox_lb_entries', '[]');
    if (!u) return '<div class="em-section" style="text-align:center;color:rgba(157,142,199,.5);font-size:.85rem;padding:20px">Log in to see your rank.</div>';
    const earned = {};
    lb.forEach(e => { const k=e.user?.toLowerCase(); earned[k]=(earned[k]||0)+e.score; });
    const myEarned = earned[u.username?.toLowerCase()] || 0;
    const all = Object.values(earned).sort((a,b)=>b-a);
    const rank = all.findIndex(v => v <= myEarned) + 1 || all.length + 1;
    const myEntries = lb.filter(e=>e.user?.toLowerCase()===u.username?.toLowerCase());
    const best = myEntries.length ? Math.max(...myEntries.map(e=>e.score)) : 0;
    const top5 = [...new Set(Object.entries(earned).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k))]
      .map(k => { const e = lb.find(x=>x.user?.toLowerCase()===k); return e ? { user:e.user, avatar:e.avatar||'🎮', coins:earned[k] } : null; }).filter(Boolean);
    return `
      <div class="em-section">
        <div class="em-stat-grid" style="margin-bottom:14px">
          <div class="em-stat-box">
            <div style="font-size:1.3rem">🏅</div>
            <div><div class="em-stat-num" style="color:#fde68a">${rank ? '#'+rank : '—'}</div><div class="em-stat-lbl">Your Rank</div></div>
          </div>
          <div class="em-stat-box">
            <div style="font-size:1.3rem">⭐</div>
            <div><div class="em-stat-num" style="color:#a78bfa">${myEarned.toLocaleString()}</div><div class="em-stat-lbl">Total Earned</div></div>
          </div>
        </div>
        <div style="font-size:.7rem;font-weight:900;color:rgba(157,142,199,.5);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Top 5 Players</div>
        ${top5.map((p,i) => `
          <div class="em-row">
            <div class="em-row-icon">${['🥇','🥈','🥉','#4','#5'][i]}</div>
            <div class="em-row-body"><div class="em-row-title">${p.avatar} ${p.user}</div></div>
            <div class="em-row-val">🪙 ${p.coins.toLocaleString()}</div>
          </div>`).join('') || '<div style="color:rgba(157,142,199,.4);font-size:.8rem;text-align:center;padding:10px">Play games to appear here!</div>'}
        <a href="leaderboard.html" class="em-link-btn">Full Leaderboard →</a>
      </div>`;
  }

  function renderActivity() {
    const u = ls('eylox_user', 'null');
    const username = u?.username?.toLowerCase() || '';
    const events = [];
    try { ls('eylox_game_sessions','[]').slice(-10).forEach(s=>events.push({t:s.t||0,icon:'🎮',text:`Played ${s.title||s.id}`})); } catch {}
    try { ls('eylox_lb_entries','[]').filter(e=>(e.user||'').toLowerCase()===username).slice(-8).forEach(e=>events.push({t:e.ts||0,icon:'🏅',text:`Scored ${(e.score||0).toLocaleString()} in ${e.game||e.gameId||'game'}`})); } catch {}
    events.sort((a,b)=>b.t-a.t);
    if (!events.length) return '<div class="em-section" style="text-align:center;color:rgba(157,142,199,.4);font-size:.82rem;padding:24px">No activity yet — play some games! 🎮</div>';
    return `<div class="em-section">${events.slice(0,10).map(e=>`
      <div class="em-row">
        <div class="em-row-icon">${e.icon}</div>
        <div class="em-row-body"><div class="em-row-title">${e.text}</div><div class="em-row-sub">${ago(e.t)}</div></div>
      </div>`).join('')}
      <a href="profile.html" class="em-link-btn">Full Activity →</a>
    </div>`;
  }

  function renderQuick() {
    return `
      <div class="em-section">
        <div style="font-size:.7rem;font-weight:900;color:rgba(157,142,199,.5);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Quick Links</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${[
            { href:'games.html',       icon:'🎮', label:'Discover' },
            { href:'leaderboard.html', icon:'🏆', label:'Leaderboard' },
            { href:'friends.html',     icon:'🤝', label:'Friends' },
            { href:'achievements.html',icon:'🎖️', label:'Achievements' },
            { href:'live-events.html', icon:'⚡', label:'Live Events' },
            { href:'shop.html',        icon:'🛒', label:'Shop' },
            { href:'youtube.html',     icon:'▶️', label:'YouTube' },
            { href:'ai.html',          icon:'🤖', label:'Eylox Studio' },
          ].map(q=>`
            <a href="${q.href}" style="display:flex;align-items:center;gap:8px;background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.12);border-radius:10px;padding:10px 12px;text-decoration:none;color:#f0e8ff;font-family:'Nunito',sans-serif;font-weight:800;font-size:.8rem;transition:background .15s" onmouseover="this.style.background='rgba(167,139,250,.15)'" onmouseout="this.style.background='rgba(167,139,250,.07)'">
              <span style="font-size:1.1rem">${q.icon}</span>${q.label}
            </a>`).join('')}
        </div>
      </div>`;
  }

  const RENDERERS = { stats: renderStats, missions: renderMissions, streak: renderStreak, rank: renderRank, activity: renderActivity, quick: renderQuick };

  /* ── Build panel ── */
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'em-panel';
    panel.innerHTML = `
      <button class="em-close" id="emClose" title="Close">✕</button>
      <div id="em-tabs">
        ${TABS.map((t,i) => `<button class="em-tab${i===0?' active':''}" data-tab="${t.id}">${t.label}</button>`).join('')}
      </div>
      <div id="em-body">${RENDERERS[TABS[0].id]()}</div>
    `;

    panel.querySelector('#em-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.em-tab');
      if (!btn) return;
      panel.querySelectorAll('.em-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelector('#em-body').innerHTML = RENDERERS[btn.dataset.tab]?.() || '';
      window.EyloxSFX?.click?.();
    });

    panel.querySelector('#emClose').addEventListener('click', closePanel);
    return panel;
  }

  let _panel = null;

  function openPanel() {
    if (_panel) return;
    _panel = buildPanel();
    document.body.appendChild(_panel);
    document.getElementById('em-btn')?.classList.add('open');
    setTimeout(() => document.addEventListener('click', outsideClick), 10);
  }

  function closePanel() {
    _panel?.remove(); _panel = null;
    document.getElementById('em-btn')?.classList.remove('open');
    document.removeEventListener('click', outsideClick);
  }

  function outsideClick(e) {
    if (_panel && !_panel.contains(e.target) && e.target.id !== 'em-btn') closePanel();
  }

  /* ── Inject button into topbar ── */
  function injectButton() {
    if (document.getElementById('em-btn')) return;
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    const btn = document.createElement('button');
    btn.id = 'em-btn';
    btn.title = 'Extras';
    btn.setAttribute('aria-label', 'Extras menu');
    btn.textContent = '✨';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _panel ? closePanel() : openPanel();
    });
    right.insertBefore(btn, right.firstChild);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectCSS();
    injectButton();
  });

  /* Expose for external use */
  window.EyloxExtrasMenu = { open: openPanel, close: closePanel };
})();
