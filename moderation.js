/* ══════════════════════════════════════════════════
   EYLOX AI MODERATION ENGINE  v1.0
   Auto-detects: bad words, spam, exploits,
   fake accounts, hackers
══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Bad-word list ── */
  const BAD_WORDS = [
    'fuck','shit','bitch','asshole','bastard','cunt','dick','cock','pussy',
    'nigger','nigga','faggot','retard','whore','slut','rape','kill yourself',
    'kys','idiot','moron','loser','noob','trash','garbage','scum','hack',
    'cheat','exploit','bypass','inject','crash','ddos','flood','spam',
    'bot','scam','phish','virus','malware','password','credit card',
    'free robux','free coins','hack coins','admin abuse'
  ];

  /* ── Spam threshold: messages per window ── */
  const SPAM_WINDOW_MS  = 8000;
  const SPAM_THRESHOLD  = 5;

  /* ── Exploit coin ceiling (above this = suspicious) ── */
  const MAX_LEGIT_COINS = 250000;
  const MAX_LEGIT_WINS  = 50000;

  /* ── localStorage keys ── */
  const LOG_KEY       = 'eylox_mod_log';
  const FLAGS_KEY     = 'eylox_mod_flags';
  const MOD_STATS_KEY = 'eylox_mod_stats';

  /* ─────────────────────────────────────────
     INTERNAL HELPERS
  ───────────────────────────────────────── */
  function getLog()   { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; } }
  function getFlags() { try { return JSON.parse(localStorage.getItem(FLAGS_KEY) || '{}'); } catch { return {}; } }
  function getStats() { try { return JSON.parse(localStorage.getItem(MOD_STATS_KEY) || '{"bad":0,"spam":0,"exploit":0,"fake":0,"hacker":0}'); } catch { return {bad:0,spam:0,exploit:0,fake:0,hacker:0}; } }

  function saveLog(log) {
    if (log.length > 300) log.length = 300;
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  }

  function addEntry(entry) {
    const log = getLog();
    log.unshift({ ts: Date.now(), ...entry });
    saveLog(log);

    /* Update stats */
    const stats = getStats();
    const cat = {
      BAD_WORD: 'bad', SPAM: 'spam', REPEAT_SPAM: 'spam',
      EXPLOIT: 'exploit', COIN_EXPLOIT: 'exploit',
      FAKE_ACCOUNT: 'fake', BOT_PATTERN: 'fake',
      HACKER: 'hacker', LS_TAMPER: 'hacker'
    };
    const key = cat[entry.type];
    if (key) { stats[key] = (stats[key] || 0) + 1; localStorage.setItem(MOD_STATS_KEY, JSON.stringify(stats)); }

    /* Update flag count for admin sidebar */
    const flags = getFlags();
    if (entry.user) {
      if (!flags[entry.user]) flags[entry.user] = [];
      flags[entry.user].push({ type: entry.type, ts: entry.ts || Date.now() });
      localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
    }

    /* Dispatch event so admin panel can react live */
    try { window.dispatchEvent(new CustomEvent('eylox:moderation', { detail: entry })); } catch {}
    return entry;
  }

  /* ─────────────────────────────────────────
     1. MESSAGE CHECK  (bad words + spam)
  ───────────────────────────────────────── */
  function checkMessage(text, username) {
    if (!text || typeof text !== 'string') return [];
    const results = [];
    const lower   = text.toLowerCase().trim();
    username = username || 'unknown';

    /* Bad word scan */
    for (const w of BAD_WORDS) {
      if (lower.includes(w)) {
        results.push(addEntry({
          type: 'BAD_WORD', severity: 'critical', user: username,
          detail: `Blocked message containing forbidden word — "${text.slice(0, 40)}"`
        }));
        break;
      }
    }

    /* Spam rate detection */
    const spamKey = 'eylox_spamwin_' + username;
    let sw;
    try { sw = JSON.parse(localStorage.getItem(spamKey) || '{"c":0,"t":0}'); } catch { sw = {c:0,t:0}; }
    const now = Date.now();
    if (now - sw.t > SPAM_WINDOW_MS) { sw = { c: 1, t: now }; }
    else { sw.c++; }
    localStorage.setItem(spamKey, JSON.stringify(sw));
    if (sw.c >= SPAM_THRESHOLD) {
      results.push(addEntry({
        type: 'SPAM', severity: 'critical', user: username,
        detail: `Spam detected — ${sw.c} messages in ${SPAM_WINDOW_MS / 1000}s`
      }));
    }

    /* Repeated message */
    const lastKey = 'eylox_lastmsg_' + username;
    const lastMsg = localStorage.getItem(lastKey) || '';
    if (text.length > 4 && text === lastMsg) {
      results.push(addEntry({
        type: 'REPEAT_SPAM', severity: 'warn', user: username,
        detail: `Identical repeated message: "${text.slice(0, 40)}"`
      }));
    }
    localStorage.setItem(lastKey, text);

    return results;
  }

  /* ─────────────────────────────────────────
     2. USER CHECK  (fake accounts + exploits)
  ───────────────────────────────────────── */
  function checkUser(userData) {
    if (!userData || !userData.username) return [];
    const results = [];
    const u  = userData;
    const un = u.username;

    /* Fake / bot account pattern — all digits after letters */
    if (/^[a-z]{1,5}\d{5,}$/i.test(un)) {
      results.push(addEntry({
        type: 'BOT_PATTERN', severity: 'warn', user: un,
        detail: `Username matches bot pattern: "${un}"`
      }));
    }

    /* Suspicious username: only numbers */
    if (/^\d+$/.test(un)) {
      results.push(addEntry({
        type: 'FAKE_ACCOUNT', severity: 'warn', user: un,
        detail: `Username is all numbers — potential fake account: "${un}"`
      }));
    }

    /* Coin exploit */
    if ((u.coins || 0) > MAX_LEGIT_COINS) {
      results.push(addEntry({
        type: 'COIN_EXPLOIT', severity: 'critical', user: un,
        detail: `Coin value out of range: ${(u.coins).toLocaleString()} coins`
      }));
    }

    /* Wins exploit */
    if ((u.wins || 0) > MAX_LEGIT_WINS) {
      results.push(addEntry({
        type: 'EXPLOIT', severity: 'critical', user: un,
        detail: `Win count out of range: ${u.wins} wins`
      }));
    }

    /* localStorage snapshot comparison — detect sudden jumps */
    const snapKey = 'eylox_snap_' + un;
    let snap;
    try { snap = JSON.parse(localStorage.getItem(snapKey) || 'null'); } catch { snap = null; }
    if (snap && (u.coins || 0) > (snap.coins || 0) * 15 + 5000) {
      results.push(addEntry({
        type: 'HACKER', severity: 'critical', user: un,
        detail: `Coins jumped from ${snap.coins} → ${u.coins} — possible localStorage hack`
      }));
    }
    /* Save new snapshot */
    localStorage.setItem(snapKey, JSON.stringify({ coins: u.coins || 0, wins: u.wins || 0, ts: Date.now() }));

    return results;
  }

  /* ─────────────────────────────────────────
     3. SCORE / EXPLOIT CHECK
  ───────────────────────────────────────── */
  function checkScore(score, username) {
    if (!score || isNaN(score)) return [];
    const results = [];
    username = username || 'unknown';
    if (score > 9999999) {
      results.push(addEntry({
        type: 'EXPLOIT', severity: 'critical', user: username,
        detail: `Impossible game score submitted: ${score.toLocaleString()}`
      }));
    }
    return results;
  }

  /* ─────────────────────────────────────────
     4. HACKER DETECTION — localStorage
  ───────────────────────────────────────── */
  function checkLocalStorage() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u) return;

      /* Check for direct localStorage manipulation markers */
      const integrityKey = 'eylox_integrity';
      const expected = btoa((u.username || '') + ':' + String(Math.floor((u.coins || 0) / 100)));
      const stored   = localStorage.getItem(integrityKey);
      if (stored && stored !== expected && (u.coins || 0) > 1000) {
        addEntry({
          type: 'LS_TAMPER', severity: 'critical', user: u.username,
          detail: `localStorage integrity mismatch — possible console hack detected`
        });
      }
      /* Write new integrity marker */
      localStorage.setItem(integrityKey, expected);

      checkUser(u);
    } catch {}
  }

  /* ─────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────── */
  window.EyloxMod = {
    checkMessage,
    checkUser,
    checkScore,
    checkLocalStorage,
    getLog,
    getFlags,
    getStats,
    clearLog() {
      localStorage.removeItem(LOG_KEY);
      localStorage.removeItem(FLAGS_KEY);
      localStorage.removeItem(MOD_STATS_KEY);
    },
    getFlagCount() {
      const flags = getFlags();
      return Object.keys(flags).length;
    }
  };

  /* ─────────────────────────────────────────
     AUTO-SCAN EVERY 60s
  ───────────────────────────────────────── */
  setInterval(checkLocalStorage, 60000);
  /* Run once on load */
  setTimeout(checkLocalStorage, 2000);

})();
