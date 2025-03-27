# Mamuk Fitness Application

Mamuk Fitness is a full-stack application designed to help users track workouts, create custom exercise routines, monitor progress, and connect with fitness coaches.

## Features

- **User Authentication:** Secure registration and login system
- **Exercise Library:** Browse and search through a comprehensive library of exercises
- **Custom Exercises:** Create and save custom exercises
- **Workout Management:** Create, edit, and schedule workout routines
- **Workout Tracking:** Log completed workouts and track progress
- **Progress Monitoring:** Record and visualize fitness progress over time
- **Coaching Relationships:** Connect coaches with clients for personalized fitness journeys

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest, Supertest

## Prerequisites

- Node.js (v16+)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mamuk-fitness.git
   cd mamuk-fitness
   ```

2. Install dependencies:
   ```
   npm run install:all
   ```

3. Create a `.env` file in the root directory with the following environment variables:
   ```
   PORT=5173
   MONGODB_URI=mongodb://localhost:27017/mamuk-fitness
   JWT_SECRET=your-super-secret-key-for-development-change-in-production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

## Running the Application

### Development Mode

To run both the backend server and frontend client concurrently:

```
npm run dev:all
```

Or run them separately:

- Backend server only:
  ```
  npm run server:dev
  ```

- Frontend client only:
  ```
  npm run dev
  ```

### Production Build

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/exercises` - Create a new exercise
- `PUT /api/exercises/:id` - Update an exercise
- `DELETE /api/exercises/:id` - Delete an exercise
- `GET /api/exercises/muscle-groups` - Get all muscle groups
- `GET /api/exercises/equipment` - Get all equipment

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get workout by ID
- `POST /api/workouts` - Create a new workout
- `PUT /api/workouts/:id` - Update a workout
- `DELETE /api/workouts/:id` - Delete a workout
- `PUT /api/workouts/:id/toggle-completion` - Toggle workout completion status

### Workout Sessions
- `GET /api/workout-sessions` - Get all workout sessions
- `GET /api/workout-sessions/:id` - Get workout session by ID
- `POST /api/workout-sessions/start` - Start a new workout session
- `PUT /api/workout-sessions/:id` - Update a workout session
- `PUT /api/workout-sessions/:id/complete` - Complete a workout session
- `PUT /api/workout-sessions/:id/toggle-set` - Toggle completion of a set
- `PUT /api/workout-sessions/:id/log-set` - Log weight and reps for a set
- `DELETE /api/workout-sessions/:id` - Delete a workout session

### Progress Tracking
- `GET /api/progress` - Get all progress entries
- `GET /api/progress/:id` - Get progress entry by ID
- `POST /api/progress` - Create a new progress entry
- `PUT /api/progress/:id` - Update a progress entry
- `DELETE /api/progress/:id` - Delete a progress entry
- `GET /api/progress/latest` - Get latest progress entry
- `GET /api/progress/stats` - Get progress statistics

### Coaching
- `GET /api/coaching` - Get all coaching relationships
- `GET /api/coaching/:id` - Get coaching relationship by ID
- `POST /api/coaching/invite` - Request a new coaching relationship
- `PUT /api/coaching/:id/respond` - Respond to a coaching request
- `PUT /api/coaching/:id/terminate` - Terminate a coaching relationship
- `PUT /api/coaching/:id/notes` - Update coaching relationship notes

## Testing

Run all tests:
```
npm test
```

Run unit tests only:
```
npm run test:unit
```

Run integration tests only:
```
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Exercise data sourced from [name of source if applicable]
- Icons provided by [Lucide React](https://lucide.dev/)
