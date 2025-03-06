import { MetadataRoute } from 'next';

/**
 * Genera el sitemap.xml para mejorar la indexación en motores de búsqueda
 * @returns Configuración del sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app';
  
  // Rutas estáticas principales
  const staticRoutes = [
    {
      route: '',
      priority: 1.0,
      changeFrequency: 'daily' as const
    },
    {
      route: '/auth/signin',
      priority: 0.8,
      changeFrequency: 'monthly' as const
    },
    {
      route: '/auth/signup',
      priority: 0.8,
      changeFrequency: 'monthly' as const
    },
    {
      route: '/about',
      priority: 0.7,
      changeFrequency: 'monthly' as const
    },
    {
      route: '/contact',
      priority: 0.7,
      changeFrequency: 'monthly' as const
    },
    {
      route: '/ejercicios',
      priority: 0.9,
      changeFrequency: 'weekly' as const
    },
    {
      route: '/unauthorized',
      priority: 0.3,
      changeFrequency: 'yearly' as const
    }
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
  
  // Aquí se podrían agregar rutas dinámicas desde la base de datos
  // Por ejemplo, páginas de ejercicios públicos
  // Esto requeriría una consulta a la base de datos
  
  // Ejemplo de cómo se podría implementar con datos dinámicos:
  // const db = await dbConnect();
  // const publicExercises = await Exercise.find({ isPublic: true }).lean();
  // const exerciseRoutes = publicExercises.map(exercise => ({
  //   url: `${baseUrl}/ejercicios/${exercise._id}`,
  //   lastModified: exercise.updatedAt || new Date(),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));
  
  // return [...staticRoutes, ...exerciseRoutes];
  
  return [...staticRoutes];
} 