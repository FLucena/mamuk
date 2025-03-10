'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Icon from '@/components/ui/Icon';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import Image from 'next/image';
import { MongoUser, Role } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UserListProps {
  users?: MongoUser[];
  isLoading?: boolean;
}

export default function UserList({ users = [], isLoading = false }: UserListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { updateRole, updateRoles } = useAuth();
  const [localUsers, setLocalUsers] = useState<MongoUser[]>(users);
  const [selectedUser, setSelectedUser] = useState<MongoUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local users when the prop changes
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const filteredUsers = localUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user: MongoUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: MongoUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditConfirm = async (data: {
    name: string;
    email: string;
    role: string;
  }) => {
    if (!selectedUser) return;
    
    setIsEditing(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      // Get the updated user data from the response
      const updatedUser = await response.json();
      
      // Update the user in the local state
      setLocalUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id 
            ? { 
                ...user, 
                name: updatedUser.name, 
                email: updatedUser.email, 
                role: updatedUser.role,
                roles: updatedUser.roles || [updatedUser.role]
              } 
            : user
        )
      );
      
      // If the updated user is the current user, update their roles in the session
      if (session?.user?.email === updatedUser.email) {
        // Actualizar tanto el rol principal como los roles múltiples
        updateRole(updatedUser.role);
        if (updatedUser.roles) {
          updateRoles(updatedUser.roles);
        }
      }
      
      // Close the modal
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      // TODO: Show error toast
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      // Update local state by removing the deleted user
      setLocalUsers(prevUsers => 
        prevUsers.filter(user => user._id !== selectedUser._id)
      );

      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      // TODO: Show error toast
    } finally {
      setIsDeleting(false);
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
              placeholder="Buscar usuarios..."
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
            Añadir Usuario
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Usuarios</h2>
          <div className="space-y-6">
            {filteredUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || ''}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Icon icon="FiUser" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : user.role === 'coach'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'coach' ? 'Entrenador' : 'Cliente'}
                    </span>
                    
                    {/* Mostrar roles adicionales si tiene más de uno */}
                    {user.roles && user.roles.length > 1 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.roles.filter(r => r !== user.role).map(additionalRole => (
                          <span 
                            key={additionalRole}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              additionalRole === 'admin'
                                ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300'
                                : additionalRole === 'coach'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                            }`}
                          >
                            +{additionalRole === 'admin' ? 'Admin' : additionalRole === 'coach' ? 'Coach' : 'Cliente'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Icon icon="FiEdit2" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Icon icon="FiTrash2" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No se encontraron usuarios.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUser && showEditModal && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            if (!isEditing) {
              setShowEditModal(false);
              setSelectedUser(null);
            }
          }}
          onConfirm={handleEditConfirm}
          user={{
            id: selectedUser._id,
            name: selectedUser.name || '',
            email: selectedUser.email || '',
            role: selectedUser.role || 'customer',
            roles: selectedUser.roles || [selectedUser.role || 'customer']
          }}
        />
      )}

      {selectedUser && showDeleteModal && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!isDeleting) {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          userName={selectedUser.name || ''}
        />
      )}
    </div>
  );
} 