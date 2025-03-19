'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import UserList from '@/components/admin/UserList';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';
import AssignCustomersModal from '@/components/admin/AssignCustomersModal';
import { Role, User } from '@/lib/types/user';
import { toast } from 'react-hot-toast';
import { sortRoles } from '@/lib/utils/roles';
import { debugLog, logApiCall } from '@/lib/utils/debugLogger';
import { runApiTests } from '@/lib/test/api-test';

// Check if we're in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

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
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState<AdminView>(initialView);
  const [users, setUsers] = useState<User[]>([]);
  const [archivedRoutines, setArchivedRoutines] = useState<ArchivedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [assignedCustomers, setAssignedCustomers] = useState<string[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  // Only enable debug mode in development
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Check if user is admin on mount
  useEffect(() => {
    debugLog({ 
      title: 'AdminDashboard - Session Status',
      data: { status, isAdmin: session?.user?.roles?.includes('admin') },
      session
    });
    
    if (status === 'loading') {
      // Still loading, don't do anything yet
      return;
    }
    
    if (!session || !session.user || !session.user.roles?.includes('admin')) {
      // Redirect or show error if user is not an admin
      setError('No tienes permisos para acceder a esta página');
      toast.error('No tienes permisos para acceder a esta página');
      console.error('User lacks admin permissions', { 
        authenticated: !!session,
        roles: session?.user?.roles || [] 
      });
    }
  }, [session, status]);

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
      // Use toast instead of setting error state to prevent UI from being blocked
      toast.error('Error al cargar los datos. Intente nuevamente.');
      // Only set the error state if we have no data to display
      if ((currentView === 'users' || currentView === 'assignments') && users.length === 0) {
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } else if (currentView === 'archived' && archivedRoutines.length === 0) {
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentView, page, pageSize, users.length, archivedRoutines.length]);

  // Obtener usuarios con paginación
  const fetchUsers = useCallback(async () => {
    if (status !== 'authenticated') {
      debugLog({ 
        title: 'Fetch Users - Not Authenticated',
        data: { status },
        error: true
      });
      return;
    }
    
    try {
      setLoading(true);
      const apiUrl = `/api/admin/users?page=${page}&limit=${pageSize}`;
      
      debugLog({
        title: 'Fetching Users',
        data: { page, pageSize, apiUrl },
        session
      });
      
      const response = await logApiCall(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      }, 'Admin Users API');
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      debugLog({
        title: 'Users Data Received',
        data: { 
          count: data.users?.length || data.length,
          pagination: data.pagination
        }
      });
      
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
      toast.error('Error al cargar los usuarios');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, session, status]);

  // Obtener rutinas archivadas
  const fetchArchivedRoutines = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/routines/archived', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Check for specific status codes to provide better error messages
        if (response.status === 404) {
          console.error('API endpoint not found: /api/admin/routines/archived');
          toast.error('La ruta para obtener rutinas archivadas no está disponible');
        } else {
          console.error(`Failed to fetch archived routines: ${response.status} ${response.statusText}`);
          toast.error('Error al cargar las rutinas archivadas');
        }
        // Don't throw error, just return so we don't crash the UI
        return;
      }
      
      const data = await response.json();
      setArchivedRoutines(data);
    } catch (error) {
      console.error('Error fetching archived routines:', error);
      toast.error('Error al cargar las rutinas archivadas');
      // Don't throw the error further
    }
  }, []);

  // Cambiar vista
  const handleViewChange = useCallback((view: AdminView) => {
    setCurrentView(view);
    setPage(1); // Reset to first page when changing views
  }, []);

  const handleSelectCoach = useCallback(async (coach: User) => {
    if (status !== 'authenticated') {
      debugLog({ 
        title: 'Select Coach - Not Authenticated',
        data: { status, coach },
        error: true,
        session
      });
      
      toast.error('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
      return;
    }
    
    setSelectedCoach(coach);
    setSelectedCustomers([]);
    setIsAssignModalOpen(true);
    
    debugLog({
      title: 'Coach Selected',
      data: { 
        coach: {
          id: coach._id,
          name: coach.name,
          email: coach.email
        }
      }
    });
    
    // Fetch assigned customers for this coach
    try {
      setAssignmentLoading(true);
      
      // First, try to get the coach's document ID
      debugLog({
        title: 'Fetching Coaches Data',
        data: { endpoint: '/api/admin/coaches' }
      });
      
      const coachResponse = await logApiCall('/api/admin/coaches', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }, 'Coaches API');
      
      // Check for auth errors specifically
      if (coachResponse.status === 401) {
        debugLog({
          title: 'Authorization Error - Coaches API',
          data: { status: coachResponse.status },
          error: true
        });
        toast.error('Error de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }
      
      if (coachResponse.status === 403) {
        debugLog({
          title: 'Permission Error - Coaches API',
          data: { status: coachResponse.status },
          error: true
        });
        toast.error('No tienes permisos para realizar esta acción.');
        return;
      }
      
      let coachDocId = coach._id;
      let assignedCustomersIds: string[] = [];
      
      if (coachResponse.ok) {
        const coachesData = await coachResponse.json();
        debugLog({
          title: 'Coaches Data Received',
          data: { coachesCount: coachesData.length }
        });
        
        // Find the coach document that matches our selected coach's user ID
        const coachDoc = coachesData.find((c: any) => 
          c.userId && (c.userId._id === coach._id || c.userId === coach._id)
        );
        
        debugLog({
          title: 'Coach Document Found',
          data: { 
            found: !!coachDoc,
            coachDocId: coachDoc?._id,
            originalId: coach._id
          }
        });
        
        if (coachDoc && coachDoc._id) {
          coachDocId = coachDoc._id;
          
          // If we have a coach document, use its ID to fetch customers
          debugLog({
            title: 'Fetching Coach Customers',
            data: { endpoint: `/api/admin/coaches/${coachDocId}/customers` }
          });
          
          const response = await logApiCall(`/api/admin/coaches/${coachDocId}/customers`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          }, 'Coach Customers API');
          
          if (response.ok) {
            const data = await response.json();
            assignedCustomersIds = data.customers || [];
            
            debugLog({
              title: 'Coach Customers Received',
              data: { 
                customersCount: assignedCustomersIds.length,
                customers: assignedCustomersIds
              }
            });
            
            setAssignedCustomers(assignedCustomersIds);
            setAssignmentLoading(false);
            return; // Exit early if successful
          } else {
            debugLog({
              title: 'Error Fetching Coach Customers',
              data: { 
                status: response.status,
                statusText: response.statusText
              },
              error: true
            });
          }
        }
      }
      
      // Fallback: Try using the user ID directly if the above approach fails
      debugLog({
        title: 'Trying Fallback - Direct User ID',
        data: { endpoint: `/api/admin/coaches/${coach._id}/customers` }
      });
      
      const response = await logApiCall(`/api/admin/coaches/${coach._id}/customers`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      }, 'Coach Customers Fallback API');
      
      if (response.ok) {
        const data = await response.json();
        assignedCustomersIds = data.customers || [];
        
        debugLog({
          title: 'Coach Customers Received (Fallback)',
          data: { 
            customersCount: assignedCustomersIds.length,
            customers: assignedCustomersIds
          }
        });
        
        setAssignedCustomers(assignedCustomersIds);
      } else {
        // If the endpoint fails, try a fallback approach
        debugLog({
          title: 'Error Fetching Assigned Customers',
          data: { 
            status: response.status,
            statusText: response.statusText
          },
          error: true
        });
        
        console.error('Error fetching assigned customers');
        try {
          // Try alternative endpoint format if available
          debugLog({
            title: 'Trying Second Fallback',
            data: { endpoint: `/api/coach/${coach._id}` }
          });
          
          const fallbackResponse = await logApiCall(`/api/coach/${coach._id}`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          }, 'Coach API Fallback');
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setAssignedCustomers(fallbackData.customers || []);
            
            debugLog({
              title: 'Coach Data Received (Second Fallback)',
              data: { 
                customersCount: fallbackData.customers?.length || 0
              }
            });
          } else {
            setAssignedCustomers([]);
            
            debugLog({
              title: 'All Fallbacks Failed',
              data: { 
                status: fallbackResponse.status,
                statusText: fallbackResponse.statusText
              },
              error: true
            });
            
            toast.error('No se pudieron cargar los clientes asignados al coach');
          }
        } catch (fallbackError) {
          setAssignedCustomers([]);
          
          debugLog({
            title: 'Fallback Exception',
            data: fallbackError,
            error: true
          });
          
          toast.error('No se pudieron cargar los clientes asignados al coach');
        }
      }
    } catch (error) {
      console.error('Error fetching assigned customers:', error);
      
      debugLog({
        title: 'Exception in handleSelectCoach',
        data: error,
        error: true
      });
      
      setAssignedCustomers([]);
      toast.error('No se pudieron cargar los clientes asignados al coach');
    } finally {
      setAssignmentLoading(false);
    }
  }, [status]);

  const handleSelectCustomers = useCallback((customerIds: string[]) => {
    setSelectedCustomers(customerIds);
  }, []);

  const assignCustomersToCoach = useCallback(async () => {
    if (!selectedCoach || selectedCustomers.length === 0) return;
    
    if (status !== 'authenticated') {
      debugLog({ 
        title: 'Assign Customers - Not Authenticated',
        data: { status },
        error: true,
        session
      });
      
      toast.error('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
      return;
    }
    
    setAssignmentLoading(true);
    debugLog({
      title: 'Assigning Customers to Coach',
      data: { 
        coachId: selectedCoach._id,
        customerCount: selectedCustomers.length
      }
    });
    
    try {
      // First, find the coach document ID if it exists
      let coachDocId = selectedCoach._id;
      
      const coachResponse = await logApiCall('/api/admin/coaches', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      }, 'Coaches API (Assignment)');
      
      if (coachResponse.ok) {
        const coachesData = await coachResponse.json();
        
        debugLog({
          title: 'Coaches Data for Assignment',
          data: { coachesCount: coachesData.length }
        });
        
        // Find the coach document that matches our selected coach's user ID
        const coachDoc = coachesData.find((c: any) => 
          c.userId && (c.userId._id === selectedCoach._id || c.userId === selectedCoach._id)
        );
        
        if (coachDoc && coachDoc._id) {
          coachDocId = coachDoc._id;
          
          debugLog({
            title: 'Coach Document Found for Assignment',
            data: { 
              coachDocId,
              originalId: selectedCoach._id
            }
          });
        }
      }
      
      // Use the coach document ID for the API call
      debugLog({
        title: 'Calling Assign Customers API',
        data: { 
          endpoint: '/api/admin/coach/assign-customers',
          coachId: selectedCoach._id,
          customerCount: selectedCustomers.length
        }
      });
      
      const response = await logApiCall('/api/admin/coach/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          coachId: selectedCoach._id, // User ID is what the API expects
          customerIds: selectedCustomers,
        }),
        credentials: 'include'
      }, 'Assign Customers API');
      
      if (!response.ok) {
        // Check for specific error types
        if (response.status === 401) {
          throw new Error('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para realizar esta acción.');
        } else {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Failed to assign customers: ${response.status} ${response.statusText} ${errorText}`);
        }
      }
      
      // Refresh the list of assigned customers using the document ID if available
      if (selectedCoach) {
        // Try to get the updated list with the correct ID
        debugLog({
          title: 'Refreshing Assigned Customers',
          data: { endpoint: `/api/admin/coaches/${coachDocId}/customers` }
        });
        
        const customerResponse = await logApiCall(`/api/admin/coaches/${coachDocId}/customers`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }, 'Refresh Customers API');
        
        if (customerResponse.ok) {
          const data = await customerResponse.json();
          setAssignedCustomers(data.customers || []);
          
          debugLog({
            title: 'Updated Customers List Received',
            data: { customersCount: data.customers?.length || 0 }
          });
        } else {
          // Fallback to using the user ID directly
          debugLog({
            title: 'Fallback to User ID for Refresh',
            data: { endpoint: `/api/admin/coaches/${selectedCoach._id}/customers` }
          });
          
          const fallbackResponse = await logApiCall(`/api/admin/coaches/${selectedCoach._id}/customers`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          }, 'Refresh Customers Fallback API');
          
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            setAssignedCustomers(data.customers || []);
            
            debugLog({
              title: 'Updated Customers List Received (Fallback)',
              data: { customersCount: data.customers?.length || 0 }
            });
          }
        }
      }
      
      toast.success(`${selectedCustomers.length} clientes asignados a ${selectedCoach.name}`);
      setSelectedCustomers([]);
      // Close the modal after successful assignment
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error('Error assigning customers:', error);
      
      debugLog({
        title: 'Error Assigning Customers',
        data: error instanceof Error ? error.message : error,
        error: true
      });
      
      toast.error(error instanceof Error ? error.message : 'Error al asignar clientes');
    } finally {
      setAssignmentLoading(false);
    }
  }, [selectedCoach, selectedCustomers, status, session]);

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

  // Add this function to close the modal
  const handleCloseModal = useCallback(() => {
    debugLog({
      title: 'Modal Closed',
      data: {
        previouslySelectedCoach: selectedCoach ? {
          id: selectedCoach._id,
          name: selectedCoach.name
        } : null
      }
    });
    
    setIsAssignModalOpen(false);
    setSelectedCoach(null); // Reset the selected coach when modal is closed
  }, [selectedCoach]);

  // Run diagnostic tests
  const handleRunTests = useCallback(async () => {
    debugLog({
      title: 'Running API Tests',
      data: { session },
    });
    
    setLoading(true);
    try {
      const results = await runApiTests();
      if (results.some(r => !r.success)) {
        toast.error('Some API tests failed. Check console for details.');
      } else {
        toast.success('All API tests passed!');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Error running API tests');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setIsDebugMode(prev => !prev);
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
      
      {/* Debug button - only show in development */}
      {isDevelopment && (
        <button
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
          onClick={handleRunTests}
        >
          Run API Tests
        </button>
      )}
    </div>
  ), [currentView, handleViewChange, isDevelopment, handleRunTests]);

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
                Selecciona un coach de la lista para asignarle clientes.
              </p>
            </div>
            
            <UserList 
              users={users.filter(user => user.roles.includes('coach'))} 
              onSelectCoach={handleSelectCoach}
              selectedCoach={selectedCoach?._id}
            />
            
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
    renderPagination,
    handleSelectCoach
  ]);

  return (
    <div className="space-y-6">
      {renderNavigation}
      {renderContent()}
      
      {/* Add the modal at the end */}
      <AssignCustomersModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseModal}
        coach={selectedCoach}
        allCustomers={users}
        assignedCustomerIds={assignedCustomers}
      />
    </div>
  );
} 