/* ============================================================
   EYLOX — Global Chat v2.0
   Floating bubble widget + cross-tab notification popups
   localStorage persistence + broadcast system
   ============================================================ */
'use strict';

(function EyloxGlobalChat() {

  const MSGS_KEY      = 'eylox_gchat_msgs';      /* persisted message history */
  const BROADCAST_KEY = 'eylox_gchat_broadcast'; /* triggers storage event notifications */
  const PRESENCE_KEY  = 'eylox_chat_presence';
  const MAX_MSGS      = 120;
  const ONLINE_WINDOW = 30 * 60 * 1000;
  const ACTIVE_WINDOW =  5 * 60 * 1000;

  /* ── Helpers ── */
  function getUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; }
  }
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function userHue(name) {
    return Array.from(name || '?').reduce((a,c) => a + c.charCodeAt(0), 0) % 360;
  }
  function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }

  /* ── Message persistence ── */
  function loadMsgs() {
    try { return JSON.parse(localStorage.getItem(MSGS_KEY) || '[]'); } catch { return []; }
  }
  function saveMsg(msg) {
    try {
      const msgs = loadMsgs();
      msgs.push(msg);
      localStorage.setItem(MSGS_KEY, JSON.stringify(msgs.slice(-MAX_MSGS)));
    } catch {}
  }

  /* ── Broadcast (fires storage event in all OTHER open tabs/windows) ── */
  function broadcastMsg(username, text) {
    try {
      localStorage.setItem(BROADCAST_KEY, JSON.stringify({
        username, text, ts: Date.now(),
        id: Math.random().toString(36).slice(2, 9),
      }));
    } catch {}
  }

  /* ── Presence tracking ── */
  function touchPresence() {
    try {
      const u = getUser();
      const id = u.username || ('anon_' + (localStorage.getItem('eylox_anon_id') || (() => {
        const i = Math.random().toString(36).slice(2, 10);
        localStorage.setItem('eylox_anon_id', i);
        return i;
      })()));
      const p = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
      p[id] = Date.now();
      const cutoff = Date.now() - 3600000;
      Object.keys(p).forEach(k => { if (p[k] < cutoff) delete p[k]; });
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(p));
    } catch {}
  }
  function countPresence(windowMs) {
    try {
      const p = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
      return Math.max(1, Object.values(p).filter(ts => ts >= Date.now() - windowMs).length);
    } catch { return 1; }
  }

  /* ══════════════════════════════════════════════════════════
     NOTIFICATION POPUP — shown on ALL pages when someone
     sends a Global Chat message from another tab
  ══════════════════════════════════════════════════════════ */
  let _notifTimer = null;

  function injectNotifCSS() {
    if (document.getElementById('gc-notif-css')) return;
    const s = document.createElement('style');
    s.id = 'gc-notif-css';
    s.textContent = `
      @keyframes gcNotifIn  { from{opacity:0;transform:translateX(30px) scale(.94)} to{opacity:1;transform:none} }
      @keyframes gcNotifOut { from{opacity:1;transform:none} to{opacity:0;transform:translateX(20px)} }
      #gc-notif-wrap {
        position:fixed; top:80px; right:20px; z-index:999999;
        font-family:'Nunito',sans-serif;
        animation:gcNotifIn .35s cubic-bezier(.34,1.56,.64,1);
        cursor:pointer; max-width:340px; min-width:270px;
      }
      #gc-notif-wrap.out { animation:gcNotifOut .35s ease forwards; }
      #gc-notif-card {
        background:linear-gradient(160deg,#160944,#0d0626);
        border:1px solid rgba(167,139,250,.32);
        border-radius:18px; padding:14px 16px;
        box-shadow:0 20px 60px rgba(0,0,0,.7),0 0 0 1px rgba(167,139,250,.06),inset 0 1px 0 rgba(255,255,255,.04);
        display:flex; align-items:flex-start; gap:12px;
      }
      #gc-notif-card::before {
        content:''; position:absolute; top:0; left:0; right:0; height:1px;
        background:linear-gradient(90deg,transparent,rgba(167,139,250,.4),transparent);
        border-radius:18px 18px 0 0;
      }
      .gc-notif-progress {
        position:absolute; bottom:0; left:0; height:2px;
        background:linear-gradient(90deg,#7c3aed,#a78bfa);
        border-radius:0 0 18px 18px;
        animation:gcNotifProg 5s linear forwards;
      }
      @keyframes gcNotifProg { from{width:100%} to{width:0%} }
    `;
    document.head.appendChild(s);
  }

  function showGchatNotif(username, text) {
    /* If user is currently viewing the global chat tab, skip popup */
    const gchatShell = document.getElementById('gchat-shell');
    if (gchatShell && gchatShell.style.display !== 'none') return;

    injectNotifCSS();
    const existing = document.getElementById('gc-notif-wrap');
    if (existing) { existing.remove(); clearTimeout(_notifTimer); }

    const hue      = userHue(username);
    const initials = username.slice(0, 2).toUpperCase();
    const truncated = text.length > 70 ? text.slice(0, 70) + '…' : text;

    const wrap = document.createElement('div');
    wrap.id = 'gc-notif-wrap';
    wrap.innerHTML = `
      <div id="gc-notif-card" style="position:relative;overflow:hidden">
        <!-- Avatar with online dot -->
        <div style="width:44px;height:44px;border-radius:50%;background:hsl(${hue},60%,40%);
          display:flex;align-items:center;justify-content:center;font-size:.82rem;
          font-weight:900;color:#fff;flex-shrink:0;position:relative;
          box-shadow:0 0 0 2px hsl(${hue},60%,60%,0.3)">
          ${escHtml(initials)}
          <div style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;
            border-radius:50%;background:#4ade80;border:2px solid #0d0626;
            box-shadow:0 0 6px #4ade80"></div>
        </div>

        <!-- Content -->
        <div style="flex:1;min-width:0">
          <div style="font-size:.6rem;font-weight:900;color:rgba(74,222,128,.8);
            text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;
            display:flex;align-items:center;gap:5px">
            <span style="width:6px;height:6px;border-radius:50%;background:#4ade80;
              display:inline-block;box-shadow:0 0 4px #4ade80;animation:gcPulse 1.5s infinite"></span>
            🌐 Global Chat
          </div>
          <div style="font-size:.84rem;font-weight:900;margin-bottom:5px;color:#f0e8ff">
            <span style="color:#c4b5ff">${escHtml(username)}</span>
            <span style="color:rgba(255,255,255,.4);font-weight:600"> said</span>
          </div>
          <div style="font-size:.82rem;color:#e0d4ff;background:rgba(167,139,250,.1);
            border:1px solid rgba(167,139,250,.15);border-radius:10px;
            padding:7px 11px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            "${escHtml(truncated)}"
          </div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <button onclick="event.stopPropagation();window.location.href='messages.html?tab=gchat'"
              style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;
              border-radius:8px;padding:5px 14px;color:#fff;font-size:.72rem;
              font-weight:900;cursor:pointer;transition:opacity .15s"
              onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
              Open Chat
            </button>
            <button onclick="event.stopPropagation();dismissGcNotif()"
              style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);
              border-radius:8px;padding:5px 10px;color:rgba(167,139,250,.7);
              font-size:.72rem;font-weight:800;cursor:pointer">
              Dismiss
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button onclick="event.stopPropagation();dismissGcNotif()"
          style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,.06);
          border:none;color:rgba(255,255,255,.35);cursor:pointer;font-size:.85rem;
          width:22px;height:22px;border-radius:50%;display:flex;align-items:center;
          justify-content:center;transition:all .15s;padding:0"
          onmouseover="this.style.background='rgba(255,255,255,.15)';this.style.color='#fff'"
          onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.color='rgba(255,255,255,.35)'">
          ✕
        </button>

        <!-- Progress bar -->
        <div class="gc-notif-progress"></div>
      </div>
    `;

    wrap.addEventListener('click', () => { window.location.href = 'messages.html?tab=gchat'; });
    document.body.appendChild(wrap);

    _notifTimer = setTimeout(() => dismissGcNotif(), 5200);
  }

  window.dismissGcNotif = function() {
    const w = document.getElementById('gc-notif-wrap');
    if (!w) return;
    w.classList.add('out');
    setTimeout(() => w.remove(), 360);
    clearTimeout(_notifTimer);
  };

  /* Listen for broadcasts from other tabs */
  window.addEventListener('storage', e => {
    if (e.key !== BROADCAST_KEY || !e.newValue) return;
    try {
      const data = JSON.parse(e.newValue);
      if (!data || Date.now() - data.ts > 8000) return;
      showGchatNotif(data.username, data.text);
      /* Also append to the embedded gchat if on messages page */
      if (typeof window.gchatReceiveMsg === 'function') {
        window.gchatReceiveMsg(data.username, data.text, data.ts, false);
      }
      /* Also update the floating widget if open */
      const msgs = document.getElementById('egc-messages');
      if (msgs) {
        appendMsgToWidget(msgs, data.username, data.text, false);
      }
    } catch {}
  });

  /* ── Helper: append to floating widget ── */
  function appendMsgToWidget(msgs, name, text, isMe) {
    const div = document.createElement('div');
    div.className = 'egc-msg';
    const hue = userHue(name);
    div.innerHTML = `
      <div class="egc-avatar" style="background:hsl(${hue},65%,40%)">${isMe ? 'Me' : name.slice(0,2).toUpperCase()}</div>
      <div class="egc-msg-body">
        <div class="egc-name" style="${isMe ? 'color:#60a5fa' : ''}">${escHtml(name)}</div>
        <div class="egc-text">${escHtml(text)}</div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    while (msgs.children.length > 60) msgs.removeChild(msgs.firstChild);
  }

  /* ══════════════════════════════════════════════════════════
     FLOATING BUBBLE WIDGET
  ══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', initWidget);

  function initWidget() {
    if (document.getElementById('eyloxGlobalChat')) return;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes egc-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
      @keyframes egc-msg-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      @keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.4}}
      #eyloxGlobalChat{position:fixed;bottom:24px;left:24px;z-index:9989;font-family:'Nunito',sans-serif;display:flex;flex-direction:column;align-items:flex-start;}
      #egc-bubble{background:linear-gradient(135deg,#1c0b42,#130838);border:1px solid rgba(167,139,250,.3);border-radius:50px;box-shadow:0 8px 32px rgba(0,0,0,.6);display:flex;align-items:center;gap:8px;padding:10px 16px;cursor:pointer;transition:all .2s;user-select:none;}
      #egc-bubble:hover{box-shadow:0 12px 40px rgba(124,58,237,.5);transform:translateY(-2px);}
      #egc-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80;animation:egc-pulse 1.8s ease-in-out infinite;flex-shrink:0;}
      #egc-lbl{font-size:.78rem;font-weight:800;color:#f0e8ff;}
      #egc-count{font-size:.68rem;color:#4ade80;font-weight:900;}
      #egc-panel{background:linear-gradient(160deg,#1c0b42,#130838);border:1px solid rgba(167,139,250,.25);border-radius:20px;width:300px;box-shadow:0 20px 60px rgba(0,0,0,.7);overflow:hidden;margin-bottom:8px;animation:egc-slide .3s cubic-bezier(.34,1.56,.64,1);display:none;}
      #egc-panel.open{display:flex;flex-direction:column;}
      @keyframes egc-slide{from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:none}}
      #egc-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(167,139,250,.12);flex-shrink:0;}
      #egc-header-title{font-family:'Fredoka One',cursive;font-size:.95rem;color:#f0e8ff;}
      #egc-close{background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:.9rem;padding:2px 6px;border-radius:6px;}
      #egc-close:hover{background:rgba(167,139,250,.1);color:#f0e8ff;}
      #egc-messages{flex:1;overflow-y:auto;padding:8px 6px;max-height:240px;min-height:120px;display:flex;flex-direction:column;gap:2px;scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.2) transparent;}
      .egc-msg{display:flex;align-items:flex-start;gap:6px;padding:5px 8px;border-radius:10px;animation:egc-msg-in .25s ease;font-size:.76rem;}
      .egc-msg:hover{background:rgba(167,139,250,.06);}
      .egc-avatar{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:900;color:#fff;margin-top:1px;}
      .egc-msg-body{flex:1;min-width:0;}
      .egc-name{font-weight:900;color:#a78bfa;font-size:.7rem;margin-bottom:1px;}
      .egc-text{color:#c4b5e0;line-height:1.35;word-break:break-word;}
      #egc-input-row{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(167,139,250,.12);flex-shrink:0;}
      #egc-input{flex:1;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.18);color:#f0e8ff;border-radius:12px;padding:7px 12px;font-family:'Nunito',sans-serif;font-size:.78rem;font-weight:700;outline:none;transition:border-color .15s;}
      #egc-input::placeholder{color:rgba(157,142,199,.45);}
      #egc-input:focus{border-color:#a78bfa;}
      #egc-send{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;border-radius:12px;padding:7px 12px;color:#fff;font-weight:900;font-size:.78rem;cursor:pointer;transition:opacity .15s;}
      #egc-send:hover{opacity:.85;}
      #egc-emoji-bar{display:none;padding:6px 10px;border-bottom:1px solid rgba(167,139,250,.1);flex-wrap:wrap;gap:4px;}
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'eyloxGlobalChat';
    container.innerHTML = `
      <div id="egc-panel">
        <div id="egc-header">
          <div>
            <div id="egc-header-title">🌐 Global Chat</div>
            <div id="egc-active-label" style="font-size:.62rem;font-weight:800;color:rgba(74,222,128,.7);margin-top:1px">● Live</div>
          </div>
          <div style="display:flex;align-items:center;gap:4px">
            <button id="egc-emoji-btn" style="background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:.9rem;padding:2px 5px;border-radius:6px" title="Quick emoji">😊</button>
            <button id="egc-fullscreen-btn" title="Open full chat" onclick="window.location.href='messages.html?tab=gchat'" style="background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:.85rem;padding:2px 5px;border-radius:6px" onmouseover="this.style.color='#a78bfa'" onmouseout="this.style.color='#9d8ec7'">⛶</button>
            <button id="egc-close">✕</button>
          </div>
        </div>
        <div id="egc-emoji-bar"></div>
        <div id="egc-messages"></div>
        <div id="egc-input-row">
          <input id="egc-input" type="text" placeholder="Say something…" maxlength="200" autocomplete="off"/>
          <button id="egc-send">Send</button>
        </div>
      </div>
      <div id="egc-bubble">
        <div id="egc-dot"></div>
        <span id="egc-lbl">💬 Global Chat</span>
        <span id="egc-count">• 0 online</span>
      </div>
    `;
    document.body.appendChild(container);

    const panel      = document.getElementById('egc-panel');
    const bubble     = document.getElementById('egc-bubble');
    const msgs       = document.getElementById('egc-messages');
    const input      = document.getElementById('egc-input');
    const sendBtn    = document.getElementById('egc-send');
    const closeBtn   = document.getElementById('egc-close');
    const emojiBtnEl = document.getElementById('egc-emoji-btn');
    const emojiBar   = document.getElementById('egc-emoji-bar');
    const activeLabel= document.getElementById('egc-active-label');
    const countEl    = document.getElementById('egc-count');

    /* Quick emoji bar */
    const QUICK_EMOJIS = ['😂','🔥','👾','🏆','💰','🎮','⭐','🚀','👑','💎','🤝','❤️'];
    QUICK_EMOJIS.forEach(em => {
      const btn = document.createElement('button');
      btn.textContent = em;
      btn.style.cssText = 'background:none;border:none;font-size:1.1rem;cursor:pointer;padding:3px;border-radius:6px;transition:transform .1s';
      btn.addEventListener('click', () => { input.value += em; input.focus(); btn.style.transform = 'scale(1.4)'; setTimeout(() => btn.style.transform = '', 120); });
      emojiBar.appendChild(btn);
    });
    emojiBtnEl.addEventListener('click', e => {
      e.stopPropagation();
      const showing = emojiBar.style.display !== 'none';
      emojiBar.style.display = showing ? 'none' : 'flex';
      emojiBtnEl.style.color = showing ? '#9d8ec7' : '#a78bfa';
    });

    /* Load last 20 messages from history */
    const history = loadMsgs().slice(-20);
    if (history.length) {
      const sysDiv = document.createElement('div');
      sysDiv.style.cssText = 'text-align:center;padding:6px;font-size:.65rem;font-weight:800;color:rgba(167,139,250,.3)';
      sysDiv.textContent = '── Earlier messages ──';
      msgs.appendChild(sysDiv);
      history.forEach(m => appendMsgToWidget(msgs, m.username, m.text, m.isMe || false));
    } else {
      const sysDiv = document.createElement('div');
      sysDiv.style.cssText = 'text-align:center;padding:8px;font-size:.7rem;font-weight:800;color:rgba(167,139,250,.4)';
      sysDiv.textContent = '💬 Welcome to Global Chat!';
      msgs.appendChild(sysDiv);
    }

    let open = false;
    function togglePanel() {
      open = !open;
      panel.classList.toggle('open', open);
      if (open) { setTimeout(() => msgs.scrollTop = msgs.scrollHeight, 50); }
    }
    bubble.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', e => { e.stopPropagation(); open = false; panel.classList.remove('open'); });

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      const u    = getUser();
      const name = u.username || 'You';
      input.value = '';
      emojiBar.style.display = 'none';
      emojiBtnEl.style.color = '#9d8ec7';

      /* Save to localStorage */
      const msg = { username: name, text, ts: Date.now(), isMe: true };
      saveMsg(msg);

      /* Show in widget */
      appendMsgToWidget(msgs, name, text, true);

      /* Broadcast to other tabs → triggers their notifications */
      broadcastMsg(name, text);

      /* Also notify the full embedded tab if on messages page */
      if (typeof window.gchatReceiveMsg === 'function') {
        window.gchatReceiveMsg(name, text, msg.ts, true);
      }

      touchPresence();
      updateCounts();

      /* Track chat count for challenges */
      try {
        const today = new Date().toDateString();
        const cc = JSON.parse(localStorage.getItem('eylox_chat_count') || '{}');
        cc[today] = (cc[today] || 0) + 1;
        localStorage.setItem('eylox_chat_count', JSON.stringify(cc));
      } catch {}
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    /* Online count */
    touchPresence();
    function updateCounts() {
      touchPresence();
      const chatters = countPresence(ACTIVE_WINDOW);
      const online   = countPresence(ONLINE_WINDOW);
      if (countEl) {
        countEl.textContent = online >= 1000
          ? `• ${(online / 1000).toFixed(1)}K online`
          : `• ${online} online`;
      }
      if (activeLabel) activeLabel.textContent = `● ${chatters} chatting now`;
      /* Also update the embedded tab header */
      const statusEl = document.getElementById('gchat-status');
      if (statusEl) statusEl.textContent = `● Live · ${online} online`;
    }
    updateCounts();
    setInterval(updateCounts, 30000);

    /* Placeholder */
    try {
      const u = getUser();
      if (u.username) input.placeholder = `Message as ${u.username}…`;
    } catch {}

    /* Expose send for external use (e.g. messages page tab) */
    window.EyloxGlobalChat = { send: sendMessage, toggle: togglePanel };
  }

})();
