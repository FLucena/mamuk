'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import EditCoachModal from './EditCoachModal';
import DeleteCoachModal from './DeleteCoachModal';
import Image from 'next/image';
import { MongoUser } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Coach extends MongoUser {
  specialties?: string[];
  bio?: string;
  customers?: string[];
}

interface CoachListProps {
  users?: MongoUser[];
  isLoading?: boolean;
}

export default function CoachList({ users = [], isLoading = false }: CoachListProps) {
  const router = useRouter();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const coaches = users.filter(user => user.role === 'coach') as Coach[];
  const filteredCoaches = coaches.filter(coach => 
    coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowEditModal(true);
  };

  const handleDeleteClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowDeleteModal(true);
  };

  const handleEditConfirm = async (data: {
    specialties: string[];
    biography: string;
  }) => {
    if (!selectedCoach) return;

    try {
      const response = await fetch(`/api/admin/coaches/${selectedCoach._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialties: data.specialties,
          bio: data.biography
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el coach');
      }

      router.refresh();
      setShowEditModal(false);
      setSelectedCoach(null);
    } catch (error) {
      console.error('Error al actualizar el coach:', error);
      // TODO: Show error toast
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoach) return;

    try {
      const response = await fetch(`/api/admin/coaches/${selectedCoach._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el coach');
      }

      router.refresh();
      setShowDeleteModal(false);
      setSelectedCoach(null);
    } catch (error) {
      console.error('Error al eliminar el coach:', error);
      // TODO: Show error toast
    }
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
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Buscar coaches..."
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
          <button
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Añadir Coach
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coach
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCoaches.map((coach) => (
              <tr key={coach._id}>
                <td className="px-6 py-4 whitespace-nowrap">
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
                          <FiUser className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {coach.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">{coach.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(coach)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                  >
                    <FiEdit2 className="inline-block w-4 h-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(coach)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    <FiTrash2 className="inline-block w-4 h-4 mr-1" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCoach && (
        <>
          <EditCoachModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCoach(null);
            }}
            onConfirm={handleEditConfirm}
            coach={selectedCoach}
          />

          <DeleteCoachModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCoach(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
} 