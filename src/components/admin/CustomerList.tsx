import { Search, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/lib/types/user';
import RobustImage from '@/components/ui/RobustImage';

interface CustomerListProps {
  customers: User[];
  selectedCustomers: string[];
  onToggleCustomer: (customerId: string) => void;
  onSearchChange: (term: string) => void;
  searchTerm: string;
  isLoading: boolean;
}

export default function CustomerList({
  customers,
  selectedCustomers,
  onToggleCustomer,
  onSearchChange,
  searchTerm,
  isLoading
}: CustomerListProps) {
  return (
    <div className="w-full">
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron clientes con ese término de búsqueda' : 'No hay clientes disponibles'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {customers.map((customer) => (
              <li 
                key={customer._id} 
                className="py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md px-2"
                onClick={() => onToggleCustomer(customer._id)}
              >
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer._id)}
                  onChange={() => onToggleCustomer(customer._id)}
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 