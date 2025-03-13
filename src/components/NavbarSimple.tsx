'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Home as FiHome, Users as FiUsers, Award as FiAward, Menu as FiMenu, X as FiX } from 'lucide-react';

export default function NavbarSimple() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isAdmin, isCoach } = useAuth();
  const { isNavigating, navigateTo } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Inicio', path: '/', icon: 'FiHome', show: true },
    { name: 'Admin', path: '/admin', icon: 'FiUsers', show: isAdmin },
    { name: 'Coach', path: '/coach', icon: 'FiAward', show: isCoach },
  ];

  const handleNavigation = (path: string) => {
    navigateTo(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Map icon names to actual components for rendering
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FiHome': return FiHome;
      case 'FiUsers': return FiUsers;
      case 'FiAward': return FiAward;
      default: return FiHome;
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">MAMUK</span>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems
              .filter(item => item.show)
              .map(item => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`md:block ${
                    pathname === item.path
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {isNavigating && pathname === item.path ? (
                    <LoadingSpinner size="sm" className="mr-1" />
                  ) : (
                    <Icon icon={item.icon} className="w-4 h-4 mr-1" />
                  )}
                  {item.name}
                </button>
              ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              aria-expanded="false"
              aria-label="Open main menu"
            >
              {isMobileMenuOpen ? (
                <Icon icon="FiX" className="block h-6 w-6" />
              ) : (
                <Icon icon="FiMenu" className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? '' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems
            .filter(item => item.show)
            .map(item => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  pathname === item.path
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  {isNavigating && pathname === item.path ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Icon icon={item.icon} className="w-4 h-4 mr-2" />
                  )}
                  {item.name}
                </div>
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
} 