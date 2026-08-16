"use client";

import React, { useState } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, Badge } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";

interface FloatingQrVerifierProps {
  assignedMeja?: string;
  userName?: string;
}

interface C6ResultData {
  id: string;
  namaLengkap: string;
  nikMasked: string;
  kkMasked: string;
  jenisKelamin: string;
  alamat: string;
  rt: string;
  rw: string;
  mejaPendaftaran: string;
  tahap: string;
  statusAktif: string;
  waktuPemilihan: string;
}

export const FloatingQrVerifier: React.FC<FloatingQrVerifierProps> = ({
  assignedMeja = "SEMUA",
  userName = "Petugas KPPS",
}) => {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<C6ResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMarkedPresent, setIsMarkedPresent] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);
    setIsMarkedPresent(false);

    try {
      const clean = inputQuery.trim();
      const isNik = /^\d{16}$/.test(clean);
      const queryParam = isNik
        ? `nik=${encodeURIComponent(clean)}`
        : `id=${encodeURIComponent(clean)}`;

      const res = await fetch(`/api/voters/c6-verify?${queryParam}`);
      const json = await res.json();

      if (json.success && json.data) {
        setResult(json.data);
      } else {
        setErrorMsg(json.message || "Data pemilih Form C6 tidak ditemukan di DPT.");
      }
    } catch {
      setErrorMsg("Gagal menghubungi server verifikasi. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = () => {
    if (!result) return;
    setIsMarkedPresent(true);
    toast.success(
      "Presensi Pemilih Berhasil",
      `${result.namaLengkap} telah ditandai HADIR di ${assignedMeja || result.mejaPendaftaran}.`
    );
  };

  const assignedRwNum = (assignedMeja || "").replace(/\D/g, "");
  const voterRwNum = (result?.rw || "").replace(/\D/g, "");
  const isCorrectMeja = !assignedRwNum || assignedRwNum === voterRwNum || assignedMeja === "SEMUA";

  return (
    <>
      {/* Floating Center Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 print:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-xs sm:text-sm shadow-2xl hover:shadow-emerald-500/50 border-2 border-emerald-300/80 transition-all hover:scale-105 active:scale-95"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>

          <QrCode className="w-5 h-5 text-white" />
          <span>Verifikasi QR Form C6</span>

          {assignedMeja && assignedMeja !== "SEMUA" && (
            <Badge
              variant="outline"
              className="bg-emerald-950/80 text-emerald-200 border-emerald-400 text-[10px] uppercase font-mono px-2 py-0.5"
            >
              {assignedMeja}
            </Badge>
          )}
        </button>
      </div>

      {/* Verification Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    Otentikasi Form C6 (QR / NIK)
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Petugas: {userName} • {assignedMeja}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setResult(null);
                  setErrorMsg("");
                  setInputQuery("");
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-800">
              {/* Search & Scanner Input Form */}
              <form onSubmit={handleVerify} className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Scan QR / Masukkan ID C6 / NIK Pemilih (16 Digit):
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="Contoh: 332801... atau scan barcode..."
                      className="w-full h-11 pl-9 pr-3 text-xs rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !inputQuery.trim()}
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
                  >
                    {loading ? "Mengecek..." : "Verifikasi"}
                  </Button>
                </div>
              </form>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">VERIFIKASI GAGAL</div>
                    <div className="text-[11px] text-rose-700">{errorMsg}</div>
                  </div>
                </div>
              )}

              {/* Result Box */}
              {result && (
                <div className="space-y-3 pt-2">
                  {/* Status Banner */}
                  {result.statusAktif === "TMS" ? (
                    <div className="p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 flex items-center gap-2 font-bold">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      STATUS: TMS (Tidak Memenuhi Syarat) - Tidak Berhak Memilih
                    </div>
                  ) : !isCorrectMeja ? (
                    <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-5 h-5 text-amber-700" />
                      PERHATIAN: Pemilih ini terdaftar di {result.mejaPendaftaran} (Bukan Meja {assignedMeja})
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      STATUS: SAH DI DPT & TEPAT DI MEJA RW INI
                    </div>
                  )}

                  {/* Voter Info Details */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Nama Pemilih</span>
                      <Badge variant="primary" className="text-[10px] font-mono">
                        {result.tahap === "DPT" ? "DPT RESMI" : "DPS"}
                      </Badge>
                    </div>
                    <div className="text-base font-black text-slate-900 uppercase">
                      {result.namaLengkap}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">NIK Sensor</span>
                        <span className="font-mono font-bold text-slate-900">{result.nikMasked}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Domisili</span>
                        <span className="font-semibold text-slate-800">RT {result.rt} / RW {result.rw}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Meja Pemungutan Suara</span>
                      <span className="font-bold text-blue-900">{result.mejaPendaftaran}</span>
                    </div>
                  </div>

                  {/* Action Button: Mark Present */}
                  {result.statusAktif === "AKTIF" && (
                    <Button
                      onClick={handleMarkAttendance}
                      disabled={isMarkedPresent}
                      variant="primary"
                      className={`w-full h-11 text-xs font-bold ${
                        isMarkedPresent
                          ? "bg-emerald-800 text-white cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      }`}
                    >
                      {isMarkedPresent ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Sudah Ditandai Hadir di Meja RW
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Tandai Hadir & Terima Surat Suara
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
