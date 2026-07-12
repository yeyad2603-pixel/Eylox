/* ============================================================
   EYLOX — Sidebar Library Links Injector
   Adds My Games / Dev Hub / Inventory to every page's sidebar
   "More" section, right after Shop. Mirrors quick-access.js's
   injection pattern so no page's sidebar HTML needs hand-editing.
   ============================================================ */
'use strict';

(function injectLibraryLinks() {
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (sidebar.querySelector('a[href="my-games.html"]')) return; // already present

    const page = document.body.dataset.page || '';

    const items = [
      { href: 'my-games.html', icon: '📚', label: 'My Games', page: 'my-games' },
      { href: 'dev-hub.html',  icon: '🛠️', label: 'Dev Hub',  page: 'dev-hub' },
      { href: 'inventory.html', icon: '🎒', label: 'Inventory', page: 'inventory' },
    ];

    const lis = items.map(item => {
      const active = page === item.page;
      return `<li><a href="${item.href}" class="sidebar-link${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}><span class="s-icon">${item.icon}</span><span class="s-label">${item.label}</span></a></li>`;
    }).join('');

    const shopLink = sidebar.querySelector('a[href="shop.html"]');
    const shopLi = shopLink ? shopLink.closest('li') : null;

    if (shopLi && shopLi.parentElement) {
      shopLi.insertAdjacentHTML('afterend', lis);
      return;
    }

    /* Fallback: prepend to the "More" section's list */
    const labels = [...sidebar.querySelectorAll('.sidebar-section-label')];
    const moreLabel = labels.find(el => el.textContent.trim() === 'More');
    const moreList = moreLabel && moreLabel.nextElementSibling
      ? moreLabel.nextElementSibling.querySelector('ul')
      : null;
    if (moreList) moreList.insertAdjacentHTML('afterbegin', lis);
  });
})();
