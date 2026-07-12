/* ══════════════════════════════════════════════════════════════
   EYLOX — pricing.js
   Billing toggle, live currency formatting, Eylux package rendering,
   FAQ accordion, scroll-reveal animation, and demo buy handlers.
   All purchases here are DEMO ONLY — no real checkout is wired up.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── FX rates — EGP base currency (mirrors subscription.html) ── */
  var FX = {
    EGP: { r: 1,      sym: 'EGP ' },
    USD: { r: 0.0205, sym: '$'    },
    EUR: { r: 0.0188, sym: '€' },
    GBP: { r: 0.0160, sym: '£' },
    SAR: { r: 0.0769, sym: 'SAR ' },
    AED: { r: 0.0753, sym: 'AED ' }
  };
  var ANNUAL_DISCOUNT = 0.80; // 20% off, matches subscription.html

  function detectCurrency() {
    try {
      var tz = Intl && Intl.DateTimeFormat ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '';
      var lang = navigator.language || '';
      if (tz.indexOf('Cairo') > -1 || lang.indexOf('ar-EG') === 0) return 'EGP';
      if (tz.indexOf('Riyadh') > -1 || tz.indexOf('Kuwait') > -1 || lang.indexOf('ar-SA') === 0) return 'SAR';
      if (tz.indexOf('Dubai') > -1 || tz.indexOf('Abu_Dhabi') > -1 || lang.indexOf('ar-AE') === 0) return 'AED';
      if (lang.indexOf('en-GB') === 0) return 'GBP';
      if (['de', 'fr', 'it', 'nl', 'es'].some(function (l) { return lang.indexOf(l) === 0; })) return 'EUR';
      if (lang.indexOf('en-US') === 0) return 'USD';
    } catch (e) { /* fall through */ }
    return 'EGP';
  }

  var currency = detectCurrency();

  function fmtPrice(egp) {
    var fx = FX[currency] || FX.EGP;
    var raw = egp * fx.r;
    var n = raw < 10 && raw > 0 ? +raw.toFixed(2) : Math.round(raw);
    return fx.sym + n.toLocaleString();
  }

  /* ── Plan monthly base prices (EGP), matches subscription.html tiers ── */
  var PLAN_PRICE_EGP = { premium: 299, creator: 999 };

  /* ── Eylux currency packages (real-money purchase, demo only) ── */
  var EYLUX_PACKS = [
    { id: 'starter', icon: '🪙', amount: 1000,  bonus: 0,    egp: 49   },
    { id: 'popular',  icon: '💰', amount: 5500,  bonus: 500,  egp: 249,  tag: 'MOST POPULAR', best: true },
    { id: 'value',    icon: '💸', amount: 12000, bonus: 1500, egp: 499  },
    { id: 'mega',     icon: '🏆', amount: 26000, bonus: 4000, egp: 999  },
    { id: 'ultimate', icon: '👑', amount: 60000, bonus: 12000,egp: 1999, tag: 'BEST VALUE' }
  ];

  var isAnnual = false;

  function renderPlanPrices() {
    document.querySelectorAll('[data-plan-price]').forEach(function (el) {
      var planId = el.getAttribute('data-plan-price');
      var egp = PLAN_PRICE_EGP[planId];
      if (egp === undefined) { return; } // free plan — leave static markup
      var monthlyTotal = isAnnual ? egp * ANNUAL_DISCOUNT : egp;
      el.textContent = fmtPrice(isAnnual ? monthlyTotal : egp);
    });
    document.querySelectorAll('[data-plan-period]').forEach(function (el) {
      el.textContent = isAnnual ? '/ mo, billed yearly' : '/ month';
    });
    document.querySelectorAll('[data-plan-annual-note]').forEach(function (el) {
      var planId = el.getAttribute('data-plan-annual-note');
      var egp = PLAN_PRICE_EGP[planId];
      if (!egp) { el.textContent = ''; return; }
      el.textContent = isAnnual ? ('Billed as ' + fmtPrice(Math.round(egp * 12 * ANNUAL_DISCOUNT)) + '/year') : '';
    });
  }

  function setupBillingToggle() {
    var toggle = document.getElementById('billingSwitch');
    var monthlyLabel = document.getElementById('billingMonthlyLabel');
    var annualLabel = document.getElementById('billingAnnualLabel');
    if (!toggle) { return; }
    toggle.addEventListener('click', function () {
      isAnnual = !isAnnual;
      toggle.classList.toggle('on', isAnnual);
      if (monthlyLabel) { monthlyLabel.classList.toggle('active', !isAnnual); }
      if (annualLabel) { annualLabel.classList.toggle('active', isAnnual); }
      renderPlanPrices();
    });
  }

  function renderEyluxPacks() {
    var grid = document.getElementById('eyluxGrid');
    if (!grid) { return; }
    grid.innerHTML = EYLUX_PACKS.map(function (p) {
      var totalCoins = p.amount + p.bonus;
      return (
        '<div class="eylux-card' + (p.best ? ' best' : '') + '" data-animate>' +
        (p.tag ? '<div class="eylux-tag">' + p.tag + '</div>' : '') +
        '<div class="eylux-icon">' + p.icon + '</div>' +
        '<div class="eylux-amount">' + totalCoins.toLocaleString() + ' Eylux</div>' +
        '<div class="eylux-bonus">' + (p.bonus ? '+' + p.bonus.toLocaleString() + ' bonus' : '') + '</div>' +
        '<div class="eylux-price">' + fmtPrice(p.egp) + '</div>' +
        '<button class="eylux-buy" data-demo-buy="' + totalCoins.toLocaleString() + ' Eylux">Buy Now</button>' +
        '</div>'
      );
    }).join('');
  }

  /* ── FAQ accordion ── */
  function setupFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q');
      if (!q) { return; }
      q.addEventListener('click', function () {
        item.classList.toggle('open');
      });
    });
  }

  /* ── Demo buy buttons (no real checkout) ── */
  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById('pricingToast');
    if (!toast) { return; }
    toast.innerHTML = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  function setupDemoBuy() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-demo-buy]');
      if (!btn) { return; }
      var label = btn.getAttribute('data-demo-buy');
      showToast('🚧 <strong>Demo mode</strong> — "' + label + '" checkout is not connected yet.');
    });
  }

  /* ── Scroll reveal ── */
  function setupReveal() {
    var targets = document.querySelectorAll('.pr-card, [data-animate], .legal-section');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderEyluxPacks();
    renderPlanPrices();
    setupBillingToggle();
    setupFaq();
    setupDemoBuy();
    setupReveal();
  });
})();
