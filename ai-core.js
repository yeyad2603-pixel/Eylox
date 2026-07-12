/* ============================================================
   EYLOX — AI Core
   Shared AI foundation: builds a real player taste profile from
   actual play history and powers personalized recommendations.
   No fake/simulated data — returns null/empty when there's no
   real signal yet. Other AI features should extend window.EyloxAI
   instead of creating their own AI state.
   ============================================================ */
'use strict';

(function EyloxAICore() {

  const PROFILE_KEY = 'eylox_ai_profile';
  const HISTORY_KEY = 'eylox_recently_played';

  /* Catalog restricted to games whose badge/thumb classes exist in style.css */
  const CATALOG = {
    'ninja-dash':    { name:'Ninja Dash',    genre:'action',    emoji:'🥷', badgeClass:'b-action',    thumbClass:'t-purple' },
    'sky-riders':    { name:'Sky Riders',    genre:'racing',    emoji:'✈️', badgeClass:'b-racing',    thumbClass:'t-blue'   },
    'dragon-escape': { name:'Dragon Escape', genre:'survival',  emoji:'🐉', badgeClass:'b-survival',  thumbClass:'t-pink'   },
    'puzzle-palace': { name:'Puzzle Palace', genre:'puzzle',    emoji:'🧩', badgeClass:'b-puzzle',    thumbClass:'t-green'  },
    'ocean-quest':   { name:'Ocean Quest',   genre:'adventure', emoji:'🌊', badgeClass:'b-adventure', thumbClass:'t-teal'   },
    'block-kingdom': { name:'Block Kingdom', genre:'building',  emoji:'🧱', badgeClass:'b-building',  thumbClass:'t-yellow' },
    'farm-friends':  { name:'Farm Friends',  genre:'roleplay',  emoji:'🌾', badgeClass:'b-roleplay',  thumbClass:'t-indigo' },
    'space-blaster': { name:'Space Blaster', genre:'action',    emoji:'🚀', badgeClass:'b-action',    thumbClass:'t-purple' },
    'haunted-house': { name:'Haunted House', genre:'survival',  emoji:'👻', badgeClass:'b-survival',  thumbClass:'t-pink'   },
    'race-city':     { name:'Race City',     genre:'racing',    emoji:'🏎️', badgeClass:'b-racing',    thumbClass:'t-yellow' },
    'jungle-run':    { name:'Jungle Run',    genre:'adventure', emoji:'🌿', badgeClass:'b-adventure', thumbClass:'t-green'  },
    'candy-chaos':   { name:'Candy Chaos',   genre:'action',    emoji:'🍭', badgeClass:'b-action',    thumbClass:'t-pink'   },
    'ice-fortress':  { name:'Ice Fortress',  genre:'building',  emoji:'❄️', badgeClass:'b-building',  thumbClass:'t-blue'   },
    'logic-lab':     { name:'Logic Lab',     genre:'puzzle',    emoji:'🧬', badgeClass:'b-puzzle',    thumbClass:'t-teal'   },
    'pirate-bay':    { name:'Pirate Bay',    genre:'adventure', emoji:'🏴‍☠️', badgeClass:'b-adventure', thumbClass:'t-yellow' },
    'treasure-hunt': { name:'Treasure Hunt', genre:'adventure', emoji:'💎', badgeClass:'b-adventure', thumbClass:'t-teal'   },
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  /* Builds a real profile from real play history. No signal → empty profile. */
  function buildProfile() {
    const history = readJSON(HISTORY_KEY, []);
    const playedIds = (Array.isArray(history) ? history : [])
      .map(entry => (entry && entry.id) || (typeof entry === 'string' ? entry : null))
      .filter(Boolean);

    const genreCounts = {};
    playedIds.forEach(id => {
      const genre = CATALOG[id] && CATALOG[id].genre;
      if (genre) genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    const profile = { genreCounts, topGenres, playedIds, updatedAt: Date.now() };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
    return profile;
  }

  function getProfile() {
    return buildProfile();
  }

  function scoreGame(id, game, profile) {
    let score = Math.random() * 0.25; /* small jitter so picks don't feel static */
    const rank = profile.topGenres.indexOf(game.genre);
    if (rank === 0) score += 3;
    else if (rank === 1) score += 2;
    else if (rank > 1) score += 1;
    if (profile.playedIds.includes(id)) score -= 5; /* favor variety over repeats */
    return score;
  }

  /* Returns [] when there's no real signal yet — never fabricates picks. */
  function recommendGames(n, opts) {
    n = n || 4;
    opts = opts || {};
    const profile = getProfile();
    if (!profile.topGenres.length) return [];

    const exclude = new Set(opts.excludeIds || []);
    return Object.entries(CATALOG)
      .filter(([id]) => !exclude.has(id))
      .map(([id, game]) => Object.assign({ id, score: scoreGame(id, game, profile) }, game))
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }

  function greetReturning() {
    const profile = getProfile();
    if (!profile.topGenres.length) return null;
    const genre = profile.topGenres[0];
    const label = genre.charAt(0).toUpperCase() + genre.slice(1);
    return `Welcome back! Since you've been playing ${label} games, want a few picks? Just ask me to recommend something. 🎮`;
  }

  window.EyloxAI = {
    CATALOG,
    getProfile,
    Recommend: { games: recommendGames },
    greetReturning,
  };

})();
