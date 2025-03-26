import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExerciseLibrary, ExerciseTemplate } from '../../store/exerciseStore';
import { 
  ArrowLeftIcon,
  PencilIcon, 
  TrashIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';

const ExerciseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExerciseById, deleteExercise } = useExerciseLibrary();
  
  const [exercise, setExercise] = useState<ExerciseTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    if (id) {
      const exerciseData = getExerciseById(id);
      if (exerciseData) {
        setExercise(exerciseData);
      }
      setIsLoading(false);
    }
  }, [id, getExerciseById]);
  
  const handleDelete = () => {
    if (id) {
      deleteExercise(id);
      navigate('/exercises');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse space-y-4 w-full max-w-3xl">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!exercise) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <IconWrapper
            icon={ExclamationCircleIcon}
            size="md"
            className="text-red-600 dark:text-red-400"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Exercise Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The exercise you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/exercises"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <IconWrapper icon={ArrowLeftIcon} size="xs" className="mr-2" />
          Back to Exercise Library
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link 
          to="/exercises" 
          className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <IconWrapper icon={ArrowLeftIcon} size="xs" className="mr-1" />
          Back to Exercise Library
        </Link>
      </div>
      
      {/* Exercise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {exercise.name}
          {exercise.isCustom && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Custom
            </span>
          )}
        </h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <IconWrapper icon={TrashIcon} size="xs" className="mr-1.5" />
            Delete
          </button>
          
          <Link
            to={`/exercises/edit/${exercise.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <IconWrapper icon={PencilIcon} size="xs" className="mr-1.5" />
            Edit
          </Link>
        </div>
      </div>
      
      {/* Category & Muscle Groups */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Exercise Details</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                <span className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  exercise.category === 'strength' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  exercise.category === 'cardio' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  exercise.category === 'flexibility' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  exercise.category === 'balance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                )}>
                  {exercise.category}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Muscle Groups</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroups.map((group) => (
                    <span 
                      key={group} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Sets</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{exercise.defaultSets || '-'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Reps</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{exercise.defaultReps || '-'}</dd>
            </div>
            
            {exercise.defaultWeight && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Weight</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{exercise.defaultWeight} kg</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      {/* Description & Instructions */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Description & Instructions</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
          <p className="text-sm text-gray-900 dark:text-white mb-6">
            {exercise.description || 'No description available.'}
          </p>
          
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Instructions</h4>
          <div className="prose dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-white">
            {exercise.instructions ? (
              <p>{exercise.instructions}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No instructions available.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <IconWrapper 
                  icon={ExclamationCircleIcon} 
                  size="md" 
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">Delete Exercise</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetails; 