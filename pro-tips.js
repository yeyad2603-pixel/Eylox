/* ============================================================
   EYLOX — Pro Tips Ticker + AFK Idle Detector
   ============================================================ */
'use strict';

/* ── 1. Pro Tips Ticker ── */
(function(){
  const TIPS = [
    '💡 Press Ctrl+K anywhere to search games and friends instantly',
    '🔥 Log in daily to build your streak and earn bonus Eylux!',
    '🎰 Spin the daily wheel on the Home page for free coins',
    '🏆 Complete daily challenges for extra rewards every day',
    '❤️ Hover over a game card and click ♡ to save it as a favourite',
    '⌨️ Press ? to see all keyboard shortcuts',
    '👥 Add friends to see their live activity on your Friends page',
    '🎖️ Check Achievements to claim your earned coin rewards',
    '🎁 Daily rewards reset at midnight — don\'t miss your streak!',
    '🛒 Visit the Shop to unlock new avatar items with your Eylux',
    '📊 Right-click any game card for quick actions',
    '🌐 Global Chat is always open — say hi to other players!',
    '⭐ Rate games after you play them to help other players discover them',
    '🔔 Notifications keep you updated on events and friend activity',
    '🎮 Your recently played games appear on your Profile page',
  ];

  let idx = 0;

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].some(p => page.startsWith(p))) return;

    const ticker = document.createElement('div');
    ticker.id = 'pro-tips-ticker';
    ticker.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:9985;
      background:linear-gradient(90deg,rgba(28,11,66,.95),rgba(19,8,56,.95));
      border-top:1px solid rgba(167,139,250,.1);
      display:flex;align-items:center;height:28px;
      font-family:'Nunito',sans-serif;font-size:.72rem;font-weight:800;
      padding:0 16px;gap:10px;overflow:hidden;
    `;

    ticker.innerHTML = `
      <span style="color:#a78bfa;white-space:nowrap;flex-shrink:0;font-size:.65rem;letter-spacing:.5px;text-transform:uppercase">Pro Tip</span>
      <span style="width:1px;height:12px;background:rgba(167,139,250,.2);flex-shrink:0"></span>
      <span id="tip-text" style="color:rgba(157,142,199,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;transition:opacity .4s"></span>
      <button id="tip-close" style="background:none;border:none;color:rgba(157,142,199,.3);cursor:pointer;font-size:.75rem;flex-shrink:0;padding:0 4px" title="Dismiss">✕</button>
    `;

    if (!document.getElementById('ticker-style')) {
      const s = document.createElement('style');
      s.id = 'ticker-style';
      s.textContent = `@keyframes tip-fade-in{from{opacity:0}to{opacity:1}}`;
      document.head.appendChild(s);
    }

    document.body.appendChild(ticker);
    document.body.style.paddingBottom = '28px';

    const tipText = document.getElementById('tip-text');

    function showTip() {
      tipText.style.opacity = '0';
      setTimeout(() => {
        idx = (idx + 1) % TIPS.length;
        tipText.textContent = TIPS[idx];
        tipText.style.opacity = '1';
      }, 400);
    }

    tipText.textContent = TIPS[0];
    const interval = setInterval(showTip, 8000);

    document.getElementById('tip-close').addEventListener('click', () => {
      ticker.remove();
      document.body.style.paddingBottom = '';
      clearInterval(interval);
    });
  });
})();

/* ── 2. AFK / Idle Detector ── */
(function(){
  const IDLE_MS  = 5 * 60 * 1000; /* 5 minutes */
  let idleTimer  = null;
  let toastShown = false;

  function resetIdle() {
    clearTimeout(idleTimer);
    toastShown = false;
    hideIdleToast();
    idleTimer = setTimeout(showIdleToast, IDLE_MS);
  }

  function showIdleToast() {
    if (toastShown) return;
    toastShown = true;
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].some(p => page.startsWith(p))) return;

    if (!document.getElementById('idle-toast')) {
      const toast = document.createElement('div');
      toast.id = 'idle-toast';
      toast.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(160deg,#1c0b42,#130838);border:1px solid rgba(167,139,250,.3);border-radius:20px;padding:28px 36px;text-align:center;z-index:99998;box-shadow:0 40px 100px rgba(0,0,0,.8);font-family:'Nunito',sans-serif;animation:esr-in .3s ease`;
      toast.innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:8px">😴</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#f0e8ff;margin-bottom:6px">Still there?</div>
        <p style="color:rgba(157,142,199,.7);font-size:.83rem;font-weight:700;margin-bottom:16px">You've been idle for a while.<br>Ready to keep playing?</p>
        <button id="idle-resume" style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;border-radius:99px;padding:10px 28px;color:#fff;font-family:'Fredoka One',cursive;font-size:1rem;cursor:pointer;box-shadow:0 4px 20px rgba(124,58,237,.4)">Let's Go! 🎮</button>
      `;
      document.body.appendChild(toast);
      document.getElementById('idle-resume').addEventListener('click', () => { resetIdle(); });
    }
  }

  function hideIdleToast() {
    document.getElementById('idle-toast')?.remove();
  }

  ['mousemove','keydown','click','touchstart','scroll'].forEach(ev => {
    document.addEventListener(ev, resetIdle, { passive:true });
  });

  document.addEventListener('DOMContentLoaded', resetIdle);
})();
