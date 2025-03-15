# Migration from Pages Router to App Router

This document outlines the migration from Next.js Pages Router to App Router in the Mamuk application.

## Overview

Next.js introduced the App Router in version 13 as a new routing system built on React Server Components. It offers several advantages over the Pages Router:

- **React Server Components**: Improved performance with server-side rendering
- **Nested Layouts**: More flexible layout composition
- **Simplified Data Fetching**: Built-in data fetching with async/await
- **Streaming**: Improved loading states and partial rendering
- **Improved Routing**: More intuitive routing with nested folders

## Migration Steps

The following steps were taken to migrate from Pages Router to App Router:

1. **Removed Duplicate NextAuth Configuration**:
   - Deleted `src/pages/api/auth/[...nextauth].ts`
   - Ensured `src/app/api/auth/[...nextauth]/route.ts` had all necessary optimizations

2. **Removed Pages Router Files**:
   - Deleted `src/pages/_document.tsx`
   - Removed the entire `src/pages` directory

3. **Verified App Router Configuration**:
   - Confirmed that `src/app/layout.tsx` included all necessary metadata and layout components
   - Ensured that all API routes were properly implemented in the App Router

## NextAuth Configuration

The NextAuth configuration was migrated from Pages Router to App Router:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  // Get the NextAuth action (session, signin, etc.)
  const action = req.nextUrl.pathname.split('/').pop();
  
  // For session requests, add performance optimizations
  if (action === 'session') {
    // Add cache control headers
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, max-age=60');
    
    // Add timing headers for debugging
    const startTime = performance.now();
    
    // Process the request
    const nextAuthHandler = NextAuth(authOptions);
    const result = await nextAuthHandler(req, res);
    
    // Calculate processing time
    const processingTime = Math.round(performance.now() - startTime);
    res.headers.set('Server-Timing', `session;dur=${processingTime}`);
    
    return result;
  }
  
  // For other endpoints, just use the standard handler
  const nextAuthHandler = NextAuth(authOptions);
  return nextAuthHandler(req, res);
}

export { handler as GET, handler as POST };
```

## Benefits of the Migration

1. **Improved Performance**: React Server Components reduce JavaScript sent to the client
2. **Better Developer Experience**: More intuitive routing and layout composition
3. **Enhanced SEO**: Improved metadata handling and server-side rendering
4. **Simplified Codebase**: Removed duplicate code and consolidated routing
5. **Future-Proofing**: Aligned with Next.js's recommended approach

## Potential Issues

1. **Client Components vs Server Components**: Be mindful of the distinction between client and server components
2. **Data Fetching Changes**: The App Router uses a different approach to data fetching
3. **Middleware Adjustments**: Middleware behavior might differ between the two routers

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Migrating from Pages to App Router](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [NextAuth.js with App Router](https://next-auth.js.org/configuration/nextjs#in-app-router) 