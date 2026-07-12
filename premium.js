/* premium.js — EYLOX Subscription System v5.0 — Play Store Style Checkout */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     TIERS
  ═══════════════════════════════════════════════════ */
  const TIERS = [
    {
      id: 'premium', name: 'EYLOX Premium', icon: '⭐', priceEGP: 299,
      color: '#fbbf24', colorDim: 'rgba(251,191,36,.12)', colorGlow: 'rgba(251,191,36,.4)',
      gradient: 'linear-gradient(135deg,#92400e,#d97706,#fbbf24)',
      btnGrad: 'linear-gradient(135deg,#d97706,#fbbf24)',
      tagline: 'The ultimate gaming experience', badge: null,
      highlights: [
        '2× Coin & Win earnings','Zero ads — everywhere','Exclusive premium avatars',
        'Premium profile border & badge','Unlimited cloud game saves',
        'Priority matchmaking','Monthly 1,000 bonus Coins','All premium game rooms',
        'Early access to beta features','Premium seasonal rewards',
      ],
    },
    {
      id: 'creator', name: 'Creator Pass', icon: '🚀', priceEGP: 999,
      color: '#60a5fa', colorDim: 'rgba(96,165,250,.12)', colorGlow: 'rgba(96,165,250,.4)',
      gradient: 'linear-gradient(135deg,#1e3a8a,#1d4ed8,#60a5fa)',
      btnGrad: 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
      tagline: 'Build and publish real games', badge: 'POPULAR',
      highlights: [
        'Everything in Premium ✅','50 AI generations/day','Instant publish to Discover',
        'Creator badge on profile','Auto thumbnails & tags','Game analytics dashboard',
        'Priority AI generation queue','2× creator earnings','Creator-only tournaments',
        'Monthly 2,000 bonus Coins',
      ],
    },
    {
      id: 'pro', name: 'Creator Pro', icon: '💎', priceEGP: 2499,
      color: '#a78bfa', colorDim: 'rgba(167,139,250,.12)', colorGlow: 'rgba(167,139,250,.4)',
      gradient: 'linear-gradient(135deg,#3b0764,#7c3aed,#a78bfa)',
      btnGrad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
      tagline: 'Professional game development', badge: 'BEST VALUE',
      highlights: [
        'Everything in Creator ✅','Unlimited AI generations','Verified Creator badge',
        'Pro terrain & building editor','Sound & music editor','Custom shaders & lighting',
        'Revenue sharing program','3× creator earnings','Front-page promotion guaranteed',
        'Monthly 3,500 bonus Coins',
      ],
    },
    {
      id: 'ultimate', name: 'Ultimate Creator', icon: '🌌', priceEGP: 4999,
      color: '#f0abfc', colorDim: 'rgba(240,171,252,.12)', colorGlow: 'rgba(240,171,252,.4)',
      gradient: 'linear-gradient(135deg,#4a044e,#a21caf,#e879f9)',
      btnGrad: 'linear-gradient(135deg,#a21caf,#e879f9)',
      tagline: 'The pinnacle of creation', badge: 'ULTIMATE',
      highlights: [
        'Everything in Pro ✅','Instant multiplayer creation','AI-generated animations',
        'AI voice NPCs','Dedicated game servers','Creator Teams — 5 collaborators',
        'Real monetization tools','White-label exports','Gift subscriptions',
        'Monthly 5,000 Coins + crate',
      ],
    },
  ];

  const CURRENCIES = {
    EGP: { sym: 'EGP ', name: 'Egyptian Pounds', rate: 1,      flag: '🇪🇬' },
    USD: { sym: '$',   name: 'US Dollars',        rate: 0.0205, flag: '🇺🇸' },
    EUR: { sym: '€',   name: 'Euros',             rate: 0.0188, flag: '🇪🇺' },
    GBP: { sym: '£',   name: 'British Pounds',    rate: 0.0160, flag: '🇬🇧' },
    SAR: { sym: 'SAR ', name: 'Saudi Riyals',     rate: 0.0769, flag: '🇸🇦' },
    AED: { sym: 'AED ', name: 'UAE Dirhams',      rate: 0.0753, flag: '🇦🇪' },
  };

  const TIER_BENEFITS = {
    premium:  { coinMultiplier:2, bonusCoins:1000, welcomeCoins:500,  adFree:true, premiumBadge:true,  unlocked:['ad_free','2x_coins','premium_badge','premium_frames','daily_bonus','vip_matchmaking'] },
    creator:  { coinMultiplier:2, bonusCoins:2000, welcomeCoins:800,  adFree:true, premiumBadge:true,  creatorBadge:true,  unlocked:['ad_free','2x_coins','creator_badge','unlimited_publish','ai_builder','analytics'] },
    pro:      { coinMultiplier:3, bonusCoins:3500, welcomeCoins:1200, adFree:true, premiumBadge:true,  creatorBadge:true,  verifiedBadge:true, unlocked:['ad_free','3x_coins','verified_badge','featured_placement','monetization','revenue_share'] },
    ultimate: { coinMultiplier:5, bonusCoins:5000, welcomeCoins:2000, adFree:true, ultimateBadge:true, unlocked:['ad_free','5x_coins','ultimate_badge','white_label','revenue_sharing','dedicated_support'] },
  };

  const BENEFIT_LABELS = {
    ad_free:           { icon:'🚫', name:'Ad-Free' },
    '2x_coins':        { icon:'💰', name:'2× Coins' },
    '3x_coins':        { icon:'💰', name:'3× Coins' },
    '5x_coins':        { icon:'💰', name:'5× Coins' },
    premium_badge:     { icon:'⭐', name:'Premium Badge' },
    premium_frames:    { icon:'🎨', name:'Premium Frames' },
    daily_bonus:       { icon:'🎁', name:'Daily Rewards' },
    vip_matchmaking:   { icon:'⚡', name:'VIP Matchmaking' },
    creator_badge:     { icon:'🚀', name:'Creator Badge' },
    unlimited_publish: { icon:'🎮', name:'Unlimited Publish' },
    ai_builder:        { icon:'🤖', name:'AI Game Builder' },
    analytics:         { icon:'📊', name:'Analytics' },
    verified_badge:    { icon:'✅', name:'Verified Badge' },
    featured_placement:{ icon:'📌', name:'Featured Placement' },
    monetization:      { icon:'💵', name:'Monetization' },
    revenue_share:     { icon:'📈', name:'Revenue Sharing' },
    ultimate_badge:    { icon:'🌌', name:'Ultimate Badge' },
    white_label:       { icon:'🏷️', name:'White-Label' },
    revenue_sharing:   { icon:'💵', name:'Revenue Sharing' },
    dedicated_support: { icon:'🎧', name:'Dedicated Support' },
  };

  /* ═══════════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════════ */
  function detectCurrency() {
    const tz = Intl?.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone || '' : '';
    const lg = navigator.language || '';
    if (tz.includes('Cairo') || lg.startsWith('ar-EG')) return 'EGP';
    if (tz.includes('Riyadh') || tz.includes('Kuwait') || lg.startsWith('ar-SA')) return 'SAR';
    if (tz.includes('Dubai') || tz.includes('Abu_Dhabi') || lg.startsWith('ar-AE')) return 'AED';
    if (lg.startsWith('en-GB')) return 'GBP';
    if (['de','fr','it','nl','es'].some(l => lg.startsWith(l))) return 'EUR';
    if (lg.startsWith('en-US')) return 'USD';
    return 'EGP';
  }

  function fmtAmt(egp, code) {
    const c = CURRENCIES[code] || CURRENCIES.EGP;
    const raw = egp * c.rate;
    const n = raw < 10 ? +raw.toFixed(2) : Math.round(raw);
    return c.sym + n.toLocaleString();
  }

  function getPrice(tier) {
    const monthly = tier.priceEGP;
    const yearly  = Math.round(monthly * 10);
    const egp     = _cycle === 'yearly' ? yearly : monthly;
    const perMo   = _cycle === 'yearly' ? fmtAmt(Math.round(yearly / 12), _currency) : null;
    return { egp, display: fmtAmt(egp, _currency), perMo };
  }

  function isGuest() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      return !u || !u.username || u.username === 'Guest' || !!u.isGuest;
    } catch { return true; }
  }

  /* ═══════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════ */
  let _sel      = 'creator';
  let _cycle    = 'monthly';
  let _currency = detectCurrency();
  let _method   = 'card';

  // Real payment state
  let _stripeInstance = null;
  let _stripeElements = null;
  let _currentIntentId = null;

  /* ═══════════════════════════════════════════════════
     STYLES
  ═══════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('pmStylesV5')) return;
    const s = document.createElement('style');
    s.id = 'pmStylesV5';
    s.textContent = `
      @keyframes pmFadeIn  { from{opacity:0}                            to{opacity:1}               }
      @keyframes pmSlideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none}}
      @keyframes pmSlideUpSheet { from{transform:translateY(100%)} to{transform:translateY(0)}    }
      @keyframes pmSpin    { to{transform:rotate(360deg)}                                           }
      @keyframes pmPop     { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
      @keyframes pmGlow    { 0%,100%{opacity:.5} 50%{opacity:1}                                    }
      @keyframes pmFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)}      }
      @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
      @keyframes pmCheckDraw { 0%{stroke-dashoffset:50} 100%{stroke-dashoffset:0} }
      @keyframes pmXDraw   { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
      @keyframes pmShake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
      @keyframes pmGreenPulse { 0%,100%{box-shadow:0 0 30px rgba(74,222,128,.3)} 50%{box-shadow:0 0 60px rgba(74,222,128,.7)} }
      @keyframes pmRedPulse { 0%,100%{box-shadow:0 0 30px rgba(248,113,113,.3)} 50%{box-shadow:0 0 60px rgba(248,113,113,.6)} }

      /* ── Overlay ── */
      #pmOverlay {
        animation:pmFadeIn .2s ease; position:fixed; inset:0; z-index:99990;
        background:rgba(0,0,0,.96); backdrop-filter:blur(10px);
        display:flex; align-items:center; justify-content:center; padding:12px;
      }
      #pmModal {
        background:#000; border:1px solid rgba(167,139,250,.18); border-radius:24px;
        width:100%; max-width:840px; max-height:96vh; display:flex; flex-direction:column;
        box-shadow:0 0 0 1px rgba(167,139,250,.06), 0 40px 100px rgba(0,0,0,.98);
        animation:pmSlideUp .3s cubic-bezier(.34,1.56,.64,1); overflow:hidden;
      }

      /* ── Hero ── */
      .pm-hero {
        padding:22px 24px 16px; border-bottom:1px solid rgba(167,139,250,.08);
        flex-shrink:0; position:relative;
      }
      .pm-hero-pill {
        display:inline-flex; align-items:center; gap:6px;
        background:rgba(167,139,250,.08); border:1px solid rgba(167,139,250,.2);
        border-radius:99px; padding:4px 14px; font-size:.67rem; font-weight:900;
        letter-spacing:1px; color:#a78bfa; margin-bottom:10px;
      }
      .pm-live-dot { width:6px; height:6px; border-radius:50%; background:#4ade80;
        box-shadow:0 0 5px #4ade80; animation:pmGlow 2s ease-in-out infinite; }
      .pm-hero-title {
        font-family:'Fredoka One',cursive; font-size:1.75rem; color:#fff; margin-bottom:4px;
      }
      .pm-hero-sub { font-size:.8rem; color:rgba(200,190,230,.55); font-weight:700; }

      /* ── Controls ── */
      .pm-controls {
        display:flex; align-items:center; gap:8px; flex-wrap:wrap;
        padding:10px 20px; border-bottom:1px solid rgba(167,139,250,.06); flex-shrink:0;
      }
      .pm-billing-toggle {
        display:flex; background:rgba(255,255,255,.04); border:1px solid rgba(167,139,250,.12);
        border-radius:99px; padding:3px; gap:0;
      }
      .pm-bt-btn {
        padding:5px 13px; border:none; border-radius:99px; cursor:pointer;
        font-family:Nunito,sans-serif; font-size:.72rem; font-weight:900;
        transition:all .15s; background:none; color:rgba(200,190,230,.45);
      }
      .pm-bt-btn.active { background:rgba(167,139,250,.18); color:#e0d4ff; }
      .pm-save-pill {
        background:linear-gradient(135deg,#4ade80,#22c55e); color:#000;
        border-radius:99px; padding:1px 7px; font-size:.58rem; font-weight:900; margin-left:4px;
      }
      .pm-curr-sel {
        background:rgba(255,255,255,.04); border:1px solid rgba(167,139,250,.12);
        border-radius:99px; padding:5px 13px; color:#e0d4ff;
        font-family:Nunito,sans-serif; font-size:.74rem; font-weight:800; cursor:pointer; outline:none;
      }
      .pm-curr-sel option { background:#0a0014; }

      /* ── Tier cards ── */
      .pm-tiers {
        display:grid; grid-template-columns:repeat(4,1fr); gap:9px;
        padding:14px 20px 0; flex-shrink:0;
      }
      @media(max-width:640px){ .pm-tiers { grid-template-columns:repeat(2,1fr); } }
      .pm-tier {
        border-radius:14px; padding:13px 11px; cursor:pointer;
        border:1.5px solid rgba(167,139,250,.1); background:rgba(255,255,255,.02);
        transition:all .2s cubic-bezier(.34,1.56,.64,1); position:relative; overflow:hidden;
      }
      .pm-tier:hover { background:rgba(167,139,250,.06); transform:translateY(-2px); }
      .pm-tier.pm-sel { transform:translateY(-4px) scale(1.02); }
      .pm-tier-bar { position:absolute; top:0; left:0; right:0; height:3px; border-radius:99px; }
      .pm-tier-badge-wrap { position:absolute; top:6px; right:6px; }
      .pm-tier-badge { font-size:.5rem; font-weight:900; letter-spacing:.5px; padding:2px 6px; border-radius:99px; }
      .pm-tier-icon  { font-size:1.5rem; display:block; margin-bottom:5px; }
      .pm-tier-name  { font-family:'Fredoka One',cursive; font-size:.82rem; line-height:1.1; margin-bottom:1px; }
      .pm-tier-tag   { font-size:.58rem; font-weight:700; color:rgba(200,190,230,.45); margin-bottom:7px; }
      .pm-tier-price { font-family:'Fredoka One',cursive; font-size:1.25rem; }
      .pm-tier-period{ font-size:.58rem; font-weight:700; color:rgba(200,190,230,.4); }
      .pm-tier-permon{ font-size:.56rem; font-weight:700; color:rgba(74,222,128,.65); margin-top:1px; }

      /* ── Body ── */
      .pm-body { flex:1; overflow-y:auto; min-height:0; }
      .pm-body::-webkit-scrollbar { width:4px; }
      .pm-body::-webkit-scrollbar-thumb { background:rgba(167,139,250,.2); border-radius:99px; }

      .pm-feat-sec { padding:14px 20px; }
      .pm-feat-label { font-size:.62rem; font-weight:900; color:rgba(167,139,250,.4); letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; }
      .pm-feat-grid { display:grid; grid-template-columns:1fr 1fr; gap:3px 10px; }
      @media(max-width:480px){ .pm-feat-grid { grid-template-columns:1fr; } }
      .pm-feat-item { display:flex; align-items:center; gap:6px; padding:3px 0; font-size:.76rem; font-weight:700; color:rgba(210,200,240,.8); }
      .pm-feat-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

      /* ── CTA footer ── */
      .pm-cta { padding:11px 20px 18px; border-top:1px solid rgba(167,139,250,.07); flex-shrink:0; }
      .pm-sub-btn {
        width:100%; padding:15px; border:none; border-radius:13px; cursor:pointer;
        font-family:'Fredoka One',cursive; font-size:1rem; color:#fff;
        position:relative; overflow:hidden; transition:transform .2s,filter .2s;
      }
      .pm-sub-btn:hover { transform:translateY(-2px); filter:brightness(1.1); }
      .pm-sub-btn:disabled { opacity:.5; cursor:not-allowed; }
      .pm-trust { display:flex; justify-content:center; gap:12px; margin-top:8px; flex-wrap:wrap; }
      .pm-trust span { font-size:.63rem; font-weight:800; color:rgba(167,139,250,.35); }

      /* ══════════════════════════════════
         PAYMENT SHEET (Play Store style)
      ══════════════════════════════════ */
      #pmSheet {
        position:fixed; inset:0; z-index:99991;
        background:rgba(0,0,0,.92); backdrop-filter:blur(14px);
        display:flex; align-items:flex-end; justify-content:center;
        animation:pmFadeIn .18s ease;
      }
      @media(min-width:600px){
        #pmSheet { align-items:center; }
        .pm-sheet-card { border-radius:24px !important; max-height:92vh !important; }
      }
      .pm-sheet-card {
        background:#050008; border:1px solid rgba(167,139,250,.18);
        border-radius:24px 24px 0 0; padding:0; width:100%; max-width:480px;
        max-height:88vh; overflow-y:auto; overflow-x:hidden;
        animation:pmSlideUpSheet .3s cubic-bezier(.25,.46,.45,.94);
        box-shadow:0 -20px 80px rgba(0,0,0,.9), 0 0 0 1px rgba(167,139,250,.06);
      }
      .pm-sheet-card::-webkit-scrollbar { display:none; }

      /* Sheet handle */
      .pm-sheet-handle {
        display:flex; justify-content:center; padding:10px 0 0;
      }
      .pm-sheet-handle-bar {
        width:36px; height:4px; border-radius:99px; background:rgba(167,139,250,.2);
      }

      /* Sheet header */
      .pm-sheet-header {
        display:flex; align-items:center; gap:12px;
        padding:14px 20px 12px; border-bottom:1px solid rgba(167,139,250,.07);
      }
      .pm-sheet-icon {
        width:46px; height:46px; border-radius:14px; display:flex; align-items:center;
        justify-content:center; font-size:1.6rem; flex-shrink:0;
      }
      .pm-sheet-plan-name { font-family:'Fredoka One',cursive; font-size:1.05rem; color:#fff; }
      .pm-sheet-plan-price { font-size:.8rem; color:rgba(200,190,230,.55); font-weight:700; margin-top:1px; }
      .pm-sheet-close {
        margin-left:auto; width:28px; height:28px; border-radius:50%;
        background:rgba(255,255,255,.06); border:none; color:rgba(200,190,230,.5);
        cursor:pointer; font-size:.82rem; display:flex; align-items:center; justify-content:center;
        flex-shrink:0; transition:background .15s;
      }
      .pm-sheet-close:hover { background:rgba(255,255,255,.12); }

      /* Renewal info */
      .pm-sheet-renew {
        display:flex; align-items:center; gap:8px;
        padding:9px 20px; background:rgba(255,255,255,.02);
        border-bottom:1px solid rgba(167,139,250,.06); font-size:.72rem; font-weight:800;
        color:rgba(200,190,230,.5);
      }

      /* Method selector */
      .pm-methods-grid {
        display:grid; grid-template-columns:repeat(3,1fr); gap:6px;
        padding:14px 18px 10px;
      }
      .pm-meth-btn {
        padding:9px 6px 8px; border-radius:12px; cursor:pointer;
        border:1.5px solid rgba(167,139,250,.1); background:rgba(255,255,255,.03);
        display:flex; flex-direction:column; align-items:center; gap:5px;
        transition:all .16s; font-family:Nunito,sans-serif;
      }
      .pm-meth-btn:hover { background:rgba(167,139,250,.08); border-color:rgba(167,139,250,.28); }
      .pm-meth-btn.pm-msel {
        background:rgba(167,139,250,.12); border-color:rgba(167,139,250,.55);
        box-shadow:0 0 12px rgba(167,139,250,.15);
      }
      .pm-meth-ico { font-size:1.4rem; line-height:1; }
      .pm-meth-lbl { font-size:.57rem; font-weight:900; color:rgba(200,190,230,.55); letter-spacing:.3px; }
      .pm-meth-btn.pm-msel .pm-meth-lbl { color:#c4b5fd; }

      /* Form area */
      .pm-form-area { padding:4px 18px 14px; }
      .pm-field-label { font-size:.62rem; font-weight:900; color:rgba(167,139,250,.45); letter-spacing:.7px; text-transform:uppercase; margin-bottom:5px; }
      .pm-field-wrap { margin-bottom:11px; }
      .pm-field-wrap-row { display:flex; gap:8px; margin-bottom:11px; }
      .pm-input {
        width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(167,139,250,.15);
        border-radius:11px; padding:11px 13px; color:#e0d4ff;
        font-family:Nunito,sans-serif; font-size:.88rem; font-weight:700;
        outline:none; transition:border-color .18s,box-shadow .18s; box-sizing:border-box;
      }
      .pm-input:focus { border-color:rgba(167,139,250,.5); box-shadow:0 0 0 3px rgba(167,139,250,.08); }
      .pm-input::placeholder { color:rgba(167,139,250,.25); }
      .pm-input.pm-err { border-color:rgba(248,113,113,.5); box-shadow:0 0 0 3px rgba(248,113,113,.08); }
      .pm-input-wrap { position:relative; }
      .pm-card-brand { position:absolute; right:11px; top:50%; transform:translateY(-50%); font-size:.68rem; font-weight:900; color:rgba(167,139,250,.5); pointer-events:none; }

      /* Alt method box */
      .pm-alt-box {
        text-align:center; padding:22px 16px;
        background:rgba(255,255,255,.03); border:1.5px solid rgba(167,139,250,.12);
        border-radius:14px; margin:4px 0 6px;
      }

      /* Sheet footer */
      .pm-sheet-footer { padding:0 18px 20px; }
      .pm-sheet-submit {
        width:100%; padding:15px; border:none; border-radius:13px; cursor:pointer;
        font-family:'Fredoka One',cursive; font-size:1rem; color:#fff;
        display:flex; align-items:center; justify-content:center; gap:8px;
        transition:transform .2s,filter .2s,box-shadow .2s;
      }
      .pm-sheet-submit:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
      .pm-sheet-submit:disabled { opacity:.55; cursor:not-allowed; }
      .pm-sheet-back {
        display:block; width:100%; text-align:center; margin-top:10px;
        background:none; border:none; color:rgba(167,139,250,.4); font-size:.78rem;
        font-weight:800; cursor:pointer; transition:color .15s;
      }
      .pm-sheet-back:hover { color:#a78bfa; }

      /* Security row */
      .pm-sec-row {
        display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:10px 0 14px;
      }
      .pm-sec-chip {
        display:flex; align-items:center; gap:4px;
        background:rgba(74,222,128,.05); border:1px solid rgba(74,222,128,.18);
        border-radius:7px; padding:4px 10px;
        font-size:.6rem; font-weight:900; color:rgba(74,222,128,.65);
      }

      /* Error msg */
      .pm-field-err { font-size:.68rem; font-weight:800; color:#f87171; margin-top:4px; display:none; }
      .pm-field-err.show { display:block; }

      /* ══════════════════════════════════
         PROCESSING OVERLAY
      ══════════════════════════════════ */
      #pmProcessing {
        position:fixed; inset:0; z-index:99992;
        background:rgba(0,0,0,.97); backdrop-filter:blur(14px);
        display:flex; align-items:center; justify-content:center; padding:20px;
        animation:pmFadeIn .18s ease;
      }
      .pm-proc-card {
        background:#05000c; border:1px solid rgba(167,139,250,.15);
        border-radius:24px; padding:40px 32px; max-width:360px; width:100%;
        text-align:center;
        box-shadow:0 40px 100px rgba(0,0,0,.97);
        animation:pmSlideUp .28s cubic-bezier(.34,1.56,.64,1);
      }
      .pm-spinner {
        width:60px; height:60px; border-radius:50%; margin:0 auto 20px;
        border:3px solid rgba(167,139,250,.1); border-top:3px solid #a78bfa;
        animation:pmSpin .8s linear infinite;
      }
      .pm-proc-stage {
        font-family:'Fredoka One',cursive; font-size:1.05rem; color:#e0d4ff; margin-bottom:6px;
        min-height:1.3em;
      }
      .pm-proc-sub { font-size:.75rem; color:rgba(200,190,230,.45); font-weight:700; }
      .pm-proc-steps {
        display:flex; justify-content:center; gap:8px; margin-top:20px;
      }
      .pm-proc-dot {
        width:8px; height:8px; border-radius:50%; background:rgba(167,139,250,.2);
        transition:background .3s,transform .3s;
      }
      .pm-proc-dot.done { background:#a78bfa; transform:scale(1.2); }
      .pm-proc-dot.active { background:#a78bfa; animation:pmGlow .8s ease-in-out infinite; }

      /* ══════════════════════════════════
         SUCCESS
      ══════════════════════════════════ */
      #pmSuccess {
        position:fixed; inset:0; z-index:99993;
        background:rgba(0,0,0,.97); backdrop-filter:blur(14px);
        display:flex; align-items:center; justify-content:center; padding:16px;
        animation:pmFadeIn .18s ease;
      }
      .pm-succ-card {
        background:#030010; border:1.5px solid rgba(74,222,128,.3);
        border-radius:24px; padding:32px 24px; max-width:420px; width:100%;
        text-align:center; overflow-y:auto; max-height:92vh;
        animation:pmSlideUp .32s cubic-bezier(.34,1.56,.64,1);
        animation:pmGreenPulse 2s ease-in-out infinite, pmSlideUp .32s cubic-bezier(.34,1.56,.64,1) both;
      }
      .pm-succ-circle {
        width:72px; height:72px; border-radius:50%; background:rgba(74,222,128,.12);
        border:2px solid rgba(74,222,128,.4); display:flex; align-items:center;
        justify-content:center; margin:0 auto 16px; font-size:2rem;
        animation:pmPop .5s cubic-bezier(.34,1.56,.64,1);
      }
      .pm-receipt {
        background:rgba(255,255,255,.03); border:1px solid rgba(167,139,250,.1);
        border-radius:12px; padding:12px 14px; margin:14px 0; text-align:left;
      }
      .pm-receipt-row {
        display:flex; justify-content:space-between; align-items:center;
        padding:4px 0; font-size:.73rem; font-weight:800;
        border-bottom:1px solid rgba(167,139,250,.05);
      }
      .pm-receipt-row:last-child { border-bottom:none; }
      .pm-receipt-row .label { color:rgba(200,190,230,.45); }
      .pm-receipt-row .val   { color:#e0d4ff; }

      /* ══════════════════════════════════
         DECLINED
      ══════════════════════════════════ */
      #pmDeclined {
        position:fixed; inset:0; z-index:99993;
        background:rgba(0,0,0,.97); backdrop-filter:blur(14px);
        display:flex; align-items:center; justify-content:center; padding:16px;
        animation:pmFadeIn .18s ease;
      }
      .pm-decl-card {
        background:#080004; border:1.5px solid rgba(248,113,113,.3);
        border-radius:24px; padding:32px 24px; max-width:400px; width:100%;
        text-align:center;
        animation:pmSlideUp .32s cubic-bezier(.34,1.56,.64,1) both, pmRedPulse 2s ease-in-out .5s infinite;
      }
      .pm-decl-circle {
        width:72px; height:72px; border-radius:50%; background:rgba(248,113,113,.1);
        border:2px solid rgba(248,113,113,.4); display:flex; align-items:center;
        justify-content:center; margin:0 auto 16px; font-size:2rem;
        animation:pmPop .4s cubic-bezier(.34,1.56,.64,1), pmShake .5s ease .45s;
      }
      .pm-decl-reason {
        background:rgba(248,113,113,.06); border:1px solid rgba(248,113,113,.2);
        border-radius:10px; padding:10px 14px; margin:14px 0;
        font-size:.78rem; font-weight:800; color:rgba(248,113,113,.8); line-height:1.5;
      }
      .pm-decl-btn-row { display:flex; gap:9px; margin-top:16px; }
      .pm-decl-retry {
        flex:1; padding:13px; border:none; border-radius:12px;
        background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff;
        font-family:'Fredoka One',cursive; font-size:.9rem; cursor:pointer;
        transition:transform .15s,filter .15s;
      }
      .pm-decl-retry:hover { transform:translateY(-2px); filter:brightness(1.1); }
      .pm-decl-change {
        flex:1; padding:13px; border:1px solid rgba(167,139,250,.22); border-radius:12px;
        background:rgba(167,139,250,.07); color:#a78bfa;
        font-family:'Fredoka One',cursive; font-size:.9rem; cursor:pointer;
        transition:background .15s;
      }
      .pm-decl-change:hover { background:rgba(167,139,250,.15); }

      /* ── Guest block ── */
      #pmGuestBlock {
        position:fixed; inset:0; z-index:99991;
        background:rgba(0,0,0,.97); backdrop-filter:blur(12px);
        display:flex; align-items:center; justify-content:center; padding:20px;
        animation:pmFadeIn .18s ease;
      }
      .pm-guest-card {
        background:#05000c; border:1px solid rgba(167,139,250,.2);
        border-radius:24px; padding:36px 26px; max-width:360px; width:100%;
        text-align:center; animation:pmSlideUp .3s cubic-bezier(.34,1.56,.64,1);
      }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════
     TIER SELECTOR MODAL
  ═══════════════════════════════════════════════════ */
  function buildModal() {
    if (document.getElementById('pmOverlay')) return;
    injectStyles();
    _currency = detectCurrency();
    const owned = localStorage.getItem('eylox_subscription_tier');

    const ov = document.createElement('div');
    ov.id = 'pmOverlay';
    ov.innerHTML = `
      <div id="pmModal">
        <div class="pm-hero">
          <button onclick="closePremiumModal()" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.06);border:none;color:rgba(200,190,230,.5);border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:.82rem;z-index:2;display:flex;align-items:center;justify-content:center">✕</button>
          <div class="pm-hero-pill"><span class="pm-live-dot"></span> EYLOX SUBSCRIPTIONS</div>
          <div class="pm-hero-title">Choose Your Plan</div>
          <div class="pm-hero-sub">Upgrade your gaming experience. Cancel anytime.</div>
        </div>

        <div class="pm-controls">
          <div class="pm-billing-toggle">
            <button class="pm-bt-btn${_cycle==='monthly'?' active':''}" onclick="setPremCycle('monthly')">Monthly</button>
            <button class="pm-bt-btn${_cycle==='yearly'?' active':''}" onclick="setPremCycle('yearly')">Yearly<span class="pm-save-pill">−17%</span></button>
          </div>
          <select class="pm-curr-sel" onchange="setPremCurrency(this.value)">
            ${Object.entries(CURRENCIES).map(([k,v])=>`<option value="${k}"${k===_currency?' selected':''}>${v.flag} ${k}</option>`).join('')}
          </select>
        </div>

        <div class="pm-tiers" id="pmTiersGrid">${_buildTierCards(owned)}</div>

        <div class="pm-body">
          <div class="pm-feat-sec">
            <div class="pm-feat-label" id="pmFeatLabel"></div>
            <div class="pm-feat-grid" id="pmFeatGrid"></div>
          </div>
        </div>

        <div class="pm-cta" id="pmCta">${_buildCta(owned)}</div>
      </div>`;

    ov.addEventListener('click', e => { if (e.target === ov) closePremiumModal(); });
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    _refreshFeats();
  }

  function _buildTierCards(owned) {
    return TIERS.map(t => {
      const p = getPrice(t);
      const sel = _sel === t.id;
      return `
        <div class="pm-tier${sel?' pm-sel':''}" id="pmTier-${t.id}" onclick="selectPremTier('${t.id}')"
          style="${sel?`border-color:${t.color}66;box-shadow:0 0 24px ${t.colorGlow};background:${t.colorDim}`:''}">
          <div class="pm-tier-bar" style="background:${t.gradient};opacity:${sel?1:.3}"></div>
          ${t.badge?`<div class="pm-tier-badge-wrap"><div class="pm-tier-badge" style="background:${t.colorDim};border:1px solid ${t.color}55;color:${t.color}">${t.badge}</div></div>`:''}
          <span class="pm-tier-icon">${t.icon}</span>
          <div class="pm-tier-name" style="color:${t.color}">${t.name}</div>
          <div class="pm-tier-tag">${t.tagline}</div>
          <div class="pm-tier-price" style="color:${t.color}">${p.display}</div>
          <div class="pm-tier-period">${_cycle==='yearly'?'/year':'/month'}</div>
          ${_cycle==='yearly'?`<div class="pm-tier-permon">≈${p.perMo}/mo</div>`:''}
          ${owned===t.id?`<div style="margin-top:6px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);color:#4ade80;border-radius:6px;padding:2px 6px;font-size:.6rem;font-weight:900">✓ ACTIVE</div>`:''}
        </div>`;
    }).join('');
  }

  function _buildCta(owned) {
    if (owned) {
      const t = TIERS.find(x => x.id === owned);
      return `<div style="text-align:center;padding:12px;background:rgba(74,222,128,.06);border:1px solid rgba(74,222,128,.2);border-radius:12px;color:#4ade80;font-family:'Fredoka One',cursive;font-size:.92rem">✓ Subscribed to ${t?.name || owned}</div>`;
    }
    const tier = TIERS.find(t => t.id === _sel) || TIERS[0];
    const p = getPrice(tier);
    return `
      <button class="pm-sub-btn" onclick="openPremPayment()"
        style="background:${tier.btnGrad};box-shadow:0 6px 24px ${tier.colorGlow}">
        Subscribe — ${p.display} / ${_cycle==='yearly'?'year':'month'}
      </button>
      <div class="pm-trust">
        <span>🔒 256-bit SSL</span>
        <span>🛡️ PCI DSS</span>
        <span>↩️ Cancel anytime</span>
        <span>⚡ Instant access</span>
      </div>`;
  }

  function _refreshFeats() {
    const tier = TIERS.find(t => t.id === _sel) || TIERS[0];
    const lbl = document.getElementById('pmFeatLabel');
    const grid = document.getElementById('pmFeatGrid');
    if (lbl) lbl.textContent = `INCLUDED WITH ${tier.name.toUpperCase()}`;
    if (grid) grid.innerHTML = tier.highlights.map(h => `
      <div class="pm-feat-item">
        <div class="pm-feat-dot" style="background:${tier.color}"></div>${h}
      </div>`).join('');
  }

  function selectTier(id) {
    _sel = id;
    const owned = localStorage.getItem('eylox_subscription_tier');
    const grid = document.getElementById('pmTiersGrid');
    if (grid) { grid.innerHTML = _buildTierCards(owned); _rewireTiers(); }
    const cta = document.getElementById('pmCta');
    if (cta) cta.innerHTML = _buildCta(owned);
    _refreshFeats();
  }

  function _rewireTiers() {
    TIERS.forEach(t => {
      const el = document.getElementById('pmTier-' + t.id);
      if (el) el.onclick = () => selectPremTier(t.id);
    });
  }

  function setCycle(c) {
    _cycle = c;
    document.querySelectorAll('.pm-bt-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.trim().toLowerCase().startsWith(c));
    });
    const owned = localStorage.getItem('eylox_subscription_tier');
    const grid = document.getElementById('pmTiersGrid');
    if (grid) { grid.innerHTML = _buildTierCards(owned); _rewireTiers(); }
    const cta = document.getElementById('pmCta');
    if (cta) cta.innerHTML = _buildCta(owned);
  }

  function setCurrency(code) {
    _currency = code;
    const owned = localStorage.getItem('eylox_subscription_tier');
    const grid = document.getElementById('pmTiersGrid');
    if (grid) { grid.innerHTML = _buildTierCards(owned); _rewireTiers(); }
    const cta = document.getElementById('pmCta');
    if (cta) cta.innerHTML = _buildCta(owned);
  }

  /* ═══════════════════════════════════════════════════
     PAYMENT SHEET (Play Store style)
  ═══════════════════════════════════════════════════ */
  function openPayment() {
    if (isGuest()) { _showGuestBlock(); return; }
    const tier = TIERS.find(t => t.id === _sel) || TIERS[0];
    const p = getPrice(tier);
    _method = 'card';

    const renewDate = new Date();
    if (_cycle === 'yearly') renewDate.setFullYear(renewDate.getFullYear() + 1);
    else renewDate.setMonth(renewDate.getMonth() + 1);
    const renewStr = renewDate.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });

    const sheet = document.createElement('div');
    sheet.id = 'pmSheet';
    sheet.innerHTML = `
      <div class="pm-sheet-card">
        <div class="pm-sheet-handle"><div class="pm-sheet-handle-bar"></div></div>

        <!-- Plan header -->
        <div class="pm-sheet-header">
          <div class="pm-sheet-icon" style="background:${tier.colorDim};border:1px solid ${tier.color}33">${tier.icon}</div>
          <div>
            <div class="pm-sheet-plan-name" style="color:${tier.color}">${tier.name}</div>
            <div class="pm-sheet-plan-price">${p.display} / ${_cycle==='yearly'?'year':'month'}${_cycle==='yearly'?` · ≈${p.perMo}/mo`:''}</div>
          </div>
          <button class="pm-sheet-close" onclick="closePremPayment()">✕</button>
        </div>

        <!-- Renewal info -->
        <div class="pm-sheet-renew">
          🔄 Renews ${renewStr} · Cancel anytime
        </div>

        <!-- Payment method selector -->
        <div style="padding:12px 18px 0">
          <div class="pm-feat-label" style="font-size:.62rem;font-weight:900;color:rgba(167,139,250,.4);letter-spacing:.8px;text-transform:uppercase;margin-bottom:0">PAYMENT METHOD</div>
        </div>
        <div class="pm-methods-grid" id="pmMethodsGrid">
          ${_methodBtn('card','💳','Card')}
          ${_methodBtn('paypal','🅿️','PayPal')}
          ${_methodBtn('applepay','🍎','Apple Pay')}
          ${_methodBtn('gpay','🔵','Google Pay')}
          ${_methodBtn('wallet','📱','Wallet')}
          ${_methodBtn('debit','🏦','Debit')}
        </div>

        <!-- Payment form (loaded async) -->
        <div class="pm-form-area" id="pmFormArea">
          ${_buildPaymentLoading()}
        </div>

        <!-- Security -->
        <div class="pm-sec-row">
          <div class="pm-sec-chip">🔒 256-bit SSL</div>
          <div class="pm-sec-chip">🛡️ PCI DSS</div>
          <div class="pm-sec-chip">✅ Secure</div>
        </div>

        <!-- Submit -->
        <div class="pm-sheet-footer">
          <button class="pm-sheet-submit" id="pmPayBtn" onclick="submitPremPayment()"
            style="background:${tier.btnGrad};box-shadow:0 6px 22px ${tier.colorGlow}">
            🔒 Subscribe Now — ${p.display}
          </button>
          <button class="pm-sheet-back" onclick="closePremPayment()">← Back to plans</button>
        </div>
      </div>`;

    sheet.addEventListener('click', e => { if (e.target === sheet) closePremPayment(); });
    document.body.appendChild(sheet);

    // Disable submit while payment form loads
    const payBtn = document.getElementById('pmPayBtn');
    if (payBtn) payBtn.disabled = true;

    // Initialize real payment form
    setTimeout(() => _initPayment(), 80);
  }

  function _methodBtn(id, icon, label) {
    return `<button class="pm-meth-btn${_method===id?' pm-msel':''}" onclick="setPremMethod('${id}')">
      <span class="pm-meth-ico">${icon}</span><span class="pm-meth-lbl">${label}</span>
    </button>`;
  }

  function _buildPaymentLoading() {
    return `
      <div style="text-align:center;padding:20px 0">
        <div style="width:26px;height:26px;border-radius:50%;border:2.5px solid rgba(167,139,250,.1);border-top-color:#a78bfa;animation:pmSpin .8s linear infinite;margin:0 auto 10px"></div>
        <div style="font-size:.74rem;font-weight:800;color:rgba(200,190,230,.35)">Loading secure payment form…</div>
      </div>`;
  }

  function _buildSetupCard(title, body, steps) {
    return `
      <div style="background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.18);border-radius:12px;padding:14px 16px">
        <div style="font-family:'Fredoka One',cursive;font-size:.88rem;color:#fbbf24;margin-bottom:6px">${title}</div>
        <div style="font-size:.74rem;font-weight:700;color:rgba(200,190,230,.55);margin-bottom:10px">${body}</div>
        <ol style="margin:0;padding-left:16px;font-size:.71rem;font-weight:700;color:rgba(200,190,230,.45);line-height:2">
          ${steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>`;
  }

  function _buildPaymentError(msg) {
    return `
      <div style="background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.18);border-radius:10px;padding:12px 14px;text-align:center">
        <div style="font-size:1.3rem;margin-bottom:7px">⚠️</div>
        <div style="font-size:.78rem;font-weight:800;color:rgba(248,113,113,.8);line-height:1.5">${msg}</div>
      </div>`;
  }

  function _buildAltForm(icon, title, subtitle) {
    return `
      <div class="pm-alt-box">
        <div style="font-size:2.2rem;margin-bottom:10px">${icon}</div>
        <div style="font-size:.9rem;font-weight:900;color:#e0d4ff;margin-bottom:5px">${title}</div>
        <div style="font-size:.75rem;color:rgba(200,190,230,.5);font-weight:700">${subtitle}</div>
      </div>`;
  }

  function setMethod(m) {
    _method = m;
    document.querySelectorAll('.pm-meth-btn').forEach(b => {
      b.classList.toggle('pm-msel', b.getAttribute('onclick').includes(`'${m}'`));
    });

    const area = document.getElementById('pmFormArea');
    if (!area) return;

    const btn = document.getElementById('pmPayBtn');

    if (m === 'paypal') {
      _stripeInstance = null; _stripeElements = null; _currentIntentId = null;
      area.innerHTML = _buildPaymentLoading();
      if (btn) btn.style.display = 'none';
      _initPayPal();
    } else if (m === 'wallet') {
      _stripeInstance = null; _stripeElements = null; _currentIntentId = null;
      area.innerHTML = _buildAltForm('📱', 'Mobile Wallet', 'Fawry · Vodafone Cash · Orange Cash — coming soon');
      if (btn) { btn.style.display = ''; btn.disabled = false; }
    } else {
      // card, debit, applepay, gpay → all handled by Stripe Payment Element
      // (Stripe auto-detects Apple Pay in Safari and Google Pay in Chrome)
      area.innerHTML = _buildPaymentLoading();
      if (btn) { btn.style.display = ''; btn.disabled = true; }
      _initStripe();
    }
  }

  /* ═══════════════════════════════════════════════════
     SUBMIT — real payment via Stripe
  ═══════════════════════════════════════════════════ */
  async function submitPayment() {
    const tier = TIERS.find(t => t.id === _sel) || TIERS[0];

    if (_method === 'paypal') return; // PayPal Smart Buttons handle their own submission

    if (_method === 'wallet') {
      _showDeclined(tier, 'Mobile wallet payments are coming soon. Please use a card or PayPal.');
      return;
    }

    if (!_stripeInstance || !_stripeElements) {
      _showDeclined(tier, 'Payment form is still loading. Please wait a moment and try again.');
      return;
    }

    const btn = document.getElementById('pmPayBtn');
    if (btn) btn.disabled = true;

    closePremPayment();
    _showProcessingOverlay(tier);

    const { error, paymentIntent } = await _stripeInstance.confirmPayment({
      elements: _stripeElements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?pm_return=1&tier=${encodeURIComponent(_sel)}&cycle=${encodeURIComponent(_cycle)}`,
      },
      redirect: 'if_required',
    });

    _removeProcessingOverlay();

    if (error) {
      // Real error from Stripe/bank — card declined, invalid details, 3DS failed, etc.
      _showDeclined(tier, error.message);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const token = localStorage.getItem('eylox_token');
        const r = await fetch('/api/payments/stripe/activate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body:    JSON.stringify({ intentId: paymentIntent.id, tierId: _sel, cycle: _cycle }),
        });
        const data = await r.json();

        if (r.ok && data.success) {
          activateBenefits(_sel, data.transactionId);
          closePremiumModal();
          setTimeout(() => _showSuccess(tier, data.transactionId), 150);
        } else {
          _showDeclined(tier, (data.error || 'Activation failed.') + ' Contact support with ID: ' + paymentIntent.id);
        }
      } catch {
        _showDeclined(tier, 'Network error during activation. Contact support and quote: ' + paymentIntent.id);
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     DECLINED SCREEN
  ═══════════════════════════════════════════════════ */
  function _showDeclined(tier, reason) {
    const el = document.createElement('div');
    el.id = 'pmDeclined';
    el.innerHTML = `
      <div class="pm-decl-card">
        <div class="pm-decl-circle">❌</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.5rem;color:#f87171;margin-bottom:6px">Payment Declined</div>
        <div style="font-size:.8rem;color:rgba(200,190,230,.5);font-weight:700;margin-bottom:4px">Your payment could not be processed.</div>
        <div class="pm-decl-reason">${reason}</div>
        <div style="font-size:.72rem;color:rgba(200,190,230,.4);font-weight:700;margin-bottom:8px;line-height:1.6">
          No charges were made. Your account is safe.
        </div>
        <div class="pm-decl-btn-row">
          <button class="pm-decl-retry" onclick="_retryPayment()">↩ Try Again</button>
          <button class="pm-decl-change" onclick="_changePaymentMethod()">💳 Change Method</button>
        </div>
        <button style="display:block;width:100%;text-align:center;background:none;border:none;color:rgba(167,139,250,.3);font-size:.75rem;font-weight:800;cursor:pointer;margin-top:12px;transition:color .15s"
          onmouseover="this.style.color='#a78bfa'" onmouseout="this.style.color='rgba(167,139,250,.3)'"
          onclick="document.getElementById('pmDeclined').remove();document.body.style.overflow=''">
          ✕ Cancel
        </button>
      </div>`;
    document.body.appendChild(el);
  }

  window._retryPayment = function() {
    const el = document.getElementById('pmDeclined');
    if (el) el.remove();
    openPayment();
  };

  window._changePaymentMethod = function() {
    const el = document.getElementById('pmDeclined');
    if (el) el.remove();
    _method = 'paypal';
    openPayment();
    setTimeout(() => setPremMethod('paypal'), 100);
  };

  /* ═══════════════════════════════════════════════════
     SUCCESS SCREEN
  ═══════════════════════════════════════════════════ */
  function _showSuccess(tier, realTxId) {
    injectStyles();
    const b = TIER_BENEFITS[tier.id] || TIER_BENEFITS.premium;
    const p = getPrice(tier);
    const renew = new Date();
    if (_cycle === 'yearly') renew.setFullYear(renew.getFullYear() + 1);
    else renew.setMonth(renew.getMonth() + 1);
    const renewStr = renew.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
    const txId = realTxId || ('TXN-' + Math.random().toString(36).substr(2,8).toUpperCase());
    const dateStr = new Date().toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });

    const benefitsList = (b.unlocked || []).slice(0,6).map(k => {
      const info = BENEFIT_LABELS[k] || { icon:'✅', name:k };
      return `<div style="display:flex;align-items:center;gap:7px;padding:5px 9px;background:${tier.colorDim};border:1px solid ${tier.color}22;border-radius:8px;font-size:.72rem;font-weight:800;color:#e0d4ff"><span>${info.icon}</span>${info.name}</div>`;
    }).join('');

    const ov = document.createElement('div');
    ov.id = 'pmSuccess';
    ov.innerHTML = `
      <div class="pm-succ-card" style="border-color:${tier.color}44">
        <div class="pm-succ-circle" style="border-color:${tier.color}55;background:${tier.colorDim}">✅</div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.25);border-radius:99px;padding:4px 16px;font-size:.65rem;font-weight:900;letter-spacing:1px;color:#4ade80;margin-bottom:14px">
          🎉 PAYMENT ACCEPTED
        </div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:#fff;margin-bottom:4px">Welcome to ${tier.name}!</div>
        <div style="font-size:.8rem;color:rgba(200,190,230,.6);font-weight:700;margin-bottom:6px">
          Your account has been upgraded instantly.<br>
          <span style="color:#fbbf24;font-weight:900">+${b.welcomeCoins.toLocaleString()} bonus Coins</span> added!
        </div>

        <!-- Receipt -->
        <div class="pm-receipt">
          <div class="pm-receipt-row">
            <span class="label">Plan</span>
            <span class="val" style="color:${tier.color}">${tier.name}</span>
          </div>
          <div class="pm-receipt-row">
            <span class="label">Amount</span>
            <span class="val">${p.display}</span>
          </div>
          <div class="pm-receipt-row">
            <span class="label">Billing</span>
            <span class="val">${_cycle === 'yearly' ? 'Annual' : 'Monthly'}</span>
          </div>
          <div class="pm-receipt-row">
            <span class="label">Method</span>
            <span class="val">${_method.charAt(0).toUpperCase() + _method.slice(1)}</span>
          </div>
          <div class="pm-receipt-row">
            <span class="label">Next renewal</span>
            <span class="val" style="color:#4ade80">${renewStr}</span>
          </div>
          <div class="pm-receipt-row">
            <span class="label">Transaction ID</span>
            <span class="val" style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:rgba(167,139,250,.7)">${txId}</span>
          </div>
          <div class="pm-receipt-row">
            <span class="label">Date</span>
            <span class="val" style="font-size:.68rem;color:rgba(200,190,230,.5)">${dateStr}</span>
          </div>
        </div>

        <!-- Benefits -->
        <div style="font-size:.62rem;font-weight:900;color:rgba(167,139,250,.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✨ UNLOCKED BENEFITS</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:16px">${benefitsList}</div>

        <button onclick="this.closest('#pmSuccess').remove();document.body.style.overflow='';location.reload()"
          style="width:100%;background:${tier.btnGrad};color:#fff;border:none;border-radius:13px;padding:14px;font-family:'Fredoka One',cursive;font-size:.98rem;cursor:pointer;box-shadow:0 6px 24px ${tier.colorGlow};transition:transform .2s,filter .2s"
          onmouseover="this.style.transform='translateY(-2px)';this.style.filter='brightness(1.1)'"
          onmouseout="this.style.transform='';this.style.filter=''">
          🚀 Start Enjoying ${tier.name}!
        </button>
      </div>`;

    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    setTimeout(() => _spawnConfetti(), 80);
    setTimeout(() => _spawnConfetti(), 520);
  }

  /* ═══════════════════════════════════════════════════
     BENEFITS ACTIVATION
  ═══════════════════════════════════════════════════ */
  function activateBenefits(tierId, realTxId) {
    const b = TIER_BENEFITS[tierId];
    if (!b) return;
    localStorage.setItem('eylox_benefits', JSON.stringify(b.unlocked));
    localStorage.setItem('eylox_coin_multiplier', String(b.coinMultiplier));
    localStorage.setItem('eylox_ad_free', b.adFree ? '1' : '0');
    localStorage.setItem('eylox_premium_badge', b.premiumBadge ? '1' : '0');
    if (b.creatorBadge)  localStorage.setItem('eylox_creator_badge',  '1');
    if (b.verifiedBadge) localStorage.setItem('eylox_verified_badge', '1');
    if (b.ultimateBadge) localStorage.setItem('eylox_ultimate_badge', '1');
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (u) {
        u.coins = (u.coins || 0) + b.welcomeCoins;
        u.isPremium = true; u.subscriptionTier = tierId; u.coinMultiplier = b.coinMultiplier;
        if (b.creatorBadge)  u.creatorBadge  = true;
        if (b.verifiedBadge) u.verifiedBadge = true;
        localStorage.setItem('eylox_user', JSON.stringify(u));
      }
    } catch {}
    try {
      const tier = TIERS.find(t => t.id === tierId);
      const p = getPrice(tier);
      const txId = realTxId || ('TXN-' + Math.random().toString(36).substr(2,8).toUpperCase());
      const history = JSON.parse(localStorage.getItem('eylox_billing_history') || '[]');
      history.push({
        date: new Date().toISOString(),
        desc: `${tier?.name || tierId} — ${_cycle === 'yearly' ? 'Annual' : 'Monthly'}`,
        amount: p.display, currency: _currency, egp: p.egp,
        status: 'paid', method: _method.toUpperCase(), id: txId,
      });
      localStorage.setItem('eylox_billing_history', JSON.stringify(history));
    } catch {}
    const renewal = new Date();
    if (_cycle === 'yearly') renewal.setFullYear(renewal.getFullYear() + 1);
    else renewal.setMonth(renewal.getMonth() + 1);
    localStorage.setItem('eylox_renewal_date', renewal.toISOString());
    localStorage.setItem('eylox_sub_start',    new Date().toISOString());
    localStorage.setItem('eylox_sub_cycle',    _cycle);
    localStorage.setItem('eylox_sub_currency', _currency);
  }

  /* ═══════════════════════════════════════════════════
     CONFETTI
  ═══════════════════════════════════════════════════ */
  function _spawnConfetti() {
    const colors = ['#a78bfa','#60a5fa','#f472b6','#fbbf24','#4ade80','#fb923c','#e879f9'];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      const sz    = 5 + Math.random() * 8;
      const color = colors[(Math.random() * colors.length)|0];
      const left  = Math.random() * 100;
      const delay = Math.random() * 1.2;
      const dur   = 1.8 + Math.random() * 1.4;
      el.style.cssText = `position:fixed;top:-10px;left:${left}vw;width:${sz}px;height:${sz*.6}px;background:${color};border-radius:${Math.random()>.5?'50%':'2px'};z-index:99999;pointer-events:none;animation:confettiFall ${dur}s ${delay}s cubic-bezier(.25,.46,.45,.94) forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (delay + dur + .3) * 1000);
    }
  }


  /* ═══════════════════════════════════════════════════
     GUEST BLOCK
  ═══════════════════════════════════════════════════ */
  function _showGuestBlock() {
    const d = document.createElement('div');
    d.id = 'pmGuestBlock';
    d.innerHTML = `
      <div class="pm-guest-card">
        <div style="font-size:3rem;margin-bottom:14px">🔐</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:#fff;margin-bottom:8px">Sign In Required</div>
        <div style="font-size:.82rem;color:rgba(200,190,230,.55);font-weight:700;line-height:1.65;margin-bottom:22px">
          You need an EYLOX account to subscribe.<br>Guest accounts cannot purchase plans.
        </div>
        <a href="login.html" style="display:block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:13px;padding:13px;font-family:'Fredoka One',cursive;font-size:.95rem;text-decoration:none;margin-bottom:10px;transition:transform .2s;text-align:center"
          onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          Create Account / Sign In
        </a>
        <button onclick="document.getElementById('pmGuestBlock').remove()" style="background:none;border:none;color:rgba(167,139,250,.4);font-size:.8rem;font-weight:800;cursor:pointer;width:100%;padding:6px;transition:color .15s"
          onmouseover="this.style.color='#a78bfa'" onmouseout="this.style.color='rgba(167,139,250,.4)'">← Back to plans</button>
      </div>`;
    d.addEventListener('click', e => { if (e.target === d) d.remove(); });
    document.body.appendChild(d);
  }

  /* ═══════════════════════════════════════════════════
     CLOSE
  ═══════════════════════════════════════════════════ */
  function closeModal() {
    const ov = document.getElementById('pmOverlay');
    if (!ov) return;
    ov.style.animation = 'pmFadeIn .15s ease reverse forwards';
    setTimeout(() => { ov.remove(); document.body.style.overflow = ''; }, 150);
  }

  function closePremPayment() {
    const sheet = document.getElementById('pmSheet');
    if (sheet) sheet.remove();
    _stripeInstance = null;
    _stripeElements = null;
    _currentIntentId = null;
  }

  /* ═══════════════════════════════════════════════════
     REAL PAYMENT ENGINE
  ═══════════════════════════════════════════════════ */

  function _initPayment() {
    if (_method === 'paypal') _initPayPal();
    else if (_method === 'wallet') {
      const area = document.getElementById('pmFormArea');
      if (area) area.innerHTML = _buildAltForm('📱', 'Mobile Wallet', 'Fawry · Vodafone Cash · Orange Cash — coming soon');
      const btn = document.getElementById('pmPayBtn');
      if (btn) { btn.style.display = ''; btn.disabled = false; }
    } else {
      _initStripe();
    }
  }

  async function _initStripe() {
    const area = document.getElementById('pmFormArea');
    const btn  = document.getElementById('pmPayBtn');
    if (!area) return;

    area.innerHTML = _buildPaymentLoading();
    if (btn) btn.disabled = true;

    const token = localStorage.getItem('eylox_token');
    if (!token) { area.innerHTML = _buildPaymentError('You must be logged in to make a payment.'); return; }

    try {
      const cfgRes = await fetch('/api/payments/config');
      if (!cfgRes.ok) throw new Error('Backend server is not running. Start it with: cd backend && npm start');
      const cfg = await cfgRes.json();

      if (!cfg.stripe || !cfg.stripePk) {
        area.innerHTML = _buildSetupCard(
          '🔑 Stripe Keys Required',
          'Add your Stripe API keys to backend/.env to accept real card payments.',
          [
            'Create a free account at <b>stripe.com</b>',
            'Go to Dashboard → Developers → API keys',
            'Copy backend/.env.example → backend/.env',
            'Paste your <b>sk_test_...</b> and <b>pk_test_...</b> keys',
            'Restart the backend server',
          ]
        );
        if (btn) { btn.style.display = ''; btn.disabled = false; }
        return;
      }

      const intentRes = await fetch('/api/payments/stripe/intent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify({ tierId: _sel, cycle: _cycle }),
      });

      if (!intentRes.ok) {
        const e = await intentRes.json();
        area.innerHTML = _buildPaymentError(e.error || 'Failed to create payment session.');
        return;
      }

      const { clientSecret, intentId } = await intentRes.json();
      _currentIntentId = intentId;

      await _loadStripeJs();

      _stripeInstance = Stripe(cfg.stripePk);  // eslint-disable-line no-undef

      const tier = TIERS.find(t => t.id === _sel) || TIERS[0];

      _stripeElements = _stripeInstance.elements({
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorBackground:      '#07000f',
            colorText:            '#e0d4ff',
            colorTextSecondary:   'rgba(200,190,230,.6)',
            colorTextPlaceholder: 'rgba(200,190,230,.28)',
            colorPrimary:          tier.color,
            colorDanger:          '#f87171',
            borderRadius:         '10px',
            fontFamily:           '"Nunito", system-ui, sans-serif',
            fontWeightNormal:     '700',
            spacingUnit:          '4px',
            fontSizeBase:         '14px',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(167,139,250,.05)',
              border:          '1px solid rgba(167,139,250,.18)',
            },
            '.Input:focus': {
              border:     `1px solid ${tier.color}`,
              boxShadow:  `0 0 0 3px ${tier.colorDim}`,
            },
            '.Label': {
              fontWeight:    '900',
              fontSize:      '0.72rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            },
            '.Tab': {
              backgroundColor: 'rgba(167,139,250,.04)',
              border:          '1px solid rgba(167,139,250,.1)',
            },
            '.Tab--selected': {
              backgroundColor: 'rgba(167,139,250,.1)',
              border:          `1px solid ${tier.color}44`,
            },
          },
        },
      });

      area.innerHTML = `<div id="pm-stripe-el" style="padding:2px 0 4px"></div>`;

      const paymentEl = _stripeElements.create('payment', {
        layout: { type: 'tabs', defaultCollapsed: false },
        terms:  { card: 'never' },
      });
      paymentEl.mount('#pm-stripe-el');

      if (btn) { btn.style.display = ''; btn.disabled = false; }

    } catch (err) {
      console.error('[Payment] Stripe init error:', err.message);
      area.innerHTML = _buildPaymentError(err.message || 'Could not connect to the payment server.');
      if (btn) { btn.style.display = ''; btn.disabled = false; }
    }
  }

  async function _initPayPal() {
    const area = document.getElementById('pmFormArea');
    const btn  = document.getElementById('pmPayBtn');
    if (!area) return;

    area.innerHTML = _buildPaymentLoading();
    if (btn) btn.style.display = 'none';

    const token = localStorage.getItem('eylox_token');

    try {
      const cfgRes = await fetch('/api/payments/config');
      if (!cfgRes.ok) throw new Error('Backend server is not running.');
      const cfg = await cfgRes.json();

      if (!cfg.paypal || !cfg.paypalClientId) {
        area.innerHTML = _buildSetupCard(
          '🅿️ PayPal Keys Required',
          'Add your PayPal credentials to backend/.env to accept PayPal payments.',
          [
            'Create an account at <b>developer.paypal.com</b>',
            'Create a REST app in My Apps & Credentials',
            'Copy backend/.env.example → backend/.env',
            'Paste your Client ID and Secret',
            'Restart the backend server',
          ]
        );
        if (btn) { btn.style.display = ''; btn.disabled = false; }
        return;
      }

      await _loadPayPalSdk(cfg.paypalClientId);

      area.innerHTML = `<div id="pm-paypal-el" style="padding:4px 0"></div>`;

      // eslint-disable-next-line no-undef
      paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 48 },

        createOrder: async () => {
          const r = await fetch('/api/payments/paypal/order', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body:    JSON.stringify({ tierId: _sel, cycle: _cycle }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || 'Could not create PayPal order');
          return d.orderId;
        },

        onApprove: async (data) => {
          closePremPayment();
          const tier = TIERS.find(t => t.id === _sel) || TIERS[0];
          _showProcessingOverlay(tier);

          try {
            const r = await fetch('/api/payments/paypal/capture', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body:    JSON.stringify({ orderId: data.orderID, tierId: _sel, cycle: _cycle }),
            });
            const result = await r.json();
            _removeProcessingOverlay();

            if (r.ok && result.success) {
              activateBenefits(_sel, result.transactionId);
              closePremiumModal();
              setTimeout(() => _showSuccess(tier, result.transactionId), 150);
            } else {
              _showDeclined(tier, result.error || 'PayPal payment could not be processed.');
            }
          } catch (netErr) {
            _removeProcessingOverlay();
            _showDeclined(tier, netErr.message || 'Network error processing PayPal payment.');
          }
        },

        onError: (ppErr) => {
          const tier = TIERS.find(t => t.id === _sel) || TIERS[0];
          _showDeclined(tier, 'PayPal encountered an error: ' + (ppErr?.message || 'Unknown error'));
        },
      }).render('#pm-paypal-el');

    } catch (err) {
      console.error('[Payment] PayPal init error:', err.message);
      area.innerHTML = _buildPaymentError(err.message || 'Could not load PayPal.');
      if (btn) { btn.style.display = ''; btn.disabled = false; }
    }
  }

  function _showProcessingOverlay(tier) {
    if (document.getElementById('pmProcessing')) return;
    const proc = document.createElement('div');
    proc.id = 'pmProcessing';
    proc.innerHTML = `
      <div class="pm-proc-card">
        <div class="pm-spinner" style="border-top-color:${tier.color}"></div>
        <div class="pm-proc-stage" id="pmProcStage">🔒 Processing payment…</div>
        <div class="pm-proc-sub">Please do not close this window</div>
        <div class="pm-proc-steps">
          <div class="pm-proc-dot active" id="pDot0"></div>
          <div class="pm-proc-dot"        id="pDot1"></div>
          <div class="pm-proc-dot"        id="pDot2"></div>
          <div class="pm-proc-dot"        id="pDot3"></div>
        </div>
      </div>`;
    document.body.appendChild(proc);

    const stages = [
      { t: 600,  label: '🔍 Verifying transaction…',        dot: 1 },
      { t: 1400, label: '🏦 Checking billing information…', dot: 2 },
      { t: 2300, label: '⚙️ Authorising with your bank…',   dot: 3 },
    ];
    stages.forEach(({ t, label, dot }) => {
      setTimeout(() => {
        const el = document.getElementById('pmProcStage');
        if (el) el.textContent = label;
        for (let i = 0; i < dot; i++) {
          const d = document.getElementById('pDot' + i);
          if (d) { d.classList.remove('active'); d.classList.add('done'); }
        }
        const cur = document.getElementById('pDot' + dot);
        if (cur) cur.classList.add('active');
      }, t);
    });
  }

  function _removeProcessingOverlay() {
    const el = document.getElementById('pmProcessing');
    if (el) el.remove();
  }

  function _loadStripeJs() {
    return new Promise((resolve, reject) => {
      if (window.Stripe) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload  = resolve;
      s.onerror = () => reject(new Error('Failed to load Stripe.js — check your internet connection'));
      document.head.appendChild(s);
    });
  }

  function _loadPayPalSdk(clientId) {
    return new Promise((resolve, reject) => {
      if (window.paypal) { resolve(); return; }
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&commit=true`;
      s.onload  = resolve;
      s.onerror = () => reject(new Error('Failed to load PayPal SDK — check your internet connection'));
      document.head.appendChild(s);
    });
  }

  async function _handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('pm_return')) return;

    const intentId = params.get('payment_intent');
    const tierId   = params.get('tier');
    const cycle    = params.get('cycle');

    if (!intentId || !tierId) return;

    window.history.replaceState({}, document.title, window.location.pathname);

    _sel = tierId; _cycle = cycle || 'monthly';
    injectStyles();
    const tier = TIERS.find(t => t.id === tierId) || TIERS[0];
    _showProcessingOverlay(tier);

    const token = localStorage.getItem('eylox_token');
    try {
      const r = await fetch('/api/payments/stripe/activate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify({ intentId, tierId, cycle }),
      });
      const data = await r.json();
      _removeProcessingOverlay();

      if (r.ok && data.success) {
        activateBenefits(tierId, data.transactionId);
        setTimeout(() => _showSuccess(tier, data.transactionId), 150);
      } else {
        _showDeclined(tier, data.error || 'Payment verification failed. Please contact support.');
      }
    } catch (err) {
      _removeProcessingOverlay();
      _showDeclined(tier, 'Network error verifying payment. Contact support with Payment ID: ' + intentId);
    }
  }

  /* ═══════════════════════════════════════════════════
     GLOBAL API
  ═══════════════════════════════════════════════════ */
  window.openPremiumModal  = buildModal;
  window.closePremiumModal = closeModal;
  window.selectPremTier    = selectTier;
  window.openPremPayment   = openPayment;
  window.closePremPayment  = closePremPayment;
  window.submitPremPayment = submitPayment;
  window.setPremCycle      = setCycle;
  window.setPremCurrency   = setCurrency;
  window.setPremMethod     = setMethod;

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-premium],[data-open-premium],.open-premium');
      if (el) { e.preventDefault(); buildModal(); }
    });
    // Handle Stripe 3DS / redirect return
    _handlePaymentReturn();
  });

})();
