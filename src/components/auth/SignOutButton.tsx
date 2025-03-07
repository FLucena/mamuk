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
      e.preventDefault();
      e.stopPropagation();
      
      setLoading(true);
      console.log('Attempting to sign out...');

      // Sign out from NextAuth with redirect disabled
      await signOut({
        redirect: false,
        callbackUrl: '/auth/signin'
      });

      // Clear all auth-related cookies
      const cookiesToClear = [
        'next-auth.session-token',
        'next-auth.csrf-token',
        'next-auth.callback-url',
        'next-auth.state',
        'next-auth.pkce',
        '__Secure-next-auth.session-token',
        '__Secure-next-auth.callback-url',
        '__Host-next-auth.csrf-token',
        'g_state',
        'g_auth',
        'gid'
      ];

      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; secure; samesite=lax`;
      });

      // Sign out from Google (this will open in a hidden iframe)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'https://accounts.google.com/logout';
      document.body.appendChild(iframe);

      // Remove the iframe after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe);
        // Redirect to sign-in page
        window.location.href = '/auth/signin';
      }, 1000);

    } catch (err) {
      console.error('Error during sign out:', err);
      // Fallback redirect
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