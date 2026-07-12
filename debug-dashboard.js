/* ============================================================
   EYLOX — Debug Dashboard v1.0
   Real-time monitoring, error tracking, performance metrics
   Shows: errors, warnings, FPS, memory, network requests
   ============================================================ */
'use strict';

(function EyloxDebugDashboard() {

  class DebugDashboard {
    constructor() {
      this.errors = [];
      this.warnings = [];
      this.logs = [];
      this.startTime = Date.now();
      this.frameCount = 0;
      this.fps = 0;
      this.memory = {};
      this.networkRequests = [];

      this.initializeMonitoring();
      this.createUI();
    }

    initializeMonitoring() {
      // Monitor errors
      window.addEventListener('error', (e) => {
        this.addError(e.message, 'runtime');
      });

      window.addEventListener('unhandledrejection', (e) => {
        this.addError(e.reason?.message || String(e.reason), 'promise');
      });

      // Monitor console messages
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => {
        originalLog(...args);
        this.logs.push({ type: 'log', message: args.join(' '), time: Date.now() });
      };

      console.warn = (...args) => {
        originalWarn(...args);
        this.addWarning(args.join(' '));
      };

      console.error = (...args) => {
        originalError(...args);
        this.addError(args.join(' '), 'console');
      };

      // Monitor FPS
      this.monitorFPS();

      // Monitor memory
      if (performance.memory) {
        setInterval(() => {
          this.memory = {
            used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
            limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
            percent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1) + '%'
          };
        }, 1000);
      }

      // Monitor network (via fetch interception)
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = Date.now();
        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - start;
          this.networkRequests.push({
            url: args[0],
            method: args[1]?.method || 'GET',
            status: response.status,
            duration: duration + 'ms',
            time: new Date().toLocaleTimeString()
          });
          return response;
        } catch (err) {
          this.addError(`Network error: ${err.message}`);
          throw err;
        }
      };
    }

    monitorFPS() {
      const measureFPS = () => {
        this.frameCount++;
        requestAnimationFrame(measureFPS);
      };

      measureFPS();

      setInterval(() => {
        this.fps = this.frameCount;
        this.frameCount = 0;
      }, 1000);
    }

    addError(message, type = 'general') {
      this.errors.push({
        type,
        message,
        time: new Date().toLocaleTimeString(),
        url: window.location.pathname
      });

      // Keep only last 50 errors
      if (this.errors.length > 50) {
        this.errors.shift();
      }

      this.updateUI();
    }

    addWarning(message) {
      this.warnings.push({
        message,
        time: new Date().toLocaleTimeString()
      });

      if (this.warnings.length > 30) {
        this.warnings.shift();
      }

      this.updateUI();
    }

    createUI() {
      const dashboard = document.createElement('div');
      dashboard.id = 'eylox-debug-dashboard';
      dashboard.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 600px;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #00ff00;
        border-radius: 8px;
        padding: 12px;
        font-family: monospace;
        color: #00ff00;
        font-size: 12px;
        z-index: 999999;
        overflow-y: auto;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
      `;

      dashboard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #00ff00; padding-bottom: 10px;">
          <div style="font-weight: bold;">🔧 EYLOX DEBUG</div>
          <button id="debug-toggle" style="background: #00ff00; color: black; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">−</button>
        </div>

        <div id="debug-content" style="display: block;">
          <div style="margin-bottom: 8px;">
            <strong>📊 METRICS</strong>
            <div style="margin-left: 8px; margin-top: 4px;">
              <div>FPS: <span id="debug-fps" style="color: #ffff00;">0</span></div>
              <div>Memory: <span id="debug-memory" style="color: #ffff00;">—</span></div>
              <div>Uptime: <span id="debug-uptime" style="color: #ffff00;">0s</span></div>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <strong>🔴 ERRORS (<span id="error-count">0</span>)</strong>
            <div id="debug-errors" style="margin-left: 8px; max-height: 150px; overflow-y: auto; border: 1px solid #ff0000; border-radius: 4px; padding: 4px;">
              <div style="color: #aaa;">No errors yet</div>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <strong>⚠️ WARNINGS (<span id="warning-count">0</span>)</strong>
            <div id="debug-warnings" style="margin-left: 8px; max-height: 100px; overflow-y: auto; border: 1px solid #ffff00; border-radius: 4px; padding: 4px;">
              <div style="color: #aaa;">No warnings</div>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <strong>🌐 NETWORK (<span id="network-count">0</span>)</strong>
            <div id="debug-network" style="margin-left: 8px; max-height: 100px; overflow-y: auto; border: 1px solid #0088ff; border-radius: 4px; padding: 4px;">
              <div style="color: #aaa;">No requests</div>
            </div>
          </div>

          <div style="margin-top: 10px; display: flex; gap: 4px;">
            <button id="debug-clear" style="flex: 1; background: #ff0000; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">Clear</button>
            <button id="debug-export" style="flex: 1; background: #0088ff; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">Export</button>
          </div>
        </div>
      `;

      document.body.appendChild(dashboard);
      this.dashboard = dashboard;

      // Event listeners
      document.getElementById('debug-toggle').addEventListener('click', () => {
        const content = document.getElementById('debug-content');
        const btn = document.getElementById('debug-toggle');
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
        btn.textContent = content.style.display === 'block' ? '−' : '+';
      });

      document.getElementById('debug-clear').addEventListener('click', () => {
        this.errors = [];
        this.warnings = [];
        this.networkRequests = [];
        this.updateUI();
      });

      document.getElementById('debug-export').addEventListener('click', () => {
        this.exportReport();
      });

      // Update uptime
      setInterval(() => {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const el = document.getElementById('debug-uptime');
        if (el) el.textContent = uptime + 's';
      }, 1000);

      // Update metrics
      setInterval(() => {
        const fpsEl = document.getElementById('debug-fps');
        if (fpsEl) fpsEl.textContent = this.fps;

        const memEl = document.getElementById('debug-memory');
        if (memEl) memEl.textContent = this.memory.used || '—';
      }, 1000);
    }

    updateUI() {
      // Update error list
      const errorsList = document.getElementById('debug-errors');
      if (errorsList) {
        errorsList.innerHTML = this.errors.length === 0
          ? '<div style="color: #aaa;">No errors yet</div>'
          : this.errors.slice(-5).map(e => `
            <div style="border-bottom: 1px solid #ff0000; padding: 4px 0;">
              <span style="color: #ff9999;">[${e.type}]</span> ${e.message.substring(0, 40)}...
              <br/><span style="color: #888;">${e.time}</span>
            </div>
          `).join('');
      }

      document.getElementById('error-count').textContent = this.errors.length;

      // Update warnings list
      const warningsList = document.getElementById('debug-warnings');
      if (warningsList) {
        warningsList.innerHTML = this.warnings.length === 0
          ? '<div style="color: #aaa;">No warnings</div>'
          : this.warnings.slice(-3).map(w => `
            <div style="border-bottom: 1px solid #ffff00; padding: 4px 0;">
              ${w.message.substring(0, 50)}...
              <br/><span style="color: #888;">${w.time}</span>
            </div>
          `).join('');
      }

      document.getElementById('warning-count').textContent = this.warnings.length;

      // Update network list
      const networkList = document.getElementById('debug-network');
      if (networkList) {
        networkList.innerHTML = this.networkRequests.length === 0
          ? '<div style="color: #aaa;">No requests</div>'
          : this.networkRequests.slice(-3).map(r => `
            <div style="border-bottom: 1px solid #0088ff; padding: 4px 0;">
              <span style="color: #0088ff;">${r.method}</span> ${r.status}
              <br/><span style="color: #888;">${r.duration} - ${r.time}</span>
            </div>
          `).join('');
      }

      document.getElementById('network-count').textContent = this.networkRequests.length;
    }

    exportReport() {
      const report = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        errors: this.errors,
        warnings: this.warnings,
        networkRequests: this.networkRequests,
        metrics: {
          fps: this.fps,
          memory: this.memory,
          uptime: Math.floor((Date.now() - this.startTime) / 1000) + 's'
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eylox-debug-${Date.now()}.json`;
      a.click();
    }
  }

  // Initialize dashboard (only in development)
  if (localStorage.getItem('eylox_debug') === 'true') {
    window.EyloxDebugDashboard = new DebugDashboard();
  }

  // Expose for testing
  window.enableDebug = () => {
    localStorage.setItem('eylox_debug', 'true');
    window.location.reload();
  };

  window.disableDebug = () => {
    localStorage.removeItem('eylox_debug');
    window.location.reload();
  };

})();
