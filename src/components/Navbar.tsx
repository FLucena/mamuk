'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiUsers, FiLogOut, FiMenu, FiX, FiAward, FiSun, FiMoon } from 'react-icons/fi';
import { useState, Suspense, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import LoadingNavbar from './ui/LoadingNavbar';
import Image from 'next/image';
import { NIVELES_USUARIO } from './user/UserLevel';
import { INSIGNIAS } from './user/UserBadges';
import SignOutButton from '@/components/auth/SignOutButton';
import { Session } from 'next-auth';
import { Role } from '@/lib/types/user';

// Define a type for the user object
type UserType = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  coachId?: string;
  emailVerified?: Date | null;
} | null;

function NavbarContent() {
  const { isAdmin, isCoach } = useAuth();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userNivel, setUserNivel] = useState(0); // Por defecto "Monito"
  const [userPuntos, setUserPuntos] = useState(25); // Puntos de ejemplo
  const [insigniasObtenidas, setInsigniasObtenidas] = useState(['constancia', 'progreso']); // Ejemplo
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserType>(null);
  
  // Asegurarse de que el componente está montado para evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Añadir event listener para cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Verificar si el elemento clickeado o alguno de sus padres tiene la clase 'signout-button'
      let target = event.target as HTMLElement;
      while (target) {
        if (target.classList && target.classList.contains('signout-button')) {
          // Si es el botón de cerrar sesión o un elemento dentro de él, no cerrar el menú
          return;
        }
        target = target.parentElement as HTMLElement;
        if (!target) break;
      }
      
      // Si no es el botón de cerrar sesión, proceder normalmente
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Cargar datos del usuario cuando la sesión cambia
  useEffect(() => {
    // Solo cargar datos si hay una sesión activa
    if (session?.user) {
      // Aquí se cargarían los datos reales del usuario desde la API
      // Por ahora usamos datos de ejemplo
      setUserNivel(0); // Monito
      setUserPuntos(25);
      setInsigniasObtenidas(['constancia', 'progreso']);
      setUser(session.user as UserType);
    }
  }, [session]);
  
  // Cambiar entre modo claro y oscuro
  const toggleDarkMode = () => {
    try {
      if (!mounted) return;
      
      // Get the current theme
      const currentTheme = theme === 'system' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : theme;
      
      // Toggle to the opposite theme
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      console.log(`Switching theme from ${currentTheme} to ${newTheme}`);
      
      // Set the theme directly
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      // Set the theme in next-themes
      setTheme(newTheme);
      
      // Store the preference in localStorage
      localStorage.setItem('theme-preference', newTheme);
      
      // Close the menu
      setProfileMenuOpen(false);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Debug function to check theme state
  const debugTheme = () => {
    console.log({
      currentTheme: theme,
      isDarkMode,
      systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      localStorageTheme: localStorage.getItem('theme-preference'),
      documentClassList: document.documentElement.classList.contains('dark') ? 'has dark' : 'no dark'
    });
  };

  // Add this to the useEffect that runs on mount
  useEffect(() => {
    setMounted(true);
    // Debug theme on mount
    setTimeout(() => {
      console.log('Initial theme state:', {
        theme,
        isDarkClass: document.documentElement.classList.contains('dark'),
        storedTheme: localStorage.getItem('theme-preference')
      });
    }, 500);
  }, []);

  const navLinks = [
    {
      href: '/',
      label: 'Inicio',
      icon: FiHome,
      show: pathname !== '/' && pathname !== '/auth/signin'
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: FiUser,
      show: isAdmin && session
    },
    {
      href: '/coach',
      label: 'Coach',
      icon: FiUsers,
      show: (isCoach || isAdmin) && session
    },
    {
      href: '/auth/signin',
      label: 'Iniciar sesión',
      icon: FiUser,
      show: !session
    }
  ].filter(link => link.show);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const nivelActual = NIVELES_USUARIO[userNivel];
  const puntosParaSiguienteNivel = 100; // Simplificado para el ejemplo

  // Si no está montado, no renderizar para evitar problemas de hidratación
  if (!mounted) return null;

  // Determinar si está en modo oscuro
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Determinar si hay una sesión activa
  const isAuthenticated = !!session?.user;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Mamuk
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </Link>
              ))}
              
              {/* Direct theme toggle button for testing */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={(e) => {
                    console.log("Direct theme toggle clicked");
                    e.stopPropagation();
                    toggleDarkMode();
                  }}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>
              )}
              
              {/* Foto de perfil y menú desplegable */}
              <div className="relative ml-3" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 focus:outline-none"
                >
                  <div className="relative">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Usuario'}
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-blue-500"
                      />
                    ) : isAuthenticated ? (
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white">
                        <FiUser className="w-5 h-5" />
                      </div>
                    )}
                    {isAuthenticated && (
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${nivelActual.color} border-2 border-white dark:border-gray-800`}></span>
                    )}
                  </div>
                </button>
                
                {/* Menú desplegable de perfil */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-2 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isAuthenticated ? 'Conectado como' : 'No has iniciado sesión'}
                      </p>
                      {isAuthenticated && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session?.user?.email}
                        </p>
                      )}
                    </div>
                    
                    {/* Solo mostrar información de nivel y badges si hay sesión */}
                    {session?.user && (
                      <>
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center mb-2">
                            <FiAward className={`w-5 h-5 mr-2 ${nivelActual.color}`} />
                            <span className="font-semibold text-gray-900 dark:text-white">Nivel: <span className={nivelActual.color}>{nivelActual.nombre}</span></span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                            <div 
                              className={`h-2.5 rounded-full ${nivelActual.color.replace('text-', 'bg-')}`} 
                              style={{ width: `${(userPuntos / puntosParaSiguienteNivel) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {userNivel < NIVELES_USUARIO.length - 1 
                              ? `${userPuntos}/${puntosParaSiguienteNivel} puntos para ${NIVELES_USUARIO[userNivel + 1].nombre}` 
                              : 'Nivel máximo alcanzado'}
                          </p>
                        </div>
                        
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-semibold mb-2">Insignias y Reconocimientos</p>
                          <div className="grid grid-cols-2 gap-2">
                            {INSIGNIAS.filter(insignia => insigniasObtenidas.includes(insignia.id)).map(insignia => (
                              <div key={insignia.id} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <div className="text-xl">{insignia.icono}</div>
                                <div>
                                  <p className="font-medium text-sm">{insignia.nombre}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{insignia.descripcion}</p>
                                </div>
                              </div>
                            ))}
                            {insigniasObtenidas.length === 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">Aún no has obtenido insignias</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="px-4 py-2">
                      {isAuthenticated ? (
                        <div className="signout-button">
                          <SignOutButton useLink={false} />
                        </div>
                      ) : (
                        <Link href="/auth/signin" className="flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                          <FiUser className="w-5 h-5 mr-2" />
                          Iniciar sesión
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {/* Foto de perfil - móvil */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center focus:outline-none"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Usuario'}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-blue-500"
                  />
                ) : isAuthenticated ? (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white">
                    <FiUser className="w-4 h-4" />
                  </div>
                )}
                {isAuthenticated && (
                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${nivelActual.color} border-2 border-white dark:border-gray-800`}></span>
                )}
              </button>
              
              {/* Menú desplegable móvil */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-2 border border-gray-200 dark:border-gray-700">
                  {/* Contenido del menú móvil - similar al de escritorio */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isAuthenticated ? 'Conectado como' : 'No has iniciado sesión'}
                    </p>
                    {isAuthenticated && (
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session?.user?.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Toggle de modo oscuro - dentro del menú móvil */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        console.log("Mobile theme toggle clicked");
                        e.stopPropagation(); // Prevent event bubbling
                        toggleDarkMode();
                      }}
                      className="flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      {isDarkMode ? (
                        <>
                          <FiSun className="w-5 h-5 mr-2" />
                          Cambiar a modo claro
                        </>
                      ) : (
                        <>
                          <FiMoon className="w-5 h-5 mr-2" />
                          Cambiar a modo oscuro
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="px-4 py-2">
                    {isAuthenticated ? (
                      <div className="signout-button">
                        <SignOutButton useLink={false} />
                      </div>
                    ) : (
                      <Link href="/auth/signin" className="flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <FiUser className="w-5 h-5 mr-2" />
                        Iniciar sesión
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 ml-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<LoadingNavbar />}>
      <NavbarContent />
    </Suspense>
  );
} 