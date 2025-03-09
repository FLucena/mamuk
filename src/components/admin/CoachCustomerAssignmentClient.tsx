'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MongoUser } from '@/lib/types/user';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AssignCustomerModal from './AssignCustomerModal';
import { CoachDocument } from '@/lib/services/coach';

interface CoachCustomerAssignmentClientProps {
  coaches: CoachDocument[];
  customers: MongoUser[];
  adminAndCoachUsers: MongoUser[];
}

export default function CoachCustomerAssignmentClient({ 
  coaches: initialCoaches, 
  customers,
  adminAndCoachUsers
}: CoachCustomerAssignmentClientProps) {
  const [coaches, setCoaches] = useState<CoachDocument[]>(initialCoaches);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachDocument | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAssignCustomers = (coach: CoachDocument) => {
    setSelectedCoach(coach);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (coachId: string, customerIds: string[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    
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

      // Refresh coach data after successful assignment
      const updatedCoachResponse = await fetch(`/api/admin/coaches/${coachId}`);
      if (updatedCoachResponse.ok) {
        const updatedCoach = await updatedCoachResponse.json();
        
        // Update the coaches state with the updated coach
        setCoaches(prevCoaches => 
          prevCoaches.map(coach => 
            coach._id === coachId ? updatedCoach : coach
          )
        );
      }

      toast.success('Clientes asignados correctamente');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        setErrorMessage('Error al asignar clientes');
        toast.error('Error al asignar clientes');
      }
      console.error('Error assigning customers:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Filter admin and coach users based on search term
  const filteredUsers = adminAndCoachUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the coach document for a user if it exists
  const findCoachForUser = (userId: string) => {
    return coaches.find(coach => 
      typeof coach.userId === 'object' && coach.userId._id === userId
    );
  };

  if (isLoading) {
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
            placeholder="Buscar usuarios..."
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
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No se encontraron usuarios con ese criterio de búsqueda.' : 'No hay usuarios disponibles.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const coach = findCoachForUser(user._id);
            
            return (
              <div key={user._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      {user.image ? (
                        <Image
                          className="h-12 w-12 rounded-full"
                          src={user.image}
                          alt={user.name || ''}
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
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Entrenador'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {user.role === 'coach' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                          <Icon icon="FiUsers" className="mr-2" /> 
                          Clientes asignados ({coach?.customers?.length || 0})
                        </h4>
                        <button
                          onClick={() => coach ? handleAssignCustomers(coach) : null}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white ${
                            coach 
                              ? 'bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700' 
                              : 'bg-gray-400 cursor-not-allowed'
                          } transition ease-in-out duration-150`}
                          disabled={!coach}
                        >
                          <Icon icon="FiUserPlus" className="mr-1" /> Asignar
                        </button>
                      </div>
                      
                      {coach && coach.customers && coach.customers.length > 0 ? (
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
                          {coach ? 'No hay clientes asignados' : 'No se encontró información de coach'}
                        </div>
                      )}
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Los administradores no tienen clientes asignados
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCoach && (
        <AssignCustomerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          coach={{
            id: selectedCoach._id,
            name: typeof selectedCoach.userId === 'object' ? selectedCoach.userId.name || '' : '',
            email: typeof selectedCoach.userId === 'object' ? selectedCoach.userId.email || '' : '',
            image: typeof selectedCoach.userId === 'object' ? selectedCoach.userId.image : undefined
          }}
          onAssign={handleAssignSubmit}
        />
      )}
    </div>
  );
} 