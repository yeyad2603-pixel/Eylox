/* ============================================================
   EYLOX — User Persistence
   Saves progress per username so it survives logout/re-login.
   ============================================================ */
'use strict';

(function EyloxPersist() {

  function getUsername() {
    try {
      const u = JSON.parse(localStorage.getItem('eylox_user') || 'null');
      return u && u.username ? u.username.toLowerCase() : null;
    } catch { return null; }
  }

  function saveProgress() {
    const uname = getUsername();
    if (!uname) return;
    /* Save main user object */
    const user = localStorage.getItem('eylox_user');
    if (user) localStorage.setItem('eylox_save_' + uname, user);
    /* Save AI data */
    const ai = localStorage.getItem('eylox_ai_data');
    if (ai) localStorage.setItem('eylox_save_ai_' + uname, ai);
    /* Save friends */
    const fr = localStorage.getItem('eylox_friends');
    if (fr) localStorage.setItem('eylox_save_friends_' + uname, fr);
    /* Save profile picture */
    const pic = localStorage.getItem('eylox_profile_pic');
    if (pic) localStorage.setItem('eylox_save_pic_' + uname, pic);
    else localStorage.removeItem('eylox_save_pic_' + uname);
  }

  /* Save on page load (captures current state) */
  saveProgress();

  /* Save every 30 seconds during play */
  setInterval(saveProgress, 30000);

  /* Save before page navigates away */
  window.addEventListener('beforeunload', saveProgress);

  /* Wrap eyloxLogout after all inline scripts have run, so it saves before clearing */
  window.addEventListener('load', function() {
    const _orig = window.eyloxLogout;
    if (typeof _orig === 'function') {
      window.eyloxLogout = function() {
        saveProgress(); /* save BEFORE clearing localStorage */
        _orig.call(this);
      };
    }
  });

  /* Public API */
  window.eyloxSaveUser = saveProgress;

})();
