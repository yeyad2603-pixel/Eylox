/* ============================================================
   EYLOX — Platform Improvements v2.0
   General UI polish: tooltips, smooth nav, loading animations,
   mobile responsiveness, toast system, quick season pass button
   ============================================================ */
'use strict';

(function EyloxPlatformImprovements() {

  /* ══════════════════════════════════════════════════════
     GLOBAL TOAST SYSTEM
  ══════════════════════════════════════════════════════ */
  function getToastContainer() {
    let el = document.getElementById('eylox-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'eylox-toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  window.EyloxToast = function(message, type = 'info', duration = 2500) {
    const colors  = { success:'#4ade80', error:'#f87171', warn:'#fde68a', info:'#60a5fa' };
    const icons   = { success:'✅', error:'❌', warn:'⚠️', info:'ℹ️' };
    const color   = colors[type] || colors.info;
    const icon    = icons[type] || icons.info;

    const toast = document.createElement('div');
    toast.className = 'eylox-toast';
    toast.style.borderLeft = `3px solid ${color}`;
    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';
    iconSpan.textContent = icon;
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);

    const container = getToastContainer();
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  /* ══════════════════════════════════════════════════════
     TOOLTIP SYSTEM
  ══════════════════════════════════════════════════════ */
  (function initTooltips() {
    let tip = null, showTimer = null, hideTimer = null;

    document.addEventListener('mouseover', e => {
      const el = e.target.closest('[title],[data-tip]');
      if (!el) return;
      const text = el.dataset.tip || el.title;
      if (!text || text.length < 3) return;
      if (el.title) el.dataset.tip = el.title; el.removeAttribute('title');

      clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        hideTip();
        tip = document.createElement('div');
        tip.className = 'eylox-tooltip';
        tip.textContent = text;
        document.body.appendChild(tip);

        const r = el.getBoundingClientRect();
        let top = r.top - tip.offsetHeight - 8;
        let left = r.left + (r.width - tip.offsetWidth) / 2;
        if (top < 8) top = r.bottom + 8;
        left = Math.max(8, Math.min(window.innerWidth - tip.offsetWidth - 8, left));
        tip.style.left = left + 'px'; tip.style.top = top + 'px';
      }, 300);
    });

    document.addEventListener('mouseout', e => {
      if (!e.target.closest('[data-tip]')) return;
      clearTimeout(showTimer);
      hideTimer = setTimeout(hideTip, 100);
    });

    function hideTip() { tip?.remove(); tip = null; }
  })();

  /* ══════════════════════════════════════════════════════
     LOADING ANIMATIONS
  ══════════════════════════════════════════════════════ */
  (function initLoadingAnim() {
    const s = document.createElement('style');
    s.textContent = `
      .eylox-skeleton {
        background:linear-gradient(90deg,rgba(167,139,250,.06) 25%,rgba(167,139,250,.12) 50%,rgba(167,139,250,.06) 75%);
        background-size:200% 100%;
        animation:skeletonShimmer 1.5s ease infinite;
        border-radius:8px;
      }
      @keyframes skeletonShimmer {
        0%   { background-position:200% 0; }
        100% { background-position:-200% 0; }
      }
      .eylox-loading-spinner {
        width:20px; height:20px; border:2px solid rgba(167,139,250,.2);
        border-top-color:#a78bfa; border-radius:50%;
        animation:spin .7s linear infinite; display:inline-block;
      }
      @keyframes spin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(s);
  })();

  /* ══════════════════════════════════════════════════════
     PAGE TRANSITION
  ══════════════════════════════════════════════════════ */
  (function initPageTransition() {
    const s = document.createElement('style');
    s.textContent = `
      .page-transition-overlay {
        position:fixed; inset:0; background:#050010; z-index:99999;
        pointer-events:none; opacity:0; transition:opacity .2s ease;
      }
      .page-transition-overlay.active { opacity:1; pointer-events:all; }
    `;
    document.head.appendChild(s);

    let overlay = null;
    function getOverlay() {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
      }
      return overlay;
    }

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript') || link.target === '_blank') return;
      if (!href.endsWith('.html') && !href.startsWith('./')) return;

      e.preventDefault();
      const ov = getOverlay();
      ov.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 200);
    });

    /* Fade in on load */
    window.addEventListener('pageshow', () => {
      const ov = getOverlay();
      ov.classList.remove('active');
    });
  })();

  /* ══════════════════════════════════════════════════════
     SCROLL REVEAL ANIMATIONS
  ══════════════════════════════════════════════════════ */
  (function initScrollReveal() {
    const s = document.createElement('style');
    s.textContent = `
      .sr-hidden { opacity:0; transform:translateY(20px); transition:opacity .5s ease, transform .5s ease; }
      .sr-visible { opacity:1; transform:none; }
      .sr-hidden.sr-delay-1 { transition-delay:.1s; }
      .sr-hidden.sr-delay-2 { transition-delay:.2s; }
      .sr-hidden.sr-delay-3 { transition-delay:.3s; }
    `;
    document.head.appendChild(s);

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sr-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    function observeElements() {
      document.querySelectorAll('.game-card, .stat-card, .achievement-card, .event-card, .friend-card').forEach(el => {
        if (!el.classList.contains('sr-hidden') && !el.classList.contains('sr-visible')) {
          el.classList.add('sr-hidden');
          obs.observe(el);
        }
      });
    }

    document.addEventListener('DOMContentLoaded', observeElements);
    setTimeout(observeElements, 800);
  })();

  /* Season Pass topbar button removed per user request */

  /* ══════════════════════════════════════════════════════
     ONLINE STATUS REFRESH (Friends)
  ══════════════════════════════════════════════════════ */
  (function refreshOnlineStatus() {
    function updateStatus() {
      try {
        const friends = JSON.parse(localStorage.getItem('eylox_friends') || '[]');
        const now = Date.now();
        friends.forEach(f => {
          const seed = f.username.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
          const wasOnline = f.online;
          f.online = ((now / 60000 | 0) + seed) % 4 !== 0;
          if (wasOnline !== f.online) {
            document.querySelectorAll(`[data-username="${f.username}"] .f-status`).forEach(el => {
              el.style.background = f.online ? '#4ade80' : '#555';
            });
          }
        });
      } catch {}
    }
    setInterval(updateStatus, 30000);
  })();

  /* ══════════════════════════════════════════════════════
     GLOBAL KEYBOARD SHORTCUTS
  ══════════════════════════════════════════════════════ */
  (function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea, select')) return;

      if (e.key === 'Escape') {
        /* Close any open modals */
        const modals = ['cpOverlay','sp-overlay','eylox-clan-panel','vc-preview-overlay','vc-container'];
        for (const id of modals) {
          const el = document.getElementById(id);
          if (el) { el.remove(); document.body.style.overflow = ''; break; }
        }
      }

      if (e.altKey && e.key === 's') {
        e.preventDefault();
        if (window.EyloxSeasonPass) EyloxSeasonPass.open();
      }

      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        if (window.EyloxClan) EyloxClan.open();
      }
    });
  })();

  /* ══════════════════════════════════════════════════════
     MOBILE IMPROVEMENTS
  ══════════════════════════════════════════════════════ */
  (function initMobileImprovements() {
    const s = document.createElement('style');
    s.textContent = `
      @media (max-width:768px) {
        /* Make modals full-screen on mobile */
        #cpOverlay .cp-inner,
        #sp-overlay .sp-inner,
        #eylox-clan-panel {
          width:100% !important;
          max-width:100% !important;
          border-radius:20px 20px 0 0 !important;
          position:fixed !important;
          bottom:0 !important;
          top:auto !important;
          left:0 !important;
          right:0 !important;
          transform:none !important;
          max-height:92vh !important;
        }

        /* Better touch targets */
        button, .clan-tab, .sp-claim-btn {
          min-height:36px;
        }

        /* Larger font for readability */
        .eylox-toast { font-size:.85rem !important; }
      }

      @media (max-width:480px) {
        #sp-topbar-btn { display:none; }
      }
    `;
    document.head.appendChild(s);

    /* Prevent double-tap zoom on buttons */
    document.addEventListener('touchend', e => {
      if (e.target.closest('button, a, .clan-tab, .sp-reward-card')) {
        e.preventDefault();
        e.target.closest('button, a, .clan-tab, .sp-reward-card').click();
      }
    }, { passive: false });
  })();

  /* ══════════════════════════════════════════════════════
     IMPROVED GLASSMORPHISM CARDS
  ══════════════════════════════════════════════════════ */
  (function injectGlobalStyles() {
    if (document.getElementById('platform-global-css')) return;
    const s = document.createElement('style');
    s.id = 'platform-global-css';
    s.textContent = `
      /* Smooth focus rings */
      *:focus-visible {
        outline:2px solid rgba(167,139,250,.6);
        outline-offset:2px;
        border-radius:4px;
      }

      /* Smooth scrolling */
      html { scroll-behavior:smooth; }

      /* Better scrollbars */
      ::-webkit-scrollbar { width:6px; height:6px; }
      ::-webkit-scrollbar-track { background:transparent; }
      ::-webkit-scrollbar-thumb { background:rgba(167,139,250,.2); border-radius:99px; }
      ::-webkit-scrollbar-thumb:hover { background:rgba(167,139,250,.4); }

      /* Glassmorphism card base */
      .glass-card {
        background:rgba(20,8,50,.6);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
        border:1px solid rgba(167,139,250,.15);
        border-radius:16px;
        transition:border-color .2s, box-shadow .2s, transform .2s;
      }
      .glass-card:hover {
        border-color:rgba(167,139,250,.3);
        box-shadow:0 8px 32px rgba(0,0,0,.3);
        transform:translateY(-2px);
      }

      /* Neon glow effects */
      .neon-purple { box-shadow:0 0 20px rgba(167,139,250,.3); }
      .neon-blue   { box-shadow:0 0 20px rgba(96,165,250,.3); }
      .neon-green  { box-shadow:0 0 20px rgba(74,222,128,.3); }

      /* Button hover states */
      button:not([disabled]) { cursor:pointer; }

      /* Image lazy load fade */
      img[loading="lazy"] { opacity:0; transition:opacity .4s ease; }
      img[loading="lazy"].loaded { opacity:1; }

      /* Animated gradient text */
      .gradient-text {
        background:linear-gradient(135deg,#a78bfa,#60a5fa,#4ade80,#fbbf24);
        background-size:300% auto;
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
        background-clip:text;
        animation:gradientShift 4s linear infinite;
      }
      @keyframes gradientShift {
        0%   { background-position:0% center; }
        100% { background-position:300% center; }
      }

      /* Online indicator pulse */
      .online-pulse {
        width:8px; height:8px; border-radius:50%; background:#4ade80;
        animation:onlinePulse 2s ease infinite;
      }
      @keyframes onlinePulse {
        0%,100% { box-shadow:0 0 0 0 rgba(74,222,128,.5); }
        50%      { box-shadow:0 0 0 5px rgba(74,222,128,0); }
      }
    `;
    document.head.appendChild(s);

    /* Lazy image loading */
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.complete) { img.classList.add('loaded'); return; }
      img.addEventListener('load', () => img.classList.add('loaded'));
    });
  })();

  /* ══════════════════════════════════════════════════════
     NOTIFICATION COUNT BADGES
  ══════════════════════════════════════════════════════ */
  (function initNotificationBadges() {
    function refreshBadges() {
      const me = (() => { try { return JSON.parse(localStorage.getItem('eylox_user')||'null'); } catch { return null; } })();
      if (!me) return;

      /* Unread messages */
      try {
        const msgs = JSON.parse(localStorage.getItem('eylox_messages') || '{}');
        const read = JSON.parse(localStorage.getItem('eylox_msg_read') || '{}');
        let unread = 0;
        for (const [key, arr] of Object.entries(msgs)) {
          if (!key.includes(me.username)) continue;
          const lastRead = read[key] || 0;
          unread += arr.filter(m => m.from !== me.username && m.ts > lastRead).length;
        }
        const dockMsg = document.querySelector('a[href="messages.html"] .dock-icon, .nav-item[href="messages.html"]');
        if (dockMsg) {
          let badge = dockMsg.querySelector('.msg-badge');
          if (unread > 0) {
            if (!badge) { badge = document.createElement('div'); badge.className = 'msg-badge'; badge.style.cssText = 'position:absolute;top:-3px;right:-3px;min-width:14px;height:14px;border-radius:99px;background:#f472b6;color:#fff;font-size:.52rem;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid var(--bg,#0d0520);pointer-events:none'; dockMsg.style.position = 'relative'; dockMsg.appendChild(badge); }
            badge.textContent = unread > 9 ? '9+' : unread;
          } else badge?.remove();
        }
      } catch {}
    }

    setInterval(refreshBadges, 5000);
    document.addEventListener('DOMContentLoaded', () => setTimeout(refreshBadges, 1500));
  })();

  /* ══════════════════════════════════════════════════════
     PERFORMANCE: Debounce search inputs
  ══════════════════════════════════════════════════════ */
  (function improveSearchInputs() {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').forEach(inp => {
        const orig = inp.oninput;
        let timer;
        inp.oninput = function(e) {
          clearTimeout(timer);
          timer = setTimeout(() => { if (orig) orig.call(this, e); }, 180);
        };
      });
    });
  })();

  console.log('🚀 EYLOX Platform Improvements v2.0 loaded');

})();
