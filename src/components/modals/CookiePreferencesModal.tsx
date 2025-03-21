'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface CookiePreferencesModalProps {
  onConfirm: (preferences: { analytics: boolean; marketing: boolean }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function CookiePreferencesModal({
  onConfirm,
  onClose,
  loading = false
}: CookiePreferencesModalProps) {
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm(preferences);
    } catch (error) {
      console.error('Error al guardar las preferencias:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar las preferencias');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Preferencias de Cookies
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Cookies analíticas (nos ayudan a mejorar nuestro servicio)
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Cookies de marketing (nos permiten mostrar anuncios relevantes)
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 