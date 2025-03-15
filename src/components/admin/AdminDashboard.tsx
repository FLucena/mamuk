'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import UserList from '@/components/admin/UserList';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';
import { Role, User } from '@/lib/types/user';
import { toast } from 'react-hot-toast';
import { sortRoles } from '@/lib/utils/roles';

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
  const [assignedCustomers, setAssignedCustomers] = useState<string[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Cargar datos al montar el componente o cuando cambia la vista
  useEffect(() => {
    fetchData();
  }, [currentView, page, pageSize]);

  // Función para cargar datos según la vista actual
  const fetchData = useCallback(async () => {
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
  }, [currentView, page, pageSize]);

  // Obtener usuarios con paginación
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Check if the response has the new structure with pagination
      const usersList = data.users ? data.users : data;
      
      setUsers(usersList.map((user: any) => ({
        ...user,
        roles: sortRoles(user.roles || [])
      })));
      
      // If we have pagination info, store it
      if (data.pagination) {
        setTotalPages(data.pagination.pages || 1);
        setTotalUsers(data.pagination.total || 0);
        console.log(`Loaded ${data.pagination.total} users (page ${data.pagination.page} of ${data.pagination.pages})`);
      }
      
      // Log performance data if available
      const executionTime = response.headers.get('X-Execution-Time');
      if (executionTime) {
        console.log(`API execution time: ${executionTime}ms`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Obtener rutinas archivadas
  const fetchArchivedRoutines = useCallback(async () => {
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
  }, []);

  // Cambiar vista
  const handleViewChange = useCallback((view: AdminView) => {
    setCurrentView(view);
    setPage(1); // Reset to first page when changing views
  }, []);

  const handleSelectCoach = useCallback(async (coach: User) => {
    setSelectedCoach(coach);
    setSelectedCustomers([]);
    
    // Fetch assigned customers for this coach
    try {
      const response = await fetch(`/api/admin/coaches/${coach._id}/customers`);
      if (response.ok) {
        const data = await response.json();
        setAssignedCustomers(data.customers || []);
      } else {
        console.error('Error fetching assigned customers');
        setAssignedCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching assigned customers:', error);
      setAssignedCustomers([]);
    }
  }, []);

  const handleSelectCustomers = useCallback((customerIds: string[]) => {
    setSelectedCustomers(customerIds);
  }, []);

  const assignCustomersToCoach = useCallback(async () => {
    if (!selectedCoach || selectedCustomers.length === 0) return;
    
    setAssignmentLoading(true);
    try {
      const response = await fetch('/api/admin/coach/assign-customers', {
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
      
      // Actualizar la lista de clientes asignados
      if (selectedCoach) {
        const response = await fetch(`/api/admin/coaches/${selectedCoach._id}/customers`);
        if (response.ok) {
          const data = await response.json();
          setAssignedCustomers(data.customers || []);
        }
      }
      
      toast.success(`${selectedCustomers.length} clientes asignados a ${selectedCoach.name}`);
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error assigning customers:', error);
      toast.error('Error al asignar clientes');
    } finally {
      setAssignmentLoading(false);
    }
  }, [selectedCoach, selectedCustomers]);

  // Pagination controls
  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset to first page when changing page size
  }, []);

  const renderNavigation = useMemo(() => (
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
  ), [currentView, handleViewChange]);

  const renderPagination = useMemo(() => (
    <div className="flex items-center justify-between mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex items-center">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Mostrando {users.length} de {totalUsers} usuarios
        </span>
        <select
          className="ml-4 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
          value={pageSize}
          onChange={handlePageSizeChange}
          aria-label="Resultados por página"
        >
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md text-sm ${
            page === 1
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Página anterior"
        >
          Anterior
        </button>
        <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          className={`px-4 py-2 rounded-md text-sm ${
            page >= totalPages
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  ), [page, totalPages, pageSize, users.length, totalUsers, handlePrevPage, handleNextPage, handlePageSizeChange]);

  const renderContent = useCallback(() => {
    if (loading && users.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
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
            <UserList 
              users={users} 
              onRefresh={fetchData}
            />
            {renderPagination}
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
                Selecciona un coach y asígnale clientes.
              </p>
            </div>
            
            {selectedCoach && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Coach seleccionado: {selectedCoach.name}
                </h2>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedCoach.email}
                </p>
                {assignedCustomers && assignedCustomers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Clientes asignados: {assignedCustomers.length}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <UserList 
              users={users.filter(user => user.roles.includes('coach'))} 
              onSelectCoach={handleSelectCoach}
              selectedCoach={selectedCoach?._id}
            />
            
            {selectedCoach && (
              <>
                <div className="mt-8 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Seleccionar Clientes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Selecciona los clientes que quieres asignar al coach.
                  </p>
                </div>
                
                <UserList 
                  users={users.filter(user => 
                    user.roles.includes('customer') && 
                    (!assignedCustomers || !assignedCustomers.includes(user._id))
                  )} 
                  onSelectCustomers={handleSelectCustomers}
                  selectedCustomers={selectedCustomers}
                  assignedCustomers={assignedCustomers}
                />
                
                {selectedCustomers.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={assignCustomersToCoach}
                      disabled={assignmentLoading}
                      className={`px-6 py-3 rounded-md text-white font-medium ${
                        assignmentLoading 
                          ? 'bg-blue-400 cursor-not-allowed' 
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
                        `Asignar ${selectedCustomers.length} clientes a ${selectedCoach.name}`
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
            
            {renderPagination}
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
                Aquí puedes ver las rutinas que han sido archivadas.
              </p>
            </div>
            <ArchivedRoutines routines={archivedRoutines} />
          </div>
        );
      default:
        return null;
    }
  }, [
    currentView, 
    users, 
    archivedRoutines, 
    loading, 
    error, 
    fetchData, 
    selectedCoach, 
    selectedCustomers, 
    assignedCustomers, 
    assignmentLoading,
    handleSelectCoach,
    handleSelectCustomers,
    assignCustomersToCoach,
    renderPagination
  ]);

  return (
    <div className="space-y-6">
      {renderNavigation}
      {renderContent()}
    </div>
  );
} 