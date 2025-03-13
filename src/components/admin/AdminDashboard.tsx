'use client';

import { useState, useEffect } from 'react';
import UserList from '@/components/admin/UserList';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';
import { Role, MongoUser, User } from '@/lib/types/user';
import { AdminNavLink } from '@/components/navigation/AdminNavigation';
import { toast } from 'react-hot-toast';

// Interfaz para usuarios de MongoDB con rol
interface MongoUserWithRole extends MongoUser {
  roles: Role[];
}

// Interfaz para usuarios en formato API (con id)
interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: Role[];
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
  const [currentView, setCurrentView] = useState<AdminView>(initialView);
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [mongoUsers, setMongoUsers] = useState<MongoUserWithRole[]>([]);
  const [archivedRoutines, setArchivedRoutines] = useState<ArchivedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<ApiUser | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    if (currentView === 'users') {
      fetchUsers();
    } else if (currentView === 'archived') {
      fetchArchivedRoutines();
    } else if (currentView === 'assignments') {
      fetchUsers();
    }
  }, [currentView]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      // Transform MongoDB users to API format
      const apiUsers: ApiUser[] = data.map((user: MongoUser) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        roles: user.roles || []
      }));
      
      setApiUsers(apiUsers);
      setMongoUsers(data.map((user: any) => ({
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        roles: user.roles || []
      })));
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

  const handleSelectCoach = (coach: ApiUser) => {
    setSelectedCoach(coach);
    setSelectedCustomers([]);
  };

  const handleToggleCustomer = (customerId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleAssignCustomers = async () => {
    if (!selectedCoach || selectedCustomers.length === 0) {
      toast.error('Selecciona un coach y al menos un cliente');
      return;
    }

    try {
      setAssignmentLoading(true);
      const response = await fetch('/api/admin/coach/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: selectedCoach.id,
          customerIds: selectedCustomers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asignar clientes');
      }

      const data = await response.json();
      toast.success(`${data.assignedCount} clientes asignados correctamente`);
      setSelectedCustomers([]);
    } catch (err: any) {
      console.error('Error assigning customers:', err);
      toast.error(err.message || 'Error al asignar clientes');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const renderNavigation = () => (
    <nav className="bg-white dark:bg-gray-900 shadow-lg mb-8 rounded-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-start items-center">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentView('users')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                currentView === 'users'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Gestionar Usuarios
            </button>
            <button
              onClick={() => setCurrentView('assignments')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                currentView === 'assignments'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Asignar Clientes
            </button>
            <button
              onClick={() => setCurrentView('archived')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                currentView === 'archived'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Rutinas Archivadas
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 min-h-[400px]">
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
            <UserList users={apiUsers as unknown as User[]} />
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Coaches</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Selecciona un coach para ver sus clientes asignados o asignar nuevos clientes.
                  </p>
                  <div className="space-y-2">
                    {apiUsers
                      .filter(user => user.roles?.includes('coach') || user.roles?.includes('admin'))
                      .map(coach => (
                        <div 
                          key={coach.id}
                          className={`p-4 border ${selectedCoach?.id === coach.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'} 
                            rounded-lg cursor-pointer transition-colors`}
                          onClick={() => handleSelectCoach(coach)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                              {coach.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{coach.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{coach.email}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              className={`px-3 py-1 ${selectedCoach?.id === coach.id 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-blue-500 hover:bg-blue-600'} 
                                text-white text-sm rounded transition-colors`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCoach(coach);
                              }}
                            >
                              {selectedCoach?.id === coach.id ? 'Seleccionado' : 'Asignar Clientes'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Clientes</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Estos son los clientes disponibles para asignar a coaches.
                  </p>
                  <div className="space-y-2">
                    {apiUsers
                      .filter(user => user.roles?.includes('customer'))
                      .map(customer => (
                        <div 
                          key={customer.id}
                          className={`p-4 border ${selectedCustomers.includes(customer.id) 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-700'} 
                            rounded-lg cursor-pointer transition-colors ${selectedCoach ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
                          onClick={() => selectedCoach && handleToggleCustomer(customer.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300 mr-3">
                                {customer.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                              </div>
                            </div>
                            {selectedCoach && (
                              <div className="flex items-center" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedCustomers.includes(customer.id)}
                                  onChange={() => handleToggleCustomer(customer.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {selectedCoach && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleAssignCustomers}
                        disabled={selectedCustomers.length === 0 || assignmentLoading}
                        className={`px-4 py-2 rounded-md text-white font-medium ${
                          selectedCustomers.length === 0 || assignmentLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {assignmentLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Asignando...
                          </span>
                        ) : (
                          `Asignar ${selectedCustomers.length} cliente${selectedCustomers.length !== 1 ? 's' : ''}`
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderNavigation()}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 