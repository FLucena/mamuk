import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { useTheme } from '../store/themeStore';
import { MobileMenuBar } from '../components/layout/MobileMenuBar';
import { MobileSidebar } from '../components/layout/MobileSidebar';
import Footer from '../components/layout/Footer';
import BackToTop from '../components/layout/BackToTop';
import { getNavigationItems } from '../utils/navigation';
import { cn } from '../lib/utils';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../context/useLanguage';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigation = getNavigationItems(user);

  return (
    <div className="h-screen grid grid-cols-[auto_1fr] bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="h-full grid grid-rows-[auto_1fr_auto]">
          {/* Logo and App Name */}
          <div className="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Mamuk
              </span>
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "mr-3 flex items-center justify-center h-6 w-6 rounded",
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
            </nav>
          </div>
          
          {/* Bottom section for theme and logout */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 px-2 space-y-2">
            <Button 
              variant="ghost" 
              onClick={toggleTheme} 
              className="w-full justify-start"
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={logout}
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
      
      <div className="md:hidden">
        {/* Mobile Navigation */}
        <MobileMenuBar 
          setSidebarOpen={setSidebarOpen} 
          user={user}
          logout={logout}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigation={navigation}
          theme={theme}
          toggleTheme={toggleTheme}
          logout={logout}
        />
      </div>

      {/* Main content */}
      <div className="h-full grid grid-rows-[1fr_auto]">
        <main className="overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </div>
  );
};

export default DashboardLayout;