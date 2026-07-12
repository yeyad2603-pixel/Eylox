/* ============================================================
   EYLOX — Game Ads Manager  |  ads-manager.js  v1.0
   Full ad campaign system: create · preview · analytics
   Glassmorphism · Neon glow · Animated charts · Rewarded ads
   ============================================================ */
'use strict';

(function EyloxAdsManager() {

  /* ─── Storage helpers ─────────────────────────────────── */
  const CAMP_KEY     = 'eylox_ad_campaigns';
  const PENDING_KEY  = 'eylox_ad_pending';
  const ANALYTICS_KEY= 'eylox_ad_analytics';

  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user')||'{}'); } catch { return {}; }
  }
  function saveUser(u) {
    try { localStorage.setItem('eylox_user', JSON.stringify(u)); } catch {}
  }
  function getCampaigns() {
    try { return JSON.parse(localStorage.getItem(CAMP_KEY)||'[]'); } catch { return []; }
  }
  function saveCampaigns(c) {
    try { localStorage.setItem(CAMP_KEY, JSON.stringify(c)); } catch {}
  }
  function getAnalytics(id) {
    try {
      const all = JSON.parse(localStorage.getItem(ANALYTICS_KEY)||'{}');
      return all[id] || { views:0, clicks:0, joins:0, likes:0, retention:0 };
    } catch { return { views:0, clicks:0, joins:0, likes:0, retention:0 }; }
  }
  function saveAnalytics(id, data) {
    try {
      const all = JSON.parse(localStorage.getItem(ANALYTICS_KEY)||'{}');
      all[id] = data;
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(all));
    } catch {}
  }

  /* ─── Format helpers ──────────────────────────────────── */
  function fmtN(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
    if (n >= 1000)    return (n/1000).toFixed(1)+'K';
    return String(n);
  }
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function randomInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }

  /* Simulate growing analytics for live campaigns */
  function tickAnalytics() {
    const campaigns = getCampaigns().filter(c => c.status === 'live');
    campaigns.forEach(c => {
      const a = getAnalytics(c.id);
      a.views     += randomInt(2, 14);
      a.clicks    += randomInt(0, 3);
      a.joins     += Math.random() > 0.7 ? 1 : 0;
      a.likes     += Math.random() > 0.85 ? 1 : 0;
      a.retention  = Math.min(100, a.retention + (Math.random()-.4)*0.5);
      saveAnalytics(c.id, a);
    });
    /* Update live analytics panel if open */
    const livePanel = document.getElementById('am-live-analytics');
    if (livePanel && livePanel.closest('.am-overlay.open')) {
      const campId = livePanel.dataset.campId;
      if (campId) renderLiveChart(campId);
    }
  }
  setInterval(tickAnalytics, 3000);

  /* ─── Coin cost calculator ────────────────────────────── */
  const DURATION_COSTS = { '1d':200, '3d':500, '7d':1000, '14d':1800, '30d':3000 };
  const FORMAT_COSTS   = { video:1.5, banner:1.0, popup:2.0, sidebar:0.8, sponsored:1.2, rewarded:2.5 };
  const AUDIENCE_COSTS = { all:1.0, action:1.2, puzzle:1.1, racing:1.3, adventure:1.1, casual:0.9 };

  function calcCost(duration, format, audience) {
    const base = DURATION_COSTS[duration] || 500;
    const fm   = FORMAT_COSTS[format]     || 1.0;
    const au   = AUDIENCE_COSTS[audience] || 1.0;
    return Math.round(base * fm * au);
  }

  /* ─── CSS injection ───────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('am-css')) return;
    const s = document.createElement('style');
    s.id = 'am-css';
    s.textContent = `
      /* ── Overlay / backdrop ── */
      .am-overlay {
        display:none; position:fixed; inset:0; z-index:99000;
        background:rgba(0,0,0,.75); backdrop-filter:blur(6px);
        align-items:center; justify-content:center;
        animation:amFadeIn .25s ease;
      }
      .am-overlay.open { display:flex; }
      @keyframes amFadeIn { from{opacity:0} to{opacity:1} }

      /* ── Panel ── */
      .am-panel {
        background:linear-gradient(160deg,#0e0628,#060318);
        border:1px solid rgba(167,139,250,.28);
        border-radius:24px;
        width:min(900px,96vw);
        max-height:92vh;
        display:flex; flex-direction:column;
        box-shadow:0 32px 96px rgba(0,0,0,.9),0 0 0 1px rgba(167,139,250,.08),
          inset 0 1px 0 rgba(255,255,255,.04);
        animation:amPanelIn .35s cubic-bezier(.34,1.4,.64,1);
        overflow:hidden;
      }
      @keyframes amPanelIn {
        from{opacity:0;transform:translateY(24px) scale(.95)}
        to{opacity:1;transform:none}
      }

      /* ── Panel header ── */
      .am-header {
        display:flex; align-items:center; gap:14px;
        padding:20px 24px 18px;
        border-bottom:1px solid rgba(167,139,250,.1);
        flex-shrink:0;
      }
      .am-header-icon {
        font-size:1.8rem; filter:drop-shadow(0 0 10px rgba(167,139,250,.5));
      }
      .am-header-title {
        font-family:'Fredoka One',cursive; font-size:1.3rem;
        background:linear-gradient(135deg,#f0e8ff,#a78bfa);
        -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        flex:1;
      }
      .am-header-sub { font-size:.74rem; font-weight:700; color:rgba(167,139,250,.5); margin-top:1px; }
      .am-close-btn {
        background:rgba(167,139,250,.08); border:1px solid rgba(167,139,250,.18);
        color:rgba(167,139,250,.6); border-radius:10px; padding:7px 12px;
        font-size:.85rem; cursor:pointer; transition:all .18s;
      }
      .am-close-btn:hover { background:rgba(239,68,68,.18); border-color:rgba(239,68,68,.35); color:#f87171; }

      /* ── Tab bar ── */
      .am-tabs {
        display:flex; gap:4px; padding:14px 24px 0;
        border-bottom:1px solid rgba(167,139,250,.08);
        flex-shrink:0;
      }
      .am-tab {
        padding:9px 18px; border:none; border-radius:10px 10px 0 0;
        background:rgba(167,139,250,.05);
        font-family:'Nunito',sans-serif; font-size:.82rem; font-weight:800;
        color:rgba(167,139,250,.45); cursor:pointer; transition:all .18s;
        border-bottom:2px solid transparent;
      }
      .am-tab:hover { color:rgba(167,139,250,.8); background:rgba(167,139,250,.1); }
      .am-tab.am-tab-active { color:#a78bfa; border-bottom-color:#a78bfa; background:rgba(167,139,250,.12); }

      /* ── Scrollable body ── */
      .am-body {
        flex:1; overflow-y:auto; padding:24px;
        scrollbar-width:thin; scrollbar-color:rgba(167,139,250,.2) transparent;
      }
      .am-body::-webkit-scrollbar { width:4px; }
      .am-body::-webkit-scrollbar-thumb { background:rgba(167,139,250,.25); border-radius:4px; }

      /* ── Section heading ── */
      .am-section-title {
        font-size:.65rem; font-weight:900; letter-spacing:2px;
        color:rgba(167,139,250,.4); text-transform:uppercase; margin-bottom:14px;
      }

      /* ── Field rows ── */
      .am-field { margin-bottom:18px; }
      .am-label {
        display:block; font-size:.78rem; font-weight:800;
        color:rgba(167,139,250,.75); margin-bottom:7px;
      }
      .am-input, .am-textarea, .am-select {
        width:100%; background:rgba(167,139,250,.07);
        border:1px solid rgba(167,139,250,.18);
        border-radius:11px; padding:11px 14px;
        color:#f0e8ff; font-family:'Nunito',sans-serif; font-size:.86rem;
        outline:none; transition:border-color .18s; box-sizing:border-box;
      }
      .am-textarea { resize:vertical; min-height:80px; max-height:160px; }
      .am-select { appearance:none; cursor:pointer; }
      .am-input:focus,.am-textarea:focus,.am-select:focus { border-color:rgba(167,139,250,.5); box-shadow:0 0 0 2px rgba(167,139,250,.12); }
      .am-input::placeholder,.am-textarea::placeholder { color:rgba(167,139,250,.3); }

      /* ── Grid rows ── */
      .am-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
      .am-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
      @media(max-width:600px) { .am-grid-2,.am-grid-3 { grid-template-columns:1fr; } }

      /* ── Format cards ── */
      .am-format-card {
        background:rgba(167,139,250,.05); border:1.5px solid rgba(167,139,250,.15);
        border-radius:14px; padding:14px 12px; cursor:pointer;
        transition:all .2s; text-align:center; position:relative;
      }
      .am-format-card:hover { border-color:rgba(167,139,250,.4); background:rgba(167,139,250,.1); transform:translateY(-2px); }
      .am-format-card.am-selected {
        border-color:#a78bfa; background:rgba(124,58,237,.18);
        box-shadow:0 0 20px rgba(124,58,237,.2);
      }
      .am-format-card.am-selected::after {
        content:'✓'; position:absolute; top:8px; right:10px;
        color:#a78bfa; font-size:.75rem; font-weight:900;
      }
      .am-format-icon { font-size:1.6rem; margin-bottom:6px; }
      .am-format-name { font-size:.8rem; font-weight:900; color:#e0d4ff; margin-bottom:2px; }
      .am-format-cost { font-size:.68rem; font-weight:700; color:rgba(245,158,11,.7); }

      /* ── Upload zones ── */
      .am-upload-zone {
        border:2px dashed rgba(167,139,250,.25); border-radius:14px;
        padding:24px 16px; text-align:center; cursor:pointer;
        transition:all .2s; background:rgba(167,139,250,.03);
        position:relative; overflow:hidden;
      }
      .am-upload-zone:hover { border-color:rgba(167,139,250,.5); background:rgba(167,139,250,.07); }
      .am-upload-zone.has-file { border-color:rgba(34,197,94,.4); background:rgba(34,197,94,.05); }
      .am-upload-icon { font-size:1.8rem; margin-bottom:8px; opacity:.6; }
      .am-upload-label { font-size:.78rem; font-weight:700; color:rgba(167,139,250,.55); }
      .am-upload-sub { font-size:.68rem; color:rgba(167,139,250,.35); margin-top:3px; }
      .am-upload-input { position:absolute; inset:0; opacity:0; cursor:pointer; }
      .am-file-preview {
        display:none; align-items:center; gap:10px;
        background:rgba(167,139,250,.1); border-radius:10px; padding:8px 12px;
        margin-top:10px; font-size:.8rem; font-weight:700; color:#a78bfa;
      }
      .am-file-preview.show { display:flex; }

      /* ── Audience pills ── */
      .am-audience-grid { display:flex; flex-wrap:wrap; gap:8px; }
      .am-audience-pill {
        padding:7px 16px; border:1.5px solid rgba(167,139,250,.2);
        border-radius:99px; font-size:.78rem; font-weight:800;
        color:rgba(167,139,250,.55); cursor:pointer; transition:all .18s;
        background:rgba(167,139,250,.05);
      }
      .am-audience-pill:hover { border-color:rgba(167,139,250,.45); color:#e0d4ff; }
      .am-audience-pill.am-selected { border-color:#a78bfa; color:#f0e8ff; background:rgba(124,58,237,.2); box-shadow:0 0 12px rgba(124,58,237,.15); }

      /* ── Cost preview bar ── */
      .am-cost-bar {
        background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(251,191,36,.06));
        border:1px solid rgba(245,158,11,.25); border-radius:14px;
        padding:14px 18px; display:flex; align-items:center; gap:14px;
        margin:18px 0;
      }
      .am-cost-icon { font-size:1.4rem; filter:drop-shadow(0 0 8px rgba(245,158,11,.4)); }
      .am-cost-label { font-size:.8rem; font-weight:700; color:rgba(245,158,11,.6); flex:1; }
      .am-cost-value {
        font-family:'Fredoka One',cursive; font-size:1.3rem; color:#fbbf24;
        text-shadow:0 0 12px rgba(251,191,36,.4);
      }
      .am-cost-balance { font-size:.72rem; font-weight:700; color:rgba(245,158,11,.45); margin-top:2px; }

      /* ── Preview card ── */
      .am-preview-wrap {
        background:rgba(167,139,250,.04); border:1px solid rgba(167,139,250,.12);
        border-radius:18px; padding:20px; margin-bottom:20px;
      }
      .am-preview-ad-card {
        max-width:320px; margin:0 auto;
        background:linear-gradient(160deg,rgba(20,10,50,.97),rgba(10,5,28,.98));
        border:1px solid rgba(167,139,250,.25); border-radius:20px; overflow:hidden;
        box-shadow:0 16px 48px rgba(0,0,0,.7);
      }
      .am-preview-thumb {
        height:160px; display:flex; align-items:center; justify-content:center;
        font-size:3rem; position:relative; overflow:hidden;
      }
      .am-preview-thumb-bg {
        position:absolute; inset:0;
        background:linear-gradient(135deg,var(--am-c1,#5b21b6),var(--am-c2,#7c3aed),var(--am-c3,#a855f7));
        background-size:200% 200%; animation:amThumbPulse 4s ease infinite;
      }
      @keyframes amThumbPulse {
        0%{background-position:0% 0%} 50%{background-position:100% 100%} 100%{background-position:0% 0%}
      }
      .am-preview-body { padding:14px 16px; }
      .am-preview-badge {
        display:inline-block; font-size:.6rem; font-weight:900; letter-spacing:1px;
        text-transform:uppercase; padding:3px 10px; border-radius:99px;
        background:rgba(167,139,250,.15); color:#a78bfa; border:1px solid rgba(167,139,250,.3);
        margin-bottom:8px;
      }
      .am-preview-title { font-family:'Fredoka One',cursive; font-size:1.05rem; color:#f0e8ff; margin-bottom:4px; }
      .am-preview-desc { font-size:.76rem; color:rgba(167,139,250,.6); line-height:1.4; margin-bottom:12px; }
      .am-preview-cta {
        width:100%; padding:10px; border:none; border-radius:10px; cursor:pointer;
        background:linear-gradient(135deg,#a78bfa,#7c3aed); color:#fff;
        font-family:'Fredoka One',cursive; font-size:.88rem; transition:opacity .18s;
      }
      .am-preview-cta:hover { opacity:.85; }

      /* ── Analytics cards ── */
      .am-analytics-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; margin-bottom:20px; }
      .am-stat-card {
        background:rgba(167,139,250,.06); border:1px solid rgba(167,139,250,.12);
        border-radius:14px; padding:14px 12px; text-align:center;
        transition:border-color .2s;
      }
      .am-stat-card:hover { border-color:rgba(167,139,250,.3); }
      .am-stat-icon { font-size:1.3rem; margin-bottom:5px; }
      .am-stat-val { font-family:'Fredoka One',cursive; font-size:1.2rem; color:#f0e8ff; line-height:1; margin-bottom:2px; }
      .am-stat-lbl { font-size:.62rem; font-weight:800; color:rgba(167,139,250,.42); letter-spacing:.8px; text-transform:uppercase; }

      /* ── Chart ── */
      .am-chart-wrap { background:rgba(167,139,250,.04); border:1px solid rgba(167,139,250,.1); border-radius:14px; padding:16px; margin-bottom:16px; }
      .am-chart-title { font-size:.72rem; font-weight:900; color:rgba(167,139,250,.5); letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }
      .am-chart { display:flex; align-items:flex-end; gap:6px; height:80px; }
      .am-bar {
        flex:1; border-radius:4px 4px 0 0;
        background:linear-gradient(180deg,#a78bfa,#7c3aed);
        transition:height .4s cubic-bezier(.34,1.4,.64,1);
        position:relative; cursor:default;
        box-shadow:0 0 8px rgba(167,139,250,.2);
      }
      .am-bar:hover::after {
        content:attr(data-val); position:absolute; bottom:calc(100% + 4px); left:50%; transform:translateX(-50%);
        background:rgba(20,10,50,.95); border:1px solid rgba(167,139,250,.25);
        color:#f0e8ff; font-size:.62rem; font-weight:800; white-space:nowrap;
        padding:3px 8px; border-radius:6px; pointer-events:none;
      }
      .am-chart-labels { display:flex; gap:6px; margin-top:4px; }
      .am-chart-lbl { flex:1; text-align:center; font-size:.6rem; color:rgba(167,139,250,.35); font-weight:700; }

      /* ── Trend chart (line sim) ── */
      .am-trend-svg { width:100%; height:60px; }
      .am-trend-path { fill:none; stroke:url(#amTrendGrad); stroke-width:2; stroke-linejoin:round; }
      .am-trend-area { fill:url(#amAreaGrad); }

      /* ── Campaign list ── */
      .am-camp-item {
        display:flex; align-items:center; gap:14px;
        background:rgba(167,139,250,.05); border:1px solid rgba(167,139,250,.1);
        border-radius:14px; padding:14px 16px; margin-bottom:10px;
        transition:border-color .18s;
      }
      .am-camp-item:hover { border-color:rgba(167,139,250,.28); }
      .am-camp-icon { font-size:1.8rem; flex-shrink:0; }
      .am-camp-info { flex:1; min-width:0; }
      .am-camp-name { font-weight:900; font-size:.9rem; color:#f0e8ff; }
      .am-camp-meta { font-size:.72rem; color:rgba(167,139,250,.5); font-weight:700; margin-top:2px; }
      .am-camp-status {
        font-size:.65rem; font-weight:900; letter-spacing:.8px; text-transform:uppercase;
        padding:3px 10px; border-radius:99px;
      }
      .am-camp-status.live { background:rgba(34,197,94,.12); color:#4ade80; border:1px solid rgba(34,197,94,.3); }
      .am-camp-status.pending { background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
      .am-camp-status.ended { background:rgba(167,139,250,.1); color:rgba(167,139,250,.6); border:1px solid rgba(167,139,250,.2); }
      .am-camp-actions { display:flex; gap:6px; flex-shrink:0; }
      .am-camp-btn {
        background:rgba(167,139,250,.08); border:1px solid rgba(167,139,250,.18);
        color:rgba(167,139,250,.7); border-radius:8px; padding:5px 11px;
        font-size:.72rem; font-weight:800; cursor:pointer; transition:all .18s;
      }
      .am-camp-btn:hover { background:rgba(167,139,250,.2); color:#f0e8ff; }
      .am-camp-btn.am-btn-danger:hover { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.3); color:#f87171; }

      /* ── Trending section ── */
      .am-trending-row { display:flex; gap:10px; overflow-x:auto; padding-bottom:8px; scrollbar-width:none; }
      .am-trending-row::-webkit-scrollbar { display:none; }
      .am-trending-card {
        flex-shrink:0; width:180px;
        background:rgba(167,139,250,.06); border:1px solid rgba(167,139,250,.14);
        border-radius:14px; overflow:hidden; cursor:pointer; transition:all .2s;
      }
      .am-trending-card:hover { border-color:rgba(167,139,250,.35); transform:translateY(-3px); }
      .am-trending-thumb {
        height:90px; display:flex; align-items:center; justify-content:center;
        font-size:2rem; position:relative; overflow:hidden;
      }
      .am-trending-body { padding:8px 10px; }
      .am-trending-name { font-size:.8rem; font-weight:900; color:#e0d4ff; }
      .am-trending-stat { font-size:.68rem; color:rgba(167,139,250,.5); margin-top:2px; }

      /* ── Safety badge ── */
      .am-safety-chip {
        display:inline-flex; align-items:center; gap:5px;
        background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.22);
        border-radius:99px; padding:4px 12px; font-size:.7rem; font-weight:800; color:#4ade80;
      }

      /* ── Submit button ── */
      .am-submit-btn {
        width:100%; padding:14px; border:none; border-radius:14px; cursor:pointer;
        background:linear-gradient(135deg,#a78bfa,#7c3aed);
        font-family:'Fredoka One',cursive; font-size:1rem; color:#fff;
        box-shadow:0 6px 24px rgba(124,58,237,.35); transition:all .2s;
        position:relative; overflow:hidden;
      }
      .am-submit-btn::before {
        content:''; position:absolute; top:-50%; left:-60%; width:40%; height:200%;
        background:rgba(255,255,255,.12); transform:skewX(-20deg);
        animation:amBtnShine 3s ease-in-out infinite;
      }
      .am-submit-btn:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(124,58,237,.5); }
      @keyframes amBtnShine { 0%,100%{left:-60%} 50%{left:160%} }

      /* ── Rewarded ads section ── */
      .am-rewarded-card {
        background:linear-gradient(135deg,rgba(251,191,36,.08),rgba(245,158,11,.04));
        border:1px solid rgba(251,191,36,.25); border-radius:16px; padding:18px;
        display:flex; align-items:center; gap:16px; margin-bottom:14px;
      }
      .am-rewarded-icon { font-size:2rem; flex-shrink:0; filter:drop-shadow(0 0 8px rgba(251,191,36,.4)); }
      .am-rewarded-info { flex:1; }
      .am-rewarded-title { font-weight:900; font-size:.9rem; color:#fbbf24; margin-bottom:3px; }
      .am-rewarded-desc { font-size:.76rem; color:rgba(245,158,11,.6); line-height:1.4; }
      .am-rewarded-enable {
        background:linear-gradient(135deg,#d97706,#fbbf24); border:none; border-radius:10px;
        padding:8px 16px; color:#1a0800; font-family:'Fredoka One',cursive;
        font-size:.82rem; cursor:pointer; flex-shrink:0; transition:opacity .18s;
      }
      .am-rewarded-enable:hover { opacity:.85; }

      /* ── Promote button (injected on game cards) ── */
      .am-promote-btn {
        display:inline-flex; align-items:center; gap:6px;
        background:linear-gradient(135deg,rgba(167,139,250,.15),rgba(124,58,237,.1));
        border:1px solid rgba(167,139,250,.3); border-radius:99px;
        padding:7px 16px; font-size:.76rem; font-weight:900; color:#c4b5fd;
        cursor:pointer; transition:all .2s; text-decoration:none;
        font-family:'Nunito',sans-serif;
      }
      .am-promote-btn:hover {
        background:linear-gradient(135deg,rgba(167,139,250,.28),rgba(124,58,237,.22));
        border-color:#a78bfa; color:#f0e8ff;
        box-shadow:0 0 16px rgba(124,58,237,.3);
      }

      /* ── Sponsored section on homepage ── */
      .am-sponsored-section {
        margin:32px 0; padding:0;
      }
      .am-sponsored-hd {
        display:flex; align-items:center; gap:12px; margin-bottom:16px;
      }
      .am-sponsored-label {
        display:inline-flex; align-items:center; gap:6px;
        font-size:.68rem; font-weight:900; letter-spacing:1.4px; text-transform:uppercase;
        color:#a78bfa; padding:5px 14px; border-radius:99px;
        background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.22);
      }
      .am-sponsored-line { flex:1; height:1px; background:linear-gradient(90deg,rgba(167,139,250,.25),transparent); }
      .am-sponsored-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
      .am-sponsored-card {
        background:linear-gradient(160deg,rgba(20,10,50,.95),rgba(10,5,28,.97));
        border:1px solid rgba(167,139,250,.18); border-radius:18px; overflow:hidden;
        cursor:pointer; transition:all .25s; position:relative;
      }
      .am-sponsored-card:hover { transform:translateY(-6px); border-color:rgba(167,139,250,.4); box-shadow:0 16px 48px rgba(0,0,0,.6),0 0 30px rgba(124,58,237,.18); }
      .am-sp-thumb {
        height:130px; display:flex; align-items:center; justify-content:center;
        font-size:2.8rem; position:relative; overflow:hidden;
      }
      .am-sp-thumb-bg { position:absolute; inset:0; background-size:200% 200%; animation:amThumbPulse 5s ease infinite; }
      .am-sp-icon { position:relative; z-index:1; filter:drop-shadow(0 0 12px rgba(255,255,255,.3)); }
      .am-sp-tag {
        position:absolute; top:10px; left:10px; z-index:2;
        background:rgba(124,58,237,.85); color:#fff; font-size:.58rem; font-weight:900;
        letter-spacing:.8px; text-transform:uppercase; padding:3px 9px; border-radius:99px;
        backdrop-filter:blur(4px);
      }
      .am-sp-body { padding:12px 14px 14px; }
      .am-sp-title { font-family:'Fredoka One',cursive; font-size:.95rem; color:#f0e8ff; margin-bottom:3px; }
      .am-sp-meta { font-size:.72rem; color:rgba(167,139,250,.5); margin-bottom:10px; }
      .am-sp-cta {
        width:100%; padding:9px; border:none; border-radius:9px;
        background:linear-gradient(135deg,#a78bfa,#7c3aed); color:#fff;
        font-family:'Fredoka One',cursive; font-size:.82rem; cursor:pointer; transition:opacity .18s;
      }
      .am-sp-cta:hover { opacity:.85; }

      /* ── Success toast ── */
      .am-toast {
        position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
        background:rgba(22,197,94,.12); border:1px solid rgba(34,197,94,.35);
        color:#4ade80; border-radius:14px; padding:12px 24px;
        font-size:.86rem; font-weight:800; z-index:99999;
        animation:amToastIn .35s cubic-bezier(.34,1.4,.64,1), amToastOut .35s ease 2.8s forwards;
        backdrop-filter:blur(8px); pointer-events:none;
        box-shadow:0 8px 32px rgba(0,0,0,.5);
      }
      @keyframes amToastIn  { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      @keyframes amToastOut { to{opacity:0;transform:translateX(-50%) translateY(16px)} }
    `;
    document.head.appendChild(s);
  }

  /* ─── Build the main panel HTML ──────────────────────── */
  function buildPanel() {
    const wrap = document.createElement('div');
    wrap.className = 'am-overlay';
    wrap.id = 'am-overlay';
    wrap.innerHTML = `
    <div class="am-panel" id="am-panel">
      <div class="am-header">
        <div class="am-header-icon">📢</div>
        <div>
          <div class="am-header-title">Ad Campaign Manager</div>
          <div class="am-header-sub">Create · Preview · Analyze · Earn Eylux</div>
        </div>
        <button class="am-close-btn" onclick="closeAdsManager()">✕ Close</button>
      </div>
      <div class="am-tabs">
        <button class="am-tab am-tab-active" data-tab="create" onclick="switchAmTab('create')">🚀 Create Campaign</button>
        <button class="am-tab" data-tab="campaigns" onclick="switchAmTab('campaigns')">📋 My Campaigns</button>
        <button class="am-tab" data-tab="analytics" onclick="switchAmTab('analytics')">📊 Analytics</button>
        <button class="am-tab" data-tab="trending" onclick="switchAmTab('trending')">🔥 Trending</button>
        <button class="am-tab" data-tab="safety" onclick="switchAmTab('safety')">🛡️ Safety</button>
      </div>
      <div class="am-body" id="am-body">
        <!-- Populated by switchAmTab() -->
      </div>
    </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { if (e.target === wrap) closeAdsManager(); });
    return wrap;
  }

  /* ─── Tab: Create Campaign ────────────────────────────── */
  function renderCreateTab() {
    const u = getUser();
    const balance = u.coins || 0;
    return `
    <div id="am-create-form">
      <!-- Game info -->
      <div class="am-section-title">🎮 Game Details</div>
      <div class="am-grid-2">
        <div class="am-field">
          <label class="am-label">Game Title *</label>
          <input class="am-input" id="am-game-title" placeholder="e.g. Ninja Dash Pro" maxlength="60" oninput="amUpdatePreview()"/>
        </div>
        <div class="am-field">
          <label class="am-label">Game Genre</label>
          <select class="am-select" id="am-game-genre" onchange="amUpdatePreview()">
            <option value="action">⚔️ Action</option>
            <option value="racing">🏎️ Racing</option>
            <option value="puzzle">🧩 Puzzle</option>
            <option value="adventure">🗺️ Adventure</option>
            <option value="casual">🎲 Casual</option>
            <option value="rpg">⚡ RPG</option>
            <option value="sports">⚽ Sports</option>
          </select>
        </div>
      </div>
      <div class="am-field">
        <label class="am-label">Ad Description</label>
        <textarea class="am-textarea" id="am-game-desc" placeholder="Describe your game in 1-2 sentences — what makes it exciting?" maxlength="200" oninput="amUpdatePreview()"></textarea>
      </div>
      <div class="am-field">
        <label class="am-label">Game URL / Link</label>
        <input class="am-input" id="am-game-link" placeholder="e.g. game.html or my-games.html" maxlength="200"/>
      </div>
      <div class="am-field">
        <label class="am-label">Prize / Incentive (optional)</label>
        <input class="am-input" id="am-game-prize" placeholder="e.g. 5,000 Eylux for top player" maxlength="80"/>
      </div>

      <div class="am-section-title" style="margin-top:22px">🎨 Ad Creatives</div>
      <div class="am-grid-2">
        <div>
          <label class="am-label">Thumbnail / Banner Image</label>
          <div class="am-upload-zone" id="am-thumb-zone">
            <input type="file" class="am-upload-input" id="am-thumb-file" accept="image/*" onchange="amHandleUpload(this,'am-thumb-zone','am-thumb-preview')"/>
            <div class="am-upload-icon">🖼️</div>
            <div class="am-upload-label">Drop image or click to upload</div>
            <div class="am-upload-sub">PNG, JPG, GIF · max 4MB</div>
          </div>
          <div class="am-file-preview" id="am-thumb-preview">
            <span>🖼️</span><span id="am-thumb-name">No file</span>
          </div>
        </div>
        <div>
          <label class="am-label">Trailer Video (optional)</label>
          <div class="am-upload-zone" id="am-video-zone">
            <input type="file" class="am-upload-input" id="am-video-file" accept="video/*,audio/*" onchange="amHandleUpload(this,'am-video-zone','am-video-preview')"/>
            <div class="am-upload-icon">🎥</div>
            <div class="am-upload-label">Upload trailer or audio</div>
            <div class="am-upload-sub">MP4, WebM, MP3 · max 20MB</div>
          </div>
          <div class="am-file-preview" id="am-video-preview">
            <span>🎥</span><span id="am-video-name">No file</span>
          </div>
        </div>
      </div>

      <div class="am-section-title" style="margin-top:22px">📐 Ad Format</div>
      <div class="am-grid-3" id="am-format-grid">
        ${[
          {id:'video',     icon:'🎥', name:'Video Ad',        cost:'1.5x'},
          {id:'banner',    icon:'🖼️', name:'Banner Ad',       cost:'1.0x'},
          {id:'popup',     icon:'✨', name:'Popup Event',     cost:'2.0x'},
          {id:'sidebar',   icon:'📌', name:'Sidebar Ad',      cost:'0.8x'},
          {id:'sponsored', icon:'🎮', name:'Sponsored Card',  cost:'1.2x'},
          {id:'rewarded',  icon:'💎', name:'Rewarded Ad',     cost:'2.5x'},
        ].map(f=>`
        <div class="am-format-card${f.id==='sponsored'?' am-selected':''}" data-format="${f.id}" onclick="amSelectFormat('${f.id}')">
          <div class="am-format-icon">${f.icon}</div>
          <div class="am-format-name">${f.name}</div>
          <div class="am-format-cost">Cost mult: ${f.cost}</div>
        </div>`).join('')}
      </div>

      <div class="am-section-title" style="margin-top:22px">🎯 Target Audience</div>
      <div class="am-audience-grid">
        ${[
          {id:'all',       label:'🌍 All Players'},
          {id:'action',    label:'⚔️ Action'},
          {id:'puzzle',    label:'🧩 Puzzle'},
          {id:'racing',    label:'🏎️ Racing'},
          {id:'adventure', label:'🗺️ Adventure'},
          {id:'casual',    label:'🎲 Casual'},
        ].map((a,i)=>`
        <div class="am-audience-pill${i===0?' am-selected':''}" data-audience="${a.id}" onclick="amSelectAudience('${a.id}')">${a.label}</div>`).join('')}
      </div>

      <div class="am-grid-2" style="margin-top:20px">
        <div class="am-field">
          <label class="am-label">Campaign Duration</label>
          <select class="am-select" id="am-duration" onchange="amUpdateCost()">
            <option value="1d">1 Day</option>
            <option value="3d" selected>3 Days</option>
            <option value="7d">7 Days</option>
            <option value="14d">14 Days</option>
            <option value="30d">30 Days</option>
          </select>
        </div>
        <div class="am-field">
          <label class="am-label">Campaign Name</label>
          <input class="am-input" id="am-camp-name" placeholder="e.g. Summer Launch 2025"/>
        </div>
      </div>

      <!-- Cost preview -->
      <div class="am-cost-bar" id="am-cost-bar">
        <div class="am-cost-icon">💰</div>
        <div>
          <div class="am-cost-label">Campaign Cost (Eylux)</div>
          <div class="am-cost-balance">Your balance: ${balance.toLocaleString()} Eylux</div>
        </div>
        <div>
          <div class="am-cost-value" id="am-cost-value">500</div>
          <div style="font-size:.62rem;font-weight:700;color:rgba(245,158,11,.4);text-align:right">Eylux</div>
        </div>
      </div>

      <!-- Rewarded ads option -->
      <div class="am-rewarded-card">
        <div class="am-rewarded-icon">💎</div>
        <div class="am-rewarded-info">
          <div class="am-rewarded-title">Enable Rewarded Ads</div>
          <div class="am-rewarded-desc">Players earn Eylux for watching your full ad. Earn 5 Eylux per view when players join your game through a rewarded ad.</div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;flex-shrink:0">
          <input type="checkbox" id="am-rewarded-toggle" style="accent-color:#a78bfa;width:16px;height:16px"/>
          <span style="font-size:.76rem;font-weight:800;color:rgba(167,139,250,.7)">Enable</span>
        </label>
      </div>

      <!-- Live preview -->
      <div class="am-section-title">👁️ Live Preview</div>
      <div class="am-preview-wrap">
        <div class="am-preview-ad-card" id="am-preview-card">
          <div class="am-preview-thumb" id="am-preview-thumb">
            <div class="am-preview-thumb-bg" id="am-preview-bg" style="--am-c1:#5b21b6;--am-c2:#7c3aed;--am-c3:#a855f7"></div>
            <span style="position:relative;z-index:1;font-size:3rem" id="am-preview-icon">🎮</span>
          </div>
          <div class="am-preview-body">
            <div class="am-preview-badge" id="am-preview-badge">SPONSORED</div>
            <div class="am-preview-title" id="am-preview-title">Your Game Title</div>
            <div class="am-preview-desc" id="am-preview-desc">Your game description will appear here. Make it exciting!</div>
            <button class="am-preview-cta" id="am-preview-cta">🎮 Play Now</button>
          </div>
        </div>
        <div style="text-align:center;margin-top:10px;font-size:.7rem;font-weight:700;color:rgba(167,139,250,.35)">This is how your ad will appear to players</div>
      </div>

      <div style="display:flex;gap:10px;margin-top:4px">
        <button class="am-submit-btn" onclick="amSubmitCampaign()" style="flex:1">🚀 Launch Campaign</button>
      </div>
      <div style="text-align:center;margin-top:10px">
        <span class="am-safety-chip">🛡️ All ads are reviewed within 24h before going live</span>
      </div>
    </div>`;
  }

  /* ─── Tab: My Campaigns ───────────────────────────────── */
  function renderCampaignsTab() {
    const camps = getCampaigns();
    if (!camps.length) {
      return `<div style="text-align:center;padding:48px 24px">
        <div style="font-size:3rem;margin-bottom:12px">📢</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#e0d4ff;margin-bottom:6px">No campaigns yet</div>
        <div style="font-size:.8rem;color:rgba(167,139,250,.45);font-weight:600;margin-bottom:20px">Create your first ad campaign and reach thousands of players!</div>
        <button onclick="switchAmTab('create')" style="background:linear-gradient(135deg,#a78bfa,#7c3aed);border:none;border-radius:12px;padding:12px 24px;color:#fff;font-family:'Fredoka One',cursive;font-size:.9rem;cursor:pointer">🚀 Create Campaign</button>
      </div>`;
    }
    return `
    <div class="am-section-title">📋 Your Ad Campaigns (${camps.length})</div>
    <div id="am-camps-list">
    ${camps.map(c => {
      const a = getAnalytics(c.id);
      return `
      <div class="am-camp-item" id="camp_${c.id}">
        <div class="am-camp-icon">${c.icon||'🎮'}</div>
        <div class="am-camp-info">
          <div class="am-camp-name">${escHtml(c.name||c.gameTitle)}</div>
          <div class="am-camp-meta">${c.format||'sponsored'} · ${c.audience||'all'} · ${c.duration||'3d'} · 👁 ${fmtN(a.views)} · 🖱 ${fmtN(a.clicks)} · 🎮 ${fmtN(a.joins)}</div>
        </div>
        <span class="am-camp-status ${c.status||'pending'}">${c.status||'pending'}</span>
        <div class="am-camp-actions">
          <button class="am-camp-btn" onclick="amViewAnalytics('${c.id}')">📊</button>
          <button class="am-camp-btn am-btn-danger" onclick="amDeleteCamp('${c.id}')">🗑</button>
        </div>
      </div>`;
    }).join('')}
    </div>`;
  }

  /* ─── Tab: Analytics ──────────────────────────────────── */
  function renderAnalyticsTab(campId) {
    const camps = getCampaigns();
    if (!camps.length) {
      return `<div style="text-align:center;padding:48px"><div style="font-size:2rem;margin-bottom:10px">📊</div><div style="color:rgba(167,139,250,.4);font-weight:700">No campaigns to analyze yet.</div></div>`;
    }
    const selected = campId || camps[0]?.id;
    const camp = camps.find(c=>c.id===selected) || camps[0];
    const a = getAnalytics(camp.id);
    const ctr  = a.views > 0 ? ((a.clicks/a.views)*100).toFixed(1) : '0.0';
    const cr   = a.clicks > 0 ? ((a.joins/a.clicks)*100).toFixed(1) : '0.0';
    const ret  = a.retention ? a.retention.toFixed(1) : '0.0';
    const earn = Math.floor(a.joins * 5);

    /* Simulated 7-day bars */
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const maxV = Math.max(1, a.views);
    const barData = days.map((_,i) => Math.round(a.views * (0.05 + Math.random()*0.2)));
    const barMax = Math.max(...barData, 1);

    return `
    <div id="am-live-analytics" data-camp-id="${camp.id}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <div class="am-section-title" style="margin:0">📊 Analytics</div>
        <select class="am-select" style="max-width:200px;padding:7px 12px;font-size:.8rem" onchange="amSwitchAnalytics(this.value)">
          ${camps.map(c=>`<option value="${c.id}"${c.id===camp.id?' selected':''}>${escHtml(c.name||c.gameTitle)}</option>`).join('')}
        </select>
        <span class="am-camp-status ${camp.status||'pending'}" style="margin-left:auto">${camp.status||'pending'}</span>
      </div>

      <div class="am-analytics-grid">
        <div class="am-stat-card"><div class="am-stat-icon">👁️</div><div class="am-stat-val">${fmtN(a.views)}</div><div class="am-stat-lbl">Views</div></div>
        <div class="am-stat-card"><div class="am-stat-icon">🖱️</div><div class="am-stat-val">${fmtN(a.clicks)}</div><div class="am-stat-lbl">Clicks</div></div>
        <div class="am-stat-card"><div class="am-stat-icon">🎮</div><div class="am-stat-val">${fmtN(a.joins)}</div><div class="am-stat-lbl">Joins</div></div>
        <div class="am-stat-card"><div class="am-stat-icon">❤️</div><div class="am-stat-val">${fmtN(a.likes)}</div><div class="am-stat-lbl">Likes</div></div>
        <div class="am-stat-card"><div class="am-stat-icon">📈</div><div class="am-stat-val">${ctr}%</div><div class="am-stat-lbl">CTR</div></div>
        <div class="am-stat-card"><div class="am-stat-icon">✅</div><div class="am-stat-val">${cr}%</div><div class="am-stat-lbl">Conversion</div></div>
        <div class="am-stat-card"><div class="am-stat-icon">⏱️</div><div class="am-stat-val">${ret}%</div><div class="am-stat-lbl">Retention</div></div>
        <div class="am-stat-card" style="border-color:rgba(251,191,36,.25);background:rgba(251,191,36,.06)"><div class="am-stat-icon">💰</div><div class="am-stat-val" style="color:#fbbf24">${fmtN(earn)}</div><div class="am-stat-lbl">Earned</div></div>
      </div>

      <div class="am-chart-wrap">
        <div class="am-chart-title">📆 Views — Last 7 Days</div>
        <div class="am-chart" id="am-bar-chart">
          ${barData.map((v,i)=>`
          <div class="am-bar" data-val="${v} views"
               style="height:${Math.max(6, (v/barMax)*100)}%;
               background:linear-gradient(180deg,${i>=5?'#f59e0b':'#a78bfa'},${i>=5?'#d97706':'#7c3aed'})">
          </div>`).join('')}
        </div>
        <div class="am-chart-labels">${days.map(d=>`<div class="am-chart-lbl">${d}</div>`).join('')}</div>
      </div>

      <div class="am-chart-wrap">
        <div class="am-chart-title">⚡ Real-Time Activity</div>
        <svg class="am-trend-svg" viewBox="0 0 300 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="amTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#a78bfa"/>
              <stop offset="100%" style="stop-color:#38bdf8"/>
            </linearGradient>
            <linearGradient id="amAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(167,139,250,.25)"/>
              <stop offset="100%" style="stop-color:rgba(167,139,250,0)"/>
            </linearGradient>
          </defs>
          ${buildTrendPath(a.views)}
        </svg>
      </div>

      <div class="am-section-title">💡 Recommendations</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          ctr < 2   ? '📢 Your CTR is low. Try a more eye-catching title or thumbnail.' : '✅ Great CTR! Players are clicking on your ad.',
          cr  < 5   ? '🎯 Low conversion. Make sure your game link works and the description matches expectations.' : '🎉 Excellent conversion rate!',
          a.views < 100 ? '⏳ Your ad is still gaining momentum. Reach grows exponentially after the first 200 views.' : '🚀 Your ad is performing well!',
        ].map(tip=>`<div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.12);border-radius:10px;padding:10px 14px;font-size:.8rem;font-weight:700;color:rgba(167,139,250,.75)">${tip}</div>`).join('')}
      </div>
    </div>`;
  }

  function buildTrendPath(views) {
    const pts = Array.from({length:10}, (_,i) => {
      const x = (i/9)*280 + 10;
      const noise = (Math.sin(i*2.3)+Math.cos(i*1.7))*8;
      const base = 55 - (views>0 ? Math.min(45,views/20) : 0);
      const y = Math.max(5, Math.min(55, base + noise));
      return `${x},${y}`;
    });
    const d = 'M ' + pts.join(' L ');
    const area = d + ` L 290,60 L 10,60 Z`;
    return `<path class="am-trend-area" d="${area}"/>
            <path class="am-trend-path" d="${d}"/>`;
  }

  /* ─── Tab: Trending ───────────────────────────────────── */
  function renderTrendingTab() {
    const trending = [
      {icon:'🥷',name:'Ninja Dash',views:142300,link:'game.html',c1:'#0c1829',c2:'#38bdf8'},
      {icon:'🏎️',name:'Neon Racer',views:98700,link:'game3d-city.html',c1:'#1a0033',c2:'#c084fc'},
      {icon:'🌊',name:'Ocean Cleanup',views:73900,link:'game3d-pirate.html',c1:'#0c2340',c2:'#60a5fa'},
      {icon:'🧱',name:'Block Stacker',views:54200,link:'game3d-obby.html',c1:'#052e16',c2:'#34d399'},
      {icon:'💎',name:'Crystal Catcher',views:42100,link:'game.html',c1:'#1a0040',c2:'#e879f9'},
    ];
    return `
    <div class="am-section-title">🔥 Trending Ads This Week</div>
    <div class="am-trending-row">
      ${trending.map((g,i)=>`
      <div class="am-trending-card" onclick="window.location.href='${g.link}'" title="Play ${g.name}">
        <div class="am-trending-thumb" style="background:linear-gradient(135deg,${g.c1},${g.c2})">
          <span style="font-size:2.2rem;filter:drop-shadow(0 0 8px rgba(255,255,255,.3))">${g.icon}</span>
          <span style="position:absolute;top:6px;right:8px;font-size:.58rem;font-weight:900;color:#fbbf24">#${i+1}</span>
        </div>
        <div class="am-trending-body">
          <div class="am-trending-name">${g.name}</div>
          <div class="am-trending-stat">👁 ${fmtN(g.views)} views</div>
        </div>
      </div>`).join('')}
    </div>

    <div class="am-section-title" style="margin-top:24px">💎 Top Earning Creators</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${['StarCraft99','NeonWolf','ArcadeKing','PixelMage','SpeedRunX'].map((name,i)=>`
      <div style="display:flex;align-items:center;gap:12px;background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px;padding:10px 14px">
        <span style="font-family:'Fredoka One',cursive;font-size:.9rem;color:rgba(167,139,250,.4);min-width:24px">#${i+1}</span>
        <span style="font-size:1.2rem">${['🥇','🥈','🥉','🏅','⭐'][i]}</span>
        <span style="flex:1;font-weight:800;font-size:.86rem;color:#e0d4ff">${name}</span>
        <span style="font-size:.78rem;font-weight:800;color:#fbbf24">💰 ${fmtN(randomInt(8000,50000))} Eylux</span>
      </div>`).join('')}
    </div>

    <div class="am-section-title" style="margin-top:24px">🚀 Boost Your Ad</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      ${[
        {name:'Quick Boost',price:100,desc:'2x visibility for 24h',icon:'⚡'},
        {name:'Trending Push',price:300,desc:'Feature in Trending section',icon:'🔥'},
        {name:'Homepage Hero',price:800,desc:'Banner on the homepage',icon:'🏆'},
      ].map(b=>`
      <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15);border-radius:14px;padding:14px;text-align:center">
        <div style="font-size:1.5rem;margin-bottom:6px">${b.icon}</div>
        <div style="font-weight:900;font-size:.82rem;color:#e0d4ff;margin-bottom:3px">${b.name}</div>
        <div style="font-size:.7rem;color:rgba(167,139,250,.5);margin-bottom:10px">${b.desc}</div>
        <button onclick="amBuyBoost('${b.name}',${b.price})" style="width:100%;background:linear-gradient(135deg,#d97706,#fbbf24);border:none;border-radius:8px;padding:7px;color:#1a0800;font-family:'Fredoka One',cursive;font-size:.78rem;cursor:pointer">💰 ${b.price} Eylux</button>
      </div>`).join('')}
    </div>`;
  }

  /* ─── Tab: Safety ─────────────────────────────────────── */
  function renderSafetyTab() {
    return `
    <div class="am-section-title">🛡️ Ad Safety System</div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">
      ${[
        {icon:'✅',title:'Auto Content Review',desc:'All ads are scanned by AI for inappropriate content, misleading claims, and scam patterns before going live.'},
        {icon:'🔍',title:'Manual Review Queue',desc:'New creator accounts have their first 3 campaigns manually reviewed by our safety team within 24 hours.'},
        {icon:'🚫',title:'Anti-Spam Protection',desc:'Rate limiting prevents the same ad from being shown to the same player twice within 2 hours.'},
        {icon:'🎯',title:'Fake Game Detection',desc:'Our system checks that your game link works and matches the genre you selected.'},
        {icon:'🚨',title:'Report System',desc:'Players can report any ad with the Report button. 3 reports trigger an immediate review.'},
      ].map(r=>`
      <div style="display:flex;gap:14px;background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:14px;padding:14px">
        <div style="font-size:1.5rem;flex-shrink:0">${r.icon}</div>
        <div><div style="font-weight:900;font-size:.86rem;color:#e0d4ff;margin-bottom:3px">${r.title}</div><div style="font-size:.76rem;color:rgba(167,139,250,.55);line-height:1.5">${r.desc}</div></div>
      </div>`).join('')}
    </div>

    <div class="am-section-title">📋 Content Guidelines</div>
    <div style="background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.1);border-radius:14px;padding:16px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.78rem;font-weight:700">
        <div style="color:#4ade80">✅ Allowed</div>
        <div style="color:#f87171">❌ Not Allowed</div>
        ${[
          ['Real game screenshots','Fake gameplay footage'],
          ['Accurate descriptions','Misleading rewards'],
          ['Age-appropriate content','Adult/violent content'],
          ['Real prize amounts','Fake giveaway scams'],
          ['Your own original game','Copying other games'],
        ].flatMap(([ok,nok])=>[
          `<div style="color:rgba(74,222,128,.7)">• ${ok}</div>`,
          `<div style="color:rgba(248,113,113,.7)">• ${nok}</div>`,
        ]).join('')}
      </div>
    </div>

    <div class="am-section-title" style="margin-top:20px">📊 Your Safety Score</div>
    <div style="background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2);border-radius:14px;padding:16px;text-align:center">
      <div style="font-family:'Fredoka One',cursive;font-size:2.4rem;color:#4ade80;margin-bottom:4px">100</div>
      <div style="font-size:.78rem;font-weight:800;color:rgba(74,222,128,.6)">Perfect Safety Score</div>
      <div style="font-size:.72rem;color:rgba(167,139,250,.45);margin-top:4px">No violations · All campaigns clean</div>
    </div>`;
  }

  /* ─── Interactions ────────────────────────────────────── */
  window.switchAmTab = function(tab) {
    document.querySelectorAll('.am-tab').forEach(t => t.classList.toggle('am-tab-active', t.dataset.tab === tab));
    const body = document.getElementById('am-body');
    if (!body) return;
    switch(tab) {
      case 'create':    body.innerHTML = renderCreateTab();    amUpdateCost(); break;
      case 'campaigns': body.innerHTML = renderCampaignsTab(); break;
      case 'analytics': body.innerHTML = renderAnalyticsTab(); break;
      case 'trending':  body.innerHTML = renderTrendingTab();  break;
      case 'safety':    body.innerHTML = renderSafetyTab();    break;
    }
  };

  window.amSelectFormat = function(id) {
    document.querySelectorAll('.am-format-card').forEach(c => c.classList.toggle('am-selected', c.dataset.format === id));
    amUpdateCost();
  };

  window.amSelectAudience = function(id) {
    document.querySelectorAll('.am-audience-pill').forEach(p => p.classList.toggle('am-selected', p.dataset.audience === id));
    amUpdateCost();
  };

  window.amUpdateCost = function() {
    const duration = document.getElementById('am-duration')?.value || '3d';
    const format   = document.querySelector('.am-format-card.am-selected')?.dataset.format || 'sponsored';
    const audience = document.querySelector('.am-audience-pill.am-selected')?.dataset.audience || 'all';
    const cost = calcCost(duration, format, audience);
    const el = document.getElementById('am-cost-value');
    if (el) el.textContent = cost.toLocaleString();
    const u = getUser();
    const balEl = document.querySelector('.am-cost-balance');
    if (balEl) balEl.textContent = `Your balance: ${(u.coins||0).toLocaleString()} Eylux`;
  };

  window.amUpdatePreview = function() {
    const title   = document.getElementById('am-game-title')?.value.trim() || 'Your Game Title';
    const desc    = document.getElementById('am-game-desc')?.value.trim()  || 'Your game description will appear here.';
    const genre   = document.getElementById('am-game-genre')?.value || 'action';
    const GENRE_ICONS = {action:'⚔️',racing:'🏎️',puzzle:'🧩',adventure:'🗺️',casual:'🎲',rpg:'⚡',sports:'⚽'};
    const GENRE_COLORS = {
      action:['#0c1829','#1e3a5f','#38bdf8'],
      racing:['#1a0033','#4c1d95','#c084fc'],
      puzzle:['#052e16','#065f46','#34d399'],
      adventure:['#0c2340','#1e4976','#60a5fa'],
      casual:['#1a1a00','#3d3a00','#fbbf24'],
      rpg:['#1a0030','#3b0080','#c084fc'],
      sports:['#002010','#004a20','#4ade80'],
    };
    const [c1,c2,c3] = GENRE_COLORS[genre] || GENRE_COLORS.action;
    const icon = GENRE_ICONS[genre] || '🎮';

    const titleEl = document.getElementById('am-preview-title');
    const descEl  = document.getElementById('am-preview-desc');
    const iconEl  = document.getElementById('am-preview-icon');
    const bgEl    = document.getElementById('am-preview-bg');
    if (titleEl) titleEl.textContent = title;
    if (descEl)  descEl.textContent  = desc.length > 100 ? desc.slice(0,100)+'…' : desc;
    if (iconEl)  iconEl.textContent  = icon;
    if (bgEl)    bgEl.style.cssText  = `--am-c1:${c1};--am-c2:${c2};--am-c3:${c3};position:absolute;inset:0;background:linear-gradient(135deg,${c1},${c2},${c3});background-size:200% 200%;animation:amThumbPulse 4s ease infinite`;
  };

  window.amHandleUpload = function(input, zoneId, previewId) {
    const zone    = document.getElementById(zoneId);
    const preview = document.getElementById(previewId);
    const file    = input.files[0];
    if (!file) return;
    if (zone)    zone.classList.add('has-file');
    if (preview) {
      preview.classList.add('show');
      const nameEl = preview.querySelector('span:last-child');
      if (nameEl) nameEl.textContent = file.name + ' (' + (file.size/1024/1024).toFixed(1)+'MB)';
    }
  };

  window.amSubmitCampaign = function() {
    const title    = document.getElementById('am-game-title')?.value.trim();
    const desc     = document.getElementById('am-game-desc')?.value.trim();
    const link     = document.getElementById('am-game-link')?.value.trim();
    const duration = document.getElementById('am-duration')?.value || '3d';
    const format   = document.querySelector('.am-format-card.am-selected')?.dataset.format || 'sponsored';
    const audience = document.querySelector('.am-audience-pill.am-selected')?.dataset.audience || 'all';
    const campName = document.getElementById('am-camp-name')?.value.trim() || title;
    const rewarded = document.getElementById('am-rewarded-toggle')?.checked || false;
    const genre    = document.getElementById('am-game-genre')?.value || 'action';

    if (!title) { amToast('❌ Please enter a game title', 'error'); return; }
    if (!desc)  { amToast('❌ Please add a description', 'error'); return; }
    if (!link)  { amToast('❌ Please add a game link', 'error'); return; }

    const cost = calcCost(duration, format, audience);
    const u    = getUser();
    if ((u.coins||0) < cost) {
      amToast(`❌ Not enough Eylux. Need ${cost.toLocaleString()}, you have ${(u.coins||0).toLocaleString()}`, 'error');
      return;
    }

    /* Deduct cost */
    u.coins = (u.coins||0) - cost;
    saveUser(u);

    /* Save campaign */
    const GENRE_ICONS = {action:'⚔️',racing:'🏎️',puzzle:'🧩',adventure:'🗺️',casual:'🎲',rpg:'⚡',sports:'⚽'};
    const camp = {
      id:       'camp_' + Date.now(),
      name:     campName || title,
      gameTitle:title,
      desc, link, duration, format, audience, genre,
      rewarded, cost,
      icon:     GENRE_ICONS[genre]||'🎮',
      status:   'pending',
      created:  Date.now(),
    };
    const camps = getCampaigns();
    camps.unshift(camp);
    saveCampaigns(camps);
    saveAnalytics(camp.id, { views:0, clicks:0, joins:0, likes:0, retention:0 });

    /* Simulate pending → live after 2s */
    setTimeout(() => {
      const c2 = getCampaigns();
      const found = c2.find(c => c.id === camp.id);
      if (found) { found.status = 'live'; saveCampaigns(c2); }
      injectSponsoredSection();
    }, 2000);

    amToast('🚀 Campaign submitted! Review within 24h.');
    switchAmTab('campaigns');
  };

  window.amDeleteCamp = function(id) {
    if (!confirm('Delete this campaign?')) return;
    const camps = getCampaigns().filter(c => c.id !== id);
    saveCampaigns(camps);
    switchAmTab('campaigns');
  };

  window.amViewAnalytics = function(id) {
    switchAmTab('analytics');
    document.getElementById('am-body').innerHTML = renderAnalyticsTab(id);
  };

  window.amSwitchAnalytics = function(id) {
    document.getElementById('am-body').innerHTML = renderAnalyticsTab(id);
  };

  window.amBuyBoost = function(name, price) {
    const u = getUser();
    if ((u.coins||0) < price) { amToast(`❌ Need ${price} Eylux for ${name}`, 'error'); return; }
    u.coins -= price;
    saveUser(u);
    amToast(`⚡ ${name} activated! Your ad visibility is boosted.`);
  };

  window.renderLiveChart = function(campId) {
    const body = document.getElementById('am-body');
    if (!body) return;
    body.innerHTML = renderAnalyticsTab(campId);
  };

  function amToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'am-toast';
    t.textContent = msg;
    if (type === 'error') { t.style.background='rgba(239,68,68,.12)'; t.style.borderColor='rgba(239,68,68,.35)'; t.style.color='#f87171'; }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3300);
  }

  /* ─── Open / Close ────────────────────────────────────── */
  window.openAdsManager = function(gameTitle) {
    injectCSS();
    let overlay = document.getElementById('am-overlay');
    if (!overlay) overlay = buildPanel();
    overlay.classList.add('open');
    switchAmTab('create');
    if (gameTitle) {
      setTimeout(() => {
        const inp = document.getElementById('am-game-title');
        if (inp) { inp.value = gameTitle; amUpdatePreview(); }
      }, 50);
    }
  };

  window.closeAdsManager = function() {
    const overlay = document.getElementById('am-overlay');
    if (overlay) overlay.classList.remove('open');
  };

  /* ─── Promote button injection ────────────────────────── */
  function injectPromoteButtons() {
    /* Inject on my-games / dev-hub game cards if they have data-game-title */
    document.querySelectorAll('[data-game-title]').forEach(card => {
      if (card.querySelector('.am-promote-btn')) return;
      const title = card.dataset.gameTitle || '';
      const btn = document.createElement('button');
      btn.className = 'am-promote-btn';
      btn.innerHTML = '📢 Promote Game';
      btn.onclick = () => openAdsManager(title);
      card.appendChild(btn);
    });
  }

  /* ─── Sponsored section on homepage ──────────────────── */
  function injectSponsoredSection() {
    const campaigns = getCampaigns().filter(c => c.status === 'live');
    if (!campaigns.length) return;

    /* Remove existing sponsored section */
    const existing = document.getElementById('am-sponsored-section');
    if (existing) existing.remove();

    const GENRE_COLORS = {
      action:['#0c1829','#38bdf8'],racing:['#1a0033','#c084fc'],
      puzzle:['#052e16','#34d399'],adventure:['#0c2340','#60a5fa'],
      casual:['#1a1a00','#fbbf24'],rpg:['#1a0030','#c084fc'],sports:['#002010','#4ade80'],
    };

    const cards = campaigns.slice(0,4).map(c => {
      const [c1,c2] = GENRE_COLORS[c.genre]||['#1a0030','#a78bfa'];
      const a = getAnalytics(c.id);
      return `
      <div class="am-sponsored-card" onclick="if('${c.link}') window.location.href='${c.link}'">
        <div class="am-sp-thumb" style="background:linear-gradient(135deg,${c1},${c2})">
          <div class="am-sp-thumb-bg" style="background:linear-gradient(135deg,${c1},${c2})"></div>
          <span class="am-sp-icon">${c.icon||'🎮'}</span>
          <span class="am-sp-tag">SPONSORED</span>
        </div>
        <div class="am-sp-body">
          <div class="am-sp-title">${escHtml(c.gameTitle||c.name)}</div>
          <div class="am-sp-meta">👁 ${fmtN(a.views)} views · 🎮 ${fmtN(a.joins)} joined</div>
          <button class="am-sp-cta" onclick="event.stopPropagation();if('${c.link}')window.location.href='${c.link}'">▶ Play Now</button>
        </div>
      </div>`;
    }).join('');

    const section = document.createElement('div');
    section.id = 'am-sponsored-section';
    section.className = 'am-sponsored-section';
    section.innerHTML = `
      <div class="am-sponsored-hd">
        <span class="am-sponsored-label">✨ Sponsored Games</span>
        <div class="am-sponsored-line"></div>
      </div>
      <div class="am-sponsored-cards">${cards}</div>`;

    /* Insert after the first major section on the page */
    const anchor = document.querySelector('.lp-stats-bar, .section-heading, .game-grid, main section');
    if (anchor) anchor.after(section);
    else document.querySelector('.main-content, .content, main')?.prepend(section);

    /* Bind click analytics */
    section.querySelectorAll('.am-sponsored-card').forEach(card => {
      card.addEventListener('click', () => {
        /* Find matching campaign */
        const title = card.querySelector('.am-sp-title')?.textContent;
        const camp  = campaigns.find(c => (c.gameTitle||c.name) === title);
        if (camp) {
          const a = getAnalytics(camp.id);
          a.clicks++;
          a.joins++;
          saveAnalytics(camp.id, a);
        }
      });
    });
  }

  /* ─── "Advertise Game" button on creator dashboard ────── */
  function injectAdvertiseCTA() {
    const page = document.body.dataset.page || document.location.pathname;
    const isCreatorPage = /my-games|dev-hub|ai\.html/.test(page + document.location.pathname);
    if (!isCreatorPage) return;

    if (document.getElementById('am-creator-cta')) return;
    const wrap = document.createElement('div');
    wrap.id = 'am-creator-cta';
    wrap.style.cssText = 'position:fixed;bottom:90px;right:24px;z-index:9000';
    wrap.innerHTML = `
      <button onclick="openAdsManager()" style="
        display:flex;align-items:center;gap:8px;
        background:linear-gradient(135deg,#a78bfa,#7c3aed);
        border:none;border-radius:99px;padding:12px 20px;
        color:#fff;font-family:'Fredoka One',cursive;font-size:.9rem;
        cursor:pointer;box-shadow:0 6px 24px rgba(124,58,237,.5);
        transition:all .2s;
      " onmouseover="this.style.transform='translateY(-2px) scale(1.04)';this.style.boxShadow='0 10px 32px rgba(124,58,237,.7)'"
        onmouseout="this.style.transform='';this.style.boxShadow='0 6px 24px rgba(124,58,237,.5)'">
        📢 Advertise Game
      </button>`;
    document.body.appendChild(wrap);
  }

  /* ─── Init ────────────────────────────────────────────── */
  function init() {
    injectCSS();
    injectSponsoredSection();
    injectAdvertiseCTA();
    injectPromoteButtons();
    /* Re-inject after dynamic content loads */
    setTimeout(() => { injectSponsoredSection(); injectPromoteButtons(); }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.EyloxAdsManager = { open: openAdsManager, close: closeAdsManager };

})();
