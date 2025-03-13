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

// Custom equality function for NavbarContent
// Since NavbarContent has no props, it should never re-render due to prop changes
function navbarContentPropsAreEqual() {
  return true;
}

// Track why a component re-rendered
function useWhyDidYouRender(componentName: string, props: Record<string, any>) {
  const prevPropsRef = useRef<Record<string, any> | null>(null);
  
  // Use a proper dependency array to prevent infinite loops
  useEffect(() => {
    if (prevPropsRef.current) {
      // Find what props changed
      const allKeys = Object.keys({ ...prevPropsRef.current, ...props });
      const changedProps: Record<string, { from: any, to: any }> = {};
      
      allKeys.forEach(key => {
        if (prevPropsRef.current?.[key] !== props[key]) {
          changedProps[key] = {
            from: prevPropsRef.current?.[key],
            to: props[key]
          };
        }
      });
      
    }
    
    prevPropsRef.current = { ...props };
  }, [componentName, ...Object.values(props)]); // Add proper dependencies
}

// Use memo to prevent unnecessary re-renders
const NavbarContent = memo(function NavbarContent() {
  
  // Create a ref to store previous values for comparison
  const prevValuesRef = useRef({
    isAdmin: false,
    isCoach: false,
    sessionEmail: '',
    pathname: '',
    theme: ''
  });
  
  const { isAdmin, isCoach } = useAuth();
  const { data: session } = useSession();
  const pathname = usePathname();
  const transitionRouter = useViewTransitionRouter();
  const { theme, setTheme } = useTheme();
  
  // Track why this component re-rendered
  const sessionEmail = session?.user?.email || '';
  useWhyDidYouRender('NavbarContent', {
    isAdmin,
    isCoach,
    sessionEmail,
    pathname,
    theme
  });
  
  // Debug logging to track state changes with detailed comparison
  useEffect(() => {
    if (prevValuesRef.current.isAdmin !== isAdmin || prevValuesRef.current.isCoach !== isCoach) {
      prevValuesRef.current.isAdmin = isAdmin;
      prevValuesRef.current.isCoach = isCoach;
    }
  }, [isAdmin, isCoach]);
  
  useEffect(() => {
    if (prevValuesRef.current.sessionEmail !== sessionEmail) {
      prevValuesRef.current.sessionEmail = sessionEmail;
    }
  }, [session]);
  
  useEffect(() => {
    if (prevValuesRef.current.pathname !== pathname) {
      prevValuesRef.current.pathname = pathname;
    }
  }, [pathname]);
  
  useEffect(() => {
    if (prevValuesRef.current.theme !== theme) {
      prevValuesRef.current.theme = theme || '';
    }
  }, [theme]);
  
  // State for mobile menu
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // State for user level and badges
  const [userNivel, setUserNivel] = useState(0);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  
  // Refs for click outside detection
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserType>(null);
  
  // Get the current theme
  const currentTheme = useTheme();
  
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
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  // Set user from session
  useEffect(() => {
    if (session?.user) {
      // Convert session.user to UserType
      const userWithRoles = {
        ...session.user,
        // Ensure roles is present
        roles: session.user.roles || []
      };
      setUser(userWithRoles as unknown as UserType);
    } else {
      // Clear user state when session is null
      setUser(null);
      setProfileMenuOpen(false);
    }
  }, [session]);
  
  // Toggle theme
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen(prev => !prev);
  }, []);
  
  const handleChange = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);
  
  // Determinar si hay una sesión activa
  const isAuthenticated = !!session?.user;
  
  // Navigation links - memoize to prevent recreation on each render
  const navLinks = useMemo(() => [
    {
      href: '/workout',
      label: 'Rutinas',
      icon: Award,
      show: isAuthenticated,
    },
    {
      href: '/achievements',
      label: 'Logros',
      icon: Trophy,
      show: isAuthenticated,
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
  ], [isCoach, isAdmin, isAuthenticated]);
  
  // Memoize the filtered links to prevent recreation on each render
  const visibleNavLinks = useMemo(() => 
    navLinks.filter(link => link.show)
  , [navLinks]);
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href={isAuthenticated ? "/workout" : "/"}
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
              {visibleNavLinks.map((link) => (
                <NavLinkComponent
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  show={link.show}
                  isActive={pathname === link.href}
                />
              ))}
              
              {/* Theme toggle button (desktop) */}
              <button
                onClick={handleChange}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* User profile menu (desktop) */}
              {isAuthenticated && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        priority
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="ml-2">{user?.name}</span>
                  </button>
                  
                  {/* Profile dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                        
                        {/* User role tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user?.roles?.includes('admin') && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              <span className="mr-1">★</span> Admin
                            </span>
                          )}
                          {(user?.roles?.includes('admin') || user?.roles?.includes('coach')) && (
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
              
              {/* Sign in button (desktop) */}
              {!isAuthenticated && (
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
            {/* Theme toggle button (mobile) */}
            <button
              onClick={handleChange}
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
          
          {/* Add RenderTracker */}
          <div className="absolute top-0 right-0 m-1">
            <RenderTracker componentName="NavbarContent" showCount={process.env.NODE_ENV === 'development'} />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {visibleNavLinks.map((link) => (
              <MobileNavLinkComponent
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                show={link.show}
                isActive={pathname === link.href}
                onClose={() => setIsOpen(false)}
              />
            ))}
          </div>
          
          {/* User profile (mobile) */}
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                      priority
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
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
          {!isAuthenticated && (
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
}, navbarContentPropsAreEqual);

// Memoize the Navbar component to prevent unnecessary re-renders
export default memo(function Navbar() {
  
  return (
    <Suspense fallback={<LoadingNavbar />}>
      <NavbarContent />
    </Suspense>
  );
}); 