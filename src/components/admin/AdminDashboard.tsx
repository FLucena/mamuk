'use client';

import { useState, useEffect } from 'react';
import UserList from '@/components/admin/UserList';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';
import { Role, User } from '@/lib/types/user';
import { toast } from 'react-hot-toast';

// Interfaz para usuarios con rol específico
interface UserWithRole extends User {
  roles: Role[];
}

// Interfaz para rutinas archivadas
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

// Vistas disponibles en el dashboard
type AdminView = 'users' | 'archived' | 'assignments';

interface AdminDashboardProps {
  initialView?: AdminView;
}

export default function AdminDashboard({ initialView = 'users' }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>(initialView);
  const [users, setUsers] = useState<User[]>([]);
  const [archivedRoutines, setArchivedRoutines] = useState<ArchivedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Función para cargar datos según la vista actual
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (currentView === 'users' || currentView === 'assignments') {
        await fetchUsers();
      } else if (currentView === 'archived') {
        await fetchArchivedRoutines();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      setUsers(data.map((user: any) => ({
        ...user,
        roles: user.roles || []
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  // Obtener rutinas archivadas
  const fetchArchivedRoutines = async () => {
    try {
      const response = await fetch('/api/admin/archived-routines');
      
      if (!response.ok) {
        throw new Error('Failed to fetch archived routines');
      }
      
      const data = await response.json();
      setArchivedRoutines(data);
    } catch (error) {
      console.error('Error fetching archived routines:', error);
      throw error;
    }
  };

  // Cambiar vista
  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    fetchData();
  };

  const handleSelectCoach = (coach: User) => {
    setSelectedCoach(coach);
    setSelectedCustomers([]);
  };

  const handleSelectCustomers = (customerIds: string[]) => {
    setSelectedCustomers(customerIds);
  };

  const assignCustomersToCoach = async () => {
    if (!selectedCoach || selectedCustomers.length === 0) return;
    
    setAssignmentLoading(true);
    try {
      const response = await fetch('/api/admin/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: selectedCoach._id,
          customerIds: selectedCustomers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign customers');
      }
      
      toast.success(`${selectedCustomers.length} customers assigned to ${selectedCoach.name}`);
      setSelectedCoach(null);
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error assigning customers:', error);
      toast.error('Failed to assign customers');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const renderNavigation = () => (
    <div className="flex space-x-2 mb-6">
      <button
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
          currentView === 'users'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => handleViewChange('users')}
      >
        Usuarios
      </button>
      <button
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
          currentView === 'assignments'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => handleViewChange('assignments')}
      >
        Asignar Clientes
      </button>
      <button
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
          currentView === 'archived'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => handleViewChange('archived')}
      >
        Rutinas Archivadas
      </button>
    </div>
  );

  const renderContent = () => {
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
            <UserList users={users} />
          </div>
        );
      case 'assignments':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Asignar Clientes a Coaches
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Aquí puedes asignar clientes a coaches para gestionar sus rutinas.
              </p>
            </div>
            <UserList 
              users={users} 
              onSelectCoach={handleSelectCoach} 
              selectedCoach={selectedCoach?._id} 
              onSelectCustomers={handleSelectCustomers}
              selectedCustomers={selectedCustomers}
              onAssignCustomers={assignCustomersToCoach}
              assignmentLoading={assignmentLoading}
            />
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderNavigation()}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
} 