/* ══════════════════════════════════════════════════
   EYLOX VERIFICATION SYSTEM  v1.0
   Verified: Creators, YouTubers, Developers,
   Famous Players — checkmark badges ✔️
══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const VER_KEY = 'eylox_verified_users';

  /* Badge type definitions */
  const BADGE_TYPES = {
    creator:   { label: 'Creator',       icon: '✔️',  color: '#a78bfa', border: 'rgba(167,139,250,.4)', bg: 'rgba(167,139,250,.12)' },
    youtuber:  { label: 'YouTuber',      icon: '📺',  color: '#f87171', border: 'rgba(248,113,113,.4)', bg: 'rgba(248,113,113,.12)' },
    developer: { label: 'Developer',     icon: '💻',  color: '#60a5fa', border: 'rgba(96,165,250,.4)',  bg: 'rgba(96,165,250,.12)'  },
    famous:    { label: 'Famous Player', icon: '🌟',  color: '#fbbf24', border: 'rgba(251,191,36,.4)',  bg: 'rgba(251,191,36,.12)'  },
  };

  /* ── Helpers ── */
  function getAll() {
    try { return JSON.parse(localStorage.getItem(VER_KEY) || '{}'); } catch { return {}; }
  }
  function saveAll(data) {
    localStorage.setItem(VER_KEY, JSON.stringify(data));
  }

  /* ── Public API ── */
  function isVerified(username) {
    if (!username) return null;
    return getAll()[username] || null;
  }

  function getBadgeHTML(username, opts) {
    const v = isVerified(username);
    if (!v) return '';
    const bt = BADGE_TYPES[v.type] || BADGE_TYPES.creator;
    const size   = (opts && opts.size) || '.62rem';
    const margin = (opts && opts.margin) || '5px';
    return `<span class="eylox-verify-badge" data-type="${v.type}" style="
      display:inline-flex;align-items:center;gap:3px;
      background:${bt.bg};color:${bt.color};
      border:1px solid ${bt.border};border-radius:99px;
      padding:1px 7px;font-size:${size};font-weight:900;
      margin-left:${margin};flex-shrink:0;white-space:nowrap;
      cursor:default;vertical-align:middle;
    " title="Verified ${bt.label} on Eylox">${bt.icon} ${bt.label}</span>`;
  }

  function grantBadge(username, type) {
    if (!username || !BADGE_TYPES[type]) return false;
    const all = getAll();
    all[username] = { type, grantedAt: Date.now() };
    saveAll(all);
    try { window.dispatchEvent(new CustomEvent('eylox:verified', { detail: { username, type } })); } catch {}
    return true;
  }

  function revokeBadge(username) {
    const all = getAll();
    if (!all[username]) return false;
    delete all[username];
    saveAll(all);
    return true;
  }

  function getCount() {
    return Object.keys(getAll()).length;
  }

  /* ── Auto-inject badges next to display names on current page ── */
  function injectBadges() {
    try {
      const all = getAll();
      const names = Object.keys(all);
      if (!names.length) return;
      /* Find all text nodes containing a verified username */
      document.querySelectorAll('[data-username]').forEach(el => {
        const uname = el.dataset.username;
        if (all[uname] && !el.querySelector('.eylox-verify-badge')) {
          el.insertAdjacentHTML('beforeend', getBadgeHTML(uname));
        }
      });
    } catch {}
  }

  window.EyloxVerify = {
    isVerified, getBadgeHTML, grantBadge, revokeBadge,
    getAll, getCount, BADGE_TYPES, injectBadges
  };

  /* Auto-inject when DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBadges);
  } else {
    setTimeout(injectBadges, 300);
  }

})();
