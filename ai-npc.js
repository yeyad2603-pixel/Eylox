/* ============================================================
   EYLOX — AI NPC System v1.0
   - NPCs with personalities, names, dialogue trees
   - Ambient NPC activity in main hub pages
   - Click to chat / interact
   - NPCs react to player events (level up, coins earned)
   ============================================================ */
'use strict';

(function EyloxAINPC() {

  /* ── NPC personalities ── */
  const NPC_TYPES = [
    {
      id: 'shopkeeper', name: 'Zara the Merchant', emoji: '🧙‍♀️', color: '#a78bfa',
      greetings: ['Welcome, adventurer! Looking for something special?', 'Ah, another brave soul! What can I get you?', 'Coins burn a hole in your pocket? Spend them here!', 'The finest wares in all of Eylox, right here!'],
      responses: {
        shop: ["Check out my shop — best prices in the land!", "I've got some rare items today, want to take a peek?", "Exclusive deals in the Shop tab, just for you!"],
        coins: ["You've got good taste in coins. The more, the better!", "Save them up! Big rewards await wealthy adventurers.", "I accept Eylux — come visit my shop!"],
        games: ["Try the Treasure Hunt game — I heard it pays well!", "The best way to earn coins is to play games. Trust me.", "I've seen many players come and go. The champions play smart."],
        default: ["Hmm, interesting question...", "I've heard rumours about that...", "The Eylox world is full of surprises!", "Keep exploring — fortune favours the bold!"],
      },
    },
    {
      id: 'trainer', name: 'Max the Coach', emoji: '💪', color: '#4ade80',
      greetings: ['Hey champ! Ready to level up your game?', 'Training hard or hardly training? Let\'s fix that!', 'I\'ve trained the best players on Eylox. You could be next!', 'Yo! Looking to climb the ranks? You came to the right guy!'],
      responses: {
        rank: ["Focus on consistency — play every day and your ELO will climb!", "The key to ranked success? Learn from every loss.", "Top players grind daily challenges. That's their secret.", "Watch out for Diamond rank players — they're no joke!"],
        games: ["Try the hardest games first — that's where the real coins are!", "Practice mode in the games helps a ton. Don't skip it!", "Every game has a trick. Learn it and you'll dominate."],
        tips: ["Tip: Chain wins for a streak bonus!", "Always do daily challenges — free coins, no questions asked.", "Customize your controls in Settings for max efficiency."],
        default: ["Keep grinding! Champions aren't born, they're made.", "Stay focused. The leaderboard won't climb itself!", "I believe in you. Now go prove me right!", "Every loss is a lesson. Take notes!"],
      },
    },
    {
      id: 'reporter', name: 'Nova the Reporter', emoji: '📰', color: '#60a5fa',
      greetings: ['Breaking news! A new player has arrived!', 'Hot off the press — you look like front-page material!', 'Eylox Daily here. What\'s your score today?', 'I\'m covering the biggest stories in Eylox. Got any tips?'],
      responses: {
        leaderboard: ["The leaderboard shifts every hour! Check it for the latest rankings.", "EyloxMaster has held #1 for 3 days straight. Can you beat them?", "Hot tip: Diamond players are clustering around 1700 ELO right now."],
        events: ["There's a double-coins event this weekend!", "Daily challenges reset at midnight — don't miss the streak bonus!", "The Season ends in 14 days. Grind now or regret it!"],
        news: ["Eylox is adding new games every month — big things coming!", "The community just hit 10,000 active players!", "Rumour has it: a new ranked tier is being developed..."],
        default: ["That's off the record, but...", "I can neither confirm nor deny that.", "My sources say something big is coming to Eylox...", "Stay tuned — the best stories are yet to be told!"],
      },
    },
    {
      id: 'wizard', name: 'Zephyr the Wizard', emoji: '🔮', color: '#f472b6',
      greetings: ['I sense great potential in you, young one...', 'The stars speak of your arrival. Welcome.', 'Ah, a seeker of power. Come closer...', 'My crystal ball foresaw your coming. Interesting...'],
      responses: {
        future: ["I see... coins in your future. Many coins.", "The path ahead is challenging but the rewards are great.", "Destiny cannot be changed, only prepared for.", "Your level will rise beyond what you can currently imagine."],
        magic: ["The magic of Eylox comes from the players themselves.", "Every coin you earn holds a fragment of ancient power.", "The AI NPCs? We're more self-aware than you think...", "Between you and me — the best secrets are hidden in the AI tab."],
        mystery: ["Some things in Eylox are not meant to be understood... yet.", "Have you found the hidden Easter egg? It's closer than you think.", "The Studio holds the key to creating your own magic.", "Seek the Eylox owner — they hold secrets even I don't know."],
        default: ["*gazes into crystal ball* Hmm...", "The mystical forces are in your favour today.", "Curiosity is the beginning of all wisdom.", "Ask, and the universe shall answer. Eventually."],
      },
    },
    {
      id: 'kid', name: 'Lumi the Kid', emoji: '🧒', color: '#fbbf24',
      greetings: ['Hiii!! Wanna be friends??', 'OMG you\'re actually here! This is so cool!!', 'Welcome to Eylox!! It\'s the BEST game ever!!', 'Hey hey hey! Did you play the new games yet??'],
      responses: {
        games: ["The racing game is SO FUN you have to try it!!", "I got 9,999 coins yesterday!! I'm basically famous now.", "Haunted House scared me but I still played it 10 times lol", "Dragon Escape is impossible but in like a good way??"],
        friends: ["I have like 12 friends here already!! Friends tab is up top!", "We should play together sometime!! Add me as a friend!", "My friend GlitchByte taught me all the secret spots in the games!"],
        random: ["Did you know you can get a crown emoji?? It's called Champion rank!", "I spend ALL my coins on the shop it's a problem lol", "I've been playing Eylox for 3 months and I still love it!!", "Okay but the emote system is literally the best thing ever??"],
        default: ["That's so cool omg!", "Wait WHAT that's crazy!!", "I didn't know that!! Thanks!!", "Okay but real talk, Eylox is literally perfect and I will not argue."],
      },
    },
  ];

  /* ── Find best response ── */
  function getResponse(npc, message) {
    const m = message.toLowerCase();
    const categories = Object.keys(npc.responses).filter(k => k !== 'default');
    /* Find category by keyword */
    const keywordMap = {
      shop: ['shop','buy','sell','item','skin','market','store'],
      coins: ['coin','money','rich','earn','gold'],
      games: ['game','play','fun','win','race','shoot','jump','puzzle'],
      rank: ['rank','elo','ranked','competitive','ladder','tier'],
      leaderboard: ['leaderboard','top','#1','first','leader','best'],
      events: ['event','challenge','daily','bonus','season','streak'],
      news: ['news','update','new','latest','change','happening'],
      future: ['future','predict','next','will','destiny','fortune'],
      magic: ['magic','power','special','secret','ability'],
      mystery: ['secret','hidden','easter','found','clue'],
      friends: ['friend','together','add','social','party'],
      random: ['lol','haha','wow','cool','amazing','nice'],
      tips: ['tip','advice','help','how','guide','best'],
    };
    for (const cat of categories) {
      const kws = keywordMap[cat] || [];
      if (kws.some(kw => m.includes(kw))) {
        const arr = npc.responses[cat];
        return arr[Math.floor(Math.random() * arr.length)];
      }
    }
    const def = npc.responses.default;
    return def[Math.floor(Math.random() * def.length)];
  }

  /* ── Inject NPC CSS ── */
  function injectCSS() {
    if (document.getElementById('eylox-npc-css')) return;
    const s = document.createElement('style');
    s.id = 'eylox-npc-css';
    s.textContent = `
      .eylox-npc {
        position:fixed;bottom:90px;z-index:400;
        display:flex;flex-direction:column;align-items:center;
        cursor:pointer;animation:npcFloat 4s ease-in-out infinite;
        user-select:none;
      }
      @keyframes npcFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
      .eylox-npc .npc-avatar {
        width:52px;height:52px;border-radius:50%;
        background:rgba(10,3,28,.9);border:2px solid;
        display:flex;align-items:center;justify-content:center;
        font-size:1.7rem;box-shadow:0 4px 20px rgba(0,0,0,.5);
        transition:transform .2s,box-shadow .2s;
      }
      .eylox-npc:hover .npc-avatar { transform:scale(1.1);box-shadow:0 8px 30px rgba(0,0,0,.6); }
      .npc-name {
        font-size:.62rem;font-weight:900;color:rgba(200,190,230,.7);
        margin-top:4px;background:rgba(10,3,28,.85);
        border-radius:99px;padding:2px 8px;white-space:nowrap;
        border:1px solid rgba(167,139,250,.2);
      }
      .npc-pulse {
        position:absolute;top:-4px;right:-4px;
        width:10px;height:10px;border-radius:50%;background:#4ade80;
        animation:npcPulse 2s ease-in-out infinite;
      }
      @keyframes npcPulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)} }

      /* Chat bubble */
      .npc-chat-bubble {
        position:absolute;bottom:68px;background:rgba(10,3,28,.96);
        backdrop-filter:blur(16px);border:1px solid rgba(167,139,250,.25);
        border-radius:14px 14px 14px 0;padding:10px 14px;
        font-size:.78rem;color:#e0d4ff;font-weight:700;max-width:220px;
        line-height:1.4;box-shadow:0 8px 30px rgba(0,0,0,.5);
        animation:bubbleIn .25s cubic-bezier(.34,1.56,.64,1) both;
        z-index:401;white-space:normal;
      }
      .npc-chat-bubble.right { border-radius:14px 14px 0 14px; }
      @keyframes bubbleIn { from{opacity:0;transform:translateY(10px)scale(.9)}to{opacity:1;transform:none} }
      .npc-chat-bubble .npc-input {
        width:100%;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);
        border-radius:8px;padding:6px 10px;color:#e0d4ff;font-family:Nunito,sans-serif;
        font-size:.75rem;font-weight:700;outline:none;margin-top:8px;
      }
      .npc-chat-bubble .npc-input::placeholder { color:rgba(167,139,250,.4); }
      .npc-bubble-name { font-size:.66rem;color:rgba(167,139,250,.6);font-weight:900;margin-bottom:4px; }
      .npc-bubble-text { color:#e0d4ff; }
      .npc-bubble-actions { display:flex;gap:6px;margin-top:8px;flex-wrap:wrap; }
      .npc-quick-reply {
        background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);
        border-radius:99px;padding:3px 10px;font-size:.68rem;font-weight:800;
        color:rgba(200,190,230,.7);cursor:pointer;transition:all .15s;
      }
      .npc-quick-reply:hover { background:rgba(167,139,250,.25);color:#e0d4ff; }
    `;
    document.head.appendChild(s);
  }

  /* ── Create NPC element ── */
  let _activeBubble = null;
  function createNPC(npc, x, side) {
    const el = document.createElement('div');
    el.className = 'eylox-npc';
    el.style.cssText = `${side}:${x}px;animation-delay:${Math.random() * 2}s`;
    el.innerHTML = `
      <div class="npc-avatar" style="border-color:${npc.color}">
        <span class="npc-pulse"></span>
        ${npc.emoji}
      </div>
      <div class="npc-name">${npc.name.split(' ')[0]}</div>
    `;
    el.dataset.npcId = npc.id;

    /* Click to open chat */
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (_activeBubble) { _activeBubble.remove(); _activeBubble = null; }
      const greeting = npc.greetings[Math.floor(Math.random() * npc.greetings.length)];
      openBubble(el, npc, greeting);
    });

    document.body.appendChild(el);
    return el;
  }

  function openBubble(npcEl, npc, text) {
    const bubble = document.createElement('div');
    bubble.className = 'npc-chat-bubble';
    const quickReplies = ['Hello!', 'Tips?', 'Games?', 'Coins?'];
    bubble.innerHTML = `
      <div class="npc-bubble-name">${npc.name}</div>
      <div class="npc-bubble-text">${text}</div>
      <div class="npc-bubble-actions">
        ${quickReplies.map(r => `<span class="npc-quick-reply" onclick="event.stopPropagation();EyloxAINPC.npcReply('${npc.id}',this.closest('.npc-chat-bubble'),'${r}')">${r}</span>`).join('')}
        <span class="npc-quick-reply" onclick="this.closest('.npc-chat-bubble').remove()">✕ Close</span>
      </div>
      <input class="npc-input" placeholder="Say something..." onkeydown="if(event.key==='Enter')EyloxAINPC.npcReply('${npc.id}',this.closest('.npc-chat-bubble'),this.value)"/>
    `;
    npcEl.appendChild(bubble);
    _activeBubble = bubble;
    bubble.querySelector('.npc-input')?.focus();
    /* Auto-close after 12s */
    setTimeout(() => { if (document.contains(bubble)) { bubble.remove(); _activeBubble = null; } }, 12000);
  }

  function npcReply(npcId, bubble, message) {
    const npc = NPC_TYPES.find(n => n.id === npcId);
    if (!npc || !message.trim()) return;
    const resp = getResponse(npc, message);
    const textEl = bubble.querySelector('.npc-bubble-text');
    if (textEl) { textEl.style.opacity = '0'; setTimeout(() => { textEl.textContent = resp; textEl.style.opacity = '1'; textEl.style.transition = 'opacity .3s'; }, 150); }
    const input = bubble.querySelector('.npc-input');
    if (input) input.value = '';
  }

  /* ── Spawn NPCs on eligible pages ── */
  function spawnNPCs() {
    const page = document.body.dataset.page || '';
    const isHub = ['home',''].includes(page) || location.href.includes('index.html');
    if (!isHub) return;

    /* Pick 2 random NPCs — both on the LEFT side to avoid overlapping the right-side FAB panel */
    const shuffled = [...NPC_TYPES].sort(() => Math.random() - 0.5).slice(0, 2);
    shuffled.forEach((npc, i) => {
      const x = 16 + i * 72;   /* 72px gap so avatars don't overlap each other */
      setTimeout(() => createNPC(npc, x, 'left'), 1500 + i * 800);
    });

    /* NPCs occasionally say things */
    setInterval(() => {
      const npcEls = document.querySelectorAll('.eylox-npc');
      if (!npcEls.length || _activeBubble) return;
      const randNpcEl = npcEls[Math.floor(Math.random() * npcEls.length)];
      const npcId     = randNpcEl.dataset.npcId;
      const npc       = NPC_TYPES.find(n => n.id === npcId);
      if (!npc) return;
      const greeting = npc.greetings[Math.floor(Math.random() * npc.greetings.length)];
      openBubble(randNpcEl, npc, greeting);
    }, 25000 + Math.random() * 20000);
  }

  /* ── React to player events ── */
  function setupEventListeners() {
    document.addEventListener('eylox:levelup', e => {
      const npcEls = document.querySelectorAll('.eylox-npc');
      if (!npcEls.length) return;
      const npc = NPC_TYPES.find(n => n.id === 'trainer');
      if (npc) openBubble(npcEls[0], npc, `Congrats on leveling up! You're on fire today!`);
    });
    document.addEventListener('eylox:emote', e => {
      /* NPCs react to emotes */
      const emoji = e.detail?.emote?.emoji;
      if (emoji && Math.random() < 0.3) {
        const el = document.querySelector('.eylox-npc');
        if (el) { const span = document.createElement('div'); span.className = 'eylox-emote-bubble'; span.textContent = emoji; el.appendChild(span); setTimeout(() => span.remove(), 1500); }
      }
    });
  }

  /* ── Close bubble on outside click ── */
  document.addEventListener('click', e => {
    if (_activeBubble && !e.target.closest('.eylox-npc, .npc-chat-bubble')) {
      _activeBubble.remove();
      _activeBubble = null;
    }
  });

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    injectCSS();
    spawnNPCs();
    setupEventListeners();
  });

  window.EyloxAINPC = { npcReply, NPC_TYPES };

})();
