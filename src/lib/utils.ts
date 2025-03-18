import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Preload important images to improve perceived performance
 * @param imagePaths Array of image paths to preload
 */
export function preloadImages(imagePaths: string[]): void {
  if (typeof window === 'undefined') return;
  
  for (const path of imagePaths) {
    const img = new Image();
    img.src = path;
  }
} 