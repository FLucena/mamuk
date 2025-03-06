'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiCalendar, FiTrash2 } from 'react-icons/fi';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coach.customers.map((customer) => (
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

      {coach.customers.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          No tienes clientes asignados aún.
        </div>
      )}
    </div>
  );
} 