import LoadingLogo from './LoadingLogo';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md' 
}: LoadingSpinnerProps = {}) {
  // Determine size class based on prop
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400`}></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400`}></div>
    </div>
  );
} 