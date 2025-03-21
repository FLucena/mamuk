'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import UserList from '@/components/admin/UserList';
import { Types } from 'mongoose';
import type { Viewport } from 'next';
import { redirect, useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/types/user';
import { sortRoles } from '@/lib/utils/roles';
import { RefreshCw } from 'lucide-react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3f4f6',
  colorScheme: 'light'
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para refrescar los datos
  const refreshData = () => {
    setLastRefresh(Date.now());
  };

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Refresh the current route
    router.refresh();
    
    // Reset the refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    // Solo cargar usuarios si el usuario tiene sesión
    if (status === 'loading') {
      return;
    }

    // Comprobar si el usuario es administrador
    if (status === 'authenticated' && !session?.user?.roles.includes('admin')) {
      setError('No tienes permisos para acceder a esta página. Se requiere rol de administrador.');
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Error fetching users:', response.status, errorData);
          
          // Manejar específicamente códigos de error
          if (response.status === 401) {
            setError('No has iniciado sesión. Por favor, inicia sesión para acceder a esta página.');
          } else if (response.status === 403) {
            setError('No tienes permisos para acceder a esta página. Se requiere rol de administrador.');
          } else {
            setError(`Error al cargar usuarios: ${errorData?.error || response.statusText}`);
          }
          return;
        }
        
        const data = await response.json();
        
        // Check if the response has the new structure with pagination
        const usersList = data.users ? data.users : data;
        
        // Ensure roles are sorted consistently
        setUsers(usersList.map((user: any) => ({
          ...user,
          roles: sortRoles(user.roles || [])
        })));
        
        // If we have pagination info, store it
        if (data.pagination) {
          console.log(`Loaded ${data.pagination.total} users (page ${data.pagination.page} of ${data.pagination.pages})`);
        }
        
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error al cargar usuarios. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, status, lastRefresh]);

  // Si el usuario no está autenticado, redirigir al inicio de sesión
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Debes iniciar sesión para acceder a esta página.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => redirect('/auth/signin')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-50 focus:outline-none focus:border-yellow-300 focus:shadow-outline-yellow active:bg-yellow-200 transition ease-in-out duration-150"
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuarios
  if (users.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Gestionar Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aquí puedes ver y gestionar los usuarios de la plataforma.
          </p>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No hay usuarios registrados en la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center rounded-md p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Refresh users"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <UserList users={users} onRefresh={refreshData} />
    </div>
  );
} 