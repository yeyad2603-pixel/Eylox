/* ============================================================
   EYLOX — Video Ads System  |  ads.js  v2.0
   YouTube · TikTok · Roblox-inspired
   Canvas hover previews · Cinematic fullscreen · Smart recs
   Creator tools · Analytics · Carousel · Mobile swipe
   ============================================================ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     AD CATALOGUE
  ═══════════════════════════════════════════════════════════ */
  const ADS = [
    {
      id: 'ninja-dash',
      type: 'game',
      badge: 'trending',
      title: 'Ninja Dash',
      tagline: 'Sprint through neon cities at breakneck speed. Can you beat the top 100?',
      icon: '🥷',
      c1: '#0c1829', c2: '#1e3a5f', c3: '#38bdf8',
      views: 142300, likes: 8910,
      link: 'game.html?title=Ninja%20Dash&thumb=%F0%9F%A5%B7',
      particles: ['⚡', '🌟', '💨', '🔥'],
      desc: 'Run, jump, and slide through obstacle-packed neon environments. Unlock abilities, challenge global rivals, and chase the leaderboard crown.',
      prize: '5,000 coins',
      tags: ['action', 'runner', 'neon'],
      dur: '0:38',
    },
    {
      id: 'neon-racer',
      type: 'game',
      badge: 'featured',
      title: 'Neon Racer',
      tagline: 'Full-throttle street racing in a cyberpunk open world.',
      icon: '🏎️',
      c1: '#1a0033', c2: '#4c1d95', c3: '#c084fc',
      views: 98700, likes: 6240,
      link: 'game3d-city.html',
      particles: ['🚀', '⚡', '🔥', '✨'],
      desc: 'Compete in high-octane races through rain-slicked cyberpunk streets. Drift around corners, boost your nitro, and leave rivals in the dust.',
      prize: '8,000 coins',
      tags: ['racing', '3d', 'speed'],
      dur: '0:52',
    },
    {
      id: 'block-stacker',
      type: 'game',
      badge: 'new',
      title: 'Block Stacker',
      tagline: 'Stack perfect towers and defy gravity in 3-D.',
      icon: '🧱',
      c1: '#052e16', c2: '#065f46', c3: '#34d399',
      views: 54200, likes: 3110,
      link: 'game.html?title=Block%20Stacker&thumb=%F0%9F%A7%B1&genre=building',
      particles: ['🧱', '⭐', '🌈', '💥'],
      desc: 'Place blocks with pinpoint precision, build the highest tower, and watch rivals crumble under the pressure. Physics-based chaos awaits.',
      prize: '3,000 coins',
      tags: ['puzzle', '3d', 'chill'],
      dur: '0:29',
    },
    {
      id: 'ocean-cleanup',
      type: 'game',
      badge: 'featured',
      title: 'Ocean Cleanup',
      tagline: 'Sail the high seas and collect treasures for the planet.',
      icon: '🌊',
      c1: '#0c2340', c2: '#1e4976', c3: '#60a5fa',
      views: 73900, likes: 4580,
      link: 'game3d-pirate.html',
      particles: ['🌊', '🐠', '⭐', '💎'],
      desc: 'Captain your ship through crystal waters, dodge sea monsters, and claim legendary loot. Your ocean, your adventure.',
      prize: '6,000 coins',
      tags: ['adventure', '3d', 'ocean'],
      dur: '0:44',
    },
    {
      id: 'crystal-catcher',
      type: 'game',
      badge: 'trending',
      title: 'Crystal Catcher',
      tagline: 'Dive into treasure-filled caverns. Every gem counts.',
      icon: '💎',
      c1: '#3b0764', c2: '#6b21a8', c3: '#e879f9',
      views: 87400, likes: 5670,
      link: 'game3d-treasure.html',
      particles: ['💎', '✨', '🔮', '⭐'],
      desc: 'Spelunk through shimmering caves, navigate deadly traps, and bring home the most valuable crystal haul of all time.',
      prize: '7,500 coins',
      tags: ['adventure', 'puzzle', 'gems'],
      dur: '0:41',
    },
    {
      id: 'candy-chaos',
      type: 'game',
      badge: 'hot',
      title: 'Candy Chaos',
      tagline: 'Sweet obstacles, sticky rivals, and sugar-fuelled chaos!',
      icon: '🍬',
      c1: '#4a0020', c2: '#9f1239', c3: '#fb7185',
      views: 61300, likes: 3920,
      link: 'game.html?title=Candy%20Chaos&thumb=%F0%9F%8D%AC',
      particles: ['🍬', '🍭', '🌈', '💫'],
      desc: 'Navigate a colourful candy world packed with traps, bouncy platforms, and sticky rivals. The sweetest player reaches the finish line.',
      prize: '4,000 coins',
      tags: ['action', 'runner', 'fun'],
      dur: '0:33',
    },
    {
      id: 'sky-fortress',
      type: 'game',
      badge: 'exclusive',
      title: 'Sky Fortress',
      tagline: 'Build, defend, destroy. The skies belong to the bold.',
      icon: '🏰',
      c1: '#1a2050', c2: '#3730a3', c3: '#818cf8',
      views: 112000, likes: 7340,
      link: 'game.html?title=Sky%20Fortress&thumb=%F0%9F%8F%B0&genre=building',
      particles: ['🏰', '⚡', '🌩️', '💥'],
      desc: 'Construct sky citadels from the ground up, rain destruction on enemy bases, and establish dominance at 10,000 feet.',
      prize: '10,000 coins',
      tags: ['builder', 'strategy', 'action'],
      dur: '0:55',
    },
    {
      id: 'ghost-runner',
      type: 'game',
      badge: 'new',
      title: 'Ghost Runner',
      tagline: 'Phase through walls. Outrun the darkness.',
      icon: '👻',
      c1: '#060b1a', c2: '#1e3250', c3: '#4fc3f7',
      views: 43700, likes: 2870,
      link: 'game.html?title=Ghost%20Runner&thumb=%F0%9F%91%BB&genre=action',
      particles: ['👻', '💙', '✨', '🌀'],
      desc: 'Become the ghost — sprint through solid walls, dodge spectral hunters, and unravel the mystery of the haunted labyrinth.',
      prize: '4,500 coins',
      tags: ['action', 'runner', 'spooky'],
      dur: '0:36',
    },
    /* ── Event Ads ── */
    {
      id: 'live-events-promo',
      type: 'event',
      badge: 'live',
      title: 'Live Events Arena',
      tagline: 'Real players. Real stakes. Spin the wheel and win big every hour.',
      icon: '🎡',
      c1: '#1a0533', c2: '#6d28d9', c3: '#f472b6',
      views: 201500, likes: 14800,
      link: 'events.html',
      particles: ['🏆', '🎯', '⚡', '🌟'],
      desc: 'Join thousands of live players in hourly tournaments. Spin the Eylox Wheel for massive coin rewards, exclusive badges, and glory.',
      prize: '25,000 coins',
      countdown: true,
      tags: ['event', 'competitive', 'live'],
      dur: '1:00',
    },
    {
      id: 'weekly-championship',
      type: 'event',
      badge: 'featured',
      title: 'Weekly Championship',
      tagline: 'The top 10 split 50,000 coins every Sunday.',
      icon: '👑',
      c1: '#451a03', c2: '#b45309', c3: '#fbbf24',
      views: 178200, likes: 11600,
      link: 'events.html',
      particles: ['👑', '🏆', '⭐', '💰'],
      desc: 'Rise through the weekly rankings, dominate every challenge, and claim your throne as the champion of Eylox.',
      prize: '50,000 coins',
      countdown: true,
      tags: ['event', 'weekly', 'competitive'],
      dur: '0:48',
    },
  ];

  const CREATORS = [
    {
      id: 'creator-stormx',
      type: 'creator',
      name: 'StormX',
      handle: '@stormxgaming',
      badge: 'Top Creator',
      icon: '⚡',
      c1: '#0f1f40', c2: '#1d4ed8', c3: '#60a5fa',
      subs: '128K', videos: 342, views: '4.2M',
      link: '#',
      particles: ['⚡', '🎮', '🔥', '🌟'],
      desc: 'Speed-running every Eylox game. New uploads every day. Ranked #1 two weeks running.',
      tags: ['speedrun', 'action'],
    },
    {
      id: 'creator-lunax',
      type: 'creator',
      name: 'Luna Plays',
      handle: '@lunaplayslive',
      badge: 'Rising Star',
      icon: '🌙',
      c1: '#1a0533', c2: '#5b21b6', c3: '#c084fc',
      subs: '47K', videos: 118, views: '980K',
      link: '#',
      particles: ['🌙', '✨', '💜', '⭐'],
      desc: 'Chill gaming vibes, strategy breakdowns, and community events every weekend.',
      tags: ['chill', 'strategy'],
    },
    {
      id: 'creator-blaze',
      type: 'creator',
      name: 'BlazeFire99',
      handle: '@blazefire99',
      badge: 'Pro Player',
      icon: '🔥',
      c1: '#3d1500', c2: '#c2410c', c3: '#fb923c',
      subs: '85K', videos: 224, views: '2.1M',
      link: '#',
      particles: ['🔥', '💥', '⚡', '🌋'],
      desc: 'Top-ranked competitor. Tournament replays, tier lists, and challenge battles.',
      tags: ['competitive', 'action'],
    },
    {
      id: 'creator-pixie',
      type: 'creator',
      name: 'PixieCraft',
      handle: '@pixiecraft',
      badge: 'Builder',
      icon: '🎨',
      c1: '#0a2a1e', c2: '#047857', c3: '#34d399',
      subs: '32K', videos: 89, views: '560K',
      link: '#',
      particles: ['🎨', '🌿', '💚', '✨'],
      desc: 'Creative builds, peaceful gameplay, and the most satisfying construction timelapse on Eylox.',
      tags: ['builder', 'chill'],
    },
  ];

  /* ═══════════════════════════════════════════════════════════
     LOCALSTORAGE HELPERS
  ═══════════════════════════════════════════════════════════ */
  const LS = {
    get: (k, def) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch { return def; } },
    set: (k, v)   => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  function getLikes()      { return LS.get('eylox_ad_likes', {}); }
  function saveLikes(obj)  { LS.set('eylox_ad_likes', obj); }
  function getViews()      { return LS.get('eylox_ad_views', {}); }
  function saveViews(obj)  { LS.set('eylox_ad_views', obj); }

  function bumpView(id) {
    const v = getViews();
    v[id] = (v[id] || 0) + 1;
    saveViews(v);
  }
  function totalViews(ad) { const v = getViews(); return (ad.views || 0) + (v[ad.id] || 0); }
  function totalLikes(ad) { const l = getLikes(); return (ad.likes || 0) + (l[ad.id + '_x'] || 0); }
  function isLiked(id)    { return !!getLikes()[id]; }
  function toggleLike(id, ad) {
    const l = getLikes();
    if (l[id]) { delete l[id]; l[id + '_x'] = Math.max(0, (l[id + '_x'] || 0) - 1); }
    else        { l[id] = true; l[id + '_x'] = (l[id + '_x'] || 0) + 1; }
    saveLikes(l);
    return !!l[id];
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  /* ═══════════════════════════════════════════════════════════
     SMART RECOMMENDATIONS
     Matches by: played game tags > unplayed > remaining
  ═══════════════════════════════════════════════════════════ */
  function getRecommended(count) {
    const history  = LS.get('eylox_event_history', []);
    const played   = new Set(history.map(h => h.game || ''));
    const gameAds  = ADS.filter(a => a.type === 'game');

    /* Tag frequency from history */
    const tagScore = {};
    history.forEach(h => {
      (h.tags || []).forEach(t => { tagScore[t] = (tagScore[t] || 0) + 1; });
    });

    /* Score each ad */
    const scored = gameAds.map(a => {
      let score = played.has(a.title) ? 0 : 10;
      (a.tags || []).forEach(t => { score += (tagScore[t] || 0) * 2; });
      if (a.badge === 'trending' || a.badge === 'hot') score += 3;
      if (a.badge === 'featured') score += 2;
      score += Math.random() * 1.5; /* small shuffle */
      return { ad: a, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, count).map(x => x.ad);
  }

  /* ═══════════════════════════════════════════════════════════
     COUNTDOWN HELPERS
  ═══════════════════════════════════════════════════════════ */
  function nextEventMs() {
    const now  = new Date();
    const next = new Date(now);
    next.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
    if (next <= now) next.setMinutes(next.getMinutes() + 30);
    return next - now;
  }
  function msToHHMMSS(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60) % 60;
    const h = Math.floor(s / 3600);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  /* ═══════════════════════════════════════════════════════════
     PARTICLE HTML
  ═══════════════════════════════════════════════════════════ */
  function buildParticles(emojis) {
    return (emojis || []).map((e, i) => {
      const x = 8 + Math.random() * 84;
      const y = 15 + Math.random() * 70;
      const d = 2.4 + Math.random() * 2.2;
      const delay = (i * 0.52).toFixed(2);
      return `<span class="ad-ptcl" style="left:${x.toFixed(0)}%;bottom:${y.toFixed(0)}%;--pd:${d.toFixed(1)}s;--pdelay:${delay}s">${e}</span>`;
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════════
     BUILD AD CARD HTML
  ═══════════════════════════════════════════════════════════ */
  function buildAdCard(ad) {
    const liked      = isLiked(ad.id);
    const views      = fmtNum(totalViews(ad));
    const likes      = fmtNum(totalLikes(ad));
    const dur        = ad.dur || `0:${14 + Math.floor(Math.random() * 44)}`;
    const isCreator  = ad.type === 'creator';
    const isEvent    = ad.type === 'event';
    const typeClass  = isCreator ? ' creator-ad' : isEvent ? ' event-ad' : '';
    const animDur    = (10 + Math.floor(Math.random() * 8)) + 's';
    const progDur    = (12 + Math.floor(Math.random() * 10)) + 's';

    const badgeHTML = ad.badge ? `<div class="ad-badge ad-badge-${ad.badge}">${ad.badge === 'live' ? '🔴 LIVE' : ad.badge === 'hot' ? '🔥 HOT' : ad.badge === 'exclusive' ? '💎 EXCLUSIVE' : ad.badge.toUpperCase()}</div>` : '';

    let bodyExtra = '';
    if (isCreator) {
      bodyExtra = `
        <div class="creator-stats-row">
          <div class="creator-stat">Subs <span>${ad.subs}</span></div>
          <div class="creator-stat">Videos <span>${ad.videos}</span></div>
          <div class="creator-stat">Views <span>${ad.views}</span></div>
        </div>`;
    } else if (isEvent && ad.countdown) {
      bodyExtra = `
        <div class="ad-event-countdown">
          <div class="ad-event-cd-label">⏱ Next Event</div>
          <div class="ad-event-cd-time" data-ad-countdown="${ad.id}">${msToHHMMSS(nextEventMs())}</div>
        </div>
        <div class="ad-event-prize">🏆 Prize Pool: ${ad.prize}</div>`;
    }

    const previewInner = isCreator ? `
      <div class="creator-info">
        <div class="creator-name">${ad.name}</div>
        <div class="creator-handle">${ad.handle}</div>
        <div class="creator-badge">⭐ ${ad.badge}</div>
      </div>` : '';

    const ctaLabel = isEvent ? '🎡 Join Event' : isCreator ? '📺 Watch Channel' : '🎮 Play Now';

    return `
    <div class="eylox-ad${typeClass}" data-ad-id="${ad.id}" tabindex="0"
         style="--ad-c1:${ad.c1};--ad-c2:${ad.c2};--ad-c3:${ad.c3};--ad-dur:${animDur}"
         role="article" aria-label="${ad.title || ad.name} ad">
      <div class="ad-preview">
        <canvas class="ad-canvas"></canvas>
        <div class="ad-preview-bg"></div>
        <div class="ad-scan-lines"></div>
        <div class="ad-sweep"></div>
        <div class="ad-vignette"></div>
        <div class="ad-particles">${buildParticles(ad.particles)}</div>
        <div class="ad-icon">${ad.icon}</div>
        ${previewInner}
        <div class="ad-play-overlay">
          <div class="ad-play-btn">▶</div>
        </div>
        <div class="ad-now-playing"></div>
        <button class="ad-sound-btn" data-ad-sound="${ad.id}" aria-label="Toggle sound">🔇</button>
        <div class="ad-progress-track">
          <div class="ad-progress-fill" style="--ad-dur:${progDur}"></div>
        </div>
        <div class="ad-duration">${dur}</div>
        ${badgeHTML}
      </div>
      <div class="ad-body">
        <div class="ad-top-row">
          <div class="ad-game-icon">${ad.icon}</div>
          <div class="ad-title">${ad.title || ad.name}</div>
        </div>
        <div class="ad-tagline">${ad.tagline || ''}</div>
        ${bodyExtra}
        <div class="ad-stats-row">
          <div class="ad-stat views">👁 ${views}</div>
          <div class="ad-stat">⭐ ${ad.badge || 'ad'}</div>
          <button class="ad-like-btn${liked ? ' liked' : ''}" data-ad-like="${ad.id}" aria-label="Like">
            <span>❤</span> <span class="like-count">${likes}</span>
          </button>
        </div>
        <div class="ad-bottom-row">
          <button class="ad-cta-btn" data-ad-cta="${ad.id}">${ctaLabel}</button>
          <span class="ad-sponsor-badge">AD</span>
        </div>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════════════════
     BUILD AD STRIP
  ═══════════════════════════════════════════════════════════ */
  function buildStrip(label, ads, layout = 'scroll') {
    const cards = ads.map(a => buildAdCard(a)).join('');
    const inner = layout === 'grid'
      ? `<div class="eylox-ad-row">${cards}</div>`
      : `<div class="eylox-ad-strip-scroll">${cards}</div>`;
    return `
    <div class="eylox-ad-strip">
      <div class="eylox-ad-strip-hd">
        <span class="eylox-ad-strip-label">${label}</span>
        <div class="eylox-ad-strip-line"></div>
      </div>
      ${inner}
    </div>`;
  }

  /* ═══════════════════════════════════════════════════════════
     CANVAS PER-CARD HOVER VIDEO SIMULATION
  ═══════════════════════════════════════════════════════════ */
  let _activeCanvas = null, _activeCtx = null, _activeRaf = null, _activeCard = null;

  function hexToRgb(hex) {
    hex = (hex || '#000000').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function startCardPreview(card, ad) {
    stopCardPreview();
    const canvas = card.querySelector('.ad-canvas');
    if (!canvas) return;

    _activeCanvas = canvas;
    _activeCard   = card;
    canvas.width  = card.querySelector('.ad-preview')?.offsetWidth  || 284;
    canvas.height = card.querySelector('.ad-preview')?.offsetHeight || 196;
    _activeCtx = canvas.getContext('2d');
    card.classList.add('playing');
    card.querySelector('.ad-play-btn').textContent = '■';

    const [r1,g1,b1] = hexToRgb(ad.c1);
    const [r2,g2,b2] = hexToRgb(ad.c2);
    const [r3,g3,b3] = hexToRgb(ad.c3);
    const emojis = ad.particles || ['✨'];

    /* Particles for canvas "video" */
    const pts = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * 1.4,
      vy: -(Math.random() * 1.8 + .6),
      size: .9 + Math.random() * .6,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    /* Orbs */
    const orbs = Array.from({ length: 3 }, (_, i) => ({
      phase: i * 1.4,
      xFrac: .2 + .3 * i,
      yFrac: .5,
      r: 28 + i * 18,
    }));

    let t = 0;
    function draw() {
      const w = _activeCanvas.width, h = _activeCanvas.height;
      const ct = _activeCtx;
      t += 0.012;

      const f1 = (Math.sin(t) + 1) / 2;
      const f2 = (Math.sin(t * 1.4 + 1) + 1) / 2;
      const rA = lerp(r1,r2,f1)|0, gA = lerp(g1,g2,f1)|0, bA = lerp(b1,b2,f1)|0;
      const rB = lerp(r2,r3,f2)|0, gB = lerp(g2,g3,f2)|0, bB = lerp(b2,b3,f2)|0;

      const grd = ct.createLinearGradient(0,0,w,h);
      grd.addColorStop(0, `rgb(${rA},${gA},${bA})`);
      grd.addColorStop(1, `rgb(${rB},${gB},${bB})`);
      ct.fillStyle = grd;
      ct.fillRect(0, 0, w, h);

      /* Orbs */
      orbs.forEach(o => {
        const ox = w * o.xFrac + Math.sin(t + o.phase) * 28;
        const oy = h * o.yFrac + Math.cos(t * .9 + o.phase) * 18;
        const og = ct.createRadialGradient(ox,oy,0, ox,oy,o.r);
        og.addColorStop(0, 'rgba(255,255,255,0.14)');
        og.addColorStop(1, 'rgba(255,255,255,0)');
        ct.fillStyle = og;
        ct.beginPath(); ct.arc(ox,oy,o.r,0,Math.PI*2); ct.fill();
      });

      /* Emoji particles */
      ct.save();
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -24) { p.y = h + 8; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 5;
        if (p.x > w+10) p.x = -5;
        ct.globalAlpha = .55;
        ct.font = `${p.size * 18}px serif`;
        ct.fillText(p.emoji, p.x, p.y);
      });
      ct.restore();

      /* Scan lines */
      ct.fillStyle = 'rgba(0,0,0,0.05)';
      for (let y = 0; y < h; y += 4) ct.fillRect(0, y, w, 1);

      _activeRaf = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopCardPreview() {
    if (_activeRaf) { cancelAnimationFrame(_activeRaf); _activeRaf = null; }
    if (_activeCard) {
      _activeCard.classList.remove('playing');
      const pb = _activeCard.querySelector('.ad-play-btn');
      if (pb) pb.textContent = '▶';
      _activeCard = null;
    }
    if (_activeCanvas) {
      _activeCanvas.style.opacity = '0';
      _activeCanvas = null; _activeCtx = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CINEMA FULLSCREEN MODAL
  ═══════════════════════════════════════════════════════════ */
  let cinemaCanvas, cinemaCtx, cinemaRaf, currentAd = null;

  function buildCinemaModal() {
    if (document.getElementById('adCinemaOverlay')) return;
    const el = document.createElement('div');
    el.className = 'ad-cinema-overlay';
    el.id        = 'adCinemaOverlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <div class="ad-cinema-panel" id="adCinemaPanel">
        <button class="ad-cinema-close" id="adCinemaClose" aria-label="Close">✕</button>
        <div class="ad-cinema-preview" id="adCinemaPreview">
          <canvas class="ad-cinema-canvas" id="adCinemaCanvas"></canvas>
          <div class="ad-cinema-gradient-overlay"></div>
          <div class="ad-cinema-stats-bar" id="adCinemaStatBar"></div>
          <div class="ad-cinema-icon" id="adCinemaIcon">🎮</div>
          <div class="ad-cinema-particles" id="adCinemaParticles"></div>
        </div>
        <div class="ad-cinema-bottom">
          <div class="ad-cinema-title" id="adCinemaTitle">Loading…</div>
          <div class="ad-cinema-desc"  id="adCinemaDesc"></div>
          <div class="ad-cinema-meta"  id="adCinemaMeta"></div>
          <div class="ad-cinema-actions">
            <button class="ad-cinema-play-btn"  id="adCinemaPlayBtn">▶ Play Now</button>
            <button class="ad-cinema-like-btn"  id="adCinemaLikeBtn">❤ Like</button>
            <button class="ad-cinema-share-btn" id="adCinemaShareBtn">🔗 Share</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);

    document.getElementById('adCinemaClose').addEventListener('click', closeCinema);
    el.addEventListener('click', e => { if (e.target === el) closeCinema(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCinema(); });

    document.getElementById('adCinemaShareBtn').addEventListener('click', () => {
      const ad = currentAd;
      if (!ad) return;
      const msg = `Check out ${ad.title || ad.name} on Eylox! 🎮`;
      if (navigator.share) {
        navigator.share({ title: 'Eylox', text: msg, url: window.location.origin }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).then(() => showToast('📋 Copied to clipboard!'));
      }
    });
  }

  function openCinema(ad) {
    stopCardPreview();
    currentAd = ad;
    bumpView(ad.id);

    document.getElementById('adCinemaIcon').textContent = ad.icon;
    document.getElementById('adCinemaTitle').textContent = ad.title || ad.name;
    document.getElementById('adCinemaDesc').textContent  = ad.desc || ad.tagline;

    const views = fmtNum(totalViews(ad));
    const likes = fmtNum(totalLikes(ad));

    document.getElementById('adCinemaStatBar').innerHTML =
      `${ad.badge ? `<div class="ad-cinema-badge-pill ad-badge-${ad.badge}">${ad.badge === 'live' ? '🔴 LIVE' : ad.badge.toUpperCase()}</div>` : ''}` +
      `<div class="ad-cinema-badge-pill" style="background:rgba(0,0,0,.55);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.12)">${ad.dur || '0:42'}</div>`;

    document.getElementById('adCinemaMeta').innerHTML =
      `<div class="ad-cinema-stat">👁 ${views} views</div>` +
      `<div class="ad-cinema-stat">❤ ${likes} likes</div>` +
      (ad.prize ? `<div class="ad-cinema-stat">🏆 ${ad.prize}</div>` : '') +
      (ad.type === 'game' ? `<div class="ad-cinema-stat">🎮 Game</div>` : '') +
      (ad.type === 'event' ? `<div class="ad-cinema-stat">🎯 Live Event</div>` : '');

    const likeBtn = document.getElementById('adCinemaLikeBtn');
    likeBtn.classList.toggle('liked', isLiked(ad.id));
    likeBtn.onclick = () => {
      toggleLike(ad.id, ad);
      likeBtn.classList.toggle('liked', isLiked(ad.id));
      syncLikeButtons(ad.id);
    };

    const playBtn = document.getElementById('adCinemaPlayBtn');
    const playLabel = ad.type === 'event' ? '🎡 Join Event' : ad.type === 'creator' ? '📺 Watch Channel' : '▶ Play Game';
    playBtn.textContent = playLabel;
    playBtn.onclick = () => { if (ad.link && ad.link !== '#') window.location.href = ad.link; };

    /* Floating particles */
    document.getElementById('adCinemaParticles').innerHTML = (ad.particles || []).map((e, i) => {
      const x = 5 + Math.random() * 90;
      const y = 10 + Math.random() * 80;
      const d = 3 + Math.random() * 2;
      const delay = (i * .65).toFixed(2);
      return `<span class="cinema-particle" style="left:${x.toFixed(0)}%;top:${y.toFixed(0)}%;--cd:${d.toFixed(1)}s;--cdelay:${delay}s">${e}</span>`;
    }).join('');

    document.getElementById('adCinemaOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    startCinemaCanvas(ad);
  }

  function closeCinema() {
    const ov = document.getElementById('adCinemaOverlay');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
    stopCinemaCanvas();
    currentAd = null;
  }

  function startCinemaCanvas(ad) {
    const canvas = document.getElementById('adCinemaCanvas');
    if (!canvas) return;
    cinemaCanvas = canvas;
    cinemaCtx    = canvas.getContext('2d');
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    const _ro = new ResizeObserver(resize);
    _ro.observe(canvas.parentElement);

    let t = 0;
    const [r1,g1,b1] = hexToRgb(ad.c1 || '#1a0533');
    const [r2,g2,b2] = hexToRgb(ad.c2 || '#6d28d9');
    const [r3,g3,b3] = hexToRgb(ad.c3 || '#f472b6');

    function draw() {
      const w = cinemaCanvas.width, h = cinemaCanvas.height;
      const ct = cinemaCtx;
      t += 0.007;

      const f1 = (Math.sin(t) + 1) / 2;
      const f2 = (Math.sin(t * 1.35 + 1) + 1) / 2;
      const rA = lerp(r1,r2,f1)|0, gA = lerp(g1,g2,f1)|0, bA = lerp(b1,b2,f1)|0;
      const rB = lerp(r2,r3,f2)|0, gB = lerp(g2,g3,f2)|0, bB = lerp(b2,b3,f2)|0;

      const grd = ct.createLinearGradient(0,0,w,h);
      grd.addColorStop(0, `rgb(${rA},${gA},${bA})`);
      grd.addColorStop(1, `rgb(${rB},${gB},${bB})`);
      ct.fillStyle = grd;
      ct.fillRect(0, 0, w, h);

      for (let i = 0; i < 4; i++) {
        const ox = w * (.15 + .24 * i) + Math.sin(t + i * 1.3) * 70;
        const oy = h * .5 + Math.cos(t * .85 + i) * 55;
        const or = 55 + i * 30;
        const og = ct.createRadialGradient(ox,oy,0, ox,oy,or);
        og.addColorStop(0, 'rgba(255,255,255,0.13)');
        og.addColorStop(1, 'rgba(255,255,255,0)');
        ct.fillStyle = og;
        ct.beginPath(); ct.arc(ox,oy,or,0,Math.PI*2); ct.fill();
      }

      /* Horizontal lines (CRT vibe) */
      ct.fillStyle = 'rgba(0,0,0,0.04)';
      for (let y = 0; y < h; y += 4) ct.fillRect(0, y, w, 2);

      /* Light leak from top */
      const leak = ct.createLinearGradient(0,0,0,h*.4);
      leak.addColorStop(0, `rgba(255,255,255,0.05)`);
      leak.addColorStop(1, 'rgba(255,255,255,0)');
      ct.fillStyle = leak;
      ct.fillRect(0, 0, w, h * .4);

      cinemaRaf = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopCinemaCanvas() {
    if (cinemaRaf) { cancelAnimationFrame(cinemaRaf); cinemaRaf = null; }
  }

  /* ═══════════════════════════════════════════════════════════
     LIKE SYNC & INTERACTIONS
  ═══════════════════════════════════════════════════════════ */
  function syncLikeButtons(id) {
    const liked = isLiked(id);
    const ad    = [...ADS, ...CREATORS].find(a => a.id === id);
    const count = ad ? fmtNum(totalLikes(ad)) : '';
    document.querySelectorAll(`[data-ad-like="${id}"]`).forEach(btn => {
      btn.classList.toggle('liked', liked);
      const el = btn.querySelector('.like-count');
      if (el && count) el.textContent = count;
    });
  }

  function bindAdInteractions(container) {
    /* Like */
    container.querySelectorAll('[data-ad-like]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.adLike;
        const ad = [...ADS, ...CREATORS].find(a => a.id === id);
        if (!ad) return;
        toggleLike(id, ad);
        syncLikeButtons(id);
      });
    });

    /* Sound (cosmetic) */
    container.querySelectorAll('[data-ad-sound]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        btn.textContent = btn.textContent === '🔇' ? '🔊' : '🔇';
      });
    });

    /* CTA button — navigates directly to the game/channel/event */
    container.querySelectorAll('[data-ad-cta]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.adCta;
        const ad = [...ADS, ...CREATORS].find(a => a.id === id);
        if (!ad) return;
        bumpView(id);
        const dest = ad.link || ad.url;
        if (dest && dest !== '#') {
          window.location.href = dest;
        } else {
          openCinema(ad);
        }
      });
    });

    /* Hover canvas autoplay */
    container.querySelectorAll('.eylox-ad').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const id = card.dataset.adId;
        const ad = [...ADS, ...CREATORS].find(a => a.id === id);
        if (ad) startCardPreview(card, ad);
      });
      card.addEventListener('mouseleave', stopCardPreview);

      /* Full card click → cinema */
      card.addEventListener('click', e => {
        if (e.target.closest('[data-ad-like],[data-ad-sound],[data-ad-cta]')) return;
        const id = card.dataset.adId;
        const ad = [...ADS, ...CREATORS].find(a => a.id === id);
        if (ad) { bumpView(id); openCinema(ad); }
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CAROUSEL
  ═══════════════════════════════════════════════════════════ */
  function buildCarousel(ads) {
    const slides = ads.map(ad => `<div class="eylox-ad-carousel-slide">${buildAdCard(ad)}</div>`).join('');
    const dots   = ads.map((_, i) => `<button class="eylox-ad-carousel-dot${i === 0 ? ' active' : ''}" data-ci="${i}"></button>`).join('');
    return `
    <div class="eylox-ad-strip">
      <div class="eylox-ad-strip-hd">
        <span class="eylox-ad-strip-label">🌟 Featured</span>
        <div class="eylox-ad-strip-line"></div>
      </div>
      <div class="eylox-ad-carousel" id="adCarousel">
        <button class="eylox-ad-carousel-btn prev" id="adCarPrev">‹</button>
        <button class="eylox-ad-carousel-btn next" id="adCarNext">›</button>
        <div class="eylox-ad-carousel-track" id="adCarTrack">${slides}</div>
        <div class="eylox-ad-carousel-controls" id="adCarDots">${dots}</div>
      </div>
    </div>`;
  }

  function initCarousel(container) {
    const track = container.querySelector('#adCarTrack');
    const dots  = container.querySelectorAll('.eylox-ad-carousel-dot');
    if (!track || !dots.length) return;

    let cur = 0;
    const total = dots.length;
    let autoTimer = null;

    function goTo(n) {
      cur = ((n % total) + total) % total;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    }

    function next() { goTo(cur + 1); }
    function prev() { goTo(cur - 1); }

    function startAuto() { autoTimer = setInterval(next, 5000); }
    function stopAuto()  { clearInterval(autoTimer); }

    container.querySelector('#adCarPrev')?.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    container.querySelector('#adCarNext')?.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

    /* Touch swipe */
    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { stopAuto(); dx < 0 ? next() : prev(); startAuto(); }
    }, { passive: true });

    startAuto();
  }

  /* ═══════════════════════════════════════════════════════════
     COUNTDOWN TICK
  ═══════════════════════════════════════════════════════════ */
  function tickCountdowns() {
    document.querySelectorAll('[data-ad-countdown]').forEach(el => {
      el.textContent = msToHHMMSS(nextEventMs());
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INJECT HELPERS
  ═══════════════════════════════════════════════════════════ */
  function inject(html, afterEl) {
    if (!afterEl) return null;
    const div = document.createElement('div');
    div.innerHTML = html;
    const frag = div.firstElementChild;
    afterEl.after(frag);
    bindAdInteractions(frag);
    return frag;
  }

  function injectBefore(html, beforeEl) {
    if (!beforeEl) return null;
    const div = document.createElement('div');
    div.innerHTML = html;
    const frag = div.firstElementChild;
    beforeEl.before(frag);
    bindAdInteractions(frag);
    return frag;
  }

  /* ═══════════════════════════════════════════════════════════
     PAGE-SPECIFIC INJECTORS
  ═══════════════════════════════════════════════════════════ */
  function injectHomePage() {
    /* Carousel of featured games after the first section */
    const firstSection = document.querySelector('section, [aria-labelledby]');
    if (firstSection) {
      const carouselAds = [
        ADS.find(a => a.badge === 'featured') || ADS[0],
        ADS.find(a => a.badge === 'trending') || ADS[1],
        ADS.find(a => a.badge === 'hot')      || ADS[2],
        ADS.find(a => a.badge === 'exclusive')|| ADS[6],
      ].filter(Boolean);
      const carEl = inject(buildCarousel(carouselAds), firstSection);
      if (carEl) initCarousel(carEl);
    }

    /* Recommended strip after second section */
    const sections = document.querySelectorAll('section');
    if (sections.length >= 2) {
      const recs = getRecommended(4);
      inject(buildStrip('✨ Recommended For You', recs, 'scroll'), sections[1]);
    }

    /* Event ad banner at the end */
    const eventAd = ADS.find(a => a.type === 'event');
    if (eventAd) {
      const lastSection = document.querySelector('section:last-of-type') || document.querySelector('.main-area');
      if (lastSection) {
        const banner = document.createElement('div');
        banner.className = 'eylox-ad-banner';
        banner.innerHTML = buildAdCard(eventAd);
        lastSection.after(banner);
        bindAdInteractions(banner);
      }
    }
  }

  function injectEventsPage() {
    /* Inject a game ad strip BELOW the upcoming events grid */
    const upcomingGrid = document.getElementById('upcomingEventsGrid');
    if (upcomingGrid) {
      const gameAds = ADS.filter(a => a.type === 'game').slice(0, 4);
      inject(buildStrip('🎮 You Might Also Like', gameAds, 'scroll'), upcomingGrid);
    }

    /* Creator spotlight below events content */
    const chatRow = document.querySelector('.ev-chat-spectator-row');
    if (chatRow) {
      inject(buildStrip('🎤 Creator Spotlight', CREATORS.slice(0, 3), 'scroll'), chatRow);
    }
  }

  function injectGamesPage() {
    const sections = document.querySelectorAll('.section');
    if (sections.length >= 2) {
      const mid = Math.floor(sections.length / 2);
      inject(buildStrip('⚡ Sponsored Games', [ADS[0], ADS[6], ADS[7]], 'scroll'), sections[mid]);
    }
    const lastSection = document.querySelector('.section:last-of-type');
    if (lastSection) {
      inject(buildStrip('🎤 Creator Spotlight', CREATORS, 'scroll'), lastSection);
    }
  }

  function injectShopPage() {
    const shopHeader = document.querySelector('.shop-header, .section-header, h1');
    if (shopHeader) {
      const trending = ADS.filter(a => a.badge === 'trending' || a.badge === 'hot').slice(0, 3);
      const parent = shopHeader.closest('section, .page-content, .main-area') || shopHeader.parentElement;
      const target = parent.querySelector(':scope > *:nth-child(2)') || shopHeader;
      inject(buildStrip('🏆 Trending This Week', trending, 'scroll'), target);
    }
    /* Event ad at bottom of shop */
    const eventAd = ADS.find(a => a.type === 'event');
    if (eventAd) {
      const lastEl = document.querySelector('.page-content > *:last-child') || document.querySelector('.shop-grid');
      if (lastEl) {
        const banner = document.createElement('div');
        banner.className = 'eylox-ad-banner';
        banner.innerHTML = buildAdCard(eventAd);
        lastEl.after(banner);
        bindAdInteractions(banner);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CREATOR TOOLS PANEL
  ═══════════════════════════════════════════════════════════ */
  function buildCreatorTools() {
    const campaigns = LS.get('eylox_ad_campaigns', []);
    const totalViewsAll = Object.values(LS.get('eylox_ad_views', {})).reduce((a,b) => a+b, 0);
    const totalLikesAll = Object.keys(LS.get('eylox_ad_likes', {})).filter(k => !k.includes('_x')).length;

    return `
    <div class="eylox-ad-strip">
      <div class="eylox-ad-strip-hd">
        <span class="eylox-ad-strip-label">🎬 Creator Ad Tools</span>
        <div class="eylox-ad-strip-line"></div>
      </div>
      <div class="eylox-creator-tools">
        <h3>🚀 Promote Your Game</h3>
        <p>Upload a custom ad, set a budget in coins, and reach thousands of Eylox players. Schedule your campaign for peak hours.</p>

        <!-- Analytics mini-dash -->
        <div class="ad-analytics-grid">
          <div class="ad-analytics-stat">
            <span class="ad-analytics-stat-value">${fmtNum(totalViewsAll + campaigns.length * 142)}</span>
            <span class="ad-analytics-stat-label">Total Views</span>
          </div>
          <div class="ad-analytics-stat">
            <span class="ad-analytics-stat-value">${fmtNum(totalLikesAll + campaigns.length * 28)}</span>
            <span class="ad-analytics-stat-label">Likes</span>
          </div>
          <div class="ad-analytics-stat">
            <span class="ad-analytics-stat-value">${campaigns.length}</span>
            <span class="ad-analytics-stat-label">Campaigns</span>
          </div>
          <div class="ad-analytics-stat">
            <span class="ad-analytics-stat-value">${fmtNum(campaigns.reduce((a,c) => a + (c.budget||0), 0))}</span>
            <span class="ad-analytics-stat-label">Coins Spent</span>
          </div>
        </div>

        <!-- Form -->
        <div class="ct-form-grid" style="margin-top:22px">
          <div class="ct-field">
            <label>Game Title</label>
            <input id="ctTitle" type="text" placeholder="My Awesome Game"/>
          </div>
          <div class="ct-field">
            <label>Tagline</label>
            <input id="ctTagline" type="text" placeholder="One amazing line…"/>
          </div>
          <div class="ct-field">
            <label>Game Icon (emoji)</label>
            <input id="ctIcon" type="text" placeholder="🎮" maxlength="4"/>
          </div>
          <div class="ct-field">
            <label>Budget (coins)</label>
            <input id="ctBudget" type="number" placeholder="500" min="100"/>
          </div>
          <div class="ct-field">
            <label>Schedule</label>
            <select id="ctSchedule">
              <option value="now">🔴 Start Now</option>
              <option value="peak">⚡ Peak Hours (8pm–12am)</option>
              <option value="morning">🌅 Morning (8am–12pm)</option>
              <option value="weekend">🎉 Weekend Only</option>
            </select>
          </div>
          <div class="ct-field">
            <label>Target Audience</label>
            <select id="ctTarget">
              <option value="all">🌍 All Players</option>
              <option value="competitive">🏆 Competitive Players</option>
              <option value="casual">🎲 Casual Players</option>
              <option value="builders">🏗️ Builders</option>
            </select>
          </div>
        </div>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px">
          <button class="ct-launch-btn" id="ctSubmitBtn">🚀 Launch Ad Campaign</button>
          <span class="ct-feedback" id="ctFeedback"></span>
        </div>

        <!-- Campaign list -->
        <div class="ct-campaigns-hd">YOUR CAMPAIGNS</div>
        <div id="ctCampaignList">${campaigns.length ? campaigns.map(c => `
          <div class="ct-campaign-row">
            <span style="font-size:1.4rem">${c.icon}</span>
            <div style="flex:1">
              <div style="font-weight:800;color:#e9d5ff;font-size:.85rem">${c.title}</div>
              <div style="font-size:.72rem;color:rgba(167,139,250,.5)">${c.tagline} · ${c.schedule||'Now'} · ${c.target||'All'}</div>
            </div>
            <div style="font-size:.72rem;font-weight:900;color:#fbbf24">${fmtNum(c.budget)} coins</div>
            <div style="font-size:.65rem;font-weight:900;color:#4ade80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.25);border-radius:99px;padding:3px 10px">LIVE</div>
          </div>`).join('') : '<div style="font-size:.82rem;color:rgba(167,139,250,.45)">No campaigns yet. Launch your first ad above!</div>'}</div>
      </div>
    </div>`;
  }

  function bindCreatorTools() {
    const btn = document.getElementById('ctSubmitBtn');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', () => {
      const title    = document.getElementById('ctTitle')?.value.trim();
      const tagline  = document.getElementById('ctTagline')?.value.trim();
      const icon     = document.getElementById('ctIcon')?.value.trim() || '🎮';
      const budget   = parseInt(document.getElementById('ctBudget')?.value || '0', 10);
      const schedule = document.getElementById('ctSchedule')?.value || 'now';
      const target   = document.getElementById('ctTarget')?.value || 'all';
      const fb       = document.getElementById('ctFeedback');

      const showFb = (msg, clr = '#f87171') => {
        if (!fb) return;
        fb.textContent = msg; fb.style.color = clr; fb.style.display = 'block';
        setTimeout(() => { fb.style.display = 'none'; }, 3200);
      };

      if (!title)       return showFb('⚠️ Enter a game title.');
      if (budget < 100) return showFb('⚠️ Minimum budget is 100 coins.');

      const user = LS.get('eylox_user', null);
      if (user && user.coins < budget) return showFb('⚠️ Not enough coins.');
      if (user) { user.coins -= budget; LS.set('eylox_user', user); }

      const campaigns = LS.get('eylox_ad_campaigns', []);
      campaigns.unshift({ title, tagline: tagline || 'Check it out!', icon, budget, schedule, target, created: Date.now() });
      LS.set('eylox_ad_campaigns', campaigns.slice(0, 10));

      /* Refresh campaign list and analytics */
      const mount = document.getElementById('creatorToolsMount');
      if (mount) { mount.innerHTML = buildCreatorTools(); bindCreatorTools(); return; }

      showFb('✅ Campaign launched!', '#4ade80');
      ['ctTitle','ctTagline','ctIcon','ctBudget'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     TOAST
  ═══════════════════════════════════════════════════════════ */
  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(10,5,28,.96);border:1px solid rgba(167,139,250,.3);color:#f0e8ff;padding:11px 22px;border-radius:13px;font-size:.83rem;font-weight:800;font-family:Nunito,sans-serif;white-space:nowrap;pointer-events:none;animation:ad-toast-in .3s ease;box-shadow:0 8px 28px rgba(0,0,0,.5)';
    t.textContent = msg;
    if (!document.querySelector('#ad-toast-style')) {
      const s = document.createElement('style');
      s.id = 'ad-toast-style';
      s.textContent = '@keyframes ad-toast-in{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* ═══════════════════════════════════════════════════════════
     PAGE DETECTION & INIT
  ═══════════════════════════════════════════════════════════ */
  function detectPage() {
    const page = document.body.getAttribute('data-page') || '';
    if (page === 'home'   || document.querySelector('.lp-hero,[aria-labelledby="continue-heading"]')) return 'home';
    if (page === 'events' || document.querySelector('.ev-hero,#spinModal'))                          return 'events';
    if (page === 'games'  || document.querySelector('.games-grid'))                                  return 'games';
    if (page === 'shop'   || document.querySelector('.shop-grid,.shop-items'))                       return 'shop';
    return 'unknown';
  }

  function init() {
    buildCinemaModal();
    setInterval(tickCountdowns, 1000);

    const page = detectPage();
    switch (page) {
      case 'home':   injectHomePage();   break;
      case 'events': injectEventsPage(); break;
      case 'games':  injectGamesPage();  break;
      case 'shop':   injectShopPage();   break;
    }

    /* Creator tools mount point */
    const mount = document.getElementById('creatorToolsMount');
    if (mount) {
      mount.innerHTML = buildCreatorTools();
      bindCreatorTools();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose for external use */
  window.EyloxAds = { openCinema, bumpView, buildAdCard, buildStrip };

})();
