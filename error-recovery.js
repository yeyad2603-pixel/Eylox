/* ============================================================
   EYLOX — Frontend Error Recovery System
   Eylox WEB html/error-recovery.js
   ============================================================ */
'use strict';

(function EyloxErrorRecovery() {

  class ErrorRecovery {
    constructor() {
      this.recoveryStrategies = {};
      this.setupGlobalErrorHandlers();
    }

    setupGlobalErrorHandlers() {
      // Catch unhandled errors
      window.addEventListener('error', (event) => {
        console.error('🔴 Uncaught Error:', event.error);
        this.showErrorNotification(event.error.message);
      });

      // Catch promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('🔴 Unhandled Promise Rejection:', event.reason);
        this.showErrorNotification(event.reason?.message || 'An error occurred');
      });
    }

    // Show user-friendly error notification
    showErrorNotification(message, type = 'error', duration = 5000) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        background: ${type === 'error' ? '#dc2626' : '#ea580c'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,.3);
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = `⚠️ ${message}`;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    // Wrap functions with error recovery
    wrapFunction(fn, fallback) {
      return async function(...args) {
        try {
          return await fn(...args);
        } catch (err) {
          console.error(`Error in ${fn.name}:`, err);
          if (fallback) {
            return fallback(...args);
          }
          throw err;
        }
      };
    }

    // Retry logic with exponential backoff
    async retryAsync(fn, maxAttempts = 3, delayMs = 1000) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (err) {
          if (attempt === maxAttempts) throw err;
          const delay = delayMs * Math.pow(2, attempt - 1);
          console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Safe DOM update
    safeDOMUpdate(selector, updateFn) {
      try {
        const element = document.querySelector(selector);
        if (!element) {
          console.warn(`Element not found: ${selector}`);
          return false;
        }
        updateFn(element);
        return true;
      } catch (err) {
        console.error(`Failed to update ${selector}:`, err);
        return false;
      }
    }

    // Safe localStorage access
    safeLocalStorage(operation, key, value = null) {
      try {
        if (operation === 'get') {
          return JSON.parse(localStorage.getItem(key) || 'null');
        } else if (operation === 'set') {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } else if (operation === 'remove') {
          localStorage.removeItem(key);
          return true;
        }
      } catch (err) {
        console.error(`localStorage ${operation} failed:`, err);
        return null;
      }
    }

    // Validate API response
    validateAPIResponse(response, requiredFields = []) {
      if (!response) return false;
      return requiredFields.every(field => field in response);
    }

    // Safe API call with timeout
    async safeAPICall(url, options = {}, timeoutMs = 30000) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        console.error(`API call failed: ${url}`, err);
        this.showErrorNotification('Network error. Please try again.');
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  // CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Export globally
  window.EyloxErrorRecovery = new ErrorRecovery();

})();
