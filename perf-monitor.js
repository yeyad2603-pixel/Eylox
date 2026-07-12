/* ============================================================
   EYLOX — Performance Monitor & Optimizer
   Eylox WEB html/perf-monitor.js
   ============================================================ */
'use strict';

(function EyloxPerfMonitor() {

  class PerformanceMonitor {
    constructor() {
      this.metrics = {};
      this.thresholds = {
        pageLoadMs: 3000,
        fpMs: 1000,
        lcpMs: 2500,
        memoryMB: 100,
        fpsMinimum: 30,
      };
      this.startTime = performance.now();
    }

    // Measure page load time
    measurePageLoad() {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        this.metrics.pageLoadTime = loadTime;

        console.log(`⏱️ Page Load Time: ${loadTime}ms`);
        if (loadTime > this.thresholds.pageLoadMs) {
          console.warn(`⚠️ Page load slow (${loadTime}ms > ${this.thresholds.pageLoadMs}ms)`);
        }
        return loadTime;
      }
    }

    // Measure FCP (First Contentful Paint)
    measureFCP() {
      if (window.performance && window.performance.getEntriesByType) {
        const fcpEntries = window.performance.getEntriesByType('paint');
        const fcp = fcpEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          this.metrics.fcp = fcp.startTime;
          console.log(`🎨 First Contentful Paint: ${fcp.startTime.toFixed(0)}ms`);
        }
      }
    }

    // Measure LCP (Largest Contentful Paint)
    measureLCP() {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            console.log(`📦 Largest Contentful Paint: ${this.metrics.lcp.toFixed(0)}ms`);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP not available');
        }
      }
    }

    // Measure Memory Usage
    measureMemory() {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize / 1048576;
        const limit = performance.memory.jsHeapSizeLimit / 1048576;
        this.metrics.memoryUsed = used;
        this.metrics.memoryLimit = limit;

        console.log(`💾 Memory: ${used.toFixed(1)}MB / ${limit.toFixed(1)}MB`);
        if (used > this.thresholds.memoryMB) {
          console.warn(`⚠️ High memory usage: ${used.toFixed(1)}MB`);
        }
      }
    }

    // Measure FPS using requestAnimationFrame
    measureFPS() {
      let frameCount = 0;
      let lastTime = performance.now();

      const countFrame = () => {
        frameCount++;
        const now = performance.now();

        if (now - lastTime >= 1000) {
          this.metrics.fps = frameCount;
          console.log(`🎮 FPS: ${frameCount}`);

          if (frameCount < this.thresholds.fpsMinimum) {
            console.warn(`⚠️ Low FPS: ${frameCount} < ${this.thresholds.fpsMinimum}`);
          }

          frameCount = 0;
          lastTime = now;
        }

        requestAnimationFrame(countFrame);
      };

      requestAnimationFrame(countFrame);
    }

    // Count and report DOM nodes
    countDOMNodes() {
      const nodeCount = document.getElementsByTagName('*').length;
      this.metrics.domNodes = nodeCount;
      console.log(`📊 DOM Nodes: ${nodeCount}`);

      if (nodeCount > 1000) {
        console.warn(`⚠️ High DOM node count: ${nodeCount}`);
      }
    }

    // Detect memory leaks (growing memory without decrease)
    detectMemoryLeaks() {
      const readings = [];

      setInterval(() => {
        if (!performance.memory) return;

        const used = performance.memory.usedJSHeapSize;
        readings.push(used);

        if (readings.length > 30) {
          readings.shift();

          // Check if memory consistently increases
          let increasing = 0;
          for (let i = 1; i < readings.length; i++) {
            if (readings[i] > readings[i - 1]) increasing++;
          }

          if (increasing > 25) {
            console.warn('⚠️ Potential memory leak detected: memory continuously increasing');
          }
        }
      }, 5000);
    }

    // Check for slow network requests
    reportNetworkMetrics() {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const duration = entry.duration;
              if (duration > 1000) {
                console.warn(`⚠️ Slow request (${duration.toFixed(0)}ms): ${entry.name}`);
              }
            }
          });
          observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
          console.log('Network metrics not available');
        }
      }
    }

    // Generate performance report
    generateReport() {
      return {
        timestamp: new Date().toISOString(),
        metrics: this.metrics,
        issues: this.detectIssues(),
        recommendations: this.getRecommendations(),
      };
    }

    detectIssues() {
      const issues = [];

      if (this.metrics.pageLoadTime > this.thresholds.pageLoadMs) {
        issues.push(`Slow page load: ${this.metrics.pageLoadTime}ms`);
      }
      if (this.metrics.lcp > this.thresholds.lcpMs) {
        issues.push(`Slow LCP: ${this.metrics.lcp.toFixed(0)}ms`);
      }
      if (this.metrics.memoryUsed > this.thresholds.memoryMB) {
        issues.push(`High memory: ${this.metrics.memoryUsed.toFixed(1)}MB`);
      }
      if (this.metrics.fps < this.thresholds.fpsMinimum) {
        issues.push(`Low FPS: ${this.metrics.fps}`);
      }

      return issues;
    }

    getRecommendations() {
      const recs = [];

      if (this.metrics.pageLoadTime > this.thresholds.pageLoadMs) {
        recs.push('Consider code splitting or lazy loading');
      }
      if (this.metrics.domNodes > 1000) {
        recs.push('Reduce DOM complexity or use virtual scrolling');
      }
      if (this.metrics.memoryUsed > this.thresholds.memoryMB) {
        recs.push('Check for memory leaks or large data structures');
      }
      if (this.metrics.fps < this.thresholds.fpsMinimum) {
        recs.push('Optimize animations or reduce render work');
      }

      return recs;
    }

    // Run full diagnostics
    runDiagnostics() {
      console.group('📊 EYLOX Performance Diagnostics');

      this.measurePageLoad();
      this.measureFCP();
      this.measureLCP();
      this.measureMemory();
      this.countDOMNodes();
      this.measureFPS();
      this.reportNetworkMetrics();
      this.detectMemoryLeaks();

      console.groupEnd();

      return this.generateReport();
    }
  }

  // Export globally
  window.EyloxPerfMonitor = new PerformanceMonitor();

  // Run diagnostics on load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.EyloxPerfMonitor.runDiagnostics(), 1000);
  });

})();
