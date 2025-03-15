import dynamic from 'next/dynamic';
import React from 'react';

const DebugButton = dynamic(() => import('./DebugButton'), {
  ssr: false,
  loading: () => null
});

const RoleDebugger = dynamic(() => import('./RoleDebugger'), {
  ssr: false,
  loading: () => null
});

const PerformanceDebug = dynamic(() => import('./debug/PerformanceDebug'), {
  ssr: false,
  loading: () => null
});

const DebugRenderCounter = dynamic(() => import('./DebugRenderCounter'), {
  ssr: false,
  loading: () => null
});

export default function DevComponents() {
  return (
    <>
      <DebugButton />
      <RoleDebugger />
      <PerformanceDebug />
      <DebugRenderCounter />
    </>
  );
} 