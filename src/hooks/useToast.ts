import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string,
    type: ToastType = 'info',
    options?: {
      description?: string;
      duration?: number;
    }
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      id,
      type,
      message,
      description: options?.description,
      duration: options?.duration ?? 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (options?.duration !== Infinity) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, options?.duration ?? 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((
    message: string,
    description?: string,
    duration?: number
  ) => {
    addToast(message, 'success', { description, duration });
  }, [addToast]);

  const error = useCallback((
    message: string,
    description?: string,
    duration?: number
  ) => {
    addToast(message, 'error', { description, duration });
  }, [addToast]);

  const warning = useCallback((
    message: string,
    description?: string,
    duration?: number
  ) => {
    addToast(message, 'warning', { description, duration });
  }, [addToast]);

  const info = useCallback((
    message: string,
    description?: string,
    duration?: number
  ) => {
    addToast(message, 'info', { description, duration });
  }, [addToast]);

  return {
    toasts,
    removeToast,
    addToast,
    success,
    error,
    warning,
    info,
  };
};
