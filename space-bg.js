/* ============================================================
   EYLOX — space-bg.js
   Clean dark purple space · Glowing stars · Shooting stars
   ============================================================ */
(function SpaceBg() {
  'use strict';

  function boot() {
    if (document.getElementById('eylox-space-bg')) return;
    run();
  }

  if (document.body) { boot(); }
  else { document.addEventListener('DOMContentLoaded', boot); }

  function run() {

    /* ─── Canvas ─────────────────────────────────────────── */
    const cvs = document.createElement('canvas');
    cvs.id = 'eylox-space-bg';
    cvs.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:block';
    document.body.insertBefore(cvs, document.body.firstChild);
    const ctx = cvs.getContext('2d');

    let W = 0, H = 0;
    const TAU = Math.PI * 2;
    const rnd = (a, b) => a + Math.random() * (b - a);

    let stars = [], shooters = [];

    /* ─── Build scene ────────────────────────────────────── */
    function buildScene() {
      W = cvs.width  = window.innerWidth;
      H = cvs.height = window.innerHeight;

      stars = Array.from({ length: 260 }, () => {
        const r    = rnd(0.8, 3.0);
        const base = rnd(0.55, 1.0);
        const col  = Math.random() < 0.12 ? '#c4b5fd'   /* purple  */
                   : Math.random() < 0.08 ? '#bfdbfe'   /* blue    */
                   : '#ffffff';                          /* white   */
        return {
          x: rnd(0, W), y: rnd(0, H), r, col,
          a: base, base,
          da: rnd(0.003, 0.012) * (Math.random() < 0.5 ? 1 : -1),
          glow: r > 1.8,   /* larger stars get a glow halo */
        };
      });

      shooters = Array.from({ length: 8 }, () => ({ active: false }));
    }

    /* ─── Draw purple gradient background ───────────────── */
    function drawBg() {
      const g = ctx.createRadialGradient(
        W * 0.50, H * 0.38, 0,
        W * 0.50, H * 0.50, Math.max(W, H) * 0.82
      );
      g.addColorStop(0,    '#4a0fbf');  /* vivid purple center   */
      g.addColorStop(0.30, '#3407a0');  /* mid-purple            */
      g.addColorStop(0.60, '#1d0568');  /* deep purple           */
      g.addColorStop(0.85, '#110340');  /* near indigo-black     */
      g.addColorStop(1,    '#07011e');  /* darkest edge          */
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    /* ─── Draw glowing stars ────────────────────────────── */
    function drawStars() {
      stars.forEach(s => {
        /* Twinkle */
        s.a += s.da;
        if (s.a >= s.base || s.a <= s.base * 0.38) s.da *= -1;
        s.a = Math.max(s.base * 0.38, Math.min(s.base, s.a));

        ctx.save();
        /* Glow halo on larger stars */
        if (s.glow) {
          ctx.shadowBlur  = s.r * 7;
          ctx.shadowColor = s.col;
        }
        ctx.globalAlpha = s.a;
        ctx.fillStyle   = s.col;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();

        /* 4-point cross flare on the biggest, brightest stars */
        if (s.r > 2.2 && s.a > 0.72) {
          ctx.globalAlpha = s.a * 0.35;
          ctx.strokeStyle = s.col;
          ctx.lineWidth   = 0.9;
          ctx.shadowBlur  = s.r * 5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3.5, s.y); ctx.lineTo(s.x + s.r * 3.5, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3.5); ctx.lineTo(s.x, s.y + s.r * 3.5);
          ctx.stroke();
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }

    /* ─── Shooting stars ─────────────────────────────────── */
    function drawShooters() {
      if (Math.random() < 0.0018) {
        const s = shooters.find(s => !s.active);
        if (s) Object.assign(s, {
          active: true,
          x:    rnd(0, W * 1.2),
          y:    rnd(-30, H * 0.45),
          vx:   rnd(-10, -3),
          vy:   rnd(2.5, 6),
          len:  rnd(70, 210),
          life: 1,
        });
      }
      shooters.forEach(s => {
        if (!s.active) return;
        s.x += s.vx; s.y += s.vy;
        s.life -= 0.015;
        if (s.life <= 0 || s.x < -220 || s.y > H + 70) { s.active = false; return; }

        const ex    = s.x - s.vx * (s.len / Math.abs(s.vx));
        const ey    = s.y - s.vy * (s.len / Math.abs(s.vx));
        const trail = ctx.createLinearGradient(s.x, s.y, ex, ey);
        trail.addColorStop(0,   `rgba(255,255,255,${s.life})`);
        trail.addColorStop(0.5, `rgba(196,181,253,${s.life * 0.45})`);
        trail.addColorStop(1,   'rgba(196,181,253,0)');
        ctx.strokeStyle = trail;
        ctx.lineWidth   = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha  = s.life;
        ctx.shadowBlur   = 8;
        ctx.shadowColor  = '#c4b5fd';
        ctx.fillStyle    = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.4, 0, TAU);
        ctx.fill();
        ctx.restore();
      });
    }

    /* ─── Render loop ────────────────────────────────────── */
    let raf;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      drawBg();
      drawStars();
      drawShooters();
      raf = requestAnimationFrame(frame);
    }

    function init() {
      buildScene();
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', () => { buildScene(); });
    init();

    /* ─── Public API (kept for compatibility) ────────────── */
    window.EyloxSpaceBg = {
      setQuality() { buildScene(); },
      getQuality:  () => 'high',
      options:     ['high'],
      rebuild:     buildScene,
    };

  } /* end run() */

})();
