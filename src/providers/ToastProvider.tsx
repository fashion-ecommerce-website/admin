'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast, { ToastProps } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onRemove'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

// Dedupe window in ms - toasts with same content within this window will be ignored
const DEDUPE_WINDOW = 500;

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onRemove'>) => {
    // Create a key based on toast content for deduplication
    const toastKey = `${toast.type}-${toast.title}-${toast.message || ''}`;
    const now = Date.now();
    const lastShown = recentToastsRef.current.get(toastKey);

    // Skip if same toast was shown within dedupe window
    if (lastShown && now - lastShown < DEDUPE_WINDOW) {
      return;
    }

    // Update last shown time
    recentToastsRef.current.set(toastKey, now);

    // Clean up old entries periodically
    if (recentToastsRef.current.size > 50) {
      const cutoff = now - DEDUPE_WINDOW;
      recentToastsRef.current.forEach((time, key) => {
        if (time < cutoff) {
          recentToastsRef.current.delete(key);
        }
      });
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      id,
      onRemove: removeToast
    };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container - Top Right Horizontal Layout */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
