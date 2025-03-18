'use client';

import { useEffect } from 'react';

// Define critical images that should be preloaded
const CRITICAL_IMAGES = [
  '/logo.png',
  '/icon.png',
  '/user-placeholder.png',
  '/apple-touch-icon.png'
];

// Simple utility to preload images on the client side
function preloadImagesClient(imagePaths: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    for (const path of imagePaths) {
      const img = new Image();
      img.src = path;
    }
  } catch (error) {
    console.warn('Error preloading images:', error);
  }
}

export default function ImagePreloader() {
  useEffect(() => {
    // Preload critical images on component mount
    // Use setTimeout to ensure it runs after more critical operations
    const timer = setTimeout(() => {
      preloadImagesClient(CRITICAL_IMAGES);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything visible
  return null;
} 