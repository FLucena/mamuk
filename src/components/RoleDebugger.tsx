'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function RoleDebugger() {
  const { data: session, status } = useSession();
  const { roles, isAdmin, isCoach, isCustomer, getPrimaryRole } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isExpanded ? 'Hide' : 'Show'} Role Debug
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Role Debugger</h3>
          
          <div className="mb-4">
            <h4 className="font-medium">Session Status:</h4>
            <div className="ml-2 text-sm">
              <p>Status: <span className="font-mono">{status}</span></p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Session User:</h4>
            <div className="ml-2 text-sm">
              <p>ID: <span className="font-mono">{session?.user?.id || 'Not set'}</span></p>
              <p>Email: <span className="font-mono">{session?.user?.email || 'Not set'}</span></p>
              <p>Name: <span className="font-mono">{session?.user?.name || 'Not set'}</span></p>
              <p>Roles (from session): <span className="font-mono">{session?.user?.roles ? JSON.stringify(session.user.roles) : 'Not set'}</span></p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Auth Context:</h4>
            <div className="ml-2 text-sm">
              <p>Roles: <span className="font-mono">{JSON.stringify(roles)}</span></p>
              <p>Primary Role: <span className="font-mono">{getPrimaryRole()}</span></p>
              <p>Is Admin: <span className="font-mono">{isAdmin ? 'Yes' : 'No'}</span></p>
              <p>Is Coach: <span className="font-mono">{isCoach ? 'Yes' : 'No'}</span></p>
              <p>Is Customer: <span className="font-mono">{isCustomer ? 'Yes' : 'No'}</span></p>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            This debugger is only visible in development mode.
          </div>
        </div>
      )}
    </div>
  );
} 