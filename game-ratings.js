/* ============================================================
   EYLOX — Game Ratings System
   Star ratings on game cards, stored in localStorage
   ============================================================ */
'use strict';

(function EyloxRatings() {

  const KEY = 'eylox_game_ratings';

  function getRatings() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }
  function saveRating(id, stars) {
    const r = getRatings();
    r[id] = stars;
    localStorage.setItem(KEY, JSON.stringify(r));
  }

  /* Deterministic "community" rating from game id so it looks real */
  function communityRating(id) {
    const h = (id||'').split('').reduce((a,c) => a + c.charCodeAt(0), 0);
    return (3.8 + ((h * 1664525 + 1013904223) & 0xffff) / 0xffff * 1.2).toFixed(1);
  }
  function communityCount(id) {
    const h = (id||'').split('').reduce((a,c) => a + c.charCodeAt(0), 0);
    return 100 + Math.abs(h % 4900);
  }

  function buildStars(rating, interactive, onRate) {
    const wrap = document.createElement('div');
    wrap.className = 'gr-stars';
    wrap.style.cssText = 'display:flex;align-items:center;gap:1px;cursor:' + (interactive ? 'pointer' : 'default');

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.dataset.val = i;
      const full  = i <= Math.floor(rating);
      const half  = !full && i - 0.5 <= rating;
      star.textContent = full ? '★' : half ? '½' : '☆';
      star.style.cssText = `font-size:.75rem;color:${full||half ? '#fbbf24' : 'rgba(157,142,199,.25)'};line-height:1;transition:transform .1s`;

      if (interactive) {
        star.addEventListener('mouseenter', () => {
          wrap.querySelectorAll('span').forEach((s, idx) => {
            s.textContent = idx < i ? '★' : '☆';
            s.style.color = idx < i ? '#fbbf24' : 'rgba(157,142,199,.25)';
            s.style.transform = idx < i ? 'scale(1.2)' : '';
          });
        });
        star.addEventListener('mouseleave', () => {
          wrap.querySelectorAll('span').forEach((s, idx) => {
            const v = +wrap.dataset.current || 0;
            const f = idx + 1 <= Math.floor(v);
            const h = !f && idx + 0.5 < v;
            s.textContent = f ? '★' : h ? '½' : '☆';
            s.style.color = f || h ? '#fbbf24' : 'rgba(157,142,199,.25)';
            s.style.transform = '';
          });
        });
        star.addEventListener('click', e => {
          e.stopPropagation();
          wrap.dataset.current = i;
          onRate(i);
          wrap.querySelectorAll('span').forEach((s, idx) => {
            s.textContent = idx < i ? '★' : '☆';
            s.style.color = idx < i ? '#fbbf24' : 'rgba(157,142,199,.25)';
          });
          /* Micro bounce */
          star.style.transform = 'scale(1.5)';
          setTimeout(() => { star.style.transform = ''; }, 200);
        });
      }
      wrap.appendChild(star);
    }
    wrap.dataset.current = rating;
    return wrap;
  }

  function addRatingToCard(card) {
    if (card.querySelector('.gr-wrap')) return;
    const id = card.dataset.gameId || '';
    if (!id) return;

    const userRatings = getRatings();
    const userRating  = userRatings[id] || 0;
    const comRating   = parseFloat(communityRating(id));
    const comCount    = communityCount(id);

    const wrap = document.createElement('div');
    wrap.className = 'gr-wrap';
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 0 0;flex-wrap:wrap';

    /* Community rating (read-only) */
    const comStars = buildStars(comRating, false, null);
    comStars.title = `Community rating: ${comRating}/5 (${comCount.toLocaleString()} votes)`;

    const comLabel = document.createElement('span');
    comLabel.style.cssText = 'font-size:.68rem;font-weight:800;color:rgba(157,142,199,.5)';
    comLabel.textContent = comRating + ' (' + (comCount >= 1000 ? (comCount/1000).toFixed(1)+'k' : comCount) + ')';

    wrap.appendChild(comStars);
    wrap.appendChild(comLabel);

    /* User's own rating (interactive) — shown on hover or after rating */
    const userWrap = document.createElement('div');
    userWrap.style.cssText = 'display:flex;align-items:center;gap:4px;opacity:0;transition:opacity .2s';
    userWrap.title = 'Your rating';

    const yourLabel = document.createElement('span');
    yourLabel.style.cssText = 'font-size:.62rem;font-weight:800;color:rgba(167,139,250,.5)';
    yourLabel.textContent = 'You:';

    const userStars = buildStars(userRating, true, (stars) => {
      saveRating(id, stars);
      userWrap.style.opacity = '1';
      window.EyloxSFX?.click?.();
    });

    userWrap.appendChild(yourLabel);
    userWrap.appendChild(userStars);
    wrap.appendChild(userWrap);

    if (userRating > 0) userWrap.style.opacity = '1';

    card.addEventListener('mouseenter', () => { userWrap.style.opacity = '1'; });
    card.addEventListener('mouseleave', () => { if (!getRatings()[id]) userWrap.style.opacity = '0'; });

    /* Inject at the bottom of the card info area */
    const infoArea = card.querySelector('.game-info, .game-details, .gc-info') || card;
    infoArea.appendChild(wrap);
  }

  function addRatingsToAll() {
    document.querySelectorAll('.game-card[data-game-id]').forEach(addRatingToCard);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addRatingsToAll();
    new MutationObserver(addRatingsToAll).observe(document.body, { childList:true, subtree:true });
  });

})();
