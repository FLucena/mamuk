'use client';

import Link from 'next/link';
import { Metadata } from 'next';

// Metadata can't be used in client components, so we'll need to move it to a separate layout file
// or remove it from this client component
// export const metadata: Metadata = {
//   title: 'Sin conexión',
//   description: 'No hay conexión a Internet',
// };

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-6xl mb-8">📶</div>
      <h1 className="text-3xl font-bold mb-4 text-center">Sin conexión a Internet</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        No pudimos cargar la página que estás buscando porque parece que no tienes conexión a Internet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-center"
        >
          Ir al inicio
        </Link>
      </div>
      
      <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        <p>Algunas funciones están disponibles sin conexión:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Ver tus rutinas guardadas</li>
          <li>Acceder a tu perfil</li>
          <li>Ver ejercicios guardados</li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg max-w-md">
        <h2 className="font-semibold mb-2">Consejos para solucionar problemas de conexión:</h2>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Verifica tu conexión WiFi o datos móviles</li>
          <li>Activa el modo avión y desactívalo nuevamente</li>
          <li>Reinicia tu router o dispositivo</li>
          <li>Intenta acceder más tarde</li>
        </ul>
      </div>
    </div>
  );
} 