/* ============================================================
   EYLOX — Avatar Visual Effects System
   Applies CSS animations to avatars based on equipped effects
   ============================================================ */
'use strict';

(function EyloxEffects() {

  const EFFECT_STYLES = {
    'ef-sparkle': `
      .avatar-fx { animation: fx-sparkle 1.8s ease-in-out infinite !important; }
      @keyframes fx-sparkle {
        0%,100% { filter: drop-shadow(0 0 6px #fde68a) drop-shadow(0 0 12px #f59e0b); }
        50%     { filter: drop-shadow(0 0 18px #fef9c3) drop-shadow(0 0 34px #fbbf24) drop-shadow(0 0 52px #f59e0b88); }
      }`,
    'ef-blossom': `
      .avatar-fx { animation: fx-blossom 2s ease-in-out infinite !important; }
      @keyframes fx-blossom {
        0%,100% { filter: drop-shadow(0 0 6px #f9a8d4) drop-shadow(0 0 12px #ec4899); }
        50%     { filter: drop-shadow(0 0 18px #fce7f3) drop-shadow(0 0 34px #f472b6) drop-shadow(0 0 52px #db277788); }
      }`,
    'ef-wave': `
      .avatar-fx { animation: fx-wave 2s ease-in-out infinite !important; }
      @keyframes fx-wave {
        0%,100% { filter: drop-shadow(0 0 6px #60a5fa) drop-shadow(0 0 12px #3b82f6); }
        50%     { filter: drop-shadow(0 0 18px #bfdbfe) drop-shadow(0 0 34px #60a5fa) drop-shadow(0 0 52px #2563eb88); }
      }`,
    'ef-frost': `
      .avatar-fx { animation: fx-frost 2.2s ease-in-out infinite !important; }
      @keyframes fx-frost {
        0%,100% { filter: drop-shadow(0 0 6px #bae6fd) drop-shadow(0 0 12px #7dd3fc) brightness(1); }
        50%     { filter: drop-shadow(0 0 20px #e0f2fe) drop-shadow(0 0 38px #38bdf8) drop-shadow(0 0 56px #0ea5e988) brightness(1.18); }
      }`,
    'ef-toxic': `
      .avatar-fx { animation: fx-toxic 1.6s ease-in-out infinite !important; }
      @keyframes fx-toxic {
        0%,100% { filter: drop-shadow(0 0 6px #4ade80) drop-shadow(0 0 12px #22c55e); }
        50%     { filter: drop-shadow(0 0 18px #bbf7d0) drop-shadow(0 0 34px #86efac) drop-shadow(0 0 52px #16a34a88); }
      }`,
    'ef-electric': `
      .avatar-fx { animation: fx-electric 0.9s ease-in-out infinite !important; }
      @keyframes fx-electric {
        0%,100% { filter: drop-shadow(0 0 4px #c4b5fd) drop-shadow(0 0 8px #8b5cf6); }
        33%     { filter: drop-shadow(0 0 22px #ede9fe) drop-shadow(0 0 42px #a78bfa) drop-shadow(0 0 62px #7c3aed88); }
        66%     { filter: drop-shadow(0 0 8px #ddd6fe) drop-shadow(0 0 18px #7c3aed); }
      }`,
    'ef-fireworks': `
      .avatar-fx { animation: fx-fireworks 1.4s ease-in-out infinite !important; }
      @keyframes fx-fireworks {
        0%   { filter: drop-shadow(0 0 8px #f87171) drop-shadow(0 0 16px #ef4444); }
        25%  { filter: drop-shadow(0 0 14px #fbbf24) drop-shadow(0 0 28px #f59e0b); }
        50%  { filter: drop-shadow(0 0 14px #34d399) drop-shadow(0 0 28px #10b981); }
        75%  { filter: drop-shadow(0 0 14px #60a5fa) drop-shadow(0 0 28px #3b82f6); }
        100% { filter: drop-shadow(0 0 8px #f87171) drop-shadow(0 0 16px #ef4444); }
      }`,
    'ef-rainbow': `
      .avatar-fx { animation: fx-rainbow 2.5s linear infinite !important; }
      @keyframes fx-rainbow {
        0%   { filter: drop-shadow(0 0 12px #f87171) hue-rotate(0deg); }
        100% { filter: drop-shadow(0 0 12px #f87171) hue-rotate(360deg); }
      }`,
  };

  function applyAvatarEffect(effectId) {
    document.getElementById('avatarEffectStyle')?.remove();
    document.querySelectorAll('.avatar-fx').forEach(el => el.classList.remove('avatar-fx'));
    if (!effectId || !EFFECT_STYLES[effectId]) return;

    const style = document.createElement('style');
    style.id = 'avatarEffectStyle';
    style.textContent = EFFECT_STYLES[effectId];
    document.head.appendChild(style);

    document.querySelectorAll('.tb-avatar, .ph-inner, .sett-avatar').forEach(el => {
      el.classList.add('avatar-fx');
    });
  }

  function loadEffect() {
    try {
      const equipped = JSON.parse(localStorage.getItem('eylox_equipped') || '{}');
      applyAvatarEffect(equipped.effects || null);
    } catch {}
  }

  window.EyloxApplyEffect = applyAvatarEffect;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEffect);
  } else {
    loadEffect();
  }

  /* Re-apply when storage changes (cross-tab / shop equip) */
  window.addEventListener('storage', e => {
    if (e.key === 'eylox_equipped') loadEffect();
  });

})();