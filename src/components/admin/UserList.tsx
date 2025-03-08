'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditConfirm = async (data: {
    name: string;
    email: string;
    role: string;
  }) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setShowEditModal(false);
      toast.success('Usuario actualizado exitosamente');
      router.refresh();
    } catch (error) {
      toast.error('Error al actualizar usuario');
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

      setShowDeleteModal(false);
      toast.success('Usuario eliminado exitosamente');
      router.refresh();
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'coach':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'customer':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
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
                  <FiUser className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiMail className="w-4 h-4 mr-1" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleEditClick(user)}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                Editar
              </button>

              <button
                onClick={() => handleDeleteClick(user)}
                disabled={user.role === 'admin'}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        ))}

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
            onConfirm={handleEditConfirm}
            user={selectedUser}
          />

          <DeleteUserModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </>
  );
} 