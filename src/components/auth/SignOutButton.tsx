'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import Icon from '@/components/ui/Icon';
import { FiLogOut } from 'react-icons/fi';

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
          <Icon icon="FiLogOut" className="w-5 h-5" />
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
        <Icon icon="FiLogOut" className="w-5 h-5 mr-2" />
        {label}
      </Link>
    );
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      
      if (loading) return;
      setLoading(true);
      
      toast.loading('Cerrando sesión...');

      // Instead of our complex approach, let's use the standard NextAuth signOut
      // with redirect enabled to ensure proper session cleanup
      await signOut({
        redirect: true,
        callbackUrl: '/auth/signin'
      });

      // The code below won't execute due to the redirect, but we'll keep it
      // as a fallback in case the redirect doesn't happen
      toast.success('Sesión cerrada correctamente');

    } catch (err) {
      console.error('Error during sign out:', err);
      toast.error('Error al cerrar sesión');
      
      // Force a clean reload on error
      window.location.href = '/auth/signin';
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
        <Icon icon="FiLogOut" className="w-5 h-5" />
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
      <Icon icon="FiLogOut" className="w-5 h-5 mr-2" />
      {loading ? 'Cerrando sesión...' : label}
    </button>
  );
} 