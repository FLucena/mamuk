import { z } from 'zod';
import { bodyZones } from '@/lib/constants/bodyZones';

// Schema for workout creation validation
export const workoutValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  days: z.array(z.object({
    name: z.string(),
    blocks: z.array(z.object({
      name: z.string(),
      exercises: z.array(z.object({
        name: z.string(),
        sets: z.number().int().positive(),
        reps: z.number().int().positive(),
        weight: z.number().nonnegative(),
        type: z.string().optional(),
        videoUrl: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.enum(bodyZones)).optional()
      }))
    })).min(1, "At least one block is required")
  })).min(1, "At least one day is required"),
  status: z.enum(['active', 'archived', 'completed']).optional().default('active'),
  assignedCoaches: z.array(z.string()).optional(),
  assignedCustomers: z.array(z.string()).optional(),
  isCoachCreated: z.boolean().optional()
});

// Schema for workout type inference (matches the Workout type exactly)
export const workoutSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  days: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    blocks: z.array(z.object({
      id: z.string(),
      name: z.string(),
      exercises: z.array(z.object({
        id: z.string(),
        name: z.string(),
        sets: z.number(),
        reps: z.number(),
        weight: z.number(),
        type: z.string().optional(),
        videoUrl: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.enum(bodyZones)).optional()
      }))
    }))
  })),
  userId: z.string(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['active', 'archived', 'completed']).optional(),
  assignedCoaches: z.array(z.string()).optional(),
  assignedCustomers: z.array(z.string()).optional(),
  isCoachCreated: z.boolean().optional()
}); 