'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface ArchivedRoutine {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  archivedAt: string;
  coach: {
    name: string;
    email: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

interface ArchivedRoutinesProps {
  routines?: ArchivedRoutine[];
}

export default function ArchivedRoutines({ routines = [] }: ArchivedRoutinesProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [localRoutines, setLocalRoutines] = useState<ArchivedRoutine[]>(routines);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<{ id: string; name: string } | null>(null);
  const [routineToRestore, setRoutineToRestore] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setLocalRoutines(routines);
  }, [routines]);

  const filteredRoutines = localRoutines.filter(routine =>
    routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    routine.coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    routine.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const openRestoreModal = (id: string, name: string) => {
    setRoutineToRestore({ id, name });
    setShowRestoreModal(true);
  };

  const closeRestoreModal = () => {
    setShowRestoreModal(false);
    setRoutineToRestore(null);
  };

  const handleRestore = async () => {
    if (!routineToRestore) return;
    
    const { id, name } = routineToRestore;
    
    try {
      setLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await fetch(`/api/admin/routines/archived/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al restaurar la rutina');
      }

      setLocalRoutines(prev => prev.filter(routine => routine.id !== id));
      
      toast.success(`Rutina "${name}" restaurada exitosamente`);
      router.refresh();
      closeRestoreModal();
    } catch (error) {
      console.error('Error restoring workout:', error);
      toast.error(error instanceof Error ? error.message : 'Error al restaurar la rutina');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setRoutineToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRoutineToDelete(null);
  };

  const handleDelete = async () => {
    if (!routineToDelete) return;
    
    const { id, name } = routineToDelete;
    
    try {
      setLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await fetch(`/api/admin/routines/archived/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la rutina');
      }

      setLocalRoutines(prev => prev.filter(routine => routine.id !== id));
      
      toast.success(`Rutina "${name}" eliminada permanentemente`);
      router.refresh();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la rutina');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, coach o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rutina
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coach
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha de Archivo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRoutines.length > 0 ? (
              filteredRoutines.map((routine) => (
                <tr key={routine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {routine.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {routine.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{routine.coach.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{routine.coach.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{routine.customer.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{routine.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(routine.archivedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openRestoreModal(routine.id, routine.name)}
                      disabled={loading[routine.id]}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[routine.id] ? 'Procesando...' : 'Restaurar'}
                    </button>
                    <button
                      onClick={() => openDeleteModal(routine.id, routine.name)}
                      disabled={loading[routine.id]}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[routine.id] ? 'Procesando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron rutinas archivadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && routineToRestore && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar restauración
              </h3>
              <button 
                onClick={closeRestoreModal}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                ¿Estás seguro de que deseas restaurar la rutina <span className="font-semibold">"{routineToRestore.name}"</span>?
              </p>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                La rutina volverá a estar activa y disponible para los usuarios.
              </p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeRestoreModal}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRestore}
                  disabled={loading[routineToRestore.id]}
                  className="px-4 py-2 text-sm text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[routineToRestore.id] ? 'Restaurando...' : 'Restaurar rutina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && routineToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar eliminación
              </h3>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                ¿Estás seguro de que deseas eliminar permanentemente la rutina <span className="font-semibold">"{routineToDelete.name}"</span>?
              </p>
              <p className="mb-4 text-red-600 dark:text-red-400 font-medium">
                Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading[routineToDelete.id]}
                  className="px-4 py-2 text-sm text-white bg-red-600 dark:bg-red-700 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[routineToDelete.id] ? 'Eliminando...' : 'Eliminar permanentemente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 