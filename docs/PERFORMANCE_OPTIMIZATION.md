# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Mamuk application to improve user experience and reduce server load.

## Table of Contents

1. [Reducing Multiple Redirects](#reducing-multiple-redirects)
2. [MongoDB Query Optimization](#mongodb-query-optimization)
3. [Additional Performance Tips](#additional-performance-tips)

## Reducing Multiple Redirects

Multiple redirects can significantly slow down your application and create a poor user experience. We've implemented several strategies to reduce redirects:

### Redirect Tracking

The `authNavigation.ts` file now includes a redirect tracking mechanism that:

- Prevents redirect loops by detecting patterns like A→B→A→B
- Limits the number of redirects that can occur in a short time period
- Avoids redirecting to the same page

### Debounced Redirects in RouteGuard

The `RouteGuard` component now implements debounced redirects:

- Uses a 1-second debounce time to prevent rapid consecutive redirects
- Tracks the last redirect time to avoid unnecessary redirects
- Resets authorization state when the path changes

### Optimized useAuthRedirect Hook

The `useAuthRedirect` hook has been updated to:

- Check if we're already on the target page before redirecting
- Implement debouncing to prevent multiple redirects
- Use a more efficient redirect mechanism

## MongoDB Query Optimization

Slow MongoDB queries can significantly impact application performance. We've implemented several optimizations:

### MongoDB Indexes

We've added indexes for commonly queried fields:

- **Users Collection**:
  - `email` (unique)
  - `sub` (unique)
  - `email` and `sub` (compound index)
  - `roles`

- **Workouts Collection**:
  - `userId`
  - `name`
  - `userId` and `createdAt` (compound index for sorting)

### Query Hints

The database connection now automatically applies query hints based on the query pattern:

- Detects common query patterns (e.g., finding users by email)
- Applies the appropriate index hint to improve query performance
- Logs slow queries with suggestions for optimization

### Index Creation

Indexes are created automatically in development mode and can be manually created in production:

- Run `npm run db:create-indexes` to create indexes manually
- Indexes are created once per server start in development mode
- The application tracks whether indexes have been created

## Additional Performance Tips

### 1. Monitor Slow Queries

The application logs slow MongoDB queries with details about:

- The operation type (find, findOne, aggregate, etc.)
- The collection being queried
- The filter being used
- Whether a hint was applied
- Suggestions for optimization

Look for these logs in your server output and address any consistently slow queries.

### 2. Optimize React Components

- Use React.memo for components that don't need to re-render often
- Implement useCallback and useMemo for expensive computations
- Use React.lazy and Suspense for code splitting

### 3. Database Connection Management

- The application maintains a connection pool to reduce connection overhead
- Connection stats are logged in development mode
- The connection is reused across requests

### 4. Implement Caching

For frequently accessed data that doesn't change often, consider implementing:

- Client-side caching using React Query or SWR
- Server-side caching using Redis or an in-memory cache
- HTTP caching with appropriate cache headers

## Monitoring Performance

The application includes several tools for monitoring performance:

- Database stats are available through the `getDbStats` function
- Slow queries are logged with detailed information
- Connection pool stats are logged in development mode

Regularly review these metrics to identify and address performance issues. 