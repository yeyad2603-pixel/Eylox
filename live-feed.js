/* ============================================================
   EYLOX — Live Activity Feed
   Shows a scrolling ticker of simulated live platform events
   (player scores, achievements, new records) on index.html
   ============================================================ */
'use strict';

(function EyloxLiveFeed() {

  const page = document.body?.dataset?.page || '';
  if (page !== 'home') return;

  const PLAYERS = ['NinjaKing99','StarBlaster_X','DragonSlayer','PuzzleWizard','OceanRunner','XanderBolt','CryptoRacer','StormBreaker','PixelQueen','NeonFox','ShadowNinja','CobaltDash','FireBlaze99','IceWizard7','TurboAce'];
  const EVENTS = [
    u => `🎮 <strong>${u}</strong> just played <em>Ninja Dash</em>`,
    u => `🏆 <strong>${u}</strong> set a new high score: <em>${(Math.floor(Math.random()*30+10)*1000).toLocaleString()}</em>`,
    u => `⬆️ <strong>${u}</strong> reached <em>Level ${Math.floor(Math.random()*20+5)}</em>`,
    u => `💰 <strong>${u}</strong> earned <em>${(Math.floor(Math.random()*8+1)*100)} Eylux</em>`,
    u => `🌊 <strong>${u}</strong> beat <em>Ocean Quest</em>`,
    u => `🎖️ <strong>${u}</strong> unlocked achievement <em>Speed Demon</em>`,
    u => `🔥 <strong>${u}</strong> is on a <em>${Math.floor(Math.random()*10+2)}-day streak!</em>`,
    u => `🥷 <strong>${u}</strong> is playing <em>Dragon Escape</em>`,
    u => `🚀 <strong>${u}</strong> launched into <em>Space Blaster</em>`,
    u => `🏅 <strong>${u}</strong> claimed the <em>Daily Reward</em>`,
    u => `👑 <strong>${u}</strong> topped the <em>Leaderboard</em>`,
    u => `⚡ <strong>${u}</strong> completed the <em>Daily Challenge</em>`,
  ];

  function randomEvent() {
    const user = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    const tmpl = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    return tmpl(user);
  }

  function ensureStyles() {
    if (document.getElementById('lf-style')) return;
    const s = document.createElement('style');
    s.id = 'lf-style';
    s.textContent = `
      #live-feed{overflow:hidden;position:relative;height:32px;display:flex;align-items:center}
      @keyframes lf-slide-in{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}
      @keyframes lf-slide-out{to{opacity:0;transform:translateY(-100%)}}
      .lf-item{position:absolute;left:0;right:0;padding:0 12px;font-size:.78rem;font-weight:700;color:rgba(157,142,199,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:lf-slide-in .4s ease both}
      .lf-item.out{animation:lf-slide-out .35s ease both}
      .lf-item strong{color:#f0e8ff}
      .lf-item em{color:#a78bfa;font-style:normal}
      #lf-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80;animation:lf-dot-pulse 1.5s ease-in-out infinite;margin-right:6px;flex-shrink:0}
      @keyframes lf-dot-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}
    `;
    document.head.appendChild(s);
  }

  function inject() {
    // Find the hype stats bar to insert before it, or append to page-content
    const statsBar = document.querySelector('.hype-stats-bar');
    if (!statsBar) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.12);border-radius:12px;padding:0 14px;margin-bottom:20px;gap:8px;height:34px;overflow:hidden';
    wrap.innerHTML = `<span id="lf-dot"></span><div id="live-feed" style="flex:1"></div>`;
    statsBar.parentElement.insertBefore(wrap, statsBar);

    const feed = document.getElementById('live-feed');
    let current = null;

    function showNext() {
      if (current) {
        current.classList.add('out');
        setTimeout(() => current?.remove(), 360);
      }
      const item = document.createElement('div');
      item.className = 'lf-item';
      item.innerHTML = randomEvent();
      feed.appendChild(item);
      current = item;
    }

    showNext();
    setInterval(showNext, 3500);
  }

  ensureStyles();
  document.addEventListener('DOMContentLoaded', inject);

})();
