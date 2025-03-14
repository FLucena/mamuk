import Image from 'next/image';
import { CSSProperties } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  quality?: number;
  fill?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  style,
  sizes = '100vw',
  quality = 75,
  fill = false,
}: OptimizedImageProps) {
  // Handle absolute URLs for external images
  const isExternal = src.startsWith('http');
  
  return (
    <div className={`relative ${className}`} style={style}>
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        quality={quality}
        sizes={sizes}
        fill={fill}
        style={fill ? { objectFit: 'cover' } : undefined}
        {...(isExternal ? { unoptimized: true } : {})}
      />
    </div>
  );
} 