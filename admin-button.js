/* ============================================================
   EYLOX — Admin Button Controller
   Shows admin button only for Owner accounts (checked via localStorage)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initAdminButton();
});

function initAdminButton() {
  if (localStorage.getItem('eylox_is_owner') === 'true') {
    showAdminButton();
  }
}

function showAdminButton() {
  // Check if admin button already exists
  if (document.getElementById('adminBtn')) return;

  const topbar = document.querySelector('.topbar-right');
  if (!topbar) return;

  // Create admin button
  const adminBtn = document.createElement('a');
  adminBtn.id = 'adminBtn';
  adminBtn.href = 'admin.html';
  adminBtn.className = 'tb-btn admin-btn';
  adminBtn.setAttribute('aria-label', 'Admin Panel');
  adminBtn.setAttribute('title', 'Admin Panel (Owner Only)');
  adminBtn.style.cssText = `
    background: linear-gradient(135deg, #78350f, #f59e0b, #fde68a);
    color: #1a0800;
    font-family: 'Fredoka One', cursive;
    font-weight: 900;
    font-size: .8rem;
    letter-spacing: .3px;
    padding: 7px 16px;
    border-radius: 99px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    position: relative;
    width: auto; height: auto; flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(245,158,11,.55), 0 0 0 2px rgba(253,230,138,.25);
    transition: transform .18s, box-shadow .18s;
    overflow: visible;
    margin-right: 4px;
  `;
  /* Inject crown keyframe once */
  if (!document.getElementById('adminBtnStyles')) {
    const s = document.createElement('style');
    s.id = 'adminBtnStyles';
    s.textContent = '@keyframes crown-spin{0%{transform:rotate(-12deg) scale(1)}25%{transform:rotate(12deg) scale(1.15)}50%{transform:rotate(-8deg) scale(1.05)}75%{transform:rotate(8deg) scale(1.1)}100%{transform:rotate(-12deg) scale(1)}}';
    document.head.appendChild(s);
  }
  adminBtn.innerHTML = `
    <span style="display:inline-block;animation:crown-spin 2.5s ease-in-out infinite">👑</span>
    Admin
    <span style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:#4ade80;border-radius:50%;border:2px solid #07011a;box-shadow:0 0 6px #4ade80"></span>
  `;

  adminBtn.addEventListener('mouseover', () => {
    adminBtn.style.transform = 'scale(1.08) translateY(-2px)';
    adminBtn.style.boxShadow = '0 8px 32px rgba(245,158,11,.8), 0 0 0 3px rgba(253,230,138,.4)';
  });
  adminBtn.addEventListener('mouseout', () => {
    adminBtn.style.transform = '';
    adminBtn.style.boxShadow = '0 4px 20px rgba(245,158,11,.55), 0 0 0 2px rgba(253,230,138,.25)';
  });

  // Insert before the notifications button
  const notifBtn = topbar.querySelector('.tb-btn:first-child');
  if (notifBtn) {
    topbar.insertBefore(adminBtn, notifBtn);
  } else {
    topbar.insertBefore(adminBtn, topbar.firstChild);
  }
}
