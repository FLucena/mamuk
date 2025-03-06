import { Exercise } from './Exercise';

interface WorkoutBlockProps {
  title: string;
}

export function WorkoutBlock({ title }: WorkoutBlockProps) {
  const defaultExercises = [
    { name: 'Exercise 1', sets: 3, reps: 12, weight: 0 },
    { name: 'Exercise 2', sets: 3, reps: 12, weight: 0 },
    { name: 'Exercise 3', sets: 3, reps: 12, weight: 0 },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {defaultExercises.map((exercise) => (
          <Exercise
            key={exercise.name}
            name={exercise.name}
            sets={exercise.sets}
            reps={exercise.reps}
            weight={exercise.weight}
          />
        ))}
      </div>
    </div>
  );
} 