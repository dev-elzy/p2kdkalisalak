"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    // 1. Silent BeforeInstallPrompt handler (Disables annoying automatic install banner popups)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Mencegah popup install otomatis
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 2. Register Service Worker in background
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("P2KD PWA Service Worker Registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA Service Worker registration skipped:", err);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
