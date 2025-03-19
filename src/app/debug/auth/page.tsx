'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DbUser {
  _id: string;
  email: string;
  name: string;
  roles?: string[];
}

interface AccessCheck {
  hasAccess: boolean;
  redirectTo?: string;
  reason?: string;
}

interface ServerRolesResponse {
  adminAccess?: AccessCheck;
  coachAccess?: AccessCheck;
  dbUser?: DbUser;
  hasAdminAccess?: boolean;
  hasCoachAccess?: boolean;
  user?: {
    roles: string[];
  };
}

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [serverRoles, setServerRoles] = useState<ServerRolesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchServerRoles() {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/roles');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setServerRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching server roles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchServerRoles();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Client-Side Session</h2>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap">
              {status === 'loading' 
                ? 'Loading session...' 
                : JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Session Status: <span className="font-normal">{status}</span></h3>
            {session && (
              <div className="mt-2">
                <h3 className="font-medium mb-2">User Roles:</h3>
                <ul className="list-disc list-inside">
                  {session.user.roles && session.user.roles.length > 0 ? (
                    session.user.roles.map((role: string) => (
                      <li key={role} className="ml-2">{role}</li>
                    ))
                  ) : (
                    <li className="ml-2 text-red-500">No roles found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Server-Side Session</h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded text-red-700 dark:text-red-200">
              <p>Error: {error}</p>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(serverRoles, null, 2)}
              </pre>
            </div>
          )}
          
          {serverRoles && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Admin Access: <span className={serverRoles.hasAdminAccess ? "text-green-500" : "text-red-500"}>
                {serverRoles.hasAdminAccess ? "Yes" : "No"}
              </span></h3>
              
              {serverRoles.user && (
                <div className="mt-2">
                  <h3 className="font-medium mb-2">User Roles (DB):</h3>
                  <ul className="list-disc list-inside">
                    {serverRoles.user.roles && serverRoles.user.roles.length > 0 ? (
                      serverRoles.user.roles.map((role: string) => (
                        <li key={role} className="ml-2">{role}</li>
                      ))
                    ) : (
                      <li className="ml-2 text-red-500">No roles found in database</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex gap-4">
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Home
        </button>
        <button 
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Admin Access
        </button>
        <button 
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 