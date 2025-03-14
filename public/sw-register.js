// Service Worker Registration Script
// This script can be included directly in the HTML to register the service worker

(function() {
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      // First try with explicit scope
      navigator.serviceWorker.register('/api/sw', { scope: '/' })
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(err) {
          // If there's a scope error, try with default scope
          if (err.name === 'SecurityError' && err.message.includes('scope')) {
            console.warn('ServiceWorker scope error, trying with default scope');
            return navigator.serviceWorker.register('/api/sw')
              .then(function(registration) {
                console.log('ServiceWorker registration successful with default scope: ', registration.scope);
              })
              .catch(function(err) {
                console.error('ServiceWorker registration failed with default scope: ', err);
              });
          } else {
            console.error('ServiceWorker registration failed: ', err);
          }
        });
    });
  } else {
    console.log('Service workers are not supported');
  }
})(); 