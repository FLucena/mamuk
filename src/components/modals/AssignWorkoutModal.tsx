'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MongoUser, User } from '@/lib/types/user';

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
  onAssign: (targetUserId: string, newDescription?: string) => Promise<any>;
}

export default function AssignWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  workoutDescription = '',
  onAssign
}: AssignWorkoutModalProps) {
  const router = useRouter();
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
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
      // Usar la ruta específica para clientes
      console.log('AssignWorkoutModal - Solicitando clientes para asignación');
      const response = await fetch('/api/users/customers');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('AssignWorkoutModal - Clientes cargados:', data.length);
      
      // Ya no necesitamos filtrar pues la API solo devuelve clientes
      
      // Asegurarse de que cada usuario tenga tanto id como _id
      const normalizedUsers: ExtendedUser[] = data.map((user: any) => ({
        ...user,
        id: user.id || (user._id ? user._id.toString() : undefined),
        _id: user._id || user.id
      }));
      
      setUsers(normalizedUsers);
      setError(normalizedUsers.length === 0 ? 'No hay clientes disponibles para asignar la rutina' : null);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar clientes');
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleAssign() {
    if (!selectedUserId) {
      setError('Selecciona un usuario para asignar la rutina');
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      console.log('Asignando rutina:', workoutId, 'al usuario:', selectedUserId);
      await onAssign(selectedUserId, newDescription);
      toast.success('Rutina asignada exitosamente');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error assigning workout:', error);
      setError(error instanceof Error ? error.message : 'Error al asignar la rutina');
      toast.error('Error al asignar la rutina');
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
            Vas a asignar la rutina "{workoutName}" a otro usuario.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Selecciona un usuario
            </label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-3">
                <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
              </div>
            ) : users.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={isAssigning}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona un usuario</option>
                {users.map((user) => (
                  <option 
                    key={user.id || user._id} 
                    value={user.id || user._id || ''}
                  >
                    {user.name || user.email} 
                    {user.role === 'admin' ? ' (Administrador)' : 
                     user.role === 'coach' ? ' (Coach)' : 
                     ' (Cliente)'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 text-gray-700 dark:text-gray-300 text-center">
                {error ? 'Error al cargar usuarios' : 'No hay usuarios disponibles'}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={isAssigning}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]"
              placeholder="Descripción de la rutina (opcional)"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={isAssigning}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssign}
              disabled={isAssigning || !selectedUserId}
              className="px-4 py-2 text-sm text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Asignando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Asignar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 