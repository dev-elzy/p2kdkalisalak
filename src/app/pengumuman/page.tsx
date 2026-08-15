import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { PengumumanList } from "@/components/pages/pengumuman/pengumuman-list";

export const metadata = {
  title: "Pengumuman Resmi | Kabupaten Tegal",
  description: "Pengumuman dan berita acara resmi pendaftaran pemilih Kabupaten Tegal.",
};

export default function PengumumanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <PengumumanList />
      </main>
      <Footer />
    </div>
  );
}
