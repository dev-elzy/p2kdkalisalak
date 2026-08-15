"use client";

import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2, ShieldAlert } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileShieldProps {
  onVerify: (token: string) => void;
  isVerified: boolean;
  action?: string;
  size?: "normal" | "compact" | "flexible";
  label?: string;
}

export const CloudflareTurnstileShield: React.FC<TurnstileShieldProps> = ({
  onVerify,
  isVerified,
  action = "login",
  size = "normal",
  label = "Verifikasi Keamanan Sistem Berhasil • Develzy Shield",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY || "";

  useEffect(() => {
    let isCancelled = false;

    const renderTurnstile = () => {
      if (isCancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size,
          appearance: "always",
          execution: "render",
          callback: (token: string) => {
            if (!isCancelled && token) {
              setLoading(false);
              setError(null);
              onVerifyRef.current(token);
            }
          },
          "error-callback": () => {
            if (!isCancelled) {
              setLoading(false);
              setError("Verifikasi keamanan gagal. Silakan muat ulang halaman.");
            }
          },
          "expired-callback": () => {
            if (!isCancelled) {
              onVerifyRef.current("");
            }
          },
        });
        setLoading(false);
      } catch (err) {
        console.error("Turnstile render error:", err);
      }
    };

    if (window.turnstile) {
      renderTurnstile();
    } else {
      const scriptId = "cf-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderTurnstile();
        };
        script.onerror = () => {
          if (!isCancelled) {
            setLoading(false);
            setError("Gagal memuat sistem verifikasi keamanan.");
          }
        };
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval);
            renderTurnstile();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }

    return () => {
      isCancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors during fast refresh
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, size]);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs">
      {/* Official Security Render Target */}
      <div ref={containerRef} className="flex justify-center min-h-[65px]" />

      {loading && !isVerified && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Memeriksa integritas sistem & database...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-rose-600 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isVerified && (
        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 pt-1.5 px-1 border-t border-slate-100 mt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Develzy Security Shield</span>
        </div>
      )}
    </div>
  );
};
