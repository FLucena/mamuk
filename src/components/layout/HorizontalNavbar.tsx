import { Fragment, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { User as UserIcon, Sun, Moon, Menu as MenuIcon, X, LogOut, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NavigationItem } from '../../utils/navigation';
import { useTheme } from '../../context/ThemeProvider';
import { useLanguage } from '../../context/useLanguage';

interface HorizontalNavbarProps {
  navigation: NavigationItem[];
  logout: () => void;
}

const HorizontalNavbar = ({
  navigation,
  logout,
}: HorizontalNavbarProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="navbar-logo">
              <span className="hidden sm:block text-xl font-bold text-gray-900 dark:text-white">
                {t('app_title')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="navbar-links flex flex-row gap-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  className={cn(
                    "navbar-link",
                    isActive ? "navbar-link-active" : "navbar-link-inactive"
                  )}
                  aria-label={t(item.nameKey)}
                  tabIndex={0}
                >
                  <div className={cn(
                    "mr-2 flex items-center justify-center h-5 w-5",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{t(item.nameKey)}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side items - Mobile Menu Button, Theme Toggle, Profile */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              aria-label={isDarkMode ? t('switch_light_mode') : t('switch_dark_mode')}
              tabIndex={0}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center rounded-full bg-white dark:bg-gray-800 p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800">
                <span className="sr-only">{t('open_user_menu')}</span>
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                </div>
              </MenuButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={cn(
                          active ? 'bg-gray-100 dark:bg-gray-700' : '',
                          'flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300'
                        )}
                      >
                        <UserIcon className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        {t('your_profile')}
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={cn(
                          active ? 'bg-gray-100 dark:bg-gray-700' : '',
                          'flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300'
                        )}
                      >
                        <Settings className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        {t('settings')}
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={cn(
                          active ? 'bg-gray-100 dark:bg-gray-700' : '',
                          'flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 w-full text-left'
                        )}
                      >
                        <LogOut className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        {t('sign_out')}
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="w-10 h-10 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={t('open_main_menu')}
                tabIndex={0}
              >
                <span className="sr-only">{t('open_main_menu')}</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-2 px-4 py-3 bg-white dark:bg-gray-800 shadow-lg">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md text-base font-medium w-full",
                    isActive
                      ? "navbar-link-active"
                      : "navbar-link-inactive"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={cn(
                    "mr-3 flex items-center justify-center h-6 w-6",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{t(item.nameKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default HorizontalNavbar; 