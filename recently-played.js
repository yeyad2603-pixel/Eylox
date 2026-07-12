/* ============================================================
   EYLOX — Recently Played Section (games.html)
   ============================================================ */
'use strict';

(function EyloxRecentlyPlayed() {

  const GAME_DATA = {
    'ninja-dash':    { title:'Ninja Dash',    emoji:'🥷💨', genre:'Action',    bg:'t-purple', badge:'b-action' },
    'sky-riders':    { title:'Sky Riders',    emoji:'🚀✨', genre:'Racing',    bg:'t-blue',   badge:'b-racing' },
    'dragon-escape': { title:'Dragon Escape', emoji:'🐉🔥', genre:'Survival',  bg:'t-pink',   badge:'b-survival' },
    'puzzle-palace': { title:'Puzzle Palace', emoji:'🧩👻', genre:'Puzzle',    bg:'t-green',  badge:'b-puzzle' },
    'ocean-quest':   { title:'Ocean Quest',   emoji:'🤿🐠', genre:'Adventure', bg:'t-teal',   badge:'b-adventure' },
    'block-kingdom': { title:'Block Kingdom', emoji:'🏰👑', genre:'Building',  bg:'t-yellow', badge:'b-building' },
    'farm-friends':  { title:'Farm Friends',  emoji:'🌻🐮', genre:'Roleplay',  bg:'t-indigo', badge:'b-roleplay' },
    'space-blaster': { title:'Space Blaster', emoji:'🛸⭐', genre:'Action',    bg:'t-purple', badge:'b-action' },
    'haunted-house': { title:'Haunted House', emoji:'👻🏚️', genre:'Survival',  bg:'t-pink',   badge:'b-survival' },
    'race-city':     { title:'Race City',     emoji:'🏎️🛣️', genre:'Racing',   bg:'t-yellow', badge:'b-racing' },
    'jungle-run':    { title:'Jungle Run',    emoji:'🌿🏃', genre:'Adventure', bg:'t-green',  badge:'b-adventure' },
    'candy-chaos':   { title:'Candy Chaos',   emoji:'🍬🎪', genre:'Action',    bg:'t-pink',   badge:'b-action' },
    'ice-fortress':  { title:'Ice Fortress',  emoji:'🧊❄️', genre:'Building',  bg:'t-blue',   badge:'b-building' },
    'logic-lab':     { title:'Logic Lab',     emoji:'🔬💡', genre:'Puzzle',    bg:'t-teal',   badge:'b-puzzle' },
    'pirate-bay':    { title:'Pirate Bay',    emoji:'☠️⚓',  genre:'Adventure', bg:'t-yellow', badge:'b-adventure' },
    'treasure-hunt': { title:'Treasure Hunt', emoji:'💎🗺️', genre:'Adventure', bg:'t-teal',   badge:'b-adventure' },
    'obby-world':    { title:'Obby World 3D', emoji:'🏃🌈', genre:'3D Obby',   bg:'t-purple', badge:'b-action' },
  };

  function load() {
    const section = document.getElementById('recentlyPlayedSection');
    const grid    = document.getElementById('recentlyPlayedGrid');
    if (!section || !grid) return;

    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]'); } catch {}

    if (!Array.isArray(recent) || !recent.length) return;

    /* Deduplicate, cap at 6 */
    const seen = new Set();
    const unique = recent.filter(entry => {
      const id = entry?.id || String(entry);
      if (seen.has(id)) return false;
      seen.add(id); return true;
    }).slice(0, 6);

    if (!unique.length) return;

    section.style.display = '';

    grid.innerHTML = unique.map(entry => {
      const id = entry?.id || String(entry);
      const g  = GAME_DATA[id] || {
        title: entry?.title || id,
        emoji: '🎮', genre: 'Game', bg: 't-purple', badge: 'b-action',
      };
      return `<div class="game-card" data-game-id="${id}">
        <div class="card-thumb ${g.bg}">${g.emoji}</div>
        <div class="card-body">
          <span class="card-badge ${g.badge}">${g.genre}</span>
          <h3 class="card-title">${g.title}</h3>
          <div class="card-meta">🕐 Recently played</div>
          <button class="btn-play" data-id="${id}" data-title="${g.title}" data-thumb="${g.emoji}">▶ Continue</button>
        </div>
      </div>`;
    }).join('');

    /* Wire play buttons */
    grid.querySelectorAll('.btn-play').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window.openGameModal === 'function') {
          window.openGameModal(btn.dataset.id, btn.dataset.title, btn.dataset.thumb, '');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', load);

})();
