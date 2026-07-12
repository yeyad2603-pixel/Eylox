/* ============================================================
   EYLOX — Daily Rewards System
   Popup shown once per day. 7-day streak with escalating rewards.
   ============================================================ */
'use strict';

(function EyloxDailyRewards() {
  const KEY = 'eylox_daily_rewards';
  const DAY_MS = 86400000;

  const REWARDS = [
    { day:1, coins:  100, icon:'🪙', bonus:null },
    { day:2, coins:  200, icon:'💰', bonus:null },
    { day:3, coins:  350, icon:'💎', bonus:'Diamond Glow badge' },
    { day:4, coins:  500, icon:'🎁', bonus:null },
    { day:5, coins:  750, icon:'🏆', bonus:'+5 bonus Wins' },
    { day:6, coins: 1000, icon:'🌟', bonus:'Star Burst effect' },
    { day:7, coins: 2000, icon:'👑', bonus:'Legendary Crown badge!' },
  ];

  function getData() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }

  function check() {
    const user = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
    if (!user) return;

    const data    = getData();
    const now     = Date.now();
    const last    = data.lastClaim || 0;
    const gap     = now - last;
    if (gap < DAY_MS) return; // Already claimed today

    const streakBroken = last > 0 && gap > DAY_MS * 2;
    const newStreak    = streakBroken ? 1 : Math.min((data.streak || 0) + 1, 7);
    const reward       = REWARDS[newStreak - 1];

    setTimeout(() => showPopup(reward, newStreak, streakBroken, data), 2500);
  }

  /* ── CSS ── */
  function injectCSS() {
    if (document.getElementById('eylox-dr-css')) return;
    const s = document.createElement('style');
    s.id = 'eylox-dr-css';
    s.textContent = `
      #eylox-dr-overlay {
        position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);
        z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;
        animation:dr-fadein .3s ease;
      }
      @keyframes dr-fadein{from{opacity:0}to{opacity:1}}
      #eylox-dr-popup {
        background:linear-gradient(160deg,#1c0b42,#0e0430);
        border:1px solid rgba(167,139,250,.35);border-radius:24px;
        padding:36px 28px;max-width:420px;width:100%;text-align:center;
        box-shadow:0 24px 80px rgba(0,0,0,.7);position:relative;
        animation:dr-popin .45s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes dr-popin{from{opacity:0;transform:scale(.8) translateY(30px)}to{opacity:1;transform:none}}
      .dr-streak-row{display:flex;justify-content:center;gap:6px;margin-bottom:22px;flex-wrap:wrap}
      .dr-dot{
        width:38px;height:38px;border-radius:50%;display:flex;align-items:center;
        justify-content:center;font-size:.7rem;font-weight:900;
        border:2px solid rgba(167,139,250,.18);background:rgba(167,139,250,.06);color:rgba(157,142,199,.4);
      }
      .dr-dot.done{background:linear-gradient(135deg,#7c3aed,#a78bfa);border-color:#a78bfa;color:#fff}
      .dr-dot.today{
        background:linear-gradient(135deg,#f59e0b,#fde68a);border-color:#fde68a;color:#1a0800;
        box-shadow:0 0 18px rgba(245,158,11,.55);animation:dr-pls 1.4s ease-in-out infinite;
      }
      @keyframes dr-pls{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
      .dr-icon-big{font-size:5rem;animation:dr-bounce .6s cubic-bezier(.34,1.56,.64,1) .15s both}
      @keyframes dr-bounce{from{opacity:0;transform:scale(.5) rotate(-12deg)}to{opacity:1;transform:none}}
      .dr-coins{
        font-family:'Fredoka One',cursive;font-size:2.2rem;color:#fde68a;
        animation:dr-slide .5s ease .35s both;
      }
      @keyframes dr-slide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      .dr-claim-btn{
        background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);color:#fff;
        border:none;border-radius:14px;padding:14px 32px;
        font-family:'Fredoka One',cursive;font-size:1.1rem;cursor:pointer;width:100%;
        box-shadow:0 6px 24px rgba(124,58,237,.5);transition:transform .18s,box-shadow .18s;margin-top:18px;
      }
      .dr-claim-btn:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(124,58,237,.75)}
      .dr-x{
        position:absolute;top:14px;right:14px;background:rgba(167,139,250,.1);
        border:1px solid rgba(167,139,250,.2);color:rgba(157,142,199,.6);
        width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:.8rem;
        display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;
      }
      .dr-x:hover{background:rgba(248,113,113,.2);color:#f87171}
    `;
    document.head.appendChild(s);
  }

  function showPopup(reward, streak, broken, data) {
    if (document.getElementById('eylox-dr-overlay')) return;
    injectCSS();

    const dots = REWARDS.map((_, i) => {
      const n = i + 1;
      const cls = n < streak ? 'done' : n === streak ? 'today' : '';
      return `<div class="dr-dot ${cls}" title="Day ${n} — ${REWARDS[i].coins} coins">${n}</div>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'eylox-dr-overlay';
    overlay.innerHTML = `
      <div id="eylox-dr-popup">
        <button class="dr-x" id="drX">✕</button>
        ${broken ? `<div style="font-size:.7rem;font-weight:800;color:#fb923c;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🔁 Streak reset — welcome back!</div>` : ''}
        <div style="font-size:.68rem;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">🎁 Daily Reward</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#f0e8ff;margin-bottom:18px">Day ${streak} Streak!</div>
        <div class="dr-streak-row">${dots}</div>
        <div class="dr-icon-big">${reward.icon}</div>
        <div class="dr-coins">+${reward.coins.toLocaleString()} Eylux</div>
        ${reward.bonus ? `<div style="font-size:.78rem;font-weight:800;color:#fbbf24;margin-top:4px">✨ Bonus: ${reward.bonus}</div>` : ''}
        <div style="font-size:.73rem;font-weight:700;color:rgba(157,142,199,.5);margin-top:8px">
          🔥 ${streak}-day streak${streak < 7 ? ` · Come back tomorrow for Day ${streak + 1}!` : ' · MAX STREAK! 🏆'}
        </div>
        <button class="dr-claim-btn" id="drClaim">🎁 Claim Reward!</button>
        <div style="margin-top:12px;font-size:.68rem;font-weight:700;color:rgba(157,142,199,.35)">Resets in 24 hours</div>
      </div>`;

    document.body.appendChild(overlay);

    document.getElementById('drClaim').onclick = () => doClaimReward(reward, streak);
    document.getElementById('drX').onclick = () => overlay.remove();
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  }

  function doClaimReward(reward, streak) {
    /* Credit coins */
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (u) {
        u.coins = Math.min(1000000000, (u.coins || 0) + reward.coins);
        if (reward.day === 5) u.wins = Math.min(1000000, (u.wins || 0) + 5);
        localStorage.setItem('eylox_user', JSON.stringify(u));
        document.querySelectorAll('#topbarCoins,.coins-amount').forEach(el => {
          el.textContent = u.coins.toLocaleString();
        });
      }
    } catch {}

    /* Save claim */
    const prev = getData();
    localStorage.setItem(KEY, JSON.stringify({
      lastClaim:    Date.now(),
      streak:       streak,
      totalClaimed: (prev.totalClaimed || 0) + 1,
    }));

    /* Success screen */
    const popup = document.getElementById('eylox-dr-popup');
    if (popup) {
      popup.innerHTML = `
        <div style="padding:16px 0">
          <div style="font-size:5rem;animation:dr-bounce .6s cubic-bezier(.34,1.56,.64,1) both">🎉</div>
          <div style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:#4ade80;margin:16px 0 6px">Claimed!</div>
          <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#fde68a">+${reward.coins.toLocaleString()} Eylux added!</div>
          ${reward.bonus ? `<div style="font-size:.8rem;font-weight:800;color:#fbbf24;margin-top:6px">✨ ${reward.bonus}</div>` : ''}
          <div style="font-size:.75rem;font-weight:700;color:rgba(157,142,199,.6);margin-top:8px">🔥 ${streak}-day streak!</div>
          <button class="dr-claim-btn" onclick="document.getElementById('eylox-dr-overlay').remove()">✨ Awesome!</button>
        </div>`;
    }

    window.EyloxSFX?.reward?.();
    window.EyloxCoinBurst?.();
    setTimeout(() => window.EyloxNotify?.push({
      type:'reward', title:'Daily Reward Claimed!',
      body:`+${reward.coins.toLocaleString()} Eylux · ${streak}-day streak 🔥`,
    }), 600);
  }

  document.addEventListener('DOMContentLoaded', check);
})();
