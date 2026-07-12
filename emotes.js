/* ============================================================
   EYLOX — Emotes & Reactions System v1.0
   - Floating emote picker overlay
   - Animated emote bubbles in-page
   - Global reaction feed
   - Quick-access emote bar
   ============================================================ */
'use strict';

(function EyloxEmotes() {

  /* ── Emote catalogue ── */
  const EMOTES = [
    { id:'wave',     emoji:'👋', label:'Wave',      sound:440 },
    { id:'love',     emoji:'❤️', label:'Love',      sound:523 },
    { id:'lol',      emoji:'😂', label:'LOL',       sound:660 },
    { id:'wow',      emoji:'😮', label:'Wow',       sound:587 },
    { id:'gg',       emoji:'🏆', label:'GG',        sound:784 },
    { id:'fire',     emoji:'🔥', label:'Fire',      sound:698 },
    { id:'clap',     emoji:'👏', label:'Clap',      sound:440 },
    { id:'skull',    emoji:'💀', label:'Skull',     sound:262 },
    { id:'flex',     emoji:'💪', label:'Flex',      sound:523 },
    { id:'dance',    emoji:'🕺', label:'Dance',     sound:659 },
    { id:'crown',    emoji:'👑', label:'Crown',     sound:880 },
    { id:'rocket',   emoji:'🚀', label:'Rocket',   sound:784 },
    { id:'coin',     emoji:'🪙', label:'Rich',      sound:1047 },
    { id:'sword',    emoji:'⚔️', label:'Fight',    sound:330 },
    { id:'sparkles', emoji:'✨', label:'Sparkle',  sound:1047 },
    { id:'100',      emoji:'💯', label:'100',       sound:880 },
    { id:'nerd',     emoji:'🤓', label:'Nerd',      sound:523 },
    { id:'sunglasses',emoji:'😎',label:'Cool',      sound:659 },
    { id:'salute',   emoji:'🫡', label:'Salute',   sound:440 },
    { id:'ez',       emoji:'🍀', label:'EZ',        sound:784 },
  ];

  /* ── Recent / favourite tracking ── */
  function getRecent() {
    try { return JSON.parse(localStorage.getItem('eylox_recent_emotes') || '[]'); } catch { return []; }
  }
  function addRecent(id) {
    const r = [id, ...getRecent().filter(x => x !== id)].slice(0, 6);
    localStorage.setItem('eylox_recent_emotes', JSON.stringify(r));
  }

  /* ── Emote sound ── */
  function playEmoteSound(freq) {
    try {
      const s = localStorage.getItem('eylox_settings');
      if (s && JSON.parse(s).muteAll) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 400);
    } catch {}
  }

  /* ── Floating bubble animation ── */
  const _bubbles = [];
  function spawnBubble(emoji, targetEl) {
    const bubble = document.createElement('div');
    bubble.className = 'eylox-emote-bubble';
    bubble.textContent = emoji;
    /* Position near target element or center-screen */
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    const randX = (Math.random() - 0.5) * 80;
    bubble.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;
      font-size:${1.8 + Math.random() * 1.2}rem;
      pointer-events:none;z-index:99990;
      animation:emoteBubble ${1.2 + Math.random() * .8}s ease-out forwards;
      --rx:${randX}px;
      transform-origin:center bottom;
    `;
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2200);
  }

  /* ── Inject CSS ── */
  function injectCSS() {
    if (document.getElementById('eylox-emotes-css')) return;
    const s = document.createElement('style');
    s.id = 'eylox-emotes-css';
    s.textContent = `
      @keyframes emoteBubble {
        0%   { transform:translateY(0) translateX(0) scale(.5); opacity:1; }
        60%  { transform:translateY(-80px) translateX(var(--rx,0)) scale(1.1); opacity:1; }
        100% { transform:translateY(-160px) translateX(calc(var(--rx,0)*1.5)) scale(.7); opacity:0; }
      }
      @keyframes emotePickerIn {
        from { opacity:0; transform:translateY(12px) scale(.94); }
        to   { opacity:1; transform:none; }
      }
      @keyframes emoteBarIn {
        from { opacity:0; transform:translateX(-50%) translateY(8px); }
        to   { opacity:1; transform:translateX(-50%) translateY(0); }
      }

      /* Picker panel */
      #eylox-emote-picker {
        position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        z-index:9998;background:rgba(10,3,28,.96);
        backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
        border:1px solid rgba(167,139,250,.25);border-radius:18px;
        padding:14px;width:320px;
        box-shadow:0 16px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04);
        animation:emotePickerIn .25s cubic-bezier(.34,1.56,.64,1) both;
        display:none;
      }
      #eylox-emote-picker.open { display:block; }
      .ep-title { font-size:.68rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px; }
      .ep-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:6px; }
      .ep-btn {
        display:flex;flex-direction:column;align-items:center;gap:3px;
        padding:8px 4px;border-radius:10px;cursor:pointer;
        background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.1);
        transition:all .15s;
      }
      .ep-btn:hover { background:rgba(167,139,250,.2);border-color:rgba(167,139,250,.4);transform:scale(1.12); }
      .ep-btn:active { transform:scale(.95); }
      .ep-emoji { font-size:1.5rem;line-height:1; }
      .ep-label { font-size:.55rem;font-weight:800;color:rgba(200,190,230,.45);text-align:center; }

      /* Quick bar */
      #eylox-emote-bar {
        position:fixed;bottom:70px;left:50%;transform:translateX(-50%);
        z-index:9997;display:flex;gap:6px;
        background:rgba(10,3,28,.88);backdrop-filter:blur(16px);
        border:1px solid rgba(167,139,250,.18);border-radius:99px;
        padding:6px 10px;
        animation:emoteBarIn .3s ease both;
        display:none;
      }
      #eylox-emote-bar.visible { display:flex; }
      .ebar-btn {
        width:38px;height:38px;border-radius:50%;
        background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.15);
        cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;
        transition:transform .15s,background .15s;
      }
      .ebar-btn:hover { background:rgba(167,139,250,.25);transform:scale(1.2); }
      .ebar-btn.ebar-open { background:rgba(167,139,250,.2);border-color:rgba(167,139,250,.4); }

      /* Reaction feed strip */
      #eylox-reaction-feed {
        position:fixed;right:16px;bottom:120px;z-index:9996;
        display:flex;flex-direction:column-reverse;gap:6px;
        pointer-events:none;width:180px;
      }
      .rfeed-item {
        background:rgba(10,3,28,.85);backdrop-filter:blur(10px);
        border:1px solid rgba(167,139,250,.2);border-radius:99px;
        padding:4px 12px 4px 8px;display:flex;align-items:center;gap:7px;
        font-size:.78rem;font-weight:800;color:rgba(200,190,230,.8);
        animation:rfeedIn .3s ease both;
        white-space:nowrap;overflow:hidden;
      }
      @keyframes rfeedIn { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none} }
      .rfeed-emoji { font-size:1.1rem; }
    `;
    document.head.appendChild(s);
  }

  /* ── Build picker HTML ── */
  function buildPicker() {
    const picker = document.createElement('div');
    picker.id    = 'eylox-emote-picker';
    const recents = getRecent().map(id => EMOTES.find(e => e.id === id)).filter(Boolean);
    const html = [];
    if (recents.length) {
      html.push(`<div class="ep-title">⏱ Recent</div><div class="ep-grid" style="margin-bottom:10px">${recents.map(e => `<div class="ep-btn" onclick="EyloxEmotes.sendEmote('${e.id}',this)"><span class="ep-emoji">${e.emoji}</span><span class="ep-label">${e.label}</span></div>`).join('')}</div>`);
    }
    html.push(`<div class="ep-title">All Emotes</div><div class="ep-grid">${EMOTES.map(e => `<div class="ep-btn" onclick="EyloxEmotes.sendEmote('${e.id}',this)"><span class="ep-emoji">${e.emoji}</span><span class="ep-label">${e.label}</span></div>`).join('')}</div>`);
    picker.innerHTML = html.join('');
    return picker;
  }

  /* ── Build quick bar ── */
  function buildBar() {
    const bar    = document.createElement('div');
    bar.id       = 'eylox-emote-bar';
    const qEmotes = EMOTES.slice(0, 6);
    bar.innerHTML = qEmotes.map(e => `<div class="ebar-btn" onclick="EyloxEmotes.sendEmote('${e.id}',this)" title="${e.label}">${e.emoji}</div>`).join('') +
      `<div class="ebar-btn ebar-open" onclick="EyloxEmotes.togglePicker()" title="More emotes">⊕</div>`;
    return bar;
  }

  /* ── Reaction feed ── */
  let _feedTimeout = null;
  function showInFeed(username, emote) {
    let feed = document.getElementById('eylox-reaction-feed');
    if (!feed) { feed = document.createElement('div'); feed.id = 'eylox-reaction-feed'; document.body.appendChild(feed); }
    const item = document.createElement('div');
    item.className = 'rfeed-item';
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'rfeed-emoji';
    emojiSpan.textContent = emote.emoji;
    const labelSpan = document.createElement('span');
    labelSpan.textContent = username + ' reacted';
    item.appendChild(emojiSpan);
    item.appendChild(labelSpan);
    feed.prepend(item);
    setTimeout(() => { item.style.opacity = '0'; item.style.transition = 'opacity .4s'; setTimeout(() => item.remove(), 400); }, 3000);
    /* Keep max 4 items */
    while (feed.children.length > 4) feed.lastChild.remove();
  }

  /* ── Send emote ── */
  function sendEmote(id, sourceEl) {
    const emote = EMOTES.find(e => e.id === id);
    if (!emote) return;
    addRecent(id);
    playEmoteSound(emote.sound);
    spawnBubble(emote.emoji, sourceEl);
    /* Close picker */
    document.getElementById('eylox-emote-picker')?.classList.remove('open');
    /* Add to reaction feed */
    const user = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || '{}')?.username || 'You'; } catch { return 'You'; } })();
    showInFeed(user, emote);
    /* Dispatch event for games to listen */
    document.dispatchEvent(new CustomEvent('eylox:emote', { detail: { id, emote, user } }));
    /* Toast */
    if (window.EyloxToast) EyloxToast(`${emote.emoji} ${emote.label}!`, 'info', 1500);
  }

  /* ── Toggle picker ── */
  let _pickerOpen = false;
  function togglePicker() {
    const picker = document.getElementById('eylox-emote-picker');
    if (!picker) return;
    _pickerOpen = !_pickerOpen;
    if (_pickerOpen) {
      /* Rebuild with fresh recents */
      const newPicker = buildPicker();
      picker.replaceWith(newPicker);
      newPicker.classList.add('open');
    } else {
      picker.classList.remove('open');
    }
  }

  /* ── Keyboard shortcut: E key ── */
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'e' || e.key === 'E') { if (!e.ctrlKey && !e.metaKey) togglePicker(); }
    if (e.key === 'Escape') { document.getElementById('eylox-emote-picker')?.classList.remove('open'); _pickerOpen = false; }
  });

  /* ── Close on outside click ── */
  document.addEventListener('click', e => {
    const picker = document.getElementById('eylox-emote-picker');
    const bar    = document.getElementById('eylox-emote-bar');
    if (picker?.classList.contains('open') && !picker.contains(e.target) && !bar?.contains(e.target)) {
      picker.classList.remove('open');
      _pickerOpen = false;
    }
  });

  /* ── Add emote button to topbar ── */
  function injectTopbarBtn() {
    if (document.getElementById('tb-emote-btn')) return;
    const topbarRight = document.querySelector('.topbar-right, .tb-right, .topbar');
    if (!topbarRight) return;
    const btn = document.createElement('button');
    btn.id = 'tb-emote-btn';
    btn.title = 'Emotes (E)';
    btn.style.cssText = `
      background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);
      border-radius:99px;padding:5px 10px;cursor:pointer;font-size:1rem;
      color:rgba(200,190,230,.7);transition:all .18s;line-height:1;
    `;
    btn.textContent = '😄';
    btn.addEventListener('click', () => togglePicker());
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(167,139,250,.22)'; btn.style.color = '#e0d4ff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(167,139,250,.1)'; btn.style.color = 'rgba(200,190,230,.7)'; });
    topbarRight.appendChild(btn);
  }

  /* ── Inject & init ── */
  function init() {
    injectCSS();
    /* Build picker */
    const picker = buildPicker();
    document.body.appendChild(picker);
    /* Build quick bar */
    const bar = buildBar();
    document.body.appendChild(bar);
    /* Show bar on game pages */
    const page = document.body.dataset.page || '';
    if (page === 'game' || location.href.includes('game')) bar.classList.add('visible');
    /* Inject topbar button on main pages */
    injectTopbarBtn();
    /* Simulate random NPCs reacting every ~20s for liveliness */
    setInterval(() => {
      const npcNames = ['PixelWolf','StormRider','CyberNova','GlitchByte'];
      const rndEmote = EMOTES[Math.floor(Math.random() * EMOTES.length)];
      showInFeed(npcNames[Math.floor(Math.random() * npcNames.length)], rndEmote);
    }, 18000 + Math.random() * 12000);
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ── Expose API ── */
  window.EyloxEmotes = { sendEmote, togglePicker, EMOTES, spawnBubble };

})();
