'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Icon, { IconName } from '@/components/ui/Icon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UserRolesManager from './UserRolesManager';
import { Role } from '@/lib/types/user';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  roles: Role[];
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; email: string; role: Role }) => Promise<void>;
  user: User;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [roles, setRoles] = useState<Role[]>(user.roles || [user.role]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset form when user changes
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setRoles(user.roles || [user.role]);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onConfirm({
        name,
        email,
        role,
      });
      // The modal will be closed by the parent component
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRolesUpdated = (updatedRoles: Role[]) => {
    setRoles(updatedRoles);
    // Actualizar el rol principal si ha cambiado
    if (updatedRoles.length > 0 && updatedRoles[0] !== role) {
      setRole(updatedRoles[0]);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={isLoading ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium leading-6 text-gray-900 dark:text-white flex items-center mb-4"
                >
                  <Icon icon="FiEdit2" className="mr-3" /> Editar Usuario
                </Dialog.Title>
                <form onSubmit={handleSubmit}>
                  <div className="mt-6">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2.5 px-4"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2.5 px-4"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Rol Principal
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2.5 px-4"
                      disabled={isLoading}
                    >
                      <option value="customer">Cliente</option>
                      <option value="coach">Entrenador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  {/* Gestor de roles múltiples */}
                  <UserRolesManager 
                    userId={user.id}
                    initialRoles={roles}
                    onRolesUpdated={handleRolesUpdated}
                  />

                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[140px] flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        "Guardar cambios"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 