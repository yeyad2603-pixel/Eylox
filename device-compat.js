/* ============================================================
   EYLOX — Device Compatibility & Platform Detection v1.0
   Detects: Mobile, Tablet, Desktop, Smart TV, Console
   Sets CSS vars, touch targets, viewport, safe areas
   ============================================================ */
'use strict';

(function EyloxDeviceCompat() {

  /* ── Platform detection ── */
  const ua  = navigator.userAgent || '';
  const pf  = navigator.platform  || '';

  const IS_TOUCH     = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const IS_IOS       = /iPad|iPhone|iPod/.test(ua) || (pf === 'MacIntel' && IS_TOUCH);
  const IS_ANDROID   = /Android/.test(ua);
  const IS_MOBILE    = IS_IOS || IS_ANDROID || /Mobile|BlackBerry|IEMobile|Opera Mini/.test(ua);
  const IS_TABLET    = !IS_MOBILE && IS_TOUCH && (Math.min(screen.width, screen.height) >= 600);
  const IS_SMART_TV  = /SmartTV|SMART-TV|HbbTV|Tizen|WebOS|NetCast|BRAVIA|SamsungBrowser.+TV/.test(ua);
  const IS_PS        = /PlayStation/.test(ua);
  const IS_XBOX      = /Xbox/.test(ua);
  const IS_SWITCH    = /Nintendo/.test(ua);
  const IS_CONSOLE   = IS_PS || IS_XBOX || IS_SWITCH;

  const DEVICE_TYPE = IS_CONSOLE  ? 'console'
                    : IS_SMART_TV ? 'tv'
                    : IS_TABLET   ? 'tablet'
                    : IS_MOBILE   ? 'mobile'
                    : 'desktop';

  window.EyloxDevice = {
    type: DEVICE_TYPE, isTouch: IS_TOUCH, isMobile: IS_MOBILE,
    isTablet: IS_TABLET, isTV: IS_SMART_TV, isConsole: IS_CONSOLE,
    isIOS: IS_IOS, isAndroid: IS_ANDROID,
    isPS: IS_PS, isXbox: IS_XBOX, isSwitch: IS_SWITCH,
  };

  /* ── Apply <html> data attribute for CSS hooks ── */
  document.documentElement.dataset.device  = DEVICE_TYPE;
  document.documentElement.dataset.touch   = IS_TOUCH ? '1' : '0';
  if (IS_CONSOLE) document.documentElement.dataset.console = IS_PS ? 'ps' : IS_XBOX ? 'xbox' : 'switch';

  /* ── Viewport meta fix for iOS safe areas ── */
  if (IS_IOS) {
    const vm = document.querySelector('meta[name="viewport"]');
    if (vm) vm.content = 'width=device-width,initial-scale=1.0,viewport-fit=cover';
  }

  /* ── CSS custom properties ── */
  function applyDeviceCSS() {
    const r = document.documentElement.style;
    if (IS_MOBILE) {
      r.setProperty('--tap-target', '44px');
      r.setProperty('--font-scale', '1.02');
      r.setProperty('--card-gap', '10px');
      r.setProperty('--sidebar-w', '0px');
    } else if (IS_TABLET) {
      r.setProperty('--tap-target', '48px');
      r.setProperty('--font-scale', '1.0');
      r.setProperty('--card-gap', '14px');
    } else if (IS_SMART_TV || IS_CONSOLE) {
      r.setProperty('--tap-target', '64px');
      r.setProperty('--font-scale', '1.3');
      r.setProperty('--card-gap', '18px');
      r.setProperty('--card-radius', '18px');
    } else {
      r.setProperty('--tap-target', '36px');
      r.setProperty('--font-scale', '1.0');
      r.setProperty('--card-gap', '16px');
    }

    /* Safe area insets (iOS notch / home-bar) */
    if (IS_IOS) {
      r.setProperty('--safe-top',    'env(safe-area-inset-top, 0px)');
      r.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)');
      r.setProperty('--safe-left',   'env(safe-area-inset-left, 0px)');
      r.setProperty('--safe-right',  'env(safe-area-inset-right, 0px)');
    }
  }
  applyDeviceCSS();

  /* ── Inject device-specific CSS ── */
  const style = document.createElement('style');
  style.id = 'eylox-device-compat-css';
  style.textContent = `

    /* Touch devices: increase tap targets */
    [data-touch="1"] .btn-play,
    [data-touch="1"] .sidebar-link,
    [data-touch="1"] .as-link,
    [data-touch="1"] button {
      min-height: var(--tap-target, 44px);
    }

    /* TV / Console — large text, bigger focus rings */
    [data-device="tv"] body,
    [data-device="console"] body {
      font-size: calc(1rem * var(--font-scale, 1.3));
    }
    [data-device="tv"] .sidebar,
    [data-device="console"] .sidebar {
      display: none; /* TV navigates by controller — no sidebar needed */
    }
    [data-device="tv"] .app-content,
    [data-device="console"] .app-content {
      margin-left: 0 !important;
    }
    [data-device="tv"] .game-card,
    [data-device="console"] .game-card {
      transition: transform .2s, box-shadow .2s;
    }
    [data-device="tv"] .game-card:focus,
    [data-device="console"] .game-card:focus,
    [data-device="tv"] button:focus,
    [data-device="console"] button:focus,
    [data-device="tv"] a:focus,
    [data-device="console"] a:focus {
      outline: 3px solid #a78bfa;
      outline-offset: 4px;
      transform: scale(1.04);
      box-shadow: 0 0 0 6px rgba(167,139,250,.2), 0 8px 24px rgba(0,0,0,.4);
    }

    /* Mobile: hide complex sidebar in favor of bottom nav */
    [data-device="mobile"] .sidebar { display: none; }
    [data-device="mobile"] .app-content { margin-left: 0 !important; padding-bottom: 70px; }

    /* Mobile bottom navigation bar */
    #eylox-bottom-nav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 500;
      background: rgba(10,6,28,.96); backdrop-filter: blur(20px);
      border-top: 1px solid rgba(167,139,250,.15);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      height: calc(58px + env(safe-area-inset-bottom, 0px));
    }
    [data-device="mobile"] #eylox-bottom-nav,
    [data-device="tablet"] #eylox-bottom-nav { display: flex; }
    .ebn-inner {
      display: flex; align-items: center; justify-content: space-around;
      width: 100%; height: 58px;
    }
    .ebn-tab {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 12px; border-radius: 12px; cursor: pointer;
      text-decoration: none; color: rgba(200,190,230,.45);
      transition: color .18s, background .18s; font-size: .58rem;
      font-weight: 800; letter-spacing: .3px; flex: 1; min-height: 44px;
      justify-content: center;
    }
    .ebn-tab .ebn-icon { font-size: 1.3rem; line-height: 1; }
    .ebn-tab.active, .ebn-tab:active { color: #a78bfa; background: rgba(167,139,250,.12); }

    /* Touch virtual D-pad */
    #eylox-touch-dpad {
      display: none;
      position: fixed; bottom: 80px; left: 20px; z-index: 600;
      width: 130px; height: 130px; touch-action: none;
    }
    [data-device="mobile"].game-active #eylox-touch-dpad { display: block; }

    /* Device indicator pill (dev-mode only) */
    #eylox-device-pill {
      position: fixed; top: 4px; left: 50%; transform: translateX(-50%);
      background: rgba(30,10,60,.9); border: 1px solid rgba(167,139,250,.3);
      color: #a78bfa; font-size: .62rem; font-weight: 900; padding: 2px 10px;
      border-radius: 99px; z-index: 99999; pointer-events: none; letter-spacing: .5px;
      display: none;
    }
  `;
  document.head.appendChild(style);

  /* ── Bottom navigation (mobile) ── */
  function injectBottomNav() {
    if (document.getElementById('eylox-bottom-nav')) return;
    const current = location.pathname.split('/').pop() || 'index.html';
    const tabs = [
      { icon: '🏠', label: 'Home',    url: 'index.html' },
      { icon: '🎮', label: 'Games',   url: 'games.html' },
      { icon: '🔍', label: 'Search',  url: '#search',   action: 'search' },
      { icon: '👤', label: 'Profile', url: 'profile.html' },
      { icon: '⚙️', label: 'More',    url: 'settings.html' },
    ];
    const nav = document.createElement('nav');
    nav.id = 'eylox-bottom-nav';
    nav.setAttribute('aria-label', 'Bottom navigation');
    nav.innerHTML = `<div class="ebn-inner">${tabs.map(t => `
      <a class="ebn-tab${current === t.url ? ' active' : ''}"
         href="${t.url}"
         ${t.action ? `onclick="event.preventDefault();${t.action === 'search' ? "if(window.openSearchOverlay)openSearchOverlay();" : ''}"` : ''}>
        <span class="ebn-icon">${t.icon}</span>${t.label}
      </a>`).join('')}</div>`;
    document.body.appendChild(nav);
  }

  /* ── Performance benchmark (FPS sampling) ── */
  let _perfScore = 100; // 0–100
  function benchmarkPerf() {
    let frames = 0;
    const start = performance.now();
    function tick() {
      frames++;
      if (performance.now() - start < 1000) {
        requestAnimationFrame(tick);
      } else {
        _perfScore = Math.min(100, Math.round(frames / 0.6));
        localStorage.setItem('eylox_perf_score', _perfScore);
        window.EyloxPerfScore = _perfScore;
        /* Auto-select graphics quality */
        const q = _perfScore > 80 ? 'ultra'
                : _perfScore > 55 ? 'high'
                : _perfScore > 30 ? 'medium'
                : 'low';
        const saved = localStorage.getItem('eylox_graphics_quality');
        if (!saved) {
          localStorage.setItem('eylox_graphics_quality', q);
          if (window.EyloxGraphics?.applyQuality) EyloxGraphics.applyQuality(q);
        }
      }
    }
    requestAnimationFrame(tick);
  }

  /* ── Orientation change handler ── */
  function handleOrientation() {
    const landscape = window.innerWidth > window.innerHeight;
    document.documentElement.dataset.orient = landscape ? 'land' : 'port';
    /* Nudge layout on rotation */
    document.querySelectorAll('.game-card').forEach((c,i) => {
      c.style.animationDelay = (i * 0.03) + 's';
    });
  }
  window.addEventListener('resize', handleOrientation);
  window.addEventListener('orientationchange', () => setTimeout(handleOrientation, 300));
  handleOrientation();

  /* ── Startup ── */
  document.addEventListener('DOMContentLoaded', () => {
    if (IS_MOBILE || IS_TABLET) injectBottomNav();

    /* Benchmark only on first visit or after 1 day */
    const lastBench = parseInt(localStorage.getItem('eylox_bench_ts') || '0', 10);
    if (Date.now() - lastBench > 86400000) {
      localStorage.setItem('eylox_bench_ts', Date.now());
      setTimeout(benchmarkPerf, 2000);
    } else {
      window.EyloxPerfScore = parseInt(localStorage.getItem('eylox_perf_score') || '60', 10);
    }

    /* TV/console: make all interactables focusable via D-pad */
    if (IS_SMART_TV || IS_CONSOLE) {
      document.querySelectorAll('.game-card, .btn-play, .sidebar-link, button, a[href]').forEach(el => {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      });
      /* D-pad navigation via arrow keys */
      document.addEventListener('keydown', e => {
        const focusable = [...document.querySelectorAll('[tabindex]:not([tabindex="-1"]), button:not([disabled]), a[href]')]
          .filter(el => el.offsetParent !== null);
        const idx = focusable.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' && idx < focusable.length - 1) { e.preventDefault(); focusable[idx + 1]?.focus(); }
        if (e.key === 'ArrowUp'   && idx > 0)                    { e.preventDefault(); focusable[idx - 1]?.focus(); }
        if (e.key === 'ArrowRight') { /* handled by controller.js */ }
        if (e.key === 'ArrowLeft')  { /* handled by controller.js */ }
        if (e.key === 'Enter' || e.key === ' ') {
          if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.click();
          }
        }
      });
    }
  });

  /* ── Expose API ── */
  window.EyloxDevice.benchmark = benchmarkPerf;
  window.EyloxDevice.perfScore = () => _perfScore;

  console.log(`[Eylox] Device: ${DEVICE_TYPE} | Touch: ${IS_TOUCH} | Perf: TBD`);

})();
