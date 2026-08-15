import React, { Suspense } from "react";
import { AdminDashboard } from "@/components/pages/admin/admin-dashboard";

export const metadata = {
  title: "Dashboard P2KD & Petugas | Pilkades Desa Kalisalak",
  description: "Panel kendali administrasi penetapan DPT, verifikasi aduan warga, dan audit log.",
};

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-semibold">
          Memuat Dashboard P2KD...
        </div>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
