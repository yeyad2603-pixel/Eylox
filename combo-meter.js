/* ============================================================
   EYLOX — Combo Meter  (epic combo announcements in game.html)
   Hooks into the combo counter and shows dramatic announcements
   ============================================================ */
'use strict';

(function EyloxComboMeter() {

  const page = document.body?.dataset?.page || '';
  if (!page.startsWith('game')) return;

  const LEVELS = [
    { min: 5,  label: 'NICE!',      color: '#4ade80', emoji: '✨' },
    { min: 10, label: 'AWESOME!',   color: '#60a5fa', emoji: '⚡' },
    { min: 20, label: 'INCREDIBLE!',color: '#a78bfa', emoji: '🌟' },
    { min: 35, label: 'GODLIKE!',   color: '#f472b6', emoji: '👑' },
    { min: 50, label: 'LEGENDARY!', color: '#fde68a', emoji: '🏆' },
  ];

  if (!document.getElementById('combo-meter-style')) {
    const s = document.createElement('style');
    s.id = 'combo-meter-style';
    s.textContent = `
      @keyframes cm-in{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}60%{transform:translate(-50%,-50%) scale(1.08)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
      @keyframes cm-out{to{opacity:0;transform:translate(-50%,-50%) scale(1.2)}}
      .cm-announce{position:fixed;top:35%;left:50%;transform:translate(-50%,-50%);z-index:9995;pointer-events:none;text-align:center;animation:cm-in .4s cubic-bezier(.34,1.56,.64,1) both}
      .cm-emoji{font-size:2.4rem;display:block;margin-bottom:2px}
      .cm-label{font-family:'Fredoka One',cursive;font-size:clamp(1.8rem,6vw,2.8rem);letter-spacing:2px;-webkit-text-stroke:2px rgba(0,0,0,.4)}
      .cm-sub{font-family:'Nunito',sans-serif;font-size:.78rem;font-weight:800;opacity:.7;letter-spacing:1px}
    `;
    document.head.appendChild(s);
  }

  let _lastAnnounced = 0;
  let _prevCombo = 1;

  function announce(combo) {
    const tier = [...LEVELS].reverse().find(l => combo >= l.min);
    if (!tier) return;
    if (combo === _lastAnnounced) return; // don't re-announce same combo
    _lastAnnounced = combo;

    const existing = document.querySelector('.cm-announce');
    if (existing) { existing.style.animation = 'cm-out .2s ease forwards'; setTimeout(() => existing.remove(), 220); }

    const el = document.createElement('div');
    el.className = 'cm-announce';
    el.innerHTML = `<span class="cm-emoji">${tier.emoji}</span><div class="cm-label" style="color:${tier.color};text-shadow:0 0 30px ${tier.color},.0 4px 0 rgba(0,0,0,.5)">${tier.label}</div><div class="cm-sub" style="color:${tier.color}">x${combo} COMBO</div>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'cm-out .35s ease forwards';
      setTimeout(() => el.remove(), 360);
    }, 1200);
  }

  /* Watch the combo element in game.html */
  document.addEventListener('DOMContentLoaded', () => {
    const comboEl = document.getElementById('gbCombo');
    if (!comboEl) return;
    const obs = new MutationObserver(() => {
      const combo = parseInt(comboEl.textContent.replace('x', '')) || 1;
      if (combo > _prevCombo && combo > (_lastAnnounced || 0)) {
        announce(combo);
      }
      _prevCombo = combo;
    });
    obs.observe(comboEl, { childList: true, characterData: true, subtree: true });
  });

})();
