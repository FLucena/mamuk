import { Suspense } from 'react';
import { ProfileSkeleton, TableSkeleton } from '@/app/_components/Suspense/SkeletonLoader';

// This is a Server Component
export default function StreamingExamplePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Streaming Example</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Profile Section - Loads Immediately */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Profile</h2>
          <Suspense fallback={<ProfileSkeleton />}>
            <UserProfile />
          </Suspense>
        </div>
        
        {/* Activity Section - Loads with a Delay */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Suspense fallback={<TableSkeleton rows={3} />}>
            <RecentActivity />
          </Suspense>
        </div>
        
        {/* Recommendations Section - Loads with a Longer Delay */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
          <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
            <Recommendations />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// These components simulate different loading times
async function UserProfile() {
  // Simulate a fast API call (200ms)
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return (
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
        JD
      </div>
      <div>
        <h3 className="font-medium">John Doe</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Premium Member</p>
      </div>
    </div>
  );
}

async function RecentActivity() {
  // Simulate a medium-speed API call (1s)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const activities = [
    { id: 1, action: 'Completed workout', date: '2 hours ago' },
    { id: 2, action: 'Updated profile', date: 'Yesterday' },
    { id: 3, action: 'Achieved new badge', date: 'Last week' },
  ];
  
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {activities.map(activity => (
            <tr key={activity.id}>
              <td className="px-4 py-3 whitespace-nowrap">{activity.action}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{activity.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Recommendations() {
  // Simulate a slow API call (3s)
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const recommendations = [
    { id: 1, name: 'Full Body Workout', difficulty: 'Intermediate', duration: '45 min' },
    { id: 2, name: 'Upper Body Focus', difficulty: 'Advanced', duration: '30 min' },
    { id: 3, name: 'Core Strength', difficulty: 'Beginner', duration: '20 min' },
    { id: 4, name: 'HIIT Session', difficulty: 'Advanced', duration: '25 min' },
    { id: 5, name: 'Recovery Yoga', difficulty: 'All Levels', duration: '40 min' },
  ];
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workout</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {recommendations.map(rec => (
            <tr key={rec.id}>
              <td className="px-4 py-3 whitespace-nowrap font-medium">{rec.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{rec.difficulty}</td>
              <td className="px-4 py-3 whitespace-nowrap">{rec.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 