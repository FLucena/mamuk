'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminAccessDebugPage() {
  const { data: session, status } = useSession();
  const auth = useAuth();
  const [serverRoles, setServerRoles] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServerRoles = async () => {
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
    };

    if (status !== 'loading') {
      fetchServerRoles();
    }
  }, [status]);

  const checkAdminAccess = () => {
    router.push('/admin');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Access Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Client-Side Session</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>Status:</strong> {status}</p>
          {session ? (
            <pre className="mt-2 bg-gray-200 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p className="mt-2">No session data available</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth Context</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>isAdmin:</strong> {auth.isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>isCoach:</strong> {auth.isCoach ? 'Yes' : 'No'}</p>
          <p><strong>isCustomer:</strong> {auth.isCustomer ? 'Yes' : 'No'}</p>
          <p><strong>Roles:</strong> {auth.roles.join(', ')}</p>
          <p><strong>Primary Role:</strong> {auth.getPrimaryRole()}</p>
          <p><strong>Has admin role:</strong> {auth.hasRole('admin') ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Server-Side Session & Roles</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          {loading ? (
            <p>Loading server data...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <pre className="mt-2 bg-gray-200 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(serverRoles, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Admin Access</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={checkAdminAccess}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Admin Access
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Route Access Check</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>Admin Route Access:</strong> {serverRoles?.adminAccess?.hasAccess ? 'Yes' : 'No'}</p>
          {serverRoles?.adminAccess?.redirectTo && (
            <p><strong>Redirect To:</strong> {serverRoles.adminAccess.redirectTo}</p>
          )}
          {serverRoles?.adminAccess?.reason && (
            <p><strong>Reason:</strong> {serverRoles.adminAccess.reason}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Database User</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          {serverRoles?.dbUser ? (
            <div>
              <p><strong>ID:</strong> {serverRoles.dbUser._id}</p>
              <p><strong>Email:</strong> {serverRoles.dbUser.email}</p>
              <p><strong>Name:</strong> {serverRoles.dbUser.name}</p>
              <p><strong>Roles:</strong> {serverRoles.dbUser.roles?.join(', ') || 'None'}</p>
            </div>
          ) : (
            <p>No database user found</p>
          )}
        </div>
      </div>
    </div>
  );
} 