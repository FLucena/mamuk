/**
 * Debug Authentication Script
 * 
 * This script helps debug authentication issues by checking session cookies
 * and local storage for authentication-related data.
 * 
 * Usage:
 * 1. Open your browser's developer console
 * 2. Copy and paste this entire script
 * 3. Press Enter to execute
 * 4. Review the output in the console
 */

(function debugAuth() {
  console.group('🔐 Authentication Debug Information');
  
  // Check for Next-Auth session cookie
  console.group('Session Cookies');
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const nextAuthCookie = cookies.find(cookie => cookie.startsWith('next-auth.session-token='));
  const nextAuthCallbackUrl = cookies.find(cookie => cookie.startsWith('next-auth.callback-url='));
  
  if (nextAuthCookie) {
    console.log('✅ Next-Auth session cookie found:', nextAuthCookie);
  } else {
    console.warn('❌ Next-Auth session cookie not found');
  }
  
  if (nextAuthCallbackUrl) {
    console.log('ℹ️ Next-Auth callback URL:', decodeURIComponent(nextAuthCallbackUrl.split('=')[1]));
  }
  
  console.log('All cookies:', cookies);
  console.groupEnd();
  
  // Check local storage for any auth-related items
  console.group('Local Storage');
  const authItems = {};
  let hasAuthItems = false;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('session') || key.includes('token'))) {
      authItems[key] = localStorage.getItem(key);
      hasAuthItems = true;
    }
  }
  
  if (hasAuthItems) {
    console.log('✅ Auth-related items found in localStorage:', authItems);
  } else {
    console.log('ℹ️ No auth-related items found in localStorage');
  }
  console.groupEnd();
  
  // Check session storage
  console.group('Session Storage');
  const sessionAuthItems = {};
  let hasSessionAuthItems = false;
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('auth') || key.includes('session') || key.includes('token'))) {
      sessionAuthItems[key] = sessionStorage.getItem(key);
      hasSessionAuthItems = true;
    }
  }
  
  if (hasSessionAuthItems) {
    console.log('✅ Auth-related items found in sessionStorage:', sessionAuthItems);
  } else {
    console.log('ℹ️ No auth-related items found in sessionStorage');
  }
  console.groupEnd();
  
  // Check current URL for auth-related parameters
  console.group('URL Parameters');
  const urlParams = new URLSearchParams(window.location.search);
  const authRelatedParams = ['error', 'callbackUrl', 'redirect', 'session_state'];
  const foundParams = {};
  let hasAuthParams = false;
  
  for (const param of authRelatedParams) {
    if (urlParams.has(param)) {
      foundParams[param] = urlParams.get(param);
      hasAuthParams = true;
    }
  }
  
  if (hasAuthParams) {
    console.log('ℹ️ Auth-related URL parameters:', foundParams);
  } else {
    console.log('ℹ️ No auth-related URL parameters found');
  }
  console.groupEnd();
  
  // Check if we're on an auth-related page
  console.group('Current Page');
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('/auth/') || 
                     currentPath.includes('/signin') || 
                     currentPath.includes('/login') ||
                     currentPath.includes('/unauthorized');
  
  console.log('Current path:', currentPath);
  console.log('Is auth-related page:', isAuthPage);
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    hasSession: !!nextAuthCookie,
    currentPath,
    isAuthPage,
    authParams: foundParams
  };
})(); 