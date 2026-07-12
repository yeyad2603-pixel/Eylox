'use strict';
/* ============================================================
   EYLOX DASH  —  Offline Endless Runner  v1.0
   Complete game engine: physics, worlds, audio, progression
   ============================================================ */
(function EyloxDash() {

// ════════════════════════════════════════════════════════════
// § 1  CONFIG
// ════════════════════════════════════════════════════════════
const C = {
  GRAVITY:      0.52,
  JUMP:        -13.5,
  DJUMP:       -11.5,
  WJ_X:         7.5,
  WJ_Y:        -11.0,
  DASH_SPD:    11,
  DASH_DUR:    16,
  SLIDE_DUR:   54,
  BASE_SPD:    4.8,
  MAX_SPD:     22,
  SPD_RATE:    0.00065,
  PW:          40,
  PH:          58,
  SH:          27,   // slide height
  GY:          0.76, // ground y ratio
  PX:          0.15, // player x ratio
  OBS_GAP:     360,
  COIN_FREQ:   170,
  PU_FREQ:     1400,
  WORLD_DIST:  2500,
  BOSS_DIST:   6000,
  MAX_COINS:   500,
  WALLJUMP_BUFFER: 10,   // frames to react to a wall touch
  WJ_KICK_X:   6,
  WJ_KICK_Y:  -12.5,
  AIRDASH_VX:  13,
  AIRDASH_DUR: 18,
  FOV_MAX:     0.10,     // max camera zoom-out ratio at top speed
};

// ════════════════════════════════════════════════════════════
// § COSMETICS  (unlockable trails/skins)
// ════════════════════════════════════════════════════════════
const TRAILS = [
  { id:'default',  name:'World Default', col:null,      unlock:0 },
  { id:'ember',    name:'Ember',         col:'#f97316',  unlock:2000 },
  { id:'frost',    name:'Frost',         col:'#93c5fd',  unlock:5000 },
  { id:'toxic',    name:'Toxic',         col:'#4ade80',  unlock:10000 },
  { id:'royal',    name:'Royal Gold',    col:'#fbbf24',  unlock:20000 },
  { id:'rainbow',  name:'Prism',         col:'rainbow',  unlock:40000 },
];
function trailUnlocked(t, best){ return best>=t.unlock; }

// ════════════════════════════════════════════════════════════
// § KEYBINDS  (customizable, persisted)
// ════════════════════════════════════════════════════════════
const DEFAULT_KEYBINDS = { jump:'Space', slide:'ArrowDown', dash:'KeyD' };
let Keybinds = { ...DEFAULT_KEYBINDS };

// ════════════════════════════════════════════════════════════
// § 2  WORLD DEFINITIONS
// ════════════════════════════════════════════════════════════
const WORLDS = [
  { name:'🌆 Neon City',      sky:['#0a0015','#180030'], acc:'#a855f7', gl:'#7c3aed', gr:'#12003a', note:220, obs:['wall','laser','drone','elecFloor'] },
  { name:'🌌 Space',           sky:['#000510','#010e28'], acc:'#60a5fa', gl:'#3b82f6', gr:'#050f28', note:196, obs:['meteor','satellite','laser','void'] },
  { name:'🌲 Forest',          sky:['#010c02','#031604'], acc:'#4ade80', gl:'#22c55e', gr:'#041204', note:261, obs:['log','branch','boulder','trap'] },
  { name:'🏜 Desert',          sky:['#0d0400','#180800'], acc:'#fb923c', gl:'#f97316', gr:'#1a0800', note:293, obs:['cactus','dune','sandWall','scorpion'] },
  { name:'❄ Snow',             sky:['#020812','#03101e'], acc:'#bfdbfe', gl:'#93c5fd', gr:'#040c1a', note:329, obs:['iceBlock','snowball','icicle','blizzard'] },
  { name:'🌋 Volcano',         sky:['#0a0100','#1a0300'], acc:'#f97316', gl:'#ef4444', gr:'#1a0400', note:349, obs:['lavaWall','boulder','eruption','flame'] },
  { name:'☁ Sky Islands',     sky:['#030820','#060f30'], acc:'#e2e8f0', gl:'#cbd5e1', gr:'#050f28', note:392, obs:['cloudGap','wind','lightning','platform'] },
  { name:'🌊 Underwater Lab',  sky:['#000d1a','#001428'], acc:'#06b6d4', gl:'#0891b2', gr:'#001020', note:440, obs:['jellyfish','current','shark','pressureZone'] },
  { name:'🤖 Robot Factory',   sky:['#080808','#101010'], acc:'#6366f1', gl:'#4f46e5', gr:'#101010', note:493, obs:['gear','robotArm','laser','conveyor'] },
  { name:'🏰 Crystal Kingdom', sky:['#05010d','#0a0220'], acc:'#e879f9', gl:'#d946ef', gr:'#0a0220', note:523, obs:['shard','crystalGate','golem','beam'] },
];

// ════════════════════════════════════════════════════════════
// § 3  POWER-UP DEFS
// ════════════════════════════════════════════════════════════
const PU_TYPES = [
  { id:'magnet',     icon:'🧲', col:'#f472b6', dur:8000,  label:'Magnet'        },
  { id:'speed',      icon:'⚡', col:'#facc15', dur:5000,  label:'Speed Boost'   },
  { id:'shield',     icon:'🛡', col:'#60a5fa', dur:7000,  label:'Shield'        },
  { id:'wingJump',   icon:'🪽', col:'#4ade80', dur:10000, label:'Wing Jump'     },
  { id:'slowMo',     icon:'⏰', col:'#a78bfa', dur:6000,  label:'Slow Motion'   },
  { id:'x2',         icon:'💎', col:'#34d399', dur:8000,  label:'Coin ×2'       },
  { id:'star',       icon:'⭐', col:'#fde68a', dur:5000,  label:'Invincibility' },
  { id:'rocket',     icon:'🚀', col:'#f97316', dur:4000,  label:'Rocket!'       },
];

// ════════════════════════════════════════════════════════════
// § 4  DOM / STATE
// ════════════════════════════════════════════════════════════
let _overlay, _canvas, _ctx;
let _active    = false;
let _raf       = null;
let _lastT     = 0;
let _savedURL  = null;

// Game state
const G = {
  phase:     'splash',  // splash | playing | dead | paused | reconnecting
  score:     0,
  best:      0,
  coins:     0,
  dist:      0,
  speed:     C.BASE_SPD,
  worldIdx:  0,
  frame:     0,
  lastBoss:  0,
  shake:     { x:0, y:0, life:0 },
  camZoom:   1,
  camPunch:  0,
  bgOff:     [0, 0, 0],   // parallax offsets [far, mid, near]
  spawnDist: 0,
  coinDist:  0,
  puDist:    0,
  sessionCoins: 0,
  sessionXP:    0,
  sessionDashes: 0,
  sessionPowerUps: 0,
};

// Player state
const P = {
  x:0, y:0, vy:0,
  w:C.PW, h:C.PH,
  grounded:false,
  jumps:2,
  sliding:false, slideT:0,
  dashing:false, dashT:0, dashVX:0,
  airDashed:false,       // consumed the single air-dash charge this airtime
  nearWall:null,         // obstacle ref when touching a wall-jumpable side
  wallBuffer:0,          // frames left to react with a wall jump
  dead:false,
  invincible:false, invT:0,
  animT:0,
  pst:'run',       // run|jump|slide|dash|dead|powered
  trail:[],
  puActive:{},     // { shield:true }
  puEnd:{},        // { shield: timestamp }
  equippedTrail:'default',
};

// Entity lists
let obstacles  = [];
let coinItems  = [];
let puItems    = [];
let particles  = [];
let bgFar      = [];
let bgMid      = [];
let bgNear     = [];

// Notification queue
let notifQueue = [];

// Boss state
const Boss = { active:false, type:'', hp:0, maxHp:0, x:0, y:0, phase:0, timer:0 };

// ════════════════════════════════════════════════════════════
// § 5  UTILITIES
// ════════════════════════════════════════════════════════════
const U = {
  rand:   (a,b)=>Math.random()*(b-a)+a,
  ri:     (a,b)=>Math.floor(U.rand(a,b+1)),
  pick:   a=>a[Math.floor(Math.random()*a.length)],
  clamp:  (v,a,b)=>Math.min(Math.max(v,a),b),
  lerp:   (a,b,t)=>a+(b-a)*t,
  gY:     ()=>_canvas.height*C.GY,
  pX:     ()=>_canvas.width*C.PX,
  overlap:(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y,
  shrink: (r,n)=>({x:r.x+n,y:r.y+n,w:r.w-n*2,h:r.h-n*2}),
};

function rr(x,y,w,h,r){
  _ctx.beginPath();
  _ctx.moveTo(x+r,y);
  _ctx.lineTo(x+w-r,y);
  _ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  _ctx.lineTo(x+w,y+h-r);
  _ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  _ctx.lineTo(x+r,y+h);
  _ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  _ctx.lineTo(x,y+r);
  _ctx.quadraticCurveTo(x,y,x+r,y);
  _ctx.closePath();
}

function glow(color, blur){
  _ctx.shadowBlur  = blur;
  _ctx.shadowColor = color;
}
function noGlow(){ _ctx.shadowBlur = 0; }

// ════════════════════════════════════════════════════════════
// § 6  AUDIO ENGINE  (Web Audio API, no external files)
// ════════════════════════════════════════════════════════════
let _ac = null;
function ac(){
  if(!_ac){ try { _ac = new (window.AudioContext||window.webkitAudioContext)(); } catch{} }
  return _ac;
}

function synth(freq, type, dur, vol=0.35, detune=0){
  const a = ac(); if(!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.connect(g); g.connect(a.destination);
  o.type = type; o.frequency.value = freq; o.detune.value = detune;
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  o.start(); o.stop(a.currentTime + dur);
}

function noise(dur, vol=0.1){
  const a = ac(); if(!a) return;
  const buf = a.createBuffer(1, a.sampleRate*dur, a.sampleRate);
  const d   = buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const src = a.createBufferSource();
  const g   = a.createGain();
  src.buffer = buf; src.connect(g); g.connect(a.destination);
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+dur);
  src.start(); src.stop(a.currentTime+dur);
}

const SFX = {
  jump()    { synth(320,'sine',0.18,0.3); synth(480,'sine',0.14,0.15); },
  djump()   { synth(420,'sine',0.18,0.3); synth(640,'sine',0.15,0.2); },
  land()    { noise(0.08,0.12); synth(80,'sine',0.08,0.2); },
  coin()    { synth(880,'sine',0.12,0.25); synth(1100,'sine',0.08,0.15); },
  powerup() { [440,550,660,880].forEach((f,i)=>setTimeout(()=>synth(f,'sine',0.2,0.3),i*60)); },
  death()   { synth(200,'sawtooth',0.3,0.4); synth(100,'square',0.4,0.3); noise(0.3,0.15); },
  dash()    { synth(600,'square',0.1,0.2); noise(0.06,0.08); },
  slide()   { noise(0.12,0.1); },
  boss()    { [110,90,70].forEach((f,i)=>setTimeout(()=>synth(f,'sawtooth',0.4,0.5),i*120)); },
  hit()     { synth(150,'square',0.15,0.35); noise(0.12,0.15); },
  worldChg(){ [330,440,550,660].forEach((f,i)=>setTimeout(()=>synth(f,'triangle',0.25,0.25),i*80)); },
};

// Simple music sequencer
const Music = {
  _sched: null, _bpm: 128, _pat: 0,
  _notes: [[220,0,185,0,220,0,196,0],[262,0,220,0,262,0,233,0],
            [196,0,165,0,196,0,175,0],[294,0,262,0,294,0,261,0]],
  _bassDrum: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  start(){
    if(this._sched) return;
    const a = ac(); if(!a) return;
    this._bpm = 120;
    const self = this;
    const step = ()=>{
      if(!_active || G.phase!=='playing'){ self._sched=null; return; }
      const idx  = self._pat % 8;
      const freq = self._notes[G.worldIdx % 4][idx];
      if(freq){ synth(freq*2,'triangle',0.28,0.06); }
      if(self._bassDrum[self._pat%16]){ synth(55,'sine',0.12,0.18); noise(0.04,0.06); }
      self._pat++;
      self._sched = setTimeout(step, (60000/self._bpm)*0.5);
    };
    step();
  },
  stop(){ if(this._sched){ clearTimeout(this._sched); this._sched=null; } },
  setBPM(v){ this._bpm = U.clamp(v, 90, 200); },
};

// ════════════════════════════════════════════════════════════
// § 7  PARTICLES
// ════════════════════════════════════════════════════════════
function spawnParticles(x, y, col, n=10, spd=4, life=40){
  for(let i=0;i<n;i++){
    const ang = Math.random()*Math.PI*2;
    const v   = U.rand(0.5,spd);
    particles.push({
      x, y,
      vx: Math.cos(ang)*v, vy: Math.sin(ang)*v - U.rand(0,2),
      life, maxLife: life,
      col, r: U.rand(2,5),
    });
  }
}

function spawnTrailParticle(){
  const world = WORLDS[G.worldIdx];
  particles.push({
    x: P.x + P.w*0.5, y: P.y + P.h*0.5 + U.rand(-6,6),
    vx: -G.speed*0.4 + U.rand(-1,1), vy: U.rand(-0.5,0.5),
    life: 15, maxLife: 15,
    col: trailColor(world.acc), r: U.rand(2,4),
  });
}

function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x  += p.vx; p.y += p.vy;
    p.vy += 0.08;
    p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}

function drawParticles(){
  particles.forEach(p=>{
    const alpha = p.life/p.maxLife;
    _ctx.globalAlpha = alpha;
    glow(p.col, 8);
    _ctx.fillStyle = p.col;
    _ctx.beginPath();
    _ctx.arc(p.x, p.y, p.r*alpha, 0, Math.PI*2);
    _ctx.fill();
  });
  _ctx.globalAlpha = 1;
  noGlow();
}

// ════════════════════════════════════════════════════════════
// § 8  BACKGROUND GENERATION
// ════════════════════════════════════════════════════════════
function makeBgEl(type, x, y, w, h, col, extra){
  return { type, x, y, w, h, col, extra: extra||{} };
}

function initBg(){
  const W = _canvas.width, H = _canvas.height;
  const world = WORLDS[G.worldIdx];
  bgFar=[]; bgMid=[]; bgNear=[];

  // Far layer: buildings / distant shapes
  for(let x=-W; x<W*2; x+=U.rand(60,140)){
    const bh = U.rand(H*0.15, H*0.4);
    bgFar.push(makeBgEl('rect', x, U.gY()-bh, U.rand(40,90), bh, world.gr, { isBuilding: true }));
    // Windows on buildings (for neon city feel)
    if(G.worldIdx===0){
      for(let wy=0; wy<bh; wy+=18){
        for(let wx=0; wx<60; wx+=14){
          if(Math.random()>0.5)
            bgFar.push(makeBgEl('dot', x+wx+3, U.gY()-bh+wy+4, 6, 6, world.acc, { far:true }));
        }
      }
    }
  }

  // Mid layer: medium structures
  for(let x=-W; x<W*2; x+=U.rand(80,180)){
    const shape = U.ri(0,2);
    const mh = U.rand(H*0.08, H*0.22);
    bgMid.push(makeBgEl(shape===0?'rect':'tri', x, U.gY()-mh, U.rand(30,70), mh, world.midCol||world.gr));
  }

  // Near layer: ground details
  for(let x=-W; x<W*2; x+=U.rand(120,300)){
    bgNear.push(makeBgEl('rect', x, U.gY(), U.rand(10,30), U.rand(5,20), world.acc, { near:true }));
  }

  // Stars for space world
  if(G.worldIdx===1){
    for(let i=0;i<200;i++){
      bgFar.push(makeBgEl('dot', U.rand(0,W), U.rand(0,U.gY()*0.9), 2, 2, '#fff', { star:true }));
    }
  }
}

function scrollBg(speed){
  const tileW = _canvas.width*3;
  bgFar.forEach(e=>{
    if(!e.extra.star){ e.x -= speed*0.12; if(e.x+e.w < -_canvas.width) e.x+=tileW; }
  });
  bgMid.forEach(e=>{ e.x -= speed*0.32; if(e.x+e.w < -_canvas.width) e.x+=tileW; });
  bgNear.forEach(e=>{ e.x -= speed*0.65; if(e.x+e.w < -_canvas.width) e.x+=tileW; });
}

function drawBgElement(e){
  const c = _ctx;
  c.fillStyle = e.col;
  if(e.type==='rect'){
    c.fillRect(e.x, e.y, e.w, e.h);
  } else if(e.type==='tri'){
    c.beginPath();
    c.moveTo(e.x+e.w/2, e.y);
    c.lineTo(e.x+e.w, e.y+e.h);
    c.lineTo(e.x, e.y+e.h);
    c.closePath();
    c.fill();
  } else if(e.type==='dot'){
    const alpha = e.extra.star ? U.rand(0.3,1) : 1;
    c.globalAlpha = alpha;
    c.beginPath();
    c.arc(e.x+e.w/2, e.y+e.h/2, e.w/2, 0, Math.PI*2);
    c.fill();
    c.globalAlpha = 1;
  }
}

function drawBackground(){
  const c = _ctx, W = _canvas.width, H = _canvas.height;
  const world = WORLDS[G.worldIdx];

  // Sky gradient
  const sky = c.createLinearGradient(0,0,0,H);
  sky.addColorStop(0, world.sky[0]);
  sky.addColorStop(1, world.sky[1]);
  c.fillStyle = sky;
  c.fillRect(0,0,W,H);

  // Nebula / atmosphere glow
  const neb = c.createRadialGradient(W*0.5, H*0.3, 0, W*0.5, H*0.3, W*0.55);
  neb.addColorStop(0, world.acc+'22');
  neb.addColorStop(1, 'transparent');
  c.fillStyle = neb;
  c.fillRect(0,0,W,H);

  // Weather layer
  drawWeather();

  c.globalAlpha = 0.45;
  bgFar.forEach(drawBgElement);
  c.globalAlpha = 0.6;
  bgMid.forEach(drawBgElement);
  c.globalAlpha = 0.8;
  bgNear.forEach(drawBgElement);
  c.globalAlpha = 1;

  // Ground platform
  const gY = U.gY();
  const grd = c.createLinearGradient(0,gY,0,H);
  grd.addColorStop(0, world.gr);
  grd.addColorStop(1, '#000');
  c.fillStyle = grd;
  c.fillRect(0, gY, W, H-gY);

  // Ground glow line
  glow(world.gl, 18);
  c.strokeStyle = world.gl;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, gY);
  c.lineTo(W, gY);
  c.stroke();
  noGlow();

  // Running grid lines on ground (speed lines)
  c.globalAlpha = 0.12;
  c.strokeStyle = world.gl;
  c.lineWidth = 1;
  const gridOff = (G.frame * G.speed * 0.5) % 80;
  for(let gx=-80+gridOff; gx<W+80; gx+=80){
    const perspective = (gx/W);
    c.beginPath();
    c.moveTo(gx, gY);
    c.lineTo(gx + (gx-W/2)*0.4, H);
    c.stroke();
  }
  c.globalAlpha = 1;
}

// Weather particles (per-world atmosphere)
let weatherPts = [];
function initWeather(){
  weatherPts=[];
  const W=_canvas.width, H=_canvas.height;
  const wi=G.worldIdx;
  const n = wi===1?0:30;
  for(let i=0;i<n;i++){
    weatherPts.push({ x:U.rand(0,W), y:U.rand(0,H*0.9),
      vx: wi===3?U.rand(2,5):-U.rand(0.5,2), vy:U.rand(0.5,3),
      r:wi===4?2:1.5, alpha:U.rand(0.2,0.7) });
  }
}

function drawWeather(){
  const world = WORLDS[G.worldIdx];
  if(G.worldIdx===1) return; // space: no weather (stars already in bg)
  const W=_canvas.width, H=_canvas.height;
  weatherPts.forEach(p=>{
    p.x += p.vx - G.speed*0.05; p.y += p.vy;
    if(p.y>H*0.95) p.y=U.rand(0,H*0.1);
    if(p.x<0) p.x=W; if(p.x>W) p.x=0;
    _ctx.globalAlpha=p.alpha*0.6;
    _ctx.fillStyle=world.acc;
    _ctx.beginPath();
    _ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    _ctx.fill();
  });
  _ctx.globalAlpha=1;
}

// ════════════════════════════════════════════════════════════
// § 9  MASCOT "LUX"  (procedural canvas character)
// ════════════════════════════════════════════════════════════
function drawLux(x, y, w, h, aT, pst, powered){
  const c = _ctx;
  const cx = x+w/2;
  const gY = y+h;
  const world = WORLDS[G.worldIdx];
  const acc = powered.star ? '#fde68a' : powered.rocket ? '#f97316' : trailColor(world.acc);

  c.save();

  // Motion trail (dash/rocket)
  if(pst==='dash' || powered.rocket){
    P.trail.forEach((t,i)=>{
      const a = (i/P.trail.length)*0.35;
      c.globalAlpha = a;
      c.fillStyle = acc;
      rr(t.x, t.y, w*0.85, h*0.85, 8);
      c.fill();
    });
    c.globalAlpha = 1;
  }

  // SLIDE: flatten into low profile
  if(pst==='slide'){
    const sw=w*1.4, sh=h*0.45;
    // body
    const sg=c.createLinearGradient(x,y+h-sh,x+sw,y+h);
    sg.addColorStop(0,'#3d1575'); sg.addColorStop(1,'#1a0533');
    c.fillStyle=sg; rr(x-w*0.2, y+h-sh, sw, sh, 10); c.fill();
    // eyes peeking
    c.fillStyle='#fff'; c.beginPath(); c.ellipse(cx+12,y+h-sh*0.5,10,7,0,0,Math.PI*2); c.fill();
    c.fillStyle='#7c3aed'; c.beginPath(); c.arc(cx+14,y+h-sh*0.5,5,0,Math.PI*2); c.fill();
    // speed glow
    glow(acc,16);
    c.strokeStyle=acc; c.lineWidth=1.5;
    rr(x-w*0.2,y+h-sh,sw,sh,10); c.stroke();
    noGlow();
    c.restore(); return;
  }

  // DEAD: X eyes
  if(pst==='dead'){
    c.globalAlpha = 0.7;
  }

  // LEGS — running animation
  const legAng = pst==='jump'||pst==='dash' ? 0.3 : Math.sin(aT*0.22)*0.55;
  const lw=w*0.28, lh=h*0.30, ly=y+h*0.58, lx=cx;

  // Leg glow (shoe)
  [[-1,legAng],[1,-legAng]].forEach(([side,ang])=>{
    c.save();
    c.translate(lx+side*lw*0.4, ly);
    c.rotate(ang);
    c.fillStyle='#1a0533';
    rr(-lw/2,0,lw,lh,6); c.fill();
    // Shoe
    glow(acc,10);
    c.fillStyle=acc;
    rr(-lw/2+2,lh-7,lw-4,7,4); c.fill();
    noGlow();
    c.restore();
  });

  // BODY
  const bw=w*0.78, bh=h*0.48, bx=cx-bw/2, by=y+h*0.2;
  const bg=c.createLinearGradient(bx,by,bx+bw,by+bh);
  bg.addColorStop(0,'#3d1575'); bg.addColorStop(1,'#1a0533');
  c.fillStyle=bg; rr(bx,by,bw,bh,10); c.fill();

  // Speed stripe
  c.fillStyle=acc; c.globalAlpha=0.7;
  rr(cx-3,by+8,6,bh-16,3); c.fill();
  c.globalAlpha=1;

  // Body glow ring when powered
  if(Object.keys(powered).length>0){
    glow(acc,22); c.strokeStyle=acc+'88'; c.lineWidth=2;
    rr(bx-2,by-2,bw+4,bh+4,12); c.stroke(); noGlow();
  }

  // HEAD
  const hr=w*0.44;
  const hcx=cx + (pst==='run'?Math.sin(aT*0.15)*1.5:0);
  const hcy=y+h*0.2;

  const hg=c.createRadialGradient(hcx-hr*0.3,hcy-hr*0.3,0,hcx,hcy,hr);
  hg.addColorStop(0,'#5b21b6'); hg.addColorStop(1,'#1a0533');
  c.beginPath(); c.arc(hcx,hcy,hr,0,Math.PI*2); c.fillStyle=hg; c.fill();

  glow(acc,18); c.strokeStyle=acc+'66'; c.lineWidth=1.5;
  c.beginPath(); c.arc(hcx,hcy,hr,0,Math.PI*2); c.stroke(); noGlow();

  // Visor strip
  c.save();
  c.beginPath(); c.arc(hcx,hcy,hr,0,Math.PI*2); c.clip();
  c.fillStyle='rgba(124,58,237,0.22)';
  c.fillRect(hcx-hr,hcy-hr*0.28,hr*2,hr*0.56);
  c.restore();

  // EYE
  const ex=hcx+hr*0.28, ey=hcy-hr*0.05, er=hr*0.38;
  // Sclera
  c.beginPath(); c.ellipse(ex,ey,er,er*0.88,0,0,Math.PI*2);
  c.fillStyle='#fff'; c.fill();
  // Iris
  const irisCol = pst==='dead'?'#444':powered.star?'#fde68a':powered.shield?'#60a5fa':'#7c3aed';
  c.beginPath(); c.arc(ex+er*0.1,ey,er*0.60,0,Math.PI*2);
  c.fillStyle=irisCol; c.fill();
  // Pupil
  c.beginPath(); c.arc(ex+er*0.15,ey,er*0.30,0,Math.PI*2);
  c.fillStyle='#000'; c.fill();
  // Shine
  c.beginPath(); c.arc(ex+er*0.03,ey-er*0.22,er*0.12,0,Math.PI*2);
  c.fillStyle='rgba(255,255,255,0.9)'; c.fill();
  // Glow ring
  glow(irisCol,14); c.strokeStyle=irisCol+'99'; c.lineWidth=1;
  c.beginPath(); c.arc(ex+er*0.1,ey,er*0.60,0,Math.PI*2); c.stroke(); noGlow();

  // DEAD: X overlay on eye
  if(pst==='dead'){
    c.strokeStyle='#ef4444'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(ex-er*0.6,ey-er*0.6); c.lineTo(ex+er*0.6,ey+er*0.6); c.stroke();
    c.beginPath(); c.moveTo(ex+er*0.6,ey-er*0.6); c.lineTo(ex-er*0.6,ey+er*0.6); c.stroke();
  }

  // ANTENNA
  const abx=hcx-hr*0.2, aby=hcy-hr;
  c.beginPath();
  c.moveTo(abx,aby);
  c.bezierCurveTo(abx-8,aby-12,abx-4,aby-20,abx+2,aby-27);
  c.strokeStyle='#6d28d9'; c.lineWidth=2; c.stroke();
  glow('#e879f9',14);
  c.fillStyle=powered.star?'#fde68a':'#e879f9';
  c.beginPath(); c.arc(abx+2,aby-27,4+Math.sin(aT*0.08)*1.5,0,Math.PI*2); c.fill();
  noGlow();

  // ROCKET boost effect
  if(powered.rocket){
    glow('#f97316',30);
    c.fillStyle='#f97316';
    for(let i=0;i<3;i++){
      const fx=bx+U.rand(4,bw-4);
      const fy=by+bh-U.rand(0,10);
      c.beginPath(); c.arc(fx,fy,U.rand(3,7),0,Math.PI*2); c.fill();
    }
    noGlow();
  }

  c.restore();
}

// ════════════════════════════════════════════════════════════
// § 10  OBSTACLES
// ════════════════════════════════════════════════════════════
function spawnObstacle(){
  const gY=U.gY(), W=_canvas.width;
  const world=WORLDS[G.worldIdx];
  const t=U.pick(world.obs);
  let obs;

  switch(t){
    case 'wall': case 'barrier': case 'log': case 'cactus':
    case 'iceBlock': case 'lavaWall': case 'shard': case 'gear':
      { const h=U.ri(55,80);
      obs={x:W+40, y:gY-h, w:U.ri(25,40), h,
           type:'ground', col:world.gl, gCol:world.acc, wallJump:h>=68}; }
      break;

    case 'laser': case 'beam':
      obs={x:W+40, y:gY-U.ri(60,90), w:8, h:U.ri(60,90),
           type:'slide_req', col:'#ef4444', gCol:'#fca5a5', blink:true}; break;

    case 'drone': case 'satellite': case 'shark': case 'robotArm':
      obs={x:W+60, y:gY-U.ri(80,130), w:50, h:28,
           type:'air', col:world.acc, gCol:world.gl, vy:0, t:0}; break;

    case 'meteor': case 'boulder': case 'snowball': case 'golem':
      obs={x:W+U.ri(0,200), y:-40, w:46, h:46,
           type:'falling', col:world.gl, gCol:world.acc, vy:2+G.speed*0.15, round:true}; break;

    case 'elecFloor': case 'conveyor': case 'flame': case 'lightning':
      obs={x:W+40, y:gY-18, w:U.ri(80,150), h:18,
           type:'ground', col:'#facc15', gCol:'#fde68a', blink:true}; break;

    case 'void': case 'crystalGate':
      obs={x:W+40, y:gY-U.ri(70,100), w:16, h:U.ri(70,100),
           type:'slide_req', col:world.acc, gCol:world.gl}; break;

    case 'branch': case 'wind': case 'current': case 'blizzard':
      obs={x:W+40, y:gY-U.ri(90,120), w:U.ri(80,130), h:12,
           type:'slide_req', col:world.gl, gCol:world.acc}; break;

    case 'cloudGap': case 'dune':
      obs={x:W+40, y:gY-U.ri(20,40), w:U.ri(60,120), h:U.ri(20,40),
           type:'ground', col:world.gl, gCol:world.acc, wave:true}; break;

    case 'platform':
      obs={x:W+40, y:gY-U.ri(80,120), w:90, h:16,
           type:'platform', col:world.acc, gCol:world.gl, vy:-1, range:50, t:0}; break;

    default:
      obs={x:W+40, y:gY-65, w:32, h:65, type:'ground', col:world.gl, gCol:world.acc};
  }

  // Set consistent pattern (double / with-coin / solo)
  const roll=Math.random();
  obs.withCoin = roll < 0.3;
  obs.t = obs.t||0;
  obstacles.push(obs);

  // Occasionally spawn double obstacle
  if(Math.random()<0.2 && G.dist>1500){
    const gap=U.ri(200,350);
    const obs2={...obs, x:obs.x+gap, withCoin:false, t:0};
    obstacles.push(obs2);
  }
}

function updateObstacles(){
  const spd = P.puActive.slowMo ? G.speed*0.45 : G.speed;
  for(let i=obstacles.length-1;i>=0;i--){
    const o=obstacles[i];
    o.t++;
    if(o.type==='falling'){
      o.y+=o.vy; o.vy+=0.18;
      if(o.y>_canvas.height+60){ obstacles.splice(i,1); continue; }
    } else if(o.type==='air'){
      o.y += Math.sin(o.t*0.06)*1.2; // hover
      o.x -= spd;
    } else if(o.type==='platform'){
      o.y += Math.sin(o.t*0.04)*o.vy;
      o.x -= spd;
    } else {
      o.x -= spd;
    }
    if(o.x+o.w < -60) { obstacles.splice(i,1); continue; }
    if(o.withCoin && o.x < _canvas.width-60){
      o.withCoin=false;
      spawnCoinLine(o.x+o.w+40, U.gY()-110, 5);
    }
  }
}

function drawObstacles(){
  const c=_ctx;
  obstacles.forEach(o=>{
    const alpha = o.blink ? (0.6+Math.sin(G.frame*0.25)*0.4) : 1;
    c.globalAlpha=alpha;
    glow(o.gCol, 18);
    if(o.round){
      const gr=c.createRadialGradient(o.x+o.w/2,o.y+o.h/2,0,o.x+o.w/2,o.y+o.h/2,o.w/2);
      gr.addColorStop(0,o.col); gr.addColorStop(1,'#000');
      c.fillStyle=gr;
      c.beginPath(); c.arc(o.x+o.w/2,o.y+o.h/2,o.w/2,0,Math.PI*2); c.fill();
    } else if(o.type==='falling'&&!o.round){
      c.fillStyle=o.col; rr(o.x,o.y,o.w,o.h,6); c.fill();
    } else {
      const g=c.createLinearGradient(o.x,o.y,o.x,o.y+o.h);
      g.addColorStop(0,o.col+'ee'); g.addColorStop(1,o.col+'55');
      c.fillStyle=g;
      rr(o.x,o.y,o.w,o.h,6); c.fill();
    }
    // Top cap accent
    if(o.type==='ground'||o.type==='slide_req'){
      c.fillStyle=o.gCol;
      c.fillRect(o.x,o.y,o.w,3);
    }
    noGlow();
    c.globalAlpha=1;
  });
}

// ════════════════════════════════════════════════════════════
// § 11  COINS
// ════════════════════════════════════════════════════════════
function spawnCoinLine(startX, y, n=5){
  for(let i=0;i<n;i++){
    coinItems.push({ x:startX+i*36, y, r:10, animT:i*8, collected:false });
  }
}

function spawnCoinArc(startX, y, n=6){
  for(let i=0;i<n;i++){
    const angle=Math.PI*i/(n-1);
    coinItems.push({
      x:startX+i*30, y:y-Math.sin(angle)*60, r:10, animT:i*6, collected:false,
    });
  }
}

function updateCoins(){
  const magnetRange = P.puActive.magnet ? 220 : 0;
  const spd = P.puActive.slowMo ? G.speed*0.45 : G.speed;
  for(let i=coinItems.length-1;i>=0;i--){
    const cn=coinItems[i];
    cn.x -= spd;
    cn.animT++;
    if(cn.collected){ coinItems.splice(i,1); continue; }
    if(cn.x<-30){ coinItems.splice(i,1); continue; }
    // Magnet pull
    if(magnetRange>0){
      const dx=P.x+P.w/2-cn.x, dy=P.y+P.h/2-cn.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<magnetRange){ cn.x+=dx/d*8; cn.y+=dy/d*8; }
    }
    // Collect
    const px=P.x+8, py=P.y+8, pw=P.w-16, ph=(P.sliding?C.SH:P.h)-16;
    if(cn.x+cn.r>px&&cn.x-cn.r<px+pw&&cn.y+cn.r>py&&cn.y-cn.r<py+ph){
      cn.collected=true;
      const val=10*(P.puActive.x2?2:1);
      G.coins+=val;
      G.score+=val;
      G.sessionCoins+=val;
      spawnParticles(cn.x,cn.y,'#fde68a',5,3,25);
      SFX.coin();
    }
  }
}

function drawCoins(){
  const c=_ctx;
  coinItems.forEach(cn=>{
    if(cn.collected) return;
    const bob=Math.sin(cn.animT*0.15)*3;
    const sc=0.9+Math.sin(cn.animT*0.1)*0.1;
    c.save();
    c.translate(cn.x,cn.y+bob);
    c.scale(sc,1);
    glow('#fbbf24',16);
    const g=c.createRadialGradient(0,0,0,0,0,cn.r);
    g.addColorStop(0,'#fde68a'); g.addColorStop(0.7,'#f59e0b'); g.addColorStop(1,'#d97706');
    c.fillStyle=g; c.beginPath(); c.arc(0,0,cn.r,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.4)';
    c.beginPath(); c.ellipse(-3,-3,4,3,-0.5,0,Math.PI*2); c.fill();
    noGlow(); c.restore();
  });
}

// ════════════════════════════════════════════════════════════
// § 12  POWER-UPS
// ════════════════════════════════════════════════════════════
function spawnPowerUp(){
  const def=U.pick(PU_TYPES);
  puItems.push({
    x:_canvas.width+50, y:U.gY()-U.ri(80,160),
    r:20, def, animT:0, collected:false,
  });
}

function updatePuItems(){
  const spd = P.puActive.slowMo ? G.speed*0.45 : G.speed;
  for(let i=puItems.length-1;i>=0;i--){
    const pu=puItems[i];
    pu.x-=spd; pu.animT++;
    if(pu.x<-60){ puItems.splice(i,1); continue; }
    if(pu.collected){ puItems.splice(i,1); continue; }
    const px=P.x+6,py=P.y+6,pw=P.w-12,ph=(P.sliding?C.SH:P.h)-12;
    if(pu.x+pu.r>px&&pu.x-pu.r<px+pw&&pu.y+pu.r>py&&pu.y-pu.r<py+ph){
      pu.collected=true;
      activatePowerUp(pu.def);
      spawnParticles(pu.x,pu.y,pu.def.col,20,5,50);
      showNotif(`${pu.def.icon} ${pu.def.label}!`, pu.def.col);
      SFX.powerup();
    }
  }
}

function drawPuItems(){
  const c=_ctx;
  puItems.forEach(pu=>{
    if(pu.collected) return;
    const bob=Math.sin(pu.animT*0.08)*5;
    const rot=pu.animT*0.04;
    c.save();
    c.translate(pu.x,pu.y+bob);
    c.rotate(rot);
    glow(pu.def.col,28);
    const g=c.createRadialGradient(0,0,0,0,0,pu.r);
    g.addColorStop(0,'#fff'); g.addColorStop(0.4,pu.def.col); g.addColorStop(1,pu.def.col+'44');
    c.fillStyle=g; c.beginPath(); c.arc(0,0,pu.r,0,Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=1.5;
    c.beginPath(); c.arc(0,0,pu.r,0,Math.PI*2); c.stroke();
    noGlow();
    c.font=`${pu.r*1.1}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(pu.def.icon,0,1);
    c.restore();
  });
}

function activatePowerUp(def){
  G.sessionPowerUps++;
  P.puActive[def.id]=true;
  P.puEnd[def.id]=performance.now()+def.dur;
  if(def.id==='rocket') P.vy=-8;
  updatePuBar();
}

function updateActivePowerUps(){
  const now=performance.now();
  Object.keys(P.puEnd).forEach(id=>{
    if(now>P.puEnd[id]){
      delete P.puActive[id];
      delete P.puEnd[id];
      updatePuBar();
    }
  });
}

function updatePuBar(){
  const bar=document.getElementById('ed-powerup-bar');
  if(!bar) return;
  bar.innerHTML='';
  Object.keys(P.puActive).forEach(id=>{
    const def=PU_TYPES.find(p=>p.id===id);
    if(!def) return;
    const pill=document.createElement('div');
    pill.className='ed-powerup-pill';
    pill.style.cssText=`color:${def.col};border-color:${def.col}44;background:${def.col}15`;
    pill.id=`ed-pu-${id}`;
    pill.innerHTML=`<span class="pu-icon">${def.icon}</span><div class="pu-timer"><div class="pu-timer-fill" id="ed-ptf-${id}"></div></div>`;
    bar.appendChild(pill);
  });
}

function tickPuBar(){
  const now=performance.now();
  Object.keys(P.puEnd).forEach(id=>{
    const fill=document.getElementById(`ed-ptf-${id}`);
    const def=PU_TYPES.find(p=>p.id===id);
    if(!fill||!def) return;
    const pct=((P.puEnd[id]-now)/def.dur)*100;
    fill.style.width=Math.max(0,pct)+'%';
  });
}

// ════════════════════════════════════════════════════════════
// § 13  BOSS EVENTS
// ════════════════════════════════════════════════════════════
const BOSS_TYPES=[
  { id:'robot',    name:'⚠️ BOSS INCOMING!',    col:'#6366f1', hp:8 },
  { id:'meteor',   name:'☄️ METEOR STORM!',     col:'#ef4444', hp:0 },
  { id:'alien',    name:'👾 ALIEN INVASION!',   col:'#4ade80', hp:5 },
  { id:'storm',    name:'⚡ STORM CHASE!',      col:'#facc15', hp:0 },
  { id:'train',    name:'🚂 LASER TRAIN!',      col:'#f97316', hp:6 },
];

function triggerBoss(){
  const bt=U.pick(BOSS_TYPES);
  Boss.active=true; Boss.type=bt.id; Boss.hp=bt.maxHp=bt.hp;
  Boss.x=_canvas.width+60; Boss.y=U.gY()-120; Boss.phase=0; Boss.timer=0;
  // Show boss warning
  const warn=document.getElementById('ed-boss-warning');
  if(warn){ warn.textContent=bt.name; warn.classList.add('show'); setTimeout(()=>warn.classList.remove('show'),2500); }
  SFX.boss();
  triggerShake(10,45);
  triggerCinematic(0.09);
  showNotif(bt.name,'#ef4444');
  // Spawn a wave of obstacles
  for(let i=0;i<6;i++) setTimeout(()=>spawnObstacle(), 600+i*400);
  G.lastBoss=G.dist;
}

function updateBoss(){
  if(!Boss.active) return;
  Boss.timer++;
  if(Boss.type==='robot'||Boss.type==='train'){
    Boss.x-=G.speed*0.4;
    // Robot fires lasers
    if(Boss.timer%60===0 && Boss.x>_canvas.width*0.5){
      obstacles.push({ x:Boss.x, y:U.gY()-80, w:6, h:80,
        type:'slide_req', col:'#ef4444', gCol:'#fca5a5', blink:true, t:0 });
    }
    if(Boss.x<-200) Boss.active=false;
  } else if(Boss.type==='meteor'){
    // Spawn meteors
    if(Boss.timer%35===0){
      obstacles.push({ x:U.rand(_canvas.width*0.3,_canvas.width), y:-40,
        w:46, h:46, type:'falling', col:'#dc2626', gCol:'#f97316', vy:3.5, round:true, t:0 });
    }
    if(Boss.timer>300) Boss.active=false;
  } else if(Boss.type==='storm'||Boss.type==='alien'){
    if(Boss.timer%45===0){
      obstacles.push({ x:_canvas.width+U.ri(0,150), y:-30,
        w:38, h:38, type:'falling', col:'#facc15', gCol:'#fde68a', vy:2.5, round:true, t:0 });
    }
    if(Boss.timer>360) Boss.active=false;
  }
}

function drawBoss(){
  if(!Boss.active) return;
  const c=_ctx;

  if(Boss.type==='robot'||Boss.type==='train'){
    const bw=80, bh=100;
    glow('#6366f1',30);
    c.fillStyle='#1e1b4b';
    rr(Boss.x,Boss.y,bw,bh,10); c.fill();
    c.strokeStyle='#6366f1'; c.lineWidth=2;
    rr(Boss.x,Boss.y,bw,bh,10); c.stroke();
    c.font='2.5rem serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(Boss.type==='train'?'🚂':'🤖',Boss.x+bw/2,Boss.y+bh/2);
    noGlow();
    return;
  }

  // Environmental events (meteor / alien / storm): persistent pulsing sky indicator
  const defs = { meteor:{icon:'☄️',col:'#ef4444'}, alien:{icon:'👾',col:'#4ade80'}, storm:{icon:'⚡',col:'#facc15'} };
  const d = defs[Boss.type]; if(!d) return;
  const W=_canvas.width;
  const pulse = 1 + Math.sin(Boss.timer*0.12)*0.12;
  c.save();
  c.globalAlpha = 0.85;
  glow(d.col, 24);
  c.font = `${2*pulse}rem serif`; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(d.icon, W*0.5, 90);
  noGlow();
  c.restore();
}

// ════════════════════════════════════════════════════════════
// § 14  PLAYER PHYSICS & INPUT
// ════════════════════════════════════════════════════════════
function initPlayer(){
  const gY=U.gY();
  P.x=U.pX()-C.PW/2; P.y=gY-C.PH;
  P.vy=0; P.grounded=true; P.jumps=2;
  P.sliding=false; P.slideT=0;
  P.dashing=false; P.dashT=0;
  P.airDashed=false; P.nearWall=null; P.wallBuffer=0;
  P.dead=false; P.invincible=false; P.invT=0;
  P.animT=0; P.trail=[];
  P.puActive={}; P.puEnd={};
  P.pst='run';
  P.equippedTrail=Progress.equippedTrail||'default';
  updatePuBar();
}

function trailColor(worldAcc){
  const t = TRAILS.find(x=>x.id===P.equippedTrail);
  if(!t || !t.col) return worldAcc;
  if(t.col==='rainbow'){ return `hsl(${(G.frame*4)%360},85%,65%)`; }
  return t.col;
}

const Input={
  keys:{}, _hj:false, _hs:false, _hd:false,
  init(){
    this._kd=e=>{
      // Remap capture (settings panel "press a key" flow) takes priority
      if(typeof Settings!=='undefined' && Settings._capturing){ Settings._captureKey(e.code); return; }
      this.keys[e.code]=true;
      const c=e.code;
      if((c==='Space'||c==='ArrowUp'||c==='KeyW'||c===Keybinds.jump)&&!this._hj){ this._hj=true; doJump(); }
      if((c==='ArrowDown'||c==='KeyS'||c==='ShiftLeft'||c===Keybinds.slide)&&!this._hs){ this._hs=true; doSlide(); }
      if(c==='KeyD'||c==='ArrowRight'||c===Keybinds.dash){ doAction(); }
      if(c==='Escape'||c==='KeyP') togglePause();
      e.preventDefault && (c==='Space'||c.startsWith('Arrow')) && e.preventDefault();
    };
    this._ku=e=>{ this.keys[e.code]=false; if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'||e.code===Keybinds.jump) this._hj=false; if(e.code==='ArrowDown'||e.code==='KeyS'||e.code==='ShiftLeft'||e.code===Keybinds.slide) this._hs=false; };
    window.addEventListener('keydown',this._kd);
    window.addEventListener('keyup',this._ku);
    this._initTouch();
  },
  destroy(){
    window.removeEventListener('keydown',this._kd);
    window.removeEventListener('keyup',this._ku);
    this._destroyTouch();
  },
  _initTouch(){
    const left=document.getElementById('ed-touch-jump');
    const slide=document.getElementById('ed-touch-slide');
    const dash=document.getElementById('ed-touch-dash');
    if(left){ left.addEventListener('touchstart',e=>{e.preventDefault();doJump()},{passive:false}); }
    if(slide){ slide.addEventListener('touchstart',e=>{e.preventDefault();doSlide()},{passive:false}); }
    if(dash){ dash.addEventListener('touchstart',e=>{e.preventDefault();doAction()},{passive:false}); }
    // Tap anywhere on canvas to jump
    _canvas&&_canvas.addEventListener('touchstart',e=>{e.preventDefault();doJump();},{passive:false});
  },
  _destroyTouch(){
    _canvas&&(_canvas.ontouchstart=null);
  },
};

// ════════════════════════════════════════════════════════════
// § GAMEPAD  (controller support, edge-detected polling)
// ════════════════════════════════════════════════════════════
const Gamepad = {
  _prevA:false, _prevB:false, _prevDown:false, _connected:false,
  poll(){
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && pads[0];
    if(!gp){ this._connected=false; return; }
    if(!this._connected){ this._connected=true; showNotif('🎮 Controller Connected','#4ade80'); }
    const a = gp.buttons[0] && gp.buttons[0].pressed;      // A / Cross — jump
    const b = (gp.buttons[1] && gp.buttons[1].pressed) ||  // B/Circle or right trigger — dash
              (gp.buttons[7] && gp.buttons[7].pressed);
    const down = (gp.buttons[13] && gp.buttons[13].pressed) || (gp.axes[1]||0) > 0.6; // dpad-down / stick-down — slide
    if(a && !this._prevA) doJump();
    if(b && !this._prevB) doAction();
    if(down && !this._prevDown) doSlide();
    this._prevA=a; this._prevB=b; this._prevDown=down;
  },
};

function doJump(){
  if(G.phase!=='playing'||P.dead) return;
  if(P.sliding){ P.sliding=false; P.h=C.PH; P.pst='run'; return; }
  if(P.puActive.rocket){ P.vy=-9; SFX.jump(); return; }
  if(P.nearWall){
    // Wall jump: kick off the wall, clear it, and grant a fresh air jump
    P.vy=C.WJ_Y; P.jumps=1;
    P.invincible=true; P.invT=14;
    P.nearWall=null; P.wallBuffer=0;
    P.pst='jump'; SFX.djump();
    triggerShake(4,14);
    spawnParticles(P.x+P.w/2, P.y+P.h*0.4, WORLDS[G.worldIdx].acc, 14, 6);
    return;
  }
  if(P.grounded||P.puActive.wingJump&&P.jumps>0){
    P.vy=C.JUMP; P.grounded=false; P.jumps--;
    P.pst='jump'; SFX.jump(); spawnParticles(P.x+P.w/2, P.y+P.h, WORLDS[G.worldIdx].acc, 6, 4);
  } else if(P.jumps>0){
    P.vy=C.DJUMP; P.jumps--;
    P.pst='jump'; SFX.djump();
    spawnParticles(P.x+P.w/2, P.y+P.h/2, WORLDS[G.worldIdx].acc, 10, 5);
  }
}

function doSlide(){
  if(G.phase!=='playing'||P.dead) return;
  if(!P.grounded||P.sliding) return;
  P.sliding=true; P.slideT=C.SLIDE_DUR;
  P.h=C.SH; P.y+=(C.PH-C.SH); P.pst='slide';
  SFX.slide();
}

function doAction(){
  if(G.phase!=='playing'||P.dead||P.dashing) return;
  G.sessionDashes++;
  if(!P.grounded){
    // Air Dash: one per airtime, brief burst that also cancels gravity
    if(P.airDashed) return;
    P.airDashed=true;
    P.dashing=true; P.dashT=C.AIRDASH_DUR;
    P.vy=-1.5;
    P.invincible=true; P.invT=C.AIRDASH_DUR+5;
    P.pst='dash'; SFX.dash();
    triggerShake(3,10);
    spawnParticles(P.x+P.w/2,P.y+P.h/2,'#e879f9',20,7);
    showNotif('🌀 Air Dash!','#e879f9');
  } else {
    // Ground Dash
    P.dashing=true; P.dashT=C.DASH_DUR;
    P.invincible=true; P.invT=C.DASH_DUR+5;
    P.pst='dash'; SFX.dash();
    spawnParticles(P.x+P.w/2,P.y+P.h/2,WORLDS[G.worldIdx].acc,15,6);
  }
}

function updatePlayer(){
  if(P.dead){
    P.vy+=C.GRAVITY*2; P.y+=P.vy;
    P.animT++;
    return;
  }

  const gY=U.gY();

  // Slide timer
  if(P.sliding){
    P.slideT--;
    if(P.slideT<=0){ P.sliding=false; P.h=C.PH; P.y-=(C.PH-C.SH); P.pst='run'; }
  }

  // Dash
  if(P.dashing){
    P.dashT--;
    if(P.dashT<=0){ P.dashing=false; }
  }

  // Invincibility
  if(P.invincible){ P.invT--; if(P.invT<=0) P.invincible=false; }

  // Rocket hover
  if(P.puActive.rocket){
    const targetY=gY-C.PH-120;
    P.y=U.lerp(P.y,targetY,0.12);
    P.vy=0; P.grounded=false;
  } else {
    // Gravity
    P.vy+=C.GRAVITY;
    P.y+=P.vy;
  }

  // Ground collision
  const bottom=gY-P.h;
  if(P.y>=bottom){
    const wasAir=!P.grounded;
    P.y=bottom; P.vy=0; P.grounded=true;
    P.jumps=2; P.airDashed=false; P.nearWall=null;
    if(wasAir){ SFX.land(); spawnParticles(P.x+P.w/2, gY, WORLDS[G.worldIdx].gl, 5, 3); }
    if(!P.sliding&&!P.dashing) P.pst='run';
  } else { P.grounded=false; }

  // Trail for dash
  if(P.dashing||P.puActive.rocket){
    P.trail.push({x:P.x,y:P.y});
    if(P.trail.length>8) P.trail.shift();
  } else { P.trail=[]; }

  // Update anim
  P.animT++;
  if(!P.sliding&&!P.dashing&&P.grounded) P.pst='run';
  else if(!P.grounded&&!P.sliding) P.pst='jump';
}

function checkCollisions(){
  if(P.dead||P.invincible||P.puActive.shield||P.puActive.star) return;
  const gY=U.gY();
  const ph=P.sliding?C.SH:P.h;
  const hitbox={ x:P.x+7, y:P.y+5, w:P.w-14, h:ph-10 };
  let touchedWall=false;

  for(const o of obstacles){
    let ohb;
    if(o.type==='falling'||o.type==='platform'){
      ohb=U.shrink(o,6);
    } else {
      ohb=U.shrink(o,5);
    }
    if(U.overlap(hitbox,ohb)){
      // If platform: land on top
      if(o.type==='platform'&&P.vy>=0&&hitbox.y+hitbox.h-P.vy<ohb.y+4){
        P.y=ohb.y-ph; P.vy=0; P.grounded=true; P.jumps=2;
        if(P.pst!=='run'&&!P.sliding) P.pst='run';
        continue;
      }
      // Wall-jumpable obstacle: grant a short window to wall-jump instead of instant death
      if(o.wallJump && !P.grounded && P.vy>=-2){
        touchedWall=true;
        if(P.nearWall===o){
          P.wallBuffer--;
          if(P.wallBuffer<=0){ killPlayer(); return; }
        } else {
          P.nearWall=o; P.wallBuffer=C.WALLJUMP_BUFFER;
        }
        continue;
      }
      killPlayer(); return;
    }
  }
  if(!touchedWall) P.nearWall=null;
}

function killPlayer(){
  if(P.dead) return;
  P.dead=true; P.pst='dead'; P.vy=-8;
  triggerShake(14,40);
  SFX.death();
  spawnParticles(P.x+P.w/2,P.y+P.h/2,'#ef4444',30,8,60);
  spawnParticles(P.x+P.w/2,P.y+P.h/2,WORLDS[G.worldIdx].acc,20,6,50);
  setTimeout(()=>showGameOver(), 1200);
}

// ════════════════════════════════════════════════════════════
// § 15  SCREEN SHAKE
// ════════════════════════════════════════════════════════════
function triggerShake(intensity, life){
  G.shake.intensity=intensity; G.shake.life=life;
}

function triggerCinematic(amount){
  G.camPunch = amount;
}

function updateCamera(){
  const targetZoom = 1 - (G.speed/C.MAX_SPD)*C.FOV_MAX;
  G.camZoom = U.lerp(G.camZoom, targetZoom, 0.02);
  if(G.camPunch>0.001) G.camPunch *= 0.90; else G.camPunch = 0;
}

function applyCamera(){
  const W=_canvas.width, H=_canvas.height;
  const zoom = G.camZoom + G.camPunch;
  _ctx.translate(W/2, H*0.62);
  _ctx.scale(zoom, zoom);
  _ctx.translate(-W/2, -H*0.62);
}

function applyShake(){
  if(G.shake.life>0){
    const t=G.shake.life/40;
    G.shake.x=(Math.random()-0.5)*G.shake.intensity*t;
    G.shake.y=(Math.random()-0.5)*G.shake.intensity*t;
    G.shake.life--;
  } else { G.shake.x=0; G.shake.y=0; }
  _ctx.translate(G.shake.x, G.shake.y);
}

// ════════════════════════════════════════════════════════════
// § 16  NOTIFICATIONS
// ════════════════════════════════════════════════════════════
function showNotif(text, col='#a78bfa'){
  const box=document.getElementById('ed-notifications');
  if(!box) return;
  const el=document.createElement('div');
  el.className='ed-notif';
  el.style.cssText=`color:${col};border-color:${col}44;background:${col}12`;
  el.textContent=text;
  box.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

// ════════════════════════════════════════════════════════════
// § 17  SAVE SYSTEM
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// § PROGRESSION  (levels, achievements, daily missions)
// ════════════════════════════════════════════════════════════
const ACHIEVEMENT_DEFS = {
  first_run: { icon:'🎮', label:'First Run' },
  score_1k:  { icon:'🥉', label:'Score 1,000' },
  score_5k:  { icon:'🥈', label:'Score 5,000' },
  score_10k: { icon:'🥇', label:'Score 10,000' },
  runs_10:   { icon:'🏃', label:'10 Runs Completed' },
  runs_50:   { icon:'🏆', label:'50 Runs Completed' },
};

const MISSION_POOL = [
  { id:'coins100',   desc:'Collect 100 coins in one run',   type:'coins', target:100 },
  { id:'dist2000',   desc:'Reach 2000m in a single run',    type:'dist',  target:2000 },
  { id:'dash10',     desc:'Perform 10 dashes in one run',   type:'dash',  target:10 },
  { id:'powerups3',  desc:'Collect 3 power-ups in one run', type:'pu',    target:3 },
  { id:'coins250',   desc:'Collect 250 coins in one run',   type:'coins', target:250 },
];

function todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function dailyMissionDef(){
  const d=new Date();
  const doy=Math.floor((d - new Date(d.getFullYear(),0,0))/86400000);
  return MISSION_POOL[doy % MISSION_POOL.length];
}
function calcLevel(xp){ return Math.floor(1 + Math.sqrt(Math.max(0,xp)/40)); }

const Progress = { totalXP:0, totalCoins:0, level:1, equippedTrail:'default', best:0 };

const Save={
  KEY:'eylox_dash_save',
  load(){
    try{ const d=JSON.parse(localStorage.getItem(this.KEY)||'{}');
      G.best=d.best||0;
      Progress.totalXP=d.totalXP||0;
      Progress.totalCoins=d.totalCoins||0;
      Progress.level=calcLevel(Progress.totalXP);
      Progress.equippedTrail=d.equippedTrail||'default';
      Progress.best=d.best||0;
      return d;
    }catch{ return {}; }
  },
  save(){
    try{
      const existing=JSON.parse(localStorage.getItem(this.KEY)||'{}');
      const d={
        best:Math.max(G.best,G.score),
        totalCoins:(existing.totalCoins||0)+G.sessionCoins,
        totalXP:(existing.totalXP||0)+G.sessionXP,
        totalRuns:(existing.totalRuns||0)+1,
        lastRun:Date.now(),
        bestDist:Math.max(existing.bestDist||0,Math.floor(G.dist)),
        achievements:existing.achievements||[],
        equippedTrail: existing.equippedTrail||'default',
        daily: existing.daily||{},
      };
      // Achievements — track newly unlocked this run for toast display
      const before=d.achievements.length;
      if(G.score>0&&!d.achievements.includes('first_run')) d.achievements.push('first_run');
      if(G.score>=1000&&!d.achievements.includes('score_1k')) d.achievements.push('score_1k');
      if(G.score>=5000&&!d.achievements.includes('score_5k')) d.achievements.push('score_5k');
      if(G.score>=10000&&!d.achievements.includes('score_10k')) d.achievements.push('score_10k');
      if(d.totalRuns>=10&&!d.achievements.includes('runs_10')) d.achievements.push('runs_10');
      if(d.totalRuns>=50&&!d.achievements.includes('runs_50')) d.achievements.push('runs_50');
      this.newlyUnlocked = d.achievements.slice(before);

      // Daily mission progress (best-of across runs same day)
      const mDef=dailyMissionDef(), key=todayKey();
      if(!d.daily.date || d.daily.date!==key){ d.daily={ date:key, id:mDef.id, progress:0, claimed:false }; }
      const runVal = mDef.type==='coins'?G.sessionCoins : mDef.type==='dist'?Math.floor(G.dist)
                   : mDef.type==='dash'?G.sessionDashes : G.sessionPowerUps;
      d.daily.progress=Math.max(d.daily.progress||0, runVal);
      this.missionJustCompleted = !d.daily.claimed && d.daily.progress>=mDef.target;
      if(this.missionJustCompleted){
        d.daily.claimed=true;
        d.totalCoins += 150; d.totalXP += 50;
      }

      localStorage.setItem(this.KEY,JSON.stringify(d));
      G.best=d.best;
      Progress.totalXP=d.totalXP; Progress.totalCoins=d.totalCoins;
      Progress.level=calcLevel(d.totalXP); Progress.best=d.best;
      // Sync to main eylox user data
      this._syncToUser(d);
    }catch{}
  },
  _syncToUser(d){
    try{
      const user=JSON.parse(localStorage.getItem('eylox_user')||'{}');
      // Cap offline rewards
      const addCoins=Math.min(G.sessionCoins, C.MAX_COINS);
      user.coins=(user.coins||0)+addCoins;
      const syncQueue=JSON.parse(localStorage.getItem('eylox_sync_queue')||'[]');
      syncQueue.push({ method:'POST',path:'/dash/session',body:{
        score:G.score, coins:addCoins, xp:G.sessionXP, dist:Math.floor(G.dist),
      }, id:Date.now(), ts:Date.now() });
      localStorage.setItem('eylox_sync_queue',JSON.stringify(syncQueue.slice(-100)));
      localStorage.setItem('eylox_user',JSON.stringify(user));
    }catch{}
  },
};

// ════════════════════════════════════════════════════════════
// § SETTINGS  (colorblind mode, custom keybinds — persisted)
// ════════════════════════════════════════════════════════════
const Settings = {
  KEY:'eylox_dash_settings',
  colorblind:false,
  _capturing:null,
  load(){
    try{
      const s=JSON.parse(localStorage.getItem(this.KEY)||'{}');
      this.colorblind = !!s.colorblind;
      Keybinds = { ...DEFAULT_KEYBINDS, ...(s.keybinds||{}) };
      this.apply();
    }catch{}
  },
  save(){
    try{
      localStorage.setItem(this.KEY, JSON.stringify({ colorblind:this.colorblind, keybinds:Keybinds }));
    }catch{}
  },
  apply(){
    document.body.classList.toggle('ed-colorblind', this.colorblind);
  },
  toggleColorblind(){
    this.colorblind = !this.colorblind;
    this.apply(); this.save();
  },
  beginCapture(action, btnEl){
    this._capturing = { action, btnEl };
    btnEl.textContent = 'Press a key…';
    btnEl.classList.add('listening');
  },
  _captureKey(code){
    const cap=this._capturing; if(!cap) return;
    Keybinds[cap.action]=code;
    cap.btnEl.textContent=code;
    cap.btnEl.classList.remove('listening');
    this._capturing=null;
    this.save();
  },
};

// ════════════════════════════════════════════════════════════
// § PROGRESSION UI  (level badge, trail selector, daily mission)
// ════════════════════════════════════════════════════════════
function persistEquippedTrail(){
  try{
    const d=JSON.parse(localStorage.getItem(Save.KEY)||'{}');
    d.equippedTrail=Progress.equippedTrail;
    localStorage.setItem(Save.KEY, JSON.stringify(d));
  }catch{}
}

function cycleTrail(dir){
  const ids=TRAILS.map(t=>t.id);
  let idx=ids.indexOf(Progress.equippedTrail);
  for(let i=0;i<ids.length;i++){
    idx=(idx+dir+ids.length)%ids.length;
    const t=TRAILS[idx];
    if(trailUnlocked(t,Progress.best)){ Progress.equippedTrail=t.id; break; }
  }
  updateTrailUI();
  persistEquippedTrail();
}

function updateTrailUI(){
  const nameEl=document.getElementById('ed-trail-name');
  if(!nameEl) return;
  const t=TRAILS.find(x=>x.id===Progress.equippedTrail) || TRAILS[0];
  nameEl.textContent=t.name;
  nameEl.style.color = t.col && t.col!=='rainbow' ? t.col : (t.col==='rainbow'?'#e879f9':'#a78bfa');
  const hintEl=document.getElementById('ed-trail-hint');
  if(hintEl){
    const nextLocked=TRAILS.find(x=>!trailUnlocked(x,Progress.best));
    hintEl.textContent = nextLocked ? `🔒 Next: ${nextLocked.name} at ${nextLocked.unlock.toLocaleString()} score` : '✨ All trails unlocked!';
  }
}

function updateLevelUI(){
  const el=document.getElementById('ed-level-badge');
  if(el) el.textContent=`LV ${Progress.level}`;
  const hudEl=document.getElementById('ed-hud-level');
  if(hudEl) hudEl.textContent=`LV ${Progress.level}`;
}

function updateMissionUI(){
  const descEl=document.getElementById('ed-mission-desc');
  if(!descEl) return;
  try{
    const d=JSON.parse(localStorage.getItem(Save.KEY)||'{}');
    const mDef=dailyMissionDef();
    const key=todayKey();
    const daily=(d.daily&&d.daily.date===key&&d.daily.id===mDef.id) ? d.daily : {progress:0,claimed:false};
    const pct=Math.min(100,Math.floor((daily.progress/mDef.target)*100));
    descEl.textContent=mDef.desc;
    const fillEl=document.getElementById('ed-mission-fill');
    if(fillEl) fillEl.style.width=pct+'%';
    const statusEl=document.getElementById('ed-mission-status');
    if(statusEl) statusEl.textContent = daily.claimed ? '✅ Claimed' : `${Math.min(daily.progress,mDef.target)}/${mDef.target}`;
  }catch{}
}

// ════════════════════════════════════════════════════════════
// § 18  HUD
// ════════════════════════════════════════════════════════════
function updateHUD(){
  const scoreEl=document.getElementById('ed-score');
  const bestEl=document.getElementById('ed-best');
  const coinsEl=document.getElementById('ed-coins-val');
  const worldEl=document.getElementById('ed-world');
  if(scoreEl) scoreEl.textContent=Math.floor(G.score).toLocaleString();
  if(bestEl)  bestEl.textContent='BEST '+Math.floor(G.best).toLocaleString();
  if(coinsEl) coinsEl.textContent=G.coins;
  if(worldEl) worldEl.textContent=WORLDS[G.worldIdx].name;
  tickPuBar();
}

// ════════════════════════════════════════════════════════════
// § 19  WORLD TRANSITION
// ════════════════════════════════════════════════════════════
function advanceWorld(){
  G.worldIdx=(G.worldIdx+1)%WORLDS.length;
  SFX.worldChg();
  triggerCinematic(0.06);
  showNotif(`Entering ${WORLDS[G.worldIdx].name}`, WORLDS[G.worldIdx].acc);
  // Flash
  const fl=document.getElementById('ed-world-flash');
  if(fl){ fl.classList.add('flash'); setTimeout(()=>fl.classList.remove('flash'),300); }
  initBg();
  initWeather();
}

// ════════════════════════════════════════════════════════════
// § 20  GAME LOOP
// ════════════════════════════════════════════════════════════
function startGame(){
  G.phase='playing';
  G.score=0; G.coins=0; G.dist=0; G.speed=C.BASE_SPD;
  G.worldIdx=0; G.frame=0; G.lastBoss=0;
  G.spawnDist=0; G.coinDist=0; G.puDist=0;
  G.sessionCoins=0; G.sessionXP=0;
  G.sessionDashes=0; G.sessionPowerUps=0;
  G.camZoom=1; G.camPunch=0;
  obstacles=[]; coinItems=[]; puItems=[]; particles=[];
  Boss.active=false;
  initPlayer();
  initBg();
  initWeather();
  hideSplash();
  hideGameOver();
  updateLevelUI();
  Music.start();
  _canvas.focus();
}

function resetGame(){ startGame(); }

function togglePause(){
  if(G.phase==='playing'){ G.phase='paused'; Music.stop(); showPause(); }
  else if(G.phase==='paused'){ G.phase='playing'; Music.start(); hidePause(); }
}

function showPause(){
  const el=document.getElementById('ed-pause-overlay');
  if(el) el.classList.add('visible');
}
function hidePause(){
  const el=document.getElementById('ed-pause-overlay');
  if(el) el.classList.remove('visible');
}

function tick(ts){
  _raf=requestAnimationFrame(tick);
  const dt=Math.min((ts-_lastT)/16.67,3);
  _lastT=ts;
  if(G.phase==='paused'||G.phase==='reconnecting') return;
  if(G.phase==='splash') { renderSplash(ts); return; }
  update(dt);
  render();
}

function update(dt){
  G.frame++;

  if(G.phase!=='playing') return;

  Gamepad.poll();

  // Speed ramp
  if(!P.puActive.slowMo&&!P.puActive.rocket){
    G.speed=Math.min(G.speed+C.SPD_RATE*G.frame*0.001*60, C.MAX_SPD);
  }
  Music.setBPM(90 + (G.speed/C.MAX_SPD)*100);

  // Distance & score
  const actualSpd = P.puActive.slowMo ? G.speed*0.45 : G.speed;
  G.dist += actualSpd * 0.5;
  G.score += actualSpd * 0.25;
  G.sessionXP += 0.01;
  if(G.score>G.best) G.best=G.score;

  // World transition
  if(G.dist > C.WORLD_DIST * (G.worldIdx+1)){ advanceWorld(); }

  // Boss trigger
  if(G.dist>C.BOSS_DIST&&G.dist-G.lastBoss>C.BOSS_DIST){ triggerBoss(); }

  // Spawn obstacles
  G.spawnDist++;
  const gap = U.clamp(C.OBS_GAP - G.speed*6, 160, C.OBS_GAP);
  if(G.spawnDist % Math.floor(gap) === 0) spawnObstacle();

  // Spawn coins
  G.coinDist++;
  if(G.coinDist % C.COIN_FREQ === 0){
    const gY=U.gY();
    if(Math.random()<0.5) spawnCoinLine(_canvas.width+40, gY-U.ri(60,120), U.ri(3,7));
    else spawnCoinArc(_canvas.width+40, gY-80, U.ri(4,7));
  }

  // Spawn power-ups
  G.puDist++;
  if(G.puDist % C.PU_FREQ === 0 && G.dist>800) spawnPowerUp();

  // Update everything
  scrollBg(actualSpd);
  updatePlayer();
  updateObstacles();
  updateCoins();
  updatePuItems();
  updateActivePowerUps();
  updateBoss();
  updateParticles();
  updateCamera();
  if(!P.dead) checkCollisions();
  if(P.dashing||P.puActive.rocket) spawnTrailParticle();
  updateHUD();
}

function render(){
  const c=_ctx, W=_canvas.width, H=_canvas.height;
  c.clearRect(0,0,W,H);
  c.save();
  applyShake();
  applyCamera();

  drawBackground();
  drawParticles();
  drawObstacles();
  drawCoins();
  drawPuItems();
  drawBoss();

  // Draw player
  const ph=P.sliding?C.SH:P.h;
  const invFlash=P.invincible&&G.frame%4<2;
  if(!invFlash){
    drawLux(P.x,P.y,P.w,ph,P.animT,P.pst,P.puActive);
  }

  c.restore();
}

// Splash screen idle animation
function renderSplash(ts){
  const c=_ctx, W=_canvas.width, H=_canvas.height;
  c.clearRect(0,0,W,H);

  // Animated starfield
  const t=ts*0.001;
  const sky=c.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#03010c'); sky.addColorStop(1,'#0a0020');
  c.fillStyle=sky; c.fillRect(0,0,W,H);

  // Floating particles
  for(let i=0;i<80;i++){
    const sx=(Math.sin(i*2.4+t*0.3)*0.5+0.5)*W;
    const sy=(Math.sin(i*1.7+t*0.2)*0.5+0.5)*H;
    const sr=0.5+Math.sin(i+t)*1;
    c.globalAlpha=0.15+Math.sin(i+t*0.5)*0.1;
    c.fillStyle='#a855f7'; c.beginPath(); c.arc(sx,sy,sr,0,Math.PI*2); c.fill();
  }
  c.globalAlpha=1;

  // Ground glow line
  glow('#7c3aed',20); c.strokeStyle='#7c3aed'; c.lineWidth=2;
  c.beginPath(); c.moveTo(0,H*0.78); c.lineTo(W,H*0.78); c.stroke(); noGlow();
}

// ════════════════════════════════════════════════════════════
// § 21  SCREENS
// ════════════════════════════════════════════════════════════
function showSplash(){
  const el=document.getElementById('ed-splash');
  if(el){ el.classList.remove('hidden'); }
  updateLevelUI();
  updateTrailUI();
  updateMissionUI();
}

function hideSplash(){
  const el=document.getElementById('ed-splash');
  if(el){ el.classList.add('hidden'); }
}

function showGameOver(){
  G.phase='dead';
  Save.save();
  const el=document.getElementById('ed-gameover');
  if(!el) return;
  document.getElementById('ed-go-score').textContent=Math.floor(G.score).toLocaleString();
  document.getElementById('ed-go-coins').textContent=G.coins;
  document.getElementById('ed-go-dist').textContent=Math.floor(G.dist)+'m';
  const isNew=G.score>=G.best;
  const nb=document.getElementById('ed-go-new-best');
  if(nb) nb.style.display=isNew&&G.score>0?'inline-flex':'none';
  const rw=document.getElementById('ed-go-rewards');
  const cap=Math.min(G.sessionCoins,C.MAX_COINS);
  let rewardTxt=`🎁 Earned: +${cap} Coins  •  +${Math.floor(G.sessionXP)} XP`;
  if(Save.missionJustCompleted) rewardTxt+='  •  +150 Mission Bonus';
  if(rw) rw.textContent=rewardTxt;
  el.classList.add('visible');
  Music.stop();

  // Achievement / mission toasts, staggered so they don't overlap
  let delay=300;
  (Save.newlyUnlocked||[]).forEach(id=>{
    const def=ACHIEVEMENT_DEFS[id];
    if(!def) return;
    setTimeout(()=>showNotif(`${def.icon} Achievement: ${def.label}`, '#fbbf24'), delay);
    delay+=900;
  });
  if(Save.missionJustCompleted){
    setTimeout(()=>showNotif('📋 Daily Mission Complete!', '#4ade80'), delay);
  }
}

function hideGameOver(){
  const el=document.getElementById('ed-gameover');
  if(el) el.classList.remove('visible');
}

function showReconnect(){
  G.phase='reconnecting';
  Music.stop();
  hidePause();
  const el=document.getElementById('ed-reconnect');
  if(el) el.classList.add('visible');
}

function hideReconnect(){
  const el=document.getElementById('ed-reconnect');
  if(el) el.classList.remove('visible');
}

// ════════════════════════════════════════════════════════════
// § 22  DOM BUILDER
// ════════════════════════════════════════════════════════════
function buildDOM(){
  if(document.getElementById('eylox-dash-overlay')) return;

  _overlay=document.createElement('div');
  _overlay.id='eylox-dash-overlay';
  _overlay.innerHTML=`
    <canvas id="eylox-dash-canvas" tabindex="0"></canvas>

    <!-- HUD -->
    <div id="ed-hud">
      <div class="ed-hud-left">
        <div>
          <div class="ed-hud-score" id="ed-score">0</div>
          <div class="ed-hud-best" id="ed-best">BEST 0</div>
        </div>
        <div class="ed-hud-level" id="ed-hud-level">LV 1</div>
      </div>
      <div class="ed-hud-right">
        <div class="ed-hud-world" id="ed-world">🌆 Neon City</div>
        <div class="ed-hud-coins">
          <span class="ed-hud-coins-icon">🪙</span>
          <span class="ed-hud-coins-val" id="ed-coins-val">0</span>
        </div>
      </div>
    </div>

    <!-- Power-up bar -->
    <div id="ed-powerup-bar"></div>

    <!-- Notifications -->
    <div id="ed-notifications"></div>

    <!-- World flash -->
    <div id="ed-world-flash"></div>

    <!-- Boss warning -->
    <div id="ed-boss-warning"></div>

    <!-- Pause overlay -->
    <div id="ed-pause-overlay">⏸ PAUSED</div>

    <!-- Reconnect overlay -->
    <div id="ed-reconnect">
      <div class="ed-rc-icon">✅</div>
      <div class="ed-rc-title">Connection Restored</div>
      <div class="ed-rc-sub">Synchronising your progress...</div>
      <div class="ed-rc-bar"><div class="ed-rc-bar-fill"></div></div>
    </div>

    <!-- Splash screen -->
    <div id="ed-splash">
      <button class="ed-settings-gear" id="ed-settings-gear" aria-label="Settings">⚙</button>
      <div class="ed-level-badge" id="ed-level-badge">LV 1</div>
      <div class="ed-splash-signal">📡</div>
      <div class="ed-splash-title">Connection Lost</div>
      <div class="ed-splash-sub">We're reconnecting you to EYLOX. Until then...</div>
      <div class="ed-splash-tagline">🏃 Keep Running.</div>
      <div class="ed-splash-mascot" id="ed-splash-mascot-wrap">
        <canvas id="ed-mascot-canvas" width="200" height="200"></canvas>
      </div>

      <div class="ed-trail-selector">
        <button class="ed-trail-arrow" id="ed-trail-prev">◀</button>
        <div class="ed-trail-info">
          <div class="ed-trail-name" id="ed-trail-name">World Default</div>
          <div class="ed-trail-hint" id="ed-trail-hint"></div>
        </div>
        <button class="ed-trail-arrow" id="ed-trail-next">▶</button>
      </div>

      <button class="ed-splash-play" id="ed-play-btn">▶  PLAY</button>
      <div class="ed-splash-hint">SPACE / TAP — Jump &nbsp;·&nbsp; ↓ — Slide &nbsp;·&nbsp; D — Dash</div>

      <div class="ed-mission-panel" id="ed-mission-panel">
        <div class="ed-mission-head">📋 Daily Mission</div>
        <div class="ed-mission-desc" id="ed-mission-desc">Loading…</div>
        <div class="ed-mission-bar"><div class="ed-mission-fill" id="ed-mission-fill"></div></div>
        <div class="ed-mission-status" id="ed-mission-status">0/0</div>
      </div>
    </div>

    <!-- Settings panel -->
    <div id="ed-settings-panel">
      <div class="ed-settings-card">
        <div class="ed-settings-title">Settings</div>

        <div class="ed-settings-row">
          <span>Colorblind Mode</span>
          <button class="ed-toggle" id="ed-cb-toggle">OFF</button>
        </div>

        <div class="ed-settings-row">
          <span>Jump</span>
          <button class="ed-keybind-btn" id="ed-kb-jump">Space</button>
        </div>
        <div class="ed-settings-row">
          <span>Slide</span>
          <button class="ed-keybind-btn" id="ed-kb-slide">ArrowDown</button>
        </div>
        <div class="ed-settings-row">
          <span>Dash</span>
          <button class="ed-keybind-btn" id="ed-kb-dash">KeyD</button>
        </div>

        <button class="ed-settings-close" id="ed-settings-close">Close</button>
      </div>
    </div>

    <!-- Game Over -->
    <div id="ed-gameover">
      <div class="ed-go-card">
        <div class="ed-go-title">Game Over</div>
        <div class="ed-go-distance" id="ed-go-dist">0m</div>
        <div class="ed-go-new-best" id="ed-go-new-best" style="display:none">🏆 New Best!</div>
        <div class="ed-go-score-row">
          <div class="ed-go-stat"><div class="ed-go-stat-val" id="ed-go-score">0</div><div class="ed-go-stat-lbl">Score</div></div>
          <div class="ed-go-stat"><div class="ed-go-stat-val" id="ed-go-coins">0</div><div class="ed-go-stat-lbl">Coins</div></div>
        </div>
        <div class="ed-go-rewards" id="ed-go-rewards">🎁 Earned: 0 Coins</div>
        <button class="ed-go-play-btn" id="ed-go-play">▶  Play Again</button>
        <button class="ed-go-quit-btn" id="ed-go-quit">Return to EYLOX</button>
      </div>
    </div>

    <!-- Touch controls -->
    <div id="ed-touch-controls">
      <div class="ed-touch-left">
        <div class="ed-touch-btn" id="ed-touch-jump">⬆</div>
      </div>
      <div class="ed-touch-right">
        <div class="ed-touch-btn" id="ed-touch-slide">⬇</div>
        <div class="ed-touch-btn" id="ed-touch-dash">⚡</div>
      </div>
    </div>

    <!-- Colorblind SVG filter (hidden) -->
    <svg style="display:none">
      <defs>
        <filter id="ed-cb-filter">
          <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"/>
        </filter>
      </defs>
    </svg>
  `;

  document.body.appendChild(_overlay);
  _canvas = document.getElementById('eylox-dash-canvas');
  _ctx    = _canvas.getContext('2d');

  // Canvas size
  function resize(){
    if(!_canvas) return;
    _canvas.width  = _overlay.clientWidth  || window.innerWidth;
    _canvas.height = _overlay.clientHeight || window.innerHeight;
    if(G.phase==='playing') initBg();
  }
  window.addEventListener('resize', resize);
  resize();

  // Splash mascot mini canvas animation
  animateSplashMascot();

  // Buttons
  document.getElementById('ed-play-btn').addEventListener('click',()=>{ ac(); startGame(); });
  document.getElementById('ed-go-play').addEventListener('click',()=>{ ac(); resetGame(); });
  document.getElementById('ed-go-quit').addEventListener('click',()=>hide());

  // Trail selector
  document.getElementById('ed-trail-prev').addEventListener('click',()=>cycleTrail(-1));
  document.getElementById('ed-trail-next').addEventListener('click',()=>cycleTrail(1));

  // Settings panel
  const settingsPanel=document.getElementById('ed-settings-panel');
  const cbToggle=document.getElementById('ed-cb-toggle');
  document.getElementById('ed-settings-gear').addEventListener('click',()=>{
    cbToggle.textContent = Settings.colorblind ? 'ON' : 'OFF';
    cbToggle.classList.toggle('on', Settings.colorblind);
    document.getElementById('ed-kb-jump').textContent = Keybinds.jump;
    document.getElementById('ed-kb-slide').textContent = Keybinds.slide;
    document.getElementById('ed-kb-dash').textContent = Keybinds.dash;
    settingsPanel.classList.add('visible');
  });
  document.getElementById('ed-settings-close').addEventListener('click',()=>settingsPanel.classList.remove('visible'));
  cbToggle.addEventListener('click',()=>{
    Settings.toggleColorblind();
    cbToggle.textContent = Settings.colorblind ? 'ON' : 'OFF';
    cbToggle.classList.toggle('on', Settings.colorblind);
  });
  [['jump','ed-kb-jump'],['slide','ed-kb-slide'],['dash','ed-kb-dash']].forEach(([action,id])=>{
    document.getElementById(id).addEventListener('click',function(){ Settings.beginCapture(action, this); });
  });

  Input.init();
}

function animateSplashMascot(){
  const mc=document.getElementById('ed-mascot-canvas');
  if(!mc) return;
  const mctx=mc.getContext('2d');
  let t=0;
  function draw(){
    if(!document.getElementById('eylox-dash-overlay')) return;
    // Only draw on the mini canvas while splash is visible
    if(G.phase!=='splash'){ requestAnimationFrame(draw); return; }
    mctx.clearRect(0,0,200,200);
    mctx.save();
    const bg=mctx.createRadialGradient(100,100,10,100,100,90);
    bg.addColorStop(0,'rgba(124,58,237,0.18)'); bg.addColorStop(1,'transparent');
    mctx.fillStyle=bg; mctx.beginPath(); mctx.arc(100,100,90,0,Math.PI*2); mctx.fill();
    const real=_ctx; _ctx=mctx;
    const bob=Math.sin(t*0.05)*8;
    drawLux(80,62+bob,40,58,t,'run',{});
    _ctx=real;
    mctx.restore();
    t++;
    requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// § 23  OVERLAY LIFECYCLE
// ════════════════════════════════════════════════════════════
function launch(){
  if(_active) return;
  _active=true;
  _savedURL=location.href;

  Settings.load();
  buildDOM();
  Save.load();

  // Fade in
  requestAnimationFrame(()=>{
    _overlay.classList.add('active');
  });

  showSplash();
  G.phase='splash';

  // Start render loop for splash animation
  _lastT=performance.now();
  if(_raf) cancelAnimationFrame(_raf);
  _raf=requestAnimationFrame(tick);
}

function hide(){
  if(!_active) return;
  Save.save();
  Music.stop();
  Input.destroy();
  if(_raf){ cancelAnimationFrame(_raf); _raf=null; }
  _overlay.classList.remove('active');
  setTimeout(()=>{
    if(_overlay&&_overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay=null; _canvas=null; _ctx=null;
    _active=false;
    obstacles=[]; coinItems=[]; puItems=[]; particles=[];
  }, 800);
}

function handleReconnect(){
  if(!_active) return;
  Save.save();
  Music.stop();
  G.phase='reconnecting';
  hidePause();
  hideGameOver();
  showReconnect();
  // After sync animation, close
  setTimeout(()=>{
    hideReconnect();
    setTimeout(()=>hide(), 600);
  }, 2200);
}

// ════════════════════════════════════════════════════════════
// § 24  PUBLIC API & EVENT HOOKS
// ════════════════════════════════════════════════════════════
window.EyloxDash = {
  launch,
  hide,
  handleReconnect,
  isActive: () => _active,
  getStats: () => ({ score: G.score, best: G.best, coins: G.coins, dist: Math.floor(G.dist) }),
};

// Auto-hook into the EYLOX offline system
window.addEventListener('eylox-offline', () => {
  // Small delay to let the offline indicator animate first
  setTimeout(() => launch(), 800);
});

window.addEventListener('eylox-online', () => {
  if(_active) handleReconnect();
});

// Also activate if already offline when this script loads
if(typeof window.EyloxOffline !== 'undefined' && !window.EyloxOffline.isOnline()){
  setTimeout(() => launch(), 1500);
}

})(); // end EyloxDash IIFE
