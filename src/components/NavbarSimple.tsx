'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import LoadingSpinner from './ui/LoadingSpinner';
import { FiHome, FiUsers, FiAward, FiMenu, FiX } from 'react-icons/fi';

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

  // Determine if a link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') {
      return false;
    }
    return pathname?.startsWith(path);
  };

  // Classes for links
  const navLinkClass = (path: string) => {
    return `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg relative">
      {isNavigating && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 dark:bg-blue-900 overflow-hidden">
          <div className="h-full bg-blue-600 dark:bg-blue-400 animate-progress"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl text-gray-900 dark:text-white">
              Mamuk
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <button 
                onClick={() => handleNavigation('/')}
                className={navLinkClass('/')}
              >
                <FiHome className="mr-2" /> Inicio
              </button>
              
              {isAdmin && (
                <button 
                  onClick={() => handleNavigation('/admin')}
                  className={navLinkClass('/admin')}
                >
                  <FiUsers className="mr-2" /> Admin
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
                  <FiAward className="mr-2" /> Coach
                  {isNavigating && pathname?.startsWith('/coach') && (
                    <LoadingSpinner size="sm" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button
            onClick={() => handleNavigation('/')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FiHome className="inline mr-2" /> Inicio
          </button>
          
          {isAdmin && (
            <button
              onClick={() => handleNavigation('/admin')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FiUsers className="inline mr-2" /> Admin
              {isNavigating && pathname?.startsWith('/admin') && (
                <LoadingSpinner size="sm" />
              )}
            </button>
          )}
          
          {isCoach && (
            <button
              onClick={() => handleNavigation('/coach')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                isActive('/coach') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FiAward className="inline mr-2" /> Coach
              {isNavigating && pathname?.startsWith('/coach') && (
                <LoadingSpinner size="sm" />
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 