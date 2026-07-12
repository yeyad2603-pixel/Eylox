/* ============================================================
   EYLOX — AI Game Builder v1.0
   Type "make a racing game" → instantly playable HTML5 game
   Uses template-based generation with keyword detection
   ============================================================ */
'use strict';

(function EyloxAIBuilder() {

  /* ── Game templates — complete playable canvas games ── */
  const TEMPLATES = {

    /* ── RACING ── */
    racing: {
      label: 'Racing Game',
      icon: '🏎️',
      keywords: ['racing','race','car','drive','driving','speed','track','road','drift','nascar','f1'],
      generate(opts) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${opts.title||'Eylox Racer'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0118;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Nunito,sans-serif;overflow:hidden}
canvas{border:2px solid rgba(167,139,250,.3);border-radius:8px}
#hud{position:absolute;top:10px;left:50%;transform:translateX(-50%);color:#fff;font-size:1.1rem;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.8);display:flex;gap:20px}
#msg{position:absolute;color:#a78bfa;font-size:1.4rem;font-weight:900;text-shadow:0 0 20px rgba(167,139,250,.8);opacity:0;transition:opacity .4s}
#msg.show{opacity:1}</style></head>
<body>
<div id="hud"><span>🏎️ Speed: <span id="spd">0</span></span><span>🏆 Score: <span id="sc">0</span></span><span>⏱️ <span id="tm">0</span>s</span></div>
<canvas id="c" width="480" height="640"></canvas>
<div id="msg" id="msg">🏁 RACE!</div>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const W=480,H=640;
let car={x:210,y:500,w:30,h:50,speed:0,score:0,lives:3};
let obstacles=[],coins=[],time=0,frame=0,gameOver=false,started=false;
let roadOffset=0,score=0,hiScore=parseInt(localStorage.getItem('airace_hi')||'0');
let keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(!started){started=true;showMsg('🏁 GO!');}});
document.addEventListener('keyup',e=>keys[e.key]=false);
// Touch support
let touchX=null;
c.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;started=true;});
c.addEventListener('touchmove',e=>{e.preventDefault();touchX=e.touches[0].clientX;},{passive:false});
c.addEventListener('touchend',()=>{touchX=null;});
function showMsg(t){const m=document.getElementById('msg');m.textContent=t;m.classList.add('show');setTimeout(()=>m.classList.remove('show'),1200);}
function spawnObstacle(){if(Math.random()<0.02+score/5000){obstacles.push({x:100+Math.random()*280,y:-60,w:36,h:54,color:['#f87171','#fb923c','#fbbf24'][Math.floor(Math.random()*3)]});}}
function spawnCoin(){if(Math.random()<0.015){coins.push({x:110+Math.random()*260,y:-30,r:10});}}
function drawRoad(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
  // Road
  ctx.fillStyle='#2d2d4e';ctx.fillRect(80,0,320,H);
  // Lane lines
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=3;ctx.setLineDash([40,30]);
  for(let x=0;x<3;x++){ctx.beginPath();ctx.moveTo(160+x*80,(roadOffset%70)-70);ctx.lineTo(160+x*80,H+70);ctx.stroke();}
  ctx.setLineDash([]);
  // Grass
  ctx.fillStyle='#14532d';ctx.fillRect(0,0,80,H);ctx.fillRect(400,0,80,H);
}
function drawCar(x,y,w,h,col){
  ctx.fillStyle=col||'#a78bfa';ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(x+4,y+8,w-8,18);
  ctx.fillStyle='#fbbf24';ctx.fillRect(x,y+h-10,10,6);ctx.fillRect(x+w-10,y+h-10,10,6);
  ctx.fillStyle='#f87171';ctx.fillRect(x,y,10,6);ctx.fillRect(x+w-10,y,10,6);
}
function update(){
  if(gameOver||!started)return;
  time+=1/60;
  // Speed
  const targetSpeed=2+Math.min(score/200,8);
  car.speed+=(targetSpeed-car.speed)*.05;
  roadOffset+=car.speed;
  // Controls
  if(keys['ArrowLeft']||keys['a']||keys['A'])car.x-=4;
  if(keys['ArrowRight']||keys['d']||keys['D'])car.x+=4;
  if(touchX!==null){const rel=(touchX/c.offsetWidth)*W;car.x+=(rel-car.x-15)*.12;}
  car.x=Math.max(90,Math.min(W-130,car.x));
  // Spawn
  spawnObstacle();spawnCoin();
  // Update obstacles
  obstacles=obstacles.filter(o=>{
    o.y+=car.speed*1.2;
    if(o.y>H)return false;
    if(o.x<car.x+car.w-5&&o.x+o.w>car.x+5&&o.y<car.y+car.h-5&&o.y+o.h>car.y+5){
      showMsg('💥 CRASH!');car.speed=0;score=Math.max(0,score-100);
      obstacles=[];return false;
    }
    return true;
  });
  // Update coins
  coins=coins.filter(c=>{
    c.y+=car.speed;
    if(c.y>H)return false;
    const dx=c.x-(car.x+car.w/2),dy=c.y-(car.y+car.h/2);
    if(Math.sqrt(dx*dx+dy*dy)<car.w/2+c.r){score+=10;showMsg('+10 🪙');return false;}
    return true;
  });
  score+=Math.round(car.speed*0.1);
  document.getElementById('spd').textContent=Math.round(car.speed*30);
  document.getElementById('sc').textContent=score;
  document.getElementById('tm').textContent=Math.round(time);
  if(score>hiScore){hiScore=score;localStorage.setItem('airace_hi',hiScore);}
}
function draw(){
  drawRoad();
  // Coins
  coins.forEach(c=>{ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f59e0b';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('💰',c.x,c.y+4);});
  // Obstacles
  obstacles.forEach(o=>drawCar(o.x,o.y,o.w,o.h,o.color));
  // Player car
  drawCar(car.x,car.y,car.w,car.h,'#a78bfa');
  if(!started){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 26px Fredoka One,cursive';ctx.textAlign='center';ctx.fillText('Press Any Key',W/2,H/2-20);ctx.font='16px Nunito,sans-serif';ctx.fillStyle='#a78bfa';ctx.fillText('Arrow Keys / Touch to Steer',W/2,H/2+14);}
}
function loop(){requestAnimationFrame(loop);update();draw();}
loop();
</script></body></html>`;
      },
    },

    /* ── PLATFORMER ── */
    platformer: {
      label: 'Platformer',
      icon: '🏃',
      keywords: ['platform','platformer','jump','run','mario','side scroll','runner','parkour','obstacle'],
      generate(opts) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${opts.title||'Eylox Run'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0b0f18;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Nunito,sans-serif;overflow:hidden}
canvas{border:2px solid rgba(167,139,250,.3);border-radius:8px;display:block}
#ui{position:absolute;top:10px;left:50%;transform:translateX(-50%);color:#fff;font-weight:800;font-size:1rem;display:flex;gap:16px}</style></head>
<body><div id="ui"><span>💰 <span id="coins">0</span></span><span>❤️ <span id="lives">3</span></span><span>🏆 <span id="dist">0m</span></span></div>
<canvas id="c" width="640" height="360"></canvas>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const W=640,H=360,G=0.55,JUMP=-12;
let cam=0,score=0,lives=3,frame=0,gameOver=false;
let player={x:80,y:200,vx:3.5,vy:0,w:28,h:36,onGround:false,jumpCount:0};
let platforms=[{x:0,y:300,w:300,h:20},{x:320,y:260,w:150,h:20},{x:520,y:220,w:130,h:20},{x:710,y:280,w:200,h:20},{x:970,y:240,w:160,h:20}];
let coins=[],enemies=[],particles=[];
let keys={};
document.addEventListener('keydown',e=>{keys[e.code]=true;});
document.addEventListener('keyup',e=>{keys[e.code]=false;});
// Touch jump
c.addEventListener('touchstart',()=>{if(player.jumpCount<2){player.vy=JUMP;player.jumpCount++;}});
function genWorld(){
  while(platforms[platforms.length-1].x<cam+W+800){
    const last=platforms[platforms.length-1];
    const x=last.x+last.w+60+Math.random()*120;
    const y=160+Math.random()*140;
    platforms.push({x,y,w:80+Math.random()*150,h:20});
    if(Math.random()<0.6)coins.push({x:x+20+Math.random()*60,y:y-30,r:8,collected:false});
    if(Math.random()<0.25)enemies.push({x:x+40,y:y-30,w:28,h:28,vx:1.5*(Math.random()<.5?1:-1),alive:true});
  }
}
genWorld();
function jump(){if(player.jumpCount<2){player.vy=JUMP+(keys['ShiftLeft']?.5:0);player.jumpCount++;addParticles(player.x+player.w/2,player.y+player.h,'#a78bfa',6);}}
function addParticles(x,y,col,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*4,vy:-Math.random()*3-1,life:25,col});}
document.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW')jump();});
function update(){
  if(gameOver)return;
  frame++;
  // Player physics
  if(keys['ArrowRight']||keys['KeyD'])player.vx=Math.min(player.vx+.2,6);
  else player.vx=Math.max(player.vx-.1,3);
  player.vy+=G;player.x+=player.vx;player.y+=player.vy;
  cam+=(player.x-cam-160)*.08;
  player.onGround=false;
  platforms.forEach(p=>{
    if(player.x+player.w>p.x&&player.x<p.x+p.w&&player.y+player.h>p.y&&player.y+player.h<p.y+p.h+15&&player.vy>=0){
      player.y=p.y-player.h;player.vy=0;player.onGround=true;player.jumpCount=0;
    }
  });
  if(player.y>H+100){lives--;player.x=80;player.y=200;player.vx=3.5;player.vy=0;cam=0;if(lives<=0){gameOver=true;}addParticles(player.x,player.y,'#f87171',15);}
  // Coins
  coins.forEach(co=>{if(!co.collected&&Math.abs(player.x+player.w/2-co.x)<co.r+14&&Math.abs(player.y+player.h/2-co.y)<co.r+14){co.collected=true;score+=10;addParticles(co.x,co.y,'#fbbf24',8);}});
  // Enemies
  enemies.forEach(e=>{
    if(!e.alive)return;
    e.x+=e.vx;
    const plat=platforms.find(p=>e.x+e.w>p.x&&e.x<p.x+p.w&&e.y+e.h>=p.y&&e.y+e.h<=p.y+20);
    if(!plat)e.vx*=-1;
    if(player.x+player.w-4>e.x&&player.x+4<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){
      if(player.vy>0&&player.y+player.h<e.y+12){e.alive=false;player.vy=-8;score+=50;addParticles(e.x+e.w/2,e.y,'#f87171',12);}
      else{lives--;player.vy=-8;addParticles(player.x,player.y,'#f87171',10);}
    }
  });
  score++;
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;});
  particles=particles.filter(p=>p.life>0);
  genWorld();
  document.getElementById('Eylux').textContent=Math.round(score/10);
  document.getElementById('lives').textContent=lives;
  document.getElementById('dist').textContent=Math.round(player.x/50)+'m';
}
function draw(){
  ctx.fillStyle='#0b0f18';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(-cam,0);
  // Bg stars
  if(frame%4===0){ctx.fillStyle='rgba(255,255,255,.15)';for(let i=0;i<3;i++){const sx=(Math.random()*W+cam)%W;ctx.fillRect(sx,Math.random()*H,1,1);}}
  // Platforms
  platforms.forEach(p=>{
    const grd=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);
    grd.addColorStop(0,'#4ade80');grd.addColorStop(1,'#166534');
    ctx.fillStyle=grd;ctx.fillRect(p.x,p.y,p.w,p.h);
    ctx.fillStyle='#86efac';ctx.fillRect(p.x,p.y,p.w,4);
  });
  // Coins
  coins.forEach(co=>{if(co.collected)return;ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(co.x,co.y,co.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText('$',co.x,co.y+3);});
  // Enemies
  enemies.forEach(e=>{if(!e.alive)return;ctx.fillStyle='#f87171';ctx.beginPath();ctx.roundRect(e.x,e.y,e.w,e.h,6);ctx.fill();ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText('😈',e.x+e.w/2,e.y+e.h*.8);});
  // Player
  const pgrd=ctx.createLinearGradient(player.x,player.y,player.x,player.y+player.h);
  pgrd.addColorStop(0,'#c4b5fd');pgrd.addColorStop(1,'#7c3aed');
  ctx.fillStyle=pgrd;ctx.beginPath();ctx.roundRect(player.x,player.y,player.w,player.h,7);ctx.fill();
  ctx.font='20px sans-serif';ctx.textAlign='center';ctx.fillText('🧙',player.x+player.w/2,player.y+player.h*.85);
  // Particles
  particles.forEach(p=>{ctx.globalAlpha=p.life/25;ctx.fillStyle=p.col;ctx.fillRect(p.x-2,p.y-2,4,4);});ctx.globalAlpha=1;
  ctx.restore();
  if(gameOver){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f87171';ctx.font='bold 36px Fredoka One,cursive';ctx.textAlign='center';ctx.fillText('GAME OVER',W/2,H/2-20);ctx.fillStyle='#a78bfa';ctx.font='18px Nunito,sans-serif';ctx.fillText('Score: '+Math.round(score/10)+' coins',W/2,H/2+16);ctx.fillText('Press F5 to restart',W/2,H/2+44);}
}
function loop(){requestAnimationFrame(loop);update();draw();}
loop();
</script></body></html>`;
      },
    },

    /* ── SHOOTER ── */
    shooter: {
      label: 'Space Shooter',
      icon: '🚀',
      keywords: ['shooter','shoot','space','alien','bullet','laser','spaceship','galaxy','invader'],
      generate(opts) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${opts.title||'Eylox Shooter'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden}
canvas{border:2px solid rgba(167,139,250,.4);border-radius:8px}</style></head>
<body><canvas id="c" width="480" height="640"></canvas>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const W=480,H=640;
let ship={x:220,y:560,w:32,h:40,speed:5,health:3,maxHealth:3};
let bullets=[],enemies=[],stars=[],particles=[],powerups=[];
let score=0,wave=1,gameOver=false,frame=0;
let keys={};
for(let i=0;i<120;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.5+.3,v:1+Math.random()*2});
document.addEventListener('keydown',e=>keys[e.code]=true);
document.addEventListener('keyup',e=>keys[e.code]=false);
let touchX=null,firing=false;
c.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;firing=true;});
c.addEventListener('touchmove',e=>{e.preventDefault();touchX=e.touches[0].clientX;},{passive:false});
c.addEventListener('touchend',()=>{touchX=null;firing=false;});
function spawnWave(){
  const rows=1+Math.floor(wave/2),cols=3+Math.min(wave,5);
  for(let r=0;r<rows;r++)for(let cl=0;cl<cols;cl++){
    enemies.push({x:60+cl*(W-100)/cols,y:50+r*55,w:36,h:28,health:1+Math.floor(wave/3),vx:1*(wave%2===0?-1:1),vy:0});
  }
}
spawnWave();
function addParticle(x,y,col,n=8){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:20,col});}
let shootCd=0;
function update(){
  if(gameOver)return;
  frame++;
  // Controls
  if(keys['ArrowLeft']||keys['KeyA'])ship.x-=ship.speed;
  if(keys['ArrowRight']||keys['KeyD'])ship.x+=ship.speed;
  if(touchX!==null)ship.x+=(touchX/c.offsetWidth*W-ship.x-ship.w/2)*.15;
  ship.x=Math.max(0,Math.min(W-ship.w,ship.x));
  shootCd--;
  if((keys['Space']||firing)&&shootCd<=0){bullets.push({x:ship.x+ship.w/2-2,y:ship.y,w:4,h:16,vy:-14,type:'player'});shootCd=8;}
  // Enemy movement
  let hitWall=false;
  enemies.forEach(e=>{e.x+=e.vx*(1+wave*.1);if(e.x>W-e.w||e.x<0)hitWall=true;});
  if(hitWall){enemies.forEach(e=>{e.vx*=-1;e.y+=15;});}
  // Enemy shoot
  if(frame%Math.max(30-wave*3,12)===0&&enemies.length){
    const e=enemies[Math.floor(Math.random()*enemies.length)];
    bullets.push({x:e.x+e.w/2-2,y:e.y+e.h,w:4,h:12,vy:5+wave*.5,type:'enemy'});
  }
  // Bullets
  bullets=bullets.filter(b=>{
    b.y+=b.vy;
    if(b.y<-20||b.y>H+20)return false;
    if(b.type==='player'){
      for(let i=enemies.length-1;i>=0;i--){
        const e=enemies[i];
        if(b.x>e.x-2&&b.x<e.x+e.w+2&&b.y>e.y&&b.y<e.y+e.h){
          e.health--;addParticle(e.x+e.w/2,e.y+e.h/2,'#f87171');
          if(e.health<=0){score+=10*(1+Math.floor(wave/2));addParticle(e.x+e.w/2,e.y,'#fbbf24',15);enemies.splice(i,1);}
          return false;
        }
      }
    }
    if(b.type==='enemy'&&b.x>ship.x-4&&b.x<ship.x+ship.w+4&&b.y>ship.y&&b.y<ship.y+ship.h){
      ship.health--;addParticle(ship.x+ship.w/2,ship.y,'#f87171',12);
      if(ship.health<=0)gameOver=true;
      return false;
    }
    return true;
  });
  // Enemy reach bottom
  enemies.forEach(e=>{if(e.y+e.h>H-60){ship.health--;gameOver=ship.health<=0;enemies=[];}});
  if(!enemies.length){wave++;spawnWave();addParticle(W/2,H/2,'#4ade80',30);}
  // Particles
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;});
  particles=particles.filter(p=>p.life>0);
  // Stars
  stars.forEach(s=>{s.y+=s.v;if(s.y>H)s.y=0;});
}
function draw(){
  ctx.fillStyle='#000215';ctx.fillRect(0,0,W,H);
  // Stars
  stars.forEach(s=>{ctx.fillStyle=`rgba(255,255,255,${s.s/1.5})`;ctx.fillRect(s.x,s.y,s.s,s.s);});
  // Enemies
  enemies.forEach(e=>{
    ctx.fillStyle=wave>4?'#f472b6':wave>2?'#fb923c':'#f87171';
    ctx.beginPath();ctx.roundRect(e.x,e.y,e.w,e.h,6);ctx.fill();
    ctx.font='18px sans-serif';ctx.textAlign='center';
    ctx.fillText(wave>3?'👾':'👽',e.x+e.w/2,e.y+e.h*.85);
    if(e.health>1){ctx.fillStyle='#4ade80';ctx.fillRect(e.x,e.y-6,e.w*(e.health/(1+Math.floor(wave/3))),3);}
  });
  // Bullets
  bullets.forEach(b=>{ctx.fillStyle=b.type==='player'?'#60a5fa':'#f87171';ctx.fillRect(b.x,b.y,b.w,b.h);});
  // Ship
  const g=ctx.createLinearGradient(ship.x,ship.y,ship.x,ship.y+ship.h);
  g.addColorStop(0,'#c4b5fd');g.addColorStop(1,'#7c3aed');
  ctx.fillStyle=g;ctx.beginPath();
  ctx.moveTo(ship.x+ship.w/2,ship.y);ctx.lineTo(ship.x+ship.w,ship.y+ship.h);ctx.lineTo(ship.x,ship.y+ship.h);ctx.closePath();ctx.fill();
  ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.ellipse(ship.x+ship.w/2,ship.y+ship.h/2,ship.w/4,ship.h/5,0,0,Math.PI*2);ctx.fill();
  // Health
  for(let i=0;i<ship.maxHealth;i++){ctx.fillStyle=i<ship.health?'#f87171':'rgba(255,255,255,.15)';ctx.beginPath();ctx.arc(16+i*22,H-16,8,0,Math.PI*2);ctx.fill();}
  // Particles
  particles.forEach(p=>{ctx.globalAlpha=p.life/20;ctx.fillStyle=p.col;ctx.fillRect(p.x-2,p.y-2,5,5);});ctx.globalAlpha=1;
  // HUD
  ctx.fillStyle='#a78bfa';ctx.font='bold 16px Fredoka One,cursive';ctx.textAlign='left';ctx.fillText('⭐ '+score,10,24);
  ctx.textAlign='right';ctx.fillText('Wave '+wave,W-10,24);
  if(gameOver){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f87171';ctx.font='bold 38px Fredoka One,cursive';ctx.textAlign='center';ctx.fillText('GAME OVER',W/2,H/2-20);ctx.fillStyle='#a78bfa';ctx.font='18px Nunito,sans-serif';ctx.fillText('Score: '+score+' — Wave: '+wave,W/2,H/2+16);ctx.fillStyle='rgba(167,139,250,.7)';ctx.fillText('Press F5 to play again',W/2,H/2+46);}
}
function loop(){requestAnimationFrame(loop);update();draw();}
loop();
</script></body></html>`;
      },
    },

    /* ── CLICKER ── */
    clicker: {
      label: 'Clicker Game',
      icon: '👆',
      keywords: ['clicker','click','idle','tap','cookie','factory','farm','mine','craft','incremental'],
      generate(opts) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${opts.title||'Eylox Clicker'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0118;font-family:Nunito,sans-serif;color:#f0e8ff;display:flex;align-items:center;justify-content:center;height:100vh}
.game{display:flex;gap:0;width:640px;height:480px;background:rgba(10,1,40,.95);border:1px solid rgba(167,139,250,.2);border-radius:16px;overflow:hidden}
.left{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;border-right:1px solid rgba(255,255,255,.06)}
.right{width:220px;overflow-y:auto;padding:14px}
.right::-webkit-scrollbar{width:4px}.right::-webkit-scrollbar-thumb{background:rgba(167,139,250,.2)}
#mainBtn{width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);border:3px solid rgba(167,139,250,.5);cursor:pointer;font-size:3.5rem;transition:transform .1s,box-shadow .1s;box-shadow:0 0 30px rgba(167,139,250,.3)}
#mainBtn:active{transform:scale(.9);box-shadow:0 0 10px rgba(167,139,250,.2)}
#coinsDisplay{font-family:'Fredoka One',cursive;font-size:2rem;color:#a78bfa;margin-bottom:6px;text-align:center}
#cps{font-size:.82rem;color:rgba(167,139,250,.5);margin-bottom:14px}
#perClick{font-size:.78rem;color:rgba(200,190,230,.4);margin-top:4px}
.upgrade{background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.15);border-radius:10px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all .15s}
.upgrade:hover:not([disabled]){background:rgba(167,139,250,.16);border-color:rgba(167,139,250,.35);transform:translateX(2px)}
.upgrade[disabled]{opacity:.4;cursor:not-allowed}
.upg-name{font-weight:800;font-size:.85rem;color:#e0d4ff}
.upg-desc{font-size:.7rem;color:rgba(200,190,230,.5);margin-top:2px}
.upg-cost{font-size:.78rem;color:#fbbf24;font-weight:800;margin-top:4px}
.upg-owned{font-size:.7rem;color:#4ade80;float:right}
#floatContainer{position:absolute;pointer-events:none}
.float-num{position:absolute;font-weight:900;font-size:1rem;color:#fbbf24;animation:floatUp .8s ease forwards;pointer-events:none}
@keyframes floatUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-50px)}}
</style></head>
<body><div id="floatContainer"></div>
<div class="game">
  <div class="left">
    <div id="coinsDisplay">0</div>
    <div id="cps">0 coins/sec</div>
    <button id="mainBtn" onclick="click_()">🪙</button>
    <div id="perClick">+1 per click</div>
  </div>
  <div class="right">
    <div style="font-size:.72rem;font-weight:900;color:rgba(167,139,250,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Upgrades</div>
    <div id="upgradeList"></div>
  </div>
</div>
<script>
let coins=0,cps=0,clickPow=1,frame=0;
const UPGRADES=[
  {name:'Better Pickaxe',icon:'⛏️',desc:'2x click power',cost:50,bought:0,maxBuy:5,effect:()=>{clickPow*=2},costMult:3},
  {name:'Auto Miner',icon:'🤖',desc:'+1 coin/sec',cost:100,bought:0,maxBuy:99,effect:()=>{cps+=1},costMult:1.5},
  {name:'Coin Farm',icon:'🌾',desc:'+5 coins/sec',cost:500,bought:0,maxBuy:99,effect:()=>{cps+=5},costMult:1.6},
  {name:'Magic Wand',icon:'🪄',desc:'+3x click power',cost:2000,bought:0,maxBuy:3,effect:()=>{clickPow*=3},costMult:5},
  {name:'Coin Dragon',icon:'🐉',desc:'+25 coins/sec',cost:5000,bought:0,maxBuy:99,effect:()=>{cps+=25},costMult:1.7},
  {name:'Time Machine',icon:'⏰',desc:'+100 coins/sec',cost:25000,bought:0,maxBuy:99,effect:()=>{cps+=100},costMult:1.8},
  {name:'Star Factory',icon:'⭐',desc:'+500 coins/sec',cost:200000,bought:0,maxBuy:99,effect:()=>{cps+=500},costMult:2},
  {name:'Black Hole',icon:'🌌',desc:'+2000 coins/sec',cost:1000000,bought:0,maxBuy:99,effect:()=>{cps+=2000},costMult:2.2},
];
function fmtNum(n){if(n>=1e9)return(n/1e9).toFixed(1)+'B';if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1000)return(n/1000).toFixed(1)+'K';return Math.floor(n).toLocaleString();}
function renderUpgrades(){
  const ul=document.getElementById('upgradeList');
  ul.innerHTML=UPGRADES.map((u,i)=>`
    <div class="upgrade" id="upg${i}" onclick="buy(${i})">
      <span style="font-size:1.1rem">${u.icon}</span>
      <span class="upg-owned">${u.bought>0?'×'+u.bought:''}</span>
      <div class="upg-name">${u.name}</div>
      <div class="upg-desc">${u.desc}</div>
      <div class="upg-cost">💰 ${fmtNum(u.cost)}</div>
    </div>`).join('');
}
function buy(i){
  const u=UPGRADES[i];
  if(coins>=u.cost&&u.bought<u.maxBuy){
    coins-=u.cost;u.cost=Math.ceil(u.cost*u.costMult);u.bought++;u.effect();
    renderUpgrades();showFloat('+'+u.name,'#a78bfa');
  }
}
function click_(){
  coins+=clickPow;
  showFloat('+'+fmtNum(clickPow),'#fbbf24');
}
function showFloat(txt,col){
  const btn=document.getElementById('mainBtn');
  const rect=btn.getBoundingClientRect();
  const el=document.createElement('div');
  el.className='float-num';el.textContent=txt;
  el.style.cssText=`left:${rect.left+rect.width/2-20}px;top:${rect.top-10}px;color:${col};z-index:9999;`;
  document.body.appendChild(el);setTimeout(()=>el.remove(),850);
}
function checkAfford(){UPGRADES.forEach((u,i)=>{const el=document.getElementById('upg'+i);if(el)el.disabled=coins<u.cost||u.bought>=u.maxBuy;});}
setInterval(()=>{coins+=cps/20;document.getElementById('coinsDisplay').textContent=fmtNum(coins);document.getElementById('cps').textContent=fmtNum(cps)+' coins/sec';document.getElementById('perClick').textContent='+'+fmtNum(clickPow)+' per click';checkAfford();},50);
renderUpgrades();
</script></body></html>`;
      },
    },

    /* ── PUZZLE ── */
    puzzle: {
      label: 'Puzzle Game',
      icon: '🧩',
      keywords: ['puzzle','memory','match','tile','brain','logic','slide','sudoku','tetris','block','match3'],
      generate(opts) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${opts.title||'Eylox Puzzle'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0118;font-family:Nunito,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;color:#f0e8ff}
h1{font-family:'Fredoka One',cursive;font-size:1.6rem;color:#a78bfa;margin-bottom:6px}
#info{color:rgba(167,139,250,.6);font-size:.9rem;margin-bottom:16px}
#grid{display:grid;grid-template-columns:repeat(4,80px);gap:8px}
.cell{width:80px;height:80px;border-radius:12px;background:rgba(124,58,237,.15);border:2px solid rgba(167,139,250,.2);font-size:2rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;user-select:none}
.cell:hover{background:rgba(124,58,237,.3);transform:scale(1.05)}
.cell.flipped{background:linear-gradient(135deg,#7c3aed,#a78bfa);border-color:#a78bfa;transform:rotateY(180deg)}
.cell.matched{background:linear-gradient(135deg,#059669,#4ade80);border-color:#4ade80;cursor:default}
#result{margin-top:18px;font-size:1.1rem;font-weight:800;color:#4ade80;min-height:28px}
button{background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:none;border-radius:99px;padding:10px 28px;font-family:Nunito,sans-serif;font-weight:800;font-size:.9rem;cursor:pointer;margin-top:12px;transition:opacity .2s}
button:hover{opacity:.85}
</style></head><body>
<h1>🧩 Memory Match</h1>
<div id="info">Moves: <span id="moves">0</span> &nbsp;|&nbsp; Matched: <span id="matched">0</span>/8</div>
<div id="grid"></div>
<div id="result"></div>
<button onclick="init()">🔄 New Game</button>
<script>
const EMOJIS=['🎮','🏆','🪙','⚡','🌟','💎','🚀','🎯'];
let cards=[],flipped=[],matched=[],moves=0,locked=false;
function shuffle(a){return a.sort(()=>Math.random()-.5);}
function init(){
  cards=shuffle([...EMOJIS,...EMOJIS].map((e,i)=>({id:i,emoji:e,isFlipped:false,isMatched:false})));
  flipped=[];matched=[];moves=0;locked=false;
  document.getElementById('moves').textContent=0;
  document.getElementById('matched').textContent=0;
  document.getElementById('result').textContent='';
  render();
}
function render(){
  const g=document.getElementById('grid');
  g.innerHTML=cards.map((c,i)=>`
    <div class="cell${c.isFlipped||c.isMatched?' flipped':''}${c.isMatched?' matched':''}" onclick="flip(${i})">
      ${c.isFlipped||c.isMatched?c.emoji:''}
    </div>`).join('');
}
function flip(i){
  if(locked||cards[i].isFlipped||cards[i].isMatched)return;
  cards[i].isFlipped=true;flipped.push(i);render();
  if(flipped.length===2){
    moves++;document.getElementById('moves').textContent=moves;
    locked=true;
    setTimeout(()=>{
      const[a,b]=flipped;
      if(cards[a].emoji===cards[b].emoji){cards[a].isMatched=cards[b].isMatched=true;matched.push(a,b);document.getElementById('matched').textContent=matched.length/2;}
      else{cards[a].isFlipped=cards[b].isFlipped=false;}
      flipped=[];locked=false;render();
      if(matched.length===cards.length){document.getElementById('result').textContent='🎉 You won in '+moves+' moves!';}
    },900);
  }
}
init();
</script></body></html>`;
      },
    },
  };

  /* ── Keyword matcher ── */
  function detectTemplate(prompt) {
    const p = prompt.toLowerCase();
    for (const [key, tmpl] of Object.entries(TEMPLATES)) {
      if (tmpl.keywords.some(kw => p.includes(kw))) return key;
    }
    /* Fallback: guess from common words */
    if (/fight|battle|war/.test(p)) return 'shooter';
    if (/farm|build|creat/.test(p)) return 'clicker';
    return 'platformer'; /* default */
  }

  /* ── Title extractor ── */
  function extractTitle(prompt) {
    const m = prompt.match(/(?:called|named|title[d]?:?\s*)['""]?([^'"",]+)['""]?/i);
    if (m) return m[1].trim();
    const words = prompt.split(/\s+/).slice(-3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return 'Eylox ' + words.join(' ');
  }

  /* ── Main build function ── */
  function buildGame(prompt, callback) {
    return new Promise(resolve => {
      /* Simulate AI "thinking" */
      setTimeout(() => {
        const key   = detectTemplate(prompt);
        const tmpl  = TEMPLATES[key];
        const title = extractTitle(prompt);
        const html  = tmpl.generate({ title, prompt });
        const result = { key, label: tmpl.label, icon: tmpl.icon, title, html };
        if (callback) callback(null, result);
        resolve(result);
      }, 1200 + Math.random() * 800);
    });
  }

  /* ── Expose API ── */
  window.EyloxAIBuilder = {
    buildGame,
    detectTemplate,
    templates: Object.keys(TEMPLATES).map(k => ({ key: k, label: TEMPLATES[k].label, icon: TEMPLATES[k].icon, keywords: TEMPLATES[k].keywords })),
  };

})();
