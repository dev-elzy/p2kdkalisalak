"use client";

import React from "react";
import { Lock, Unlock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, Badge } from "@/components/ui";

interface TabFinalisasiDPTProps {
  isDptLocked: boolean;
  lockHashSignature: string;
  nomorBeritaAcara: string;
  setNomorBeritaAcara: (ba: string) => void;
  totalAktif: number;
  onLockDpt: () => void;
  onUnlockDpt: () => void;
}

export const TabFinalisasiDPT: React.FC<TabFinalisasiDPTProps> = ({
  isDptLocked,
  lockHashSignature,
  nomorBeritaAcara,
  setNomorBeritaAcara,
  totalAktif,
  onLockDpt,
  onUnlockDpt,
}) => {
  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white border border-blue-900/60 shadow-lg rounded-3xl">
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
                {isDptLocked ? "DPT FINAL TERKUNCI (RESMI)" : "TAHAP PERSIAPAN SIDANG PLENO"}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">• Segel Digital SHA-256</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              Penetapan & Penguncian Berita Acara DPT
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              Penguncian DPT merupakan tindakan hukum resmi untuk menetapkan seluruh data pemilih yang berhak memberikan suara. Setelah dikunci, data dilindungi secara permanen dari segala bentuk manipulasi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Lock className={`w-8 h-8 ${isDptLocked ? "text-rose-400" : "text-blue-300"}`} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-slate-200 space-y-4 shadow-sm rounded-3xl">

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Nomor Berita Acara Pleno
              </label>
              <input
                type="text"
                disabled={isDptLocked}
                value={nomorBeritaAcara}
                onChange={(e) => setNomorBeritaAcara(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Total Pemilih Ditetapkan
              </label>
              <div className="h-9 px-3 flex items-center rounded-lg border border-slate-200 bg-white font-bold text-blue-700">
                {totalAktif} Pemilih (7 TPS)
              </div>
            </div>
          </div>

          {isDptLocked && lockHashSignature && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Segel Digital SHA-256 Terverifikasi
              </div>
              <div className="font-mono text-[11px] text-emerald-900 break-all bg-white p-2 rounded border border-emerald-200">
                {lockHashSignature}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isDptLocked ? "Status DPT: Sah dan Mengikat" : "Status DPT: Menunggu Pengesahan Pleno"}
          </div>

          <div className="flex items-center gap-2">
            {isDptLocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onUnlockDpt}
                className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50 font-bold"
              >
                <Unlock className="w-3.5 h-3.5 mr-1" />
                Buka Kunci (Darurat Pleno)
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={onLockDpt}
                className="text-xs font-bold py-2.5 px-4 shadow-md"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Kunci DPT Sekarang Secara Permanen
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
