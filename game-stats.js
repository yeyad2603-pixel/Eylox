/* ============================================================
   EYLOX — Game Stats  (per-game play counts, total time, high scores)
   Renders a stats table on profile.html if data-page="profile"
   ============================================================ */
'use strict';

(function EyloxGameStats() {

  const STATS_KEY = 'eylox_game_stats';

  /* ── All known game IDs and labels ── */
  const GAME_LIST = [
    { id:'ninja-dash',       title:'Ninja Dash',      thumb:'🥷' },
    { id:'sky-riders',       title:'Sky Riders',      thumb:'🚀' },
    { id:'dragon-escape',    title:'Dragon Escape',   thumb:'🐉' },
    { id:'puzzle-palace',    title:'Puzzle Palace',   thumb:'🧩' },
    { id:'ocean-quest',      title:'Ocean Quest',     thumb:'🌊' },
    { id:'block-kingdom',    title:'Block Kingdom',   thumb:'🏰' },
    { id:'farm-friends',     title:'Farm Friends',    thumb:'🌻' },
    { id:'space-blaster',    title:'Space Blaster',   thumb:'🚀' },
    { id:'haunted-house',    title:'Haunted House',   thumb:'👻' },
    { id:'race-city',        title:'Race City',       thumb:'🏎️' },
    { id:'jungle-run',       title:'Jungle Run',      thumb:'🌴' },
    { id:'candy-chaos',      title:'Candy Chaos',     thumb:'🍭' },
    { id:'ice-fortress',     title:'Ice Fortress',    thumb:'❄️' },
    { id:'logic-lab',        title:'Logic Lab',       thumb:'🧪' },
    { id:'pirate-bay',       title:'Pirate Bay',      thumb:'⚓' },
    { id:'treasure-hunt',    title:'Treasure Hunt',   thumb:'💎' },
    { id:'obby-world-3d',    title:'Obby World 3D',   thumb:'🏃‍♂️' },
    { id:'treasure-hunt-3d', title:'Treasure Hunt 3D',thumb:'🗺️' },
    { id:'city-roleplay-3d', title:'City Roleplay 3D',thumb:'🏙️' },
    { id:'pirate-bay-3d',    title:'Pirate Bay 3D',   thumb:'🏴‍☠️' },
  ];

  /* ── Read / write stats ── */
  function getStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { return {}; }
  }

  /* Format seconds to readable time */
  function fmtTime(secs) {
    if (secs < 60)  return secs + 's';
    if (secs < 3600) return Math.floor(secs / 60) + 'm';
    return Math.floor(secs / 3600) + 'h ' + Math.floor((secs % 3600) / 60) + 'm';
  }

  /* Format big numbers */
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  /* ── Render stats table on profile page ── */
  function renderOnProfile() {
    const page = document.body?.dataset?.page || '';
    if (page !== 'profile') return;

    const stats = getStats();
    const played = GAME_LIST.filter(g => {
      const hs = +(localStorage.getItem('eylox_hs_' + g.id) || 0);
      const timeKey = 'eylox_gtime_' + g.id;
      const secs = +(localStorage.getItem(timeKey) || 0);
      return hs > 0 || secs > 0 || stats[g.id]?.plays > 0;
    });

    if (played.length === 0) return;

    // Find or create section
    let section = document.getElementById('game-stats-section');
    if (!section) {
      section = document.createElement('div');
      section.id = 'game-stats-section';
      section.className = 'section';
      const anchor = document.querySelector('.page-content .section');
      if (anchor) anchor.parentElement.insertBefore(section, anchor.nextSibling);
      else document.querySelector('.page-content')?.appendChild(section);
    }

    const rows = played.map(g => {
      const hs   = +(localStorage.getItem('eylox_hs_' + g.id) || 0);
      const secs = +(localStorage.getItem('eylox_gtime_' + g.id) || 0);
      return { ...g, hs, time: secs };
    }).sort((a, b) => b.hs - a.hs);

    section.innerHTML = `
      <div class="sub-title">📊 Game Stats</div>
      <div class="sub-note">Your personal records across all games</div>
      <div class="sub-divider"></div>
      <div id="gs-table-wrap" style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-family:'Nunito',sans-serif;font-size:.82rem">
          <thead>
            <tr style="border-bottom:1px solid rgba(167,139,250,.2);color:rgba(157,142,199,.6);font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.8px">
              <th style="text-align:left;padding:8px 10px">Game</th>
              <th style="text-align:right;padding:8px 10px">Best Score</th>
              <th style="text-align:right;padding:8px 10px">Time Played</th>
              <th style="text-align:center;padding:8px 10px">Medal</th>
            </tr>
          </thead>
          <tbody id="gs-tbody">
            ${rows.map((g, i) => `
              <tr style="border-bottom:1px solid rgba(167,139,250,.07);transition:background .12s" onmouseover="this.style.background='rgba(167,139,250,.06)'" onmouseout="this.style.background=''">
                <td style="padding:9px 10px;display:flex;align-items:center;gap:8px">
                  <span style="font-size:1.1rem">${g.thumb}</span>
                  <span style="font-weight:800;color:#f0e8ff">${g.title}</span>
                </td>
                <td style="text-align:right;padding:9px 10px;font-family:'Fredoka One',cursive;color:#fde68a;font-size:.92rem">
                  ${g.hs > 0 ? fmtNum(g.hs) : '<span style="opacity:.3">—</span>'}
                </td>
                <td style="text-align:right;padding:9px 10px;color:rgba(157,142,199,.7);font-weight:700">
                  ${g.time > 0 ? fmtTime(g.time) : '<span style="opacity:.3">—</span>'}
                </td>
                <td style="text-align:center;padding:9px 10px;font-size:1rem">
                  ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : g.hs > 0 ? '⭐' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:10px;font-size:.72rem;font-weight:700;color:rgba(157,142,199,.4);text-align:right">
        Total games: ${rows.length} · Total play time: ${fmtTime(rows.reduce((s, g) => s + g.time, 0))}
      </div>
    `;
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    renderOnProfile();
  });

  window.EyloxGameStats = { getStats, renderOnProfile };

})();
