'use server'

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getWorkout } from '@/lib/services/workout';
import WorkoutClient from '@/components/workout/WorkoutClient';
import * as actions from './actions';
import { Types } from 'mongoose';
import { Workout } from '@/lib/models/workout';
import { dbConnect } from '@/lib/db';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUserRole } from '@/lib/utils/permissions';
import SchemaOrg from '@/components/SchemaOrg';
import { generateWorkoutSchema } from '@/lib/utils/schema';
import { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from '@/lib/utils/metadata';
import { SITE_URL } from '@/lib/constants/site';

interface WorkoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { id } = await params;
  
  const workoutDoc = await getWorkout(id) as any;
  
  if (!workoutDoc) {
    redirect('/workout');
  }

  // Serialize the workout data to ensure all MongoDB objects are converted to plain objects
  const workout = JSON.parse(JSON.stringify({
    ...workoutDoc,
    id: workoutDoc._id?.toString() || workoutDoc._id,
    userId: typeof workoutDoc.userId === 'object' && workoutDoc.userId !== null 
      ? String(workoutDoc.userId) 
      : workoutDoc.userId,
    // Asegurarse de que cada día, bloque y ejercicio tenga un ID válido
    days: (workoutDoc.days || []).map((day: any) => {
      // Generar un ID para el día si no existe
      const dayId = day.id || day._id?.toString() || `day_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        ...day,
        id: dayId,
        // Asegurarse de que el nombre del día tenga un valor por defecto
        name: day.name || `Día ${Math.floor(Math.random() * 100)}`,
        // Procesar los bloques del día
        blocks: (day.blocks || []).map((block: any) => {
          // Generar un ID para el bloque si no existe
          const blockId = block.id || block._id?.toString() || `block_${Math.random().toString(36).substr(2, 9)}`;
          
          return {
            ...block,
            id: blockId,
            // Asegurarse de que el nombre del bloque tenga un valor por defecto
            name: block.name || `Bloque ${Math.floor(Math.random() * 100)}`,
            // Procesar los ejercicios del bloque
            exercises: (block.exercises || []).map((exercise: any) => {
              // Generar un ID para el ejercicio si no existe
              const exerciseId = exercise.id || exercise._id?.toString() || `exercise_${Math.random().toString(36).substr(2, 9)}`;
              
              return {
                ...exercise,
                id: exerciseId,
                // Asegurarse de que el nombre del ejercicio tenga un valor por defecto
                name: exercise.name || `Ejercicio ${Math.floor(Math.random() * 100)}`,
                // Asegurarse de que los campos numéricos tengan valores por defecto
                sets: exercise.sets || 0,
                reps: exercise.reps || 0,
                weight: exercise.weight || 0,
                // Asegurarse de que los campos de texto tengan valores por defecto
                videoUrl: exercise.videoUrl || '',
                notes: exercise.notes || '',
                // Asegurarse de que los tags sean un array
                tags: Array.isArray(exercise.tags) ? exercise.tags : []
              };
            })
          };
        })
      };
    })
  }));

  // Generar esquema para SEO
  const workoutSchema = generateWorkoutSchema(workout);

  return (
    <>
      {/* Esquema JSON-LD para SEO */}
      <SchemaOrg schema={workoutSchema} />
      
      <Suspense fallback={<LoadingSpinner />}>
        <WorkoutClient
          workout={workout}
          userId={session.user.id}
          addDay={actions.addDay}
          addBlock={actions.addBlock}
          addExercise={actions.addExercise}
          updateExercise={actions.updateExercise}
          deleteExercise={actions.deleteExercise}
          deleteBlock={actions.deleteBlock}
          deleteDay={actions.deleteDay}
          deleteWorkout={actions.deleteWorkout}
          updateDayName={actions.updateDayName}
          updateBlockName={actions.updateBlockName}
        />
      </Suspense>
    </>
  );
}

// Generar metadatos dinámicos para la página
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    await dbConnect();
    const workout = await Workout.findById(params.id).lean();
    
    if (!workout) {
      return generatePageMetadata({
        title: 'Rutina no encontrada',
        description: 'La rutina de entrenamiento que buscas no existe o ha sido eliminada.',
        path: `workout/${params.id}`,
      });
    }
    
    // Asegurar que workout tenga las propiedades esperadas
    // Usar type assertion para manejar el tipo
    const workoutData = workout as any;
    const workoutName = workoutData.name || 'Rutina de entrenamiento';
    const workoutDescription = workoutData.description || 'Detalles de la rutina de entrenamiento personalizada en Mamuk.';
    
    return generatePageMetadata({
      title: workoutName,
      description: workoutDescription,
      path: `workout/${params.id}`,
      imageUrl: `${SITE_URL}/workout/${params.id}/opengraph-image`,
      keywords: ['rutina', 'entrenamiento', 'ejercicios', 'fitness'],
    });
  } catch (error) {
    console.error('Error generando metadatos:', error);
    return generatePageMetadata({
      title: 'Rutina de entrenamiento',
      description: 'Detalles de la rutina de entrenamiento personalizada en Mamuk.',
      path: `workout/${params.id}`,
    });
  }
} 