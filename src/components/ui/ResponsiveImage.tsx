'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
  quality = 75,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
}: ResponsiveImageProps) {
  const imageStyle = {
    objectFit,
    objectPosition,
  };

  return (
    <div className={cn('relative', className)}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill={true}
          sizes={sizes}
          priority={priority}
          quality={quality}
          style={imageStyle}
          className="img-fluid"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 0}
          height={height || 0}
          sizes={sizes}
          priority={priority}
          quality={quality}
          style={imageStyle}
          className="img-fluid"
        />
      )}
    </div>
  );
} 