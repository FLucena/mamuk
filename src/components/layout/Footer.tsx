import { Link } from 'react-router-dom';
import { FileText, Shield, Info } from 'lucide-react';
import { siGithub, siFacebook, siInstagram, siX } from 'simple-icons';
import LanguageSwitcher from '../LanguageSwitcher';
import { useLanguage } from '../../context/useLanguage';

const SocialIcon = ({ icon, label }: { icon: { path: string, hex: string }, label: string }) => (
  <a 
    href="#" 
    className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" 
    aria-label={label}
  >
    <svg 
      role="img" 
      viewBox="0 0 24 24" 
      className="h-4 w-4 fill-current"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('app_title')}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {t('about_mission_content')}
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('quick_links')}
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    {t('nav_dashboard')}
                  </Link>
                </li>
                <li>
                  <Link to="/workouts" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    {t('nav_workouts')}
                  </Link>
                </li>
                <li>
                  <Link to="/exercises" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    {t('nav_exercises')}
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    {t('your_profile')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('legal')}
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/terms" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center">
                    <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t('terms_of_service')}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center">
                    <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center">
                    <Info className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t('about_title')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright and social media */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {currentYear} {t('app_title')}. {t('all_rights_reserved')}
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                {/* Social media icons */}
                <SocialIcon icon={siFacebook} label="Facebook" />
                <SocialIcon icon={siInstagram} label="Instagram" />
                <SocialIcon icon={siX} label="X" />
                <SocialIcon icon={siGithub} label="GitHub" />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 