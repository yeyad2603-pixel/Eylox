/* ============================================================
   EYLOX — Quick Challenge  (rapid mini-challenges for bonus Eylux)
   Injects a floating "Quick Challenge" button that pops up a
   timed mini-challenge once per session.
   ============================================================ */
'use strict';

(function EyloxQuickChallenge() {

  const SESSION_KEY = 'eylox_qc_done';
  if (sessionStorage.getItem(SESSION_KEY)) return; // already done this session

  const page = document.body?.dataset?.page || '';
  if (['login', 'landing', 'game'].some(p => page.startsWith(p))) return;

  const CHALLENGES = [
    {
      id: 'type-speed',
      title: 'Speed Typer ⌨️',
      desc: 'Type this word as fast as you can!',
      reward: 75,
      build(container, onPass, onFail) {
        const words = ['EYLOX', 'ARCADE', 'GAMING', 'LEGEND', 'WINNER', 'PIXEL', 'QUEST', 'BLAZE'];
        const word  = words[Math.floor(Math.random() * words.length)];
        const input = document.createElement('input');
        input.type  = 'text';
        input.autocomplete = 'off';
        input.placeholder = 'Type the word above…';
        input.style.cssText = 'background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.3);color:#f0e8ff;padding:10px 16px;border-radius:10px;font-size:1.1rem;font-family:Nunito,sans-serif;font-weight:800;text-align:center;width:100%;outline:none;letter-spacing:2px';
        container.innerHTML = `<div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#a78bfa;text-align:center;margin-bottom:10px;letter-spacing:4px">${word}</div>`;
        container.appendChild(input);
        setTimeout(() => input.focus(), 100);
        let startT = Date.now();
        input.addEventListener('input', () => {
          if (input.value.toUpperCase() === word) {
            const elapsed = Date.now() - startT;
            onPass(elapsed < 3000 ? 150 : 75); // bonus if typed in <3s
          }
        });
      },
    },
    {
      id: 'reaction',
      title: 'Reaction Test ⚡',
      desc: 'Tap the circle the instant it turns green!',
      reward: 80,
      build(container, onPass, onFail) {
        const delay = 1500 + Math.random() * 2500;
        let gone    = false;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:14px">
          <div id="react-circle" style="width:80px;height:80px;border-radius:50%;background:rgba(239,68,68,.8);cursor:pointer;transition:background .1s;box-shadow:0 4px 24px rgba(239,68,68,.5)"></div>
          <div id="react-msg" style="font-size:.82rem;font-weight:800;color:rgba(157,142,199,.7)">Wait for green…</div>
        </div>`;
        const circle = container.querySelector('#react-circle');
        const msg    = container.querySelector('#react-msg');
        const tooEarly = () => {
          if (gone) return;
          gone = true;
          msg.textContent = 'Too early! 😅';
          msg.style.color = '#f87171';
          setTimeout(() => onFail(), 900);
        };
        circle.addEventListener('pointerdown', tooEarly);
        setTimeout(() => {
          if (gone) return;
          circle.removeEventListener('pointerdown', tooEarly);
          circle.style.background = 'rgba(74,222,128,.9)';
          circle.style.boxShadow  = '0 4px 24px rgba(74,222,128,.5)';
          msg.textContent         = 'NOW! TAP!';
          msg.style.color         = '#4ade80';
          const t0 = performance.now();
          circle.addEventListener('pointerdown', () => {
            if (gone) return;
            gone = true;
            const rt = Math.floor(performance.now() - t0);
            const bonus = rt < 250 ? 150 : rt < 500 ? 100 : 60;
            onPass(bonus, `${rt}ms reaction time!`);
          }, { once: true });
          // Timeout after 3s
          setTimeout(() => { if (!gone) { gone = true; onFail(); } }, 3000);
        }, delay);
      },
    },
    {
      id: 'memory',
      title: 'Memory Flash 🧠',
      desc: 'Memorize the 4-digit number!',
      reward: 90,
      build(container, onPass, onFail) {
        const code   = String(Math.floor(1000 + Math.random() * 9000));
        let phase    = 'show';
        let gone     = false;

        container.innerHTML = `
          <div style="text-align:center">
            <div id="mem-code" style="font-family:'Fredoka One',cursive;font-size:3rem;color:#fde68a;letter-spacing:8px;margin-bottom:8px">${code}</div>
            <div id="mem-msg" style="font-size:.82rem;font-weight:800;color:rgba(157,142,199,.7)">Memorize it! Hiding in <span id="mem-count">3</span>…</div>
            <input id="mem-input" type="text" inputmode="numeric" maxlength="4" placeholder="Enter the number" disabled
              style="margin-top:14px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.3);color:#f0e8ff;padding:10px 16px;border-radius:10px;font-size:1.4rem;font-family:'Fredoka One',cursive;text-align:center;width:100%;outline:none;display:none;letter-spacing:6px"/>
          </div>`;

        const el    = container.querySelector('#mem-code');
        const msg   = container.querySelector('#mem-msg');
        const input = container.querySelector('#mem-input');
        const cnt   = container.querySelector('#mem-count');

        let t = 3;
        const countdown = setInterval(() => {
          t--;
          if (t > 0) { cnt.textContent = t; }
          else {
            clearInterval(countdown);
            el.style.filter = 'blur(12px)';
            msg.textContent = 'What was the number?';
            input.style.display = '';
            input.disabled = false;
            setTimeout(() => input.focus(), 100);
          }
        }, 1000);

        input.addEventListener('input', () => {
          if (gone || input.value.length < 4) return;
          gone = true;
          if (input.value === code) onPass(90);
          else {
            el.style.filter = '';
            msg.innerHTML = `<span style="color:#f87171">Wrong! It was ${code}</span>`;
            setTimeout(() => onFail(), 1200);
          }
        });
      },
    },
  ];

  /* ── Styles ── */
  function ensureStyles() {
    if (document.getElementById('qc-style')) return;
    const s = document.createElement('style');
    s.id = 'qc-style';
    s.textContent = `
      @keyframes qc-in{from{opacity:0;transform:translate(-50%,-50%) scale(.6)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
      @keyframes qc-out{to{opacity:0;transform:translate(-50%,-50%) scale(.6)}}
      @keyframes qc-timer{from{width:100%}to{width:0%}}
      #qc-fab{position:fixed;bottom:110px;right:80px;z-index:9994;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#fde68a);color:#1a0800;font-size:1.3rem;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(245,158,11,.5);transition:transform .18s,box-shadow .18s;animation:qc-pulse 2s ease-in-out infinite}
      #qc-fab:hover{transform:scale(1.12);box-shadow:0 8px 32px rgba(245,158,11,.7)}
      @keyframes qc-pulse{0%,100%{box-shadow:0 4px 20px rgba(245,158,11,.5)}50%{box-shadow:0 4px 32px rgba(245,158,11,.9)}}
      #qc-modal{position:fixed;top:50%;left:50%;z-index:99998;width:min(380px,90vw);background:linear-gradient(160deg,#1c0b42,#0f0428);border:1px solid rgba(167,139,250,.3);border-radius:22px;padding:24px;box-shadow:0 40px 100px rgba(0,0,0,.8);animation:qc-in .4s cubic-bezier(.34,1.56,.64,1) both}
      .qc-timer-bar{height:4px;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:2px;animation:qc-timer 15s linear forwards}
    `;
    document.head.appendChild(s);
  }

  /* ── Show modal ── */
  function openChallenge() {
    ensureStyles();
    if (document.getElementById('qc-modal')) return;

    const ch = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

    const modal = document.createElement('div');
    modal.id = 'qc-modal';
    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:.65rem;font-weight:900;color:#a78bfa;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px">⚡ Quick Challenge</div>
          <div style="font-family:'Fredoka One',cursive;font-size:1.25rem;color:#f0e8ff">${ch.title}</div>
        </div>
        <button id="qc-close" style="background:none;border:none;color:rgba(157,142,199,.5);font-size:1.1rem;cursor:pointer;transition:color .15s" onmouseover="this.style.color='#f0e8ff'" onmouseout="this.style.color='rgba(157,142,199,.5)'">✕</button>
      </div>
      <div class="qc-timer-bar" id="qc-timer"></div>
      <p style="font-size:.82rem;font-weight:700;color:rgba(157,142,199,.7);margin:10px 0 14px">${ch.desc}</p>
      <div id="qc-body"></div>
      <div id="qc-reward" style="margin-top:14px;font-size:.78rem;font-weight:800;color:rgba(157,142,199,.5);text-align:center">Reward: up to +${ch.reward} 🪙</div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#qc-close');
    const timeoutId = setTimeout(() => closeModal(false), 15000); // 15s time limit

    function closeModal(won, coins, note) {
      clearTimeout(timeoutId);
      if (won) {
        sessionStorage.setItem(SESSION_KEY, '1');
        try {
          const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
          if (u) {
            u.coins = Math.min((u.coins || 0) + coins, 1e9);
            localStorage.setItem('eylox_user', JSON.stringify(u));
            if (u.username) localStorage.setItem('eylox_userdata_' + u.username, JSON.stringify(u));
          }
        } catch {}
        window.EyloxToast?.(`⚡ Challenge won! +${coins} 🪙${note ? ' · ' + note : ''}`, 'success', 3000);
        window.EyloxCoinBurst?.(coins);
        fab.remove();
      }
      modal.style.animation = 'qc-out .3s ease forwards';
      setTimeout(() => { modal.remove(); if (!won) sessionStorage.setItem(SESSION_KEY, '1'); }, 320);
    }

    closeBtn.addEventListener('click', () => closeModal(false));

    ch.build(
      modal.querySelector('#qc-body'),
      (coins, note) => closeModal(true, coins, note),
      ()           => closeModal(false),
    );
  }

  /* ── FAB button ── */
  ensureStyles();
  const fab = document.createElement('button');
  fab.id    = 'qc-fab';
  fab.title = 'Quick Challenge — win bonus Eylux!';
  fab.textContent = '⚡';
  document.body.appendChild(fab);
  fab.addEventListener('click', openChallenge);

  // Auto-open after 45s if user hasn't dismissed
  let autoShown = false;
  setTimeout(() => {
    if (!autoShown && !sessionStorage.getItem(SESSION_KEY)) {
      autoShown = true;
      openChallenge();
    }
  }, 45000);

})();
