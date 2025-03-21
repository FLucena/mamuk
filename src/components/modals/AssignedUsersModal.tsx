'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/models';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useSpinner } from '@/hooks/useSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useError } from '@/contexts/ErrorContext';
import { ErrorSeverity, ErrorType } from '@/contexts/ErrorContext';
import { ErrorWithMessage } from '@/types/common';

// Extended user interface to handle API responses that might use _id instead of id
interface ExtendedUser extends Omit<User, 'id'> {
  id?: string;
  _id?: string;
}

interface AssignedUsersModalProps {
  workoutId?: string;
  users?: (User | ExtendedUser)[];
  isOpen?: boolean;
  onClose: () => void;
  onAssignUser?: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
}

// Wrapper component that safely applies context hooks
function SafeAssignedUsersModal(props: AssignedUsersModalProps) {
  // These hook calls are safe because they're always called in the same order
  const spinnerHooks = useSpinner?.() || { showSpinner: () => {}, hideSpinner: () => {} };
  const authHooks = useAuth?.() || { isAdmin: false, isCoach: false };
  const errorHooks = useError?.() || { addError: (_: any) => {} };
  
  return (
    <AssignedUsersModalInternal
      {...props}
      spinnerHooks={spinnerHooks}
      authHooks={authHooks}
      errorHooks={errorHooks}
    />
  );
}

interface InternalProps extends AssignedUsersModalProps {
  spinnerHooks: { showSpinner: () => void; hideSpinner: () => void };
  authHooks: { isAdmin: boolean; isCoach: boolean };
  errorHooks: { addError: (error: any) => void };
}

function AssignedUsersModalInternal({
  workoutId,
  users: initialUsers,
  isOpen = true,
  onClose,
  onAssignUser,
  onRemoveUser,
  spinnerHooks,
  authHooks,
  errorHooks,
}: InternalProps) {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedUsers, setAssignedUsers] = useState<ExtendedUser[]>(initialUsers || []);
  const [availableUsers, setAvailableUsers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { showSpinner, hideSpinner } = spinnerHooks;
  const { isAdmin, isCoach } = authHooks;
  const { addError } = errorHooks;

  // Helper function to get user ID regardless of whether it's stored in id or _id
  const getUserId = (user: ExtendedUser): string => user.id || user._id || '';

  // If we're in simple mode (just displaying users passed in props)
  const isSimpleMode = Boolean(initialUsers) && !workoutId;

  // Filter users based on search term
  const filteredUsers = assignedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch assigned and available users
  useEffect(() => {
    if (!workoutId || !isOpen || isSimpleMode) return;
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        showSpinner();
        
        // Fetch assigned users
        const assignedResponse = await fetch(`/api/workout/${workoutId}/users`);
        if (!assignedResponse.ok) {
          throw new Error('Failed to fetch assigned users');
        }
        const assignedData = await assignedResponse.json();
        setAssignedUsers(assignedData);
        
        // Fetch available users (only for admins and coaches)
        if (isAdmin || isCoach) {
          const availableResponse = await fetch('/api/users/customers');
          if (!availableResponse.ok) {
            throw new Error('Failed to fetch available users');
          }
          const availableData = await availableResponse.json();
          
          // Filter out already assigned users
          const assignedIds = assignedData.map((user: ExtendedUser) => getUserId(user));
          const filteredUsers = availableData.filter(
            (user: ExtendedUser) => !assignedIds.includes(getUserId(user))
          );
          
          setAvailableUsers(filteredUsers);
        }
      } catch (error: unknown) {
        console.error('Error fetching users:', error);
        const err = error as ErrorWithMessage;
        addError({
          message: err.message || 'Failed to fetch users',
          severity: ErrorSeverity.ERROR,
          type: ErrorType.API,
        });
      } finally {
        setIsLoading(false);
        hideSpinner();
      }
    };

    fetchUsers();
  }, [isOpen, workoutId, isAdmin, isCoach, showSpinner, hideSpinner, addError, isSimpleMode]);

  // Handle assigning a user to the workout
  const handleAssignUser = async () => {
    if (!selectedUserId || !workoutId) return;
    
    try {
      setIsLoading(true);
      showSpinner();
      
      const response = await fetch(`/api/workout/${workoutId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign user');
      }
      
      // Update the UI
      const assignedUser = availableUsers.find(user => getUserId(user) === selectedUserId);
      if (assignedUser) {
        setAssignedUsers([...assignedUsers, assignedUser]);
        setAvailableUsers(availableUsers.filter(user => getUserId(user) !== selectedUserId));
      }
      
      setSelectedUserId('');
      toast.success('Usuario asignado exitosamente');
      
      // Call the callback if provided
      if (onAssignUser) {
        onAssignUser(selectedUserId);
      }
    } catch (error: unknown) {
      console.error('Error assigning user:', error);
      const err = error as ErrorWithMessage;
      addError({
        message: err.message || 'Failed to assign user',
        severity: ErrorSeverity.ERROR,
        type: ErrorType.API,
      });
    } finally {
      setIsLoading(false);
      hideSpinner();
    }
  };

  // Handle removing a user from the workout
  const handleRemoveUser = async (userId: string) => {
    if (!workoutId) return;
    
    try {
      setIsLoading(true);
      showSpinner();
      
      const response = await fetch(`/api/workout/${workoutId}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove user');
      }
      
      // Update the UI
      const removedUser = assignedUsers.find(user => getUserId(user) === userId);
      if (removedUser) {
        setAssignedUsers(assignedUsers.filter(user => getUserId(user) !== userId));
        setAvailableUsers([...availableUsers, removedUser]);
      }
      
      toast.success('Usuario removido exitosamente');
      
      // Call the callback if provided
      if (onRemoveUser) {
        onRemoveUser(userId);
      }
    } catch (error: unknown) {
      console.error('Error removing user:', error);
      const err = error as ErrorWithMessage;
      addError({
        message: err.message || 'Failed to remove user',
        severity: ErrorSeverity.ERROR,
        type: ErrorType.API,
      });
    } finally {
      setIsLoading(false);
      hideSpinner();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Usuarios Asignados
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Search input */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Assign new user section (only for API mode and admin/coach) */}
          {!isSimpleMode && workoutId && (isAdmin || isCoach) && (
            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Asignar Nuevo Usuario</h3>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || availableUsers.length === 0}
                >
                  <option value="">Seleccionar usuario</option>
                  {availableUsers.map((user) => (
                    <option key={getUserId(user)} value={getUserId(user)}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignUser}
                  disabled={!selectedUserId || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Asignar
                </button>
              </div>
              {availableUsers.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  No hay más usuarios disponibles para asignar
                </p>
              )}
            </div>
          )}

          {/* Users list */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No se encontraron usuarios
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={getUserId(user)}
                  className="p-3 mb-2 rounded-md bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {!isSimpleMode && workoutId && (isAdmin || isCoach) && (
                      <button
                        onClick={() => handleRemoveUser(getUserId(user))}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-300 p-1"
                        title="Remover usuario"
                        aria-label={`Remover a ${user.name}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    {isSimpleMode && user.roles && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the wrapper component as the default export
export default SafeAssignedUsersModal; 