# Redirect Optimization Guide

This document outlines the optimizations made to the redirect system in the Mamuk application to reduce unnecessary redirects and improve performance.

## Overview

The application previously had multiple components and hooks handling redirects independently, which could lead to:

1. Unnecessary redirects
2. Redirect loops
3. Multiple redirects in quick succession
4. Race conditions between different redirect mechanisms

To address these issues, we've implemented a centralized redirect system with the following components:

## Centralized Redirect Service

The `redirectService` in `src/utils/redirectService.ts` provides a single source of truth for handling redirects throughout the application. It includes:

- **Debouncing**: Prevents multiple redirects in quick succession
- **Loop Detection**: Identifies and prevents redirect loops
- **Path Checking**: Avoids redirecting to the current page
- **Logging**: Tracks all redirect attempts for debugging

```typescript
// Example usage
redirectService.performRedirect(router, '/target-path', {
  source: 'ComponentName',
  sessionStatus: 'authenticated',
  force: false
});
```

## Redirect Logger

The `redirectLogger` in `src/utils/redirectLogger.ts` provides utilities for logging and analyzing redirects:

- **Log Collection**: Records all redirect attempts
- **Analysis**: Identifies patterns and potential issues
- **Statistics**: Provides metrics on redirect frequency and success rate

## Updated Components

The following components have been updated to use the centralized redirect service:

1. **RouteGuard**: Now uses `redirectService` instead of direct router calls
2. **useAuthRedirect**: Updated to use the centralized service
3. **SignIn Page**: Improved to use server-side redirects where possible

## Debug Tools

A debug page is available at `/debug/redirects` to monitor and analyze redirects in real-time. It shows:

- Total redirects and success rate
- Potential redirect loops
- Most frequent redirect sources
- Detailed logs of all redirect attempts

## Best Practices

When implementing redirects in the application, follow these best practices:

1. **Always use the centralized service**:
   ```typescript
   import { redirectService } from '@/utils/redirectService';
   
   // In a component with router access
   redirectService.performRedirect(router, '/target-path', { source: 'YourComponent' });
   ```

2. **Prefer server-side redirects** when possible:
   ```typescript
   // In a server component
   import { redirect } from 'next/navigation';
   
   if (condition) {
     console.log('[Server] Redirecting to:', '/target-path');
     redirect('/target-path');
   }
   ```

3. **Add source information** to help with debugging:
   ```typescript
   redirectService.performRedirect(router, '/target-path', { 
     source: 'ComponentName-specificAction' 
   });
   ```

4. **Include session status** for better analytics:
   ```typescript
   redirectService.performRedirect(router, '/target-path', { 
     source: 'ComponentName',
     sessionStatus: status // from useSession()
   });
   ```

## Monitoring and Maintenance

Regularly check the redirect debug page at `/debug/redirects` to:

1. Identify unnecessary redirects
2. Detect redirect loops
3. Monitor redirect performance
4. Find opportunities for further optimization

By following these guidelines and using the centralized redirect system, we can ensure a smoother user experience with fewer unnecessary page transitions and improved performance. 