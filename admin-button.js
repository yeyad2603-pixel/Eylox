/* ============================================================
   EYLOX — Admin Button Controller  v2.0
   Shows the admin button only for verified owner accounts.
   - Reads isOwner from the API user object (not a raw localStorage flag)
   - Verifies with the server on every page load
   - Removes the button immediately if server denies access
   ============================================================ */
'use strict';

(function EyloxAdminButton() {

  /* Read owner status from the stored API user object (set by the server) */
  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); }
    catch { return null; }
  }

  function isOwnerLocally() {
    const u = getStoredUser();
    return !!(u && u.isOwner === true);
  }

  /* Verify with server using the stored auth token */
  async function verifyOwnerWithServer() {
    try {
      const token = localStorage.getItem('eylox_token');
      if (!token) return false;
      const r = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  function injectAdminButtonStyles() {
    if (document.getElementById('adminBtnStyles')) return;
    const s = document.createElement('style');
    s.id = 'adminBtnStyles';
    s.textContent = `
      @keyframes crown-spin {
        0%   { transform: rotate(-12deg) scale(1) }
        25%  { transform: rotate(12deg)  scale(1.15) }
        50%  { transform: rotate(-8deg)  scale(1.05) }
        75%  { transform: rotate(8deg)   scale(1.1)  }
        100% { transform: rotate(-12deg) scale(1)    }
      }
      @keyframes admin-btn-pulse {
        0%,100% { box-shadow: 0 4px 20px rgba(245,158,11,.55), 0 0 0 2px rgba(253,230,138,.25) }
        50%     { box-shadow: 0 6px 32px rgba(245,158,11,.9),  0 0 0 3px rgba(253,230,138,.5)  }
      }
    `;
    document.head.appendChild(s);
  }

  function createAdminButton() {
    if (document.getElementById('adminBtn')) return;
    const topbar = document.querySelector('.topbar-right');
    if (!topbar) return;

    injectAdminButtonStyles();

    const btn = document.createElement('a');
    btn.id        = 'adminBtn';
    btn.href      = 'admin.html';
    btn.className = 'tb-btn admin-btn';
    btn.setAttribute('aria-label', 'Admin Panel');
    btn.setAttribute('title', 'Admin Panel (Owner Only)');
    btn.style.cssText = `
      background: linear-gradient(135deg, #78350f, #f59e0b, #fde68a);
      color: #1a0800;
      font-family: 'Fredoka One', cursive;
      font-weight: 900;
      font-size: .8rem;
      letter-spacing: .3px;
      padding: 7px 16px;
      border-radius: 99px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      position: relative;
      width: auto; height: auto; flex-shrink: 0;
      animation: admin-btn-pulse 2.5s ease-in-out infinite;
      transition: transform .18s, filter .18s;
      overflow: visible;
      margin-right: 4px;
    `;
    btn.innerHTML = `
      <span style="display:inline-block;animation:crown-spin 2.5s ease-in-out infinite">👑</span>
      Admin
      <span style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;
                   background:#4ade80;border-radius:50%;border:2px solid #07011a;
                   box-shadow:0 0 6px #4ade80"></span>
    `;

    btn.addEventListener('mouseover', () => {
      btn.style.transform = 'scale(1.08) translateY(-2px)';
      btn.style.filter    = 'brightness(1.1)';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.transform = '';
      btn.style.filter    = '';
    });

    // Insert before first topbar button
    const first = topbar.querySelector('.tb-btn');
    topbar.insertBefore(btn, first || topbar.firstChild);
  }

  function removeAdminButton() {
    document.getElementById('adminBtn')?.remove();
  }

  async function init() {
    // Step 1: Optimistic show based on stored user data (fast path)
    if (isOwnerLocally()) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createAdminButton, { once: true });
      } else {
        createAdminButton();
      }
    }

    // Step 2: Server verification (authoritative)
    const verified = await verifyOwnerWithServer();
    if (verified) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createAdminButton, { once: true });
      } else {
        createAdminButton();
      }
    } else {
      // Server denied — remove button even if localStorage said owner
      removeAdminButton();
    }
  }

  init();

  /* Re-check on login/logout */
  window.addEventListener('storage', e => {
    if (e.key === 'eylox_user' || e.key === 'eylox_token') init();
  });

})();
