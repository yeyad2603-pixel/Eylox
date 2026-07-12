/* ============================================================
   EYLOX — Daily Missions System
   Renders a missions widget wherever #missions-widget exists.
   Tracks completion via localStorage. Awards coins on claim.
   ============================================================ */
'use strict';

(function EyloxMissions() {
  const KEY = 'eylox_missions_today';

  const MISSIONS = [
    {
      id: 'play_game', icon: '🎮', title: 'Play Any Game', coins: 100,
      desc: 'Jump into any game today',
      check: () => {
        const rp = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
        const midnight = new Date().setHours(0,0,0,0);
        return rp.some(e => (e.playedAt || 0) >= midnight);
      },
    },
    {
      id: 'earn_coins', icon: '💰', title: 'Coin Collector', coins: 150,
      desc: 'Earn 500+ coins in games today',
      check: () => {
        const lb = JSON.parse(localStorage.getItem('eylox_lb_entries') || '[]');
        const midnight = new Date().setHours(0,0,0,0);
        return lb.filter(e => e.ts >= midnight).reduce((s, e) => s + (e.score || 0), 0) >= 500;
      },
    },
    {
      id: 'chat_msg', icon: '💬', title: 'Social Butterfly', coins: 75,
      desc: 'Send a Global Chat message',
      check: () => {
        const cc = JSON.parse(localStorage.getItem('eylox_chat_count') || '{}');
        return (cc[new Date().toDateString()] || 0) >= 1;
      },
    },
    {
      id: 'join_event', icon: '⚡', title: 'Event Joiner', coins: 200,
      desc: 'Join a Live Event',
      check: () => JSON.parse(localStorage.getItem('eylox_joined_events') || '[]').length >= 1,
    },
    {
      id: 'play_3d', icon: '🌐', title: '3D Pioneer', coins: 125,
      desc: 'Play any 3D game today',
      check: () => {
        const sessions = JSON.parse(localStorage.getItem('eylox_game_sessions') || '[]');
        const THREE_D = ['obby-world-3d','treasure-hunt-3d','city-roleplay-3d','pirate-bay-3d'];
        const midnight = new Date().setHours(0,0,0,0);
        return sessions.some(s => THREE_D.includes(s.id) && s.t >= midnight);
      },
    },
    {
      id: 'visit_shop', icon: '🛒', title: 'Window Shopper', coins: 50,
      desc: 'Visit the Shop today',
      check: () => {
        const vp = JSON.parse(localStorage.getItem('eylox_pages_visited') || '{}');
        const today = new Date().toDateString();
        return !!(vp[today]?.['shop.html']);
      },
    },
  ];

  /* ── Today data ── */
  function getTodayData() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || '{}');
      const today = new Date().toDateString();
      return d.date === today ? d : { date: today, claimed: [] };
    } catch { return { date: new Date().toDateString(), claimed: [] }; }
  }
  function saveTodayData(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  /* ── Claim ── */
  function claimMission(id) {
    const m = MISSIONS.find(x => x.id === id);
    if (!m) return;
    const d = getTodayData();
    if (d.claimed.includes(id)) return;
    if (!m.check()) { alert('Mission not completed yet! ' + m.desc); return; }
    d.claimed.push(id);
    saveTodayData(d);
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (u) {
        u.coins = Math.min(1000000000, (u.coins || 0) + m.coins);
        localStorage.setItem('eylox_user', JSON.stringify(u));
        document.querySelectorAll('#topbarCoins,.coins-amount').forEach(el => {
          el.textContent = u.coins.toLocaleString();
        });
      }
    } catch {}
    renderAll();
    window.EyloxSFX?.reward?.();
    window.EyloxNotify?.push({ type:'reward', title:'Mission Complete!', body:`${m.title}: +${m.coins} Eylux earned!` });
  }
  window.EyloxClaimMission = claimMission;

  /* ── Track page visits ── */
  function trackPage() {
    try {
      const page = location.pathname.split('/').pop() || 'index.html';
      const today = new Date().toDateString();
      const vp = JSON.parse(localStorage.getItem('eylox_pages_visited') || '{}');
      if (!vp[today]) vp[today] = {};
      vp[today][page] = Date.now();
      localStorage.setItem('eylox_pages_visited', JSON.stringify(vp));
    } catch {}
  }

  /* ── Render ── */
  function render(containerId) {
    const el = document.getElementById(containerId || 'missions-widget');
    if (!el) return;
    const d       = getTodayData();
    const list    = MISSIONS.map(m => ({ ...m, done: m.check(), claimed: d.claimed.includes(m.id) }));
    const done    = list.filter(m => m.done || m.claimed).length;
    const totalPts = list.reduce((s, m) => s + (d.claimed.includes(m.id) ? m.coins : 0), 0);

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff">📋 Daily Missions</div>
        <div style="font-size:.72rem;font-weight:800;color:#a78bfa">${d.claimed.length}/${MISSIONS.length} claimed · +${totalPts}🪙</div>
      </div>
      <div style="height:5px;background:rgba(167,139,250,.1);border-radius:99px;margin-bottom:14px;overflow:hidden">
        <div style="height:100%;width:${Math.round(d.claimed.length/MISSIONS.length*100)}%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:99px;transition:width .6s ease"></div>
      </div>
      ${list.map(m => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(167,139,250,.07)">
          <div style="font-size:1.3rem;flex-shrink:0;${m.claimed?'opacity:.4':''}">  ${m.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:.82rem;color:${m.claimed?'rgba(157,142,199,.4)':m.done?'#4ade80':'#f0e8ff'};${m.claimed?'text-decoration:line-through':''}">${m.title}</div>
            <div style="font-size:.68rem;font-weight:700;color:rgba(157,142,199,.5)">${m.desc}</div>
          </div>
          <div style="flex-shrink:0">
            ${m.claimed
              ? `<span style="font-size:.7rem;font-weight:900;color:#4ade80">✅ +${m.coins}🪙</span>`
              : m.done
                ? `<button onclick="EyloxClaimMission('${m.id}')" style="background:linear-gradient(135deg,#4ade80,#22c55e);border:none;border-radius:8px;padding:5px 10px;color:#052e16;font-family:'Nunito',sans-serif;font-weight:900;font-size:.72rem;cursor:pointer">Claim +${m.coins}🪙</button>`
                : `<span style="font-size:.72rem;font-weight:800;color:rgba(157,142,199,.3)">+${m.coins}🪙</span>`
            }
          </div>
        </div>`).join('')}
      ${d.claimed.length === MISSIONS.length ? `<div style="text-align:center;margin-top:12px;font-size:.78rem;font-weight:800;color:#4ade80">🎉 All missions complete! Come back tomorrow for new ones.</div>` : ''}
    `;
  }

  function renderAll() {
    render('missions-widget');
    render('missions-widget-home');
    render('missions-widget-profile');
  }
  window.EyloxRenderMissions = renderAll;

  document.addEventListener('DOMContentLoaded', () => {
    trackPage();
    setTimeout(renderAll, 300);
  });
})();
