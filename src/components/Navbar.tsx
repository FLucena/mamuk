'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, Menu, X, Award, Sun, Moon, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, Suspense, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useTheme } from 'next-themes';
import LoadingNavbar from './ui/LoadingNavbar';
import SignOutButton from '@/components/auth/SignOutButton';
import { Role } from '@/lib/types/user';
import RenderTracker from './RenderTracker';
import RobustImage from './ui/RobustImage';

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
      // Define navigation links based on authentication state only
      navLinks: [
        {
          href: '/workout',
          label: 'Entrenamientos',
          icon: Trophy,
          show: !!session?.user
        },
        {
          href: '/coach',
          label: 'Entrenador',
          icon: Users,
          show: !!session?.user && session.user.roles.includes('coach')
        },
        {
          href: '/admin',
          label: 'Administrador',
          icon: User,
          show: !!session?.user && session.user.roles.includes('admin')
        }
      ].filter(link => link.show)
    };
  }, [session]);

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
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start sm:items-stretch">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <RobustImage
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="block h-8 w-auto"
                  priority
                  fallbackSrc="/icon.png"
                />
                <span className="ml-2 text-xl font-bold dark:text-white">Mamuk</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4 items-center">
              {sessionData.navLinks.map((link: NavLink) => (
                <NavLinkComponent
                  key={link.href}
                  {...link}
                  isActive={pathname === link.href}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Theme toggle button (desktop) */}
            <button
              onClick={handleThemeChange}
              className="hidden md:block p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Profile dropdown */}
            <div className="hidden md:block ml-3 relative">
              {sessionData.isAuthenticated && (
                <div ref={menuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu-button"
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {sessionData.user?.image ? (
                      <RobustImage
                        src={sessionData.user.image}
                        alt={sessionData.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        priority
                        fallbackSrc="/user-placeholder.png"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {sessionData.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>
                  
                  {profileMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex={-1}
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{sessionData.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{sessionData.user?.email}</p>
                      </div>
                      
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
                    <RobustImage
                      src={sessionData.user.image}
                      alt={sessionData.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                      priority
                      fallbackSrc="/user-placeholder.png"
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
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Perfil
                  </div>
                </Link>
                <Link
                  href="/achievements"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Logros
                  </div>
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