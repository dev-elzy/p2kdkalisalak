import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { AduanForm } from "@/components/pages/aduan/aduan-form";

export const metadata = {
  title: "Aduan & Perbaikan Data | Kabupaten Tegal",
  description: "Formulir online aduan masyarakat dan permohonan perbaikan DPS Kabupaten Tegal.",
};

export default function AduanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <AduanForm />
      </main>
      <Footer />
    </div>
  );
}
