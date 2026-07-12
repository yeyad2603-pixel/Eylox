/* ============================================================
   EYLOX — World Engine v1.0
   - Real-time day/night cycle synced to local clock
   - Dynamic weather: Clear / Cloudy / Rain / Storm / Snow / Fog
   - Seasonal awareness (summer/autumn/winter/spring)
   - Sky gradient shifts, ambient particles, weather sounds
   - Procedural city/terrain visual overlay for hub pages
   ============================================================ */
'use strict';

(function EyloxWorldEngine() {

  /* ── Time helpers ── */
  function timeOfDay() {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    if (h < 5.5)  return 'night';
    if (h < 7)    return 'dawn';
    if (h < 12)   return 'morning';
    if (h < 14)   return 'noon';
    if (h < 17)   return 'afternoon';
    if (h < 20)   return 'evening';
    if (h < 22)   return 'dusk';
    return 'night';
  }

  function season() {
    const m = new Date().getMonth(); // 0-11
    if (m < 3)  return 'winter';
    if (m < 6)  return 'spring';
    if (m < 9)  return 'summer';
    return 'autumn';
  }

  /* ── Sky colour palettes ── */
  const SKY = {
    night:     { top:'#020215', mid:'#04051e', horizon:'#0a0525', star:1.0 },
    dawn:      { top:'#0d0830', mid:'#4a1942', horizon:'#c05035', star:.3 },
    morning:   { top:'#1a3a6b', mid:'#2d6bcd', horizon:'#f8c261', star:0 },
    noon:      { top:'#0e2a5c', mid:'#1a4fa8', horizon:'#4a8fd4', star:0 },
    afternoon: { top:'#0f2550', mid:'#1d5499', horizon:'#6ab0e0', star:0 },
    evening:   { top:'#0d1e4a', mid:'#2a3a8a', horizon:'#e87a3a', star:.1 },
    dusk:      { top:'#0c0d2e', mid:'#1e1048', horizon:'#7a2860', star:.5 },
  };

  /* ── Weather presets ── */
  const WEATHER_CYCLE = ['clear','clear','clear','cloudy','cloudy','rain','storm','snow','fog','clear'];
  let _weather = 'clear';
  let _tod     = timeOfDay();

  function pickWeather() {
    /* Weight by season */
    const s = season();
    const pool = s === 'winter' ? ['snow','snow','cloudy','fog','clear'] :
                 s === 'spring' ? ['rain','rain','cloudy','clear','clear'] :
                 s === 'summer' ? ['clear','clear','clear','cloudy','rain'] :
                 ['cloudy','rain','fog','clear','clear'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ── CSS injection ── */
  const STYLE_ID = 'eylox-world-engine-css';
  function injectBaseCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      /* ── World sky background ── */
      #eylox-world-sky {
        position: fixed; inset: 0; z-index: -1;
        transition: background 8s ease, opacity 4s ease;
        pointer-events: none;
      }

      /* ── Weather canvas ── */
      #eylox-weather-canvas {
        position: fixed; inset: 0; z-index: 2;
        pointer-events: none; opacity: 0;
        transition: opacity 3s ease;
      }
      #eylox-weather-canvas.active { opacity: 1; }

      /* ── City skyline silhouette ── */
      #eylox-city-skyline {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 1;
        pointer-events: none; height: 220px;
        opacity: 0; transition: opacity 4s ease;
      }
      #eylox-city-skyline.visible { opacity: .55; }

      /* ── Weather HUD badge — hidden ── */
      #eylox-weather-hud { display: none !important; }
      .whud-icon { font-size: 1.1rem; }
      .whud-temp { font-size: .68rem; color: rgba(167,139,250,.5); }

      /* ── Rain overlay ── */
      @keyframes rain-fall { from{transform:translateY(-10px) scaleY(.8)} to{transform:translateY(100vh) scaleY(1)} }
      .rain-drop {
        position: absolute; width: 1.5px; border-radius: 99px;
        background: linear-gradient(to bottom, transparent, rgba(147,197,253,.6));
        animation: rain-fall linear infinite;
        pointer-events: none;
      }

      /* ── Snow overlay ── */
      @keyframes snow-fall { 0%{transform:translateY(-20px) translateX(0);opacity:1} 100%{transform:translateY(100vh) translateX(40px);opacity:.3} }
      .snow-flake {
        position: absolute; border-radius: 50%;
        background: rgba(255,255,255,.85);
        animation: snow-fall ease-in infinite;
        pointer-events: none;
      }

      /* ── Lightning flash ── */
      @keyframes lightning { 0%,95%,100%{opacity:0}96%,98%{opacity:.4}97%,99%{opacity:0} }
      #eylox-lightning {
        position: fixed; inset: 0; z-index: 3;
        background: rgba(200,220,255,.6);
        pointer-events: none; opacity: 0;
      }
      #eylox-lightning.storm { animation: lightning 4s ease-in-out infinite; }

      /* ── Fog overlay ── */
      #eylox-fog {
        position: fixed; inset: 0; z-index: 2;
        background: radial-gradient(ellipse at 50% 100%, rgba(180,190,210,.15) 0%, transparent 70%);
        pointer-events: none; opacity: 0; transition: opacity 4s ease;
      }
      #eylox-fog.active { opacity: 1; }

      /* ── Day/night indicator on sidebar ── */
      .tod-indicator { font-size: .68rem; color: rgba(167,139,250,.45); display: flex; align-items: center; gap: 4px; padding: 0 8px 8px; }

      /* ── Season badge ── */
      .season-badge { font-size: .62rem; font-weight: 900; padding: 2px 8px; border-radius: 99px; }
      .season-winter { background: rgba(147,197,253,.12); color: #93c5fd; }
      .season-spring { background: rgba(134,239,172,.12); color: #86efac; }
      .season-summer { background: rgba(253,224,71,.12);  color: #fde047; }
      .season-autumn { background: rgba(251,146,60,.12);  color: #fb923c; }
    `;
    document.head.appendChild(s);
  }

  /* ── Build sky gradient ── */
  function buildSkyGradient(sky) {
    return `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 55%, ${sky.horizon} 100%)`;
  }

  /* ── Apply sky ── */
  function applyTOD(tod) {
    _tod = tod;
    const sky    = SKY[tod] || SKY.night;
    let   skyEl  = document.getElementById('eylox-world-sky');
    if (!skyEl) {
      skyEl = document.createElement('div');
      skyEl.id = 'eylox-world-sky';
      document.body.insertAdjacentElement('afterbegin', skyEl);
    }
    skyEl.style.background = buildSkyGradient(sky);

    /* Stars at night */
    let starsEl = document.getElementById('eylox-world-stars');
    if (!starsEl && sky.star > 0) {
      starsEl = document.createElement('canvas');
      starsEl.id = 'eylox-world-stars';
      starsEl.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
      starsEl.width  = window.innerWidth;
      starsEl.height = window.innerHeight;
      document.body.insertAdjacentElement('afterbegin', starsEl);
      const ctx = starsEl.getContext('2d');
      for (let i = 0; i < 200; i++) {
        const x  = Math.random() * starsEl.width;
        const y  = Math.random() * starsEl.height * 0.7;
        const r  = Math.random() * 1.2;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.1})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (starsEl) starsEl.style.opacity = sky.star.toFixed(2);
  }

  /* ── Weather particle system ── */
  let _weatherCanvas = null;
  let _weatherCtx    = null;
  let _weatherRaf    = null;
  let _particles     = [];

  function initWeatherCanvas() {
    if (_weatherCanvas) return;
    _weatherCanvas = document.createElement('canvas');
    _weatherCanvas.id = 'eylox-weather-canvas';
    _weatherCanvas.width  = window.innerWidth;
    _weatherCanvas.height = window.innerHeight;
    document.body.appendChild(_weatherCanvas);
    _weatherCtx = _weatherCanvas.getContext('2d');
    window.addEventListener('resize', () => {
      _weatherCanvas.width  = window.innerWidth;
      _weatherCanvas.height = window.innerHeight;
    });
  }

  function spawnParticles(type) {
    _particles = [];
    const count = type === 'rain' ? 250 : type === 'storm' ? 400 : type === 'snow' ? 120 : 0;
    for (let i = 0; i < count; i++) {
      if (type === 'rain' || type === 'storm') {
        _particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: type === 'storm' ? -1.5 - Math.random() * 2 : -0.3,
          vy: 10 + Math.random() * 6 + (type === 'storm' ? 4 : 0),
          len: 12 + Math.random() * 12,
          opacity: 0.3 + Math.random() * 0.4,
        });
      } else if (type === 'snow') {
        _particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 1.5 + Math.random() * 2.5,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.5 + Math.random() * 1.5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.04,
          opacity: 0.5 + Math.random() * 0.4,
        });
      }
    }
  }

  function animateWeather() {
    if (!_weatherCtx || !_weatherCanvas) return;
    _weatherCtx.clearRect(0, 0, _weatherCanvas.width, _weatherCanvas.height);
    const W = _weatherCanvas.width, H = _weatherCanvas.height;

    _particles.forEach(p => {
      if (_weather === 'rain' || _weather === 'storm') {
        _weatherCtx.strokeStyle = `rgba(147,197,253,${p.opacity})`;
        _weatherCtx.lineWidth   = 1.2;
        _weatherCtx.beginPath();
        _weatherCtx.moveTo(p.x, p.y);
        _weatherCtx.lineTo(p.x + p.vx * 3, p.y + p.len);
        _weatherCtx.stroke();
        p.x += p.vx; p.y += p.vy;
        if (p.y > H) { p.y = -20; p.x = Math.random() * W; }
      } else if (_weather === 'snow') {
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.5 + p.vx;
        p.y += p.vy;
        _weatherCtx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        _weatherCtx.beginPath();
        _weatherCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        _weatherCtx.fill();
        if (p.y > H) { p.y = -10; p.x = Math.random() * W; }
      }
    });
    _weatherRaf = requestAnimationFrame(animateWeather);
  }

  /* ── Apply weather ── */
  function applyWeather(type) {
    _weather = type;
    initWeatherCanvas();

    /* Cancel previous animation */
    if (_weatherRaf) { cancelAnimationFrame(_weatherRaf); _weatherRaf = null; }
    _weatherCanvas.classList.remove('active');

    /* Lightning */
    let lightEl = document.getElementById('eylox-lightning');
    if (!lightEl) { lightEl = document.createElement('div'); lightEl.id = 'eylox-lightning'; document.body.appendChild(lightEl); }
    lightEl.className = type === 'storm' ? 'storm' : '';

    /* Fog */
    let fogEl = document.getElementById('eylox-fog');
    if (!fogEl) { fogEl = document.createElement('div'); fogEl.id = 'eylox-fog'; document.body.appendChild(fogEl); }
    fogEl.classList.toggle('active', type === 'fog' || type === 'storm');

    /* Spawn particles */
    if (type === 'rain' || type === 'storm' || type === 'snow') {
      spawnParticles(type);
      _weatherCanvas.classList.add('active');
      animateWeather();
    }

    /* Update HUD */
    updateHUD(type);
    /* Save */
    localStorage.setItem('eylox_weather', type);
  }

  /* ── Weather HUD ── */
  const WEATHER_META = {
    clear:  { icon:'☀️', label:'Clear',  temp:() => 18 + Math.floor(Math.random()*8) },
    cloudy: { icon:'☁️', label:'Cloudy', temp:() => 14 + Math.floor(Math.random()*6) },
    rain:   { icon:'🌧️', label:'Rain',  temp:() => 10 + Math.floor(Math.random()*5) },
    storm:  { icon:'⛈️', label:'Storm', temp:() => 8  + Math.floor(Math.random()*4) },
    snow:   { icon:'❄️', label:'Snow',  temp:() => -2 + Math.floor(Math.random()*5) },
    fog:    { icon:'🌫️', label:'Fog',   temp:() => 9  + Math.floor(Math.random()*4) },
  };
  const TOD_ICONS = { night:'🌙', dawn:'🌅', morning:'☀️', noon:'🔆', afternoon:'🌤️', evening:'🌆', dusk:'🌇' };

  function updateHUD(weather) {
    let hud = document.getElementById('eylox-weather-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'eylox-weather-hud';
      document.body.appendChild(hud);
    }
    const meta = WEATHER_META[weather] || WEATHER_META.clear;
    const temp = meta.temp();
    hud.innerHTML = `
      <span class="whud-icon">${meta.icon}</span>
      <div>
        <div>${meta.label} · ${TOD_ICONS[_tod] || '🌙'} ${_tod.charAt(0).toUpperCase() + _tod.slice(1)}</div>
        <div class="whud-temp">${temp}°C · ${season().charAt(0).toUpperCase() + season().slice(1)}</div>
      </div>
    `;
    hud.title = `Weather: ${meta.label} | Time: ${_tod} | Season: ${season()}`;
  }

  /* ── City skyline SVG generator ── */
  function buildCitySkyline() {
    if (document.getElementById('eylox-city-skyline')) return;
    const W = window.innerWidth, H = 220;
    const buildings = [];
    let x = 0;
    while (x < W + 60) {
      const w = 30 + Math.random() * 70;
      const h = 60 + Math.random() * 160;
      buildings.push({ x, w, h });
      x += w - 4;
    }
    const paths = buildings.map(b =>
      `<rect x="${b.x}" y="${H - b.h}" width="${b.w - 2}" height="${b.h}" />`
    ).join('');
    /* Windows */
    const windows = buildings.flatMap(b => {
      const rows = Math.floor(b.h / 18), cols = Math.floor(b.w / 14);
      const res = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.55) res.push(`<rect x="${b.x + 4 + c * 14}" y="${H - b.h + 8 + r * 18}" width="6" height="8" fill="rgba(255,240,180,0.6)" />`);
      }
      return res;
    }).join('');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%'); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `<g fill="rgba(10,5,30,0.8)">${paths}</g>${windows}`;
    const container = document.createElement('div');
    container.id = 'eylox-city-skyline';
    container.appendChild(svg);
    document.body.appendChild(container);
    setTimeout(() => container.classList.add('visible'), 1000);
  }

  /* ── Seasonal colour tint on body ── */
  function applySeasonTint() {
    const tints = {
      winter: 'rgba(147,197,253,.04)',
      spring: 'rgba(134,239,172,.04)',
      summer: 'rgba(253,224,71,.03)',
      autumn: 'rgba(251,146,60,.05)',
    };
    const tint = tints[season()] || '';
    document.documentElement.style.setProperty('--season-tint', tint);
  }

  /* ── World status API ── */
  function getWorldStatus() {
    return {
      time: _tod,
      weather: _weather,
      season: season(),
      hour: new Date().getHours(),
    };
  }

  /* ── Expose weather control for admin ── */
  window.EyloxWorld = {
    setWeather: applyWeather,
    setTOD:     applyTOD,
    getStatus:  getWorldStatus,
    WEATHERS:   Object.keys(WEATHER_META),
  };

  /* ── Auto-update loop ── */
  function tick() {
    const tod = timeOfDay();
    if (tod !== _tod) applyTOD(tod);
  }

  /* ── Startup ── */
  document.addEventListener('DOMContentLoaded', () => {
    injectBaseCSS();
    applyTOD(timeOfDay());
    applySeasonTint();

    /* Use saved weather or pick new one */
    const saved = localStorage.getItem('eylox_weather');
    const w = saved || pickWeather();
    applyWeather(w);

    /* City skyline on hub/index pages */
    const page = document.body.dataset.page || '';
    if (!page || page === 'home' || location.href.includes('index.html')) {
      setTimeout(buildCitySkyline, 1500);
    }

    /* Update TOD every 5 minutes */
    setInterval(tick, 5 * 60 * 1000);

    /* Rotate weather every 20 minutes */
    setInterval(() => applyWeather(pickWeather()), 20 * 60 * 1000);

    console.log(`[EyloxWorld] ${timeOfDay()} / ${pickWeather()} / ${season()}`);
  });

})();
