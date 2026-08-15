export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number; // in ms, default 4000
  type?: ToastType;
}

export interface ToastItemData extends ToastOptions {
  id: string;
  createdAt: number;
}
