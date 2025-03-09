'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminView = 'users' | 'archived' | 'assignments';

interface AdminNavigationProps {
  currentView?: AdminView;
}

export default function AdminNavigation({ currentView }: AdminNavigationProps) {
  const pathname = usePathname();
  
  // If currentView is not provided, determine it from the pathname
  const activeView = currentView || (() => {
    if (pathname.includes('/admin/assignments')) return 'assignments';
    if (pathname.includes('/admin/archived')) return 'archived';
    return 'users';
  })();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg mb-8 rounded-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-start items-center">
          <div className="flex space-x-1">
            <Link
              href="/admin"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                activeView === 'users'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Gestionar Usuarios
            </Link>
            <Link
              href="/admin/assignments"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                activeView === 'assignments'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Asignaciones Coach-Cliente
            </Link>
            <Link
              href="/admin/archived"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                activeView === 'archived'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Rutinas Archivadas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 