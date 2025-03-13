'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MongoUser, User } from '@/lib/types/user';
import { MultiSelect } from '@/components/MultiSelect';
import { validateMongoId } from '@/lib/utils/security';

// Tipo extendido que puede manejar tanto MongoUser como User (con _id o id)
interface ExtendedUser extends Omit<MongoUser, '_id'> {
  _id?: string;
  id?: string;
}

interface AssignWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  workoutName: string;
  workoutDescription?: string;
  onAssign: (data: { coachIds: string[]; customerIds: string[] }) => Promise<any>;
  existingAssignments?: {
    coaches: string[];
    customers: string[];
  };
}

export default function AssignWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  workoutDescription = '',
  onAssign,
  existingAssignments
}: AssignWorkoutModalProps) {
  const router = useRouter();
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>(existingAssignments?.coaches || []);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(existingAssignments?.customers || []);
  const [newDescription, setNewDescription] = useState(workoutDescription);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar los usuarios cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setNewDescription(workoutDescription);
    }
  }, [isOpen, workoutDescription]);

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
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleAssign() {
    try {
      // Validar formato de IDs antes de enviar
      const allIds = [workoutId, ...selectedCoachIds, ...selectedCustomerIds];
      const invalidIds = allIds.filter(id => !validateMongoId(id));
      
      if (invalidIds.length > 0) {
        throw new Error(`IDs inválidos: ${invalidIds.join(', ')}`);
      }

      // Additional check for at least one customer
      if (selectedCustomerIds.length === 0) {
        throw new Error('Debes seleccionar al menos un cliente');
      }

      setIsAssigning(true);
      setError(null);
      
      const result = await onAssign({
        coachIds: selectedCoachIds,
        customerIds: selectedCustomerIds
      });

      // Add null check first
      if (!result) {
        throw new Error('Server returned empty response');
      }

      // Then check type
      if (typeof result !== 'object') {
        throw new Error(`Invalid server response type: ${typeof result}`);
      }

      // Then check structure
      if (!('success' in result)) {
        throw new Error('Server response missing success flag');
      }

      // Verify assignments
      const allAssigned = selectedCustomerIds.every(id => 
        result.assignedCustomers.includes(id)
      );
      
      if (!allAssigned) {
        throw new Error('Not all selected customers were assigned');
      }

      toast.success('Rutina asignada exitosamente');
      router.refresh();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message : 
        'Error de comunicación con el servidor. Verifica tu conexión e intenta nuevamente.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Asignar Rutina
          </h3>
          <button 
            onClick={onClose}
            disabled={isAssigning}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Vas a asignar la rutina "{workoutName}" a otros usuarios.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Coaches/Admins
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Customers
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

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isAssigning || isLoadingUsers}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 flex items-center"
          >
            {isAssigning ? 'Asignando...' : (
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