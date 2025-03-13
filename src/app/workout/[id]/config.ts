/**
 * Route Segment Config for Workout Detail Route
 * 
 * This file contains configuration options for the workout detail route segment.
 * It controls how Next.js handles data fetching, caching, and rendering for this route.
 * 
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */

// Use dynamic rendering for this route segment
export const dynamic = 'force-dynamic';

// Disable default loading UI
export const fetchCache = 'force-no-store';

// Control how long this route segment is revalidated
export const revalidate = 0; // Revalidate on every request 