'use client';

interface LoadingLogoProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

export default function LoadingLogo({ 
  fullScreen = false,
  size = 'md',
  centered = false
}: LoadingLogoProps) {
  // Determine size class based on prop
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];
  
  // Simple spinner instead of video
  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400`}></div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <div className="flex flex-col items-center">
          {spinner}
        </div>
      </div>
    );
  }
  
  if (centered) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-40">
        {spinner}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center">
      {spinner}
    </div>
  );
} 