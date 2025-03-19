/**
 * Utilidades para generar esquemas JSON-LD para mejorar el SEO
 * Basado en Schema.org
 */

import { SITE_URL } from '@/lib/constants/site';
import { Role } from '@/lib/types/user';

// Define interfaces for schema generation
export interface WorkoutSchema {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
  };
}

export interface PersonSchema {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: Role[];
  bio?: string;
}

export interface ExerciseSchema {
  _id: string;
  name: string;
  description?: string;
  preparation?: string;
  execution?: string;
  equipment?: string[];
  images?: string[];
}

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
    url: process.env.NEXT_PUBLIC_APP_URL || SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/logo.png`,
    sameAs: [
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
      url: process.env.NEXT_PUBLIC_APP_URL || SITE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_APP_URL || SITE_URL
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
export function generateWorkoutSchema(workout: WorkoutSchema) {
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
        url: `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/workout/${workout._id}`,
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
export function generatePersonSchema(person: PersonSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    email: person.email,
    image: person.image || `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/default-avatar.png`,
    jobTitle: person.roles.includes('coach') ? 'Entrenador Personal' : 'Usuario',
    description: person.bio || `${person.name} en Mamuk Training`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/profile/${person.id}`
  };
}

/**
 * Genera un esquema JSON-LD para un ejercicio
 * 
 * @param exercise Datos del ejercicio
 * @returns Esquema JSON-LD para el ejercicio
 */
export function generateExerciseSchema(exercise: ExerciseSchema) {
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
        image: exercise.images?.[0] || `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/default-exercise.png`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/ejercicios/${exercise._id}#preparation`
      },
      {
        '@type': 'HowToStep',
        name: 'Ejecución',
        text: exercise.execution || 'Ejecuta el movimiento con la técnica correcta',
        image: exercise.images?.[1] || `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/default-exercise.png`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/ejercicios/${exercise._id}#execution`
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

/**
 * Genera un esquema JSON-LD para un artículo de blog
 * 
 * @param title Título del artículo
 * @param description Descripción del artículo
 * @param url URL del artículo
 * @param imageUrl URL de la imagen principal del artículo
 * @param authorName Nombre del autor
 * @param publishDate Fecha de publicación
 * @param modifiedDate Fecha de última modificación (opcional)
 * @returns Esquema JSON-LD para el artículo de blog
 */
export function generateBlogPostSchema({
  title,
  description,
  url,
  imageUrl,
  authorName,
  publishDate,
  modifiedDate,
}: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  authorName: string;
  publishDate: Date;
  modifiedDate?: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: imageUrl,
    url,
    datePublished: publishDate.toISOString(),
    dateModified: (modifiedDate || publishDate).toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mamuk',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
} 