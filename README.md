# Mamuk - Fitness App

A full-stack React and Express application for fitness tracking and workouts.

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

## Vercel Deployment Instructions

This application uses a hybrid architecture with:
- Frontend: React with Vite
- Backend: Express.js API with MongoDB

### Environment Variables

Make sure to set these environment variables in Vercel:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Deployment Architecture

When deploying to Vercel:

1. The static frontend is served directly by Vercel
2. API endpoints are implemented as Vercel serverless functions in the `/api` directory
3. The Express server is not used directly in production

### Local Development

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev:all

# Run just the frontend
npm run dev

# Run just the backend
npm run server:dev
```

### Building for Production

```bash
# Build both frontend and backend
npm run build
```

## API Endpoints

### Authentication

- `POST /api/auth/google/verify` - Verify Google token and create user
- `POST /api/auth/google/callback` - Handle Google OAuth callback

### User

- `GET /api/users/profile` - Get user profile (requires authentication)

### Health Check

- `GET /api/healthcheck` - Check API health

## Important Notes

1. The `/api` directory contains Vercel serverless functions that mirror the Express routes
2. For local development, the Express server is still used
3. In production, API requests are handled by Vercel's serverless functions

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
