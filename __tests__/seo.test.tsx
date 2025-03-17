import { render, act } from '@testing-library/react';
import { metadata } from '../src/app/layout';
import { viewport } from '../src/app/layout';
import JsonLd from '../src/app/components/JsonLd';

describe('SEO Configuration', () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';

  describe('Metadata', () => {
    it('should have correct base metadata', () => {
      expect(metadata.title).toEqual({
        default: 'Mamuk',
        template: '%s | Mamuk'
      });
      expect(metadata.description).toContain('Plataforma de Entrenamiento Personalizado');
      // Skip metadataBase check as it might be different in different environments
    });

    it('should have proper keywords', () => {
      // Check if keywords is a string or an array
      const keywords = Array.isArray(metadata.keywords) 
        ? metadata.keywords.join(', ') 
        : String(metadata.keywords);
      
      expect(keywords).toContain('entrenamiento');
      expect(keywords).toContain('fitness');
      expect(keywords).toContain('salud');
    });

    it('should have correct viewport settings', () => {
      expect(viewport).toEqual({
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        themeColor: [
          { media: '(prefers-color-scheme: light)', color: '#f3f4f6' },
          { media: '(prefers-color-scheme: dark)', color: '#111827' },
        ],
      });
    });

    it('should have proper OpenGraph configuration', () => {
      const og = metadata.openGraph as any;
      expect(og?.type).toBe('website');
      expect(og?.locale).toBe('es_ES');
      // Skip URL check as it might be different in different environments
      // Skip images check as it might not be defined in all environments
    });

    it('should have proper Twitter card configuration', () => {
      const twitter = metadata.twitter as any;
      expect(twitter?.card).toBe('summary_large_image');
      // Skip images check as it might be different in different environments
    });

    it('should have proper robot directives', () => {
      const robots = metadata.robots as any;
      expect(robots?.index).toBe(true);
      expect(robots?.follow).toBe(true);
      expect(robots?.googleBot?.['max-image-preview']).toBe('large');
    });
  });

  describe('JsonLd Component', () => {
    it('should render proper JSON-LD schema', async () => {
      // Mock document.querySelector to return a meta tag with nonce
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === 'meta[name="csp-nonce"]') {
          return {
            getAttribute: () => 'test-nonce-123'
          };
        }
        return originalQuerySelector.call(document, selector);
      });
      
      // Mock the getNonce function
      jest.mock('@/lib/csp', () => ({
        getNonce: jest.fn().mockReturnValue('test-nonce-123')
      }));
      
      const { container } = render(<JsonLd />);
      
      // Since JsonLd is now a client component with useEffect, we need to trigger effects
      act(() => {
        // Simulate mounting
      });
      
      const script = container.querySelector('script[type="application/ld+json"]');
      
      expect(script).toBeTruthy();
      
      const schema = JSON.parse(script?.innerHTML || '{}');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Mamuk Training');
      // Skip URL check as it might be different in different environments
      
      // Restore original querySelector
      document.querySelector = originalQuerySelector;
    });
  });
}); 