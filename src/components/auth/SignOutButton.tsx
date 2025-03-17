'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const router = useRouter();

  // Si useLink es true, usar un enlace directo a la ruta de signout de next-auth
  if (useLink) {
    const signoutUrl = `/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    
    if (variant === 'icon') {
      return (
        <Link href={signoutUrl} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}>
          <LogOut className="w-5 h-5" />
        </Link>
      );
    }

    if (variant === 'text') {
      return (
        <Link href={signoutUrl} className={`flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}>
          <LogOut className="w-4 h-4 mr-2" />
          {label}
        </Link>
      );
    }

    return (
      <Link 
        href={signoutUrl}
        className={`flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${className}`}
      >
        <LogOut className="w-5 h-5 mr-2" />
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

      // Use the standard NextAuth signOut with redirect: false first to ensure proper cleanup
      await signOut({
        redirect: false,
        callbackUrl: callbackUrl
      });

      // Then manually redirect to ensure the UI has time to update
      toast.success('Sesión cerrada correctamente');
      
      // Force a complete page refresh to ensure all components update
      // Use location.replace instead of href to prevent back button from returning to authenticated state
      window.location.replace(callbackUrl);
    } catch (err) {
      console.error('Error during sign out:', err);
      toast.error('Error al cerrar sesión');
      
      // Force a complete page refresh even on error
      window.location.replace(callbackUrl);
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
        <LogOut className="w-5 h-5" />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      >
        <LogOut className="w-4 h-4 mr-2" />
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
      <LogOut className="w-5 h-5 mr-2" />
      {loading ? 'Cerrando sesión...' : label}
    </button>
  );
} 