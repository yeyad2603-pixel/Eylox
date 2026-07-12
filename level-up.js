/* ============================================================
   EYLOX — Level Up Celebration
   Shows a popup + confetti whenever the user gains a level.
   ============================================================ */
'use strict';

(function LevelUpSystem() {
  const KEY = 'eylox_last_level';
  const CONFETTI_COLORS = ['#a78bfa','#60a5fa','#f472b6','#fde68a','#4ade80','#fb923c'];

  function getLevel(coins) {
    return Math.floor(Math.sqrt(Math.max(0, coins) / 50)) + 1;
  }

  function launchMiniConfetti() {
    for (let i = 0; i < 35; i++) {
      const el = document.createElement('div');
      const size = 5 + Math.random() * 7;
      el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:${size}px;height:${size*0.55}px;background:${CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)]};border-radius:2px;pointer-events:none;z-index:10001;animation:lvl-fall ${1+Math.random()*1.5}s linear ${Math.random()*0.4}s forwards;transform:rotate(${Math.random()*360}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
  }

  function showLevelUpPopup(newLevel) {
    const existing = document.getElementById('levelUpPopup');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'levelUpPopup';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;pointer-events:none;';
    overlay.innerHTML = `
      <div style="
        background:linear-gradient(160deg,#1c0b42,#130838);
        border:2px solid rgba(167,139,250,.4);
        border-radius:24px;padding:36px 40px;text-align:center;
        box-shadow:0 24px 80px rgba(0,0,0,.8),0 0 60px rgba(167,139,250,.2);
        animation:lvl-popup-in .5s cubic-bezier(.34,1.56,.64,1) both;
        pointer-events:auto;
      ">
        <div style="font-size:3rem;margin-bottom:8px">⭐</div>
        <div style="font-family:'Fredoka One',cursive;font-size:.75rem;color:#a78bfa;letter-spacing:2px;font-weight:900;text-transform:uppercase;margin-bottom:8px">Level Up!</div>
        <div style="font-family:'Fredoka One',cursive;font-size:3.5rem;color:#fff;line-height:1;margin-bottom:4px">${newLevel}</div>
        <div style="font-size:.88rem;font-weight:700;color:rgba(167,139,250,.6);margin-bottom:24px">You reached Level ${newLevel}!</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">
          <div style="background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.25);border-radius:10px;padding:10px 16px;font-size:.82rem;font-weight:800;color:#4ade80">✅ New title unlocked</div>
          <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);border-radius:10px;padding:10px 16px;font-size:.82rem;font-weight:800;color:#fbbf24">⭐ +${newLevel * 2} bonus LuxStars</div>
        </div>
        <button onclick="document.getElementById('levelUpPopup').remove()" style="
          background:linear-gradient(135deg,#a78bfa,#8b5cf6);color:#fff;border:none;
          border-radius:99px;padding:11px 32px;font-family:'Fredoka One',cursive;
          font-size:.95rem;cursor:pointer;transition:opacity .18s;
        " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
          🎉 Awesome!
        </button>
      </div>`;

    if (!document.getElementById('lvl-styles')) {
      const s = document.createElement('style');
      s.id = 'lvl-styles';
      s.textContent = `
        @keyframes lvl-popup-in { from{opacity:0;transform:scale(.7) translateY(30px)} to{opacity:1;transform:none} }
        @keyframes lvl-fall { to{top:110vh;opacity:0;transform:rotate(720deg)} }
      `;
      document.head.appendChild(s);
    }

    document.body.appendChild(overlay);
    launchMiniConfetti();

    /* Award bonus Eylux */
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (u) { u.coins = (u.coins || 0) + (newLevel * 50); localStorage.setItem('eylox_user', JSON.stringify(u)); }
    } catch {}

    setTimeout(() => overlay?.remove(), 6000);
  }

  function check() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u) return;
      const currentLevel = getLevel(u.coins || 0);
      const lastLevel = parseInt(localStorage.getItem(KEY) || '1', 10);
      if (currentLevel > lastLevel && lastLevel > 0) {
        localStorage.setItem(KEY, currentLevel);
        /* Small delay so page has rendered */
        setTimeout(() => showLevelUpPopup(currentLevel), 1200);
      } else if (!localStorage.getItem(KEY)) {
        localStorage.setItem(KEY, currentLevel);
      }
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', check);
  window.addEventListener('storage', e => { if (e.key === 'eylox_user') check(); });
})();
