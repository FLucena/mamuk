import fs from 'fs';
import path from 'path';

describe('Service Worker Tests', () => {
  let swContent: string;

  beforeAll(() => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    swContent = fs.readFileSync(swPath, 'utf8');
  });

  test('sw.js should exist and have content', () => {
    expect(swContent).toBeTruthy();
    expect(swContent.length).toBeGreaterThan(100);
  });

  test('sw.js should have required event listeners', () => {
    expect(swContent).toContain("addEventListener('install'");
    expect(swContent).toContain("addEventListener('activate'");
    expect(swContent).toContain("addEventListener('fetch'");
  });

  test('sw.js should define cache name and strategies', () => {
    expect(swContent).toContain('CACHE_NAME');
    expect(swContent).toContain('STATIC_ASSETS');
    expect(swContent).toContain('CACHE_STRATEGIES');
  });

  test('sw.js should not have duplicate entries in STATIC_ASSETS', () => {
    // Extraer el array STATIC_ASSETS
    const staticAssetsMatch = swContent.match(/STATIC_ASSETS\s*=\s*\[([\s\S]*?)\];/);
    
    if (staticAssetsMatch && staticAssetsMatch[1]) {
      const staticAssetsContent = staticAssetsMatch[1];
      
      // Extraer las entradas individuales
      const assetEntries = staticAssetsContent
        .split(',')
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
      
      // Verificar que no hay duplicados
      const uniqueEntries = new Set(assetEntries);
      expect(assetEntries.length).toBe(uniqueEntries.size);
      
      // Verificar cada entrada
      assetEntries.forEach(entry => {
        // Verificar que es una cadena entre comillas
        expect(entry).toMatch(/^['"].*['"]$/);
        
        // Extraer la ruta
        const path = entry.replace(/^['"]|['"]$/g, '');
        
        // Verificar que la ruta comienza con /
        expect(path).toMatch(/^\//);
      });
    }
  });

  test('sw.js should handle fetch events correctly', () => {
    expect(swContent).toContain('handleFetch');
    expect(swContent).toContain('event.respondWith');
  });

  test('sw.js should have proper error handling', () => {
    expect(swContent).toContain('catch');
    expect(swContent).toContain('error');
  });
}); 