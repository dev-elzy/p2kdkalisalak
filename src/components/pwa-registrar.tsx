"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function PwaRegistrar() {
  const pathname = usePathname();
  const router = useRouter();

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

    // 3. Strict PWA Routing: All PWA instances MUST go directly to /admin (Login / Dashboard)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      document.documentElement.classList.add("is-pwa-app");
      // If PWA is on public page, immediately forward to /admin
      if (
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/verifikasi-c6") &&
        !pathname.startsWith("/stiker-coklit")
      ) {
        router.replace("/admin");
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [pathname, router]);

  return null;
}
