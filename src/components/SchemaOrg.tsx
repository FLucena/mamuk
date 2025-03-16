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
    // Get the nonce on the client side
    setNonce(getNonce());
  }, []);

  if (!mounted) return null;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 