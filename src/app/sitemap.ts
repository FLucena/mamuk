import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/site';
import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';

/**
 * Genera un sitemap dinámico para la aplicación
 * Incluye rutas estáticas y dinámicas (workouts)
 * 
 * @returns Sitemap en formato compatible con Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ejercicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap;

  // Rutas dinámicas (workouts públicos)
  try {
    await dbConnect();
    
    // Obtener solo workouts públicos
    const workouts = await Workout.find({ isPublic: true })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    
    const workoutRoutes = workouts.map((workout: any) => ({
      url: `${SITE_URL}/workout/${workout._id}`,
      lastModified: workout.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...workoutRoutes];
  } catch (error) {
    console.error('Error generando sitemap:', error);
    return staticRoutes;
  }
} 