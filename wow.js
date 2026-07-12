/* ============================================================
   EYLOX — WOW.js  Visual delight layer
   3D card tilt · scroll count-up · Konami code · typewriter
   avatar particle ring · confetti · quick profile popup
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════
   1. 3D CARD TILT on .game-card hover
══════════════════════════════════════════════════ */
(function(){
  function applyTilt(card) {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform .12s ease, box-shadow .12s ease';

    card.addEventListener('mousemove', e => {
      if (!window.EyloxGetSettings?.()?.cardTiltEnabled !== false && window.EyloxGetSettings?.()?.cardTiltEnabled === false) return;
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) / (r.width  / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const tiltX = -dy * 8;
      const tiltY =  dx * 8;
      card.style.transform    = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      card.style.boxShadow    = `${-dx*8}px ${-dy*8}px 30px rgba(124,58,237,.3)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  }

  function bindAll() {
    document.querySelectorAll('.game-card').forEach(applyTilt);
  }
  document.addEventListener('DOMContentLoaded', () => {
    bindAll();
    new MutationObserver(bindAll).observe(document.body, { childList:true, subtree:true });
  });
})();

/* ══════════════════════════════════════════════════
   2. SCROLL COUNT-UP ANIMATION for stat numbers
══════════════════════════════════════════════════ */
(function(){
  function animateNum(el) {
    if (el.dataset.animated) return;
    const raw = el.textContent.replace(/[^0-9.]/g, '');
    const target = parseFloat(raw);
    if (!raw || isNaN(target) || target === 0) return;
    el.dataset.animated = '1';
    const suffix = el.textContent.replace(/[\d.,]/g, '').trim();
    const start  = performance.now();
    const dur    = Math.min(1200, 400 + target * 0.3);
    const isInt  = !raw.includes('.');
    function tick(now) {
      const t   = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val  = target * ease;
      el.textContent = (isInt ? Math.round(val).toLocaleString() : val.toFixed(1)) + (suffix ? ' ' + suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateNum(e.target); });
  }, { threshold: 0.5 });

  function observeStats() {
    document.querySelectorAll('.ps-num, .stat-num, .sett-stat-num, #stat-games, #stat-friends, #stat-wins, #stat-badges, #stat-coins').forEach(el => {
      if (!el.dataset.animated) io.observe(el);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    observeStats();
    new MutationObserver(observeStats).observe(document.body, { childList:true, subtree:true });
  });
})();

/* ══════════════════════════════════════════════════
   3. CONFETTI SYSTEM — coins, stars, hearts, emoji
══════════════════════════════════════════════════ */
window.EyloxConfetti = (function(){
  const SHAPES = ['🪙','⭐','💎','🎉','✨','🌟','💜','🎮'];

  function burst(opts = {}) {
    const {
      x   = window.innerWidth  / 2,
      y   = window.innerHeight / 2,
      count = 24,
      shapes = SHAPES,
    } = opts;

    if (!document.getElementById('confetti-style')) {
      const s = document.createElement('style');
      s.id = 'confetti-style';
      s.textContent = `
        @keyframes conf-fly {
          0%   { opacity:1; transform:translate(0,0) rotate(0deg) scale(1); }
          100% { opacity:0; transform:translate(var(--cx),var(--cy)) rotate(var(--cr)) scale(.3); }
        }
        .conf-piece { position:fixed; pointer-events:none; z-index:999999; font-size:1.1rem;
          animation: conf-fly var(--cd) ease-out forwards; will-change:transform; }
      `;
      document.head.appendChild(s);
    }

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'conf-piece';
      piece.textContent = shapes[i % shapes.length];
      const angle = (i / count) * Math.PI * 2 + (Math.random() - .5) * .5;
      const dist  = 80 + Math.random() * 140;
      const dur   = (0.6 + Math.random() * 0.7).toFixed(2) + 's';
      piece.style.cssText = `left:${x}px; top:${y}px; --cx:${Math.cos(angle)*dist}px; --cy:${Math.sin(angle)*dist - 80}px; --cr:${Math.round(Math.random()*720-360)}deg; --cd:${dur}; animation-delay:${(i*20)}ms`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1500);
    }
  }

  function coins(x, y) { burst({ x, y, shapes:['🪙','💰','🪙','💛'], count:20 }); }
  function stars(x, y) { burst({ x, y, shapes:['⭐','🌟','✨','💫'], count:22 }); }
  function win(x, y)   { burst({ x, y, count:40 }); }

  return { burst, coins, stars, win };
})();

/* ══════════════════════════════════════════════════
   4. KONAMI CODE EASTER EGG
   ↑ ↑ ↓ ↓ ← → ← → B A
══════════════════════════════════════════════════ */
(function(){
  const SEQ    = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress = 0;

  document.addEventListener('keydown', e => {
    if (e.key === SEQ[progress]) {
      progress++;
      if (progress === SEQ.length) {
        progress = 0;
        activateKonami();
      }
    } else {
      progress = e.key === SEQ[0] ? 1 : 0;
    }
  });

  function activateKonami() {
    /* Grant bonus Eylux */
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
      if (u) { u.coins = (u.coins||0) + 1000; localStorage.setItem('eylox_user', JSON.stringify(u)); window.dispatchEvent(new Event('storage')); }
    } catch {}

    /* Full-screen flash */
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#3b0764,#110330);animation:konami-in .4s ease';
    ov.innerHTML = `
      <div style="font-size:4rem;animation:spin-y 1.2s ease forwards">🎮</div>
      <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#a78bfa;margin:12px 0 4px;text-shadow:0 0 30px #a78bfa">CHEAT CODE!</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#fbbf24">+1,000 Eylux Granted 🪙</div>
      <div style="font-size:.78rem;color:rgba(157,142,199,.5);font-weight:700;margin-top:10px">↑↑↓↓←→←→BA — Nice one 😏</div>`;
    if (!document.getElementById('konami-style')) {
      const s = document.createElement('style');
      s.id = 'konami-style';
      s.textContent = `@keyframes konami-in{from{opacity:0;transform:scale(1.15)}to{opacity:1;transform:none}} @keyframes spin-y{0%{transform:rotateY(0)}100%{transform:rotateY(720deg)}}`;
      document.head.appendChild(s);
    }
    document.body.appendChild(ov);
    window.EyloxConfetti?.win(window.innerWidth/2, window.innerHeight/2);
    window.EyloxSFX?.win?.();
    document.dispatchEvent(new Event('eylox:konami'));
    setTimeout(() => {
      ov.style.opacity = '0'; ov.style.transition = 'opacity .5s';
      setTimeout(() => ov.remove(), 500);
    }, 3200);
  }
})();

/* ══════════════════════════════════════════════════
   5. TYPEWRITER EFFECT on .page-heading h1
══════════════════════════════════════════════════ */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('.page-heading h1');
    if (!h1 || h1.dataset.typed) return;
    h1.dataset.typed = '1';
    const full = h1.innerHTML;
    const plain = h1.textContent;
    if (plain.length < 4) return;

    h1.textContent = '';
    h1.style.minHeight = '1.2em';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.style.cssText = 'border-right:2px solid #a78bfa;animation:blink-cur .7s step-end infinite;margin-left:1px';
    if (!document.getElementById('typer-style')) {
      const s = document.createElement('style');
      s.id = 'typer-style';
      s.textContent = '@keyframes blink-cur{0%,100%{opacity:1}50%{opacity:0}}';
      document.head.appendChild(s);
    }
    h1.appendChild(cursor);

    function type() {
      if (i <= plain.length) {
        h1.textContent = plain.slice(0, i);
        h1.appendChild(cursor);
        i++;
        setTimeout(type, i === 1 ? 200 : 40 + Math.random() * 30);
      } else {
        setTimeout(() => cursor.remove(), 1200);
        /* Restore inner HTML (spans, gradients) after typing done */
        setTimeout(() => { h1.innerHTML = full; }, 1300);
      }
    }
    setTimeout(type, 400);
  });
})();

/* ══════════════════════════════════════════════════
   6. AVATAR PARTICLE RING on profile page
══════════════════════════════════════════════════ */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const ring = document.querySelector('.ph-ring');
    if (!ring || document.getElementById('avatar-ring-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'avatar-ring-canvas';
    const S = 120;
    canvas.width = canvas.height = S;
    canvas.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0';
    ring.style.position = 'relative';
    ring.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = Array.from({ length:16 }, (_, i) => ({
      angle: (i / 16) * Math.PI * 2,
      r:     50 + Math.sin(i) * 4,
      size:  2 + Math.random() * 2,
      speed: 0.008 + Math.random() * 0.006,
      hue:   260 + Math.random() * 80,
      alpha: 0.5 + Math.random() * 0.5,
    }));

    function draw() {
      ctx.clearRect(0, 0, S, S);
      particles.forEach(p => {
        p.angle += p.speed;
        const x = S/2 + Math.cos(p.angle) * p.r;
        const y = S/2 + Math.sin(p.angle) * p.r;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha})`;
        ctx.shadowColor = `hsl(${p.hue},80%,70%)`;
        ctx.shadowBlur  = 6;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  });
})();

/* ══════════════════════════════════════════════════
   7. TOAST QUEUE SYSTEM  window.EyloxToast(msg, type)
══════════════════════════════════════════════════ */
(function(){
  const TYPES = {
    success:  { bg:'linear-gradient(135deg,#16a34a,#4ade80)',  icon:'✅' },
    error:    { bg:'linear-gradient(135deg,#dc2626,#f87171)',  icon:'❌' },
    info:     { bg:'linear-gradient(135deg,#2563eb,#60a5fa)',  icon:'ℹ️' },
    coins:    { bg:'linear-gradient(135deg,#d97706,#fbbf24)',  icon:'🪙', dark:true },
    achievement:{ bg:'linear-gradient(135deg,#7c3aed,#a855f7)',icon:'🎖️' },
    warn:     { bg:'linear-gradient(135deg,#b45309,#fbbf24)',  icon:'⚠️', dark:true },
  };

  let container = null;
  function getContainer() {
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.id = 'eylox-toast-container';
    container.style.cssText = 'position:fixed;bottom:40px;right:20px;z-index:99997;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;width:280px';
    if (!document.getElementById('toast-q-style')) {
      const s = document.createElement('style');
      s.id = 'toast-q-style';
      s.textContent = `
        @keyframes tq-in{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:none}}
        @keyframes tq-out{to{opacity:0;transform:translateX(110%)}}
        .eylox-toast-item{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;font-family:'Nunito',sans-serif;font-size:.83rem;font-weight:800;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.4);pointer-events:auto;animation:tq-in .35s cubic-bezier(.34,1.56,.64,1) both;cursor:default;position:relative;overflow:hidden}
        .eylox-toast-item::after{content:'';position:absolute;bottom:0;left:0;height:2px;background:rgba(255,255,255,.3);animation:toast-bar linear forwards}
        @keyframes toast-bar{from{width:100%}to{width:0}}
      `;
      document.head.appendChild(s);
    }
    document.body.appendChild(container);
    return container;
  }

  window.EyloxToast = function(msg, type = 'info', duration = 3000) {
    const t = TYPES[type] || TYPES.info;
    const item = document.createElement('div');
    item.className = 'eylox-toast-item';
    item.style.background = t.bg;
    if (t.dark) item.style.color = '#1a0a40';
    const iconSpan = document.createElement('span');
    iconSpan.style.cssText = 'font-size:1rem;flex-shrink:0';
    iconSpan.textContent = t.icon;
    const msgSpan = document.createElement('span');
    msgSpan.style.cssText = 'flex:1';
    msgSpan.textContent = msg;
    item.appendChild(iconSpan);
    item.appendChild(msgSpan);
    item.style.setProperty('--dur', duration + 'ms');
    item.style.cssText += `;background:${t.bg}`;
    msgSpan.style.color = t.dark ? '#1a0a40' : '#fff';

    const bar = document.createElement('div');
    bar.style.cssText = `position:absolute;bottom:0;left:0;height:2px;background:rgba(255,255,255,.35);width:100%;animation:toast-bar ${duration}ms linear forwards`;
    item.appendChild(bar);

    const c = getContainer();
    c.appendChild(item);

    /* Cap at 5 toasts */
    while (c.children.length > 5) c.firstChild?.remove();

    const tid = setTimeout(() => {
      item.style.animation = 'tq-out .3s ease forwards';
      setTimeout(() => item.remove(), 310);
    }, duration);

    item.addEventListener('click', () => {
      clearTimeout(tid);
      item.style.animation = 'tq-out .2s ease forwards';
      setTimeout(() => item.remove(), 210);
    });
  };

  /* Replace old showFriendToast-style calls where possible */
  window.EyloxToastCoins = function(amount) {
    window.EyloxToast(`+${Number(amount).toLocaleString()} Eylux earned!`, 'Eylux', 3500);
  };
})();

/* ══════════════════════════════════════════════════
   8. QUICK TOPBAR PROFILE POPUP (click avatar)
══════════════════════════════════════════════════ */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const avLinks = document.querySelectorAll('.tb-avatar');
    if (!avLinks.length) return;

    avLinks.forEach(av => {
      av.addEventListener('click', e => {
        if (window.location.pathname.endsWith('profile.html')) return;
        const existing = document.getElementById('topbar-profile-popup');
        if (existing) { existing.remove(); return; }

        const u = (() => { try { return JSON.parse(localStorage.getItem('eylox_user')||'null'); } catch { return null; } })();
        if (!u) return;

        const coins   = u.coins || 0;
        const level   = Math.floor(coins / 500) + 1;
        const xpPct   = Math.round((coins % 500) / 500 * 100);
        const friends = (() => { try { return JSON.parse(localStorage.getItem('eylox_friends')||'[]').length; } catch { return 0; } })();
        const status  = (() => { try { return JSON.parse(localStorage.getItem('eylox_player_status')||'{}'); } catch { return {}; } })();
        const statusIcons = { online:'🟢', playing:'🎮', away:'🟡', busy:'🔴', invisible:'⚫' };

        const popup = document.createElement('div');
        popup.id = 'topbar-profile-popup';
        const rect = av.getBoundingClientRect();

        if (!document.getElementById('tpp-style')) {
          const s = document.createElement('style');
          s.id = 'tpp-style';
          s.textContent = `@keyframes tpp-in{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}`;
          document.head.appendChild(s);
        }

        popup.style.cssText = `position:fixed;top:${rect.bottom+10}px;right:${window.innerWidth-rect.right}px;width:240px;background:linear-gradient(160deg,#1c0b42,#130838);border:1px solid rgba(167,139,250,.3);border-radius:18px;padding:18px;z-index:99996;box-shadow:0 24px 70px rgba(0,0,0,.7);animation:tpp-in .2s ease;font-family:'Nunito',sans-serif`;
        popup.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">${u.avatar||'🎮'}</div>
            <div>
              <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff">${u.username}</div>
              <div style="font-size:.68rem;font-weight:800;color:rgba(157,142,199,.5)">@${u.username.toLowerCase()}_eylox</div>
              <div style="font-size:.7rem;font-weight:800;margin-top:2px">${statusIcons[status.mode||'online']} ${status.msg||'Eylox Player'}</div>
            </div>
          </div>
          <div style="background:rgba(167,139,250,.08);border-radius:10px;padding:10px 12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:.72rem;font-weight:800;color:rgba(157,142,199,.7);margin-bottom:4px">
              <span>Level ${level}</span><span>${coins % 500} / 500 XP</span>
            </div>
            <div style="height:5px;background:rgba(167,139,250,.1);border-radius:99px;overflow:hidden">
              <div style="height:100%;width:${xpPct}%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:99px"></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">
            <div style="text-align:center;background:rgba(167,139,250,.07);border-radius:8px;padding:7px 4px">
              <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:#a78bfa">${Number(coins).toLocaleString()}</div>
              <div style="font-size:.58rem;font-weight:800;color:rgba(157,142,199,.5)">Eylux</div>
            </div>
            <div style="text-align:center;background:rgba(167,139,250,.07);border-radius:8px;padding:7px 4px">
              <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:#a78bfa">${u.wins||0}</div>
              <div style="font-size:.58rem;font-weight:800;color:rgba(157,142,199,.5)">Wins</div>
            </div>
            <div style="text-align:center;background:rgba(167,139,250,.07);border-radius:8px;padding:7px 4px">
              <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:#a78bfa">${friends}</div>
              <div style="font-size:.58rem;font-weight:800;color:rgba(157,142,199,.5)">Friends</div>
            </div>
          </div>
          <a href="profile.html" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:10px;padding:9px;font-size:.82rem;font-weight:900;color:#fff;text-decoration:none;transition:opacity .15s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">👤 View Full Profile</a>
        `;

        document.body.appendChild(popup);
        e.stopPropagation();

        setTimeout(() => {
          document.addEventListener('click', function rm() {
            popup.remove();
            document.removeEventListener('click', rm);
          }, { once:true });
        }, 50);
      });
    });
  });
})();

/* ══════════════════════════════════════════════════
   9. ANIMATED COIN COUNTER (roll-up when value changes)
══════════════════════════════════════════════════ */
(function(){
  /* Expose for api.js poll loop */
  window.EyloxWowAnimate = function(el, from, to) { animateTo(el, from, to); };

  function animateTo(el, from, to, duration = 800) {
    if (isNaN(from) || isNaN(to) || from === to) { el.textContent = Number(to).toLocaleString(); return; }
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('storage', e => {
    if (e.key !== 'eylox_user') return;
    try {
      const newCoins = JSON.parse(e.newValue||'null')?.coins;
      const oldCoins = JSON.parse(e.oldValue||'null')?.coins;
      if (newCoins == null) return;

      document.querySelectorAll('#topbarCoins, .coins-amount').forEach(el => {
        const cur = parseInt(el.textContent.replace(/[^0-9]/g, '')) || (oldCoins ?? 0);
        if (cur !== newCoins) animateTo(el, cur, newCoins);
      });

      if (newCoins > (oldCoins ?? 0)) {
        const diff = newCoins - (oldCoins ?? 0);
        window.EyloxToast(`+${diff.toLocaleString()} Eylux coins!`, 'Eylux', 2500);
        window.EyloxCoinBurst?.(diff);
      }
    } catch {}
  });
})();

/* ══════════════════════════════════════════════════
   10. GLITCH EFFECT on logo / username on hover
══════════════════════════════════════════════════ */
(function(){
  if (!document.getElementById('glitch-style')) {
    const s = document.createElement('style');
    s.id = 'glitch-style';
    s.textContent = `
      .glitch-hover { position:relative; }
      .glitch-hover:hover { animation: glitch-txt .4s steps(1) forwards; }
      @keyframes glitch-txt {
        0%,100% { text-shadow:none; }
        20%  { text-shadow: 2px 0 #f472b6, -2px 0 #60a5fa; }
        40%  { text-shadow: -2px 0 #f472b6, 2px 0 #60a5fa; clip-path:inset(10% 0 40% 0); }
        60%  { text-shadow: 2px 0 #60a5fa, -2px 0 #a78bfa; }
        80%  { text-shadow: -1px 0 #a78bfa, 1px 0 #f472b6; clip-path:none; }
      }
    `;
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sidebar-logo-text, .ph-username').forEach(el => {
      el.classList.add('glitch-hover');
    });
  });
})();

/* ══════════════════════════════════════════════════
   11. SKELETON LOADING SCREENS for .loading-placeholder
══════════════════════════════════════════════════ */
(function(){
  if (!document.getElementById('skeleton-style')) {
    const s = document.createElement('style');
    s.id = 'skeleton-style';
    s.textContent = `
      .skeleton {
        background: linear-gradient(90deg, rgba(167,139,250,.08) 25%, rgba(167,139,250,.15) 50%, rgba(167,139,250,.08) 75%);
        background-size: 200% 100%;
        animation: skel-shimmer 1.6s infinite;
        border-radius: 8px;
      }
      @keyframes skel-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      .skeleton-card { height:180px; border-radius:16px; }
      .skeleton-line { height:14px; border-radius:99px; margin:6px 0; }
      .skeleton-line.short { width:60%; }
      .skeleton-line.xshort { width:35%; }
      .skeleton-avatar { width:48px; height:48px; border-radius:50%; flex-shrink:0; }
    `;
    document.head.appendChild(s);
  }

  /* Replace "Loading…" paragraphs with skeletons */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.empty-msg').forEach(el => {
      if (el.textContent.trim() === 'Loading…') {
        el.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;width:100%">
            <div style="display:flex;align-items:center;gap:12px"><div class="skeleton skeleton-avatar"></div><div style="flex:1"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div></div>
            <div style="display:flex;align-items:center;gap:12px"><div class="skeleton skeleton-avatar"></div><div style="flex:1"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line xshort"></div></div></div>
          </div>`;
        el.style.width = '100%';
      }
    });
  });
})();
