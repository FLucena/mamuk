import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Search, UserPlus } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Coach {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AssignCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach;
  onAssign: (coachId: string, customerIds: string[]) => Promise<void>;
}

export default function AssignCustomerModal({
  isOpen,
  onClose,
  coach,
  onAssign
}: AssignCustomerModalProps) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      setSelectedCustomers([]);
    }
  }, [isOpen]);

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/users?role=customer');
      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Error al cargar clientes. Por favor, intenta de nuevo.');
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle assignment
  const handleAssign = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Por favor, selecciona al menos un cliente');
      return;
    }

    try {
      setIsLoading(true);
      await onAssign(coach.id, selectedCustomers);
      toast.success('Clientes asignados correctamente');
      onClose();
    } catch (err) {
      console.error('Error assigning customers:', err);
      toast.error('Error al asignar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle customer selection
  const toggleCustomer = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                    <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Asignar Clientes a {coach.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Selecciona los clientes que deseas asignar a este coach.
                      </p>
                    </div>

                    <div className="mt-4">
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

                    <div className="mt-4 max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : error ? (
                        <div className="text-center py-4 text-red-500">{error}</div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No se encontraron clientes con ese término de búsqueda' : 'No hay clientes disponibles'}
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredCustomers.map((customer) => (
                            <li key={customer._id} className="py-4">
                              <div className="flex items-center">
                                <input
                                  id={`customer-${customer._id}`}
                                  name={`customer-${customer._id}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={selectedCustomers.includes(customer._id)}
                                  onChange={() => toggleCustomer(customer._id)}
                                  aria-label={`Seleccionar cliente ${customer.name}`}
                                />
                                <label htmlFor={`customer-${customer._id}`} className="ml-3 cursor-pointer">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                                </label>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAssign}
                  disabled={isLoading || selectedCustomers.length === 0}
                >
                  {isLoading ? 'Asignando...' : 'Asignar'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 