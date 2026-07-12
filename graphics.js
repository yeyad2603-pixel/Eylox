/* ============================================================
   EYLOX — Graphics System v1.0
   - Quality presets: Low / Medium / High / Ultra
   - Auto-detection from device benchmark score
   - FPS counter + FPS limiter
   - CSS filter effects (bloom, shadows, fog)
   - Canvas quality helpers
   ============================================================ */
'use strict';

(function EyloxGraphicsSystem() {

  /* ── Quality presets ── */
  const PRESETS = {
    low: {
      particles:       false,
      shadows:         false,
      reflections:     false,
      bloom:           false,
      fog:             false,
      antialiasing:    false,
      textureQuality:  'low',
      renderScale:     0.75,
      animSpeed:       0.6,
      bgBlur:          '0px',
      cardShadow:      'none',
      brightness:      1.0,
      contrast:        1.0,
      saturate:        0.9,
    },
    medium: {
      particles:       true,
      shadows:         true,
      reflections:     false,
      bloom:           false,
      fog:             false,
      antialiasing:    false,
      textureQuality:  'medium',
      renderScale:     1.0,
      animSpeed:       1.0,
      bgBlur:          '12px',
      cardShadow:      '0 4px 16px rgba(0,0,0,.35)',
      brightness:      1.0,
      contrast:        1.0,
      saturate:        1.0,
    },
    high: {
      particles:       true,
      shadows:         true,
      reflections:     true,
      bloom:           true,
      fog:             false,
      antialiasing:    true,
      textureQuality:  'high',
      renderScale:     1.0,
      animSpeed:       1.0,
      bgBlur:          '18px',
      cardShadow:      '0 6px 28px rgba(0,0,0,.45), 0 0 0 1px rgba(167,139,250,.08)',
      brightness:      1.05,
      contrast:        1.05,
      saturate:        1.1,
    },
    ultra: {
      particles:       true,
      shadows:         true,
      reflections:     true,
      bloom:           true,
      fog:             true,
      antialiasing:    true,
      textureQuality:  'ultra',
      renderScale:     1.0,
      animSpeed:       1.0,
      bgBlur:          '24px',
      cardShadow:      '0 8px 36px rgba(0,0,0,.55), 0 0 0 1px rgba(167,139,250,.12), 0 0 60px rgba(124,58,237,.1)',
      brightness:      1.08,
      contrast:        1.08,
      saturate:        1.15,
    },
  };

  let _quality    = 'medium';
  let _fpsLimit   = 60;
  let _showFps    = false;
  let _lastFrame  = 0;
  let _frameCount = 0;
  let _fpsValue   = 0;
  let _fpsRafId   = null;
  let _fpsEl      = null;

  /* ── Apply quality preset ── */
  function applyQuality(q) {
    q = PRESETS[q] ? q : 'medium';
    _quality = q;
    const p   = PRESETS[q];
    const r   = document.documentElement.style;

    /* CSS custom properties → picked up by style.css */
    r.setProperty('--glass-blur',     `blur(${p.bgBlur})`);
    r.setProperty('--card-shadow',    p.cardShadow);
    r.setProperty('--anim-speed',     p.animSpeed.toString());

    /* Body filter for bloom / saturation */
    const filters = [];
    if (p.bloom)     filters.push(`brightness(${p.brightness}) contrast(${p.contrast})`);
    if (p.saturate !== 1.0) filters.push(`saturate(${p.saturate})`);
    document.body.style.filter = filters.join(' ');

    /* Particles */
    const particleContainers = document.querySelectorAll('.bg-particles, #bgParticles, .particle-layer');
    particleContainers.forEach(el => {
      el.style.display = p.particles ? '' : 'none';
    });

    /* Shadows on cards */
    const styleId = 'eylox-gfx-style';
    let st = document.getElementById(styleId);
    if (!st) { st = document.createElement('style'); st.id = styleId; document.head.appendChild(st); }
    st.textContent = `
      .game-card, .sidebar, .topbar, .modal-card {
        box-shadow: ${p.cardShadow} !important;
        backdrop-filter: blur(${p.bgBlur}) !important;
        -webkit-backdrop-filter: blur(${p.bgBlur}) !important;
      }
      body {
        --glass-blur: blur(${p.bgBlur});
      }
      ${q === 'low' ? `
        *, *::before, *::after { transition-duration: 0.08s !important; animation-duration: 0.15s !important; }
        .bg-particles, #bgParticles { display: none !important; }
      ` : ''}
      ${p.shadows ? '' : `
        .game-card, .btn-play, .topbar { box-shadow: none !important; }
      `}
      ${p.antialiasing ? 'canvas { image-rendering: auto; }' : 'canvas { image-rendering: pixelated; }'}
    `;

    /* Save */
    localStorage.setItem('eylox_graphics_quality', q);
    window.EyloxGraphics._current = q;

    /* Update settings UI if open */
    document.querySelectorAll('#qualityBtns .s-quality-btn, .gfx-quality-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.quality === q || btn.textContent.trim().toLowerCase() === q);
    });
  }

  /* ── Auto-detect from benchmark ── */
  function autoDetect() {
    const score = parseInt(localStorage.getItem('eylox_perf_score') || '60', 10);
    const q = score > 80 ? 'ultra' : score > 55 ? 'high' : score > 30 ? 'medium' : 'low';
    applyQuality(q);
    return q;
  }

  /* ── FPS Counter ── */
  function updateFpsEl(fps) {
    if (!_fpsEl) {
      _fpsEl = document.createElement('div');
      _fpsEl.id = 'eylox-fps-counter';
      _fpsEl.style.cssText = `
        position:fixed;top:60px;right:12px;z-index:9999;
        background:rgba(10,6,28,.85);backdrop-filter:blur(8px);
        border:1px solid rgba(167,139,250,.25);border-radius:8px;
        padding:3px 10px;font-family:monospace;font-size:.78rem;
        font-weight:700;color:#a78bfa;pointer-events:none;
        display:none;transition:color .3s;
      `;
      document.body.appendChild(_fpsEl);
    }
    _fpsEl.style.display = _showFps ? 'block' : 'none';
    if (!_showFps) return;
    _fpsEl.textContent = `${fps} FPS`;
    _fpsEl.style.color = fps >= 55 ? '#4ade80' : fps >= 30 ? '#fbbf24' : '#f87171';
  }

  function fpsLoop(now) {
    _frameCount++;
    if (now - _lastFrame >= 1000) {
      _fpsValue  = _frameCount;
      _frameCount = 0;
      _lastFrame = now;
      updateFpsEl(_fpsValue);
    }
    _fpsRafId = requestAnimationFrame(fpsLoop);
  }

  function startFpsCounter() {
    if (_fpsRafId) return;
    _lastFrame = performance.now();
    _fpsRafId  = requestAnimationFrame(fpsLoop);
  }

  function stopFpsCounter() {
    if (_fpsRafId) { cancelAnimationFrame(_fpsRafId); _fpsRafId = null; }
    if (_fpsEl) _fpsEl.style.display = 'none';
  }

  function setShowFps(val) {
    _showFps = val;
    if (val) startFpsCounter(); else stopFpsCounter();
    localStorage.setItem('eylox_show_fps', val ? '1' : '0');
  }

  /* ── FPS Limiter (requestAnimationFrame throttle wrapper) ── */
  function setFpsLimit(limit) {
    _fpsLimit = limit || 60;
    localStorage.setItem('eylox_fps_limit', _fpsLimit);
  }

  /* Returns a throttled rAF callback for games to use */
  function limitedRAF(callback) {
    let last = 0;
    const interval = 1000 / _fpsLimit;
    function tick(now) {
      requestAnimationFrame(tick);
      if (now - last < interval - 1) return;
      last = now;
      callback(now);
    }
    requestAnimationFrame(tick);
  }
  window.EyloxLimitedRAF = limitedRAF;

  /* ── Canvas quality helpers ── */
  function setupCanvas(canvas, ctx) {
    const ratio = _quality === 'low' ? 1 : (window.devicePixelRatio || 1);
    const w = canvas.clientWidth  * ratio;
    const h = canvas.clientHeight * ratio;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      ctx.scale(ratio, ratio);
    }
  }
  window.EyloxCanvasSetup = setupCanvas;

  /* ── Load saved settings ── */
  function loadSettings() {
    const q  = localStorage.getItem('eylox_graphics_quality') || null;
    const fp = localStorage.getItem('eylox_show_fps')    === '1';
    const fl = parseInt(localStorage.getItem('eylox_fps_limit') || '60', 10);
    _fpsLimit = fl;
    _showFps  = fp;
    if (fp) startFpsCounter();
    if (q) applyQuality(q);
    /* else auto-detect will run when benchmark completes */
  }

  /* ── Expose API ── */
  window.EyloxGraphics = {
    applyQuality,
    autoDetect,
    setShowFps,
    setFpsLimit,
    getFps: () => _fpsValue,
    getQuality: () => _quality,
    _current: _quality,
    presets: Object.keys(PRESETS),
  };

  document.addEventListener('DOMContentLoaded', loadSettings);

  /* Listen for settings changes from settings.html */
  window.addEventListener('storage', e => {
    if (e.key === 'eylox_graphics_quality' && e.newValue) applyQuality(e.newValue);
    if (e.key === 'eylox_show_fps')          setShowFps(e.newValue === '1');
    if (e.key === 'eylox_fps_limit' && e.newValue) setFpsLimit(parseInt(e.newValue, 10));
  });

  /* Listen for settings panel quality buttons */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.gfx-quality-btn, [data-quality]');
    if (btn?.dataset.quality) applyQuality(btn.dataset.quality);
  });

})();
