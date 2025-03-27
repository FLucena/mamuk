import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  // Log navigation to 404 page for analytics or debugging purposes
  useEffect(() => {
    console.log('User navigated to 404 page');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* 404 SVG animation */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-extrabold text-gray-200 dark:text-gray-800 animate-pulse">
                404
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">
                404
              </span>
            </div>
          </div>
        </div>
        
        <h2 className="mt-6 text-3xl font-bold tracking-tight">
          Page not found
        </h2>
        
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Go back"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Go Back
          </button>
          
          <Link 
            to="/"
            className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Go to home page"
            tabIndex={0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 