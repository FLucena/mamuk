# Next.js Best Practices

This document outlines the best practices implemented in the Mamuk application using Next.js App Router.

## Project Structure

### Private Folders

We use the underscore prefix (`_`) for non-route folders to indicate they are not part of the routing system:

```
src/app/
├── _components/    # Shared components
├── _hooks/         # Custom React hooks
├── _lib/           # Utility libraries
├── _utils/         # Helper functions
├── api/            # API routes (part of routing)
├── examples/       # Example pages (part of routing)
└── ...             # Other route folders
```

### Colocation

We organize related files together to improve maintainability:

- Components are colocated with their related styles, tests, and utilities
- API routes are colocated with their validation schemas and handlers
- Pages are colocated with their loading states and error boundaries

## Data Fetching Strategies

### Server-Side Data Fetching

We leverage Server Components to fetch data on the server:

```tsx
// This is a Server Component
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fetch data directly on the server
  const product = await fetchWithCache(`/api/products/${params.id}`);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <ClientComponent product={product} />
    </div>
  );
}
```

Benefits:
- Direct access to backend resources
- Enhanced security (sensitive information stays on the server)
- Reduced client-server communication
- Improved SEO

### Streaming and Suspense

We use React's Streaming and Suspense to progressively render UI components:

```tsx
import { Suspense } from 'react';
import { ProfileSkeleton, TableSkeleton } from '@/app/_components/Suspense/SkeletonLoader';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* User Profile - Loads First */}
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile />
      </Suspense>
      
      {/* Activity Feed - Loads Second */}
      <Suspense fallback={<TableSkeleton rows={3} />}>
        <ActivityFeed />
      </Suspense>
      
      {/* Recommendations - Loads Last */}
      <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
        <Recommendations />
      </Suspense>
    </div>
  );
}
```

Benefits:
- Improved perceived performance
- Progressive loading of content
- Better user experience during loading

### Client-Side Data Fetching with SWR

For client components that need to fetch data, we use SWR for efficient caching and revalidation:

```tsx
'use client';

import { useFetch } from '@/app/_hooks/useSWRFetch';

export default function UserList() {
  const { data, error, isLoading } = useFetch('/api/users');
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Benefits:
- Automatic revalidation
- Optimistic UI updates
- Error handling
- Caching and deduplication

## API Development

### Route Handlers

We implement API routes using the App Router's route handlers:

```tsx
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET request
  return NextResponse.json({ data: [...] });
}

export async function POST(request: NextRequest) {
  // Handle POST request
  return NextResponse.json({ success: true }, { status: 201 });
}
```

### Data Validation

We use Zod for robust data validation in API routes:

```tsx
import { validateRequest } from '@/app/_lib/validation';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const result = await validateRequest(req, UserSchema);
  
  if (!result.success) {
    return result.response;
  }
  
  // Data is valid, proceed with your logic
  const validatedData = result.data;
  // ...
}
```

### Edge Functions

For global performance, we leverage Edge Functions where appropriate:

```tsx
// src/app/api/geo/route.ts
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const country = request.geo?.country || 'Unknown';
  return NextResponse.json({ country });
}
```

## Security Measures

### HTTPS Enforcement

We enforce HTTPS in production:

```tsx
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
  
  return NextResponse.next();
}
```

### Data Sanitization

We sanitize user-generated content to prevent XSS attacks:

```tsx
import { sanitizeHtml } from '@/app/_lib/validation';

// Sanitize HTML content
const sanitizedContent = sanitizeHtml(userProvidedHtml);
```

### Authentication and Authorization

We implement secure authentication with NextAuth.js and proper authorization checks:

```tsx
// Protect routes in middleware
export function middleware(request: NextRequest) {
  // Check if the route requires authentication
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // Check role-based access
    if (isAdminRoute(request.nextUrl.pathname) && !token.roles?.includes('admin')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}
```

## Performance Optimization

### Caching Strategies

We implement various caching strategies:

1. **Server-Side Caching**:
```tsx
// Cache data with specific revalidation time
export const fetchWithRevalidate = async <T>(url: string, revalidateSeconds: number): Promise<T> => {
  const response = await fetch(url, {
    next: { revalidate: revalidateSeconds },
  });
  return response.json();
};
```

2. **Client-Side Caching with SWR**:
```tsx
// Custom hook with SWR for client-side caching
export function useFetch<Data = any>(url: string, options?: SWRConfiguration) {
  return useSWR<Data>(url, defaultFetcher, {
    revalidateOnFocus: false,
    ...options,
  });
}
```

### Image Optimization

We use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

export function ProfileImage({ user }) {
  return (
    <Image
      src={user.avatar}
      alt={`${user.name}'s profile picture`}
      width={64}
      height={64}
      className="rounded-full"
      priority={false}
      loading="lazy"
    />
  );
}
```

### Code Splitting

We use dynamic imports for code splitting:

```tsx
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable server-side rendering if needed
});
```

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching in Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [SWR Documentation](https://swr.vercel.app/) 