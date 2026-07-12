/* ============================================================
   EYLOX — Game Rewards System v1.0
   3D games → Eyltrophs | 2D games → Eylux
   Shows rewards before joining, animated win screen.
   ============================================================ */
'use strict';

(function EyloxGameRewards() {

  /* Which games are 3D (earn Eyltrophs) vs 2D (earn Eylux) */
  const GAME_3D = ['game3d-city', 'game3d-pirate', 'game3d-obby', 'game3d-treasure', 'city-builder-3d', 'pirate-cove-3d', 'obby-3d', 'treasure-3d'];

  const REWARDS_MAP = {
    /* 3D games → Eyltrophs */
    'game3d-city':     { type:'eyltrophs',  amount:1, bonus:2, desc:'City Roleplay 3D' },
    'game3d-pirate':   { type:'eyltrophs',  amount:1, bonus:2, desc:'Pirate Cove 3D' },
    'game3d-obby':     { type:'eyltrophs',  amount:1, bonus:3, desc:'Mega Obby 3D' },
    'game3d-treasure': { type:'eyltrophs',  amount:1, bonus:2, desc:'Treasure Island 3D' },
    /* 2D games → Eylux */
    'ninja-dash':      { type:'eylux', amount:50,  bonus:100, desc:'Ninja Dash' },
    'puzzle-palace':   { type:'eylux', amount:40,  bonus:80,  desc:'Puzzle Palace' },
    'dragon-escape':   { type:'eylux', amount:60,  bonus:120, desc:'Dragon Escape' },
    'sky-riders':      { type:'eylux', amount:55,  bonus:110, desc:'Sky Riders' },
    'block-kingdom':   { type:'eylux', amount:45,  bonus:90,  desc:'Block Kingdom' },
    'ocean-quest':     { type:'eylux', amount:50,  bonus:100, desc:'Ocean Quest' },
    'space-blaster':   { type:'eylux', amount:65,  bonus:130, desc:'Space Blaster' },
    'farm-friends':    { type:'eylux', amount:35,  bonus:70,  desc:'Farm Friends' },
    'haunted-house':   { type:'eylux', amount:55,  bonus:110, desc:'Haunted House' },
    'race-city':       { type:'eylux', amount:60,  bonus:120, desc:'Race City' },
    'jungle-run':      { type:'eylux', amount:50,  bonus:100, desc:'Jungle Run' },
    'candy-chaos':     { type:'eylux', amount:45,  bonus:90,  desc:'Candy Chaos' },
    'ice-fortress':    { type:'eylux', amount:55,  bonus:110, desc:'Ice Fortress' },
    'logic-lab':       { type:'eylux', amount:40,  bonus:80,  desc:'Logic Lab' },
    'pirate-bay':      { type:'eylux', amount:50,  bonus:100, desc:'Pirate Bay' },
    'treasure-hunt':   { type:'eylux', amount:50,  bonus:100, desc:'Treasure Hunt' },
    /* Default fallbacks */
    '_default_3d':     { type:'eyltrophs',  amount:1,  bonus:2,   desc:'3D Game' },
    '_default_2d':     { type:'eylux', amount:50, bonus:100, desc:'Game' },
  };

  /* ── Detect game type from URL ── */
  function detectGameId() {
    const url = location.href;
    /* Check if it's one of the 3D game pages */
    const match3d = url.match(/game3d-([a-z]+)\.html/);
    if (match3d) return 'game3d-' + match3d[1];
    /* Check for games.html?id= */
    const idParam = new URLSearchParams(location.search).get('id');
    if (idParam) return idParam;
    return null;
  }

  function is3D(gameId) {
    return GAME_3D.some(g => g === gameId || gameId?.startsWith('game3d'));
  }

  function getReward(gameId) {
    if (!gameId) return null;
    return REWARDS_MAP[gameId] || (is3D(gameId) ? REWARDS_MAP['_default_3d'] : REWARDS_MAP['_default_2d']);
  }

  /* ── Grant reward to user ── */
  function grantReward(gameId, won) {
    const reward = getReward(gameId);
    if (!reward) return;
    try {
      const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
      if (reward.type === 'eyltrophs') {
        if (won) {
          user.eyltrophs = (user.eyltrophs || 0) + reward.amount;
          user.gamesPlayed = (user.gamesPlayed || 0) + 1;
          localStorage.setItem('eylox_user', JSON.stringify(user));
          _showWinScreen(reward, true);
        } else {
          user.gamesPlayed = (user.gamesPlayed || 0) + 1;
          localStorage.setItem('eylox_user', JSON.stringify(user));
          _showLoseScreen(reward);
        }
      } else {
        const eylux = won ? reward.bonus : reward.amount;
        user.coins = (user.coins || 0) + eylux;
        user.gamesPlayed = (user.gamesPlayed || 0) + 1;
        localStorage.setItem('eylox_user', JSON.stringify(user));
        _showWinScreen({ ...reward, amount: eylux }, won);
      }
      /* Dispatch for achievement tracking */
      document.dispatchEvent(new CustomEvent('eylox:gameover', { detail: { gameId, won, reward } }));
    } catch (e) { console.warn('GameRewards:', e); }
  }

  /* ── Inject CSS ── */
  function _injectCSS() {
    if (document.getElementById('egrw-css')) return;
    const s = document.createElement('style');
    s.id = 'egrw-css';
    s.textContent = `
      @keyframes egrwIn  { from{opacity:0;transform:scale(.7) rotate(-5deg)}to{opacity:1;transform:scale(1) rotate(0)} }
      @keyframes egrwOut { from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.1)} }
      @keyframes egrwCoin { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-120px) scale(.5);opacity:0} }
      @keyframes egrwShake { 0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)} }
      @keyframes egrwPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.08)} }
      @keyframes egrwStar  { 0%{transform:translate(0,0) rotate(0) scale(1);opacity:1} 100%{transform:translate(var(--sx,30px),var(--sy,-80px)) rotate(360deg) scale(0);opacity:0} }

      #egrw-reward-banner {
        position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.82);backdrop-filter:blur(14px);
      }
      .egrw-box {
        background:rgba(10,3,28,.98);border-radius:28px;padding:40px 36px;
        text-align:center;max-width:340px;width:90%;
        box-shadow:0 28px 80px rgba(0,0,0,.8);
        animation:egrwIn .5s cubic-bezier(.34,1.56,.64,1) both;
        position:relative;overflow:hidden;
      }
      .egrw-box.win  { border:2px solid rgba(74,222,128,.5);box-shadow:0 28px 80px rgba(0,0,0,.8),0 0 60px rgba(74,222,128,.15); }
      .egrw-box.lose { border:2px solid rgba(239,68,68,.3); }
      .egrw-glow {
        position:absolute;inset:0;
        background:radial-gradient(ellipse at 50% 0%,rgba(74,222,128,.08) 0%,transparent 65%);
        pointer-events:none;
      }
      .egrw-icon   { font-size:4.5rem;margin-bottom:10px;display:block; }
      .egrw-title  { font-family:'Fredoka One',cursive;font-size:2rem;color:#fff;margin-bottom:6px;line-height:1; }
      .egrw-sub    { font-size:.85rem;color:rgba(200,190,230,.5);font-weight:600;margin-bottom:20px; }
      .egrw-reward-box {
        background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
        border-radius:16px;padding:16px;margin-bottom:20px;
      }
      .egrw-reward-val { font-family:'Fredoka One',cursive;font-size:2.2rem;margin-bottom:4px; }
      .egrw-reward-lbl { font-size:.72rem;font-weight:800;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase; }
      .egrw-close {
        background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);
        border-radius:99px;padding:11px 32px;color:#e0d4ff;
        cursor:pointer;font-weight:900;font-size:.9rem;
        transition:all .18s;font-family:'Nunito',sans-serif;
      }
      .egrw-close:hover { background:rgba(167,139,250,.28);transform:scale(1.05); }

      /* Pre-game reward badge on game cards */
      .egrw-badge {
        display:inline-flex;align-items:center;gap:5px;
        background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.3);
        border-radius:99px;padding:4px 10px;font-size:.65rem;font-weight:900;
        color:#4ade80;
      }
      .egrw-badge.wins { background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.3);color:#60a5fa; }

      /* Pre-game reward modal */
      #egrw-pregame {
        position:fixed;bottom:0;left:0;right:0;z-index:99998;
        background:rgba(10,3,28,.97);border-top:1px solid rgba(167,139,250,.2);
        border-radius:20px 20px 0 0;padding:20px 24px;
        transform:translateY(100%);transition:transform .35s cubic-bezier(.34,1.2,.64,1);
      }
      #egrw-pregame.open { transform:translateY(0); }
    `;
    document.head.appendChild(s);
  }

  /* ── Win Screen ── */
  function _showWinScreen(reward, isWin) {
    _injectCSS();
    const isEylux = reward.type === 'eylux';
    const overlay = document.createElement('div');
    overlay.id = 'egrw-reward-banner';
    overlay.innerHTML = `
      <div class="egrw-box win">
        <div class="egrw-glow"></div>
        <span class="egrw-icon">${isEylux ? '💰' : '🏆'}</span>
        <div class="egrw-title">${isWin ? (isEylux ? 'Nice!' : 'You Win!') : 'Game Over'}</div>
        <div class="egrw-sub">${isWin ? 'Here are your rewards!' : 'Better luck next time!'}</div>
        <div class="egrw-reward-box">
          <div class="egrw-reward-val" style="color:${isEylux?'#fbbf24':'#f59e0b'}">
            ${isEylux ? '💰' : '🏆'} +${reward.amount.toLocaleString()}
          </div>
          <div class="egrw-reward-lbl">${isEylux ? 'Eylux Earned' : 'Eyltroph Earned'}</div>
        </div>
        <button class="egrw-close" onclick="document.getElementById('egrw-reward-banner').remove()">Continue →</button>
      </div>
    `;
    document.body.appendChild(overlay);
    /* Animate reward particles */
    if (isWin) _spawnRewardParticles(isEylux ? '💰' : '🏆');
    setTimeout(() => { overlay.style.transition = 'opacity .4s'; overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 400); }, 5000);
  }

  function _showLoseScreen(reward) {
    _injectCSS();
    const overlay = document.createElement('div');
    overlay.id = 'egrw-reward-banner';
    overlay.innerHTML = `
      <div class="egrw-box lose" style="animation:egrwShake .5s ease both,egrwIn .4s ease both">
        <span class="egrw-icon">😔</span>
        <div class="egrw-title">Game Over</div>
        <div class="egrw-sub">Don't give up — try again!</div>
        <div class="egrw-reward-box">
          <div class="egrw-reward-val" style="color:rgba(167,139,250,.5)">+${reward.amount} 💰</div>
          <div class="egrw-reward-lbl">Participation Coins</div>
        </div>
        <button class="egrw-close" onclick="document.getElementById('egrw-reward-banner').remove()">Try Again</button>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.transition='opacity .4s'; overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),400); }, 4000);
  }

  function _spawnRewardParticles(emoji) {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.style.cssText = `position:fixed;z-index:999999;font-size:1.8rem;pointer-events:none;
          left:${20+Math.random()*60}%;top:${20+Math.random()*60}%;
          --sx:${(Math.random()-0.5)*120}px;--sy:${-60-Math.random()*80}px;
          animation:egrwStar 1.2s ease-out forwards;animation-delay:${i*0.08}s`;
        p.textContent = emoji;
        document.body.appendChild(p);
        setTimeout(()=>p.remove(), 1400);
      }, i * 60);
    }
  }

  /* ── Pre-game reward preview (inject on game card hover/click) ── */
  function injectRewardBadges() {
    /* Find all "Play Now" / "Enter World" buttons and decorate nearby with reward info */
    document.querySelectorAll('[onclick*="games.html?id="], [onclick*="game3d-"], .btn-play').forEach(btn => {
      if (btn.dataset.rewardInjected) return;
      btn.dataset.rewardInjected = '1';
      const href = btn.getAttribute('onclick') || btn.href || '';
      const idMatch = href.match(/id=([^'"&]+)/);
      const gameId  = idMatch ? idMatch[1] : (href.match(/game3d-([a-z]+)\.html/) ? 'game3d-'+href.match(/game3d-([a-z]+)\.html/)[1] : null);
      if (!gameId) return;
      const reward = getReward(gameId);
      if (!reward) return;
      const badge = document.createElement('div');
      badge.style.cssText = 'font-size:.62rem;font-weight:800;margin-top:4px;';
      badge.innerHTML = reward.type === 'eyltrophs'
        ? `<span class="egrw-badge wins">🏆 Win → +1 Eyltroph</span>`
        : `<span class="egrw-badge">💰 Win → +${reward.bonus} Eylux</span>`;
      btn.parentElement?.appendChild(badge);
    });
  }

  /* ── Expose global API ── */
  window.EyloxGameRewards = {
    grantReward,
    getReward,
    is3D,
    detectGameId,
    injectRewardBadges
  };

  /* ── Hook into 3D game pages ── */
  document.addEventListener('DOMContentLoaded', () => {
    _injectCSS();
    const gameId = detectGameId();
    if (!gameId) {
      /* We're on a hub page — inject reward badges on game cards */
      setTimeout(injectRewardBadges, 800);
      return;
    }
    /* On a game page — listen for win/lose events */
    document.addEventListener('eylox:gameover', e => {
      grantReward(e.detail?.gameId || gameId, e.detail?.won);
    });
    /* Hook into 3D game win messages */
    const origPost = window.postMessage;
    window.addEventListener('message', e => {
      if (e.data?.type === 'eylox_win')  grantReward(gameId, true);
      if (e.data?.type === 'eylox_lose') grantReward(gameId, false);
    });
  });

  /* ── Patch 3D game files to fire win events ── */
  /* This runs inside game3d-*.html pages */
  if (location.pathname.includes('game3d-')) {
    const gameId = detectGameId();
    /* Intercept the existing win logic by watching for banner display */
    const _origBodyAppend = document.body?.appendChild;
    if (_origBodyAppend) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node.id === 'win-banner' || node.textContent?.includes('You Win') || node.textContent?.includes('Mission Complete')) {
              setTimeout(() => grantReward(gameId, true), 500);
            }
          });
        });
      });
      if (document.body) observer.observe(document.body, { childList: true, subtree: true });
      else document.addEventListener('DOMContentLoaded', () => observer.observe(document.body, { childList: true, subtree: true }));
    }
  }

})();
