import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import IconWrapper from '../IconWrapper';
import { NavigationItem } from '../../utils/navigation';
import NavLink from './NavLink';

// Import User type or define it here to match navigation.ts
interface User {
  role?: string;
  // Add other properties as needed
}

interface DesktopNavbarProps {
  navigation: NavigationItem[];
  user?: User | null | undefined;
  logout: () => void;
  theme: string;
  toggleTheme: () => void;
}

export const DesktopNavbar = ({ 
  navigation, 
  logout, 
  theme, 
  toggleTheme 
}: DesktopNavbarProps) => {
  return (
    <div className="hidden md:block w-full bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mamuk Fitness</h1>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navigation.map((item) => (
                <NavLink key={item.nameKey} item={item} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <ProfileDropdown logout={logout} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeToggle = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  >
    <IconWrapper 
      icon={theme === 'dark' ? SunIcon : MoonIcon}
      size="sm"
      className="text-gray-500 dark:text-gray-400"
    />
  </button>
);

const ProfileDropdown = ({ logout }: { logout: () => void }) => (
  <Menu as="div" className="relative">
    <div>
      <MenuButton className="flex items-center max-w-xs rounded-full bg-white dark:bg-gray-800 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800">
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <IconWrapper 
            icon={UserIcon}
            size="xs"
            className="text-indigo-600 dark:text-indigo-300"
          />
        </div>
      </MenuButton>
    </div>
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
              className={clsx(
                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
              )}
            >
              <IconWrapper 
                icon={UserIcon}
                size="xs"
                className="mr-3 text-gray-500 dark:text-gray-400"
              />
              Your Profile
            </Link>
          )}
        </MenuItem>
        <MenuItem>
          {({ active }) => (
            <Link
              to="/settings"
              className={clsx(
                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
              )}
            >
              <IconWrapper 
                icon={Cog6ToothIcon}
                size="xs"
                className="mr-3 text-gray-500 dark:text-gray-400"
              />
              Settings
            </Link>
          )}
        </MenuItem>
        <MenuItem>
          {({ active }) => (
            <button
              onClick={logout}
              className={clsx(
                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left'
              )}
            >
              <IconWrapper 
                icon={ArrowRightStartOnRectangleIcon}
                size="xs"
                className="mr-3 text-gray-500 dark:text-gray-400"
              />
              Sign out
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Transition>
  </Menu>
); 