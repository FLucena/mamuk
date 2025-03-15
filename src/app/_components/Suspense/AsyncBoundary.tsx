'use client';

import React, { Suspense } from 'react';

interface FallbackProps {
  error: Error;
  reset: () => void;
}

interface AsyncBoundaryProps {
  children: React.ReactNode;
  loadingFallback: React.ReactNode;
  errorFallback: React.ComponentType<FallbackProps> | React.ReactNode;
}

/**
 * ErrorFallback component that displays when an error occurs
 */
function DefaultErrorFallback({ error, reset }: FallbackProps) {
  return (
    <div className="p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Something went wrong</h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Custom error boundary component
 */
class CustomErrorBoundary extends React.Component<
  { 
    children: React.ReactNode; 
    fallback: React.ComponentType<FallbackProps> | React.ReactNode;
  }, 
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ComponentType<FallbackProps> | React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by AsyncBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        const FallbackComponent = this.props.fallback as React.ComponentType<FallbackProps>;
        return <FallbackComponent error={this.state.error!} reset={() => this.setState({ hasError: false, error: null })} />;
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * AsyncBoundary component that combines Suspense and ErrorBoundary
 * 
 * @example
 * ```tsx
 * <AsyncBoundary
 *   loadingFallback={<LoadingSkeleton />}
 *   errorFallback={({ error, reset }) => (
 *     <ErrorDisplay message={error.message} onRetry={reset} />
 *   )}
 * >
 *   <DataComponent />
 * </AsyncBoundary>
 * ```
 */
export default function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback = DefaultErrorFallback,
}: AsyncBoundaryProps) {
  return (
    <CustomErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </CustomErrorBoundary>
  );
} 