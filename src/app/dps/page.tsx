import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { DpsTable } from "@/components/pages/dps/dps-table";

export const metadata = {
  title: "Daftar Pemilih Sementara (DPS) | Kabupaten Tegal",
  description: "Rekapitulasi resmi DPS per wilayah kecamatan dan desa di Kabupaten Tegal.",
};

export default function DpsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <DpsTable />
      </main>
      <Footer />
    </div>
  );
}
