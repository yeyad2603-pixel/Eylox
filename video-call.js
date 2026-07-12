/* ============================================================
   EYLOX — Video Call System v3.0
   Working buttons: Mic, Cam, Share, Effects, React, Files
   Camera preview before joining  |  No background system
   ============================================================ */
'use strict';

/* ── Call State ── */
const callState = {
  isInCall: false,
  localStream: null,
  screenStream: null,
  cameraEnabled: true,
  micEnabled: true,
  screenSharing: false,
  currentEffect: 'none',
  callStartTime: null,
  remoteUserName: null,
  timerInterval: null,
};

/* ── Video Effects ── */
const EFFECTS = [
  { id:'none',      label:'None',    filter:'' },
  { id:'vivid',     label:'Vivid',   filter:'saturate(1.8) contrast(1.1)' },
  { id:'cool',      label:'Cool',    filter:'hue-rotate(20deg) saturate(1.3)' },
  { id:'warm',      label:'Warm',    filter:'sepia(30%) saturate(1.5) brightness(1.05)' },
  { id:'bw',        label:'B&W',     filter:'grayscale(100%)' },
  { id:'glow',      label:'Glow',    filter:'brightness(1.2) contrast(1.1) saturate(1.5)' },
  { id:'neon',      label:'Neon',    filter:'saturate(3) hue-rotate(180deg) brightness(1.1)' },
  { id:'dream',     label:'Dream',   filter:'blur(.5px) saturate(1.6) brightness(1.05)' },
];

/* ── Reactions ── */
const REACTIONS = ['👍','❤️','😂','😮','😢','👏','🔥','🎉','💜','⚡','🏆','✨'];

/* ══════════════════════════════════════════════════════════
   INJECT CSS
══════════════════════════════════════════════════════════ */
function injectCallCSS() {
  if (document.getElementById('vc-css')) return;
  const s = document.createElement('style');
  s.id = 'vc-css';
  s.textContent = `
    @keyframes vcFadeIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
    @keyframes vcSlideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
    @keyframes vcPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.6)} 70%{box-shadow:0 0 0 12px rgba(167,139,250,0)} }
    @keyframes vcRing    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    @keyframes vcSlideIn { from{transform:translateX(100%);opacity:0} to{transform:none;opacity:1} }
    @keyframes vcFloat   { 0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-160px) scale(1.8)} }

    /* ── Main container ── */
    #vc-container {
      position:fixed; inset:0; z-index:4000;
      background:#050010; display:flex; flex-direction:column;
      animation:vcFadeIn .25s ease;
    }

    /* ── Preview overlay ── */
    #vc-preview-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.9);
      z-index:5000; display:flex; align-items:center; justify-content:center;
      padding:16px; backdrop-filter:blur(8px);
      animation:vcFadeIn .2s ease;
    }
    .vc-preview-inner {
      background:linear-gradient(160deg,#0c0520,#070318);
      border:1px solid rgba(167,139,250,.25); border-radius:24px;
      width:100%; max-width:480px;
      box-shadow:0 32px 80px rgba(0,0,0,.8);
      animation:vcFadeIn .3s cubic-bezier(.34,1.56,.64,1);
      overflow:hidden;
    }
    #vc-preview-video {
      width:100%; aspect-ratio:16/9; object-fit:cover;
      transform:scaleX(-1); display:block; background:#000;
    }

    /* ── Button style matching screenshot ── */
    .vc-btn {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:7px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
      border-radius:16px; padding:12px 15px; color:rgba(255,255,255,.9);
      cursor:pointer; font-size:.63rem; font-weight:800; letter-spacing:.02em;
      transition:all .2s; min-width:66px; position:relative; outline:none;
    }
    .vc-btn .bico { font-size:1.25rem; line-height:1; }
    .vc-btn:hover  { background:rgba(255,255,255,.14); transform:translateY(-2px); }
    .vc-btn.active { background:rgba(109,59,204,.55); border-color:#7c3aed; }
    .vc-btn.off    { background:rgba(239,68,68,.2); border-color:rgba(239,68,68,.4); color:#f87171; }
    .vc-btn-end {
      background:#ef4444; border:none; border-radius:14px;
      padding:12px 26px; font-size:.88rem; font-weight:900; color:#fff;
      cursor:pointer; display:flex; align-items:center; gap:8px;
      transition:all .2s; white-space:nowrap; outline:none;
    }
    .vc-btn-end:hover { background:#dc2626; transform:translateY(-2px); }

    /* ── Panels ── */
    .vc-panel-wrap {
      position:absolute; bottom:100%; left:0; right:0;
      background:rgba(8,2,22,.97); border-top:1px solid rgba(167,139,250,.15);
      padding:14px 24px 18px; animation:vcSlideUp .18s ease;
    }
    .vc-panel-title {
      font-size:.6rem; font-weight:900; color:rgba(167,139,250,.45);
      text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px;
    }
    .vc-fx-chip {
      padding:6px 13px; border-radius:8px; border:1px solid rgba(255,255,255,.12);
      background:rgba(255,255,255,.06); color:rgba(255,255,255,.7);
      font-size:.72rem; font-weight:700; cursor:pointer; transition:all .2s;
    }
    .vc-fx-chip:hover  { border-color:rgba(255,255,255,.3); background:rgba(255,255,255,.12); }
    .vc-fx-chip.active { border-color:#a78bfa; background:rgba(167,139,250,.2); color:#fff; }

    /* ── Floating reaction ── */
    .vc-reaction {
      position:fixed; bottom:140px; pointer-events:none;
      z-index:9999; font-size:2.8rem;
      animation:vcFloat 2.2s ease-out forwards;
    }

    /* ── Chat ── */
    .vc-chat-msg {
      padding:7px 12px; border-radius:12px; font-size:.78rem;
      line-height:1.45; word-break:break-word; max-width:85%;
      animation:vcFadeIn .2s ease;
    }
    .vc-chat-msg.me   { align-self:flex-end; background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:#fff; border-bottom-right-radius:4px; }
    .vc-chat-msg.them { align-self:flex-start; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.1); color:#f0e8ff; border-bottom-left-radius:4px; }

    /* ── Incoming call ── */
    #vc-incoming { animation:vcSlideIn .3s ease; }
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════
   CAMERA PREVIEW MODAL
══════════════════════════════════════════════════════════ */
function showCallPreview(friendName) {
  callState.remoteUserName = friendName;
  injectCallCSS();

  const overlay = document.createElement('div');
  overlay.id = 'vc-preview-overlay';
  overlay.innerHTML = `
    <div class="vc-preview-inner">

      <!-- Header -->
      <div style="padding:20px 22px 16px;border-bottom:1px solid rgba(167,139,250,.1)">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;animation:vcPulse 2s infinite">
            ${friendName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-family:'Fredoka One',cursive;font-size:1.05rem;color:#fff">Calling ${friendName}</div>
            <div style="font-size:.72rem;color:rgba(167,139,250,.5);margin-top:2px">Preview your camera before joining</div>
          </div>
        </div>
      </div>

      <!-- Camera Preview -->
      <div style="position:relative;background:#000">
        <video id="vc-preview-video" autoplay muted playsinline></video>
        <div id="vc-prev-ph" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:linear-gradient(135deg,#1a0840,#0c0320)">
          <div style="font-size:3rem">📷</div>
          <div style="font-size:.8rem;color:rgba(167,139,250,.5)">Camera off</div>
        </div>
      </div>

      <!-- Controls -->
      <div style="padding:16px 22px 20px">

        <!-- Cam/Mic toggles -->
        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:16px">
          <button id="prev-cam-btn" onclick="EyloxCall._previewToggleCam()" class="vc-btn active">
            <span class="bico">📷</span>Camera
          </button>
          <button id="prev-mic-btn" onclick="EyloxCall._previewToggleMic()" class="vc-btn active">
            <span class="bico">🎤</span>Mic
          </button>
        </div>

        <!-- Join / Cancel -->
        <div style="display:flex;gap:10px">
          <button onclick="EyloxCall._startCall()" style="flex:1;background:linear-gradient(135deg,#16a34a,#4ade80);border:none;border-radius:14px;padding:14px;color:#000;font-family:'Fredoka One',cursive;font-size:1rem;cursor:pointer;font-weight:900;transition:all .2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
            📞 Join Call
          </button>
          <button onclick="EyloxCall._cancelPreview()" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:14px;padding:14px 20px;color:#f87171;font-weight:800;cursor:pointer;transition:all .2s">
            Cancel
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  startPreviewCamera();
}

function startPreviewCamera() {
  navigator.mediaDevices.getUserMedia({ video:{ width:1280, height:720 }, audio:true })
    .then(stream => {
      callState.localStream = stream;
      const vid = document.getElementById('vc-preview-video');
      const ph  = document.getElementById('vc-prev-ph');
      if (vid) { vid.srcObject = stream; vid.play().catch(()=>{}); }
      if (ph)  ph.style.display = 'none';
      callState.cameraEnabled = true;
      callState.micEnabled    = true;
    })
    .catch(() => {
      callState.localStream   = null;
      callState.cameraEnabled = false;
      callState.micEnabled    = false;
    });
}

/* ══════════════════════════════════════════════════════════
   MAIN CALL INTERFACE
══════════════════════════════════════════════════════════ */
function buildCallInterface() {
  document.getElementById('vc-preview-overlay')?.remove();
  document.body.style.overflow = 'hidden';

  const container = document.createElement('div');
  container.id = 'vc-container';
  const remote  = callState.remoteUserName || 'Friend';
  const initial = remote.charAt(0).toUpperCase();
  const micClass = callState.micEnabled ? '' : ' off';
  const camClass = callState.cameraEnabled ? ' active' : ' off';

  container.innerHTML = `

    <!-- ── Remote Video Area ── -->
    <div id="vc-remote-area" style="flex:1;position:relative;background:linear-gradient(135deg,#050010,#0c0320);display:flex;align-items:center;justify-content:center;overflow:hidden">

      <video id="vc-remote-video" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;display:none;z-index:1"></video>

      <div id="vc-remote-ph" style="text-align:center;z-index:2">
        <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:2.8rem;margin:0 auto 14px;animation:vcPulse 2s infinite">${initial}</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#fff">${remote}</div>
        <div id="vc-status" style="font-size:.8rem;color:rgba(167,139,250,.6);margin-top:6px">Connecting...</div>
      </div>

      <!-- Top Header Bar -->
      <div style="position:absolute;top:0;left:0;right:0;padding:16px 20px;background:linear-gradient(to bottom,rgba(0,0,0,.55),transparent);display:flex;align-items:center;gap:12px;z-index:10">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">${initial}</div>
        <div style="flex:1">
          <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:#fff">${remote}</div>
          <div id="vc-timer" style="font-size:.72rem;color:rgba(255,255,255,.55)">00:00</div>
        </div>
        <button onclick="EyloxCall._toggleChat()" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 14px;color:#fff;cursor:pointer;font-size:.78rem;font-weight:700;transition:all .2s" onmouseover="this.style.background='rgba(255,255,255,.18)'" onmouseout="this.style.background='rgba(255,255,255,.1)'">💬 Chat</button>
      </div>

      <!-- Local PIP -->
      <div id="vc-pip" style="position:absolute;bottom:100px;right:16px;width:140px;height:100px;background:#111;border-radius:12px;overflow:hidden;border:2px solid rgba(167,139,250,.4);box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:5;cursor:grab">
        <video id="vc-local-video" style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:none"></video>
        <div id="vc-pip-ph" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a78bfa,#7c3aed)"><span style="font-size:1.8rem">📷</span></div>
      </div>
    </div>

    <!-- ── Controls Bar (position:relative so panels anchor here) ── -->
    <div id="vc-controls" style="background:rgba(5,0,16,.97);padding:0;flex-shrink:0;border-top:1px solid rgba(167,139,250,.1);position:relative">

      <!-- Effects Panel -->
      <div id="vc-panel-fx" style="display:none" class="vc-panel-wrap">
        <div class="vc-panel-title">Video Effects</div>
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          ${EFFECTS.map(fx => `<button class="vc-fx-chip${callState.currentEffect===fx.id?' active':''}" id="fx-${fx.id}" onclick="EyloxCall._applyFx('${fx.id}')">${fx.label}</button>`).join('')}
        </div>
      </div>

      <!-- React Panel -->
      <div id="vc-panel-react" style="display:none" class="vc-panel-wrap">
        <div class="vc-panel-title">Send Reaction</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${REACTIONS.map(r => `<button onclick="EyloxCall._sendReact('${r}')" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:8px 10px;font-size:1.4rem;cursor:pointer;transition:all .15s;line-height:1" onmouseover="this.style.transform='scale(1.25)';this.style.background='rgba(255,255,255,.14)'" onmouseout="this.style.transform='';this.style.background='rgba(255,255,255,.06)'">${r}</button>`).join('')}
        </div>
      </div>

      <!-- Files Panel -->
      <div id="vc-panel-files" style="display:none" class="vc-panel-wrap">
        <div class="vc-panel-title">Share Files</div>
        <div style="display:flex;gap:8px;flex-direction:column">
          <label style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.06)'">
            <span style="font-size:1.2rem">🖼️</span>
            <span style="font-size:.75rem;font-weight:700;color:#f0e8ff">Share Image</span>
            <input type="file" accept="image/*" style="display:none" onchange="EyloxCall._shareFile(event,'image')">
          </label>
          <label style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.06)'">
            <span style="font-size:1.2rem">📄</span>
            <span style="font-size:.75rem;font-weight:700;color:#f0e8ff">Share Document</span>
            <input type="file" accept=".pdf,.doc,.docx,.txt" style="display:none" onchange="EyloxCall._shareFile(event,'doc')">
          </label>
        </div>
        <div id="vc-files-sent" style="margin-top:8px;display:flex;flex-direction:column;gap:6px"></div>
      </div>

      <!-- Main Button Row -->
      <div style="padding:18px 24px 22px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap">

        <button id="vc-btn-mic" class="vc-btn${micClass}" onclick="EyloxCall._toggleMic()">
          <span class="bico" id="vc-mic-ico">${callState.micEnabled?'🎤':'🔇'}</span>
          <span id="vc-mic-lbl">${callState.micEnabled?'Mute':'Mic Off'}</span>
        </button>

        <button id="vc-btn-cam" class="vc-btn${camClass}" onclick="EyloxCall._toggleCam()">
          <span class="bico" id="vc-cam-ico">${callState.cameraEnabled?'📷':'📵'}</span>
          <span id="vc-cam-lbl">${callState.cameraEnabled?'Stop Cam':'Start Cam'}</span>
        </button>

        <button id="vc-btn-screen" class="vc-btn" onclick="EyloxCall._toggleScreen()">
          <span class="bico">🖥️</span>Share
        </button>

        <button id="vc-btn-fx" class="vc-btn" onclick="EyloxCall._togglePanel('fx')">
          <span class="bico">🎨</span>Effects
        </button>

        <button id="vc-btn-react" class="vc-btn" onclick="EyloxCall._togglePanel('react')">
          <span class="bico">😊</span>React
        </button>

        <button id="vc-btn-files" class="vc-btn" onclick="EyloxCall._togglePanel('files')">
          <span class="bico">📎</span>Files
        </button>

        <button class="vc-btn-end" onclick="EyloxCall._endCall()">
          <span>📵</span> End Call
        </button>

      </div>
    </div>

    <!-- Chat Side Panel -->
    <div id="vc-chat" style="display:none;position:absolute;top:0;right:0;bottom:0;width:300px;background:rgba(10,3,28,.96);border-left:1px solid rgba(167,139,250,.15);flex-direction:column;z-index:20;animation:vcSlideIn .25s ease">
      <div style="padding:14px 16px;border-bottom:1px solid rgba(167,139,250,.12);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <div style="font-family:'Fredoka One',cursive;font-size:.95rem;color:#f0e8ff">Chat</div>
        <button onclick="EyloxCall._toggleChat()" style="background:none;border:none;color:rgba(167,139,250,.5);cursor:pointer;font-size:1.1rem;padding:4px">✕</button>
      </div>
      <div id="vc-chat-msgs" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px;scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.2) transparent"></div>
      <div style="padding:10px 12px;border-top:1px solid rgba(167,139,250,.1);display:flex;gap:6px;flex-shrink:0">
        <input id="vc-chat-inp" type="text" placeholder="Message..." style="flex:1;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:8px 12px;color:#f0e8ff;font-size:.78rem;outline:none" onkeypress="if(event.key==='Enter')EyloxCall._sendChat()">
        <button onclick="EyloxCall._sendChat()" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;border-radius:10px;padding:8px 12px;color:#fff;cursor:pointer;font-size:.9rem">➤</button>
      </div>
    </div>

  `;

  document.body.appendChild(container);

  startLocalVideo();
  startCallTimer();
  simulateConnect();
  makePIPDraggable();

  /* Close panels when clicking outside controls */
  document.addEventListener('click', _outsideClickHandler);
}

function _outsideClickHandler(e) {
  if (!e.target.closest('#vc-controls')) {
    closeAllPanels();
  }
}

function closeAllPanels() {
  ['vc-panel-fx','vc-panel-react','vc-panel-files'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  ['vc-btn-fx','vc-btn-react','vc-btn-files'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
}

/* ── Local video setup ── */
function startLocalVideo() {
  const stream = callState.localStream;
  if (!stream) return;
  const vid = document.getElementById('vc-local-video');
  const ph  = document.getElementById('vc-pip-ph');
  if (vid && callState.cameraEnabled) {
    vid.srcObject = stream;
    vid.play().catch(()=>{});
    vid.style.display = 'block';
    if (ph) ph.style.display = 'none';
  }
  applyEffectToVideo(callState.currentEffect);
}

function simulateConnect() {
  setTimeout(() => {
    const st = document.getElementById('vc-status');
    if (st) st.textContent = 'Ringing...';
    setTimeout(() => {
      const s2 = document.getElementById('vc-status');
      if (s2) s2.textContent = 'Connected ✓';
      const ph = document.getElementById('vc-remote-ph');
      if (ph) { ph.style.transition = 'opacity .5s'; ph.style.opacity = '0.3'; setTimeout(() => { if (ph) ph.style.display = 'none'; }, 500); }
    }, 2200);
  }, 600);
}

function startCallTimer() {
  callState.isInCall    = true;
  callState.callStartTime = Date.now();
  callState.timerInterval = setInterval(() => {
    if (!callState.isInCall) { clearInterval(callState.timerInterval); return; }
    const el = document.getElementById('vc-timer');
    if (!el) return;
    const secs = Math.floor((Date.now() - callState.callStartTime) / 1000);
    el.textContent = `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
  }, 1000);
}

/* ── Effects ── */
function applyEffectToVideo(fxId) {
  const fx = EFFECTS.find(f => f.id === fxId);
  const filter = fx?.filter || '';
  const vid = document.getElementById('vc-local-video');
  const pv  = document.getElementById('vc-preview-video');
  if (vid) vid.style.filter = filter;
  if (pv)  pv.style.filter  = filter;
}

/* ── Draggable PIP ── */
function makePIPDraggable() {
  const pip = document.getElementById('vc-pip');
  if (!pip) return;
  let dragging = false, ox = 0, oy = 0;

  pip.addEventListener('mousedown', e => {
    dragging = true;
    const r = pip.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    pip.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const cr = document.getElementById('vc-container')?.getBoundingClientRect();
    if (!cr) return;
    let x = Math.max(0, Math.min(cr.width  - pip.offsetWidth,  e.clientX - cr.left - ox));
    let y = Math.max(0, Math.min(cr.height - pip.offsetHeight, e.clientY - cr.top  - oy));
    pip.style.left = x+'px'; pip.style.top = y+'px';
    pip.style.bottom = 'auto'; pip.style.right = 'auto';
  });
  document.addEventListener('mouseup', () => { dragging = false; pip.style.cursor = 'grab'; });

  pip.addEventListener('touchstart', e => {
    const t = e.touches[0];
    const r = pip.getBoundingClientRect();
    dragging = true; ox = t.clientX - r.left; oy = t.clientY - r.top;
  }, { passive:true });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t  = e.touches[0];
    const cr = document.getElementById('vc-container')?.getBoundingClientRect();
    if (!cr) return;
    let x = Math.max(0, Math.min(cr.width  - pip.offsetWidth,  t.clientX - cr.left - ox));
    let y = Math.max(0, Math.min(cr.height - pip.offsetHeight, t.clientY - cr.top  - oy));
    pip.style.left = x+'px'; pip.style.top = y+'px';
    pip.style.bottom = 'auto'; pip.style.right = 'auto';
  }, { passive:true });
  document.addEventListener('touchend', () => { dragging = false; });
}

/* ── Incoming call notification ── */
function showIncomingCall(friendName, onAccept, onDecline) {
  injectCallCSS();
  document.getElementById('vc-incoming')?.remove();
  const el = document.createElement('div');
  el.id = 'vc-incoming';
  el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:6000;background:linear-gradient(135deg,#1a0840,#0c0320);border:1px solid rgba(167,139,250,.3);border-radius:16px;padding:18px 20px;min-width:280px;box-shadow:0 16px 50px rgba(0,0,0,.6);animation:vcSlideIn .3s ease';
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;animation:vcRing 1s ease infinite">${(friendName||'?').charAt(0).toUpperCase()}</div>
      <div>
        <div style="font-size:.78rem;color:rgba(167,139,250,.6);font-weight:800">📞 Incoming Video Call</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#fff">${friendName}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button id="vc-accept-btn" style="flex:1;background:linear-gradient(135deg,#16a34a,#4ade80);border:none;border-radius:10px;padding:10px;color:#000;font-weight:900;cursor:pointer;font-size:.85rem">✅ Accept</button>
      <button id="vc-decline-btn" style="flex:1;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:10px;color:#f87171;font-weight:800;cursor:pointer;font-size:.85rem">Decline</button>
    </div>
  `;
  document.body.appendChild(el);
  document.getElementById('vc-accept-btn').onclick  = () => { el.remove(); onAccept?.(); };
  document.getElementById('vc-decline-btn').onclick = () => { el.remove(); onDecline?.(); };
  setTimeout(() => el.remove(), 30000);
}

/* ── End Call ── */
function endCall() {
  callState.isInCall = false;
  clearInterval(callState.timerInterval);
  document.removeEventListener('click', _outsideClickHandler);
  [callState.localStream, callState.screenStream].forEach(s => s?.getTracks?.().forEach(t => t.stop()));
  callState.localStream   = null;
  callState.screenStream  = null;
  callState.screenSharing = false;
  document.getElementById('vc-container')?.remove();
  document.getElementById('vc-preview-overlay')?.remove();
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════════════ */
window.EyloxCall = {
  startCall: (name) => showCallPreview(name || 'Friend'),
  end: endCall,

  _startCall()   { buildCallInterface(); },
  _cancelPreview() {
    callState.localStream?.getTracks().forEach(t => t.stop());
    callState.localStream = null;
    document.getElementById('vc-preview-overlay')?.remove();
    document.body.style.overflow = '';
  },

  /* ── Preview toggles ── */
  _previewToggleCam() {
    const track = callState.localStream?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    callState.cameraEnabled = track.enabled;
    const btn = document.getElementById('prev-cam-btn');
    const vid = document.getElementById('vc-preview-video');
    const ph  = document.getElementById('vc-prev-ph');
    btn?.classList.toggle('active', track.enabled);
    btn?.classList.toggle('off', !track.enabled);
    if (vid) vid.style.opacity = track.enabled ? '1' : '0';
    if (ph)  ph.style.display  = track.enabled ? 'none' : 'flex';
  },
  _previewToggleMic() {
    const track = callState.localStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    callState.micEnabled = track.enabled;
    const btn = document.getElementById('prev-mic-btn');
    btn?.classList.toggle('active', track.enabled);
    btn?.classList.toggle('off', !track.enabled);
  },

  /* ── In-call controls ── */
  _toggleMic() {
    const track = callState.localStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    callState.micEnabled = track.enabled;
    const btn = document.getElementById('vc-btn-mic');
    const ico = document.getElementById('vc-mic-ico');
    const lbl = document.getElementById('vc-mic-lbl');
    btn?.classList.toggle('off', !track.enabled);
    btn?.classList.remove('active');
    if (ico) ico.textContent = track.enabled ? '🎤' : '🔇';
    if (lbl) lbl.textContent = track.enabled ? 'Mute' : 'Mic Off';
  },

  _toggleCam() {
    const track = callState.localStream?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    callState.cameraEnabled = track.enabled;
    const btn = document.getElementById('vc-btn-cam');
    const vid = document.getElementById('vc-local-video');
    const ph  = document.getElementById('vc-pip-ph');
    const ico = document.getElementById('vc-cam-ico');
    const lbl = document.getElementById('vc-cam-lbl');
    btn?.classList.toggle('active', track.enabled);
    btn?.classList.toggle('off', !track.enabled);
    if (vid) vid.style.display = track.enabled ? 'block' : 'none';
    if (ph)  ph.style.display  = track.enabled ? 'none'  : 'flex';
    if (ico) ico.textContent = track.enabled ? '📷' : '📵';
    if (lbl) lbl.textContent = track.enabled ? 'Stop Cam' : 'Start Cam';
  },

  async _toggleScreen() {
    if (callState.screenSharing) {
      callState.screenStream?.getTracks().forEach(t => t.stop());
      callState.screenStream  = null;
      callState.screenSharing = false;
      document.getElementById('vc-btn-screen')?.classList.remove('active');
      startLocalVideo();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
      callState.screenStream  = stream;
      callState.screenSharing = true;
      const vid = document.getElementById('vc-local-video');
      if (vid) { vid.srcObject = stream; vid.style.display = 'block'; vid.style.transform = 'none'; }
      document.getElementById('vc-btn-screen')?.classList.add('active');
      stream.getVideoTracks()[0].addEventListener('ended', () => this._toggleScreen());
    } catch(e) { console.warn('Screen share:', e); }
  },

  _togglePanel(name) {
    const map = { fx:'vc-panel-fx', react:'vc-panel-react', files:'vc-panel-files' };
    const btnMap = { fx:'vc-btn-fx', react:'vc-btn-react', files:'vc-btn-files' };
    Object.keys(map).forEach(key => {
      const panel = document.getElementById(map[key]);
      const btn   = document.getElementById(btnMap[key]);
      if (key === name) {
        const open = panel?.style.display !== 'none';
        if (panel) panel.style.display = open ? 'none' : 'block';
        btn?.classList.toggle('active', !open);
      } else {
        if (panel) panel.style.display = 'none';
        btn?.classList.remove('active');
      }
    });
  },

  _applyFx(id) {
    callState.currentEffect = id;
    document.querySelectorAll('[id^="fx-"]').forEach(b => b.classList.remove('active'));
    document.getElementById(`fx-${id}`)?.classList.add('active');
    applyEffectToVideo(id);
  },

  _sendReact(emoji) {
    const el = document.createElement('div');
    el.className = 'vc-reaction';
    el.style.left = `${25 + Math.random() * 50}%`;
    el.textContent = emoji;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
    /* close panel */
    const panel = document.getElementById('vc-panel-react');
    if (panel) panel.style.display = 'none';
    document.getElementById('vc-btn-react')?.classList.remove('active');
  },

  _shareFile(event, type) {
    const file = event.target.files?.[0];
    if (!file) return;
    const sent = document.getElementById('vc-files-sent');
    if (sent) {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:8px 10px';
      item.innerHTML = `
        <span style="font-size:1rem">${type==='image'?'🖼️':'📄'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:.72rem;font-weight:700;color:#f0e8ff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.name}</div>
          <div style="font-size:.6rem;color:rgba(167,139,250,.5)">${(file.size/1024).toFixed(1)} KB · Sent</div>
        </div>
        <span style="color:#4ade80;font-size:.9rem;flex-shrink:0">✓</span>
      `;
      sent.appendChild(item);
    }
    if (window.EyloxToast) window.EyloxToast(`Shared: ${file.name}`, 'success');
  },

  _toggleChat() {
    const chat = document.getElementById('vc-chat');
    if (!chat) return;
    const open = chat.style.display !== 'none';
    chat.style.display = open ? 'none' : 'flex';
    if (!open) chat.style.flexDirection = 'column';
  },

  _sendChat() {
    const inp  = document.getElementById('vc-chat-inp');
    const text = inp?.value.trim();
    if (!text) return;
    inp.value = '';
    const me   = (() => { try { return JSON.parse(localStorage.getItem('eylox_user')||'{}').username||'You'; } catch { return 'You'; } })();
    const msgs = document.getElementById('vc-chat-msgs');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'vc-chat-msg me';
    div.textContent = text;
    const ts = document.createElement('div');
    ts.style.cssText = 'font-size:.58rem;opacity:.5;text-align:right;margin-top:2px';
    ts.textContent = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    div.appendChild(ts);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  },

  _endCall() {
    if (confirm('End the call?')) endCall();
  },
};

/* Legacy compatibility */
window.initiateVideoCall = (name) => showCallPreview(name || 'Friend');
window.endCall           = endCall;
window.showIncomingCall  = showIncomingCall;

/* Init */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectCallCSS);
} else {
  injectCallCSS();
}
