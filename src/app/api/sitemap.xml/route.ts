import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { SITE_URL } from '@/lib/constants/site';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


// Revalidate the sitemap every 24 hours
export const revalidate = 86400;

interface WorkoutDocument {
  _id: {
    toString: () => string;
  };
  updatedAt?: Date;
}

/**
 * Genera un sitemap XML dinámico que incluye las rutinas públicas
 * Mejora la indexación en motores de búsqueda
 */
export async function GET() {
  try {
    await dbConnect();
    
    // Obtener el modelo de Rutina
    const Rutina = mongoose.models.Rutina || mongoose.model('Rutina', new mongoose.Schema({}));
    
    // Obtener las rutinas públicas
    const publicWorkouts = await (Rutina.find as any)({ isPublic: true })
      .sort({ updatedAt: -1 })
      .limit(100); // Limitar a 100 rutinas para evitar sitemaps demasiado grandes
    
    // URL base de la aplicación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || SITE_URL;
    
    // Fecha actual para lastmod
    const today = new Date().toISOString();
    
    // Rutas estáticas principales
    const staticRoutes = [
      '',
      '/login',
      '/register',
      '/dashboard',
      '/workout',
      '/workout/new',
      '/workout/archived',
      '/profile',
      '/about',
      '/contact',
    ];
    
    // Generar el XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Agregar rutas estáticas
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Agregar rutinas públicas
    publicWorkouts.forEach((workout: WorkoutDocument) => {
      const workoutId = workout._id.toString();
      const lastmod = workout.updatedAt ? workout.updatedAt.toISOString() : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/workout/${workoutId}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    // Devolver el XML con el tipo de contenido adecuado
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[ERROR] Error generando sitemap:', error);
    return NextResponse.json(
      { error: 'Error generando sitemap' },
      { status: 500 }
    );
  }
} 