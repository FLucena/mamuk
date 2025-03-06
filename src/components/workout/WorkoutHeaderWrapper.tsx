import { canCreateWorkouts } from '@/app/workout/actions';
import WorkoutHeader from './WorkoutHeader';

interface WorkoutHeaderWrapperProps {
  title: string;
  newButtonText?: string;
}

export default async function WorkoutHeaderWrapper({ title, newButtonText }: WorkoutHeaderWrapperProps) {
  const hasPermission = await canCreateWorkouts();
  
  return (
    <WorkoutHeader 
      title={title} 
      newButtonText={newButtonText} 
      hasPermission={hasPermission}
    />
  );
} 