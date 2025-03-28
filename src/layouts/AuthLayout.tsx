import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import Footer from '../components/layout/Footer';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Only redirect to dashboard if user is authenticated and trying to access auth pages
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Mamuk Fitness
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your personal workout management platform
            </p>
          </div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout; 