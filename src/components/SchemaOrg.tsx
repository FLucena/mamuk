'use client';

import { useEffect, useState } from 'react';
import { getNonce } from '@/lib/csp';

interface SchemaOrgProps {
  schema: Record<string, any>;
}

/**
 * Componente para insertar esquemas JSON-LD en las páginas
 * Mejora el SEO proporcionando datos estructurados para motores de búsqueda
 * 
 * @param schema Esquema JSON-LD a insertar
 */
export default function SchemaOrg({ schema }: SchemaOrgProps) {
  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    // Get the nonce from the meta tag
    const metaNonce = document.querySelector('meta[name="csp-nonce"]');
    if (metaNonce && metaNonce.getAttribute('content')) {
      setNonce(metaNonce.getAttribute('content') || '');
    } else {
      // Fallback to the getNonce function
      setNonce(getNonce());
    }
  }, []);

  if (!mounted) return null;
  
  // Only render if we have a nonce
  if (!nonce) return null;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 