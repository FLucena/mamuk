/**
 * Script to check for CSP violations in the browser
 * Run this script in the browser console to detect violations
 */

// Initialize CSP violation tracking
function initCSPViolationTracking() {
  // Clear previous violations
  window.__cspViolations = [];
  
  // Add event listener for CSP violations
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      effectiveDirective: e.effectiveDirective,
      sample: e.sample
    });
    
    // Store violations in a global variable
    window.__cspViolations = window.__cspViolations || [];
    window.__cspViolations.push({
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      effectiveDirective: e.effectiveDirective,
      sample: e.sample,
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('CSP violation tracking initialized. Violations will be logged to console and stored in window.__cspViolations');
  return 'CSP monitoring active';
}

// Check for inline scripts without nonce
function checkInlineScriptsForNonce() {
  const scripts = document.querySelectorAll('script:not([src])');
  const scriptsWithoutNonce = [];
  
  scripts.forEach((script, index) => {
    if (!script.hasAttribute('nonce')) {
      scriptsWithoutNonce.push({
        index,
        content: script.textContent?.substring(0, 100) + '...',
        element: script
      });
    }
  });
  
  if (scriptsWithoutNonce.length > 0) {
    console.warn('Found inline scripts without nonce:', scriptsWithoutNonce);
  } else {
    console.log('All inline scripts have nonce attributes. Good job!');
  }
  
  return scriptsWithoutNonce;
}

// Check CSP headers
function checkCSPHeaders() {
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const cspContent = cspMeta ? cspMeta.getAttribute('content') : 'None found in meta tags';
  
  console.log('CSP from meta tag:', cspContent);
  console.log('Note: To see CSP from HTTP headers, check the Network tab in DevTools');
  
  return cspContent;
}

// Get the nonce used on the page
function getCurrentNonce() {
  const nonceScripts = document.querySelectorAll('script[nonce]');
  const nonceMeta = document.querySelector('meta[name="csp-nonce"]');
  
  let nonce = '';
  
  if (nonceScripts.length > 0) {
    nonce = nonceScripts[0].getAttribute('nonce') || '';
  } else if (nonceMeta) {
    nonce = nonceMeta.getAttribute('content') || '';
  }
  
  console.log('Current page nonce:', nonce || 'None found');
  return nonce;
}

// Run a full CSP check
function runCSPCheck() {
  console.group('CSP Check Results');
  initCSPViolationTracking();
  console.log('Current Nonce:', getCurrentNonce());
  checkCSPHeaders();
  const nonceIssues = checkInlineScriptsForNonce();
  
  console.log(`
CSP Check Complete:
- Violation tracking: Active (violations stored in window.__cspViolations)
- Inline scripts without nonce: ${nonceIssues.length}

To test for CSP violations, you can try running:
document.body.appendChild(document.createElement('script')).text = 'console.log("This should be blocked by CSP")';
  `);
  console.groupEnd();
}

// Export functions for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initCSPViolationTracking,
    checkInlineScriptsForNonce,
    checkCSPHeaders,
    getCurrentNonce,
    runCSPCheck
  };
}

// Auto-run if in browser context
if (typeof window !== 'undefined') {
  console.log('CSP Check Tools loaded. Run runCSPCheck() to check CSP compliance.');
} 