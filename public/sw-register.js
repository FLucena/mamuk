// Service Worker Registration Script
// This script can be included directly in the HTML to register the service worker

(function() {
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/api/sw')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    console.log('Service workers are not supported');
  }
})(); 