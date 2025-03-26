import { useEffect } from 'react';
import { useToastStore, Toast as ToastType } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import IconWrapper from '../IconWrapper';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastIcons = {
  success: <IconWrapper icon={CheckCircle} size="md" className="text-green-500" />,
  error: <IconWrapper icon={XCircle} size="md" className="text-red-500" />,
  warning: <IconWrapper icon={AlertTriangle} size="md" className="text-yellow-500" />,
  info: <IconWrapper icon={Info} size="md" className="text-blue-500" />
};

const toastClasses = {
  success: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
};

const ToastItem = ({ toast }: { toast: ToastType }) => {
  const { removeToast } = useToastStore();

  // Handle escape key to dismiss toast
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        removeToast(toast.id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`w-full max-w-md rounded-lg border shadow-lg ${toastClasses[toast.type]}`}
      role="alert"
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">
          {toastIcons[toast.type]}
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {toast.message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => removeToast(toast.id)}
              className="inline-flex rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Dismiss notification"
              tabIndex={0}
            >
              <IconWrapper icon={X} size="sm" className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Toast = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 w-full max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast; 