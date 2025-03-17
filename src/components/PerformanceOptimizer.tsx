'use client';

import { useEffect } from 'react';
import { initFontOptimization } from '@/utils/fontOptimizer';
import { monitorMemoryUsage } from '@/utils/memoryMonitor';

interface FontPreloadOptions {
  path: string;
  as: string;
  type: string;
  crossOrigin?: string;
}

interface PerformanceOptimizerProps {
  criticalFonts?: (string | FontPreloadOptions)[];
  enableMemoryMonitoring?: boolean;
  memoryCheckInterval?: number;
  onOnline?: () => void;
  onOffline?: () => void;
}

// Define extended PerformanceEntry types
interface PerformanceEntryWithProcessingStart extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

// Definir interfaz para PerformanceResourceTiming
interface ResourceEntry extends PerformanceEntry {
  initiatorType: string;
  duration: number;
}

/**
 * PerformanceOptimizer initializes all performance optimizations
 * This component should be included near the top of your app
 */
export default function PerformanceOptimizer({
  criticalFonts,
  enableMemoryMonitoring = true,
  memoryCheckInterval = 30000, // 30 seconds
  onOnline,
  onOffline,
}: PerformanceOptimizerProps) {
  useEffect(() => {
    // Initialize font optimization
    initFontOptimization(criticalFonts);
    
    // Setup online/offline listeners
    const handleOnline = () => {
      console.info('[Network] App is online');
      if (onOnline) onOnline();
    };
    
    const handleOffline = () => {
      console.warn('[Network] App is offline');
      if (onOffline) onOffline();
    };
    
    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    // Retrasar el monitoreo de memoria para reducir la carga inicial
    let cleanupMemoryMonitoring = () => {};
    let memoryMonitorTimer: NodeJS.Timeout | null = null;
    
    if (enableMemoryMonitoring) {
      // Retrasar el monitoreo de memoria
      memoryMonitorTimer = setTimeout(() => {
        cleanupMemoryMonitoring = monitorMemoryUsage(memoryCheckInterval);
      }, 5000); // Retrasar 5 segundos
    }
    
    // Usar requestIdleCallback para el seguimiento de métricas de rendimiento
    const trackPerformanceMetrics = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        
        // Esperar a que la página esté completamente cargada
        if (timing.loadEventEnd === 0) {
          // Si la página aún no está cargada, programar otra verificación
          requestIdleCallback(() => trackPerformanceMetrics());
          return;
        }
        
        const navigationStart = timing.navigationStart;
        const loadTime = timing.loadEventEnd - navigationStart;
        const domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
        const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');
        const firstContentfulPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
        
        console.info('[PERFORMANCE] Navigation metrics:', {
          domComplete: `${(timing.domComplete - navigationStart).toFixed(2)}`,
          domInteractive: `${(timing.domInteractive - navigationStart).toFixed(2)}`,
          loadEventEnd: `${(timing.loadEventEnd - navigationStart).toFixed(2)}`,
          responseEnd: `${(timing.responseEnd - navigationStart).toFixed(2)}`,
          ttfb: timing.responseStart - timing.requestStart,
        });
        
        // Limitar la cantidad de información de registro
        if (process.env.NODE_ENV === 'production') {
          // En producción, solo registrar métricas críticas
          return;
        }
        
        // En desarrollo, registrar métricas detalladas
        console.info('[PERFORMANCE] Page load metrics:', {
          totalLoadTime: `${loadTime}ms`,
          domContentLoaded: `${domContentLoaded}ms`,
          firstPaint: firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : 'N/A',
          firstContentfulPaint: firstContentfulPaint ? `${firstContentfulPaint.startTime.toFixed(2)}ms` : 'N/A',
          ttfb: `${timing.responseStart - timing.requestStart}ms`,
        });
      }
    };
    
    // Usar requestIdleCallback para no bloquear el hilo principal
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => trackPerformanceMetrics());
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      setTimeout(trackPerformanceMetrics, 1000);
    }
    
    // Configurar observadores de Core Web Vitals solo en desarrollo o muestreo en producción
    if ('PerformanceObserver' in window && 
        (process.env.NODE_ENV === 'development' || Math.random() < 0.1)) { // 10% de muestreo en producción
      try {
        // Observador para LCP con desconexión automática
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            console.info(`[PERFORMANCE] Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
          }
          lcpObserver.disconnect();
        });
        
        // Observador para FID con desconexión automática
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            const fidEntry = entry as PerformanceEntryWithProcessingStart;
            console.info(`[PERFORMANCE] First Input Delay: ${fidEntry.processingStart - fidEntry.startTime}ms`);
          });
          fidObserver.disconnect();
        });
        
        // Observador para CLS con límite de tiempo
        let clsValue = 0;
        let clsEntries = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach(entry => {
            const layoutShiftEntry = entry as LayoutShiftEntry;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
              clsEntries++;
            }
          });
          
          // Limitar la cantidad de entradas procesadas
          if (clsEntries > 50) {
            console.info(`[PERFORMANCE] Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
            clsObserver.disconnect();
          }
        });
        
        // Retrasar la observación para reducir la carga inicial
        setTimeout(() => {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          fidObserver.observe({ type: 'first-input', buffered: true });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
          
          // Desconectar el observador CLS después de 30 segundos
          setTimeout(() => {
            if (clsEntries > 0) {
              console.info(`[PERFORMANCE] Final Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
            }
            clsObserver.disconnect();
          }, 30000);
        }, 2000);
      } catch (e) {
        console.error('[PERFORMANCE] Error setting up Core Web Vitals monitoring:', e);
      }
    }
    
    // Monitorear recursos lentos solo en desarrollo o muestreo en producción
    if ('PerformanceObserver' in window && 
        (process.env.NODE_ENV === 'development' || Math.random() < 0.05)) { // 5% de muestreo en producción
      try {
        // Observador para recursos lentos
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            // Solo reportar recursos que tarden más de 500ms
            if (entry.duration > 500) {
              // Usar la interfaz ResourceEntry para acceder a initiatorType
              const resourceEntry = entry as ResourceEntry;
              console.warn('[PERFORMANCE] Slow resource load:', {
                name: entry.name,
                duration: `${entry.duration.toFixed(2)}ms`,
                initiatorType: resourceEntry.initiatorType,
              });
            }
          });
        });
        
        // Retrasar la observación para reducir la carga inicial
        setTimeout(() => {
          resourceObserver.observe({ type: 'resource', buffered: true });
          
          // Desconectar después de 60 segundos para evitar sobrecarga
          setTimeout(() => {
            resourceObserver.disconnect();
          }, 60000);
        }, 4000);
      } catch (e) {
        console.error('[PERFORMANCE] Error setting up resource monitoring:', e);
      }
    }
    
    return () => {
      // Clean up all observers and listeners
      cleanupMemoryMonitoring();
      
      if (memoryMonitorTimer) {
        clearTimeout(memoryMonitorTimer);
      }
      
      // Remove event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [criticalFonts, enableMemoryMonitoring, memoryCheckInterval, onOnline, onOffline]);
  
  // This component doesn't render anything
  return null;
} 