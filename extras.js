/* ============================================================
   EYLOX — extras.js  Global polish for all pages
   ============================================================ */
'use strict';

/* ── 1. Cursor sparkle trail ── */
(function(){
  const colors = ['#a78bfa','#60a5fa','#f472b6','#fde68a','#4ade80'];
  document.addEventListener('mousemove', e => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);background:${colors[Math.floor(Math.random()*colors.length)]};animation:spark-fade .6s ease forwards`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 620);
  });
  if (!document.getElementById('spark-style')) {
    const s = document.createElement('style');
    s.id = 'spark-style';
    s.textContent = '@keyframes spark-fade{0%{opacity:.9;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(0) translateY(-12px)}}';
    document.head.appendChild(s);
  }
})();

/* ── 2. Top scroll-progress bar ── */
(function(){
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0%;z-index:9999;background:linear-gradient(90deg,#7c3aed,#a78bfa,#f472b6);transition:width .1s linear;pointer-events:none;';
  document.body.appendChild(bar);
  window.addEventListener('scroll', ()=>{
    const el = document.scrollingElement || document.documentElement;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100;
    bar.style.width = pct + '%';
  }, {passive:true});
})();

/* ── 3. Notification panel — defers to notifications.js when loaded ── */
(function(){
  /* notifications.js replaces the bell's id to 'notifBell' and adds its own
     stopPropagation click handler.  When that module is present the panel is
     fully managed by it; this IIFE only provides a lightweight fallback for
     pages that do not load notifications.js.
     Key rule: NEVER forcibly remove #notifPanel — notifications.js stores a
     reference to that node and removing it from the DOM breaks future opens. */

  function _notifJsLoaded() {
    /* notifications.js renames the button to #notifBell; use that as a signal */
    return !!document.getElementById('notifBell');
  }

  document.addEventListener('click', e => {
    /* If notifications.js is active, do nothing — it handles everything */
    if (_notifJsLoaded()) return;

    const btn = e.target.closest('[aria-label="Notifications"], #notifBellBtn');
    /* Click outside: close any open fallback panel (only the extras.js one — it
       has no #notifPanelInner child, which is notifications.js's marker) */
    if (!btn) {
      const panel = document.getElementById('notifPanel');
      if (panel && !panel.querySelector('#notifPanelInner')) panel.remove();
      return;
    }
    e.stopPropagation();
    const existing = document.getElementById('notifPanel');
    if (existing && !existing.querySelector('#notifPanelInner')) { existing.remove(); return; }
    if (existing) return; /* notifications.js panel — leave it alone */

    /* ── Fallback panel (notifications.js absent) ── */
    const u = (() => { try { return JSON.parse(localStorage.getItem('eylox_user')||'null'); } catch { return null; } })();
    const dr = (() => { try { return JSON.parse(localStorage.getItem('eylox_daily_rewards')||'{}'); } catch { return {}; } })();
    const friends = (() => { try { return JSON.parse(localStorage.getItem('eylox_friends')||'[]'); } catch { return []; } })();

    const items = [];
    if (u?.coins > 0) items.push({ icon:'💰', title:'Coin balance', body:`You have ${Number(u.coins).toLocaleString()} Eylux`, time:Date.now()-60000 });
    if (dr.streak > 0) items.push({ icon:'🔥', title:'Daily streak', body:`You're on a ${dr.streak}-day streak!`, time:dr.lastClaim||Date.now()-3600000 });
    if (friends.length) items.push({ icon:'🤝', title:'Friends online', body:`${friends.filter(f=>f.online).length} of your friends are online`, time:Date.now()-300000 });
    items.push({ icon:'⚡', title:'Live events', body:'New events are available — check Live Events!', time:Date.now()-7200000 });
    items.push({ icon:'🎮', title:'New games', body:'Crystal Caves and Turbo Karts just launched!', time:Date.now()-86400000 });

    function timeAgo(ts) {
      const d = Date.now() - ts;
      if (d < 60000) return 'just now';
      if (d < 3600000) return Math.floor(d/60000) + 'm ago';
      if (d < 86400000) return Math.floor(d/3600000) + 'h ago';
      return Math.floor(d/86400000) + 'd ago';
    }

    const panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.innerHTML = `
      <div style="padding:14px 16px;border-bottom:1px solid rgba(167,139,250,.2);display:flex;align-items:center;justify-content:space-between">
        <span style="font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff">🔔 Notifications</span>
        <button onclick="this.closest('#notifPanel').remove()" style="background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:1rem">✕</button>
      </div>
      <div style="padding:4px 0;max-height:340px;overflow-y:auto">
        ${items.map(n => `
          <div class="np-item">
            <span style="font-size:1rem">${n.icon||'🔔'}</span>
            <div style="flex:1;min-width:0">
              <div><strong>${n.title||''}</strong></div>
              <div style="color:rgba(157,142,199,.6);font-size:.72rem;margin-top:1px">${n.body||''}</div>
            </div>
            <span style="font-size:.65rem;color:rgba(157,142,199,.35);white-space:nowrap;margin-left:6px">${timeAgo(n.time||Date.now())}</span>
          </div>`).join('')}
      </div>
      <div style="padding:10px 16px;border-top:1px solid rgba(167,139,250,.2);text-align:center">
        <span style="font-size:.75rem;color:#9d8ec7;font-weight:700">You're all caught up! 🎉</span>
      </div>
    `;
    const r = btn.getBoundingClientRect();
    panel.style.cssText = `position:fixed;top:${r.bottom+8}px;right:${window.innerWidth-r.right}px;width:300px;background:#0f0428;border:1px solid rgba(167,139,250,.25);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(167,139,250,.1);z-index:9998;overflow:hidden;animation:panel-drop .2s ease`;
    if (!document.getElementById('notif-panel-style')) {
      const s = document.createElement('style');
      s.id = 'notif-panel-style';
      s.textContent = `
        @keyframes panel-drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .np-item{display:flex;align-items:flex-start;gap:10px;padding:10px 16px;font-size:.82rem;font-weight:700;color:#9d8ec7;border-bottom:1px solid rgba(167,139,250,.08);transition:background .15s;cursor:default}
        .np-item:hover{background:rgba(167,139,250,.08);color:#f0e8ff}
        .np-item strong{color:#f0e8ff}
        .np-item:last-child{border-bottom:none}
      `;
      document.head.appendChild(s);
    }
    document.body.appendChild(panel);
    document.querySelectorAll('.notif-dot').forEach(d => d.style.display='none');
  });
})();

/* ── 4. Page load ripple on .btn-play ── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-play, .hype-btn-primary, .hype-notify-btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;border-radius:50%;background:rgba(255,255,255,.25);transform:scale(0);animation:ripple-burst .5s ease forwards;pointer-events:none`;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(()=>ripple.remove(), 520);
});
if (!document.getElementById('ripple-style')) {
  const s = document.createElement('style');
  s.id = 'ripple-style';
  s.textContent = '@keyframes ripple-burst{to{transform:scale(1);opacity:0}}';
  document.head.appendChild(s);
}

/* ── 5. Sidebar active link glow ── */
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.sidebar-link.active').forEach(el=>{
    el.style.position = 'relative';
    const glow = document.createElement('span');
    glow.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#a78bfa,#60a5fa);border-radius:0 2px 2px 0';
    el.appendChild(glow);
  });
});

/* ── 6. Inject YouTube & AI Gaming links into every sidebar ── */
document.addEventListener('DOMContentLoaded', ()=>{
  if (!document.querySelector('a[href="youtube.html"]')) {
    const eventsLink = Array.from(document.querySelectorAll('.sidebar-link')).find(
      a => a.href && a.href.includes('live-events.html')
    );
    if (eventsLink) {
      const li = eventsLink.closest('li');
      if (li) {
        const ytLi = document.createElement('li');
        ytLi.innerHTML = '<a href="youtube.html" class="sidebar-link"><span class="s-icon">▶️</span><span class="s-label">YouTube</span></a>';
        const aiLi = document.createElement('li');
        aiLi.innerHTML = '<a href="ai.html" class="sidebar-link" style="position:relative;overflow:visible"><span class="s-icon">🤖</span><span class="s-label">Eylox Studio</span><span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:.5rem;font-weight:900;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:2px 6px;border-radius:99px;font-family:\'Fredoka One\',cursive;box-shadow:0 0 8px rgba(168,85,247,.6)">AI</span></a>';
        li.after(aiLi);
        li.after(ytLi);
        if (window.location.pathname.endsWith('youtube.html')) ytLi.querySelector('.sidebar-link').classList.add('active');
        if (window.location.pathname.endsWith('ai.html'))      aiLi.querySelector('.sidebar-link').classList.add('active');
      }
    }
  }
});

/* ── 7. Game Favorites (heart buttons on game cards) ── */
(function(){
  function getFavs() { try { return JSON.parse(localStorage.getItem('eylox_favorites')||'[]'); } catch { return []; } }
  function saveFavs(f) { localStorage.setItem('eylox_favorites', JSON.stringify(f)); }

  function addHearts() {
    document.querySelectorAll('.game-card').forEach(card => {
      if (card.querySelector('.fav-btn')) return;
      const id = card.dataset.gameId || '';
      const favs = getFavs();
      const liked = favs.includes(id);
      const btn = document.createElement('button');
      btn.className = 'fav-btn';
      btn.dataset.id = id;
      btn.setAttribute('aria-label', liked ? 'Unfavorite' : 'Favorite');
      btn.style.cssText = `position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,.55);border:none;border-radius:50%;width:28px;height:28px;font-size:.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,background .15s;z-index:4;color:${liked?'#f472b6':'rgba(255,255,255,.55)'}`;
      btn.textContent = liked ? '♥' : '♡';
      card.style.position = 'relative';
      card.appendChild(btn);
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const f = getFavs();
        const idx = f.indexOf(id);
        if (idx === -1) { f.unshift(id); btn.textContent = '♥'; btn.style.color = '#f472b6'; btn.style.transform = 'scale(1.3)'; setTimeout(()=>btn.style.transform='',200); }
        else { f.splice(idx,1); btn.textContent = '♡'; btn.style.color = 'rgba(255,255,255,.6)'; }
        saveFavs(f);
      });
    });
  }

  if (!document.getElementById('fav-style')) {
    const s = document.createElement('style');
    s.id = 'fav-style';
    s.textContent = '.fav-btn:hover{background:rgba(0,0,0,.7)!important;transform:scale(1.15)!important}';
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', ()=>{ addHearts(); new MutationObserver(addHearts).observe(document.body,{childList:true,subtree:true}); });
})();

/* ── 8. Level-Up Toast Notifications ── */
(function(){
  const XP_PER_LEVEL = 500;
  let _lastLevel = null;

  function checkLevelUp() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
      if (!u) return;
      const level = Math.floor((u.coins||0) / XP_PER_LEVEL) + 1;
      if (_lastLevel === null) { _lastLevel = level; return; }
      if (level > _lastLevel) {
        _lastLevel = level;
        showLevelUpToast(level);
      }
    } catch {}
  }

  function showLevelUpToast(level) {
    if (!document.getElementById('lvlup-style')) {
      const s = document.createElement('style');
      s.id = 'lvlup-style';
      s.textContent = `@keyframes lvlup-in{from{opacity:0;transform:translateX(120px)}to{opacity:1;transform:none}}@keyframes lvlup-out{to{opacity:0;transform:translateX(120px)}}
        .lvlup-toast{position:fixed;bottom:90px;right:20px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:20px;padding:16px 22px;color:#fff;font-family:'Fredoka One',cursive;font-size:1.1rem;box-shadow:0 8px 40px rgba(124,58,237,.6);z-index:99998;display:flex;align-items:center;gap:12px;animation:lvlup-in .5s cubic-bezier(.34,1.56,.64,1) both}
        .lvlup-toast.out{animation:lvlup-out .4s ease forwards}`;
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.className = 'lvlup-toast';
    t.innerHTML = `<span style="font-size:1.8rem">⬆️</span><div><div>Level Up!</div><div style="font-size:.75rem;font-family:Nunito,sans-serif;font-weight:700;opacity:.85">You reached Level ${level}</div></div>`;
    document.body.appendChild(t);
    window.EyloxSFX?.win?.();
    setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),420); }, 3500);
  }

  window.addEventListener('storage', e=>{ if(e.key==='eylox_user') checkLevelUp(); });
  document.addEventListener('DOMContentLoaded', ()=>{ checkLevelUp(); setInterval(checkLevelUp,5000); });
})();

/* ── 9. Daily Rewards + Music Player + Global Chat — load on hub pages ── */
(function(){
  const page = document.body?.dataset?.page || '';
  const skip = ['login','landing','game'].some(p => page.startsWith(p));

  function lazyLoad(src) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script'); s.src = src;
      document.body.appendChild(s);
    }
  }

  if (!skip) {
    lazyLoad('owner-theme.js');
    lazyLoad('i18n.js');
    lazyLoad('ranks.js');
    lazyLoad('level-badge.js');
    lazyLoad('today-stats.js');
    lazyLoad('coin-boost.js');
    lazyLoad('daily-rewards.js');
    lazyLoad('globalchat.js');
    lazyLoad('search-overlay.js');
    lazyLoad('daily-challenge.js');
    lazyLoad('game-ratings.js');
    lazyLoad('pro-tips.js');
    lazyLoad('wow.js');
    lazyLoad('heatmap.js');
    lazyLoad('floating-dock.js');
    lazyLoad('achievement-popup.js');
    lazyLoad('gaming-fortune.js');
    lazyLoad('messages-local.js');
    lazyLoad('seasonal-events.js');
    lazyLoad('theme-switcher.js');
    lazyLoad('spin-wheel.js');
    lazyLoad('game-stats.js');
    lazyLoad('streak-calendar.js');
    lazyLoad('quick-challenge.js');
    lazyLoad('player-card.js');
    lazyLoad('live-feed.js');
    lazyLoad('xp-events.js');
    lazyLoad('session-tracker.js');
    lazyLoad('party-system.js');
    lazyLoad('game-hub.js');
    lazyLoad('extras-menu.js');
    lazyLoad('level-up.js');
  }
})();

/* ── 10. Coin Burst Animation ── */
(function(){
  window.EyloxCoinBurst = function(amount, sourceEl) {
    if (!document.getElementById('coinburst-style')) {
      const s = document.createElement('style');
      s.id = 'coinburst-style';
      s.textContent = `
        @keyframes coin-fly{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.5)}}
        .coin-particle{position:fixed;pointer-events:none;z-index:99999;font-size:1.1rem;animation:coin-fly .9s ease-out forwards}
        @keyframes coin-toast-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes coin-toast-out{to{opacity:0;transform:translateY(-10px)}}
        .coin-toast{position:fixed;pointer-events:none;z-index:99999;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1a0a40;font-family:'Fredoka One',cursive;font-size:1rem;padding:8px 16px;border-radius:99px;box-shadow:0 4px 20px rgba(251,191,36,.4);animation:coin-toast-in .3s ease both}
        .coin-toast.out{animation:coin-toast-out .3s ease both}
      `;
      document.head.appendChild(s);
    }

    const rect = sourceEl?.getBoundingClientRect?.();
    const cx = rect ? rect.left + rect.width/2 : window.innerWidth/2;
    const cy = rect ? rect.top  + rect.height/2 : window.innerHeight * 0.4;

    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'coin-particle';
      p.textContent = '🪙';
      const angle = (i / 8) * Math.PI * 2;
      const dist  = 60 + Math.random() * 60;
      p.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist-40}px;animation-delay:${i*40}ms`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }

    if (amount > 0) {
      const toast = document.createElement('div');
      toast.className = 'coin-toast';
      toast.textContent = `+${amount.toLocaleString()} Eylux!`;
      toast.style.cssText = `left:${cx}px;top:${cy - 50}px;transform:translateX(-50%)`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 320); }, 1800);
    }
  };
})();

/* ── 11. Network Offline / Online Banner ── */
(function(){
  let banner = null;

  function showOffline() {
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'network-banner';
    banner.textContent = '⚠️ You are offline — some features may be unavailable';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:100000;background:linear-gradient(90deg,#7f1d1d,#991b1b);color:#fecaca;font-family:Nunito,sans-serif;font-size:.8rem;font-weight:800;text-align:center;padding:8px 16px;animation:banner-drop .3s ease';
    if (!document.getElementById('banner-style')) {
      const s = document.createElement('style');
      s.id = 'banner-style';
      s.textContent = '@keyframes banner-drop{from{transform:translateY(-100%)}to{transform:none}}@keyframes banner-up{to{transform:translateY(-100%)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(banner);
  }

  function showOnline() {
    if (!banner) return;
    banner.textContent = '✅ Back online!';
    banner.style.background = 'linear-gradient(90deg,#064e3b,#065f46)';
    banner.style.color = '#6ee7b7';
    setTimeout(() => {
      if (banner) { banner.style.animation = 'banner-up .3s ease forwards'; setTimeout(() => { banner?.remove(); banner = null; }, 320); }
    }, 2000);
  }

  window.addEventListener('offline', showOffline);
  window.addEventListener('online', showOnline);
  if (!navigator.onLine) document.addEventListener('DOMContentLoaded', showOffline);
})();

/* ── 12. Keyboard Shortcuts ── */
(function(){
  const SHORTCUTS = [
    { key:'g', label:'G', desc:'Go to Discover',   href:'games.html' },
    { key:'h', label:'H', desc:'Go to Home',        href:'index.html' },
    { key:'f', label:'F', desc:'Go to Friends',     href:'friends.html' },
    { key:'p', label:'P', desc:'Go to Profile',     href:'profile.html' },
    { key:'l', label:'L', desc:'Go to Leaderboard', href:'leaderboard.html' },
    { key:'m', label:'M', desc:'Go to Messages',    href:'messages.html' },
    { key:'s', label:'S', desc:'Open Settings',     action:()=>window.EyloxOpenSettings?.() },
    { key:'?', label:'?', desc:'Show this help',    action:()=>showHelp() },
  ];

  function showHelp() {
    if (document.getElementById('kbd-help-overlay')) { document.getElementById('kbd-help-overlay').remove(); return; }
    const ov = document.createElement('div');
    ov.id = 'kbd-help-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:99995;display:flex;align-items:center;justify-content:center';
    ov.innerHTML = `
      <div style="background:linear-gradient(160deg,#1c0b42,#110330);border:1px solid rgba(167,139,250,.3);border-radius:20px;padding:28px 32px;width:min(420px,90vw);box-shadow:0 40px 100px rgba(0,0,0,.8);animation:esr-in .2s ease">
        <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#f0e8ff;margin-bottom:4px">⌨️ Keyboard Shortcuts</div>
        <p style="font-size:.78rem;color:rgba(157,142,199,.6);font-weight:700;margin-bottom:16px">Press a key anywhere (not in a text field)</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${SHORTCUTS.map(sc => `
            <div style="display:flex;align-items:center;gap:10px">
              <kbd style="background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.25);border-radius:6px;padding:4px 10px;font-size:.85rem;font-family:monospace;color:#a78bfa;flex-shrink:0;min-width:28px;text-align:center">${sc.label}</kbd>
              <span style="font-size:.8rem;font-weight:700;color:rgba(157,142,199,.8)">${sc.desc}</span>
            </div>`).join('')}
          <div style="display:flex;align-items:center;gap:10px">
            <kbd style="background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.25);border-radius:6px;padding:4px 10px;font-size:.85rem;font-family:monospace;color:#a78bfa;flex-shrink:0">Ctrl+K</kbd>
            <span style="font-size:.8rem;font-weight:700;color:rgba(157,142,199,.8)">Universal search</span>
          </div>
        </div>
        <div style="margin-top:16px;text-align:center"><button onclick="this.closest('#kbd-help-overlay').remove()" style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:#a78bfa;padding:8px 20px;border-radius:99px;font-family:Nunito,sans-serif;font-weight:800;font-size:.82rem;cursor:pointer">Close (ESC)</button></div>
      </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    ov.addEventListener('keydown', e => { if (e.key === 'Escape') ov.remove(); });
    document.body.appendChild(ov);
  }

  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName?.toUpperCase();
    if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const sc = SHORTCUTS.find(s => s.key === e.key.toLowerCase() || s.key === e.key);
    if (!sc) return;
    e.preventDefault();

    if (sc.action) { sc.action(); }
    else if (sc.href) {
      const cur = location.pathname.split('/').pop() || 'index.html';
      if (cur !== sc.href) location.href = sc.href;
    }
  });
})();

/* ── 13. Session Timer in Topbar ── */
(function(){
  const SESSION_KEY = 'eylox_session_start';
  if (!sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, Date.now());

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].some(p=>page.startsWith(p))) return;

    const coinsEl = document.querySelector('.tb-coins');
    if (!coinsEl) return;

    const timer = document.createElement('div');
    timer.id = 'session-timer';
    timer.title = 'Session time';
    timer.style.cssText = 'font-size:.7rem;font-weight:800;color:rgba(157,142,199,.5);white-space:nowrap;display:flex;align-items:center;gap:3px;cursor:default;padding:4px 8px;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.1);border-radius:99px';
    coinsEl.parentNode.insertBefore(timer, coinsEl);

    function update() {
      const elapsed = Math.floor((Date.now() - (+sessionStorage.getItem(SESSION_KEY))) / 1000);
      const m = Math.floor(elapsed / 60);
      const h = Math.floor(m / 60);
      timer.textContent = h > 0 ? `⏱ ${h}h ${m%60}m` : `⏱ ${m}m`;
    }
    update();
    setInterval(update, 30000);
  });
})();

/* ── 14b. Inject Help/Support & Safety links into every sidebar ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('a[href="help.html"]')) return;
  let moreUL = null;
  document.querySelectorAll('.sidebar-section-label').forEach(label => {
    if (label.textContent.trim() === 'More') {
      const nav = label.nextElementSibling;
      if (nav) moreUL = nav.querySelector('ul');
    }
  });
  if (!moreUL) return;
  const settingsLi = moreUL.querySelector('#settingsBtn')?.closest('li');
  const helpLi = document.createElement('li');
  helpLi.innerHTML = '<a href="help.html" class="sidebar-link"><span class="s-icon">❓</span><span class="s-label">Help / Support</span></a>';
  const safetyLi = document.createElement('li');
  safetyLi.innerHTML = '<a href="safety.html" class="sidebar-link"><span class="s-icon">🚨</span><span class="s-label">Safety</span></a>';
  moreUL.insertBefore(helpLi, settingsLi || null);
  moreUL.insertBefore(safetyLi, helpLi);
  if (window.location.pathname.endsWith('help.html'))   helpLi.querySelector('.sidebar-link').classList.add('active');
  if (window.location.pathname.endsWith('safety.html')) safetyLi.querySelector('.sidebar-link').classList.add('active');
});

/* ── 14. Right-Click Context Menu (game cards) ── */
(function(){
  let menu = null;

  function closeMenu() { menu?.remove(); menu = null; }

  document.addEventListener('contextmenu', e => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    e.preventDefault();
    closeMenu();

    const id    = card.dataset.gameId || '';
    const title = card.querySelector('.game-title, h3, strong, .card-title, .dg-game-title')?.textContent?.trim() || id;
    const thumb = card.querySelector('.card-thumb, .dg-thumb')?.textContent?.trim().slice(0,4) || '🎮';
    const genre = card.dataset.genre || 'action';

    menu = document.createElement('div');
    menu.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth-180)}px;top:${Math.min(e.clientY, window.innerHeight-160)}px;background:linear-gradient(160deg,#1c0b42,#130838);border:1px solid rgba(167,139,250,.25);border-radius:12px;padding:6px 0;min-width:170px;z-index:99999;box-shadow:0 16px 50px rgba(0,0,0,.7);animation:esr-in .15s ease`;

    const items = [
      { icon:'▶️', label:'Play Now',     action:()=>{ window.location.href=`game.html?id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}&thumb=${encodeURIComponent(thumb)}&genre=${encodeURIComponent(genre)}`; } },
      { icon:'♥',  label:'Favorite',     action:()=>{ const favs=JSON.parse(localStorage.getItem('eylox_favorites')||'[]'); if(!favs.includes(id)){favs.unshift(id);localStorage.setItem('eylox_favorites',JSON.stringify(favs));} } },
      { icon:'🔗', label:'Copy Link',    action:()=>{ navigator.clipboard?.writeText?.(location.origin+'/game.html?id='+id); } },
      { icon:'🤝', label:'Invite Friend',action:()=>{ location.href='friends.html'; } },
    ];

    menu.innerHTML = items.map(it => `
      <div class="ctx-item" style="display:flex;align-items:center;gap:10px;padding:9px 14px;font-size:.82rem;font-weight:700;color:#f0e8ff;cursor:pointer;transition:background .1s">
        <span>${it.icon}</span><span>${it.label}</span>
      </div>`).join('');

    if (!document.getElementById('ctx-style')) {
      const s = document.createElement('style');
      s.id = 'ctx-style';
      s.textContent = '.ctx-item:hover{background:rgba(167,139,250,.1)!important}';
      document.head.appendChild(s);
    }

    document.body.appendChild(menu);

    menu.querySelectorAll('.ctx-item').forEach((el, i) => {
      el.addEventListener('click', () => { items[i].action(); closeMenu(); });
    });
  });

  document.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();

/* ── 15. "Recently Played" dot on game cards ── */
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    function addRecentDots() {
      try {
        const rp = JSON.parse(localStorage.getItem('eylox_recently_played')||'[]');
        const recentIds = new Set(rp.map(g => g.id));
        document.querySelectorAll('.game-card').forEach(card => {
          if (card.querySelector('.recent-dot')) return;
          const id = card.dataset.gameId || '';
          if (!recentIds.has(id)) return;
          const dot = document.createElement('div');
          dot.className = 'recent-dot';
          dot.title = 'Recently played';
          dot.style.cssText = 'position:absolute;bottom:8px;left:8px;background:rgba(74,222,128,.9);border-radius:99px;padding:2px 8px;font-size:.58rem;font-weight:900;color:#052e16;z-index:3;pointer-events:none';
          dot.textContent = '▶ Played';
          card.style.position = 'relative';
          const thumb = card.querySelector('.card-thumb');
          if (thumb) thumb.appendChild(dot); else card.appendChild(dot);
        });
      } catch {}
    }
    addRecentDots();
    new MutationObserver(addRecentDots).observe(document.body,{childList:true,subtree:true});
  });
})();

/* ── 16. Recently Visited Pages breadcrumb (topbar) ── */
(function(){
  const NAV_KEY  = 'eylox_nav_history';
  const PAGE_NAMES = {
    'index.html':'Home','games.html':'Discover','friends.html':'Friends',
    'messages.html':'Messages','profile.html':'Profile','leaderboard.html':'Leaderboard',
    'achievements.html':'Achievements','communities.html':'Communities',
    'live-events.html':'Live Events','shop.html':'Shop',
    'youtube.html':'YouTube','ai.html':'Eylox Studio',
  };

  /* Record this page visit */
  const cur = location.pathname.split('/').pop() || 'index.html';
  if (PAGE_NAMES[cur]) {
    try {
      const hist = JSON.parse(localStorage.getItem(NAV_KEY)||'[]');
      const filtered = hist.filter(p => p.href !== cur);
      filtered.unshift({ href:cur, label:PAGE_NAMES[cur] });
      localStorage.setItem(NAV_KEY, JSON.stringify(filtered.slice(0,5)));
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].some(p => page.startsWith(p))) return;

    const hist = (() => { try { return JSON.parse(localStorage.getItem(NAV_KEY)||'[]'); } catch { return []; } })();
    const trail = hist.filter(p => p.href !== cur).slice(0, 3);
    if (trail.length < 2) return;

    const strip = document.createElement('div');
    strip.id = 'nav-breadcrumb';
    strip.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9990;display:flex;align-items:center;gap:4px;background:rgba(17,3,48,.88);border:1px solid rgba(167,139,250,.12);border-top:none;border-radius:0 0 12px 12px;padding:3px 14px;font-family:Nunito,sans-serif;font-size:.68rem;font-weight:800;color:rgba(157,142,199,.5)';
    trail.forEach((p, i) => {
      if (i > 0) { const sep = document.createElement('span'); sep.style.opacity = '.3'; sep.textContent = '›'; strip.appendChild(sep); }
      /* Validate href: only allow known page filenames (no javascript: or external URLs) */
      const safeHref = PAGE_NAMES[p.href] ? p.href : '#';
      const a = document.createElement('a');
      a.href = safeHref;
      a.style.cssText = 'color:rgba(157,142,199,.55);text-decoration:none;transition:color .15s';
      a.addEventListener('mouseover', () => { a.style.color = '#a78bfa'; });
      a.addEventListener('mouseout',  () => { a.style.color = 'rgba(157,142,199,.55)'; });
      a.textContent = PAGE_NAMES[p.href] || p.href; /* Use hardcoded label, not stored one */
      strip.appendChild(a);
    });
    document.body.appendChild(strip);
  });
})();

/* ── 17. "What's New" badge on sidebar nav items ── */
(function(){
  const NEW_ITEMS_KEY = 'eylox_seen_new';
  const NEW_PAGES = { 'youtube.html':'New!', 'ai.html':'New!', 'live-events.html':'🔴 Live' };

  document.addEventListener('DOMContentLoaded', () => {
    const seen = (() => { try { return JSON.parse(localStorage.getItem(NEW_ITEMS_KEY)||'[]'); } catch { return []; } })();
    document.querySelectorAll('.sidebar-link').forEach(a => {
      const href = (a.getAttribute('href')||'').split('/').pop();
      if (!NEW_PAGES[href] || seen.includes(href)) return;
      const badge = document.createElement('span');
      badge.textContent = NEW_PAGES[href];
      badge.style.cssText = 'margin-left:auto;font-size:.58rem;font-weight:900;background:rgba(239,68,68,.85);color:#fff;padding:1px 6px;border-radius:99px;flex-shrink:0';
      a.appendChild(badge);
      a.addEventListener('click', () => {
        const s = (() => { try { return JSON.parse(localStorage.getItem(NEW_ITEMS_KEY)||'[]'); } catch { return []; } })();
        if (!s.includes(href)) { s.push(href); localStorage.setItem(NEW_ITEMS_KEY, JSON.stringify(s)); }
        badge.remove();
      }, { once:true });
    });
  });
})();

/* ── 18. Coin rain on large coin grants ── */
(function(){
  if (!document.getElementById('coinrain-style')) {
    const s = document.createElement('style');
    s.id = 'coinrain-style';
    s.textContent = `
      @keyframes coinrain-fall {
        0%   { opacity:1; transform:translate(var(--rx), -60px) rotate(0deg); }
        100% { opacity:0; transform:translate(calc(var(--rx) + var(--drift)), 105vh) rotate(var(--spin)); }
      }
      .coinrain-p {
        position:fixed;top:0;pointer-events:none;z-index:99998;
        font-size:1.4rem;
        animation:coinrain-fall var(--dur) ease-in forwards;
      }
    `;
    document.head.appendChild(s);
  }

  function coinRain(count = 30) {
    const symbols = ['🪙','🪙','🪙','💰','⭐','✨'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'coinrain-p';
      const rx = Math.random() * window.innerWidth;
      const drift = (Math.random() - .5) * 120;
      const dur = (.8 + Math.random() * 1.4).toFixed(2) + 's';
      const spin = Math.round(Math.random() * 720 - 360) + 'deg';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.cssText = `left:0;--rx:${rx}px;--drift:${drift}px;--dur:${dur};--spin:${spin};animation-delay:${(i * 35).toFixed(0)}ms`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }
  }

  window.EyloxCoinRain = coinRain;

  /* Auto-trigger on coin storage change when gain is large */
  window.addEventListener('storage', e => {
    if (e.key !== 'eylox_user') return;
    try {
      const prev = JSON.parse(e.oldValue || 'null')?.coins || 0;
      const next = JSON.parse(e.newValue || 'null')?.coins || 0;
      if (next - prev >= 500) coinRain(Math.min(60, Math.floor((next - prev) / 20)));
    } catch {}
  });
})();

/* ── 19. Page-load welcome toast ── */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
      if (!u) return;
      const page = document.body?.dataset?.page || '';
      if (['login','landing'].some(p => page.startsWith(p))) return;
      const lastVisit = localStorage.getItem('eylox_last_visit');
      const now = Date.now();
      const key = 'eylox_last_visit';
      localStorage.setItem(key, now);
      if (!lastVisit) return;
      const diff = now - parseInt(lastVisit, 10);
      if (diff > 43200000) {
        /* Been more than 12 hours — show welcome back toast */
        setTimeout(() => {
          window.EyloxToast?.(`Welcome back, ${u.username}! 👋`, 'info', 3500);
        }, 1800);
      }
    } catch {}
  });
})();

/* ── 20. Konami Code easter egg ── */
(function(){
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let seq = [];
  document.addEventListener('keydown', e => {
    seq.push(e.key);
    if (seq.length > KONAMI.length) seq.shift();
    if (seq.join(',') !== KONAMI.join(',')) return;
    seq = [];

    /* Award 100 coins */
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user')||'null');
      if (u) { u.coins = Math.min((u.coins||0) + 100, 1e9); localStorage.setItem('eylox_user', JSON.stringify(u)); }
    } catch {}

    /* Coin rain */
    window.EyloxCoinRain?.(50);

    /* Toast */
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#1e0a48,#2a1560);border:2px solid rgba(167,139,250,.5);border-radius:24px;padding:32px 40px;text-align:center;z-index:99999;font-family:'Fredoka One',cursive;color:#f0e8ff;box-shadow:0 20px 80px rgba(0,0,0,.7),0 0 60px rgba(167,139,250,.3);animation:konami-pop .5s cubic-bezier(.34,1.56,.64,1) both`;
    if (!document.getElementById('konami-kf')) {
      const kf = document.createElement('style');
      kf.id = 'konami-kf';
      kf.textContent = `@keyframes konami-pop{from{opacity:0;transform:translate(-50%,-50%) scale(.5)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`;
      document.head.appendChild(kf);
    }
    el.innerHTML = `<div style="font-size:3rem;margin-bottom:10px">🎉</div><div style="font-size:1.4rem">Secret Unlocked!</div><div style="font-size:.9rem;font-family:Nunito,sans-serif;font-weight:700;color:#9d8ec7;margin-top:8px">+100 Eylux awarded</div>`;
    document.body.appendChild(el);
    el.addEventListener('click', () => el.remove());
    setTimeout(() => el?.remove(), 5000);
  });
})();

/* ── 21. Quick-Play FAB (last played game) ── */
(function(){
  const page = document.body?.dataset?.page || '';
  if (['login','landing','game','messages'].some(p => page.startsWith(p))) return;

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const rp = JSON.parse(localStorage.getItem('eylox_recently_played')||'[]');
      if (!rp.length) return;
      const last = rp[0];

      if (!document.getElementById('qp-fab-css')) {
        const s = document.createElement('style');
        s.id = 'qp-fab-css';
        s.textContent = `
          #qp-fab {
            position:fixed;bottom:100px;right:18px;z-index:9990;
            background:linear-gradient(135deg,#7c3aed,#a855f7);
            border:none;border-radius:99px;padding:10px 18px 10px 14px;
            display:flex;align-items:center;gap:8px;cursor:pointer;
            box-shadow:0 6px 28px rgba(124,58,237,.55);
            font-family:'Fredoka One',cursive;font-size:.82rem;color:#fff;
            transition:transform .18s,box-shadow .18s;
            animation:qpfab-in .5s cubic-bezier(.34,1.56,.64,1) .8s both;
          }
          #qp-fab:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 10px 40px rgba(124,58,237,.7)}
          #qp-fab .qpf-thumb{font-size:1.2rem;line-height:1}
          @keyframes qpfab-in{from{opacity:0;transform:translateX(80px)}to{opacity:1;transform:none}}
          #qp-fab-tooltip{
            position:absolute;right:calc(100% + 10px);top:50%;transform:translateY(-50%);
            background:#1a0840;border:1px solid rgba(167,139,250,.25);
            border-radius:10px;padding:6px 12px;white-space:nowrap;
            font-family:Nunito,sans-serif;font-size:.72rem;font-weight:800;color:#9d8ec7;
            pointer-events:none;opacity:0;transition:opacity .15s;
          }
          #qp-fab:hover #qp-fab-tooltip{opacity:1}
        `;
        document.head.appendChild(s);
      }

      const fab = document.createElement('button');
      fab.id = 'qp-fab';
      fab.setAttribute('aria-label', 'Quick Play: ' + last.title);
      fab.innerHTML = `
        <span class="qpf-thumb">${last.thumb || '🎮'}</span>
        <span>Quick Play</span>
        <div id="qp-fab-tooltip">Resume: ${last.title}</div>
      `;
      fab.addEventListener('click', () => {
        /* Route to 3D or 2D game */
        const id3d = { 'obby-world-3d':'game3d-obby.html','treasure-hunt-3d':'game3d-treasure.html','city-roleplay-3d':'game3d-city.html','pirate-bay-3d':'game3d-pirate.html' };
        const url = id3d[last.id] ? id3d[last.id] : `game.html?id=${last.id}&title=${encodeURIComponent(last.title)}&thumb=${encodeURIComponent(last.thumb||'🎮')}&genre=${encodeURIComponent(last.genre||'action')}`;
        window.location.href = url;
      });
      document.body.appendChild(fab);
    } catch {}
  });
})();

/* ── 22. Game card "server info" tooltip (Roblox-style) ── */
(function(){
  const page = document.body?.dataset?.page || '';
  if (['login','landing','game'].some(p => page.startsWith(p))) return;

  if (!document.getElementById('srv-tip-style')) {
    const s = document.createElement('style');
    s.id = 'srv-tip-style';
    s.textContent = `
      .srv-tip{position:fixed;z-index:99997;pointer-events:none;background:#0f0428;border:1px solid rgba(167,139,250,.3);border-radius:14px;padding:12px 16px;min-width:170px;max-width:230px;box-shadow:0 16px 50px rgba(0,0,0,.65);font-family:Nunito,sans-serif;font-size:.75rem;font-weight:700;color:#9d8ec7;animation:srv-tip-in .15s ease}
      @keyframes srv-tip-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      .srv-tip-title{font-family:'Fredoka One',cursive;font-size:.9rem;color:#f0e8ff;margin-bottom:6px}
      .srv-tip-row{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:.72rem}
    `;
    document.head.appendChild(s);
  }

  let tipEl = null, tipTimer = null;

  function getRecentPlayers(gameId) {
    try {
      const cutoff = Date.now() - 3600000;
      const sessions = JSON.parse(localStorage.getItem('eylox_game_sessions') || '[]');
      const players = [...new Set(sessions.filter(s => s.id === gameId && s.t >= cutoff).map(s => s.user))];
      return players.slice(0, 5);
    } catch { return []; }
  }

  function showTip(card, x, y) {
    removeTip();
    const id = card.dataset.gameId || '';
    const title = card.querySelector('.card-title, h3')?.textContent?.trim() || id;
    const players = getRecentPlayers(id);
    const total = (() => {
      try { return JSON.parse(localStorage.getItem('eylox_game_sessions')||'[]').filter(s=>s.id===id).length; } catch { return 0; }
    })();
    tipEl = document.createElement('div');
    tipEl.className = 'srv-tip';
    tipEl.innerHTML = `
      <div class="srv-tip-title">${title}</div>
      ${players.length ? `<div class="srv-tip-row">👥 Recent: ${players.map(p=>`<span style="color:#c4b5fd">${p}</span>`).join(', ')}</div>` : '<div class="srv-tip-row">No sessions yet this hour</div>'}
      <div class="srv-tip-row">🎮 Total plays: <span style="color:#a78bfa">${total}</span></div>
    `;
    tipEl.style.left = Math.min(x + 12, window.innerWidth - 250) + 'px';
    tipEl.style.top  = Math.min(y - 10, window.innerHeight - 160) + 'px';
    document.body.appendChild(tipEl);
  }

  function removeTip() {
    tipEl?.remove(); tipEl = null;
    clearTimeout(tipTimer);
  }

  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => showTip(card, e.clientX, e.clientY), 600);
  });
  document.addEventListener('mousemove', e => {
    if (tipEl) { tipEl.style.left = Math.min(e.clientX + 12, window.innerWidth - 250) + 'px'; tipEl.style.top = Math.min(e.clientY - 10, window.innerHeight - 160) + 'px'; }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('.game-card')) { clearTimeout(tipTimer); removeTip(); }
  });
})();

/* ── 23. Score history mini chart on profile/leaderboard ── */
(function(){
  const page = document.body?.dataset?.page || '';
  if (!['profile','leaderboard'].some(p => page.startsWith(p))) return;

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const entries = JSON.parse(localStorage.getItem('eylox_lb_entries') || '[]');
      if (entries.length < 2) return;
      // Last 10 scores across all games
      const last10 = entries.slice(-10).map(e => e.score);
      const max = Math.max(...last10);
      if (!max) return;
      const wrap = document.createElement('div');
      wrap.style.cssText = 'margin:16px 0;padding:12px 16px;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.12);border-radius:12px';
      wrap.innerHTML = `<div style="font-size:.7rem;font-weight:900;color:rgba(157,142,199,.6);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Recent Score History</div>
        <div style="display:flex;align-items:flex-end;gap:4px;height:48px">
          ${last10.map(v => {
            const pct = Math.round((v / max) * 100);
            return `<div style="flex:1;background:linear-gradient(180deg,#a78bfa,#7c3aed);border-radius:3px 3px 0 0;height:${pct}%;min-height:4px;transition:height .3s" title="${v.toLocaleString()} pts"></div>`;
          }).join('')}
        </div>`;
      const content = document.querySelector('.page-content, .main-area main');
      if (content) content.prepend(wrap);
    } catch {}
  });
})();

/* ── Global: Show profile picture in topbar avatar on every page ── */
(function(){
  const PROF_PIC_KEY = 'eylox_profile_pic';
  function applyTopbarPic() {
    const dataUrl = localStorage.getItem(PROF_PIC_KEY);
    const tbA = document.querySelector('.tb-avatar');
    if (!tbA) return;
    const dot = tbA.querySelector('.online-dot');
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || '{}');
      const emoji = u.avatar || '🎮';
      if (dataUrl) {
        tbA.innerHTML = `<img src="${dataUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`;
      } else {
        tbA.textContent = emoji;
      }
      if (dot) tbA.appendChild(dot);
    } catch {}
  }
  document.addEventListener('DOMContentLoaded', applyTopbarPic);
  /* Re-apply if another tab saves a new picture */
  window.addEventListener('storage', e => { if (e.key === PROF_PIC_KEY) applyTopbarPic(); });
})();
