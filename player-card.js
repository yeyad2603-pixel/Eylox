/* ============================================================
   EYLOX — Player Card  (shareable profile card overlay)
   Adds "View Card" button on profile.html and friend cards
   ============================================================ */
'use strict';

(function EyloxPlayerCard() {

  function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function formatCoins(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n || 0);
  }

  function getLevel(coins) { return Math.floor((coins || 0) / 500) + 1; }

  function getRank(level) {
    if (level >= 50) return { label: 'Legendary 👑', color: '#fbbf24' };
    if (level >= 30) return { label: 'Diamond 💎', color: '#60a5fa' };
    if (level >= 20) return { label: 'Platinum ⚡', color: '#c084fc' };
    if (level >= 10) return { label: 'Gold 🏅', color: '#f59e0b' };
    if (level >= 5)  return { label: 'Silver 🥈', color: '#9d8ec7' };
    return { label: 'Bronze 🥉', color: '#b45309' };
  }

  function buildCardHTML(u, friends) {
    const level = getLevel(u.coins);
    const rank  = getRank(level);
    const xp    = (u.coins || 0) % 500;
    const pct   = Math.round(xp / 500 * 100);

    // Best game from high scores
    const GAME_LIST = [
      { id:'ninja-dash', title:'Ninja Dash' }, { id:'sky-riders', title:'Sky Riders' },
      { id:'dragon-escape', title:'Dragon Escape' }, { id:'space-blaster', title:'Space Blaster' },
      { id:'ocean-quest', title:'Ocean Quest' }, { id:'race-city', title:'Race City' },
    ];
    let bestGame = null, bestHS = 0;
    GAME_LIST.forEach(g => {
      const hs = +(localStorage.getItem('eylox_hs_' + g.id) || 0);
      if (hs > bestHS) { bestHS = hs; bestGame = g; }
    });

    return `
      <div id="pc-card" style="
        background:linear-gradient(160deg,#1c0b42,#0f0428);
        border:1px solid rgba(167,139,250,.35);border-radius:24px;
        padding:28px 24px;width:280px;position:relative;overflow:hidden;
        box-shadow:0 0 60px rgba(167,139,250,.25);
        font-family:'Nunito',sans-serif;
      ">
        <!-- Background shimmer -->
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(167,139,250,.06),transparent,rgba(96,165,250,.06));pointer-events:none"></div>

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:2rem;border:3px solid rgba(167,139,250,.5);box-shadow:0 0 20px rgba(167,139,250,.4)">
            ${esc(u.avatar || '🎮')}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Fredoka One',cursive;font-size:1.15rem;color:#f0e8ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.username || 'Player')}</div>
            <div style="font-size:.7rem;color:rgba(157,142,199,.6);font-weight:700;margin-top:1px">@${esc((u.username||'player').toLowerCase().replace(/\s+/g,'_'))}_eylox</div>
            <div style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.2);border-radius:99px;padding:2px 8px">
              <span style="font-size:.65rem;font-weight:900;color:${rank.color}">${rank.label}</span>
            </div>
          </div>
        </div>

        <!-- Level bar -->
        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;font-size:.68rem;font-weight:800;color:rgba(157,142,199,.6);margin-bottom:4px">
            <span>Level ${level}</span><span>${xp} / 500 XP</span>
          </div>
          <div style="height:6px;background:rgba(167,139,250,.12);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .6s ease"></div>
          </div>
        </div>

        <!-- Stats grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
          <div style="background:rgba(167,139,250,.08);border-radius:12px;padding:8px 6px;text-align:center">
            <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#fde68a">${formatCoins(u.coins)}</div>
            <div style="font-size:.6rem;font-weight:800;color:rgba(157,142,199,.55)">🪙 Coins</div>
          </div>
          <div style="background:rgba(167,139,250,.08);border-radius:12px;padding:8px 6px;text-align:center">
            <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#60a5fa">${Number(u.wins)||0}</div>
            <div style="font-size:.6rem;font-weight:800;color:rgba(157,142,199,.55)">🏆 Wins</div>
          </div>
          <div style="background:rgba(167,139,250,.08);border-radius:12px;padding:8px 6px;text-align:center">
            <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#4ade80">${friends}</div>
            <div style="font-size:.6rem;font-weight:800;color:rgba(157,142,199,.55)">🤝 Friends</div>
          </div>
        </div>

        ${bestGame ? `
        <!-- Best game -->
        <div style="background:rgba(167,139,250,.08);border-radius:12px;padding:8px 12px;margin-bottom:14px;display:flex;align-items:center;gap:8px">
          <span style="font-size:.65rem;font-weight:900;color:rgba(157,142,199,.5);text-transform:uppercase;letter-spacing:.8px">🎮 Best Game</span>
          <span style="flex:1;font-size:.78rem;font-weight:800;color:#f0e8ff;text-align:right">${bestGame.title}</span>
          <span style="font-family:'Fredoka One',cursive;font-size:.85rem;color:#fde68a">${bestHS.toLocaleString()}</span>
        </div>` : ''}

        <!-- Footer -->
        <div style="display:flex;gap:8px">
          <button onclick="window.EyloxPlayerCard.copyCard()" style="flex:1;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:#a78bfa;padding:8px;border-radius:10px;font-family:Nunito,sans-serif;font-weight:800;font-size:.75rem;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(167,139,250,.2)'" onmouseout="this.style.background='rgba(167,139,250,.1)'">📋 Copy</button>
          <button onclick="window.EyloxPlayerCard.close()" style="flex:1;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:#a78bfa;padding:8px;border-radius:10px;font-family:Nunito,sans-serif;font-weight:800;font-size:.75rem;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(167,139,250,.2)'" onmouseout="this.style.background='rgba(167,139,250,.1)'">Close</button>
        </div>

        <!-- Eylox badge -->
        <div style="text-align:center;margin-top:10px;font-size:.62rem;font-weight:800;color:rgba(157,142,199,.3)">🎮 Eylox Gaming Platform</div>
      </div>
    `;
  }

  function openCard() {
    if (document.getElementById('pc-overlay')) return;

    const u       = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
    const friends = (() => { try { return JSON.parse(localStorage.getItem('eylox_friends') || '[]').length; } catch { return 0; } })();
    if (!u) return;

    if (!document.getElementById('pc-style')) {
      const s = document.createElement('style');
      s.id = 'pc-style';
      s.textContent = `
        @keyframes pc-in{from{opacity:0;transform:translate(-50%,-50%) scale(.7)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes pc-out{to{opacity:0;transform:translate(-50%,-50%) scale(.7)}}
        #pc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);z-index:99997;display:flex;align-items:center;justify-content:center}
        #pc-inner{animation:pc-in .4s cubic-bezier(.34,1.56,.64,1) both}
      `;
      document.head.appendChild(s);
    }

    const ov = document.createElement('div');
    ov.id = 'pc-overlay';
    ov.innerHTML = `<div id="pc-inner">${buildCardHTML(u, friends)}</div>`;
    ov.addEventListener('click', e => { if (e.target === ov) window.EyloxPlayerCard.close(); });
    document.body.appendChild(ov);
  }

  function closeCard() {
    const ov = document.getElementById('pc-overlay');
    if (!ov) return;
    const inner = ov.querySelector('#pc-inner');
    if (inner) { inner.style.animation = 'pc-out .3s ease forwards'; setTimeout(() => ov.remove(), 320); }
    else ov.remove();
  }

  function copyCard() {
    const u = (() => { try { return JSON.parse(localStorage.getItem('eylox_user') || 'null'); } catch { return null; } })();
    if (!u) return;
    const level = Math.floor((u.coins || 0) / 500) + 1;
    const text  = `🎮 ${u.username || 'Player'} | Level ${level} | 🪙 ${(u.coins || 0).toLocaleString()} | 🏆 ${u.wins || 0} wins — Eylox Gaming`;
    navigator.clipboard?.writeText?.(text).then(() => {
      window.EyloxToast?.('Card copied to clipboard! 📋', 'info', 2200);
    });
  }

  /* ── Add "My Card" button on profile ── */
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (page !== 'profile') return;

    const heroInfo = document.querySelector('.ph-info');
    if (!heroInfo) return;

    const btn = document.createElement('button');
    btn.style.cssText = 'margin-top:8px;background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.25);color:#a78bfa;padding:6px 16px;border-radius:99px;font-family:Nunito,sans-serif;font-weight:800;font-size:.75rem;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:5px';
    btn.innerHTML = '🪪 View My Card';
    btn.onmouseover = () => { btn.style.background = 'rgba(167,139,250,.22)'; };
    btn.onmouseout  = () => { btn.style.background = 'rgba(167,139,250,.12)'; };
    btn.addEventListener('click', openCard);
    heroInfo.appendChild(btn);
  });

  window.EyloxPlayerCard = { open: openCard, close: closeCard, copyCard };

})();
