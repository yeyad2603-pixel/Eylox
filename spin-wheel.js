/* ============================================================
   EYLOX — Spin Wheel  (Daily free spin for Eylux)
   Requires: #spinCanvas, #spinBtn, #spinCooldown in DOM
   ============================================================ */
'use strict';

(function EyloxSpinWheel() {
  // Don't init if inline spin wheel already handled this (index.html)
  if (window._spinWheelInit) return;
  window._spinWheelInit = true;

  const SPIN_KEY     = 'eylox_spin';
  const MS_PER_DAY   = 86400000;

  const SLICES = [
    { label: '50 💰',   coins: 50,   color: '#7c3aed' },
    { label: '100 💰',  coins: 100,  color: '#a855f7' },
    { label: '25 💰',   coins: 25,   color: '#6d28d9' },
    { label: '200 💰',  coins: 200,  color: '#f59e0b' },
    { label: 'Try Again', coins: 0,  color: '#374151' },
    { label: '75 💰',   coins: 75,   color: '#8b5cf6' },
    { label: '500 💰',  coins: 500,  color: '#ec4899' },
    { label: '10 💰',   coins: 10,   color: '#4c1d95' },
    { label: '150 💰',  coins: 150,  color: '#9333ea' },
    { label: '1000 💰', coins: 1000, color: '#fbbf24' },
    { label: '30 💰',   coins: 30,   color: '#5b21b6' },
    { label: '250 💰',  coins: 250,  color: '#db2777' },
  ];

  const N    = SLICES.length;
  const STEP = (Math.PI * 2) / N;

  let spinning    = false;
  let currentAngle = 0;
  let rafId        = null;

  /* ── Load state ── */
  function loadState() {
    try { return JSON.parse(localStorage.getItem(SPIN_KEY) || '{}'); } catch { return {}; }
  }
  function canSpin() {
    const s = loadState();
    if (!s.lastSpin) return true;
    return Date.now() - s.lastSpin >= MS_PER_DAY;
  }
  function msTillNext() {
    const s = loadState();
    if (!s.lastSpin) return 0;
    return Math.max(0, MS_PER_DAY - (Date.now() - s.lastSpin));
  }

  /* ── Draw the wheel ── */
  function drawWheel(canvas, angle) {
    const c    = canvas.getContext('2d');
    const size = canvas.width;
    const cx   = size / 2;
    const cy   = size / 2;
    const r    = size / 2 - 3;

    c.clearRect(0, 0, size, size);

    for (let i = 0; i < N; i++) {
      const start = angle + i * STEP;
      const end   = start + STEP;
      const s     = SLICES[i];

      c.beginPath();
      c.moveTo(cx, cy);
      c.arc(cx, cy, r, start, end);
      c.closePath();
      c.fillStyle = s.color;
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,.12)';
      c.lineWidth = 1.5;
      c.stroke();

      // Label
      c.save();
      c.translate(cx, cy);
      c.rotate(start + STEP / 2);
      c.textAlign = 'right';
      c.textBaseline = 'middle';
      c.fillStyle = '#fff';
      c.font = `bold ${Math.max(7, Math.floor(size / 20))}px Nunito,sans-serif`;
      c.fillText(s.label, r - 4, 0);
      c.restore();
    }

    // Center cap
    c.beginPath();
    c.arc(cx, cy, size * 0.08, 0, Math.PI * 2);
    c.fillStyle = '#1a0050';
    c.fill();
    c.strokeStyle = '#a78bfa';
    c.lineWidth = 2;
    c.stroke();

    // Pointer (triangle at top)
    c.fillStyle = '#fde68a';
    c.beginPath();
    c.moveTo(cx, 0);
    c.lineTo(cx - 7, 14);
    c.lineTo(cx + 7, 14);
    c.closePath();
    c.fill();
  }

  /* ── Run a spin animation ── */
  function runSpin(canvas, targetSlice) {
    const fullRotations = 5 + Math.floor(Math.random() * 4); // 5–8 full spins
    const landingAngle  = -(targetSlice * STEP + STEP / 2); // land this slice at top
    const totalAngle    = fullRotations * Math.PI * 2 + landingAngle - (currentAngle % (Math.PI * 2));

    const duration = 3000 + Math.random() * 1500;
    const startT   = performance.now();
    const startAng = currentAngle;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      const elapsed = now - startT;
      const t       = Math.min(elapsed / duration, 1);
      currentAngle  = startAng + totalAngle * easeOut(t);
      drawWheel(canvas, currentAngle);
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        spinning = false;
        onSpinEnd(canvas, targetSlice);
      }
    }
    requestAnimationFrame(frame);
  }

  function onSpinEnd(canvas, targetSlice) {
    const s = SLICES[targetSlice];
    spinning = false;

    // Record
    localStorage.setItem(SPIN_KEY, JSON.stringify({ lastSpin: Date.now(), lastCoins: s.coins }));

    // Award coins
    if (s.coins > 0) {
      try {
        const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
        if (u) {
          u.coins = Math.min((u.coins || 0) + s.coins, 1e9);
          localStorage.setItem('eylox_user', JSON.stringify(u));
          if (u.username) localStorage.setItem('eylox_userdata_' + u.username, JSON.stringify(u));
          window.EyloxCoinBurst?.(s.coins, canvas);
          window.EyloxCoinRain?.(Math.min(40, Math.floor(s.coins / 20)));
        }
      } catch {}
    }

    // Overlay message
    showResult(s, canvas);
    updateCooldown();
  }

  function showResult(slice, anchorEl) {
    if (!document.getElementById('spin-result-style')) {
      const st = document.createElement('style');
      st.id = 'spin-result-style';
      st.textContent = `
        @keyframes spin-result-in{from{opacity:0;transform:translate(-50%,-50%) scale(.5)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes spin-result-out{to{opacity:0;transform:translate(-50%,-50%) scale(.7)}}
        .spin-result-pop{position:fixed;top:50%;left:50%;z-index:99999;background:linear-gradient(135deg,#1a0050,#2d0080);border:2px solid #a78bfa;border-radius:22px;padding:28px 40px;text-align:center;box-shadow:0 0 80px rgba(167,139,250,.55);animation:spin-result-in .45s cubic-bezier(.34,1.56,.64,1) both}
      `;
      document.head.appendChild(st);
    }
    const pop = document.createElement('div');
    pop.className = 'spin-result-pop';
    pop.innerHTML = slice.coins > 0
      ? `<div style="font-size:3rem;margin-bottom:8px">🎉</div>
         <div style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:#fde68a">You won!</div>
         <div style="font-family:'Fredoka One',cursive;font-size:2.2rem;color:#a78bfa;margin:6px 0">${slice.coins.toLocaleString()} 🪙</div>
         <div style="font-size:.82rem;color:#9d8ec7;font-weight:700">Added to your balance ✓</div>
         <button onclick="this.closest('.spin-result-pop').remove()" style="margin-top:14px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);color:#a78bfa;padding:8px 22px;border-radius:99px;font-weight:800;font-size:.82rem;cursor:pointer;font-family:Nunito,sans-serif">Awesome! 🎊</button>`
      : `<div style="font-size:3rem;margin-bottom:8px">😅</div>
         <div style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:#f0e8ff">Better luck tomorrow!</div>
         <div style="font-size:.82rem;color:#9d8ec7;font-weight:700;margin-top:6px">Come back in 24 hours</div>
         <button onclick="this.closest('.spin-result-pop').remove()" style="margin-top:14px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);color:#a78bfa;padding:8px 22px;border-radius:99px;font-weight:800;font-size:.82rem;cursor:pointer;font-family:Nunito,sans-serif">OK</button>`;
    document.body.appendChild(pop);
    setTimeout(() => {
      pop.style.animation = 'spin-result-out .35s ease forwards';
      setTimeout(() => pop.remove(), 360);
    }, 3000);
  }

  /* ── Cooldown display ── */
  function updateCooldown() {
    const el = document.getElementById('spinCooldown');
    const btn = document.getElementById('spinBtn');
    if (!el || !btn) return;

    const availText = document.getElementById('spinAvailText');
    if (canSpin()) {
      el.textContent = '';
      if (availText) availText.style.display = '';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    } else {
      const ms  = msTillNext();
      const h   = Math.floor(ms / 3600000);
      const m   = Math.floor((ms % 3600000) / 60000);
      el.textContent = `⏳ Next spin in ${h}h ${m}m`;
      el.style.color = 'rgba(157,142,199,.6)';
      if (availText) availText.style.display = 'none';
      btn.disabled = true;
      btn.style.opacity = '.5';
      btn.style.cursor = 'not-allowed';
    }
  }

  /* ── Init ── */
  function init() {
    const canvas = document.getElementById('spinCanvas');
    const btn    = document.getElementById('spinBtn');
    if (!canvas || !btn) return;

    drawWheel(canvas, currentAngle);
    updateCooldown();
    setInterval(updateCooldown, 60000);

    btn.addEventListener('click', () => {
      if (spinning || !canSpin()) return;

      // Check login
      const u = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
      if (!u) { window.EyloxToast?.('Please log in to spin!', 'warn', 2500); return; }

      spinning = true;
      btn.disabled = true;

      // Weighted random — higher chance of small amounts
      const weights = SLICES.map(s => s.coins === 0 ? 2 : s.coins <= 50 ? 6 : s.coins <= 200 ? 4 : s.coins <= 500 ? 2 : 1);
      const total   = weights.reduce((a, b) => a + b, 0);
      let rand      = Math.random() * total;
      let pick      = 0;
      for (let i = 0; i < weights.length; i++) { rand -= weights[i]; if (rand <= 0) { pick = i; break; } }

      runSpin(canvas, pick);
    });

    // Allow clicking wheel too
    canvas.style.cursor = 'pointer';
    canvas.addEventListener('click', () => btn.click());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
