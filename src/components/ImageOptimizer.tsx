'use client';

import { useState, useEffect } from 'react';
import RobustImage from '@/components/ui/RobustImage';

// Extend Window interface to include our custom trackPerformance property
declare global {
  interface Window {
    trackPerformance?: {
      startMark: (name: string) => number;
      endMark: (name: string) => number;
    };
  }
}

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  fallbackSrc?: string;
}

export default function ImageOptimizer({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  fill = false,
  style,
  onLoad,
  fallbackSrc = '/icon.png',
}: ImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState(0);

  useEffect(() => {
    // Reset loading state when src changes
    setIsLoaded(false);
    setLoadStartTime(performance.now());
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    const loadTime = performance.now() - loadStartTime;
    
    // Track image load performance
    if (window.trackPerformance) {
      console.info(`[PERFORMANCE] Image loaded: ${src.split('/').pop()} - ${loadTime.toFixed(2)}ms`);
    }
    
    if (onLoad) onLoad();
  };

  return (
    <div className={`relative ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}>
      <RobustImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={quality}
        fill={fill}
        style={style}
        fallbackSrc={fallbackSrc}
        onLoad={handleLoad}
        className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
} 