'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Edit2, Trash2, UserPlus } from 'lucide-react';
import EditCoachModal from './EditCoachModal';
import DeleteCoachModal from './DeleteCoachModal';
import { User } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import AssignCustomerModal from './AssignCustomerModal';
import RobustImage from '@/components/ui/RobustImage';
import { ensureValidSession, authorizedFetch } from '@/lib/utils/session';

interface Coach extends User {
  specialties?: string[];
  bio?: string;
  customers?: string[];
}

interface CoachListProps {
  users?: User[];
  isLoading?: boolean;
}

// Memoize the CoachList component to prevent unnecessary re-renders
export default memo(function CoachList({ users = [], isLoading = false }: CoachListProps) {
  const router = useRouter();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const coaches = users.filter(user => user.roles?.includes('coach')) as Coach[];
  const filteredCoaches = coaches.filter(coach => 
    coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = useCallback((coach: Coach) => {
    setSelectedCoach(coach);
    setShowEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((coach: Coach) => {
    setSelectedCoach(coach);
    setShowDeleteModal(true);
  }, []);

  const handleEditConfirm = async (data: {
    specialties: string[];
    biography: string;
  }): Promise<boolean> => {
    if (!selectedCoach) return false;

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el coach');
      }

      router.refresh();
      setShowEditModal(false);
      setSelectedCoach(null);
      
      return true;
    } catch (error) {
      console.error('Error al actualizar el coach:', error);
      // TODO: Show error toast
      return false;
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

  const handleAssignCustomers = async (coach: Coach) => {
    // Validate session before proceeding
    const isValid = await ensureValidSession();
    if (!isValid) {
      return; // Session validation will handle redirect if needed
    }
    
    setSelectedCoach(coach);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (coachId: string, customerIds: string[]) => {
    try {
      const response = await authorizedFetch('/api/admin/coach/assign-customers', {
        method: 'POST',
        body: JSON.stringify({ coachId, customerIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al asignar clientes');
      }

      toast.success('Clientes asignados correctamente');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al asignar clientes');
      }
      throw error;
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
              id="coach-search"
              name="coach-search"
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
                        <RobustImage
                          className="h-10 w-10 rounded-full"
                          src={coach.image}
                          alt={coach.name || ''}
                          width={40}
                          height={40}
                          fallbackSrc="/user-placeholder.png"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" />
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
                    title="Editar"
                    aria-label="Editar coach"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(coach)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-4"
                    title="Eliminar"
                    aria-label="Eliminar coach"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleAssignCustomers(coach)}
                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                    title="Asignar Clientes"
                    aria-label="Asignar clientes al coach"
                  >
                    <UserPlus className="w-5 h-5" />
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

          <AssignCustomerModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            coach={{
              id: selectedCoach._id || '',
              name: selectedCoach.name || '',
              email: selectedCoach.email || '',
              image: selectedCoach.image
            }}
            onAssign={handleAssignSubmit}
          />
        </>
      )}
    </div>
  );
}); 