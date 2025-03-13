/**
 * Script loader utility
 * Helps with optimizing and tracking third-party script loading
 */

interface ScriptOptions {
  async?: boolean;
  defer?: boolean;
  id?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  preconnect?: boolean;
  attributes?: Record<string, string>;
}

// Extend Window interface to include our custom trackPerformance property
declare global {
  interface Window {
    trackPerformance?: {
      startMark: (name: string) => number;
      endMark: (name: string) => number;
    };
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (handle: number) => void;
  }
}

/**
 * Load a script with performance tracking
 */
export function loadScript(src: string, options: ScriptOptions = {}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  
  const {
    async = true,
    defer = true,
    id = '',
    onLoad,
    onError,
    strategy = 'afterInteractive',
    preconnect = true,
    attributes = {},
  } = options;
  
  // Check if script already exists
  const existingScript = id ? document.getElementById(id) : null;
  if (existingScript) return existingScript;
  
  // Extract domain for preconnect
  let domain = '';
  try {
    domain = new URL(src).origin;
  } catch (e) {
    console.error(`Invalid URL: ${src}`);
  }
  
  // Add preconnect for external domains
  if (preconnect && domain && domain !== window.location.origin) {
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = domain;
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);
    
    // Also add DNS prefetch as fallback
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = domain;
    document.head.appendChild(dnsPrefetch);
  }
  
  // Create script element
  const script = document.createElement('script');
  script.src = src;
  script.async = async;
  script.defer = defer;
  if (id) script.id = id;
  
  // Add custom attributes
  Object.entries(attributes).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  
  // Start performance tracking
  const scriptId = id || src.split('/').pop() || 'script';
  const startTime = performance.now();
  
  if (window.trackPerformance) {
    window.trackPerformance.startMark(`script-${scriptId}`);
  }
  
  // Add load and error handlers
  script.onload = () => {
    const loadTime = performance.now() - startTime;
    console.info(`[PERFORMANCE] Script loaded: ${scriptId} - ${loadTime.toFixed(2)}ms`);
    
    if (window.trackPerformance) {
      window.trackPerformance.endMark(`script-${scriptId}`);
    }
    
    if (onLoad) onLoad();
  };
  
  script.onerror = (event) => {
    console.error(`[ERROR] Failed to load script: ${src}`);
    if (onError) onError(new Error(`Failed to load script: ${src}`));
  };
  
  // Add script based on strategy
  if (strategy === 'beforeInteractive') {
    document.head.appendChild(script);
  } else if (strategy === 'afterInteractive') {
    document.body.appendChild(script);
  } else if (strategy === 'lazyOnload') {
    // Load script when browser is idle or after page load
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        document.body.appendChild(script);
      }, { timeout: 2000 });
    } else {
      // Use load event as fallback
      const loadHandler = () => {
        setTimeout(() => {
          document.body.appendChild(script);
        }, 200);
      };
      
      if (document.readyState === 'complete') {
        loadHandler();
      } else {
        // Explicitly cast window to Window type to fix TypeScript error
        (window as Window).addEventListener('load', loadHandler);
      }
    }
  }
  
  return script;
}

/**
 * Preload a script without executing it
 */
export function preloadScript(src: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Load multiple scripts in order
 */
export function loadScriptsSequentially(scripts: Array<{ src: string, options?: ScriptOptions }>) {
  if (typeof document === 'undefined') return;
  
  return scripts.reduce((promise, { src, options }) => {
    return promise.then(() => {
      return new Promise<void>((resolve, reject) => {
        loadScript(src, {
          ...options,
          onLoad: () => {
            if (options?.onLoad) options.onLoad();
            resolve();
          },
          onError: (error) => {
            if (options?.onError) options.onError(error);
            reject(error);
          }
        });
      });
    });
  }, Promise.resolve());
} 