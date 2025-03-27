import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useExerciseLibrary, ExerciseTemplate } from '../../store/exerciseStore';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';
import { useLanguage } from '../../context/useLanguage';

// Unique muscle groups from our exercise library
const muscleGroups = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 
  'core', 'lower back', 'heart', 'hip flexors', 'ankles', 'legs'
];

// Categories
const categories: Array<ExerciseTemplate['category']> = [
  'strength', 'cardio', 'flexibility', 'balance', 'other'
];

const ExerciseLibrary = () => {
  const { t } = useLanguage();
  const { exercises, fetchExercises, addExercise } = useExerciseLibrary();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseTemplate['category'] | 'all'>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | 'all'>('all');
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      fetchExercises();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchExercises]);
  
  // Filter exercises based on search query, category, and muscle group
  const filteredExercises = exercises.filter((exercise) => {
    // Filter by search query
    if (searchQuery && !exercise.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== 'all' && exercise.category !== selectedCategory) {
      return false;
    }
    
    // Filter by muscle group
    if (selectedMuscleGroup !== 'all' && !exercise.muscleGroups.includes(selectedMuscleGroup)) {
      return false;
    }
    
    return true;
  });
  
  // Add a new custom exercise
  const handleAddExercise = (newExercise: Omit<ExerciseTemplate, 'id'>) => {
    addExercise(newExercise);
    setShowAddExerciseModal(false);
  };
  
  return (
    <div>
      {/* Header section - improved layout for small screens */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('nav_exercises')}</h1>
        
        <button
          type="button"
          onClick={() => setShowAddExerciseModal(true)}
          className="inline-flex items-center justify-center p-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          aria-label={t('add_custom_exercise')}
          title={t('add_custom_exercise')}
        >
          <IconWrapper 
            icon={PlusIcon} 
            size="sm" 
            className="text-white"
          />
        </button>
      </div>
      
      {/* Search and Filters - improved for mobile */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconWrapper 
                icon={MagnifyingGlassIcon} 
                size="sm" 
                className="text-gray-400 dark:text-gray-500" 
              />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_exercises')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center p-2.5 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors sm:w-auto w-full"
            aria-label={t('filters')}
            title={t('filters')}
          >
            <IconWrapper 
              icon={AdjustmentsHorizontalIcon} 
              size="sm" 
              className="text-gray-500 dark:text-gray-400" 
            />
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('category')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full",
                    selectedCategory === 'all'
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                    "hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                  )}
                >
                  {t('all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={clsx(
                      "px-3 py-1 text-xs font-medium rounded-full capitalize",
                      selectedCategory === category
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                      "hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                    )}
                  >
                    {t(category)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('muscle_group')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMuscleGroup('all')}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full",
                    selectedMuscleGroup === 'all'
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                    "hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                  )}
                >
                  {t('all')}
                </button>
                {muscleGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedMuscleGroup(group)}
                    className={clsx(
                      "px-3 py-1 text-xs font-medium rounded-full capitalize",
                      selectedMuscleGroup === group
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                      "hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                    )}
                  >
                    {t(group)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Exercise Grid - improved for different screen sizes */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse space-y-4 w-full max-w-3xl">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise} 
                onViewDetails={() => setShowExerciseDetails(exercise.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <IconWrapper
                icon={InformationCircleIcon}
                size="md"
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t('no_exercises_found')}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMuscleGroup('all');
              }}
              className="mt-4 inline-flex items-center justify-center p-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label={t('clear_filters')}
              title={t('clear_filters')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <AddExerciseModal 
          onClose={() => setShowAddExerciseModal(false)} 
          onAdd={handleAddExercise} 
        />
      )}
      
      {/* Exercise Details Modal - improved for mobile responsiveness */}
      {showExerciseDetails && (
        <ExerciseDetailsModal 
          exerciseId={showExerciseDetails} 
          onClose={() => setShowExerciseDetails(null)} 
        />
      )}
    </div>
  );
};

// Exercise Card Component
const ExerciseCard = ({ 
  exercise, 
  onViewDetails 
}: { 
  exercise: ExerciseTemplate; 
  onViewDetails: () => void;
}) => {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  
  // Default placeholder image if none is provided
  const thumbnailUrl = exercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZXhlcmNpc2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60';
  
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 flex flex-col h-full">
      {/* Thumbnail image with zoom effect */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700 group">
        {!imageError ? (
          <img 
            src={thumbnailUrl} 
            alt={exercise.name} 
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="sr-only">{exercise.name}</span>
          </div>
        )}
        
        {/* Optional hover overlay for better contrast */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {exercise.name}
          </h3>
          {exercise.isCustom && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {t('custom')}
            </span>
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">
          {exercise.description || t('no_description')}
        </p>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
            {t(exercise.category)}
          </span>
          
          {/* Show first 2 muscle groups */}
          {exercise.muscleGroups.slice(0, 2).map((group) => (
            <span 
              key={group} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize"
            >
              {t(group)}
            </span>
          ))}
          
          {/* Show count of additional muscle groups */}
          {exercise.muscleGroups.length > 2 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              +{exercise.muscleGroups.length - 2} {t('more')}
            </span>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3 mt-auto">
        <button
          type="button"
          onClick={onViewDetails}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors w-full text-center"
        >
          {t('view_details')}
        </button>
      </div>
    </div>
  );
};

// Exercise Details Modal - improved for mobile responsiveness
const ExerciseDetailsModal = ({ 
  exerciseId, 
  onClose 
}: { 
  exerciseId: string; 
  onClose: () => void;
}) => {
  const { t } = useLanguage();
  const { getExerciseById } = useExerciseLibrary();
  const exercise = getExerciseById(exerciseId);
  const modalRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  
  // Close on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!exercise) {
    return null;
  }
  
  // Demo video URL - in a real app, this would come from your database
  const videoUrl = exercise.videoUrl || 'https://www.youtube.com/embed/IODxDxX7oi4';
  
  // Default image if none provided
  const imageUrl = exercise.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZXhlcmNpc2V8ZW58MHx8MHx8&auto=format&fit=crop&w=1200&q=80';
  
  // Mock similar exercises based on muscle group (in a real app, would come from backend)
  const similarExercises = [
    { id: 'similar1', name: 'Similar Exercise 1', muscleGroups: exercise.muscleGroups },
    { id: 'similar2', name: 'Similar Exercise 2', muscleGroups: exercise.muscleGroups },
    { id: 'similar3', name: 'Similar Exercise 3', muscleGroups: exercise.muscleGroups }
  ];
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm"
            aria-label={t('close')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Exercise image/banner */}
          <div className="h-40 sm:h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            {!imageError ? (
              <img 
                src={imageUrl}
                alt={exercise.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                <svg className="w-16 sm:w-24 h-16 sm:h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="sr-only">{exercise.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{exercise.name}</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                  {t(exercise.category)}
                </span>
                
                {exercise.muscleGroups.map((group) => (
                  <span 
                    key={group} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize"
                  >
                    {t(group)}
                  </span>
                ))}
              </div>
              
              {/* Description */}
              {exercise.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('description')}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{exercise.description}</p>
                </div>
              )}
              
              {/* Instructions */}
              {exercise.instructions && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('instructions')}</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{exercise.instructions}</p>
                  </div>
                </div>
              )}
              
              {/* Video demonstration */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('video_demonstration')}</h3>
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-lg">
                  <iframe
                    src={videoUrl}
                    title={`${exercise.name} demonstration`}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              {/* Default Values */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('default_values')}</h3>
                <ul className="space-y-3">
                  {exercise.defaultSets && (
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('default_sets')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{exercise.defaultSets}</span>
                    </li>
                  )}
                  
                  {exercise.defaultReps && (
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('default_reps')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{exercise.defaultReps}</span>
                    </li>
                  )}
                  
                  {exercise.defaultWeight && (
                    <li className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('default_weight')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{exercise.defaultWeight} kg</span>
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Similar Exercises */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('similar_exercises')}</h3>
                <ul className="space-y-3">
                  {similarExercises.map((similar) => (
                    <li key={similar.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-900 dark:text-white">{similar.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {similar.muscleGroups.slice(0, 2).map((group) => (
                          <span 
                            key={group} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize"
                          >
                            {t(group)}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link
              to={`/workouts/create?exerciseId=${exercise.id}`}
              className="inline-flex items-center justify-center p-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label={t('use_in_workout')}
              title={t('use_in_workout')}
            >
              <IconWrapper 
                icon={BookmarkIcon} 
                size="sm" 
                className="text-white"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Exercise Modal
const AddExerciseModal = ({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void; 
  onAdd: (exercise: Omit<ExerciseTemplate, 'id'>) => void;
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<ExerciseTemplate, 'id'>>({
    name: '',
    category: 'strength',
    muscleGroups: [],
    isCustom: true,
    defaultSets: 3,
    defaultReps: 10,
  });
  
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<Record<string, boolean>>(
    muscleGroups.reduce((acc, curr) => ({ ...acc, [curr]: false }), {})
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'defaultSets' || name === 'defaultReps' || name === 'defaultWeight') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleMuscleGroupChange = (group: string) => {
    const newSelectedGroups = {
      ...selectedMuscleGroups,
      [group]: !selectedMuscleGroups[group],
    };
    
    setSelectedMuscleGroups(newSelectedGroups);
    
    const selectedGroups = Object.entries(newSelectedGroups)
      .filter(entry => entry[1])
      .map(entry => entry[0]);
    
    setFormData((prev) => ({
      ...prev,
      muscleGroups: selectedGroups,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert(t('exercise_name_required'));
      return;
    }
    
    if (formData.muscleGroups.length === 0) {
      alert(t('select_muscle_group'));
      return;
    }
    
    onAdd(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('add_custom_exercise')}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="sr-only">{t('close')}</span>
              <span className="text-xl">&times;</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Exercise Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('exercise_name')} *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('exercise_name_placeholder')}
              />
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('category')} *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="capitalize">
                    {t(category)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Muscle Groups */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('muscle_groups')} *
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {muscleGroups.map((group) => (
                  <div key={group} className="flex items-center">
                    <input
                      id={`muscle-${group}`}
                      name={`muscle-${group}`}
                      type="checkbox"
                      checked={selectedMuscleGroups[group]}
                      onChange={() => handleMuscleGroupChange(group)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-700 rounded"
                    />
                    <label htmlFor={`muscle-${group}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300 capitalize">
                      {t(group)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Default Sets and Reps */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="defaultSets" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('default_sets')}
                </label>
                <input
                  type="number"
                  name="defaultSets"
                  id="defaultSets"
                  value={formData.defaultSets === undefined ? '' : formData.defaultSets}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="defaultReps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('default_reps')}
                </label>
                <input
                  type="number"
                  name="defaultReps"
                  id="defaultReps"
                  value={formData.defaultReps === undefined ? '' : formData.defaultReps}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="defaultWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('default_weight_kg')}
                </label>
                <input
                  type="number"
                  name="defaultWeight"
                  id="defaultWeight"
                  value={formData.defaultWeight === undefined ? '' : formData.defaultWeight}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('leave_blank_bodyweight')}
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={formData.description || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('description_placeholder')}
              />
            </div>
            
            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('instructions')}
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={formData.instructions || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('instructions_placeholder')}
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {t('cancel')}
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {t('add_exercise')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary; 