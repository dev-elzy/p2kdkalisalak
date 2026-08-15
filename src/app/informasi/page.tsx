import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { InformasiContent } from "@/components/pages/informasi/informasi-content";

export const metadata = {
  title: "Informasi Pemilihan | Kabupaten Tegal",
  description: "Pedoman dan informasi penyelenggaraan pendaftaran pemilih Kabupaten Tegal.",
};

export default function InformasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <InformasiContent />
      </main>
      <Footer />
    </div>
  );
}
