'use client';

import { Fragment, useState, useEffect, useCallback, memo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Edit2, Check, X, Loader } from 'lucide-react';
import { IconWrapper } from '@/components/ui/IconWrapper';
import FormErrorBoundary from '@/components/FormErrorBoundary';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: string[];
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; email: string; roles: string[] }) => void | Promise<any>;
  user: User;
}

// Define role hierarchy (higher index = higher priority)
const ROLE_HIERARCHY = ['customer', 'coach', 'admin'];

// Function to get the highest priority role from an array of roles
const getHighestPriorityRole = (roles: string[]): string => {
  // Filter roles to only include those in our hierarchy
  const validRoles = roles.filter(r => ROLE_HIERARCHY.includes(r));
  
  if (validRoles.length === 0) {
    return 'customer'; // Default to customer if no valid roles
  }
  
  // Sort by priority (highest last) and take the last one
  return validRoles.sort((a, b) => 
    ROLE_HIERARCHY.indexOf(a) - ROLE_HIERARCHY.indexOf(b)
  )[validRoles.length - 1];
};

// Memoize the EditUserModal component to prevent unnecessary re-renders
export default memo(function EditUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: EditUserModalProps) {
  // Form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  // Initialize selectedRoles from user.roles
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles || ['customer']);
  const [primaryRole, setPrimaryRole] = useState<string>(getHighestPriorityRole(user.roles || ['customer']));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when user changes
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setSelectedRoles(user.roles || ['customer']);
    setPrimaryRole(getHighestPriorityRole(user.roles || ['customer']));
  }, [user]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setSelectedRoles(user.roles || ['customer']);
      setPrimaryRole(getHighestPriorityRole(user.roles || ['customer']));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  // Update primary role whenever roles change
  useEffect(() => {
    if (selectedRoles.length > 0) {
      const highestRole = getHighestPriorityRole(selectedRoles);
      setPrimaryRole(highestRole);
    }
  }, [selectedRoles]);

  // Toggle a role on or off
  const toggleRole = (roleToToggle: string) => {
    let newRoles: string[];
    
    if (selectedRoles.includes(roleToToggle)) {
      // Remove the role if it's already included
      newRoles = selectedRoles.filter(r => r !== roleToToggle);
    } else {
      // Add the role if it's not included
      newRoles = [...selectedRoles, roleToToggle];
    }
    
    // Ensure at least one role is selected
    if (newRoles.length === 0) {
      // If trying to remove the last role, don't allow it
      return;
    }
    
    setSelectedRoles(newRoles);
    // Primary role will be updated by the useEffect
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set submitting state to true
    setIsSubmitting(true);
    
    try {
      // Validate form
      const errors: Record<string, string> = {};
      
      if (!name.trim()) {
        errors.name = 'El nombre es requerido';
      }
      
      if (!email.trim()) {
        errors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email inválido';
      }
      
      if (selectedRoles.length === 0) {
        errors.roles = 'Debe seleccionar al menos un rol';
      }
      
      // If there are errors, set them and return
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsSubmitting(false);
        return;
      }
      
      // Call onConfirm with form data
      const result = onConfirm({
        name,
        email,
        roles: selectedRoles.length > 0 ? selectedRoles : ['customer'], // Default to customer if no roles selected
      });

      // Check if result is a Promise
      if (result && typeof result === 'object' && 'then' in result) {
        result.then(() => {
          setIsSubmitting(false);
          onClose(); // Close the modal after successful submission
        }).catch((error: unknown) => {
          console.error('Error saving user:', error);
          setIsSubmitting(false);
        });
      } else {
        // If onConfirm doesn't return a Promise, assume it's synchronous
        setIsSubmitting(false);
        onClose(); // Close the modal after successful submission
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setName(user.name);
    setEmail(user.email);
    setSelectedRoles(user.roles || ['customer']);
    setPrimaryRole(getHighestPriorityRole(user.roles || ['customer']));
    setErrors({});
    setIsSubmitting(false);
  }, [user]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                >
                  <IconWrapper icon={Edit2} className="mr-2" /> Editar Usuario
                </Dialog.Title>
                
                <FormErrorBoundary formName="editar usuario" onReset={resetForm}>
                  <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Roles
                      </h4>
                      <div className="space-y-4">
                        {/* Cliente Role */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white relative">
                                Cliente
                                {primaryRole === 'customer' && (
                                  <span 
                                    className="absolute -right-5 top-0 text-xs text-blue-600 dark:text-blue-400" 
                                    title="Rol principal"
                                  >
                                    ★
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Acceso básico a la plataforma
                            </p>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleRole('customer')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                selectedRoles.includes('customer') 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                              disabled={isSubmitting}
                              aria-label="cliente"
                            >
                              <span
                                className={`${
                                  selectedRoles.includes('customer') ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Coach Role */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white relative">
                                Coach
                                {primaryRole === 'coach' && (
                                  <span 
                                    className="absolute -right-5 top-0 text-xs text-green-600 dark:text-green-400" 
                                    title="Rol principal"
                                  >
                                    ★
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Gestión de clientes y rutinas
                            </p>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleRole('coach')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                selectedRoles.includes('coach') 
                                  ? 'bg-green-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                              disabled={isSubmitting}
                              aria-label="coach"
                            >
                              <span
                                className={`${
                                  selectedRoles.includes('coach') ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Admin Role */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white relative">
                                Administrador
                                {primaryRole === 'admin' && (
                                  <span 
                                    className="absolute -right-5 top-0 text-xs text-purple-600 dark:text-purple-400" 
                                    title="Rol principal"
                                  >
                                    ★
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Acceso completo al sistema
                            </p>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleRole('admin')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                selectedRoles.includes('admin') 
                                  ? 'bg-purple-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                              disabled={isSubmitting}
                              aria-label="administrador"
                            >
                              <span
                                className={`${
                                  selectedRoles.includes('admin') ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        disabled={isSubmitting}
                      >
                        <IconWrapper icon={X} className="w-5 h-5" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" role="status" />
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            <span>Guardar cambios</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </FormErrorBoundary>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});