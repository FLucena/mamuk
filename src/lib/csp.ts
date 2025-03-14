/**
 * Content Security Policy (CSP) utilities
 */
import React from 'react';

/**
 * Get the CSP nonce from the response headers
 * This is set by the middleware and can be used to allow inline scripts
 */
export function getNonce(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Try to get the nonce from the meta tag
  const metaNonce = document.querySelector('meta[name="csp-nonce"]');
  if (metaNonce && metaNonce.getAttribute('content')) {
    return metaNonce.getAttribute('content') || '';
  }
  
  // Fallback to script nonce if available
  const scripts = document.querySelectorAll('script[nonce]');
  if (scripts.length > 0) {
    return scripts[0].getAttribute('nonce') || '';
  }
  
  return '';
}

/**
 * Apply the nonce to an inline script
 * @param script The script content
 * @returns The script with nonce attribute
 */
export function applyNonce(script: string): string {
  const nonce = getNonce();
  if (!nonce) {
    return script;
  }
  
  return `<script nonce="${nonce}">${script}</script>`;
}

/**
 * Create a script tag with the nonce
 * @param content The script content
 * @returns A script element with the nonce attribute
 */
export function createScriptWithNonce(content: string): HTMLScriptElement {
  const script = document.createElement('script');
  const nonce = getNonce();
  
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }
  
  script.textContent = content;
  return script;
}

/**
 * Execute a script with the proper nonce
 * @param content The script content to execute
 */
export function executeScriptWithNonce(content: string): void {
  const script = createScriptWithNonce(content);
  document.head.appendChild(script);
  document.head.removeChild(script); // Clean up after execution
}

/**
 * Add a meta tag with the CSP nonce
 * This should be called in the document head to make the nonce available to client-side code
 */
export function NonceMetaTag(): React.ReactElement | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Get nonce from script tags
  const scripts = document.querySelectorAll('script[nonce]');
  if (scripts.length === 0) {
    return null;
  }
  
  const nonce = scripts[0].getAttribute('nonce');
  if (!nonce) {
    return null;
  }
  
  return React.createElement('meta', {
    name: 'csp-nonce',
    content: nonce
  });
} 