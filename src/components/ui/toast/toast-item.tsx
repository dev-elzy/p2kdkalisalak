"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2, X } from "lucide-react";
import { ToastItemData } from "./toast-types";
import { cn } from "@/lib/utils";

interface ToastItemProps {
  toast: ToastItemData;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  loading: <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />,
};

const borderStyles = {
  success: "border-emerald-200 bg-white text-slate-800 shadow-emerald-900/5",
  error: "border-rose-200 bg-white text-slate-800 shadow-rose-900/5",
  warning: "border-amber-200 bg-white text-slate-800 shadow-amber-900/5",
  info: "border-blue-200 bg-white text-slate-800 shadow-blue-900/5",
  loading: "border-indigo-200 bg-white text-slate-800 shadow-indigo-900/5",
};

const progressColors = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  warning: "bg-amber-500",
  info: "bg-blue-600",
  loading: "bg-indigo-600",
};

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const type = toast.type || "info";
  const duration = toast.duration ?? 4000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Infinity || type === "loading") return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration, toast.id, type, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-xl p-4 min-w-[320px] max-w-[420px]",
        borderStyles[type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-bold tracking-tight text-slate-900">{toast.title}</h4>
          {toast.description && (
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {duration !== Infinity && type !== "loading" && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className={cn("h-full transition-all ease-linear", progressColors[type])}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};
