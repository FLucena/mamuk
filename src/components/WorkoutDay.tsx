import { WorkoutBlock } from './WorkoutBlock';

interface WorkoutDayProps {
  title: string;
}

export function WorkoutDay({ title }: WorkoutDayProps) {
  const blocks = ['Block 1', 'Block 2', 'Block 3'];

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="space-y-6">
        {blocks.map((block) => (
          <WorkoutBlock key={block} title={block} />
        ))}
      </div>
    </div>
  );
} 