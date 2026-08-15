"use client";

import React, { useState } from "react";
import { Voter, TPSItem } from "../types";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

interface PrintDptTpsProps {
  voters: Voter[];
  tpsList: TPSItem[];
  defaultTps?: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const PrintDptTps: React.FC<PrintDptTpsProps> = ({
  voters,
  tpsList,
  defaultTps,
  isAdmin,
  onBack,
}) => {
  const [selectedTps, setSelectedTps] = useState(defaultTps || tpsList[0]?.namaTps || "SEMUA");
  const [maskNikOption, setMaskNikOption] = useState<"PLAIN" | "MASKED">("PLAIN");

  const handlePrint = () => {
    window.print();
  };

  const tpsObj = tpsList.find((t) => t.namaTps === selectedTps) || tpsList[0];
  const tpsVoters = voters.filter(
    (v) =>
      v.statusAktif === "AKTIF" &&
      (tpsObj?.nomorTps ? v.tps.toLowerCase().includes(tpsObj.nomorTps.toLowerCase()) : true)
  );

  const lCount = tpsVoters.filter((v) => v.jenisKelamin === "L").length;
  const pCount = tpsVoters.filter((v) => v.jenisKelamin === "P").length;

  return (
    <div className="space-y-4">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs gap-3 print:hidden">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs w-fit">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke Pusat Cetak
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TPS Selector (disabled for pantarlih) */}
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
                  {t.namaTps} ({t.lokasi})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Tampilan NIK:</span>
            <select
              value={maskNikOption}
              onChange={(e) => setMaskNikOption(e.target.value as "PLAIN" | "MASKED")}
              className="h-8 px-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
            >
              <option value="PLAIN">NIK Lengkap (Buku Resmi)</option>
              <option value="MASKED">Sensor NIK (Papan Pengumuman)</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold bg-blue-700 hover:bg-blue-600 shadow-md"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Lembar DPT
          </Button>
        </div>
      </div>

      {/* Official Document Sheet */}
      <div className="bg-white text-black p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-lg max-w-5xl mx-auto font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* Kop Surat Resmi */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            MODEL A-PILKADES (DPT RESMI)
          </div>
          <h3 className="text-sm font-bold uppercase">
            DAFTAR PEMILIH TETAP (DPT) PEMILIHAN KEPALA DESA KALISALAK TAHUN 2026
          </h3>
          <h2 className="text-base font-black uppercase tracking-wide mt-0.5">
            {tpsObj?.namaTps || selectedTps} — {tpsObj?.lokasi || "LOKASI TPS"}
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Desa Kalisalak, Kecamatan Margasari, Kabupaten Tegal • Cakupan Wilayah: RT {tpsObj?.rt || "01"} / RW {tpsObj?.rw || "01"}
          </p>
        </div>

        {/* Info Ringkasan TPS */}
        <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-200">
          <div>
            Total Pemilih: <strong>{tpsVoters.length} Orang</strong> (Laki-laki: <strong>{lCount}</strong>, Perempuan: <strong>{pCount}</strong>)
          </div>
          <div className="text-[11px] text-slate-500">
            Format: Siap Pasang di Papan Informasi TPS
          </div>
        </div>

        {/* Tabel Pemilih */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-1.5 w-8">NO</th>
                <th className="border border-black p-1.5 w-36">NIK</th>
                <th className="border border-black p-1.5 w-36">NO KK</th>
                <th className="border border-black p-1.5 text-left">NAMA LENGKAP</th>
                <th className="border border-black p-1.5 w-10">JK</th>
                <th className="border border-black p-1.5 w-24">TEMPAT / TGL LAHIR</th>
                <th className="border border-black p-1.5 w-12">ST. KAWIN</th>
                <th className="border border-black p-1.5 text-left">ALAMAT DOMISILI</th>
                <th className="border border-black p-1.5 w-10">RT</th>
                <th className="border border-black p-1.5 w-10">RW</th>
              </tr>
            </thead>
            <tbody>
              {tpsVoters.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-black p-4 text-center text-slate-400">
                    Belum ada data pemilih aktif di {selectedTps}.
                  </td>
                </tr>
              ) : (
                tpsVoters.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-slate-50 text-center">
                    <td className="border border-black p-1">{idx + 1}</td>
                    <td className="border border-black p-1 font-mono font-semibold text-left">
                      {maskNikOption === "PLAIN" ? v.nik : v.nikMasked}
                    </td>
                    <td className="border border-black p-1 font-mono text-left">
                      {maskNikOption === "PLAIN" ? v.kk || "-" : `${v.kk?.slice(0, 6)}******`}
                    </td>
                    <td className="border border-black p-1 font-bold text-left">{v.namaLengkap}</td>
                    <td className="border border-black p-1">{v.jenisKelamin}</td>
                    <td className="border border-black p-1 text-left">
                      {v.tempatLahir}, {v.tanggalLahir}
                    </td>
                    <td className="border border-black p-1">{v.statusPerkawinan}</td>
                    <td className="border border-black p-1 text-left truncate max-w-xs">{v.alamat}</td>
                    <td className="border border-black p-1">{v.rt}</td>
                    <td className="border border-black p-1">{v.rw}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan KPPS TPS */}
        <div className="mt-8 text-xs flex justify-between items-end">
          <div className="text-[10px] text-slate-500 max-w-xs">
            * Dokumen ini sah dan dicetak melalui Sistem Informasi Daftar Pemilih Pilkades Kalisalak 2026.
          </div>

          <div className="text-center space-y-12">
            <div>
              Kalisalak, 14 Agustus 2026
              <div className="font-bold uppercase">Ketua KPPS {selectedTps}</div>
            </div>
            <div>
              <strong className="underline block font-bold uppercase">
                ( .................................................. )
              </strong>
              <span className="text-[10px] text-slate-600">Nama Terang & Tanda Tangan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
