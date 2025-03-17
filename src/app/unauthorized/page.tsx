'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { roles, getPrimaryRole } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryRole = getPrimaryRole();
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  const handleRequestAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!requestReason.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get the current path that the user was trying to access
      const requestedAccess = pathname || window.location.pathname;
      
      // Send the access request to the API
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: requestReason,
          requestedAccess,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit access request');
      }
      
      setRequestSubmitted(true);
    } catch (error) {
      console.error('Error submitting access request:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit access request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3h3a3 3 0 003-3z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Your current role:</strong> {primaryRole}
            </p>
            {roles.length > 1 && (
              <p className="text-sm text-gray-700">
                <strong>All roles:</strong> {roles.join(', ')}
              </p>
            )}
          </div>
        </div>
        
        {!showRequestForm && !requestSubmitted ? (
          <div className="flex flex-col space-y-3">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              Go Back
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Go to Home Page
            </Button>
            <Button onClick={() => setShowRequestForm(true)} className="w-full">
              Request Access
            </Button>
          </div>
        ) : requestSubmitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your access request has been submitted. An administrator will review your request and get back to you.
            </p>
            <Button onClick={handleGoHome} className="w-full">
              Return to Home
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <h2 className="text-xl font-semibold">Request Access</h2>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Why do you need access to this page?
              </label>
              <textarea
                id="reason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Please explain why you need access to this resource..."
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                onClick={() => setShowRequestForm(false)} 
                variant="outline" 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting || !requestReason.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 