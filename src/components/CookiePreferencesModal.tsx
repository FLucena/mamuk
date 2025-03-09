'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Icon from '@/components/ui/Icon';

interface CookiePreferencesModalProps {
  onClose: () => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookiePreferencesModal({ onClose }: CookiePreferencesModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cookie-consent');
      return saved ? JSON.parse(saved) : {
        necessary: true,
        analytics: false,
        marketing: false,
      };
    }
    return {
      necessary: true,
      analytics: false,
      marketing: false,
    };
  });

  const handleSave = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <Icon icon="FiX" className="w-6 h-6" />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Preferencias de cookies
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Personaliza tus preferencias de cookies. Las cookies necesarias son esenciales para el funcionamiento del sitio.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="font-medium text-gray-900 dark:text-white">
                  Cookies necesarias
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Requeridas para el funcionamiento básico del sitio. No pueden ser desactivadas.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.necessary}
                disabled
                className="mt-1 rounded text-blue-600"
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="font-medium text-gray-900 dark:text-white">
                  Cookies analíticas
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nos ayudan a entender cómo utilizas el sitio y mejorar la experiencia.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="mt-1 rounded text-blue-600"
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="font-medium text-gray-900 dark:text-white">
                  Cookies de marketing
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Utilizadas para mostrar publicidad relevante y personalizada.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                className="mt-1 rounded text-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Aceptar todo
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Guardar preferencias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 