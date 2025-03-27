import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const processGoogleAuth = async () => {
      try {
        // Get token from URL
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Authentication failed: No token received');
          return;
        }

        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        
        // Set success status
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (error) {
        setStatus('error');
        setMessage('Authentication failed: An error occurred');
        console.error('Google auth callback error:', error);
      }
    };

    processGoogleAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <p className="text-red-600 font-medium">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 