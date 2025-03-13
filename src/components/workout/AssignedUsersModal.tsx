'use client';

import { useState, useEffect } from 'react';
import { useSpinner } from '@/hooks/useSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useError } from '@/contexts/ErrorContext';
import { toast } from 'react-hot-toast';
import { ErrorSeverity, ErrorType } from '@/contexts/ErrorContext';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AssignedUsersModalProps {
  workoutId: string;
  isOpen: boolean;
  onClose: () => void;
  onAssignUser?: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
}

export default function AssignedUsersModal({
  workoutId,
  isOpen,
  onClose,
  onAssignUser,
  onRemoveUser,
}: AssignedUsersModalProps) {
  const { showSpinner, hideSpinner } = useSpinner();
  const { isAdmin, isCoach } = useAuth();
  const { addError } = useError();
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch assigned and available users
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const hideSpinnerFn = showSpinner();
        
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
          const assignedIds = assignedData.map((user: User) => user.id);
          const filteredUsers = availableData.filter(
            (user: User) => !assignedIds.includes(user.id)
          );
          
          setAvailableUsers(filteredUsers);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        addError({
          message: error.message || 'Failed to fetch users',
          severity: ErrorSeverity.ERROR,
          type: ErrorType.API,
        });
      } finally {
        setIsLoading(false);
        hideSpinner();
      }
    };

    fetchUsers();
  }, [isOpen, workoutId, isAdmin, isCoach, showSpinner, hideSpinner, addError]);

  // Handle assigning a user to the workout
  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsLoading(true);
      const hideSpinnerFn = showSpinner();
      
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
      const assignedUser = availableUsers.find(user => user.id === selectedUserId);
      if (assignedUser) {
        setAssignedUsers([...assignedUsers, assignedUser]);
        setAvailableUsers(availableUsers.filter(user => user.id !== selectedUserId));
      }
      
      setSelectedUserId('');
      toast.success('User assigned successfully');
      
      // Call the callback if provided
      if (onAssignUser) {
        onAssignUser(selectedUserId);
      }
    } catch (error: any) {
      console.error('Error assigning user:', error);
      addError({
        message: error.message || 'Failed to assign user',
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
    try {
      setIsLoading(true);
      const hideSpinnerFn = showSpinner();
      
      const response = await fetch(`/api/workout/${workoutId}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove user');
      }
      
      // Update the UI
      const removedUser = assignedUsers.find(user => user.id === userId);
      if (removedUser) {
        setAssignedUsers(assignedUsers.filter(user => user.id !== userId));
        setAvailableUsers([...availableUsers, removedUser]);
      }
      
      toast.success('User removed successfully');
      
      // Call the callback if provided
      if (onRemoveUser) {
        onRemoveUser(userId);
      }
    } catch (error: any) {
      console.error('Error removing user:', error);
      addError({
        message: error.message || 'Failed to remove user',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assigned Users</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {(isAdmin || isCoach) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Assign New User</h3>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading || availableUsers.length === 0}
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignUser}
                disabled={!selectedUserId || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
            {availableUsers.length === 0 && !isLoading && (
              <p className="text-sm text-gray-500 mt-2">
                No more users available to assign
              </p>
            )}
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Currently Assigned</h3>
          {assignedUsers.length === 0 ? (
            <p className="text-gray-500">No users assigned to this workout</p>
          ) : (
            <ul className="space-y-2">
              {assignedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  {(isAdmin || isCoach) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 