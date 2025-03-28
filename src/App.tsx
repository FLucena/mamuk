import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import React from 'react';
import Toast from './components/layout/Toast';
import CookieConsent from './components/layout/CookieConsent';
import { ThemeProvider } from './context/ThemeProvider';
import { LanguageProvider } from './context/LanguageProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useTokenRefresh from './hooks/useTokenRefresh';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// Page Loading Component
const PageLoading = () => (
  <div className="flex items-center justify-center p-8 h-full min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
  </div>
);

// Error Boundary Component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-[400px] flex items-center justify-center flex-col p-8 text-center">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-4">{error.message}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Try again
    </button>
  </div>
);

// Lazy-loaded layout components with their own Suspense boundaries
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Lazy-loaded page components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Signup'));
const GoogleAuthCallback = lazy(() => import('./components/auth/GoogleAuthCallback'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Workouts = lazy(() => import('./pages/workouts/Workouts'));
const WorkoutDetail = lazy(() => import('./pages/workouts/WorkoutDetail'));
const CreateWorkout = lazy(() => import('./pages/workouts/CreateWorkout'));
const EditWorkout = lazy(() => import('./pages/workouts/EditWorkout'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const Achievements = lazy(() => import('./pages/achievements/Achievements'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ExerciseLibrary = lazy(() => import('./pages/exercises/ExerciseLibrary'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));

// Error Boundary to catch and handle errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} />;
    }
    return this.props.children;
  }
}

function App() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  
  // Initialize token refresh
  useTokenRefresh();

  // Simulate app initialization process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isAppLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="mamuk-theme">
      <LanguageProvider defaultLanguage="en" storageKey="mamuk-language">
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Router>
            <Toast />
            <CookieConsent />
            <ErrorBoundary>
              <Routes>
                {/* Auth Routes */}
                <Route element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AuthLayout />
                  </Suspense>
                }>
                  <Route path="/login" element={
                    <Suspense fallback={<PageLoading />}>
                      <Login />
                    </Suspense>
                  } />
                  <Route path="/register" element={
                    <Suspense fallback={<PageLoading />}>
                      <Register />
                    </Suspense>
                  } />
                  <Route path="/auth-callback" element={
                    <Suspense fallback={<PageLoading />}>
                      <GoogleAuthCallback />
                    </Suspense>
                  } />
                </Route>

                {/* Dashboard Routes - Using Horizontal Layout */}
                <Route element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  </Suspense>
                }>
                  <Route path="/" element={
                    <Suspense fallback={<PageLoading />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/workouts" element={
                    <Suspense fallback={<PageLoading />}>
                      <Workouts />
                    </Suspense>
                  } />
                  <Route path="/workouts/create" element={
                    <Suspense fallback={<PageLoading />}>
                      <CreateWorkout />
                    </Suspense>
                  } />
                  <Route path="/workouts/edit/:id" element={
                    <Suspense fallback={<PageLoading />}>
                      <EditWorkout />
                    </Suspense>
                  } />
                  <Route path="/workouts/:id" element={
                    <Suspense fallback={<PageLoading />}>
                      <WorkoutDetail />
                    </Suspense>
                  } />
                  <Route path="/exercises" element={
                    <Suspense fallback={<PageLoading />}>
                      <ExerciseLibrary />
                    </Suspense>
                  } />
                  <Route path="/profile" element={
                    <Suspense fallback={<PageLoading />}>
                      <Profile />
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<PageLoading />}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="/achievements" element={
                    <Suspense fallback={<PageLoading />}>
                      <Achievements />
                    </Suspense>
                  } />
                  {/* Admin only route */}
                  <Route path="/admin/users" element={
                    <Suspense fallback={<PageLoading />}>
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UserManagement />
                      </ProtectedRoute>
                    </Suspense>
                  } />
                  {/* Legal and About pages */}
                  <Route path="/terms" element={
                    <Suspense fallback={<PageLoading />}>
                      <Terms />
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<PageLoading />}>
                      <Privacy />
                    </Suspense>
                  } />
                  <Route path="/about" element={
                    <Suspense fallback={<PageLoading />}>
                      <About />
                    </Suspense>
                  } />
                </Route>

                {/* 404 Route - Must be the last route */}
                <Route path="*" element={
                  <Suspense fallback={<PageLoading />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </ErrorBoundary>
          </Router>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
