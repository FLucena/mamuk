'use client';

import { usePathname } from 'next/navigation';
import { SITE_URL } from '@/lib/constants/site';
import Script from 'next/script';

interface CanonicalUrlProps {
  path?: string;
}

/**
 * Componente para agregar URLs canónicas a las páginas
 * Ayuda a evitar contenido duplicado para SEO
 * 
 * @param path Ruta personalizada (opcional, por defecto usa la ruta actual)
 */
export default function CanonicalUrl({ path }: CanonicalUrlProps) {
  const pathname = usePathname();
  const canonicalPath = path || pathname;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  // En Next.js 13+ es mejor usar la API de metadatos para URLs canónicas
  // Este componente es una alternativa para casos especiales
  return (
    <Script id="canonical-url" strategy="afterInteractive">
      {`
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = '${canonicalUrl}';
        document.head.appendChild(link);
      `}
    </Script>
  );
} 