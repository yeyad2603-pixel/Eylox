/* ============================================================
   EYLOX — Security System v2
   - localStorage integrity & tamper detection
   - Login rate limiting (max 5 attempts / 5 min)
   - Input sanitisation
   - Shop session reset on new login
   - Recently-played cleanup
   - Ban enforcement
   ============================================================ */
'use strict';

(function EyloxSecurity() {

  const OWNER_USER        = 'Eylox';
  const COIN_MAX          = 1_000_000_000;
  const WIN_MAX           = 1_000_000;
  const RATE_LIMIT_MS     = 800;
  const MAX_CMDS_PER_MIN  = 60;
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOGIN_LOCKOUT_MS  = 5 * 60 * 1000; // 5 minutes
  const VALID_GAME_IDS    = ['ninja-dash','sky-riders','dragon-escape','puzzle-palace','ocean-quest','block-kingdom','farm-friends','space-blaster','haunted-house','race-city','jungle-run','candy-chaos','ice-fortress','logic-lab','pirate-bay','treasure-hunt'];

  /* ── XSS sanitiser ── */
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  window.EyloxSanitize = sanitize;

  /* ── Input sanitiser ── */
  function sanitizeInput(input) {
    if (!input) return '';
    return String(input)
      .replace(/[<>"'`\\]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .slice(0, 64);
  }
  window.EyloxSanitizeInput = sanitizeInput;

  /* ── Login rate limiter ── */
  function getLoginAttempts() {
    try { return JSON.parse(localStorage.getItem('eylox_login_attempts') || '{"count":0,"since":0}'); } catch { return {count:0,since:0}; }
  }
  function recordLoginAttempt() {
    const now = Date.now();
    let data = getLoginAttempts();
    if (now - data.since > LOGIN_LOCKOUT_MS) data = {count:0, since:now};
    data.count++;
    localStorage.setItem('eylox_login_attempts', JSON.stringify(data));
    return data;
  }
  function clearLoginAttempts() {
    localStorage.removeItem('eylox_login_attempts');
  }
  function isLoginLocked() {
    const data = getLoginAttempts();
    if (Date.now() - data.since > LOGIN_LOCKOUT_MS) { clearLoginAttempts(); return false; }
    return data.count >= MAX_LOGIN_ATTEMPTS;
  }
  function loginLockoutRemaining() {
    const data = getLoginAttempts();
    return Math.max(0, Math.ceil((LOGIN_LOCKOUT_MS - (Date.now() - data.since)) / 1000));
  }
  window.EyloxLoginCheck   = () => !isLoginLocked();
  window.EyloxLoginFail    = () => recordLoginAttempt();
  window.EyloxLoginSuccess = () => clearLoginAttempts();
  window.EyloxLockoutSecs  = () => loginLockoutRemaining();

  /* ── localStorage integrity check ── */
  function clampUser() {
    try {
      const raw = localStorage.getItem('eylox_user');
      if (!raw) return;
      const u = JSON.parse(raw);
      let dirty = false;
      if (typeof u.coins === 'number') {
        const c = Math.min(COIN_MAX, Math.max(0, Math.floor(u.coins)));
        if (c !== u.coins) { u.coins = c; dirty = true; }
      }
      if (typeof u.wins === 'number') {
        const w = Math.min(WIN_MAX, Math.max(0, Math.floor(u.wins)));
        if (w !== u.wins) { u.wins = w; dirty = true; }
      }
      if (u.username && /<[^>]+>/.test(u.username)) {
        u.username = sanitize(u.username); dirty = true;
      }
      if (dirty) localStorage.setItem('eylox_user', JSON.stringify(u));
    } catch {}
  }

  /* ── Shop session sync ── */
  /* On startup just align the shop_token — shop data is now persisted
     per-username via eylox_shop_u_<name> and swapped on login.       */
  function checkShopSession() {
    const token = localStorage.getItem('eylox_token') || '';
    if (!token) return;
    localStorage.setItem('eylox_shop_token', token);
  }
  window.EyloxShopReset = checkShopSession;

  /* Auto-save current user's shop so it survives future logins */
  setInterval(() => {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u?.username) return;
      const d = { o: localStorage.getItem('eylox_owned_items'), e: localStorage.getItem('eylox_equipped'), v: localStorage.getItem('eylox_inventory') };
      localStorage.setItem('eylox_shop_u_' + u.username.toLowerCase(), JSON.stringify(d));
    } catch {}
  }, 5000);

  /* ── Recently-played cleanup ── */
  function cleanRecentlyPlayed() {
    try {
      const raw = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
      const clean = raw.filter(g =>
        g.id && VALID_GAME_IDS.includes(g.id) &&
        g.title && g.title.toLowerCase() !== 'this game' &&
        g.title.trim() !== ''
      );
      if (clean.length !== raw.length)
        localStorage.setItem('eylox_recently_played', JSON.stringify(clean));
    } catch {}
  }

  /* ── Tamper detection via storage event ── */
  window.addEventListener('storage', e => {
    if (e.key === 'eylox_user') clampUser();
    if (e.key === 'eylox_is_owner') {
      const user = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
      if (!user || user.username !== OWNER_USER) localStorage.removeItem('eylox_is_owner');
    }
  });

  /* ── Periodic integrity sweep ── */
  setInterval(() => {
    clampUser();
    if (localStorage.getItem('eylox_is_owner') === 'true') {
      const user = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
      if (!user || user.username !== OWNER_USER) {
        localStorage.removeItem('eylox_is_owner');
        if (window.location.pathname.includes('admin')) window.location.href = 'index.html';
      }
    }
  }, 10000);

  /* ── Admin command rate limiter ── */
  const _cmdTimes = [];
  function checkRateLimit() {
    const now = Date.now();
    while (_cmdTimes.length && now - _cmdTimes[0] > 60000) _cmdTimes.shift();
    if (_cmdTimes.length >= MAX_CMDS_PER_MIN) return false;
    const last = _cmdTimes[_cmdTimes.length - 1];
    if (last && now - last < RATE_LIMIT_MS) return false;
    _cmdTimes.push(now);
    return true;
  }
  window.EyloxRateLimit = checkRateLimit;

  /* ── Protect forms & run startup checks ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="search"], input[type="text"]').forEach(el => {
      el.addEventListener('input', () => {
        const clean = sanitizeInput(el.value);
        if (clean !== el.value) el.value = clean;
      });
    });
    if (window.location.hash && /<|javascript:/i.test(decodeURIComponent(window.location.hash)))
      window.location.hash = '';

    clampUser();
    checkShopSession();
    cleanRecentlyPlayed();
  });

  /* ── Ban enforcement ── */
  function checkBan() {
    try {
      const user   = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!user) return;
      const banned = JSON.parse(localStorage.getItem('eylox_banned') || '[]');
      const entry  = banned.find(b => b.username && b.username.toLowerCase() === user.username.toLowerCase());
      if (entry && !window.location.pathname.includes('admin')) {
        document.addEventListener('DOMContentLoaded', () => {
          const reason = entry.reason || 'Violation of Eylox rules';
          const el = document.createElement('div');
          el.style.cssText = 'position:fixed;inset:0;background:#0a0118;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Nunito",sans-serif;color:#fff;text-align:center;padding:32px';
          el.innerHTML = `<div style="font-size:4rem;margin-bottom:16px">🚫</div>
            <h1 style="font-size:2rem;color:#f87171;margin-bottom:8px">You've been banned</h1>
            <p style="color:#9d8ec7;max-width:400px;line-height:1.6">Reason: <strong>${sanitize(reason)}</strong></p>
            <p style="color:#666;font-size:.8rem;margin-top:24px">Contact Eylox support if you think this is a mistake.</p>`;
          document.body.appendChild(el);
        });
      }
    } catch {}
  }
  checkBan();
  clampUser();

})();
