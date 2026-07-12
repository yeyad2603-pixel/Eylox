/* ============================================================
   EYLOX — API Client Helper
   Talks to the Express backend at http://localhost:3001
   ============================================================ */

const API = 'http://localhost:3001/api';
const REQUEST_TIMEOUT_MS = 20000;

/* ── Token helpers ── */
const getToken  = () => localStorage.getItem('eylox_token');
const setToken  = t  => localStorage.setItem('eylox_token', t);
const clearAuth = () => { localStorage.removeItem('eylox_token'); localStorage.removeItem('eylox_user'); localStorage.removeItem('eylox_is_owner'); };

/* Real reason the last network-level failure happened, for debugging/UI —
   callers that only check `=== null` (the majority) are unaffected. This is
   what lets us tell "server offline" apart from "request timed out" instead
   of collapsing every non-HTTP failure into a silent, unexplained null. */
let _lastNetworkError = null;
function describeNetworkFailure(err) {
  if (err && err.name === 'AbortError') return 'Request Timed Out';
  if (err && err.name === 'TypeError')  return 'Server Offline (unreachable)';
  return (err && err.message) || 'Network Error';
}

/* ── Base fetch wrapper ── */
async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  options.signal = controller.signal;

  try {
    const res  = await fetch(API + path, options);
    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    _lastNetworkError = null;
    return data;
  } catch (err) {
    /* TypeError = connection-level failure (server offline/unreachable/CORS).
       AbortError = our own timeout fired. Either way: return null so callers
       fall back to cached/local data exactly as before, but log + record the
       REAL cause instead of silently swallowing it. */
    if (err.name === 'TypeError' || err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      _lastNetworkError = describeNetworkFailure(err);
      console.warn(`[EYLOX API] ${method} ${path} failed — ${_lastNetworkError}`);
      return null;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
/* Inspect the real cause of the most recent network-level failure (null if
   the last request succeeded or failed with a normal HTTP error instead). */
request.lastError = () => _lastNetworkError;

/* ── Auth ── */
const Auth = {
  async register(username, email, password) {
    const data = await request('POST', '/register', { username, email, password });
    if (data) { setToken(data.token); localStorage.setItem('eylox_user', JSON.stringify(data.user)); }
    return data;
  },

  async login(username, password) {
    const data = await request('POST', '/login', { username, password });
    if (data) { setToken(data.token); localStorage.setItem('eylox_user', JSON.stringify(data.user)); }
    return data;
  },

  async me() {
    return request('GET', '/me', null, true);
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

  /* ── Owner flag: mirror the server-provided isOwner field for legacy code ── */
  if (user.isOwner === true) {
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
  document.querySelectorAll('.Eyltrophs-amount').forEach(el => { el.textContent = wFmt; });
  const topTrophies = document.getElementById('topbarTrophies');
  if (topTrophies) topTrophies.textContent = wFmt;
  const topCoins = document.getElementById('topbarCoins');
  if (topCoins) topCoins.textContent = Number(freshCoins).toLocaleString();

  /* Level — computed from coins */
  const XP_PER_LEVEL = 500;
  const freshLevel = Math.floor(freshCoins / XP_PER_LEVEL) + 1;
  const xpIntoLevel = freshCoins % XP_PER_LEVEL;
  const xpPct = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
  injectLevelBadge(freshLevel, xpPct);

  /* Welcome banner username with time-of-day greeting */
  const welcomeName = document.querySelector('.welcome-name');
  if (welcomeName) {
    const h = new Date().getHours();
    const greet = h < 12 ? '🌅 Good morning' : h < 17 ? '☀️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
    welcomeName.textContent = `${user.username}! 👋`;
    welcomeName.title = `${greet}, ${user.username}!`;
  }

  /* Inject animated greeting below page heading if on home page */
  const page = document.body?.dataset?.page || '';
  if (page === 'home' || location.href.includes('index.html')) {
    const h = new Date().getHours();
    const greet = h < 12 ? '🌅 Good morning' : h < 17 ? '☀️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
    const banner = document.querySelector('.welcome-banner, .page-heading');
    if (banner && !document.getElementById('time-greeting')) {
      const g = document.createElement('div');
      g.id = 'time-greeting';
      g.style.cssText = 'font-size:.82rem;font-weight:800;color:rgba(157,142,199,.55);margin-top:2px;animation:fade-in-up .5s ease .3s both';
      g.textContent = `${greet}, ${user.username}!`;
      if (!document.getElementById('api-anim-style')) {
        const s = document.createElement('style');
        s.id = 'api-anim-style';
        s.textContent = '@keyframes fade-in-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}';
        document.head.appendChild(s);
      }
      banner.appendChild(g);
    }
  }
});

/* ── Level badge injection (runs once on DOMContentLoaded, updates on poll) ── */
function injectLevelBadge(level, xpPct) {
  let badge = document.getElementById('topbarLevel');
  if (!badge) {
    /* Inject before the coins element in topbar-right */
    const coinsEl = document.querySelector('.tb-coins');
    if (!coinsEl) return;
    badge = document.createElement('div');
    badge.id = 'topbarLevel';
    badge.className = 'tb-level';
    coinsEl.parentNode.insertBefore(badge, coinsEl);

    /* CSS */
    if (!document.getElementById('levelBadgeCSS')) {
      const s = document.createElement('style');
      s.id = 'levelBadgeCSS';
      s.textContent = `
        .tb-level {
          display:flex;flex-direction:column;align-items:center;gap:2px;
          cursor:default;
        }
        .tb-level-pill {
          background:linear-gradient(135deg,#7c3aed,#a855f7);
          border-radius:99px;padding:3px 10px;
          font-family:'Fredoka One',cursive;font-size:.78rem;
          color:#fff;white-space:nowrap;
          box-shadow:0 2px 8px rgba(124,58,237,.4);
          line-height:1.3;
        }
        .tb-level-bar {
          width:44px;height:3px;border-radius:99px;
          background:rgba(167,139,250,.15);overflow:hidden;
        }
        .tb-level-fill {
          height:100%;border-radius:99px;
          background:linear-gradient(90deg,#a78bfa,#60a5fa);
          transition:width .4s ease;
        }
      `;
      document.head.appendChild(s);
    }
  }
  const ranks = [{min:0,emoji:'🥉'},{min:10,emoji:'🥈'},{min:25,emoji:'🥇'},{min:50,emoji:'💎'},{min:100,emoji:'👑'}];
  const rankEmoji = [...ranks].reverse().find(r => level >= r.min)?.emoji || '🥉';
  badge.innerHTML = `
    <div class="tb-level-pill">${rankEmoji} Lv.${level}</div>
    <div class="tb-level-bar"><div class="tb-level-fill" style="width:${xpPct}%"></div></div>
  `;
  badge.title = `Season Level ${level} — ${xpPct}% to next level`;
  badge.style.display = 'flex';
  // Inject clan tag next to avatar if in a clan
  const clanName = localStorage.getItem('eylox_clan_name');
  if(clanName) {
    let ctag = document.getElementById('tb-clan-tag');
    if(!ctag) {
      ctag = document.createElement('span');
      ctag.id = 'tb-clan-tag';
      ctag.style.cssText = 'font-size:.65rem;font-weight:800;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#f87171;border-radius:99px;padding:2px 8px;white-space:nowrap;cursor:default;';
      const avatarEl = document.querySelector('.tb-avatar');
      if(avatarEl) avatarEl.parentNode.insertBefore(ctag, avatarEl);
    }
    const tag = clanName.replace(/^[^\w]*/,'').split(' ')[0];
    ctag.textContent = '⚔️ '+tag;
    ctag.title = clanName;
  }
}

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
  addEyltroph(amount = 1) {
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
let _lastPollCoins = null;
setInterval(() => {
  try {
    const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
    if (!u) return;
    const coins  = u.coins || 0;
    const cFmt   = Number(coins).toLocaleString();
    const wFmt   = Number(u.wins || 0).toLocaleString();

    /* Animate topbar coin number if value changed */
    const topCoins = document.getElementById('topbarCoins');
    if (topCoins) {
      if (_lastPollCoins !== null && coins !== _lastPollCoins && window.EyloxWowAnimate) {
        window.EyloxWowAnimate(topCoins, _lastPollCoins, coins);
      } else {
        topCoins.textContent = cFmt;
      }
    }
    _lastPollCoins = coins;

    document.querySelectorAll('.coins-amount').forEach(el => { el.textContent = cFmt; });
    document.querySelectorAll('.Eyltrophs-amount').forEach(el => { el.textContent = wFmt; });
    const topTrophies = document.getElementById('topbarTrophies');
    if (topTrophies) topTrophies.textContent = wFmt;

    /* Update level badge */
    const XP_PER_LEVEL = 500;
    const lvl = Math.floor(coins / XP_PER_LEVEL) + 1;
    const pct = Math.round((coins % XP_PER_LEVEL) / XP_PER_LEVEL * 100);
    if (typeof injectLevelBadge === 'function') injectLevelBadge(lvl, pct);
    document.querySelectorAll('.user-level').forEach(el => { el.textContent = `Lv.${lvl}`; });
  } catch {}
}, 2000);