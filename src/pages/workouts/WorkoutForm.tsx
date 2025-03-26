import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { useWorkoutStore, Exercise, WorkoutDay } from '../../store/workoutStore';
import { useExerciseLibrary } from '../../store/exerciseStore';
import { 
  TrashIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';
import { generateDefaultBlocks, generateRandomExercisesForBlock } from '../../utils/exerciseUtils';
import { useLanguage } from '../../context/useLanguage';

// Generate a simple ID for exercises and days
const generateId = () => Math.random().toString(36).substring(2, 10);

interface WorkoutFormProps {
  mode: 'create' | 'edit';
  selectedExerciseId?: string | null;
}

const WorkoutForm = ({ mode, selectedExerciseId }: WorkoutFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getWorkoutById, createWorkout, updateWorkout } = useWorkoutStore();
  const { getExerciseById } = useExerciseLibrary();
  const { t } = useLanguage();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  
  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    days: WorkoutDay[];
  }>({
    title: '',
    description: '',
    days: [
      {
        id: generateId(),
        name: t('day') + ' 1',
        blocks: generateDefaultBlocks()
      }
    ]
  });
  
  // Load workout data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const workout = getWorkoutById(id);
      if (workout) {
        setFormData({
          title: workout.title,
          description: workout.description,
          days: workout.days
        });
        
        // Initialize expanded days state
        const expanded: Record<string, boolean> = {};
        const blocks: Record<string, boolean> = {};
        
        workout.days.forEach(day => {
          expanded[day.id] = true;
          
          day.blocks.forEach(block => {
            blocks[block.id] = true;
          });
        });
        
        setExpandedDays(expanded);
        setExpandedBlocks(blocks);
      } else {
        setError('Workout not found');
      }
    } else {
      // Initialize expanded days and blocks state for new workout
      const dayId = formData.days[0].id;
      const blocks: Record<string, boolean> = {};
      
      formData.days[0].blocks.forEach(block => {
        blocks[block.id] = true;
      });
      
      setExpandedDays({ [dayId]: true });
      setExpandedBlocks(blocks);
    }
  }, [mode, id, getWorkoutById, formData.days]);
  
  // Add exercise from library if selectedExerciseId is provided
  useEffect(() => {
    if (selectedExerciseId && mode === 'create') {
      const templateExercise = getExerciseById(selectedExerciseId);
      
      if (templateExercise) {
        // Add to the first block of the first day by default
        setFormData((prev) => {
          const firstDayId = prev.days[0].id;
          const firstBlockId = prev.days[0].blocks[0].id;
          const isFirstExerciseEmpty = 
            prev.days[0].blocks[0].exercises.length === 1 && 
            prev.days[0].blocks[0].exercises[0].name === '';
          
          const newExercise: Exercise = {
            id: generateId(),
            name: templateExercise.name,
            sets: templateExercise.defaultSets || 3,
            reps: templateExercise.defaultReps || 10,
            weight: templateExercise.defaultWeight,
            notes: templateExercise.description || ''
          };
          
          return {
            ...prev,
            days: prev.days.map(day => {
              if (day.id === firstDayId) {
                return {
                  ...day,
                  blocks: day.blocks.map(block => {
                    if (block.id === firstBlockId) {
                      return {
                        ...block,
                        exercises: isFirstExerciseEmpty ? [newExercise] : [...block.exercises, newExercise]
                      };
                    }
                    return block;
                  })
                };
              }
              return day;
            })
          };
        });
      }
    }
  }, [selectedExerciseId, mode, getExerciseById]);
  
  // Toggle day expansion
  const toggleDayExpansion = (dayId: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };
  
  // Toggle block expansion
  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };
  
  // Validation
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError(t('workout_title_required'));
      return false;
    }
    
    if (!formData.description.trim()) {
      setError(t('workout_description_required'));
      return false;
    }
    
    if (formData.days.length === 0) {
      setError(t('at_least_one_day_required'));
      return false;
    }
    
    for (const day of formData.days) {
      if (!day.name.trim()) {
        setError(t('day_name_required'));
        return false;
      }
      
      if (day.blocks.length === 0) {
        setError(`${t('day_must_have_block')} "${day.name}"`);
        return false;
      }
      
      for (const block of day.blocks) {
        if (!block.name.trim()) {
          setError(`${t('block_name_required')} "${day.name}"`);
          return false;
        }
        
        if (block.exercises.length === 0) {
          setError(`${t('block_must_have_exercise')} "${block.name}" in day "${day.name}"`);
          return false;
        }
        
        for (const exercise of block.exercises) {
          if (!exercise.name.trim()) {
            setError(`${t('exercise_name_required')} in block "${block.name}"`);
            return false;
          }
          
          if (exercise.sets <= 0) {
            setError(`${t('sets_must_be_positive')} in exercise "${exercise.name}"`);
            return false;
          }
          
          if (exercise.reps <= 0) {
            setError(`${t('reps_must_be_positive')} in exercise "${exercise.name}"`);
            return false;
          }
        }
      }
    }
    
    return true;
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError(t('login_required'));
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // Create a new workout
        await createWorkout({
          title: formData.title,
          description: formData.description,
          days: formData.days,
          createdBy: user.id
        });
        
        navigate('/workouts');
      } else if (mode === 'edit' && id) {
        // Update existing workout
        await updateWorkout(id, {
          title: formData.title,
          description: formData.description,
          days: formData.days
        });
        
        navigate(`/workouts/${id}`);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      setError(t('save_workout_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Day handlers
  const handleAddDay = () => {
    const newDayId = generateId();
    setFormData((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          id: newDayId,
          name: `${t('day')} ${prev.days.length + 1}`,
          blocks: generateDefaultBlocks()
        }
      ]
    }));
    
    // Expand the new day
    setExpandedDays(prev => ({
      ...prev,
      [newDayId]: true
    }));
    
    // Expand all blocks in the new day
    const expandedBlockUpdates: Record<string, boolean> = {};
    generateDefaultBlocks().forEach(block => {
      expandedBlockUpdates[block.id] = true;
    });
    
    setExpandedBlocks(prev => ({
      ...prev,
      ...expandedBlockUpdates
    }));
  };
  
  const handleUpdateDayName = (dayId: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, name } : day
      )
    }));
  };
  
  const handleRemoveDay = (dayId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.filter(day => day.id !== dayId)
    }));
  };
  
  // Block handlers
  const handleAddBlock = (dayId: string) => {
    const newBlockId = generateId();
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: [
              ...day.blocks,
              {
                id: newBlockId,
                name: `Block ${day.blocks.length + 1}`,
                exercises: [
                  {
                    id: generateId(),
                    name: '',
                    sets: 3,
                    reps: 10,
                    weight: undefined,
                    notes: ''
                  }
                ],
                isExpanded: true
              }
            ]
          };
        }
        return day;
      })
    }));
    
    // Expand the new block
    setExpandedBlocks(prev => ({
      ...prev,
      [newBlockId]: true
    }));
  };
  
  const handleUpdateBlockName = (dayId: string, blockId: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: day.blocks.map(block => 
              block.id === blockId ? { ...block, name } : block
            )
          };
        }
        return day;
      })
    }));
  };
  
  const handleRemoveBlock = (dayId: string, blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: day.blocks.filter(block => block.id !== blockId)
          };
        }
        return day;
      })
    }));
  };
  
  const handleRandomizeBlockExercises = (dayId: string, blockId: string, blockType: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: day.blocks.map(block => {
              if (block.id === blockId) {
                return {
                  ...block,
                  exercises: generateRandomExercisesForBlock(blockType, 3)
                };
              }
              return block;
            })
          };
        }
        return day;
      })
    }));
  };
  
  // Exercise handlers
  const handleAddExercise = (dayId: string, blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: day.blocks.map(block => {
              if (block.id === blockId) {
                return {
                  ...block,
                  exercises: [
                    ...block.exercises,
                    {
                      id: generateId(),
                      name: '',
                      sets: 3,
                      reps: 10,
                      weight: undefined,
                      notes: ''
                    }
                  ]
                };
              }
              return block;
            })
          };
        }
        return day;
      })
    }));
  };
  
  const handleRemoveExercise = (dayId: string, blockId: string, exerciseId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: day.blocks.map(block => {
              if (block.id === blockId) {
                return {
                  ...block,
                  exercises: block.exercises.filter(ex => ex.id !== exerciseId)
                };
              }
              return block;
            })
          };
        }
        return day;
      })
    }));
  };
  
  const handleExerciseChange = (dayId: string, blockId: string, exerciseId: string, field: keyof Exercise, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            blocks: day.blocks.map(block => {
              if (block.id === blockId) {
                return {
                  ...block,
                  exercises: block.exercises.map(ex => 
                    ex.id === exerciseId ? { ...ex, [field]: value } : ex
                  )
                };
              }
              return block;
            })
          };
        }
        return day;
      })
    }));
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to={mode === 'edit' && id ? `/workouts/${id}` : '/workouts'}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <IconWrapper 
              icon={ArrowLeftIcon} 
              size="xs"
            />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' ? t('create_workout') : t('edit_workout')}
          </h1>
        </div>
        
        <Link
          to="/exercises"
          className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          <IconWrapper 
            icon={BookOpenIcon}
            size="xs"
            className="mr-1.5"
          />
          {t('exercise_library')}
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <IconWrapper 
            icon={ExclamationCircleIcon}
            size="xs"
            className="text-red-500 dark:text-red-400 flex-shrink-0 mr-3 mt-0.5"
          />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Workout Information */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('workout_title')}
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('workout_title_placeholder')}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('workout_description_placeholder')}
              />
            </div>
          </div>
        </div>
        
        {/* Workout Days Section */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex flex-wrap gap-2 justify-between items-center">
            <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{t('workout_days')}</h2>
            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <IconWrapper 
                icon={PlusIcon}
                size="xs"
                className="mr-1.5"
              />
              {t('add_day')}
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            {formData.days.length === 0 ? (
              <div className="text-center py-6 px-4">
                <p className="text-gray-500 dark:text-gray-400">{t('no_workout_days')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {formData.days.map((day) => (
                  <div key={day.id} className="px-4 py-5">
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={day.name}
                          onChange={(e) => handleUpdateDayName(day.id, e.target.value)}
                          className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                          placeholder={t('day_name_placeholder')}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => toggleDayExpansion(day.id)}
                          className={clsx(
                            "p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none",
                            expandedDays[day.id] ? "bg-gray-100 dark:bg-gray-700/50" : ""
                          )}
                          aria-label={expandedDays[day.id] ? t('collapse_day') : t('expand_day')}
                        >
                          <IconWrapper 
                            icon={expandedDays[day.id] ? ChevronUpIcon : ChevronDownIcon}
                            size="xs"
                          />
                        </button>
                        {formData.days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(day.id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
                            aria-label={t('remove_day')}
                          >
                            <IconWrapper icon={TrashIcon} size="xs" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Day Content (Blocks) */}
                    {expandedDays[day.id] && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('workout_blocks')}</h3>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleAddBlock(day.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <IconWrapper 
                                icon={PlusIcon}
                                size="xs"
                                className="mr-1.5"
                              />
                              {t('add_block')}
                            </button>
                          </div>
                        </div>
                        
                        {day.blocks.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500 dark:text-gray-400">{t('no_blocks')}</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {day.blocks.map((block) => (
                              <div key={block.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* Block Header */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={block.name}
                                      onChange={(e) => handleUpdateBlockName(day.id, block.id, e.target.value)}
                                      className="bg-transparent text-base font-medium text-gray-900 dark:text-white border-none focus:outline-none focus:ring-0"
                                      placeholder={t('block_name_placeholder')}
                                    />
                                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full">
                                      {block.exercises.length} {block.exercises.length !== 1 ? t('exercises') : t('exercise_singular')}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => handleRandomizeBlockExercises(day.id, block.id, block.name)}
                                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                      title={t('randomize_exercises')}
                                    >
                                      <IconWrapper icon={ArrowPathIcon} size="xs" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleBlockExpansion(block.id)}
                                      className={clsx(
                                        "p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                                        expandedBlocks[block.id] ? "bg-gray-200 dark:bg-gray-600" : ""
                                      )}
                                      aria-label={expandedBlocks[block.id] ? t('collapse_block') : t('expand_block')}
                                    >
                                      <IconWrapper 
                                        icon={expandedBlocks[block.id] ? ChevronUpIcon : ChevronDownIcon}
                                        size="xs"
                                      />
                                    </button>
                                    {day.blocks.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBlock(day.id, block.id)}
                                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        aria-label={t('remove_block')}
                                      >
                                        <IconWrapper icon={TrashIcon} size="xs" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Block Exercises */}
                                {expandedBlocks[block.id] && (
                                  <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('exercises')}</h4>
                                      <div className="flex space-x-2">
                                        <Link
                                          to="/exercises"
                                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                        >
                                          <IconWrapper 
                                            icon={BookOpenIcon}
                                            size="xs"
                                            className="mr-1.5"
                                          />
                                          {t('browse_library')}
                                        </Link>
                                        <button
                                          type="button"
                                          onClick={() => handleAddExercise(day.id, block.id)}
                                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                        >
                                          <IconWrapper 
                                            icon={PlusIcon}
                                            size="xs"
                                            className="mr-1.5"
                                          />
                                          {t('add_exercise')}
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {block.exercises.length === 0 ? (
                                      <div className="text-center py-4">
                                        <p className="text-gray-500 dark:text-gray-400">{t('no_exercises')}</p>
                                      </div>
                                    ) : (
                                      <ul className="space-y-4">
                                        {block.exercises.map((exercise) => (
                                          <li key={exercise.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {t('exercise')} {block.exercises.indexOf(exercise) + 1}
                                              </h5>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveExercise(day.id, block.id, exercise.id)}
                                                className="inline-flex items-center p-1.5 border border-gray-300 dark:border-gray-600 text-xs rounded-md text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                              >
                                                <IconWrapper 
                                                  icon={TrashIcon}
                                                  size="xs"
                                                />
                                              </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                                              <div>
                                                <label htmlFor={`exercise-name-${day.id}-${block.id}-${exercise.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  {t('exercise_name')}
                                                </label>
                                                <input
                                                  type="text"
                                                  id={`exercise-name-${day.id}-${block.id}-${exercise.id}`}
                                                  value={exercise.name}
                                                  onChange={(e) => handleExerciseChange(day.id, block.id, exercise.id, 'name', e.target.value)}
                                                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                  placeholder={t('exercise_name_placeholder')}
                                                />
                                              </div>
                                              
                                              <div>
                                                <label htmlFor={`exercise-sets-${day.id}-${block.id}-${exercise.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  {t('sets')}
                                                </label>
                                                <input
                                                  type="number"
                                                  id={`exercise-sets-${day.id}-${block.id}-${exercise.id}`}
                                                  value={exercise.sets}
                                                  min={1}
                                                  onChange={(e) => handleExerciseChange(day.id, block.id, exercise.id, 'sets', parseInt(e.target.value) || 1)}
                                                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                />
                                              </div>
                                              
                                              <div>
                                                <label htmlFor={`exercise-reps-${day.id}-${block.id}-${exercise.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  {t('reps')}
                                                </label>
                                                <input
                                                  type="number"
                                                  id={`exercise-reps-${day.id}-${block.id}-${exercise.id}`}
                                                  value={exercise.reps}
                                                  min={1}
                                                  onChange={(e) => handleExerciseChange(day.id, block.id, exercise.id, 'reps', parseInt(e.target.value) || 1)}
                                                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                />
                                              </div>
                                              
                                              <div>
                                                <label htmlFor={`exercise-weight-${day.id}-${block.id}-${exercise.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  {t('weight_kg_optional')}
                                                </label>
                                                <input
                                                  type="number"
                                                  id={`exercise-weight-${day.id}-${block.id}-${exercise.id}`}
                                                  value={exercise.weight === undefined ? '' : exercise.weight}
                                                  min={0}
                                                  onChange={(e) => handleExerciseChange(
                                                    day.id,
                                                    block.id,
                                                    exercise.id, 
                                                    'weight', 
                                                    e.target.value === '' ? undefined : parseInt(e.target.value) || 0
                                                  )}
                                                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                  placeholder={t('leave_blank_bodyweight')}
                                                />
                                              </div>
                                              
                                              <div className="sm:col-span-2 lg:col-span-3">
                                                <label htmlFor={`exercise-notes-${day.id}-${block.id}-${exercise.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  {t('notes_optional')}
                                                </label>
                                                <input
                                                  type="text"
                                                  id={`exercise-notes-${day.id}-${block.id}-${exercise.id}`}
                                                  value={exercise.notes || ''}
                                                  onChange={(e) => handleExerciseChange(day.id, block.id, exercise.id, 'notes', e.target.value)}
                                                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                  placeholder={t('notes_placeholder')}
                                                />
                                              </div>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            to={mode === 'edit' && id ? `/workouts/${id}` : '/workouts'}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {t('cancel')}
          </Link>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting 
              ? t('saving') 
              : mode === 'create' 
                ? t('create_workout') 
                : t('save_changes')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm; 