'use client';

import React, { useState, useEffect } from 'react';
import { Award, Check, Lock } from 'lucide-react';

// Sample achievement data - in a real app, this would come from your API
const ACHIEVEMENTS = [
  {
    id: 'first_workout',
    name: 'First Workout',
    description: 'Complete your first workout',
    icon: '🏋️',
    category: 'beginner',
    points: 10,
  },
  {
    id: 'workout_streak',
    name: 'Workout Streak',
    description: 'Complete workouts for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
    points: 50,
  },
  {
    id: 'weight_milestone',
    name: 'Weight Milestone',
    description: 'Reach your first weight goal',
    icon: '⚖️',
    category: 'progress',
    points: 100,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 workouts before 8 AM',
    icon: '🌅',
    category: 'habits',
    points: 30,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 5 workouts after 8 PM',
    icon: '🌙',
    category: 'habits',
    points: 30,
  },
  {
    id: 'variety_pack',
    name: 'Variety Pack',
    description: 'Try 5 different workout types',
    icon: '🔄',
    category: 'exploration',
    points: 40,
  },
];

interface AchievementsListProps {
  userId?: string;
}

export default function AchievementsList({ userId }: AchievementsListProps) {
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('all');
  
  // Simulate fetching user achievements
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchUserAchievements = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate some unlocked achievements
      if (userId) {
        setUserAchievements(['first_workout', 'early_bird']);
      }
    };
    
    fetchUserAchievements();
  }, [userId]);
  
  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return userAchievements.includes(achievement.id);
    if (filter === 'locked') return !userAchievements.includes(achievement.id);
    return achievement.category === filter;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterButton>
        <FilterButton active={filter === 'unlocked'} onClick={() => setFilter('unlocked')}>
          Unlocked
        </FilterButton>
        <FilterButton active={filter === 'locked'} onClick={() => setFilter('locked')}>
          Locked
        </FilterButton>
        <FilterButton active={filter === 'beginner'} onClick={() => setFilter('beginner')}>
          Beginner
        </FilterButton>
        <FilterButton active={filter === 'consistency'} onClick={() => setFilter('consistency')}>
          Consistency
        </FilterButton>
        <FilterButton active={filter === 'progress'} onClick={() => setFilter('progress')}>
          Progress
        </FilterButton>
        <FilterButton active={filter === 'habits'} onClick={() => setFilter('habits')}>
          Habits
        </FilterButton>
        <FilterButton active={filter === 'exploration'} onClick={() => setFilter('exploration')}>
          Exploration
        </FilterButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={userAchievements.includes(achievement.id)}
          />
        ))}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No achievements found for the selected filter.
        </div>
      )}
    </div>
  );
}

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ children, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

interface AchievementCardProps {
  achievement: typeof ACHIEVEMENTS[0];
  unlocked: boolean;
}

function AchievementCard({ achievement, unlocked }: AchievementCardProps) {
  return (
    <div className={`rounded-lg border p-4 transition-all ${
      unlocked 
        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 text-2xl">{achievement.icon}</div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">{achievement.name}</h3>
            <div className="ml-2">
              {unlocked ? (
                <div className="rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <Check size={16} />
                </div>
              ) : (
                <div className="rounded-full bg-gray-100 p-1 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                  <Lock size={16} />
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
          <div className="flex items-center mt-2 text-sm">
            <Award className="w-4 h-4 mr-1 text-purple-500" />
            <span className="text-purple-600 dark:text-purple-400 font-medium">{achievement.points} points</span>
          </div>
        </div>
      </div>
    </div>
  );
} 