/* ============================================================
   EYLOX — Platform Enhancements v1
   Global features injected on every main page:
   · Live "X players online" counter in topbar
   · Keyboard shortcuts (/ to search, Esc to close)
   · Coin gain XP float on localStorage coin changes
   · Welcome-back toast for returning users
   · Page transition fade
   · "Back to top" button
   · Session timer (shows time played)
   ============================================================ */
'use strict';

(function EyloxPlatform() {
  const page = document.body?.dataset?.page || '';
  if (['login', 'landing'].includes(page)) return;

  /* ── Page fade-in ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity .35s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => { document.body.style.opacity = '1'; }));
  });

  /* ── Smooth page exit ── */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 200);
  });


  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const search = document.querySelector('.search-input, #messageInput, [placeholder*="Search"]');
      if (search) { search.focus(); search.select(); }
    }
    if (e.key === 'Escape') {
      const modal = document.querySelector('[id$="Modal"][style*="flex"], [id$="Panel"][style*="flex"], .emoji-picker-wrap');
      if (modal) { modal.style.display = 'none'; }
      const emojiPicker = document.getElementById('emojiPicker');
      if (emojiPicker?.closest('.emoji-picker-wrap')) emojiPicker.closest('.emoji-picker-wrap').style.display = 'none';
    }
    // G → go to games
    if (e.key === 'g' && e.ctrlKey) { e.preventDefault(); window.location.href = 'games.html'; }
    // H → go home
    if (e.key === 'h' && e.ctrlKey && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); window.location.href = 'index.html'; }
  });

  /* ── Welcome back toast ── */
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u?.username) return;
      const key = 'eylox_last_welcome';
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      const now = Date.now();
      if (now - last < 30 * 60 * 1000) return; // Once per 30min
      localStorage.setItem(key, String(now));
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      showPlatformToast(`👋 ${greet}, ${u.username}! Ready to play?`, 3500);
    } catch {}
  });

  /* ── Toast helper ── */
  function showPlatformToast(msg, dur) {
    if (!document.getElementById('pt-style')) {
      const s = document.createElement('style');
      s.id = 'pt-style';
      s.textContent = `@keyframes pt-in{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}} .pt-toast{position:fixed;bottom:85px;left:50%;transform:translateX(-50%);z-index:99998;background:rgba(10,5,28,.96);border:1px solid rgba(167,139,250,.25);color:#f0e8ff;padding:11px 22px;border-radius:13px;font-size:.83rem;font-weight:800;font-family:'Nunito',sans-serif;white-space:nowrap;pointer-events:none;animation:pt-in .3s ease;box-shadow:0 8px 28px rgba(0,0,0,.4)}`;
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.className = 'pt-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.transition='opacity .3s'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, dur || 3000);
  }
  window.EyloxToast = showPlatformToast;

  /* ── Back to top button ── */
  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('.content-area, .page-content, #mainContent');
    if (!main) return;
    if (!document.getElementById('btt-style')) {
      const s = document.createElement('style');
      s.id = 'btt-style';
      s.textContent = `#bttBtn{position:fixed;bottom:90px;right:20px;z-index:9990;width:40px;height:40px;border-radius:50%;background:rgba(var(--accent-rgb,167,139,250),.15);border:1px solid rgba(var(--accent-rgb,167,139,250),.3);color:var(--purple,#a78bfa);font-size:1rem;cursor:pointer;display:none;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,.3)}#bttBtn:hover{background:rgba(var(--accent-rgb,167,139,250),.28);transform:translateY(-2px)}`;
      document.head.appendChild(s);
    }
    const btn = document.createElement('button');
    btn.id = 'bttBtn'; btn.textContent = '↑'; btn.title = 'Back to top';
    btn.addEventListener('click', () => main.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(btn);
    main.addEventListener('scroll', () => {
      btn.style.display = main.scrollTop > 300 ? 'flex' : 'none';
    });
  });

  /* ── Session timer ── */
  const sessionStart = Date.now();
  window.addEventListener('beforeunload', () => {
    try {
      const mins = Math.floor((Date.now() - sessionStart) / 60000);
      if (mins < 1) return;
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u) return;
      u.totalPlaytime = (u.totalPlaytime || 0) + mins;
      localStorage.setItem('eylox_user', JSON.stringify(u));
    } catch {}
  });

  /* ── Coin change listener (XP float) ── */
  let _lastCoins = null;
  setInterval(() => {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      if (!u) return;
      if (_lastCoins !== null && u.coins > _lastCoins) {
        const diff = u.coins - _lastCoins;
        if (diff > 0 && diff < 10000) showPlatformToast(`💰 +${diff.toLocaleString()} coins!`, 2000);
      }
      _lastCoins = u.coins;
    } catch {}
  }, 3000);

})();
