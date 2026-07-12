/* ============================================================
   EYLOX — polish.js  (Milestone 6 — UI/UX Polish)
   · Animated starfield background
   · Light / dark theme toggle (saved to localStorage)
   · Mobile bottom navigation
   · Scroll-to-top button
   · Confetti burst on rewards
   · Profile stat count-up animation
   · Page fade-in transition
   ============================================================ */
'use strict';

/* ── 1. PAGE FADE-IN ── */
document.documentElement.style.opacity = '0';
document.documentElement.style.transition = 'opacity .3s ease';
window.addEventListener('load', () => { document.documentElement.style.opacity = '1'; });

/* ══════════════════════════════════════════════════
   2. SOLAR SYSTEM + STARFIELD BACKGROUND
   (space-bg.js provides the enhanced version; this
   function is kept as a lightweight fallback only)
══════════════════════════════════════════════════ */
function initStars() {
  /* Defer to space-bg.js if already running */
  if (document.getElementById('eylox-space-bg')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'starsCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shootingStars = [], nebulae = [];

  /* ── Planet definitions ── */
  const PLANETS = [
    { name:'Mercury', dist:0.10, r:3,  color:'#a0a0b0', speed:4.15,  angle:Math.random()*Math.PI*2, rings:false },
    { name:'Venus',   dist:0.15, r:5,  color:'#e8c97a', speed:1.62,  angle:Math.random()*Math.PI*2, rings:false },
    { name:'Earth',   dist:0.21, r:6,  color:'#4a9eff', speed:1.00,  angle:Math.random()*Math.PI*2, rings:false, moon:true },
    { name:'Mars',    dist:0.29, r:4,  color:'#c1440e', speed:0.53,  angle:Math.random()*Math.PI*2, rings:false },
    { name:'Jupiter', dist:0.40, r:13, color:'#c88b4a', speed:0.084, angle:Math.random()*Math.PI*2, rings:false, stripes:true },
    { name:'Saturn',  dist:0.53, r:10, color:'#e4c97e', speed:0.034, angle:Math.random()*Math.PI*2, rings:true },
    { name:'Uranus',  dist:0.65, r:7,  color:'#7de8e8', speed:0.012, angle:Math.random()*Math.PI*2, rings:false },
    { name:'Neptune', dist:0.76, r:6,  color:'#3060ff', speed:0.006, angle:Math.random()*Math.PI*2, rings:false },
  ];

  function buildScene() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    /* Background stars */
    stars = Array.from({ length: 220 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.6 + 0.3,
      a:  Math.random(),
      da: (Math.random() * 0.006 + 0.001) * (Math.random() < .5 ? 1 : -1),
    }));

    /* Nebula blobs */
    nebulae = [
      { x: W * 0.15, y: H * 0.2,  r: W * 0.18, hue:260 },
      { x: W * 0.85, y: H * 0.75, r: W * 0.14, hue:220 },
      { x: W * 0.55, y: H * 0.15, r: W * 0.12, hue:200 },
    ];
  }

  /* Center of solar system — slight offset for aesthetics */
  function sunXY() {
    return { sx: W * 0.5, sy: H * 0.5 };
  }

  let t = 0;
  function tick() {
    t += 0.008;
    ctx.clearRect(0, 0, W, H);

    /* Deep space gradient */
    const grad = ctx.createRadialGradient(W*.5,H*.5,0, W*.5,H*.5,Math.max(W,H)*.75);
    grad.addColorStop(0,   'rgba(10,5,30,0)');
    grad.addColorStop(0.5, 'rgba(5,2,18,.55)');
    grad.addColorStop(1,   'rgba(2,0,10,.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    /* Nebula */
    for (const nb of nebulae) {
      const ng = ctx.createRadialGradient(nb.x,nb.y,0, nb.x,nb.y,nb.r);
      ng.addColorStop(0,   `hsla(${nb.hue},80%,55%,.05)`);
      ng.addColorStop(0.5, `hsla(${nb.hue},70%,45%,.03)`);
      ng.addColorStop(1,   'transparent');
      ctx.fillStyle = ng;
      ctx.fillRect(0,0,W,H);
    }

    /* Twinkling stars */
    for (const s of stars) {
      s.a = Math.max(0.06, Math.min(1, s.a + s.da));
      if (s.a <= 0.06 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(210,200,255,${s.a * 0.7})`;
      ctx.fill();
    }

    /* Shooting stars (random chance) */
    if (Math.random() < 0.003) {
      shootingStars.push({ x: Math.random()*W, y: Math.random()*H*0.5, vx:8+Math.random()*6, vy:3+Math.random()*4, life:1 });
    }
    for (let i = shootingStars.length-1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.03;
      if (ss.life <= 0 || ss.x > W || ss.y > H) { shootingStars.splice(i,1); continue; }
      ctx.save();
      ctx.globalAlpha = ss.life * 0.8;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.vx*6, ss.y - ss.vy*6);
      ctx.stroke();
      ctx.restore();
    }

    const { sx, sy } = sunXY();
    const maxOrbit = Math.min(W, H) * 0.48;

    /* Orbit rings */
    ctx.save();
    for (const p of PLANETS) {
      const orb = maxOrbit * p.dist;
      ctx.beginPath();
      ctx.arc(sx, sy, orb, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(167,139,250,.07)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();

    /* Sun */
    const sunR = Math.min(W,H) * 0.038;
    /* Corona glow layers */
    for (let i = 4; i >= 1; i--) {
      const cg = ctx.createRadialGradient(sx,sy,sunR*0.5, sx,sy,sunR*(1.5+i*0.8));
      cg.addColorStop(0, `rgba(255,200,60,${0.06/i})`);
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(sx, sy, sunR*(1.5+i*0.8), 0, Math.PI*2);
      ctx.fill();
    }
    /* Sun body */
    const sunG = ctx.createRadialGradient(sx-sunR*.3,sy-sunR*.3,0, sx,sy,sunR);
    sunG.addColorStop(0,   '#fff7e0');
    sunG.addColorStop(0.3, '#ffe066');
    sunG.addColorStop(0.7, '#ff9f20');
    sunG.addColorStop(1,   '#c84000');
    ctx.beginPath();
    ctx.arc(sx, sy, sunR, 0, Math.PI*2);
    ctx.fillStyle = sunG;
    ctx.fill();

    /* Animated sun surface spots */
    ctx.save();
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      const sa = t * (0.3 + i * 0.1) + i * 1.2;
      const sdist = sunR * (0.2 + i * 0.12);
      const spx = sx + Math.cos(sa) * sdist;
      const spy = sy + Math.sin(sa) * sdist;
      ctx.beginPath();
      ctx.arc(spx, spy, sunR*0.06, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(150,40,0,.35)';
      ctx.fill();
    }
    ctx.restore();

    /* Planets */
    for (const p of PLANETS) {
      p.angle += p.speed * 0.001;
      const orb = maxOrbit * p.dist;
      const px = sx + Math.cos(p.angle) * orb;
      const py = sy + Math.sin(p.angle) * orb;

      /* Saturn rings (behind planet) */
      if (p.rings) {
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, 0.3);
        for (let ri = 0; ri < 3; ri++) {
          const rr = p.r * (1.6 + ri * 0.5);
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(228,201,126,${0.35 - ri*0.08})`;
          ctx.lineWidth = p.r * 0.55;
          ctx.stroke();
        }
        ctx.restore();
      }

      /* Planet body */
      const pg = ctx.createRadialGradient(px - p.r*0.35, py - p.r*0.35, 0, px, py, p.r);
      pg.addColorStop(0, lighten(p.color, 60));
      pg.addColorStop(0.5, p.color);
      pg.addColorStop(1, darken(p.color, 60));
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI*2);
      ctx.fillStyle = pg;
      ctx.fill();

      /* Jupiter cloud stripes */
      if (p.stripes) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI*2);
        ctx.clip();
        for (let si = -2; si <= 2; si++) {
          ctx.fillStyle = si%2===0 ? 'rgba(180,120,60,.3)' : 'rgba(220,160,90,.18)';
          ctx.fillRect(px - p.r, py + si * p.r*0.35 - p.r*0.17, p.r*2, p.r*0.32);
        }
        ctx.restore();
      }

      /* Earth moon */
      if (p.moon) {
        const ma = p.angle * 13;
        const md = p.r * 2.4;
        const mx = px + Math.cos(ma) * md;
        const my = py + Math.sin(ma) * md;
        ctx.beginPath();
        ctx.arc(mx, my, p.r * 0.32, 0, Math.PI*2);
        ctx.fillStyle = '#c8c8d8';
        ctx.fill();
      }
    }

    requestAnimationFrame(tick);
  }

  function lighten(hex, amt) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255,(n>>16)+amt), g = Math.min(255,((n>>8)&0xff)+amt), b = Math.min(255,(n&0xff)+amt);
    return `rgb(${r},${g},${b})`;
  }
  function darken(hex, amt) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0,(n>>16)-amt), g = Math.max(0,((n>>8)&0xff)-amt), b = Math.max(0,(n&0xff)-amt);
    return `rgb(${r},${g},${b})`;
  }

  buildScene();
  window.addEventListener('resize', buildScene);
  tick();
}

/* ══════════════════════════════════════════════════
   3. THEME APPLY (no toggle button)
══════════════════════════════════════════════════ */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function initThemeToggle() {
  const saved = localStorage.getItem('eylox_theme') || 'dark';
  applyTheme(saved);
  /* Theme toggle button removed — theme is controlled via Settings */
  const _unused = () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    btn.textContent = next === 'light' ? '🌙' : '☀️';
    localStorage.setItem('eylox_theme', next);
  };
}

/* ══════════════════════════════════════════════════
   4. MOBILE BOTTOM NAVIGATION
══════════════════════════════════════════════════ */
function initBottomNav() {
  const page = document.body.dataset.page || '';
  const links = [
    { href: 'index.html',   icon: '🏠', label: 'Home',    key: 'home' },
    { href: 'games.html',   icon: '🔭', label: 'Games',   key: 'games' },
    { href: 'friends.html', icon: '🤝', label: 'Friends', key: 'friends' },
    { href: 'profile.html', icon: '👤', label: 'Profile', key: 'profile' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Mobile navigation');
  nav.innerHTML = links.map(l => `
    <a href="${l.href}" class="bn-item${page === l.key ? ' active' : ''}">
      <span class="bn-icon">${l.icon}</span>
      <span class="bn-label">${l.label}</span>
    </a>`).join('');
  document.body.appendChild(nav);
}

/* ══════════════════════════════════════════════════
   5. SCROLL-TO-TOP BUTTON
══════════════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 320);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════════
   6. CONFETTI BURST
══════════════════════════════════════════════════ */
window.confetti = function (originX, originY) {
  try { const s = JSON.parse(localStorage.getItem('eylox_settings')||'{}'); if (s.confettiEnabled === false) return; } catch {}

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx    = canvas.getContext('2d');
  const colors = ['#a78bfa', '#f472b6', '#4ade80', '#fde68a', '#4fc3f7', '#fb923c', '#2dd4bf'];
  const cx = originX ?? canvas.width  * 0.7;
  const cy = originY ?? canvas.height * 0.12;

  const bits = Array.from({ length: 90 }, () => ({
    x: cx, y: cy,
    vx:  (Math.random() - .5) * 16,
    vy:  (Math.random() - 1.2) * 14,
    r:   Math.random() * 5 + 3,
    rot: Math.random() * 360,
    drot:(Math.random() - .5) * 14,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
  }));

  let t0 = null;
  (function draw(ts) {
    if (!t0) t0 = ts;
    const elapsed = ts - t0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const b of bits) {
      b.x   += b.vx;  b.y   += b.vy;
      b.vy  += 0.45;  b.vx  *= 0.98;
      b.rot += b.drot;
      b.life = Math.max(0, 1 - elapsed / 1800);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot * Math.PI / 180);
      ctx.globalAlpha = b.life;
      ctx.fillStyle   = b.color;
      ctx.fillRect(-b.r, -b.r * .45, b.r * 2, b.r);
      ctx.restore();
    }

    if (elapsed < 2000) requestAnimationFrame(draw);
    else canvas.remove();
  })(performance.now());
};

/* ══════════════════════════════════════════════════
   7. PROFILE STAT COUNT-UP
══════════════════════════════════════════════════ */
function animateStat(el) {
  const raw    = el.textContent.trim();
  const numStr = raw.replace(/,/g, '');
  if (raw === '—' || isNaN(parseFloat(numStr))) return;

  const target = parseFloat(numStr);
  const t0 = performance.now(), dur = 950;
  (function tick(now) {
    const p    = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  })(t0);
}

function initStatCounters() {
  const els = document.querySelectorAll('.ps-num');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      animateStat(e.target);
    });
  }, { threshold: .5 });
  els.forEach(el => obs.observe(el));
}

/* Watch for features.js to populate stat values on profile */
function watchProfileStats() {
  const targets = document.querySelectorAll('.ps-num');
  if (!targets.length) return;

  const mo = new MutationObserver(() => {
    // Small delay so all stats settle before animating
    clearTimeout(mo._tid);
    mo._tid = setTimeout(initStatCounters, 80);
  });
  targets.forEach(el => mo.observe(el, { childList: true, characterData: true, subtree: true }));
}

/* ══════════════════════════════════════════════════
   8. PATCH showToast — fire confetti on coins
══════════════════════════════════════════════════ */
function patchToast() {
  const _orig = window.showToast;
  if (typeof _orig !== 'function') return;

  window.showToast = function (msg, type = 'purple') {
    _orig(msg, type);
    if (type === 'green' && msg.includes('💰')) {
      const coin = document.querySelector('.tb-coins');
      const rect = coin?.getBoundingClientRect();
      confetti(rect ? rect.left + rect.width / 2 : undefined,
               rect ? rect.top  + rect.height / 2 : undefined);
    }
  };
}

/* ══════════════════════════════════════════════════
   9. GAME CARD GLOW ON HOVER (canvas-free version)
   Adds a subtle animated border glow via CSS class
══════════════════════════════════════════════════ */
function initCardTilt() {
  document.addEventListener('mousemove', e => {
    try { const s = JSON.parse(localStorage.getItem('eylox_settings')||'{}'); if (s.cardTiltEnabled === false) return; } catch {}
    const card = e.target.closest('.game-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx   = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy   = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-7px) scale(1.02) rotateX(${cy * -6}deg) rotateY(${cx * 6}deg)`;
    card.style.transition = 'transform .08s, box-shadow .25s, border-color .25s';
  });
  document.addEventListener('mouseleave', e => {
    const card = e.target && typeof e.target.closest === 'function' ? e.target.closest('.game-card') : null;
    if (card) {
      card.style.transform = '';
      card.style.transition = 'transform .3s, box-shadow .25s, border-color .25s';
    }
  }, true);
}

/* ══════════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initThemeToggle();
  initBottomNav();
  initScrollTop();
  patchToast();
  initCardTilt();

  if (document.body.dataset.page === 'profile') {
    watchProfileStats();
  }

  /* Topbar shadow on scroll */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
});
