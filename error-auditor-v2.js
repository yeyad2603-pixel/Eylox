/* ============================================================
   EYLOX — Enhanced Error Auditor v2.0
   Comprehensive platform-wide bug detection system
   Detects: broken buttons, missing elements, invalid links,
            animation issues, mobile problems, accessibility gaps
   ============================================================ */
'use strict';

(function EyloxAuditorV2() {
  class ComprehensiveAuditor {
    constructor() {
      this.issues = [];
      this.warnings = [];
      this.recommendations = [];
      this.autoFixes = 0;
      this.timestamp = new Date().toISOString();
    }

    /* ── PHASE 1: CRITICAL VALIDATION ── */
    async runFullAudit() {
      console.log('🔍 EYLOX Comprehensive Audit Started at', this.timestamp);

      this.validateDOMStructure();
      this.validateClickHandlers();
      this.validateLinks();
      this.validateImages();
      this.validateFunctionAvailability();
      this.validateLocalStorage();
      this.validateAPIEndpoints();
      this.validateResponsiveness();
      this.validateAccessibility();
      this.validateAnimations();
      this.validateForms();
      this.validateDataSync();

      return this.generateReport();
    }

    /* ── VALIDATION 1: DOM STRUCTURE ── */
    validateDOMStructure() {
      const criticalElements = [
        { selector: '.topbar', name: 'Top Navigation Bar' },
        { selector: '.sidebar', name: 'Sidebar Navigation' },
        { selector: 'main', name: 'Main Content Area' },
        { selector: 'header', name: 'Page Header' },
        { selector: '.page-content', name: 'Page Content Container' },
        { selector: '.profile-hero', name: 'Profile Hero Section' },
        { selector: '#menuBtn', name: 'Menu Toggle Button' },
        { selector: '.search-input', name: 'Search Input' },
      ];

      criticalElements.forEach(({ selector, name }) => {
        if (!document.querySelector(selector)) {
          this.issues.push({
            severity: 'HIGH',
            type: 'Missing DOM Element',
            element: name,
            selector: selector,
            fix: `Element ${name} not found. Check HTML structure.`
          });
        }
      });
    }

    /* ── VALIDATION 2: CLICK HANDLERS ── */
    validateClickHandlers() {
      const elements = document.querySelectorAll('[onclick]');
      const missingFunctions = new Set();

      elements.forEach(el => {
        const onclick = el.getAttribute('onclick');
        if (!onclick) return;

        // Extract function name: "playGame('id')" → "playGame"
        const match = onclick.match(/^(\w+)\s*\(/);
        if (!match) return;

        const func = match[1];
        if (typeof window[func] !== 'function') {
          missingFunctions.add(func);
          this.issues.push({
            severity: 'CRITICAL',
            type: 'Broken onclick Handler',
            function: func,
            element: el.textContent.substring(0, 50),
            fix: `Define function: window.${func} = function(...) { ... }`
          });
        }
      });

      console.warn(`Found ${missingFunctions.size} undefined onclick functions:`, Array.from(missingFunctions));
    }

    /* ── VALIDATION 3: LINKS ── */
    validateLinks() {
      const links = document.querySelectorAll('a[href]');
      const invalidHrefs = [
        'undefined', '#', '', 'null', 'javascript:void(0)',
        'about:blank', '../undefined', 'http://localhost'
      ];

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (invalidHrefs.includes(href)) {
          this.issues.push({
            severity: 'HIGH',
            type: 'Invalid Link',
            href: href,
            text: link.textContent,
            fix: `Set valid href: href="${link.pathname || 'games.html'}"`
          });
        }
      });
    }

    /* ── VALIDATION 4: IMAGES & ICONS ── */
    validateImages() {
      const images = document.querySelectorAll('img[src]');

      images.forEach(img => {
        const src = img.getAttribute('src');
        // Emoji and data URIs are valid
        if (src.startsWith('data:') || /[\u{1F300}-\u{1F9FF}]/u.test(src)) {
          return;
        }

        // Check for invalid paths
        if (!src || src.includes('undefined') || src.includes('null')) {
          this.warnings.push({
            severity: 'MEDIUM',
            type: 'Broken Image',
            src: src,
            alt: img.getAttribute('alt') || '(no alt text)'
          });
        }
      });
    }

    /* ── VALIDATION 5: FUNCTION AVAILABILITY ── */
    validateFunctionAvailability() {
      const requiredGlobals = [
        'Auth', 'Games', 'Friends', 'EyloxCurrencies', 'EyloxNotify',
        'eyloxLogout', 'openWallet', 'showAchievement', 'playGame',
        'playSFX', 'updateLeaderboard', 'syncMultiplayer'
      ];

      const missing = requiredGlobals.filter(f => !window[f]);
      if (missing.length > 0) {
        this.warnings.push({
          severity: 'MEDIUM',
          type: 'Missing Global Functions',
          functions: missing,
          count: missing.length
        });
      }
    }

    /* ── VALIDATION 6: LOCALSTORAGE ── */
    validateLocalStorage() {
      const requiredKeys = [
        'eylox_user', 'eylox_token', 'theme', 'settings',
        'recently_played', 'achievements'
      ];

      try {
        const keys = Object.keys(localStorage);
        const valid = keys.filter(k => k.startsWith('eylox_')).length;

        if (valid === 0 && !localStorage.getItem('eylox_guest')) {
          this.warnings.push({
            severity: 'LOW',
            type: 'No User Data',
            recommendation: 'User appears to be new or in guest mode'
          });
        }
      } catch (err) {
        this.issues.push({
          severity: 'HIGH',
          type: 'localStorage Access Error',
          error: err.message,
          fix: 'localStorage may be disabled. Check browser settings.'
        });
      }
    }

    /* ── VALIDATION 7: API ENDPOINTS ── */
    validateAPIEndpoints() {
      // Check for hardcoded API URLs
      const scripts = Array.from(document.querySelectorAll('script'))
        .map(s => s.textContent)
        .join('\n');

      if (scripts.includes('http://localhost:3001') || scripts.includes('undefined/api')) {
        this.warnings.push({
          severity: 'MEDIUM',
          type: 'Hardcoded API URL',
          recommendation: 'Use environment variables for API endpoints'
        });
      }
    }

    /* ── VALIDATION 8: RESPONSIVENESS ── */
    validateResponsiveness() {
      const meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        this.issues.push({
          severity: 'HIGH',
          type: 'Missing Viewport Meta',
          fix: 'Add: <meta name="viewport" content="width=device-width, initial-scale=1">'
        });
      }

      // Check for mobile-specific issues
      if (window.innerWidth < 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.classList.contains('mobile-optimized')) {
          this.warnings.push({
            severity: 'MEDIUM',
            type: 'Mobile Layout Issue',
            recommendation: 'Add mobile-optimized CSS and test on small screens'
          });
        }
      }
    }

    /* ── VALIDATION 9: ACCESSIBILITY ── */
    validateAccessibility() {
      const buttons = document.querySelectorAll('button:not([aria-label])');
      if (buttons.length > 5) {
        this.warnings.push({
          severity: 'LOW',
          type: 'Accessibility Gap',
          issues: `${buttons.length} buttons missing aria-labels`,
          recommendation: 'Add aria-labels to all interactive elements'
        });
      }

      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 3) {
        this.warnings.push({
          severity: 'LOW',
          type: 'Missing Alt Text',
          images: images.length,
          recommendation: 'Add alt text to all images'
        });
      }
    }

    /* ── VALIDATION 10: ANIMATIONS ── */
    validateAnimations() {
      // Check for animation performance issues
      const animatedElements = document.querySelectorAll('[style*="animation"]');
      if (animatedElements.length > 50) {
        this.warnings.push({
          severity: 'MEDIUM',
          type: 'Too Many Animations',
          count: animatedElements.length,
          recommendation: 'Reduce concurrent animations for better performance'
        });
      }
    }

    /* ── VALIDATION 11: FORMS ── */
    validateForms() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
          if (!input.getAttribute('type')) {
            this.warnings.push({
              severity: 'LOW',
              type: 'Missing Input Type',
              recommendation: 'Add type attribute to all input elements'
            });
          }
        });
      });
    }

    /* ── VALIDATION 12: DATA SYNC ── */
    validateDataSync() {
      try {
        const user = JSON.parse(localStorage.getItem('eylox_user') || '{}');

        // Validate user object structure
        if (user.coins !== undefined && typeof user.coins !== 'number') {
          this.issues.push({
            severity: 'HIGH',
            type: 'Invalid Currency Data Type',
            fix: 'Ensure coins is always a number, not string'
          });
        }

        // Check for suspicious data
        if (user.coins > 1e9 || user.coins < 0) {
          this.issues.push({
            severity: 'CRITICAL',
            type: 'Currency Out of Range',
            value: user.coins,
            fix: 'Reset invalid currency value'
          });
        }
      } catch (err) {
        this.warnings.push({
          severity: 'MEDIUM',
          type: 'localStorage Data Corruption',
          error: err.message
        });
      }
    }

    /* ── GENERATE REPORT ── */
    generateReport() {
      const report = {
        timestamp: this.timestamp,
        page: window.location.pathname,
        criticalIssues: this.issues.filter(i => i.severity === 'CRITICAL'),
        highPriorityIssues: this.issues.filter(i => i.severity === 'HIGH'),
        warnings: this.warnings,
        recommendations: this.recommendations,
        summary: {
          totalCritical: this.issues.filter(i => i.severity === 'CRITICAL').length,
          totalHigh: this.issues.filter(i => i.severity === 'HIGH').length,
          totalWarnings: this.warnings.length,
          autoFixesApplied: this.autoFixes
        }
      };

      console.log('📊 AUDIT REPORT:', report);
      return report;
    }

    /* ── AUTO-FIX SIMPLE ISSUES ── */
    autoFixSimpleIssues() {
      // Fix missing viewport meta
      if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1';
        document.head.appendChild(meta);
        this.autoFixes++;
      }

      // Fix invalid onclick handlers by adding safe defaults
      document.querySelectorAll('[onclick]').forEach(el => {
        const onclick = el.getAttribute('onclick');
        const match = onclick.match(/^(\w+)\s*\(/);
        if (match && typeof window[match[1]] !== 'function') {
          el.onclick = function(e) {
            console.warn(`Function not defined: ${match[1]}`);
            e.preventDefault();
          };
          this.autoFixes++;
        }
      });

      console.log(`✅ Applied ${this.autoFixes} auto-fixes`);
    }

    /* ── EXPORT FOR TESTING ── */
    saveReport(filename = 'audit-report.json') {
      const report = this.generateReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      return report;
    }
  }

  // Initialize on page load
  window.EyloxAuditorV2 = new ComprehensiveAuditor();

  // Run audit when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.EyloxAuditorV2.runFullAudit();
      window.EyloxAuditorV2.autoFixSimpleIssues();
    });
  } else {
    window.EyloxAuditorV2.runFullAudit();
    window.EyloxAuditorV2.autoFixSimpleIssues();
  }

  // Expose for testing
  window.runAudit = () => window.EyloxAuditorV2.runFullAudit();
  window.getAuditReport = () => window.EyloxAuditorV2.generateReport();

})();
