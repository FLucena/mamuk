'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, Clock } from 'lucide-react';

interface UserProgressProps {
  userId?: string;
}

interface ActivityData {
  date: string;
  count: number;
}

interface CategoryData {
  category: string;
  count: number;
}

export default function UserProgress({ userId }: UserProgressProps) {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  
  // Simulate fetching user progress data
  useEffect(() => {
    const fetchUserProgress = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      if (userId) {
        // Sample activity data for last 7 days
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });
        
        setActivityData(last7Days.map(date => ({
          date,
          count: Math.floor(Math.random() * 3) // 0-2 workouts per day
        })));
        
        setCategoryData([
          { category: 'Strength', count: 12 },
          { category: 'Cardio', count: 8 },
          { category: 'Flexibility', count: 5 },
          { category: 'HIIT', count: 7 }
        ]);
        
        setStreakDays(3);
        setTotalWorkouts(32);
      }
    };
    
    fetchUserProgress();
  }, [userId]);
  
  // Find the max count for scaling
  const maxActivityCount = Math.max(...activityData.map(d => d.count), 1);
  const maxCategoryCount = Math.max(...categoryData.map(d => d.count), 1);
  
  return (
    <div className="space-y-8">
      {/* Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Weekly Activity</h3>
        </div>
        
        <div className="flex items-end h-40 gap-2">
          {activityData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex justify-center mb-1">
                <div 
                  className={`w-full max-w-[30px] rounded-t-md ${
                    day.count > 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ 
                    height: `${(day.count / maxActivityCount) * 100}%`,
                    minHeight: day.count > 0 ? '10%' : '5%'
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {day.count}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Workout Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workout Categories</h3>
        </div>
        
        <div className="space-y-3">
          {categoryData.map((category, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{category.category}</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{category.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{streakDays} days</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-amber-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkouts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 