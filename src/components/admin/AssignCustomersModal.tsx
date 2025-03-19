'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Search, User as UserIcon, Bug } from 'lucide-react';
import { User } from '@/lib/types/user';
import RobustImage from '@/components/ui/RobustImage';
import { toast } from 'react-hot-toast';
import { debugLog } from '@/lib/utils/debugLogger';
import { testAssignCustomersFlow } from '@/lib/test/api-test';
import { ensureValidSession } from '@/lib/utils/session';

// Check if we're in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

interface AssignCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: User | null;
  allCustomers: User[];
  assignedCustomerIds: string[];
}

export default function AssignCustomersModal({
  isOpen,
  onClose,
  coach,
  allCustomers,
  assignedCustomerIds = []
}: AssignCustomersModalProps) {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    // Make sure we have customers to filter
    if (!allCustomers || allCustomers.length === 0) return [];
    
    return allCustomers.filter(customer => {
      // Only show users with customer role who aren't already assigned to this coach
      if (!customer.roles?.includes('customer') || 
          (assignedCustomerIds.includes(customer._id) && !selectedCustomerIds.includes(customer._id))) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (customer.name?.toLowerCase().includes(searchLower)) ||
          (customer.email?.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [allCustomers, assignedCustomerIds, selectedCustomerIds, searchTerm]);

  // Reset selection when coach changes
  useEffect(() => {
    setSelectedCustomerIds([]);
  }, [coach]);

  // Toggle selection of a customer
  const toggleCustomer = useCallback((customerId: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  }, []);

  // Handle assignment of selected customers
  const handleAssign = useCallback(async () => {
    if (!coach || selectedCustomerIds.length === 0) return;
    
    // Validate session before proceeding with API call
    const isValid = await ensureValidSession();
    if (!isValid) return;
    
    setIsLoading(true);
    
    debugLog({
      title: 'Assigning Customers',
      data: {
        coachId: coach._id,
        coachName: coach.name,
        customerCount: selectedCustomerIds.length,
        customerIds: selectedCustomerIds,
      }
    });
    
    try {
      const response = await fetch('/api/admin/coach/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          coachId: coach._id,
          customerIds: selectedCustomerIds,
        }),
        credentials: 'include'
      });
      
      debugLog({
        title: 'Assignment Response',
        data: {
          status: response.status,
          statusText: response.statusText,
        }
      });
      
      if (!response.ok) {
        // Specific error handling based on status code
        let errorMessage = 'Failed to assign customers';
        
        if (response.status === 401) {
          errorMessage = 'Tu sesión ha caducado. Por favor, inicia sesión de nuevo.';
          // You might want to redirect to login page here if using client-side routing
          window.location.href = '/auth/signin'; // Force a redirect to the login page
          return; // Exit early
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (response.status === 404) {
          errorMessage = 'El endpoint de asignación no se encontró.';
        } else if (response.status === 500) {
          errorMessage = 'Error del servidor al procesar la asignación.';
        }
        
        const responseText = await response.text().catch(() => '');
        debugLog({
          title: 'Assignment Error',
          data: {
            status: response.status,
            statusText: response.statusText,
            responseText
          },
          error: true
        });
        
        throw new Error(errorMessage);
      }
      
      toast.success(`${selectedCustomerIds.length} clientes asignados a ${coach.name}`);
      onClose();
    } catch (error) {
      console.error('Error assigning customers:', error);
      
      debugLog({
        title: 'Assignment Exception',
        data: error instanceof Error ? error.message : error,
        error: true
      });
      
      toast.error(error instanceof Error ? error.message : 'Error al asignar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [coach, selectedCustomerIds, onClose]);

  // Run API tests
  const handleRunTests = useCallback(async () => {
    if (!coach) return;
    
    debugLog({
      title: 'Running API Tests for Coach',
      data: {
        coachId: coach._id,
        coachName: coach.name
      }
    });
    
    try {
      setIsLoading(true);
      const results = await testAssignCustomersFlow(coach._id);
      
      if (results.summary.fail > 0) {
        toast.error(`Tests: ${results.summary.fail} of ${results.summary.total} failed`);
      } else {
        toast.success(`Tests: All ${results.summary.total} endpoints passed`);
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Error running API tests');
    } finally {
      setIsLoading(false);
    }
  }, [coach]);

  // Toggle debug mode
  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);

  if (!isOpen || !coach) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        {/* Modal content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-10">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Asignar Clientes a {coach.name}
            </h2>
            <div className="flex items-center">
              {isDevelopment && (
                <button 
                  onClick={toggleDebug}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-3"
                  aria-label="Toggle debug mode"
                >
                  <Bug className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Debug Panel - only show in development */}
          {isDevelopment && showDebug && (
            <div className="px-6 py-2 bg-gray-100 dark:bg-gray-900 text-xs">
              <div className="overflow-x-auto">
                <p className="font-mono mb-1">Coach ID: {coach._id}</p>
                <p className="font-mono mb-1">Assigned customers: {assignedCustomerIds.length}</p>
                <p className="font-mono mb-1">Selected customers: {selectedCustomerIds.length}</p>
                <button
                  onClick={handleRunTests}
                  disabled={isLoading}
                  className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Run API Tests
                </button>
              </div>
            </div>
          )}
          
          {/* Body */}
          <div className="p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Customer List */}
            <div className="mt-4 max-h-96 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron clientes con ese término de búsqueda' : 'No hay clientes disponibles'}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <li 
                      key={customer._id} 
                      className="py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md px-2"
                      onClick={() => toggleCustomer(customer._id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(customer._id)}
                        onChange={() => toggleCustomer(customer._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Seleccionar ${customer.name || 'cliente'}`}
                      />
                      
                      <div className="ml-3 flex items-center flex-1">
                        <div className="h-8 w-8 flex-shrink-0">
                          {customer.image ? (
                            <RobustImage
                              className="h-8 w-8 rounded-full"
                              src={customer.image}
                              alt={customer.name || ''}
                              width={32}
                              height={32}
                              fallbackSrc="/user-placeholder.png"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email || 'Sin email'}</p>
                        </div>
                        
                        {assignedCustomerIds.includes(customer._id) && !selectedCustomerIds.includes(customer._id) && (
                          <span className="ml-auto px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Ya asignado
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedCustomerIds.length === 0 || isLoading}
              className={`px-4 py-2 rounded-md text-white ${
                selectedCustomerIds.length === 0 || isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Asignando...
                </span>
              ) : (
                `Asignar ${selectedCustomerIds.length} clientes`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 