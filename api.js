/* ============================================================
   EYLOX — API Client Helper
   Talks to the Express backend at http://localhost:3001
   ============================================================ */

const API = 'http://localhost:3001/api';

/* ── Token helpers ── */
const getToken  = () => localStorage.getItem('eylox_token');
const setToken  = t  => localStorage.setItem('eylox_token', t);
const clearAuth = () => { localStorage.removeItem('eylox_token'); localStorage.removeItem('eylox_user'); localStorage.removeItem('eylox_is_owner'); };

/* ── Base fetch wrapper ── */
async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res  = await fetch(API + path, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    /* If server is offline, return null (frontend uses static data) */
    if (err.name === 'TypeError') return null;
    throw err;
  }
}

/* ── Auth ── */
const Auth = {
  async register(username, email, password) {
    const data = await request('POST', '/auth/register', { username, email, password });
    if (data) { setToken(data.token); localStorage.setItem('eylox_user', JSON.stringify(data.user)); }
    return data;
  },

  async login(username, password) {
    const data = await request('POST', '/auth/login', { username, password });
    if (data) { setToken(data.token); localStorage.setItem('eylox_user', JSON.stringify(data.user)); }
    return data;
  },

  async me() {
    return request('GET', '/auth/me', null, true);
  },

  logout() {
    /* Persist current coins/wins/data for this user before wiping session */
    try {
      const u = this.getUser();
      if (u?.username) {
        localStorage.setItem('eylox_userdata_' + u.username, JSON.stringify(u));
      }
    } catch {}
    clearAuth();
    localStorage.removeItem('eylox_guest');
    window.location.href = 'landing.html';
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user')); } catch { return null; }
  },

  isLoggedIn() {
    return !!(getToken() || localStorage.getItem('eylox_guest') || localStorage.getItem('eylox_user'));
  },
};

/* ── Games ── */
const Games = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/games${qs ? '?' + qs : ''}`);
  },

  async get(id) {
    return request('GET', `/games/${id}`);
  },

  async like(id) {
    return request('POST', `/games/${id}/like`, null, true);
  },
};

/* ── Friends ── */
const Friends = {
  async list() {
    return request('GET', '/friends', null, true);
  },

  async requests() {
    return request('GET', '/friends/requests', null, true);
  },

  async sendRequest(toUsername) {
    return request('POST', '/friends/request', { toUsername }, true);
  },

  async accept(requestId) {
    return request('POST', '/friends/accept', { requestId }, true);
  },

  async decline(requestId) {
    return request('POST', '/friends/decline', { requestId }, true);
  },

  async remove(friendId) {
    return request('DELETE', `/friends/${friendId}`, null, true);
  },
};

/* ── Users ── */
const Users = {
  async list(search = '') {
    return request('GET', `/users${search ? '?search=' + encodeURIComponent(search) : ''}`);
  },

  async get(id) {
    return request('GET', `/users/${id}`);
  },

  async recentGames(id) {
    return request('GET', `/users/${id}/games`);
  },

  async trackPlay(userId, gameId) {
    return request('POST', `/users/${userId}/games`, { gameId }, true);
  },

  async updateAvatar(userId, avatar) {
    return request('PUT', `/users/${userId}`, { avatar }, true);
  },

  async registry() {
    return request('GET', '/users/registry');
  },
};

/* ── Auto-load: populate topbar, coins, and welcome name from localStorage ── */
document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getUser();
  if (!user) return;

  /* ── Owner gate: only "Eylox" gets admin privileges ── */
  if (user.username?.toLowerCase() === 'eylox') {
    localStorage.setItem('eylox_is_owner', 'true');
  } else {
    localStorage.removeItem('eylox_is_owner');
  }

  /* Avatar */
  document.querySelectorAll('.tb-avatar').forEach(el => {
    const dot = el.querySelector('.online-dot');
    el.textContent = user.avatar || '🎮';
    if (dot) el.appendChild(dot);
  });

  /* Coins — always read fresh from localStorage so game earnings show up */
  const freshCoins = (() => {
    try { return JSON.parse(localStorage.getItem('eylox_user'))?.coins ?? user.coins ?? 0; } catch { return 0; }
  })();
  document.querySelectorAll('.tb-coins span, .coins-amount').forEach(el => {
    el.textContent = Number(freshCoins).toLocaleString();
  });
  document.querySelectorAll('.sidebar-coins .coins-amount').forEach(el => {
    el.textContent = Number(freshCoins).toLocaleString();
  });

  /* Trophies (wins) — sidebar + topbar */
  const freshWins = (() => {
    try { return JSON.parse(localStorage.getItem('eylox_user'))?.wins ?? user.wins ?? 0; } catch { return 0; }
  })();
  const wFmt = Number(freshWins).toLocaleString();
  document.querySelectorAll('.trophies-amount').forEach(el => { el.textContent = wFmt; });
  const topTrophies = document.getElementById('topbarTrophies');
  if (topTrophies) topTrophies.textContent = wFmt;
  const topCoins = document.getElementById('topbarCoins');
  if (topCoins) topCoins.textContent = Number(freshCoins).toLocaleString();

  /* Welcome banner username */
  const welcomeName = document.querySelector('.welcome-name');
  if (welcomeName) welcomeName.textContent = `${user.username}! 👋`;
});

/* ── Per-user data helpers ── */
const EyloxData = {
  /* Persist current eylox_user to per-username key */
  _persist(u) {
    if (u?.username) {
      localStorage.setItem('eylox_userdata_' + u.username, JSON.stringify(u));
    }
  },
  addCoins(amount) {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user'));
      if (!u) return 0;
      u.coins = Math.min((u.coins || 0) + Math.round(amount), 1e9);
      localStorage.setItem('eylox_user', JSON.stringify(u));
      this._persist(u);
      return u.coins;
    } catch { return 0; }
  },
  addTrophy(amount = 1) {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user'));
      if (!u) return 0;
      u.wins = (u.wins || 0) + Math.round(amount);
      localStorage.setItem('eylox_user', JSON.stringify(u));
      this._persist(u);
      return u.wins;
    } catch { return 0; }
  },
  getCoins() {
    try { return JSON.parse(localStorage.getItem('eylox_user'))?.coins || 0; } catch { return 0; }
  },
  getTrophies() {
    try { return JSON.parse(localStorage.getItem('eylox_user'))?.wins || 0; } catch { return 0; }
  },
};

/* Live-poll coins and wins every 2 seconds so admin commands reflect instantly */
setInterval(() => {
  try {
    const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
    if (!u) return;
    const cFmt = Number(u.coins || 0).toLocaleString();
    const wFmt = Number(u.wins  || 0).toLocaleString();
    document.querySelectorAll('.coins-amount').forEach(el => { el.textContent = cFmt; });
    const topCoins = document.getElementById('topbarCoins');
    if (topCoins) topCoins.textContent = cFmt;
    document.querySelectorAll('.trophies-amount').forEach(el => { el.textContent = wFmt; });
    const topTrophies = document.getElementById('topbarTrophies');
    if (topTrophies) topTrophies.textContent = wFmt;
  } catch {}
}, 2000);
