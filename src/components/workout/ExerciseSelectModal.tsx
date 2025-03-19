'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Check } from 'lucide-react';
import { exerciseList } from '@/data/exercises';
import { BodyZone } from '@/lib/constants/bodyZones';

// Helper function to convert exercise type to BodyZone tag
function typeToBodyZone(type: string): BodyZone[] {
  const typeLower = type.toLowerCase();
  
  // Direct mappings
  const mappings: Record<string, BodyZone[]> = {
    'pecho': ['Pecho'],
    'espalda': ['Espalda'],
    'piernas': ['Piernas'],
    'hombros': ['Hombros'],
    'brazos': ['Bíceps', 'Tríceps'],
    'biceps': ['Bíceps'],
    'triceps': ['Tríceps'],
    'core': ['Core', 'Abdominales'],
    'abdominales': ['Abdominales'],
    'gluteos': ['Glúteos'],
    'cardio': ['Cardio'],
  };
  
  return mappings[typeLower] || ['Full Body'];
}

// Group exercises by type for the dropdown
const exercisesByType = exerciseList.reduce((groups, exercise) => {
  const type = exercise.type || 'Otros';
  if (!groups[type]) {
    groups[type] = [];
  }
  groups[type].push(exercise);
  return groups;
}, {} as Record<string, typeof exerciseList>);

// Sort exercise types alphabetically
const exerciseTypes = Object.keys(exercisesByType).sort();

interface ExerciseSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: { 
    id: string; 
    name: string; 
    videoUrl?: string; 
    notes?: string;
    tags?: BodyZone[];
  }) => Promise<void>;
  currentExerciseName: string;
}

export default function ExerciseSelectModal({
  isOpen,
  onClose,
  onSelectExercise,
  currentExerciseName
}: ExerciseSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<{ 
    id: string; 
    name: string; 
    videoUrl?: string; 
    notes?: string;
    type?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset selected exercise when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedExercise(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Find the current exercise in the list
  useEffect(() => {
    const currentExercise = exerciseList.find(e => e.name === currentExerciseName);
    if (currentExercise) {
      setSelectedExercise(currentExercise);
    }
  }, [currentExerciseName]);

  const filteredExercises = useCallback(() => {
    if (!searchTerm.trim()) {
      return exercisesByType;
    }

    const search = searchTerm.toLowerCase().trim();
    const filtered: Record<string, typeof exerciseList> = {};

    Object.entries(exercisesByType).forEach(([type, exercises]) => {
      const matchingExercises = exercises.filter(
        exercise => exercise.name.toLowerCase().includes(search) || 
                   (exercise.notes && exercise.notes.toLowerCase().includes(search)) ||
                   type.toLowerCase().includes(search)
      );

      if (matchingExercises.length > 0) {
        filtered[type] = matchingExercises;
      }
    });

    return filtered;
  }, [searchTerm]);

  const handleSelectExercise = async () => {
    if (!selectedExercise) return;
    
    setLoading(true);
    try {
      // Generate tags from the exercise type if available
      const tags = selectedExercise.type ? typeToBodyZone(selectedExercise.type) : undefined;
      
      await onSelectExercise({
        ...selectedExercise,
        tags
      });
    } catch (error) {
      console.error('Error selecting exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = filteredExercises();
  const hasResults = Object.keys(filtered).length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Cambiar ejercicio
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ejercicios..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {hasResults ? (
            <div className="space-y-4">
              {exerciseTypes.map(type => {
                if (!filtered[type]) return null;
                
                return (
                  <div key={type} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 mb-1">
                      {type}
                    </h4>
                    <ul className="space-y-1">
                      {filtered[type].map(exercise => (
                        <li key={exercise.id}>
                          <button
                            onClick={() => setSelectedExercise(exercise)}
                            disabled={loading}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                              selectedExercise?.id === exercise.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <span className="line-clamp-1">{exercise.name}</span>
                            {selectedExercise?.id === exercise.id && (
                              <Check size={16} className="text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No se encontraron ejercicios que coincidan con la búsqueda.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSelectExercise}
            disabled={loading || !selectedExercise || selectedExercise.name === currentExerciseName}
            className="px-4 py-2 text-sm text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 