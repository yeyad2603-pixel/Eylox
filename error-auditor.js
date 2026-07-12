/* ============================================================
   EYLOX — Frontend Error Auditor & Validator
   Eylox WEB html/error-auditor.js
   ============================================================ */
'use strict';

(function EyloxErrorAuditor() {
  const ERRORS = [];
  const WARNINGS = [];

  class ErrorAuditor {
    constructor() {
      this.errors = [];
      this.warnings = [];
      this.results = {};
    }

    // Validate DOM elements exist
    validateDOMElements() {
      const issues = [];

      // Check critical elements
      const criticalElements = [
        { selector: '.topbar', name: 'Topbar' },
        { selector: '.sidebar', name: 'Sidebar' },
        { selector: 'main', name: 'Main Content Area' },
        { selector: 'header', name: 'Header' },
      ];

      criticalElements.forEach(({ selector, name }) => {
        if (!document.querySelector(selector)) {
          issues.push(`Missing: ${name} (selector: ${selector})`);
        }
      });

      return issues;
    }

    // Validate all onclick handlers reference existing functions
    validateOnClickHandlers() {
      const issues = [];
      const elements = document.querySelectorAll('[onclick]');

      elements.forEach(el => {
        const onclickCode = el.getAttribute('onclick');
        if (!onclickCode) return;

        // Extract function name (e.g., "playGame('xyz')" → "playGame")
        const match = onclickCode.match(/^(\w+)\(/);
        if (!match) return;

        const functionName = match[1];
        if (typeof window[functionName] !== 'function') {
          issues.push(`Broken onclick: ${functionName}() not found on element: ${el.outerHTML.substring(0, 100)}`);
        }
      });

      return issues;
    }

    // Validate all links work
    validateLinks() {
      const issues = [];
      const links = document.querySelectorAll('a[href]');

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '' || href === 'undefined') {
          issues.push(`Invalid link href: "${href}" on element: ${link.textContent}`);
        }
      });

      return issues;
    }

    // Validate image sources
    validateImages() {
      const issues = [];
      const images = document.querySelectorAll('img');

      images.forEach(img => {
        const src = img.getAttribute('src');
        if (!src || src === 'undefined' || src === '') {
          issues.push(`Missing image src: ${img.outerHTML.substring(0, 80)}`);
        }
      });

      return issues;
    }

    // Validate buttons have accessible labels
    validateAccessibility() {
      const issues = [];
      const buttons = document.querySelectorAll('button');

      buttons.forEach(btn => {
        const hasLabel = btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('title');
        if (!hasLabel) {
          issues.push(`Button missing accessibility label: ${btn.outerHTML.substring(0, 80)}`);
        }
      });

      return issues;
    }

    // Check for console errors from page load
    validateConsoleErrors() {
      const issues = [];
      // This would be populated by wrapping console.error
      if (window._consoleErrors && window._consoleErrors.length > 0) {
        issues.push(`Console errors detected: ${window._consoleErrors.length}`);
      }
      return issues;
    }

    // Run full audit
    runAudit() {
      this.results = {
        domElements: this.validateDOMElements(),
        onClickHandlers: this.validateOnClickHandlers(),
        links: this.validateLinks(),
        images: this.validateImages(),
        accessibility: this.validateAccessibility(),
        consoleErrors: this.validateConsoleErrors(),
      };

      this.errors = [
        ...this.results.domElements,
        ...this.results.onClickHandlers,
        ...this.results.links,
        ...this.results.images,
      ];

      this.warnings = [
        ...this.results.accessibility,
        ...this.results.consoleErrors,
      ];

      return this;
    }

    // Generate report
    generateReport() {
      return {
        timestamp: new Date().toISOString(),
        page: window.location.href,
        totalIssues: this.errors.length + this.warnings.length,
        errors: this.errors,
        warnings: this.warnings,
        summary: {
          errorCount: this.errors.length,
          warningCount: this.warnings.length,
          isHealthy: this.errors.length === 0,
        },
      };
    }

    // Log results
    logResults() {
      const report = this.generateReport();
      console.group('🔍 EYLOX Error Audit Report');
      console.log(`Page: ${report.page}`);
      console.log(`Total Issues: ${report.totalIssues}`);

      if (report.errors.length > 0) {
        console.group(`❌ ERRORS (${report.errors.length})`);
        report.errors.forEach(err => console.error(err));
        console.groupEnd();
      }

      if (report.warnings.length > 0) {
        console.group(`⚠️ WARNINGS (${report.warnings.length})`);
        report.warnings.forEach(warn => console.warn(warn));
        console.groupEnd();
      }

      console.log(report.summary.isHealthy ? '✅ Page is healthy!' : '⚠️ Page has issues');
      console.groupEnd();

      return report;
    }
  }

  // Wrap console.error to catch all errors
  window._consoleErrors = [];
  const originalConsoleError = console.error;
  console.error = function(...args) {
    window._consoleErrors.push({
      message: args.join(' '),
      timestamp: new Date().toISOString(),
    });
    originalConsoleError.apply(console, args);
  };

  // Export globally
  window.EyloxErrorAuditor = new ErrorAuditor();

  // Run on load
  document.addEventListener('DOMContentLoaded', () => {
    window.EyloxErrorAuditor.runAudit().logResults();
  });

  // Also run after a delay for dynamic content
  setTimeout(() => {
    window.EyloxErrorAuditor.runAudit().logResults();
  }, 2000);

})();
