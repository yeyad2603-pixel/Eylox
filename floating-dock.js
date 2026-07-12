/* ============================================================
   EYLOX — macOS-style Floating Dock
   Bottom-centre nav with magnification + active glow
   ============================================================ */
'use strict';

(function EyloxDock() {

  const ITEMS = [
    { icon:'🏠', label:'Home',        href:'index.html',        page:'home' },
    { icon:'🔭', label:'Discover',    href:'games.html',        page:'games' },
    { icon:'🤝', label:'Friends',     href:'friends.html',      page:'friends' },
    { icon:'💬', label:'Messages',    href:'messages.html',     page:'messages' },
    { icon:'🏆', label:'Leaderboard', href:'leaderboard.html',  page:'leaderboard' },
    { icon:'🎖️', label:'Achievements',href:'achievements.html', page:'achievements' },
    { icon:'👤', label:'Profile',     href:'profile.html',      page:'profile' },
    { icon:'🛒', label:'Shop',        href:'shop.html',         page:'shop' },
  ];

  document.addEventListener('DOMContentLoaded', () => {
    const curPage = document.body?.dataset?.page || '';
    if (['login','landing'].some(p => curPage.startsWith(p))) return;
    if (document.getElementById('eylox-dock')) return;

    /* ── Styles ── */
    if (!document.getElementById('dock-style')) {
      const s = document.createElement('style');
      s.id = 'dock-style';
      s.textContent = `
        #eylox-dock {
          position:fixed; bottom:34px; left:50%; transform:translateX(-50%);
          z-index:9980; display:flex; align-items:flex-end; gap:6px;
          background:rgba(17,3,48,.82); backdrop-filter:blur(20px);
          border:1px solid rgba(167,139,250,.2); border-radius:22px;
          padding:8px 14px 6px; box-shadow:0 8px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(167,139,250,.06);
          transition:opacity .3s;
        }
        #eylox-dock.hidden { opacity:0; pointer-events:none; }
        .dock-item {
          display:flex; flex-direction:column; align-items:center; gap:3px;
          cursor:pointer; position:relative; transition:transform .18s cubic-bezier(.34,1.56,.64,1);
          text-decoration:none;
        }
        .dock-item:hover { transform:translateY(-12px) scale(1.35); }
        .dock-item:hover .dock-icon { box-shadow:0 8px 24px rgba(167,139,250,.4); }
        .dock-item:hover .dock-label { opacity:1; transform:translateY(0); }
        .dock-item.neighbour { transform:translateY(-5px) scale(1.15); }
        .dock-icon {
          width:38px; height:38px; border-radius:12px;
          background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.15);
          display:flex; align-items:center; justify-content:center; font-size:1.2rem;
          transition:box-shadow .18s, background .18s;
        }
        .dock-item.active .dock-icon {
          background:rgba(124,58,237,.25); border-color:rgba(167,139,250,.4);
          box-shadow:0 0 12px rgba(124,58,237,.4);
        }
        .dock-item.active::after {
          content:''; position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
          width:4px; height:4px; border-radius:50%; background:#a78bfa;
          box-shadow:0 0 6px #a78bfa;
        }
        .dock-label {
          position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%) translateY(4px);
          background:rgba(17,3,48,.95); border:1px solid rgba(167,139,250,.25);
          border-radius:8px; padding:3px 9px; font-size:.65rem; font-weight:800;
          color:#f0e8ff; white-space:nowrap; opacity:0; pointer-events:none;
          transition:opacity .15s, transform .15s;
        }
        .dock-label::after {
          content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
          border:4px solid transparent; border-top-color:rgba(167,139,250,.25);
        }
        .dock-separator {
          width:1px; height:28px; background:rgba(167,139,250,.15); margin:0 2px; align-self:center;
        }
        @keyframes dock-in { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%)} }
        #eylox-dock { animation:dock-in .5s cubic-bezier(.34,1.56,.64,1) .3s both; }
      `;
      document.head.appendChild(s);
    }

    const dock = document.createElement('div');
    dock.id = 'eylox-dock';

    ITEMS.forEach((item, i) => {
      if (i === 4) {
        const sep = document.createElement('div');
        sep.className = 'dock-separator';
        dock.appendChild(sep);
      }
      const a = document.createElement('a');
      a.className = 'dock-item' + (curPage === item.page ? ' active' : '');
      a.href = item.href;
      a.title = item.label;
      a.innerHTML = `<div class="dock-icon">${item.icon}</div><div class="dock-label">${item.label}</div>`;

      /* Bounce animation on click */
      a.addEventListener('click', e => {
        if (a.classList.contains('active')) { e.preventDefault(); return; }
        a.style.transform = 'translateY(-20px) scale(1.5)';
        setTimeout(() => { a.style.transform = ''; }, 200);
        window.EyloxSFX?.click?.();
      });

      /* Neighbour magnification */
      a.addEventListener('mouseenter', () => {
        const items = dock.querySelectorAll('.dock-item');
        const idx   = [...items].indexOf(a);
        items.forEach((el, j) => {
          el.classList.remove('neighbour');
          if (Math.abs(j - idx) === 1) el.classList.add('neighbour');
        });
      });
      a.addEventListener('mouseleave', () => {
        dock.querySelectorAll('.dock-item').forEach(el => el.classList.remove('neighbour'));
      });

      dock.appendChild(a);
    });

    /* Hide/show on scroll */
    let lastY = 0, hideTimer;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > lastY + 80) { dock.classList.add('hidden'); }
      else if (y < lastY - 20) { dock.classList.remove('hidden'); }
      lastY = y;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => dock.classList.remove('hidden'), 800);
    }, { passive:true });

    document.body.appendChild(dock);
  });

})();
