'use client';

import Link from 'next/link';
import { FiInstagram, FiTwitter } from 'react-icons/fi';
import { useState } from 'react';
import CookiePreferencesModal from './CookiePreferencesModal';
import Icon, { IconName } from '@/components/ui/Icon';

export default function Footer() {
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
      { name: 'Twitter', href: 'https://twitter.com', iconName: 'FiTwitter' as IconName },
      { name: 'Instagram', href: 'https://www.instagram.com/mamuk_fa/', iconName: 'FiInstagram' as IconName },
    ],
  };

  return (
    <>
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Mamuk
              </Link>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Plataforma de entrenamiento personalizado que te ayuda a alcanzar tus objetivos fitness.
              </p>
            </div>

            {/* Product links */}
            <div>
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
            <div>
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
            <div>
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
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                {links.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon icon={item.iconName} className="h-6 w-6" />
                  </a>
                ))}
              </div>
              <p className="text-base text-gray-400">
                &copy; {new Date().getFullYear()} Mamuk. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Preferences Modal */}
      {showCookiePreferences && (
        <CookiePreferencesModal onClose={() => setShowCookiePreferences(false)} />
      )}
    </>
  );
} 