'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/lib/types/user';
import { MultiSelect } from '@/components/MultiSelect';
import { validateMongoId } from '@/lib/utils/security';
import { Workout } from '@/types/models';

// Extended type that can handle both MongoUser and User (with _id or id)
interface ExtendedUser extends Omit<User, '_id'> {
  _id?: string;
  id?: string;
}

interface AssignWorkoutModalProps {
  workout: Workout;
  onConfirm: (data: { coachIds: string[]; customerIds: string[] }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  existingAssignments?: {
    coaches: string[];
    customers: string[];
  };
}

export default function AssignWorkoutModal({
  workout,
  onConfirm,
  onClose,
  loading = false,
  existingAssignments
}: AssignWorkoutModalProps) {
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>(existingAssignments?.coaches || []);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(existingAssignments?.customers || []);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load users when the modal opens
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoadingUsers(true);
      setError(null);
      
      const response = await fetch('/api/users?roles=admin,coach,customer');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const normalizedUsers = data.map((user: any) => ({
        ...user,
        id: user.id || user._id?.toString(),
      }));
      
      setUsers(normalizedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleAssign() {
    try {
      // Validate ID formats before sending
      const allIds = [workout.id, ...selectedCoachIds, ...selectedCustomerIds];
      const invalidIds = allIds.filter(id => !validateMongoId(id));
      
      if (invalidIds.length > 0) {
        throw new Error(`IDs inválidos: ${invalidIds.join(', ')}`);
      }

      // Additional check for at least one customer
      if (selectedCustomerIds.length === 0) {
        throw new Error('Debes seleccionar al menos un cliente');
      }

      setError(null);
      
      await onConfirm({
        coachIds: selectedCoachIds,
        customerIds: selectedCustomerIds
      });

      toast.success('Rutina asignada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message : 
        'Error al asignar la rutina';
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Asignar Rutina
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Vas a asignar la rutina "{workout.name}" a otros usuarios.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Entrenadores y Administradores
              </label>
              <MultiSelect
                options={users
                  .filter(u => (u.roles?.includes('admin') || u.roles?.includes('coach')) && u.id)
                  .map(user => ({
                    value: user.id as string,
                    label: `${user.name} (${user.roles?.includes('admin') ? 'Admin' : 'Coach'})`
                  }))}
                selectedValues={selectedCoachIds}
                onChange={setSelectedCoachIds}
                isLoading={isLoadingUsers}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Clientes
              </label>
              <MultiSelect
                options={users
                  .filter(u => u.roles?.includes('customer') && u.id)
                  .map(user => ({
                    value: user.id as string,
                    label: user.name
                  }))}
                selectedValues={selectedCustomerIds}
                onChange={setSelectedCustomerIds}
                isLoading={isLoadingUsers}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || isLoadingUsers}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? 'Asignando...' : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Asignar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 