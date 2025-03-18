'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface RobustImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * A robust image component that handles loading errors gracefully.
 * 
 * @param props All standard Next.js Image props plus fallback options
 * @returns A robust image component with fallback handling
 */
export default function RobustImage({
  src,
  alt,
  fallbackSrc = '/icon.png',
  ...props
}: RobustImageProps) {
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track component mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Simple error handler that switches to fallback
  const handleError = () => {
    if (mounted && !hasError) {
      console.log(`Image failed to load: ${typeof src === 'string' ? src : 'image'}, using fallback`);
      setHasError(true);
    }
  };

  return (
    <Image 
      {...props}
      src={hasError ? fallbackSrc : src}
      alt={alt}
      onError={handleError}
      // Make images more stable by bypassing optimization for local images
      unoptimized={props.unoptimized || (typeof src === 'string' && (src.startsWith('/') || src.startsWith('.')))}
    />
  );
} 