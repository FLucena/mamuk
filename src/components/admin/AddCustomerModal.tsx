'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiUserPlus, FiSearch } from 'react-icons/fi';

interface User {
  id: string;
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

export default function AddCustomerModal({
  isOpen,
  onClose,
  onConfirm,
  existingCustomerIds,
}: AddCustomerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && searchTerm.length >= 3) {
      const searchCustomers = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/admin/users?role=customer&search=${searchTerm}`);
          if (!response.ok) {
            throw new Error('Error buscando clientes');
          }
          const data = await response.json();
          setCustomers(data.filter((user: User) => !existingCustomerIds.includes(user.id)));
        } catch (error) {
          console.error('Error:', error);
          // TODO: Mostrar error al usuario
        } finally {
          setIsLoading(false);
        }
      };

      const debounce = setTimeout(searchCustomers, 300);
      return () => clearTimeout(debounce);
    }
  }, [isOpen, searchTerm, existingCustomerIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomerId) {
      onConfirm(selectedCustomerId);
    }
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <div className="flex items-center justify-center mb-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <FiUserPlus
                      className="h-6 w-6 text-blue-600 dark:text-blue-200"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 text-center mb-4"
                >
                  Agregar Cliente
                </Dialog.Title>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar cliente por nombre o email..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="mb-6 max-h-60 overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        Buscando...
                      </div>
                    ) : customers.length > 0 ? (
                      <div className="space-y-2">
                        {customers.map((customer) => (
                          <label
                            key={customer.id}
                            className={`flex items-center p-3 rounded-lg cursor-pointer ${
                              selectedCustomerId === customer.id
                                ? 'bg-blue-50 dark:bg-blue-900'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="customer"
                              value={customer.id}
                              checked={selectedCustomerId === customer.id}
                              onChange={() => setSelectedCustomerId(customer.id)}
                              className="sr-only"
                            />
                            <div className="flex items-center flex-1">
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {customer.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                selectedCustomerId === customer.id
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                          </label>
                        ))}
                      </div>
                    ) : searchTerm.length >= 3 ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No se encontraron clientes.
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        Ingresa al menos 3 caracteres para buscar.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      type="submit"
                      disabled={!selectedCustomerId}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 