'use client';

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import WorkoutItem from './WorkoutItem';

// Use a more flexible type that matches what's in the WorkoutItem
interface WorkoutListItem {
  id: string;
  name: string;
  days?: any[];
  createdAt: string;
  updatedAt: string;
  coachId?: string;
  isShared?: boolean;
  _id?: string;
  description?: string;
  userId: string;
}

interface VirtualizedWorkoutListProps {
  workouts: WorkoutListItem[];
  isCoach?: boolean;
  onWorkoutClick?: (id: string) => void;
  onEditClick?: (e: React.MouseEvent, workout: WorkoutListItem) => void;
  onDuplicateClick?: (workout: WorkoutListItem) => void;
  onDeleteClick?: (workout: WorkoutListItem) => void;
}

const VirtualizedWorkoutList = memo(function VirtualizedWorkoutList({
  workouts,
  isCoach = false,
  onWorkoutClick,
  onEditClick,
  onDuplicateClick,
  onDeleteClick
}: VirtualizedWorkoutListProps) {
  // Create a reference to the scrollable parent container
  const parentRef = useRef<HTMLDivElement>(null);
  
  // State to track container size for responsiveness
  const [parentHeight, setParentHeight] = useState(0);
  
  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: workouts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 140, []), // Estimate each workout item height
    overscan: 5 // Render additional items outside the viewport for smoother scrolling
  });
  
  // Update dimensions on resize
  useEffect(() => {
    if (!parentRef.current) return;

    // Initialize height
    setParentHeight(parentRef.current.offsetHeight);
    
    // Track resize
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setParentHeight(entry.contentRect.height);
      }
    });
    
    observer.observe(parentRef.current);
    
    return () => {
      if (parentRef.current) {
        observer.unobserve(parentRef.current);
      }
    };
  }, []);
  
  // If no workouts, render empty state
  if (workouts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400" data-testid="workout-list-empty">
        <p>No tienes rutinas todavía.</p>
        <p className="mt-2">Crea una nueva rutina o contacta con un entrenador.</p>
      </div>
    );
  }
  
  return (
    <div
      ref={parentRef}
      className="h-[75vh] overflow-auto relative border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-900"
      data-testid="workout-list"
    >
      {/* Total size of all items */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const workout = workouts[virtualRow.index];
          return (
            <div
              key={workout.id}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <WorkoutItem 
                workout={workout}
                isCoach={isCoach}
                onClick={() => onWorkoutClick?.(workout.id)}
                onEditClick={onEditClick}
                onDuplicateClick={onDuplicateClick}
                onDeleteClick={onDeleteClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default VirtualizedWorkoutList; 