/* ============================================================
   EYLOX — Currency & Rewards System v1.0
   All 15 named currencies with wallet modal, earn logic,
   sidebar/topbar integration, and animated display
   ============================================================ */
'use strict';

(function EyloxCurrencies() {

  /* ── Currency Registry ── */
  const CURRENCIES = [
    /* ── Core ── */
    {
      id:       'eylux',
      name:     'Eylux',
      icon:     '💰',
      color:    '#fbbf24',
      glow:     'rgba(251,191,36,.35)',
      category: 'core',
      catLabel: 'Core Currency',
      desc:     'The main currency of EYLOX. Earn by playing games, winning matches, and completing missions.',
      earn:     ['Play games', 'Win matches', 'Daily spin', 'Missions'],
      storageKey: 'Eylux',
    },
    {
      id:       'eygems',
      name:     'EyGems',
      icon:     '💎',
      color:    '#22d3ee',
      glow:     'rgba(34,211,238,.3)',
      category: 'core',
      catLabel: 'Core Currency',
      desc:     'Premium gems used for exclusive items, Season Pass, and rare unlocks.',
      earn:     ['Season Pass', 'Special events', 'Achievement rewards', 'Top leaderboard'],
      storageKey: 'gems',
    },
    {
      id:       'eyxp',
      name:     'EyXP',
      icon:     '📈',
      color:    '#4ade80',
      glow:     'rgba(74,222,128,.3)',
      category: 'core',
      catLabel: 'Core Currency',
      desc:     'Experience points that level up your profile and unlock Season Pass tiers.',
      earn:     ['Play games', 'Win matches', 'Daily login', 'Add friends'],
      storageKey: 'xp',
    },

    /* ── Trophies ── */
    {
      id:       'eyltrophs',
      name:     'Eyltrophs',
      icon:     '🏆',
      color:    '#f59e0b',
      glow:     'rgba(245,158,11,.3)',
      category: 'trophy',
      catLabel: 'Eyltrophs',
      desc:     'Standard Eyltrophs earned from winning games and completing challenges.',
      earn:     ['Win games', 'Beat challenges', 'First place'],
      storageKey: 'Eyltrophs',
    },
    {
      id:       'eylomedalss',
      name:     'EyloMedals',
      icon:     '🥇',
      color:    '#fb923c',
      glow:     'rgba(251,146,60,.3)',
      category: 'trophy',
      catLabel: 'Eyltrophs',
      desc:     'Event medals awarded for placing in live events and tournaments.',
      earn:     ['Live events', 'Tournaments', 'Top 3 placement'],
      storageKey: 'medals',
    },
    {
      id:       'luxcups',
      name:     'LuxCups',
      icon:     '🏆',
      color:    '#a78bfa',
      glow:     'rgba(167,139,250,.3)',
      category: 'trophy',
      catLabel: 'Eyltrophs',
      desc:     'Prestigious tournament Eyltrophs. Only the best players earn these.',
      earn:     ['Tournament wins', 'Clan wars', 'Ranked finals'],
      storageKey: 'luxcups',
    },
    {
      id:       'novatrophs',
      name:     'NovaTrophs',
      icon:     '🚀',
      color:    '#60a5fa',
      glow:     'rgba(96,165,250,.3)',
      category: 'trophy',
      catLabel: 'Eyltrophs',
      desc:     'Futuristic Eyltrophs for completing sci-fi and tech-themed game modes.',
      earn:     ['Nova events', 'Futuristic game modes', 'Space challenges'],
      storageKey: 'novatrophs',
    },
    {
      id:       'eyloxcrowns',
      name:     'Eylox Crowns',
      icon:     '👑',
      color:    '#fbbf24',
      glow:     'rgba(251,191,36,.45)',
      category: 'trophy',
      catLabel: 'Eyltrophs',
      desc:     'The rarest trophy — awarded only to top-ranked players on the global leaderboard.',
      earn:     ['Top 10 global rank', 'Season champion', 'Clan leader'],
      storageKey: 'crowns',
    },

    /* ── Achievements ── */
    {
      id:       'eylicons',
      name:     'Eylicons',
      icon:     '🌟',
      color:    '#f0abfc',
      glow:     'rgba(240,171,252,.3)',
      category: 'achievement',
      catLabel: 'Achievements',
      desc:     'Rare badges that mark exceptional skill and dedication in EYLOX.',
      earn:     ['Rare achievements', 'Hidden quests', 'Mastery unlocks'],
      storageKey: 'eylicons',
    },
    {
      id:       'glowmarks',
      name:     'GlowMarks',
      icon:     '⚡',
      color:    '#facc15',
      glow:     'rgba(250,204,21,.3)',
      category: 'achievement',
      catLabel: 'Achievements',
      desc:     'GlowMarks that track your overall progress across the entire platform.',
      earn:     ['All achievements', 'Milestones', 'Completion bonuses'],
      storageKey: 'glowmarks',
    },
    {
      id:       'elitebadges',
      name:     'Eylite Badges',
      icon:     '💠',
      color:    '#38bdf8',
      glow:     'rgba(56,189,248,.3)',
      category: 'achievement',
      catLabel: 'Achievements',
      desc:     'Premium achievement badges exclusive to Season Pass holders and long-time players.',
      earn:     ['Season Pass', 'Loyalty rewards', 'VIP challenges'],
      storageKey: 'elitebadges',
    },

    /* ── Collectibles ── */
    {
      id:       'eyshards',
      name:     'EyShards',
      icon:     '🔮',
      color:    '#818cf8',
      glow:     'rgba(129,140,248,.3)',
      category: 'collectible',
      catLabel: 'Collectibles',
      desc:     'Collectible fragments that can be combined to create rare items and avatars.',
      earn:     ['Random drops', 'Mystery boxes', 'Milestone rewards'],
      storageKey: 'shards',
    },
    {
      id:       'luxstars',
      name:     'LuxStars',
      icon:     '⭐',
      color:    '#fde68a',
      glow:     'rgba(253,230,138,.3)',
      category: 'collectible',
      catLabel: 'Collectibles',
      desc:     'Stars earned each time you level up. Spend them on cosmetics in the Star Shop.',
      earn:     ['Level up', 'Prestige milestones', 'Weekly bonus'],
      storageKey: 'luxstars',
    },

    /* ── Events ── */
    {
      id:       'luxies',
      name:     'Luxies',
      icon:     '🎁',
      color:    '#f472b6',
      glow:     'rgba(244,114,182,.3)',
      category: 'event',
      catLabel: 'Daily & Events',
      desc:     'Daily reward tokens. Claim them every day for Eylux, EyGems, and exclusive items.',
      earn:     ['Daily login', 'Daily challenges', 'Login streaks'],
      storageKey: 'luxies',
    },
    {
      id:       'vortextokens',
      name:     'Vortex Tokens',
      icon:     '🌌',
      color:    '#c084fc',
      glow:     'rgba(192,132,252,.35)',
      category: 'event',
      catLabel: 'Daily & Events',
      desc:     'Special event currency used exclusively during Vortex season events.',
      earn:     ['Vortex events', 'Special missions', 'Limited-time challenges'],
      storageKey: 'vortex',
    },
  ];

  const CATEGORIES = [
    { id: 'all',         label: 'All',           icon: '✦' },
    { id: 'core',        label: 'Core',          icon: '💰' },
    { id: 'trophy',      label: 'Eyltrophs',      icon: '🏆' },
    { id: 'achievement', label: 'Achievements',  icon: '🌟' },
    { id: 'collectible', label: 'Collectibles',  icon: '🔮' },
    { id: 'event',       label: 'Daily & Events',icon: '🎁' },
  ];

  /* ── Storage helpers ── */
  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; }
  }
  function getAmount(currency) {
    const u = getUser();
    return u[currency.storageKey] || 0;
  }
  function addAmount(currencyId, amount) {
    const cur = CURRENCIES.find(c => c.id === currencyId);
    if (!cur) return;
    const u = getUser();
    u[cur.storageKey] = (u[cur.storageKey] || 0) + amount;
    localStorage.setItem('eylox_user', JSON.stringify(u));
    refreshTopbar();
    refreshSidebar();
  }

  /* ── Inject Styles ── */
  function injectStyles() {
    if (document.getElementById('cur-css')) return;
    const s = document.createElement('style');
    s.id = 'cur-css';
    s.textContent = `
      @keyframes curFadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes curSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      @keyframes curFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes curShine   { 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes curCount   { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }

      #cur-overlay { animation:curFadeIn .2s ease; }
      #cur-overlay .cur-inner { animation:curSlideUp .32s cubic-bezier(.34,1.56,.64,1); }

      .cur-tab {
        padding:6px 14px; border-radius:99px; cursor:pointer;
        font-size:.72rem; font-weight:800; color:rgba(167,139,250,.4);
        border:1px solid transparent; transition:all .15s; white-space:nowrap; flex-shrink:0;
      }
      .cur-tab.active {
        background:rgba(167,139,250,.15); border-color:rgba(167,139,250,.3); color:#e0d4ff;
      }

      .cur-card {
        background:rgba(255,255,255,.03); border:1px solid rgba(167,139,250,.1);
        border-radius:16px; padding:16px; transition:all .22s; cursor:default;
        position:relative; overflow:hidden;
      }
      .cur-card:hover {
        border-color:var(--cur-color); transform:translateY(-3px);
        box-shadow:0 8px 28px var(--cur-glow);
      }
      .cur-card::before {
        content:''; position:absolute; inset:0; border-radius:16px;
        background:radial-gradient(ellipse at top left, var(--cur-glow) 0%, transparent 65%);
        opacity:0; transition:opacity .3s;
      }
      .cur-card:hover::before { opacity:1; }

      .cur-icon {
        font-size:2rem; margin-bottom:8px;
        display:inline-block; animation:curFloat 3s ease-in-out infinite;
      }
      .cur-amount {
        font-family:'Fredoka One',cursive; font-size:1.4rem;
        line-height:1; margin-bottom:3px;
        animation:curCount .4s ease;
      }
      .cur-name {
        font-size:.72rem; font-weight:900; letter-spacing:.02em;
        margin-bottom:6px;
      }
      .cur-desc {
        font-size:.65rem; color:rgba(200,190,230,.45); font-weight:700;
        line-height:1.5; margin-bottom:8px;
      }
      .cur-earn-row {
        display:flex; flex-wrap:wrap; gap:4px;
      }
      .cur-earn-chip {
        background:rgba(167,139,250,.08); border:1px solid rgba(167,139,250,.15);
        border-radius:99px; padding:2px 8px; font-size:.58rem; font-weight:800;
        color:rgba(167,139,250,.55);
      }
      .cur-cat-label {
        font-size:.58rem; font-weight:900; text-transform:uppercase;
        letter-spacing:.08em; opacity:.4; margin-bottom:2px;
      }

      /* Topbar wallet pill */
      #cur-wallet-btn {
        display:flex; align-items:center; gap:6px;
        background:rgba(251,191,36,.08); border:1px solid rgba(251,191,36,.2);
        border-radius:99px; padding:4px 12px; cursor:pointer;
        font-size:.78rem; font-weight:800; color:#fbbf24;
        transition:all .18s;
      }
      #cur-wallet-btn:hover {
        background:rgba(251,191,36,.16); border-color:rgba(251,191,36,.4);
        transform:translateY(-1px);
      }
      #cur-wallet-btn .cw-gem {
        color:#22d3ee; border-left:1px solid rgba(255,255,255,.08);
        padding-left:8px; margin-left:2px;
      }

      /* Sidebar currency items */
      .cur-sidebar-item {
        display:flex; align-items:center; gap:10px;
        padding:8px 12px; border-radius:10px;
        background:rgba(255,255,255,.03); border:1px solid rgba(167,139,250,.08);
        margin-bottom:6px; transition:border-color .2s;
      }
      .cur-sidebar-item:hover { border-color:rgba(167,139,250,.2); }
      .cur-sidebar-icon { font-size:1.1rem; flex-shrink:0; }
      .cur-sidebar-amount { font-family:'Fredoka One',cursive; font-size:.95rem; line-height:1; }
      .cur-sidebar-name { font-size:.6rem; font-weight:800; opacity:.45; }

      /* Scroll */
      #cur-grid-wrap {
        scrollbar-width:thin;
        scrollbar-color:rgba(167,139,250,.2) transparent;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Wallet Modal ── */
  let activeCategory = 'all';

  function openWallet() {
    if (document.getElementById('cur-overlay')) return;
    injectStyles();
    const overlay = document.createElement('div');
    overlay.id = 'cur-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,1,8,.94);z-index:99990;display:flex;align-items:center;justify-content:center;padding:12px;backdrop-filter:blur(6px)';
    overlay.innerHTML = buildWallet();
    overlay.addEventListener('click', e => { if (e.target === overlay) closeWallet(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function buildWallet() {
    const u = getUser();
    const totalEylux = (u.coins || 0).toLocaleString();
    const totalGems  = (u.gems  || 0).toLocaleString();

    return `
      <div class="cur-inner" style="background:linear-gradient(160deg,#0c0520 0%,#07030f 100%);border:1px solid rgba(167,139,250,.22);border-radius:24px;width:100%;max-width:820px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,.8),0 0 80px rgba(124,58,237,.08)">

        <!-- HEADER -->
        <div style="padding:22px 24px 18px;border-bottom:1px solid rgba(167,139,250,.1);flex-shrink:0;background:linear-gradient(135deg,rgba(124,58,237,.2) 0%,rgba(34,211,238,.06) 100%);border-radius:24px 24px 0 0;position:relative;overflow:hidden">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 15% 50%,rgba(124,58,237,.15) 0%,transparent 55%);pointer-events:none"></div>
          <button onclick="EyloxCurrencies.close()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.45);border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:.9rem;z-index:1">✕</button>

          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;position:relative">
            <div style="font-size:2.4rem;animation:curFloat 3s ease-in-out infinite">💰</div>
            <div>
              <div style="font-size:.65rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">✦ EYLOX WALLET</div>
              <div style="font-family:'Fredoka One',cursive;font-size:1.5rem;background:linear-gradient(135deg,#fbbf24,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1">Your Currencies & Rewards</div>
              <div style="font-size:.75rem;color:rgba(200,190,230,.5);font-weight:700;margin-top:3px">All 15 reward types in one place</div>
            </div>
          </div>

          <!-- Quick stats: Eylux + EyGems -->
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:10px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);border-radius:14px;padding:10px 16px;flex:1;min-width:0">
              <div style="font-size:1.6rem">💰</div>
              <div>
                <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#fbbf24">${totalEylux}</div>
                <div style="font-size:.62rem;font-weight:900;color:rgba(251,191,36,.5)">EYLUX</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.2);border-radius:14px;padding:10px 16px;flex:1;min-width:0">
              <div style="font-size:1.6rem">💎</div>
              <div>
                <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#22d3ee">${totalGems}</div>
                <div style="font-size:.62rem;font-weight:900;color:rgba(34,211,238,.5)">EYGEMS</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.2);border-radius:14px;padding:10px 16px;flex:1;min-width:0">
              <div style="font-size:1.6rem">📈</div>
              <div>
                <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#4ade80">${(u.xp || 0).toLocaleString()}</div>
                <div style="font-size:.62rem;font-weight:900;color:rgba(74,222,128,.5)">EYXP</div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABS -->
        <div style="padding:12px 20px;border-bottom:1px solid rgba(167,139,250,.08);display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;flex-shrink:0">
          ${CATEGORIES.map(c => `<div class="cur-tab${activeCategory===c.id?' active':''}" onclick="EyloxCurrencies._setTab('${c.id}')">${c.icon} ${c.label}</div>`).join('')}
        </div>

        <!-- GRID -->
        <div id="cur-grid-wrap" style="overflow-y:auto;flex:1;padding:16px 20px">
          ${buildGrid()}
        </div>

      </div>
    `;
  }

  function buildGrid() {
    const u = getUser();
    const filtered = activeCategory === 'all' ? CURRENCIES : CURRENCIES.filter(c => c.category === activeCategory);

    /* Group by category if showing all */
    if (activeCategory === 'all') {
      const groups = {};
      filtered.forEach(c => {
        if (!groups[c.category]) groups[c.category] = [];
        groups[c.category].push(c);
      });
      return Object.entries(groups).map(([catId, list]) => {
        const catInfo = CATEGORIES.find(c => c.id === catId);
        return `
          <div style="margin-bottom:20px">
            <div style="font-size:.65rem;font-weight:900;color:rgba(167,139,250,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;display:flex;align-items:center;gap:6px">
              <span>${catInfo?.icon}</span> ${catInfo?.label}
              <div style="flex:1;height:1px;background:rgba(167,139,250,.08);margin-left:6px"></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">
              ${list.map(c => buildCard(c, u)).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">${filtered.map(c => buildCard(c, u)).join('')}</div>`;
  }

  function buildCard(c, u) {
    const amount = (u[c.storageKey] || 0).toLocaleString();
    const isZero = (u[c.storageKey] || 0) === 0;
    return `
      <div class="cur-card" style="--cur-color:${c.color};--cur-glow:${c.glow};${isZero?'opacity:.55':''}">
        <div class="cur-cat-label" style="color:${c.color}">${c.catLabel}</div>
        <div class="cur-icon">${c.icon}</div>
        <div class="cur-amount" style="color:${c.color}">${amount}</div>
        <div class="cur-name" style="color:${c.color}">${c.name}</div>
        <div class="cur-desc">${c.desc}</div>
        <div class="cur-earn-row">
          ${c.earn.map(e => `<span class="cur-earn-chip">${e}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function closeWallet() {
    const ov = document.getElementById('cur-overlay');
    if (!ov) return;
    ov.style.animation = 'curFadeIn .15s ease reverse forwards';
    setTimeout(() => { ov.remove(); document.body.style.overflow = ''; }, 150);
  }

  /* ── Topbar Wallet Button ── */
  function injectTopbarBtn() {
    if (document.getElementById('cur-wallet-btn')) return;
    const topbar = document.querySelector('.topbar-right, .tb-right');
    if (!topbar) return;
    const u = getUser();

    const btn = document.createElement('button');
    btn.id = 'cur-wallet-btn';
    btn.setAttribute('data-tip', 'Open Wallet — all your currencies');
    btn.innerHTML = `
      💰 <span id="tb-eylux">${(u.coins || 0).toLocaleString()}</span>
      <span class="cw-gem">💎 <span id="tb-eygems">${(u.gems || 0)}</span></span>
    `;
    btn.addEventListener('click', e => { e.stopPropagation(); openWallet(); });

    /* Insert before the existing coins display */
    const existingCoins = topbar.querySelector('.tb-coins');
    if (existingCoins) {
      existingCoins.style.display = 'none';
      topbar.insertBefore(btn, existingCoins);
    } else {
      topbar.insertBefore(btn, topbar.firstChild);
    }
  }

  function refreshTopbar() {
    const u = getUser();
    const eylux = document.getElementById('tb-eylux');
    const gems  = document.getElementById('tb-eygems');
    const legacyCoins = document.getElementById('topbarCoins');
    const legacyTrophs = document.getElementById('topbarTrophies');

    if (eylux) eylux.textContent = (u.coins || 0).toLocaleString();
    if (gems)  gems.textContent  = (u.gems || 0).toLocaleString();
    if (legacyCoins)  legacyCoins.textContent  = (u.coins || 0).toLocaleString();
    if (legacyTrophs) legacyTrophs.textContent = (u.Eyltrophs || 0).toLocaleString();
  }

  /* ── Sidebar Currency Panel ── */
  function refreshSidebar() {
    const u = getUser();

    /* Update existing sidebar amounts */
    document.querySelectorAll('.coins-amount').forEach(el => {
      el.textContent = (u.coins || 0).toLocaleString();
    });
    document.querySelectorAll('.Eyltrophs-amount').forEach(el => {
      el.textContent = (u.Eyltrophs || 0).toLocaleString();
    });

    /* Update sidebar labels to proper names */
    document.querySelectorAll('.coins-label').forEach((el, i) => {
      if (i === 0) el.textContent = 'Eylux';
    });

    /* Inject expanded currency panel into sidebar if not present */
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar || document.getElementById('cur-sidebar-panel')) return;

    const coinsDiv = sidebar.querySelector('.sidebar-coins');
    if (!coinsDiv) return;

    /* Build a compact multi-currency sidebar widget after the existing coins */
    const panel = document.createElement('div');
    panel.id = 'cur-sidebar-panel';
    panel.style.cssText = 'margin-top:10px;padding:0 4px';

    /* Show top 6 currencies in sidebar */
    const sidebarCurrencies = CURRENCIES.filter(c => ['eygems','eylicons','glowmarks','luxies','eyshards','vortextokens'].includes(c.id));
    panel.innerHTML = `
      <div style="font-size:.6rem;font-weight:900;color:rgba(167,139,250,.35);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;padding:0 4px">More Currencies</div>
      ${sidebarCurrencies.map(c => `
        <div class="cur-sidebar-item" style="border-color:rgba(${hexToRgb(c.color)},.12)">
          <div class="cur-sidebar-icon">${c.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="cur-sidebar-name" style="color:${c.color}">${c.name}</div>
            <div class="cur-sidebar-amount" style="color:${c.color}" id="sbar-${c.id}">${(u[c.storageKey] || 0).toLocaleString()}</div>
          </div>
        </div>
      `).join('')}
      <button onclick="EyloxCurrencies.open()" style="width:100%;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.18);border-radius:10px;padding:8px;color:rgba(167,139,250,.7);font-size:.72rem;font-weight:800;cursor:pointer;margin-top:6px;transition:all .18s" onmouseover="this.style.background='rgba(167,139,250,.15)'" onmouseout="this.style.background='rgba(167,139,250,.08)'">
        💰 Open Full Wallet
      </button>
    `;

    /* Insert after last .sidebar-coins */
    const allCoins = sidebar.querySelectorAll('.sidebar-coins');
    const lastCoin = allCoins[allCoins.length - 1];
    if (lastCoin) lastCoin.insertAdjacentElement('afterend', panel);
    else sidebar.appendChild(panel);
  }

  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '167,139,250';
  }

  /* ── Animated Earn Popup ── */
  function showEarnPopup(currencyId, amount) {
    const cur = CURRENCIES.find(c => c.id === currencyId);
    if (!cur || !amount) return;

    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; bottom:80px; right:20px; z-index:99998;
      background:rgba(8,2,22,.97); border:1px solid ${cur.color};
      border-radius:99px; padding:8px 18px; font-size:.82rem; font-weight:900;
      color:${cur.color}; box-shadow:0 6px 24px ${cur.glow};
      display:flex; align-items:center; gap:8px;
      animation:curSlideUp .3s cubic-bezier(.34,1.56,.64,1) both;
      pointer-events:none;
    `;
    el.innerHTML = `${cur.icon} <span>+${amount} ${cur.name}</span>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'curFadeIn .25s ease reverse forwards';
      setTimeout(() => el.remove(), 300);
    }, 2000);
  }

  /* ── Award Helpers ── */
  function award(currencyId, amount, reason) {
    addAmount(currencyId, amount);
    showEarnPopup(currencyId, amount);
    document.dispatchEvent(new CustomEvent('eylox:currency:earned', { detail: { currencyId, amount, reason } }));
  }

  /* ── Public API ── */
  window.EyloxCurrencies = {
    open:  openWallet,
    close: closeWallet,
    award,
    addAmount,
    getAmount: (id) => { const c = CURRENCIES.find(x => x.id === id); return c ? getAmount(c) : 0; },
    CURRENCIES,

    _setTab(catId) {
      activeCategory = catId;
      document.querySelectorAll('.cur-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cur-tab').forEach(t => {
        if (t.textContent.trim().includes(CATEGORIES.find(c => c.id === catId)?.label || catId))
          t.classList.add('active');
      });
      const grid = document.getElementById('cur-grid-wrap');
      if (grid) {
        grid.style.opacity = '0';
        setTimeout(() => {
          grid.innerHTML = buildGrid();
          grid.style.transition = 'opacity .2s ease';
          grid.style.opacity = '1';
        }, 100);
      }
    },

    refresh() { refreshTopbar(); refreshSidebar(); },
  };

  /* ── Game Events → Award currencies ── */
  document.addEventListener('eylox:game:win',      () => { award('eyltrophs', 1, 'win'); award('glowmarks', 10, 'win'); });
  document.addEventListener('eylox:ranked:win',    () => { award('luxcups', 1, 'ranked'); award('eyltrophs', 2, 'ranked'); });
  document.addEventListener('eylox:daily:login',   () => { award('luxies', 1, 'daily'); award('luxstars', 1, 'daily'); });
  document.addEventListener('eylox:achievement',   () => { award('glowmarks', 25, 'ach'); award('eylicons', 1, 'ach'); });
  document.addEventListener('eylox:event:win',     () => { award('eylomedalss', 1, 'event'); award('vortextokens', 5, 'event'); });
  document.addEventListener('eylox:level:up',      () => { award('luxstars', 2, 'level'); });
  document.addEventListener('eylox:game:play',     () => { if (Math.random() > .7) award('eyshards', 1, 'drop'); });

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    setTimeout(() => {
      injectTopbarBtn();
      refreshTopbar();
      refreshSidebar();
    }, 900);
  });

})();
