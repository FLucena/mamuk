'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDescription, setErrorDescription] = useState<string>('');

  useEffect(() => {
    const error = searchParams?.get('error');
    
    if (error) {
      switch (error) {
        case 'Configuration':
          setErrorMessage('Error de configuración');
          setErrorDescription('Hay un problema con la configuración del servidor de autenticación. Por favor, contacta al administrador.');
          break;
        case 'AccessDenied':
          setErrorMessage('Acceso denegado');
          setErrorDescription('No tienes permiso para acceder a esta página.');
          break;
        case 'Verification':
          setErrorMessage('Error de verificación');
          setErrorDescription('El enlace de verificación ha expirado o ya ha sido utilizado.');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
        case 'OAuthAccountNotLinked':
        case 'EmailSignin':
        case 'CredentialsSignin':
          setErrorMessage('Error de inicio de sesión');
          setErrorDescription('Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.');
          break;
        case 'SessionRequired':
          setErrorMessage('Sesión requerida');
          setErrorDescription('Debes iniciar sesión para acceder a esta página.');
          break;
        default:
          setErrorMessage('Error desconocido');
          setErrorDescription('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
      }
    } else {
      setErrorMessage('Error desconocido');
      setErrorDescription('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {errorMessage}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {errorDescription}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-center">
            <Link
              href="/auth/signin"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ir a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 