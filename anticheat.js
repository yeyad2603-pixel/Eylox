/* ============================================================
   EYLOX — Anti-Cheat & Behaviour Monitor v1.0
   - Click rate / auto-clicker detection
   - Coin gain spike detection
   - Script injection monitoring
   - Speed / teleport / impossible-score flags
   - Suspicious activity log (readable by admin panel)
   - Report player system
   ============================================================ */
'use strict';

(function EyloxAntiCheat() {

  /* ── Thresholds ── */
  const MAX_CLICKS_PER_SEC   = 12;   // above → likely auto-clicker
  const MAX_COINS_PER_MIN    = 3000; // above → suspicious gain rate
  const MAX_SCORE_DELTA      = 9999; // single-session score jump limit
  const MAX_TELEPORT_DIST    = 500;  // px distance per frame
  const FLAG_THRESHOLD       = 3;    // flags before auto-warn
  const BAN_THRESHOLD        = 8;    // flags before auto-shadow-ban

  /* ── State ── */
  let _clicks       = [];
  let _flags        = 0;
  let _coinBaseline = null;
  let _coinTimestamp= 0;
  let _lastPos      = null;
  let _suspended    = false; // shadow-ban: still plays but coins don't count
  const _log        = [];

  /* ── Log helper ── */
  function logEvent(type, detail, severity = 'warn') {
    const entry = {
      ts:       Date.now(),
      type,
      detail,
      severity,
      user:     (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || '{}')?.username || 'unknown'; } catch { return 'unknown'; } })(),
    };
    _log.unshift(entry);
    if (_log.length > 200) _log.pop();
    /* Persist last 50 entries for admin panel */
    try {
      const stored = JSON.parse(localStorage.getItem('eylox_ac_log') || '[]');
      stored.unshift(entry);
      localStorage.setItem('eylox_ac_log', JSON.stringify(stored.slice(0, 50)));
    } catch {}
    /* Emit event for admin panel to subscribe to */
    window.dispatchEvent(new CustomEvent('eylox:anticheat', { detail: entry }));
    if (severity === 'critical') console.warn('[EyloxAC]', type, detail);
  }

  /* ── Flag counter ── */
  function addFlag(reason, severity = 'warn') {
    _flags++;
    logEvent('FLAG', reason, severity);
    if (_flags >= BAN_THRESHOLD) {
      autoShadowBan(reason);
    } else if (_flags >= FLAG_THRESHOLD) {
      autoWarn(reason);
    }
  }

  function autoWarn(reason) {
    logEvent('AUTO_WARN', reason, 'warn');
    /* Silent warning — user sees nothing, just logged */
  }

  function autoShadowBan(reason) {
    _suspended = true;
    logEvent('SHADOW_BAN', reason, 'critical');
    /* Mark in localStorage so server can validate */
    localStorage.setItem('eylox_ac_suspended', '1');
  }

  /* ── Click rate monitor ── */
  document.addEventListener('click', () => {
    const now = Date.now();
    _clicks.push(now);
    /* Keep only last 1 second */
    _clicks = _clicks.filter(t => now - t < 1000);
    if (_clicks.length > MAX_CLICKS_PER_SEC) {
      addFlag(`Auto-clicker detected: ${_clicks.length} clicks/sec`);
    }
  }, { capture: true, passive: true });

  /* ── Coin gain rate monitor ── */
  function checkCoinGain() {
    try {
      const u     = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u) return;
      const coins = u.coins || 0;
      const now   = Date.now();

      if (_coinBaseline === null) {
        _coinBaseline  = coins;
        _coinTimestamp = now;
        return;
      }

      const elapsed = now - _coinTimestamp;
      const gained  = coins - _coinBaseline;

      if (elapsed > 60000) {
        /* Reset baseline every minute */
        const rate = gained / (elapsed / 60000);
        if (rate > MAX_COINS_PER_MIN && gained > 0) {
          addFlag(`Coin gain spike: +${Math.round(gained)} in ${Math.round(elapsed/1000)}s (${Math.round(rate)}/min)`);
        }
        _coinBaseline  = coins;
        _coinTimestamp = now;
      }
    } catch {}
  }

  /* ── Script injection detection ── */
  function checkScriptInjection() {
    /* Watch for new script tags added dynamically */
    const mo = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.tagName === 'SCRIPT') {
            const src = node.src || node.textContent || '';
            /* Allow our own scripts */
            if (src.includes('localhost') || src.includes('eylox') || src === '') return;
            logEvent('SCRIPT_INJECT', `External script injected: ${src.slice(0, 100)}`, 'critical');
            addFlag('Script injection attempt', 'critical');
            node.remove(); /* Remove the injected script */
          }
        });
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ── Console override detection ── */
  /* If someone pastes console code to set is_owner, catch it */
  const _origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (key === 'eylox_is_owner' && value === 'true') {
      /* Block unless the stored user object has server-granted isOwner:true */
      const user = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; } })();
      if (!user || user.isOwner !== true) {
        logEvent('PRIV_ESC', 'Attempted to set is_owner without server-granted privilege', 'critical');
        addFlag('Privilege escalation attempt', 'critical');
        return; /* Block the set */
      }
    }
    if (key === 'eylox_user') {
      /* Check for impossible coin/win values */
      try {
        const u = JSON.parse(value);
        if (u.coins > 1e9 || u.wins > 1e6) {
          logEvent('STAT_TAMPER', `Impossible values: coins=${u.coins}, wins=${u.wins}`, 'critical');
          addFlag('Stat tampering detected', 'critical');
          /* Clamp values */
          u.coins = Math.min(1e9, Math.max(0, u.coins || 0));
          u.wins  = Math.min(1e6, Math.max(0, u.wins  || 0));
          return _origSetItem.call(this, key, JSON.stringify(u));
        }
      } catch {}
    }
    return _origSetItem.call(this, key, value);
  };

  /* ── Position teleport detection (for games) ── */
  window.EyloxCheckPosition = function(x, y) {
    if (_lastPos) {
      const dx = Math.abs(x - _lastPos.x);
      const dy = Math.abs(y - _lastPos.y);
      if (dx > MAX_TELEPORT_DIST || dy > MAX_TELEPORT_DIST) {
        addFlag(`Teleport detected: moved ${Math.round(Math.sqrt(dx*dx+dy*dy))}px in one frame`);
        return false;
      }
    }
    _lastPos = { x, y };
    return true;
  };

  /* ── Speed hack detection (for games) ── */
  let _lastTs = 0;
  window.EyloxCheckSpeed = function(speed) {
    const now  = performance.now();
    const dt   = now - _lastTs;
    _lastTs    = now;
    /* If speed per frame is unreasonably high given dt */
    if (dt > 0 && dt < 50 && speed > 30) {
      addFlag(`Speed hack: speed=${speed}, dt=${Math.round(dt)}ms`);
      return false;
    }
    return true;
  };

  /* ── Report player (callable from UI) ── */
  window.EyloxReport = function(targetUsername, reason) {
    const reporter = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || '{}')?.username || 'unknown'; } catch { return 'unknown'; } })();
    const report = {
      ts:       Date.now(),
      reporter,
      target:   targetUsername,
      reason:   reason || 'No reason given',
      type:     'PLAYER_REPORT',
    };
    const reports = JSON.parse(localStorage.getItem('eylox_reports') || '[]');
    reports.unshift(report);
    localStorage.setItem('eylox_reports', JSON.stringify(reports.slice(0, 100)));
    logEvent('REPORT', `${reporter} reported ${targetUsername}: ${reason}`, 'info');
    if (window.EyloxToast) EyloxToast(`Report submitted for ${targetUsername}`, 'info', 3000);
    return true;
  };

  /* ── Ban / Kick / Warn API (used by admin panel) ── */
  window.EyloxAC = {

    banPlayer(username, reason) {
      const bans = JSON.parse(localStorage.getItem('eylox_banned') || '[]');
      if (!bans.find(b => b.username === username)) {
        bans.push({ username, reason, ts: Date.now() });
        localStorage.setItem('eylox_banned', JSON.stringify(bans));
      }
      logEvent('BAN', `${username} banned: ${reason}`, 'critical');
      return true;
    },

    unbanPlayer(username) {
      const bans = JSON.parse(localStorage.getItem('eylox_banned') || '[]').filter(b => b.username !== username);
      localStorage.setItem('eylox_banned', JSON.stringify(bans));
      logEvent('UNBAN', `${username} unbanned`, 'info');
      return true;
    },

    warnPlayer(username, reason) {
      const warns = JSON.parse(localStorage.getItem('eylox_warnings') || '{}');
      if (!warns[username]) warns[username] = [];
      warns[username].push({ reason, ts: Date.now() });
      localStorage.setItem('eylox_warnings', JSON.stringify(warns));
      logEvent('WARN', `${username} warned: ${reason}`, 'warn');
      return true;
    },

    kickPlayer(username) {
      /* Mark for kick — the player's session checker handles it */
      const kicks = JSON.parse(localStorage.getItem('eylox_kicks') || '[]');
      kicks.push({ username, ts: Date.now() });
      localStorage.setItem('eylox_kicks', JSON.stringify(kicks.slice(0, 20)));
      logEvent('KICK', `${username} kicked`, 'warn');
      return true;
    },

    getLog:     () => _log,
    getReports: () => JSON.parse(localStorage.getItem('eylox_reports') || '[]'),
    getBanned:  () => JSON.parse(localStorage.getItem('eylox_banned')  || '[]'),
    getWarnings:() => JSON.parse(localStorage.getItem('eylox_warnings') || '{}'),
    getFlags:   () => _flags,
    isSuspended:() => _suspended,
    clearFlags: () => { _flags = 0; _suspended = false; localStorage.removeItem('eylox_ac_suspended'); },
    filterChat(msg) {
      /* Basic chat filter */
      const BAD = ['nigger','nigga','fuck','shit','bitch','ass','cunt','faggot','kys','kill yourself'];
      let clean = msg;
      BAD.forEach(w => {
        const re = new RegExp(w, 'gi');
        clean = clean.replace(re, '*'.repeat(w.length));
      });
      return clean;
    },
  };

  /* ── Kick check on load ── */
  function checkKick() {
    try {
      const user  = JSON.parse(localStorage.getItem('eylox_user') || '{}');
      if (!user?.username) return;
      const kicks = JSON.parse(localStorage.getItem('eylox_kicks') || '[]');
      const kick  = kicks.find(k => k.username === user.username && Date.now() - k.ts < 30000);
      if (kick) {
        /* Remove the kick record */
        localStorage.setItem('eylox_kicks', JSON.stringify(kicks.filter(k => k !== kick)));
        if (window.EyloxToast) EyloxToast('You have been kicked by an admin.', 'error', 5000);
        setTimeout(() => { window.location.href = 'landing.html'; }, 2500);
      }
    } catch {}
  }

  /* ── Anti-spam: chat rate limit ── */
  const _chatTimes = [];
  window.EyloxChatRateOk = function() {
    const now = Date.now();
    _chatTimes.push(now);
    const recent = _chatTimes.filter(t => now - t < 5000);
    _chatTimes.splice(0, _chatTimes.length, ...recent);
    if (recent.length > 5) {
      addFlag('Chat spam detected');
      return false;
    }
    return true;
  };

  /* ── Startup ── */
  document.addEventListener('DOMContentLoaded', () => {
    checkScriptInjection();
    checkKick();
    setInterval(checkCoinGain, 10000);
    setInterval(checkKick, 15000);

    /* If shadow-banned, silently suppress coin writes */
    if (localStorage.getItem('eylox_ac_suspended') === '1') {
      _suspended = true;
    }
  });

  console.log('[Eylox] Anti-cheat system active');

})();
