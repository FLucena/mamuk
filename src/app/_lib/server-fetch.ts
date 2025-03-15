/**
 * Utilities for server-side data fetching in Server Components
 * 
 * This module provides functions for fetching data on the server side
 * with proper error handling, caching, and revalidation strategies.
 */

import { cache } from 'react';
import { notFound } from 'next/navigation';

/**
 * Error class for API fetch failures
 */
export class FetchError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

/**
 * Cached fetch function for server components
 * Uses React's cache() to deduplicate requests
 */
export const fetchWithCache = cache(async <T>(
  url: string, 
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      // Ensure fresh data on server
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      // Handle 404 with Next.js notFound
      if (response.status === 404) {
        notFound();
      }
      
      throw new FetchError(
        `Failed to fetch data: ${response.statusText}`,
        response.status
      );
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Server fetch error:', error);
    throw error;
  }
});

/**
 * Fetch data with no caching for dynamic data
 */
export async function fetchDynamic<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      // Ensure fresh data on every request
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Handle 404 with Next.js notFound
      if (response.status === 404) {
        notFound();
      }
      
      throw new FetchError(
        `Failed to fetch data: ${response.statusText}`,
        response.status
      );
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Server fetch error:', error);
    throw error;
  }
}

/**
 * Fetch data with specific revalidation time
 */
export async function fetchWithRevalidate<T>(
  url: string, 
  revalidateSeconds: number,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      next: { revalidate: revalidateSeconds },
    });
    
    if (!response.ok) {
      // Handle 404 with Next.js notFound
      if (response.status === 404) {
        notFound();
      }
      
      throw new FetchError(
        `Failed to fetch data: ${response.statusText}`,
        response.status
      );
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Server fetch error:', error);
    throw error;
  }
} 