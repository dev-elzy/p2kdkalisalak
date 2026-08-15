"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input, Button, Badge, Logo } from "@/components/ui";
import {
  Lock,
  User,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CloudflareTurnstileShield } from "@/components/ui/cloudflare-turnstile-shield";

export const AdminLoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleTurnstileVerify = useCallback((token: string) => {
    if (token) {
      setIsSecurityVerified(true);
      setTurnstileToken(token);
    } else {
      setIsSecurityVerified(false);
      setTurnstileToken(null);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSecurityVerified) {
      toast.warning(
        "Verifikasi Keamanan Wajib",
        "Silakan selesaikan verifikasi keamanan terlebih dahulu."
      );
      return;
    }

    if (!username.trim() || !password.trim()) {
      toast.warning("Form Belum Lengkap", "Silakan masukkan username dan kata sandi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error("Gagal Masuk", data.message || "Username atau kata sandi tidak cocok.");
        setLoading(false);
        return;
      }

      toast.success(
        "Autentikasi Berhasil",
        `Selamat datang, ${data.data.nama}!`
      );

      if (typeof window !== "undefined" && data.data?.token) {
        localStorage.setItem("admin_token", data.data.token);
        sessionStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("admin_user_data", JSON.stringify(data.data));
      }

      const targetRole = (data.data.role || "SUPER_ADMIN").toLowerCase();
      const targetTps = data.data.assignedTps || "SEMUA";
      const targetUser = data.data.username;

      router.push(
        `/admin/dashboard?role=${encodeURIComponent(targetRole)}&tps=${encodeURIComponent(
          targetTps
        )}&user=${encodeURIComponent(targetUser)}`
      );
    } catch {
      toast.error("Kesalahan Jaringan", "Gagal menghubungi server database resmi P2KD.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100/80">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-700 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Kembali ke Beranda Portal Publik
          </Link>
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Portal Administrasi & Kepanitiaan P2KD
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            Sistem Informasi Penyelenggaraan Pilkades Kalisalak
          </p>
        </div>

        <Card className="p-6 border-slate-200/90 shadow-xl bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Masuk Akun Panitia / Petugas
              </h2>
            </div>
            <Badge variant="primary" className="text-[10px]">
              DEVELZY SECURITY SHIELD
            </Badge>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Akun
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Masukkan username Anda..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 text-xs"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Develzy Security Shield Official Challenge Widget */}
            <div className="pt-1">
              <CloudflareTurnstileShield
                isVerified={isSecurityVerified}
                onVerify={handleTurnstileVerify}
                label="Verifikasi Akses Panitia Lolos • Develzy Shield"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={!isSecurityVerified}
                className="w-full py-2.5 font-bold shadow-md shadow-blue-600/20 text-xs disabled:opacity-50"
              >
                Masuk ke Dashboard
              </Button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Dilindungi Sistem Keamanan Enkripsi Develzy • IP & Session Tercatat Otomatis di Database</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
