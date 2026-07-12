/* ============================================================
   EYLOX — Party System  v2.0
   Create parties, invite friends, pick + launch games together
   Inline sorted game picker — no page redirect needed
   ============================================================ */
'use strict';

(function EyloxParty() {
  const page = document.body?.dataset?.page || '';
  if (['game','login','landing'].some(p => page.startsWith(p))) return;

  /* ── Data helpers ── */
  function getParty()  { try { return JSON.parse(localStorage.getItem('eylox_party') || 'null'); } catch { return null; } }
  function saveParty(p){ p ? localStorage.setItem('eylox_party', JSON.stringify(p)) : localStorage.removeItem('eylox_party'); }
  function getUser()   { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } }
  function getFriends(){ try { const f=JSON.parse(localStorage.getItem('eylox_friends')||'[]'); return f.map(x=>typeof x==='string'?x:x.username).filter(Boolean); } catch { return []; } }
  function makeCode()  { return Math.random().toString(36).slice(2,8).toUpperCase(); }

  /* ── All games (sorted by player count desc) ── */
  const ALL_GAMES = [
    { id:'open-world',    name:'Open World',       thumb:'🌍', genre:'sandbox',   players:62000, label:'62.0K' },
    { id:'sky-riders',    name:'Sky Riders',        thumb:'✈️', genre:'racing',    players:120000,label:'120K' },
    { id:'block-kingdom', name:'Block Kingdom',     thumb:'🧱', genre:'building',  players:98000, label:'98.0K' },
    { id:'ninja-dash',    name:'Ninja Dash',        thumb:'🥷', genre:'action',    players:75000, label:'75.0K' },
    { id:'anime-arena',   name:'Anime Arena',       thumb:'⚔️', genre:'anime',     players:55000, label:'55.0K' },
    { id:'space-blaster', name:'Space Blaster',     thumb:'🚀', genre:'action',    players:55000, label:'55.0K' },
    { id:'pet-tycoon',    name:'Pet Tycoon',        thumb:'🐾', genre:'simulator', players:44000, label:'44.0K' },
    { id:'shinobi-clash', name:'Shinobi Clash',     thumb:'🥷', genre:'anime',     players:40000, label:'40.0K' },
    { id:'city-builder',  name:'City Builder',      thumb:'🏙️', genre:'simulator', players:38000, label:'38.0K' },
    { id:'farm-friends',  name:'Farm Friends',      thumb:'🌾', genre:'roleplay',  players:38000, label:'38.0K' },
    { id:'treasure-hunt', name:'Treasure Hunt',     thumb:'💎', genre:'adventure', players:31000, label:'31.0K' },
    { id:'pirate-bay',    name:'Pirate Bay',        thumb:'🏴‍☠️', genre:'adventure', players:26000, label:'26.0K' },
    { id:'candy-chaos',   name:'Candy Chaos',       thumb:'🍭', genre:'action',    players:22000, label:'22.0K' },
    { id:'shadow-manor',  name:'Shadow Manor',      thumb:'👻', genre:'horror',    players:18000, label:'18.0K' },
    { id:'ice-fortress',  name:'Ice Fortress',      thumb:'❄️', genre:'building',  players:18000, label:'18.0K' },
    { id:'logic-lab',     name:'Logic Lab',         thumb:'🧬', genre:'puzzle',    players:15000, label:'15.0K' },
    { id:'cursed-labyrinth',name:'Cursed Labyrinth',thumb:'🕯️', genre:'horror',    players:12000, label:'12.0K' },
    { id:'pixel-craft',   name:'Pixel Craft',       thumb:'🟦', genre:'sandbox',   players:29000, label:'29.0K' },
    { id:'ocean-quest',   name:'Ocean Quest',       thumb:'🌊', genre:'adventure', players:64000, label:'64.0K' },
    { id:'dragon-escape', name:'Dragon Escape',     thumb:'🐉', genre:'survival',  players:47000, label:'47.0K' },
    { id:'jungle-run',    name:'Jungle Run',        thumb:'🌿', genre:'adventure', players:41000, label:'41.0K' },
    { id:'puzzle-palace', name:'Puzzle Palace',     thumb:'🧩', genre:'puzzle',    players:52000, label:'52.0K' },
    { id:'race-city',     name:'Race City',         thumb:'🏎️', genre:'racing',    players:33000, label:'33.0K' },
  ].sort((a,b) => b.players - a.players);

  const GENRES = [
    { key:'',          label:'All' },
    { key:'action',    label:'⚡ Action' },
    { key:'adventure', label:'🗺️ Adventure' },
    { key:'racing',    label:'🏎️ Racing' },
    { key:'survival',  label:'🌋 Survival' },
    { key:'horror',    label:'👻 Horror' },
    { key:'anime',     label:'⚔️ Anime' },
    { key:'sandbox',   label:'🌍 Sandbox' },
    { key:'simulator', label:'🐾 Simulator' },
    { key:'puzzle',    label:'🧩 Puzzle' },
    { key:'building',  label:'🏗️ Building' },
    { key:'roleplay',  label:'🎭 Roleplay' },
  ];

  /* ── Styles ── */
  if (!document.getElementById('party-sys-style')) {
    const s = document.createElement('style');
    s.id = 'party-sys-style';
    s.textContent = `
      #party-fab{position:fixed;bottom:22px;right:72px;z-index:9991;background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;border-radius:50%;width:48px;height:48px;color:#fff;font-size:1.25rem;cursor:pointer;box-shadow:0 4px 20px rgba(124,58,237,.55);transition:transform .2s,box-shadow .2s;display:flex;align-items:center;justify-content:center;}
      #party-fab:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(124,58,237,.75);}
      #party-fab .pb{position:absolute;top:-5px;right:-5px;background:#f472b6;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.6rem;font-weight:800;display:none;align-items:center;justify-content:center;border:2px solid #0f0a28;}
      #party-widget{position:fixed;bottom:78px;right:16px;z-index:9990;width:290px;font-family:'Nunito',sans-serif;}
      #party-panel{background:rgba(10,6,35,.97);backdrop-filter:blur(22px);border:1px solid rgba(167,139,250,.28);border-radius:18px;padding:16px;display:none;box-shadow:0 16px 56px rgba(0,0,0,.7);}
      #party-panel.open{display:block;animation:pSlide .22s cubic-bezier(.34,1.56,.64,1);}
      @keyframes pSlide{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
      .ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
      .pt{color:#e9d5ff;font-size:.9rem;font-weight:800;letter-spacing:.3px;display:flex;align-items:center;gap:6px;}
      .px{background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:1.05rem;padding:0 2px;line-height:1;}
      .px:hover{color:#e9d5ff;}
      .ps{margin-bottom:12px;}
      .pl{color:#9d8ec7;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;}
      .pcb{background:rgba(124,58,237,.18);border:1.5px dashed rgba(167,139,250,.4);border-radius:10px;padding:9px 12px;display:flex;align-items:center;justify-content:space-between;}
      .pc{color:#fde68a;font-size:1.15rem;font-weight:800;letter-spacing:5px;font-family:monospace;}
      .pcp{background:rgba(124,58,237,.4);border:none;color:#c4b5fd;border-radius:6px;padding:3px 9px;cursor:pointer;font-size:.68rem;font-weight:800;}
      .pcp:hover{background:rgba(124,58,237,.65);}
      .pm{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);}
      .pm:last-child{border-bottom:none;}
      .pav{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:800;color:#fff;flex-shrink:0;}
      .pn{color:#e9d5ff;font-size:.82rem;font-weight:700;flex:1;}
      .pr{font-size:.8rem;}
      .pil{max-height:110px;overflow-y:auto;}
      .pfi{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);}
      .pfn{color:#c4b5fd;font-size:.78rem;}
      .pib{background:rgba(124,58,237,.35);border:1px solid rgba(167,139,250,.3);color:#c4b5fd;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:.68rem;font-weight:800;transition:background .15s;}
      .pib:hover{background:rgba(124,58,237,.6);}
      .pib.sent{background:rgba(74,222,128,.18);color:#4ade80;border-color:rgba(74,222,128,.4);}
      .pacts{display:flex;gap:8px;margin-top:12px;}
      .pbtn{flex:1;padding:9px;border-radius:10px;border:none;font-family:'Fredoka One',cursive;font-size:.85rem;cursor:pointer;transition:filter .15s;}
      .pbtn-p{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;}
      .pbtn-p:hover{filter:brightness(1.15);}
      .pbtn-d{background:rgba(239,68,68,.18);color:#fca5a5;border:1px solid rgba(239,68,68,.3);}
      .pbtn-d:hover{background:rgba(239,68,68,.35);}
      .pnp{text-align:center;padding:8px 0;}
      .pnp-msg{color:#9d8ec7;font-size:.8rem;margin-bottom:12px;line-height:1.5;}
      .pcreate{width:100%;padding:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;font-family:'Fredoka One',cursive;font-size:.9rem;cursor:pointer;transition:filter .15s;}
      .pcreate:hover{filter:brightness(1.12);}
      .pjr{display:flex;gap:6px;margin-top:8px;}
      .pji{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(167,139,250,.22);color:#e9d5ff;border-radius:8px;padding:6px 10px;font-family:'Nunito',sans-serif;font-size:.78rem;letter-spacing:2px;text-transform:uppercase;}
      .pji::placeholder{color:#6b7280;letter-spacing:0;text-transform:none;}
      .pjg{background:rgba(124,58,237,.45);border:1px solid rgba(167,139,250,.28);color:#c4b5fd;border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:800;font-size:.78rem;}
      .pjg:hover{background:rgba(124,58,237,.7);}
      .pempty{color:#6b7280;font-size:.78rem;text-align:center;padding:6px 0;}
      /* ── Game Picker ── */
      #party-game-picker{background:rgba(10,6,35,.97);backdrop-filter:blur(22px);border:1px solid rgba(167,139,250,.28);border-radius:18px;padding:14px;display:none;position:fixed;bottom:78px;right:16px;width:320px;z-index:9992;box-shadow:0 16px 56px rgba(0,0,0,.7);animation:pSlide .22s cubic-bezier(.34,1.56,.64,1);}
      #party-game-picker.open{display:block;}
      .pgp-title{font-family:'Fredoka One',cursive;font-size:.95rem;color:#e9d5ff;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;}
      .pgp-search{width:100%;background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.2);border-radius:9px;padding:7px 12px;color:#e9d5ff;font-family:'Nunito',sans-serif;font-size:.8rem;font-weight:700;outline:none;margin-bottom:8px;}
      .pgp-search::placeholder{color:#6b7280;}
      .pgp-genres{display:flex;gap:5px;overflow-x:auto;margin-bottom:10px;padding-bottom:2px;scrollbar-width:none;}
      .pgp-genres::-webkit-scrollbar{display:none;}
      .pgp-genre{flex-shrink:0;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.18);color:rgba(180,160,220,.65);font-size:.66rem;font-weight:800;padding:3px 10px;border-radius:99px;cursor:pointer;transition:all .15s;}
      .pgp-genre.active{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-color:transparent;}
      .pgp-list{max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:5px;scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.2) transparent;}
      .pgp-list::-webkit-scrollbar{width:3px;}
      .pgp-list::-webkit-scrollbar-thumb{background:rgba(167,139,250,.25);border-radius:99px;}
      .pgp-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:rgba(167,139,250,.05);border:1px solid rgba(167,139,250,.08);cursor:pointer;transition:all .15s;}
      .pgp-item:hover{background:rgba(167,139,250,.12);border-color:rgba(167,139,250,.28);transform:translateX(2px);}
      .pgp-item.selected{background:rgba(124,58,237,.2);border-color:rgba(167,139,250,.45);}
      .pgp-thumb{font-size:1.4rem;flex-shrink:0;width:30px;text-align:center;}
      .pgp-info{flex:1;min-width:0;}
      .pgp-name{font-size:.82rem;font-weight:800;color:#e9d5ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .pgp-meta{font-size:.65rem;color:#9d8ec7;font-weight:700;margin-top:1px;}
      .pgp-players{font-size:.65rem;color:rgba(74,222,128,.8);font-weight:800;}
      .pgp-select-btn{background:rgba(124,58,237,.4);border:1px solid rgba(167,139,250,.3);color:#c4b5fd;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:.68rem;font-weight:800;flex-shrink:0;transition:background .15s;}
      .pgp-select-btn:hover{background:rgba(124,58,237,.7);}
      .pgp-footer{display:flex;gap:8px;margin-top:10px;}
      .pgp-confirm{flex:1;padding:9px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;font-family:'Fredoka One',cursive;font-size:.85rem;cursor:pointer;transition:filter .15s;}
      .pgp-confirm:hover{filter:brightness(1.12);}
      .pgp-confirm:disabled{opacity:.4;cursor:not-allowed;}
      .pgp-cancel{padding:9px 14px;background:rgba(239,68,68,.12);color:#fca5a5;border:1px solid rgba(239,68,68,.25);border-radius:10px;font-family:'Fredoka One',cursive;font-size:.85rem;cursor:pointer;}
      .sort-badge{background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.22);border-radius:99px;padding:1px 7px;font-size:.58rem;font-weight:900;margin-left:4px;}
    `;
    document.head.appendChild(s);
  }

  /* ── State ── */
  let _pickerGenre = '';
  let _pickerQuery = '';
  let _selectedGame = null;

  /* ── Build FAB + panel ── */
  function buildWidget() {
    if (document.getElementById('party-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'party-fab';
    fab.title = 'Party System';
    fab.innerHTML = '🎮<span class="pb" id="party-badge"></span>';
    document.body.appendChild(fab);

    const widget = document.createElement('div');
    widget.id = 'party-widget';
    widget.innerHTML = '<div id="party-panel"></div>';
    document.body.appendChild(widget);

    /* Game picker overlay */
    const picker = document.createElement('div');
    picker.id = 'party-game-picker';
    document.body.appendChild(picker);

    fab.addEventListener('click', () => {
      const p = document.getElementById('party-panel');
      p.classList.toggle('open');
      if (p.classList.contains('open')) renderPanel();
      /* Close picker if panel closed */
      if (!p.classList.contains('open')) closeGamePicker();
    });
  }

  /* ── Render main party panel ── */
  function renderPanel() {
    const panel = document.getElementById('party-panel');
    if (!panel) return;
    const party = getParty();

    if (!party) {
      panel.innerHTML = `
        <div class="ph">
          <span class="pt">🎮 Party System</span>
          <button class="px" onclick="document.getElementById('party-panel').classList.remove('open')">✕</button>
        </div>
        <div class="pnp">
          <p class="pnp-msg">Create a party to squad up<br>with friends and play together!</p>
          <button class="pcreate" id="p-create">+ Create Party</button>
          <div class="pjr">
            <input class="pji" id="p-join-code" placeholder="Enter 6-char code…" maxlength="6">
            <button class="pjg" id="p-join-go">Join</button>
          </div>
        </div>`;
      document.getElementById('p-create')?.addEventListener('click', createParty);
      document.getElementById('p-join-go')?.addEventListener('click', joinParty);
      document.getElementById('p-join-code')?.addEventListener('keydown', e => { if (e.key === 'Enter') joinParty(); });
      return;
    }

    const friends = getFriends().filter(f => !party.members.find(m => m.name === f)).slice(0, 6);
    const membersHTML = party.members.map(m => `
      <div class="pm">
        <div class="pav">${(m.name[0] || '?').toUpperCase()}</div>
        <span class="pn">${m.name}</span>
        <span class="pr">${m.role === 'leader' ? '👑' : '●'}</span>
      </div>`).join('');

    const friendsHTML = friends.length
      ? friends.map(f => `<div class="pfi"><span class="pfn">👤 ${f}</span><button class="pib" data-pf="${f}">Invite</button></div>`).join('')
      : '<p class="pempty">No friends to invite yet</p>';

    const gameLabel = party.game
      ? `<span style="font-size:.72rem;font-weight:800;color:#a78bfa;margin-left:4px">${party.game}</span>`
      : '';

    panel.innerHTML = `
      <div class="ph">
        <span class="pt">🎮 Party (${party.members.length}/4)${gameLabel}</span>
        <button class="px" onclick="document.getElementById('party-panel').classList.remove('open');closeGamePicker()">✕</button>
      </div>
      <div class="ps">
        <div class="pl">Party Code</div>
        <div class="pcb">
          <span class="pc" id="p-code">${party.code}</span>
          <button class="pcp" id="p-copy">Copy</button>
        </div>
      </div>
      <div class="ps">
        <div class="pl">Members</div>
        ${membersHTML}
      </div>
      ${getFriends().length ? `<div class="ps"><div class="pl">Invite Friends</div><div class="pil">${friendsHTML}</div></div>` : ''}
      <div class="pacts">
        ${party.game
          ? `<button class="pbtn pbtn-p" id="p-launch">▶ Play ${party.game}</button>`
          : `<button class="pbtn pbtn-p" id="p-pick">🎮 Pick Game</button>`}
        <button class="pbtn pbtn-d" id="p-leave">Leave</button>
      </div>`;

    document.getElementById('p-copy')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(party.code).catch(() => {});
      const b = document.getElementById('p-copy');
      if (b) { b.textContent = '✓ Done'; setTimeout(() => { if (b) b.textContent = 'Copy'; }, 1500); }
    });
    document.getElementById('p-leave')?.addEventListener('click', leaveParty);
    document.getElementById('p-launch')?.addEventListener('click', () => {
      if (party.game) window.location.href = `games.html`;
    });
    document.getElementById('p-pick')?.addEventListener('click', openGamePicker);
    panel.querySelectorAll('.pib[data-pf]').forEach(btn => {
      btn.addEventListener('click', () => inviteFriend(btn.dataset.pf, btn));
    });
  }

  /* ── Game Picker ── */
  function openGamePicker() {
    _pickerGenre = '';
    _pickerQuery = '';
    _selectedGame = null;
    renderGamePicker();
    document.getElementById('party-game-picker')?.classList.add('open');
  }

  function closeGamePicker() {
    document.getElementById('party-game-picker')?.classList.remove('open');
  }

  function renderGamePicker() {
    const picker = document.getElementById('party-game-picker');
    if (!picker) return;

    const filtered = ALL_GAMES.filter(g => {
      const matchGenre = !_pickerGenre || g.genre === _pickerGenre;
      const matchQ     = !_pickerQuery || g.name.toLowerCase().includes(_pickerQuery);
      return matchGenre && matchQ;
    });

    picker.innerHTML = `
      <div class="pgp-title">
        🎮 Pick a Game <span class="sort-badge">↓ Popular</span>
        <button class="px" onclick="closeGamePicker()">✕</button>
      </div>
      <input class="pgp-search" id="pgp-search" placeholder="🔍 Search games…" value="${_pickerQuery}" oninput="pgpSearch(this.value)"/>
      <div class="pgp-genres" id="pgp-genres">
        ${GENRES.map(g => `<span class="pgp-genre${_pickerGenre === g.key ? ' active' : ''}" onclick="pgpFilter('${g.key}')">${g.label}</span>`).join('')}
      </div>
      <div class="pgp-list" id="pgp-list">
        ${filtered.length ? filtered.map(g => `
          <div class="pgp-item${_selectedGame === g.id ? ' selected' : ''}" onclick="pgpSelect('${g.id}','${g.name}',this)">
            <div class="pgp-thumb">${g.thumb}</div>
            <div class="pgp-info">
              <div class="pgp-name">${g.name}</div>
              <div class="pgp-meta">${g.genre.charAt(0).toUpperCase()+g.genre.slice(1)} · <span class="pgp-players">👥 ${g.label}</span></div>
            </div>
          </div>`).join('')
        : '<div style="text-align:center;padding:20px;color:#6b7280;font-size:.8rem;font-weight:700">No games found</div>'}
      </div>
      <div class="pgp-footer">
        <button class="pgp-confirm" id="pgp-confirm" ${_selectedGame ? '' : 'disabled'} onclick="pgpConfirm()">
          ${_selectedGame ? '▶ Select Game' : 'Choose a game…'}
        </button>
        <button class="pgp-cancel" onclick="closeGamePicker()">Cancel</button>
      </div>`;
  }

  window.pgpSearch = function(val) {
    _pickerQuery = val.toLowerCase().trim();
    renderGamePicker();
    /* Restore cursor focus */
    const s = document.getElementById('pgp-search');
    if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  };

  window.pgpFilter = function(genre) {
    _pickerGenre = genre;
    renderGamePicker();
  };

  window.pgpSelect = function(id, name, el) {
    _selectedGame = id;
    window._selectedGameName = name;
    document.querySelectorAll('.pgp-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('pgp-confirm');
    if (btn) { btn.disabled = false; btn.textContent = `▶ Play ${name}`; }
  };

  window.pgpConfirm = function() {
    if (!_selectedGame) return;
    const name = window._selectedGameName || _selectedGame;
    window.EyloxParty?.setGame(name);
    closeGamePicker();
    /* Re-render panel to show the selected game */
    setTimeout(renderPanel, 80);
  };

  window.closeGamePicker = closeGamePicker;

  /* ── Party actions ── */
  function createParty() {
    const name = getUser()?.username || 'Player';
    saveParty({ code: makeCode(), leader: name, members: [{ name, role: 'leader' }], game: null, created: Date.now() });
    updateBadge();
    renderPanel();
    window.EyloxToast?.('🎮 Party created! Share your code with friends.', 'success', 3000);
  }

  function joinParty() {
    const code = document.getElementById('p-join-code')?.value?.trim().toUpperCase();
    if (!code || code.length < 4) { window.EyloxToast?.('Enter a valid party code.', 'warn', 2000); return; }
    const name = getUser()?.username || 'Player';
    saveParty({ code, leader: 'Host', members: [{ name: 'Host', role: 'leader' }, { name, role: 'member' }], game: null, created: Date.now() });
    updateBadge();
    renderPanel();
    window.EyloxToast?.(`✅ Joined party ${code}!`, 'success', 2500);
  }

  function leaveParty() {
    saveParty(null);
    closeGamePicker();
    updateBadge();
    renderPanel();
    window.EyloxToast?.('👋 Left the party.', 'info', 2000);
  }

  function inviteFriend(name, btn) {
    const party = getParty();
    if (!party) return;
    if (party.members.length >= 4) { window.EyloxToast?.('Party is full (4/4)!', 'warn', 2000); return; }
    if (party.members.find(m => m.name === name)) return;
    party.members.push({ name, role: 'member' });
    saveParty(party);
    if (btn) { btn.textContent = '✓ Invited'; btn.classList.add('sent'); btn.disabled = true; }
    updateBadge();
    window.EyloxToast?.(`📨 Invited ${name} to the party!`, 'success', 2000);
  }

  /* ── Public API ── */
  window.EyloxParty = {
    setGame(gameTitle) {
      const party = getParty();
      if (!party) return;
      party.game = gameTitle;
      saveParty(party);
      window.EyloxToast?.(`🎮 Party game set: ${gameTitle}`, 'success', 2000);
      const p = document.getElementById('party-panel');
      if (p?.classList.contains('open')) renderPanel();
    },
    get()       { return getParty(); },
    isInParty() { return !!getParty(); },
  };

  function updateBadge() {
    const badge = document.getElementById('party-badge');
    if (!badge) return;
    const party = getParty();
    if (party && party.members.length > 1) {
      badge.textContent = party.members.length;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => { buildWidget(); updateBadge(); });
  if (document.readyState !== 'loading') { buildWidget(); updateBadge(); }

})();
