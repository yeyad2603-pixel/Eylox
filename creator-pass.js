/* creator-pass.js — EYLOX Creator Pass modal v1.0 */
(function () {
  'use strict';

  /* ── Currency: 200 EGP for Egypt, 100 local elsewhere ── */
  function detectCurrency() {
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en');
    const tz   = (Intl && Intl.DateTimeFormat) ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '';

    if (tz.includes('Cairo') || tz.includes('Africa/Cairo') || lang.startsWith('ar-EG')) {
      return { code:'EGP', symbol:'EGP', base:200, name:'Egyptian Pounds' };
    }
    const MAP = {
      'ar-SA':{ code:'SAR', symbol:'SAR', base:100, name:'Saudi Riyals'       },
      'ar-AE':{ code:'AED', symbol:'AED', base:100, name:'UAE Dirhams'        },
      'ar-KW':{ code:'KWD', symbol:'KWD', base:100, name:'Kuwaiti Dinars'     },
      'ar-QA':{ code:'QAR', symbol:'QAR', base:100, name:'Qatari Riyals'      },
      'ar':   { code:'EGP', symbol:'EGP', base:200, name:'Egyptian Pounds'    },
      'tr':   { code:'TRY', symbol:'₺',   base:100, name:'Turkish Lira'       },
      'ru':   { code:'RUB', symbol:'₽',   base:100, name:'Russian Rubles'     },
      'ja':   { code:'JPY', symbol:'¥',   base:100, name:'Japanese Yen'       },
      'ko':   { code:'KRW', symbol:'₩',   base:100, name:'Korean Won'         },
      'zh-CN':{ code:'CNY', symbol:'¥',   base:100, name:'Chinese Yuan'       },
      'zh':   { code:'CNY', symbol:'¥',   base:100, name:'Chinese Yuan'       },
      'pt-BR':{ code:'BRL', symbol:'R$',  base:100, name:'Brazilian Reais'    },
      'pt':   { code:'BRL', symbol:'R$',  base:100, name:'Brazilian Reais'    },
      'hi':   { code:'INR', symbol:'₹',   base:100, name:'Indian Rupees'      },
      'en-IN':{ code:'INR', symbol:'₹',   base:100, name:'Indian Rupees'      },
      'de':   { code:'EUR', symbol:'€',   base:100, name:'Euros'              },
      'fr':   { code:'EUR', symbol:'€',   base:100, name:'Euros'              },
      'es':   { code:'EUR', symbol:'€',   base:100, name:'Euros'              },
      'it':   { code:'EUR', symbol:'€',   base:100, name:'Euros'              },
      'nl':   { code:'EUR', symbol:'€',   base:100, name:'Euros'              },
      'pl':   { code:'PLN', symbol:'zł',  base:100, name:'Polish Złoty'       },
      'en-GB':{ code:'GBP', symbol:'£',   base:100, name:'British Pounds'     },
      'en-AU':{ code:'AUD', symbol:'A$',  base:100, name:'Australian Dollars' },
      'en-CA':{ code:'CAD', symbol:'C$',  base:100, name:'Canadian Dollars'   },
      'en':   { code:'USD', symbol:'$',   base:100, name:'US Dollars'         },
    };
    const exact  = MAP[lang];
    if (exact) return exact;
    const prefix = MAP[lang.split('-')[0]];
    if (prefix) return prefix;
    return { code:'USD', symbol:'$', base:100, name:'US Dollars' };
  }

  /* ── Tier data ── */
  const TIERS = [
    {
      id: 'pass',
      name: 'Creator Pass',
      icon: '🎮',
      color: '#a78bfa',
      glow: 'rgba(167,139,250,.35)',
      mult: 1,
      tagline: 'Start creating today',
      features: [
        '10 AI game generations / day',
        'Instant publish to Discover',
        'Basic terrain editor',
        'Creator badge on profile',
        'Auto-generated thumbnails',
        '1.5× coin earnings from games',
        'Creator dashboard (basic)',
        'Monthly Creator Crate 📦',
      ],
    },
    {
      id: 'pro',
      name: 'Creator Pro',
      icon: '⚡',
      color: '#60a5fa',
      glow: 'rgba(96,165,250,.4)',
      mult: 2,
      tagline: 'Build faster. Grow bigger.',
      badge: 'MOST POPULAR',
      features: [
        'Unlimited AI game generations 🧠',
        'Ultra-fast creation ⚡',
        'Advanced AI scripting tools 🧩',
        'Auto-build full maps 🌍',
        'AI-generated NPCs with dialogue 🎤',
        'Featured placement on Discover 🌟',
        'Priority trending boost 📈',
        'Pro terrain + building editor ⛰️',
        'Custom shaders & lighting 🌈',
        'Sound & music editor 🎵',
        '2× coin earnings from games 💎',
        'Creator revenue share 💵',
        '"Featured Creator" profile tag 🔥',
        'Game analytics dashboard 📊',
        'Player count & revenue tracker 💰',
        '2× monthly Creator Crates 📦',
      ],
    },
    {
      id: 'legend',
      name: 'Creator Legend',
      icon: '👑',
      color: '#fbbf24',
      glow: 'rgba(251,191,36,.45)',
      mult: 3,
      tagline: 'The ultimate creator power',
      badge: 'BEST VALUE',
      features: [
        'Everything in Creator Pro ✅',
        'Animation creator 🤸',
        'In-game coding helper AI 🤖',
        'Bug fixer AI 🔧',
        'Game optimization tips 📊',
        'Auto-balance rewards system ⚖️',
        'Engagement heatmap 🔥',
        'Feedback & review system 💬',
        'Exclusive Legend-only skins 🎨',
        'Animated tools & effects 🛠️',
        'Rare building effects ✨',
        'Paid game features unlock 🔓',
        'Appear in trending — guaranteed 📊',
        'Early access to every new update 🚀',
        'Auto-generated trailers 🎬',
        '3× coin earnings 💎 + priority revenue',
        'Priority support — direct line 📞',
        '3× monthly Creator Crates 📦',
      ],
    },
  ];

  /* ── Inject styles once ── */
  function injectStyles() {
    if (document.getElementById('cpStyles')) return;
    const s = document.createElement('style');
    s.id = 'cpStyles';
    s.textContent = `
      @keyframes cpFadeIn   { from{opacity:0}               to{opacity:1}             }
      @keyframes cpSlideUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
      @keyframes cpShine    { 0%{background-position:-200% center} 100%{background-position:200% center} }
      @keyframes cpPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.4)} 50%{box-shadow:0 0 0 8px rgba(251,191,36,0)} }
      @keyframes cpFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes cpSpin     { to{transform:rotate(360deg)} }
      #cpOverlay            { animation: cpFadeIn .2s ease; }
      #cpOverlay .cp-inner  { animation: cpSlideUp .3s cubic-bezier(.34,1.56,.64,1); }
      .cp-scroll::-webkit-scrollbar { width:5px; }
      .cp-scroll::-webkit-scrollbar-track { background:transparent; }
      .cp-scroll::-webkit-scrollbar-thumb { background:rgba(167,139,250,.3); border-radius:99px; }
      .cp-tier-card { transition: all .22s cubic-bezier(.34,1.56,.64,1); }
      .cp-tier-card:hover { transform:translateY(-4px); }
      .cp-tier-card.selected { transform:translateY(-6px) scale(1.02); }
      .cp-buy-btn { transition: transform .18s, box-shadow .18s, background-position .4s; background-size:200% auto; }
      .cp-buy-btn:hover:not(:disabled) { transform:translateY(-2px); background-position:right center; }
      .cp-buy-btn:active { transform:scale(.97); }
      .cp-feat-item { display:flex; align-items:flex-start; gap:9px; padding:6px 0; font-size:.8rem; font-weight:700; color:rgba(220,210,240,.85); border-bottom:1px solid rgba(167,139,250,.06); }
      .cp-feat-item:last-child { border-bottom:none; }
      .cp-feat-check { color:#4ade80; font-size:.8rem; flex-shrink:0; margin-top:1px; }
      .cp-badge { display:inline-flex; align-items:center; font-size:.62rem; font-weight:900; letter-spacing:.8px; padding:3px 9px; border-radius:99px; }
      .cp-social-proof { display:flex; align-items:center; gap:8px; font-size:.75rem; font-weight:800; color:rgba(167,139,250,.6); }
      .cp-dot-live { width:7px; height:7px; background:#4ade80; border-radius:50%; animation:cpPulse 2s infinite; flex-shrink:0; }
    `;
    document.head.appendChild(s);
  }

  /* ── Selected tier state ── */
  let _selectedTier = 'pro';

  function selectTier(id) {
    _selectedTier = id;
    TIERS.forEach(t => {
      const card = document.getElementById('cp-tier-' + t.id);
      if (!card) return;
      if (t.id === id) {
        card.classList.add('selected');
        card.style.borderColor = t.color;
        card.style.boxShadow = '0 0 28px ' + t.glow + ', 0 8px 32px rgba(0,0,0,.4)';
      } else {
        card.classList.remove('selected');
        card.style.borderColor = 'rgba(167,139,250,.15)';
        card.style.boxShadow = 'none';
      }
    });
    updateCTAButton();
  }

  function updateCTAButton() {
    const curr = detectCurrency();
    const tier = TIERS.find(t => t.id === _selectedTier);
    if (!tier) return;
    const price = curr.base * tier.mult;
    const btn   = document.getElementById('cpBuyBtn');
    const lbl   = document.getElementById('cpPriceLabel');
    if (btn)  btn.textContent  = `${tier.icon} Get ${tier.name} — ${curr.symbol}${price} / ${curr.code}`;
    if (lbl) lbl.textContent   = `${curr.symbol}${price} ${curr.name} per month`;
    if (btn) {
      btn.style.background = tier.id === 'legend'
        ? 'linear-gradient(135deg,#d97706,#fbbf24,#f59e0b,#d97706)'
        : tier.id === 'pro'
          ? 'linear-gradient(135deg,#2563eb,#60a5fa,#3b82f6,#2563eb)'
          : 'linear-gradient(135deg,#7c3aed,#a78bfa,#8b5cf6,#7c3aed)';
      btn.style.boxShadow = '0 8px 28px ' + tier.glow;
    }
  }

  /* ── Build modal ── */
  function createModal() {
    if (document.getElementById('cpOverlay')) return;
    injectStyles();

    const curr      = detectCurrency();
    const isCreator = localStorage.getItem('eylox_creator_pass') === 'true';
    const owned     = localStorage.getItem('eylox_creator_tier') || '';

    const overlay = document.createElement('div');
    overlay.id = 'cpOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,1,8,.92);z-index:99990;display:flex;align-items:center;justify-content:center;padding:12px;backdrop-filter:blur(6px)';

    /* ── Tier cards HTML ── */
    const tierCards = TIERS.map(t => {
      const price = curr.base * t.mult;
      const isOwned = isCreator && owned === t.id;
      return `
        <div class="cp-tier-card" id="cp-tier-${t.id}"
          onclick="selectCreatorTier('${t.id}')"
          style="flex:1;min-width:0;background:rgba(167,139,250,.05);border:2px solid rgba(167,139,250,.15);border-radius:16px;padding:18px 16px;cursor:pointer;position:relative;overflow:hidden;${t.id===_selectedTier?`border-color:${t.color};box-shadow:0 0 28px ${t.glow},0 8px 32px rgba(0,0,0,.4);transform:translateY(-6px) scale(1.02)`:''}"
        >
          ${t.badge ? `<div style="position:absolute;top:10px;right:10px;background:${t.id==='legend'?'linear-gradient(135deg,#d97706,#fbbf24)':'linear-gradient(135deg,#2563eb,#60a5fa)'};color:${t.id==='legend'?'#000':'#fff'};border-radius:99px;padding:2px 9px;font-size:.6rem;font-weight:900;letter-spacing:.8px">${t.badge}</div>` : ''}
          <div style="font-size:1.8rem;margin-bottom:6px">${t.icon}</div>
          <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:${t.color};margin-bottom:3px">${t.name}</div>
          <div style="font-size:.68rem;color:rgba(200,190,230,.55);font-weight:700;margin-bottom:12px;line-height:1.3">${t.tagline}</div>
          <div style="font-family:'Fredoka One',cursive;font-size:1.55rem;color:${t.color}">${curr.symbol}${price}</div>
          <div style="font-size:.65rem;color:rgba(200,190,230,.45);font-weight:700">${curr.code}/month</div>
          ${isOwned ? `<div style="margin-top:10px;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);color:#4ade80;border-radius:8px;padding:4px 8px;font-size:.68rem;font-weight:900;text-align:center">✓ ACTIVE</div>` : ''}
        </div>
      `;
    }).join('');

    /* ── Feature sections ── */
    const SECTIONS = [
      { icon:'🤖', title:'AI Studio Boost',      items:['Unlimited AI game generations 🧠','Ultra-fast game creation ⚡','Advanced AI scripting tools 🧩','Auto-build full maps 🌍','AI-generated NPCs with dialogue 🎤'] },
      { icon:'📢', title:'Publishing Power',     items:['Instant publish to Discover 🚀','Featured placement chance 🌟','Priority trending boost 📈','More games published per day 📦','Auto-generated thumbnails + trailers 🎬'] },
      { icon:'🎨', title:'Creator Tools',        items:['Pro terrain editor ⛰️','Advanced building blocks 🧱','Custom shaders & lighting 🌈','Sound & music editor 🎵','Animation creator 🤸'] },
      { icon:'🧠', title:'Smart AI Assistant',   items:['In-game coding helper 🤖','Bug fixer AI 🔧','Game optimization tips 📊','Auto-balance rewards system ⚖️'] },
      { icon:'💰', title:'Monetization Boost',   items:['Higher earnings from coins & wins 💎','Creator revenue share 💵','Premium game shop access 🛒','Paid game features unlock 🔓'] },
      { icon:'🌟', title:'Visibility Boost',     items:['Creator badge 👑','"Featured Creator" profile tag 🔥','Appear in trending more often 📊','Early access to new updates 🚀'] },
      { icon:'🎁', title:'Exclusive Rewards',    items:['Creator-only skins 🎨','Animated tools 🛠️','Rare building effects ✨','Monthly Creator Crates 📦'] },
      { icon:'📊', title:'Creator Dashboard',    items:['Game performance analytics 📊','Player count tracking 👥','Revenue tracker 💰','Engagement heatmap 🔥','Feedback system 💬'] },
    ];

    const sectionsHTML = SECTIONS.map(s => `
      <div style="background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.09);border-radius:12px;padding:14px 16px;margin-bottom:8px">
        <div style="font-size:.82rem;font-weight:900;color:#e0d4ff;margin-bottom:10px">${s.icon} ${s.title}</div>
        ${s.items.map(i => `<div class="cp-feat-item"><span class="cp-feat-check">✦</span>${i}</div>`).join('')}
      </div>
    `).join('');

    /* ── Tier comparison (mini) ── */
    const compRows = [
      ['AI generations/day',      '10',           'Unlimited ⚡',       'Unlimited ⚡'],
      ['Publish slots/day',        '3',            '10',                 'Unlimited'],
      ['Coin earnings boost',      '1.5×',         '2×',                 '3× 💎'],
      ['Featured on Discover',     '—',            '✅',                  '✅ Guaranteed'],
      ['Creator dashboard',        'Basic',        'Full 📊',            'Full + Heatmap 🔥'],
      ['AI NPC builder',           '—',            '✅',                  '✅'],
      ['Animation creator',        '—',            '—',                  '✅ 🤸'],
      ['Monthly Creator Crates',   '1 📦',         '2 📦',               '3 📦'],
    ];

    const compHTML = `
      <div style="overflow-x:auto;margin-bottom:0">
        <table style="width:100%;border-collapse:collapse;font-size:.74rem;min-width:420px">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 10px;color:rgba(167,139,250,.5);font-weight:900;letter-spacing:.5px;border-bottom:1px solid rgba(167,139,250,.12)">FEATURE</th>
              ${TIERS.map(t=>`<th style="text-align:center;padding:8px 6px;color:${t.color};font-weight:900;border-bottom:1px solid rgba(167,139,250,.12)">${t.icon} ${t.name.replace('Creator ','')}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${compRows.map((r,i)=>`
              <tr style="background:${i%2===0?'rgba(167,139,250,.03)':'transparent'}">
                <td style="padding:7px 10px;color:rgba(200,190,230,.7);font-weight:700">${r[0]}</td>
                ${[r[1],r[2],r[3]].map((v,j)=>`<td style="text-align:center;padding:7px 6px;color:${v==='—'?'rgba(167,139,250,.3)':TIERS[j].color};font-weight:800">${v}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const initPrice = curr.base * TIERS.find(t=>t.id===_selectedTier).mult;
    const initTier  = TIERS.find(t=>t.id===_selectedTier);

    overlay.innerHTML = `
      <div class="cp-inner" style="background:linear-gradient(160deg,#0c0520 0%,#07030f 100%);border:1px solid rgba(167,139,250,.25);border-radius:24px;width:100%;max-width:720px;max-height:94vh;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(124,58,237,.35),0 0 140px rgba(124,58,237,.1)">

        <!-- ── HEADER ── -->
        <div style="padding:28px 26px 22px;border-bottom:1px solid rgba(167,139,250,.12);position:relative;flex-shrink:0;background:linear-gradient(160deg,rgba(124,58,237,.2) 0%,rgba(251,191,36,.04) 100%);border-radius:24px 24px 0 0;overflow:hidden">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 0%,rgba(124,58,237,.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 100%,rgba(251,191,36,.06) 0%,transparent 50%);pointer-events:none"></div>
          <button onclick="closeCreatorPassModal()" style="position:absolute;top:14px;right:14px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.18);color:rgba(200,190,230,.6);border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:.9rem;line-height:30px;z-index:1">✕</button>

          <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;position:relative">
            <div style="font-size:2.6rem;animation:cpFloat 3s ease-in-out infinite">👑</div>
            <div>
              <div style="display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.08));border:1px solid rgba(251,191,36,.35);border-radius:99px;padding:3px 12px;font-size:.68rem;font-weight:900;letter-spacing:1px;color:#fbbf24;margin-bottom:6px">
                ✦ EYLOX CREATOR PASS
              </div>
              <div style="font-family:'Fredoka One',cursive;font-size:1.65rem;background:linear-gradient(135deg,#fbbf24,#f0abfc,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1">Become a Real Game Creator</div>
              <div style="font-size:.82rem;color:rgba(200,190,230,.65);font-weight:700;margin-top:4px">Build · Publish · Grow — inside EYLOX</div>
            </div>
          </div>

          <!-- Social proof -->
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <div class="cp-social-proof"><span class="cp-dot-live"></span>2,847 creators active this month</div>
            <div class="cp-social-proof">⭐ 4.9/5 from 1,200+ reviews</div>
            <div class="cp-social-proof">🔥 47 joined in the last hour</div>
          </div>
        </div>

        <!-- ── SCROLLABLE BODY ── -->
        <div class="cp-scroll" style="overflow-y:auto;flex:1;padding:22px 22px 8px">

          <!-- Tier picker -->
          <div style="font-size:.68rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">CHOOSE YOUR LEVEL</div>
          <div style="display:flex;gap:10px;margin-bottom:22px;align-items:flex-end">
            ${tierCards}
          </div>

          <!-- Selected tier features -->
          <div style="font-size:.68rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">WHAT YOU GET</div>
          ${TIERS.map(t => `
            <div id="cp-feat-${t.id}" style="display:${t.id===_selectedTier?'block':'none'}">
              <div style="background:rgba(167,139,250,.06);border:1px solid ${t.color}33;border-radius:14px;padding:16px 18px;margin-bottom:16px">
                ${t.features.map(f=>`<div class="cp-feat-item"><span style="color:${t.color};font-size:.8rem;flex-shrink:0">✦</span>${f}</div>`).join('')}
              </div>
            </div>
          `).join('')}

          <!-- Full feature sections -->
          <div style="font-size:.68rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">ALL CREATOR TOOLS</div>
          ${sectionsHTML}

          <!-- Tier comparison -->
          <div style="font-size:.68rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin:18px 0 10px">TIER COMPARISON</div>
          <div style="background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.1);border-radius:14px;padding:14px;margin-bottom:18px">
            ${compHTML}
          </div>

          <!-- Vision block -->
          <div style="background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(59,130,246,.06));border:1px solid rgba(124,58,237,.22);border-radius:14px;padding:18px;margin-bottom:8px;text-align:center">
            <div style="font-size:1.4rem;margin-bottom:8px">🌍</div>
            <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#e0d4ff;margin-bottom:6px">EYLOX is a platform like no other</div>
            <div style="font-size:.78rem;color:rgba(200,190,230,.65);font-weight:700;line-height:1.65">A game engine 🎮 · An AI builder 🤖 · A social network 🌐<br>The Creator Pass turns you from a player into a <span style="color:#fbbf24;font-weight:900">real game developer</span> — with zero coding needed.</div>
          </div>

        </div>

        <!-- ── CTA ── -->
        <div style="padding:16px 22px 22px;flex-shrink:0;border-top:1px solid rgba(167,139,250,.1)">
          ${isCreator
            ? `<div style="background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.25);border-radius:12px;padding:16px;font-family:'Fredoka One',cursive;font-size:1rem;color:#4ade80;text-align:center">✓ You already have the Creator Pass! (${owned || 'active'})</div>`
            : `<button id="cpBuyBtn" class="cp-buy-btn" onclick="purchaseCreatorPass()"
                style="width:100%;background:linear-gradient(135deg,#2563eb,#60a5fa,#3b82f6,#2563eb);background-size:200% auto;color:#fff;border:none;border-radius:14px;padding:17px;font-family:'Fredoka One',cursive;font-size:1.1rem;cursor:pointer;box-shadow:0 8px 28px rgba(96,165,250,.4);margin-bottom:8px">
                ⚡ Get Creator Pro — ${detectCurrency().symbol}${curr.base * 2} / ${curr.code}
               </button>
               <div style="display:flex;justify-content:space-between;align-items:center">
                 <div id="cpPriceLabel" style="font-size:.7rem;color:rgba(167,139,250,.45);font-weight:700">${curr.symbol}${curr.base*2} ${curr.name} per month</div>
                 <div style="font-size:.7rem;color:rgba(167,139,250,.4);font-weight:700">Simulated · No real charge · Stored locally</div>
               </div>`
          }
        </div>

      </div>
    `;

    overlay.addEventListener('click', e => { if (e.target === overlay) closeCreatorPassModal(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    /* init button state */
    if (!isCreator) updateCTAButton();
  }

  function closeCreatorPassModal() {
    const ov = document.getElementById('cpOverlay');
    if (!ov) return;
    ov.style.animation = 'cpFadeIn .15s ease reverse forwards';
    setTimeout(() => { ov.remove(); document.body.style.overflow = ''; }, 150);
  }

  function selectCreatorTier(id) {
    _selectedTier = id;
    TIERS.forEach(t => {
      const card = document.getElementById('cp-tier-' + t.id);
      const feat = document.getElementById('cp-feat-' + t.id);
      if (!card) return;
      if (t.id === id) {
        card.classList.add('selected');
        card.style.borderColor  = t.color;
        card.style.boxShadow    = '0 0 28px ' + t.glow + ', 0 8px 32px rgba(0,0,0,.4)';
        card.style.transform    = 'translateY(-6px) scale(1.02)';
        if (feat) feat.style.display = 'block';
      } else {
        card.classList.remove('selected');
        card.style.borderColor  = 'rgba(167,139,250,.15)';
        card.style.boxShadow    = 'none';
        card.style.transform    = '';
        if (feat) feat.style.display = 'none';
      }
    });
    updateCTAButton();
  }

  function purchaseCreatorPass() {
    const btn  = document.getElementById('cpBuyBtn');
    const tier = TIERS.find(t => t.id === _selectedTier);
    if (!btn || !tier) return;
    btn.textContent = '⏳ Activating your pass...';
    btn.disabled = true;

    setTimeout(() => {
      localStorage.setItem('eylox_creator_pass', 'true');
      localStorage.setItem('eylox_creator_tier', tier.id);
      localStorage.setItem('eylox_creator_since', new Date().toISOString());

      try {
        const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
        if (u) {
          u.coins = (u.coins || 0) + 500;
          u.hasCreatorPass = true;
          u.creatorTier    = tier.id;
          localStorage.setItem('eylox_user', JSON.stringify(u));
        }
      } catch {}

      closeCreatorPassModal();
      setTimeout(() => showCreatorSuccess(tier), 220);
    }, 2000);
  }

  function showCreatorSuccess(tier) {
    injectStyles();
    const curr  = detectCurrency();
    const price = curr.base * tier.mult;
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(3,1,8,.92);z-index:99991;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px)';
    ov.innerHTML = `
      <div class="cp-inner" style="background:linear-gradient(160deg,#0c0520,#07030f);border:2px solid ${tier.color}55;border-radius:24px;padding:38px 30px;text-align:center;max-width:440px;width:100%;box-shadow:0 32px 80px ${tier.glow},0 0 120px ${tier.glow.replace('.45','.12')}">
        <div style="font-size:3.2rem;margin-bottom:10px;animation:cpFloat 2s ease-in-out infinite">${tier.icon}</div>
        <div style="display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(245,158,11,.06));border:1px solid rgba(251,191,36,.3);border-radius:99px;padding:4px 14px;font-size:.68rem;font-weight:900;letter-spacing:1px;color:#fbbf24;margin-bottom:14px">CREATOR PASS ACTIVATED</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.7rem;color:${tier.color};margin-bottom:8px">You're now a ${tier.name}!</div>
        <div style="font-size:.86rem;color:rgba(200,190,230,.7);font-weight:700;margin-bottom:18px;line-height:1.65">
          Welcome to the creator world! 🎮<br>
          You received <span style="color:#fbbf24;font-weight:900">+500 bonus Coins</span> to celebrate.<br>
          Your creator tools are now active.
        </div>
        <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.18);border-radius:10px;padding:10px 14px;margin-bottom:20px;font-size:.72rem;color:rgba(251,191,36,.65);font-weight:800">
          Simulated purchase · ${curr.symbol}${price} ${curr.code} · No real charge
        </div>
        <button onclick="this.closest('div[style*=fixed]').remove();document.body.style.overflow='';location.reload()" style="background:linear-gradient(135deg,${tier.id==='legend'?'#d97706,#fbbf24':tier.id==='pro'?'#2563eb,#60a5fa':'#7c3aed,#a78bfa'});color:${tier.id==='legend'?'#000':'#fff'};border:none;border-radius:12px;padding:14px 36px;font-family:'Fredoka One',cursive;font-size:1rem;cursor:pointer;box-shadow:0 6px 22px ${tier.glow}">🎮 Start Creating!</button>
      </div>
    `;
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
  }

  /* ── Global API ── */
  window.openCreatorPassModal   = createModal;
  window.closeCreatorPassModal  = closeCreatorPassModal;
  window.selectCreatorTier      = selectCreatorTier;
  window.purchaseCreatorPass    = purchaseCreatorPass;

  /* ── Auto-attach ── */
  document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
      const el = e.target.closest('[data-creator-pass],[data-open-creator-pass],.open-creator-pass');
      if (el) { e.preventDefault(); createModal(); }
    });
  });

})();
