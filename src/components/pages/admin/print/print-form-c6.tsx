"use client";

import React, { useState } from "react";
import { Voter, TPSItem } from "../types";
import { Printer, ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui";

interface PrintFormC6Props {
  voters: Voter[];
  tpsList: TPSItem[];
  defaultTps?: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const PrintFormC6: React.FC<PrintFormC6Props> = ({
  voters,
  tpsList,
  defaultTps,
  isAdmin,
  onBack,
}) => {
  const [selectedTps, setSelectedTps] = useState(defaultTps || tpsList[0]?.namaTps || "SEMUA");
  const [limitPrint, setLimitPrint] = useState<number>(12); // Number of cards to preview/print

  const handlePrint = () => {
    window.print();
  };

  const tpsObj = tpsList.find((t) => t.namaTps === selectedTps) || tpsList[0];
  const tpsVoters = voters.filter(
    (v) =>
      v.statusAktif === "AKTIF" &&
      (tpsObj?.nomorTps ? v.tps.toLowerCase().includes(tpsObj.nomorTps.toLowerCase()) : true)
  );

  const displayedVoters = tpsVoters.slice(0, limitPrint);

  return (
    <div className="space-y-4">
      {/* Top Action Bar (Hidden when printing) */}
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
            <span>Jumlah Kartu:</span>
            <select
              value={limitPrint}
              onChange={(e) => setLimitPrint(Number(e.target.value))}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
            >
              <option value={6}>6 Pemilih (1 Lembar A4)</option>
              <option value={12}>12 Pemilih (2 Lembar A4)</option>
              <option value={24}>24 Pemilih (4 Lembar A4)</option>
              <option value={tpsVoters.length}>Semua Pemilih {selectedTps} ({tpsVoters.length} Kartu)</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold bg-blue-700 hover:bg-blue-600 shadow-md"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Form C6 ({displayedVoters.length} Undangan)
          </Button>
        </div>
      </div>

      {/* Grid of C6 Invitation Cards (Layout for 2 columns per A4 page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto print:grid-cols-2 print:gap-3 print:max-w-full print:m-0 print:p-0">
        {displayedVoters.map((v, idx) => (
          <div
            key={v.id}
            className="bg-white text-black p-4 rounded-xl border-2 border-dashed border-slate-400 shadow-xs text-xs font-sans relative break-inside-avoid print:border-black print:rounded-none"
          >
            {/* Header Card */}
            <div className="flex items-start justify-between border-b border-black pb-2 mb-2">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-600 uppercase">
                  MODEL C6-PILKADES (SURAT PEMBERITAHUAN PEMUNGUTAN SUARA)
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight">
                  P2KD DESA KALISALAK TAHUN 2026
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold block">No. Urut DPT:</span>
                <span className="text-sm font-black text-blue-900 block font-mono">#{idx + 1}</span>
              </div>
            </div>

            {/* Voter Data */}
            <div className="space-y-1 text-[11px] mb-3">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-600">Nama Pemilih</span>
                <span className="col-span-2 font-bold uppercase">{v.namaLengkap}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-600">NIK Pemilih</span>
                <span className="col-span-2 font-mono font-bold">{v.nikMasked}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-600">Alamat Domisili</span>
                <span className="col-span-2">{v.alamat} (RT {v.rt}/RW {v.rw})</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-600">Lokasi TPS</span>
                <span className="col-span-2 font-bold text-blue-950">
                  {v.tps} — {tpsObj?.lokasi || "Balai Warga"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-600">Hari / Waktu</span>
                <span className="col-span-2 font-bold text-emerald-800">
                  Rabu, 02 September 2026 • 07.00 - 13.00 WIB
                </span>
              </div>
            </div>

            {/* Footer C6 */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-7 h-7 text-black" />
                <span>Bawa KTP-el / KK saat hadir ke TPS</span>
              </div>
              <div className="text-center">
                <span>Ketua KPPS {v.tps}</span>
                <div className="mt-4 border-b border-black w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
