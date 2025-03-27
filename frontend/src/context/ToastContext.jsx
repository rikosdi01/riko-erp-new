import { createContext, useState, useContext, useCallback } from "react";
import ToastNotification from "../components/toast/toast_notification/ToastNotification";
import React from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((variant, message, duration = 5000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, variant, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-provider-container">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            variant={toast.variant}
            message={toast.message} // Kirim pesan ke ToastNotification
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}


export function useToast() {
  return useContext(ToastContext);
}