/* ============================================================
   EYLOX Platform V2 — Clan Roles · Season Pass · UI Polish
   ============================================================ */
'use strict';

/* ── Tiny localStorage helper ── */
const PV2 = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(d)); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  me:  () => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } },
};

/* ================================================================
   1. CLAN ROLE SYSTEM
   Roles: owner → admin → moderator → member
   Only the clan owner can delete, transfer, kick admins, edit settings.
================================================================ */
const ClanRoles = (() => {
  const ROLES = { owner: 4, admin: 3, moderator: 2, member: 1 };
  const ROLE_META = {
    owner:     { label: '👑 Owner',     color: '#fbbf24', bg: 'rgba(251,191,36,.14)' },
    admin:     { label: '🛡️ Admin',     color: '#60a5fa', bg: 'rgba(96,165,250,.12)' },
    moderator: { label: '⚖️ Mod',       color: '#a78bfa', bg: 'rgba(167,139,250,.12)' },
    member:    { label: '🎮 Member',    color: 'rgba(180,160,220,.65)', bg: 'rgba(167,139,250,.07)' },
  };

  function getClan() { return PV2.get('eylox_clan', null); }
  function saveClan(c) { PV2.set('eylox_clan', c); }

  function myRole() {
    const clan = getClan();
    const me   = PV2.me();
    if (!clan || !me) return null;
    const m = (clan.members || []).find(x => x.username === me.username);
    return m ? m.role : null;
  }

  function can(action) {
    const role  = myRole();
    const level = ROLES[role] || 0;
    const rules = {
      deleteClan:       level >= 4,
      transferOwnership:level >= 4,
      changeSettings:   level >= 4,
      kickAdmin:        level >= 4,
      kickModerator:    level >= 3,
      kickMember:       level >= 3,
      editLogo:         level >= 4,
      editDesc:         level >= 4,
      promoteToMod:     level >= 3,
      promoteToAdmin:   level >= 4,
      inviteMember:     level >= 2,
      startBattle:      level >= 2,
    };
    return !!rules[action];
  }

  function promoteLocal(username, newRole) {
    const clan = getClan(); if (!clan) return false;
    if (!can('promoteToAdmin') && newRole === 'admin') return false;
    if (!can('promoteToMod')  && newRole === 'moderator') return false;
    const me = PV2.me();
    const m  = (clan.members || []).find(x => x.username === username);
    if (!m) return false;
    if (m.username === me?.username) return false; // can't promote self
    if (m.role === 'owner') return false;          // can't touch owner
    m.role = newRole;
    saveClan(clan);
    return true;
  }

  function kickLocal(username) {
    const clan = getClan(); if (!clan) return false;
    const me = PV2.me();
    const m  = (clan.members || []).find(x => x.username === username);
    if (!m || m.username === me?.username) return false;
    if (m.role === 'owner') return false;
    if (m.role === 'admin' && !can('kickAdmin')) return false;
    if (m.role === 'moderator' && !can('kickModerator')) return false;
    clan.members = clan.members.filter(x => x.username !== username);
    saveClan(clan);
    return true;
  }

  function transferOwnership(username) {
    if (!can('transferOwnership')) return false;
    const clan = getClan(); if (!clan) return false;
    const me   = PV2.me();
    const newOwner = (clan.members || []).find(x => x.username === username);
    const oldOwner = (clan.members || []).find(x => x.username === me?.username);
    if (!newOwner || !oldOwner) return false;
    newOwner.role = 'owner';
    oldOwner.role = 'admin';
    saveClan(clan);
    return true;
  }

  /* ── Clan Management Modal ── */
  function openManageModal() {
    const existing = document.getElementById('clan-manage-modal');
    if (existing) { existing.remove(); }

    const clan = getClan();
    const me   = PV2.me();
    if (!clan) return;
    const role = myRole();

    const modal = document.createElement('div');
    modal.id = 'clan-manage-modal';
    modal.className = 'pv2-modal-overlay';
    modal.innerHTML = `
      <div class="pv2-modal pv2-clan-modal" role="dialog" aria-label="Clan Management">
        <button class="pv2-modal-close" onclick="document.getElementById('clan-manage-modal').remove()">✕</button>
        <div class="pv2-clan-modal-header">
          <div class="pv2-clan-icon">${clan.icon || '⚔️'}</div>
          <div>
            <div class="pv2-clan-modal-title">${clan.name}</div>
            <div class="pv2-clan-modal-sub">${ROLE_META[role]?.label || 'Member'} · ${(clan.members || []).length} members</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="pv2-tabs" id="clanMgmtTabs">
          <button class="pv2-tab active" onclick="pv2SwitchClanTab('members',this)">👥 Members</button>
          ${role === 'owner' ? `<button class="pv2-tab" onclick="pv2SwitchClanTab('settings',this)">⚙️ Settings</button>` : ''}
          ${role === 'owner' ? `<button class="pv2-tab" onclick="pv2SwitchClanTab('danger',this)">⚠️ Danger</button>` : ''}
        </div>

        <!-- Members Tab -->
        <div id="clanMgmt-members" class="pv2-tab-panel">
          <div class="pv2-members-list" id="clanMgmtMembersList"></div>
        </div>

        <!-- Settings Tab (Owner only) -->
        <div id="clanMgmt-settings" class="pv2-tab-panel" style="display:none">
          <div class="pv2-form-row">
            <label class="pv2-form-label">Clan Icon (emoji)</label>
            <input class="pv2-form-input" id="mgmt-icon" value="${clan.icon || '⚔️'}" maxlength="2"/>
          </div>
          <div class="pv2-form-row">
            <label class="pv2-form-label">Clan Name</label>
            <input class="pv2-form-input" id="mgmt-name" value="${clan.name || ''}" maxlength="40"/>
          </div>
          <div class="pv2-form-row">
            <label class="pv2-form-label">Description</label>
            <textarea class="pv2-form-input" id="mgmt-desc" style="min-height:72px;resize:vertical">${clan.desc || ''}</textarea>
          </div>
          <div class="pv2-form-row">
            <label class="pv2-form-label">Join Permissions</label>
            <select class="pv2-form-input" id="mgmt-join">
              <option value="open" ${(clan.joinPerm||'open')==='open'?'selected':''}>🌐 Open (anyone can join)</option>
              <option value="invite" ${(clan.joinPerm||'open')==='invite'?'selected':''}>📩 Invite Only</option>
            </select>
          </div>
          <button class="pv2-btn-primary" onclick="ClanRoles.saveSettings()">💾 Save Settings</button>
        </div>

        <!-- Danger Tab (Owner only) -->
        <div id="clanMgmt-danger" class="pv2-tab-panel" style="display:none">
          <div class="pv2-danger-section">
            <div class="pv2-danger-title">⚠️ Transfer Ownership</div>
            <div class="pv2-danger-desc">Hand over the clan to a trusted member. You'll become an Admin.</div>
            <select class="pv2-form-input" id="mgmt-transfer-target" style="margin-bottom:10px">
              ${(clan.members || []).filter(m => m.username !== me?.username)
                .map(m => `<option value="${m.username}">${m.username} (${m.role})</option>`).join('') || '<option disabled>No other members</option>'}
            </select>
            <button class="pv2-btn-warn" onclick="ClanRoles.doTransfer()">👑 Transfer</button>
          </div>
          <div class="pv2-danger-section" style="margin-top:16px;border-color:rgba(239,68,68,.25)">
            <div class="pv2-danger-title" style="color:#f87171">🗑️ Delete Clan</div>
            <div class="pv2-danger-desc">Permanently deletes the clan. This cannot be undone.</div>
            <button class="pv2-btn-danger" onclick="ClanRoles.doDelete()">❌ Delete Clan</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    renderMembersList(clan, me, role);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  function renderMembersList(clan, me, myRoleName) {
    const list = document.getElementById('clanMgmtMembersList');
    if (!list) return;
    list.innerHTML = (clan.members || []).map(m => {
      const meta   = ROLE_META[m.role] || ROLE_META.member;
      const isSelf = m.username === me?.username;
      const canKick = !isSelf && m.role !== 'owner' && (
        (m.role === 'admin' && can('kickAdmin')) ||
        (m.role === 'moderator' && can('kickModerator')) ||
        (m.role === 'member' && can('kickMember'))
      );
      const canPromoteMod   = !isSelf && m.role === 'member'    && can('promoteToMod');
      const canPromoteAdmin = !isSelf && m.role === 'moderator' && can('promoteToAdmin');
      const canDemote       = !isSelf && (m.role === 'admin' || m.role === 'moderator') && can('promoteToAdmin');

      return `
        <div class="pv2-member-row">
          <div class="pv2-member-av">${m.avatar || '🎮'}</div>
          <div class="pv2-member-info">
            <div class="pv2-member-name">${m.username}${isSelf ? ' <span style="color:var(--muted);font-size:.72rem">(You)</span>' : ''}</div>
            <span class="pv2-role-badge" style="color:${meta.color};background:${meta.bg}">${meta.label}</span>
          </div>
          <div class="pv2-member-actions">
            ${canPromoteMod ? `<button class="pv2-act-btn" onclick="ClanRoles.promote('${m.username}','moderator')">⬆️ Mod</button>` : ''}
            ${canPromoteAdmin ? `<button class="pv2-act-btn" onclick="ClanRoles.promote('${m.username}','admin')">⬆️ Admin</button>` : ''}
            ${canDemote ? `<button class="pv2-act-btn" onclick="ClanRoles.promote('${m.username}','member')">⬇️ Demote</button>` : ''}
            ${canKick ? `<button class="pv2-act-btn pv2-act-danger" onclick="ClanRoles.kick('${m.username}')">🚪 Kick</button>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function saveSettings() {
    if (!can('changeSettings')) return;
    const clan = getClan(); if (!clan) return;
    clan.icon     = document.getElementById('mgmt-icon')?.value || clan.icon;
    clan.name     = document.getElementById('mgmt-name')?.value || clan.name;
    clan.desc     = document.getElementById('mgmt-desc')?.value || clan.desc;
    clan.joinPerm = document.getElementById('mgmt-join')?.value || 'open';
    saveClan(clan);
    showToast('✅ Clan settings saved!');
    document.getElementById('clan-manage-modal')?.remove();
    if (typeof renderMyClan === 'function') renderMyClan();
  }

  function doTransfer() {
    if (!can('transferOwnership')) return showToast('❌ Only the Owner can transfer.');
    const target = document.getElementById('mgmt-transfer-target')?.value;
    if (!target) return;
    if (!confirm(`Transfer clan ownership to ${target}? You will become an Admin.`)) return;
    if (transferOwnership(target)) {
      showToast(`👑 Ownership transferred to ${target}!`);
      document.getElementById('clan-manage-modal')?.remove();
      if (typeof renderMyClan === 'function') renderMyClan();
    }
  }

  function doDelete() {
    if (!can('deleteClan')) return showToast('❌ Only the Owner can delete the clan.');
    if (!confirm('Delete clan forever? This cannot be undone.')) return;
    PV2.set('eylox_clan', null);
    showToast('🗑️ Clan deleted.');
    document.getElementById('clan-manage-modal')?.remove();
    if (typeof renderClanPanel === 'function') renderClanPanel();
  }

  function promote(username, role) {
    if (promoteLocal(username, role)) {
      showToast(`✅ ${username} is now ${ROLE_META[role]?.label || role}`);
      openManageModal(); // re-open to refresh
    } else {
      showToast('❌ Permission denied.');
    }
  }

  function kick(username) {
    if (!confirm(`Kick ${username} from the clan?`)) return;
    if (kickLocal(username)) {
      showToast(`🚪 ${username} was kicked.`);
      openManageModal();
    } else {
      showToast('❌ Permission denied.');
    }
  }

  /* Inject manage button into clan card */
  function injectManageButton() {
    const existing = document.getElementById('clanManageBtn');
    if (existing) return;
    const section  = document.getElementById('myClanSection');
    if (!section) return;
    const role     = myRole();
    if (!role) return;
    const btn = document.createElement('button');
    btn.id = 'clanManageBtn';
    btn.className = 'pv2-manage-btn';
    btn.innerHTML = `⚙️ ${role === 'owner' ? 'Manage Clan' : 'View Members'}`;
    btn.onclick = openManageModal;
    const header = section.querySelector('.clan-header');
    if (header) header.appendChild(btn);
  }

  return { can, myRole, getRoleMeta: r => ROLE_META[r], promote, kick,
           saveSettings, doTransfer, doDelete, openManageModal, injectManageButton,
           ensureOwner(clanData) {
             const me = PV2.me();
             if (!me || !clanData) return clanData;
             if (!(clanData.members || []).find(m => m.username === me.username)) {
               clanData.members = clanData.members || [];
               clanData.members.unshift({ username: me.username, role: 'owner', avatar: me.avatar || '🎮' });
             }
             return clanData;
           }};
})();

window.ClanRoles = ClanRoles;

/* Tab switcher */
window.pv2SwitchClanTab = function(name, btn) {
  document.querySelectorAll('#clanMgmtTabs .pv2-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pv2-tab-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(`clanMgmt-${name}`);
  if (panel) panel.style.display = '';
};


/* ================================================================
   2. SEASON PASS SYSTEM
================================================================ */
const SeasonPass = (() => {
  const SEASON  = 'Eylox Season 1';
  const MAX_LVL = 50;

  const FREE_REWARDS = {
    1:  { icon:'💰', label:'100 Coins' },
    5:  { icon:'🎮', label:'Player Badge' },
    10: { icon:'💰', label:'250 Coins' },
    15: { icon:'🏆', label:'5 Trophies' },
    20: { icon:'💰', label:'500 Coins' },
    25: { icon:'🎨', label:'Profile Frame' },
    30: { icon:'💰', label:'750 Coins' },
    35: { icon:'🎖️', label:'Veteran Badge' },
    40: { icon:'💰', label:'1,000 Coins' },
    45: { icon:'🔥', label:'Fire Badge' },
    50: { icon:'👑', label:'Season Crown' },
  };

  const PREMIUM_REWARDS = {
    1:  { icon:'⚡', label:'500 Coins' },
    5:  { icon:'🌟', label:'Gold Frame' },
    10: { icon:'💎', label:'1,000 Coins' },
    15: { icon:'🎭', label:'Exclusive Emote' },
    20: { icon:'🚀', label:'2,000 Coins' },
    25: { icon:'🔮', label:'Crystal Avatar' },
    30: { icon:'💰', label:'3,000 Coins' },
    35: { icon:'🦄', label:'Mythic Badge' },
    40: { icon:'🌈', label:'Rainbow Frame' },
    45: { icon:'⭐', label:'5,000 Coins' },
    50: { icon:'👑', label:'Season Legend Title' },
  };

  function getState() {
    return PV2.get('eylox_season_pass', { xp: 0, level: 1, claimed: [], hasPremium: false });
  }

  function saveState(s) { PV2.set('eylox_season_pass', s); }

  function xpToLevel(xp) {
    return Math.min(MAX_LVL, Math.floor(xp / 200) + 1);
  }

  function levelXP(lvl) { return (lvl - 1) * 200; }

  function claim(level, type) {
    const s = getState();
    const key = `${type}_${level}`;
    if (s.claimed.includes(key)) return;
    if (s.level < level) { showToast('⬆️ Reach level ' + level + ' first!'); return; }
    if (type === 'premium' && !s.hasPremium) { showToast('💎 Upgrade to Premium to claim!'); return; }
    s.claimed.push(key);
    const reward = type === 'free' ? FREE_REWARDS[level] : PREMIUM_REWARDS[level];
    if (reward?.label?.includes('Coins')) {
      const amt = parseInt(reward.label.replace(/[^0-9]/g,''), 10) || 100;
      const user = PV2.me(); if (user) { user.coins = (user.coins || 0) + amt; PV2.set('eylox_user', user); }
    }
    saveState(s);
    showToast(`🎉 Claimed: ${reward?.icon || ''} ${reward?.label || 'Reward'}!`);
    renderSeasonModal();
  }

  function addXP(amount) {
    const s = getState();
    s.xp += amount;
    s.level = xpToLevel(s.xp);
    saveState(s);
    return s;
  }

  function openModal() {
    let modal = document.getElementById('season-pass-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'season-pass-modal';
      modal.className = 'pv2-modal-overlay';
      document.body.appendChild(modal);
    }
    renderSeasonModal();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  function renderSeasonModal() {
    const modal = document.getElementById('season-pass-modal');
    if (!modal) return;
    const s      = getState();
    const curXP  = s.xp - levelXP(s.level);
    const needXP = 200;
    const pct    = Math.min(100, Math.round(curXP / needXP * 100));

    const levels = Array.from({ length: MAX_LVL }, (_, i) => i + 1);

    modal.innerHTML = `
      <div class="pv2-modal pv2-sp-modal" role="dialog" aria-label="Season Pass">
        <button class="pv2-modal-close" onclick="document.getElementById('season-pass-modal').remove()">✕</button>
        <div class="pv2-sp-header">
          <div class="pv2-sp-title">🌟 ${SEASON}</div>
          <div class="pv2-sp-sub">Level ${s.level} / ${MAX_LVL}</div>
          <div class="pv2-sp-xp-bar-wrap">
            <div class="pv2-sp-xp-bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="pv2-sp-xp-label">${curXP} / ${needXP} XP · Total: ${s.xp} XP</div>
          ${!s.hasPremium ? `<button class="pv2-btn-premium" onclick="SeasonPass.buyPremium()">💎 Upgrade to Premium Pass</button>` : `<div class="pv2-sp-premium-badge">💎 Premium Active</div>`}
        </div>

        <div class="pv2-sp-track-labels">
          <span class="pv2-track-label-free">🆓 Free Track</span>
          <span class="pv2-track-label-lvl">Level</span>
          <span class="pv2-track-label-prem">💎 Premium</span>
        </div>

        <div class="pv2-sp-rows" id="spRows">
          ${levels.map(lvl => {
            const freeRw   = FREE_REWARDS[lvl];
            const premRw   = PREMIUM_REWARDS[lvl];
            const unlocked = s.level >= lvl;
            const fClaimed = s.claimed.includes(`free_${lvl}`);
            const pClaimed = s.claimed.includes(`premium_${lvl}`);

            return `
              <div class="pv2-sp-row ${unlocked ? 'pv2-sp-unlocked' : ''}">
                <div class="pv2-sp-reward pv2-sp-free">
                  ${freeRw ? `
                    <div class="pv2-sp-reward-icon">${freeRw.icon}</div>
                    <div class="pv2-sp-reward-label">${freeRw.label}</div>
                    ${unlocked && !fClaimed ? `<button class="pv2-claim-btn" onclick="SeasonPass.claim(${lvl},'free')">Claim</button>` : ''}
                    ${fClaimed ? `<div class="pv2-claimed-tick">✓</div>` : ''}
                  ` : `<div class="pv2-sp-no-reward">—</div>`}
                </div>
                <div class="pv2-sp-level-node ${unlocked ? 'pv2-node-done' : ''}" title="Level ${lvl}">
                  <span>${lvl}</span>
                </div>
                <div class="pv2-sp-reward pv2-sp-prem">
                  ${premRw ? `
                    <div class="pv2-sp-reward-icon">${premRw.icon}</div>
                    <div class="pv2-sp-reward-label">${premRw.label}</div>
                    ${unlocked && s.hasPremium && !pClaimed ? `<button class="pv2-claim-btn pv2-claim-prem" onclick="SeasonPass.claim(${lvl},'premium')">Claim</button>` : ''}
                    ${pClaimed ? `<div class="pv2-claimed-tick" style="color:#fbbf24">✓</div>` : ''}
                    ${!s.hasPremium ? `<div class="pv2-sp-lock">🔒</div>` : ''}
                  ` : `<div class="pv2-sp-no-reward">—</div>`}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    // Scroll to current level
    setTimeout(() => {
      const rows = modal.querySelectorAll('.pv2-sp-row');
      const cur  = rows[Math.max(0, s.level - 2)];
      if (cur) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
  }

  function buyPremium() {
    const me = PV2.me();
    if (me?.isGuest) { showToast('❌ Guests cannot purchase Premium. Create an account!'); return; }
    if (!confirm('Upgrade to Premium Season Pass? (Simulated purchase — free for demo)')) return;
    const s = getState();
    s.hasPremium = true;
    saveState(s);
    showToast('💎 Premium Season Pass activated!');
    renderSeasonModal();
  }

  /* Give XP for various actions */
  function hookXPEvents() {
    document.addEventListener('eylox:gameComplete', e => { addXP(50); });
    document.addEventListener('eylox:friendAdded',  e => { addXP(10); });
    document.addEventListener('eylox:login',        e => { addXP(5);  });
    document.addEventListener('eylox:achievement',  e => { addXP(25); });
    document.addEventListener('eylox:clanBattle',   e => { addXP(30); });
  }

  return { openModal, claim, addXP, getState, buyPremium, hookXPEvents };
})();

window.SeasonPass = SeasonPass;


/* ================================================================
   3. GLOBAL UI IMPROVEMENTS
   - Tooltip system
   - Page transition animations
   - Loading skeletons
   - Smooth scroll
   - Better toasts
================================================================ */

/* ── Toast notifications ── */
function showToast(msg, type = 'info', dur = 3000) {
  let wrap = document.getElementById('pv2-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'pv2-toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'pv2-toast pv2-toast-' + type;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('pv2-toast-show'));
  setTimeout(() => {
    t.classList.remove('pv2-toast-show');
    setTimeout(() => t.remove(), 350);
  }, dur);
}
window.showToast = showToast;

/* ── Tooltip system ── */
function initTooltips() {
  let tip = null;
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) return;
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'pv2-tooltip';
      document.body.appendChild(tip);
    }
    tip.textContent = el.dataset.tip;
    tip.style.display = 'block';
    const r = el.getBoundingClientRect();
    tip.style.left  = (r.left + r.width / 2) + 'px';
    tip.style.top   = (r.top - 38 + window.scrollY) + 'px';
    requestAnimationFrame(() => tip.classList.add('pv2-tooltip-show'));
  });
  document.addEventListener('mouseout', e => {
    if (!tip) return;
    const el = e.target.closest('[data-tip]');
    if (el) { tip.classList.remove('pv2-tooltip-show'); setTimeout(() => tip && (tip.style.display = 'none'), 180); }
  });
}

/* ── Page entry animation ── */
function initPageAnimation() {
  document.querySelectorAll('.page-content, .main-area').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'opacity .38s ease, transform .38s ease';
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

/* ── Smooth link navigation with fade ── */
function initSmoothNav() {
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    if (link.target || link.href.includes('#')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      document.body.style.transition = 'opacity .22s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });
}

/* ── Loading skeleton pulse ── */
function showSkeleton(container, rows = 3) {
  container.innerHTML = Array(rows).fill(`
    <div class="pv2-skeleton" style="height:72px;border-radius:12px;margin-bottom:12px"></div>
  `).join('');
}
window.showSkeleton = showSkeleton;

/* ── Mobile-friendly swipe navigation for tabs ── */
function initSwipeTabs() {
  document.querySelectorAll('.pv2-tabs, .comm-tabs').forEach(tabBar => {
    let startX = 0;
    tabBar.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    tabBar.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < 50) return;
      const tabs = [...tabBar.querySelectorAll('.pv2-tab, .comm-tab')];
      const active = tabBar.querySelector('.active');
      const idx    = tabs.indexOf(active);
      const next   = dx < 0 ? tabs[idx + 1] : tabs[idx - 1];
      if (next) next.click();
    }, { passive: true });
  });
}

/* ── Scroll reveal for cards ── */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('pv2-revealed');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.comm-card, .plan-card, .perk-item, .sub-stat, .clan-stat-box').forEach(el => {
    el.classList.add('pv2-reveal');
    obs.observe(el);
  });
}

/* ── Online status pings ── */
function syncOnlineStatus() {
  const me = PV2.me();
  if (!me) return;
  PV2.set('eylox_last_seen_' + me.username, Date.now());
}

function isOnline(username) {
  const ts = PV2.get('eylox_last_seen_' + username, 0);
  return Date.now() - ts < 5 * 60 * 1000; // 5 min
}
window.isOnline = isOnline;

/* ── Season Pass button in topbar/sidebar ── */
function injectSeasonPassButton() {
  const right = document.querySelector('.topbar-right');
  if (!right || document.getElementById('sp-topbar-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'sp-topbar-btn';
  btn.className = 'sp-topbar-btn';
  btn.innerHTML = '🌟 Season Pass';
  btn.setAttribute('data-tip', 'View Season Pass rewards');
  btn.onclick = () => SeasonPass.openModal();
  right.prepend(btn);
}

/* ── Init everything ── */
document.addEventListener('DOMContentLoaded', () => {
  initTooltips();
  initPageAnimation();
  initScrollReveal();
  initSwipeTabs();
  SeasonPass.hookXPEvents();
  syncOnlineStatus();
  setInterval(syncOnlineStatus, 60000);
  injectSeasonPassButton();
  ClanRoles.injectManageButton();
  setTimeout(initSmoothNav, 200);
});


/* ================================================================
   4. CSS (injected into <head>)
================================================================ */
(function injectPV2CSS() {
  if (document.getElementById('pv2-styles')) return;
  const s = document.createElement('style');
  s.id = 'pv2-styles';
  s.textContent = `

/* ── Toast ── */
#pv2-toast-wrap {
  position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
  z-index: 99999; display: flex; flex-direction: column; align-items: center; gap: 8px;
  pointer-events: none;
}
.pv2-toast {
  background: rgba(20,10,50,.97); border: 1px solid rgba(167,139,250,.35);
  color: #f0e8ff; padding: 12px 22px; border-radius: 14px;
  font-family: 'Nunito', sans-serif; font-weight: 700; font-size: .88rem;
  box-shadow: 0 8px 32px rgba(0,0,0,.45); opacity: 0;
  transform: translateY(10px); transition: opacity .28s ease, transform .28s ease;
  pointer-events: none; white-space: nowrap; max-width: min(90vw, 380px);
  text-align: center;
}
.pv2-toast-show { opacity: 1; transform: translateY(0); }

/* ── Tooltip ── */
.pv2-tooltip {
  position: absolute; z-index: 99998; background: rgba(18,8,44,.97);
  border: 1px solid rgba(167,139,250,.3); color: #e8e0ff;
  padding: 6px 12px; border-radius: 8px; font-size: .77rem; font-weight: 700;
  pointer-events: none; white-space: nowrap; transform: translateX(-50%);
  opacity: 0; transition: opacity .18s; display: none;
}
.pv2-tooltip-show { opacity: 1; }

/* ── Scroll reveal ── */
.pv2-reveal { opacity: 0; transform: translateY(18px); transition: opacity .4s ease, transform .4s ease; }
.pv2-revealed { opacity: 1; transform: none; }

/* ── Season Pass topbar button ── */
.sp-topbar-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none; color: #1a1040; padding: 7px 14px; border-radius: 10px;
  font-family: 'Nunito', sans-serif; font-weight: 900; font-size: .78rem;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.sp-topbar-btn:hover { filter: brightness(1.1); transform: scale(1.03); }

/* ── Modal overlay ── */
.pv2-modal-overlay {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(5,2,18,.88); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; animation: pv2FadeIn .22s ease;
}
@keyframes pv2FadeIn { from { opacity: 0 } to { opacity: 1 } }

/* ── Modal box ── */
.pv2-modal {
  background: linear-gradient(160deg, #120535 0%, #0d0325 100%);
  border: 1px solid rgba(167,139,250,.22); border-radius: 20px;
  padding: 28px; width: 100%; max-width: 540px;
  max-height: 88vh; overflow-y: auto; position: relative;
  animation: pv2Pop .28s cubic-bezier(.34,1.4,.64,1);
  box-shadow: 0 24px 80px rgba(0,0,0,.7);
}
@keyframes pv2Pop { from { transform: scale(.92) translateY(16px); opacity: 0 } to { transform: scale(1) translateY(0); opacity: 1 } }

.pv2-modal-close {
  position: absolute; top: 16px; right: 16px;
  background: rgba(167,139,250,.12); border: 1px solid rgba(167,139,250,.2);
  color: rgba(180,160,220,.7); width: 32px; height: 32px; border-radius: 8px;
  cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center;
  transition: all .18s;
}
.pv2-modal-close:hover { background: rgba(167,139,250,.22); color: #f0e8ff; }

/* ── Clan Modal ── */
.pv2-clan-modal { max-width: 520px; }
.pv2-clan-modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.pv2-clan-icon { font-size: 2.8rem; width: 60px; height: 60px; background: rgba(167,139,250,.1); border: 1px solid rgba(167,139,250,.22); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pv2-clan-modal-title { font-family: 'Fredoka One', cursive; font-size: 1.4rem; color: #f0e8ff; }
.pv2-clan-modal-sub { font-size: .78rem; color: rgba(167,139,250,.6); font-weight: 700; margin-top: 2px; }

/* ── Tabs ── */
.pv2-tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
.pv2-tab {
  padding: 7px 14px; border-radius: 10px; border: 1px solid rgba(167,139,250,.18);
  background: rgba(167,139,250,.07); color: rgba(180,160,220,.6);
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: .82rem;
  cursor: pointer; transition: all .18s;
}
.pv2-tab.active { background: rgba(167,139,250,.18); border-color: rgba(167,139,250,.4); color: #c4b5fd; }
.pv2-tab-panel { animation: pv2FadeIn .18s ease; }

/* ── Member rows ── */
.pv2-members-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
.pv2-member-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(167,139,250,.06); border: 1px solid rgba(167,139,250,.1);
  border-radius: 10px; padding: 10px 12px;
}
.pv2-member-av { font-size: 1.6rem; flex-shrink: 0; }
.pv2-member-info { flex: 1; min-width: 0; }
.pv2-member-name { font-weight: 800; font-size: .88rem; color: #f0e8ff; }
.pv2-role-badge { display: inline-block; font-size: .68rem; font-weight: 900; padding: 2px 8px; border-radius: 6px; margin-top: 3px; }
.pv2-member-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.pv2-act-btn { padding: 4px 10px; border-radius: 7px; font-size: .72rem; font-weight: 800; cursor: pointer; border: 1px solid rgba(167,139,250,.25); background: rgba(167,139,250,.1); color: #c4b5fd; transition: all .15s; }
.pv2-act-btn:hover { background: rgba(167,139,250,.22); }
.pv2-act-danger { border-color: rgba(239,68,68,.25); background: rgba(239,68,68,.08); color: #f87171; }
.pv2-act-danger:hover { background: rgba(239,68,68,.18); }

/* ── Danger section ── */
.pv2-danger-section { background: rgba(251,191,36,.05); border: 1px solid rgba(251,191,36,.18); border-radius: 12px; padding: 16px; }
.pv2-danger-title { font-weight: 900; font-size: .9rem; color: #fbbf24; margin-bottom: 6px; }
.pv2-danger-desc { font-size: .78rem; color: rgba(180,160,220,.6); font-weight: 700; margin-bottom: 12px; }

/* ── Manage button ── */
.pv2-manage-btn {
  margin-left: auto; background: rgba(167,139,250,.12); border: 1px solid rgba(167,139,250,.25);
  color: #a78bfa; border-radius: 9px; padding: 6px 14px;
  font-family: 'Nunito', sans-serif; font-size: .78rem; font-weight: 800;
  cursor: pointer; transition: all .18s;
}
.pv2-manage-btn:hover { background: rgba(167,139,250,.22); }

/* ── Form elements ── */
.pv2-form-row { margin-bottom: 14px; }
.pv2-form-label { display: block; font-size: .75rem; font-weight: 900; color: rgba(167,139,250,.55); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 5px; }
.pv2-form-input {
  width: 100%; background: rgba(167,139,250,.06); border: 1px solid rgba(167,139,250,.18);
  border-radius: 10px; padding: 10px 13px; color: #f0e8ff;
  font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700;
  box-sizing: border-box; outline: none; transition: border-color .2s;
}
.pv2-form-input:focus { border-color: rgba(167,139,250,.45); }

/* ── Buttons ── */
.pv2-btn-primary {
  width: 100%; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #a78bfa, #7c3aed); border: none;
  color: #fff; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: .9rem;
  cursor: pointer; transition: filter .2s, transform .2s;
}
.pv2-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.pv2-btn-warn { background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #1a1040; border-radius: 10px; padding: 10px 20px; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: .85rem; cursor: pointer; transition: filter .2s; }
.pv2-btn-warn:hover { filter: brightness(1.1); }
.pv2-btn-danger { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #f87171; border-radius: 10px; padding: 10px 20px; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: .85rem; cursor: pointer; transition: background .2s; }
.pv2-btn-danger:hover { background: rgba(239,68,68,.2); }
.pv2-btn-premium {
  background: linear-gradient(135deg, #f59e0b, #fbbf24); border: none; color: #1a1040;
  border-radius: 12px; padding: 10px 22px; font-family: 'Nunito', sans-serif;
  font-weight: 900; font-size: .88rem; cursor: pointer; transition: filter .2s;
  display: block; margin: 12px auto 0;
}
.pv2-btn-premium:hover { filter: brightness(1.08); }

/* ── Season Pass modal ── */
.pv2-sp-modal { max-width: 620px; padding: 0; overflow: hidden; }
.pv2-sp-header {
  padding: 24px 24px 18px;
  background: linear-gradient(135deg, #1a0840, #0f0325);
  border-bottom: 1px solid rgba(167,139,250,.15);
  text-align: center;
  position: sticky; top: 0; z-index: 2;
}
.pv2-sp-title { font-family: 'Fredoka One', cursive; font-size: 1.7rem; color: #fbbf24; }
.pv2-sp-sub { font-size: .8rem; color: rgba(167,139,250,.6); font-weight: 700; margin-bottom: 12px; }
.pv2-sp-xp-bar-wrap { height: 10px; background: rgba(167,139,250,.1); border-radius: 99px; overflow: hidden; margin: 0 8px 6px; }
.pv2-sp-xp-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #f59e0b, #fbbf24); transition: width .6s ease; }
.pv2-sp-xp-label { font-size: .72rem; color: rgba(167,139,250,.5); font-weight: 700; }
.pv2-sp-premium-badge { display: inline-block; margin: 8px auto 0; background: linear-gradient(135deg, rgba(251,191,36,.15), rgba(245,158,11,.1)); border: 1px solid rgba(251,191,36,.35); color: #fbbf24; border-radius: 20px; padding: 4px 16px; font-size: .78rem; font-weight: 900; }

.pv2-sp-track-labels {
  display: grid; grid-template-columns: 1fr 60px 1fr;
  padding: 10px 12px 6px; border-bottom: 1px solid rgba(167,139,250,.1);
  position: sticky; top: 130px; z-index: 1;
  background: rgba(13,3,37,.97);
}
.pv2-track-label-free { text-align: center; font-size: .7rem; font-weight: 900; color: rgba(167,139,250,.5); text-transform: uppercase; letter-spacing: .6px; }
.pv2-track-label-lvl  { text-align: center; font-size: .7rem; font-weight: 900; color: rgba(167,139,250,.5); text-transform: uppercase; letter-spacing: .6px; }
.pv2-track-label-prem { text-align: center; font-size: .7rem; font-weight: 900; color: rgba(251,191,36,.6); text-transform: uppercase; letter-spacing: .6px; }

.pv2-sp-rows { padding: 0 12px 20px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 400px; }
.pv2-sp-row { display: grid; grid-template-columns: 1fr 60px 1fr; align-items: center; gap: 6px; padding: 6px 0; border-bottom: 1px solid rgba(167,139,250,.06); opacity: .45; transition: opacity .2s; }
.pv2-sp-unlocked { opacity: 1; }
.pv2-sp-reward { display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
.pv2-sp-reward-icon { font-size: 1.3rem; }
.pv2-sp-reward-label { font-size: .68rem; font-weight: 700; color: rgba(180,160,220,.7); max-width: 80px; }
.pv2-sp-lock { font-size: .8rem; color: rgba(167,139,250,.3); }
.pv2-sp-no-reward { color: rgba(167,139,250,.2); font-size: .8rem; }
.pv2-sp-level-node {
  width: 36px; height: 36px; border-radius: 50%; margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  background: rgba(167,139,250,.08); border: 2px solid rgba(167,139,250,.2);
  font-family: 'Fredoka One', cursive; font-size: .85rem; color: rgba(167,139,250,.4);
  transition: all .2s; flex-shrink: 0;
}
.pv2-node-done { background: linear-gradient(135deg, #7c3aed, #a855f7); border-color: rgba(167,139,250,.6); color: #fff; box-shadow: 0 0 12px rgba(124,58,237,.5); }
.pv2-claim-btn { margin-top: 3px; background: linear-gradient(135deg, #a78bfa, #7c3aed); border: none; color: #fff; border-radius: 7px; padding: 4px 10px; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: .68rem; cursor: pointer; transition: filter .15s; }
.pv2-claim-btn:hover { filter: brightness(1.12); }
.pv2-claim-prem { background: linear-gradient(135deg, #f59e0b, #d97706); }
.pv2-claimed-tick { font-size: .9rem; color: #4ade80; font-weight: 900; margin-top: 3px; }

/* ── Skeleton ── */
.pv2-skeleton {
  background: linear-gradient(90deg, rgba(167,139,250,.08) 25%, rgba(167,139,250,.14) 50%, rgba(167,139,250,.08) 75%);
  background-size: 200% 100%;
  animation: pv2Shimmer 1.4s infinite;
}
@keyframes pv2Shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Responsive ── */
@media (max-width: 480px) {
  .pv2-sp-track-labels { top: 140px; }
  .pv2-clan-modal-header { flex-direction: column; text-align: center; }
  .pv2-member-actions { justify-content: flex-end; }
  .sp-topbar-btn { font-size: .7rem; padding: 6px 10px; }
}
  `;
  document.head.appendChild(s);
})();
