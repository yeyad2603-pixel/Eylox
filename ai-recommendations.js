/* ============================================================
   EYLOX — AI Recommended For You (index.html home page)
   The "🌟 Recommended For You" section (#recommended-grid) ships
   with a static curated list for brand-new players. Once a player
   has real play history, this swaps that list for genuinely
   personalized picks from window.EyloxAI — no fake stats, no
   invented data. Leaves the static list untouched when there's
   no real signal yet.
   ============================================================ */
'use strict';

(function EyloxAIRecommendations() {

  function load() {
    const heading = document.getElementById('rec-heading');
    const grid    = document.getElementById('recommended-grid');
    if (!heading || !grid || !window.EyloxAI) return;

    const picks = window.EyloxAI.Recommend.games(8);
    if (!picks.length) return; /* no real signal yet — keep the static curated list */

    heading.textContent = '🤖 Recommended For You';

    grid.innerHTML = picks.map(game => {
      const label = game.genre.charAt(0).toUpperCase() + game.genre.slice(1);
      return `<div class="game-card" data-game-id="${game.id}">
        <div class="card-thumb ${game.thumbClass}">${game.emoji}<div class="card-play-overlay">▶</div></div>
        <div class="card-body">
          <span class="card-badge ${game.badgeClass}">${label}</span>
          <h3 class="card-title">${game.name}</h3>
          <div class="card-meta">🤖 Because you play ${label}</div>
          <button class="btn-play" onclick="window.location.href='games.html?id=${game.id}'">▶ Play Now</button>
        </div>
      </div>`;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', load);

})();
