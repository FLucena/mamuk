import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2 animate-pulse"></div>
      </div>
      
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
} 