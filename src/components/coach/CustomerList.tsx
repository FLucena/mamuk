'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { Search } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface Coach {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  customers: Customer[];
}

interface CustomerListProps {
  coach: Coach;
}

export default function CustomerList({ coach }: CustomerListProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRemoveCustomer = async (customerId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/coach/${coach._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          action: 'remove',
        }),
      });

      if (!response.ok) {
        throw new Error('Error removiendo cliente');
      }

      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = coach.customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda.' : 'No hay clientes asignados a este coach.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                {customer.image ? (
                  <img
                    src={customer.image}
                    alt={customer.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiMail className="w-4 h-4 mr-1" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/coach/customers/${customer._id}/workout`}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiCalendar className="w-4 h-4 mr-2" />
                  Ver Rutinas
                </Link>

                <button
                  onClick={() => handleRemoveCustomer(customer._id)}
                  disabled={isLoading}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Eliminar Cliente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 