import { NextResponse } from 'next/server';

/**
 * Genera un archivo robots.txt dinámico
 * Controla el acceso de los crawlers a la aplicación
 */
export async function GET() {
  // URL base de la aplicación
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app';
  
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
} 