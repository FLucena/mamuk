// This is a special Next.js file that automatically creates a loading UI
// It will be shown while the workout detail route segment is loading
// See: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

'use client';

import React from 'react';
import { LoadingPage } from '@/components/ui/loading';

export default function WorkoutDetailLoading() {
  // This loading component is automatically picked up by Next.js
  // and shown during page transitions and data fetching
  return <LoadingPage />;
} 