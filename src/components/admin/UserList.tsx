'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import { IconWrapper } from '@/components/ui/IconWrapper';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: string[];
}

interface UserListProps {
  users: User[];
  onRefresh?: () => void;
}

// Memoize the UserList component to prevent unnecessary re-renders
export default memo(function UserList({ users: initialUsers, onRefresh }: UserListProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update local users when initialUsers changes (e.g., from server)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }, []);

  const handleEditUser = async (userId: string, data: { name: string; email: string; roles: string[] }) => {
    try {
      // Check if userId is defined
      if (!userId) {
        console.error('Cannot update user: userId is undefined');
        toast.error('Error al actualizar el usuario: ID no válido');
        return;
      }
      
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          roles: data.roles,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }
      
      const updatedUser = await response.json();
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                name: updatedUser.name, 
                email: updatedUser.email, 
                roles: updatedUser.roles,
              } 
            : user
        )
      );
      
      toast.success('Usuario actualizado correctamente');
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
      
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove the user from the local state
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== selectedUser.id)
      );

      setShowDeleteModal(false);
      toast.success('Usuario eliminado exitosamente');
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
      
      // Return the response to indicate success
      return response;
    } catch (error) {
      toast.error('Error al eliminar usuario');
      // Re-throw the error so the calling component can handle it
      throw error;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800';
      case 'coach':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'customer':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'coach':
        return 'Coach';
      case 'customer':
        return 'Cliente';
      default:
        return role;
    }
  };

  // Get role priority (higher number = higher priority)
  const getRolePriority = (role: string): number => {
    switch (role) {
      case 'admin': return 3;
      case 'coach': return 2;
      case 'customer': return 1;
      default: return 0;
    }
  };

  // Sort roles by priority (highest first)
  const sortRolesByPriority = (roles: string[]): string[] => {
    return [...roles].sort((a, b) => getRolePriority(b) - getRolePriority(a));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          // Get all roles
          const allRoles = user.roles || [];
          // Sort roles by priority
          const sortedRoles = sortRolesByPriority(allRoles);
          // Primary role should be the highest priority one
          const primaryRole = sortedRoles[0];
          // Secondary roles are all other roles
          const secondaryRoles = sortedRoles.slice(1);
          
          return (
            <div
              key={user.id || (user as any)._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-1" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {/* Display primary role with a star */}
                {primaryRole && (
                  <span
                    key={`primary-${primaryRole}`}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      primaryRole
                    )}`}
                  >
                    <span className="mr-1">★</span> {getRoleLabel(primaryRole)}
                  </span>
                )}
                
                {/* Display secondary roles */}
                {secondaryRoles.map(role => (
                  <span
                    key={role}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      role
                    )}`}
                  >
                    {getRoleLabel(role)}
                  </span>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditClick(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                  aria-label={`Edit ${user.name}`}
                >
                  <IconWrapper icon={Edit2} className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(user)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  aria-label={`Delete ${user.name}`}
                >
                  <IconWrapper icon={Trash2} className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No hay usuarios registrados aún.
          </div>
        )}
      </div>

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onConfirm={(data) => {
              if (selectedUser && selectedUser.id) {
                handleEditUser(selectedUser.id, data);
              } else {
                console.error('Cannot update user: userId is undefined');
                toast.error('Error al actualizar el usuario: ID no válido');
              }
            }}
            user={{
              ...selectedUser,
              // Ensure roles is always defined
              roles: selectedUser.roles || []
            }}
          />

          <DeleteUserModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </>
  );
}); 