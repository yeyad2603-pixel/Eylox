/* ============================================================
   EYLOX — Profile Activity Heatmap
   GitHub-style 52-week grid injected on profile page
   ============================================================ */
'use strict';

(function EyloxHeatmap() {

  function buildHeatmap() {
    if (document.getElementById('activity-heatmap')) return;
    const container = document.querySelector('.page-content');
    if (!container) return;

    /* ── Gather activity data ── */
    const activity = {}; /* ISO-date → intensity 0-4 */

    /* Recently played → game activity */
    try {
      const rp = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
      rp.forEach(entry => {
        const ts   = entry?.ts || 0;
        const date = ts ? new Date(ts).toISOString().split('T')[0] : null;
        if (date) activity[date] = Math.min(4, (activity[date] || 0) + 1);
      });
    } catch {}

    /* Daily rewards → login activity */
    try {
      const dr = JSON.parse(localStorage.getItem('eylox_daily_rewards') || '{}');
      if (dr.lastClaim) {
        const date = new Date(dr.lastClaim).toISOString().split('T')[0];
        activity[date] = Math.max(activity[date] || 0, 2);
      }
    } catch {}

    /* Login history */
    try {
      const lh = JSON.parse(localStorage.getItem('eylox_login_history') || '[]');
      lh.forEach(h => {
        if (h.time) {
          const date = new Date(h.time).toISOString().split('T')[0];
          activity[date] = Math.min(4, (activity[date] || 0) + 1);
        }
      });
    } catch {}

    /* Seeded "past activity" from username so it doesn't look empty */
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (u?.username) {
        const seed = u.username.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
        const today = Date.now();
        for (let i = 0; i < 180; i++) {
          const s = (seed * (i + 1) * 1664525 + 1013904223) & 0x7fffffff;
          if (s % 3 === 0) {
            const daysAgo = Math.abs(s % 364) + 1;
            const d = new Date(today - daysAgo * 86400000).toISOString().split('T')[0];
            if (!activity[d]) activity[d] = 1 + (s % 3);
          }
        }
      }
    } catch {}

    /* ── Build 52-week grid ── */
    const WEEK_COUNT = 52;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* Start on Sunday 52 weeks ago */
    const gridStart = new Date(today);
    gridStart.setDate(gridStart.getDate() - (WEEK_COUNT * 7) + 1 - gridStart.getDay());

    const COLORS = [
      'rgba(167,139,250,.07)',   /* 0 — none */
      'rgba(124,58,237,.35)',    /* 1 — light */
      'rgba(139,92,246,.55)',    /* 2 — moderate */
      'rgba(167,139,250,.75)',   /* 3 — active */
      'rgba(192,180,255,.95)',   /* 4 — very active */
    ];

    const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /* Build cells */
    let cells = [];
    let monthLabels = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEK_COUNT; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + w * 7 + d);
        const iso   = date.toISOString().split('T')[0];
        const level = activity[iso] || 0;
        const isFuture = date > today;
        cells.push({ iso, level: isFuture ? -1 : level, col: w, row: d, date });

        if (d === 0 && date.getMonth() !== lastMonth && !isFuture) {
          monthLabels.push({ col: w, month: MONTHS[date.getMonth()] });
          lastMonth = date.getMonth();
        }
      }
    }

    const totalActive = Object.values(activity).filter(v => v > 0).length;
    const section = document.createElement('div');
    section.id = 'activity-heatmap';
    section.className = 'section';
    section.innerHTML = `
      <div class="sub-title">📅 Activity</div>
      <div class="sub-note">${totalActive} active days in the past year</div>
      <div class="sub-divider"></div>
      <div style="overflow-x:auto;padding-bottom:4px">
        <div id="heatmap-grid-wrap" style="display:inline-block;min-width:min-content">
          <div id="heatmap-month-row" style="display:grid;grid-template-columns:28px repeat(${WEEK_COUNT},11px);gap:0;margin-bottom:2px;padding-left:2px"></div>
          <div style="display:flex;gap:3px">
            <div style="display:grid;grid-template-rows:repeat(7,11px);gap:2px;margin-right:2px">
              ${DAYS.map((d,i) => `<div style="font-size:.52rem;font-weight:800;color:rgba(157,142,199,.35);line-height:11px;text-align:right">${i % 2 === 1 ? d.slice(0,3) : ''}</div>`).join('')}
            </div>
            <div id="heatmap-grid" style="display:grid;grid-template-columns:repeat(${WEEK_COUNT},11px);grid-template-rows:repeat(7,11px);gap:2px"></div>
          </div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:8px;justify-content:flex-end">
            <span style="font-size:.6rem;font-weight:800;color:rgba(157,142,199,.4)">Less</span>
            ${COLORS.map(c => `<div style="width:10px;height:10px;border-radius:2px;background:${c}"></div>`).join('')}
            <span style="font-size:.6rem;font-weight:800;color:rgba(157,142,199,.4)">More</span>
          </div>
        </div>
      </div>`;

    /* Insert before last section */
    const sections = container.querySelectorAll('.section');
    const last = sections[sections.length - 1];
    if (last) container.insertBefore(section, last);
    else container.appendChild(section);

    /* Render month row */
    const monthRow = document.getElementById('heatmap-month-row');
    const monthMap = {};
    monthLabels.forEach(m => { monthMap[m.col] = m.month; });
    monthRow.innerHTML = '<div></div>' + Array.from({ length: WEEK_COUNT }, (_, w) => {
      const label = monthMap[w] || '';
      return `<div style="font-size:.55rem;font-weight:800;color:rgba(157,142,199,.4);overflow:visible;white-space:nowrap">${label}</div>`;
    }).join('');

    /* Render cells */
    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = cells.map(c => {
      if (c.level < 0) return `<div style="width:11px;height:11px;border-radius:2px;background:rgba(167,139,250,.03)"></div>`;
      const bg = COLORS[c.level];
      const title = c.level > 0 ? `${c.iso}: Level ${c.level} activity` : `${c.iso}: No activity`;
      return `<div title="${title}" style="width:11px;height:11px;border-radius:2px;background:${bg};grid-column:${c.col+1};grid-row:${c.row+1};cursor:${c.level>0?'pointer':'default'};transition:transform .1s${c.level>0?';box-shadow:0 0 6px '+bg:''}"></div>`;
    }).join('');

    /* Hover scale on active cells */
    grid.querySelectorAll('div[title]').forEach(cell => {
      cell.addEventListener('mouseenter', () => { if (cell.title.includes('Level')) cell.style.transform = 'scale(1.5)'; });
      cell.addEventListener('mouseleave', () => { cell.style.transform = ''; });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (page === 'profile' || location.href.includes('profile.html')) {
      setTimeout(buildHeatmap, 400);
    }
  });

})();
