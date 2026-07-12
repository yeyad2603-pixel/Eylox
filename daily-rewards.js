/* ============================================================
   EYLOX — Daily Login Rewards  (Roblox-style)
   Shows once per day on main pages.
   ============================================================ */
'use strict';

(function EyloxDailyRewards() {

  const REWARDS = [50, 75, 100, 150, 200, 350, 500];
  const EMOJIS  = ['💰','💰','💰','💎','💎','🏆','👑'];
  const LABELS  = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];

  function getState() {
    try { return JSON.parse(localStorage.getItem('eylox_daily_rewards') || '{}'); }
    catch { return {}; }
  }
  function saveState(s) { localStorage.setItem('eylox_daily_rewards', JSON.stringify(s)); }

  function sameDay(ts) {
    if (!ts) return false;
    const a = new Date(ts), b = new Date();
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function yesterday(ts) {
    if (!ts) return false;
    const a = new Date(ts), b = new Date();
    b.setDate(b.getDate() - 1);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function darken(hex, amt) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0, (n>>16) - amt);
    const g = Math.max(0, ((n>>8)&255) - amt);
    const b = Math.max(0, (n&255) - amt);
    return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }

  function giveCoins(amount) {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (u) {
        u.coins = (u.coins || 0) + amount;
        localStorage.setItem('eylox_user', JSON.stringify(u));
        /* also update extended userdata */
        const key = 'eylox_userdata_' + (u.username || 'guest');
        const ud  = JSON.parse(localStorage.getItem(key) || '{}');
        ud.coins  = (ud.coins  || 0) + amount;
        localStorage.setItem(key, JSON.stringify(ud));
      }
    } catch {}
  }

  function buildPopup() {
    const state = getState();

    /* Already claimed today → skip */
    if (sameDay(state.lastClaim)) return;

    /* Compute streak */
    let streak = state.streak || 0;
    if (state.lastClaim && !yesterday(state.lastClaim) && !sameDay(state.lastClaim)) {
      streak = 0; /* missed a day, reset */
    }
    const dayIdx = Math.min(streak, 6);
    const reward = REWARDS[dayIdx];

    /* ── Inject CSS ── */
    if (!document.getElementById('drCSS')) {
      const s = document.createElement('style');
      s.id = 'drCSS';
      s.textContent = `
        @keyframes drSlideUp{from{transform:translateY(44px) scale(.96);opacity:0}to{transform:none;opacity:1}}
        @keyframes drPulse{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.6),0 0 20px rgba(167,139,250,.25)}55%{box-shadow:0 0 0 9px rgba(167,139,250,0),0 0 30px rgba(167,139,250,.45)}}
        @keyframes drCoinBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-7px) scale(1.12)}}
        @keyframes drShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .dr-day{background:rgba(167,139,250,.07);border:1.5px solid rgba(167,139,250,.14);border-radius:14px;padding:10px 4px;text-align:center;transition:all .2s;position:relative}
        .dr-day.dr-past{background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.25)}
        .dr-day.dr-today{background:linear-gradient(145deg,rgba(124,58,237,.3),rgba(168,85,247,.18));border-color:rgba(167,139,250,.7);animation:drPulse 2.2s ease-in-out infinite}
        .dr-day.dr-future{opacity:.55}
        .dr-day-emoji{font-size:1.3rem;display:block;line-height:1}
        .dr-day.dr-today .dr-day-emoji{animation:drCoinBounce 2s ease-in-out infinite}
        .dr-day-coins{font-family:'Fredoka One',cursive;font-size:.78rem;color:#fde68a;margin-top:2px}
        .dr-day-label{font-size:.56rem;font-weight:800;color:rgba(157,142,199,.65);text-transform:uppercase;letter-spacing:.5px;margin-top:3px}
        .dr-day.dr-today .dr-day-label{color:#a78bfa}
        .dr-claim-btn{width:100%;padding:14px;border-radius:16px;border:none;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);background-size:200% 100%;color:#fff;font-family:'Fredoka One',cursive;font-size:1.15rem;cursor:pointer;transition:transform .18s,box-shadow .18s;box-shadow:0 4px 24px rgba(124,58,237,.5)}
        .dr-claim-btn:hover{transform:scale(1.025) translateY(-1px);box-shadow:0 6px 32px rgba(124,58,237,.7)}
        .dr-claim-btn:active{transform:scale(.98)}
        .dr-claim-btn.claimed{background:linear-gradient(135deg,#16a34a,#4ade80);box-shadow:0 4px 20px rgba(74,222,128,.45);pointer-events:none}
        .dr-skip-btn{width:100%;padding:7px;border:none;background:transparent;color:rgba(157,142,199,.45);font-family:'Nunito',sans-serif;font-size:.76rem;font-weight:700;cursor:pointer;transition:color .15s;margin-top:6px;border-radius:8px}
        .dr-skip-btn:hover{color:rgba(157,142,199,.8)}
      `;
      document.head.appendChild(s);
    }

    /* ── Build overlay ── */
    const overlay = document.createElement('div');
    overlay.id = 'drOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.84);backdrop-filter:blur(12px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:16px';

    const streakBadge = streak > 0
      ? `<div style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;background:rgba(0,0,0,.22);border-radius:99px;padding:4px 14px;font-size:.76rem;font-weight:800;color:#fde68a">🔥 ${streak}-Day Streak!</div>`
      : '';

    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,#1c0b42 0%,#130838 100%);border:1.5px solid rgba(167,139,250,.3);border-radius:28px;max-width:470px;width:100%;box-shadow:0 32px 80px rgba(0,0,0,.85),0 0 60px rgba(167,139,250,.12);overflow:hidden;animation:drSlideUp .4s cubic-bezier(.34,1.56,.64,1)">

        <!-- Banner -->
        <div style="background:linear-gradient(135deg,#7c3aed,#a855f7 50%,#ec4899);padding:28px 28px 22px;position:relative;overflow:hidden">
          <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,.07);border-radius:50%"></div>
          <div style="position:absolute;bottom:-40px;left:-20px;width:120px;height:120px;background:rgba(255,255,255,.05);border-radius:50%"></div>
          <div style="position:relative">
            <div style="font-size:2.4rem;margin-bottom:8px">🎁</div>
            <h2 style="font-family:'Fredoka One',cursive;font-size:1.65rem;margin:0 0 3px;color:#fff">Daily Rewards</h2>
            <p style="color:rgba(255,255,255,.72);font-size:.8rem;font-weight:700;margin:0">Log in every day for bigger prizes!</p>
            ${streakBadge}
          </div>
        </div>

        <!-- 7-day calendar -->
        <div style="padding:22px 20px 0">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">
            ${REWARDS.map((coins, i) => {
              const cls = i < dayIdx ? 'dr-day dr-past' : i === dayIdx ? 'dr-day dr-today' : 'dr-day dr-future';
              const emoji = i < dayIdx ? '✅' : EMOJIS[i];
              const coinsText = i < dayIdx ? '' : `+${coins}`;
              return `<div class="${cls}">
                <span class="dr-day-emoji">${emoji}</span>
                <div class="dr-day-coins">${coinsText}</div>
                <div class="dr-day-label">${LABELS[i]}</div>
              </div>`;
            }).join('')}
          </div>

          <!-- Today highlight -->
          <div style="margin-top:16px;background:linear-gradient(135deg,rgba(124,58,237,.18),rgba(168,85,247,.1));border:1.5px solid rgba(167,139,250,.3);border-radius:18px;padding:16px 20px;display:flex;align-items:center;gap:16px">
            <div style="font-size:2.6rem;animation:drCoinBounce 2s ease-in-out infinite">${EMOJIS[dayIdx]}</div>
            <div style="flex:1">
              <div style="font-size:.78rem;font-weight:800;color:rgba(157,142,199,.8);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Today's Reward</div>
              <div style="font-family:'Fredoka One',cursive;font-size:1.9rem;background:linear-gradient(135deg,#fde68a,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">+${reward} 💰 Eylux</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="padding:18px 20px 22px">
          <button class="dr-claim-btn" id="drClaimBtn">🎁 Claim +${reward} Eylux</button>
          <button class="dr-skip-btn" id="drSkipBtn">Remind me later ×</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    /* ── Claim ── */
    document.getElementById('drClaimBtn').addEventListener('click', () => {
      giveCoins(reward);
      saveState({ lastClaim: Date.now(), streak: streak + 1 });

      const btn = document.getElementById('drClaimBtn');
      btn.textContent = `✅ Claimed! +${reward} Eylux`;
      btn.classList.add('claimed');

      window.EyloxSFX?.success?.();
      window.EyloxSFX?.coin?.();

      setTimeout(() => {
        window.EyloxNotify?.show?.(`🎁 +${reward} Eylux! Day ${dayIdx + 1} reward claimed!`, 'success');
        closeOverlay(overlay);
      }, 1100);
    });

    /* ── Skip ── */
    document.getElementById('drSkipBtn').addEventListener('click', () => closeOverlay(overlay));
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(overlay); });
  }

  function closeOverlay(el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity .25s';
    setTimeout(() => el.remove(), 270);
  }

  document.addEventListener('DOMContentLoaded', () => {
    /* Only show on hub pages (not in games, login, or 3D game pages) */
    const page = document.body.dataset.page;
    const skip = ['login','landing','game','game3d'].some(p => page && page.startsWith(p));
    if (!skip) setTimeout(buildPopup, 1800);
  });

})();
