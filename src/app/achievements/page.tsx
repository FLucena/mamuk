'use client';

import React, { Suspense } from 'react';
import { lazyLoad } from '@/utils/lazyComponents';
import { PageSuspenseFallback } from '@/components/ui/SuspenseFallback';
import { useLightSession } from '@/hooks/useOptimizedSession';

// Lazy load heavy components
const AchievementsList = lazyLoad(
  () => import('@/components/achievements/AchievementsList'),
  'AchievementsList'
);

const AchievementStats = lazyLoad(
  () => import('@/components/achievements/AchievementStats'),
  'AchievementStats'
);

const UserProgress = lazyLoad(
  () => import('@/components/achievements/UserProgress'),
  'UserProgress'
);

/**
 * Achievements page with optimized loading using Suspense and lazy loading
 * Also uses the lightweight session hook to avoid redundant session fetches
 */
export default function AchievementsPage() {
  const { data: session, status } = useLightSession();
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return <PageSuspenseFallback />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Achievements</h1>
      
      {/* Stats section with Suspense boundary */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Stats Overview</h2>
        <Suspense fallback={<PageSuspenseFallback />}>
          <AchievementStats userId={session?.user?.id} />
        </Suspense>
      </section>
      
      {/* Progress section with Suspense boundary */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
        <Suspense fallback={<PageSuspenseFallback />}>
          <UserProgress userId={session?.user?.id} />
        </Suspense>
      </section>
      
      {/* Achievements list with Suspense boundary */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Achievements</h2>
        <Suspense fallback={<PageSuspenseFallback />}>
          <AchievementsList userId={session?.user?.id} />
        </Suspense>
      </section>
    </div>
  );
} 