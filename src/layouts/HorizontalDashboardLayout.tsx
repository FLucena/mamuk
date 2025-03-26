import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HorizontalNavbar from '../components/layout/HorizontalNavbar';
import { getNavigationItems } from '../utils/navigation';
import { useAuth } from '../store/authStore';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HorizontalDashboardLayout = () => {
  const { logout, user } = useAuth();
  
  // Prevent layout shift during hydration
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  const navigationItems = getNavigationItems(user);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <HorizontalNavbar
          navigation={navigationItems}
          logout={logout}
        />
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Mamuk Fitness. All rights reserved.</p>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HorizontalDashboardLayout; 