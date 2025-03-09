'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import LoadingSpinner from './ui/LoadingSpinner';
import Icon from './ui/Icon';

export default function NavbarSimple() {
  const { isAdmin, isCoach } = useAuth();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isNavigating, navigateTo } = useNavigation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigateTo(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    return `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
    } transition-colors duration-200`;
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                MAMUK
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <button 
                onClick={() => handleNavigation('/')}
                className={navLinkClass('/')}
              >
                <Icon icon="FiHome" className="mr-2" /> Inicio
              </button>
              
              {isAdmin && (
                <button 
                  onClick={() => handleNavigation('/admin')}
                  className={navLinkClass('/admin')}
                >
                  <Icon icon="FiUsers" className="mr-2" /> Admin
                  {isNavigating && pathname?.startsWith('/admin') && (
                    <LoadingSpinner size="sm" />
                  )}
                </button>
              )}

              {isCoach && (
                <button 
                  onClick={() => handleNavigation('/coach')}
                  className={navLinkClass('/coach')}
                >
                  <Icon icon="FiAward" className="mr-2" /> Coach
                  {isNavigating && pathname?.startsWith('/coach') && (
                    <LoadingSpinner size="sm" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <Icon icon="FiX" className="block h-6 w-6" />
              ) : (
                <Icon icon="FiMenu" className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button
            onClick={() => handleNavigation('/')}
            className={`${
              isActive('/')
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
            } block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center`}
          >
            <Icon icon="FiHome" className="mr-2" /> Inicio
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNavigation('/admin')}
              className={`${
                isActive('/admin')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              } block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center`}
            >
              <Icon icon="FiUsers" className="mr-2" /> Admin
              {isNavigating && pathname?.startsWith('/admin') && (
                <LoadingSpinner size="sm" className="ml-2" />
              )}
            </button>
          )}

          {isCoach && (
            <button
              onClick={() => handleNavigation('/coach')}
              className={`${
                isActive('/coach')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              } block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center`}
            >
              <Icon icon="FiAward" className="mr-2" /> Coach
              {isNavigating && pathname?.startsWith('/coach') && (
                <LoadingSpinner size="sm" className="ml-2" />
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 