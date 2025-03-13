import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/site';

/**
 * Configuración de robots.txt para la aplicación
 * Define reglas de rastreo para motores de búsqueda
 * 
 * @returns Configuración de robots en formato compatible con Next.js
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/admin/',
        '/coach/',
        '/profile/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
} 