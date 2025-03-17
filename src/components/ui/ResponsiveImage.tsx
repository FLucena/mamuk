'use client';

import { cn } from '@/lib/utils';
import RobustImage from './RobustImage';

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
  centered?: boolean;
  fallbackSrc?: string;
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
  centered = false,
  fallbackSrc = '/icon.png',
}: ResponsiveImageProps) {
  const imageStyle = {
    objectFit,
    objectPosition,
  };

  const containerClassName = cn(
    'relative',
    centered && 'flex justify-center items-center',
    className
  );

  return (
    <div className={containerClassName}>
      {fill ? (
        <RobustImage
          src={src}
          alt={alt}
          fill={true}
          sizes={sizes}
          priority={priority}
          quality={quality}
          style={imageStyle}
          className="img-fluid"
          fallbackSrc={fallbackSrc}
        />
      ) : (
        <RobustImage
          src={src}
          alt={alt}
          width={width || 0}
          height={height || 0}
          sizes={sizes}
          priority={priority}
          quality={quality}
          style={imageStyle}
          className={cn("img-fluid", centered && "mx-auto")}
          fallbackSrc={fallbackSrc}
        />
      )}
    </div>
  );
} 