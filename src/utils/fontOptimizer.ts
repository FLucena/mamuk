/**
 * Font optimization utilities
 * Helps with tracking and optimizing font loading performance
 */

interface FontPreloadOptions {
  path: string;
  as: string;
  type: string;
  crossOrigin?: string;
}

// Track when fonts are loaded
export function trackFontPerformance() {
  if (typeof window === 'undefined') return;
  
  // Use the Font Loading API if available
  if ('fonts' in document) {
    if (window.trackPerformance) {
      window.trackPerformance.startMark('fonts-loading');
    }
    
    document.fonts.ready.then(() => {
      if (window.trackPerformance) {
        const duration = window.trackPerformance.endMark('fonts-loading');
        console.info(`[PERFORMANCE] Fonts loaded in ${duration.toFixed(2)}ms`);
      } else {
        console.info('[PERFORMANCE] Fonts loaded');
      }
    });
  }
  
  // Track individual font face loading
  if ('FontFace' in window) {
    const originalFontFace = window.FontFace;
    
    // @ts-ignore - Extending FontFace for monitoring
    window.FontFace = function(family: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors) {
      const fontFace = new originalFontFace(family, source, descriptors);
      const originalLoad = fontFace.load;
      
      fontFace.load = function() {
        const startTime = performance.now();
        console.info(`[PERFORMANCE] Loading font: ${family}`);
        
        return originalLoad.call(this).then((loadedFace: FontFace) => {
          const loadTime = performance.now() - startTime;
          console.info(`[PERFORMANCE] Font loaded: ${family} - ${loadTime.toFixed(2)}ms`);
          return loadedFace;
        });
      };
      
      return fontFace;
    };
  }
}

// Font display strategies
export const fontDisplayOptions = {
  // Gives the font face a short block period and an infinite swap period
  swap: 'font-display: swap;',
  
  // Gives the font face an extremely small block period and a short swap period
  fallback: 'font-display: fallback;',
  
  // Gives the font face an extremely small block period and no swap period
  optional: 'font-display: optional;',
  
  // Gives the font face a longer block period to ensure it's used
  block: 'font-display: block;',
  
  // Default browser behavior
  auto: 'font-display: auto;',
};

// Preload critical fonts
export function preloadCriticalFonts(fontUrls: (string | FontPreloadOptions)[]) {
  if (typeof document === 'undefined') return;
  
  fontUrls.forEach(font => {
    try {
      const url = typeof font === 'string' ? font : font.path;
      
      // Check if the font file exists before preloading
      fetch(url, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'preload';
            linkElement.href = url;
            
            if (typeof font === 'string') {
              // Default values for string format
              linkElement.as = 'font';
              linkElement.type = 'font/woff2';
              linkElement.crossOrigin = 'anonymous';
            } else {
              // Use values from object format
              linkElement.as = font.as;
              linkElement.type = font.type;
              if (font.crossOrigin) {
                linkElement.crossOrigin = font.crossOrigin;
              }
            }
            
            document.head.appendChild(linkElement);
          } else {
            console.warn(`[PERFORMANCE] Font file not found: ${url}`);
          }
        })
        .catch(error => {
          console.warn(`[PERFORMANCE] Error checking font file: ${url}`, error);
        });
    } catch (error) {
      const url = typeof font === 'string' ? font : font.path;
      console.warn(`[PERFORMANCE] Error preloading font: ${url}`, error);
    }
  });
}

// Initialize font optimization
export function initFontOptimization(criticalFonts?: (string | FontPreloadOptions)[]) {
  // Track font performance
  trackFontPerformance();
  
  // Preload critical fonts if provided
  if (criticalFonts && criticalFonts.length > 0) {
    preloadCriticalFonts(criticalFonts);
  }
  
  // Add font-display CSS to prioritize text visibility
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        ${fontDisplayOptions.swap}
      }
    `;
    document.head.appendChild(style);
  }
} 