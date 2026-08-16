"use client";

import React, { useState } from "react";
import { Kandidat, TpsRealCountItem, RealCountStats } from "../types";
import {
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  Edit,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Button, Badge } from "@/components/ui";

interface TabRealCountProps {
  kandidatList: Kandidat[];
  tpsVoteList: TpsRealCountItem[];
  stats: RealCountStats;
  isAdmin: boolean;
  assignedTps?: string;
  onSubmitTpsVote: (
    nomorTps: string,
    suaraKandidat: Record<number, number>,
    suaraTidakSah: number,
    statusPlenoTps: "BELUM" | "SELESAI"
  ) => void;
}

export const TabRealCount: React.FC<TabRealCountProps> = ({
  kandidatList,
  tpsVoteList,
  stats,
  isAdmin,
  assignedTps = "SEMUA",
  onSubmitTpsVote,
}) => {
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedTpsInput, setSelectedTpsInput] = useState<TpsRealCountItem | null>(null);

  const [inputForm, setInputForm] = useState<{
    suaraKandidat: Record<number, number>;
    suaraTidakSah: number;
  }>({
    suaraKandidat: { 1: 0, 2: 0, 3: 0 },
    suaraTidakSah: 0,
  });

  const handleOpenInput = (tps: TpsRealCountItem) => {
    setSelectedTpsInput(tps);
    setInputForm({
      suaraKandidat: { ...tps.suaraKandidat },
      suaraTidakSah: tps.suaraTidakSah,
    });
    setShowInputModal(true);
  };

  const handleSaveInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpsInput) return;
    onSubmitTpsVote(
      selectedTpsInput.nomorTps,
      inputForm.suaraKandidat,
      inputForm.suaraTidakSah,
      "SELESAI"
    );
    setShowInputModal(false);
  };

  // Find candidate with highest votes
  const leadingCandidate = [...stats.kandidatStats].sort((a, b) => b.totalSuara - a.totalSuara)[0];

  return (
    <div className="space-y-5">
      {/* 1. Real Count Live Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white border border-blue-900/60 shadow-lg rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <Badge
                variant="primary"
                className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-0.5 rounded-full"
              >
                LIVE REAL COUNT PILKADES KALISALAK 2027
              </Badge>
              <span className="text-xs text-blue-300 font-semibold">
                • {stats.tpsMasukCount} / {stats.totalTpsCount} Tabung Masuk
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Penghitungan Suara Terpusat Lapangan (Pleno Tabung Suara)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              Perekaman hasil pleno pemungutan suara dipusatkan di Lapangan Desa Kalisalak, direkapitulasi per Tabung Pemilihan berbasis Berita Acara C1 Plano secara realtime dan transparan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href="/api/admin/export?type=REKAP" download>
              <button
                type="button"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Ekspor Hasil Excel</span>
              </button>
            </a>
          </div>
        </div>

        {/* Big Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm space-y-1">
            <span className="text-[10px] text-blue-200 block font-bold uppercase tracking-wider">
              Total Suara Masuk
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalSuaraMasuk}</div>
            <span className="text-[10px] text-slate-300 block font-medium">Dari {stats.totalDptDesa} Hak Pilih</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm space-y-1">
            <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-wider">
              Partisipasi Pemilih
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats.persentasePartisipasi}%
            </div>
            <span className="text-[10px] text-emerald-300 font-semibold block">Tingkat Kehadiran Terverifikasi</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm space-y-1">
            <span className="text-[10px] text-blue-300 block font-bold uppercase tracking-wider">
              Total Suara Sah
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalSuaraSah}</div>
            <span className="text-[10px] text-blue-200 block font-medium">Suara Masuk Sah</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm space-y-1">
            <span className="text-[10px] text-rose-300 block font-bold uppercase tracking-wider">
              Suara Tidak Sah / Rusak
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400">
              {stats.totalSuaraTidakSah}
            </div>
            <span className="text-[10px] text-rose-300 block font-medium">Coblosan Tidak Sah</span>
          </div>
        </div>
      </Card>

      {/* 2. Candidate Votes Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.kandidatStats.map((k) => {
          const isWinner = leadingCandidate?.nomorUrut === k.nomorUrut && k.totalSuara > 0;
          return (
            <Card
              key={k.nomorUrut}
              className={`p-5 relative overflow-hidden transition-all ${isWinner
                  ? "bg-white border-2 border-emerald-500 shadow-lg ring-2 ring-emerald-400/30"
                  : "bg-white border-slate-200"
                }`}
            >
              {isWinner && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" />
                  Unggul Sementara
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: k.warnaTema || "#2563eb" }}
                >
                  #{k.nomorUrut}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    Calon No. Urut {k.nomorUrut}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {k.namaLengkap}
                  </h4>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">
                    {k.totalSuara}{" "}
                    <span className="text-xs font-normal text-slate-500">Suara</span>
                  </span>
                  <span className="text-base font-black text-blue-700">
                    {k.persentaseSuara}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${k.persentaseSuara}%`,
                      backgroundColor: k.warnaTema || "#2563eb",
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Real Count Table Across 7 TPS */}
      <Card className="overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Rincian Perolehan Suara TPS
            </h3>
            <p className="text-xs text-slate-500">
              Petugas KPPS memasukkan hasil perhitungan suara fisik form Model C1 dari tiap TPS.
            </p>
          </div>
          <Badge variant="primary" className="text-[10px] w-fit font-bold">
            {isAdmin ? `Semua (${stats.totalTpsCount}) TPS Desa` : `Khusus Wilayah ${assignedTps}`}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-center">
                <th className="py-3 px-3 text-left">Tabung Suara & Lokasi</th>
                <th className="py-3 px-3">DPT Tabung</th>
                <th className="py-3 px-3 bg-blue-50/60 text-blue-900">#1 Sujarwo</th>
                <th className="py-3 px-3 bg-emerald-50/60 text-emerald-900">#2 Fauzan</th>
                <th className="py-3 px-3 bg-purple-50/60 text-purple-900">#3 Nurjanah</th>
                <th className="py-3 px-3">Tidak Sah</th>
                <th className="py-3 px-3">Total Masuk</th>
                <th className="py-3 px-3">Status Pleno</th>
                <th className="py-3 px-3">Aksi Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium text-center">
              {tpsVoteList.map((t) => {
                const canEditThisTps = isAdmin || t.namaTps.includes(assignedTps) || t.nomorTps.includes(assignedTps.replace("TPS ", ""));
                return (
                  <tr key={t.tpsId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-left font-bold text-slate-900">
                      <div>{t.namaTps}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t.lokasi}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{t.totalDpt} org</td>
                    <td className="py-3 px-3 font-bold text-blue-800 bg-blue-50/30">
                      {t.suaraKandidat[1] || 0}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30">
                      {t.suaraKandidat[2] || 0}
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-800 bg-purple-50/30">
                      {t.suaraKandidat[3] || 0}
                    </td>
                    <td className="py-3 px-3 text-rose-600 font-bold">{t.suaraTidakSah}</td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      {t.suaraMasuk}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({Math.round((t.suaraMasuk / (t.totalDpt || 1)) * 100)}%)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {t.statusPlenoTps === "SELESAI" ? (
                        <Badge variant="success" className="text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1 inline" /> SELESAI
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] font-bold">
                          <Clock className="w-3 h-3 mr-1 inline" /> BELUM INPUT
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {canEditThisTps ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenInput(t)}
                          className="text-[11px] font-bold py-1 px-2.5"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Input C1
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Terkunci (Bukan TPS Anda)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Modal Input Vote Count for a TPS */}
      {showInputModal && selectedTpsInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Input Hasil Suara {selectedTpsInput.namaTps}
                </h3>
                <p className="text-xs text-slate-500">
                  Total DPT: <strong>{selectedTpsInput.totalDpt} Pemilih</strong>
                </p>
              </div>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInput} className="space-y-3.5 text-xs">
              <div className="space-y-2">
                <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  Perolehan Suara Tiap Calon:
                </label>

                {kandidatList.map((k) => (
                  <div
                    key={k.nomorUrut}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center"
                        style={{ backgroundColor: k.warnaTema || "#2563eb" }}
                      >
                        #{k.nomorUrut}
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[160px]">
                        {k.namaLengkap}
                      </span>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={0}
                        value={inputForm.suaraKandidat[k.nomorUrut] || 0}
                        onChange={(e) =>
                          setInputForm({
                            ...inputForm,
                            suaraKandidat: {
                              ...inputForm.suaraKandidat,
                              [k.nomorUrut]: Number(e.target.value),
                            },
                          })
                        }
                        className="text-center font-bold"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Suara Tidak Sah / Rusak
                </label>
                <Input
                  type="number"
                  min={0}
                  value={inputForm.suaraTidakSah}
                  onChange={(e) =>
                    setInputForm({ ...inputForm, suaraTidakSah: Number(e.target.value) })
                  }
                  required
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between font-bold">
                <span>Total Suara Masuk:</span>
                <span>
                  {Object.values(inputForm.suaraKandidat).reduce(
                    (a, b) => a + (Number(b) || 0),
                    0
                  ) + (Number(inputForm.suaraTidakSah) || 0)}{" "}
                  Suara
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInputModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold bg-blue-700">
                  Simpan & Sahkan Hasil TPS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
