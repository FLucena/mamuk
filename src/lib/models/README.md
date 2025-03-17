# Models Directory

This directory contains all the Mongoose models used in the application.

## Model Structure

- `user.ts`: User model with roles and authentication information
- `workout.ts`: Workout/Routine model for exercise routines
- `workoutAssignment.ts`: Model for assigning workouts to users
- `coach.ts`: Coach model for managing coach-specific data
- `progress.ts`: Model for tracking user progress

## Model Consolidation Plan

There are currently two model directories in the project:
- `src/lib/models/` (primary, used throughout the application)
- `src/models/` (secondary, mostly unused)

### Plan to Consolidate Models

1. **Keep the comprehensive models**: The models in `src/lib/models/` are more complete and are being used throughout the application. These should be the primary models.

2. **Remove duplicate models**: The models in `src/models/` should be removed to avoid confusion.

3. **Update imports**: Any imports using models from `src/models/` should be updated to use the models from `src/lib/models/`.

### Specific Actions

1. **User Model**: The `User.ts` model in `src/models/` is not being used and can be safely removed.

2. **Exercise Model**: The `Exercise.ts` model in `src/models/` is not being used and can be safely removed.

3. **Routine Model**: The `Routine.ts` model in `src/models/` is being used in `src/app/api/routines/route.ts`. This import should be updated to use the `workout.ts` model from `src/lib/models/`.

## Best Practices

- All new models should be added to `src/lib/models/`
- Use consistent naming conventions (lowercase filenames)
- Include proper TypeScript interfaces and types
- Add indexes for frequently queried fields
- Document model schemas with comments 