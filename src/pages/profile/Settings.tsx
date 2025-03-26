import { useState } from 'react';
import { useTheme } from '../../store/themeStore';
import useToast from '../../hooks/useToast';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import IconWrapper from '../../components/IconWrapper';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving preferences
    setTimeout(() => {
      toast.success('Your preferences have been saved successfully!');
    }, 500);
  };

  const handleResetPreferences = () => {
    setEmailNotifications(true);
    setPushNotifications(false);
    toast.info('Preferences have been reset to default values.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Theme Toggle */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Theme</span>
          <button 
            onClick={toggleTheme}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <IconWrapper icon={SunIcon} size="sm" className="text-yellow-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <IconWrapper icon={MoonIcon} size="sm" className="text-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="email-notifications" className="text-gray-700 dark:text-gray-300 font-medium">
                Email Notifications
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive email updates about your account activity
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                id="email-notifications"
                name="email-notifications"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
              />
              <label
                htmlFor="email-notifications"
                className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                  emailNotifications ? '!bg-indigo-500' : ''
                }`}
              ></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="push-notifications" className="text-gray-700 dark:text-gray-300 font-medium">
                Push Notifications
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive push notifications for important updates
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                id="push-notifications"
                name="push-notifications"
                checked={pushNotifications}
                onChange={() => setPushNotifications(!pushNotifications)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
              />
              <label
                htmlFor="push-notifications"
                className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                  pushNotifications ? '!bg-indigo-500' : ''
                }`}
              ></label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleResetPreferences}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reset to Default
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings; 