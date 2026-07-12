/* ============================================================
   EYLOX — Audit & Fix Loader
   Automatically loads error auditor, fixer, and debug dashboard
   on all pages. Runs comprehensive checks and auto-fixes issues.
   ============================================================ */
'use strict';

(function EyloxAuditLoader() {

  // Define script sources
  const AUDIT_SCRIPTS = [
    'error-auditor-v2.js',
    'platform-fixer.js',
    'debug-dashboard.js'
  ];

  class AuditLoader {
    constructor() {
      this.results = {
        loaded: [],
        failed: [],
        totalFixed: 0
      };
    }

    async loadAuditInfrastructure() {
      console.log('📋 Loading EYLOX Audit Infrastructure...');

      for (const script of AUDIT_SCRIPTS) {
        try {
          await this.loadScript(script);
          this.results.loaded.push(script);
          console.log(`✅ Loaded: ${script}`);
        } catch (err) {
          this.results.failed.push(script);
          console.error(`❌ Failed to load ${script}:`, err);
        }
      }

      // Run audits and fixes
      await this.runAudits();
      this.generateAuditReport();
    }

    loadScript(scriptName) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptName;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    async runAudits() {
      console.log('🔍 Running comprehensive audits...');

      // Wait for auditor to load
      let attempts = 0;
      while (!window.EyloxAuditorV2 && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (window.EyloxAuditorV2) {
        window.EyloxAuditorV2.runFullAudit();
      }

      // Wait for fixer to load
      attempts = 0;
      while (!window.EyloxPlatformFixer && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (window.EyloxPlatformFixer) {
        const fixStats = await window.EyloxPlatformFixer.fixAllIssues();
        this.results.totalFixed = fixStats.fixed;
      }
    }

    generateAuditReport() {
      const report = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        loader: {
          scriptsLoaded: this.results.loaded.length,
          scriptsFailed: this.results.failed.length,
          totalFixed: this.results.totalFixed
        },
        auditor: window.EyloxAuditorV2 ? window.EyloxAuditorV2.generateReport() : null,
        debugDashboard: window.EyloxDebugDashboard ? 'Active' : 'Inactive'
      };

      console.log('📊 AUDIT REPORT:', report);
      window.EyloxAuditReport = report;
    }
  }

  // Initialize loader on page load
  const loader = new AuditLoader();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loader.loadAuditInfrastructure();
    });
  } else {
    loader.loadAuditInfrastructure();
  }

  // Expose globally
  window.EyloxAuditLoader = loader;
  window.getAuditReport = () => window.EyloxAuditReport;

})();
