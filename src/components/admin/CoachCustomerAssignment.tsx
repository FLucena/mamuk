'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MongoUser } from '@/lib/types/user';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AssignCustomerModal from './AssignCustomerModal';

interface CoachWithCustomers extends MongoUser {
  customers?: MongoUser[];
}

interface CoachCustomerAssignmentProps {
  users: MongoUser[];
  isLoading?: boolean;
}

export default function CoachCustomerAssignment({ users, isLoading = false }: CoachCustomerAssignmentProps) {
  const [coaches, setCoaches] = useState<CoachWithCustomers[]>([]);
  const [customers, setCustomers] = useState<MongoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<CoachWithCustomers | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && users.length > 0) {
      const coachUsers = users.filter(user => user.role === 'coach');
      const customerUsers = users.filter(user => user.role === 'customer');
      
      fetchCoachesWithCustomers(coachUsers);
      setCustomers(customerUsers);
    }
  }, [users, isLoading]);

  const fetchCoachesWithCustomers = async (coachUsers: MongoUser[]) => {
    if (coachUsers.length === 0) {
      setLoading(false);
      setCoaches([]);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    
    try {
      const coachesWithCustomersPromises = coachUsers.map(async (coach) => {
        try {
          const response = await fetch(`/api/admin/coaches/${coach._id}`);
          
          // Handle non-OK responses
          if (!response.ok) {
            // Try to parse error message from response
            let errorMsg = `Error fetching coach ${coach._id}`;
            try {
              const errorData = await response.json();
              if (errorData.error) {
                errorMsg = errorData.error;
              }
            } catch (e) {
              // If we can't parse JSON, use status text
              errorMsg = response.statusText || errorMsg;
            }
            
            console.warn(`Coach data fetch warning: ${errorMsg}`);
            
            // Return coach with empty customers array
            return {
              ...coach,
              customers: []
            };
          }
          
          const coachData = await response.json();
          
          return {
            ...coach,
            customers: coachData.customers || []
          };
        } catch (error) {
          console.error(`Error fetching coach ${coach._id}:`, error);
          // Don't throw, just return coach with empty customers
          return {
            ...coach,
            customers: []
          };
        }
      });

      const coachesWithCustomers = await Promise.all(coachesWithCustomersPromises);
      setCoaches(coachesWithCustomers);
    } catch (error) {
      console.error('Error fetching coaches with customers:', error);
      setErrorMessage('Error al cargar los coaches con sus clientes. Por favor, intenta de nuevo.');
      toast.error('Error al cargar los coaches con sus clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCustomers = (coach: CoachWithCustomers) => {
    setSelectedCoach(coach);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (coachId: string, customerIds: string[]) => {
    try {
      const response = await fetch('/api/admin/coach/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachId, customerIds }),
      });

      if (!response.ok) {
        let errorMsg = 'Error al asignar clientes';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // If we can't parse JSON, use status text
          errorMsg = response.statusText || errorMsg;
        }
        
        throw new Error(errorMsg);
      }

      toast.success('Clientes asignados correctamente');
      
      // Refresh coaches data
      const coachUsers = users.filter(user => user.role === 'coach');
      await fetchCoachesWithCustomers(coachUsers);
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al asignar clientes');
      }
      console.error('Error assigning customers:', error);
      return false;
    }
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Buscar coaches..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{errorMessage}</p>
          <button 
            onClick={() => {
              const coachUsers = users.filter(user => user.role === 'coach');
              fetchCoachesWithCustomers(coachUsers);
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {filteredCoaches.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No se encontraron coaches con ese criterio de búsqueda.' : 'No hay coaches disponibles.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => (
            <div key={coach._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0">
                    {coach.image ? (
                      <Image
                        className="h-12 w-12 rounded-full"
                        src={coach.image}
                        alt={coach.name || ''}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Icon icon="FiUser" className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{coach.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{coach.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                    <Icon icon="FiUsers" className="mr-2" /> 
                    Clientes asignados ({coach.customers?.length || 0})
                  </h4>
                  <button
                    onClick={() => handleAssignCustomers(coach)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                  >
                    <Icon icon="FiUserPlus" className="mr-1" /> Asignar
                  </button>
                </div>
                
                {coach.customers && coach.customers.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-48 overflow-y-auto">
                    {coach.customers.map((customer) => (
                      <li key={customer._id} className="py-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            {customer.image ? (
                              <Image
                                className="h-8 w-8 rounded-full"
                                src={customer.image}
                                alt={customer.name || ''}
                                width={32}
                                height={32}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <Icon icon="FiUser" className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No hay clientes asignados
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCoach && (
        <AssignCustomerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          coach={{
            id: selectedCoach._id,
            name: selectedCoach.name || '',
            email: selectedCoach.email || '',
            image: selectedCoach.image
          }}
          onAssign={handleAssignSubmit}
        />
      )}
    </div>
  );
} 