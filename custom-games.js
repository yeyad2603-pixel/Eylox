/* ============================================================
   EYLOX — Custom Games Injector
   Reads games published via EYLOX Studio (eylox_custom_games)
   and injects them into the games grid + index.html sections.
   ============================================================ */
'use strict';

(function () {
  const GAMES = (() => {
    try { return JSON.parse(localStorage.getItem('eylox_custom_games') || '[]'); }
    catch { return []; }
  })();

  if (!GAMES.length) return;

  /* Badge colour per reward type */
  const BADGE_STYLE = {
    coins:    'b-action',
    trophies: 'b-survival',
    both:     'b-racing',
  };
  const REWARD_ICON = { coins:'💰', trophies:'🏆', both:'💰🏆' };

  function buildCard(g) {
    const badge  = BADGE_STYLE[g.reward] || 'b-action';
    const reward = REWARD_ICON[g.reward] || '💰';
    return `
      <div class="game-card custom-game-card" data-game-id="${g.id}" style="position:relative;">
        <div class="card-thumb" style="background:linear-gradient(135deg,rgba(124,58,237,.4),rgba(236,72,153,.3));display:flex;align-items:center;justify-content:center;font-size:2.8rem;">${g.emoji || '🎮'}</div>
        <div class="card-body">
          <span class="card-badge ${badge}">${g.genre || 'action'}</span>
          <h3 class="card-title">${g.title}</h3>
          <div class="card-meta">👥 ${Number(g.players||0).toLocaleString()} <span class="dot"></span> ⭐ ${g.stars||'4.5'} <span class="dot"></span> ${reward}</div>
          <button class="btn-play" data-id="${g.id}" data-title="${g.title}" data-thumb="${g.emoji||'🎮'}" data-genre="${g.genre||'action'}" data-reward="${g.reward||'coins'}">▶ Play Now</button>
        </div>
        <div style="position:absolute;top:8px;right:8px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-family:'Fredoka One',cursive;font-size:.6rem;font-weight:900;padding:3px 8px;border-radius:99px;letter-spacing:.5px;box-shadow:0 2px 8px rgba(124,58,237,.5)">STUDIO</div>
      </div>`;
  }

  function inject() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;
    if (document.querySelector('.custom-games-injected')) return;

    /* Build a header row + the cards */
    const wrap = document.createElement('div');
    wrap.className = 'custom-games-injected';
    wrap.style.cssText = 'grid-column:1/-1;';
    wrap.innerHTML = `
      <div style="
        grid-column:1/-1;padding:14px 18px;margin-bottom:4px;
        background:linear-gradient(135deg,rgba(124,58,237,.18),rgba(236,72,153,.12));
        border:1px solid rgba(167,139,250,.25);border-radius:16px;
        display:flex;align-items:center;gap:10px;
      ">
        <span style="font-size:1.3rem">🛠️</span>
        <div>
          <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:#f0e8ff;">Studio Games</div>
          <div style="font-size:.73rem;font-weight:700;color:#9d8ec7;">${GAMES.length} game${GAMES.length!==1?'s':''} published by the owner</div>
        </div>
      </div>
    `;
    grid.prepend(wrap);

    /* Insert each custom game card before the first static card */
    const firstCard = grid.querySelector('.game-card:not(.custom-game-card)');
    GAMES.forEach(g => {
      const div = document.createElement('div');
      div.innerHTML = buildCard(g).trim();
      const card = div.firstChild;
      if (firstCard) {
        grid.insertBefore(card, firstCard);
      } else {
        grid.appendChild(card);
      }
    });
  }

  /* Also inject into index.html "Continue Playing" section */
  function injectContinue() {
    const grid = document.getElementById('continue-grid');
    if (!grid) return;
    if (grid.querySelector('.custom-game-card')) return;

    GAMES.slice(0, 2).forEach(g => {
      const div = document.createElement('div');
      div.innerHTML = buildCard(g).trim();
      grid.prepend(div.firstChild);
    });
  }

  /* Award coins/trophies when a custom game is played (game.html reads data-reward) */
  function hookCustomGameReward() {
    /* game.html picks up reward from URL param — handled there */
    /* Here we listen on the launch modal completion via btn-play data-reward */
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-play[data-reward]');
      if (!btn) return;
      const reward = btn.dataset.reward;
      const gameId = btn.dataset.id;
      if (!gameId || !gameId.startsWith('custom_')) return;

      /* Pass reward type through to game.html via sessionStorage */
      try {
        sessionStorage.setItem('eylox_custom_reward_' + gameId, reward);
      } catch {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { inject(); injectContinue(); hookCustomGameReward(); });
  } else {
    inject(); injectContinue(); hookCustomGameReward();
  }
})();