'use server'

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getWorkout } from '@/lib/services/workout';
import WorkoutClient from '@/components/workout/WorkoutClient';
import * as actions from './actions';
import { Types } from 'mongoose';
import { Workout as MongoWorkout } from '@/lib/models/workout';
import { dbConnect } from '@/lib/db';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUserRole, getCurrentUserRoles } from '@/lib/utils/permissions';
import SchemaOrg from '@/components/SchemaOrg';
import { generateWorkoutSchema as generateWorkoutSEOSchema } from '@/lib/utils/schema';
import { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from '@/lib/utils/metadata';
import { SITE_URL } from '@/lib/constants/site';
import { exerciseList } from '@/data/exercises';
import { randomUUID } from 'crypto';
import { createWorkout as createWorkoutAPI } from '@/lib/services/workout';
import { z } from 'zod';
import { workoutSchema } from '@/lib/schemas/workout';
import type { Workout, WorkoutDay, Block, Exercise } from '@/types/models';

interface WorkoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Define the wrapper function separately with "use server" directive
// This allows it to be passed to client components
async function deleteWorkoutWrapper(workoutId: string, userId: string): Promise<void> {
  "use server";
  await actions.deleteWorkout(workoutId, userId);
  // Return void
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { id } = await params;
  
  // Handle create case
  if (id === 'create') {
    // Get user roles to check permissions
    const userRoles = await getCurrentUserRoles(session.user.id);
    const isAdmin = userRoles.includes('admin');
    const isCoach = userRoles.includes('coach');
    
    // Create a new workout in the database
    const defaultWorkout = {
      name: 'Nueva Rutina',
      description: '',
      days: Array.from({ length: 3 }, (_, dayIndex) => ({
        id: new Types.ObjectId().toString(),
        name: `Día ${dayIndex + 1}`,
        blocks: Array.from({ length: 4 }, (_, blockIndex) => ({
          id: new Types.ObjectId().toString(),
          name: `Bloque ${blockIndex + 1}`,
          exercises: Array.from({ length: 3 }, () => {
            const randomExercise = exerciseList[Math.floor(Math.random() * exerciseList.length)];
            return {
              id: new Types.ObjectId().toString(),
              name: randomExercise?.name || `Ejercicio ${Math.floor(Math.random() * 100)}`,
              sets: 3,
              reps: 12,
              weight: 0,
              videoUrl: randomExercise?.videoUrl || '',
              notes: randomExercise?.notes || '',
              tags: []
            };
          })
        }))
      })),
      status: 'active' as const
    };

    try {
      // Create the workout using the service function
      const workout = await createWorkoutAPI(defaultWorkout, session.user.id);
      if (!workout) {
        console.error('Error creating workout: No workout returned');
        redirect('/workout');
      }

      // Redirect to the newly created workout
      redirect(`/workout/${workout.id}`);
    } catch (error) {
      console.error('Error creating workout:', error);
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
        console.error('Validation errors:', errorMessages);
      }
      // If there's an error (like reaching the workout limit), redirect to the workouts list
      redirect('/workout');
    }
  }
  
  const workoutDoc = await getWorkout(id, session.user.id) as any;
  
  if (!workoutDoc) {
    redirect('/workout');
  }

  // Get user roles
  const userRoles = await getCurrentUserRoles(session.user.id);
  const isAdmin = userRoles.includes('admin');
  const isCoach = userRoles.includes('coach');

  // Ensure the workout ID is properly set as a string
  const workoutId = workoutDoc._id?.toString() || workoutDoc.id?.toString() || id;
  
  console.log('[WorkoutPage] Processing workout data:', {
    rawId: workoutDoc._id,
    processedId: workoutId,
    hasId: !!workoutId
  });

  // Serialize the workout data to ensure all MongoDB objects are converted to plain objects
  const workout = JSON.parse(JSON.stringify({
    ...workoutDoc,
    id: workoutId, // Ensure ID is explicitly set as string
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
  const workoutSEOSchema = generateWorkoutSEOSchema(workout);

  return (
    <>
      {/* Esquema JSON-LD para SEO */}
      <SchemaOrg schema={workoutSEOSchema} />
      
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
        deleteWorkout={deleteWorkoutWrapper}
        updateDayName={actions.updateDayName}
        updateBlockName={actions.updateBlockName}
        isAdmin={isAdmin}
        isCoach={isCoach}
      />
    </>
  );
}

// Generar metadatos dinámicos para la página
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    console.log(`[DEBUG] Generando metadatos para workout ${params.id}`);
    
    await dbConnect();
    const workout = await (MongoWorkout.findById as any)(params.id).lean();
    
    if (!workout) {
      console.log(`[DEBUG] Workout no encontrado para metadatos: ${params.id}`);
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
    
    console.log(`[DEBUG] Metadatos generados para workout: ${workoutName}`);
    
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