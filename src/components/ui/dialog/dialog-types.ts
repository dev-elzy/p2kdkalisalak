export type DialogVariant = "default" | "danger" | "warning" | "success" | "info";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: DialogVariant;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}
