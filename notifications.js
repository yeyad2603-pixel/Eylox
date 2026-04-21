/* ============================================================
   EYLOX — notifications.js
   Global notification system — works on every page.
   Stores up to 50 notifications in localStorage.
   ============================================================ */
'use strict';

const Notifs = (() => {
  const KEY     = 'eylox_notifications';
  const MAX     = 50;
  let _panel    = null;
  let _badge    = null;
  let _open     = false;

  /* ── Read / write ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function save(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX)));
  }
  function unreadCount() {
    return load().filter(n => !n.read).length;
  }

  /* ── Push a new notification ── */
  function push(title, body, type = 'info') {
    const list = load();
    list.unshift({ id: Date.now(), title, body, type, read: false, time: Date.now() });
    save(list);
    _updateBadge();
    _showPop(title, body, type);
  }

  /* ── Format relative time ── */
  function _timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000)  return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  }

  /* ── Type → icon + colour ── */
  function _typeStyle(type) {
    const MAP = {
      shop:    { icon:'🛒', color:'#a78bfa' },
      game:    { icon:'🎮', color:'#4ade80' },
      coins:   { icon:'💰', color:'#fde68a' },
      event:   { icon:'🎯', color:'#f472b6' },
      friend:  { icon:'🤝', color:'#4fc3f7' },
      level:   { icon:'⬆️', color:'#fbbf24' },
      reward:  { icon:'🎁', color:'#34d399' },
      warn:    { icon:'⚠️', color:'#f87171' },
      system:  { icon:'🔔', color:'#94a3b8' },
      info:    { icon:'ℹ️', color:'#60a5fa' },
    };
    return MAP[type] || MAP.info;
  }

  /* ── Build panel HTML ── */
  function _buildPanel() {
    const list   = load();
    const style  = _typeStyle;
    const unread = list.filter(n => !n.read).length;

    return `
      <div id="notifPanelInner">
        <div class="np-header">
          <div class="np-title">🔔 Notifications${unread > 0 ? ` <span class="np-unread-count">${unread}</span>` : ''}</div>
          <div class="np-actions">
            ${unread > 0 ? '<button class="np-btn" onclick="Notifs.markAllRead()">Mark all read</button>' : ''}
            <button class="np-btn red" onclick="Notifs.clearAll()">Clear all</button>
          </div>
        </div>
        <div class="np-list">
          ${list.length === 0
            ? '<div class="np-empty">🔕 No notifications yet</div>'
            : list.map(n => {
                const s = style(n.type);
                return `
                <div class="np-item${n.read ? '' : ' unread'}" data-id="${n.id}" onclick="Notifs.markRead(${n.id})">
                  <div class="np-item-icon" style="background:${s.color}22;border-color:${s.color}44;color:${s.color}">${s.icon}</div>
                  <div class="np-item-body">
                    <div class="np-item-title">${n.title}</div>
                    <div class="np-item-text">${n.body}</div>
                    <div class="np-item-time">${_timeAgo(n.time)}</div>
                  </div>
                  ${!n.read ? '<div class="np-dot"></div>' : ''}
                </div>`;
              }).join('')
          }
        </div>
      </div>`;
  }

  /* ── Update badge ── */
  function _updateBadge() {
    const count = unreadCount();
    document.querySelectorAll('.notif-badge').forEach(el => {
      el.textContent = count > 9 ? '9+' : count;
      el.style.display = count > 0 ? '' : 'none';
    });
    /* Also update legacy .notif-dot visibility */
    document.querySelectorAll('.notif-dot').forEach(el => {
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  /* ── Show pop-up toast for new notification ── */
  function _showPop(title, body, type) {
    const s   = _typeStyle(type);
    const pop = document.createElement('div');
    pop.className = 'notif-pop';
    pop.style.cssText = `
      position:fixed;bottom:80px;right:20px;z-index:9998;
      background:linear-gradient(135deg,#1e0a48,#2a1560);
      border:1px solid ${s.color}55;
      border-left:3px solid ${s.color};
      border-radius:14px;padding:14px 16px;max-width:300px;min-width:220px;
      display:flex;align-items:flex-start;gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,.5);
      animation:notifIn .35s cubic-bezier(.34,1.56,.64,1) both;
      font-family:'Nunito',sans-serif;cursor:pointer;
    `;
    pop.innerHTML = `
      <div style="font-size:1.3rem;flex-shrink:0">${s.icon}</div>
      <div>
        <div style="font-weight:900;font-size:.85rem;color:#f0e8ff;margin-bottom:3px">${title}</div>
        <div style="font-size:.78rem;color:#9d8ec7;font-weight:700;line-height:1.4">${body}</div>
      </div>
      <button onclick="this.parentNode.remove()" style="background:none;border:none;color:#9d8ec7;font-size:1rem;cursor:pointer;padding:0;line-height:1;margin-left:auto;flex-shrink:0">✕</button>`;
    pop.addEventListener('click', () => { pop.style.animation = 'notifOut .3s ease forwards'; setTimeout(() => pop.remove(), 300); });
    document.body.appendChild(pop);
    setTimeout(() => { if (pop.parentNode) { pop.style.animation = 'notifOut .3s ease forwards'; setTimeout(() => pop.remove(), 300); } }, 4500);
  }

  /* ── Toggle panel ── */
  function togglePanel() {
    if (_open) { closePanel(); return; }
    openPanel();
  }

  function openPanel() {
    _open = true;
    _panel.innerHTML = _buildPanel();
    _panel.style.display = 'block';
    /* Animate in */
    _panel.style.opacity = '0';
    _panel.style.transform = 'translateY(-10px) scale(.97)';
    requestAnimationFrame(() => {
      _panel.style.transition = 'opacity .2s ease, transform .2s cubic-bezier(.34,1.56,.64,1)';
      _panel.style.opacity = '1';
      _panel.style.transform = 'translateY(0) scale(1)';
    });
  }

  function closePanel() {
    _open = false;
    _panel.style.transition = 'opacity .18s ease, transform .18s ease';
    _panel.style.opacity = '0';
    _panel.style.transform = 'translateY(-8px) scale(.97)';
    setTimeout(() => { if (!_open) _panel.style.display = 'none'; }, 200);
  }

  /* ── Public API ── */
  function markRead(id) {
    const list = load().map(n => n.id === id ? { ...n, read: true } : n);
    save(list);
    _updateBadge();
    if (_open) _panel.innerHTML = _buildPanel();
  }

  function markAllRead() {
    save(load().map(n => ({ ...n, read: true })));
    _updateBadge();
    if (_open) _panel.innerHTML = _buildPanel();
  }

  function clearAll() {
    save([]);
    _updateBadge();
    if (_open) _panel.innerHTML = _buildPanel();
  }

  /* ── Inject CSS ── */
  function _injectCSS() {
    if (document.getElementById('notif-css')) return;
    const s = document.createElement('style');
    s.id = 'notif-css';
    s.textContent = `
      @keyframes notifIn  { from { opacity:0; transform:translateY(20px) scale(.92); } to { opacity:1; transform:none; } }
      @keyframes notifOut { from { opacity:1; } to { opacity:0; transform:translateY(10px); } }

      #notifBell {
        position:relative; display:inline-flex; align-items:center; justify-content:center;
        width:38px; height:38px; border-radius:50%;
        background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.2);
        cursor:pointer; transition:background .15s; color:#f0e8ff; font-size:1.1rem;
        flex-shrink:0;
      }
      #notifBell:hover { background:rgba(167,139,250,.22); }

      .notif-badge {
        position:absolute; top:-4px; right:-4px; min-width:18px; height:18px;
        background:linear-gradient(135deg,#e11d48,#f87171);
        border-radius:99px; font-size:.62rem; font-weight:900; color:#fff;
        display:flex; align-items:center; justify-content:center; padding:0 4px;
        border:2px solid var(--bg,#0d0520); line-height:1;
      }

      #notifPanel {
        position:fixed; top:60px; right:16px; width:340px; max-width:95vw;
        z-index:9000; display:none;
      }
      .np-header {
        display:flex; align-items:center; justify-content:space-between; gap:10px;
        padding:14px 16px; border-bottom:1px solid rgba(167,139,250,.15);
        flex-wrap:wrap;
      }
      .np-title {
        font-family:'Fredoka One',cursive; font-size:1rem; color:#f0e8ff;
        display:flex; align-items:center; gap:8px;
      }
      .np-unread-count {
        background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff;
        border-radius:99px; font-size:.65rem; font-weight:900; padding:2px 8px;
        font-family:'Nunito',sans-serif;
      }
      .np-actions { display:flex; gap:6px; flex-wrap:wrap; }
      .np-btn {
        background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.2);
        color:#a78bfa; border-radius:99px; padding:4px 12px;
        font-family:'Nunito',sans-serif; font-weight:800; font-size:.72rem; cursor:pointer;
        transition:background .15s;
      }
      .np-btn:hover { background:rgba(167,139,250,.22); }
      .np-btn.red { background:rgba(248,113,113,.1); border-color:rgba(248,113,113,.25); color:#f87171; }
      .np-btn.red:hover { background:rgba(248,113,113,.22); }

      .np-list {
        max-height:420px; overflow-y:auto; padding:8px 0;
        scrollbar-width:thin; scrollbar-color:rgba(167,139,250,.3) transparent;
      }
      .np-empty {
        text-align:center; padding:40px; color:#9d8ec7; font-weight:700; font-size:.88rem;
      }
      .np-item {
        display:flex; align-items:flex-start; gap:12px; padding:12px 16px;
        border-bottom:1px solid rgba(167,139,250,.07); cursor:pointer;
        transition:background .15s; position:relative;
      }
      .np-item:hover { background:rgba(167,139,250,.06); }
      .np-item.unread { background:rgba(167,139,250,.04); }
      .np-item-icon {
        width:36px; height:36px; border-radius:50%; border:1px solid;
        display:flex; align-items:center; justify-content:center;
        font-size:.95rem; flex-shrink:0;
      }
      .np-item-body { flex:1; min-width:0; }
      .np-item-title {
        font-family:'Fredoka One',cursive; font-size:.88rem; color:#f0e8ff;
        margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }
      .np-item-text  { font-size:.76rem; color:#9d8ec7; font-weight:700; line-height:1.4; }
      .np-item-time  { font-size:.68rem; color:#6b5a8e; font-weight:700; margin-top:4px; }
      .np-dot {
        width:8px; height:8px; border-radius:50%;
        background:linear-gradient(135deg,#7c3aed,#a78bfa);
        flex-shrink:0; margin-top:4px;
      }

      #notifPanelInner {
        background:linear-gradient(180deg,#1a0840 0%,#120530 100%);
        border:1px solid rgba(167,139,250,.2);
        border-radius:18px;
        box-shadow:0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(167,139,250,.08);
        overflow:hidden;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Init: inject bell into topbar ── */
  function _init() {
    _injectCSS();

    /* Create panel container */
    _panel = document.getElementById('notifPanel');
    if (!_panel) {
      _panel = document.createElement('div');
      _panel.id = 'notifPanel';
      document.body.appendChild(_panel);
    }

    /* Close panel when clicking outside */
    document.addEventListener('click', e => {
      if (_open && !_panel.contains(e.target) && !document.getElementById('notifBell')?.contains(e.target)) {
        closePanel();
      }
    });

    /* Find the existing 🔔 button in topbar and replace/augment it */
    let bellEl = document.getElementById('notifBellBtn')
      || document.getElementById('notifBell')
      || (() => {
          let found = null;
          document.querySelectorAll('.tb-btn').forEach(btn => {
            if (btn.textContent.includes('🔔') || btn.getAttribute('aria-label') === 'Notifications') found = btn;
          });
          return found;
        })();

    if (bellEl) {
      bellEl.id = 'notifBell';
      bellEl.innerHTML = '🔔<span class="notif-badge" style="display:none">0</span>';
      bellEl.onclick = null;
      bellEl.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
    } else {
      const tbRight = document.querySelector('.topbar-right');
      if (tbRight) {
        const bell = document.createElement('button');
        bell.id = 'notifBell';
        bell.innerHTML = '🔔<span class="notif-badge" style="display:none">0</span>';
        bell.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
        tbRight.insertBefore(bell, tbRight.firstChild);
      }
    }

    _updateBadge();

    /* Seed welcome notification on first visit */
    const list = load();
    if (list.length === 0) {
      push('👋 Welcome to Eylox!', 'Your account is ready. Play games to earn coins and unlock items in the shop!', 'system');
      push('🎁 Daily Reward', 'Spin the wheel on the Home page to collect your free daily coins!', 'reward');
      push('🏆 First Challenge', 'Complete a game and score over 1,000 points to earn your first badge!', 'event');
    }
  }

  /* ── Boot on DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  return { push, markRead, markAllRead, clearAll, unreadCount, togglePanel };
})();
