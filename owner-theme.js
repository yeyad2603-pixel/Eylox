/* ============================================================
   EYLOX — owner-theme.js
   Applies a special gold/royal theme when the signed-in user
   is the platform owner (username: "Eylox", case-insensitive).
   Self-contained; re-checks on login / logout via storage events.
   ============================================================ */
'use strict';

(function EyloxOwnerTheme() {
  const OWNER = 'eylox';

  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; }
  }

  function isOwner() {
    // Read from the server-provided user object (set by API on login).
    // Do NOT trust the raw eylox_is_owner flag — it can be set by anyone.
    const u = getUser();
    if (!u) return false;
    return u.isOwner === true;
  }

  /* ── Inject gold CSS variables + styles ── */
  function injectGoldTheme() {
    if (document.getElementById('owner-theme-style')) return;
    const s = document.createElement('style');
    s.id = 'owner-theme-style';
    s.textContent = `
      /* ══ Owner Gold Theme ══ */
      :root {
        --bg:          #060400 !important;
        --surface:     #110c00 !important;
        --card:        #1a1200 !important;
        --purple:      #f59e0b !important;
        --border:      rgba(245,158,11,.22) !important;
        --text:        #fff8e7 !important;
        --muted:       rgba(253,230,138,.55) !important;
        --accent-glow: rgba(245,158,11,.28) !important;
      }

      /* Scroll-progress bar gold */
      #scroll-progress { background: linear-gradient(90deg,#92400e,#f59e0b,#fde68a) !important; }

      /* Logo text gold */
      .sidebar-logo-text {
        background: linear-gradient(135deg,#fde68a,#f59e0b,#d97706) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
      }

      /* Active sidebar link */
      .sidebar-link.active {
        background: linear-gradient(90deg, rgba(245,158,11,.2), rgba(253,230,138,.05)) !important;
        color: #fde68a !important;
      }
      .sidebar-link.active::after {
        background: linear-gradient(180deg,#f59e0b,#fde68a) !important;
      }

      /* Primary buttons gold */
      .btn-play, .btn-primary, .g3d-btn {
        background: linear-gradient(135deg,#92400e,#f59e0b,#fde68a) !important;
        color: #1a0800 !important;
        box-shadow: 0 4px 20px rgba(245,158,11,.55) !important;
      }
      .btn-play:hover, .btn-primary:hover, .g3d-btn:hover {
        box-shadow: 0 8px 32px rgba(245,158,11,.85) !important;
        transform: translateY(-2px) !important;
      }

      /* Game card hover */
      .game-card:hover, .g3d-card:hover {
        border-color: rgba(245,158,11,.55) !important;
        box-shadow: 0 8px 40px rgba(245,158,11,.22) !important;
      }

      /* Notification dot gold */
      .notif-dot, .notif-badge {
        background: linear-gradient(135deg,#d97706,#fbbf24) !important;
        box-shadow: 0 0 10px rgba(245,158,11,.7) !important;
      }

      /* Topbar coins */
      .tb-coins, #topbarCoins { color: #fde68a !important; }

      /* Avatar pulsing gold ring */
      .tb-avatar {
        animation: owner-avatar-glow 2.5s ease-in-out infinite !important;
      }
      @keyframes owner-avatar-glow {
        0%,100% { box-shadow: 0 0 0 2px rgba(245,158,11,.5), 0 0 16px rgba(245,158,11,.3); }
        50%      { box-shadow: 0 0 0 3px rgba(253,230,138,.85), 0 0 28px rgba(245,158,11,.65); }
      }

      /* Welcome banner tinted gold */
      .welcome-banner {
        background: linear-gradient(135deg,
          rgba(245,158,11,.14) 0%,
          rgba(253,230,138,.07) 50%,
          rgba(120,53,15,.18) 100%) !important;
        border-color: rgba(245,158,11,.32) !important;
      }

      /* Section header accent */
      .section-title, .sub-title { color: #fde68a !important; }

      /* Owner crown badge */
      #owner-crown-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: linear-gradient(135deg,#78350f,#f59e0b,#fde68a);
        color: #1a0800;
        font-family: var(--font-head,'Fredoka One',cursive);
        font-size: .75rem;
        font-weight: 900;
        padding: 5px 13px;
        border-radius: 99px;
        letter-spacing: .3px;
        flex-shrink: 0;
        cursor: default;
        user-select: none;
        animation: owner-badge-glow 2.2s ease-in-out infinite;
      }
      @keyframes owner-badge-glow {
        0%,100% { box-shadow: 0 4px 20px rgba(245,158,11,.6), 0 0 0 2px rgba(253,230,138,.25); }
        50%      { box-shadow: 0 6px 32px rgba(245,158,11,.95), 0 0 0 3px rgba(253,230,138,.55), 0 0 60px rgba(245,158,11,.3); }
      }
      #owner-crown-badge .oc-spin {
        display: inline-block;
        animation: oc-spin 4s linear infinite;
      }
      @keyframes oc-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      /* Gold sidebar coins label */
      .sidebar-coins .coins-label { color: rgba(253,230,138,.55) !important; }
      .coins-amount, .Eyltrophs-amount { color: #fde68a !important; }

      /* Gold filter tabs active */
      .f-tab.active {
        background: linear-gradient(135deg,#92400e,#f59e0b) !important;
        color: #1a0800 !important;
        box-shadow: 0 4px 16px rgba(245,158,11,.5) !important;
      }

      /* Gold 3D card badge */
      .g3d-badge {
        background: linear-gradient(135deg,#78350f,#f59e0b) !important;
        box-shadow: 0 2px 12px rgba(245,158,11,.5) !important;
      }

      /* Topbar background subtle gold tint */
      .topbar {
        background: rgba(6,4,0,.88) !important;
        border-bottom-color: rgba(245,158,11,.15) !important;
      }

      /* Sidebar gold divider */
      .sidebar-divider { border-color: rgba(245,158,11,.12) !important; }

      /* Owner shimmer on page background */
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,.07) 0%, transparent 70%);
      }
    `;
    document.head.appendChild(s);
    document.documentElement.setAttribute('data-owner', 'true');
  }

  /* ── Remove gold theme ── */
  function removeGoldTheme() {
    document.getElementById('owner-theme-style')?.remove();
    document.getElementById('owner-crown-badge')?.remove();
    document.documentElement.removeAttribute('data-owner');
  }

  /* ── Inject crown badge into topbar ── */
  function injectCrownBadge() {
    if (document.getElementById('owner-crown-badge')) return;
    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight) return;
    const badge = document.createElement('div');
    badge.id = 'owner-crown-badge';
    badge.setAttribute('title', 'Platform Owner');
    badge.innerHTML = '<span class="oc-spin">👑</span> Owner';
    topbarRight.insertBefore(badge, topbarRight.firstChild);
  }

  /* ── Show gold welcome toast on first login as owner ── */
  function showOwnerWelcome() {
    const key = 'eylox_owner_welcomed';
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    setTimeout(() => {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed;bottom:90px;right:20px;z-index:99999;
        background:linear-gradient(135deg,#78350f,#f59e0b,#fde68a);
        color:#1a0800;font-family:'Fredoka One',cursive;font-size:1rem;
        padding:18px 24px;border-radius:20px;max-width:280px;
        box-shadow:0 8px 40px rgba(245,158,11,.7);
        display:flex;align-items:center;gap:12px;
        animation:owner-toast-in .5s cubic-bezier(.34,1.56,.64,1) both;
      `;
      if (!document.getElementById('owner-toast-kf')) {
        const kf = document.createElement('style');
        kf.id = 'owner-toast-kf';
        kf.textContent = `
          @keyframes owner-toast-in{from{opacity:0;transform:translateX(120px)}to{opacity:1;transform:none}}
          @keyframes owner-toast-out{to{opacity:0;transform:translateX(120px)}}
        `;
        document.head.appendChild(kf);
      }
      el.innerHTML = '<span style="font-size:2rem">👑</span><div><div>Welcome, Owner!</div><div style="font-size:.78rem;font-weight:700;opacity:.8;margin-top:3px">Your special gold theme is active.</div></div>';
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.animation = 'owner-toast-out .4s ease forwards';
        setTimeout(() => el.remove(), 420);
      }, 4500);
    }, 1500);
  }

  /* ── Main apply ── */
  function apply() {
    if (isOwner()) {
      injectGoldTheme();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          injectCrownBadge();
          showOwnerWelcome();
        }, { once: true });
      } else {
        injectCrownBadge();
        showOwnerWelcome();
      }
    } else {
      removeGoldTheme();
    }
  }

  apply();

  /* Re-apply on login / logout (same-tab via polling; cross-tab via storage event) */
  window.addEventListener('storage', e => {
    if (e.key === 'eylox_user') apply();
  });

  /* Poll for same-tab login state changes every 3 seconds */
  let _lastOwnerState = isOwner();
  setInterval(() => {
    const current = isOwner();
    if (current !== _lastOwnerState) {
      _lastOwnerState = current;
      apply();
    }
  }, 3000);

})();
