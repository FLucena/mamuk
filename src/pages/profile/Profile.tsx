import { useState, useEffect } from 'react';
import { useAuth, User } from '../../store/authStore';
import { useWorkoutStore, Workout } from '../../store/workoutStore';
import { 
  UserIcon,
  CalendarIcon,
  ScaleIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import IconWrapper from '../../components/IconWrapper';

// Sample fitness data (would ideally come from its own store)
interface FitnessStats {
  height: number;
  weight: number;
  bodyFat: number;
  totalWorkouts: number;
  streakDays: number;
  lastWorkout: Date | null;
  caloriesBurned: number;
  personalBests: { exercise: string; weight: number; date: Date }[];
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { workouts } = useWorkoutStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  // Sample stats - would normally fetch from API
  const [fitnessStats, setFitnessStats] = useState<FitnessStats>({
    height: 175, // cm
    weight: 75, // kg
    bodyFat: 15, // percentage
    totalWorkouts: 0,
    streakDays: 0,
    lastWorkout: null,
    caloriesBurned: 0,
    personalBests: [
      { exercise: 'Bench Press', weight: 100, date: new Date('2025-02-15') },
      { exercise: 'Squat', weight: 120, date: new Date('2025-03-01') },
      { exercise: 'Deadlift', weight: 140, date: new Date('2025-02-20') }
    ]
  });

  // Calculate stats based on workouts
  useEffect(() => {
    if (workouts.length > 0) {
      // Filter user's workouts
      const userWorkouts = workouts.filter(w => 
        w.createdBy === user?.id || (w.assignedTo && w.assignedTo.includes(user?.id || ''))
      );
      
      // Sort by date
      const sortedWorkouts = [...userWorkouts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Calculate stats
      const completedWorkouts = userWorkouts.filter(w => w.completed).length;
      const lastWorkout = sortedWorkouts.length > 0 ? sortedWorkouts[0].createdAt : null;
      
      // Update stats
      setFitnessStats(prev => ({
        ...prev,
        totalWorkouts: completedWorkouts,
        lastWorkout,
        streakDays: calculateStreak(sortedWorkouts),
        caloriesBurned: completedWorkouts * 300 // Very rough estimate
      }));
    }
  }, [workouts, user?.id]);
  
  // Calculate streak (consecutive days with workouts)
  const calculateStreak = (sortedWorkouts: Workout[]): number => {
    if (sortedWorkouts.length === 0) return 0;
    
    // Simple implementation - could be improved
    const streak = 1;
    const completedWorkouts = sortedWorkouts.filter(w => w.completed);
    if (completedWorkouts.length === 0) return 0;
    
    return Math.min(streak, 14); // Just for demo, capping at 14
  };
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500 dark:text-gray-400">User not found</div>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
  };

  // Helper for date formatting  
  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Profile</h1>
        
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-6">
              <IconWrapper 
                icon={UserIcon}
                size="lg"
                className="text-indigo-500 dark:text-indigo-400"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Body Stats Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Body Stats</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Height (cm)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={fitnessStats.height}
                      onChange={(e) => setFitnessStats(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Weight (kg)
                    </label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      value={fitnessStats.weight}
                      onChange={(e) => setFitnessStats(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Body Fat (%)
                    </label>
                    <input
                      id="bodyFat"
                      name="bodyFat"
                      type="number"
                      value={fitnessStats.bodyFat}
                      onChange={(e) => setFitnessStats(prev => ({ ...prev, bodyFat: parseInt(e.target.value) }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {/* Fitness Stats Cards */}
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fitness Overview</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard 
                  icon={ScaleIcon} 
                  label="Current Weight" 
                  value={`${fitnessStats.weight} kg`} 
                  color="indigo"
                />
                <StatCard 
                  icon={ChartBarIcon} 
                  label="Body Fat" 
                  value={`${fitnessStats.bodyFat}%`} 
                  color="emerald"
                />
                <StatCard 
                  icon={CalendarIcon} 
                  label="Workouts" 
                  value={fitnessStats.totalWorkouts.toString()} 
                  color="amber"
                />
                <StatCard 
                  icon={HeartIcon} 
                  label="Current Streak" 
                  value={`${fitnessStats.streakDays} days`} 
                  color="rose"
                />
              </div>
            </div>

            {/* Body Stats */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Height</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {fitnessStats.height} cm
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {fitnessStats.weight} kg
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Body Fat</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {fitnessStats.bodyFat}%
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">BMI</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {(fitnessStats.weight / Math.pow(fitnessStats.height / 100, 2)).toFixed(1)}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Workout</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {formatDate(fitnessStats.lastWorkout)}
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Calories Burned</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {fitnessStats.caloriesBurned.toLocaleString()} kcal
                  </dd>
                </div>
              </dl>
            </div>

            {/* Personal Records */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Records</h3>
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exercise</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {fitnessStats.personalBests.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.exercise}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.weight} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className={clsx("rounded-md p-3 inline-flex", colorClasses[color])}>
          <IconWrapper icon={icon} size="sm" className={colorClasses[color]} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 