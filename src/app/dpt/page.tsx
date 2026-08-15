import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { DptOverview } from "@/components/pages/dpt/dpt-overview";

export const metadata = {
  title: "Daftar Pemilih Tetap (DPT) | Kabupaten Tegal",
  description: "Status dan penetapan Daftar Pemilih Tetap (DPT) Kabupaten Tegal.",
};

export default function DptPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <DptOverview />
      </main>
      <Footer />
    </div>
  );
}
