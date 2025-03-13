'use client';

import { useRef, useState, useEffect, ReactNode, CSSProperties } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number | string;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  onScroll?: (scrollTop: number) => void;
  onItemsRendered?: (startIndex: number, endIndex: number) => void;
  scrollToIndex?: number;
  id?: string;
}

/**
 * A virtualized list component that only renders items visible in the viewport
 * Greatly improves performance when rendering large lists
 */
export default function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  itemClassName = '',
  onScroll,
  onItemsRendered,
  scrollToIndex,
  id,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRenderedItemsRef = useRef({ startIndex: 0, endIndex: 0 });
  
  // Calculate the total height of all items
  const totalHeight = items.length * itemHeight;
  
  // Calculate the range of visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // Get the items to render
  const itemsToRender = items.slice(startIndex, endIndex + 1);
  
  // Handle scroll events
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const newScrollTop = containerRef.current.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(newScrollTop);
    }
    
    // Track scrolling state for potential optimizations
    setIsScrolling(true);
    
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }
    
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };
  
  // Update container height on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setContainerHeight(height);
    });
    
    resizeObserver.observe(containerRef.current);
    
    // Initial height
    setContainerHeight(containerRef.current.clientHeight);
    
    return () => {
      resizeObserver.disconnect();
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);
  
  // Notify when visible items change
  useEffect(() => {
    if (
      onItemsRendered &&
      (lastRenderedItemsRef.current.startIndex !== startIndex ||
        lastRenderedItemsRef.current.endIndex !== endIndex)
    ) {
      lastRenderedItemsRef.current = { startIndex, endIndex };
      onItemsRendered(startIndex, endIndex);
    }
  }, [startIndex, endIndex, onItemsRendered]);
  
  // Scroll to index when requested
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      containerRef.current.scrollTop = scrollToIndex * itemHeight;
    }
  }, [scrollToIndex, itemHeight]);
  
  // Track performance
  useEffect(() => {
    if (window.trackPerformance && id) {
      window.trackPerformance.startMark(`virtual-list-${id}`);
      
      return () => {
        if (window.trackPerformance) {
          window.trackPerformance.endMark(`virtual-list-${id}`);
        }
      };
    }
  }, [id]);
  
  return (
    <div
      ref={containerRef}
      className={`virtual-list-container overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
      id={id}
    >
      <div
        className="virtual-list-inner relative"
        style={{ height: totalHeight }}
      >
        {itemsToRender.map((item, index) => {
          const actualIndex = startIndex + index;
          const top = actualIndex * itemHeight;
          
          return (
            <div
              key={actualIndex}
              className={`virtual-list-item absolute w-full ${itemClassName}`}
              style={{
                top,
                height: itemHeight,
              }}
              data-index={actualIndex}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
} 