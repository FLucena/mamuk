import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkoutStore, Workout } from '../../store/workoutStore';
import { useAuth } from '../../store/authStore';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';

const Workouts = () => {
  const { user } = useAuth();
  const { workouts, fetchWorkouts, deleteWorkout, toggleWorkoutCompleted } = useWorkoutStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Workout>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchWorkouts();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchWorkouts]);
  
  const filteredWorkouts = workouts
    .filter((workout) => {
      // Filter based on user role
      if (!user) return false;
      
      if (user.role === 'admin') {
        // Admins can see all workouts
        return true;
      } else if (user.role === 'coach') {
        // Coaches can see workouts they created or were assigned to them
        return workout.createdBy === user.id || workout.assignedTo?.includes(user.id);
      } else {
        // Regular users can see their own workouts or workouts assigned to them
        return workout.createdBy === user.id || workout.assignedTo?.includes(user.id);
      }
    })
    .filter((workout) => {
      // Apply search filter
      return workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter((workout) => {
      // Apply completed status filter
      if (filterCompleted === null) return true;
      return workout.completed === filterCompleted;
    })
    .sort((a, b) => {
      // Sort the filtered workouts
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else if (aValue instanceof Date && bValue instanceof Date) {
        if (sortDirection === 'asc') {
          return aValue.getTime() - bValue.getTime();
        } else {
          return bValue.getTime() - aValue.getTime();
        }
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc' ? (aValue ? 1 : -1) : (aValue ? -1 : 1);
      } else {
        // For updatedAt and createdAt, which are stored as strings but represent dates
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
    });
  
  // Handler for toggling sort direction
  const handleSort = (field: keyof Workout) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending on new field selection
    }
  };
  
  // Handler for deleting a workout
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      await deleteWorkout(id);
    }
    setIsDropdownOpen(null);
  };
  
  // Handler for toggling workout completion status
  const handleToggleCompleted = async (id: string, currentStatus: boolean) => {
    await toggleWorkoutCompleted(id, !currentStatus);
    setIsDropdownOpen(null);
  };
  
  // Handler for dropdown menu
  const toggleDropdown = (id: number | null) => {
    setIsDropdownOpen(isDropdownOpen === id ? null : id);
  };
  
  // Helper to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Workouts</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your fitness routines
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/workouts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <IconWrapper icon={PlusIcon} size="xs" className="mr-2" />
            New Workout
          </Link>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconWrapper icon={MagnifyingGlassIcon} size="xs" className="text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10 py-2 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterCompleted(filterCompleted === null ? true : filterCompleted === true ? false : null)}
              className={clsx(
                "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
                filterCompleted === null 
                  ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                  : "border-indigo-500 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
              )}
            >
              <IconWrapper icon={FunnelIcon} size="xs" className="mr-2" />
              {filterCompleted === null 
                ? "All" 
                : filterCompleted 
                  ? "Completed" 
                  : "In Progress"}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => handleSort('updatedAt')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <IconWrapper 
              icon={ArrowsUpDownIcon} 
              size="xs" 
              className={clsx(
                "mr-2",
                sortField === 'updatedAt' ? "text-indigo-500" : "text-gray-400"
              )}
            />
            {sortDirection === 'desc' ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>
      
      {/* Workouts List */}
      <div className="mt-6 bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredWorkouts.map((workout) => (
              <li key={workout.id} className="group transition-colors">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={clsx(
                      workout.completed 
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                      "flex items-center justify-center h-10 w-10 rounded-md"
                    )}>
                      <IconWrapper 
                        icon={ClipboardDocumentCheckIcon} 
                        size="sm"
                      />
                    </div>
                    <div>
                      <Link to={`/workouts/${workout.id}`}>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {workout.title}
                        </h3>
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>
                          {workout.days.reduce((total, day) => 
                            total + day.blocks.reduce((blockTotal, block) => 
                              blockTotal + block.exercises.length, 0), 0)
                          } {workout.days.reduce((total, day) => 
                            total + day.blocks.reduce((blockTotal, block) => 
                              blockTotal + block.exercises.length, 0), 0) === 1 ? 'exercise' : 'exercises'}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          Updated {new Date(workout.updatedAt).toLocaleDateString()}
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
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(Number(workout.id));
                      }}
                      className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <IconWrapper icon={EllipsisHorizontalIcon} size="sm" className="text-gray-400" />
                    </button>
                    
                    {isDropdownOpen === Number(workout.id) && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <Link
                            to={`/workouts/${workout.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            <IconWrapper icon={PencilSquareIcon} size="xs" className="mr-3 text-gray-400" />
                            View Details
                          </Link>
                          <button
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCompleted(workout.id, workout.completed || false);
                            }}
                            role="menuitem"
                          >
                            <IconWrapper icon={ClipboardDocumentCheckIcon} size="xs" className="mr-3 text-gray-400" />
                            Mark as {workout.completed ? 'Incomplete' : 'Complete'}
                          </button>
                          <button
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(workout.id);
                            }}
                            role="menuitem"
                          >
                            <IconWrapper icon={TrashIcon} size="xs" className="mr-3 text-red-500" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <IconWrapper
                icon={ClipboardDocumentCheckIcon}
                size="md"
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No workouts found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchTerm 
                ? "No workouts match your search criteria. Try a different search term."
                : filterCompleted !== null
                  ? `No ${filterCompleted ? 'completed' : 'in-progress'} workouts found. Adjust your filters to see more results.`
                  : "Create your first workout to get started with your fitness journey."
              }
            </p>
            {!searchTerm && filterCompleted === null && (
              <Link
                to="/workouts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <IconWrapper icon={PlusIcon} size="xs" className="mr-2" />
                Create Workout
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts; 