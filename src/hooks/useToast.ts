import { useToastStore, ToastType } from '../store/toastStore';

interface ToastOptions {
  duration?: number;
}

export const useToast = () => {
  const { addToast } = useToastStore();

  const showToast = (
    message: string,
    type: ToastType = 'info',
    options?: ToastOptions
  ) => {
    addToast({
      message,
      type,
      duration: options?.duration
    });
  };

  const toast = {
    success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
    error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
    warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
    info: (message: string, options?: ToastOptions) => showToast(message, 'info', options)
  };

  return toast;
};

export default useToast; 