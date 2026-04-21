/* ============================================================
   EYLOX — extras.js  Global polish for all pages
   ============================================================ */
'use strict';

/* ── 1. Cursor sparkle trail ── */
(function(){
  const colors = ['#a78bfa','#60a5fa','#f472b6','#fde68a','#4ade80'];
  document.addEventListener('mousemove', e => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);background:${colors[Math.floor(Math.random()*colors.length)]};animation:spark-fade .6s ease forwards`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 620);
  });
  if (!document.getElementById('spark-style')) {
    const s = document.createElement('style');
    s.id = 'spark-style';
    s.textContent = '@keyframes spark-fade{0%{opacity:.9;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(0) translateY(-12px)}}';
    document.head.appendChild(s);
  }
})();

/* ── 2. Top scroll-progress bar ── */
(function(){
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0%;z-index:9999;background:linear-gradient(90deg,#7c3aed,#a78bfa,#f472b6);transition:width .1s linear;pointer-events:none;';
  document.body.appendChild(bar);
  window.addEventListener('scroll', ()=>{
    const el = document.scrollingElement || document.documentElement;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100;
    bar.style.width = pct + '%';
  }, {passive:true});
})();

/* ── 3. Notification panel toggle ── */
(function(){
  document.addEventListener('click', e => {
    const btn = e.target.closest('[aria-label="Notifications"]');
    if (!btn) { document.getElementById('notifPanel')?.remove(); return; }
    e.stopPropagation();
    if (document.getElementById('notifPanel')) { document.getElementById('notifPanel').remove(); return; }
    const panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.innerHTML = `
      <div style="padding:14px 16px;border-bottom:1px solid rgba(167,139,250,.2);display:flex;align-items:center;justify-content:space-between">
        <span style="font-family:'Fredoka One',cursive;font-size:1rem;color:#f0e8ff">🔔 Notifications</span>
        <button onclick="this.closest('#notifPanel').remove()" style="background:none;border:none;color:#9d8ec7;cursor:pointer;font-size:1rem">✕</button>
      </div>
      <div style="padding:8px 0">
        <div class="np-item">🎮 <strong>New game unlocked:</strong> Candy Chaos</div>
        <div class="np-item">🔥 <strong>Streak reminder:</strong> Play today to keep your streak!</div>
        <div class="np-item">🏆 <strong>You ranked #4</strong> on the weekly board</div>
        <div class="np-item">💰 <strong>Coins bonus:</strong> +50 coins added to your account</div>
        <div class="np-item">🤝 <strong>Friend joined:</strong> StarBlaster_X is now on Eylox</div>
      </div>
      <div style="padding:10px 16px;border-top:1px solid rgba(167,139,250,.2);text-align:center">
        <span style="font-size:.75rem;color:#9d8ec7;font-weight:700">You're all caught up! 🎉</span>
      </div>
    `;
    const r = btn.getBoundingClientRect();
    panel.style.cssText = `position:fixed;top:${r.bottom+8}px;right:${window.innerWidth-r.right}px;width:300px;background:#0f0428;border:1px solid rgba(167,139,250,.25);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(167,139,250,.1);z-index:9998;overflow:hidden;animation:panel-drop .2s ease`;
    if (!document.getElementById('notif-panel-style')) {
      const s = document.createElement('style');
      s.id = 'notif-panel-style';
      s.textContent = `
        @keyframes panel-drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .np-item{padding:10px 16px;font-size:.82rem;font-weight:700;color:#9d8ec7;border-bottom:1px solid rgba(167,139,250,.08);transition:background .15s;cursor:default}
        .np-item:hover{background:rgba(167,139,250,.08);color:#f0e8ff}
        .np-item strong{color:#f0e8ff}
        .np-item:last-child{border-bottom:none}
      `;
      document.head.appendChild(s);
    }
    document.body.appendChild(panel);
  });
})();

/* ── 4. Page load ripple on .btn-play ── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-play, .hype-btn-primary, .hype-notify-btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;border-radius:50%;background:rgba(255,255,255,.25);transform:scale(0);animation:ripple-burst .5s ease forwards;pointer-events:none`;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(()=>ripple.remove(), 520);
});
if (!document.getElementById('ripple-style')) {
  const s = document.createElement('style');
  s.id = 'ripple-style';
  s.textContent = '@keyframes ripple-burst{to{transform:scale(1);opacity:0}}';
  document.head.appendChild(s);
}

/* ── 5. Sidebar active link glow ── */
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.sidebar-link.active').forEach(el=>{
    el.style.position = 'relative';
    const glow = document.createElement('span');
    glow.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#a78bfa,#60a5fa);border-radius:0 2px 2px 0';
    el.appendChild(glow);
  });
});
