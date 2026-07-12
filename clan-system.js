/* ============================================================
   EYLOX — Clan System v2.0
   Full role hierarchy: Owner → Admin → Moderator → Member
   Owner has exclusive control over clan settings & management
   ============================================================ */
'use strict';

(function EyloxClanSystem() {

  const CLAN_KEY   = 'eylox_my_clan';
  const CLANS_KEY  = 'eylox_clans_db';
  const MAX_MEMBERS = 50;

  const ROLES = {
    owner:     { id: 'owner',     label: 'Owner',     icon: '👑', rank: 4, color: '#fbbf24' },
    admin:     { id: 'admin',     label: 'Admin',     icon: '⚡', rank: 3, color: '#60a5fa' },
    moderator: { id: 'moderator', label: 'Moderator', icon: '🛡️', rank: 2, color: '#4ade80' },
    member:    { id: 'member',    label: 'Member',    icon: '👤', rank: 1, color: '#a78bfa' },
  };

  const CLAN_EMOJIS = ['🛡️','⚔️','🔥','🌟','💎','🦅','🐉','🌙','⚡','🏆','🎯','🌊','❄️','🌹','🦁'];

  /* ── Storage ── */
  function getMe() { try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; } }
  function getMyClan() { try { return JSON.parse(localStorage.getItem(CLAN_KEY) || 'null'); } catch { return null; } }
  function saveMyClan(c) { localStorage.setItem(CLAN_KEY, JSON.stringify(c)); }
  function getAllClans() { try { return JSON.parse(localStorage.getItem(CLANS_KEY) || '[]'); } catch { return []; } }
  function saveAllClans(list) { localStorage.setItem(CLANS_KEY, JSON.stringify(list)); }

  function syncClan(clan) {
    if (!clan) return;
    saveMyClan(clan);
    const all = getAllClans();
    const idx = all.findIndex(c => c.id === clan.id);
    if (idx !== -1) all[idx] = clan; else all.push(clan);
    saveAllClans(all);
  }

  function getMemberRole(clan, username) {
    const m = clan.members.find(m => m.username === username);
    return m ? ROLES[m.role] || ROLES.member : null;
  }

  function getMyRole(clan) {
    const me = getMe();
    return getMemberRole(clan, me.username);
  }

  function canDo(clan, action) {
    const role = getMyRole(clan);
    if (!role) return false;
    const rank = role.rank;
    const perms = {
      deleteClan:       rank >= 4,
      transferOwnership: rank >= 4,
      changeSettings:   rank >= 4,
      editLogo:         rank >= 4,
      editDescription:  rank >= 4,
      kickAdmin:        rank >= 4,
      kickModerator:    rank >= 4,
      promoteToAdmin:   rank >= 4,
      promoteToMod:     rank >= 3,
      kickMember:       rank >= 2,
      sendChat:         rank >= 1,
    };
    return perms[action] || false;
  }

  /* ── Create Clan ── */
  function createClan(name, tag, description, emblem) {
    if (getMyClan()) { toast('You are already in a clan.', 'warn'); return null; }
    const me = getMe();
    if (!me.username) { toast('Must be logged in.', 'warn'); return null; }
    if (!name?.trim() || name.trim().length < 2) { toast('Clan name must be at least 2 characters.', 'warn'); return null; }
    const all = getAllClans();
    if (all.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast('Clan name already taken!', 'warn'); return null;
    }
    const clan = {
      id: `clan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      tag: (tag || name.slice(0, 5)).toUpperCase().slice(0, 5),
      description: description || '',
      emblem: emblem || '🛡️',
      banner: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
      createdAt: Date.now(),
      xp: 0, level: 1, xpToNext: 5000,
      wins: 0, totalMembers: 1,
      isOpen: true, minLevel: 0,
      settings: { joinApproval: false, allowChat: true, allowInvites: true },
      announcements: [],
      members: [{
        username: me.username,
        role: 'owner',
        joinedAt: Date.now(),
        xp: 0,
        lastSeen: Date.now(),
      }],
      chat: [],
    };
    all.push(clan);
    saveAllClans(all);
    saveMyClan(clan);
    toast(`Clan "${clan.name}" created! Tag: [${clan.tag}]`, 'success');
    document.dispatchEvent(new CustomEvent('eylox:clan:created', { detail: clan }));
    return clan;
  }

  /* ── Join Clan ── */
  function joinClan(clanId) {
    if (getMyClan()) { toast('Leave your current clan first.', 'warn'); return false; }
    const me = getMe();
    if (!me.username) return false;
    const all = getAllClans();
    const idx = all.findIndex(c => c.id === clanId);
    if (idx === -1) { toast('Clan not found.', 'warn'); return false; }
    const clan = all[idx];
    if (clan.members.length >= MAX_MEMBERS) { toast('Clan is full.', 'warn'); return false; }
    if (clan.members.find(m => m.username === me.username)) { toast('Already in this clan.', 'warn'); return false; }
    clan.members.push({ username: me.username, role: 'member', joinedAt: Date.now(), xp: 0, lastSeen: Date.now() });
    all[idx] = clan;
    saveAllClans(all);
    saveMyClan(clan);
    toast(`Joined clan "${clan.name}"!`, 'success');
    return true;
  }

  /* ── Leave Clan ── */
  function leaveClan() {
    const clan = getMyClan();
    if (!clan) { toast('Not in a clan.', 'warn'); return; }
    const me = getMe();
    const myRole = getMyRole(clan);
    if (myRole?.rank === 4 && clan.members.length > 1) {
      toast('Transfer ownership before leaving.', 'warn'); return;
    }
    clan.members = clan.members.filter(m => m.username !== me.username);
    const all = getAllClans();
    const idx = all.findIndex(c => c.id === clan.id);
    if (idx !== -1) {
      if (clan.members.length === 0) all.splice(idx, 1);
      else all[idx] = clan;
      saveAllClans(all);
    }
    localStorage.removeItem(CLAN_KEY);
    toast('You have left the clan.', 'info');
    document.dispatchEvent(new CustomEvent('eylox:clan:left'));
  }

  /* ── Kick Member ── */
  function kickMember(username) {
    const clan = getMyClan();
    if (!clan) return;
    const target = clan.members.find(m => m.username === username);
    if (!target) { toast('Member not found.', 'warn'); return; }
    const targetRole = ROLES[target.role] || ROLES.member;

    if (targetRole.rank === 4) { toast("You can't kick the owner.", 'warn'); return; }
    if (targetRole.rank === 3 && !canDo(clan, 'kickAdmin')) {
      toast('Only the owner can kick admins.', 'warn'); return;
    }
    if (targetRole.rank === 2 && !canDo(clan, 'kickModerator')) {
      toast('Admins or above can kick moderators.', 'warn'); return;
    }
    if (!canDo(clan, 'kickMember')) { toast('No permission to kick.', 'warn'); return; }

    clan.members = clan.members.filter(m => m.username !== username);
    syncClan(clan);
    toast(`${username} has been removed from the clan.`, 'info');
    refreshPanel();
  }

  /* ── Promote/Demote ── */
  function setMemberRole(username, newRole) {
    const clan = getMyClan();
    if (!clan) return;
    if (!canDo(clan, newRole === 'admin' ? 'promoteToAdmin' : 'promoteToMod')) {
      toast('No permission.', 'warn'); return;
    }
    const member = clan.members.find(m => m.username === username);
    if (!member) { toast('Member not found.', 'warn'); return; }
    if (ROLES[member.role]?.rank === 4) { toast("Can't change owner's role.", 'warn'); return; }
    member.role = newRole;
    syncClan(clan);
    toast(`${username} is now ${ROLES[newRole].label}.`, 'success');
    refreshPanel();
  }

  /* ── Transfer Ownership ── */
  function transferOwnership(username) {
    const clan = getMyClan();
    if (!clan) return;
    if (!canDo(clan, 'transferOwnership')) { toast('Only the owner can transfer ownership.', 'warn'); return; }
    const me = getMe();
    const target = clan.members.find(m => m.username === username);
    if (!target) { toast('Member not found.', 'warn'); return; }
    const myMember = clan.members.find(m => m.username === me.username);
    if (myMember) myMember.role = 'admin';
    target.role = 'owner';
    syncClan(clan);
    toast(`${username} is now the clan owner.`, 'success');
    refreshPanel();
  }

  /* ── Delete Clan ── */
  function deleteClan() {
    const clan = getMyClan();
    if (!clan) return;
    if (!canDo(clan, 'deleteClan')) { toast('Only the owner can delete the clan.', 'warn'); return; }
    const all = getAllClans().filter(c => c.id !== clan.id);
    saveAllClans(all);
    localStorage.removeItem(CLAN_KEY);
    toast(`Clan "${clan.name}" has been deleted.`, 'info');
    document.dispatchEvent(new CustomEvent('eylox:clan:deleted'));
    closeClanPanel();
  }

  /* ── Update Settings ── */
  function updateClanSettings(settings) {
    const clan = getMyClan();
    if (!clan) return;
    if (!canDo(clan, 'changeSettings')) { toast('Only the owner can change settings.', 'warn'); return; }
    Object.assign(clan, settings);
    syncClan(clan);
    toast('Clan settings updated.', 'success');
  }

  /* ── Add XP ── */
  function addClanXP(amount) {
    const clan = getMyClan();
    if (!clan) return;
    const me = getMe();
    clan.xp = (clan.xp || 0) + amount;
    const member = clan.members.find(m => m.username === me.username);
    if (member) member.xp = (member.xp || 0) + amount;
    while (clan.xp >= clan.xpToNext) {
      clan.xp -= clan.xpToNext;
      clan.level++;
      clan.xpToNext = Math.floor(clan.xpToNext * 1.35);
      toast(`🎉 Clan leveled up to Level ${clan.level}!`, 'success');
    }
    syncClan(clan);
  }

  /* ── Chat ── */
  function sendClanChat(message) {
    const clan = getMyClan();
    if (!clan) { toast('Join a clan to use clan chat.', 'warn'); return; }
    if (!canDo(clan, 'sendChat')) { toast('Chat disabled.', 'warn'); return; }
    const me = getMe();
    const role = getMyRole(clan);
    const msg = {
      username: me.username,
      role: role?.id || 'member',
      text: message.slice(0, 300),
      ts: Date.now(),
    };
    clan.chat = [...(clan.chat || []), msg].slice(-100);
    syncClan(clan);
    appendChatMsg(msg);
  }

  /* ── Announce ── */
  function postAnnouncement(text) {
    const clan = getMyClan();
    if (!clan) return;
    if (!canDo(clan, 'changeSettings')) { toast('Admins and above can post announcements.', 'warn'); return; }
    const me = getMe();
    const ann = { text: text.slice(0, 500), by: me.username, ts: Date.now() };
    clan.announcements = [...(clan.announcements || []), ann].slice(-5);
    syncClan(clan);
    toast('Announcement posted!', 'success');
    refreshPanel();
  }

  /* ══════════════════════════════════════
     PANEL UI
  ══════════════════════════════════════ */

  function injectStyles() {
    if (document.getElementById('clan-css')) return;
    const s = document.createElement('style');
    s.id = 'clan-css';
    s.textContent = `
      @keyframes clanPanelIn {
        from { opacity:0; transform:translate(-50%,-54%) scale(.94); }
        to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
      }
      #eylox-clan-panel {
        position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
        z-index:99996; background:rgba(8,2,22,.98);
        border:1px solid rgba(167,139,250,.2); border-radius:24px;
        width:min(580px,96vw); max-height:88vh; overflow:hidden;
        box-shadow:0 32px 80px rgba(0,0,0,.8),0 0 60px rgba(124,58,237,.15);
        animation:clanPanelIn .3s cubic-bezier(.34,1.56,.64,1) both;
        display:flex; flex-direction:column;
      }
      .clan-tab {
        padding:7px 16px; border-radius:99px; cursor:pointer;
        font-size:.75rem; font-weight:800; color:rgba(167,139,250,.45);
        border:1px solid transparent; transition:all .15s; white-space:nowrap;
      }
      .clan-tab.active {
        background:rgba(167,139,250,.15); border-color:rgba(167,139,250,.3);
        color:#e0d4ff;
      }
      .clan-member-row {
        display:flex; align-items:center; gap:10px; padding:10px 14px;
        background:rgba(167,139,250,.04); border:1px solid rgba(167,139,250,.08);
        border-radius:14px; transition:border-color .2s;
      }
      .clan-member-row:hover { border-color:rgba(167,139,250,.2); }
      .clan-action-btn {
        padding:5px 12px; border-radius:99px; border:1px solid; cursor:pointer;
        font-size:.7rem; font-weight:800; transition:all .15s;
      }
      .clan-action-btn:hover { transform:translateY(-1px); }
      .clan-setting-row {
        display:flex; align-items:center; justify-content:space-between;
        padding:12px 16px; background:rgba(167,139,250,.04);
        border:1px solid rgba(167,139,250,.08); border-radius:12px;
      }
      .clan-toggle {
        width:42px; height:22px; border-radius:99px; border:none; cursor:pointer;
        position:relative; transition:background .2s; flex-shrink:0;
      }
      .clan-toggle::after {
        content:''; position:absolute; width:16px; height:16px; border-radius:50%;
        background:#fff; top:3px; left:3px; transition:left .2s;
      }
      .clan-toggle.on { background:linear-gradient(135deg,#7c3aed,#a78bfa); }
      .clan-toggle.on::after { left:23px; }
      .clan-toggle.off { background:rgba(255,255,255,.12); }
      .clan-chat-msg {
        padding:7px 12px; border-radius:12px;
        background:rgba(255,255,255,.04); margin-bottom:3px; font-size:.75rem;
      }
      .clan-owner-section {
        background:linear-gradient(135deg,rgba(251,191,36,.08),rgba(251,191,36,.03));
        border:1px solid rgba(251,191,36,.2); border-radius:16px; padding:14px;
        margin-bottom:12px;
      }
      .clan-danger-btn {
        background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2);
        border-radius:10px; padding:10px 18px; color:rgba(239,68,68,.8);
        cursor:pointer; font-size:.8rem; font-weight:800; width:100%;
        transition:all .2s; text-align:center;
      }
      .clan-danger-btn:hover { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.4); }
      .clan-input {
        width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(167,139,250,.2);
        border-radius:10px; padding:10px 14px; color:#fff; font-size:.85rem;
        outline:none; box-sizing:border-box; font-family:inherit;
      }
      .clan-input:focus { border-color:rgba(167,139,250,.5); }
      .clan-btn-primary {
        background:linear-gradient(135deg,#7c3aed,#a78bfa); border:none;
        border-radius:10px; padding:10px 20px; color:#fff; cursor:pointer;
        font-weight:800; font-size:.85rem; transition:all .2s;
      }
      .clan-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(124,58,237,.4); }
      .clan-scroll { overflow-y:auto; flex:1; scrollbar-width:thin; scrollbar-color:rgba(167,139,250,.2) transparent; }
    `;
    document.head.appendChild(s);
  }

  function openClanPanel() {
    const existing = document.getElementById('eylox-clan-panel');
    if (existing) { existing.remove(); return; }
    injectStyles();
    const clan = getMyClan();
    if (!clan) buildNoClanPanel();
    else buildClanPanel(clan, 'overview');
  }

  function closeClanPanel() {
    document.getElementById('eylox-clan-panel')?.remove();
  }

  function buildNoClanPanel() {
    const panel = document.createElement('div');
    panel.id = 'eylox-clan-panel';
    panel.innerHTML = `
      <div style="padding:24px 24px 8px;border-bottom:1px solid rgba(167,139,250,.1);display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#fff">⚔️ Clans</div>
        <button onclick="document.getElementById('eylox-clan-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:50%;width:30px;height:30px;color:rgba(255,255,255,.5);cursor:pointer;font-size:1rem">✕</button>
      </div>
      <div class="clan-scroll" style="padding:24px">
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:3.5rem;margin-bottom:12px">⚔️</div>
          <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#fff;margin-bottom:6px">Join or Create a Clan</div>
          <div style="font-size:.82rem;color:rgba(200,190,230,.55);font-weight:700;line-height:1.6;margin-bottom:24px">Team up with other players, complete clan missions, and climb the leaderboard together!</div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <button onclick="EyloxClan._showCreateForm()" class="clan-btn-primary">+ Create Clan</button>
            <button onclick="EyloxClan._showBrowse()" style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:10px 20px;color:rgba(200,190,230,.7);cursor:pointer;font-weight:800;font-size:.85rem">Browse Clans</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:20px">
          ${[['⚔️','Team up','Fight together in clan wars'],['🏆','Earn Rewards','Clan XP & exclusive badges'],['💬','Clan Chat','Private chat with members']].map(([icon,t,d])=>`
            <div style="background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:14px;padding:14px;text-align:center">
              <div style="font-size:1.6rem;margin-bottom:6px">${icon}</div>
              <div style="font-size:.78rem;font-weight:800;color:#e0d4ff;margin-bottom:4px">${t}</div>
              <div style="font-size:.65rem;color:rgba(167,139,250,.45)">${d}</div>
            </div>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    addOutsideClick(panel, 'eylox-clan-panel');
  }

  function buildClanPanel(clan, activeTab) {
    const me = getMe();
    const myRole = getMyRole(clan);
    const isOwner = myRole?.rank === 4;
    const isAdmin = myRole?.rank >= 3;
    const isMod = myRole?.rank >= 2;
    const xpPct = Math.min(100, Math.round((clan.xp / clan.xpToNext) * 100));

    const existing = document.getElementById('eylox-clan-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'eylox-clan-panel';

    const tabs = [
      { id: 'overview', icon: '🏠', label: 'Overview' },
      { id: 'members',  icon: '👥', label: 'Members' },
      { id: 'chat',     icon: '💬', label: 'Chat' },
      ...(isAdmin ? [{ id: 'manage', icon: '⚙️', label: 'Manage' }] : []),
    ];

    panel.innerHTML = `
      <!-- Header -->
      <div style="background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(167,139,250,.1));padding:20px 22px 0;border-bottom:1px solid rgba(167,139,250,.12);flex-shrink:0">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:52px;height:52px;border-radius:14px;background:${clan.banner};display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;border:2px solid rgba(255,255,255,.1)">
              ${clan.emblem}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#fff">[${clan.tag}] ${clan.name}</div>
                ${isOwner ? '<div style="background:linear-gradient(135deg,#d97706,#fbbf24);border-radius:99px;padding:2px 8px;font-size:.6rem;font-weight:900;color:#000">OWNER</div>' : ''}
              </div>
              <div style="font-size:.7rem;color:rgba(167,139,250,.5);margin-top:2px">
                Level ${clan.level} Clan · ${clan.members.length}/${MAX_MEMBERS} members
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                <div style="font-size:.65rem;color:rgba(167,139,250,.4)">Clan XP</div>
                <div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;min-width:80px">
                  <div style="height:100%;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:99px;width:${xpPct}%;transition:width .4s ease"></div>
                </div>
                <div style="font-size:.6rem;color:rgba(167,139,250,.35)">${clan.xp}/${clan.xpToNext}</div>
              </div>
            </div>
          </div>
          <button onclick="document.getElementById('eylox-clan-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:50%;width:30px;height:30px;color:rgba(255,255,255,.5);cursor:pointer;font-size:1rem;flex-shrink:0">✕</button>
        </div>
        <!-- Tabs -->
        <div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:1px">
          ${tabs.map(t => `<div class="clan-tab${t.id === activeTab ? ' active' : ''}" onclick="EyloxClan._switchTab('${t.id}', this)">${t.icon} ${t.label}</div>`).join('')}
        </div>
      </div>
      <!-- Tab Content -->
      <div id="clan-tab-content" class="clan-scroll" style="padding:16px 20px;flex:1">
        ${getTabContent(clan, activeTab, isOwner, isAdmin, isMod, me)}
      </div>
      <!-- Footer -->
      <div style="padding:12px 20px;border-top:1px solid rgba(167,139,250,.08);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
        <div style="font-size:.7rem;color:rgba(167,139,250,.35)">
          ${myRole ? `${myRole.icon} ${myRole.label}` : ''}
        </div>
        <button onclick="EyloxClan._confirmLeave()" style="background:none;border:none;color:rgba(239,68,68,.5);cursor:pointer;font-size:.72rem;font-weight:800;padding:4px 8px;border-radius:8px;transition:all .15s" onmouseover="this.style.color='rgba(239,68,68,.9)'" onmouseout="this.style.color='rgba(239,68,68,.5)'">
          Leave Clan
        </button>
      </div>
    `;

    document.body.appendChild(panel);
    addOutsideClick(panel, 'eylox-clan-panel');
    if (activeTab === 'chat') scrollChatToBottom();
  }

  function getTabContent(clan, tab, isOwner, isAdmin, isMod, me) {
    if (tab === 'overview') return overviewTab(clan, isOwner, isAdmin);
    if (tab === 'members')  return membersTab(clan, isOwner, isAdmin, isMod, me.username);
    if (tab === 'chat')     return chatTab(clan);
    if (tab === 'manage')   return manageTab(clan, isOwner, isAdmin);
    return '';
  }

  function overviewTab(clan, isOwner, isAdmin) {
    const onlineCount = clan.members.filter(m => {
      const seed = m.username.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
      return seed % 3 !== 0;
    }).length;

    const recentAnnouncement = (clan.announcements || []).slice(-1)[0];
    return `
      <!-- Description -->
      ${clan.description ? `
        <div style="background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px;padding:12px 14px;margin-bottom:14px">
          <div style="font-size:.7rem;color:rgba(167,139,250,.5);font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">About</div>
          <div style="font-size:.82rem;color:rgba(220,210,240,.7);line-height:1.6">${clan.description}</div>
        </div>` : ''}

      <!-- Stats Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
        ${[
          ['👥', 'Members', `${clan.members.length}/${MAX_MEMBERS}`],
          ['🟢', 'Online', `${onlineCount}`],
          ['🏆', 'Level', `${clan.level}`],
        ].map(([icon,label,val])=>`
          <div style="background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:1.3rem;margin-bottom:4px">${icon}</div>
            <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#a78bfa">${val}</div>
            <div style="font-size:.62rem;color:rgba(167,139,250,.4);font-weight:800">${label}</div>
          </div>`).join('')}
      </div>

      <!-- Announcement -->
      ${recentAnnouncement ? `
        <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:12px;padding:12px 14px;margin-bottom:14px">
          <div style="font-size:.7rem;color:#fbbf24;font-weight:800;text-transform:uppercase;margin-bottom:4px">📢 Announcement by ${recentAnnouncement.by}</div>
          <div style="font-size:.82rem;color:rgba(253,230,138,.85)">${recentAnnouncement.text}</div>
        </div>` : ''}

      <!-- Post Announcement (admins only) -->
      ${isAdmin ? `
        <div style="margin-bottom:14px">
          <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800;margin-bottom:6px">📢 Post Announcement</div>
          <div style="display:flex;gap:8px">
            <input class="clan-input" id="clan-ann-input" placeholder="Write an announcement..." style="flex:1">
            <button onclick="EyloxClan._postAnn()" class="clan-btn-primary" style="white-space:nowrap;padding:10px 14px">Post</button>
          </div>
        </div>` : ''}

      <!-- Top Members -->
      <div>
        <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800;text-transform:uppercase;margin-bottom:8px">Top Members</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${clan.members.sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,5).map((m,i)=>{
            const role = ROLES[m.role] || ROLES.member;
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(167,139,250,.03);border:1px solid rgba(167,139,250,.07);border-radius:10px">
                <div style="font-size:.8rem;color:rgba(167,139,250,.3);width:16px;text-align:center;font-weight:800">${i+1}</div>
                <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#60a5fa);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:.8rem;flex-shrink:0">${m.username.charAt(0).toUpperCase()}</div>
                <div style="flex:1">
                  <div style="font-size:.8rem;font-weight:800;color:#fff">${m.username}</div>
                  <div style="font-size:.62rem;color:rgba(167,139,250,.4)">${role.icon} ${role.label}</div>
                </div>
                <div style="font-size:.7rem;color:#a78bfa;font-weight:800">${m.xp||0} XP</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function membersTab(clan, isOwner, isAdmin, isMod, myUsername) {
    const me = getMe();
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:.82rem;font-weight:800;color:rgba(200,190,230,.7)">${clan.members.length} members</div>
        <input placeholder="Search members..." style="background:rgba(255,255,255,.05);border:1px solid rgba(167,139,250,.15);border-radius:8px;padding:6px 10px;color:#fff;font-size:.75rem;outline:none" oninput="EyloxClan._filterMembers(this.value)" id="member-search">
      </div>
      <div id="clan-members-list" style="display:flex;flex-direction:column;gap:6px">
        ${clan.members.sort((a,b) => (ROLES[b.role]?.rank||1) - (ROLES[a.role]?.rank||1)).map(m => {
          const role = ROLES[m.role] || ROLES.member;
          const isSelf = m.username === myUsername;
          const seed = m.username.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
          const online = seed % 3 !== 0;
          const canKick = !isSelf && (
            (role.rank < 4) &&
            (isOwner || (isAdmin && role.rank < 3) || (isMod && role.rank < 2))
          );
          const canPromote = !isSelf && isOwner && role.rank < 3;
          const canDemote = !isSelf && isOwner && role.rank > 1 && role.rank < 4;

          return `
            <div class="clan-member-row" data-member="${m.username}">
              <div style="position:relative;flex-shrink:0">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${role.color},#a78bfa);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:.85rem">${m.username.charAt(0).toUpperCase()}</div>
                <div style="position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:${online?'#4ade80':'#555'};border:2px solid rgba(8,2,22,1)"></div>
              </div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:.82rem;font-weight:800;color:#fff">${m.username}</span>
                  ${isSelf ? '<span style="font-size:.6rem;color:rgba(167,139,250,.4)">(you)</span>' : ''}
                </div>
                <div style="font-size:.65rem;color:${role.color};font-weight:800">${role.icon} ${role.label} · ${m.xp||0} XP</div>
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0">
                ${canPromote ? `<button class="clan-action-btn" onclick="EyloxClan._promoteMenu('${m.username}', this)" style="border-color:rgba(96,165,250,.3);color:#60a5fa;background:rgba(96,165,250,.08)" title="Promote">▲</button>` : ''}
                ${canDemote ? `<button class="clan-action-btn" onclick="EyloxClan._demoteMenu('${m.username}', this)" style="border-color:rgba(74,222,128,.3);color:#4ade80;background:rgba(74,222,128,.06)" title="Demote">▼</button>` : ''}
                ${canKick ? `<button class="clan-action-btn" onclick="EyloxClan._kickConfirm('${m.username}')" style="border-color:rgba(239,68,68,.25);color:rgba(239,68,68,.7);background:rgba(239,68,68,.06)" title="Kick">✕</button>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    `;
  }

  function chatTab(clan) {
    const msgs = (clan.chat || []).slice(-50);
    const me = getMe();
    return `
      <div style="display:flex;flex-direction:column;height:100%;min-height:260px">
        <div id="clan-chat-msgs" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:3px;margin-bottom:10px;max-height:300px;scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.2) transparent">
          ${!msgs.length ? '<div style="text-align:center;color:rgba(167,139,250,.3);padding:24px;font-size:.78rem">No messages yet. Say hi! 👋</div>' :
            msgs.map(m => {
              const role = ROLES[m.role] || ROLES.member;
              const isSelf = m.username === me.username;
              return `
                <div class="clan-chat-msg" style="${isSelf ? 'align-self:flex-end;background:rgba(124,58,237,.2);border:1px solid rgba(124,58,237,.3);max-width:85%' : 'align-self:flex-start;max-width:85%'}">
                  ${!isSelf ? `<span style="font-weight:800;color:${role.color};font-size:.72rem">${role.icon} ${m.username}: </span>` : ''}
                  <span style="color:rgba(220,210,240,.8)">${m.text}</span>
                  <div style="font-size:.55rem;color:rgba(167,139,250,.3);text-align:${isSelf?'right':'left'};margin-top:2px">${new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                </div>`;
            }).join('')}
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <input id="clan-chat-input" class="clan-input" placeholder="Clan chat..." style="flex:1;padding:8px 12px" onkeydown="if(event.key==='Enter')EyloxClan._sendChat()">
          <button onclick="EyloxClan._sendChat()" class="clan-btn-primary" style="padding:8px 14px;white-space:nowrap">Send</button>
        </div>
      </div>
    `;
  }

  function manageTab(clan, isOwner, isAdmin) {
    return `
      <!-- Owner Section -->
      ${isOwner ? `
        <div class="clan-owner-section">
          <div style="font-size:.72rem;color:#fbbf24;font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px">👑 Owner Controls</div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
            <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800;margin-bottom:4px">Clan Emblem</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${CLAN_EMOJIS.map(e => `<button onclick="EyloxClan._setEmblem('${e}')" style="width:34px;height:34px;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:8px;font-size:1.2rem;cursor:pointer;transition:all .15s" title="${e}" onmouseover="this.style.background='rgba(167,139,250,.2)'" onmouseout="this.style.background='rgba(167,139,250,.08)'">${e}</button>`).join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
            <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800">Description</div>
            <textarea id="clan-desc-edit" class="clan-input" rows="3" style="resize:none" placeholder="Clan description...">${clan.description || ''}</textarea>
            <button onclick="EyloxClan._saveDesc()" class="clan-btn-primary" style="align-self:flex-start;padding:8px 16px">Save</button>
          </div>

          <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800;margin-bottom:8px">Transfer Ownership</div>
          <div style="display:flex;gap:8px;margin-bottom:14px">
            <input id="clan-transfer-inp" class="clan-input" placeholder="Enter username..." style="flex:1">
            <button onclick="EyloxClan._transferOwner()" style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:10px;padding:8px 14px;color:#fbbf24;cursor:pointer;font-size:.78rem;font-weight:800;white-space:nowrap">Transfer 👑</button>
          </div>

          <button onclick="EyloxClan._confirmDelete()" class="clan-danger-btn">⚠️ Delete Clan</button>
        </div>` : ''}

      <!-- Settings (Owner only) -->
      ${isOwner ? `
        <div>
          <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800;text-transform:uppercase;margin-bottom:10px">⚙️ Clan Settings</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${[
              ['isOpen', 'Open Clan', 'Anyone can join without approval', clan.isOpen],
              ['settings.allowChat', 'Allow Member Chat', 'Members can send messages in clan chat', clan.settings?.allowChat !== false],
              ['settings.allowInvites', 'Allow Invites', 'Members can invite friends', clan.settings?.allowInvites !== false],
            ].map(([key,title,desc,val])=>`
              <div class="clan-setting-row">
                <div>
                  <div style="font-size:.8rem;font-weight:800;color:#e0d4ff">${title}</div>
                  <div style="font-size:.66rem;color:rgba(167,139,250,.4)">${desc}</div>
                </div>
                <button class="clan-toggle ${val?'on':'off'}" id="toggle-${key.replace('.','_')}" onclick="EyloxClan._toggleSetting(this, '${key}')"></button>
              </div>`).join('')}
          </div>
        </div>` : ''}

      <!-- Admin Controls -->
      ${!isOwner && isAdmin ? `
        <div style="background:rgba(96,165,250,.05);border:1px solid rgba(96,165,250,.15);border-radius:14px;padding:14px">
          <div style="font-size:.72rem;color:#60a5fa;font-weight:800;text-transform:uppercase;margin-bottom:10px">⚡ Admin Controls</div>
          <div style="font-size:.8rem;color:rgba(200,190,230,.6)">You can manage members, post announcements, and moderate chat. Contact the clan owner for advanced settings.</div>
        </div>` : ''}
    `;
  }

  /* ── Refresh ── */
  function refreshPanel() {
    const panel = document.getElementById('eylox-clan-panel');
    if (!panel) return;
    const activeTab = document.querySelector('.clan-tab.active')?.dataset?.tab || 'overview';
    const clan = getMyClan();
    if (!clan) { panel.remove(); return; }
    buildClanPanel(clan, activeTab);
  }

  /* ── Chat helpers ── */
  function appendChatMsg(msg) {
    const container = document.getElementById('clan-chat-msgs');
    if (!container) return;
    const me = getMe();
    const role = ROLES[msg.role] || ROLES.member;
    const isSelf = msg.username === me.username;
    const div = document.createElement('div');
    div.className = 'clan-chat-msg';
    div.style.cssText = isSelf
      ? 'align-self:flex-end;background:rgba(124,58,237,.2);border:1px solid rgba(124,58,237,.3);max-width:85%;animation:msg-bubble .2s ease both'
      : 'align-self:flex-start;max-width:85%;animation:msg-bubble .2s ease both';
    div.innerHTML = `
      ${!isSelf ? `<span style="font-weight:800;color:${role.color};font-size:.72rem">${role.icon} ${msg.username}: </span>` : ''}
      <span style="color:rgba(220,210,240,.8)">${msg.text}</span>
      <div style="font-size:.55rem;color:rgba(167,139,250,.3);text-align:${isSelf?'right':'left'};margin-top:2px">${new Date(msg.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    while (container.children.length > 50) container.firstChild.remove();
  }

  function scrollChatToBottom() {
    setTimeout(() => {
      const c = document.getElementById('clan-chat-msgs');
      if (c) c.scrollTop = c.scrollHeight;
    }, 100);
  }

  /* ── Outside click ── */
  function addOutsideClick(panel, id) {
    setTimeout(() => {
      function handler(e) {
        if (!document.getElementById(id)?.contains(e.target) && !e.target.closest('#clan-topbar-btn')) {
          document.getElementById(id)?.remove();
          document.removeEventListener('click', handler);
        }
      }
      document.addEventListener('click', handler);
    }, 100);
  }

  /* ── Toast ── */
  function toast(msg, type) {
    if (window.EyloxToast) { EyloxToast(msg, type, 2500); return; }
    const colors = { success:'#4ade80', warn:'#fde68a', error:'#f87171', info:'#60a5fa' };
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(8,2,22,.95);border:1px solid ${colors[type]||'#a78bfa'};color:#fff;padding:10px 22px;border-radius:99px;font-size:.82rem;font-weight:800;z-index:99999;animation:toastUp .3s ease both;white-space:nowrap;box-shadow:0 4px 24px rgba(0,0,0,.6)`;
    el.textContent = msg;
    if (!document.getElementById('clan-toast-css')) {
      const s = document.createElement('style'); s.id = 'clan-toast-css';
      s.textContent = '@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  /* ── Topbar Button ── */
  function injectTopbarBtn() {
    if (document.getElementById('clan-topbar-btn')) return;
    const topbar = document.querySelector('.topbar-right, .tb-right, .topbar');
    if (!topbar) return;
    const clan = getMyClan();
    const btn = document.createElement('button');
    btn.id = 'clan-topbar-btn';
    btn.title = 'Clan';
    btn.style.cssText = `background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:5px 12px;cursor:pointer;font-size:.78rem;color:rgba(200,190,230,.7);font-weight:800;transition:all .18s`;
    btn.innerHTML = clan ? `⚔️ [${clan.tag}]` : '⚔️ Clan';
    btn.addEventListener('click', e => { e.stopPropagation(); openClanPanel(); });
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(167,139,250,.22)'; btn.style.color = '#e0d4ff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(167,139,250,.1)'; btn.style.color = 'rgba(200,190,230,.7)'; });
    topbar.appendChild(btn);
  }

  /* ── Public API ── */
  window.EyloxClan = {
    open: openClanPanel,
    close: closeClanPanel,
    createClan, joinClan, leaveClan, kickMember, setMemberRole,
    transferOwnership, deleteClan, updateClanSettings, addClanXP, sendClanChat,
    getMyClan, getAllClans,

    _switchTab(tabId, el) {
      document.querySelectorAll('.clan-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      const clan = getMyClan();
      if (!clan) return;
      const content = document.getElementById('clan-tab-content');
      if (!content) return;
      const me = getMe();
      const myRole = getMyRole(clan);
      const isOwner = myRole?.rank === 4;
      const isAdmin = myRole?.rank >= 3;
      const isMod = myRole?.rank >= 2;
      content.innerHTML = getTabContent(clan, tabId, isOwner, isAdmin, isMod, me);
      if (tabId === 'chat') scrollChatToBottom();
    },
    _showCreateForm() {
      const panel = document.getElementById('eylox-clan-panel');
      if (!panel) return;
      const scroll = panel.querySelector('.clan-scroll');
      if (!scroll) return;
      scroll.innerHTML = `
        <div style="margin-bottom:20px">
          <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#fff;margin-bottom:4px">Create Your Clan</div>
          <div style="font-size:.75rem;color:rgba(167,139,250,.45)">Set up your clan and start recruiting members!</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <div style="font-size:.72rem;color:rgba(167,139,250,.5);font-weight:800;margin-bottom:6px">Clan Emblem</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px" id="emblem-picker">
              ${CLAN_EMOJIS.map((e,i)=>`<button onclick="document.getElementById('clan-emblem-selected').value='${e}';document.querySelectorAll('#emblem-picker button').forEach(b=>b.style.background='rgba(167,139,250,.08)');this.style.background='rgba(167,139,250,.3)'" style="width:34px;height:34px;background:${i===0?'rgba(167,139,250,.3)':'rgba(167,139,250,.08)'};border:1px solid rgba(167,139,250,.2);border-radius:8px;font-size:1.2rem;cursor:pointer;transition:all .15s">${e}</button>`).join('')}
            </div>
            <input type="hidden" id="clan-emblem-selected" value="${CLAN_EMOJIS[0]}">
          </div>
          <input id="clan-name-inp" class="clan-input" placeholder="Clan name (min 2 chars) *">
          <input id="clan-tag-inp" class="clan-input" placeholder="Tag (up to 5 chars)" maxlength="5">
          <textarea id="clan-desc-inp" class="clan-input" placeholder="Description (optional)" rows="2" style="resize:none"></textarea>
          <button onclick="EyloxClan._submitCreate()" class="clan-btn-primary" style="width:100%;padding:12px">Create Clan ⚔️</button>
        </div>
      `;
    },
    _submitCreate() {
      const name   = document.getElementById('clan-name-inp')?.value;
      const tag    = document.getElementById('clan-tag-inp')?.value;
      const desc   = document.getElementById('clan-desc-inp')?.value;
      const emblem = document.getElementById('clan-emblem-selected')?.value || '🛡️';
      const clan = createClan(name, tag, desc, emblem);
      if (clan) { closeClanPanel(); setTimeout(() => buildClanPanel(clan, 'overview'), 200); }
    },
    _showBrowse() {
      const all = getAllClans().filter(c => c.isOpen && c.members.length < MAX_MEMBERS).slice(0, 12);
      const panel = document.getElementById('eylox-clan-panel');
      if (!panel) return;
      const scroll = panel.querySelector('.clan-scroll');
      if (!scroll) return;
      scroll.innerHTML = `
        <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#fff;margin-bottom:16px">Browse Clans</div>
        ${!all.length ? '<div style="text-align:center;color:rgba(167,139,250,.4);padding:30px;font-size:.82rem">No open clans yet.<br>Be the first to create one!</div>' :
          all.map(c => {
            const xpPct = Math.min(100, Math.round((c.xp / c.xpToNext) * 100));
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.1);border-radius:14px;margin-bottom:8px;transition:border-color .2s" onmouseover="this.style.borderColor='rgba(167,139,250,.3)'" onmouseout="this.style.borderColor='rgba(167,139,250,.1)'">
                <div style="width:44px;height:44px;border-radius:12px;background:${c.banner};display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">${c.emblem}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:800;color:#fff;font-size:.85rem">[${c.tag}] ${c.name}</div>
                  <div style="font-size:.66rem;color:rgba(167,139,250,.4)">Lv.${c.level} · ${c.members.length}/${MAX_MEMBERS} members</div>
                  <div style="height:3px;background:rgba(255,255,255,.06);border-radius:99px;margin-top:4px"><div style="height:100%;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:99px;width:${xpPct}%"></div></div>
                </div>
                <button onclick="EyloxClan._joinAndClose('${c.id}')" class="clan-btn-primary" style="padding:7px 14px;font-size:.75rem">Join</button>
              </div>`;
          }).join('')}
      `;
    },
    _joinAndClose(id) {
      if (joinClan(id)) {
        closeClanPanel();
        setTimeout(() => { const c = getMyClan(); if (c) buildClanPanel(c, 'overview'); }, 200);
      }
    },
    _sendChat() {
      const input = document.getElementById('clan-chat-input');
      if (!input?.value.trim()) return;
      sendClanChat(input.value.trim());
      input.value = '';
    },
    _filterMembers(val) {
      const q = val.toLowerCase();
      document.querySelectorAll('#clan-members-list .clan-member-row').forEach(row => {
        row.style.display = !q || row.dataset.member?.toLowerCase().includes(q) ? '' : 'none';
      });
    },
    _kickConfirm(username) {
      if (confirm(`Remove ${username} from the clan?`)) kickMember(username);
    },
    _promoteMenu(username, btn) {
      const clan = getMyClan();
      const m = clan?.members.find(x => x.username === username);
      if (!m) return;
      const currentRank = ROLES[m.role]?.rank || 1;
      const options = Object.values(ROLES).filter(r => r.rank > currentRank && r.rank < 4);
      if (!options.length) return;
      if (options.length === 1) { setMemberRole(username, options[0].id); return; }
      const menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;right:0;top:100%;background:#1a0840;border:1px solid rgba(167,139,250,.3);border-radius:10px;padding:6px;z-index:100;min-width:120px;box-shadow:0 8px 24px rgba(0,0,0,.5)';
      options.forEach(r => {
        const item = document.createElement('button');
        item.style.cssText = `display:block;width:100%;padding:7px 10px;background:none;border:none;color:${r.color};font-size:.78rem;font-weight:800;text-align:left;cursor:pointer;border-radius:6px`;
        item.textContent = `${r.icon} ${r.label}`;
        item.onclick = () => { setMemberRole(username, r.id); menu.remove(); };
        menu.appendChild(item);
      });
      btn.parentElement.style.position = 'relative';
      btn.parentElement.appendChild(menu);
      setTimeout(() => document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); }, { once: true }), 50);
    },
    _demoteMenu(username, btn) {
      const clan = getMyClan();
      const m = clan?.members.find(x => x.username === username);
      if (!m) return;
      const currentRank = ROLES[m.role]?.rank || 1;
      const options = Object.values(ROLES).filter(r => r.rank < currentRank && r.rank >= 1);
      if (!options.length) return;
      if (options.length === 1) { setMemberRole(username, options[0].id); return; }
      const menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;right:0;top:100%;background:#1a0840;border:1px solid rgba(167,139,250,.3);border-radius:10px;padding:6px;z-index:100;min-width:120px;box-shadow:0 8px 24px rgba(0,0,0,.5)';
      options.forEach(r => {
        const item = document.createElement('button');
        item.style.cssText = `display:block;width:100%;padding:7px 10px;background:none;border:none;color:${r.color};font-size:.78rem;font-weight:800;text-align:left;cursor:pointer;border-radius:6px`;
        item.textContent = `${r.icon} ${r.label}`;
        item.onclick = () => { setMemberRole(username, r.id); menu.remove(); };
        menu.appendChild(item);
      });
      btn.parentElement.style.position = 'relative';
      btn.parentElement.appendChild(menu);
      setTimeout(() => document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); }, { once: true }), 50);
    },
    _confirmLeave() {
      const clan = getMyClan();
      const myRole = getMyRole(clan);
      if (myRole?.rank === 4 && clan?.members.length > 1) {
        toast('Transfer ownership before leaving.', 'warn'); return;
      }
      if (confirm('Leave your clan?')) { leaveClan(); closeClanPanel(); }
    },
    _confirmDelete() {
      if (confirm('⚠️ Delete this clan? This action is permanent and cannot be undone.')) deleteClan();
    },
    _transferOwner() {
      const val = document.getElementById('clan-transfer-inp')?.value?.trim();
      if (!val) { toast('Enter a username.', 'warn'); return; }
      if (confirm(`Transfer clan ownership to ${val}? You will become an admin.`)) transferOwnership(val);
    },
    _setEmblem(emblem) {
      const clan = getMyClan();
      if (!clan || !canDo(clan, 'editLogo')) { toast('Only owner can change emblem.', 'warn'); return; }
      clan.emblem = emblem;
      syncClan(clan);
      toast(`Clan emblem set to ${emblem}`, 'success');
      refreshPanel();
    },
    _saveDesc() {
      const val = document.getElementById('clan-desc-edit')?.value?.trim();
      const clan = getMyClan();
      if (!clan) return;
      clan.description = val || '';
      syncClan(clan);
      toast('Description updated.', 'success');
    },
    _postAnn() {
      const val = document.getElementById('clan-ann-input')?.value?.trim();
      if (!val) return;
      postAnnouncement(val);
      const input = document.getElementById('clan-ann-input');
      if (input) input.value = '';
    },
    _toggleSetting(btn, key) {
      const clan = getMyClan();
      if (!clan) return;
      btn.classList.toggle('on');
      btn.classList.toggle('off');
      const val = btn.classList.contains('on');
      if (key.includes('.')) {
        const [obj, prop] = key.split('.');
        if (!clan[obj]) clan[obj] = {};
        clan[obj][prop] = val;
      } else {
        clan[key] = val;
      }
      syncClan(clan);
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectTopbarBtn, 800);
    document.addEventListener('eylox:ranked:win', () => addClanXP(30));
    document.addEventListener('eylox:game:win', () => addClanXP(10));
  });

})();
