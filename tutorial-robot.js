/* ============================================================
   EYLOX — Tutorial Robot + AI Assistant v2.0
   Tutorial walks new players through the platform.
   After completion: Botty stays as a full Q&A assistant.
   ============================================================ */
'use strict';

(function EyloxTutorial() {

  const SEEN_KEY = 'eylox_tutorial_done';
  const STEP_KEY = 'eylox_tutorial_step';

  /* ══════════════════════════════════════════════════════
     TUTORIAL STEPS
  ══════════════════════════════════════════════════════ */
  const STEPS_HOME = [
    { icon:'👋', title:"Welcome to Eylox!", text:"Hi! I'm Botty, your guide! Eylox is a platform where you can play games, earn coins and wins, and customize your avatar. Let me show you around!", highlight:null, btn:"Let's Go! →" },
    { icon:'🏠', title:'The Home Tab', text:'This is your Home! Here you can see featured games, live events, and what\'s happening on the platform. It updates every day with fresh content!', highlight:'.sidebar-link[href="index.html"]', btn:'Got it! →' },
    { icon:'🎮', title:'Playing Games', text:'Click "Discover" in the menu to find games! 🎮 2D games earn you Coins. 🏆 3D games earn you Wins when you complete them!', highlight:'.sidebar-link[href="games.html"]', btn:'Cool! →' },
    { icon:'💰', title:'Coins & Wins', text:'Coins 💰 are earned by playing 2D games. Wins 🏆 are earned by completing 3D games. Both can be spent in the Shop for cool items!', highlight:'.tb-coins', btn:'Awesome! →' },
    { icon:'🛒', title:'The Shop', text:'Visit the Shop to buy avatars, effects, game passes, and boosts! Use Coins or Wins to unlock items. Check the Featured tab for daily deals!', highlight:'.sidebar-link[href="shop.html"]', btn:'Nice! →' },
    { icon:'🎖️', title:'Achievements', text:'Complete challenges to earn Achievements! Each achievement gives you rewards like coins, avatars, and special badges. Check your progress anytime!', highlight:'.sidebar-link[href="achievements.html"]', btn:"I'll check! →" },
    { icon:'🔥', title:'Live Events', text:'Live Events are special limited-time activities like concerts, tournaments, and treasure hunts! Join them to earn exclusive rewards!', highlight:'#tb-events-btn', btn:'Exciting! →' },
    { icon:'📹', title:'Video Calls', text:'You can video call your friends directly inside Eylox! Go to Messages → Video Call. You can even change your background!', highlight:'.sidebar-link[href="messages.html"]', btn:'Cool! →' },
    { icon:'🤖', title:'AI Battle', text:'Head to AI Studio to battle against an AI opponent! Choose your difficulty (Easy to Legend) and test your skills. The AI gets smarter as you win!', highlight:'.sidebar-link[href="ai.html"]', btn:"Let's Battle! →" },
    { icon:'⚙️', title:'Settings', text:'Customize your experience in Settings! Change graphics quality, language, controller settings, and more. Make Eylox feel just right for you!', highlight:'.sb-action', btn:'Got it! →' },
    { icon:'🎉', title:"You're Ready!", text:"That's everything! You're all set to play, earn, and explore Eylox! If you ever need help, click the 🤖 button — I'll be right here as your AI assistant!", highlight:null, btn:'🚀 Start Playing!' }
  ];

  const STEPS_GAMES = [
    { icon:'🎮', title:'Game Library', text:'This is the full game library! 2D games give Coins 💰, 3D games give Wins 🏆. Look for the reward badges below each game button!', highlight:null, btn:'Got it! →' },
    { icon:'⭐', title:'Game Ratings', text:'Each game shows player ratings and how many players are online. Higher ratings mean more fun! Try the top-rated games first.', highlight:'.game-card', btn:'Cool! →' },
    { icon:'🏆', title:'3D Worlds', text:'3D games are the most immersive on Eylox! Complete missions to earn Wins. You can also use controller, keyboard, or touch controls!', highlight:null, btn:'Ready! →' },
  ];

  const STEPS_SHOP = [
    { icon:'🛒', title:'The Shop', text:"Welcome to the Shop! Browse categories using the tabs at the top. Use 💰 Coins or 🏆 Wins to buy items!", highlight:'.sh-tabs', btn:'Got it! →' },
    { icon:'🎁', title:'Free Rewards', text:'Click the Rewards tab to claim FREE items! Some rewards unlock automatically when you reach milestones. Check back often!', highlight:'[data-tab="rewards"]', btn:'Awesome! →' },
    { icon:'🎟️', title:'Game Passes', text:"Game Passes give permanent perks like 2× XP, more coins, and extra lives! They're great investments for serious players.", highlight:'[data-tab="passes"]', btn:"Let's go! →" },
  ];

  function getSteps() {
    const page = document.body?.dataset?.page || '';
    if (page === 'games') return STEPS_GAMES;
    if (page === 'shop')  return STEPS_SHOP;
    return STEPS_HOME;
  }

  /* ══════════════════════════════════════════════════════
     Q&A KNOWLEDGE BASE
  ══════════════════════════════════════════════════════ */
  const QA_KB = [
    { keys:['restart tutorial','redo tutorial','tutorial again','show tutorial'],
      action:'restart_tutorial' },
    { keys:['hello','hi','hey','sup','yo','hii','helo'],
      answer:"Hey! 👋 I'm Botty — ask me anything about EYLOX! Games, coins, shop, AI Studio, premium — I know it all. 🤖" },
    { keys:['thanks','thank you','thx','ty','appreciate','great','awesome','perfect'],
      answer:"You're welcome! 😊 Happy gaming! Hit me up if you need anything else. 🎮" },
    { keys:['coin','Eylux','earn coin','how earn','get coins','more coins'],
      answer:"💰 <b>Earning Coins:</b> Play 2D games, complete daily missions, earn achievements, win AI battles, finish live events, and sell games you create! Premium members get 2× coins on everything." },
    { keys:['win','wins','earn win','3d game','how to get wins'],
      answer:"🏆 <b>Earning Wins:</b> Complete 3D games like Obby, Pirate Adventure, and City Explorer! Each completed level rewards you Wins. Premium members earn bonus Wins per session." },
    { keys:['shop','buy','purchase','spend','item','avatar','effect'],
      answer:"🛒 <b>The Shop</b> has Avatars, Effects, Passes, Boosts, and free Rewards! Use the tabs at the top to browse. Daily featured deals rotate every 24h. Free items appear in the Rewards tab!" },
    { keys:['achievement','badge','medal','unlock achievement'],
      answer:"🎖️ <b>Achievements</b> unlock as you play across the platform. Each one rewards coins, badges, or exclusive avatars. Some are secret — keep exploring to discover them!" },
    { keys:['friend','add friend','friends list','request'],
      answer:"🤝 Go to the <b>Friends</b> page, search by username, and send a friend request. Once accepted you can chat, play together, and see each other's activity in real time!" },
    { keys:['ai battle','battle','fight ai','versus ai','ai opponent'],
      answer:"⚔️ <b>AI Battle:</b> AI Studio → Battle tab. Choose Easy/Medium/Hard/Legend difficulty. Hit the glowing targets before they disappear. Beat the AI to earn coins and Eyltrophs! Power-ups can help." },
    { keys:['training','practice','training mode'],
      answer:"🏋️ <b>Training Mode</b> lets you practice with no stakes — no coins lost, no pressure. Personal bests are tracked. Go to AI Studio → Training tab." },
    { keys:['ai studio','ai tab','studio'],
      answer:"🤖 <b>AI Studio</b> has 10 features: Battle, Training, Coach, Analyzer, Challenges, Tournament, Season, Prestige, AI Builder, and AI NPCs. Each has unique rewards!" },
    { keys:['ai builder','generate game','make game','build game','create game'],
      answer:"⚡ <b>AI Game Builder:</b> AI Studio → AI Builder tab. Type your game idea, hit Generate, watch AI build it step by step, choose rewards (Coins/Wins/Both), then publish to Discover! You earn creator coins every time players play your game." },
    { keys:['eylox studio','3d builder','game engine','make 3d'],
      answer:"🔧 <b>EYLOX Studio</b> is the full 3D game creation tool! Use terrain, building blocks, scripts, NPCs, and physics to build games. It has an AI assistant built-in to help you code!" },
    { keys:['leaderboard','rank','ranking','top players','best players'],
      answer:"🏆 <b>Leaderboard</b> shows top players across 7 categories: Trophies, Wins, Coins, Games Played, Season Rank, Games Created, and Social Score. You can filter by all-time or this season." },
    { keys:['premium','subscribe','subscription','membership'],
      answer:"⭐ <b>EYLOX has 4 tiers:</b>\n• Premium — EGP 299/mo (2× earnings, no ads, exclusive items)\n• Creator Pass — EGP 999/mo (AI game building, publishing)\n• Creator Pro — EGP 2,499/mo (unlimited AI, analytics, verified badge)\n• Ultimate Creator — EGP 4,999/mo (multiplayer creation, dedicated servers, voice NPCs)\n\nClick the ⭐ button in the sidebar to see all benefits!" },
    { keys:['creator pass','creator pro','ultimate creator'],
      answer:"👑 <b>Creator subscriptions</b> unlock game creation superpowers! Creator Pass (EGP 999) is great for starters. Creator Pro (EGP 2,499) unlocks unlimited AI + revenue share. Ultimate (EGP 4,999) is the full package with multiplayer creation and voice NPCs." },
    { keys:['setting','settings','graphics','quality','controls','language'],
      answer:"⚙️ <b>Settings</b> (sidebar → Settings button) lets you customize graphics quality, control bindings, notifications, privacy options, language, theme, accessibility, and more." },
    { keys:['message','chat','dm','direct message','messaging'],
      answer:"💬 <b>Messages:</b> Chat with friends via text, send emojis, do video calls, and share game clips! Premium members get extra chat features and unlimited message history." },
    { keys:['community','communities','group','clan','join community'],
      answer:"🌐 <b>Communities</b> are groups of players with shared interests. Join existing ones or create your own! Each community has posts, events, and its own leaderboard." },
    { keys:['profile','my profile','customize profile','bio','avatar'],
      answer:"👤 Your <b>Profile</b> shows your stats, equipped avatar, bio, achievements, and games. Go there to equip new items, set your title, change your banner, and show off your highlights!" },
    { keys:['daily','mission','quest','daily mission','daily reward'],
      answer:"🎯 <b>Daily Missions</b> refresh every 24 hours and give bonus Eylux for completing them. Find them on the Home page. Premium members get extra missions with bigger payouts!" },
    { keys:['tournament','weekly tournament','bracket'],
      answer:"🏆 <b>Weekly Tournament:</b> AI Studio → Tournament tab. 64-player AI battle bracket starting every Monday! Beat AI opponents round by round for a chance at the 5,000 coin prize pool." },
    { keys:['season','season rank','season rewards'],
      answer:"📈 <b>Season:</b> Your AI battle performance is tracked throughout each season. Climb from Rookie to Legend rank. Higher ranks earn exclusive badges and coins at season end!" },
    { keys:['prestige','prestige milestone'],
      answer:"🌟 <b>Prestige Milestones</b> are permanent achievements for reaching battle milestones — they never reset and give exclusive lifetime titles and effects!" },
    { keys:['npc','ai npc','chat npc','characters'],
      answer:"🧬 <b>AI NPCs</b> in AI Studio each have unique personalities — chat with Zara the Merchant, Max the Coach, Nova the Reporter, Zephyr the Wizard, and Lumi the Kid anytime!" },
    { keys:['challenge','daily challenge','ai challenge'],
      answer:"🎯 <b>AI Challenges</b> are daily tasks generated by AI — complete them for bonus Eylux and Eyltrophs. They reset every 24 hours and get harder as you improve!" },
    { keys:['coach','ai coach','strategy','tips','improve'],
      answer:"🧠 <b>AI Coach</b> in AI Studio gives you personalized tips and strategies based on your playstyle! Click any coaching topic to get tailored advice from the AI." },
    { keys:['analyze','analyzer','performance','stats'],
      answer:"📊 <b>AI Analyzer</b> shows your full performance breakdown — win rate, reaction time, accuracy, and improvement over time. Plus AI-generated insights on how to get better!" },
    { keys:['publish','publishing','my game','my games'],
      answer:"🌐 After creating a game in AI Builder, hit 'Publish to Discover'! Your game appears in the Discover page, your profile, and the AI-Made Games section. You earn creator coins every time it's played." },
    { keys:['live event','event','concert','treasure hunt'],
      answer:"🔥 <b>Live Events</b> are time-limited activities — concerts, treasure hunts, tournaments, and special challenges! Join them via the Events button in the topbar for exclusive rewards." },
    { keys:['log out','logout','sign out'],
      answer:"To log out, click the 🚪 Log Out button at the bottom of the sidebar. Your progress and coins are saved automatically!" },
    { keys:['how play','how to play','how do i','what do i do','where do i start'],
      answer:"🎮 Start by exploring the <b>Discover</b> page to find games you like! Play 2D games for Coins and 3D games for Wins. Complete <b>Daily Missions</b> for bonus rewards. Check <b>Achievements</b> for long-term goals. And try <b>AI Battle</b> to test your skills!" },
    { keys:['what is eylox','about eylox','explain eylox'],
      answer:"🌐 <b>EYLOX</b> is a gaming platform where you can: play 2D & 3D games 🎮, earn coins & wins 💰, battle AI opponents ⚔️, build games with AI 🤖, customize your avatar 🎨, connect with friends 🤝, and much more! It's like a game engine + social network all in one." },
    { keys:['recommend','what should i play','suggest a game','something to play','what to play','recommend a game','pick a game'],
      action:'recommend_games' },
  ];

  /* Real picks from window.EyloxAI (built from actual play history) — never fabricated. */
  function buildRecommendationReply() {
    const picks = window.EyloxAI && window.EyloxAI.Recommend.games(3);
    if (!picks || !picks.length) {
      return "I don't know your taste yet — play a couple of games and I'll start picking favorites for you! 🎮 In the meantime, check out <b>Discover</b> for what's trending.";
    }
    const list = picks.map(g => `${g.emoji} <b>${g.name}</b> (${g.genre})`).join('<br>');
    return `Based on what you've been playing, here's what I'd try next: 🤖<br>${list}`;
  }

  function findAnswer(input) {
    const q = input.toLowerCase().trim();
    if (!q) return null;
    let best = null, bestScore = 0;
    for (const entry of QA_KB) {
      for (const key of entry.keys) {
        if (q.includes(key)) {
          const score = key.length;
          if (score > bestScore) { best = entry; bestScore = score; }
        }
      }
    }
    if (best) return best;
    return {
      answer: "Hmm, I'm not sure about that one! 🤔 Try asking about: coins, wins, shop, achievements, AI Battle, AI Builder, Premium, leaderboard, daily missions, or just say 'hi' to start fresh! You can also type 'restart tutorial' to go through the tour again."
    };
  }

  /* ══════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('eylox-robot-css')) return;
    const s = document.createElement('style');
    s.id = 'eylox-robot-css';
    s.textContent = `
      @keyframes robotBob     { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)}           }
      @keyframes robotIn      { from{opacity:0;transform:translateY(30px) scale(.8)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes robotOut     { from{opacity:1;transform:scale(1)}  to{opacity:0;transform:translateY(20px) scale(.8)} }
      @keyframes bubbleIn     { from{opacity:0;transform:translateY(8px) scale(.94)} to{opacity:1;transform:none} }
      @keyframes hlPulse      { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0)} 50%{box-shadow:0 0 0 8px rgba(167,139,250,.4)} }
      @keyframes typingDot    { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
      @keyframes msgSlide     { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:none} }
      @keyframes msgSlideL    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
      @keyframes qaPulse      { 0%,100%{box-shadow:0 8px 32px rgba(124,58,237,.4),0 0 0 0 rgba(167,139,250,.4)} 50%{box-shadow:0 8px 32px rgba(124,58,237,.4),0 0 0 8px rgba(167,139,250,0)} }

      #eylox-robot {
        position:fixed; bottom:20px; right:20px; z-index:99996;
        width:64px; height:64px; border-radius:50%;
        background:linear-gradient(135deg,#a78bfa,#7c3aed);
        border:3px solid rgba(167,139,250,.5);
        display:flex; align-items:center; justify-content:center;
        font-size:1.9rem; cursor:pointer;
        box-shadow:0 8px 32px rgba(124,58,237,.4);
        animation:robotBob 2.5s ease-in-out infinite, robotIn .5s cubic-bezier(.34,1.56,.64,1) both;
        transition:transform .2s; user-select:none;
      }
      #eylox-robot:hover { transform:scale(1.12) !important; }
      #eylox-robot.qa-mode {
        background:linear-gradient(135deg,#10b981,#059669);
        border-color:rgba(16,185,129,.5);
        box-shadow:0 8px 32px rgba(16,185,129,.4);
        animation:robotBob 2.5s ease-in-out infinite, qaPulse 2s ease-in-out infinite;
      }
      #eylox-robot .bot-badge {
        position:absolute; top:-4px; right:-4px;
        width:18px; height:18px; border-radius:50%;
        background:#4ade80; border:2px solid #07050e;
        font-size:.6rem; display:flex; align-items:center; justify-content:center;
        font-weight:900; color:#000;
      }

      /* ── Tutorial bubble ── */
      #eylox-robot-bubble {
        position:fixed; bottom:98px; right:20px; z-index:99997;
        background:rgba(8,3,20,.98); border:1.5px solid rgba(167,139,250,.35);
        border-radius:18px 18px 4px 18px;
        padding:18px 20px; max-width:300px; min-width:230px;
        box-shadow:0 16px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(167,139,250,.08);
        animation:bubbleIn .3s cubic-bezier(.34,1.2,.64,1) both;
      }
      .erb-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
      .erb-icon   { font-size:1.8rem; flex-shrink:0; }
      .erb-title  { font-family:'Fredoka One',cursive; font-size:1rem; color:#fff; line-height:1.2; }
      .erb-text   { font-size:.82rem; color:rgba(200,190,230,.78); font-weight:600; line-height:1.55; margin-bottom:14px; }
      .erb-progress { display:flex; gap:4px; margin-bottom:12px; align-items:center; }
      .erb-dot    { width:7px; height:7px; border-radius:50%; background:rgba(167,139,250,.2); transition:all .3s; }
      .erb-dot.active { background:#a78bfa; transform:scale(1.3); }
      .erb-dot.done   { background:rgba(74,222,128,.6); }
      .erb-btns   { display:flex; gap:8px; }
      .erb-btn-main {
        flex:1; padding:9px 12px; border-radius:99px;
        background:linear-gradient(135deg,#a78bfa,#7c3aed);
        border:none; color:#fff; font-weight:900; font-size:.82rem;
        cursor:pointer; transition:all .18s;
      }
      .erb-btn-main:hover { transform:scale(1.04); box-shadow:0 4px 14px rgba(124,58,237,.4); }
      .erb-btn-skip {
        padding:9px 12px; border-radius:99px;
        background:rgba(167,139,250,.06); border:1px solid rgba(167,139,250,.15);
        color:rgba(167,139,250,.5); font-size:.78rem; font-weight:700; cursor:pointer; transition:all .18s;
      }
      .erb-btn-skip:hover { background:rgba(167,139,250,.12); color:rgba(167,139,250,.8); }

      /* ── Q&A chat panel ── */
      #eylox-qa-panel {
        position:fixed; bottom:98px; right:20px; z-index:99997;
        width:320px; max-height:480px;
        background:rgba(8,3,20,.98); border:1.5px solid rgba(167,139,250,.3);
        border-radius:18px 18px 4px 18px;
        display:flex; flex-direction:column;
        box-shadow:0 20px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(167,139,250,.07);
        animation:bubbleIn .3s cubic-bezier(.34,1.2,.64,1) both;
        overflow:hidden;
      }
      .qa-header {
        display:flex; align-items:center; gap:10px;
        padding:12px 14px 10px;
        background:linear-gradient(135deg,rgba(124,58,237,.25),rgba(16,185,129,.12));
        border-bottom:1px solid rgba(167,139,250,.15);
        flex-shrink:0;
      }
      .qa-header-avatar { font-size:1.5rem; flex-shrink:0; }
      .qa-header-info { flex:1; min-width:0; }
      .qa-header-name { font-family:'Fredoka One',cursive; font-size:.92rem; color:#4ade80; line-height:1; }
      .qa-header-sub  { font-size:.64rem; font-weight:800; color:rgba(74,222,128,.55); margin-top:2px; }
      .qa-restart-btn {
        font-size:.62rem; font-weight:900; padding:3px 9px; border-radius:99px;
        background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.2);
        color:rgba(167,139,250,.6); cursor:pointer; transition:all .15s; white-space:nowrap;
      }
      .qa-restart-btn:hover { background:rgba(167,139,250,.22); color:#a78bfa; }

      .qa-messages {
        flex:1; overflow-y:auto; padding:12px 12px 6px;
        display:flex; flex-direction:column; gap:8px;
        min-height:0;
      }
      .qa-messages::-webkit-scrollbar { width:4px; }
      .qa-messages::-webkit-scrollbar-track { background:transparent; }
      .qa-messages::-webkit-scrollbar-thumb { background:rgba(167,139,250,.2); border-radius:99px; }

      .qa-msg { display:flex; gap:8px; align-items:flex-end; animation:msgSlideL .2s ease; }
      .qa-msg.user { flex-direction:row-reverse; animation:msgSlide .2s ease; }
      .qa-msg-av { font-size:1.1rem; flex-shrink:0; line-height:1; margin-bottom:2px; }
      .qa-msg-bubble {
        max-width:78%; padding:8px 12px; border-radius:14px 14px 14px 4px;
        font-size:.78rem; font-weight:700; line-height:1.55; color:rgba(220,210,240,.9);
        background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.15);
      }
      .qa-msg-bubble b { color:#a78bfa; }
      .qa-msg.user .qa-msg-bubble {
        border-radius:14px 14px 4px 14px;
        background:rgba(124,58,237,.22); border-color:rgba(124,58,237,.35);
        color:#e0d4ff;
      }

      .qa-typing { display:flex; gap:4px; align-items:center; padding:6px 10px; }
      .qa-typing span {
        width:6px; height:6px; border-radius:50%; background:#a78bfa;
        animation:typingDot 1.2s ease-in-out infinite;
      }
      .qa-typing span:nth-child(2) { animation-delay:.16s; }
      .qa-typing span:nth-child(3) { animation-delay:.32s; }

      .qa-quick-chips {
        display:flex; flex-wrap:wrap; gap:5px; padding:6px 12px;
        border-top:1px solid rgba(167,139,250,.08);
      }
      .qa-chip {
        font-size:.66rem; font-weight:800; padding:3px 9px;
        background:rgba(167,139,250,.08); border:1px solid rgba(167,139,250,.15);
        border-radius:99px; color:rgba(200,190,230,.6);
        cursor:pointer; transition:all .15s; white-space:nowrap;
      }
      .qa-chip:hover { background:rgba(167,139,250,.2); color:#e0d4ff; }

      .qa-input-row {
        display:flex; gap:6px; padding:10px 10px 12px;
        border-top:1px solid rgba(167,139,250,.12); flex-shrink:0;
      }
      .qa-input {
        flex:1; background:rgba(167,139,250,.07); border:1px solid rgba(167,139,250,.18);
        border-radius:99px; padding:8px 14px;
        color:#e0d4ff; font-family:Nunito,sans-serif; font-size:.8rem; font-weight:700;
        outline:none; transition:border-color .2s;
      }
      .qa-input:focus { border-color:rgba(167,139,250,.5); }
      .qa-input::placeholder { color:rgba(167,139,250,.3); }
      .qa-send {
        width:34px; height:34px; border-radius:50%;
        background:linear-gradient(135deg,#a78bfa,#7c3aed);
        border:none; color:#fff; font-size:.9rem; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        transition:all .18s; flex-shrink:0;
      }
      .qa-send:hover { transform:scale(1.1); box-shadow:0 4px 14px rgba(124,58,237,.4); }

      .eylox-highlight-ring {
        outline:3px solid #a78bfa !important;
        outline-offset:3px !important;
        animation:hlPulse 1.5s infinite !important;
        position:relative; z-index:9998; border-radius:6px;
      }
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════════════ */
  let currentStep = 0;
  let robotEl     = null;
  let bubbleEl    = null;
  let qaEl        = null;
  let _qaMessages = [];
  let _lastHighlight = null;
  let _isTyping   = false;

  function isTutorialDone() { return !!localStorage.getItem(SEEN_KEY); }

  /* ══════════════════════════════════════════════════════
     TUTORIAL BUBBLE
  ══════════════════════════════════════════════════════ */
  function highlight(selector) {
    if (_lastHighlight) _lastHighlight.classList.remove('eylox-highlight-ring');
    if (!selector) return;
    const el = document.querySelector(selector);
    if (el) { el.classList.add('eylox-highlight-ring'); _lastHighlight = el; el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  }

  function showStep(idx) {
    const steps = getSteps();
    if (idx >= steps.length) { finishTutorial(); return; }
    currentStep = idx;
    const step = steps[idx];
    highlight(step.highlight);
    const bubble = document.getElementById('eylox-robot-bubble');
    if (!bubble) return;
    const dots = steps.map((_,i) => `<div class="erb-dot ${i<idx?'done':i===idx?'active':''}"></div>`).join('');
    bubble.innerHTML = `
      <div class="erb-header">
        <span class="erb-icon">${step.icon}</span>
        <div class="erb-title">${step.title}</div>
      </div>
      <div class="erb-text">${step.text}</div>
      <div class="erb-progress">${dots}<span style="font-size:.6rem;color:rgba(167,139,250,.4);margin-left:auto">${idx+1}/${steps.length}</span></div>
      <div class="erb-btns">
        <button class="erb-btn-main" onclick="EyloxTutorial.next()">${step.btn}</button>
        ${idx > 0 ? '<button class="erb-btn-skip" onclick="EyloxTutorial.skip()">Skip</button>' : ''}
      </div>
    `;
  }

  function finishTutorial() {
    localStorage.setItem(SEEN_KEY, '1');
    const bubble = document.getElementById('eylox-robot-bubble');
    if (bubble) bubble.style.display = 'none';
    if (_lastHighlight) { _lastHighlight.classList.remove('eylox-highlight-ring'); _lastHighlight = null; }

    /* Switch robot to Q&A mode */
    if (robotEl) robotEl.classList.add('qa-mode');

    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:100px;right:20px;z-index:99998;background:rgba(8,3,20,.97);border:1.5px solid rgba(74,222,128,.4);border-radius:14px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:bubbleIn .3s ease both`;
    toast.innerHTML = `<span style="font-size:1.5rem">🎉</span><div><div style="font-weight:900;color:#4ade80;font-size:.88rem">Tutorial Complete! +50 Coins</div><div style="font-size:.72rem;color:rgba(200,190,230,.5)">Botty is now your AI assistant — ask anything! 🤖</div></div>`;
    document.body.appendChild(toast);

    try {
      const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');
      if (!user._tutorialRewarded) {
        user.coins = (user.coins || 0) + 50;
        user._tutorialRewarded = true;
        localStorage.setItem('eylox_user', JSON.stringify(user));
      }
    } catch {}

    setTimeout(() => { toast.style.transition='opacity .4s'; toast.style.opacity='0'; setTimeout(()=>toast.remove(),400); }, 4000);

    /* Open Q&A panel after short delay */
    setTimeout(() => openQA(), 1000);
  }

  /* ══════════════════════════════════════════════════════
     Q&A CHAT PANEL
  ══════════════════════════════════════════════════════ */
  const QUICK_CHIPS = ['Earn coins 💰','AI Battle ⚔️','Shop 🛒','Premium 👑','Daily Missions 🎯','AI Builder 🤖'];

  function buildQAPanel() {
    if (document.getElementById('eylox-qa-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'eylox-qa-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="qa-header">
        <div class="qa-header-avatar">🤖</div>
        <div class="qa-header-info">
          <div class="qa-header-name">Botty — AI Assistant</div>
          <div class="qa-header-sub">🟢 Online · Ask me anything!</div>
        </div>
        <button class="qa-restart-btn" onclick="EyloxTutorial.restart()">📖 Tutorial</button>
      </div>
      <div class="qa-messages" id="qaMessages"></div>
      <div class="qa-quick-chips" id="qaChips">
        ${QUICK_CHIPS.map(c=>`<div class="qa-chip" onclick="EyloxTutorial.ask('${c.replace(/['"]/g,'')}')">${c}</div>`).join('')}
      </div>
      <div class="qa-input-row">
        <input class="qa-input" id="qaInput" placeholder="Ask Botty anything…" onkeydown="if(event.key==='Enter')EyloxTutorial.sendMsg()"/>
        <button class="qa-send" onclick="EyloxTutorial.sendMsg()">➤</button>
      </div>
    `;
    document.body.appendChild(panel);
    qaEl = panel;
  }

  function openQA() {
    buildQAPanel();
    const panel = document.getElementById('eylox-qa-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    if (_qaMessages.length === 0) {
      addBotMessage("Hey! 👋 Tutorial done — nice work! I'm Botty and I'm now your personal EYLOX AI assistant. Ask me <b>anything</b> about the platform! You can also type 'restart tutorial' to go through the tour again. 🎮");
      const greeting = window.EyloxAI && window.EyloxAI.greetReturning();
      if (greeting) setTimeout(() => addBotMessage(greeting), 500);
    }
    const input = document.getElementById('qaInput');
    if (input) setTimeout(() => input.focus(), 100);
  }

  function closeQA() {
    const panel = document.getElementById('eylox-qa-panel');
    if (panel) panel.style.display = 'none';
  }

  function addBotMessage(html) {
    const msgs = document.getElementById('qaMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'qa-msg';
    div.innerHTML = `<div class="qa-msg-av">🤖</div><div class="qa-msg-bubble">${html}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    _qaMessages.push({role:'bot', text:html});
  }

  function addUserMessage(text) {
    const msgs = document.getElementById('qaMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'qa-msg user';
    const av = document.createElement('div'); av.className = 'qa-msg-av'; av.textContent = '🧑';
    const bubble = document.createElement('div'); bubble.className = 'qa-msg-bubble'; bubble.textContent = text;
    div.appendChild(av); div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    _qaMessages.push({role:'user', text});
  }

  function showTyping() {
    const msgs = document.getElementById('qaMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'qa-msg'; div.id = 'qaTyping';
    div.innerHTML = `<div class="qa-msg-av">🤖</div><div class="qa-msg-bubble"><div class="qa-typing"><span></span><span></span><span></span></div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('qaTyping');
    if (el) el.remove();
  }

  function sendMsg() {
    if (_isTyping) return;
    const input = document.getElementById('qaInput');
    const text  = (input?.value || '').trim();
    if (!text) return;
    input.value = '';

    addUserMessage(text);
    _isTyping = true;
    showTyping();

    const result = findAnswer(text);
    const delay  = 600 + Math.random() * 600;

    setTimeout(() => {
      hideTyping();
      _isTyping = false;
      if (result && result.action === 'restart_tutorial') {
        addBotMessage("Sure! Restarting the tutorial now 🎓 I'll walk you through everything again!");
        setTimeout(() => EyloxTutorial.restart(), 600);
      } else if (result && result.action === 'recommend_games') {
        addBotMessage(buildRecommendationReply());
      } else if (result) {
        addBotMessage(result.answer);
      }
    }, delay);
  }

  function askChip(text) {
    const input = document.getElementById('qaInput');
    if (input) { input.value = text.replace(/[🎮⚔️🛒👑🎯🤖💰]/gu,'').trim(); }
    sendMsg();
  }

  /* ══════════════════════════════════════════════════════
     ROBOT DOM + INIT
  ══════════════════════════════════════════════════════ */
  function buildRobot() {
    if (document.getElementById('eylox-robot')) return;
    injectCSS();
    const bubble = document.createElement('div');
    bubble.id = 'eylox-robot-bubble';
    bubble.style.display = 'none';
    document.body.appendChild(bubble);
    bubbleEl = bubble;

    const robot = document.createElement('div');
    robot.id = 'eylox-robot';
    robot.innerHTML = '🤖';
    robot.title = 'Botty — Click for help!';
    if (isTutorialDone()) {
      robot.classList.add('qa-mode');
    }
    robot.addEventListener('click', toggleBubble);
    document.body.appendChild(robot);
    robotEl = robot;
  }

  function toggleBubble() {
    if (isTutorialDone()) {
      /* Q&A mode */
      const panel = document.getElementById('eylox-qa-panel');
      if (panel && panel.style.display !== 'none') {
        closeQA();
      } else {
        openQA();
      }
    } else {
      /* Tutorial mode */
      const bubble = document.getElementById('eylox-robot-bubble');
      if (!bubble) return;
      if (bubble.style.display === 'none') {
        bubble.style.display = '';
        showStep(currentStep);
      } else {
        bubble.style.display = 'none';
        if (_lastHighlight) { _lastHighlight.classList.remove('eylox-highlight-ring'); _lastHighlight = null; }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body?.dataset?.page || '';
    if (['login','landing'].some(p => page === p || location.pathname.includes(p))) return;

    buildRobot();

    if (!isTutorialDone()) {
      currentStep = parseInt(localStorage.getItem(STEP_KEY) || '0', 10);
      setTimeout(() => {
        const bubble = document.getElementById('eylox-robot-bubble');
        if (bubble) { bubble.style.display = ''; showStep(currentStep); }
      }, 1500);
    }
    /* If tutorial done, robot is available in Q&A mode — no auto-open */
  });

  /* ══════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════ */
  window.EyloxTutorial = {
    next() {
      const steps = getSteps();
      localStorage.setItem(STEP_KEY, String(currentStep + 1));
      if (currentStep + 1 >= steps.length) finishTutorial();
      else showStep(currentStep + 1);
    },
    skip()    { finishTutorial(); },
    restart() {
      localStorage.removeItem(SEEN_KEY);
      localStorage.removeItem(STEP_KEY);
      currentStep = 0;
      closeQA();
      if (robotEl) robotEl.classList.remove('qa-mode');
      const bubble = document.getElementById('eylox-robot-bubble');
      if (bubble) { bubble.style.display = ''; showStep(0); }
    },
    open:   toggleBubble,
    sendMsg: sendMsg,
    ask(text) {
      buildQAPanel();
      openQA();
      const input = document.getElementById('qaInput');
      const clean = text.replace(/[🎮⚔️🛒👑🎯🤖💰🏆🌐]/gu,'').trim();
      if (input) { input.value = clean; }
      setTimeout(sendMsg, 80);
    },
  };

})();
