import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { TahapanTimeline } from "@/components/pages/tahapan/tahapan-timeline";

export const metadata = {
  title: "Tahapan Pemilihan | Kabupaten Tegal",
  description: "Jadwal dan tahapan resmi pendaftaran pemilih Kabupaten Tegal.",
};

export default function TahapanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <TahapanTimeline />
      </main>
      <Footer />
    </div>
  );
}
