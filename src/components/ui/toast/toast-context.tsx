"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "./toast-container";
import { ToastItemData, ToastOptions } from "./toast-types";

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItemData = {
        ...options,
        id,
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, type: "success" }),
    [toast]
  );
  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, type: "error" }),
    [toast]
  );
  const warning = useCallback(
    (title: string, description?: string) => toast({ title, description, type: "warning" }),
    [toast]
  );
  const info = useCallback(
    (title: string, description?: string) => toast({ title, description, type: "info" }),
    [toast]
  );
  const loading = useCallback(
    (title: string, description?: string) => toast({ title, description, type: "loading", duration: Infinity }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, loading, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
