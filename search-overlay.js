/* ============================================================
   EYLOX — Universal Search Overlay
   Ctrl+K / Cmd+K to open, ESC to close, arrows to navigate
   ============================================================ */
'use strict';

(function EyloxSearch() {

  function gUrl(id, title, icon, genre) {
    return `game.html?id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}&thumb=${encodeURIComponent(icon)}&genre=${encodeURIComponent(genre.toLowerCase())}`;
  }
  const GAMES = [
    { id:'ninja-dash',      title:'Ninja Dash',        icon:'🥷', genre:'Action',    href: gUrl('ninja-dash',    'Ninja Dash',    '🥷','action')    },
    { id:'sky-riders',      title:'Sky Riders',        icon:'✈️', genre:'Racing',    href: gUrl('sky-riders',    'Sky Riders',    '✈️','racing')    },
    { id:'block-kingdom',   title:'Block Kingdom',     icon:'🧱', genre:'Building',  href: gUrl('block-kingdom', 'Block Kingdom', '🧱','building')  },
    { id:'candy-chaos',     title:'Candy Chaos',       icon:'🍭', genre:'Action',    href: gUrl('candy-chaos',   'Candy Chaos',   '🍭','action')    },
    { id:'dragon-escape',   title:'Dragon Escape',     icon:'🐉', genre:'Survival',  href: gUrl('dragon-escape', 'Dragon Escape', '🐉','survival')  },
    { id:'ocean-quest',     title:'Ocean Quest',       icon:'🌊', genre:'Adventure', href: gUrl('ocean-quest',   'Ocean Quest',   '🌊','adventure') },
    { id:'puzzle-palace',   title:'Puzzle Palace',     icon:'🧩', genre:'Puzzle',    href: gUrl('puzzle-palace', 'Puzzle Palace', '🧩','puzzle')    },
    { id:'ice-fortress',    title:'Ice Fortress',      icon:'❄️', genre:'Building',  href: gUrl('ice-fortress',  'Ice Fortress',  '❄️','building')  },
    { id:'treasure-hunt',   title:'Treasure Hunt',     icon:'💎', genre:'Adventure', href: gUrl('treasure-hunt', 'Treasure Hunt', '💎','adventure') },
    { id:'space-blaster',   title:'Space Blaster',     icon:'🚀', genre:'Action',    href: gUrl('space-blaster', 'Space Blaster', '🚀','action')    },
    { id:'jungle-run',      title:'Jungle Run',        icon:'🌿', genre:'Adventure', href: gUrl('jungle-run',    'Jungle Run',    '🌿','adventure') },
    { id:'haunted-house',   title:'Haunted House',     icon:'👻', genre:'Survival',  href: gUrl('haunted-house', 'Haunted House', '👻','survival')  },
    { id:'race-city',       title:'Race City',         icon:'🏎️', genre:'Racing',    href: gUrl('race-city',     'Race City',     '🏎️','racing')    },
    { id:'farm-friends',    title:'Farm Friends',      icon:'🌾', genre:'Roleplay',  href: gUrl('farm-friends',  'Farm Friends',  '🌾','roleplay')  },
    { id:'logic-lab',       title:'Logic Lab',         icon:'🧬', genre:'Puzzle',    href: gUrl('logic-lab',     'Logic Lab',     '🧬','puzzle')    },
    { id:'pirate-bay',      title:'Pirate Bay',        icon:'🏴‍☠️', genre:'Adventure', href: gUrl('pirate-bay',    'Pirate Bay',    '🏴‍☠️','adventure') },
    { id:'eylox-obby',      title:'Eylox Obby (3D)',   icon:'🧱', genre:'Obstacle',  href:'game3d-obby.html' },
    { id:'treasure-island', title:'Treasure Island 3D',icon:'🏝️', genre:'Adventure', href:'game3d-treasure.html' },
  ];

  const PAGES = [
    { title:'Home',          icon:'🏠', href:'index.html' },
    { title:'Discover Games',icon:'🔭', href:'games.html' },
    { title:'Friends',       icon:'🤝', href:'friends.html' },
    { title:'Messages',      icon:'💬', href:'messages.html' },
    { title:'Profile',       icon:'👤', href:'profile.html' },
    { title:'Leaderboard',   icon:'🏆', href:'leaderboard.html' },
    { title:'Achievements',  icon:'🎖️', href:'achievements.html' },
    { title:'Communities',   icon:'🌍', href:'communities.html' },
    { title:'Live Events',   icon:'⚡', href:'live-events.html' },
    { title:'Shop',          icon:'🛒', href:'shop.html' },
    { title:'YouTube',       icon:'▶️', href:'youtube.html' },
    { title:'Eylox Studio',  icon:'🤖', href:'ai.html' },
  ];

  let overlay, input, resultsEl, selectedIdx = -1, currentResults = [];
  let recentSearches = [];
  const RECENT_KEY = 'eylox_recent_searches';

  function loadRecent() {
    try { recentSearches = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { recentSearches = []; }
  }
  function saveRecent(q) {
    if (!q.trim()) return;
    recentSearches = [q, ...recentSearches.filter(r => r !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
  }

  function getFriends() {
    try { return JSON.parse(localStorage.getItem('eylox_friends') || '[]'); } catch { return []; }
  }

  function buildResults(q) {
    q = q.toLowerCase().trim();
    const results = [];

    if (!q) {
      /* Recent searches */
      recentSearches.slice(0, 3).forEach(r => {
        results.push({ type:'recent', title:r, icon:'🕐', action:() => { input.value = r; buildResults(r); renderResults(); } });
      });
      /* Quick page links */
      PAGES.slice(0, 4).forEach(p => results.push({ type:'page', ...p, action:()=>{ saveRecent(p.title); location.href=p.href; } }));
      return results;
    }

    /* Games */
    GAMES.filter(g => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(g => results.push({ type:'game', title:g.title, icon:g.icon, sub:g.genre, action:()=>{ saveRecent(g.title); location.href=g.href; } }));

    /* Pages */
    PAGES.filter(p => p.title.toLowerCase().includes(q))
      .forEach(p => results.push({ type:'page', title:p.title, icon:p.icon, sub:'Page', action:()=>{ saveRecent(p.title); location.href=p.href; } }));

    /* Friends */
    getFriends().filter(f => f.username?.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(f => results.push({ type:'friend', title:f.username, icon:f.avatar || '🎮', sub:'Friend', action:()=>{ saveRecent(f.username); location.href='friends.html'; } }));

    return results;
  }

  function renderResults() {
    currentResults = buildResults(input?.value || '');
    selectedIdx = -1;
    if (!resultsEl) return;

    if (!currentResults.length) {
      const q = (input?.value || '').trim();
      resultsEl.innerHTML = q
        ? `<div style="padding:24px;text-align:center;color:rgba(157,142,199,.5);font-size:.85rem;font-weight:700">No results for "${q}"</div>`
        : '';
      return;
    }

    let lastType = null;
    resultsEl.innerHTML = currentResults.map((r, i) => {
      let header = '';
      if (r.type !== lastType) {
        const labels = { game:'Games', page:'Pages', friend:'Friends', recent:'Recent' };
        header = `<div style="padding:6px 16px 2px;font-size:.62rem;font-weight:900;color:rgba(167,139,250,.5);text-transform:uppercase;letter-spacing:1px">${labels[r.type]||r.type}</div>`;
        lastType = r.type;
      }
      return header + `
        <div class="esr-item" data-idx="${i}" style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;border-radius:10px;margin:0 6px;transition:background .1s">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(167,139,250,.1);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">${r.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;color:#f0e8ff;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</div>
            ${r.sub ? `<div style="font-size:.72rem;color:rgba(157,142,199,.6);font-weight:700">${r.sub}</div>` : ''}
          </div>
          <div style="font-size:.68rem;color:rgba(157,142,199,.35);font-weight:700">${r.type==='recent'?'↩':'↵'}</div>
        </div>`;
    }).join('');

    resultsEl.querySelectorAll('.esr-item').forEach(el => {
      el.addEventListener('mouseenter', () => { highlightIdx(+el.dataset.idx); });
      el.addEventListener('click', () => { currentResults[+el.dataset.idx]?.action(); close(); });
    });
  }

  function highlightIdx(n) {
    selectedIdx = n;
    resultsEl.querySelectorAll('.esr-item').forEach((el, i) => {
      el.style.background = i === n ? 'rgba(167,139,250,.12)' : '';
    });
    if (n >= 0) resultsEl.querySelectorAll('.esr-item')[n]?.scrollIntoView({ block:'nearest' });
  }

  function open() {
    if (document.getElementById('eyloxSearchOverlay')) return;
    loadRecent();

    const ov = document.createElement('div');
    ov.id = 'eyloxSearchOverlay';
    ov.innerHTML = `
      <div id="esr-panel" style="background:linear-gradient(160deg,#1c0b42,#110330);border:1px solid rgba(167,139,250,.3);border-radius:20px;width:min(560px,92vw);max-height:75vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.8);animation:esr-in .22s cubic-bezier(.34,1.56,.64,1)">
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(167,139,250,.12)">
          <span style="font-size:1.1rem;flex-shrink:0;color:rgba(167,139,250,.6)">🔍</span>
          <input id="esr-input" autocomplete="off" spellcheck="false" placeholder="Search games, pages, friends…"
            style="flex:1;background:none;border:none;color:#f0e8ff;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;outline:none" />
          <kbd style="font-size:.65rem;color:rgba(157,142,199,.4);background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.15);border-radius:6px;padding:2px 6px;font-family:monospace;flex-shrink:0">ESC</kbd>
        </div>
        <div id="esr-results" style="overflow-y:auto;padding:6px 0 10px;max-height:calc(75vh - 60px);scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.2) transparent"></div>
      </div>`;
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:99990;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh';

    if (!document.getElementById('esr-style')) {
      const s = document.createElement('style');
      s.id = 'esr-style';
      s.textContent = `@keyframes esr-in{from{opacity:0;transform:scale(.95) translateY(-10px)}to{opacity:1;transform:none}}
        #esr-results::-webkit-scrollbar{width:3px}
        #esr-results::-webkit-scrollbar-thumb{background:rgba(167,139,250,.2);border-radius:99px}`;
      document.head.appendChild(s);
    }

    overlay = ov;
    document.body.appendChild(ov);

    input = document.getElementById('esr-input');
    resultsEl = document.getElementById('esr-results');

    renderResults();
    input.focus();

    input.addEventListener('input', renderResults);

    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlightIdx(Math.min(selectedIdx+1, currentResults.length-1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlightIdx(Math.max(selectedIdx-1, 0)); }
      else if (e.key === 'Enter') {
        const r = currentResults[selectedIdx >= 0 ? selectedIdx : 0];
        if (r) { r.action(); close(); }
      } else if (e.key === 'Escape') { close(); }
    });

    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    window.EyloxSFX?.click?.();
  }

  function close() {
    overlay?.remove();
    overlay = null; input = null; resultsEl = null;
  }

  function init() {
    /* Ctrl+K / Cmd+K */
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('eyloxSearchOverlay') ? close() : open();
      }
    });

    /* Clicking any .search-input or .search-wrap */
    document.addEventListener('click', e => {
      const wrap = e.target.closest('.search-wrap, .search-input');
      if (wrap) {
        /* Don't intercept if user typed something in a real search input already */
        const inp = wrap.tagName === 'INPUT' ? wrap : wrap.querySelector('input');
        if (inp && inp.value.length > 0) return;
        e.preventDefault(); e.stopPropagation();
        if (!document.getElementById('eyloxSearchOverlay')) open();
      }
    });

    /* Add Ctrl+K hint to topbar search */
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.search-input').forEach(el => {
        el.placeholder = 'Search  (Ctrl+K)';
        el.readOnly = true;
        el.style.cursor = 'pointer';
      });
    });
  }

  init();

})();
