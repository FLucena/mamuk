import React, { useState, useEffect } from 'react';
import { useLightSession } from '@/hooks/useOptimizedSession';

// Simple test component versions
const PageLoading = () => <div data-testid="page-loading">Loading...</div>;

const WorkoutHeaderWrapper = ({ title }: { title: string }) => (
  <div data-testid="workout-header">{title}</div>
);

// Define proper interface for workout item
interface WorkoutItem {
  id: string;
  name: string;
  // Add other required properties as needed
}

const WorkoutList = ({ workouts }: { workouts: WorkoutItem[] }) => (
  <div data-testid="workout-list">
    {workouts.map((w) => (
      <div key={w.id}>{w.name}</div>
    ))}
  </div>
);

// Test version of WorkoutPage that simplifies the complex behavior
export default function WorkoutPageTest() {
  const { data: session } = useLightSession();
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          setIsDataLoading(true);
          
          const workoutsRes = await fetch('/api/workout');
          
          if (!workoutsRes.ok) {
            throw new Error(`Error fetching workouts: ${workoutsRes.status} ${workoutsRes.statusText}`);
          }
          
          const workoutsData = await workoutsRes.json();
          setWorkouts(workoutsData.workouts || []);
          setError(null);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Error fetching workouts');
          }
          setWorkouts([]);
        } finally {
          setIsDataLoading(false);
        }
      };
      
      fetchData();
    }
  }, [session]);
  
  if (!session) {
    return <PageLoading />;
  }
  
  return (
    <main>
      <div>
        {error && (
          <div>
            <span>{error}</span>
          </div>
        )}
        
        {isDataLoading ? (
          <PageLoading />
        ) : (
          <div>
            <div>
              <WorkoutHeaderWrapper title="Rutinas" />
              <button aria-label="Refrescar rutinas">
                Refrescar
              </button>
            </div>
            
            <WorkoutList workouts={workouts} />
          </div>
        )}
      </div>
    </main>
  );
} 