/* ============================================================
   EYLOX — Platform Polish v1.0
   Loading screen tips, hover effects, click ripples,
   UI improvements, gameplay hints, beginner guidance.
   ============================================================ */
'use strict';

(function EyloxPolish() {

  /* ── Loading screen tips ── */
  const LOADING_TIPS = [
    '💡 Play 2D games to earn Coins, and 3D games to earn Wins!',
    '🎮 Hold the controller button to use gamepad controls in any game.',
    '🏆 Complete achievements to earn bonus Eylux and exclusive badges.',
    '🔥 Live Events have limited-time rewards — don\'t miss them!',
    '🤖 Botty the robot can guide you through every feature. Click 🤖!',
    '💰 Visit the Shop to spend your Coins and Wins on cool items.',
    '👑 Add "Eylox" as a friend to unlock the Creator achievement!',
    '🎯 Daily challenges reset every 24 hours for fresh rewards.',
    '⚔️ Choose your AI difficulty wisely — Legend mode is brutal!',
    '📹 You can change your video call background during a call.',
    '🛒 Check the Featured tab in the Shop for daily deals.',
    '⭐ Rate games after playing to help other players discover great content.',
    '🎉 Tutorial completion gives you 50 bonus Eylux to start!',
    '🔊 Turn on sound effects in Settings for a better game experience.',
    '📱 Eylox works on phones, tablets, and consoles too!',
    '💎 Legendary items in the Shop cost Wins — they\'re worth it!',
    '🌟 Your win streak boosts your ranking on the leaderboard.',
    '🤝 Join a Squad to tackle missions with friends together.',
    '🎵 Concert events give exclusive emotes not available elsewhere.',
    '⚡ The Instant Game button picks a random game just for you!',
  ];

  /* ── Gameplay hints per page ── */
  const PAGE_HINTS = {
    'ai': [
      '⚔️ AI Battle Tip: Click the glowing target as fast as you can!',
      '🧠 Harder difficulty = more coins, but fewer chances to miss.',
      '🔥 Win 3 battles in a row to activate your win streak bonus!',
      '⏱️ You have 25 seconds per round. Speed wins matches!',
    ],
    'games': [
      '🎮 3D games earn Wins. 2D games earn Coins.',
      '⭐ Try top-rated games first — they\'re the most fun!',
      '🏆 Complete a 3D game to get Wins added to your balance.',
      '🎯 Some games have bonus objectives — read the description!',
    ],
    'shop': [
      '🛒 Limited items disappear — buy them before time runs out!',
      '💎 Legendary avatars make you stand out in games.',
      '🎟️ Game Passes give permanent perks like 2× XP!',
      '🎁 Check the Rewards tab for FREE claimable items!',
    ],
    'achievements': [
      '🎖️ Complete achievements to earn bonus Eylux automatically.',
      '👑 Adding "Eylox" as a friend unlocks a Legendary achievement!',
      '🔥 Some achievements require playing specific games.',
      '⭐ GlowMarks count toward your player level.',
    ],
  };

  /* ── Inject polish CSS ── */
  function injectCSS() {
    if (document.getElementById('eylox-polish-css')) return;
    const s = document.createElement('style');
    s.id = 'eylox-polish-css';
    s.textContent = `
      /* Loading screen */
      @keyframes plIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      @keyframes plOut { from{opacity:1} to{opacity:0} }
      @keyframes plSpin{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      #eylox-loading-screen {
        position:fixed;inset:0;z-index:999998;
        background:radial-gradient(ellipse at 50% 40%,rgba(20,8,50,.99) 0%,rgba(5,2,15,1) 100%);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;
        animation:plIn .3s ease both;
      }
      #eylox-loading-screen.fade-out { animation:plOut .5s ease both; }
      .pl-logo { font-family:'Fredoka One',cursive;font-size:2.6rem;color:#a78bfa;letter-spacing:.02em;text-shadow:0 0 30px rgba(167,139,250,.5); }
      .pl-spinner {
        width:44px;height:44px;border-radius:50%;
        border:3px solid rgba(167,139,250,.12);
        border-top-color:#a78bfa;
        animation:plSpin .9s linear infinite;
      }
      .pl-tip {
        max-width:320px;text-align:center;
        font-size:.8rem;color:rgba(200,190,230,.5);font-weight:700;line-height:1.5;
        padding:0 20px;
      }
      .pl-bar-wrap { width:200px;height:4px;background:rgba(167,139,250,.1);border-radius:99px;overflow:hidden; }
      .pl-bar { height:100%;background:linear-gradient(90deg,#a78bfa,#7c3aed);border-radius:99px;width:0%;transition:width 1.6s ease; }

      /* Click ripple */
      @keyframes ripple { to{transform:scale(4);opacity:0} }
      .eylox-ripple {
        position:absolute;border-radius:50%;
        background:rgba(167,139,250,.3);
        width:40px;height:40px;margin:-20px 0 0 -20px;
        animation:ripple .5s ease-out forwards;
        pointer-events:none;z-index:1000;
      }

      /* Hint pill */
      @keyframes hintIn  { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      @keyframes hintOut { from{opacity:1} to{opacity:0} }
      #eylox-hint-pill {
        position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:9000;
        background:rgba(10,3,28,.95);border:1px solid rgba(167,139,250,.2);border-radius:99px;
        padding:10px 20px;font-size:.78rem;font-weight:800;color:rgba(200,190,230,.7);
        white-space:nowrap;pointer-events:none;
        animation:hintIn .4s ease both;
        box-shadow:0 4px 20px rgba(0,0,0,.4);
      }
      #eylox-hint-pill.dismiss { animation:hintOut .4s ease both; }

      /* Scroll-in observer */
      .eylox-fade-in { opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease; }
      .eylox-fade-in.visible { opacity:1;transform:none; }

      /* Button polish */
      button, .btn, [class*="-btn"]:not(.eylox-no-ripple) { position:relative;overflow:hidden; }

      /* Topbar coins pulse when balance changes */
      @keyframes coinsBump { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
      .coins-bump { animation:coinsBump .3s ease; }
    `;
    document.head.appendChild(s);
  }

  /* ── Loading screen ── */
  function showLoadingScreen() {
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].includes(page)) return;
    /* Don't show if page loaded fast (already cached) */
    if (performance.now() > 400) return;
    injectCSS();
    const screen = document.createElement('div');
    screen.id = 'eylox-loading-screen';
    const tip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
    screen.innerHTML = `
      <div class="pl-logo">EYLOX</div>
      <div class="pl-spinner"></div>
      <div class="pl-bar-wrap"><div class="pl-bar" id="pl-bar"></div></div>
      <div class="pl-tip">${tip}</div>
    `;
    document.body.appendChild(screen);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bar = document.getElementById('pl-bar');
      if (bar) bar.style.width = '85%';
    }));
  }

  function hideLoadingScreen() {
    const screen = document.getElementById('eylox-loading-screen');
    if (!screen) return;
    const bar = document.getElementById('pl-bar');
    if (bar) { bar.style.transition = 'width .3s ease'; bar.style.width = '100%'; }
    setTimeout(() => {
      screen.classList.add('fade-out');
      setTimeout(() => screen.remove(), 500);
    }, 300);
  }

  /* ── Click ripple effect ── */
  function attachRipples() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, .btn, .sh-btn, .ai-battle-btn, .erb-btn-main');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'eylox-ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top) + 'px';
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    }, true);
  }

  /* ── Page hint system ── */
  let _hintIndex = 0;
  let _hintTimer = null;
  function showPageHint() {
    const page = document.body?.dataset?.page || '';
    const hints = PAGE_HINTS[page];
    if (!hints || !hints.length) return;
    /* Only show hints occasionally (not every page load) */
    const hintKey = `eylox_hint_shown_${page}`;
    const lastShown = parseInt(localStorage.getItem(hintKey) || '0', 10);
    if (Date.now() - lastShown < 10 * 60000) return; /* once per 10 min */
    localStorage.setItem(hintKey, String(Date.now()));
    const hint = hints[_hintIndex % hints.length];
    _hintIndex++;
    injectCSS();
    const pill = document.createElement('div');
    pill.id = 'eylox-hint-pill';
    pill.textContent = hint;
    document.body.appendChild(pill);
    _hintTimer = setTimeout(() => {
      pill.classList.add('dismiss');
      setTimeout(() => pill.remove(), 400);
    }, 5000);
  }

  /* ── Scroll-in fade for cards ── */
  function attachScrollFade() {
    const cards = document.querySelectorAll('.game-card, .sh-card, .ai-stat-card, .ev-card');
    if (!cards.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.1 });
    cards.forEach(c => { c.classList.add('eylox-fade-in'); obs.observe(c); });
  }

  /* ── Coins bump animation on topbar update ── */
  function watchCoins() {
    const coinsEl = document.querySelector('.tb-coins, #tbCoins, .coins-display');
    if (!coinsEl) return;
    let lastVal = coinsEl.textContent;
    const mo = new MutationObserver(() => {
      if (coinsEl.textContent !== lastVal) {
        lastVal = coinsEl.textContent;
        coinsEl.classList.remove('coins-bump');
        void coinsEl.offsetWidth; /* reflow */
        coinsEl.classList.add('coins-bump');
        setTimeout(() => coinsEl.classList.remove('coins-bump'), 400);
      }
    });
    mo.observe(coinsEl, { childList: true, characterData: true, subtree: true });
  }

  /* ── Improve button hover states ── */
  function polishButtons() {
    document.querySelectorAll('.sidebar-link, .ai-tab, .sh-tab').forEach(btn => {
      if (btn.dataset.polished) return;
      btn.dataset.polished = '1';
      btn.addEventListener('mouseenter', () => btn.style.transition = 'all .18s ease');
    });
  }

  /* ── Beginner welcome pill (first 3 visits) ── */
  function showBeginnerWelcome() {
    const visits = parseInt(localStorage.getItem('eylox_visit_count') || '0', 10) + 1;
    localStorage.setItem('eylox_visit_count', String(visits));
    if (visits > 3) return;
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].includes(page)) return;
    setTimeout(() => {
      injectCSS();
      const pill = document.createElement('div');
      pill.id = 'eylox-hint-pill';
      const msgs = [
        '👋 Welcome to Eylox! Click 🤖 to start the tutorial.',
        '🎮 Tip: Play games to earn Coins and Wins!',
        '💡 Click the 🤖 robot anytime for help!',
      ];
      pill.textContent = msgs[Math.min(visits - 1, msgs.length - 1)];
      document.body.appendChild(pill);
      setTimeout(() => {
        pill.classList.add('dismiss');
        setTimeout(() => pill.remove(), 400);
      }, 6000);
    }, 2500);
  }

  /* ── Init ── */
  /* Show loading screen immediately if page is loading */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectCSS();
      setTimeout(() => {
        attachRipples();
        attachScrollFade();
        watchCoins();
        polishButtons();
        showPageHint();
        showBeginnerWelcome();
        hideLoadingScreen();
      }, 100);
    });
    showLoadingScreen();
  } else {
    injectCSS();
    attachRipples();
    setTimeout(() => {
      attachScrollFade();
      watchCoins();
      polishButtons();
      showPageHint();
      showBeginnerWelcome();
    }, 200);
  }

})();
