"use client";

import React from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  Printer,
  FileCheck2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, Badge } from "@/components/ui";
import { Voter, TPSItem } from "../types";

interface TabFinalisasiDPTProps {
  isDptLocked: boolean;
  lockHashSignature: string;
  nomorBeritaAcara: string;
  setNomorBeritaAcara: (ba: string) => void;
  totalAktif: number;
  voters?: Voter[];
  tpsList?: TPSItem[];
  onLockDpt: () => void;
  onUnlockDpt: () => void;
  onNavigatePrint?: () => void;
}

export const TabFinalisasiDPT: React.FC<TabFinalisasiDPTProps> = ({
  isDptLocked,
  lockHashSignature,
  nomorBeritaAcara,
  setNomorBeritaAcara,
  totalAktif,
  voters = [],
  tpsList = [],
  onLockDpt,
  onUnlockDpt,
  onNavigatePrint,
}) => {
  const activeVoters = voters.filter((v) => v.statusAktif === "AKTIF");
  const totalLaki = activeVoters.filter((v) => String(v.jenisKelamin).toUpperCase().startsWith("L")).length;
  const totalPerempuan = activeVoters.filter((v) => !String(v.jenisKelamin).toUpperCase().startsWith("L")).length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white border border-blue-900/60 shadow-xl rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={isDptLocked ? "danger" : "primary"}
                className={`text-[10px] uppercase font-bold px-3 py-0.5 rounded-full ${
                  isDptLocked
                    ? "bg-rose-500/20 text-rose-300 border-rose-400/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                }`}
              >
                {isDptLocked ? "DPT FINAL TELAH DIKUNCI (SAH & MENGIKAT)" : "TAHAP PERSIAPAN SIDANG PLENO P2KD"}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">• Segel Digital SHA-256</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              Penetapan & Penguncian Berita Acara DPT
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              Penetapan DPT merupakan tahapan hukum tertinggi dalam daftar pemilih Pilkades Kalisalak. Setelah disahkan dalam Sidang Pleno Terbuka P2KD bersama BPD dan saksi calon kepala desa, data dikunci secara permanen dengan segel kriptografis digital untuk menjamin netralitas dan transparansi mutlak.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigatePrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigatePrint}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Berita Acara
              </Button>
            )}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Lock className={`w-8 h-8 ${isDptLocked ? "text-rose-400 animate-pulse" : "text-blue-300"}`} />
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total DPT Ditetapkan</div>
              <div className="text-xl font-black text-slate-900">{totalAktif} Pemilih</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Laki-laki (L)</div>
              <div className="text-xl font-black text-indigo-900">{totalLaki} Jiwa</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Perempuan (P)</div>
              <div className="text-xl font-black text-pink-900">{totalPerempuan} Jiwa</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Wilayah RW & Meja</div>
              <div className="text-xl font-black text-emerald-900">13 Wilayah RW</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Pengesahan & Rekapitulasi */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              Instrumen Berita Acara Sidang Pleno Terbuka
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rapat Pleno Penetapan Daftar Pemilih Tetap Pilkades Kalisalak Periode 2027 – 2035
            </p>
          </div>
        </div>

        {/* Input Nomor BA & Info Sidang */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              Nomor Berita Acara Pleno
            </label>
            <input
              type="text"
              disabled={isDptLocked}
              value={nomorBeritaAcara}
              onChange={(e) => setNomorBeritaAcara(e.target.value)}
              placeholder="Contoh: BA/01/P2KD-KLS/XII/2026"
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Lokasi Sidang Pleno
            </label>
            <input
              type="text"
              readOnly
              value="Balai Desa Kalisalak, Margasari, Tegal"
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Pusat Pemungutan Suara
            </label>
            <input
              type="text"
              readOnly
              value="Terpusat di Lapangan Desa Kalisalak (13 Meja RW)"
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* Tabel Rekapitulasi 13 Wilayah RW */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi DPT per 13 Meja Pendaftaran & Wilayah RW
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Basis 39 RT di Desa Kalisalak
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Meja Pendaftaran / Wilayah</th>
                  <th className="py-2.5 px-3">Lokasi Meja</th>
                  <th className="py-2.5 px-3 text-center w-16">L</th>
                  <th className="py-2.5 px-3 text-center w-16">P</th>
                  <th className="py-2.5 px-3 text-center w-24">Total DPT</th>
                  <th className="py-2.5 px-3 text-center w-28">Status Coklit RW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {tpsList.map((t, idx) => {
                  const rwNum = t.nomorTps.replace(/\D/g, "").padStart(2, "0");
                  const votersInRw = activeVoters.filter((v) => {
                    const vRw = (v.rw || "").replace(/\D/g, "").padStart(2, "0");
                    return vRw === rwNum || (v.tps && v.tps.includes(t.nomorTps));
                  });
                  const l = votersInRw.filter((v) => String(v.jenisKelamin).toUpperCase().startsWith("L")).length;
                  const p = votersInRw.filter((v) => !String(v.jenisKelamin).toUpperCase().startsWith("L")).length;
                  const coklitDoneInRw = votersInRw.filter((v) => v.coklitStatus && v.coklitStatus !== "BELUM_COKLIT").length;
                  const percentCoklit = votersInRw.length > 0 ? Math.round((coklitDoneInRw / votersInRw.length) * 100) : 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.namaTps}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.lokasi}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">{l}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-pink-700">{p}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900">
                        {votersInRw.length}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {percentCoklit === 0 ? (
                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 text-slate-600 border-slate-300">
                            Belum Coklit (0%)
                          </Badge>
                        ) : percentCoklit < 100 ? (
                          <Badge variant="warning" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-300">
                            Proses ({percentCoklit}%)
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Selesai 100%
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-blue-50/70 border-t-2 border-blue-200 font-black text-slate-900">
                  <td colSpan={3} className="py-3 px-4 text-right uppercase text-xs tracking-wider">
                    Total Akumulasi DPT Desa Kalisalak
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-indigo-900 font-black">{totalLaki}</td>
                  <td className="py-3 px-3 text-center font-mono text-pink-900 font-black">{totalPerempuan}</td>
                  <td className="py-3 px-3 text-center font-mono text-blue-900 font-black text-sm">
                    {totalAktif}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {activeVoters.length > 0 && activeVoters.filter((v) => v.coklitStatus && v.coklitStatus !== "BELUM_COKLIT").length === 0 ? (
                      <Badge variant="outline" className="text-[10px] font-black bg-slate-200 text-slate-700">
                        Belum Coklit (0%)
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px] font-black bg-amber-200 text-amber-900">
                        Progres Coklit
                      </Badge>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Signature Hash Info */}
        {isDptLocked && lockHashSignature && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Segel Keamanan Kriptografis SHA-256 Terverifikasi Resmi
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Integritas data seluruh 7.787 pemilih telah disegel secara matematis. Setiap perubahan pada basis data akan otomatis merusak tanda tangan digital ini.
            </p>
            <div className="font-mono text-[11px] text-emerald-950 break-all bg-white p-3 rounded-xl border border-emerald-200 shadow-inner">
              {lockHashSignature}
            </div>
          </div>
        )}

        {/* Warning / Confirmation notice */}
        {!isDptLocked && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Perhatian Sebelum Penguncian Pleno DPT
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Pastikan seluruh proses verifikasi tanggapan warga dan perbaikan DPSHP telah selesai sebelum melakukan penguncian. Setelah dikunci, aksi tambah/edit/hapus pemilih akan diblokir oleh sistem demi keamanan.
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Status Hukum DPT:{" "}
            <strong className={isDptLocked ? "text-rose-700" : "text-amber-700"}>
              {isDptLocked ? "Sah, Final, dan Mengikat" : "Menunggu Pengesahan Sidang Pleno"}
            </strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isDptLocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onUnlockDpt}
                className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl"
              >
                <Unlock className="w-4 h-4 mr-1.5" />
                Buka Kunci (Darurat Pleno)
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={onLockDpt}
                className="text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Lock className="w-4 h-4 mr-2" />
                Kunci & Segel DPT Pleno Sekarang
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
