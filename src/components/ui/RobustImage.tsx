'use client';

import { useState } from 'react';
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
  const [imgSrc, setImgSrc] = useState<string>(typeof src === 'string' ? src : '');
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.log(`Image failed to load: ${imgSrc}, using fallback: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image 
      {...props}
      src={hasError ? fallbackSrc : src}
      alt={alt}
      onError={handleError}
      // Make images more stable in production by bypassing Next.js optimization
      // when dealing with local images (which may behave differently in prod)
      unoptimized={typeof src === 'string' && (src.startsWith('/') || src.startsWith('.'))}
    />
  );
} 