/* ============================================================
   EYLOX — Studio Sidebar Button
   Injects "EYLOX Studio" link into the "More" sidebar section.
   Visible only for the Owner account (eylox_is_owner flag).
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('eylox_is_owner') !== 'true') return;
  injectStudioLink();
});

function injectStudioLink() {
  if (document.getElementById('studioSidebarLink')) return;

  /* Find the "More" section label, then its sibling nav > ul */
  let moreUL = null;
  document.querySelectorAll('.sidebar-section-label').forEach(label => {
    if (label.textContent.trim() === 'More') {
      const nav = label.nextElementSibling;
      if (nav) moreUL = nav.querySelector('ul');
    }
  });
  if (!moreUL) return;

  /* Build the <li> item */
  const li = document.createElement('li');
  li.innerHTML = `
    <a href="eylox-studio.html" class="sidebar-link" id="studioSidebarLink"
       style="position:relative;overflow:visible;">
      <span class="s-icon" style="
        display:inline-flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;filter:drop-shadow(0 0 6px rgba(168,85,247,.7));
        animation:studio-pulse 2s ease-in-out infinite;
      ">🛠️</span>
      <span class="s-label" style="
        background:linear-gradient(90deg,#a78bfa,#f472b6);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;font-weight:900;
      ">EYLOX Studio</span>
      <span style="
        position:absolute;right:8px;top:50%;transform:translateY(-50%);
        font-size:.5rem;font-weight:900;letter-spacing:.4px;
        background:linear-gradient(135deg,#7c3aed,#ec4899);
        color:#fff;padding:2px 6px;border-radius:99px;
        font-family:'Fredoka One',cursive;
        box-shadow:0 0 8px rgba(168,85,247,.6);
        -webkit-text-fill-color:#fff;
      ">AI</span>
    </a>`;

  /* Inject animation keyframe once */
  if (!document.getElementById('studioBtnStyles')) {
    const s = document.createElement('style');
    s.id = 'studioBtnStyles';
    s.textContent = `
      @keyframes studio-pulse {
        0%,100% { filter:drop-shadow(0 0 4px rgba(168,85,247,.5)); }
        50%      { filter:drop-shadow(0 0 10px rgba(236,72,153,.9)); }
      }
      #studioSidebarLink:hover .s-label,
      #studioSidebarLink:focus .s-label {
        -webkit-text-fill-color:transparent !important;
      }
      #studioSidebarLink:hover {
        background:linear-gradient(135deg,rgba(124,58,237,.18),rgba(236,72,153,.12)) !important;
      }`;
    document.head.appendChild(s);
  }

  /* Insert before the Settings <li>, or append */
  const settingsLi = moreUL.querySelector('#settingsBtn')?.closest('li');
  if (settingsLi) {
    moreUL.insertBefore(li, settingsLi);
  } else {
    /* Fallback: before the last item (Logout) */
    const items = moreUL.querySelectorAll('li');
    const last = items[items.length - 1];
    moreUL.insertBefore(li, last || null);
  }
}