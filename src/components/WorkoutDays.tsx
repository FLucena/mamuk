import { WorkoutDay } from './WorkoutDay';

export function WorkoutDays() {
  const days = ['Day 1', 'Day 2', 'Day 3'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {days.map((day) => (
        <WorkoutDay key={day} title={day} />
      ))}
    </div>
  );
} 