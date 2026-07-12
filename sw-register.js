/* ============================================================
   EYLOX — Service Worker Registration + Update Notifier
   Include this in every HTML page (first script in <head>)
   ============================================================ */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  /* Register SW */
  navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(reg => {
      /* Check for updates every 60 seconds */
      setInterval(() => reg.update(), 60000);

      /* When a new SW is waiting, notify the user */
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });
    })
    .catch(() => { /* SW registration failed — non-fatal */ });

  /* Tell the active SW to skip waiting when we detect a controller change */
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) { refreshing = true; window.location.reload(); }
  });

  /* ── Update banner ── */
  function showUpdateBanner(newWorker) {
    if (document.getElementById('sw-update-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'sw-update-banner';
    banner.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:999999;
      background:linear-gradient(135deg,#7c3aed,#a855f7);
      color:#fff;padding:14px 20px;display:flex;
      align-items:center;justify-content:space-between;gap:14px;
      font-family:'Nunito',sans-serif;font-size:.88rem;font-weight:800;
      box-shadow:0 -4px 20px rgba(124,58,237,.4);
      animation:slideUpBanner .35s cubic-bezier(.22,1,.36,1) both;
    `;
    if (!document.getElementById('sw-banner-style')) {
      const s = document.createElement('style');
      s.id = 'sw-banner-style';
      s.textContent = '@keyframes slideUpBanner{from{transform:translateY(100%)}to{transform:none}}';
      document.head.appendChild(s);
    }
    banner.innerHTML = `
      <span>🚀 Eylox updated! Reload for the latest version.</span>
      <div style="display:flex;gap:10px">
        <button id="sw-reload-btn" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);
          border-radius:8px;color:#fff;padding:7px 16px;cursor:pointer;
          font-family:'Fredoka One',cursive;font-size:.86rem">Reload Now</button>
        <button id="sw-dismiss-btn" style="background:none;border:none;color:rgba(255,255,255,.6);
          cursor:pointer;font-size:1.1rem;padding:4px 8px">✕</button>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelector('#sw-reload-btn').addEventListener('click', () => {
      newWorker.postMessage('SKIP_WAITING');
    });
    banner.querySelector('#sw-dismiss-btn').addEventListener('click', () => banner.remove());
  }
})();
