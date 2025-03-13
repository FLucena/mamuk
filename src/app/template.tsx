'use client';

import { Suspense } from 'react';
import Loading from './loading';

// This template wraps each page with a Suspense boundary
// It allows for streaming page content as it becomes available
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
} 