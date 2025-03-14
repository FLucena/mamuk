'use client';

import { Fragment, useState, useEffect, memo, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { UserPlus, Search } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId: string) => void;
  existingCustomerIds: string[];
}

// Memoize the AddCustomerModal component to prevent unnecessary re-renders
export default memo(function AddCustomerModal({
  isOpen,
  onClose,
  onConfirm,
  existingCustomerIds,
}: AddCustomerModalProps) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define searchCustomers function
  const searchCustomers = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users?role=customer&search=${searchTerm}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      
      // Check if the response has the new structure with pagination
      const customersList = data.users ? data.users : data;
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error searching customers:', error);
      setError('Error al buscar clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedCustomerId(null);
      setSearchTerm('');
      if (searchTerm.trim() === '') {
        searchCustomers(searchTerm);
      }
    }
  }, [isOpen, searchTerm, searchCustomers]);

  useEffect(() => {
    if (isOpen) {
      searchCustomers(searchTerm);
    }
  }, [isOpen, searchTerm, searchCustomers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomerId) {
      onConfirm(selectedCustomerId);
    }
  };

  // Get filtered customers
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                >
                  <UserPlus className="mr-2 h-5 w-5" /> Agregar Cliente
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selecciona un cliente para asignar a este coach.
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
                  ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No se encontraron clientes con ese término de búsqueda' : 'No hay clientes disponibles para asignar'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedCustomerId === customer._id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                          }`}
                          onClick={() => setSelectedCustomerId(customer._id)}
                        >
                          <input
                            type="radio"
                            name="customer"
                            value={customer._id}
                            checked={selectedCustomerId === customer._id}
                            onChange={() => setSelectedCustomerId(customer._id)}
                            className="sr-only"
                          />
                          <div className="flex items-center flex-1">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={!selectedCustomerId}
                  >
                    Agregar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});