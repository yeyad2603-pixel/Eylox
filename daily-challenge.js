/* ============================================================
   EYLOX — Dynamic Daily Challenges Widget
   Floating card with today's challenges and coin rewards
   ============================================================ */
'use strict';

(function EyloxDailyChallenges() {

  const CHALLENGES = [
    { id:'play3',     text:'Play any 3 games',          icon:'🎮', reward:150,  type:'games' },
    { id:'win1',      text:'Win 1 game',                 icon:'🏆', reward:200,  type:'wins' },
    { id:'login',     text:'Log in today',               icon:'🌅', reward:50,   type:'login' },
    { id:'spin',      text:'Spin the daily wheel',       icon:'🎰', reward:75,   type:'spin' },
    { id:'addFriend', text:'Add a new friend',           icon:'🤝', reward:100,  type:'friends' },
    { id:'chat',      text:'Send 3 chat messages',       icon:'💬', reward:80,   type:'chat' },
    { id:'play5',     text:'Play 5 different games',     icon:'🕹️', reward:300,  type:'games5' },
    { id:'streak3',   text:'Maintain a 3-day streak',    icon:'🔥', reward:250,  type:'streak' },
    { id:'shop',      text:'Visit the shop',             icon:'🛒', reward:40,   type:'shop' },
    { id:'achieve',   text:'Claim an achievement',       icon:'🎖️', reward:175,  type:'achieve' },
    { id:'explore',   text:'Visit 4 different pages',    icon:'🔭', reward:120,  type:'explore' },
    { id:'profile',   text:'Update your profile avatar', icon:'👤', reward:60,   type:'avatar' },
  ];

  const KEY     = 'eylox_daily_challenges';
  const TODAY   = new Date().toDateString();

  function getTodayData() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (d?.date === TODAY) return d;
    } catch {}

    /* Pick 3 challenges for today seeded by date */
    const seed = TODAY.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    const picked = [];
    const pool = [...CHALLENGES];
    let s = seed;
    while (picked.length < 3 && pool.length) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const idx = Math.abs(s) % pool.length;
      picked.push({ ...pool[idx], progress:0, done:false });
      pool.splice(idx, 1);
    }
    const data = { date:TODAY, challenges:picked, claimedCoins:0 };
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function saveData(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  function getProgress(type) {
    try {
      switch (type) {
        case 'games': {
          const rp = JSON.parse(localStorage.getItem('eylox_recently_played')||'[]');
          const todayPlays = rp.filter(e=>{
            const ts = e?.ts || 0;
            return new Date(ts).toDateString() === TODAY;
          });
          return Math.min(todayPlays.length, 3);
        }
        case 'games5': {
          const rp = JSON.parse(localStorage.getItem('eylox_recently_played')||'[]');
          const ids = new Set(rp.filter(e=>new Date(e?.ts||0).toDateString()===TODAY).map(e=>e?.id||String(e)));
          return Math.min(ids.size, 5);
        }
        case 'wins': {
          const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
          return Math.min(u?.wins||0, 1);
        }
        case 'login': return 1;
        case 'spin': {
          const spin = JSON.parse(localStorage.getItem('eylox_spin')||'{}');
          return spin.lastSpin && new Date(spin.lastSpin).toDateString()===TODAY ? 1 : 0;
        }
        case 'friends': {
          const fl = JSON.parse(localStorage.getItem('eylox_friends')||'[]');
          return Math.min(fl.length, 1);
        }
        case 'chat': {
          const msgs = JSON.parse(localStorage.getItem('eylox_chat_count')||'{}');
          return Math.min(msgs[TODAY]||0, 3);
        }
        case 'streak': {
          const dr = JSON.parse(localStorage.getItem('eylox_daily_rewards')||'{}');
          return (dr.streak||0) >= 3 ? 1 : 0;
        }
        case 'shop': {
          const sv = localStorage.getItem('eylox_shop_visited');
          return sv === TODAY ? 1 : 0;
        }
        case 'achieve': {
          const cl = JSON.parse(localStorage.getItem('eylox_claimed_achievements')||'[]');
          return Math.min(cl.length, 1);
        }
        case 'explore': {
          const pv = JSON.parse(localStorage.getItem('eylox_pages_visited')||'{}');
          return Math.min(Object.keys(pv).length, 4);
        }
        case 'avatar': {
          const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
          return u?.avatar && u.avatar !== '🎮' ? 1 : 0;
        }
        default: return 0;
      }
    } catch { return 0; }
  }

  function getMax(type) {
    const maxMap = { games:3, games5:5, wins:1, login:1, spin:1, friends:1, chat:3, streak:1, shop:1, achieve:1, explore:4, avatar:1 };
    return maxMap[type] || 1;
  }

  function grantCoins(amount) {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
      if (!u) return;
      u.coins = (u.coins || 0) + amount;
      localStorage.setItem('eylox_user', JSON.stringify(u));
      window.dispatchEvent(new Event('storage'));
      window.EyloxCoinBurst?.(amount);
    } catch {}
  }

  /* Track page visits */
  (function trackPage() {
    const page = document.body?.dataset?.page || location.pathname.split('/').pop() || 'unknown';
    try {
      const pv = JSON.parse(localStorage.getItem('eylox_pages_visited')||'{}');
      pv[page] = Date.now();
      localStorage.setItem('eylox_pages_visited', JSON.stringify(pv));
    } catch {}
  })();

  /* Track shop visit */
  if (document.body?.dataset?.page === 'shop' || location.href.includes('shop.html')) {
    localStorage.setItem('eylox_shop_visited', TODAY);
  }

  function buildWidget() {
    if (document.getElementById('eyloxDailyChallenges')) return;

    const data = getTodayData();

    /* Auto-update progress */
    data.challenges.forEach(c => {
      if (!c.done) {
        const p = getProgress(c.type);
        c.progress = p;
        if (p >= getMax(c.type)) c.done = true;
      }
    });
    saveData(data);

    /* Auto-grant coins for newly completed challenges */
    let totalNewCoins = 0;
    data.challenges.forEach(c => {
      if (c.done && !c.rewarded) {
        c.rewarded = true;
        totalNewCoins += c.reward;
      }
    });
    if (totalNewCoins > 0) {
      grantCoins(totalNewCoins);
      saveData(data);
    }

    const widget = document.createElement('div');
    widget.id = 'eyloxDailyChallenges';

    const allDone = data.challenges.every(c => c.done);
    const totalCoins = data.challenges.reduce((a,c)=>a+c.reward,0);
    const earnedCoins = data.challenges.filter(c=>c.done).reduce((a,c)=>a+c.reward,0);

    widget.innerHTML = `
      <div id="edc-header" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;cursor:pointer;user-select:none">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:1.1rem">⚡</span>
          <div>
            <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:#f0e8ff">Daily Challenges</div>
            <div style="font-size:.65rem;font-weight:800;color:rgba(157,142,199,.6)">${earnedCoins}/${totalCoins} Eylux earned</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          ${allDone ? '<span style="font-size:.7rem;font-weight:900;color:#4ade80;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.2);padding:2px 8px;border-radius:99px">✓ Done</span>' : ''}
          <span id="edc-arrow" style="color:rgba(157,142,199,.5);font-size:.7rem;transition:transform .2s">▼</span>
        </div>
      </div>
      <div id="edc-body" style="border-top:1px solid rgba(167,139,250,.1);padding:8px 10px;display:flex;flex-direction:column;gap:6px">
        ${data.challenges.map(c => {
          const prog = c.progress || 0;
          const max  = getMax(c.type);
          const pct  = Math.min((prog / max) * 100, 100);
          return `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 4px;border-radius:10px;transition:background .15s" class="edc-row">
            <div style="width:32px;height:32px;border-radius:10px;background:${c.done?'rgba(74,222,128,.15)':'rgba(167,139,250,.1)'};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">${c.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:.8rem;font-weight:800;color:${c.done?'rgba(157,142,199,.6)':'#f0e8ff'};${c.done?'text-decoration:line-through':''}">${c.text}</div>
              <div style="margin-top:4px;height:4px;background:rgba(167,139,250,.1);border-radius:99px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${c.done?'linear-gradient(90deg,#4ade80,#22d3ee)':'linear-gradient(90deg,#7c3aed,#a78bfa)'};border-radius:99px;transition:width .5s ease"></div>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:.68rem;font-weight:900;color:${c.done?'#4ade80':'#fbbf24'}">+${c.reward}</div>
              <div style="font-size:.58rem;color:rgba(157,142,199,.45);font-weight:700">${c.done?'✓':prog+'/'+max}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;

    widget.style.cssText = `
      position:fixed;bottom:90px;right:24px;z-index:9988;
      background:linear-gradient(160deg,#1c0b42,#130838);
      border:1px solid rgba(167,139,250,.25);border-radius:16px;
      width:260px;box-shadow:0 16px 50px rgba(0,0,0,.6);
      font-family:'Nunito',sans-serif;overflow:hidden;
    `;

    if (!document.getElementById('edc-style')) {
      const s = document.createElement('style');
      s.id = 'edc-style';
      s.textContent = `.edc-row:hover{background:rgba(167,139,250,.06)!important}`;
      document.head.appendChild(s);
    }

    document.body.appendChild(widget);

    let open = true;
    const header = widget.querySelector('#edc-header');
    const body   = widget.querySelector('#edc-body');
    const arrow  = widget.querySelector('#edc-arrow');

    header.addEventListener('click', () => {
      open = !open;
      body.style.display = open ? 'flex' : 'none';
      arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
      window.EyloxSFX?.click?.();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    const skip = ['login','landing'].some(p => page.startsWith(p));
    if (!skip) buildWidget();
  });

})();
