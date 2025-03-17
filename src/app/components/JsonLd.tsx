'use client';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
import { useEffect, useState } from 'react';
import { getNonce } from '@/lib/csp';

export default function JsonLd() {
  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState('');
  
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
  
  // Don't render anything on the server
  if (!mounted) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mamuk Training',
    description: 'Tu compañero de entrenamiento personal - Entrenamiento personalizado, seguimiento profesional y resultados garantizados',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ES',
    },
    sameAs: [
      // Add your social media URLs here
    ],
    offers: {
      '@type': 'Offer',
      description: 'Servicios de entrenamiento personal',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };

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