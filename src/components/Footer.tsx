'use client';

import Link from 'next/link';
import { Instagram, Twitter } from 'lucide-react';
import { useState, memo } from 'react';
import CookiePreferencesModal from './CookiePreferencesModal';
import ResponsiveContainer from './ui/ResponsiveContainer';

// Memoize the Footer component to prevent unnecessary re-renders
export default memo(function Footer() {
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);

  const links = {
    product: [
      { name: 'Características', href: '/features' },
      { name: 'Precios', href: '/pricing' },
      { name: 'Guías', href: '/guides' },
    ],
    company: [
      { name: 'Sobre nosotros', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contacto', href: '/contact' },
    ],
    legal: [
      { name: 'Términos de servicio', href: '/terms' },
      { name: 'Política de privacidad', href: '/privacy' },
      { name: 'Preferencias de cookies', href: '#', onClick: () => setShowCookiePreferences(true) },
    ],
    social: [
      { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
      { name: 'Instagram', href: 'https://www.instagram.com/mamuk_fa/', icon: Instagram },
    ],
  };

  return (
    <>
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 md:py-12">
        <ResponsiveContainer>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mamuk</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Transformando vidas a través del fitness personalizado y la tecnología.
              </p>
            </div>

            {/* Product links */}
            <div className="sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Producto
              </h3>
              <ul className="mt-4 space-y-4">
                {links.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div className="sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Compañía
              </h3>
              <ul className="mt-4 space-y-4">
                {links.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div className="sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                {links.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={link.onClick}
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                {links.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
              <p className="text-base text-gray-400 text-center md:text-right">
                &copy; {new Date().getFullYear()} Mamuk. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </ResponsiveContainer>
      </footer>

      {/* Cookie Preferences Modal */}
      <CookiePreferencesModal 
        isOpen={showCookiePreferences}
        onClose={() => setShowCookiePreferences(false)}
      />
    </>
  );
}); 