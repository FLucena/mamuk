import LoadingLogo from './LoadingLogo';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md',
  className = ''
}: LoadingSpinnerProps = {}) {
  // Determine size class based on prop
  const sizeClass = {
    sm: 'h-4 w-4 min-h-4 min-w-4',
    md: 'h-6 w-6 min-h-6 min-w-6',
    lg: 'h-10 w-10 min-h-10 min-w-10'
  }[size];
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400 ${className}`}></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400 ${className}`}></div>
    </div>
  );
} 