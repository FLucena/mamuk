import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWorkoutStore, Exercise, WorkoutDay, WorkoutBlock } from '../../store/workoutStore';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  ArrowUturnLeftIcon, 
  CheckIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';
import { generateDefaultBlocks } from '../../utils/exerciseUtils';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkoutById, updateWorkout, deleteWorkout, toggleWorkoutCompleted } = useWorkoutStore();
  const [workout, setWorkout] = useState(id ? getWorkoutById(id) : null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: workout?.title || '',
    description: workout?.description || '',
    days: workout?.days || [],
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundWorkout = getWorkoutById(id);
      setWorkout(foundWorkout);
      if (foundWorkout) {
        setFormData({
          title: foundWorkout.title,
          description: foundWorkout.description,
          days: foundWorkout.days
        });
      }
    }
  }, [id, getWorkoutById]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle day name changes
  const handleDayNameChange = (dayIndex: number, newName: string) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      name: newName
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Handle block name changes
  const handleBlockNameChange = (dayIndex: number, blockIndex: number, newName: string) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: [...updatedDays[dayIndex].blocks]
    };
    updatedDays[dayIndex].blocks[blockIndex] = {
      ...updatedDays[dayIndex].blocks[blockIndex],
      name: newName
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Toggle block expansion
  const handleToggleBlockExpanded = (dayIndex: number, blockIndex: number) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: [...updatedDays[dayIndex].blocks]
    };
    
    updatedDays[dayIndex].blocks[blockIndex] = {
      ...updatedDays[dayIndex].blocks[blockIndex],
      isExpanded: !updatedDays[dayIndex].blocks[blockIndex].isExpanded
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Toggle day expansion
  const handleToggleDayExpanded = (dayIndex: number) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      isExpanded: !updatedDays[dayIndex].isExpanded
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Add a new day
  const handleAddDay = () => {
    const newDayNumber = formData.days.length + 1;
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      name: `Day ${newDayNumber}`,
      blocks: generateDefaultBlocks(),
      isExpanded: true
    };
    
    setFormData({
      ...formData,
      days: [...formData.days, newDay]
    });
  };
  
  // Remove a day
  const handleRemoveDay = (dayIndex: number) => {
    if (formData.days.length <= 1) {
      alert("You must have at least one day in your workout.");
      return;
    }
    
    const updatedDays = [...formData.days];
    updatedDays.splice(dayIndex, 1);
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Add a new block to a day
  const handleAddBlock = (dayIndex: number) => {
    const updatedDays = [...formData.days];
    const blockCount = updatedDays[dayIndex].blocks.length;
    
    const newBlock: WorkoutBlock = {
      id: `block-${Date.now()}`,
      name: `Block ${blockCount + 1}`,
      exercises: [],
      isExpanded: true
    };
    
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: [...updatedDays[dayIndex].blocks, newBlock]
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Remove a block from a day
  const handleRemoveBlock = (dayIndex: number, blockIndex: number) => {
    if (formData.days[dayIndex].blocks.length <= 1) {
      alert("Each day must have at least one block.");
      return;
    }
    
    const updatedDays = [...formData.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: [...updatedDays[dayIndex].blocks]
    };
    
    updatedDays[dayIndex].blocks.splice(blockIndex, 1);
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Handle exercise changes
  const handleExerciseChange = (
    dayIndex: number, 
    blockIndex: number, 
    exerciseIndex: number, 
    field: keyof Exercise, 
    value: string | number
  ) => {
    const updatedDays = [...formData.days];
    const updatedBlocks = [...updatedDays[dayIndex].blocks];
    const updatedExercises = [...updatedBlocks[blockIndex].exercises];
    
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      [field]: field === 'name' || field === 'notes' ? value : Number(value)
    };
    
    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      exercises: updatedExercises
    };
    
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: updatedBlocks
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Add exercise to a block
  const handleAddExercise = (dayIndex: number, blockIndex: number) => {
    const updatedDays = [...formData.days];
    const newExercise: Exercise = {
      id: `${Date.now()}`,
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      notes: ''
    };
    
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: [...updatedDays[dayIndex].blocks]
    };
    
    updatedDays[dayIndex].blocks[blockIndex] = {
      ...updatedDays[dayIndex].blocks[blockIndex],
      exercises: [...updatedDays[dayIndex].blocks[blockIndex].exercises, newExercise]
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  // Remove exercise from a block
  const handleRemoveExercise = (dayIndex: number, blockIndex: number, exerciseIndex: number) => {
    const updatedDays = [...formData.days];
    const updatedExercises = [...updatedDays[dayIndex].blocks[blockIndex].exercises];
    updatedExercises.splice(exerciseIndex, 1);
    
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      blocks: [...updatedDays[dayIndex].blocks]
    };
    
    updatedDays[dayIndex].blocks[blockIndex] = {
      ...updatedDays[dayIndex].blocks[blockIndex],
      exercises: updatedExercises
    };
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (id) {
        await updateWorkout(id, formData);
        setWorkout(getWorkoutById(id));
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update workout:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        setIsLoading(true);
        if (id) {
          await deleteWorkout(id);
          navigate('/workouts');
        }
      } catch (error) {
        console.error('Failed to delete workout:', error);
        setIsLoading(false);
      }
    }
  };
  
  const handleToggleComplete = async () => {
    if (id && workout) {
      try {
        setIsLoading(true);
        await toggleWorkoutCompleted(id, !(workout.completed || false));
        setWorkout(getWorkoutById(id));
      } catch (error) {
        console.error('Failed to toggle completion status:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  if (!workout) {
    return (
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <IconWrapper
            icon={ClipboardDocumentCheckIcon}
            size="md"
            className="text-gray-400 dark:text-gray-500"
          />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workout not found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The workout you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/workouts"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <IconWrapper icon={ArrowUturnLeftIcon} size="xs" className="mr-2" />
          Back to Workouts
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center space-x-3">
          <div className={clsx(
            workout.completed 
              ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
            "flex items-center justify-center h-12 w-12 rounded-md"
          )}>
            <IconWrapper 
              icon={ClipboardDocumentCheckIcon} 
              size="md"
            />
          </div>
          <div className="min-w-0 flex-1">
            {isEditMode ? (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-xl sm:leading-6"
                placeholder="Workout Title"
                required
              />
            ) : (
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white truncate">
                {workout.title}
              </h1>
            )}
            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Created {new Date(workout.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>
                {workout.days.reduce((total, day) => 
                  total + day.blocks.reduce((blockTotal, block) => 
                    blockTotal + block.exercises.length, 0), 0)
                } {workout.days.reduce((total, day) => 
                    total + day.blocks.reduce((blockTotal, block) => 
                      blockTotal + block.exercises.length, 0), 0) === 1 ? 'exercise' : 'exercises'}
              </span>
              {workout.completed && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Completed
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex sm:mt-0 sm:ml-4 space-x-2">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleComplete}
                className={clsx(
                  "inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
                  workout.completed
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                    : "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
                )}
                disabled={isLoading}
              >
                <IconWrapper 
                  icon={CheckIcon} 
                  size="xs" 
                  className="mr-2" 
                />
                Mark as {workout.completed ? 'Incomplete' : 'Complete'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                disabled={isLoading}
              >
                <IconWrapper icon={PencilSquareIcon} size="xs" className="mr-2" />
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                disabled={isLoading}
              >
                <IconWrapper icon={TrashIcon} size="xs" className="mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-6 bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            {isEditMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                placeholder="Describe your workout"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {workout.description || "No description provided."}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Workout Days */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workout Plan</h3>
          {isEditMode && (
            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <IconWrapper icon={PlusIcon} size="xs" className="mr-2" />
              Add Day
            </button>
          )}
        </div>
        
        {/* Days */}
        {formData.days.map((day, dayIndex) => (
          <div 
            key={day.id} 
            className="mb-6 bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700"
          >
            {/* Day Header */}
            <div 
              className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer"
              onClick={() => !isEditMode && handleToggleDayExpanded(dayIndex)}
            >
              <div className="flex items-center">
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDayExpanded(dayIndex);
                    }}
                    className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <IconWrapper 
                      icon={day.isExpanded ? ChevronUpIcon : ChevronDownIcon} 
                      size="sm" 
                    />
                  </button>
                )}
                
                {isEditMode ? (
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => handleDayNameChange(dayIndex, e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                    placeholder="Day Name"
                  />
                ) : (
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {day.name}
                  </h4>
                )}
                
                <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                  {day.blocks.reduce((total, block) => total + block.exercises.length, 0)} exercises
                </span>
              </div>
              
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(dayIndex)}
                  className="inline-flex items-center px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  <IconWrapper icon={TrashIcon} size="xs" className="mr-1" />
                  Remove Day
                </button>
              )}
            </div>
            
            {/* Day Content */}
            {(day.isExpanded || isEditMode) && (
              <div className="p-4 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Blocks */}
                {day.blocks.map((block, blockIndex) => (
                  <div key={block.id} className="py-4 first:pt-0 last:pb-0">
                    {/* Block Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {!isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleToggleBlockExpanded(dayIndex, blockIndex)}
                            className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <IconWrapper 
                              icon={block.isExpanded ? ChevronUpIcon : ChevronDownIcon} 
                              size="xs" 
                            />
                          </button>
                        )}
                        
                        {isEditMode ? (
                          <input
                            type="text"
                            value={block.name}
                            onChange={(e) => handleBlockNameChange(dayIndex, blockIndex, e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                            placeholder="Block Name"
                          />
                        ) : (
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {block.name}
                          </h5>
                        )}
                        
                        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                          {block.exercises.length} exercises
                        </span>
                      </div>
                      
                      {isEditMode && (
                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => handleAddExercise(dayIndex, blockIndex)}
                            className="inline-flex items-center px-2 py-1 mr-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md"
                          >
                            <IconWrapper icon={PlusIcon} size="xs" className="mr-1" />
                            Add Exercise
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(dayIndex, blockIndex)}
                            className="inline-flex items-center px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          >
                            <IconWrapper icon={TrashIcon} size="xs" className="mr-1" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Exercises */}
                    {(block.isExpanded || isEditMode) && (
                      <div className="space-y-4 mt-3 pl-6">
                        {block.exercises.length > 0 ? (
                          block.exercises.map((exercise, exerciseIndex) => (
                            <div 
                              key={exercise.id} 
                              className={clsx(
                                "p-3 rounded-md",
                                isEditMode 
                                  ? "border border-gray-200 dark:border-gray-700" 
                                  : "bg-gray-50 dark:bg-gray-750"
                              )}
                            >
                              {isEditMode ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <input
                                      type="text"
                                      value={exercise.name}
                                      onChange={(e) => handleExerciseChange(dayIndex, blockIndex, exerciseIndex, 'name', e.target.value)}
                                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                                      placeholder="Exercise name"
                                    />
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveExercise(dayIndex, blockIndex, exerciseIndex)}
                                      className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded"
                                    >
                                      <IconWrapper icon={TrashIcon} size="xs" />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Sets
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={exercise.sets}
                                        onChange={(e) => handleExerciseChange(dayIndex, blockIndex, exerciseIndex, 'sets', e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-xs sm:leading-4"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Reps
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={exercise.reps}
                                        onChange={(e) => handleExerciseChange(dayIndex, blockIndex, exerciseIndex, 'reps', e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-xs sm:leading-4"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Weight (kg)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={exercise.weight || 0}
                                        onChange={(e) => handleExerciseChange(dayIndex, blockIndex, exerciseIndex, 'weight', e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-xs sm:leading-4"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={exercise.notes || ''}
                                      onChange={(e) => handleExerciseChange(dayIndex, blockIndex, exerciseIndex, 'notes', e.target.value)}
                                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-xs sm:leading-4"
                                      placeholder="Additional instructions"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between items-start">
                                    <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {exercise.name}
                                    </h6>
                                  </div>
                                  
                                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Sets:</span> {exercise.sets}
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Reps:</span> {exercise.reps}
                                    </div>
                                    {exercise.weight !== undefined && exercise.weight > 0 && (
                                      <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Weight:</span> {exercise.weight} kg
                                      </div>
                                    )}
                                    {exercise.notes && (
                                      <div className="w-full mt-1">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {exercise.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No exercises in this block.
                              {isEditMode && " Use the 'Add Exercise' button to add some."}
                            </p>
                          </div>
                        )}
                        
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleAddExercise(dayIndex, blockIndex)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                          >
                            <IconWrapper icon={PlusIcon} size="xs" className="mr-1" />
                            Add Exercise to {block.name}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {isEditMode && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleAddBlock(dayIndex)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    >
                      <IconWrapper icon={PlusIcon} size="xs" className="mr-1" />
                      Add Block to {day.name}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Add First Day if None Exist */}
        {formData.days.length === 0 && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isEditMode 
                ? "Add a day to your workout using the button below."
                : "No workout days have been added yet."
              }
            </p>
            
            {isEditMode && (
              <button
                type="button"
                onClick={handleAddDay}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <IconWrapper icon={PlusIcon} size="xs" className="mr-2" />
                Add First Day
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Back Button */}
      <div className="mt-8">
        <Link
          to="/workouts"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <IconWrapper icon={ArrowUturnLeftIcon} size="xs" className="mr-2" />
          Back to Workouts
        </Link>
      </div>
    </div>
  );
};

export default WorkoutDetail; 