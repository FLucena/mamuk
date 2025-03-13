import { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SITE_KEYWORDS, TWITTER_HANDLE } from '@/lib/constants/site';

/**
 * Genera metadatos dinámicos para páginas
 * 
 * @param title Título de la página
 * @param description Descripción de la página
 * @param path Ruta relativa de la página (sin barra inicial)
 * @param imageUrl URL de la imagen para OpenGraph (opcional)
 * @param keywords Palabras clave adicionales (opcional)
 * @returns Objeto de metadatos compatible con Next.js
 */
export function generateMetadata({
  title,
  description,
  path,
  imageUrl,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  keywords?: string[];
}): Metadata {
  // Construir URL completa
  const url = path ? `${SITE_URL}/${path}` : SITE_URL;
  
  // Imagen por defecto si no se proporciona
  const ogImage = imageUrl || `${SITE_URL}/og-image.jpg`;
  
  // Combinar palabras clave del sitio con las específicas de la página
  const combinedKeywords = [...SITE_KEYWORDS.split(',').map(k => k.trim()), ...keywords];
  
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: combinedKeywords.join(', '),
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'es_ES',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      creator: TWITTER_HANDLE,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
  };
} 