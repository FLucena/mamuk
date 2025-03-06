import { MetadataRoute } from 'next';

/**
 * Genera el archivo robots.txt para controlar el acceso de los crawlers
 * @returns Configuración de robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/ejercicios',
          '/auth/signin',
          '/auth/signup'
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/workout/',
          '/admin/',
          '/coach/',
          '/*.json$',
          '/*.js$',
          '/*.css$'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/workout/',
          '/coach/'
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/workout/',
          '/coach/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
} 