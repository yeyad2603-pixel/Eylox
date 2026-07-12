/* ============================================================
   EYLOX — Music Player UI
   Provides a minimal floating button; audio handled by sound.js.
   ============================================================ */
'use strict';

(function EyloxMusicPlayerUI() {

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (document.getElementById('eyloxMusicPlayer')) return;

    /* ── CSS ── */
    const style = document.createElement('style');
    style.textContent = `
      #eyloxMusicPlayer {
        position:fixed;bottom:24px;right:24px;z-index:9990;
      }
      #emp-btn {
        width:46px;height:46px;border-radius:50%;border:none;cursor:pointer;
        background:linear-gradient(135deg,#7c3aed,#ec4899);
        color:#fff;font-size:1.2rem;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 18px rgba(124,58,237,.5);
        transition:transform .2s,box-shadow .2s,opacity .2s;
        opacity:.75;
      }
      #emp-btn:hover { transform:scale(1.12);box-shadow:0 6px 24px rgba(124,58,237,.7);opacity:1; }
      #emp-btn.emp-playing { opacity:1;animation:emp-pulse 2s ease-in-out infinite; }
      @keyframes emp-pulse {
        0%,100% { box-shadow:0 4px 18px rgba(124,58,237,.5); }
        50%      { box-shadow:0 4px 30px rgba(236,72,153,.8); }
      }
      #emp-tooltip {
        position:absolute;bottom:54px;right:0;
        background:rgba(18,10,40,.92);color:#f0e8ff;
        font-size:.7rem;font-weight:700;
        padding:5px 11px;border-radius:8px;white-space:nowrap;
        opacity:0;pointer-events:none;transition:opacity .2s;
        border:1px solid rgba(167,139,250,.2);
      }
      #eyloxMusicPlayer:hover #emp-tooltip { opacity:1; }
    `;
    document.head.appendChild(style);

    /* ── HTML ── */
    const wrap = document.createElement('div');
    wrap.id = 'eyloxMusicPlayer';
    wrap.innerHTML = `
      <div id="emp-tooltip">Music</div>
      <button id="emp-btn" title="Toggle background music">🎵</button>
    `;
    document.body.appendChild(wrap);

    const btn     = document.getElementById('emp-btn');
    const tooltip = document.getElementById('emp-tooltip');

    function syncUI() {
      const playing = window.EyloxMusic?.isPlaying?.() || false;
      btn.classList.toggle('emp-playing', playing);
      tooltip.textContent = playing ? '♫ Eylox Music — playing' : 'Eylox Music — click to play';
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (window.EyloxMusic) {
        window.EyloxMusic.toggle();
        setTimeout(syncUI, 80);
      }
    });

    /* Poll until sound.js is ready, then sync */
    const poll = setInterval(() => {
      if (window.EyloxMusic) { syncUI(); clearInterval(poll); }
    }, 200);

    window.addEventListener('eylox-settings-changed', () => setTimeout(syncUI, 150));
  }

})();
