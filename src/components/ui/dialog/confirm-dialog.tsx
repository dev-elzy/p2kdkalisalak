"use client";

import React from "react";
import { Dialog } from "./dialog";
import { ConfirmOptions } from "./dialog-types";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const variantIcons = {
  danger: <AlertCircle className="w-8 h-8 text-rose-600" />,
  warning: <AlertTriangle className="w-8 h-8 text-amber-600" />,
  success: <CheckCircle className="w-8 h-8 text-emerald-600" />,
  info: <Info className="w-8 h-8 text-blue-600" />,
  default: <Info className="w-8 h-8 text-indigo-600" />,
};

const confirmButtonStyles = {
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/20",
  warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/20",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20",
  info: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20",
  default: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20",
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!options) return null;

  const variant = options.variant || "default";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-full bg-slate-100 border border-slate-200">
          {variantIcons[variant]}
        </div>

        <h4 className="text-lg font-bold text-slate-900">{options.title}</h4>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{options.message}</p>

        <div className="mt-6 flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all disabled:opacity-50"
          >
            {options.cancelText || "Batal"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
              confirmButtonStyles[variant]
            )}
          >
            {isLoading ? "Memproses..." : options.confirmText || "Konfirmasi"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
