import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Globe } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/useLanguage';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <Globe className="h-4 w-4" />
          <span>{t('language')}</span>
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 bottom-full mb-1 z-10 w-40 origin-bottom-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={cn(
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      language === 'en' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : '',
                      'flex w-full items-center px-4 py-2.5 text-sm'
                    )}
                    onClick={() => setLanguage('en')}
                  >
                    <span className="mr-2 text-lg">🇺🇸</span>
                    {t('english')}
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={cn(
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      language === 'es' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : '',
                      'flex w-full items-center px-4 py-2.5 text-sm'
                    )}
                    onClick={() => setLanguage('es')}
                  >
                    <span className="mr-2 text-lg">🇪🇸</span>
                    {t('spanish')}
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher; 