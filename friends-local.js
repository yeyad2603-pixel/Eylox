/* ============================================================
   EYLOX — Friends System
   Backed by the real /api/friends endpoints (backend/server.js).
   A localStorage cache is kept only so the UI has something to
   show instantly and while the server is unreachable.
   ============================================================ */
'use strict';

const FRIENDS_KEY = 'eylox_friends';
let _friendsCache = null; // in-memory, refreshed from the real backend

/* ── Read / write helpers (in-memory cache + localStorage fallback) ── */
function getFriends() {
  if (_friendsCache) return _friendsCache;
  try { _friendsCache = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch { _friendsCache = []; }
  return _friendsCache;
}
function setFriends(list) {
  _friendsCache = list;
  try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)); } catch {}
}

/* Pull the real friends list from the server (GET /api/friends). Falls back
   to whatever's cached locally if the server can't be reached. */
async function refreshFriends() {
  if (typeof request !== 'function') return getFriends(); // api.js not loaded
  const list = await request('GET', '/friends', null, true);
  if (Array.isArray(list)) setFriends(list);
  return getFriends();
}

/* Add a friend for real. Returns: true (added), 'exists', 'self',
   'offline' (server unreachable — nothing was persisted), or 'error'. */
async function addFriendLocal(username) {
  if (!username) return false;
  if (getFriends().find(f => f.username.toLowerCase() === username.toLowerCase())) return 'exists';
  if (typeof request !== 'function') return 'offline';
  try {
    const result = await request('POST', '/friends/' + encodeURIComponent(username), null, true);
    if (result === null) return 'offline';
    await refreshFriends();
    return true;
  } catch (err) {
    if (/cannot add yourself/i.test(err.message)) return 'self';
    if (/not found/i.test(err.message)) return 'notfound';
    return 'error';
  }
}

/* Remove a friend for real. Returns true on success, 'offline' if the
   server couldn't be reached (nothing was changed locally either). */
async function removeFriendLocal(username) {
  if (typeof request !== 'function') return 'offline';
  const result = await request('DELETE', '/friends/' + encodeURIComponent(username), null, true);
  if (result === null) return 'offline';
  await refreshFriends();
  return true;
}

/* ══════════════════════════════════════════════════════
   FRIENDS PAGE
══════════════════════════════════════════════════════ */
function initFriendsPage() {
  const grid    = document.getElementById('friend-cards-grid');
  const reqList = document.getElementById('req-list');
  const sendBtn = document.getElementById('sendFriendBtn');
  const searchInput = document.getElementById('friendSearchInput');

  if (!grid) return; /* Not on friends page */

  const CARD_GRADIENTS = [
    'linear-gradient(135deg,#7c3aed,#ec4899)',
    'linear-gradient(135deg,#0ea5e9,#6366f1)',
    'linear-gradient(135deg,#059669,#0ea5e9)',
    'linear-gradient(135deg,#d97706,#ef4444)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#ec4899,#f97316)',
  ];
  function cardGrad(name) { return CARD_GRADIENTS[Math.abs((name||'').charCodeAt(0)) % CARD_GRADIENTS.length]; }

  /* Render friends grid */
  function renderFriendsGrid() {
    const list = getFriends();
    const hdr = document.getElementById('friends-header');
    if (!list.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted)">
          <div style="font-size:3rem;margin-bottom:12px">👥</div>
          <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:var(--text);margin-bottom:6px">No friends yet!</div>
          <div style="font-size:.83rem;font-weight:700">Add someone using the search above 👆</div>
        </div>`;
      if (hdr) hdr.textContent = '👥 My Friends (0)';
      return;
    }
    const onlineCount = list.filter(f => f.online).length;
    if (hdr) hdr.textContent = `👥 My Friends (${list.length}) · 🟢 ${onlineCount} online`;

    grid.innerHTML = list.map(f => {
      const level = f.level || 1;
      return `
      <div class="fl-friend-card" data-username="${f.username}">
        <div style="position:relative;margin-bottom:4px">
          <div style="width:64px;height:64px;border-radius:50%;background:${cardGrad(f.username)};display:flex;align-items:center;justify-content:center;font-size:1.8rem;border:2px solid rgba(167,139,250,.25);box-shadow:0 4px 16px rgba(0,0,0,.3)">${f.avatar}</div>
          <div style="position:absolute;bottom:1px;right:1px;width:14px;height:14px;border-radius:50%;background:${f.online ? '#4ade80' : '#555'};border:2px solid var(--card);${f.online ? 'box-shadow:0 0 8px #4ade80' : ''}"></div>
        </div>
        <div style="font-family:'Fredoka One',cursive;font-size:.98rem;color:var(--text);line-height:1.2">${f.username}</div>
        <div style="font-size:.68rem;font-weight:800;color:${f.online ? '#4ade80' : 'var(--muted)'};letter-spacing:.3px">${f.online ? '● ONLINE' : '○ OFFLINE'}</div>
        <div style="background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:2px 10px;font-size:.68rem;font-weight:900;color:#a78bfa">Lv.${level}</div>
        <div style="display:flex;gap:6px;width:100%;margin-top:4px">
          <button onclick="inviteToGame('${f.username}')" class="fl-btn-invite">🎮 Invite</button>
          <button onclick="removeFriend('${f.username}')" class="fl-btn-remove">✕</button>
        </div>
      </div>`;
    }).join('');
  }

  /* Hide requests section — no pending requests system */
  if (reqList) reqList.closest('.section').style.display = 'none';

  window.renderFriendsGrid = renderFriendsGrid; // exposed so loadDiscoverPlayers() can refresh this page's grid
  renderFriendsGrid();
  renderActivityFeed();

  /* Top search bar filters friend cards */
  const topSearch = document.getElementById('friendsTopSearch');
  if (topSearch) {
    topSearch.addEventListener('input', () => {
      const q = topSearch.value.trim().toLowerCase();
      document.querySelectorAll('.fl-friend-card').forEach(card => {
        const name = card.dataset.username?.toLowerCase() || '';
        card.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
    });
  }

  /* Send request button */
  if (sendBtn && searchInput) {
    async function doAdd() {
      const val = searchInput.value.trim();
      if (!val) { searchInput.focus(); return; }
      sendBtn.disabled = true;
      const result = await addFriendLocal(val);
      sendBtn.disabled = false;
      if (result === true) {
        showFriendToast(`✅ ${val} added as friend!`, '#4ade80');
        searchInput.value = '';
        renderFriendsGrid();
        updateHomeFriends();
      } else if (result === 'exists') {
        showFriendToast(`⚠️ ${val} is already your friend.`, '#fde68a');
      } else if (result === 'self') {
        showFriendToast(`🙈 You can't add yourself!`, '#f472b6');
      } else if (result === 'notfound') {
        showFriendToast(`❌ No player named "${val}" exists.`, '#f87171');
      } else if (result === 'offline') {
        showFriendToast(`📡 Can't reach the server right now — try again shortly.`, '#f87171');
      } else {
        showFriendToast(`❌ Couldn't add ${val}.`, '#f87171');
      }
    }
    sendBtn.addEventListener('click', doAdd);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
  }

  /* Global: remove friend */
  window.removeFriend = async function(username) {
    if (!confirm(`Remove ${username} from friends?`)) return;
    const result = await removeFriendLocal(username);
    if (result === 'offline') {
      showFriendToast(`📡 Can't reach the server right now — try again shortly.`, '#f87171');
      return;
    }
    renderFriendsGrid();
    updateHomeFriends();
    showFriendToast(`Removed ${username}`, 'var(--muted)');
  };

  window.inviteToGame = function(username) {
    showFriendToast(`📨 Invite sent to ${username}!`, '#a78bfa');
  };
}

/* ══════════════════════════════════════════════════════
   FRIENDS ACTIVITY FEED
   There's no real per-friend event/activity backend yet, so rather
   than inventing trophies/streaks/levels that never happened, this
   just shows real, current online/offline status.
══════════════════════════════════════════════════════ */
function renderActivityFeed() {
  const feed = document.getElementById('friendActivityFeed');
  if (!feed) return;
  const list = getFriends();
  if (!list.length) {
    feed.innerHTML = `<div class="af-item" style="justify-content:center;color:var(--muted);font-size:.83rem;font-weight:700">Add friends to see their status here 👆</div>`;
    return;
  }
  const online = list.filter(f => f.online);
  if (!online.length) {
    feed.innerHTML = `<div class="af-item" style="justify-content:center;color:var(--muted);font-size:.83rem;font-weight:700">No friends online right now</div>`;
    return;
  }
  feed.innerHTML = online.map(f => `
    <div class="af-item">
      <div class="af-icon">🟢</div>
      <div class="af-text"><strong>${f.username}</strong> is online now</div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════
   HOME PAGE — friends row
══════════════════════════════════════════════════════ */
function updateHomeFriends() {
  const row = document.getElementById('friends-row');
  if (!row) return;
  const list = getFriends();
  const addPill = `<div class="friend-pill" style="cursor:pointer" onclick="window.location.href='friends.html'" title="Add friends">
    <div class="friend-pic add-friend-pic" style="font-size:1.3rem">➕</div>
    <span class="friend-name">Add</span>
  </div>`;
  if (!list.length) {
    /* No friends yet — show only the Add button */
    row.innerHTML = addPill;
    return;
  }
  row.innerHTML = list.slice(0, 6).map(f => {
    const gradients = [
      'linear-gradient(135deg,#7c3aed,#ec4899)',
      'linear-gradient(135deg,#0ea5e9,#6366f1)',
      'linear-gradient(135deg,#059669,#0ea5e9)',
      'linear-gradient(135deg,#d97706,#ef4444)',
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#ec4899,#f97316)',
    ];
    const grad = gradients[Math.abs(f.username.charCodeAt(0)) % gradients.length];
    return `
    <div class="friend-pill" title="${f.username}">
      <div class="friend-pic" style="background:${grad};font-size:1.1rem;position:relative">
        ${f.avatar}<span class="f-status ${f.online ? 'on' : 'off'}"></span>
      </div>
      <span class="friend-name">${f.username}</span>
    </div>`;
  }).join('') + addPill;
}

/* ── Toast helper ── */
function showFriendToast(msg, color) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--card,#130530);border:1px solid ${color};color:#fff;padding:10px 22px;border-radius:99px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.85rem;z-index:9999;animation:toastUp .3s ease both;white-space:nowrap;box-shadow:0 4px 24px rgba(0,0,0,.5)`;
  el.textContent = msg;
  if (!document.getElementById('ftStyle')) {
    const s = document.createElement('style');
    s.id = 'ftStyle';
    s.textContent = '@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(s);
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ══════════════════════════════════════════════════════
   DISCOVER PLAYERS — real users from backend or device
══════════════════════════════════════════════════════ */
async function loadDiscoverPlayers() {
  const section = document.getElementById('discoverSection');
  const list    = document.getElementById('discoverList');
  if (!section || !list) return;

  const me        = (() => { try { return JSON.parse(localStorage.getItem('eylox_user')||'null'); } catch { return null; } })();
  const myFriends = new Set(getFriends().map(f => f.username.toLowerCase()));
  let users = [];

  /* 1. Try backend API */
  try {
    const res = await fetch('http://localhost:3001/api/users');
    if (res.ok) {
      const data = await res.json();
      users = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
    }
  } catch { /* backend offline */ }

  /* 2. Fallback: other accounts registered on this device */
  if (!users.length) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('eylox_userdata_')) {
        try {
          const u = JSON.parse(localStorage.getItem(key));
          if (u?.username) users.push(u);
        } catch {}
      }
    }
  }

  /* Filter: not self, not already friend */
  users = users.filter(u =>
    u?.username &&
    u.username.toLowerCase() !== (me?.username || '').toLowerCase() &&
    !myFriends.has(u.username.toLowerCase())
  ).slice(0, 6);

  if (!users.length) { section.style.display = 'none'; return; }

  const GRADS = [
    'linear-gradient(135deg,#7c3aed,#ec4899)',
    'linear-gradient(135deg,#0ea5e9,#6366f1)',
    'linear-gradient(135deg,#059669,#0ea5e9)',
    'linear-gradient(135deg,#d97706,#ef4444)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
  ];
  const pickGrad = n => GRADS[Math.abs((n||'').charCodeAt(0)||0) % GRADS.length];

  section.style.display = '';
  list.innerHTML = users.map(u => {
    const av = u.avatar || u.username?.[0]?.toUpperCase() || '🎮';
    const lv = Math.floor((u.coins||0) / 500) + 1;
    return `
    <div style="display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid rgba(167,139,250,.15);border-radius:14px;padding:12px 16px;transition:border-color .2s" onmouseover="this.style.borderColor='rgba(167,139,250,.4)'" onmouseout="this.style.borderColor='rgba(167,139,250,.15)'">
      <div style="width:44px;height:44px;border-radius:50%;background:${pickGrad(u.username)};display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${av}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--text)">${u.username}</div>
        <div style="font-size:.7rem;font-weight:800;color:var(--muted);margin-top:1px">Lv.${lv} · 🏆 ${u.wins||0} wins</div>
      </div>
      <button data-discover-add="${u.username}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;border-radius:99px;padding:7px 16px;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:.78rem;cursor:pointer;flex-shrink:0">+ Add</button>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-discover-add]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uname = btn.dataset.discoverAdd;
      btn.disabled = true;
      const result = await addFriendLocal(uname);
      btn.disabled = false;
      if (result === true || result === 'exists') {
        btn.textContent = '✅ Added';
        btn.style.background = 'linear-gradient(135deg,#16a34a,#4ade80)';
        btn.style.pointerEvents = 'none';
        if (result === true) {
          updateHomeFriends();
          showFriendToast(`✅ ${uname} added!`, '#4ade80');
          if (typeof renderFriendsGrid === 'function') renderFriendsGrid();
        }
      } else if (result === 'offline') {
        showFriendToast(`📡 Can't reach the server right now.`, '#f87171');
      } else {
        showFriendToast(`❌ Couldn't add ${uname}.`, '#f87171');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   HOVER MINI-PROFILE CARD
══════════════════════════════════════════════════════ */
(function(){
  let card = null, hideTimer = null;

  if (!document.getElementById('mpc-style')) {
    const s = document.createElement('style');
    s.id = 'mpc-style';
    s.textContent = `
      #friendMiniCard{position:fixed;z-index:99997;background:linear-gradient(160deg,#1c0b42,#130838);border:1px solid rgba(167,139,250,.3);border-radius:16px;padding:16px;width:220px;box-shadow:0 20px 60px rgba(0,0,0,.7);pointer-events:none;animation:mpc-in .18s ease}
      @keyframes mpc-in{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
      #friendMiniCard .mpc-name{font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff;margin-bottom:2px}
      #friendMiniCard .mpc-handle{font-size:.68rem;font-weight:800;color:rgba(157,142,199,.5);margin-bottom:8px}
      #friendMiniCard .mpc-row{display:flex;justify-content:space-around;gap:6px;margin-top:8px}
      #friendMiniCard .mpc-stat{text-align:center}
      #friendMiniCard .mpc-stat-num{font-family:'Fredoka One',cursive;font-size:.9rem;color:#a78bfa}
      #friendMiniCard .mpc-stat-lbl{font-size:.6rem;font-weight:800;color:rgba(157,142,199,.5)}
    `;
    document.head.appendChild(s);
  }

  function showCard(f, anchorEl) {
    removeCard();
    const level = f.level || 1;

    card = document.createElement('div');
    card.id = 'friendMiniCard';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;position:relative">
          ${f.avatar||'🎮'}
          <div style="position:absolute;bottom:0;right:0;width:11px;height:11px;border-radius:50%;background:${f.online?'#4ade80':'#555'};border:2px solid #1c0b42"></div>
        </div>
        <div>
          <div class="mpc-name">${f.username}</div>
          <div class="mpc-handle">${f.online?'🟢 Online now':'⚫ Offline'}</div>
        </div>
      </div>
      <div style="background:rgba(167,139,250,.08);border-radius:8px;padding:4px 8px;font-size:.72rem;font-weight:900;color:#a78bfa;text-align:center">Lv.${level} Eylox Player</div>`;

    document.body.appendChild(card);

    /* Position near anchor */
    const rect = anchorEl.getBoundingClientRect();
    let left = rect.right + 10;
    let top  = rect.top;
    if (left + 230 > window.innerWidth) left = rect.left - 230;
    if (top  + 160 > window.innerHeight) top = window.innerHeight - 170;
    card.style.left = Math.max(8, left) + 'px';
    card.style.top  = Math.max(8, top)  + 'px';
  }

  function removeCard() {
    card?.remove();
    card = null;
  }

  document.addEventListener('mouseover', e => {
    const fc = e.target.closest('.fl-friend-card, .friend-pill');
    if (!fc) return;
    const uname = fc.dataset.username || fc.title;
    if (!uname) return;
    const list = getFriends();
    const f = list.find(x => x.username === uname);
    if (!f) return;
    clearTimeout(hideTimer);
    showCard(f, fc);
  });

  document.addEventListener('mouseout', e => {
    const fc = e.target.closest('.fl-friend-card, .friend-pill');
    if (!fc) return;
    hideTimer = setTimeout(removeCard, 200);
  });
})();

/* ── Init ──
   Render immediately from whatever's cached locally (instant paint),
   then refresh from the real backend and re-render with live data. */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { initFriendsPage(); }, 600);
  loadDiscoverPlayers();
  updateHomeFriends();

  refreshFriends().then(() => {
    if (typeof window.renderFriendsGrid === 'function') window.renderFriendsGrid();
    updateHomeFriends();
  });
});
