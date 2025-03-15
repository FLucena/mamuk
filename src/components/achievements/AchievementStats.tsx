'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target } from 'lucide-react';

interface AchievementStatsProps {
  userId?: string;
}

interface UserStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  level: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
}

export default function AchievementStats({ userId }: AchievementStatsProps) {
  const [stats, setStats] = useState<UserStats>({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    earnedPoints: 0,
    level: 1,
    nextLevelPoints: 100,
    currentLevelPoints: 0
  });
  
  // Simulate fetching user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // In a real app, this would be an API call
      if (userId) {
        setStats({
          totalAchievements: 24,
          unlockedAchievements: 8,
          totalPoints: 1000,
          earnedPoints: 320,
          level: 3,
          nextLevelPoints: 500,
          currentLevelPoints: 320
        });
      }
    };
    
    fetchUserStats();
  }, [userId]);
  
  // Calculate progress percentage
  const progressPercentage = Math.round((stats.earnedPoints / stats.nextLevelPoints) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<Trophy className="w-5 h-5 text-yellow-500" />}
        title="Level"
        value={`Level ${stats.level}`}
        subtitle={`${stats.earnedPoints}/${stats.nextLevelPoints} XP`}
      >
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </StatCard>
      
      <StatCard 
        icon={<Award className="w-5 h-5 text-purple-500" />}
        title="Achievements"
        value={`${stats.unlockedAchievements}/${stats.totalAchievements}`}
        subtitle={`${Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)}% Complete`}
      />
      
      <StatCard 
        icon={<Star className="w-5 h-5 text-amber-500" />}
        title="Points Earned"
        value={stats.earnedPoints.toString()}
        subtitle={`of ${stats.totalPoints} total points`}
      />
      
      <StatCard 
        icon={<Target className="w-5 h-5 text-green-500" />}
        title="Next Achievement"
        value="Workout Streak"
        subtitle="2/7 days completed"
      >
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div 
            className="bg-green-600 h-2.5 rounded-full dark:bg-green-500" 
            style={{ width: '28%' }}
          ></div>
        </div>
      </StatCard>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  children?: React.ReactNode;
}

function StatCard({ icon, title, value, subtitle, children }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">{title}</h3>
      </div>
      <div className="mt-1">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
} 