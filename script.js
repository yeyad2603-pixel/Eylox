/* ============================================================
   EYLOX — script.js  (Milestone 2 — full interactivity)
   · Sidebar toggle    · Live search      · Genre filter tabs
   · Play modal        · Scroll reveal    · Friend actions
   · Stat counters     · Login validation · Search UX
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  sidebarToggle();
  liveSearch();
  genreFilter();
  playModal();
  scrollReveal();
  friendActions();
  statCounters();
  loginValidation();
  searchUX();
});

/* ── 1. SIDEBAR TOGGLE ── */
function sidebarToggle() {
  const btn  = document.getElementById('menuBtn');
  const side = document.getElementById('sidebar');
  if (!btn || !side) return;

  const ov = Object.assign(document.createElement('div'), { className: 'sidebar-overlay' });
  document.body.appendChild(ov);

  const open  = () => { side.classList.add('open'); ov.classList.add('active'); btn.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { side.classList.remove('open'); ov.classList.remove('active'); btn.classList.remove('open'); document.body.style.overflow = ''; };

  btn.addEventListener('click', () => side.classList.contains('open') ? close() : open());
  ov.addEventListener('click', close);
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
}

/* ── 2. LIVE SEARCH ── */
function liveSearch() {
  const input = document.querySelector('.search-input');
  if (!input) return;
  input.addEventListener('input', () => applySearch(input.value.trim().toLowerCase()));
  input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; applySearch(''); input.blur(); } });
}

function applySearch(q) {
  const cards = document.querySelectorAll('.game-card');
  let n = 0;
  cards.forEach(c => {
    const title = c.querySelector('.card-title')?.textContent.toLowerCase() || '';
    const badge = c.querySelector('.card-badge')?.textContent.toLowerCase() || '';
    const ok = !q || title.includes(q) || badge.includes(q);
    c.style.transition = 'opacity .2s, transform .2s';
    c.style.opacity   = ok ? '1'    : '0.1';
    c.style.transform = ok ? ''     : 'scale(.96)';
    if (ok) n++;
  });
  const el = document.querySelector('.game-count');
  if (el) el.innerHTML = q
    ? `Found <strong style="color:var(--purple)">${n} game${n !== 1 ? 's' : ''}</strong> 🔍`
    : `Showing <strong style="color:var(--purple)">${cards.length} games</strong> 🎮`;
}

/* ── 3. GENRE FILTER TABS ── */
function genreFilter() {
  const tabs = document.querySelectorAll('.f-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    applyGenre(tab.dataset.genre || '');
  }));
}

function applyGenre(genre) {
  const cards = document.querySelectorAll('.game-card');
  let n = 0;
  cards.forEach(c => {
    const badge = c.querySelector('.card-badge')?.textContent.trim().toLowerCase() || '';
    const ok = !genre || badge === genre;
    c.style.transition = 'opacity .22s, transform .22s';
    c.style.opacity   = ok ? '1'    : '0.1';
    c.style.transform = ok ? ''     : 'scale(.96)';
    if (ok) n++;
  });
  const el = document.querySelector('.game-count');
  if (el) el.innerHTML = genre
    ? `Showing <strong style="color:var(--purple)">${n} ${genre} game${n !== 1 ? 's' : ''}</strong> 🎮`
    : `Showing <strong style="color:var(--purple)">${cards.length} games</strong> 🎮`;
}

/* ── 4. PLAY BUTTON MODAL ── */
function playModal() {
  buildModal();
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-play');
    if (!btn) return;
    e.preventDefault();
    const card  = btn.closest('.game-card');
    const title = btn.dataset.title  || card?.querySelector('.card-title')?.textContent || '';
    const thumb = btn.dataset.thumb  || card?.querySelector('.card-thumb')?.textContent?.trim()?.[0] || '🎮';
    const genre = btn.dataset.genre  || card?.querySelector('.card-badge')?.textContent?.trim().toLowerCase() || 'action';
    const id    = btn.dataset.id     || card?.dataset.gameId || '';
    if (!title || !id) return; /* block phantom cards */
    /* Use equipped avatar as the launch emoji */
    const equippedAvatar = (() => {
      try {
        const eq = JSON.parse(localStorage.getItem('eylox_equipped') || '{}');
        if (!eq.avatars) return null;
        const CATALOG_AVATARS = {
          'av-cat':'🐱','av-lion':'🦁','av-fox':'🦊','av-panda':'🐼','av-wolf':'🐺',
          'av-tiger':'🐯','av-ghost':'👻','av-alien':'👾','av-robot':'🤖','av-ninja':'🥷',
          'av-wizard':'🧙','av-dragon':'🐲','av-fire':'🔥','av-unicorn':'🦄',
          'av-diamond':'💎','av-crown':'👑'
        };
        return CATALOG_AVATARS[eq.avatars] || null;
      } catch { return null; }
    })();
    const launchEmoji = equippedAvatar || thumb;
    openModal(launchEmoji, title, { id, title, genre, thumb });
  });
}

function buildModal() {
  if (document.getElementById('launchModal')) return;
  const m = document.createElement('div');
  m.id = 'launchModal'; m.className = 'launch-modal';
  m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
  m.innerHTML = `
    <div class="launch-card">
      <span class="launch-emoji" id="lEmoji">🎮</span>
      <h2 class="launch-title" id="lTitle">Launching…</h2>
      <p  class="launch-sub"   id="lSub">Get ready for an epic adventure!</p>
      <div class="launch-track"><div class="launch-fill" id="lFill"></div></div>
      <p class="launch-pct" id="lPct">0%</p>
      <button class="launch-close-btn" id="lClose">✕ Cancel</button>
    </div>`;
  document.body.appendChild(m);
  document.getElementById('lClose').addEventListener('click', closeModal);
  m.addEventListener('click', e => e.target === m && closeModal());
}

let _t = null, _gameData = null;
function openModal(emoji, title, gameData) {
  _gameData = gameData || null;
  const m = document.getElementById('launchModal');
  document.getElementById('lEmoji').textContent = emoji;
  document.getElementById('lTitle').textContent = `Launching ${title}`;
  document.getElementById('lSub').textContent   = 'Get ready for an epic adventure!';
  document.getElementById('lFill').style.width  = '0%';
  document.getElementById('lPct').textContent   = '0%';
  m.classList.add('open'); document.body.style.overflow = 'hidden';
  let p = 0; clearInterval(_t);
  _t = setInterval(() => {
    p = Math.min(p + Math.random() * 15 + 4, 100);
    document.getElementById('lFill').style.width = p + '%';
    document.getElementById('lPct').textContent  = Math.round(p) + '%';
    if (p >= 100) {
      clearInterval(_t);
      document.getElementById('lSub').textContent = '🎉 Launching now — have fun!';
      setTimeout(async () => {
        if (Auth.isLoggedIn() && _gameData?.id) {
          const me = Auth.getUser();
          if (me?._id) {
            try {
              await Users.trackPlay(me._id, _gameData.id);
            } catch (err) {
              console.warn('Track play failed', err);
            }
          }
        }

        /* Save to recently played before leaving */
        if (_gameData) {
          try {
            const entry = {
              id:       _gameData.id    || '',
              title:    _gameData.title || title,
              genre:    _gameData.genre || 'action',
              thumb:    _gameData.thumb || emoji,
              playedAt: Date.now(),
            };
            const rec = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
            const filtered = rec.filter(g => g.title !== entry.title);
            filtered.unshift(entry);
            localStorage.setItem('eylox_recently_played', JSON.stringify(filtered.slice(0, 10)));
          } catch {}
        }

        await closeModal();

        if (_gameData) {
          // Check if this is a Game Maker game
          let isGameMakerGame = false;
          if (_gameData.id) {
            try {
              const gameResponse = await fetch(`http://localhost:3001/api/games/${_gameData.id}`);
              if (gameResponse.ok) {
                const gameData = await gameResponse.json();
                isGameMakerGame = gameData.gameMakerData && gameData.gameMakerData.objects && gameData.gameMakerData.objects.length > 0;
              }
            } catch (err) {
              console.warn('Failed to check game type:', err);
            }
          }

          const qs = new URLSearchParams({
            id:    _gameData.id    || '',
            title: _gameData.title || title,
            genre: _gameData.genre || 'action',
            thumb: _gameData.thumb || emoji,
          });

          // Redirect to appropriate player based on game type
          const targetPage = isGameMakerGame ? 'game-player.html' : 'game.html';
          window.location.href = targetPage + '?' + qs.toString();
        }
      }, 1000);
    }
  }, 150);
}
async function closeModal() {
  clearInterval(_t);
  const m = document.getElementById('launchModal');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }

  if (Auth.isLoggedIn() && _gameData?.id) {
    const me = Auth.getUser();
    if (me?._id) {
      try {
        await Users.trackPlay(me._id, _gameData.id);
        // Keep continue playing area instantly up to date if visible
        const continueGrid = document.getElementById('continue-grid');
        if (continueGrid) {
          const data = await Users.recentGames(me._id).catch(() => null);
          if (data?.games?.length) {
            continueGrid.innerHTML = data.games.slice(0, 3).map(g => buildGameCard(g, '▶ Resume')).join('');
            revealCards(continueGrid);
          }
        }
      } catch (err) {
        console.warn('Could not update recently played:', err);
      }
    }
  }
}

/* ── 5. SCROLL REVEAL ── */
function scrollReveal() {
  const els = document.querySelectorAll('.welcome-banner,.section,.game-card,.friend-card,.req-card,.ps-box,.ach');
  els.forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i * .03) + 's'; });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('shown'); obs.unobserve(e.target); } });
  }, { threshold: .08 });
  els.forEach(el => obs.observe(el));
}

/* ── 6. FRIEND ACTIONS ── */
function friendActions() {
  document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-accept')) {
      const card = e.target.closest('.req-card'); if (!card) return;
      const name = card.querySelector('.req-name')?.textContent || 'Friend';
      flyOut(card, 'right', () => { card.remove(); showToast(`🤝 Now friends with ${name}!`, 'green'); bumpBadge(-1); });
    }
    if (e.target.classList.contains('btn-decline')) {
      const card = e.target.closest('.req-card'); if (!card) return;
      flyOut(card, 'left', () => { card.remove(); bumpBadge(-1); });
    }
    if (e.target.classList.contains('fc-remove')) {
      e.preventDefault();
      const card = e.target.closest('.friend-card'); if (!card) return;
      const name = card.querySelector('.fc-name')?.textContent || 'Friend';
      flyOut(card, 'scale', () => { card.remove(); showToast(`👋 ${name} removed`, 'muted'); });
    }
  });
}
function flyOut(el, dir, cb) {
  el.style.transition = 'opacity .28s, transform .28s';
  el.style.opacity    = '0';
  el.style.transform  = dir === 'right' ? 'translateX(24px)' : dir === 'left' ? 'translateX(-24px)' : 'scale(.82)';
  setTimeout(cb, 300);
}
function bumpBadge(delta) {
  document.querySelectorAll('.s-badge').forEach(b => {
    const n = (parseInt(b.textContent) || 0) + delta;
    b.textContent = n; if (n <= 0) b.style.display = 'none';
  });
}

/* ── 7. TOAST ── */
function showToast(msg, type = 'purple') {
  let c = document.getElementById('toastBox');
  if (!c) { c = Object.assign(document.createElement('div'), { id:'toastBox', className:'toast-container' }); document.body.appendChild(c); }
  const colors = { green:'var(--green)', purple:'var(--purple)', pink:'var(--pink)', muted:'var(--muted)' };
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  t.style.borderLeftColor = colors[type] || colors.purple;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, 3000);
}

/* ── 8. STAT COUNTERS ── */
function statCounters() {
  const els = document.querySelectorAll('.ps-num');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return; obs.unobserve(e.target);
      const el = e.target, raw = el.textContent.trim();
      const isK = raw.includes('K');
      const val = parseFloat(raw.replace(/[^0-9.]/g, '')) * (isK ? 1000 : 1);
      if (isNaN(val)) return;
      const t0 = performance.now(), dur = 900;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3), cur = Math.round(ease * val);
        el.textContent = isK && val >= 1000 ? (cur / 1000).toFixed(cur < 1000 ? 1 : 0) + 'K' : cur.toLocaleString();
        if (p < 1) requestAnimationFrame(tick); else el.textContent = raw;
      })(t0);
    });
  }, { threshold: .5 });
  els.forEach(el => obs.observe(el));
}

/* ── 9. LOGIN VALIDATION ── */
function loginValidation() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    [['username','errUser','Please enter your username'],['password','errPass','Please enter your password']].forEach(([id, eid, msg]) => {
      const inp = document.getElementById(id), err = document.getElementById(eid);
      if (!inp || !err) return;
      if (!inp.value.trim()) { err.textContent = msg; err.style.display = 'block'; inp.style.borderColor = 'var(--pink)'; ok = false; }
      else { err.style.display = 'none'; inp.style.borderColor = ''; }
    });
    if (ok) { const b = form.querySelector('button[type=submit]'); if (b) { b.textContent = '⏳ Logging in…'; b.disabled = true; } setTimeout(() => { window.location.href = 'index.html'; }, 1200); }
  });
  const eye = document.getElementById('eyeBtn'), pwd = document.getElementById('password');
  if (eye && pwd) eye.addEventListener('click', () => { const t = pwd.type === 'text'; pwd.type = t ? 'password' : 'text'; eye.textContent = t ? '👁' : '🙈'; });
}

/* ── 10. SEARCH UX ── */
function searchUX() {
  const input = document.querySelector('.search-input');
  if (!input) return;
  document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); input.focus(); } });
  input.addEventListener('focus', () => { input.placeholder = 'Type to search… (Esc to clear)'; });
  input.addEventListener('blur',  () => { input.placeholder = 'Search games…'; });
}
