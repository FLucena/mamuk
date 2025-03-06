import { Types } from 'mongoose';
import { BodyZone } from '@/lib/constants/bodyZones';

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  type?: string;
  videoUrl?: string;
  notes?: string;
  tags?: BodyZone[];
}

export interface Block {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutDay {
  id?: string;
  name: string;
  blocks: Block[];
}

export interface Workout {
  id?: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'archived' | 'completed';
}

export interface PredefinedExercise {
  id: string;
  name: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  sets: Array<{
    reps: number;
    weight: number;
    completed: boolean;
  }>;
}

export interface BlockProgress {
  blockId: string;
  exercises: ExerciseProgress[];
}

export interface DayProgress {
  dayId: string;
  blocks: BlockProgress[];
  completed: boolean;
  notes?: string;
}

export interface WorkoutProgress {
  _id: string;
  userId: string;
  workoutId: string;
  weekNumber: number;
  year: number;
  days: DayProgress[];
  createdAt: Date;
  updatedAt: Date;
}

// Lista de ejercicios predefinidos
export const ejerciciosPredefinidos: PredefinedExercise[] = [
  // Pecho
  { id: 'press-plano', name: 'Press de Banca Plano' },
  { id: 'press-inclinado', name: 'Press de Banca Inclinado' },
  { id: 'aperturas', name: 'Aperturas con Mancuernas' },
  { id: 'fondos', name: 'Fondos en Paralelas' },
  
  // Espalda
  { id: 'dominadas', name: 'Dominadas' },
  { id: 'remo-barra', name: 'Remo con Barra' },
  { id: 'remo-mancuerna', name: 'Remo con Mancuerna' },
  { id: 'pulldown', name: 'Jalón al Pecho' },
  
  // Piernas
  { id: 'sentadillas', name: 'Sentadillas' },
  { id: 'peso-muerto', name: 'Peso Muerto' },
  { id: 'prensa', name: 'Prensa de Piernas' },
  { id: 'extension-cuadriceps', name: 'Extensión de Cuádriceps' },
  
  // Hombros
  { id: 'press-militar', name: 'Press Militar' },
  { id: 'elevaciones-laterales', name: 'Elevaciones Laterales' },
  { id: 'elevaciones-frontales', name: 'Elevaciones Frontales' },
  { id: 'pajaros', name: 'Pájaros' },
  
  // Brazos
  { id: 'curl-biceps', name: 'Curl de Bíceps' },
  { id: 'extension-triceps', name: 'Extensión de Tríceps' },
  { id: 'martillo', name: 'Curl Martillo' },
  { id: 'frances', name: 'Press Francés' },
  
  // Core
  { id: 'plancha', name: 'Plancha' },
  { id: 'crunch', name: 'Crunch Abdominal' },
  { id: 'russian-twist', name: 'Russian Twist' },
  { id: 'elevacion-piernas', name: 'Elevación de Piernas' }
]; 