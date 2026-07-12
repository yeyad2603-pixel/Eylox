/* ============================================================
   EYLOX — Meta Universe System v1.0
   One shared universe: avatar, XP, inventory, friends all
   carry across every game and experience on the platform.
   ============================================================ */
'use strict';

(function EyloxMeta() {

  /* ── Meta profile schema ── */
  const META_KEY = 'eylox_meta';
  const DEFAULT_META = {
    metaLevel: 1,
    metaXP: 0,
    metaXPToNext: 500,
    metaCoinsEarned: 0,
    metaTrophies: 0,
    avatar: {
      base: 'wizard',        // base skin
      hat: null,
      outfit: null,
      effect: null,
      color: '#a78bfa',
      nameplate: 'default'
    },
    inventory: [],           // [{id, name, rarity, type, source, equip:bool}]
    achievements: [],        // [{id, unlocked, date}]
    gamesPlayed: {},         // {gameId: count}
    universeVisited: [],     // [worldId list]
    metaFriends: [],         // [username list — cross-game]
    title: 'New Explorer',   // unlockable title shown under username
    badges: [],              // meta badges (not per-game)
    createdAt: Date.now()
  };

  function getMeta() {
    try {
      const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
      if (!user.username) return null;
      const raw = localStorage.getItem(`${META_KEY}_${user.username}`);
      if (!raw) return { ...DEFAULT_META, username: user.username };
      return { ...DEFAULT_META, ...JSON.parse(raw), username: user.username };
    } catch { return null; }
  }

  function saveMeta(meta) {
    if (!meta?.username) return;
    localStorage.setItem(`${META_KEY}_${meta.username}`, JSON.stringify(meta));
  }

  /* ── XP + level system ── */
  function addMetaXP(amount, source) {
    const meta = getMeta();
    if (!meta) return;
    meta.metaXP += amount;
    while (meta.metaXP >= meta.metaXPToNext) {
      meta.metaXP -= meta.metaXPToNext;
      meta.metaLevel++;
      meta.metaXPToNext = Math.floor(meta.metaXPToNext * 1.35);
      _onLevelUp(meta);
    }
    saveMeta(meta);
    document.dispatchEvent(new CustomEvent('eylox:meta:xp', { detail: { amount, source, meta } }));
    _refreshWidget();
  }

  function _onLevelUp(meta) {
    /* Grant level-up rewards */
    const reward = { coins: meta.metaLevel * 25, item: null };
    const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
    user.coins = (user.coins || 0) + reward.coins;
    localStorage.setItem('eylox_user', JSON.stringify(user));
    /* Unlock title at certain levels */
    const TITLES = {
      5: 'Adventurer', 10: 'Hero', 15: 'Veteran', 20: 'Elite',
      25: 'Legend', 30: 'Champion', 40: 'Immortal', 50: 'Godlike', 100: 'Eylox God'
    };
    if (TITLES[meta.metaLevel]) meta.title = TITLES[meta.metaLevel];
    /* Show animation */
    _showLevelUpOverlay(meta.metaLevel, reward.coins);
    document.dispatchEvent(new CustomEvent('eylox:meta:levelup', { detail: { level: meta.metaLevel, meta } }));
  }

  function _showLevelUpOverlay(level, coins) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.7);backdrop-filter:blur(12px);
      animation:metaLvlIn .4s cubic-bezier(.34,1.56,.64,1) both;
    `;
    overlay.innerHTML = `
      <div style="text-align:center;color:#fff;animation:metaLvlPop .5s .1s cubic-bezier(.34,1.56,.64,1) both">
        <div style="font-size:4rem;margin-bottom:8px">✨</div>
        <div style="font-size:1rem;font-weight:900;color:#a78bfa;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px">Meta Level Up!</div>
        <div style="font-size:3.5rem;font-weight:900;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Level ${level}</div>
        <div style="font-size:.95rem;color:rgba(255,255,255,.6);margin-top:8px">+${coins} 🪙 Coins earned</div>
        <div style="margin-top:20px;font-size:.8rem;color:rgba(167,139,250,.5)">Tap anywhere to continue</div>
      </div>
    `;
    if (!document.getElementById('eylox-meta-lvlcss')) {
      const s = document.createElement('style');
      s.id = 'eylox-meta-lvlcss';
      s.textContent = `
        @keyframes metaLvlIn { from{opacity:0} to{opacity:1} }
        @keyframes metaLvlPop { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
      `;
      document.head.appendChild(s);
    }
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.remove());
    setTimeout(() => overlay.remove(), 5000);
  }

  /* ── Inventory management ── */
  const RARITY_COLORS = { common:'#9ca3af', rare:'#60a5fa', epic:'#a78bfa', legendary:'#f59e0b' };

  function addItem(item) {
    const meta = getMeta();
    if (!meta) return;
    if (!meta.inventory.find(i => i.id === item.id)) {
      meta.inventory.push({ ...item, obtained: Date.now() });
      saveMeta(meta);
      _showItemToast(item);
      document.dispatchEvent(new CustomEvent('eylox:meta:item', { detail: { item, meta } }));
    }
  }

  function equipItem(itemId) {
    const meta = getMeta();
    if (!meta) return;
    meta.inventory.forEach(i => { if (i.type === meta.inventory.find(x => x.id === itemId)?.type) i.equip = false; });
    const item = meta.inventory.find(i => i.id === itemId);
    if (item) { item.equip = true; saveMeta(meta); _refreshWidget(); }
  }

  function _showItemToast(item) {
    if (!window.EyloxToast) return;
    const color = RARITY_COLORS[item.rarity] || '#fff';
    EyloxToast(`🎁 New item: <span style="color:${color};font-weight:900">${item.name}</span> [${item.rarity || 'common'}]`, 'success', 3500);
  }

  /* ── Achievements ── */
  const ACHIEVEMENTS = [
    { id:'first_game',   name:'First Step',       desc:'Play your first game',           icon:'🎮', xp:50 },
    { id:'level5',       name:'Rising Star',       desc:'Reach Meta Level 5',             icon:'⭐', xp:150 },
    { id:'level10',      name:'Hero',              desc:'Reach Meta Level 10',            icon:'🦸', xp:300 },
    { id:'games10',      name:'Game Hopper',       desc:'Play 10 different games',        icon:'🕹️', xp:200 },
    { id:'worlds5',      name:'World Traveler',    desc:'Visit 5 worlds',                 icon:'🌍', xp:250 },
    { id:'friends5',     name:'Social Butterfly',  desc:'Have 5 meta friends',            icon:'🤝', xp:100 },
    { id:'trophy10',     name:'Eyltroph Hunter',     desc:'Earn 10 Eyltrophs',               icon:'🏆', xp:400 },
    { id:'rich',         name:'Getting Rich',      desc:'Earn 1000 meta coins total',     icon:'🪙', xp:200 },
    { id:'emote10',      name:'Expressive',        desc:'Send 10 emotes',                 icon:'😄', xp:75 },
    { id:'daily7',       name:'Dedicated',         desc:'Login 7 days in a row',          icon:'📅', xp:350 },
    { id:'squad',        name:'Team Player',       desc:'Join a squad',                   icon:'👥', xp:150 },
    { id:'create1',      name:'Creator',           desc:'Build and publish a game',       icon:'🛠️', xp:500 },
    { id:'meta50',       name:'Half Century',      desc:'Reach Meta Level 50',            icon:'💎', xp:1000 },
    { id:'meta100',      name:'Eylox Legend',      desc:'Reach Meta Level 100',           icon:'👑', xp:5000 },
  ];

  function unlockAchievement(id) {
    const meta = getMeta();
    if (!meta) return;
    if (meta.achievements.find(a => a.id === id)) return;
    const achiev = ACHIEVEMENTS.find(a => a.id === id);
    if (!achiev) return;
    meta.achievements.push({ id, date: Date.now() });
    saveMeta(meta);
    addMetaXP(achiev.xp, 'achievement');
    _showAchievementToast(achiev);
    document.dispatchEvent(new CustomEvent('eylox:meta:achievement', { detail: { achiev, meta } }));
  }

  function _showAchievementToast(achiev) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;top:80px;right:16px;z-index:99998;
      background:rgba(10,3,28,.95);border:1px solid rgba(167,139,250,.4);border-radius:14px;
      padding:12px 16px;display:flex;gap:12px;align-items:center;
      box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(167,139,250,.1);
      animation:achieveIn .4s cubic-bezier(.34,1.56,.64,1) both;
      max-width:260px;
    `;
    toast.innerHTML = `
      <div style="font-size:2rem;flex-shrink:0">${achiev.icon}</div>
      <div>
        <div style="font-size:.6rem;font-weight:900;color:#a78bfa;letter-spacing:2px;text-transform:uppercase">Achievement Unlocked!</div>
        <div style="font-size:.85rem;font-weight:800;color:#fff;margin-top:2px">${achiev.name}</div>
        <div style="font-size:.7rem;color:rgba(200,190,230,.5)">${achiev.desc} · +${achiev.xp} XP</div>
      </div>
    `;
    if (!document.getElementById('eylox-achieve-css')) {
      const s = document.createElement('style');
      s.id = 'eylox-achieve-css';
      s.textContent = `@keyframes achieveIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }`;
      document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transition = 'opacity .4s'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
  }

  /* ── Meta Widget (shown on all pages) ── */
  function _refreshWidget() {
    const meta = getMeta();
    if (!meta) return;
    const w = document.getElementById('eylox-meta-widget');
    if (!w) return;
    const pct = Math.round((meta.metaXP / meta.metaXPToNext) * 100);
    w.querySelector('.mw-level').textContent = meta.metaLevel;
    w.querySelector('.mw-title').textContent = meta.title;
    w.querySelector('.mw-bar-fill').style.width = `${pct}%`;
    w.querySelector('.mw-xp').textContent = `${meta.metaXP}/${meta.metaXPToNext} XP`;
  }

  function injectWidget() {
    if (document.getElementById('eylox-meta-widget')) return;
    const meta = getMeta();
    if (!meta) return;
    const pct = Math.round((meta.metaXP / meta.metaXPToNext) * 100);
    const w = document.createElement('div');
    w.id = 'eylox-meta-widget';
    w.style.cssText = `
      position:fixed;bottom:16px;left:16px;z-index:9995;
      background:rgba(10,3,28,.92);backdrop-filter:blur(16px);
      border:1px solid rgba(167,139,250,.2);border-radius:14px;
      padding:10px 14px;min-width:160px;cursor:pointer;
      box-shadow:0 8px 24px rgba(0,0,0,.4);
      transition:all .2s;
    `;
    w.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#60a5fa);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;color:#fff" class="mw-level">${meta.metaLevel}</div>
        <div>
          <div style="font-size:.7rem;font-weight:900;color:#e0d4ff">Meta Level</div>
          <div style="font-size:.6rem;color:rgba(167,139,250,.6)" class="mw-title">${meta.title}</div>
        </div>
      </div>
      <div style="height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-bottom:3px">
        <div class="mw-bar-fill" style="height:100%;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:99px;width:${pct}%;transition:width .4s"></div>
      </div>
      <div class="mw-xp" style="font-size:.58rem;color:rgba(167,139,250,.45);text-align:right">${meta.metaXP}/${meta.metaXPToNext} XP</div>
    `;
    w.addEventListener('click', () => openMetaProfile());
    w.addEventListener('mouseenter', () => { w.style.borderColor = 'rgba(167,139,250,.5)'; w.style.boxShadow = '0 8px 32px rgba(167,139,250,.2)'; });
    w.addEventListener('mouseleave', () => { w.style.borderColor = 'rgba(167,139,250,.2)'; w.style.boxShadow = '0 8px 24px rgba(0,0,0,.4)'; });
    document.body.appendChild(w);
  }

  /* ── Meta Profile Modal ── */
  function openMetaProfile() {
    if (document.getElementById('eylox-meta-modal')) return;
    const meta = getMeta();
    if (!meta) return;
    const pct = Math.round((meta.metaXP / meta.metaXPToNext) * 100);
    const equippedItems = meta.inventory.filter(i => i.equip);
    const unlockedAch = meta.achievements.length;
    const totalAch = ACHIEVEMENTS.length;

    const modal = document.createElement('div');
    modal.id = 'eylox-meta-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:99997;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;padding:16px;
    `;
    modal.innerHTML = `
      <div style="background:rgba(10,3,28,.98);border:1px solid rgba(167,139,250,.25);border-radius:24px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.7)">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#60a5fa);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">
            ${meta.avatar.base === 'wizard' ? '🧙' : meta.avatar.base === 'warrior' ? '⚔️' : '🤖'}
          </div>
          <div style="flex:1">
            <div style="font-size:1.2rem;font-weight:900;color:#fff">${meta.username}</div>
            <div style="font-size:.75rem;color:#a78bfa;font-weight:700">${meta.title}</div>
            <div style="font-size:.65rem;color:rgba(200,190,230,.4);margin-top:2px">Meta Level ${meta.metaLevel}</div>
          </div>
          <button onclick="document.getElementById('eylox-meta-modal').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;width:32px;height:32px;color:rgba(255,255,255,.5);cursor:pointer;font-size:1rem">×</button>
        </div>
        <!-- XP Bar -->
        <div style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;font-size:.65rem;color:rgba(167,139,250,.5);margin-bottom:4px"><span>Experience</span><span>${meta.metaXP} / ${meta.metaXPToNext} XP</span></div>
          <div style="height:8px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden">
            <div style="height:100%;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:99px;width:${pct}%;transition:width .6s"></div>
          </div>
        </div>
        <!-- Stats grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          ${[
            { icon:'🏆', label:'Eyltrophs', val: meta.metaTrophies },
            { icon:'🎮', label:'Games', val: Object.values(meta.gamesPlayed).reduce((a,b)=>a+b,0) },
            { icon:'🌍', label:'Worlds', val: meta.universeVisited.length },
            { icon:'🤝', label:'Friends', val: meta.metaFriends.length },
            { icon:'🎖️', label:'Achievements', val: `${unlockedAch}/${totalAch}` },
            { icon:'🪙', label:'Earned', val: meta.metaCoinsEarned }
          ].map(s => `
            <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.1);border-radius:12px;padding:10px;text-align:center">
              <div style="font-size:1.2rem">${s.icon}</div>
              <div style="font-size:.9rem;font-weight:900;color:#fff;margin:2px 0">${s.val}</div>
              <div style="font-size:.58rem;color:rgba(167,139,250,.45)">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <!-- Inventory -->
        <div style="margin-bottom:20px">
          <div style="font-size:.65rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🎒 Inventory (${meta.inventory.length} items)</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${meta.inventory.length ? meta.inventory.map(item => `
              <div style="background:rgba(167,139,250,.08);border:1px solid ${RARITY_COLORS[item.rarity]||'rgba(167,139,250,.2)'};border-radius:10px;padding:8px 10px;font-size:.75rem;color:#fff;cursor:pointer;${item.equip?'outline:2px solid #a78bfa':''}" title="${item.name} (${item.rarity||'common'})" onclick="EyloxMeta.equipItem('${item.id}')">
                ${item.icon||'📦'} ${item.name}${item.equip?' ✓':''}
              </div>
            `).join('') : '<span style="font-size:.75rem;color:rgba(167,139,250,.3)">No items yet — play games to earn them!</span>'}
          </div>
        </div>
        <!-- Achievements -->
        <div>
          <div style="font-size:.65rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🎖️ Achievements</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${ACHIEVEMENTS.map(a => {
              const unlocked = meta.achievements.find(x => x.id === a.id);
              return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(167,139,250,.${unlocked?'08':'03'});border:1px solid rgba(167,139,250,.${unlocked?'2':'08'});border-radius:10px;opacity:${unlocked?'1':'.45'}">
                <span style="font-size:1.2rem">${a.icon}</span>
                <div style="flex:1">
                  <div style="font-size:.78rem;font-weight:800;color:#fff">${a.name}</div>
                  <div style="font-size:.62rem;color:rgba(200,190,230,.4)">${a.desc} · +${a.xp} XP</div>
                </div>
                ${unlocked ? '<span style="font-size:.65rem;color:#a78bfa;font-weight:900">✓ Done</span>' : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  }

  /* ── Cross-game tracking ── */
  function trackGamePlayed(gameId) {
    const meta = getMeta();
    if (!meta) return;
    meta.gamesPlayed[gameId] = (meta.gamesPlayed[gameId] || 0) + 1;
    saveMeta(meta);
    addMetaXP(15, 'game_played');
    /* Check first-game achievement */
    if (Object.values(meta.gamesPlayed).reduce((a,b)=>a+b,0) === 1) unlockAchievement('first_game');
    const uniqueGames = Object.keys(meta.gamesPlayed).length;
    if (uniqueGames >= 10) unlockAchievement('games10');
  }

  function trackWorldVisited(worldId) {
    const meta = getMeta();
    if (!meta) return;
    if (!meta.universeVisited.includes(worldId)) {
      meta.universeVisited.push(worldId);
      saveMeta(meta);
      addMetaXP(30, 'world_visit');
      if (meta.universeVisited.length >= 5) unlockAchievement('worlds5');
    }
  }

  function addMetaFriend(username) {
    const meta = getMeta();
    if (!meta) return;
    if (!meta.metaFriends.includes(username)) {
      meta.metaFriends.push(username);
      saveMeta(meta);
      if (meta.metaFriends.length >= 5) unlockAchievement('friends5');
    }
  }

  /* ── Listen to platform events ── */
  document.addEventListener('eylox:levelup', () => {
    const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
    if (user.level >= 5) unlockAchievement('level5');
    if (user.level >= 10) unlockAchievement('level10');
    addMetaXP(100, 'game_levelup');
  });

  document.addEventListener('eylox:emote', () => {
    const meta = getMeta();
    if (!meta) return;
    meta._emoteCount = (meta._emoteCount || 0) + 1;
    saveMeta(meta);
    if (meta._emoteCount >= 10) unlockAchievement('emote10');
  });

  document.addEventListener('eylox:ranked:win', () => {
    addMetaXP(80, 'ranked_win');
  });

  /* ── Check level achievements on load ── */
  function checkLevelAchievements() {
    const meta = getMeta();
    if (!meta) return;
    if (meta.metaLevel >= 50) unlockAchievement('meta50');
    if (meta.metaLevel >= 100) unlockAchievement('meta100');
    /* Daily login streak from main user data */
    const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
    if ((user.loginStreak || 0) >= 7) unlockAchievement('daily7');
    if ((user.Eyltrophs || 0) >= 10) unlockAchievement('trophy10');
    if (meta.metaCoinsEarned >= 1000) unlockAchievement('rich');
  }

  /* ── Init ── */
  function init() {
    const meta = getMeta();
    if (!meta) return;
    /* Ensure meta exists in storage */
    if (!localStorage.getItem(`${META_KEY}_${meta.username}`)) saveMeta(meta);
    injectWidget();
    checkLevelAchievements();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ── Public API ── */
  window.EyloxMeta = {
    addXP: addMetaXP,
    addItem,
    equipItem,
    unlockAchievement,
    trackGame: trackGamePlayed,
    trackWorld: trackWorldVisited,
    addFriend: addMetaFriend,
    openProfile: openMetaProfile,
    getMeta,
    ACHIEVEMENTS
  };

})();
