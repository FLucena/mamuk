import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { useWorkoutStore, Workout } from '../../store/workoutStore';
import { PlusIcon } from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import { useLanguage } from '../../context/useLanguage';

const Workouts = () => {
  const { user } = useAuth();
  const { workouts, fetchWorkouts } = useWorkoutStore();
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  
  useEffect(() => {
    const loadData = async () => {
      await fetchWorkouts();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchWorkouts]);
  
  // Filter workouts based on user role
  const filteredWorkouts = workouts.filter((workout) => {
    if (!user) return false;
    
    if (user.role === 'admin') {
      // Admins can see all workouts
      return true;
    } else if (user.role === 'coach') {
      // Coaches can see workouts they created or were assigned to them
      return workout.createdBy === user._id || workout.assignedTo?.includes(user._id);
    } else {
      // Regular users can see their own workouts or workouts assigned to them
      return workout.createdBy === user._id || workout.assignedTo?.includes(user._id);
    }
  });
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('nav_workouts')}</h1>
        <Link
          to="/workouts/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <IconWrapper 
            icon={PlusIcon} 
            size="xs" 
            className="mr-2"
          />
          {t('new_workout')}
        </Link>
      </div>
      
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse space-y-4 w-full max-w-3xl">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWorkouts.map((workout) => (
                <WorkoutItem key={workout.id} workout={workout} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <IconWrapper
                icon={PlusIcon}
                size="md"
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t('no_workouts_found')}</p>
            <Link
              to="/workouts/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <IconWrapper 
                icon={PlusIcon} 
                size="xs" 
                className="mr-2"
              />
              {t('create_workout')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkoutItem = ({ workout }: { workout: Workout }) => {
  const { t } = useLanguage();
  // Calculate total exercises across all blocks
  const totalExercises = workout.days.reduce((sum, day) => {
    return sum + day.blocks.reduce((blockSum, block) => {
      return blockSum + block.exercises.length;
    }, 0);
  }, 0);
  
  // Calculate total blocks across all days
  const totalBlocks = workout.days.reduce((sum, day) => sum + day.blocks.length, 0);
  
  return (
    <li>
      <Link to={`/workouts/${workout.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{workout.title}</p>
              {workout.completed && (
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {t('status_completed')}
                </span>
              )}
            </div>
            <div className="ml-2 flex-shrink-0 flex flex-wrap gap-2">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {workout.days.length} {workout.days.length === 1 ? t('day_singular') : t('day_plural')}
              </p>
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {totalBlocks} {totalBlocks === 1 ? t('block_singular') : t('block_plural')}
              </p>
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {totalExercises} {totalExercises === 1 ? t('exercise_singular') : t('exercises')}
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                {workout.description}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
              <p>
                {t('updated')}: {new Date(workout.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default Workouts; 