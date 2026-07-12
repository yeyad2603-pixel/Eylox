/* ============================================================
   EYLOX — Quick Access Sidebar Injector
   Adds the ⚡ Quick Access section to every page's sidebar.
   index.html has it in HTML already; this covers all others.
   ============================================================ */
'use strict';

(function injectQuickAccess() {
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    /* Skip if Quick Access already present (index.html) */
    if (sidebar.querySelector('.sb-qa-injected')) return;

    const page = document.body.dataset.page || '';

    /* Find insertion point: the divider just before the "More" section label */
    const labels = [...sidebar.querySelectorAll('.sidebar-section-label')];
    const moreLabel = labels.find(el => el.textContent.trim() === 'More');
    if (!moreLabel) return;

    /* Build the section */
    const wrap = document.createElement('div');
    wrap.className = 'sb-qa-injected';

    /* On non-home pages, "scroll" actions become navigation to index.html */
    const isHome = page === 'home';
    const isLB   = page === 'leaderboard';
    const isGames = page === 'games';

    wrap.innerHTML = `
      <div class="sidebar-divider"></div>
      <p class="sidebar-section-label">⚡ Quick Access</p>
      <nav class="sidebar-nav"><ul>
        <li><button class="sidebar-link sb-action" onclick="sbQuickPlay()"><span class="s-icon">🎲</span><span class="s-label">Random Game</span></button></li>
        <li><a href="${isHome ? '#' : 'index.html'}" class="sidebar-link" onclick="${isHome ? "document.getElementById('dailyMissionsCard')?.scrollIntoView({behavior:'smooth'});return false;" : ''}"><span class="s-icon">🎯</span><span class="s-label">Daily Missions</span><span class="s-badge" id="sb-qa-missions-badge" style="display:none">!</span></a></li>
        <li><a href="${isHome ? '#' : 'index.html'}" class="sidebar-link" onclick="${isHome ? "document.getElementById('seasonPassCard')?.scrollIntoView({behavior:'smooth'});return false;" : ''}"><span class="s-icon">🏅</span><span class="s-label">Season Pass</span></a></li>
        <li><a href="${isHome ? '#' : 'index.html'}" class="sidebar-link" onclick="${isHome ? "document.querySelector('.clan-wars-section')?.scrollIntoView({behavior:'smooth'});return false;" : ''}"><span class="s-icon">⚔️</span><span class="s-label">Clan Wars</span></a></li>
      </ul></nav>`;

    /* Insert before the divider that precedes "More" */
    const dividerBeforeMore = moreLabel.previousElementSibling;
    sidebar.insertBefore(wrap, dividerBeforeMore || moreLabel);

    /* Missions badge */
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      const badge = document.getElementById('sb-qa-missions-badge');
      if (badge && u && (u.gamesPlayed || 0) < 3) badge.style.display = 'inline';
    } catch {}
  });
})();

/* ── Random game picker (works on any page) ── */
window.sbQuickPlay = function () {
  /* Try to find game cards on this page first */
  const cards = Array.from(document.querySelectorAll('.game-card, [data-game-id]'));
  if (cards.length > 0) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.outline = '3px solid #a78bfa';
    card.style.transition = 'outline .2s';
    setTimeout(() => { card.style.outline = ''; }, 1800);
    const btn = card.querySelector('button, a[href]');
    if (btn) setTimeout(() => btn.click(), 500);
    return;
  }
  /* Otherwise go to games page and let it pick */
  window.location.href = 'games.html?random=1';
};
