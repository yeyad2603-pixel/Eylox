/* ============================================================
   EYLOX — Session Tracker
   Records real game sessions + leaderboard scores to localStorage.
   Same pattern as global chat's eylox_chat_count.
   ============================================================ */
'use strict';

(function EyloxSessionTracker() {

  const SESSION_KEY = 'eylox_game_sessions'; // [ {id, user, title, t} ]
  const LB_KEY      = 'eylox_lb_entries';    // [ {user, avatar, score, game, gameId, ts} ]
  const MAX_SESSIONS = 500;
  const MAX_LB       = 300;
  const DAY_MS       = 86400000;
  const WEEK_MS      = 7 * DAY_MS;

  /* ── Read helpers ── */
  function getSessions() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]'); } catch { return []; }
  }
  function getLbEntries() {
    try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]'); } catch { return []; }
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; }
  }

  /* ── Record a game session start + bump gamesPlayed on user object ── */
  function record(gameId, username, gameTitle) {
    try {
      const uObj = getUser();
      const uName = username || uObj?.username || 'Player';
      const sessions = getSessions();
      sessions.push({ id: gameId, user: uName, title: gameTitle || gameId, t: Date.now() });
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessions.slice(-MAX_SESSIONS)));
      /* Persist gamesPlayed directly on user object */
      if (uObj) {
        uObj.gamesPlayed = (uObj.gamesPlayed || 0) + 1;
        localStorage.setItem('eylox_user', JSON.stringify(uObj));
        if (uObj.username) localStorage.setItem('eylox_userdata_' + uObj.username, JSON.stringify(uObj));
      }
    } catch {}
  }

  /* ── Save a completed game score to the leaderboard ── */
  function saveScore(gameId, gameTitle, score, awardWin) {
    try {
      const u = getUser();
      if (!u || !u.username) return;
      const finalScore = Math.floor(score);
      const entries = getLbEntries();
      /* Check if this is a personal best for this game */
      const prevBest = entries.filter(e => e.user === u.username && e.gameId === gameId)
                              .reduce((best, e) => Math.max(best, e.score), 0);
      const isNewBest = finalScore > prevBest;
      entries.push({
        user:   u.username,
        avatar: u.avatar || '🎮',
        score:  finalScore,
        game:   gameTitle || gameId,
        gameId: gameId,
        ts:     Date.now(),
      });
      localStorage.setItem(LB_KEY, JSON.stringify(entries.slice(-MAX_LB)));
      /* Award win on new personal best (3D games pass awardWin=true always) */
      if (isNewBest || awardWin) {
        u.wins = (u.wins || 0) + 1;
        localStorage.setItem('eylox_user', JSON.stringify(u));
        if (u.username) localStorage.setItem('eylox_userdata_' + u.username, JSON.stringify(u));
      }
    } catch {}
  }

  /* ── Count real sessions per game (last 24h) ── */
  function countForGame(gameId, windowMs = DAY_MS) {
    const cutoff = Date.now() - windowMs;
    return getSessions().filter(s => s.id === gameId && s.t >= cutoff).length;
  }

  /* ── Count map: gameId → count for all games ── */
  function countAll(windowMs = DAY_MS) {
    const cutoff = Date.now() - windowMs;
    const map = {};
    getSessions().filter(s => s.t >= cutoff).forEach(s => {
      map[s.id] = (map[s.id] || 0) + 1;
    });
    return map;
  }

  /* ── Build leaderboard: best score per user, last 7 days ── */
  function getLeaderboard(windowMs = WEEK_MS) {
    const cutoff = Date.now() - windowMs;
    const entries = getLbEntries().filter(e => e.ts >= cutoff);
    const best = {};
    entries.forEach(e => {
      if (!best[e.user] || e.score > best[e.user].score) best[e.user] = e;
    });
    return Object.values(best).sort((a, b) => b.score - a.score);
  }

  /* ── Total play count for a game (all time) ── */
  function totalPlays(gameId) {
    return getSessions().filter(s => s.id === gameId).length;
  }

  window.EyloxSessionTracker = { record, saveScore, countForGame, countAll, getLeaderboard, totalPlays };

})();
