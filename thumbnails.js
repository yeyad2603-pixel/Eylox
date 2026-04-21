/* ============================================================
   EYLOX — Game Thumbnail System
   Uses real image files from /thumbnails/ folder.
   Falls back to CSS gradient art if image is missing.
   ============================================================ */
'use strict';

const GAME_THUMB_MAP = {
  'ninja-dash':    { grad:'linear-gradient(160deg,#1a0030 0%,#5a0080 40%,#b200cc 70%,#ff4400 100%)', emoji:'🥷', emoji2:'💨', label:'NINJA DASH',    tag:'RUN OR LOSE!' },
  'sky-riders':    { grad:'linear-gradient(160deg,#000820 0%,#0033aa 40%,#0088ff 75%,#66ddff 100%)', emoji:'🚀', emoji2:'✨', label:'SKY RIDERS',    tag:'FLY HIGH!' },
  'dragon-escape': { grad:'linear-gradient(160deg,#200500 0%,#660f00 40%,#cc2200 70%,#ff6600 100%)', emoji:'🐉', emoji2:'🔥', label:'DRAGON ESCAPE',  tag:'ESCAPE NOW!' },
  'puzzle-palace': { grad:'linear-gradient(160deg,#0a0033 0%,#2200aa 40%,#8800ff 72%,#cc88ff 100%)', emoji:'🧩', emoji2:'👻', label:'PUZZLE PALACE',  tag:'CAN YOU SOLVE IT?' },
  'ocean-quest':   { grad:'linear-gradient(160deg,#000820 0%,#001a88 40%,#0044cc 72%,#44bbff 100%)', emoji:'🤿', emoji2:'🐠', label:'OCEAN QUEST',    tag:'FIND THE TREASURE!' },
  'block-kingdom': { grad:'linear-gradient(160deg,#0d2200 0%,#1e5500 40%,#3daa00 72%,#88ee00 100%)', emoji:'🏰', emoji2:'👑', label:'BLOCK KINGDOM',  tag:'BUILD YOUR KINGDOM!' },
  'farm-friends':  { grad:'linear-gradient(160deg,#102000 0%,#2e5500 40%,#55aa00 72%,#88dd00 100%)', emoji:'🌻', emoji2:'🐮', label:'FARM FRIENDS',   tag:'GROW YOUR FARM!' },
  'space-blaster': { grad:'linear-gradient(160deg,#10003a 0%,#330099 40%,#7700ee 72%,#ee44ff 100%)', emoji:'🛸', emoji2:'⭐', label:'SPACE BLASTER',  tag:'BLAST THEM ALL!!' },
  'haunted-house': { grad:'linear-gradient(160deg,#080010 0%,#200055 40%,#5500aa 72%,#aa44ff 100%)', emoji:'👻', emoji2:'🏚️', label:'HAUNTED HOUSE',  tag:"DON'T LOOK BACK!" },
  'race-city':     { grad:'linear-gradient(160deg,#100020 0%,#330066 40%,#880099 72%,#ff44cc 100%)', emoji:'🏎️', emoji2:'🛣️', label:'RACE CITY',      tag:'FASTEST WINS!' },
  'jungle-run':    { grad:'linear-gradient(160deg,#001200 0%,#004400 40%,#007700 72%,#00cc00 100%)', emoji:'🌿', emoji2:'🏃', label:'JUNGLE RUN',     tag:'SURVIVE THE JUNGLE!' },
  'candy-chaos':   { grad:'linear-gradient(160deg,#220033 0%,#660066 40%,#cc0099 72%,#ff44cc 100%)', emoji:'🍬', emoji2:'🎪', label:'CANDY CHAOS',    tag:'SWEET BUT DANGEROUS!' },
  'ice-fortress':  { grad:'linear-gradient(160deg,#000a18 0%,#001a55 40%,#003399 72%,#0055dd 100%)', emoji:'🧊', emoji2:'❄️', label:'ICE FORTRESS',   tag:'FREEZE THEM!' },
  'logic-lab':     { grad:'linear-gradient(160deg,#001a00 0%,#005500 40%,#009900 72%,#44dd44 100%)', emoji:'🔬', emoji2:'💡', label:'LOGIC LAB',      tag:'TEST YOUR BRAIN!!' },
  'pirate-bay':    { grad:'linear-gradient(160deg,#180a00 0%,#4a2200 40%,#885500 72%,#cc8800 100%)', emoji:'☠️', emoji2:'⚓', label:'PIRATE BAY',     tag:'STEAL THE TREASURE!' },
  'treasure-hunt': { grad:'linear-gradient(160deg,#1a0a00 0%,#553300 40%,#aa6600 72%,#ffaa00 100%)', emoji:'💎', emoji2:'🗺️', label:'TREASURE HUNT',  tag:'FIND THE RARE LOOT!' },
};

/* Image filenames in the /thumbnails/ subfolder */
const THUMB_IMG = {
  'ninja-dash':    'thumbnails/WhatsApp Image 2026-04-01 at 6.30.58 PM.jpeg',
  'sky-riders':    'thumbnails/WhatsApp Image 2026-04-01 at 6.31.18 PM.jpeg',
  'dragon-escape': 'thumbnails/WhatsApp Image 2026-04-01 at 6.31.34 PM.jpeg',
  'puzzle-palace': 'thumbnails/WhatsApp Image 2026-04-01 at 6.32.01 PM.jpeg',
  'ocean-quest':   'thumbnails/WhatsApp Image 2026-04-01 at 6.32.24 PM.jpeg',
  'block-kingdom': 'thumbnails/WhatsApp Image 2026-04-01 at 6.32.44 PM.jpeg',
  'farm-friends':  'thumbnails/WhatsApp Image 2026-04-01 at 6.40.27 PM.jpeg',
  'space-blaster': 'thumbnails/WhatsApp Image 2026-04-01 at 6.40.58 PM.jpeg',
  'haunted-house': 'thumbnails/WhatsApp Image 2026-04-01 at 6.41.18 PM.jpeg',
  'race-city':     'thumbnails/WhatsApp Image 2026-04-01 at 6.44.00 PM.jpeg',
  'ice-fortress':  'thumbnails/WhatsApp Image 2026-04-01 at 6.48.21 PM.jpeg',
  'logic-lab':     'thumbnails/WhatsApp Image 2026-04-01 at 6.49.48 PM.jpeg',
  'treasure-hunt': 'thumbnails/WhatsApp Image 2026-04-01 at 6.49.48 PM (1).jpeg',
  'candy-chaos':   'thumbnails/WhatsApp Image 2026-04-01 at 6.49.48 PM (2).jpeg',
  'jungle-run':    'thumbnails/WhatsApp Image 2026-04-01 at 8.01.22 PM.jpeg',
  'pirate-bay':    'thumbnails/WhatsApp Image 2026-04-05 at 8.42.03 PM.jpeg',
};

function buildThumbHTML(id, small) {
  const t = GAME_THUMB_MAP[id];
  if (!t) return null;

  const imgSrc     = THUMB_IMG[id] || '';
  const emojiSize  = small ? '1.4rem' : '2.8rem';
  const emoji2Size = small ? '0'      : '1.2rem';

  /* CSS label overlay — only shown when image fails to load */
  const cssLabel = small ? '' : `
    <div class="thumb-css-label" style="
      position:absolute;bottom:0;left:0;right:0;
      background:linear-gradient(transparent,rgba(0,0,0,.88));
      padding:18px 8px 8px;pointer-events:none;z-index:2;
    ">
      <div style="font-family:'Fredoka One',cursive;font-size:.68rem;font-weight:900;color:#fff;
        text-align:center;letter-spacing:.5px;text-shadow:0 1px 6px rgba(0,0,0,.9)">
        ${t.label}
      </div>
      <div style="font-family:'Fredoka One',cursive;font-size:.55rem;font-weight:700;
        color:rgba(255,220,80,.95);text-align:center;letter-spacing:.3px;margin-top:1px;
        text-shadow:0 1px 4px rgba(0,0,0,.8)">
        ${t.tag}
      </div>
    </div>`;

  return `<div style="
    width:100%;height:100%;
    background:${t.grad};
    border-radius:inherit;
    position:relative;overflow:hidden;
  ">
    <!-- Real image — covers everything when loaded -->
    <img
      src="${imgSrc}"
      alt="${t.label}"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;z-index:1"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      onload="this.nextElementSibling.style.display='none'"
    />
    <!-- CSS fallback art — shown only if image missing -->
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;z-index:0">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 55% 30%,rgba(255,255,255,.13) 0%,transparent 65%);pointer-events:none"></div>
      <div style="position:absolute;top:0;left:-70%;width:35%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);transform:skewX(-16deg);pointer-events:none"></div>
      <div style="font-size:${emojiSize};line-height:1;filter:drop-shadow(0 4px 12px rgba(0,0,0,.7));position:relative;z-index:1">${t.emoji}</div>
      <div style="font-size:${emoji2Size};filter:drop-shadow(0 2px 8px rgba(0,0,0,.6));position:relative;z-index:1">${t.emoji2}</div>
      ${cssLabel}
    </div>
  </div>`;
}

function applyThumbnails() {
  document.querySelectorAll('.game-card, .hot-card').forEach(card => {
    const id = card.dataset.gameId
      || card.querySelector('[data-id]')?.dataset.id
      || card.querySelector('.btn-play')?.dataset.id
      || card.querySelector('[data-img]')?.dataset.img;
    if (!id || !GAME_THUMB_MAP[id]) return;

    if (card.dataset.thumbDone === id) return;
    card.dataset.thumbDone = id;

    const thumb = card.querySelector('.card-thumb, .hot-thumb');
    if (!thumb) return;
    if (thumb.dataset.thumbDone) return;
    thumb.dataset.thumbDone = '1';

    const isHot = thumb.classList.contains('hot-thumb');
    const html  = buildThumbHTML(id, isHot);
    if (!html) return;
    thumb.innerHTML = html;
    thumb.style.cssText += ';padding:0;font-size:0;background:none;overflow:hidden';
    if (!isHot) thumb.style.minHeight = '130px';

    /* NEW ribbon */
    const NEW_GAMES = ['space-blaster','haunted-house','race-city','candy-chaos','ice-fortress','logic-lab','pirate-bay'];
    if (NEW_GAMES.includes(id) && !card.querySelector('.new-ribbon')) {
      const ribbon = document.createElement('div');
      ribbon.className = 'new-ribbon';
      ribbon.textContent = 'NEW';
      ribbon.style.cssText = 'position:absolute;top:8px;right:8px;background:linear-gradient(135deg,#ec4899,#f472b6);color:#fff;font-family:"Fredoka One",cursive;font-size:.65rem;font-weight:900;padding:3px 9px;border-radius:99px;letter-spacing:.5px;z-index:10;box-shadow:0 2px 8px rgba(236,72,153,.5)';
      card.style.position = 'relative';
      card.appendChild(ribbon);
    }
  });
}

function observeAndApply() {
  applyThumbnails();
  const observer = new MutationObserver(() => applyThumbnails());
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeAndApply);
} else {
  observeAndApply();
}
