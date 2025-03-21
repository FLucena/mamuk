'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SignInButtonsProps {
  callbackUrl?: string;
}

export function SignInButtons({ callbackUrl: propCallbackUrl }: SignInButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // Get callbackUrl from props, search params, or use /workout as default
  let callbackUrl = propCallbackUrl || searchParams?.get('callbackUrl') || '/workout';
  
  // Ensure callbackUrl is properly decoded
  try {
    // If it's already a URL-encoded string, decode it
    if (callbackUrl.includes('%2F')) {
      callbackUrl = decodeURIComponent(callbackUrl);
    }
  } catch (e) {
    console.error('Error decoding callbackUrl:', e);
    // Fallback to a safe default
    callbackUrl = '/workout';
  }
  
  // Log for debugging
  useEffect(() => {
    console.log('SignInButtons component - callbackUrl:', callbackUrl);
  }, [callbackUrl]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Iniciando sesión con Google, callbackUrl:', callbackUrl);
      
      // Use the callbackUrl obtained from props, parameters, or the default value
      await signIn('google', { 
        callbackUrl,
        redirect: true
      });
      
    } catch (err) {
      console.error('Sign in exception:', err);
      setError('Error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-70"
      >
        {isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></span>
        ) : (
          <svg 
            className="h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <g clipPath="url(#clip0_1_2)">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_2">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        )}
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </button>
      
      {/* Display the callbackUrl for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500">
          Redirect to: {callbackUrl}
        </div>
      )}
    </div>
  );
} 