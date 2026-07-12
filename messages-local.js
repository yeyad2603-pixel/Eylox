/* ============================================================
   EYLOX — messages-local.js
   Local friend direct messaging (localStorage-backed)
   Powers messages.html and the quick-message popup
   ============================================================ */
'use strict';

(function EyloxMessages() {

  /* ── Storage helpers ── */
  const KEY = 'eylox_messages';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }

  function threadKey(a, b) {
    return [a, b].sort().join('::');
  }

  function getThread(me, friend) {
    return (getAll()[threadKey(me, friend)] || []);
  }

  function saveMessage(me, friend, text, read = false) {
    const all = getAll();
    const key = threadKey(me, friend);
    if (!all[key]) all[key] = [];
    all[key].push({ from: me, text, ts: Date.now(), read });
    if (all[key].length > 200) all[key] = all[key].slice(-200);
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[key];
  }

  function markMessagesAsRead(me, friend) {
    const all = getAll();
    const key = threadKey(me, friend);
    if (!all[key]) return;
    let changed = false;
    all[key].forEach(msg => {
      if (msg.from === friend && !msg.read) { msg.read = true; changed = true; }
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(all));
  }

  function getUnreadCount(me) {
    const all = getAll();
    let total = 0;
    const read = (() => { try { return JSON.parse(localStorage.getItem('eylox_msg_read') || '{}'); } catch { return {}; } })();
    for (const [key, msgs] of Object.entries(all)) {
      if (!key.includes(me)) continue;
      const lastRead = read[key] || 0;
      total += msgs.filter(m => m.from !== me && m.ts > lastRead).length;
    }
    return total;
  }

  function markRead(me, friend) {
    const key = threadKey(me, friend);
    const read = (() => { try { return JSON.parse(localStorage.getItem('eylox_msg_read') || '{}'); } catch { return {}; } })();
    read[key] = Date.now();
    localStorage.setItem('eylox_msg_read', JSON.stringify(read));
    markMessagesAsRead(me, friend);
  }

  function formatTime(ts) {
    const now = Date.now();
    const d = now - ts;
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    const dt = new Date(ts);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getMe() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || 'null')?.username || null; } catch { return null; }
  }

  function getFriends() {
    try { return JSON.parse(localStorage.getItem('eylox_friends') || '[]'); } catch { return []; }
  }

  function friendAvatar(username) {
    const friends = getFriends();
    const f = friends.find(f => f.username === username);
    if (f?.avatar) return f.avatar;
    const code = username.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return ['🦊','🐼','🐸','🦋','🦁','🐯','🐺','🦄'][code % 8];
  }

  /* ── CSS ── */
  if (!document.getElementById('msg-style')) {
    const s = document.createElement('style');
    s.id = 'msg-style';
    s.textContent = `
      /* Quick message popup button */
      #msg-fab {
        position:fixed;bottom:110px;right:18px;z-index:9970;
        width:52px;height:52px;border-radius:16px;
        background:linear-gradient(135deg,#1d4ed8,#3b82f6);
        border:1px solid rgba(96,165,250,.35);
        box-shadow:0 4px 20px rgba(29,78,216,.45);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:1.4rem;transition:transform .2s;
      }
      #msg-fab:hover { transform:scale(1.1); }
      #msg-fab-badge {
        position:absolute;top:-4px;right:-4px;
        min-width:18px;height:18px;border-radius:99px;
        background:#f472b6;color:#fff;font-size:.6rem;font-weight:800;
        display:flex;align-items:center;justify-content:center;padding:0 4px;
        border:2px solid rgba(17,3,48,1);
      }

      /* Message popup panel */
      #msg-panel {
        position:fixed;bottom:172px;right:18px;z-index:9971;
        width:320px;max-height:520px;
        background:rgba(17,3,48,.98);border-radius:20px;
        border:1px solid rgba(96,165,250,.2);
        box-shadow:0 12px 50px rgba(0,0,0,.75);
        display:flex;flex-direction:column;overflow:hidden;
        animation:msg-in .32s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes msg-in {
        from { opacity:0; transform:translateY(18px) scale(.9); }
        to   { opacity:1; transform:none; }
      }
      #msg-panel.hiding { animation:msg-out .22s ease forwards; }
      @keyframes msg-out {
        to { opacity:0; transform:translateY(14px) scale(.88); }
      }
      .mp-header {
        background:linear-gradient(135deg,rgba(29,78,216,.4),rgba(59,130,246,.15));
        padding:13px 16px;border-bottom:1px solid rgba(96,165,250,.15);
        display:flex;align-items:center;gap:10px;
      }
      .mp-header-title {
        flex:1;font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff;
      }
      .mp-search {
        display:flex;align-items:center;gap:8px;padding:10px 12px;
        border-bottom:1px solid rgba(96,165,250,.1);
      }
      .mp-search input {
        flex:1;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.15);
        border-radius:10px;padding:6px 12px;font-size:.78rem;color:#f0e8ff;outline:none;
      }
      .mp-search input::placeholder { color:rgba(157,142,199,.5); }
      .mp-threads {
        flex:1;overflow-y:auto;padding:6px 0;
        scrollbar-width:thin;scrollbar-color:rgba(96,165,250,.2) transparent;
      }
      .mp-thread-row {
        display:flex;align-items:center;gap:10px;
        padding:9px 14px;cursor:pointer;transition:background .15s;
        border-radius:12px;margin:0 4px;
      }
      .mp-thread-row:hover { background:rgba(96,165,250,.08); }
      .mp-thread-row.active { background:rgba(96,165,250,.14); }
      .mp-avatar {
        width:36px;height:36px;border-radius:12px;font-size:1.3rem;
        background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.2);
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
        position:relative;
      }
      .mp-online-dot {
        position:absolute;bottom:-1px;right:-1px;
        width:9px;height:9px;border-radius:50%;border:2px solid rgba(17,3,48,1);
      }
      .mp-thread-info { flex:1;min-width:0; }
      .mp-thread-name { font-size:.82rem;font-weight:700;color:#f0e8ff;margin-bottom:2px; }
      .mp-thread-preview { font-size:.7rem;color:rgba(157,142,199,.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .mp-thread-meta { text-align:right;flex-shrink:0; }
      .mp-thread-time { font-size:.62rem;color:rgba(157,142,199,.5); }
      .mp-unread-dot {
        width:8px;height:8px;border-radius:50%;background:#3b82f6;
        margin:3px 0 0 auto;
      }
      .mp-empty {
        text-align:center;padding:28px 16px;
        font-size:.78rem;color:rgba(157,142,199,.5);
      }

      /* Chat view */
      #msg-chat-view {
        display:flex;flex-direction:column;
        position:absolute;inset:0;
        background:rgba(17,3,48,.99);border-radius:20px;
        animation:msg-in .28s cubic-bezier(.34,1.56,.64,1) both;
      }
      .mcv-header {
        padding:12px 14px;border-bottom:1px solid rgba(96,165,250,.15);
        display:flex;align-items:center;gap:10px;flex-shrink:0;
      }
      .mcv-back {
        background:none;border:none;color:#a78bfa;cursor:pointer;
        font-size:1rem;padding:0 4px;border-radius:8px;
        transition:background .15s;
      }
      .mcv-back:hover { background:rgba(167,139,250,.12); }
      .mcv-name { flex:1;font-family:'Fredoka One',cursive;font-size:.95rem;color:#f0e8ff; }
      .mcv-messages {
        flex:1;overflow-y:auto;padding:10px 12px;
        display:flex;flex-direction:column;gap:6px;
        scrollbar-width:thin;scrollbar-color:rgba(96,165,250,.15) transparent;
      }
      .mcv-msg {
        max-width:80%;padding:7px 11px;border-radius:14px;
        font-size:.78rem;line-height:1.45;
        animation:msg-bubble .2s ease both;
        word-break:break-word;
      }
      @keyframes msg-bubble {
        from { opacity:0; transform:scale(.85); }
        to   { opacity:1; transform:none; }
      }
      .mcv-msg.me {
        align-self:flex-end;
        background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;
        border-bottom-right-radius:4px;
      }
      .mcv-msg.them {
        align-self:flex-start;
        background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.15);
        color:#e0d8ff;border-bottom-left-radius:4px;
      }
      .mcv-msg-time {
        font-size:.58rem;opacity:.55;margin-top:2px;text-align:right;
        display:flex;align-items:center;justify-content:flex-end;gap:3px;
      }
      .mcv-msg.them .mcv-msg-time { text-align:left;justify-content:flex-start; }
      .mcv-read-tick { font-size:.62rem; }
      .mcv-read-tick.read { color:#4ade80; }
      .mcv-read-tick.sent { color:rgba(255,255,255,.4); }
      .mcv-date-sep {
        text-align:center;font-size:.6rem;color:rgba(157,142,199,.45);
        font-weight:700;margin:4px 0;
      }
      .mcv-typing {
        font-size:.68rem;color:rgba(96,165,250,.55);
        padding:2px 4px;min-height:18px;
      }
      .mcv-input-row {
        padding:10px 12px;border-top:1px solid rgba(96,165,250,.1);
        display:flex;align-items:flex-end;gap:8px;flex-shrink:0;
      }
      .mcv-input {
        flex:1;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.18);
        border-radius:12px;padding:8px 12px;font-size:.78rem;color:#f0e8ff;
        outline:none;resize:none;max-height:80px;line-height:1.4;
        font-family:inherit;
      }
      .mcv-input::placeholder { color:rgba(157,142,199,.45); }
      .mcv-input:focus { border-color:rgba(96,165,250,.4); }
      .mcv-send {
        width:36px;height:36px;border-radius:12px;
        background:linear-gradient(135deg,#1d4ed8,#3b82f6);
        border:none;cursor:pointer;color:#fff;font-size:1rem;
        display:flex;align-items:center;justify-content:center;
        transition:transform .15s,opacity .15s;flex-shrink:0;
      }
      .mcv-send:hover { transform:scale(1.08); }
      .mcv-send:disabled { opacity:.35; cursor:not-allowed; transform:none; }

      /* Unread badge on dock/nav Messages link */
      .dock-item[href="messages.html"] .dock-icon { position:relative; }
      .msg-nav-badge {
        position:absolute;top:-3px;right:-3px;
        min-width:14px;height:14px;border-radius:99px;
        background:#f472b6;color:#fff;font-size:.5rem;font-weight:800;
        display:flex;align-items:center;justify-content:center;padding:0 3px;
        border:2px solid rgba(17,3,48,1);pointer-events:none;
      }
    `;
    document.head.appendChild(s);
  }

  let panelOpen = false;
  let activeFriend = null;
  let chatPollTimer = null;

  /* ── Build thread list ── */
  function buildThreadList(panel, filter = '') {
    const me = getMe();
    const friends = getFriends();
    const all = getAll();

    const threads = document.createElement('div');
    threads.className = 'mp-threads';

    const search = document.createElement('div');
    search.className = 'mp-search';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search friends…';
    searchInput.id = 'mp-search-input';
    searchInput.value = filter;
    search.appendChild(searchInput);
    panel.querySelector('.mp-search')?.replaceWith(search);
    if (!panel.querySelector('.mp-search')) {
      panel.querySelector('.mp-header').insertAdjacentElement('afterend', search);
    }
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase();
      renderRows(val);
    });

    function renderRows(f = '') {
      threads.innerHTML = '';
      const visible = friends.filter(fr => !f || fr.username.toLowerCase().includes(f));
      if (!visible.length) {
        threads.innerHTML = `<div class="mp-empty">No friends found.<br><a href="friends.html" style="color:#60a5fa">Find friends →</a></div>`;
        return;
      }
      visible.forEach(fr => {
        const key = threadKey(me, fr.username);
        const msgs = all[key] || [];
        const last = msgs[msgs.length - 1];
        const read = (() => { try { return JSON.parse(localStorage.getItem('eylox_msg_read') || '{}')[key] || 0; } catch { return 0; } })();
        const unread = msgs.filter(m => m.from !== me && m.ts > read).length;

        const onlineSeed = fr.username.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
        const online = fr.online || (onlineSeed % 3 === 0);

        const row = document.createElement('div');
        row.className = 'mp-thread-row' + (activeFriend === fr.username ? ' active' : '');
        row.dataset.friend = fr.username;
        row.innerHTML = `
          <div class="mp-avatar">
            ${fr.avatar || friendAvatar(fr.username)}
            <div class="mp-online-dot" style="background:${online ? '#4ade80' : '#6b7280'}"></div>
          </div>
          <div class="mp-thread-info">
            <div class="mp-thread-name">${fr.username}</div>
            <div class="mp-thread-preview">${last ? (last.from === me ? 'You: ' : '') + last.text : 'Start a conversation…'}</div>
          </div>
          <div class="mp-thread-meta">
            <div class="mp-thread-time">${last ? formatTime(last.ts) : ''}</div>
            ${unread ? '<div class="mp-unread-dot"></div>' : ''}
          </div>
        `;
        row.addEventListener('click', () => openChat(fr.username, panel));
        threads.appendChild(row);
      });
    }

    renderRows(filter);
    const existing = panel.querySelector('.mp-threads');
    if (existing) existing.replaceWith(threads);
    else panel.appendChild(threads);
  }

  /* ── Open chat view ── */
  function openChat(friendUsername, panel) {
    activeFriend = friendUsername;
    markRead(getMe(), friendUsername);

    let view = panel.querySelector('#msg-chat-view');
    if (!view) {
      view = document.createElement('div');
      view.id = 'msg-chat-view';
      panel.appendChild(view);
    }

    renderChat(view, friendUsername);
    updateUnreadBadge();

    clearInterval(chatPollTimer);
    chatPollTimer = setInterval(() => {
      if (!panelOpen || !activeFriend) { clearInterval(chatPollTimer); return; }
      renderMessages(view, friendUsername);
    }, 1500);
  }

  function renderChat(view, friendUsername) {
    const me = getMe();
    const av = friendAvatar(friendUsername);
    const friends = getFriends();
    const fr = friends.find(f => f.username === friendUsername) || {};
    const onlineSeed = friendUsername.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
    const online = fr.online || (onlineSeed % 3 === 0);

    view.innerHTML = `
      <div class="mcv-header">
        <button class="mcv-back" title="Back">←</button>
        <div class="mp-avatar" style="flex-shrink:0">
          ${fr.avatar || av}
          <div class="mp-online-dot" style="background:${online ? '#4ade80' : '#6b7280'}"></div>
        </div>
        <div class="mcv-name">${friendUsername}</div>
        <span style="font-size:.65rem;color:${online ? '#4ade80' : 'rgba(157,142,199,.5)'}">
          ${online ? '● Online' : '○ Offline'}
        </span>
      </div>
      <div class="mcv-messages" id="mcv-msgs"></div>
      <div class="mcv-typing" id="mcv-typing"></div>
      <div class="mcv-input-row">
        <textarea class="mcv-input" id="mcv-input" rows="1" placeholder="Message ${friendUsername}…"></textarea>
        <button class="mcv-send" id="mcv-send">➤</button>
      </div>
    `;

    view.querySelector('.mcv-back').addEventListener('click', () => {
      clearInterval(chatPollTimer);
      activeFriend = null;
      view.remove();
      buildThreadList(document.getElementById('msg-panel'));
    });

    const input = view.querySelector('#mcv-input');
    const sendBtn = view.querySelector('#mcv-send');

    function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      input.style.height = '';
      saveMessage(me, friendUsername, text);
      renderMessages(view, friendUsername);
      updateUnreadBadge();
      window.EyloxSFX?.click?.();

      /* Simulate reply after random delay */
      if (online && Math.random() > 0.4) {
        const delay = 2000 + Math.random() * 6000;
        const typing = view.querySelector('#mcv-typing');
        setTimeout(() => {
          if (!document.getElementById('msg-chat-view')) return;
          if (typing) typing.textContent = `${friendUsername} is typing…`;
          setTimeout(() => {
            if (!document.getElementById('msg-chat-view')) return;
            if (typing) typing.textContent = '';
            const replies = [
              'lol 😄', 'nice!', 'haha yeah', 'let\'s play soon!', '🎮🔥',
              'agreed', 'gg', 'sounds good', 'fr tho', '👍', 'when are you on?',
              'bro same', 'let\'s gooo', '🏆', 'no way!', 'gg ez',
              'that was wild', 'rematcj?', 'i\'m down', 'bet',
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            saveMessage(friendUsername, me, reply, false);
            renderMessages(view, friendUsername);
            updateUnreadBadge();
          }, 1200 + Math.random() * 1500);
        }, delay);
      }
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });

    renderMessages(view, friendUsername);
  }

  function renderMessages(view, friendUsername) {
    const me = getMe();
    const msgs = getThread(me, friendUsername);
    const container = view.querySelector('#mcv-msgs');
    if (!container) return;
    markRead(me, friendUsername);

    if (!msgs.length) {
      container.innerHTML = `<div style="text-align:center;padding:24px;font-size:.75rem;color:rgba(157,142,199,.4)">No messages yet.<br>Say hello! 👋</div>`;
      return;
    }

    let lastDate = null;
    const frag = document.createDocumentFragment();
    msgs.forEach(msg => {
      const d = new Date(msg.ts).toDateString();
      if (d !== lastDate) {
        const sep = document.createElement('div');
        sep.className = 'mcv-date-sep';
        sep.textContent = d === new Date().toDateString() ? 'Today' : new Date(msg.ts).toLocaleDateString('en-US', { month:'short', day:'numeric' });
        frag.appendChild(sep);
        lastDate = d;
      }
      const div = document.createElement('div');
      const isMe = msg.from === me;
      div.className = 'mcv-msg ' + (isMe ? 'me' : 'them');
      const readStatus = isMe
        ? `<span class="mcv-read-tick ${msg.read ? 'read' : 'sent'}" title="${msg.read ? 'Read' : 'Sent'}">${msg.read ? '✓✓' : '✓'}</span>`
        : '';
      div.innerHTML = `${escapeHTML(msg.text)}<div class="mcv-msg-time">${formatTime(msg.ts)}${readStatus}</div>`;
      frag.appendChild(div);
    });

    const wasAtBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 60;
    container.innerHTML = '';
    container.appendChild(frag);
    if (wasAtBottom) container.scrollTop = container.scrollHeight;
  }

  function escapeHTML(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Unread badge on FAB and nav ── */
  function updateUnreadBadge() {
    const me = getMe();
    if (!me) return;
    const count = getUnreadCount(me);

    const fab = document.getElementById('msg-fab');
    if (fab) {
      let badge = document.getElementById('msg-fab-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('div');
          badge.id = 'msg-fab-badge';
          fab.appendChild(badge);
        }
        badge.textContent = count > 9 ? '9+' : count;
      } else {
        badge?.remove();
      }
    }

    /* Badge on dock Messages icon */
    const dockMsg = document.querySelector('.dock-item[href="messages.html"] .dock-icon');
    if (dockMsg) {
      let nb = dockMsg.querySelector('.msg-nav-badge');
      if (count > 0) {
        if (!nb) {
          nb = document.createElement('div');
          nb.className = 'msg-nav-badge';
          dockMsg.style.position = 'relative';
          dockMsg.appendChild(nb);
        }
        nb.textContent = count > 9 ? '9+' : count;
      } else {
        nb?.remove();
      }
    }
  }

  /* ── FAB + Panel ── */
  document.addEventListener('DOMContentLoaded', () => {
    const me = getMe();
    if (!me) return;

    /* Don't show FAB on messages page (it has full UI) */
    const page = document.body?.dataset?.page || '';
    if (page === 'messages') {
      buildMessagesPage();
      return;
    }

    const fab = document.createElement('div');
    fab.id = 'msg-fab';
    fab.title = 'Messages';
    fab.innerHTML = '💬';
    document.body.appendChild(fab);

    updateUnreadBadge();
    setInterval(updateUnreadBadge, 3000);

    fab.addEventListener('click', e => {
      e.stopPropagation();
      if (panelOpen) closePanel();
      else openPanel();
    });

    document.addEventListener('click', e => {
      if (panelOpen && !e.target.closest('#msg-panel') && !e.target.closest('#msg-fab')) {
        closePanel();
      }
    });
  });

  function openPanel() {
    if (document.getElementById('msg-panel')) return;
    const me = getMe();
    const panel = document.createElement('div');
    panel.id = 'msg-panel';
    panel.innerHTML = `
      <div class="mp-header">
        <div class="mp-header-title">💬 Messages</div>
        <button onclick="this.closest('#msg-panel').remove()" style="background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:1rem">✕</button>
      </div>
    `;
    document.body.appendChild(panel);
    panelOpen = true;
    buildThreadList(panel);
    updateUnreadBadge();
  }

  function closePanel() {
    const panel = document.getElementById('msg-panel');
    if (!panel) return;
    clearInterval(chatPollTimer);
    activeFriend = null;
    panel.classList.add('hiding');
    setTimeout(() => { panel.remove(); panelOpen = false; }, 240);
  }

  /* ── Full messages page builder ── */
  function buildMessagesPage() {
    const container = document.querySelector('.page-content, main, .content-area');
    if (!container) return;
    const me = getMe();
    const friends = getFriends();

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:280px 1fr;gap:0;height:calc(100vh - 120px);border-radius:20px;overflow:hidden;border:1px solid rgba(96,165,250,.15);background:rgba(17,3,48,.7);">
        <div id="msg-sidebar" style="border-right:1px solid rgba(96,165,250,.1);display:flex;flex-direction:column;">
          <div style="padding:16px;border-bottom:1px solid rgba(96,165,250,.1);">
            <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#f0e8ff;margin-bottom:10px;">💬 Messages</div>
            <input type="text" id="msg-page-search" placeholder="Search conversations…" style="width:100%;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.15);border-radius:10px;padding:7px 12px;font-size:.78rem;color:#f0e8ff;outline:none;box-sizing:border-box;">
          </div>
          <div id="msg-page-list" style="flex:1;overflow-y:auto;padding:8px 0;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,.15) transparent;"></div>
        </div>
        <div id="msg-main" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:rgba(157,142,199,.4);">
          <div style="font-size:3rem;">💬</div>
          <div style="font-size:.9rem;">Select a conversation to start chatting</div>
          ${!friends.length ? `<a href="friends.html" style="color:#60a5fa;font-size:.78rem;">Find friends first →</a>` : ''}
        </div>
      </div>
    `;

    renderPageList();

    document.getElementById('msg-page-search')?.addEventListener('input', function() {
      renderPageList(this.value.toLowerCase());
    });

    function renderPageList(filter = '') {
      const list = document.getElementById('msg-page-list');
      if (!list) return;
      const all = getAll();
      list.innerHTML = '';
      const visible = friends.filter(f => !filter || f.username.toLowerCase().includes(filter));
      if (!visible.length) {
        list.innerHTML = `<div class="mp-empty">No friends found.</div>`;
        return;
      }
      visible.forEach(fr => {
        const key = threadKey(me, fr.username);
        const msgs = all[key] || [];
        const last = msgs[msgs.length - 1];
        const read = (() => { try { return JSON.parse(localStorage.getItem('eylox_msg_read') || '{}')[key] || 0; } catch { return 0; } })();
        const unread = msgs.filter(m => m.from !== me && m.ts > read).length;
        const onlineSeed = fr.username.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
        const online = fr.online || (onlineSeed % 3 === 0);

        const row = document.createElement('div');
        row.className = 'mp-thread-row';
        row.style.borderRadius = '0';
        row.innerHTML = `
          <div class="mp-avatar">
            ${fr.avatar || friendAvatar(fr.username)}
            <div class="mp-online-dot" style="background:${online ? '#4ade80' : '#6b7280'}"></div>
          </div>
          <div class="mp-thread-info">
            <div class="mp-thread-name">${fr.username}</div>
            <div class="mp-thread-preview">${last ? (last.from === me ? 'You: ' : '') + escapeHTML(last.text) : 'No messages yet'}</div>
          </div>
          <div class="mp-thread-meta">
            <div class="mp-thread-time">${last ? formatTime(last.ts) : ''}</div>
            ${unread ? '<div class="mp-unread-dot"></div>' : ''}
          </div>
        `;
        row.addEventListener('click', () => openPageChat(fr.username));
        list.appendChild(row);
      });
    }

    function openPageChat(friendUsername) {
      markRead(me, friendUsername);
      const main = document.getElementById('msg-main');
      if (!main) return;

      const fr = friends.find(f => f.username === friendUsername) || {};
      const onlineSeed = friendUsername.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
      const online = fr.online || (onlineSeed % 3 === 0);

      main.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
          <div class="mcv-header">
            <div class="mp-avatar" style="flex-shrink:0">${fr.avatar || friendAvatar(friendUsername)}<div class="mp-online-dot" style="background:${online ? '#4ade80' : '#6b7280'}"></div></div>
            <div class="mcv-name">${friendUsername}</div>
            <span style="font-size:.65rem;color:${online ? '#4ade80' : 'rgba(157,142,199,.5)'}"> ${online ? '● Online' : '○ Offline'}</span>
          </div>
          <div class="mcv-messages" id="mcv-page-msgs" style="flex:1"></div>
          <div class="mcv-typing" id="mcv-page-typing"></div>
          <div class="mcv-input-row">
            <textarea class="mcv-input" id="mcv-page-input" rows="1" placeholder="Message ${friendUsername}…"></textarea>
            <button class="mcv-send" id="mcv-page-send">➤</button>
          </div>
        </div>
      `;

      function renderPageMsgs() {
        const msgs = getThread(me, friendUsername);
        const container = document.getElementById('mcv-page-msgs');
        if (!container) return;
        markRead(me, friendUsername);
        if (!msgs.length) {
          container.innerHTML = `<div style="text-align:center;padding:32px;font-size:.78rem;color:rgba(157,142,199,.4)">No messages yet. Say hello! 👋</div>`;
          return;
        }
        let lastDate = null;
        const frag = document.createDocumentFragment();
        msgs.forEach(msg => {
          const d = new Date(msg.ts).toDateString();
          if (d !== lastDate) {
            const sep = document.createElement('div');
            sep.className = 'mcv-date-sep';
            sep.textContent = d === new Date().toDateString() ? 'Today' : new Date(msg.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'});
            frag.appendChild(sep);
            lastDate = d;
          }
          const div = document.createElement('div');
          div.className = 'mcv-msg ' + (msg.from === me ? 'me' : 'them');
          div.innerHTML = `${escapeHTML(msg.text)}<div class="mcv-msg-time">${formatTime(msg.ts)}</div>`;
          frag.appendChild(div);
        });
        const wasAtBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 60;
        container.innerHTML = '';
        container.appendChild(frag);
        if (wasAtBottom) container.scrollTop = container.scrollHeight;
      }
      renderPageMsgs();

      const input = document.getElementById('mcv-page-input');
      const sendBtn = document.getElementById('mcv-page-send');

      function pageSend() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        input.style.height = '';
        saveMessage(me, friendUsername, text);
        renderPageMsgs();
        renderPageList(document.getElementById('msg-page-search')?.value || '');
        window.EyloxSFX?.click?.();

        if (online && Math.random() > 0.4) {
          const delay = 2000 + Math.random() * 5000;
          const typing = document.getElementById('mcv-page-typing');
          setTimeout(() => {
            if (typing) typing.textContent = `${friendUsername} is typing…`;
            setTimeout(() => {
              if (typing) typing.textContent = '';
              const replies = ['gg!','lol','nice','fr?','let\'s play','🎮','👍','haha','okay','sounds good','😄','based','W','bet'];
              saveMessage(friendUsername, me, replies[Math.floor(Math.random()*replies.length)]);
              renderPageMsgs();
              renderPageList();
            }, 1000 + Math.random() * 2000);
          }, delay);
        }
      }

      sendBtn.addEventListener('click', pageSend);
      input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pageSend(); } });
      input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 80) + 'px'; });
    }

    setInterval(() => { renderPageList(document.getElementById('msg-page-search')?.value || ''); }, 3000);
  }

  /* Public API for other scripts */
  window.EyloxMessages = { openChat: (friend) => { openPanel(); setTimeout(() => openChat(friend, document.getElementById('msg-panel')), 300); } };

})();
