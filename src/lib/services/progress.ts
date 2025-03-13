import { Progress } from '@/lib/models/progress';
import { dbConnect } from '@/lib/db';
import { WorkoutProgress, DayProgress } from '@/types/models';

export async function getWorkoutProgress(workoutId: string, userId: string, weekNumber: number, year: number): Promise<WorkoutProgress | null> {
  await dbConnect();
  return Progress.findOne({ workoutId, userId, weekNumber, year });
}

export async function getWorkoutProgressHistory(workoutId: string, userId: string): Promise<WorkoutProgress[]> {
  await dbConnect();
  return Progress.find({ workoutId, userId }).sort({ year: -1, weekNumber: -1 });
}

export async function createWorkoutProgress(workoutId: string, userId: string, weekNumber: number, year: number, days: DayProgress[]): Promise<WorkoutProgress> {
  await dbConnect();
  return Progress.create({
    workoutId,
    userId,
    weekNumber,
    year,
    days,
  });
}

export async function updateWorkoutProgress(workoutId: string, userId: string, weekNumber: number, year: number, days: DayProgress[]): Promise<WorkoutProgress | null> {
  await dbConnect();
  return Progress.findOneAndUpdate(
    { workoutId, userId, weekNumber, year },
    { days },
    { new: true }
  );
}

export async function updateDayProgress(
  workoutId: string,
  userId: string,
  weekNumber: number,
  year: number,
  dayId: string,
  dayProgress: Partial<DayProgress>
): Promise<WorkoutProgress | null> {
  await dbConnect();
  return Progress.findOneAndUpdate(
    { workoutId, userId, weekNumber, year, 'days.dayId': dayId },
    { 
      $set: {
        'days.$.completed': dayProgress.completed,
        'days.$.notes': dayProgress.notes,
        'days.$.blocks': dayProgress.blocks,
      }
    },
    { new: true }
  );
}

export async function getCurrentWeekNumber(): Promise<{ weekNumber: number; year: number }> {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek) + 1;

  return {
    weekNumber,
    year: now.getFullYear(),
  };
} 