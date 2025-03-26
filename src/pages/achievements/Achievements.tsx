import { useState } from 'react';
import { TrophyIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/useLanguage';

interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: string;
  icon: React.ReactNode;
}

const Achievements = () => {
  const { t } = useLanguage();
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Workout',
      description: 'Complete your first workout',
      completed: true,
      date: '2023-10-15',
      icon: <TrophyIcon className="h-4 w-4 text-amber-500" />
    },
    {
      id: '2',
      title: 'Consistency Champion',
      description: 'Complete workouts for 7 consecutive days',
      completed: true,
      date: '2023-10-22',
      icon: <TrophyIcon className="h-4 w-4 text-amber-500" />
    },
    {
      id: '3',
      title: 'Strength Milestone',
      description: 'Increase your strength in a key exercise by 50%',
      completed: false,
      icon: <TrophyIcon className="h-4 w-4 text-gray-400" />
    },
    {
      id: '4',
      title: 'Endurance Master',
      description: 'Complete a 60-minute cardio session',
      completed: false,
      icon: <TrophyIcon className="h-4 w-4 text-gray-400" />
    },
    {
      id: '5',
      title: 'Healthy Habits',
      description: 'Log your meals for 14 consecutive days',
      completed: false,
      icon: <TrophyIcon className="h-4 w-4 text-gray-400" />
    }
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{t('achievements')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {t('track_your_fitness_milestones')}
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {achievements.map((achievement) => (
            <li key={achievement.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {achievement.title}
                    </p>
                    {achievement.completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        <CheckIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                        {t('status_completed')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  {achievement.date && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('achieved_on')} {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Achievements; 