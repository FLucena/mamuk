import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MenuIcon } from 'lucide-react';
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Define User interface
interface UserType {
  role?: string;
  image?: string;
  name?: string;
  email?: string;
  id?: string;
  profilePicture?: string;
  // Add other properties as needed
}

interface MobileMenuBarProps {
  setSidebarOpen: (open: boolean) => void;
  user: UserType | null;
  logout: () => void;
}

const MobileProfileDropdown = ({ user, logout }: { user: UserType | null; logout: () => void }) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="bg-white dark:bg-gray-800 p-1 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <span className="sr-only">Open user menu</span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.profilePicture} alt={user?.name || ''} />
          <AvatarFallback className="bg-indigo-600 text-white">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                Your Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/settings"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                Settings
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block w-full text-left px-4 py-2 text-sm text-red-500`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export const MobileMenuBar = ({ setSidebarOpen, user, logout }: MobileMenuBarProps) => {
  const handleToggleSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-indigo-700 md:hidden">
      <div className="px-4 py-2 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSidebar}
            className="text-white hover:bg-indigo-500 focus:outline-none"
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </Button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">M</span>
            </div>
            <span className="text-lg font-semibold text-white">Mamuk</span>
          </Link>
        </div>
        
        <MobileProfileDropdown user={user} logout={logout} />
      </div>
    </div>
  );
}; 