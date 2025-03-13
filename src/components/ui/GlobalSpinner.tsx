'use client';

import { useSpinner } from '@/contexts/SpinnerContext';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * GlobalSpinner component that shows during navigation and can be controlled programmatically
 * Uses SpinnerContext to prevent duplicate spinners and manage loading state
 */
export default function GlobalSpinner() {
  const { isLoading } = useSpinner();
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <div className="relative flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent animate-spin"></div>
            <div className="absolute text-sm font-medium text-indigo-800 dark:text-indigo-200">
              Cargando...
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 