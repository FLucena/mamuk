import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { getNavigationItems } from '../utils/navigation';
import { useAuth } from '../store/authStore';
import { useTheme } from '../store/themeStore';
import Footer from '../components/layout/Footer';
import BackToTop from '../components/layout/BackToTop';

interface User {
  profilePicture?: string;
  name: string;
}

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  
  // Prevent layout shift during hydration
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  if (!mounted) {
    return null;
  }

  const navigationItems = getNavigationItems(user);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar
          navigation={navigationItems}
          logout={logout}
          user={user as User | undefined}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
      <BackToTop />
    </div>
  );
};

export default DashboardLayout; 