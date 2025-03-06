'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import Link from 'next/link';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'icon' | 'text';
  label?: string;
  callbackUrl?: string;
  useLink?: boolean;
}

export default function SignOutButton({
  className = '',
  variant = 'default',
  label = 'Cerrar sesión',
  callbackUrl = '/auth/signin',
  useLink = false
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  // Si useLink es true, usar un enlace directo a la ruta de signout de next-auth
  if (useLink) {
    const signoutUrl = `/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    
    if (variant === 'icon') {
      return (
        <Link href={signoutUrl} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}>
          <FiLogOut className="w-5 h-5" />
        </Link>
      );
    }

    if (variant === 'text') {
      return (
        <Link href={signoutUrl} className={`text-gray-700 dark:text-gray-200 hover:underline ${className}`}>
          {label}
        </Link>
      );
    }

    return (
      <Link 
        href={signoutUrl}
        className={`flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${className}`}
      >
        <FiLogOut className="w-5 h-5 mr-2" />
        {label}
      </Link>
    );
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    try {
      // Prevenir que el evento se propague y cierre el modal
      e.preventDefault();
      e.stopPropagation();
      
      setLoading(true);
      console.log('Intentando cerrar sesión con callbackUrl:', callbackUrl);
      
      // Usar directamente signOut de next-auth
      await signOut({ 
        callbackUrl,
        redirect: true
      });
      
      console.log('Sesión cerrada exitosamente');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Si hay un error, intentar redirigir manualmente
      window.location.href = callbackUrl;
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
        aria-label="Cerrar sesión"
      >
        <FiLogOut className="w-5 h-5" />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`text-gray-700 dark:text-gray-200 hover:underline ${className}`}
      >
        {loading ? 'Cerrando sesión...' : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={`flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${className}`}
    >
      <FiLogOut className="w-5 h-5 mr-2" />
      {loading ? 'Cerrando sesión...' : label}
    </button>
  );
} 