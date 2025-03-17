import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' }, // Light mode color
    { media: '(prefers-color-scheme: dark)', color: '#111827' }   // Dark mode color
  ],
  colorScheme: 'light dark'
};

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Removed role check - any authenticated user can access coach pages now

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="bg-white dark:bg-gray-800 shadow-lg mb-8 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-start items-center">
              <div className="flex space-x-1">
                <Link
                  href="/coach"
                  className="px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/coach/customers"
                  className="px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                >
                  Mis Clientes
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 