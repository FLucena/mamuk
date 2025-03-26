import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkoutStore, Exercise } from '../../store/workoutStore';
import { CheckIcon, PencilIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkoutById, updateWorkout, deleteWorkout } = useWorkoutStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  
  const workout = getWorkoutById(id || '');
  
  useEffect(() => {
    if (id) {
      setIsLoading(false);
      
      // Initialize all days and blocks as expanded
      if (workout) {
        const expandedDaysState: Record<string, boolean> = {};
        const expandedBlocksState: Record<string, boolean> = {};
        
        workout.days.forEach(day => {
          expandedDaysState[day.id] = true;
          
          day.blocks.forEach(block => {
            expandedBlocksState[block.id] = true;
          });
        });
        
        setExpandedDays(expandedDaysState);
        setExpandedBlocks(expandedBlocksState);
      }
    }
  }, [id, workout]);
  
  const toggleDayExpansion = (dayId: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };
  
  const toggleBlockExpansion = (blockId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }
  
  if (!workout) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="text-gray-500 dark:text-gray-400">Workout not found</div>
        <Link
          to="/workouts"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          Back to Workouts
        </Link>
      </div>
    );
  }
  
  const handleMarkAsCompleted = async () => {
    try {
      await updateWorkout(workout.id, { completed: !workout.completed });
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };
  
  const handleEdit = () => {
    navigate(`/workouts/edit/${workout.id}`);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      setIsDeleting(true);
      try {
        await deleteWorkout(workout.id);
        navigate('/workouts');
      } catch (error) {
        console.error('Error deleting workout:', error);
        setIsDeleting(false);
      }
    }
  };
  
  // Count total exercises across all blocks in a day
  const countExercisesInDay = (day: typeof workout.days[0]) => {
    return day.blocks.reduce((total, block) => total + block.exercises.length, 0);
  };
  
  return (
    <div>
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{workout.title}</h1>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={handleMarkAsCompleted}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <IconWrapper 
              icon={CheckIcon} 
              size="xs" 
              className="mr-2"
            />
            {workout.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
          </button>
          
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            <IconWrapper 
              icon={PencilIcon} 
              size="xs" 
              className="mr-2"
            />
            Edit
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
          >
            <IconWrapper 
              icon={TrashIcon} 
              size="xs" 
              className="mr-2"
            />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        <p>{workout.description}</p>
        {workout.completed && (
          <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Completed
          </span>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workout Plan</h2>
        
        {workout.days.map((day) => (
          <div key={day.id} className="mb-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            {/* Day Header */}
            <div 
              className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
              onClick={() => toggleDayExpansion(day.id)}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{day.name}</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                  {day.blocks.length} {day.blocks.length === 1 ? 'block' : 'blocks'} | 
                  {' '}{countExercisesInDay(day)} {countExercisesInDay(day) === 1 ? 'exercise' : 'exercises'}
                </span>
                <IconWrapper 
                  icon={ChevronRightIcon} 
                  size="sm" 
                  className={clsx(
                    "text-gray-500 dark:text-gray-400 transition-transform",
                    expandedDays[day.id] ? "transform rotate-90" : ""
                  )}
                />
              </div>
            </div>
            
            {/* Day Blocks */}
            {expandedDays[day.id] && (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {day.blocks.map((block) => (
                  <div key={block.id} className="bg-gray-50 dark:bg-gray-800">
                    {/* Block Header */}
                    <div 
                      className="px-4 py-3 sm:px-6 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      onClick={(e) => toggleBlockExpansion(block.id, e)}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                        <span className="text-sm">{block.name}</span>
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full">
                          {block.exercises.length} {block.exercises.length === 1 ? 'exercise' : 'exercises'}
                        </span>
                      </h4>
                      <IconWrapper 
                        icon={expandedBlocks[block.id] ? ChevronDownIcon : ChevronRightIcon} 
                        size="sm" 
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    
                    {/* Block Exercises */}
                    {expandedBlocks[block.id] && (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {block.exercises.map((exercise) => (
                          <ExerciseItem key={exercise.id} exercise={exercise} />
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <Link
          to="/workouts"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Workouts
        </Link>
      </div>
    </div>
  );
};

const ExerciseItem = ({ exercise }: { exercise: Exercise }) => {
  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{exercise.name}</h3>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex space-x-4">
          <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">{exercise.sets}</span>
            <span className="ml-1">sets</span>
          </p>
          <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
            <span className="font-medium text-gray-900 dark:text-white">{exercise.reps}</span>
            <span className="ml-1">reps</span>
          </p>
          {exercise.weight && (
            <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
              <span className="font-medium text-gray-900 dark:text-white">{exercise.weight}</span>
              <span className="ml-1">kg</span>
            </p>
          )}
        </div>
        {exercise.notes && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
            <p>Note: {exercise.notes}</p>
          </div>
        )}
      </div>
    </li>
  );
};

export default WorkoutDetail; 