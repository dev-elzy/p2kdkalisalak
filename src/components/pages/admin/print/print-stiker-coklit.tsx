"use client";

import React, { useState } from "react";
import { Voter, TPSItem } from "../types";
import { Printer, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui";

interface PrintStikerCoklitProps {
  voters: Voter[];
  tpsList: TPSItem[];
  defaultTps?: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const PrintStikerCoklit: React.FC<PrintStikerCoklitProps> = ({
  voters,
  tpsList,
  defaultTps,
  isAdmin,
  onBack,
}) => {
  const [selectedTps, setSelectedTps] = useState(defaultTps || tpsList[0]?.namaTps || "SEMUA");
  const [limitStiker, setLimitStiker] = useState<number>(4);

  const handlePrint = () => {
    window.print();
  };

  const tpsObj = tpsList.find((t) => t.namaTps === selectedTps) || tpsList[0];
  const tpsVoters = voters.filter(
    (v) =>
      v.statusAktif === "AKTIF" &&
      (tpsObj?.nomorTps ? v.tps.toLowerCase().includes(tpsObj.nomorTps.toLowerCase()) : true)
  );

  const displayedVoters = tpsVoters.slice(0, limitStiker);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs gap-3 print:hidden">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs w-fit">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke Pusat Cetak
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Pilih TPS:</span>
            <select
              value={selectedTps}
              disabled={!isAdmin}
              onChange={(e) => setSelectedTps(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-blue-700 disabled:bg-slate-100"
            >
              {tpsList.map((t) => (
                <option key={t.id} value={t.namaTps}>
                  {t.namaTps}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Jumlah Stiker:</span>
            <select
              value={limitStiker}
              onChange={(e) => setLimitStiker(Number(e.target.value))}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
            >
              <option value={4}>4 Stiker Rumah (1 Lembar A4)</option>
              <option value={8}>8 Stiker Rumah (2 Lembar A4)</option>
              <option value={16}>16 Stiker Rumah (4 Lembar A4)</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-500 shadow-md text-white"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Stiker Coklit ({displayedVoters.length} Rumah)
          </Button>
        </div>
      </div>

      {/* Grid Stiker Coklit (4 Stiker per A4 sheet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto print:grid-cols-2 print:gap-4 print:max-w-full print:m-0 print:p-0">
        {displayedVoters.map((v) => (
          <div
            key={v.id}
            className="bg-amber-50/50 text-black p-5 rounded-2xl border-4 border-amber-500 shadow-md font-sans break-inside-avoid print:rounded-none print:border-black"
          >
            <div className="text-center border-b-2 border-amber-600 pb-2 mb-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-900 flex items-center justify-center gap-1">
                <Home className="w-3.5 h-3.5" /> MODEL A.A-PILKADES (STIKER COKLIT)
              </div>
              <h3 className="text-xs font-black uppercase text-slate-900 mt-0.5">
                BUKTI PENDAFTARAN & PENCOCOKAN PEMILIH
              </h3>
              <p className="text-[10px] text-slate-600">P2KD Desa Kalisalak • Kecamatan Margasari</p>
            </div>

            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between border-b border-amber-200/60 pb-1">
                <span className="text-slate-600">Nomor Kartu Keluarga</span>
                <strong className="font-mono">{v.kk || "3328010100000000"}</strong>
              </div>
              <div className="flex justify-between border-b border-amber-200/60 pb-1">
                <span className="text-slate-600">Nama Kepala / Pemilih</span>
                <strong className="uppercase font-black text-slate-900">{v.namaLengkap}</strong>
              </div>
              <div className="flex justify-between border-b border-amber-200/60 pb-1">
                <span className="text-slate-600">Alamat Rumah</span>
                <span>{v.alamat} (RT {v.rt}/RW {v.rw})</span>
              </div>
              <div className="flex justify-between border-b border-amber-200/60 pb-1">
                <span className="text-slate-600">Penetapan TPS</span>
                <strong className="text-blue-900">{v.tps} ({tpsObj?.lokasi})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tanggal Coklit</span>
                <strong className="text-emerald-800">{v.coklitTanggal || "14 Agustus 2026"}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-2 border-t border-amber-300">
              <div className="space-y-8">
                <span>Kepala Keluarga / Pemilih</span>
                <div className="border-b border-black w-24 mx-auto"></div>
              </div>
              <div className="space-y-8">
                <span>Petugas Pantarlih {v.tps}</span>
                <div className="border-b border-black w-24 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
