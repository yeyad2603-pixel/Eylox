/* ============================================================
   EYLOX — Sound & Music System
   SFX: Web Audio API  |  Music: bg-music.mp4
   ============================================================ */
'use strict';

(function EyloxSound() {
  let ctx = null;
  let musicPlaying = false;

  /* ── Audio element for background music ── */
  /* Primary track: user-supplied music from the MUSIC folder.
     Falls back to the legacy bg-music.mp4 if the primary can't load. */
  const PRIMARY_TRACK  = '/MUSIC/WhatsApp%20Video%202026-04-15%20at%2011.41.59%20PM.mp4';
  const FALLBACK_TRACK = 'bg-music.mp4';

  const musicAudio = new Audio(PRIMARY_TRACK);
  musicAudio.loop   = true;
  musicAudio.volume = 0;        // start silent, fade in

  /* If primary track fails to load, switch to fallback */
  musicAudio.addEventListener('error', function onErr() {
    musicAudio.removeEventListener('error', onErr);
    musicAudio.src = FALLBACK_TRACK;
    musicAudio.load();
    if (musicPlaying) {
      musicAudio.play().catch(() => {});
    }
  });

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function getSettings() {
    try { return JSON.parse(localStorage.getItem('eylox_settings') || '{}'); } catch { return {}; }
  }
  function soundEnabled() { const s = getSettings(); return s.soundEnabled !== false; }
  function musicEnabled() { const s = getSettings(); return s.musicEnabled === true; }
  function getVolume()    { const s = getSettings(); return typeof s.volumeLevel === 'number' ? s.volumeLevel : 0.8; }

  /* ── Sound effects (Web Audio API) ── */
  function playTone(freq, duration, type = 'sine', vol = 0.18, fadeOut = true) {
    if (!soundEnabled()) return;
    try {
      const c = getCtx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = type; osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(vol * getVolume(), c.currentTime);
      if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.start(c.currentTime); osc.stop(c.currentTime + duration);
    } catch {}
  }

  function playChord(freqs, duration, vol = 0.12) {
    freqs.forEach((f, i) => setTimeout(() => playTone(f, duration, 'sine', vol), i * 60));
  }

  const SFX = {
    click()       { playTone(660,  0.08, 'sine',     0.12); },
    hover()       { playTone(880,  0.04, 'sine',     0.06); },
    purchase()    { playChord([523,659,784], 0.45, 0.14); setTimeout(() => playTone(1047, 0.3, 'sine', 0.12), 180); },
    error()       { playTone(200,  0.25, 'sawtooth', 0.14); setTimeout(() => playTone(160, 0.25, 'sawtooth', 0.1), 130); },
    success()     { playChord([523,659,784,1047], 0.5, 0.12); },
    coin()        { playTone(1200, 0.15, 'sine',     0.1);  setTimeout(() => playTone(1600, 0.2, 'sine', 0.08), 80); },
    spin()        { [440,494,523,587,659,698,784,880].forEach((f,i) => setTimeout(() => playTone(f, 0.12, 'sine', 0.08), i*60)); },
    win()         { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => playTone(f, 0.35, 'sine', 0.14), i*100)); },
    equip()       { playTone(880,  0.08, 'sine',     0.1);  setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 80); },
    boost()       { [440,550,660,880].forEach((f,i) => setTimeout(() => playTone(f, 0.18, 'square', 0.08), i*50)); },
    join()        { playChord([440,554,659], 0.4, 0.12); },
    notification(){ playTone(880,  0.1,  'sine',     0.1);  setTimeout(() => playTone(1100, 0.15, 'sine', 0.08), 100); },
  };
  window.EyloxSFX = SFX;

  /* ── Fade helpers ── */
  let _fadeTimer = null;
  function fadeTo(target, duration = 1200) {
    clearInterval(_fadeTimer);
    const steps  = 40;
    const delay  = duration / steps;
    const start  = musicAudio.volume;
    const delta  = (target - start) / steps;
    let   i      = 0;
    _fadeTimer = setInterval(() => {
      i++;
      musicAudio.volume = Math.max(0, Math.min(1, start + delta * i));
      if (i >= steps) {
        clearInterval(_fadeTimer);
        musicAudio.volume = target;
        if (target === 0) { musicAudio.pause(); musicAudio.currentTime = 0; }
      }
    }, delay);
  }

  /* ── Music controls ── */
  function startMusic() {
    if (musicPlaying || !musicEnabled()) return;
    musicPlaying = true;
    musicAudio.volume = 0;
    musicAudio.play().then(() => {
      fadeTo(getVolume() * 0.55); // music plays at 55% of master volume
    }).catch(() => {
      musicPlaying = false; // autoplay blocked — will retry on next click
    });
  }

  function stopMusic() {
    if (!musicPlaying) return;
    musicPlaying = false;
    fadeTo(0, 800);
  }

  window.EyloxMusic = {
    start:  startMusic,
    stop:   stopMusic,
    toggle() { musicPlaying ? stopMusic() : startMusic(); },
    setVolume(v) {
      if (musicPlaying) fadeTo(v * 0.55, 400);
    },
  };

  /* ── Auto-wire click sounds ── */
  document.addEventListener('click', e => {
    const el = e.target.closest('button, .btn, .btn-play, .shop-tab, .evt-tab, .sidebar-link, .game-card');
    if (el) SFX.click();
  }, true);

  /* ── Watch settings changes (same tab) ── */
  window.addEventListener('eylox-settings-changed', () => {
    if (musicEnabled() && !musicPlaying) startMusic();
    if (!musicEnabled() && musicPlaying)  stopMusic();
  });

  /* ── Watch settings changes (other tabs) ── */
  window.addEventListener('storage', e => {
    if (e.key !== 'eylox_settings') return;
    if (musicEnabled() && !musicPlaying) startMusic();
    if (!musicEnabled() && musicPlaying) stopMusic();
  });

  /* ── Start music after first user interaction (browser autoplay policy) ── */
  document.addEventListener('DOMContentLoaded', () => {
    if (musicEnabled()) {
      document.addEventListener('click', () => { if (!musicPlaying) startMusic(); }, { once: true });
    }
  });

})();
