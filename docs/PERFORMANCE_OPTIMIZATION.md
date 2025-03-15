# Performance Optimization Guide

This document outlines strategies and best practices for optimizing the performance of the Mamuk application.

## Table of Contents

1. [Database Optimization](#database-optimization)
2. [React Component Optimization](#react-component-optimization)
3. [Next.js Specific Optimizations](#nextjs-specific-optimizations)
4. [Analytics and Monitoring](#analytics-and-monitoring)
5. [Bundle Size Optimization](#bundle-size-optimization)

## Database Optimization

### MongoDB Query Performance

- **Indexing**: Create appropriate indexes for frequently queried fields.
  ```javascript
  // Example: Creating an index on the 'email' field
  db.users.createIndex({ email: 1 });
  ```

- **Query Optimization**: Use projection to limit returned fields.
  ```javascript
  // Instead of fetching the entire document
  const user = await User.findById(id);
  
  // Only fetch the fields you need
  const user = await User.findById(id).select('name email roles');
  ```

- **Compound Indexes**: For queries that filter on multiple fields.
  ```javascript
  // For queries that filter by both status and customerId
  db.workouts.createIndex({ status: 1, customerId: 1 });
  ```

- **Aggregation Pipeline Optimization**:
  - Use `$match` early in the pipeline to reduce documents processed
  - Use `$project` to limit fields
  - Consider using `$limit` and `$skip` with caution

### Connection Pooling

- The application uses connection pooling with the following settings:
  ```javascript
  maxPoolSize: 30,
  minPoolSize: 10
  ```
  
- Monitor connection usage and adjust these values based on your application's needs.

## React Component Optimization

### Memoization

- Use `React.memo()` for components that render often but with the same props.
- Use `useMemo()` for expensive calculations.
- Use `useCallback()` for functions passed as props to child components.

```javascript
// Example of proper memoization
const MemoizedComponent = React.memo(function MyComponent(props) {
  // Component logic
});

// Custom comparison function if needed
const areEqual = (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.id === nextProps.id;
};

const MemoizedWithCustomComparison = React.memo(MyComponent, areEqual);
```

### Reducing Re-renders

- Avoid creating new objects or functions in render.
- Use the React DevTools Profiler to identify unnecessary re-renders.
- Consider using state management solutions like Context API efficiently.

### Code Splitting

- Use dynamic imports for components not needed on initial load.
```javascript
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

## Next.js Specific Optimizations

### Image Optimization

- Use Next.js `Image` component for automatic image optimization.
```jsx
import Image from 'next/image';

// Optimized image
<Image
  src="/profile.jpg"
  width={500}
  height={300}
  alt="Profile"
  priority={isAboveFold}
/>
```

### Font Optimization

- Use `next/font` to optimize font loading and reduce layout shifts.
```jsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function Layout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      {children}
    </html>
  );
}
```

### Route Optimization

- Use the App Router's built-in features:
  - Parallel Routes
  - Intercepting Routes
  - Server Components where appropriate

### Server Components vs. Client Components

- Use Server Components for:
  - Fetching data
  - Accessing backend resources
  - Keeping sensitive information on the server
  
- Use Client Components for:
  - Interactivity and event listeners
  - Using hooks
  - Browser-only APIs

## Analytics and Monitoring

### Performance Monitoring

- Use the built-in performance monitoring tools:
  - Core Web Vitals tracking
  - Custom performance marks
  
- Implement sampling for production analytics to reduce overhead:
```javascript
// Only track 10% of users in production
if (process.env.NODE_ENV === 'production' && Math.random() > 0.1) {
  return;
}
```

### Slow Query Detection

- The application automatically logs slow MongoDB queries (>500ms).
- Review these logs regularly and optimize problematic queries.

## Bundle Size Optimization

### Code Splitting

- Use dynamic imports for large libraries or components.
```javascript
// Instead of importing directly
import LargeLibrary from 'large-library';

// Use dynamic import
const LargeLibrary = dynamic(() => import('large-library'), {
  ssr: false // If not needed for SSR
});
```

### Tree Shaking

- Import only what you need from libraries.
```javascript
// Instead of
import lodash from 'lodash';

// Use specific imports
import { debounce, throttle } from 'lodash';
```

### Analyzing Bundle Size

- Use tools like `@next/bundle-analyzer` to identify large dependencies.
```bash
# Install the package
npm install --save-dev @next/bundle-analyzer

# Configure in next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
});

# Run analysis
ANALYZE=true npm run build
```

## Best Practices Checklist

- [ ] Create appropriate MongoDB indexes
- [ ] Memoize expensive components
- [ ] Implement code splitting for large components
- [ ] Optimize images using Next.js Image component
- [ ] Monitor and fix slow database queries
- [ ] Implement proper error boundaries
- [ ] Use Server Components where appropriate
- [ ] Optimize third-party script loading
- [ ] Implement performance monitoring with sampling
- [ ] Regularly analyze bundle size 