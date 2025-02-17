import { withAuth } from 'next-auth/middleware';

export default withAuth;

// Configure protected routes
export const config = {
  matcher: ["/ejercicios/:path*"]
}; 