import { useState } from 'react';
import { useAuth } from '../../store/authStore';
import { 
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // Get the current theme from localStorage or system preference
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Toggle dark mode
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update the DOM and localStorage
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Validation
      if (formData.password && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Reset password fields
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Settings</h1>
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-md p-2">
                <IconWrapper 
                  icon={UserIcon} 
                  size="sm" 
                  className="text-indigo-600 dark:text-indigo-300" 
                />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Account Settings</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {successMessage && (
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-md">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                  placeholder="Confirm your new password"
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <IconWrapper icon={ArrowPathIcon} size="xs" className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-md p-2">
                <IconWrapper 
                  icon={darkMode ? MoonIcon : SunIcon} 
                  size="sm" 
                  className="text-purple-600 dark:text-purple-300" 
                />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Preferences</h3>
            </div>
            
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable dark mode to reduce eye strain in low-light environments
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                  className={clsx(
                    darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  )}
                >
                  <span className="sr-only">Use dark mode</span>
                  <span
                    className={clsx(
                      darkMode ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  >
                    <span
                      className={clsx(
                        darkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <IconWrapper icon={SunIcon} size="xs" className="text-gray-400" />
                    </span>
                    <span
                      className={clsx(
                        darkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <IconWrapper icon={MoonIcon} size="xs" className="text-indigo-600" />
                    </span>
                  </span>
                </Switch>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-md p-2">
                <IconWrapper 
                  icon={BellIcon} 
                  size="sm" 
                  className="text-blue-600 dark:text-blue-300" 
                />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
            </div>
            
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications for workout reminders and achievements
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                  className={clsx(
                    pushNotifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  )}
                >
                  <span className="sr-only">Enable push notifications</span>
                  <span
                    className={clsx(
                      pushNotifications ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email updates about your account and workouts
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  className={clsx(
                    emailNotifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  )}
                >
                  <span className="sr-only">Enable email notifications</span>
                  <span
                    className={clsx(
                      emailNotifications ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-md p-2">
                <IconWrapper 
                  icon={ShieldCheckIcon} 
                  size="sm" 
                  className="text-green-600 dark:text-green-300" 
                />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Security</h3>
            </div>
            
            <div className="mt-6 space-y-6">
              <div className="border rounded-md p-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <IconWrapper icon={ShieldCheckIcon} size="xs" className="mr-2 text-indigo-600" />
                  Enable 2FA
                </button>
              </div>
              
              <div className="border rounded-md p-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Active Sessions</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You are currently logged in on 1 device. Manage your active sessions.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Manage Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 