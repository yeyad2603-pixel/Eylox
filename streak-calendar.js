/* ============================================================
   EYLOX — Streak Calendar
   Shows a 30-day login streak calendar on profile.html
   ============================================================ */
'use strict';

(function EyloxStreakCalendar() {

  const LOG_KEY = 'eylox_login_log';

  /* Record today's login */
  function recordToday() {
    try {
      const log   = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (!log.includes(today)) {
        log.push(today);
        // Keep last 90 days only
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const filtered = log.filter(d => new Date(d) >= cutoff);
        localStorage.setItem(LOG_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }

  function getLog() {
    try { return new Set(JSON.parse(localStorage.getItem(LOG_KEY) || '[]')); } catch { return new Set(); }
  }

  /* Compute current streak (consecutive days ending today or yesterday) */
  function calcStreak(log) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (log.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  /* ── Render on profile ── */
  function renderCalendar() {
    const page = document.body?.dataset?.page || '';
    if (page !== 'profile') return;

    const log    = getLog();
    const streak = calcStreak(log);
    const days   = 30;
    const today  = new Date();

    const cells = [];
    for (let i = days - 1; i >= 0; i--) {
      const d   = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ key, active: log.has(key), isToday: i === 0, label: d.getDate() });
    }

    let section = document.getElementById('streak-cal-section');
    if (!section) {
      section = document.createElement('div');
      section.id = 'streak-cal-section';
      section.className = 'section';
      const statsSection = document.getElementById('game-stats-section');
      if (statsSection) statsSection.parentElement.insertBefore(section, statsSection);
      else document.querySelector('.page-content')?.appendChild(section);
    }

    section.innerHTML = `
      <div class="sub-title">🔥 Login Streak</div>
      <div class="sub-note">Last 30 days — keep your streak alive!</div>
      <div class="sub-divider"></div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(245,158,11,.18),rgba(253,230,138,.08));border:1px solid rgba(245,158,11,.3);border-radius:14px;padding:10px 18px">
          <span style="font-size:2rem">🔥</span>
          <div>
            <div style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:#fde68a;line-height:1">${streak}</div>
            <div style="font-size:.72rem;font-weight:800;color:rgba(253,230,138,.6)">day streak</div>
          </div>
        </div>
        <div style="font-size:.8rem;font-weight:700;color:rgba(157,142,199,.6);max-width:200px">
          ${streak === 0 ? 'Log in every day to build your streak! 🎯'
          : streak < 7  ? `${7 - streak} more days until 🏅 Week Warrior!`
          : streak < 30 ? `${30 - streak} more days until 🏆 Monthly Master!`
          : '🏆 Monthly Master achieved!'}
        </div>
      </div>
      <div id="streak-grid" style="display:grid;grid-template-columns:repeat(10,1fr);gap:5px;max-width:360px">
        ${cells.map(c => `
          <div title="${c.key}" style="
            aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;
            font-size:.65rem;font-weight:800;
            ${c.active
              ? 'background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;box-shadow:0 2px 8px rgba(167,139,250,.35)'
              : 'background:rgba(167,139,250,.07);color:rgba(157,142,199,.4)'}
            ${c.isToday ? ';outline:2px solid #fde68a;outline-offset:2px' : ''}
          ">${c.active ? '✓' : c.label}</div>
        `).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:10px;font-size:.7rem;font-weight:700;color:rgba(157,142,199,.4)">
        <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,#7c3aed,#a78bfa)"></div> Logged in</div>
        <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(167,139,250,.12)"></div> Missed</div>
        <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:3px;outline:2px solid #fde68a"></div> Today</div>
      </div>
    `;
  }

  recordToday();

  document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
  });

  window.EyloxStreakCalendar = { calcStreak, getLog };

})();
