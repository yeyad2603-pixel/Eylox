/* ============================================================
   EYLOX — Offline Friends System
   Stores friends in localStorage so it works without a server
   ============================================================ */
'use strict';

const FRIENDS_KEY = 'eylox_friends';

/* ── Read / write helpers ── */
function getFriends() {
  try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch { return []; }
}
function saveFriends(list) {
  try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)); } catch {}
}
function addFriendLocal(username) {
  if (!username) return false;
  const list = getFriends();
  if (list.find(f => f.username.toLowerCase() === username.toLowerCase())) return 'exists';
  const me = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
  if (me && me.username.toLowerCase() === username.toLowerCase()) return 'self';
  const avatars = ['🎮','🚀','🌟','🐱','🦊','🐼','🐸','🦁','🐯','🐺'];
  list.push({ username, avatar: avatars[Math.floor(Math.random() * avatars.length)], addedAt: Date.now(), online: Math.random() > .5 });
  saveFriends(list);
  return true;
}
function removeFriendLocal(username) {
  saveFriends(getFriends().filter(f => f.username.toLowerCase() !== username.toLowerCase()));
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
    if (hdr) hdr.textContent = `👥 My Friends (${list.length})`;
    grid.innerHTML = list.map(f => `
      <div class="fl-friend-card" onclick="">
        <div style="position:relative;margin-bottom:4px">
          <div style="width:60px;height:60px;border-radius:50%;background:${cardGrad(f.username)};display:flex;align-items:center;justify-content:center;font-size:1.7rem;border:2px solid rgba(167,139,250,.25);box-shadow:0 4px 16px rgba(0,0,0,.3)">${f.avatar}</div>
          <div style="position:absolute;bottom:1px;right:1px;width:13px;height:13px;border-radius:50%;background:${f.online ? '#4ade80' : '#555'};border:2px solid var(--card);${f.online ? 'box-shadow:0 0 6px #4ade80' : ''}"></div>
        </div>
        <div style="font-family:'Fredoka One',cursive;font-size:.98rem;color:var(--text);line-height:1.2">${f.username}</div>
        <div style="font-size:.68rem;font-weight:800;color:${f.online ? '#4ade80' : 'var(--muted)'};letter-spacing:.3px">${f.online ? '● ONLINE' : '○ OFFLINE'}</div>
        <div style="display:flex;gap:6px;width:100%;margin-top:4px">
          <button onclick="inviteToGame('${f.username}')" class="fl-btn-invite">🎮 Invite</button>
          <button onclick="removeFriend('${f.username}')" class="fl-btn-remove">✕</button>
        </div>
      </div>`).join('');
  }

  /* Hide requests section — no pending requests system */
  if (reqList) reqList.closest('.section').style.display = 'none';

  renderFriendsGrid();

  /* Send request button */
  if (sendBtn && searchInput) {
    function doAdd() {
      const val = searchInput.value.trim();
      if (!val) { searchInput.focus(); return; }
      const result = addFriendLocal(val);
      if (result === true) {
        showFriendToast(`✅ ${val} added as friend!`, '#4ade80');
        searchInput.value = '';
        renderFriendsGrid();
        updateHomeFriends();
      } else if (result === 'exists') {
        showFriendToast(`⚠️ ${val} is already your friend.`, '#fde68a');
      } else if (result === 'self') {
        showFriendToast(`🙈 You can't add yourself!`, '#f472b6');
      } else {
        showFriendToast(`❌ Enter a valid username.`, '#f87171');
      }
    }
    sendBtn.addEventListener('click', doAdd);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
  }

  /* Global: remove friend */
  window.removeFriend = function(username) {
    if (!confirm(`Remove ${username} from friends?`)) return;
    removeFriendLocal(username);
    renderFriendsGrid();
    updateHomeFriends();
    showFriendToast(`Removed ${username}`, 'var(--muted)');
  };

  window.inviteToGame = function(username) {
    showFriendToast(`📨 Invite sent to ${username}!`, '#a78bfa');
  };
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

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initFriendsPage();
  updateHomeFriends(); /* also update home row if on home page */
});
