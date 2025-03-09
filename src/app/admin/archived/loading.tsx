import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2 animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center h-32 mt-8">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
} 