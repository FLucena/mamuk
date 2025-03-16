# Content Security Policy (CSP) Testing Guide

This guide explains how to test your Content Security Policy (CSP) implementation to ensure it's correctly protecting your application against common security vulnerabilities like XSS (Cross-Site Scripting).

## Automated Tests

We have implemented several types of tests to verify CSP compliance:

### 1. Unit Tests (`__tests__/security/csp.test.ts`)

These tests verify that components using inline scripts have the required nonce attribute:

```bash
# Run unit tests for CSP components
npm test -- --testPathPattern=__tests__/security/csp.test.ts
```

### 2. Middleware Tests (`__tests__/security/middleware-csp.test.ts`)

These tests verify that the middleware correctly applies CSP headers:

```bash
# Run middleware CSP tests
npm test -- --testPathPattern=__tests__/security/middleware-csp.test.ts
```

### 3. End-to-End Tests (`__tests__/e2e/csp-violations.test.ts`)

These tests run in a real browser environment to detect actual CSP violations. 

To run these tests, you'll need to set up Playwright or Cypress (the current file contains a placeholder that should be expanded with real tests).

## Manual Testing

For manual testing, we've included a browser script to help identify CSP issues:

### Using the CSP Check Script

1. Start your application in development or production mode:
   ```bash
   npm run dev
   # or
   npm run build && npm start
   ```

2. Open your browser and navigate to your application.

3. Open the browser's developer console (F12 or right-click > Inspect > Console).

4. Copy and paste the contents of `scripts/check-csp.js` into the console.

5. Run the CSP check by calling:
   ```javascript
   runCSPCheck();
   ```

6. The script will:
   - Initialize CSP violation tracking
   - Check for the current nonce value
   - Look for any inline scripts missing nonce attributes
   - Show you the current CSP headers (if available)

7. To test if the CSP is blocking unauthorized inline scripts, you can run:
   ```javascript
   document.body.appendChild(document.createElement('script')).text = 'console.log("This should be blocked by CSP")';
   ```
   This should trigger a CSP violation that will be logged to the console and stored in `window.__cspViolations`.

### Network Tab Inspection

You can also manually inspect the CSP headers in the Network tab:

1. Open Developer Tools (F12)
2. Go to the Network tab
3. Reload the page
4. Click on the document request (usually the first one)
5. Look for `Content-Security-Policy` in the Response Headers section

## Common CSP Issues and Solutions

### 1. Missing Nonce on Inline Scripts

If you see CSP violations related to inline scripts, ensure all `<script>` tags without a `src` attribute have a valid `nonce` attribute:

```html
<!-- Incorrect (will be blocked) -->
<script>
  console.log('This will be blocked');
</script>

<!-- Correct -->
<script nonce="your-nonce-value">
  console.log('This will work');
</script>
```

In React/Next.js, use the nonce in components with `dangerouslySetInnerHTML`:

```jsx
<script 
  nonce={nonce}
  dangerouslySetInnerHTML={{ __html: `console.log('This works');` }} 
/>
```

### 2. Dynamically Created Scripts

For dynamically created scripts, use the utility functions in `src/lib/csp.ts`:

```javascript
import { createScriptWithNonce, executeScriptWithNonce } from '@/lib/csp';

// To create a script element with nonce
const script = createScriptWithNonce('console.log("Hello")');
document.head.appendChild(script);

// Or to execute code directly
executeScriptWithNonce('console.log("Hello")');
```

### 3. Third-Party Scripts

If you need to allow scripts from third-party domains, update the CSP in the middleware:

```javascript
// In middleware.ts
const baseCSP = {
  // ... existing directives
  'script-src': ["'self'", `'nonce-${nonce}'`, "https://cdn.jsdelivr.net", "https://your-trusted-domain.com"],
};
```

## Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [CSP Scanner](https://cspscanner.com/) 