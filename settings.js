/* ============================================================
   EYLOX — Settings System v3
   Full-featured settings modal with 10 sections
   ============================================================ */
'use strict';

(function EyloxSettings() {

  /* ── Defaults ── */
  const DEFAULTS = {
    /* Appearance */
    theme:              'purple',   // purple | midnight | neon | light
    zoomLevel:          100,        // 80 | 90 | 100 | 110 | 125
    animationsEnabled:  true,
    compactMode:        false,
    cardTiltEnabled:    true,
    glowEnabled:        true,

    /* Sound */
    soundEnabled:       true,
    musicEnabled:       true,
    volumeLevel:        0.8,        // 0.0 – 1.0

    /* Notifications */
    notificationsEnabled: true,
    notifyCoins:        true,
    notifyWins:         true,
    notifyFriends:      true,
    notifyShop:         true,
    notifyEvents:       true,
    notifyAchievements: true,

    /* Accessibility */
    reduceMotion:       false,
    highContrast:       false,
    fontSize:           'normal',   // small | normal | large | xlarge

    /* Performance */
    starfieldEnabled:   true,
    confettiEnabled:    true,

    /* Privacy */
    showOnline:         true,
    shareGameHistory:   true,
    allowFriendRequests: true,

    /* Gameplay */
    difficulty:         'normal',   // easy | normal | hard
    showHints:          true,
    autoSave:           true,

    /* Language */
    language:           'en',
  };

  function getSettings() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('eylox_settings') || '{}') }; }
    catch { return { ...DEFAULTS }; }
  }
  function saveSettings(s) { localStorage.setItem('eylox_settings', JSON.stringify(s)); window.dispatchEvent(new Event('eylox-settings-changed')); }
  window.EyloxGetSettings = getSettings;

  /* ── Translations ── */
  const TRANSLATIONS = {
    en: {
      /* sidebar */
      home:'Home', games:'Discover', friends:'Friends', profile:'Profile',
      leaderboard:'Leaderboard', messages:'Messages', achievements:'Achievements',
      communities:'Communities', liveEvents:'Live Events', shop:'Shop',
      youtube:'YouTube', ai:'AI Gaming', avatar:'Avatar',
      settings:'Settings', menu:'Menu', more:'More', logout:'Log Out',
      /* page headings */
      pageHome:'Home', pageGames:'Discover Games', pageFriends:'Friends Hub',
      pageProfile:'My Profile', pageLeaderboard:'Leaderboard', pageMessages:'Messages',
      pageAchievements:'Achievements', pageCommunities:'Communities',
      pageLiveEvents:'Live Events', pageShop:'Shop',
      /* section titles */
      trendingNow:'Trending Now', featuredGames:'Featured Games',
      recentlyPlayed:'Recently Played', newGames:'New Games',
      topRated:'Top Rated', myFriends:'My Friends',
      friendRequests:'Friend Requests', discoverPlayers:'People You May Know',
      yourActivity:'Your Activity', myAchievements:'My Achievements',
      /* buttons & labels */
      playNow:'Play Now', addFriend:'Add Friend', sendMsg:'Send',
      searchGames:'Search games…', searchFriends:'Search friends…',
      claimReward:'Claim Now', viewAll:'View All',
      dailyReward:'Daily Reward', online:'Online', offline:'Offline',
      coins:'Coins', Eyltrophs:'Eyltrophs', level:'Level',
      /* welcome */
      welcomeBack:'Welcome back', connectedCrew:'Stay connected with your gaming crew',
      findFriend:'Find a Friend', addByUsername:'Add friends by their username to see them here',
    },
    ar: {
      home:'الرئيسية', games:'استكشاف', friends:'أصدقاء', profile:'ملفي',
      leaderboard:'لوحة الصدارة', messages:'الرسائل', achievements:'الإنجازات',
      communities:'المجتمعات', liveEvents:'أحداث حية', shop:'المتجر',
      youtube:'يوتيوب', ai:'ذكاء اصطناعي', avatar:'شخصيتي',
      settings:'الإعدادات', menu:'القائمة', more:'المزيد', logout:'خروج',
      pageHome:'الرئيسية', pageGames:'اكتشاف الألعاب', pageFriends:'الأصدقاء',
      pageProfile:'ملفي الشخصي', pageLeaderboard:'لوحة الصدارة', pageMessages:'الرسائل',
      pageAchievements:'الإنجازات', pageCommunities:'المجتمعات',
      pageLiveEvents:'الأحداث المباشرة', pageShop:'المتجر',
      trendingNow:'رائج الآن', featuredGames:'ألعاب مميزة',
      recentlyPlayed:'ألعبت مؤخراً', newGames:'ألعاب جديدة',
      topRated:'الأعلى تقييماً', myFriends:'أصدقائي',
      friendRequests:'طلبات الصداقة', discoverPlayers:'أشخاص قد تعرفهم',
      yourActivity:'نشاطك', myAchievements:'إنجازاتي',
      playNow:'العب الآن', addFriend:'إضافة صديق', sendMsg:'إرسال',
      searchGames:'ابحث عن ألعاب…', searchFriends:'ابحث عن أصدقاء…',
      claimReward:'احصل عليه', viewAll:'عرض الكل',
      dailyReward:'مكافأة يومية', online:'متصل', offline:'غير متصل',
      coins:'عملات', Eyltrophs:'كؤوس', level:'المستوى',
      welcomeBack:'مرحباً بعودتك', connectedCrew:'ابق على تواصل مع فريق الألعاب',
      findFriend:'ابحث عن صديق', addByUsername:'أضف أصدقاء باسم المستخدم',
    },
    fr: {
      home:'Accueil', games:'Découvrir', friends:'Amis', profile:'Profil',
      leaderboard:'Classement', messages:'Messages', achievements:'Succès',
      communities:'Communautés', liveEvents:'Événements', shop:'Boutique',
      youtube:'YouTube', ai:'IA Gaming', avatar:'Avatar',
      settings:'Paramètres', menu:'Menu', more:'Plus', logout:'Déconnexion',
      pageHome:'Accueil', pageGames:'Découvrir des jeux', pageFriends:'Mes amis',
      pageProfile:'Mon profil', pageLeaderboard:'Classement', pageMessages:'Messages',
      pageAchievements:'Succès', pageCommunities:'Communautés',
      pageLiveEvents:'Événements en direct', pageShop:'Boutique',
      trendingNow:'Tendances', featuredGames:'Jeux en vedette',
      recentlyPlayed:'Joués récemment', newGames:'Nouveaux jeux',
      topRated:'Les mieux notés', myFriends:'Mes amis',
      friendRequests:'Demandes d\'amis', discoverPlayers:'Vous les connaissez peut-être',
      yourActivity:'Votre activité', myAchievements:'Mes succès',
      playNow:'Jouer', addFriend:'Ajouter', sendMsg:'Envoyer',
      searchGames:'Rechercher des jeux…', searchFriends:'Rechercher des amis…',
      claimReward:'Réclamer', viewAll:'Voir tout',
      dailyReward:'Récompense quotidienne', online:'En ligne', offline:'Hors ligne',
      coins:'Pièces', Eyltrophs:'Trophées', level:'Niveau',
      welcomeBack:'Bon retour', connectedCrew:'Restez connecté avec votre équipe',
      findFriend:'Trouver un ami', addByUsername:'Ajoutez des amis par leur nom',
    },
    es: {
      home:'Inicio', games:'Descubrir', friends:'Amigos', profile:'Perfil',
      leaderboard:'Clasificación', messages:'Mensajes', achievements:'Logros',
      communities:'Comunidades', liveEvents:'Eventos en vivo', shop:'Tienda',
      youtube:'YouTube', ai:'IA Gaming', avatar:'Avatar',
      settings:'Ajustes', menu:'Menú', more:'Más', logout:'Salir',
      pageHome:'Inicio', pageGames:'Descubrir juegos', pageFriends:'Mis amigos',
      pageProfile:'Mi perfil', pageLeaderboard:'Clasificación', pageMessages:'Mensajes',
      pageAchievements:'Logros', pageCommunities:'Comunidades',
      pageLiveEvents:'Eventos en vivo', pageShop:'Tienda',
      trendingNow:'Tendencias', featuredGames:'Juegos destacados',
      recentlyPlayed:'Jugados recientemente', newGames:'Nuevos juegos',
      topRated:'Mejor valorados', myFriends:'Mis amigos',
      friendRequests:'Solicitudes de amistad', discoverPlayers:'Personas que quizás conozcas',
      yourActivity:'Tu actividad', myAchievements:'Mis logros',
      playNow:'Jugar', addFriend:'Añadir amigo', sendMsg:'Enviar',
      searchGames:'Buscar juegos…', searchFriends:'Buscar amigos…',
      claimReward:'Reclamar', viewAll:'Ver todo',
      dailyReward:'Recompensa diaria', online:'En línea', offline:'Desconectado',
      coins:'Monedas', Eyltrophs:'Trofeos', level:'Nivel',
      welcomeBack:'Bienvenido de nuevo', connectedCrew:'Conecta con tu equipo de juego',
      findFriend:'Buscar un amigo', addByUsername:'Agrega amigos por su nombre de usuario',
    },
    de: {
      home:'Startseite', games:'Entdecken', friends:'Freunde', profile:'Profil',
      leaderboard:'Bestenliste', messages:'Nachrichten', achievements:'Errungenschaften',
      communities:'Communitys', liveEvents:'Live-Events', shop:'Shop',
      youtube:'YouTube', ai:'KI-Gaming', avatar:'Avatar',
      settings:'Einstellungen', menu:'Menü', more:'Mehr', logout:'Abmelden',
      pageHome:'Startseite', pageGames:'Spiele entdecken', pageFriends:'Freunde',
      pageProfile:'Mein Profil', pageLeaderboard:'Bestenliste', pageMessages:'Nachrichten',
      pageAchievements:'Errungenschaften', pageCommunities:'Communitys',
      pageLiveEvents:'Live-Events', pageShop:'Shop',
      trendingNow:'Im Trend', featuredGames:'Empfohlene Spiele',
      recentlyPlayed:'Zuletzt gespielt', newGames:'Neue Spiele',
      topRated:'Bestbewertet', myFriends:'Meine Freunde',
      friendRequests:'Freundschaftsanfragen', discoverPlayers:'Vielleicht kennst du diese',
      yourActivity:'Deine Aktivität', myAchievements:'Meine Errungenschaften',
      playNow:'Spielen', addFriend:'Hinzufügen', sendMsg:'Senden',
      searchGames:'Spiele suchen…', searchFriends:'Freunde suchen…',
      claimReward:'Abholen', viewAll:'Alle anzeigen',
      dailyReward:'Tägliche Belohnung', online:'Online', offline:'Offline',
      coins:'Münzen', Eyltrophs:'Trophäen', level:'Level',
      welcomeBack:'Willkommen zurück', connectedCrew:'Bleib mit deinem Team verbunden',
      findFriend:'Freund finden', addByUsername:'Füge Freunde per Benutzername hinzu',
    },
    ja: {
      home:'ホーム', games:'ゲーム発見', friends:'フレンド', profile:'プロフィール',
      leaderboard:'ランキング', messages:'メッセージ', achievements:'実績',
      communities:'コミュニティ', liveEvents:'ライブ', shop:'ショップ',
      youtube:'YouTube', ai:'AIゲーム', avatar:'アバター',
      settings:'設定', menu:'メニュー', more:'もっと', logout:'ログアウト',
      pageHome:'ホーム', pageGames:'ゲーム発見', pageFriends:'フレンド',
      pageProfile:'プロフィール', pageLeaderboard:'ランキング', pageMessages:'メッセージ',
      pageAchievements:'実績', pageCommunities:'コミュニティ',
      pageLiveEvents:'ライブイベント', pageShop:'ショップ',
      trendingNow:'トレンド', featuredGames:'注目ゲーム',
      recentlyPlayed:'最近プレイ', newGames:'新着ゲーム',
      topRated:'高評価', myFriends:'フレンド一覧',
      friendRequests:'フレンド申請', discoverPlayers:'知り合いかも',
      yourActivity:'アクティビティ', myAchievements:'実績一覧',
      playNow:'プレイ', addFriend:'追加', sendMsg:'送信',
      searchGames:'ゲームを検索…', searchFriends:'フレンドを検索…',
      claimReward:'受け取る', viewAll:'すべて表示',
      dailyReward:'デイリー報酬', online:'オンライン', offline:'オフライン',
      coins:'コイン', Eyltrophs:'トロフィー', level:'レベル',
      welcomeBack:'おかえりなさい', connectedCrew:'ゲーム仲間とつながろう',
      findFriend:'フレンドを探す', addByUsername:'ユーザー名でフレンドを追加',
    },
  };

  /* Text-content map: English string → translation key (for elements without data-i18n) */
  const TEXT_MAP = {
    'Trending Now':'trendingNow', 'Featured Games':'featuredGames',
    'Recently Played':'recentlyPlayed', 'New Games':'newGames', 'Top Rated':'topRated',
    'My Friends':'myFriends', 'Friend Requests':'friendRequests',
    'People You May Know':'discoverPlayers', 'Your Activity':'yourActivity',
    'My Achievements':'myAchievements', 'Friends Hub':'pageFriends',
    'Stay connected with your gaming crew':'connectedCrew',
    'Find a Friend':'findFriend',
  };

  /* Map href filename → translation key */
  const HREF_KEY = {
    'index.html':'home', 'games.html':'games', 'friends.html':'friends',
    'profile.html':'profile', 'leaderboard.html':'leaderboard', 'messages.html':'messages',
    'achievements.html':'achievements', 'communities.html':'communities',
    'live-events.html':'liveEvents', 'shop.html':'shop', 'youtube.html':'youtube',
    'ai.html':'ai', 'avatar.html':'avatar',
  };

  function applyLanguage(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

    document.documentElement.lang = lang;
    const isRTL = lang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    // RTL layout overrides
    let rtlStyle = document.getElementById('eylox-rtl-style');
    if (isRTL && !rtlStyle) {
      rtlStyle = document.createElement('style');
      rtlStyle.id = 'eylox-rtl-style';
      rtlStyle.textContent = `
        [dir="rtl"] .sidebar { right:0;left:auto;border-right:none;border-left:1px solid rgba(167,139,250,.12); }
        [dir="rtl"] .main-content,[dir="rtl"] .content { margin-left:0;margin-right:256px; }
        [dir="rtl"] .hdr { flex-direction:row-reverse; }
        [dir="rtl"] .sidebar-link { justify-content:flex-end; }
        [dir="rtl"] .sidebar-section-label { text-align:right; }
      `;
      document.head.appendChild(rtlStyle);
    } else if (!isRTL && rtlStyle) {
      rtlStyle.remove();
    }

    // Translate sidebar links — target .s-label span, look up key by href
    document.querySelectorAll('.sidebar-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      const file = href.split('/').pop().split('?')[0].split('#')[0] || '';
      let key = HREF_KEY[file];
      if (!key && a.id === 'settingsBtn') key = 'settings';
      if (!key && a.id === 'logoutBtn')   key = 'logout';
      const val = key ? t[key] : null;
      if (!val) return;
      const label = a.querySelector('.s-label');
      if (label) label.textContent = val;
    });

    // Translate section labels (Menu / More headings)
    document.querySelectorAll('.sidebar-section-label').forEach(el => {
      if (!el.dataset.i18nOrig) el.dataset.i18nOrig = el.textContent.trim().toLowerCase();
      const orig = el.dataset.i18nOrig;
      if (orig === 'menu') el.textContent = t.menu || 'Menu';
      else if (orig === 'more') el.textContent = t.more || 'More';
    });

    // Translate any element with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    // Translate data-i18n-placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.placeholder = t[key];
    });

    // Translate search inputs by placeholder
    document.querySelectorAll('input[type="search"], input[type="text"]').forEach(el => {
      const ph = el.placeholder;
      if (ph === 'Search games…' || ph === 'Search games...') el.placeholder = t.searchGames || ph;
      else if (ph === 'Search friends…' || ph === 'Search friends...') el.placeholder = t.searchFriends || ph;
    });

    // Translate section titles (.section-title, .sub-title) and page description paragraphs
    // by storing original English text on first run, then mapping via TEXT_MAP
    document.querySelectorAll('.section-title, .sub-title, .page-content h2, .page-heading h1').forEach(el => {
      if (!el.dataset.i18nOrig) {
        // Store the text without emoji prefix — grab inner text of first text node
        const raw = Array.from(el.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent.trim())
          .join(' ').trim();
        if (raw) el.dataset.i18nOrig = raw;
        else el.dataset.i18nOrig = el.textContent.replace(/[^\w\s]/g, '').trim();
      }
      const orig = el.dataset.i18nOrig;
      const key = TEXT_MAP[orig];
      if (key && t[key]) {
        // Replace first text node (keep emoji prefix if present)
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const prefix = node.textContent.match(/^[\s\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]+/u);
            node.textContent = (prefix ? prefix[0] : '') + t[key];
            break;
          }
        }
      }
    });

    // Translate plain paragraph descriptions under .page-heading
    document.querySelectorAll('.page-heading p, .afh-text p').forEach(el => {
      if (!el.dataset.i18nOrig) el.dataset.i18nOrig = el.textContent.trim();
      const orig = el.dataset.i18nOrig;
      const key = TEXT_MAP[orig];
      if (key && t[key]) el.textContent = t[key];
    });
  }

  /* ── Apply theme ── */
  function applyTheme(theme) {
    const root = document.documentElement;
    const themes = {
      purple:   { bg:'#110330', surface:'#1c0b42', card:'#230e56', border:'#3e2888', text:'#f0e8ff', muted:'#9d8ec7' },
      midnight: { bg:'#06060f', surface:'#0e0e20', card:'#141428', border:'#2a2a50', text:'#e8e8ff', muted:'#7070aa' },
      neon:     { bg:'#080320', surface:'#130845', card:'#1a0a5e', border:'#4a1aaa', text:'#f0e8ff', muted:'#9d8ec7' },
      ocean:    { bg:'#01131a', surface:'#021e2b', card:'#032840', border:'#0a4a6a', text:'#e0f4ff', muted:'#5fa8c8' },
      crimson:  { bg:'#180510', surface:'#2a0618', card:'#3a0820', border:'#6a1035', text:'#ffe8f0', muted:'#c878a0' },
      forest:   { bg:'#050f08', surface:'#0a1c0f', card:'#0f2a16', border:'#1a5028', text:'#e8f5ec', muted:'#5a9870' },
      light:    { bg:'#f0ebff', surface:'#e8e0ff', card:'#ffffff', border:'#d4c8f8', text:'#1a0a40', muted:'#6b5a9e' },
    };
    const t = themes[theme] || themes.purple;
    root.style.setProperty('--bg',      t.bg);
    root.style.setProperty('--surface', t.surface);
    root.style.setProperty('--card',    t.card);
    root.style.setProperty('--border',  t.border);
    root.style.setProperty('--text',    t.text);
    root.style.setProperty('--muted',   t.muted);
  }

  function applyZoom(level) {
    document.documentElement.style.fontSize = { 80:'13px', 90:'14px', 100:'16px', 110:'17.6px', 125:'20px' }[level] || '16px';
  }

  function applyFontSize(size) {
    const map = { small: '13px', normal: '16px', large: '19px', xlarge: '22px' };
    document.documentElement.style.setProperty('--font-size-base', map[size] || '16px');
  }

  function applyHighContrast(on) {
    document.documentElement.setAttribute('data-high-contrast', on ? '1' : '0');
    let style = document.getElementById('high-contrast-style');
    if (on && !style) {
      style = document.createElement('style');
      style.id = 'high-contrast-style';
      style.textContent = `
        [data-high-contrast="1"] .shop-card, [data-high-contrast="1"] .section,
        [data-high-contrast="1"] .game-card, [data-high-contrast="1"] .sub-card {
          border-width: 2px !important; border-color: rgba(167,139,250,.8) !important;
        }
        [data-high-contrast="1"] .ps-num { filter: brightness(1.4); }
        [data-high-contrast="1"] .s-icon, [data-high-contrast="1"] .shop-emoji { filter: brightness(1.3); }
      `;
      document.head.appendChild(style);
    } else if (!on && style) style.remove();
  }

  function applyStarfield(on) {
    const canvas = document.getElementById('starsCanvas');
    if (canvas) canvas.style.display = on ? '' : 'none';
  }

  function applyGlow(on) {
    let style = document.getElementById('no-glow-style');
    if (!on && !style) {
      style = document.createElement('style');
      style.id = 'no-glow-style';
      style.textContent = '* { filter: none !important; box-shadow: none !important; text-shadow: none !important; }';
      document.head.appendChild(style);
    } else if (on && style) style.remove();
  }

  function applyAllSettings() {
    const s = getSettings();
    applyTheme(s.theme);
    applyZoom(s.zoomLevel);
    applyFontSize(s.fontSize);
    applyHighContrast(s.highContrast);
    applyStarfield(s.starfieldEnabled);
    applyLanguage(s.language);
    if (!s.glowEnabled) applyGlow(false); else applyGlow(true);

    if (!s.animationsEnabled || s.reduceMotion) {
      if (!document.getElementById('no-anim-style')) {
        const el = document.createElement('style');
        el.id = 'no-anim-style';
        el.textContent = '*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }';
        document.head.appendChild(el);
      }
    } else {
      document.getElementById('no-anim-style')?.remove();
    }
  }

  /* ── Inject modal CSS ── */
  function injectModalCSS() {
    if (document.getElementById('settingsModalCSS')) return;
    const style = document.createElement('style');
    style.id = 'settingsModalCSS';
    style.textContent = `
      #eyloxSettingsModal { scrollbar-width: thin; scrollbar-color: rgba(167,139,250,.3) transparent; }
      #eyloxSettingsModal ::-webkit-scrollbar { width:5px; }
      #eyloxSettingsModal ::-webkit-scrollbar-thumb { background:rgba(167,139,250,.25); border-radius:99px; }
      .sett-section { border-bottom:1px solid rgba(167,139,250,.1); padding:18px 0; display:flex; flex-direction:column; gap:2px; }
      .sett-section:last-child { border-bottom:none; }
      .sett-section-label { font-size:.62rem; font-weight:900; color:var(--purple,#a78bfa); text-transform:uppercase; letter-spacing:1.2px; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
      .sett-row { display:flex; align-items:center; gap:12px; padding:4px 0; }
      .sett-avatar-wrap { width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;box-shadow:0 0 0 3px rgba(167,139,250,.25); }
      .sett-toggle-row { display:flex;align-items:center;justify-content:space-between;padding:9px 0;cursor:pointer;border-radius:8px;transition:background .12s; }
      .sett-toggle-row:hover { background:rgba(167,139,250,.05); padding-left:6px; padding-right:6px; }
      .sett-toggle-label { font-size:.86rem;font-weight:800;color:var(--text,#f0e8ff); }
      .sett-toggle-sub { font-size:.7rem;color:var(--muted,#9d8ec7);font-weight:700;margin-top:1px; }
      .sett-toggle { width:44px;height:24px;border-radius:99px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.2);position:relative;transition:background .2s,border-color .2s;flex-shrink:0; }
      .sett-toggle.on { background:linear-gradient(135deg,#7c3aed,#a855f7);border-color:#7c3aed; }
      .sett-toggle::after { content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .22s cubic-bezier(.34,1.56,.64,1);box-shadow:0 2px 6px rgba(0,0,0,.3); }
      .sett-toggle.on::after { transform:translateX(20px); }
      .sett-theme-btn { padding:7px 13px;border-radius:99px;border:1px solid rgba(167,139,250,.2);background:rgba(167,139,250,.07);color:var(--text,#f0e8ff);font-family:'Nunito',sans-serif;font-weight:800;font-size:.75rem;cursor:pointer;transition:all .15s;white-space:nowrap; }
      .sett-theme-btn.active,.sett-theme-btn:hover { background:rgba(167,139,250,.18);border-color:var(--tc,#a78bfa);color:var(--tc,#a78bfa);box-shadow:0 0 0 2px var(--tc,#a78bfa)33; }
      .sett-select { background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:var(--text,#f0e8ff);padding:7px 12px;border-radius:10px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.82rem;cursor:pointer;outline:none;transition:border-color .15s; appearance:none; -webkit-appearance:none; padding-right:28px; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23a78bfa'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; }
      .sett-select:focus { border-color:#a78bfa; }
      .sett-select option { background:#1c0b42; }
      .sett-slider { -webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:99px;background:rgba(167,139,250,.15);outline:none;cursor:pointer; }
      .sett-slider::-webkit-slider-thumb { -webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.5);border:2px solid #fff; }
      .sett-slider::-moz-range-thumb { width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.5);border:2px solid #fff; }
      .sett-stat-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px; }
      .sett-stat-box { background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.15);border-radius:12px;padding:12px 14px;text-align:center; }
      .sett-stat-num { font-family:'Fredoka One',cursive;font-size:1.2rem;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
      .sett-stat-lbl { font-size:.65rem;font-weight:800;color:var(--muted,#9d8ec7);text-transform:uppercase;letter-spacing:.5px;margin-top:2px; }
      .sett-btn { padding:9px 18px;border-radius:99px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.82rem;cursor:pointer;transition:all .15s;border:none; }
      .sett-btn-danger { background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#f87171; }
      .sett-btn-danger:hover { background:rgba(248,113,113,.2); }
      .sett-btn-secondary { background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:#a78bfa; }
      .sett-btn-secondary:hover { background:rgba(167,139,250,.2); }
      .sett-divider { height:1px;background:rgba(167,139,250,.1);margin:4px 0; }
      .sett-badge { font-size:.68rem;font-weight:900;padding:3px 9px;border-radius:99px;margin-left:auto; }
      .sett-badge-on  { background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3); }
      .sett-badge-off { background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2); }
      @keyframes sett-slide-up { from{transform:translateY(30px) scale(.97);opacity:0} to{transform:none;opacity:1} }
    `;
    document.head.appendChild(style);
  }

  /* ── Get user stats ── */
  function getUserStats() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      const recent = JSON.parse(localStorage.getItem('eylox_recently_played') || '[]');
      const owned  = JSON.parse(localStorage.getItem('eylox_owned_items') || '[]');
      if (!u) return null;
      const coins = u.coins || 0;
      const xpPerLevel = 500;
      const level = Math.floor(coins / xpPerLevel) + 1;
      const joined = u.createdAt ? Math.floor((Date.now() - u.createdAt) / 86400000) : 0;
      return { user: u, level, recent: recent.length, owned: owned.length, joined };
    } catch { return null; }
  }

  /* ── Build modal HTML ── */
  function buildModal() {
    const s    = getSettings();
    const data = getUserStats();
    const user = data?.user;

    const modal = document.createElement('div');
    modal.id = 'eyloxSettingsModal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(10px);z-index:9999;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';

    const THEMES = [
      { id:'purple',   label:'🟣 Purple',  color:'#a78bfa' },
      { id:'midnight', label:'🌑 Midnight', color:'#6366f1' },
      { id:'neon',     label:'⚡ Neon',     color:'#c084fc' },
      { id:'ocean',    label:'🌊 Ocean',    color:'#38bdf8' },
      { id:'crimson',  label:'❤️ Crimson', color:'#f43f5e' },
      { id:'forest',   label:'🌲 Forest',  color:'#4ade80' },
      { id:'light',    label:'☀️ Light',   color:'#8b5cf6' },
    ];

    modal.innerHTML = `
      <div id="settingsPanel" style="background:linear-gradient(160deg,#1c0b42 0%,#130838 100%);border:1px solid rgba(167,139,250,.28);border-radius:24px;padding:0;max-width:560px;width:100%;margin:auto;box-shadow:0 32px 90px rgba(0,0,0,.7);animation:sett-slide-up .35s cubic-bezier(.34,1.56,.64,1) both;position:relative">

        <!-- ── Header ── -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:24px 28px 20px;border-bottom:1px solid rgba(167,139,250,.1)">
          <div>
            <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;margin:0 0 2px">⚙️ Settings</h2>
            <p style="color:var(--muted,#9d8ec7);font-size:.76rem;font-weight:700;margin:0">Customize your Eylox experience</p>
          </div>
          <button id="settingsCloseBtn" style="background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:var(--muted,#9d8ec7);width:36px;height:36px;border-radius:50%;font-size:1rem;cursor:pointer;transition:all .15s;flex-shrink:0" title="Close">✕</button>
        </div>

        <div style="padding:8px 28px 32px;display:flex;flex-direction:column;gap:0">

          <!-- ══════════════ 1. ACCOUNT ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">👤 Account</div>
            <div class="sett-row">
              <div class="sett-avatar-wrap">${user?.avatar || '🎮'}</div>
              <div style="flex:1;min-width:0">
                <div style="font-family:'Fredoka One',cursive;font-size:1.05rem;margin-bottom:2px">${user?.username || 'Guest'}</div>
                <div style="font-size:.72rem;color:var(--muted,#9d8ec7);font-weight:700">Lv.${data?.level||1} · 🪙 ${Number(user?.coins||0).toLocaleString()} · 🏆 ${Number(user?.wins||0).toLocaleString()} wins</div>
              </div>
              <a href="profile.html" style="flex-shrink:0;font-size:.75rem;font-weight:900;color:#a78bfa;text-decoration:none;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);padding:7px 14px;border-radius:99px;transition:background .15s" onmouseover="this.style.background='rgba(167,139,250,.22)'" onmouseout="this.style.background='rgba(167,139,250,.1)'">Profile →</a>
            </div>

            <!-- Stats grid -->
            <div class="sett-stat-grid" style="margin-top:12px">
              <div class="sett-stat-box"><div class="sett-stat-num">${data?.level||1}</div><div class="sett-stat-lbl">Level</div></div>
              <div class="sett-stat-box"><div class="sett-stat-num">${Number(user?.wins||0).toLocaleString()}</div><div class="sett-stat-lbl">Total Wins</div></div>
              <div class="sett-stat-box"><div class="sett-stat-num">${data?.recent||0}</div><div class="sett-stat-lbl">Games Played</div></div>
              <div class="sett-stat-box"><div class="sett-stat-num">${data?.joined||0}d</div><div class="sett-stat-lbl">Days Active</div></div>
            </div>
          </div>

          <!-- ══════════════ 2. APPEARANCE ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">🎨 Appearance</div>

            <!-- Themes -->
            <div style="margin-bottom:14px">
              <div style="font-size:.78rem;font-weight:800;margin-bottom:8px;color:var(--text,#f0e8ff)">Theme</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap" id="themeButtons">
                ${THEMES.map(t => `<button class="sett-theme-btn${s.theme===t.id?' active':''}" data-theme="${t.id}" style="--tc:${t.color}">${t.label}</button>`).join('')}
              </div>
            </div>

            <!-- Zoom -->
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:.78rem;font-weight:800;margin-bottom:6px">
                <span>🔍 Interface Zoom</span>
                <span id="zoomLabel" style="color:#a78bfa">${s.zoomLevel}%</span>
              </div>
              <input type="range" class="sett-slider" id="zoomSlider" min="80" max="125" step="5" value="${s.zoomLevel}" />
              <div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--muted,#9d8ec7);margin-top:4px;font-weight:700"><span>80%</span><span>100%</span><span>125%</span></div>
            </div>

            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">✨ Animations</div><div class="sett-toggle-sub">Card floats, transitions, glows</div></div>
              <div class="sett-toggle${s.animationsEnabled?' on':''}" data-key="animationsEnabled"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">📐 Compact mode</div><div class="sett-toggle-sub">Smaller cards and less padding</div></div>
              <div class="sett-toggle${s.compactMode?' on':''}" data-key="compactMode"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">💡 Glow effects</div><div class="sett-toggle-sub">Neon glows on avatars and UI</div></div>
              <div class="sett-toggle${s.glowEnabled?' on':''}" data-key="glowEnabled"></div>
            </label>
          </div>

          <!-- ══════════════ 3. SOUND ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">🔊 Sound</div>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🔔 Sound effects</div><div class="sett-toggle-sub">Clicks, purchases, wins, boosts</div></div>
              <div class="sett-toggle${s.soundEnabled?' on':''}" data-key="soundEnabled"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🎵 Background music</div><div class="sett-toggle-sub">Ambient synth loop while playing</div></div>
              <div class="sett-toggle${s.musicEnabled?' on':''}" data-key="musicEnabled"></div>
            </label>
            <!-- Volume -->
            <div style="margin-top:8px">
              <div style="display:flex;justify-content:space-between;font-size:.78rem;font-weight:800;margin-bottom:6px">
                <span>🎚️ Master Volume</span>
                <span id="volLabel" style="color:#a78bfa">${Math.round(s.volumeLevel*100)}%</span>
              </div>
              <input type="range" class="sett-slider" id="volSlider" min="0" max="100" step="5" value="${Math.round(s.volumeLevel*100)}" />
              <div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--muted,#9d8ec7);margin-top:4px;font-weight:700"><span>Mute</span><span>50%</span><span>100%</span></div>
            </div>
          </div>

          <!-- ══════════════ 4. NOTIFICATIONS ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">🔔 Notifications</div>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">📩 All notifications</div><div class="sett-toggle-sub">Master toggle for all alerts</div></div>
              <div class="sett-toggle${s.notificationsEnabled?' on':''}" data-key="notificationsEnabled"></div>
            </label>
            <div style="padding-left:16px;border-left:2px solid rgba(167,139,250,.15);margin-top:4px;display:flex;flex-direction:column;gap:0" id="notif-sub-group">
              <label class="sett-toggle-row">
                <span class="sett-toggle-label" style="font-size:.82rem">🪙 Coin rewards</span>
                <div class="sett-toggle${s.notifyCoins?' on':''}" data-key="notifyCoins"></div>
              </label>
              <label class="sett-toggle-row">
                <span class="sett-toggle-label" style="font-size:.82rem">🏆 Win alerts</span>
                <div class="sett-toggle${s.notifyWins?' on':''}" data-key="notifyWins"></div>
              </label>
              <label class="sett-toggle-row">
                <span class="sett-toggle-label" style="font-size:.82rem">🤝 Friend requests</span>
                <div class="sett-toggle${s.notifyFriends?' on':''}" data-key="notifyFriends"></div>
              </label>
              <label class="sett-toggle-row">
                <span class="sett-toggle-label" style="font-size:.82rem">🛒 Shop & purchases</span>
                <div class="sett-toggle${s.notifyShop?' on':''}" data-key="notifyShop"></div>
              </label>
              <label class="sett-toggle-row">
                <span class="sett-toggle-label" style="font-size:.82rem">⚡ Live events</span>
                <div class="sett-toggle${s.notifyEvents?' on':''}" data-key="notifyEvents"></div>
              </label>
              <label class="sett-toggle-row">
                <span class="sett-toggle-label" style="font-size:.82rem">🎖️ Achievements</span>
                <div class="sett-toggle${s.notifyAchievements?' on':''}" data-key="notifyAchievements"></div>
              </label>
            </div>
          </div>

          <!-- ══════════════ 5. ACCESSIBILITY ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">♿ Accessibility</div>

            <!-- Font size -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0">
              <div>
                <div class="sett-toggle-label">🔡 Font size</div>
                <div class="sett-toggle-sub">Base text size across the app</div>
              </div>
              <select class="sett-select" id="fontSizeSelect">
                <option value="small"   ${s.fontSize==='small'  ?'selected':''}>Small</option>
                <option value="normal"  ${s.fontSize==='normal' ?'selected':''}>Normal</option>
                <option value="large"   ${s.fontSize==='large'  ?'selected':''}>Large</option>
                <option value="xlarge"  ${s.fontSize==='xlarge' ?'selected':''}>X-Large</option>
              </select>
            </div>

            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🌀 Reduce motion</div><div class="sett-toggle-sub">Minimize all animations and transitions</div></div>
              <div class="sett-toggle${s.reduceMotion?' on':''}" data-key="reduceMotion"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🔆 High contrast</div><div class="sett-toggle-sub">Stronger borders and brighter elements</div></div>
              <div class="sett-toggle${s.highContrast?' on':''}" data-key="highContrast"></div>
            </label>
          </div>

          <!-- ══════════════ 6. PERFORMANCE ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">⚡ Performance</div>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">⭐ Starfield background</div><div class="sett-toggle-sub">Animated star particles behind pages</div></div>
              <div class="sett-toggle${s.starfieldEnabled?' on':''}" data-key="starfieldEnabled"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🎊 Confetti effects</div><div class="sett-toggle-sub">Burst animation on rewards and wins</div></div>
              <div class="sett-toggle${s.confettiEnabled?' on':''}" data-key="confettiEnabled"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🃏 Card tilt on hover</div><div class="sett-toggle-sub">3D tilt effect when hovering game cards</div></div>
              <div class="sett-toggle${s.cardTiltEnabled?' on':''}" data-key="cardTiltEnabled"></div>
            </label>
          </div>

          <!-- ══════════════ 7. PRIVACY ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">🔒 Privacy</div>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🟢 Show online status</div><div class="sett-toggle-sub">Friends can see when you're active</div></div>
              <div class="sett-toggle${s.showOnline?' on':''}" data-key="showOnline"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🎮 Share game history</div><div class="sett-toggle-sub">Recently played games visible to others</div></div>
              <div class="sett-toggle${s.shareGameHistory?' on':''}" data-key="shareGameHistory"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">🤝 Allow friend requests</div><div class="sett-toggle-sub">Others can send you friend requests</div></div>
              <div class="sett-toggle${s.allowFriendRequests?' on':''}" data-key="allowFriendRequests"></div>
            </label>
          </div>

          <!-- ══════════════ 8. GAMEPLAY ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">🕹️ Gameplay</div>

            <!-- Difficulty -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0">
              <div>
                <div class="sett-toggle-label">⚔️ Difficulty</div>
                <div class="sett-toggle-sub">Default difficulty for all games</div>
              </div>
              <select class="sett-select" id="difficultySelect">
                <option value="easy"   ${s.difficulty==='easy'  ?'selected':''}>🟢 Easy</option>
                <option value="normal" ${s.difficulty==='normal'?'selected':''}>🟡 Normal</option>
                <option value="hard"   ${s.difficulty==='hard'  ?'selected':''}>🔴 Hard</option>
              </select>
            </div>

            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">💡 Show hints</div><div class="sett-toggle-sub">Tips and tutorials during games</div></div>
              <div class="sett-toggle${s.showHints?' on':''}" data-key="showHints"></div>
            </label>
            <label class="sett-toggle-row">
              <div><div class="sett-toggle-label">💾 Auto-save progress</div><div class="sett-toggle-sub">Automatically save your game state</div></div>
              <div class="sett-toggle${s.autoSave?' on':''}" data-key="autoSave"></div>
            </label>
          </div>

          <!-- ══════════════ 9. LANGUAGE ══════════════ -->
          <div class="sett-section">
            <div class="sett-section-label">🌍 Language</div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0">
              <div>
                <div class="sett-toggle-label">🗣️ Language</div>
                <div class="sett-toggle-sub">Interface language (more coming soon)</div>
              </div>
              <select class="sett-select" id="languageSelect">
                <option value="en" ${s.language==='en'?'selected':''}>🇺🇸 English</option>
                <option value="ar" ${s.language==='ar'?'selected':''}>🇸🇦 Arabic</option>
                <option value="fr" ${s.language==='fr'?'selected':''}>🇫🇷 French</option>
                <option value="es" ${s.language==='es'?'selected':''}>🇪🇸 Spanish</option>
                <option value="de" ${s.language==='de'?'selected':''}>🇩🇪 German</option>
                <option value="ja" ${s.language==='ja'?'selected':''}>🇯🇵 Japanese</option>
              </select>
            </div>
          </div>

          <!-- ══════════════ 10. DATA & ACCOUNT ══════════════ -->
          <div class="sett-section" style="border-color:rgba(248,113,113,.15)">
            <div class="sett-section-label" style="color:#f87171">🗂️ Data & Account</div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0 10px">
              <button class="sett-btn sett-btn-secondary" id="exportDataBtn">📤 Export Data</button>
              <button class="sett-btn sett-btn-secondary" id="clearHistoryBtn">🧹 Clear Game History</button>
              <button class="sett-btn sett-btn-secondary" id="clearBoostsBtn">💊 Clear Boosts</button>
            </div>

            <div class="sett-divider"></div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;padding:10px 0 0">
              <button class="sett-btn sett-btn-danger" onclick="if(confirm('Log out of Eylox?')) { window.Auth?.logout ? Auth.logout() : (localStorage.removeItem('eylox_token'), localStorage.removeItem('eylox_user'), window.location.href='login.html'); }">🚪 Log Out</button>
              <button class="sett-btn sett-btn-danger" style="opacity:.65;border-color:rgba(248,113,113,.1)" onclick="if(confirm('⚠️ Reset ALL local data? This cannot be undone and you will lose everything!')){localStorage.clear();location.reload()}">🗑 Reset All Data</button>
            </div>
          </div>

          <!-- Version -->
          <div style="text-align:center;padding-top:12px;color:rgba(157,142,199,.35);font-size:.68rem;font-weight:700">Eylox v3.0 · Built with ❤️ · All data stored locally</div>

        </div>
      </div>`;

    injectModalCSS();
    document.body.appendChild(modal);

    /* ── Close ── */
    modal.querySelector('#settingsCloseBtn').addEventListener('click', closeSettings);
    modal.addEventListener('click', e => { if (e.target === modal) closeSettings(); });

    /* ── Theme buttons ── */
    modal.querySelector('#themeButtons').addEventListener('click', e => {
      const btn = e.target.closest('.sett-theme-btn');
      if (!btn) return;
      const s2 = getSettings();
      s2.theme = btn.dataset.theme;
      saveSettings(s2);
      applyTheme(s2.theme);
      modal.querySelectorAll('.sett-theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === s2.theme));
      window.EyloxSFX?.click?.();
    });

    /* ── Toggle switches ── */
    modal.querySelectorAll('.sett-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const key = toggle.dataset.key;
        const s2 = getSettings();
        s2[key] = !s2[key];
        saveSettings(s2);
        toggle.classList.toggle('on', s2[key]);
        window.EyloxSFX?.click?.();

        /* Side effects */
        if (key === 'animationsEnabled' || key === 'reduceMotion') applyAllSettings();
        if (key === 'musicEnabled') {
          if (s2.musicEnabled) window.EyloxMusic?.start?.();
          else window.EyloxMusic?.stop?.();
        }
        if (key === 'starfieldEnabled') applyStarfield(s2.starfieldEnabled);
        if (key === 'glowEnabled') applyGlow(s2.glowEnabled);
        if (key === 'highContrast') applyHighContrast(s2.highContrast);
        if (key === 'confettiEnabled') window._confettiEnabled = s2.confettiEnabled;
        if (key === 'notificationsEnabled') {
          const sub = document.getElementById('notif-sub-group');
          if (sub) sub.style.opacity = s2.notificationsEnabled ? '1' : '.4';
        }
      });
    });

    /* Initial notif sub-group state */
    const sub = document.getElementById('notif-sub-group');
    if (sub) sub.style.opacity = getSettings().notificationsEnabled ? '1' : '.4';

    /* ── Zoom slider ── */
    const zoomSlider = modal.querySelector('#zoomSlider');
    const zoomLabel  = modal.querySelector('#zoomLabel');
    if (zoomSlider) {
      zoomSlider.addEventListener('input', () => {
        const val = parseInt(zoomSlider.value);
        zoomLabel.textContent = val + '%';
        const s2 = getSettings(); s2.zoomLevel = val; saveSettings(s2);
        applyZoom(val);
      });
    }

    /* ── Volume slider ── */
    const volSlider = modal.querySelector('#volSlider');
    const volLabel  = modal.querySelector('#volLabel');
    if (volSlider) {
      volSlider.addEventListener('input', () => {
        const pct = parseInt(volSlider.value);
        volLabel.textContent = pct + '%';
        const vol = pct / 100;
        const s2 = getSettings(); s2.volumeLevel = vol; saveSettings(s2);
        window.EyloxMusic?.setVolume?.(vol);
      });
    }

    /* ── Font size select ── */
    modal.querySelector('#fontSizeSelect')?.addEventListener('change', e => {
      const s2 = getSettings(); s2.fontSize = e.target.value; saveSettings(s2);
      applyFontSize(e.target.value);
    });

    /* ── Difficulty select ── */
    modal.querySelector('#difficultySelect')?.addEventListener('change', e => {
      const s2 = getSettings(); s2.difficulty = e.target.value; saveSettings(s2);
    });

    /* ── Language select ── */
    modal.querySelector('#languageSelect')?.addEventListener('change', e => {
      const s2 = getSettings(); s2.language = e.target.value; saveSettings(s2);
      applyLanguage(e.target.value);
    });

    /* ── Data buttons ── */
    modal.querySelector('#exportDataBtn')?.addEventListener('click', () => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('eylox_')) {
          try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); }
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `eylox-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    modal.querySelector('#clearHistoryBtn')?.addEventListener('click', () => {
      if (confirm('Clear your game history? This cannot be undone.')) {
        localStorage.removeItem('eylox_recently_played');
        alert('✅ Game history cleared!');
      }
    });

    modal.querySelector('#clearBoostsBtn')?.addEventListener('click', () => {
      if (confirm('Clear all active boosts and inventory?')) {
        localStorage.removeItem('eylox_active_boosts');
        localStorage.removeItem('eylox_inventory');
        alert('✅ Boosts cleared!');
      }
    });

    return modal;
  }

  function openSettings() {
    /* Always rebuild to get fresh user data */
    document.getElementById('eyloxSettingsModal')?.remove();
    const modal = buildModal();
    requestAnimationFrame(() => { modal.style.display = 'flex'; });
    window.EyloxSFX?.click?.();
  }
  function closeSettings() {
    const modal = document.getElementById('eyloxSettingsModal');
    if (modal) {
      modal.style.opacity = '0';
      modal.style.transition = 'opacity .2s';
      setTimeout(() => { modal.style.display = 'none'; modal.style.opacity = ''; modal.style.transition = ''; }, 200);
    }
  }
  window.EyloxOpenSettings  = openSettings;
  window.EyloxCloseSettings = closeSettings;

  /* ── Wire up all settingsBtn triggers ── */
  document.addEventListener('DOMContentLoaded', () => {
    applyAllSettings();
    document.querySelectorAll('#settingsBtn').forEach(btn => {
      btn.addEventListener('click', e => { e.preventDefault(); openSettings(); });
    });
  });

  /* ── Re-apply on settings change from another tab ── */
  window.addEventListener('storage', e => {
    if (e.key === 'eylox_settings') applyAllSettings();
  });

})();
