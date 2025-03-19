'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/hooks/useSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useError } from '@/contexts/ErrorContext';
import { ErrorSeverity, ErrorType } from '@/contexts/ErrorContext';
import { toast } from 'react-hot-toast';

// Define the Exercise interface with _id property
interface Exercise {
  _id: string;
  name: string;
  description?: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
}

// Schema for routine creation
const routineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  customerId: z.string().optional(),
  exercises: z.array(
    z.object({
      exercise: z.string().min(1, 'Exercise ID is required'),
      sets: z.number().min(1, 'Sets must be at least 1'),
      reps: z.number().min(1, 'Reps must be at least 1'),
      weight: z.number().min(0, 'Weight cannot be negative').default(0),
      notes: z.string().max(200).optional(),
      restTime: z.number().min(0).default(60),
    })
  ).min(1, 'At least one exercise is required'),
});

type RoutineFormData = z.infer<typeof routineSchema>;

interface CreateRoutineFormProps {
  customerId?: string;
  onSuccess?: () => void;
}

export default function CreateRoutineForm({ customerId, onSuccess }: CreateRoutineFormProps) {
  const router = useRouter();
  const { showSpinner, hideSpinner } = useSpinner();
  const { isAdmin, isCoach } = useAuth();
  const { addError } = useError();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      name: '',
      description: '',
      customerId: customerId,
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  // Fetch available exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        addError({
          message: 'Failed to load exercises',
          severity: ErrorSeverity.ERROR,
          type: ErrorType.API,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [addError]);

  const onSubmit = async (data: RoutineFormData) => {
    try {
      const hideSpinnerFn = showSpinner();
      
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create routine');
      }

      toast.success('Routine created successfully!');
      reset();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/workout');
        router.refresh();
      }
    } catch (error: unknown) {
      console.error('Error creating routine:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create routine';
        
      addError({
        message: errorMessage,
        severity: ErrorSeverity.ERROR,
        type: ErrorType.API,
      });
    } finally {
      hideSpinner();
    }
  };

  const handleAddExercise = () => {
    if (!selectedExercise) return;
    
    append({
      exercise: selectedExercise,
      sets: 3,
      reps: 10,
      weight: 0,
      notes: '',
      restTime: 60,
    });
    
    setSelectedExercise('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Routine</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Routine Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="My Workout Routine"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Describe your routine"
            rows={3}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {(isAdmin || isCoach) && !customerId && (
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium mb-1">
              Customer
            </label>
            <select
              id="customerId"
              {...register('customerId')}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a customer</option>
              {/* Customer options would be populated here */}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
            )}
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Exercises</h3>
          
          <div className="flex gap-2 mb-4">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Select an exercise</option>
              {exercises.map((exercise) => (
                <option key={exercise._id} value={exercise._id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddExercise}
              disabled={!selectedExercise || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-gray-500 italic mb-4">No exercises added yet</p>
          )}

          {errors.exercises && (
            <p className="mt-1 text-sm text-red-600">{errors.exercises.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => {
              const exercise = exercises.find(
                (e) => e._id === watch(`exercises.${index}.exercise`)
              );

              return (
                <div key={field.id} className="border rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{exercise?.name || 'Exercise'}</h4>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sets</label>
                      <Controller
                        control={control}
                        name={`exercises.${index}.sets`}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min={1}
                            className="w-full px-4 py-2 border rounded-md"
                          />
                        )}
                      />
                      {errors.exercises?.[index]?.sets && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.exercises[index]?.sets?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Reps</label>
                      <Controller
                        control={control}
                        name={`exercises.${index}.reps`}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min={1}
                            className="w-full px-4 py-2 border rounded-md"
                          />
                        )}
                      />
                      {errors.exercises?.[index]?.reps && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.exercises[index]?.reps?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                      <Controller
                        control={control}
                        name={`exercises.${index}.weight`}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            min={0}
                            step={0.5}
                            className="w-full px-4 py-2 border rounded-md"
                          />
                        )}
                      />
                      {errors.exercises?.[index]?.weight && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.exercises[index]?.weight?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      {...register(`exercises.${index}.notes`)}
                      className="w-full px-4 py-2 border rounded-md"
                      rows={2}
                    />
                    {errors.exercises?.[index]?.notes && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.exercises[index]?.notes?.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Create Routine
          </button>
        </div>
      </form>
    </div>
  );
} 