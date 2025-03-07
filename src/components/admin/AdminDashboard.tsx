'use client';

import { useState, useEffect } from 'react';
import UserList from '@/components/admin/UserList';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';
import { Role, MongoUser } from '@/lib/types/user';

// Interfaz para usuarios en formato MongoDB (con _id)
interface MongoUserWithRole extends MongoUser {
  role: Role;
}

// Interfaz para usuarios en formato API (con id)
interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
}

interface ArchivedRoutine {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  archivedAt: string;
  coach: {
    name: string;
    email: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

type AdminView = 'users' | 'archived';

interface AdminDashboardProps {
  initialView?: AdminView;
}

export default function AdminDashboard({ initialView = 'users' }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>(initialView);
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [mongoUsers, setMongoUsers] = useState<MongoUserWithRole[]>([]);
  const [archivedRoutines, setArchivedRoutines] = useState<ArchivedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentView === 'users') {
      fetchUsers();
    } else if (currentView === 'archived') {
      fetchArchivedRoutines();
    }
  }, [currentView]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      
      // Transformar a formato API (con id)
      const transformedApiUsers = data.map((user: any) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      }));
      
      // Transformar a formato MongoDB (con _id)
      const transformedMongoUsers = data.map((user: any) => ({
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      }));

      setApiUsers(transformedApiUsers);
      setMongoUsers(transformedMongoUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedRoutines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/routines/archived');
      if (!response.ok) {
        throw new Error('Failed to fetch archived routines');
      }
      const data = await response.json();
      setArchivedRoutines(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching archived routines:', err);
      setError('Error loading archived routines');
    } finally {
      setLoading(false);
    }
  };

  const renderNavigation = () => (
    <nav className="bg-gray-900 shadow-lg mb-8 rounded-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-start items-center">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentView('users')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                currentView === 'users'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Gestionar Usuarios
            </button>
            <button
              onClick={() => setCurrentView('archived')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                currentView === 'archived'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Rutinas Archivadas
            </button>
            <a
              href="/workout"
              className="px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Mis Rutinas
            </a>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      );
    }

    switch (currentView) {
      case 'users':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2 text-gray-900">
                Gestionar Usuarios
              </h1>
              <p className="text-gray-600">
                Aquí puedes ver y gestionar los usuarios de la plataforma.
              </p>
            </div>
            <UserList users={apiUsers} />
          </div>
        );
      case 'archived':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2 text-gray-900">
                Rutinas Archivadas
              </h1>
              <p className="text-gray-600">
                Visualiza y gestiona las rutinas archivadas.
              </p>
            </div>
            <ArchivedRoutines routines={archivedRoutines} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderNavigation()}
        <div className="bg-white shadow-sm rounded-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 