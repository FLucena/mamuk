'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { User, Mail, Camera } from 'lucide-react';
import { useTheme } from 'next-themes';
import RobustImage from '@/components/ui/RobustImage';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor, inicia sesión para ver tu perfil.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Header/Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Section */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            {/* Profile Image */}
            <div className="relative -mt-16 flex justify-center">
              <div className="relative">
                {session.user.image ? (
                  <RobustImage
                    src={session.user.image}
                    alt={session.user.name || 'Profile picture'}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-white dark:border-gray-800 w-32 h-32 object-cover"
                    fallbackSrc="/user-placeholder.png"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.user.name}
              </h1>
              <div className="mt-2 flex items-center justify-center text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span>{session.user.email}</span>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {session.user.roles?.map((role) => (
                  <span
                    key={role}
                    className={`px-3 py-1 rounded-full text-sm ${
                      role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : role === 'coach'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Settings Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Configuración
              </h2>
              
              {/* Theme Selector */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Tema
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Elige entre tema claro y oscuro
                    </p>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 