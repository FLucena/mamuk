/**
 * Utilidades para generar esquemas JSON-LD para mejorar el SEO
 * Basado en Schema.org
 */

/**
 * Genera un esquema JSON-LD para una organización
 * 
 * @returns Esquema JSON-LD para la organización
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mamuk',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.com.ar',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.com.ar'}/logo.png`,
    sameAs: [
      'https://facebook.com/mamuk',
      'https://twitter.com/mamuk',
      'https://www.instagram.com/mamuk_fa/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34-XXX-XXX-XXX',
      contactType: 'customer service',
      email: 'info@mamuk.com',
      availableLanguage: ['Spanish', 'English'],
    },
    description: 'Plataforma de entrenamiento personalizado que conecta entrenadores con clientes para crear y gestionar rutinas de ejercicio.',
    foundingDate: '2023-01-01',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Madrid',
      addressRegion: 'Madrid',
      postalCode: '28001',
      addressCountry: 'ES'
    }
  };
}

/**
 * Genera un esquema JSON-LD para una página web
 * 
 * @param title Título de la página
 * @param description Descripción de la página
 * @param url URL de la página
 * @returns Esquema JSON-LD para la página web
 */
export function generateWebPageSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Mamuk',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: url
        }
      ]
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.main-content']
    }
  };
}

/**
 * Genera un esquema JSON-LD para un artículo o rutina
 * 
 * @param workout Datos de la rutina
 * @returns Esquema JSON-LD para la rutina
 */
export function generateWorkoutSchema(workout: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: workout.name,
    description: workout.description || 'Rutina de entrenamiento personalizada',
    author: {
      '@type': 'Person',
      name: workout.author?.name || 'Entrenador Mamuk',
    },
    datePublished: workout.createdAt,
    dateModified: workout.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Mamuk',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/workout/${workout._id}`,
    },
    keywords: ['entrenamiento', 'fitness', 'rutina', 'ejercicio', 'personalizado'],
    articleSection: 'Fitness',
    wordCount: workout.description ? workout.description.split(' ').length : 0
  };
}

/**
 * Genera un esquema JSON-LD para una persona (coach o usuario)
 * 
 * @param person Datos de la persona
 * @returns Esquema JSON-LD para la persona
 */
export function generatePersonSchema(person: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    email: person.email,
    image: person.image || `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/default-avatar.png`,
    jobTitle: person.role === 'coach' ? 'Entrenador Personal' : 'Usuario',
    description: person.bio || `${person.name} en Mamuk Training`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/profile/${person.id}`
  };
}

/**
 * Genera un esquema JSON-LD para un ejercicio
 * 
 * @param exercise Datos del ejercicio
 * @returns Esquema JSON-LD para el ejercicio
 */
export function generateExerciseSchema(exercise: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: exercise.name,
    description: exercise.description || `Cómo realizar el ejercicio ${exercise.name} correctamente`,
    totalTime: 'PT5M', // Duración estimada: 5 minutos
    supply: exercise.equipment?.map((eq: string) => ({ '@type': 'HowToSupply', name: eq })) || [],
    tool: exercise.equipment?.map((eq: string) => ({ '@type': 'HowToTool', name: eq })) || [],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Preparación',
        text: exercise.preparation || 'Prepárate para realizar el ejercicio',
        image: exercise.images?.[0] || `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/default-exercise.png`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/ejercicios/${exercise._id}#preparation`
      },
      {
        '@type': 'HowToStep',
        name: 'Ejecución',
        text: exercise.execution || 'Ejecuta el movimiento con la técnica correcta',
        image: exercise.images?.[1] || `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/default-exercise.png`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'}/ejercicios/${exercise._id}#execution`
      }
    ]
  };
}

/**
 * Genera un esquema JSON-LD para la página de FAQ
 * 
 * @param faqs Array de preguntas y respuestas
 * @returns Esquema JSON-LD para la página de FAQ
 */
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
} 