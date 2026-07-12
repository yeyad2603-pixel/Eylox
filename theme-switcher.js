/* ============================================================
   EYLOX — Theme Switcher
   Applies one of 6 visual themes by overriding CSS custom properties.
   Persists choice to localStorage.
   ============================================================ */
'use strict';

(function EyloxTheme() {

  const THEME_KEY = 'eylox_theme';

  const THEMES = [
    {
      id: 'purple', name: 'Purple', icon: '🔮',
      vars: {
        '--bg':'#110330','--surface':'#1c0b42','--card':'#230e56',
        '--purple':'#a78bfa','--border':'#3a2480','--text':'#f0e8ff',
        '--muted':'#9d8ec7','--accent-glow':'rgba(167,139,250,.4)',
        '--accent':'#a78bfa','--accent2':'#7c3aed','--accent-rgb':'167, 139, 250',
      },
    },
    {
      id: 'forest', name: 'Forest', icon: '🌿',
      vars: {
        '--bg':'#071a0a','--surface':'#0c2410','--card':'#0f2d12',
        '--purple':'#4ade80','--border':'#1a4a28','--text':'#e8ffe8',
        '--muted':'#6aad78','--accent-glow':'rgba(74,222,128,.4)',
        '--accent':'#4ade80','--accent2':'#16a34a','--accent-rgb':'74, 222, 128',
      },
    },
    {
      id: 'neon', name: 'Neon', icon: '⚡',
      vars: {
        '--bg':'#050508','--surface':'#0a0a14','--card':'#0e0e1e',
        '--purple':'#00ffcc','--border':'rgba(0,255,204,.2)','--text':'#e0fff8',
        '--muted':'#00cc99','--accent-glow':'rgba(0,255,204,.4)',
        '--accent':'#00ffcc','--accent2':'#ff00aa','--accent-rgb':'0, 255, 204',
      },
    },
    {
      id: 'galaxy', name: 'Galaxy', icon: '🌌',
      vars: {
        '--bg':'#020212','--surface':'#080820','--card':'#0c0c28',
        '--purple':'#9b8eff','--border':'rgba(100,80,220,.25)','--text':'#e8e8ff',
        '--muted':'#7060cc','--accent-glow':'rgba(155,142,255,.4)',
        '--accent':'#9b8eff','--accent2':'#50e3ff','--accent-rgb':'155, 142, 255',
      },
    },
    {
      id: 'diamond', name: 'Diamond', icon: '💎',
      vars: {
        '--bg':'#04111e','--surface':'#081a2e','--card':'#0b2040',
        '--purple':'#7dd3fc','--border':'rgba(56,189,248,.2)','--text':'#e8f8ff',
        '--muted':'#5a9ab8','--accent-glow':'rgba(125,211,252,.4)',
        '--accent':'#7dd3fc','--accent2':'#38bdf8','--accent-rgb':'125, 211, 252',
      },
    },
    {
      id: 'crimson', name: 'Crimson', icon: '🔴',
      vars: {
        '--bg':'#150303','--surface':'#200404','--card':'#2d0707',
        '--purple':'#f87171','--border':'rgba(127,29,29,.5)','--text':'#fff0f0',
        '--muted':'#c06060','--accent-glow':'rgba(248,113,113,.4)',
        '--accent':'#f87171','--accent2':'#dc2626','--accent-rgb':'248, 113, 113',
      },
    },
  ];

  /* ── Apply theme ── */
  function applyTheme(id) {
    const theme = THEMES.find(t => t.id === id) || THEMES[0];
    const root  = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem(THEME_KEY, id);
    // Update active indicator in any open picker
    document.querySelectorAll('.ts-btn').forEach(b => {
      b.classList.toggle('ts-active', b.dataset.tid === id);
    });
  }

  /* ── Build the picker widget ── */
  function buildPicker() {
    if (document.getElementById('theme-picker')) return;

    if (!document.getElementById('ts-style')) {
      const s = document.createElement('style');
      s.id = 'ts-style';
      s.textContent = `
        #theme-picker{position:fixed;bottom:185px;left:18px;z-index:9995;display:flex;flex-direction:column;gap:6px;animation:ts-in .25s ease}
        @keyframes ts-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .ts-btn{width:40px;height:40px;border-radius:50%;border:2px solid transparent;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);transition:all .18s;box-shadow:0 2px 10px rgba(0,0,0,.5)}
        .ts-btn:hover{transform:scale(1.18)}
        .ts-btn.ts-active{border-color:#a78bfa;box-shadow:0 0 12px rgba(167,139,250,.5)}
        #ts-toggle{position:fixed;bottom:185px;left:18px;z-index:9996;width:42px;height:42px;border-radius:50%;background:rgba(17,3,48,.88);border:1px solid rgba(167,139,250,.3);color:#a78bfa;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(0,0,0,.4);transition:all .18s}
        #ts-toggle:hover{background:rgba(30,11,66,.9);transform:scale(1.1)}
        #ts-label{position:fixed;bottom:185px;left:68px;z-index:9997;background:rgba(17,3,48,.9);border:1px solid rgba(167,139,250,.2);color:#f0e8ff;padding:5px 12px;border-radius:99px;font-size:.72rem;font-weight:800;font-family:Nunito,sans-serif;pointer-events:none;white-space:nowrap;animation:ts-in .2s ease}
      `;
      document.head.appendChild(s);
    }

    const savedId = localStorage.getItem(THEME_KEY) || 'default';
    const currentTheme = THEMES.find(t => t.id === savedId) || THEMES[0];

    const picker = document.createElement('div');
    picker.id = 'theme-picker';
    picker.style.display = 'none';

    THEMES.forEach(theme => {
      const btn = document.createElement('button');
      btn.className = 'ts-btn';
      btn.dataset.tid = theme.id;
      btn.title = theme.name;
      btn.textContent = theme.icon;
      btn.style.background = theme.vars['--bg'] || '#000';
      if (theme.id === savedId) btn.classList.add('ts-active');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        applyTheme(theme.id);
        // Update label
        const lbl = document.getElementById('ts-label');
        if (lbl) { lbl.textContent = theme.name; lbl.style.display = ''; setTimeout(() => lbl.remove(), 1500); }
      });
      picker.appendChild(btn);
    });

    /* Theme picker is now accessible only through Settings — no floating button */
    document.body.appendChild(picker);
  }

  /* ── Init ── */
  const saved = localStorage.getItem(THEME_KEY);
  // Map legacy IDs to new ones
  const LEGACY = { default:'purple', midnight:'galaxy', sunset:'crimson', ocean:'diamond', lava:'crimson' };
  const resolvedId = LEGACY[saved] || saved;
  if (resolvedId) {
    const theme = THEMES.find(t => t.id === resolvedId);
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (['login', 'landing', 'game'].some(p => page.startsWith(p))) return;
    buildPicker();
  });

  // Close picker when clicking outside
  document.addEventListener('click', () => {
    const p = document.getElementById('theme-picker');
    if (p) p.style.display = 'none';
  });

  window.EyloxApplyTheme = applyTheme;
  window.EyloxThemes     = THEMES;

})();
