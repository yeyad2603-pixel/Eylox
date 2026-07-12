/* ============================================================
   EYLOX — Squad System v1.0
   Advanced clan-style squads: up to 10 members, squad XP,
   squad chat, missions, rank progression.
   ============================================================ */
'use strict';

(function EyloxSquad() {

  const SQUAD_KEY   = 'eylox_squad';
  const SQUADS_KEY  = 'eylox_squads_db';   /* simulated global squads list */
  const MAX_MEMBERS = 10;

  const RANKS = [
    { id:'recruit',  label:'Recruit',  icon:'⚪', minXP:0 },
    { id:'member',   label:'Member',   icon:'🔵', minXP:500 },
    { id:'soldier',  label:'Soldier',  icon:'🟢', minXP:1500 },
    { id:'officer',  label:'Officer',  icon:'🟡', minXP:4000 },
    { id:'captain',  label:'Captain',  icon:'🟠', minXP:10000 },
    { id:'leader',   label:'Leader',   icon:'🔴', minXP:Infinity },   /* only one leader per squad */
  ];

  /* ── Helpers ── */
  function currentUser() {
    try { return JSON.parse(localStorage.getItem('eylox_user') || '{}'); } catch { return {}; }
  }

  function getMySquad() {
    try {
      const raw = localStorage.getItem(SQUAD_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveMySquad(squad) {
    localStorage.setItem(SQUAD_KEY, JSON.stringify(squad));
  }

  function getAllSquads() {
    try { return JSON.parse(localStorage.getItem(SQUADS_KEY) || '[]'); } catch { return []; }
  }

  function saveAllSquads(list) {
    localStorage.setItem(SQUADS_KEY, JSON.stringify(list));
  }

  function getMemberRank(member) {
    if (member.isLeader) return RANKS[5];
    const r = RANKS.slice().reverse().find(r => r.id !== 'leader' && member.squadXP >= r.minXP);
    return r || RANKS[0];
  }

  /* ── Create squad ── */
  function createSquad(name, tag, description) {
    if (getMySquad()) { _toast('You are already in a squad.', 'warn'); return null; }
    const user = currentUser();
    if (!user.username) { _toast('Must be logged in.', 'warn'); return null; }
    if (!name?.trim() || name.length < 3) { _toast('Squad name must be at least 3 characters.', 'warn'); return null; }
    const squads = getAllSquads();
    if (squads.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      _toast('Squad name already taken!', 'warn'); return null;
    }
    const squad = {
      id: `sq_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      name: name.trim(),
      tag: (tag || name.slice(0,4)).toUpperCase().slice(0,5),
      description: description || '',
      emblem: '🛡️',
      createdAt: Date.now(),
      squadXP: 0,
      squadLevel: 1,
      xpToNext: 2000,
      wins: 0,
      members: [{
        username: user.username,
        isLeader: true,
        joinedAt: Date.now(),
        squadXP: 0,
        lastSeen: Date.now()
      }],
      chat: [],
      missions: _generateMissions(),
      isOpen: true
    };
    squads.push(squad);
    saveAllSquads(squads);
    saveMySquad(squad);
    if (window.EyloxMeta) EyloxMeta.unlockAchievement('squad');
    _toast(`Squad "${name}" created! Tag: [${squad.tag}]`, 'success');
    document.dispatchEvent(new CustomEvent('eylox:squad:created', { detail: squad }));
    return squad;
  }

  /* ── Join squad ── */
  function joinSquad(squadId) {
    if (getMySquad()) { _toast('Leave your current squad first.', 'warn'); return false; }
    const user = currentUser();
    if (!user.username) return false;
    const squads = getAllSquads();
    const idx = squads.findIndex(s => s.id === squadId);
    if (idx === -1) { _toast('Squad not found.', 'warn'); return false; }
    const sq = squads[idx];
    if (sq.members.length >= MAX_MEMBERS) { _toast('Squad is full (10 members max).', 'warn'); return false; }
    if (sq.members.find(m => m.username === user.username)) { _toast('Already in this squad.', 'warn'); return false; }
    sq.members.push({ username: user.username, isLeader: false, joinedAt: Date.now(), squadXP: 0, lastSeen: Date.now() });
    squads[idx] = sq;
    saveAllSquads(squads);
    saveMySquad(sq);
    if (window.EyloxMeta) EyloxMeta.unlockAchievement('squad');
    _toast(`Joined squad "${sq.name}"!`, 'success');
    document.dispatchEvent(new CustomEvent('eylox:squad:joined', { detail: sq }));
    return true;
  }

  /* ── Leave squad ── */
  function leaveSquad() {
    const sq = getMySquad();
    if (!sq) { _toast('Not in a squad.', 'warn'); return; }
    const user = currentUser();
    const member = sq.members.find(m => m.username === user.username);
    if (member?.isLeader && sq.members.length > 1) {
      _toast('Transfer leadership before leaving.', 'warn'); return;
    }
    sq.members = sq.members.filter(m => m.username !== user.username);
    const squads = getAllSquads();
    const idx = squads.findIndex(s => s.id === sq.id);
    if (idx !== -1) {
      if (sq.members.length === 0) squads.splice(idx, 1);
      else squads[idx] = sq;
      saveAllSquads(squads);
    }
    localStorage.removeItem(SQUAD_KEY);
    _toast('You have left the squad.', 'info');
    document.dispatchEvent(new CustomEvent('eylox:squad:left'));
  }

  /* ── Transfer leadership ── */
  function transferLeadership(toUsername) {
    const sq = getMySquad();
    if (!sq) return;
    const user = currentUser();
    const me = sq.members.find(m => m.username === user.username);
    if (!me?.isLeader) { _toast('Only the leader can transfer leadership.', 'warn'); return; }
    const target = sq.members.find(m => m.username === toUsername);
    if (!target) { _toast('Member not found.', 'warn'); return; }
    me.isLeader = false;
    target.isLeader = true;
    saveMySquad(sq);
    const squads = getAllSquads();
    const idx = squads.findIndex(s => s.id === sq.id);
    if (idx !== -1) { squads[idx] = sq; saveAllSquads(squads); }
    _toast(`${toUsername} is now the squad leader.`, 'info');
  }

  /* ── Squad XP ── */
  function addSquadXP(amount, reason) {
    const sq = getMySquad();
    if (!sq) return;
    const user = currentUser();
    sq.squadXP = (sq.squadXP || 0) + amount;
    const member = sq.members.find(m => m.username === user.username);
    if (member) member.squadXP = (member.squadXP || 0) + amount;
    /* Level up */
    while (sq.squadXP >= sq.xpToNext) {
      sq.squadXP -= sq.xpToNext;
      sq.squadLevel++;
      sq.xpToNext = Math.floor(sq.xpToNext * 1.4);
      _toast(`🎉 Squad leveled up to Level ${sq.squadLevel}!`, 'success');
    }
    saveMySquad(sq);
    const squads = getAllSquads();
    const idx = squads.findIndex(s => s.id === sq.id);
    if (idx !== -1) { squads[idx] = sq; saveAllSquads(squads); }
    _refreshPanel();
  }

  /* ── Squad Chat ── */
  function sendSquadChat(message) {
    const sq = getMySquad();
    if (!sq) { _toast('Join a squad to use squad chat.', 'warn'); return; }
    const user = currentUser();
    const filtered = window.EyloxAC ? EyloxAC.filterChat(message) : message;
    const msg = { username: user.username, text: filtered, ts: Date.now() };
    sq.chat = [...(sq.chat || []), msg].slice(-50);  /* keep last 50 */
    saveMySquad(sq);
    const squads = getAllSquads();
    const idx = squads.findIndex(s => s.id === sq.id);
    if (idx !== -1) { squads[idx].chat = sq.chat; saveAllSquads(squads); }
    _appendChatMsg(msg);
    document.dispatchEvent(new CustomEvent('eylox:squad:chat', { detail: msg }));
  }

  /* ── Squad Missions ── */
  function _generateMissions() {
    const pool = [
      { id:'win5',    desc:'Win 5 games as a squad',    goal:5,  progress:0, reward:300, icon:'🏆' },
      { id:'xp1000',  desc:'Earn 1000 XP collectively', goal:1000,progress:0,reward:500, icon:'⭐' },
      { id:'play10',  desc:'Play 10 games total',       goal:10, progress:0, reward:200, icon:'🎮' },
      { id:'emote20', desc:'Send 20 emotes',            goal:20, progress:0, reward:150, icon:'😄' },
      { id:'invite3', desc:'Invite 3 new members',      goal:3,  progress:0, reward:400, icon:'🤝' },
    ];
    return pool.slice(0, 3).map(m => ({ ...m, completed: false }));
  }

  function progressMission(missionId, amount) {
    const sq = getMySquad();
    if (!sq) return;
    const m = (sq.missions || []).find(x => x.id === missionId && !x.completed);
    if (!m) return;
    m.progress = Math.min(m.goal, m.progress + amount);
    if (m.progress >= m.goal) {
      m.completed = true;
      _toast(`✅ Squad mission complete: ${m.desc}! +${m.reward} Squad XP`, 'success');
      addSquadXP(m.reward, 'mission');
    }
    saveMySquad(sq);
  }

  /* ── Squad Panel UI ── */
  function openSquadPanel() {
    if (document.getElementById('eylox-squad-panel')) {
      document.getElementById('eylox-squad-panel').remove(); return;
    }
    _buildSquadPanel();
  }

  function _buildSquadPanel() {
    const sq = getMySquad();
    const panel = document.createElement('div');
    panel.id = 'eylox-squad-panel';
    panel.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99996;
      background:rgba(10,3,28,.98);border:1px solid rgba(167,139,250,.25);border-radius:24px;
      width:min(540px,95vw);max-height:85vh;overflow-y:auto;
      box-shadow:0 24px 80px rgba(0,0,0,.7);
      animation:squadPanelIn .3s cubic-bezier(.34,1.56,.64,1) both;
    `;
    if (!document.getElementById('eylox-squad-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-squad-css';
      s.textContent = `
        @keyframes squadPanelIn { from{opacity:0;transform:translate(-50%,-54%) scale(.94)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .sq-tab { padding:8px 16px;border-radius:99px;cursor:pointer;font-size:.78rem;font-weight:800;color:rgba(167,139,250,.5);border:1px solid transparent;transition:all .15s; }
        .sq-tab.active { background:rgba(167,139,250,.15);border-color:rgba(167,139,250,.3);color:#e0d4ff; }
        .sq-member-card { display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px; }
        .sq-mission-row { display:flex;align-items:center;gap:10px;padding:10px;background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px; }
        .sq-chat-msg { padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.04);margin-bottom:4px;font-size:.75rem; }
      `;
      document.head.appendChild(s);
    }

    if (!sq) {
      /* No squad — show create/browse */
      panel.innerHTML = `
        <div style="padding:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div style="font-size:1.1rem;font-weight:900;color:#fff">👥 Squads</div>
            <button onclick="document.getElementById('eylox-squad-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:30px;height:30px;color:rgba(255,255,255,.5);cursor:pointer">×</button>
          </div>
          <div style="text-align:center;padding:30px 0 20px">
            <div style="font-size:3rem;margin-bottom:12px">🛡️</div>
            <div style="font-size:.9rem;color:rgba(255,255,255,.6);margin-bottom:20px">You're not in a squad yet.<br>Create one or join an existing squad!</div>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <button onclick="EyloxSquad._showCreateForm()" style="background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);border-radius:99px;padding:10px 20px;color:#e0d4ff;cursor:pointer;font-weight:800;font-size:.85rem">+ Create Squad</button>
              <button onclick="EyloxSquad._showBrowse()" style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:10px 20px;color:rgba(200,190,230,.7);cursor:pointer;font-weight:800;font-size:.85rem">Browse Squads</button>
            </div>
          </div>
        </div>
      `;
    } else {
      const pct = Math.round((sq.squadXP / sq.xpToNext) * 100);
      const user = currentUser();
      const isLeader = sq.members.find(m => m.username === user.username)?.isLeader;
      panel.innerHTML = `
        <div style="padding:24px">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:2rem">${sq.emblem}</div>
              <div>
                <div style="font-size:1rem;font-weight:900;color:#fff">[${sq.tag}] ${sq.name}</div>
                <div style="font-size:.65rem;color:rgba(167,139,250,.5)">Level ${sq.squadLevel} · ${sq.members.length}/${MAX_MEMBERS} members</div>
              </div>
            </div>
            <button onclick="document.getElementById('eylox-squad-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:30px;height:30px;color:rgba(255,255,255,.5);cursor:pointer">×</button>
          </div>
          <!-- XP bar -->
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;font-size:.62rem;color:rgba(167,139,250,.4);margin-bottom:4px"><span>Squad XP</span><span>${sq.squadXP}/${sq.xpToNext}</span></div>
            <div style="height:6px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden">
              <div style="height:100%;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:99px;width:${pct}%"></div>
            </div>
          </div>
          <!-- Tabs -->
          <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap" id="sq-tabs">
            <div class="sq-tab active" onclick="EyloxSquad._switchTab('members',this)">👥 Members</div>
            <div class="sq-tab" onclick="EyloxSquad._switchTab('missions',this)">📋 Missions</div>
            <div class="sq-tab" onclick="EyloxSquad._switchTab('chat',this)">💬 Chat</div>
            ${isLeader ? '<div class="sq-tab" onclick="EyloxSquad._switchTab(\'manage\',this)">⚙️ Manage</div>' : ''}
          </div>
          <!-- Tab content -->
          <div id="sq-tab-content">${_membersHTML(sq)}</div>
          <!-- Leave button -->
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(167,139,250,.1)">
            <button onclick="EyloxSquad._confirmLeave()" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:99px;padding:8px 18px;color:rgba(239,68,68,.7);cursor:pointer;font-size:.78rem;font-weight:800">Leave Squad</button>
          </div>
        </div>
      `;
    }
    document.body.appendChild(panel);
    document.addEventListener('click', _outsideClick);
  }

  function _outsideClick(e) {
    const panel = document.getElementById('eylox-squad-panel');
    if (panel && !panel.contains(e.target) && !e.target.closest('#sq-squad-btn')) {
      panel.remove();
      document.removeEventListener('click', _outsideClick);
    }
  }

  function _membersHTML(sq) {
    return `<div style="display:flex;flex-direction:column;gap:6px">
      ${sq.members.map(m => {
        const rank = getMemberRank(m);
        return `<div class="sq-member-card">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#60a5fa);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:.9rem">${m.username.charAt(0).toUpperCase()}</div>
          <div style="flex:1">
            <div style="font-size:.82rem;font-weight:800;color:#fff">${m.username} ${m.isLeader?'👑':''}</div>
            <div style="font-size:.62rem;color:rgba(167,139,250,.5)">${rank.icon} ${rank.label} · ${m.squadXP||0} XP</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function _missionsHTML(sq) {
    return `<div style="display:flex;flex-direction:column;gap:6px">
      ${(sq.missions||[]).map(m => {
        const pct = Math.round((m.progress/m.goal)*100);
        return `<div class="sq-mission-row" style="opacity:${m.completed?.8:1}">
          <div style="font-size:1.4rem">${m.icon}</div>
          <div style="flex:1">
            <div style="font-size:.78rem;font-weight:800;color:#fff">${m.desc} ${m.completed?'✅':''}</div>
            <div style="height:4px;background:rgba(255,255,255,.07);border-radius:99px;margin-top:4px">
              <div style="height:100%;background:${m.completed?'#22c55e':'#a78bfa'};border-radius:99px;width:${pct}%"></div>
            </div>
            <div style="font-size:.6rem;color:rgba(167,139,250,.4);margin-top:3px">${m.progress}/${m.goal} · Reward: +${m.reward} XP</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function _chatHTML(sq) {
    const msgs = (sq.chat||[]).slice(-20);
    return `<div>
      <div id="sq-chat-msgs" style="max-height:180px;overflow-y:auto;margin-bottom:10px;display:flex;flex-direction:column;gap:3px">
        ${msgs.map(m => `<div class="sq-chat-msg"><span style="font-weight:800;color:#a78bfa">${m.username}:</span> <span style="color:rgba(220,210,240,.8)">${m.text}</span></div>`).join('')}
        ${!msgs.length ? '<div style="font-size:.75rem;color:rgba(167,139,250,.3);text-align:center;padding:20px">No messages yet. Say hi!</div>' : ''}
      </div>
      <div style="display:flex;gap:8px">
        <input id="sq-chat-input" placeholder="Squad chat..." style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:8px 14px;color:#fff;font-size:.8rem;outline:none" onkeydown="if(event.key==='Enter')EyloxSquad._sendChat()">
        <button onclick="EyloxSquad._sendChat()" style="background:rgba(167,139,250,.2);border:1px solid rgba(167,139,250,.3);border-radius:99px;padding:8px 14px;color:#e0d4ff;cursor:pointer;font-size:.8rem;font-weight:800">Send</button>
      </div>
    </div>`;
  }

  window.EyloxSquad = {
    createSquad, joinSquad, leaveSquad, transferLeadership, addSquadXP, sendSquadChat,
    progressMission, openSquadPanel,
    getMySquad, getAllSquads,
    _switchTab(tab, el) {
      document.querySelectorAll('.sq-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      const sq = getMySquad();
      const content = document.getElementById('sq-tab-content');
      if (!content || !sq) return;
      if (tab === 'members') content.innerHTML = _membersHTML(sq);
      else if (tab === 'missions') content.innerHTML = _missionsHTML(sq);
      else if (tab === 'chat') content.innerHTML = _chatHTML(sq);
      else if (tab === 'manage') content.innerHTML = _manageHTML(sq);
    },
    _showCreateForm() {
      const panel = document.getElementById('eylox-squad-panel');
      if (!panel) return;
      panel.querySelector('div').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div style="font-size:1rem;font-weight:900;color:#fff">Create Squad</div>
          <button onclick="document.getElementById('eylox-squad-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:30px;height:30px;color:rgba(255,255,255,.5);cursor:pointer">×</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <input id="sq-name-inp" placeholder="Squad name (min 3 chars)" style="background:rgba(255,255,255,.06);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:10px 14px;color:#fff;font-size:.85rem;outline:none;width:100%;box-sizing:border-box">
          <input id="sq-tag-inp" placeholder="Tag (up to 5 chars, optional)" maxlength="5" style="background:rgba(255,255,255,.06);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:10px 14px;color:#fff;font-size:.85rem;outline:none;width:100%;box-sizing:border-box">
          <textarea id="sq-desc-inp" placeholder="Description (optional)" rows="2" style="background:rgba(255,255,255,.06);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:10px 14px;color:#fff;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;resize:none"></textarea>
          <button onclick="EyloxSquad._submitCreate()" style="background:rgba(167,139,250,.2);border:1px solid rgba(167,139,250,.3);border-radius:99px;padding:12px;color:#e0d4ff;cursor:pointer;font-weight:800">Create Squad</button>
        </div>
      `;
    },
    _submitCreate() {
      const name = document.getElementById('sq-name-inp')?.value;
      const tag  = document.getElementById('sq-tag-inp')?.value;
      const desc = document.getElementById('sq-desc-inp')?.value;
      const sq = createSquad(name, tag, desc);
      if (sq) { document.getElementById('eylox-squad-panel')?.remove(); }
    },
    _showBrowse() {
      const squads = getAllSquads().filter(s => s.isOpen && s.members.length < MAX_MEMBERS).slice(0, 10);
      const panel = document.getElementById('eylox-squad-panel');
      if (!panel) return;
      panel.querySelector('div').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div style="font-size:1rem;font-weight:900;color:#fff">Browse Squads</div>
          <button onclick="document.getElementById('eylox-squad-panel').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:30px;height:30px;color:rgba(255,255,255,.5);cursor:pointer">×</button>
        </div>
        ${!squads.length ? '<div style="text-align:center;color:rgba(167,139,250,.4);padding:30px">No open squads found.<br>Be the first to create one!</div>' :
          squads.map(s => `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.1);border-radius:12px;margin-bottom:8px">
            <div style="font-size:1.5rem">${s.emblem}</div>
            <div style="flex:1">
              <div style="font-size:.82rem;font-weight:800;color:#fff">[${s.tag}] ${s.name}</div>
              <div style="font-size:.62rem;color:rgba(167,139,250,.4)">Level ${s.squadLevel} · ${s.members.length}/${MAX_MEMBERS} members</div>
            </div>
            <button onclick="EyloxSquad._joinAndClose('${s.id}')" style="background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);border-radius:99px;padding:6px 14px;color:#e0d4ff;cursor:pointer;font-size:.75rem;font-weight:800">Join</button>
          </div>`).join('')}
      `;
    },
    _joinAndClose(id) {
      if (joinSquad(id)) document.getElementById('eylox-squad-panel')?.remove();
    },
    _sendChat() {
      const input = document.getElementById('sq-chat-input');
      if (!input?.value.trim()) return;
      sendSquadChat(input.value.trim());
      input.value = '';
    },
    _confirmLeave() {
      if (confirm('Are you sure you want to leave your squad?')) { leaveSquad(); document.getElementById('eylox-squad-panel')?.remove(); }
    },
  };

  function _manageHTML(sq) {
    return `<div style="display:flex;flex-direction:column;gap:10px">
      <div style="font-size:.75rem;color:rgba(167,139,250,.5)">Squad description:</div>
      <div style="font-size:.82rem;color:rgba(220,210,240,.7)">${sq.description || 'No description set.'}</div>
      <div style="font-size:.75rem;color:rgba(167,139,250,.5);margin-top:8px">Transfer Leadership:</div>
      <div style="display:flex;gap:8px">
        <input id="sq-transfer-inp" placeholder="Username to promote" style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:8px 14px;color:#fff;font-size:.78rem;outline:none">
        <button onclick="EyloxSquad.transferLeadership(document.getElementById('sq-transfer-inp').value)" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:99px;padding:8px 14px;color:rgba(239,68,68,.7);cursor:pointer;font-size:.75rem;font-weight:800">Transfer</button>
      </div>
    </div>`;
  }

  function _appendChatMsg(msg) {
    const container = document.getElementById('sq-chat-msgs');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'sq-chat-msg';
    const uSpan = document.createElement('span');
    uSpan.style.cssText = 'font-weight:800;color:#a78bfa';
    uSpan.textContent = (msg.username || 'Unknown') + ':';
    const tSpan = document.createElement('span');
    tSpan.style.cssText = 'color:rgba(220,210,240,.8)';
    tSpan.textContent = ' ' + (msg.text || '');
    div.appendChild(uSpan);
    div.appendChild(tSpan);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    while (container.children.length > 20) container.firstChild.remove();
  }

  function _refreshPanel() {
    if (document.getElementById('eylox-squad-panel')) {
      document.getElementById('eylox-squad-panel').remove();
      _buildSquadPanel();
    }
  }

  function _toast(msg, type) {
    if (window.EyloxToast) EyloxToast(msg, type, 2500);
  }

  /* ── Topbar Squad Button ── */
  function injectSquadBtn() {
    if (document.getElementById('tb-squad-btn')) return;
    const topbar = document.querySelector('.topbar-right, .tb-right, .topbar');
    if (!topbar) return;
    const sq = getMySquad();
    const btn = document.createElement('button');
    btn.id = 'tb-squad-btn';
    btn.id = 'sq-squad-btn';
    btn.title = 'Squads';
    btn.style.cssText = `background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:5px 10px;cursor:pointer;font-size:.78rem;color:rgba(200,190,230,.7);font-weight:800;transition:all .18s`;
    btn.textContent = sq ? `👥 [${sq.tag}]` : '👥 Squad';
    btn.addEventListener('click', () => openSquadPanel());
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(167,139,250,.22)'; btn.style.color = '#e0d4ff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(167,139,250,.1)'; btn.style.color = 'rgba(200,190,230,.7)'; });
    topbar.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    /* Skip squad button if new clan system is loaded */
    setTimeout(() => {
      if (!window.EyloxClan) injectSquadBtn();
    }, 700);
    document.addEventListener('eylox:ranked:win', () => addSquadXP(50, 'ranked_win'));
  });

})();
