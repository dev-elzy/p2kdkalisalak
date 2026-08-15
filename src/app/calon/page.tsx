import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { CalonList } from "@/components/pages/calon/calon-list";

export const metadata = {
  title: "Profil Calon Kepala Desa | Pilkades Desa Kalisalak 2026",
  description: "Daftar resmi calon Kepala Desa Kalisalak, Kecamatan Margasari, Kabupaten Tegal beserta visi, misi, dan program kerja unggulan.",
};

export default function CalonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 py-10 w-full">
        <CalonList />
      </main>
      <Footer />
    </div>
  );
}
