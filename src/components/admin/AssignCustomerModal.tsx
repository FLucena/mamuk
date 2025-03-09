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
  onAssign: (coachId: string, customerIds: string[]) => Promise<boolean | void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      setSelectedCustomers([]);
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users?role=customer');
      if (!response.ok) {
        throw new Error('Error al obtener los clientes');
      }
      const data = await response.json();
      // Ensure we only have customers
      const onlyCustomers = data.filter((user: User) => user.role === 'customer');
      setCustomers(onlyCustomers);
    } catch (error) {
      toast.error('Error al cargar los clientes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Selecciona al menos un cliente');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAssign(coach.id, selectedCustomers);
      if (result !== false) {
        onClose();
      }
    } catch (error) {
      toast.error('Error al asignar clientes');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Asignar Clientes a {coach.name}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Selecciona los clientes que deseas asignar a este entrenador.
                  </p>
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 dark:text-gray-300">Cargando clientes...</p>
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        {searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda.' : 'No hay clientes disponibles.'}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCustomers.map((customer) => (
                          <li key={customer._id} className="py-3">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={selectedCustomers.includes(customer._id)}
                                onChange={() => toggleCustomer(customer._id)}
                              />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleAssign}
              disabled={isSubmitting || selectedCustomers.length === 0}
            >
              {isSubmitting ? 'Asignando...' : 'Asignar Clientes'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 