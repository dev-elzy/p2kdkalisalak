"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge, Logo, Input } from "@/components/ui";
import { Calendar, Download, FileText, CheckCircle2, ExternalLink, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MasterPengumuman } from "@/lib/data-store";

interface PengumumanListProps {
  initialData?: MasterPengumuman[];
}

export const PengumumanList: React.FC<PengumumanListProps> = ({ initialData = [] }) => {
  const toast = useToast();
  const [pengumumanList, setPengumumanList] = useState<MasterPengumuman[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/pengumuman")
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPengumumanList(json.data);
        }
      })
      .catch((err) => console.error("Error fetching pengumuman from database:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDownloadDoc = (item: MasterPengumuman) => {
    toast.success("Mengunduh Dokumen", `Mengunduh ${item.fileName} (${item.fileSize})`);
    
    // Create an anchor and trigger immediate browser download
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.download = item.fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = pengumumanList.filter(
    (item) =>
      item.judul.toLowerCase().includes(query.toLowerCase()) ||
      item.nomor.toLowerCase().includes(query.toLowerCase()) ||
      item.kategori.toLowerCase().includes(query.toLowerCase()) ||
      item.ringkasan.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>
        <Badge variant="primary" className="mb-2">
          <FileText className="w-3.5 h-3.5 mr-1.5 inline text-blue-700" />
          Publikasi Dokumen & Regulasi Resmi (Database Live)
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pengumuman & Berkas Resmi Pilkades
        </h1>
        <p className="text-sm text-slate-600 mt-2 font-medium">
          Surat keputusan Bupati Tegal, Peraturan Pemerintah RI, berita acara pleno, dan pengumuman resmi P2KD Desa Kalisalak.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto">
        <Input
          icon={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Cari pengumuman, nomor surat, atau kategori..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-2xl py-3 border-slate-300 shadow-xs text-xs"
        />
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Memuat pengumuman dari database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          Tidak ada pengumuman yang sesuai dengan pencarian.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-6 hover:border-blue-300 transition-all bg-white border border-slate-200 rounded-3xl shadow-xs hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="font-bold text-[11px] bg-blue-100 text-blue-900 border-blue-200">{item.kategori}</Badge>
                  <span className="text-xs text-slate-500 font-mono">No: {item.nomor}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{item.tanggal}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{item.judul}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.ringkasan}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Berkas Asli Tersedia • {item.fileSize}</span>
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold text-slate-700 hover:text-blue-700 rounded-xl"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      <span>Buka di Tab Baru</span>
                    </Button>
                  </a>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadDoc(item)}
                    className="flex-1 sm:flex-none text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    <span>Unduh PDF</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
