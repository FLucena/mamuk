'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

export default function LoadingPage() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Ocultar la página de carga después de un tiempo
    const timer = setTimeout(() => {
      setShow(false);
    }, 800); // Aumentamos un poco el tiempo para asegurar que la página esté lista

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="loading-page">
      <LoadingSpinner size="xl" showText={true} text="Cargando MAMUK..." />
    </div>
  );
} 