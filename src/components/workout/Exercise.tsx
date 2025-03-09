"use client"

import { useState, useEffect } from 'react';
import { ChevronDown, Trash2, Video, Tag } from 'lucide-react';
import { Exercise as ExerciseType } from '@/types/models';
import { exerciseList } from '@/data/exercises';
import ExerciseVideoModal from './ExerciseVideoModal';
import VideoPlayer from '../ui/VideoPlayer';
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
  showVideoInline?: boolean;
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
  onDelete,
  showVideoInline = false
}: ExerciseProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [localTags, setLocalTags] = useState<BodyZone[]>(tags);
  const [showVideo, setShowVideo] = useState(showVideoInline && isExpanded);

  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  useEffect(() => {
    setShowVideo(showVideoInline && isExpanded);
  }, [showVideoInline, isExpanded]);

  const handleTagToggle = async (tag: BodyZone) => {
    if (!onUpdate) return;
    
    const newTags = localTags.includes(tag)
      ? localTags.filter(t => t !== tag)
      : [...localTags, tag];
    
    setLocalTags(newTags);
    
    try {
      await onUpdate({ tags: newTags });
    } catch (error) {
      // Revertir cambios en caso de error
      setLocalTags(tags);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div 
        className={`px-4 py-3 flex items-center justify-between cursor-pointer ${isExpanded ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
        onClick={handleToggleExpand}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {name}
          </h3>
          <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{sets} series</span>
            <span>•</span>
            <span>{reps} reps</span>
            {weight > 0 && (
              <>
                <span>•</span>
                <span>{weight} kg</span>
              </>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
        />
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex-1 min-w-0">
              {notes && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notes}</p>
                </div>
              )}
              
              {localTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {localTags.map(tag => (
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
                onClick={() => showVideoInline ? setShowVideo(!showVideo) : setIsVideoModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded transition-colors"
                aria-label={showVideoInline ? (showVideo ? "Ocultar video" : "Mostrar video") : "Ver video"}
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
          
          {showVideo && videoUrl && (
            <div className="mt-4">
              <VideoPlayer 
                videoUrl={videoUrl} 
                aspectRatio="16:9"
                controls={true}
                className="rounded-lg overflow-hidden"
              />
            </div>
          )}
          
          {isTagsOpen && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zonas del cuerpo:</h4>
              <div className="flex flex-wrap gap-2">
                {bodyZones.map(zone => (
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
        </div>
      )}

      {videoUrl && !showVideoInline && (
        <ExerciseVideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={videoUrl}
          notes={notes}
        />
      )}
    </div>
  );
} 