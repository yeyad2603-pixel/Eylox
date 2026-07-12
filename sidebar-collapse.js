/* ============================================================
   EYLOX — Sidebar Collapse Toggle
   Adds an icon-only collapse mode to the sidebar on every page.
   Tooltips on hover are handled by tooltip.js's existing
   href-based SELECTOR_TIPS map — this script only manages the
   collapsed/expanded state and its toggle button.
   ============================================================ */
'use strict';

(function EyloxSidebarCollapse() {
  const STORAGE_KEY = 'eylox_sidebar_collapsed';

  function applyState(sidebar, collapsed) {
    sidebar.classList.toggle('collapsed', collapsed);
    const btn = sidebar.querySelector('.sidebar-collapse-btn');
    if (!btn) return;
    btn.querySelector('.scb-icon').textContent = collapsed ? '»' : '«';
    btn.querySelector('.scb-label').textContent = collapsed ? 'Expand' : 'Collapse';
    btn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    btn.setAttribute('aria-expanded', String(!collapsed));
  }

  function injectToggle(sidebar) {
    if (sidebar.querySelector('.sidebar-collapse-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sidebar-collapse-btn';
    btn.innerHTML = '<span class="scb-icon">«</span><span class="scb-label">Collapse</span>';
    btn.addEventListener('click', () => {
      const collapsed = !sidebar.classList.contains('collapsed');
      applyState(sidebar, collapsed);
      try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch {}
    });

    /* Sits after the nav content, before the coin/trophy widgets if present */
    const coins = sidebar.querySelector('.sidebar-coins');
    if (coins) sidebar.insertBefore(btn, coins);
    else sidebar.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    injectToggle(sidebar);

    let collapsed = false;
    try { collapsed = localStorage.getItem(STORAGE_KEY) === '1'; } catch {}
    if (collapsed) applyState(sidebar, true);
  });
})();
