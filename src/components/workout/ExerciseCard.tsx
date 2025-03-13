'use client';

import { useState } from 'react';
import { useSpinner } from '@/hooks/useSpinner';
import { toast } from 'react-hot-toast';

interface ExerciseData {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  imageUrl?: string;
}

interface ExerciseCardProps {
  exercise: ExerciseData;
  workoutId: string;
  onUpdate?: (exerciseId: string, data: Partial<ExerciseData>) => void;
  readOnly?: boolean;
}

export default function ExerciseCard({ 
  exercise, 
  workoutId, 
  onUpdate,
  readOnly = false 
}: ExerciseCardProps) {
  const { showSpinner, hideSpinner } = useSpinner();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    notes: exercise.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For number inputs, convert to number
    if (name === 'sets' || name === 'reps' || name === 'weight') {
      const numValue = name === 'weight' 
        ? parseFloat(value) || 0 
        : parseInt(value) || 0;
        
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (readOnly) return;
    
    try {
      setIsSaving(true);
      const hideSpinnerFn = showSpinner();
      
      // API call to update the exercise
      const response = await fetch(`/api/workout/${workoutId}/exercise/${exercise.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update exercise');
      }
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(exercise.id, formData);
      }
      
      toast.success('Exercise updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating exercise:', error);
      toast.error(error.message || 'Failed to update exercise');
    } finally {
      setIsSaving(false);
      hideSpinner();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">{exercise.name}</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>
      
      {exercise.imageUrl && (
        <div className="mb-3">
          <img 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sets
          </label>
          {isEditing ? (
            <input
              type="number"
              name="sets"
              value={formData.sets}
              onChange={handleChange}
              min={1}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {formData.sets}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reps
          </label>
          {isEditing ? (
            <input
              type="number"
              name="reps"
              value={formData.reps}
              onChange={handleChange}
              min={1}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {formData.reps}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight (kg)
          </label>
          {isEditing ? (
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min={0}
              step={0.5}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {formData.weight}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        {isEditing ? (
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md min-h-[60px]">
            {formData.notes || 'No notes'}
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
} 