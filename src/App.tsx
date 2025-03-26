import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AuthLayout from './layouts/AuthLayout';
import HorizontalDashboardLayout from './layouts/HorizontalDashboardLayout';
import Toast from './components/layout/Toast';
import CookieConsent from './components/layout/CookieConsent';
import { ThemeProvider } from './context/ThemeProvider';
import { LanguageProvider } from './context/LanguageProvider';

// Lazy-loaded components
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
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

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mamuk-theme">
      <LanguageProvider defaultLanguage="en" storageKey="mamuk-language">
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Router>
            <Toast />
            <CookieConsent />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Dashboard Routes - Using Horizontal Layout */}
                <Route element={<HorizontalDashboardLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/workouts/create" element={<CreateWorkout />} />
                  <Route path="/workouts/edit/:id" element={<EditWorkout />} />
                  <Route path="/workouts/:id" element={<WorkoutDetail />} />
                  <Route path="/exercises" element={<ExerciseLibrary />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                </Route>

                {/* Keeping the original layout commented for reference */}
                {/* <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/workouts/create" element={<CreateWorkout />} />
                  <Route path="/workouts/edit/:id" element={<EditWorkout />} />
                  <Route path="/workouts/:id" element={<WorkoutDetail />} />
                  <Route path="/exercises" element={<ExerciseLibrary />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                </Route> */}
              </Routes>
            </Suspense>
          </Router>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
