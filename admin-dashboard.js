/* ============================================================
   EYLOX — Admin Dashboard  v1.0
   Connects admin.html to the real backend API.
   - Server-side access verification
   - Live stats from /api/admin/stats
   - Real player list from /api/admin/online + /api/admin/users
   - Ban/unban, coin adjustment via API
   - Broadcast panel wired to /api/admin/broadcast
   - Economy overview, audit log, player management
   - 30-second auto-refresh
   ============================================================ */
'use strict';

(function AdminDashboard() {

  /* ── Config ── */
  const API = 'http://localhost:3001';

  /* ── Helpers ── */
  function getToken() {
    return localStorage.getItem('eylox_token') || '';
  }

  async function apiFetch(path, opts = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    };
    const res = await fetch(API + path, {
      ...opts,
      headers,
      signal: opts.signal ?? AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || res.status);
    }
    return res.json();
  }

  function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* Forward to the existing toast/log helpers that live in the inline <script> */
  function log(msg, type) {
    if (typeof addLog === 'function') addLog(msg, type || 'info');
  }
  function notify(msg, color) {
    if (typeof toast === 'function') toast(msg, color || 'var(--purple)');
  }

  /* ── Server verification ── */
  async function verifyAccess() {
    try {
      await apiFetch('/api/admin/verify');
      return true;
    } catch { return false; }
  }

  /* ── Live stats refresh ── */
  async function refreshStats() {
    try {
      const d = await apiFetch('/api/admin/stats');
      window._adminStats = d;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('st-online', d.onlineCount ?? '—');
      set('st-bans', d.bannedCount ?? '—');
      const s = Math.floor(d.serverUptime || 0);
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      set('st-uptime', h > 0 ? `${h}h ${m}m` : `${m}m`);
    } catch { /* server offline */ }
  }

  /* ── Live player list ── */
  async function refreshPlayers() {
    const list = document.getElementById('playersList');
    if (!list) return;
    try {
      const [onlineData, userData] = await Promise.all([
        apiFetch('/api/admin/online'),
        apiFetch('/api/admin/users?limit=100'),
      ]);
      const online = onlineData.users || [];
      if (!online.length) {
        list.innerHTML = '<div style="color:var(--muted);font-size:.8rem;font-weight:700;text-align:center;padding:16px">No players online right now.</div>';
        return;
      }
      const userMap = {};
      (userData.users || []).forEach(u => { userMap[u.username] = u; });

      list.innerHTML = online.map(name => {
        const u = userMap[name] || { username: name, avatar: '🎮', coins: 0, level: 1, id: null, banned: false, isOwner: false };
        const badge  = u.isOwner ? 'owner' : u.isPremium ? 'mod' : 'player';
        const blabel = u.isOwner ? '👑 Owner' : u.isPremium ? '⭐ Premium' : '🎮 Player';
        const uid    = esc(u.id || '');
        const uname  = esc(u.username || '');
        const avatar = esc(u.avatar || '🎮');
        return `
          <div class="player-row" onclick="fillPlayer('${uname}')">
            <div class="pr-av">${avatar}</div>
            <div class="pr-name">${uname}</div>
            <span class="pr-badge badge-${esc(badge)}">${blabel}</span>
            <span style="font-size:.72rem;color:var(--muted);font-weight:700">Lv.${Number(u.level)||1}</span>
            <div class="pr-actions">
              ${uid && !u.isOwner ? `<button class="pr-act" onclick="event.stopPropagation();adminBanPlayer('${uid}','${uname}',${!!u.banned})">${u.banned ? '✅ Unban' : '🚫 Ban'}</button>` : ''}
              <button class="pr-act" onclick="event.stopPropagation();adminGiveCoins('${uid}','${uname}')">🪙</button>
              <button class="pr-act green" onclick="event.stopPropagation();quickAction('heal','${uname}')">Heal</button>
              <button class="pr-act" onclick="event.stopPropagation();quickAction('teleport','${uname}')">TP</button>
            </div>
          </div>`;
      }).join('');
    } catch {
      /* Fall back to the existing static renderer */
      if (typeof renderPlayers === 'function') renderPlayers();
    }
  }

  /* ── Public: Ban / Unban ── */
  window.adminBanPlayer = async function(userId, username, currentlyBanned) {
    const action = currentlyBanned ? 'unban' : 'ban';
    let reason = '';
    if (!currentlyBanned) {
      reason = window.prompt(`Ban reason for ${username}:`, 'Violation of terms of service');
      if (reason === null) return;
      reason = reason.trim() || 'Violation of terms of service';
    }
    try {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/ban`, {
        method: 'POST',
        body: JSON.stringify({ banned: !currentlyBanned, reason }),
      });
      log(`${currentlyBanned ? '✅ Unbanned' : '🚫 Banned'} ${username}${reason ? '. Reason: ' + reason : ''}`, currentlyBanned ? 'ok' : 'err');
      notify(`${currentlyBanned ? '✅' : '🚫'} ${username} ${currentlyBanned ? 'unbanned' : 'banned'}`, currentlyBanned ? 'var(--green)' : 'var(--red)');
      setTimeout(refreshPlayers, 600);
    } catch (e) {
      notify(`⚠️ Ban failed: ${e.message}`, 'var(--red)');
    }
  };

  /* ── Public: Coin Adjustment ── */
  window.adminGiveCoins = async function(userId, username) {
    if (!userId) { notify('⚠️ No user ID — server may be offline', 'var(--yellow)'); return; }
    const raw = window.prompt(`Coins to adjust for ${username} (negative to remove):`);
    if (raw === null) return;
    const amount = parseInt(raw, 10);
    if (isNaN(amount)) { notify('⚠️ Invalid amount', 'var(--red)'); return; }
    try {
      const result = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/coins`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason: 'Admin adjustment via dashboard' }),
      });
      log(`🪙 ${amount >= 0 ? 'Gave' : 'Removed'} ${Math.abs(amount)} coins ${amount >= 0 ? 'to' : 'from'} ${username}. New total: ${result.coins}`, 'ok');
      notify(`🪙 ${amount >= 0 ? '+' : ''}${amount} for ${username}`, 'var(--teal)');
    } catch (e) {
      notify(`⚠️ Coins failed: ${e.message}`, 'var(--red)');
    }
  };

  /* ── Public: Server Broadcast ── */
  window.adminBroadcast = async function(message, type) {
    if (!message || !message.trim()) { notify('⚠️ Message cannot be empty', 'var(--yellow)'); return; }
    const announcementType = type || 'announcement';
    try {
      const result = await apiFetch('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message, type: announcementType, duration: 8000 }),
      });
      log(`📢 Broadcast sent to ${result.recipients} client(s): "${message}"`, 'ok');
      notify(`📢 Sent to ${result.recipients} online client${result.recipients !== 1 ? 's' : ''}`, 'var(--purple)');
    } catch {
      /* Server offline — log it but still show local overlay */
      log('📢 Broadcast (server offline — local only)', 'warn');
    }
    if (typeof showAnnounce === 'function') showAnnounce(message);
  };

  /* ── Public: Maintenance Mode ── */
  window.adminMaintenance = async function(enabled) {
    let message = 'EYLOX is undergoing maintenance. Back shortly!';
    if (enabled) {
      const m = window.prompt('Maintenance message:', message);
      if (m === null) return;
      message = m.trim() || message;
    }
    try {
      await apiFetch('/api/admin/maintenance', {
        method: 'POST',
        body: JSON.stringify({ enabled, message }),
      });
      log(`🔧 Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}${enabled ? ': ' + message : ''}`, enabled ? 'warn' : 'ok');
      notify(`🔧 Maintenance ${enabled ? 'ON' : 'OFF'}`, enabled ? 'var(--yellow)' : 'var(--green)');
    } catch (e) {
      notify(`⚠️ Maintenance error: ${e.message}`, 'var(--red)');
    }
  };

  /* ── Panel: Player Management ── */
  window.showPlayerManagement = async function() {
    document.querySelectorAll('.as-link').forEach(l => l.classList.remove('active'));
    const main = document.querySelector('.admin-main');
    main.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted);font-size:.9rem;font-weight:700">⏳ Loading players…</div>';
    try {
      const data = await apiFetch('/api/admin/users?limit=100&sort=coins&order=desc');
      _renderPlayerTable(main, data.users || [], data.total || 0);
      log('👥 Player management opened.', 'info');
    } catch (e) {
      main.innerHTML = _backCard('⚠️ Could not load players. Server may be offline.');
    }
  };

  function _renderPlayerTable(main, users, total) {
    const rows = users.map(u => {
      const uid    = esc(u.id || '');
      const uname  = esc(u.username || '');
      const avatar = esc(u.avatar || '🎮');
      const email  = esc(u.email || 'No email');
      return `
        <tr style="border-bottom:1px solid rgba(167,139,250,.08)">
          <td style="padding:10px 14px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0">${avatar}</div>
              <div>
                <div style="font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--text)">${uname}${u.isOwner ? ' 👑' : ''}</div>
                <div style="font-size:.68rem;color:var(--muted)">${email}</div>
              </div>
            </div>
          </td>
          <td style="padding:10px 14px;font-size:.78rem;color:var(--muted)">Lv.${Number(u.level)||1}</td>
          <td style="padding:10px 14px;font-size:.78rem;color:var(--yellow);font-weight:800">🪙 ${(Number(u.coins)||0).toLocaleString()}</td>
          <td style="padding:10px 14px">
            <span style="padding:2px 8px;border-radius:99px;font-size:.65rem;font-weight:900;${u.online ? 'background:rgba(74,222,128,.15);color:#4ade80' : 'background:rgba(167,139,250,.1);color:var(--muted)'}">${u.online ? '🟢 Online' : '⚫ Offline'}</span>
            ${u.banned ? '<span style="margin-left:4px;padding:2px 8px;border-radius:99px;font-size:.65rem;font-weight:900;background:rgba(248,113,113,.15);color:#f87171">🚫 Banned</span>' : ''}
            ${u.isPremium ? '<span style="margin-left:4px;padding:2px 8px;border-radius:99px;font-size:.65rem;font-weight:900;background:rgba(167,139,250,.18);color:var(--purple)">⭐ Premium</span>' : ''}
          </td>
          <td style="padding:10px 14px">
            <div style="display:flex;gap:5px;flex-wrap:wrap">
              ${uid && !u.isOwner ? `<button class="pr-act" onclick="adminBanPlayer('${uid}','${uname}',${!!u.banned})">${u.banned ? '✅ Unban' : '🚫 Ban'}</button>` : ''}
              ${uid ? `<button class="pr-act green" onclick="adminGiveCoins('${uid}','${uname}')">🪙 Coins</button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

    main.innerHTML = `
      <div style="margin-bottom:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--text);flex:1;margin:0">👥 Player Management</h2>
        <button onclick="showPlayerManagement()" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">🔄 Refresh</button>
        <button onclick="restoreCommandView(null)" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">← Back</button>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
        <input id="pmSearch" placeholder="🔍 Search username or email…"
          style="flex:1;min-width:180px;background:rgba(167,139,250,.07);border:1px solid var(--border2);border-radius:10px;padding:10px 14px;color:var(--text);font-family:'Nunito',sans-serif;font-weight:700;font-size:.85rem;outline:none"/>
        <span style="font-size:.78rem;color:var(--muted);font-weight:700">${total} total players</span>
      </div>
      <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:rgba(167,139,250,.06);border-bottom:1px solid var(--border)">
              ${['Player','Level','Coins','Status','Actions'].map(h => `<th style="padding:10px 14px;text-align:left;font-size:.65rem;font-weight:900;color:var(--muted);letter-spacing:1px;text-transform:uppercase">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody style="color:var(--text)" id="pmBody">${rows || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted)">No players found.</td></tr>'}</tbody>
        </table>
      </div>`;

    const searchEl = document.getElementById('pmSearch');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        document.querySelectorAll('#pmBody tr').forEach(row => {
          row.style.display = (!q || row.textContent.toLowerCase().includes(q)) ? '' : 'none';
        });
      });
      searchEl.focus();
    }
  }

  /* ── Panel: Economy Overview ── */
  window.showEconomyPanel = async function() {
    document.querySelectorAll('.as-link').forEach(l => l.classList.remove('active'));
    const main = document.querySelector('.admin-main');
    main.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted);font-size:.9rem;font-weight:700">⏳ Loading economy data…</div>';
    try {
      const d = await apiFetch('/api/admin/economy');
      const stat = (val, lbl, col) => `<div class="stat-card"><div class="stat-val" style="color:${col}">${val}</div><div class="stat-lbl">${lbl}</div></div>`;
      main.innerHTML = `
        <div style="margin-bottom:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--yellow);flex:1;margin:0">💰 Economy Overview</h2>
          <button onclick="showEconomyPanel()" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">🔄 Refresh</button>
          <button onclick="restoreCommandView(null)" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">← Back</button>
        </div>
        <div class="stat-row">
          ${stat((d.total||0).toLocaleString(), '🪙 Total Coins', 'var(--yellow)')}
          ${stat((d.avg||0).toLocaleString(), '📊 Avg / Player', 'var(--teal)')}
          ${stat((d.max||0).toLocaleString(), '🏆 Max Balance', 'var(--green)')}
          ${stat(d.rich||0, '💎 Rich (10k+)', 'var(--orange)')}
          ${stat(d.broke||0, '😢 Broke (0)', 'var(--red)')}
          ${stat(d.premium||0, '⭐ Premium', 'var(--purple)')}
          ${stat(d.userCount||0, '👥 Total Users', 'var(--blue)')}
        </div>
        ${Object.keys(d.tierBreakdown || {}).length ? `
        <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:18px 20px;margin-top:4px">
          <div style="font-size:.72rem;font-weight:900;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">📋 Subscription Tiers</div>
          ${Object.entries(d.tierBreakdown).map(([tier, count]) => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(167,139,250,.08)">
              <span style="font-size:.85rem;font-weight:800;color:var(--text);flex:1;text-transform:capitalize">${esc(tier)}</span>
              <span style="font-size:.85rem;font-weight:900;color:var(--purple)">${Number(count)||0} user${count !== 1 ? 's' : ''}</span>
            </div>`).join('')}
        </div>` : ''}`;
      log('💰 Economy panel opened.', 'info');
    } catch (e) {
      main.innerHTML = _backCard('⚠️ Could not load economy data. Server may be offline.');
    }
  };

  /* ── Panel: Audit Logs ── */
  window.showAuditLogs = async function() {
    document.querySelectorAll('.as-link').forEach(l => l.classList.remove('active'));
    const main = document.querySelector('.admin-main');
    main.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted);font-size:.9rem;font-weight:700">⏳ Loading audit logs…</div>';
    try {
      const logs = await apiFetch('/api/admin/logs?limit=100');
      const rows = logs.length ? logs.map(l => {
        const detail = esc(typeof l.detail === 'object' ? JSON.stringify(l.detail) : String(l.detail || ''));
        return `
          <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(167,139,250,.07)">
            <span style="color:rgba(196,181,253,.7);flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:.7rem;min-width:130px">${esc(new Date(l.ts).toLocaleString())}</span>
            <span style="font-weight:900;color:var(--purple);flex-shrink:0;min-width:130px;font-size:.76rem">${esc(l.action)}</span>
            <span style="color:var(--pink);flex-shrink:0;min-width:80px;font-size:.76rem">by ${esc(l.by)}</span>
            <span style="color:var(--muted);font-size:.74rem;font-family:'JetBrains Mono',monospace;word-break:break-all">${detail}</span>
          </div>`;
      }).join('') : '<div style="color:var(--muted);font-size:.85rem;font-weight:700;text-align:center;padding:32px">No audit entries yet. Actions will appear here once admin tools are used.</div>';

      main.innerHTML = `
        <div style="margin-bottom:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--purple);flex:1;margin:0">📋 Audit Log</h2>
          <span style="font-size:.8rem;color:var(--muted);font-weight:700">${logs.length} entries</span>
          <button onclick="showAuditLogs()" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">🔄 Refresh</button>
          <button onclick="restoreCommandView(null)" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">← Back</button>
        </div>
        <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:16px 20px;max-height:70vh;overflow-y:auto">${rows}</div>`;
      log('📋 Audit log opened.', 'info');
    } catch {
      main.innerHTML = _backCard('⚠️ Could not load audit logs. Server may be offline.');
    }
  };

  /* ── Panel: Broadcast ── */
  window.showBroadcastPanel = function() {
    document.querySelectorAll('.as-link').forEach(l => l.classList.remove('active'));
    const main = document.querySelector('.admin-main');
    const QUICK = [
      ['🎉 Welcome to EYLOX! Have fun playing!', 'announcement'],
      ['⚠️ Server restart in 5 minutes. Save your progress!', 'warning'],
      ['🏆 Double XP event is now LIVE! Play now!', 'announcement'],
      ['🪙 Coin drop event starting in 60 seconds!', 'announcement'],
      ['🔧 Brief maintenance underway. Back soon!', 'warning'],
      ['🎊 New update is LIVE! Check it out!', 'announcement'],
    ];
    main.innerHTML = `
      <div style="margin-bottom:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--teal);flex:1;margin:0">📢 Broadcast & Maintenance</h2>
        <button onclick="restoreCommandView(null)" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">← Back</button>
      </div>
      <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:20px;margin-bottom:16px">
        <div style="font-size:.72rem;font-weight:900;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">📢 Custom Announcement</div>
        <textarea id="bcMsg" placeholder="Type your announcement here…" rows="3"
          style="width:100%;background:rgba(167,139,250,.07);border:1px solid var(--border2);border-radius:10px;padding:12px 14px;color:var(--text);font-family:'Nunito',sans-serif;font-weight:700;font-size:.9rem;outline:none;resize:vertical;box-sizing:border-box"></textarea>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button onclick="adminBroadcast(document.getElementById('bcMsg').value,'announcement')"
            style="background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:none;border-radius:10px;padding:10px 22px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer">📢 Broadcast</button>
          <button onclick="adminBroadcast(document.getElementById('bcMsg').value,'warning')"
            style="background:rgba(253,230,138,.12);border:1px solid rgba(253,230,138,.3);color:var(--yellow);border-radius:10px;padding:10px 22px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer">⚠️ Warning</button>
          <button onclick="adminMaintenance(true)"
            style="background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);color:var(--red);border-radius:10px;padding:10px 22px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer">🔧 Maintenance ON</button>
          <button onclick="adminMaintenance(false)"
            style="background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.25);color:var(--green);border-radius:10px;padding:10px 22px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer">✅ Maintenance OFF</button>
        </div>
      </div>
      <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:20px">
        <div style="font-size:.72rem;font-weight:900;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">⚡ Quick Announcements</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${QUICK.map(([msg, type]) => `
            <button onclick="adminBroadcast('${msg.replace(/'/g, "\\'").replace(/"/g, '&quot;')}','${type}')"
              style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--text);border-radius:10px;padding:9px 16px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;text-align:left;transition:background .15s"
              onmouseover="this.style.background='rgba(167,139,250,.22)'" onmouseout="this.style.background='rgba(167,139,250,.1)'">${msg}</button>`).join('')}
        </div>
      </div>`;
    log('📢 Broadcast panel opened.', 'info');
  };

  /* ── Panel: Live Server Stats ── */
  window.showServerStats = async function() {
    document.querySelectorAll('.as-link').forEach(l => l.classList.remove('active'));
    const main = document.querySelector('.admin-main');
    main.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted);font-size:.9rem;font-weight:700">⏳ Loading server stats…</div>';
    try {
      const d = await apiFetch('/api/admin/stats');
      const mb = val => ((val || 0) / 1048576).toFixed(1) + ' MB';
      const pct = (a, b) => b ? ((a / b) * 100).toFixed(1) + '%' : '—';
      const stat = (val, lbl, col) => `<div class="stat-card"><div class="stat-val" style="color:${col}">${val}</div><div class="stat-lbl">${lbl}</div></div>`;

      const regChart = (d.regTrend || []).map(day => {
        const barH = day.count ? Math.max(4, Math.min(60, day.count * 8)) : 2;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
          <span style="font-size:.7rem;font-weight:800;color:var(--purple)">${day.count || 0}</span>
          <div style="width:100%;height:${barH}px;background:linear-gradient(180deg,#a78bfa,#7c3aed);border-radius:4px"></div>
          <span style="font-size:.62rem;color:var(--muted);font-weight:700">${day.label}</span>
        </div>`;
      }).join('');

      main.innerHTML = `
        <div style="margin-bottom:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--blue);flex:1;margin:0">📡 Live Server Stats</h2>
          <button onclick="showServerStats()" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">🔄 Refresh</button>
          <button onclick="restoreCommandView(null)" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:5px 14px;border-radius:99px;cursor:pointer">← Back</button>
        </div>
        <div class="stat-row">
          ${stat(d.totalUsers || 0, '👥 Total Users', 'var(--text)')}
          ${stat(d.onlineCount || 0, '🟢 Online Now', 'var(--green)')}
          ${stat(d.premiumCount || 0, '⭐ Premium', 'var(--purple)')}
          ${stat(d.bannedCount || 0, '🚫 Banned', 'var(--red)')}
          ${stat((d.totalCoins || 0).toLocaleString(), '🪙 Coins', 'var(--yellow)')}
          ${stat(d.totalProjects || 0, '🎮 Projects', 'var(--teal)')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px">
          <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:18px 20px">
            <div style="font-size:.72rem;font-weight:900;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">🖥️ Node.js Server</div>
            ${[
              ['Node', esc(d.nodeVersion || '—')],
              ['Uptime', (() => { const s=Math.floor(d.serverUptime||0); const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}m`:`${m}m`; })()],
              ['Heap Used', mb(d.memUsage)],
              ['Messages', (d.msgCount||0).toLocaleString()],
              ['Published Projects', d.pubProjects||0],
            ].map(([k,v]) => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(167,139,250,.08)">
                <span style="font-size:.8rem;color:var(--muted);font-weight:700">${k}</span>
                <span style="font-size:.8rem;color:var(--text);font-weight:800">${v}</span>
              </div>`).join('')}
          </div>
          <div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:18px 20px">
            <div style="font-size:.72rem;font-weight:900;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">📈 Registrations (7 days)</div>
            <div style="display:flex;align-items:flex-end;gap:4px;height:80px">${regChart || '<span style="color:var(--muted);font-size:.8rem">No data</span>'}</div>
          </div>
        </div>`;
      log('📡 Server stats opened.', 'info');
    } catch {
      main.innerHTML = _backCard('⚠️ Could not load server stats. Backend may be offline.');
    }
  };

  /* ── Helper: Back card ── */
  function _backCard(msg) {
    return `<div style="text-align:center;padding:60px;color:var(--red);font-size:.9rem;font-weight:700">${msg}<br><br>
      <button onclick="restoreCommandView(null)" style="background:rgba(167,139,250,.1);border:1px solid var(--border2);color:var(--muted);font-size:.72rem;font-weight:800;padding:8px 20px;border-radius:99px;cursor:pointer">← Back</button>
    </div>`;
  }

  /* ── Intercept :announce / :broadcast commands → API ── */
  function hookCommands() {
    if (typeof CMD_RESPONSES === 'undefined') return;
    CMD_RESPONSES[':announce']  = (p, msg) => {
      const text = (msg && msg.trim()) || (p !== 'player' && p.trim()) || '';
      if (!text) return { msg: '⚠️ Usage: :announce Your message here', type: 'warn', toast: '⚠️ No message' };
      adminBroadcast(text, 'announcement');
      return { msg: `📢 Announced to all: "${text}"`, type: 'ok', toast: '📢 Announced!' };
    };
    CMD_RESPONSES[':broadcast'] = CMD_RESPONSES[':announce'];
    CMD_RESPONSES[':maintenance'] = (_, state) => {
      adminMaintenance(state !== 'off' && state !== 'false' && state !== '0');
      return { msg: `🔧 Maintenance toggled (${state || 'on'})`, type: 'warn', toast: '🔧 Maintenance toggled' };
    };
  }

  /* ── Inject "Live Tools" section into sidebar ── */
  function injectSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (!sidebar || document.getElementById('ad-live-section')) return;
    const frag = document.createElement('div');
    frag.id = 'ad-live-section';
    frag.innerHTML = `
      <div class="as-section">Live Tools</div>
      <a class="as-link" onclick="showServerStats()"><span class="icon">📡</span> Server Stats</a>
      <a class="as-link" onclick="showPlayerManagement()"><span class="icon">👥</span> Player Management</a>
      <a class="as-link" onclick="showEconomyPanel()"><span class="icon">💰</span> Economy</a>
      <a class="as-link" onclick="showBroadcastPanel()"><span class="icon">📢</span> Broadcast</a>
      <a class="as-link" onclick="showAuditLogs()"><span class="icon">📋</span> Audit Logs</a>`;
    sidebar.appendChild(frag);
  }

  /* ── Inject server verification badge into topbar ── */
  function showVerifiedBadge() {
    const topbar = document.querySelector('.admin-topbar');
    if (!topbar || document.getElementById('ad-verify-badge')) return;
    const badge = document.createElement('span');
    badge.id = 'ad-verify-badge';
    badge.style.cssText = 'font-size:.65rem;font-weight:900;color:var(--green);border:1px solid rgba(74,222,128,.3);background:rgba(74,222,128,.1);padding:3px 10px;border-radius:99px;flex-shrink:0';
    badge.textContent = '✅ Server Verified';
    const spacer = topbar.querySelector('.at-spacer');
    if (spacer) spacer.after(badge);
  }

  function showOfflineBadge() {
    const topbar = document.querySelector('.admin-topbar');
    if (!topbar || document.getElementById('ad-verify-badge')) return;
    const badge = document.createElement('span');
    badge.id = 'ad-verify-badge';
    badge.style.cssText = 'font-size:.65rem;font-weight:900;color:var(--yellow);border:1px solid rgba(253,230,138,.3);background:rgba(253,230,138,.1);padding:3px 10px;border-radius:99px;flex-shrink:0';
    badge.textContent = '⚠️ Server Offline';
    const spacer = topbar.querySelector('.at-spacer');
    if (spacer) spacer.after(badge);
  }

  /* ── Init ── */
  async function init() {
    /* Wait for the inline <script> to finish (restoreCommandView etc. are synchronous) */
    const onReady = fn => {
      if (document.readyState !== 'loading') fn();
      else document.addEventListener('DOMContentLoaded', fn, { once: true });
    };

    onReady(async () => {
      /* 1. Server verification */
      const verified = await verifyAccess();
      if (verified) {
        showVerifiedBadge();
        log('✅ Backend connection verified. Live data is active.', 'ok');
      } else {
        showOfflineBadge();
        log('⚠️ Backend is offline. Stats and live player list are unavailable.', 'warn');
        /* Still inject sidebar so local panels work */
        injectSidebar();
        hookCommands();
        return;
      }

      /* 2. Enrich sidebar with Live Tools */
      injectSidebar();

      /* 3. Wire commands to API */
      hookCommands();

      /* 4. Load initial live data */
      await Promise.all([refreshStats(), refreshPlayers()]);

      /* 5. Poll every 30s */
      setInterval(async () => {
        await refreshStats();
        if (document.getElementById('playersList')) await refreshPlayers();
      }, 30000);
    });
  }

  init();

})();
