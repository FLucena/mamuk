import LoadingLogo from './LoadingLogo';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md',
  className = '',
  showText = false,
  text = 'Cargando...'
}: LoadingSpinnerProps = {}) {
  // Determine size class based on prop
  const sizeClass = {
    sm: 'h-4 w-4 min-h-4 min-w-4',
    md: 'h-6 w-6 min-h-6 min-w-6',
    lg: 'h-10 w-10 min-h-10 min-w-10',
    xl: 'h-16 w-16 min-h-16 min-w-16'
  }[size];
  
  const borderWidth = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4'
  }[size];
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50/95 dark:bg-gray-950/95 z-50">
        <div className={`animate-spin rounded-full ${sizeClass} ${borderWidth} border-t-transparent border-blue-600 dark:border-blue-400 ${className}`}></div>
        {showText && (
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{text}</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClass} ${borderWidth} border-t-transparent border-blue-600 dark:border-blue-400 ${className}`}></div>
      {showText && (
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{text}</p>
      )}
    </div>
  );
} 