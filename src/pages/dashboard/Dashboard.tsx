import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { useWorkoutStore, Workout } from '../../store/workoutStore';
import { 
  ClipboardCheck, 
  Plus, 
  Flame, 
  Trophy, 
  Calendar, 
  Heart,
  CheckCheck,
  Dumbbell,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  Card, 
  CardFooter, 
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../context/useLanguage';

// Type for achievements
interface Achievement {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  progress?: number;
  total?: number;
  date?: Date;
}

// Type for user data
interface UserData {
  name?: string;
  level?: string;
  points?: number;
  nextLevel?: number;
  achievements?: Achievement[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { workouts, fetchWorkouts } = useWorkoutStore();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [workoutsByDay, setWorkoutsByDay] = useState<{ [key: string]: Workout[] }>({});
  const [streakDays, setStreakDays] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [weeklyGoal] = useState(5); // Mock weekly workout goal
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchWorkouts();
      
      // Mock user data
      setUserData({
        name: user?.name || 'User',
        level: 'Intermediate',
        points: 1250,
        nextLevel: 1500,
        achievements: [
          { id: 1, name: 'Early Bird', description: 'Complete 5 workouts before 8am', completed: true, date: new Date(Date.now() - 86400000 * 10) },
          { id: 2, name: 'Consistency King', description: 'Work out 7 days in a row', completed: false, progress: 5, total: 7 },
          { id: 3, name: 'Strength Master', description: 'Lift 1000kg in total', completed: false, progress: 750, total: 1000 },
        ]
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchWorkouts, user]);

  // Filter workouts based on user role - moved inside useEffect to prevent infinite loop
  useEffect(() => {
    if (!isLoading && workouts.length > 0 && user) {
      // Filter workouts based on user role
      const filtered = workouts.filter((workout) => {
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
      });
      
      // Group workouts by day
      const byDay: { [key: string]: Workout[] } = {};
      
      // Sort workouts into days
      filtered.forEach(workout => {
        const dateStr = new Date(workout.updatedAt).toISOString().split('T')[0];
        if (!byDay[dateStr]) {
          byDay[dateStr] = [];
        }
        byDay[dateStr].push(workout);
      });
      
      setWorkoutsByDay(byDay);
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      // Check current day first
      if (byDay[today] && byDay[today].some(w => w.completed)) {
        currentStreak = 1;
        
        // Then check previous days
        const checkDate = new Date();
        while (currentStreak < 30) { // Limit to avoid infinite loop
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          
          // If we have a completed workout for this day, increment streak
          if (byDay[checkDateStr] && byDay[checkDateStr].some(w => w?.completed === true)) {
            currentStreak += 1;
          } else {
            break; // Break the streak
          }
        }
      }
      
      setStreakDays(currentStreak);
      
      // Calculate calories (mock calculation)
      const totalExercises = filtered.reduce((total, workout) => {
        // Calculate total exercises across all days and blocks
        return total + (workout.completed ? 
          workout.days.reduce((dayTotal, day) => {
            return dayTotal + day.blocks.reduce((blockTotal, block) => {
              return blockTotal + block.exercises.length;
            }, 0);
          }, 0) 
        : 0);
      }, 0);
      
      // Very simple mock calculation (about 100 calories per exercise)
      setCaloriesBurned(totalExercises * 100);
    }
  }, [isLoading, workouts, user]);

  // Get filtered workouts for rendering
  const filteredWorkouts = workouts.filter((workout) => {
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
  });
  
  // Get recent workouts (last 3)
  const recentWorkouts = [...filteredWorkouts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  // Count completed workouts
  const completedWorkouts = filteredWorkouts.filter((w) => w.completed).length;
  
  // Calculate analytics data 
  const workoutsThisWeek = Object.values(workoutsByDay || {}).reduce((total, dayWorkouts) => {
    return total + (dayWorkouts?.length || 0);
  }, 0);
  
  const progressPercentage = Math.round((completedWorkouts / (filteredWorkouts.length || 1)) * 100);
  const weeklyProgressPercentage = Math.round((workoutsThisWeek / (weeklyGoal || 1)) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome section */}
      <div className="sm:flex sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('welcome_back')}, {user?.name || t('fitness_enthusiast')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {t('journey_overview')}
          </p>
        </div>
        <Button size="lg" className="mt-4 sm:mt-0 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('start_new_workout')}
        </Button>
      </div>
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Card - Total Workouts */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 flex items-start">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
              <Dumbbell className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('total_workouts')}
              </CardTitle>
              {isLoading ? (
                <div className="h-8 w-16 mt-1 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {filteredWorkouts.length}
                </p>
              )}
            </div>
          </div>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <Link to="/workouts" className="text-sm text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-200 font-medium">
              {t('view_all_workouts')}
            </Link>
          </CardFooter>
        </Card>
        
        {/* Stats Card - Streak */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 flex items-start">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/50">
              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('current_streak')}
              </CardTitle>
              {isLoading ? (
                <div className="h-8 w-16 mt-1 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {streakDays} {streakDays !== 1 ? t('days') : t('day')}
                </p>
              )}
            </div>
          </div>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              {t('keep_it_up')}
            </p>
          </CardFooter>
        </Card>
        
        {/* Stats Card - Calories */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 flex items-start">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/50">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('calories_burned')}
              </CardTitle>
              {isLoading ? (
                <div className="h-8 w-24 mt-1 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {caloriesBurned.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('this_week')}
            </p>
          </CardFooter>
        </Card>
        
        {/* Stats Card - Completion Rate */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 flex items-start">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/50">
              <CheckCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('completion_rate')}
              </CardTitle>
              {isLoading ? (
                <div className="h-8 w-16 mt-1 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {progressPercentage}%
                </p>
              )}
            </div>
          </div>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completedWorkouts} {t('workouts_completed')}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Workouts */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('recent_workouts')}</h2>
            <Link 
              to="/workouts" 
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
            >
              {t('view_all')}
            </Link>
          </div>
          
          {recentWorkouts.length > 0 ? (
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <WorkoutItem key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <Card className="border border-dashed bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 p-8 text-center">
              <div className="flex flex-col items-center">
                <ClipboardCheck className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('no_recent_workouts')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('get_started')}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('create_workout')}
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Right column */}
        <div className="space-y-8">
          {/* Weekly Progress */}
          <Card className="border border-gray-200 dark:border-gray-700 p-6">
            <CardTitle className="mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              <span>{t('weekly_progress')}</span>
            </CardTitle>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                    {workoutsThisWeek} / {weeklyGoal}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                    {weeklyProgressPercentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200 dark:bg-indigo-900/30">
                <div
                  style={{ width: `${weeklyProgressPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 dark:bg-indigo-600"
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {workoutsThisWeek} {t('completed_count')} ({weeklyProgressPercentage}% {t('of_weekly_goal')})
              </p>
            </div>
          </Card>
          
          {/* Achievements section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                {t('achievements')}
              </h2>
              <Link 
                to="/achievements" 
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
              >
                {t('view_all_achievements')}
              </Link>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('recently_earned')}</h3>
              
              {userData?.achievements?.filter(a => a.completed).length ? (
                userData.achievements
                  .filter(achievement => achievement.completed)
                  .map(achievement => (
                    <AchievementItem
                      key={achievement.id}
                      icon={<Trophy className="h-5 w-5" />}
                      title={achievement.name}
                      description={achievement.description}
                      earned={true}
                    />
                  ))
              ) : (
                <Card className="border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                    <Award className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Complete workouts to earn achievements</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkoutItem = ({ workout }: { workout: Workout }) => {
  const { t } = useLanguage();
  
  // Format the date
  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    }).format(date);
  };
  
  // Calculate total exercises
  const totalExercises = workout.days.reduce((total, day) => {
    return total + day.blocks.reduce((blockTotal, block) => {
      return blockTotal + block.exercises.length;
    }, 0);
  }, 0);
  
  return (
    <Link to={`/workouts/${workout.id}`}>
      <Card className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{workout.title || 'Untitled Workout'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {formatDate(workout.updatedAt)}
              </p>
            </div>
            <div className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium",
              workout.completed 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" 
            )}>
              {workout.completed ? t('status_completed') : t('status_active')}
            </div>
          </div>
          
          <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Dumbbell className="h-4 w-4 mr-1.5" />
            <span>{totalExercises} {t('exercises')}</span>
            {workout.days.length > 0 && (
              <>
                <span className="mx-2">&middot;</span>
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>{workout.days.length} {workout.days.length === 1 ? t('day_singular') : t('day_plural')}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

const AchievementItem = ({ 
  icon, 
  title, 
  description, 
  earned 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  earned: boolean;
}) => {
  return (
    <Card className={cn(
      "border overflow-hidden",
      earned 
        ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20" 
        : "border-gray-200 dark:border-gray-700"
    )}>
      <div className="p-4 flex items-start">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          earned 
            ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300" 
            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
        )}>
          {icon}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;