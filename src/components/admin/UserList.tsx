'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import { IconWrapper } from '@/components/ui/IconWrapper';
import { User, Role } from '@/lib/types/user';
import { sortRoles } from '@/lib/utils/roles';

interface UserListProps {
  users: User[];
  onRefresh?: () => void;
  onSelectCoach?: (coach: User) => void;
  selectedCoach?: string;
  onSelectCustomers?: (customerIds: string[]) => void;
  selectedCustomers?: string[];
  assignedCustomers?: string[];
  onAssignCustomers?: () => Promise<void>;
  assignmentLoading?: boolean;
}

// Memoize the UserList component to prevent unnecessary re-renders
export default memo(function UserList({ 
  users: initialUsers, 
  onRefresh,
  onSelectCoach,
  selectedCoach,
  onSelectCustomers,
  selectedCustomers = [],
  assignedCustomers,
  onAssignCustomers,
  assignmentLoading = false
}: UserListProps) {
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
          user._id === userId 
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
      // Ensure we have a valid ID for the API call
      const userId = selectedUser._id;
      if (!userId) {
        toast.error('ID de usuario no válido');
        return;
      }
      
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }
      
      toast.success('Usuario eliminado correctamente');
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    } finally {
      setIsLoading(false);
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
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Usuarios</h2>
        <button
          onClick={() => router.push('/admin/users/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* Display users in a table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {/* Table header */}
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Roles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
                {onSelectCoach && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seleccionar Coach
                  </th>
                )}
                {onSelectCustomers && selectedCoach && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Asignar Cliente
                  </th>
                )}
              </tr>
            </thead>
            
            {/* Table body */}
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {user.image ? (
                          <img className="h-10 w-10 rounded-full" src={user.image} alt={user.name} />
                        ) : (
                          <IconWrapper icon={UserIcon} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IconWrapper icon={Mail} className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && sortRoles(user.roles).map((role, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${
                            role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : role === 'coach'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label="Edit user"
                      >
                        <IconWrapper icon={Edit2} className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Delete user"
                      >
                        <IconWrapper icon={Trash2} className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                  {onSelectCoach && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.roles?.includes('coach') && (
                        <button
                          onClick={() => onSelectCoach(user)}
                          className={`px-3 py-1 rounded text-white text-sm ${
                            selectedCoach === user._id
                              ? 'bg-blue-700 hover:bg-blue-800'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          {selectedCoach === user._id ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                      )}
                    </td>
                  )}
                  {onSelectCustomers && selectedCoach && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.roles?.includes('customer') && (
                        <>
                          {/* No permitir que un coach se asigne a sí mismo como cliente */}
                          {user._id === selectedCoach ? (
                            <span className="text-sm text-gray-500 italic">No disponible</span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(user._id) || (assignedCustomers && assignedCustomers.includes(user._id))}
                              disabled={assignedCustomers && assignedCustomers.includes(user._id)}
                              onChange={() => {
                                // No hacer nada si ya está asignado
                                if (assignedCustomers && assignedCustomers.includes(user._id)) return;
                                
                                const newSelectedCustomers = selectedCustomers.includes(user._id)
                                  ? selectedCustomers.filter(id => id !== user._id)
                                  : [...selectedCustomers, user._id];
                                onSelectCustomers(newSelectedCustomers);
                              }}
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                            />
                          )}
                          {assignedCustomers && assignedCustomers.includes(user._id) && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                              Ya asignado
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment button */}
      {onAssignCustomers && selectedCoach && selectedCustomers.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onAssignCustomers}
            disabled={assignmentLoading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              assignmentLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {assignmentLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Asignando...
              </span>
            ) : (
              `Asignar ${selectedCustomers.length} cliente${selectedCustomers.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onConfirm={(data) => {
              if (selectedUser) {
                const userId = selectedUser._id;
                if (userId) {
                  handleEditUser(userId, data);
                } else {
                  console.error('Cannot update user: userId is undefined');
                  toast.error('Error al actualizar el usuario: ID no válido');
                }
              } else {
                console.error('Cannot update user: selectedUser is null');
                toast.error('Error al actualizar el usuario: Usuario no seleccionado');
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