import { useState, useEffect } from 'react';
import { 
  TrophyIcon,
  FireIcon,
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import clsx from 'clsx';

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
  earned: boolean;
  earnedAt?: Date;
  progress: number;
  total: number;
}

const Achievements = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    const fetchAchievements = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Workout',
          description: 'Complete your first workout',
          icon: BoltIcon,
          color: 'indigo',
          earned: true,
          earnedAt: new Date('2025-03-05'),
          progress: 1,
          total: 1,
        },
        {
          id: '2',
          title: 'Workout Streak',
          description: 'Complete workouts 3 days in a row',
          icon: FireIcon,
          color: 'red',
          earned: true,
          earnedAt: new Date('2025-03-10'),
          progress: 3,
          total: 3,
        },
        {
          id: '3',
          title: 'Diverse Training',
          description: 'Try 5 different workout types',
          icon: ChartBarIcon,
          color: 'purple',
          earned: false,
          progress: 3,
          total: 5,
        },
        {
          id: '4',
          title: 'Consistency Champion',
          description: 'Complete 10 workouts',
          icon: TrophyIcon,
          color: 'yellow',
          earned: false,
          progress: 6,
          total: 10,
        },
        {
          id: '5',
          title: 'Early Bird',
          description: 'Complete 5 workouts before 8 AM',
          icon: ClockIcon,
          color: 'blue',
          earned: false,
          progress: 2,
          total: 5,
        },
        {
          id: '6',
          title: 'Progress Tracker',
          description: 'Increase your weight on any exercise 3 times',
          icon: ArrowTrendingUpIcon,
          color: 'green',
          earned: false,
          progress: 1,
          total: 3,
        },
      ];
      
      setAchievements(mockAchievements);
      setIsLoading(false);
    };
    
    fetchAchievements();
  }, []);
  
  // Get stats
  const totalAchievements = achievements.length;
  const earnedAchievements = achievements.filter(a => a.earned).length;
  const completionRate = totalAchievements > 0 
    ? Math.round((earnedAchievements / totalAchievements) * 100) 
    : 0;
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Achievements</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track your fitness journey and unlock rewards as you progress
      </p>
      
      {/* Stats Overview */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 mb-8">
        <div className="px-5 py-4 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Progress</h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-5 py-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                  <IconWrapper 
                    icon={TrophyIcon} 
                    size="sm" 
                    className="text-indigo-600 dark:text-indigo-300" 
                  />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {isLoading ? '...' : earnedAchievements}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Achievements Earned</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                  <IconWrapper 
                    icon={ChartBarIcon} 
                    size="sm" 
                    className="text-green-600 dark:text-green-300" 
                  />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {isLoading ? '...' : completionRate}%
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                  <IconWrapper 
                    icon={BoltIcon} 
                    size="sm" 
                    className="text-blue-600 dark:text-blue-300" 
                  />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {isLoading ? '...' : totalAchievements - earnedAchievements}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Available to Earn</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="ml-4 w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={clsx(
                  "bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border transition-all",
                  achievement.earned 
                    ? `border-gray-200 dark:border-gray-700 hover:shadow-md` 
                    : "border-gray-100 dark:border-gray-700 opacity-75 hover:opacity-100"
                )}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className={clsx(
                      achievement.color === 'indigo' && "bg-indigo-100 dark:bg-indigo-900",
                      achievement.color === 'red' && "bg-red-100 dark:bg-red-900",
                      achievement.color === 'green' && "bg-green-100 dark:bg-green-900",
                      achievement.color === 'blue' && "bg-blue-100 dark:bg-blue-900",
                      achievement.color === 'yellow' && "bg-yellow-100 dark:bg-yellow-900",
                      achievement.color === 'purple' && "bg-purple-100 dark:bg-purple-900",
                      "rounded-full p-3",
                      achievement.earned && "ring-2 ring-offset-2",
                      achievement.earned && achievement.color === 'indigo' && "ring-indigo-500",
                      achievement.earned && achievement.color === 'red' && "ring-red-500",
                      achievement.earned && achievement.color === 'green' && "ring-green-500",
                      achievement.earned && achievement.color === 'blue' && "ring-blue-500",
                      achievement.earned && achievement.color === 'yellow' && "ring-yellow-500",
                      achievement.earned && achievement.color === 'purple' && "ring-purple-500"
                    )}>
                      <IconWrapper 
                        icon={achievement.icon} 
                        size="sm" 
                        className={clsx(
                          achievement.color === 'indigo' && "text-indigo-600 dark:text-indigo-300",
                          achievement.color === 'red' && "text-red-600 dark:text-red-300",
                          achievement.color === 'green' && "text-green-600 dark:text-green-300",
                          achievement.color === 'blue' && "text-blue-600 dark:text-blue-300",
                          achievement.color === 'yellow' && "text-yellow-600 dark:text-yellow-300",
                          achievement.color === 'purple' && "text-purple-600 dark:text-purple-300"
                        )}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Progress: {achievement.progress} / {achievement.total}
                      </span>
                      {achievement.earned && (
                        <span className={clsx(
                          "font-medium",
                          achievement.color === 'indigo' && "text-indigo-600 dark:text-indigo-400",
                          achievement.color === 'red' && "text-red-600 dark:text-red-400",
                          achievement.color === 'green' && "text-green-600 dark:text-green-400",
                          achievement.color === 'blue' && "text-blue-600 dark:text-blue-400",
                          achievement.color === 'yellow' && "text-yellow-600 dark:text-yellow-400",
                          achievement.color === 'purple' && "text-purple-600 dark:text-purple-400"
                        )}>
                          Earned {achievement.earnedAt && new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={clsx(
                          "h-2.5 rounded-full",
                          achievement.color === 'indigo' && "bg-indigo-500 dark:bg-indigo-600",
                          achievement.color === 'red' && "bg-red-500 dark:bg-red-600",
                          achievement.color === 'green' && "bg-green-500 dark:bg-green-600",
                          achievement.color === 'blue' && "bg-blue-500 dark:bg-blue-600",
                          achievement.color === 'yellow' && "bg-yellow-500 dark:bg-yellow-600",
                          achievement.color === 'purple' && "bg-purple-500 dark:bg-purple-600"
                        )}
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements; 