import { Link } from 'react-router-dom';
import { Heart, FileText, Shield, Info, Facebook, Instagram, Twitter, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Mamuk Fitness
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Your personal workout companion to create, track, and accomplish your fitness goals. Build custom workout routines and take control of your fitness journey.
              </p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                Made with <Heart className="h-4 w-4 text-red-500 mx-1" aria-hidden="true" /> in 2025-{currentYear}
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/workouts" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Workouts
                  </Link>
                </li>
                <li>
                  <Link to="/exercises" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Exercise Library
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/terms" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center">
                    <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center">
                    <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center">
                    <Info className="h-4 w-4 mr-2" aria-hidden="true" />
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright and social media */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {currentYear} Mamuk Fitness. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                {/* Social media icons */}
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Facebook">
                  <Facebook className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Instagram">
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Twitter">
                  <Twitter className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="GitHub">
                  <Github className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 