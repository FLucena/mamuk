'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationPatcher implementa soluciones para problemas comunes de navegación
 * - Previene el error de "Throttling navigation" limitando la frecuencia de navegaciones
 */
export default function NavigationPatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Parche para prevenir el error de "Throttling navigation"
    const originalReplaceState = window.history.replaceState;
    const originalPushState = window.history.pushState;
    
    // Variables para el throttling
    let lastReplaceTime = 0;
    let lastPushTime = 0;
    const throttleTime = 300; // ms entre operaciones
    let pendingReplaceState: any = null;
    let pendingPushState: any = null;
    
    // Función para aplicar throttling a replaceState
    window.history.replaceState = function(...args) {
      const now = Date.now();
      
      // Cancelar cualquier operación pendiente
      if (pendingReplaceState) {
        clearTimeout(pendingReplaceState);
        pendingReplaceState = null;
      }
      
      // Si ha pasado suficiente tiempo, ejecutar inmediatamente
      if (now - lastReplaceTime > throttleTime) {
        lastReplaceTime = now;
        return originalReplaceState.apply(this, args);
      }
      
      // Si no, programar para más tarde
      pendingReplaceState = setTimeout(() => {
        lastReplaceTime = Date.now();
        originalReplaceState.apply(window.history, args);
        pendingReplaceState = null;
      }, throttleTime);
      
      return undefined;
    };
    
    // Función para aplicar throttling a pushState
    window.history.pushState = function(...args) {
      const now = Date.now();
      
      // Cancelar cualquier operación pendiente
      if (pendingPushState) {
        clearTimeout(pendingPushState);
        pendingPushState = null;
      }
      
      // Si ha pasado suficiente tiempo, ejecutar inmediatamente
      if (now - lastPushTime > throttleTime) {
        lastPushTime = now;
        return originalPushState.apply(this, args);
      }
      
      // Si no, programar para más tarde
      pendingPushState = setTimeout(() => {
        lastPushTime = Date.now();
        originalPushState.apply(window.history, args);
        pendingPushState = null;
      }, throttleTime);
      
      return undefined;
    };
    
    // Limpiar al desmontar
    return () => {
      window.history.replaceState = originalReplaceState;
      window.history.pushState = originalPushState;
      
      if (pendingReplaceState) {
        clearTimeout(pendingReplaceState);
      }
      
      if (pendingPushState) {
        clearTimeout(pendingPushState);
      }
    };
  }, []);

  // Este componente no renderiza nada
  return null;
} 