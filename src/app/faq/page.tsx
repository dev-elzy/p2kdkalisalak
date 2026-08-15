import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { FaqAccordion } from "@/components/pages/faq/faq-accordion";

export const metadata = {
  title: "Pertanyaan Umum (FAQ) | Kabupaten Tegal",
  description: "Tanya jawab seputar pendaftaran pemilih dan hak pilih Kabupaten Tegal.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
