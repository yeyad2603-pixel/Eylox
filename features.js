/* ============================================================
   EYLOX — features.js  (Milestone 5 — Live Data)
   Loads real data from the backend API for each page.
   Falls back gracefully when the server is offline.
   ============================================================ */
'use strict';

/* ── Theme mappings ── */
const GENRE_COLOR = {
  adventure: 't-blue',
  action:    't-purple',
  puzzle:    't-green',
  racing:    't-yellow',
  building:  't-teal',
  survival:  't-pink',
  roleplay:  't-indigo',
};
const GENRE_BADGE = {
  adventure: 'b-adventure',
  action:    'b-action',
  puzzle:    'b-puzzle',
  racing:    'b-racing',
  building:  'b-building',
  survival:  'b-survival',
  roleplay:  'b-roleplay',
};
const AVATAR_OPTIONS = [
  '🎮','🚀','🌟','🏆','🎯','🐱','🦊','🐼','🐸','🦋',
  '🐉','🦁','🐬','🐯','🦜','🧙','🦸','🤖','👾','🎃',
  '🦄','🐙','🐺','🦅','🐧','🍀','⚡','🔥','🌈','💎',
];
const GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#ec4899)',
  'linear-gradient(135deg,#0ea5e9,#6366f1)',
  'linear-gradient(135deg,#059669,#0ea5e9)',
  'linear-gradient(135deg,#d97706,#f43f5e)',
  'linear-gradient(135deg,#db2777,#9333ea)',
  'linear-gradient(135deg,#0d9488,#3b82f6)',
  'linear-gradient(135deg,#7c3aed,#0ea5e9)',
  'linear-gradient(135deg,#f43f5e,#d97706)',
];

/* ── Utility helpers ── */
function esc(s) {
  return (s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
function fmtNum(n = 0) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function gradientFor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

/* ── Build a game card HTML string ── */
function buildGameCard(game, btnLabel = '▶ Play Now') {
  const color  = GENRE_COLOR[game.genre] || 't-blue';
  const badge  = GENRE_BADGE[game.genre] || 'b-adventure';
  const newTag = game.isNew ? '<span class="card-new-tag">NEW</span>' : '';
  return `
    <div class="game-card" data-game-id="${game._id}">
      <div class="card-thumb ${color}">${esc(game.thumbnail)}${newTag}</div>
      <div class="card-body">
        <span class="card-badge ${badge}">${cap(game.genre)}</span>
        <h3 class="card-title">${esc(game.title)}</h3>
        <div class="card-meta">👥 ${fmtNum(game.players)} <span class="dot"></span> ⭐ ${(game.rating || 4).toFixed(1)}</div>
        <button class="btn-play" data-id="${game._id}" data-title="${esc(game.title)}" data-thumb="${esc(game.thumbnail)}" data-genre="${game.genre || 'action'}">
          ${btnLabel}
        </button>
      </div>
    </div>`;
}

/* ── Build a friend request card HTML string ── */
function buildReqCard(req) {
  const from   = req.from || {};
  const name   = esc(from.username || 'Unknown');
  const avatar = esc(from.avatar   || '🎮');
  return `
    <div class="req-card" data-req-id="${req._id}">
      <div class="req-pic" style="background:${gradientFor(name)}">${avatar}</div>
      <div class="req-info">
        <div class="req-name">${name}</div>
        <div class="req-meta">Sent you a friend request</div>
      </div>
      <div class="req-actions">
        <button class="btn-accept" data-req-id="${req._id}" data-from="${name}">✅ Accept</button>
        <button class="btn-decline" data-req-id="${req._id}">✕ Decline</button>
      </div>
    </div>`;
}

/* ── Build a friend card HTML string ── */
function buildFriendCard(user) {
  const name   = esc(user.username || 'Player');
  const avatar = esc(user.avatar   || '🎮');
  const cls    = user.isOnline ? 'on' : 'off';
  const label  = user.isOnline ? '● Online' : '● Offline';
  return `
    <div class="friend-card" data-friend-id="${user._id}">
      <div class="fc-pic" style="background:${gradientFor(name)}">${avatar}<span class="fc-status ${cls}"></span></div>
      <div class="fc-name">${name}</div>
      <div class="fc-handle">@${name.toLowerCase()}_eylox</div>
      <div class="fc-stat-label ${cls}">${label}</div>
      <div class="fc-actions">
        <a href="#" class="fc-btn fc-invite">▶ Invite</a>
        <a href="#" class="fc-btn fc-remove" data-friend-id="${user._id}" data-name="${name}">✕</a>
      </div>
    </div>`;
}

/* ── Build a friend pill for the home page ── */
function buildFriendPill(user) {
  const name   = esc(user.username || 'Player');
  const avatar = esc(user.avatar   || '🎮');
  const cls    = user.isOnline ? 'on' : 'off';
  return `
    <div class="friend-pill">
      <div class="friend-pic" style="background:${gradientFor(name)}">${avatar}<span class="f-status ${cls}"></span></div>
      <span class="friend-name">${name}</span>
    </div>`;
}

/* ── Loading skeleton rows ── */
function renderSkeletons(container, count = 8) {
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="game-card skeleton-card">
      <div class="card-thumb skeleton-thumb"></div>
      <div class="card-body" style="gap:10px;display:flex;flex-direction:column;padding:14px">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line shorter"></div>
      </div>
    </div>`).join('');
}

/* ── Reveal newly-injected cards ── */
function revealCards(container) {
  const cards = container.querySelectorAll('.game-card, .req-card, .friend-card');
  cards.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.04) + 's';
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('shown'); obs.unobserve(e.target); } });
  }, { threshold: 0.06 });
  cards.forEach(el => obs.observe(el));
}

/* ── Award coins to the logged-in user ── */
function awardCoins(amount) {
  const user = Auth.getUser();
  if (!user) return;
  user.coins = (user.coins || 0) + amount;
  localStorage.setItem('eylox_user', JSON.stringify(user));
  document.querySelectorAll('.tb-coins span, .coins-amount').forEach(el => {
    el.textContent = user.coins.toLocaleString();
  });
  showToast(`+${amount} 💰 Coins earned!`, 'green');
}

/* ── Track a game play via API ── */
async function trackGamePlay(gameId) {
  if (!Auth.isLoggedIn()) return;
  const user = Auth.getUser();
  if (!user?._id) return;
  try {
    await Users.trackPlay(user._id, gameId);
    awardCoins(10);
  } catch { /* offline — fail silently */ }
}

/* ── Hook play tracking onto every .btn-play click ── */
function hookPlayTracking() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-play');
    if (!btn) return;
    const gameId = btn.dataset.id || btn.closest('[data-game-id]')?.dataset.gameId;
    if (gameId) trackGamePlay(gameId);
  });
}

/* ══════════════════════════════════════════════════
   HOME PAGE  (index.html, data-page="home")
══════════════════════════════════════════════════ */

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

function loadLocalRecentlyPlayed() {
  const grid = document.getElementById('continue-grid');
  if (!grid) return;
  try {
    const raw = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
    /* Filter out placeholder/broken entries — must have a real id and real title */
    const VALID_IDS = ['ninja-dash','sky-riders','dragon-escape','puzzle-palace','ocean-quest','block-kingdom','farm-friends','space-blaster','haunted-house','race-city','jungle-run','candy-chaos','ice-fortress','logic-lab','pirate-bay','treasure-hunt'];
    const recent = raw.filter(g => g.id && VALID_IDS.includes(g.id) && g.title && g.title.toLowerCase() !== 'this game');
    if (raw.length !== recent.length) localStorage.setItem('eylox_recently_played', JSON.stringify(recent));
    if (!recent.length) return;
    const GENRE_COLOR_MAP = {racing:'t-yellow',action:'t-purple',puzzle:'t-green',building:'t-teal',survival:'t-pink',roleplay:'t-indigo',adventure:'t-blue'};
    const BADGE_MAP = {racing:'b-racing',action:'b-action',puzzle:'b-puzzle',building:'b-building',survival:'b-survival',roleplay:'b-roleplay',adventure:'b-adventure'};
    grid.innerHTML = recent.slice(0, 6).map(g => {
      const thumbHtml = g.imgUrl
        ? `<div class="card-thumb" style="background-image:url('${g.imgUrl}');background-size:cover;background-position:center top;font-size:0"></div>`
        : `<div class="card-thumb ${GENRE_COLOR_MAP[g.genre]||'t-blue'}">${g.thumb||'🎮'}</div>`;
      return `
      <div class="game-card" data-game-id="${g.id||''}">
        ${thumbHtml}
        <div class="card-body">
          <span class="card-badge ${BADGE_MAP[g.genre]||'b-adventure'}">${g.genre||'game'}</span>
          <h3 class="card-title">${g.title}</h3>
          <div class="card-meta">🕐 ${timeAgo(g.playedAt)}</div>
          <button class="btn-play" data-id="${g.id||''}" data-title="${g.title}" data-thumb="${g.thumb||'🎮'}" data-genre="${g.genre||'action'}">▶ Resume</button>
        </div>
      </div>`;
    }).join('');
    revealCards(grid);
  } catch {}
}

async function initHomePage() {
  loadLocalRecentlyPlayed();
  /* Update welcome name */
  const user = Auth.getUser();
  if (user) {
    const el = document.querySelector('.welcome-name');
    if (el) el.textContent = `${user.username}! 👋`;
  }

  /* Friends online row */
  const friendsRow = document.getElementById('friends-row');
  if (friendsRow && Auth.isLoggedIn()) {
    const data = await Friends.list().catch(() => null);
    if (data?.friends?.length) {
      const pills = data.friends.slice(0, 6).map(buildFriendPill).join('');
      const addPill = `<div class="friend-pill" id="addFriendPill" style="cursor:pointer">
        <div class="friend-pic add-friend-pic">➕</div>
        <span class="friend-name">Add</span>
      </div>`;
      friendsRow.innerHTML = pills + addPill;
      document.getElementById('addFriendPill')?.addEventListener('click', () => {
        window.location.href = 'friends.html';
      });
    }
  }

  /* Update friend request count badge + welcome banner */
  if (Auth.isLoggedIn()) {
    const reqData = await Friends.requests().catch(() => null);
    if (reqData?.count > 0) {
      const bannerP = document.querySelector('.welcome-banner p');
      if (bannerP) bannerP.innerHTML = `Ready to play? You have <strong>${reqData.count} new friend request${reqData.count !== 1 ? 's' : ''}</strong> waiting!`;
      document.querySelectorAll('.s-badge').forEach(b => { b.textContent = reqData.count; b.style.display = ''; });
    }
  }

  /* Continue playing — recently played games */
  const continueGrid = document.getElementById('continue-grid');
  if (continueGrid && Auth.isLoggedIn() && user?._id) {
    const data = await Users.recentGames(user._id).catch(() => null);
    if (data?.games?.length) {
      continueGrid.innerHTML = data.games.slice(0, 3).map(g => buildGameCard(g, '▶ Resume')).join('');
      revealCards(continueGrid);
    }
  }

  /* Recommended games */
  const recGrid = document.getElementById('recommended-grid');
  if (recGrid) {
    const data = await Games.list({ sort: 'popular' }).catch(() => null);
    if (data?.games?.length) {
      recGrid.innerHTML = data.games.slice(0, 6).map(g => buildGameCard(g)).join('');
    } else {
      recGrid.innerHTML = LOCAL_GAMES.slice(0, 6).map(g => buildLocalGameCard(g)).join('');
    }
    revealCards(recGrid);
  }
}

/* ══════════════════════════════════════════════════
   LOCAL GAME REGISTRY (offline fallback)
══════════════════════════════════════════════════ */
const LOCAL_GAMES = [
  { _id:'ninja-dash',    title:'Ninja Dash',    thumbnail:'🥷', imgUrl:'thumbnails/ninja-dash.jpg',    genre:'action',    players:75000,  rating:4.6, isNew:false },
  { _id:'sky-riders',   title:'Sky Riders',    thumbnail:'🚀', imgUrl:'thumbnails/sky-riders.jpg',   genre:'racing',    players:120000, rating:4.8, isNew:false },
  { _id:'dragon-escape',title:'Dragon Escape', thumbnail:'🐉', imgUrl:'thumbnails/dragon-escape.jpg',genre:'survival',  players:47000,  rating:4.3, isNew:false },
  { _id:'puzzle-palace',title:'Puzzle Palace', thumbnail:'🧩', imgUrl:'thumbnails/puzzle-palace.jpg',genre:'puzzle',    players:52000,  rating:4.4, isNew:false },
  { _id:'ocean-quest',  title:'Ocean Quest',   thumbnail:'🌊', imgUrl:'thumbnails/ocean-quest.jpg',  genre:'adventure', players:64000,  rating:4.5, isNew:false },
  { _id:'block-kingdom',title:'Block Kingdom', thumbnail:'🏰', imgUrl:'thumbnails/block-kingdom.jpg',genre:'building',  players:98000,  rating:4.7, isNew:false },
  { _id:'farm-friends', title:'Farm Friends',  thumbnail:'🌻', imgUrl:'thumbnails/farm-friends.jpg', genre:'roleplay',  players:38000,  rating:4.5, isNew:false },
  { _id:'space-blaster',title:'Space Blaster', thumbnail:'🌌', imgUrl:null,                          genre:'action',    players:55000,  rating:4.5, isNew:true  },
  { _id:'haunted-house',title:'Haunted House', thumbnail:'👻', imgUrl:null,                          genre:'survival',  players:29000,  rating:4.2, isNew:true  },
  { _id:'race-city',    title:'Race City',     thumbnail:'🏎️', imgUrl:null,                          genre:'racing',    players:33000,  rating:4.3, isNew:false },
  { _id:'jungle-run',   title:'Jungle Run',    thumbnail:'🌿', imgUrl:null,                          genre:'adventure', players:41000,  rating:4.4, isNew:false },
  { _id:'candy-chaos',  title:'Candy Chaos',   thumbnail:'🍬', imgUrl:null,                          genre:'action',    players:22000,  rating:4.1, isNew:true  },
  { _id:'ice-fortress', title:'Ice Fortress',  thumbnail:'🧊', imgUrl:null,                          genre:'building',  players:18000,  rating:4.0, isNew:true  },
  { _id:'logic-lab',    title:'Logic Lab',     thumbnail:'🔬', imgUrl:null,                          genre:'puzzle',    players:15000,  rating:4.2, isNew:true  },
  { _id:'pirate-bay',   title:'Pirate Bay',    thumbnail:'🏴‍☠️', imgUrl:null,                          genre:'adventure', players:26000,  rating:4.3, isNew:true  },
  { _id:'treasure-hunt',title:'Treasure Hunt', thumbnail:'💎', imgUrl:null,                          genre:'adventure', players:31000,  rating:4.4, isNew:false },
];

function buildLocalGameCard(g, btnLabel = '▶ Play Now') {
  const GENRE_COLOR = {adventure:'t-blue',action:'t-purple',puzzle:'t-green',racing:'t-yellow',building:'t-teal',survival:'t-pink',roleplay:'t-indigo'};
  const GENRE_BADGE = {adventure:'b-adventure',action:'b-action',puzzle:'b-puzzle',racing:'b-racing',building:'b-building',survival:'b-survival',roleplay:'b-roleplay'};
  const thumbHtml = g.imgUrl
    ? `<div class="card-thumb" style="background-image:url('${g.imgUrl}');background-size:cover;background-position:center top;font-size:0">${g.isNew?'<span class="card-new-tag">NEW</span>':''}</div>`
    : `<div class="card-thumb ${GENRE_COLOR[g.genre]||'t-blue'}">${esc(g.thumbnail||'🎮')}${g.isNew?'<span class="card-new-tag">NEW</span>':''}</div>`;
  return `
    <div class="game-card" data-game-id="${g._id}">
      ${thumbHtml}
      <div class="card-body">
        <span class="card-badge ${GENRE_BADGE[g.genre]||'b-adventure'}">${cap(g.genre)}</span>
        <h3 class="card-title">${esc(g.title)}</h3>
        <div class="card-meta">👥 ${fmtNum(g.players)} <span class="dot"></span> ⭐ ${(g.rating||4).toFixed(1)}</div>
        <button class="btn-play" data-id="${g._id}" data-title="${esc(g.title)}" data-thumb="${esc(g.thumbnail||'🎮')}" data-genre="${g.genre||'action'}">
          ${btnLabel}
        </button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════
   GAMES PAGE  (games.html, data-page="games")
══════════════════════════════════════════════════ */
async function initGamesPage() {
  const grid        = document.getElementById('games-grid');
  const countEl     = document.querySelector('.game-count');
  if (!grid) return;

  function renderLocalGames(params = {}) {
    let games = [...LOCAL_GAMES];
    if (params.genre) games = games.filter(g => g.genre === params.genre);
    if (params.search) {
      const q = params.search.toLowerCase();
      games = games.filter(g => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
    }
    if (!games.length) {
      grid.innerHTML = `<p class="empty-msg">No games found for that filter.</p>`;
      if (countEl) countEl.innerHTML = 'No games found';
      return;
    }
    grid.innerHTML = games.map(g => buildLocalGameCard(g)).join('');
    if (countEl) countEl.innerHTML = `Showing <strong style="color:var(--purple)">${games.length} game${games.length !== 1 ? 's' : ''}</strong> 🎮`;
    revealCards(grid);
  }

  async function loadGames(params = {}) {
    renderSkeletons(grid, 8);
    const data = await Games.list(params).catch(() => null);

    if (!data) {
      /* Offline — use local registry */
      renderLocalGames(params);
      return;
    }
    if (!data.games.length) {
      renderLocalGames(params);
      return;
    }

    grid.innerHTML = data.games.map(g => buildGameCard(g)).join('');
    if (countEl) countEl.innerHTML = `Showing <strong style="color:var(--purple)">${data.games.length} game${data.games.length !== 1 ? 's' : ''}</strong> 🎮`;
    revealCards(grid);
  }

  /* Initial load */
  await loadGames({ sort: 'popular' });

  /* Genre tabs — replace with API-driven versions */
  document.querySelectorAll('.f-tab').forEach(tab => {
    const clone = tab.cloneNode(true);   // strips old listeners added by script.js
    tab.parentNode.replaceChild(clone, tab);
    clone.addEventListener('click', async () => {
      document.querySelectorAll('.f-tab').forEach(t => t.classList.remove('active'));
      clone.classList.add('active');
      const genre = clone.dataset.genre;
      await loadGames(genre ? { genre, sort: 'popular' } : { sort: 'popular' });
    });
  });

  /* Search — debounced API search */
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = searchInput.value.trim();
        document.querySelectorAll('.f-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.f-tab[data-genre=""]')?.classList.add('active');
        await loadGames(q ? { search: q } : { sort: 'popular' });
      }, 380);
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') { searchInput.value = ''; loadGames({ sort: 'popular' }); }
    });
  }
}

/* ══════════════════════════════════════════════════
   FRIENDS PAGE  (friends.html, data-page="friends")
══════════════════════════════════════════════════ */
async function initFriendsPage() {
  if (!Auth.isLoggedIn()) { showAuthGate(); return; }

  await Promise.all([loadFriendRequests(), loadFriendsList()]);

  /* Send friend request */
  const sendBtn     = document.getElementById('sendFriendBtn');
  const friendInput = document.getElementById('friendSearchInput');
  if (sendBtn && friendInput) {
    async function doSend() {
      const username = friendInput.value.trim();
      if (!username) { friendInput.focus(); return; }
      sendBtn.disabled = true;
      sendBtn.textContent = '⏳ Sending…';
      try {
        const res = await Friends.sendRequest(username);
        showToast(res?.message || `Request sent to ${username}!`, 'green');
        friendInput.value = '';
      } catch (err) {
        showToast(err.message || 'Could not send request.', 'pink');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '➕ Send Request';
      }
    }
    sendBtn.addEventListener('click', doSend);
    friendInput.addEventListener('keydown', e => e.key === 'Enter' && doSend());
  }

  /* Accept / Decline / Remove — event delegation */
  document.addEventListener('click', async e => {
    /* Accept */
    if (e.target.classList.contains('btn-accept')) {
      const card  = e.target.closest('.req-card');
      if (!card) return;
      const reqId = card.dataset.reqId;
      const name  = e.target.dataset.from || 'Friend';
      e.target.disabled = true;
      try {
        await Friends.accept(reqId);
        flyRemove(card, 'right');
        setTimeout(() => {
          updateReqCount();
          showToast(`🤝 Now friends with ${name}!`, 'green');
          loadFriendsList();
        }, 310);
      } catch (err) {
        showToast(err.message || 'Could not accept.', 'pink');
        e.target.disabled = false;
      }
    }
    /* Decline */
    if (e.target.classList.contains('btn-decline')) {
      const card  = e.target.closest('.req-card');
      if (!card) return;
      const reqId = card.dataset.reqId;
      e.target.disabled = true;
      try {
        await Friends.decline(reqId);
        flyRemove(card, 'left');
        setTimeout(updateReqCount, 310);
      } catch (err) {
        showToast(err.message || 'Could not decline.', 'pink');
        e.target.disabled = false;
      }
    }
    /* Remove friend */
    if (e.target.classList.contains('fc-remove')) {
      e.preventDefault();
      const card     = e.target.closest('.friend-card');
      if (!card) return;
      const friendId = e.target.dataset.friendId;
      const name     = e.target.dataset.name || 'Friend';
      e.target.disabled = true;
      try {
        await Friends.remove(friendId);
        flyRemove(card, 'scale');
        setTimeout(() => { updateFriendCount(); showToast(`👋 ${name} removed`, 'muted'); }, 310);
      } catch (err) {
        showToast(err.message || 'Could not remove.', 'pink');
        e.target.disabled = false;
      }
    }
  });
}

async function loadFriendRequests() {
  const list   = document.getElementById('req-list');
  const header = document.getElementById('req-header');
  if (!list) return;

  const data = await Friends.requests().catch(() => null);
  if (!data?.requests?.length) {
    list.innerHTML = '<p class="empty-msg">No pending requests 🎉</p>';
    if (header) header.textContent = '📨 Friend Requests';
    return;
  }
  list.innerHTML = data.requests.map(buildReqCard).join('');
  if (header) header.innerHTML = `📨 Friend Requests <span style="font-size:.82rem;color:var(--pink);font-family:var(--font-body);font-weight:800;margin-left:6px;">${data.count} new</span>`;
  revealCards(list);
}

async function loadFriendsList() {
  const grid   = document.getElementById('friend-cards-grid');
  const header = document.getElementById('friends-header');
  if (!grid) return;

  const data = await Friends.list().catch(() => null);
  if (!data?.friends?.length) {
    grid.innerHTML = '<p class="empty-msg">No friends yet — send some requests! 🤝</p>';
    if (header) header.textContent = '👥 My Friends';
    return;
  }
  grid.innerHTML = data.friends.map(buildFriendCard).join('');
  if (header) header.innerHTML = `👥 My Friends <span style="font-size:.82rem;color:var(--muted);font-family:var(--font-body);font-weight:700;margin-left:6px;">${data.count} friend${data.count !== 1 ? 's' : ''}</span>`;
  revealCards(grid);
}

function updateReqCount() {
  const remaining = document.getElementById('req-list')?.querySelectorAll('.req-card').length || 0;
  const header    = document.getElementById('req-header');
  if (header) {
    if (remaining > 0) header.innerHTML = `📨 Friend Requests <span style="font-size:.82rem;color:var(--pink);font-family:var(--font-body);font-weight:800;margin-left:6px;">${remaining} new</span>`;
    else header.textContent = '📨 Friend Requests';
  }
  document.querySelectorAll('.s-badge').forEach(b => {
    b.textContent = remaining; b.style.display = remaining > 0 ? '' : 'none';
  });
}

function updateFriendCount() {
  const remaining = document.getElementById('friend-cards-grid')?.querySelectorAll('.friend-card').length || 0;
  const header    = document.getElementById('friends-header');
  if (header) header.innerHTML = `👥 My Friends <span style="font-size:.82rem;color:var(--muted);font-family:var(--font-body);font-weight:700;margin-left:6px;">${remaining} friend${remaining !== 1 ? 's' : ''}</span>`;
}

function flyRemove(el, dir) {
  el.style.transition = 'opacity .28s, transform .28s';
  el.style.opacity    = '0';
  el.style.transform  = dir === 'right' ? 'translateX(28px)' : dir === 'left' ? 'translateX(-28px)' : 'scale(.8)';
  setTimeout(() => el.remove(), 300);
}

/* ══════════════════════════════════════════════════
   PROFILE PAGE  (profile.html, data-page="profile")
══════════════════════════════════════════════════ */
async function initProfilePage() {
  if (!Auth.isLoggedIn()) { showAuthGate(); return; }

  const user = Auth.getUser();
  if (!user) return;

  /* Username + handle */
  document.querySelectorAll('.ph-username').forEach(el => el.textContent = user.username);
  document.querySelectorAll('.ph-handle').forEach(el => el.textContent = `@${user.username.toLowerCase()}_eylox`);

  /* Avatar */
  document.querySelectorAll('.ph-inner').forEach(el => {
    el.textContent = user.avatar || '🎮';
    el.title = 'Click to change avatar';
    el.style.cursor = 'pointer';
    el.addEventListener('click', openAvatarPicker);
  });

  /* Stats from cached user — read coins fresh in case they earned some in-game */
  const freshCoins = (() => { try { return JSON.parse(localStorage.getItem('eylox_user'))?.coins ?? user.coins ?? 0; } catch { return 0; } })();
  setStat('stat-coins',  freshCoins);
  setStat('stat-wins',   user.wins  || 0);
  setStat('stat-badges', (user.badges || []).length);

  /* Streak badge */
  const streak = parseInt(localStorage.getItem('eylox_streak')||'0');
  if (streak > 0) {
    const streakEl = document.createElement('span');
    streakEl.className = 'ph-badge streak-badge';
    streakEl.textContent = '🔥 ' + streak + ' Day Streak';
    streakEl.style.background = 'linear-gradient(135deg,#f97316,#fde68a)';
    streakEl.style.color = '#1a0a00';
    streakEl.style.marginLeft = '8px';
    document.querySelector('.ph-info')?.appendChild(streakEl);
  }

  /* Badges */
  const achWrap = document.getElementById('achievements-wrap');
  if (achWrap) {
    const badges = user.badges?.length ? user.badges : [];
    achWrap.innerHTML = badges.length
      ? badges.map(b => `<div class="ach">${esc(b)}</div>`).join('')
      : '<p class="empty-msg" style="grid-column:1/-1">Play games to unlock badges! 🎖️</p>';
  }

  /* Friends count */
  const fData = await Friends.list().catch(() => null);
  if (fData) setStat('stat-friends', fData.count || 0);

  /* Recently played */
  const recentGrid = document.getElementById('profile-games-grid');
  if (recentGrid && user._id) {
    const data = await Users.recentGames(user._id).catch(() => null);
    if (data?.games?.length) {
      recentGrid.innerHTML = data.games.map(g => buildGameCard(g, '▶ Play Again')).join('');
      setStat('stat-games', data.games.length);
      revealCards(recentGrid);
    } else {
      recentGrid.innerHTML = '<p class="empty-msg" style="grid-column:1/-1">Play some games to see them here! 🎮</p>';
    }
  }
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = typeof value === 'number' ? value.toLocaleString() : value;
}

/* ══════════════════════════════════════════════════
   AVATAR PICKER
══════════════════════════════════════════════════ */
function openAvatarPicker() {
  if (document.getElementById('avatarPickerModal')) return;
  const m = document.createElement('div');
  m.id = 'avatarPickerModal';
  m.className = 'launch-modal open';
  m.innerHTML = `
    <div class="launch-card" style="max-width:420px">
      <h2 class="launch-title" style="margin-bottom:20px">Pick Your Avatar</h2>
      <div class="avatar-grid">
        ${AVATAR_OPTIONS.map(a => `<button class="avatar-option" data-emoji="${a}">${a}</button>`).join('')}
      </div>
      <button class="launch-close-btn" id="avatarCancel" style="margin-top:16px">✕ Cancel</button>
    </div>`;
  document.body.appendChild(m);
  document.body.style.overflow = 'hidden';

  m.querySelector('#avatarCancel').addEventListener('click', closeAvatarPicker);
  m.addEventListener('click', e => e.target === m && closeAvatarPicker());
  m.querySelectorAll('.avatar-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      closeAvatarPicker();
      await saveAvatar(btn.dataset.emoji);
    });
  });
}

function closeAvatarPicker() {
  document.getElementById('avatarPickerModal')?.remove();
  document.body.style.overflow = '';
}

async function saveAvatar(emoji) {
  const user = Auth.getUser();
  if (!user?._id) return;
  try {
    await Users.updateAvatar(user._id, emoji);
    user.avatar = emoji;
    localStorage.setItem('eylox_user', JSON.stringify(user));
    document.querySelectorAll('.ph-inner, .tb-avatar').forEach(el => {
      const dot = el.querySelector('.online-dot');
      el.textContent = emoji;
      if (dot) el.appendChild(dot);
    });
    showToast(`Avatar updated to ${emoji}`, 'green');
  } catch {
    showToast('Could not update avatar — is the server running?', 'pink');
  }
}

/* ══════════════════════════════════════════════════
   AUTH GATE  (for protected pages)
══════════════════════════════════════════════════ */
function showAuthGate() {
  const target = document.querySelector('main.page-content') || document.querySelector('.main-area');
  if (target) {
    target.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;gap:20px;padding:40px">
        <div style="font-size:4rem">🔒</div>
        <h2 style="color:var(--text);font-family:var(--font-head);font-size:2rem">Login to continue</h2>
        <p style="color:var(--muted)">You need an account to access this page.</p>
        <a href="login.html" class="btn-play" style="padding:12px 28px;text-decoration:none;display:inline-block">▶ Login / Sign Up</a>
      </div>`;
  }
}

/* ══════════════════════════════════════════════════
   OWNER SYSTEM
══════════════════════════════════════════════════ */
function isOwner() {
  return localStorage.getItem('eylox_is_owner') === 'true';
}

function injectOwnerBadge() {
  if (!isOwner()) return;
  /* Topbar avatar crown */
  document.querySelectorAll('.tb-avatar').forEach(el => {
    if (!el.querySelector('.owner-crown')) {
      const crown = document.createElement('span');
      crown.className = 'owner-crown';
      crown.textContent = '👑';
      crown.title = 'Owner';
      el.appendChild(crown);
    }
  });
  /* Profile badge */
  document.querySelectorAll('.ph-badge').forEach(el => {
    el.innerHTML = '👑 Owner';
    el.style.background = 'linear-gradient(135deg,#f59e0b,#fde68a)';
    el.style.color = '#1a0a00';
  });
  /* Sidebar username if present */
  document.querySelectorAll('.sidebar-logo-text').forEach(el => {
    if (!el.querySelector('.owner-tag')) {
      const tag = document.createElement('span');
      tag.className = 'owner-tag';
      tag.textContent = '👑';
      el.appendChild(tag);
    }
  });
}

/* ══════════════════════════════════════════════════
   GUEST MODE HELPERS
══════════════════════════════════════════════════ */
function isGuest() {
  return !!localStorage.getItem('eylox_guest');
}

function checkLandingRedirect() {
  /* Send to landing only if no token, no guest flag, AND no stored user */
  const hasSession = Auth.isLoggedIn() || isGuest() || !!Auth.getUser();
  if (!hasSession) {
    const page = document.body.dataset.page;
    if (page) { window.location.replace('landing.html'); }
  }

}

/* ══════════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* ── Landing redirect ── */
  checkLandingRedirect();

  hookPlayTracking();

  /* ── Owner badge ── */
  const _u = Auth.getUser();
  if (_u?.username) {
    injectOwnerBadge();
    /* Also update topbar avatar to show user's avatar */
    document.querySelectorAll('.tb-avatar').forEach(el => {
      const dot = el.querySelector('.online-dot');
      el.textContent = _u.avatar || '🎮';
      if (dot) el.appendChild(dot);
    });
  }

  /* ── Guest banner ── */
  if (isGuest() && !Auth.isLoggedIn()) {
    const bar = document.createElement('div');
    bar.id = 'guestBar';
    bar.innerHTML = `
      <span>🎮 Playing as Guest</span>
      <a href="login.html" style="color:var(--yellow);text-decoration:none;font-weight:800;margin-left:12px">Log In / Sign Up →</a>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:auto;font-size:1.1rem">✕</button>
    `;
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:999;background:rgba(13,5,32,.95);border-top:1px solid var(--border);padding:10px 18px;display:flex;align-items:center;gap:8px;font-size:.82rem;font-weight:700;color:var(--muted)';
    document.body.appendChild(bar);
  }

  /* Logout buttons */
  document.querySelectorAll('#logoutBtn, .btn-logout').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('eylox_guest');
      Auth.logout();
    });
  });

  /* Avatar picker trigger button */
  document.querySelectorAll('#avatarPickBtn, .btn-avatar-pick').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); openAvatarPicker(); });
  });

  /* Page routing */
  switch (document.body.dataset.page) {
    case 'home':    initHomePage();    break;
    case 'games':   initGamesPage();   break;
    case 'friends': initFriendsPage(); break;
    case 'profile': initProfilePage(); break;
  }
});
