import fs from 'fs';
import path from 'path';

describe('PWA Configuration', () => {
  describe('Manifest', () => {
    let manifest: any;

    beforeAll(() => {
      const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    });

    it('should have correct basic PWA properties', () => {
      expect(manifest.name).toBe('Mamuk Training');
      expect(manifest.short_name).toBe('Mamuk');
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
    });

    it('should have proper icon configuration', () => {
      expect(manifest.icons).toHaveLength(3);
      expect(manifest.icons).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }),
        ])
      );
    });

    it('should have proper shortcuts', () => {
      expect(manifest.shortcuts).toHaveLength(2);
      expect(manifest.shortcuts[0]).toHaveProperty('name', 'Mi Perfil');
      expect(manifest.shortcuts[1]).toHaveProperty('name', 'Entrenamientos');
    });

    it('should have proper language and direction settings', () => {
      expect(manifest.lang).toBe('es-ES');
      expect(manifest.dir).toBe('ltr');
    });
  });

  describe('Service Worker', () => {
    let swContent: string;

    beforeAll(() => {
      const swPath = path.join(process.cwd(), 'public', 'sw.js');
      swContent = fs.readFileSync(swPath, 'utf8');
    });

    it('should define cache name and offline URL', () => {
      expect(swContent).toContain('CACHE_NAME');
      expect(swContent).toContain('OFFLINE_URL');
    });

    it('should have proper cache strategies defined', () => {
      expect(swContent).toContain('cache-first');
      expect(swContent).toContain('network-first');
      expect(swContent).toContain('network-only');
    });

    it('should handle static assets', () => {
      expect(swContent).toContain('STATIC_ASSETS');
      expect(swContent).toContain('/manifest.json');
      expect(swContent).toContain('/favicon.ico');
    });

    it('should implement required service worker events', () => {
      expect(swContent).toContain("addEventListener('install'");
      expect(swContent).toContain("addEventListener('activate'");
      expect(swContent).toContain("addEventListener('fetch'");
      expect(swContent).toContain("addEventListener('push'");
      expect(swContent).toContain("addEventListener('notificationclick'");
    });

    it('should implement proper caching patterns', () => {
      expect(swContent).toMatch(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)/);
      expect(swContent).toContain('/api/');
    });
  });
}); 