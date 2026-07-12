/* ============================================================
   EYLOX — today-stats.js
   Tracks daily activity (coins earned, games played, platform
   time) and injects a "Your Today" widget on the home page.
   ============================================================ */
'use strict';

(function EyloxTodayStats() {
  const KEY   = 'eylox_today_stats';
  const today = new Date().toISOString().slice(0, 10);

  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; }
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  /* ── Init / reset ── */
  function init() {
    const u = getUser();
    if (!u) return;
    let d = load();
    if (d.date !== today) {
      d = {
        date:           today,
        startCoins:     u.coins || 0,
        gamesPlayed:    0,
        sessionMinutes: 0,
        sessionStart:   Date.now(),
      };
      save(d);
    } else if (!d.sessionStart) {
      d.sessionStart = Date.now();
      save(d);
    }
  }

  /* ── Session time tracking ── */
  function flushSession() {
    const d = load();
    if (d.date !== today || !d.sessionStart) return;
    const elapsed = Math.floor((Date.now() - d.sessionStart) / 60000);
    d.sessionMinutes = (d.sessionMinutes || 0) + elapsed;
    d.sessionStart   = Date.now();
    save(d);
  }

  /* Count recently-played entries from today */
  function countGamesToday() {
    try {
      const rp = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
      const midnight = new Date(today).getTime();
      return rp.filter(e => e.playedAt >= midnight).length;
    } catch { return 0; }
  }

  /* ── Build and inject "Your Today" widget ── */
  function injectWidget() {
    const page = document.body?.dataset?.page || '';
    if (page !== 'home') return;
    if (document.getElementById('today-stats-widget')) return;

    const u = getUser();
    if (!u) return;
    const d = load();
    if (d.date !== today) return;

    const coinsEarned = Math.max(0, (u.coins || 0) - (d.startCoins || u.coins || 0));
    const gamesPlayed = countGamesToday();
    flushSession();
    const minutes     = d.sessionMinutes || 0;

    /* Find an anchor element in the page */
    const welcome = document.querySelector('.welcome-banner');
    if (!welcome) return;

    const widget = document.createElement('div');
    widget.id = 'today-stats-widget';
    widget.style.cssText = `
      display:flex; gap:12px; flex-wrap:wrap; margin-bottom:28px;
      animation: tsw-in .5s cubic-bezier(.22,.61,.36,1) both;
    `;

    const items = [
      { icon:'💰', value: '+' + coinsEarned.toLocaleString(), label:'Coins Today',  color:'#fde68a', bg:'rgba(253,230,138,.1)', border:'rgba(253,230,138,.22)' },
      { icon:'🎮', value: gamesPlayed,                        label:'Games Played', color:'#a78bfa', bg:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.22)' },
      { icon:'⏱️', value: minutes < 60 ? minutes + 'm'
                        : Math.floor(minutes/60) + 'h ' + (minutes%60) + 'm',
                         label:'On Platform',  color:'#4fc3f7', bg:'rgba(79,195,247,.1)', border:'rgba(79,195,247,.22)' },
      { icon:'🔥', value: (() => { try { const dr = JSON.parse(localStorage.getItem('eylox_daily_rewards')||'{}'); return (dr.streak||0)+'d'; } catch { return '0d'; } })(),
                         label:'Streak',       color:'#fb923c', bg:'rgba(251,146,60,.1)', border:'rgba(251,146,60,.22)' },
    ];

    if (!document.getElementById('tsw-css')) {
      const s = document.createElement('style');
      s.id = 'tsw-css';
      s.textContent = `
        @keyframes tsw-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .tsw-card {
          flex:1; min-width:110px; background:var(--card); border-radius:16px;
          padding:14px 16px; display:flex; align-items:center; gap:10px;
          border:1px solid var(--border); transition:transform .2s, box-shadow .2s;
          cursor:default;
        }
        .tsw-card:hover { transform:translateY(-3px); }
        .tsw-icon { font-size:1.5rem; flex-shrink:0; }
        .tsw-val { font-family:'Fredoka One',cursive; font-size:1.25rem; line-height:1; }
        .tsw-lbl { font-size:.68rem; font-weight:800; color:var(--muted); margin-top:2px; letter-spacing:.3px; text-transform:uppercase; }
      `;
      document.head.appendChild(s);
    }

    widget.innerHTML = `
      <div style="width:100%;display:flex;align-items:center;justify-content:space-between;margin-bottom:-4px">
        <span style="font-size:.65rem;font-weight:900;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase">📊 Today's Activity</span>
        <span id="tsw-date" style="font-size:.65rem;font-weight:700;color:rgba(255,255,255,.25)">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}</span>
      </div>
      ${items.map((it, i) => `
        <div class="tsw-card" style="--border:${it.border};background:${it.bg};border-color:${it.border};animation-delay:${i*80}ms">
          <div class="tsw-icon">${it.icon}</div>
          <div>
            <div class="tsw-val" style="color:${it.color}">${it.value}</div>
            <div class="tsw-lbl">${it.label}</div>
          </div>
        </div>
      `).join('')}
    `;

    welcome.after(widget);
  }

  /* ── Count a game played ── */
  function trackGamePlay() {
    const d = load();
    if (d.date !== today) return;
    d.gamesPlayed = (d.gamesPlayed || 0) + 1;
    save(d);
  }
  window.EyloxTrackPlay = trackGamePlay;

  /* ── Boot ── */
  function boot() {
    init();
    injectWidget();
    /* Flush session time on tab hide / unload */
    document.addEventListener('visibilitychange', () => { if (document.hidden) flushSession(); });
    window.addEventListener('beforeunload', flushSession);
    /* Update widget every 60s (for time display) */
    setInterval(() => {
      const el = document.getElementById('today-stats-widget');
      if (el) { el.remove(); injectWidget(); }
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /* Update when coins change */
  window.addEventListener('storage', e => {
    if (e.key !== 'eylox_user') return;
    const el = document.getElementById('today-stats-widget');
    if (el) { el.remove(); injectWidget(); }
  });

})();
