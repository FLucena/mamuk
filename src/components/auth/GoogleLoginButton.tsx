import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import googleAuthService from '../../services/googleAuthService';
import { useAuth } from '../../store/authStore';

interface GoogleLoginButtonProps {
  className?: string;
}

// Define interfaces for Google response
interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId: string;
}

// Define interface for Google initialization config
interface GoogleInitOptions {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
  use_fedcm_for_prompt: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to break circular dependencies
  const googleInitialized = useRef(false);

  // Get return URL from query params (if any)
  const getReturnUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    return returnUrl ? decodeURIComponent(returnUrl) : '/';
  }, [location.search]);

  // Handle the Google sign-in response
  const handleGoogleResponse = useCallback(async (response: GoogleCredentialResponse) => {
    if (response.credential) {
      try {
        console.log('Google credential received, authenticating...', {
          credentialLength: response.credential.length,
          select_by: response.select_by,
        });
        
        // Use our new googleAuthService to handle the authentication
        const userData = await googleAuthService.handleGoogleSignIn(response.credential);
        
        console.log('Google authentication successful:', { 
          userId: userData._id,
          hasToken: !!userData.token,
          role: userData.role
        });
        
        // Use a small timeout to ensure the auth state is updated
        // before attempting navigation
        setTimeout(() => {
          // Get the return URL (if any)
          const returnPath = getReturnUrl();
          console.log(`Redirecting to ${returnPath} after successful Google login`);
          navigate(returnPath);
        }, 300);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error during Google authentication';
        
        console.error('Google authentication error:', error);
        setError(errorMessage);
      }
    } else {
      console.error('No credential received from Google');
      setError('No credential received from Google. Please try again.');
    }
  }, [getReturnUrl, navigate]);

  // Effect to handle automatic sign-in error reporting
  useEffect(() => {
    // Listen for Google sign-in errors
    const handleGoogleSignInError = (event: MessageEvent) => {
      // Google sends messages when sign-in errors occur
      if (event.data && event.data.type === 'oauthFailure') {
        console.error('Google OAuth failure:', event.data);
        setError(`Google sign-in error: ${event.data.message || 'Unknown OAuth error'}`);
      }
    };

    window.addEventListener('message', handleGoogleSignInError);
    
    return () => {
      window.removeEventListener('message', handleGoogleSignInError);
    };
  }, []);

  // Effect to redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnPath = getReturnUrl();
      navigate(returnPath);
    }
  }, [isAuthenticated, navigate, location.search, getReturnUrl]);

  // Initialize the Google client
  const initializeGoogleClient = useCallback(() => {
    if (!window.google || googleInitialized.current) return;
    
    googleInitialized.current = true;
    
    // Debug client ID value at initialization time
    const clientId = import.meta.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google client ID is not defined in environment variables');
      setError('Google client ID is missing. Please check your environment configuration.');
      return;
    }
    
    console.log('Initializing Google client with client ID', { 
      clientIdLength: clientId.length,
      clientIdStart: clientId.substring(0, 6) + '...'
    });
    
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true
      } as GoogleInitOptions);
      
      console.log('Google client initialized successfully');
    } catch (initError) {
      console.error('Failed to initialize Google client:', initError);
      setError('Failed to initialize Google sign-in. Please reload the page.');
    }
  }, [handleGoogleResponse]);

  // Load Google API when component mounts
  useEffect(() => {
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google API client script loaded');
      initializeGoogleClient();
    };
    script.onerror = () => {
      console.error('Failed to load Google API client script');
      setError('Failed to load Google authentication. Please check your internet connection.');
    };
    
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount if it's still there
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [initializeGoogleClient]);

  // Handle manual button click
  const handleGoogleLogin = useCallback(() => {
    setError(null); // Clear any previous errors
    
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (promptError) {
        console.error('Error displaying Google sign-in prompt:', promptError);
        setError('Failed to display Google sign-in. Please try again.');
      }
    } else {
      console.error('Google API not loaded');
      setError('Google authentication service not available. Please reload the page.');
    }
  }, []);

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleLogin}
        className={`flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
        type="button"
        aria-label="Sign in with Google"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleGoogleLogin()}
      >
        <GoogleIcon className="h-5 w-5" />
        <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

// Google SVG icon component
const GoogleIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48px"
    height="48px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

// Add TypeScript interface for Google's global object
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitOptions) => void;
          prompt: (notification?: ((notification: object) => void) | undefined) => void;
        };
      };
    };
  }
}

export default GoogleLoginButton; 