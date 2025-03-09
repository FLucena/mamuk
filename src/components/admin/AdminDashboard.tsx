'use client';

import { useState, useEffect } from 'react';
import UserList from '@/components/admin/UserList';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';
import { Role, MongoUser } from '@/lib/types/user';
import { useRouter } from 'next/navigation';

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

type AdminView = 'users' | 'archived' | 'assignments';

interface AdminDashboardProps {
  initialView?: AdminView;
}

export default function AdminDashboard({ initialView = 'users' }: AdminDashboardProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AdminView>(initialView);
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [mongoUsers, setMongoUsers] = useState<MongoUserWithRole[]>([]);
  const [archivedRoutines, setArchivedRoutines] = useState<ArchivedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentView === 'assignments') {
      // Navigate to the assignments page
      router.push('/admin/assignments');
      return;
    }
    
    if (currentView === 'users') {
      fetchUsers();
    } else if (currentView === 'archived') {
      fetchArchivedRoutines();
    }
  }, [currentView, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Fallo al obtener usuarios');
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
        throw new Error('Fallo al obtener rutinas archivadas');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-4">
        {error}
      </div>
    );
  }

  switch (currentView) {
    case 'users':
      return (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Gestionar Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí puedes ver y gestionar los usuarios de la plataforma.
            </p>
          </div>
          <UserList users={mongoUsers} isLoading={loading} />
        </div>
      );
    case 'archived':
      return (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Rutinas Archivadas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Visualiza y gestiona las rutinas archivadas.
            </p>
          </div>
          <ArchivedRoutines routines={archivedRoutines} />
        </div>
      );
    default:
      return null;
  }
} 