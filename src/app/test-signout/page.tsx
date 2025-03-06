'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import SignOutButton from '@/components/auth/SignOutButton';

export default function TestSignOut() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Intentando cerrar sesión...');
      
      // Intentar cerrar sesión con diferentes configuraciones
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true
      });
      
      console.log('Sesión cerrada exitosamente');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/test-session');
      const data = await res.json();
      
      setSessionInfo(data);
      console.log('Información de sesión:', data);
    } catch (err) {
      console.error('Error al verificar la sesión:', err);
      setError('Error al verificar la sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center">Prueba de Cerrar Sesión</h1>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Estado de la sesión</h2>
          <p className="mb-2">
            Estado: <span className="font-medium">{status}</span>
          </p>
          {session && (
            <div className="mb-2">
              <p>Usuario: {session.user?.name || session.user?.email}</p>
              <p>Rol: {session.user?.role}</p>
            </div>
          )}
          <button
            onClick={checkSession}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? 'Verificando...' : 'Verificar sesión (API)'}
          </button>
          
          {sessionInfo && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-auto max-h-40">
              <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Método 1: Componente SignOutButton</h2>
            <SignOutButton 
              className="w-full justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
              label="Cerrar Sesión (Componente)"
              callbackUrl="/auth/signin"
            />
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Método 1b: SignOutButton con Link</h2>
            <SignOutButton 
              className="w-full justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
              label="Cerrar Sesión (Link)"
              callbackUrl="/auth/signin"
              useLink={true}
            />
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Método 2: signOut directo</h2>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
            >
              {loading ? 'Cerrando sesión...' : 'Cerrar Sesión (Directo)'}
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Método 3: Enlace directo</h2>
            <a 
              href="/api/auth/signout?callbackUrl=/auth/signin"
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70"
            >
              Cerrar Sesión (Enlace)
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Esta página es solo para probar la funcionalidad de cerrar sesión.</p>
          <p className="mt-2">Si los botones no funcionan, revisa la consola del navegador para ver si hay errores.</p>
        </div>
      </div>
    </div>
  );
} 