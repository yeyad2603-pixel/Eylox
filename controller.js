/* ============================================================
   EYLOX — Controller & Input System v1.0
   - Gamepad API (Xbox / PS / Nintendo Switch)
   - Virtual touch joystick & buttons (mobile)
   - Vibration feedback (Vibration API)
   - Keyboard shortcuts for nav
   ============================================================ */
'use strict';

(function EyloxController() {

  /* ── Gamepad state ── */
  const pads   = {};
  let   rafId  = null;
  let   active = false;

  /* Button indices (standard gamepad layout) */
  const BTN = {
    A:0, B:1, X:2, Y:3,
    LB:4, RB:5, LT:6, RT:7,
    SELECT:8, START:9,
    LS:10, RS:11,
    UP:12, DOWN:13, LEFT:14, RIGHT:15,
    HOME:16,
  };

  /* Platform label maps */
  const LABELS = {
    xbox:     { 0:'A', 1:'B', 2:'X', 3:'Y',        4:'LB',  5:'RB', 6:'LT', 7:'RT', 8:'View', 9:'Menu', 16:'Xbox' },
    ps:       { 0:'✕', 1:'○', 2:'□', 3:'△',        4:'L1',  5:'R1', 6:'L2', 7:'R2', 8:'Share',9:'Options',16:'PS' },
    nintendo: { 0:'B', 1:'A', 2:'Y', 3:'X',         4:'L',   5:'R',  6:'ZL', 7:'ZR', 8:'-',   9:'+',    16:'Home' },
    generic:  { 0:'A', 1:'B', 2:'X', 3:'Y' },
  };

  function detectPlatform(gp) {
    const id = (gp.id || '').toLowerCase();
    if (/xbox|xinput|045e/.test(id))     return 'xbox';
    if (/054c|playstation|ps[345]/.test(id)) return 'ps';
    if (/057e|nintendo|joy-con|switch/.test(id)) return 'nintendo';
    return 'generic';
  }

  /* ── Vibration ── */
  function vibrate(pattern = [50]) {
    try {
      const enabled = localStorage.getItem('eylox_settings');
      const s = enabled ? JSON.parse(enabled) : {};
      if (s.vibration === false) return;
      if (navigator.vibrate) navigator.vibrate(pattern);
      /* Gamepad haptic (Chrome 68+, not widely supported) */
      for (const id of Object.keys(pads)) {
        const gp = navigator.getGamepads()[id];
        if (gp?.vibrationActuator?.playEffect) {
          gp.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0, duration: pattern[0] || 50,
            weakMagnitude: 0.3, strongMagnitude: 0.5,
          }).catch(() => {});
        }
      }
    } catch {}
  }
  window.EyloxVibrate = vibrate;

  /* ── Button press routing (maps to UI actions) ── */
  const _pressed = {};
  function onButtonPress(btnIdx, platform) {
    const key = platform + '_' + btnIdx;
    if (_pressed[key]) return;
    _pressed[key] = true;

    vibrate([30]);

    /* Navigation buttons */
    if (btnIdx === BTN.START || btnIdx === BTN.SELECT) {
      /* Pause / menu toggle */
      document.dispatchEvent(new CustomEvent('eylox:gamepad:pause'));
      return;
    }
    if (btnIdx === BTN.A) {
      /* Confirm / click focused element */
      const el = document.activeElement;
      if (el && el !== document.body) el.click();
      return;
    }
    if (btnIdx === BTN.B) {
      /* Back */
      history.back();
      return;
    }

    /* D-pad navigation */
    const focusable = [...document.querySelectorAll('[tabindex]:not([tabindex="-1"]), button:not([disabled]), a[href], input, select')]
      .filter(el => el.offsetParent !== null);
    const idx = focusable.indexOf(document.activeElement);

    if (btnIdx === BTN.DOWN && idx < focusable.length - 1) { focusable[idx + 1]?.focus(); return; }
    if (btnIdx === BTN.UP   && idx > 0)                    { focusable[idx - 1]?.focus(); return; }
    if (btnIdx === BTN.RIGHT) {
      const row = focusable.slice(idx + 1).find(el => {
        const r1 = document.activeElement.getBoundingClientRect();
        const r2 = el.getBoundingClientRect();
        return Math.abs(r2.top - r1.top) < 30 && r2.left > r1.left;
      });
      row?.focus();
      return;
    }
    if (btnIdx === BTN.LEFT) {
      const row = [...focusable].slice(0, idx).reverse().find(el => {
        const r1 = document.activeElement.getBoundingClientRect();
        const r2 = el.getBoundingClientRect();
        return Math.abs(r2.top - r1.top) < 30 && r2.left < r1.left;
      });
      row?.focus();
      return;
    }

    /* Dispatch generic event for games to hook into */
    document.dispatchEvent(new CustomEvent('eylox:gamepad:button', { detail: { btn: btnIdx, platform } }));
  }

  function onButtonRelease(btnIdx, platform) {
    delete _pressed[platform + '_' + btnIdx];
    document.dispatchEvent(new CustomEvent('eylox:gamepad:buttonup', { detail: { btn: btnIdx, platform } }));
  }

  /* ── Poll loop ── */
  function pollGamepads() {
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gps.length; i++) {
      const gp = gps[i];
      if (!gp) continue;
      const plat = pads[gp.index]?.platform || detectPlatform(gp);
      if (!pads[gp.index]) pads[gp.index] = { platform: plat, prev: [] };
      const prev = pads[gp.index].prev;

      gp.buttons.forEach((btn, idx) => {
        const wasPressed = prev[idx];
        const isPressed  = btn.pressed || btn.value > 0.5;
        if (isPressed  && !wasPressed) onButtonPress(idx, plat);
        if (!isPressed && wasPressed)  onButtonRelease(idx, plat);
        prev[idx] = isPressed;
      });

      /* Analog sticks → expose as axes for games */
      window.EyloxAxes = {
        lx: gp.axes[0] || 0,
        ly: gp.axes[1] || 0,
        rx: gp.axes[2] || 0,
        ry: gp.axes[3] || 0,
      };
    }
    rafId = requestAnimationFrame(pollGamepads);
  }

  /* ── Connect / Disconnect ── */
  window.addEventListener('gamepadconnected', e => {
    const gp   = e.gamepad;
    const plat = detectPlatform(gp);
    pads[gp.index] = { platform: plat, prev: [] };
    if (!active) { active = true; pollGamepads(); }
    showControllerToast(plat, gp.id);
    document.documentElement.dataset.controller = plat;
    vibrate([40, 30, 40]);
  });

  window.addEventListener('gamepaddisconnected', e => {
    delete pads[e.gamepad.index];
    if (!Object.keys(pads).length) {
      active = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      delete document.documentElement.dataset.controller;
    }
  });

  function showControllerToast(platform, id) {
    const icons = { xbox:'🎮', ps:'🎮', nintendo:'🕹️', generic:'🕹️' };
    const names = { xbox:'Xbox Controller', ps:'PlayStation Controller', nintendo:'Nintendo Controller', generic:'Gamepad' };
    const msg   = `${icons[platform]} ${names[platform]} connected`;
    if (window.EyloxToast) EyloxToast(msg, 'info', 3000);
    else console.log('[Eylox]', msg, '-', id);
  }

  /* ── Virtual Touch Joystick ── */
  function injectTouchControls() {
    if (document.getElementById('eylox-touch-controls')) return;
    const dev = window.EyloxDevice;
    if (!dev?.isTouch) return;

    const wrap = document.createElement('div');
    wrap.id = 'eylox-touch-controls';
    wrap.style.cssText = `
      display:none;
      position:fixed;bottom:80px;left:0;right:0;z-index:600;
      pointer-events:none;
    `;
    wrap.innerHTML = `
      <!-- Left joystick zone -->
      <div id="ej-left-zone" style="position:absolute;left:20px;bottom:0;width:120px;height:120px;pointer-events:auto">
        <canvas id="ej-joystick-canvas" width="120" height="120" style="border-radius:50%;opacity:.6"></canvas>
      </div>
      <!-- Right action buttons -->
      <div id="ej-right-zone" style="position:absolute;right:20px;bottom:10px;display:flex;flex-direction:column;gap:10px;pointer-events:auto">
        <button id="ej-btn-a" style="width:52px;height:52px;border-radius:50%;background:rgba(74,222,128,.75);border:2px solid #4ade80;color:#fff;font-weight:900;font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent">A</button>
        <div style="display:flex;gap:10px">
          <button id="ej-btn-b" style="width:44px;height:44px;border-radius:50%;background:rgba(248,113,113,.75);border:2px solid #f87171;color:#fff;font-weight:900;font-size:.9rem;cursor:pointer;-webkit-tap-highlight-color:transparent">B</button>
          <button id="ej-btn-x" style="width:44px;height:44px;border-radius:50%;background:rgba(96,165,250,.75);border:2px solid #60a5fa;color:#fff;font-weight:900;font-size:.9rem;cursor:pointer;-webkit-tap-highlight-color:transparent">X</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    /* Joystick drawing */
    const canvas = document.getElementById('ej-joystick-canvas');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    let jCenter  = { x: 60, y: 60 };
    let jPos     = { x: 60, y: 60 };
    let touching = false;
    const R      = 50, rInner = 20;

    function drawJoystick() {
      ctx.clearRect(0, 0, 120, 120);
      ctx.beginPath();
      ctx.arc(jCenter.x, jCenter.y, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(167,139,250,.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(167,139,250,.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(jPos.x, jPos.y, rInner, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(167,139,250,.8)';
      ctx.fill();
    }
    drawJoystick();

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      touching = true;
      const t  = e.touches[0];
      const rc = canvas.getBoundingClientRect();
      jCenter  = { x: t.clientX - rc.left, y: t.clientY - rc.top };
      jPos     = { ...jCenter };
      drawJoystick();
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (!touching) return;
      const t  = e.touches[0];
      const rc = canvas.getBoundingClientRect();
      let dx    = (t.clientX - rc.left) - jCenter.x;
      let dy    = (t.clientY - rc.top)  - jCenter.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > R) { dx = dx / len * R; dy = dy / len * R; }
      jPos = { x: jCenter.x + dx, y: jCenter.y + dy };
      drawJoystick();
      /* Expose normalized axes */
      window.EyloxAxes = { lx: dx / R, ly: dy / R, rx: 0, ry: 0 };
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      touching = false;
      jPos = { ...jCenter };
      drawJoystick();
      window.EyloxAxes = { lx: 0, ly: 0, rx: 0, ry: 0 };
    });

    /* Action button events */
    ['a','b','x'].forEach((id, i) => {
      const btn = document.getElementById(`ej-btn-${id}`);
      if (!btn) return;
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        vibrate([20]);
        document.dispatchEvent(new CustomEvent('eylox:gamepad:button', { detail: { btn: i, platform: 'touch' } }));
        if (i === 0) { const el = document.activeElement; if (el && el !== document.body) el.click(); }
      }, { passive: false });
    });

    /* Show controls only on game pages */
    function checkShowControls() {
      const show = document.body.dataset.page === 'game'
                || location.href.includes('game3d')
                || location.href.includes('game.html');
      wrap.style.display = show ? 'block' : 'none';
    }
    checkShowControls();
    window.EyloxTouchControls = { show: () => wrap.style.display = 'block', hide: () => wrap.style.display = 'none' };
  }

  /* ── Keyboard shortcut map ── */
  const SHORTCUTS = {
    'g':        () => window.location.href = 'games.html',
    'h':        () => window.location.href = 'index.html',
    'p':        () => window.location.href = 'profile.html',
    'l':        () => window.location.href = 'leaderboard.html',
    'f':        () => window.location.href = 'friends.html',
    'Escape':   () => { /* handled elsewhere */ },
  };

  document.addEventListener('keydown', e => {
    /* Don't fire if typing in an input */
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const fn = SHORTCUTS[e.key];
    if (fn) fn();
  });

  /* ── Axes polling for games ── */
  if (!window.EyloxAxes) window.EyloxAxes = { lx: 0, ly: 0, rx: 0, ry: 0 };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    injectTouchControls();
    /* Check if gamepad already connected (page reload) */
    if (navigator.getGamepads) {
      const gps = navigator.getGamepads();
      for (let i = 0; i < gps.length; i++) {
        if (gps[i]) {
          const plat = detectPlatform(gps[i]);
          pads[gps[i].index] = { platform: plat, prev: [] };
          if (!active) { active = true; pollGamepads(); }
          document.documentElement.dataset.controller = plat;
        }
      }
    }
  });

  window.EyloxController = { vibrate, BTN, LABELS };

})();
