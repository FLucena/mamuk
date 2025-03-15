// This is a special Next.js file that automatically creates a loading UI
// It will be shown while page data is loading in a route segment
// See: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

'use client';

import React from 'react';
import PageLoading from '@/components/ui/PageLoading';

export default function Loading() {
  // This loading component is automatically picked up by Next.js
  // and shown during page transitions and data fetching
  return <PageLoading />;
} 