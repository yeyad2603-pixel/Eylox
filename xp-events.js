/* ============================================================
   EYLOX — XP Events  (floating +XP toasts on coin changes)
   Listens for coin changes in other tabs and shows popups
   ============================================================ */
'use strict';

(function EyloxXPEvents() {

  const page = document.body?.dataset?.page || '';
  if (['login', 'landing', 'game'].some(p => page.startsWith(p))) return;

  if (!document.getElementById('xpe-style')) {
    const s = document.createElement('style');
    s.id = 'xpe-style';
    s.textContent = `
      @keyframes xpe-float{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-60px)}}
      .xpe-toast{position:fixed;bottom:160px;left:50%;z-index:99990;background:linear-gradient(135deg,rgba(253,230,138,.18),rgba(245,158,11,.12));border:1px solid rgba(253,230,138,.35);color:#fde68a;font-family:'Fredoka One',cursive;font-size:1rem;padding:8px 20px;border-radius:99px;pointer-events:none;animation:xpe-float 2.2s ease-out forwards;white-space:nowrap;box-shadow:0 4px 16px rgba(253,230,138,.2)}
    `;
    document.head.appendChild(s);
  }

  let _lastCoins = null;

  function showXpToast(delta) {
    const el = document.createElement('div');
    el.className = 'xpe-toast';
    el.textContent = `+${delta.toLocaleString()} 💰 Eylux!`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  /* Watch localStorage for coin changes from this tab */
  function checkLocal() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u) return;
      const coins = u.coins || 0;
      if (_lastCoins === null) { _lastCoins = coins; return; }
      const delta = coins - _lastCoins;
      if (delta >= 5 && delta < 500) { // Don't duplicate coin-rain which fires for >= 500
        showXpToast(delta);
      }
      _lastCoins = coins;
    } catch {}
  }

  window.addEventListener('storage', e => {
    if (e.key === 'eylox_user') checkLocal();
  });

  document.addEventListener('DOMContentLoaded', () => {
    checkLocal();
    setInterval(checkLocal, 3000);
  });

})();
