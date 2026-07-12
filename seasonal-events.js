/* ============================================================
   EYLOX — Seasonal Events
   Injects seasonal banners, ambient effects, and theme overlays
   based on the current month / date.
   ============================================================ */
'use strict';

(function EyloxSeasonal() {

  const now   = new Date();
  const month = now.getMonth(); // 0=Jan … 11=Dec
  const day   = now.getDate();

  /* ── Season definitions ── */
  const SEASONS = [
    { id:'winter',    months:[11,0,1],  icon:'❄️',  label:'Winter Festival',  colors:['#001840','#003060'], accent:'#60a5fa', particles:['❄️','⛄','🌨️','✨'], topBg:'linear-gradient(90deg,#001840,#0a2a5e,#001840)' },
    { id:'spring',    months:[2,3,4],   icon:'🌸',  label:'Spring Blossom',   colors:['#001400','#003000'], accent:'#4ade80', particles:['🌸','🌺','🌼','🍀'], topBg:'linear-gradient(90deg,#001400,#003008,#001400)' },
    { id:'summer',    months:[5,6,7],   icon:'☀️',  label:'Summer Blaze',     colors:['#1a0800','#2e1000'], accent:'#f59e0b', particles:['☀️','🌴','🌊','⭐'], topBg:'linear-gradient(90deg,#1a0800,#2e1400,#1a0800)' },
    { id:'autumn',    months:[8,9,10],  icon:'🍂',  label:'Autumn Harvest',   colors:['#1a0600','#2e1000'], accent:'#f97316', particles:['🍂','🍁','🎃','🌙'], topBg:'linear-gradient(90deg,#1a0600,#2e0e00,#1a0600)' },
  ];

  /* ── Special event overrides ── */
  const EVENTS = [
    { id:'halloween', cond: month===9,             icon:'🎃', label:'Halloween Week', accent:'#c084fc', particles:['🎃','👻','🕷️','🦇'], topBg:'linear-gradient(90deg,#14000e,#200028,#14000e)' },
    { id:'xmas',      cond: month===11&&day>=20,   icon:'🎄', label:'Christmas!',     accent:'#4ade80', particles:['🎄','❄️','🎅','⭐'], topBg:'linear-gradient(90deg,#001400,#140000,#001400)' },
    { id:'newyear',   cond: month===0&&day<=5,     icon:'🎆', label:'Happy New Year!',accent:'#fde68a', particles:['🎆','🎉','✨','🥂'], topBg:'linear-gradient(90deg,#1a0028,#28003e,#1a0028)' },
    { id:'summer-peak', cond: month===6&&day>=10&&day<=20, icon:'🏖️', label:'Summer Peak!', accent:'#38bdf8', particles:['🏖️','🌊','🐚','🦀'], topBg:'linear-gradient(90deg,#001830,#002060,#001830)' },
  ];

  /* Resolve current event/season */
  const active = EVENTS.find(e => e.cond) || SEASONS.find(s => s.months.includes(month));
  if (!active) return;

  /* ── Seasonal top-banner ── */
  function injectBanner() {
    if (document.getElementById('seasonal-banner')) return;
    const page = document.body?.dataset?.page || '';
    if (['login', 'landing', 'game'].some(p => page.startsWith(p))) return;

    const banner = document.createElement('div');
    banner.id = 'seasonal-banner';
    banner.style.cssText = `
      background:${active.topBg};border-bottom:1px solid rgba(167,139,250,.15);
      padding:6px 18px;text-align:center;font-family:Nunito,sans-serif;font-size:.78rem;font-weight:800;
      color:rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;gap:10px;
      position:relative;overflow:hidden;flex-shrink:0;cursor:pointer;
      transition:max-height .3s;
    `;
    banner.innerHTML = `
      <span style="font-size:1rem">${active.icon}</span>
      <span>${active.label} is here on Eylox!</span>
      <span style="background:rgba(255,255,255,.12);padding:2px 10px;border-radius:99px;font-size:.7rem">View Events →</span>
      <button onclick="this.parentElement.remove()" style="position:absolute;right:12px;background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:.9rem;line-height:1">✕</button>
    `;
    banner.addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') location.href = 'live-events.html';
    });

    /* Insert at top of page-content or main-area */
    const target = document.querySelector('.main-area') || document.querySelector('.page-content');
    if (target) target.insertAdjacentElement('afterbegin', banner);

    if (!document.getElementById('seasonal-style')) {
      const s = document.createElement('style');
      s.id = 'seasonal-style';
      s.textContent = `
        @keyframes seasonal-shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        #seasonal-banner::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);animation:seasonal-shimmer 3s linear infinite;background-size:200% 100%;pointer-events:none}
      `;
      document.head.appendChild(s);
    }
  }

  /* ── Ambient particle emitter ── */
  function startParticles() {
    const page = document.body?.dataset?.page || '';
    if (['login', 'landing', 'game'].some(p => page.startsWith(p))) return;
    if (!active.particles?.length) return;

    if (!document.getElementById('seasonal-particle-style')) {
      const s = document.createElement('style');
      s.id = 'seasonal-particle-style';
      s.textContent = `
        @keyframes seap-fall{0%{opacity:.9;transform:translateX(var(--sx)) rotate(0deg)}100%{opacity:0;transform:translateX(calc(var(--sx)+var(--drift))) translateY(105vh) rotate(var(--spin))}}
        .seap{position:fixed;top:-30px;pointer-events:none;z-index:99990;font-size:1rem;animation:seap-fall var(--dur) ease-in forwards}
      `;
      document.head.appendChild(s);
    }

    let count = 0;
    const MAX = 12;

    function emit() {
      if (document.hidden || count >= MAX) return;
      const el    = document.createElement('div');
      el.className = 'seap';
      const emoji  = active.particles[Math.floor(Math.random() * active.particles.length)];
      const sx     = Math.random() * window.innerWidth;
      const drift  = (Math.random() - .5) * 80;
      const dur    = (4 + Math.random() * 5).toFixed(2) + 's';
      const spin   = Math.round(Math.random() * 540 - 270) + 'deg';
      el.textContent = emoji;
      el.style.cssText = `left:0;--sx:${sx}px;--drift:${drift}px;--dur:${dur};--spin:${spin};font-size:${.7 + Math.random() * .8}rem`;
      document.body.appendChild(el);
      count++;
      const ms = (parseFloat(dur) * 1000) | 0;
      setTimeout(() => { el.remove(); count--; }, ms + 200);
    }

    // Emit a few at start, then trickle
    for (let i = 0; i < 4; i++) setTimeout(emit, i * 600);
    setInterval(emit, 3500);
  }

  /* ── Sidebar seasonal badge ── */
  function addSidebarBadge() {
    document.querySelectorAll('.sidebar-link').forEach(a => {
      if (a.href?.includes('live-events') && !a.querySelector('.seasonal-dot')) {
        const dot = document.createElement('span');
        dot.className = 'seasonal-dot';
        dot.textContent = active.icon;
        dot.style.cssText = 'font-size:.8rem;margin-left:auto;animation:seasonal-pulse 2s ease-in-out infinite';
        a.appendChild(dot);
        if (!document.getElementById('seasonal-pulse-style')) {
          const s = document.createElement('style');
          s.id = 'seasonal-pulse-style';
          s.textContent = '@keyframes seasonal-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}';
          document.head.appendChild(s);
        }
      }
    });
  }

  /* ── Run ── */
  document.addEventListener('DOMContentLoaded', () => {
    startParticles();
    addSidebarBadge();
  });

  /* Expose for external theming */
  window.EyloxSeason = active;

})();
