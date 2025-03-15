// Service Worker Registration Script
// This script can be included directly in the HTML to register the service worker

if ('serviceWorker' in navigator && 'caches' in window) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(error) {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
} else {
  console.log('Service workers are not supported');
} 