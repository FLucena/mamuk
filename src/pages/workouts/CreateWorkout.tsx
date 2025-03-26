import { useLocation } from 'react-router-dom';
import WorkoutForm from './WorkoutForm';

const CreateWorkout = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const exerciseId = queryParams.get('exerciseId');
  
  return <WorkoutForm mode="create" selectedExerciseId={exerciseId} />;
};

export default CreateWorkout; 