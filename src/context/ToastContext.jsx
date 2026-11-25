'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((msgOrObj, type = 'success', duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let messageText = '';
    let toastType = type;
    
    if (typeof msgOrObj === 'string') {
      messageText = msgOrObj;
    } else if (msgOrObj && typeof msgOrObj === 'object') {
      messageText = msgOrObj.message || msgOrObj.title || 'Notification';
      if (msgOrObj.type) toastType = msgOrObj.type;
    } else {
      messageText = String(msgOrObj || '');
    }

    const newToast = { id, message: String(messageText), type: toastType };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const addToast = showToast; // Alias so both work

  return (
    <ToastContext.Provider value={{ showToast, addToast, removeToast }}>
      {children}
      {/* Toast rendering portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgColor = 'bg-sage-dark text-white border-sage-soft/30';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;

          if (toast.type === 'error') {
            bgColor = 'bg-red-900 text-white border-red-700/50';
            icon = <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-900 text-white border-amber-700/50';
            icon = <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />;
          } else if (toast.type === 'info') {
            bgColor = 'bg-sage-primary text-white border-sage-accent/50';
            icon = <Info className="w-4 h-4 text-sage-ivory shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-float border backdrop-blur-md transition-all duration-300 animate-slide-up text-xs font-medium ${bgColor}`}
            >
              <div className="flex items-center space-x-2.5 mr-3">
                {icon}
                <span className="leading-snug">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Provide a fallback if used outside provider so code never crashes
    return {
      showToast: (msg) => console.log('Toast:', msg),
      addToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {},
    };
  }
  return context;
}
