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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar
        navigation={navigationItems}
        logout={logout}
        user={user as User | undefined}
      />
      <main className="pt-16">
        <Outlet />
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
};

export default DashboardLayout; 