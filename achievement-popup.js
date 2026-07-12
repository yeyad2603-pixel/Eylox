/* ============================================================
   EYLOX — achievement-popup.js
   Epic achievement unlock overlay system
   ============================================================ */
'use strict';

(function EyloxAchievements() {

  const ACHIEVEMENTS = [
    { id:'first_login',    icon:'🎮', title:'Welcome Aboard',    desc:'Logged in for the first time',         reward:50,   rarity:'common' },
    { id:'coins_100',      icon:'💰', title:'Pocket Change',     desc:'Earned your first 100 Eylux',          reward:25,   rarity:'common' },
    { id:'coins_1000',     icon:'💎', title:'High Roller',       desc:'Stacked 1,000 Eylux',                  reward:100,  rarity:'rare' },
    { id:'coins_10000',    icon:'🏦', title:'Eylux Baron',        desc:'Amassed 10,000 Eylux',                 reward:500,  rarity:'epic' },
    { id:'coins_100000',   icon:'👑', title:'Eylux Millionaire', desc:'Reached 100,000 Eylux',                reward:2000, rarity:'legendary' },
    { id:'level_5',        icon:'⚡', title:'Rising Star',       desc:'Reached Level 5',                      reward:75,   rarity:'common' },
    { id:'level_10',       icon:'🌟', title:'Veteran Gamer',     desc:'Reached Level 10',                     reward:200,  rarity:'rare' },
    { id:'level_25',       icon:'🔥', title:'Elite Player',      desc:'Reached Level 25',                     reward:750,  rarity:'epic' },
    { id:'level_50',       icon:'💥', title:'Legend',            desc:'Reached Level 50',                     reward:3000, rarity:'legendary' },
    { id:'friend_1',       icon:'🤝', title:'First Ally',        desc:'Added your first friend',              reward:50,   rarity:'common' },
    { id:'friend_5',       icon:'👥', title:'Squad Goals',       desc:'Built a squad of 5 friends',           reward:150,  rarity:'rare' },
    { id:'chat_10',        icon:'💬', title:'Chatterbox',        desc:'Sent 10 chat messages',                reward:30,   rarity:'common' },
    { id:'pages_10',       icon:'🗺️', title:'Explorer',          desc:'Visited 10 different pages',          reward:75,   rarity:'common' },
    { id:'daily_streak_3', icon:'📅', title:'On a Roll',         desc:'Claimed daily reward 3 days straight', reward:100,  rarity:'rare' },
    { id:'daily_streak_7', icon:'🗓️', title:'Week Warrior',     desc:'7-day daily reward streak',            reward:350,  rarity:'epic' },
    { id:'rated_game',     icon:'⭐', title:'Critic',            desc:'Rated your first game',                reward:25,   rarity:'common' },
    { id:'konami',         icon:'🎰', title:'Code Breaker',      desc:'Found the secret Konami code',         reward:1000, rarity:'legendary' },
    { id:'night_owl',      icon:'🦉', title:'Night Owl',         desc:'Logged in after midnight',             reward:50,   rarity:'rare' },
    { id:'early_bird',     icon:'🌅', title:'Early Bird',        desc:'Logged in before 6am',                 reward:50,   rarity:'rare' },
    { id:'shop_visit',     icon:'🛒', title:'Window Shopper',    desc:'Visited the shop',                     reward:20,   rarity:'common' },
  ];

  const RARITY_COLORS = {
    common:    { bg:'rgba(100,116,139,.3)',  border:'rgba(148,163,184,.4)', glow:'rgba(148,163,184,.6)',  label:'Common',    text:'#94a3b8' },
    rare:      { bg:'rgba(37,99,235,.3)',    border:'rgba(96,165,250,.4)',  glow:'rgba(96,165,250,.6)',   label:'Rare',      text:'#60a5fa' },
    epic:      { bg:'rgba(109,40,217,.3)',   border:'rgba(167,139,250,.4)', glow:'rgba(167,139,250,.6)',  label:'Epic',      text:'#a78bfa' },
    legendary: { bg:'rgba(161,98,7,.35)',    border:'rgba(251,191,36,.4)',  glow:'rgba(251,191,36,.7)',   label:'Legendary', text:'#fbbf24' },
  };

  /* ── Inject CSS ── */
  if (!document.getElementById('ach-popup-style')) {
    const s = document.createElement('style');
    s.id = 'ach-popup-style';
    s.textContent = `
      #ach-overlay {
        position:fixed;inset:0;z-index:99990;pointer-events:none;
        display:flex;align-items:center;justify-content:center;
      }
      .ach-card {
        pointer-events:none;
        position:relative;overflow:hidden;
        width:360px;padding:28px 32px 24px;
        background:rgba(17,3,48,.96);
        border-radius:24px;
        border:1px solid rgba(167,139,250,.3);
        box-shadow:0 20px 80px rgba(0,0,0,.8), var(--ach-glow);
        text-align:center;
        animation:ach-in .55s cubic-bezier(.34,1.56,.64,1) both;
        transform-origin:center bottom;
      }
      .ach-card.hiding {
        animation:ach-out .4s ease forwards;
      }
      @keyframes ach-in {
        from { opacity:0; transform:scale(.6) translateY(40px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
      @keyframes ach-out {
        from { opacity:1; transform:scale(1) translateY(0); }
        to   { opacity:0; transform:scale(.8) translateY(30px); }
      }
      .ach-shimmer {
        position:absolute;inset:0;border-radius:24px;pointer-events:none;
        background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.07) 50%,transparent 60%);
        animation:ach-shimmer 2.5s ease-in-out infinite;
      }
      @keyframes ach-shimmer {
        0%   { background-position:-200% 0; }
        100% { background-position: 200% 0; }
      }
      .ach-unlocked-label {
        font-size:.68rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
        color:rgba(167,139,250,.7);margin-bottom:10px;
      }
      .ach-icon {
        font-size:3.6rem;line-height:1;margin-bottom:8px;
        filter:drop-shadow(0 0 16px var(--ach-color));
        animation:ach-bounce 0.6s cubic-bezier(.34,1.56,.64,1) .3s both;
      }
      @keyframes ach-bounce {
        from { transform:scale(0) rotate(-20deg); }
        to   { transform:scale(1) rotate(0); }
      }
      .ach-rarity-pill {
        display:inline-block;
        padding:2px 12px;border-radius:99px;
        font-size:.62rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
        background:var(--ach-bg);border:1px solid var(--ach-border);
        color:var(--ach-color);margin-bottom:10px;
      }
      .ach-title {
        font-family:'Fredoka One',cursive;font-size:1.55rem;color:#f0e8ff;
        margin:0 0 6px;line-height:1.2;
      }
      .ach-desc {
        font-size:.8rem;color:rgba(157,142,199,.8);margin:0 0 16px;
      }
      .ach-reward {
        display:inline-flex;align-items:center;gap:6px;
        background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.25);
        border-radius:99px;padding:5px 16px;
        font-size:.82rem;font-weight:800;color:#fbbf24;
      }
      .ach-particles {
        position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:24px;
      }
      .ach-p {
        position:absolute;border-radius:50%;
        animation:ach-particle 1.2s ease-out forwards;
        opacity:0;
      }
      @keyframes ach-particle {
        0%   { opacity:1; transform:scale(0); }
        60%  { opacity:.8; }
        100% { opacity:0; transform:scale(1) translate(var(--px),var(--py)); }
      }
      .ach-progress-bar {
        margin-top:14px;height:3px;border-radius:99px;
        background:rgba(167,139,250,.15);overflow:hidden;
      }
      .ach-progress-fill {
        height:100%;border-radius:99px;
        background:linear-gradient(90deg,#7c3aed,#a78bfa,#60a5fa);
        animation:ach-fill .8s ease .5s both;
      }
      @keyframes ach-fill {
        from { width:0% }
      }
    `;
    document.head.appendChild(s);
  }

  let queue = [];
  let showing = false;

  function getUnlocked() {
    try { return JSON.parse(localStorage.getItem('eylox_achievements') || '[]'); } catch { return []; }
  }
  function markUnlocked(id) {
    const arr = getUnlocked();
    if (!arr.includes(id)) { arr.push(id); localStorage.setItem('eylox_achievements', JSON.stringify(arr)); }
  }

  function spawnParticles(card, rarity) {
    const c = RARITY_COLORS[rarity];
    const colors = rarity === 'legendary'
      ? ['#fbbf24','#f59e0b','#fde68a','#fff']
      : rarity === 'epic'
        ? ['#a78bfa','#7c3aed','#c4b5fd','#f0e8ff']
        : rarity === 'rare'
          ? ['#60a5fa','#3b82f6','#bfdbfe']
          : ['#94a3b8','#cbd5e1'];
    const pc = card.querySelector('.ach-particles');
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'ach-p';
      const size = 4 + Math.random() * 8;
      const px = (Math.random() - .5) * 300 + 'px';
      const py = -(80 + Math.random() * 200) + 'px';
      p.style.cssText = `width:${size}px;height:${size}px;background:${colors[i%colors.length]};left:50%;top:60%;--px:${px};--py:${py};animation-delay:${Math.random() * .4}s`;
      pc.appendChild(p);
    }
  }

  function showNext() {
    if (!queue.length || showing) return;
    showing = true;
    const ach = queue.shift();
    const r = RARITY_COLORS[ach.rarity];

    let overlay = document.getElementById('ach-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ach-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="ach-card" style="--ach-bg:${r.bg};--ach-border:${r.border};--ach-color:${r.text};--ach-glow:0 0 60px ${r.glow}">
        <div class="ach-shimmer"></div>
        <div class="ach-particles"></div>
        <div class="ach-unlocked-label">🏆 Achievement Unlocked!</div>
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-rarity-pill">${r.label}</div>
        <div class="ach-title">${ach.title}</div>
        <p class="ach-desc">${ach.desc}</p>
        <div class="ach-reward">🪙 +${ach.reward} Eylux</div>
        <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:100%"></div></div>
      </div>
    `;

    const card = overlay.querySelector('.ach-card');
    spawnParticles(card, ach.rarity);
    window.EyloxSFX?.win?.();

    /* Grant reward coins */
    if (typeof EyloxData !== 'undefined') {
      EyloxData.addCoins(ach.reward);
    }

    /* Dismiss after delay */
    const delay = ach.rarity === 'legendary' ? 5000 : ach.rarity === 'epic' ? 4200 : 3500;
    const timer = setTimeout(() => dismiss(card), delay);
    card.addEventListener('click', () => { clearTimeout(timer); dismiss(card); });
  }

  function dismiss(card) {
    card.classList.add('hiding');
    setTimeout(() => {
      document.getElementById('ach-overlay')?.remove();
      showing = false;
      if (queue.length) setTimeout(showNext, 400);
    }, 420);
  }

  /* Public API */
  window.EyloxAchievement = {
    unlock(id) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (!ach) return;
      const unlocked = getUnlocked();
      if (unlocked.includes(id)) return;
      markUnlocked(id);
      queue.push(ach);
      if (!showing) showNext();
    },
    check() {
      try {
        const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
        if (!u) return;
        const coins = u.coins || 0;
        const level = Math.floor(coins / 500) + 1;
        const friends = JSON.parse(localStorage.getItem('eylox_friends') || '[]').length;
        const dr = JSON.parse(localStorage.getItem('eylox_daily_rewards') || '{}');
        const chatCount = (() => { try { const d=JSON.parse(localStorage.getItem('eylox_chat_count')||'{}'); return Object.values(d).reduce((a,b)=>a+b,0); } catch{return 0;} })();
        const pagesVisited = (() => { try { return JSON.parse(localStorage.getItem('eylox_pages_visited')||'[]').length; } catch{return 0;} })();
        const ratings = (() => { try { return Object.keys(JSON.parse(localStorage.getItem('eylox_game_ratings')||'{}')).length; } catch{return 0;} })();

        this.unlock('first_login');
        if (coins >= 100)    this.unlock('coins_100');
        if (coins >= 1000)   this.unlock('coins_1000');
        if (coins >= 10000)  this.unlock('coins_10000');
        if (coins >= 100000) this.unlock('coins_100000');
        if (level >= 5)  this.unlock('level_5');
        if (level >= 10) this.unlock('level_10');
        if (level >= 25) this.unlock('level_25');
        if (level >= 50) this.unlock('level_50');
        if (friends >= 1) this.unlock('friend_1');
        if (friends >= 5) this.unlock('friend_5');
        if (chatCount >= 10) this.unlock('chat_10');
        if (pagesVisited >= 10) this.unlock('pages_10');
        if ((dr.streak || 0) >= 3) this.unlock('daily_streak_3');
        if ((dr.streak || 0) >= 7) this.unlock('daily_streak_7');
        if (ratings >= 1) this.unlock('rated_game');
        if (document.body?.dataset?.page === 'shop') this.unlock('shop_visit');
        const h = new Date().getHours();
        if (h >= 0 && h < 4) this.unlock('night_owl');
        if (h >= 4 && h < 6) this.unlock('early_bird');
      } catch {}
    }
  };

  /* Listen for Konami code unlock event */
  document.addEventListener('eylox:konami', () => window.EyloxAchievement?.unlock('konami'));

  /* Run checks after a short delay so user data loads */
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => window.EyloxAchievement?.check(), 2500));

})();
