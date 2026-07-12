/* ============================================================
   EYLOX — Unified Floating Action Panel
   Right-side vertical stack: each button clearly visible,
   no overlapping, labelled on hover, colour-coded.
   Other scripts (tooltip.js, offline.js) register here
   instead of creating their own fixed elements.
   ============================================================ */
'use strict';

(function EyloxFAB() {

  /* ─────────────────────────────────────────────
     Registry — other scripts call EyloxFAB.add()
  ───────────────────────────────────────────── */
  const _pending = [];
  let   _panel   = null;
  let   _built   = false;

  /* ── CSS ── */
  function injectCSS() {
    if (document.getElementById('efab-css')) return;
    const s = document.createElement('style');
    s.id = 'efab-css';
    s.textContent = `
      #efab-panel {
        position:fixed; right:18px; bottom:88px; z-index:9985;
        display:flex; flex-direction:column-reverse; align-items:flex-end;
        gap:10px; pointer-events:none;
      }
      .efab-btn {
        pointer-events:all;
        position:relative;
        width:48px; height:48px; border-radius:50%;
        border:2px solid rgba(255,255,255,.15);
        display:flex; align-items:center; justify-content:center;
        font-size:1.25rem; cursor:pointer;
        box-shadow:0 4px 18px rgba(0,0,0,.5);
        transition:transform .18s cubic-bezier(.34,1.56,.64,1),
                   box-shadow .18s, opacity .18s;
        opacity:0; transform:translateX(14px) scale(.8);
        animation:efabIn .36s cubic-bezier(.34,1.56,.64,1) var(--delay,0s) both;
      }
      @keyframes efabIn {
        from { opacity:0; transform:translateX(14px) scale(.7); }
        to   { opacity:1; transform:translateX(0)    scale(1);  }
      }
      .efab-btn:hover {
        transform:scale(1.14) translateX(-4px);
        box-shadow:0 8px 28px rgba(0,0,0,.6);
      }
      .efab-btn:active { transform:scale(.92); }

      /* Label that slides in from right on hover */
      .efab-label {
        position:absolute; right:calc(100% + 10px); top:50%;
        transform:translateY(-50%) translateX(8px);
        white-space:nowrap;
        background:rgba(8,4,22,.95); border:1px solid rgba(167,139,250,.25);
        color:#f0e8ff; font-family:'Nunito',sans-serif; font-weight:800;
        font-size:.72rem; border-radius:8px; padding:4px 10px;
        pointer-events:none;
        opacity:0; transition:opacity .15s, transform .15s;
      }
      .efab-label::after {
        content:''; position:absolute; right:-5px; top:50%; margin-top:-4px;
        border:4px solid transparent; border-left-color:rgba(167,139,250,.25);
      }
      .efab-btn:hover .efab-label {
        opacity:1; transform:translateY(-50%) translateX(0);
      }

      /* Pulse ring on "new" buttons */
      .efab-btn.has-badge::before {
        content:''; position:absolute; inset:-4px; border-radius:50%;
        border:2px solid currentColor; opacity:.4;
        animation:efabPulse 2s ease-in-out infinite;
      }
      @keyframes efabPulse {
        0%,100%{ transform:scale(1);   opacity:.4; }
        50%    { transform:scale(1.18);opacity:0;  }
      }
      /* Dot badge (notification count) */
      .efab-dot {
        position:absolute; top:-1px; right:-1px;
        width:12px; height:12px; border-radius:50%;
        background:#f87171; border:2px solid #07011a;
        font-size:0; display:none;
      }
      .efab-btn.has-badge .efab-dot { display:block; }
    `;
    document.head.appendChild(s);
  }

  /* ── Build panel ── */
  function buildPanel() {
    if (_panel) return;
    injectCSS();

    _panel = document.createElement('div');
    _panel.id = 'efab-panel';
    document.body.appendChild(_panel);
    _built = true;

    /* Render any actions registered before DOMContentLoaded */
    _pending.forEach(a => renderBtn(a));
    _pending.length = 0;
  }

  /* ── Render a single button ── */
  function renderBtn(action, index = _panel?.children.length || 0) {
    if (!_panel) return;

    const btn = document.createElement('button');
    btn.className  = 'efab-btn' + (action.badge ? ' has-badge' : '');
    btn.id         = `efab-${action.id}`;
    btn.title      = action.label;
    btn.style.cssText = `
      background:${action.bg || 'rgba(124,58,237,.85)'};
      color:${action.color || '#fff'};
      --delay:${index * 0.06}s;
    `;
    btn.innerHTML = `
      ${action.icon}
      <span class="efab-label">${action.label}</span>
      <span class="efab-dot"></span>
    `;

    if (action.onClick) {
      btn.addEventListener('click', e => { e.stopPropagation(); action.onClick(btn); });
    } else if (action.href) {
      btn.addEventListener('click', () => { window.location.href = action.href; });
    }

    _panel.appendChild(btn);
    return btn;
  }

  /* ── Public API ── */
  window.EyloxFAB = {
    /**
     * Register an action button.
     * @param {object} action  { id, icon, label, bg, color, href, onClick, badge }
     */
    add(action) {
      if (_built && _panel) {
        renderBtn(action);
      } else {
        _pending.push(action);
      }
    },
    /** Remove a button by id */
    remove(id) {
      document.getElementById(`efab-${id}`)?.remove();
    },
    /** Mark a button as having a notification badge */
    badge(id, show = true) {
      const btn = document.getElementById(`efab-${id}`);
      if (btn) btn.classList.toggle('has-badge', show);
    },
  };

  /* ── Default actions (always present) ── */
  const DEFAULT_ACTIONS = [
    {
      id:    'quick-play',
      icon:  '🎲',
      label: 'Quick Play',
      bg:    'linear-gradient(135deg,#7c3aed,#a855f7)',
      color: '#fff',
      onClick() { window.sbQuickPlay?.() || (window.location.href = 'games.html?random=1'); },
    },
    {
      id:    'events',
      icon:  '🔥',
      label: 'Live Events',
      bg:    'linear-gradient(135deg,#dc2626,#f97316)',
      color: '#fff',
      href:  'events.html',
    },
    {
      id:    'ai-chat',
      icon:  '🤖',
      label: 'AI Studio',
      bg:    'linear-gradient(135deg,#059669,#10b981)',
      color: '#fff',
      href:  'ai.html',
    },
    {
      id:    'tutorial',
      icon:  '🎓',
      label: 'Help & Tutorial',
      bg:    'linear-gradient(135deg,#1d4ed8,#60a5fa)',
      color: '#fff',
      onClick() { window.EyloxTooltips?.startTour(true) || (window.location.href = 'help.html'); },
    },
  ];

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    /* Skip on pages that have no sidebar (login / landing / game) */
    if (['login','landing','game'].some(p => page.startsWith(p))) return;
    if (document.getElementById('efab-panel')) return;

    buildPanel();

    /* Register default buttons */
    DEFAULT_ACTIONS.forEach((a, i) => {
      /* Skip "events" link on the events page itself */
      if (a.id === 'events' && page === 'events') return;
      /* Skip "ai-chat" on the ai page */
      if (a.id === 'ai-chat' && page === 'ai') return;
      renderBtn(a, i);
    });

    /* Show install prompt button if PWA install is available */
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      window._pwaInstallPrompt = e;
      EyloxFAB.add({
        id:    'install',
        icon:  '📲',
        label: 'Install App',
        bg:    'linear-gradient(135deg,#0f172a,#334155)',
        color: '#94a3b8',
        onClick() {
          window._pwaInstallPrompt?.prompt?.();
          EyloxFAB.remove('install');
        },
      });
    });
  });

})();
