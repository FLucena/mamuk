/**
 * Helper functions for mocking API requests using MSW
 */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Creates a mock API server with the provided handlers
 * @param {Array} handlers - Array of MSW handlers
 * @returns {Object} MSW server instance
 */
export function createMockApiServer(handlers) {
  return setupServer(...handlers);
}

/**
 * Creates common API handlers for authentication endpoints
 * @param {Object} options - Options for the handlers
 * @returns {Array} Array of MSW handlers
 */
export function createAuthHandlers(options = {}) {
  const defaultUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['customer'],
    ...options.user,
  };

  return [
    http.get('/api/auth/session', () => {
      return HttpResponse.json({
        user: defaultUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }),
    
    http.post('/api/auth/signin', async ({ request }) => {
      const body = await request.json();
      
      if (body.email === 'test@example.com' && body.password === 'password') {
        return HttpResponse.json({
          user: defaultUser,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      
      return new HttpResponse(null, { status: 401 });
    }),
    
    http.post('/api/auth/signout', () => {
      return HttpResponse.json({ success: true });
    }),
  ];
}

/**
 * Creates common API handlers for user endpoints
 * @param {Object} options - Options for the handlers
 * @returns {Array} Array of MSW handlers
 */
export function createUserHandlers(options = {}) {
  const defaultUsers = options.users || [
    {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['customer'],
    },
    {
      id: 'admin-123',
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['admin'],
    },
  ];

  return [
    http.get('/api/users', () => {
      return HttpResponse.json(defaultUsers);
    }),
    
    http.get('/api/users/:id', ({ params }) => {
      const user = defaultUsers.find(u => u.id === params.id);
      
      if (user) {
        return HttpResponse.json(user);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
    
    http.get('/api/users/role', () => {
      return HttpResponse.json({ roles: ['customer'] });
    }),
  ];
}

/**
 * Creates common API handlers for workout endpoints
 * @param {Object} options - Options for the handlers
 * @returns {Array} Array of MSW handlers
 */
export function createWorkoutHandlers(options = {}) {
  const defaultWorkouts = options.workouts || [
    {
      id: 'workout-123',
      name: 'Test Workout',
      description: 'Test Description',
      userId: 'user-123',
      days: [],
    },
  ];

  return [
    http.get('/api/workout', () => {
      return HttpResponse.json(defaultWorkouts);
    }),
    
    http.get('/api/workout/:id', ({ params }) => {
      const workout = defaultWorkouts.find(w => w.id === params.id);
      
      if (workout) {
        return HttpResponse.json(workout);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
    
    http.post('/api/workout', async ({ request }) => {
      const body = await request.json();
      
      const newWorkout = {
        id: 'new-workout-' + Date.now(),
        ...body,
      };
      
      return HttpResponse.json(newWorkout);
    }),
    
    http.put('/api/workout/:id', async ({ params, request }) => {
      const body = await request.json();
      
      const workout = defaultWorkouts.find(w => w.id === params.id);
      
      if (workout) {
        const updatedWorkout = {
          ...workout,
          ...body,
        };
        
        return HttpResponse.json(updatedWorkout);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
    
    http.delete('/api/workout/:id', ({ params }) => {
      const workout = defaultWorkouts.find(w => w.id === params.id);
      
      if (workout) {
        return HttpResponse.json({ success: true });
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
  ];
}

/**
 * Creates common API handlers for admin endpoints
 * @param {Object} options - Options for the handlers
 * @returns {Array} Array of MSW handlers
 */
export function createAdminHandlers(options = {}) {
  const defaultUsers = options.users || [
    {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['customer'],
    },
    {
      id: 'admin-123',
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['admin'],
    },
  ];

  return [
    http.get('/api/admin/users', () => {
      return HttpResponse.json(defaultUsers);
    }),
    
    http.get('/api/admin/users/:id', ({ params }) => {
      const user = defaultUsers.find(u => u.id === params.id);
      
      if (user) {
        return HttpResponse.json(user);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
    
    http.put('/api/admin/users/:id', async ({ params, request }) => {
      const body = await request.json();
      
      const user = defaultUsers.find(u => u.id === params.id);
      
      if (user) {
        const updatedUser = {
          ...user,
          ...body,
        };
        
        return HttpResponse.json(updatedUser);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
    
    http.put('/api/admin/users/:id/roles', async ({ params, request }) => {
      const body = await request.json();
      
      const user = defaultUsers.find(u => u.id === params.id);
      
      if (user) {
        const updatedUser = {
          ...user,
          roles: body.roles,
        };
        
        return HttpResponse.json(updatedUser);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),
  ];
}

/**
 * Creates all common API handlers
 * @param {Object} options - Options for the handlers
 * @returns {Array} Array of MSW handlers
 */
export function createAllHandlers(options = {}) {
  return [
    ...createAuthHandlers(options),
    ...createUserHandlers(options),
    ...createWorkoutHandlers(options),
    ...createAdminHandlers(options),
  ];
} 