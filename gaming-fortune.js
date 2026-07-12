/* ============================================================
   EYLOX — gaming-fortune.js
   Daily gaming fortune card + lucky number widget
   ============================================================ */
'use strict';

(function EyloxFortune() {

  const FORTUNES = [
    { text: "Today's quest rewards will be legendary. Grind hard!", luck: 9, sign: '⚔️' },
    { text: "A fellow gamer will surprise you with unexpected skill.", luck: 7, sign: '🎯' },
    { text: "The next game you play will be your best run yet.", luck: 8, sign: '🚀' },
    { text: "Patience is your power — big wins come to those who wait.", luck: 6, sign: '🧘' },
    { text: "Your reflexes are sharper than usual today. Trust them.", luck: 8, sign: '⚡' },
    { text: "A hidden bonus is waiting in the place you least expect.", luck: 9, sign: '🔮' },
    { text: "Your strategy will be flawless. Enemies will rage-quit.", luck: 7, sign: '🧠' },
    { text: "Coins flow to you like water downhill. Check your rewards!", luck: 10, sign: '💰' },
    { text: "An old friend may challenge you to a duel — accept it.", luck: 6, sign: '🤝' },
    { text: "The leaderboard shakes in fear of today's version of you.", luck: 9, sign: '🏆' },
    { text: "Fortune favors the bold. Take risks in every match today.", luck: 7, sign: '🎲' },
    { text: "Your creativity in-game will unlock paths unseen.", luck: 8, sign: '🌈' },
    { text: "Beware lag — your skills are real, the connection is not.", luck: 5, sign: '📡' },
    { text: "Today is a good day to revisit a classic. Nostalgia wins.", luck: 7, sign: '🕹️' },
    { text: "Power-ups align in your favor. Press your advantage!", luck: 9, sign: '🔋' },
    { text: "A rival is leveling up. Don't sleep — they're catching up.", luck: 6, sign: '👁️' },
    { text: "Speed is not enough — precision is your hidden weapon.", luck: 8, sign: '🎯' },
    { text: "You will discover a shortcut others have missed entirely.", luck: 8, sign: '🗺️' },
    { text: "The dice roll in your favor — gamble on the long shot.", luck: 10, sign: '🎰' },
    { text: "Teamwork makes the dream work. Reach out to a friend.", luck: 7, sign: '💫' },
    { text: "Slow down and observe. The boss pattern will reveal itself.", luck: 6, sign: '🔍' },
    { text: "Today's grind plants seeds for tomorrow's glory.", luck: 5, sign: '🌱' },
    { text: "An unexpected event will turn the tide in your favor.", luck: 9, sign: '🌀' },
    { text: "Your instincts are 87% reliable today. Trust your gut.", luck: 8, sign: '🧬' },
    { text: "Legendary gear is closer than you think. Keep hunting!", luck: 9, sign: '🗡️' },
    { text: "The cosmos aligns with your controller today.", luck: 10, sign: '🌌' },
    { text: "A comeback is brewing. Don't surrender — fight back!", luck: 7, sign: '🔥' },
    { text: "Your opponents underestimate you. Use it.", luck: 8, sign: '😏' },
    { text: "New friendships formed today will be long-lasting alliances.", luck: 6, sign: '🌟' },
    { text: "Rest is part of the game. Even legends recharge.", luck: 4, sign: '💤' },
  ];

  const LUCKY_NUMBERS = [7, 13, 21, 42, 88, 99, 3, 17, 77, 5, 11, 33, 64, 256];

  function getDayIndex() {
    const now = new Date();
    const epoch = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      const seed = u ? u.username.split('').reduce((s,c,i)=>s+c.charCodeAt(0)*(i+1),0) : 0;
      return (epoch + seed) % FORTUNES.length;
    } catch {
      return epoch % FORTUNES.length;
    }
  }

  function getLuckyNumber() {
    const epoch = Math.floor(Date.now() / 86400000);
    return LUCKY_NUMBERS[epoch % LUCKY_NUMBERS.length];
  }

  function getLuckColor(luck) {
    if (luck >= 9)  return { bar:'#fbbf24', text:'#fde68a', label:'⚡ Exceptional' };
    if (luck >= 7)  return { bar:'#a78bfa', text:'#c4b5fd', label:'🌟 Good Luck' };
    if (luck >= 5)  return { bar:'#60a5fa', text:'#93c5fd', label:'✨ Moderate' };
    return              { bar:'#94a3b8', text:'#cbd5e1', label:'🌙 Rest Day' };
  }

  function alreadyClaimed() {
    const today = new Date().toISOString().slice(0,10);
    try {
      const f = JSON.parse(localStorage.getItem('eylox_fortune') || '{}');
      return f.date === today;
    } catch { return false; }
  }

  function claimFortune(reward) {
    const today = new Date().toISOString().slice(0,10);
    localStorage.setItem('eylox_fortune', JSON.stringify({ date: today, claimed: true }));
    if (typeof EyloxData !== 'undefined') EyloxData.addCoins(reward);
    window.EyloxAchievement?.check();
  }

  /* Inject CSS */
  if (!document.getElementById('fortune-style')) {
    const s = document.createElement('style');
    s.id = 'fortune-style';
    s.textContent = `
      #fortune-widget {
        position:fixed;top:80px;left:18px;z-index:9970;
        width:52px;height:52px;border-radius:16px;
        background:linear-gradient(135deg,#7c3aed,#a855f7);
        border:1px solid rgba(167,139,250,.35);
        box-shadow:0 4px 20px rgba(124,58,237,.45);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:1.5rem;transition:transform .2s,box-shadow .2s;
        animation:fortune-pulse 3s ease-in-out infinite;
      }
      #fortune-widget:hover { transform:scale(1.12); box-shadow:0 6px 28px rgba(124,58,237,.6); }
      @keyframes fortune-pulse {
        0%,100% { box-shadow:0 4px 20px rgba(124,58,237,.45); }
        50%      { box-shadow:0 4px 30px rgba(167,139,250,.65); }
      }
      #fortune-widget[data-claimed="true"] { filter:saturate(.4); animation:none; }

      #fortune-panel {
        position:fixed;top:140px;left:18px;z-index:9971;
        width:290px;
        background:rgba(17,3,48,.97);border-radius:20px;
        border:1px solid rgba(167,139,250,.25);
        box-shadow:0 12px 50px rgba(0,0,0,.7);
        padding:0 0 16px;overflow:hidden;
        animation:fortune-slide-in .35s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes fortune-slide-in {
        from { opacity:0; transform:translateY(20px) scale(.92); }
        to   { opacity:1; transform:none; }
      }
      #fortune-panel.hiding {
        animation:fortune-slide-out .25s ease forwards;
      }
      @keyframes fortune-slide-out {
        to { opacity:0; transform:translateY(16px) scale(.9); }
      }
      .fp-header {
        background:linear-gradient(135deg,rgba(124,58,237,.4),rgba(168,85,247,.2));
        padding:14px 16px 12px;
        border-bottom:1px solid rgba(167,139,250,.15);
        display:flex;align-items:center;justify-content:space-between;
      }
      .fp-header-title {
        font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff;
        display:flex;align-items:center;gap:7px;
      }
      .fp-date { font-size:.65rem;color:rgba(157,142,199,.6);font-weight:600; }
      .fp-sign {
        font-size:2.4rem;text-align:center;
        padding:16px 0 8px;
        filter:drop-shadow(0 0 10px rgba(167,139,250,.5));
      }
      .fp-text {
        font-size:.8rem;color:#d8c8ff;line-height:1.55;
        text-align:center;padding:0 18px 14px;font-style:italic;
      }
      .fp-luck-row {
        display:flex;align-items:center;gap:10px;padding:0 16px 12px;
      }
      .fp-luck-label { font-size:.68rem;font-weight:700;color:rgba(157,142,199,.7);white-space:nowrap; }
      .fp-luck-bar { flex:1;height:5px;border-radius:99px;background:rgba(167,139,250,.12);overflow:hidden; }
      .fp-luck-fill { height:100%;border-radius:99px;transition:width .8s ease .2s; }
      .fp-luck-tag { font-size:.64rem;font-weight:800;white-space:nowrap; }
      .fp-lucky-num {
        margin:0 16px 12px;text-align:center;
        background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.15);
        border-radius:12px;padding:8px;
      }
      .fp-lucky-num-label { font-size:.62rem;color:rgba(157,142,199,.6);font-weight:700;text-transform:uppercase;letter-spacing:.08em; }
      .fp-lucky-num-val {
        font-family:'Fredoka One',cursive;font-size:2rem;color:#a78bfa;
        line-height:1.1;
      }
      .fp-claim-btn {
        display:block;margin:0 16px;padding:9px 0;
        background:linear-gradient(135deg,#7c3aed,#a855f7);
        border:none;border-radius:12px;color:#fff;
        font-family:'Fredoka One',cursive;font-size:.92rem;
        cursor:pointer;width:calc(100% - 32px);
        transition:opacity .2s,transform .2s;
      }
      .fp-claim-btn:hover { opacity:.88; transform:translateY(-1px); }
      .fp-claim-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
      .fp-claimed-msg {
        text-align:center;font-size:.72rem;color:rgba(167,139,250,.6);
        font-weight:700;padding:0 16px;
      }
    `;
    document.head.appendChild(s);
  }

  let panelOpen = false;

  function openPanel() {
    if (document.getElementById('fortune-panel')) return;
    const fortune = FORTUNES[getDayIndex()];
    const lc = getLuckColor(fortune.luck);
    const claimed = alreadyClaimed();
    const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
    const reward = Math.round(fortune.luck * 15 + Math.random() * 30);

    const panel = document.createElement('div');
    panel.id = 'fortune-panel';
    panel.innerHTML = `
      <div class="fp-header">
        <div class="fp-header-title">🔮 Daily Fortune</div>
        <div class="fp-date">${today}</div>
      </div>
      <div class="fp-sign">${fortune.sign}</div>
      <p class="fp-text">"${fortune.text}"</p>
      <div class="fp-luck-row">
        <span class="fp-luck-label">Luck</span>
        <div class="fp-luck-bar"><div class="fp-luck-fill" style="width:0%;background:${lc.bar}"></div></div>
        <span class="fp-luck-tag" style="color:${lc.text}">${lc.label}</span>
      </div>
      <div class="fp-lucky-num">
        <div class="fp-lucky-num-label">Lucky Number Today</div>
        <div class="fp-lucky-num-val">${getLuckyNumber()}</div>
      </div>
      ${claimed
        ? `<div class="fp-claimed-msg">✅ Fortune claimed for today. See you tomorrow!</div>`
        : `<button class="fp-claim-btn" id="fp-claim-btn">Claim +${reward} Eylux 🪙</button>`}
    `;
    document.body.appendChild(panel);
    panelOpen = true;

    /* Animate luck bar after paint */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fill = panel.querySelector('.fp-luck-fill');
        if (fill) fill.style.width = (fortune.luck * 10) + '%';
      });
    });

    const btn = panel.querySelector('#fp-claim-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        claimFortune(reward);
        btn.disabled = true;
        btn.textContent = '✅ Claimed!';
        setTimeout(() => {
          btn.replaceWith(Object.assign(document.createElement('div'), {
            className: 'fp-claimed-msg',
            textContent: '✅ Fortune claimed for today. See you tomorrow!'
          }));
        }, 1200);
        document.getElementById('fortune-widget')?.setAttribute('data-claimed', 'true');
        window.EyloxToast?.(`+${reward} Eylux from your daily fortune!`, 'Eylux', 3000);
        window.EyloxSFX?.reward?.();
      });
    }
  }

  function closePanel() {
    const panel = document.getElementById('fortune-panel');
    if (!panel) return;
    panel.classList.add('hiding');
    setTimeout(() => { panel.remove(); panelOpen = false; }, 270);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('div');
    btn.id = 'fortune-widget';
    btn.title = 'Daily Fortune';
    btn.textContent = '🔮';
    if (alreadyClaimed()) btn.setAttribute('data-claimed', 'true');
    document.body.appendChild(btn);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (panelOpen) closePanel(); else openPanel();
    });

    document.addEventListener('click', e => {
      if (panelOpen && !e.target.closest('#fortune-panel') && !e.target.closest('#fortune-widget')) {
        closePanel();
      }
    });
  });

})();
