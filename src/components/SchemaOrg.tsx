'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 