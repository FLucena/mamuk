'use client';

import { Fragment, useState, useCallback, memo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Edit2 } from 'lucide-react';
import { User } from '@/lib/types/user';

interface Coach extends User {
  specialties?: string[];
  bio?: string;
  customers?: string[];
}

interface EditCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { specialties: string[]; biography: string }) => Promise<boolean>;
  coach: Coach;
}

// Memoize the EditCoachModal component to prevent unnecessary re-renders
export default memo(function EditCoachModal({
  isOpen,
  onClose,
  onConfirm,
  coach,
}: EditCoachModalProps) {
  const [specialties, setSpecialties] = useState<string[]>(coach.specialties || []);
  const [biography, setBiography] = useState(coach.bio || '');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSpecialty = useCallback(() => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  }, [newSpecialty, specialties]);

  const handleRemoveSpecialty = useCallback((specialtyToRemove: string) => {
    setSpecialties(specialties.filter(s => s !== specialtyToRemove));
  }, [specialties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await onConfirm({ specialties, biography });
      // Only close the modal on success
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-center mb-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Edit2
                      className="h-6 w-6 text-blue-600 dark:text-blue-200"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Editar Coach
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="specialty-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Especialidades
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        id="specialty-input"
                        name="specialty"
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Añadir especialidad..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(specialty)}
                            className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label={`Eliminar especialidad ${specialty}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="biography-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Biografía
                    </label>
                    <textarea
                      id="biography-input"
                      name="biography"
                      value={biography}
                      onChange={(e) => setBiography(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Describe la biografía del coach..."
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </span>
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
}); 