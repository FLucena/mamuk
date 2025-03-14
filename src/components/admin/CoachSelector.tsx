import { useState, useEffect } from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/lib/types/user';

interface Coach {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  specialties?: string[];
  bio?: string;
}

interface CoachSelectorProps {
  onCoachSelect: (coach: User) => void;
}

export default function CoachSelector({ onCoachSelect }: CoachSelectorProps) {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/coaches');
      
      if (!response.ok) {
        throw new Error('Error al cargar los coaches');
      }
      
      const data = await response.json();
      
      // Transformar los datos de los coaches al formato User
      const formattedCoaches: User[] = data.map((coach: Coach) => ({
        _id: coach.userId._id,
        name: coach.userId.name || 'Sin nombre',
        email: coach.userId.email || 'Sin email',
        roles: ['coach'],
        image: coach.userId.image || null,
      }));
      
      setCoaches(formattedCoaches);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setError('Error al cargar los coaches');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter coaches based on search term
  const filteredCoaches = coaches.filter(coach => {
    const searchLower = searchTerm.toLowerCase();
    return (
      coach.name?.toLowerCase().includes(searchLower) ||
      coach.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Seleccionar Coach
      </h2>
      
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            placeholder="Buscar coaches..."
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
        ) : filteredCoaches.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron coaches con ese término de búsqueda' : 'No hay coaches disponibles'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCoaches.map((coach) => (
              <li 
                key={coach._id} 
                className="py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                onClick={() => onCoachSelect(coach)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {coach.image ? (
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={coach.image}
                        alt={coach.name || ''}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{coach.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{coach.email}</p>
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