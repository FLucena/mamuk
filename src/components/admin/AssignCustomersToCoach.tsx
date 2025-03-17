'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User } from '@/lib/types/user';
import CoachSelector from './CoachSelector';
import CustomerList from './CustomerList';
import { AlertCircle, Check } from 'lucide-react';

export default function AssignCustomersToCoach() {
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCoachSelect = (coach: User) => {
    setSelectedCoach(coach);
  };

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users?role=customer');
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      
      // Check if the response has the new structure with pagination
      const customersList = data.users ? data.users : data;
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleAssignSubmit = async () => {
    if (!selectedCoach) {
      toast.error('Por favor, selecciona un coach');
      return;
    }

    if (selectedCustomers.length === 0) {
      toast.error('Por favor, selecciona al menos un cliente');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/coach/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          coachId: selectedCoach._id, 
          customerIds: selectedCustomers 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asignar clientes');
      }

      toast.success('Clientes asignados correctamente');
      // Reset selected customers after successful assignment
      setSelectedCustomers([]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al asignar clientes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coach selection column */}
        <div className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-6 md:pb-0 md:pr-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Selecciona un Coach
          </h2>
          <CoachSelector onCoachSelect={handleCoachSelect} />
          
          {selectedCoach && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Coach seleccionado: <span className="font-medium">{selectedCoach.name}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Customer selection column */}
        <div className="pt-6 md:pt-0 md:pl-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Selecciona Clientes
          </h2>
          
          <CustomerList 
            customers={filteredCustomers}
            selectedCustomers={selectedCustomers}
            onToggleCustomer={handleCustomerToggle}
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
            isLoading={isLoading}
          />
          
          {selectedCustomers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">{selectedCustomers.length}</span> cliente(s) seleccionado(s)
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            {(!selectedCoach || selectedCustomers.length === 0) && (
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="text-sm">
                  {!selectedCoach 
                    ? 'Selecciona un coach para continuar' 
                    : 'Selecciona al menos un cliente para continuar'}
                </p>
              </div>
            )}
          </div>
          
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            disabled={!selectedCoach || selectedCustomers.length === 0 || isLoading}
            onClick={handleAssignSubmit}
          >
            {isLoading ? 'Guardando...' : 'Guardar Asignación'}
          </button>
        </div>
      </div>
    </div>
  );
} 