This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Testing for Navigation Throttling

Next.js has a built-in protection mechanism that throttles navigation events to prevent the browser from hanging. This can sometimes be observed during development when you see the following warning in the console:

```
Throttling navigation to prevent the browser from hanging. See https://nextjs.org/docs/messages/navigation-throttling
```

To test for this issue and see if it affects your application:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Run the navigation throttling test:
   ```bash
   npm run test:navigation
   ```

This will open Chrome with the `--disable-ipc-flooding-protection` flag and navigate to the test page. Click the "Start Test" button to simulate rapid navigation events and check if throttling occurs.

If you want to bypass the throttling protection during development, you can start Chrome with the `--disable-ipc-flooding-protection` flag:

```bash
# Windows
start chrome --disable-ipc-flooding-protection http://localhost:3001

# macOS
open -a "Google Chrome" --args --disable-ipc-flooding-protection http://localhost:3001

# Linux
google-chrome --disable-ipc-flooding-protection http://localhost:3001
```

## Testing

This project uses Jest for testing. We have set up a comprehensive testing environment with mocks for:

- MongoDB models and database connections
- Next.js components and hooks
- Authentication and navigation contexts

### Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- path/to/test.js
```

### Test Structure

Tests are organized in the following directories:

- `__tests__/components/` - Component tests
- `__tests__/integration/` - Integration tests
- `__tests__/api/` - API route tests
- `__tests__/lib/` - Utility and service tests
- `__tests__/examples/` - Example tests demonstrating testing patterns

### Mock Helpers

We provide several helper functions to create mocks for common dependencies:

- `src/test/mockModels.js` - Helpers for mocking MongoDB models
- `src/test/mockNextjs.js` - Helpers for mocking Next.js components and hooks
- `src/test/setupEnv.js` - Environment setup for Jest
- `src/test/mockEnv.js` - Mock environment variables for tests
- `__mocks__/mongoose.js` - Mock implementation of mongoose
- `__mocks__/db.js` - Mock implementation of database connection

### Example Test

Check out `__tests__/examples/complete-test-example.test.jsx` for a complete example of how to use all the mocks together.

### Recent Improvements

We've recently made several improvements to our testing setup:

1. Created centralized mock helpers for MongoDB models and database connections
2. Added proper mocks for Next.js components and hooks
3. Fixed issues with circular dependencies in mongoose mocks
4. Added environment variable mocks for tests
5. Simplified API mocking with fetch mocks
6. Added a complete test example that demonstrates all mocking techniques

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## User Roles and Permissions

This application implements a flexible role-based access control system. Users can have multiple roles simultaneously, providing more granular control over permissions.

### Available Roles

- **Admin**: Full access to all features, including user management
- **Coach**: Can create and manage workouts, and view assigned customers
- **Customer**: Can view and complete assigned workouts

### Multi-Role Support

Users can have multiple roles simultaneously. For example, a user can be both an admin and a coach, allowing them to perform administrative tasks while also functioning as a coach.

### Role-Based Access Control

Access to different parts of the application is controlled based on the user's roles:

- **Admin Routes**: `/admin/*` - Requires the admin role
- **Coach Routes**: `/coach/*` - Requires the coach role
- **Customer Routes**: `/workout/*`, `/profile/*`, `/achievements/*` - Requires any valid role

### Migration

If you're upgrading from a previous version that used a single role property, run the migration script to update your database:

```bash
node scripts/migrate-user-roles.js
```

This script will ensure all users have a `roles` array based on their existing `role` property.
