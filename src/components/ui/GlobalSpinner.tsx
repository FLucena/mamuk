'use client';

import { useSpinner } from '@/contexts/SpinnerContext';
import { AnimatePresence, motion } from 'framer-motion';
import PageLoading from './PageLoading';

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
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        >
          <PageLoading label="Cargando..." />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 