"use client"

import { useState, useEffect } from 'react';
import { ChevronDown, Trash2, Video, Tag } from 'lucide-react';
import { Exercise as ExerciseType } from '@/types/models';
import { exerciseList } from '@/data/exercises';
import ExerciseVideoModal from './ExerciseVideoModal';
import { bodyZones, BodyZone } from '@/lib/constants/bodyZones';

interface ExerciseProps {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  videoUrl?: string;
  notes?: string;
  tags?: BodyZone[];
  isExpanded?: boolean;
  onToggle?: () => void;
  onUpdate?: (data: Partial<ExerciseType>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

interface ExerciseListItem {
  id: string;
  name: string;
  type?: string;
}

function groupExercisesByType() {
  return exerciseList.reduce((groups: { [key: string]: typeof exerciseList }, exercise) => {
    if (!groups[exercise.type]) {
      groups[exercise.type] = [];
    }
    groups[exercise.type].push(exercise);
    return groups;
  }, {});
}

export default function Exercise({
  name,
  sets,
  reps,
  weight,
  videoUrl,
  notes = '',
  tags = [],
  isExpanded = false,
  onToggle,
  onUpdate,
  onDelete
}: ExerciseProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [localTags, setLocalTags] = useState<BodyZone[]>(tags);

  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  const handleTagToggle = async (tag: BodyZone) => {
    const updatedTags = localTags.includes(tag)
      ? localTags.filter(t => t !== tag)
      : [...localTags, tag];
    
    setLocalTags(updatedTags);
    
    if (onUpdate) {
      await onUpdate({ tags: updatedTags });
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggle) {
      onToggle();
    } else {
      setExpanded(prevExpanded => !prevExpanded);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
      expanded ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleExpand}
              className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-expanded={expanded}
              aria-label={expanded ? "Colapsar ejercicio" : "Expandir ejercicio"}
            >
              <ChevronDown
                className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{name}</h3>
          </div>
          
          <div className="mt-2 ml-8 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {sets} series
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {reps} reps
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {weight} kg
            </span>
            
            {localTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {localTags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {videoUrl && (
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded transition-colors"
              aria-label="Ver video"
            >
              <Video className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className={`p-1 rounded transition-colors ${
              isTagsOpen 
                ? 'text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/20' 
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label={isTagsOpen ? "Ocultar zonas del cuerpo" : "Mostrar zonas del cuerpo"}
            aria-expanded={isTagsOpen}
          >
            <Tag className="h-5 w-5" />
          </button>
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
              aria-label="Eliminar ejercicio"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor={`sets-${name.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Series
              </label>
              <input
                id={`sets-${name.replace(/\s+/g, '-')}`}
                type="number"
                value={sets}
                onChange={(e) => onUpdate?.({ sets: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor={`reps-${name.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Repeticiones
              </label>
              <input
                id={`reps-${name.replace(/\s+/g, '-')}`}
                type="number"
                value={reps}
                onChange={(e) => onUpdate?.({ reps: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor={`weight-${name.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Peso (kg)
              </label>
              <input
                id={`weight-${name.replace(/\s+/g, '-')}`}
                type="number"
                value={weight}
                onChange={(e) => onUpdate?.({ weight: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`notes-${name.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notas
            </label>
            <textarea
              id={`notes-${name.replace(/\s+/g, '-')}`}
              value={notes}
              onChange={(e) => onUpdate?.({ notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={2}
            />
          </div>
        </div>
      )}

      {isTagsOpen && (
        <div className="mt-4">
          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zonas del cuerpo
          </div>
          <div className="flex flex-wrap gap-2">
            {bodyZones.map((zone) => (
              <button
                key={zone}
                onClick={() => handleTagToggle(zone)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors 
                  ${localTags.includes(zone)
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>
      )}

      {videoUrl && (
        <ExerciseVideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={videoUrl}
        />
      )}
    </div>
  );
} 