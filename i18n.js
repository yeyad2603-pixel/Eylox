/* ============================================================
   EYLOX — i18n.js
   Comprehensive site-wide translation overlay.
   Walks ALL visible text nodes with TreeWalker, replaces known
   English strings, observes DOM mutations for dynamic content,
   and listens for settings changes to re-translate instantly.
   ============================================================ */
'use strict';

(function EyloxI18n() {

  /* ── Extended translations dictionary ── */
  const T = {
    en: {
      /* Navigation */
      home:'Home', games:'Discover', friends:'Friends', profile:'Profile',
      leaderboard:'Leaderboard', messages:'Messages', achievements:'Achievements',
      communities:'Communities', liveEvents:'Live Events', shop:'Shop',
      youtube:'YouTube', ai:'AI Gaming', avatar:'Avatar',
      settings:'Settings', menu:'Menu', more:'More', logout:'Log Out',

      /* Page titles */
      pageHome:'Home', pageGames:'Discover Games', pageFriends:'Friends Hub',
      pageProfile:'My Profile', pageLeaderboard:'Leaderboard', pageMessages:'Messages',
      pageAchievements:'Achievements', pageCommunities:'Communities',
      pageLiveEvents:'Live Events', pageShop:'Shop',

      /* Section titles */
      trendingNow:'Trending Now', featuredGames:'Featured Games',
      recentlyPlayed:'Recently Played', newGames:'New Games',
      topRated:'Top Rated', myFriends:'My Friends',
      friendRequests:'Friend Requests', discoverPlayers:'People You May Know',
      yourActivity:'Your Activity', myAchievements:'My Achievements',

      /* Buttons & labels */
      playNow:'Play Now', play3D:'Play 3D', addFriend:'Add Friend',
      sendMsg:'Send', searchGames:'Search games…', searchFriends:'Search friends…',
      claimReward:'Claim Now', viewAll:'View All',
      dailyReward:'Daily Reward', online:'Online', offline:'Offline',
      coins:'Coins', Eyltrophs:'Eyltrophs', level:'Level',
      eylux:'Eylux',

      /* Filter tabs */
      filterAll:'All', filterAdventure:'Adventure', filterAction:'Action',
      filterPuzzle:'Puzzle', filterRacing:'Racing', filterBuilding:'Building',
      filterSurvival:'Survival', filterRoleplay:'Roleplay',

      /* 3D section */
      play3DTitle:'Play in Full 3D',
      play3DSub:'Roblox-style immersive worlds — jump, explore, and collect!',
      tag3D:'BRAND NEW • 3D',

      /* Game genres */
      genreAction:'Action', genreAdventure:'Adventure', genrePuzzle:'Puzzle',
      genreRacing:'Racing', genreBuilding:'Building', genreSurvival:'Survival',
      genreRoleplay:'Roleplay',

      /* Welcome */
      welcomeBack:'Welcome back', connectedCrew:'Stay connected with your gaming crew',
      findFriend:'Find a Friend', addByUsername:'Add friends by their username to see them here',

      /* Misc */
      loading:'Loading…', loadingGames:'Loading games… 🎮',
      logOut:'Log Out',
    },

    ar: {
      home:'الرئيسية', games:'استكشاف',
      friends:'أصدقاء', profile:'ملفي',
      leaderboard:'لوحة الصدارة',
      messages:'الرسائل', achievements:'الإنجازات',
      communities:'المجتمعات',
      liveEvents:'أحداث حية', shop:'المتجر',
      youtube:'يوتيوب', ai:'ذكاء اصطناعي',
      avatar:'شخصيتي',
      settings:'الإعدادات',
      menu:'القائمة', more:'المزيد',
      logout:'خروج',
      pageHome:'الرئيسية',
      pageGames:'اكتشاف الألعاب',
      pageFriends:'الأصدقاء',
      pageProfile:'ملفي الشخصي',
      pageLeaderboard:'لوحة الصدارة',
      pageMessages:'الرسائل',
      pageAchievements:'الإنجازات',
      pageCommunities:'المجتمعات',
      pageLiveEvents:'الأحداث المباشرة',
      pageShop:'المتجر',
      trendingNow:'رائج الآن',
      featuredGames:'ألعاب مميزة',
      recentlyPlayed:'لعبت مؤخراً',
      newGames:'ألعاب جديدة',
      topRated:'الأعلى تقييماً',
      myFriends:'أصدقائي',
      friendRequests:'طلبات الصداقة',
      discoverPlayers:'أشخاص قد تعرفهم',
      yourActivity:'نشاطك',
      myAchievements:'إنجازاتي',
      playNow:'العب الآن',
      play3D:'العب ثلاثي',
      addFriend:'إضافة صديق',
      sendMsg:'إرسال',
      searchGames:'ابحث عن ألعاب…',
      searchFriends:'ابحث عن أصدقاء…',
      claimReward:'احصل عليه',
      viewAll:'عرض الكل',
      dailyReward:'مكافأة يومية',
      online:'متصل', offline:'غير متصل',
      coins:'عملات', Eyltrophs:'كؤوس', level:'المستوى',
      eylux:'إيلكس',
      filterAll:'الكل', filterAdventure:'مغامرة',
      filterAction:'أكشن', filterPuzzle:'ألغاز',
      filterRacing:'سباقات', filterBuilding:'بناء',
      filterSurvival:'نجاة', filterRoleplay:'تمثيل',
      play3DTitle:'العب بثلاثي حقيقي',
      play3DSub:'عوالم غامرة — اقفز، استكشف، واجمع!',
      genreAction:'أكشن', genreAdventure:'مغامرة',
      genrePuzzle:'ألغاز', genreRacing:'سباقات',
      genreBuilding:'بناء', genreSurvival:'نجاة',
      genreRoleplay:'تمثيل',
      welcomeBack:'مرحباً بعودتك',
      connectedCrew:'ابق على تواصل مع فريق الألعاب',
      findFriend:'ابحث عن صديق',
      addByUsername:'أضف أصدقاء باسم المستخدم',
      loading:'جاري التحميل…',
      loadingGames:'جاري تحميل الألعاب… 🎮',
      logOut:'تسجيل خروج',
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
      playNow:'Jouer', play3D:'Jouer 3D', addFriend:'Ajouter', sendMsg:'Envoyer',
      searchGames:'Rechercher des jeux…', searchFriends:'Rechercher des amis…',
      claimReward:'Réclamer', viewAll:'Voir tout',
      dailyReward:'Récompense quotidienne', online:'En ligne', offline:'Hors ligne',
      coins:'Pièces', Eyltrophs:'Trophées', level:'Niveau', eylux:'Eylux',
      filterAll:'Tout', filterAdventure:'Aventure', filterAction:'Action',
      filterPuzzle:'Puzzle', filterRacing:'Course', filterBuilding:'Construction',
      filterSurvival:'Survie', filterRoleplay:'Rôle',
      play3DTitle:'Jouer en 3D complète',
      play3DSub:'Mondes immersifs — saute, explore et collecte !',
      genreAction:'Action', genreAdventure:'Aventure', genrePuzzle:'Puzzle',
      genreRacing:'Course', genreBuilding:'Construction', genreSurvival:'Survie',
      genreRoleplay:'Rôle',
      welcomeBack:'Bon retour', connectedCrew:'Restez connecté avec votre équipe',
      findFriend:'Trouver un ami', addByUsername:'Ajoutez des amis par leur nom',
      loading:'Chargement…', loadingGames:'Chargement des jeux… 🎮',
      logOut:'Déconnexion',
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
      playNow:'Jugar', play3D:'Jugar 3D', addFriend:'Añadir amigo', sendMsg:'Enviar',
      searchGames:'Buscar juegos…', searchFriends:'Buscar amigos…',
      claimReward:'Reclamar', viewAll:'Ver todo',
      dailyReward:'Recompensa diaria', online:'En línea', offline:'Desconectado',
      coins:'Monedas', Eyltrophs:'Trofeos', level:'Nivel', eylux:'Eylux',
      filterAll:'Todo', filterAdventure:'Aventura', filterAction:'Acción',
      filterPuzzle:'Puzzle', filterRacing:'Carreras', filterBuilding:'Construcción',
      filterSurvival:'Supervivencia', filterRoleplay:'Rol',
      play3DTitle:'Jugar en 3D completo',
      play3DSub:'Mundos inmersivos — ¡salta, explora y recoge !',
      genreAction:'Acción', genreAdventure:'Aventura', genrePuzzle:'Puzzle',
      genreRacing:'Carreras', genreBuilding:'Construcción', genreSurvival:'Supervivencia',
      genreRoleplay:'Rol',
      welcomeBack:'Bienvenido de nuevo', connectedCrew:'Conectá con tu equipo de juego',
      findFriend:'Buscar un amigo', addByUsername:'Agrega amigos por su nombre de usuario',
      loading:'Cargando…', loadingGames:'Cargando juegos… 🎮',
      logOut:'Cerrar sesión',
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
      playNow:'Spielen', play3D:'3D spielen', addFriend:'Hinzufügen', sendMsg:'Senden',
      searchGames:'Spiele suchen…', searchFriends:'Freunde suchen…',
      claimReward:'Abholen', viewAll:'Alle anzeigen',
      dailyReward:'Tägliche Belohnung', online:'Online', offline:'Offline',
      coins:'Münzen', Eyltrophs:'Trophäen', level:'Level', eylux:'Eylux',
      filterAll:'Alle', filterAdventure:'Abenteuer', filterAction:'Action',
      filterPuzzle:'Rätsel', filterRacing:'Rennen', filterBuilding:'Bauen',
      filterSurvival:'Überleben', filterRoleplay:'Rollenspiel',
      play3DTitle:'In vollem 3D spielen',
      play3DSub:'Immersive Welten — springen, erkunden und sammeln !',
      genreAction:'Action', genreAdventure:'Abenteuer', genrePuzzle:'Rätsel',
      genreRacing:'Rennen', genreBuilding:'Bauen', genreSurvival:'Überleben',
      genreRoleplay:'Rollenspiel',
      welcomeBack:'Willkommen zurück', connectedCrew:'Bleib mit deinem Team verbunden',
      findFriend:'Freund finden', addByUsername:'Füge Freunde per Benutzername hinzu',
      loading:'Laden…', loadingGames:'Spiele werden geladen… 🎮',
      logOut:'Abmelden',
    },

    ja: {
      home:'ホーム', games:'ゲーム発見',
      friends:'フレンド', profile:'プロフィール',
      leaderboard:'ランキング', messages:'メッセージ',
      achievements:'実績', communities:'コミュニティ',
      liveEvents:'ライブ', shop:'ショップ',
      youtube:'YouTube', ai:'AIゲーム', avatar:'アバター',
      settings:'設定', menu:'メニュー', more:'もっと',
      logout:'ログアウト',
      pageHome:'ホーム', pageGames:'ゲーム発見',
      pageFriends:'フレンド', pageProfile:'プロフィール',
      pageLeaderboard:'ランキング', pageMessages:'メッセージ',
      pageAchievements:'実績', pageCommunities:'コミュニティ',
      pageLiveEvents:'ライブイベント', pageShop:'ショップ',
      trendingNow:'トレンド', featuredGames:'注目ゲーム',
      recentlyPlayed:'最近プレイ', newGames:'新着ゲーム',
      topRated:'高評価', myFriends:'フレンド一覧',
      friendRequests:'フレンド申請',
      discoverPlayers:'知り合いかも',
      yourActivity:'アクティビティ',
      myAchievements:'実績一覧',
      playNow:'プレイ', play3D:'3Dプレイ',
      addFriend:'追加', sendMsg:'送信',
      searchGames:'ゲームを検索…',
      searchFriends:'フレンドを検索…',
      claimReward:'受け取る', viewAll:'すべて表示',
      dailyReward:'デイリー報酬',
      online:'オンライン', offline:'オフライン',
      coins:'コイン', Eyltrophs:'トロフィー', level:'レベル',
      eylux:'Eylux',
      filterAll:'すべて', filterAdventure:'アドベンチャー',
      filterAction:'アクション', filterPuzzle:'パズル',
      filterRacing:'レーシング', filterBuilding:'ビルド',
      filterSurvival:'サバイバル', filterRoleplay:'ロールプレイ',
      play3DTitle:'フル3Dでプレイ',
      play3DSub:'没入感われる世界 — 飛び、探索し、集めよう！',
      genreAction:'アクション', genreAdventure:'アドベンチャー',
      genrePuzzle:'パズル', genreRacing:'レーシング',
      genreBuilding:'ビルド', genreSurvival:'サバイバル',
      genreRoleplay:'ロールプレイ',
      welcomeBack:'おかえりなさい',
      connectedCrew:'ゲーム仲間とつながろう',
      findFriend:'フレンドを探す',
      addByUsername:'ユーザー名でフレンドを追加',
      loading:'読み込み中…',
      loadingGames:'ゲームを読み込んでいます… 🎮',
      logOut:'ログアウト',
    },
  };

  /* ── English text → translation key mapping ── */
  const EXACT = {
    /* Navigation */
    'Home':'home', 'Discover':'games', 'Friends':'friends', 'Profile':'profile',
    'Leaderboard':'leaderboard', 'Messages':'messages', 'Achievements':'achievements',
    'Communities':'communities', 'Live Events':'liveEvents', 'Shop':'shop',
    'YouTube':'youtube', 'AI Gaming':'ai', 'Avatar':'avatar',
    'Settings':'settings', 'Menu':'menu', 'More':'more', 'Logout':'logout',
    'Log Out':'logOut',

    /* Buttons */
    'Play Now':'playNow', '▶ Play Now':'playNow', 'Play 3D':'play3D', '▶ Play 3D':'play3D',
    'View All':'viewAll', 'Claim Now':'claimReward', 'Add Friend':'addFriend',
    'Send':'sendMsg',

    /* Filter tabs (with and without leading emoji) */
    'All':'filterAll', 'Adventure':'filterAdventure', 'Action':'filterAction',
    'Puzzle':'filterPuzzle', 'Racing':'filterRacing', 'Building':'filterBuilding',
    'Survival':'filterSurvival', 'Roleplay':'filterRoleplay',
    '🎮 All':'filterAll', '🗺️ Adventure':'filterAdventure', '⚡ Action':'filterAction',
    '🧩 Puzzle':'filterPuzzle', '🏎️ Racing':'filterRacing', '🏗️ Building':'filterBuilding',
    '💀 Survival':'filterSurvival', '🌻 Roleplay':'filterRoleplay',

    /* Section titles */
    'Trending Now':'trendingNow', 'Featured Games':'featuredGames',
    'Recently Played':'recentlyPlayed', 'New Games':'newGames', 'Top Rated':'topRated',
    'My Friends':'myFriends', 'Friend Requests':'friendRequests',
    'People You May Know':'discoverPlayers', 'Your Activity':'yourActivity',
    'My Achievements':'myAchievements',

    /* 3D section */
    'Play in Full 3D':'play3DTitle',
    'Roblox-style immersive worlds — jump, explore, and collect!':'play3DSub',

    /* Genre badges */
    'Genre: Action':'genreAction',

    /* Status */
    'Online':'online', 'Offline':'offline', 'Coins':'Eylux', 'Eyltrophs':'Eyltrophs',
    'Level':'level', 'Eylux':'eylux',

    /* Welcome */
    'Welcome back':'welcomeBack',
    'Stay connected with your gaming crew':'connectedCrew',
    'Find a Friend':'findFriend',
    'Add friends by their username to see them here':'addByUsername',

    /* Misc */
    'Loading games… 🎮':'loadingGames',
    'Daily Reward':'dailyReward',
  };

  /* Elements to translate by aria-label / placeholder */
  const PLACEHOLDER_MAP = {
    'Search games…': 'searchGames',
    'Search games': 'searchGames',
    'Search friends…': 'searchFriends',
    'Search friends': 'searchFriends',
  };

  /* ── Get current language from settings ── */
  function getLang() {
    try {
      const s = JSON.parse(localStorage.getItem('eylox_settings') || '{}');
      return s.language || 'en';
    } catch { return 'en'; }
  }

  /* ── Skip these tag names ── */
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'CANVAS',
                              'INPUT', 'TEXTAREA', 'SELECT', 'CODE', 'PRE', 'TEMPLATE']);

  /* ── Store original text for restoration ── */
  const _originals = new WeakMap();

  /* ── Translate a single text node ── */
  function translateNode(node, t) {
    const original = _originals.get(node) ?? node.textContent;
    _originals.set(node, original);

    const trimmed = original.trim();
    if (!trimmed) return;

    const key = EXACT[trimmed];
    if (key && t[key] !== undefined) {
      /* Preserve surrounding whitespace */
      const leading  = original.match(/^\s*/)[0];
      const trailing = original.match(/\s*$/)[0];
      node.textContent = leading + t[key] + trailing;
      return;
    }

    /* Try stripping leading "▶ " prefix */
    const arrow = trimmed.replace(/^[▶►]\s*/, '');
    if (arrow !== trimmed) {
      const k2 = EXACT[arrow];
      if (k2 && t[k2] !== undefined) {
        const leading  = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        const prefix   = trimmed.slice(0, trimmed.length - arrow.length);
        node.textContent = leading + prefix + t[k2] + trailing;
      }
    }
  }

  /* ── Restore a text node to English ── */
  function restoreNode(node) {
    const original = _originals.get(node);
    if (original !== undefined) node.textContent = original;
  }

  /* ── Walk all text nodes under root ── */
  function walkNodes(root, fn) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          /* Skip hidden elements */
          if (p.closest('[style*="display:none"], [hidden]')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(fn);
  }

  /* ── Translate placeholders and aria-labels ── */
  function translateAttrs(root, t) {
    root.querySelectorAll('[placeholder]').forEach(el => {
      const orig = el.dataset.i18nOrig ?? el.getAttribute('placeholder');
      el.dataset.i18nOrig = orig;
      const key = PLACEHOLDER_MAP[orig];
      if (key && t[key]) el.setAttribute('placeholder', t[key]);
    });

    /* data-i18n attributes (used by settings.js too — skip double work) */
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });
  }

  /* ── Apply / restore RTL layout ── */
  function applyRTL(isRTL) {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    const existing = document.getElementById('i18n-rtl-style');
    if (isRTL && !existing) {
      const s = document.createElement('style');
      s.id = 'i18n-rtl-style';
      s.textContent = `
        [dir="rtl"] .sidebar { right:0;left:auto;border-right:none;border-left:1px solid rgba(167,139,250,.12); }
        [dir="rtl"] .main-area { margin-left:0;margin-right:256px; }
        [dir="rtl"] .topbar { flex-direction:row-reverse; }
        [dir="rtl"] .sidebar-link { flex-direction:row-reverse; }
        [dir="rtl"] .sidebar-section-label { text-align:right; }
        [dir="rtl"] .card-body { text-align:right; }
        [dir="rtl"] .welcome-text { text-align:right; }
        [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 { unicode-bidi: plaintext; }
        [dir="rtl"] .welcome-name { unicode-bidi: isolate; direction: ltr; display: inline-block; }
        [dir="rtl"] .card-title { unicode-bidi: plaintext; }
        [dir="rtl"] .topbar-user, [dir="rtl"] .hud-name { unicode-bidi: plaintext; }
        [dir="rtl"] .streak-text, [dir="rtl"] .ct3d { unicode-bidi: plaintext; }
        [dir="rtl"] .welcome-text p { unicode-bidi: plaintext; }
        [dir="rtl"] .pill-val, [dir="rtl"] .stat-val { direction: ltr; display: inline-block; }
      `;
      document.head.appendChild(s);
    } else if (!isRTL && existing) {
      existing.remove();
    }
  }

  let _currentLang = 'en';
  let _observer = null;

  /* ── Main translation function ── */
  function applyI18n(lang) {
    _currentLang = lang;
    const t = T[lang] || T.en;
    const isRTL = lang === 'ar';

    document.documentElement.lang = lang;
    applyRTL(isRTL);

    if (lang === 'en') {
      /* Restore all originals */
      walkNodes(document.body, restoreNode);
      document.querySelectorAll('[placeholder][data-i18n-orig]').forEach(el => {
        el.setAttribute('placeholder', el.dataset.i18nOrig);
      });
      return;
    }

    walkNodes(document.body, node => translateNode(node, t));
    translateAttrs(document.body, t);
  }

  /* ── MutationObserver — translate dynamic content ── */
  function startObserver() {
    if (_observer) _observer.disconnect();
    _observer = new MutationObserver(mutations => {
      if (_currentLang === 'en') return;
      const t = T[_currentLang] || T.en;
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              translateNode(node, t);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              walkNodes(node, n => translateNode(n, t));
              translateAttrs(node, t);
            }
          });
        }
      }
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ── Boot ── */
  function boot() {
    const lang = getLang();
    applyI18n(lang);
    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /* Re-translate when language setting changes */
  window.addEventListener('storage', e => {
    if (e.key !== 'eylox_settings') return;
    try {
      const s = JSON.parse(e.newValue || '{}');
      if (s.language && s.language !== _currentLang) applyI18n(s.language);
    } catch {}
  });

  /* Also hook into same-tab settings changes via custom event */
  window.addEventListener('eylox-settings-changed', () => {
    const newLang = getLang();
    if (newLang !== _currentLang) applyI18n(newLang);
  });

  /* Expose globally for manual calls */
  window.EyloxI18n = { apply: applyI18n, getLang };

})();
