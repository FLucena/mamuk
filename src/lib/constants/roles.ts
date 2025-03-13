export const ROLES = {
  ADMIN: 'admin',
  COACH: 'coach',
  CUSTOMER: 'customer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const WORKOUT_STATUS = {
  ACTIVE: 'active',
  COMPLETE: 'complete',
  ARCHIVED: 'archived',
} as const;

export type WorkoutStatus = typeof WORKOUT_STATUS[keyof typeof WORKOUT_STATUS]; 