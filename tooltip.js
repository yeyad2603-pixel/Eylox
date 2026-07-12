/* ============================================================
   EYLOX — AAA Tooltip + Tutorial System v3.0
   Glassmorphism tooltips + guided onboarding tour
   ============================================================ */
'use strict';

(function EyloxTooltips() {

  /* ═══════════════════════════════════════════════════════════
     SECTION 1 — TIP DEFINITIONS
  ═══════════════════════════════════════════════════════════ */
  const TIPS = {

    /* ── Navigation ── */
    'nav-home':         { icon:'🏠', title:'Home',              text:'Your main hub. See featured games, live events, and daily updates.',                                shortcut:'H' },
    'nav-games':        { icon:'🎮', title:'Discover Games',    text:'Browse and play all 2D and 3D games. 2D earns Coins, 3D earns Wins.',                               shortcut:'G' },
    'nav-shop':         { icon:'🛒', title:'Shop',              text:'Buy avatars, effects, game passes, and boosts using Coins or Wins.',                                 shortcut:'S' },
    'nav-achievements': { icon:'🎖️', title:'Achievements',      text:'Complete challenges to earn coins, rewards, and special badges.',                                   shortcut:'A' },
    'nav-messages':     { icon:'💬', title:'Messages',          text:'Chat with friends, start video calls, and share files.',                                             shortcut:'M' },
    'nav-ai':           { icon:'🤖', title:'AI Studio',         text:'Battle AI opponents, train skills, and get personalized coaching.',                                  shortcut:'I' },
    'nav-profile':      { icon:'👤', title:'Profile',           text:'View and edit your profile, stats, inventory, and avatar.',                                          shortcut:'P' },
    'nav-settings':     { icon:'⚙️', title:'Settings',          text:'Customize graphics, controls, language, and account preferences.',                                   shortcut:',' },
    'nav-leaderboard':  { icon:'🏆', title:'Leaderboard',       text:'See the top-ranked players on Eylox. Compete to reach #1!',                                          shortcut:'L' },
    'nav-friends':      { icon:'👥', title:'Friends',           text:'Add friends, see who\'s online, and send game invites.',                                             shortcut:'F' },
    'nav-communities':  { icon:'🌐', title:'Communities',       text:'Join gaming communities, share clips, and meet players with your interests.' },
    'nav-events':       { icon:'🔥', title:'Live Events',       text:'Join live multiplayer competitions for exclusive limited rewards.',                                   badge:'Live' },
    'nav-studio':       { icon:'🔧', title:'EYLOX Studio',      text:'Build your own 3D games with the AI-powered EYLOX Studio. No experience needed!',                   badge:'AI' },
    'nav-admin':        { icon:'👑', title:'Admin Panel',       text:'Owner-only control panel. Manage players, economy, and platform settings.',                          badge:'Owner' },
    'nav-logout':       { icon:'🚪', title:'Log Out',           text:'Sign out of your account. Your progress is saved automatically.',                                    warn:'You will be signed out' },
    'nav-subscription': { icon:'💎', title:'Subscription',      text:'Manage EYLOX Premium and Creator Pass, or upgrade your plan.' },
    'nav-help':         { icon:'❓', title:'Help Center',       text:'Answers to common questions about accounts, billing, and gameplay.' },
    'nav-safety':       { icon:'🛡️', title:'Safety',            text:'Our safety policies, privacy practices, and community guidelines.' },
    'nav-mygames':      { icon:'📚', title:'My Games',          text:'Games you\'ve published or saved, all in one place.' },
    'nav-devhub':       { icon:'🛠️', title:'Dev Hub',           text:'Developer tools, API access, and creator resources.' },
    'nav-inventory':    { icon:'🎒', title:'Inventory',         text:'Your owned avatars, effects, passes, and marketplace items.' },

    /* ── Topbar elements ── */
    'topbar-hamburger': { icon:'☰',  title:'Open Sidebar',      text:'Toggle the navigation sidebar to access all pages.' },
    'topbar-search':    { icon:'🔍', title:'Search Everything', text:'Find games, players, communities, shop items, and more.',                                            shortcut:'Ctrl+K' },
    'notif-btn':        { icon:'🔔', title:'Notifications',     text:'See your latest friend requests, event invites, and reward alerts.' },
    'tb-level':         { icon:'⭐', title:'Your Level',        text:'Earn XP by playing games and winning events to level up. Higher levels unlock exclusive rewards!' },
    'topbar-profile':   { icon:'👤', title:'Your Profile',      text:'Click to view your profile, stats, and quick settings.' },
    'tb-coins':         { icon:'💰', title:'Your Coins',        text:'Your current Coin balance. Play 2D games to earn more!' },
    'tb-Eyltrophs':      { icon:'🏆', title:'Your Trophies',     text:'Trophies are earned by winning competitions and completing challenges.' },
    'tb-wins':          { icon:'⚔️', title:'Your Wins',         text:'Your current Wins. Complete 3D games and live events to earn Wins!' },

    /* ── Currency ── */
    'Eylux':            { icon:'💰', title:'Coins',             text:'Earned by playing 2D games and completing challenges. Spend in the Shop.' },
    'wins':             { icon:'🏆', title:'Wins',              text:'Earned by completing 3D games and winning events. Buy premium items.' },

    /* ── XP / Level / Rank system ── */
    'xp-bar':           { icon:'⬆️', title:'XP Progress',       text:'Your experience points. Earn XP by winning events, playing games, and daily challenges. Fills up the bar to the next level!' },
    'xp-display':       { icon:'✨', title:'EyXP',  text:'XP is earned from event wins, daily missions, and special bonuses.' },
    'rank-display':     { icon:'🏅', title:'Your Rank',         text:'Ranks: Bronze → Silver → Gold → Platinum → Diamond. Win more events to climb!' },
    'rank-bronze':      { icon:'🟫', title:'Bronze Rank',       text:'Starting rank. Keep playing to earn XP and climb to Silver!' },
    'rank-silver':      { icon:'⬜', title:'Silver Rank',       text:'Solid rank! You\'ve won several events. Keep going for Gold.' },
    'rank-gold':        { icon:'🟡', title:'Gold Rank',         text:'Great rank! You\'re among the top players on Eylox.' },
    'rank-platinum':    { icon:'💠', title:'Platinum Rank',     text:'Elite rank! Only the best players reach Platinum. Impressive!' },
    'rank-diamond':     { icon:'💎', title:'Diamond Rank',      text:'The highest rank! You are a legendary Eylox champion.',                                              badge:'Elite' },
    'level-up-btn':     { icon:'🎉', title:'Level Up!',         text:'You\'ve levelled up! New rewards and ranks may be unlocked.' },

    /* ── Live Events ── */
    'events-btn':       { icon:'🔥', title:'Live Events Arena', text:'Join live multiplayer competitions with exclusive limited rewards. New events start every 30 minutes!', badge:'Live' },
    'event-join':       { icon:'🎯', title:'Join Event',        text:'Enter this event. You\'ll pay an entry fee and compete for the prize pool. Win to keep everything!' },
    'event-spectate':   { icon:'👁️', title:'Spectate',          text:'Watch the event without competing. Great way to learn strategies before entering.' },
    'event-card':       { icon:'🎮', title:'Event',             text:'Click to see full event details — prize, players, rules, and countdown timer.' },
    'event-entry-fee':  { icon:'💸', title:'Entry Fee',         text:'Coins you pay to join the event. Win to earn the full prize back plus more. Lose and the fee is gone.' },
    'event-prize':      { icon:'🏆', title:'Prize Pool',        text:'The total prize for winning this event. Comes directly from entry fees of all participants.' },
    'event-players':    { icon:'👥', title:'Live Players',      text:'Number of real players currently in or queued for this event.' },
    'event-status-live':{ icon:'🟢', title:'Event Live Now',    text:'This event is active right now! Join immediately to participate.' },
    'event-status-soon':{ icon:'🕐', title:'Starting Soon',     text:'This event begins very soon. Queue up now to guarantee your spot!' },
    'event-status-fill':{ icon:'⚡', title:'Filling Up',        text:'Spots are filling fast. Join now before it\'s full!' },

    /* ── Spin Wheel ── */
    'spin-wheel':       { icon:'🎡', title:'Eylox Prize Wheel', text:'Spin the wheel to land on a game. Win the event to earn the prize — shown on each segment.' },
    'spin-btn':         { icon:'🎰', title:'Spin the Wheel!',   text:'Click to spin! The wheel will land on a random game. Complete that game to win the event prize.' },
    'spin-segment':     { icon:'🎯', title:'Wheel Segment',     text:'Each segment shows a game and its prize. Landing here launches that game — win it to claim the coins!' },
    'spin-prize':       { icon:'💰', title:'Win Prize',         text:'The coins you\'ll earn if you win after the wheel lands on this segment.' },
    'wheel-ring':       { icon:'🌈', title:'Spin Ring',         text:'The glowing ring animates while you spin. Watch it slow down to see where you land!' },

    /* ── Matchmaking ── */
    'matchmaking-modal':{ icon:'🔍', title:'Finding Opponents', text:'Searching for real players near your skill level. Matchmaking picks players within 8 levels of you for fair competition.' },
    'mm-player-card':   { icon:'👤', title:'Player',            text:'A real Eylox player who joined this match. Their level, rank, and stats are shown.' },
    'mm-countdown':     { icon:'⏳', title:'Match Starting',    text:'The match countdown! When it hits zero, the wheel spins and the competition begins.' },
    'mm-rank-badge':    { icon:'🏅', title:'Player Rank',       text:'This player\'s current rank based on their XP and wins. Higher rank = stronger opponent.' },
    'mm-you-badge':     { icon:'🟢', title:'That\'s You!',      text:'Your player card in the lobby. Other players see this when they join the match.' },

    /* ── Result / Prize ── */
    'win-result':       { icon:'🏆', title:'You Won!',          text:'Congratulations! Your prize coins and XP are credited immediately when you click Claim.' },
    'loss-result':      { icon:'😔', title:'You Lost',          text:'Better luck next time! Your entry fee is not returned on a loss. Practice to improve your odds.' },
    'claim-btn':        { icon:'🎁', title:'Claim Prize',       text:'Click to collect your winnings — coins, XP, and Eyltrophs are all added to your account instantly!' },
    'xp-reward-display':{ icon:'⬆️', title:'XP Reward',         text:'XP earned from this win. Accumulate 1,000 XP per level to level up and unlock higher ranks.' },

    /* ── Shop tabs ── */
    'tab-featured':     { icon:'⭐', title:'Featured',          text:'Hand-picked daily deals and highlighted items. Changes every 24 hours!',                            badge:'Daily' },
    'tab-popular':      { icon:'🔥', title:'Popular',           text:'The most-purchased items across all Eylox players right now.' },
    'tab-limited':      { icon:'⏰', title:'Limited',           text:'Time-limited exclusive items. They disappear when the timer hits zero!',                            badge:'Limited' },
    'tab-avatars':      { icon:'👤', title:'Avatars',           text:'Character skins from Common to Legendary. Express your unique style.' },
    'tab-effects':      { icon:'✨', title:'Effects',           text:'Visual effects that follow your avatar: trails, auras, and glows.' },
    'tab-passes':       { icon:'🎟️', title:'Game Passes',       text:'Permanent perks: 2× XP, bonus Eylux, extra lives, and VIP access.' },
    'tab-rewards':      { icon:'🎁', title:'Rewards',           text:'Free items claimable by meeting milestones. Check back regularly!' },
    'tab-boosts':       { icon:'🚀', title:'Boosts',            text:'Temporary power-ups that enhance coin gain, XP, or abilities.' },

    /* ── Rarity ── */
    'rarity-common':    { icon:'⬜', title:'Common',            text:'Basic items. Free or cheap. Great for getting started!' },
    'rarity-rare':      { icon:'🟦', title:'Rare',              text:'Uncommon items with better designs. Worth saving up for.' },
    'rarity-epic':      { icon:'🟣', title:'Epic',              text:'High-quality items with special effects. Very sought after.' },
    'rarity-legendary': { icon:'🌟', title:'Legendary',         text:'The rarest and most powerful items. Only a few players own these.' },

    /* ── AI Studio tabs ── */
    'ai-battle':        { icon:'⚔️', title:'AI Battle',         text:'Fight against an AI opponent! Hit glowing targets to score points.',                               shortcut:'B' },
    'ai-training':      { icon:'🏋️', title:'Training',          text:'Practice your skills in a pressure-free zone. Losses are never counted.' },
    'ai-coach':         { icon:'🧠', title:'AI Coach',           text:'Get personalized tips and analysis based on your play style.' },
    'ai-analyzer':      { icon:'📊', title:'Analyzer',           text:'Deep stats: win rates, reaction time, best difficulty, and streaks.' },
    'ai-challenges':    { icon:'🎯', title:'Challenges',         text:'Daily and weekly AI challenges with escalating difficulty and rewards.' },
    'ai-diff-easy':     { icon:'🌿', title:'Easy Mode',          text:'Slow targets, 5 needed to win, 3 misses allowed. Perfect for beginners.' },
    'ai-diff-medium':   { icon:'🔥', title:'Medium Mode',        text:'Faster targets, more required hits. A solid challenge for most players.' },
    'ai-diff-hard':     { icon:'💀', title:'Hard Mode',          text:'Fast targets, strict rules. Only experienced players can beat this!',                             warn:'Tough challenge!' },
    'ai-diff-legend':   { icon:'👑', title:'Legend Mode',        text:'Max speed, any miss = instant loss. For legendary players only.',                                  warn:'Extremely hard' },
    'battle-btn':       { icon:'⚔️', title:'Start Battle',       text:'Begin the AI battle! Targets appear after a countdown — hit them fast!',                          shortcut:'Enter' },
    'ai-tournament':    { icon:'🏆', title:'Tournament',         text:'Compete in ranked AI tournaments against other Eylox players.',                                    badge:'Ranked' },
    'ai-season':        { icon:'📈', title:'Season Pass',        text:'Track your seasonal rank and exclusive season rewards progression.' },
    'ai-prestige':      { icon:'🌟', title:'Prestige',           text:'The ultimate endgame system. Prestige players get exclusive cosmetics.',                           badge:'Elite' },
    'ai-builder':       { icon:'🤖', title:'AI Builder',         text:'Build and train your own custom AI opponent with different behaviors.',                            badge:'AI' },
    'ai-npcs':          { icon:'🧬', title:'AI NPCs',            text:'Generate, customize, and deploy AI-powered NPCs into your games.',                                 badge:'AI' },

    /* ── Games page ── */
    'game-2d':          { icon:'🎮', title:'2D Game',            text:'Play to earn Coins 💰. Fun arcade-style games for all skill levels.' },
    'game-3d':          { icon:'🌍', title:'3D Game',            text:'Complete to earn Wins 🏆. Immersive 3D worlds with missions.' },
    'game-play-btn':    { icon:'▶️', title:'Play Now',           text:'Launch this game. You\'ll earn rewards based on your performance!' },
    'filter-all':       { icon:'🎮', title:'All Games',          text:'Show every available game — both 2D and 3D.' },
    'filter-2d':        { icon:'👾', title:'2D Games',           text:'Classic arcade-style games. Earn Coins when you play.' },
    'filter-3d':        { icon:'🌍', title:'3D Games',           text:'Immersive 3D worlds. Earn Wins when you complete them.' },
    'filter-hot':       { icon:'🔥', title:'Trending',           text:'The most-played games in the last 24 hours.' },
    'filter-new':       { icon:'✨', title:'New Games',          text:'Recently added games. Be among the first to play!' },
    'filter-featured':  { icon:'⭐', title:'Featured',           text:'Editor-picked games — the best Eylox has to offer.' },

    /* ── Leaderboard ── */
    'lb-Eyltrophs':      { icon:'🏆', title:'Eyltrophs',           text:'Overall trophy count — earn Eyltrophs by winning and completing challenges.' },
    'lb-coins':         { icon:'💰', title:'Coins Leaderboard',  text:'Players ranked by total Coins earned. Play 2D games to climb!' },
    'lb-wins':          { icon:'⚔️', title:'Wins Leaderboard',   text:'Players ranked by total Wins. Complete 3D games to rise up.' },
    'lb-games':         { icon:'🎮', title:'Games Played',       text:'Most active players by total number of games played.' },
    'lb-season':        { icon:'🏅', title:'Season Rank',        text:'Current season standings. Season resets every month.' },
    'lb-created':       { icon:'🛠️', title:'Game Creators',      text:'Top creators ranked by how many games they\'ve published.' },
    'lb-social':        { icon:'🤝', title:'Social',             text:'Players with the most friends, followers, and community engagement.' },
    'lb-weekly':        { icon:'📅', title:'Weekly',             text:'Rankings reset every Monday. Sprint to the top this week!' },
    'lb-alltime':       { icon:'🌟', title:'All Time',           text:'The greatest Eylox players ever. A permanent hall of fame.' },

    /* ── Achievements ── */
    'ach-progress':     { icon:'📊', title:'Achievement Progress',text:'How far you\'ve come toward completing this challenge.' },
    'ach-reward':       { icon:'🪙', title:'Coin Reward',         text:'Coins auto-credited when this achievement is completed.' },
    'ach-locked':       { icon:'🔒', title:'Locked',              text:'Complete the requirements to unlock and claim this achievement.' },
    'ach-owner':        { icon:'👑', title:'Creator Achievement', text:'Add "Eylox" as a friend to unlock this ultra-rare achievement!',                                  badge:'Legendary' },
    'ach-daily':        { icon:'📅', title:'Daily Challenge',     text:'Fresh challenge every day. Complete it for a daily bonus!' },

    /* ── Profile ── */
    'prof-edit':        { icon:'✏️', title:'Edit Profile',        text:'Update your username, bio, avatar, and social links.' },
    'prof-follow':      { icon:'👥', title:'Add Friend',          text:'Send a friend request. You\'ll see each other online and can join games.' },
    'prof-share':       { icon:'🔗', title:'Share Profile',       text:'Copy a shareable link to your Eylox profile.' },
    'prof-stats':       { icon:'📊', title:'Stats',               text:'Your complete gaming history: wins, coins, games played, and more.' },
    'prof-avatar':      { icon:'👤', title:'Avatar',              text:'Your current character skin. Change it anytime in the Shop.' },
    'prof-inventory':   { icon:'🎒', title:'Inventory',           text:'All the items, avatars, and effects you own.' },

    /* ── Friends ── */
    'friend-add':       { icon:'➕', title:'Add Friend',          text:'Send a friend request to this player.' },
    'friend-accept':    { icon:'✅', title:'Accept Request',      text:'Accept this friend request and become friends.' },
    'friend-decline':   { icon:'❌', title:'Decline',             text:'Decline this friend request.',                                                                     warn:'Cannot be undone' },
    'friend-remove':    { icon:'🚫', title:'Remove Friend',       text:'Remove this person from your friends list.',                                                       warn:'They won\'t be notified' },
    'friend-online':    { icon:'🟢', title:'Online',              text:'This player is currently active on Eylox.' },
    'friend-offline':   { icon:'⚫', title:'Offline',             text:'This player is not currently online.' },
    'friend-invite':    { icon:'🎮', title:'Invite to Game',      text:'Send this friend a game invite to join your current session.' },

    /* ── Communities ── */
    'comm-join':        { icon:'➕', title:'Join Community',      text:'Become a member of this community. Join discussions and share clips.' },
    'comm-create':      { icon:'🌐', title:'Create Community',    text:'Start your own gaming community. Invite friends and build a following.' },
    'comm-leave':       { icon:'🚪', title:'Leave Community',     text:'Remove yourself from this community.',                                                             warn:'You can rejoin anytime' },
    'comm-post':        { icon:'📝', title:'New Post',            text:'Share something with this community — text, clips, or highlights.' },

    /* ── Messages ── */
    'msg-send':         { icon:'📤', title:'Send Message',        text:'Send your message. Press Enter or click here.',                                                     shortcut:'Enter' },
    'msg-new':          { icon:'✉️', title:'New Conversation',    text:'Start a new direct message with any Eylox player.' },
    'msg-search':       { icon:'🔍', title:'Search Messages',     text:'Find past conversations by player name or message content.' },
    'msg-video':        { icon:'📹', title:'Video Call',          text:'Start a video call with this person. Requires camera permission.' },
    'msg-emoji':        { icon:'😊', title:'Emoji Picker',        text:'Add an emoji, reaction, or sticker to your message.' },
    'msg-attach':       { icon:'📎', title:'Attach File',         text:'Share a screenshot, clip, or file in the chat.' },

    /* ── Video Call ── */
    'vc-mute':          { icon:'🎤', title:'Toggle Mic',          text:'Mute or unmute your microphone during the call.',                                                   shortcut:'M' },
    'vc-cam':           { icon:'📷', title:'Toggle Camera',       text:'Turn your camera on or off. Virtual backgrounds work too!',                                         shortcut:'V' },
    'vc-bg':            { icon:'🖼️', title:'Backgrounds',         text:'Change your video background from 20+ virtual scenes.' },
    'vc-chat':          { icon:'💬', title:'In-Call Chat',        text:'Send text without interrupting the audio.' },
    'vc-effects':       { icon:'✨', title:'Video Effects',       text:'Apply filters: B&W, Neon, Warm, and more.' },
    'vc-end':           { icon:'📴', title:'End Call',            text:'Hang up and return to messages.',                                                                   warn:'This ends the call for everyone' },

    /* ── Settings ── */
    'set-controls':     { icon:'🎮', title:'Controls',            text:'Customize keyboard shortcuts, controller mappings, and sensitivity.' },
    'set-video':        { icon:'📺', title:'Video',               text:'Adjust resolution, frame rate, and brightness settings.' },
    'set-audio':        { icon:'🔊', title:'Audio',               text:'Control game audio, music, and UI sound effects volume.' },
    'set-appearance':   { icon:'🎨', title:'Appearance',          text:'Choose your theme, font size, animations, and background effect.' },
    'set-language':     { icon:'🌐', title:'Language',            text:'Change display language. Eylox supports 10+ languages.' },
    'set-account':      { icon:'👤', title:'Account',             text:'Update your email, password, linked accounts, and privacy settings.' },
    'set-security':     { icon:'🔒', title:'Security',            text:'Two-factor auth, active sessions, and login history.' },
    'set-graphics':     { icon:'🖥️', title:'Graphics',            text:'Higher quality looks better but may slow older devices.' },
    'set-devices':      { icon:'📱', title:'Devices',             text:'Manage connected controllers, headsets, and linked devices.' },
    'set-notif':        { icon:'🔔', title:'Notifications',       text:'Control which game, event, and friend alerts you receive.' },

    /* ── Ads system ── */
    'ad-card':          { icon:'🎬', title:'Featured Game',       text:'Click to see a full preview of this game. Press Play to launch it directly!' },
    'ad-like':          { icon:'❤️', title:'Like This Ad',        text:'Like this game or promotion to help it reach more players.' },
    'ad-cta':           { icon:'▶️', title:'Open Preview',        text:'Watch a cinematic preview of this game, then launch it with one click.' },
    'ad-sound':         { icon:'🔊', title:'Sound Toggle',        text:'Toggle audio preview on or off for this ad.' },
    'cinema-play':      { icon:'🎮', title:'Launch Game',         text:'Jump directly into this game. Your coins and XP carry over!' },
    'cinema-like':      { icon:'❤️', title:'Like Game',           text:'Like this game to support the creator and save it to your liked list.' },
    'creator-tools':    { icon:'🎬', title:'Creator Tools',       text:'Promote your own game with a custom ad campaign. Set a budget and reach all Eylox players.' },
    'ct-submit':        { icon:'🚀', title:'Launch Campaign',     text:'Spend your coins to promote your game as a featured ad on Eylox.' },

    /* ── Daily / Missions ── */
    'daily-reward':     { icon:'🎁', title:'Daily Reward',        text:'Claim your free daily reward! Resets every 24 hours. Don\'t miss a day!',                          badge:'Daily' },
    'mission-item':     { icon:'🎯', title:'Mission',             text:'Complete this mission to earn bonus Eylux, XP, and special rewards.' },
    'streak-counter':   { icon:'🔥', title:'Login Streak',        text:'Days in a row you\'ve logged in. Higher streaks = bigger daily rewards!' },

    /* ── Tutorial Robot ── */
    'robot-btn':        { icon:'🤖', title:'Tutorial Guide',      text:'Meet Botty! Click for a step-by-step tour of every Eylox feature.' },
    'tutorial-restart': { icon:'🔄', title:'Restart Tutorial',    text:'Replay the interactive tutorial from the beginning.' },

    /* ── Fortune widget ── */
    'fortune-btn':      { icon:'🔮', title:'Daily Fortune',       text:'Click to reveal your daily gaming fortune and claim a coin reward!',                               badge:'Daily' },

    /* ── Admin Panel ── */
    'admin-cmd':        { icon:'⚡', title:'Command Input',       text:'Type any admin command. Format: :command player [args]',                                           shortcut:'/' },
    'admin-movement':   { icon:'🎮', title:'Player & Movement',   text:'100 commands: teleport, speed, fly, ragdoll, freeze, and more.' },
    'admin-effects':    { icon:'🎭', title:'Effects & Fun',       text:'100 effects: fire, sparkles, rainbow, disco, glitch, and more.' },
    'admin-mod':        { icon:'⚖️', title:'Moderation',          text:'100 commands: ban, kick, mute, jail, anticheat, server control.' },
    'admin-economy':    { icon:'💰', title:'Economy & Items',     text:'100 commands: coins, wins, items, passes, VIP, marketplace.' },
    'admin-gamemodes':  { icon:'👑', title:'Game Modes',          text:'100 commands: events, bosses, NPCs, worlds, PvP, special modes.' },

    /* ── EYLOX Studio ── */
    'studio-nav':       { icon:'🔧', title:'EYLOX Studio',        text:'Open the AI-powered 3D game builder. Create your own games!',                                     badge:'AI' },
    'studio-play':      { icon:'▶️', title:'Play Test',           text:'Enter play mode to test your game. WASD to move, Space to jump.',                                  shortcut:'F5' },
    'studio-stop':      { icon:'⏹️', title:'Stop Test',           text:'Exit play mode and return to the editor.',                                                          shortcut:'Esc' },
    'studio-save':      { icon:'💾', title:'Save Scene',          text:'Save all objects and their positions to localStorage.',                                             shortcut:'Ctrl+S' },
    'studio-publish':   { icon:'🚀', title:'Publish Game',        text:'Share your game on Eylox for everyone to play!' },
    'studio-undo':      { icon:'↩️', title:'Undo',                text:'Undo the last action. Up to 50 steps back.',                                                       shortcut:'Ctrl+Z' },
    'studio-redo':      { icon:'↪️', title:'Redo',                text:'Redo the undone action.',                                                                           shortcut:'Ctrl+Y' },

    /* ── General actions ── */
    'btn-save':         { icon:'💾', title:'Save',                text:'Save your current progress.',                                                                      shortcut:'Ctrl+S' },
    'btn-back':         { icon:'◀️', title:'Go Back',             text:'Return to the previous page.' },
    'btn-close':        { icon:'✕',  title:'Close',               text:'Close this panel or modal.' },
    'btn-refresh':      { icon:'🔄', title:'Refresh',             text:'Reload the latest data.' },
    'btn-copy':         { icon:'📋', title:'Copy',                text:'Copy to clipboard.' },
    'btn-share':        { icon:'🔗', title:'Share',               text:'Share this with others.' },
    'btn-delete':       { icon:'🗑️', title:'Delete',             text:'Permanently remove this item.',                                                                     warn:'Cannot be undone' },
    'btn-edit':         { icon:'✏️', title:'Edit',                text:'Modify this item.' },
    'btn-play':         { icon:'▶️', title:'Play',                text:'Start playing now!' },
    'btn-claim':        { icon:'🎁', title:'Claim Reward',        text:'Claim your earned reward instantly!' },
    'btn-buy':          { icon:'🛒', title:'Purchase',            text:'Buy this item with your currency.' },
    'btn-equip':        { icon:'⚡', title:'Equip',               text:'Put on this item. It will appear on your avatar immediately.' },
    'btn-unequip':      { icon:'📦', title:'Unequip',             text:'Remove this item from your avatar.' },

    /* ── Game genres ── */
    'genre-all':        { icon:'🎮', title:'All Games',           text:'Show every game — 2D and 3D, all genres.' },
    'genre-adventure':  { icon:'🗺️', title:'Adventure',          text:'Explore open worlds, complete quests, and uncover secrets.' },
    'genre-action':     { icon:'⚡', title:'Action',              text:'Fast-paced combat, boss fights, and reaction-based gameplay.' },
    'genre-puzzle':     { icon:'🧩', title:'Puzzle',              text:'Brain teasers, logic challenges, and problem-solving games.' },
    'genre-racing':     { icon:'🏎️', title:'Racing',             text:'High-speed track races and time trial competitions.' },
    'genre-building':   { icon:'🏗️', title:'Building',           text:'Sandbox construction games. Build anything you imagine!' },
    'genre-survival':   { icon:'💀', title:'Survival',            text:'Survive waves of enemies, manage resources, and stay alive.' },
    'genre-roleplay':   { icon:'🎭', title:'Roleplay',            text:'RPG-style games with characters, stories, and progression.' },
  };

  /* ═══════════════════════════════════════════════════════════
     SECTION 2 — SELECTOR MAP
  ═══════════════════════════════════════════════════════════ */
  const SELECTOR_TIPS = [
    /* Topbar */
    { sel:'#sidebarToggle, .menu-btn',                                       key:'topbar-hamburger' },
    { sel:'.search-wrap, .search-input, #searchWrap, #topbarSearch',         key:'topbar-search' },
    { sel:'#notifBtn, .notif-btn, .tb-notif',                                key:'notif-btn' },
    { sel:'.tb-level, #tbLevel',                                             key:'tb-level' },
    { sel:'.tb-coins, #tbCoins, [class*="coins-display"]',                   key:'tb-coins' },
    { sel:'.tb-Eyltrophs, #tbTrophies, .tb-wins, #tbWins',                    key:'tb-Eyltrophs' },
    { sel:'.tb-avatar, #tbAvatar',                                           key:'topbar-profile' },

    /* Sidebar nav */
    { sel:'.sidebar-link[href="index.html"]',                                key:'nav-home' },
    { sel:'.sidebar-link[href="games.html"]',                                key:'nav-games' },
    { sel:'.sidebar-link[href="shop.html"]',                                 key:'nav-shop' },
    { sel:'.sidebar-link[href="achievements.html"]',                         key:'nav-achievements' },
    { sel:'.sidebar-link[href="messages.html"]',                             key:'nav-messages' },
    { sel:'.sidebar-link[href="ai.html"]',                                   key:'nav-ai' },
    { sel:'.sidebar-link[href="profile.html"]',                              key:'nav-profile' },
    { sel:'.sidebar-link[href="settings.html"]',                             key:'nav-settings' },
    { sel:'.sidebar-link[href="leaderboard.html"], .sidebar-link[href="leaderboards.html"]', key:'nav-leaderboard' },
    { sel:'.sidebar-link[href="friends.html"]',                              key:'nav-friends' },
    { sel:'.sidebar-link[href="communities.html"]',                          key:'nav-communities' },
    { sel:'.sidebar-link[href="events.html"]',                               key:'nav-events' },
    { sel:'.sidebar-link[href="eylox-studio.html"]',                         key:'nav-studio' },
    { sel:'.sidebar-link[href="admin.html"]',                                key:'nav-admin' },
    { sel:'.sidebar-link[href="subscription.html"]',                         key:'nav-subscription' },
    { sel:'.sidebar-link[href="help.html"]',                                 key:'nav-help' },
    { sel:'.sidebar-link[href="safety.html"]',                               key:'nav-safety' },
    { sel:'.sidebar-link[href="my-games.html"]',                             key:'nav-mygames' },
    { sel:'.sidebar-link[href="dev-hub.html"]',                              key:'nav-devhub' },
    { sel:'.sidebar-link[href="inventory.html"]',                            key:'nav-inventory' },
    { sel:'.sb-action[onclick*="Logout"], .sb-action[onclick*="logout"]',    key:'nav-logout' },

    /* Settings nav */
    { sel:'[data-section="controls"], .s-nav-item[onclick*="controls"]',     key:'set-controls' },
    { sel:'[data-section="video"],    .s-nav-item[onclick*="video"]',        key:'set-video' },
    { sel:'[data-section="audio"],    .s-nav-item[onclick*="audio"]',        key:'set-audio' },
    { sel:'[data-section="appearance"],.s-nav-item[onclick*="appearance"]',  key:'set-appearance' },
    { sel:'[data-section="language"], .s-nav-item[onclick*="language"]',     key:'set-language' },
    { sel:'[data-section="account"],  .s-nav-item[onclick*="account"]',      key:'set-account' },
    { sel:'[data-section="security"], .s-nav-item[onclick*="security"]',     key:'set-security' },
    { sel:'[data-section="graphics"], .s-nav-item[onclick*="graphics"]',     key:'set-graphics' },
    { sel:'[data-section="devices"],  .s-nav-item[onclick*="devices"]',      key:'set-devices' },

    /* Shop tabs */
    { sel:'[data-tab="featured"]',  key:'tab-featured' },
    { sel:'[data-tab="popular"]',   key:'tab-popular' },
    { sel:'[data-tab="limited"]',   key:'tab-limited' },
    { sel:'[data-tab="avatars"]',   key:'tab-avatars' },
    { sel:'[data-tab="effects"]',   key:'tab-effects' },
    { sel:'[data-tab="passes"]',    key:'tab-passes' },
    { sel:'[data-tab="rewards"]',   key:'tab-rewards' },
    { sel:'[data-tab="boosts"]',    key:'tab-boosts' },

    /* Game filter tabs */
    { sel:'.filter-tab[data-filter="all"], .game-tab[data-filter="all"]',         key:'filter-all' },
    { sel:'.filter-tab[data-filter="2d"],  .game-tab[data-filter="2d"]',          key:'filter-2d' },
    { sel:'.filter-tab[data-filter="3d"],  .game-tab[data-filter="3d"]',          key:'filter-3d' },
    { sel:'.filter-tab[data-filter="hot"], .game-tab[data-filter="hot"]',         key:'filter-hot' },
    { sel:'.filter-tab[data-filter="new"], .game-tab[data-filter="new"]',         key:'filter-new' },
    { sel:'.filter-tab[data-filter="featured"],.game-tab[data-filter="featured"]',key:'filter-featured' },

    /* Leaderboard tabs */
    { sel:'[data-tab="coins"],   .lb-tab[data-tab="coins"]',   key:'lb-coins' },
    { sel:'[data-tab="wins"],    .lb-tab[data-tab="wins"]',    key:'lb-wins' },
    { sel:'[data-tab="weekly"],  .lb-tab[data-tab="weekly"]',  key:'lb-weekly' },
    { sel:'[data-tab="alltime"], .lb-tab[data-tab="alltime"]', key:'lb-alltime' },

    /* AI tabs */
    { sel:'.ai-tab[data-tab="battle"]',     key:'ai-battle' },
    { sel:'.ai-tab[data-tab="training"]',   key:'ai-training' },
    { sel:'.ai-tab[data-tab="coach"]',      key:'ai-coach' },
    { sel:'.ai-tab[data-tab="analyze"]',    key:'ai-analyzer' },
    { sel:'.ai-tab[data-tab="challenges"]', key:'ai-challenges' },
    { sel:'#battleBtn, .ai-battle-btn',     key:'battle-btn' },

    /* Live events */
    { sel:'#tb-events-btn, .events-fab',    key:'events-btn' },
    { sel:'.event-join-btn',                key:'event-join' },
    { sel:'.ev-card, .event-card',          key:'event-card' },
    { sel:'.spin-btn, #spinBtn',            key:'spin-btn' },
    { sel:'.wheel-circle, #spinWheel, .spin-wheel', key:'spin-wheel' },
    { sel:'.wheel-ring',                    key:'wheel-ring' },
    { sel:'#matchmakingModal',              key:'matchmaking-modal' },
    { sel:'.mm-player-card',               key:'mm-player-card' },
    { sel:'#mmCountdown',                   key:'mm-countdown' },
    { sel:'.claim-btn, #claimBtn',          key:'claim-btn' },

    /* XP / level / rank */
    { sel:'.xp-bar, .xp-fill, .xp-progress',key:'xp-bar' },
    { sel:'.rank-badge, .ev-rank-chip, .mm-rank', key:'rank-display' },
    { sel:'.level-display, .player-level',  key:'xp-display' },

    /* Ads system */
    { sel:'.eylox-ad',                      key:'ad-card' },
    { sel:'[data-ad-like]',                 key:'ad-like' },
    { sel:'[data-ad-cta]',                  key:'ad-cta' },
    { sel:'[data-ad-sound]',                key:'ad-sound' },
    { sel:'#adCinemaPlayBtn',               key:'cinema-play' },
    { sel:'#adCinemaLikeBtn',               key:'cinema-like' },
    { sel:'#ctSubmitBtn',                   key:'ct-submit' },
    { sel:'#creatorToolsStrip',             key:'creator-tools' },

    /* Misc widgets */
    { sel:'#fortune-widget',                key:'fortune-btn' },
    { sel:'#eylox-robot, .robot-btn',       key:'robot-btn' },

    /* Video call controls */
    { sel:'#vcBtnMute,  .vc-btn[title*="Mute"]',      key:'vc-mute' },
    { sel:'#vcBtnCam,   .vc-btn[title*="Camera"]',    key:'vc-cam' },
    { sel:'.vc-btn[title*="Background"]',              key:'vc-bg' },
    { sel:'.vc-btn[title*="Chat"]',                    key:'vc-chat' },
    { sel:'.vc-btn[title*="Effects"]',                 key:'vc-effects' },
    { sel:'.vc-end-btn',                               key:'vc-end' },

    /* Admin */
    { sel:'#cmdInput',            key:'admin-cmd' },
    { sel:'[data-cat="movement"]',key:'admin-movement' },
    { sel:'[data-cat="effects"]', key:'admin-effects' },
    { sel:'[data-cat="moderation"]',key:'admin-mod' },
    { sel:'[data-cat="economy"]', key:'admin-economy' },
    { sel:'[data-cat="gamemodes"]',key:'admin-gamemodes' },

    /* Daily rewards / missions */
    { sel:'.daily-reward-btn, .claim-day-btn', key:'daily-reward' },
    { sel:'.mission-item, .mission-card',      key:'mission-item' },
    { sel:'.streak-count, .streak-num',        key:'streak-counter' },
  ];

  /* ═══════════════════════════════════════════════════════════
     SECTION 3 — TEXT-CONTENT DETECTION
  ═══════════════════════════════════════════════════════════ */
  const TEXT_TIPS = [
    { text:'Controls',    key:'set-controls',   sel:'.s-nav-item' },
    { text:'Video',       key:'set-video',       sel:'.s-nav-item' },
    { text:'Audio',       key:'set-audio',       sel:'.s-nav-item' },
    { text:'Appearance',  key:'set-appearance',  sel:'.s-nav-item' },
    { text:'Language',    key:'set-language',    sel:'.s-nav-item' },
    { text:'Account',     key:'set-account',     sel:'.s-nav-item' },
    { text:'Security',    key:'set-security',    sel:'.s-nav-item' },
    { text:'Graphics',    key:'set-graphics',    sel:'.s-nav-item' },
    { text:'Devices',     key:'set-devices',     sel:'.s-nav-item' },
    { text:'Log Out',     key:'nav-logout',      sel:'.sidebar-link,.sb-action' },
    { text:'EYLOX Studio',key:'nav-studio',      sel:'.sidebar-link' },
    { text:'Spin',        key:'spin-btn',        sel:'button' },
    { text:'Claim Prize', key:'claim-btn',       sel:'button' },
    { text:'Join Event',  key:'event-join',      sel:'button,.ev-join-btn' },
  ];

  /* ═══════════════════════════════════════════════════════════
     SECTION 4 — TOOLTIP ENGINE
  ═══════════════════════════════════════════════════════════ */
  let _tipEl = null, _hideTimer = null, _showTimer = null, _currentTarget = null;
  const TIP_DELAY = 420; // ms before tooltip appears

  function injectCSS() {
    if (document.getElementById('eylox-tt-css')) return;
    const s = document.createElement('style');
    s.id = 'eylox-tt-css';
    s.textContent = `
      @keyframes ttIn  { from{opacity:0;transform:translateY(7px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes ttOut { from{opacity:1} to{opacity:0;transform:translateY(4px) scale(.97)} }

      #eylox-tt {
        position:fixed;z-index:999997;pointer-events:none;
        max-width:300px;min-width:170px;
        background:rgba(6,2,16,.97);
        border:1px solid rgba(167,139,250,.24);
        border-radius:14px;padding:12px 15px 11px;
        backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
        box-shadow:0 20px 60px rgba(0,0,0,.75),0 0 0 1px rgba(167,139,250,.07),
                   inset 0 1px 0 rgba(255,255,255,.04);
        animation:ttIn .2s cubic-bezier(.22,1,.36,1) both;
        will-change:transform,opacity;
      }
      #eylox-tt.hiding { animation:ttOut .15s ease both; }

      .tt-head { display:flex;align-items:center;gap:8px;margin-bottom:5px; }
      .tt-icon { font-size:1rem;flex-shrink:0;line-height:1; }
      .tt-title { font-size:.8rem;font-weight:900;color:#fff;
        font-family:'Fredoka One',cursive;letter-spacing:.02em;line-height:1.2; }
      .tt-badge { font-size:.52rem;font-weight:900;padding:2px 6px;border-radius:99px;
        background:rgba(167,139,250,.18);color:#a78bfa;border:1px solid rgba(167,139,250,.25);
        margin-left:3px;letter-spacing:.3px;text-transform:uppercase;white-space:nowrap;flex-shrink:0; }
      .tt-badge.new      { background:rgba(74,222,128,.15);color:#4ade80;border-color:rgba(74,222,128,.3); }
      .tt-badge.live     { background:rgba(239,68,68,.18);color:#f87171;border-color:rgba(239,68,68,.3);
        animation:ttBadgeLive 1.2s ease-in-out infinite; }
      @keyframes ttBadgeLive { 0%,100%{opacity:1}50%{opacity:.6} }
      .tt-badge.limited  { background:rgba(245,158,11,.15);color:#f59e0b;border-color:rgba(245,158,11,.28); }
      .tt-badge.legendary{ background:rgba(251,191,36,.15);color:#fbbf24;border-color:rgba(251,191,36,.28); }
      .tt-badge.daily    { background:rgba(96,165,250,.15);color:#60a5fa;border-color:rgba(96,165,250,.28); }
      .tt-badge.owner    { background:rgba(251,191,36,.18);color:#fbbf24;border-color:rgba(251,191,36,.28); }
      .tt-badge.ranked   { background:rgba(167,139,250,.18);color:#a78bfa;border-color:rgba(167,139,250,.3); }
      .tt-badge.elite    { background:linear-gradient(135deg,rgba(124,58,237,.35),rgba(236,72,153,.25));
        color:#e879f9;border-color:rgba(236,72,153,.35); }
      .tt-badge.ai       { background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.2));
        color:#c4b5fd;border-color:rgba(167,139,250,.35); }

      .tt-divider { height:1px;background:rgba(167,139,250,.1);margin:7px 0; }
      .tt-text { font-size:.74rem;color:rgba(210,195,240,.72);font-weight:600;line-height:1.55; }
      .tt-footer { display:flex;align-items:center;justify-content:space-between;margin-top:7px; }
      .tt-shortcut { font-size:.63rem;background:rgba(167,139,250,.1);
        border:1px solid rgba(167,139,250,.2);border-radius:5px;
        padding:1px 7px;color:rgba(167,139,250,.75);
        font-family:'JetBrains Mono','Fira Code','Courier New',monospace;font-weight:700; }
      .tt-warn { font-size:.63rem;color:#f87171;font-weight:800;display:flex;align-items:center;gap:3px; }

      .tt-arrow { position:absolute;width:8px;height:8px;
        background:rgba(6,2,16,.97);border:1px solid rgba(167,139,250,.24);
        transform:rotate(45deg); }
      .tt-arrow.arrow-down { bottom:-5px;border-top:none;border-left:none; }
      .tt-arrow.arrow-up   { top:-5px;border-bottom:none;border-right:none; }
      .tt-arrow.arrow-left { left:-5px;top:50%;margin-top:-4px;border-top:none;border-right:none; }
      .tt-arrow.arrow-right{ right:-5px;top:50%;margin-top:-4px;border-bottom:none;border-left:none; }

      /* Subtle lift on tipped elements */
      [data-eylox-tip]:not(.no-tip-scale) {
        transition:transform .15s ease,box-shadow .15s ease;
      }
      [data-eylox-tip]:hover:not(.no-tip-scale):not(.eylox-ad):not(.sidebar-link):not(.game-card) {
        transform:translateY(-1px);
      }

      /* ── Tutorial overlay ── */
      #tt-tour-overlay {
        position:fixed;inset:0;z-index:999980;pointer-events:all;
        background:transparent;
        display:none;
      }
      #tt-tour-overlay.active { display:block; }

      #tt-spot {
        position:absolute;border-radius:14px;
        box-shadow:0 0 0 9999px rgba(3,1,12,.86);
        border:2px solid rgba(167,139,250,.65);
        pointer-events:none;
        transition:all .38s cubic-bezier(.34,1.2,.64,1);
        animation:spotPulse 2.2s ease-in-out infinite;
        z-index:1;
      }
      @keyframes spotPulse {
        0%,100%{ box-shadow:0 0 0 9999px rgba(3,1,12,.86),0 0 0 4px rgba(167,139,250,0),0 0 24px rgba(167,139,250,.25); }
        50%    { box-shadow:0 0 0 9999px rgba(3,1,12,.86),0 0 0 8px rgba(167,139,250,.18),0 0 40px rgba(167,139,250,.4); }
      }
      #tt-spot.no-highlight { box-shadow:0 0 0 9999px rgba(3,1,12,.9) !important; border:none; animation:none; }

      #tt-tour-card {
        position:fixed;z-index:999995;
        width:320px;max-width:calc(100vw - 32px);
        background:rgba(8,4,22,.98);
        border:1px solid rgba(167,139,250,.3);
        border-radius:20px;padding:22px 22px 18px;
        backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
        box-shadow:0 32px 80px rgba(0,0,0,.85),0 0 0 1px rgba(167,139,250,.08),
                   inset 0 1px 0 rgba(255,255,255,.05);
        display:none;
        animation:tourCardIn .32s cubic-bezier(.22,1,.36,1) both;
      }
      #tt-tour-card.active { display:block; }
      @keyframes tourCardIn { from{opacity:0;transform:scale(.92) translateY(10px)} }

      .tour-step-icon { font-size:2.2rem;margin-bottom:10px;display:block;text-align:center; }
      .tour-step-title {
        font-family:'Fredoka One',cursive;font-size:1.25rem;color:#fff;
        text-align:center;margin-bottom:8px;line-height:1.2;
      }
      .tour-step-text {
        font-size:.82rem;color:rgba(210,195,240,.72);font-weight:600;
        line-height:1.6;text-align:center;margin-bottom:16px;
      }
      .tour-progress {
        display:flex;align-items:center;justify-content:center;
        gap:6px;margin-bottom:16px;
      }
      .tour-dot {
        width:7px;height:7px;border-radius:50%;
        background:rgba(167,139,250,.22);
        transition:background .2s,transform .2s;
      }
      .tour-dot.active {
        background:#a78bfa;transform:scale(1.3);
        box-shadow:0 0 8px rgba(167,139,250,.6);
      }
      .tour-dot.done { background:rgba(167,139,250,.5); }
      .tour-actions {
        display:flex;align-items:center;gap:10px;
      }
      .tour-btn-prev, .tour-btn-next, .tour-btn-skip {
        border:none;border-radius:99px;cursor:pointer;
        font-family:'Fredoka One',cursive;font-size:.9rem;
        padding:9px 18px;transition:filter .15s,transform .15s;
      }
      .tour-btn-prev {
        background:rgba(167,139,250,.1);color:rgba(167,139,250,.7);
        border:1px solid rgba(167,139,250,.2);flex-shrink:0;
      }
      .tour-btn-prev:hover { filter:brightness(1.2); transform:scale(1.03); }
      .tour-btn-next {
        flex:1;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;
        box-shadow:0 6px 20px rgba(124,58,237,.4);
      }
      .tour-btn-next:hover { filter:brightness(1.1); transform:translateY(-1px); }
      .tour-btn-skip {
        font-size:.72rem;color:rgba(167,139,250,.4);background:none;
        padding:6px 10px;font-family:'Nunito',sans-serif;font-weight:800;
        margin-left:auto;
      }
      .tour-btn-skip:hover { color:rgba(167,139,250,.7); }

      .tour-card-arrow {
        position:absolute;width:10px;height:10px;
        background:rgba(8,4,22,.98);border:1px solid rgba(167,139,250,.3);
        transform:rotate(45deg);
      }
      .tour-card-arrow.arr-left  { left:-6px;top:50%;margin-top:-5px;border-top:none;border-right:none; }
      .tour-card-arrow.arr-right { right:-6px;top:50%;margin-top:-5px;border-bottom:none;border-left:none; }
      .tour-card-arrow.arr-up    { top:-6px;left:50%;margin-left:-5px;border-bottom:none;border-right:none; }
      .tour-card-arrow.arr-down  { bottom:-6px;left:50%;margin-left:-5px;border-top:none;border-left:none; }
      .tour-card-arrow.hidden    { display:none; }

      @media(max-width:520px) {
        #tt-tour-card { width:calc(100vw - 24px); left:12px !important; right:12px; }
        .tour-card-arrow { display:none; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Build and show tooltip ── */
  function buildTipEl(tip, target) {
    if (_tipEl) { _tipEl.remove(); _tipEl = null; }
    const el = document.createElement('div');
    el.id = 'eylox-tt';
    const badge = tip.badge
      ? `<span class="tt-badge ${(tip.badge||'').toLowerCase().replace(/\s+/g,'-')}">${tip.badge}</span>`
      : '';
    const hasFooter = tip.shortcut || tip.warn;
    el.innerHTML = `
      <div class="tt-head">
        <span class="tt-icon">${tip.icon}</span>
        <span class="tt-title">${tip.title}</span>${badge}
      </div>
      <div class="tt-divider"></div>
      <div class="tt-text">${tip.text}</div>
      ${hasFooter ? `<div class="tt-footer">
        ${tip.shortcut ? `<span class="tt-shortcut">⌨ ${tip.shortcut}</span>` : '<span></span>'}
        ${tip.warn     ? `<span class="tt-warn">⚠️ ${tip.warn}</span>`          : ''}
      </div>` : ''}
      <div class="tt-arrow" id="tt-arrow"></div>`;
    document.body.appendChild(el);
    _tipEl = el;
    positionTip(target);
  }

  function positionTip(target) {
    if (!_tipEl || !target) return;
    const rect = target.getBoundingClientRect();
    const tw = _tipEl.offsetWidth  || 240;
    const th = _tipEl.offsetHeight || 80;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 11;
    const arrow = document.getElementById('tt-arrow');
    let top, left, arrowClass = 'arrow-down';

    if (rect.top - th - gap > 8) {
      top = rect.top - th - gap; arrowClass = 'arrow-down';
    } else if (rect.bottom + th + gap < vh - 8) {
      top = rect.bottom + gap; arrowClass = 'arrow-up';
    } else if (rect.left - tw - gap > 8) {
      top = rect.top + rect.height / 2 - th / 2;
      left = rect.left - tw - gap; arrowClass = 'arrow-right';
    } else {
      top = rect.bottom + gap; arrowClass = 'arrow-up';
    }

    if (left === undefined) {
      left = rect.left + rect.width / 2 - tw / 2;
      left = Math.max(10, Math.min(left, vw - tw - 10));
    }
    top = Math.max(8, Math.min(top, vh - th - 8));

    _tipEl.style.top  = top + 'px';
    _tipEl.style.left = left + 'px';
    if (arrow) {
      arrow.className = 'tt-arrow ' + arrowClass;
      if (arrowClass === 'arrow-down' || arrowClass === 'arrow-up') {
        const arrowX = (rect.left + rect.width / 2) - left - 4;
        arrow.style.left = Math.max(12, Math.min(arrowX, tw - 20)) + 'px';
        arrow.style.top = '';
      }
    }
  }

  function showTip(target, key) {
    const tip = TIPS[key];
    if (!tip) return;
    clearTimeout(_hideTimer);
    clearTimeout(_showTimer);
    _showTimer = setTimeout(() => {
      _currentTarget = target;
      buildTipEl(tip, target);
    }, TIP_DELAY);
  }

  function hideTip() {
    clearTimeout(_showTimer);
    if (!_tipEl) return;
    _tipEl.classList.add('hiding');
    _hideTimer = setTimeout(() => {
      if (_tipEl) { _tipEl.remove(); _tipEl = null; }
      _currentTarget = null;
    }, 150);
  }

  function attachTip(el, key) {
    if (el._ttAttached) return;
    el._ttAttached = true;
    el.setAttribute('data-eylox-tip', key);
    el.addEventListener('mouseenter', () => showTip(el, key));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('mousedown',  hideTip);
    el.addEventListener('touchstart', () => { showTip(el, key); setTimeout(hideTip, 2800); }, { passive:true });
    el.addEventListener('focus', () => { clearTimeout(_showTimer); _showTimer = setTimeout(() => { _currentTarget = el; buildTipEl(TIPS[key], el); }, 200); });
    el.addEventListener('blur',  hideTip);
  }

  function tipFromText(text) {
    const t = text.trim();
    if (t.length < 2) return null;
    return { icon:'ℹ️', title: t, text: t };
  }

  function attachAll() {
    /* 1. Explicit data-tip */
    document.querySelectorAll('[data-tip]').forEach(el => {
      const k = el.getAttribute('data-tip');
      if (k && TIPS[k]) attachTip(el, k);
    });

    /* 2. CSS selector map */
    SELECTOR_TIPS.forEach(({ sel, key }) => {
      try { document.querySelectorAll(sel).forEach(el => { if (!el._ttAttached && TIPS[key]) attachTip(el, key); }); }
      catch {}
    });

    /* 3. Text-content detection */
    TEXT_TIPS.forEach(({ text, key, sel }) => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (el._ttAttached) return;
          const lbl = el.querySelector('.s-label,.ni-label') || el;
          if (lbl && lbl.textContent.trim() === text && TIPS[key]) attachTip(el, key);
        });
      } catch {}
    });

    /* 4. title attribute fallback */
    document.querySelectorAll('[title]:not([data-eylox-tip])').forEach(el => {
      if (el._ttAttached) return;
      const t = el.getAttribute('title');
      if (!t || t.length < 2) return;
      const tip = tipFromText(t);
      if (!tip) return;
      const k = 'title_' + t.replace(/\s+/g,'_').slice(0, 32);
      if (!TIPS[k]) TIPS[k] = tip;
      attachTip(el, k);
    });

    /* 5. Game cards */
    document.querySelectorAll('.game-card, .game-item').forEach(el => {
      if (el._ttAttached) return;
      const is3D = /game3d|3d/i.test(el.dataset.gameId || el.id || el.className || '');
      attachTip(el, is3D ? 'game-3d' : 'game-2d');
    });

    /* 6. Shop rarity */
    document.querySelectorAll('.sh-rarity,.sh-r-common,.sh-r-rare,.sh-r-epic,.sh-r-legendary').forEach(el => {
      if (el._ttAttached) return;
      const r = el.classList.contains('sh-r-legendary') ? 'rarity-legendary'
              : el.classList.contains('sh-r-epic')      ? 'rarity-epic'
              : el.classList.contains('sh-r-rare')      ? 'rarity-rare' : 'rarity-common';
      attachTip(el, r);
    });

    /* 7. Currency price labels */
    document.querySelectorAll('.sh-price-win').forEach(el => { if (!el._ttAttached) attachTip(el, 'wins'); });
    document.querySelectorAll('.sh-price-coin').forEach(el => { if (!el._ttAttached) attachTip(el, 'Eylux'); });

    /* 8. Achievement cards */
    document.querySelectorAll('.ach-item, .ach-card').forEach(el => {
      if (el._ttAttached) return;
      const isOwner = el.querySelector('.badge-owner,[data-id="add_owner"]');
      attachTip(el, isOwner ? 'ach-owner' : 'ach-progress');
    });

    /* 9. AI difficulty buttons */
    ['easy','medium','hard','legend'].forEach(d => {
      document.querySelectorAll(`.ai-diff-btn.${d},[data-diff="${d}"]`).forEach(el => {
        if (!el._ttAttached) attachTip(el, `ai-diff-${d}`);
      });
    });

    /* 10. Play, buy, equip buttons */
    document.querySelectorAll('.play-btn,.btn-play,[data-action="play"]').forEach(el => { if (!el._ttAttached) attachTip(el, 'game-play-btn'); });
    document.querySelectorAll('.buy-btn,.sh-buy-btn,[data-action="buy"]').forEach(el => { if (!el._ttAttached) attachTip(el, 'btn-buy'); });
    document.querySelectorAll('.equip-btn,[data-action="equip"]').forEach(el => { if (!el._ttAttached) attachTip(el, 'btn-equip'); });

    /* 11. Spin wheel segments */
    document.querySelectorAll('.wheel-segment, .wh-seg').forEach(el => {
      if (!el._ttAttached) attachTip(el, 'spin-segment');
    });

    /* 12. Event entry/prize info */
    document.querySelectorAll('.ev-entry, .entry-fee, [class*="entry-fee"]').forEach(el => {
      if (!el._ttAttached) attachTip(el, 'event-entry-fee');
    });
    document.querySelectorAll('.ev-prize, .prize-pool, [class*="prize"]').forEach(el => {
      if (!el._ttAttached && !el.closest('#spinModal')) attachTip(el, 'event-prize');
    });

    /* 13. Close / X buttons inside modals */
    document.querySelectorAll('.spin-close-btn, .modal-close, [onclick*="close"], [onclick*="Close"]').forEach(el => {
      if (!el._ttAttached) attachTip(el, 'btn-close');
    });

    /* 14. Event live/soon status badges */
    document.querySelectorAll('.ev-status-live, .status-live').forEach(el => { if (!el._ttAttached) attachTip(el, 'event-status-live'); });
    document.querySelectorAll('.ev-status-soon, .status-soon').forEach(el => { if (!el._ttAttached) attachTip(el, 'event-status-soon'); });
    document.querySelectorAll('.ev-status-fill, .status-filling').forEach(el => { if (!el._ttAttached) attachTip(el, 'event-status-fill'); });
  }

  /* ── MutationObserver for dynamic content ── */
  function watchDOM() {
    const obs = new MutationObserver(() => setTimeout(attachAll, 150));
    obs.observe(document.body, { childList:true, subtree:true });
  }

  window.addEventListener('scroll', () => { if (_tipEl && _currentTarget) positionTip(_currentTarget); }, { passive:true });
  window.addEventListener('resize', () => {
    if (_tipEl) { hideTip(); }
    if (_tourCard) tourPositionCard(TourState.steps[TourState.step]);
  }, { passive:true });

  /* ═══════════════════════════════════════════════════════════
     SECTION 5 — TOUR / TUTORIAL SYSTEM
  ═══════════════════════════════════════════════════════════ */
  const HOME_STEPS = [
    {
      target: null,
      icon: '👋',
      title: 'Welcome to Eylox!',
      text: 'You\'re about to discover everything this platform has to offer — games, live events, a shop, friends, and much more. This quick tour will show you around step by step.',
      noHighlight: true,
    },
    {
      target: '.sidebar',
      icon: '🗺️',
      title: 'Your Navigation Hub',
      text: 'The sidebar on the left is how you get everywhere on Eylox. Click any icon to jump to Games, Live Events, the Shop, your Profile, and more.',
    },
    {
      target: '.tb-coins, #tbCoins',
      icon: '💰',
      title: 'Your Coin Balance',
      text: 'Coins are your main currency. Earn them by playing 2D games and completing daily missions. Spend them in the Shop or use them to enter Live Events.',
    },
    {
      target: '.tb-Eyltrophs, #tbTrophies',
      icon: '🏆',
      title: 'Your Trophies',
      text: 'Trophies are earned by winning competitions and completing special challenges. The more you have, the higher you appear on the leaderboard!',
    },
    {
      target: '.tb-level, #tbLevel',
      icon: '⭐',
      title: 'Your Level & XP',
      text: 'Every time you play or win, you earn XP. Rack up 1,000 XP to level up! Higher levels unlock new ranks — Bronze, Silver, Gold, Platinum, and Diamond.',
    },
    {
      target: '[aria-labelledby="continue-heading"], .section:nth-of-type(2)',
      icon: '▶️',
      title: 'Continue Playing',
      text: 'Jump straight back into games you\'ve played before. Your progress and coins earned are always saved here.',
    },
    {
      target: '.sidebar-link[href="events.html"]',
      icon: '🔥',
      title: 'Live Events Arena',
      text: 'This is where the real action is! Join live multiplayer competitions every 30 minutes. Pay an entry fee, spin the wheel, play the game — win to take the prize!',
    },
    {
      target: '.sidebar-link[href="shop.html"]',
      icon: '🛒',
      title: 'The Shop',
      text: 'Spend your hard-earned coins on avatar skins, visual effects, game passes, and temporary boosts. New items appear daily!',
    },
    {
      target: '.sidebar-link[href="profile.html"]',
      icon: '👤',
      title: 'Your Profile',
      text: 'View your stats, customize your avatar, check your inventory, and share your profile with other players.',
    },
    {
      target: null,
      icon: '🚀',
      title: 'You\'re Ready to Play!',
      text: 'That\'s the tour! Head to Live Events for your first competition, or jump into a game from the Games page. Good luck — have fun!',
      noHighlight: true,
      isLast: true,
    },
  ];

  const EVENTS_STEPS = [
    {
      target: null,
      icon: '🎡',
      title: 'Welcome to Live Events!',
      text: 'This is the competitive heart of Eylox. Real players compete in real-time. New events open every 30 minutes — here\'s how to win.',
      noHighlight: true,
    },
    {
      target: '.ev-hero, .ev-events-section',
      icon: '🏟️',
      title: 'The Events Arena',
      text: 'Every card here is a live event with a different game, prize pool, and entry fee. Pick one that matches your skill level and budget.',
    },
    {
      target: '.ev-card, .event-card',
      icon: '🎮',
      title: 'Picking an Event',
      text: 'Click any event card to see the full details — the game you\'ll play, how many players are competing, the prize on offer, and the entry fee you\'ll pay.',
    },
    {
      target: '.ev-join-btn, .event-join-btn',
      icon: '⚡',
      title: 'Joining an Event',
      text: 'Hit Join to enter. Your entry fee is deducted from your coins immediately. Win the event and you keep the full prize pool — lose and the fee is gone.',
    },
    {
      target: '#matchmakingModal, .ev-section-hd',
      icon: '🔍',
      title: 'Matchmaking',
      text: 'After joining, Eylox finds real opponents near your skill level — players within 8 levels of you. Watch them join the lobby one by one before the countdown begins!',
    },
    {
      target: '.wheel-circle, #spinWheel',
      icon: '🎰',
      title: 'The Prize Wheel',
      text: 'After matchmaking, you spin this wheel. Where it lands decides which game you play. Each segment shows the game and its prize amount.',
    },
    {
      target: '.spin-btn, #spinBtn',
      icon: '🎯',
      title: 'Spinning the Wheel',
      text: 'Press Spin to set the wheel in motion. It slows down gradually until it lands on your game. Then you\'re launched straight into that game — compete hard to win!',
    },
    {
      target: null,
      icon: '🏆',
      title: 'Win = Take the Prize!',
      text: 'If you win the game, you\'ll see a results screen with your coins, XP, and Eyltrophs. Hit Claim to collect everything. XP fills your level bar — level up for bigger rank rewards!',
      noHighlight: true,
      isLast: true,
    },
  ];

  function getPageSteps() {
    const body = document.body;
    const page = body.getAttribute('data-page') || '';
    if (page === 'events' || document.querySelector('.ev-hero, #spinModal')) return EVENTS_STEPS;
    return HOME_STEPS;
  }

  let _tourOverlay = null, _tourSpot = null, _tourCard = null;
  const TourState = { step: 0, steps: [], active: false };

  function buildTourDOM() {
    if (document.getElementById('tt-tour-overlay')) return;

    _tourOverlay = document.createElement('div');
    _tourOverlay.id = 'tt-tour-overlay';

    _tourSpot = document.createElement('div');
    _tourSpot.id = 'tt-spot';
    _tourOverlay.appendChild(_tourSpot);

    _tourOverlay.addEventListener('click', e => {
      if (e.target === _tourOverlay) tourNext();
    });

    _tourCard = document.createElement('div');
    _tourCard.id = 'tt-tour-card';

    document.body.appendChild(_tourOverlay);
    document.body.appendChild(_tourCard);
  }

  function tourStart(forceRestart) {
    buildTourDOM();
    if (!forceRestart && localStorage.getItem('eylox_tour_done')) return;
    TourState.steps = getPageSteps();
    TourState.step = 0;
    TourState.active = true;
    hideTip();
    _tourOverlay.classList.add('active');
    _tourCard.classList.add('active');
    tourRender();
    document.addEventListener('keydown', tourKeyHandler);
  }

  function tourEnd() {
    TourState.active = false;
    localStorage.setItem('eylox_tour_done', '1');
    if (_tourOverlay) _tourOverlay.classList.remove('active');
    if (_tourCard)    _tourCard.classList.remove('active');
    document.removeEventListener('keydown', tourKeyHandler);
  }

  function tourNext() {
    if (TourState.step < TourState.steps.length - 1) {
      TourState.step++;
      tourRender();
    } else {
      tourEnd();
    }
  }

  function tourPrev() {
    if (TourState.step > 0) {
      TourState.step--;
      tourRender();
    }
  }

  function tourKeyHandler(e) {
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); tourNext(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); tourPrev(); }
    if (e.key === 'Escape')     { e.preventDefault(); tourEnd(); }
  }

  function tourRender() {
    const step = TourState.steps[TourState.step];
    const total = TourState.steps.length;
    const idx   = TourState.step;
    const isFirst = idx === 0;
    const isLast  = idx === total - 1;

    // Spotlight
    let targetEl = null;
    if (step.target) {
      try { targetEl = document.querySelector(step.target); } catch {}
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior:'smooth', block:'center', inline:'nearest' });
      setTimeout(() => positionSpotlight(targetEl, step), 340);
      _tourSpot.classList.remove('no-highlight');
    } else {
      _tourSpot.classList.add('no-highlight');
      _tourSpot.style.cssText = 'width:0;height:0;top:50%;left:50%;opacity:0';
    }

    // Progress dots
    const dots = Array.from({ length: total }, (_, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'active' : '';
      return `<div class="tour-dot ${cls}"></div>`;
    }).join('');

    // Card content
    _tourCard.innerHTML = `
      <div class="tour-card-arrow hidden" id="tourArrow"></div>
      <span class="tour-step-icon">${step.icon}</span>
      <div class="tour-step-title">${step.title}</div>
      <div class="tour-step-text">${step.text}</div>
      <div class="tour-progress">${dots}</div>
      <div class="tour-actions">
        ${!isFirst ? `<button class="tour-btn-prev" id="tourPrev">← Back</button>` : '<span></span>'}
        <button class="tour-btn-next" id="tourNext">${isLast ? '🎉 Let\'s Go!' : 'Next →'}</button>
        ${!isLast ? `<button class="tour-btn-skip" id="tourSkip">Skip tour</button>` : ''}
      </div>`;

    document.getElementById('tourNext')?.addEventListener('click', tourNext);
    document.getElementById('tourPrev')?.addEventListener('click', tourPrev);
    document.getElementById('tourSkip')?.addEventListener('click', tourEnd);

    _tourCard.classList.remove('active');
    void _tourCard.offsetWidth; // force reflow for animation restart
    _tourCard.classList.add('active');

    // Position the card
    if (targetEl) {
      setTimeout(() => tourPositionCard(step), 360);
    } else {
      // Centred on screen for intro/outro
      _tourCard.style.top = '50%';
      _tourCard.style.left = '50%';
      _tourCard.style.transform = 'translate(-50%, -50%)';
    }
  }

  function positionSpotlight(el, step) {
    if (!_tourSpot || !el) return;
    const rect = el.getBoundingClientRect();
    const pad = 10;
    _tourSpot.style.left   = (rect.left   - pad) + 'px';
    _tourSpot.style.top    = (rect.top    - pad) + 'px';
    _tourSpot.style.width  = (rect.width  + pad * 2) + 'px';
    _tourSpot.style.height = (rect.height + pad * 2) + 'px';
    _tourSpot.style.opacity = '1';
  }

  function tourPositionCard(step) {
    if (!_tourCard) return;
    let targetEl = null;
    if (step && step.target) {
      try { targetEl = document.querySelector(step.target); } catch {}
    }

    if (!targetEl || step.noHighlight) {
      _tourCard.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);';
      const arr = document.getElementById('tourArrow');
      if (arr) arr.className = 'tour-card-arrow hidden';
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const cw   = _tourCard.offsetWidth  || 320;
    const ch   = _tourCard.offsetHeight || 260;
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;
    const pad  = 18;
    const gap  = 20;
    let left, top, arrowClass = 'hidden';

    _tourCard.style.transform = 'none';

    if (rect.right + cw + gap < vw - 8) {
      left = rect.right + gap;
      top  = rect.top + rect.height / 2 - ch / 2;
      arrowClass = 'arr-left';
    } else if (rect.left - cw - gap > 8) {
      left = rect.left - cw - gap;
      top  = rect.top + rect.height / 2 - ch / 2;
      arrowClass = 'arr-right';
    } else if (rect.top - ch - gap > 8) {
      top  = rect.top - ch - gap;
      left = rect.left + rect.width / 2 - cw / 2;
      arrowClass = 'arr-down';
    } else {
      top  = rect.bottom + gap;
      left = rect.left + rect.width / 2 - cw / 2;
      arrowClass = 'arr-up';
    }

    left = Math.max(pad, Math.min(left, vw - cw - pad));
    top  = Math.max(pad, Math.min(top,  vh - ch - pad));
    _tourCard.style.left = left + 'px';
    _tourCard.style.top  = top + 'px';

    const arr = document.getElementById('tourArrow');
    if (arr) arr.className = 'tour-card-arrow ' + arrowClass;
  }

  /* ── Auto-start for first-time users (3-second delay) ── */
  function maybeAutoStart() {
    if (localStorage.getItem('eylox_tour_done')) return;
    const user = localStorage.getItem('eylox_user');
    if (!user) return; // not logged in
    setTimeout(() => tourStart(false), 3000);
  }

  /* ── Tour trigger — delegates to EyloxFAB panel if available ── */
  function injectTourTrigger() {
    /* If floating-actions.js has already registered a tutorial button, skip */
    if (document.getElementById('efab-tutorial') || document.getElementById('tt-tour-trigger')) return;
    /* Defer so floating-actions.js has time to build the panel first */
    setTimeout(() => {
      if (window.EyloxFAB) {
        /* EyloxFAB already has the tutorial button registered as a default — just wire the click */
        const existing = document.getElementById('efab-tutorial');
        if (existing) { existing.addEventListener('click', () => tourStart(true)); return; }
        /* Fallback: add it via the API */
        window.EyloxFAB.add({
          id:'tutorial', icon:'🎓', label:'Help & Tutorial',
          bg:'linear-gradient(135deg,#1d4ed8,#60a5fa)', color:'#fff',
          onClick(){ tourStart(true); },
        });
        return;
      }
      /* No FAB panel — create a standalone button as fallback */
      if (document.getElementById('tt-tour-trigger')) return;
      const btn = document.createElement('button');
      btn.id = 'tt-tour-trigger';
      btn.title = 'Restart Tutorial';
      btn.setAttribute('data-tip', 'tutorial-restart');
      btn.style.cssText = `
        position:fixed;bottom:80px;right:18px;z-index:9990;
        width:48px;height:48px;border-radius:50%;
        background:linear-gradient(135deg,#1d4ed8,#60a5fa);
        border:2px solid rgba(96,165,250,.4);
        color:#fff;font-size:1.25rem;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 6px 20px rgba(0,0,0,.55);
        transition:transform .15s,box-shadow .15s;
      `;
      btn.textContent = '🎓';
      btn.addEventListener('click', () => tourStart(true));
      document.body.appendChild(btn);
    }, 200);
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION 6 — INIT
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    injectCSS();
    setTimeout(attachAll, 400);
    setTimeout(attachAll, 1400);
    watchDOM();
    injectTourTrigger();
    maybeAutoStart();
  });

  /* ── Public API ── */
  window.EyloxTooltips = {
    add(key, cfg)   { TIPS[key] = cfg; },
    attach(el, key) { attachTip(el, key); },
    refresh()       { attachAll(); },
    startTour(force){ tourStart(!!force); },
    endTour()       { tourEnd(); },
    TIPS,
  };

})();
