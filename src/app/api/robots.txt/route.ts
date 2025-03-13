import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/constants/site';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


// Revalidate the robots.txt every 24 hours
export const revalidate = 86400;

/**
 * Genera un archivo robots.txt dinámico
 * Controla el acceso de los crawlers a la aplicación
 */
export async function GET() {
  // URL base de la aplicación
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || SITE_URL;
  
  // Generar el contenido del robots.txt
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /workout/new/
Disallow: /workout/archived/
Disallow: /admin/

# Permitir a Google indexar todo el contenido público
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /workout/new/
Disallow: /workout/archived/
Disallow: /admin/

# Sitemap
Sitemap: ${baseUrl}/api/sitemap.xml
`;
  
  // Devolver el contenido con el tipo MIME adecuado
  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  });
} 