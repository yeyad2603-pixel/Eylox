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
   2. ANIMATED STARFIELD
══════════════════════════════════════════════════ */
function initStars() {
  const canvas = document.createElement('canvas');
  canvas.id = 'starsCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let stars = [];

  function buildStars() {
    stars = Array.from({ length: 130 }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      r:   Math.random() * 1.5 + 0.2,
      a:   Math.random(),
      da:  (Math.random() * 0.005 + 0.001) * (Math.random() < .5 ? 1 : -1),
      spd: Math.random() * 0.18 + 0.04,
    }));
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  let raf;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isLight = document.documentElement.dataset.theme === 'light';
    const baseAlpha = isLight ? 0.18 : 0.65;

    for (const s of stars) {
      s.a  = Math.max(0.05, Math.min(1, s.a + s.da));
      if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
      s.y  = (s.y + s.spd) % canvas.height;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `rgba(130,80,220,${s.a * baseAlpha})`
        : `rgba(210,190,255,${s.a * baseAlpha})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  tick();
}

/* ══════════════════════════════════════════════════
   3. LIGHT / DARK THEME TOGGLE
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

  const topbarRight = document.querySelector('.topbar-right');
  if (!topbarRight) return;

  const btn = document.createElement('button');
  btn.id = 'themeToggleBtn';
  btn.className = 'tb-btn';
  btn.setAttribute('aria-label', 'Toggle light/dark theme');
  btn.title = 'Toggle theme';
  btn.textContent = saved === 'light' ? '🌙' : '☀️';
  topbarRight.insertBefore(btn, topbarRight.firstChild);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    btn.textContent = next === 'light' ? '🌙' : '☀️';
    localStorage.setItem('eylox_theme', next);
  });
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
    const card = e.target?.closest?.('.game-card');
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
