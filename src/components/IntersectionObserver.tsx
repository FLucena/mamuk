'use client';

import { useRef, useEffect, useState, ReactNode, forwardRef, ForwardedRef, ElementType } from 'react';

// Declare the window.trackPerformance type
declare global {
  interface Window {
    trackPerformance?: {
      startMark: (name: string) => number;
      endMark: (name: string) => number;
    };
  }
}

interface IntersectionObserverProps {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  disabled?: boolean;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  onVisible?: () => void;
  onHidden?: () => void;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  fallback?: ReactNode;
  skipInitialDelay?: boolean;
}

/**
 * A component that uses Intersection Observer to detect when an element enters the viewport
 * Useful for lazy loading, animations, infinite scrolling, etc.
 */
const IntersectionObserverComponent = forwardRef(function IntersectionObserverComponent(
  {
    children,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    disabled = false,
    onIntersect,
    onVisible,
    onHidden,
    className = '',
    id,
    style,
    as = 'div',
    fallback = null,
    skipInitialDelay = false,
  }: IntersectionObserverProps,
  forwardedRef: ForwardedRef<HTMLElement>
) {
  const localRef = useRef<HTMLElement | null>(null);
  const ref = (forwardedRef as React.RefObject<HTMLElement>) || localRef;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Track performance
  const intersectionStartTime = useRef<number>(0);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (disabled || !isClient) return;
    
    // Skip if already triggered once and triggerOnce is true
    if (triggerOnce && hasTriggered) return;
    
    const element = ref.current;
    if (!element) return;
    
    // Start tracking time until intersection
    intersectionStartTime.current = performance.now();
    
    if (window.trackPerformance) {
      window.trackPerformance.startMark(`intersection-${id || element.id || 'unknown'}`);
    }
    
    // Only create observer if we're in the browser
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (!entries || entries.length === 0) return;
      
      const entry = entries[0];
      
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        
        if (onIntersect) onIntersect(entry);
        if (onVisible) onVisible();
        
        if (triggerOnce) {
          setHasTriggered(true);
          observer.disconnect();
        }
        
        // Track time to intersection
        const timeToIntersection = performance.now() - intersectionStartTime.current;
        console.info(`[PERFORMANCE] Element visible: ${id || element.id || 'unknown'} - ${timeToIntersection.toFixed(2)}ms`);
        
        if (window.trackPerformance) {
          window.trackPerformance.endMark(`intersection-${id || element.id || 'unknown'}`);
        }
      } else {
        setIsIntersecting(false);
        if (onHidden) onHidden();
      }
    };
    
    // Use type assertion to avoid TypeScript errors with the IntersectionObserver constructor
    const observer = new (window.IntersectionObserver as any)(handleIntersection, {
      rootMargin,
      threshold
    });
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [
    disabled,
    rootMargin,
    threshold,
    triggerOnce,
    hasTriggered,
    onIntersect,
    onVisible,
    onHidden,
    ref,
    id,
    isClient,
  ]);
  
  // Dynamically render the component based on the 'as' prop
  const Component = as as ElementType;
  
  // If we're on the server or the component is disabled, render children directly
  if (!isClient || disabled) {
    return (
      <Component className={className} id={id} style={style} ref={forwardedRef as any}>
        {children}
      </Component>
    );
  }
  
  // If we're waiting for intersection and we have a fallback, show it
  if (!isIntersecting && !hasTriggered && fallback) {
    return (
      <Component className={className} id={id} style={style} ref={forwardedRef as any}>
        {fallback}
      </Component>
    );
  }
  
  // If we're intersecting or have triggered once, show children
  return (
    <Component className={className} id={id} style={style} ref={forwardedRef as any}>
      {(isIntersecting || hasTriggered || skipInitialDelay) ? children : fallback}
    </Component>
  );
});

export default IntersectionObserverComponent; 