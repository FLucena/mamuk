# Models Directory

⚠️ **IMPORTANT: Models have been moved to `src/lib/models/`** ⚠️

This directory previously contained Mongoose models, but they have been consolidated into the `src/lib/models/` directory to avoid duplication and confusion.

## Why Models Were Moved

- To maintain a single source of truth for database models
- To ensure consistent model schemas across the application
- To avoid duplicate code and potential bugs

## Where to Find Models

All models are now located in the `src/lib/models/` directory:

- `user.ts`: User model with roles and authentication information
- `workout.ts`: Workout/Routine model for exercise routines
- `workoutAssignment.ts`: Model for assigning workouts to users
- `coach.ts`: Coach model for managing coach-specific data
- `progress.ts`: Model for tracking user progress

## How to Use Models

Import models from the `src/lib/models/` directory:

```typescript
// ❌ Don't import from here (src/models)
import { User } from '@/models/User'; // WRONG

// ✅ Import from lib/models instead
import User from '@/lib/models/user'; // CORRECT
import { Workout } from '@/lib/models/workout'; // CORRECT
```

See the README in `src/lib/models/` for more information about the model structure and best practices. 