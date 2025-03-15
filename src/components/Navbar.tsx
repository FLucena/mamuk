'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Users, LogOut, Menu, X, Award, Sun, Moon, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, Suspense, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useTheme } from 'next-themes';
import LoadingNavbar from './ui/LoadingNavbar';
import Image from 'next/image';
import { NIVELES_USUARIO } from './user/UserLevel';
import { INSIGNIAS } from './user/UserBadges';
import SignOutButton from '@/components/auth/SignOutButton';
import { Session } from 'next-auth';
import { Role } from '@/lib/types/user';
import { useViewTransitionRouter } from '@/hooks/useViewTransitionRouter';
import RenderTracker from './RenderTracker';

// Define a type for the user object
type UserType = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles: Role[];
  coachId?: string;
  emailVerified?: Date | null;
} | null;

// Define a type for the navigation links
interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

// Create the NavLink components outside of the main component to avoid hook issues
const NavLinkComponent = memo(({ href, label, icon: Icon, show, isActive }: NavLink & { isActive: boolean }) => {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </Link>
  );
});

// Create the MobileNavLink component outside of the main component
const MobileNavLinkComponent = memo(({ href, label, icon: Icon, show, isActive, onClose }: NavLink & { isActive: boolean, onClose: () => void }) => {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </Link>
  );
});

// Remove the comparison function since NavbarContent has no props
const NavbarContent = memo(function NavbarContent() {
  const { isAdmin, isCoach } = useAuth();
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  // State for mobile menu and profile menu
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Memoize all session-related data together to prevent unnecessary recalculations
  const sessionData = useMemo(() => {
    const user = session?.user ? {
      ...session.user,
      roles: session.user.roles || []
    } as UserType : null;

    return {
      user,
      isAuthenticated: !!session?.user,
      isAdmin,
      isCoach,
      navLinks: [
        {
          href: '/workout',
          label: 'Rutinas',
          icon: Award,
          show: !!session?.user,
        },
        {
          href: '/achievements',
          label: 'Logros',
          icon: Trophy,
          show: !!session?.user,
        },
        {
          href: '/coach',
          label: 'Coach',
          icon: User,
          show: isCoach || isAdmin,
        },
        {
          href: '/admin',
          label: 'Admin',
          icon: Users,
          show: isAdmin,
        },
      ].filter(link => link.show) as NavLink[]
    };
  }, [session?.user, isAdmin, isCoach]);

  // Simple callbacks that don't need memoization
  const toggleMenu = () => setIsOpen(prev => !prev);
  const toggleProfileMenu = () => setProfileMenuOpen(prev => !prev);
  const handleThemeChange = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href={sessionData.isAuthenticated ? "/workout" : "/"}
              className="flex-shrink-0"
            >
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Mamuk
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="ml-10 flex items-center space-x-4">
              {sessionData.navLinks.map((link: NavLink) => (
                <NavLinkComponent
                  key={link.href}
                  {...link}
                  isActive={pathname === link.href}
                />
              ))}
              
              {/* Theme toggle button (desktop) */}
              <button
                onClick={handleThemeChange}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* User profile menu (desktop) */}
              {sessionData.isAuthenticated && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  >
                    {sessionData.user?.image ? (
                      <Image
                        src={sessionData.user.image}
                        alt={sessionData.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        priority
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {sessionData.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="ml-2">{sessionData.user?.name}</span>
                  </button>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{sessionData.user?.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{sessionData.user?.email}</div>
                        
                        {/* User role tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sessionData.user?.roles?.includes('admin') && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              <span className="mr-1">★</span> Admin
                            </span>
                          )}
                          {(sessionData.user?.roles?.includes('admin') || sessionData.user?.roles?.includes('coach')) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Coach
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Cliente
                          </span>
                        </div>
                      </div>
                      
                      {/* User level and badges */}
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-2">
                          <Award className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nivel: Gorila</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insignias: 3/10</span>
                        </div>
                      </div>
                      
                      {/* Navigation links */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Perfil
                        </Link>
                        <Link
                          href="/achievements"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Logros
                        </Link>
                      </div>
                      
                      <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                        <SignOutButton
                          variant="text"
                          className="flex items-center w-full text-left px-4 py-2 text-sm"
                          label="Cerrar sesión"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!sessionData.isAuthenticated && (
                <Link
                  href="/api/auth/signin"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={handleThemeChange}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-0 right-0 m-1">
              <RenderTracker componentName="NavbarContent" showCount={true} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {sessionData.navLinks.map((link: NavLink) => (
              <MobileNavLinkComponent
                key={link.href}
                {...link}
                isActive={pathname === link.href}
                onClose={() => setIsOpen(false)}
              />
            ))}
          </div>
          
          {/* User profile (mobile) */}
          {sessionData.isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {sessionData.user?.image ? (
                    <Image
                      src={sessionData.user.image}
                      alt={sessionData.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                      priority
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {sessionData.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">{sessionData.user?.name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{sessionData.user?.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Perfil
                </Link>
                <Link
                  href="/achievements"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logros
                </Link>
                <SignOutButton
                  variant="text"
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  label="Cerrar sesión"
                />
              </div>
            </div>
          )}
          
          {/* Sign in button (mobile) */}
          {!sessionData.isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 space-y-1">
                <Link
                  href="/api/auth/signin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
});

// Memoize the Navbar component to prevent unnecessary re-renders
export default memo(function Navbar() {
  
  return (
    <Suspense fallback={<LoadingNavbar />}>
      <NavbarContent />
    </Suspense>
  );
}); 