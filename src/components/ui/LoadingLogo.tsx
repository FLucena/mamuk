'use client';

import { useEffect, useRef } from 'react';

interface LoadingLogoProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingLogo({ 
  fullScreen = false,
  size = 'md'
}: LoadingLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Initial video setup
    if (videoRef.current) {
      videoRef.current.muted = true;
      
      // Start playing the video
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Determine size class based on prop
  const sizeClass = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <div className="flex flex-col items-center">
          <video 
            ref={videoRef}
            className={`${sizeClass} rounded-full object-cover shadow-lg`}
            src="/animated%20logo.mp4"
            playsInline
            muted
            loop
            autoPlay
          />
          <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center">
      <video 
        ref={videoRef}
        className={`${sizeClass} rounded-full object-cover shadow-lg`}
        src="/animated%20logo.mp4"
        playsInline
        muted
        loop
        autoPlay
      />
    </div>
  );
} 